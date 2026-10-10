import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDrillItem } from "@/lib/drill-bank";

// Gambar pembahasan drill (jawaban terisi / urutan benar). Disimpan di luar public/ supaya
// tidak bisa dibuka sebelum menjawab; alamatnya hanya dikirim oleh /api/drill/check.
const TYPES: Record<string, string> = { ".png": "image/png", ".svg": "image/svg+xml" };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const file = getDrillItem(id)?.gambar_pembahasan;
  // Nama file berasal dari bank (bukan input pengguna); basename menolak path traversal.
  if (!file || path.basename(file) !== file || !TYPES[path.extname(file)]) {
    return NextResponse.json({ error: "Tidak ada gambar" }, { status: 404 });
  }
  const body = await readFile(path.join(process.cwd(), "data/drill-pembahasan", file));
  return new NextResponse(body, {
    headers: {
      "content-type": TYPES[path.extname(file)],
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
      ...(file.endsWith(".svg") ? { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
    },
  });
}
