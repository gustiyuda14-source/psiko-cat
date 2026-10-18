import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  KecerdasanReviewItem,
  KepribadianReviewItem,
  KecermatanColumnGroup,
  KecermatanDetailItem,
} from "@/app/components/PembahasanSection";
import type {
  KecerdasanOptionsPayload,
  KepribadianOptionsPayload,
  KecerdasanScoringRule,
  KecermatanOptionsPayload,
} from "@/lib/types/safe-question";

import { getMissingSymbolKey } from "@/lib/kecermatan-symbols";
import { simulasiPackageOf } from "@/lib/test-config";
import { pickReviewRows } from "@/lib/review-pick";
import { itemScore, type PribadiRule } from "@/lib/scoring/pribadi";
import type { PribadiReviewItem } from "@/app/components/PribadiReview";

/** Paket bank soal yang dipakai sebuah module simulasi (null di sesi lama = Paket 1). */
export async function modulePackageOf(moduleSessionId: string, type: "KECERDASAN" | "KEPRIBADIAN"): Promise<number> {
  const { data, error } = await supabaseAdmin.from("module_sessions").select("package_number").eq("id", moduleSessionId).maybeSingle();
  if (error) throw error;
  return simulasiPackageOf(type, data?.package_number);
}

export async function fetchKecerdasanReview(moduleSessionId: string): Promise<KecerdasanReviewItem[]> {
  const { data: moduleSession, error: moduleError } = await supabaseAdmin
    .from("module_sessions").select("package_number, started_at").eq("id", moduleSessionId).maybeSingle();
  if (moduleError) throw moduleError;
  const pkg = simulasiPackageOf("KECERDASAN", moduleSession?.package_number);
  const [{ data: answers, error: answerError }, { data: questions, error: questionError }] = await Promise.all([
    supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", moduleSessionId),
    supabaseAdmin
      .from("questions")
      .select("id, sequence_number, options_payload, scoring_rule, is_active, created_at")
      .eq("type", "KECERDASAN")
      .eq("package_number", pkg)
      .order("sequence_number", { ascending: true }),
  ]);
  if (answerError) throw answerError;
  if (questionError) throw questionError;

  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer.selected_key]));
  // Butir yang dinonaktifkan setelah dijawab/dilihat tetap tampil, satu per nomor.
  return pickReviewRows(questions ?? [], new Set(answerMap.keys()), moduleSession?.started_at ?? null).map((q) => {
      const rule = q.scoring_rule as unknown as KecerdasanScoringRule;
      const selectedKey = answerMap.get(q.id) ?? null;
      return {
        question_id: q.id,
        sequence_number: q.sequence_number as number,
        selected_key: selectedKey,
        correct_key: rule.correct_key,
        is_correct: selectedKey === rule.correct_key,
        pembahasan: rule.pembahasan ?? null,
        pembahasan_svg: rule.pembahasan_svg ?? null,
        payload: q.options_payload as unknown as KecerdasanOptionsPayload,
      };
    });
}

/**
 * Paket Kepribadian milik satu sesi: dari soal yang sudah dijawab (sesi lama
 * dikerjakan di Paket 1 Likert 5), atau paket yang tercatat di sesi bila belum ada jawaban.
 */
export async function kepribadianPackageOf(moduleSessionId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("answers")
    .select("question:questions(package_number)")
    .eq("module_session_id", moduleSessionId)
    .limit(1);
  if (error) throw error;
  const pkg = (data?.[0]?.question as unknown as { package_number: number | null } | null)?.package_number;
  return pkg ?? modulePackageOf(moduleSessionId, "KEPRIBADIAN");
}

export type KepribadianReview = { kepribadian: KepribadianReviewItem[]; pribadi: PribadiReviewItem[] };

