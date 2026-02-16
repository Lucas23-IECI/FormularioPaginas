import nodemailer from "nodemailer";

// ── Types ──────────────────────────────────────────────────
interface EmailAttachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
}

interface SendEmailResult {
    success: boolean;
    provider: "gmail-oauth2" | "sendgrid" | "gmail-apppass" | "none";
    error?: string;
}

// ── Rate Limiting (in-memory, per-IP) ─────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

/**
 * Returns true if the request is within rate limits, false if throttled.
 */
export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
}

// ── Validation Helpers ────────────────────────────────────

/**
 * Strict email validation (RFC 5322 simplified).
 */
export function isValidEmail(email: string): boolean {
    if (!email || email.length > 254) return false;
    const re =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(email);
}

/**
 * Sanitize email subject to prevent header injection.
 * Strips CR/LF and limits length.
 */
export function sanitizeSubject(subject: string): string {
    return subject.replace(/[\r\n\t]/g, "").slice(0, 200);
}

// ── Transporter Factories ─────────────────────────────────

/**
 * Check if a value looks like a real credential (not a placeholder).
 */
function isRealCredential(val: string | undefined): boolean {
    if (!val) return false;
    const placeholders = ["...", "your_", "xxx", "placeholder", "CHANGE_ME", "TODO"];
    const lower = val.toLowerCase();
    return !placeholders.some((p) => lower.includes(p.toLowerCase()));
}

/**
 * Gmail OAuth2 transporter — uses refresh token to auto-generate access tokens.
 * Requires: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_FROM.
 */
function createGmailOAuth2(): nodemailer.Transporter | null {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.EMAIL_FROM;

    // Skip if any credential is missing or still placeholder
    if (!isRealCredential(clientId) || !isRealCredential(clientSecret) || !isRealCredential(refreshToken) || !user) {
        console.log("[EmailService] Gmail OAuth2: skipped (credentials not configured)");
        return null;
    }

    console.log("[EmailService] Gmail OAuth2: attempting...");
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user,
            clientId,
            clientSecret,
            refreshToken,
        },
    });
}

/**
 * Gmail App Password transporter (legacy fallback).
 * Less secure than OAuth2 but works immediately with existing setup.
 * Requires: EMAIL_USER, EMAIL_PASS.
 */
function createGmailAppPass(): nodemailer.Transporter | null {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass || !isRealCredential(pass)) {
        console.log(`[EmailService] Gmail App Password: skipped (USER=${user ? "SET" : "MISSING"}, PASS=${pass ? "SET" : "MISSING"})`);
        return null;
    }

    console.log(`[EmailService] Gmail App Password: attempting with user=${user}`);
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false,
        },
    });
}

/**
 * SendGrid SMTP fallback transporter.
 * Requires: SENDGRID_API_KEY, EMAIL_FROM.
 */
function createSendGrid(): nodemailer.Transporter | null {
    const apiKey = process.env.SENDGRID_API_KEY;
    const user = process.env.EMAIL_FROM;

    if (!apiKey || !user || !isRealCredential(apiKey)) {
        console.log("[EmailService] SendGrid: skipped (not configured)");
        return null;
    }

    console.log("[EmailService] SendGrid: attempting...");
    return nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
            user: "apikey",
            pass: apiKey,
        },
    });
}

// ── Main Send Function ────────────────────────────────────

/**
 * Send an email with Gmail OAuth2, falling back to SendGrid on failure.
 * Never exposes credentials in error messages.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const emailFrom = process.env.EMAIL_FROM;

    console.log(`[EmailService] sendEmail called: to=${options.to}, subject="${options.subject}", attachments=${options.attachments?.length || 0}`);

    if (!emailFrom) {
        console.warn("[EmailService] EMAIL_FROM not configured — skipping.");
        return { success: false, provider: "none", error: "EMAIL_FROM not configured" };
    }

    if (!isValidEmail(options.to)) {
        console.warn(`[EmailService] Invalid recipient email: "${options.to}"`);
        return { success: false, provider: "none", error: "Invalid recipient email" };
    }

    // Use EMAIL_USER as sender if available (some SMTP providers require sender = auth user)
    const senderEmail = process.env.EMAIL_USER || emailFrom;

    const mailOptions = {
        from: `"Briefing System" <${senderEmail}>`,
        to: options.to,
        subject: sanitizeSubject(options.subject),
        html: options.html,
        attachments: options.attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
        })),
    };

    // ── Attempt 1: Gmail OAuth2 ──
    const gmail = createGmailOAuth2();
    if (gmail) {
        try {
            await gmail.sendMail(mailOptions);
            console.log(`[EmailService] ✓ Sent to ${options.to} via Gmail OAuth2`);
            return { success: true, provider: "gmail-oauth2" };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.error(`[EmailService] Gmail OAuth2 failed: ${msg}`);
            // Fall through to SendGrid
        }
    }

    // ── Attempt 2: SendGrid fallback ──
    const sg = createSendGrid();
    if (sg) {
        try {
            await sg.sendMail(mailOptions);
            console.log(`[EmailService] ✓ Sent to ${options.to} via SendGrid fallback`);
            return { success: true, provider: "sendgrid" };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.error(`[EmailService] SendGrid failed: ${msg}`);
        }
    }

    // ── Attempt 3: Gmail App Password (legacy) ──
    const gmailLegacy = createGmailAppPass();
    if (gmailLegacy) {
        try {
            await gmailLegacy.sendMail(mailOptions);
            console.log(`[EmailService] ✓ Sent to ${options.to} via Gmail App Password`);
            return { success: true, provider: "gmail-apppass" };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            console.error(`[EmailService] Gmail App Password failed: ${msg}`);
        }
    }

    // ── All failed or none configured ──
    console.warn("[EmailService] No email provider available or all providers failed.");
    return { success: false, provider: "none", error: "All email providers failed" };
}
