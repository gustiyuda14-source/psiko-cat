"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { JALUR, type Jalur } from "@/lib/scoring/psikogram";

/** Simpan profil tujuan ke akun yang login (ikut ke perangkat mana pun). */
export async function simpanProfil(jalur: string) {
  const session = await getSession();
  if (!session || !JALUR.includes(jalur as Jalur)) return;
  await supabaseAdmin.from("users").update({ profil_tujuan: jalur, updated_at: new Date().toISOString() }).eq("id", session.sub);
  // Penanda untuk proxy.ts: cache akunnya baru segar ≤ 60 dtk lagi.
  (await cookies()).set("psg_profil", jalur, { path: "/", maxAge: 31536000, sameSite: "lax" });
  revalidatePath("/", "layout");
}

/** Langkah wajib (/dashboard/profil): simpan lalu lanjut ke Beranda. */
export async function pilihProfilAwal(jalur: string) {
  await simpanProfil(jalur);
  redirect("/dashboard");
}
