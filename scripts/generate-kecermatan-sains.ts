import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { makeColumn, maxAlternation, maxRun, mulberry32, shuffle } from "./generate-kecermatan-simbol";

// Generator Kecermatan latihan aspek "Simbol Sains": huruf Yunani + notasi
// matematika/fisika/kimia (∫ ∂ ∇ ⊂ ≈ ⇌ ℏ Å ...). 5 paket (701-705), 10 kolom x 50 butir.
// - Kesulitan naik per paket: 701 = 5 simbol beda jauh per kolom; 702 = 1 pasang mirip;
//   703 = 2 pasang mirip; 704 = keluarga 3-4 simbol mirip; 705 = satu keluarga kembar.
//   Kolom I tiap paket = pemanasan (satu tingkat di bawah paket itu).
// - Urutan jawaban: makeColumn dari generate-kecermatan-simbol.ts (pedoman Kecermatan §4).
// - Anti-bocor (pedoman utama A-4): simbol yang tampil di bank simulasi (p10-p13, p401,
//   termasuk λ Λ ψ Ψ χ θ Θ φ Φ ω) dan varian bentuknya (ϕ ɸ ϑ) ditolak.
// - Glyph = outline path dari font STIX Two Math (OFL, bawaan macOS), diekstrak lewat
//   Python fontTools. Bukan <text>, jadi tampilan sama di semua HP. Glyph diskalakan
//   supaya sisi terpanjangnya 70% kotak, lalu ditebalkan sedikit (stroke) agar detail
//   kecil tetap terlihat di kotak 40px.
//
// Pakai: npx tsx scripts/generate-kecermatan-sains.ts
// Syarat: macOS (/System/Library/Fonts/Supplemental/STIXTwoMath.otf) + `pip install fonttools`.
// Hasil: prisma/data/bank_soal_p701.json ... p705.json, public/kecermatan-sains/p70x/*.svg,
//        label baru di data/kecermatan-pelafalan.json, lembar review output/simbol-sains-review.html.
// Hasil reproducible (seed = nomor paket). Self-check membaca ulang JSON dari disk di akhir.

