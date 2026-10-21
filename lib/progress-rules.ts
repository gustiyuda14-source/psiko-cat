// Validasi input progres latihan/drill dari browser (/api/progress). Murni, tanpa DB.
// Kunci latihan = rute sesi paket; batas butir = isi paket terbesar modul itu.

import {
  KECERDASAN_PACKAGES,
  KECERMATAN_ANGKA_PACKAGES,
  KECERMATAN_PACKAGES,
  KECERMATAN_SPASIAL_PACKAGES,
  KECERMATAN_SPASIAL_DASAR_PACKAGES,
  KECERMATAN_SIMBOL_PACKAGES,
  KECERMATAN_SAINS_PACKAGES,
  KECERMATAN_KOMPOSISI_PACKAGES,
  KECERMATAN_AKSARA_PACKAGES,
  KEPRIBADIAN_LATIHAN_PACKAGES,
  PRIBADI_PACKAGE_SIZE,
  type ModuleType,
} from "@/lib/test-config";

const LATIHAN_ROUTES: [string, number[], number][] = [
  ["/latihan/kecerdasan/", KECERDASAN_PACKAGES, 100],
  ["/latihan/kepribadian/", KEPRIBADIAN_LATIHAN_PACKAGES, PRIBADI_PACKAGE_SIZE],
  ["/latihan/kecermatan/", KECERMATAN_PACKAGES, 500],
  ["/latihan/kecermatan-angka/", KECERMATAN_ANGKA_PACKAGES, 500],
  ["/latihan/kecermatan-spasial/", KECERMATAN_SPASIAL_PACKAGES, 500],
  ["/latihan/kecermatan-spasial-dasar/", KECERMATAN_SPASIAL_DASAR_PACKAGES, 500],
  ["/latihan/kecermatan-simbol/", KECERMATAN_SIMBOL_PACKAGES, 500],
  ["/latihan/kecermatan-sains/", KECERMATAN_SAINS_PACKAGES, 500],
  ["/latihan/kecermatan-komposisi/", KECERMATAN_KOMPOSISI_PACKAGES, 500],
  ["/latihan/kecermatan-aksara/", KECERMATAN_AKSARA_PACKAGES, 500],
];

/** Batas butir untuk kunci latihan yang dikenal; null = kunci tidak sah. */
export function latihanKeyMax(key: string): number | null {
  for (const [base, ids, max] of LATIHAN_ROUTES) {
    if (key.startsWith(base) && ids.map(String).includes(key.slice(base.length))) return max;
  }
  return null;
}

const isInt = (v: unknown, lo: number, hi: number): v is number => Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi;

/** {kunci: butir} → hanya kunci sah dengan angka 1..batas. */
export function cleanLatihan(input: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const [key, n] of Object.entries(input).slice(0, 200)) {
    const max = latihanKeyMax(key);
    if (max !== null && isInt(n, 1, max)) out[key] = n;
  }
  return out;
}

/** Modul dan nomor paket bank soal dari kunci latihan sah; null = bukan kunci latihan. */
export function latihanPackageOf(key: string): { module: ModuleType; pkg: number } | null {
  if (latihanKeyMax(key) === null) return null;
  const moduleType: ModuleType = key.startsWith("/latihan/kecerdasan/")
    ? "KECERDASAN"
    : key.startsWith("/latihan/kepribadian/")
      ? "KEPRIBADIAN"
      : "KECERMATAN";
  return { module: moduleType, pkg: Number(key.slice(key.lastIndexOf("/") + 1)) };
}

/** Jawaban percobaan latihan {id soal: pilihan | null}; null = bentuk tidak sah atau kosong. */
export function cleanAttemptAnswers(input: unknown, max: number): Record<string, string | null> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const entries = Object.entries(input);
  if (!entries.length || entries.length > max) return null;
  const out: Record<string, string | null> = {};
  for (const [id, pick] of entries) {
    if (id.length > 64) return null;
    if (pick !== null && (typeof pick !== "string" || !/^[A-Za-z0-9]{1,4}$/.test(pick))) return null;
    out[id] = pick;
  }
  return out;
}

