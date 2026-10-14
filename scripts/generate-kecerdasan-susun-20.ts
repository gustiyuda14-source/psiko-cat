import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { jembatanGantung, kapalKontainer } from "./susun-benda-20";
import { answerFor, enDash, cutLayout, cutProfile, cutPuzzleSvg, cutPembahasanSvg, cutArea } from "./susun-lib";
import { redRing, redText } from "./figural-lib";

// Susun potongan gambar pkg 20 (Simulasi 5): 33 kapal kontainer, 34 jembatan gantung (grid 2×3, tingkat 3).
// Diimpor generate-kecerdasan-susun-kal.ts (SUSUN20_ROWS) yang menulis prisma/data; dijalankan langsung hanya menulis pratinjau ke direktori keluaran.
//   npx tsx scripts/generate-kecerdasan-susun-20.ts [direktori-keluaran]
// Aturan berlapis (lebih berat dari pkg 19): (1) arah+baris, (2) kembar cermin, (3) garis menerus, (4) lekuk tepi unik.
// Pengecoh bukan hanya satu tukar pasangan seperti pkg 19: tertukar, tercermin (baris dibalik), terputar (tiga potongan
// bergeser), salah baris. Opsi bukan gambar, jadi "terputar/tercermin" dinyatakan pada SUSUNAN potongan (urutan baca).
const KEYS = ["A", "B", "C", "D", "E"] as const;
type Key = (typeof KEYS)[number];
const INSTRUKSI = "Urutkanlah potongan gambar berikut menjadi gambar yang utuh. Baca jawaban dari baris atas, kiri ke kanan, lalu baris bawah.";

