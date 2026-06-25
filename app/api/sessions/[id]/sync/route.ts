/**
 * PATCH /api/sessions/[id]/sync
 * Heartbeat endpoint — client memanggil ini tiap 30 detik saat tes aktif.
 * Menyimpan recovery_snapshot ke ModuleSession agar sesi bisa di-resume.
 *
 * Body: {
 *   module_session_id: string,
 *   current_question_index: number,
 *   current_column_index: number | null,  // Kecermatan only
 *   column_remaining_ms: number | null,   // Kecermatan only
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SessionStatus, ModuleStatus } from "@/app/generated/prisma/client";
import type { RecoverySnapshot } from "@/lib/types/safe-question";

type SyncBody = {
  module_session_id: string;
  current_question_index: number;
  current_column_index: number | null;
  column_remaining_ms: number | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: session_id } = await params;
    const body = await req.json() as SyncBody;

    const { module_session_id, current_question_index, current_column_index, column_remaining_ms } = body;

    if (!module_session_id || current_question_index === undefined) {
      return NextResponse.json({ error: "module_session_id dan current_question_index wajib" }, { status: 400 });
    }

    // Verifikasi module session milik session ini
    const moduleSession = await prisma.moduleSession.findFirst({
      where: { id: module_session_id, test_session_id: session_id },
    });

    if (!moduleSession) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    const snapshot: RecoverySnapshot = {
      current_question_index,
      current_column_index: current_column_index ?? null,
      column_remaining_ms: column_remaining_ms ?? null,
      snapshot_at: Date.now(),
    };

    // Update snapshot + pastikan status session IN_PROGRESS
    await prisma.$transaction([
      prisma.moduleSession.update({
        where: { id: module_session_id },
        data: {
          recovery_snapshot: snapshot,
          status: ModuleStatus.IN_PROGRESS,
          started_at: moduleSession.started_at ?? new Date(),
        },
      }),
      prisma.testSession.update({
        where: { id: session_id },
        data: { status: SessionStatus.IN_PROGRESS },
      }),
    ]);

    return NextResponse.json({ synced_at: snapshot.snapshot_at });

  } catch (err) {
    console.error("[PATCH /api/sessions/[id]/sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/sessions/[id]/sync
 * Session resume — client panggil ini saat load halaman ujian.
 * Mengembalikan recovery_snapshot untuk restore state Zustand.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: session_id } = await params;

    const testSession = await prisma.testSession.findUnique({
      where: { id: session_id },
      select: {
        id: true,
        status: true,
        user_id: true,
        module_sessions: {
          orderBy: { sequence_order: "asc" },
          select: {
            id: true,
            module_type: true,
            sequence_order: true,
            status: true,
            time_limit_seconds: true,
            recovery_snapshot: true,
            started_at: true,
          },
        },
      },
    });

    if (!testSession) {
      return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(testSession);

  } catch (err) {
    console.error("[GET /api/sessions/[id]/sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
