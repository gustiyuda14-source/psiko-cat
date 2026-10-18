import assert from "node:assert/strict";
import { analyzeKecermatan, titikHafalDari, type AnalisisItem } from "./kecermatan-analisis";
import type { KecermatanTiming } from "./progress-rules";

// Sesi buatan: 4 kolom x 50 butir, 12 butir pertama 3 dtk (menghafal kunci), sisanya 1,5 dtk.
const symbols = { A: "α", B: "β", C: "γ", D: "δ", E: "ε" };
const items: AnalisisItem[] = [];
const timing: KecermatanTiming = { v: 1, pel: false, cols: {}, t: {} };
for (let c = 1; c <= 4; c++) {
  timing.cols[c] = { o: c, clean: c !== 4 };
  let t = 0;
  for (let p = 0; p < 50; p++) {
    const id = `c${c}-${p}`;
    const d = p < 12 ? 3000 : 1500;
    t += d;
    const wrong = p === 20 || p === 30; // salah: kunci C (γ) dikira A (α)
    items.push({ id, column: c, seq: (c - 1) * 50 + p + 1, correct: !wrong, selected: wrong ? "A" : "C", correctKey: "C", symbols });
    timing.t[id] = [t, d];
  }
}
// Satu jeda panjang (40 dtk) di kolom 2 tidak boleh memengaruhi kecepatan.
timing.t["c2-40"] = [timing.t["c2-40"][0], 40_000];

const a = analyzeKecermatan(items, timing);
assert.ok(a.valid);
if (a.valid) {
  // 12 x 3 dtk = 36 dtk, sisa 24 dtk / 1,5 = 16 butir → 28 dalam 60 detik; butir ke-21 salah.
  assert.deepEqual(a.bayangan[0], { column_index: 1, total_klik: 28, total_benar: 27 });
  assert.equal(a.bayangan[9].total_klik, 0);
  assert.equal(a.kolomDikunjungi, 4);
  assert.equal(a.kolomTidakUrut, 1);
  assert.equal(a.penuh.jeda, 1);
  assert.equal(a.penuh.tren, "stabil");
  assert.equal(a.adaptasi.titikHafal, 12);
  assert.equal(a.adaptasi.lebihCepatPct, 50);
  assert.equal(a.adaptasi.sebelum, 3);
  assert.equal(a.adaptasi.sesudah, 1.5);
  assert.deepEqual(a.diagnosis.tertukar, [{ benar: "γ", dikira: "α", n: 8 }]);
}

assert.equal(analyzeKecermatan(items, null).valid, false);
assert.equal(analyzeKecermatan(items.filter((it) => it.column <= 2), { ...timing, cols: { 1: timing.cols[1], 2: timing.cols[2] } }).valid, false);
const spam: KecermatanTiming = { ...timing, t: Object.fromEntries(Object.entries(timing.t).map(([id, [t]]) => [id, [t, 100]])) };
assert.equal(analyzeKecermatan(items, spam).valid, false);

// Tanpa fase menghafal (kurva datar) → tidak ada titik hafal.
assert.deepEqual(titikHafalDari(Array(50).fill(1.5)), { titikHafal: null, lebihCepatPct: null, sebelum: null, sesudah: null });

console.log("kecermatan-analisis ok");
