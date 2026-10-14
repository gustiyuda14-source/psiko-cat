import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { type Ann, BOX, INK, KEYS, W, type Fig, type Fill, type Key, type Prim, type Pt, analogyS, box, draw, gridItem, gridS, optionsRow, optionsRowS, place, r1, fp, foot, redArrow, redRing, redText, regular, shape, sig, stimulusItem, svgWrap, tf } from "./figural-lib";
import { BUNDAR_ITEMS } from "./figural-kal-bundar";
import { BUNDAR15_ITEMS } from "./figural-kal-bundar-15";
import { BUNDAR16_ITEMS } from "./figural-kal-bundar-16";
import { BUNDAR4_ITEMS } from "./figural-kal-bundar-4";
import { BUNDAR5_ITEMS } from "./figural-kal-bundar-5";
import { FIG16_ITEMS } from "./figural-kal-16";
import { FIG2_ITEMS } from "./figural-kal-2";
import { FIG3_ITEMS } from "./figural-kal-3";
import { FIG4_ITEMS } from "./figural-kal-4";
import { FIG5_ITEMS } from "./figural-kal-5";
import { FIG19_ITEMS } from "./figural-kal-19";
import { BUNDAR19_ITEMS } from "./figural-kal-bundar-19";
import { buildMosaik } from "./figural-mosaik";
import { FIG20_ITEMS } from "./figural-kal-20";
import { FIG20B_ITEMS } from "./figural-kal-20b";
import { BUNDAR20_ITEMS } from "./figural-kal-bundar-20";
import { MOSAIK20_ITEMS } from "./figural-mosaik-20";

// Figural kalibrasi Logis/Spasial 2026-10-12: 26-27 deret · 28-30 matriks · 31-32 rotasi · 33-34 susun · 35-36 analogi · 37 ikon
// pkg 13 (Simulasi 1 baru): 28-30, 31-32, 37 (+ susun 34 dari generate-kecerdasan-susun-kal.ts)
// pkg 2 (Latihan Paket 1): 31-32, 35-36, 37 (figural-kal-2.ts) · pkg 3 (Latihan Paket 2): 26-32, 35-37 (figural-kal-3.ts, + susun 33-34) + pola bundar 51-56 (figural-kal-bundar.ts)
// pkg 15 (Simulasi 3): 26-27 mosaik (figural-mosaik.ts), 28-32 + 35-37 di sini (tata letak besar + gambar pembahasan), bundar 51-56 (figural-kal-bundar-15.ts)
// pkg 16 (Simulasi 1 baru): 26 mosaik, 27-32 + 35-37 (figural-kal-16.ts), bundar 51-56 (figural-kal-bundar-16.ts)
// Primitif sama dengan s2 (figural-lib.ts): opsi kembar tertangkap oleh place().
//   npx tsx scripts/generate-kecerdasan-figural-kal.ts → prisma/data/kecerdasan_figural_kal.json ({ [pkg]: Row[] }) + output/figural-kal-preview.html

type Built = { pkg: number; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; choices?: string[]; pembahasan_svg?: string };
const items: Built[] = [];
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const GANJIL = "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.";
const add = (pkg: number, seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg?: string) => {
  assert.match(pembahasan, new RegExp(`Jawaban: ${key.toLowerCase()}\\.$`), `pkg ${pkg} #${seq}: pembahasan tidak menyebut kunci`);
  // butir dengan gambar pembahasan (pkg 15) mengikuti aturan 2 paragraf: pola, lalu eliminasi + kunci
  if (pembahasan_svg) assert.match(pembahasan, /^[^\n]+\n\n[^\n]+$/, `pkg ${pkg} #${seq}: pembahasan harus 2 paragraf`);
  items.push({ pkg, seq, key, instruksi, svg, tingkat, pembahasan, ...(pembahasan_svg ? { pembahasan_svg } : {}) });
};

const poly = (pts: Pt[], fill: Fill): Prim => ({ k: "poly", pts, fill });
const ngon = (n: number, r: number, fill: Fill): Prim => ({ k: "poly", pts: regular(n, r), fill });
const dot = (x: number, y: number, r = 4, fill: Fill = "b"): Prim => ({ k: "circ", c: [x, y], r, fill });
const line = (a: Pt, b: Pt, w = 4): Prim => ({ k: "line", a, b, w });
const dotsRow = (n: number, y: number, fill: Fill, gap = 12, r = 4): Fig => Array.from({ length: n }, (_, i) => dot(r1((i - (n - 1) / 2) * gap), y, r, fill));
const inv = (f: Fill): Fill => (f === "b" ? "w" : "b");

/** Bangun harus kiral: tidak ada cerminan yang sama dengan rotasi 90° mana pun. */
function assertChiral(base: Fig, tag: string) {
  for (const d of [0, 90, 180, 270]) for (const e of [0, 90, 180, 270]) assert.notEqual(sig(tf(base, d, true)), sig(tf(base, e)), `${tag}: bangun simetris`);
}
/** Gambar soal dengan cermin mendatar (garis putus-putus) di bawahnya. */
function mirrorBelowItem(fig: Fig, options: Fig[]) {
  const cx = W / 2, cy = 20 + BOX / 2, y = cy + BOX / 2 + 14;
  const ln = `<line x1="${cx - BOX / 2 - 6}" y1="${y}" x2="${cx + BOX / 2 + 6}" y2="${y}" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>`;
  const o = optionsRow(options, y + 30);
  return svgWrap(o.bottom, box(cx, cy) + draw(fig, cx, cy) + ln + o.body);
}
/** Lima gambar a-e tanpa gambar soal (ikon kategori). */
const rowItem = (options: Fig[]) => { const o = optionsRow(options, 20); return svgWrap(o.bottom, o.body); };

