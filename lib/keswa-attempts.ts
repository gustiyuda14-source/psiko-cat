import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { KeswaHasil } from "@/lib/keswa-scoring";

export type KeswaAttempt = {
  id: number;
  paket: number;
  valid: boolean;
  hasil: KeswaHasil;
  durasi_detik: number;
  submitted_at: string;
};

const COLS = "id, paket, valid, hasil, durasi_detik, submitted_at";

/** Riwayat per paket (terbaru dulu). Tabel bermasalah = riwayat kosong, halaman tetap tampil. */
export async function keswaRiwayat(userId: string): Promise<Record<number, KeswaAttempt[]>> {
  const { data, error } = await supabaseAdmin.from("keswa_attempts").select(COLS).eq("user_id", userId).order("submitted_at", { ascending: false });
  if (error) {
    console.error("keswa riwayat", error);
    return {};
  }
  const out: Record<number, KeswaAttempt[]> = {};
  for (const r of (data ?? []) as KeswaAttempt[]) (out[r.paket] ??= []).push(r);
  return out;
}

/** Satu percobaan, hanya bila milik userId. */
export async function keswaAttempt(userId: string, id: number): Promise<KeswaAttempt | null> {
  const { data, error } = await supabaseAdmin.from("keswa_attempts").select(COLS).eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) console.error("keswa attempt", error);
  return (data as KeswaAttempt | null) ?? null;
}
