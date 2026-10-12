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

import { type Ann, BUNDAR, BUNDAR_HURUF, type Fig, type Fill, HL, KEYS, type Key, type Pie, type Prim, type Pt, W, analogyItem, analogyS, foot, fp, gridItem, gridS, pie, pieAt, pieSvg, place, r1, redArrow, redRing, redText, shape, sig, stimulusItem, svgWrap, tf } from "./figural-lib";

// Pembahasan (aturan 2 paragraf, RULES GENERATE SOAL SPASIAL.md §3): paragraf 1 pola, paragraf 2 eliminasi tiap opsi + tips + kunci.
// Gambar pembahasan (pembahasan_svg): soal dengan "?" terisi jawaban (hijau) + anotasi merah; tanpa id.
const P2 = (pola: string, eliminasi: string) => `${pola}\n\n${eliminasi}`;
/** Panah merah di atas celah antarkotak deret, label bertumpuk di atasnya. */
const gapArrows = (labels: string[][]): Ann => (at, s) => labels.map((ls, i) => {
  const [ax, ay] = at(0, i), [bx] = at(0, i + 1), y = ay - s / 2 - 16;
  return redArrow([ax + 28, y], [bx - 28, y]) + ls.map((t, k) => redText((ax + bx) / 2, y - 12 - 26 * (ls.length - 1 - k), t, 24)).join("");
}).join("");
/** Deret 5 kotak besar, kotak ke-5 = jawaban (hijau). */
const seriesS = (figs: Fig[], top: number, ann: Ann, lines: string[]) =>
  gridS([figs], null, { top, hl: [0, 4], foot: 40 + 34 * lines.length, ann: (at, s) => ann(at, s) + foot(lines, at(0, 0)[1] + s / 2 + 44) });

