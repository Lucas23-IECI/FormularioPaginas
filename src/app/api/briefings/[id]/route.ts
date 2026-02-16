import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single briefing
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("x-admin-token");
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        if (authHeader !== adminPassword) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const briefing = await prisma.briefing.findUnique({
            where: { id: params.id },
        });

        if (!briefing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...briefing,
            contactData: JSON.parse(briefing.contactData),
            contentData: JSON.parse(briefing.contentData),
            designData: JSON.parse(briefing.designData),
            extraData: JSON.parse(briefing.extraData),
        });
    } catch (error) {
        console.error("Error getting briefing:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH - Update briefing status/summary
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("x-admin-token");
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        if (authHeader !== adminPassword) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { status, summary } = body;

        const updateData: Record<string, string> = {};
        if (status) {
            const validStatuses = ["nuevo", "revisado", "en_progreso", "completado"];
            if (!validStatuses.includes(status)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 });
            }
            updateData.status = status;
        }
        if (summary !== undefined) {
            updateData.summary = summary;
        }

        const briefing = await prisma.briefing.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json({
            ...briefing,
            contactData: JSON.parse(briefing.contactData),
            contentData: JSON.parse(briefing.contentData),
            designData: JSON.parse(briefing.designData),
            extraData: JSON.parse(briefing.extraData),
        });
    } catch (error) {
        console.error("Error updating briefing:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
