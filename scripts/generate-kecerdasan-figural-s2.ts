import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Simulasi Kecerdasan Paket 2 (package_number 12): 6 pola bundar (51-56) dan
// 11 figural (26-34, 38-39). Pedoman: docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md.
// Figur dibangun dari koordinat eksplisit (rotasi/cermin dihitung di sini, bukan
// transform SVG), jadi string SVG yang sama = gambar yang sama: opsi kembar
// karena simetri ikut tertangkap assert.
//   npx tsx scripts/generate-kecerdasan-figural-s2.ts
// Output: prisma/data/kecerdasan_s2_figural.json + output/figural-s2-preview.html

import { BUNDAR, BUNDAR_HURUF, type Fig, type Fill, KEYS, type Key, type Prim, type Pt, analogyItem, gridItem, pieSvg, place, r1, shape, sig, stimulusItem, tf } from "./figural-lib";

// ── item ────────────────────────────────────────────────────────────────────
type Built = { seq: number; key: Key; instruksi: string; svg: string; choices?: string[]; pembahasan: string; options?: Fig[] };
const items: Built[] = [];
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";

// 26 — deret: panah berbendera berputar 45° searah jarum jam, kepala panah hitam/putih
// bergantian, titik bertambah 1.
{
  const arrow = (head: Fill): Fig => [
    { k: "line", a: [0, 24], b: [0, -12] },
    { k: "poly", pts: [[0, -30], [-10, -12], [10, -12]], fill: head },
    { k: "poly", pts: [[0, 10], [14, 10], [14, 20], [0, 20]], fill: "b" },
  ];
  const frame = (step: number, dots: number, head: Fill, mirror = false): Fig => [
    ...tf(arrow(head), step * 45, mirror),
    ...Array.from({ length: dots }, (_, i): Prim => ({ k: "circ", c: [-36 + i * 8, 39], r: 3, fill: "b" })),
  ];
  const opts = place(frame(4, 5, "b"), [frame(3, 5, "b"), frame(4, 4, "b"), frame(4, 5, "b", true), frame(4, 5, "w")], "C");
  items.push({ seq: 26, key: "C", instruksi: POLA, svg: gridItem([[frame(0, 1, "b"), frame(1, 2, "w"), frame(2, 3, "b"), frame(3, 4, "w"), null]], opts), options: opts,
    pembahasan: "Ada tiga aturan yang berjalan bersamaan. (1) Panah berbendera berputar 45° searah jarum jam setiap langkah: 0°, 45°, 90°, 135°, jadi gambar ke-5 menghadap 180° (ke bawah) dengan bendera di kiri atas. (2) Kepala panah hitam dan putih bergantian, jadi gambar ke-5 hitam. (3) Jumlah titik bertambah satu: 1, 2, 3, 4, jadi 5. Opsi a gugur karena panah belum berputar (masih 135°). Opsi b gugur karena titiknya masih 4. Opsi d gugur karena bendera berada di sisi yang salah (pencerminan, bukan perputaran). Opsi e gugur karena kepala panahnya putih. Jawaban: c." });
}

// 27 — deret: pusat hitam/putih bergantian, segitiga +3 posisi, lingkaran −1 posisi (8 arah).
{
  const pos = (i: number, r = 34): Pt => { const a = ((-90 + 45 * i) * Math.PI) / 180; return [r1(r * Math.cos(a)), r1(r * Math.sin(a))]; };
  const tri = (i: number): Prim => tf([{ k: "poly", pts: [[0, -42], [-8, -28], [8, -28]], fill: "b" }], 45 * i)[0];
  const frame = (center: Fill, t: number, c: number): Fig => [
    { k: "circ", c: [0, 0], r: 14, fill: center },
    tri(((t % 8) + 8) % 8),
    { k: "circ", c: pos(((c % 8) + 8) % 8), r: 6, fill: "w" },
  ];
  const seq: Fig[] = [frame("b", 0, 2), frame("w", 3, 1), frame("b", 6, 0), frame("w", 1, 7)];
  const opts = place(frame("b", 4, 6), [frame("w", 4, 6), frame("b", 3, 6), frame("b", 4, 0), frame("b", 6, 4)], "A");
  items.push({ seq: 27, key: "A", instruksi: POLA, svg: gridItem([[...seq, null]], opts), options: opts,
    pembahasan: "Ada tiga aturan. (1) Lingkaran pusat bergantian hitam–putih, jadi gambar ke-5 hitam. (2) Segitiga melompat 3 posisi searah jarum jam (atas → kanan bawah → kiri → kanan atas), jadi berikutnya di bawah. (3) Lingkaran kecil putih mundur 1 posisi berlawanan jarum jam (kanan → kanan atas → atas → kiri atas), jadi berikutnya di kiri. Opsi b gugur karena pusatnya putih. Opsi c gugur karena segitiga hanya bergeser 2 posisi. Opsi d gugur karena lingkaran kecil bergerak searah jarum jam. Opsi e gugur karena posisi segitiga dan lingkaran kecil tertukar. Jawaban: a." });
}

