import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDrillItem } from "@/lib/drill-bank";
import { MAX_DRILL_MS } from "@/lib/progress-rules";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Cek satu jawaban drill. Bank drill terpisah dari bank simulasi (data/drill-bank.json,
// bukan tabel questions), jadi kunci boleh dikembalikan setelah peserta menjawab.
// Percobaan dicatat di practice_progress milik peserta sesi ini (bukan dari id kiriman browser).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { item_id?: unknown; pilihan?: unknown; ms?: unknown } | null;
  if (!body || typeof body.item_id !== "string" || typeof body.pilihan !== "string") {
    return NextResponse.json({ error: "item_id dan pilihan wajib" }, { status: 400 });
  }

  const item = getDrillItem(body.item_id);
  if (!item) return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });

  const allowed = Object.keys(item.opsi);
  const picked = [...new Set(body.pilihan.toLowerCase().split(""))].sort();
  if (picked.length !== item.kunci.length || picked.some((k) => !allowed.includes(k))) {
    return NextResponse.json({ error: "Pilihan tidak valid" }, { status: 400 });
  }

  const kunci = [...item.kunci].sort();
  const benar = picked.join("") === kunci.join("");
  const ms = Number.isInteger(body.ms) ? Math.min(Math.max(body.ms as number, 0), MAX_DRILL_MS) : null;
  // Gagal simpan tidak menahan pembahasan; peserta diberi tahu lewat `tersimpan`.
  const { error } = await supabaseAdmin.rpc("record_drill_attempt", { p_user: session.sub, p_item: item.id, p_correct: benar, p_ms: ms });
  if (error) console.error("record_drill_attempt", error);
  return NextResponse.json({
    benar,
    tersimpan: !error,
    kunci,
    pembahasan: item.pembahasan,
    // Gambar pembahasan memperlihatkan jawaban, jadi alamatnya baru diberikan setelah peserta menjawab.
    gambar_pembahasan: item.gambar_pembahasan ? `/api/drill/gambar/${item.id}` : null,
  });
}
