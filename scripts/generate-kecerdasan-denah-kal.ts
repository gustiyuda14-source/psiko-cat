import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { makeMap2, renderMap2, clearOfCompass, W, H, TOP, M, type Map2 } from "./denah-k17-bw";
import { arahBangunan, arahArah, rute2, rotArah, ring2, setRing, INSTRUKSI, type Item } from "./denah-k17-soal-bw";
import { reseed, shuffle, WALKERS, f1, C_OK, C_NO, C_REF, type Peta } from "./denah-k17-peta";
import { DENAH20_ROWS } from "./generate-kecerdasan-denah-20";

// Blok Denah & Arah Mata Angin (nomor 38-42) untuk kalibrasi Logis/Spasial 2026-10-12:
// tiap paket = peta A Utara di atas (38-39 ARAH, 40-41 RUTE) + peta B kompas diputar (42 ROTASI).
// Mesin dan aturan kunci sama dengan K17 (scripts/denah-k17-*.ts), peta dan seed baru, jadi
// tidak ada peta/stem drill yang muncul di paket. Tidak ada soal tier 1 (pedoman: 0% mudah).
//   npx tsx scripts/generate-kecerdasan-denah-kal.ts
// Output: prisma/data/kecerdasan_denah_kal.json ({ [package_number]: Row[] }) + output/denah-kal-preview.html

const root = path.join(__dirname, "..");
const PKGS = [13, 14, 2, 3, 15, 16, 4, 5, 19, 6]; // pkg 6 di akhir: `seen` menumpuk, paket lama tetap
// Paket yang membawa gambar pembahasan (pembahasan_svg) + pembahasan 2 paragraf. 13 tetap seperti semula.
// Pkg 2/3/14 sudah live: soalnya (options_payload, scoring_rule) wajib identik byte, hanya pembahasan yang di-upgrade.
const PB = new Set([2, 3, 14, 15, 16, 4, 5, 19, 20, 6]);
// Paket baru (bebas dibentuk ulang): wajib 2 sedang / 3 HOTS.
const NEW = new Set([15, 16, 4, 5, 19, 6]);
// A-7 (tanpa unsur kepolisian): peta yang memuat Kantor Polisi dilewati. Hanya paket baru; paket lama tidak dibentuk ulang.
const A7 = new Set([6]);
const polisi = (pkg: number, bw: Map2) => A7.has(pkg) && bw.objs.some((o) => o.kind === "polisi");
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
  pembahasan_svg?: string;
};

/** Label "Lapangan" duduk di garis tengah lapangan: beri halo putih supaya tidak tercoret.
 *  Hanya untuk paket baru + pembahasan_svg; svg_content paket live (14) wajib identik byte. */
const haloLapangan = (svg: string) => svg.replace(/(<text [^>]*)>Lapangan</g, '$1 stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round">Lapangan<');

/** Peta inline: id clipPath berprefiks per soal, ukuran ikut lebar layar (maks 448px). */
function inlineMap(bw: Map2, n: number, rot: number, prefix: string, pkg: number) {
  const svg = (NEW.has(pkg) ? haloLapangan : (x: string) => x)(renderMap2(bw, n, undefined, rot))
    .replace(' width="448" height="600"', ' style="width:100%;max-width:448px;height:auto"')
    .replaceAll('id="mapclip"', `id="${prefix}mapclip"`).replaceAll("url(#mapclip)", `url(#${prefix}mapclip)`);
  assert.ok(!svg.includes('"mapclip"') && !svg.includes("#mapclip)"), "id clipPath belum berprefiks");
  return svg;
}

/** Gambar pembahasan tanpa atribut id (dirender bersama butir lain): clipPath diganti tutup putih di luar bingkai,
 *  marker panah diganti segitiga biasa dengan ukuran yang sama (markerWidth 4 × stroke-width, refX 7/10). */