// ── item ────────────────────────────────────────────────────────────────────
type Built = { seq: number; key: Key; instruksi: string; svg: string; choices?: string[]; pembahasan: string; psvg: string; options?: Fig[] };
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
  const seq: Fig[] = [frame(0, 1, "b"), frame(1, 2, "w"), frame(2, 3, "b"), frame(3, 4, "w")];
  items.push({ seq: 26, key: "C", instruksi: POLA, svg: gridItem([[...seq, null]], opts), options: opts,
    psvg: seriesS([...seq, frame(4, 5, "b")], 66, gapArrows([["45°"], ["45°"], ["45°"], ["45°"]]), ["① panah berputar 45° searah jarum jam", "② kepala panah hitam–putih bergantian", "③ jumlah titik bertambah 1"]),
    pembahasan: P2("Ada tiga aturan yang berjalan bersamaan. (1) Panah berbendera berputar 45° searah jarum jam setiap langkah: 0°, 45°, 90°, 135°, jadi gambar ke-5 menghadap 180° (ke bawah) dengan bendera di kiri atas. (2) Kepala panah hitam dan putih bergantian, jadi gambar ke-5 hitam. (3) Jumlah titik bertambah satu: 1, 2, 3, 4, jadi 5.",
      "Opsi a gugur karena panah belum berputar (masih 135°). Opsi b gugur karena titiknya masih 4. Opsi d gugur karena bendera berada di kanan atas: itu pencerminan, bukan perputaran. Opsi e gugur karena kepala panahnya putih. Tips: periksa dulu aturan yang paling cepat dicek (jumlah titik dan warna kepala), baru bandingkan sisi bendera untuk membedakan putaran dari cerminan. Jawaban: c.") });
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
    psvg: seriesS([...seq, frame("b", 4, 6)], 92, gapArrows(Array(4).fill(["▲ +3", "○ −1"])), ["① pusat hitam–putih bergantian", "② segitiga maju 3 posisi searah jarum jam", "③ lingkaran kecil mundur 1 posisi"]),
    pembahasan: P2("Ada tiga aturan. (1) Lingkaran pusat bergantian hitam–putih, jadi gambar ke-5 hitam. (2) Segitiga melompat 3 posisi searah jarum jam (atas → kanan bawah → kiri → kanan atas), jadi berikutnya di bawah. (3) Lingkaran kecil putih mundur 1 posisi berlawanan arah jarum jam (kanan → kanan atas → atas → kiri atas), jadi berikutnya di kiri.",
      "Opsi b gugur karena pusatnya putih. Opsi c gugur karena segitiga hanya bergeser 2 posisi (berhenti di kanan bawah). Opsi d gugur karena lingkaran kecil bergerak searah jarum jam (ke atas). Opsi e gugur karena posisi segitiga dan lingkaran kecil tertukar. Tips: bayangkan 8 posisi seperti jarum jam (atas, kanan atas, kanan, dan seterusnya), lalu hitung lompatan tiap benda secara terpisah. Jawaban: a.") });
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
  const corners: Ann = (at, s) => [0, 1, 2, 3, 4].map((k) => redRing(...fp(CORNER[k % 4], at(0, k), s), 15)).join("");
  items.push({ seq: 28, key: "E", instruksi: POLA, svg: gridItem([[...seq, null]], opts), options: opts,
    psvg: seriesS([...seq, nest(order[1], true, 4)], 16, corners, ["① urutan bangun luar → dalam bergeser satu", "② isi putih–hitam–putih dan hitam–putih–hitam bergantian", "③ kotak sudut pindah searah jarum jam"]),
    pembahasan: P2("Ada tiga aturan. (1) Urutan bangun dari luar ke dalam bergeser satu tiap langkah: persegi–lingkaran–segitiga, lingkaran–segitiga–persegi, segitiga–persegi–lingkaran, lalu kembali persegi–lingkaran–segitiga. Gambar ke-5 adalah lingkaran–segitiga–persegi. (2) Isi berselang-seling: putih–hitam–putih, lalu hitam–putih–hitam. Gambar ke-5 kembali putih–hitam–putih. (3) Kotak kecil di sudut berpindah searah jarum jam: kiri atas, kanan atas, kanan bawah, kiri bawah, lalu kembali ke kiri atas.",
      "Opsi a gugur karena isinya hitam–putih–hitam. Opsi b gugur karena urutan bangunnya maju dua langkah (segitiga–persegi–lingkaran). Opsi c gugur karena lapis tengah dan dalam tertukar (lingkaran–persegi–segitiga). Opsi d gugur karena kotak sudut tidak berpindah (masih di kiri bawah). Tips: urutan bangun berulang setiap 3 gambar, jadi urutan bangun gambar ke-5 sama dengan gambar ke-2. Jawaban: e.") });
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
  // pembahasan: garis yang sama di kolom 1 dan 2 ditimpa merah (yang dihapus)
  const shared: Ann = (at, s) => rows.map(([a, b], r) => a.filter((x) => b.includes(x)).map((n) => [0, 1].map((c) => {
    const [p, q] = seg[n].map((pt) => fp(pt, at(r, c), s));
    return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="#d32f2f" stroke-width="8" stroke-linecap="round"/>`;
  }).join("")).join("")).join("") + foot(["→ garis merah ada di kolom 1 dan 2: dihapus", "→ sisanya diputar 90° searah jarum jam"], at(2, 0)[1] + s / 2 + 44);
  items.push({ seq: 29, key: "A", instruksi: POLA, svg: gridItem(rows.map(([a, b], r) => [cell(a), cell(b), r < 2 ? cell(turn(xor(a, b))) : null]), opts), options: opts,
    psvg: gridS(rows.map(([a, b]) => [cell(a), cell(b), cell(turn(xor(a, b)))]), null, { hl: [2, 2], ann: shared, foot: 110 }),
    pembahasan: P2("Gambar kolom 3 diperoleh dalam dua tahap. Tahap 1: gabungkan garis kolom 1 dan kolom 2, lalu hapus garis yang muncul di keduanya. Tahap 2: putar hasilnya 90° searah jarum jam. Cek baris 1: (atas, diagonal \\) dan (atas, kanan) → tersisa diagonal \\ dan kanan → diputar menjadi diagonal / dan bawah, sesuai gambar. Baris 3: (kanan, /, atas) dan (/, kiri) → tersisa kanan, atas, kiri → diputar menjadi bawah, kanan, atas.",
      "Opsi b gugur karena belum diputar. Opsi c gugur karena diputar berlawanan arah jarum jam. Opsi d gugur karena garis diagonal yang ada di kedua kolom tidak dihapus. Opsi e gugur karena sisi kanan hilang. Tips: coret dulu garis yang sama di kolom 1 dan 2, baru putar sisanya; jangan memutar sebelum menghapus. Jawaban: a.") });
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
  // pembahasan: baris 3 dan kolom 3 dibingkai merah putus-putus
  const lanes: Ann = (at, s) => {
    const [x0, y0] = at(0, 2), [x1, y1] = at(2, 0), [x2, y2] = at(2, 2), m = s / 2 + 5;
    const dash = (x: number, y: number, w: number, h: number) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="none" stroke="#d32f2f" stroke-width="4" stroke-dasharray="10 7"/>`;
    return dash(x1 - m, y1 - m, x2 - x1 + 2 * m, 2 * m) + dash(x0 - m, y0 - m, 2 * m, y2 - y0 + 2 * m) +
      foot(["→ baris 3 sudah punya segi enam dan lingkaran: persegi", "→ kolom 3 sudah punya palang dan titik: tanda tambah"], y2 + s / 2 + 44);
  };
  items.push({ seq: 30, key: "D", instruksi: POLA, svg: gridItem(grid.map((row, r) => row.map(([f, i], c) => (r === 2 && c === 2 ? null : cell(f, i)))), opts), options: opts,
    psvg: gridS(grid.map((row) => row.map(([f, i]) => cell(f, i))), null, { hl: [2, 2], ann: lanes, foot: 110 }),
    pembahasan: P2("Setiap baris dan setiap kolom memuat tepat satu dari tiap bingkai (lingkaran, persegi, segi enam) dan tepat satu dari tiap isi (tanda tambah, titik, palang). Baris 3 sudah punya segi enam dan lingkaran, jadi bingkainya persegi. Kolom 3 sudah punya palang dan titik, jadi isinya tanda tambah.",
      "Opsi a gugur karena isi titik sudah ada di kolom 3. Opsi b gugur karena bingkai segi enam sudah ada di baris 3. Opsi c gugur karena bingkai lingkaran sudah ada di baris 3. Opsi e gugur karena isi palang sudah ada di kolom 3. Tips: tentukan bingkai dari barisnya dan isi dari kolomnya secara terpisah, lalu gabungkan. Jawaban: d.") });
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
  const sums: Ann = (at, s) => rows.map(([a, b], r) => redText(at(r, 2)[0] + s / 2 + 92, at(r, 2)[1] + 9, `${a[1]} + ${b[1]} = ${a[1] + b[1]}`, 26)).join("") +
    foot(["→ bentuk ikut kolom 1, warna ikut kolom 2", "→ jumlah titik: kolom 1 + kolom 2"], at(2, 0)[1] + s / 2 + 44);
  items.push({ seq: 31, key: "B", instruksi: POLA, svg: gridItem(rows.map((row, r) => [cell(...row[0]), cell(...row[1]), r < 2 ? third(row) : null]), opts), options: opts,
    psvg: gridS(rows.map((row) => [cell(...row[0]), cell(...row[1]), third(row)]), null, { hl: [2, 2], ann: sums, foot: 110 }),
    pembahasan: P2("Pada setiap baris, gambar kolom 3 memakai bentuk kolom 1, jumlah titiknya sama dengan jumlah titik kolom 1 ditambah kolom 2, dan warnanya mengikuti kolom 2. Baris 1: segitiga putih (2 titik) dan lingkaran putih (1 titik) → segitiga putih 3 titik. Baris 2: persegi hitam (1 titik) dan segitiga putih (3 titik) → persegi putih 4 titik. Warna tidak mengikuti kebalikan kolom 1, karena di baris 1 kolom 1 putih dan hasilnya tetap putih. Baris 3: lingkaran hitam (2 titik) dan persegi hitam (2 titik) → lingkaran hitam 4 titik.",
      "Opsi a gugur karena warnanya putih, padahal kolom 2 baris 3 hitam. Opsi c gugur karena bentuknya persegi (bentuk kolom 2), bukan lingkaran. Opsi d gugur karena titiknya hanya 2 (hanya dari kolom 1). Opsi e gugur karena titiknya 3, bukan 2 + 2. Tips: periksa bentuk, jumlah titik, dan warna satu per satu, lalu tentukan kolom mana yang menentukan masing-masing. Jawaban: b.") });
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
  // pembahasan: lingkaran di baris 3 dilingkari merah, kotak hitam lewat keterangan
  const track: Ann = (at, s) => [0, 1, 2].map((c) => { const d = (((starts[2][1] - 2 * c) % 8) + 8) % 8; return redRing(...fp([P[d][0] * 22, P[d][1] * 22], at(2, c), s), 17); }).join("") +
    foot(["→ kotak hitam: 1 petak searah jarum jam", "→ lingkaran: 2 petak berlawanan arah jarum jam"], at(2, 0)[1] + s / 2 + 44);
  items.push({ seq: 32, key: "C", instruksi: POLA, svg: gridItem(grid, opts), options: opts,
    psvg: gridS(starts.map(([b, d]) => [0, 1, 2].map((c) => cell(b + c, d - 2 * c))), null, { hl: [2, 2], ann: track, foot: 110 }),
    pembahasan: P2("Lihat per baris dari kiri ke kanan. Kotak hitam bergeser 1 petak searah jarum jam di sepanjang tepi grid kecil, sedangkan lingkaran hitam bergeser 2 petak berlawanan arah jarum jam. Baris 3: kotak hitam kanan bawah → bawah tengah → berikutnya kiri bawah. Lingkaran atas tengah → kiri tengah → berikutnya bawah tengah.",
      "Opsi a gugur karena kotak hitam bergeser 2 petak (ke kiri tengah). Opsi b gugur karena lingkaran tidak bergeser (masih di kiri tengah). Opsi d gugur karena lingkaran bergerak searah jarum jam (ke atas tengah). Opsi e gugur karena lingkaran bergeser 3 petak (ke kanan bawah). Tips: lacak kotak hitam dan lingkaran satu per satu; menebak keduanya sekaligus mudah tertukar. Jawaban: c.") });
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
  // pembahasan: soal → hasil putar 90°, patokan segitiga & titik dilingkari merah
  const marks: Pt[] = [[-14.7, -14.7], [20, -21]];
  const turn90: Ann = (at, s) => { const a = at(0, 0), b = at(0, 1);
    return redArrow([a[0] + s / 2 + 12, a[1]], [b[0] - s / 2 - 12, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - 18, "90°", 28) + redText((a[0] + b[0]) / 2, a[1] + 34, "searah", 22) +
      marks.map(([x, y]) => redRing(...fp([x, y], a, s), 22) + redRing(...fp([-y, x], b, s), 22)).join("") + // (x, y) diputar 90° searah = (−y, x)
      foot(["→ dari segitiga, searah jarum jam bertemu titik lebih dulu"], a[1] + s / 2 + 44); };
  items.push({ seq: 33, key: "B", instruksi: "Pilihlah satu gambar yang merupakan hasil perputaran (rotasi) dari gambar di atas, bukan pencerminannya.", svg: stimulusItem(base, false, opts), options: opts,
    psvg: gridS([[base, tf(base, 90)]], null, { size: 170, gap: 160, top: 40, hl: [0, 1], ann: turn90, foot: 80 }),
    pembahasan: P2("Pakai dua patokan: segitiga hitam dan titik hitam. Pada gambar soal, jika bergerak searah jarum jam dari segitiga hitam, titik hitam ditemui lebih dulu (segitiga di kiri atas, titik di kanan atas). Perputaran mempertahankan arah ini, sedangkan pencerminan membaliknya. Gambar soal yang diputar 90° searah jarum jam mempertahankannya: segitiga di kanan atas, titik di kanan bawah.",
      "Opsi a gugur karena hanya dicerminkan tegak (segitiga pindah ke kanan atas, titik ke kiri atas). Opsi c, d, dan e gugur karena merupakan cerminan yang kemudian diputar 90°, 180°, dan 270°, sehingga titik hitam berada berlawanan arah jarum jam dari segitiga. Tips: pilih dua patokan yang tidak simetris lalu cek arah putarnya; cara ini lebih cepat daripada memutar seluruh gambar di kepala. Jawaban: b.") });
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
  // pembahasan: soal → cermin → putar 90°, bulatan hitam dilingkari di tiap langkah
  const twoSteps: Ann = (at, s) => ["cermin", "90° searah"].map((t, i) => { const a = at(0, i), b = at(0, i + 1);
    return redArrow([a[0] + s / 2 + 6, a[1]], [b[0] - s / 2 - 6, b[1]]) + redText((a[0] + b[0]) / 2, a[1] - s / 2 - 14, t, 24); }).join("") +
    ([[12, 18], [-12, 18], [-18, -12]] as Pt[]).map((p, i) => redRing(...fp(p, at(0, i), s), 22)).join("") +
    foot(["bulatan hitam: kanan bawah → kiri bawah → kiri atas"], at(0, 0)[1] + s / 2 + 44);
  items.push({ seq: 34, key: "E", instruksi: "Gambar di atas dicerminkan terhadap cermin tegak pada garis putus-putus, kemudian hasil cerminannya diputar 90° searah jarum jam. Pilihlah satu gambar yang merupakan hasil akhirnya.", svg: stimulusItem(base, true, opts), options: opts,
    psvg: gridS([[base, tf(base, 0, true), tf(base, 90, true)]], null, { gap: 70, top: 46, hl: [0, 2], ann: twoSteps, foot: 64 }),
    pembahasan: P2("Kerjakan bertahap. Langkah 1 (cermin tegak): kiri dan kanan terbalik, sehingga tiang pindah ke kanan, bendera menghadap ke kiri, bulatan hitam di kiri bawah, dan garis kecil di kanan atas. Langkah 2 (putar 90° searah jarum jam): bagian kanan berpindah ke bawah dan bagian atas berpindah ke kanan, sehingga tiang menjadi mendatar di bawah, bendera berdiri di sisi kanan, bulatan hitam di kiri atas, dan garis kecil di kanan bawah.",
      "Opsi a gugur karena hanya dicerminkan, belum diputar. Opsi b gugur karena hanya diputar tanpa dicerminkan. Opsi c gugur karena hasil cerminan diputar berlawanan arah jarum jam. Opsi d gugur karena gambar hanya diputar 180°. Tips: lacak satu benda kecil saja, misalnya bulatan hitam: kiri bawah setelah dicerminkan, lalu kiri atas setelah diputar. Jawaban: e.") });
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
  const abc: Fig[] = [[...pair("seg4", "w", "lingkaran", "b"), ...dots(1)], [...pair("lingkaran", "b", "seg4", "w"), ...dots(2)], [...pair("seg6", "w", "seg3", "b"), ...dots(2)]];
  const dotRings: Ann = (at, s) => [1, 2, 2, 3].map((n, c) => redRing(...fp([-40 + 4.5 * (n - 1), 42], at(0, c), s), 10 + 7 * n)).join("") +
    foot(["① luar ↔ dalam bertukar, warna ikut bangunnya", "② titik di kiri bawah bertambah 1"], at(0, 0)[1] + s / 2 + 44);
  items.push({ seq: 38, key: "A", instruksi: "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.",
    svg: analogyItem(abc, opts), options: opts,
    psvg: analogyS([...abc, opts[0]], null, { hl: true, ann: dotRings, foot: 110 }),
    pembahasan: P2("Dari gambar pertama ke kedua ada dua perubahan. (1) Bangun luar dan bangun dalam bertukar tempat, dan setiap bangun membawa warnanya: lingkaran hitam pindah ke luar, persegi putih pindah ke dalam. Akibatnya bagian luar kini hitam dan bagian dalam putih. (2) Titik di kiri bawah bertambah satu (1 menjadi 2). Terapkan pada gambar ketiga: segi enam putih berisi segitiga hitam dengan 2 titik menjadi segitiga hitam berisi segi enam putih dengan 3 titik.",
      "Opsi b gugur karena warnanya tidak ikut bangunnya (segitiga menjadi putih, segi enam menjadi hitam). Opsi c gugur karena bangun tidak bertukar (segi enam tetap di luar). Opsi d gugur karena titiknya tetap 2. Opsi e gugur karena segitiganya terbalik, padahal tidak ada perputaran. Tips: cek satu perubahan ke semua opsi sekaligus; satu pelanggaran sudah cukup untuk menggugurkan opsi. Jawaban: a.") });
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
  const abc: Fig[] = [fig("rumah", 2, 0), fig("rumah", 3, 90, "b"), fig("panah", 3, 0)];
  // sudut kecil dilingkari: kiri atas (−11, −24) → kanan atas setelah diputar 90° (24, −11)
  const capRings: Ann = (at, s) => ([[-11, -24], [24, -11], [-11, -24], [24, -11]] as Pt[]).map((p, c) => redRing(...fp(p, at(0, c), s), 20)).join("") +
    foot(["① diputar 90° searah jarum jam", "② warna badan dan sudut dibalik", "③ titik bertambah 1"], at(0, 0)[1] + s / 2 + 44);
  items.push({ seq: 39, key: "D", instruksi: "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.",
    svg: analogyItem(abc, opts), options: opts,
    psvg: analogyS([...abc, opts[3]], null, { hl: true, ann: capRings, foot: 144 }),
    pembahasan: P2("Dari gambar pertama ke kedua ada tiga perubahan: (1) seluruh gambar diputar 90° searah jarum jam (sudut kecil yang semula di kiri atas pindah ke kanan atas), (2) warna badan dan sudutnya dibalik (badan putih menjadi hitam, sudut hitam menjadi putih), dan (3) jumlah titik bertambah satu (2 menjadi 3). Gambar ketiga berbadan putih dengan 3 titik, jadi jawabannya diputar 90° searah jarum jam, berbadan hitam, dengan 4 titik.",
      "Opsi a gugur karena titiknya tetap 3. Opsi b gugur karena diputar berlawanan arah jarum jam (sudut kecil pindah ke kiri bawah). Opsi c gugur karena warnanya tidak dibalik. Opsi e gugur karena merupakan cerminan, bukan perputaran. Tips: jadikan sudut kecil sebagai patokan arah putar; dari kiri atas ke kanan atas berarti 90° searah jarum jam. Jawaban: d.") });
}

// ── pola bundar (51-56) ─────────────────────────────────────────────────────
type Bundar = { seq: number; key: Key; instruksi: string; svg: string; choices: string[]; answer: number; pembahasan: string; psvg: string };
const bundar: Bundar[] = [];
type Slot = { ring: "outer" | "center"; i?: number; pie?: number };
/** Gambar pembahasan pola bundar: slot "?" diisi jawaban hijau berlingkar hijau, panah awal dibuang (ber-id), plus anotasi merah. */
function solved(pies: Pie[], slot: Slot, answer: number, ann: string, h: number) {
  const k = slot.pie ?? 0, p = pies[k], [x, y] = pieAt(p, slot.ring, slot.i), fs = p.r > 90 ? 26 : 22;
  const blank: Pie = slot.ring === "center" ? { ...p, center: "" } : { ...p, outer: p.outer.map((v, j) => (j === slot.i ? "" : v)) };
  return svgWrap(h, pies.map((q, j) => pie({ ...(j === k ? blank : q), startArrow: false })).join("") + redRing(x, y, fs + Math.max(0, String(answer).length - 2) * 9, HL) +
    `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fs + 2}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${HL}">${answer}</text>` + ann);
}
/** Panah merah antarjuring di luar lingkaran (searah jarum jam) dengan label langkah. */
const steps = (p: Pie, labels: string[]) => labels.map((t, s) => {
  const n = p.outer.length, ang = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180, pt = (a: number, rr: number): Pt => [p.cx + rr * Math.cos(a), p.cy + rr * Math.sin(a)];
  const a0 = ang(s) + 0.12, a1 = ang(s + 1) - 0.12, [lx, ly] = pt((a0 + a1) / 2, p.r + 46);
  return redArrow(pt(a0, p.r + 18), pt(a1, p.r + 18)) + redText(lx, ly + 8, t, 24);
}).join("");
/** Garis merah putus-putus antara label juring i dan juring di seberangnya. */
const across = (p: Pie, pairs: number) => Array.from({ length: pairs }, (_, i) => {
  const [x1, y1] = pieAt(p, "outer", i), [x2, y2] = pieAt(p, "outer", i + pairs), f = (t: number) => `${r1(x1 + (x2 - x1) * t)} ${r1(y1 + (y2 - y1) * t)}`;
  return `<path d="M${f(0.14)} L${f(0.86)}" stroke="#d32f2f" stroke-width="3" stroke-dasharray="8 6" fill="none"/>`;
}).join("");

// 51 R1 berseberangan: hasil kali pasangan yang berhadapan sama (72); jumlahnya tidak.
{
  const v = [6, 24, 4, 8, 12, 3, 18];
  const ans = 72 / v[3];
  for (let i = 0; i < 3; i++) assert.equal(v[i] * v[i + 4], 72);
  assert.equal(new Set([0, 1, 2].map((i) => v[i] + v[i + 4])).size, 3, "jumlah pasangan tidak boleh tetap");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...v, "?"] };
  bundar.push({ seq: 51, key: "B", instruksi: BUNDAR, svg: pieSvg([p]), choices: ["6", "9", "12", "16", "18"], answer: ans,
    psvg: solved([p], { ring: "outer", i: 7 }, ans, across(p, 4) + redText(W / 2, 322, "6 × 12 = 24 × 3 = 4 × 18 = 8 × 9 = 72", 26), 342),
    pembahasan: P2("Tidak ada pola jika dibaca berurutan, dan jumlah pasangan yang berhadapan juga tidak tetap (6 + 12 = 18, 24 + 3 = 27). Yang tetap adalah hasil kalinya: 6 × 12 = 72, 24 × 3 = 72, 4 × 18 = 72. Bilangan di hadapan 8 adalah 72 : 8 = 9.",
      "Opsi 6, 12, 16, dan 18 gugur karena hasil kalinya dengan 8 bukan 72 (8 × 6 = 48, 8 × 12 = 96, 8 × 16 = 128, 8 × 18 = 144); opsi 12 dan 18 hanya menyalin bilangan dari pasangan lain. Tips: jika jumlah pasangan yang berhadapan tidak tetap, langsung coba hasil kalinya. Jawaban: B.") });
}
// 52 R2 putaran: searah jarum jam mulai dari panah; selisihnya 3, 4, 7, 11, 18 (tiap selisih = jumlah dua selisih sebelumnya).
{
  const v = [2, 5, 9]; for (let i = 3; i < 6; i++) v.push(v[i - 1] + (v[i - 1] - v[i - 2]) + (v[i - 2] - v[i - 3]));
  assert.deepEqual(v, [2, 5, 9, 16, 27, 45]);
  const pa: Pie = { cx: 425, cy: 205, r: 125, outer: [...v.slice(0, 5), "?"] };
  bundar.push({ seq: 52, key: "D", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, svg: pieSvg([{ cx: 425, cy: 155, r: 125, outer: [...v.slice(0, 5), "?"], startArrow: true }]), choices: ["38", "43", "44", "45", "47"], answer: v[5],
    psvg: solved([pa], { ring: "outer", i: 5 }, v[5], steps(pa, ["+3", "+4", "+7", "+11", "+18"]) + redText(W / 2, 400, "selisih: 3 + 4 = 7, 4 + 7 = 11, 7 + 11 = 18", 26), 418),
    pembahasan: P2("Dibaca searah jarum jam mulai dari 2: 2, 5, 9, 16, 27. Selisihnya 3, 4, 7, 11; setiap selisih adalah jumlah dua selisih sebelumnya (3 + 4 = 7, 4 + 7 = 11), sehingga selisih berikutnya 7 + 11 = 18 dan 27 + 18 = 45. Cara lain: setiap bilangan = jumlah dua bilangan sebelumnya + 2 (16 + 27 + 2 = 45).",
      "Opsi 38 gugur karena hanya mengulang selisih 11. Opsi 43 gugur karena menjumlahkan dua bilangan terakhir tanpa + 2 (16 + 27). Opsi 44 gugur karena menambah 1, bukan 2 (16 + 27 + 1). Opsi 47 gugur karena selisihnya 20, bukan 7 + 11. Tips: jika selisihnya tidak tetap, cari hubungan antarselisih atau dengan dua bilangan sebelumnya. Jawaban: D.") });
}
// 53 R3 cincin: luar = (dalam juring itu)² + dalam juring berikutnya searah jarum jam.
{
  const inner = [2, 5, 3, 6], outer = inner.map((x, i) => x * x + inner[(i + 1) % 4]);
  assert.deepEqual(outer, [9, 28, 15, 38]);
  assert.notEqual(inner[0] ** 2 + inner[3], outer[0], "arah berlawanan tidak boleh ikut cocok");
  const pa: Pie = { cx: 250, cy: 150, r: 130, outer: [...outer.slice(0, 3), "?"], inner };
  bundar.push({ seq: 53, key: "C", instruksi: BUNDAR, svg: pieSvg([{ cx: 425, cy: 150, r: 130, outer: [...outer.slice(0, 3), "?"], inner }]), choices: ["36", "37", "38", "39", "42"], answer: outer[3],
    psvg: solved([pa], { ring: "outer", i: 3 }, outer[3], inner.map((x, i) => redText(470, 84 + 52 * i, `${x}² + ${inner[(i + 1) % 4]} = ${i === 3 ? "?" : outer[i]}`, 28, "start")).join(""), 300),
    pembahasan: P2("Bilangan cincin luar = kuadrat bilangan cincin dalam pada juring yang sama, ditambah bilangan cincin dalam pada juring berikutnya searah jarum jam: 2² + 5 = 9, 5² + 3 = 28, 3² + 6 = 15. Juring kiri: 6² + 2 (juring atas) = 38.",
      "Opsi 39 gugur karena memakai juring berlawanan arah (6² + 3), padahal arah itu tidak cocok untuk contoh (2² + 6 = 10, bukan 9). Opsi 36 gugur karena hanya mengkuadratkan (6²). Opsi 37 gugur karena menambah 1, bukan bilangan juring berikutnya. Opsi 42 gugur karena menambah bilangannya sendiri (6² + 6). Tips: uji aturan pada semua juring yang sudah terisi sebelum menghitung juring kosong. Jawaban: C.") });
}
// 54 R5 antar-lingkaran: pusat = atas × bawah − (kiri + kanan).
{
  const c = [[6, 4, 5, 3], [7, 9, 4, 2], [8, 5, 6, 7]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: t * b - (l + r) }));
  assert.deepEqual(c.map((x) => x.center), [23, 17, 36]);
  const pies = c.map((x, i): Pie => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: i === 2 ? "?" : x.center }));
  bundar.push({ seq: 54, key: "B", instruksi: BUNDAR, svg: pieSvg(pies, 290), choices: ["34", "36", "38", "41", "60"], answer: c[2].center,
    psvg: solved(pies, { ring: "center", pie: 2 }, c[2].center, c.map(({ v: [t, r, b, l], center }, i) => redText(155 + i * 270, 300, `${t}×${b} − (${l}+${r}) = ${center}`, 24)).join(""), 316),
    pembahasan: P2("Bilangan di pusat = (atas × bawah) − (kiri + kanan). Lingkaran 1: 6 × 5 − (3 + 4) = 23. Lingkaran 2: 7 × 4 − (2 + 9) = 17. Lingkaran 3: 8 × 6 − (7 + 5) = 36.",
      "Opsi 60 gugur karena kiri dan kanan ditambahkan, bukan dikurangkan (48 + 12). Opsi 41 gugur karena hanya mengurangkan kiri (48 − 7). Opsi 34 dan 38 gugur karena 48 dikurangi 14 dan 10, padahal kiri + kanan = 7 + 5 = 12. Tips: pastikan rumus cocok di dua lingkaran contoh sebelum dipakai pada lingkaran ketiga. Jawaban: B.") });
}
// 55 huruf (a): angka di hadapan huruf = urutan × (urutan − 1).
{
  const letters = ["B", "E", "H", "K"], val = (ch: string) => ch.charCodeAt(0) - 64;
  const nums = letters.map((l) => val(l) * (val(l) - 1));
  assert.deepEqual(nums, [2, 20, 56, 110]);
  const pa: Pie = { cx: 230, cy: 150, r: 130, outer: [...letters, ...nums.slice(0, 3), "?"] };
  bundar.push({ seq: 55, key: "C", instruksi: BUNDAR_HURUF, svg: pieSvg([{ cx: 425, cy: 150, r: 130, outer: [...letters, ...nums.slice(0, 3), "?"] }]), choices: ["99", "100", "110", "121", "132"], answer: nums[3],
    psvg: solved([pa], { ring: "outer", i: 7 }, nums[3], across(pa, 4) + letters.map((l, i) => redText(420, 84 + 52 * i, `${l} = ${val(l)} → ${val(l)} × ${val(l) - 1} = ${i === 3 ? "?" : nums[i]}`, 28, "start")).join(""), 300),
    pembahasan: P2("Ubah huruf menjadi urutannya: B = 2, E = 5, H = 8, K = 11. Pasangan yang berhadapan: 2 ↔ 2, 5 ↔ 20, 8 ↔ 56. Aturannya angka = urutan × (urutan − 1): 2 × 1 = 2, 5 × 4 = 20, 8 × 7 = 56. Untuk K: 11 × 10 = 110.",
      "Opsi 121 gugur karena hanya mengkuadratkan (11 × 11). Opsi 132 gugur karena memakai 11 × 12. Opsi 99 gugur karena memakai 11 × 9. Opsi 100 gugur karena memakai 10 × 10. Tips: tulis dulu nilai setiap huruf di samping gambar, baru cari hubungannya dengan angka di seberangnya. Jawaban: C.") });
}
// 56 huruf (b): huruf dan angka berselang-seling, nilainya 1, 3, 6, 10, 15, 21 (+2, +3, ...).
{
  const vals = [1, 3, 6, 10, 15, 21];
  const shown = vals.map((v, i) => (i % 2 === 0 ? String.fromCharCode(64 + v) : v));
  assert.deepEqual(shown.slice(0, 5), ["A", 3, "F", 10, "O"]);
  const pa: Pie = { cx: 425, cy: 205, r: 125, outer: [...shown.slice(0, 5), "?"] };
  bundar.push({ seq: 56, key: "C", instruksi: "Bilangan dan huruf dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR_HURUF, svg: pieSvg([{ cx: 425, cy: 155, r: 125, outer: [...shown.slice(0, 5), "?"], startArrow: true }]), choices: ["19", "20", "21", "22", "25"], answer: vals[5],
    psvg: solved([pa], { ring: "outer", i: 5 }, vals[5], steps(pa, ["+2", "+3", "+4", "+5", "+6"]) + redText(W / 2, 400, "A = 1, F = 6, O = 15", 26), 418),
    pembahasan: P2("Ubah huruf menjadi urutannya: A = 1, F = 6, O = 15. Deretnya menjadi 1, 3, 6, 10, 15, ? dengan selisih +2, +3, +4, +5, sehingga berikutnya +6: 15 + 6 = 21. Posisi tanda tanya diisi angka karena huruf dan angka berselang-seling.",
      "Opsi 19, 20, dan 22 gugur karena memakai selisih +4, +5, dan +7, padahal selisih harus naik satu menjadi +6. Opsi 25 gugur karena menjumlahkan dua bilangan sebelumnya (10 + 15). Tips: ubah semua huruf menjadi angka dulu supaya deretnya terbaca utuh. Jawaban: C.") });
}

