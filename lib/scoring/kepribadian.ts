/**
 * SERVER-SIDE ONLY — jangan import file ini di komponen atau client code.
 * Scoring Sub-Tes Kepribadian (Non-Kognitif / Skala Likert)
 *
 * Formula:
 *   Poin Akhir = Σ bobot opsi terpilih per butir soal
 *   Max akumulasi = 100 × 0.20 = 20 poin (= NAP kontribusi langsung)
 *
 *   Untuk konversi ke skala 100 (Nilai Murni):
 *   Nilai Murni = (poin_akumulasi / 20) × 100
 */

import type { KepribadianScoringRule } from "@/lib/types/safe-question";

export type KepribadianScoreResult = {
  poin_akumulasi: number;   // 0-20
  raw_score: number;        // skala 0-100
  nap_contribution: number; // max 20
  is_disqualifying: boolean;
};

/**
 * Hitung skor Kepribadian dari pasangan jawaban & kunci bobot.
 *
 * @param answers - Map<question_id, selected_key>
 * @param rules   - Map<question_id, KepribadianScoringRule>
 */
export function calculateKepribadian(
  answers: Map<string, string>,
  rules: Map<string, KepribadianScoringRule>
): KepribadianScoreResult {
  let poin_akumulasi = 0;

  for (const [question_id, selected_key] of answers) {
    const rule = rules.get(question_id);
    if (rule) {
      const weight = rule.weights[selected_key as keyof typeof rule.weights] ?? 0;
      poin_akumulasi += weight;
    }
  }

  const raw_score = (poin_akumulasi / 20) * 100;
  const nap_contribution = poin_akumulasi; // sudah dalam skala 0-20

  return {
    poin_akumulasi,
    raw_score,
    nap_contribution,
    is_disqualifying: raw_score <= 40,
  };
}
