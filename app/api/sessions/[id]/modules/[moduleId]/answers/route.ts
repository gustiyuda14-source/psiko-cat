/**
 * POST /api/sessions/[id]/modules/[moduleId]/answers
 * Batch save jawaban user. Dipanggil tiap kali user submit jawaban
 * (individual untuk Kecerdasan/Kepribadian, batch untuk Kecermatan).
 *
 * Body: {
 *   answers: Array<{
 *     question_id: string,
 *     selected_key: "A"|"B"|"C"|"D"|"E",
 *     column_index?: number,  // Kecermatan only
 *   }>
 * }
 *
 * Catatan: TIDAK ada scoring di sini. Jawaban disimpan mentah.
 * Scoring hanya terjadi di POST /api/sessions/[id]/calculate.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type AnswerInput = {
  question_id: string;
  selected_key: "A" | "B" | "C" | "D" | "E";
  column_index?: number;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: session_id, moduleId: module_session_id } = await params;
    const body = await req.json() as { answers: AnswerInput[] };

    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json({ error: "answers array wajib diisi" }, { status: 400 });
    }

    // Verifikasi module session
    const moduleSession = await prisma.moduleSession.findFirst({
      where: { id: module_session_id, test_session_id: session_id },
      select: { id: true, status: true },
    });

    if (!moduleSession) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    if (moduleSession.status === "COMPLETED" || moduleSession.status === "TIMED_OUT") {
      return NextResponse.json({ error: "Module sudah selesai, tidak bisa menambah jawaban" }, { status: 409 });
    }

    // Upsert: jika sudah ada (module_session_id + question_id unique), update selected_key
    await prisma.$transaction(
      body.answers.map((a) =>
        prisma.answer.upsert({
          where: {
            module_session_id_question_id: {
              module_session_id,
              question_id: a.question_id,
            },
          },
          update: { selected_key: a.selected_key, answered_at: new Date() },
          create: {
            module_session_id,
            question_id: a.question_id,
            selected_key: a.selected_key,
            column_index: a.column_index ?? null,
          },
        })
      )
    );

    return NextResponse.json({ saved: body.answers.length });

  } catch (err) {
    console.error("[POST /api/sessions/[id]/modules/[moduleId]/answers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/sessions/[id]/modules/[moduleId]/answers
 * Ambil semua jawaban yang sudah tersimpan untuk module session ini.
 * Dipakai saat resume session untuk restore state Zustand.
 * Hanya mengembalikan selected_key (tidak ada scoring info).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: session_id, moduleId: module_session_id } = await params;

    const moduleSession = await prisma.moduleSession.findFirst({
      where: { id: module_session_id, test_session_id: session_id },
      select: { id: true },
    });

    if (!moduleSession) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    const answers = await prisma.answer.findMany({
      where: { module_session_id },
      select: {
        question_id: true,
        selected_key: true,
        column_index: true,
        answered_at: true,
      },
      orderBy: { answered_at: "asc" },
    });

    return NextResponse.json({ answers });

  } catch (err) {
    console.error("[GET /api/sessions/[id]/modules/[moduleId]/answers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