// ═════════════ pkg 13 ═════════════
// 13#28 — matriks: bujur sangkar Latin tiga atribut (bangun, isi pusat, jumlah titik).
{
  const SH = [(f: Fill) => ngon(3, 34, f), (f: Fill) => shape("seg4", 40, f), (f: Fill) => ngon(6, 32, f)];
  const cell = (s: number, inner: number, dots: number): Fig => [
    SH[s]("w"), ...(inner === 2 ? [] : [dot(0, 0, 9, inner === 0 ? "b" : "w")]), ...dotsRow(dots, 40, "b", 10, 3.5),
  ];
  const at = (r: number, c: number): [number, number, number] => [(r + c) % 3, (r + 2 * c) % 3, ((2 * r + c) % 3) + 1];
  const ans = at(2, 2);
  assert.deepEqual(ans, [1, 0, 1]);
  const opts = place(cell(...ans), [cell(2, 0, 1), cell(1, 1, 1), cell(1, 0, 2), cell(0, 2, 1)], "C");
  add(13, 28, "C", POLA, gridItem([0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : cell(...at(r, c))))), opts), 3,
    "Ada tiga ciri yang masing-masing muncul tepat satu kali di setiap baris dan setiap kolom: (1) bangun luar (segitiga, persegi, segi enam), (2) isi pusat (lingkaran hitam, lingkaran putih, kosong), dan (3) jumlah titik di bawah (1, 2, 3). Baris 3 sudah memuat segi enam dan segitiga, jadi bangunnya persegi. Isi pusat di baris 3 sudah lingkaran putih dan kosong, jadi lingkaran hitam. Titik di baris 3 sudah 2 dan 3, jadi 1 titik. Opsi a gugur karena bangunnya segi enam. Opsi b gugur karena lingkarannya putih. Opsi d gugur karena titiknya 2. Opsi e gugur karena bangun dan isinya salah. Jawaban: c.");
}

// 13#29 — matriks: tiap kolom diputar 90° searah jarum jam, warna putih-hitam-putih.
{
  const L = (f: Fill): Fig => [poly([[-20, -28], [-6, -28], [-6, 14], [20, 14], [20, 28], [-20, 28]], f)];
  const arrow = (f: Fill): Fig => [poly([[0, -30], [18, -8], [7, -8], [7, 28], [-7, 28], [-7, -8], [-18, -8]], f)];
  const flag = (f: Fill): Fig => [line([-16, 30], [-16, -30], 5), poly([[-16, -30], [22, -17], [-16, -4]], f), dot(8, 18, 6, "b")];
  assertChiral(flag("w"), "13#29");
  const FILL: Fill[] = ["w", "b", "w"];
  const grid = [L, arrow, flag].map((b, r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : tf(b(FILL[c]), 90 * c))));
  const opts = place(tf(flag("w"), 180), [tf(flag("w"), 90), tf(flag("b"), 180), tf(flag("w"), 270), tf(flag("w"), 180, true)], "B");
  add(13, 29, "B", POLA, gridItem(grid, opts), 3,
    "Pada setiap baris, gambar diputar 90° searah jarum jam dari kolom ke kolom (0°, 90°, 180°), dan warnanya bergantian putih–hitam–putih. Baris 3: bendera tegak, lalu diputar 90° (kolom 2), sehingga kolom 3 adalah bendera yang diputar 180° dengan segitiga putih: tiang di kanan, segitiga menunjuk ke kiri di bagian bawah. Opsi a baru diputar 90°. Opsi c segitiganya hitam. Opsi d diputar ke arah yang salah (270°). Opsi e adalah cerminan, bukan perputaran. Jawaban: b.");
}

// 13#30 — matriks: kolom 3 = gabungan garis kolom 1 dan kolom 2 (garis yang sama tetap ada).
{
  const h = 30;
  const seg: Record<string, [Pt, Pt]> = {
    T: [[-h, -h], [h, -h]], R: [[h, -h], [h, h]], B: [[-h, h], [h, h]], L: [[-h, -h], [-h, h]], D1: [[-h, -h], [h, h]], D2: [[-h, h], [h, -h]], V: [[0, -h], [0, h]], H: [[-h, 0], [h, 0]],
  };
  const cell = (s: string[]): Fig => [dot(0, 0, 3), ...[...new Set(s)].sort().map((n) => line(seg[n][0], seg[n][1]))];
  const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];
  const rows = [[["T", "D1"], ["D1", "V"]], [["L", "H"], ["H", "R", "D2"]], [["B", "V", "D2"], ["V", "T"]]];
  const opts = place(cell(union(rows[2][0], rows[2][1])), [cell(["B", "D2", "T"]), cell(["B", "V", "T"]), cell(["B", "V", "D2", "T", "L"]), cell(["B", "V", "D2"])], "B");
  add(13, 30, "B", POLA, gridItem(rows.map(([a, b], r) => [cell(a), cell(b), r < 2 ? cell(union(a, b)) : null]), opts), 2,
    "Gambar kolom 3 adalah gabungan semua garis di kolom 1 dan kolom 2; garis yang muncul di keduanya tetap digambar (tidak dihapus). Cek baris 1: garis atas dan diagonal \\ ditambah diagonal \\ dan garis tegak tengah → atas, diagonal \\, tegak tengah. Baris 3: bawah, tegak tengah, diagonal / ditambah tegak tengah dan atas → bawah, tegak tengah, diagonal /, atas. Opsi a menghapus garis yang sama (tegak tengah). Opsi c kehilangan diagonal /. Opsi d menambah sisi kiri. Opsi e hanya menyalin kolom 1. Jawaban: b.");
}

