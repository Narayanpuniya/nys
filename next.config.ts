import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger Node.js Web App / SSR deploy के लिए
  output: "standalone",
  // पुराने Linux (GLIBC) पर native sharp fail हो तो build न रुके
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