// 28 — deret: tiga lapis bangun berputar urutan, pola isi bergantian, penanda sudut berputar searah jarum jam.
{
  type S = "seg4" | "lingkaran" | "seg3";
  const CORNER: Pt[] = [[-40, -40], [40, -40], [40, 40], [-40, 40]];
  const nest = ([o, m, i]: S[], odd: boolean, corner: number): Fig => {
    const [cx, cy] = CORNER[corner % 4];
    const mark: Prim = { k: "poly", pts: [[cx - 4, cy - 4], [cx + 4, cy - 4], [cx + 4, cy + 4], [cx - 4, cy + 4]], fill: "b" };
    const f: Fill[] = odd ? ["w", "b", "w"] : ["b", "w", "b"];
    // ukuran tiap lapis menyesuaikan bangun luarnya supaya lapis dalam tidak menembus
    const rO = 42, rM = o === "seg3" ? 19 : 27, rI = (o === "seg3" || m === "seg3") ? 8 : 12;
    return [shape(o, o === "seg4" ? 50 : o === "seg3" ? 44 : rO, f[0]), shape(m, m === "seg4" ? rM * 1.15 : rM, f[1]), shape(i, rI, f[2]), mark];
  };
  const order: S[][] = [["seg4", "lingkaran", "seg3"], ["lingkaran", "seg3", "seg4"], ["seg3", "seg4", "lingkaran"]];
  const seq = [0, 1, 2, 3].map((k) => nest(order[k % 3], k % 2 === 0, k));
  const opts = place(nest(order[1], true, 4), [nest(order[1], false, 4), nest(order[2], true, 4), nest(["lingkaran", "seg4", "seg3"], true, 4), nest(order[1], true, 3)], "E");
  items.push({ seq: 28, key: "E", instruksi: POLA, svg: gridItem([[...seq, null]], opts), options: opts,
    pembahasan: "Ada tiga aturan. (1) Urutan bangun dari luar ke dalam bergeser satu tiap langkah: persegi–lingkaran–segitiga, lingkaran–segitiga–persegi, segitiga–persegi–lingkaran, lalu kembali persegi–lingkaran–segitiga. Gambar ke-5 adalah lingkaran–segitiga–persegi. (2) Isi berselang-seling: putih–hitam–putih, lalu hitam–putih–hitam. Gambar ke-5 kembali putih–hitam–putih. (3) Kotak kecil di sudut berpindah searah jarum jam: kiri atas, kanan atas, kanan bawah, kiri bawah, lalu kembali ke kiri atas. Opsi a gugur karena isinya hitam–putih–hitam. Opsi b gugur karena urutannya maju dua langkah. Opsi c gugur karena lapis tengah dan dalam tertukar. Opsi d gugur karena kotak sudut tidak berpindah (masih di kiri bawah). Jawaban: e." });
}

