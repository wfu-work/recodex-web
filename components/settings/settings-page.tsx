"use client";

import { Card, Descriptions, Space, Tag, Typography } from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import { PageTitle } from "@/components/dashboard/dashboard-page";
import { bridgeBaseUrl, relayBaseUrl } from "@/lib/bridge/config";
import { formatFullDateTime } from "@/lib/ui/format";

export function SettingsPage() {
  const { context, pairing, connectionState } = useBridge();

  return (
    <Space orientation="vertical" size={16} className="page-stack">
      <PageTitle
        title="设置"
        description="查看当前前端连接目标和 Bridge 返回的运行配置。"
      />

      <Card title="连接配置" className="tight-card">
        <Descriptions column={{ xs: 1, lg: 2 }} size="small">
          <Descriptions.Item label="Bridge URL">
            <Typography.Text copyable>{bridgeBaseUrl()}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Relay URL">
            <Typography.Text copyable>{relayBaseUrl()}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="连接状态">
            <Tag>{connectionState}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="控制台认证">
            <Tag color="green">无需认证</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Bridge 配置" className="tight-card">
        <Descriptions column={{ xs: 1, lg: 2 }} size="small">
          <Descriptions.Item label="Bridge 版本">
            {context?.bridgeVersion || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Codex Binary">
            {context?.codexBinary || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Codex 版本">
            {context?.codexVersion || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="当前模型">
            {context?.model || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="可选模型">
            {(context?.models || []).join(", ") || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Reasoning">
            {context?.reasoningEffort || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="API Key">
            <Tag color={context?.apiKeyConfigured ? "green" : "red"}>
              {context?.apiKeyConfigured ? "已配置" : "未检测到"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Git 写确认">
            <Tag color={context?.requireConfirmGitWrite ? "gold" : "red"}>
              {context?.requireConfirmGitWrite ? "启用" : "未启用"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="用量费率">
            <Tag color={context?.usage.rateConfigured ? "green" : "default"}>
              {context?.usage.rateConfigured
                ? "RECODEX_TOKEN_USD_PER_1K 已配置"
                : "未配置"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="配对过期时间">
            {formatFullDateTime(pairing?.expiresAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}
