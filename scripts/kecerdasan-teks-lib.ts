import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Soal teks Kecerdasan (format ringkas kecerdasan_s2_teks.json / kecerdasan_p3_teks.json) →
// baris tabel questions, plus cek bersama: pembahasan menyebut kunci, tingkat 2/3, kunci numerik
// (field h) dihitung ulang, dan anti-bocor terhadap Paket 1, latihan Paket 1, s2, serta bank drill.
// Dipakai seed-kecerdasan-s2.ts dan seed-kecerdasan-kal.ts.

export const root = path.join(__dirname, "..");
export const data = (f: string) => JSON.parse(fs.readFileSync(path.join(root, "prisma/data", f), "utf8"));

export const INSTRUKSI: Record<string, string> = {
  SIN: "Pilihlah dua kata yang memiliki makna yang sama.",
  ANT: "Pilihlah dua kata yang memiliki makna yang berlawanan.",
  ANA: "Pilihlah dua kata yang tepat untuk melengkapi soal berikut ini.",
  ODD: "Pilihlah satu kata yang memiliki makna yang paling jauh dari 4 kata lainnya.",
  SIL: "Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.",
  // Pedoman Kecerdasan v3 §4.8: paket yang disusun mulai 2026-10-13 (pkg 4, 5, …).
  SIL_V3: "Anggap semua pernyataan berikut benar, lalu pilihlah satu kesimpulan yang tepat.",
  DER: "Pilihlah dua jawaban untuk melengkapi deret berikut.",
};
const GANDA = new Set(["SIN", "ANT", "ANA", "DER"]);
export const KEYS = ["A", "B", "C", "D", "E"] as const;

export type Teks = { s: number; t: string; d: number; q?: string; w?: string; i?: string; c: string[]; k: string; h?: string; p: string; svg?: string | null };
export type TeksFile = { wacana: Record<string, string>; soal: Teks[] };
export type Row = {
  sequence_number: number;
  options_payload: Record<string, unknown> & { choices: { key: string; text: string }[]; is_multi_select: boolean; svg_content: string | null };
  scoring_rule: { type: string; correct_key: string };
};

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

/** Cek isi teks; mengembalikan jumlah kunci numerik yang dihitung ulang. */
export function checkTeks(teks: TeksFile): number {
  for (const x of teks.soal) {
    assert.ok(x.p && x.p.length > 40, `soal ${x.s}: pembahasan kosong`);
    assert.ok([2, 3].includes(x.d), `soal ${x.s}: tingkat harus 2 (sedang) atau 3 (HOTS), tidak ada soal mudah`);
    assert.ok(!x.w || teks.wacana[x.w], `soal ${x.s}: wacana ${x.w} tidak ada`);
    // Pembahasan menyebut kunci yang sama dengan field k (huruf, atau isi opsi kunci).
    const keyTexts = [...x.k].map((l) => x.c[KEYS.indexOf(l as (typeof KEYS)[number])]);
    assert.ok([...x.k].every((l, n) => x.p.includes(`(${l})`) || x.p.includes(`Jawaban: ${l}`) || x.p.includes(keyTexts[n])), `soal ${x.s}: pembahasan tidak menyebut kunci ${x.k}`);
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
  return numericChecked;
}

/** `v3`: silogisme memakai INSTRUKSI.SIL_V3 (paket baru ≥ 4). `svg` = tabel kecukupan data. */
export const teksRows = (teks: TeksFile, v3 = false): Row[] => teks.soal.map((x) => {
  const instruksi = x.i ?? INSTRUKSI[v3 && x.t === "SIL" ? "SIL_V3" : x.t];
  assert.ok(instruksi, `soal ${x.s}: instruksi kosong`);
  return {
    sequence_number: x.s,
    options_payload: {
      instruksi,
      question_text: x.q ?? null,
      sub_text: x.w ? teks.wacana[x.w] : null,
      svg_content: x.svg ?? null,
      is_multi_select: GANDA.has(x.t),
      choices: x.c.map((text, n) => ({ key: KEYS[n], text })),
    },
    scoring_rule: { type: "dichotomous", correct_key: x.k },
  };
});

// Field i tipe ini adalah pertanyaan wacana atau instruksi baku (KUA/KCK), bukan stem.
const GENERIK = new Set(["WAC", "BAC", "KUA", "KCK"]);
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.…]+/g, "").trim();
/**
  Anti-bocor: stem/pilihan tidak boleh sama persis dengan Paket 1 (soal.json), bank teks lain
  (`others`, nama file di prisma/data: format { soal } atau { "<pkg>": soal[] } seperti kecerdasan_kck_kal.json), atau bank drill.
*/
export function checkNoLeak(teks: TeksFile, others: string[]) {
  const seen = new Set<string>();
  const p1 = JSON.parse(fs.readFileSync(path.join(root, "soal.json"), "utf8")) as { soal: { soal?: string | null; instruksi?: string; pilihan: Record<string, string> }[] };
  for (const q of p1.soal) { if (q.soal) seen.add(norm(q.soal)); seen.add(norm(Object.values(q.pilihan).sort().join("|"))); }
  for (const f of others) {
    const o = data(f);
    for (const q of (o.soal ?? Object.values(o).flat()) as { t: string; q?: string; i?: string; c: string[] }[]) { if (q.q) seen.add(norm(q.q)); if (q.i && !GENERIK.has(q.t)) seen.add(norm(q.i)); if (q.t !== "KCK") seen.add(norm([...q.c].sort().join("|"))); }
  }
  const drill = JSON.parse(fs.readFileSync(path.join(root, "data/drill-bank.json"), "utf8")) as { stem: string; opsi: Record<string, string> }[];
  for (const q of drill) { seen.add(norm(q.stem)); seen.add(norm(Object.values(q.opsi).sort().join("|"))); }
  for (const x of teks.soal) {
    for (const s of [x.q, GENERIK.has(x.t) ? undefined : x.i].filter(Boolean) as string[]) assert.ok(!seen.has(norm(s)), `soal ${x.s}: stem sama dengan soal lain`);
    // opsi baku kecukupan data memang sama di semua soal KCK
    if (x.t !== "KCK") assert.ok(!seen.has(norm([...x.c].sort().join("|"))), `soal ${x.s}: pilihan sama persis dengan soal lain`);
  }
}

