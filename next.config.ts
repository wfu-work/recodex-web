import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const bridgeTarget = process.env.RECODEX_BRIDGE_TARGET || "http://127.0.0.1:8765";

const nextConfig = (phase: string): NextConfig => {
  const config: NextConfig = {
    distDir: "dist/recodex-web",
    output: "export",
    images: {
      unoptimized: true,
    },
    allowedDevOrigins: ["127.0.0.1", "192.168.31.16"],
    devIndicators: false,
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    config.output = undefined;
    config.rewrites = async () => [
      {
        source: "/api/:path*",
        destination: `${bridgeTarget}/:path*`,
      },
    ];
  }

  return config;
};

export default nextConfig;
