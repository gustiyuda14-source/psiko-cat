/**
 * Bangun norma kelompok psikogram dari sesi peserta platform → lib/scoring/norma-psikogram.json.
 * Jalankan ulang berkala: npm run build:norma
 * Modul kosong (tanpa jawaban, atau Kecermatan tanpa benar bersih) tidak masuk norma.
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { normaDari, type RS } from "../lib/scoring/psikogram";
import { rsSesi, type ModuleRow } from "../lib/scoring/psikogram-rs";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function main() {
  const sesi: { module_sessions: ModuleRow[] }[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await db.from("test_sessions")
      .select("id, module_sessions(id, module_type, package_number, ke_index, kt_index, kh_index)")
      .in("status", ["COMPLETED", "DISQUALIFIED"]).range(from, from + 499);
    if (error) throw error;
    sesi.push(...(data as unknown as { module_sessions: ModuleRow[] }[]));
    if (data.length < 500) break;
  }
  const sampel: RS[] = [];
  for (const s of sesi) {
    const modules = s.module_sessions.filter((m) => m.module_type !== "KECERMATAN" || (m.ke_index ?? 0) > 0);
    sampel.push(await rsSesi(db, modules));
  }
  const out = { dibangun: new Date().toISOString().slice(0, 10), sesi: sesi.length, aspek: normaDari(sampel) };
  fs.writeFileSync(path.join(__dirname, "../lib/scoring/norma-psikogram.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`Norma psikogram dari ${sesi.length} sesi:`, Object.entries(out.aspek).map(([a, g]) => `${a} n=${g!.n}`).join(", "));
}

main().catch((e) => { console.error(e); process.exit(1); });
