/**
 * generate-soal-pola-gambar.ts — deterministic generator for "pola gambar" items (soal.json shape).
 *
 *   npx tsx scripts/generate-soal-pola-gambar.ts --check                      # assert-based self check (300 seeds x family)
 *   npx tsx scripts/generate-soal-pola-gambar.ts [--seed 7] [--start-id 901] [--out DIR]
 *        -> DIR/sample-pola.json, DIR/preview-pola.html, DIR/pola-svg/<family>.svg
 *
 * Model: every figure is a small state object -> rendered to SVG. Each family is a rule
 * f(state_t) -> state_{t+1} (or a row operator for the 3x3 matrix). The answer comes from
 * the rule; each distractor breaks exactly ONE rule layer. Hard guarantees (asserted):
 *   - 5 options visually distinct (canonical state keys AND rendered SVG strings),
 *   - every distractor differs from the answer in exactly one layer,
 *   - uniqueness: every alternative rule (brute-forced parameter grid) that reproduces the
 *     visible stimulus predicts the same answer, so no distractor can also satisfy "the rule",
 *   - every active layer is observable in the stimulus.
 * No dependencies beyond node stdlib.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

// ---------------- rng ----------------
type Rng = () => number;
function mulberry32(seed: number): Rng {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const one = <T>(r: Rng, a: readonly T[]): T => a[Math.floor(r() * a.length)];
function shuffle<T>(r: Rng, a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
class Reroll extends Error {}
const need = (c: boolean, m: string) => { if (!c) throw new Reroll(m); };
const mod = (a: number, m: number) => ((a % m) + m) % m;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
const n1 = (x: number) => String(Math.round(x * 10) / 10);

// ---------------- shapes ----------------
type Shape = "tri" | "sq" | "pent" | "hex" | "cir" | "dia";
const SHAPES: Shape[] = ["tri", "sq", "pent", "hex", "cir", "dia"];
const SYM: Record<Shape, number> = { tri: 120, sq: 90, pent: 72, hex: 60, cir: 1, dia: 180 };
const NAME: Record<Shape, string> = { tri: "segitiga", sq: "persegi", pent: "segilima", hex: "segienam", cir: "lingkaran", dia: "belah ketupat" };
const POS = ["atas", "kanan atas", "kanan", "kanan bawah", "bawah", "kiri bawah", "kiri", "kiri atas"];
const canon = (rot: number, s: Shape) => (s === "cir" ? 0 : mod(rot, SYM[s]));
const R_OUT = 38, R_IN = 15; // R_IN < inradius of every outer shape (triangle: 19)

function points(s: Shape, R: number): string {
  if (s === "dia") return `0,${-R} ${n1(0.68 * R)},0 0,${R} ${n1(-0.68 * R)},0`;
  const n = { tri: 3, sq: 4, pent: 5, hex: 6 }[s as "tri"];
  const off = s === "sq" ? 45 : 0; // flat-top square
  return Array.from({ length: n }, (_, i) => {
    const a = ((off + (i * 360) / n - 90) * Math.PI) / 180;
    return `${n1(R * Math.cos(a))},${n1(R * Math.sin(a))}`;
  }).join(" ");
}
const DEFS = SHAPES.map((s) =>
  s === "cir" ? `<circle id="o-cir" r="${R_OUT}"/><circle id="i-cir" r="${R_IN}"/>`
    : `<polygon id="o-${s}" points="${points(s, R_OUT)}"/><polygon id="i-${s}" points="${points(s, R_IN)}"/>`).join("");

function wrap(body: string, h: number): string {
  return `<svg viewBox="0 0 850 ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>` +
    `<style>.box{fill:none;stroke:#333;stroke-width:4}.solid{fill:black;stroke:none}.outline{fill:white;stroke:black;stroke-width:4;stroke-linejoin:round}` +
    `.text-label{font-family:sans-serif;font-size:24px;font-weight:bold;text-anchor:middle}.text-symbol{font-family:sans-serif;font-size:50px;font-weight:bold;text-anchor:middle}</style>` +
    `<defs>${DEFS}</defs>${body}</svg>`;
}

// ---------------- figure state ----------------
interface Fig { outer: Shape; inner: Shape | null; outerSolid: boolean; rot: number; sat: number; count: number }
const figKey = (f: Fig) => JSON.stringify([f.outer, f.inner, f.outerSolid, canon(f.rot, f.outer),
  f.inner ? canon(f.rot, f.inner) : null, f.count ? mod(f.sat, 8) : null, f.count]);
/** number of rule layers in which two states differ (raw values, not visual) */
function figDiff(a: Fig, b: Fig): number {
  return [a.outer + a.inner !== b.outer + b.inner, a.outerSolid !== b.outerSolid, mod(a.rot, 360) !== mod(b.rot, 360),
    mod(a.sat, 8) !== mod(b.sat, 8), a.count !== b.count].filter(Boolean).length;
}
function dots(pos: number, n: number): string {
  const a = (mod(pos, 8) * Math.PI) / 4, cx = 50 * Math.sin(a), cy = -50 * Math.cos(a);
  let s = "";
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * 10;
    s += `<circle class="solid" cx="${n1(cx + o * Math.cos(a))}" cy="${n1(cy + o * Math.sin(a))}" r="4"/>`;
  }
  return s;
}
function drawFig(f: Fig): string {
  let s = `<use href="#o-${f.outer}" class="${f.outerSolid ? "solid" : "outline"}" transform="rotate(${canon(f.rot, f.outer)})"/>`;
  if (f.inner) s += `<use href="#i-${f.inner}" class="${f.outerSolid ? "outline" : "solid"}" transform="rotate(${canon(f.rot, f.inner)})"/>`;
  return s + dots(f.sat, f.count);
}
const fill = (solid: boolean) => (solid ? "solid" : "outline");
function describe(f: Fig): string {
  const core = f.inner ? `${NAME[f.outer]} ${fill(f.outerSolid)} di luar dengan ${NAME[f.inner]} ${fill(!f.outerSolid)} di dalam` : `${NAME[f.outer]} ${fill(f.outerSolid)}`;
  return `${core}, ${f.count} titik di ${POS[mod(f.sat, 8)]}`;
}
const dirName = (sign: number) => (sign > 0 ? "searah jarum jam" : "berlawanan arah jarum jam");
const stepDesc = (k: number) => { const s = mod(k, 8) > 4 ? mod(k, 8) - 8 : mod(k, 8); return `${Math.abs(s) * 45}° ${dirName(s)}`; };

