import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Simulasi Kecerdasan Paket 2 (package_number 12) dari tiga sumber:
//   prisma/data/kecerdasan_s2_teks.json     (79 soal teks + pembahasan)
//   prisma/data/kecerdasan_s2_figural.json  (11 figural + 6 pola bundar, generate-kecerdasan-figural-s2.ts)
//   prisma/data/kecerdasan_s2_susun.json    (3 susun potongan + 1 ikon, generate-kecerdasan-susun-s2.ts)
// Blueprint: docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md §3.
// Validasi saja:  npx tsx scripts/seed-kecerdasan-s2.ts
// Insert ke DB:   npx tsx scripts/seed-kecerdasan-s2.ts --insert   (menolak kalau paket sudah berisi)
// Pembahasan TIDAK ikut di-insert (options_payload dikirim ke browser saat ujian).

const PKG = 12;
const root = path.join(__dirname, "..");
const data = (f: string) => JSON.parse(fs.readFileSync(path.join(root, "prisma/data", f), "utf8"));

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

type Teks = { s: number; t: string; d: number; q?: string; w?: string; i?: string; c: string[]; k: string; h?: string; p: string };
type Row = {
  sequence_number: number;
  options_payload: Record<string, unknown> & { choices: { key: string; text: string }[]; is_multi_select: boolean; svg_content: string | null };
  scoring_rule: { type: string; correct_key: string };
};

// ── teks ────────────────────────────────────────────────────────────────────
const teks = data("kecerdasan_s2_teks.json") as { wacana: Record<string, string>; soal: Teks[] };
for (const x of teks.soal) {
  assert.ok(x.p && x.p.length > 40, `soal ${x.s}: pembahasan kosong`);
  assert.ok([2, 3].includes(x.d), `soal ${x.s}: tingkat harus 2 (sedang) atau 3 (HOTS), tidak ada soal mudah`);
  assert.ok(!x.w || teks.wacana[x.w], `soal ${x.s}: wacana ${x.w} tidak ada`);
  // Pembahasan menyebut kunci yang sama dengan field k (huruf, atau isi opsi kunci).
  const keyTexts = [...x.k].map((l) => x.c[KEYS.indexOf(l as (typeof KEYS)[number])]);
  assert.ok([...x.k].every((l, n) => x.p.includes(`(${l})`) || x.p.includes(`Jawaban: ${l}`) || x.p.includes(keyTexts[n])), `soal ${x.s}: pembahasan tidak menyebut kunci ${x.k}`);
}

// Cek kunci numerik: ekspresi h harus sama dengan nilai opsi kunci.
const F = (a: number, b: number) => a / b;
function value(text: string, t: Teks): number {
  const jm = text.match(/^(\d+) jam(?: (\d+) menit)?$/);
  if (jm) return +jm[1] + +(jm[2] ?? 0) / 60;
  const mixed = text.match(/^(\d+) (\d+)\/(\d+)$/);
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3];
  const s = text.replace(/Rp\s?/g, "").replace(/,00$/, "").replace(/\s(buah|m²|m|menit|hari|liter)$/, "").replace("%", "").replace("−", "-").trim();
  let m;
  if ((m = s.match(/^(\d{2})\.(\d{2})$/)) && /pukul/.test(t.i ?? "")) return +m[1] + +m[2] / 60;
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return +m[1] / +m[2];
  return Number(s.replace(/\./g, "").replace(",", "."));
}
let numericChecked = 0;
for (const x of teks.soal.filter((x) => x.h)) {
  const expected = new Function("F", `return ${x.h}`)(F) as number;
  const got = value(x.c[KEYS.indexOf(x.k as (typeof KEYS)[number])], x);
  assert.ok(Math.abs(expected - got) < 1e-9, `soal ${x.s}: kunci ${x.k} (${got}) ≠ hitungan ${expected}`);
  // tidak boleh ada opsi lain yang bernilai sama
  assert.equal(x.c.filter((c) => Math.abs(value(c, x) - expected) < 1e-9).length, 1, `soal ${x.s}: lebih dari satu opsi bernilai benar`);
  numericChecked++;
}

