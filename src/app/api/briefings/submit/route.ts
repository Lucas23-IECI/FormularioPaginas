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

// ── Error response builders ───────────────────────────────
type ErrorCode = "RATE_LIMITED" | "VALIDATION_ERROR" | "DB_ERROR" | "DOCS_ERROR" | "EMAIL_ERROR" | "UNKNOWN";

function errorResponse(code: ErrorCode, message: string, status: number) {
    return NextResponse.json({ ok: false, code, message }, { status });
}

// ── POST /api/briefings/submit ────────────────────────────
export async function POST(request: NextRequest) {
    let stage = "init";

    try {
        // ── Stage: rate-limit ──
        stage = "rate-limit";
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
        if (!checkRateLimit(ip)) {
            return errorResponse("RATE_LIMITED", "Demasiadas solicitudes. Intenta en un minuto.", 429);
        }

        // ── Stage: parse ──
        stage = "parse";
        let body;
        try {
            body = await request.json();
        } catch {
            return errorResponse("VALIDATION_ERROR", "Error al leer los datos del formulario.", 400);
        }

        const { type, clientName, clientEmail, contactData, contentData, designData, extraData } = body;

        // ── Stage: validate ──
        stage = "validate";
        if (!type || !clientName) {
            return errorResponse("VALIDATION_ERROR", "type y clientName son obligatorios.", 400);
        }

        const validTypes = ["LANDING", "WEB_COMERCIAL", "ECOMMERCE"];
        if (!validTypes.includes(type)) {
            return errorResponse("VALIDATION_ERROR", "Tipo de briefing inválido.", 400);
        }

        if (clientEmail && !isValidEmail(clientEmail)) {
            return errorResponse("VALIDATION_ERROR", "Formato de email inválido.", 400);
        }

        // ── Stage: sanitize ──
        stage = "sanitize";
        const safeContact = sanitizeDeep(contactData || {}) as Record<string, unknown>;
        const safeContent = sanitizeDeep(contentData || {}) as Record<string, unknown>;
        const safeDesign = sanitizeDeep(designData || {}) as Record<string, unknown>;
        const safeExtra = sanitizeDeep(extraData || {}) as Record<string, unknown>;
        const safeClientName = sanitizeStr(clientName, 500);
        const safeClientEmail = sanitizeStr(clientEmail || "", 500);

        // ── Stage: db ──
        stage = "db";
        let briefingId: string;
        try {
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
            briefingId = briefing.id;
        } catch (dbError) {
            // Log Prisma-specific info server-side only
            const err = dbError as Record<string, unknown>;
            console.error(`[Submit][${stage}] DB Error:`, {
                message: err.message || "Unknown",
                code: err.code,
                meta: err.meta,
                clientVersion: err.clientVersion,
            });
            return errorResponse("DB_ERROR", "Error al guardar el briefing. Intenta de nuevo.", 500);
        }

        // ── From here on, DB is saved. Never return 500. ──
        // Use degraded mode for docs and email.
        const result = {
            ok: true,
            id: briefingId,
            status: "created" as const,
            docsGenerated: false,
            emailSent: false,
            clientEmailSent: false,
        };

        // ── Stage: docs (degraded) ──
        stage = "docs";
        const briefingData = {
            type,
            clientName: safeClientName,
            clientEmail: safeClientEmail,
            contactData: safeContact,
            contentData: safeContent,
            designData: safeDesign,
            extraData: safeExtra,
        };

        let docxBuffer: Buffer | null = null;
        let xlsxBuffer: Buffer | null = null;
        let emailHtml = "";

        try {
            [docxBuffer, xlsxBuffer] = await Promise.all([
                generateDocxBuffer(briefingData),
                generateXlsxBuffer(briefingData),
            ]);
            emailHtml = generateEmailHtml(briefingData);
            result.docsGenerated = true;
        } catch (docsError) {
            console.error(`[Submit][${stage}] Docs generation failed:`, docsError instanceof Error ? docsError.message : docsError);
            // Continue without docs — DB is already saved
        }

        // ── Stage: email ──
        const emailFrom = process.env.EMAIL_FROM;
        const emailEnabled = process.env.EMAIL_ENABLED !== "false"; // default true

        console.log(`[Submit] Email config: from=${emailFrom ? "SET" : "MISSING"}, enabled=${emailEnabled}, docsGenerated=${result.docsGenerated}, USER=${process.env.EMAIL_USER ? "SET" : "MISSING"}, PASS=${process.env.EMAIL_PASS ? "SET" : "MISSING"}`);

        if (emailFrom && emailEnabled) {
            const businessName = (safeContact.businessName as string) || safeClientName;
            const safeFileName = businessName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .slice(0, 50);

            // Attach docs only if they were generated successfully
            const attachments = (docxBuffer && xlsxBuffer) ? [
                {
                    filename: `briefing-${safeFileName}.docx`,
                    content: docxBuffer,
                    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                },
                {
                    filename: `briefing-${safeFileName}.xlsx`,
                    content: xlsxBuffer,
                    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            ] : [];

            // Fallback HTML if docs generation failed
            const adminHtml = emailHtml || `<h2>Nuevo Briefing recibido</h2><p><b>Cliente:</b> ${safeClientName}</p><p><b>Tipo:</b> ${type}</p><p><b>Email:</b> ${safeClientEmail || "No proporcionado"}</p><pre>${JSON.stringify({ contactData: safeContact, contentData: safeContent, designData: safeDesign, extraData: safeExtra }, null, 2)}</pre>`;
            const clientHtml = emailHtml || `<h2>¡Gracias por tu briefing, ${safeClientName}!</h2><p>Hemos recibido tu solicitud correctamente. Nos pondremos en contacto contigo pronto.</p>`;

            // ── Stage: email-admin ──
            stage = "email-admin";
            try {
                const adminResult = await sendEmail({
                    to: emailFrom,
                    subject: sanitizeSubject(`Nuevo Briefing – ${businessName}`),
                    html: adminHtml,
                    attachments,
                });
                result.emailSent = adminResult.success;
                console.log(`[Submit] Admin email result: success=${adminResult.success}, provider=${adminResult.provider}, error=${adminResult.error || "none"}`);
            } catch (emailError) {
                console.error(`[Submit][${stage}] Admin email failed:`, emailError instanceof Error ? emailError.message : emailError);
            }

            // ── Stage: email-client ──
            stage = "email-client";
            if (safeClientEmail && isValidEmail(safeClientEmail)) {
                try {
                    const clientResult = await sendEmail({
                        to: safeClientEmail,
                        subject: sanitizeSubject(`Resumen de tu Briefing – ${businessName}`),
                        html: clientHtml,
                        attachments,
                    });
                    result.clientEmailSent = clientResult.success;
                    console.log(`[Submit] Client email result: success=${clientResult.success}, provider=${clientResult.provider}, error=${clientResult.error || "none"}`);
                } catch (emailError) {
                    console.error(`[Submit][${stage}] Client email failed:`, emailError instanceof Error ? emailError.message : emailError);
                }
            } else {
                console.log(`[Submit] No client email to send to (email="${safeClientEmail}", valid=${safeClientEmail ? isValidEmail(safeClientEmail) : false})`);
            }
        } else {
            console.warn(`[Submit] Email skipped: from=${emailFrom || "MISSING"}, enabled=${emailEnabled}`);
        }

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        // Catch-all for truly unexpected errors
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`[Submit][${stage}] Unexpected error:`, {
            stage,
            message: err.message,
            stack: err.stack,
        });
        return errorResponse("UNKNOWN", "Error interno del servidor.", 500);
    }
}
