import { bridgeWsUrl } from "./config";
import type { AuthCredentials, Envelope } from "./types";

type Handler = (envelope: Envelope) => void;
type StateHandler = (state: WebSocket["readyState"]) => void;

export class BridgeSocket {
  private socket?: WebSocket;
  private idSeed = 0;
  private handlers = new Set<Handler>();
  private stateHandlers = new Set<StateHandler>();
  private pending = new Map<
    string,
    {
      resolve: (payload: unknown) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  connect(credentials: AuthCredentials) {
    this.close();
    this.socket = new WebSocket(bridgeWsUrl());
    this.emitState();

    this.socket.addEventListener("open", () => {
      this.emitState();
      void this.request("auth.hello", credentials).catch(() => undefined);
    });
    this.socket.addEventListener("close", () => {
      this.rejectPending("Bridge WebSocket closed.");
      this.emitState();
    });
    this.socket.addEventListener("error", () => {
      this.rejectPending("Bridge WebSocket error.");
      this.emitState();
    });
    this.socket.addEventListener("message", (event) => {
      const envelope = parseEnvelope(event.data);
      if (!envelope) {
        return;
      }
      this.resolvePending(envelope);
      for (const handler of this.handlers) {
        handler(envelope);
      }
    });
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.rejectPending("Bridge WebSocket closed.");
    this.emitState();
  }

  onMessage(handler: Handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onState(handler: StateHandler) {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  request<TPayload = unknown, TResult = unknown>(
    type: string,
    payload?: TPayload,
    timeoutMs = 15000,
  ): Promise<TResult> {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("Bridge WebSocket is not connected."));
    }

    const id = `web_${Date.now()}_${++this.idSeed}`;
    const envelope: Envelope<TPayload> = { type, id, payload };
    const promise = new Promise<TResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${type} timed out.`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (value) => resolve(value as TResult),
        reject,
        timer,
      });
    });
    socket.send(JSON.stringify(envelope));
    return promise;
  }

  send<TPayload = unknown>(type: string, payload?: TPayload) {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error("Bridge WebSocket is not connected.");
    }
    socket.send(JSON.stringify({ type, payload }));
  }

  readyState() {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  private resolvePending(envelope: Envelope) {
    if (!envelope.id) {
      return;
    }
    const item = this.pending.get(envelope.id);
    if (!item) {
      return;
    }
    clearTimeout(item.timer);
    this.pending.delete(envelope.id);

    if (envelope.type === "session.error") {
      const payload = envelope.payload as { message?: string } | undefined;
      item.reject(new Error(payload?.message || "Bridge request failed."));
      return;
    }

    item.resolve(envelope.payload);
  }

  private rejectPending(message: string) {
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error(message));
    }
    this.pending.clear();
  }

  private emitState() {
    for (const handler of this.stateHandlers) {
      handler(this.readyState());
    }
  }
}

function parseEnvelope(value: unknown): Envelope | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value) as Envelope;
  } catch {
    return null;
  }
}
