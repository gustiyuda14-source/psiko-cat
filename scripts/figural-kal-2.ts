import assert from "node:assert/strict";
import { type Ann, type Fig, type Fill, type Key, type Prim, type Pt, W, analogyItem, analogyS, dashLine, foot, fp, gridS, optionsRow, optionsRowS, place, ptf, r1, redArrow, redRing, redText, regular, sig, stimulusItem, svgWrap, tf } from "./figural-lib";

// Figural Latihan Paket 1 (package_number 2), nomor 31-32, 35-37.
// Dipindah dari generate-kecerdasan-figural-kal.ts tanpa perubahan soal (options_payload/scoring_rule harus tetap sama
// karena backfill DB mencocokkan butir lewat isi soal). Pembahasan 2 paragraf + gambar pembahasan (jawaban berbingkai
// hijau, anotasi merah, tanpa id) ditambahkan kemudian, mengikuti pkg 15/16.

export type Fig2 = { pkg: 2; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG2_ITEMS: Fig2[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+ Tip: [^\\n]+ Jawaban: ${key.toLowerCase()}\\.$`), `2#${seq}: pembahasan 2 paragraf + tip + kunci`);
  FIG2_ITEMS.push({ pkg: 2, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const GANJIL = "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.";
const ROTASI = "Pilihlah satu gambar yang merupakan hasil perputaran (rotasi) dari gambar di atas, bukan pencerminannya.";

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
/** Lima gambar a-e tanpa gambar soal (ikon kategori). */
const rowItem = (options: Fig[]) => { const o = optionsRow(options, 20); return svgWrap(o.bottom, o.body); };

// 2#31 — rotasi: satu hasil putaran 180°, sisanya cerminan.
{
  const base: Fig = [poly([[-30, -10], [-10, -10], [-10, -30], [10, -30], [10, 10], [30, 10], [30, 30], [-10, 30], [-10, 10], [-30, 10]], "w"), dot(0, -18, 5, "b"), poly([[14, 14], [26, 14], [26, 26]], "b")];
  assertChiral(base, "2#31");
  const ans = tf(base, 180);
  const opts = place(ans, [tf(base, 0, true), tf(base, 90, true), tf(base, 180, true), tf(base, 270, true)], "C");
  const MARK: Pt[] = [[0, -18], [22, 18]]; // titik hitam, segitiga hitam
  const ann: Ann = (at, s) => { const a = at(0, 0), b = at(0, 1); return redArrow([a[0] + s / 2 + 10, a[1]], [b[0] - s / 2 - 10, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - 18, "180°", 30) +
    MARK.map((p, i) => redRing(...fp(p, a, s), 20 + 4 * i) + redRing(...fp(ptf(p, 180), b, s), 20 + 4 * i)).join("") + foot(["titik pindah ke bawah, segitiga ke kiri atas"], a[1] + s / 2 + 44); };
  add(31, "C", ROTASI, stimulusItem(base, false, opts), 2,
    "Pakai dua patokan: titik hitam (atas tengah) dan segitiga hitam (kanan bawah). Pada perputaran, semua bagian berputar bersama dengan arah yang sama, jadi urutan patokan yang dibaca searah jarum jam tidak pernah berubah; pada cerminan, urutan itu terbalik. Gambar c adalah gambar soal yang diputar 180°: titik pindah ke bawah tengah, segitiga pindah ke kiri atas, dan dari titik, bergerak searah jarum jam, segitiga tetap ditemui sebelum setengah putaran, sama seperti pada gambar soal (pada cerminan, segitiga baru ditemui setelah lewat setengah putaran).\n\nOpsi a gugur karena merupakan cerminan kiri-kanan (titik tetap di atas, segitiga pindah ke kiri bawah). Opsi b gugur karena dicerminkan lalu diputar 90°. Opsi d gugur karena merupakan cerminan atas-bawah (titik di bawah, segitiga di kanan atas). Opsi e gugur karena dicerminkan lalu diputar 270°. Tip: pada soal 'putaran, bukan cerminan', cukup cek urutan dua patokan searah jarum jam; opsi yang urutannya terbalik pasti cerminan. Jawaban: c.",
    gridS([[base, ans]], null, { size: 170, gap: 160, top: 40, hl: [0, 1], ann, foot: 64 }));
}

// 2#32 — cermin tegak saja.
{
  const base: Fig = [dot(-16, -16, 13, "w"), dot(-16, -16, 5, "b"), line([-6, -6], [26, 26], 6), line([12, 12], [20, 4], 5), line([20, 20], [28, 12], 5)];
  assertChiral(base, "2#32");
  const ans = tf(base, 0, true);
  const opts = place(ans, [tf(base, 180, true), tf(base, 180), tf(base, 90), tf(base, 270, true)], "D");
  const MARK: Pt[] = [[-16, -16], [18, 10]]; // kepala, gerigi
  const ann: Ann = (at, s) => { const a = at(0, 0), b = at(0, 1), mx = (a[0] + b[0]) / 2; return dashLine([mx, a[1] - s / 2 - 6], [mx, a[1] + s / 2 + 6]) + redText(mx, a[1] - s / 2 - 14, "cermin tegak", 26) +
    MARK.map((p, i) => redRing(...fp(p, a, s), 26 - 4 * i) + redRing(...fp(ptf(p, 0, true), b, s), 26 - 4 * i)).join("") + foot(["kiri ↔ kanan bertukar, atas-bawah tetap"], a[1] + s / 2 + 44); };
  add(32, "D", "Gambar di atas dicerminkan terhadap cermin tegak pada garis putus-putus. Pilihlah satu gambar yang merupakan hasil cerminannya.", stimulusItem(base, true, opts), 2,
    "Cermin tegak hanya menukar kiri dan kanan; atas dan bawah tetap. Pada gambar soal, kepala kunci ada di kiri atas, batangnya turun ke kanan bawah, dan gerigi berada di sisi atas batang (menghadap ke kanan atas). Pada cerminannya, kepala kunci pindah ke kanan atas, batang turun ke kiri bawah, dan gerigi tetap di sisi atas batang tetapi menghadap ke kiri atas, yaitu gambar d.\n\nOpsi a gugur karena merupakan cerminan mendatar (kepala pindah ke kiri bawah). Opsi b gugur karena diputar 180° (kepala di kanan bawah). Opsi c gugur karena hanya diputar 90° searah jarum jam: kepalanya memang di kanan atas, tetapi gerigi berada di sisi bawah batang. Opsi e gugur karena dicerminkan lalu diputar: kepala tetap di kiri atas, tetapi gerigi pindah ke sisi bawah batang. Tip: cek dua bagian sekaligus (kepala dan gerigi), karena putaran 90° juga bisa memindahkan kepala ke kanan atas. Jawaban: d.",
    gridS([[base, ans]], null, { size: 170, gap: 160, top: 40, hl: [0, 1], ann, foot: 64 }));
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
  const ans = fig("bendera", 3, 270), figs = [fig("sepatu", 1, 0), fig("sepatu", 2, 270), fig("bendera", 2, 0), ans];
  const opts = place(ans, [fig("bendera", 3, 90), fig("bendera", 2, 270), fig("bendera", 3, 270, true), fig("bendera", 3, 0)], "A");
  // lingkaran merah mengelilingi kelompok titik tiap gambar (pusat = rata-rata titik kecil)
  const ring: Ann = (at, s) => figs.map((f, c) => {
    const ds = f.filter((q): q is Extract<Prim, { k: "circ" }> => q.k === "circ"), n = ds.length;
    return redRing(...fp([ds.reduce((t, q) => t + q.c[0], 0) / n, ds.reduce((t, q) => t + q.c[1], 0) / n], at(0, c), s), 10 + 7 * n);
  }).join("") + foot(["① diputar 90° berlawanan arah jarum jam (atas → kiri)", "② titik bertambah 1"], at(0, 0)[1] + s / 2 + 40);
  add(35, "A", ANALOGI, analogyItem([fig("sepatu", 1, 0), fig("sepatu", 2, 270), fig("bendera", 2, 0)], opts), 3,
    "Dari gambar pertama ke kedua ada dua perubahan. (1) Gambar diputar 90° berlawanan arah jarum jam: ujung atas batang tegak bangun L pindah ke kiri, dan kakinya yang semula menunjuk ke kanan kini menunjuk ke atas. (2) Titiknya bertambah satu (1 menjadi 2). Gambar ketiga adalah bendera tegak dengan segitiga menunjuk ke kanan dan 2 titik, jadi jawabannya bendera yang diputar 90° berlawanan arah jarum jam (tiang mendatar di bawah, segitiga menunjuk ke atas) dengan 3 titik.\n\nOpsi b gugur karena diputar searah jarum jam (tiang di atas, segitiga menunjuk ke bawah). Opsi c gugur karena titiknya tetap 2. Opsi d gugur karena merupakan cerminan, bukan putaran (segitiga menunjuk ke bawah). Opsi e gugur karena bendera tidak diputar. Tip: ikuti satu ujung yang mudah dilihat; pada putaran 90° berlawanan arah jarum jam, yang menunjuk ke kanan pasti berubah menunjuk ke atas. Jawaban: a.",
    analogyS(figs, null, { hl: true, ann: ring, foot: 86 }));
}

// 2#36 — analogi: sisi bangun +1, warna dibalik, titik +1.
{
  const fig = (n: number, f: Fill, dots: number): Fig => [ngon(n, n === 3 ? 42 : 36, f), ...dotsRow(dots, n === 3 ? 8 : 0, inv(f), 11, 4)];
  const ans = fig(6, "b", 4), figs = [fig(3, "w", 1), fig(4, "b", 2), fig(5, "w", 3), ans];
  const opts = place(ans, [fig(6, "w", 4), fig(5, "b", 4), fig(6, "b", 3), fig(7, "b", 4)], "E");
  const lab: Ann = (at, s) => [[3, 1], [4, 2], [5, 3], [6, 4]].map(([n, k], c) => redText(at(0, c)[0], at(0, c)[1] + s / 2 + 32, `${n} sisi · ${k} titik`, 24)).join("") +
    foot(["① sisi +1 · ② warna dibalik · ③ titik +1"], at(0, 0)[1] + s / 2 + 74);
  add(36, "E", ANALOGI, analogyItem([fig(3, "w", 1), fig(4, "b", 2), fig(5, "w", 3)], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Jumlah sisi bertambah satu: segitiga (3 sisi) menjadi persegi yang berdiri pada sudutnya (4 sisi). (2) Warna dibalik: bangun putih menjadi hitam, titik hitam menjadi putih. (3) Jumlah titik bertambah satu (1 menjadi 2). Gambar ketiga adalah segi lima putih dengan 3 titik hitam, jadi jawabannya segi enam hitam dengan 4 titik putih.\n\nOpsi a gugur karena warnanya tidak dibalik (segi enam putih). Opsi b gugur karena sisinya tidak bertambah (masih segi lima). Opsi c gugur karena titiknya tidak bertambah (masih 3). Opsi d gugur karena sisinya bertambah dua (segi tujuh). Tip: catat tiap perubahan sebagai angka (sisi +1, titik +1) dan warna (dibalik), lalu coret opsi yang melanggar salah satunya. Jawaban: e.",
    analogyS(figs, null, { hl: true, ann: lab, foot: 96 }));
}

// 2#37 — ikon kategori: empat bangun bersisi 6, satu bersisi 7.
{
  const H1: Fig = [poly([[-30, -18], [0, -34], [30, -18], [30, 18], [0, 34], [-30, 18]], "b")];
  const H2: Fig = [poly([[-28, -28], [0, -28], [0, 0], [28, 0], [28, 28], [-28, 28]], "w")];
  const H3: Fig = [poly([[-30, -24], [0, 0], [30, -24], [30, 6], [0, 30], [-30, 6]], "w")];
  const H4: Fig = [poly([[-30, -20], [-10, -34], [30, -34], [30, 20], [10, 34], [-30, 34]], "b")];
  const odd: Fig = [poly([[-30, -12], [8, -12], [8, -30], [34, 0], [8, 30], [8, 12], [-30, 12]], "w")];
  const opts = place(odd, [H1, H2, H3, H4], "C");
  // titik sudut ditandai merah supaya sisi mudah dihitung
  const o = optionsRowS(opts, 20, { hl: 2 }), lab = o.body + opts.map((f, i) => {
    const pts = (f[0] as Extract<Prim, { k: "poly" }>).pts;
    return pts.map((p) => `<circle cx="${r1(fp(p, o.at(i), o.size)[0])}" cy="${r1(fp(p, o.at(i), o.size)[1])}" r="6" fill="#d32f2f"/>`).join("") + redText(o.at(i)[0], o.bottom + 14, `${pts.length} sisi`, 26);
  }).join("") + redText(W / 2, o.bottom + 54, "hitung sudut = hitung sisi", 24);
  add(37, "C", GANJIL, rowItem(opts), 2,
    "Ciri yang sama pada empat gambar adalah jumlah sisinya. Gambar a, b, d, dan e masing-masing dibatasi 6 sisi, meskipun bentuknya berbeda-beda: a segi enam beraturan, b bangun L, d bangun berlekuk seperti huruf V, dan e segi enam terpancung dua sudut. Gambar c (panah) dibatasi 7 sisi, jadi hanya c yang tidak termasuk kelompoknya.\n\nWarna tidak membedakan karena hitam (a, e) dan putih (b, c, d) masing-masing muncul lebih dari satu kali. Bentuk cekung juga muncul lebih dari satu kali (b, c, d), dan bentuk cembung muncul pada a dan e, jadi keduanya bukan pembeda. Tip: hitung sudutnya, bukan sisinya, karena pada bangun tertutup jumlah sudut selalu sama dengan jumlah sisi dan sudut lebih mudah ditandai. Jawaban: c.",
    svgWrap(o.bottom + 68, lab));
}
