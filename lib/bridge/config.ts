const defaultApiBaseUrl = "/api";
const defaultRelayUrl = "http://127.0.0.1:8787";

export function bridgeBaseUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_RECODEX_API_BASE_URL || defaultApiBaseUrl,
  );
}

export function bridgeWsUrl() {
  if (process.env.NEXT_PUBLIC_RECODEX_WS_URL) {
    return process.env.NEXT_PUBLIC_RECODEX_WS_URL;
  }

  const wsPath = `${bridgeBaseUrl()}/ws`;
  if (typeof window === "undefined") {
    return wsPath;
  }

  const url = new URL(wsPath, window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export function relayBaseUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_RECODEX_RELAY_URL || defaultRelayUrl,
  );
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
