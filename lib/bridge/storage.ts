import type { AuthCredentials } from "./types";

const authKey = "recodex.auth";

export function loadAuthCredentials(): AuthCredentials {
  if (typeof window === "undefined") {
    return { deviceId: "" };
  }

  const fallback = defaultCredentials();
  try {
    const raw = window.localStorage.getItem(authKey);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as AuthCredentials;
    return {
      ...fallback,
      ...parsed,
      deviceId: parsed.deviceId || fallback.deviceId,
    };
  } catch {
    return fallback;
  }
}

export function saveAuthCredentials(credentials: AuthCredentials) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(authKey, JSON.stringify(credentials));
}

export function clearAuthCredentials() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(authKey);
}

function defaultCredentials(): AuthCredentials {
  return {
    deviceId: "web_" + stableBrowserId(),
    deviceName: "Recodex Web",
  };
}

function stableBrowserId() {
  const key = "recodex.browserId";
  if (typeof window === "undefined") {
    return "browser";
  }
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const value =
    globalThis.crypto?.randomUUID?.().replace(/-/g, "").slice(0, 12) ||
    Math.random().toString(36).slice(2, 14);
  window.localStorage.setItem(key, value);
  return value;
}