function pembahasanSvg(bw: Map2, n: number, rot: number, it: Item) {
  const MKC: Record<string, string> = { ok: C_OK, no: C_NO, ref: C_REF };
  let svg = haloLapangan(renderMap2(bw, n, { cap: it.cap as string[], over: it.over as string, defs: "" }, rot))
    .replace(' width="448" height="600"', ' style="width:100%;max-width:448px;height:auto"')
    .replace("<defs></defs>", "")
    .replace(/<defs><clipPath id="mapclip">.*?<\/clipPath><\/defs><g clip-path="url\(#mapclip\)">(.*?)<\/g>/, (_, roads: string) =>
      `<g>${roads}</g>` + [[0, 0, W, TOP], [0, H - M, W, M], [0, 0, M, H], [W - M, 0, M, H]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`).join(""))
    .replace(/<(line|polyline)\b([^>]*?) marker-end="url\(#(\w+)\)"([^>]*)\/>/g, (_, tg: string, a: string, mk: string, b: string) => {
      const at = a + b, num = (k: string) => +new RegExp(`\\b${k}="([-\\d.]+)"`).exec(at)![1];
      const pts = tg === "line" ? [[num("x1"), num("y1")], [num("x2"), num("y2")]] : /points="([^"]+)"/.exec(at)![1].split(" ").map((q) => q.split(",").map(Number));
      const [[px, py], [qx, qy]] = pts.slice(-2), L = Math.hypot(qx - px, qy - py), ux = (qx - px) / L, uy = (qy - py) / L, u = 0.4 * num("stroke-width");
      const tip = [qx + ux * 3 * u, qy + uy * 3 * u], bx = qx - ux * 7 * u, by = qy - uy * 7 * u;
      return `<${tg}${a}${b}/><path d="M${f1(tip[0])} ${f1(tip[1])}L${f1(bx - uy * 5 * u)} ${f1(by + ux * 5 * u)}L${f1(bx + uy * 5 * u)} ${f1(by - ux * 5 * u)}z" fill="${MKC[mk]}"/>`;
    });
  // Tag yang keluar bingkai: label belokan yang lewat tepi kanan dipindah ke kiri titik belok, tag lain digeser masuk.
  svg = svg.replace(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="20" fill="#fff" rx="10"([^>]*)\/><text x="([-\d.]+)"([^>]*)>([^<]*)<\/text>/g, (all, x, y, w, ra, tx, ta, t: string) => {
    const x0 = +x, ww = +w, over = Math.max(0, x0 + ww - (W - M - 2)) - Math.max(0, M + 2 - x0);
    if (!over) return all;
    const dx = t.includes("→") && over > 0 ? -92 : -over;
    return `<rect x="${f1(x0 + dx)}" y="${y}" width="${w}" height="20" fill="#fff" rx="10"${ra}/><text x="${f1(+tx + dx)}"${ta}>${t}</text>`;
  });
  // Dua tag bertumpuk (objek berdekatan, mis. pkg 14 #42): pisahkan vertikal, masing-masing setengah jarak.
  const PILL = /<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="20" fill="#fff" rx="10"([^>]*)\/><text x="([-\d.]+)" y="([-\d.]+)"([^>]*)>([^<]*)<\/text>/g;
  const pills = [...svg.matchAll(PILL)].map((m) => ({ x: +m[1], y: +m[2], w: +m[3], dy: 0 }));
  for (let i = 0; i < pills.length; i++) for (let j = 0; j < i; j++) {
    const a = pills[j], b = pills[i], ov = 22 - Math.abs(a.y + a.dy - (b.y + b.dy));
    if (ov > 0 && a.x < b.x + b.w && b.x < a.x + a.w) { const s = b.y + b.dy >= a.y + a.dy ? 1 : -1; a.dy -= (s * ov) / 2; b.dy += (s * ov) / 2; }
  }
  let pi = 0;
  svg = svg.replace(PILL, (_, x, y, w, ra, tx, ty, ta, t) => {
    const d = pills[pi++].dy;
    return `<rect x="${x}" y="${f1(+y + d)}" width="${w}" height="20" fill="#fff" rx="10"${ra}/><text x="${tx}" y="${f1(+ty + d)}"${ta}>${t}</text>`;
  });
  assert.ok(!/\bid=|url\(#|<(?:script|image|style)\b|href=/.test(svg), "pembahasan_svg masih memakai id/url/href");
  return svg;
}

/** Pembahasan mesin K17 (langkah<br>kenapa salah + jawaban<br>gambaran nyata) → 2 paragraf: cara baca, eliminasi + kunci. */
const duaParagraf = (t: string) => {
  const [langkah, salah] = t.split("<br>");
  return `${langkah.split("\n").join(" ")}\n\n${salah.replace(/^Kenapa yang lain salah:\n/, "").split("\n").join(" ")}`;
};

const toRow = (seq: number, it: Item, svg: string, pb?: string): Row => {
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
    sub_type: it.sub_type as string, tingkat: tier, pembahasan: pb ? duaParagraf(it.pembahasan as string) : (it.pembahasan as string),
    ...(pb ? { pembahasan_svg: pb } : {}),
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
    if (polisi(pkg, bw)) continue;
    const walkers = shuffle(WALKERS);
    // pkg 19: arahArah maksimal tier 2, jadi 39 memakai arahBangunan kedua (HOTS bila ≥ 2 pengecoh dekat arah kunci).
    const set = [arahBangunan(p, pos[0], used), (pkg === 19 ? arahBangunan : arahArah)(p, pos[1], used), rute2(bw, pos[2], 2, walkers[0]), rute2(bw, pos[3], 3, walkers[1])];
    if (!fresh(set) || set.some((s) => (s!.tier as number) < 2)) continue;
    const arahDari = (s: Item) => /arah (.+) dari (.+) adalah/.exec(s.stem as string)!.slice(1);
    if (pkg === 19 && arahDari(set[0]!).some((v, i) => v === arahDari(set[1]!)[i])) continue; // 38/39: asal dan arah harus beda
    // Paket baru: ROTASI 180° = HOTS (peta A 2 HOTS), 90/270° = sedang (peta A 3 HOTS) → total 2 sedang / 3 HOTS.
    // pkg 19 (keputusan pemilik 2026-10-13: 20 sedang / 80 HOTS): peta A 4 HOTS + ROTASI 180° → 5 HOTS.
    if (pkg === 19 ? set.some((s) => s!.tier !== 3) : NEW.has(pkg) && set.filter((s) => s!.tier === 3).length !== (1 + (pi % 3) === 2 ? 2 : 3)) continue;
    set.forEach((s, i) => rows.push(toRow(38 + i, s!, inlineMap(bw, 1, 0, `dk${pkg}q${38 + i}-`, pkg), PB.has(pkg) ? pembahasanSvg(bw, 1, 0, s!) : undefined)));
    break;
  }
  // Peta B: kompas diputar 90/180/270° bergilir antarpaket.
  const k = pkg === 19 ? 2 : 1 + (pi % 3);
  for (let attempt = 0; ; attempt++) {
    reseed(43000 + pkg * 977 + attempt);
    const bw = makeMap2();
    if (!clearOfCompass(bw) || polisi(pkg, bw)) continue;
    const s = rotArah(bw, k, pos[4], new Set<string>(), "b");
    if (!fresh([s])) continue;
    rows.push(toRow(42, s!, inlineMap(bw, 2, k * 90, `dk${pkg}q42-`, pkg), PB.has(pkg) ? pembahasanSvg(bw, 2, k * 90, s!) : undefined));
    break;
  }
  for (const r of rows) seen.add(norm(r.options_payload.question_text));
  out[pkg] = rows;
});

// pkg 20 (Simulasi 5): dibuat generate-kecerdasan-denah-20.ts (peta A 38-41, peta B 42), semua HOTS.
out[20] = DENAH20_ROWS;
for (const [pkg, rows] of Object.entries(out)) {
  assert.deepEqual(rows.map((r) => r.sequence_number), [38, 39, 40, 41, 42], `pkg ${pkg}: nomor`);
  assert.equal(new Set(rows.map((r) => r.scoring_rule.correct_key)).size, 5, `pkg ${pkg}: kunci harus tersebar A-E`);
  if (NEW.has(+pkg) || +pkg === 20) assert.equal(rows.filter((r) => r.tingkat === 3).length, +pkg === 19 || +pkg === 20 ? 5 : 3, `pkg ${pkg}: tingkat denah (19, 20: 5 HOTS, lain: 2 sedang / 3 HOTS)`);
  if (PB.has(+pkg)) {
    for (const r of rows) assert.ok(r.pembahasan_svg && r.pembahasan.split("\n\n").length === 2 && !r.pembahasan.includes("<br>"), `pkg ${pkg} #${r.sequence_number}: pembahasan 2 paragraf + gambar`);
  } else assert.ok(rows.every((r) => !r.pembahasan_svg), `pkg ${pkg}: paket lama tidak boleh berubah`);
  for (const r of rows) {
    const texts = r.options_payload.choices.map((c) => c.text);
    assert.equal(new Set(texts).size, 5, `pkg ${pkg} #${r.sequence_number}: opsi kembar`);
    assert.ok(!/<(?:script|image|style)\b|href="(?!#)/.test(r.options_payload.svg_content), `pkg ${pkg} #${r.sequence_number}: SVG tidak aman`);
    if (A7.has(+pkg)) assert.ok(!/polisi|polri|patroli/i.test(JSON.stringify(r)), `pkg ${pkg} #${r.sequence_number}: A-7`);
    assert.ok(r.pembahasan.includes(+pkg === 20 ? `Jawaban: ${r.scoring_rule.correct_key.toLowerCase()}.` : `Jawaban: ${texts[KEYS.indexOf(r.scoring_rule.correct_key as (typeof KEYS)[number])]}.`), `pkg ${pkg} #${r.sequence_number}: pembahasan ≠ kunci`); // pkg 20 menyebut huruf opsi
  }
}

fs.writeFileSync(path.join(root, "prisma/data/kecerdasan_denah_kal.json"), `${JSON.stringify(out, null, 2)}\n`);
fs.mkdirSync(path.join(root, "output"), { recursive: true });
fs.writeFileSync(path.join(root, "output/denah-kal-preview.html"),
  `<!doctype html><html lang="id"><meta charset="utf-8"><title>Preview Denah Kalibrasi</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;max-width:900px}section{border:1px solid #aaa;margin:16px 0;padding:12px}p{font-size:13px;line-height:1.5;white-space:pre-line}</style><body>` +
  Object.entries(out).flatMap(([pkg, rows]) => rows.map((r) => `<section><h3>pkg ${pkg} · soal ${r.sequence_number} · ${r.sub_type} · tier ${r.tingkat} · kunci ${r.scoring_rule.correct_key}</h3><p><b>${r.options_payload.question_text}</b></p>${r.options_payload.svg_content}<p>${r.options_payload.choices.map((c) => `${c.key}. ${c.text}`).join(" · ")}</p><p>${r.pembahasan.replaceAll("<br>", "\n")}</p>${r.pembahasan_svg ?? ""}</section>`)).join("") +
  `</body></html>`);
const tiers = Object.values(out).flat().map((r) => r.tingkat);
console.log(`OK: ${PKGS.length} paket × 5 soal denah · tier sedang ${tiers.filter((t) => t === 2).length} / HOTS ${tiers.filter((t) => t === 3).length}`);
for (const [pkg, rows] of Object.entries(out)) console.log(`  pkg ${pkg}: ${rows.map((r) => `${r.sequence_number}${r.sub_type.replace("FIG-DENAH-", "")[0]}${r.tingkat}${r.scoring_rule.correct_key}`).join(" ")}`);
