/** @type {import('next').NextConfig} */
module.exports = {
  // 🚫 skip ESLint during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};