const fromTeks: Row[] = teks.soal.map((x) => {
  const instruksi = x.i ?? INSTRUKSI[x.t];
  assert.ok(instruksi, `soal ${x.s}: instruksi kosong`);
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

// ── gabung ──────────────────────────────────────────────────────────────────
const gambar = [...data("kecerdasan_s2_figural.json"), ...data("kecerdasan_s2_susun.json")] as (Row & { tingkat: number })[];
// Pedoman §5: 0% mudah, 40% sedang, 60% HOTS.
const tingkat = [...teks.soal.map((x) => x.d), ...gambar.map((g) => g.tingkat)];
assert.deepEqual([tingkat.filter((t) => t === 2).length, tingkat.filter((t) => t === 3).length], [40, 60], "komposisi harus 40 sedang + 60 HOTS");
const rows: Row[] = [...fromTeks, ...gambar]
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
  assert.ok(!("pembahasan" in r.options_payload), `soal ${r.sequence_number}: pembahasan bocor ke payload`);
}

// Blueprint §3: tipe per rentang nomor.
const typeOf = new Map(teks.soal.map((x) => [x.s, x.t]));
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const expectTeks: [number, number, string][] = [
  [1, 5, "SIN"], [6, 10, "ANT"], [11, 15, "ANA"], [16, 19, "ODD"], [20, 25, "BAC"], [41, 50, "SIL"],
  [57, 64, "DER"], [65, 75, "WAC"], [76, 98, "*"], [99, 99, "KUA"], [100, 100, "KCK"],
];
for (const [a, b, t] of expectTeks) for (const s of range(a, b)) assert.ok(t === "*" ? ["HIT", "CRT"].includes(typeOf.get(s)!) : typeOf.get(s) === t, `soal ${s}: tipe ${typeOf.get(s)} ≠ ${t}`);
const svgSeq = rows.filter((r) => r.options_payload.svg_content).map((r) => r.sequence_number);
assert.deepEqual(svgSeq, [...range(26, 40), ...range(51, 56)], "soal bergambar harus 26-40 dan 51-56");

const svgs = rows.map((r) => r.options_payload.svg_content).filter(Boolean) as string[];
const ids = svgs.flatMap((s) => [...s.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
assert.equal(new Set(ids).size, ids.length, "id SVG harus unik antar soal (dirender satu halaman)");
assert.ok(svgs.every((s) => !/<script|<image|<style|href="(?!#)/.test(s)), "SVG tanpa script/image/style/href luar");

// Anti-bocor: stem/pilihan tidak boleh sama persis dengan Paket 1, latihan Paket 2, atau bank drill.
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.…]+/g, "").trim();
const seen = new Set<string>();
const p1 = JSON.parse(fs.readFileSync(path.join(root, "soal.json"), "utf8")) as { soal: { soal?: string | null; instruksi?: string; pilihan: Record<string, string> }[] };
for (const q of p1.soal) { if (q.soal) seen.add(norm(q.soal)); seen.add(norm(Object.values(q.pilihan).sort().join("|"))); }
const p2 = data("kecerdasan_p2_teks.json") as { soal: { q?: string; i?: string; c: string[] }[] };
for (const q of p2.soal) { if (q.q) seen.add(norm(q.q)); if (q.i) seen.add(norm(q.i)); seen.add(norm([...q.c].sort().join("|"))); }
const drill = JSON.parse(fs.readFileSync(path.join(root, "data/drill-bank.json"), "utf8")) as { stem: string; opsi: Record<string, string> }[];
for (const q of drill) { seen.add(norm(q.stem)); seen.add(norm(Object.values(q.opsi).sort().join("|"))); }
for (const x of teks.soal) {
  for (const s of [x.q, x.t === "WAC" || x.t === "BAC" ? undefined : x.i].filter(Boolean) as string[]) assert.ok(!seen.has(norm(s)), `soal ${x.s}: stem sama dengan soal lain`);
  // opsi baku kecukupan data memang sama di semua soal KCK
  if (x.t !== "KCK") assert.ok(!seen.has(norm([...x.c].sort().join("|"))), `soal ${x.s}: pilihan sama persis dengan soal lain`);
}

// Sebaran kunci (huruf) dan tingkat.
const dist = rows.reduce<Record<string, number>>((m, r) => { for (const k of r.scoring_rule.correct_key) m[k] = (m[k] ?? 0) + 1; return m; }, {});
assert.ok(Object.values(dist).every((n) => n <= 30), `sebaran kunci timpang: ${JSON.stringify(dist)}`);
const tiers = { sedang: tingkat.filter((t) => t === 2).length, HOTS: tingkat.filter((t) => t === 3).length };
console.log(`OK: 100 soal (${rows.filter((r) => r.options_payload.is_multi_select).length} dua jawaban, ${svgs.length} bergambar), ${numericChecked} kunci numerik dicek.`);
console.log("Sebaran huruf kunci:", dist, "· tingkat:", tiers);

if (process.argv.includes("--insert")) {
  dotenv.config({ path: path.join(root, ".env.local") });
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
