import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Gabung Paket latihan Kecerdasan package_number 2 dari tiga sumber:
//   prisma/data/kecerdasan_p2_teks.json   (88 soal teks, format ringkas)
//   prisma/data/kecerdasan_p2_pola.json   (8 pola gambar, generate-kecerdasan-pola-p2.ts)
//   prisma/data/kecerdasan_p2_susun.json  (4 menyusun gambar, generate-kecerdasan-susun-p2.ts)
// Validasi saja:  npx tsx scripts/seed-kecerdasan-p2.ts
// Insert ke DB:   npx tsx scripts/seed-kecerdasan-p2.ts --insert   (menolak kalau paket sudah berisi)

const PKG = 2;
const data = (f: string) => JSON.parse(fs.readFileSync(path.join(__dirname, "../prisma/data", f), "utf8"));

const INSTRUKSI: Record<string, string> = {
  SIN: "Pilihlah dua kata yang memiliki makna yang sama.",
  ANT: "Pilihlah dua kata yang memiliki makna yang berlawanan.",
  ANA: "Pilihlah dua kata yang tepat untuk melengkapi soal berikut ini.",
  ODD: "Pilihlah satu kata yang memiliki makna yang paling jauh dari 4 kata lainnya.",
  SIL: "Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.",
  DER: "Pilihlah dua jawaban untuk melengkapi deret berikut.",
};
const GANDA = new Set(["SIN", "ANT", "ANA", "DER"]);
const KEYS = ["A", "B", "C", "D", "E"] as const;

type Teks = { s: number; t: string; q?: string; w?: string; i?: string; c: string[]; k: string };
type Row = { sequence_number: number; options_payload: Record<string, unknown> & { choices: { key: string; text: string }[]; is_multi_select: boolean }; scoring_rule: { type: string; correct_key: string } };

const teks = data("kecerdasan_p2_teks.json") as { wacana: Record<string, string>; soal: Teks[] };
const fromTeks: Row[] = teks.soal.map((x) => {
  const instruksi = x.i ?? INSTRUKSI[x.t];
  assert.ok(instruksi, `soal ${x.s}: instruksi kosong`);
  assert.ok(!x.w || teks.wacana[x.w], `soal ${x.s}: wacana ${x.w} tidak ada`);
  return {
    sequence_number: x.s,
    options_payload: {
      instruksi,
      question_text: x.q ?? null,
      sub_text: x.w ? teks.wacana[x.w] : null,
      svg_content: null,
      is_multi_select: GANDA.has(x.t),
      choices: x.c.map((text, n) => ({ key: KEYS[n], text })),
    },
    scoring_rule: { type: "dichotomous", correct_key: x.k },
  };
});

const rows: Row[] = [...fromTeks, ...data("kecerdasan_p2_pola.json"), ...data("kecerdasan_p2_susun.json")]
  .map(({ sequence_number, options_payload, scoring_rule }: Row) => ({ sequence_number, options_payload, scoring_rule }))
  .sort((a, b) => a.sequence_number - b.sequence_number);

assert.deepEqual(rows.map((r) => r.sequence_number), Array.from({ length: 100 }, (_, i) => i + 1), "nomor harus 1..100 lengkap");
for (const r of rows) {
  const { choices, is_multi_select } = r.options_payload;
  const key = r.scoring_rule.correct_key;
  assert.equal(choices.length, 5, `soal ${r.sequence_number}: harus 5 pilihan`);
  assert.equal(new Set(choices.map((c) => c.text)).size, 5, `soal ${r.sequence_number}: pilihan kembar`);
  assert.match(key, is_multi_select ? /^[A-E]{2}$/ : /^[A-E]$/, `soal ${r.sequence_number}: kunci ${key}`);
  assert.equal([...key].sort().join(""), key, `soal ${r.sequence_number}: kunci ganda harus urut`);
}
const svgs = rows.map((r) => r.options_payload.svg_content as string | null).filter(Boolean) as string[];
assert.equal(svgs.length, 12, "12 soal gambar (8 pola + 4 susun)");
const ids = svgs.flatMap((s) => [...s.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
assert.equal(new Set(ids).size, ids.length, "id SVG harus unik antar soal (dirender satu halaman)");
assert.ok(svgs.every((s) => !/<script|<image|<style/.test(s)), "SVG tanpa script/image/style global");

const dist = rows.reduce<Record<string, number>>((m, r) => { for (const k of r.scoring_rule.correct_key) m[k] = (m[k] ?? 0) + 1; return m; }, {});
console.log(`OK: 100 soal, ${rows.filter((r) => r.options_payload.is_multi_select).length} soal dua jawaban. Sebaran huruf kunci:`, dist);

if (process.argv.includes("--insert")) {
  dotenv.config({ path: path.join(__dirname, "../.env.local") });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  (async () => {
    const { count, error: e1 } = await supabase.from("questions").select("id", { count: "exact", head: true }).eq("type", "KECERDASAN").eq("package_number", PKG);
    if (e1) throw e1;
    if (count) throw new Error(`Paket ${PKG} sudah berisi ${count} soal — tidak ditimpa.`);
    const { error } = await supabase.from("questions").insert(rows.map((r) => ({ type: "KECERDASAN", package_number: PKG, column_index: null, is_active: true, ...r })));
    if (error) throw error;
    console.log(`Inserted 100 soal KECERDASAN package_number=${PKG}.`);
  })();
}
