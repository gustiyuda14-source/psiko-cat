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

/**
 * Bulatkan ke 2 desimal. Bobot desimal (0,6 · 0,15 · 0,2) membuat float meleset
 * tipis — 61 bisa tersimpan 60,999999999999986 dan menggugurkan peserta yang lulus.
 * Semua nilai dibulatkan dulu sebelum dibandingkan dengan ambang 40 / 61.
 */
export const round2 = (n: number) => Math.round(n * 100) / 100;

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
  predikat: string | null;
};

export function calculateNAP(input: ModuleContributions): NAPResult {
  const modules = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, round2(v)])
  ) as ModuleContributions;
  const nap_score = round2(
    modules.kecerdasan_contribution +
    modules.kepribadian_contribution +
    modules.kecermatan_contribution
  );

  // Cek gugur mutlak — sub-tes dengan Predikat Kurang Sekali
  if (modules.kecerdasan_raw <= 40) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `Kecerdasan di bawah batas minimum (nilai ${modules.kecerdasan_raw.toFixed(1)}, minimal 41)`,
      status: "DISQUALIFIED",
      predikat: null,
    };
  }
  if (modules.kepribadian_raw <= 40) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `Kepribadian di bawah batas minimum (nilai ${modules.kepribadian_raw.toFixed(1)}, minimal 41)`,
      status: "DISQUALIFIED",
      predikat: null,
    };
  }
  if (modules.kecermatan_raw <= 40) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `Sikap Kerja di bawah batas minimum (nilai ${modules.kecermatan_raw.toFixed(1)}, minimal 41)`,
      status: "DISQUALIFIED",
      predikat: null,
    };
  }

  // Cek passing grade NAP
  if (nap_score < 61) {
    return {
      nap_score,
      is_passed: false,
      disqualified_reason: `NAP di bawah passing grade (${nap_score.toFixed(1)} < 61)`,
      status: "DISQUALIFIED",
      predikat: null,
    };
  }

  return {
    nap_score,
    is_passed: true,
    disqualified_reason: null,
    status: "COMPLETED",
    predikat: null,
  };
}

/** Mapping skor ke predikat kualitatif */
export function getNAPPredikat(nap_score: number): string {
  if (nap_score >= 81) return "Baik Sekali";
  if (nap_score >= 61) return "Cukup";
  if (nap_score >= 41) return "Kurang";
  return "Kurang Sekali";
}

export function calculateSingleModuleResult(raw: number): NAPResult {
  const raw_score = round2(raw);
  const predikat = getNAPPredikat(raw_score);
  const is_passed = raw_score > 40;

  return {
    nap_score: raw_score,
    is_passed,
    disqualified_reason: is_passed ? null : `Nilai ${raw_score.toFixed(1)} di bawah batas minimal 41`,
    status: is_passed ? "COMPLETED" : "DISQUALIFIED",
    predikat,
  };
}
