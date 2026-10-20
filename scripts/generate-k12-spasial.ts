/**
 * K12 Pola & Matriks Gambar — batch 26 "spasial": 30 butir Menengah/Lanjut (deret 10, matriks 10, analogi 10).
 * Soal, opsi, dan gambar pembahasan dari satu generator (G-6); prototipe disetujui pemilik 2026-10-20 (G-5).
 *
 *   npx tsx scripts/generate-k12-spasial.ts                 tulis bank + gambar (status dipertahankan bila gambar & kunci sama)
 *   npx tsx scripts/generate-k12-spasial.ts --ganda         tandai semua butir batch ini `ganda` (setelah cek buta sepakat)
 *   npx tsx scripts/generate-k12-spasial.ts --blind <dir>   tulis soal tanpa kunci untuk pemeriksa buta
 *   npx tsx scripts/generate-k12-spasial.ts --preview <dir> halaman pratinjau (soal, opsi, pembahasan) untuk cek visual
 */
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { type Draft, optSvg, svg } from "./k12-spasial-core";
import { ANA_ITEMS } from "./k12-spasial-analogi";
import { MTX_ITEMS } from "./k12-spasial-mtx";
import { SERI_ITEMS } from "./k12-spasial-seri";
import { cellS, text } from "./figural-lib";

const ROOT = resolve(__dirname, "..");
const BANK = join(ROOT, "bank/drill/kecerdasan/K12-pola-matriks-gambar.json");
const RILIS = "2026-10-20";
const L5 = ["a", "b", "c", "d", "e"] as const;
const args = process.argv.slice(2), argOf = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);

const drafts: Draft[] = [...SERI_ITEMS, ...MTX_ITEMS, ...ANA_ITEMS];
assert.equal(drafts.length, 30);
const id = (i: number) => `K12-N-${String(i + 1).padStart(3, "0")}`;
const perKey = drafts.reduce<Record<string, number>>((m, d) => ((m[d.key] = (m[d.key] ?? 0) + 1), m), {});
assert.ok(Object.values(perKey).every((n) => n <= 7), `sebaran kunci > 24%: ${JSON.stringify(perKey)}`);
assert.equal(drafts.filter((d) => d.tier === 3).length, 18, "60% Lanjut");
const A7 = /polisi|polri|polres|polsek|polda|bhayangkara|brimob|bintara|taruna|akpol|patroli|tilang|razia|TKP/i;
drafts.forEach((d, i) => assert.ok(!A7.test(d.pembahasan + d.stem + d.instruksi), `${id(i)}: unsur kepolisian (A-7)`));

type Files = Record<string, string>;
const filesOf = (d: Draft, i: number): Files => ({
  [`public/drill/img/${id(i)}.svg`]: d.stemSvg,
  ...Object.fromEntries(d.opts.map((f, j) => [`public/drill/img/${id(i)}-${L5[j]}.svg`, optSvg(f)])),
  [`data/drill-pembahasan/${id(i)}.svg`]: d.pbhSvg,
});

const blind = argOf("--blind");
if (blind) {
  mkdirSync(blind, { recursive: true });
  const list: string[] = [];
  drafts.forEach((d, i) => {
    // satu file per soal: soal di atas, opsi a–e di bawah (tanpa kunci, tanpa pembahasan)
    const stem = d.stemSvg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    const [, w, h] = d.stemSvg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!.map(Number);
    const W = Math.max(w, 600), ox = (W - w) / 2, top = h + 20;
    const opts = d.opts.map((f, j) => cellS(f, W / 2 + (j - 2) * 118, top + 55, 106) + text(W / 2 + (j - 2) * 118, top + 135, L5[j], 22)).join("");
    writeFileSync(join(blind, `${id(i)}.svg`), svg(W, top + 150, `<g transform="translate(${ox} 0)">${stem}</g>${opts}`));
    list.push(`${id(i)} | ${d.instruksi} ${d.stem}`);
  });
  writeFileSync(join(blind, "DAFTAR.txt"), list.join("\n") + "\n");
  console.log(`${drafts.length} soal tanpa kunci -> ${blind}`);
  process.exit(0);
}

