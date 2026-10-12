import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { makeMap2, renderMap2, clearOfCompass, type Map2 } from "./denah-k17-bw";
import { arahBangunan, arahArah, rute2, rotArah, ring2, setRing, INSTRUKSI, type Item } from "./denah-k17-soal-bw";
import { reseed, shuffle, WALKERS, type Peta } from "./denah-k17-peta";

// Blok Denah & Arah Mata Angin (nomor 38-42) untuk kalibrasi Logis/Spasial 2026-10-12:
// tiap paket = peta A Utara di atas (38-39 ARAH, 40-41 RUTE) + peta B kompas diputar (42 ROTASI).
// Mesin dan aturan kunci sama dengan K17 (scripts/denah-k17-*.ts), peta dan seed baru, jadi
// tidak ada peta/stem drill yang muncul di paket. Tidak ada soal tier 1 (pedoman: 0% mudah).
//   npx tsx scripts/generate-kecerdasan-denah-kal.ts
// Output: prisma/data/kecerdasan_denah_kal.json ({ [package_number]: Row[] }) + output/denah-kal-preview.html

const root = path.join(__dirname, "..");
const PKGS = [13, 14, 2, 3];
const KEYS = ["A", "B", "C", "D", "E"] as const;
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.…]+/g, "").trim();

// Stem drill (K17 dan bank drill lain) tidak boleh terulang di paket.
const drillStems = new Set<string>([
  ...(JSON.parse(fs.readFileSync(path.join(root, "data/drill-bank.json"), "utf8")) as { stem: string }[]).map((q) => norm(q.stem)),
  ...(JSON.parse(fs.readFileSync(path.join(root, "bank/drill/kecerdasan/K17-denah-arah.json"), "utf8")) as { stem: string }[]).map((q) => norm(q.stem)),
]);

type Row = {
  sequence_number: number;
  options_payload: { instruksi: string; question_text: string; sub_text: null; is_multi_select: false; svg_content: string; choices: { key: string; text: string }[] };
  scoring_rule: { type: "dichotomous"; correct_key: string };
  sub_type: string;
  tingkat: 2 | 3;
  pembahasan: string;
};

/** Peta inline: id clipPath berprefiks per soal, ukuran ikut lebar layar (maks 448px). */
function inlineMap(bw: Map2, n: number, rot: number, prefix: string) {
  const svg = renderMap2(bw, n, undefined, rot)
    .replace(' width="448" height="600"', ' style="width:100%;max-width:448px;height:auto"')
    .replaceAll('id="mapclip"', `id="${prefix}mapclip"`).replaceAll("url(#mapclip)", `url(#${prefix}mapclip)`);
  assert.ok(!svg.includes('"mapclip"') && !svg.includes("#mapclip)"), "id clipPath belum berprefiks");
  return svg;
}

const toRow = (seq: number, it: Item, svg: string): Row => {
  const opsi = it.opsi as Record<string, string>, kunci = it.kunci as string[];
  const tier = it.tier as number;
  assert.ok(tier === 2 || tier === 3, `${seq}: tier ${tier}`);
  return {
    sequence_number: seq,
    options_payload: {
      instruksi: (it.instruksi as string) ?? INSTRUKSI, question_text: it.stem as string, sub_text: null, is_multi_select: false, svg_content: svg,
      choices: KEYS.map((key, i) => ({ key, text: opsi["abcde"[i]] })),
    },
    scoring_rule: { type: "dichotomous", correct_key: kunci[0].toUpperCase() },
    sub_type: it.sub_type as string, tingkat: tier, pembahasan: it.pembahasan as string,
  };
};

const out: Record<number, Row[]> = {};
const seen = new Set<string>();
const fresh = (set: (Item | null)[]) => set.every((s) => s && !drillStems.has(norm(s.stem as string)) && !seen.has(norm(s.stem as string)));

