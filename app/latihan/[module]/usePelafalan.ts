"use client";

import { useMemo, useState } from "react";
import type { SafeQuestion, KecermatanOptionsPayload } from "@/lib/types/safe-question";
import { KECERMATAN_KEYS } from "@/app/components/KecermatanKeyStrip";
import PELAFALAN from "@/data/kecermatan-pelafalan.json";

const PELAFALAN_PREF = "kecermatan-show-pelafalan";
const pelafalanOf = (symbol: unknown) => (PELAFALAN as Record<string, string>)[String(symbol)];

// Bantuan pelafalan: kata per kunci (data/kecermatan-pelafalan.json). Angka/huruf
// tidak punya label, jadi toggle cuma muncul kalau paket ini punya label.
export function usePelafalan(sorted: SafeQuestion[], symbolMap: Record<string, string>) {
  const hasPelafalan = useMemo(
    () => sorted.some((s) => pelafalanOf((s.options_payload as unknown as KecermatanOptionsPayload)?.symbol_map?.A)),
    [sorted]
  );
  // Dirender setelah "Mulai" (LatihanGate), jadi selalu di browser.
  const [showPelafalan, setShowPelafalan] = useState(() => {
    try {
      return localStorage.getItem(PELAFALAN_PREF) !== "0";
    } catch {
      return true;
    }
  });
  const togglePelafalan = () => {
    setShowPelafalan((v) => {
      try {
        localStorage.setItem(PELAFALAN_PREF, v ? "0" : "1");
      } catch {}
      return !v;
    });
  };
  const labels =
    showPelafalan && KECERMATAN_KEYS.some((k) => pelafalanOf(symbolMap[k]))
      ? Object.fromEntries(KECERMATAN_KEYS.map((k) => [k, pelafalanOf(symbolMap[k]) ?? ""]))
      : null;
  return { hasPelafalan, showPelafalan, togglePelafalan, labels };
}
