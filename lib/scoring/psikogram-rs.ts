/**
 * RS per aspek dari database, untuk banyak module sekaligus (beranda, simulasi, admin
 * menghitung psikogram puluhan sesi; satu query per module akan terlalu lambat).
 * Klien Supabase dioper dari luar supaya dipakai halaman (supabaseAdmin) dan
 * scripts/build-norma-psikogram.ts sekaligus.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { simulasiPackageOf } from "@/lib/test-config";
import { itemScore, type PribadiRule } from "./pribadi";
import { kunciNorma, rsKecerdasan, rsKepribadian, rsSikapKerja, type Aspek, type RS } from "./psikogram";

export type ModuleRow = { id: string; module_type: string; package_number?: number | null; ke_index: number | null; kt_index: number | null; kh_index: number | null };

type Jawaban = { module_session_id: string; question_id: string; selected_key: string | null; question: { package_number: number | null } | null };
type Soal = { id: string; sequence_number: number; scoring_rule: unknown };

async function jawabanOf(db: SupabaseClient, ids: string[]): Promise<Jawaban[]> {
  const out: Jawaban[] = [];
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from("answers")
        .select("module_session_id, question_id, selected_key, question:questions(package_number)")
        .in("module_session_id", chunk).order("id").range(from, from + 999);
      if (error) throw error;
      out.push(...(data as unknown as Jawaban[]));
      if (data.length < 1000) break;
    }
  }
  return out;
}

async function soalOf(db: SupabaseClient, type: string, pkgs: number[]): Promise<Map<number, Soal[]>> {
  const map = new Map<number, Soal[]>();
  await Promise.all([...new Set(pkgs)].map(async (pkg) => {
    const { data, error } = await db.from("questions").select("id, sequence_number, scoring_rule").eq("type", type).eq("package_number", pkg);
    if (error) throw error;
    map.set(pkg, (data ?? []) as Soal[]);
  }));
  return map;
}

/** RS satu module; sjt = Kepribadian format situasional (norma terpisah, lib/scoring/psikogram.ts). */
export type RSModul = { rs: RS; sjt: boolean };

/** RS per aspek Kepribadian dari butir Likert 4 dan SJT; butir SK (Integritas) tidak masuk psikogram. */
export function rsPribadi(items: { rule: PribadiRule; selected: string | null }[]): RSModul {
  const kp = items.filter(({ rule }) => rule.type !== "forced_choice") as { rule: Exclude<PribadiRule, { type: "forced_choice" }>; selected: string | null }[];
  return {
    rs: rsKepribadian(kp.map(({ rule, selected }) => ({ aspect: rule.aspect, ...itemScore(rule, selected) }))),
    sjt: kp.some(({ rule }) => rule.type === "sjt5"),
  };
}

/** RS tiap module (key = module id). Module tanpa jawaban menghasilkan RS kosong. */
export async function rsModul(db: SupabaseClient, modules: ModuleRow[]): Promise<Map<string, RSModul>> {
  const out = new Map<string, RSModul>();
  const ks = modules.filter((m) => m.module_type === "KECERDASAN");
  const kp = modules.filter((m) => m.module_type === "KEPRIBADIAN");
  for (const m of modules) if (m.module_type === "KECERMATAN") out.set(m.id, { rs: rsSikapKerja(m.ke_index, m.kt_index, m.kh_index), sjt: false });

  const jawaban = await jawabanOf(db, [...ks, ...kp].map((m) => m.id));
  const per = new Map<string, Jawaban[]>();
  for (const j of jawaban) per.set(j.module_session_id, [...(per.get(j.module_session_id) ?? []), j]);
  // Sama dengan kepribadianPackageOf: paket dari butir yang dijawab, cadangannya paket modul.
  const pkgKs = (m: ModuleRow) => simulasiPackageOf("KECERDASAN", m.package_number);
  const pkgKp = (m: ModuleRow) => per.get(m.id)?.[0]?.question?.package_number ?? simulasiPackageOf("KEPRIBADIAN", m.package_number);
  const [soalKs, soalKp] = await Promise.all([soalOf(db, "KECERDASAN", ks.map(pkgKs)), soalOf(db, "KEPRIBADIAN", kp.map(pkgKp))]);

  for (const m of ks) {
    const js = per.get(m.id);
    if (!js?.length) { out.set(m.id, { rs: {}, sjt: false }); continue; }
    const pilih = new Map(js.map((j) => [j.question_id, j.selected_key]));
    out.set(m.id, { sjt: false, rs: rsKecerdasan((soalKs.get(pkgKs(m)) ?? []).map((q) => ({
      sequence_number: q.sequence_number,
      benar: pilih.get(q.id) === (q.scoring_rule as { correct_key?: string }).correct_key,
    }))) });
  }
  for (const m of kp) {
    const js = per.get(m.id);
    if (!js?.length) { out.set(m.id, { rs: {}, sjt: false }); continue; }
    const pilih = new Map(js.map((j) => [j.question_id, j.selected_key]));
    // Likert 4 dan SJT (PRIBADI); paket lama Likert 5 tidak punya polaritas, jadi aspeknya tercatat belum diuji.
    const rule = (q: Soal) => q.scoring_rule as PribadiRule;
    out.set(m.id, rsPribadi((soalKp.get(pkgKp(m)) ?? [])
      .filter((q) => rule(q).type === "likert4" || rule(q).type === "sjt5")
      .map((q) => ({ rule: rule(q), selected: pilih.get(q.id) ?? null }))));
  }
  return out;
}

/** RS gabungan satu sesi berkunci norma (aspek, atau "sjt:<aspek>"), sampel untuk scripts/build-norma-psikogram.ts. */
export async function rsNormaSesi(db: SupabaseClient, modules: ModuleRow[]): Promise<Record<string, number>> {
  const per = await rsModul(db, modules);
  return Object.assign({}, ...modules.map((m) => {
    const r = per.get(m.id);
    return r ? Object.fromEntries((Object.entries(r.rs) as [Aspek, number][]).map(([a, v]) => [kunciNorma(a, r.sjt), v])) : {};
  }));
}
