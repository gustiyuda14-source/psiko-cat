import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Generator Kecermatan Simbol Hilang (huruf Yunani mirip). Aturan diturunkan
// dari contoh soal Polri (FILE PSIKO POLRI 2026/1_5017529637278843693.pdf):
// - satu paket cuma pakai 10 simbol yang saling mirip, kunci antar kolom tumpang tindih
// - kolom 6-10 memakai himpunan kunci kolom 1-5, urutan huruf diacak ulang
// - tiap kolom 50 soal, jawaban A-E masing-masing tepat 10
// - jawaban sama berturut-turut boleh, maksimal 2; soal identik tidak boleh berurutan
// - urutan 4 simbol yang tampil acak penuh (soal kembar tak berurutan muncul alami)
// Daur ulang blok template seperti di PDF sengaja TIDAK ditiru: mudah ditebak.
//
// Paket 301 = huruf Yunani (paling mirip soal asli). Paket 302-305 = "aksara
// karangan" SVG: goresan di grid titik 3x3, gaya beda per paket. 10 glyph per
// paket = 2 glyph dasar x 5 varian yang cuma beda 1 goresan, jadi saling mirip
// dan tidak ada di CAT lain.
//
// Pakai: npx tsx scripts/generate-kecermatan-simbol.ts
// Hasil: prisma/data/bank_soal_p301.json ... p305.json + public/kecermatan-simbol/p30x/*.svg,
//        prisma/data/bank_soal_p9.json, p10.json + public/kecermatan-siluet/*.svg (lihat siluetBank)

const KEYS = ["A", "B", "C", "D", "E"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
type Key = (typeof KEYS)[number];

const GREEK = [..."εξζΠϖΓΦθμΩ"];
// Kata bantuan pelafalan (latihan) per simbol; ditulis ke data/kecermatan-pelafalan.json.
const pelafalan: Record<string, string> = {
  ε: "epsilon", ξ: "ksi", ζ: "zeta", Π: "pi besar", ϖ: "pi lengkung",
  Γ: "gamma", Φ: "fi", θ: "teta", μ: "mu", Ω: "omega",
};
type Style = "garis" | "lengkung" | "titik" | "campur";
const STYLES: Style[] = ["garis", "lengkung", "titik", "campur"];

// Titik grid 0-8 (baris demi baris) dan semua ruas antar titik bertetangga (20 ruas).
const PT = Array.from({ length: 9 }, (_, i) => [22 + 28 * (i % 3), 22 + 28 * Math.floor(i / 3)]);
const SEGS: [number, number][] = [];
for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) {
  const dx = Math.abs((a % 3) - (b % 3)), dy = Math.abs(Math.floor(a / 3) - Math.floor(b / 3));
  if (dx <= 1 && dy <= 1) SEGS.push([a, b]);
}

// Elemen glyph: "s3" = ruas lurus SEGS[3], "c3"/"C3" = ruas melengkung ke kiri/kanan, "d4" = titik bulat.
function elementPool(style: Style): string[] {
  const straight = SEGS.map((_, i) => `s${i}`);
  const curved = SEGS.flatMap((_, i) => [`c${i}`, `C${i}`]);
  const dots = PT.map((_, i) => `d${i}`);
  if (style === "garis") return straight;
  if (style === "lengkung") return curved;
  if (style === "titik") return [...straight, ...dots];
  return [...straight, ...curved];
}

function drawElement(el: string): string {
  const i = Number(el.slice(1));
  if (el[0] === "d") return `<circle cx="${PT[i][0]}" cy="${PT[i][1]}" r="6" fill="#000"/>`;
  const [[x1, y1], [x2, y2]] = [PT[SEGS[i][0]], PT[SEGS[i][1]]];
  if (el[0] === "s") return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const side = el[0] === "c" ? 1 : -1;
  const cx = (x1 + x2) / 2 - (y2 - y1) * 0.45 * side, cy = (y1 + y2) / 2 + (x2 - x1) * 0.45 * side;
  return `<path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" fill="none"/>`;
}

