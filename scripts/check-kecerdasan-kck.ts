import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { checkA7, checkNoLeak, data, root, type TeksFile } from "./kecerdasan-teks-lib";

// Cek KCK 97–100 untuk paket v3 (4/5/19), dan 97–99 + butir lama #100 untuk paket 3/14/15/16.
//   node --import tsx scripts/check-kecerdasan-kck.ts
// Tiap butir punya model kecil: ruang nilai (brute force), predikat pernyataan (1)/(2), dan jawaban.
// Klaim cukup/tidak cukup dibuktikan dua arah: brute force (jawaban tunggal ↔ cukup) dan contoh `bukti`
// (dua nilai sah, jawaban beda). Kunci diturunkan dari klaim lalu dibandingkan dengan `k`.

type V = Record<string, number>;
type Model = {
  ruang: () => V[];
  s1: (v: V) => boolean;
  s2: (v: V) => boolean;
  jawab: (v: V) => string | number | boolean;
  cukup1: boolean; cukup2: boolean; cukupGabung: boolean;
  // contoh untuk tiap klaim "tidak cukup": dua nilai sah dengan jawaban berbeda
  bukti: { s1?: [V, V]; s2?: [V, V]; gabung?: [V, V] };
};
type Kck = { s: number; t: string; d: number; jenis: string; i: string; q: string; tabel: { kolom: string[]; baris: string[][] } | null; c: string[]; k: string; bukti: string; p: string; svg?: string | null };

const grid = (dims: Record<string, number[]>): V[] =>
  Object.entries(dims).reduce<V[]>((acc, [n, vals]) => acc.flatMap((v) => vals.map((x) => ({ ...v, [n]: x }))), [{}]);
const steps = (a: number, b: number, d = 1) => Array.from({ length: Math.round((b - a) / d) + 1 }, (_, i) => +(a + i * d).toFixed(6));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const perms = (xs: number[]): number[][] => (xs.length ? xs.flatMap((x) => perms(xs.filter((y) => y !== x)).map((p) => [x, ...p])) : [[]]);

