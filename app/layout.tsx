import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";
import { AntProvider } from "@/components/bridge/ant-provider";
import { BridgeProvider } from "@/components/bridge/bridge-provider";
import "antd/dist/reset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recodex Web",
  description: "Visual console for Recodex Bridge",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/recodex-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntProvider>
          <BridgeProvider>
            <AppShell>{children}</AppShell>
          </BridgeProvider>
        </AntProvider>
      </body>
    </html>
  );
}
