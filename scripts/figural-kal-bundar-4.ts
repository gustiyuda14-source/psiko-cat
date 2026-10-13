import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, HL, KEYS, type Key, type Pie, type Pt, pie, pieAt, redRing, redText, svgWrap } from "./figural-lib";

// Pola bundar Latihan Paket 3 (package_number 4), nomor 51-56. Aturan berbeda dari pkg 3, 15, 16, dan s2:
// 51 R1 hasil kali berseberangan tetap, 52 R2 tiap bilangan = jumlah dua bilangan sebelumnya, 53 R3 cincin luar = 2^dalam + dalam,
// 54 R4 pusat = (atas + bawah) × 2 − (kiri + kanan), 55 huruf (a) luar = 2 × nilai huruf + 3, 56 huruf (b) mundur 4 huruf dengan kembali ke Z.
// Tingkat: 51, 52, 55 sedang · 53, 54, 56 HOTS. Kunci dihitung dari aturan. Gambar pembahasan: "?" terisi (hijau) + anotasi merah, tanpa id.

export type Bundar4 = { pkg: 4; seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR4_ITEMS: Bundar4[] = [];
const P = "kal4b-ah-";
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
const push = (it: Omit<Bundar4, "pkg" | "svg" | "pembahasan_svg">, b: { svg: string; pembahasan_svg: string }, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar4 ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.equal(new Set(it.choices).size, 5, `bundar4 ${it.seq}: pilihan kembar`);
  assert.match(it.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar4 ${it.seq}: pembahasan 2 paragraf + kunci`);
  BUNDAR4_ITEMS.push({ pkg: 4, ...it, ...b });
};
const val = (ch: string) => ch.charCodeAt(0) - 64;
const letter = (n: number) => String.fromCharCode(64 + (((n - 1) % 26) + 26) % 26 + 1);
const angle = (n: number, i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180;

// 51 R1 berseberangan (sedang): 6 juring, juring di seberang selalu memberi hasil kali 30.
{
  const a = [3, 5, 2], b = a.map((x) => 30 / x);
  assert.deepEqual(b, [10, 6, 15]);
  assert.notEqual(a[1] + b[1], a[0] + b[0], "aturan 'jumlah tetap' dari pasangan pertama harus gugur di pasangan kedua");
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...a, ...b] }, pa: Pie = { ...p, cy: 185 };
  const ann = [0, 1, 2, 3, 4, 5].map((i) => redText(425 + 156 * Math.cos(angle(6, i)), 185 + 156 * Math.sin(angle(6, i)) + 9, "①②③"[i % 3], 26)).join("") +
    redText(425, 385, "3 × 10 = 5 × 6 = 2 × 15 = 30", 26);
  push({ seq: 51, key: "C", instruksi: BUNDAR, choices: ["11", "28", "15", "60", "10"], tingkat: 2,
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 3 ↔ 10, 5 ↔ 6, 2 ↔ ?. Hasil kali tiap pasangan selalu 30 (3 × 10 = 30, 5 × 6 = 30), jadi ? = 30 ÷ 2 = 15. Aturan ini harus berlaku untuk semua pasangan, bukan hanya satu.\n\nOpsi 11 memakai aturan jumlah tetap 13 (13 − 2) yang hanya cocok untuk pasangan 3 ↔ 10; pasangan 5 ↔ 6 berjumlah 11. Opsi 28 mengurangi (30 − 2), bukan membagi. Opsi 60 mengalikan (30 × 2), bukan membagi. Opsi 10 menyalin bilangan yang sudah ada di gambar. Jawaban: c." },
    build([p], 300, { ring: "outer", i: 5 }, 15, ann, 405, [pa]), 15);
}
// 52 R2 putaran (sedang): searah jarum jam dari panah, tiap bilangan = jumlah dua bilangan sebelumnya.
{
  const v = [3, 5]; for (let i = 2; i < 8; i++) v.push(v[i - 1] + v[i - 2]);
  assert.deepEqual(v, [3, 5, 8, 13, 21, 34, 55, 89]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: v, startArrow: true }, pa: Pie = { ...p, cy: 205 };
  const ann = [5, 6].map((i) => redRing(...pieAt(pa, "outer", i), 24)).join("") + redText(425, 372, "3 + 5 = 8 · 5 + 8 = 13 · 8 + 13 = 21 · …", 24) + redText(425, 408, "34 + 55 = 89", 26);
  push({ seq: 52, key: "A", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, choices: ["89", "76", "110", "68", "144"], tingkat: 2,
    pembahasan: "Baca searah jarum jam mulai dari 3: 3, 5, 8, 13, 21, 34, 55. Mulai dari bilangan ketiga, setiap bilangan adalah jumlah dua bilangan tepat sebelumnya (3 + 5 = 8, 5 + 8 = 13, 8 + 13 = 21). Jadi ? = 34 + 55 = 89.\n\nOpsi 76 menjumlahkan 55 dengan 21, melewati satu bilangan. Opsi 110 menggandakan bilangan terakhir (55 × 2). Opsi 68 menggandakan bilangan sebelumnya (34 × 2). Opsi 144 melangkah satu kali terlalu jauh (55 + 89). Jawaban: a." },
    build([p], 300, { ring: "outer", i: 7 }, 89, ann, 430, [pa]), 89);
}
// 53 R3 cincin (HOTS, dua langkah): luar = 2^dalam + dalam.
{
  const inner = [3, 1, 5, 2], outer = inner.map((x) => 2 ** x + x);
  assert.deepEqual(outer, [11, 3, 37, 6]);
  const a = (11 - 3) / (3 - 1), b0 = 3 - a;
  assert.notEqual(a * 2 + b0, 6, "aturan linear dari dua juring harus gugur");
  assert.equal(a * 5 + b0, 19);
  assert.notEqual(5 ** 2 + 5, 37);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner }, pa: Pie = { ...p, cy: 200 };
  const ann = inner.map((x, i) => { const R = pa.r + (i % 2 ? 92 : 30); return redText(425 + R * Math.cos(angle(4, i)), 200 + R * Math.sin(angle(4, i)) + 9, i === 2 ? `2⁵ + 5 = ?` : `2${"⁰¹²³⁴⁵"[x]} + ${x} = ${outer[i]}`, 24); }).join("");
  push({ seq: 53, key: "E", instruksi: BUNDAR, choices: ["19", "30", "32", "10", "37"], tingkat: 3,
    pembahasan: "Bandingkan cincin dalam dan luar pada juring yang sama: 3 → 11, 1 → 3, 2 → 6. Aturannya dua langkah: pangkatkan angka 2 dengan bilangan dalam, lalu tambahkan bilangan dalam itu (2³ + 3 = 8 + 3 = 11, 2¹ + 1 = 3, 2² + 2 = 6). Untuk dalam 5: 2⁵ + 5 = 32 + 5 = 37.\n\nOpsi 19 memakai aturan linear dari dua juring pertama (× 4 − 1), padahal aturan itu gugur di juring 2 (2 × 4 − 1 = 7, bukan 6). Opsi 30 menukar pangkat dengan kuadrat (5² + 5). Opsi 32 lupa menambahkan 5. Opsi 10 mengalikan (2 × 5), bukan memangkatkan. Jawaban: e." },
    build([p], 300, { ring: "outer", i: 2 }, 37, ann, 400, [pa]), 37);
}
// 54 R4 pusat pada tiga lingkaran (HOTS): pusat = (atas + bawah) × 2 − (kiri + kanan).
{
  const c = [[7, 3, 5, 4], [8, 2, 4, 6], [9, 5, 6, 2]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: (t + b) * 2 - (l + r) }));
  assert.deepEqual(c.map((x) => x.center), [17, 16, 23]);
  const sum = (v: number[]) => v.reduce((s, x) => s + x);
  assert.notEqual(sum(c[0].v), c[0].center, "aturan 'jumlah semua' harus gugur");
  assert.notEqual(c[0].v[0] + c[0].v[2], c[0].center, "aturan 'atas + bawah' harus gugur");
  const pies: Pie[] = c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: x.center }));
  const ann = c.map((x, i) => { const [t, r, b, l] = x.v; return redText(155 + i * 270, 302, `(${t}+${b})×2 − (${l}+${r}) = ${i === 2 ? "?" : x.center}`, 21); }).join("") +
    pies.map((p) => redRing(...pieAt(p, "outer", 0), 22)).join("");
  push({ seq: 54, key: "B", instruksi: BUNDAR, choices: ["15", "23", "22", "30", "8"], tingkat: 3,
    pembahasan: "Bilangan di pusat = (bilangan atas + bilangan bawah) × 2 − (bilangan kiri + bilangan kanan). Lingkaran 1: (7 + 5) × 2 − (4 + 3) = 24 − 7 = 17. Lingkaran 2: (8 + 4) × 2 − (6 + 2) = 24 − 8 = 16. Lingkaran 3: (9 + 6) × 2 − (2 + 5) = 30 − 7 = 23.\n\nOpsi 15 hanya menjumlahkan atas dan bawah. Opsi 22 menjumlahkan semua bilangan; aturan itu sudah gugur di lingkaran 1 (7 + 3 + 5 + 4 = 19, bukan 17). Opsi 30 lupa mengurangi kiri dan kanan. Opsi 8 lupa menggandakan (15 − 7). Jawaban: b." },
    build(pies, 290, { ring: "center", pie: 2 }, 23, ann, 325), 23);
}
// 55 huruf (a) (sedang): angka luar = 2 × nilai huruf di juring itu + 3.
{
  const L = ["D", "H", "B", "K"], outer = L.map((l) => 2 * val(l) + 3);
  assert.deepEqual(outer, [11, 19, 7, 25]);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer, inner: L }, pa: Pie = { ...p, cx: 290, cy: 160 };
  const ann = L.map((l, i) => redText(560, 82 + 52 * i, `${l} = ${val(l)} → 2 × ${val(l)} + 3 = ${i === 3 ? "?" : outer[i]}`, 26, "start")).join("");
  push({ seq: 55, key: "A", instruksi: BUNDAR_HURUF, choices: ["25", "22", "14", "27", "33"], tingkat: 2,
    pembahasan: "Ubah huruf di cincin dalam menjadi urutannya: D = 4, H = 8, B = 2, K = 11. Angka di cincin luar = nilai huruf dikali 2, lalu ditambah 3: 2 × 4 + 3 = 11, 2 × 8 + 3 = 19, 2 × 2 + 3 = 7. Untuk K: 2 × 11 + 3 = 25.\n\nOpsi 22 lupa menambah 3. Opsi 14 lupa mengalikan 2 (11 + 3). Opsi 27 salah membaca K sebagai huruf ke-12 (2 × 12 + 3). Opsi 33 mengalikan 3, bukan 2 (3 × 11). Jawaban: a." },
    build([p], 300, { ring: "outer", i: 3 }, 25, ann, 320, [pa]), 25);
}
// 56 huruf (b) (HOTS): mundur 4 huruf setiap juring; lewat A kembali ke Z.
{
  const seq = [26]; for (let i = 1; i < 8; i++) seq.push(seq[i - 1] - 4 <= 0 ? seq[i - 1] - 4 + 26 : seq[i - 1] - 4);
  const L = seq.map(letter);
  assert.deepEqual(L, ["Z", "V", "R", "N", "J", "F", "B", "X"]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: L, startArrow: true }, pa: Pie = { ...p, cy: 200 };
  const ann = [5, 6].map((i) => redRing(...pieAt(pa, "outer", i), 22)).join("") + redText(425, 360, "Z, V, R, N, J, F, B: mundur 4 huruf (−4)", 25) +
    redText(425, 397, "B = 2 → 2 − 4 = −2 → −2 + 26 = 24 = X", 26);
  push({ seq: 56, key: "D", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); bila hitungan melewati A, lanjutkan dari Z. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    choices: ["A", "F", "W", "X", "Y"], tingkat: 3,
    pembahasan: "Baca searah jarum jam mulai dari Z (26): Z = 26, V = 22, R = 18, N = 14, J = 10, F = 6, B = 2. Setiap huruf mundur 4 urutan dari huruf sebelumnya. Setelah B (2) mundur 4 lagi menjadi 2 − 4 = −2; hitungan melewati A, jadi dilanjutkan dari Z: −2 + 26 = 24 = X.\n\nOpsi A berhenti di awal alfabet tanpa meneruskan sisa langkah. Opsi F maju 4 huruf (arah terbalik, 2 + 4 = 6). Opsi W salah melanjutkan dari Z (−2 + 25 = 23). Opsi Y salah melanjutkan dari Z ke arah lain (−2 + 27 = 25). Jawaban: d." },
    build([p], 300, { ring: "outer", i: 7 }, "X", ann, 450, [pa]), "X");
}
