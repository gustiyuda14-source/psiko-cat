import assert from "node:assert/strict";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { checkNoLeak, checkRows, checkTeks, data, root, teksRows, type Row, type TeksFile } from "./kecerdasan-teks-lib";

// Simulasi Kecerdasan Paket 2 (package_number 12) dari tiga sumber:
//   prisma/data/kecerdasan_s2_teks.json     (79 soal teks + pembahasan)
//   prisma/data/kecerdasan_s2_figural.json  (11 figural + 6 pola bundar, generate-kecerdasan-figural-s2.ts)
//   prisma/data/kecerdasan_s2_susun.json    (3 susun potongan + 1 ikon, generate-kecerdasan-susun-s2.ts)
// Blueprint: docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md §3.
// Validasi saja:  npx tsx scripts/seed-kecerdasan-s2.ts
// Insert ke DB:   npx tsx scripts/seed-kecerdasan-s2.ts --insert   (menolak kalau paket sudah berisi)
// Pembahasan TIDAK ikut di-insert (options_payload dikirim ke browser saat ujian).

const PKG = 12;

// ── teks ────────────────────────────────────────────────────────────────────
const teks = data("kecerdasan_s2_teks.json") as TeksFile;
const numericChecked = checkTeks(teks);
const fromTeks = teksRows(teks);

// ── gabung ──────────────────────────────────────────────────────────────────
const gambar = [...data("kecerdasan_s2_figural.json"), ...data("kecerdasan_s2_susun.json")] as (Row & { tingkat: number })[];
// Pedoman §5: 0% mudah, 40% sedang, 60% HOTS.
const tingkat = [...teks.soal.map((x) => x.d), ...gambar.map((g) => g.tingkat)];
assert.deepEqual([tingkat.filter((t) => t === 2).length, tingkat.filter((t) => t === 3).length], [40, 60], "komposisi harus 40 sedang + 60 HOTS");
const rows: Row[] = [...fromTeks, ...gambar]
  .map(({ sequence_number, options_payload, scoring_rule }: Row) => ({ sequence_number, options_payload, scoring_rule }))
  .sort((a, b) => a.sequence_number - b.sequence_number);

assert.deepEqual(rows.map((r) => r.sequence_number), Array.from({ length: 100 }, (_, i) => i + 1), "nomor harus 1..100 lengkap");
const dist = checkRows(rows, `pkg ${PKG}`);

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

// Anti-bocor: stem/pilihan tidak boleh sama persis dengan Paket 1, latihan Paket 1, atau bank drill.
checkNoLeak(teks, ["kecerdasan_p2_teks.json"]);

const tiers = { sedang: tingkat.filter((t) => t === 2).length, HOTS: tingkat.filter((t) => t === 3).length };
console.log(`OK: 100 soal (${rows.filter((r) => r.options_payload.is_multi_select).length} dua jawaban, ${svgs.length} bergambar), ${numericChecked} kunci numerik dicek.`);
console.log("Sebaran huruf kunci:", dist, "· tingkat:", tiers);

if (process.argv.includes("--insert")) {
  process.loadEnvFile(path.join(root, ".env.local"));
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
