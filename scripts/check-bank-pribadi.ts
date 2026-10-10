import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Validator bank Kepribadian (bank/pribadi/kp-*.json), aturan pedoman §6.1 + §1.1a.
// Pakai: npx tsx scripts/check-bank-pribadi.ts

type Item = {
  id: string; aspek: string; jenis: "L" | "K" | "KR"; tier: string; arah: "favorable" | "unfavorable"; konteks: string;
  pernyataan: string; alasan: string; catatan_psikologi?: string;
  bedah?: { sisi_x: string; sisi_y: string; pembanding: string; pembalik: boolean; sisi_aspek: "x" | "y" };
};

const dir = path.join(__dirname, "../bank/pribadi");
const files = fs.readdirSync(dir).filter((f) => /^kp-.*\.json$/.test(f));
const words = (s: string) => s.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2);
const jaccard = (a: string[], b: string[]) => {
  const A = new Set(a), B = new Set(b);
  return [...A].filter((w) => B.has(w)).length / new Set([...A, ...B]).size;
};
// Pernyataan sumber (simulasi Paket 1) — butir latihan tidak boleh menyalinnya.
const source = [...fs.readFileSync(path.join(__dirname, "seed-kepribadian-v2.ts"), "utf8").matchAll(/statement: "([^"]+)"/g)].map((m) => words(m[1]));
assert.ok(source.length >= 90, "pernyataan sumber tidak terbaca");

const seenId = new Set<string>(), seenText: string[][] = [];
let total = 0;
for (const f of files) {
  const bank = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { definisi_aspek: Record<string, string>; items: Item[] };
  const perAspek = new Map<string, { fav: number; unfav: number }>();
  for (const it of bank.items) {
    const at = `${f} ${it.id}`;
    assert.ok(!seenId.has(it.id), `${at}: id ganda`);
    seenId.add(it.id);
    assert.ok(bank.definisi_aspek[it.aspek], `${at}: aspek tanpa definisi`);
    assert.equal(it.tier, { L: "T1", K: "T2", KR: "T3" }[it.jenis], `${at}: tier tidak cocok dengan jenis`);
    if (it.jenis === "L") assert.ok(!it.bedah, `${at}: pernyataan langsung tidak punya bedah`);
    else {
      assert.ok(it.bedah, `${at}: komparatif wajib punya bedah`);
      assert.equal(it.bedah.pembalik, it.jenis === "KR", `${at}: pembalik harus sesuai jenis KR`);
      // Aturan aspek: setuju memihak X (atau Y bila kata pembanding membalik arah).
      const setujuMemihak = it.bedah.pembalik ? "y" : "x";
      assert.equal(it.arah === "favorable", it.bedah.sisi_aspek === setujuMemihak, `${at}: arah tidak konsisten dengan bedah`);
    }
    const n = it.pernyataan.split(/\s+/).length;
    assert.ok(n <= 25, `${at}: ${n} kata (maks 25)`);
    assert.ok(it.alasan.trim(), `${at}: alasan kosong`);
    const w = words(it.pernyataan);
    for (const s of source) assert.ok(jaccard(w, s) < 0.5, `${at}: terlalu mirip soal sumber`);
    for (const s of seenText) assert.ok(jaccard(w, s) < 0.6, `${at}: terlalu mirip butir lain`);
    seenText.push(w);
    const c = perAspek.get(it.aspek) ?? { fav: 0, unfav: 0 };
    c[it.arah === "favorable" ? "fav" : "unfav"]++;
    perAspek.set(it.aspek, c);
    total++;
  }
  for (const [a, c] of perAspek) assert.ok(Math.abs(c.fav - c.unfav) <= 1, `${f} ${a}: arah timpang ${c.fav}:${c.unfav}`);
}
console.log(`Bank PRIBADI: ${total} butir KP dari ${files.length} file lolos semua cek.`);
