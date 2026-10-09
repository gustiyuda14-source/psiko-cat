/**
 * SERVER-SIDE ONLY — shared scoring runner.
 * Called directly by result page (no HTTP round-trip) and by the calculate API route.
 */
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateKecerdasan } from "./kecerdasan";
import { calculateKepribadian } from "./kepribadian";
import { calculateKecermatan, type KecermatanColumnStats } from "./kecermatan";
import { calculateNAP, calculateSingleModuleResult } from "./nap";
import { SIMULASI_PACKAGE } from "@/lib/test-config";
import type {
  KecerdasanScoringRule,
  KepribadianScoringRule,
  KecermatanScoringRule,
} from "@/lib/types/safe-question";

async function scoreKecerdasan(module_session_id: string) {
  const { data: answers, error: answerError } = await supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", module_session_id);

  const questionIds = (answers ?? []).map((a) => a.question_id);
  if (answerError) throw answerError;
  const { data: questions, error: questionError } = questionIds.length
    ? await supabaseAdmin.from("questions").select("id, scoring_rule").in("id", questionIds).eq("package_number", SIMULASI_PACKAGE.KEPRIBADIAN).eq("package_number", SIMULASI_PACKAGE.KECERDASAN)
    : { data: [], error: null };
  if (questionError) throw questionError;

  const answerMap = new Map((answers ?? []).map((a) => [a.question_id, a.selected_key]));
  const ruleMap = new Map(
    (questions ?? []).map((q) => [q.id, q.scoring_rule as KecerdasanScoringRule])
  );

  return calculateKecerdasan(answerMap, ruleMap);
}

async function scoreKepribadian(module_session_id: string) {
  const { data: answers, error: answerError } = await supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", module_session_id);

  const questionIds = (answers ?? []).map((a) => a.question_id);
  if (answerError) throw answerError;
  const { data: questions, error: questionError } = questionIds.length
    ? await supabaseAdmin.from("questions").select("id, scoring_rule").in("id", questionIds)
    : { data: [], error: null };
  if (questionError) throw questionError;

  const answerMap = new Map((answers ?? []).map((a) => [a.question_id, a.selected_key]));
  const ruleMap = new Map(
    (questions ?? []).map((q) => [q.id, q.scoring_rule as KepribadianScoringRule])
  );

  return calculateKepribadian(answerMap, ruleMap);
}

async function scoreKecermatan(module_session_id: string) {
  const { data: logs, error: logError } = await supabaseAdmin
    .from("kecermatan_logs")
    .select("id, question_id, column_index, clicked_at_ms, response_value, question:questions(scoring_rule)")
    .eq("module_session_id", module_session_id)
    .order("clicked_at_ms", { ascending: true });
  if (logError) throw logError;

  type LogRow = {
    id: string;
    question_id: string;
    column_index: number;
    response_value: string;
    question: { scoring_rule: KecermatanScoringRule };
  };

  const safeLogs = [...new Map(
    ((logs ?? []) as unknown as LogRow[]).map((log) => [log.question_id, log])
  ).values()];

  const columnMap = new Map<number, { total_klik: number; total_benar: number }>();
  for (let i = 1; i <= 10; i++) {
    columnMap.set(i, { total_klik: 0, total_benar: 0 });
  }

  for (const log of safeLogs) {
    const col = columnMap.get(log.column_index) ?? { total_klik: 0, total_benar: 0 };
    col.total_klik++;
    if (log.response_value === log.question.scoring_rule.correct_choice) col.total_benar++;
    columnMap.set(log.column_index, col);
  }

  const columnStats: KecermatanColumnStats[] = Array.from(columnMap.entries()).map(
    ([column_index, stats]) => ({ column_index, ...stats })
  );

  return calculateKecermatan(columnStats);
}

export type RunCalculateResult = {
  nap_score: number;
  is_passed: boolean;
  status: "COMPLETED" | "DISQUALIFIED";
  disqualified_reason: string | null;
  predikat: string | null;
};

