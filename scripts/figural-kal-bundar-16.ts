import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, HL, KEYS, type Key, type Pie, type Pt, pie, pieAt, redArrow, redText, redRing, svgWrap } from "./figural-lib";

// Pola bundar Simulasi Paket 1 baru (package_number 16), nomor 51-56. Aturan berbeda dari pkg 3, 15, dan s2:
// 51 R1 selisih berseberangan tetap, 52 R2 putaran dengan selisih bertambah 3, 53 R3 cincin luar = dalam × (dalam + 1),
// 54 R4/R5 pusat = atas² − (tiga juring lain), 55 huruf (a) luar = nilai² + 1, 56 huruf (b) dua lintasan berselang (+5 / −2) dengan kembali ke A.
// Kunci dihitung dari aturan. Gambar pembahasan: "?" terisi (hijau) + anotasi merah, tanpa id.

export type Bundar16 = { pkg: 16; seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR16_ITEMS: Bundar16[] = [];
const P = "kal16b-ah-";
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
const push = (it: Omit<Bundar16, "pkg" | "svg" | "pembahasan_svg">, b: { svg: string; pembahasan_svg: string }, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar16 ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.equal(new Set(it.choices).size, 5, `bundar16 ${it.seq}: pilihan kembar`);
  assert.match(it.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar16 ${it.seq}: pembahasan 2 paragraf + kunci`);
  BUNDAR16_ITEMS.push({ pkg: 16, ...it, ...b });
};
const val = (ch: string) => ch.charCodeAt(0) - 64;
const letter = (n: number) => String.fromCharCode(64 + (((n - 1) % 26) + 26) % 26 + 1);
/** Panah merah antarjuring di luar lingkaran (searah jarum jam) dengan label langkah. */
const steps = (p: Pie, labels: string[], from = 0) => labels.map((t, s) => {
  const n = p.outer.length, ang = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180, R = p.r + 18;
  const pt = (a: number, rr: number): Pt => [p.cx + rr * Math.cos(a), p.cy + rr * Math.sin(a)];
  const a0 = ang(from + s) + 0.12, a1 = ang(from + s + 1) - 0.12, am = (a0 + a1) / 2, [lx, ly] = pt(am, R + 28);
  return redArrow(pt(a0, R), pt(a1, R)) + redText(lx, ly + 8, t, 24);
}).join("");

// 51 R1 berseberangan (sedang): 6 juring, juring di seberang selalu 12 lebih besar.
{
  const a = [5, 9, 8], b = a.map((x) => x + 12);
  assert.deepEqual(b, [17, 21, 20]);
  assert.notEqual(a[1] * 3 + 2, b[1], "aturan ×3+2 dari pasangan pertama harus gugur di pasangan kedua");
  assert.ok(a[2] - 12 < 1, "pasangan '?' tidak boleh punya jawaban kedua (8 − 12)");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...a, ...b] }, pa: Pie = { ...p, cy: 185 };
  const ann = [0, 1, 2, 3, 4, 5].map((i) => { const g = ((-90 + 60 * i) * Math.PI) / 180; return redText(425 + 156 * Math.cos(g), 185 + 156 * Math.sin(g) + 9, "①②③"[i % 3], 26); }).join("") +
    redText(425, 385, "17 − 5 = 21 − 9 = ? − 8 = 12", 26);
  push({ seq: 51, key: "B", instruksi: BUNDAR, choices: ["8", "20", "26", "19", "21"], tingkat: 2,
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 5 ↔ 17, 9 ↔ 21, 8 ↔ ?. Bilangan di seberang selalu 12 lebih besar (17 − 5 = 12, 21 − 9 = 12), jadi ? = 8 + 12 = 20. Aturan ini harus berlaku untuk semua pasangan, bukan hanya satu.\n\nOpsi 26 memakai aturan × 3 + 2 yang hanya cocok untuk pasangan 5 ↔ 17 (9 × 3 + 2 = 29, bukan 21). Opsi 19 salah hitung satu. Opsi 21 menyalin bilangan di sebelahnya. Opsi 8 hanya menyalin bilangan di seberang. Jawaban: b." },
    build([p], 300, { ring: "outer", i: 5 }, 20, ann, 405, [pa]), 20);
}
// 52 R2 putaran (sedang): searah jarum jam dari panah, selisihnya +2, +5, +8, ... (bertambah 3).
{
  const v = [4]; for (let i = 1; i < 8; i++) v.push(v[i - 1] + 2 + 3 * (i - 1));
  assert.deepEqual(v, [4, 6, 11, 19, 30, 44, 61, 81]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: v, startArrow: true }, pa: Pie = { ...p, cy: 205 };
  push({ seq: 52, key: "D", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, choices: ["78", "80", "105", "81", "61"], tingkat: 2,
    pembahasan: "Baca searah jarum jam mulai dari 4: 4, 6, 11, 19, 30, 44, 61. Selisihnya + 2, + 5, + 8, + 11, + 14, + 17, jadi selisih itu sendiri bertambah 3 setiap langkah. Langkah berikutnya + 20: 61 + 20 = 81.\n\nOpsi 78 mengulang selisih + 17. Opsi 80 memakai + 19 (selisih dianggap bertambah 2). Opsi 105 menjumlahkan dua bilangan terakhir (44 + 61). Opsi 61 hanya menyalin bilangan sebelumnya. Jawaban: d." },
    build([p], 300, { ring: "outer", i: 7 }, 81, steps(pa, ["+2", "+5", "+8", "+11", "+14", "+17", "+20"]), 410, [pa]), 81);
}
// 53 R3 cincin (HOTS, dua langkah): luar = dalam × (dalam + 1).
{
  const inner = [3, 6, 2, 5], outer = inner.map((x) => x * (x + 1));
  assert.deepEqual(outer, [12, 42, 6, 30]);
  const a = (42 - 12) / (6 - 3), b0 = 12 - a * 3;
  assert.notEqual(a * 2 + b0, 6, "aturan linear dari dua juring harus gugur");
  assert.equal(a * 5 + b0, 32);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner }, pa: Pie = { ...p, cy: 200 };
  const ann = inner.map((x, i) => { const ang = ((-90 + 90 * i) * Math.PI) / 180, R = pa.r + (i % 2 ? 92 : 30); return redText(425 + R * Math.cos(ang), 200 + R * Math.sin(ang) + 9, i === 3 ? `${x} × ${x + 1} = ?` : `${x} × ${x + 1} = ${outer[i]}`, 24); }).join("");
  push({ seq: 53, key: "A", instruksi: BUNDAR, choices: ["30", "25", "36", "32", "29"], tingkat: 3,
    pembahasan: "Bandingkan cincin dalam dan luar pada juring yang sama: 3 → 12, 6 → 42, 2 → 6. Aturannya dua langkah: ambil bilangan berikutnya, lalu kalikan (3 × 4 = 12, 6 × 7 = 42, 2 × 3 = 6). Untuk dalam 5: 5 × 6 = 30.\n\nOpsi 25 hanya mengkuadratkan (5 × 5). Opsi 36 mengkuadratkan bilangan berikutnya (6 × 6). Opsi 32 memakai aturan linear dari dua juring pertama (× 10 − 18), padahal aturan itu gugur di juring ketiga (2 × 10 − 18 = 2, bukan 6). Opsi 29 salah hitung satu. Jawaban: a." },
    build([p], 300, { ring: "outer", i: 3 }, 30, ann, 400, [pa]), 30);
}
// 54 R4 pusat pada tiga lingkaran (HOTS): pusat = atas² − (kanan + bawah + kiri).
{
  const c = [[6, 3, 5, 4], [5, 2, 4, 7], [7, 6, 8, 9]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: t * t - (r + b + l) }));
  assert.deepEqual(c.map((x) => x.center), [24, 12, 26]);
  const sum = (v: number[]) => v.reduce((s, x) => s + x);
  assert.notEqual(sum(c[0].v), c[0].center, "aturan 'jumlah semua' harus gugur");
  assert.notEqual(c[1].v[0] * c[1].v[3], c[1].center, "aturan 'atas × kiri' (cocok di lingkaran 1) harus gugur di lingkaran 2");
  const pies: Pie[] = c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: x.center }));
  const ann = c.map((x, i) => { const [t, r, b, l] = x.v; return redText(155 + i * 270, 302, `${t}² − (${r}+${b}+${l}) = ${i === 2 ? "?" : x.center}`, 23); }).join("") +
    pies.map((p) => redRing(...pieAt(p, "outer", 0), 22)).join("");
  push({ seq: 54, key: "E", instruksi: BUNDAR, choices: ["49", "30", "23", "25", "26"], tingkat: 3,
    pembahasan: "Bilangan di pusat = (bilangan atas)² − (jumlah tiga bilangan lainnya). Lingkaran 1: 6² − (3 + 5 + 4) = 36 − 12 = 24. Lingkaran 2: 5² − (2 + 4 + 7) = 25 − 13 = 12. Lingkaran 3: 7² − (6 + 8 + 9) = 49 − 23 = 26.\n\nOpsi 49 lupa mengurangi. Opsi 30 menjumlahkan semua bilangan; aturan itu sudah gugur di lingkaran 1 (6 + 3 + 5 + 4 = 18, bukan 24). Opsi 23 hanya menjumlahkan tiga bilangan lainnya. Opsi 25 salah hitung satu. Aturan 'atas × kiri' cocok di lingkaran 1 (6 × 4 = 24) tetapi gugur di lingkaran 2 (5 × 7 = 35, bukan 12). Jawaban: e." },
    build(pies, 290, { ring: "center", pie: 2 }, 26, ann, 325), 26);
}
// 55 huruf (a) (HOTS): angka luar = (nilai huruf dalam)² + 1.
{
  const L = ["C", "E", "B", "F"], outer = L.map((l) => val(l) ** 2 + 1);
  assert.deepEqual(outer, [10, 26, 5, 37]);
  const a = (26 - 10) / (5 - 3), b0 = 10 - a * 3;
  assert.notEqual(a * 2 + b0, 5, "aturan linear dari dua juring harus gugur");
  assert.equal(a * 6 + b0, 34);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner: L }, pa: Pie = { ...p, cx: 290, cy: 160 };
  const ann = L.map((l, i) => redText(560, 82 + 52 * i, `${l} = ${val(l)} → ${val(l)}² + 1 = ${i === 3 ? "?" : outer[i]}`, 26, "start")).join("");
  push({ seq: 55, key: "C", instruksi: BUNDAR_HURUF, choices: ["34", "36", "37", "50", "26"], tingkat: 3,
    pembahasan: "Ubah huruf di cincin dalam menjadi urutannya: C = 3, E = 5, B = 2, F = 6. Angka di cincin luar = nilai huruf dikuadratkan lalu ditambah 1: 3² + 1 = 10, 5² + 1 = 26, 2² + 1 = 5. Untuk F: 6² + 1 = 37.\n\nOpsi 36 lupa menambah 1. Opsi 50 salah membaca F sebagai huruf ke-7 (7² + 1). Opsi 34 memakai aturan linear dari dua juring pertama (× 8 − 14), padahal aturan itu gugur di juring ketiga (2 × 8 − 14 = 2, bukan 5). Opsi 26 hanya menyalin angka yang ada di gambar. Jawaban: c." },
    build([p], 300, { ring: "outer", i: 3 }, 37, ann, 320, [pa]), 37);
}
// 56 huruf (b) (HOTS): dua lintasan berselang-seling, juring ganjil +5 (lewat Z kembali ke A), juring genap −2.
{
  const t1 = [16]; for (let i = 1; i < 4; i++) t1.push(t1[i - 1] + 5);
  const t2 = [8]; for (let i = 1; i < 4; i++) t2.push(t2[i - 1] - 2);
  const seq = t1.flatMap((x, i) => [letter(x), letter(t2[i])]);
  assert.deepEqual(seq, ["P", "H", "U", "F", "Z", "D", "E", "B"]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: seq, startArrow: true }, pa: Pie = { ...p, cy: 200 };
  const ann = [0, 2, 4].map((i) => redRing(...pieAt(pa, "outer", i), 22)).join("") + redText(425, 360, "P, U, Z, ? : + 5 (lingkaran merah)", 25) +
    redText(425, 397, "Z + 5: 26 + 5 = 31 → 31 − 26 = 5 = E", 26) + redText(425, 434, "lintasan lain: H, F, D, B (− 2)", 24);
  push({ seq: 56, key: "E", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); setelah Z, hitungan kembali ke A. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    choices: ["D", "F", "Z", "A", "E"], tingkat: 3,
    pembahasan: "Huruf-hurufnya membentuk dua lintasan yang berselang-seling. Lintasan pertama (juring ke-1, 3, 5, 7): P = 16, U = 21, Z = 26, jadi maju + 5. Lintasan kedua (juring ke-2, 4, 6, 8): H = 8, F = 6, D = 4, B = 2, jadi mundur − 2. Tanda tanya ada di lintasan pertama: 26 + 5 = 31; alfabet hanya sampai 26, jadi hitungan kembali ke A: 31 − 26 = 5 = E.\n\nOpsi D maju + 4, bukan + 5. Opsi F maju + 6. Opsi Z berhenti di huruf terakhir tanpa kembali ke A. Opsi A menganggap hitungan cukup kembali ke awal alfabet tanpa meneruskan sisa lompatan. Jawaban: e." },
    build([p], 300, { ring: "outer", i: 6 }, "E", ann, 450, [pa]), "E");
}
