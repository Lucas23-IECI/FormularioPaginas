import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDocxBuffer } from "@/lib/generateDocx";
import { generateXlsxBuffer } from "@/lib/generateXlsx";
import { generateEmailHtml } from "@/lib/generateEmailHtml";
import {
    sendEmail,
    checkRateLimit,
    isValidEmail,
    sanitizeSubject,
} from "@/lib/emailService";

// ── Sanitization ──────────────────────────────────────────
function sanitizeStr(str: string, maxLen = 2000): string {
    let clean = str;
    clean = clean.replace(/<[^>]*>/g, "");
    clean = clean.replace(/javascript:/gi, "");
    clean = clean.replace(/on\w+\s*=/gi, "");
    clean = clean.replace(
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi,
        ""
    );
    clean = clean.replace(/(--)|(\/\*)|(\*\/)/g, "");
    clean = clean.replace(/['"]?\s*(OR|AND)\s*['"]?\s*\d+\s*=\s*\d+/gi, "");
    clean = clean.replace(/\0/g, "");
    return clean.trim().slice(0, maxLen);
}

function sanitizeDeep(obj: unknown): unknown {
    if (typeof obj === "string") return sanitizeStr(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeDeep);
    if (obj && typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(obj)) {
            result[sanitizeStr(key, 100)] = sanitizeDeep(val);
        }
        return result;
    }
    return obj;
}

// ── POST /api/briefings/submit ────────────────────────────
export async function POST(request: NextRequest) {
    try {
        // ── Rate limiting by IP ──
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: "Demasiadas solicitudes. Intenta en un minuto." },
                { status: 429 }
            );
        }

        // ── Parse & validate body ──
        const body = await request.json();
        const { type, clientName, clientEmail, contactData, contentData, designData, extraData } = body;

        if (!type || !clientName) {
            return NextResponse.json(
                { error: "type and clientName are required" },
                { status: 400 }
            );
        }

        const validTypes = ["LANDING", "WEB_COMERCIAL", "ECOMMERCE"];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid briefing type" }, { status: 400 });
        }

        if (clientEmail && !isValidEmail(clientEmail)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // ── Sanitize all data ──
        const safeContact = sanitizeDeep(contactData || {}) as Record<string, unknown>;
        const safeContent = sanitizeDeep(contentData || {}) as Record<string, unknown>;
        const safeDesign = sanitizeDeep(designData || {}) as Record<string, unknown>;
        const safeExtra = sanitizeDeep(extraData || {}) as Record<string, unknown>;
        const safeClientName = sanitizeStr(clientName, 500);
        const safeClientEmail = sanitizeStr(clientEmail || "", 500);

        // ── Save to database ──
        const briefing = await prisma.briefing.create({
            data: {
                type,
                clientName: safeClientName,
                clientEmail: safeClientEmail,
                contactData: JSON.stringify(safeContact),
                contentData: JSON.stringify(safeContent),
                designData: JSON.stringify(safeDesign),
                extraData: JSON.stringify(safeExtra),
            },
        });

        // ── Generate documents ──
        const briefingData = {
            type,
            clientName: safeClientName,
            clientEmail: safeClientEmail,
            contactData: safeContact,
            contentData: safeContent,
            designData: safeDesign,
            extraData: safeExtra,
        };

        const [docxBuffer, xlsxBuffer] = await Promise.all([
            generateDocxBuffer(briefingData),
            generateXlsxBuffer(briefingData),
        ]);

        const emailHtml = generateEmailHtml(briefingData);

        // ── Build attachments ──
        const businessName = (safeContact.businessName as string) || safeClientName;
        const safeFileName = businessName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 50);

        const attachments = [
            {
                filename: `briefing-${safeFileName}.docx`,
                content: docxBuffer,
                contentType:
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            },
            {
                filename: `briefing-${safeFileName}.xlsx`,
                content: xlsxBuffer,
                contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        ];

        // ── Send emails via emailService (OAuth2 + fallback) ──
        const emailFrom = process.env.EMAIL_FROM;
        let adminEmailSent = false;
        let clientEmailSent = false;

        if (emailFrom) {
            // Send to admin
            const adminResult = await sendEmail({
                to: emailFrom,
                subject: sanitizeSubject(`Nuevo Briefing – ${businessName}`),
                html: emailHtml,
                attachments,
            });
            adminEmailSent = adminResult.success;

            // Send to client (if valid email provided)
            if (safeClientEmail && isValidEmail(safeClientEmail)) {
                const clientResult = await sendEmail({
                    to: safeClientEmail,
                    subject: sanitizeSubject(`Resumen de tu Briefing – ${businessName}`),
                    html: emailHtml,
                    attachments,
                });
                clientEmailSent = clientResult.success;
            }
        } else {
            console.warn("[Submit] EMAIL_FROM not configured — skipping email send.");
        }

        return NextResponse.json(
            {
                id: briefing.id,
                status: "created",
                emailSent: adminEmailSent,
                clientEmailSent,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[Submit] Error:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
