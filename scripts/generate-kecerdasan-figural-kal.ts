import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { BOX, INK, KEYS, W, type Fig, type Fill, type Key, type Prim, type Pt, analogyItem, box, draw, gridItem, optionsRow, place, r1, regular, shape, sig, stimulusItem, svgWrap, tf } from "./figural-lib";
import { BUNDAR_ITEMS } from "./figural-kal-bundar";

// Figural baru untuk kalibrasi Logis/Spasial 2026-10-12 (blok 26-37):
//   26-27 deret · 28-30 matriks 3×3 · 31-32 rotasi/cermin · 33-34 susun · 35-36 analogi · 37 ikon kategori
// pkg 13 (Simulasi 1 baru): 28-30, 31-32, 37 (+ susun 34 dari generate-kecerdasan-susun-kal.ts)
// pkg 2 (Latihan Paket 1): 31-32, 35-36, 37
// pkg 3 (Latihan Paket 2): 26-32, 35-37 (+ susun 33-34) + pola bundar 51-56 (figural-kal-bundar.ts)
// Primitif sama dengan s2 (figural-lib.ts): opsi kembar tertangkap oleh place().
//   npx tsx scripts/generate-kecerdasan-figural-kal.ts
// Output: prisma/data/kecerdasan_figural_kal.json ({ [pkg]: Row[] }) + output/figural-kal-preview.html

