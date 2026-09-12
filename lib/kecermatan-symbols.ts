import type { KecermatanOptionsPayload } from "@/lib/types/safe-question";

export const KECERMATAN_KEYS = ["A", "B", "C", "D", "E"] as const;
export type KecermatanKey = (typeof KECERMATAN_KEYS)[number];

// Latihan/pembahasan saja. Skor ujian resmi tetap memakai scoring_rule di server.
export function getMissingSymbolKey(payload: KecermatanOptionsPayload): KecermatanKey | null {
  if (!payload || !payload.symbol_map || !Array.isArray(payload.shown)) return null;
  const symbols = KECERMATAN_KEYS.map((key) => payload.symbol_map[key]);
  if (
    symbols.some((symbol) => typeof symbol !== "string" || !symbol.trim()) ||
    new Set(symbols).size !== 5 ||
    payload.shown.length !== 4 ||
    new Set(payload.shown).size !== 4 ||
    payload.shown.some((symbol) => !symbols.includes(symbol))
  ) return null;
  return KECERMATAN_KEYS.find((key) => !payload.shown.includes(payload.symbol_map[key])) ?? null;
}
