// Validasi input progres latihan/drill dari browser (/api/progress). Murni, tanpa DB.
// Kunci latihan = rute sesi paket; batas butir = isi paket terbesar modul itu.

import {
  KECERDASAN_PACKAGES,
  KECERMATAN_ANGKA_PACKAGES,
  KECERMATAN_PACKAGES,
  KECERMATAN_SPASIAL_PACKAGES,
  KECERMATAN_SIMBOL_PACKAGES,
  KEPRIBADIAN_PACKAGES,
  PRIBADI_PACKAGE_SIZE,
} from "@/lib/test-config";

const LATIHAN_ROUTES: [string, number[], number][] = [
  ["/latihan/kecerdasan/", KECERDASAN_PACKAGES, 100],
  ["/latihan/kepribadian/", KEPRIBADIAN_PACKAGES, PRIBADI_PACKAGE_SIZE],
  ["/latihan/kecermatan/", KECERMATAN_PACKAGES, 500],
  ["/latihan/kecermatan-angka/", KECERMATAN_ANGKA_PACKAGES, 500],
  ["/latihan/kecermatan-spasial/", KECERMATAN_SPASIAL_PACKAGES, 500],
  ["/latihan/kecermatan-simbol/", KECERMATAN_SIMBOL_PACKAGES, 500],
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
