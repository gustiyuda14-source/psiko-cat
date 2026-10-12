import assert from "node:assert/strict";
import { type Ann, type Fig, type Fill, type Key, type Prim, type Pt, W, analogyItem, analogyS, dashLine, foot, fp, gridItem, gridS, optionsRow, optionsRowS, place, ptf, r1, redArrow, redRing, redText, sig, stimulusItem, svgWrap, tf } from "./figural-lib";

// Figural Latihan Paket 2 (package_number 3), nomor 26-32, 35-37 (pola bundar 51-56: figural-kal-bundar.ts).
// Dipindah dari generate-kecerdasan-figural-kal.ts tanpa perubahan soal (options_payload/scoring_rule harus tetap sama
// karena backfill DB mencocokkan butir lewat isi soal). Pembahasan 2 paragraf + gambar pembahasan (jawaban berbingkai
// hijau, anotasi merah, tanpa id) ditambahkan kemudian, mengikuti pkg 15/16.

export type Fig3 = { pkg: 3; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG3_ITEMS: Fig3[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+ Tip: [^\\n]+ Jawaban: ${key.toLowerCase()}\\.$`), `3#${seq}: pembahasan 2 paragraf + tip + kunci`);
  FIG3_ITEMS.push({ pkg: 3, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
const GANJIL = "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.";

const poly = (pts: Pt[], fill: Fill): Prim => ({ k: "poly", pts, fill });
const dot = (x: number, y: number, r = 4, fill: Fill = "b"): Prim => ({ k: "circ", c: [x, y], r, fill });
const line = (a: Pt, b: Pt, w = 4): Prim => ({ k: "line", a, b, w });
const inv = (f: Fill): Fill => (f === "b" ? "w" : "b");
/** Bangun harus kiral: tidak ada cerminan yang sama dengan rotasi 90° mana pun. */
function assertChiral(base: Fig, tag: string) {
  for (const d of [0, 90, 180, 270]) for (const e of [0, 90, 180, 270]) assert.notEqual(sig(tf(base, d, true)), sig(tf(base, e)), `${tag}: bangun simetris`);
}
/** Lima gambar a-e tanpa gambar soal (ikon kategori). */
const rowItem = (options: Fig[]) => { const o = optionsRow(options, 20); return svgWrap(o.bottom, o.body); };
/** Label merah di atas celah antarkotak pada satu baris deret. */
const gapLabels = (at: (r: number, c: number) => Pt, s: number, labels: string[], size = 24) =>
  labels.map((t, c) => redText((at(0, c)[0] + at(0, c + 1)[0]) / 2, at(0, 0)[1] - s / 2 - 12, t, size)).join("");

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
  const ans = frame(180, 4, "b");
  const opts = place(ans, [frame(180, 3, "b"), frame(225, 4, "b"), frame(180, 4, "w"), frame(90, 4, "b")], "A");
  const ann: Ann = (at, s) => gapLabels(at, s, ["+135°", "+135°", "+135°", "+135°"]) +
    [0, 1, 2, 3, 4].map((c) => redRing(...fp([CORNER[c % 4][0] * 35, CORNER[c % 4][1] * 35], at(0, c), s), 17)).join("") +
    foot(["→ jarum berputar 135° searah jarum jam", "→ segitiga sudut pindah berlawanan arah jarum jam", "→ lingkaran pusat hitam – putih bergantian"], at(0, 0)[1] + s / 2 + 42);
  add(26, "A", POLA, gridItem([[...seq, null]], opts), 3,
    "Ada tiga aturan yang berjalan bersamaan. (1) Jarum berputar 135° searah jarum jam setiap langkah: atas (0°), kanan bawah (135°), kiri (270°), kanan atas (405° = 45°), jadi berikutnya 45° + 135° = 180°, yaitu menunjuk ke bawah. (2) Segitiga hitam di sudut kotak pindah satu sudut berlawanan arah jarum jam: kiri atas, kiri bawah, kanan bawah, kanan atas, lalu kembali ke kiri atas. (3) Lingkaran pusat bergantian hitam–putih, jadi gambar ke-5 berpusat hitam.\n\nOpsi b gugur karena segitiga masih di kanan atas (tidak berpindah). Opsi c gugur karena jarum menunjuk kiri bawah (diputar 180° dari gambar ke-4, bukan 135°). Opsi d gugur karena pusatnya putih. Opsi e gugur karena jarum menunjuk ke kanan (hanya diputar 45°). Tip: pisahkan 135° menjadi 90° + 45° supaya mudah dibayangkan, dan periksa tiap aturan satu per satu sambil mencoret opsi. Jawaban: a.",
    gridS([[...seq, ans]], null, { top: 46, hl: [0, 4], ann, foot: 140 }));
}

// 3#27 — deret: jarum berbandul berputar 90° berlawanan arah jarum jam, garis kecil +2.
{
  const frame = (deg: number, ticks: number): Fig => {
    const a = (deg * Math.PI) / 180;
    return [dot(0, 0, 3, "b"), line([0, 0], [r1(18 * Math.sin(a)), r1(-18 * Math.cos(a))], 4), dot(r1(24 * Math.sin(a)), r1(-24 * Math.cos(a)), 6, "w"),
      ...Array.from({ length: ticks }, (_, i): Prim => line([r1((i - (ticks - 1) / 2) * 7), 37], [r1((i - (ticks - 1) / 2) * 7), 44], 2.5))];
  };
  const seq = [0, 270, 180, 90].map((d, i) => frame(d, 1 + 2 * i));
  const ans = frame(0, 9);
  const opts = place(ans, [frame(0, 8), frame(90, 9), frame(180, 9), frame(0, 7)], "D");
  const ann: Ann = (at, s) => gapLabels(at, s, ["90° ↺", "90° ↺", "90° ↺", "90° ↺"], 22) +
    [1, 3, 5, 7, 9].map((n, c) => redText(at(0, c)[0], at(0, c)[1] + s / 2 + 30, `${n} garis`, 24)).join("") +
    foot(["→ jarum berputar 90° berlawanan arah jarum jam", "→ garis kecil di bawah bertambah 2"], at(0, 0)[1] + s / 2 + 72);
  add(27, "D", POLA, gridItem([[...seq, null]], opts), 2,
    "Dua aturan berjalan bersamaan. (1) Jarum berbandul berputar 90° berlawanan arah jarum jam setiap langkah: atas, kiri, bawah, kanan, jadi berikutnya kembali ke atas. (2) Garis kecil di bagian bawah kotak bertambah dua setiap langkah: 1, 3, 5, 7, jadi berikutnya 9.\n\nOpsi a gugur karena garisnya 8 (hanya bertambah 1). Opsi b gugur karena jarum masih menunjuk ke kanan (tidak diputar). Opsi c gugur karena jarum menunjuk ke bawah (diputar 90° ke arah sebaliknya). Opsi e gugur karena garisnya tetap 7. Tip: menghitung 9 garis rapat itu rawan salah; hitung berpasangan (4 pasang + 1) atau bandingkan panjang barisnya dengan gambar sebelumnya. Jawaban: d.",
    gridS([[...seq, ans]], null, { top: 46, hl: [0, 4], ann, foot: 140 }));
}

// 3#28 — matriks: arah panah kolom 3 = arah kolom 1 + arah kolom 2 (sudut searah jarum jam dari atas).
{
  const arrow = (deg: number): Fig => tf([poly([[0, -32], [16, -10], [6, -10], [6, 28], [-6, 28], [-6, -10], [-16, -10]], "b")], deg % 360);
  const rows = [[45, 90], [180, 135], [270, 135]];
  assert.notEqual((rows[1][1] + 45) % 360, (rows[1][0] + rows[1][1]) % 360, "aturan 'kolom 2 + 45°' harus gugur");
  const opts = place(arrow(45), [arrow(315), arrow(135), arrow(225), arrow(90)], "B");
  const ann: Ann = (at, s) => rows.map(([a, b], r) => [a, b, (a + b) % 360].map((d, c) => redText(at(r, c)[0], at(r, c)[1] + s / 2 + 28, `${d}°`, 24)).join("") +
    ["+", "="].map((t, c) => redText((at(r, c)[0] + at(r, c + 1)[0]) / 2, at(r, 0)[1] + 12, t, 36)).join("")).join("") +
    foot(["sudut diukur dari arah atas, searah jarum jam", "baris 3: 270° + 135° = 405° = 45° (kanan atas)"], at(2, 0)[1] + s / 2 + 74);
  add(28, "B", POLA, gridItem(rows.map(([a, b], r) => [arrow(a), arrow(b), r < 2 ? arrow(a + b) : null]), opts), 3,
    "Ukur arah panah sebagai sudut searah jarum jam dari arah atas (atas = 0°, kanan atas = 45°, kanan = 90°, dan seterusnya). Pada setiap baris, sudut panah kolom 3 = sudut kolom 1 + sudut kolom 2. Baris 1: 45° + 90° = 135° (kanan bawah). Baris 2: 180° + 135° = 315° (kiri atas). Baris 3: 270° + 135° = 405°; satu putaran penuh 360° dibuang, jadi 45° dan panah menunjuk ke kanan atas.\n\nAturan 'kolom 2 ditambah 45°' cocok untuk baris 1 tetapi gugur di baris 2, jadi bukan aturannya. Opsi a gugur karena hanya menyalin arah kolom 3 baris 2 (kiri atas, 315°). Opsi c gugur karena hanya menyalin kolom 2 (135°). Opsi d gugur karena berlawanan arah dengan jawaban (225°). Opsi e gugur karena meleset satu langkah 45° (90°). Tip: jika jumlah sudut lebih dari 360°, kurangi 360° karena panah sudah berputar satu putaran penuh. Jawaban: b.",
    gridS(rows.map(([a, b]) => [arrow(a), arrow(b), arrow(a + b)]), null, { gap: 44, hl: [2, 2], ann, foot: 140 }));
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
  // silang merah: petak hitam kolom 1 yang ikut hitam di kolom 2 (dibuang)
  const cross = (i: number, at: Pt, z: number) => { const x = ((i % 3) - 1) * s, y = (Math.floor(i / 3) - 1) * s, k = z / 96;
    return [[-1, -1, 1, 1], [-1, 1, 1, -1]].map(([p, q, u, v]) => `<line x1="${r1(at[0] + (x + 12 * p) * k)}" y1="${r1(at[1] + (y + 12 * q) * k)}" x2="${r1(at[0] + (x + 12 * u) * k)}" y2="${r1(at[1] + (y + 12 * v) * k)}" stroke="#d32f2f" stroke-width="5" stroke-linecap="round"/>`).join(""); };
  const ann: Ann = (at, z) => rows.map(([x, y], r) => x.filter((i) => y.includes(i)).map((i) => cross(i, at(r, 0), z)).join("") +
    ["−", "="].map((t, c) => redText((at(r, c)[0] + at(r, c + 1)[0]) / 2, at(r, 0)[1] + 12, t, 36)).join("")).join("") +
    foot(["kolom 1 − kolom 2: petak bersilang merah dibuang"], at(2, 0)[1] + z / 2 + 44);
  add(29, "C", POLA, gridItem(rows.map(([x, y], r) => [cell(x), cell(y), r < 2 ? cell(minus(x, y)) : null]), opts), 3,
    "Pada setiap baris, petak hitam kolom 3 adalah petak yang hitam di kolom 1 tetapi tidak hitam di kolom 2 (kolom 1 dikurangi kolom 2). Cek baris 1: kolom 1 hitam di kiri atas, kanan atas, tengah, dan kiri bawah; kolom 2 ikut hitam di kanan atas dan tengah, jadi keduanya dibuang dan sisa kiri atas dan kiri bawah. Baris 3: kolom 1 hitam di kiri atas, kiri tengah, tengah, dan kanan bawah; kolom 2 ikut hitam di tengah dan kanan bawah, jadi sisa kiri atas dan kiri tengah.\n\nOpsi a gugur karena ikut menghitamkan kiri bawah, petak yang hanya hitam di kolom 2. Opsi b gugur karena menggabungkan semua petak hitam kolom 1 dan kolom 2. Opsi d gugur karena justru mengambil petak yang hitam di kedua kolom. Opsi e gugur karena memakai kolom 2 dikurangi kolom 1. Tip: bedakan empat operasi petak (gabung, sama, beda, kurang) dengan mengecek satu petak yang hanya hitam di kolom 2; pada pengurangan, petak itu selalu putih. Jawaban: c.",
    gridS(rows.map(([x, y]) => [cell(x), cell(y), cell(minus(x, y))]), null, { gap: 44, hl: [2, 2], ann, foot: 64 }));
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
  const ann: Ann = (pt, z) => [0, 1].map((c) => { const a = pt(2, c), b = pt(2, c + 1); return redArrow([a[0] + z / 2 + 4, a[1]], [b[0] - z / 2 - 4, b[1]]); }).join("") +
    [0, 1].map((r) => { const a = pt(r, 2), b = pt(r + 1, 2); return redArrow([a[0] + z / 2 + 26, a[1] + 24], [b[0] + z / 2 + 26, b[1] - 24]); }).join("") +
    [0, 1, 2].map((r) => redRing(...fp(P[(((d0[2] - r) % 4) + 4) % 4], pt(r, 2), z), 17)).join("") +
    foot(["→ per baris: juring hitam berputar ¼ putaran searah jarum jam", "↓ per kolom: titik luar pindah 1 posisi berlawanan arah jarum jam"], pt(2, 0)[1] + z / 2 + 44);
  add(30, "D", POLA, gridItem([0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : at(r, c)))), opts), 3,
    "Ada dua aturan dari arah berbeda. (1) Dibaca mendatar (per baris), juring hitam berputar seperempat putaran searah jarum jam dari kolom ke kolom. Baris 3: kanan bawah → kiri bawah → berikutnya kiri atas. (2) Dibaca menurun (per kolom), titik hitam di luar lingkaran pindah satu posisi berlawanan arah jarum jam. Kolom 3: bawah → kanan → berikutnya atas. Jadi jawabannya juring kiri atas dengan titik di atas.\n\nOpsi a gugur karena juring tidak berputar (masih kiri bawah). Opsi b gugur karena juring berputar dua langkah (kanan atas). Opsi c gugur karena titik pindah ke arah yang salah, searah jarum jam (ke bawah). Opsi e gugur karena titik tidak pindah (masih di kanan). Tip: jika satu aturan tidak terlihat dari kiri ke kanan, baca gridnya dari atas ke bawah; dua ciri pada satu gambar bisa mengikuti arah baca yang berbeda. Jawaban: d.",
    gridS([0, 1, 2].map((r) => [0, 1, 2].map((c) => at(r, c))), null, { gap: 44, hl: [2, 2], ann, foot: 106 }));
}

// 3#31 — rotasi 270° searah jarum jam.
{
  const base: Fig = [poly([[-30, -30], [6, -30], [30, -6], [30, 30], [-6, 30], [-6, 6], [-30, 6]], "w"), dot(16, 16, 6, "b"), line([-22, -20], [-4, -20], 4)];
  assertChiral(base, "3#31");
  const ans = tf(base, 270);
  const opts = place(ans, [tf(base, 90), tf(base, 270, true), tf(base, 180), tf(base, 90, true)], "C");
  const MARK: Pt[] = [[16, 16], [-13, -20]]; // titik hitam, garis kecil
  const ann: Ann = (at, z) => { const a = at(0, 0), b = at(0, 1); return redArrow([a[0] + z / 2 + 10, a[1]], [b[0] - z / 2 - 10, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - 18, "270° ↻", 28) + redText((a[0] + b[0]) / 2, a[1] + 34, "= 90° ↺", 24) +
    MARK.map((p, i) => redRing(...fp(p, a, z), 22 - 2 * i) + redRing(...fp(ptf(p, 270), b, z), 22 - 2 * i)).join("") + foot(["kanan → atas, atas → kiri"], a[1] + z / 2 + 44); };
  add(31, "C", "Gambar di atas diputar 270° searah jarum jam. Pilihlah satu gambar yang merupakan hasilnya.", stimulusItem(base, false, opts), 2,
    "Putaran 270° searah jarum jam sama dengan putaran 90° berlawanan arah jarum jam: bagian kanan gambar pindah ke atas, bagian atas pindah ke kiri, bagian kiri pindah ke bawah, dan bagian bawah pindah ke kanan. Titik hitam yang semula di kanan bawah pindah ke kanan atas, garis kecil yang semula mendatar di kiri atas menjadi tegak di kiri bawah, sudut terpancung pindah dari kanan atas ke kiri atas, dan coakan dari kiri bawah ke kanan bawah.\n\nOpsi a gugur karena diputar 90° searah jarum jam (arah terbalik; titik hitam ke kiri bawah). Opsi b dan e gugur karena merupakan cerminan, sehingga urutan patokannya terbalik. Opsi d gugur karena diputar 180° (titik hitam ke kiri atas). Tip: ubah 270° searah jarum jam menjadi 90° berlawanan arah jarum jam; satu langkah seperempat putaran lebih mudah dibayangkan daripada tiga langkah. Jawaban: c.",
    gridS([[base, ans]], null, { size: 170, gap: 160, top: 40, hl: [0, 1], ann, foot: 64 }));
}

// 3#32 — putar 90° searah jarum jam, lalu cermin tegak.
{
  const base: Fig = [poly([[-14, -32], [14, -32], [14, -12], [30, -12], [30, 4], [14, 4], [14, 32], [-14, 32]], "w"), dot(0, -22, 5, "b"), poly([[-14, 20], [0, 32], [-14, 32]], "b")];
  assertChiral(base, "3#32");
  // putar R90 lalu cermin M = R270·M → tf(.,270,true)
  const mid = tf(base, 90), ans = tf(base, 270, true);
  const opts = place(ans, [tf(base, 90, true), tf(base, 90), tf(base, 0, true), tf(base, 270)], "E");
  const MARK: Pt[] = [[0, -22], [-9, 28]]; // titik hitam, segitiga hitam
  const ann: Ann = (at, z) => ["90° ↻", "cermin tegak"].map((t, i) => { const a = at(0, i), b = at(0, i + 1); return redArrow([a[0] + z / 2 + 4, a[1]], [b[0] - z / 2 - 4, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - z / 2 - 14, t, 24); }).join("") +
    MARK.map((p, i) => [[0, false], [90, false], [270, true]].map(([d, m], c) => redRing(...fp(ptf(p, d as number, m as boolean), at(0, c), z), 15 - 2 * i)).join("")).join("") +
    foot(["① putar 90° searah jarum jam ② tukar kiri ↔ kanan"], at(0, 0)[1] + z / 2 + 44);
  add(32, "E", "Gambar di atas diputar 90° searah jarum jam, kemudian hasilnya dicerminkan terhadap cermin tegak. Pilihlah satu gambar yang merupakan hasil akhirnya.", stimulusItem(base, true, opts), 3,
    "Kerjakan sesuai urutan. Langkah 1 (putar 90° searah jarum jam): tonjolan yang semula di kanan pindah ke bawah, titik hitam yang semula di atas pindah ke kanan, dan segitiga hitam yang semula di kiri bawah pindah ke kiri atas. Langkah 2 (cermin tegak): kiri dan kanan ditukar, atas-bawah tetap, jadi tonjolan tetap di bawah, titik hitam pindah ke kiri, dan segitiga hitam pindah ke kanan atas.\n\nOpsi a gugur karena mengerjakan urutan terbalik (cermin dulu, baru putar), sehingga segitiga berada di kiri bawah. Opsi b gugur karena hanya diputar tanpa dicerminkan (segitiga masih di kiri atas). Opsi c gugur karena hanya dicerminkan tanpa diputar (bangun masih tegak). Opsi d gugur karena diputar berlawanan arah jarum jam tanpa cermin (tonjolan di atas). Tip: gambar hasil langkah 1 lebih dulu di kertas buram, baru terapkan langkah 2; jangan menggabungkan dua langkah di kepala sekaligus. Jawaban: e.",
    gridS([[base, mid, ans]], null, { gap: 70, top: 46, hl: [0, 2], ann, foot: 64 }));
}

// 3#35 — analogi: dicerminkan kiri-kanan dan warna dibalik.
{
  const fig = (kind: "perahu" | "gembok", f: Fill, deg = 0, mirror = false): Fig => tf(kind === "perahu"
    ? [poly([[-32, 6], [32, 6], [20, 26], [-26, 26]], f), line([-4, 6], [-4, -32], 4), poly([[-4, -32], [-4, 0], [24, 0]], inv(f)), dot(-20, 16, 4, inv(f))]
    : [poly([[-26, -4], [26, -4], [26, 32], [-26, 32]], f), line([-16, -4], [-16, -26], 5), line([-16, -26], [10, -26], 5), line([10, -26], [10, -14], 5), poly([[8, 8], [18, 8], [18, 22], [8, 22]], inv(f))], deg, mirror);
  const ans = fig("gembok", "b", 0, true), figs = [fig("perahu", "w"), fig("perahu", "b", 0, true), fig("gembok", "w"), ans];
  const opts = place(ans, [fig("gembok", "w", 0, true), fig("gembok", "b", 180), fig("gembok", "b"), fig("gembok", "b", 180, true)], "B");
  const MARK: [Pt, number][] = [[[-20, 16], 0], [[20, 16], 1], [[13, 15], 2], [[-13, 15], 3]]; // titik perahu, lubang kunci
  const ann: Ann = (at, z) => MARK.map(([p, c]) => redRing(...fp(p, at(0, c), z), 18)).join("") +
    foot(["① dicerminkan kiri-kanan (atas-bawah tetap)", "② warna dibalik: putih ↔ hitam"], at(0, 0)[1] + z / 2 + 40);
  add(35, "B", ANALOGI, analogyItem([fig("perahu", "w"), fig("perahu", "b", 0, true), fig("gembok", "w")], opts), 3,
    "Dari gambar pertama ke kedua ada dua perubahan. (1) Gambar dicerminkan kiri-kanan: layar yang semula mengarah ke kanan kini mengarah ke kiri, dan titik di badan perahu pindah dari kiri ke kanan, sedangkan atas-bawah tetap. (2) Warna dibalik: badan putih menjadi hitam, sedangkan layar dan titik yang hitam menjadi putih. Terapkan pada gembok: kaki panjang lengkungnya pindah ke sisi kanan, lubang kunci pindah ke kiri, badannya menjadi hitam, dan lubang kuncinya menjadi putih.\n\nOpsi a gugur karena warnanya tidak dibalik (badan masih putih). Opsi c gugur karena diputar 180° (lengkung di bawah), bukan dicerminkan kiri-kanan. Opsi d gugur karena tidak dicerminkan (lubang kunci masih di kanan). Opsi e gugur karena dicerminkan atas-bawah (lengkung di bawah). Tip: pada cermin kiri-kanan, bagian atas harus tetap di atas; opsi yang lengkung gemboknya pindah ke bawah langsung gugur. Jawaban: b.",
    analogyS(figs, null, { hl: true, ann, foot: 86 }));
}

// 3#36 — analogi: putar 90° searah jarum jam, garis melintang +2.
{
  const fig = (kind: "panah" | "palu", bars: number, deg: number): Fig => tf([
    line([0, 30], [0, -18], 5),
    kind === "panah" ? poly([[0, -34], [12, -16], [-12, -16]], "b") : poly([[-14, -34], [14, -34], [14, -20], [-14, -20]], "w"),
    ...Array.from({ length: bars }, (_, i): Prim => line([-8, 26 - i * 7], [8, 26 - i * 7], 3)),
  ], deg % 360);
  const ans = fig("palu", 5, 0), figs = [fig("panah", 1, 0), fig("panah", 3, 90), fig("palu", 3, 270), ans];
  const opts = place(ans, [fig("palu", 3, 0), fig("palu", 5, 180), fig("palu", 4, 0), fig("palu", 5, 270)], "A");
  const ann: Ann = (at, z) => [1, 3, 3, 5].map((n, c) => redText(at(0, c)[0], at(0, c)[1] + z / 2 + 32, `${n} garis`, 26)).join("") +
    foot(["① diputar 90° searah jarum jam", "② garis melintang bertambah 2"], at(0, 0)[1] + z / 2 + 74);
  add(36, "A", ANALOGI, analogyItem([fig("panah", 1, 0), fig("panah", 3, 90), fig("palu", 3, 270)], opts), 3,
    "Dari gambar pertama ke kedua ada dua perubahan. (1) Gambar diputar 90° searah jarum jam: panah yang menghadap ke atas menjadi menghadap ke kanan. (2) Garis melintang pada gagang bertambah dua (1 menjadi 3). Gambar ketiga adalah palu yang menghadap ke kiri dengan 3 garis; diputar 90° searah jarum jam, kiri menjadi atas, jadi jawabannya palu yang menghadap ke atas dengan 5 garis.\n\nOpsi b gugur karena garisnya tidak bertambah (masih 3). Opsi c gugur karena diputar berlawanan arah jarum jam (palu menghadap ke bawah). Opsi d gugur karena garisnya hanya bertambah satu (4). Opsi e gugur karena palu tidak diputar (masih menghadap ke kiri). Tip: urutan arah searah jarum jam adalah atas → kanan → bawah → kiri → atas; cukup maju satu langkah dari arah gambar ketiga. Jawaban: a.",
    analogyS(figs, null, { hl: true, ann, foot: 120 }));
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
  const AX = ["tegak", "datar", "", "tegak", "datar"];
  const o = optionsRowS(opts, 20, { hl: 2 }), k = o.size / 96, lab = o.body + AX.map((a, i) => {
    const [x, y] = o.at(i), h = 50 * k;
    return (a === "tegak" ? dashLine([x, y - h], [x, y + h], "#d32f2f") : a === "datar" ? dashLine([x - h, y], [x + h, y], "#d32f2f") : "") + redText(x, o.bottom + 14, a ? `sumbu ${a}` : "tidak ada", 22);
  }).join("") + redText(W / 2, o.bottom + 52, "garis merah putus-putus = sumbu simetri (garis lipat)", 24);
  add(37, "C", GANJIL, rowItem(opts), 3,
    "Cari ciri yang sama pada empat gambar. Gambar a, b, d, dan e masing-masing punya sumbu simetri: jika dilipat pada garis tegak (a dan d) atau garis mendatar (b dan e), kedua belahnya tepat berimpit, termasuk titik-titiknya. Gambar c (jajaran genjang dengan dua titik di sudut yang berseberangan) tidak punya sumbu simetri; ia hanya kembali sama jika diputar 180°, dan putaran bukan lipatan.\n\nWarna tidak membedakan karena bangun hitam (a, e) dan putih (b, c, d) masing-masing muncul lebih dari satu kali. Jumlah titik juga tidak membedakan karena gambar bertitik dua (a, c) dan bertitik satu (b, d, e) masing-masing muncul lebih dari satu kali. Tip: untuk mengecek sumbu simetri, bayangkan cermin di tengah gambar; jika belahan kiri tidak sama persis dengan bayangan belahan kanan (atau atas dengan bawah), gambar itu tidak bersumbu simetri. Jawaban: c.",
    svgWrap(o.bottom + 66, lab));
}
