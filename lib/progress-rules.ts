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
  KEPRIBADIAN_PACKAGES,
  PRIBADI_PACKAGE_SIZE,
  type ModuleType,
} from "@/lib/test-config";

const LATIHAN_ROUTES: [string, number[], number][] = [
  ["/latihan/kecerdasan/", KECERDASAN_PACKAGES, 100],
  ["/latihan/kepribadian/", KEPRIBADIAN_PACKAGES, PRIBADI_PACKAGE_SIZE],
  ["/latihan/kecermatan/", KECERMATAN_PACKAGES, 500],
  ["/latihan/kecermatan-angka/", KECERMATAN_ANGKA_PACKAGES, 500],
  ["/latihan/kecermatan-spasial/", KECERMATAN_SPASIAL_PACKAGES, 500],
  ["/latihan/kecermatan-spasial-dasar/", KECERMATAN_SPASIAL_DASAR_PACKAGES, 500],
  ["/latihan/kecermatan-simbol/", KECERMATAN_SIMBOL_PACKAGES, 500],
  ["/latihan/kecermatan-sains/", KECERMATAN_SAINS_PACKAGES, 500],
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

/** Batas pembahasan latihan tersimpan per paket; sama dengan LIMIT di record_latihan_attempt. */
export const MAX_LATIHAN_ATTEMPTS = 2;

/** Rute paket → percobaan latihan tersimpan (terbaru dulu, maks 2), tabel latihan_attempts. */
export type AttemptList = Record<string, { id: number; at: string }[]>;

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
