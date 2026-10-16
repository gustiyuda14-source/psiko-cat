import assert from "node:assert/strict";
import { calculateKecermatan } from "../lib/scoring/kecermatan";
import { pauliStats } from "../lib/fundamental";

const valid = Array.from({ length: 10 }, (_, index) => ({
  column_index: index + 1,
  total_klik: 50,
  total_benar: 50,
}));

const score = calculateKecermatan(valid);
assert.equal(score.raw_score, 100);
assert.throws(
  () => calculateKecermatan([...valid.slice(0, 9), valid[0]]),
  /10 kolom unik/
);
assert.throws(
  () => calculateKecermatan(valid.map((column, index) => index === 0 ? { ...column, total_klik: 51 } : column)),
  /nilai 0–50/
);

console.log("Scoring Kecermatan: validasi batas dan duplikasi lulus.");

// Pauli: contoh lembar Arnold (1975) Abb. 4, Teilzeitstreuung ±5,2 (2,9%), puncak di periode 13.
const arnold = [164, 160, 154, 157, 170, 174, 182, 182, 174, 178, 186, 183, 195, 188, 187, 194, 192, 184, 184, 185];
const pauli = pauliStats(arnold);
assert.equal(Math.round(pauli.schwankung * 10) / 10, 5.2);
assert.equal(Math.round(pauli.schwankungPct * 10) / 10, 2.9);
assert.equal(pauli.gipfel, 13);
assert.ok(pauli.steighohe > 0);
assert.ok(pauliStats([195, 154]).steighohe < 0);
console.log("Scoring Pauli: contoh Arnold Abb. 4 cocok.");