// 29 — matriks: kolom 3 = (kolom 1 XOR kolom 2) lalu diputar 90° searah jarum jam.
{
  const h = 30;
  const seg: Record<string, [Pt, Pt]> = {
    T: [[-h, -h], [h, -h]], R: [[h, -h], [h, h]], B: [[-h, h], [h, h]], L: [[-h, -h], [-h, h]], D1: [[-h, -h], [h, h]], D2: [[-h, h], [h, -h]],
  };
  const cell = (s: string[]): Fig => [{ k: "circ", c: [0, 0], r: 3, fill: "b" }, ...s.sort().map((n): Prim => ({ k: "line", a: seg[n][0], b: seg[n][1] }))];
  const xor = (a: string[], b: string[]) => [...a.filter((x) => !b.includes(x)), ...b.filter((x) => !a.includes(x))];
  const CW: Record<string, string> = { T: "R", R: "B", B: "L", L: "T", D1: "D2", D2: "D1" };
  const CCW: Record<string, string> = { T: "L", L: "B", B: "R", R: "T", D1: "D2", D2: "D1" };
  const turn = (s: string[], m = CW) => s.map((x) => m[x]);
  const rows = [[["T", "D1"], ["T", "R"]], [["L", "B", "D2"], ["B", "D1"]], [["R", "D2", "T"], ["D2", "L"]]];
  const ans = turn(xor(rows[2][0], rows[2][1]));
  assert.deepEqual([...ans].sort(), ["B", "R", "T"]);
  const opts = place(cell(ans), [cell(xor(rows[2][0], rows[2][1])), cell(turn(xor(rows[2][0], rows[2][1]), CCW)), cell(turn(["R", "D2", "T", "L"])), cell(["T", "B"])], "A");
  items.push({ seq: 29, key: "A", instruksi: POLA, svg: gridItem(rows.map(([a, b], r) => [cell(a), cell(b), r < 2 ? cell(turn(xor(a, b))) : null]), opts), options: opts,
    pembahasan: "Gambar kolom 3 diperoleh dalam dua tahap. Tahap 1: gabungkan garis kolom 1 dan kolom 2, lalu hapus garis yang muncul di keduanya. Tahap 2: putar hasilnya 90° searah jarum jam. Cek baris 1: (atas, diagonal \\) dan (atas, kanan) → tersisa diagonal \\ dan kanan → diputar menjadi diagonal / dan bawah, sesuai gambar. Baris 3: (kanan, /, atas) dan (/, kiri) → tersisa kanan, atas, kiri → diputar menjadi bawah, kanan, atas. Opsi b gugur karena belum diputar. Opsi c gugur karena diputar berlawanan arah jarum jam. Opsi d gugur karena garis yang sama tidak dihapus. Opsi e gugur karena sisi kanan hilang. Jawaban: a." });
}

// 30 — matriks: bujur sangkar Latin bingkai × isi.
{
  type Fr = "lingkaran" | "seg4" | "seg6";
  type In = "plus" | "titik" | "palang";
  const inner = (n: In): Fig =>
    n === "plus" ? [{ k: "line", a: [0, -16], b: [0, 16], w: 6 }, { k: "line", a: [-16, 0], b: [16, 0], w: 6 }]
      : n === "titik" ? [{ k: "circ", c: [0, 0], r: 12, fill: "b" }]
      : [{ k: "poly", pts: [[-18, -6], [18, -6], [18, 6], [-18, 6]], fill: "b" }];
  const cell = (f: Fr, i: In): Fig => [shape(f, f === "seg4" ? 46 : 36, "w"), ...inner(i)];
  const grid: [Fr, In][][] = [
    [["lingkaran", "plus"], ["seg4", "titik"], ["seg6", "palang"]],
    [["seg4", "palang"], ["seg6", "plus"], ["lingkaran", "titik"]],
    [["seg6", "titik"], ["lingkaran", "palang"], ["seg4", "plus"]],
  ];
  const opts = place(cell("seg4", "plus"), [cell("seg4", "titik"), cell("seg6", "plus"), cell("lingkaran", "plus"), cell("seg4", "palang")], "D");
  items.push({ seq: 30, key: "D", instruksi: POLA, svg: gridItem(grid.map((row, r) => row.map(([f, i], c) => (r === 2 && c === 2 ? null : cell(f, i)))), opts), options: opts,
    pembahasan: "Setiap baris dan setiap kolom memuat tepat satu dari tiap bingkai (lingkaran, persegi, segi enam) dan tepat satu dari tiap isi (tanda tambah, titik, palang). Baris 3 sudah punya segi enam dan lingkaran, jadi bingkainya persegi. Kolom 3 sudah punya palang dan titik, jadi isinya tanda tambah. Opsi a dan e gugur karena isinya sudah ada di kolom 3. Opsi b dan c gugur karena bingkainya sudah ada di baris 3. Jawaban: d." });
}

