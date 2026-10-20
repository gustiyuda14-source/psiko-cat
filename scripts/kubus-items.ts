// Generator butir jaring-jaring kubus. Tipe A: jaring → kubus. Tipe B: kubus → jaring.
import { Cube, Cell, View, Pos, Face, V3, NORMALS, ROTS, DESIGNS, fold, foldShape, unfold, rotate, viewOf, viewSig, consistent, opposite, key, neg, cross, mirrorCube, describe, orientPhrase, POS_N } from "./kubus-core";
import { explain, posName, ERR_NAME, ErrKind, countDesign } from "./kubus-explain";
import { cubeSvg, netSvg } from "./kubus-render";
import { netText, viewText } from "./kubus-blind";

export function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export type R = () => number;
export const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length)];
export const shuffle = <T,>(r: R, a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// 11 bentuk jaring kubus. Indeks 0–5 = 1-4-1, 6–8 = 2-3-1, 9 = 2-2-2, 10 = 3-3.
export const SHAPES: [number, number][][] = [
  ...[[0, 0], [0, 1], [0, 2], [0, 3], [1, 1], [1, 2]].map(([a, b]) => [[a, 0], [0, 1], [1, 1], [2, 1], [3, 1], [b, 2]] as [number, number][]),
  ...[1, 2, 3].map((x) => [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [x, 2]] as [number, number][]),
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
];
/** Bentuk jaring acak (diputar/dicerminkan), sel diurutkan baca (baris lalu kolom). */
export function randomShape(r: R, idxs: number[]): { c: number; r: number }[] {
  const s = SHAPES[pick(r, idxs)], t = Math.floor(r() * 8);
  let pts = s.map(([c, rr]) => { let x = c, y = rr; if (t & 4) x = -x; for (let i = 0; i < (t & 3); i++) [x, y] = [-y, x]; return [x, y]; });
  const mc = Math.min(...pts.map((p) => p[0])), mr = Math.min(...pts.map((p) => p[1]));
  pts = pts.map(([x, y]) => [x - mc, y - mr]);
  const w = Math.max(...pts.map((p) => p[0])) + 1, h = Math.max(...pts.map((p) => p[1])) + 1;
  if (w > 4 || h > 4) { pts = pts.map(([x, y]) => [y, x]); } // jaring 3-3 / panjang: dibaringkan
  const out = pts.map(([c, rr]) => ({ c, r: rr })).sort((a, b) => a.r - b.r || a.c - b.c);
  if (!foldShape(out)) throw new Error("bentuk rusak");
  return out;
}

export const SYM = ["bulat", "hitam", "cincin", "silang", "plus", "bingkai", "abu"];
const ASYM2 = ["segitiga", "garis", "panah", "setengah"];
const ASYM3 = ["siku", "diagonal", "pojok", "titik2", "segitiga", "panah"];

export interface Opsi { huruf: string; svg: string }
export interface Item {
  id: string; no: number; tier: 1 | 2 | 3; tipe: "A" | "B"; stem: string; gambar: string;
  hots?: boolean; buta?: string; opsi: Opsi[]; kunci: string; pembahasan: string; gambar_pembahasan: string; pengecoh: Record<string, ErrKind>;
}
export const LET = ["A", "B", "C", "D", "E"];
export const TINT: Record<Pos, string> = { depan: "#2563eb", atas: "#16a34a", samping: "#d97706" };
export const POSES: Pos[] = ["depan", "atas", "samping"];

export function hasTwoUnique(c: Cube, v: View) {
  return POSES.filter((p) => v.faces[p].design !== "kosong" && countDesign(c, v.faces[p].design) === 1).length >= 2;
}
/** Bingkai acak di bidang posisi p (untuk motif pengganti). */
export function frameAt(r: R, p: Pos, side: number): { r: V3; u: V3 } {
  const n = POS_N(side)[p];
  const ax = NORMALS.filter((v) => Math.abs(v[0] * n[0] + v[1] * n[1] + v[2] * n[2]) === 0);
  const u = pick(r, ax);
  return { u, r: cross(u, n) };
}

// ---------- Tipe A: jaring → kubus ----------
function designsA(r: R, tier: number): string[] {
  if (tier === 1) return shuffle(r, shuffle(r, SYM).slice(0, 5).concat(r() < 0.5 ? ["kosong"] : [pick(r, ["garis", "setengah"])]));
  if (tier === 2) return shuffle(r, shuffle(r, ASYM2).slice(0, 3).concat(shuffle(r, SYM).slice(0, 2), ["kosong"]));
  return shuffle(r, shuffle(r, ASYM3).slice(0, 4).concat(shuffle(r, SYM).slice(0, 2)));
}
function cubeDistractors(r: R, c: Cube, correct: View, tier: number): { v: View; kind: string }[] {
  const out: { v: View; kind: string }[] = [], sigs = new Set([viewSig(correct)]);
  const valid = (v: View) => consistent(c, v);
  const tryAdd = (v: View, kind: string) => {
    const s = viewSig(v);
    if (sigs.has(s) || valid(v) || !hasTwoUnique(c, v)) return;
    try { explain(c, v, (d) => d, "kubus"); } catch { return; }
    sigs.add(s); out.push({ v, kind });
  };
  for (let guard = 0; guard < 400 && out.length < 12; guard++) {
    const kind = pick(r, tier === 1 ? ["seberang", "seberang", "tukar", "cermin"] : ["seberang", "putar", "putar", "cermin", "tukar"]);
    const side = (r() < 0.5 ? 1 : -1) as 1 | -1;
    const base = viewOf(rotate(c, pick(r, ROTS)), side);
    if (!hasTwoUnique(c, base)) continue;
    const faces = { ...base.faces };
    if (kind === "seberang") {
      const [p, q] = shuffle(r, POSES);
      const opp = opposite(c, faces[q].design);
      if (opp === "kosong" || faces[q].design === "kosong") continue;
      faces[p] = { design: opp, ...frameAt(r, p, side) };
    } else if (kind === "putar") {
      const ps = POSES.filter((p) => DESIGNS[faces[p].design].anchor);
      if (!ps.length) continue;
      const p = pick(r, ps), f = faces[p], n = POS_N(side)[p];
      const k = 1 + Math.floor(r() * 3); let rr = f.r, uu = f.u;
      for (let i = 0; i < k; i++) [rr, uu] = [neg(uu), rr]; // putar 90° di bidang sisi
      void n; faces[p] = { ...f, r: rr, u: uu };
    } else if (kind === "tukar") {
      const [p, q] = shuffle(r, POSES);
      faces[p] = { design: base.faces[q].design, ...frameAt(r, p, side) };
      faces[q] = { design: base.faces[p].design, ...frameAt(r, q, side) };
    } else {
      const m = viewOf(rotate(mirrorCube(c), pick(r, ROTS)), side);
      tryAdd(m, kind); continue;
    }
    tryAdd({ side, faces }, kind);
  }
  return out;
}

// ---------- Tipe B: kubus → jaring ----------
function cubeB(r: R, tier: number): Cube {
  // 3 sisi bermotif di satu pojok (T1–T2), 4–5 sisi bermotif (T3)
  for (;;) {
    const shape = randomShape(r, tier === 3 ? [6, 7, 8, 9, 10, 2, 3] : [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const pool = tier === 1 ? shuffle(r, SYM).slice(0, 2).concat(shuffle(r, ASYM2).slice(0, 1))
      : tier === 2 ? shuffle(r, SYM).slice(0, 1).concat(shuffle(r, ASYM2).slice(0, 2))
        : shuffle(r, ASYM3).slice(0, 3).concat(shuffle(r, SYM).slice(0, 1 + Math.floor(r() * 2)));
    const designs = shuffle(r, pool.concat(Array(6 - pool.length).fill("kosong")));
    const cube = fold(shape.map((s, i) => ({ ...s, design: designs[i], rot: Math.floor(r() * 4) })));
    if (tier < 3) { // tiga motif harus saling bertetangga
      const ds = pool; if (ds.some((a) => ds.some((b) => a !== b && opposite(cube, a) === b))) continue;
    }
    return cube;
  }
}
function netDistractors(r: R, c: Cube, stim: View, tier: number): { cells: Cell[]; kind: string }[] {
  const out: { cells: Cell[]; kind: string }[] = [], seen = new Set<string>();
  const visD = POSES.map((p) => stim.faces[p].design).filter((d) => d !== "kosong");
  for (let guard = 0; guard < 600 && out.length < 12; guard++) {
    const shape = randomShape(r, tier === 1 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const cells = unfold(c, shape, Math.floor(r() * 24)).map((x) => ({ ...x }));
    const kind = pick(r, ["putar", "putar", "tukar", "seberang"]);
    const idx = (d: string) => cells.findIndex((x) => x.design === d);
    if (kind === "putar") {
      const asym = visD.filter((d) => DESIGNS[d].anchor);
      if (!asym.length) continue;
      const i = idx(pick(r, asym)); cells[i].rot = (cells[i].rot + 1 + Math.floor(r() * 3)) % 4;
    } else if (kind === "tukar") {
      const i = idx(pick(r, visD)), j = Math.floor(r() * 6); if (i === j || cells[i].design === cells[j].design) continue;
      [cells[i].design, cells[j].design] = [cells[j].design, cells[i].design]; [cells[i].rot, cells[j].rot] = [cells[j].rot, cells[i].rot];
    } else {
      const [a, b] = shuffle(r, visD); if (!b) continue;
      const cb = fold(cells), nb = NORMALS.find((n) => cb.get(key(n))!.design === b)!;
      const target = cb.get(key(neg(nb)))!.cell!, i = idx(a); if (target < 0 || target === i) continue;
      [cells[i].design, cells[target].design] = [cells[target].design, cells[i].design]; [cells[i].rot, cells[target].rot] = [cells[target].rot, cells[i].rot];
    }
    const d = fold(cells);
    if (consistent(d, stim)) continue;
    const sig = netSvg(cells).svg; if (seen.has(sig)) continue;
    try { explain(d, stim, (x) => x, "jaring"); } catch { continue; }
    seen.add(sig); out.push({ cells, kind });
  }
  return out;
}

export function build(seed: number, no: number, tier: 1 | 2 | 3, tipe: "A" | "B", kunci: string): Item {
  const r = rng(seed);
  return tipe === "A" ? buildA(r, no, tier, kunci) : buildB(r, no, tier, kunci);
}

const pairText = (c: Cube, cells: Cell[]) => {
  const done = new Set<number>(), pr: string[] = [];
  cells.forEach((_, i) => {
    if (done.has(i)) return;
    const n = NORMALS.find((v) => c.get(key(v))!.cell === i)!, j = c.get(key(neg(n)))!.cell!;
    done.add(i); done.add(j); pr.push(`${Math.min(i, j) + 1}–${Math.max(i, j) + 1}`);
  });
  return pr;
};
const TIPS_A = [
  "Cari pasangan berseberangan dulu (pada satu baris lurus, kotak yang selang satu). Opsi yang menampilkan pasangan itu bersamaan langsung gugur. Target ≤ 60 detik.",
  "Kunci satu sisi sebagai depan, lalu lipat tetangganya satu per satu. Jangan membayangkan seluruh kubus sekaligus.",
  "Untuk motif berarah (segitiga, panah, garis), lihat tepi yang menempel ke kotak tetangga. Setelah dilipat, tepi itu tetap bertemu sisi yang sama.",
  "Kalau tinggal dua opsi, bandingkan urutan tiga sisi di satu pojok. Urutan searah jarum jam di jaring dan di kubus selalu sama.",
];
const TIPS_B = [
  "Mulai dari motif paling khas di kubus. Cari kotaknya di tiap jaring, lalu cek dua tetangganya.",
  "Garis yang sejajar dengan lipatan tetap sejajar dengan tepi itu setelah dilipat. Cek arah motif paling akhir.",
  "Coret dulu jaring yang menaruh dua motif kubus di posisi berseberangan, baru cek arah. Target ≤ 75 detik.",
];

export function pickDiverse<T extends { kind: string }>(r: R, xs: T[], n: number): T[] | null {
  const by = new Map<string, T[]>();
  for (const x of shuffle(r, xs)) by.set(x.kind, [...(by.get(x.kind) ?? []), x]);
  const out: T[] = [];
  while (out.length < n && [...by.values()].some((v) => v.length)) for (const k of shuffle(r, [...by.keys()])) { const v = by.get(k)!; if (v.length && out.length < n) out.push(v.shift()!); }
  return out.length === n ? out : null;
}
export function compose(parts: { svg: string; w: number; h: number }[], caption?: string) {
  const gap = 46, capH = caption ? 22 : 0, H = Math.max(...parts.map((p) => p.h)) + capH;
  let x = 0, g = "";
  parts.forEach((p, i) => {
    g += p.svg.replace("<svg ", `<svg x="${x}" y="${(H - capH - p.h) / 2}" `);
    x += p.w;
    if (i < parts.length - 1) { const y = (H - capH) / 2; g += `<path d="M${x + 10} ${y} H${x + gap - 12} M${x + gap - 19} ${y - 6} L${x + gap - 12} ${y} L${x + gap - 19} ${y + 6}" stroke="#555" stroke-width="2" fill="none"/>`; x += gap; }
  });
  if (caption) g += `<text x="${x / 2}" y="${H - 6}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#333">${caption}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} ${H}" width="${x}" height="${H}">${g}</svg>`;
}
export const tagOf = (p: Pos, side: number) => ({ depan: "Depan", atas: "Atas", samping: side > 0 ? "Kanan" : "Kiri" })[p];
export function layoutOptions(r: R, correct: string, wrongs: string[], kunci: string) {
  const ki = LET.indexOf(kunci), w = shuffle(r, wrongs), svgs: string[] = [];
  for (let i = 0, j = 0; i < 5; i++) svgs.push(i === ki ? correct : w[j++]);
  return svgs;
}

function buildA(r: R, no: number, tier: 1 | 2 | 3, kunci: string): Item {
  for (;;) {
    const shape = randomShape(r, tier === 1 ? [0, 1, 2, 3, 4, 5] : tier === 2 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [6, 7, 8, 9, 10]);
    const ds = designsA(r, tier);
    const cells: Cell[] = shape.map((s, i) => ({ ...s, design: ds[i], rot: Math.floor(r() * 4), no: i + 1 }));
    const c = fold(cells);
    let correct: View | null = null;
    for (let t = 0; t < 60 && !correct; t++) {
      const v = viewOf(rotate(c, pick(r, ROTS)), (r() < 0.5 ? 1 : -1) as 1 | -1);
      const asym = POSES.filter((p) => DESIGNS[v.faces[p].design].anchor).length;
      if (hasTwoUnique(c, v) && asym >= (tier === 1 ? 0 : tier === 2 ? 1 : 2)) correct = v;
    }
    if (!correct) continue;
    const ch = pickDiverse(r, cubeDistractors(r, c, correct, tier), 4);
    if (!ch || !ch.some((x) => x.v.side === correct!.side) || !ch.some((x) => x.v.side !== correct!.side)) continue;
    return assembleA(r, no, tier, kunci, cells, c, correct, ch.map((x) => x.v), TIPS_A[no % TIPS_A.length]);
  }
}

function buildB(r: R, no: number, tier: 1 | 2 | 3, kunci: string): Item {
  for (;;) {
    const c = cubeB(r, tier), nonBlank = NORMALS.filter((n) => c.get(key(n))!.design !== "kosong").length;
    let stim: View | null = null;
    for (let t = 0; t < 200 && !stim; t++) {
      const v = viewOf(rotate(c, pick(r, ROTS)), (r() < 0.5 ? 1 : -1) as 1 | -1);
      if (POSES.filter((p) => v.faces[p].design !== "kosong").length === Math.min(3, nonBlank)) stim = v;
    }
    if (!stim) continue;
    const shapeK = randomShape(r, tier === 1 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const cellsK = unfold(c, shapeK, Math.floor(r() * 24));
    const ch = pickDiverse(r, netDistractors(r, c, stim, tier), 4);
    if (!ch) continue;
    return assembleB(r, no, tier, kunci, c, stim, cellsK, ch.map((x) => x.cells), TIPS_B[no % TIPS_B.length]);
  }
}

export function assembleA(r: R, no: number, tier: 1 | 2 | 3, kunci: string, cells: Cell[], c: Cube, correct: View, dv: View[], tips: string, hots = false): Item {
  const num = (d: string) => `sisi ${cells.findIndex((x) => x.design === d) + 1} (${DESIGNS[d].nama})`;
  const nf = (f: Face) => `sisi ${f.cell! + 1} (${DESIGNS[f.design].nama})`;
  const order = layoutOptions(r, "K", dv.map((_, i) => String(i)), kunci);
  const views = order.map((o) => (o === "K" ? correct : dv[+o]));
  const pengecoh: Record<string, ErrKind> = {}, salah: string[] = [];
  views.forEach((v, i) => {
    if (LET[i] === kunci) return;
    const w = explain(c, v, num, "kubus"); pengecoh[LET[i]] = w.kind;
    salah.push(`Opsi ${LET[i]} (${ERR_NAME[w.kind]}): ${w.text}`);
  });
  if (views.filter((v) => consistent(c, v)).length !== 1 || !consistent(c, views[LET.indexOf(kunci)])) throw new Error("A tidak tunggal");
  const s = correct.side, f = correct.faces, pn = (p: Pos) => posName(p, s);
  const arah = POSES.filter((p) => orientPhrase(f[p])).map((p) => `${DESIGNS[f[p].design].nama} di ${pn(p)}, ${orientPhrase(f[p])}`);
  const near = hots ? nonAdjacentNote(cells, f, pn) : "";
  const langkah = [
    `1. Beri nomor kotak jaring seperti pada gambar pembahasan. Pasangan berseberangan: ${pairText(c, cells).join(", ")}. Dua sisi berseberangan tidak pernah terlihat bersamaan.`,
    `2. Opsi ${kunci} memperlihatkan depan = ${nf(f.depan)}, atas = ${nf(f.atas)}, ${pn("samping")} = ${nf(f.samping)}. Tidak ada pasangan berseberangan di antara ketiganya ✓.${near}`,
    `3. Kalau sisi ${f.depan.cell! + 1} di depan dan sisi ${f.atas.cell! + 1} di atas, sisi ${pn("samping")} memang sisi ${f.samping.cell! + 1}` + (arah.length ? `, dan arah motifnya cocok: ${arah.join("; ")} ✓.` : " ✓."),
  ];
  const tint: Record<number, string> = {}, tag: Record<number, string> = {};
  for (const p of POSES) { tint[f[p].cell!] = TINT[p]; tag[f[p].cell!] = tagOf(p, s); }
  const lab = Object.fromEntries(POSES.map((p) => [p, `${tagOf(p, s)} · ${f[p].cell! + 1}`]));
  const gp = compose([netSvg(cells, { cell: 46, numbers: true, tint, tag }), cubeSvg(correct, { size: 86, tint: TINT, label: lab })], `Berseberangan: ${pairText(c, cells).join(" · ")}`);
  return {
    id: `FIG-KUBUS-A-${String(no).padStart(2, "0")}`, no, tier, tipe: "A", ...(hots ? { hots } : {}),
    stem: "Jaring-jaring berikut dilipat menjadi kubus. Kubus manakah yang dapat dibentuk?",
    gambar: netSvg(cells, { cell: 44 }).svg, opsi: views.map((v, i) => ({ huruf: LET[i], svg: cubeSvg(v, { size: 62 }).svg })), kunci,
    pembahasan: langkah.join("\n") + "<br>" + salah.join("\n") + `\nJawaban: ${kunci}\nTips: ${tips}`,
    gambar_pembahasan: gp, pengecoh,
    buta: `Jaring:\n${netText(cells)}\nOpsi (kubus):\n` + views.map((v, i) => `${LET[i]}.\n${viewText(v)}`).join("\n"),
  };
}

export function assembleB(r: R, no: number, tier: 1 | 2 | 3, kunci: string, c: Cube, stim: View, cellsK: Cell[], dn: Cell[][], tips: string, hots = false): Item {
  const order = layoutOptions(r, "K", dn.map((_, i) => String(i)), kunci);
  const nets = order.map((o) => (o === "K" ? cellsK : dn[+o]));
  const pengecoh: Record<string, ErrKind> = {}, salah: string[] = [];
  nets.forEach((cl, i) => {
    if (LET[i] === kunci) return;
    const w = explain(fold(cl), stim, (d) => DESIGNS[d].nama, "jaring"); pengecoh[LET[i]] = w.kind;
    salah.push(`Opsi ${LET[i]} (${ERR_NAME[w.kind]}): ${w.text.charAt(0).toUpperCase() + w.text.slice(1)}`);
  });
  if (nets.filter((cl) => consistent(fold(cl), stim)).length !== 1 || !consistent(fold(nets[LET.indexOf(kunci)]), stim)) throw new Error("B tidak tunggal");
  // nomor kotak jaring kunci yang menjadi depan/atas/samping
  const dK = fold(cellsK), sig = viewSig(stim);
  const m = ROTS.find((mm) => viewSig(viewOf(rotate(dK, mm), stim.side)) === sig)!;
  const vk = viewOf(rotate(dK, m), stim.side), s = stim.side, pn = (p: Pos) => posName(p, s), f = stim.faces;
  const arah = POSES.filter((p) => orientPhrase(f[p])).map((p) => `${DESIGNS[f[p].design].nama} di ${pn(p)}, ${orientPhrase(f[p])}`);
  const langkah = [
    `1. Catat isi kubus: depan ${describe(f.depan)}, atas ${describe(f.atas)}, ${pn("samping")} ${describe(f.samping)}.`,
    `2. Pada jaring ${kunci} (nomor kotak di gambar pembahasan), jadikan sisi ${vk.faces.depan.cell! + 1} sebagai depan. Setelah dilipat, sisi ${vk.faces.atas.cell! + 1} menjadi atas dan sisi ${vk.faces.samping.cell! + 1} menjadi ${pn("samping")}.`,
    `3. ` + (arah.length ? `Arah motif ikut cocok: ${arah.join("; ")} ✓.` : `Ketiga motif bertetangga di satu pojok dengan urutan yang sama seperti di kubus ✓.`),
  ];
  const tint: Record<number, string> = {}, tag: Record<number, string> = {};
  for (const p of POSES) { tint[vk.faces[p].cell!] = TINT[p]; tag[vk.faces[p].cell!] = tagOf(p, s); }
  const lab = Object.fromEntries(POSES.map((p) => [p, `${tagOf(p, s)} · ${vk.faces[p].cell! + 1}`]));
  const gp = compose([cubeSvg(stim, { size: 86, tint: TINT, label: lab }), netSvg(cellsK, { cell: 46, numbers: true, tint, tag })]);
  return {
    id: `FIG-KUBUS-B-${String(no).padStart(2, "0")}`, no, tier, tipe: "B", ...(hots ? { hots } : {}),
    stem: "Kubus berikut dapat dibentuk dari jaring-jaring yang mana?",
    gambar: cubeSvg(stim, { size: 80 }).svg, opsi: nets.map((cl, i) => ({ huruf: LET[i], svg: netSvg(cl, { cell: 30 }).svg })), kunci,
    pembahasan: langkah.join("\n") + "<br>" + salah.join("\n") + `\nJawaban: ${kunci}\nTips: ${tips}`,
    gambar_pembahasan: gp, pengecoh,
    buta: `Kubus:\n${viewText(stim)}\nOpsi (jaring):\n` + nets.map((cl, i) => `${LET[i]}.\n${netText(cl)}`).join("\n"),
  };
}

/** Kalimat untuk sisi yang tampil bersama di kubus tapi tidak bersebelahan di jaring. */
export function nonAdjacentNote(cells: Cell[], f: Record<Pos, Face>, pn: (p: Pos) => string): string {
  const adj = (i: number, j: number) => Math.abs(cells[i].c - cells[j].c) + Math.abs(cells[i].r - cells[j].r) === 1;
  const ps: [Pos, Pos][] = [["depan", "atas"], ["depan", "samping"], ["atas", "samping"]];
  const far = ps.filter(([a, b]) => !adj(f[a].cell!, f[b].cell!));
  if (!far.length) return "";
  return " Perhatikan: " + far.map(([a, b]) => `sisi ${f[a].cell! + 1} (${pn(a)}) dan sisi ${f[b].cell! + 1} (${pn(b)})`).join(", juga ") + " tidak bersebelahan di jaring, tetapi bertemu di satu rusuk setelah dilipat.";
}
