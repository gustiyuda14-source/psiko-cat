"use client";

// Progres drill + latihan milik peserta yang login, sumber kebenaran = server (/api/progress,
// tabel practice_progress). Modul ini hanya cache di memori tab: dimuat sekali, diperbarui
// optimistis saat peserta menjawab, dikosongkan saat logout supaya akun berikutnya di
// perangkat yang sama tidak melihat progres akun sebelumnya.

import { useSyncExternalStore } from "react";
import type { AttemptList, DrillRow } from "@/lib/progress-rules";

/** id soal → [benar, percobaan, ms terakhir]. */
export type DrillProgress = Record<string, DrillRow>;
/** Rute sesi paket → butir terjauh yang pernah dijawab dalam satu sesi. */
export type LatihanProgress = Record<string, number>;
/** ready = data server sudah termuat sekali (sebelum itu daftar percobaan belum bisa dipercaya). */
type State = { drill: DrillProgress; latihan: LatihanProgress; attempts: AttemptList; ready: boolean };

const EMPTY: State = { drill: {}, latihan: {}, attempts: {}, ready: false };
// Kunci localStorage versi lama (sebelum progres pindah ke server); diimpor sekali lalu dihapus.
const LEGACY = { drill: "psiko_drill_res", latihan: "psiko_latihan_res" } as const;
const FLUSH_MS = 3000;

let state: State = EMPTY;
let loading: Promise<void> | null = null;
let generation = 0; // naik saat logout: respons fetch lama tidak boleh menimpa state akun baru
const listeners = new Set<() => void>();
const pending = new Map<string, number>();
let timer: ReturnType<typeof setTimeout> | undefined;

function emit(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function post(body: unknown) {
  return fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true, // tetap terkirim saat tab ditutup / pindah halaman
  });
}

async function importLegacy() {
  let drill: unknown = null, latihan: unknown = null;
  try {
    drill = JSON.parse(localStorage.getItem(LEGACY.drill) ?? "null");
    latihan = JSON.parse(localStorage.getItem(LEGACY.latihan) ?? "null");
  } catch {
    // data rusak / storage diblokir: tidak ada yang diimpor
  }
  if (!drill && !latihan) return;
  // ponytail: progres lama di perangkat bersama masuk ke akun pertama yang login sesudah rilis; tidak bisa dibedakan pemiliknya.
  const res = await post({ action: "import", drill, latihan });
  if (res.ok) {
    localStorage.removeItem(LEGACY.drill);
    localStorage.removeItem(LEGACY.latihan);
  }
}

function load() {
  const gen = generation;
  loading ??= (async () => {
    try {
      await importLegacy();
      const res = await fetch("/api/progress", { cache: "no-store" });
      if (!res.ok || gen !== generation) return;
      const data = (await res.json()) as State;
      // Capaian latihan yang belum terkirim tetap menang atas data server yang lebih lama.
      const latihan = { ...data.latihan };
      for (const [k, n] of pending) latihan[k] = Math.max(latihan[k] ?? 0, n);
      emit({ drill: data.drill ?? {}, latihan, attempts: data.attempts ?? {}, ready: true });
    } catch {
      // offline: tampil kosong, coba lagi saat tab difokuskan
    } finally {
      if (gen === generation) loading = null;
    }
  })();
  return loading;
}

function onFocus() {
  if (!pending.size) void load();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) window.addEventListener("focus", onFocus);
  if (state === EMPTY) void load();
  return () => {
    listeners.delete(onChange);
    if (!listeners.size) window.removeEventListener("focus", onFocus);
  };
}