const KEYS = ["A", "B", "C", "D", "E"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
type Key = (typeof KEYS)[number];
const FONT = "/System/Library/Fonts/Supplemental/STIXTwoMath.otf";
const FILL = 70; // sisi terpanjang glyph, dalam satuan viewBox 100
const TEBAL = 1.6; // stroke penebal, satuan viewBox
const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

// Label pelafalan per simbol. Simbol kembar wajib punya label yang beda.
const LABEL: Record<string, string> = {
  α: "alfa", β: "beta", γ: "gamma", δ: "delta kecil", Δ: "delta besar", ε: "epsilon", ζ: "zeta",
  η: "eta", κ: "kapa", μ: "mu", ν: "nu", ξ: "ksi", π: "pi", ρ: "rho", ϱ: "rho ekor",
  σ: "sigma kecil", τ: "tau", Γ: "gamma besar", Ω: "omega besar", "℧": "omega terbalik",
  "∑": "sigma jumlah", "∏": "produk", "∐": "produk terbalik",
  "∫": "integral", "∬": "integral ganda", "∭": "integral lipat tiga", "∮": "integral tertutup",
  "∯": "integral permukaan", "∂": "parsial", "∇": "nabla",
  "√": "akar", "∛": "akar pangkat tiga", "∜": "akar pangkat empat", "∞": "tak hingga", "∝": "sebanding",
  "≈": "hampir sama", "≃": "tilde garis", "≅": "kongruen", "≡": "identik", "≢": "tidak identik",
  "≠": "tidak sama", "±": "plus minus", "∓": "minus plus", "÷": "bagi",
  "∈": "elemen", "∉": "bukan elemen", "∋": "memuat",
  "⊂": "subset", "⊃": "superset", "⊆": "subset sama", "⊇": "superset sama", "⊊": "subset sejati",
  "⊄": "bukan subset", "⊏": "subset kotak",
  "∩": "irisan", "∪": "gabungan", "⊓": "irisan kotak", "⊔": "gabungan kotak",
  "∀": "untuk semua", "∃": "ada", "∅": "himpunan kosong",
  "ℏ": "h coret", Å: "angstrom", "℃": "derajat celsius", "‰": "permil",
  "→": "panah", "↔": "panah dua arah", "⇒": "implikasi", "⇔": "ekuivalen",
  "⇌": "setimbang", "⇋": "setimbang terbalik", "⇄": "panah bolak-balik",
  "∴": "jadi", "∵": "karena", "⊥": "tegak lurus", "⊤": "T tegak", "⊢": "T kanan", "⊣": "T kiri",
  "∥": "sejajar", "∠": "sudut",
  "⊕": "plus bulat", "⊗": "kali bulat", "⊙": "titik bulat", "⊖": "minus bulat", "⊘": "garis bulat",
  "≤": "kurang sama", "≥": "lebih sama", "≦": "kurang sama ganda", "≪": "jauh kurang", "≺": "mendahului",
};

// 10 himpunan kunci per paket (kolom I-X). Pasangan mirip ditulis berdampingan.
export const PAKET: string[][] = [
  // 701: semua beda jauh
  ["∞√Δ∫±", "α∑→∅≠", "π∂∪‰⇒", "Ω∇÷∀∠", "β∮⊕≈∃", "μ∏∴⊥℃", "δℏ∩⇌≡", "Γ√∈⊗∞", "ρ∑∥Å∝", "η∫⊂↔∵"],
  // 702: 1 pasang mirip per kolom (kolom I tanpa pasangan)
  ["σ∞∠∏⊕", "∫∮α≠∴", "⊂⊃μ∇‰", "∩∪β√⇒", "∀∃π≈℃", "±∓Ω∂∈", "∴∵γ∑∅", "⇒⇔δ∞⊥", "≈≡ζÅ∠", "Δ∇ε∥⊗"],
  // 703: 2 pasang mirip per kolom (kolom I satu pasang)
  ["∈∋Γ∞‰", "∫∬⊂⊆α", "⊕⊗∴∵ν", "≈≃∀∃ρ", "≤≥∩∪ξ", "⇒⇔±∓κ", "⊥⊤∑∏η", "Δ∇≠≡τ", "∂δ∮∯μ", "∈∉⊙⊖ℏ"],
  // 704: keluarga 3-4 simbol mirip (kolom I dua pasang)
  ["∴∵⊂⊃Ω", "∫∬∭∮α", "⊂⊃⊆⊇∞", "≈≃≅≡∂", "⊕⊗⊙⊖∑", "→↔⇒⇔μ", "√∛∜∝∇", "α∝∞∂δ", "⊢⊣⊤⊥Γ", "∈∋∉ε∀"],
  // 705: satu keluarga kembar per kolom (kolom I keluarga 4 + 1)
  ["∩∪⊓⊔∅", "∈∉∋ε∃", "⊂⊆⊊⊄⊏", "≈≃≅≡≢", "∂δσρϱ", "⇌⇄⇋↔⇔", "∫∬∮∯∭", "Ω℧∏∐∩", "⊕⊗⊙⊖⊘", "≤≦≪≺∠"],
];

// Simbol Hilang 301 (tidak boleh ada kolom yang sama persis dengan himpunannya).
const GREEK_301 = [..."εξζΠϖΓΦθμΩ"];
// Varian bentuk dari huruf simulasi; ditolak walau kode Unicode-nya beda.
const VARIAN_SIMULASI = [..."ϕɸϑϴ"];

const slug = (ch: string) => LABEL[ch].replace(/\s+/g, "-").toLowerCase();
const pathOf = (nomor: number, ch: string) => `/kecermatan-sains/p${nomor}/${slug(ch)}.svg`;

// Ekstrak outline glyph (sudah diskalakan & ditengahkan ke kotak 100) dari STIX Two Math.
const PY = `
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font = TTFont(sys.argv[1]); gs = font.getGlyphSet(); cmap = font.getBestCmap()
fill = float(sys.argv[2]); out = {}
for ch in sys.argv[3]:
    name = cmap.get(ord(ch))
    if name is None: out[ch] = None; continue
    bp = BoundsPen(gs); gs[name].draw(bp); x0, y0, x1, y1 = bp.bounds
    s = fill / max(x1 - x0, y1 - y0)
    pen = SVGPathPen(gs, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, 50 - s * (x0 + x1) / 2, 50 + s * (y0 + y1) / 2)))
    out[ch] = pen.getCommands()
print(json.dumps(out))
`;

function glyphPaths(chars: string[]): Record<string, string> {
  assert.ok(existsSync(FONT), `Font tidak ada: ${FONT}`);
  const out = JSON.parse(execFileSync("python3", ["-c", PY, FONT, String(FILL), chars.join("")], { encoding: "utf8" }));
  for (const ch of chars) assert.ok(out[ch], `Glyph ${ch} tidak ada di STIX Two Math`);
  return out;
}

const svgOf = (d: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="#fff"/>` +
  `<path d="${d}" fill="#000" stroke="#000" stroke-width="${TEBAL}" stroke-linejoin="round"/></svg>\n`;

// Teks simbol yang tampil di bank simulasi (SVG <text>) + varian bentuknya.
export function simbolSimulasi(): Set<string> {
  const found = new Set<string>(VARIAN_SIMULASI);
  for (const p of [10, 11, 12, 13, 401]) {
    const bank = JSON.parse(readFileSync(root(`prisma/data/bank_soal_p${p}.json`), "utf8"));
    for (const k of bank.kolom) for (const v of Object.values(k.simbol) as string[]) {
      if (!v.endsWith(".svg")) { [...v].forEach((c) => found.add(c)); continue; }
      const svg = readFileSync(root(`public${v}`), "utf8");
      for (const m of svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)) [...m[1]].forEach((c) => found.add(c));
    }
  }
  return found;
}

function makeBank(index: number, glyph: Record<string, string>) {
  const nomor = 701 + index;
  const rand = mulberry32(nomor);
  const dir = root(`public/kecermatan-sains/p${nomor}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const ch of new Set(PAKET[index].flatMap((s) => [...s]))) writeFileSync(root(`public${pathOf(nomor, ch)}`), svgOf(glyph[ch]));
  return {
    nomor,
    nama: `Paket Simbol Sains ${index + 1}`,
    kategori: "SIMBOL_SAINS",
    total_soal: 500,
    kolom: ROMAN.map((roman, c) => {
      const values = shuffle([...PAKET[index][c]], rand).map((ch) => pathOf(nomor, ch));
      const simbol = Object.fromEntries(KEYS.map((k, i) => [k, values[i]])) as Record<Key, string>;
      return { nomor: c + 1, roman, simbol, soal: makeColumn(simbol, rand) };
    }),
  };
}

