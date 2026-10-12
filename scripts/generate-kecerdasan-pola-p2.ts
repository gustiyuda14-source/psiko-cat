import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// 8 soal "pola gambar" Paket latihan Kecerdasan (package_number 2), nomor 26,
// 27, 28, 31, 32, 33, 35, 36 mengikuti tipe di FILE PSIKO POLRI 2026/KECRDASAN 2024.pdf.
// Tiap soal: gambar pola di atas + 5 kotak pilihan a-e di bawah, satu SVG.
//   npx tsx scripts/generate-kecerdasan-pola-p2.ts
// Output: prisma/data/kecerdasan_p2_pola.json + output/pola-p2-preview.html

const INK = "#111";
const W = 850;
const BOX = 96;
const box = (cx: number, cy: number, s = BOX) =>
  `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" fill="white" stroke="${INK}" stroke-width="3"/>`;
const qmark = (cx: number, cy: number) =>
  `<text x="${cx}" y="${cy + 14}" font-family="sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="${INK}">?</text>`;
const label = (cx: number, y: number, t: string) =>
  `<text x="${cx}" y="${y}" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="${INK}">${t}</text>`;

type Draw = (cx: number, cy: number) => string;

// Kotak pola: matriks 3x3 (null = "?") atau deret satu baris.
function layout(grid: (Draw | null)[][], options: Draw[]) {
  const rows = grid.length, cols = grid[0].length, step = BOX + 12;
  const left = (W - (cols - 1) * step) / 2, top = 20 + BOX / 2;
  let out = "";
  grid.forEach((row, r) => row.forEach((d, c) => {
    const cx = left + c * step, cy = top + r * step;
    out += box(cx, cy) + (d ? d(cx, cy) : qmark(cx, cy));
  }));
  const oy = top + rows * step + 30, ostep = 160, oleft = (W - 4 * ostep) / 2;
  options.forEach((d, i) => {
    const cx = oleft + i * ostep;
    out += box(cx, oy) + d(cx, oy) + label(cx, oy + BOX / 2 + 28, "abcde"[i]);
  });
  const h = oy + BOX / 2 + 40;
  return `<svg viewBox="0 0 ${W} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${out}</svg>`;
}

// ── 26: kuadran hitam, kolom 3 = kolom 1 XOR kolom 2 ─────────────────────────
// bit: TL, TR, BL, BR
const quad = (bits: string): Draw => (cx, cy) => {
  const h = BOX / 2 - 1.5, pos = [[-h, -h], [0, -h], [-h, 0], [0, 0]];
  return [...bits].map((b, i) => b === "1" ? `<rect x="${cx + pos[i][0]}" y="${cy + pos[i][1]}" width="${h}" height="${h}" fill="${INK}"/>` : "").join("") +
    `<line x1="${cx}" y1="${cy - h}" x2="${cx}" y2="${cy + h}" stroke="${INK}" stroke-width="1" stroke-dasharray="3 3"/>` +
    `<line x1="${cx - h}" y1="${cy}" x2="${cx + h}" y2="${cy}" stroke="${INK}" stroke-width="1" stroke-dasharray="3 3"/>`;
};
const xor = (a: string, b: string) => [...a].map((x, i) => (x === b[i] ? "0" : "1")).join("");
const q26rows = [["1000", "0100"], ["1010", "0011"], ["0110", "1100"]];
const q26 = { seq: 26, key: "D", svg: layout(
  q26rows.map(([a, b], r) => [quad(a), quad(b), r < 2 ? quad(xor(a, b)) : null]),
  ["0110", "1110", "0100", "1010", "0101"].map(quad),
), answer: xor("0110", "1100") };
assert.equal(q26.answer, "1010");

