import assert from "node:assert/strict";
import { calculateKecermatan } from "../lib/scoring/kecermatan";

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
