/** RNG determinista + códigos de sesión para dos móviles */

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 */
export function createSeededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateSessionCode(random: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]!;
  }
  return code;
}

export function normalizeSessionCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export function seedFromSessionCode(code: string): number {
  return hashString(`gabri-tati:${normalizeSessionCode(code)}`);
}

export function packSharePayload(sessionCode: string, restaurantId?: string | null): string {
  const base = normalizeSessionCode(sessionCode);
  if (!restaurantId) return base;
  return `${base}-${restaurantId}`;
}

export function unpackSharePayload(raw: string): {
  sessionCode: string;
  restaurantId: string | null;
} {
  const cleaned = raw.trim();
  const parts = cleaned.split(/[-_]/);
  const sessionCode = normalizeSessionCode(parts[0] || "");
  const restaurantId = parts[1] ? parts.slice(1).join("-").toLowerCase() : null;
  return { sessionCode, restaurantId };
}