type Built = { pkg: number; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; choices?: string[] };
const items: Built[] = [];
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const GANJIL = "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.";
const ROTASI = "Pilihlah satu gambar yang merupakan hasil perputaran (rotasi) dari gambar di atas, bukan pencerminannya.";
const add = (pkg: number, seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string) => {
  assert.match(pembahasan, new RegExp(`Jawaban: ${key.toLowerCase()}\\.$`), `pkg ${pkg} #${seq}: pembahasan tidak menyebut kunci`);
  items.push({ pkg, seq, key, instruksi, svg, tingkat, pembahasan });
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

// ═════════════ pkg 2 ═════════════

// 2#31 — rotasi: satu hasil putaran 180°, sisanya cerminan.
{
  const base: Fig = [poly([[-30, -10], [-10, -10], [-10, -30], [10, -30], [10, 10], [30, 10], [30, 30], [-10, 30], [-10, 10], [-30, 10]], "w"), dot(0, -18, 5, "b"), poly([[14, 14], [26, 14], [26, 26]], "b")];
  assertChiral(base, "2#31");
  const opts = place(tf(base, 180), [tf(base, 0, true), tf(base, 90, true), tf(base, 180, true), tf(base, 270, true)], "C");
  add(2, 31, "C", ROTASI, stimulusItem(base, false, opts), 2,
    "Patokannya titik hitam dan segitiga hitam. Pada gambar soal, segitiga ada di kanan bawah dan titik di bagian atas tengah; bergerak searah jarum jam dari titik, segitiga ditemui setelah melewati sisi kanan. Gambar c adalah gambar soal yang diputar 180°: titik pindah ke bawah, segitiga ke kiri atas, dan urutan searah jarum jamnya tetap. Gambar a, b, d, dan e adalah cerminan (kemudian diputar), sehingga urutannya terbalik. Jawaban: c.");
}

// 2#32 — cermin tegak saja.
{
  const base: Fig = [dot(-16, -16, 13, "w"), dot(-16, -16, 5, "b"), line([-6, -6], [26, 26], 6), line([12, 12], [20, 4], 5), line([20, 20], [28, 12], 5)];
  assertChiral(base, "2#32");
  const opts = place(tf(base, 0, true), [tf(base, 180, true), tf(base, 180), tf(base, 90), tf(base, 270, true)], "D");
  add(2, 32, "D", "Gambar di atas dicerminkan terhadap cermin tegak pada garis putus-putus. Pilihlah satu gambar yang merupakan hasil cerminannya.", stimulusItem(base, true, opts), 2,
    "Cermin tegak hanya menukar kiri dan kanan; atas dan bawah tetap. Pada gambar soal, kepala kunci ada di kiri atas dan batangnya turun ke kanan bawah, dengan gerigi menghadap ke kanan atas. Pada cerminannya, kepala kunci pindah ke kanan atas, batang turun ke kiri bawah, dan gerigi menghadap ke kiri atas, yaitu gambar d. Opsi a adalah cerminan terhadap cermin mendatar. Opsi b dan c hanya diputar. Opsi e dicerminkan lalu diputar. Jawaban: d.");
}

// 2#35 — analogi: putar 90° berlawanan arah jarum jam, titik bertambah 1.
{
  const fig = (body: "sepatu" | "bendera", dots: number, deg: number, mirror = false): Fig => {
    const b: Fig = body === "sepatu"
      ? [poly([[-24, -30], [-6, -30], [-6, 10], [26, 10], [26, 30], [-24, 30]], "w")]
      : [line([-18, 30], [-18, -30], 5), poly([[-18, -30], [20, -18], [-18, -6]], "b")];
    const ds = Array.from({ length: dots }, (_, i): Prim => dot(body === "sepatu" ? -15 : 8, (body === "sepatu" ? -20 : 4) + i * 9, 3.5, "b"));
    return tf([...b, ...ds], deg, mirror);
  };
  const opts = place(fig("bendera", 3, 270), [fig("bendera", 3, 90), fig("bendera", 2, 270), fig("bendera", 3, 270, true), fig("bendera", 3, 0)], "A");
  add(2, 35, "A", ANALOGI, analogyItem([fig("sepatu", 1, 0), fig("sepatu", 2, 270), fig("bendera", 2, 0)], opts), 3,
    "Dari gambar pertama ke kedua ada dua perubahan: gambar diputar 90° berlawanan arah jarum jam (bagian yang semula di atas pindah ke kiri), dan titiknya bertambah satu (1 menjadi 2). Gambar ketiga adalah bendera dengan 2 titik, jadi jawabannya bendera yang diputar 90° berlawanan arah jarum jam (tiang mendatar, segitiga menunjuk ke bawah) dengan 3 titik. Opsi b diputar searah jarum jam. Opsi c titiknya tidak bertambah. Opsi d adalah cerminan. Opsi e tidak diputar. Jawaban: a.");
}

// 2#36 — analogi: sisi bangun +1, warna dibalik, titik +1.
{
  const fig = (n: number, f: Fill, dots: number): Fig => [ngon(n, n === 3 ? 42 : 36, f), ...dotsRow(dots, n === 3 ? 8 : 0, inv(f), 11, 4)];
  const opts = place(fig(6, "b", 4), [fig(6, "w", 4), fig(5, "b", 4), fig(6, "b", 3), fig(7, "b", 4)], "E");
  add(2, 36, "E", ANALOGI, analogyItem([fig(3, "w", 1), fig(4, "b", 2), fig(5, "w", 3)], opts), 3,
    "Dari gambar pertama ke kedua: segitiga menjadi persegi (sisi bertambah satu), warna dibalik (putih menjadi hitam, titik hitam menjadi putih), dan titik bertambah satu (1 menjadi 2). Gambar ketiga segi lima putih dengan 3 titik, jadi jawabannya segi enam hitam dengan 4 titik putih. Opsi a gugur karena warnanya tidak dibalik. Opsi b gugur karena sisinya tidak bertambah. Opsi c gugur karena titiknya tidak bertambah. Opsi d gugur karena sisinya bertambah dua. Jawaban: e.");
}

// 2#37 — ikon kategori: empat bangun bersisi 6, satu bersisi 7.
{
  const H1: Fig = [poly([[-30, -18], [0, -34], [30, -18], [30, 18], [0, 34], [-30, 18]], "b")];
  const H2: Fig = [poly([[-28, -28], [0, -28], [0, 0], [28, 0], [28, 28], [-28, 28]], "w")];
  const H3: Fig = [poly([[-30, -24], [0, 0], [30, -24], [30, 6], [0, 30], [-30, 6]], "w")];
  const H4: Fig = [poly([[-30, -20], [-10, -34], [30, -34], [30, 20], [10, 34], [-30, 34]], "b")];
  const odd: Fig = [poly([[-30, -12], [8, -12], [8, -30], [34, 0], [8, 30], [8, 12], [-30, 12]], "w")];
  const opts = place(odd, [H1, H2, H3, H4], "C");
  add(2, 37, "C", GANJIL, rowItem(opts), 2,
    "Hitung sisi tiap bangun. Gambar a, b, d, dan e masing-masing dibatasi 6 sisi, meskipun bentuknya berbeda-beda (ada yang cekung, ada yang cembung). Gambar c (panah) dibatasi 7 sisi. Warna bukan pembeda karena hitam dan putih masing-masing muncul lebih dari satu kali, dan bentuk cekung juga muncul lebih dari satu kali. Jawaban: c.");
}

// ═════════════ pkg 3 ═════════════

// 3#26 — deret: jarum berputar 135° searah jarum jam, segitiga sudut pindah berlawanan arah jarum jam, pusat hitam/putih bergantian.
{
  const CORNER: Pt[] = [[-1, -1], [-1, 1], [1, 1], [1, -1]]; // kiri atas → kiri bawah → kanan bawah → kanan atas (berlawanan arah jarum jam)
  const frame = (deg: number, corner: number, center: Fill): Fig => {
    const a = (deg * Math.PI) / 180, [sx, sy] = CORNER[corner % 4], c = 40;
    return [
      line([0, 0], [r1(26 * Math.sin(a)), r1(-26 * Math.cos(a))], 4), dot(r1(30 * Math.sin(a)), r1(-30 * Math.cos(a)), 5, "b"),
      poly([[sx * c, sy * c], [sx * (c - 14), sy * c], [sx * c, sy * (c - 14)]], "b"), dot(0, 0, 8, center),
    ];
  };
  const seq = [0, 1, 2, 3].map((i) => frame((135 * i) % 360, i, i % 2 ? "w" : "b"));
  const opts = place(frame(180, 4, "b"), [frame(180, 3, "b"), frame(225, 4, "b"), frame(180, 4, "w"), frame(90, 4, "b")], "A");
  add(3, 26, "A", POLA, gridItem([[...seq, null]], opts), 3,
    "Ada tiga aturan yang berjalan bersamaan. (1) Jarum berputar 135° searah jarum jam setiap langkah: atas (0°), kanan bawah (135°), kiri (270°), kanan atas (45°), jadi berikutnya bawah (180°). (2) Segitiga hitam di sudut pindah berlawanan arah jarum jam: kiri atas, kiri bawah, kanan bawah, kanan atas, lalu kembali ke kiri atas. (3) Lingkaran pusat bergantian hitam–putih, jadi gambar ke-5 hitam. Opsi b gugur karena segitiga masih di kanan atas. Opsi c gugur karena jarum menunjuk kiri bawah. Opsi d gugur karena pusatnya putih. Opsi e gugur karena jarum menunjuk kanan. Jawaban: a.");
}

// 3#27 — deret: jarum berbandul berputar 90° berlawanan arah jarum jam, garis kecil +2.
{
  const frame = (deg: number, ticks: number): Fig => {
    const a = (deg * Math.PI) / 180;
    return [dot(0, 0, 3, "b"), line([0, 0], [r1(18 * Math.sin(a)), r1(-18 * Math.cos(a))], 4), dot(r1(24 * Math.sin(a)), r1(-24 * Math.cos(a)), 6, "w"),
      ...Array.from({ length: ticks }, (_, i): Prim => line([r1((i - (ticks - 1) / 2) * 7), 37], [r1((i - (ticks - 1) / 2) * 7), 44], 2.5))];
  };
  const seq = [0, 270, 180, 90].map((d, i) => frame(d, 1 + 2 * i));
  const opts = place(frame(0, 9), [frame(0, 8), frame(90, 9), frame(180, 9), frame(0, 7)], "D");
  add(3, 27, "D", POLA, gridItem([[...seq, null]], opts), 2,
    "Dua aturan berjalan bersamaan. (1) Jarum berbandul berputar 90° berlawanan arah jarum jam: atas, kiri, bawah, kanan, jadi berikutnya kembali ke atas. (2) Garis kecil di bawah bertambah dua: 1, 3, 5, 7, jadi 9. Opsi a gugur karena garisnya 8. Opsi b gugur karena jarum masih ke kanan. Opsi c gugur karena jarum ke bawah. Opsi e gugur karena garisnya tidak bertambah. Jawaban: d.");
}

// 3#28 — matriks: arah panah kolom 3 = arah kolom 1 + arah kolom 2 (sudut searah jarum jam dari atas).
{
  const arrow = (deg: number): Fig => tf([poly([[0, -32], [16, -10], [6, -10], [6, 28], [-6, 28], [-6, -10], [-16, -10]], "b")], deg % 360);
  const rows = [[45, 90], [180, 135], [270, 135]];
  assert.notEqual((rows[1][1] + 45) % 360, (rows[1][0] + rows[1][1]) % 360, "aturan 'kolom 2 + 45°' harus gugur");
  const opts = place(arrow(45), [arrow(315), arrow(135), arrow(225), arrow(90)], "B");
  add(3, 28, "B", POLA, gridItem(rows.map(([a, b], r) => [arrow(a), arrow(b), r < 2 ? arrow(a + b) : null]), opts), 3,
    "Ukur arah panah sebagai sudut searah jarum jam dari arah atas (atas = 0°, kanan atas = 45°, kanan = 90°, dan seterusnya). Pada setiap baris, sudut panah kolom 3 = sudut kolom 1 + sudut kolom 2. Baris 1: 45° + 90° = 135° (kanan bawah). Baris 2: 180° + 135° = 315° (kiri atas). Baris 3: 270° + 135° = 405° = 45°, jadi panah menunjuk kanan atas. Aturan 'kolom 2 ditambah 45°' cocok untuk baris 1 tetapi gugur di baris 2. Opsi a memakai selisih. Opsi c hanya menyalin kolom 2. Opsi d berlawanan dengan jawaban. Opsi e salah hitung satu langkah. Jawaban: b.");
}

// 3#29 — matriks: kolom 3 = petak hitam kolom 1 yang tidak hitam di kolom 2.
{
  const s = 22;
  const cell = (black: number[]): Fig => {
    const g: Fig = [];
    for (let i = 0; i < 9; i++) { const x = (i % 3) - 1, y = Math.floor(i / 3) - 1; g.push(poly([[x * s - 10, y * s - 10], [x * s + 10, y * s - 10], [x * s + 10, y * s + 10], [x * s - 10, y * s + 10]], black.includes(i) ? "b" : "w")); }
    return g;
  };
  const minus = (a: number[], b: number[]) => a.filter((x) => !b.includes(x));
  const rows = [[[0, 2, 4, 6], [2, 3, 4]], [[1, 4, 5, 7], [1, 8]], [[0, 3, 4, 8], [4, 6, 8]]];
  const [a, b] = rows[2];
  const opts = place(cell(minus(a, b)), [cell([0, 3, 6]), cell([0, 3, 4, 6, 8]), cell([4, 8]), cell([6])], "C");
  add(3, 29, "C", POLA, gridItem(rows.map(([x, y], r) => [cell(x), cell(y), r < 2 ? cell(minus(x, y)) : null]), opts), 3,
    "Pada setiap baris, petak hitam kolom 3 adalah petak yang hitam di kolom 1 tetapi tidak hitam di kolom 2 (kolom 1 dikurangi kolom 2). Cek baris 1: kolom 1 hitam di kiri atas, kanan atas, tengah, kiri bawah; kolom 2 menutup kanan atas dan tengah; sisa kiri atas dan kiri bawah. Baris 3: kolom 1 hitam di kiri atas, kiri tengah, tengah, kanan bawah; kolom 2 menutup tengah dan kanan bawah; sisa kiri atas dan kiri tengah. Opsi a ikut menghitamkan petak yang hanya hitam di kolom 2. Opsi b menggabungkan semua petak hitam. Opsi d hanya mengambil petak yang sama. Opsi e memakai kolom 2 dikurangi kolom 1. Jawaban: c.");
}

// 3#30 — matriks: juring hitam berputar 90° searah jarum jam per kolom, titik luar pindah berlawanan arah jarum jam per baris.
{
  const sector = (q: number): Prim => {
    const a0 = -90 + 90 * q, pts: Pt[] = [[0, 0]];
    for (let i = 0; i <= 9; i++) { const a = ((a0 + 10 * i) * Math.PI) / 180; pts.push([r1(30 * Math.cos(a)), r1(30 * Math.sin(a))]); }
    return poly(pts, "b");
  };
  const P: Pt[] = [[0, -41], [41, 0], [0, 41], [-41, 0]]; // atas, kanan, bawah, kiri
  const cell = (q: number, d: number): Fig => [dot(0, 0, 30, "w"), sector(((q % 4) + 4) % 4), line([0, -30], [0, 30], 2.5), line([-30, 0], [30, 0], 2.5), dot(...P[((d % 4) + 4) % 4], 5, "b")];
  const q0 = [0, 3, 1], d0 = [0, 1, 2];
  const at = (r: number, c: number) => cell(q0[r] + c, d0[c] - r);
  const opts = place(at(2, 2), [cell(2, 0), cell(0, 0), cell(3, 2), cell(3, 1)], "D");
  add(3, 30, "D", POLA, gridItem([0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : at(r, c)))), opts), 3,
    "Ada dua aturan dari arah berbeda. (1) Dibaca mendatar (per baris), juring hitam berputar satu perempat searah jarum jam dari kolom ke kolom. Baris 3: kanan bawah → kiri bawah → berikutnya kiri atas. (2) Dibaca menurun (per kolom), titik hitam di luar lingkaran pindah satu posisi berlawanan arah jarum jam. Kolom 3: bawah → kanan → berikutnya atas. Jadi jawabannya juring kiri atas dengan titik di atas. Opsi a gugur karena juring tidak berputar. Opsi b gugur karena juring berputar dua langkah. Opsi c gugur karena titik tidak pindah. Opsi e gugur karena titik pindah ke arah yang salah. Jawaban: d.");
}

