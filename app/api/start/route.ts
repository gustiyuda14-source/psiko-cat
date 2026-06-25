/**
 * POST /api/start
 * Satu langkah: cari atau buat User, lalu buat TestSession baru.
 *
 * Body: { name: string, email: string, phone?: string }
 * Returns: { session_id, user_id }
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SessionStatus, ModuleStatus, ModuleType } from "@/app/generated/prisma/client";

const MODULES: { type: ModuleType; time_limit_seconds: number }[] = [
  { type: ModuleType.KECERDASAN, time_limit_seconds: 5400 },
  { type: ModuleType.KECERMATAN, time_limit_seconds: 600 },
  { type: ModuleType.KEPRIBADIAN, time_limit_seconds: 3600 },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; email?: string; phone?: string };
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name dan email wajib diisi" }, { status: 400 });
    }

    const { testSession, moduleSessions } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        update: { name, phone: phone ?? null },
        create: { name, email, phone: phone ?? null },
      });

      const testSession = await tx.testSession.create({
        data: { user_id: user.id, status: SessionStatus.PENDING },
      });

      await tx.moduleSession.createMany({
        data: MODULES.map((m, i) => ({
          test_session_id: testSession.id,
          module_type: m.type,
          sequence_order: i + 1,
          status: ModuleStatus.NOT_STARTED,
          time_limit_seconds: m.time_limit_seconds,
        })),
      });

      const moduleSessions = await tx.moduleSession.findMany({
        where: { test_session_id: testSession.id },
        orderBy: { sequence_order: "asc" },
        select: { id: true, module_type: true, sequence_order: true },
      });

      return { testSession, user, moduleSessions };
    });

    return NextResponse.json(
      { session_id: testSession.id, module_sessions: moduleSessions },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string; meta?: unknown };
    console.error("[POST /api/start]", { code: e?.code, message: e?.message, meta: e?.meta });
    return NextResponse.json(
      { error: "Internal server error", code: e?.code, detail: e?.message },
      { status: 500 }
    );
  }
}