// ---------------- layouts (match scripts/inject-spasial.js) ----------------
const BOX = (h: number) => `<rect class="box" x="${-h}" y="${-h}" width="${2 * h}" height="${2 * h}" rx="10"/>`;
const Q = `<text y="15" class="text-symbol">?</text>`;
function rowLayout(frames: string[], analog: boolean): string {
  const xs = [150, 350, 550, 750];
  return frames.map((f, i) => `<g transform="translate(${xs[i]},100)">${BOX(60)}${f}</g>` +
    (i < 3 ? `<text x="${xs[i] + 100}" y="115" class="text-symbol">${i === 1 && analog ? "::" : "→"}</text>` : "")).join("");
}
function optLayout(opts: string[], y: number, h: number): string {
  const xs = [85, 255, 425, 595, 765];
  return opts.map((o, i) => `<g transform="translate(${xs[i]},${y})">${BOX(h)}${o}<text y="${h + 30}" class="text-label">${"ABCDE"[i]}</text></g>`).join("");
}

// ---------------- families ----------------
interface Opt { key: string; svg: string; why: string; diff: number }
interface Built { family: string; instruksi: string; layout: (opts: string[]) => string; ans: Opt; cands: Opt[]; p1: string; minCands: number }
const figOpt = (ans: Fig) => (f: Fig, why: string): Opt => ({ key: figKey(f), svg: drawFig(f), why, diff: figDiff(f, ans) });
const SEQ_TXT = "Pilihlah satu gambar untuk melengkapi deret di bawah ini.";

