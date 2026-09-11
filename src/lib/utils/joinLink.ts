const PENDING_JOIN_KEY = "gabri-tati-pending-join";

export function buildJoinUrl(code: string, origin?: string): string {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const url = new URL(base || "https://localhost");
  url.searchParams.set("join", code.trim().toUpperCase());
  return url.toString();
}

export function readJoinCodeFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("join") || params.get("code");
  if (!raw) return null;
  return raw.trim().toUpperCase() || null;
}

export function stashPendingJoinCode(code: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_JOIN_KEY, code.trim().toUpperCase());
}

export function consumePendingJoinCode(): string | null {
  if (typeof window === "undefined") return null;
  const code = sessionStorage.getItem(PENDING_JOIN_KEY);
  if (code) sessionStorage.removeItem(PENDING_JOIN_KEY);
  return code;
}

export function peekPendingJoinCode(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_JOIN_KEY);
}

/** Lee ?join= de la URL, lo guarda y limpia la barra de direcciones */
export function captureJoinFromUrl(): string | null {
  const code = readJoinCodeFromLocation();
  if (!code) return null;
  stashPendingJoinCode(code);
  const url = new URL(window.location.href);
  url.searchParams.delete("join");
  url.searchParams.delete("code");
  window.history.replaceState({}, "", url.pathname + url.hash);
  return code;
}