type L = (c: number) => number;
/** Teks khusus tiap benda: penanda 6 potongan, ciri tiap sambungan, alasan tiap nama kesalahan, paragraf aturan, lingkaran kembar. */
type Meta = { penanda: string[]; ciri: Record<string, string>; why: (l: L) => Record<Name, string>; p1: (l: L) => string; twins: [number, number, number][]; twinNote: string };
type Puzzle = { pkg: number; seq: number; objek: string; order: number[]; key: Key; ans: number[]; scene: string; meta: Meta; specs?: { name: Name; make: (a: number[]) => number[] }[] };
const META_KAPAL: Meta = {
  penanda: ["menara anjungan dengan cerobong dan antena", "derek pertama yang miring ke kanan", "derek kedua yang miring ke kiri dan bendera haluan",
  "buritan dengan tanda sarat menjorok ke kanan", "lambung tengah dengan tangga dan lingkaran garis muat", "haluan dengan lubang jangkar dan tanda sarat menjorok ke kiri"],
  ciri: {
  "1-2": "kontainer putih berpintu di kolom kedua dan ketiga serta tumpukan yang bertangga naik",
  "2-3": "ujung lengan derek kedua dengan kabelnya dan kontainer berpintu di bawahnya",
  "4-5": "kontainer berpenguat diagonal, kontainer putih berpintu, garis putih lambung dan satu garis papan",
  "5-6": "kontainer putih berpintu di tingkat terbawah, garis putih lambung dan garis papan",
  "1-4": "jendela menara baris kedua dan kontainer putih berpintu di tumpukan paling kiri",
  "2-4": "kontainer abu-abu tingkat tengah dan penguat diagonal di kolom ketiga",
  "2-5": "tiang derek pertama, kontainer abu-abu dan penguat diagonal",
  "3-5": "kontainer putih berpintu dan penguat diagonal di kolom kesembilan",
  "3-6": "tiang derek kedua, kontainer abu-abu dan lambung haluan yang melengkung naik",
},
  why: (l) => ({
    tercermin: `baris atas dibaca terbalik: potongan ${l(1)} (menara anjungan) dan potongan ${l(3)} (haluan dengan derek kedua) bertukar ujung. Dua derek yang miring berlawanan arah dan tumpukan kontainer yang simetris membuat bayangan cermin tampak wajar, padahal menara anjungan jadi di kanan sedangkan buritan baris bawah (potongan ${l(4)}) tetap di kiri`,
    "salah baris": `potongan ${l(2)} (derek pertama, baris atas) dan potongan ${l(5)} (lambung tengah, baris bawah) bertukar baris. Keduanya sama-sama memuat kontainer berpenguat diagonal di sekitar tengah kapal, tetapi lambung dengan garis putih jadi muncul di atas dan derek di bawah`,
    terputar: `ketiga potongan baris bawah bergeser satu tempat: potongan ${l(5)} (lambung tengah) maju ke kiri, potongan ${l(6)} (haluan) maju ke tengah, dan potongan ${l(4)} (buritan) pindah ke ujung kanan. Tanda sarat buritan yang menjorok ke kanan tampak seperti kembaran tanda sarat haluan yang menjorok ke kiri, tetapi lubang jangkar haluan tidak lagi berada di ujung kanan`,
    tertukar: `potongan ${l(4)} (buritan) dan potongan ${l(5)} (lambung tengah) bertukar tempat. Keduanya sama-sama lambung hitam bergaris putih dengan kontainer dua tingkat sehingga tampak pas, tetapi tanda sarat buritan jadi berada di tengah dan tangga serta lingkaran garis muat berpindah ke kiri`,
  }),
  p1: (l) => `Kenali bendanya: kapal kontainer tampak samping, menara anjungan dengan cerobong di kiri (buritan) dan haluan melengkung berbendera di kanan. Ada empat lapis aturan yang berjalan bersamaan. Lapis 1, arah dan baris: baris atas memuat menara anjungan (potongan ${l(1)}), derek pertama yang miring ke kanan (potongan ${l(2)}), dan derek kedua yang miring ke kiri dengan bendera haluan (potongan ${l(3)}); baris bawah memuat buritan dengan tanda sarat (potongan ${l(4)}), lambung tengah dengan tangga dan lingkaran garis muat (potongan ${l(5)}), dan haluan dengan lubang jangkar (potongan ${l(6)}). Lapis 2, kembar cermin: kedua derek, tumpukan kontainer, serta tanda sarat buritan dan haluan saling bercermin, jadi jangan memilih dari kesan umum; carilah penanda yang tidak punya kembar (menara hanya di kiri, bendera hanya di kanan, tangga dan lingkaran hanya di tengah bawah). Lapis 3, garis menerus: garis putih lambung, tepi dek, dan penguat diagonal kontainer harus menyambung pada tinggi yang sama di setiap batas. Lapis 4, lekuk tepi: tiap batas berlekuk unik, sehingga satu potongan hanya cocok dengan satu tetangga di tiap sisi, tanpa celah dan tanpa tumpang-tindih.`,
  twins: [[346, 12, 15], [386, 12, 15], [24, 152, 17], [568, 152, 17]],
  twinNote: "Lingkaran merah: pasangan kembar cermin",
};
const META_JEMBATAN: Meta = {
  penanda: ["bilik gerbang dengan palang, papan penunjuk, dan menara pertama berantena", "kabel utama yang melandai dengan batang penggantung dan dua burung", "menara kedua berbendera, matahari, dan mobil kecil",
    "gerbang lengkung, pilar pertama, dan penanda tinggi air", "kapal dengan truk, bus, dan rangka dek", "pilar kedua, mercusuar, dan bukit abu-abu"],
  ciri: {
    "1-2": "kabel utama yang turun dari menara pertama dan batang penggantung vertikal",
    "2-3": "kabel utama yang naik ke menara kedua, batang penggantung vertikal, dan ujung belakang bus",
    "4-5": "rangka zig-zag dek, tepi dek, dan garis ombak",
    "5-6": "sisi kiri pilar kedua, rangka zig-zag dek, dan garis ombak",
    "1-4": "bilik gerbang dengan palang, tiang papan penunjuk, dan tepi atas dek",
    "2-4": "roda belakang truk dan tepi atas dek",
    "2-5": "truk, roda bus, dan batang penggantung yang turun ke dek",
    "3-5": "roda belakang bus dan tepi atas dek",
    "3-6": "kaki menara kedua, roda mobil kecil, dan tepi atas dek",
  },
  why: (l) => ({
    tercermin: `baris atas dibaca terbalik: potongan ${l(1)} (bilik gerbang dan menara berantena) dan potongan ${l(3)} (menara berbendera dan matahari) bertukar ujung. Kedua menara, kedua separuh kabel, dan kedua pilar saling menyerupai sehingga bayangan cermin tampak wajar, padahal bendera dan matahari jadi di kiri sedangkan gerbang lengkung pada baris bawah (potongan ${l(4)}) tetap di kiri`,
    "salah baris": `potongan ${l(2)} (kabel melandai dan burung, baris atas) dan potongan ${l(5)} (kapal, baris bawah) bertukar baris. Keduanya sama-sama bagian tengah jembatan, tetapi kapal jadi muncul di langit di atas dek dan kabel muncul di bawahnya, di dalam air`,
    terputar: `ketiga potongan baris bawah bergeser satu tempat: potongan ${l(5)} (kapal) maju ke kiri, potongan ${l(6)} (pilar kedua dan mercusuar) maju ke tengah, dan potongan ${l(4)} (gerbang lengkung dan pilar pertama) pindah ke ujung kanan. Kedua pilar tampak kembar sehingga susunan ini terlihat wajar, tetapi gerbang lengkung tidak lagi berada di ujung kiri jembatan`,
    tertukar: `potongan ${l(4)} (gerbang lengkung dan pilar pertama) dan potongan ${l(5)} (kapal) bertukar tempat. Keduanya sama-sama memuat bagian gelap di bawah dek sehingga tampak pas, tetapi gerbang lengkung jadi berada di tengah dan kapal di ujung kiri`,
  }),
  p1: (l) => `Kenali bendanya: jembatan gantung tampak samping dengan dua menara, kabel utama yang melandai, dek berangka zig-zag yang dilalui truk, bus, dan mobil kecil, serta kapal, gerbang lengkung, dua pilar, dan mercusuar di bawah dek. Ada empat lapis aturan yang berjalan bersamaan. Lapis 1, arah dan baris: baris atas memuat bilik gerbang dengan menara pertama berantena (potongan ${l(1)}), kabel melandai dengan burung (potongan ${l(2)}), dan menara kedua berbendera dengan matahari (potongan ${l(3)}); baris bawah memuat gerbang lengkung dengan pilar pertama (potongan ${l(4)}), kapal dengan rangka dek (potongan ${l(5)}), dan pilar kedua dengan mercusuar (potongan ${l(6)}). Lapis 2, kembar cermin: kedua menara, kedua pilar, dan kedua separuh kabel saling menyerupai, jadi jangan memilih dari kesan umum; carilah penanda yang tidak punya kembar (antena hanya di menara kiri, bendera hanya di menara kanan, gerbang lengkung hanya di kiri bawah, mercusuar hanya di kanan bawah). Lapis 3, garis menerus: rangka zig-zag dek, tepi atas dek, kabel utama, dan batang penggantung harus menyambung pada tinggi yang sama di setiap batas. Lapis 4, lekuk tepi: tiap batas berlekuk unik, sehingga satu potongan hanya cocok dengan satu tetangga di tiap sisi, tanpa celah dan tanpa tumpang-tindih.`,
  twins: [[139, 24, 22], [460, 24, 22], [139, 154, 28], [460, 154, 28]],
  twinNote: "Lingkaran merah: menara dan pilar yang berkembar",
};
const PUZZLES: Puzzle[] = [
  // order[label-1] = sel sumber potongan berlabel itu; jawaban benar = answerFor(order) = ans (diasersi)
  { pkg: 20, seq: 33, objek: "kapal kontainer", order: [2, 6, 5, 1, 3, 4], key: "D", ans: [4, 1, 5, 6, 3, 2], scene: kapalKontainer, meta: META_KAPAL },
  { pkg: 20, seq: 34, objek: "jembatan gantung", order: [5, 3, 6, 1, 4, 2], key: "C", ans: [4, 6, 2, 5, 1, 3], scene: jembatanGantung, meta: META_JEMBATAN },
];

