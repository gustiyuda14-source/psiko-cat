import assert from "node:assert/strict";
import { type Fig, type Fill, type Key, type Prim, type Pt, HL, INK, RED, r1, regular, sig, textC } from "./figural-lib";
import { type Draft, type MC, type Wrong, COLOR, CORNER_NAME, DIR_NAME, SERI, SHAPE_NAME, cellFig, finish, inv, layout, pos1 } from "./k12-spasial-core";

// K12 batch 26 — deret gambar: FIG-SERI-GRID (benda berjalan di grid, 6 butir) + FIG-SERI (deret bangun, 4 butir).
// Setiap pengecoh = jawaban dengan tepat SATU benda/aturan salah (D-2); posisi awal benda dicari otomatis tanpa tabrakan.

const md = (x: number, m: number) => ((x % m) + m) % m;
const cap = (t: string) => t[0].toUpperCase() + t.slice(1);

// ── grid ─────────────────────────────────────────────────────────────────────
type RC = [number, number];
type Kind = "dot" | "ring" | "cell" | "cross" | "tri";
const KIND: Record<Kind, [string, string]> = { dot: ["Titik hitam", "●"], ring: ["Lingkaran putih", "○"], cell: ["Kotak hitam", "■"], cross: ["Tanda silang", "×"], tri: ["Segitiga hitam", "▲"] };
type Path = { cells: RC[]; desc: string; cyc: boolean };
function perimCells(n: number, o = 0): RC[] {
  const m = n - 1, out: RC[] = [];
  for (let c = 0; c < m; c++) out.push([o, o + c]);
  for (let r = 0; r < m; r++) out.push([o + r, o + m]);
  for (let c = m; c > 0; c--) out.push([o + m, o + c]);
  for (let r = m; r > 0; r--) out.push([o + r, o]);
  return out;
}
const ccw = (p: RC[]): RC[] => [p[0], ...p.slice(1).reverse()];
const arah = (cw: boolean) => (cw ? "searah" : "berlawanan arah");
const PATH = {
  perim: (n: number, cw: boolean): Path => ({ cells: cw ? perimCells(n) : ccw(perimCells(n)), desc: `di kotak pinggir ${arah(cw)} jarum jam`, cyc: true }),
  ring: (n: number, cw: boolean): Path => ({ cells: cw ? perimCells(n - 2, 1) : ccw(perimCells(n - 2, 1)), desc: `di ${n === 4 ? "4 kotak tengah" : "lingkar kotak di sekeliling pusat"} ${arah(cw)} jarum jam`, cyc: true }),
  snake: (n: number): Path => ({ cells: Array.from({ length: n * n }, (_, i): RC => { const r = Math.floor(i / n), c = i % n; return [r, r % 2 ? n - 1 - c : c]; }), desc: "zig-zag per baris (kiri ke kanan, turun, lalu kanan ke kiri)", cyc: false }),
  diag: (n: number): Path => ({ cells: [...Array.from({ length: n }, (_, i): RC => [i, i]), ...Array.from({ length: n - 2 }, (_, i): RC => [n - 2 - i, n - 2 - i])], desc: "bolak-balik di diagonal kiri atas–kanan bawah", cyc: true }),
  col: (n: number, c: number): Path => ({ cells: Array.from({ length: n }, (_, r): RC => [r, c]), desc: `turun di kolom ${c + 1}, lalu kembali ke atas setelah baris terakhir`, cyc: true }),
};
type Tok = { kind: Kind; path: Path; step: number; grow?: boolean; start?: number };
type GridSpec = { n: number; tier: 2 | 3; key: Key; toks: Tok[]; q: number; seed: number };
const F = 5; // jumlah gambar di deret (termasuk tanda tanya)