// 31 — matriks: kolom 3 = bentuk kolom 1, jumlah titik kolom 1 + kolom 2, warna kolom 2.
{
  type Sh = "seg3" | "lingkaran" | "seg4";
  const cell = (s: Sh, n: number, f: Fill): Fig => {
    const dot: Fill = f === "b" ? "w" : "b";
    const yOff = s === "seg3" ? 8 : 0;
    const xs = n === 1 ? [0] : n === 2 ? [-9, 9] : n === 3 ? [-14, 0, 14] : [-9, 9, -9, 9];
    const ys = n === 4 ? [-9, -9, 9, 9] : xs.map(() => 0);
    return [shape(s, s === "seg3" ? 44 : s === "seg4" ? 50 : 36, f), ...xs.map((x, i): Prim => ({ k: "circ", c: [x, ys[i] + yOff], r: 5, fill: dot }))];
  };
  const rows: [Sh, number, Fill][][] = [
    // baris 1 sengaja putih–putih: menggugurkan aturan "warna = kebalikan kolom 1"
    [["seg3", 2, "w"], ["lingkaran", 1, "w"]],
    [["seg4", 1, "b"], ["seg3", 3, "w"]],
    [["lingkaran", 2, "b"], ["seg4", 2, "b"]],
  ];
  const third = ([a, b]: [Sh, number, Fill][]) => cell(a[0], a[1] + b[1], b[2]);
  const opts = place(third(rows[2]), [cell("lingkaran", 4, "w"), cell("seg4", 4, "b"), cell("lingkaran", 2, "b"), cell("lingkaran", 3, "b")], "B");
  items.push({ seq: 31, key: "B", instruksi: POLA, svg: gridItem(rows.map((row, r) => [cell(...row[0]), cell(...row[1]), r < 2 ? third(row) : null]), opts), options: opts,
    pembahasan: "Pada setiap baris, gambar kolom 3 memakai bentuk kolom 1, jumlah titiknya sama dengan jumlah titik kolom 1 ditambah kolom 2, dan warnanya mengikuti kolom 2. Baris 1: segitiga putih (2 titik) dan lingkaran putih (1 titik) → segitiga putih 3 titik. Baris 2: persegi hitam (1 titik) dan segitiga putih (3 titik) → persegi putih 4 titik. Warna tidak mengikuti kebalikan kolom 1, karena di baris 1 kolom 1 putih dan hasilnya tetap putih. Baris 3: lingkaran hitam (2 titik) dan persegi hitam (2 titik) → lingkaran hitam 4 titik. Opsi a gugur karena warnanya putih. Opsi c gugur karena bentuknya persegi. Opsi d gugur karena titiknya hanya 2. Opsi e gugur karena titiknya 3. Jawaban: b." });
}

// 32 — matriks: kotak hitam +1 searah jarum jam, lingkaran −2 per kolom (keliling grid 3×3).
{
  const P: Pt[] = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
  const s = 22;
  const cell = (black: number, dot: number): Fig => {
    const b = ((black % 8) + 8) % 8, d = ((dot % 8) + 8) % 8;
    assert.notEqual(b, d, "kotak dan lingkaran bertumpuk");
    const sq = (x: number, y: number, f: Fill): Prim => ({ k: "poly", pts: [[x * s - 10, y * s - 10], [x * s + 10, y * s - 10], [x * s + 10, y * s + 10], [x * s - 10, y * s + 10]], fill: f });
    const grid: Fig = [];
    for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) grid.push(sq(x, y, P[b][0] === x && P[b][1] === y ? "b" : "w"));
    return [...grid, { k: "circ", c: [P[d][0] * s, P[d][1] * s], r: 6, fill: "b" }];
  };
  // titik awal tiap baris sengaja tidak menyambung antarbaris, supaya tidak terbaca sebagai spiral 9 petak
  const starts: [number, number][] = [[0, 4], [2, 7], [4, 1]];
  const grid = starts.map(([b, d], r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : cell(b + c, d - 2 * c))));
  const opts = place(cell(6, -3), [cell(7, -3), cell(6, -1), cell(6, 1), cell(6, -4)], "C");
  items.push({ seq: 32, key: "C", instruksi: POLA, svg: gridItem(grid, opts), options: opts,
    pembahasan: "Lihat per baris dari kiri ke kanan. Kotak hitam bergeser 1 petak searah jarum jam di sepanjang tepi grid kecil. Lingkaran hitam bergeser 2 petak berlawanan arah jarum jam. Baris 3: kotak hitam kanan bawah → bawah tengah → berikutnya kiri bawah. Lingkaran atas tengah → kiri tengah → berikutnya bawah tengah. Opsi a gugur karena kotak hitam bergeser 2 petak. Opsi b gugur karena lingkaran tidak bergeser. Opsi d gugur karena lingkaran bergerak searah jarum jam. Opsi e gugur karena lingkaran bergeser 3 petak. Jawaban: c." });
}