/** Cek baris satu paket: 5 pilihan unik, format kunci, id SVG unik, SVG aman, sebaran huruf kunci. */
export function checkRows(rows: Row[], tag: string, legacy = new Set<number>(), max = 30) {
  for (const r of rows) {
    const { choices, is_multi_select } = r.options_payload;
    const key = r.scoring_rule.correct_key;
    assert.equal(choices.length, 5, `${tag} #${r.sequence_number}: harus 5 pilihan`);
    assert.equal(new Set(choices.map((c) => c.text)).size, 5, `${tag} #${r.sequence_number}: pilihan kembar`);
    assert.match(key, is_multi_select ? /^[A-E]{2}$/ : /^[A-E]$/, `${tag} #${r.sequence_number}: kunci ${key}`);
    assert.equal([...key].sort().join(""), key, `${tag} #${r.sequence_number}: kunci ganda harus urut`);
    assert.ok(!("pembahasan" in r.options_payload), `${tag} #${r.sequence_number}: pembahasan bocor ke payload`);
  }
  const svgs = rows.map((r) => r.options_payload.svg_content).filter(Boolean) as string[];
  const ids = svgs.flatMap((s) => [...s.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  assert.equal(new Set(ids).size, ids.length, `${tag}: id SVG harus unik antar soal (dirender satu halaman)`);
  // `legacy`: salinan butir lama yang sudah tayang (SVG Paket 1 memakai <style>); butir baru tetap wajib bersih.
  for (const r of rows) if (r.options_payload.svg_content && !legacy.has(r.sequence_number)) assert.ok(!/<script|<image|<style|href="(?!#)/.test(r.options_payload.svg_content), `${tag} #${r.sequence_number}: SVG tanpa script/image/style/href luar`);
  const dist = rows.reduce<Record<string, number>>((m, r) => { for (const k of r.scoring_rule.correct_key) m[k] = (m[k] ?? 0) + 1; return m; }, {});
  assert.ok(Object.values(dist).every((n) => n <= max), `${tag}: sebaran kunci timpang (maks ${max}/huruf): ${JSON.stringify(dist)}`);
  return dist;
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
/** Blok Praktis v3 (pedoman Kecerdasan §3 rev. 2026-10-13). */
export const LAYOUT_V3: [number, number, string][] = [[76, 90, "HIT"], [91, 96, "CRT"], [97, 100, "KCK"]];

/** Validator layout v3: 76–90 HIT, 91–96 CRT, 97–100 KCK (4 kunci beda, ada C/E), tanpa KUA. `t` kosong = butir di luar blok Praktis. */
export function checkLayout(pkg: number, final: { row: Row; t: string }[], max = 30) {
  assert.deepEqual(final.map((f) => f.row.sequence_number), range(1, 100), `pkg ${pkg}: nomor harus 1..100`);
  for (const [a, b, t] of LAYOUT_V3) for (const s of range(a, b)) assert.equal(final[s - 1].t, t, `pkg ${pkg} #${s}: tipe ${final[s - 1].t} ≠ ${t}`);
  assert.ok(!final.some((f) => f.t === "KUA"), `pkg ${pkg}: masih ada KUA`);
  const keys = final.slice(96).map((f) => f.row.scoring_rule.correct_key);
  assert.equal(new Set(keys).size, 4, `pkg ${pkg}: kunci KCK 97–100 harus 4 huruf beda (${keys})`);
  assert.ok(keys.some((k) => k === "C" || k === "E"), `pkg ${pkg}: KCK wajib punya kunci C atau E`);
  return checkRows(final.map((f) => f.row), `pkg ${pkg}`, new Set(), max);
}

// Pedoman utama A-7: soal baru tanpa unsur kepolisian (stem, opsi, wacana, pembahasan, gambar).
const A7 = /\b(?:polisi|kepolisian|polri|polres|polsek|polda|bhayangkara|brimob|satlantas|kapolres|kapolsek|kapolda|bintara|taruna|akpol|reserse|penyidik|patroli|tilang|razia|tkp|operasi zebra)\b/gi;
/** Tolak kata terlarang A-7 di mana pun dalam `value` (seluruh isi di-JSON-kan). Hanya untuk paket baru (≥ 4, mulai 2026-10-13). */
export function checkA7(tag: string, value: unknown) {
  const hits = [...new Set([...JSON.stringify(value).matchAll(A7)].map((m) => m[0].toLowerCase()))];
  assert.equal(hits.length, 0, `${tag}: unsur kepolisian (pedoman A-7): ${hits.join(", ")}`);
}