// Glyph digeser ke tengah kotak berdasarkan titik grid yang dipakai.
function glyphSvg(els: string[]): string {
  const pts = els.flatMap(nodesOf).map((n) => PT[n]);
  const mid = (axis: 0 | 1) => 50 - (Math.min(...pts.map((p) => p[axis])) + Math.max(...pts.map((p) => p[axis]))) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="10" fill="#fff"/>` +
    `<g transform="translate(${mid(0)} ${mid(1)})" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">` +
    `${els.map(drawElement).join("")}</g></svg>\n`;
}

// Glyph dasar = jalan acak 4-5 ruas tersambung (mirip aksara), plus 1 titik untuk gaya "titik".
function baseGlyph(style: Style, rand: () => number): string[] {
  let els: string[];
  do els = walk(style, rand); while (els.length < 4);
  if (style === "titik") els.push(`d${Math.floor(rand() * 9)}`);
  return els;
}

function walk(style: Style, rand: () => number): string[] {
  const pool = elementPool(style).filter((el) => el[0] !== "d");
  const els: string[] = [];
  let at = Math.floor(rand() * 9);
  while (els.length < 4 + Math.floor(rand() * 2)) {
    const options = pool.filter((el) => SEGS[Number(el.slice(1))].includes(at) && !els.some((e) => e.slice(1) === el.slice(1)));
    if (!options.length) break;
    const el = options[Math.floor(rand() * options.length)];
    els.push(el);
    const [a, b] = SEGS[Number(el.slice(1))];
    at = a === at ? b : a;
  }
  return els;
}

const nodesOf = (el: string) => (el[0] === "d" ? [Number(el.slice(1))] : SEGS[Number(el.slice(1))]);

// Semua elemen tersambung lewat titik grid bersama (satu goresan utuh, bukan potongan).
function connected(els: string[]): boolean {
  const reached = new Set(nodesOf(els[0]));
  let grew = true;
  while (grew) {
    grew = false;
    for (const el of els) {
      const nodes = nodesOf(el);
      if (nodes.some((n) => reached.has(n)) && nodes.some((n) => !reached.has(n))) {
        nodes.forEach((n) => reached.add(n));
        grew = true;
      }
    }
  }
  return els.every((el) => nodesOf(el).every((n) => reached.has(n)));
}

// 5 varian dari satu glyph dasar: tiap varian mengganti tepat 1 elemen dengan elemen lain.
function variants(base: string[], style: Style, rand: () => number, taken: Set<string>): string[][] {
  const pool = elementPool(style);
  const out: string[][] = [];
  while (out.length < 5) {
    const next = [...base];
    const slot = Math.floor(rand() * next.length);
    // Pengganti harus menempel ke titik glyph yang tersisa, supaya tidak ada goresan melayang.
    const used = new Set(next.filter((_, i) => i !== slot).flatMap(nodesOf));
    const free = pool.filter((el) => !base.includes(el) && nodesOf(el).some((n) => used.has(n)));
    next[slot] = free[Math.floor(rand() * free.length)];
    const id = [...next].sort().join();
    if (!taken.has(id) && connected(next)) { taken.add(id); out.push(next); }
  }
  return out;
}

