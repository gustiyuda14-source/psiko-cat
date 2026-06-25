/**
 * SERVER-SIDE ONLY — jangan import file ini di komponen atau client code.
 * Scoring Sub-Tes Kecermatan (Simbol/Huruf — bukan Pauli/Kraepelin angka)
 *
 * 3 Indeks Psikometri:
 *   Ke (Kecepatan)  = (total_klik / 500) × 100
 *   Kt (Ketelitian) = (total_benar / total_klik) × 100
 *   Kh (Ketahanan)  = konversi SD → 0-100 (SD mendekati 0 = Kh mendekati 100)
 *
 * Formula SD (Simpangan Baku Respons antar Lajur):
 *   SD = √( Σ(xi - x̄)² / 10 )
 *   xi = jumlah soal yang direspons pada lajur ke-i (1-10)
 *   x̄  = rata-rata respons seluruh 10 lajur
 *
 * Nilai Murni Kecermatan = (Ke × 0.30) + (Kt × 0.40) + (Kh × 0.30)
 * NAP Kontribusi         = Nilai Murni × 0.20
 */

export type KecermatanColumnStats = {
  column_index: number;   // 1-10
  total_klik: number;
  total_benar: number;
};

export type KecermatanScoreResult = {
  ke_index: number;         // 0-100
  kt_index: number;         // 0-100
  kh_index: number;         // 0-100
  sd_value: number;         // nilai SD mentah (sebelum konversi)
  raw_score: number;        // Nilai Murni 0-100
  nap_contribution: number; // max 20
  is_disqualifying: boolean;
};

/**
 * Konversi SD ke indeks Kh skala 0-100.
 *
 * Semakin besar SD → Kh semakin rendah.
 * Threshold praktis: SD = 0 → Kh = 100, SD ≥ 15 → Kh = 0.
 * Kh = max(0, 100 - (SD / 15) × 100)
 */
function sdToKhIndex(sd: number): number {
  const MAX_SD = 15; // SD pada level ini dianggap performa anjlok total
  return Math.max(0, 100 - (sd / MAX_SD) * 100);
}

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

  const total_klik = columnStats.reduce((sum, c) => sum + c.total_klik, 0);
  const total_benar = columnStats.reduce((sum, c) => sum + c.total_benar, 0);

  // Ke — Indeks Kecepatan
  const ke_index = (total_klik / TOTAL_SOAL) * 100;

  // Kt — Indeks Ketelitian (hindari division by zero)
  const kt_index = total_klik > 0 ? (total_benar / total_klik) * 100 : 0;

  // Kh — Indeks Ketahanan via Simpangan Baku
  const x_values = columnStats.map((c) => c.total_klik);
  const x_bar = x_values.reduce((s, v) => s + v, 0) / TOTAL_LAJUR;
  const variance = x_values.reduce((s, v) => s + Math.pow(v - x_bar, 2), 0) / TOTAL_LAJUR;
  const sd_value = Math.sqrt(variance);
  const kh_index = sdToKhIndex(sd_value);

  // Nilai Murni & Kontribusi NAP
  const raw_score = ke_index * 0.3 + kt_index * 0.4 + kh_index * 0.3;
  const nap_contribution = raw_score * 0.2;

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
