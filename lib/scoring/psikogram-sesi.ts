/**
 * SERVER-SIDE ONLY — psikogram keempat jalur untuk satu atau banyak sesi.
 * Dihitung saat dibaca (bukan disimpan), jadi sesi lama ikut tampil tanpa migrasi.
 */
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { JALUR, aspekSesi, hitungSemuaJalur, wsSemua, type AspekSubtes, type HasilPsikogram, type Jalur, type Norma } from "./psikogram";
import { rsModul, rsPribadi, type ModuleRow, type RSModul } from "./psikogram-rs";
import type { PribadiRule } from "./pribadi";
import norma from "./norma-psikogram.json";

const NORMA = (norma as { aspek: Norma }).aspek;

const wsDari = (r: RSModul | undefined) => (r ? wsSemua(r.rs, NORMA, r.sjt) : {});

export async function wsSesi(modules: ModuleRow[]) {
  const per = await rsModul(supabaseAdmin, modules);
  return Object.assign({}, ...modules.map((m) => wsDari(per.get(m.id))));
}

export async function psikogramSesi(modules: ModuleRow[]): Promise<HasilPsikogram[]> {
  return hitungSemuaJalur(await wsSesi(modules));
}

/** Psikogram banyak sesi (key = id sesi) dengan query jawaban yang digabung. */
export async function psikogramBanyak(sesi: { id: string; module_sessions: ModuleRow[] }[]): Promise<Map<string, HasilPsikogram[]>> {
  const per = await rsModul(supabaseAdmin, sesi.flatMap((s) => s.module_sessions));
  return new Map(sesi.map((s) => [s.id, hitungSemuaJalur(Object.assign({}, ...s.module_sessions.map((m) => wsDari(per.get(m.id)))))]));
}

/** WS per module (key = id module), untuk ringkasan aspek per sub-tes. */
export async function wsModul(modules: ModuleRow[]) {
  const per = await rsModul(supabaseAdmin, modules);
  return new Map([...per].map(([id, r]) => [id, wsDari(r)]));
}

/** Kategori psikogram per aspek Kepribadian untuk satu latihan/mini tryout PRIBADI (tanpa sesi DB). */
export function psikogramPribadi(items: { rule: PribadiRule; selected: string | null }[]): AspekSubtes[] {
  return aspekSesi(wsDari(rsPribadi(items)));
}

/** Profil tujuan pilihan peserta (cookie dari ProfilPicker); null = belum memilih. */
export const PROFIL_COOKIE = "psg_profil";
export async function profilPilihan(): Promise<Jalur | null> {
  const v = (await cookies()).get(PROFIL_COOKIE)?.value;
  return JALUR.includes(v as Jalur) ? (v as Jalur) : null;
}
