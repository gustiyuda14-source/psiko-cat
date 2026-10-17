/**
 * RS per aspek satu sesi, dari database. Klien Supabase dioper dari luar supaya
 * dipakai halaman hasil (supabaseAdmin) dan scripts/build-norma-psikogram.ts sekaligus.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { simulasiPackageOf } from "@/lib/test-config";
import { itemScore, type PribadiRule } from "./pribadi";
import { rsKecerdasan, rsKepribadian, rsSikapKerja, type RS } from "./psikogram";

export type ModuleRow = { id: string; module_type: string; package_number?: number | null; ke_index: number | null; kt_index: number | null; kh_index: number | null };

async function answersOf(db: SupabaseClient, moduleSessionId: string) {
  const { data, error } = await db.from("answers").select("question_id, selected_key, question:questions(package_number)").eq("module_session_id", moduleSessionId);
  if (error) throw error;
  return data ?? [];
}

async function questionsOf(db: SupabaseClient, type: string, pkg: number) {
  const { data, error } = await db.from("questions").select("id, sequence_number, scoring_rule").eq("type", type).eq("package_number", pkg);
  if (error) throw error;
  return data ?? [];
}

async function kecerdasan(db: SupabaseClient, m: ModuleRow): Promise<RS> {
  const answers = await answersOf(db, m.id);
  if (!answers.length) return {};
  const pilih = new Map(answers.map((a) => [a.question_id as string, a.selected_key as string | null]));
  const qs = await questionsOf(db, "KECERDASAN", simulasiPackageOf("KECERDASAN", m.package_number));
  return rsKecerdasan(qs.map((q) => ({
    sequence_number: q.sequence_number as number,
    benar: pilih.get(q.id) === (q.scoring_rule as { correct_key?: string }).correct_key,
  })));
}

async function kepribadian(db: SupabaseClient, m: ModuleRow): Promise<RS> {
  const answers = await answersOf(db, m.id);
  if (!answers.length) return {};
  // Sama dengan kepribadianPackageOf: paket dari butir yang dijawab, cadangannya paket modul.
  const pkg = (answers[0].question as unknown as { package_number: number | null } | null)?.package_number
    ?? simulasiPackageOf("KEPRIBADIAN", m.package_number);
  const pilih = new Map(answers.map((a) => [a.question_id as string, a.selected_key as string | null]));
  // Hanya Likert 4 (PRIBADI); paket lama Likert 5 tidak punya polaritas, jadi aspeknya tercatat belum diuji.
  return rsKepribadian((await questionsOf(db, "KEPRIBADIAN", pkg))
    .filter((q) => (q.scoring_rule as PribadiRule).type === "likert4")
    .map((q) => {
      const rule = q.scoring_rule as Extract<PribadiRule, { type: "likert4" }>;
      return { aspect: rule.aspect, skor: itemScore(rule, pilih.get(q.id) ?? null).skor };
    }));
}

export async function rsSesi(db: SupabaseClient, modules: ModuleRow[]): Promise<RS> {
  const ks = modules.find((m) => m.module_type === "KECERDASAN");
  const kp = modules.find((m) => m.module_type === "KEPRIBADIAN");
  const kc = modules.find((m) => m.module_type === "KECERMATAN");
  const [a, b] = await Promise.all([ks ? kecerdasan(db, ks) : {}, kp ? kepribadian(db, kp) : {}]);
  return { ...a, ...b, ...(kc ? rsSikapKerja(kc.ke_index, kc.kt_index, kc.kh_index) : {}) };
}
