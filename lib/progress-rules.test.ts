import assert from "node:assert/strict";
import { cleanDrill, cleanLatihan, latihanKeyMax } from "./progress-rules";

assert.equal(latihanKeyMax("/latihan/kecerdasan/2"), 100);
assert.equal(latihanKeyMax("/latihan/kepribadian/11"), 111);
assert.equal(latihanKeyMax("/latihan/kecermatan-simbol/301"), 500);
assert.equal(latihanKeyMax("/latihan/kecermatan/9"), 500);
assert.equal(latihanKeyMax("/latihan/kecermatan-simbol/306"), null);
assert.equal(latihanKeyMax("/latihan/kecermatan-angka/101"), 500);
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

console.log("progress-rules ok");