// 33 — rotasi: hanya satu pilihan hasil perputaran, sisanya cerminan.
{
  const base: Fig = [
    { k: "poly", pts: [[-30, -30], [10, -30], [10, -10], [30, -10], [30, 30], [-10, 30], [-10, 6], [-30, 6]], fill: "w" },
    { k: "circ", c: [20, -21], r: 6, fill: "b" },
    { k: "poly", pts: [[-22, -22], [0, -22], [-22, 0]], fill: "b" },
  ];
  // bangun harus kiral: tidak ada cerminan yang sama dengan rotasi mana pun
  for (const d of [0, 90, 180, 270]) for (const e of [0, 90, 180, 270]) assert.notEqual(sig(tf(base, d, true)), sig(tf(base, e)), "bangun 33 simetris");
  const opts = place(tf(base, 90), [tf(base, 0, true), tf(base, 90, true), tf(base, 180, true), tf(base, 270, true)], "B");
  items.push({ seq: 33, key: "B", instruksi: "Pilihlah satu gambar yang merupakan hasil perputaran (rotasi) dari gambar di atas, bukan pencerminannya.", svg: stimulusItem(base, false, opts), options: opts,
    pembahasan: "Pakai dua patokan: segitiga hitam dan titik hitam. Pada gambar soal, jika bergerak searah jarum jam dari segitiga hitam, titik hitam ditemui lebih dulu (segitiga di kiri atas, titik di kanan atas). Perputaran mempertahankan arah ini, sedangkan pencerminan membaliknya. Gambar b (gambar soal diputar 90° searah jarum jam) mempertahankannya: segitiga di kanan atas, titik di kanan bawah. Gambar a, c, d, dan e adalah cerminan gambar soal yang kemudian diputar, sehingga titik hitam berada berlawanan arah jarum jam dari segitiga. Jawaban: b." });
}

// 34 — cermin: bayangan terhadap cermin tegak di sebelah kanan gambar.
{
  const base: Fig = [
    { k: "poly", pts: [[-26, 34], [-26, -34], [24, -34], [8, -20], [24, -6], [-12, -6], [-12, 34]], fill: "w" },
    { k: "circ", c: [12, 18], r: 9, fill: "b" },
    { k: "line", a: [-19, -26], b: [-19, -14], w: 4 },
  ];
  // dua langkah: cermin tegak, lalu putar 90° searah jarum jam (tf mencerminkan dulu baru memutar)
  const opts = place(tf(base, 90, true), [tf(base, 0, true), tf(base, 90), tf(base, 270, true), tf(base, 180)], "E");
  items.push({ seq: 34, key: "E", instruksi: "Gambar di atas dicerminkan terhadap cermin tegak pada garis putus-putus, kemudian hasil cerminannya diputar 90° searah jarum jam. Pilihlah satu gambar yang merupakan hasil akhirnya.", svg: stimulusItem(base, true, opts), options: opts,
    pembahasan: "Kerjakan bertahap. Langkah 1 (cermin tegak): kiri dan kanan terbalik, sehingga tiang pindah ke kanan, bendera menghadap ke kiri, bulatan hitam di kiri bawah, dan garis kecil di kanan atas. Langkah 2 (putar 90° searah jarum jam): bagian kanan berpindah ke bawah dan bagian atas berpindah ke kanan, sehingga tiang menjadi mendatar di bawah, bendera berdiri di sisi kanan, bulatan hitam di kiri atas, dan garis kecil di kanan bawah. Opsi a hanya dicerminkan. Opsi b hanya diputar tanpa dicerminkan. Opsi c dicerminkan lalu diputar berlawanan arah jarum jam. Opsi d hanya diputar 180°. Jawaban: e." });
}

// 38 — analogi: bangun luar/dalam bertukar dan warna dibalik.
{
  const pair = (o: "seg4" | "lingkaran" | "seg6" | "seg3", fo: Fill, i: "seg4" | "lingkaran" | "seg6" | "seg3", fi: Fill): Fig => {
    const outerR = o === "seg4" ? 50 : o === "seg3" ? 46 : 38;
    const innerR = o === "seg3" ? 11 : i === "seg4" ? 22 : 16;
    const inner = shape(i, innerR, fi);
    // segitiga luar: titik beratnya di bawah pusat, bangun dalam ikut turun
    const yo = o === "seg3" ? 7 : 0;
    const moved: Prim = inner.k === "circ" ? { ...inner, c: [0, yo] } : inner.k === "poly" ? { ...inner, pts: inner.pts.map(([x, y]): Pt => [x, r1(y + yo)]) } : inner;
    return [shape(o, outerR, fo), moved];
  };
  const dots = (n: number): Fig => Array.from({ length: n }, (_, i): Prim => ({ k: "circ", c: [-40 + i * 9, 42], r: 3, fill: "b" }));
  const opts = place([...pair("seg3", "b", "seg6", "w"), ...dots(3)], [
    [...pair("seg3", "w", "seg6", "b"), ...dots(3)],
    [...pair("seg6", "b", "seg3", "w"), ...dots(3)],
    [...pair("seg3", "b", "seg6", "w"), ...dots(2)],
    [...tf([shape("seg3", 46, "b")], 180), pair("seg3", "b", "seg6", "w")[1], ...dots(3)],
  ], "A");
  items.push({ seq: 38, key: "A", instruksi: "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.",
    svg: analogyItem([[...pair("seg4", "w", "lingkaran", "b"), ...dots(1)], [...pair("lingkaran", "b", "seg4", "w"), ...dots(2)], [...pair("seg6", "w", "seg3", "b"), ...dots(2)]], opts), options: opts,
    pembahasan: "Dari gambar pertama ke kedua terjadi tiga perubahan: bangun luar dan bangun dalam bertukar tempat (persegi luar menjadi dalam, lingkaran dalam menjadi luar), warnanya dibalik (luar putih menjadi hitam, dalam hitam menjadi putih), dan titik di kiri bawah bertambah satu (1 menjadi 2). Terapkan pada gambar ketiga: segi enam putih dengan segitiga hitam dan 2 titik menjadi segitiga hitam dengan segi enam putih di dalamnya dan 3 titik. Opsi b gugur karena warnanya tidak dibalik. Opsi c gugur karena bangun tidak bertukar. Opsi d gugur karena titiknya tetap 2. Opsi e gugur karena segitiganya terbalik, padahal tidak ada perputaran. Jawaban: a." });
}