function useState_(): State {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

export function useDrillProgress(): DrillProgress {
  return useState_().drill;
}

/** Progres drill sudah dimuat dari server? Sebelum itu semua soal tampak "belum dikerjakan", jadi badge NEW belum boleh tampil. */
export function useDrillProgressReady(): boolean {
  return useState_().ready;
}

export function useLatihanProgress(): LatihanProgress {
  return useState_().latihan;
}

/** Muat ulang data server bila pemuatan pertama gagal (mis. sinyal putus); tanpa efek bila sudah termuat. */
export function retryProgressLoad() {
  if (!state.ready) void load();
}

/** Pembahasan latihan tersimpan per rute paket (terbaru dulu, maks 2). */
export function useLatihanAttempts(): { attempts: AttemptList; ready: boolean } {
  const s = useState_();
  return { attempts: s.attempts, ready: s.ready };
}

/**
  Simpan jawaban latihan yang sudah dikumpulkan supaya pembahasannya bisa dibuka lagi.
  Server menyisakan 2 percobaan terbaru per paket; pemanggil wajib minta persetujuan
  peserta dulu bila sudah ada 2 (lihat AttemptSaver).
*/
export async function saveLatihanAttempt(key: string, answers: Record<string, string | null>, timed = false): Promise<boolean> {
  const gen = generation;
  // Tiga kali dengan jeda: sinyal yang putus sesaat tidak boleh menghilangkan pembahasan.
  let res: Response | null = null;
  for (let attempt = 0; attempt < 3 && !res?.ok; attempt++) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    res = await post({ action: "attempt", key, answers, timed }).catch(() => null);
    if (res && res.status >= 400 && res.status < 500) break; // ditolak server: mengulang tidak membantu
  }
  if (!res?.ok) return false;
  const data = (await res.json().catch(() => null)) as { attempts?: AttemptList[string] } | null;
  if (gen === generation && data?.attempts) emit({ ...state, attempts: { ...state.attempts, [key]: data.attempts } });
  return true;
}

/** Cerminkan percobaan yang sudah dicatat server oleh /api/drill/check. */
export function noteDrillAttempt(id: string, benar: boolean, ms: number) {
  const prev = state.drill[id] ?? [0, 0, 0];
  emit({ ...state, drill: { ...state.drill, [id]: [prev[0] + (benar ? 1 : 0), prev[1] + 1, ms] } });
}

export async function flushLatihanProgress() {
  clearTimeout(timer);
  timer = undefined;
  if (!pending.size) return;
  const items = Object.fromEntries(pending);
  pending.clear();
  try {
    const res = await post({ action: "latihan", items });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    // Kembalikan ke antrean kecuali sudah ada capaian lebih baru; dicoba lagi pada jawaban berikutnya.
    for (const [k, n] of Object.entries(items)) if (n > (pending.get(k) ?? 0)) pending.set(k, n);
  }
}

/** Simpan capaian sesi bila lebih jauh dari yang tercatat (dikirim berkala, bukan per klik). */
export function recordLatihanProgress(key: string, answered: number) {
  if (answered <= (state.latihan[key] ?? 0)) return;
  emit({ ...state, latihan: { ...state.latihan, [key]: answered } });
  pending.set(key, answered);
  timer ??= setTimeout(() => void flushLatihanProgress(), FLUSH_MS);
}

/** Hapus progres kartu drill (id soal) atau paket latihan (rute). */
export async function resetProgress(kind: "drill" | "latihan", keys: string[]) {
  if (!keys.length) return;
  const next = { ...state[kind] } as Record<string, unknown>;
  for (const k of keys) {
    delete next[k];
    if (kind === "latihan") pending.delete(k);
  }
  emit({ ...state, [kind]: next });
  const res = await post({ action: "reset", kind, keys }).catch(() => null);
  if (!res?.ok) void load(); // gagal di server: tampilkan lagi apa yang benar-benar tersimpan
}

/** Dipanggil saat logout, setelah capaian terakhir dikirim. */
export function clearProgressCache() {
  generation++;
  loading = null;
  pending.clear();
  clearTimeout(timer);
  timer = undefined;
  emit(EMPTY);
}

// Kirim sisa capaian saat tab disembunyikan (pindah aplikasi di HP, tutup tab).
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushLatihanProgress();
  });
}

