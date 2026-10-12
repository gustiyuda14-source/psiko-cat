import assert from "node:assert/strict";
import { type Ann, INK, KEYS, W, type Fig, type Fill, type Key, type Prim, type Pt, analogyS, fp, foot, gridS, optionsRowS, place, r1, redArrow, redRing, redText, regular, sig, svgWrap, tf } from "./figural-lib";

// Figural Simulasi Paket 1 baru (package_number 16), nomor 27-32 + 35-37. (26 = mosaik LOMPAT, figural-mosaik.ts.)
// Tata letak besar (gridS/analogyS) + gambar pembahasan (jawaban berbingkai hijau, anotasi merah, tanpa id).
// Pelajaran QA pkg 15 dipasang sebagai assert: bangun kiral, tidak ada opsi yang sah lewat transformasi
// global lain (putar/cermin/balik warna), dan pada ikon kategori tiap ciri lain terbagi 3/2.

export type Fig16 = { pkg: 16; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG16_ITEMS: Fig16[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${key.toLowerCase()}\\.$`), `16#${seq}: pembahasan 2 paragraf + kunci`);
  FIG16_ITEMS.push({ pkg: 16, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const GANJIL = "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.";

const poly = (pts: Pt[], fill: Fill): Prim => ({ k: "poly", pts, fill });
const dot = (x: number, y: number, r = 4, fill: Fill = "b"): Prim => ({ k: "circ", c: [x, y], r, fill });
const inv = (f: Fill): Fill => (f === "b" ? "w" : "b");
const invF = (f: Fig): Fig => f.map((q) => (q.k === "line" ? q : { ...q, fill: inv(q.fill) }));
const paint = (f: Fig, fill: Fill): Fig => f.map((q) => (q.k === "line" ? q : { ...q, fill }));
const mvP = ([x, y]: Pt, dx: number, dy: number): Pt => [r1(x + dx), r1(y + dy)];
const mv = (f: Fig, dx: number, dy: number): Fig =>
  f.map((q) => (q.k === "poly" ? { ...q, pts: q.pts.map((p) => mvP(p, dx, dy)) } : q.k === "circ" ? { ...q, c: mvP(q.c, dx, dy) } : { ...q, a: mvP(q.a, dx, dy), b: mvP(q.b, dx, dy) }));
const dotsRow = (n: number, y: number, gap = 13, r = 4.5): Fig => Array.from({ length: n }, (_, i) => dot(r1((i - (n - 1) / 2) * gap), y, r, "b"));
const md = (d: number) => ((d % 360) + 360) % 360;
/** Bangun harus kiral: tidak ada cerminan yang sama dengan rotasi 90° mana pun. */
function assertChiral(base: Fig, tag: string) {
  for (const d of [0, 90, 180, 270]) for (const e of [0, 90, 180, 270]) assert.notEqual(sig(tf(base, d, true)), sig(tf(base, e)), `${tag}: bangun simetris`);
}
/** Transformasi global (putar 90°·k, cermin, balik warna) yang memetakan semua pasangan [x, y] juga tidak boleh mengesahkan pengecoh. */
function assertNoGlobalAlias(tag: string, pairs: [Fig, Fig][], q: Fig, opts: Fig[], key: Key) {
  for (const d of [0, 90, 180, 270]) for (const m of [false, true]) for (const v of [false, true]) {
    const T = (f: Fig) => (v ? invF(tf(f, d, m)) : tf(f, d, m));
    if (!pairs.every(([x, y]) => sig(T(x)) === sig(y))) continue;
    opts.forEach((o, i) => KEYS[i] !== key && assert.notEqual(sig(T(q)), sig(o), `${tag}: opsi ${KEYS[i]} sah lewat putar ${d}/cermin ${m}/balik ${v}`));
  }
}
const grid3 = (at: (r: number, c: number) => Fig, last: Fig | null) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : at(r, c))));
/** Panah merah antarkolom pada tiap baris grid, opsional label di atas panah. */
const colArrows = (at: (r: number, c: number) => Pt, s: number, rows: number[], label?: (r: number, c: number) => string) => rows.map((r) => [0, 1].map((c) => {
  const [x1, y] = at(r, c), [x2] = at(r, c + 1);
  return redArrow([x1 + s / 2 + 4, y], [x2 - s / 2 - 4, y]) + (label ? redText((x1 + x2) / 2, y - 14, label(r, c), 19) : "");
}).join("")).join("");

// 16#27 — deret (HOTS, 3 lapis): 3 bangun mengorbit 1 posisi ↻, bangun yang naik dari kiri bawah ke atas berganti warna,
// panah tengah berputar 90° ↺. "?" di gambar ke-4 sehingga gambar ke-5 ikut menguji.
{
  const POS: Pt[] = [[0, -32], [27.7, 16], [-27.7, 16]]; // atas, kanan bawah, kiri bawah (searah jarum jam)
  const SH: Record<string, (f: Fill) => Prim> = { L: (f) => dot(0, 0, 12, f), T: (f) => poly(regular(3, 15), f), P: (f) => poly(regular(4, 14, 45), f) };
  type St = [string, number, Fill][];
  const step = (st: St): St => st.map(([s, p, f]) => [s, (p + 1) % 3, p === 2 ? inv(f) : f]);
  const S: St[] = [[["L", 0, "w"], ["T", 1, "w"], ["P", 2, "b"]]];
  for (let t = 1; t < 5; t++) S.push(step(S[t - 1]));
  const ARROW: Pt[] = [[0, -13], [8, -3], [3, -3], [3, 11], [-3, 11], [-3, -3], [-8, -3]];
  const frame = (st: St, deg: number): Fig => [...st.map(([s, p, f]) => mv([SH[s](f)], ...POS[p])[0]), ...tf([poly(ARROW, "b")], md(deg))];
  const fr = (t: number) => frame(S[t], -90 * t);
  const colorOf = (st: St, s: string) => st.find((x) => x[0] === s)![2];
  assert.deepEqual(S[3], [["L", 0, "b"], ["T", 1, "b"], ["P", 2, "w"]]);
  assert.deepEqual(S.map((st) => st.filter((x) => x[2] === "b").length), [1, 0, 1, 2, 3]); // bacaan "jumlah hitam +1" sejalan
  const d2: St = S[2].map(([s, p]) => [s, (p + 2) % 3, colorOf(S[3], s)]); // mengorbit berlawanan arah
  const d3: St = S[2].map(([s, p, f]) => [s, (p + 1) % 3, f]); // tidak berganti warna
  const d4: St = S[3].map(([s, p]) => [s, p, S[2].find((x) => x[1] === p)![2]]); // warna menempel pada posisi
  const ans = fr(3);
  const opts = place(ans, [frame(S[3], 270), frame(d2, 90), frame(d3, 90), frame(d4, 90)], "D");
  const strip = (x: Fig | null) => [[fr(0), fr(1), fr(2), x, fr(4)]];
  const ann: Ann = (at, s) => [1, 2, 3, 4].map((c) => redRing(...fp(POS[0], at(0, c), s), 30)).join("") +
    [0, 1, 2, 3].map((c) => redText((at(0, c)[0] + at(0, c + 1)[0]) / 2, at(0, 0)[1] - s / 2 - 10, "→", 26)).join("") +
    foot(["→ tiga bangun pindah 1 posisi searah jarum jam", "→ bangun yang naik ke atas berganti warna (lingkaran merah)", "→ panah tengah berputar 90° berlawanan arah jarum jam"], at(0, 0)[1] + s / 2 + 42);
  add(27, "D", POLA, gridS(strip(null), opts), 3,
    "Ada tiga aturan yang berjalan bersamaan. (1) Lingkaran, segitiga, dan persegi kecil berpindah satu posisi searah jarum jam setiap langkah: atas → kanan bawah → kiri bawah → atas. (2) Bangun yang naik dari kiri bawah ke atas berganti warna (putih ↔ hitam); dua bangun lainnya tetap warnanya. (3) Panah di tengah berputar 90° berlawanan arah jarum jam: atas, kiri, bawah, lalu kanan. Dari gambar 3 (segitiga hitam di atas, persegi putih di kanan bawah, lingkaran putih di kiri bawah), lingkaran naik ke atas dan menjadi hitam, segitiga hitam turun ke kanan bawah, persegi putih ke kiri bawah, dan panah menunjuk ke kanan. Gambar 5 memastikannya: persegi naik ke atas dan ikut menjadi hitam, panah kembali ke atas.\n\nOpsi a gugur karena panah menunjuk ke kiri (diputar searah jarum jam). Opsi b gugur karena bangun berpindah berlawanan arah jarum jam (persegi yang naik ke atas). Opsi c gugur karena lingkaran tidak berganti warna saat naik ke atas. Opsi e gugur karena segitiga menjadi putih padahal ia tidak naik ke atas; warna ikut bangunnya, bukan posisinya. Jawaban: d.",
    gridS(strip(ans), null, { top: 46, hl: [0, 3], ann, foot: 140 }));
}
// 16#28 — matriks (sedang): kolom 2 = cermin tegak kolom 1, kolom 3 = cermin mendatar kolom 1.
{
  const G: Fig[] = [
    [poly([[-20, -30], [22, -30], [22, -4], [-4, -4], [-4, 30], [-20, 30]], "w")],
    [poly([[-24, -30], [-8, -30], [-8, 12], [26, 12], [26, 30], [-24, 30]], "b")],
    [poly([[-28, -28], [16, -28], [16, -10], [-10, -10], [-10, 28], [-28, 28]], "w"), poly([[6, 28], [28, 28], [28, 6]], "b")],
  ];
  G.forEach((g, i) => assertChiral(g, `16#28 baris ${i + 1}`));
  const at = (r: number, c: number) => [G[r], tf(G[r], 0, true), tf(G[r], 180, true)][c];
  const ans = at(2, 2), opts = place(ans, [tf(G[2], 180), tf(G[2], 0, true), G[2], tf(G[2], 90)], "A");
  assertNoGlobalAlias("16#28 (kolom 1→3)", [0, 1].map((r) => [at(r, 0), at(r, 2)]), at(2, 0), opts, "A");
  assertNoGlobalAlias("16#28 (kolom 2→3)", [0, 1].map((r) => [at(r, 1), at(r, 2)]), at(2, 1), opts, "A");
  const ann: Ann = (a, s) => ["asli", "cermin tegak", "cermin datar"].map((t, c) => redText(a(0, c)[0], 34, t, 22)).join("") +
    [0, 1, 2].map((r) => { const [x, y] = a(r, 0); return `<line x1="${r1(x - s / 2)}" y1="${y}" x2="${r1(x + s / 2)}" y2="${y}" stroke="#d32f2f" stroke-width="3" stroke-dasharray="7 6"/>`; }).join("") +
    redRing(...fp([22, -22], a(2, 2), s), 26);
  add(28, "A", POLA, gridS(grid3(at, null), opts), 2,
    "Setiap baris memakai satu bangun. Kolom 2 adalah cerminan kolom 1 terhadap cermin tegak (kiri dan kanan ditukar), sedangkan kolom 3 adalah cerminan kolom 1 terhadap cermin mendatar (atas dan bawah ditukar; garis putus-putus merah). Pada baris 3, bangun siku Γ dengan segitiga hitam di kanan bawah dicerminkan atas-bawah: lengan atasnya pindah ke bawah sehingga menjadi L, dan segitiga hitam pindah ke kanan atas.\n\nOpsi b gugur karena bangunnya diputar 180° (segitiga hitam pindah ke kiri atas), bukan dicerminkan. Opsi c gugur karena hanya dicerminkan tegak (sama dengan kolom 2). Opsi d gugur karena menyalin kolom 1. Opsi e gugur karena diputar 90° searah jarum jam. Jawaban: a.",
    gridS(grid3(at, ans), null, { top: 50, hl: [2, 2], ann }));
}
// 16#29 — matriks (HOTS, 3 lapis): lajur hitam kolom 3 = kolom 1 + kolom 2, kotak berlajur berputar 90° ↻ per kolom,
// titik luar bergeser 1/8 putaran ↺ per kolom.
{
  const SAT: Pt[] = [[0, -40], [40, -40], [40, 0], [40, 40], [0, 40], [-40, 40], [-40, 0], [-40, -40]]; // searah jarum jam dari atas
  const cell = (L: number, rot: number, sat: number): Fig => [
    ...tf([poly([[-30, -30], [30, -30], [30, 30], [-30, 30]], "w"), ...Array.from({ length: L }, (_, i): Prim => poly([[-26, 27 - 12 * i - 6], [26, 27 - 12 * i - 6], [26, 27 - 12 * i], [-26, 27 - 12 * i]], "b"))], md(rot)),
    dot(...SAT[(sat + 8) % 8], 5, "b"),
  ];
  const rows = [[1, 3, 0, 0], [2, 1, 90, 3], [1, 2, 270, 5]]; // lajur kolom 1, lajur kolom 2, putaran awal, titik awal
  const at = (r: number, c: number) => { const [a, b, rot, s] = rows[r]; return cell([a, b, a + b][c], rot + 90 * c, s - c); };
  const [[a1, b1], [a2, b2]] = rows; // aturan 'kolom 3 tetap', 'kolom 1 + k', 'kolom 2 + k' harus gugur di baris 1-2
  assert.ok(a1 + b1 !== a2 + b2 && a1 !== a2 && b1 !== b2, "16#29: aturan lajur alternatif lolos");
  const ans = at(2, 2), opts = place(ans, [cell(2, 90, 3), cell(3, 270, 3), cell(3, 90, 5), cell(3, 180, 3)], "E");
  assertNoGlobalAlias("16#29", [0, 1].map((r) => [at(r, 0), at(r, 2)]), at(2, 0), opts, "E");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((r) => { const [x, y] = a(r, 2), [p, q] = rows[r]; return redText(x + s / 2 + 12, y + 9, `${p} + ${q} = ${r === 2 ? "?" : p + q}`, 24, "start"); }).join("") +
    [0, 1, 2].map((r) => [0, 1, 2].map((c) => redRing(...fp(SAT[(rows[r][3] - c + 8) % 8], a(r, c), s), 13)).join("")).join("") +
    foot(["→ lajur hitam: kolom 1 + kolom 2 = kolom 3", "→ kotak berlajur berputar 90° searah jarum jam", "→ titik luar bergeser 1/8 putaran berlawanan arah jarum jam"], a(2, 0)[1] + s / 2 + 42);
  add(29, "E", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Banyak lajur hitam di kolom 3 = kolom 1 + kolom 2 (baris 1: 1 + 3 = 4, baris 2: 2 + 1 = 3, jadi baris 3: 1 + 2 = 3). (2) Kotak berlajur berputar 90° searah jarum jam dari kolom ke kolom, sehingga sisi tempat lajur hitam menumpuk berpindah bawah → kiri → atas → kanan (baris 3: kanan, bawah, jadi berikutnya kiri). (3) Titik hitam di luar kotak bergeser satu posisi (seperdelapan putaran) berlawanan arah jarum jam (baris 3: kiri bawah, bawah, jadi berikutnya kanan bawah). Jawabannya tiga lajur hitam menumpuk di sisi kiri dengan titik di kanan bawah.\n\nOpsi a gugur karena lajur hitamnya hanya 2 (menyalin kolom 2). Opsi b gugur karena lajur menumpuk di kanan (kotak diputar berlawanan arah jarum jam). Opsi c gugur karena titik bergeser searah jarum jam ke kiri bawah. Opsi d gugur karena lajur menumpuk di atas (kotak diputar 180°). Jawaban: e.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 16#30 — matriks (HOTS, 3 lapis): jumlah titik = berapa kali bangun diputar 90° ↻ menuju kolom berikutnya,
// titik kolom 3 = kolom 1 + kolom 2, warna putih-hitam-putih.
{
  const H: Fig[] = [
    [poly([[-4, -26], [8, -26], [8, 14], [0, 26], [-20, 26], [-20, 14], [-4, 14]], "w")],
    [poly([[-18, -26], [-6, -26], [-6, -22], [22, -8], [-6, 6], [-6, 26], [-18, 26]], "w")],
    [poly([[-14, -26], [20, -26], [20, -14], [-2, -14], [-2, -4], [12, -4], [12, 8], [-2, 8], [-2, 26], [-14, 26]], "w")],
  ];
  H.forEach((g, i) => assertChiral(g, `16#30 baris ${i + 1}`));
  const cell = (g: Fig, deg: number, f: Fill, k: number, m = false): Fig => [...mv(paint(tf(g, md(deg), m), f), 0, -7), ...dotsRow(k, 38)];
  const K = [[1, 2], [3, 1], [2, 3]];
  const at = (r: number, c: number) => { const [a, b] = K[r], deg = [0, 90 * a, 90 * (a + b)][c]; return cell(H[r], deg, c === 1 ? "b" : "w", [a, b, a + b][c]); };
  assert.ok(K.some(([a]) => a !== 1) && K.some(([a, b]) => (90 * (a + b)) % 360 !== 180), "16#30: aturan 'selalu 90° per kolom' harus gugur");
  assert.ok(K.some(([a, b]) => b + 1 !== a + b), "16#30: aturan titik 'kolom 2 + 1' harus gugur");
  const ans = at(2, 2), opts = place(ans, [cell(H[2], 270, "w", 5), cell(H[2], 90, "b", 5), cell(H[2], 90, "w", 6), cell(H[2], 90, "w", 5, true)], "B");
  assertNoGlobalAlias("16#30", [0, 1].map((r) => [at(r, 1), at(r, 2)]), at(2, 1), opts, "B");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2], (r, c) => `${K[r][c]}×90°`) +
    foot(["→ jumlah titik = berapa kali diputar 90° searah jarum jam", "→ titik kolom 3 = kolom 1 + kolom 2 · warna putih-hitam-putih"], a(2, 0)[1] + s / 2 + 42);
  add(30, "B", POLA, gridS(grid3(at, null), opts), 3,
    "Titik di bawah setiap gambar memberi tahu berapa kali bangun diputar 90° searah jarum jam untuk mendapatkan gambar di kanannya. Baris 1: 1 titik → diputar 90°, lalu 2 titik → diputar 180° lagi. Baris 2: 3 titik → 270°, lalu 1 titik → 90° lagi sehingga tegak kembali. Baris 3: 2 titik → 180°, lalu 3 titik → 270° lagi, jadi totalnya 450° = 90° searah jarum jam dari kolom 1 (huruf F rebah dengan kaki ke kiri). Dua aturan lain: jumlah titik kolom 3 = kolom 1 + kolom 2 (1 + 2 = 3, 3 + 1 = 4, 2 + 3 = 5), dan warnanya putih, hitam, putih.\n\nOpsi a gugur karena hanya diputar 90° lagi dari kolom 2 (aturan 'selalu 90° per kolom' sudah gugur di baris 1), hasilnya 270°. Opsi c gugur karena bangunnya hitam. Opsi d gugur karena titiknya 6 (dikalikan, bukan dijumlahkan). Opsi e gugur karena merupakan cerminan, bukan hasil putaran. Jawaban: b.",
    gridS(grid3(at, ans), null, { gap: 60, hl: [2, 2], ann, foot: 106 }));
}
// 16#31 — rotasi (sedang): putar 270° searah jarum jam (= 90° berlawanan arah); kunci bergigi satu sisi (kiral).
{
  const base: Fig = [dot(-20, 0, 13, "w"), dot(-20, 0, 4, "b"), poly([[-7, -5], [32, -5], [32, 13], [26, 13], [26, 5], [21, 5], [21, 16], [14, 16], [14, 5], [-7, 5]], "b")];
  assertChiral(base, "16#31");
  const ans = tf(base, 270), opts = place(ans, [tf(base, 90), tf(base, 180), tf(base, 270, true), tf(base, 0, true)], "C");
  const ann: Ann = (at, s) => { const a = at(0, 0), b = at(0, 1); return redArrow([a[0] + s / 2 + 10, a[1]], [b[0] - s / 2 - 10, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - 18, "270° ↻", 28) + redText((a[0] + b[0]) / 2, a[1] + 34, "= 90° ↺", 24) + redRing(...fp([-20, 0], a, s), 26) + redRing(...fp([0, 20], b, s), 26) + redRing(...fp([18, 10], a, s), 22) + redRing(...fp([10, -18], b, s), 22); };
  add(31, "C", "Gambar di atas diputar 270° searah jarum jam. Pilihlah satu gambar yang merupakan hasilnya.", gridS([[base]], opts, { size: 170 }), 2,
    "Putaran 270° searah jarum jam sama dengan putaran 90° berlawanan arah jarum jam. Kunci yang semula mendatar dengan gelang di kiri dan gigi di bawah batang menjadi tegak: gelang pindah ke bawah, ujung batang menunjuk ke atas, dan gigi berada di sisi kanan batang. Patokan cepat: bila dilihat dari gelang ke ujung batang, gigi selalu di sisi kanan; putaran tidak mengubah sisi ini, cerminan mengubahnya.\n\nOpsi a gugur karena diputar 90° searah jarum jam (gelang di atas). Opsi b gugur karena diputar 180°. Opsi d gugur karena merupakan cerminan: gelang di atas dengan gigi di kanan berarti gigi berada di sisi kiri bila dilihat dari gelang. Opsi e gugur karena hanya dicerminkan kiri-kanan. Jawaban: c.",
    gridS([[base, ans]], null, { size: 170, gap: 160, top: 40, hl: [0, 1], ann }));
}
// 16#32 — rotasi (HOTS, 3 lapis): bagian hitam diputar 90° ↻, bagian putih dicerminkan tegak, lalu warna keduanya ditukar.
{
  const Pb: Fig = mv([poly([[-10, -19], [0, -19], [0, 10], [14, 10], [14, 19], [-10, 19]], "b")], -21, -20);
  const Qw: Fig = mv([poly([[-15, -11], [15, -11], [15, 11], [-15, 1]], "w")], 21, 22);
  assertChiral(Pb, "16#32 siku"); assertChiral(Qw, "16#32 trapesium");
  const base = [...Pb, ...Qw], mid = [...tf(Pb, 90), ...tf(Qw, 0, true)], ans = invF(mid);
  const opts = place(ans, [mid, invF([...tf(Pb, 0, true), ...tf(Qw, 90)]), invF([...tf(Pb, 180), ...tf(Qw, 0, true)]), invF([...tf(Pb, 90), ...tf(Qw, 180)])], "A");
  const axis: Ann = (at, s) => { const [x, y] = at(0, 0); return `<line x1="${x}" y1="${r1(y - s / 2 - 8)}" x2="${x}" y2="${r1(y + s / 2 + 8)}" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>` + `<circle cx="${x}" cy="${y}" r="4" fill="${INK}"/>`; };
  const steps: Ann = (at, s) => ["putar / cermin", "tukar warna"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 22); }).join("") +
    redText(W / 2, at(0, 0)[1] + s / 2 + 44, "hitam: putar 90° ↻ · putih: cermin tegak · lalu tukar warna", 24);
  add(32, "A", "Pada gambar di atas, bagian hitam diputar 90° searah jarum jam terhadap titik pusat kotak, sedangkan bagian putih dicerminkan terhadap garis putus-putus tegak. Setelah itu, warna kedua bagian ditukar (hitam menjadi putih, putih menjadi hitam). Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, ann: axis, foot: 24 }), 3,
    "Kerjakan tiap bagian sendiri-sendiri, lalu tukar warnanya. (1) Bangun siku hitam di kiri atas diputar 90° searah jarum jam terhadap pusat kotak, sehingga pindah ke kanan atas dan lengan panjangnya yang semula tegak menjadi mendatar di atas. (2) Trapesium putih di kanan bawah dicerminkan terhadap garis tegak, sehingga pindah ke kiri bawah dan sisi pendeknya yang semula di kiri pindah ke kanan. (3) Warna ditukar: bangun siku menjadi putih dan trapesium menjadi hitam.\n\nOpsi b gugur karena warnanya tidak ditukar. Opsi c gugur karena perlakuannya tertukar: bangun siku dicerminkan dan trapesium diputar. Opsi d gugur karena bangun siku diputar 180° sehingga pindah ke kanan bawah. Opsi e gugur karena trapesium diputar 180°, bukan dicerminkan, sehingga pindah ke kiri atas. Jawaban: a.",
    gridS([[base, mid, ans]], null, { gap: 70, top: 46, hl: [0, 2], ann: (at, s) => axis(at, s) + steps(at, s), foot: 64 }));
}
// 16#35 — analogi (HOTS, 3 lapis): bangun diputar 90° ↻, bayangan pindah 1 sudut ↺, depan-belakang + warna bertukar.
{
  const S: Fig = [poly([[-22, -18], [22, -18], [8, 18], [-22, 18]], "w")], T: Fig = [poly([[-20, -20], [16, -20], [20, 8], [-4, 20], [-20, 20]], "w")];
  assertChiral(S, "16#35 S"); assertChiral(T, "16#35 T");
  const CR: Record<string, Pt> = { KiA: [-13, -13], KaA: [13, -13], KaB: [13, 13], KiB: [-13, 13] };
  const fig = (g: Fig, deg: number, front: Fill, at: string, m = false): Fig => { const x = tf(g, md(deg), m); return [...paint(mv(x, ...CR[at]), inv(front)), ...paint(x, front)]; };
  const A = fig(S, 0, "w", "KaB"), B = fig(S, 90, "b", "KaA"), C = fig(T, 0, "w", "KiA"), ans = fig(T, 90, "b", "KiB");
  const opts = place(ans, [fig(T, 90, "w", "KiB"), fig(T, 90, "b", "KaA"), fig(T, 90, "b", "KiB", true), fig(T, 270, "b", "KiB")], "D");
  assertNoGlobalAlias("16#35", [[A, B]], C, opts, "D");
  const ann: Ann = (at, s) => ([[0, "KaB"], [1, "KaA"], [2, "KiA"], [3, "KiB"]] as const).map(([c, k]) => redRing(...fp([CR[k][0] * 2.6, CR[k][1] * 2.6], at(0, c), s), 16)).join("") +
    foot(["① bangun diputar 90° searah jarum jam", "② bayangan pindah 1 sudut berlawanan arah jarum jam", "③ depan-belakang bertukar: depan hitam, bayangan putih"], at(0, 0)[1] + s / 2 + 40);
  add(35, "D", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Bangun diputar 90° searah jarum jam (bayangannya ikut berbentuk sama). (2) Bayangan berpindah satu sudut berlawanan arah jarum jam: dari kanan bawah ke kanan atas. (3) Depan-belakang beserta warnanya bertukar: semula bangun putih di depan dan bayangan hitam di belakang, sekarang bangun hitam di depan dan bayangan putih di belakang. Terapkan pada gambar ketiga: segi lima diputar 90° searah jarum jam (potongan miring besarnya pindah dari kanan bawah ke kiri bawah), bayangan pindah dari kiri atas ke kiri bawah, bangun depan menjadi hitam dan bayangannya putih.\n\nPerpindahan kanan bawah → kanan atas juga bisa dibaca sebagai cermin atas-bawah, tetapi bacaan itu pun membawa bayangan kiri atas ke kiri bawah, jadi hasilnya sama. Opsi a gugur karena depan-belakang dan warnanya tidak bertukar. Opsi b gugur karena bayangan ikut berputar searah jarum jam ke kanan atas. Opsi c gugur karena segi limanya dicerminkan, bukan diputar. Opsi e gugur karena segi lima diputar berlawanan arah jarum jam. Jawaban: d.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 120 }));
}
// 16#36 — analogi (HOTS, 3 lapis): jumlah sisi ↔ jumlah titik bertukar, bangun putih → hitam, titik pindah bawah → atas.
{
  const fig = (sides: number, dots: number, f: Fill, up: boolean): Fig => [
    poly(regular(sides, 28, sides === 4 ? 45 : 0).map((p) => mvP(p, 0, up ? 9 : -9)), f), ...dotsRow(dots, up ? -38 : 36),
  ];
  const A = fig(3, 5, "w", false), B = fig(5, 3, "b", true), C = fig(6, 3, "w", false), ans = fig(3, 6, "b", true);
  const opts = place(ans, [fig(3, 6, "w", true), fig(3, 6, "b", false), fig(6, 3, "b", true), fig(3, 5, "b", true)], "B");
  // bacaan lain dari A→B: "sisi + 2, titik − 2" → segi delapan 1 titik; campurannya → 8 sisi atau 1 titik. Tidak boleh ada di opsi.
  assert.ok(opts.every((o) => !o.some((q) => q.k === "poly" && q.pts.length === 8) && o.filter((q) => q.k === "circ").length !== 1), "16#36: bacaan 'sisi+2, titik−2' tidak boleh sah");
  const ann: Ann = (at, s) => ([[0, "3 sisi · 5 titik"], [1, "5 sisi · 3 titik"], [2, "6 sisi · 3 titik"], [3, "3 sisi · 6 titik"]] as const).map(([c, t]) => redText(at(0, c)[0], at(0, c)[1] + s / 2 + 30, t, 20)).join("") +
    foot(["① jumlah sisi ↔ jumlah titik bertukar", "② bangun putih menjadi hitam", "③ titik pindah dari bawah ke atas"], at(0, 0)[1] + s / 2 + 74);
  add(36, "B", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Jumlah sisi bangun dan jumlah titik bertukar: segitiga (3 sisi) dengan 5 titik menjadi segi lima (5 sisi) dengan 3 titik. (2) Bangun putih menjadi hitam. (3) Deretan titik pindah dari bawah ke atas bangun. Terapkan pada gambar ketiga: segi enam (6 sisi) dengan 3 titik menjadi segitiga (3 sisi) hitam dengan 6 titik di atasnya.\n\nPerubahan 3 → 5 sisi dan 5 → 3 titik juga bisa dibaca 'sisi + 2, titik − 2'; menurut bacaan itu jawabannya segi delapan dengan 1 titik, yang tidak ada di pilihan, jadi yang berlaku adalah pertukaran. Opsi a gugur karena bangunnya tidak menjadi hitam. Opsi c gugur karena titiknya tetap di bawah. Opsi d gugur karena sisi dan titik tidak bertukar. Opsi e gugur karena titiknya hanya 5. Jawaban: b.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 154 }));
}
// 16#37 — ikon kategori (sedang): bangun dalam sejenis dengan bangun luar, kecuali satu. Ciri lain terbagi 3/2 (diassert).
{
  type Ik = { out: 3 | 4; inn: 3 | 4; f: Fill; big: boolean; left: boolean };
  const fig = ({ out, inn, f, big, left }: Ik): Fig => [poly(regular(out, 42, out === 4 ? 45 : 0), "w"), poly(regular(inn, big ? 18 : 11, inn === 4 ? 45 : 0).map((p) => mvP(p, left ? -9 : 0, 0)), f)];
  const I: Ik[] = [
    { out: 4, inn: 4, f: "b", big: true, left: true }, { out: 3, inn: 3, f: "b", big: true, left: false },
    { out: 4, inn: 4, f: "w", big: false, left: true }, { out: 3, inn: 3, f: "w", big: false, left: false },
    { out: 4, inn: 3, f: "b", big: true, left: false },
  ];
  // sumbu simetri: segitiga sepusat 3 sumbu (tegak termasuk), persegi bergeser kiri 1 sumbu mendatar, segitiga dalam persegi 1 sumbu tegak
  const ciri: Record<string, (x: Ik) => unknown> = { luar: (x) => x.out, dalam: (x) => x.inn, warna: (x) => x.f, besar: (x) => x.big, kiri: (x) => x.left, sumbuTegak: (x) => !x.left, sumbu3: (x) => x.out === 3 };
  for (const [n, g] of Object.entries(ciri)) { const v = I.map(g); for (const x of v) assert.ok(v.filter((y) => y === x).length >= 2, `16#37: ciri ${n} hanya dimiliki satu gambar`); }
  assert.deepEqual(I.map((x) => x.out === x.inn), [true, true, true, true, false]);
  const opts = place(fig(I[4]), I.slice(0, 4).map(fig), "E");
  const o = optionsRowS(opts, 20, { hl: 4 }), lab = o.body + I.map((x, i) => redText(o.at(i)[0], o.bottom + 14, `${x.out} & ${x.inn}`, 24)).join("") + redText(W / 2, o.bottom + 52, "jumlah sisi bangun luar & bangun dalam", 24);
  add(37, "E", GANJIL, svgWrap(o.bottom, optionsRowS(opts, 20).body), 2,
    "Bandingkan bangun dalam dengan bangun luarnya. Pada gambar a sampai d, bangun dalam sejenis dengan bangun luarnya: persegi di dalam persegi (a, c) dan segitiga di dalam segitiga (b, d). Pada gambar e, bangun luarnya persegi tetapi bangun dalamnya segitiga.\n\nCiri lain tidak memisahkan satu gambar saja. Bangun luar: segitiga pada b, d dan persegi pada a, c, e. Bangun dalam: segitiga pada b, d, e dan persegi pada a, c. Warna bangun dalam: hitam pada a, b, e dan putih pada c, d. Ukuran bangun dalam: besar pada a, b, e dan kecil pada c, d. Letaknya: di tengah pada b, d, e dan bergeser ke kiri pada a, c. Sumbu simetri: tegak pada b, d, e dan mendatar pada a, c. Satu-satunya ciri yang hanya dimiliki satu gambar adalah bangun dalam yang berbeda jenis dengan bangun luarnya. Jawaban: e.",
    svgWrap(o.bottom + 66, lab));
}
