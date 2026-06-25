/**
 * SERVER-SIDE ONLY — jangan import file ini di komponen atau client code.
 * Scoring Sub-Tes Kecerdasan (Kognitif)
 *
 * Formula:
 *   Nilai Murni  = (jumlah_benar / 100) × 100
 *   NAP Kontribusi = jumlah_benar × 0.6   (max 60 pts)
 */

import type { KecerdasanScoringRule } from "@/lib/types/safe-question";

export type KecerdasanScoreResult = {
  jumlah_benar: number;
  raw_score: number;       // skala 0-100
  nap_contribution: number; // max 60
  is_disqualifying: boolean;
};

/**
 * Hitung skor Kecerdasan dari pasangan jawaban & kunci.
 *
 * @param answers - Map<question_id, selected_key>
 * @param rules   - Map<question_id, KecerdasanScoringRule>
 */
export function calculateKecerdasan(
  answers: Map<string, string>,
  rules: Map<string, KecerdasanScoringRule>
): KecerdasanScoreResult {
  let jumlah_benar = 0;

  for (const [question_id, selected_key] of answers) {
    const rule = rules.get(question_id);
    if (rule && selected_key === rule.correct_key) {
      jumlah_benar++;
    }
  }

  const raw_score = (jumlah_benar / 100) * 100;
  const nap_contribution = jumlah_benar * 0.6;

  return {
    jumlah_benar,
    raw_score,
    nap_contribution,
    is_disqualifying: raw_score <= 40,
  };
}
