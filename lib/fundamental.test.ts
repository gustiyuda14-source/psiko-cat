import assert from "node:assert/strict";
import { KORAN, PAULI_LATIHAN, parseKoranResult } from "./fundamental";

const kolom = Array.from({ length: KORAN.kolom }, (_, i) => (i < KORAN.kolom / 2 ? 10 : 14));
const k = parseKoranResult({ kode: "koran", mode: "tes", operasi: "kali", per_periode: kolom, salah: 3 });
assert.ok(k);
assert.equal(k.stats.rata, 12);
assert.equal(k.stats.keajegan, 4);
assert.equal(k.stats.ketahanan, 4);
assert.equal(k.stats.salah, 3);

// Kraepelin Mode Latihan, panjang salah, angka di luar rentang, operasi kosong: ditolak.
assert.equal(parseKoranResult({ kode: "koran", mode: "latihan", operasi: "tambah", per_periode: kolom, salah: 0 }), null);
assert.equal(parseKoranResult({ kode: "koran", mode: "tes", operasi: "tambah", per_periode: kolom.slice(1), salah: 0 }), null);
assert.equal(parseKoranResult({ kode: "koran", mode: "tes", operasi: "tambah", per_periode: [...kolom.slice(1), KORAN.baris], salah: 0 }), null);
assert.equal(parseKoranResult({ kode: "koran", mode: "tes", operasi: null, per_periode: kolom, salah: 0 }), null);
assert.equal(parseKoranResult({ kode: "koran", mode: "tes", operasi: "tambah", per_periode: kolom.map((v) => v + 0.5), salah: 0 }), null);

const p = parseKoranResult({ kode: "pauli", mode: "latihan", operasi: null, per_periode: [20, 24, 22], salah: 1 });
assert.ok(p);
assert.equal(p.stats.total, 66);
assert.equal(p.stats.schwankung, 3);
assert.equal(p.stats.gipfel, 2);
assert.equal(parseKoranResult({ kode: "pauli", mode: "latihan", operasi: null, per_periode: Array(PAULI_LATIHAN.periode + 1).fill(1), salah: 0 }), null);
assert.equal(parseKoranResult({ kode: "pauli", mode: "tes", operasi: null, per_periode: [], salah: 0 }), null);
assert.equal(parseKoranResult({ kode: "pauli", mode: "tes", operasi: "kali", per_periode: [1], salah: 0 }), null);
assert.equal(parseKoranResult({ kode: "isian", mode: "tes", operasi: null, per_periode: [1], salah: 0 }), null);
assert.equal(parseKoranResult(null), null);

console.log("fundamental.test: ok");