// 39 — analogi: diputar 90° searah jarum jam, warna badan dibalik, jumlah titik +1.
{
  const fig = (body: "rumah" | "panah", dots: number, deg: number, fill: Fill = "w", mirror = false): Fig => {
    const shapeFig: Prim = body === "rumah"
      ? { k: "poly", pts: [[-14, -30], [8, -30], [8, 30], [-14, 30]], fill }
      : { k: "poly", pts: [[-14, -30], [8, -14], [8, 30], [-14, 30]], fill };
    const cap: Prim = { k: "poly", pts: [[-14, -30], [-14, -12], [-4, -30]], fill: fill === "w" ? "b" : "w" };
    const ds = Array.from({ length: dots }, (_, i): Prim => ({ k: "circ", c: [24, 24 - i * 13], r: 5, fill: "b" }));
    return tf([shapeFig, cap, ...ds], deg, mirror);
  };
  const opts = place(fig("panah", 4, 90, "b"), [fig("panah", 3, 90, "b"), fig("panah", 4, 270, "b"), fig("panah", 4, 90, "w"), fig("panah", 4, 90, "b", true)], "D");
  items.push({ seq: 39, key: "D", instruksi: "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.",
    svg: analogyItem([fig("rumah", 2, 0), fig("rumah", 3, 90, "b"), fig("panah", 3, 0)], opts), options: opts,
    pembahasan: "Dari gambar pertama ke kedua ada tiga perubahan: seluruh gambar diputar 90° searah jarum jam (sudut yang semula di kiri atas pindah ke kanan atas), warna badan dan sudutnya dibalik (badan putih menjadi hitam, sudut hitam menjadi putih), dan jumlah titik bertambah satu (2 menjadi 3). Gambar ketiga berbadan putih dengan 3 titik, jadi jawabannya diputar 90° searah jarum jam, berbadan hitam, dengan 4 titik. Opsi a gugur karena titiknya tetap 3. Opsi b gugur karena diputar berlawanan arah jarum jam. Opsi c gugur karena warnanya tidak dibalik. Opsi e adalah cerminan, bukan perputaran. Jawaban: d." });
}

// ── pola bundar (51-56) ─────────────────────────────────────────────────────
type Bundar = { seq: number; key: Key; instruksi: string; svg: string; choices: string[]; answer: number; pembahasan: string };
const bundar: Bundar[] = [];

