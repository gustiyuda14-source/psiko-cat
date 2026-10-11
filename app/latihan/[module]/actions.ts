"use server";

import { calculateKecermatan, type KecermatanColumnStats, type KecermatanScoreResult } from "@/lib/scoring/kecermatan";

// Skor latihan Kecermatan mode timer per kolom, pakai engine yang sama dengan ujian
// supaya angkanya sebanding. Statistik datang dari browser, jadi hasilnya hanya
// ditampilkan — tidak disimpan ke mana pun. calculateKecermatan memvalidasi isinya
// (10 kolom unik, 0-50); input rusak dibalas null, bukan error.
export async function scoreLatihanKecermatan(stats: KecermatanColumnStats[]): Promise<KecermatanScoreResult | null> {
  try {
    return calculateKecermatan(stats);
  } catch {
    return null;
  }
}
