// Render SVG: kubus (proyeksi miring) dan jaring. Tanpa id (aman ditempel inline, G-8).
import { DESIGNS, V3, add, mul, neg, Cell, View, Pos } from "./kubus-core";

const f2 = (x: number) => +x.toFixed(2);
function primsSvg(design: string): string {
  return DESIGNS[design].prims.map((p) => {
    if (p.k === "rect") return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.f}"/>`;
    if (p.k === "poly") return `<polygon points="${p.p.map((q) => q.map(f2).join(",")).join(" ")}" fill="${p.f}"/>`;
    const onCorner = (p.cx === 0 || p.cx === 1) && (p.cy === 0 || p.cy === 1);
    if (!onCorner) return `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${p.f}"/>`;
    const sx = p.cx === 1 ? -1 : 1, sy = p.cy === 1 ? -1 : 1;
    const a0 = Math.atan2(0, sx), a1 = Math.atan2(sy, 0);
    let d = a1 - a0; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    return `<path d="M${p.cx},${p.cy} L${f2(p.cx + sx * p.r)},${p.cy} A${p.r},${p.r} 0 0 ${d > 0 ? 1 : 0} ${p.cx},${f2(p.cy + sy * p.r)} Z" fill="${p.f}"/>`;
  }).join("");
}

// ---------- Kubus ----------
const KX = 0.42, KY = 0.36;
export interface CubeOpts { size?: number; tint?: Partial<Record<Pos, string>>; label?: Partial<Record<Pos, string>> }
export function cubeSvg(v: View, o: CubeOpts = {}): { svg: string; w: number; h: number } {
  const s = o.size ?? 70, side = v.side;
  const P = (p: V3): [number, number] => [s * (p[0] - side * KX * p[2]), s * (-p[1] + KY * p[2])];
  // batas gambar
  const pts: [number, number][] = [];
  for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) pts.push(P([x, y, z]));
  const pad = o.label ? 26 : 4, padX = o.label ? 74 : 4;
  const minX = Math.min(...pts.map((p) => p[0])) - padX, minY = Math.min(...pts.map((p) => p[1])) - pad;
  const maxX = Math.max(...pts.map((p) => p[0])) + padX, maxY = Math.max(...pts.map((p) => p[1])) + pad;
  const T = (p: V3) => { const [x, y] = P(p); return [f2(x - minX), f2(y - minY)] as [number, number]; };
  const NRM: Record<Pos, V3> = { depan: [0, 0, 1], atas: [0, 1, 0], samping: [side, 0, 0] };
  let g = "";
  for (const pos of ["depan", "atas", "samping"] as Pos[]) {
    const f = v.faces[pos], c = mul(NRM[pos], 0.5), du = neg(f.u);
    const o0 = add(add(c, mul(f.r, -0.5)), mul(du, -0.5));
    const [a, b] = P(f.r), [cc, d] = P(du), [e, ff] = T(o0);
    const corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]].map(([x, y]) => T(add(add(c, mul(f.r, x)), mul(du, y))).join(",")).join(" ");
    g += `<polygon points="${corners}" fill="#fff"/>`;
    g += `<g transform="matrix(${f2(a)} ${f2(b)} ${f2(cc)} ${f2(d)} ${e} ${ff})">${primsSvg(f.design)}</g>`;
    if (o.tint?.[pos]) g += `<polygon points="${corners}" fill="${o.tint[pos]}" fill-opacity="0.2"/>`;
    g += `<polygon points="${corners}" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"/>`;
    if (o.tint?.[pos]) g += `<polygon points="${corners}" fill="none" stroke="${o.tint[pos]}" stroke-width="3" stroke-linejoin="round" transform-origin="center"/>`;
    if (o.label?.[pos]) {
      const lp = pos === "depan" ? T([0, -0.5, 0.5]) : pos === "atas" ? T([0, 0.5, -0.5]) : T([side * 0.5, 0, -0.5]);
      const dy = pos === "depan" ? 17 : pos === "atas" ? -8 : 0, dx = pos === "samping" ? side * 8 : 0;
      const anchor = pos === "samping" ? (side > 0 ? "start" : "end") : "middle";
      g += `<text x="${f2(lp[0] + dx)}" y="${f2(lp[1] + dy)}" text-anchor="${anchor}" font-family="sans-serif" font-size="12" font-weight="700" fill="${o.tint?.[pos] ?? "#111"}">${o.label[pos]}</text>`;
    }
  }
  const w = f2(maxX - minX), h = f2(maxY - minY);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${g}</svg>`, w, h };
}

// ---------- Jaring ----------
export interface NetOpts { cell?: number; tint?: Record<number, string>; numbers?: boolean; tag?: Record<number, string> }
export function netSvg(cells: Cell[], o: NetOpts = {}): { svg: string; w: number; h: number } {
  const cs = o.cell ?? 40, pad = 3;
  const minC = Math.min(...cells.map((c) => c.c)), minR = Math.min(...cells.map((c) => c.r));
  const at = (c: number, r: number) => cells.findIndex((x) => x.c === c && x.r === r);
  let g = "", lines = "";
  cells.forEach((cl, i) => {
    const x = (cl.c - minC) * cs + pad, y = (cl.r - minR) * cs + pad;
    g += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" fill="#fff"/>`;
    g += `<g transform="translate(${x} ${y}) scale(${cs}) rotate(${cl.rot * 90} 0.5 0.5)">${primsSvg(cl.design)}</g>`;
    if (o.tint?.[i]) g += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" fill="${o.tint[i]}" fill-opacity="0.2"/><rect x="${x + 1.5}" y="${y + 1.5}" width="${cs - 3}" height="${cs - 3}" fill="none" stroke="${o.tint[i]}" stroke-width="3"/>`;
    const edges: [number, number, number, number, number, number][] = [
      [cl.c, cl.r - 1, x, y, x + cs, y], [cl.c, cl.r + 1, x, y + cs, x + cs, y + cs],
      [cl.c - 1, cl.r, x, y, x, y + cs], [cl.c + 1, cl.r, x + cs, y, x + cs, y + cs],
    ];
    for (const [nc, nr, x1, y1, x2, y2] of edges) {
      const j = at(nc, nr);
      if (j < 0) lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="2" stroke-linecap="square"/>`;
      else if (j > i) lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="1.4" stroke-dasharray="3 3"/>`;
    }
  });
  let badges = "";
  if (o.numbers) cells.forEach((cl, i) => {
    const x = (cl.c - minC) * cs + pad, y = (cl.r - minR) * cs + pad, col = o.tint?.[i] ?? "#555";
    badges += `<circle cx="${x + 9}" cy="${y + 9}" r="7.5" fill="#fff" stroke="${col}" stroke-width="1.5"/><text x="${x + 9}" y="${y + 12.5}" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="${col}">${cl.no ?? i + 1}</text>`;
    if (o.tag?.[i]) badges += `<text x="${x + cs / 2}" y="${y + cs - 4}" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="700" fill="${col}" paint-order="stroke" stroke="#fff" stroke-width="3">${o.tag[i]}</text>`;
  });
  const w = (Math.max(...cells.map((c) => c.c)) - minC + 1) * cs + 2 * pad, h = (Math.max(...cells.map((c) => c.r)) - minR + 1) * cs + 2 * pad;
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${g}${lines}${badges}</svg>`, w, h };
}
