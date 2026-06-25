/**
 * POST /api/sessions/[id]/calculate
 * Server-side scoring endpoint — dipanggil saat semua modul selesai.
 * Melakukan:
 *  1. Fetch semua jawaban + scoring_rule (hanya di sisi server)
 *  2. Hitung Kecerdasan (dikotomis)
 *  3. Hitung Kepribadian (Likert weighted sum)
 *  4. Hitung Kecermatan (Ke/Kt/Kh via SD formula)
 *  5. Hitung NAP final + klausul gugur mutlak
 *  6. Simpan semua hasil ke DB
 *  7. Return hasil (tanpa kunci jawaban)
 *
 * KEAMANAN: scoring_rule TIDAK pernah dikembalikan ke client.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SessionStatus, ModuleStatus } from "@/app/generated/prisma/client";
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

    // ── 1. Load session + semua module sessions
    const testSession = await prisma.testSession.findUnique({
      where: { id: session_id },
      include: {
        module_sessions: {
          orderBy: { sequence_order: "asc" },
        },
      },
    });

    if (!testSession) {
      return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 });
    }

    if (testSession.status === SessionStatus.COMPLETED || testSession.status === SessionStatus.DISQUALIFIED) {
      return NextResponse.json({ error: "Session sudah dihitung" }, { status: 409 });
    }

    const results: Record<string, unknown> = {};

    // ── 2. Scoring per modul
    for (const ms of testSession.module_sessions) {
      if (ms.module_type === "KECERDASAN") {
        const score = await scoreKecerdasan(ms.id);
        results.kecerdasan = score;

        await prisma.moduleSession.update({
          where: { id: ms.id },
          data: {
            raw_score: score.raw_score,
            nap_contribution: score.nap_contribution,
            is_disqualifying: score.is_disqualifying,
            status: ModuleStatus.COMPLETED,
            completed_at: new Date(),
          },
        });
      }

      if (ms.module_type === "KEPRIBADIAN") {
        const score = await scoreKepribadian(ms.id);
        results.kepribadian = score;

        await prisma.moduleSession.update({
          where: { id: ms.id },
          data: {
            raw_score: score.raw_score,
            nap_contribution: score.nap_contribution,
            is_disqualifying: score.is_disqualifying,
            status: ModuleStatus.COMPLETED,
            completed_at: new Date(),
          },
        });
      }

      if (ms.module_type === "KECERMATAN") {
        const score = await scoreKecermatan(ms.id);
        results.kecermatan = score;

        await prisma.moduleSession.update({
          where: { id: ms.id },
          data: {
            raw_score: score.raw_score,
            nap_contribution: score.nap_contribution,
            is_disqualifying: score.is_disqualifying,
            ke_index: score.ke_index,
            kt_index: score.kt_index,
            kh_index: score.kh_index,
            status: ModuleStatus.COMPLETED,
            completed_at: new Date(),
          },
        });
      }
    }

    // ── 3. Hitung NAP final
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

    // ── 4. Simpan hasil ke TestSession
    await prisma.testSession.update({
      where: { id: session_id },
      data: {
        nap_score: nap.nap_score,
        kecerdasan_contribution: kecerdasan.nap_contribution,
        kepribadian_contribution: kepribadian.nap_contribution,
        kecermatan_contribution: kecermatan.nap_contribution,
        is_passed: nap.is_passed,
        disqualified_reason: nap.disqualified_reason,
        status: nap.status === "COMPLETED" ? SessionStatus.COMPLETED : SessionStatus.DISQUALIFIED,
        completed_at: new Date(),
      },
    });

    // ── 5. Return hasil (tanpa kunci jawaban)
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

// ─────────────────────────────────────────────────────────────────────────────
// SCORING HELPERS — akses scoring_rule di sisi server saja
// ─────────────────────────────────────────────────────────────────────────────

async function scoreKecerdasan(module_session_id: string) {
  const answers = await prisma.answer.findMany({
    where: { module_session_id },
    select: { question_id: true, selected_key: true },
  });

  const questions = await prisma.question.findMany({
    where: { id: { in: answers.map((a) => a.question_id) } },
    select: { id: true, scoring_rule: true },
  });

  const answerMap = new Map(answers.map((a) => [a.question_id, a.selected_key]));
  const ruleMap = new Map(
    questions.map((q) => [q.id, q.scoring_rule as KecerdasanScoringRule])
  );

  return calculateKecerdasan(answerMap, ruleMap);
}

async function scoreKepribadian(module_session_id: string) {
  const answers = await prisma.answer.findMany({
    where: { module_session_id },
    select: { question_id: true, selected_key: true },
  });

  const questions = await prisma.question.findMany({
    where: { id: { in: answers.map((a) => a.question_id) } },
    select: { id: true, scoring_rule: true },
  });

  const answerMap = new Map(answers.map((a) => [a.question_id, a.selected_key]));
  const ruleMap = new Map(
    questions.map((q) => [q.id, q.scoring_rule as KepribadianScoringRule])
  );

  return calculateKepribadian(answerMap, ruleMap);
}

async function scoreKecermatan(module_session_id: string) {
  // Ambil semua log + scoring rules dalam sekali query
  const logs = await prisma.kecermatanLog.findMany({
    where: { module_session_id },
    select: {
      id: true,
      column_index: true,
      response_value: true,
      question: { select: { scoring_rule: true } },
    },
  });

  // Update is_correct pada setiap log
  const updateOps = logs.map((log) => {
    const rule = log.question.scoring_rule as KecermatanScoringRule;
    const is_correct = log.response_value === rule.correct_choice;
    return prisma.kecermatanLog.update({
      where: { id: log.id },
      data: { is_correct },
    });
  });
  await prisma.$transaction(updateOps);

  // Hitung statistik per kolom (1-10)
  const columnMap = new Map<number, { total_klik: number; total_benar: number }>();
  for (let i = 1; i <= 10; i++) {
    columnMap.set(i, { total_klik: 0, total_benar: 0 });
  }

  for (const log of logs) {
    const rule = log.question.scoring_rule as KecermatanScoringRule;
    const col = columnMap.get(log.column_index) ?? { total_klik: 0, total_benar: 0 };
    col.total_klik++;
    if (log.response_value === rule.correct_choice) col.total_benar++;
    columnMap.set(log.column_index, col);
  }

  const columnStats: KecermatanColumnStats[] = Array.from(columnMap.entries()).map(
    ([column_index, stats]) => ({ column_index, ...stats })
  );

  return calculateKecermatan(columnStats);
}