// 51 R1 berseberangan: hasil kali pasangan yang berhadapan sama (72); jumlahnya tidak.
{
  const v = [6, 24, 4, 8, 12, 3, 18];
  const ans = 72 / v[3];
  for (let i = 0; i < 3; i++) assert.equal(v[i] * v[i + 4], 72);
  assert.equal(new Set([0, 1, 2].map((i) => v[i] + v[i + 4])).size, 3, "jumlah pasangan tidak boleh tetap");
  bundar.push({ seq: 51, key: "B", instruksi: BUNDAR, svg: pieSvg([{ cx: 425, cy: 150, r: 130, outer: [...v, "?"] }]), choices: ["6", "9", "12", "16", "18"], answer: ans,
    pembahasan: "Tidak ada pola jika dibaca berurutan, dan jumlah pasangan yang berhadapan juga tidak tetap (6 + 12 = 18, 24 + 3 = 27). Yang tetap adalah hasil kalinya: 6 × 12 = 72, 24 × 3 = 72, 4 × 18 = 72. Bilangan di hadapan 8 adalah 72 : 8 = 9. Jawaban: B." });
}
// 52 R2 putaran: searah jarum jam mulai dari panah; selisihnya 3, 4, 7, 11, 18 (tiap selisih = jumlah dua selisih sebelumnya).
{
  const v = [2, 5, 9]; for (let i = 3; i < 6; i++) v.push(v[i - 1] + (v[i - 1] - v[i - 2]) + (v[i - 2] - v[i - 3]));
  assert.deepEqual(v, [2, 5, 9, 16, 27, 45]);
  bundar.push({ seq: 52, key: "D", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, svg: pieSvg([{ cx: 425, cy: 155, r: 125, outer: [...v.slice(0, 5), "?"], startArrow: true }]), choices: ["38", "43", "44", "45", "47"], answer: v[5],
    pembahasan: "Dibaca searah jarum jam mulai dari 2: 2, 5, 9, 16, 27. Selisihnya 3, 4, 7, 11; setiap selisih adalah jumlah dua selisih sebelumnya (3 + 4 = 7, 4 + 7 = 11), sehingga selisih berikutnya 7 + 11 = 18 dan 27 + 18 = 45. Cara lain: setiap bilangan = jumlah dua bilangan sebelumnya + 2 (16 + 27 + 2 = 45). Opsi 38 hanya mengulang selisih 11. Jawaban: D." });
}
// 53 R3 cincin: luar = (dalam juring itu)² + dalam juring berikutnya searah jarum jam.
{
  const inner = [2, 5, 3, 6], outer = inner.map((x, i) => x * x + inner[(i + 1) % 4]);
  assert.deepEqual(outer, [9, 28, 15, 38]);
  assert.notEqual(inner[0] ** 2 + inner[3], outer[0], "arah berlawanan tidak boleh ikut cocok");
  bundar.push({ seq: 53, key: "C", instruksi: BUNDAR, svg: pieSvg([{ cx: 425, cy: 150, r: 130, outer: [...outer.slice(0, 3), "?"], inner }]), choices: ["36", "37", "38", "39", "42"], answer: outer[3],
    pembahasan: "Bilangan cincin luar = kuadrat bilangan cincin dalam pada juring yang sama, ditambah bilangan cincin dalam pada juring berikutnya searah jarum jam: 2² + 5 = 9, 5² + 3 = 28, 3² + 6 = 15. Juring kiri: 6² + 2 (juring atas) = 38. Opsi 39 memakai juring berlawanan arah (6² + 3), padahal arah itu tidak cocok untuk contoh (2² + 6 = 10, bukan 9). Opsi 36 dan 37 hanya mengkuadratkan. Jawaban: C." });
}
// 54 R5 antar-lingkaran: pusat = atas × bawah − (kiri + kanan).
{
  const c = [[6, 4, 5, 3], [7, 9, 4, 2], [8, 5, 6, 7]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: t * b - (l + r) }));
  assert.deepEqual(c.map((x) => x.center), [23, 17, 36]);
  bundar.push({ seq: 54, key: "B", instruksi: BUNDAR, svg: pieSvg(c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: i === 2 ? "?" : x.center })), 290), choices: ["34", "36", "38", "41", "60"], answer: c[2].center,
    pembahasan: "Bilangan di pusat = (atas × bawah) − (kiri + kanan). Lingkaran 1: 6 × 5 − (3 + 4) = 23. Lingkaran 2: 7 × 4 − (2 + 9) = 17. Lingkaran 3: 8 × 6 − (7 + 5) = 36. Opsi 60 muncul jika bagian kiri dan kanan ditambahkan, bukan dikurangkan. Jawaban: B." });
}
// 55 huruf (a): angka di hadapan huruf = urutan × (urutan − 1).
{
  const letters = ["B", "E", "H", "K"], val = (ch: string) => ch.charCodeAt(0) - 64;
  const nums = letters.map((l) => val(l) * (val(l) - 1));
  assert.deepEqual(nums, [2, 20, 56, 110]);
  bundar.push({ seq: 55, key: "C", instruksi: BUNDAR_HURUF, svg: pieSvg([{ cx: 425, cy: 150, r: 130, outer: [...letters, ...nums.slice(0, 3), "?"] }]), choices: ["99", "100", "110", "121", "132"], answer: nums[3],
    pembahasan: "Ubah huruf menjadi urutannya: B = 2, E = 5, H = 8, K = 11. Pasangan yang berhadapan: 2 ↔ 2, 5 ↔ 20, 8 ↔ 56. Aturannya angka = urutan × (urutan − 1): 2 × 1 = 2, 5 × 4 = 20, 8 × 7 = 56. Untuk K: 11 × 10 = 110. Opsi 121 hanya mengkuadratkan, dan opsi 132 memakai 11 × 12. Jawaban: C." });
}
// 56 huruf (b): huruf dan angka berselang-seling, nilainya 1, 3, 6, 10, 15, 21 (+2, +3, ...).
{
  const vals = [1, 3, 6, 10, 15, 21];
  const shown = vals.map((v, i) => (i % 2 === 0 ? String.fromCharCode(64 + v) : v));
  assert.deepEqual(shown.slice(0, 5), ["A", 3, "F", 10, "O"]);
  bundar.push({ seq: 56, key: "C", instruksi: "Bilangan dan huruf dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR_HURUF, svg: pieSvg([{ cx: 425, cy: 155, r: 125, outer: [...shown.slice(0, 5), "?"], startArrow: true }]), choices: ["19", "20", "21", "22", "25"], answer: vals[5],
    pembahasan: "Ubah huruf menjadi urutannya: A = 1, F = 6, O = 15. Deretnya menjadi 1, 3, 6, 10, 15, ? dengan selisih +2, +3, +4, +5, sehingga berikutnya +6: 15 + 6 = 21. Posisi tanda tanya diisi angka karena huruf dan angka berselang-seling. Jawaban: C." });
}

