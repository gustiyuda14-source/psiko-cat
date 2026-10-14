import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { INSTRUKSI, LAYOUT_V3, LAYOUT_V4, checkA7, checkLayout, checkNoLeak, checkRows, checkTeks, data, root, teksRows, type Row, type TeksFile } from "./kecerdasan-teks-lib";

// Kalibrasi Logis/Spasial 2026-10-12. Blok 26-50 tiap paket:
//   26-27 deret gambar · 28-30 matriks · 31-32 rotasi/cermin · 33-34 susun · 35-36 analogi · 37 ikon
//   38-42 denah & arah mata angin (peta A: 2 ARAH + 2 RUTE, peta B: 1 ROTASI) · 43-50 silogisme
// Paket yang disusun:
//   13 = Simulasi 1 baru  (salinan pkg 1 + blok 26-50 baru; pkg 1 tetap utuh untuk riwayat 18 sesi)
//   14 = Simulasi 2 baru  (salinan pkg 12 + blok 26-50 baru; pkg 12 tetap utuh untuk riwayat)
//   2  = Latihan Paket 1  (diubah di tempat: butir blok lama dipindah nomor/dinonaktifkan, butir baru ditambah)
//   3  = Latihan Paket 2  (baru 100 soal: kecerdasan_p3_teks.json + figural/susun/denah kal)
//   15 = Simulasi 3       (baru 100 soal: kecerdasan_p15_teks.json + figural/mosaik/susun/denah kal, dengan pembahasan_svg)
//   16 = Simulasi 1 baru  (baru 100 soal, sama seperti 15; menggantikan pkg 13 di kartu 1, pkg 13 tetap untuk riwayat)
//   4, 5 = Latihan Paket 3 & 4 (pedoman v3: 76-90 HIT · 91-96 CRT · 97-100 KCK, silogisme SIL_V3, kunci ≤ 24/huruf,
//          cek A-7 tanpa unsur kepolisian). Rencana: docs/rencana/kecerdasan-latihan-paket-3-4.md
//   19 = Simulasi 4 (v3 seperti 4/5; tingkat 20 sedang + 80 HOTS). Rencana: docs/rencana/simulasi-4.md
//   20 = Simulasi 5 (layout v4: 73-75 Sebab-Akibat, 76-87 HIT, 88-92 CRT Alokasi, 93-96 CRT; tingkat 10 + 90). Rencana: docs/rencana/simulasi-5.md
//   --swap 15|19 = tukar di tempat ke layout v4 (73-75 Sebab-Akibat, 88-92 Alokasi). Rencana simulasi-5 §2.4, §2.5a; LOG sesi 1.
// Sumber gambar baru: generate-kecerdasan-{figural,susun,denah}-kal.ts. Wacana pkg 3: cek-wacana-kal.ts.
//   Validasi (baca DB saja):  npx tsx scripts/seed-kecerdasan-kal.ts
//   Cek satu paket saja:      npx tsx scripts/seed-kecerdasan-kal.ts --check 4
//   Tulis satu paket:         npx tsx scripts/seed-kecerdasan-kal.ts --apply 13
//   Tukar slot (dry run):     npx tsx scripts/seed-kecerdasan-kal.ts --swap 19        (tulis: --swap 19 --apply)

