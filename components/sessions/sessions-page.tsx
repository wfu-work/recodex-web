"use client";

import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { useBridge } from "@/components/bridge/bridge-provider";
import {
  PageTitle,
  SessionStatusTag,
} from "@/components/dashboard/dashboard-page";
import {
  getSessionEvents,
  interruptSession,
  startSession as startSessionRequest,
} from "@/lib/bridge/http";
import type { SessionEvent, SessionRecord } from "@/lib/bridge/types";
import { compactText, formatDateTime } from "@/lib/ui/format";

const statusOptions = [
  { label: "全部", value: "all" },
  { label: "运行中", value: "running" },
  { label: "完成", value: "done" },
  { label: "中断", value: "interrupted" },
  { label: "异常", value: "error" },
];

type SessionFormValues = {
  workspace: string;
  prompt: string;
  model?: string;
  reasoningEffort?: string;
};

export function SessionsPage() {
  const { message } = App.useApp();
  const {
    sessions,
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    refreshLists,
    context,
  } = useBridge();
  const [status, setStatus] = useState("all");
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [starting, setStarting] = useState(false);

  const filteredSessions = useMemo(
    () => {
      const workspaceSessions = selectedWorkspace
        ? sessions.filter((session) => session.workspace === selectedWorkspace)
        : sessions;
      return status === "all"
        ? workspaceSessions
        : workspaceSessions.filter((session) => session.status === status);
    },
    [selectedWorkspace, sessions, status],
  );

  const activeSessionId =
    selectedSessionId &&
    filteredSessions.some((session) => session.id === selectedSessionId)
      ? selectedSessionId
      : filteredSessions[0]?.id;
  const selectedSession = filteredSessions.find(
    (session) => session.id === activeSessionId,
  );
  const workspaceOptions = useMemo(
    () =>
      workspaces.map((workspace) => ({
        value: workspace.path,
        label: workspace.name || workspace.path,
      })),
    [workspaces],
  );

  useEffect(() => {
    if (!activeSessionId) {
      queueMicrotask(() => setEvents([]));
      return;
    }
    queueMicrotask(() => {
      void loadEvents(activeSessionId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]);

  function handleWorkspaceChange(workspace: string | undefined) {
    setSelectedWorkspace(workspace);
    setSelectedSessionId(undefined);
    setEvents([]);
  }

  async function loadEvents(sessionId: string) {
    setLoadingEvents(true);
    try {
      const result = await getSessionEvents(sessionId);
      setEvents(result.events || []);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载事件失败");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function interrupt(sessionId: string) {
    try {
      await interruptSession(sessionId);
      await refreshLists();
      message.success("已发送中断请求");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "中断失败");
    }
  }

  async function startSession(values: SessionFormValues) {
    setStarting(true);
    try {
      const record = await startSessionRequest({
        workspace: values.workspace,
        prompt: values.prompt,
        model: values.model,
        reasoningEffort: values.reasoningEffort,
      });
      await refreshLists();
      setSelectedSessionId(record.id);
      message.success("会话已创建");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "创建会话失败");
    } finally {
      setStarting(false);
    }
  }

  return (
    <Space orientation="vertical" size={16} className="page-stack">
      <PageTitle
        title="会话"
        description="浏览 Codex 会话历史、实时事件，并从 Web 控制台启动新任务。"
      />

      <Card className="tight-card session-workspace-card">
        <Space
          size={12}
          className="session-workspace-control"
          wrap
          align="center"
        >
          <Typography.Text className="session-workspace-label">
            工作区
          </Typography.Text>
          <Select
            className="workspace-select"
            placeholder="选择工作区"
            value={selectedWorkspace}
            onChange={handleWorkspaceChange}
            options={workspaceOptions}
            popupMatchSelectWidth={false}
            allowClear
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={11}>
          <Card
            title="会话列表"
            className="tight-card"
            extra={
              <Select
                size="small"
                value={status}
                onChange={setStatus}
                options={statusOptions}
              />
            }
          >
            <Table
              rowKey="id"
              size="small"
              dataSource={filteredSessions}
              pagination={{ pageSize: 10 }}
              onRow={(record) => ({
                onClick: () => setSelectedSessionId(record.id),
              })}
              rowClassName={(record) =>
                record.id === activeSessionId ? "selected-row" : ""
              }
              columns={[
                {
                  title: "Prompt",
                  dataIndex: "prompt",
                  render: (value: string) => compactText(value, 54),
                },
                {
                  title: "状态",
                  dataIndex: "status",
                  width: 100,
                  render: (value: string) => <SessionStatusTag status={value} />,
                },
                {
                  title: "更新时间",
                  dataIndex: "updatedAt",
                  width: 132,
                  render: formatDateTime,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={13}>
          <Tabs
            items={[
              {
                key: "detail",
                label: "会话详情",
                children: (
                  <SessionDetail
                    session={selectedSession}
                    events={events}
                    loading={loadingEvents}
                    onRefresh={() =>
                      activeSessionId ? loadEvents(activeSessionId) : undefined
                    }
                    onInterrupt={interrupt}
                  />
                ),
              },
              {
                key: "new",
                label: "新建会话",
                children: (
                  <Card className="tight-card">
                    <Form
                      layout="vertical"
                      initialValues={{
                        workspace: selectedWorkspace,
                        model: context?.model,
                        reasoningEffort: context?.reasoningEffort,
                      }}
                      onFinish={startSession}
                    >
                      <Form.Item
                        label="工作区"
                        name="workspace"
                        rules={[{ required: true, message: "请选择工作区" }]}
                      >
                        <Select
                          value={selectedWorkspace}
                          options={workspaceOptions}
                          onChange={handleWorkspaceChange}
                        />
                      </Form.Item>
                      <Row gutter={12}>
                        <Col xs={24} md={12}>
                          <Form.Item label="模型" name="model">
                            <Select
                              allowClear
                              options={(context?.models || []).map((model) => ({
                                value: model,
                                label: model,
                              }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Reasoning" name="reasoningEffort">
                            <Select
                              allowClear
                              options={(context?.reasoningEfforts || []).map(
                                (value) => ({
                                  value,
                                  label: value,
                                }),
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        label="Prompt"
                        name="prompt"
                        rules={[{ required: true, message: "请输入任务内容" }]}
                      >
                        <Input.TextArea rows={7} />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" loading={starting}>
                        启动 Codex 会话
                      </Button>
                    </Form>
                  </Card>
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </Space>
  );
}

function SessionDetail({
  session,
  events,
  loading,
  onRefresh,
  onInterrupt,
}: {
  session?: SessionRecord;
  events: SessionEvent[];
  loading: boolean;
  onRefresh: () => void;
  onInterrupt: (sessionId: string) => void;
}) {
  if (!session) {
    return (
      <Card className="tight-card">
        <Empty description="请选择一个会话" />
      </Card>
    );
  }

  return (
    <Card
      className="tight-card"
      title={
        <Space>
          <Typography.Text>{compactText(session.prompt, 48)}</Typography.Text>
          <SessionStatusTag status={session.status} />
        </Space>
      }
      extra={
        <Space>
          <Button size="small" loading={loading} onClick={onRefresh}>
            刷新事件
          </Button>
          <Button
            size="small"
            danger
            disabled={session.status !== "running"}
            onClick={() => onInterrupt(session.id)}
          >
            中断
          </Button>
        </Space>
      }
    >
      <Space orientation="vertical" size={16} className="full-width">
        <div>
          <Typography.Text type="secondary">工作区</Typography.Text>
          <div>{session.workspace}</div>
        </div>
        <Timeline
          items={
            events.length
              ? events.map((event, index) => ({
                  color: eventColor(event.kind),
                  content: (
                    <div className="event-item" key={`${event.kind}-${index}`}>
                      <Space size={8} wrap>
                        <Tag>{event.kind}</Tag>
                        <Typography.Text type="secondary">
                          {formatDateTime(event.time)}
                        </Typography.Text>
                        {event.usage?.totalTokens ? (
                          <Tag color="blue">{event.usage.totalTokens} tokens</Tag>
                        ) : null}
                      </Space>
                      {event.command ? (
                        <pre className="code-block compact">{event.command}</pre>
                      ) : null}
                      {event.text ? (
                        <pre className="event-text">{event.text}</pre>
                      ) : null}
                      {event.attachments?.length ? (
                        <Space wrap>
                          {event.attachments.map((attachment, attachmentIndex) =>
                            attachment.dataURL ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={attachmentIndex}
                                className="event-image"
                                src={attachment.dataURL}
                                alt="session attachment"
                              />
                            ) : null,
                          )}
                        </Space>
                      ) : null}
                    </div>
                  ),
                }))
              : [{ color: "gray", content: "暂无事件" }]
          }
        />
      </Space>
    </Card>
  );
}

function eventColor(kind: string) {
  if (kind === "error") {
    return "red";
  }
  if (kind === "done") {
    return "green";
  }
  if (kind === "tool_call" || kind === "running") {
    return "blue";
  }
  return "gray";
}
