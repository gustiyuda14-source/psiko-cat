import assert from "node:assert/strict";
import { type Ann, W, type Fig, type Fill, type Key, type Prim, type Pt, analogyS, dashLine, fp, foot, gridS, optionsRowS, place, ptf, r1, redArrow, redRing, redText, regular, sig, svgWrap, tf } from "./figural-lib";
import { assertChiral, colArrows, ctr, dot, grid3, mv, poly, sc } from "./figural-kal-4";

// Figural Simulasi 4 (package_number 19), nomor 28-32 + 35-37. (26-27 = mosaik, figural-mosaik.ts; 51-56 = bundar-19.)
// Semua HOTS (keputusan pemilik 2026-10-13: pkg 19 = 20 sedang / 80 HOTS). Aturan sengaja berbeda dari pkg 2/3/4/5/13/15/16:
// jari-jari beda-setangkup (XOR) + warna pusat XOR + kotak sudut ↻, panah ↺ + titik dikali + bingkai Latin, urutan lapisan bergeser + titik = sisi
// bangun luar, cermin diagonal + putar 90° ↻ + warna dibalik, kecil diputar 180° + pindah ke seberang, besar ↔ kecil bertukar + pindah sudut + putar,
// sisi −1 + warna bertukar + satelit ↺, titik = sisi luar − sisi dalam.

