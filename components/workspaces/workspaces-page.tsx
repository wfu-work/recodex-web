"use client";

import { useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import { PageTitle } from "@/components/dashboard/dashboard-page";
import { getGitSnapshot } from "@/lib/bridge/http";
import type { GitSnapshot, Workspace } from "@/lib/bridge/types";
import { compactText, countLines } from "@/lib/ui/format";

export function WorkspacesPage() {
  const { message } = App.useApp();
  const { workspaces, selectedWorkspace, setSelectedWorkspace } = useBridge();
  const [snapshot, setSnapshot] = useState<GitSnapshot>();
  const [loading, setLoading] = useState(false);

  async function loadGitStatus(workspace: string) {
    setLoading(true);
    try {
      const result = await getGitSnapshot(workspace);
      setSnapshot(result);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载 Git 状态失败");
    } finally {
      setLoading(false);
    }
  }

  const selected = workspaces.find(
    (workspace) => workspace.path === selectedWorkspace,
  );

  return (
    <Space orientation="vertical" size={16} className="page-stack">
      <PageTitle
        title="工作区"
        description="查看 Bridge 允许访问的本机项目和对应 Git 概览。"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card title="允许访问的工作区" className="tight-card">
            {workspaces.length === 0 ? (
              <div className="empty-panel">
                <Empty description="暂无工作区。启动 Bridge 后会读取允许访问的项目列表。" />
              </div>
            ) : (
              <Table
                rowKey="path"
                size="small"
                dataSource={workspaces}
                pagination={false}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedWorkspace(record.path);
                    void loadGitStatus(record.path);
                  },
                })}
                rowClassName={(record) =>
                  record.path === selectedWorkspace ? "selected-row" : ""
                }
                columns={[
                  {
                    title: "名称",
                    dataIndex: "name",
                    render: (value: string, record: Workspace) =>
                      value || compactText(record.path, 32),
                  },
                  {
                    title: "路径",
                    dataIndex: "path",
                    render: (value: string) => (
                      <Typography.Text className="path-text" copyable>
                        {compactText(value, 56)}
                      </Typography.Text>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card
            title="Git 概览"
            className="tight-card"
            extra={
              <Button
                type="primary"
                loading={loading}
                disabled={!selectedWorkspace}
                onClick={() =>
                  selectedWorkspace ? loadGitStatus(selectedWorkspace) : undefined
                }
              >
                读取状态
              </Button>
            }
          >
            {!selected ? (
              <Empty description="请选择一个工作区" />
            ) : (
              <Space orientation="vertical" size={16} className="full-width">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="工作区">
                    {selected.name || selected.path}
                  </Descriptions.Item>
                  <Descriptions.Item label="路径">
                    <Typography.Text className="path-text" copyable>
                      {selected.path}
                    </Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="分支">
                    <Tag color="blue">{snapshot?.branch || "-"}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="变更文件数">
                    {countLines(snapshot?.status)}
                  </Descriptions.Item>
                </Descriptions>

                <div>
                  <Typography.Title level={5}>Status</Typography.Title>
                  <pre className="code-block">{snapshot?.status || "工作区状态尚未读取。"}</pre>
                </div>

                <div>
                  <Typography.Title level={5}>Diff Stat</Typography.Title>
                  <pre className="code-block">{snapshot?.stat || "暂无 diff stat。"}</pre>
                </div>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