const idxAt = (tk: Tok, t: number) => tk.start! + (tk.grow ? tk.step * t + (t * (t - 1)) / 2 : tk.step * t);
const stepAt = (tk: Tok, t: number) => (tk.grow ? tk.step + t - 1 : tk.step);
const cellOf = (tk: Tok, i: number): RC | null => (tk.path.cyc ? tk.path.cells[md(i, tk.path.cells.length)] : i >= 0 && i < tk.path.cells.length ? tk.path.cells[i] : null);
const same = (a: RC | null, b: RC | null) => !!a && !!b && a[0] === b[0] && a[1] === b[1];

function gridFig(n: number, toks: Tok[], idx: number[]): Fig {
  const S = 72 / n, H = 36, ctr = ([r, c]: RC): Pt => [r1((c - (n - 1) / 2) * S), r1((r - (n - 1) / 2) * S)];
  const back: Prim[] = [], front: Prim[] = [];
  toks.forEach((tk, j) => {
    const p = cellOf(tk, idx[j]);
    assert.ok(p, "benda keluar lintasan");
    const [x, y] = ctr(p);
    if (tk.kind === "cell") back.push({ k: "poly", pts: [[x - S / 2, y - S / 2], [x + S / 2, y - S / 2], [x + S / 2, y + S / 2], [x - S / 2, y + S / 2]].map(([a, b]): Pt => [r1(a), r1(b)]), fill: "b" });
    else if (tk.kind === "dot") front.push({ k: "circ", c: [x, y], r: r1(S * 0.3), fill: "b" });
    else if (tk.kind === "ring") front.push({ k: "circ", c: [x, y], r: r1(S * 0.3), fill: "w" });
    else if (tk.kind === "tri") front.push({ k: "poly", pts: regular(3, S * 0.38).map(([a, b]): Pt => [r1(x + a), r1(y + b + S * 0.05)]), fill: "b" });
    else { const d = S * 0.27; front.push({ k: "line", a: [r1(x - d), r1(y - d)], b: [r1(x + d), r1(y + d)], w: 3 }, { k: "line", a: [r1(x - d), r1(y + d)], b: [r1(x + d), r1(y - d)], w: 3 }); }
  });
  const lines: Prim[] = Array.from({ length: n + 1 }, (_, i): Prim[] => [
    { k: "line", a: [r1(-H + i * S), -H], b: [r1(-H + i * S), H], w: 2 },
    { k: "line", a: [-H, r1(-H + i * S)], b: [H, r1(-H + i * S)], w: 2 },
  ]).flat();
  return [...back, ...lines, ...front];
}
/** Tidak ada dua benda di kotak yang sama, di semua gambar dan di keadaan pengecoh. */
const clash = (toks: Tok[], idx: number[]) => idx.some((a, i) => idx.some((b, j) => j > i && same(cellOf(toks[i], a), cellOf(toks[j], b))));

function solveStarts(sp: GridSpec) {
  const lens = sp.toks.map((t) => t.path.cells.length);
  const fixed = sp.toks.map((t) => t.start);
  const total = lens.reduce((a, b) => a * b, 1);
  for (let z = 0; z < total; z++) {
    let rest = (z + sp.seed * 7919) % total;
    const starts = lens.map((L, j) => { const v = fixed[j] ?? rest % L; rest = Math.floor(rest / L); return v; });
    const toks = sp.toks.map((t, j) => ({ ...t, start: starts[j] }));
    let ok = true;
    for (let t = 0; t < F && ok; t++) {
      const idx = toks.map((tk) => idxAt(tk, t));
      if (idx.some((i, j) => !cellOf(toks[j], i)) || clash(toks, idx)) ok = false;
    }
    // tiap benda benar-benar berpindah dari gambar ke gambar
    if (ok && toks.some((tk) => [1, 2, 3, 4].some((t) => same(cellOf(tk, idxAt(tk, t)), cellOf(tk, idxAt(tk, t - 1)))))) ok = false;
    if (ok) return toks;
    if (fixed.every((v) => v !== undefined)) break;
  }
  throw new Error("seri grid: tidak ada posisi awal tanpa tabrakan");
}