const layout = cutLayout(6);
const seams = layout.edges.filter((e) => e.owners.length === 2).map((e) => ({ a: e.owners[0], b: e.owners[1], points: e.points }))
  .sort((x, y) => Number(Math.floor((y.a - 1) / 3) === Math.floor((y.b - 1) / 3)) - Number(Math.floor((x.a - 1) / 3) === Math.floor((x.b - 1) / 3)) || x.a - y.a || x.b - y.b);
const horizontal = (s: { a: number; b: number }) => Math.floor((s.a - 1) / 3) === Math.floor((s.b - 1) / 3);

/** Sel sumber yang ditempati potongan berlabel seq[c-1] pada sel gambar utuh c. */
const sigma = (p: Puzzle, seq: number[], c: number) => p.order[seq[c - 1] - 1];
/** Sambungan (a,b) cocok bila potongan di a dan b adalah pemilik tepi berprofil sama dengan tepi itu, dengan peran kiri/atas yang sama. */
const seamFits = (p: Puzzle, seq: number[], s: (typeof seams)[number]) => {
  const sa = sigma(p, seq, s.a), sb = sigma(p, seq, s.b);
  return layout.edges.some((e) => e.owners.length === 2 && e.owners[0] === sa && e.owners[1] === sb && cutProfile(e.points) === cutProfile(s.points));
};

