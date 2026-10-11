import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDrillItem } from "@/lib/drill-bank";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cleanDrill, cleanLatihan, type DrillRow } from "@/lib/progress-rules";

// Progres drill + latihan per peserta (tabel practice_progress, docs/rencana/sql/practice-progress.sql).
// user_id SELALU dari token sesi; browser tidak pernah menentukan milik siapa sebuah baris.
// Percobaan drill dicatat di /api/drill/check (server yang menilai), bukan di sini.

type Row = { kind: string; item_key: string; correct: number; attempts: number; answered: number; last_ms: number | null };
const PAGE = 1000; // batas baris per respons PostgREST

async function readAll(userId: string) {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabaseAdmin
      .from("practice_progress")
      .select("kind, item_key, correct, attempts, answered, last_ms")
      .eq("user_id", userId)
      .order("item_key")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data as Row[]));
    if (data.length < PAGE) return rows;
  }
}

function shape(rows: Row[]) {
  const drill: Record<string, DrillRow> = {};
  const latihan: Record<string, number> = {};
  for (const r of rows) {
    if (r.kind === "drill") drill[r.item_key] = [r.correct, r.attempts, r.last_ms ?? 0];
    else latihan[r.item_key] = r.answered;
  }
  return { drill, latihan };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(shape(await readAll(session.sub)), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("progress GET", e);
    return NextResponse.json({ error: "Progres belum bisa dimuat" }, { status: 500 });
  }
}

/*
  Body:
  { action: "latihan", items: { "/latihan/kecerdasan/2": 37 } }   capaian sesi, hanya naik
  { action: "reset", kind: "drill" | "latihan", keys: string[] }  hapus progres kartu/paket
  { action: "import", drill: {...}, latihan: {...} }               sekali, dari localStorage lama
*/
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.sub;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });

  try {
    if (body.action === "latihan") {
      const items = cleanLatihan(body.items);
      for (const [key, n] of Object.entries(items)) {
        const { error } = await supabaseAdmin.rpc("record_latihan_progress", { p_user: userId, p_key: key, p_answered: n });
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "reset") {
      const kind = body.kind;
      const keys = Array.isArray(body.keys) ? body.keys.filter((k): k is string => typeof k === "string").slice(0, 2000) : [];
      if ((kind !== "drill" && kind !== "latihan") || !keys.length) {
        return NextResponse.json({ error: "kind dan keys wajib" }, { status: 400 });
      }
      for (let i = 0; i < keys.length; i += 200) {
        const { error } = await supabaseAdmin
          .from("practice_progress")
          .delete()
          .eq("user_id", userId)
          .eq("kind", kind)
          .in("item_key", keys.slice(i, i + 200));
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "import") {
      const drill = cleanDrill(body.drill, (id) => Boolean(getDrillItem(id)));
      const latihan = cleanLatihan(body.latihan);
      const have = shape(await readAll(userId));
      const now = new Date().toISOString();
      // Tidak ada cara tahu percobaan mana yang sama; ambil catatan dengan percobaan terbanyak.
      // Semua baris berkolom sama: upsert batch mengisi kolom yang absen dengan NULL.
      const rows = [
        ...Object.entries(drill)
          .filter(([id, r]) => r[1] > (have.drill[id]?.[1] ?? 0))
          .map(([id, [c, a, ms]]) => ({ user_id: userId, kind: "drill", item_key: id, correct: c, attempts: a, answered: 0, last_ms: ms, updated_at: now })),
        ...Object.entries(latihan)
          .filter(([key, n]) => n > (have.latihan[key] ?? 0))
          .map(([key, n]) => ({ user_id: userId, kind: "latihan", item_key: key, correct: 0, attempts: 0, answered: n, last_ms: null, updated_at: now })),
      ];
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabaseAdmin
          .from("practice_progress")
          .upsert(rows.slice(i, i + 500), { onConflict: "user_id,kind,item_key" });
        if (error) throw error;
      }
      return NextResponse.json({ ok: true, imported: rows.length });
    }
  } catch (e) {
    console.error("progress POST", body.action, e);
    return NextResponse.json({ error: "Progres belum bisa disimpan" }, { status: 500 });
  }

  return NextResponse.json({ error: "action tidak dikenal" }, { status: 400 });
}
