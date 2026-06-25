import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ModuleStatus } from "@/app/generated/prisma/client";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: session_id, moduleId: module_session_id } = await params;

    const ms = await prisma.moduleSession.findFirst({
      where: { id: module_session_id, test_session_id: session_id },
    });

    if (!ms) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    await prisma.moduleSession.update({
      where: { id: module_session_id },
      data: {
        status: ModuleStatus.COMPLETED,
        completed_at: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
