import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const url = process.env.DATABASE_URL;

    // Remote libSQL/Turso → use adapter
    if (url && (url.startsWith("libsql://") || url.startsWith("https://"))) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaLibSql } = require("@prisma/adapter-libsql");
        const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
        const adapter = new PrismaLibSql({ url, authToken });
        return new PrismaClient({ adapter });
    }

    // Local file-based SQLite → standard client (no adapter)
    return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
