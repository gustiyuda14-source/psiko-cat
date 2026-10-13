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
for (const id of [3, 4, 5, 6, 7, 8, 11, 12, 201, 202, 203, 204, 205, 206, 401, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510]) {
  const bank = JSON.parse(readFileSync(new URL(`../prisma/data/bank_soal_p${id}.json`, import.meta.url), "utf8")) as {
    kolom: { simbol: KecermatanOptionsPayload["symbol_map"]; soal: { shown: string[]; kunci: string }[] }[];
  };
  for (const col of bank.kolom) for (const item of col.soal) {
    assert.equal(getMissingSymbolKey({ symbol_map: col.simbol, shown: item.shown, choices: [...KECERMATAN_KEYS] }), item.kunci);
    verified++;
  }
}
assert.equal(verified, 12500);

// Bantuan pelafalan latihan: kolom yang berlabel wajib 5 kata unik (kolom tanpa label, mis. angka/huruf, dilewati).
const pelafalan = JSON.parse(readFileSync(new URL("../data/kecermatan-pelafalan.json", import.meta.url), "utf8")) as Record<string, string>;
let labelled = 0;
for (const id of [3, 4, 5, 6, 7, 8, 9, 201, 202, 203, 204, 205, 206, 301, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510]) {
  const bank = JSON.parse(readFileSync(new URL(`../prisma/data/bank_soal_p${id}.json`, import.meta.url), "utf8")) as {
    kolom: { nomor: number; simbol: KecermatanOptionsPayload["symbol_map"] }[];
  };
  for (const col of bank.kolom) {
    const words = KECERMATAN_KEYS.map((k) => pelafalan[col.simbol[k]]);
    if (!words.some(Boolean)) continue;
    assert.ok(words.every(Boolean) && new Set(words).size === 5, `p${id} kolom ${col.nomor}: ${words}`);
    labelled++;
  }
}
assert.equal(labelled, 239);
console.log(`Kecermatan: ${verified} source answers, all keys, emoji, ordering, and malformed payload checks passed.`);
