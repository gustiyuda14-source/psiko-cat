import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateKecerdasan } from "@/lib/scoring/kecerdasan";
import { calculateKepribadian } from "@/lib/scoring/kepribadian";
import { calculateKecermatan, type KecermatanColumnStats } from "@/lib/scoring/kecermatan";
import { calculateNAP } from "@/lib/scoring/nap";
import type {
  KecerdasanScoringRule,
  KepribadianScoringRule,
  KecermatanScoringRule,
} from "@/lib/types/safe-question";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: session_id } = await params;

    // 1. Load session + module sessions
    const { data: testSession, error: tsError } = await supabaseAdmin
      .from("test_sessions")
      .select("id, status, module_sessions(*)")
      .eq("id", session_id)
      .single();

    if (tsError || !testSession) {
      return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 });
    }

    if (testSession.status === "COMPLETED" || testSession.status === "DISQUALIFIED") {
      return NextResponse.json({ error: "Session sudah dihitung" }, { status: 409 });
    }

    const moduleSessions = (
      testSession.module_sessions as Array<{ id: string; module_type: string; sequence_order: number }>
    ).sort((a, b) => a.sequence_order - b.sequence_order);

    const results: Record<string, unknown> = {};

    // 2. Score per module
    for (const ms of moduleSessions) {
      if (ms.module_type === "KECERDASAN") {
        const score = await scoreKecerdasan(ms.id);
        results.kecerdasan = score;
        const { error } = await supabaseAdmin
          .from("module_sessions")
          .update({
            raw_score: score.raw_score,
            nap_contribution: score.nap_contribution,
            is_disqualifying: score.is_disqualifying,
            status: "COMPLETED",
            completed_at: new Date().toISOString(),
          })
          .eq("id", ms.id);
        if (error) throw error;
      }

      if (ms.module_type === "KEPRIBADIAN") {
        const score = await scoreKepribadian(ms.id);
        results.kepribadian = score;
        const { error } = await supabaseAdmin
          .from("module_sessions")
          .update({
            raw_score: score.raw_score,
            nap_contribution: score.nap_contribution,
            is_disqualifying: score.is_disqualifying,
            status: "COMPLETED",
            completed_at: new Date().toISOString(),
          })
          .eq("id", ms.id);
        if (error) throw error;
      }

      if (ms.module_type === "KECERMATAN") {
        const score = await scoreKecermatan(ms.id);
        results.kecermatan = score;
        const { error } = await supabaseAdmin
          .from("module_sessions")
          .update({
            raw_score: score.raw_score,
            nap_contribution: score.nap_contribution,
            is_disqualifying: score.is_disqualifying,
            ke_index: score.ke_index,
            kt_index: score.kt_index,
            kh_index: score.kh_index,
            status: "COMPLETED",
            completed_at: new Date().toISOString(),
          })
          .eq("id", ms.id);
        if (error) throw error;
      }
    }

    // 3. Calculate NAP
    const kecerdasan = results.kecerdasan as Awaited<ReturnType<typeof scoreKecerdasan>>;
    const kepribadian = results.kepribadian as Awaited<ReturnType<typeof scoreKepribadian>>;
    const kecermatan = results.kecermatan as Awaited<ReturnType<typeof scoreKecermatan>>;

    const nap = calculateNAP({
      kecerdasan_contribution: kecerdasan.nap_contribution,
      kepribadian_contribution: kepribadian.nap_contribution,
      kecermatan_contribution: kecermatan.nap_contribution,
      kecerdasan_raw: kecerdasan.raw_score,
      kepribadian_raw: kepribadian.raw_score,
      kecermatan_raw: kecermatan.raw_score,
    });

    // 4. Save results to TestSession
    const { error: updateError } = await supabaseAdmin
      .from("test_sessions")
      .update({
        nap_score: nap.nap_score,
        kecerdasan_contribution: kecerdasan.nap_contribution,
        kepribadian_contribution: kepribadian.nap_contribution,
        kecermatan_contribution: kecermatan.nap_contribution,
        is_passed: nap.is_passed,
        disqualified_reason: nap.disqualified_reason,
        status: nap.status === "COMPLETED" ? "COMPLETED" : "DISQUALIFIED",
        completed_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      session_id,
      nap_score: nap.nap_score,
      is_passed: nap.is_passed,
      status: nap.status,
      disqualified_reason: nap.disqualified_reason,
      modules: {
        kecerdasan: {
          raw_score: kecerdasan.raw_score,
          nap_contribution: kecerdasan.nap_contribution,
          jumlah_benar: kecerdasan.jumlah_benar,
          is_disqualifying: kecerdasan.is_disqualifying,
        },
        kepribadian: {
          raw_score: kepribadian.raw_score,
          nap_contribution: kepribadian.nap_contribution,
          poin_akumulasi: kepribadian.poin_akumulasi,
          is_disqualifying: kepribadian.is_disqualifying,
        },
        kecermatan: {
          raw_score: kecermatan.raw_score,
          nap_contribution: kecermatan.nap_contribution,
          ke_index: kecermatan.ke_index,
          kt_index: kecermatan.kt_index,
          kh_index: kecermatan.kh_index,
          sd_value: kecermatan.sd_value,
          is_disqualifying: kecermatan.is_disqualifying,
        },
      },
    });

  } catch (err) {
    console.error("[POST /api/sessions/[id]/calculate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function scoreKecerdasan(module_session_id: string) {
  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", module_session_id);

  const questionIds = (answers ?? []).map((a) => a.question_id);
  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, scoring_rule")
    .in("id", questionIds);

  const answerMap = new Map((answers ?? []).map((a) => [a.question_id, a.selected_key]));
  const ruleMap = new Map(
    (questions ?? []).map((q) => [q.id, q.scoring_rule as KecerdasanScoringRule])
  );

  return calculateKecerdasan(answerMap, ruleMap);
}

async function scoreKepribadian(module_session_id: string) {
  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("question_id, selected_key")
    .eq("module_session_id", module_session_id);

  const questionIds = (answers ?? []).map((a) => a.question_id);
  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, scoring_rule")
    .in("id", questionIds);

  const answerMap = new Map((answers ?? []).map((a) => [a.question_id, a.selected_key]));
  const ruleMap = new Map(
    (questions ?? []).map((q) => [q.id, q.scoring_rule as KepribadianScoringRule])
  );

  return calculateKepribadian(answerMap, ruleMap);
}

async function scoreKecermatan(module_session_id: string) {
  const { data: logs } = await supabaseAdmin
    .from("kecermatan_logs")
    .select("id, column_index, response_value, question:questions(scoring_rule)")
    .eq("module_session_id", module_session_id);

  type LogRow = {
    id: string;
    column_index: number;
    response_value: string;
    question: { scoring_rule: KecermatanScoringRule };
  };

  const safeLogs = (logs ?? []) as unknown as LogRow[];

  // Update is_correct on each log
  for (const log of safeLogs) {
    const is_correct = log.response_value === log.question.scoring_rule.correct_choice;
    await supabaseAdmin
      .from("kecermatan_logs")
      .update({ is_correct })
      .eq("id", log.id);
  }

  // Calculate per-column stats
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
