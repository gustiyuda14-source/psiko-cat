import assert from "node:assert/strict";
import { renderMap2, W, H, TOP, M, type Map2 } from "./denah-k17-bw";
import { f1, C_OK, C_NO, C_REF } from "./denah-k17-peta";

// SVG peta untuk paket 20 (salinan murni dari generate-kecerdasan-denah-kal.ts, yang tidak bisa diimpor
// tanpa side-effect: menulis JSON paket lain). Paket baru selalu memakai halo "Lapangan".
const haloLapangan = (svg: string) => svg.replace(/(<text [^>]*)>Lapangan</g, '$1 stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round">Lapangan<');

/** Peta soal: id clipPath berprefiks per soal, ukuran ikut lebar layar (maks 448px). */
export function inlineMap(bw: Map2, n: number, rot: number, prefix: string) {
  const svg = haloLapangan(renderMap2(bw, n, undefined, rot))
    .replace(' width="448" height="600"', ' style="width:100%;max-width:448px;height:auto"')
    .replaceAll('id="mapclip"', `id="${prefix}mapclip"`).replaceAll("url(#mapclip)", `url(#${prefix}mapclip)`);
  assert.ok(!svg.includes('"mapclip"') && !svg.includes("#mapclip)"), "id clipPath belum berprefiks");
  return svg;
}

/** Gambar pembahasan tanpa atribut id (G-8): clipPath diganti tutup putih, marker diganti segitiga biasa; tag dijaga di dalam bingkai dan tidak bertumpuk. */
export function pembahasanSvg(bw: Map2, n: number, rot: number, it: { cap: string[]; over: string }) {
  const MKC: Record<string, string> = { ok: C_OK, no: C_NO, ref: C_REF };
  let svg = haloLapangan(renderMap2(bw, n, { cap: it.cap, over: it.over, defs: "" }, rot))
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
  // Tag yang keluar bingkai digeser masuk (label belokan "→" dipindah ke kiri titik belok).
  svg = svg.replace(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="20" fill="#fff" rx="10"([^>]*)\/><text x="([-\d.]+)"([^>]*)>([^<]*)<\/text>/g, (all, x, y, w, ra, tx, ta, t: string) => {
    const x0 = +x, ww = +w, over = Math.max(0, x0 + ww - (W - M - 2)) - Math.max(0, M + 2 - x0);
    if (!over) return all;
    const dx = t.includes("→") && over > 0 ? -92 : -over;
    return `<rect x="${f1(x0 + dx)}" y="${y}" width="${w}" height="20" fill="#fff" rx="10"${ra}/><text x="${f1(+tx + dx)}"${ta}>${t}</text>`;
  });
  // Dua tag bertumpuk: pisahkan vertikal, masing-masing setengah jarak.
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
