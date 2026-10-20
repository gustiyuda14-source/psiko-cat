/**
 * K19 Jaring-Jaring Kubus: 50 butir drill (30 reguler tier 1–3 + 20 HOTS), soal + pembahasan dari satu generator.
 *
 *   npx tsx scripts/generate-k19-kubus.ts            # tulis bank + SVG
 *   npx tsx scripts/generate-k19-kubus.ts --blind    # tulis paket cek buta (tanpa kunci) ke output/k19-blind/
 *
 * Seed tetap: butir 1–30 = mockup yang disetujui pemilik 2026-10-20, jangan ubah urutan pemanggilan RNG.
 * Mesin: kubus-core (lipat/rotasi/tanda tangan), kubus-render (SVG), kubus-explain (alasan pengecoh),
 * kubus-items (tipe A jaring→kubus, tipe B kubus→jaring), kubus-hots (butir 31–50), kubus-blind (deskripsi cek buta).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { build, rng, Item } from "./kubus-items";
import { buildHots } from "./kubus-hots";
import { BLIND_LEGEND } from "./kubus-blind";

const ROOT = join(__dirname, "..");
const RILIS = "2026-10-20";
const STATUS = "ganda"; // cek buta Codex 2026-10-20, lihat bank/drill/LOG.md

function generate(): Item[] {
  const PLAN: ("A" | "B")[] = ["A","A","B","A","A","B","A","A","B","A", "A","B","A","B","B","A","B","A","B","A", "B","A","A","B","A","B","B","A","B","A"];
  const r = rng(20261020);
  let keys: string[];
  for (;;) {
    keys = "ABCDE".repeat(6).split("").sort(() => r() - 0.5);
    if (!keys.some((k, i) => i >= 2 && k === keys[i - 1] && k === keys[i - 2])) break;
  }
  const reg = PLAN.map((t, i) => build(9100 + i * 37, i + 1, (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3, t, keys[i]));
  const PLAN_H: ("A" | "B")[] = ["A","B","A","B","B","A","B","A","A","B", "B","A","B","A","A","B","A","B","B","A"];
  const rh = rng(20261021), prev = reg.slice(-2).map((i) => i.kunci);
  let kh: string[];
  for (;;) {
    kh = "ABCDE".repeat(4).split("").sort(() => rh() - 0.5);
    const all = prev.concat(kh);
    if (!all.some((k, i) => i >= 2 && k === all[i - 1] && k === all[i - 2])) break;
  }
  return reg.concat(PLAN_H.map((t, i) => buildHots(31000 + i * 53, 31 + i, t, kh[i])));
}

const items = generate();
const id = (no: number) => `K19-N-${String(no).padStart(3, "0")}`;
const SUB = (it: Item) => `FIG-KUBUS-${it.hots ? "HOTS-" : ""}${it.tipe === "A" ? "LIPAT" : "BUKA"}`;

if (process.argv.includes("--blind")) {
  // Paket cek buta: deskripsi soal + opsi, tanpa kunci/pembahasan.
  const dir = join(ROOT, "output/k19-blind");
  mkdirSync(dir, { recursive: true });
  const body = items.map((it) => `## ${id(it.no)}\n${it.stem}\n${it.buta}`).join("\n\n");
  writeFileSync(join(dir, "soal.md"), `${BLIND_LEGEND}\n\n${body}\n`);
  console.log(`paket buta ${items.length} butir -> output/k19-blind/soal.md`);
} else {
  const img = join(ROOT, "public/drill/img"), pb = join(ROOT, "data/drill-pembahasan");
  mkdirSync(img, { recursive: true });
  mkdirSync(pb, { recursive: true });
  const bank = items.map((it) => {
    const i = id(it.no), opsi: Record<string, string> = {}, og: Record<string, string> = {};
    writeFileSync(join(img, `${i}.svg`), it.gambar);
    for (const o of it.opsi) {
      const k = o.huruf.toLowerCase();
      opsi[k] = `Gambar ${o.huruf}`;
      og[k] = `drill/img/${i}-${k}.svg`;
      writeFileSync(join(ROOT, "public", og[k]), o.svg);
    }
    writeFileSync(join(pb, `${i}.svg`), it.gambar_pembahasan);
    return {
      id: i, kartu: "K19", sub_type: SUB(it), tier: it.tier, sumber: "baru", rilis: RILIS,
      stem: it.stem, gambar: `drill/img/${i}.svg`, opsi, opsi_gambar: og, kunci: [it.kunci.toLowerCase()],
      pembahasan: it.pembahasan, gambar_pembahasan: `${i}.svg`, status_kunci: STATUS,
    };
  });
  writeFileSync(join(ROOT, "bank/drill/kecerdasan/K19-jaring-kubus.json"), JSON.stringify(bank, null, 2) + "\n");
  console.log(`K19 ${bank.length} butir -> bank/drill/kecerdasan/K19-jaring-kubus.json`);
}
