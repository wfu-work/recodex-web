import type { NextConfig } from "next";

const bridgeTarget = process.env.RECODEX_BRIDGE_TARGET || "http://127.0.0.1:8765";

const nextConfig: NextConfig = {
  distDir: "dist/recodex-web",
  allowedDevOrigins: ["127.0.0.1", "192.168.31.16"],
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${bridgeTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
