/**
 * Pustaka kecil untuk gambar pembahasan drill (hitam-putih, landscape 616 × 260), dipakai K09/K11/K08/K16/K07/K10.
 * Gaya mengikuti gambar K05 trik yang sudah disetujui: tinta #111, abu #555, arsiran untuk "bagian yang disorot".
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const ROOT = join(__dirname, "..");
export const W = 616, H = 260, INK = "#111111", MUTED = "#555555", SOFT = "#dddddd";
export const FONT = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
export type El = string;
export type Anchor = "start" | "middle" | "end";
type Opt = { size?: number; fill?: string; w?: number; anchor?: Anchor };

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
export const t = (x: number, y: number, s: string, { size = 13, fill = INK, w = 400, anchor = "start" }: Opt = {}): El =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
export const tb = (x: number, y: number, s: string, size = 13, anchor: Anchor = "start", fill = INK) => t(x, y, s, { size, w: 700, anchor, fill });
export const tm = (x: number, y: number, s: string, size = 11, anchor: Anchor = "start") => t(x, y, s, { size, fill: MUTED, anchor });
export const rect = (x: number, y: number, w: number, h: number, fill = "#fff", { dash = false, r = 0, sw = 1.5, stroke = INK } = {}): El =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ' stroke-dasharray="5 4"' : ""}/>`;
export const line = (x1: number, y1: number, x2: number, y2: number, { dash = false, arrow = false, sw = 1.5, stroke = INK } = {}): El =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash ? ' stroke-dasharray="5 4"' : ""}${arrow ? ' marker-end="url(#ah)"' : ""}/>`;
export const curve = (d: string, { dash = false, arrow = true, sw = 1.5 } = {}): El =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}"${dash ? ' stroke-dasharray="5 4"' : ""}${arrow ? ' marker-end="url(#ah)"' : ""}/>`;
export const circle = (cx: number, cy: number, r: number, fill = "#fff", sw = 1.5, dash = false): El =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${dash ? ' stroke-dasharray="4 3"' : ""}/>`;
/** Baris teks berjarak tetap. */
export const lines = (x: number, y: number, rows: [string, number?][], size = 12.5, gap = 18): El[] =>
  rows.map(([s, w = 400], i) => t(x, y + i * gap, s, { size, w }));
/** Kotak berisi teks di tengah; `dark` = latar hitam (jawaban). */
export const box = (x: number, y: number, w: number, h: number, s: string, { dark = false, size = 14, dash = false, r = 6 } = {}): El[] =>
  [rect(x, y, w, h, dark ? INK : "#fff", { r, dash, sw: dark ? 1.5 : 1.5 }), t(x + w / 2, y + h / 2 + size * 0.36, s, { size, w: 700, anchor: "middle", fill: dark ? "#fff" : INK })];
/** Lencana bernomor (urutan baca). */
export const badge = (cx: number, cy: number, n: number | string, r = 10): El[] =>
  [`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/>`, t(cx, cy + 4, String(n), { size: r * 1.1, fill: "#fff", w: 700, anchor: "middle" })];

export function frame(label: string, body: El[]): string {
  const defs =
    '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#111"/></marker>' +
    '<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#111" stroke-width="1.2"/></pattern></defs>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}" font-family="${FONT}">${defs}<rect width="${W}" height="${H}" fill="#fff"/>${body.join("")}</svg>`;
}

/** Bungkus teks ke beberapa baris (perkiraan lebar: 0,55 × ukuran font per huruf). */
export function wrap(s: string, size: number, maxW: number): string[] {
  const per = Math.floor(maxW / (size * 0.54)), out: string[] = [];
  let cur = "";
  for (const w of s.split(" ")) {
    if ((cur + " " + w).trim().length > per) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}
export const wrapText = (x: number, y: number, s: string, { size = 12.5, maxW = 340, gap = 17, w = 400, fill = INK }: { size?: number; maxW?: number; gap?: number; w?: number; fill?: string } = {}): El[] =>
  wrap(s, size, maxW).map((l, i) => t(x, y + i * gap, l, { size, w, fill }));

/** Muat bank K-file, ubah item lewat callback, tulis kembali dengan indentasi file asal. */
export function patchBank(file: string, fn: (it: Record<string, unknown>) => void): void {
  const p = join(ROOT, "bank/drill/kecerdasan", file);
  const raw = readFileSync(p, "utf8");
  const data = JSON.parse(raw) as Record<string, unknown>[];
  data.forEach(fn);
  const indent = raw.match(/^\[\n( +)\{/)?.[1].length ?? 1; // ikuti indentasi file asal supaya diff git tetap kecil
  writeFileSync(p, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
}
export const loadBank = (file: string) => JSON.parse(readFileSync(join(ROOT, "bank/drill/kecerdasan", file), "utf8")) as Record<string, any>[];
export const writeSvg = (id: string, svg: string) => writeFileSync(join(ROOT, "data/drill-pembahasan", `${id}.svg`), svg);

/** Hitung satu langkah operasi berlabel mis. "×2−1", "÷3", "+5" (kiri ke kanan). */
export function applyOp(v: number, op: string): number {
  let x = v;
  for (const m of op.matchAll(/([+−×÷])(\d+)/g)) {
    const n = Number(m[2]);
    x = m[1] === "+" ? x + n : m[1] === "−" ? x - n : m[1] === "×" ? x * n : x / n;
  }
  return x;
}
