import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { makeColumn, maxAlternation, maxRun, mulberry32, shuffle } from "./generate-kecermatan-simbol";
import { simbolSimulasi } from "./generate-kecermatan-sains";

// Generator Kecermatan latihan aspek "Aksara Asing": Hangeul (Korea) dan Kana (Jepang).
// 5 paket (901-905), 10 kolom x 50 butir, kolom selang-seling Hangeul/Kana (PM 21-10).
// - Kesulitan menengah -> HOTS per paket: 901 = 1 pasang mirip per kolom; 902 = 2 pasang;
//   903 = keluarga 3 + 1 pasang; 904 = keluarga 4; 905 = 5 aksara kembar beda 1 goresan/tanda.
//   Kolom I tiap paket = pemanasan (satu tingkat di bawah paket itu).
// - Paket ganjil mulai Hangeul, paket genap mulai Kana; tiap paket 5 kolom per aksara.
// - Dihindari: kana kecil (ャ vs ヤ, beda ukuran hilang saat diskalakan), pasangan lintas aksara
//   yang nyaris kembar (へ/ヘ, り/リ), kanji (口 二 工), dan dua aksara berlabel sama di satu kolom.
// - Urutan jawaban: makeColumn (pedoman Kecermatan §4). Anti-bocor: simbolSimulasi() (A-4).
// - Glyph = outline path Noto Sans KR/JP Medium (OFL) lewat Python fontTools, bukan <text>,
//   jadi tampil sama di Windows 7. Skala seragam per aksara (sisi terpanjang di seluruh set =
//   FILL), supaya proporsi asli (으 lebar, ノ kecil) tetap terlihat seperti tulisan sungguhan.
//
// Font tidak disimpan di repo. Unduh dulu ke satu folder:
//   https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/KR/NotoSansKR-Medium.otf
//   https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/JP/NotoSansJP-Medium.otf
// Pakai: AKSARA_FONT_DIR=<folder> npx tsx scripts/generate-kecermatan-aksara.ts   (+ `pip install fonttools`)
// Hasil: prisma/data/bank_soal_p901.json ... p905.json, public/kecermatan-aksara/p90x/*.svg,
//        label baru di data/kecermatan-pelafalan.json, lembar review output/aksara-review.html.
// Hasil reproducible (seed = nomor paket). Self-check membaca ulang JSON dari disk di akhir.

