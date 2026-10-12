import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, HL, KEYS, type Key, type Pie, type Pt, pie, pieAt, r1, redArrow, redRing, redText, svgWrap } from "./figural-lib";

// Pola bundar Simulasi Paket 3 (package_number 15), nomor 51-56. Aturan berbeda dari pkg 3 dan s2:
// 51 R1 jumlah berseberangan, 52 R2 putaran +3/×2, 53 R3 cincin pangkat tiga − 1, 54 R5 perkalian silang,
// 55 huruf (a) luar = huruf + huruf berikutnya, 56 huruf (b) lompatan bertambah dengan kembali ke A.
// Kunci dihitung dari aturan. Gambar pembahasan: "?" terisi (hijau) + anotasi merah, tanpa id.

export type Bundar15 = { pkg: 15; seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR15_ITEMS: Bundar15[] = [];
const P = "kal15b-ah-";
type Slot = { ring: "outer" | "inner" | "center"; i?: number; pie?: number };
/** Soal (dengan "?") dan gambar pembahasan (slot "?" diisi jawaban hijau + lingkaran hijau) dari pie yang sama. */
function build(pies: Pie[], h: number, slot: Slot, answer: string | number, ann: string, hp = h) {
  const k = slot.pie ?? 0, set = (p: Pie, v: string | number): Pie =>
    slot.ring === "center" ? { ...p, center: v } : slot.ring === "inner" ? { ...p, inner: p.inner!.map((x, j) => (j === slot.i ? v : x)) } : { ...p, outer: p.outer.map((x, j) => (j === slot.i ? v : x)) };
  const q = pies.map((p, j) => (j === k ? set(p, "?") : p)), a = pies.map((p, j) => ({ ...(j === k ? set(p, "") : p), startArrow: false }));
  const [x, y] = pieAt(pies[k], slot.ring, slot.i), fs = pies[k].r > 90 ? 26 : 22;
  const label = `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fs + 2}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${HL}">${answer}</text>`;
  return { svg: svgWrap(h, q.map((p) => pie({ ...p, idPrefix: P })).join("")), pembahasan_svg: svgWrap(hp, a.map((p) => pie(p)).join("") + redRing(x, y, fs + Math.max(0, String(answer).length - 2) * 9, HL) + label + ann) };
}
const push = (it: Omit<Bundar15, "pkg" | "svg" | "pembahasan_svg">, b: { svg: string; pembahasan_svg: string }, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar15 ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.equal(new Set(it.choices).size, 5, `bundar15 ${it.seq}: pilihan kembar`);
  assert.match(it.pembahasan, new RegExp(`\\n\\n.*Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar15 ${it.seq}: pembahasan 2 paragraf + kunci`);
  BUNDAR15_ITEMS.push({ pkg: 15, ...it, ...b });
};
const val = (ch: string) => ch.charCodeAt(0) - 64;
/** Panah merah antarjuring di luar lingkaran (searah jarum jam) dengan label langkah. */
const steps = (p: Pie, labels: string[], from = 0) => labels.map((t, s) => {
  const n = p.outer.length, ang = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180, R = p.r + 18;
  const pt = (a: number, rr: number): Pt => [p.cx + rr * Math.cos(a), p.cy + rr * Math.sin(a)];
  const a0 = ang(from + s) + 0.12, a1 = ang(from + s + 1) - 0.12, am = (a0 + a1) / 2, [lx, ly] = pt(am, p.r + 46);
  return redArrow(pt(a0, R), pt(a1, R)) + redText(lx, ly + 8, t, 24);
}).join("");

// 51 R1 berseberangan (sedang): pasangan yang berhadapan berjumlah 25.
{
  const a = [6, 11, 4, 9], b = a.map((x) => 25 - x);
  assert.deepEqual(b, [19, 14, 21, 16]);
  assert.notEqual(a[1] * 3 + 1, b[1], "aturan ×3+1 dari pasangan pertama harus gugur di pasangan kedua");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...a, ...b] };
  // label pasangan ①–④ di luar lingkaran, sama untuk dua juring yang berhadapan
  const ann = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const g = ((-90 + 45 * i) * Math.PI) / 180; return redText(425 + 156 * Math.cos(g), 185 + 156 * Math.sin(g) + 9, "①②③④"[i % 4], 26); }).join("") +
    redText(425, 385, "6 + 19 = 11 + 14 = 4 + 21 = 9 + 16 = 25", 26);
  push({ seq: 51, key: "E", instruksi: BUNDAR, choices: ["9", "15", "25", "28", "16"], tingkat: 2,
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 6 ↔ 19, 11 ↔ 14, 4 ↔ 21. Setiap pasangan berjumlah 25, jadi bilangan di hadapan 9 adalah 25 − 9 = 16. Aturan ini harus berlaku untuk semua pasangan, bukan hanya satu.\n\nOpsi 28 memakai aturan × 3 + 1 yang hanya cocok untuk pasangan 6 ↔ 19 (11 × 3 + 1 = 34, bukan 14). Opsi 25 adalah jumlahnya, bukan bilangannya. Opsi 15 salah hitung satu (25 − 9 − 1). Opsi 9 hanya menyalin bilangan di seberang. Jawaban: e." },
    { svg: build([p], 300, { ring: "outer", i: 7 }, b[3], "").svg, pembahasan_svg: build([{ ...p, cy: 185 }], 300, { ring: "outer", i: 7 }, b[3], ann, 405).pembahasan_svg }, b[3]);
}
// 52 R2 putaran (sedang): searah jarum jam dari panah, + 3 dan × 2 bergantian.
{
  const v = [2]; for (let i = 1; i < 8; i++) v.push(i % 2 ? v[i - 1] + 3 : v[i - 1] * 2);
  assert.deepEqual(v, [2, 5, 10, 13, 26, 29, 58, 61]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: v.slice(0, 7).concat(61), startArrow: true }, pa: Pie = { ...p, cy: 205 };
  push({ seq: 52, key: "B", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, choices: ["58", "61", "64", "87", "116"], tingkat: 2,
    pembahasan: "Baca searah jarum jam mulai dari 2: 2, 5, 10, 13, 26, 29, 58. Langkahnya bergantian + 3 lalu × 2 (2 + 3 = 5, 5 × 2 = 10, 10 + 3 = 13, dan seterusnya). Langkah terakhir dari 58 adalah + 3, jadi 58 + 3 = 61.\n\nOpsi 116 memakai × 2 padahal giliran + 3. Opsi 64 menambah 6, bukan 3. Opsi 87 menjumlahkan dua bilangan terakhir (58 + 29). Opsi 58 hanya menyalin bilangan sebelumnya. Jawaban: b." },
    { svg: build([p], 300, { ring: "outer", i: 7 }, 61, "").svg, pembahasan_svg: build([pa], 300, { ring: "outer", i: 7 }, 61, steps(pa, ["+3", "×2", "+3", "×2", "+3", "×2", "+3"]), 410).pembahasan_svg }, 61);
}
// 53 R3 cincin (HOTS, dua langkah): luar = dalam³ − 1.
{
  const inner = [2, 4, 3, 5], outer = inner.map((x) => x ** 3 - 1);
  assert.deepEqual(outer, [7, 63, 26, 124]);
  const a = (63 - 7) / (4 - 2), b0 = 7 - a * 2;
  assert.notEqual(a * 3 + b0, 26, "aturan linear dari dua juring harus gugur");
  assert.equal(a * 5 + b0, 91);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner }, pa: Pie = { ...p, cy: 200 };
  const ann = inner.map((x, i) => { const ang = ((-90 + 90 * i) * Math.PI) / 180, R = pa.r + (i % 2 ? 92 : 30); return redText(425 + R * Math.cos(ang), 200 + R * Math.sin(ang) + 9, i === 3 ? `${x}³ − 1 = ?` : `${x}³ − 1 = ${outer[i]}`, 24); }).join("");
  push({ seq: 53, key: "C", instruksi: BUNDAR, choices: ["24", "91", "124", "125", "126"], tingkat: 3,
    pembahasan: "Bandingkan cincin dalam dan luar pada juring yang sama: 2 → 7, 4 → 63, 3 → 26. Aturannya dua langkah: pangkatkan tiga, lalu kurangi 1 (2³ − 1 = 7, 4³ − 1 = 63, 3³ − 1 = 26). Untuk dalam 5: 5³ − 1 = 125 − 1 = 124.\n\nOpsi 125 lupa mengurangi 1. Opsi 126 menambah 1, bukan mengurangi. Opsi 24 memakai kuadrat (5² − 1). Opsi 91 memakai aturan kali tetap dari dua juring pertama (× 28 − 49), padahal aturan itu gugur di juring ketiga (3 × 28 − 49 = 35, bukan 26). Jawaban: c." },
    { svg: build([p], 300, { ring: "outer", i: 3 }, 124, "").svg, pembahasan_svg: build([pa], 300, { ring: "outer", i: 3 }, 124, ann, 400).pembahasan_svg }, 124);
}
// 54 R5 antar-lingkaran (HOTS): pusat = atas × kanan − bawah × kiri.
{
  const c = [[5, 4, 3, 2], [7, 3, 2, 4], [9, 3, 4, 5]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: t * r - b * l }));
  assert.deepEqual(c.map((x) => x.center), [14, 13, 7]);
  const sum = (v: number[]) => v.reduce((s, x) => s + x);
  assert.equal(sum(c[0].v), c[0].center); assert.notEqual(sum(c[1].v), c[1].center, "aturan 'jumlah semua' harus gugur di lingkaran 2");
  const pies: Pie[] = c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: x.center }));
  const ann = c.map((x, i) => { const [t, r, b, l] = x.v; return redText(155 + i * 270, 302, `${t}×${r} − ${b}×${l} = ${i === 2 ? "?" : x.center}`, 25); }).join("") +
    pies.map((p) => { const ar = (i: number, j: number, d: boolean) => { const [x1, y1] = pieAt(p, "outer", i), [x2, y2] = pieAt(p, "outer", j); return redArrow([x1 + (x2 - x1) * 0.28, y1 + (y2 - y1) * 0.28], [x1 + (x2 - x1) * 0.72, y1 + (y2 - y1) * 0.72], d); }; return ar(0, 1, false) + ar(2, 3, true); }).join("");
  push({ seq: 54, key: "A", instruksi: BUNDAR, choices: ["7", "18", "21", "33", "47"], tingkat: 3,
    pembahasan: "Bilangan di pusat = (atas × kanan) − (bawah × kiri). Lingkaran 1: 5 × 4 − 3 × 2 = 20 − 6 = 14. Lingkaran 2: 7 × 3 − 2 × 4 = 21 − 8 = 13. Lingkaran 3: 9 × 3 − 4 × 5 = 27 − 20 = 7.\n\nOpsi 21 memakai jumlah semua bilangan; aturan itu cocok di lingkaran 1 (5 + 4 + 3 + 2 = 14) tetapi gugur di lingkaran 2 (16, bukan 13). Opsi 47 menjumlahkan kedua hasil kali. Opsi 18 mengurangi bawah dan kiri tanpa mengalikannya (27 − 4 − 5). Opsi 33 memasangkan sisi yang salah (9 × 5 − 4 × 3). Jawaban: a." },
    build(pies, 290, { ring: "center", pie: 2 }, 7, ann, 325), 7);
}
// 55 huruf (a) (HOTS): angka luar = nilai huruf di juring itu + nilai huruf juring berikutnya searah jarum jam.
{
  const L = ["C", "H", "E", "K"], v = L.map(val), outer = v.map((x, i) => x + v[(i + 1) % 4]);
  assert.deepEqual(outer, [11, 13, 16, 14]);
  assert.equal(v[3] + v[2], 16, "pengecoh arah terbalik");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner: L }, pa: Pie = { ...p, cx: 300, cy: 160 };
  const ann = L.map((l, i) => redText(580, 82 + 52 * i, `${l} + ${L[(i + 1) % 4]} = ${v[i]} + ${v[(i + 1) % 4]} = ${i === 3 ? "?" : outer[i]}`, 26, "start")).join("");
  push({ seq: 55, key: "D", instruksi: BUNDAR_HURUF, choices: ["11", "13", "15", "14", "16"], tingkat: 3,
    pembahasan: "Ubah huruf di cincin dalam menjadi urutannya: C = 3, H = 8, E = 5, K = 11. Angka di cincin luar = nilai huruf di juring itu + nilai huruf pada juring berikutnya searah jarum jam: C + H = 3 + 8 = 11, H + E = 8 + 5 = 13, E + K = 5 + 11 = 16. Untuk K, juring berikutnya kembali ke C: 11 + 3 = 14.\n\nOpsi 16 menjumlahkan ke arah berlawanan (K + E). Opsi 13 dan 15 salah hitung satu posisi alfabet. Opsi 11 hanya menyalin nilai K. Jawaban: d." },
    { svg: build([p], 300, { ring: "outer", i: 3 }, 14, "").svg, pembahasan_svg: build([pa], 300, { ring: "outer", i: 3 }, 14, ann, 320).pembahasan_svg }, 14);
}
// 56 huruf (b) (HOTS): lompatan bertambah +3, +4, +5, +6, +7; lewat Z kembali ke A.
{
  const vals = [8]; for (let i = 0; i < 5; i++) vals.push(vals[i] + 3 + i);
  const letter = (n: number) => String.fromCharCode(64 + (((n - 1) % 26) + 1));
  assert.deepEqual(vals.map(letter), ["H", "K", "O", "T", "Z", "G"]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: vals.map(letter), startArrow: true }, pa: Pie = { ...p, cy: 200 };
  push({ seq: 56, key: "E", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); setelah Z, hitungan kembali ke A. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    choices: ["A", "F", "H", "Z", "G"], tingkat: 3,
    pembahasan: "Ubah huruf menjadi urutannya: H = 8, K = 11, O = 15, T = 20, Z = 26. Lompatannya bertambah satu setiap langkah: + 3, + 4, + 5, + 6, jadi berikutnya + 7. Dari Z maju 7 berarti 26 + 7 = 33; alfabet hanya sampai 26, jadi hitungan kembali ke A: 33 − 26 = 7 = G.\n\nOpsi F memakai lompatan tetap + 6. Opsi H salah hitung satu huruf. Opsi Z berhenti di huruf terakhir tanpa kembali ke A. Opsi A menganggap hitungan cukup kembali ke awal alfabet tanpa meneruskan sisa lompatan. Jawaban: e." },
    { svg: build([p], 300, { ring: "outer", i: 5 }, "G", "").svg, pembahasan_svg: build([pa], 300, { ring: "outer", i: 5 }, "G", steps(pa, ["+3", "+4", "+5", "+6", "+7"]) + redText(425, 395, "26 + 7 = 33 → 33 − 26 = 7 = G", 26), 410).pembahasan_svg }, "G");
}