const centroid = (pts: [number, number][]) => {
  let a = 0, cx = 0, cy = 0;
  pts.forEach(([x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length], k = x * ny - nx * y; a += k; cx += (x + nx) * k; cy += (y + ny) * k; });
  return [cx / (3 * a), cy / (3 * a)];
};
const inside = (x: number, y: number, pts: [number, number][]) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** Rakit tiap potongan di sel tujuannya (titik berat ke titik berat), lalu hitung piksel celah, tumpang-tindih, dan yang keluar bingkai. */
function assembly(p: Puzzle, seq: number[]) {
  const X0 = -300, Y0 = -100, Wd = 1200, Ht = 490, cov = new Uint8Array(Wd * Ht), cents = layout.polygons.map(centroid);
  for (let c = 1; c <= 6; c++) {
    const s = sigma(p, seq, c) - 1, dx = cents[c - 1][0] - cents[s][0], dy = cents[c - 1][1] - cents[s][1];
    const poly = layout.polygons[s].map(([x, y]) => [x + dx, y + dy] as [number, number]);
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    for (let py = Math.floor(Math.min(...ys)); py <= Math.ceil(Math.max(...ys)); py++) for (let px = Math.floor(Math.min(...xs)); px <= Math.ceil(Math.max(...xs)); px++)
      if (inside(px + 0.5013, py + 0.4987, poly)) cov[(py - Y0) * Wd + (px - X0)]++;
  }
  let gap = 0, over = 0, spill = 0;
  for (let py = Y0; py < Y0 + Ht; py++) for (let px = X0; px < X0 + Wd; px++) {
    const v = cov[(py - Y0) * Wd + (px - X0)];
    if (px >= 0 && px < 600 && py >= 0 && py < 190) { if (v === 0) gap++; else over += v - 1; } else spill += v;
  }
  return { gap, over, spill, bad: gap + over + spill };
}

type Name = "tertukar" | "tercermin" | "terputar" | "salah baris";
const swap = (a: number[], i: number, j: number) => { const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; };
const SPECS: { name: Name; make: (a: number[]) => number[] }[] = [
  { name: "tercermin", make: (a) => swap(a, 0, 2) },
  { name: "salah baris", make: (a) => swap(a, 1, 4) },
  { name: "terputar", make: (a) => [a[0], a[1], a[2], a[4], a[5], a[3]] },
  { name: "tertukar", make: (a) => swap(a, 3, 4) },
];
/** Nama kesalahan diturunkan dari susunan itu sendiri, bukan dari label spesifikasi. */
function classify(ans: number[], seq: number[]): Name {
  const d = ans.map((_, i) => i).filter((i) => seq[i] !== ans[i]), row = (i: number) => (i < 3 ? 0 : 1);
  if (d.length === 3 && d.every((i) => row(i) === row(d[0]))) return "terputar";
  assert.equal(d.length, 2, "Pengecoh harus dua posisi atau satu putaran tiga");
  if (row(d[0]) !== row(d[1])) return "salah baris";
  return d[1] - d[0] === 1 ? "tertukar" : "tercermin";
}

