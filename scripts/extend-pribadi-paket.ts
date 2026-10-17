import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Paket simulasi PRIBADI baru = paket lama + blok aspek tambahan (Peraturan As SDM Kapolri
// No. 3/2017: Bintara & Tamtama juga dinilai Loyalitas dan Kerja Sama). Paket lama tidak diubah
// supaya sesi lama tetap dinilai dengan butir yang memang dikerjakannya.
//   npx tsx scripts/extend-pribadi-paket.ts 11:16 12:17 13:18 14:19 15:20
// Tiap aspek tambahan 8 butir (1L+2K+1KR favorable dan unfavorable, pedoman §4.1),
// disisipkan setelah 48 Kepribadian lama, sebelum Substansi Khusus.

const PASANGAN = process.argv.slice(2).map((s) => s.split(":").map(Number));
assert.ok(PASANGAN.length && PASANGAN.every(([a, b]) => Number.isInteger(a) && Number.isInteger(b)), "Pakai: extend-pribadi-paket.ts <lama>:<baru> ...");
const ASPEK_BARU = ["Loyalitas", "Kerja Sama"];
const KP_SLOT: [string, string, number][] = [["L", "favorable", 1], ["L", "unfavorable", 1], ["K", "favorable", 2], ["K", "unfavorable", 2], ["KR", "favorable", 1], ["KR", "unfavorable", 1]];

const dir = path.join(__dirname, "../bank/pribadi");
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const nama = (n: number) => `paket-${String(n).padStart(2, "0")}.json`;

let seed = 20261017;
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
const kp: Kp[] = fs.readdirSync(dir).filter((f) => /^kp-.*\.json$/.test(f)).flatMap((f) => read(f).items);
const kpIds = new Set(kp.map((k) => k.id));
const stok = new Map<string, Kp[]>();
for (const a of ASPEK_BARU) for (const [j, arah] of KP_SLOT) stok.set(`${a}|${j}|${arah}`, shuffle(kp.filter((k) => !used.has(k.id) && k.aspek === a && k.jenis === j && k.arah === arah)));

for (const [lama, baru] of PASANGAN) {
  assert.ok(!fs.existsSync(path.join(dir, nama(baru))), `${nama(baru)} sudah ada`);
  const m = read(nama(lama)) as { label: string; urutan: string[] };
  const nKp = m.urutan.filter((id) => kpIds.has(id)).length;
  const blok = ASPEK_BARU.flatMap((a) => shuffle(KP_SLOT.flatMap(([j, arah, n]) => {
    const p = stok.get(`${a}|${j}|${arah}`)!;
    assert.ok(p.length >= n, `stok habis: ${a} ${j} ${arah}`);
    return p.splice(0, n).map((k) => k.id);
  })));
  fs.writeFileSync(path.join(dir, nama(baru)), JSON.stringify({
    paket: baru,
    label: m.label,
    catatan: `Salinan ${nama(lama)} + ${ASPEK_BARU.join(" & ")} (8 butir per aspek) untuk psikogram Bintara/Tamtama. Bagian 1 Kepribadian (${nKp + blok.length}, blok per aspek), Bagian 2 Substansi Khusus (acak).`,
    urutan: [...m.urutan.slice(0, nKp), ...blok, ...m.urutan.slice(nKp)],
  }, null, 2) + "\n");
  console.log(`${nama(baru)}: ${nama(lama)} + ${blok.length} butir ${ASPEK_BARU.join("/")}`);
}
