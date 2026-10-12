import assert from "node:assert/strict";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { INSTRUKSI, checkNoLeak, checkRows, checkTeks, data, root, teksRows, type Row, type TeksFile } from "./kecerdasan-teks-lib";

// Kalibrasi Logis/Spasial 2026-10-12. Blok 26-50 tiap paket:
//   26-27 deret gambar · 28-30 matriks · 31-32 rotasi/cermin · 33-34 susun · 35-36 analogi · 37 ikon
//   38-42 denah & arah mata angin (peta A: 2 ARAH + 2 RUTE, peta B: 1 ROTASI) · 43-50 silogisme
// Paket yang disusun:
//   13 = Simulasi 1 baru  (salinan pkg 1 + blok 26-50 baru; pkg 1 tetap utuh untuk riwayat 18 sesi)
//   14 = Simulasi 2 baru  (salinan pkg 12 + blok 26-50 baru; pkg 12 tetap utuh untuk riwayat)
//   2  = Latihan Paket 1  (diubah di tempat: butir blok lama dipindah nomor/dinonaktifkan, butir baru ditambah)
//   3  = Latihan Paket 2  (baru 100 soal: kecerdasan_p3_teks.json + figural/susun/denah kal)
// Sumber gambar baru: generate-kecerdasan-{figural,susun,denah}-kal.ts. Wacana pkg 3: cek-wacana-kal.ts.
//   Validasi (baca DB saja):  npx tsx scripts/seed-kecerdasan-kal.ts
//   Tulis satu paket:         npx tsx scripts/seed-kecerdasan-kal.ts --apply 13

process.loadEnvFile(path.join(root, ".env.local"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
type DbRow = Row & { id: string; is_active: boolean };
type Tiered = Row & { tingkat: 2 | 3 };

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const strip = ({ sequence_number, options_payload, scoring_rule }: Row): Row => ({ sequence_number, options_payload, scoring_rule });
const kal = (file: string, pkg: number) => ((data(file) as Record<string, Tiered[]>)[pkg] ?? []);
const newRows = (pkg: number): Tiered[] => [...kal("kecerdasan_figural_kal.json", pkg), ...kal("kecerdasan_susun_kal.json", pkg), ...kal("kecerdasan_denah_kal.json", pkg)];

// Nomor baru ← nomor lama di paket sumber (hanya blok 26-50; nomor lain disalin apa adanya).
/** Id SVG Paket 1 lama kembar antarsoal (out-sq, in-sq, …); salinan diberi prefiks per soal. */
function prefixIds(svg: string, prefix: string) {
  const ids = [...new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))];
  for (const id of ids) svg = svg.replaceAll(`id="${id}"`, `id="${prefix}${id}"`).replaceAll(`#${id}"`, `#${prefix}${id}"`).replaceAll(`#${id})`, `#${prefix}${id})`);
  return svg;
}
const SIL = (src: number[]) => Object.fromEntries(src.map((s, i) => [43 + i, s]));
const MOVES: Record<number, { from: number; map: Record<number, number> }> = {
  13: { from: 1, map: { 26: 27, 27: 33, 35: 30, 36: 34, ...SIL([38, 41, 42, 43, 46, 47, 48, 50]) } },
  14: { from: 12, map: { 26: 26, 27: 27, 28: 29, 29: 31, 30: 32, 31: 33, 32: 34, 33: 35, 34: 36, 35: 38, 36: 39, 37: 40, ...SIL([41, 42, 43, 45, 46, 47, 48, 49]) } },
  2: { from: 2, map: { 26: 32, 27: 33, 28: 26, 29: 31, 30: 36, 33: 29, 34: 34, ...SIL([41, 42, 44, 45, 46, 47, 48, 49]) } },
};

async function fetchPkg(pkg: number): Promise<DbRow[]> {
  const { data: rows, error } = await supabase.from("questions").select("id, sequence_number, options_payload, scoring_rule, is_active")
    .eq("type", "KECERDASAN").eq("package_number", pkg).eq("is_active", true).order("sequence_number");
  if (error) throw error;
  return rows as unknown as DbRow[];
}

