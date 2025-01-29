import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: process.env.NEXT_PUBLIC_API_PORT,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
