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
import { SIMULASI_PACKAGE } from "@/lib/test-config";

export async function fetchKecerdasanReview(moduleSessionId: string): Promise<KecerdasanReviewItem[]> {
  const [{ data: answers, error: answerError }, { data: questions, error: questionError }] = await Promise.all([
    supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", moduleSessionId),
    supabaseAdmin
      .from("questions")
      .select("id, sequence_number, options_payload, scoring_rule")
      .eq("type", "KECERDASAN")
      .eq("package_number", SIMULASI_PACKAGE.KECERDASAN)
      .eq("is_active", true)
      .order("sequence_number", { ascending: true }),
  ]);
  if (answerError) throw answerError;
  if (questionError) throw questionError;

  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer.selected_key]));
  return (questions ?? []).map((q) => {
      const rule = q.scoring_rule as unknown as KecerdasanScoringRule;
      const selectedKey = answerMap.get(q.id) ?? null;
      return {
        question_id: q.id,
        sequence_number: q.sequence_number as number,
        selected_key: selectedKey,
        correct_key: rule.correct_key,
        is_correct: selectedKey === rule.correct_key,
        payload: q.options_payload as unknown as KecerdasanOptionsPayload,
      };
    });
}

export async function fetchKepribadianReview(moduleSessionId: string): Promise<KepribadianReviewItem[]> {
  const [{ data: answers, error: answerError }, { data: questions, error: questionError }] = await Promise.all([
    supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", moduleSessionId),
    supabaseAdmin
      .from("questions")
      .select("id, sequence_number, options_payload")
      .eq("type", "KEPRIBADIAN")
      .eq("package_number", SIMULASI_PACKAGE.KEPRIBADIAN)
      .eq("is_active", true)
      .order("sequence_number", { ascending: true }),
  ]);
  if (answerError) throw answerError;
  if (questionError) throw questionError;

  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer.selected_key]));
  return (questions ?? []).map((q) => {
      return {
        question_id: q.id,
        sequence_number: q.sequence_number as number,
        selected_key: answerMap.get(q.id) ?? null,
        payload: q.options_payload as unknown as KepribadianOptionsPayload,
      };
    });
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

  const groups = new Map<number, { total: number; correct: number; wrong: KecermatanDetailItem[] }>();
  for (const log of uniqueLogs) {
    const columnIndex = log.question?.column_index;
    const payload = log.question?.options_payload;
    if (!columnIndex || !payload) continue;
    const correctKey = getMissingSymbolKey(payload);
    if (!correctKey) continue;
    if (!groups.has(columnIndex)) groups.set(columnIndex, { total: 0, correct: 0, wrong: [] });
    const g = groups.get(columnIndex)!;
    g.total++;
    if (log.response_value === correctKey) {
      g.correct++;
      continue;
    }
    g.wrong.push({
      question_id: log.question_id,
      sequence_number: log.question.sequence_number,
      shown: Array.isArray(payload?.shown) ? payload.shown.filter((symbol) => typeof symbol === "string") : [],
      selected_key: log.response_value,
      selected_symbol: typeof payload?.symbol_map?.[log.response_value as keyof typeof payload.symbol_map] === "string"
        ? payload.symbol_map[log.response_value as keyof typeof payload.symbol_map] : "?",
      correct_key: correctKey,
      correct_symbol: payload.symbol_map[correctKey as keyof typeof payload.symbol_map],
    });
  }

  return Array.from(groups.entries())
    .map(([column_index, g]) => ({
      column_index,
      total: g.total,
      correct: g.correct,
      wrong: g.wrong.sort((a, b) => a.sequence_number - b.sequence_number),
    }))
    .sort((a, b) => a.column_index - b.column_index);
}
