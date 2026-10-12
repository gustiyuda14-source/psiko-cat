import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { keswaPaket } from "@/lib/keswa-bank";
import { JAWABAN_RE, KESWA_DURASI_DETIK, nilaiKeswa } from "@/lib/keswa-scoring";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Kumpulkan simulasi Keswa: dinilai di server, disimpan ke keswa_attempts (docs/rencana/sql/keswa-attempts.sql).
// Body: { paket: number, jawaban: "Y"/"T"/"-" x 567, durasi: detik }. user_id SELALU dari token sesi.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { paket?: unknown; jawaban?: unknown; durasi?: unknown } | null;

  const paket = Number(body?.paket);
  const bank = Number.isInteger(paket) ? keswaPaket(paket) : undefined;
  const jawaban = typeof body?.jawaban === "string" ? body.jawaban : "";
  const durasi = Math.round(Number(body?.durasi));
  if (!bank || !JAWABAN_RE.test(jawaban) || !Number.isFinite(durasi) || durasi < 0) {
    return NextResponse.json({ error: "Data simulasi tidak valid" }, { status: 400 });
  }

  const hasil = nilaiKeswa(jawaban, bank.kunci);
  const { data, error } = await supabaseAdmin.rpc("record_keswa_attempt", {
    p_user: session.sub,
    p_paket: paket,
    p_jawaban: jawaban,
    p_hasil: hasil,
    p_valid: hasil.valid,
    p_durasi: Math.min(durasi, KESWA_DURASI_DETIK),
  });
  if (error) {
    console.error("keswa POST", error);
    return NextResponse.json({ error: "Hasil belum bisa disimpan. Coba kirim lagi." }, { status: 500 });
  }
  return NextResponse.json({ id: data });
}
