"use client";

import { Card, Col, Row, Space, Tag, Typography } from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import { PageTitle } from "@/components/dashboard/dashboard-page";
import { bridgeBaseUrl, relayBaseUrl } from "@/lib/bridge/config";
import { formatFullDateTime } from "@/lib/ui/format";

export function SettingsPage() {
  const { context, pairing, connectionState, health } = useBridge();
  const bridgeUrl = bridgeBaseUrl();
  const relayUrl = relayBaseUrl();
  const availableModels = (context?.models || []).join(", ") || "-";
  const pairingExpiresAt = formatFullDateTime(pairing?.expiresAt);

  return (
    <Space orientation="vertical" size={16} className="page-stack">
      <PageTitle
        title="设置"
        description="查看当前前端连接目标和 Bridge 返回的运行配置。"
      />

      <div className="settings-hero">
        <div className="settings-hero-main">
          <div className="settings-hero-title">运行配置总览</div>
          <div className="settings-hero-copy">
            前端当前指向 <Typography.Text code>{bridgeUrl}</Typography.Text>，
            Bridge {health?.ok ? "在线" : "未确认在线"}，默认模型为{" "}
            <Typography.Text strong>{context?.model || "-"}</Typography.Text>。
          </div>
        </div>
        <div className="settings-hero-status">
          <StatusPill
            label="Bridge"
            value={health?.ok ? "在线" : "离线"}
            tone={health?.ok ? "success" : "error"}
          />
          <StatusPill
            label="API Key"
            value={context?.apiKeyConfigured ? "已配置" : "未检测到"}
            tone={context?.apiKeyConfigured ? "success" : "error"}
          />
          <StatusPill
            label="Git 写确认"
            value={context?.requireConfirmGitWrite ? "启用" : "未启用"}
            tone={context?.requireConfirmGitWrite ? "warning" : "error"}
          />
        </div>
      </div>

      <Row gutter={[16, 16]} className="equal-height-row">
        <Col xs={24} xl={10}>
          <Card title="连接配置" className="tight-card fill-card">
            <Space orientation="vertical" size={12} className="full-width">
              <SettingTile label="Bridge URL" copyable value={bridgeUrl} />
              <SettingTile label="Relay URL" copyable value={relayUrl} />
              <div className="settings-detail-grid">
                <DetailLine label="连接状态">
                  <Tag color={health?.ok ? "green" : "default"}>
                    {connectionState}
                  </Tag>
                </DetailLine>
                <DetailLine label="控制台认证">
                  <Tag color="green">无需认证</Tag>
                </DetailLine>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card title="Bridge 配置" className="tight-card fill-card">
            <div className="settings-config-grid">
              <SettingTile label="Bridge 版本" value={context?.bridgeVersion || "-"} />
              <SettingTile label="Codex 版本" value={context?.codexVersion || "-"} />
              <SettingTile label="Codex Binary" value={context?.codexBinary || "-"} />
              <SettingTile label="当前模型" value={context?.model || "-"} featured />
              <SettingTile label="Reasoning" value={context?.reasoningEffort || "-"} />
              <SettingTile label="配对过期时间" value={pairingExpiresAt} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="equal-height-row">
        <Col xs={24} xl={14}>
          <Card title="模型能力" className="tight-card fill-card">
            <SettingTile label="可选模型" value={availableModels} tall />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="安全与用量" className="tight-card fill-card">
            <div className="settings-detail-grid">
              <DetailLine label="API Key">
                <Tag color={context?.apiKeyConfigured ? "green" : "red"}>
                  {context?.apiKeyConfigured ? "已配置" : "未检测到"}
                </Tag>
              </DetailLine>
              <DetailLine label="Git 写确认">
                <Tag color={context?.requireConfirmGitWrite ? "gold" : "red"}>
                  {context?.requireConfirmGitWrite ? "启用" : "未启用"}
                </Tag>
              </DetailLine>
              <DetailLine label="用量费率">
                <Tag color={context?.usage.rateConfigured ? "green" : "default"}>
                  {context?.usage.rateConfigured
                    ? "RECODEX_TOKEN_USD_PER_1K 已配置"
                    : "未配置"}
                </Tag>
              </DetailLine>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "error";
}) {
  return (
    <div className={`settings-status-pill is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SettingTile({
  label,
  value,
  copyable,
  featured,
  tall,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  featured?: boolean;
  tall?: boolean;
}) {
  return (
    <div
      className={`settings-tile${featured ? " is-featured" : ""}${
        tall ? " is-tall" : ""
      }`}
    >
      <div className="settings-tile-label">{label}</div>
      <Typography.Text
        className="settings-tile-value"
        copyable={copyable}
        strong={featured}
      >
        {value}
      </Typography.Text>
    </div>
  );
}

function DetailLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-detail-line">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}
