import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Manifest paket Kepribadian SJT (bank/pribadi/paket-NN.json) dari satu batch SJT (48, atau 64 untuk
// simulasi dengan Loyalitas & Kerja Sama) dan satu batch Pass Hand / SK (63).
// Bagian 1 = situasi diacak lintas aspek, Bagian 2 = SK acak;
// di kedua bagian butir kembar berjarak >= 10 nomor.
//   npx tsx scripts/compose-pribadi-sjt.ts 21 sjt-01 sk-sjt-01 ["SJT Paket 1"]
// Manifest yang sudah ada tidak pernah ditimpa.

const [pkgArg, sjtBatch, skBatch, labelArg] = process.argv.slice(2);
const PKG = Number(pkgArg);
assert.ok(Number.isInteger(PKG) && sjtBatch && skBatch, "Pakai: compose-pribadi-sjt.ts <paket> <batch sjt> <batch sk>");
const dir = path.join(__dirname, "../bank/pribadi");
const out = path.join(dir, `paket-${String(PKG).padStart(2, "0")}.json`);
assert.ok(!fs.existsSync(out), `${path.basename(out)} sudah ada`);
type It = { id: string; kembar_dengan: string | null };
const items = (f: string) => (JSON.parse(fs.readFileSync(path.join(dir, `${f}.json`), "utf8")) as { items: It[] }).items;
const sjt = items(sjtBatch), sk = items(skBatch);
assert.ok(sjt.length === 48 || sjt.length === 64, "SJT harus 48 butir (64 bila + Loyalitas & Kerja Sama)");
assert.equal(sk.length, 63, "Pass Hand harus 63 butir");

let seed = PKG * 7919 + 20261020;
const rng = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const order = (list: It[]) => {
  for (;;) {
    const ids = list.map((x) => x.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    if (list.every((x) => !x.kembar_dengan || Math.abs(ids.indexOf(x.id) - ids.indexOf(x.kembar_dengan)) >= 10)) return ids;
  }
};

fs.writeFileSync(out, JSON.stringify({
  paket: PKG,
  label: labelArg ?? `SJT Paket ${PKG - 20}`,
  catatan: `Bagian 1 Kepribadian situasional (${sjtBatch}, ${sjt.length}, acak lintas aspek), Bagian 2 Pass Hand / Integritas & Kejujuran (${skBatch}, 63, acak). Butir kembar berjarak >= 10.`,
  urutan: [...order(sjt), ...order(sk)],
}, null, 2) + "\n");
console.log(`${path.basename(out)}: ${sjt.length} SJT + 63 SK`);
