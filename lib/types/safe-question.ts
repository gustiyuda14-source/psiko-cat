/**
 * SafeQuestion — versi Question yang aman dikirim ke client.
 * Field `scoring_rule` (kunci jawaban) di-omit agar tidak pernah
 * ter-expose ke browser, bahkan jika ada bug di API layer.
 *
 * Tipe ini adalah satu-satunya tipe yang boleh digunakan dalam
 * response shape API routes yang melayani soal ke client.
 */

import type { ModuleType } from "@/lib/test-config";

// Baris tabel `questions` tanpa scoring_rule (skema: prisma/schema.prisma).
export type SafeQuestion = {
  id: string;
  type: ModuleType;
  sequence_number: number;
  column_index: number | null;
  package_number: number | null;
  options_payload: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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
  aspect?: string;
  // Paket PRIBADI (latihan 2-10, simulasi 11): "KP" = Likert 4 tingkat, "SK" = Substansi
  // Khusus pilihan paksa A/B. Kosong = butir lama Likert 5 (simulasi Paket 1).
  subtes?: "KP" | "SK";
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
  // Sebagian butir meminta dua pilihan dan menyimpan kunci kanonis seperti "AC".
  correct_key: string;
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


// ─────────────────────────────────────────────────────────────────────────────
// Recovery snapshot shape — disimpan di ModuleSession.recovery_snapshot
// ─────────────────────────────────────────────────────────────────────────────

export type RecoverySnapshot = {
  current_question_index: number;
  current_column_index: number | null; // null untuk modul non-Kecermatan
  column_remaining_ms: number | null;  // null untuk modul non-Kecermatan
  snapshot_at: number;                 // Unix epoch ms
};