/** Paket PRIBADI (11+) dapat pembahasan per aspek seperti latihan; sesi lama Paket 1 Likert 5 tetap kartu tanpa kunci. */
export async function fetchKepribadianReview(moduleSessionId: string): Promise<KepribadianReview> {
  const pkg = await kepribadianPackageOf(moduleSessionId);
  const [{ data: answers, error: answerError }, { data: questions, error: questionError }] = await Promise.all([
    supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", moduleSessionId),
    supabaseAdmin
      .from("questions")
      .select("id, sequence_number, options_payload, scoring_rule, is_active")
      .eq("type", "KEPRIBADIAN")
      .eq("package_number", pkg)
      .order("sequence_number", { ascending: true }),
  ]);
  if (answerError) throw answerError;
  if (questionError) throw questionError;

  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer.selected_key]));
  // Butir yang dinonaktifkan setelah dijawab tetap tampil.
  const rows = (questions ?? []).filter((q) => q.is_active || answerMap.has(q.id));
  const isPribadi = (r: unknown) => {
    const t = (r as PribadiRule | null)?.type;
    return t === "likert4" || t === "forced_choice";
  };
  if (rows.length && rows.every((q) => isPribadi(q.scoring_rule))) {
    return {
      kepribadian: [],
      pribadi: rows.map((q) => {
        const rule = q.scoring_rule as unknown as PribadiRule;
        const selected = answerMap.get(q.id) ?? null;
        return {
          question_id: q.id,
          selected_key: selected,
          payload: q.options_payload as unknown as KepribadianOptionsPayload,
          ...itemScore(rule, selected),
          ...(rule.type === "likert4"
            ? { subtes: "KP", aspect: rule.aspect, polarity: rule.polarity, pembahasan: rule.pembahasan }
            : { subtes: "SK", dimensi: rule.dimensi, pembahasan: rule.pembahasan }),
        };
      }) as PribadiReviewItem[],
    };
  }
  return {
    kepribadian: rows.map((q) => ({
      question_id: q.id,
      sequence_number: q.sequence_number as number,
      selected_key: answerMap.get(q.id) ?? null,
      payload: q.options_payload as unknown as KepribadianOptionsPayload,
    })),
    pribadi: [],
  };
}

// Kunci jawaban benar untuk Kecermatan diturunkan dari options_payload saja (shown vs symbol_map),
// TIDAK pernah menyentuh scoring_rule — aman karena shown selalu berisi 4 dari 5 simbol,
// simbol yang "hilang" dari shown itulah jawaban benarnya (lihat generator di Fase 6).
export async function fetchKecermatanDetailReview(moduleSessionId: string): Promise<KecermatanColumnGroup[]> {
  const { data: logs, error } = await supabaseAdmin
    .from("kecermatan_logs")
    .select("question_id, clicked_at_ms, response_value, question:questions(sequence_number, column_index, options_payload)")
    .eq("module_session_id", moduleSessionId)
    .order("clicked_at_ms", { ascending: true });
  if (error) throw error;

  if (!logs?.length) return [];

  type ReviewLog = {
    question_id: string;
    clicked_at_ms: number;
    response_value: string;
    question: {
      sequence_number: number;
      column_index: number | null;
      options_payload: KecermatanOptionsPayload;
    };
  };
  const uniqueLogs = [...new Map(
    (logs as unknown as ReviewLog[]).map((log) => [log.question_id, log])
  ).values()];

  const at = new Map(uniqueLogs.map((log) => [log.question_id, log.clicked_at_ms]));
  const groups = new Map<number, KecermatanDetailItem[]>();
  for (const log of uniqueLogs) {
    const columnIndex = log.question?.column_index;
    const payload = log.question?.options_payload;
    if (!columnIndex || !payload) continue;
    const correctKey = getMissingSymbolKey(payload);
    if (!correctKey) continue;
    if (!groups.has(columnIndex)) groups.set(columnIndex, []);
    groups.get(columnIndex)!.push({
      question_id: log.question_id,
      sequence_number: log.question.sequence_number,
      shown: payload.shown,
      symbol_map: payload.symbol_map,
      selected_key: log.response_value,
      correct_key: correctKey,
      is_correct: log.response_value === correctKey,
    });
  }

  return Array.from(groups.entries())
    .map(([column_index, items]) => ({
      column_index,
      total: items.length,
      correct: items.filter((item) => item.is_correct).length,
      // ms = jeda dari klik butir sebelumnya di kolom yang sama (kurva titik hafal); butir pertama tanpa jam mulai kolom.
      items: items
        .sort((a, b) => a.sequence_number - b.sequence_number)
        .map((item, i, xs) => (i ? { ...item, ms: at.get(item.question_id)! - at.get(xs[i - 1].question_id)! } : item)),
    }))
    .sort((a, b) => a.column_index - b.column_index);
}
