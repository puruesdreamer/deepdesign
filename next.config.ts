import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@tsparticles/react', '@tsparticles/slim'],
  },
  images: {
    // unoptimized: true, // Removed to enable compression as requested
    localPatterns: [
      {
        pathname: '/images/static/**',
        // search: '?*', // Removed to be permissive
      },
      {
        pathname: '/images/uploads/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