// 3#31 — rotasi 270° searah jarum jam.
{
  const base: Fig = [poly([[-30, -30], [6, -30], [30, -6], [30, 30], [-6, 30], [-6, 6], [-30, 6]], "w"), dot(16, 16, 6, "b"), line([-22, -20], [-4, -20], 4)];
  assertChiral(base, "3#31");
  const opts = place(tf(base, 270), [tf(base, 90), tf(base, 270, true), tf(base, 180), tf(base, 90, true)], "C");
  add(3, 31, "C", "Gambar di atas diputar 270° searah jarum jam. Pilihlah satu gambar yang merupakan hasilnya.", stimulusItem(base, false, opts), 2,
    "Putaran 270° searah jarum jam sama dengan putaran 90° berlawanan arah jarum jam. Bagian kanan gambar pindah ke atas dan bagian atas pindah ke kiri: titik hitam yang semula di kanan bawah pindah ke kanan atas, garis kecil yang semula di kiri atas pindah ke kiri bawah, dan sudut terpancung pindah ke kiri atas. Opsi a adalah putaran 90° searah jarum jam (arah terbalik). Opsi b dan e adalah cerminan. Opsi d adalah putaran 180°. Jawaban: c.");
}

// 3#32 — putar 90° searah jarum jam, lalu cermin tegak.
{
  const base: Fig = [poly([[-14, -32], [14, -32], [14, -12], [30, -12], [30, 4], [14, 4], [14, 32], [-14, 32]], "w"), dot(0, -22, 5, "b"), poly([[-14, 20], [0, 32], [-14, 32]], "b")];
  assertChiral(base, "3#32");
  // putar R90 lalu cermin M = R270·M → tf(.,270,true)
  const opts = place(tf(base, 270, true), [tf(base, 90, true), tf(base, 90), tf(base, 0, true), tf(base, 270)], "E");
  add(3, 32, "E", "Gambar di atas diputar 90° searah jarum jam, kemudian hasilnya dicerminkan terhadap cermin tegak. Pilihlah satu gambar yang merupakan hasil akhirnya.", stimulusItem(base, true, opts), 3,
    "Kerjakan sesuai urutan. Langkah 1 (putar 90° searah jarum jam): tonjolan yang semula di kanan pindah ke bawah, titik hitam yang semula di atas pindah ke kanan, dan segitiga hitam yang semula di kiri bawah pindah ke kiri atas. Langkah 2 (cermin tegak): kiri dan kanan ditukar, jadi tonjolan tetap di bawah, titik hitam pindah ke kiri, dan segitiga hitam pindah ke kanan atas. Opsi a mengerjakan urutan terbalik (cermin dulu, baru putar). Opsi b hanya diputar. Opsi c hanya dicerminkan. Opsi d diputar berlawanan arah tanpa cermin. Jawaban: e.");
}

