/**
 * SERVER-SIDE ONLY — psikogram keempat jalur untuk satu sesi tryout.
 * Dihitung saat dibaca (bukan disimpan), jadi sesi lama ikut tampil tanpa migrasi.
 */
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hitungSemuaJalur, wsSemua, type HasilPsikogram, type Norma } from "./psikogram";
import { rsSesi, type ModuleRow } from "./psikogram-rs";
import norma from "./norma-psikogram.json";

export async function psikogramSesi(modules: ModuleRow[]): Promise<HasilPsikogram[]> {
  return hitungSemuaJalur(wsSemua(await rsSesi(supabaseAdmin, modules), (norma as { aspek: Norma }).aspek));
}
