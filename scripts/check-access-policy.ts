import assert from "node:assert/strict";
import { canAccessSession } from "../lib/access-policy";

const participant = { sub: "user-a", role: "peserta" as const };
const admin = { sub: "admin-a", role: "admin" as const };

assert.equal(canAccessSession("user-a", participant, false), true);
assert.equal(canAccessSession("user-b", participant, true), false);
assert.equal(canAccessSession("user-b", admin, false), false);
assert.equal(canAccessSession("user-b", admin, true), true);

console.log("Access policy: owner dan batas bypass admin lulus.");