function gridItem(sp: GridSpec): Draft {
  const toks = solveStarts(sp), q = sp.q;
  const ans = toks.map((tk) => idxAt(tk, q));
  type Cand = Wrong<number[]> & { tok: number };
  const cands: Cand[][] = toks.map((tk, j) => {
    const nm = KIND[tk.kind][0], prev = idxAt(tk, q - 1), st = stepAt(tk, q), out: Cand[] = [];
    const mk = (name: string, i: number, alasan: string) => {
      const v = [...ans]; v[j] = i;
      const p = cellOf(tk, i);
      if (!p || same(p, cellOf(tk, ans[j])) || clash(toks, v)) return;
      out.push({ name: `${name}${j}`, v, isi: `${nm.toLowerCase()} di ${pos1(p)}`, alasan, tok: j });
    };
    if (tk.grow) mk("tetap", prev + st - 1, `${nm.toLowerCase()} maju ${st - 1} kotak lagi, sama seperti langkah sebelumnya, padahal langkahnya selalu bertambah 1.`);
    else if (st >= 2) mk("kurang", prev + st - 1, `${nm.toLowerCase()} hanya maju ${st - 1} kotak, padahal tiap langkah maju ${st} kotak.`);
    if (tk.path.cyc) mk("arah", prev - st, `${nm.toLowerCase()} bergerak ke arah sebaliknya.`);
    mk("diam", prev, `${nm.toLowerCase()} tidak digeser dari gambar sebelumnya.`);
    mk("lebih", prev + st + 1, `${nm.toLowerCase()} maju ${st + 1} kotak, padahal seharusnya ${st} kotak.`);
    return out;
  });
  const wrongs: Cand[] = [], seen = new Set([sig(gridFig(sp.n, toks, ans))]);
  const take = (c: Cand | undefined) => { if (!c || wrongs.length >= 4) return; const s = sig(gridFig(sp.n, toks, c.v)); if (!seen.has(s)) { seen.add(s); wrongs.push(c); } };
  if (toks.length === 2) cands.forEach((cs) => cs.slice(0, 2).forEach(take));
  for (let r = 0; wrongs.length < 4 && r < 4; r++) cands.forEach((cs) => take(cs[r]));
  assert.equal(wrongs.length, 4, "seri grid: pengecoh kurang");
  assert.ok(toks.every((_, j) => wrongs.some((w) => w.tok === j)), "seri grid: setiap benda harus diuji minimal satu pengecoh");

  const frames = Array.from({ length: F }, (_, t) => gridFig(sp.n, toks, toks.map((tk) => idxAt(tk, t))));
  const p1 = [
    `Lacak ${toks.length} benda satu per satu, jangan sekaligus. Tulis posisinya sebagai (baris, kolom).`,
    ...toks.map((tk, j) => {
      const seq = Array.from({ length: F }, (_, t) => pos1(cellOf(tk, idxAt(tk, t))!) + (t === q ? " [?]" : "")).join(" → ");
      const stepTxt = tk.grow ? `langkahnya bertambah: maju ${tk.step}, ${tk.step + 1}, ${tk.step + 2}, … kotak` : `maju ${tk.step} kotak tiap langkah`;
      return `${j + 1}. ${KIND[tk.kind][0]} bergerak ${tk.path.desc}, ${stepTxt}: ${seq}.`;
    }),
    ...(q < F - 1 ? [`Tanda tanya ada di gambar ke-${q + 1}, jadi jawaban harus cocok dengan gambar sebelum DAN sesudahnya.`] : []),
  ];
  const { opts, pembahasan } = finish({
    ans, wrongs, key: sp.key, fig: (v) => gridFig(sp.n, toks, v), p1,
    tips: (L) => `kerjakan satu benda, coret opsi, baru pindah ke benda berikutnya. ${cap(toks.map((tk, j) => `${KIND[tk.kind][0].toLowerCase()} menggugurkan opsi ${wrongs.filter((w) => w.tok === j).map((w) => L(w.name)).sort().join(" dan ")}`).join("; "))}.` +
      (toks.some((t) => t.grow) ? " Untuk langkah yang bertambah, tulis besar langkahnya (1, 2, 3, …) di atas tiap perpindahan." : "") + ` Target ≤ ${sp.tier === 3 ? 60 : 45} detik.`,
  });
  // Gambar pembahasan: deret lengkap (jawaban hijau) + satu peta lintasan bernomor per benda.
  const track = (cx: number, cy: number, tk: Tok) => {
    const g = 136 / sp.n, h = 68;
    let s = Array.from({ length: sp.n + 1 }, (_, i) => `<line x1="${r1(cx - h + i * g)}" y1="${cy - h}" x2="${r1(cx - h + i * g)}" y2="${cy + h}" stroke="${INK}" stroke-width="2"/><line x1="${cx - h}" y1="${r1(cy - h + i * g)}" x2="${cx + h}" y2="${r1(cy - h + i * g)}" stroke="${INK}" stroke-width="2"/>`).join("");
    const by = new Map<string, number[]>();
    for (let t = 0; t < F; t++) { const k = cellOf(tk, idxAt(tk, t))!.join(); by.set(k, [...(by.get(k) ?? []), t + 1]); }
    for (const [k, ts] of by) {
      const [r, c] = k.split(",").map(Number);
      s += textC(cx - h + (c + 0.5) * g, cy - h + (r + 0.5) * g + 6, ts.join(","), ts.length > 1 ? 13 : 18, ts.includes(q + 1) ? HL : RED);
    }
    return s + textC(cx, cy + h + 24, `${KIND[tk.kind][1]} ${KIND[tk.kind][0].toLowerCase()}`, 17, INK);
  };
  const xs = toks.length === 2 ? [-100, 100] : [-195, 0, 195];
  return {
    sub_type: "FIG-SERI-GRID", tier: sp.tier, key: sp.key, ...SERI,
    stemSvg: layout([frames.map((f, t) => (t === q ? null : f))]), opts, pembahasan,
    pbhSvg: layout([frames], { hl: [0, q], minW: 620, extraH: 226, extra: (y0, w) => toks.map((tk, j) => track(w / 2 + xs[j], y0 + 96, tk)).join(""), foot: [`angka = gambar ke-berapa; ${q + 1} (hijau) = jawaban`] }),
  };
}

