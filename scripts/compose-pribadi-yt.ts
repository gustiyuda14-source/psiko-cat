import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Manifest paket Kepribadian Ya/Tidak (bank/pribadi/paket-NN.json) dari satu batch yt-0N (70 butir:
// 6 aspek × 10 + 10 Validitas). Urutan acak berseed tetap; syarat: pasangan berjarak >= 15 nomor,
// tidak ada 3 butir aspek sama berurutan, Validitas tidak berurutan, kunci sama maks 4 berturut-turut.
//   npx tsx scripts/compose-pribadi-yt.ts 1   → yt-01 → paket-31.json ("Ya/Tidak Paket 1")
// Manifest yang sudah ada tidak pernah ditimpa.

const N = Number(process.argv[2]);
assert.ok(Number.isInteger(N) && N >= 1, "Pakai: compose-pribadi-yt.ts <nomor batch yt>");
const PKG = 30 + N;
const dir = path.join(__dirname, "../bank/pribadi");
const batch = `yt-${String(N).padStart(2, "0")}`;
const out = path.join(dir, `paket-${PKG}.json`);
assert.ok(!fs.existsSync(out), `${path.basename(out)} sudah ada`);
type It = { id: string; aspek: string; kunci: "Ya" | "Tidak"; pasangan: string | null };
const items = (JSON.parse(fs.readFileSync(path.join(dir, `${batch}.json`), "utf8")) as { items: It[] }).items;
assert.equal(items.length, 70, `${batch} harus 70 butir`);
const byId = new Map(items.map((x) => [x.id, x]));

let seed = PKG * 7919 + 20261021;
const rng = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function lolos(ids: string[]): boolean {
  const it = ids.map((id) => byId.get(id)!);
  for (let i = 0; i < it.length; i++) {
    const p = it[i].pasangan;
    if (p && Math.abs(i - ids.indexOf(p)) < 15) return false;
    if (i >= 1 && it[i].aspek === "Validitas" && it[i - 1].aspek === "Validitas") return false;
    if (i >= 2 && it[i].aspek === it[i - 1].aspek && it[i].aspek === it[i - 2].aspek) return false;
    if (i >= 4 && [1, 2, 3, 4].every((d) => it[i - d].kunci === it[i].kunci)) return false;
  }
  return true;
}

let urutan: string[] = [];
for (let tries = 0; ; tries++) {
  assert.ok(tries < 1_000_000, "tidak menemukan urutan yang lolos");
  const ids = items.map((x) => x.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  if (lolos(ids)) { urutan = ids; break; }
}

fs.writeFileSync(out, JSON.stringify({
  paket: PKG,
  label: `Ya/Tidak Paket ${N}`,
  catatan: `Kepribadian Ya/Tidak (${batch}, 60 butir aspek + 10 Validitas, acak). Pasangan konsistensi berjarak >= 15.`,
  urutan,
}, null, 2) + "\n");
console.log(`${path.basename(out)}: 70 butir Ya/Tidak dari ${batch}`);
