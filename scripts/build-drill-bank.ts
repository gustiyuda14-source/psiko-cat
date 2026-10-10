/**
 * Build bank drill dari file (pola dajiks-cest scripts/build_bank.py) — TIDAK ada seed DB.
 *
 *   npx tsx scripts/build-drill-bank.ts            # validasi + tulis data/drill-bank.json (status resmi|ganda saja)
 *   npx tsx scripts/build-drill-bank.ts --check    # validasi saja
 *   npx tsx scripts/build-drill-bank.ts --draft --preview
 *        # ikut sertakan status hitung|tunggal dan tulis output/drill-preview/<kartu>.html untuk review
 *
 * Sumber: bank/drill/<modul>/<KARTU>.json (array item, skema di bank/drill/BANK_SCHEMA.md).
 * Gagal satu aturan = exit 1 dan tidak ada file yang ditulis.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DRILL_CARDS } from "../lib/drill-cards";

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "bank/drill");
const OUT = join(ROOT, "data/drill-bank.json");
const LETTERS = ["a", "b", "c", "d", "e"] as const;
const SHIPPABLE = new Set(["resmi", "ganda"]);
const STATUSES = new Set(["resmi", "ganda", "hitung", "tunggal"]);

const CARDS = DRILL_CARDS;

type Value = number | string | boolean;
type Item = {
  id: string; kartu: string; sub_type: string; tier: number; sumber: string;
  instruksi?: string; stem: string; rumus?: string; wacana_id?: string | null;
  gambar?: string | null; opsi_gambar?: Record<string, string> | null;
  opsi: Record<string, string>; kunci: string[];
  hitung?: string; nilai_opsi?: Record<string, Value>;
  pembahasan: string; status_kunci: string;
};

const args = new Set(process.argv.slice(2));
const errors: string[] = [];
const fail = (id: string, msg: string) => errors.push(`${id}: ${msg}`);

function sourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return (readdirSync(dir, { recursive: true }) as string[])
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => join(dir, f));
}

// hitung/nilai_opsi ditulis tangan di repo (bukan input pengguna), dievaluasi saat build saja.
function evaluate(expr: string, scope: Record<string, unknown>): Value {
  return new Function(...Object.keys(scope), `"use strict"; return (${expr});`)(...Object.values(scope)) as Value;
}

const same = (a: Value, b: Value) =>
  typeof a === "number" && typeof b === "number"
    ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
    : a === b;

function checkKey(it: Item) {
  if (!it.hitung) return;
  if (!it.nilai_opsi) return fail(it.id, "hitung tanpa nilai_opsi");
  const vals: Record<string, Value> = {};
  for (const k of LETTERS) {
    const raw = it.nilai_opsi[k];
    if (raw === undefined) return fail(it.id, `nilai_opsi.${k} kosong`);
    vals[k] = typeof raw === "string" && raw.startsWith("=") ? evaluate(raw.slice(1), { Math }) : raw;
  }
  for (let i = 0; i < 5; i++)
    for (let j = i + 1; j < 5; j++)
      if (same(vals[LETTERS[i]], vals[LETTERS[j]]) && it.hitung.includes("pilih") === false)
        fail(it.id, `nilai opsi ${LETTERS[i]} dan ${LETTERS[j]} sama`);
  const only = (pred: (v: Value) => boolean) => {
    const hit = LETTERS.filter((k) => pred(vals[k]));
    if (hit.length !== 1) throw new Error(`pilih() cocok ${hit.length} opsi`);
    return vals[hit[0]];
  };
  const nums = () => LETTERS.map((k) => Number(vals[k]));
  let result: Value;
  try {
    result = evaluate(it.hitung, {
      Math,
      pilih: only,
      terbesar: () => Math.max(...nums()),
      terkecil: () => Math.min(...nums()),
    });
  } catch (e) {
    return fail(it.id, `hitung error: ${(e as Error).message}`);
  }
  const match = LETTERS.filter((k) => same(vals[k], result));
  if (match.length !== 1) return fail(it.id, `hasil hitung ${result} cocok dengan ${match.length} opsi`);
  if (it.kunci.length !== 1 || it.kunci[0] !== match[0]) fail(it.id, `kunci ${it.kunci} ≠ hasil hitung (${match[0]})`);
}

function checkItem(it: Item, file: string) {
  const id = it.id ?? `(tanpa id di ${file})`;
  if (!/^K\d{2}-[A-Z0-9]+-\d{3}$/.test(it.id ?? "")) fail(id, "format id harus <kartu>-<sumber>-<nnn>");
  const card = CARDS[it.kartu];
  if (!card) return fail(id, `kartu ${it.kartu} tidak dikenal`);
  if (!it.id.startsWith(it.kartu)) fail(id, "id tidak diawali kode kartu");
  if (!file.includes(it.kartu)) fail(id, `item kartu ${it.kartu} ada di file ${file}`);
  if (!card.prefix.some((p) => it.sub_type?.startsWith(p))) fail(id, `sub_type ${it.sub_type} bukan milik ${it.kartu}`);
  if (![1, 2, 3].includes(it.tier)) fail(id, "tier harus 1, 2, atau 3");
  if (!it.sumber) fail(id, "sumber kosong");
  if (!it.stem?.trim()) fail(id, "stem kosong");
  if (!STATUSES.has(it.status_kunci)) fail(id, `status_kunci ${it.status_kunci} tidak dikenal`);

  const keys = Object.keys(it.opsi ?? {});
  if (keys.join() !== LETTERS.join()) fail(id, "opsi harus tepat a–e");
  const texts = Object.values(it.opsi ?? {}).map((t) => t.trim());
  if (texts.some((t) => !t)) fail(id, "ada opsi kosong");
  if (new Set(texts).size !== texts.length) fail(id, "ada opsi kembar");
  if (!Array.isArray(it.kunci) || ![1, 2].includes(it.kunci.length) || it.kunci.some((k) => !keys.includes(k)))
    fail(id, "kunci harus 1–2 huruf dari opsi");

  const [p1, p2] = (it.pembahasan ?? "").split("<br>");
  if (!p1?.trim() || !p2?.trim()) fail(id, "pembahasan harus 2 paragraf dipisah <br>");
  for (const k of LETTERS)
    if (!it.kunci.includes(k) && !p2?.includes(`Opsi ${k.toUpperCase()}`)) fail(id, `paragraf 2 tidak menggugurkan Opsi ${k.toUpperCase()}`);

  if (it.rumus !== undefined) {
    if (!it.rumus.startsWith("<math") || /<script|\son\w+\s*=|javascript:/i.test(it.rumus)) fail(id, "rumus harus MathML murni");
    if ((it.rumus.match(/<(?!\/)[a-z]/g) ?? []).length !== (it.rumus.match(/<\//g) ?? []).length + (it.rumus.match(/\/>/g) ?? []).length)
      fail(id, "tag MathML tidak seimbang");
  }
  for (const img of [it.gambar, ...Object.values(it.opsi_gambar ?? {})])
    if (img && !existsSync(join(ROOT, "public", img))) fail(id, `gambar ${img} tidak ada di public/`);
  checkKey(it);
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function simulationStems(): Set<string> {
  const sim = JSON.parse(readFileSync(join(ROOT, "soal.json"), "utf8")) as { soal: { soal?: string | null; instruksi?: string }[] };
  return new Set(sim.soal.flatMap((s) => [s.soal, s.instruksi]).filter((s): s is string => !!s && s.length > 20).map(norm));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function preview(card: string, items: Item[]) {
  const rows = items.map((it, i) => `
<article><header><b>${i + 1}. ${esc(it.id)}</b> <span>${esc(it.sub_type)} · tier ${it.tier} · ${esc(it.sumber)} · ${esc(it.status_kunci)}</span></header>
${it.instruksi ? `<p class="ins">${esc(it.instruksi)}</p>` : ""}<p class="stem">${esc(it.stem)}</p>${it.rumus ?? ""}${it.gambar ? `<img src="../../public/${esc(it.gambar)}" alt="" style="max-width:100%">` : ""}
<ol type="A">${LETTERS.map((k) => `<li class="${it.kunci.includes(k) ? "key" : ""}">${esc(it.opsi[k])}</li>`).join("")}</ol>
<div class="pb">${it.pembahasan.split("<br>").map((p) => `<p>${esc(p)}</p>`).join("")}</div></article>`).join("");
  const html = `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Preview ${card} ${esc(CARDS[card].label)}</title>
<style>body{font:16px/1.55 system-ui,sans-serif;max-width:820px;margin:24px auto;padding:0 16px;background:#fff;color:#16224a}
article{border:1px solid #d9dee8;border-radius:10px;padding:14px 18px;margin:14px 0}header span{color:#667;font-size:13px}
.stem{font-size:18px}math{font-size:22px;margin:8px 0}li{margin:3px 0}.key{font-weight:700;color:#127a3a}
.key::after{content:"  ✓ kunci"}.pb{background:#f6f7fb;border-radius:8px;padding:4px 12px;font-size:14px}.ins{color:#556}</style>
<h1>${card} — ${esc(CARDS[card].label)} (${items.length} soal)</h1>${rows}</html>`;
  const dir = join(ROOT, "output/drill-preview");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${card}.html`), html);
}

function main() {
  const files = sourceFiles(SRC);
  const items: Item[] = [];
  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(f, "utf8"));
      if (!Array.isArray(data)) errors.push(`${f}: harus array item`);
      else for (const it of data) { checkItem(it, f); items.push(it); }
    } catch (e) {
      errors.push(`${f}: JSON ${(e as Error).message}`);
    }
  }
  const ids = new Map<string, number>();
  for (const it of items) ids.set(it.id, (ids.get(it.id) ?? 0) + 1);
  for (const [id, n] of ids) if (n > 1) errors.push(`id dobel ${id}`);
  const stems = new Map<string, string>();
  const sim = simulationStems();
  for (const it of items) {
    const n = norm(it.stem + (it.rumus ?? "") + (it.gambar && existsSync(join(ROOT, "public", it.gambar)) ? readFileSync(join(ROOT, "public", it.gambar), "utf8") : it.gambar ?? ""));
    if (!it.gambar && sim.has(norm(it.stem))) fail(it.id, "stem sama dengan soal simulasi Paket 1 (soal.json)");
    if (stems.has(n)) fail(it.id, `stem sama dengan ${stems.get(n)}`);
    stems.set(n, it.id);
  }

  const shipped = items.filter((it) => args.has("--draft") || SHIPPABLE.has(it.status_kunci));
  if (!shipped.length) errors.push(`0 item siap rilis dari ${items.length} item (butuh status resmi|ganda, atau pakai --draft)`);

  const byCard = new Map<string, Item[]>();
  for (const it of shipped) byCard.set(it.kartu, [...(byCard.get(it.kartu) ?? []), it]);
  for (const [card, list] of [...byCard].sort()) {
    const keys = Object.fromEntries(LETTERS.map((k) => [k, list.filter((it) => it.kunci.includes(k)).length]));
    const tiers = [1, 2, 3].map((t) => list.filter((it) => it.tier === t).length).join("/");
    console.log(`${card} ${CARDS[card].label.padEnd(24)} ${String(list.length).padStart(3)} soal  tier ${tiers}  kunci ${JSON.stringify(keys)}`);
    if (args.has("--preview")) preview(card, list);
  }
  for (const e of errors) console.log("ERROR", e);
  if (errors.length) process.exit(1);
  if (args.has("--check")) return console.log(`OK ${shipped.length} item (cek saja, tidak menulis)`);
  if (args.has("--draft")) return console.log(`OK ${shipped.length} item draft (tidak menulis data/drill-bank.json)`);
  mkdirSync(join(ROOT, "data"), { recursive: true });
  const bank = shipped.map((it) => {
    const copy = { ...it };
    delete copy.hitung;
    delete copy.nilai_opsi;
    return copy;
  });
  writeFileSync(OUT, JSON.stringify(bank));
  console.log(`OK ${bank.length} item -> data/drill-bank.json`);
}

main();