export function glyphPool(nomor: number, style: Style, rand: () => number): string[] {
  const dir = new URL(`../public/kecermatan-simbol/p${nomor}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  const taken = new Set<string>();
  const glyphs = [baseGlyph(style, rand), baseGlyph(style, rand)].flatMap((base) => variants(base, style, rand, taken));
  return glyphs.map((els, i) => {
    const name = `g${String(i + 1).padStart(2, "0")}.svg`;
    writeFileSync(new URL(name, dir), glyphSvg(els));
    return `/kecermatan-simbol/p${nomor}/${name}`;
  });
}

export function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rand: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Panjang selang-seling terpanjang (ABAB = 4). Di atas 4 kelihatan berpola.
export function maxAlternation(items: string[]): number {
  let best = 2;
  let run = 2;
  for (let i = 2; i < items.length; i++) {
    run = items[i] === items[i - 2] && items[i] !== items[i - 1] ? run + 1 : 2;
    best = Math.max(best, run);
  }
  return best;
}

export function maxRun(items: string[]): number {
  let best = 1;
  let run = 1;
  for (let i = 1; i < items.length; i++) {
    run = items[i] === items[i - 1] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

export function makeColumn(simbol: Record<Key, string>, rand: () => number) {
  let answers: Key[];
  do answers = shuffle(KEYS.flatMap((k) => Array<Key>(10).fill(k)), rand);
  while (maxRun(answers) > 2 || maxAlternation(answers) > 4);
  let prev = "";
  return answers.map((kunci, i) => {
    let shown: string[];
    do shown = shuffle(KEYS.filter((k) => k !== kunci).map((k) => simbol[k]), rand);
    while (shown.join() === prev);
    prev = shown.join();
    return { nomor: i + 1, shown, kunci };
  });
}

function makeBank(packageIndex: number) {
  const nomor = 301 + packageIndex;
  const rand = mulberry32(nomor);
  const pool = packageIndex === 0 ? GREEK : glyphPool(nomor, STYLES[packageIndex - 1], rand);
  assert.equal(new Set(pool).size, 10, `Paket ${nomor} harus 10 simbol unik`);
  const baseSets = Array.from({ length: 5 }, () => shuffle(pool, rand).slice(0, 5));
  return {
    nomor,
    nama: `Paket Simbol Hilang ${packageIndex + 1}`,
    kategori: "SIMBOL_HILANG",
    total_soal: 500,
    kolom: ROMAN.map((roman, c) => {
      const values = c < 5 ? baseSets[c] : shuffle(baseSets[c - 5], rand);
      const simbol = Object.fromEntries(KEYS.map((k, i) => [k, values[i]])) as Record<Key, string>;
      return { nomor: c + 1, roman, simbol, soal: makeColumn(simbol, rand) };
    }),
  };
}

// Paket 9 (aspek Emoji & Gambar): siluet ikon per kategori, model CAT Bimbel LEO.
// Tiap kolom satu kategori, 5 benda yang jelas beda — melatih kecepatan mengenali,
// bukan membedakan bentuk mirip. Ikon: Phosphor Icons gaya fill (MIT), diunduh
// sekali saat generate lalu disimpan lokal di public/kecermatan-siluet/.
const PHOSPHOR = "https://unpkg.com/@phosphor-icons/core@2.1.1";
const SILUET: string[][] = [
  ["car-profile", "bus", "motorcycle", "truck", "bicycle"],
  ["cat", "dog", "rabbit", "bird", "fish"],
  ["horse", "cow", "butterfly", "bug-beetle", "shrimp"],
  ["airplane", "sailboat", "train", "tractor", "rocket"],
  ["pizza", "hamburger", "ice-cream", "cake", "carrot"],
  ["tree", "cactus", "flower-tulip", "leaf", "tree-palm"],
  ["guitar", "piano-keys", "headphones", "microphone", "bell"],
  ["hammer", "wrench", "screwdriver", "scissors", "axe"],
  ["sun", "moon", "cloud-rain", "snowflake", "lightning"],
  ["t-shirt", "pants", "dress", "sneaker", "baseball-cap"],
];
const NAMA_SILUET: Record<string, string> = {
  "car-profile": "mobil", bus: "bus", motorcycle: "motor", truck: "truk", bicycle: "sepeda",
  cat: "kucing", dog: "anjing", rabbit: "kelinci", bird: "burung", fish: "ikan",
  horse: "kuda", cow: "sapi", butterfly: "kupu-kupu", "bug-beetle": "kumbang", shrimp: "udang",
  airplane: "pesawat", sailboat: "perahu", train: "kereta", tractor: "traktor", rocket: "roket",
  pizza: "pizza", hamburger: "burger", "ice-cream": "es krim", cake: "kue", carrot: "wortel",
  tree: "pohon", cactus: "kaktus", "flower-tulip": "bunga", leaf: "daun", "tree-palm": "kelapa",
  guitar: "gitar", "piano-keys": "piano", headphones: "headset", microphone: "mik", bell: "lonceng",
  hammer: "palu", wrench: "kunci pas", screwdriver: "obeng", scissors: "gunting", axe: "kapak",
  sun: "matahari", moon: "bulan", "cloud-rain": "hujan", snowflake: "salju", lightning: "petir",
  "t-shirt": "kaos", pants: "celana", dress: "gaun", sneaker: "sepatu", "baseball-cap": "topi",
  // Paket 10 (Simulasi 3)
  avocado: "alpukat", cherries: "ceri", orange: "jeruk", pepper: "cabai", grains: "gandum",
  "cooking-pot": "panci", knife: "pisau", jar: "toples", "bowl-steam": "mangkuk", coffee: "cangkir",
  radio: "radio", television: "televisi", camera: "kamera", laptop: "laptop", printer: "printer",
  paperclip: "klip", "push-pin": "pines", pencil: "pensil", ruler: "penggaris", stamp: "stempel",
  "soccer-ball": "sepak bola", basketball: "basket", football: "rugbi", "boxing-glove": "tinju", barbell: "barbel",
  house: "rumah", factory: "pabrik", lighthouse: "mercusuar", tent: "tenda", "castle-turret": "benteng",
  hoodie: "jaket", sock: "kaus kaki", "high-heel": "sepatu hak", "cowboy-hat": "topi koboi", watch: "jam tangan",
  backpack: "ransel", suitcase: "koper", briefcase: "tas kerja", umbrella: "payung", wallet: "dompet",
  shovel: "sekop", ladder: "tangga", broom: "sapu", "paint-roller": "rol cat", flashlight: "senter",
  rainbow: "pelangi", tornado: "tornado", planet: "planet", star: "bintang", drop: "tetes air",
};
// Paket 10 (Simulasi Penuh Paket 3): kategori & ikon baru, tidak ada yang dipakai ulang dari paket 9 (latihan).
const SILUET_P10: string[][] = [
  ["avocado", "cherries", "orange", "pepper", "grains"],
  ["cooking-pot", "knife", "jar", "bowl-steam", "coffee"],
  ["radio", "television", "camera", "laptop", "printer"],
  ["paperclip", "push-pin", "pencil", "ruler", "stamp"],
  ["soccer-ball", "basketball", "football", "boxing-glove", "barbell"],
  ["house", "factory", "lighthouse", "tent", "castle-turret"],
  ["hoodie", "sock", "high-heel", "cowboy-hat", "watch"],
  ["backpack", "suitcase", "briefcase", "umbrella", "wallet"],
  ["shovel", "ladder", "broom", "paint-roller", "flashlight"],
  ["rainbow", "tornado", "planet", "star", "drop"],
];

// Unduh ikon Phosphor (fill) ke public/kecermatan-siluet/ bila belum ada.
export async function downloadSiluet(names: string[]) {
  const dir = new URL("../public/kecermatan-siluet/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  // Versi Phosphor dipatok, jadi file yang sudah ada di disk tidak diunduh ulang.
  if (!existsSync(new URL("LICENSE-phosphor.txt", dir))) {
    const license = await fetch(`${PHOSPHOR}/LICENSE`);
    assert.ok(license.ok, "Gagal unduh LICENSE Phosphor");
    writeFileSync(new URL("LICENSE-phosphor.txt", dir), await license.text());
  }
  for (const name of names) {
    if (existsSync(new URL(`${name}.svg`, dir))) continue;
    const res = await fetch(`${PHOSPHOR}/assets/fill/${name}-fill.svg`);
    assert.ok(res.ok, `Ikon Phosphor tidak ada: ${name}`);
    const inner = (await res.text()).replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, "");
    // Latar putih + padding, sama seperti SVG Spasial supaya terbaca di mode gelap.
    writeFileSync(new URL(`${name}.svg`, dir),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="26" fill="#fff"/>` +
      `<g transform="translate(24 24) scale(0.8125)" fill="#000">${inner}</g></svg>\n`);
  }
}
async function siluetBank(nomor: number, nama: string, sets: string[][]) {
  const rand = mulberry32(nomor);
  for (const name of sets.flat()) pelafalan[`/kecermatan-siluet/${name}.svg`] = NAMA_SILUET[name];
  await downloadSiluet(sets.flat());
  return {
    nomor,
    nama,
    kategori: "SILUET",
    total_soal: 500,
    kolom: ROMAN.map((roman, c) => {
      const values = shuffle(sets[c], rand).map((name) => `/kecermatan-siluet/${name}.svg`);
      const simbol = Object.fromEntries(KEYS.map((k, i) => [k, values[i]])) as Record<Key, string>;
      return { nomor: c + 1, roman, simbol, soal: makeColumn(simbol, rand) };
    }),
  };
}

