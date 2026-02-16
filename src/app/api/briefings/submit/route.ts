import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { generateDocxBuffer } from "@/lib/generateDocx";
import { generateXlsxBuffer } from "@/lib/generateXlsx";
import { generateEmailHtml } from "@/lib/generateEmailHtml";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, clientName, clientEmail, contactData, contentData, designData, extraData } = body;

        if (!type || !clientName) {
            return NextResponse.json({ error: "type and clientName are required" }, { status: 400 });
        }

        const validTypes = ["LANDING", "WEB_COMERCIAL", "ECOMMERCE"];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid briefing type" }, { status: 400 });
        }

        if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // ── Sanitization ──
        const sanitizeStr = (str: string, maxLen = 2000): string => {
            let clean = str;
            clean = clean.replace(/<[^>]*>/g, "");
            clean = clean.replace(/javascript:/gi, "");
            clean = clean.replace(/on\w+\s*=/gi, "");
            clean = clean.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi, "");
            clean = clean.replace(/(--)|(\/\*)|(\*\/)/g, "");
            clean = clean.replace(/['"]?\s*(OR|AND)\s*['"]?\s*\d+\s*=\s*\d+/gi, "");
            clean = clean.replace(/\0/g, "");
            return clean.trim().slice(0, maxLen);
        };

        const sanitizeDeep = (obj: unknown): unknown => {
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
        };

        const safeContact = sanitizeDeep(contactData || {}) as Record<string, unknown>;
        const safeContent = sanitizeDeep(contentData || {}) as Record<string, unknown>;
        const safeDesign = sanitizeDeep(designData || {}) as Record<string, unknown>;
        const safeExtra = sanitizeDeep(extraData || {}) as Record<string, unknown>;

        // ── Save to database ──
        const briefing = await prisma.briefing.create({
            data: {
                type,
                clientName: sanitizeStr(clientName, 500),
                clientEmail: sanitizeStr(clientEmail || "", 500),
                contactData: JSON.stringify(safeContact),
                contentData: JSON.stringify(safeContent),
                designData: JSON.stringify(safeDesign),
                extraData: JSON.stringify(safeExtra),
            },
        });

        // ── Generate documents ──
        const briefingData = {
            type,
            clientName: sanitizeStr(clientName, 500),
            clientEmail: sanitizeStr(clientEmail || "", 500),
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

        // ── Send emails ──
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        if (emailUser && emailPass) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });

            const businessName = (safeContact.businessName as string) || clientName;
            const subject = `Resumen de tu Briefing – ${businessName}`;

            const attachments = [
                {
                    filename: `briefing-${businessName.toLowerCase().replace(/\s+/g, "-")}.docx`,
                    content: docxBuffer,
                    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                },
                {
                    filename: `briefing-${businessName.toLowerCase().replace(/\s+/g, "-")}.xlsx`,
                    content: xlsxBuffer,
                    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            ];

            const mailOptions = {
                from: `"Briefing System" <${emailUser}>`,
                subject,
                html: emailHtml,
                attachments,
            };

            // Send to admin (yourself)
            await transporter.sendMail({
                ...mailOptions,
                to: emailUser,
            });

            // Send to client (if email provided)
            if (clientEmail) {
                await transporter.sendMail({
                    ...mailOptions,
                    to: clientEmail,
                });
            }
        } else {
            console.warn("EMAIL_USER or EMAIL_PASS not configured. Skipping email send.");
        }

        return NextResponse.json(
            { id: briefing.id, status: "created", emailSent: !!(emailUser && emailPass) },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in briefing submit:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
