import assert from "node:assert/strict";
import { BUNDAR, BUNDAR_HURUF, HL, KEYS, type Key, type Pie, type Pt, pie, pieAt, pieSvg, redArrow, redRing, redText, svgWrap } from "./figural-lib";

// Pola bundar Latihan Paket 2 (package_number 3), nomor 51-56. Aturan berbeda dari Simulasi
// Paket 2 (s2): R1 berseberangan, R2 putaran, R3 cincin, R5 antar-lingkaran, huruf (a) dan (b).
// Kunci dihitung dari aturan lalu dicocokkan dengan opsi kunci. Soal (svg/choices) tidak boleh berubah
// (backfill DB mencocokkan isi soal); gambar pembahasan: "?" terisi (hijau) + anotasi merah, tanpa id.

export type BundarItem = { seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR_ITEMS: BundarItem[] = [];
const P = "kal3b-ah-";
const svg = (pies: Pie[], h?: number) => pieSvg(pies.map((p) => ({ ...p, idPrefix: P })), h);
const push = (it: BundarItem, answer: string | number) => {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.match(it.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+ Tip: [^\\n]+ Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar ${it.seq}: pembahasan 2 paragraf + tip + kunci`);
  BUNDAR_ITEMS.push(it);
};
const val = (ch: string) => ch.charCodeAt(0) - 64;
type Slot = { ring: "outer" | "inner" | "center"; i?: number; pie?: number };
/** Gambar pembahasan: pie soal tanpa panah ber-id, slot "?" diisi jawaban hijau berlingkar hijau, ditambah anotasi merah. */
function pem(pies: Pie[], h: number, slot: Slot, answer: string | number, ann: string) {
  const k = slot.pie ?? 0, set = (p: Pie): Pie =>
    slot.ring === "center" ? { ...p, center: "" } : slot.ring === "inner" ? { ...p, inner: p.inner!.map((x, j) => (j === slot.i ? "" : x)) } : { ...p, outer: p.outer.map((x, j) => (j === slot.i ? "" : x)) };
  const [x, y] = pieAt(pies[k], slot.ring, slot.i), fs = pies[k].r > 90 ? 26 : 22;
  const label = `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fs + 2}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${HL}">${answer}</text>`;
  return svgWrap(h, pies.map((p, j) => pie({ ...(j === k ? set(p) : p), startArrow: false })).join("") + redRing(x, y, fs + Math.max(0, String(answer).length - 2) * 9, HL) + label + ann);
}
/** Label merah di luar juring (pasangan berseberangan, dsb.). */
const outLabels = (p: Pie, labels: string[], rr = p.r + 26) => labels.map((t, i) => {
  const g = ((-90 + (360 / p.outer.length) * i) * Math.PI) / 180;
  return redText(p.cx + rr * Math.cos(g), p.cy + rr * Math.sin(g) + 9, t, 26);
}).join("");
/** Panah merah antarjuring di luar lingkaran (searah jarum jam) dengan label langkah. */
const steps = (p: Pie, labels: string[]) => labels.map((t, s) => {
  const n = p.outer.length, ang = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180;
  const pt = (a: number, rr: number): Pt => [p.cx + rr * Math.cos(a), p.cy + rr * Math.sin(a)];
  // panah lurus (tali busur): jari-jari ujung dibesarkan supaya bagian tengahnya tidak memotong lingkaran
  const a0 = ang(s) + 0.14, a1 = ang(s + 1) - 0.14, R = (p.r + 12) / Math.cos((a1 - a0) / 2), [lx, ly] = pt((a0 + a1) / 2, R + 30);
  return redArrow(pt(a0, R), pt(a1, R)) + redText(lx, ly + 8, t, 24);
}).join("");
const lines = (t: string[], y0: number) => t.map((x, i) => redText(425, y0 + 36 * i, x, 26)).join("");

// 51 R1 berseberangan: bilangan di seberang = 2 × bilangan + 1.
{
  const a = [3, 5, 8, 10], b = a.map((x) => 2 * x + 1);
  assert.deepEqual(b, [7, 11, 17, 21]);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...a, ...b.slice(0, 3), "?"] }, q = { ...p, cy: 185 };
  push({ seq: 51, key: "D", instruksi: BUNDAR, svg: svg([p]), choices: ["18", "19", "20", "21", "23"], tingkat: 2,
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 3 ↔ 7, 5 ↔ 11, 8 ↔ 17. Bilangan di seberang = 2 × bilangan + 1 (2 × 3 + 1 = 7, 2 × 5 + 1 = 11, 2 × 8 + 1 = 17). Di hadapan 10: 2 × 10 + 1 = 21.\n\nOpsi 20 gugur karena lupa menambah 1 (hanya 2 × 10). Opsi 18 dan 19 gugur karena memakai aturan 'tambah tetap', padahal selisih pasangan tidak tetap (4, 6, 9). Opsi 23 gugur karena salah hitung (2 × 10 + 3). Tip: uji aturan pada minimal dua pasangan sebelum menghitung jawaban; aturan yang hanya cocok untuk satu pasangan biasanya jebakan. Jawaban: d.",
    pembahasan_svg: pem([q], 440, { ring: "outer", i: 7 }, b[3], outLabels(q, ["①", "②", "③", "④", "①", "②", "③", "④"]) + lines(["① 3 → 7 ② 5 → 11 ③ 8 → 17 ④ 10 → 21", "seberang = 2 × bilangan + 1"], 392)) }, b[3]);
}
// 52 R2 putaran: searah jarum jam dari panah, tiap bilangan = 2 × sebelumnya − 1.
{
  const v = [3]; for (let i = 1; i < 6; i++) v.push(2 * v[i - 1] - 1);
  assert.deepEqual(v, [3, 5, 9, 17, 33, 65]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: [...v.slice(0, 5), "?"], startArrow: true }, q = { ...p, cy: 200 };
  push({ seq: 52, key: "C", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. " + BUNDAR, svg: svg([p]), choices: ["49", "64", "65", "66", "67"], tingkat: 2,
    pembahasan: "Dibaca searah jarum jam mulai dari 3: 3, 5, 9, 17, 33. Setiap bilangan = 2 × bilangan sebelumnya − 1 (2 × 3 − 1 = 5, 2 × 5 − 1 = 9, 2 × 17 − 1 = 33). Cara lain: selisihnya 2, 4, 8, 16 (selalu dikali 2), jadi selisih berikutnya 32. Bilangan berikutnya 2 × 33 − 1 = 65, atau 33 + 32 = 65.\n\nOpsi 64 gugur karena lupa dikurangi 1 (hanya 2 × 33). Opsi 49 gugur karena hanya menambah selisih yang sama, 16, padahal selisihnya terus berlipat. Opsi 66 dan 67 gugur karena salah hitung (2 × 33 atau 2 × 33 + 1). Tip: jika selisih antarbilangan berlipat dua, cek apakah aturannya 'dikali 2 lalu ditambah/dikurangi tetap'. Jawaban: c.",
    pembahasan_svg: pem([q], 440, { ring: "outer", i: 5 }, v[5], steps(q, ["+2", "+4", "+8", "+16", "+32"]) + lines(["selisih berlipat 2 · tiap bilangan = 2 × sebelumnya − 1"], 418)) }, v[5]);
}
// 53 R3 cincin: luar = 2 × dalam² + 1 (bukan aturan linear).
{
  const inner = [3, 1, 4, 2], outer = inner.map((x) => 2 * x * x + 1);
  assert.deepEqual(outer, [19, 3, 33, 9]);
  // aturan linear a·x + b dari dua contoh pertama harus gugur di contoh ketiga
  const a = (19 - 3) / (3 - 1), b0 = 3 - a;
  assert.notEqual(a * 4 + b0, 33);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...outer.slice(0, 3), "?"], inner };
  const ring = inner.map((_, i) => redRing(...pieAt(p, "inner", i), 17)).join("");
  push({ seq: 53, key: "B", instruksi: BUNDAR, svg: svg([p]), choices: ["8", "9", "10", "11", "17"], tingkat: 3,
    pembahasan: "Bandingkan cincin dalam dan luar pada juring yang sama: 3 → 19, 1 → 3, 4 → 33. Aturannya luar = 2 × dalam² + 1 (2 × 9 + 1 = 19, 2 × 1 + 1 = 3, 2 × 16 + 1 = 33). Aturan kali tetap (misalnya × 8 − 5) cocok untuk dua juring pertama tetapi gugur di juring ketiga, jadi bukan aturannya. Untuk dalam 2: 2 × 2² + 1 = 2 × 4 + 1 = 9.\n\nOpsi 17 gugur karena menghitung 2⁴ + 1 (pangkatnya tertukar). Opsi 8 gugur karena lupa menambah 1. Opsi 11 gugur karena memakai aturan kali tetap × 8 − 5. Opsi 10 gugur karena salah hitung (2 × 4 + 2). Tip: jika bilangan luar melonjak jauh lebih cepat daripada bilangan dalam (1 → 3, tetapi 4 → 33), curigai kuadrat. Jawaban: b.",
    pembahasan_svg: pem([p], 390, { ring: "outer", i: 3 }, outer[3], ring + lines(["luar = 2 × dalam² + 1", "kiri: 2 × 2² + 1 = 9"], 325)) }, outer[3]);
}
// 54 R5 antar-lingkaran: pusat = (atas + bawah) × (kanan − kiri).
{
  const c = [[3, 6, 5, 2], [4, 7, 2, 4], [5, 9, 3, 6]].map(([t, r, b, l]) => ({ v: [t, r, b, l], center: (t + b) * (r - l) }));
  assert.deepEqual(c.map((x) => x.center), [32, 18, 24]);
  assert.notEqual(c[1].v.reduce((s, x) => s + x) * 2, c[1].center, "aturan 'jumlah × 2' harus gugur");
  const ps: Pie[] = c.map((x, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: x.v, center: i === 2 ? "?" : x.center }));
  const f = c.map(({ v: [t, r, b, l], center }, i) => redText(155 + i * 270, 300, `(${t}+${b})×(${r}−${l}) = ${center}`, 24)).join("");
  push({ seq: 54, key: "A", instruksi: BUNDAR, svg: svg(ps, 290), choices: ["24", "27", "30", "36", "46"], tingkat: 3,
    pembahasan: "Bilangan di pusat = (atas + bawah) × (kanan − kiri). Lingkaran 1: (3 + 5) × (6 − 2) = 32. Lingkaran 2: (4 + 2) × (7 − 4) = 18. Lingkaran 3: (5 + 3) × (9 − 6) = 24. Aturan 'jumlah semua × 2' cocok untuk lingkaran 1 (16 × 2 = 32) tetapi gugur di lingkaran 2 (17 × 2 = 34, bukan 18), jadi bukan aturannya.\n\nOpsi 46 gugur karena memakai aturan 'jumlah semua × 2' (23 × 2). Opsi 27, 30, dan 36 gugur karena memasangkan bilangan yang salah, misalnya (kanan + kiri) × (atas − bawah) = 15 × 2 = 30 atau (kanan + bawah) × (kanan − kiri) = 12 × 3 = 36; pasangan seperti itu tidak cocok dengan lingkaran 1 dan 2. Tip: pada pola tiga lingkaran, temukan aturan dari lingkaran 1, lalu wajib uji di lingkaran 2 sebelum dipakai pada lingkaran 3. Jawaban: a.",
    pembahasan_svg: pem(ps, 370, { ring: "center", pie: 2 }, c[2].center, f + lines(["pusat = (atas + bawah) × (kanan − kiri)"], 350)) }, c[2].center);
}
// 55 huruf (a): angka di seberang huruf = urutan × 3 − 2.
{
  const letters = ["D", "G", "J", "M"], nums = letters.map((l) => val(l) * 3 - 2);
  assert.deepEqual(nums, [10, 19, 28, 37]);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: [...letters, ...nums.slice(0, 3), "?"] }, q = { ...p, cy: 185 };
  push({ seq: 55, key: "E", instruksi: BUNDAR_HURUF, svg: svg([p]), choices: ["35", "36", "38", "39", "37"], tingkat: 3,
    pembahasan: "Ubah huruf menjadi urutannya: D = 4, G = 7, J = 10, M = 13. Pasangkan dengan angka yang berhadapan (melewati pusat): 4 ↔ 10, 7 ↔ 19, 10 ↔ 28. Aturannya angka = urutan × 3 − 2 (4 × 3 − 2 = 10, 7 × 3 − 2 = 19, 10 × 3 − 2 = 28). Untuk M: 13 × 3 − 2 = 37.\n\nOpsi 39 gugur karena lupa mengurangi 2 (13 × 3). Opsi 38 gugur karena hanya dikurangi 1. Opsi 35 dan 36 gugur karena salah hitung; angka-angkanya selalu naik 9 (10, 19, 28), jadi berikutnya pasti 28 + 9 = 37. Tip: tulis urutan huruf di atas tiap huruf sebelum mencari aturan, dan pakai selisih antarangka sebagai pengecekan cepat. Jawaban: e.",
    pembahasan_svg: pem([q], 476, { ring: "outer", i: 7 }, nums[3], outLabels(q, ["①", "②", "③", "④", "①", "②", "③", "④"]) + lines(["D = 4 · G = 7 · J = 10 · M = 13", "angka di seberang = urutan × 3 − 2", "M: 13 × 3 − 2 = 37"], 392)) }, nums[3]);
}
// 56 huruf (b): nilai huruf dikali 2; lewat Z kembali ke A (32 − 26 = 6 = F).
{
  const vals = [2]; for (let i = 1; i < 5; i++) vals.push(vals[i - 1] * 2);
  const wrap = (n: number) => ((n - 1) % 26) + 1, letter = (n: number) => String.fromCharCode(64 + wrap(n));
  assert.deepEqual(vals.map(letter), ["B", "D", "H", "P", "F"]);
  const p: Pie = { cx: 425, cy: 155, r: 125, outer: [...vals.slice(0, 4).map(letter), "?"], startArrow: true }, q = { ...p, cy: 200 };
  push({ seq: 56, key: "A", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); setelah Z, hitungan kembali ke A. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.",
    svg: svg([p]), choices: ["F", "E", "G", "Q", "Z"], tingkat: 3,
    pembahasan: "Ubah huruf menjadi urutannya: B = 2, D = 4, H = 8, P = 16. Setiap nilai dikali 2, jadi berikutnya 16 × 2 = 32. Alfabet hanya sampai 26, jadi hitungan berlanjut kembali dari A: 32 − 26 = 6, dan huruf ke-6 adalah F.\n\nOpsi Q gugur karena hanya maju satu huruf dari P (17). Opsi Z gugur karena berhenti di huruf terakhir tanpa kembali ke A. Opsi E (5) dan G (7) gugur karena salah hitung satu posisi saat kembali ke A. Tip: jika hasil lebih dari 26, kurangi 26 lalu ubah lagi menjadi huruf; hafalkan patokan E = 5, J = 10, O = 15, T = 20 supaya cepat. Jawaban: a.",
    pembahasan_svg: pem([q], 486, { ring: "outer", i: 4 }, letter(vals[4]), steps(q, ["×2", "×2", "×2", "×2"]) + lines(["B = 2 → D = 4 → H = 8 → P = 16 → 32", "32 − 26 = 6 = F"], 436)) }, letter(vals[4]));
}