process.loadEnvFile(path.join(root, ".env.local"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
type DbRow = Row & { id: string; is_active: boolean };
type Tiered = Row & { tingkat: 2 | 3 };
// V3 = aturan pedoman v3 (SIL_V3, A-7, KCK gabung, D-4); V4 = paket berlayout v4 (rencana simulasi-5).
const V3 = new Set([4, 5, 19, 20]);
const V4 = new Set([20]);

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
  // Paket baru penuh (100 soal): teks pkg N + gambar kal pkg N.
  if (pkg === 3 || pkg === 15 || pkg === 16 || V3.has(pkg)) {
    let teks = data(`kecerdasan_p${pkg}_teks.json`) as TeksFile;
    const lama = ["kecerdasan_p2_teks.json", "kecerdasan_p3_teks.json", "kecerdasan_s2_teks.json"];
    checkNoLeak(teks, pkg === 3 ? lama.filter((f) => !f.includes("p3")) : V3.has(pkg)
      ? [...lama, "kecerdasan_p15_teks.json", "kecerdasan_p16_teks.json", "kecerdasan_kck_kal.json", ...range(4, pkg - 1).map((n) => `kecerdasan_p${n}_teks.json`).filter((f) => fs.existsSync(path.join(root, "prisma/data", f)))]
      : [...lama, ...(pkg === 16 ? ["kecerdasan_p15_teks.json"] : [])]);
    // V3: KCK 97–100 tinggal di kecerdasan_kck_kal.json (keunikan stem dicek check-kecerdasan-kck.ts), digabung setelah cek bocor.
    if (V3.has(pkg)) teks = { ...teks, soal: [...teks.soal, ...data("kecerdasan_kck_kal.json")[pkg]] };
    checkTeks(teks);
    const gambar = newRows(pkg);
    if (V3.has(pkg)) { checkA7(`pkg ${pkg} teks`, teks); checkA7(`pkg ${pkg} gambar`, gambar); }
    const tingkat = [...teks.soal.map((x) => x.d), ...gambar.map((g) => g.tingkat)];
    // Simulasi makin jauh makin sulit (pemilik 2026-10-13): pkg 19 (Simulasi 4) 20 sedang + 80 HOTS, paket lain 40 + 60.
    const [sedang, hots] = pkg === 20 ? [10, 90] : pkg === 19 ? [20, 80] : [40, 60];
    assert.deepEqual([tingkat.filter((t) => t === 2).length, tingkat.filter((t) => t === 3).length], [sedang, hots], `pkg ${pkg}: harus ${sedang} sedang + ${hots} HOTS`);
    const typeOf = new Map(teks.soal.map((x) => [x.s, x.t]));
    const layout = V4.has(pkg) ? LAYOUT_V4 : LAYOUT_V3;
    const praktis = V3.has(pkg) ? layout : [[76, 98, "*"], [99, 99, "KUA"], [100, 100, "KCK"]] as const;
    const wacana = V4.has(pkg) ? [[65, 72, "WAC"], [73, 75, "SBA"]] as const : [[65, 75, "WAC"]] as const;
    for (const [a, b, t] of [[1, 5, "SIN"], [6, 10, "ANT"], [11, 15, "ANA"], [16, 19, "ODD"], [20, 25, "BAC"], [43, 50, "SIL"], [57, 64, "DER"], ...wacana, ...praktis] as const)
      for (const s of range(a, b)) assert.ok(t === "*" ? ["HIT", "CRT"].includes(typeOf.get(s)!) : typeOf.get(s) === t, `pkg ${pkg} soal ${s}: tipe ${typeOf.get(s)} ≠ ${t}`);
    const rows = [...teksRows(teks, V3.has(pkg)), ...gambar.map(strip)].sort((a, b) => a.sequence_number - b.sequence_number);
    // Pedoman D-4: maks 24% per huruf. Butir 2 kunci dihitung dua huruf (±123 huruf per paket, jadi batasnya ±29).
    const letters = rows.reduce((n, r) => n + r.scoring_rule.correct_key.length, 0);
    const subOf = new Map(teks.soal.map((x) => [x.s, x.sub]));
    if (V3.has(pkg)) checkLayout(pkg, rows.map((row) => ({ row, t: typeOf.get(row.sequence_number) ?? "", sub: subOf.get(row.sequence_number) })), Math.floor(letters * 0.24), layout);
    return { rows, reuse };
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
    else assert.equal(r.options_payload.instruksi, INSTRUKSI[V3.has(pkg) ? "SIL_V3" : "SIL"], `pkg ${pkg} #${s}: harus silogisme`);
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

// --swap: butir lama per slot (DB aktif, LOG sesi 1): tingkat, kunci, awal sub_text/instruksi (penanda supaya tidak tukar dobel).
// `baru` = kunci Sebab-Akibat yang diputuskan (LOG keputusan 2); slot Alokasi wajib mewarisi kunci lama.
type Lama = { d: 2 | 3; k: string; awal: string; baru?: string };
const SWAP: Record<number, Record<number, Lama>> = {
  15: {
    73: { d: 2, k: "A", awal: "Lima anggota baru", baru: "A" }, 74: { d: 3, k: "B", awal: "Lima anggota baru", baru: "B" }, 75: { d: 3, k: "D", awal: "Lima anggota baru", baru: "E" },
    88: { d: 2, k: "E", awal: "4,2 kg + 350 dag" }, 89: { d: 3, k: "B", awal: "Sebidang tanah berbentuk persegi panjang" }, 90: { d: 3, k: "D", awal: "Sebuah pesawat berangkat dari Jakarta" },
    91: { d: 2, k: "E", awal: "Harga sepasang sepatu" }, 92: { d: 3, k: "A", awal: "Sebuah pekerjaan direncanakan selesai dalam 24 har" },
  },
  19: {
    73: { d: 3, k: "E", awal: "Lima guru", baru: "E" }, 74: { d: 3, k: "D", awal: "Lima guru", baru: "B" }, 75: { d: 3, k: "C", awal: "Lima guru", baru: "A" },
    88: { d: 3, k: "B", awal: "2,4 km + 180 m" }, 89: { d: 3, k: "D", awal: "2,8 liter + 450 cm³" }, 90: { d: 3, k: "A", awal: "0,032 ha + 180 dm²" },
    91: { d: 2, k: "C", awal: "Nina berjalan sejauh 4,2 km" }, 92: { d: 3, k: "D", awal: "Sebuah kios membeli 30 kemasan roti" },
  },
};
const sebaran = (rows: Row[]) => rows.reduce<Record<string, number>>((m, r) => { for (const k of r.scoring_rule.correct_key) m[k] = (m[k] ?? 0) + 1; return m; }, {});

/** Tukar di tempat (pola pkg 2): butir baru masuk nonaktif → butir lama dinonaktifkan → butir baru diaktifkan. Baris lama tidak dihapus. */
async function swap(pkg: number, write: boolean) {
  const slots = SWAP[pkg];
  assert.ok(slots, `--swap hanya untuk pkg ${Object.keys(SWAP).join("/")}`);
  const nomor = Object.keys(slots).map(Number);
  const live = await fetchPkg(pkg);
  assert.deepEqual(live.map((r) => r.sequence_number), range(1, 100), `pkg ${pkg}: harus tepat 100 soal aktif bernomor 1..100 (ada ${live.length})`);
  const src = (f: string) => fs.existsSync(path.join(root, "prisma/data", f)) ? (data(f) as Record<string, TeksFile>)[pkg] : undefined;
  const alok = src("kecerdasan_alokasi.json"), sba = src("kecerdasan_sba.json");
  assert.ok(alok && sba, `pkg ${pkg}: butir belum ada (kecerdasan_alokasi.json: ${!!alok}, kecerdasan_sba.json: ${!!sba})`);
  const teks: TeksFile = { wacana: { ...alok.wacana, ...sba.wacana }, soal: [...sba.soal, ...alok.soal].sort((a, b) => a.s - b.s) };
  assert.deepEqual(teks.soal.map((x) => x.s), nomor, `pkg ${pkg}: butir baru harus tepat slot ${nomor}`);
  for (const x of teks.soal) assert.ok(x.s <= 75 ? x.t === "SBA" : x.t === "CRT" && x.sub === "ALOKASI", `pkg ${pkg} #${x.s}: tipe ${x.t}/${x.sub} salah slot`);
  checkTeks(teks);
  checkA7(`pkg ${pkg} swap`, teks);
  checkNoLeak(teks, ["kecerdasan_p2_teks.json", "kecerdasan_p3_teks.json", "kecerdasan_s2_teks.json", "kecerdasan_kck_kal.json", ...[4, 5, 15, 16, 19, 20].map((n) => `kecerdasan_p${n}_teks.json`)].filter((f) => fs.existsSync(path.join(root, "prisma/data", f))));
  const fresh = teksRows(teks, true);
  const table = teks.soal.map((x, n) => {
    const lama = slots[x.s], old = live[x.s - 1], o = old.options_payload, key = old.scoring_rule.correct_key;
    assert.ok(String(o.sub_text ?? o.instruksi ?? "").startsWith(lama.awal) && key === lama.k, `pkg ${pkg} #${x.s}: butir lama di DB bukan yang dicatat (sudah ditukar?) — kunci ${key}, isi "${String(o.sub_text ?? o.instruksi).slice(0, 40)}"`);
    assert.equal(x.d, lama.d, `pkg ${pkg} #${x.s}: tingkat ${x.d} ≠ tingkat slot ${lama.d}`);
    assert.equal(x.k, lama.baru ?? lama.k, `pkg ${pkg} #${x.s}: kunci ${x.k} ≠ ${lama.baru ?? lama.k}${lama.baru ? " (keputusan SBA)" : " (kunci slot non-SBA tidak boleh berubah)"}`);
    assert.equal(fresh[n].sequence_number, x.s);
    return { slot: x.s, lama: `${lama.d}·${key}`, baru: `${x.d}·${x.k}`, isi_lama: lama.awal.slice(0, 28), isi_baru: x.t === "SBA" ? "Sebab-Akibat" : `Alokasi ${(x as { bentuk?: string }).bentuk ?? ""}` };
  });
  const final: Row[] = live.map((r) => fresh.find((f) => f.sequence_number === r.sequence_number) ?? strip(r));
  const letters = final.reduce((n, r) => n + r.scoring_rule.correct_key.length, 0);
  console.table(table);
  console.log(`kunci sebelum ${JSON.stringify(sebaran(live))} · sesudah ${JSON.stringify(sebaran(final))} · ${letters} huruf, batas D-4 ${Math.floor(letters * 0.24)}`);
  // Pedoman D-4 (keputusan pemilik 2026-10-14, bukan "maks lama"); butir live di luar slot = legacy (SVG lama boleh <style>).
  checkRows(final, `pkg ${pkg} swap`, new Set(range(1, 100).filter((s) => !slots[s])), Math.floor(letters * 0.24));
  if (!write) return console.log(`OK dry run --swap ${pkg}: ${fresh.length} slot siap. Tulis dengan --swap ${pkg} --apply.`);
  const base = { type: "KECERDASAN", package_number: pkg, column_index: null };
  const { data: ins, error: e1 } = await supabase.from("questions").insert(fresh.map((r) => ({ ...base, is_active: false, ...r }))).select("id");
  if (e1) throw e1;
  const { error: e2 } = await supabase.from("questions").update({ is_active: false }).in("id", nomor.map((s) => live[s - 1].id));
  if (e2) throw e2;
  const { error: e3 } = await supabase.from("questions").update({ is_active: true }).in("id", ins!.map((r) => r.id));
  if (e3) throw e3;
  const after = await fetchPkg(pkg);
  assert.deepEqual(after.map((r) => r.sequence_number), range(1, 100), `pkg ${pkg} setelah swap harus 1..100`);
  assert.ok(range(73, 75).every((s) => after[s - 1].options_payload.instruksi === INSTRUKSI.SBA), `pkg ${pkg} setelah swap: 73–75 harus Sebab-Akibat`);
  console.log(`Paket ${pkg}: ${nomor.length} butir ditukar (lama dinonaktifkan, tidak dihapus).`);
}

(async () => {
  const flag = (f: string) => (process.argv.includes(f) ? Number(process.argv[process.argv.indexOf(f) + 1]) : null);
  const swapPkg = flag("--swap");
  if (swapPkg) return swap(swapPkg, process.argv.includes("--apply"));
  const only = flag("--apply"), check = flag("--check");
  for (const pkg of only ? [only] : check ? [check] : [13, 14, 2, 3, 15, 16]) {
    if (V4.has(pkg) && !fs.existsSync(path.join(root, "prisma/data", `kecerdasan_p${pkg}_teks.json`))) {
      console.log(`SKIP pkg ${pkg}: kecerdasan_p${pkg}_teks.json belum ada (teks pkg 20 digabung di sesi 3).`);
      continue;
    }
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