// 3#35 — analogi: dicerminkan kiri-kanan dan warna dibalik.
{
  const fig = (kind: "perahu" | "gembok", f: Fill, deg = 0, mirror = false): Fig => tf(kind === "perahu"
    ? [poly([[-32, 6], [32, 6], [20, 26], [-26, 26]], f), line([-4, 6], [-4, -32], 4), poly([[-4, -32], [-4, 0], [24, 0]], inv(f)), dot(-20, 16, 4, inv(f))]
    : [poly([[-26, -4], [26, -4], [26, 32], [-26, 32]], f), line([-16, -4], [-16, -26], 5), line([-16, -26], [10, -26], 5), line([10, -26], [10, -14], 5), poly([[8, 8], [18, 8], [18, 22], [8, 22]], inv(f))], deg, mirror);
  const opts = place(fig("gembok", "b", 0, true), [fig("gembok", "w", 0, true), fig("gembok", "b", 180), fig("gembok", "b"), fig("gembok", "b", 180, true)], "B");
  add(3, 35, "B", ANALOGI, analogyItem([fig("perahu", "w"), fig("perahu", "b", 0, true), fig("gembok", "w")], opts), 3,
    "Dari gambar pertama ke kedua ada dua perubahan: gambar dicerminkan kiri-kanan (tiang dan layar pindah sisi, atas-bawah tetap), dan warnanya dibalik (badan putih menjadi hitam, bagian hitam menjadi putih). Terapkan pada gembok: lengkung gembok pindah ke sisi kanan, lubang kunci pindah ke kiri, badannya hitam dan lubang kuncinya putih. Opsi a gugur karena warnanya tidak dibalik. Opsi c gugur karena diputar 180°, bukan dicerminkan kiri-kanan. Opsi d gugur karena tidak dicerminkan. Opsi e gugur karena dicerminkan atas-bawah. Jawaban: b.");
}

