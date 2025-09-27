/** @type {import('next').NextConfig} */
module.exports = {
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
