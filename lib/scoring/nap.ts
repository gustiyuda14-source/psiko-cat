/**
 * SERVER-SIDE ONLY — jangan import file ini di komponen atau client code.
 * Kalkulasi Nilai Akhir Psikotes (NAP) & penentuan kelulusan.
 *
 * NAP = Kontribusi Kecerdasan (max 60) + Kepribadian (max 20) + Kecermatan (max 20)
 *
 * Klausul Gugur Mutlak (Diskualifikasi):
 *   1. NAP < 61
 *   2. Salah satu sub-tes memiliki raw_score <= 40 (predikat Kurang Sekali)
 */

export type ModuleContributions = {
  kecerdasan_contribution: number;  // 0-60
  kepribadian_contribution: number; // 0-20
  kecermatan_contribution: number;  // 0-20
  kecerdasan_raw: number;           // 0-100 (untuk cek gugur mutlak)
  kepribadian_raw: number;
  kecermatan_raw: number;
};

export type NAPResult = {
  nap_score: number;
  is_passed: boolean;
  disqualified_reason: string | null;
  status: "COMPLETED" | "DISQUALIFIED";
};

export function calculateNAP(modules: ModuleContributions): NAPResult {
  const nap_score =
    modules.kecerdasan_contribution +
    modules.kepribadian_contribution +
    modules.kecermatan_contribution;

  // Cek gugur mutlak — sub-tes dengan Predikat Kurang Sekali
  if (modules.kecerdasan_raw <= 40) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `Kecerdasan Kurang Sekali (raw_score=${modules.kecerdasan_raw.toFixed(1)})`,
      status: "DISQUALIFIED",
    };
  }
  if (modules.kepribadian_raw <= 40) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `Kepribadian Kurang Sekali (raw_score=${modules.kepribadian_raw.toFixed(1)})`,
      status: "DISQUALIFIED",
    };
  }
  if (modules.kecermatan_raw <= 40) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `Kecermatan Kurang Sekali (raw_score=${modules.kecermatan_raw.toFixed(1)})`,
      status: "DISQUALIFIED",
    };
  }

  // Cek passing grade NAP
  if (nap_score < 61) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `NAP di bawah passing grade (${nap_score.toFixed(1)} < 61)`,
      status: "DISQUALIFIED",
    };
  }

  return {
    nap_score,
    is_passed: true,
    disqualified_reason: null,
    status: "COMPLETED",
  };
}

/** Mapping skor ke predikat kualitatif */
export function getNAPPredikat(nap_score: number): string {
  if (nap_score >= 81) return "Baik Sekali";
  if (nap_score >= 61) return "Cukup";
  if (nap_score >= 41) return "Kurang";
  return "Kurang Sekali";
}