// Lembar review: kunci tiap kolom di 40px (ukuran HP) dan 100px, plus label pelafalan.
function reviewSheet() {
  const charOf = new Map(Object.keys(LABEL).map((ch) => [slug(ch), ch]));
  const row = (nomor: number, set: string, c: number) => {
    const cells = [...set].map((ch) => {
      const src = `../public${pathOf(nomor, ch)}`;
      return `<td><img src="${src}" width="40" height="40"><img src="${src}" width="100" height="100"><br><b>${ch}</b> ${LABEL[ch]}</td>`;
    });
    return `<tr><th>${ROMAN[c]}</th>${cells.join("")}</tr>`;
  };
  const body = PAKET.map((sets, i) =>
    `<section id="p${701 + i}"><h2>Paket ${701 + i}</h2><table>${sets.map((s, c) => row(701 + i, s, c)).join("")}</table></section>`).join("");
  assert.ok(charOf.size === Object.keys(LABEL).length, "Slug kembar");
  writeFileSync(root("output/simbol-sains-review.html"),
    `<!doctype html><meta charset="utf-8"><title>Review Simbol Sains</title><style>` +
    `body{font:13px system-ui;margin:16px;background:#ddd}table{border-collapse:collapse;margin-bottom:12px}` +
    `td,th{border:1px solid #999;padding:4px 6px;text-align:center;vertical-align:bottom;background:#f4f4f4}` +
    `img{margin:2px;vertical-align:bottom;border:1px solid #bbb}h2{margin:8px 0 4px}` +
    // Buka dengan #p701 dst. untuk menampilkan satu paket saja (screenshot).
    `body:has(:target) section:not(:target){display:none}</style>` +
    `<h1>Review Simbol Sains 701–705</h1>${body}\n`);
}