const old: Record<string, unknown>[] = JSON.parse(readFileSync(BANK, "utf8"));
const oldById = new Map(old.map((it) => [it.id as string, it]));
const keep = old.filter((it) => !(it.id as string).startsWith("K12-N-"));
const promote = args.includes("--ganda");
const items = drafts.map((d, i) => {
  const files = filesOf(d, i), k = d.key.toLowerCase(), prev = oldById.get(id(i));
  const sameFiles = Object.entries(files).every(([p, c]) => !p.startsWith("public/") || (existsSync(join(ROOT, p)) && readFileSync(join(ROOT, p), "utf8") === c));
  const status = promote ? "ganda" : prev && sameFiles && (prev.kunci as string[]).join() === k && prev.status_kunci === "ganda" ? "ganda" : "tunggal";
  for (const [p, c] of Object.entries(files)) { mkdirSync(join(ROOT, p, ".."), { recursive: true }); writeFileSync(join(ROOT, p), c); }
  return {
    id: id(i), kartu: "K12", sub_type: d.sub_type, tier: d.tier, sumber: "baru", rilis: RILIS,
    instruksi: d.instruksi, stem: d.stem, gambar: `drill/img/${id(i)}.svg`,
    opsi: Object.fromEntries(L5.map((l) => [l, `Gambar ${l.toUpperCase()}`])),
    opsi_gambar: Object.fromEntries(L5.map((l) => [l, `drill/img/${id(i)}-${l}.svg`])),
    kunci: [k], pembahasan: d.pembahasan, gambar_pembahasan: `${id(i)}.svg`, status_kunci: status,
  };
});
writeFileSync(BANK, JSON.stringify([...keep, ...items], null, 2) + "\n");
console.log(`K12: ${keep.length} butir lama + ${items.length} butir batch spasial -> ${BANK}`);
console.log(`kunci ${JSON.stringify(perKey)} · status ${JSON.stringify(items.reduce<Record<string, number>>((m, it) => ((m[it.status_kunci] = (m[it.status_kunci] ?? 0) + 1), m), {}))}`);

const preview = argOf("--preview");
if (preview) {
  mkdirSync(preview, { recursive: true });
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const u = (p: string) => `file://${join(ROOT, p)}`;
  const html = `<!doctype html><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;max-width:880px;margin:16px auto;color:#111}.c{border:1px solid #ccc;border-radius:10px;padding:14px;margin-bottom:22px}.m{font-size:13px;color:#666}.s img{max-width:100%;height:auto}.o{display:flex;gap:10px;margin:10px 0}.o div{text-align:center;font-weight:bold}.o img{width:96px;height:96px}.o .k img{outline:4px solid #1a7f37}.p{background:#f6f6f6;border-radius:8px;padding:10px;font-size:14px;line-height:1.45}.p img{max-width:620px;width:100%;background:#fff}</style>` +
    items.map((it, i) => `${i % 5 === 0 && i ? "<!--PAGE-->" : ""}<div class="c"><div class="m">${it.id} · ${it.sub_type} · tier ${it.tier} · kunci ${it.kunci[0]}</div><p>${esc(it.instruksi)}<br><b>${esc(it.stem)}</b></p><div class="s"><img src="${u("public/" + it.gambar)}"></div><div class="o">${L5.map((l) => `<div class="${l === it.kunci[0] ? "k" : ""}"><img src="${u("public/" + it.opsi_gambar[l])}"><br>${l}</div>`).join("")}</div><div class="p">${it.pembahasan.split("<br>").map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}<img src="${u("data/drill-pembahasan/" + it.gambar_pembahasan)}"></div></div>`).join("");
  const [head, ...rest] = html.split("<!--PAGE-->"), css = head.slice(0, head.indexOf("</style>") + 8);
  [head, ...rest.map((p) => css + p)].forEach((p, i) => writeFileSync(join(preview, `hal-${i + 1}.html`), p));
  console.log(`pratinjau -> ${preview}/hal-1..${rest.length + 1}.html`);
}
