import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDrillItem } from "@/lib/drill-bank";

// Cek satu jawaban drill. Bank drill terpisah dari bank simulasi (data/drill-bank.json,
// bukan tabel questions), jadi kunci boleh dikembalikan setelah peserta menjawab.
// Stateless: tidak menulis apa pun; progres disimpan di localStorage peserta.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { item_id?: unknown; pilihan?: unknown } | null;
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
  return NextResponse.json({
    benar: picked.join("") === kunci.join(""),
    kunci,
    pembahasan: item.pembahasan,
  });
}