async function main() {
  // Anti-bocor: ikon simulasi (p10) tidak boleh sudah dikenal dari latihan (p9).
  assert.ok(!SILUET_P10.flat().some((n) => SILUET.flat().includes(n)), "Ikon paket 10 dipakai ulang dari paket 9");
  for (const bank of [...[0, 1, 2, 3, 4].map(makeBank), await siluetBank(9, "Paket Siluet Gambar", SILUET),
    await siluetBank(10, "Simulasi 3 — Siluet Gambar", SILUET_P10)]) {
    let verified = 0;
    for (const column of bank.kolom) {
      assert.equal(new Set(Object.values(column.simbol)).size, 5);
      // Aksara karangan (302-305) sengaja tanpa label: deskripsi goresan terlalu panjang & sering kembar.
      const words = Object.values(column.simbol).map((sym) => pelafalan[sym]);
      if (!String(column.simbol.A).startsWith("/kecermatan-simbol/")) assert.ok(words.every(Boolean) && new Set(words).size === 5, `Paket ${bank.nomor} kolom ${column.nomor}: label kosong/kembar ${words}`);
      const counts = Object.fromEntries(KEYS.map((k) => [k, 0])) as Record<Key, number>;
      column.soal.forEach((item, i) => {
        assert.equal(new Set(item.shown).size, 4);
        assert.deepEqual(KEYS.filter((k) => !item.shown.includes(column.simbol[k])), [item.kunci]);
        if (i) assert.notEqual(item.shown.join(), column.soal[i - 1].shown.join());
        counts[item.kunci]++;
        verified++;
      });
      assert.deepEqual(Object.values(counts), [10, 10, 10, 10, 10]);
      assert.ok(maxRun(column.soal.map((s) => s.kunci)) <= 2);
      assert.ok(maxAlternation(column.soal.map((s) => s.kunci)) <= 4);
    }
    assert.equal(verified, bank.total_soal);
    const output = new URL(`../prisma/data/bank_soal_p${bank.nomor}.json`, import.meta.url);
    writeFileSync(output, `${JSON.stringify(bank, null, 2)}\n`);
    console.log(`Generated ${verified} soal valid: ${output.pathname}`);
  }
  const labelFile = new URL("../data/kecermatan-pelafalan.json", import.meta.url);
  const all = existsSync(labelFile) ? JSON.parse(readFileSync(labelFile, "utf8")) : {};
  Object.assign(all, pelafalan);
  writeFileSync(labelFile, `${JSON.stringify(Object.fromEntries(Object.entries(all).sort()), null, 2)}\n`);
}

// Jalan sebagai skrip saja; diimpor (generate-kecermatan-simulasi.ts) tidak menulis apa pun.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