// 13#31 — rotasi: satu-satunya opsi yang bukan hasil perputaran.
{
  const base: Fig = [poly([[-28, -28], [28, -28], [28, -6], [6, -6], [6, 28], [-12, 28], [-12, 6], [-28, 6]], "w"), dot(17, -17, 6, "b"), poly([[-22, -22], [-4, -22], [-22, -4]], "b")];
  assertChiral(base, "13#31");
  const opts = place(tf(base, 90, true), [tf(base, 90), tf(base, 180), tf(base, 270), tf(base, 135)], "E");
  add(13, 31, "E", "Pilihlah satu gambar yang BUKAN hasil perputaran (rotasi) dari gambar di atas.", stimulusItem(base, false, opts), 2,
    "Pakai dua patokan: segitiga hitam dan titik hitam. Pada gambar soal, jika bergerak searah jarum jam dari segitiga hitam (kiri atas), titik hitam (kanan atas) ditemui lebih dulu. Perputaran berapa pun derajatnya mempertahankan urutan ini. Gambar a (90°), b (180°), c (270°), dan d (135°) mempertahankannya. Pada gambar e, titik hitam berada berlawanan arah jarum jam dari segitiga, tanda bahwa gambar itu dicerminkan. Jawaban: e.");
}

// 13#32 — cermin mendatar, lalu putar 90° berlawanan arah jarum jam.
{
  const base: Fig = [poly([[-24, -30], [-6, -30], [-6, 10], [26, 10], [26, 30], [-24, 30]], "w"), dot(-15, -18, 5, "b"), line([4, 20], [18, 20], 4)];
  assertChiral(base, "13#32");
  // cermin mendatar = tf(.,180,true); lalu putar 270° searah jarum jam → tf(.,90,true)
  const opts = place(tf(base, 90, true), [tf(base, 180, true), tf(base, 270), tf(base, 270, true), tf(base, 0, true)], "A");
  add(13, 32, "A", "Gambar di atas dicerminkan terhadap cermin mendatar pada garis putus-putus, kemudian hasil cerminannya diputar 90° berlawanan arah jarum jam. Pilihlah satu gambar yang merupakan hasil akhirnya.", mirrorBelowItem(base, opts), 3,
    "Kerjakan bertahap. Langkah 1 (cermin mendatar): atas dan bawah terbalik, jadi kaki sepatu pindah ke atas, batang tegak di kiri bawah, titik hitam di kiri bawah, dan garis kecil di kanan atas. Langkah 2 (putar 90° berlawanan arah jarum jam): bagian atas berpindah ke kiri dan bagian kiri berpindah ke bawah, jadi kaki sepatu menjadi tegak di kiri, batang mendatar di bawah, titik hitam di kanan bawah, dan garis kecil di kiri atas. Opsi b hanya dicerminkan. Opsi c hanya diputar. Opsi d diputar searah jarum jam. Opsi e memakai cermin tegak. Jawaban: a.");
}

// 13#37 — ikon kategori: jumlah titik = jumlah sisi bangun, kecuali satu.
{
  // lebih dari 4 titik disusun dua baris supaya tidak berimpit dan tidak menyentuh tepi bangun
  const dots = (k: number, f: Fill, y: number): Fig => (k <= 4 ? dotsRow(k, y, f, 12, 4) : [...dotsRow(Math.ceil(k / 2), y - 7, f, 13, 4), ...dotsRow(Math.floor(k / 2), y + 7, f, 13, 4)]);
  const fig = (n: number, k: number, f: Fill): Fig => [ngon(n, n === 3 ? 42 : 38, f), ...dots(k, inv(f), n === 3 ? 8 : 0)];
  const opts = place(fig(6, 5, "w"), [fig(3, 3, "b"), fig(5, 5, "w"), fig(4, 4, "b"), fig(7, 7, "w")], "A");
  add(13, 37, "A", GANJIL, rowItem(opts), 2,
    "Hitung sisi bangun dan titik di dalamnya. Segitiga (b) berisi 3 titik, segi lima (c) berisi 5 titik, belah ketupat (d) berisi 4 titik, dan segi tujuh (e) berisi 7 titik: jumlah titik selalu sama dengan jumlah sisi. Segi enam (a) hanya berisi 5 titik. Warna bangun bukan ciri pembeda, karena hitam dan putih sama-sama muncul lebih dari satu kali. Jawaban: a.");
}

// ═════════════ pkg 15 (Simulasi 3) ═════════════
// Tata letak besar (gridS/analogyS, figural-lib) supaya terbaca di HP; tiap butir membawa gambar pembahasan.
const add15 = (seq: number, ...a: [Key, string, string, 2 | 3, string, string]) => add(15, seq, ...a);
const invF = (f: Fig): Fig => f.map((q) => (q.k === "line" ? q : { ...q, fill: inv(q.fill) }));

