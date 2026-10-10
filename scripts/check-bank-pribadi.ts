import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";

// Validator bank PRIBADI: Kepribadian (kp-*.json, pedoman §6.1 + §1.1a) dan Substansi Khusus (sk-*.json).
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
// --- Substansi Khusus (bank/pribadi/sk-*.json), pedoman §3 + §4.2 ---
type SkItem = { id: string; dimensi: string; situasi: string; opsi: { A: string; B: string }; kunci: "A" | "B"; kembar_dengan: string | null; pembahasan: string };
// Proporsi dimensi per 63 butir sumber (pedoman §3.1).
const PROPORSI: Record<string, number> = { D1: 4, D2: 5, D3: 6, D4: 12, D5: 6, D6: 6, D7: 4, D8: 8, D9: 6, D10: 2, D11: 4 };
let skTotal = 0;
const skFiles = fs.readdirSync(dir).filter((f) => /^sk-.*\.json$/.test(f));
for (const f of skFiles) {
  const bank = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { dimensi: Record<string, unknown>; items: SkItem[] };
  const byId = new Map(bank.items.map((it) => [it.id, it]));
  const perDim = new Map<string, number>();
  let kunciA = 0, kembar = 0;
  for (const it of bank.items) {
    const at = `${f} ${it.id}`;
    assert.ok(!seenId.has(it.id), `${at}: id ganda`);
    seenId.add(it.id);
    assert.ok(bank.dimensi[it.dimensi], `${at}: dimensi tidak dikenal`);
    assert.ok(it.situasi.startsWith("Hal yang "), `${at}: situasi harus diawali "Hal yang"`);
    assert.ok(it.opsi.A?.trim() && it.opsi.B?.trim() && it.opsi.A !== it.opsi.B, `${at}: opsi tidak valid`);
    assert.ok(it.kunci === "A" || it.kunci === "B", `${at}: kunci harus A/B`);
    assert.ok(it.pembahasan.trim(), `${at}: pembahasan kosong`);
    if (it.kembar_dengan) {
      const t = byId.get(it.kembar_dengan);
      assert.ok(t && t.kembar_dengan === it.id, `${at}: pasangan kembar tidak timbal balik`);
      assert.equal(t.dimensi, it.dimensi, `${at}: kembar beda dimensi`);
      assert.equal(t.opsi[t.kunci], it.opsi[it.kunci], `${at}: kembar memilih nilai berbeda`);
      assert.notEqual(t.kunci, it.kunci, `${at}: kembar harus menukar posisi pilihan`);
      kembar++;
    }
    perDim.set(it.dimensi, (perDim.get(it.dimensi) ?? 0) + 1);
    if (it.kunci === "A") kunciA++;
    skTotal++;
  }
  const n = bank.items.length;
  assert.ok(Math.abs(kunciA - n / 2) <= 1, `${f}: kunci A ${kunciA} dari ${n}, tidak seimbang`);
  if (n === 63) {
    for (const [d, want] of Object.entries(PROPORSI)) assert.ok(Math.abs((perDim.get(d) ?? 0) - want) <= 1, `${f} ${d}: ${perDim.get(d) ?? 0} butir, target ${want}±1`);
    assert.ok(kembar / 2 >= 4, `${f}: minimal 4 pasang kembar`);
  }
}

console.log(`Bank PRIBADI: ${total} butir KP dan ${skTotal} butir SK dari ${files.length + skFiles.length} file lolos semua cek.`);
