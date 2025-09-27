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
        hostname: "abcd123.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};