// ── susun output ────────────────────────────────────────────────────────────
// 3 = HOTS (≥ 2 aturan bersamaan / aturan tidak langsung), 2 = sedang. Tidak ada soal mudah.
const HOTS = new Set([26, 27, 28, 29, 31, 32, 33, 38, 39, 51, 52, 53, 54, 55, 56]);
type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: null; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: Key; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: Key };
  pembahasan: string;
  tingkat: 2 | 3;
};
const rows: Row[] = [
  ...items.map((it): Row => ({
    sequence_number: it.seq,
    options_payload: { instruksi: it.instruksi, question_text: null, sub_text: null, is_multi_select: false, svg_content: it.svg, choices: KEYS.map((key, i) => ({ key, text: "abcde"[i] })) },
    scoring_rule: { type: "dichotomous", correct_key: it.key },
    pembahasan: it.pembahasan,
    tingkat: HOTS.has(it.seq) ? 3 : 2,
  })),
  ...bundar.map((b): Row => {
    assert.equal(new Set(b.choices).size, 5, `${b.seq}: pilihan kembar`);
    assert.equal(b.choices[KEYS.indexOf(b.key)], String(b.answer), `${b.seq}: kunci tidak cocok dengan aturan`);
    return {
      sequence_number: b.seq,
      options_payload: { instruksi: b.instruksi, question_text: null, sub_text: null, is_multi_select: false, svg_content: b.svg, choices: KEYS.map((key, i) => ({ key, text: b.choices[i] })) },
      scoring_rule: { type: "dichotomous", correct_key: b.key },
      pembahasan: b.pembahasan,
      tingkat: HOTS.has(b.seq) ? 3 : 2,
    };
  }),
].sort((a, b) => a.sequence_number - b.sequence_number);

assert.deepEqual(rows.map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 33, 34, 38, 39, 51, 52, 53, 54, 55, 56]);
const allIds = rows.flatMap((r) => [...r.options_payload.svg_content.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
assert.equal(new Set(allIds).size, allIds.length, "id SVG harus unik antar soal");
for (const r of rows) assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(r.options_payload.svg_content), `SVG ${r.sequence_number} tidak aman`);
for (const it of items) assert.match(it.pembahasan, new RegExp(`Jawaban: ${it.key.toLowerCase()}\\.$`), `${it.seq}: pembahasan tidak menyebut kunci`);

const root = path.join(__dirname, "..");
fs.writeFileSync(path.join(root, "prisma/data/kecerdasan_s2_figural.json"), `${JSON.stringify(rows, null, 2)}\n`);
fs.mkdirSync(path.join(root, "output"), { recursive: true });
fs.writeFileSync(path.join(root, "output/figural-s2-preview.html"),
  `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Figural S2</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;max-width:900px}section{border:1px solid #aaa;margin:16px 0;padding:12px}svg{display:block;max-width:100%;height:auto}p{font-size:13px;line-height:1.5}</style><body>` +
  rows.map((r) => `<section><h3>Soal ${r.sequence_number} — kunci ${r.scoring_rule.correct_key}</h3><p><b>${r.options_payload.instruksi}</b></p>${r.options_payload.svg_content}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p><p>${r.pembahasan}</p></section>`).join("") +
  `</body></html>`);
console.log(`OK: ${rows.length} soal figural/bundar → prisma/data/kecerdasan_s2_figural.json`);