function distractorText(p: Puzzle, ans: number[], seq: number[], letter: Key, name: Name) {
  const l = (c: number) => ans[c - 1], fail = seams.filter((s) => !seamFits(p, seq, s)), first = fail[0];
  const why = p.meta.why(l);
  return `Opsi ${letter}: ${name}. ${why[name][0].toUpperCase()}${why[name].slice(1)}. Sambungan ${seq[first.a - 1]}–${seq[first.b - 1]} (${horizontal(first) ? "kiri–kanan" : "atas–bawah"}) gagal: di tempat itu seharusnya ${p.meta.ciri[`${first.a}-${first.b}`]} menerus, tetapi kedua potongan tidak membawanya dan lekuk tepinya tidak berpasangan; ${fail.length} dari ${seams.length} sambungan putus.`;
}

function assertLayout(p: Puzzle) {
  const widths = layout.polygons.map((pts) => Math.max(...pts.map((q) => q[0])) - Math.min(...pts.map((q) => q[0])));
  assert.ok(Math.abs(layout.polygons.reduce((s, pts) => s + cutArea(pts), 0) - 600 * 190) < 0.001, "Luas tidak menutup gambar");
  const profiles = seams.map((s) => cutProfile(s.points));
  assert.equal(seams.length, 9);
  assert.equal(new Set(profiles).size, profiles.length, "Profil batas dalam harus unik");
  assert.deepEqual(Object.keys(p.meta.ciri).sort(), seams.map((s) => `${s.a}-${s.b}`).sort(), "Setiap sambungan perlu ciri");
  const reached = new Set([1]);
  for (let i = 0; i < 6; i++) for (const s of seams) { if (reached.has(s.a)) reached.add(s.b); if (reached.has(s.b)) reached.add(s.a); }
  assert.equal(reached.size, 6, "Graf sambungan harus terhubung");
  return widths;
}

