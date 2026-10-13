import assert from "node:assert/strict";
import { data, type TeksFile } from "./kecerdasan-teks-lib";

// Cek butir kecukupan data 97–99 (prisma/data/kecerdasan_kck_kal.json) untuk paket 3, 14, 15, 16.
//   npx tsx scripts/check-kecerdasan-kck.ts
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
type Kck = { s: number; t: string; d: number; jenis: string; i: string; q: string; tabel: { kolom: string[]; baris: string[][] } | null; c: string[]; k: string; bukti: string; p: string; svg?: string };

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

function cekPembahasan(tag: string, x: Kck, m: Model) {
  const bag = x.p.split("\n\n");
  const judul = bag.map((b) => b.split("\n")[0]);
  const gabung = !m.cukup1 && !m.cukup2;
  const harap = [...JUDUL, ...(gabung ? ["Kalau digabung"] : []), `Jawaban: ${x.k}`, ...TAIL];
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
const stems = new Set<string>();
const ringkas: string[] = [];
for (const [pkg, items] of Object.entries(file)) {
  const lama = (data(LAMA[pkg].file) as TeksFile).soal.find((x) => x.s === 100);
  assert.ok(lama && lama.t === "KCK", `pkg ${pkg}: KCK lama #100 tidak ditemukan`);
  assert.deepEqual(items.map((x) => x.s), [97, 98, 99], `pkg ${pkg}: nomor`);
  assert.deepEqual(items.map((x) => x.d), [2, 3, 3], `pkg ${pkg}: tingkat (1 sedang di 97, 2 HOTS)`);
  items.forEach((x, n) => {
    const tag = `pkg ${pkg} #${x.s}`;
    const m = MODEL[pkg][n];
    assert.equal(x.t, "KCK", `${tag}: tipe`);
    assert.equal(x.i, lama.i, `${tag}: instruksi harus sama dengan KCK lama`);
    assert.deepEqual(x.c, lama.c, `${tag}: opsi harus sama dengan KCK lama`);
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
    cekPembahasan(tag, x, m);
  });
  const semua = [...items.map((x) => ({ s: x.s, jenis: x.jenis, k: x.k, d: x.d, tabel: !!x.tabel })), { s: 100, jenis: LAMA[pkg].jenis, k: lama.k, d: lama.d ?? 0, tabel: false }];
  assert.equal(new Set(semua.map((x) => x.jenis)).size, 4, `pkg ${pkg}: 4 jenis berbeda`);
  assert.ok(semua.every((x) => ["TABEL", "YATIDAK", "ALJABAR", "GABUNG"].includes(x.jenis)), `pkg ${pkg}: jenis tidak dikenal`);
  assert.equal(new Set(semua.map((x) => x.k)).size, 4, `pkg ${pkg}: 4 kunci berbeda`);
  assert.ok(semua.some((x) => x.k === "C" || x.k === "E"), `pkg ${pkg}: minimal satu kunci C/E`);
  assert.ok(semua.filter((x) => x.tabel).length >= 2, `pkg ${pkg}: minimal 2 butir bertabel`);
  for (const x of semua) ringkas.push(`pkg ${pkg.padStart(2)} #${x.s}  ${x.jenis.padEnd(7)} kunci ${x.k}  tingkat ${x.d}  tabel ${x.tabel ? "ya" : "tidak"}`);
}
console.log(ringkas.join("\n"));
console.log(`OK: ${stems.size} butir KCK baru lolos (klaim, brute force, bukti, pembahasan, sebaran).`);