export type Fig19 = { pkg: 19; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG19_ITEMS: Fig19[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${key.toLowerCase()}\\.$`), `19#${seq}: pembahasan 2 paragraf + kunci`);
  FIG19_ITEMS.push({ pkg: 19, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const pip = (P: Pt[], [x, y]: Pt) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const row = (n: number, y: number, r = 3.5, f: Fill = "b", gap = 10): Fig => Array.from({ length: n }, (_, i) => dot(r1((i - (n - 1) / 2) * gap), y, r, f));

// 19#28 — matriks (HOTS, 3 lapis): jari-jari kolom 3 = jari-jari yang ada di TEPAT SATU dari kolom 1 dan kolom 2; warna pusat kolom 3 = hitam jika
// warna pusat kolom 1 dan 2 berbeda (aturan beda yang sama untuk warna); kotak kecil di sudut bergeser 90° ↻ tiap kolom.
{
  const spoke = (i: number): Prim => { const a = ((-90 + 45 * i) * Math.PI) / 180; return { k: "line", a: [0, 0], b: [r1(34 * Math.cos(a)), r1(34 * Math.sin(a))], w: 4 }; };
  const CORNER: Pt[] = [[35, -35], [35, 35], [-35, 35], [-35, -35]]; // kanan atas, kanan bawah, kiri bawah, kiri atas (urutan ↻)
  const cell = (s: number[], hub: Fill, m: number): Fig => [dot(0, 0, 38, "w"), ...[...s].sort((a, b) => a - b).map(spoke), dot(0, 0, 8, hub),
    poly([[-5, -5], [5, -5], [5, 5], [-5, 5]].map(([x, y]): Pt => [x + CORNER[m][0], y + CORNER[m][1]]), "b")];
  const R: [number[], number[]][] = [[[0, 2, 4], [2, 5]], [[1, 3, 6], [1, 7]], [[0, 1, 5, 6], [1, 3, 6]]];
  const H: [Fill, Fill][] = [["b", "w"], ["b", "b"], ["w", "b"]], M0 = [0, 1, 3];
  const xor = (a: number[], b: number[]) => [...a.filter((x) => !b.includes(x)), ...b.filter((x) => !a.includes(x))];
  const or = (a: number[], b: number[]) => [...new Set([...a, ...b])], and = (a: number[], b: number[]) => a.filter((x) => b.includes(x)), minus = (a: number[], b: number[]) => a.filter((x) => !b.includes(x));
  const hx = (a: Fill, b: Fill): Fill => (a !== b ? "b" : "w");
  for (const f of [or, and, minus, (a: number[], b: number[]) => minus(b, a)]) assert.ok(R.slice(0, 2).some(([a, b]) => sig(cell(f(a, b), "w", 0)) !== sig(cell(xor(a, b), "w", 0))), "19#28: aturan jari-jari alternatif harus gugur di baris 1-2");
  for (const f of [(a: Fill, b: Fill): Fill => (a === "b" || b === "b" ? "b" : "w"), (a: Fill, b: Fill): Fill => (a === "b" && b === "b" ? "b" : "w"), (a: Fill) => a, (_: Fill, b: Fill) => b])
    assert.ok(H.slice(0, 2).some(([a, b]) => f(a, b) !== hx(a, b)), "19#28: aturan warna pusat alternatif harus gugur di baris 1-2");
  const at = (r: number, c: number) => cell(c < 2 ? R[r][c] : xor(...R[r]), c < 2 ? H[r][c] : hx(...H[r]), (M0[r] + c) % 4);
  const [A, B] = R[2], X = xor(A, B), ans = at(2, 2);
  assert.equal(hx(...H[2]), "b"); assert.equal((M0[2] + 2) % 4, 1);
  const opts = place(ans, [cell(or(A, B), "b", 1), cell(X, "w", 1), cell(X, "b", 0), cell(minus(A, B), "b", 1)], "E");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    foot(["→ jari-jari di kolom 1 DAN kolom 2: hilang", "→ pusat hitam jika pusat kolom 1 dan 2 beda warna", "→ kotak sudut bergeser 90° searah jarum jam"], a(2, 0)[1] + s / 2 + 42);
  add(28, "E", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Jari-jari kolom 3 adalah jari-jari yang ada di tepat satu dari kolom 1 dan kolom 2; jari-jari yang ada di keduanya hilang. Baris 3: kolom 1 punya jari-jari atas, kanan atas, kiri bawah, dan kiri; kolom 2 punya kanan atas, kanan bawah, dan kiri. Kanan atas dan kiri ada di keduanya sehingga hilang, jadi kolom 3 berisi jari-jari atas, kanan bawah, dan kiri bawah. (2) Lingkaran pusat memakai aturan beda yang sama untuk warna: pusat kolom 3 hitam jika pusat kolom 1 dan kolom 2 berbeda warna, putih jika sama (baris 1: hitam dan putih menjadi hitam; baris 2: hitam dan hitam menjadi putih). Baris 3: putih dan hitam, jadi pusatnya hitam. (3) Kotak kecil di sudut bergeser 90° searah jarum jam setiap kolom; di baris 3 kotak itu di kiri atas, lalu kanan atas, jadi kolom 3 di kanan bawah.\n\nOpsi a gugur karena semua jari-jari digabung, termasuk yang ada di keduanya (aturan gabungan). Opsi b gugur karena pusatnya putih (warna pusat kolom 1 disalin, bukan dibandingkan). Opsi c gugur karena kotak kecil tidak bergeser dari posisi kolom 2 (masih kanan atas). Opsi d gugur karena hanya mengambil jari-jari milik kolom 1 saja (jari-jari kanan bawah dari kolom 2 terlupa). Jawaban: e.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 19#29 — matriks (HOTS, 3 lapis): panah berputar 90° ↺ tiap kolom, titik kolom 3 = kolom 1 × kolom 2, bingkai bergilir lingkaran → persegi → segi enam (Latin).
{
  const ARROW: Pt[] = [[0, -18], [11, -5], [4, -5], [4, 16], [-4, 16], [-4, -5], [-11, -5]];
  const FR = [(f: Fill) => dot(0, -8, 30, f), (f: Fill) => poly(regular(4, 38, 45).map(([x, y]): Pt => [x, r1(y - 8)]), f), (f: Fill) => poly(regular(6, 32, 30).map(([x, y]): Pt => [x, r1(y - 8)]), f)];
  const cell = (fr: number, deg: number, n: number): Fig => [FR[fr]("w"), ...mv(tf([poly(ARROW, "b")], deg), 0, -8), ...row(n, 38)];
  const S0 = [0, 90, 180], N: [number, number][] = [[1, 3], [2, 2], [3, 2]];
  const cnt = (r: number, c: number) => (c < 2 ? N[r][c] : N[r][0] * N[r][1]);
  const at = (r: number, c: number) => cell((r + c) % 3, S0[r] - 90 * c, cnt(r, c));
  assert.ok(N.slice(0, 2).some(([a, b]) => a + b !== a * b), "19#29: aturan jumlah harus gugur");
  const ans = at(2, 2);
  const opts = place(ans, [cell(1, 0, 5), cell(1, 90, 6), cell(0, 0, 6), cell(1, 180, 6)], "B");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((r) => { const [x, y] = a(r, 2); return redText(x + s / 2 + 12, y + 9, `${N[r][0]} × ${N[r][1]} = ${r === 2 ? "?" : cnt(r, 2)}`, 24, "start"); }).join("") +
    foot(["→ panah berputar 90° berlawanan arah jarum jam tiap kolom", "→ titik kolom 3 = titik kolom 1 × titik kolom 2", "→ bingkai bergilir: lingkaran, persegi, segi enam"], a(2, 0)[1] + s / 2 + 42);
  add(29, "B", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Panah berputar 90° berlawanan arah jarum jam dari kolom ke kolom (baris 3: ke bawah, ke kanan, jadi ke atas). (2) Jumlah titik di kolom 3 = jumlah titik kolom 1 dikali jumlah titik kolom 2 (baris 1: 1 × 3 = 3, baris 2: 2 × 2 = 4, jadi baris 3: 3 × 2 = 6). (3) Bingkai bergilir lingkaran, persegi, segi enam, sehingga setiap baris dan setiap kolom memuat ketiga bingkai tepat sekali; baris 3 sudah memakai segi enam dan lingkaran, jadi kolom 3 berbingkai persegi. Jawabannya persegi berpanah ke atas dengan 6 titik.\n\nOpsi a gugur karena titiknya 5 (dijumlah, bukan dikali; baris 1 membuktikan 1 + 3 = 4 ≠ 3). Opsi c gugur karena panah ke kanan (hanya diputar sekali, sama dengan kolom 2). Opsi d gugur karena bingkainya lingkaran (menyalin bingkai kolom 2). Opsi e gugur karena panah ke bawah (tidak berputar). Jawaban: b.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 19#30 — matriks (HOTS, 3 lapis): urutan tiga lapisan bergeser (lapisan terluar pindah ke paling dalam), lapisan terdalam selalu hitam, jumlah titik = jumlah sisi bangun terluar.
{
  const SIDES = [0, 4, 6], IN = [30, 18, 8];
  const layer = (k: number, inr: number, f: Fill): Prim => (k === 0 ? dot(0, -8, inr, f) : poly(regular(SIDES[k], inr / Math.cos(Math.PI / SIDES[k]), k === 1 ? 45 : 30).map(([x, y]): Pt => [x, r1(y - 8)]), f));
  const cell = (ord: number[], blackAt = 2, n = SIDES[ord[0]]): Fig => [...ord.map((k, i) => layer(k, IN[i], i === blackAt ? "b" : "w")), ...row(n, 38)];
  const shift = (o: number[]) => [o[1], o[2], o[0]], back = (o: number[]) => [o[2], o[0], o[1]];
  const O0 = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  const ordAt = (r: number, c: number): number[] => (c === 0 ? O0[r] : shift(ordAt(r, c - 1)));
  const at = (r: number, c: number) => cell(ordAt(r, c));
  const ansO = ordAt(2, 2), ans = at(2, 2);
  assert.deepEqual(ansO, [1, 2, 0]);
  const opts = place(ans, [cell(back(ordAt(2, 1))), cell(ansO, 0), cell(ansO, 2, SIDES[ansO[2]]), cell(ordAt(2, 1))], "D");
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    foot(["→ lapisan terluar pindah ke paling dalam, dua lainnya naik satu lapis", "→ lapisan terdalam selalu hitam", "→ jumlah titik = jumlah sisi bangun terluar (lingkaran: 0)"], a(2, 0)[1] + s / 2 + 42);
  add(30, "D", POLA, gridS(grid3(at, null), opts), 3,
    "Ada tiga aturan pada setiap baris. (1) Urutan tiga lapisan bergeser: bangun terluar pindah menjadi bangun terdalam, sedangkan dua bangun lain masing-masing naik satu lapis. Baris 3: segi enam-lingkaran-persegi, lalu lingkaran-persegi-segi enam, jadi berikutnya persegi-segi enam-lingkaran (dari luar ke dalam). (2) Warna menempel pada lapisan: bangun terdalam selalu hitam, dua lapisan lain putih. (3) Jumlah titik di bawah sama dengan jumlah sisi bangun terluar: lingkaran 0, persegi 4, segi enam 6. Jawabannya persegi di luar, segi enam di tengah, lingkaran hitam di dalam, dengan 4 titik.\n\nOpsi a gugur karena lapisan bergeser ke arah sebaliknya (yang terdalam pindah ke luar), sehingga segi enam berada di luar. Opsi b gugur karena warna hitam ikut bangun persegi, padahal hitam menempel pada lapisan terdalam. Opsi c gugur karena tidak ada titik (titik dihitung dari bangun terdalam, lingkaran). Opsi e gugur karena lapisan tidak bergeser (menyalin kolom 2). Jawaban: d.",
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 140 }));
}
// 19#31 — rotasi (HOTS, 3 lapis): cermin diagonal (kiri atas – kanan bawah), lalu putar 90° ↻, lalu warna dibalik.
// Cermin diagonal + putar 90° ↻ = cermin tegak (kiri–kanan) dari gambar awal; pengecoh = berhenti di langkah 1, arah putar terbalik, warna tidak dibalik, cermin dilewati.
{
  const base: Fig = [poly([[-28, -28], [10, -28], [28, -10], [28, 4], [-6, 4], [-6, 28], [-28, 28]], "w"), dot(-17, 16, 6, "b"), poly([[-22, -22], [-6, -22], [-22, -6]], "b")];
  assertChiral(base, "19#31");
  const inv = (f: Fig): Fig => f.map((q) => (q.k === "line" ? q : { ...q, fill: q.fill === "b" ? "w" : "b" }));
  const diag = tf(base, 270, true), turned = tf(base, 0, true), ans = inv(turned);
  assert.deepEqual(ptf([10, -28], 270, true), [-28, 10], "19#31: cermin diagonal (x, y) → (y, x)");
  assert.equal(sig(tf(diag, 90)), sig(turned), "19#31: cermin diagonal + putar 90° ↻ = cermin tegak");
  const opts = place(ans, [inv(diag), inv(tf(base, 180, true)), turned, inv(tf(base, 90))], "A");
  const dline = ([x, y]: Pt, s: number) => dashLine([x - s / 2 - 10, y - s / 2 - 10], [x + s / 2 + 10, y + s / 2 + 10]);
  const axis: Ann = (at, s) => dline(at(0, 0), s);
  const steps: Ann = (at, s) => dline(at(0, 0), s) + ["cermin diagonal", "putar 90° searah", "warna dibalik"].map((t, i) => { const p = at(0, i), q = at(0, i + 1); return redArrow([p[0] + s / 2 + 4, p[1]], [q[0] - s / 2 - 4, q[1]]) + redText((p[0] + q[0]) / 2, p[1] - s / 2 - 14, t, 19); }).join("") +
    redText(W / 2, at(0, 0)[1] + s / 2 + 40, "langkah 1 + 2 = cermin kiri–kanan dari gambar awal", 22);
  add(31, "A", "Gambar di atas dicerminkan terhadap garis putus-putus diagonal (dari kiri atas ke kanan bawah), kemudian hasilnya diputar 90° searah jarum jam, lalu warnanya dibalik (hitam menjadi putih, putih menjadi hitam). Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, ann: axis, foot: 30 }), 3,
    "Kerjakan tiga langkah berurutan. (1) Cermin diagonal dari kiri atas ke kanan bawah memindahkan bagian atas ke kiri dan bagian kanan ke bawah: segitiga di pojok kiri atas tetap, sudut terpotong pindah dari kanan atas ke kiri bawah, dan titik pindah dari kiri bawah ke kanan atas. (2) Putar hasilnya 90° searah jarum jam: segitiga pindah ke kanan atas, sudut terpotong ke kiri atas, dan titik ke kanan bawah. Langkah 1 dan 2 bersama-sama sama dengan satu cermin kiri–kanan dari gambar awal. (3) Balik warnanya: badan bangun menjadi hitam, sedangkan segitiga dan titik menjadi putih.\n\nOpsi b gugur karena berhenti setelah cermin diagonal (tidak diputar). Opsi c gugur karena diputar berlawanan arah jarum jam, sehingga hasilnya menjadi cermin atas–bawah. Opsi d gugur karena warnanya tidak dibalik. Opsi e gugur karena langkah cermin dilewati (gambar awal hanya diputar 90° searah jarum jam). Jawaban: a.",
    gridS([[base, diag, turned, ans]], null, { size: 150, gap: 50, top: 46, hl: [0, 3], ann: steps, foot: 60 }));
}
// 19#32 — rotasi (HOTS, 3 lapis): seluruh gambar diputar 90° ↺, bangun kecil diputar 180° di tempat, lalu bangun kecil pindah ke posisi berseberangan terhadap pusat.
{
  const Pb: Pt[] = [[-34, -34], [20, -34], [34, -20], [34, 34], [-10, 34], [-10, 20], [-34, 20]];
  const Qp: Pt[] = [[-9, -8], [9, -8], [9, -2], [-2, -2], [-2, 8], [-9, 8]], q: Pt = [15, 12];
  const P: Fig = [poly(Pb, "w")], Q: Fig = [poly(Qp, "b")];
  assertChiral(P, "19#32 P"); assertChiral(Q, "19#32 Q");
  for (const c of [q, [-q[0], -q[1]] as Pt]) assert.ok(Qp.every(([x, y]) => pip(Pb, [x + c[0], y + c[1]])), "19#32: bangun kecil harus muat di kedua posisi");
  const comp = (deg: number, qLocal: Fig, pos: Pt): Fig => [...tf(P, deg), ...mv(qLocal, ...pos)];
  const neg = ([x, y]: Pt): Pt => [r1(-x || 0), r1(-y || 0)];
  const q1 = ptf(q, 270), base = comp(0, Q, q), m1 = comp(270, tf(Q, 270), q1), m2 = comp(270, tf(Q, 90), q1), ans = comp(270, tf(Q, 90), neg(q1));
  const opts = place(ans, [comp(90, tf(Q, 270), neg(ptf(q, 90))), comp(270, tf(Q, 270), neg(q1)), m2, comp(270, tf(Q, 0), neg(q1))], "C");
  const steps: Ann = (at, s) => ["putar 90° berlawanan", "kecil putar 180°", "kecil ke seberang"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + s / 2 + 4, a[1]], [b[0] - s / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 19); }).join("");
  add(32, "C", "Pada gambar di atas, seluruh gambar diputar 90° berlawanan arah jarum jam, kemudian bangun kecil hitam diputar 180° pada pusatnya sendiri, lalu bangun kecil itu dipindahkan ke posisi yang berseberangan terhadap pusat bangun besar. Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, foot: 24 }), 3,
    "Kerjakan tiga langkah berurutan. (1) Putar seluruh gambar 90° berlawanan arah jarum jam: sudut terpotong pada bangun besar berpindah dari kanan atas ke kiri atas, takik dari kiri bawah ke kanan bawah, dan bangun kecil ikut berpindah dari kanan bawah ke kanan atas. (2) Putar bangun kecil 180° pada pusatnya sendiri: bangun kecil menjadi terbalik, atas menjadi bawah dan kiri menjadi kanan, tetapi tetap di kanan atas. (3) Pindahkan bangun kecil ke posisi berseberangan terhadap pusat bangun besar, yaitu dari kanan atas ke kiri bawah, tanpa mengubah arahnya.\n\nOpsi a gugur karena seluruh gambar diputar searah jarum jam. Opsi b gugur karena bangun kecil tidak diputar 180° (hanya dipindahkan). Opsi d gugur karena bangun kecil tidak dipindahkan ke seberang (berhenti pada langkah 2). Opsi e gugur karena bangun kecil diputar 90°, bukan 180°. Jawaban: c.",
    gridS([[base, m1, m2, ans]], null, { size: 150, gap: 50, top: 46, hl: [0, 3], ann: steps, foot: 40 }));
}
// 19#35 — analogi (HOTS, 3 lapis): bangun besar dan bangun kecil bertukar peran (besar ↔ kecil), bangun kecil pindah dari kiri atas ke kanan bawah, bangun kecil yang baru diputar 90° ↻.
{
  const S: Pt[][] = [
    [[-30, -30], [6, -30], [30, -6], [30, 30], [10, 30], [10, 4], [-30, 4]],
    [[-30, -30], [30, -30], [30, -14], [-6, -14], [-6, 30], [-30, 30]],
    [[-30, -30], [30, -30], [30, 30], [8, 30], [8, -8], [-30, -8]],
    [[-30, -30], [-8, -30], [-8, 8], [30, 8], [30, 30], [-30, 30]],
  ];
  S.forEach((p, i) => assertChiral([poly(p, "w")], `19#35 S${i}`));
  const K = 0.45, CP: Pt[] = [[-30, -30], [30, 30]];
  const fig = (big: number, small: number, o: { at?: 0 | 1; deg?: number } = {}): Fig => [
    poly(S[big].map(([x, y]): Pt => [r1(x * 1.25), r1(y * 1.25)]), "w"),
    ...mv(sc(ctr(tf([poly(S[small], "b")], o.deg ?? 0)), K), ...CP[o.at ?? 0]),
  ];
  const A = fig(0, 1), B = fig(1, 0, { at: 1, deg: 90 }), C = fig(2, 3), ans = fig(3, 2, { at: 1, deg: 90 });
  const opts = place(ans, [fig(3, 2, { at: 0, deg: 90 }), fig(3, 2, { at: 1 }), fig(3, 2, { at: 1, deg: 270 }), fig(2, 3, { at: 1, deg: 90 })], "D");
  const ann: Ann = (at, s) => ([1, 3] as const).map((c) => redRing(...fp(CP[1], at(0, c), s), 26)).join("") + ([0, 2] as const).map((c) => redRing(...fp(CP[0], at(0, c), s), 26)).join("") +
    foot(["① bangun besar dan bangun kecil bertukar peran", "② bangun kecil pindah dari kiri atas ke kanan bawah", "③ bangun kecil yang baru diputar 90° searah jarum jam"], at(0, 0)[1] + s / 2 + 40);
  add(35, "D", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Bangun besar dan bangun kecil bertukar peran: bangun yang semula kecil dan hitam menjadi bangun besar putih, dan bangun besar menjadi bangun kecil hitam. (2) Bangun kecil pindah dari pojok kiri atas ke pojok kanan bawah. (3) Bangun kecil yang baru diputar 90° searah jarum jam. Terapkan pada gambar ketiga: bangun berkaki di kiri bawah menjadi bangun besar putih, sedangkan bangun besar bersiku menjadi bangun kecil hitam di pojok kanan bawah yang diputar 90° searah jarum jam.\n\nOpsi a gugur karena bangun kecil tetap di pojok kiri atas. Opsi b gugur karena bangun kecil tidak diputar. Opsi c gugur karena bangun kecil diputar berlawanan arah jarum jam. Opsi e gugur karena peran tidak ditukar (bangun besar dan kecil sama dengan gambar ketiga). Jawaban: d.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 120 }));
}
// 19#36 — analogi (HOTS, 3 lapis): jumlah sisi bangun luar −1, warna bangun luar dan lingkaran dalam bertukar, titik satelit berputar 90° ↺ mengelilingi bangun.
{
  const SAT: Pt[] = [[0, -43], [-43, 0], [0, 43], [43, 0]]; // atas, kiri, bawah, kanan (urutan ↺)
  const fig = (n: number, outer: Fill, sat: number): Fig => [poly(regular(n, 32), outer), dot(0, 0, 10, outer === "b" ? "w" : "b"), dot(...SAT[sat], 4.5)];
  const A = fig(6, "w", 0), B = fig(5, "b", 1), C = fig(4, "w", 3), ans = fig(3, "b", 0);
  const opts = place(ans, [fig(3, "b", 2), fig(5, "b", 0), fig(3, "w", 0), fig(4, "b", 0)], "C");
  const ann: Ann = (at, s) => ([[0, 0], [1, 1], [2, 3], [3, 0]] as const).map(([c, k]) => redRing(...fp(SAT[k], at(0, c), s), 14)).join("") +
    foot(["① jumlah sisi bangun luar berkurang 1", "② warna bangun luar dan lingkaran dalam bertukar", "③ titik satelit berputar 90° berlawanan arah jarum jam"], at(0, 0)[1] + s / 2 + 40);
  add(36, "C", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada tiga perubahan. (1) Jumlah sisi bangun luar berkurang satu (segi enam menjadi segi lima). (2) Warna bangun luar dan lingkaran di dalamnya bertukar: bangun luar putih menjadi hitam, lingkaran hitam menjadi putih. (3) Titik satelit di luar bangun berputar 90° berlawanan arah jarum jam (dari atas ke kiri). Terapkan pada gambar ketiga: persegi menjadi segitiga, segitiga berwarna hitam dengan lingkaran putih, dan titik satelit pindah dari kanan ke atas.\n\nOpsi a gugur karena titik satelit berputar searah jarum jam (ke bawah). Opsi b gugur karena sisinya bertambah satu (segi lima). Opsi d gugur karena warnanya tidak bertukar. Opsi e gugur karena jumlah sisi tidak berkurang (masih persegi). Jawaban: c.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 120 }));
}
// 19#37 — ikon kategori (HOTS, 3 lapis): jumlah titik = sisi bangun luar − sisi bangun dalam, kecuali satu. Setiap ciri tunggal terbagi ≥ 2 (diassert).
{
  type I = { o: number; i: number; d: number; f: Fill };
  const L: I[] = [{ o: 6, i: 3, d: 2, f: "w" }, { o: 5, i: 3, d: 2, f: "b" }, { o: 5, i: 4, d: 1, f: "w" }, { o: 6, i: 4, d: 2, f: "w" }, { o: 5, i: 4, d: 1, f: "b" }];
  const fig = (x: I): Fig => [poly(regular(x.o, 30).map(([px, py]): Pt => [px, r1(py - 9)]), x.f), poly(regular(x.i, 13, x.i === 4 ? 45 : 0).map(([px, py]): Pt => [px, r1(py - 9)]), x.f === "b" ? "w" : "b"), ...row(x.d, 33, 4.5, "b", 13)];
  assert.deepEqual(L.map((x) => x.o - x.i === x.d), [false, true, true, true, true]);
  // Pola tandingan (cek buta Sonnet): warna → jumlah titik tidak boleh berlaku pada 4 gambar.
  assert.ok(!["w", "b"].every((f) => new Set(L.slice(1).filter((x) => x.f === f).map((x) => x.d)).size === 1), "19#37: warna tidak boleh menentukan titik");
  for (const key of ["o", "i", "d", "f"] as const) assert.ok([...new Set(L.map((x) => x[key]))].every((v) => L.filter((x) => x[key] === v).length >= 2), `19#37: ciri ${key} harus terbagi`);
  const opts = place(fig(L[0]), L.slice(1).map(fig), "A");
  const o = optionsRowS(opts, 20, { hl: 0 }), lab = o.body + L.map((x, i) => redText(o.at(i)[0], o.bottom + 14, `${x.o} − ${x.i} ${x.o - x.i === x.d ? "=" : "≠"} ${x.d}`, 22)).join("") + redText(W / 2, o.bottom + 52, "sisi luar − sisi dalam = jumlah titik", 24);
  add(37, "A", "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.", svgWrap(o.bottom, optionsRowS(opts, 20).body), 3,
    "Pada setiap gambar, hitung sisi bangun luar, sisi bangun dalam, dan titik di bawahnya. Pada gambar b (5 − 3 = 2 titik), c (5 − 4 = 1 titik), d (6 − 4 = 2 titik), dan e (5 − 4 = 1 titik), jumlah titik sama dengan selisih sisi bangun luar dan sisi bangun dalam. Pada gambar a, selisihnya 6 − 3 = 3, tetapi titiknya hanya 2.\n\nCiri tunggal tidak memisahkan satu gambar saja. Bangun luar terbagi segi lima (b, c, e) dan segi enam (a, d); bangun dalam terbagi segitiga (a, b) dan persegi (c, d, e); jumlah titik terbagi 1 (c, e) dan 2 (a, b, d); warna bangun luar terbagi putih (a, c, d) dan hitam (b, e), dan warna tidak menentukan jumlah titik (b hitam 2 titik, e hitam 1 titik). Hanya gambar a yang tidak memenuhi hubungan titik = sisi luar − sisi dalam. Jawaban: a.",
    svgWrap(o.bottom + 66, lab));
}
