"use server";

import { getSession } from "@/lib/auth";
import { latihanPackageOf } from "@/lib/progress-rules";
import { calculateKecermatan, type KecermatanColumnStats, type KecermatanScoreResult } from "@/lib/scoring/kecermatan";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Skor latihan Kecermatan mode timer per kolom, pakai engine yang sama dengan ujian
// supaya angkanya sebanding. calculateKecermatan memvalidasi isinya (10 kolom unik,
// 0-50); input rusak dibalas null, bukan error. Skor disimpan ke latihan_kecermatan_scores
// untuk tren di Beranda (docs/rencana/sql/latihan-kecermatan-scores.sql). Statistik datang
// dari browser, jadi ini progres latihan, bukan nilai resmi. Gagal simpan tidak
// menggagalkan tampilan skor.
export async function scoreLatihanKecermatan(
  stats: KecermatanColumnStats[],
  progressKey?: string
): Promise<KecermatanScoreResult | null> {
  let result: KecermatanScoreResult;
  try {
    result = calculateKecermatan(stats);
  } catch {
    return null;
  }

  const session = await getSession();
  if (session && progressKey && latihanPackageOf(progressKey)?.module === "KECERMATAN") {
    const totalKlik = stats.reduce((s, c) => s + c.total_klik, 0);
    const totalBenar = stats.reduce((s, c) => s + c.total_benar, 0);
    const { error } = await supabaseAdmin.from("latihan_kecermatan_scores").insert({
      user_id: session.sub,
      item_key: progressKey,
      ke_index: result.ke_index,
      kt_index: result.kt_index,
      kh_index: result.kh_index,
      raw_score: result.raw_score,
      total_klik: totalKlik,
      total_benar: totalBenar,
    });
    if (error) console.error("[scoreLatihanKecermatan] simpan skor", error);
  }
  return result;
}
