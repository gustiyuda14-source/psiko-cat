"use server";

import { getSession } from "@/lib/auth";
import { parseKoranResult } from "@/lib/fundamental";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Simpan hasil Tes Koran ke latihan_koran_results (docs/rencana/sql/latihan-koran-results.sql) untuk dasbor
// /dashboard/kraepelin. Terpisah dari psikogram. Input divalidasi parseKoranResult (input rusak = tidak disimpan),
// user_id dari token sesi. Gagal simpan (mis. tabel belum dibuat) hanya dicatat di log; layar hasil tetap jalan.
export async function saveKoranResult(input: unknown): Promise<boolean> {
  const row = parseKoranResult(input);
  const session = await getSession();
  if (!row || !session) return false;
  try {
    const { error } = await supabaseAdmin.from("latihan_koran_results").insert({ user_id: session.sub, ...row });
    if (error) {
      console.error("[saveKoranResult] simpan hasil", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[saveKoranResult] simpan hasil", e);
    return false;
  }
}