const GRID: GridSpec[] = [
  { n: 3, tier: 2, key: "A", q: 4, seed: 1, toks: [{ kind: "cell", path: PATH.perim(3, true), step: 1 }, { kind: "ring", path: PATH.perim(3, false), step: 2 }] },
  { n: 4, tier: 2, key: "D", q: 4, seed: 2, toks: [{ kind: "dot", path: PATH.snake(4), step: 1 }, { kind: "cross", path: PATH.perim(4, false), step: 1 }] },
  // = prototipe yang disetujui pemilik (K12 prototipe #1).
  { n: 4, tier: 3, key: "C", q: 4, seed: 0, toks: [{ kind: "dot", path: PATH.perim(4, true), step: 2, start: 0 }, { kind: "ring", path: PATH.ring(4, false), step: 1, start: 0 }, { kind: "cell", path: PATH.perim(4, false), step: 1, start: 2 }] },
  { n: 5, tier: 3, key: "E", q: 4, seed: 4, toks: [{ kind: "dot", path: PATH.diag(5), step: 1 }, { kind: "cell", path: PATH.perim(5, true), step: 3 }, { kind: "ring", path: PATH.ring(5, false), step: 2 }] },
  { n: 4, tier: 3, key: "B", q: 3, seed: 5, toks: [{ kind: "tri", path: PATH.perim(4, true), step: 1, grow: true }, { kind: "dot", path: PATH.ring(4, true), step: 1 }, { kind: "cross", path: PATH.col(4, 1), step: 1 }] },
  { n: 5, tier: 3, key: "A", q: 4, seed: 6, toks: [{ kind: "ring", path: PATH.snake(5), step: 2 }, { kind: "cell", path: PATH.perim(5, false), step: 1, grow: true }, { kind: "cross", path: PATH.col(5, 2), step: 1 }] },
];

