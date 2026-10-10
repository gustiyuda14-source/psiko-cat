import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { summarize, type KpPembahasan, type PribadiRule } from "../lib/scoring/pribadi";

// Seed satu paket latihan PRIBADI dari bank file ke tabel questions.
//   npx tsx scripts/seed-pribadi-paket.ts 2          → cek komposisi saja (dry run)
//   npx tsx scripts/seed-pribadi-paket.ts 2 --apply  → tulis ke DB lalu verifikasi
// Urutan butir diambil dari bank/pribadi/paket-<NN>.json. Jalankan
// scripts/check-bank-pribadi.ts dulu untuk validasi isi butir.

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const PKG = Number(process.argv[2]);
const APPLY = process.argv.includes("--apply");
assert.ok(Number.isInteger(PKG) && PKG >= 2, "Nomor paket latihan wajib (2-11)");

const dir = path.join(__dirname, "../bank/pribadi");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const manifest = read(`paket-${String(PKG).padStart(2, "0")}.json`) as { urutan: string[] };

type Kp = { id: string; aspek: string; arah: "favorable" | "unfavorable"; pernyataan: string; alasan: string; catatan_psikologi?: string; bedah?: KpPembahasan["bedah"] };
type Sk = { id: string; dimensi: string; situasi: string; opsi: { A: string; B: string }; kunci: "A" | "B"; kembar_dengan: string | null; pembahasan: string };
const kp = new Map<string, Kp & { definisi: string }>();
const sk = new Map<string, Sk & { nama: string; aturan: string }>();
for (const f of fs.readdirSync(dir)) {
  if (/^kp-.*\.json$/.test(f)) {
    const b = read(f) as { definisi_aspek: Record<string, string>; items: Kp[] };
    for (const it of b.items) kp.set(it.id, { ...it, definisi: b.definisi_aspek[it.aspek] });
  } else if (/^sk-.*\.json$/.test(f)) {
    const b = read(f) as { dimensi: Record<string, { nama: string; aturan: string }>; items: Sk[] };
    for (const it of b.items) sk.set(it.id, { ...it, ...b.dimensi[it.dimensi] });
  }
}

// Komposisi paket (pedoman §4.1, §4.2)
const ids = manifest.urutan;
assert.equal(new Set(ids).size, ids.length, "ada butir ganda di manifest");
const kpIds = ids.filter((id) => kp.has(id)), skIds = ids.filter((id) => sk.has(id));
assert.equal(kpIds.length + skIds.length, ids.length, "ada id yang tidak ada di bank");
assert.equal(kpIds.length, 48, "Kepribadian harus 48 butir");
assert.equal(skIds.length, 63, "Substansi Khusus harus 63 butir");
assert.deepEqual(ids.slice(0, 48), kpIds, "Kepribadian harus di Bagian 1");
const perAspek = new Map<string, number[]>();
for (const id of kpIds) {
  const it = kp.get(id)!;
  const c = perAspek.get(it.aspek) ?? [0, 0];
  c[it.arah === "favorable" ? 0 : 1]++;
  perAspek.set(it.aspek, c);
}
assert.equal(perAspek.size, 6, "harus 6 aspek");
for (const [a, [f, u]] of perAspek) assert.ok(f === 4 && u === 4, `${a}: harus 4 favorable + 4 unfavorable, dapat ${f}:${u}`);
for (const id of skIds) {
  const t = sk.get(id)!.kembar_dengan;
  if (t) assert.ok(Math.abs(ids.indexOf(id) - ids.indexOf(t)) >= 10, `${id}: kembar terlalu dekat`);
}

const CHOICES_KP = [
  { key: "A", text: "Sangat Tidak Sesuai" },
  { key: "B", text: "Tidak Sesuai" },
  { key: "C", text: "Sesuai" },
  { key: "D", text: "Sangat Sesuai" },
];
const rows = ids.map((id, i) => {
  const base = { type: "KEPRIBADIAN" as const, sequence_number: i + 1, package_number: PKG, is_active: true };
  const k = kp.get(id);
  if (k) {
    return {
      ...base,
      options_payload: { subtes: "KP", statement: k.pernyataan, aspect: k.aspek, choices: CHOICES_KP, bank_id: id },
      scoring_rule: {
        type: "likert4", aspect: k.aspek, polarity: k.arah,
        pembahasan: { definisi_aspek: k.definisi, bedah: k.bedah, alasan: k.alasan, catatan_psikologi: k.catatan_psikologi ?? null },
      } satisfies PribadiRule,
    };
  }
  const s = sk.get(id)!;
  return {
    ...base,
    options_payload: { subtes: "SK", statement: s.situasi, choices: [{ key: "A", text: s.opsi.A }, { key: "B", text: s.opsi.B }], bank_id: id },
    scoring_rule: { type: "forced_choice", dimensi: s.nama, correct_key: s.kunci, pembahasan: `Aturan: ${s.aturan} ${s.pembahasan}` } satisfies PribadiRule,
  };
});
console.log(`Paket ${PKG}: komposisi lolos (48 Kepribadian + 63 Substansi Khusus).`);
if (!APPLY) process.exit(0);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function main() {
  const { count } = await supabase.from("questions").select("id", { count: "exact", head: true }).eq("type", "KEPRIBADIAN").eq("package_number", PKG);
  if (count) throw new Error(`Paket ${PKG} sudah berisi ${count} baris. Hapus dulu secara sadar bila memang ingin mengganti.`);
  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw error;

  // Verifikasi dari DB: jumlah, urutan, dan penilaian jawaban ideal = 100.
  const { data } = await supabase.from("questions").select("sequence_number, options_payload, scoring_rule")
    .eq("type", "KEPRIBADIAN").eq("package_number", PKG).order("sequence_number");
  assert.equal(data?.length, 111);
  const rules = data!.map((r) => r.scoring_rule as unknown as PribadiRule);
  const ideal = summarize(rules.map((rule) => ({ rule, selected: rule.type === "forced_choice" ? rule.correct_key : rule.polarity === "favorable" ? "D" : "A" })));
  assert.equal(ideal.pribadi, 100);
  const allC = summarize(rules.map((rule) => ({ rule, selected: rule.type === "forced_choice" ? "A" : "C" })));
  console.log(`Paket ${PKG}: 111 baris tertulis. Jawaban ideal = ${ideal.pribadi}; semua "Sesuai" + semua A = ${allC.pribadi} (KP ${allC.kp?.nilai}, SK ${allC.sk?.nilai}).`);
}
main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
