import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const url = process.env.DATABASE_URL;
    
    // If using remote libSQL/Turso (starts with libsql:// or https://), use the adapter
    if (url && (url.startsWith("libsql://") || url.startsWith("https://"))) {
        // Dynamic import to avoid bundling issues when not needed
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaLibSql } = require("@prisma/adapter-libsql");
        const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
        const adapter = new PrismaLibSql({ url, authToken });
        return new PrismaClient({ adapter });
    }
    
    // For local file-based SQLite, use standard Prisma (no adapter)
    return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
