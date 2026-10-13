import assert from "node:assert/strict";
import { type Ann, INK, KEYS, W, type Fig, type Fill, type Key, type Prim, type Pt, analogyS, fp, foot, gridS, optionsRowS, place, r1, redArrow, redRing, redText, regular, sig, svgWrap, tf } from "./figural-lib";

// Figural Simulasi Paket 3 baru (package_number 4), nomor 28-32 + 35-37. (26-27 = mosaik, figural-mosaik.ts; 51-56 = bundar.)
// Aturan sengaja berbeda dari pkg 3/13/15/16/2: jarum 45°, selisih kotak hitam, gandakan-kecilkan-tumpuk,
// cermin lalu putar (urutan langkah). Tata letak besar (gridS/analogyS) + gambar pembahasan tanpa id.

export type Fig4 = { pkg: 4; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG4_ITEMS: Fig4[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${key.toLowerCase()}\\.$`), `4#${seq}: pembahasan 2 paragraf + kunci`);
  FIG4_ITEMS.push({ pkg: 4, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";

export const poly = (pts: Pt[], fill: Fill): Prim => ({ k: "poly", pts, fill });
export const dot = (x: number, y: number, r = 4, fill: Fill = "b"): Prim => ({ k: "circ", c: [x, y], r, fill });
export const inv = (f: Fill): Fill => (f === "b" ? "w" : "b");
export const invF = (f: Fig): Fig => f.map((q) => (q.k === "line" ? q : { ...q, fill: inv(q.fill) }));
export const paint = (f: Fig, fill: Fill): Fig => f.map((q) => (q.k === "line" ? q : { ...q, fill }));
export const mvP = ([x, y]: Pt, dx: number, dy: number): Pt => [r1(x + dx), r1(y + dy)];
export const mv = (f: Fig, dx: number, dy: number): Fig =>
  f.map((q) => (q.k === "poly" ? { ...q, pts: q.pts.map((p) => mvP(p, dx, dy)) } : q.k === "circ" ? { ...q, c: mvP(q.c, dx, dy) } : { ...q, a: mvP(q.a, dx, dy), b: mvP(q.b, dx, dy) }));
export const sc = (f: Fig, k: number): Fig => f.map((q) => (q.k === "poly" ? { ...q, pts: q.pts.map(([x, y]): Pt => [r1(x * k), r1(y * k)]) } : q));
export const ctr = (f: Fig): Fig => {
  const p = f.flatMap((q) => (q.k === "poly" ? q.pts : [])), xs = p.map((a) => a[0]), ys = p.map((a) => a[1]);
  return mv(f, -(Math.min(...xs) + Math.max(...xs)) / 2, -(Math.min(...ys) + Math.max(...ys)) / 2);
};
export const md = (d: number) => ((d % 360) + 360) % 360;
/** Bangun harus kiral: tidak ada cerminan yang sama dengan rotasi 90° mana pun. */
export function assertChiral(base: Fig, tag: string) {
  for (const d of [0, 90, 180, 270]) for (const e of [0, 90, 180, 270]) assert.notEqual(sig(tf(base, d, true)), sig(tf(base, e)), `${tag}: bangun simetris`);
}
/** Transformasi global (putar 90°·k, cermin, balik warna) yang memetakan semua pasangan [x, y] juga tidak boleh mengesahkan pengecoh. */
export function assertNoGlobalAlias(tag: string, pairs: [Fig, Fig][], q: Fig, opts: Fig[], key: Key) {
  for (const d of [0, 90, 180, 270]) for (const m of [false, true]) for (const v of [false, true]) {
    const T = (f: Fig) => (v ? invF(tf(f, d, m)) : tf(f, d, m));
    if (!pairs.every(([x, y]) => sig(T(x)) === sig(y))) continue;
    opts.forEach((o, i) => KEYS[i] !== key && assert.notEqual(sig(T(q)), sig(o), `${tag}: opsi ${KEYS[i]} sah lewat putar ${d}/cermin ${m}/balik ${v}`));
  }
}
export const grid3 = (at: (r: number, c: number) => Fig, last: Fig | null) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : at(r, c))));
export const colArrows = (at: (r: number, c: number) => Pt, s: number, rows: number[]) => rows.map((r) => [0, 1].map((c) => {
  const [x1, y] = at(r, c), [x2] = at(r, c + 1);
  return redArrow([x1 + s / 2 + 4, y], [x2 - s / 2 - 4, y]);
}).join("")).join("");

// 4#29 — matriks (HOTS, 3 lapis): jarum berputar 45° ↺ per kolom, kotak hitam kolom 3 = kolom 1 − kolom 2, cakram putih-hitam-putih.
{
  const ARW: Pt[] = [[0, -27], [9, -14], [3, -14], [3, 0], [-3, 0], [-3, -14], [-9, -14]]; // ujung di atas, pangkal di pusat cakram
  const sq = (x: number, y: number, f: Fill): Prim => poly([[x - 5, y - 5], [x + 5, y - 5], [x + 5, y + 5], [x - 5, y + 5]], f);
  const cell = (ang: number, k: number, f: Fill): Fig => [
    { k: "circ", c: [0, -9], r: 30, fill: f },
    ...mv(tf([poly(ARW, inv(f))], md(ang)), 0, -9),
    ...Array.from({ length: 5 }, (_, i) => sq((i - 2) * 14, 36, i < k ? "b" : "w")),
  ];
  const R = [{ a0: 0, n: [5, 1] }, { a0: 90, n: [4, 2] }, { a0: 270, n: [5, 3] }]; // sudut awal jarum (° searah jarum jam dari atas), kotak hitam kolom 1 dan 2
  const COL: Fill[] = ["w", "b", "w"];
  const cnt = (r: number, c: number) => (c < 2 ? R[r].n[c] : R[r].n[0] - R[r].n[1]);
  const at = (r: number, c: number) => cell(R[r].a0 - 45 * c, cnt(r, c), COL[c]);
  assert.ok(R.slice(0, 2).some((x) => x.n[0] - x.n[1] !== x.n[0] - 1) && R.slice(0, 2).some((x) => x.n[0] - x.n[1] !== x.n[1]), "4#29: aturan kotak alternatif harus gugur");
  assert.ok(R.every((x) => x.n[0] > x.n[1]) && new Set(R.map((x) => x.a0)).size === 3, "4#29: selisih positif, sudut awal berbeda");
  const ans = at(2, 2), opts = place(ans, [cell(0, 2, "w"), cell(180, 3, "w"), cell(180, 2, "b"), cell(225, 2, "w")], "A");
  assertNoGlobalAlias("4#29", [0, 1].map((r) => [at(r, 0), at(r, 2)]), at(2, 0), opts, "A");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((r) => { const [x, y] = a(r, 2); return redText(x + s / 2 + 12, y + 9, `${R[r].n[0]} − ${R[r].n[1]} = ${r === 2 ? "?" : cnt(r, 2)}`, 24, "start"); }).join("") +
    foot(["→ jarum berputar 45° berlawanan arah jarum jam tiap kolom", "→ kotak hitam kolom 3 = kolom 1 − kolom 2", "→ warna cakram: putih, hitam, putih"], a(2, 0)[1] + s / 2 + 42);
  add(29, "A", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Jarum berputar 45° berlawanan arah jarum jam dari kolom ke kolom (baris 1: atas, kiri atas, kiri; baris 2: kanan, kanan atas, atas; baris 3: kiri, kiri bawah, jadi berikutnya bawah). (2) Banyak kotak hitam di kolom 3 = kolom 1 dikurangi kolom 2 (baris 1: 5 − 1 = 4, baris 2: 4 − 2 = 2, jadi baris 3: 5 − 3 = 2). (3) Warna cakram selalu putih, hitam, putih, sehingga kolom 3 putih. Jawabannya cakram putih dengan jarum ke bawah dan 2 kotak hitam.\n\nOpsi b gugur karena jarum menunjuk ke atas (diputar searah jarum jam). Opsi c gugur karena kotak hitamnya 3 (menyalin kolom 2, bukan selisih). Opsi d gugur karena cakramnya hitam (mengikuti kolom 2). Opsi e gugur karena jarum menunjuk ke kiri bawah (tidak berputar dari kolom 2). Jawaban: a.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 4#31 — rotasi (sedang): cermin terhadap garis tegak, LALU putar 90° berlawanan arah jarum jam (urutan langkah menentukan).
{
  const base: Fig = [poly([[-30, -26], [12, -26], [12, -14], [5, -14], [5, 2], [16, 10], [5, 18], [5, 26], [-5, 26], [-5, -14], [-30, -14]], "w")]; // palu: kepala condong ke kiri, gigi kecil di kanan gagang
  assertChiral(base, "4#31");
  const mid = tf(base, 0, true), ans = tf(base, 270, true);
  assert.equal(sig(tf(mid, 270)), sig(ans), "4#31: cermin lalu putar ccw");
  const opts = place(ans, [tf(base, 90, true), tf(base, 270), tf(base, 0, true), tf(base, 180, true)], "E");
  assert.notEqual(sig(tf(tf(base, 270), 0, true)), sig(ans), "4#31: urutan harus menentukan");
  const axis: Ann = (at, s) => { const [x, y] = at(0, 0); return `<line x1="${x}" y1="${r1(y - s / 2 - 8)}" x2="${x}" y2="${r1(y + s / 2 + 8)}" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>`; };
  const steps: Ann = (at, s) => ["cermin tegak", "putar 90° ↺"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 22); }).join("") +
    redText(W / 2, at(0, 0)[1] + s / 2 + 44, "urutan: cermin dulu, baru diputar", 24);
  add(31, "E", "Gambar di atas dicerminkan terhadap garis putus-putus tegak, lalu hasilnya diputar 90° berlawanan arah jarum jam. Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, ann: axis, foot: 24 }), 2,
    "Kerjakan dua langkah berurutan. (1) Cermin terhadap garis tegak: kepala palu yang semula menjulur panjang ke kiri sekarang menjulur panjang ke kanan, gagang tetap di bawah, dan gigi kecil pindah ke kiri gagang. (2) Putar 90° berlawanan arah jarum jam: bagian atas pindah ke kiri dan bagian kanan pindah ke atas. Hasilnya palu berbaring: kepalanya berupa batang tegak di sisi kiri dengan bagian panjang menjulur ke atas, gagang menuju ke kanan, dan gigi kecil menghadap ke bawah.\n\nOpsi a gugur karena kepala berada di kanan, gagang ke kiri, dan gigi menghadap ke atas: langkahnya terbalik (diputar dulu, baru dicerminkan). Opsi b gugur karena hanya diputar, tidak dicerminkan (bagian panjang kepala menjulur ke bawah, gigi menghadap ke atas). Opsi c gugur karena hanya dicerminkan, tidak diputar. Opsi d gugur karena palu terbalik (kepala di bawah), hasil cermin mendatar. Jawaban: e.",
    gridS([[base, mid, ans]], null, { gap: 70, top: 46, hl: [0, 2], ann: (at, s) => axis(at, s) + steps(at, s), foot: 64 }));
}
// 4#35 — analogi (HOTS, 3 lapis): bangun digandakan jadi dua salinan kecil ditumpuk atas-bawah, kedua salinan diputar 90° ↻, salinan atas berwarna kebalikan.
{
  const P: Fig = [poly([[-12, -26], [10, -26], [20, -16], [20, 0], [10, 10], [-2, 10], [-2, 26], [-12, 26]], "w")];
  const Q: Fig = [poly([[-20, -26], [0, -26], [0, 0], [22, 0], [22, 26], [-20, 26]], "w")];
  assertChiral(P, "4#35 P"); assertChiral(Q, "4#35 Q");
  const dup = (g: Fig, deg: number, top: Fill, bot: Fill, horiz = false): Fig => {
    const x = sc(ctr(tf(g, md(deg))), 0.68), [dx, dy] = horiz ? [24, 0] : [0, 22];
    return [...mv(paint(x, top), -dx, -dy), ...mv(paint(x, bot), dx, dy)];
  };
  const A = ctr(P), B = dup(P, 90, "b", "w"), C = ctr(Q), ans = dup(Q, 90, "b", "w");
  const opts = place(ans, [dup(Q, 90, "w", "b"), dup(Q, 270, "b", "w"), dup(Q, 0, "b", "w"), dup(Q, 90, "b", "w", true)], "B");
  const ann: Ann = (at, s) => ([1, 3] as const).map((c) => redRing(...fp([0, -22], at(0, c), s), 34)).join("") +
    foot(["① digandakan, diperkecil, ditumpuk atas-bawah", "② kedua salinan diputar 90° searah jarum jam", "③ salinan atas berwarna kebalikan (hitam)"], at(0, 0)[1] + s / 2 + 40);
  add(35, "B", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Bangun digandakan menjadi dua salinan yang lebih kecil dan ditumpuk atas-bawah. (2) Kedua salinan diputar 90° searah jarum jam (huruf P yang tegak menjadi rebah: batang di atas, lengkung menggantung di kanan). (3) Salinan atas berwarna kebalikan dari bangun asli, jadi hitam, sedangkan salinan bawah tetap putih. Terapkan pada gambar ketiga: bangun siku digandakan, diperkecil, diputar 90° searah jarum jam sehingga batang mendatar di atas dan kakinya menggantung di kiri, lalu salinan atas dihitamkan.\n\nOpsi a gugur karena warna salinan tertukar (atas putih, bawah hitam). Opsi c gugur karena diputar 90° berlawanan arah jarum jam (kaki menjulur ke atas di kanan). Opsi d gugur karena salinan tidak diputar. Opsi e gugur karena salinan disusun kiri-kanan, bukan atas-bawah. Jawaban: b.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 120 }));
}