// ── 27: jumlah sisi +1, warna hitam/putih bergantian ─────────────────────────
const poly = (n: number, fill: boolean, r = 38): Draw => (cx, cy) => {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + 4 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="${fill ? INK : "white"}" stroke="${INK}" stroke-width="3"/>`;
};
const q27 = { seq: 27, key: "B", svg: layout(
  [[poly(3, true), poly(4, false), poly(5, true), poly(6, false), null]],
  [poly(7, false), poly(7, true), poly(6, true), poly(8, true), poly(8, false)],
) };

// ── 28: baris 3 = gabungan baris 1 (lingkaran) + baris 2 (garis) ────────────
type Part = "\\" | "/" | "H" | "V" | `o${"C" | "TL" | "TR" | "BL" | "BR"}`;
const parts = (ps: Part[]): Draw => (cx, cy) => {
  const h = BOX / 2 - 1.5, off = 24;
  return ps.map((p) => {
    if (p === "\\") return `<line x1="${cx - h}" y1="${cy - h}" x2="${cx + h}" y2="${cy + h}" stroke="${INK}" stroke-width="4"/>`;
    if (p === "/") return `<line x1="${cx - h}" y1="${cy + h}" x2="${cx + h}" y2="${cy - h}" stroke="${INK}" stroke-width="4"/>`;
    if (p === "H") return `<line x1="${cx - h}" y1="${cy}" x2="${cx + h}" y2="${cy}" stroke="${INK}" stroke-width="4"/>`;
    if (p === "V") return `<line x1="${cx}" y1="${cy - h}" x2="${cx}" y2="${cy + h}" stroke="${INK}" stroke-width="4"/>`;
    const [dx, dy] = { oC: [0, 0], oTL: [-off, -off], oTR: [off, -off], oBL: [-off, off], oBR: [off, off] }[p];
    return `<circle cx="${cx + dx}" cy="${cy + dy}" r="12" fill="${INK}"/>`;
  }).join("");
};
const q28 = { seq: 28, key: "E", svg: layout(
  [
    [parts(["oC"]), parts(["oBL"]), parts(["oTR"])],
    [parts(["\\"]), parts(["H"]), parts(["V"])],
    [parts(["\\", "oC"]), parts(["H", "oBL"]), null],
  ],
  [parts(["V", "oTL"]), parts(["H", "oTR"]), parts(["/", "oTR"]), parts(["V"]), parts(["V", "oTR"])],
) };

// ── 31: tanda x/o di kuadran tanda tambah, berputar searah jarum jam ────────
type Marks = { x: number[]; o: number[] };
const rot = (m: Marks): Marks => ({ x: m.x.map((q) => (q + 1) % 4), o: m.o.map((q) => (q + 1) % 4) });
const cross = (m: Marks): Draw => (cx, cy) => {
  const h = BOX / 2 - 12, d = 20, at = [[-d, -d], [d, -d], [d, d], [-d, d]]; // TL, TR, BR, BL
  let s = `<line x1="${cx - h}" y1="${cy}" x2="${cx + h}" y2="${cy}" stroke="${INK}" stroke-width="2"/><line x1="${cx}" y1="${cy - h}" x2="${cx}" y2="${cy + h}" stroke="${INK}" stroke-width="2"/>`;
  for (const q of m.x) { const [x, y] = at[q]; s += `<path d="M${cx + x - 8} ${cy + y - 8}L${cx + x + 8} ${cy + y + 8}M${cx + x + 8} ${cy + y - 8}L${cx + x - 8} ${cy + y + 8}" stroke="${INK}" stroke-width="3"/>`; }
  for (const q of m.o) { const [x, y] = at[q]; s += `<circle cx="${cx + x}" cy="${cy + y}" r="8" fill="none" stroke="${INK}" stroke-width="3"/>`; }
  return s;
};
const q31start: Marks[] = [{ x: [0], o: [] }, { x: [3], o: [1] }, { x: [0, 1], o: [2] }];
const q31answer = rot(rot(q31start[2]));
assert.deepEqual(q31answer, { x: [2, 3], o: [0] });
const q31 = { seq: 31, key: "A", svg: layout(
  q31start.map((m, r) => [cross(m), cross(rot(m)), r < 2 ? cross(rot(rot(m))) : null]),
  [q31answer, { x: [3, 0], o: [1] }, { x: [2, 3], o: [1] }, { x: [1, 2], o: [0] }, { x: [2, 3], o: [] }].map(cross),
) };

// ── 32: tiga bangun bersarang bergeser ke dalam, warna berselang tiap langkah ─
type Shape = "sq" | "ci" | "tr";
const INRADIUS = { sq: Math.SQRT1_2, ci: 1, tr: 0.5 };
const shape = (s: Shape, cx: number, cy: number, r: number, fill: boolean) => {
  const f = `fill="${fill ? INK : "white"}" stroke="${INK}" stroke-width="3"`;
  if (s === "ci") return `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" ${f}/>`;
  const n = s === "sq" ? 4 : 3, a0 = s === "sq" ? -Math.PI / 4 : -Math.PI / 2;
  const pts = Array.from({ length: n }, (_, i) => `${(cx + r * Math.cos(a0 + (2 * Math.PI * i) / n)).toFixed(1)},${(cy + r * Math.sin(a0 + (2 * Math.PI * i) / n)).toFixed(1)}`).join(" ");
  return `<polygon points="${pts}" ${f}/>`;
};
const nest = (shapes: Shape[], fills: boolean[]): Draw => (cx, cy) => {
  // Semua bangun sepusat; kalau terluar segitiga, pusatnya diturunkan supaya segitiga terpusat di kotak.
  let r = shapes[0] === "tr" ? 46 : 42, s = "";
  const y = shapes[0] === "tr" ? cy + r * 0.22 : cy;
  shapes.forEach((sh, i) => {
    s += shape(sh, cx, y, r, fills[i]);
    r = r * INRADIUS[sh] * 0.92;
  });
  return s;
};
const WBW = [false, true, false], BWB = [true, false, true];
const q32 = { seq: 32, key: "C", svg: layout(
  [[nest(["sq", "ci", "tr"], WBW), nest(["tr", "sq", "ci"], BWB), nest(["ci", "tr", "sq"], WBW), null]],
  [nest(["sq", "ci", "tr"], WBW), nest(["tr", "sq", "ci"], BWB), nest(["sq", "ci", "tr"], BWB), nest(["sq", "tr", "ci"], BWB), nest(["ci", "tr", "sq"], BWB)],
) };