/** (a) sequence: shape rotates theta per step + solid/outline alternates + dot count +1 */
function famSeq(r: Rng): Built {
  // only legible (shape, step) pairs; hexagon/45deg etc. rotate "invisibly" for students
  const [shape, steps] = one(r, [["tri", [90]], ["dia", [45, 90]], ["pent", [90, 180]]] as [Shape, number[]][]);
  const th = one(r, steps) * one(r, [1, -1]), r0 = one(r, [0, 90, 180, 270]), s0 = r() < 0.5;
  const frame = (t: number, P = { th, alt: true, dc: 1 }): Fig =>
    ({ outer: shape, inner: null, outerSolid: P.alt && t % 2 ? !s0 : s0, rot: r0 + P.th * t, sat: 0, count: 1 + P.dc * t });
  const stim = [0, 1, 2].map((t) => figKey(frame(t))).join("|"), ans = frame(3);
  // frames fix th mod SYM[shape] and the answer only depends on th mod SYM, so a 45deg grid is exhaustive here
  for (const th2 of [0, 45, 90, 135, 180, 225, 270, 315]) for (const alt of [true, false]) for (const dc of [-1, 0, 1, 2]) {
    const P = { th: th2, alt, dc };
    if ([0, 1, 2].map((t) => figKey(frame(t, P))).join("|") === stim) need(figKey(frame(3, P)) === figKey(ans), "ambiguous seq");
  }
  for (const P of [{ th: 0, alt: true, dc: 1 }, { th, alt: false, dc: 1 }, { th, alt: true, dc: 0 }])
    need([0, 1, 2].map((t) => figKey(frame(t, P))).join("|") !== stim, "layer invisible");
  const o = figOpt(ans), deg = Math.abs(th);
  return {
    family: "sequence-rotation", instruksi: SEQ_TXT, minCands: 4,
    layout: (opts) => wrap(rowLayout([0, 1, 2].map((t) => drawFig(frame(t))).concat(Q), false) + optLayout(opts, 300, 60), 450),
    ans: o(ans, ""),
    cands: [
      o({ ...ans, rot: ans.rot - th }, "gugur karena bangun berhenti berputar (orientasinya sama dengan gambar ketiga)"),
      o({ ...ans, outerSolid: !ans.outerSolid }, `gugur karena warnanya tidak berselang-seling (seharusnya ${fill(ans.outerSolid)})`),
      o({ ...ans, count: ans.count - 1 }, `gugur karena jumlah titiknya ${ans.count - 1}, seharusnya ${ans.count}`),
      o({ ...ans, rot: ans.rot + th }, `gugur karena rotasinya kelebihan satu langkah (${deg}°)`),
      o({ ...ans, rot: r0 - 3 * th }, "gugur karena arah putarannya terbalik"),
      o({ ...ans, count: ans.count + 1 }, `gugur karena jumlah titiknya ${ans.count + 1}, kelebihan satu`),
    ],
    p1: `Untuk melengkapi deret ini, terapkan tiga aturan sekaligus: ${NAME[shape]} berputar ${deg}° ${dirName(th)} pada setiap langkah, ` +
      `warnanya berselang-seling solid dan outline, dan jumlah titik satelit di bagian atas bertambah satu (1, 2, 3, ...). ` +
      `Maka gambar keempat adalah ${NAME[shape]} ${fill(ans.outerSolid)} yang sudah berputar total ${3 * deg}° dari gambar pertama dengan ${ans.count} titik.`,
  };
}

/** (b) satellite orbit: dots orbit k*45deg per step, inner/outer swap each step, count +1 */
function famOrbit(r: Rng): Built {
  const [a, b] = shuffle(r, ["tri", "sq", "pent", "hex", "cir", "dia"] as Shape[]);
  const k = one(r, [1, 2, 3]) * one(r, [1, -1]), p0 = Math.floor(r() * 8), s0 = r() < 0.5;
  const frame = (t: number, P = { k, alt: true, dc: 1 }): Fig => {
    const sw = P.alt && t % 2 === 1;
    return { outer: sw ? b : a, inner: sw ? a : b, outerSolid: s0, rot: 0, sat: p0 + P.k * t, count: 1 + P.dc * t };
  };
  const stim = [0, 1, 2].map((t) => figKey(frame(t))).join("|"), ans = frame(3);
  for (let k2 = 0; k2 < 8; k2++) for (const alt of [true, false]) for (const dc of [-1, 0, 1, 2]) {
    const P = { k: k2, alt, dc };
    if ([0, 1, 2].map((t) => figKey(frame(t, P))).join("|") === stim) need(figKey(frame(3, P)) === figKey(ans), "ambiguous orbit");
  }
  const o = figOpt(ans), sw = (f: Fig): Fig => ({ ...f, outer: f.inner!, inner: f.outer });
  return {
    family: "satellite-orbit", instruksi: SEQ_TXT, minCands: 4,
    layout: (opts) => wrap(rowLayout([0, 1, 2].map((t) => drawFig(frame(t))).concat(Q), false) + optLayout(opts, 300, 60), 450),
    ans: o(ans, ""),
    cands: [
      o({ ...ans, sat: ans.sat - k }, "gugur karena titik satelit tidak berpindah dari posisi gambar ketiga"),
      o(sw(ans), "gugur karena bangun luar dan dalam tidak ditukar"),
      o({ ...ans, count: ans.count - 1 }, `gugur karena jumlah titiknya ${ans.count - 1}, seharusnya ${ans.count}`),
      o({ ...ans, sat: ans.sat - 2 * k }, "gugur karena satelit bergerak berlawanan arah orbit"),
      o({ ...ans, sat: ans.sat + k }, "gugur karena satelit melompat terlalu jauh"),
      o({ ...ans, count: ans.count + 1 }, `gugur karena jumlah titiknya ${ans.count + 1}, kelebihan satu`),
    ],
    p1: `Deret ini memakai tiga aturan: bangun luar dan bangun dalam bertukar posisi pada setiap langkah (topologi terbalik), ` +
      `titik satelit mengorbit ${stepDesc(k)} setiap langkah (${[0, 1, 2].map((t) => POS[mod(p0 + k * t, 8)]).join(" → ")}), dan jumlah titiknya bertambah satu. ` +
      `Maka gambar keempat adalah ${describe(ans)}.`,
  };
}

