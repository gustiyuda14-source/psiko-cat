import assert from "node:assert/strict";
import { type Ann, INK, KEYS, W, type Fig, type Fill, type Key, type Prim, type Pt, analogyS, dashLine, fp, foot, gridS, optionsRowS, place, ptf, r1, redArrow, redRing, redText, regular, sig, svgWrap, tf } from "./figural-lib";
import { assertChiral, colArrows, ctr, dot, grid3, inv, invF, md, mv, paint, poly, sc } from "./figural-kal-4";

// Figural Latihan Paket 4 baru (package_number 5), nomor 28-32 + 35-37. (26-27 = mosaik, figural-mosaik.ts; 51-56 = bundar.)
// Aturan sengaja berbeda dari pkg 3/4/13/15/16/2: jumlah bangun dijumlahkan, lapisan warna bergeser ke dalam, mini-kisi bergeser + titik,
// putar lalu cermin mendatar, putar + cermin bangun kecil + balik warna, salinan diagonal + bayangan cermin, geser sudut + titik pusat, pusat lingkaran.
// Tata letak besar (gridS/analogyS) + gambar pembahasan tanpa id.

export type Fig5 = { pkg: 5; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG5_ITEMS: Fig5[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${key.toLowerCase()}\\.$`), `5#${seq}: pembahasan 2 paragraf + kunci`);
  FIG5_ITEMS.push({ pkg: 5, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const pip = (P: Pt[], [x, y]: Pt) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };

// 5#28 — matriks (sedang): bangun sama dalam satu baris (beda antarbaris); jumlah bangun kolom 3 = kolom 1 + kolom 2.
{
  const POS: Record<number, Pt[]> = {
    1: [[0, 0]], 2: [[-14, 0], [14, 0]], 3: [[-26, 0], [0, 0], [26, 0]], 4: [[-14, -14], [14, -14], [-14, 14], [14, 14]],
    5: [[-26, -12], [0, -12], [26, -12], [-14, 16], [14, 16]], 6: [[-26, -14], [0, -14], [26, -14], [-26, 14], [0, 14], [26, 14]],
  };
  const one = (kind: number, f: Fill): Fig => [kind === 0 ? poly(regular(3, 13), f) : kind === 1 ? dot(0, 0, 10.5, f) : poly(regular(4, 14, 45), f)];
  const cell = (kind: number, n: number, f: Fill): Fig => POS[n].flatMap(([x, y]) => mv(one(kind, f), x, y));
  const R: { f: Fill; n: [number, number] }[] = [{ f: "w", n: [2, 1] }, { f: "b", n: [1, 3] }, { f: "w", n: [3, 2] }];
  const cnt = (r: number, c: number) => (c < 2 ? R[r].n[c] : R[r].n[0] + R[r].n[1]);
  const at = (r: number, c: number) => cell(r, cnt(r, c), R[r].f);
  assert.ok(R.slice(0, 2).some((x) => x.n[0] + x.n[1] !== x.n[0] + 1) && R.slice(0, 2).some((x) => x.n[0] + x.n[1] !== x.n[1] + 1), "5#28: aturan alternatif harus gugur");
  const ans = at(2, 2), opts = place(ans, [cell(2, 4, "w"), cell(1, 5, "w"), cell(2, 5, "b"), cell(2, 6, "w")], "B");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((r) => { const [x, y] = a(r, 2); return redText(x + s / 2 + 12, y + 9, `${R[r].n[0]} + ${R[r].n[1]} = ${r === 2 ? "?" : cnt(r, 2)}`, 24, "start"); }).join("") +
    foot(["→ bangun dan warnanya sama dalam satu baris", "→ jumlah bangun kolom 3 = kolom 1 + kolom 2"], a(2, 0)[1] + s / 2 + 42);
  add(28, "B", POLA, gridS(grid3(at, null), opts), 2,
    "Ada dua aturan. (1) Jenis bangun dan warnanya sama di seluruh satu baris dan berbeda antarbaris: baris 1 segitiga putih, baris 2 lingkaran hitam, baris 3 persegi putih. (2) Jumlah bangun di kolom 3 = jumlah di kolom 1 ditambah jumlah di kolom 2 (baris 1: 2 + 1 = 3, baris 2: 1 + 3 = 4, jadi baris 3: 3 + 2 = 5). Jawabannya 5 persegi putih.\n\nOpsi a gugur karena hanya 4 persegi (jumlahnya kurang satu). Opsi c gugur karena bangunnya lingkaran (menyalin baris 2). Opsi d gugur karena persegi berwarna hitam (warna baris 3 putih). Opsi e gugur karena 6 persegi (jumlahnya ditambah satu). Jawaban: b.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 120 }));
}
// 5#29 — matriks (HOTS, 3 lapis): warna 3 lapisan bergeser ke dalam per kolom, titik di bawah berkurang 1 per kolom, bentuk lapisan bergantian persegi–lingkaran–persegi.
{
  const HS = [28, 19, 10];
  const cell = (pat: Fill[], circ: boolean, n: number): Fig => [
    ...HS.map((h, i) => (circ ? dot(0, -4, h, pat[i]) : poly([[-h, -4 - h], [h, -4 - h], [h, -4 + h], [-h, -4 + h]], pat[i]))),
    ...Array.from({ length: n }, (_, i) => dot(r1((i - (n - 1) / 2) * 11), 38, 3.5)),
  ];
  const shift = (p: Fill[], k = 1): Fill[] => (k === 0 ? p : shift([p[2], p[0], p[1]], k - 1));
  const P0: Fill[][] = [["b", "w", "w"], ["b", "b", "w"], ["w", "b", "w"]], D0 = [4, 5, 3];
  const at = (r: number, c: number) => cell(shift(P0[r], c), c === 1, D0[r] - c);
  const ans = at(2, 2);
  assert.deepEqual(shift(P0[2], 2), ["b", "w", "w"]);
  const opts = place(ans, [cell(shift(P0[2], 2), true, 1), cell(shift(P0[2], 1), false, 1), cell(P0[2], false, 1), cell(shift(P0[2], 2), false, 2)], "A");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    foot(["→ warna lapisan bergeser ke dalam, yang terdalam ke luar", "→ titik di bawah berkurang 1 tiap kolom", "→ bentuk lapisan: persegi, lingkaran, persegi"], a(2, 0)[1] + s / 2 + 42);
  add(29, "A", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Warna tiga lapisan (luar, tengah, dalam) bergeser satu lapisan ke dalam dari kolom ke kolom, dan warna lapisan terdalam pindah ke lapisan terluar. Baris 3: putih-hitam-putih, lalu putih-putih-hitam, jadi berikutnya hitam-putih-putih. (2) Titik hitam di bawah berkurang 1 tiap kolom (baris 3: 3, 2, jadi 1). (3) Bentuk lapisan bergantian persegi, lingkaran, persegi, sehingga kolom 3 persegi. Jawabannya persegi berlapis hitam-putih-putih dengan 1 titik.\n\nOpsi b gugur karena lapisannya berbentuk lingkaran (bentuk tidak bergantian kembali). Opsi c gugur karena warna lapisan tidak bergeser dari kolom 2 (putih-putih-hitam). Opsi d gugur karena warna bergeser ke arah luar (putih-hitam-putih). Opsi e gugur karena titiknya 2 (tidak berkurang). Jawaban: a.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 5#30 — matriks (HOTS, 3 lapis): mini-kisi 3×3: kotak hitam bergeser 1 ke kanan (tembus tepi muncul di kiri); yang tembus tepi bertitik putih; tiap kolom bertambah 1 kotak di petak kosong pertama.
{
  type St = number[]; // 0 kosong · 1 hitam · 2 hitam bertitik
  const step = (s: St, o: { left?: boolean; noAdd?: boolean; noDot?: boolean; lastEmpty?: boolean } = {}): St => {
    const n: St = Array(9).fill(0);
    s.forEach((v, k) => {
      if (!v) return;
      const i = Math.floor(k / 3), j = k % 3, nj = o.left ? (j + 2) % 3 : (j + 1) % 3, wrap = o.left ? j === 0 : j === 2;
      n[3 * i + nj] = wrap && !o.noDot ? 2 : v;
    });
    if (!o.noAdd) { const k = o.lastEmpty ? n.lastIndexOf(0) : n.indexOf(0); n[k] = 1; }
    return n;
  };
  const cell = (s: St): Fig => s.flatMap((v, k): Fig => {
    const x = ((k % 3) - 1) * 19, y = (Math.floor(k / 3) - 1) * 19;
    return [poly([[x - 9, y - 9], [x + 9, y - 9], [x + 9, y + 9], [x - 9, y + 9]], v ? "b" : "w"), ...(v === 2 ? [dot(x, y, 4, "w")] : [])];
  });
  const S0: St[] = [[1, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1, 1, 0, 0]];
  const seq = S0.map((s) => [s, step(s), step(step(s))]);
  assert.deepEqual(seq[2][2], [1, 1, 0, 0, 2, 0, 0, 0, 1]);
  assert.ok(seq.every((r) => r.every((s, c) => s.filter(Boolean).length === S0[0].filter(Boolean).length + c)), "5#30: jumlah kotak +1 tiap kolom");
  const at = (r: number, c: number) => cell(seq[r][c]);
  const ans = at(2, 2), alt = (o: Parameters<typeof step>[1]) => cell(step(step(S0[2], o), o));
  const opts = place(ans, [alt({ noAdd: true }), alt({ left: true }), alt({ noDot: true }), alt({ lastEmpty: true })], "D");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    foot(["→ kotak hitam geser 1 ke kanan; tembus tepi muncul di kiri", "→ kotak yang tembus tepi mendapat titik putih", "→ tiap kolom +1 kotak di petak kosong pertama"], a(2, 0)[1] + s / 2 + 42);
  add(30, "D", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Semua kotak hitam bergeser satu petak ke kanan; kotak di kolom paling kanan keluar dari tepi dan muncul di kolom paling kiri pada baris yang sama. (2) Kotak yang tembus tepi itu mendapat titik putih. (3) Setiap kolom bertambah satu kotak hitam baru di petak kosong pertama, dibaca dari kiri atas ke kanan bawah. Baris 3 kolom 2: kotak di kiri atas, kiri tengah (bertitik), dan bawah tengah. Setelah bergeser: atas tengah, tengah (bertitik), dan kanan bawah; kotak baru muncul di kiri atas. Hasilnya 4 kotak: kiri atas, atas tengah, tengah (bertitik), kanan bawah.\n\nOpsi a gugur karena tidak ada kotak baru (hanya 3 kotak). Opsi b gugur karena kotak bergeser ke kiri. Opsi c gugur karena kotak tengah tidak bertitik. Opsi e gugur karena kotak baru muncul di petak kosong terakhir (kanan bawah), bukan yang pertama. Jawaban: d.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 5#31 — rotasi (sedang): putar 90° searah jarum jam LALU cermin mendatar (urutan langkah menentukan).
{
  const base: Fig = [poly([[-28, -28], [28, -28], [28, -6], [8, -6], [8, 12], [28, 12], [28, 28], [-28, 28]], "w"), dot(-10, 8, 6, "b"), poly([[12, -22], [24, -22], [24, -10]], "b")];
  assertChiral(base, "5#31");
  const mid = tf(base, 90), ans = tf(mid, 180, true); // cermin mendatar = tf(., 180, true)
  const opts = place(ans, [tf(tf(base, 180, true), 90), tf(base, 90), tf(base, 180, true), tf(base, 0, true)], "C");
  assert.notEqual(sig(tf(tf(base, 180, true), 90)), sig(ans), "5#31: urutan harus menentukan");
  const hline = (x: number, y: number, s: number) => dashLine([x - s / 2 - 8, y + s / 2 + 14], [x + s / 2 + 8, y + s / 2 + 14]);
  const axis: Ann = (at, s) => hline(...at(0, 0), s);
  const steps: Ann = (at, s) => ["putar 90° ↻", "cermin mendatar"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 22); }).join("") +
    hline(...at(0, 1), s) + redText(W / 2, at(0, 0)[1] + s / 2 + 52, "urutan: putar dulu, baru dicerminkan", 24);
  add(31, "C", "Gambar di atas diputar 90° searah jarum jam, lalu hasilnya dicerminkan terhadap cermin mendatar pada garis putus-putus. Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, ann: axis, foot: 30 }), 2,
    "Kerjakan dua langkah berurutan. (1) Putar 90° searah jarum jam: celah di sisi kanan berpindah ke bawah, segitiga hitam di lengan atas berpindah ke kanan bawah, dan titik hitam di sisi kiri berpindah ke atas. (2) Cermin mendatar: bagian atas dan bawah ditukar, sehingga celah menghadap ke atas, segitiga hitam berada di kanan atas, dan titik hitam berada di bawah.\n\nOpsi a gugur karena langkahnya terbalik (dicerminkan dulu, baru diputar), sehingga celah menghadap ke bawah. Opsi b gugur karena hanya diputar, tidak dicerminkan. Opsi d gugur karena hanya dicerminkan mendatar, tidak diputar. Opsi e gugur karena hanya dicerminkan tegak (kiri-kanan), tanpa diputar. Jawaban: c.",
    gridS([[base, mid, ans]], null, { gap: 70, top: 46, hl: [0, 2], ann: steps, foot: 76 }));
}
// 5#32 — rotasi (HOTS, 3 lapis): seluruh gambar diputar 90° ↻, bangun kecil dicerminkan tegak terhadap pusatnya sendiri, lalu kedua warna dibalik.
{
  const Pb: Pt[] = [[-34, -30], [14, -30], [34, -10], [34, 30], [-4, 30], [-4, 8], [-34, 8]], Qp: Pt[] = [[-10, -9], [10, -9], [10, -1], [2, -1], [2, 9], [-10, 9]], q: Pt = [14, 14];
  const P: Fig = [poly(Pb, "w")], Q: Fig = [poly(Qp, "b")];
  assertChiral(P, "5#32 P"); assertChiral(Q, "5#32 Q");
  assert.ok(Qp.every(([x, y]) => pip(Pb, [x + q[0], y + q[1]])), "5#32: bangun kecil harus di dalam bangun besar");
  const comp = (deg: number, qLocal: Fig, pos: Pt): Fig => [...tf(P, deg), ...mv(qLocal, ...pos)];
  const base = comp(0, Q, q), m1 = comp(90, tf(Q, 90), ptf(q, 90)), m2 = comp(90, tf(tf(Q, 90), 0, true), ptf(q, 90)), ans = invF(m2);
  const opts = place(ans, [m2, invF(m1), invF(comp(270, tf(tf(Q, 270), 0, true), ptf(q, 270))), invF(comp(90, tf(tf(Q, 90), 180, true), ptf(q, 90)))], "E");
  const steps: Ann = (at, s) => ["putar semua 90° ↻", "cermin bangun kecil", "balik warna"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 19); }).join("");
  add(32, "E", "Pada gambar di atas, seluruh gambar diputar 90° searah jarum jam, kemudian bangun kecil di dalamnya dicerminkan terhadap garis tegak yang melalui pusatnya sendiri, lalu warna kedua bangun dibalik (hitam menjadi putih, putih menjadi hitam). Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, foot: 24 }), 3,
    "Kerjakan tiga langkah berurutan. (1) Putar seluruh gambar 90° searah jarum jam: takik besar pada bangun besar berpindah dari kiri bawah ke kiri atas, dan bangun kecil ikut berpindah ke kiri bawah. (2) Cermin tegak hanya pada bangun kecil, terhadap pusatnya sendiri: kaki kecil yang menjulur ke kiri dari batangnya kini menjulur ke kanan, sedangkan bangun besar tidak berubah. (3) Balik warna: bangun besar menjadi hitam dan bangun kecil menjadi putih.\n\nOpsi a gugur karena warnanya tidak dibalik. Opsi b gugur karena bangun kecil tidak dicerminkan. Opsi c gugur karena seluruh gambar diputar berlawanan arah jarum jam. Opsi d gugur karena bangun kecil dicerminkan mendatar, bukan tegak. Jawaban: e.",
    gridS([[base, m1, m2, ans]], null, { size: 150, gap: 50, top: 46, hl: [0, 3], ann: steps, foot: 40 }));
}
// 5#35 — analogi (HOTS, 3 lapis): bangun mengecil ke pojok kanan atas, muncul bayangan cermin hitam di pojok kiri bawah, kedua salinan dihubungkan garis.
{
  const P: Fig = [poly([[-24, -24], [4, -24], [24, -4], [24, 24], [8, 24], [8, 0], [-24, 0]], "w")];
  const Q: Fig = [poly([[-20, -26], [20, -26], [20, -10], [4, -10], [4, 26], [-14, 26], [-14, -10], [-20, -10]], "w")];
  assertChiral(P, "5#35 P"); assertChiral(Q, "5#35 Q");
  const K = 0.45, D = 24;
  const make = (g: Fig, o: { mirror?: boolean; swap?: boolean; line?: boolean; both?: boolean } = {}): Fig => {
    const big = mv(paint(sc(ctr(g), K), "w"), o.swap ? -D : D, o.swap ? D : -D);
    const sh = mv(paint(sc(ctr(tf(g, 0, o.mirror ?? true)), K), o.both ? "w" : "b"), o.swap ? D : -D, o.swap ? -D : D);
    return [...(o.line === false ? [] : [{ k: "line", a: [D, -D] as Pt, b: [-D, D] as Pt, w: 3 } as Prim]), ...big, ...sh];
  };
  const A = ctr(P), B = make(P), C = ctr(Q), ans = make(Q);
  const opts = place(ans, [make(Q, { mirror: false }), make(Q, { swap: true }), make(Q, { line: false }), make(Q, { both: true })], "A");
  const ann: Ann = (at, s) => ([1, 3] as const).flatMap((c) => [[D, -D], [-D, D]].map(([x, y]) => redRing(...fp([x, y], at(0, c), s), 30))).join("") +
    foot(["① mengecil, pindah ke pojok kanan atas", "② bayangan cermin hitam di pojok kiri bawah", "③ kedua salinan dihubungkan garis diagonal"], at(0, 0)[1] + s / 2 + 40);
  add(35, "A", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Bangun mengecil dan pindah ke pojok kanan atas. (2) Di pojok kiri bawah muncul bayangannya: salinan yang dicerminkan kiri-kanan dan berwarna hitam. (3) Kedua salinan dihubungkan garis diagonal. Terapkan pada gambar ketiga: bangun huruf T mengecil di pojok kanan atas, bayangan cerminnya yang hitam di pojok kiri bawah, dan garis diagonal di antaranya.\n\nOpsi b gugur karena salinan hitam tidak dicerminkan. Opsi c gugur karena posisi dan warna kedua salinan tertukar. Opsi d gugur karena tidak ada garis penghubung. Opsi e gugur karena kedua salinan berwarna putih. Jawaban: a.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 120 }));
}
// 5#36 — analogi (HOTS, 3 lapis): empat bangun di sudut bergeser 1 sudut searah jarum jam, bangun yang mendarat di kiri atas berganti warna, bangun pusat membesar dan menjadi putih.
{
  const SH = [(f: Fill) => poly(regular(3, 13), f), (f: Fill) => dot(0, 0, 11, f), (f: Fill) => poly(regular(4, 14, 45), f), (f: Fill) => poly(regular(6, 12), f)];
  const CORN: Pt[] = [[-28, -28], [28, -28], [28, 28], [-28, 28]]; // kiri atas, kanan atas, kanan bawah, kiri bawah
  type Cfg = { kinds: number[]; fills: Fill[] };
  const fig = (c: Cfg, big: boolean): Fig => [...c.kinds.flatMap((k, i) => mv([SH[k](c.fills[i])], ...CORN[i])), big ? dot(0, 0, 12, "w") : dot(0, 0, 5, "b")];
  const move = (c: Cfg, o: { ccw?: boolean; noFlip?: boolean; flipAt?: number } = {}): Cfg => {
    const kinds = Array(4), fills = Array(4) as Fill[];
    c.kinds.forEach((k, i) => { const j = (i + (o.ccw ? 3 : 1)) % 4; kinds[j] = k; fills[j] = c.fills[i]; });
    if (!o.noFlip) { const t = o.flipAt ?? 0; fills[t] = inv(fills[t]); }
    return { kinds, fills };
  };
  const A: Cfg = { kinds: [0, 1, 2, 3], fills: ["w", "b", "w", "b"] }, Cc: Cfg = { kinds: [3, 0, 1, 2], fills: ["b", "w", "w", "b"] };
  const a = fig(A, false), b = fig(move(A), true), c = fig(Cc, false), ans = fig(move(Cc), true);
  const opts = place(ans, [fig(move(Cc, { ccw: true }), true), fig(move(Cc, { noFlip: true }), true), fig(move(Cc, { flipAt: 1 }), true), fig(move(Cc), false)], "B");
  const ann: Ann = (at, s) => ([3] as const).map((cc) => redRing(...fp(CORN[0], at(0, cc), s), 24)).join("") + redRing(...fp(CORN[0], at(0, 1), s), 24) +
    foot(["① keempat bangun bergeser 1 sudut searah jarum jam", "② bangun yang mendarat di kiri atas berganti warna", "③ bangun pusat membesar dan menjadi putih"], at(0, 0)[1] + s / 2 + 40);
  add(36, "B", ANALOGI, analogyS([a, b, c, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Keempat bangun di sudut bergeser satu sudut searah jarum jam (segitiga dari kiri atas ke kanan atas, dan seterusnya). (2) Bangun yang mendarat di kiri atas, yaitu bangun dari kiri bawah, berganti warna. (3) Bangun di pusat membesar dan menjadi putih. Terapkan pada gambar ketiga: segi enam dari kiri atas pindah ke kanan atas, segitiga ke kanan bawah, lingkaran ke kiri bawah, dan persegi dari kiri bawah mendarat di kiri atas dengan warna berganti menjadi putih; titik pusat menjadi lingkaran putih besar.\n\nOpsi a gugur karena bangun bergeser berlawanan arah jarum jam. Opsi c gugur karena warna bangun di kiri atas tidak berganti. Opsi d gugur karena yang berganti warna bangun di kanan atas, bukan di kiri atas. Opsi e gugur karena bangun pusat tidak berubah. Jawaban: b.",
    analogyS([a, b, c, ans], null, { hl: true, ann, foot: 120 }));
}
// 5#37 — ikon kategori (sedang): pusat lingkaran (bertanda titik) di dalam persegi, kecuali satu. Ciri lain terbagi 3/2 (diassert).
{
  const SQ: Pt[] = [[-20, -20], [20, -20], [20, 20], [-20, 20]];
  const I: { c: Pt; f: Fill }[] = [{ c: [10, -8], f: "w" }, { c: [-12, 6], f: "b" }, { c: [-8, -12], f: "w" }, { c: [28, -4], f: "b" }, { c: [6, 12], f: "w" }]; // f = warna lingkaran, persegi sebaliknya
  const fig = ({ c, f }: (typeof I)[number]): Fig => [poly(SQ, inv(f)), dot(c[0], c[1], 14, f), dot(c[0], c[1], 3, inv(f))];
  const inSq = I.map(({ c }) => Math.max(Math.abs(c[0]), Math.abs(c[1])) < 20);
  assert.deepEqual(inSq, [true, true, true, false, true]);
  I.forEach(({ c }, i) => assert.ok(Math.abs(Math.max(Math.abs(c[0]), Math.abs(c[1])) - 20) >= 8, `5#37: pusat ${i} terlalu dekat tepi`));
  assert.ok([0, 1].every((v) => I.filter((x) => (x.f === "b" ? 1 : 0) === v).length >= 2), "5#37: warna harus terbagi");
  assert.ok(I.every(({ c }) => Math.hypot(Math.max(0, Math.abs(c[0]) - 20), Math.max(0, Math.abs(c[1]) - 20)) < 14), "5#37: lingkaran harus tetap menyentuh persegi");
  const opts = place(fig(I[3]), [I[0], I[1], I[2], I[4]].map(fig), "D");
  const o = optionsRowS(opts, 20, { hl: 3 }), lab = o.body + I.map((x, i) => redText(o.at(i)[0], o.bottom + 14, inSq[i] ? "di dalam" : "di luar", 24)).join("") + redText(W / 2, o.bottom + 52, "letak pusat lingkaran (titik) terhadap persegi", 24);
  add(37, "D", "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.", svgWrap(o.bottom, optionsRowS(opts, 20).body), 2,
    "Perhatikan titik kecil yang menandai pusat lingkaran pada setiap gambar. Pada gambar a, b, c, dan e, titik itu berada di dalam persegi: lingkarannya hanya menonjol sebagian keluar dari persegi. Pada gambar d, titik pusat berada di luar persegi (di sebelah kanan sisi kanannya), sehingga lingkaran hanya menumpang sebagian kecil pada persegi.\n\nCiri lain tidak memisahkan satu gambar saja. Ukuran persegi dan lingkaran sama pada kelima gambar. Warna terbagi tiga dan dua: lingkaran putih di atas persegi hitam pada a, c, e, dan lingkaran hitam di atas persegi putih pada b, d. Satu-satunya ciri yang hanya dimiliki satu gambar adalah titik pusat di luar persegi. Jawaban: d.",
    svgWrap(o.bottom + 66, lab));
}
