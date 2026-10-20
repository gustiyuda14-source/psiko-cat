"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { JALUR, type Jalur } from "@/lib/scoring/psikogram";

/** Simpan profil tujuan ke akun yang login (ikut ke perangkat mana pun). */
export async function simpanProfil(jalur: string) {
  const session = await getSession();
  if (!session || !JALUR.includes(jalur as Jalur)) return;
  await supabaseAdmin.from("users").update({ profil_tujuan: jalur, updated_at: new Date().toISOString() }).eq("id", session.sub);
  revalidatePath("/", "layout");
}
