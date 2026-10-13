import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, HL, KEYS, type Key, type Pie, type Pt, pie, pieAt, redRing, redText, svgWrap } from "./figural-lib";

// Pola bundar Latihan Paket 4 (package_number 5), nomor 51-56. Aturan berbeda dari pkg 3, 4, 15, 16, dan s2:
// 51 R1 bilangan di seberang = kuadratnya, 52 R2 selisih berurutan berlipat dua (+1, +2, +4, ...), 53 R3 luar = (dalam − 1) × nomor juring,
// 54 R4 pusat = atas × bawah − (kiri + kanan), 55 huruf (a) luar + nilai huruf = 27 (alfabet dibalik), 56 huruf (b) nilai = n² dengan kembali ke A.
// Tingkat: 51, 52, 55 sedang · 53, 54, 56 HOTS. Kunci dihitung dari aturan. Gambar pembahasan: "?" terisi (hijau) + anotasi merah, tanpa id.

export type Bundar5 = { pkg: 5; seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR5_ITEMS: Bundar5[] = [];
const P = "kal5b-ah-";
type Slot = { ring: "outer" | "inner" | "center"; i?: number; pie?: number };
/** Soal (dengan "?") dan gambar pembahasan (slot "?" diisi jawaban hijau + lingkaran hijau) dari pie yang sama. */
function build(pies: Pie[], h: number, slot: Slot, answer: string | number, ann: string, hp = h, pa = pies) {
  const k = slot.pie ?? 0, set = (p: Pie, v: string | number): Pie =>
    slot.ring === "center" ? { ...p, center: v } : slot.ring === "inner" ? { ...p, inner: p.inner!.map((x, j) => (j === slot.i ? v : x)) } : { ...p, outer: p.outer.map((x, j) => (j === slot.i ? v : x)) };
  const q = pies.map((p, j) => (j === k ? set(p, "?") : p)), a = pa.map((p, j) => ({ ...(j === k ? set(p, "") : p), startArrow: false }));
  const [x, y] = pieAt(pa[k], slot.ring, slot.i), fs = pa[k].r > 90 ? 26 : 22;
  const label = `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fs + 2}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${HL}">${answer}</text>`;
  return { svg: svgWrap(h, q.map((p) => pie({ ...p, idPrefix: P })).join("")), pembahasan_svg: svgWrap(hp, a.map((p) => pie(p)).join("") + redRing(x, y, fs + Math.max(0, String(answer).length - 2) * 9, HL) + label + ann) };
}
const push = (it: Omit<Bundar5, "pkg" | "svg" | "pembahasan_svg">, b: { svg: string; pembahasan_svg: string }, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar5 ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.equal(new Set(it.choices).size, 5, `bundar5 ${it.seq}: pilihan kembar`);
  assert.match(it.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar5 ${it.seq}: pembahasan 2 paragraf + kunci`);
  BUNDAR5_ITEMS.push({ pkg: 5, ...it, ...b });
};
const val = (ch: string) => ch.charCodeAt(0) - 64;
const letter = (n: number) => String.fromCharCode(64 + (((n - 1) % 26) + 26) % 26 + 1);
const angle = (n: number, i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180;
const at = (cx: number, cy: number, n: number, i: number, R: number): Pt => [cx + R * Math.cos(angle(n, i)), cy + R * Math.sin(angle(n, i))];

// 51 R1 berseberangan (sedang): 6 juring, bilangan di seberang = kuadrat bilangan itu.
{
  const a = [3, 5, 7], b = a.map((x) => x * x);
  assert.deepEqual(b, [9, 25, 49]);
  assert.notEqual(a[1] * 3, b[1], "aturan '× 3' dari pasangan pertama harus gugur di pasangan kedua");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...a, ...b] }, pa: Pie = { ...p, cy: 185 };
  const ann = [0, 1, 2, 3, 4, 5].map((i) => redText(...(([x, y]) => [x, y + 9] as Pt)(at(425, 185, 6, i, 156)), "①②③"[i % 3], 26)).join("") +
    redText(425, 385, "3² = 9 · 5² = 25 · 7² = 49", 26);
  push({ seq: 51, key: "D", instruksi: BUNDAR, choices: ["14", "21", "42", "49", "35"], tingkat: 2,
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 3 ↔ 9, 5 ↔ 25, 7 ↔ ?. Bilangan di seberang selalu kuadrat dari bilangan itu (3 × 3 = 9, 5 × 5 = 25), jadi ? = 7 × 7 = 49.\n\nOpsi 14 menggandakan 7. Opsi 21 mengalikan 3 (3 × 7) karena hanya cocok dengan pasangan 3 ↔ 9; pasangan 5 ↔ 25 membuktikan aturan itu gugur. Opsi 42 mengurangi kuadrat dengan bilangannya (49 − 7). Opsi 35 mengalikan 7 dengan bilangan tetangganya, 5. Jawaban: d." },
    build([p], 300, { ring: "outer", i: 5 }, 49, ann, 405, [pa]), 49);
}
// 52 R2 putaran (sedang): searah jarum jam dari panah, selisih berurutan berlipat dua (+1, +2, +4, ...).
{
  const v = [3]; for (let i = 0; i < 7; i++) v.push(v[i] + 2 ** i);
  assert.deepEqual(v, [3, 4, 6, 10, 18, 34, 66, 130]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: v, startArrow: true }, pa: Pie = { ...p, cy: 205 };
  const ann = [5, 6].map((i) => redRing(...pieAt(pa, "outer", i), 24)).join("") + redText(425, 372, "selisih: +1, +2, +4, +8, +16, +32, …", 24) + redText(425, 408, "66 + 64 = 130", 26);
  push({ seq: 52, key: "E", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, choices: ["132", "98", "100", "194", "130"], tingkat: 2,
    pembahasan: "Baca searah jarum jam mulai dari 3: 3, 4, 6, 10, 18, 34, 66. Selisih antar bilangan berurutan adalah +1, +2, +4, +8, +16, +32, yaitu selalu berlipat dua. Selisih berikutnya +64, jadi ? = 66 + 64 = 130.\n\nOpsi 132 menggandakan bilangan terakhir (66 × 2). Opsi 98 menambah 32 lagi, padahal selisih seharusnya berlipat dua. Opsi 100 menjumlahkan dua bilangan terakhir (66 + 34). Opsi 194 melompati satu selisih (66 + 128). Jawaban: e." },
    build([p], 300, { ring: "outer", i: 7 }, 130, ann, 430, [pa]), 130);
}
// 53 R3 cincin (HOTS, dua langkah): luar = (dalam − 1) × nomor juring (nomor 1..5 searah jarum jam dari atas).
{
  const inner = [4, 7, 2, 6, 3], outer = inner.map((x, i) => (x - 1) * (i + 1));
  assert.deepEqual(outer, [3, 12, 3, 20, 10]);
  const a = (12 - 3) / (7 - 4), b0 = 3 - a * 4;
  assert.notEqual(a * 2 + b0, 3, "aturan linear dari dua juring pertama harus gugur");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner }, pa: Pie = { ...p, cy: 200 };
  const ann = inner.map((x, i) => { const [px, py] = at(425, 200, 5, i, 152); return redText(px, py + 9, `(${x}−1)×${i + 1} = ${i === 4 ? "?" : outer[i]}`, 23, px > 445 ? "start" : px < 405 ? "end" : "middle"); }).join("");
  push({ seq: 53, key: "D", instruksi: "Juring diberi nomor 1, 2, 3, … searah jarum jam mulai dari juring paling atas. " + BUNDAR, choices: ["15", "8", "12", "10", "2"], tingkat: 3,
    pembahasan: "Bandingkan cincin dalam dan luar pada juring yang sama, dengan memperhatikan nomor juringnya. Juring 1: 4 → 3, juring 2: 7 → 12, juring 3: 2 → 3. Aturannya dua langkah: kurangi bilangan dalam dengan 1, lalu kalikan dengan nomor juring ((4 − 1) × 1 = 3, (7 − 1) × 2 = 12, (2 − 1) × 3 = 3, (6 − 1) × 4 = 20). Untuk juring 5 dengan bilangan dalam 3: (3 − 1) × 5 = 10.\n\nOpsi 15 lupa mengurangi 1 (3 × 5). Opsi 8 memakai nomor juring 4 (2 × 4), padahal ini juring ke-5. Opsi 12 menyalin angka luar juring 2. Opsi 2 hanya mengurangi 1 tanpa mengalikan nomor juring. Jawaban: d." },
    build([p], 300, { ring: "outer", i: 4 }, 10, ann, 410, [pa]), 10);
}
// 54 R4 pusat pada tiga lingkaran (HOTS): pusat = atas × bawah − (kiri + kanan).
{
  const c = [[4, 3, 5, 2], [6, 2, 3, 5], [7, 4, 2, 3]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: t * b - (l + r) }));
  assert.deepEqual(c.map((x) => x.center), [15, 11, 7]);
  const sum = (v: number[]) => v.reduce((s, x) => s + x);
  assert.notEqual(sum(c[0].v), c[0].center, "aturan 'jumlah semua' harus gugur");
  assert.notEqual(c[0].v[0] * c[0].v[2], c[0].center, "aturan 'atas × bawah' harus gugur");
  const pies: Pie[] = c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: x.center }));
  const ann = c.map((x, i) => { const [t, r, b, l] = x.v; return redText(155 + i * 270, 302, `${t}×${b} − (${l}+${r}) = ${i === 2 ? "?" : x.center}`, 22); }).join("") +
    pies.map((p) => redRing(...pieAt(p, "outer", 0), 22)).join("");
  push({ seq: 54, key: "A", instruksi: BUNDAR, choices: ["7", "14", "9", "21", "10"], tingkat: 3,
    pembahasan: "Bilangan di pusat = (bilangan atas × bilangan bawah) − (bilangan kiri + bilangan kanan). Lingkaran 1: 4 × 5 − (2 + 3) = 20 − 5 = 15. Lingkaran 2: 6 × 3 − (5 + 2) = 18 − 7 = 11. Lingkaran 3: 7 × 2 − (3 + 4) = 14 − 7 = 7.\n\nOpsi 14 lupa mengurangi kiri dan kanan. Opsi 9 menjumlahkan atas dan bawah, bukan mengalikan. Opsi 21 mengalikan atas dengan kiri (7 × 3). Opsi 10 hanya mengurangi bilangan kanan (14 − 4). Jawaban: a." },
    build(pies, 290, { ring: "center", pie: 2 }, 7, ann, 325), 7);
}
// 55 huruf (a) (sedang): alfabet dibalik; angka luar + nilai huruf = 27.
{
  const L = ["C", "M", "F", "T"], outer = L.map((l) => 27 - val(l));
  assert.deepEqual(outer, [24, 14, 21, 7]);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner: L }, pa: Pie = { ...p, cx: 290, cy: 160 };
  const ann = L.map((l, i) => redText(560, 82 + 52 * i, `${l} = ${val(l)} → 27 − ${val(l)} = ${i === 3 ? "?" : outer[i]}`, 26, "start")).join("");
  push({ seq: 55, key: "E", instruksi: BUNDAR_HURUF, choices: ["20", "8", "47", "6", "7"], tingkat: 2,
    pembahasan: "Ubah huruf di cincin dalam menjadi urutannya: C = 3, M = 13, F = 6, T = 20. Angka di cincin luar adalah 27 dikurangi urutan huruf (alfabet dibaca dari belakang): 27 − 3 = 24, 27 − 13 = 14, 27 − 6 = 21. Untuk T: 27 − 20 = 7.\n\nOpsi 20 hanya menyalin urutan huruf T. Opsi 8 memakai 28, bukan 27 (28 − 20). Opsi 47 menjumlahkan, bukan mengurangi (27 + 20). Opsi 6 memakai 26, bukan 27 (26 − 20). Jawaban: e." },
    build([p], 300, { ring: "outer", i: 3 }, 7, ann, 320, [pa]), 7);
}
// 56 huruf (b) (HOTS): nilai huruf = n² (1, 4, 9, …); bila lewat 26, dikurangi 26 berulang (kembali ke A).
{
  const L = Array.from({ length: 8 }, (_, i) => letter((i + 1) ** 2));
  assert.deepEqual(L, ["A", "D", "I", "P", "Y", "J", "W", "L"]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: L, startArrow: true }, pa: Pie = { ...p, cy: 200 };
  const ann = [5, 6].map((i) => redRing(...pieAt(pa, "outer", i), 22)).join("") + redText(425, 360, "1², 2², 3², …: 1, 4, 9, 16, 25, 36 → 10, 49 → 23", 24) +
    redText(425, 397, "8² = 64 → 64 − 52 = 12 = L", 26);
  push({ seq: 56, key: "C", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); bila hitungan melewati Z, lanjutkan dari A. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    choices: ["J", "N", "L", "X", "P"], tingkat: 3,
    pembahasan: "Baca searah jarum jam mulai dari A (1): A = 1, D = 4, I = 9, P = 16, Y = 25, J = 10, W = 23. Urutan huruf mengikuti bilangan kuadrat 1, 4, 9, 16, 25, 36, 49, dan bilangan yang melewati 26 dikurangi 26 (36 − 26 = 10 = J, 49 − 26 = 23 = W). Bilangan kuadrat berikutnya 64; 64 − 26 − 26 = 12, jadi hurufnya L.\n\nOpsi J memakai selisih sebelumnya lagi (23 + 13 = 36, lalu 36 − 26 = 10), padahal selisih terus bertambah. Opsi N salah menjumlah selisih (23 + 17 = 40, lalu 40 − 26 = 14). Opsi X hanya maju satu huruf dari W. Opsi P menyalin huruf yang sudah ada di gambar. Jawaban: c." },
    build([p], 300, { ring: "outer", i: 7 }, "L", ann, 450, [pa]), "L");
}
