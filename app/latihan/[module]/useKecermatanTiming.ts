"use client";

import { useCallback, useEffect, useRef } from "react";
import type { KecermatanTiming } from "@/lib/progress-rules";

// Pencatat waktu latihan Kecermatan untuk analisis hasil (docs/rencana/kecermatan-latihan-analisis.md).
// Jam aktif = performance.now() dikurangi waktu tab tersembunyi, jadi buka WhatsApp di tengah kolom
// tidak terbaca lambat. Kolom "clean" = dimulai dari butir 1 dan tidak dinavigasi dalam 60 detik
// pertamanya; hanya kolom clean yang dipakai nilai 60 detik bayangan.
const WINDOW_MS = 60_000;

export function useKecermatanTiming(current: { id: string; column: number; first: boolean } | null, paused: boolean) {
  const hiddenTotal = useRef(0);
  const hiddenSince = useRef<number | null>(null);
  const colStart = useRef(new Map<number, number>());
  const cols = useRef<KecermatanTiming["cols"]>({});
  const shownAt = useRef(new Map<string, number>());
  const t = useRef<KecermatanTiming["t"]>({});

  const now = useCallback(() => {
    const p = performance.now();
    return p - hiddenTotal.current - (hiddenSince.current === null ? 0 : p - hiddenSince.current);
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) hiddenSince.current ??= performance.now();
      else if (hiddenSince.current !== null) {
        hiddenTotal.current += performance.now() - hiddenSince.current;
        hiddenSince.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Butir tampil: mulai jam kolom (kunjungan pertama) dan jam butir.
  const id = current?.id;
  const column = current?.column;
  const first = current?.first;
  useEffect(() => {
    if (!id || column === undefined || paused || t.current[id]) return;
    const at = now();
    if (!colStart.current.has(column)) {
      colStart.current.set(column, at);
      cols.current[column] = { o: colStart.current.size, clean: Boolean(first) };
    }
    shownAt.current.set(id, at);
  }, [id, column, first, paused, now]);

  const markAnswer = useCallback((qid: string, col: number) => {
    const at = now();
    const start = colStart.current.get(col) ?? at;
    t.current[qid] = [Math.round(at - start), Math.round(at - (shownAt.current.get(qid) ?? at))];
  }, [now]);

  // Mundur/lompat butir di 60 detik pertama: kolom itu tidak lagi setara ujian.
  const markNav = useCallback((col: number) => {
    const start = colStart.current.get(col);
    if (start !== undefined && now() - start < WINDOW_MS && cols.current[col]) cols.current[col].clean = false;
  }, [now]);

  const reset = useCallback(() => {
    colStart.current.clear();
    shownAt.current.clear();
    cols.current = {};
    t.current = {};
  }, []);

  const snapshot = useCallback(
    (pel: boolean): KecermatanTiming => ({ v: 1, pel, cols: { ...cols.current }, t: { ...t.current } }),
    []
  );

  return { markAnswer, markNav, reset, snapshot };
}