/** (e) analogy A:B = C:? with a transform composed of 3-4 layers */
interface T { swap: boolean; inv: boolean; th: number; k: number; dc: number }
const applyT = (t: T, f: Fig): Fig => ({ outer: t.swap ? f.inner! : f.outer, inner: t.swap ? f.outer : f.inner,
  outerSolid: t.inv ? !f.outerSolid : f.outerSolid, rot: f.rot + t.th, sat: f.sat + t.k, count: f.count + t.dc });
const NO: Record<keyof T, T[keyof T]> = { swap: false, inv: false, th: 0, k: 0, dc: 0 };
function famAnalogy(r: Rng): Built {
  const layers = shuffle(r, ["swap", "inv", "th", "k", "dc"] as (keyof T)[]).slice(0, one(r, [3, 4]));
  const t: T = { swap: layers.includes("swap"), inv: layers.includes("inv"), th: layers.includes("th") ? one(r, [90, 180, 270]) : 0,
    k: layers.includes("k") ? one(r, [1, 2, 3, 5, 6, 7]) : 0, dc: layers.includes("dc") ? 1 : 0 };
  const pair = () => shuffle(r, ["tri", "sq", "pent", "hex", "dia", "cir"] as Shape[]).slice(0, 2);
  const [ao, ai] = pair(); const [co, ci] = pair();
  need(co !== ao || ci !== ai, "same pair");
  const A: Fig = { outer: ao, inner: ai, outerSolid: r() < 0.5, rot: 0, sat: Math.floor(r() * 8), count: one(r, [1, 2]) };
  const C: Fig = { outer: co, inner: ci, outerSolid: r() < 0.5, rot: 0, sat: Math.floor(r() * 8), count: one(r, [1, 2, 3]) };
  const B = applyT(t, A), ans = applyT(t, C);
  // A:B only fixes the rotation modulo lcm(SYM of A's shapes); C's shapes must not see the leftover freedom
  const L = lcm(SYM[ao], SYM[ai]);
  need(L % SYM[co] === 0 && L % SYM[ci] === 0, "rotation underdetermined for C");
  for (const swap of [false, true]) for (const inv of [false, true]) for (let th = 0; th < 360; th += 45) for (let k = 0; k < 8; k++) for (const dc of [-1, 0, 1, 2]) {
    const t2 = { swap, inv, th, k, dc };
    if (figKey(applyT(t2, A)) === figKey(B)) need(figKey(applyT(t2, C)) === figKey(ans), "ambiguous analogy");
  }
  const o = figOpt(ans);
  const LN: Record<keyof T, [string, string]> = {
    swap: ["bangun luar dan dalam bertukar posisi (topologi terbalik)", "gugur karena tidak menukar bangun luar dan dalam"],
    inv: ["warna solid/outline dibalik (inversi soliditas)", "gugur karena tidak membalik warna solid/outline"],
    th: [`seluruh bangun berputar ${stepDesc(t.th / 45)}`, "gugur karena bangunnya tidak diputar"],
    k: [`titik satelit berpindah ${stepDesc(t.k)}`, "gugur karena titik satelit tidak berpindah posisi"],
    dc: ["jumlah titik bertambah satu", `gugur karena jumlah titiknya tetap ${C.count}`],
  };
  const omit = layers.map((l) => {
    const f = applyT({ ...t, [l]: NO[l] }, C);
    need(figKey(applyT({ ...t, [l]: NO[l] }, A)) !== figKey(B), "layer invisible in A:B"); // observable in the example
    return o(f, LN[l][1]);
  });
  need(new Set(omit.map((x) => x.key)).size === omit.length && !omit.some((x) => x.key === figKey(ans)), "omission not visible on C");
  const extra = [
    t.th ? o(applyT({ ...t, th: -t.th }, C), "gugur karena arah putarannya terbalik") : null,
    t.k ? o(applyT({ ...t, k: -t.k }, C), "gugur karena satelit bergerak ke arah sebaliknya") : null,
    t.dc ? o(applyT({ ...t, dc: 2 }, C), `gugur karena jumlah titiknya ${C.count + 2}, kelebihan satu`) : null,
    o({ ...ans, count: ans.count + 1 }, `gugur karena jumlah titiknya ${ans.count + 1}, kelebihan satu`),
  ].filter((x): x is Opt => x !== null);
  return {
    family: "analogy", instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.", minCands: 4,
    layout: (opts) => wrap(rowLayout([drawFig(A), drawFig(B), drawFig(C), Q], true) + optLayout(opts, 300, 60), 450),
    ans: o(ans, ""), cands: [...omit, ...extra],
    p1: `Dari pasangan pertama terlihat ${layers.length} aturan yang bekerja bersamaan: ${layers.map((l) => LN[l][0]).join("; ")}. ` +
      `Terapkan aturan yang sama pada gambar ketiga (${describe(C)}), sehingga hasilnya ${describe(ans)}.`,
  };
}

