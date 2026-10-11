/**
 * SERVER-SIDE ONLY — jangan import file ini di komponen atau client code.
 * Scoring Sub-Tes Kecermatan (Simbol/Huruf — bukan Pauli/Kraepelin angka)
 *
 * Versi 2 (2026-10-11). Struktur Ke/Kt/Kh dan bobot 30/40/30 tetap mengikuti
 * TRESHOLD PENILAIAN PSIKO POLRI.py; tiga celah versi 1 ditutup sesuai
 * docs/riset (kecermatan_kraepelin_pauli.md §5):
 *   - 0 klik dapat 30, 10 butir teliti dapat 70,6, klik acak dapat 68.
 *   - SD mentah menghukum peserta cepat (ruang fluktuasi lebih besar).
 *
 *   Salah          = klik − benar
 *   Benar bersih N = max(0, benar − salah / 4)       koreksi tebakan baku, 5 pilihan
 *   Keterlibatan E = min(1, N / 150)                 150 = 15 benar bersih per lajur
 *
 *   Ke (Kecepatan)  = N / 500 × 100                  jawaban benar, bukan klik (Panker)
 *   Kt (Ketelitian) = benar / klik × 100 × E         penuh hanya bila volume wajar
 *   Kh (Ketahanan)  = max(0, 100 × (1 − CV / 0,5)) × E
 *                     CV = SD / rata-rata benar per lajur (keajegan relatif thd kecepatan sendiri)
 *
 * Nilai Murni Kecermatan = (Ke × 0.30) + (Kt × 0.40) + (Kh × 0.30)
 * Kontribusi             = Nilai Murni × 0.20
 *
 * 150 dan 0,5 parameter SEMENTARA dari 15 sesi nyata (2026-10-11): peserta
 * serius 171–289 benar, CV 0,06–0,39. Kalibrasi ulang begitu data bertambah.
 */

import { round2 } from "./nap";

export type KecermatanColumnStats = {
  column_index: number;   // 1-10
  total_klik: number;
  total_benar: number;
};

export type KecermatanScoreResult = {
  ke_index: number;         // 0-100
  kt_index: number;         // 0-100
  kh_index: number;         // 0-100
  sd_value: number;         // SD benar per lajur (sebelum dibagi rata-rata)
  raw_score: number;        // Nilai Murni 0-100
  nap_contribution: number; // max 20
  is_disqualifying: boolean;
};

/**
 * Pengaman jendela waktu per lajur: klik yang terjadi lebih dari 60 dtk (+3 dtk
 * toleransi jam/jaringan) setelah klik pertama di lajurnya tidak dihitung.
 * Waktu klik dicatat browser, jadi ini menahan klien lama dan klik yang tertahan
 * offline — bukan pemalsuan sengaja (itu butuh jam kolom yang dicatat server).
 */
export const COLUMN_WINDOW_MS = 63_000;

export function withinColumnWindow<T extends { column_index: number; clicked_at_ms: number }>(logs: T[]): T[] {
  const first = new Map<number, number>();
  for (const log of logs) {
    const f = first.get(log.column_index);
    if (f === undefined || log.clicked_at_ms < f) first.set(log.column_index, log.clicked_at_ms);
  }
  return logs.filter((log) => log.clicked_at_ms - first.get(log.column_index)! <= COLUMN_WINDOW_MS);
}

export const BENAR_BERSIH_PENUH = 150;
export const CV_MAKS = 0.5;
const PILIHAN = 5;

/**
 * Hitung skor Kecermatan dari statistik per lajur.
 *
 * @param columnStats - Array 10 elemen, satu per lajur
 */
export function calculateKecermatan(
  columnStats: KecermatanColumnStats[]
): KecermatanScoreResult {
  const TOTAL_SOAL = 500;
  const TOTAL_LAJUR = 10;

  const columns = new Set(columnStats.map((column) => column.column_index));
  const invalid = columnStats.some(
    (column) =>
      !Number.isInteger(column.column_index) ||
      column.column_index < 1 ||
      column.column_index > TOTAL_LAJUR ||
      !Number.isInteger(column.total_klik) ||
      !Number.isInteger(column.total_benar) ||
      column.total_klik < 0 ||
      column.total_klik > 50 ||
      column.total_benar < 0 ||
      column.total_benar > column.total_klik
  );
  if (columnStats.length !== TOTAL_LAJUR || columns.size !== TOTAL_LAJUR || invalid) {
    throw new RangeError("Statistik Kecermatan harus memuat 10 kolom unik dengan nilai 0–50 yang valid");
  }

  const total_klik = columnStats.reduce((sum, c) => sum + c.total_klik, 0);
  const total_benar = columnStats.reduce((sum, c) => sum + c.total_benar, 0);

  const total_salah = total_klik - total_benar;
  const benar_bersih = Math.max(0, total_benar - total_salah / (PILIHAN - 1));
  const keterlibatan = Math.min(1, benar_bersih / BENAR_BERSIH_PENUH);

  // Ke — Indeks Kecepatan: benar bersih, jadi klik acak tidak menambah nilai
  const ke_index = round2((benar_bersih / TOTAL_SOAL) * 100);

  // Kt — Indeks Ketelitian: rasio benar, diredam bila volume kerja kecil
  const kt_index = round2(total_klik > 0 ? (total_benar / total_klik) * 100 * keterlibatan : 0);

  // Kh — Indeks Ketahanan: koefisien variasi benar per lajur
  const x_values = columnStats.map((c) => c.total_benar);
  const x_bar = x_values.reduce((s, v) => s + v, 0) / TOTAL_LAJUR;
  const variance = x_values.reduce((s, v) => s + Math.pow(v - x_bar, 2), 0) / TOTAL_LAJUR;
  const sd_value = Math.sqrt(variance);
  const cv = x_bar > 0 ? sd_value / x_bar : Infinity;
  const kh_index = round2(Math.max(0, 100 * (1 - cv / CV_MAKS)) * keterlibatan);

  // Nilai Murni & Kontribusi NAP
  const raw_score = round2(ke_index * 0.3 + kt_index * 0.4 + kh_index * 0.3);
  const nap_contribution = round2(raw_score * 0.2);

  return {
    ke_index,
    kt_index,
    kh_index,
    sd_value,
    raw_score,
    nap_contribution,
    is_disqualifying: raw_score <= 40,
  };
}
