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

// SJT: bobot opsi terpilih, maks 5, digabung ke Kepribadian per aspek.
const sjt: PribadiRule = { type: "sjt5", aspect: "Prososial", bobot: { A: 3, B: 5, C: 1, D: 4, E: 2 }, pembahasan: { definisi_aspek: "", opsi: {}, tips: "" } };
assert.deepEqual(["A", "B", "C", "D", "E"].map((k) => itemScore(sjt, k).skor), [3, 5, 1, 4, 2]);
assert.equal(itemScore(sjt, null).skor, 0);
assert.equal(itemScore(sjt, "X").skor, 0);
assert.deepEqual(itemScore(sjt, "D"), { skor: 4, max: 5, ideal: "B" });
const j = summarize([{ rule: sjt, selected: "B" }, { rule: sjt, selected: "D" }, { rule: sk, selected: "A" }]);
assert.deepEqual(j.kp, { nilai: 90, butir: 2, aspek: [{ aspek: "Prososial", nilai: 90, butir: 2 }] });
assert.equal(j.pribadi, 95);
console.log("Pribadi scoring: all checks passed.");