const KEYS = ["A", "B", "C", "D", "E"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
type Key = (typeof KEYS)[number];
const FILL = 72; // sisi terpanjang glyph terbesar per aksara, satuan viewBox 100
const TEBAL = 1; // stroke penebal, satuan viewBox
const FONT = {
  KR: { file: "NotoSansKR-Medium.otf", sha: "b46988ef13e8bac08f3933af686eaf770972994f9b6d335be0184d60169b5431" },
  JP: { file: "NotoSansJP-Medium.otf", sha: "f396a3b57256e4515be9cb41f7aac54766d654890082a9f1b5c2451b5c093d8a" },
};
const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

// Label pelafalan: romanisasi resmi Korea (Revised Romanization) / Hepburn.
const LABEL: Record<string, string> = {
  가: "ga", 너: "neo", 도: "do", 루: "ru", 미: "mi", 바: "ba", 파: "pa", 서: "seo", 고: "go", 누: "nu",
  다: "da", 타: "ta", 소: "so", 주: "ju", 어: "eo", 여: "yeo", 로: "ro", 무: "mu", 갈: "gal", 걸: "geol",
  비: "bi", 수: "su", 토: "to", 자: "ja", 차: "cha", 오: "o", 요: "yo", 는: "neun", 애: "ae", 에: "e",
  마: "ma", 숲: "sup", 들: "deul", 틀: "teul", 강: "gang", 장: "jang", 우: "u", 유: "yu", 커: "keo",
  터: "teo", 날: "nal", 밤: "bam", 밥: "bap", 녀: "nyeo", 와: "wa", 워: "wo", 카: "ka", 흙: "heuk",
  아: "a", 이: "i", 개: "gae", 게: "ge", 계: "gye", 뉴: "nyu", 맘: "mam", 으: "eu", 외: "oe", 웨: "we",
  산: "san", 걀: "gyal", 결: "gyeol", 밭: "bat", 노: "no", 얘: "yae", 예: "ye", 늘: "neul", 를: "reul",
  사: "sa", 꽤: "kkwae", 꿰: "kkwe", 괘: "gwae", 궤: "gwe", 봐: "bwa", 뵈: "boe", 봬: "bwae", 붜: "bwo",
  붸: "bwe", 놔: "nwa", 놰: "nwae", 뇌: "noe", 눠: "nwo", 눼: "nwe", 골: "gol", 꽈: "kkwa", 꾀: "kkoe",
  꿔: "kkwo",
  シ: "shi", ツ: "tsu", カ: "ka", ヘ: "he", ミ: "mi", ソ: "so", ン: "n", ア: "a", キ: "ki", モ: "mo",
  ぬ: "nu", め: "me", か: "ka", そ: "so", た: "ta", る: "ru", ろ: "ro", に: "ni", ふ: "fu", え: "e",
  ク: "ku", ケ: "ke", イ: "i", ホ: "ho", ロ: "ro", さ: "sa", ち: "chi", の: "no", ゆ: "yu", へ: "he",
  ね: "ne", れ: "re", タ: "ta", コ: "ko", ユ: "yu", は: "ha", ほ: "ho", い: "i", り: "ri", わ: "wa",
  ば: "ba", ぱ: "pa", ヨ: "yo", あ: "a", お: "o", ウ: "u", ワ: "wa", フ: "fu", チ: "chi", テ: "te",
  こ: "ko", ジ: "ji", ヅ: "zu", ぼ: "bo", ひ: "hi", び: "bi", ぴ: "pi", ぶ: "bu",
};

// Himpunan kunci per tingkat. L0 semua beda jauh, L1 1 pasang mirip, L2 2 pasang,
// L3 keluarga 3 + 1 pasang, L4 keluarga 4 + 1, L5 lima kembar. Yang mirip ditulis berdampingan.
const HANGEUL: string[][] = [
  ["가너도루미"],
  ["바파서고누", "다타미소주", "어여가로무", "갈걸비수토"],
  ["자차오요는", "애에마바숲", "들틀강장비", "우유커터날", "밤밥너녀수", "와워가카흙"],
  ["아어이바파", "개게계누뉴", "맘밤밥다타", "오우으자차"],
  ["와워외웨산", "갈걀걸결무", "맘밤밥밭노", "애에얘예고", "늘를들틀사", "꽤꿰괘궤미"],
  ["봐뵈봬붜붸", "놔놰뇌눠눼", "갈걀걸결골", "꽈꽤꾀꿔꿰"],
];
const KANA: string[][] = [
  [],
  ["シツカヘミ", "ソンアキモ", "ぬめかそた", "るろにふえ", "クケイホロ", "さちのゆへ"],
  ["シツソンホ", "ねれるろか", "クタコユミ", "はほいりゆ"],
  ["クケタシツ", "ねれわぬめ", "はばぱさち", "コユヨソン", "あおめるろ", "ウワフチテ"],
  ["シツソンア", "クケタワホ", "はばぱほい", "ぬめねれこ"],
  ["シジツヅソ", "はばぱほぼ", "クケタワウ", "ねれわぬめ", "ひびぴふぶ"],
];

// Paket ke-i (0-4) bertingkat L = i+1. Kolom I = L-1 (pemanasan), kolom lain = L.
// Aksara pembuka bergantian: paket ganjil Hangeul, genap Kana. Set kolom lain diambil berurutan
// dari pool tingkatnya; pemanasan = set terakhir pool tingkat di bawahnya (tidak dipakai paket lain).
export const PAKET: string[][] = [0, 1, 2, 3, 4].map((i) => {
  const level = i + 1;
  const pakai = { H: 0, K: 0 };
  return ROMAN.map((_, c) => {
    const hangeul = (c % 2 === 0) === (i % 2 === 0);
    const pool = hangeul ? HANGEUL : KANA;
    if (c === 0) return pool[level - 1].at(-1)!;
    return pool[level][hangeul ? pakai.H++ : pakai.K++];
  });
});

const isHangeul = (ch: string) => /\p{Script=Hangul}/u.test(ch);
const fileOf = (ch: string) => `u${ch.codePointAt(0)!.toString(16)}.svg`;
const pathOf = (nomor: number, ch: string) => `/kecermatan-aksara/p${nomor}/${fileOf(ch)}`;

// Outline glyph dengan skala seragam (s sama untuk semua karakter satu font), ditengahkan.
const PY = `
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font = TTFont(sys.argv[1]); gs = font.getGlyphSet(); cmap = font.getBestCmap()
fill = float(sys.argv[2]); chars = sys.argv[3]; bounds = {}
for ch in chars:
    name = cmap.get(ord(ch))
    if name is None: print(json.dumps({"missing": ch})); sys.exit()
    bp = BoundsPen(gs); gs[name].draw(bp); bounds[ch] = (name, bp.bounds)
s = fill / max(max(b[2] - b[0], b[3] - b[1]) for _, b in bounds.values())
out = {}
for ch, (name, (x0, y0, x1, y1)) in bounds.items():
    pen = SVGPathPen(gs, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, 50 - s * (x0 + x1) / 2, 50 + s * (y0 + y1) / 2)))
    out[ch] = pen.getCommands()
print(json.dumps(out))
`;

function glyphPaths(font: keyof typeof FONT, chars: string[]): Record<string, string> {
  const dir = process.env.AKSARA_FONT_DIR;
  assert.ok(dir, "Set AKSARA_FONT_DIR ke folder berisi font Noto (lihat header file ini)");
  const file = `${dir}/${FONT[font].file}`;
  assert.ok(existsSync(file), `Font tidak ada: ${file}`);
  assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), FONT[font].sha, `Versi font beda: ${file}`);
  const out = JSON.parse(execFileSync("python3", ["-c", PY, file, String(FILL), chars.join("")], { encoding: "utf8", maxBuffer: 1 << 26 }));
  assert.ok(!out.missing, `Glyph ${out.missing} tidak ada di ${FONT[font].file}`);
  return out;
}