// 3#36 — analogi: putar 90° searah jarum jam, garis melintang +2.
{
  const fig = (kind: "panah" | "palu", bars: number, deg: number): Fig => tf([
    line([0, 30], [0, -18], 5),
    kind === "panah" ? poly([[0, -34], [12, -16], [-12, -16]], "b") : poly([[-14, -34], [14, -34], [14, -20], [-14, -20]], "w"),
    ...Array.from({ length: bars }, (_, i): Prim => line([-8, 26 - i * 7], [8, 26 - i * 7], 3)),
  ], deg % 360);
  const opts = place(fig("palu", 5, 0), [fig("palu", 3, 0), fig("palu", 5, 180), fig("palu", 4, 0), fig("palu", 5, 270)], "A");
  add(3, 36, "A", ANALOGI, analogyItem([fig("panah", 1, 0), fig("panah", 3, 90), fig("palu", 3, 270)], opts), 3,
    "Dari gambar pertama ke kedua: panah diputar 90° searah jarum jam (dari menghadap atas menjadi menghadap kanan) dan garis melintangnya bertambah dua (1 menjadi 3). Gambar ketiga adalah palu yang menghadap kiri dengan 3 garis, jadi jawabannya palu yang menghadap atas (kiri diputar 90° searah jarum jam) dengan 5 garis. Opsi b sudah diputar tetapi garisnya tidak bertambah. Opsi c diputar berlawanan arah jarum jam. Opsi d garisnya hanya bertambah satu. Opsi e tidak diputar. Jawaban: a.");
}

