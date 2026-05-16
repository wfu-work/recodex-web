"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Alert,
  Button,
  Layout,
  Menu,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";

const { Header, Content, Sider } = Layout;

const navItems = [
  { key: "/", icon: <NavIcon name="dashboard" />, label: <Link href="/">总览</Link> },
  {
    key: "/pairing",
    icon: <NavIcon name="pairing" />,
    label: <Link href="/pairing">设备配对</Link>,
  },
  {
    key: "/workspaces",
    icon: <NavIcon name="workspaces" />,
    label: <Link href="/workspaces">工作区</Link>,
  },
  {
    key: "/sessions",
    icon: <NavIcon name="sessions" />,
    label: <Link href="/sessions">会话</Link>,
  },
  { key: "/git", icon: <NavIcon name="git" />, label: <Link href="/git">Git 操作</Link> },
  {
    key: "/settings",
    icon: <NavIcon name="settings" />,
    label: <Link href="/settings">运行配置</Link>,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    connectionState,
    error,
    health,
    context,
  } = useBridge();

  const currentKey =
    navItems.find((item) =>
      item.key === "/" ? pathname === "/" : pathname.startsWith(item.key),
    )?.key || "/";

  const sidebar = (
    <Sider
      breakpoint="lg"
      collapsed={sidebarCollapsed}
      collapsedWidth={76}
      trigger={null}
      width={248}
      className={`app-sider${sidebarCollapsed ? " is-collapsed" : ""}`}
    >
      <div className="brand">
        <div className="brand-main">
          <div className="brand-mark">
            <Image
              src="/icons/recodex-icon.svg"
              alt="Recodex"
              width={38}
              height={38}
              priority
            />
          </div>
          <div className="brand-copy">
            <div className="brand-title">Recodex</div>
            <div className="brand-subtitle">Bridge Console</div>
          </div>
        </div>
      </div>
      <Menu
        className="app-menu"
        mode="inline"
        theme="light"
        inlineCollapsed={sidebarCollapsed}
        selectedKeys={[currentKey]}
        items={navItems}
      />
      <div className="sider-footer">
        <Tooltip title={sidebarCollapsed ? "展开菜单" : "收起菜单"}>
          <Button
            type="text"
            className="sider-toggle"
            aria-label={sidebarCollapsed ? "展开菜单" : "收起菜单"}
            onClick={() => setSidebarCollapsed((value) => !value)}
          >
            <span className="sider-toggle-icon" aria-hidden="true" />
            <span className="sider-toggle-label">
              {sidebarCollapsed ? "展开" : "收起菜单"}
            </span>
          </Button>
        </Tooltip>
      </div>
    </Sider>
  );

  return (
    <Layout className="app-root">
      {sidebar}
      <Layout>
        <Header className="app-header">
          <div className="header-left" />

          <Space size={12} className="header-actions">
            <ConnectionTag state={connectionState} online={health?.ok} />
            {context?.model ? (
              <Tooltip title="当前 Codex 模型">
                <Tag color="blue">{context.model}</Tag>
              </Tooltip>
            ) : null}
          </Space>
        </Header>

        <Content className="app-content">
          {error ? (
            <Alert
              className="content-alert"
              type="warning"
              showIcon
              title="Bridge 连接提示"
              description={error}
            />
          ) : null}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

function NavIcon({
  name,
}: {
  name: "dashboard" | "pairing" | "workspaces" | "sessions" | "git" | "settings";
}) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1.6" />
      </>
    ),
    pairing: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.4" />
        <rect x="14" y="4" width="6" height="6" rx="1.4" />
        <rect x="4" y="14" width="6" height="6" rx="1.4" />
        <path d="M15 15h5v5h-3v-2h-2z" />
      </>
    ),
    workspaces: (
      <>
        <path d="M3.5 8.5h17v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
        <path d="M8 8.5V5.8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2.7" />
      </>
    ),
    sessions: (
      <>
        <path d="M5 5.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H9l-4 3v-3.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
        <path d="M8 10h8M8 14h5" />
      </>
    ),
    git: (
      <>
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="6.5" r="2.5" />
        <path d="M9 6.5h6M8.4 8.4l7.2 7.2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" />
      </>
    ),
  };

  return (
    <span className="nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {paths[name]}
      </svg>
    </span>
  );
}

function ConnectionTag({
  state,
  online,
}: {
  state: string;
  online?: boolean;
}) {
  const color = online || state === "connected" ? "green" : "red";
  const label = online || state === "connected" ? "Bridge 在线" : "Bridge 离线";

  return (
    <Tooltip title={`HTTP: ${state}`}>
      <Tag color={color}>
        <span className="status-dot" /> {label}
      </Tag>
    </Tooltip>
  );
}
