"use client";

import {
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import {
  compactText,
  formatDateTime,
  formatMoney,
  formatTokens,
} from "@/lib/ui/format";

export function DashboardPage() {
  const { health, version, pairing, context, devices, sessions, workspaces } =
    useBridge();

  const runningSessions = sessions.filter(
    (session) => session.status === "running",
  ).length;
  const errorSessions = sessions.filter(
    (session) => session.status === "error",
  ).length;

  return (
    <Space orientation="vertical" size={16} className="page-stack">
      <div className="hero-panel">
        <div className="hero-panel-body">
          <div>
            <div className="hero-eyebrow">Local Bridge Console</div>
            <h1 className="hero-title">Recodex 本机可视化控制台</h1>
            <p className="hero-copy">
              打开后直接读取本机 Bridge 的运行状态、移动端设备、工作区、会话和 Git
              信息。网页无需认证；移动端 App 通过二维码完成连接。
            </p>
          </div>
          <div className="hero-side">
            <div>
              <div className="hero-kicker">当前模型</div>
              <div className="hero-model">{context?.model || "未读取"}</div>
            </div>
            <Space wrap>
              <Tag color={health?.ok ? "green" : "red"}>
                {health?.ok ? "Bridge 在线" : "Bridge 离线"}
              </Tag>
              <Tag color={context?.apiKeyConfigured ? "green" : "red"}>
                {context?.apiKeyConfigured ? "API Key 已配置" : "API Key 未检测到"}
              </Tag>
              <Tag color={context?.requireConfirmGitWrite ? "gold" : "red"}>
                {context?.requireConfirmGitWrite ? "Git 写操作需确认" : "Git 写操作未强制确认"}
              </Tag>
            </Space>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Bridge"
            value={health?.ok ? "在线" : "离线"}
            tone={health?.ok ? "online" : "warning"}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard title="已配对设备" value={devices.length} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard title="工作区" value={workspaces.length} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="运行中 / 异常"
            value={`${runningSessions} / ${errorSessions}`}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="equal-height-row">
        <Col xs={24} xl={14}>
          <Card title="运行状态" className="tight-card fill-card">
            <Descriptions column={{ xs: 1, md: 2, xl: 2 }} size="small">
              <Descriptions.Item label="Bridge 版本">
                {version?.version || health?.version || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Codex CLI">
                {context?.codexVersion || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="模型">
                {context?.model || "-"}
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
                  {context?.requireConfirmGitWrite ? "需要确认" : "未启用"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Base URL">
                <span className="text-nowrap">{pairing?.baseUrl || "-"}</span>
              </Descriptions.Item>
              <Descriptions.Item label="局域网地址">
                {pairing?.lanHost || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="用量" className="tight-card fill-card">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Statistic
                  title="今日 tokens"
                  value={formatTokens(context?.usage.todayTokens)}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="本月 tokens"
                  value={formatTokens(context?.usage.monthTokens)}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="今日成本"
                  value={formatMoney(context?.usage.todayCost)}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="本月成本"
                  value={formatMoney(context?.usage.monthCost)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="最近会话" className="tight-card">
        {sessions.length === 0 ? (
          <div className="empty-panel">
            <Empty description="暂无会话。创建新任务后，这里会显示最近的 Codex 运行记录。" />
          </div>
        ) : (
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={sessions.slice(0, 8)}
            columns={[
              {
                title: "Prompt",
                dataIndex: "prompt",
                render: (value: string) => compactText(value, 80),
              },
              {
                title: "状态",
                dataIndex: "status",
                width: 120,
                render: (value: string) => <SessionStatusTag status={value} />,
              },
              {
                title: "工作区",
                dataIndex: "workspace",
                render: (value: string) => compactText(value, 42),
              },
              {
                title: "更新时间",
                dataIndex: "updatedAt",
                width: 160,
                render: formatDateTime,
              },
            ]}
          />
        )}
      </Card>
    </Space>
  );
}

function MetricCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: React.ReactNode;
  tone?: "online" | "warning";
}) {
  return (
    <Card className={`metric-card${tone ? ` is-${tone}` : ""}`}>
      <Statistic title={title} value={value as string} />
    </Card>
  );
}

export function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="page-title">
      <Typography.Title level={2}>{title}</Typography.Title>
      {description ? (
        <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      ) : null}
    </div>
  );
}

export function SessionStatusTag({ status }: { status: string }) {
  const color =
    status === "running"
      ? "processing"
      : status === "done"
        ? "success"
        : status === "error"
          ? "error"
          : "default";
  return <Tag color={color}>{status}</Tag>;
}
