import assert from "node:assert/strict";
import { HL, KEYS, type Key, type Pie, type Pt, dashLine, pie, pieAt, redRing, redText, svgWrap, RED } from "./figural-lib";

// Pola bundar Simulasi 5 (package_number 20) — PROTOTIPE: 1 butir per jenis. Lebih sulit dari pkg 19 (dua cincin bersarang, tiga lapis aturan).
// Aturan berbeda dari pkg 3, 4, 5, 15, 16, 19.
// 51 angka: cincin luar = 2 × angka dalam juring itu + angka dalam juring PENCERMINANNYA (terhadap garis tegak lurus yang melewati juring atas-bawah).
// 55 huruf: huruf luar = huruf dalam digeser n posisi alfabet; n naik 1 tiap juring (1..6) DAN arahnya berganti maju/mundur; melewati Z/A melingkar.
// Opsi diurutkan naik (D-4); kunci 51 D · 55 C (diatur ulang sesi 5 untuk D-4). Bukti tunggal: pencarian aturan alternatif (assertUnique). Gambar pembahasan tanpa id (G-8).

export type Bundar20 = { pkg: 20; seq: number; key: Key; instruksi: string; svg: string; choices: string[]; tingkat: 3; pembahasan: string; pembahasan_svg: string };
export const BUNDAR20_ITEMS: Bundar20[] = [];
const P = "kal20b-ah-";
const BUNDAR_53 = "Pasangan bilangan yang saling berhadapan memiliki hubungan yang sama. Tentukan angka yang tepat untuk menggantikan tanda tanya (?) pada gambar.";
const BUNDAR = "Tentukan angka yang tepat untuk menggantikan tanda tanya (?) pada gambar.";
const N = 6, mirror = (i: number) => (N - i) % N, opp = (i: number) => (i + N / 2) % N;
const val = (ch: string) => ch.charCodeAt(0) - 64;
const wrap = (n: number) => (((n - 1) % 26) + 26) % 26 + 1; // 1..26 melingkar
const letter = (n: number) => String.fromCharCode(64 + wrap(n));
const angle = (i: number) => ((-90 + (360 / N) * i) * Math.PI) / 180;
const around = (cx: number, cy: number, i: number, R: number): Pt => [cx + R * Math.cos(angle(i)), cy + R * Math.sin(angle(i))];