PKGS.forEach((pkg, pi) => {
  reseed(40000 + pkg * 131);
  const pos = shuffle([0, 1, 2, 3, 4]); // kunci 38-42 tersebar A-E di setiap paket
  const rows: Row[] = [];

  // Peta A: Utara di atas. ARAH arah serong (tier ≥ 2), RUTE 2 dan 3 belokan.
  setRing(ring2);
  for (let attempt = 0; ; attempt++) {
    reseed(41000 + pkg * 977 + attempt);
    const bw = makeMap2(), p = bw as unknown as Peta, used = new Set<string>();
    const walkers = shuffle(WALKERS);
    const set = [arahBangunan(p, pos[0], used), arahArah(p, pos[1], used), rute2(bw, pos[2], 2, walkers[0]), rute2(bw, pos[3], 3, walkers[1])];
    if (!fresh(set) || set.some((s) => (s!.tier as number) < 2)) continue;
    set.forEach((s, i) => rows.push(toRow(38 + i, s!, inlineMap(bw, 1, 0, `dk${pkg}q${38 + i}-`))));
    break;
  }
  // Peta B: kompas diputar 90/180/270° bergilir antarpaket.
  const k = 1 + (pi % 3);
  for (let attempt = 0; ; attempt++) {
    reseed(43000 + pkg * 977 + attempt);
    const bw = makeMap2();
    if (!clearOfCompass(bw)) continue;
    const s = rotArah(bw, k, pos[4], new Set<string>(), "b");
    if (!fresh([s])) continue;
    rows.push(toRow(42, s!, inlineMap(bw, 2, k * 90, `dk${pkg}q42-`)));
    break;
  }
  for (const r of rows) seen.add(norm(r.options_payload.question_text));
  out[pkg] = rows;
});

for (const [pkg, rows] of Object.entries(out)) {
  assert.deepEqual(rows.map((r) => r.sequence_number), [38, 39, 40, 41, 42], `pkg ${pkg}: nomor`);
  assert.equal(new Set(rows.map((r) => r.scoring_rule.correct_key)).size, 5, `pkg ${pkg}: kunci harus tersebar A-E`);
  for (const r of rows) {
    const texts = r.options_payload.choices.map((c) => c.text);
    assert.equal(new Set(texts).size, 5, `pkg ${pkg} #${r.sequence_number}: opsi kembar`);
    assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(r.options_payload.svg_content), `pkg ${pkg} #${r.sequence_number}: SVG tidak aman`);
    assert.ok(r.pembahasan.includes(`Jawaban: ${texts[KEYS.indexOf(r.scoring_rule.correct_key as (typeof KEYS)[number])]}.`), `pkg ${pkg} #${r.sequence_number}: pembahasan ≠ kunci`);
  }
}

fs.writeFileSync(path.join(root, "prisma/data/kecerdasan_denah_kal.json"), `${JSON.stringify(out, null, 2)}\n`);
fs.mkdirSync(path.join(root, "output"), { recursive: true });
fs.writeFileSync(path.join(root, "output/denah-kal-preview.html"),
  `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Denah Kalibrasi</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;max-width:900px}section{border:1px solid #aaa;margin:16px 0;padding:12px}p{font-size:13px;line-height:1.5;white-space:pre-line}</style><body>` +
  Object.entries(out).flatMap(([pkg, rows]) => rows.map((r) => `<section><h3>pkg ${pkg} · soal ${r.sequence_number} · ${r.sub_type} · tier ${r.tingkat} · kunci ${r.scoring_rule.correct_key}</h3><p><b>${r.options_payload.question_text}</b></p>${r.options_payload.svg_content}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p><p>${r.pembahasan.replaceAll("<br>", "\n")}</p></section>`)).join("") +
  `</body></html>`);
const tiers = Object.values(out).flat().map((r) => r.tingkat);
console.log(`OK: ${PKGS.length} paket × 5 soal denah · tier sedang ${tiers.filter((t) => t === 2).length} / HOTS ${tiers.filter((t) => t === 3).length}`);
for (const [pkg, rows] of Object.entries(out)) console.log(`  pkg ${pkg}: ${rows.map((r) => `${r.sequence_number}${r.sub_type.replace("FIG-DENAH-", "")[0]}${r.tingkat}${r.scoring_rule.correct_key}`).join(" ")}`);