/** Waktu latihan Kecermatan per percobaan (docs/rencana/kecermatan-latihan-analisis.md). */
/** Metode D'AJIKS Akademi: batas waktu latihan per kolom (detik), kolom I sampai X. */
export const AJIKS_COLUMN_SECONDS = [25, 30, 35, 40, 50, 60, 60, 60, 60, 60];

export type KecermatanTiming = {
  v: 1;
  /** Bantuan pelafalan aktif di akhir sesi. */
  pel: boolean;
  /** Per kolom: o = urutan kunjungan, clean = dikerjakan urut dari butir 1 tanpa navigasi di 60 detik pertama. */
  cols: Record<number, { o: number; clean: boolean }>;
  /** Per soal: [ms aktif sejak kolom mulai, ms aktif sejak butir tampil]. */
  t: Record<string, [number, number]>;
};

const MAX_TIMING_MS = 86_400_000;

/** Waktu dari browser → bentuk sah untuk soal yang dijawab saja; null = rusak. */
export function cleanAttemptTiming(input: unknown, answeredIds: Set<string>): KecermatanTiming | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const { v, pel, cols, t } = input as Record<string, unknown>;
  if (v !== 1 || typeof pel !== "boolean" || !cols || typeof cols !== "object" || !t || typeof t !== "object") return null;
  const outCols: KecermatanTiming["cols"] = {};
  for (const [k, c] of Object.entries(cols)) {
    const col = Number(k);
    const { o, clean } = (c ?? {}) as Record<string, unknown>;
    if (!isInt(col, 1, 10) || !isInt(o, 1, 10) || typeof clean !== "boolean") return null;
    outCols[col] = { o, clean };
  }
  const outT: KecermatanTiming["t"] = {};
  for (const [id, pair] of Object.entries(t)) {
    if (!answeredIds.has(id)) continue;
    if (!Array.isArray(pair) || pair.length !== 2 || !isInt(pair[0], 0, MAX_TIMING_MS) || !isInt(pair[1], 0, MAX_TIMING_MS)) return null;
    outT[id] = [pair[0], pair[1]];
  }
  return { v: 1, pel, cols: outCols, t: outT };
}

/** Batas pembahasan latihan tersimpan per paket; sama dengan LIMIT di record_latihan_attempt. */
export const MAX_LATIHAN_ATTEMPTS = 2;

/** Kecermatan: 1 per mode (tanpa waktu / dengan waktu / Metode D'AJIKS) per paket; mengulang langsung menggantikan
    percobaan mode yang sama (keputusan pemilik 19-10). */
export const maxLatihanAttempts = (key: string) => (latihanPackageOf(key)?.module === "KECERMATAN" ? 1 : MAX_LATIHAN_ATTEMPTS);

/** Rute paket → percobaan latihan tersimpan (terbaru dulu, maks 2), tabel latihan_attempts. */
export type AttemptList = Record<string, { id: number; at: string; timed: boolean; ajiks: boolean }[]>;

/** Nama mode percobaan Kecermatan, dipakai sebagai label pembahasan tersimpan. */
export const attemptModeLabel = (a: { timed: boolean; ajiks: boolean }) =>
  a.ajiks ? "Metode D'AJIKS" : a.timed ? "Dengan waktu" : "Tanpa waktu";

export type DrillRow = [correct: number, attempts: number, ms: number];
export const MAX_DRILL_ATTEMPTS = 1000;
export const MAX_DRILL_MS = 3_600_000;

/** {id soal: [benar, coba, ms]} dari localStorage lama → hanya id yang ada di bank, angka masuk akal. */
export function cleanDrill(input: unknown, idExists: (id: string) => boolean): Record<string, DrillRow> {
  const out: Record<string, DrillRow> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const [id, row] of Object.entries(input).slice(0, 5000)) {
    if (!Array.isArray(row) || !idExists(id)) continue;
    const [c, a, ms] = row;
    if (!isInt(a, 1, MAX_DRILL_ATTEMPTS) || !isInt(c, 0, a)) continue;
    out[id] = [c, a, isInt(ms, 0, MAX_DRILL_MS) ? ms : 0];
  }
  return out;
}