// ── 33: kolom 4 sel; bulatan turun 1 sel, segitiga naik 1 sel (berputar) ────
const column = (dot: number, tri: number): Draw => (cx, cy) => {
  const cw = 34, ch = 21, top = cy - 2 * ch;
  let s = "";
  for (let i = 0; i < 4; i++) s += `<rect x="${cx - cw / 2}" y="${top + i * ch}" width="${cw}" height="${ch}" fill="white" stroke="${INK}" stroke-width="2"/>`;
  s += `<circle cx="${cx}" cy="${top + dot * ch + ch / 2}" r="7" fill="${INK}"/>`;
  const ty = top + tri * ch + ch / 2;
  s += `<polygon points="${cx},${ty - 7} ${cx + 8},${ty + 6} ${cx - 8},${ty + 6}" fill="white" stroke="${INK}" stroke-width="2"/>`;
  return s;
};
const frame33 = (k: number): [number, number] => [k % 4, (3 - (k % 4) + 4) % 4];
for (let k = 0; k < 7; k++) assert.notEqual(frame33(k)[0], frame33(k)[1]); // tidak pernah satu sel
const q33 = { seq: 33, key: "D", svg: layout(
  [[...Array.from({ length: 6 }, (_, k) => column(...frame33(k))), null]],
  [column(1, 2), column(3, 0), column(3, 1), column(...frame33(6)), column(2, 0)],
) };
assert.deepEqual(frame33(6), [2, 1]);

