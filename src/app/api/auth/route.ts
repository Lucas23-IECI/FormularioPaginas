import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (password === adminPassword) {
            return NextResponse.json({ token: adminPassword, success: true });
        }

        return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
