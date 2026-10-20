import type { KecermatanOptionsPayload } from "@/lib/types/safe-question";

export const KECERMATAN_KEYS = ["A", "B", "C", "D", "E"] as const;
export type KecermatanKey = (typeof KECERMATAN_KEYS)[number];

// Emoji teks bergantung font emoji OS peserta: Windows 7 tidak punya sama sekali,
// OS lama tidak punya emoji baru (🫥 🪇) — semuanya jadi kotak kosong. Simbol
// berpresentasi emoji dirender dari SVG Twemoji (jdecked/twemoji 16.0.1, CC-BY 4.0)
// di public/emoji supaya sama di semua device. Glyph teks biasa (▲ ♠ ↔) tetap teks.
// Nama file = aturan Twemoji: codepoint hex dipisah "-", FE0F dibuang kecuali urutan ZWJ.
export function emojiSrc(symbol: string): string | null {
  if (!/\p{Emoji_Presentation}|\uFE0F/u.test(symbol)) return null;
  const raw = symbol.includes("\u200D") ? symbol : symbol.replace(/\uFE0F/g, "");
  return `/emoji/${[...raw].map((c) => c.codePointAt(0)!.toString(16)).join("-")}.svg`;
}

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
