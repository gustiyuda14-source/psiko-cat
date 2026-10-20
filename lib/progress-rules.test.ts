import assert from "node:assert/strict";
import { cleanAttemptAnswers, cleanAttemptTiming, maxLatihanAttempts, cleanDrill, cleanLatihan, latihanKeyMax, latihanPackageOf } from "./progress-rules";

assert.equal(latihanKeyMax("/latihan/kecerdasan/2"), 100);
assert.equal(latihanKeyMax("/latihan/kepribadian/10"), 111);
// Paket 11 dipindah jadi simulasi, bukan latihan lagi.
assert.equal(latihanKeyMax("/latihan/kepribadian/11"), null);
assert.equal(latihanKeyMax("/latihan/kecermatan-simbol/301"), 500);
assert.equal(latihanKeyMax("/latihan/kecermatan/9"), 500);
assert.equal(latihanKeyMax("/latihan/kecermatan-simbol/306"), null);
assert.equal(latihanKeyMax("/latihan/kecermatan-angka/101"), 500);
assert.equal(latihanKeyMax("/latihan/kecermatan-spasial-dasar/510"), 500);
assert.equal(latihanKeyMax("/latihan/kecermatan-spasial/501"), null); // paket dasar punya rute sendiri
assert.equal(latihanKeyMax("/latihan/kecermatan/101"), null); // paket angka bukan di rute simbol
assert.equal(latihanKeyMax("/latihan/kecerdasan/1"), null); // paket simulasi, bukan latihan
assert.equal(latihanKeyMax("/latihan/kecerdasan/2/../3"), null);

assert.deepEqual(cleanLatihan({ "/latihan/kecerdasan/2": 40, "/latihan/kecerdasan/3": 101, "/x": 5, "/latihan/kepribadian/2": 0, "/latihan/kecermatan/3": 2.5 }), { "/latihan/kecerdasan/2": 40 });
assert.deepEqual(cleanLatihan(["/latihan/kecerdasan/2"]), {});
assert.deepEqual(cleanLatihan(null), {});

const bank = new Set(["K01-001", "K01-002", "K01-003", "K01-004"]);
assert.deepEqual(
  cleanDrill({ "K01-001": [1, 2, 900], "K01-002": [3, 2, 0], "K01-003": [0, 0, 0], "K01-004": [1, 1, -5], "ZZ": [1, 1, 1], "K01-005": "x" }, (id) => bank.has(id)),
  { "K01-001": [1, 2, 900], "K01-004": [1, 1, 0] }
);
assert.deepEqual(cleanDrill({ "K01-001": [0, 5000, 0] }, (id) => bank.has(id)), {});

const answered = new Set(["q1", "q2"]);
assert.deepEqual(
  cleanAttemptTiming({ v: 1, pel: true, cols: { 1: { o: 1, clean: true } }, t: { q1: [1200, 1200], q2: [2500, 1300], zz: [1, 1] } }, answered),
  { v: 1, pel: true, cols: { 1: { o: 1, clean: true } }, t: { q1: [1200, 1200], q2: [2500, 1300] } }
);
assert.equal(cleanAttemptTiming({ v: 1, pel: true, cols: { 11: { o: 1, clean: true } }, t: {} }, answered), null);
assert.equal(cleanAttemptTiming({ v: 1, pel: true, cols: {}, t: { q1: [-1, 0] } }, answered), null);
assert.equal(cleanAttemptTiming({ v: 2, pel: true, cols: {}, t: {} }, answered), null);
assert.equal(cleanAttemptTiming(null, answered), null);

assert.equal(maxLatihanAttempts("/latihan/kecermatan-sains/701"), 1);
assert.equal(maxLatihanAttempts("/latihan/kecermatan-komposisi/805"), 1);
assert.equal(latihanKeyMax("/latihan/kecermatan-komposisi/806"), null);
assert.equal(maxLatihanAttempts("/latihan/kecermatan/9"), 1);
assert.equal(maxLatihanAttempts("/latihan/kecerdasan/2"), 2);

console.log("progress-rules ok");

assert.deepEqual(latihanPackageOf("/latihan/kecerdasan/2"), { module: "KECERDASAN", pkg: 2 });
assert.deepEqual(latihanPackageOf("/latihan/kecermatan-angka/101"), { module: "KECERMATAN", pkg: 101 });
assert.deepEqual(latihanPackageOf("/latihan/kepribadian/10"), { module: "KEPRIBADIAN", pkg: 10 });
assert.equal(latihanPackageOf("/latihan/kecerdasan/1"), null);

assert.deepEqual(cleanAttemptAnswers({ a: "B", b: null, c: "AC" }, 100), { a: "B", b: null, c: "AC" });
assert.equal(cleanAttemptAnswers({}, 100), null);
assert.equal(cleanAttemptAnswers({ a: "B", b: "C" }, 1), null); // lebih dari isi paket
assert.equal(cleanAttemptAnswers({ a: "<script>" }, 100), null);
assert.equal(cleanAttemptAnswers({ a: 3 }, 100), null);
assert.equal(cleanAttemptAnswers(["B"], 100), null);
