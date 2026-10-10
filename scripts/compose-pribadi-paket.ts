import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Menyusun manifest paket latihan PRIBADI (bank/pribadi/paket-NN.json) dari
// butir bank yang belum dipakai paket mana pun. Komposisi per paket mengikuti
// pedoman §4.1-4.2: 48 Kepribadian (per aspek 1L+2K+1KR favorable dan
// unfavorable) + 63 Substansi Khusus (proporsi dimensi sumber, 4 pasang kembar),
// kunci SK berposisi A 31-32 butir.
//   npx tsx scripts/compose-pribadi-paket.ts 3 11
// Manifest yang sudah ada tidak pernah ditimpa.

const [FROM, TO] = process.argv.slice(2).map(Number);
assert.ok(Number.isInteger(FROM) && Number.isInteger(TO) && FROM <= TO, "Pakai: compose-pribadi-paket.ts <dari> <sampai>");
const dir = path.join(__dirname, "../bank/pribadi");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const manifestName = (n: number) => `paket-${String(n).padStart(2, "0")}.json`;

let seed = 20261010;
const rng = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const used = new Set<string>();
for (const f of fs.readdirSync(dir).filter((f) => /^paket-\d+\.json$/.test(f))) for (const id of read(f).urutan) used.add(id);

type Kp = { id: string; aspek: string; jenis: string; arah: string };
type Sk = { id: string; dimensi: string; sub?: string; kunci: "A" | "B"; kembar_dengan: string | null };
const kp: Kp[] = [], sk: Sk[] = [];
for (const f of fs.readdirSync(dir)) {
  if (/^kp-.*\.json$/.test(f)) kp.push(...read(f).items);
  if (/^sk-.*\.json$/.test(f)) sk.push(...read(f).items);
}
const skById = new Map(sk.map((s) => [s.id, s]));

const ASPEK = ["Prososial", "Pengambilan Keputusan", "Penyesuaian Diri", "Kepercayaan Diri", "Stabilitas Emosi", "Motif Berprestasi"];
const KP_SLOT: [string, string, number][] = [["L", "favorable", 1], ["L", "unfavorable", 1], ["K", "favorable", 2], ["K", "unfavorable", 2], ["KR", "favorable", 1], ["KR", "unfavorable", 1]];
// [kategori, butir tunggal per paket]; pasangan kembar diambil terpisah (1 pasang per paket).
const SK_SLOT: [string, number][] = [
  ["D1", 2], ["D2", 3], ["D3", 4], ["D4:patuh", 6], ["D4:inovasi", 6], ["D5", 4], ["D6:berani", 4], ["D6:mengukur", 2],
  ["D7:tegas", 2], ["D7:tenang", 2], ["D8", 8], ["D9", 6], ["D10", 2], ["D11", 4],
];
const TWIN_DIMS = ["D1", "D2", "D3", "D5"];
const cat = (s: Sk) => (s.sub ? `${s.dimensi}:${s.sub}` : s.dimensi);

const pool = <T,>(items: T[]) => shuffle(items);
const kpPool = new Map<string, Kp[]>();
for (const a of ASPEK) for (const [j, arah] of KP_SLOT) kpPool.set(`${a}|${j}|${arah}`, pool(kp.filter((k) => !used.has(k.id) && k.aspek === a && k.jenis === j && k.arah === arah)));
const skPool = new Map<string, Sk[]>();
for (const [c] of SK_SLOT) skPool.set(c, pool(sk.filter((s) => !used.has(s.id) && !s.kembar_dengan && cat(s) === c)));
const twinPool = new Map<string, [Sk, Sk][]>();
for (const d of TWIN_DIMS) {
  const pairs = sk.filter((s) => !used.has(s.id) && s.dimensi === d && s.kembar_dengan && s.id < s.kembar_dengan).map((s) => [s, skById.get(s.kembar_dengan!)!] as [Sk, Sk]);
  twinPool.set(d, pool(pairs));
}
const take = <T,>(p: T[] | undefined, n: number, what: string) => {
  assert.ok(p && p.length >= n, `stok habis: ${what}`);
  return p.splice(0, n);
};

type Paket = { n: number; kp: string[]; sk: Sk[] };
const pakets: Paket[] = [];
for (let n = FROM; n <= TO; n++) {
  assert.ok(!fs.existsSync(path.join(dir, manifestName(n))), `${manifestName(n)} sudah ada`);
  const kpIds: string[] = [];
  for (const a of ASPEK) {
    const blk: string[] = [];
    for (const [j, arah, k] of KP_SLOT) blk.push(...take(kpPool.get(`${a}|${j}|${arah}`), k, `${a} ${j} ${arah}`).map((x) => x.id));
    kpIds.push(...shuffle(blk));
  }
  const skItems: Sk[] = [];
  for (const [c, k] of SK_SLOT) skItems.push(...take(skPool.get(c), k, c));
  for (const d of TWIN_DIMS) skItems.push(...take(twinPool.get(d), 1, `kembar ${d}`)[0]);
  assert.equal(skItems.length, 63);
  pakets.push({ n, kp: kpIds, sk: skItems });
}

// Seimbangkan posisi kunci: tukar butir tunggal sekategori antar paket sampai
// tiap paket punya 31-32 kunci A.
const countA = (p: Paket) => p.sk.filter((s) => s.kunci === "A").length;
for (let guard = 0; guard < 10000; guard++) {
  const hi = pakets.find((p) => countA(p) > 32), lo = pakets.find((p) => countA(p) < 31);
  const over = hi ?? pakets.find((p) => countA(p) === 32 && lo);
  const under = lo ?? pakets.find((p) => countA(p) === 31 && hi);
  if (!hi && !lo) break;
  assert.ok(over && under && over !== under, "posisi kunci tidak bisa diseimbangkan");
  let swapped = false;
  for (const [i, a] of over.sk.entries()) {
    if (a.kunci !== "A" || a.kembar_dengan) continue;
    const j = under.sk.findIndex((b) => b.kunci === "B" && !b.kembar_dengan && cat(b) === cat(a));
    if (j < 0) continue;
    [over.sk[i], under.sk[j]] = [under.sk[j], a];
    swapped = true;
    break;
  }
  assert.ok(swapped, `tidak ada pasangan tukar untuk paket ${over.n} → ${under.n}`);
}

for (const p of pakets) {
  assert.ok(countA(p) >= 31 && countA(p) <= 32, `paket ${p.n}: kunci A ${countA(p)}`);
  let order: string[];
  do {
    order = shuffle(p.sk.map((s) => s.id));
  } while (p.sk.some((s) => s.kembar_dengan && Math.abs(order.indexOf(s.id) - order.indexOf(s.kembar_dengan)) < 10));
  fs.writeFileSync(path.join(dir, manifestName(p.n)), JSON.stringify({
    paket: p.n,
    label: `Paket ${p.n - 1}`,
    catatan: "Bagian 1 Kepribadian (48, blok per aspek), Bagian 2 Substansi Khusus (63, acak, butir kembar berjarak >= 10).",
    urutan: [...p.kp, ...order],
  }, null, 2) + "\n");
  console.log(`${manifestName(p.n)}: 48 KP + 63 SK, kunci A ${countA(p)}`);
}
