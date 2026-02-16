/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverComponentsExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
    },
};

export default nextConfig;