// 15#28 — matriks (sedang): kolom 3 = jari-jari yang ada di kolom 1 DAN di kolom 2 (irisan).
{
  const dir = (d: number): Pt => [Math.sin((d * Math.PI) / 4), -Math.cos((d * Math.PI) / 4)];
  const spoke = (d: number): Fig => { const [x, y] = dir(d); return [line([0, 0], [r1(26 * x), r1(26 * y)], 5), dot(r1(29 * x), r1(29 * y), 6, "b")]; };
  const FR = [dot(0, 0, 40, "w"), ngon(8, 42, "w"), ngon(6, 42, "w")];
  const cell = (r: number, s: number[]): Fig => [FR[r], ...[...s].sort().flatMap(spoke), dot(0, 0, 5, "b")];
  const and = (a: number[], b: number[]) => a.filter((x) => b.includes(x));
  const rows = [[[0, 1, 3, 5], [1, 2, 5, 6]], [[0, 2, 4, 6, 7], [0, 3, 4, 7]], [[0, 2, 3, 5, 6], [0, 1, 3, 4, 6]]];
  for (const [a, b] of rows.slice(0, 2)) assert.notDeepEqual(and(a, b), [...new Set([...a, ...b])], "15#28: gabungan harus gugur");
  const [a, b] = rows[2], ans = and(a, b);
  assert.deepEqual(ans, [0, 3, 6]);
  const opts = place(cell(2, ans), [cell(2, [...new Set([...a, ...b])]), cell(2, [1, 2, 4, 5]), cell(2, [2, 5]), cell(2, [0, 3])], "C");
  const grid = (last: Fig | null) => rows.map(([x, y], r) => [cell(r, x), cell(r, y), r < 2 ? cell(r, and(x, y)) : last]);
  const ann = (at: (r: number, c: number) => Pt, s: number) =>
    ["(1)", "(2)", "sama di (1) dan (2)"].map((t, c) => redText(at(0, c)[0], 34, t, 24)).join("") +
    [0, 1, 2].map((c) => ans.map((d) => { const [x, y] = dir(d), [px, py] = fp([29 * x, 29 * y], at(2, c), s); return redRing(px, py, 15); }).join("")).join("");
  add15(28, "C", POLA, gridS(grid(null), opts), 2,
    "Pada setiap baris, gambar kolom 3 hanya memuat jari-jari (garis berbandul) yang ada di kolom 1 dan juga ada di kolom 2; jari-jari yang hanya muncul di salah satu kolom dibuang. Baris 1: kolom 1 punya atas, kanan atas, kanan bawah, kiri bawah; kolom 2 punya kanan atas, kanan, kiri bawah, kiri; yang sama hanya kanan atas dan kiri bawah. Baris 3: kolom 1 punya atas, kanan, kanan bawah, kiri bawah, kiri; kolom 2 punya atas, kanan atas, kanan bawah, bawah, kiri; yang sama adalah atas, kanan bawah, dan kiri.\n\nOpsi a gugur karena menggabungkan semua jari-jari. Opsi b gugur karena justru mengambil jari-jari yang tidak sama. Opsi d gugur karena hanya mengambil jari-jari kolom 1 yang tidak ada di kolom 2. Opsi e gugur karena kehilangan jari-jari kiri. Jawaban: c.",
    gridS(grid(cell(2, ans)), null, { top: 50, hl: [2, 2], ann }));
}
// 15#29 — matriks (HOTS, 3 lapis): badan putar 90° ↻ per kolom, satelit sudut 1 langkah ↺, titik kolom 3 = kolom 1 + kolom 2.
{
  const BODY: Pt[][] = [[[0, -34], [30, -8], [30, 30], [-30, 30], [-30, -8]], [[-32, -22], [32, -22], [18, 26], [-18, 26]], [[-30, -30], [10, -30], [30, 30], [-30, 30]]];
  const DY = [10, -2, 8], CORNER: Pt[] = [[-37, -37], [-37, 37], [37, 37], [37, -37]]; // kiri atas, kiri bawah, kanan bawah, kanan atas (berlawanan arah jarum jam)
  const cell = (b: number, deg: number, corner: number, n: number): Fig => [...tf([poly(BODY[b], "w"), ...dotsRow(n, DY[b], "b", 11, 4.5)], deg % 360), dot(...CORNER[corner % 4], 6, "b")];
  const rows = [[0, 0, 3, 3, 1], [1, 90, 1, 2, 2], [2, 90, 2, 2, 1]]; // badan, sudut awal, sudut satelit awal, titik kolom 1, titik kolom 2
  const at = (r: number, c: number) => { const [b, d, k, n1, n2] = rows[r]; return cell(b, d + 90 * c, k + c, [n1, n2, n1 + n2][c]); };
  assert.ok(rows.some(([, , , n1, n2]) => n1 + n2 !== n2 + 1) && rows.some(([, , , n1, n2]) => n1 + n2 !== n1 * n2), "15#29: aturan titik alternatif harus gugur");
  const opts = place(at(2, 2), [cell(2, 180, 0, 3), cell(2, 270, 2, 3), cell(2, 270, 0, 2), cell(2, 90, 0, 3)], "E");
  const grid = (last: Fig | null) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : at(r, c))));
  const ann = (at2: (r: number, c: number) => Pt, s: number) => [0, 1, 2].map((r) => [0, 1].map((c) => {
    const [x1, y] = at2(r, c), [x2] = at2(r, c + 1);
    return redArrow([x1 + s / 2 + 4, y], [x2 - s / 2 - 4, y]);
  }).join("") + [0, 1, 2].map((c) => { const [px, py] = fp(CORNER[(rows[r][2] + c) % 4], at2(r, c), s); return redRing(px, py, 14); }).join("")).join("") +
    foot(["→ badan berputar 90° searah jarum jam", "→ titik sudut pindah 1 sudut berlawanan arah jarum jam", "→ titik di badan: kolom 1 + kolom 2 = kolom 3"], at2(2, 0)[1] + s / 2 + 42);
  add15(29, "E", POLA, gridS(grid(null), opts), 3,
    "Ada tiga aturan yang berjalan bersamaan dari kolom ke kolom pada setiap baris. (1) Badan bangun berputar 90° searah jarum jam (baris 3: trapesium siku 90°, lalu 180°, jadi berikutnya 270°). (2) Titik hitam di sudut kotak pindah satu sudut berlawanan arah jarum jam (baris 3: kanan bawah, kanan atas, jadi berikutnya kiri atas). (3) Jumlah titik di dalam badan kolom 3 = kolom 1 + kolom 2 (baris 1: 3 + 1 = 4, baris 2: 2 + 2 = 4, baris 3: 2 + 1 = 3).\n\nOpsi a gugur karena badan tidak diputar lagi (masih 180°). Opsi b gugur karena titik sudut pindah searah jarum jam ke kanan bawah. Opsi c gugur karena titiknya hanya 2. Opsi d gugur karena badan diputar ke arah sebaliknya. Jawaban: e.",
    gridS(grid(at(2, 2)), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 15#30 — matriks (HOTS, 3 lapis): bangun dalam → bangun luar kolom berikutnya, warna ikut bangun, titik kolom 3 = kolom 1 − kolom 2.
{
  const OUT: Record<string, (f: Fill) => Prim> = { L: (f) => dot(0, 0, 30, f), T: (f) => ngon(3, 38, f), P: (f) => shape("seg4", 40, f), H: (f) => ngon(6, 30, f) };
  const IN: Record<string, (f: Fill) => Prim> = { L: (f) => dot(0, 0, 11, f), T: (f) => ngon(3, 16, f), P: (f) => shape("seg4", 17, f), H: (f) => ngon(6, 13, f) };
  const F: Fill[] = ["w", "b", "w"]; // warna bangun ke-1, 2, 3 dalam satu baris
  const cell = (o: string, fo: Fill, i: string, fi: Fill, n: number): Fig => [OUT[o](fo), IN[i](fi), ...dotsRow(n, 41, "b", 11, 4)];
  const rows: [string[], number[]][] = [[["P", "L", "T"], [4, 1]], [["T", "H", "L"], [3, 2]], [["H", "T", "L"], [4, 2]]];
  const at = (r: number, c: number) => { const [s, [n1, n2]] = rows[r], j = (c + 1) % 3; return cell(s[c], F[c], s[j], F[j], [n1, n2, n1 - n2][c]); };
  assert.ok(rows.some(([, [n1, n2]]) => n1 - n2 !== n1 - 1), "15#30: aturan 'kurangi 1' harus gugur");
  const opts = place(at(2, 2), [cell("L", "w", "H", "b", 2), cell("L", "w", "T", "b", 2), cell("H", "w", "L", "w", 2), cell("L", "w", "H", "w", 6)], "A");
  const grid = (last: Fig | null) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : at(r, c))));
  const ann = (at2: (r: number, c: number) => Pt, s: number) => [0, 1, 2].map((r) => [0, 1].map((c) => {
    const a = at2(r, c), b = at2(r, c + 1);
    return redArrow([a[0] + 10, a[1] - 4], [b[0] - s * 0.3, b[1] - s * 0.18]);
  }).join("")).join("") + foot(["→ bangun dalam membesar menjadi bangun luar berikutnya", "→ warna ikut bangunnya · titik: kolom 1 − kolom 2"], at2(2, 0)[1] + s / 2 + 42);
  add15(30, "A", POLA, gridS(grid(null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Bangun kecil di dalam membesar menjadi bangun luar pada kolom berikutnya, dan bangun dalam kolom 3 adalah bangun luar kolom 1 (tiga bangun bergiliran). (2) Warna menempel pada bangunnya, bukan pada posisinya: bangun pertama dan ketiga selalu putih, bangun kedua selalu hitam, sehingga di kolom 3 bangun putih berada di dalam bangun putih (lihat kolom 3 baris 1 dan 2). (3) Jumlah titik di bawah kolom 3 = kolom 1 − kolom 2 (4 − 1 = 3, 3 − 2 = 1, 4 − 2 = 2). Jadi jawabannya lingkaran putih berisi segi enam putih dengan 2 titik.\n\nOpsi b gugur karena segi enamnya hitam; aturan 'dalam selalu kebalikan luar' sudah gugur di kolom 3 baris 1 dan 2. Opsi c gugur karena bangun dalamnya segitiga (menyalin bangun luar kolom 2). Opsi d gugur karena bangun luar dan dalam tertukar. Opsi e gugur karena titiknya dijumlahkan (6). Jawaban: a.",
    gridS(grid(at(2, 2)), null, { gap: 42, hl: [2, 2], ann, foot: 106 }));
}
// 15#31 — rotasi (sedang): putar 135° searah jarum jam; bangun coretan kiral.
{
  const base: Fig = [line([-26, 28], [-26, -12], 5), line([-26, -12], [-8, -30], 5), line([-8, -30], [22, -30], 5), line([-36, 6], [-14, -2], 4), dot(-6, 12, 7, "b"), poly([[12, 28], [30, 28], [30, 12]], "b")];
  assertChiral(base, "15#31");
  for (const d of [0, 45, 90, 135, 180, 225, 270, 315]) assert.notEqual(sig(tf(base, 135, true)), sig(tf(base, d)), "15#31: cerminan sama dengan putaran");
  const opts = place(tf(base, 135), [tf(base, 225), tf(base, 135, true), tf(base, 90), tf(base, 180)], "B");
  const ann: Ann = (at, s) => { const a = at(0, 0), b = at(0, 1), d0 = fp([-6, 12], a, s), d1 = fp((tf([dot(-6, 12, 7, "b")], 135)[0] as { c: Pt }).c, b, s); return redArrow([a[0] + s / 2 + 10, a[1]], [b[0] - s / 2 - 10, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - 18, "135°", 28) + redText((a[0] + b[0]) / 2, a[1] + 34, "searah", 22) + redRing(...d0, 20) + redRing(...d1, 20); };
  add15(31, "B", "Gambar di atas diputar 135° searah jarum jam. Pilihlah satu gambar yang merupakan hasilnya.", gridS([[base]], opts, { size: 170 }), 2,
    "Putaran 135° searah jarum jam = 90° lalu 45° lagi, jadi gambar hasilnya miring. Pakai tiga patokan: kait (garis berbelok) yang semula di kiri atas pindah ke kanan bawah, segitiga hitam yang semula di kanan bawah pindah ke kiri, dan titik hitam yang semula sedikit di kiri bawah pusat pindah ke sedikit di atas pusat. Karena hanya diputar, urutan ketiga patokan itu (dibaca searah jarum jam) tidak berubah.\n\nOpsi a gugur karena diputar 135° berlawanan arah jarum jam. Opsi c gugur karena merupakan cerminan, sehingga urutan patokannya terbalik. Opsi d gugur karena baru diputar 90°. Opsi e gugur karena diputar 180°. Jawaban: b.",
    gridS([[base, tf(base, 135)]], null, { size: 170, gap: 160, top: 40, hl: [0, 1], ann }));
}
// 15#32 — rotasi (HOTS, 3 lapis): putar 180°, cermin tegak, lalu warna dibalik (= cermin mendatar + balik warna).
{
  const base: Fig = [poly([[-30, -30], [14, -30], [30, -14], [30, 4], [-6, 4], [-6, 30], [-30, 30]], "w"), dot(16, -14, 6, "b"), poly([[-26, 12], [-10, 12], [-26, 26]], "b")];
  assertChiral(base, "15#32");
  const ans = invF(tf(base, 180, true));
  const opts = place(ans, [tf(base, 180, true), invF(tf(base, 0, true)), invF(tf(base, 180)), invF(tf(base, 90, true))], "C");
  const mirrorLine: Ann = (at, s) => { const [x, y] = at(0, 0); return `<line x1="${x + s / 2 + 18}" y1="${y - s / 2 - 6}" x2="${x + s / 2 + 18}" y2="${y + s / 2 + 6}" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>`; };
  const steps = (at: (r: number, c: number) => Pt, s: number) => ["180°", "cermin", "balik"].map((t, i) => {
    const a = at(0, i), b = at(0, i + 1);
    return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 24);
  }).join("") + redText(W / 2, at(0, 0)[1] + s / 2 + 44, "180° + cermin tegak = cermin mendatar", 25);
  add15(32, "C", "Gambar di atas diputar 180°, kemudian dicerminkan terhadap cermin tegak (garis putus-putus), lalu warnanya dibalik (hitam menjadi putih, putih menjadi hitam). Pilihlah satu gambar yang merupakan hasil akhirnya.", gridS([[base]], opts, { size: 170, ann: mirrorLine }), 3,
    "Kerjakan tiga langkah berurutan. (1) Putar 180°: blok lebar pindah ke bawah dan kaki pindah ke kanan atas. (2) Cermin tegak: kiri dan kanan ditukar, jadi kaki kembali ke kiri atas; gabungan langkah 1 dan 2 sama dengan cermin mendatar (atas-bawah dibalik saja). (3) Balik warna: badan menjadi hitam, titik dan segitiga menjadi putih. Hasilnya: kaki hitam di kiri atas, blok lebar di bawah dengan titik putih di kanan bawah, segitiga putih di kiri atas.\n\nOpsi a gugur karena warnanya tidak dibalik. Opsi b gugur karena hanya dicerminkan tegak tanpa diputar. Opsi d gugur karena hanya diputar 180° tanpa dicerminkan. Opsi e gugur karena diputar 90°, bukan 180°. Jawaban: c.",
    gridS([[base, tf(base, 180), tf(base, 180, true), ans]], null, { gap: 50, top: 46, hl: [0, 3], ann: steps, foot: 64 }));
}
// 15#35 — analogi (HOTS, 3 lapis): bangun luar ↔ dalam bertukar, titik sudut pindah 1 sudut searah jarum jam, jumlah titik +1.
{
  const OUT: Record<string, Prim> = { H: ngon(6, 32, "w"), T: ngon(3, 38, "w"), L: dot(0, 0, 31, "w"), P: shape("seg4", 38, "w") };
  const IN: Record<string, Prim> = { H: ngon(6, 13, "b"), T: ngon(3, 15, "b"), L: dot(0, 0, 11, "b"), P: shape("seg4", 17, "b") };
  const CR: Pt[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; // kiri atas, kanan atas, kanan bawah, kiri bawah (searah jarum jam)
  const fig = (o: string, i: string, k: number, n: number): Fig => [OUT[o], IN[i], ...Array.from({ length: n }, (_, j) => dot(CR[k][0] * (39 - 12 * j), CR[k][1] * 39, 4.5, "b"))];
  const A = fig("H", "T", 0, 1), B = fig("T", "H", 1, 2), C = fig("L", "P", 3, 2), ans = fig("P", "L", 0, 3);
  const opts = place(ans, [fig("L", "P", 0, 3), fig("P", "L", 1, 3), fig("P", "L", 0, 2), fig("P", "L", 3, 3)], "E");
  assert.ok( // A→B juga terbaca "cermin kiri-kanan" (C → kanan bawah): tak boleh ada opsi bertitik di kanan bawah
    opts.every((f) => !sig(f).includes(`cx="${r1(39)}" cy="${r1(39)}"`)), "15#35: opsi kanan bawah membuat bacaan cermin sah");
  const ring: Ann = (at, s) => ([[0, 0, 1], [1, 1, 2], [2, 3, 2], [3, 0, 3]] as const).map(([c, k, n]) => redRing(...fp([CR[k][0] * (39 - 6 * (n - 1)), CR[k][1] * 39], at(0, c), s), 12 + 7 * n)).join("") +
    foot(["① bangun luar ↔ bangun dalam bertukar", "② titik sudut pindah 1 sudut searah jarum jam", "③ jumlah titik bertambah 1"], at(0, 0)[1] + s / 2 + 40);
  add15(35, "E", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Bangun luar dan bangun dalam bertukar tempat: segi enam besar berisi segitiga hitam menjadi segitiga besar berisi segi enam hitam (bangun luar selalu putih, bangun dalam selalu hitam). (2) Kelompok titik di sudut pindah satu sudut searah jarum jam (kiri atas → kanan atas). (3) Jumlah titiknya bertambah satu (1 → 2). Terapkan pada gambar ketiga: lingkaran berisi persegi hitam menjadi persegi besar berisi lingkaran hitam, titik pindah dari kiri bawah ke kiri atas, dan jumlahnya menjadi 3.\n\nPergeseran kiri atas → kanan atas sebenarnya juga bisa dibaca sebagai cermin kiri-kanan; menurut bacaan itu titik pindah ke kanan bawah, tetapi tidak ada opsi dengan titik di kanan bawah, jadi yang berlaku adalah perpindahan satu sudut searah jarum jam. Opsi a gugur karena bangun luar dan dalam tidak bertukar. Opsi b gugur karena titik melompat dua sudut (ke kanan atas). Opsi c gugur karena titiknya tidak bertambah. Opsi d gugur karena titik tidak berpindah sudut. Jawaban: e.",
    analogyS([A, B, C, ans], null, { hl: true, ann: ring, foot: 120 }));
}
// 15#36 — analogi (HOTS, 3 lapis): dibelah tegak + belahan kanan turun, belahan kanan hitam, bangun kecil keluar ke atas.
{
  const HALF: Record<string, [Pt[], Pt[]]> = {
    rumah: [[[0, -28], [-26, -6], [-26, 26], [0, 26]], [[0, -28], [26, -6], [26, 26], [0, 26]]],
    segi6: [[[0, -26], [-22.5, -13], [-22.5, 13], [0, 26]], [[0, -26], [22.5, -13], [22.5, 13], [0, 26]]],
  };
  const SMALL = { rumah: (x: number, y: number) => dot(x, y, 7, "b"), segi6: (x: number, y: number): Prim => ({ k: "poly", pts: regular(4, 10, 45).map(([a, b]) => [r1(a + x), r1(b + y)] as Pt), fill: "b" }) };
  const mv = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [r1(x + dx), r1(y + dy)]);
  const whole = (k: "rumah" | "segi6"): Fig => [poly([...HALF[k][1], ...HALF[k][0].slice(1, 3).reverse()], "w"), SMALL[k](0, 6)];
  const cut = (k: "rumah" | "segi6", o: { down?: "R" | "L"; black?: "R" | "L" | "-"; small?: "atas" | "dalam" } = {}): Fig => {
    const down = o.down ?? "R", black = o.black ?? "R", sm = o.small ?? "atas";
    return [poly(mv(HALF[k][0], -3, 4 + (down === "L" ? 10 : 0)), black === "L" ? "b" : "w"), poly(mv(HALF[k][1], 3, 4 + (down === "R" ? 10 : 0)), black === "R" ? "b" : "w"),
      sm === "atas" ? SMALL[k](0, -35) : SMALL[k](-13, 10)];
  };
  const ans = cut("segi6");
  const opts = place(ans, [cut("segi6", { down: "L" }), cut("segi6", { black: "-" }), cut("segi6", { small: "dalam" }), cut("segi6", { black: "L" })], "D");
  const ann: Ann = (at, s) => [2, 3].map((c) => { const [x, y] = at(0, c); return `<line x1="${x}" y1="${y - s / 2 + 8}" x2="${x}" y2="${y + s / 2 - 8}" stroke="#d32f2f" stroke-width="3" stroke-dasharray="7 6"/>`; }).join("") +
    redArrow(fp([16, 0], at(0, 3), s), fp([16, 22], at(0, 3), s)) +
    foot(["① dibelah tegak, belahan kanan turun", "② belahan kanan menjadi hitam", "③ bangun kecil keluar ke atas"], at(0, 0)[1] + s / 2 + 40);
  add15(36, "D", ANALOGI, analogyS([whole("rumah"), cut("rumah"), whole("segi6"), null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Bangun dibelah pada garis tegak tengahnya, lalu belahan kanan turun sedikit sementara belahan kiri tetap. (2) Belahan kanan berubah menjadi hitam, belahan kiri tetap putih. (3) Bangun kecil hitam yang semula di dalam pindah ke luar, di atas belahan. Terapkan pada segi enam berisi persegi hitam: segi enam dibelah tegak, belahan kanan turun dan hitam, persegi kecil pindah ke atas.\n\nOpsi a gugur karena yang turun belahan kiri. Opsi b gugur karena belahan kanan tidak menjadi hitam. Opsi c gugur karena persegi kecil masih di dalam. Opsi e gugur karena yang menjadi hitam belahan kiri. Jawaban: d.",
    analogyS([whole("rumah"), cut("rumah"), whole("segi6"), ans], null, { hl: true, ann, foot: 120 }));
}
// 15#37 — ikon kategori (sedang): titik di dalam bangun vs di celah U; ciri lain terbagi 3/2 (keluarga U/T, bercabang, titik kiri/tengah, atas/bawah).
{
  const pip = (P: Pt[], [x, y]: Pt) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const edge = (P: Pt[], [x, y]: Pt) => Math.min(...P.map(([ax, ay], i) => { const [bx, by] = P[(i + 1) % P.length], t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2))); return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)); }));
  const S: [Pt[], Pt, boolean][] = [
    [[[-30, -30], [30, -30], [30, -14], [-12, -14], [-12, 14], [30, 14], [30, 30], [-30, 30]], [21, 22], true],
    [[[30, -30], [-30, -30], [-30, -14], [12, -14], [12, 14], [-30, 14], [-30, 30], [30, 30]], [-21, 22], true],
    [[[-30, -30], [-14, -30], [-14, 14], [14, 14], [14, -30], [30, -30], [30, 30], [-30, 30]], [0, -10], false],
    [[[-30, -30], [30, -30], [30, -12], [10, -12], [10, 30], [-10, 30], [-10, -12], [-30, -12]], [21, -21], true],
    [[[-30, -30], [-12, -30], [-12, -10], [30, -10], [30, 10], [-12, 10], [-12, 30], [-30, 30]], [-21, -21], true],
  ];
  for (const [P, d, isIn] of S) { assert.equal(pip(P, d), isIn, "15#37: posisi titik"); assert.ok(edge(P, d) >= 7.5, "15#37: titik terlalu dekat garis"); }
  const fig = ([P, d]: [Pt[], Pt, boolean]): Fig => [poly(P, "w"), dot(...d, 5, "b")];
  const opts = place(fig(S[2]), [S[0], S[1], S[3], S[4]].map(fig), "C");
  const o = optionsRowS(opts, 20, { hl: 2 }), lab = o.body + opts.map((_, i) => redText(o.at(i)[0], o.bottom + 14, i === 2 ? "di luar" : "di dalam", 24)).join("") + redRing(...fp(S[2][1], o.at(2), o.size), 16);
  add15(37, "C", GANJIL, svgWrap(o.bottom, optionsRowS(opts, 20).body), 2,
    "Perhatikan letak titik hitam terhadap bangunnya. Pada gambar a, b, d, dan e, titik hitam berada di dalam bangun, yaitu di bidang putih yang dibatasi garis tepi (selalu di ujung bebas sebuah lengan: lengan bawah huruf C, lengan bawah huruf C terbalik, ujung kanan palang huruf T, dan ujung atas batang bangun ├). Pada gambar c, titik hitam berada di celah huruf U: dikelilingi bangun dari tiga sisi, tetapi tetap di luar bangun.\n\nCiri lain tidak memisahkan satu gambar saja. Kelima bangun sama-sama bersudut siku, bersisi 8, dan punya satu sumbu simetri. Bentuk dasarnya terbagi tiga (C, C terbalik, U) dan dua (T, ├); yang bercabang hanya T dan ├. Titiknya di kanan pada dua gambar (a, d) dan di kiri pada dua gambar (b, e); di atas pada tiga gambar (c, d, e) dan di bawah pada dua gambar (a, b). Satu-satunya ciri yang hanya dimiliki satu gambar adalah titik di luar bangun, jadi gambar c yang tidak termasuk kelompoknya. Jawaban: c.",
    svgWrap(o.bottom + 28, lab));
}