function build(p: Puzzle) {
  const ans = answerFor(p.order), prefix = `kal${p.pkg}q${p.seq}-`;
  assert.deepEqual([...p.order].sort(), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(ans, p.ans);
  assert.ok(ans.every((v, i) => v !== i + 1) && p.order.every((v, i) => v !== i + 1), "Tak boleh ada potongan di tempat semula");
  const ds = (p.specs ?? SPECS).map((s) => ({ name: s.name, seq: s.make(ans) }));
  const options = ds.map((d) => d.seq);
  options.splice(KEYS.indexOf(p.key), 0, ans);
  const texts = options.map(enDash);
  assert.equal(new Set(texts).size, 5, "Opsi harus berbeda");
  for (const o of options) assert.deepEqual([...o].sort(), [1, 2, 3, 4, 5, 6], "Opsi bukan permutasi");
  // Bukti tunggal: tepat satu opsi merakit benda utuh (9/9 sambungan cocok, 0 piksel celah/tumpang-tindih).
  const report = options.map((o) => ({ fit: seams.filter((s) => seamFits(p, o, s)).length, ...assembly(p, o) }));
  const good = report.map((r, i) => (r.fit === seams.length && r.bad === 0 ? i : -1)).filter((i) => i >= 0);
  assert.deepEqual(good, [KEYS.indexOf(p.key)], "Tepat satu opsi harus merakit gambar utuh");
  ds.forEach((d) => {
    const i = options.indexOf(d.seq), r = report[i];
    assert.equal(classify(ans, d.seq), d.name, "Nama kesalahan harus sesuai susunan");
    assert.ok(r.fit <= seams.length - 2, `Pengecoh ${d.name} harus putus di >= 2 sambungan`);
    assert.ok(r.gap > 1000 && r.over > 1000, `Pengecoh ${d.name} harus meninggalkan celah dan tumpang-tindih`);
  });
  assert.equal(new Set(ds.map((d) => d.name)).size, 4, "Empat nama kesalahan berbeda");
  const svg = cutPuzzleSvg(prefix, { pieces: 6, order: p.order, scene: p.scene });
  assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(svg) && !/<svg[^>]*\s(?:width|height)=/.test(svg), "SVG tidak aman/tidak responsif");
  assert.ok([...svg.matchAll(/\sid="([^"]+)"/g)].every((m) => m[1].startsWith(prefix)), "Prefix id");
  assert.ok(!/<text\b|\bPOLI/i.test(p.scene), "Adegan tanpa tulisan");
  const base = cutPembahasanSvg({ pieces: 6, order: p.order, scene: p.scene });
  const twins = p.meta.twins.map(([x, y, r]) => redRing(x, y, r)).join("");
  const pembahasanSvg = base.replace('viewBox="0 0 600 190"', 'viewBox="0 0 600 216"').replace("</svg>", `${twins}${redText(300, 208, p.meta.twinNote, 17)}</svg>`);
  assert.ok(!/\sid=/.test(pembahasanSvg), "SVG pembahasan tanpa id");
  const l = (c: number) => ans[c - 1], letter = (i: number) => KEYS[i];
  const p1 = p.meta.p1(l);
  const wrong = options.map((o, i) => (i === KEYS.indexOf(p.key) ? "" : distractorText(p, ans, o, letter(i), classify(ans, o)))).filter(Boolean).join(" ");
  const p2 = `${wrong} Opsi ${p.key} benar: kesembilan sambungan (empat kiri–kanan dan lima atas–bawah) berpasangan tanpa celah dan tanpa tumpang-tindih. Urutan: ${enDash(ans)}. Jawaban: ${p.key.toLowerCase()}.`;
  const pembahasan = `${p1}\n\n${p2}`;
  assert.equal(pembahasan.split("\n\n").length, 2);
  assert.ok(pembahasan.endsWith(`Jawaban: ${p.key.toLowerCase()}.`));
  assert.ok(!/polisi|polri|polres|patroli|kepolisian/i.test(pembahasan + p.scene), "Tanpa unsur kepolisian (A-7)");
  assert.deepEqual(p.meta.penanda.length, 6);
  const row = {
    sequence_number: p.seq,
    options_payload: { instruksi: INSTRUKSI, question_text: null, sub_text: null, is_multi_select: false, svg_content: svg, choices: KEYS.map((key, i) => ({ key, text: texts[i] })) },
    scoring_rule: { type: "dichotomous", correct_key: p.key }, tingkat: 3, objek: p.objek, pembahasan, pembahasan_svg: pembahasanSvg,
  };
  return { row, report, ds: ds.map((d) => d.name), options };
}

const widths = PUZZLES.map(assertLayout)[0];
/** Baris DB pkg 20 (33-34) untuk generate-kecerdasan-susun-kal.ts; semua asersi build() dijalankan di sini. */
export const SUSUN20 = PUZZLES.map((p) => ({ p, ...build(p) }));
export const SUSUN20_ROWS = SUSUN20.map((x) => x.row);

if (require.main === module) {
  const OUT = process.argv[2] ?? ".";
  const html = (body: string) => `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#111"><style>svg{display:block;width:100%;height:auto}p{font-size:15px;line-height:1.35;margin:6px 8px}.o{display:flex;flex-wrap:wrap;gap:4px 14px;margin:8px;font-size:17px}</style>${body}</body>`;
  fs.mkdirSync(OUT, { recursive: true });
  for (const { p, row, report, ds } of SUSUN20) {
    console.log(`ASSERT pkg ${p.pkg}/${p.seq}: 9/9 profil unik, lebar potongan ${widths.map(Math.round).join("/")}, tepat 1 opsi merakit utuh; pengecoh ${ds.join(", ")}`);
    report.forEach((r, i) => console.log(`  opsi ${KEYS[i]}: ${row.options_payload.choices[i].text} | sambungan cocok ${r.fit}/9 | celah ${r.gap} tumpang-tindih ${r.over} keluar-bingkai ${r.spill} px`));
    fs.writeFileSync(path.join(OUT, `susun-${p.seq}-soal.html`), html(`<p>${INSTRUKSI}</p>${row.options_payload.svg_content}<div class="o">${row.options_payload.choices.map((c) => `<span><b>${c.key}.</b> ${c.text}</span>`).join("")}</div>`));
    fs.writeFileSync(path.join(OUT, `susun-${p.seq}-pembahasan.html`), html(`${row.pembahasan_svg}`));
  }
  fs.writeFileSync(path.join(OUT, "kecerdasan_susun_kal_20_proto.json"), JSON.stringify({ 20: SUSUN20_ROWS }, null, 2));
  console.log(`OK: ${PUZZLES.length} butir pkg 20 ditulis ke ${OUT}`);
}
