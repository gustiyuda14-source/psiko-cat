/**
 * SERVER-SIDE ONLY — psikogram keempat jalur untuk satu atau banyak sesi.
 * Dihitung saat dibaca (bukan disimpan), jadi sesi lama ikut tampil tanpa migrasi.
 */
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { JALUR, hitungSemuaJalur, wsSemua, type HasilPsikogram, type Jalur, type Norma } from "./psikogram";
import { rsModul, rsSesi, type ModuleRow } from "./psikogram-rs";
import norma from "./norma-psikogram.json";

const NORMA = (norma as { aspek: Norma }).aspek;

export async function wsSesi(modules: ModuleRow[]) {
  return wsSemua(await rsSesi(supabaseAdmin, modules), NORMA);
}

export async function psikogramSesi(modules: ModuleRow[]): Promise<HasilPsikogram[]> {
  return hitungSemuaJalur(await wsSesi(modules));
}

/** Psikogram banyak sesi (key = id sesi) dengan query jawaban yang digabung. */
export async function psikogramBanyak(sesi: { id: string; module_sessions: ModuleRow[] }[]): Promise<Map<string, HasilPsikogram[]>> {
  const per = await rsModul(supabaseAdmin, sesi.flatMap((s) => s.module_sessions));
  return new Map(sesi.map((s) => [s.id, hitungSemuaJalur(wsSemua(Object.assign({}, ...s.module_sessions.map((m) => per.get(m.id) ?? {})), NORMA))]));
}

/** WS per module (key = id module), untuk ringkasan aspek per sub-tes. */
export async function wsModul(modules: ModuleRow[]) {
  const per = await rsModul(supabaseAdmin, modules);
  return new Map([...per].map(([id, rs]) => [id, wsSemua(rs, NORMA)]));
}

/** Profil tujuan pilihan peserta (cookie dari ProfilPicker); null = belum memilih. */
export const PROFIL_COOKIE = "psg_profil";
export async function profilPilihan(): Promise<Jalur | null> {
  const v = (await cookies()).get(PROFIL_COOKIE)?.value;
  return JALUR.includes(v as Jalur) ? (v as Jalur) : null;
}