const MODEL: Record<string, Model[]> = {
  "3": [
    { // 97 ALJABAR: x : y (ribu rupiah)
      ruang: () => grid({ x: steps(1, 100), y: steps(1, 100) }),
      s1: (v) => 5 * v.x === 3 * v.y, s2: (v) => v.x + v.y === 64,
      jawab: (v) => `${v.x / gcd(v.x, v.y)}:${v.y / gcd(v.x, v.y)}`,
      cukup1: true, cukup2: false, cukupGabung: true,
      bukti: { s2: [{ x: 24, y: 40 }, { x: 32, y: 32 }] },
    },
    { // 98 TABEL: Posko Selatan p × q, Utara 24 × 2
      ruang: () => grid({ p: steps(1, 60), q: steps(1, 10) }),
      s1: (v) => 48 + v.p * v.q === 120, s2: (v) => v.p === 24 - 6 && v.q === 2 + 2,
      jawab: (v) => v.p * v.q,
      cukup1: true, cukup2: true, cukupGabung: true, bukti: {},
    },
    { // 99 YATIDAK: rata-rata (11 + 12 + t)/3 < 12 ?
      ruang: () => grid({ t: steps(8, 20, 0.5) }),
      s1: (v) => v.t > 12, s2: (v) => v.t === 1.25 * 12,
      jawab: (v) => (11 + 12 + v.t) / 3 < 12,
      cukup1: false, cukup2: true, cukupGabung: true,
      bukti: { s1: [{ t: 12.5 }, { t: 15 }] },
    },
  ],
  "4": [
    { // 97 TABEL: pensil p × q; penghapus 7 × 16
      ruang: () => grid({ p: steps(1, 180), q: steps(1, 180) }),
      s1: (v) => 112 + v.p * v.q === 292, s2: (v) => v.p === 12 && v.q === 15,
      jawab: (v) => v.p * v.q,
      cukup1: true, cukup2: true, cukupGabung: true, bukti: {},
    },
    { // 98 YATIDAK: Sabtu n > Jumat 86? (Kamis 58)
      ruang: () => grid({ n: steps(0, 160) }),
      s1: (v) => v.n === 86 - 17, s2: (v) => v.n > 58,
      jawab: (v) => v.n > 86,
      cukup1: true, cukup2: false, cukupGabung: true,
      bukti: { s2: [{ n: 70 }, { n: 95 }] },
    },
    { // 99 ALJABAR kembar: 2x + y = 53; 6x + 3y = 159; tanya x + y
      ruang: () => grid({ x: steps(1, 53), y: steps(1, 159) }),
      s1: (v) => 2 * v.x + v.y === 53, s2: (v) => 6 * v.x + 3 * v.y === 159,
      jawab: (v) => v.x + v.y,
      cukup1: false, cukup2: false, cukupGabung: false,
      bukti: { s1: [{ x: 9, y: 35 }, { x: 19, y: 15 }], s2: [{ x: 9, y: 35 }, { x: 19, y: 15 }], gabung: [{ x: 9, y: 35 }, { x: 19, y: 15 }] },
    },
    { // 100 GABUNG urutan stan B(uku), M(usik), S(ains), N(seni), K(ebun)
      ruang: () => perms([0, 1, 2, 3, 4]).map(([B, M, S, N, K]) => ({ B, M, S, N, K })),
      s1: (v) => v.M === v.B + 1 && v.N === v.S + 1, s2: (v) => v.K === 2 && v.B < v.S,
      jawab: (v) => "BMSNK".split("").find((n) => v[n] === 0)!,
      cukup1: false, cukup2: false, cukupGabung: true,
      bukti: {
        s1: [{ B: 0, M: 1, K: 2, S: 3, N: 4 }, { S: 0, N: 1, K: 2, B: 3, M: 4 }],
        s2: [{ B: 0, M: 1, K: 2, S: 3, N: 4 }, { M: 0, B: 1, K: 2, N: 3, S: 4 }],
      },
    },
  ],
  "5": [
    { // 97 TABEL: gula p × q; beras 8 × 25
      ruang: () => grid({ p: steps(1, 286), q: steps(1, 286) }),
      s1: (v) => v.p === 8 + 3, s2: (v) => 200 + v.p * v.q === 486,
      jawab: (v) => v.p * v.q,
      cukup1: false, cukup2: true, cukupGabung: true,
      bukti: { s1: [{ p: 11, q: 18 }, { p: 11, q: 22 }] },
    },
    { // 98 YATIDAK: hasil cetak sore n > 145? (pagi 108)
      ruang: () => grid({ n: steps(0, 220) }),
      s1: (v) => v.n === 108 + 24, s2: (v) => v.n <= 108 + 30,
      jawab: (v) => v.n > 145,
      cukup1: true, cukup2: true, cukupGabung: true, bukti: {},
    },
    { // 99 ALJABAR: harga dalam ribu rupiah; selisih pembelian tepat x + y
      ruang: () => grid({ x: steps(1, 47), y: steps(1, 79) }),
      s1: (v) => 3 * v.x + 2 * v.y === 79, s2: (v) => 2 * v.x + v.y === 47,
      jawab: (v) => v.x + v.y,
      cukup1: false, cukup2: false, cukupGabung: true,
      bukti: { s1: [{ x: 9, y: 26 }, { x: 15, y: 17 }], s2: [{ x: 10, y: 27 }, { x: 15, y: 17 }] },
    },
    { // 100 GABUNG geometri: ukuran 10 dan 21 belum menentukan sisi berlabel a
      ruang: () => grid({ a: steps(1, 210), b: steps(1, 210) }),
      s1: (v) => 2 * (v.a + v.b) === 62, s2: (v) => v.a * v.b === 210,
      jawab: (v) => v.a,
      cukup1: false, cukup2: false, cukupGabung: false,
      bukti: { s1: [{ a: 10, b: 21 }, { a: 15, b: 16 }], s2: [{ a: 10, b: 21 }, { a: 7, b: 30 }], gabung: [{ a: 10, b: 21 }, { a: 21, b: 10 }] },
    },
  ],
  "14": [
    { // 97 TABEL: SD Harapan p × q, SD Mekar 8 × 30
      ruang: () => grid({ p: steps(1, 20), q: steps(1, 60) }),
      s1: (v) => v.p === 8 - 4, s2: (v) => 240 + v.p * v.q === 360,
      jawab: (v) => v.p * v.q,
      cukup1: false, cukup2: true, cukupGabung: true,
      bukti: { s1: [{ p: 4, q: 30 }, { p: 4, q: 25 }] },
    },
    { // 98 YATIDAK: k > 42 ? (Senin 42, Selasa 38)
      ruang: () => grid({ k: steps(0, 100) }),
      s1: (v) => (42 + 38 + v.k) / 3 === 39, s2: (v) => v.k < (42 + 38) / 2,
      jawab: (v) => v.k > 42,
      cukup1: true, cukup2: true, cukupGabung: true, bukti: {},
    },
    { // 99 ALJABAR kembar: h ?
      ruang: () => grid({ h: steps(0, 40), r: steps(0, 150) }),
      s1: (v) => v.r === 3 * v.h + 2, s2: (v) => 2 * v.r === 6 * v.h + 4,
      jawab: (v) => v.h,
      cukup1: false, cukup2: false, cukupGabung: false,
      bukti: { s1: [{ h: 5, r: 17 }, { h: 10, r: 32 }], s2: [{ h: 5, r: 17 }, { h: 10, r: 32 }], gabung: [{ h: 5, r: 17 }, { h: 10, r: 32 }] },
    },
  ],
  "15": [
    { // 97 GABUNG pekerja: hari Wiryo (w); 1/d + 1/w = 1/4
      ruang: () => grid({ d: steps(1, 40), w: steps(1, 40) }),
      s1: (v) => v.d === 6, s2: (v) => v.d * v.w === 4 * (v.d + v.w),
      jawab: (v) => v.w,
      cukup1: false, cukup2: false, cukupGabung: true,
      bukti: { s1: [{ d: 6, w: 12 }, { d: 6, w: 8 }], s2: [{ d: 6, w: 12 }, { d: 8, w: 8 }] },
    },
    { // 98 TABEL: Pos 2 p × q, Pos 1 7 hari; h1 = tilang hari pertama (hari lain ≥ 0)
      ruang: () => grid({ p: steps(1, 20), q: steps(1, 40), h1: steps(0, 40) }),
      s1: (v) => 7 + v.p === 12,
      s2: (v) => v.h1 === 18 && (v.p === 1 ? v.q === 18 : v.p * v.q >= 18),
      jawab: (v) => v.p * v.q,
      cukup1: false, cukup2: false, cukupGabung: false,
      bukti: {
        s1: [{ p: 5, q: 18, h1: 18 }, { p: 5, q: 20, h1: 18 }],
        s2: [{ p: 5, q: 18, h1: 18 }, { p: 4, q: 20, h1: 18 }],
        gabung: [{ p: 5, q: 18, h1: 18 }, { p: 5, q: 20, h1: 18 }],
      },
    },
    { // 99 YATIDAK: 450 + 380 + s > 1300 ? (ribu rupiah)
      ruang: () => grid({ s: steps(0, 1000, 5) }),
      s1: (v) => v.s > 380, s2: (v) => v.s <= (450 + 380) / 2,
      jawab: (v) => 450 + 380 + v.s > 1300,
      cukup1: false, cukup2: true, cukupGabung: true,
      bukti: { s1: [{ s: 400 }, { s: 500 }] },
    },
  ],
  "16": [
    { // 97 TABEL: motor p × q, mobil 6 × 20
      ruang: () => grid({ p: steps(1, 30), q: steps(0.5, 20, 0.5) }),
      s1: (v) => 120 + v.p * v.q === 186, s2: (v) => v.p === 2 * 6,
      jawab: (v) => v.p * v.q,
      cukup1: true, cukup2: false, cukupGabung: true,
      bukti: { s2: [{ p: 12, q: 5 }, { p: 12, q: 4 }] },
    },
    { // 98 YATIDAK: f ≥ 165 ? (Galih 168, Hendra 172)
      ruang: () => grid({ f: steps(140, 200, 0.5) }),
      s1: (v) => v.f < 168, s2: (v) => Math.abs(v.f - 172) > 7,
      jawab: (v) => v.f >= 165,
      cukup1: false, cukup2: false, cukupGabung: true,
      bukti: { s1: [{ f: 166 }, { f: 160 }], s2: [{ f: 180 }, { f: 160 }] },
    },
    { // 99 GABUNG urutan: loket (indeks 0–3) untuk K, L, M, N; siapa di loket 2?
      ruang: () => perms([0, 1, 2, 3]).map(([K, L, M, N]) => ({ K, L, M, N })),
      s1: (v) => v.K === v.M + 1, s2: (v) => v.N === 1 || v.N === 2,
      jawab: (v) => "KLMN".split("").find((n) => v[n] === 1)!,
      cukup1: false, cukup2: false, cukupGabung: false,
      bukti: {
        s1: [{ M: 0, K: 1, N: 2, L: 3 }, { L: 0, N: 1, M: 2, K: 3 }],
        s2: [{ M: 0, K: 1, N: 2, L: 3 }, { K: 0, N: 1, L: 2, M: 3 }],
        gabung: [{ M: 0, K: 1, N: 2, L: 3 }, { L: 0, N: 1, M: 2, K: 3 }],
      },
    },
  ],
  "19": [
    { // 97 TABEL: Aula Timur p × q; Aula Barat 12 × 15
      ruang: () => grid({ p: steps(1, 40), q: steps(1, 160) }),
      s1: (v) => v.p === 12 - 4 && v.q === 15 + 5, s2: (v) => 180 + v.p * v.q === 340,
      jawab: (v) => v.p * v.q,
      cukup1: true, cukup2: true, cukupGabung: true, bukti: {},
    },
    { // 98 YATIDAK HOTS: n > 60 ? (Senin 64, Selasa 58); (1) selisih dua arah, (2) n di dalam rata-rata
      ruang: () => grid({ n: steps(0, 200) }),
      s1: (v) => Math.abs(v.n - 58) === 5, s2: (v) => v.n > (64 + 58 + v.n) / 3,
      jawab: (v) => v.n > 60,
      cukup1: false, cukup2: true, cukupGabung: true,
      bukti: { s1: [{ n: 63 }, { n: 53 }] },
    },
    { // 99 ALJABAR kelipatan: 4x + 6y (ribu rupiah)
      ruang: () => grid({ x: steps(0.5, 17, 0.5), y: steps(0.5, 17, 0.5) }),
      s1: (v) => 2 * v.x + 3 * v.y === 17, s2: (v) => v.x - v.y === 1,
      jawab: (v) => 4 * v.x + 6 * v.y,
      cukup1: true, cukup2: false, cukupGabung: true,
      bukti: { s2: [{ x: 4, y: 3 }, { x: 5, y: 4 }] },
    },
    { // 100 GABUNG umur: (2) setara dengan (1), Rani lebih tua
      ruang: () => grid({ a: steps(6, 40), b: steps(6, 40) }).filter((v) => v.a > v.b),
      s1: (v) => v.a + v.b === 30, s2: (v) => v.a - 5 + (v.b - 5) === 20,
      jawab: (v) => v.b,
      cukup1: false, cukup2: false, cukupGabung: false,
      bukti: { s1: [{ a: 18, b: 12 }, { a: 20, b: 10 }], s2: [{ a: 18, b: 12 }, { a: 20, b: 10 }], gabung: [{ a: 18, b: 12 }, { a: 20, b: 10 }] },
    },
  ],
  "20": [ // Simulasi 5, semua HOTS
    { // 97 TABEL: Meja Selatan p × q; Utara 9 × 14
      ruang: () => grid({ p: steps(1, 60), q: steps(1, 60) }),
      s1: (v) => v.q === 9 + 1, s2: (v) => 9 * 14 - 9 * 2 === v.p * v.q + 9 * 2, jawab: (v) => v.p * v.q,
      cukup1: false, cukup2: true, cukupGabung: true, bukti: { s1: [{ p: 8, q: 10 }, { p: 9, q: 10 }] } },
    { // 98 YATIDAK: m > 200 ? (Jumat 140, Sabtu 215)
      ruang: () => grid({ m: steps(0, 500) }),
      s1: (v) => v.m < (140 + 215 + v.m) / 3, s2: (v) => Math.abs(v.m - 215) === 215 - 140 && v.m < Math.max(140, 215), jawab: (v) => v.m > 200,
      cukup1: true, cukup2: true, cukupGabung: true, bukti: {} },
    { // 99 ALJABAR kembar terselubung: x : y = 3 : 2 dan 2x = 3y (ribu rupiah)
      ruang: () => grid({ x: steps(1, 150), y: steps(1, 150) }),
      s1: (v) => v.x * 2 === v.y * 3, s2: (v) => 2 * v.x === 3 * v.y, jawab: (v) => v.x,
      cukup1: false, cukup2: false, cukupGabung: false,
      bukti: { s1: [{ x: 30, y: 20 }, { x: 45, y: 30 }], s2: [{ x: 30, y: 20 }, { x: 45, y: 30 }], gabung: [{ x: 30, y: 20 }, { x: 45, y: 30 }] } },
    { // 100 GABUNG urutan: indeks 0-3 untuk A, B, C, D; siapa ketiga (indeks 2)?
      ruang: () => perms([0, 1, 2, 3]).map(([A, B, C, D]) => ({ A, B, C, D })),
      s1: (v) => v.B === v.D + 1, s2: (v) => v.A < v.C && v.C !== 3, jawab: (v) => "ABCD".split("").find((n) => v[n] === 2)!,
      cukup1: false, cukup2: false, cukupGabung: true,
      bukti: { s1: [{ D: 0, B: 1, A: 2, C: 3 }, { A: 0, C: 1, D: 2, B: 3 }], s2: [{ A: 0, C: 1, D: 2, B: 3 }, { A: 0, B: 1, C: 2, D: 3 }] } },
  ],
};

