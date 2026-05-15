"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import { PageTitle } from "@/components/dashboard/dashboard-page";
import { getGitSnapshot, runGitAction } from "@/lib/bridge/http";
import type { ConfirmRequiredPayload, GitSnapshot } from "@/lib/bridge/types";
import { countLines } from "@/lib/ui/format";

type GitAction = "commit" | "push" | "undo";

export function GitPage() {
  const { message } = App.useApp();
  const {
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    context,
  } = useBridge();
  const [snapshot, setSnapshot] = useState<GitSnapshot>();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<GitAction>();
  const [commitMessage, setCommitMessage] = useState("");

  const selected = useMemo(
    () => workspaces.find((workspace) => workspace.path === selectedWorkspace),
    [selectedWorkspace, workspaces],
  );

  async function loadSnapshot(includeDiff = false) {
    if (!selectedWorkspace) {
      message.warning("请先选择工作区");
      return;
    }
    setLoading(true);
    try {
      const result = await getGitSnapshot(selectedWorkspace, includeDiff);
      setSnapshot(result);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "读取 Git 状态失败");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: GitAction, confirm = false) {
    if (!selectedWorkspace) {
      message.warning("请先选择工作区");
      return;
    }
    setActionLoading(action);
    try {
      const payload =
        action === "commit"
          ? { workspace: selectedWorkspace, message: commitMessage, confirm }
          : { workspace: selectedWorkspace, confirm };
      const result = await runGitAction(action, payload);

      if (isConfirmRequired(result)) {
        Modal.confirm({
          title: "需要确认",
          content: result.message,
          okText: "确认执行",
          cancelText: "取消",
          onOk: () => runAction(action, true),
        });
        return;
      }

      message.success(result.output || "操作已完成");
      await loadSnapshot(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Git 操作失败");
    } finally {
      setActionLoading(undefined);
    }
  }

  return (
    <Space orientation="vertical" size={16} className="page-stack">
      <PageTitle
        title="Git"
        description="查看工作区变更、检查 diff，并在二次确认后执行写操作。"
      />

      <Card className="tight-card toolbar-card">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={10}>
            <Select
              className="full-width"
              placeholder="选择工作区"
              value={selectedWorkspace}
              onChange={setSelectedWorkspace}
              options={workspaces.map((workspace) => ({
                value: workspace.path,
                label: workspace.name || workspace.path,
              }))}
            />
          </Col>
          <Col xs={24} lg={14}>
            <Space wrap>
              <Button loading={loading} onClick={() => loadSnapshot(false)}>
                读取状态
              </Button>
              <Button type="primary" loading={loading} onClick={() => loadSnapshot(true)}>
                读取 Diff
              </Button>
              <Tag color={context?.requireConfirmGitWrite ? "gold" : "red"}>
                {context?.requireConfirmGitWrite ? "写操作需要确认" : "写操作未强制确认"}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
          <Card title="变更摘要" className="tight-card">
            <div className="git-action-panel">
              <div>
                <Typography.Text type="secondary">工作区</Typography.Text>
                <div className="info-value">{selected?.name || selected?.path || "-"}</div>
              </div>
              <div>
                <Typography.Text type="secondary">分支</Typography.Text>
                <div>
                  <Tag color="blue">{snapshot?.branch || "-"}</Tag>
                </div>
              </div>
              <div>
                <Typography.Text type="secondary">变更文件数</Typography.Text>
                <div>{countLines(snapshot?.status)}</div>
              </div>
              <div>
                <Typography.Text type="secondary">Commit Message</Typography.Text>
                <Input.TextArea
                  rows={4}
                  value={commitMessage}
                  onChange={(event) => setCommitMessage(event.target.value)}
                  placeholder="例如：完善本地控制台视觉样式"
                />
              </div>
              <Space wrap>
                <Button
                  type="primary"
                  disabled={!commitMessage.trim()}
                  loading={actionLoading === "commit"}
                  onClick={() => runAction("commit")}
                >
                  Commit
                </Button>
                <Button
                  loading={actionLoading === "push"}
                  onClick={() => runAction("push")}
                >
                  Push
                </Button>
                <Button
                  danger
                  loading={actionLoading === "undo"}
                  onClick={() => runAction("undo")}
                >
                  Undo
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          <Card className="tight-card">
            <Tabs
              items={[
                {
                  key: "status",
                  label: "Status",
                  children: (
                    <pre className="code-block large">
                      {snapshot?.status || "暂无 status。"}
                    </pre>
                  ),
                },
                {
                  key: "stat",
                  label: "Stat",
                  children: (
                    <pre className="code-block large">
                      {snapshot?.stat || "暂无 diff stat。"}
                    </pre>
                  ),
                },
                {
                  key: "diff",
                  label: "Diff",
                  children: (
                    <pre className="code-block large">
                      {snapshot?.diff || "点击“读取 Diff”查看完整 diff。"}
                    </pre>
                  ),
                },
                {
                  key: "log",
                  label: "Log",
                  children: (
                    <pre className="code-block large">
                      {snapshot?.log || "暂无 commit log。"}
                    </pre>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function isConfirmRequired(
  value: unknown,
): value is ConfirmRequiredPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "action" in value &&
    "message" in value
  );
}
