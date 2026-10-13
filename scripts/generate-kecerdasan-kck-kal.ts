import * as fs from "fs";
import * as path from "path";
import { root } from "./kecerdasan-teks-lib";

// Render field `tabel` butir KCK (prisma/data/kecerdasan_kck_kal.json) ke SVG hitam-putih di field `svg`.
// Tampil sebagai options_payload.svg_content, di bawah question_text. Tanpa id (G-8).
//   npx tsx scripts/generate-kecerdasan-kck-kal.ts            tulis ulang field svg
//   npx tsx scripts/generate-kecerdasan-kck-kal.ts --out DIR  juga simpan tiap SVG ke DIR (untuk cek render)

type Tabel = { kolom: string[]; baris: string[][] };
type Kck = { s: number; tabel: Tabel | null; svg?: string | null } & Record<string, unknown>;

// FS besar karena di HP (±300 px) tabel diperkecil ±0,57×; teks tetap ±12 px.
const W = 520, ROW = 52, PAD = 12, FS = 21;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Lebar teks kira-kira (system-ui ±0,55 em per karakter; tebal sedikit lebih lebar).
const lebar = (s: string, bold = false) => s.length * FS * (bold ? 0.6 : 0.55);

// Judul kolom panjang dipecah jadi 2 baris yang seimbang.
const pecah = (k: string): string[] => {
  const w = k.split(" ");
  if (w.length < 2) return [k];
  const opsi = w.slice(1).map((_, i) => [w.slice(0, i + 1).join(" "), w.slice(i + 1).join(" ")]);
  return opsi.reduce((a, b) => (Math.max(...b.map((x) => x.length)) < Math.max(...a.map((x) => x.length)) ? b : a));
};

export function tabelSvg(t: Tabel): string {
  const isi = (c: number) => Math.max(...t.baris.map((b) => lebar(b[c])));
  const total = (jud: string[][]) => jud.reduce((a, j, c) => a + Math.max(...j.map((x) => lebar(x, true)), isi(c)) + 2 * PAD, 0);
  // Pecah judul kolom terpanjang dulu sampai tabel muat di W.
  const jud = t.kolom.map((k) => [k]);
  for (const c of t.kolom.map((_, c) => c).sort((a, b) => t.kolom[b].length - t.kolom[a].length)) {
    if (total(jud) <= W) break;
    jud[c] = pecah(t.kolom[c]);
  }
  if (total(jud) > W) throw new Error(`tabel "${t.kolom.join(" | ")}" terlalu lebar`);
  // Lebar kolom sebanding kebutuhan, dipaskan ke W.
  const butuh = jud.map((j, c) => Math.max(...j.map((x) => lebar(x, true)), isi(c)) + 2 * PAD);
  const skala = W / butuh.reduce((a, b) => a + b, 0);
  const cw = butuh.map((b) => b * skala);
  const xs = cw.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w], [0]);
  const HEAD = jud.some((j) => j.length > 1) ? ROW + FS + 4 : ROW;
  const ys = [0, ...t.baris.map((_, r) => HEAD + r * ROW), HEAD + t.baris.length * ROW];
  const H = ys[ys.length - 1];
  const cx = (c: number) => (xs[c] + cw[c] / 2).toFixed(1);
  const head = jud.map((j, c) => j.map((x, l) =>
    `<text x="${cx(c)}" y="${(HEAD / 2 + (l - (j.length - 1) / 2) * (FS + 4)).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-weight="700">${esc(x)}</text>`).join(""));
  const body = t.baris.flatMap((b, r) => b.map((v, c) =>
    `<text x="${cx(c)}" y="${ys[r + 1] + ROW / 2}" text-anchor="middle" dominant-baseline="central"${/^[a-z]$/.test(v) ? ' font-style="italic"' : ""}>${esc(v)}</text>`));
  const garisH = ys.map((y, r) => `<line x1="0" y1="${y}" x2="${W}" y2="${y}"${r === 1 ? ' stroke-width="1.6"' : ""}/>`);
  const garisV = xs.map((x) => `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${W + 2} ${H + 2}" width="${W + 2}" style="max-width:100%;height:auto" role="img" aria-label="Tabel: ${esc(t.kolom.join(", "))}" font-family="${FONT}" font-size="${FS}">` +
    `<rect x="-1" y="-1" width="${W + 2}" height="${H + 2}" fill="#fff"/>` +
    `<g fill="#111">${head.join("")}${body.join("")}</g>` +
    `<g stroke="#111" stroke-width="1">${garisH.join("")}${garisV.join("")}</g></svg>`;
}

if (require.main === module) {
  const file = path.join(root, "prisma/data/kecerdasan_kck_kal.json");
  const all = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, Kck[]>;
  const outIdx = process.argv.indexOf("--out");
  const out = outIdx > 0 ? process.argv[outIdx + 1] : null;
  if (out) fs.mkdirSync(out, { recursive: true });
  let n = 0;
  for (const [pkg, items] of Object.entries(all)) for (const x of items) {
    x.svg = x.tabel ? tabelSvg(x.tabel) : null;
    if (x.svg) { n++; if (out) fs.writeFileSync(path.join(out, `p${pkg}-${x.s}.svg`), x.svg); }
  }
  fs.writeFileSync(file, JSON.stringify(all, null, 2) + "\n");
  console.log(`svg ditulis: ${n} tabel → ${path.relative(root, file)}`);
}