// ── 35: tiga lingkaran segaris berputar 45°, yang hitam bergeser A→tengah→B→tengah ─
const stick = (deg: number, filled: 0 | 1 | 2): Draw => (cx, cy) => {
  const a = (deg * Math.PI) / 180, r = 30, pts = [[r, 0], [0, 0], [-r, 0]].map(([x]) => [cx + x * Math.cos(a), cy + x * Math.sin(a)]);
  let s = `<line x1="${pts[0][0].toFixed(1)}" y1="${pts[0][1].toFixed(1)}" x2="${pts[2][0].toFixed(1)}" y2="${pts[2][1].toFixed(1)}" stroke="${INK}" stroke-width="3"/>`;
  pts.forEach(([x, y], i) => { s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${i === filled ? INK : "white"}" stroke="${INK}" stroke-width="2.5"/>`; });
  return s;
};
const filled35 = [0, 1, 2, 1, 0] as const;
const q35 = { seq: 35, key: "B", svg: layout(
  [[0, 1, 2, 3].map((k) => stick(45 * k, filled35[k])).concat([null as unknown as Draw])],
  [stick(0, 0), stick(180, 0), stick(180, 1), stick(135, 0), stick(90, 0)],
) };
// Kunci: 180° dengan ujung A (indeks 0) hitam = lingkaran hitam di kiri, beda dari pilihan a (hitam di kanan).

// ── 36: kolom 3 = unsur yang hanya ada di salah satu kolom 1/kolom 2 ─────────
const sym = (a: Part[], b: Part[]) => [...a.filter((p) => !b.includes(p)), ...b.filter((p) => !a.includes(p))];
const q36rows: [Part[], Part[]][] = [[["\\", "H"], ["H", "V"]], [["/", "V", "oTL"], ["V", "\\"]], [["H", "/", "oBR"], ["/", "\\", "oBR"]]];
const q36answer = sym(...q36rows[2]);
assert.deepEqual(q36answer.sort(), ["H", "\\"].sort());
const q36 = { seq: 36, key: "E", svg: layout(
  q36rows.map(([a, b], r) => [parts(a), parts(b), r < 2 ? parts(sym(a, b)) : null]),
  [parts(["H", "/", "\\", "oBR"]), parts(["H", "\\", "oBR"]), parts(["/"]), parts(["H", "/"]), parts(["H", "\\"])],
) };

const items = [q26, q27, q28, q31, q32, q33, q35, q36].map((q) => ({
  sequence_number: q.seq,
  options_payload: {
    instruksi: "Pilihlah satu gambar untuk melengkapi pola di bawah ini.",
    question_text: null, sub_text: null, is_multi_select: false, svg_content: q.svg,
    choices: ["A", "B", "C", "D", "E"].map((k) => ({ key: k, text: k.toLowerCase() })),
  },
  scoring_rule: { type: "dichotomous", correct_key: q.key },
}));

for (const it of items) {
  assert.ok(!/<script|<image|href=|<style|\bid=/.test(it.options_payload.svg_content), `soal ${it.sequence_number}: SVG harus polos`);
  assert.equal((it.options_payload.svg_content.match(/<rect x=/g) ?? []).length >= 9, true);
}
// ── Pembahasan (2 paragraf + gambar) untuk butir yang masih aktif di pkg 2 (seed-kecerdasan-kal.ts MOVES[2]) ──
// Gambar: pola lengkap, jawaban mengisi kotak "?" berbingkai hijau, anotasi merah; tanpa id. Kotak besar supaya terbaca di HP.
const HL = "#1a7f37", RED = "#d32f2f";
const redT = (x: number, y: number, t: string, size = 26) =>
  `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="bold" text-anchor="middle" fill="${RED}">${t}</text>`;
const ring = ([x, y]: number[], r: number) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${RED}" stroke-width="4"/>`;
type At = (r: number, c: number) => [number, number];
type Pb = { grid: Draw[][]; hl: [number, number]; foot: string[]; ann?: (at: At, k: number, size: number) => string; pad?: number; pb: string };
function pbLayout({ grid, hl, foot, ann = () => "", pad = 0 }: Pb) {
  const rows = grid.length, cols = grid[0].length, size = Math.min(150, Math.floor((W - 20) / cols) - 14), step = size + 14, k = size / BOX;
  const left = (W - (cols - 1) * step) / 2, top = 16 + size / 2;
  const at: At = (r, c) => [left + c * step, top + r * step];
  let out = "";
  grid.forEach((row, r) => row.forEach((d, c) => {
    const [cx, cy] = at(r, c), h = hl[0] === r && hl[1] === c;
    out += `<rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" fill="white" stroke="${h ? HL : INK}" stroke-width="${h ? 8 : 3}"/>` +
      `<g transform="translate(${cx} ${cy}) scale(${k.toFixed(3)})">${d(0, 0)}</g>`;
  }));
  out += ann(at, k, size);
  const y0 = top + (rows - 1) * step + size / 2 + 44 + pad;
  out += foot.map((t, i) => redT(W / 2, y0 + 34 * i, t)).join("");
  const h = y0 + 34 * (foot.length - 1) + 18;
  return `<svg viewBox="0 0 ${W} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${out}</svg>`;
}
const qd = BOX / 4 - 0.75; // pusat kuadran pada kotak quad()
const PBS: Record<number, Pb> = {
  26: {
    grid: q26rows.map(([a, b]) => [quad(a), quad(b), quad(xor(a, b))]), hl: [2, 2], foot: ["Kolom 3 = kuadran yang hitam di SALAH SATU kolom", "Hitam di kedua kolom (lingkar merah) → putih"],
    ann: (at, k) => [0, 1, 2].map((c) => ring([at(2, c)[0] + qd * k, at(2, c)[1] - qd * k], 21 * k)).join(""),
    pb: "Kolom ketiga adalah gabungan kolom pertama dan kedua, tetapi kuadran yang hitam di keduanya menjadi putih (hanya kuadran yang hitam di salah satu kolom yang tetap hitam). Baris 3: kolom 1 hitam di kanan atas dan kiri bawah, kolom 2 hitam di kiri atas dan kanan atas. Kanan atas hitam di keduanya sehingga hilang, tersisa kiri atas dan kiri bawah.\n\n" +
      "Pilihan a hanya menyalin kolom 1. Pilihan b menggabungkan semua kuadran, jadi kanan atas yang hitam di keduanya masih hitam. Pilihan c justru hanya menyisakan kanan atas, kuadran yang seharusnya hilang. Pilihan e menghitamkan kanan atas dan kanan bawah, padahal kanan bawah tidak hitam di kolom mana pun. Tips: bandingkan kuadran satu per satu, hitam + hitam = putih. Jawaban: d.",
  },
  31: {
    grid: q31start.map((m) => [cross(m), cross(rot(m)), cross(rot(rot(m)))]), hl: [2, 2], foot: ["Tiap kolom: semua tanda berputar 1 kuadran", "searah jarum jam (lingkar merah = lingkaran)"],
    ann: (at, k) => [[20, 20], [-20, 20], [-20, -20]].map(([x, y], c) => ring([at(2, c)[0] + x * k, at(2, c)[1] + y * k], 15 * k)).join(""),
    pb: "Pada setiap baris, semua tanda (silang dan lingkaran) berputar satu kuadran searah jarum jam dari kolom ke kolom. Baris 3 kolom 1: silang di kiri atas dan kanan atas, lingkaran di kanan bawah. Diputar dua kali (kolom 3): silang pindah ke kanan bawah dan kiri bawah, lingkaran ke kiri atas.\n\n" +
      "Pilihan b diputar berlawanan arah jarum jam (silang di kiri bawah dan kiri atas, lingkaran di kanan atas). Pilihan c silangnya benar, tetapi lingkarannya di kanan atas. Pilihan d silangnya baru diputar sekali (kanan atas dan kanan bawah). Pilihan e tidak punya lingkaran. Tips: lacak satu tanda yang jumlahnya sedikit (lingkaran) lebih dulu. Jawaban: a.",
  },
  32: {
    grid: [[nest(["sq", "ci", "tr"], WBW), nest(["tr", "sq", "ci"], BWB), nest(["ci", "tr", "sq"], WBW), nest(["sq", "ci", "tr"], BWB)]], hl: [0, 3], pad: 56, foot: ["Bangun terdalam pindah menjadi terluar,", "warna luar berselang putih/hitam"],
    ann: (at, _k, size) => [["persegi", "putih"], ["segitiga", "hitam"], ["lingkaran", "putih"], ["persegi", "hitam"]].map(([a, b], c) => redT(at(0, c)[0], at(0, c)[1] + size / 2 + 28, a, 22) + redT(at(0, c)[0], at(0, c)[1] + size / 2 + 54, b, 22)).join(""),
    pb: "Tiga bangun sepusat. Setiap langkah, bangun paling dalam pindah menjadi paling luar: persegi–lingkaran–segitiga → segitiga–persegi–lingkaran → lingkaran–segitiga–persegi, sehingga gambar ke-4 kembali persegi–lingkaran–segitiga. Warna berselang tiap langkah: putih–hitam–putih, lalu hitam–putih–hitam, dan seterusnya. Gambar ke-4 berwarna hitam–putih–hitam (persegi hitam, lingkaran putih, segitiga hitam).\n\n" +
      "Pilihan a susunannya sama tetapi warnanya salah (putih–hitam–putih). Pilihan b mengulang gambar ke-2. Pilihan d menukar lingkaran dan segitiga di dalam persegi. Pilihan e memakai susunan gambar ke-3. Tips: cek susunan bangun dulu, baru warnanya. Jawaban: c.",
  },
  33: {
    grid: [Array.from({ length: 7 }, (_, k) => column(...frame33(k)))], hl: [0, 6], pad: 30, foot: ["Bulatan turun 1 sel, segitiga naik 1 sel", "Gambar ke-7: bulatan sel 3, segitiga sel 2"],
    ann: (at, _k, size) => Array.from({ length: 7 }, (_, c) => redT(at(0, c)[0], at(0, c)[1] + size / 2 + 28, `ke-${c + 1}`, 22)).join(""),
    pb: "Tiap kotak berisi kolom 4 sel. Bulatan hitam turun satu sel setiap langkah (setelah sel paling bawah kembali ke atas), sedangkan segitiga naik satu sel (setelah paling atas kembali ke bawah). Gambar ke-6: bulatan di sel ke-2 dan segitiga di sel ke-3 dari atas. Gambar ke-7: bulatan di sel ke-3 dan segitiga di sel ke-2 dari atas.\n\n" +
      "Pilihan a sama dengan gambar ke-6 (belum bergeser). Pilihan b menggeser keduanya dua langkah (bulatan sel 4, segitiga sel 1). Pilihan c bulatannya turun dua sel ke sel 4. Pilihan e segitiganya naik dua sel ke sel 1. Tips: lacak bulatan dan segitiga terpisah, satu langkah saja dari gambar terakhir. Jawaban: d.",
  },
  36: {
    grid: q36rows.map(([a, b]) => [parts(a), parts(b), parts(sym(a, b))]), hl: [2, 2], foot: ["Kolom 3 = unsur yang hanya ada di SATU kolom", "Garis / dan bulatan ada di keduanya → dibuang"],
    ann: (at, k) => [0, 1].map((c) => ring([at(2, c)[0] + 24 * k, at(2, c)[1] + 24 * k], 19 * k)).join(""),
    pb: "Kolom ketiga hanya memuat unsur yang ada di salah satu kolom (pertama atau kedua). Unsur yang ada di keduanya dibuang. Baris 3: kolom 1 = garis mendatar, garis miring /, bulatan kanan bawah. Kolom 2 = garis miring /, garis miring \\, bulatan kanan bawah. Garis / dan bulatan ada di keduanya sehingga dibuang, tersisa garis mendatar dan garis miring \\.\n\n" +
      "Pilihan a menggabungkan semua unsur tanpa membuang yang sama. Pilihan b masih memuat bulatan. Pilihan c hanya berisi garis /, padahal garis itu ada di keduanya. Pilihan d memuat garis / dan kehilangan garis \\. Tips: coret unsur yang muncul di kedua kolom, sisanya adalah jawaban. Jawaban: e.",
  },
};
const OPTS: Record<number, Draw> = { 26: quad("1010"), 31: cross({ x: [2, 3], o: [0] }), 32: nest(["sq", "ci", "tr"], BWB), 33: column(...frame33(6)), 36: parts(["H", "\\"]) };
const PB: Record<number, { pb: string; svg: string }> = {};
for (const [seq, p] of Object.entries(PBS)) {
  assert.equal(p.grid[p.hl[0]][p.hl[1]](0, 0), OPTS[+seq](0, 0), `soal ${seq}: isi gambar pembahasan ≠ pilihan kunci`);
  PB[+seq] = { pb: p.pb, svg: pbLayout(p) };
  assert.match(p.pb, /^[^\n]+\n\n[^\n]+ Jawaban: [a-e]\.$/, `soal ${seq}: pembahasan harus 2 paragraf`);
  assert.equal(p.pb.slice(-2, -1).toUpperCase(), items.find((it) => it.sequence_number === +seq)!.scoring_rule.correct_key, `soal ${seq}: pembahasan ≠ kunci`);
  assert.ok(!/\bid=|<(?:script|image|style)\b|href=/.test(PB[+seq].svg), `soal ${seq}: pembahasan_svg tidak polos`);
}

// Augment: soal di file sudah live, jadi tidak ditulis ulang. Pertanyaan hasil generator wajib identik dengan file,
// lalu hanya `pembahasan` + `pembahasan_svg` yang dipasang. Butir lain disalin apa adanya.
const root = path.join(__dirname, "..");
const file = path.join(root, "prisma/data/kecerdasan_p2_pola.json");
type Stored = (typeof items)[number] & { pembahasan?: string; pembahasan_svg?: string };
const prev = JSON.parse(fs.readFileSync(file, "utf8")) as Stored[];
const strip = ({ pembahasan: _p, pembahasan_svg: _s, ...q }: Stored) => q;
assert.equal(JSON.stringify(prev.map(strip)), JSON.stringify(items), "soal di generator ≠ soal di file; jangan regenerate soal live");
fs.writeFileSync(file, JSON.stringify(prev.map((r) => (PB[r.sequence_number] ? { ...strip(r), pembahasan: PB[r.sequence_number].pb, pembahasan_svg: PB[r.sequence_number].svg } : r)), null, 1));
fs.mkdirSync(path.join(root, "output"), { recursive: true });
fs.writeFileSync(path.join(root, "output/pola-p2-preview.html"),
  `<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;max-width:900px;margin:auto">` +
  items.map((it) => `<h3>Soal ${it.sequence_number} — kunci ${it.scoring_rule.correct_key}</h3><div style="border:1px solid #ccc">${it.options_payload.svg_content}</div>` +
    (PB[it.sequence_number] ? `<h4>Pembahasan</h4><div style="border:1px solid #ccc;max-width:600px">${PB[it.sequence_number].svg}</div><p style="white-space:pre-line">${PB[it.sequence_number].pb}</p>` : "")).join(""));
console.log(`OK: ${items.length} soal pola → prisma/data/kecerdasan_p2_pola.json`);