/** (c) 3x3 matrix: col3 = col1 (op) col2, op = OR (overlay) or XOR (overlap cancels) */
const PRIM = ["dTL", "dTR", "dBL", "dBR", "dC", "lH", "lV", "lD1", "lD2"] as const;
type Prim = (typeof PRIM)[number];
const PNAME: Record<Prim, string> = { dTL: "titik kiri atas", dTR: "titik kanan atas", dBL: "titik kiri bawah", dBR: "titik kanan bawah",
  dC: "titik tengah", lH: "garis mendatar", lV: "garis tegak", lD1: "diagonal turun (\\)", lD2: "diagonal naik (/)" };
const LINE: Partial<Record<Prim, string>> = { lH: "-36,0,36,0", lV: "0,-36,0,36", lD1: "-36,-36,36,36", lD2: "36,-36,-36,36" };
const DOT: Partial<Record<Prim, [number, number]>> = { dTL: [-22, -22], dTR: [22, -22], dBL: [-22, 22], dBR: [22, 22], dC: [0, 0] };
const setKey = (s: Set<Prim>) => PRIM.filter((p) => s.has(p)).join(",");
function drawCell(s: Set<Prim>): string {
  const ps = PRIM.filter((p) => s.has(p));
  return ps.filter((p) => LINE[p]).map((p) => { const [x1, y1, x2, y2] = LINE[p]!.split(","); return `<line class="outline" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join("") +
    ps.filter((p) => DOT[p]).map((p) => `<circle class="solid" cx="${DOT[p]![0]}" cy="${DOT[p]![1]}" r="7"/>`).join("");
}
type Op = (a: Set<Prim>, b: Set<Prim>) => Set<Prim>;
const OPS: Record<string, Op> = {
  OR: (a, b) => new Set([...a, ...b]), XOR: (a, b) => new Set([...a, ...b].filter((p) => a.has(p) !== b.has(p))),
  AND: (a, b) => new Set([...a].filter((p) => b.has(p))), AminB: (a, b) => new Set([...a].filter((p) => !b.has(p))),
  BminA: (a, b) => new Set([...b].filter((p) => !a.has(p))), A: (a) => new Set(a), B: (_a, b) => new Set(b),
};
function famMatrix(r: Rng): Built {
  const op = one(r, ["OR", "XOR"]), other = op === "OR" ? "XOR" : "OR";
  const rows = [0, 1, 2].map(() => { const [a, b, x] = shuffle(r, [...PRIM]); return { a, b, x, A: new Set<Prim>([a, x]), B: new Set<Prim>([b, x]) }; });
  need(new Set(rows.map((w) => w.x)).size === 3, "repeat overlap");
  const ansSet = OPS[op](rows[2].A, rows[2].B);
  for (const [name, f] of Object.entries(OPS))
    if (rows.slice(0, 2).every((w) => setKey(f(w.A, w.B)) === setKey(OPS[op](w.A, w.B)))) need(setKey(f(rows[2].A, rows[2].B)) === setKey(ansSet), `ambiguous ${name}`);
  const so = (s: Set<Prim>, why: string): Opt => ({ key: setKey(s), svg: drawCell(s), why, diff: OPS.XOR(s, ansSet).size });
  const w = rows[2], spare = shuffle(r, PRIM.filter((p) => !w.A.has(p) && !w.B.has(p)));
  const without = (p: Prim) => new Set([...ansSet].filter((q) => q !== p));
  const cell = (s: Set<Prim> | null) => (s ? drawCell(s) : Q);
  const grid = rows.flatMap((x, i) => [x.A, x.B, i < 2 ? OPS[op](x.A, x.B) : null]);
  const names = (s: Set<Prim>) => PRIM.filter((p) => s.has(p)).map((p) => PNAME[p]).join(", ");
  return {
    family: "matrix-overlay", instruksi: "Pilihlah satu gambar untuk melengkapi pola di bawah ini.", minCands: 4,
    layout: (opts) => wrap(grid.map((s, i) => `<g transform="translate(${325 + (i % 3) * 100},${60 + Math.floor(i / 3) * 100})">${BOX(48)}${cell(s)}</g>`).join("") +
      optLayout(opts, 440, 48), 530),
    ans: so(ansSet, ""),
    cands: [
      so(OPS[other](w.A, w.B), op === "OR" ? `gugur karena ${PNAME[w.x]} (milik kolom 1 dan 2) ikut dihapus, padahal pada baris 1–2 elemen bersama tetap muncul`
        : `gugur karena ${PNAME[w.x]} (milik kolom 1 dan 2) masih digambar, padahal pada baris 1–2 elemen bersama saling menghapus`),
      so(without(w.a), `gugur karena kehilangan ${PNAME[w.a]} dari kolom 1`),
      so(without(w.b), `gugur karena kehilangan ${PNAME[w.b]} dari kolom 2`),
      so(new Set([...ansSet, spare[0]]), `gugur karena menambahkan ${PNAME[spare[0]]} yang tidak ada di kolom 1 maupun kolom 2`),
      so(new Set([...ansSet, spare[1]]), `gugur karena menambahkan ${PNAME[spare[1]]} yang tidak ada di kolom 1 maupun kolom 2`),
    ],
    p1: `Pada setiap baris, kolom ketiga adalah hasil ${op === "OR" ? "penggabungan (overlay) kolom 1 dan kolom 2: semua elemen kedua gambar muncul, elemen yang sama cukup digambar sekali"
      : "penggabungan kolom 1 dan kolom 2 yang saling menghapus: elemen yang ada di kedua gambar hilang, elemen yang hanya ada di salah satunya tetap muncul"}. ` +
      `Baris ketiga: kolom 1 (${names(w.A)}) dan kolom 2 (${names(w.B)}) menghasilkan ${names(ansSet)}.`,
  };
}

const FAMILIES: Record<string, (r: Rng) => Built> = {
  "sequence-rotation": famSeq, "satellite-orbit": famOrbit, "matrix-overlay": famMatrix, analogy: famAnalogy,
};

// ---------------- assembly ----------------
interface Item { id: number; aspek: string; tipe: "pola_gambar"; ganda: false; instruksi: string; gambar: string;
  pilihan: Record<string, string>; kunci: string[]; pembahasan: string; family: string }
function assemble(b: Built, r: Rng, id: number): Item {
  const seen = new Set([b.ans.key]), picked: Opt[] = [];
  for (const c of b.cands) if (picked.length < 4 && !seen.has(c.key)) { seen.add(c.key); picked.push(c); }
  need(picked.length === 4, "not enough distinct distractors");
  const opts = shuffle(r, [b.ans, ...picked]), L = "ABCDE", ai = opts.indexOf(b.ans);
  // hard invariants (bugs, not rerolls)
  assert.equal(new Set(opts.map((o) => o.key)).size, 5, "option states not distinct");
  assert.equal(new Set(opts.map((o) => o.svg)).size, 5, "option SVGs not distinct");
  for (const o of picked) assert.equal(o.diff, 1, `distractor breaks ${o.diff} layers: ${o.why}`);
  const p2 = opts.map((o, i) => (o === b.ans ? "" : `Opsi ${L[i]} ${o.why}`)).filter(Boolean).join("; ") +
    `. Maka, satu-satunya gambar yang konsisten adalah Opsi ${L[ai]}.`;
  const gambar = b.layout(opts.map((o) => o.svg));
  return { id, aspek: "logis", tipe: "pola_gambar", ganda: false, instruksi: b.instruksi, gambar,
    pilihan: { a: "a", b: "b", c: "c", d: "d", e: "e" }, kunci: ["abcde"[ai]], pembahasan: `${b.p1}<br>${p2}`, family: b.family };
}
function generate(family: string, seed: number, id: number): Item {
  const r = mulberry32(seed * 7919 + family.length);
  for (let i = 0; i < 500; i++) {
    try { return assemble(FAMILIES[family](r), r, id); } catch (e) { if (!(e instanceof Reroll)) throw e; }
  }
  throw new Error(`${family}: no valid item for seed ${seed}`);
}

// ---------------- check ----------------
function check(): void {
  assert.equal(canon(90, "sq"), 0); assert.equal(canon(120, "tri"), 0); assert.equal(canon(90, "pent"), 18); assert.equal(canon(45, "cir"), 0);
  assert.equal(figDiff({ outer: "sq", inner: "tri", outerSolid: true, rot: 0, sat: 0, count: 1 }, { outer: "tri", inner: "sq", outerSolid: true, rot: 360, sat: 8, count: 1 }), 1);
  const s = (...p: Prim[]) => new Set<Prim>(p);
  assert.equal(setKey(OPS.OR(s("dTL", "lH"), s("lH", "dC"))), "dTL,dC,lH");
  assert.equal(setKey(OPS.XOR(s("dTL", "lH"), s("lH", "dC"))), "dTL,dC");
  for (const fam of Object.keys(FAMILIES)) {
    const letters = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) {
      const it = generate(fam, seed, seed);
      letters.add(it.kunci[0]);
      assert.ok(it.gambar.startsWith("<svg ") && it.gambar.endsWith("</svg>"));
      assert.ok(!/NaN|undefined|<script|foreignObject|on\w+=/.test(it.gambar), "unsafe/broken svg");
      for (const l of "ABCDE") assert.ok(it.gambar.includes(`class="text-label">${l}</text>`));
      const [p1, p2, ...rest] = it.pembahasan.split("<br>");
      assert.ok(p1 && p2 && rest.length === 0, "2-paragraph rule");
      for (const l of "ABCDE") assert.ok(p2.includes(`Opsi ${l}`), `p2 misses ${l}`);
      assert.deepEqual(generate(fam, seed, seed), it, "not deterministic");
    }
    assert.equal(letters.size, 5, `${fam}: answer letter never varies`);
    console.log(`ok ${fam}: 300 seeds, keys spread over ${[...letters].sort().join("")}`);
  }
  console.log("check passed");
}

// ---------------- cli ----------------
const arg = (n: string, d: string) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
if (process.argv.includes("--check")) check();
else {
  const out = arg("--out", dirname(process.argv[1])), seed = Number(arg("--seed", "7")), id0 = Number(arg("--start-id", "901"));
  const items = Object.keys(FAMILIES).map((f, i) => generate(f, seed, id0 + i));
  mkdirSync(join(out, "pola-svg"), { recursive: true });
  for (const it of items) writeFileSync(join(out, "pola-svg", `${it.family}.svg`), it.gambar);
  writeFileSync(join(out, "sample-pola.json"), JSON.stringify(items, null, 2));
  writeFileSync(join(out, "preview-pola.html"), `<!doctype html><meta charset="utf-8"><title>Preview Pola Gambar</title>` +
    `<style>body{font-family:sans-serif;max-width:900px;margin:24px auto;padding:0 16px;background:#fff;color:#111}section{border-bottom:1px solid #ccc;padding:16px 0}svg{width:100%;height:auto}</style>` +
    items.map((it) => `<section><h2>#${it.id} — ${it.family}</h2><p>${it.instruksi}</p>${it.gambar}<p><b>Kunci: ${it.kunci[0].toUpperCase()}</b></p><p>${it.pembahasan.replace("<br>", "</p><p>")}</p></section>`).join(""));
  console.log(`wrote ${items.length} items to ${out}`);
}
