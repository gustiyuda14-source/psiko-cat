/**
 * Gambar pembahasan K11 Jadwal & Urutan (23 butir) → data/drill-pembahasan/K11-*.svg + gambar_pembahasan di bank.
 *   npx tsx scripts/generate-k11-pbh.ts
 */
import { patchBank } from "./pbh-svg-lib";
import { generateK11Hand } from "./k11-hand-pbh";
import { generateK11Puzzle } from "./k11-puzzle-pbh";

const ids = new Set([...generateK11Puzzle(), ...generateK11Hand()]);
patchBank("K11-wacana-logika.json", (it) => { if (ids.has(it.id as string)) it.gambar_pembahasan = `${it.id}.svg`; });
console.log(`${ids.size} SVG K11`);
if (ids.size !== 23) throw new Error(`jumlah SVG ${ids.size} ≠ 23`);
