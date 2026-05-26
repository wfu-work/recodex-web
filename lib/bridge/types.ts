export type SessionStatus = "running" | "done" | "interrupted" | "error";

export type Envelope<T = unknown> = {
  type: string;
  id?: string;
  payload?: T;
};

export type HealthPayload = {
  ok: boolean;
  version: string;
};

export type VersionPayload = {
  name: string;
  version: string;
};

export type PairingPayload = {
  version: string;
  host: string;
  lanHost: string;
  baseUrl: string;
  wsUrl: string;
  token: string;
  pairingUri: string;
  pairingEnabled: boolean;
  expiresAt: string;
};

export type RelayConfigPayload = {
  enabled: boolean;
  url: string;
  publicUrl: string;
  roomId: string;
  roomTokenConfigured: boolean;
  accountGuid: string;
  clientId: string;
  clientSecretConfigured: boolean;
  clientType: string;
  targetClientId: string;
  reconnectSeconds: number;
};

export type RelayConfigUpdatePayload = {
  enabled: boolean;
  url?: string;
  publicUrl?: string;
  roomId?: string;
  roomToken?: string;
  accountGuid?: string;
  clientId?: string;
  clientSecret?: string;
  clientType?: string;
  targetClientId?: string;
  reconnectSeconds?: number;
};

export type UsageSummary = {
  todayTokens: number;
  monthTokens: number;
  todayCost: number;
  monthCost: number;
  lastUpdated?: string;
  canReadUsage: boolean;
  rateConfigured: boolean;
};

export type ContextPayload = {
  transport: string;
  model: string;
  models: string[];
  reasoningEffort: string;
  reasoningEfforts: string[];
  approvalPolicy: string;
  requireConfirmGitWrite: boolean;
  branch: string;
  version: string;
  bridgeVersion: string;
  codexBinary: string;
  codexVersion: string;
  apiKeyConfigured: boolean;
  usage: UsageSummary;
};

export type Workspace = {
  name: string;
  path: string;
};

export type PublicDevice = {
  id: string;
  name: string;
  createdAt: string;
  lastSeen: string;
};

export type SessionRecord = {
  id: string;
  workspace: string;
  prompt: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type Attachment = {
  type: string;
  mime?: string;
  dataURL?: string;
};

export type Usage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens: number;
};

export type SessionEvent = {
  sessionId: string;
  kind: string;
  text?: string;
  command?: string;
  time: string;
  usage?: Usage;
  attachments?: Attachment[];
};

export type GitSnapshot = {
  branch?: string;
  status?: string;
  stat?: string;
  numstat?: string;
  diff?: string;
  log?: string;
  output?: string;
};

export type BridgeErrorPayload = {
  code: string;
  message: string;
};

export type ConfirmRequiredPayload = {
  action: string;
  message: string;
};

export type AuthCredentials = {
  deviceId: string;
  deviceName?: string;
  deviceKey?: string;
  token?: string;
};

export type BridgeConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "authenticating"
  | "authenticated"
  | "error"
  | "closed";