// ── output ───────────────────────────────────────────────────────────────────
type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: null; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: Key; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: Key };
  tingkat: 2 | 3;
  pembahasan: string;
  pembahasan_svg?: string;
};
const all: Built[] = [...items, ...FIG2_ITEMS, ...FIG3_ITEMS, ...BUNDAR_ITEMS.map((b) => ({ ...b, pkg: 3 })), ...buildMosaik(3), ...BUNDAR15_ITEMS, ...FIG16_ITEMS, ...BUNDAR16_ITEMS, ...BUNDAR4_ITEMS, ...FIG4_ITEMS, ...BUNDAR5_ITEMS, ...FIG5_ITEMS, ...FIG19_ITEMS, ...BUNDAR19_ITEMS, ...MOSAIK20_ITEMS, ...FIG20_ITEMS, ...FIG20B_ITEMS, ...BUNDAR20_ITEMS];
const out: Record<number, Row[]> = {};
for (const it of all) {
  const choices = it.choices ?? ["a", "b", "c", "d", "e"];
  assert.equal(new Set(choices).size, 5, `pkg ${it.pkg} #${it.seq}: pilihan kembar`);
  (out[it.pkg] ??= []).push({
    sequence_number: it.seq,
    options_payload: { instruksi: it.instruksi, question_text: null, sub_text: null, is_multi_select: false, svg_content: it.svg, choices: KEYS.map((key, i) => ({ key, text: choices[i] })) },
    scoring_rule: { type: "dichotomous", correct_key: it.key },
    tingkat: it.tingkat,
    pembahasan: it.pembahasan,
    ...(it.pembahasan_svg ? { pembahasan_svg: it.pembahasan_svg } : {}),
  });
}
for (const rows of Object.values(out)) rows.sort((a, b) => a.sequence_number - b.sequence_number);
assert.deepEqual(out[13].map((r) => r.sequence_number), [28, 29, 30, 31, 32, 37]);
assert.deepEqual(out[2].map((r) => r.sequence_number), [31, 32, 35, 36, 37]);
assert.deepEqual(out[3].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
assert.deepEqual(out[15].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
assert.deepEqual(out[4].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
assert.deepEqual(out[5].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
assert.deepEqual(out[16].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
assert.deepEqual(out[19].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
assert.ok(out[19].every((r) => r.tingkat === 3), "pkg 19: semua gambar HOTS");
// pkg 20 (Simulasi 5): susun 33-34 dan denah 38-42 dibuat generator susun/denah; di sini mosaik, matriks, rotasi, analogi, ikon, bundar (semua HOTS)
assert.deepEqual(out[20].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
assert.ok(out[20].every((r) => r.tingkat === 3 && r.pembahasan_svg), "pkg 20: semua gambar HOTS + pembahasan_svg");
assert.equal(out[20].map((r) => r.scoring_rule.correct_key).join(""), "DBDCABEBAEDCAECE", "pkg 20: rencana huruf kunci");
for (const r of Object.values(out).flat()) {
  for (const svg of [r.options_payload.svg_content, r.pembahasan_svg ?? ""]) assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(svg), `SVG ${r.sequence_number} tidak aman`);
  // Gambar pembahasan dirender bersama butir lain di satu halaman review: tanpa id supaya tidak bentrok.
  assert.ok(!/\bid="/.test(r.pembahasan_svg ?? ""), `pembahasan_svg ${r.sequence_number} memakai id`);
}

const root = path.join(__dirname, "..");
fs.writeFileSync(path.join(root, "prisma/data/kecerdasan_figural_kal.json"), `${JSON.stringify(out, null, 2)}\n`);
fs.mkdirSync(path.join(root, "output"), { recursive: true });
fs.writeFileSync(path.join(root, "output/figural-kal-preview.html"),
  `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Figural Kalibrasi</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;max-width:900px}section{border:1px solid #aaa;margin:16px 0;padding:12px}svg{display:block;max-width:100%;height:auto}p{font-size:13px;line-height:1.5}</style><body>` +
  Object.entries(out).flatMap(([pkg, rows]) => rows.map((r) => `<section><h3>pkg ${pkg} · soal ${r.sequence_number} · tier ${r.tingkat} · kunci ${r.scoring_rule.correct_key}</h3><p><b>${r.options_payload.instruksi}</b></p>${r.options_payload.svg_content}${r.pembahasan_svg ? `<h4>Gambar pembahasan</h4>${r.pembahasan_svg}` : ""}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p><p>${r.pembahasan}</p></section>`)).join("") +
  `</body></html>`);
console.log(`OK: ${Object.entries(out).map(([p, r]) => `pkg ${p} ${r.length}`).join(", ")} soal figural/bundar → prisma/data/kecerdasan_figural_kal.json`);
