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

  // Static assets को browser में cache करो
  async headers() {
    return [
      {
        // JS/CSS/fonts — immutable (hash in filename)
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Uploads — 7 days browser cache, 30 days stale-while-revalidate
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" },
        ],
      },
      {
        // Public static images (logo, slides, etc.)
        source: "/:path*.{png,jpg,jpeg,webp,gif,svg,ico}",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        // HTML pages — short cache, always revalidate
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },

  // /uploads/* → API route (Hostinger standalone mode में public/ serve नहीं होता)
  // NOTE: _uploads folder was renamed to uploads-serve (underscore prefix = private in Next.js)
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads-serve/:path*",
      },
    ];
  },

  // Experimental: Faster builds
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
