import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { checkNoLeak, checkRows, checkTeks, data, root, teksRows, type Row, type Teks, type TeksFile } from "./kecerdasan-teks-lib";

// Blok kecukupan data 4 butir (pedoman Simulasi Kecerdasan §3 Praktis rev. 2026-10-13, §4.7) untuk paket live 3, 14, 15, 16.
// Diubah di tempat, pola pkg 2 di seed-kecerdasan-kal.ts:
//   lama: 76–98 HIT/CRT · 99 KUA · 100 KCK
//   baru: 76–90 HIT (cepat 7 · pecahan/persen/akar 5 · konversi 3) · 91–96 CRT · 97–99 KCK baru · 100 KCK lama
// Dibuang per paket: KUA #99 (tingkat 3) + 1 butir tingkat 2 + 1 butir tingkat 3 (DROP); butir baru 1×tingkat 2 + 2×tingkat 3,
// jadi tetap 40 sedang / 60 HOTS. Butir lama tidak diubah isinya (pembahasan juga tidak), hanya nomornya.
// Butir baru: prisma/data/kecerdasan_kck_kal.json { "3": [3 butir], … } (generate-kecerdasan-kck-kal.ts, cek: check-kecerdasan-kck.ts).
// Paket simulasi yang sudah punya sesi (14, 16) TIDAK diubah di tempat (review sesi lama jadi 103 kartu):
// disalin ke paket baru dengan blok baru (14 → 17, 16 → 18), lalu SIMULASI_PAKET dipindah. Latihan 3 dan 15 di tempat.
//   Validasi (baca DB saja):  npx tsx scripts/seed-kecerdasan-kck.ts [--kck file.json]
//   Ubah di tempat:           npx tsx scripts/seed-kecerdasan-kck.ts --apply 15
//   Salin ke paket baru:      npx tsx scripts/seed-kecerdasan-kck.ts --copy 14