/** Komposisi akhir satu paket + daftar id sumber yang dipakai ulang (untuk pkg 2 di tempat). */
async function compose(pkg: number): Promise<{ rows: Row[]; reuse: Map<number, string> }> {
  const reuse = new Map<number, string>();
  if (pkg === 3) {
    const teks = data("kecerdasan_p3_teks.json") as TeksFile;
    checkTeks(teks);
    checkNoLeak(teks, ["kecerdasan_p2_teks.json", "kecerdasan_s2_teks.json"]);
    const gambar = newRows(3);
    const tingkat = [...teks.soal.map((x) => x.d), ...gambar.map((g) => g.tingkat)];
    assert.deepEqual([tingkat.filter((t) => t === 2).length, tingkat.filter((t) => t === 3).length], [40, 60], "pkg 3: harus 40 sedang + 60 HOTS");
    const typeOf = new Map(teks.soal.map((x) => [x.s, x.t]));
    for (const [a, b, t] of [[1, 5, "SIN"], [6, 10, "ANT"], [11, 15, "ANA"], [16, 19, "ODD"], [20, 25, "BAC"], [43, 50, "SIL"], [57, 64, "DER"], [65, 75, "WAC"], [76, 98, "*"], [99, 99, "KUA"], [100, 100, "KCK"]] as const)
      for (const s of range(a, b)) assert.ok(t === "*" ? ["HIT", "CRT"].includes(typeOf.get(s)!) : typeOf.get(s) === t, `pkg 3 soal ${s}: tipe ${typeOf.get(s)} ≠ ${t}`);
    return { rows: [...teksRows(teks), ...gambar.map(strip)].sort((a, b) => a.sequence_number - b.sequence_number), reuse };
  }
  const { from, map } = MOVES[pkg];
  const src = await fetchPkg(from);
  assert.equal(src.length, 100, `pkg ${from}: harus 100 soal aktif`);
  const bySeq = new Map(src.map((r) => [r.sequence_number, r]));
  const added = newRows(pkg);
  const rows: Row[] = [];
  for (const seq of range(1, 100)) {
    const fresh = added.find((r) => r.sequence_number === seq);
    const old = seq >= 26 && seq <= 50 ? map[seq] : seq;
    assert.ok(!fresh !== !old, `pkg ${pkg} #${seq}: harus tepat satu sumber (baru atau salinan)`);
    if (fresh) { rows.push(strip(fresh)); continue; }
    const r = bySeq.get(old!)!;
    reuse.set(seq, r.id);
    const svg = r.options_payload.svg_content;
    const payload = pkg === 13 && svg ? { ...r.options_payload, svg_content: prefixIds(svg, `p13q${seq}-`) } : r.options_payload;
    rows.push({ sequence_number: seq, options_payload: payload, scoring_rule: r.scoring_rule });
  }
  if (pkg === 14) {
    // Pedoman §5: tetap 40 sedang + 60 HOTS. Tingkat butir salinan diambil dari sumber pkg 12.
    const s2 = data("kecerdasan_s2_teks.json") as TeksFile;
    const old = new Map<number, number>([...s2.soal.map((x) => [x.s, x.d] as [number, number]), ...[...data("kecerdasan_s2_figural.json"), ...data("kecerdasan_s2_susun.json")].map((g: Tiered) => [g.sequence_number, g.tingkat] as [number, number])]);
    const tier = range(1, 100).map((seq) => added.find((r) => r.sequence_number === seq)?.tingkat ?? old.get(seq >= 26 && seq <= 50 ? map[seq] : seq));
    assert.deepEqual([tier.filter((t) => t === 2).length, tier.filter((t) => t === 3).length], [40, 60], "pkg 14: harus 40 sedang + 60 HOTS");
  }
  return { rows, reuse };
}