// Self-check: baca ulang 5 JSON dari disk.
function verify(terlarang: Set<string>) {
  const sums = new Set<string>();
  PAKET.forEach((sets, i) => {
    const nomor = 701 + i;
    const raw = readFileSync(root(`prisma/data/bank_soal_p${nomor}.json`), "utf8");
    sums.add(createHash("sha256").update(raw).digest("hex"));
    const bank = JSON.parse(raw);
    assert.equal(bank.kategori, "SIMBOL_SAINS");
    assert.equal(bank.kolom.length, 10, `p${nomor}: harus 10 kolom`);
    let butir = 0;
    bank.kolom.forEach((kolom: { simbol: Record<Key, string>; soal: { shown: string[]; kunci: Key }[] }, c: number) => {
      const vals = Object.values(kolom.simbol);
      assert.equal(new Set(vals).size, 5);
      for (const v of vals) assert.ok(existsSync(root(`public${v}`)), `File tidak ada: ${v}`);
      assert.equal(kolom.soal.length, 50);
      const counts = Object.fromEntries(KEYS.map((k) => [k, 0]));
      kolom.soal.forEach((s, n) => {
        assert.equal(new Set(s.shown).size, 4);
        for (const v of s.shown) assert.ok(vals.includes(v) && existsSync(root(`public${v}`)));
        assert.deepEqual(KEYS.filter((k) => !s.shown.includes(kolom.simbol[k])), [s.kunci]);
        if (n) assert.notEqual(s.shown.join(), kolom.soal[n - 1].shown.join());
        counts[s.kunci]++;
        butir++;
      });
      assert.deepEqual(Object.values(counts), [10, 10, 10, 10, 10], `p${nomor} kolom ${c + 1}: sebaran kunci`);
      assert.ok(maxRun(kolom.soal.map((s) => s.kunci)) <= 2);
      assert.ok(maxAlternation(kolom.soal.map((s) => s.kunci)) <= 4);
    });
    assert.equal(butir, 500);
    sets.forEach((set, c) => {
      const chars = [...set];
      assert.equal(new Set(chars).size, 5, `p${nomor} kolom ${c + 1}: simbol kembar`);
      assert.equal(new Set(chars.map((ch) => LABEL[ch])).size, 5, `p${nomor} kolom ${c + 1}: label kembar`);
      for (const ch of chars) assert.ok(!terlarang.has(ch), `p${nomor}: ${ch} dipakai di bank simulasi`);
      assert.ok(chars.filter((ch) => !GREEK_301.includes(ch)).length >= 2, `p${nomor} kolom ${c + 1}: terlalu mirip 301`);
      assert.ok(!(chars.includes("Σ") && chars.includes("∑")) && !(chars.includes("Π") && chars.includes("∏")));
    });
    assert.equal(new Set(sets.map((s) => [...s].sort().join())).size, 10, `p${nomor}: himpunan kolom kembar`);
  });
  assert.equal(sums.size, 5, "Ada file JSON yang identik");
}

function main() {
  const terlarang = simbolSimulasi();
  const chars = [...new Set(PAKET.flat().flatMap((s) => [...s]))];
  for (const ch of chars) assert.ok(LABEL[ch], `Label pelafalan kosong: ${ch}`);
  const glyph = glyphPaths(chars);
  const pelafalan: Record<string, string> = {};
  PAKET.forEach((_, i) => {
    const bank = makeBank(i, glyph);
    for (const set of PAKET[i]) for (const ch of set) pelafalan[pathOf(bank.nomor, ch)] = LABEL[ch];
    writeFileSync(root(`prisma/data/bank_soal_p${bank.nomor}.json`), `${JSON.stringify(bank, null, 2)}\n`);
  });
  verify(terlarang);
  // Gabung ke label yang sudah ada (mekanisme sama dengan generate-kecermatan-simbol.ts).
  const labelFile = root("data/kecermatan-pelafalan.json");
  const all = JSON.parse(readFileSync(labelFile, "utf8"));
  Object.assign(all, pelafalan);
  writeFileSync(labelFile, `${JSON.stringify(Object.fromEntries(Object.entries(all).sort()), null, 2)}\n`);
  reviewSheet();
  console.log(`OK: 5 paket x 500 butir, ${chars.length} simbol unik, ${Object.keys(pelafalan).length} label; terlarang: ${[...terlarang].filter((c) => !/[A-Za-z0-9]/.test(c)).join(" ")}`);
}

// Dijalankan langsung saja; generate-kecermatan-simulasi.ts cuma mengimpor PAKET (anti-bocor).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
