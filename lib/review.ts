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

const KECERMATAN_KEYS = ["A", "B", "C", "D", "E"] as const;

export async function fetchKecerdasanReview(moduleSessionId: string): Promise<KecerdasanReviewItem[]> {
  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", moduleSessionId);

  if (!answers?.length) return [];

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, sequence_number, options_payload, scoring_rule")
    .in("id", answers.map((a) => a.question_id));

  const qMap = new Map((questions ?? []).map((q) => [q.id, q]));

  return answers
    .map((a) => {
      const q = qMap.get(a.question_id);
      if (!q) return null;
      const rule = q.scoring_rule as unknown as KecerdasanScoringRule;
      return {
        question_id: a.question_id,
        sequence_number: q.sequence_number as number,
        selected_key: a.selected_key,
        correct_key: rule.correct_key,
        is_correct: a.selected_key === rule.correct_key,
        payload: q.options_payload as unknown as KecerdasanOptionsPayload,
      };
    })
    .filter(Boolean) as KecerdasanReviewItem[];
}

export async function fetchKepribadianReview(moduleSessionId: string): Promise<KepribadianReviewItem[]> {
  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", moduleSessionId);

  if (!answers?.length) return [];

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, sequence_number, options_payload")
    .in("id", answers.map((a) => a.question_id));

  const qMap = new Map((questions ?? []).map((q) => [q.id, q]));

  return answers
    .map((a) => {
      const q = qMap.get(a.question_id);
      if (!q) return null;
      return {
        question_id: a.question_id,
        sequence_number: q.sequence_number as number,
        selected_key: a.selected_key,
        payload: q.options_payload as unknown as KepribadianOptionsPayload,
      };
    })
    .filter(Boolean) as KepribadianReviewItem[];
}

// Kunci jawaban benar untuk Kecermatan diturunkan dari options_payload saja (shown vs symbol_map),
// TIDAK pernah menyentuh scoring_rule — aman karena shown selalu berisi 4 dari 5 simbol,
// simbol yang "hilang" dari shown itulah jawaban benarnya (lihat generator di Fase 6).
export async function fetchKecermatanDetailReview(moduleSessionId: string): Promise<KecermatanColumnGroup[]> {
  const { data: logs } = await supabaseAdmin
    .from("kecermatan_logs")
    .select("question_id, column_index, response_value, is_correct")
    .eq("module_session_id", moduleSessionId);

  if (!logs?.length) return [];

  const wrongLogs = logs.filter((l) => l.is_correct === false);
  const questionIds = [...new Set(wrongLogs.map((l) => l.question_id))];

  const { data: questions } = questionIds.length
    ? await supabaseAdmin
        .from("questions")
        .select("id, sequence_number, options_payload")
        .in("id", questionIds)
    : { data: [] as { id: string; sequence_number: number; options_payload: unknown }[] };

  const qMap = new Map((questions ?? []).map((q) => [q.id, q]));

  const groups = new Map<number, { total: number; correct: number; wrong: KecermatanDetailItem[] }>();
  for (const log of logs) {
    if (!groups.has(log.column_index)) groups.set(log.column_index, { total: 0, correct: 0, wrong: [] });
    const g = groups.get(log.column_index)!;
    g.total++;
    if (log.is_correct) g.correct++;
  }

  for (const log of wrongLogs) {
    const q = qMap.get(log.question_id);
    if (!q) continue;
    const payload = q.options_payload as unknown as KecermatanOptionsPayload;
    const correctKey = KECERMATAN_KEYS.find((k) => !payload.shown.includes(payload.symbol_map[k])) ?? "?";
    const g = groups.get(log.column_index)!;
    g.wrong.push({
      question_id: log.question_id,
      sequence_number: q.sequence_number as number,
      shown: payload.shown,
      selected_key: log.response_value,
      selected_symbol: payload.symbol_map[log.response_value as keyof typeof payload.symbol_map] ?? "?",
      correct_key: correctKey,
      correct_symbol: correctKey === "?" ? "?" : payload.symbol_map[correctKey as keyof typeof payload.symbol_map],
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