// 3#37 — ikon kategori: empat gambar bersumbu simetri, satu hanya simetri putar.
{
  // kanonik: titik poligon diurutkan, ujung garis diurutkan → cermin dari bangun yang sama terbaca sama
  const canon = (fig: Fig) => fig.map((q) => q.k === "poly" ? `p${q.fill}${[...q.pts].map(([x, y]) => `${r1(x)},${r1(y)}`).sort().join(" ")}`
    : q.k === "circ" ? `c${q.fill}${r1(q.c[0])},${r1(q.c[1])},${q.r}` : `l${[q.a, q.b].map(([x, y]) => `${r1(x)},${r1(y)}`).sort().join(" ")}`).sort().join("|");
  const lineSym = (f: Fig) => [0, 180].some((d) => canon(tf(f, d, true)) === canon(f));
  const F1: Fig = [poly([[0, -34], [18, -8], [8, -8], [8, 30], [-8, 30], [-8, -8], [-18, -8]], "b"), dot(-22, 22, 5, "w"), dot(22, 22, 5, "w")];
  const F2: Fig = tf([poly([[-30, -24], [30, -24], [18, 24], [-18, 24]], "w"), dot(0, 0, 9, "b"), line([-24, -6], [24, -6], 3)], 90);
  const F3: Fig = [poly([[0, -34], [24, 0], [0, 34], [-24, 0]], "w"), poly([[0, -34], [12, -17], [-12, -17]], "b"), dot(0, 12, 5, "b")];
  const F4: Fig = tf([poly([[-30, -30], [30, -30], [30, -14], [8, -14], [8, 30], [-8, 30], [-8, -14], [-30, -14]], "b"), dot(0, 14, 5, "w")], 270);
  const odd: Fig = [poly([[-30, -26], [10, -26], [30, 26], [-10, 26]], "w"), dot(-18, -18, 5, "b"), dot(18, 18, 5, "b")];
  for (const [f, n] of [[F1, "F1"], [F2, "F2"], [F3, "F3"], [F4, "F4"]] as const) assert.ok(lineSym(f), `3#37 ${n} harus bersumbu simetri`);
  assert.ok(!lineSym(odd) && canon(tf(odd, 180)) === canon(odd), "3#37: pengecoh hanya boleh simetri putar");
  const opts = place(odd, [F1, F2, F3, F4], "C");
  add(3, 37, "C", GANJIL, rowItem(opts), 3,
    "Cari ciri yang sama pada empat gambar. Gambar a, b, d, dan e masing-masing punya sumbu simetri: jika dilipat pada garis tegak (a dan d) atau garis mendatar (b dan e), kedua belahnya tepat berimpit. Gambar c (jajaran genjang dengan dua titik) tidak punya sumbu simetri; ia hanya kembali sama jika diputar 180°, dan putaran bukan lipatan. Warna dan bentuk tidak membedakan karena masing-masing muncul lebih dari satu kali. Jawaban: c.");
}

