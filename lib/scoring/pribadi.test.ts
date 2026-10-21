import assert from "node:assert/strict";
import { itemScore, konsistensi, konsistensiPaket, summarize, type PribadiRule } from "./pribadi";

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

// Ya/Tidak: 1/0, maks 1; butir Validitas tidak masuk Nilai KP.
const yt = (aspect: string, key: "A" | "B", validitas = false): PribadiRule =>
  ({ type: "ya_tidak", aspect, validitas, correct_key: key, pembahasan: { definisi_aspek: "", alasan: "", jika_sebaliknya: "", tips: "" } });
assert.deepEqual(itemScore(yt("Prososial", "A"), "A"), { skor: 1, max: 1, ideal: "A" });
assert.equal(itemScore(yt("Prososial", "B"), "A").skor, 0);
assert.equal(itemScore(yt("Prososial", "B"), null).skor, 0);
const v = summarize([
  { rule: yt("Prososial", "A"), selected: "A" },
  { rule: yt("Prososial", "B"), selected: "A" },
  { rule: yt("Validitas", "A", true), selected: "B" },
]);
assert.deepEqual(v.kp?.aspek, [{ aspek: "Prososial", nilai: 50, butir: 2 }]);
assert.deepEqual(v.validitas, { sesuai: 0, butir: 1, perhatian: false });
assert.equal(v.pribadi, 50);
assert.equal(summarize([{ rule: sk, selected: "A" }]).validitas, null);
const tenVal = Array.from({ length: 10 }, (_, i) => ({ rule: yt("Validitas", "A", true), selected: i < 6 ? "A" : "B" }));
assert.deepEqual(summarize(tenVal).validitas, { sesuai: 6, butir: 10, perhatian: true });

// Konsistensi pasangan: konsisten ⇔ kedua jawaban sama-sama sesuai kunci, atau sama-sama tidak.
const k = (no: number, bankId: string, pasangan: string | null, key: "A" | "B", selected: string | null) =>
  ({ no, bankId, pasangan, rule: yt("Prososial", key), selected, statement: bankId });
assert.deepEqual(konsistensi([k(1, "x", "y", "A", "A"), k(5, "y", "x", "A", "A")]).map((r) => r.status), ["konsisten"]);
assert.deepEqual(konsistensi([k(1, "x", "y", "A", "A"), k(5, "y", "x", "B", "B")]).map((r) => r.status), ["konsisten"]); // dibalik
assert.deepEqual(konsistensi([k(1, "x", "y", "A", "A"), k(5, "y", "x", "A", "B")]).map((r) => r.status), ["berbeda"]);
assert.deepEqual(konsistensi([k(1, "x", "y", "A", null), k(5, "y", "x", "A", "B")]).map((r) => r.status), ["kosong"]);
assert.deepEqual(konsistensi([k(1, "x", "zz", "A", "A")]), []);
const [row] = konsistensi([k(5, "y", "x", "A", "B"), k(1, "x", "y", "A", "A")]);
assert.deepEqual(row, { a: { no: 1, statement: "x", jawab: "A" }, b: { no: 5, statement: "y", jawab: "B" }, status: "berbeda" });
assert.deepEqual(konsistensi([{ no: 1, bankId: "s1", pasangan: "s2", rule: sk, selected: "A", statement: "" }, { no: 9, bankId: "s2", pasangan: "s1", rule: sk, selected: "A", statement: "" }]).map((r) => r.status), ["konsisten"]);
assert.deepEqual(konsistensi([k(9, "y", null, "A", "A"), k(2, "x", "y", "A", "A")]).map((r) => [r.a.no, r.b.no, r.status]), [[2, 9, "konsisten"]]); // satu arah
const kp2 = konsistensiPaket([
  { id: "q1", rule: yt("Prososial", "A"), selected: "A", payload: { statement: "s1", bank_id: "x", pasangan: "y" } },
  { id: "q2", rule: yt("Prososial", "A"), selected: "B", payload: { statement: "s2" } },
  { id: "q3", rule: yt("Prososial", "B"), selected: "B", payload: { statement: "s3", bank_id: "y", pasangan: "x" } },
]);
assert.deepEqual(kp2.baris.map((r) => [r.a.no, r.b.no, r.status]), [[1, 3, "konsisten"]]);
assert.deepEqual(kp2.pasanganOf, { q1: { no: 3, status: "konsisten" }, q3: { no: 1, status: "konsisten" } });
// Pass Hand live: pasangan dari peta kembar (SK-D1-101 ↔ SK-D1-102 di sk-a-01).
const skKembar = konsistensiPaket([
  { id: "p1", rule: sk, selected: "A", payload: { statement: "", bank_id: "SK-D1-101" } },
  { id: "p2", rule: sk, selected: "B", payload: { statement: "", bank_id: "SK-D1-102" } },
]);
assert.deepEqual(skKembar.baris.map((r) => r.status), ["berbeda"]);
console.log("Pribadi scoring: all checks passed.");
