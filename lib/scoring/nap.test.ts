import assert from "node:assert/strict";
import { calculateNAP, calculateSingleModuleResult } from "./nap";
import { calculateKecerdasan } from "./kecerdasan";
import { calculateKepribadian } from "./kepribadian";
import { calculateKecermatan, withinColumnWindow } from "./kecermatan";
import { pribadiModuleScore, type PribadiRule } from "./pribadi";

// 41 benar Kecerdasan (24,6) + Kepribadian 100 × C (10) + Kecermatan 26,4 = tepat 61.
// Tanpa pembulatan float-nya 60,999999999999986 dan peserta digugurkan.
const kecerdasan = calculateKecerdasan(
  new Map(Array.from({ length: 41 }, (_, i) => [String(i), "A"])),
  new Map(Array.from({ length: 41 }, (_, i) => [String(i), { type: "dichotomous", correct_key: "A" }])) as never
);
const W = { A: 0.2, B: 0.15, C: 0.1, D: 0.05, E: 0.04 };
const kepribadian = calculateKepribadian(
  new Map(Array.from({ length: 100 }, (_, i) => [String(i), "C"])),
  new Map(Array.from({ length: 100 }, (_, i) => [String(i), { weights: W }])) as never
);
assert.equal(kecerdasan.nap_contribution, 24.6);
assert.equal(kepribadian.nap_contribution, 10);

const nap = calculateNAP({
  kecerdasan_contribution: kecerdasan.nap_contribution,
  kepribadian_contribution: kepribadian.nap_contribution,
  kecermatan_contribution: 26.4,
  kecerdasan_raw: 50,
  kepribadian_raw: 50,
  kecermatan_raw: 50,
});
assert.equal(nap.nap_score, 61);
assert.equal(nap.is_passed, true);

// Ambang 40 ikut dibulatkan: 40,000000000001 tetap "Kurang Sekali".
assert.equal(calculateSingleModuleResult(40.000000000001).is_passed, false);
assert.equal(calculateSingleModuleResult(40.01).is_passed, true);

// Klik lajur 1 di detik 0, 59, 63 dihitung; detik 64 (tertahan offline lalu tetap dijawab) dibuang.
const kept = withinColumnWindow([
  { column_index: 1, clicked_at_ms: 1_000 },
  { column_index: 1, clicked_at_ms: 60_000 },
  { column_index: 1, clicked_at_ms: 64_000 },
  { column_index: 1, clicked_at_ms: 65_001 },
  { column_index: 2, clicked_at_ms: 130_000 },
]);
assert.deepEqual(kept.map((k) => k.clicked_at_ms), [1_000, 60_000, 64_000, 130_000]);

// PRIBADI simulasi (48 KP + 63 SK): ideal = 100 → 20 poin; kosong semua = 0 dan gugur.
const pb = { definisi_aspek: "", alasan: "" };
const kpRules: PribadiRule[] = Array.from({ length: 48 }, (_, i) => ({ type: "likert4", aspect: `a${i % 6}`, polarity: i % 2 ? "favorable" : "unfavorable", pembahasan: pb }));
const skRules: PribadiRule[] = Array.from({ length: 63 }, (_, i) => ({ type: "forced_choice", dimensi: "d", correct_key: i % 2 ? "A" : "B", pembahasan: "" }));
const all = [...kpRules, ...skRules];
const ideal = pribadiModuleScore(all.map((rule) => ({ rule, selected: rule.type === "forced_choice" ? rule.correct_key : rule.polarity === "favorable" ? "D" : "A" })));
assert.deepEqual([ideal.raw_score, ideal.nap_contribution, ideal.is_disqualifying], [100, 20, false]);
const blank = pribadiModuleScore(all.map((rule) => ({ rule, selected: null })));
assert.deepEqual([blank.raw_score, blank.nap_contribution, blank.is_disqualifying], [0, 0, true]);
// KP semua "Sesuai" (C) = 62,5; SK semua A benar 31/63 = 49,2 → PRIBADI 55,9.
const mid = pribadiModuleScore(all.map((rule) => ({ rule, selected: rule.type === "forced_choice" ? "A" : "C" })));
assert.equal(mid.raw_score, 55.9);

// Kecermatan v2: celah versi 1 tertutup, peserta serius tetap wajar.
const kc = (klik: number[], benar: number[]) =>
  calculateKecermatan(klik.map((k, i) => ({ column_index: i + 1, total_klik: k, total_benar: benar[i] }))).raw_score;
const ten = (n: number) => Array(10).fill(n);
assert.equal(kc(ten(0), ten(0)), 0); // v1: 30
assert.ok(kc(ten(1), ten(1)) < 6); // 10 butir teliti — v1: 70,6
assert.equal(kc(ten(50), ten(10)), 0); // klik acak 20% benar — v1: 68
assert.equal(kc(ten(20), ten(20)), 82); // teliti dan ajeg 200 butir
// Sesi nyata tercepat (295 klik, 289 benar) tetap Cukup.
const real = kc([25, 34, 41, 21, 31, 29, 33, 36, 22, 23], [25, 34, 40, 20, 30, 28, 32, 35, 22, 23]);
assert.ok(real > 70 && real < 76, `sesi nyata ${real}`);

console.log("nap ok");
