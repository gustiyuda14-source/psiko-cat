/**
 * SafeQuestion — versi Question yang aman dikirim ke client.
 * Field `scoring_rule` (kunci jawaban) di-omit agar tidak pernah
 * ter-expose ke browser, bahkan jika ada bug di API layer.
 *
 * Tipe ini adalah satu-satunya tipe yang boleh digunakan dalam
 * response shape API routes yang melayani soal ke client.
 */

import type { QuestionModel } from "@/app/generated/prisma/models/Question";

export type SafeQuestion = Omit<QuestionModel, "scoring_rule">;

// ─────────────────────────────────────────────────────────────────────────────
// JSONB payload contracts (type-safe di application layer)
// ─────────────────────────────────────────────────────────────────────────────

export type KecerdasanOptionsPayload = {
  instruksi?: string;
  sub_text?: string | null;
  is_multi_select?: boolean;
  question_text: string;
  svg_content: string | null; // null untuk soal non-spasial
  choices: Array<{ key: "A" | "B" | "C" | "D" | "E"; text: string }>;
};

export type KepribadianOptionsPayload = {
  statement: string;
  choices: Array<{ key: "A" | "B" | "C" | "D" | "E"; text: string }>;
};

export type KecermatanOptionsPayload = {
  // Mapping huruf kunci → simbol (ditampilkan sebagai tabel kunci di UI)
  symbol_map: Record<"A" | "B" | "C" | "D" | "E", string>;
  // 4 simbol yang ditampilkan di soal (1 hilang = jawaban)
  shown: string[];
  choices: ["A", "B", "C", "D", "E"];
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-SIDE ONLY scoring rule contracts
// Import tipe ini HANYA di lib/scoring/ — jangan di komponen atau API handler
// ─────────────────────────────────────────────────────────────────────────────

export type KecerdasanScoringRule = {
  type: "dichotomous";
  correct_key: "A" | "B" | "C" | "D" | "E";
};

export type KepribadianScoringRule = {
  type: "likert";
  polarity: "favorable" | "unfavorable";
  weights: Record<"A" | "B" | "C" | "D" | "E", number>;
};

export type KecermatanScoringRule = {
  type: "symbol_match";
  correct_choice: string;
};

export type ScoringRule =
  | KecerdasanScoringRule
  | KepribadianScoringRule
  | KecermatanScoringRule;

// ─────────────────────────────────────────────────────────────────────────────
// Recovery snapshot shape — disimpan di ModuleSession.recovery_snapshot
// ─────────────────────────────────────────────────────────────────────────────

export type RecoverySnapshot = {
  current_question_index: number;
  current_column_index: number | null; // null untuk modul non-Kecermatan
  column_remaining_ms: number | null;  // null untuk modul non-Kecermatan
  snapshot_at: number;                 // Unix epoch ms
};