// ── deret bangun ──────────────────────────────────────────────────────────────
type BangunSpec = { tier: 2 | 3; key: Key; q: number; s0: number; ds: number; f0?: Fill; a0?: number; da?: number; k0?: number; dk?: number; picks: string[] };
type BS = { s: number; f: Fill; a?: number; k?: number };
function bangunItem(sp: BangunSpec): Draft {
  const at = (t: number): BS => ({ s: sp.s0 + sp.ds * t, f: sp.f0 ? (t % 2 ? inv(sp.f0) : sp.f0) : "w", a: sp.a0 === undefined ? undefined : md(sp.a0 + sp.da! * t, 8), k: sp.k0 === undefined ? undefined : md(sp.k0 + sp.dk! * t, 4) });
  const fig = (b: BS) => cellFig(b as MC);
  for (let t = 0; t < F; t++) assert.ok(at(t).s >= 3 && at(t).s <= 8, "deret bangun: jumlah sisi 3–8");
  const q = sp.q, A = at(q), P = at(q - 1);
  const nm = (s: number) => SHAPE_NAME[s];
  const C: Record<string, Wrong<BS>> = {
    sisiDiam: { name: "sisiDiam", v: { ...A, s: P.s }, isi: nm(P.s), alasan: `jumlah sisi tidak berubah dari gambar sebelumnya.` },
    sisiLompat: { name: "sisiLompat", v: { ...A, s: A.s + sp.ds }, isi: nm(A.s + sp.ds) ?? "", alasan: `jumlah sisi ${sp.ds > 0 ? "bertambah" : "berkurang"} 2, padahal tiap langkah hanya ${Math.abs(sp.ds)}.` },
    warna: { name: "warna", v: { ...A, f: inv(A.f) }, isi: `bangun ${COLOR(inv(A.f))}`, alasan: `warnanya tidak berganti dari gambar sebelumnya.` },
    jarumArah: { name: "jarumArah", v: { ...A, a: md(P.a! - sp.da!, 8) }, isi: `jarum ke ${DIR_NAME[md(P.a! - sp.da!, 8)]}`, alasan: `jarum diputar ke arah sebaliknya.` },
    jarumDiam: { name: "jarumDiam", v: { ...A, a: P.a }, isi: `jarum ke ${DIR_NAME[P.a ?? 0]}`, alasan: `jarum tidak diputar dari gambar sebelumnya.` },
    titikArah: { name: "titikArah", v: { ...A, k: md(P.k! - sp.dk!, 4) }, isi: `titik di ${CORNER_NAME[md(P.k! - sp.dk!, 4)]}`, alasan: `titik dipindah ke arah sebaliknya.` },
    titikDiam: { name: "titikDiam", v: { ...A, k: P.k }, isi: `titik di ${CORNER_NAME[P.k ?? 0]}`, alasan: `titik tidak dipindah dari gambar sebelumnya.` },
  };
  const wrongs = sp.picks.map((p) => C[p]);
  wrongs.forEach((w) => assert.notEqual(sig(fig(w.v)), sig(fig(A)), `deret bangun: pengecoh ${w.name} sama dengan jawaban`));
  if (wrongs.some((w) => w.name.startsWith("sisi"))) wrongs.forEach((w) => w.name.startsWith("sisi") && assert.ok(w.v.s >= 3 && w.v.s <= 8));
  const seq = <T,>(f: (b: BS) => T, show: (x: T) => string) => Array.from({ length: F }, (_, t) => show(f(at(t))) + (t === q ? " [?]" : "")).join(" → ");
  const rules: [string, string, string][] = [[`Jumlah sisi ${sp.ds > 0 ? "bertambah" : "berkurang"} ${Math.abs(sp.ds)} tiap langkah: ${seq((b) => b.s, nm)}.`, "jumlah sisi", `sisi ${sp.ds > 0 ? "+" : "−"}${Math.abs(sp.ds)} tiap langkah`]];
  if (sp.f0) rules.push([`Warna bangun berganti-ganti: ${seq((b) => b.f, COLOR)}.`, "warna", "warna berganti-ganti"]);
  if (sp.a0 !== undefined) rules.push([`Jarum di dalam berputar ${45 * Math.abs(sp.da!)}° ${sp.da! > 0 ? "searah" : "berlawanan arah"} jarum jam tiap langkah: ke ${seq((b) => b.a!, (a) => DIR_NAME[a])}.`, "arah jarum", `jarum ${45 * Math.abs(sp.da!)}° ${sp.da! > 0 ? "searah" : "berlawanan arah"} jarum jam`]);
  if (sp.k0 !== undefined) rules.push([`Titik kecil di pojok ${Math.abs(sp.dk!) === 2 ? "lompat ke pojok seberang" : `pindah 1 pojok ${sp.dk === 1 ? "searah" : "berlawanan arah"} jarum jam`} tiap langkah: ${seq((b) => b.k!, (k) => CORNER_NAME[k])}.`, "titik pojok", Math.abs(sp.dk!) === 2 ? "titik lompat ke pojok seberang" : `titik pindah 1 pojok ${sp.dk === 1 ? "searah" : "berlawanan arah"} jarum jam`]);
  const frames = Array.from({ length: F }, (_, t) => fig(at(t)));
  const p1 = [`Ada ${rules.length} aturan yang berjalan bersamaan. Cek satu per satu dari gambar 1 sampai ${F}.`, ...rules.map((r, i) => `${i + 1}. ${r[0]}`),
    ...(q < F - 1 ? [`Tanda tanya ada di gambar ke-${q + 1}, jadi jawaban harus cocok dengan gambar sebelum DAN sesudahnya.`] : [])];
  const { opts, pembahasan } = finish({
    ans: A, wrongs, key: sp.key, fig, p1,
    tips: () => `hitung sisi dengan jari mulai dari pojok atas supaya tidak terhitung dua kali, lalu cek ${rules.slice(1).map((r) => r[1]).join(" dan ") || "aturan berikutnya"}. Setiap aturan langsung menggugurkan opsi yang melanggarnya. Target ≤ ${sp.tier === 3 ? 50 : 40} detik.`,
  });
  return {
    sub_type: "FIG-SERI", tier: sp.tier, key: sp.key, ...SERI,
    stemSvg: layout([frames.map((f, t) => (t === q ? null : f))]), opts, pembahasan,
    pbhSvg: layout([frames], { hl: [0, q], minW: 620, foot: rules.map((r, i) => `${i + 1}) ${r[2]}`) }),
  };
}
const BANGUN: BangunSpec[] = [
  { tier: 2, key: "E", q: 3, s0: 4, ds: 1, a0: 0, da: 2, picks: ["sisiDiam", "sisiLompat", "jarumArah", "jarumDiam"] },
  { tier: 2, key: "B", q: 4, s0: 8, ds: -1, k0: 0, dk: -1, picks: ["sisiDiam", "sisiLompat", "titikArah", "titikDiam"] },
  { tier: 3, key: "D", q: 4, s0: 3, ds: 1, f0: "w", k0: 1, dk: 1, picks: ["sisiDiam", "warna", "titikArah", "titikDiam"] },
  { tier: 3, key: "C", q: 2, s0: 4, ds: 1, f0: "b", a0: 2, da: -1, k0: 0, dk: 2, picks: ["sisiLompat", "warna", "jarumArah", "titikDiam"] },
];

export const SERI_ITEMS: Draft[] = [...GRID.map(gridItem), ...BANGUN.map(bangunItem)];