// ── susun output ────────────────────────────────────────────────────────────
// 3 = HOTS (≥ 2 aturan bersamaan / aturan tidak langsung), 2 = sedang. Tidak ada soal mudah.
const HOTS = new Set([26, 27, 28, 29, 31, 32, 33, 38, 39, 51, 52, 53, 54, 55, 56]);
type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: null; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: Key; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: Key };
  pembahasan: string;
  pembahasan_svg: string;
  tingkat: 2 | 3;
};
const rows: Row[] = [
  ...items.map((it): Row => ({
    sequence_number: it.seq,
    options_payload: { instruksi: it.instruksi, question_text: null, sub_text: null, is_multi_select: false, svg_content: it.svg, choices: KEYS.map((key, i) => ({ key, text: "abcde"[i] })) },
    scoring_rule: { type: "dichotomous", correct_key: it.key },
    pembahasan: it.pembahasan,
    pembahasan_svg: it.psvg,
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
      pembahasan_svg: b.psvg,
      tingkat: HOTS.has(b.seq) ? 3 : 2,
    };
  }),
].sort((a, b) => a.sequence_number - b.sequence_number);

assert.deepEqual(rows.map((r) => r.sequence_number), [26, 27, 28, 29, 30, 31, 32, 33, 34, 38, 39, 51, 52, 53, 54, 55, 56]);
const allIds = rows.flatMap((r) => [...r.options_payload.svg_content.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
assert.equal(new Set(allIds).size, allIds.length, "id SVG harus unik antar soal");
for (const r of rows) assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(r.options_payload.svg_content), `SVG ${r.sequence_number} tidak aman`);
for (const it of items) assert.match(it.pembahasan, new RegExp(`Jawaban: ${it.key.toLowerCase()}\\.$`), `${it.seq}: pembahasan tidak menyebut kunci`);
for (const r of rows) {
  assert.match(r.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+ Tips: [^\\n]+ Jawaban: ${r.scoring_rule.correct_key}\\.$`, "i"), `${r.sequence_number}: pembahasan harus 2 paragraf + tips + kunci`);
  assert.ok(!/<(?:script|image|style)\b|href=|\bid="/.test(r.pembahasan_svg), `pembahasan_svg ${r.sequence_number} memakai id/elemen tidak aman`);
}

const root = path.join(__dirname, "..");
fs.writeFileSync(path.join(root, "prisma/data/kecerdasan_s2_figural.json"), `${JSON.stringify(rows, null, 2)}\n`);
fs.mkdirSync(path.join(root, "output"), { recursive: true });
fs.writeFileSync(path.join(root, "output/figural-s2-preview.html"),
  `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Figural S2</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;max-width:900px}section{border:1px solid #aaa;margin:16px 0;padding:12px}svg{display:block;max-width:100%;height:auto}p{font-size:13px;line-height:1.5}</style><body>` +
  rows.map((r) => `<section><h3>Soal ${r.sequence_number} — kunci ${r.scoring_rule.correct_key}</h3><p><b>${r.options_payload.instruksi}</b></p>${r.options_payload.svg_content}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p>${r.pembahasan_svg}<p>${r.pembahasan.replace("\n\n", "<br><br>")}</p></section>`).join("") +
  `</body></html>`);
console.log(`OK: ${rows.length} soal figural/bundar → prisma/data/kecerdasan_s2_figural.json`);
