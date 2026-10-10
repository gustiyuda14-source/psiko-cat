import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getMissingSymbolKey, KECERMATAN_KEYS } from "./kecermatan-symbols";
import type { KecermatanOptionsPayload } from "./types/safe-question";

const symbol_map = { A: "◆", B: "🍀", C: "♫", D: "✦", E: "☂" };
for (const key of KECERMATAN_KEYS) {
  const shown = KECERMATAN_KEYS.filter((k) => k !== key).map((k) => symbol_map[k]).reverse();
  assert.equal(getMissingSymbolKey({ symbol_map, shown, choices: [...KECERMATAN_KEYS] }), key);
}
for (const shown of [["◆", "◆", "♫", "✦"], ["◆", "🍀", "♫"], ["◆", "🍀", "♫", "?"], Object.values(symbol_map)]) {
  assert.equal(getMissingSymbolKey({ symbol_map, shown, choices: [...KECERMATAN_KEYS] }), null);
}
assert.equal(getMissingSymbolKey({ symbol_map: { ...symbol_map, E: "◆" }, shown: ["◆", "🍀", "♫", "✦"], choices: [...KECERMATAN_KEYS] }), null);
assert.equal(getMissingSymbolKey(null as unknown as KecermatanOptionsPayload), null);
let verified = 0;
for (const id of [3, 4, 5, 6, 7, 8, 201]) {
  const bank = JSON.parse(readFileSync(new URL(`../prisma/data/bank_soal_p${id}.json`, import.meta.url), "utf8")) as {
    kolom: { simbol: KecermatanOptionsPayload["symbol_map"]; soal: { shown: string[]; kunci: string }[] }[];
  };
  for (const col of bank.kolom) for (const item of col.soal) {
    assert.equal(getMissingSymbolKey({ symbol_map: col.simbol, shown: item.shown, choices: [...KECERMATAN_KEYS] }), item.kunci);
    verified++;
  }
}
assert.equal(verified, 3500);
console.log(`Kecermatan: ${verified} source answers, all keys, emoji, ordering, and malformed payload checks passed.`);
