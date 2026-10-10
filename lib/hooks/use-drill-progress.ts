"use client";

import { useMemo, useSyncExternalStore } from "react";
import { DRILL_PROGRESS_KEY, readDrillProgress, type DrillProgress } from "@/lib/drill-cards";

// localStorage sebagai external store: string mentah stabil antar render, server = "".
// Ikut berubah saat tab lain menulis (storage) atau writeDrillProgress dipanggil (drill-progress).
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("drill-progress", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("drill-progress", onChange);
  };
}

export function useDrillProgress(): DrillProgress {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(DRILL_PROGRESS_KEY) ?? "";
      } catch {
        return "";
      }
    },
    () => ""
  );
  return useMemo(() => (raw ? readDrillProgress() : {}), [raw]);
}
