import { bridgeBaseUrl } from "./config";
import type {
  ConfirmRequiredPayload,
  ContextPayload,
  GitSnapshot,
  HealthPayload,
  PairingPayload,
  PublicDevice,
  SessionEvent,
  SessionRecord,
  VersionPayload,
  Workspace,
} from "./types";

async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${bridgeBaseUrl()}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function postJSON<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${bridgeBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json()) as T | { message?: string };
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

async function deleteJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${bridgeBaseUrl()}${path}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const data = (await response.json()) as T | { message?: string };
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

export function getHealth() {
  return getJSON<HealthPayload>("/healthz");
}

export function getVersion() {
  return getJSON<VersionPayload>("/version");
}

export function getPairing() {
  return getJSON<PairingPayload>("/pairing");
}

export function getContext() {
  return getJSON<ContextPayload>("/context");
}

export function getWorkspaces() {
  return getJSON<{ workspaces: Workspace[] }>("/workspaces");
}

export function getDevices() {
  return getJSON<{ devices: PublicDevice[] }>("/devices");
}

export function getSessions() {
  return getJSON<{ sessions: SessionRecord[] }>("/sessions");
}

export function getSessionEvents(sessionId: string) {
  return getJSON<{ sessionId: string; events: SessionEvent[] }>(
    `/sessions/${encodeURIComponent(sessionId)}/events`,
  );
}

export function revokeDevice(deviceId: string) {
  return deleteJSON<{ deviceId: string }>(
    `/devices/${encodeURIComponent(deviceId)}`,
  );
}

export type SessionStartPayload = {
  workspace: string;
  prompt: string;
  model?: string;
  reasoningEffort?: string;
};

export function startSession(payload: SessionStartPayload) {
  return postJSON<SessionRecord>("/sessions/start", payload);
}

export function interruptSession(sessionId: string) {
  return postJSON<{ sessionId: string }>(
    `/sessions/${encodeURIComponent(sessionId)}/interrupt`,
    {},
  );
}

export function getGitSnapshot(workspace: string, includeDiff = false) {
  const path = includeDiff ? "/git/diff" : "/git/status";
  return getJSON<GitSnapshot>(
    `${path}?workspace=${encodeURIComponent(workspace)}`,
  );
}

export type GitActionPayload = {
  workspace: string;
  message?: string;
  confirm?: boolean;
};

export function runGitAction(
  action: "commit" | "push" | "undo",
  payload: GitActionPayload,
) {
  return postJSON<{ output?: string } | ConfirmRequiredPayload>(
    `/git/${action}`,
    payload,
  );
}
