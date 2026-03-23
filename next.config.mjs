import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force this app folder as workspace root (avoids picking a stray package-lock in a parent directory)
  outputFileTracingRoot: projectRoot,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wbardetapasyvinos.com",
      },
    ],
  },
}

export default nextConfig
