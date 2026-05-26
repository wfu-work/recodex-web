"use client";

import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import { PageTitle } from "@/components/dashboard/dashboard-page";
import { saveRelayConfig } from "@/lib/bridge/http";
import { bridgeBaseUrl } from "@/lib/bridge/config";
import type {
  RelayConfigPayload,
  RelayConfigUpdatePayload,
} from "@/lib/bridge/types";
import { formatFullDateTime } from "@/lib/ui/format";

type RelayFormValues = {
  enabled: boolean;
  url?: string;
  publicUrl?: string;
  roomId?: string;
  roomToken?: string;
  accountGuid?: string;
  clientId?: string;
  clientSecret?: string;
  targetClientId?: string;
  reconnectSeconds?: number;
};

export function SettingsPage() {
  const { message } = App.useApp();
  const { context, pairing, relay, connectionState, health, refreshHttp } =
    useBridge();
  const [form] = Form.useForm<RelayFormValues>();
  const [savingRelay, setSavingRelay] = useState(false);
  const bridgeUrl = bridgeBaseUrl();
  const availableModels = (context?.models || []).join(", ") || "-";
  const pairingExpiresAt = formatFullDateTime(pairing?.expiresAt);
  const relayEnabled = Form.useWatch("enabled", form);
  const relayStatusTone = relay?.enabled ? "success" : "warning";
  const relayStatusText = relay?.enabled ? "已开启" : "未开启";
  const relayUrl = relay?.publicUrl || relay?.url || "-";

  useEffect(() => {
    form.setFieldsValue(toRelayFormValues(relay));
  }, [form, relay]);

  const relaySummary = useMemo(() => {
    if (!relay?.enabled) {
      return "Relay 未开启，移动端仍使用 Bridge 直连配置。";
    }
    return `房间 ${relay.roomId || "-"}，客户端 ${relay.clientId || "-"}`;
  }, [relay]);

  async function saveRelay(values: RelayFormValues) {
    setSavingRelay(true);
    try {
      const payload: RelayConfigUpdatePayload = {
        ...values,
        clientType: "bridge",
        reconnectSeconds: values.reconnectSeconds || 5,
      };
      await saveRelayConfig(payload);
      message.success("Relay 配置已保存");
      await refreshHttp();
      form.setFieldValue("clientSecret", "");
      form.setFieldValue("roomToken", "");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "保存 Relay 配置失败");
    } finally {
      setSavingRelay(false);
    }
  }

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
          <StatusPill label="Relay" value={relayStatusText} tone={relayStatusTone} />
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
                <DetailLine label="Relay">
                  <Tag color={relay?.enabled ? "green" : "gold"}>
                    {relayStatusText}
                  </Tag>
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

      <Card
        title="远程 Relay"
        className="tight-card"
        extra={
          <Tag color={relay?.enabled ? "green" : "default"}>
            {relay?.enabled ? "外网通信可用" : "未启用"}
          </Tag>
        }
      >
        <div className="relay-settings-shell">
          <div className="relay-settings-aside">
            <div className="relay-settings-title">Relay 通道</div>
            <div className="relay-settings-copy">{relaySummary}</div>
            <div className="relay-settings-meta">
              <DetailLine label="Client Secret">
                <Tag color={relay?.clientSecretConfigured ? "green" : "red"}>
                  {relay?.clientSecretConfigured ? "已保存" : "未保存"}
                </Tag>
              </DetailLine>
              <DetailLine label="Room Token">
                <Tag color={relay?.roomTokenConfigured ? "green" : "default"}>
                  {relay?.roomTokenConfigured ? "已保存" : "未设置"}
                </Tag>
              </DetailLine>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            className="relay-settings-form"
            onFinish={saveRelay}
            initialValues={{ enabled: false, reconnectSeconds: 5 }}
          >
            <div className="relay-switch-row">
              <div>
                <div className="relay-switch-title">开启 Relay</div>
                <div className="relay-switch-copy">
                  Bridge 会主动加入远程房间，App 通过同一房间转发消息。
                </div>
              </div>
              <Form.Item name="enabled" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>

            <div className="relay-form-grid">
              <Form.Item
                label="Relay URL"
                name="url"
                rules={relayEnabled ? relayUrlRules("请输入 Bridge 拨号地址") : []}
              >
                <Input placeholder="wss://relay.example.com/relay" />
              </Form.Item>
              <Form.Item
                label="Public URL"
                name="publicUrl"
                rules={relayEnabled ? relayUrlRules("请输入 App 可访问地址") : []}
              >
                <Input placeholder="wss://relay.example.com/relay" />
              </Form.Item>
              <Form.Item
                label="Room ID"
                name="roomId"
                rules={relayEnabled ? [{ required: true, message: "请输入房间 ID" }] : []}
              >
                <Input placeholder="recodex-room" />
              </Form.Item>
              <Form.Item label="Account GUID" name="accountGuid">
                <Input placeholder="accountGuid" />
              </Form.Item>
              <Form.Item
                label="Bridge Client ID"
                name="clientId"
                rules={relayEnabled ? [{ required: true, message: "请输入 clientId" }] : []}
              >
                <Input placeholder="cli_..." />
              </Form.Item>
              <Form.Item
                label="Client Secret"
                name="clientSecret"
                tooltip="留空表示沿用后台已保存的密钥"
                rules={
                  relayEnabled && !relay?.clientSecretConfigured
                    ? [{ required: true, message: "首次开启需要填写 clientSecret" }]
                    : []
                }
              >
                <Input.Password placeholder="留空保留当前密钥" autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                label="Room Token"
                name="roomToken"
                tooltip="Relay 开启房间授权时填写；留空会清除后台保存的 roomToken"
              >
                <Input.Password placeholder="可选" autoComplete="new-password" />
              </Form.Item>
              <Form.Item label="Target Client ID" name="targetClientId">
                <Input placeholder="可选，定向转发时使用" />
              </Form.Item>
              <Form.Item label="重连间隔" name="reconnectSeconds">
                <InputNumber min={1} max={120} className="full-width" addonAfter="秒" />
              </Form.Item>
            </div>

            <div className="relay-form-actions">
              <Button onClick={() => form.setFieldsValue(toRelayFormValues(relay))}>
                还原
              </Button>
              <Button type="primary" htmlType="submit" loading={savingRelay}>
                保存配置
              </Button>
            </div>
          </Form>
        </div>
      </Card>

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

function toRelayFormValues(relay?: RelayConfigPayload): RelayFormValues {
  return {
    enabled: relay?.enabled || false,
    url: relay?.url || "",
    publicUrl: relay?.publicUrl || "",
    roomId: relay?.roomId || "",
    roomToken: "",
    accountGuid: relay?.accountGuid || "",
    clientId: relay?.clientId || "",
    clientSecret: "",
    targetClientId: relay?.targetClientId || "",
    reconnectSeconds: relay?.reconnectSeconds || 5,
  };
}

function relayUrlRules(message: string) {
  return [
    { required: true, message },
    {
      validator(_: unknown, value?: string) {
        if (!value) {
          return Promise.resolve();
        }
        return /^wss?:\/\/[^/]+/i.test(value)
          ? Promise.resolve()
          : Promise.reject(new Error("地址必须以 ws:// 或 wss:// 开头"));
      },
    },
  ];
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