/** Soal ("?" di cincin luar juring q) dan gambar pembahasan (jawaban hijau + cincin hijau + anotasi merah) dari pie yang sama. */
function build(p: Pie, q: number, answer: string | number, hp: number, h: number, ann: (pa: Pie) => string) {
  const mk = (v: string | number, extra: Partial<Pie>): Pie => ({ ...p, ...extra, outer: p.outer.map((x, j) => (j === q ? v : x)) });
  const pa = mk("", { cy: p.cy + 50, startArrow: false }), [x, y] = pieAt(pa, "outer", q);
  const label = `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${HL}">${answer}</text>`;
  return { svg: svgWrap(h, pie({ ...mk("?", {}), idPrefix: P })), pembahasan_svg: svgWrap(hp, pie(pa) + redRing(x, y, 24 + Math.max(0, String(answer).length - 2) * 9, HL) + label + ann(pa)) };
}
function push(it: Omit<Bundar20, "pkg" | "svg" | "pembahasan_svg" | "tingkat">, b: { svg: string; pembahasan_svg: string }, answer: string | number) {
  assert.equal(it.choices[KEYS.indexOf(it.key)], String(answer), `bundar20 ${it.seq}: kunci tidak cocok dengan aturan`);
  assert.equal(new Set(it.choices).size, 5, `bundar20 ${it.seq}: pilihan kembar`);
  const sorted = [...it.choices].sort((a, c) => (/^\d+$/.test(a) ? +a - +c : a.localeCompare(c)));
  assert.deepEqual(it.choices, sorted, `bundar20 ${it.seq}: opsi harus urut naik`);
  assert.ok(it.choices.every((c) => !/^\d+$/.test(c) || +c <= 100), `bundar20 ${it.seq}: opsi angka ≤ 100`);
  assert.match(it.pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${it.key.toLowerCase()}\\.$`), `bundar20 ${it.seq}: pembahasan 2 paragraf + kunci`);
  assert.ok(!/id="/.test(b.pembahasan_svg), "G-8: pembahasan_svg tanpa id");
  BUNDAR20_ITEMS.push({ pkg: 20, tingkat: 3, ...it, ...b });
}
/** Semua kombinasi koefisien kecil: fitur → keluaran. Setiap aturan yang cocok dengan SELURUH juring terlihat dan hanya memakai ≤ maxTerms suku harus meramal `key`. */
function assertUnique(feats: ((i: number) => number | null)[], names: string[], out: (number | null)[], q: number, key: number, maxTerms: number, coef: number[], consts: number[], mod?: number) {
  let hits = 0;
  const rec = (k: number, cs: number[], terms: number): void => {
    if (terms > maxTerms) return;
    if (k < feats.length) { for (const c of coef) rec(k + 1, [...cs, c], terms + (c ? 1 : 0)); return; }
    for (const c0 of consts) {
      if (terms + (c0 ? 1 : 0) > maxTerms) continue;
      const f = (i: number) => { let s = c0; for (let j = 0; j < cs.length; j++) { if (!cs[j]) continue; const v = feats[j](i); if (v === null) return null; s += cs[j] * v; } return mod ? wrap(s) : s; };
      let ok = true, any = false;
      for (let i = 0; i < N && ok; i++) { if (i === q || out[i] === null) continue; const r = f(i); if (r === null || r !== out[i]) ok = false; any = true; }
      const pred = f(q);
      if (ok && any && pred !== null) { hits++; assert.equal(pred, key, `aturan alternatif ${cs.map((c, j) => `${c}·${names[j]}`).join("+")}+${c0} meramal ${pred}`); }
    }
  };
  rec(0, [], 0);
  assert.ok(hits >= 1, "aturan sebenarnya harus ditemukan oleh pencarian");
  return hits;
}

// 51 angka (HOTS, tiga lapis): dua cincin bersarang; luar = 2 × dalam sendiri + dalam juring pencerminan. Juring atas dan bawah dipasangkan dengan dirinya sendiri.
{
  const inner = [4, 7, 5, 9, 3, 6], q = 2, outer = inner.map((x, i) => 2 * x + inner[mirror(i)]);
  assert.deepEqual(outer, [12, 20, 13, 27, 11, 19]);
  const key = outer[q], vis = outer.map((x, i) => (i === q ? null : x));
  // pencarian aturan alternatif: fitur = dalam sendiri/cermin/seberang/tetangga kanan/kiri + luar tetangga
  const feats = [(i: number) => inner[i], (i: number) => inner[mirror(i)], (i: number) => inner[opp(i)], (i: number) => inner[(i + 1) % N], (i: number) => inner[(i + N - 1) % N],
    (i: number) => vis[(i + 1) % N], (i: number) => vis[(i + N - 1) % N]];
  const hits = assertUnique(feats, ["dalam", "cermin", "seberang", "dalamKanan", "dalamKiri", "luarKanan", "luarKiri"], vis, q, key, 3, [-3, -2, -1, 0, 1, 2, 3], [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]);
  // tiap pengecoh = satu kesalahan bernama dan harus gugur di sedikitnya satu juring terlihat
  const wrongs: [number, (i: number) => number][] = [
    [8, (i) => inner[i] + inner[mirror(i)]], [10, (i) => 2 * inner[i]], [11, (i) => 2 * inner[mirror(i)] + inner[i]], [16, (i) => 2 * inner[i] + inner[opp(i)]],
  ];
  for (const [v, f] of wrongs) { assert.equal(f(q), v); assert.ok(outer.some((o, i) => i !== q && f(i) !== o), `pengecoh ${v} harus gugur di juring terlihat`); }
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: vis.map((x) => x ?? "?"), inner, innerSize: 26 };
  const ann = (pa: Pie) => {
    const L = (i: number) => pieAt(pa, "inner", i);
    // sumbu cermin putus-putus: hanya di luar lingkaran dan di antara cincin, supaya tidak menimpa angka
    const seg = (a: number, b: number) => dashLine([pa.cx, pa.cy + a * pa.r], [pa.cx, pa.cy + b * pa.r], RED);
    return seg(-1.2, -1.02) + seg(-0.62, -0.53) + seg(0.53, 0.62) + seg(1.02, 1.2) + redRing(...L(2), 19) + redRing(...L(4), 19) +
      redText(pa.cx, pa.cy + pa.r + 62, "Juring ?: 2 × 5 + 3 = 13", 26) +
      redText(pa.cx, pa.cy + pa.r + 98, "Cek: 2×7+6 = 20 · 2×3+5 = 11 · 2×4+4 = 12 · 2×9+9 = 27", 22);
  };
  push({ seq: 51, key: "D", instruksi: "Tentukan angka yang tepat untuk menggantikan tanda tanya (?) pada gambar.", choices: ["8", "10", "11", "13", "16"],
    pembahasan: "Bandingkan cincin dalam dan cincin luar. Pasangkan tiap juring dengan juring pencerminannya terhadap garis tegak lurus yang melewati juring paling atas dan paling bawah (kanan atas dengan kiri atas, kanan bawah dengan kiri bawah; juring paling atas dan paling bawah berpasangan dengan dirinya sendiri). Angka luar = 2 × angka dalam juring itu + angka dalam juring pencerminannya: 2 × 4 + 4 = 12, 2 × 7 + 6 = 20, 2 × 3 + 5 = 11, 2 × 9 + 9 = 27, 2 × 6 + 7 = 19. Untuk juring kanan bawah (dalam 5, cermin dalam 3): 2 × 5 + 3 = 13.\n\nOpsi 8 hanya menjumlahkan angka dalam dengan cerminnya (5 + 3); aturan itu gugur di juring paling atas (4 + 4 = 8, bukan 12). Opsi 10 hanya melipatduakan angka dalam (2 × 5); gugur di juring kanan atas (14, bukan 20). Opsi 11 menukar peran, cermin dikali 2 (2 × 3 + 5); gugur di juring kanan atas (2 × 6 + 7 = 19, bukan 20). Opsi 16 memakai juring seberang (6), bukan pencerminan (2 × 5 + 6); gugur di juring paling atas (2 × 4 + 9 = 17, bukan 12). Jawaban: d." },
    build(p, q, 13, 470, 300, ann), 13);
  console.log("51 aturan cocok:", hits);
}
// 55 huruf (HOTS, tiga lapis): dua cincin huruf; luar = dalam digeser n posisi, n = 1..6 naik tiap juring, arah berganti maju/mundur, melingkar di A/Z.
{
  const inner = ["K", "P", "X", "C", "M", "D"], q = 5, shift = (i: number) => (i % 2 === 0 ? 1 : -1) * (i + 1);
  const outer = inner.map((l, i) => letter(val(l) + shift(i)));
  assert.deepEqual(outer, ["L", "N", "A", "Y", "R", "X"]);
  assert.ok(outer.some((o, i) => val(inner[i]) + shift(i) > 26) && outer.some((o, i) => val(inner[i]) + shift(i) < 1), "melewati Z dan A harus terlihat di juring lain");
  const key = val(outer[q]), vis = outer.map((l, i) => (i === q ? null : val(l)));
  const d5 = val(inner[5]);
  // aturan alternatif: selisih tiap juring s_i = a·i·(-1)^i/ konstan/ dll, dan relasi ke huruf luar/dalam tetangga; mod 26
  const sg = (i: number) => (i % 2 === 0 ? 1 : -1);
  const feats = [(i: number) => val(inner[i]), (i: number) => i * sg(i), (i: number) => sg(i), (i: number) => i, (i: number) => val(inner[(i + 1) % N]), (i: number) => val(inner[(i + N - 1) % N]),
    (i: number) => vis[(i + N - 1) % N], (i: number) => vis[(i + 1) % N]];
  const hits = assertUnique(feats, ["dalam", "i·tanda", "tanda", "i", "dalamKanan", "dalamKiri", "luarKiri", "luarKanan"], vis, q, key, 3, [-2, -1, 0, 1, 2], [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 26);
  console.log("55 aturan cocok:", hits);
  // pengecoh bernama: L geser dari luar juring sebelumnya, W alfabet 25 huruf, Y besar geseran 5, Z besar geseran 4
  assert.deepEqual([letter(val(outer[4]) - 6), letter(d5 - 6 + 25), letter(d5 - 5), letter(d5 - 4)], ["L", "W", "Y", "Z"]);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: vis.map((v, i) => (v === null ? "?" : outer[i])), inner, innerSize: 26 };
  const ann = (pa: Pie) => inner.map((_, i) => redText(...(([x, y]) => [x, y + 9] as Pt)(around(pa.cx, pa.cy, i, pa.r + 34)), (shift(i) > 0 ? "+" : "−") + Math.abs(shift(i)), 24)).join("") +
    redText(pa.cx, pa.cy + pa.r + 80, "D (4) − 6 = −2 → lanjut dari Z: 0 = Z, −1 = Y, −2 = X", 24) +
    redText(pa.cx, pa.cy + pa.r + 114, "Cek: X (24) + 3 = 27 → A · C (3) − 4 = −1 → Y", 24);
  push({ seq: 55, key: "C", instruksi: "Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, C = 3, dan seterusnya); bila hitungan melewati Z, lanjutkan dari A, dan bila mundur melewati A, lanjutkan dari Z. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.", choices: ["L", "W", "X", "Y", "Z"],
    pembahasan: "Bandingkan huruf cincin dalam dengan huruf cincin luar pada juring yang sama, lalu hitung geserannya: K → L (+1), P → N (−2), X → A (+3, melewati Z kembali ke A), C → Y (−4, mundur melewati A ke Z), M → R (+5). Ada tiga lapis aturan: besar geseran naik 1 tiap juring (1, 2, 3, 4, 5, 6), arahnya berganti (maju, mundur, maju, mundur, maju, mundur), dan hitungan melingkar di ujung alfabet. Juring terakhir mundur 6 dari D (4): 4 − 6 = −2, melewati A sehingga lanjut dari Z: 0 = Z, −1 = Y, −2 = X.\n\nOpsi L menggeser dari huruf cincin luar juring sebelumnya (R = 18, 18 − 6 = 12), bukan dari huruf dalam juring itu. Opsi W mengira alfabet hanya 25 huruf ketika kembali dari A (−2 + 25 = 23). Opsi Y mengulang besar geseran juring sebelumnya, yaitu 5, bukan 6 (4 − 5 = −1). Opsi Z memakai besar geseran juring keempat, yaitu 4, bukan 6 (4 − 4 = 0). Jawaban: c." },
    build(p, q, "X", 480, 300, ann), "X");
}

// ── butir produksi 52, 53, 54, 56 (semua HOTS, tiga lapis) ────────────────────────────────────────────────────────────────────────────────
const aroundN = (cx: number, cy: number, n: number, i: number, R: number): Pt => [cx + R * Math.cos(((-90 + (360 / n) * i) * Math.PI) / 180), cy + R * Math.sin(((-90 + (360 / n) * i) * Math.PI) / 180)];
const R = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
/** Beberapa pie sekaligus (pusat "?" pada pie ke-k) untuk soal dan gambar pembahasan. */
function buildMulti(pies: Pie[], k: number, answer: number, h: number, hp: number, ann: string) {
  const pa = pies.map((p) => ({ ...p, startArrow: false })), [x, y] = pieAt(pa[k], "center");
  const label = `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="${HL}">${answer}</text>`;
  return { svg: svgWrap(h, pies.map((p, j) => pie({ ...p, idPrefix: P, ...(j === k ? { center: "?" } : {}) })).join("")),
    pembahasan_svg: svgWrap(hp, pa.map((p, j) => pie(j === k ? { ...p, center: "" } : p)).join("") + redRing(x, y, 26, HL) + label + ann) };
}

// 52 putaran (HOTS, tiga lapis): dari panah, langkah ganjil menambah kuadrat nomor langkah, langkah genap mengurangi nomor langkah.
{
  const v = [6]; for (let k = 1; k <= 6; k++) v.push(k % 2 ? v[k - 1] + k * k : v[k - 1] - k);
  assert.deepEqual(v, [6, 7, 5, 14, 10, 35, 29]);
  const R5 = R(-5, 5), fam: number[][] = []; for (const a of [-1, 0, 1, 2, 3]) for (const b of R(-3, 3)) for (const c of R(-2, 2)) for (const d of R5) fam.push([a, b, c, d]);
  const f = ([a, b, c, d]: number[], p: number, k: number) => a * p + b * k + c * k * k + d;
  // bukti tunggal: (i) dua kelompok langkah (ganjil/genap) dengan rumus a·sebelum + b·k + c·k² + d sendiri-sendiri; (ii) satu rumus untuk semua langkah memakai dua bilangan sebelumnya. Semua yang cocok dengan langkah terlihat harus meramal 29.
  const odd = fam.filter((h) => [1, 3, 5].every((k) => f(h, v[k - 1], k) === v[k])), even = fam.filter((h) => [2, 4].every((k) => f(h, v[k - 1], k) === v[k]));
  let hits = 0;
  for (const _o of odd) for (const e of even) { hits++; assert.equal(f(e, v[5], 6), 29, "52: kelompok langkah alternatif meramal bilangan lain"); }
  for (const a of [-1, 0, 1, 2, 3]) for (const e of [-1, 0, 1, 2]) for (const b of R(-3, 3)) for (const c of R(-2, 2)) for (const d of R5)
    if ([2, 3, 4, 5].every((k) => a * v[k - 1] + e * v[k - 2] + b * k + c * k * k + d === v[k])) { hits++; assert.equal(a * v[5] + e * v[4] + b * 6 + c * 36 + d, 29, "52: rumus tunggal alternatif meramal bilangan lain"); }
  assert.ok(hits >= 1);
  // pengecoh bernama; masing-masing gugur di langkah terlihat
  const wrongs: [number, (k: number, p: number) => number][] = [[23, (k, p) => (k % 2 ? p + k * k : p - 2 * k)], [28, (k, p) => (k % 2 ? p + k * k : p - (k + 1))], [30, (k, p) => (k % 2 ? p + k * k : p - (k - 1))], [41, (k, p) => (k % 2 ? p + k * k : p + k)]];
  for (const [val2, g] of wrongs) { assert.equal(g(6, v[5]), val2); assert.ok([2, 4].some((k) => g(k, v[k - 1]) !== v[k]), `52: pengecoh ${val2} harus gugur di langkah terlihat`); }
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: v.map((x, i) => (i === 6 ? "?" : x)), startArrow: true };
  const ann = (pa: Pie) => [5, 6].map((i) => redRing(...pieAt(pa, "outer", i), 24)).join("") +
    redText(pa.cx, pa.cy + pa.r + 56, "+1² · −2 · +3² · −4 · +5² · −6", 25) + redText(pa.cx, pa.cy + pa.r + 92, "6 → 7 → 5 → 14 → 10 → 35 → 35 − 6 = 29", 23);
  push({ seq: 52, key: "C", instruksi: "Bilangan dibaca searah jarum jam mulai dari tanda panah. Tentukan angka yang tepat untuk menggantikan tanda tanya (?) pada gambar.", choices: ["23", "28", "29", "30", "41"],
    pembahasan: "Baca searah jarum jam mulai dari 6: 6, 7, 5, 14, 10, 35. Selisihnya +1, −2, +9, −4, +25, sehingga ada tiga lapis aturan: langkah ganjil menambah dan langkah genap mengurangi, bilangan yang ditambahkan adalah kuadrat nomor langkah (1², 3², 5²), dan bilangan yang dikurangkan adalah nomor langkah itu sendiri (2 dan 4). Langkah ke-6 adalah langkah genap, jadi mengurangi 6: 35 − 6 = 29.\n\nOpsi 23 mengurangi dua kali nomor langkah (35 − 12); gugur di langkah ke-2 (7 − 4 = 3, bukan 5). Opsi 28 memakai nomor langkah yang lebih besar satu (35 − 7); gugur di langkah ke-2 (7 − 3 = 4, bukan 5). Opsi 30 memakai nomor langkah sebelumnya (35 − 5); gugur di langkah ke-2 (7 − 1 = 6, bukan 5). Opsi 41 menambah 6, padahal langkah genap selalu mengurangi (35 + 6); gugur di langkah ke-2 (7 + 2 = 9, bukan 5). Jawaban: c." },
    build(p, 6, 29, 470, 300, ann), 29);
}
// 53 berseberangan (HOTS, tiga lapis): 8 juring; bilangan di seberang = (bilangan − 2)² + 3. Pasangan: juring i ↔ i + 4.
{
  const xs = [6, 9, 4, 8], ys = xs.map((x) => (x - 2) ** 2 + 3);
  assert.deepEqual(ys, [19, 52, 7, 39]);
  const feats: ((x: number) => number)[] = [(x) => x, (x) => x * x, (x) => x ** 3, (x) => 2 ** x, () => 1], rg = [R(-6, 6), R(-3, 3), R(-2, 2), R(-2, 2), R(-12, 12)];
  let hits = 0;
  const rec = (k: number, cs: number[]): void => {
    if (k < feats.length) { for (const c of rg[k]) rec(k + 1, [...cs, c]); return; }
    if (cs.filter((c) => c).length > 3) return;
    const g = (x: number) => cs.reduce((s, c, j) => s + c * feats[j](x), 0);
    if ([0, 2, 3].every((i) => g(xs[i]) === ys[i])) { hits++; assert.equal(g(xs[1]), 52, `53: aturan alternatif meramal ${g(xs[1])}`); }
  };
  rec(0, []);
  assert.ok(hits >= 1, "53: aturan sebenarnya harus ditemukan");
  const wrongs: [number, (x: number) => number][] = [[55, (x) => (x - 2) ** 2 + 6], [67, (x) => (x - 1) ** 2 + 3], [82, (x) => x * x - 2 + 3], [100, (x) => (x - 2 + 3) ** 2]];
  for (const [val2, g] of wrongs) { assert.equal(g(9), val2); assert.ok([0, 2, 3].some((i) => g(xs[i]) !== ys[i]), `53: pengecoh ${val2} harus gugur di pasangan terlihat`); }
  const outer = [...xs, ys[0], "?", ys[2], ys[3]], p: Pie = { cx: 425, cy: 150, r: 130, outer };
  const ann = (pa: Pie) => [0, 2, 3].map((i) => { const [x, y] = aroundN(pa.cx, pa.cy, 8, i, pa.r + 34); return redText(x, y + 9, `(${xs[i]}−2)²+3 = ${ys[i]}`, 20, x > pa.cx + 20 ? "start" : x < pa.cx - 20 ? "end" : "middle"); }).join("") +
    redText(pa.cx, pa.cy + pa.r + 62, "Juring ?: (9 − 2)² + 3 = 49 + 3 = 52", 26) + redRing(...pieAt(pa, "outer", 1), 24);
  push({ seq: 53, key: "A", instruksi: BUNDAR_53, choices: ["52", "55", "67", "82", "100"],
    pembahasan: "Pasangkan bilangan yang saling berhadapan (melewati pusat): 6 ↔ 19, 9 ↔ ?, 4 ↔ 7, 8 ↔ 39. Aturannya tiga langkah: kurangi bilangan dengan 2, kuadratkan hasilnya, lalu tambah 3 ((6 − 2)² + 3 = 19, (4 − 2)² + 3 = 7, (8 − 2)² + 3 = 39). Jadi ? = (9 − 2)² + 3 = 49 + 3 = 52.\n\nOpsi 55 menambahkan 3 dua kali (49 + 6); gugur di pasangan 4 ↔ 7 (4 + 6 = 10, bukan 7). Opsi 67 mengurangi 1, bukan 2 ((9 − 1)² + 3); gugur di pasangan 4 ↔ 7 (9 + 3 = 12, bukan 7). Opsi 82 mengkuadratkan bilangan lebih dulu, lalu mengurangi 2 dan menambah 3 (81 − 2 + 3); gugur di pasangan 4 ↔ 7 (16 + 1 = 17, bukan 7). Opsi 100 memasukkan tambahan 3 ke dalam kuadrat ((9 − 2 + 3)²); gugur di pasangan 4 ↔ 7 ((4 − 2 + 3)² = 25, bukan 7). Jawaban: a." },
    build(p, 5, 52, 480, 300, ann), 52);
}
// 54 pusat pada tiga lingkaran (HOTS, tiga lapis): pusat = (atas + bawah) × kanan − kiri. Urutan juring: atas, kanan, bawah, kiri.
// Versi pertama ((atas × bawah) − kanan² + kiri) tak ditemukan oleh penguji buta: terlalu tersembunyi; versi ini memakai jumlah, kali, dan kurang yang lazim.
{
  const C: number[][] = [[6, 2, 7, 9], [5, 3, 4, 7], [5, 6, 3, 7]], ctr = ([t, r, b, l]: number[]) => (t + b) * r - l;
  assert.deepEqual(C.map(ctr), [17, 20, 41]);
  const mon: ((v: number[]) => number)[] = [];
  for (let i = 0; i < 4; i++) mon.push((v) => v[i], (v) => v[i] ** 2); for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) mon.push((v) => v[i] * v[j]);
  let hits = 0;
  const rec = (start: number, terms: [number, number][]): void => {
    if (terms.length) { const g = (v: number[]) => terms.reduce((s2, [m, c]) => s2 + c * mon[m](v), 0); if (g(C[0]) === 17 && g(C[1]) === 20) { hits++; assert.equal(g(C[2]), 41, `54: aturan alternatif meramal ${g(C[2])}`); } }
    if (terms.length === 3) return;
    for (let m = start; m < mon.length; m++) for (const c of [-2, -1, 1, 2]) rec(m + 1, [...terms, [m, c]]);
  };
  rec(0, []);
  assert.ok(hits >= 1, "54: aturan sebenarnya harus ditemukan");
  const wrongs: [number, ([t, r, b, l]: number[]) => number][] = [[5, ([t, r, b, l]) => (t - b) * r - l], [7, ([t, r, b, l]) => t + b + r - l], [16, ([t, r, b, l]) => t + b * r - l], [26, ([t, r, b, l]) => (t + r) * b - l]];
  for (const [val2, g] of wrongs) { assert.equal(g(C[2]), val2); assert.ok(g(C[0]) !== 17, `54: pengecoh ${val2} harus gugur di lingkaran 1`); }
  const pies: Pie[] = C.map((v, i) => ({ cx: 155 + i * 270, cy: 150, r: 112, outer: v, center: ctr(v) }));
  const ann = C.map(([t, r, b, l], i) => redText(155 + i * 270, 300, `(${t}+${b}) × ${r} − ${l} = ${i === 2 ? "?" : ctr(C[i])}`, 20)).join("");
  push({ seq: 54, key: "E", instruksi: BUNDAR, choices: ["5", "7", "16", "26", "41"],
    pembahasan: "Bilangan di pusat didapat dari tiga langkah: jumlahkan bilangan atas dan bilangan bawah, kalikan dengan bilangan kanan, lalu kurangi bilangan kiri. Lingkaran 1 (atas 6, kanan 2, bawah 7, kiri 9): (6 + 7) × 2 − 9 = 26 − 9 = 17. Lingkaran 2 (5, 3, 4, 7): (5 + 4) × 3 − 7 = 27 − 7 = 20. Lingkaran 3 (5, 6, 3, 7): (5 + 3) × 6 − 7 = 48 − 7 = 41.\n\nOpsi 5 mengurangkan bilangan atas dengan bilangan bawah, bukan menjumlahkan ((5 − 3) × 6 − 7); gugur di lingkaran 1 ((6 − 7) × 2 − 9 = −11, bukan 17). Opsi 7 menjumlahkan semuanya dan tidak mengalikan (5 + 3 + 6 − 7); gugur di lingkaran 1 (6 + 7 + 2 − 9 = 6, bukan 17). Opsi 16 tidak mengelompokkan atas dan bawah sehingga hanya bilangan bawah yang dikali (5 + 3 × 6 − 7); gugur di lingkaran 1 (6 + 7 × 2 − 9 = 11, bukan 17). Opsi 26 memasangkan bilangan atas dengan bilangan kanan, bukan dengan bilangan bawah ((5 + 6) × 3 − 7); gugur di lingkaran 1 ((6 + 2) × 7 − 9 = 47, bukan 17). Jawaban: e." },
    buildMulti(pies, 2, 41, 290, 325, ann), 41);
}
// 56 huruf (HOTS, tiga lapis): lompatan mengikuti deret Fibonacci (1, 2, 3, 5, 8, 13, 21), arah maju-mundur berganti, melingkar di A/Z.
{
  const fib = [1, 2, 3, 5, 8, 13, 21], v = [6]; fib.forEach((f2, i) => v.push(wrap(v[i] + (i % 2 ? -f2 : f2))));
  const L = v.map(letter);
  assert.deepEqual(L, ["F", "G", "E", "H", "C", "K", "X", "S"]);
  assert.ok(fib.slice(0, 6).some((f2, i) => v[i] + (i % 2 ? -f2 : f2) < 1), "56: hitungan melewati A harus terlihat di juring terlihat");
  const vis = v.slice(0, 7), key = v[7], mod = (n: number) => ((n % 26) + 26) % 26, d = vis.slice(1).map((x, i) => mod(x - vis[i]));
  let hits = 0;
  const chk = (pred: number) => { hits++; assert.equal(pred, key, `56: aturan alternatif meramal ${letter(pred)}`); };
  for (const a of R(-3, 3)) for (const b of R(-3, 3)) for (const c of R(-6, 6)) {
    if (d.slice(2).every((x, i) => mod(a * d[i + 1] + b * d[i] + c) === x)) chk(wrap(vis[6] + mod(a * d[5] + b * d[4] + c)));
    if (vis.slice(2).every((x, i) => wrap(a * vis[i + 1] + b * vis[i] + c) === x)) chk(wrap(a * vis[6] + b * vis[5] + c));
  }
  for (const a of R(-5, 5)) for (const b of R(-8, 8)) for (const c of R(-26, 26)) if (d.every((x, i) => mod(a * (i + 1) ** 2 + b * (i + 1) + c) === x)) chk(wrap(vis[6] + mod(a * 49 + b * 7 + c)));
  for (const c of R(-12, 13)) if (vis.slice(2).every((x, i) => wrap(vis[i] + c) === x)) chk(wrap(vis[5] + c));
  assert.ok(hits >= 1, "56: aturan sebenarnya harus ditemukan");
  assert.deepEqual([wrap(vis[6] - 21), wrap(vis[5] + 21), wrap(vis[6] + 13), wrap(vis[6] + 21 - 27)].map(letter), ["C", "F", "K", "R"]);
  const p: Pie = { cx: 425, cy: 150, r: 130, outer: L.map((l, i) => (i === 7 ? "?" : l)), startArrow: true };
  const ann = (pa: Pie) => [6, 7].map((i) => redRing(...pieAt(pa, "outer", i), 24)).join("") +
    redText(pa.cx, pa.cy + pa.r + 56, "F(6) +1 G(7) −2 E(5) +3 H(8) −5 C(3) +8 K(11) −13 X(24)", 22) + redText(pa.cx, pa.cy + pa.r + 92, "24 + 21 = 45 → 45 − 26 = 19 = S", 26);
  push({ seq: 56, key: "E", instruksi: "Huruf dibaca searah jarum jam mulai dari tanda panah. Huruf mewakili urutannya dalam alfabet (A = 1, B = 2, …, Z = 26); bila hitungan melewati Z, lanjutkan dari A, dan bila mundur melewati A, lanjutkan dari Z. Tentukan huruf yang tepat untuk menggantikan tanda tanya (?) pada gambar.", choices: ["C", "F", "K", "R", "S"],
    pembahasan: "Baca searah jarum jam mulai dari F: F = 6, G = 7, E = 5, H = 8, C = 3, K = 11, X = 24. Selisihnya +1, −2, +3, −5, +8, −13, sehingga ada tiga lapis aturan: besar lompatan mengikuti deret Fibonacci (1, 2, 3, 5, 8, 13, dan seterusnya, masing-masing jumlah dua lompatan sebelumnya), arahnya berganti maju dan mundur, dan hitungan melingkar di ujung alfabet (11 − 13 = −2, lanjut dari Z: 0 = Z, −1 = Y, −2 = X). Lompatan berikutnya +21: 24 + 21 = 45, melewati Z (26) sehingga lanjut dari A: 45 − 26 = 19 = S.\n\nOpsi C lupa arah berganti dan mundur 21 (24 − 21 = 3). Opsi F menghitung dari huruf sebelumnya, K, bukan dari X (11 + 21 = 32, 32 − 26 = 6). Opsi K mengulang lompatan 13, bukan 21 (24 + 13 = 37, 37 − 26 = 11). Opsi R mengira alfabet 27 huruf saat kembali ke A (45 − 27 = 18). Jawaban: e." },
    build(p, 7, "S", 480, 300, ann), "S");
}