const svgOf = (d: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="#fff"/>` +
  `<path d="${d}" fill="#000" stroke="#000" stroke-width="${TEBAL}" stroke-linejoin="round"/></svg>\n`;

function makeBank(index: number, glyph: Record<string, string>) {
  const nomor = 901 + index;
  const rand = mulberry32(nomor);
  const dir = root(`public/kecermatan-aksara/p${nomor}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const ch of new Set(PAKET[index].flatMap((s) => [...s]))) writeFileSync(root(`public${pathOf(nomor, ch)}`), svgOf(glyph[ch]));
  return {
    nomor,
    nama: `Paket Aksara Asing ${index + 1}`,
    kategori: "AKSARA_ASING",
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
  const row = (nomor: number, set: string, c: number) => {
    const cells = [...set].map((ch) => {
      const src = `../public${pathOf(nomor, ch)}`;
      return `<td><img src="${src}" width="40" height="40"><img src="${src}" width="100" height="100"><br><b>${ch}</b> ${LABEL[ch]}</td>`;
    });
    return `<tr><th>${ROMAN[c]}<br>${isHangeul(set) ? "Hangeul" : "Kana"}</th>${cells.join("")}</tr>`;
  };
  const body = PAKET.map((sets, i) =>
    `<section id="p${901 + i}"><h2>Paket ${901 + i}</h2><table>${sets.map((s, c) => row(901 + i, s, c)).join("")}</table></section>`).join("");
  writeFileSync(root("output/aksara-review.html"),
    `<!doctype html><meta charset="utf-8"><title>Review Aksara Asing</title><style>` +
    `body{font:13px system-ui;margin:16px;background:#ddd}table{border-collapse:collapse;margin-bottom:12px}` +
    `td,th{border:1px solid #999;padding:4px 6px;text-align:center;vertical-align:bottom;background:#f4f4f4}` +
    `img{margin:2px;vertical-align:bottom;border:1px solid #bbb}h2{margin:8px 0 4px}` +
    // Buka dengan #p901 dst. untuk menampilkan satu paket saja (screenshot).
    `body:has(:target) section:not(:target){display:none}</style>` +
    `<h1>Review Aksara Asing 901–905</h1>${body}\n`);
}

// Self-check: baca ulang 5 JSON dari disk.
function verify(terlarang: Set<string>) {
  const sums = new Set<string>();
  PAKET.forEach((sets, i) => {
    const nomor = 901 + i;
    const raw = readFileSync(root(`prisma/data/bank_soal_p${nomor}.json`), "utf8");
    sums.add(createHash("sha256").update(raw).digest("hex"));
    const bank = JSON.parse(raw);
    assert.equal(bank.kategori, "AKSARA_ASING");
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
        for (const v of s.shown) assert.ok(vals.includes(v));
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
      assert.equal(chars.length, 5, `p${nomor} kolom ${c + 1}: harus 5 aksara`);
      assert.equal(new Set(chars).size, 5, `p${nomor} kolom ${c + 1}: aksara kembar`);
      assert.equal(new Set(chars.map((ch) => LABEL[ch])).size, 5, `p${nomor} kolom ${c + 1}: label kembar`);
      assert.ok(chars.every(isHangeul) || !chars.some(isHangeul), `p${nomor} kolom ${c + 1}: aksara campur`);
      assert.equal(isHangeul(set), (c % 2 === 0) === (i % 2 === 0), `p${nomor} kolom ${c + 1}: urutan selang-seling`);
      for (const ch of chars) assert.ok(!terlarang.has(ch), `p${nomor}: ${ch} dipakai di bank simulasi`);
    });
    assert.equal(new Set(sets.map((s) => [...s].sort().join())).size, 10, `p${nomor}: himpunan kolom kembar`);
  });
  assert.equal(sums.size, 5, "Ada file JSON yang identik");
}

function main() {
  const terlarang = simbolSimulasi();
  const chars = [...new Set(PAKET.flat().flatMap((s) => [...s]))];
  for (const ch of chars) assert.ok(LABEL[ch], `Label pelafalan kosong: ${ch}`);
  const glyph = { ...glyphPaths("KR", chars.filter(isHangeul)), ...glyphPaths("JP", chars.filter((ch) => !isHangeul(ch))) };
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
  console.log(`OK: 5 paket x 500 butir, ${chars.length} aksara unik, ${Object.keys(pelafalan).length} label`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
