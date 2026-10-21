import * as fs from "fs";
import * as path from "path";

// Peta butir kembar Pass Hand (kembar_dengan di bank/pribadi/sk-*.json) → lib/scoring/kembar-sk.json,
// supaya tabel konsistensi tidak perlu memuat bank 600+ KB. Jalankan ulang setelah bank SK berubah;
// lib/scoring/kembar-sk.test.ts gagal bila peta tertinggal.
//   npx tsx scripts/build-kembar-sk.ts

const dir = path.join(__dirname, "../bank/pribadi");
const map: Record<string, string> = {};
for (const f of fs.readdirSync(dir).filter((f) => /^sk-.*\.json$/.test(f)).sort()) {
  const { items } = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { items: { id: string; kembar_dengan: string | null }[] };
  for (const it of items) if (it.kembar_dengan) Object.assign(map, { [it.id]: it.kembar_dengan, [it.kembar_dengan]: it.id });
}
const out = path.join(__dirname, "../lib/scoring/kembar-sk.json");
fs.writeFileSync(out, JSON.stringify(Object.fromEntries(Object.entries(map).sort()), null, 0) + "\n");
console.log(`${path.basename(out)}: ${Object.keys(map).length} butir`);
