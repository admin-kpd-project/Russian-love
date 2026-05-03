import { formatApiNetworkError } from "./formatNetworkError";

export type NetworkDiagKind = "timeout" | "network" | "ssl" | "abort" | "unknown";

export function classifyNetworkError(err: unknown): { kind: NetworkDiagKind; raw: string } {
  const name = err instanceof Error ? err.name : "";
  const msg = err instanceof Error ? err.message : String(err);
  const low = msg.toLowerCase();
  if (name === "AbortError" || low.includes("abort")) return { kind: "abort", raw: msg };
  if (low.includes("network request failed") || low === "failed to fetch") return { kind: "network", raw: msg };
  if (low.includes("ssl") || low.includes("certificate") || low.includes("handshake")) return { kind: "ssl", raw: msg };
  return { kind: "unknown", raw: msg };
}

function safeOrigin(base: string): string {
  try {
    return new URL(base).origin;
  } catch {
    return base.replace(/\/+$/, "");
  }
}

const KIND_RU: Record<NetworkDiagKind, string> = {
  timeout: "таймаут",
  network: "сеть",
  ssl: "TLS",
  abort: "прерван",
  unknown: "ошибка",
};

/**
 * Краткая строка для UI: причина + origin + человекочитаемое продолжение.
 */
export function buildApiFailureMessage(
  base: string,
  path: string,
  err: unknown,
  opts?: { timeoutMs?: number; aborted?: boolean }
): string {
  const { kind, raw } = opts?.aborted
    ? { kind: "timeout" as const, raw: "AbortError" }
    : classifyNetworkError(err);
  const origin = safeOrigin(base);
  const p = path.startsWith("/") ? path : `/${path}`;
  const tag = `[${KIND_RU[kind]}] ${origin}${p}`;
  if (kind === "timeout" || opts?.aborted) {
    const ms = opts?.timeoutMs;
    const tail = formatApiNetworkError(raw);
    return ms != null ? `${tag} (${ms} мс)\n${tail}` : `${tag}\n${tail}`;
  }
  return `${tag}\n${formatApiNetworkError(raw)}`;
}