// ── output ───────────────────────────────────────────────────────────────────
type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: null; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: Key; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: Key };
  tingkat: 2 | 3;
  pembahasan: string;
};
const all = [...items, ...BUNDAR_ITEMS.map((b) => ({ ...b, pkg: 3 }))];
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
  });
}
for (const rows of Object.values(out)) rows.sort((a, b) => a.sequence_number - b.sequence_number);
assert.deepEqual(out[13].map((r) => r.sequence_number), [28, 29, 30, 31, 32, 37]);
assert.deepEqual(out[2].map((r) => r.sequence_number), [31, 32, 35, 36, 37]);
assert.deepEqual(out[3].map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 51, 52, 53, 54, 55, 56]);
for (const r of Object.values(out).flat()) assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(r.options_payload.svg_content), `SVG ${r.sequence_number} tidak aman`);

const root = path.join(__dirname, "..");
fs.writeFileSync(path.join(root, "prisma/data/kecerdasan_figural_kal.json"), `${JSON.stringify(out, null, 2)}\n`);
fs.mkdirSync(path.join(root, "output"), { recursive: true });
fs.writeFileSync(path.join(root, "output/figural-kal-preview.html"),
  `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Figural Kalibrasi</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;max-width:900px}section{border:1px solid #aaa;margin:16px 0;padding:12px}svg{display:block;max-width:100%;height:auto}p{font-size:13px;line-height:1.5}</style><body>` +
  Object.entries(out).flatMap(([pkg, rows]) => rows.map((r) => `<section><h3>pkg ${pkg} · soal ${r.sequence_number} · tier ${r.tingkat} · kunci ${r.scoring_rule.correct_key}</h3><p><b>${r.options_payload.instruksi}</b></p>${r.options_payload.svg_content}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p><p>${r.pembahasan}</p></section>`)).join("") +
  `</body></html>`);
console.log(`OK: ${Object.entries(out).map(([p, r]) => `pkg ${p} ${r.length}`).join(", ")} soal figural/bundar → prisma/data/kecerdasan_figural_kal.json`);
