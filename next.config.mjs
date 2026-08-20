/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hostinger Node.js standalone deploy
  output: "standalone",

  // Gzip compression ON — response size घटेगा, speed बढ़ेगी
  compress: true,

  // Images — Hostinger Linux पर native sharp नहीं चलता
  images: {
    unoptimized: true,
  },

  // Static assets को browser में cache करो (1 वर्ष)
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  // /uploads/* → API route (Hostinger standalone mode में public/ serve नहीं होता)
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/_uploads/:path*",
      },
    ];
  },

  // Experimental: Faster builds
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