export async function runSessionCalculate(session_id: string, force = false): Promise<RunCalculateResult | null> {
  const { data: testSession, error: tsError } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, module_sessions(*)")
    .eq("id", session_id)
    .single();

  if (tsError) throw tsError;
  if (!testSession) return null;

  if (!force && (testSession.status === "COMPLETED" || testSession.status === "DISQUALIFIED")) {
    return null;
  }

  const moduleSessions = (
    testSession.module_sessions as Array<{ id: string; module_type: string; sequence_order: number }>
  ).sort((a, b) => a.sequence_order - b.sequence_order);

  const results: Record<string, unknown> = {};
  const moduleUpdates: Array<{
    id: string;
    raw_score: number;
    nap_contribution: number;
    is_disqualifying: boolean;
    ke_index: number | null;
    kt_index: number | null;
    kh_index: number | null;
  }> = [];

  for (const ms of moduleSessions) {
    if (ms.module_type === "KECERDASAN") {
      const score = await scoreKecerdasan(ms.id);
      results.kecerdasan = score;
      moduleUpdates.push({
        id: ms.id,
        raw_score: score.raw_score,
        nap_contribution: score.nap_contribution,
        is_disqualifying: score.is_disqualifying,
        ke_index: null,
        kt_index: null,
        kh_index: null,
      });
    }

    if (ms.module_type === "KEPRIBADIAN") {
      const score = await scoreKepribadian(ms.id);
      results.kepribadian = score;
      moduleUpdates.push({
        id: ms.id,
        raw_score: score.raw_score,
        nap_contribution: score.nap_contribution,
        is_disqualifying: score.is_disqualifying,
        ke_index: null,
        kt_index: null,
        kh_index: null,
      });
    }

    if (ms.module_type === "KECERMATAN") {
      const score = await scoreKecermatan(ms.id);
      results.kecermatan = score;
      moduleUpdates.push({
        id: ms.id,
        raw_score: score.raw_score,
        nap_contribution: score.nap_contribution,
        is_disqualifying: score.is_disqualifying,
        ke_index: score.ke_index,
        kt_index: score.kt_index,
        kh_index: score.kh_index,
      });
    }
  }

  // Sesi standalone (Fase 2, Real Exam 1 modul) hanya punya satu module_session --
  // modul yang tidak diikutkan dianggap kontribusi 0 & tidak menggugurkan (bukan "gagal", tapi "tidak diambil").
  const NOT_TAKEN = { nap_contribution: 0, raw_score: 100, is_disqualifying: false };
  const kecerdasan = (results.kecerdasan as Awaited<ReturnType<typeof scoreKecerdasan>> | undefined) ?? NOT_TAKEN;
  const kepribadian = (results.kepribadian as Awaited<ReturnType<typeof scoreKepribadian>> | undefined) ?? NOT_TAKEN;
  const kecermatan = (results.kecermatan as Awaited<ReturnType<typeof scoreKecermatan>> | undefined) ?? NOT_TAKEN;

  const standaloneRawScore = moduleSessions.length === 1
    ? ({
        KECERDASAN: kecerdasan.raw_score,
        KEPRIBADIAN: kepribadian.raw_score,
        KECERMATAN: kecermatan.raw_score,
      } as Record<string, number>)[moduleSessions[0].module_type]
    : null;

  if (moduleSessions.length === 1 && standaloneRawScore == null) {
    throw new Error(`Unsupported standalone module: ${moduleSessions[0].module_type}`);
  }

  const nap = standaloneRawScore == null
    ? calculateNAP({
        kecerdasan_contribution: kecerdasan.nap_contribution,
        kepribadian_contribution: kepribadian.nap_contribution,
        kecermatan_contribution: kecermatan.nap_contribution,
        kecerdasan_raw: kecerdasan.raw_score,
        kepribadian_raw: kepribadian.raw_score,
        kecermatan_raw: kecermatan.raw_score,
      })
    : calculateSingleModuleResult(standaloneRawScore);

  // Single RPC: locks the session row, re-checks the terminal-status guard
  // under that lock, then writes every module_session and the test_session
  // in one transaction. Closes F08 — no more partial writes on mid-loop
  // failure, and no more two-concurrent-calculate race on the status check.
  const { data: finalized, error: rpcError } = await supabaseAdmin.rpc("finalize_test_session", {
    p_session_id: session_id,
    p_force: force,
    p_module_updates: moduleUpdates,
    p_nap_score: nap.nap_score,
    p_kecerdasan_contribution: kecerdasan.nap_contribution,
    p_kepribadian_contribution: kepribadian.nap_contribution,
    p_kecermatan_contribution: kecermatan.nap_contribution,
    p_is_passed: nap.is_passed,
    p_disqualified_reason: nap.disqualified_reason,
    p_status: nap.status === "COMPLETED" ? "COMPLETED" : "DISQUALIFIED",
  });

  if (rpcError) throw rpcError;
  if (!finalized) return null;

  return {
    nap_score: nap.nap_score,
    is_passed: nap.is_passed,
    status: nap.status,
    disqualified_reason: nap.disqualified_reason,
    predikat: nap.predikat,
  };
}