// Jenis KCK lama #100 (dibaca dari stem; tidak ada field jenis di file teks).
const LAMA: Record<string, { file: string; jenis: string }> = {
  "3": { file: "kecerdasan_p3_teks.json", jenis: "GABUNG" },   // luas persegi panjang (geometri)
  "14": { file: "kecerdasan_s2_teks.json", jenis: "GABUNG" },  // umur Andi
  "15": { file: "kecerdasan_p15_teks.json", jenis: "ALJABAR" }, // x + y
  "16": { file: "kecerdasan_p16_teks.json", jenis: "ALJABAR" }, // akar ganda x² = 4x
};

const kunci = (m: Model) => m.cukup1 && m.cukup2 ? "D" : m.cukup1 ? "A" : m.cukup2 ? "B" : m.cukupGabung ? "C" : "E";
const JUDUL = ["Yang sebenarnya ditanya", "Cek pernyataan (1) saja", "Cek pernyataan (2) saja"];
const TAIL = ["Biar gampang diingat", "Jebakan di soal ini"];

function cekModel(tag: string, m: Model) {
  const ruang = m.ruang();
  const cukup = (pred: (v: V) => boolean, label: string) => {
    const hasil = new Set(ruang.filter(pred).map((v) => String(m.jawab(v))));
    assert.ok(hasil.size > 0, `${tag}: ${label} tidak punya nilai sah di ruang brute force`);
    return hasil.size === 1;
  };
  assert.equal(cukup(m.s1, "(1)"), m.cukup1, `${tag}: klaim cukup1 tidak cocok dengan brute force`);
  assert.equal(cukup(m.s2, "(2)"), m.cukup2, `${tag}: klaim cukup2 tidak cocok dengan brute force`);
  assert.equal(cukup((v) => m.s1(v) && m.s2(v), "gabungan"), m.cukupGabung, `${tag}: klaim cukupGabung tidak cocok dengan brute force`);
  if (m.cukup1 || m.cukup2) assert.ok(m.cukupGabung, `${tag}: satu pernyataan cukup berarti gabungan juga cukup`);
  const perlu: [keyof Model["bukti"], (v: V) => boolean, boolean][] = [
    ["s1", m.s1, !m.cukup1], ["s2", m.s2, !m.cukup2], ["gabung", (v) => m.s1(v) && m.s2(v), !m.cukup1 && !m.cukup2 && !m.cukupGabung],
  ];
  for (const [n, pred, wajib] of perlu) {
    const b = m.bukti[n];
    if (!wajib) { assert.ok(!b, `${tag}: bukti ${n} ada padahal klaimnya cukup`); continue; }
    assert.ok(b, `${tag}: bukti ${n} wajib (klaim tidak cukup)`);
    assert.ok(b.every(pred), `${tag}: contoh bukti ${n} tidak memenuhi pernyataan`);
    assert.notEqual(String(m.jawab(b[0])), String(m.jawab(b[1])), `${tag}: contoh bukti ${n} memberi jawaban sama`);
  }
}

