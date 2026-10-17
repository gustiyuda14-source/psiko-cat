import assert from "node:assert/strict";
import { type Ann, W, type Fig, type Fill, type Key, type Pt, analogyS, dashLine, fp, foot, gridS, optionsRowS, place, ptf, r1, redArrow, redRing, redText, regular, sig, svgWrap, tf } from "./figural-lib";
import { assertChiral, colArrows, ctr, dot, grid3, inv, mv, paint, poly, sc } from "./figural-kal-4";

// Figural Latihan Paket 5 (package_number 6), nomor 28-32 + 35-37. (26-27 = mosaik, figural-mosaik-6.ts; 51-56 = bundar.)
// Aturan sengaja berbeda dari pkg 3/4/5/15/16/19/20: bangun kolom 1 membungkus bangun kolom 2, titik pindah dari dalam ke sudut + warna
// menurut ganjil/genap, panah kolom 2 sebagai perintah (geser + hadap + warna), cermin diagonal kiri bawah – kanan atas, cermin mendatar
// lalu putar 45° + bangun kecil berbalik warna, setengah bangun dilengkapi bayangannya lalu diputar, garis komplemen + warna titik bergeser,
// titik di kiri arah panah. Tata letak besar (gridS/analogyS) + gambar pembahasan tanpa id.

