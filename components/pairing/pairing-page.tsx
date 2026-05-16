"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Popconfirm,
  QRCode,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import { PageTitle } from "@/components/dashboard/dashboard-page";
import { revokeDevice as revokeDeviceRequest } from "@/lib/bridge/http";
import { formatDateTime, formatFullDateTime } from "@/lib/ui/format";

export function PairingPage() {
  const { message } = App.useApp();
  const {
    pairing,
    devices,
    refreshLists,
    refreshHttp,
    context,
  } = useBridge();
  const [loadingDeviceId, setLoadingDeviceId] = useState<string>();
  const expiresAt = useMemo(
    () => formatFullDateTime(pairing?.expiresAt),
    [pairing?.expiresAt],
  );

  async function revokeDevice(deviceId: string) {
    setLoadingDeviceId(deviceId);
    try {
      await revokeDeviceRequest(deviceId);
      await refreshLists();
      message.success("设备授权已撤销");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "撤销失败");
    } finally {
      setLoadingDeviceId(undefined);
    }
  }

  return (
    <Space orientation="vertical" size={16} className="page-stack">
      <PageTitle
        title="配对与设备"
        description="展示 App 扫码配对入口，并管理已经连接过的移动端设备。"
      />

      <Row gutter={[16, 16]} className="equal-height-row pairing-overview-row">
        <Col xs={24} lg={9}>
          <Card title="移动端扫码连接" className="tight-card qr-card fill-card">
            <Space orientation="vertical" size={16} className="full-width">
              <div className="qr-wrap">
                {pairing?.pairingUri ? (
                  <QRCode value={pairing.pairingUri} size={220} />
                ) : (
                  <QRCode value="recodex://pair" status="loading" size={220} />
                )}
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="状态">
                  <Tag color={pairing?.pairingEnabled ? "green" : "red"}>
                    {pairing?.pairingEnabled ? "可配对" : "不可配对"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Token">
                  <Typography.Text copyable>{pairing?.token || "-"}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="过期时间">{expiresAt}</Descriptions.Item>
                <Descriptions.Item label="Base URL">
                  <Typography.Text copyable>{pairing?.baseUrl || "-"}</Typography.Text>
                </Descriptions.Item>
              </Descriptions>
              <Button
                type="primary"
                onClick={() => {
                  void refreshHttp();
                }}
              >
                刷新配对信息
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card title="本机控制台" className="tight-card fill-card local-console-card">
            <Space orientation="vertical" size={14} className="full-width">
              <div className="local-note">
                <div className="local-note-title">网页控制台无需登录</div>
                <div className="local-note-copy">
                  这个页面随 recodex-go 在本机启动，用来直接查看 Bridge 状态、工作区、会话和设备。
                  需要认证的是移动端 App，它通过左侧二维码连接到本机 Bridge。
                </div>
              </div>
              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <div className="info-strip">
                    <div>
                      <div className="info-label">控制台访问</div>
                      <div className="info-value">本机直接读取</div>
                    </div>
                    <Tag color="green">无需认证</Tag>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="info-strip">
                    <div>
                      <div className="info-label">Git 写操作</div>
                      <div className="info-value">
                        {context?.requireConfirmGitWrite ? "提交前需要二次确认" : "当前未强制确认"}
                      </div>
                    </div>
                    <Tag color={context?.requireConfirmGitWrite ? "gold" : "red"}>
                      {context?.requireConfirmGitWrite ? "已保护" : "需留意"}
                    </Tag>
                  </div>
                </Col>
              </Row>
              <div className="pairing-guide">
                <div className="pairing-guide-step">
                  <span>1</span>
                  <div>
                    <strong>打开 Recodex App</strong>
                    <p>使用移动端扫码入口读取当前 Bridge 配对信息。</p>
                  </div>
                </div>
                <div className="pairing-guide-step">
                  <span>2</span>
                  <div>
                    <strong>确认本机地址</strong>
                    <p>App 会通过 Base URL 连接到本机 Bridge 服务。</p>
                  </div>
                </div>
                <div className="pairing-guide-step">
                  <span>3</span>
                  <div>
                    <strong>管理设备授权</strong>
                    <p>已配对设备会出现在下方列表，可随时撤销访问。</p>
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="已配对设备" className="tight-card">
        {devices.length === 0 ? (
          <div className="empty-panel">
            <Typography.Text type="secondary">
              暂无已连接设备。用 Recodex App 扫描上方二维码后，设备会出现在这里。
            </Typography.Text>
          </div>
        ) : (
          <Table
            rowKey="id"
            size="small"
            dataSource={devices}
            columns={[
              { title: "设备名", dataIndex: "name" },
              {
                title: "Device ID",
                dataIndex: "id",
                render: (value: string) => (
                  <Typography.Text copyable>{value}</Typography.Text>
                ),
              },
              {
                title: "创建时间",
                dataIndex: "createdAt",
                render: formatDateTime,
              },
              {
                title: "最后在线",
                dataIndex: "lastSeen",
                render: formatDateTime,
              },
              {
                title: "操作",
                key: "actions",
                width: 120,
                render: (_, record) => (
                  <Popconfirm
                    title="撤销设备授权？"
                    description="该设备需要重新配对后才能连接。"
                    onConfirm={() => revokeDevice(record.id)}
                  >
                    <Button
                      danger
                      size="small"
                      loading={loadingDeviceId === record.id}
                    >
                      撤销
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        )}
      </Card>
    </Space>
  );
}