// 4#28 — matriks (sedang): sisi bangun +1 per kolom; jumlah titik = nomor baris.
{
  const cell = (n: number, d: number): Fig => [poly(regular(n, 36, n === 4 ? 45 : 0), "w"), ...Array.from({ length: d }, (_, i) => dot(r1((i - (d - 1) / 2) * 14), 6, 4.5))];
  const S0 = [3, 4, 3];
  const at = (r: number, c: number) => cell(S0[r] + c, r + 1);
  const ans = at(2, 2), opts = place(ans, [cell(5, 2), cell(4, 3), cell(6, 3), cell(5, 4)], "E");
  assertNoGlobalAlias("4#28", [0, 1].map((r) => [at(r, 0), at(r, 2)]), at(2, 0), opts, "E");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    foot(["→ jumlah sisi bangun bertambah 1 tiap kolom", "→ jumlah titik di dalam = nomor baris"], a(2, 0)[1] + s / 2 + 42);
  add(28, "E", POLA, gridS(grid3(at, null), opts), 2,
    "Ada dua aturan. (1) Jumlah sisi bangun bertambah 1 dari kolom ke kolom: baris 1 segitiga, persegi, segi lima; baris 2 persegi, segi lima, segi enam; baris 3 segitiga, persegi, sehingga kolom 3 segi lima. (2) Jumlah titik di dalam bangun sama dengan nomor baris: 1 titik di baris 1, 2 titik di baris 2, jadi 3 titik di baris 3. Jawabannya segi lima dengan 3 titik.\n\nOpsi a gugur karena titiknya hanya 2 (menyalin baris 2). Opsi b gugur karena bangunnya tetap persegi (sisinya tidak bertambah). Opsi c gugur karena bangunnya segi enam (sisi bertambah 2). Opsi d gugur karena titiknya 4 (titik ikut bertambah per kolom). Jawaban: e.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 120 }));
}
// 4#30 — matriks (HOTS, 3 lapis): tiga batang bergeser 1 posisi ke kanan; batang yang pindah (kanan → kiri) berganti warna dan bertambah tinggi 1.
{
  const U = 10, BASE = 38, XS = [-26, 0, 26];
  type Bar = [number, Fill];
  const bars = (st: Bar[]): Fig => [{ k: "line", a: [-40, BASE], b: [40, BASE], w: 3 }, ...st.map(([h, f], i) => poly([[XS[i] - 9, BASE], [XS[i] + 9, BASE], [XS[i] + 9, BASE - h * U], [XS[i] - 9, BASE - h * U]], f))];
  const step = (st: Bar[]): Bar[] => [[st[2][0] + 1, inv(st[2][1])], st[0], st[1]];
  const R: Bar[][] = [[[1, "w"], [3, "b"], [2, "w"]], [[2, "b"], [1, "b"], [3, "w"]], [[1, "w"], [2, "w"], [3, "b"]]];
  const S = R.map((r0) => [r0, step(r0), step(step(r0))]);
  assert.ok(S.every((r) => r.every((st) => st.every(([h]) => h <= 5))), "4#30: tinggi melebihi 5");
  assert.deepEqual(S[2][2], [[3, "b"], [4, "w"], [1, "w"]]);
  const at = (r: number, c: number) => bars(S[r][c]);
  const ans = at(2, 2), c2 = S[2][1];
  const opts = place(ans, [bars([[2, "b"], [4, "w"], [1, "w"]]), bars([[3, "w"], [4, "w"], [1, "w"]]), bars([c2[1], c2[2], [c2[0][0] + 1, inv(c2[0][1])]]), bars([[3, "b"], [4, "w"], [1, "b"]])], "B");
  assertNoGlobalAlias("4#30", [0, 1].map((r) => [at(r, 0), at(r, 2)]), at(2, 0), opts, "B");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((r) => [0, 1].map((c) => redRing(...fp([XS[2], BASE - (S[r][c][2][0] * U) / 2], a(r, c), s), 15)).join("")).join("") +
    foot(["→ semua batang bergeser 1 posisi ke kanan", "→ batang yang pindah (lingkaran merah) berganti warna", "→ batang yang pindah bertambah tinggi 1 satuan"], a(2, 0)[1] + s / 2 + 42);
  add(30, "B", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Ketiga batang bergeser satu posisi ke kanan, dan batang paling kanan pindah ke paling kiri. (2) Batang yang pindah itu berganti warna (putih ↔ hitam). (3) Batang yang pindah itu juga bertambah tinggi 1 satuan. Baris 3 kolom 2 berisi batang bertinggi 4, 1, 2 yang semuanya putih; batang paling kanan (tinggi 2, putih) pindah ke kiri menjadi tinggi 3 dan hitam, sehingga hasilnya tinggi 3, 4, 1 dengan warna hitam, putih, putih.\n\nOpsi a gugur karena batang yang pindah tidak bertambah tinggi (2, bukan 3). Opsi c gugur karena batang yang pindah tidak berganti warna. Opsi d gugur karena batang bergeser ke kiri, bukan ke kanan. Opsi e gugur karena batang paling kanan (yang tidak pindah) ikut berganti warna. Jawaban: b.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 4#32 — rotasi (HOTS, 3 lapis): hitam diputar 90° ↻ di tempat, putih dicerminkan tegak di tempat, lalu keduanya bertukar tempat.
{
  const Pb: Fig = [poly([[-14, -18], [0, -18], [0, -4], [14, -4], [14, 18], [-14, 18]], "b")];
  const Qw: Fig = [poly([[-16, -14], [16, -14], [16, 18], [2, 18], [-16, 2]], "w")];
  assertChiral(Pb, "4#32 tangga"); assertChiral(Qw, "4#32 rumah");
  const build = (b: Fig, w: Fig, swap: boolean): Fig => [...mv(b, swap ? 24 : -24, 0), ...mv(w, swap ? -24 : 24, 0)];
  const base = build(Pb, Qw, false), mid = build(tf(Pb, 90), tf(Qw, 0, true), false), ans = build(tf(Pb, 90), tf(Qw, 0, true), true);
  const opts = place(ans, [mid, build(tf(Pb, 0, true), tf(Qw, 90), true), build(tf(Pb, 270), tf(Qw, 0, true), true), build(tf(Pb, 90), tf(Qw, 180, true), true)], "C");
  const steps: Ann = (at, s) => ["putar / cermin di tempat", "bertukar tempat"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 20); }).join("") +
    redText(W / 2, at(0, 0)[1] + s / 2 + 44, "hitam: putar 90° ↻ · putih: cermin tegak · lalu bertukar tempat", 24);
  add(32, "C", "Pada gambar di atas, bangun hitam diputar 90° searah jarum jam di tempatnya (terhadap pusatnya sendiri), bangun putih dicerminkan terhadap garis tegak yang melalui pusatnya sendiri, lalu kedua bangun bertukar tempat (kiri ke kanan dan sebaliknya). Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, foot: 24 }), 3,
    "Kerjakan tiga langkah berurutan. (1) Bangun hitam (tangga) diputar 90° searah jarum jam di tempatnya: takik yang semula di kanan atas pindah ke kanan bawah. (2) Bangun putih (rumah miring) dicerminkan terhadap garis tegak di pusatnya sendiri: sisi miringnya yang semula di kiri bawah pindah ke kanan bawah. (3) Kedua bangun bertukar tempat: bangun hitam ke kanan, bangun putih ke kiri.\n\nOpsi a gugur karena kedua bangun tidak bertukar tempat (hitam masih di kiri). Opsi b gugur karena perlakuannya tertukar: bangun hitam dicerminkan dan bangun putih diputar. Opsi d gugur karena bangun hitam diputar berlawanan arah jarum jam (takik di kiri atas). Opsi e gugur karena bangun putih dicerminkan mendatar (sisi miring di kiri atas). Jawaban: c.",
    gridS([[base, mid, ans]], null, { gap: 70, top: 46, hl: [0, 2], ann: steps, foot: 64 }));
}
// 4#36 — analogi (HOTS, 3 lapis): jumlah sisi digandakan, warna bangun bertukar, panah di dalam berputar 90° ↻.
{
  const ARW: Pt[] = [[0, -14], [8, -4], [3, -4], [3, 12], [-3, 12], [-3, -4], [-8, -4]];
  const fig = (n: number, f: Fill, deg: number): Fig => [poly(regular(n, 38, n === 4 ? 45 : n === 8 ? 22.5 : 0), f), ...tf(sc([poly(ARW, inv(f))], 1.35), md(deg))];
  const A = fig(3, "w", 0), B = fig(6, "b", 90), C = fig(4, "w", 0), ans = fig(8, "b", 90);
  const opts = place(ans, [fig(8, "b", 270), fig(8, "w", 90), fig(4, "b", 90), fig(8, "b", 0)], "A");
  assert.ok(opts.every((o) => !(o[0].k === "poly" && o[0].pts.length === 7)), "4#36: bacaan 'sisi + 3' tidak boleh sah");
  const ann: Ann = (at, s) => ([[0, "3 sisi"], [1, "6 sisi"], [2, "4 sisi"], [3, "8 sisi"]] as const).map(([c, t]) => redText(at(0, c)[0], at(0, c)[1] + s / 2 + 30, t, 22)).join("") +
    foot(["① jumlah sisi digandakan", "② warna bangun bertukar", "③ panah di dalam berputar 90° searah jarum jam"], at(0, 0)[1] + s / 2 + 74);
  add(36, "A", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Jumlah sisi bangun digandakan: segitiga (3 sisi) menjadi segi enam (6 sisi). (2) Warna bangun bertukar: putih menjadi hitam. (3) Panah di dalam berputar 90° searah jarum jam: dari menunjuk ke atas menjadi menunjuk ke kanan. Terapkan pada gambar ketiga: persegi (4 sisi) menjadi segi delapan (8 sisi) berwarna hitam, dengan panah menunjuk ke kanan.\n\nPerubahan 3 → 6 sisi juga bisa dibaca 'ditambah 3'; menurut bacaan itu jawabannya segi tujuh, yang tidak ada di pilihan, jadi yang berlaku penggandaan. Opsi b gugur karena panah menunjuk ke kiri (berputar berlawanan arah jarum jam). Opsi c gugur karena warna bangun tidak bertukar. Opsi d gugur karena sisinya tidak digandakan (tetap persegi). Opsi e gugur karena panah tidak berputar (tetap menunjuk ke atas). Jawaban: a.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 154 }));
}
// 4#37 — ikon kategori (sedang): kotak hitam pada kisi 2×2 bersambung sisi ke sisi, kecuali satu (diagonal). Ciri lain terbagi 3/2 (diassert).
{
  const Q: Record<string, Pt[]> = { TL: [[-36, -36], [0, -36], [0, 0], [-36, 0]], TR: [[0, -36], [36, -36], [36, 0], [0, 0]], BL: [[-36, 0], [0, 0], [0, 36], [-36, 36]], BR: [[0, 0], [36, 0], [36, 36], [0, 36]] };
  const fig = (blk: string[]): Fig => Object.entries(Q).map(([k, pts]) => poly(pts, blk.includes(k) ? "b" : "w"));
  const I = [["TL", "TR"], ["BL", "BR"], ["BL", "BR", "TR"], ["TL", "BL", "TR"], ["TL", "BR"]];
  const adj = (a: string, b: string) => a[0] === b[0] ? a[1] !== b[1] : a[1] === b[1];
  const joined = (blk: string[]) => { const seen = new Set([blk[0]]); for (let n = 0; n < 3; n++) blk.forEach((x) => blk.forEach((y) => seen.has(x) && adj(x, y) && seen.add(y))); return seen.size === blk.length; };
  assert.deepEqual(I.map(joined), [true, true, true, true, false]);
  for (const q of ["TL", "TR", "BL", "BR"]) { const n = I.filter((b) => b.includes(q)).length; assert.ok(n >= 2 && n <= 3, `4#37: kotak ${q} hanya dimiliki ${n} gambar`); }
  const cn = I.map((b) => b.length); assert.ok([2, 3].every((v) => cn.filter((x) => x === v).length >= 2), "4#37: jumlah kotak hitam harus terbagi");
  const opts = place(fig(I[4]), I.slice(0, 4).map(fig), "E");
  const o = optionsRowS(opts, 20, { hl: 4 }), lab = o.body + I.map((b, i) => redText(o.at(i)[0], o.bottom + 14, joined(b) ? "menyatu" : "terpisah", 22)).join("") + redText(W / 2, o.bottom + 52, "kotak hitam bersambung sisi ke sisi atau tidak", 24);
  add(37, "E", "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.", svgWrap(o.bottom, optionsRowS(opts, 20).body), 2,
    "Perhatikan kotak hitam pada setiap gambar. Pada gambar a sampai d, kotak hitamnya bersambung sisi ke sisi: dua kotak berdampingan (a di atas, b di bawah) atau tiga kotak berbentuk siku (c, d). Pada gambar e, dua kotak hitamnya hanya bersentuhan di sudut (diagonal).\n\nCiri lain tidak memisahkan satu gambar saja. Jumlah kotak hitam: 2 pada a, b, e dan 3 pada c, d. Kotak kiri atas hitam pada a, d, e; kotak kanan atas pada a, c, d; kotak kiri bawah pada b, c, d; kotak kanan bawah pada b, c, e. Satu-satunya ciri yang hanya dimiliki satu gambar adalah kotak hitam yang tidak bersambung sisi. Jawaban: e.",
    svgWrap(o.bottom + 66, lab));
}
