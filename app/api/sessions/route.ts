/**
 * POST /api/sessions
 * Inisialisasi sesi tes baru untuk user.
 * Membuat 1 TestSession + 3 ModuleSession (Kecerdasan → Kepribadian → Kecermatan).
 *
 * Body: { user_id: string }
 * Returns: { session_id, module_sessions: [{ id, module_type, sequence_order }] }
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ModuleType, SessionStatus, ModuleStatus } from "@/app/generated/prisma/client";

const MODULE_ORDER: { type: ModuleType; time_limit_seconds: number }[] = [
  { type: ModuleType.KECERDASAN,  time_limit_seconds: 5400 }, // 90 menit
  { type: ModuleType.KEPRIBADIAN, time_limit_seconds: 3600 }, // 60 menit
  { type: ModuleType.KECERMATAN,  time_limit_seconds: 600  }, // 10 menit
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body as { user_id?: string };

    if (!user_id) {
      return NextResponse.json({ error: "user_id wajib diisi" }, { status: 400 });
    }

    // Cek apakah user ada
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Buat TestSession + 3 ModuleSession dalam satu transaksi
    const session = await prisma.$transaction(async (tx) => {
      const testSession = await tx.testSession.create({
        data: {
          user_id,
          status: SessionStatus.PENDING,
        },
      });

      const moduleSessionsData = MODULE_ORDER.map((m, idx) => ({
        test_session_id: testSession.id,
        module_type: m.type,
        sequence_order: idx + 1,
        status: ModuleStatus.NOT_STARTED,
        time_limit_seconds: m.time_limit_seconds,
      }));

      await tx.moduleSession.createMany({ data: moduleSessionsData });

      const moduleSessions = await tx.moduleSession.findMany({
        where: { test_session_id: testSession.id },
        orderBy: { sequence_order: "asc" },
        select: { id: true, module_type: true, sequence_order: true, time_limit_seconds: true },
      });

      return { testSession, moduleSessions };
    });

    return NextResponse.json({
      session_id: session.testSession.id,
      status: session.testSession.status,
      module_sessions: session.moduleSessions,
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
