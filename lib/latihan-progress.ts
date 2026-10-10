// Progres latihan per paket di localStorage, pola sama dengan progres drill (lib/drill-cards.ts).
// Latihan tidak masuk riwayat dan sesinya tidak bisa dilanjutkan, jadi yang disimpan
// hanya capaian terjauh: jumlah butir terbanyak yang pernah dijawab dalam satu sesi.
// Kunci = rute sesi paket, mis. "/latihan/kecerdasan/2". Aman diimpor dari client.

import { useMemo, useSyncExternalStore } from "react";

export const LATIHAN_PROGRESS_KEY = "psiko_latihan_res";
const EVENT = "latihan-progress";

export type LatihanProgress = Record<string, number>;

export function readLatihanProgress(): LatihanProgress {
  try {
    const raw = localStorage.getItem(LATIHAN_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as LatihanProgress) : {};
  } catch {
    return {};
  }
}

function write(progress: LatihanProgress) {
  try {
    localStorage.setItem(LATIHAN_PROGRESS_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // localStorage penuh/diblokir (mode privat): progres tidak tersimpan, latihan tetap jalan.
  }
}

/** Simpan capaian sesi bila lebih jauh dari yang tercatat. */
export function recordLatihanProgress(key: string, answered: number) {
  const current = readLatihanProgress();
  if (answered <= (current[key] ?? 0)) return;
  write({ ...current, [key]: answered });
}

export function clearLatihanProgress(key: string) {
  const next = { ...readLatihanProgress() };
  delete next[key];
  write(next);
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/** localStorage sebagai external store: string mentah stabil antar render, server = "". */
export function useLatihanProgress(): LatihanProgress {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(LATIHAN_PROGRESS_KEY) ?? "";
      } catch {
        return "";
      }
    },
    () => ""
  );
  return useMemo(() => (raw ? readLatihanProgress() : {}), [raw]);
}