function cekPembahasan(tag: string, x: Kck, m: Model, v3: boolean) {
  const bag = x.p.split("\n\n");
  const judul = bag.map((b) => b.split("\n")[0]);
  const gabung = !m.cukup1 && !m.cukup2;
  const harap = [...JUDUL, ...(gabung ? [v3 ? "Cek gabungan" : "Kalau digabung"] : []), `Jawaban: ${x.k}`, ...TAIL];
  assert.deepEqual(judul, harap, `${tag}: urutan bagian pembahasan`);
  const jaw = bag[judul.indexOf(`Jawaban: ${x.k}`)];
  for (const h of "ABCDE") {
    const ada = jaw.includes(`Opsi ${h} gugur karena`);
    assert.equal(ada, h !== x.k, `${tag}: baris "Opsi ${h} gugur" ${h === x.k ? "tidak boleh ada" : "wajib ada"}`);
  }
  assert.ok(!x.p.includes("<br>"), `${tag}: paket DB memakai \\n\\n, bukan <br>`);
}

const file = data("kecerdasan_kck_kal.json") as Record<string, Kck[]>;
assert.deepEqual(Object.keys(file).sort(), Object.keys(MODEL).sort(), "paket di file");
const V3: Record<string, string> = { "4": "DAEC", "5": "BDCE", "19": "DBAE", "20": "BDEC" };
const bankTeks = fs.readdirSync(path.join(root, "prisma/data")).filter((f) => /^kecerdasan_p\d+_teks\.json$/.test(f));
bankTeks.push("kecerdasan_s2_teks.json");
const stems = new Set<string>();
const ringkas: string[] = [];
for (const [pkg, items] of Object.entries(file)) {
  const v3 = pkg in V3;
  const lama = v3 ? undefined : (data(LAMA[pkg].file) as TeksFile).soal.find((x) => x.s === 100);
  if (!v3) assert.ok(lama && lama.t === "KCK", `pkg ${pkg}: KCK lama #100 tidak ditemukan`);
  const baku = v3 ? file["15"][0] : lama!;
  assert.deepEqual(items.map((x) => x.s), v3 ? [97, 98, 99, 100] : [97, 98, 99], `pkg ${pkg}: nomor`);
  assert.deepEqual(items.map((x) => x.d), v3 ? (pkg === "20" ? [3, 3, 3, 3] : pkg === "19" ? [2, 3, 3, 3] : [2, 2, 3, 3]) : [2, 3, 3], `pkg ${pkg}: tingkat`);
  assert.equal(items.length, MODEL[pkg].length, `pkg ${pkg}: jumlah model`);
  if (v3) {
    assert.equal(items.map((x) => x.k).join(""), V3[pkg], `pkg ${pkg}: kunci wajib 97–100`);
    checkA7(`pkg ${pkg}`, items);
    assert.ok(!/\b(?:posko|pos\s+(?:jaga|ronda))\b/i.test(JSON.stringify(items)), `pkg ${pkg}: konteks terlarang dalam brief`);
    checkNoLeak({ wacana: {}, soal: items }, bankTeks);
  }
  items.forEach((x, n) => {
    const tag = `pkg ${pkg} #${x.s}`;
    const m = MODEL[pkg][n];
    assert.equal(x.t, "KCK", `${tag}: tipe`);
    assert.equal(x.i, baku.i, `${tag}: instruksi harus sama dengan KCK baku`);
    assert.deepEqual(x.c, baku.c, `${tag}: opsi harus sama dengan KCK baku`);
    assert.equal(kunci(m), x.k, `${tag}: kunci dari klaim (${kunci(m)}) ≠ k (${x.k})`);
    assert.match(x.q, /\nPertanyaan: .+\nPernyataan \(1\): .+\nPernyataan \(2\): .+$/, `${tag}: bentuk stem`);
    assert.ok(!stems.has(x.q), `${tag}: stem kembar`); stems.add(x.q);
    if (x.tabel) {
      assert.ok(x.tabel.baris.every((b) => b.length === x.tabel!.kolom.length), `${tag}: lebar baris tabel`);
      assert.ok(/tabel di bawah/.test(x.q), `${tag}: stem harus merujuk "tabel di bawah" (SVG tampil di bawah teks)`);
      if ("svg" in x) assert.ok(x.svg && !/\bid=/.test(x.svg), `${tag}: svg ada dan tanpa id`);
    } else assert.ok(!x.svg, `${tag}: svg tanpa tabel`);
    assert.ok(x.bukti.length > 20, `${tag}: bukti kosong`);
    cekModel(tag, m);
    cekPembahasan(tag, x, m, v3);
  });
  const semua = items.map((x) => ({ s: x.s, jenis: x.jenis, k: x.k, d: x.d, tabel: !!x.tabel }));
  if (lama) semua.push({ s: 100, jenis: LAMA[pkg].jenis, k: lama.k, d: lama.d ?? 0, tabel: false });
  assert.equal(new Set(semua.map((x) => x.jenis)).size, 4, `pkg ${pkg}: 4 jenis berbeda`);
  assert.ok(semua.every((x) => ["TABEL", "YATIDAK", "ALJABAR", "GABUNG"].includes(x.jenis)), `pkg ${pkg}: jenis tidak dikenal`);
  assert.equal(new Set(semua.map((x) => x.k)).size, 4, `pkg ${pkg}: 4 kunci berbeda`);
  assert.ok(semua.some((x) => x.k === "C" || x.k === "E"), `pkg ${pkg}: minimal satu kunci C/E`);
  assert.ok(semua.filter((x) => x.tabel).length >= 2, `pkg ${pkg}: minimal 2 butir bertabel`);
  for (const x of semua) ringkas.push(`pkg ${pkg.padStart(2)} #${x.s}  ${x.jenis.padEnd(7)} kunci ${x.k}  tingkat ${x.d}  tabel ${x.tabel ? "ya" : "tidak"}`);
}
console.log(ringkas.join("\n"));
console.log(`OK: ${stems.size} butir KCK baru lolos (klaim, brute force, bukti, pembahasan, sebaran).`);