process.loadEnvFile(path.join(root, ".env.local"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type DbRow = Row & { id: string; is_active: boolean };
type Kck = Teks & { jenis?: string; tabel?: unknown; svg?: string | null; bukti?: string };
type NewRow = Omit<Row, "scoring_rule"> & { scoring_rule: Row["scoring_rule"] & { pembahasan: string } };
type Info = { t: string; d: number };

// Sumber teks butir lama (pkg 14 = salinan pkg 12, blok 76–100 tidak digeser).
const TEKS: Record<number, string> = { 3: "kecerdasan_p3_teks.json", 14: "kecerdasan_s2_teks.json", 15: "kecerdasan_p15_teks.json", 16: "kecerdasan_p16_teks.json", 17: "kecerdasan_s2_teks.json", 18: "kecerdasan_p16_teks.json" };
// Sumber → paket simulasi baru (salinan + blok KCK). Butir KCK baru diambil dari kunci paket sumber.
const COPY: Record<number, number> = { 14: 17, 16: 18 };
const IN_PLACE = [3, 15];
// Nomor lama yang dinonaktifkan: [tingkat 2, tingkat 3, KUA]. Sisa 76–98 dinomori ulang berurutan.
//   3:  84 pangkat (83 & 88 masih pangkat) · 92 durasi jam (paling mirip soal cerita)
//   14: 89 konversi volume (satu-satunya konversi tingkat 2) · 87 persen naik-turun (bertipe CRT di blok hitung; CRT jadi pas 6)
//   15: 90 konversi kecepatan · 88 pecahan bertingkat bentuk cerita
//   16: 89 konversi waktu · 88 pecahan tangki bentuk cerita
const DROP: Record<number, number[]> = { 3: [84, 92, 99], 14: [89, 87, 99], 15: [90, 88, 99], 16: [89, 88, 99] };
const LAYOUT: [number, number, string][] = [[76, 90, "HIT"], [91, 96, "CRT"], [97, 100, "KCK"]];

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const arg = (flag: string) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : undefined);
const kckFile = path.resolve(arg("--kck") ?? path.join(root, "prisma/data/kecerdasan_kck_kal.json"));
const fp = (p: Row["options_payload"], key: string) => JSON.stringify([p.instruksi ?? null, p.question_text ?? null, p.sub_text ?? null, p.choices.map((c) => c.text), key]);
const stem = (r: Row) => String(r.options_payload.question_text ?? r.options_payload.instruksi ?? "").replace(/\s+/g, " ").slice(0, 70);

async function fetchPkg(pkg: number, activeOnly = true): Promise<DbRow[]> {
  let q = supabase.from("questions").select("id, sequence_number, options_payload, scoring_rule, is_active").eq("type", "KECERDASAN").eq("package_number", pkg);
  if (activeOnly) q = q.eq("is_active", true);
  const { data: rows, error } = await q.order("sequence_number");
  if (error) throw error;
  return rows as unknown as DbRow[];
}

/** Tipe & tingkat butir lama, dicocokkan lewat isi (bukan nomor) dengan file teks paketnya. */
function infoMap(pkg: number): Map<string, Info> {
  const teks = data(TEKS[pkg]) as TeksFile;
  const rows = teksRows(teks);
  return new Map(rows.map((r, i) => [fp(r.options_payload, r.scoring_rule.correct_key), { t: teks.soal[i].t, d: teks.soal[i].d }]));
}

/** Butir baru K1 → baris questions. Opsi & instruksi wajib identik dengan KCK lama #100 paket itu. */
function freshRows(pkg: number, items: Kck[], oldKck: Row): NewRow[] {
  assert.deepEqual(items.map((x) => x.s), [97, 98, 99], `pkg ${pkg}: butir baru harus nomor 97, 98, 99`);
  assert.ok(items.every((x) => x.t === "KCK"), `pkg ${pkg}: butir baru harus KCK`);
  assert.deepEqual(items.map((x) => x.d).sort(), [2, 3, 3], `pkg ${pkg}: butir baru harus 1 tingkat 2 + 2 tingkat 3`);
  checkTeks({ wacana: {}, soal: items });
  return teksRows({ wacana: {}, soal: items }).map((r, n) => {
    const x = items[n];
    assert.equal(r.options_payload.instruksi, oldKck.options_payload.instruksi, `pkg ${pkg} #${x.s}: instruksi ≠ KCK #100`);
    assert.deepEqual(r.options_payload.choices, oldKck.options_payload.choices, `pkg ${pkg} #${x.s}: opsi ≠ opsi baku KCK #100`);
    assert.ok(x.svg === undefined || x.svg === null || /^<svg[\s>]/.test(x.svg), `pkg ${pkg} #${x.s}: svg tidak sah`);
    // `tabel` dan `bukti` sengaja tidak ikut: options_payload terkirim ke browser.
    return {
      sequence_number: x.s,
      options_payload: { ...r.options_payload, svg_content: x.svg ?? null },
      scoring_rule: { ...r.scoring_rule, pembahasan: x.p.replaceAll("<br>", "\n").trim() },
    };
  });
}

/** Validator layout baru: 76–90 HIT, 91–96 CRT, 97–100 KCK (4 kunci beda, ada C/E), tanpa KUA. */
function checkLayout(pkg: number, final: { row: Row; t: string }[]) {
  assert.deepEqual(final.map((f) => f.row.sequence_number), range(1, 100), `pkg ${pkg}: nomor harus 1..100`);
  for (const [a, b, t] of LAYOUT) for (const s of range(a, b)) assert.equal(final[s - 1].t, t, `pkg ${pkg} #${s}: tipe ${final[s - 1].t} ≠ ${t}`);
  assert.ok(!final.some((f) => f.t === "KUA"), `pkg ${pkg}: masih ada KUA`);
  const keys = final.slice(96).map((f) => f.row.scoring_rule.correct_key);
  assert.equal(new Set(keys).size, 4, `pkg ${pkg}: kunci KCK 97–100 harus 4 huruf beda (${keys})`);
  assert.ok(keys.some((k) => k === "C" || k === "E"), `pkg ${pkg}: KCK wajib punya kunci C atau E`);
  return checkRows(final.map((f) => f.row), `pkg ${pkg}`);
}

type Plan = { moves: [string, number][]; drop: string[]; fresh: NewRow[]; final: { row: Row; t: string }[] };

function plan(pkg: number, live: DbRow[], items: Kck[] | undefined): Plan | null {
  assert.deepEqual(live.map((r) => r.sequence_number), range(1, 100), `pkg ${pkg}: harus 100 soal aktif bernomor 1..100`);
  const info = infoMap(pkg);
  const at = (s: number) => live[s - 1];
  const inf = (s: number) => info.get(fp(at(s).options_payload, at(s).scoring_rule.correct_key)) ?? assert.fail(`pkg ${pkg} #${s}: tidak cocok dengan ${TEKS[pkg]}`);
  // Komposisi lama: 76–98 HIT/CRT, 99 KUA, 100 KCK.
  for (const s of range(76, 98)) assert.ok(["HIT", "CRT"].includes(inf(s).t), `pkg ${pkg} #${s}: tipe ${inf(s).t}`);
  assert.equal(inf(99).t, "KUA", `pkg ${pkg} #99 harus KUA`);
  assert.equal(inf(100).t, "KCK", `pkg ${pkg} #100 harus KCK`);
  const dropSeq = DROP[pkg];
  assert.deepEqual(dropSeq.map((s) => inf(s).d), [2, 3, 3], `pkg ${pkg}: butir buang harus tingkat [2, 3, 3(KUA)]`);
  for (const s of dropSeq) console.log(`  buang #${s} ${inf(s).t} t${inf(s).d}: ${stem(at(s))}`);
  if (!items) return null;
  const fresh = freshRows(pkg, items, at(100));
  const keep = range(76, 98).filter((s) => !dropSeq.includes(s));
  const moved = keep.map((s, i) => ({ row: { ...at(s), sequence_number: 76 + i }, t: inf(s).t, id: at(s).id, from: s }));
  const final = [
    ...range(1, 75).map((s) => ({ row: at(s) as Row, t: "" })),
    ...moved,
    ...fresh.map((row) => ({ row: row as Row, t: "KCK" })),
    { row: at(100) as Row, t: "KCK" },
  ];
  return { moves: moved.filter((m) => m.from !== m.row.sequence_number).map((m) => [m.id, m.row.sequence_number]), drop: dropSeq.map((s) => at(s).id), fresh, final };
}

/** Sudah dipasang bila #99 aktif berisi opsi baku KCK (sebelumnya KUA). */
const installed = (live: DbRow[]) => live.length === 100 && JSON.stringify(live[98]?.options_payload.choices) === JSON.stringify(live[99]?.options_payload.choices);

/** Validasi paket yang sudah dipasang langsung dari DB. */
function checkLive(pkg: number, live: DbRow[]) {
  const info = infoMap(pkg);
  const kckChoices = JSON.stringify(live[99]?.options_payload.choices);
  const typeOf = (r: DbRow) => (JSON.stringify(r.options_payload.choices) === kckChoices ? "KCK" : info.get(fp(r.options_payload, r.scoring_rule.correct_key))?.t ?? "?");
  const final = live.map((r) => ({ row: r as Row, t: r.sequence_number <= 75 ? "" : typeOf(r) }));
  return checkLayout(pkg, final);
}

async function apply(pkg: number, p: Plan) {
  // Jangan ubah paket yang sedang dikerjakan (halaman ujian memuat soal aktif saat dibuka ulang).
  const { data: mods, error: e0 } = await supabase.from("module_sessions").select("id, started_at, time_limit_seconds").eq("module_type", "KECERDASAN").eq("package_number", pkg).eq("status", "IN_PROGRESS");
  if (e0) throw e0;
  const live = (mods ?? []).filter((m) => m.started_at && Date.parse(m.started_at) + (Number(m.time_limit_seconds) + 120) * 1000 > Date.now());
  if (live.length) throw new Error(`Paket ${pkg}: ${live.length} module Kecerdasan masih berjalan — coba lagi setelah waktunya habis.`);

  const base = { type: "KECERDASAN", package_number: pkg, column_index: null };
  const { data: ins, error: e1 } = await supabase.from("questions").insert(p.fresh.map((r) => ({ ...base, is_active: false, ...r }))).select("id");
  if (e1) throw e1;
  for (const [id, seq] of p.moves) {
    const { error } = await supabase.from("questions").update({ sequence_number: seq }).eq("id", id);
    if (error) throw error;
  }
  const { error: e2 } = await supabase.from("questions").update({ is_active: false }).in("id", p.drop);
  if (e2) throw e2;
  const { error: e3 } = await supabase.from("questions").update({ is_active: true }).in("id", ins!.map((r) => r.id));
  if (e3) throw e3;
  const after = await fetchPkg(pkg);
  checkLive(pkg, after);
  console.log(`Paket ${pkg}: ${p.moves.length} butir dinomori ulang, ${p.drop.length} dinonaktifkan, ${p.fresh.length} KCK baru. Layout baru lolos.`);
}

/** Salin paket sumber (sesudah blok baru) ke paket kosong `target`; paket sumber tidak disentuh. */
async function copy(target: number, p: Plan) {
  const { count, error: e0 } = await supabase.from("questions").select("id", { count: "exact", head: true }).eq("type", "KECERDASAN").eq("package_number", target);
  if (e0) throw e0;
  if (count) throw new Error(`Paket ${target} sudah berisi ${count} soal — tidak ditimpa.`);
  const rows = p.final.map(({ row }) => ({ type: "KECERDASAN", package_number: target, column_index: null, is_active: true, sequence_number: row.sequence_number, options_payload: row.options_payload, scoring_rule: row.scoring_rule }));
  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw error;
  checkLive(target, await fetchPkg(target));
  console.log(`Paket ${target}: 100 soal disalin (${p.drop.length} buang, ${p.fresh.length} KCK baru). Layout baru lolos.`);
}

(async () => {
  const src = arg("--copy") !== undefined ? Number(arg("--copy")) : null;
  if (src !== null) assert.ok(src in COPY, `--copy hanya untuk paket ${Object.keys(COPY)}`);
  const only = arg("--apply") !== undefined ? Number(arg("--apply")) : src;
  if (arg("--apply") !== undefined) assert.ok(IN_PLACE.includes(only!), `--apply hanya untuk paket ${IN_PLACE}; paket simulasi pakai --copy`);
  if (src === null) for (const [from, to] of Object.entries(COPY)) {
    const t = await fetchPkg(to);
    if (t.length) console.log(`OK pkg ${to} (salinan ${from}, sudah di DB) · kunci ${JSON.stringify(checkLive(to, t))}`);
  }
  const kck = fs.existsSync(kckFile) ? (JSON.parse(fs.readFileSync(kckFile, "utf8")) as Record<string, Kck[]>) : null;
  if (!kck) console.log(`(belum ada ${path.relative(root, kckFile)} — hanya cek butir lama & butir buang)`);
  if (kck) {
    const all = Object.values(kck).flat();
    assert.equal(new Set(all.map((x) => x.q)).size, all.length, "stem KCK baru kembar antarpaket");
    checkNoLeak({ wacana: {}, soal: all }, ["kecerdasan_p2_teks.json", ...Object.values(TEKS)]);
  }
  for (const pkg of only !== null ? [only] : [3, 14, 15, 16]) {
    const live = await fetchPkg(pkg);
    if (installed(live)) {
      if (only !== null) throw new Error(`Paket ${pkg} sudah memakai blok KCK baru — tidak diulang.`);
      console.log(`OK pkg ${pkg} (sudah dipasang di DB) · kunci ${JSON.stringify(checkLive(pkg, live))}`);
      continue;
    }
    const items = kck?.[pkg];
    if (kck) assert.ok(items, `pkg ${pkg}: tidak ada di ${kckFile}`);
    // Butir baru yang pernah masuk (mis. run terputus) tidak boleh dimasukkan dua kali.
    const stems = new Set((items ?? []).map((x) => x.q));
    const dup = (await fetchPkg(pkg, false)).filter((r) => stems.has(r.options_payload.question_text as string));
    if (dup.length) throw new Error(`Paket ${pkg}: ${dup.length} butir KCK baru sudah ada di DB (nonaktif?) — periksa manual.`);
    console.log(`pkg ${pkg}:`);
    const p = plan(pkg, live, items);
    if (!p) continue;
    const dist = checkLayout(pkg, p.final);
    console.log(`OK pkg ${pkg}: ${p.moves.length} pindah nomor, ${p.drop.length} buang, ${p.fresh.length} baru · kunci ${JSON.stringify(dist)}`);
    if (src !== null) await copy(COPY[src], p);
    else if (only !== null) await apply(pkg, p);
  }
})().catch((e) => { console.error(e); process.exit(1); });
