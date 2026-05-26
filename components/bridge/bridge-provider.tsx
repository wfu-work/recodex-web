"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getContext,
  getDevices,
  getHealth,
  getPairing,
  getRelayConfig,
  getSessions,
  getWorkspaces,
  getVersion,
} from "@/lib/bridge/http";
import type {
  BridgeConnectionState,
  ContextPayload,
  HealthPayload,
  PairingPayload,
  PublicDevice,
  RelayConfigPayload,
  SessionRecord,
  VersionPayload,
  Workspace,
} from "@/lib/bridge/types";

type BridgeContextValue = {
  health?: HealthPayload;
  version?: VersionPayload;
  pairing?: PairingPayload;
  relay?: RelayConfigPayload;
  context?: ContextPayload;
  workspaces: Workspace[];
  devices: PublicDevice[];
  sessions: SessionRecord[];
  selectedWorkspace?: string;
  connectionState: BridgeConnectionState;
  error?: string;
  setSelectedWorkspace: (workspace: string | undefined) => void;
  refreshHttp: () => Promise<void>;
  refreshLists: () => Promise<void>;
  refreshRelay: () => Promise<void>;
};

const BridgeContext = createContext<BridgeContextValue | null>(null);

export function BridgeProvider({ children }: { children: React.ReactNode }) {
  const [health, setHealth] = useState<HealthPayload>();
  const [version, setVersion] = useState<VersionPayload>();
  const [pairing, setPairing] = useState<PairingPayload>();
  const [relay, setRelay] = useState<RelayConfigPayload>();
  const [context, setContext] = useState<ContextPayload>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [devices, setDevices] = useState<PublicDevice[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>();
  const [connectionState, setConnectionState] =
    useState<BridgeConnectionState>("idle");
  const [error, setError] = useState<string>();

  const refreshHttp = useCallback(async () => {
    setError(undefined);
    try {
      const [
        nextHealth,
        nextVersion,
        nextPairing,
        nextRelay,
        nextContext,
        workspaceResult,
        deviceResult,
        sessionResult,
      ] =
        await Promise.all([
          getHealth(),
          getVersion(),
          getPairing(),
          getRelayConfig(),
          getContext(),
          getWorkspaces(),
          getDevices(),
          getSessions(),
        ]);
      setHealth(nextHealth);
      setVersion(nextVersion);
      setConnectionState("connected");
      setPairing(nextPairing);
      setRelay(nextRelay);
      setContext(nextContext);
      setWorkspaces(workspaceResult.workspaces || []);
      setDevices(deviceResult.devices || []);
      setSessions(sessionResult.sessions || []);
      setSelectedWorkspace((current) => {
        if (current) {
          return current;
        }
        return workspaceResult.workspaces?.[0]?.path;
      });
    } catch (err) {
      setConnectionState("error");
      setError(err instanceof Error ? err.message : "Failed to load Bridge.");
    }
  }, []);

  const refreshRelay = useCallback(async () => {
    try {
      setRelay(await getRelayConfig());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Relay.");
    }
  }, []);

  const refreshLists = useCallback(async () => {
    try {
      const [workspaceResult, deviceResult, sessionResult] =
        await Promise.all([getWorkspaces(), getDevices(), getSessions()]);
      setWorkspaces(workspaceResult.workspaces || []);
      setDevices(deviceResult.devices || []);
      setSessions(sessionResult.sessions || []);
      setSelectedWorkspace((current) => {
        if (current) {
          return current;
        }
        return workspaceResult.workspaces?.[0]?.path;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lists.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshHttp();
    });
  }, [refreshHttp]);

  const value = useMemo<BridgeContextValue>(
    () => ({
      health,
      version,
      pairing,
      relay,
      context,
      workspaces,
      devices,
      sessions,
      selectedWorkspace,
      connectionState,
      error,
      setSelectedWorkspace,
      refreshHttp,
      refreshLists,
      refreshRelay,
    }),
    [
      health,
      version,
      pairing,
      relay,
      context,
      workspaces,
      devices,
      sessions,
      selectedWorkspace,
      connectionState,
      error,
      refreshHttp,
      refreshLists,
      refreshRelay,
    ],
  );

  return (
    <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
  );
}

export function useBridge() {
  const value = useContext(BridgeContext);
  if (!value) {
    throw new Error("useBridge must be used inside BridgeProvider.");
  }
  return value;
}