function checkBlock(rows: Row[], pkg: number, reuse: Map<number, string>) {
  assert.deepEqual(rows.map((r) => r.sequence_number), range(1, 100), `pkg ${pkg}: nomor harus 1..100`);
  for (const r of rows.filter((x) => x.sequence_number >= 26 && x.sequence_number <= 50)) {
    const svg = r.options_payload.svg_content ?? "", s = r.sequence_number;
    if (s <= 37) assert.ok(svg && !svg.includes("mapclip"), `pkg ${pkg} #${s}: harus figural`);
    else if (s <= 42) assert.ok(svg.includes("mapclip") && r.options_payload.question_text, `pkg ${pkg} #${s}: harus denah`);
    else assert.equal(r.options_payload.instruksi, INSTRUKSI.SIL, `pkg ${pkg} #${s}: harus silogisme`);
  }
  assert.equal(rows.filter((r) => /Urutkanlah potongan/.test(String(r.options_payload.instruksi))).map((r) => r.sequence_number).join(","), "33,34", `pkg ${pkg}: susun harus di 33-34`);
  return checkRows(rows, `pkg ${pkg}`, new Set(pkg === 13 ? reuse.keys() : []));
}

async function apply(pkg: number, rows: Row[], reuse: Map<number, string>) {
  const base = { type: "KECERDASAN", package_number: pkg, column_index: null };
  if (pkg !== 2) {
    const { count } = await supabase.from("questions").select("id", { count: "exact", head: true }).eq("type", "KECERDASAN").eq("package_number", pkg);
    if (count) throw new Error(`Paket ${pkg} sudah berisi ${count} soal — tidak ditimpa.`);
    const { error } = await supabase.from("questions").insert(rows.map((r) => ({ ...base, is_active: true, ...r })));
    if (error) throw error;
    return console.log(`Inserted 100 soal KECERDASAN package_number=${pkg}.`);
  }
  // pkg 2 di tempat: butir baru masuk nonaktif dulu, nomor butir lama digeser, lalu ditukar sekaligus.
  const current = await fetchPkg(2);
  if (current.some((r) => (r.options_payload.svg_content ?? "").includes("mapclip"))) throw new Error("Paket 2 sudah dikalibrasi — tidak diulang.");
  const keep = new Set(reuse.values()), drop = current.filter((r) => !keep.has(r.id)).map((r) => r.id);
  const fresh = rows.filter((r) => !reuse.has(r.sequence_number));
  assert.equal(drop.length, fresh.length, "jumlah butir dibuang harus sama dengan butir baru");
  const { data: ins, error: e1 } = await supabase.from("questions").insert(fresh.map((r) => ({ ...base, is_active: false, ...r }))).select("id");
  if (e1) throw e1;
  for (const [seq, id] of reuse) {
    const { error } = await supabase.from("questions").update({ sequence_number: seq }).eq("id", id);
    if (error) throw error;
  }
  const { error: e2 } = await supabase.from("questions").update({ is_active: false }).in("id", drop);
  if (e2) throw e2;
  const { error: e3 } = await supabase.from("questions").update({ is_active: true }).in("id", ins!.map((r) => r.id));
  if (e3) throw e3;
  const after = await fetchPkg(2);
  assert.deepEqual(after.map((r) => r.sequence_number), range(1, 100), "pkg 2 setelah kalibrasi harus 1..100");
  console.log(`Paket 2: ${reuse.size} butir dipertahankan, ${drop.length} dinonaktifkan, ${fresh.length} baru.`);
}

(async () => {
  const only = process.argv.includes("--apply") ? Number(process.argv[process.argv.indexOf("--apply") + 1]) : null;
  for (const pkg of only ? [only] : [13, 14, 2, 3]) {
    // pkg 2 diubah di tempat: setelah dikalibrasi, yang dicek adalah isi DB-nya sekarang.
    const live = pkg === 2 ? await fetchPkg(2) : [];
    if (live.some((r) => (r.options_payload.svg_content ?? "").includes("mapclip")) && !only) {
      console.log(`OK pkg 2 (sudah dikalibrasi di DB) · kunci ${JSON.stringify(checkBlock(live, 2, new Map()))}`);
      continue;
    }
    const { rows, reuse } = await compose(pkg);
    const dist = checkBlock(rows, pkg, reuse);
    console.log(`OK pkg ${pkg}: 100 soal, ${reuse.size} salinan, ${100 - reuse.size} baru · kunci ${JSON.stringify(dist)}`);
    if (only) await apply(pkg, rows, reuse);
  }
})().catch((e) => { console.error(e); process.exit(1); });
