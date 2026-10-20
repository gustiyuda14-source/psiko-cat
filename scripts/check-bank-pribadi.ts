import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { aspekIntegritas } from "../lib/scoring/pribadi";

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
type SkItem = { id: string; dimensi: string; sub?: string; situasi: string; opsi: { A: string; B: string }; kunci: "A" | "B"; kembar_dengan: string | null; pembahasan: string };
// Proporsi dimensi per 63 butir sumber (pedoman §3.1).
const PROPORSI: Record<string, number> = { D1: 4, D2: 5, D3: 6, D4: 12, D5: 6, D6: 6, D7: 4, D8: 8, D9: 6, D10: 2, D11: 4 };
let skTotal = 0;
// Kembar sengaja mirip; butir lain tidak boleh hampir sama (situasi + opsi).
const skSeen: { id: string; kembar: string | null; w: string[] }[] = [];
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
    assert.doesNotThrow(() => aspekIntegritas(it.dimensi, it.sub), `${at}: tidak terpetakan ke aspek Integritas (D4 wajib sub patuh/inovasi)`);
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
    const sw = words(`${it.situasi} ${it.opsi.A} ${it.opsi.B}`);
    for (const o of skSeen) {
      if (o.id === it.kembar_dengan) continue;
      assert.ok(jaccard(sw, o.w) < 0.6, `${at}: terlalu mirip ${o.id}`);
    }
    skSeen.push({ id: it.id, kembar: it.kembar_dengan, w: sw });
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

// --- Kepribadian situasional (bank/pribadi/sjt-*.json): 5 opsi berbobot 1–5, kunci = bobot 5 ---
type SjtItem = { id: string; aspek: string; situasi: string; opsi: Record<string, string>; bobot: Record<string, number>; alasan_opsi: Record<string, string>; tips: string; kembar_dengan: string | null };
const POLISI = /polisi|polri|polres|polsek|polda|bhayangkara|brimob|bintara|taruna|akpol|patroli|tilang|razia|\bTKP\b/i;
const L5 = ["A", "B", "C", "D", "E"];
let sjtTotal = 0;
const sjtSeen: { id: string; w: string[] }[] = [];
const sjtFiles = fs.readdirSync(dir).filter((f) => /^sjt-.*\.json$/.test(f));
for (const f of sjtFiles) {
  const bank = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as { definisi_aspek: Record<string, string>; items: SjtItem[] };
  const byId = new Map(bank.items.map((it) => [it.id, it]));
  const kunci = new Map<string, number>();
  let terpanjang = 0;
  for (const it of bank.items) {
    const at = `${f} ${it.id}`;
    assert.ok(!seenId.has(it.id), `${at}: id ganda`);
    seenId.add(it.id);
    assert.ok(bank.definisi_aspek[it.aspek], `${at}: aspek tanpa definisi`);
    assert.deepEqual(Object.keys(it.opsi), L5, `${at}: opsi harus A–E`);
    assert.equal(new Set(L5.map((k) => it.opsi[k].trim())).size, 5, `${at}: ada opsi kosong/kembar`);
    assert.deepEqual(L5.map((k) => it.bobot[k]).sort(), [1, 2, 3, 4, 5], `${at}: bobot harus 1–5 masing-masing sekali`);
    assert.ok(L5.every((k) => it.alasan_opsi[k]?.trim()) && it.tips.trim(), `${at}: alasan tiap opsi dan tips wajib`);
    const text = [it.situasi, ...Object.values(it.opsi), ...Object.values(it.alasan_opsi), it.tips].join(" ");
    assert.ok(!POLISI.test(text), `${at}: memuat unsur kepolisian (pedoman A-7)`);
    assert.ok(it.situasi.split(/\s+/).length <= 60, `${at}: situasi lebih dari 60 kata`);
    const k = L5.find((x) => it.bobot[x] === 5)!;
    kunci.set(k, (kunci.get(k) ?? 0) + 1);
    if (L5.every((x) => x === k || it.opsi[x].length < it.opsi[k].length)) terpanjang++;
    if (it.kembar_dengan) {
      const t = byId.get(it.kembar_dengan);
      assert.ok(t && t.kembar_dengan === it.id && t.aspek === it.aspek, `${at}: kembar tidak timbal balik / beda aspek`);
      assert.notEqual(L5.find((x) => t.bobot[x] === 5), k, `${at}: kembar harus beda huruf kunci`);
    }
    const w = words(`${it.situasi} ${Object.values(it.opsi).join(" ")}`);
    for (const o of sjtSeen) if (o.id !== it.kembar_dengan) assert.ok(jaccard(w, o.w) < 0.6, `${at}: terlalu mirip ${o.id}`);
    sjtSeen.push({ id: it.id, w });
    sjtTotal++;
  }
  const n = bank.items.length;
  for (const [h, c] of kunci) assert.ok(c <= Math.ceil(n * 0.24), `${f}: kunci ${h} ${c} dari ${n} (maks 24%)`);
  assert.ok(terpanjang <= Math.ceil(n * 0.24), `${f}: kunci = opsi terpanjang di ${terpanjang} butir (pedoman D-3)`);
}

console.log(`Bank PRIBADI: ${total} butir KP, ${sjtTotal} butir SJT, dan ${skTotal} butir SK dari ${files.length + sjtFiles.length + skFiles.length} file lolos semua cek.`);
