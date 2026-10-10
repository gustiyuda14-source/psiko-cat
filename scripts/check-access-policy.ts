import assert from "node:assert/strict";
import { canAccessSession } from "../lib/access-policy";
import { KECERDASAN_PACKAGES, KEPRIBADIAN_PACKAGES, SIMULASI_PACKAGE } from "../lib/test-config";

const participant = { sub: "user-a", role: "peserta" as const };
const admin = { sub: "admin-a", role: "admin" as const };

assert.equal(canAccessSession("user-a", participant, false), true);
assert.equal(canAccessSession("user-b", participant, true), false);
assert.equal(canAccessSession("user-b", admin, false), false);
assert.equal(canAccessSession("user-b", admin, true), true);

// Paket simulasi tidak boleh ikut jadi paket latihan (kunci bocor lewat /api/practice/check).
assert.equal(KECERDASAN_PACKAGES.includes(SIMULASI_PACKAGE.KECERDASAN), false);
assert.equal(KEPRIBADIAN_PACKAGES.includes(SIMULASI_PACKAGE.KEPRIBADIAN), false);

console.log("Access policy: owner, batas bypass admin, dan pemisahan paket simulasi lulus.");
