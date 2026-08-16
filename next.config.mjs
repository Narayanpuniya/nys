/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hostinger Node.js Web App / SSR deploy
  output: "standalone",
  // पुराने Linux (GLIBC) पर native sharp fail हो तो build न रुके
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
