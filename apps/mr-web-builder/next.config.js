/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@mr/canonical-stack", "@mr/section-library-ui"],
};

module.exports = nextConfig;
