import assert from "node:assert/strict";
import { itemScore, summarize, type PribadiRule } from "./pribadi";

const pb = { definisi_aspek: "", alasan: "" };
const fav: PribadiRule = { type: "likert4", aspect: "Prososial", polarity: "favorable", pembahasan: pb };
const unfav: PribadiRule = { type: "likert4", aspect: "Prososial", polarity: "unfavorable", pembahasan: pb };
const emosi: PribadiRule = { type: "likert4", aspect: "Stabilitas Emosi", polarity: "favorable", pembahasan: pb };
const sk: PribadiRule = { type: "forced_choice", dimensi: "D1", correct_key: "A", pembahasan: "" };

assert.deepEqual(["A", "B", "C", "D"].map((k) => itemScore(fav, k).skor), [1, 2, 3, 4]);
assert.deepEqual(["A", "B", "C", "D"].map((k) => itemScore(unfav, k).skor), [4, 3, 2, 1]);
assert.equal(itemScore(unfav, null).skor, 0);
assert.equal(itemScore(fav, "E").skor, 0);
assert.equal(itemScore(fav, null).ideal, "D");
assert.equal(itemScore(unfav, null).ideal, "A");
assert.equal(itemScore(sk, "A").skor, 1);
assert.equal(itemScore(sk, "B").skor, 0);

const s = summarize([
  { rule: fav, selected: "D" },   // 4
  { rule: unfav, selected: "D" }, // 1
  { rule: emosi, selected: "C" }, // 3
  { rule: sk, selected: "A" },
  { rule: sk, selected: null },
]);
assert.equal(s.kp?.nilai, 66.7); // 8/12
assert.deepEqual(s.kp?.aspek, [{ aspek: "Prososial", nilai: 62.5, butir: 2 }, { aspek: "Stabilitas Emosi", nilai: 75, butir: 1 }]);
assert.deepEqual(s.sk, { nilai: 50, benar: 1, butir: 2 });
assert.equal(s.pribadi, 58.4); // (66.7 + 50) / 2 = 58.35
assert.equal(summarize([{ rule: sk, selected: "A" }]).pribadi, 100);
assert.equal(summarize([]).pribadi, 0);
console.log("Pribadi scoring: all checks passed.");
