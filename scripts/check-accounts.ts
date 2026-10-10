// Self-check aturan akun (lib/account-rules.ts) dan penjaga sesi (lib/account-guard.ts).
// Supabase ditiru dengan fetch palsu, tidak menyentuh database asli. Jalankan: npm run check:accounts
import assert from "node:assert/strict";
import { cleanName, genPassword, nameWord, nextIds, sessionVersion } from "../lib/account-rules";

assert.equal(cleanName("  budi\tsantoso \n"), "BUDI SANTOSO");
assert.deepEqual(nextIds(["admin", "salfa", "p002", "p010", "gusti"], 3), ["p011", "p012", "p013"]);
assert.deepEqual(nextIds([], 1), ["p001"]);
assert.equal(nameWord("BUDI SANTOSO"), "budi");
assert.equal(nameWord("I KETUT ARYA"), "ketut");
assert.equal(nameWord("NI LUH AYU"), "luh");
assert.equal(nameWord("ANDRÉ"), "andre");
assert.equal(nameWord("A B"), "peserta");
assert.equal(nameWord("MUHAMMADRIZKYPRATAMA"), "muhammadrizk");
for (let i = 0; i < 200; i++) assert.match(genPassword("BUDI SANTOSO"), /^budi[@*]\d{4}$/);
assert.equal(sessionVersion("hash-a"), sessionVersion("hash-a"));
assert.notEqual(sessionVersion("hash-a"), sessionVersion("hash-b"));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
let rows = [
  { id: "u1", aktif: true, password_hash: "h1" },
  { id: "u2", aktif: false, password_hash: "h2" },
  { id: "u3", password_hash: "h3" }, // kolom aktif belum ada = aktif
];
let down = false;
globalThis.fetch = (async () => {
  if (down) throw new Error("offline");
  return new Response(JSON.stringify(rows), { status: 200 });
}) as typeof fetch;

async function main() {
  const { sessionBlocked } = await import("../lib/account-guard");
  assert.equal(await sessionBlocked("u1", sessionVersion("h1")), false, "aktif + pv cocok");
  assert.equal(await sessionBlocked("u1", undefined), false, "token lama tanpa pv tetap boleh");
  assert.equal(await sessionBlocked("u2", sessionVersion("h2")), true, "akun nonaktif ditolak");
  assert.equal(await sessionBlocked("u3", sessionVersion("h3")), false, "tanpa kolom aktif = aktif");
  assert.equal(await sessionBlocked("u1", sessionVersion("lama")), true, "password direset → token lama ditolak");
  assert.equal(await sessionBlocked("ghost", undefined), true, "akun terhapus ditolak");
  rows = [...rows, { id: "u4", aktif: true, password_hash: "h4" }];
  await new Promise((r) => setTimeout(r, 5_100)); // MIN_FORCE: akun baru dari instance lain terbaca lewat refresh paksa
  assert.equal(await sessionBlocked("u4", sessionVersion("h4")), false, "akun baru langsung bisa dipakai");
  down = true;
  assert.equal(await sessionBlocked("u2", undefined), true, "cache lama tetap dipakai saat Supabase gagal");
  console.log("check:accounts OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