export type Fig6 = { pkg: 6; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG6_ITEMS: Fig6[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${key.toLowerCase()}\\.$`), `6#${seq}: pembahasan 2 paragraf + kunci`);
  FIG6_ITEMS.push({ pkg: 6, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const pip = (P: Pt[], [x, y]: Pt) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const ngon = (n: number, r: number, f: Fill, rot = 0) => poly(regular(n, r, rot), f);

// 6#28 — matriks (sedang): kolom 3 = bangun kolom 1 (tetap besar) yang membungkus bangun kolom 2 (mengecil di dalamnya); warna masing-masing tetap.
{
  const OUT = [(f: Fill) => ngon(6, 34, f), (f: Fill) => dot(0, 0, 32, f), (f: Fill) => ngon(5, 35, f)];
  const IN = [(f: Fill) => ngon(3, 34, f), (f: Fill) => ngon(4, 33, f, 45), (f: Fill) => ngon(4, 34, f)];
  const R: [Fill, Fill][] = [["w", "b"], ["w", "b"], ["b", "w"]];
  const small = (p: ReturnType<(typeof IN)[number]>): Fig => p.k === "circ" ? [{ ...p, r: r1(p.r * 0.42) }] : sc([p], 0.42);
  const wrap = (o: Fig, i: Fig) => [...o, ...i];
  const at = (r: number, c: number): Fig => c === 0 ? [OUT[r](R[r][0])] : c === 1 ? [IN[r](R[r][1])] : wrap([OUT[r](R[r][0])], small(IN[r](R[r][1])));
  const ans = at(2, 2);
  const opts = place(ans, [
    wrap([ngon(4, 34, "w")], sc([ngon(5, 35, "b")], 0.42)), // tertukar: bangun kolom 2 yang membungkus
    wrap([ngon(5, 35, "w")], small(ngon(4, 34, "b"))), // warna mengikuti baris 1-2
    wrap([ngon(5, 35, "b")], sc([ngon(5, 35, "w")], 0.42)), // bangun dalam menyalin kolom 1
    wrap([dot(0, 0, 32, "b")], small(ngon(4, 34, "w"))), // bangun luar menyalin baris 2
  ], "E");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    foot(["→ kolom 3: bangun kolom 1 membungkus bangun kolom 2", "→ bangun kolom 2 mengecil; warna keduanya tetap"], a(2, 0)[1] + s / 2 + 42);
  add(28, "E", POLA, gridS(grid3(at, null), opts), 2,
    "Pada setiap baris, gambar kolom 3 adalah gabungan dua gambar sebelumnya: bangun kolom 1 tetap berukuran besar di luar, dan bangun kolom 2 mengecil lalu masuk ke dalamnya. Warna masing-masing bangun tidak berubah (baris 1: segi enam putih membungkus segitiga hitam; baris 2: lingkaran putih membungkus persegi hitam). Baris 3: segi lima hitam di kolom 1 dan belah ketupat putih di kolom 2, jadi jawabannya segi lima hitam berisi belah ketupat putih kecil.\n\nOpsi a gugur karena perannya tertukar: belah ketupat menjadi bangun luar dan segi lima masuk ke dalam. Opsi b gugur karena warnanya meniru baris 1 dan 2 (luar putih, dalam hitam), padahal pada baris 3 bangun luar hitam dan bangun dalam putih. Opsi c gugur karena bangun dalamnya segi lima (menyalin kolom 1), bukan belah ketupat. Opsi d gugur karena bangun luarnya lingkaran (menyalin baris 2). Jawaban: e.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 110 }));
}

// 6#29 — matriks (HOTS, 3 lapis): satu titik pindah dari dalam lingkaran ke sudut kotak tiap kolom; titik sudut terisi searah jarum jam
// mulai kiri atas; lingkaran hitam bila jumlah titik di dalamnya ganjil, putih bila genap.
{
  const CORN: Pt[] = [[-37, -37], [37, -37], [37, 37], [-37, 37]];
  const inner = (n: number): Pt[] => n === 1 ? [[0, 0]] : n === 2 ? [[-9, 0], [9, 0]] : n === 4 ? [[-9, -9], [9, -9], [9, 9], [-9, 9]] : regular(n, n === 3 ? 11 : 13);
  const cell = (n: number, out: number[], f: Fill = n % 2 ? "b" : "w"): Fig => [dot(0, 0, 25, f), ...inner(n).map(([x, y]) => dot(x, y, 4.5, inv(f))), ...out.map((i) => dot(...CORN[i], 5.5, "b"))];
  const S: [number, number][] = [[4, 0], [3, 0], [5, 0]]; // (titik dalam, titik sudut) di kolom 1
  const at = (r: number, c: number) => cell(S[r][0] - c, [0, 1, 2, 3].slice(0, S[r][1] + c));
  const ans = at(2, 2);
  assert.ok(S.every(([n, o]) => n - 2 >= 1 && o + 2 <= 4), "6#29: titik cukup");
  const opts = place(ans, [cell(3, [0, 1], "w"), cell(3, [0, 3]), cell(2, [0, 1, 2]), cell(3, [0, 1, 2])], "D");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) + [0, 1, 2].map((r) => { const [x, y] = a(r, 2); return redText(x + s / 2 + 12, y + 9, `${S[r][0]} → ${S[r][0] - 1} → ${r === 2 ? "?" : S[r][0] - 2}`, 22, "start"); }).join("") +
    foot(["→ tiap kolom satu titik pindah dari dalam ke sudut", "→ sudut terisi searah jarum jam mulai kiri atas", "→ lingkaran hitam bila titik di dalamnya ganjil"], a(2, 0)[1] + s / 2 + 42);
  add(29, "D", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Setiap kolom, satu titik keluar dari dalam lingkaran dan pindah ke sudut kotak, jadi titik di dalam berkurang 1 dan titik di sudut bertambah 1 (jumlah seluruhnya tetap). (2) Titik sudut terisi berurutan searah jarum jam: kiri atas, kanan atas, kanan bawah, lalu kiri bawah. (3) Lingkaran berwarna hitam bila jumlah titik di dalamnya ganjil dan putih bila genap; titik di dalam selalu berwarna kebalikan lingkarannya. Baris 3: titik di dalam 5, 4, jadi 3; titik sudut 0, 1, jadi 2 (kiri atas dan kanan atas); karena 3 ganjil, lingkarannya hitam dengan 3 titik putih.\n\nOpsi a gugur karena lingkarannya putih, padahal 3 titik (ganjil) membuat lingkaran hitam. Opsi b gugur karena titik sudut kedua berada di kiri bawah (diisi berlawanan arah jarum jam). Opsi c gugur karena dua titik sekaligus pindah dari kolom 2 (tersisa 2 di dalam, 3 di sudut). Opsi e gugur karena titik sudut bertambah menjadi 3 tanpa titik di dalam berkurang, sehingga jumlah seluruhnya tidak tetap. Jawaban: d.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}

// 6#30 — matriks (HOTS, 3 lapis): panah kolom 2 adalah perintah bagi bangun kolom 1: bangun bergeser ke arah panah, berputar sehingga
// ujungnya menghadap arah panah, dan berganti warna mengikuti warna panah.
{
  const SH: Fig[] = [
    [poly([[-14, -4], [0, -20], [14, -4], [14, 18], [-14, 18]], "w")], // rumah
    [poly([[0, -22], [12, 16], [-12, 16]], "w")], // segitiga runcing
    [poly([[0, -24], ...Array.from({ length: 9 }, (_, i): Pt => { const a = ((-30 + 30 * i) * Math.PI) / 180; return [r1(13 * Math.cos(a)), r1(6 + 13 * Math.sin(a))]; })], "w")], // tetes
  ];
  const ARROW: Fig = [poly([[0, -32], [17, -11], [6, -11], [6, 30], [-6, 30], [-6, -11], [-17, -11]], "w")];
  const R: { col1: Fill; deg: number; arrow: Fill }[] = [{ col1: "w", deg: 90, arrow: "b" }, { col1: "b", deg: 180, arrow: "w" }, { col1: "w", deg: 225, arrow: "b" }];
  const D = 24, off = (deg: number, d = D): Pt => [r1(d * Math.sin((deg * Math.PI) / 180)), r1(-d * Math.cos((deg * Math.PI) / 180))];
  const res = (r: number, o: { deg?: number; move?: number; face?: number; fill?: Fill } = {}) => {
    const deg = o.deg ?? R[r].deg;
    return mv(paint(tf(ctr(SH[r]), o.face ?? deg), o.fill ?? R[r].arrow), ...off(o.move ?? deg, o.move === -1 ? 0 : D));
  };
  const at = (r: number, c: number): Fig => c === 0 ? paint(ctr(SH[r]), R[r].col1) : c === 1 ? paint(tf(ARROW, R[r].deg), R[r].arrow) : res(r);
  const ans = at(2, 2);
  const opts = place(ans, [res(2, { move: 45 }), res(2, { fill: "w" }), res(2, { face: 0 }), res(2, { move: -1 })], "A");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    foot(["→ bangun kolom 1 bergeser ke arah panah kolom 2", "→ ujung bangun menghadap arah panah", "→ warna bangun mengikuti warna panah"], a(2, 0)[1] + s / 2 + 42);
  add(30, "A", POLA, gridS(grid3(at, null), opts), 3,
    "Panah di kolom 2 adalah perintah untuk bangun di kolom 1, dan kolom 3 adalah hasilnya. Ada tiga aturan: (1) bangun bergeser dari tengah kotak ke arah yang ditunjuk panah; (2) bangun berputar sehingga ujung runcingnya menghadap arah panah; (3) warna bangun berubah mengikuti warna panah. Baris 1: rumah putih, panah hitam ke kanan, hasilnya rumah hitam di kanan dengan atap menghadap kanan. Baris 2: segitiga hitam, panah putih ke bawah, hasilnya segitiga putih di bawah dengan ujung ke bawah. Baris 3: tetes putih, panah hitam ke kiri bawah, jadi jawabannya tetes hitam di kiri bawah dengan ujung runcing menghadap kiri bawah.\n\nOpsi b gugur karena bangun bergeser ke kanan atas, berlawanan dengan arah panah. Opsi c gugur karena warnanya tetap putih, tidak mengikuti panah hitam. Opsi d gugur karena ujungnya masih menghadap ke atas (bangun tidak berputar). Opsi e gugur karena bangun tetap di tengah kotak (tidak bergeser). Jawaban: a.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}

// 6#31 — rotasi (sedang): cermin terhadap garis diagonal kiri bawah – kanan atas (= tf(·, 90, true)).
{
  const base: Fig = [poly([[-30, -30], [8, -30], [8, -12], [-12, -12], [-12, 30], [-30, 30]], "w"), poly([[-6, -27], [4, -27], [4, -15]], "b"), dot(16, 18, 8, "b")];
  assertChiral(base, "6#31");
  const ans = tf(base, 90, true);
  const opts = place(ans, [tf(base, 270, true), tf(base, 90), tf(base, 270), tf(base, 0, true)], "D");
  const diag = (x: number, y: number, s: number) => dashLine([x - s / 2 - 10, y + s / 2 + 10], [x + s / 2 + 10, y - s / 2 - 10]);
  const axis: Ann = (at, s) => diag(...at(0, 0), s);
  const steps: Ann = (at, s) => { const a = at(0, 0), b = at(0, 1); return diag(...a, s) + diag(...b, s) + redArrow([a[0] + s / 2 + 14, a[1]], [b[0] - s / 2 - 14, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 18, "cermin diagonal", 22) +
    redRing(...fp([16, 18], a, s), 24) + redRing(...fp(ptf([16, 18], 90, true), b, s), 24) + redText(W / 2, a[1] + s / 2 + 52, "titik kanan bawah → kiri atas; lengan atas → lengan kanan", 22); };
  add(31, "D", "Gambar di atas dicerminkan terhadap garis putus-putus (diagonal dari kiri bawah ke kanan atas). Pilihlah satu gambar yang merupakan hasil pencerminannya.",
    gridS([[base]], opts, { size: 170, ann: axis, foot: 30 }), 2,
    "Pada cermin diagonal dari kiri bawah ke kanan atas, setiap bagian berpindah ke seberang garis itu dengan jarak yang sama: bagian di kanan bawah pindah ke kiri atas, bagian di atas pindah ke kanan, dan bagian di kiri pindah ke bawah. Titik hitam di kanan bawah menjadi di kiri atas, lengan atas huruf L menjadi lengan di sisi kanan, batang kiri menjadi batang bawah, dan segitiga kecil di ujung lengan atas berpindah ke ujung lengan kanan.\n\nOpsi a gugur karena dicerminkan terhadap diagonal yang lain (kiri atas ke kanan bawah), sehingga titik hitam tetap di kanan bawah. Opsi b gugur karena hanya diputar 90° searah jarum jam. Opsi c gugur karena hanya diputar 90° berlawanan arah jarum jam. Opsi e gugur karena dicerminkan terhadap garis tegak (kiri-kanan). Jawaban: d.",
    gridS([[base, ans]], null, { gap: 120, top: 50, hl: [0, 1], ann: steps, foot: 76 }));
}

// 6#32 — rotasi (HOTS, 3 lapis): cermin mendatar, LALU putar 45° searah jarum jam, lalu hanya bangun kecil berbalik warna.
{
  const Pb: Pt[] = [[-28, -26], [20, -26], [28, -18], [28, 26], [-4, 26], [-4, 6], [-28, 6]], Qb: Pt[] = [[2, -18], [20, -18], [20, -10], [10, -10], [10, 0], [2, 0]];
  assert.ok(Qb.every((p) => pip(Pb, p)), "6#32: bangun kecil di dalam bangun besar");
  const P: Fig = [poly(Pb, "w")], Q: Fig = [poly(Qb, "b")];
  const base = [...P, ...Q];
  assertChiral(base, "6#32");
  const T = (f: Fig, fn: (x: Fig) => Fig) => fn(f);
  const comp = (fn: (x: Fig) => Fig, qFill: Fill = "w") => [...T(P, fn), ...paint(T(Q, fn), qFill)];
  const m1 = tf(base, 180, true), m2 = tf(m1, 45), ans = comp((x) => tf(tf(x, 180, true), 45));
  const opts = place(ans, [comp((x) => tf(tf(x, 45), 180, true)), comp((x) => tf(tf(x, 180, true), 45), "b"), comp((x) => tf(tf(x, 0, true), 45)), comp((x) => tf(tf(x, 180, true), 90))], "B");
  const steps: Ann = (at, s) => ["cermin mendatar", "putar 45° ↻", "kecil balik warna"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 19); }).join("");
  add(32, "B", "Gambar di atas dicerminkan terhadap cermin mendatar, kemudian hasilnya diputar 45° searah jarum jam, lalu warna bangun kecil di dalamnya saja yang dibalik (hitam menjadi putih). Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, foot: 24 }), 3,
    "Kerjakan tiga langkah berurutan. (1) Cermin mendatar: atas dan bawah ditukar, sehingga takik besar yang semula di kiri bawah pindah ke kiri atas, sudut terpotong pindah ke kanan bawah, dan bangun kecil berbentuk L pindah ke bagian bawah dengan kakinya menghadap ke atas. (2) Putar 45° searah jarum jam: bangun berdiri di atas sudutnya; takik yang tadi di kiri atas kini berada di puncak, sudut terpotong yang tadi di kanan bawah kini berada di ujung paling bawah, dan bangun kecil ikut miring. (3) Balik warna bangun kecil saja: bangun kecil menjadi putih, bangun besar tetap putih.\n\nOpsi a gugur karena urutannya terbalik (diputar 45° dulu, baru dicerminkan), sehingga miringnya ke arah berlawanan. Opsi c gugur karena warna bangun kecil tidak dibalik. Opsi d gugur karena memakai cermin tegak, bukan cermin mendatar. Opsi e gugur karena diputar 90°, bukan 45°. Jawaban: b.",
    gridS([[base, m1, m2, ans]], null, { size: 150, gap: 50, top: 46, hl: [0, 3], ann: steps, foot: 40 }));
}

// 6#35 — analogi (HOTS, 3 lapis): setengah bangun dilengkapi bayangan cerminnya pada sisi kanan, bayangan berwarna hitam, lalu gabungannya diputar 90° ↻.
{
  const P: Pt[] = [[-24, -26], [0, -26], [0, 26], [-12, 26], [-12, 4], [-24, -6]], Q: Pt[] = [[-22, -26], [0, -26], [0, 26], [-22, 26], [-22, 12], [-8, 12], [-8, -4], [-22, -12]];
  for (const [n, X] of [["P", P], ["Q", Q]] as const) assertChiral([poly(X, "w")], `6#35 ${n}`);
  const make = (X: Pt[], o: { black?: boolean; deg?: number; copy?: boolean } = {}): Fig => {
    const half: Fig = [poly(X, "w")], twin = o.copy ? mv(paint(half, "b"), 24, 0) : paint(tf(half, 0, true), o.black === false ? "w" : "b");
    return tf(sc([...half, ...twin], 0.82), o.deg ?? 90);
  };
  const A = ctr([poly(P, "w")]), B = make(P), C = ctr([poly(Q, "w")]), ans = make(Q);
  const opts = place(ans, [make(Q, { black: false }), make(Q, { deg: 0 }), make(Q, { deg: 270 }), make(Q, { copy: true })], "E");
  const ann: Ann = (at, s) => foot(["① dilengkapi bayangan cermin pada sisi kanannya", "② bayangan berwarna hitam", "③ gabungannya diputar 90° searah jarum jam"], at(0, 0)[1] + s / 2 + 40);
  add(35, "E", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Bangun dilengkapi bayangan cerminnya: bayangan menempel pada sisi tegak kanan, sehingga terbentuk bangun simetris dua kali lebih lebar. (2) Bayangan itu berwarna hitam, bangun asli tetap putih. (3) Gabungannya diputar 90° searah jarum jam, sehingga bangun putih pindah ke atas, bayangan hitam ke bawah, dan sisi yang tadinya di atas kini menghadap kanan. Terapkan pada gambar ketiga: bangun bertakik dilengkapi bayangan hitam di kanannya, lalu diputar 90° searah jarum jam, sehingga bagian putih di atas dengan takik menghadap ke atas, dan bagian hitam di bawah dengan takik menghadap ke bawah.\n\nOpsi a gugur karena bayangannya putih. Opsi b gugur karena gabungannya tidak diputar. Opsi c gugur karena diputar 90° berlawanan arah jarum jam, sehingga bagian hitam berada di atas. Opsi d gugur karena salinan hitam hanya digeser, tidak dicerminkan, sehingga takiknya menghadap arah yang sama dengan bangun putih. Jawaban: e.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 120 }));
}

// 6#36 — analogi (HOTS, 3 lapis): garis antartitik sudut diganti komplemennya (yang ada hilang, yang tidak ada muncul),
// warna titik sudut bergeser satu sudut searah jarum jam, titik pusat berbalik warna.
{
  const N: Pt[] = [[-30, -30], [30, -30], [30, 30], [-30, 30]]; // kiri atas, kanan atas, kanan bawah, kiri bawah
  const ALL = ["01", "12", "23", "30", "02", "13"];
  type Cfg = { e: string[]; f: Fill[]; c: Fill };
  const fig = ({ e, f, c }: Cfg): Fig => [
    ...e.map((k) => ({ k: "line" as const, a: N[+k[0]], b: N[+k[1]], w: 4 })),
    ...f.map((x, i) => dot(...N[i], 8, x)), dot(0, 0, 6, c),
  ];
  const step = (x: Cfg, o: { keep?: boolean; ccw?: boolean; center?: boolean; sidesOnly?: boolean } = {}): Cfg => ({
    e: o.keep ? x.e : ALL.filter((k) => (o.sidesOnly && ["02", "13"].includes(k) ? x.e.includes(k) : !x.e.includes(k))),
    f: x.f.map((_, i) => x.f[(i + (o.ccw ? 1 : 3)) % 4]), c: o.center === false ? x.c : inv(x.c),
  });
  const A: Cfg = { e: ["01", "12", "02"], f: ["b", "w", "w", "w"], c: "w" }, Cc: Cfg = { e: ["01", "23", "13"], f: ["b", "b", "w", "w"], c: "b" };
  assert.deepEqual(step(A).f, ["w", "b", "w", "w"], "6#36: warna bergeser searah jarum jam");
  const ans = fig(step(Cc));
  const opts = place(ans, [fig(step(Cc, { keep: true })), fig(step(Cc, { ccw: true })), fig(step(Cc, { center: false })), fig(step(Cc, { sidesOnly: true }))], "C");
  const ann: Ann = (at, s) => foot(["① garis yang ada hilang, yang tidak ada muncul", "② warna titik sudut bergeser 1 sudut searah jarum jam", "③ titik pusat berbalik warna"], at(0, 0)[1] + s / 2 + 40);
  add(36, "C", ANALOGI, analogyS([fig(A), fig(step(A)), fig(Cc), null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Garis di antara empat titik sudut diganti kebalikannya: dari enam garis yang mungkin (empat sisi dan dua diagonal), garis yang tadinya ada hilang, sedangkan garis yang tadinya tidak ada muncul. (2) Warna keempat titik sudut bergeser satu sudut searah jarum jam (titik hitam di kiri atas pindah ke kanan atas). (3) Titik di pusat berbalik warna. Terapkan pada gambar ketiga: garis sisi atas, sisi bawah, dan diagonal kanan atas–kiri bawah hilang, diganti sisi kanan, sisi kiri, dan diagonal kiri atas–kanan bawah; dua titik hitam di kiri atas dan kanan atas bergeser ke kanan atas dan kanan bawah; titik pusat menjadi putih.\n\nOpsi a gugur karena garisnya tidak diganti (masih sama dengan gambar ketiga). Opsi b gugur karena warna titik bergeser berlawanan arah jarum jam (hitam di kiri atas dan kiri bawah). Opsi d gugur karena titik pusat tetap hitam. Opsi e gugur karena hanya garis sisi yang diganti, sedangkan diagonal tetap seperti semula. Jawaban: c.",
    analogyS([fig(A), fig(step(A)), fig(Cc), ans], null, { hl: true, ann, foot: 120 }));
}

// 6#37 — ikon kategori (sedang): titik berada di sisi KIRI arah panah, kecuali satu (di kanan). Ciri mutlak lain terbagi 3/2 (diassert).
{
  const ARROW = (f: Fill): Fig => [poly([[0, -34], [15, -13], [5, -13], [5, 32], [-5, 32], [-5, -13], [-15, -13]], f)];
  const I: { deg: number; side: 1 | -1; a: Fill; d: Fill }[] = [
    { deg: 90, side: -1, a: "w", d: "b" }, { deg: 180, side: -1, a: "b", d: "b" }, { deg: 315, side: -1, a: "w", d: "w" },
    { deg: 45, side: 1, a: "b", d: "w" }, { deg: 225, side: -1, a: "b", d: "b" },
  ];
  const fig = (x: (typeof I)[number]): Fig => tf([...ARROW(x.a), dot(24 * x.side, 4, 8, x.d)], x.deg);
  const pos = I.map((x) => ptf([24 * x.side, 4], x.deg));
  const split = (v: (string | boolean)[]) => [...new Set(v)].every((k) => v.filter((u) => u === k).length >= 2);
  assert.ok(split(pos.map(([x]) => x > 0)) && split(pos.map(([, y]) => y > 0)) && split(I.map((x) => x.a)) && split(I.map((x) => x.d)), "6#37: ciri mutlak harus terbagi");
  assert.equal(new Set(I.map((x) => x.deg)).size, 5);
  const opts = place(fig(I[3]), [I[0], I[1], I[2], I[4]].map(fig), "D");
  const o = optionsRowS(opts, 20, { hl: 3 }), lab = o.body + I.map((x, i) => redText(o.at(i)[0], o.bottom + 14, x.side < 0 ? "kiri" : "kanan", 24)).join("") + redText(W / 2, o.bottom + 52, "letak titik dilihat dari arah panah (seolah berjalan mengikuti panah)", 22);
  add(37, "D", "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.", svgWrap(o.bottom, optionsRowS(opts, 20).body), 2,
    "Bayangkan berjalan mengikuti arah panah. Pada gambar a, b, c, dan e, titik berada di sebelah kiri panah: panah ke kanan dengan titik di atasnya (a), panah ke bawah dengan titik di kanannya (b), panah ke kiri atas dengan titik di kiri bawahnya (c), dan panah ke kiri bawah dengan titik di kanan bawahnya (e). Pada gambar d, panah menunjuk ke kanan atas dan titiknya berada di kanan bawah, yaitu di sebelah kanan panah.\n\nCiri lain tidak memisahkan satu gambar saja. Arah kelima panah semuanya berbeda. Panah hitam ada pada b, d, e dan panah putih pada a, c. Titik hitam ada pada a, b, e dan titik putih pada c, d. Titik di belahan kanan kotak ada pada b, d, e dan di belahan kiri pada a, c. Satu-satunya ciri yang hanya dimiliki satu gambar adalah titik di sebelah kanan arah panah. Jawaban: d.",
    svgWrap(o.bottom + 66, lab));
}
