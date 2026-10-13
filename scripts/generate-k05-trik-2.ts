/**
 * K05 hitung cepat metode praktis, batch 2: butir K05-N-021..060 + gambar pembahasannya.
 *   npx tsx scripts/generate-k05-trik-2.ts                 # status_kunci = hitung (belum dicek buta)
 *   npx tsx scripts/generate-k05-trik-2.ts --status ganda  # setelah cek buta sepakat
 * Butir K05-N-001..020 dan butir sumber lain tidak disentuh; N-021..060 selalu dibangkitkan ulang (seed tetap).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SPECS, type Fmt } from "./k05-trik-2-items";
import { SVG } from "./k05-trik-2-svg";

const ROOT = join(__dirname, "..");
const FILE = join(ROOT, "bank/drill/kecerdasan/K05-hitung-cepat.json");
const IMG = join(ROOT, "data/drill-pembahasan");
const LETTERS = ["a", "b", "c", "d", "e"];
const status = process.argv.includes("--status") ? process.argv[process.argv.indexOf("--status") + 1] : "hitung";

const ev = (expr: string): number => Number(new Function(`"use strict"; return (${expr});`)().toPrecision(12));
function idf(v: number): string {
  const [i, d] = String(Number(v.toFixed(6))).split(".");
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? `,${d}` : "");
}
const fmtOpt = (v: number, f: Fmt = "n") => (f === "rp" ? `Rp${idf(v)}` : f === "pct" ? `${idf(v)}%` : idf(v));

// Opsi angka diurutkan naik, jadi huruf kunci = urutan nilai kunci di antara opsi (0 = terkecil = A).
// Tiap kelompok 10 butir memuat tiap huruf dua kali, tanpa huruf sama berurutan; kunci tidak pernah "selalu nilai tengah".
const RANK: Record<number, number> = {
  21: 0, 22: 2, 23: 4, 24: 3, 25: 0, 26: 1, 27: 3, 28: 2, 29: 4, 30: 1,
  31: 0, 32: 4, 33: 1, 34: 0, 35: 3, 36: 4, 37: 1, 38: 2, 39: 3, 40: 2,
  41: 4, 42: 0, 43: 1, 44: 0, 45: 3, 46: 2, 47: 4, 48: 1, 49: 3, 50: 2,
  51: 4, 52: 3, 53: 0, 54: 3, 55: 2, 56: 4, 57: 1, 58: 2, 59: 0, 60: 1,
};

const items = SPECS.map((s, idx) => {
  if (s.n !== 21 + idx) throw new Error(`urutan spec salah di ${s.n}`);
  const key = ev(s.hitung), f = s.fmt ?? "n";
  const pool = s.ds.map(([e, why]) => ({ v: ev(e), why }));
  const pos = RANK[s.n];
  const below = pool.filter((d) => d.v < key).slice(0, pos), above = pool.filter((d) => d.v > key).slice(0, 4 - pos);
  if (below.length !== pos || above.length !== 4 - pos) throw new Error(`K05-N-0${s.n}: pool kurang untuk kunci di posisi ${LETTERS[pos]}`);
  const ds = [...below, ...above].sort((a, b) => a.v - b.v);
  if (new Set([key, ...ds.map((d) => d.v)]).size !== 5) throw new Error(`K05-N-0${s.n}: nilai opsi kembar`);
  const all: { v: number; why?: string }[] = [...ds.slice(0, pos), { v: key }, ...ds.slice(pos)];
  const letter = LETTERS[pos];
  const txt = (v: number) => fmtOpt(v, f);
  const opsi = Object.fromEntries(all.map((o, i) => [LETTERS[i], txt(o.v)]));
  const gugur = all.flatMap((o, i) => (i === pos ? [] : [`Opsi ${LETTERS[i].toUpperCase()} (${txt(o.v)}) gugur karena ${o.why}.`]));
  const p1 = [`Cara cepat (${s.nama}): ${s.cepat}`, `Kenapa bisa: ${s.kenapa}`, `Cara biasa: ${s.biasa}`].join("\n");
  const p2 = ["Kenapa yang lain salah:", ...gugur, `Jawaban: Opsi ${letter.toUpperCase()} (${txt(key)}).`, `Tips: ${s.tips}`].join("\n");
  const id = `K05-N-0${s.n}`;
  if (!SVG[s.n]) throw new Error(`${id}: SVG belum ada`);
  writeFileSync(join(IMG, `${id}.svg`), SVG[s.n]());
  return {
    id, kartu: "K05", sub_type: s.st, tier: s.tier, sumber: "baru", stem: s.stem, opsi, kunci: [letter],
    hitung: s.hitungOut ?? s.hitung, nilai_opsi: Object.fromEntries(all.map((o, i) => [LETTERS[i], o.v])),
    pembahasan: `${p1}<br>${p2}`, status_kunci: status, gambar_pembahasan: `${id}.svg`,
  };
});

const raw = readFileSync(FILE, "utf8");
const bank = (JSON.parse(raw) as { id: string }[]).filter((it) => !/^K05-N-0(2[1-9]|[3-5]\d|60)$/.test(it.id));
writeFileSync(FILE, JSON.stringify([...bank, ...items], null, 1) + (raw.endsWith("\n") ? "\n" : ""));

const dist = (f: (i: (typeof items)[number]) => string) => items.reduce<Record<string, number>>((m, i) => ((m[f(i)] = (m[f(i)] ?? 0) + 1), m), {});
console.log(`${items.length} butir, status ${status}\nkunci:`, dist((i) => i.kunci[0]), "\ntier:", dist((i) => String(i.tier)), "\nsub_type:", dist((i) => i.sub_type));
