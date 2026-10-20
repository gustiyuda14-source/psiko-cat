// Butir HOTS jaring-jaring kubus (no 31–50). Butir 1–30 tidak disentuh.
// Aturan simultan: 6 sisi bermotif (5 berarah, selalu ada huruf L) · jaring sulit (2-3-1, 2-2-2, 3-3)
// · pengecoh nyaris benar (tepat satu selisih; "berseberangan" maks 1 per butir)
// · tipe A: kubus kunci memperlihatkan sisi yang tidak bersebelahan di jaring.
import { Cube, Cell, View, Pos, NORMALS, ROTS, DESIGNS, fold, unfold, rotate, viewOf, viewSig, consistent, opposite, key, neg, mirrorCube } from "./kubus-core";
import { explain, ErrKind } from "./kubus-explain";
import { R, rng, pick, shuffle, randomShape, SYM, POSES, hasTwoUnique, frameAt, assembleA, assembleB, nonAdjacentNote, Item } from "./kubus-items";

const HARD = [6, 7, 8, 9, 10];
const ASYM_H = ["diagonal", "pojok", "titik2", "segitiga", "panah", "garis", "setengah"];
const TIPS_HA = [
  "Opsi salah di soal HOTS biasanya hanya beda satu detail. Tetapkan dua sisi sebagai jangkar (depan dan atas), lalu cek sisi ketiga dan arah ketiga motif satu per satu.",
  "Untuk huruf L, cek dua kakinya sekaligus. Kalau kaki panjang cocok tapi kaki pendek ke arah sebaliknya, motifnya tercermin.",
  "Sisi yang tidak bersebelahan di jaring bisa bertemu setelah dilipat. Lipat bertahap dari sisi jangkar, jangan menebak dari jarak di jaring. Target ≤ 90 detik.",
];
const TIPS_HB = [
  "Kunci dua motif kubus sebagai jangkar, cari keduanya di tiap jaring, lalu lipat bertahap. Opsi salah hanya beda satu detail, jadi cek arah motif paling akhir.",
  "Untuk huruf L, lihat kaki pendeknya. Kaki panjang ke arah benar belum cukup, karena cermin L tetap punya kaki panjang ke arah yang sama.",
  "Jaring 2-2-2 dan 3-3 sulit dibayangkan sekaligus. Lipat dua kotak dulu, baru kotak ketiga. Target ≤ 90 detik.",
];

const designsH = (r: R) => shuffle(r, ["siku", ...shuffle(r, ASYM_H).slice(0, 4), pick(r, SYM)]);
const sikuVisible = (v: View) => POSES.some((p) => v.faces[p].design === "siku");

/** Pilih 4 pengecoh: ≥1 terputar, ≥1 tertukar, tercermin bila ada, "seberang" maks 1. */
function choose4<T extends { kind: ErrKind }>(r: R, pool: T[], ok: (xs: T[]) => boolean): T[] | null {
  for (let t = 0; t < 200; t++) {
    const by = (k: ErrKind) => shuffle(r, pool.filter((x) => x.kind === k));
    const out: T[] = [];
    for (const k of ["tercermin", "terputar", "tertukar"] as ErrKind[]) { const x = by(k)[0]; if (x) out.push(x); }
    const rest = shuffle(r, pool.filter((x) => !out.includes(x) && x.kind !== "seberang"));
    while (out.length < 4 && rest.length) out.push(rest.shift()!);
    if (out.length < 4) { const s = by("seberang")[0]; if (s) out.push(s); }
    if (out.length === 4 && out.some((x) => x.kind === "terputar") && out.some((x) => x.kind === "tertukar") && ok(out)) return shuffle(r, out);
  }
  return null;
}

function nearCubes(r: R, c: Cube, correct: View): { v: View; kind: ErrKind }[] {
  const pool: { v: View; kind: ErrKind }[] = [], sigs = new Set([viewSig(correct)]);
  for (let g = 0; g < 1500 && pool.length < 30; g++) {
    const side = (r() < 0.5 ? 1 : -1) as 1 | -1, base = viewOf(rotate(c, pick(r, ROTS)), side);
    let v: View = { side, faces: { ...base.faces } };
    const k = pick(r, ["putar", "putar", "cermin1", "ganti", "ganti", "cerminKubus", "seberang"]);
    if (k === "putar" || k === "cermin1") {
      const ps = POSES.filter((p) => (k === "putar" ? DESIGNS[v.faces[p].design].anchor : v.faces[p].design === "siku"));
      if (!ps.length) continue;
      const p = pick(r, ps), f = v.faces[p];
      if (k === "cermin1") v.faces[p] = { ...f, r: neg(f.r) };
      else { let rr = f.r, uu = f.u; for (let i = 0, n = 1 + Math.floor(r() * 3); i < n; i++) [rr, uu] = [neg(uu), rr]; v.faces[p] = { ...f, r: rr, u: uu }; }
    } else if (k === "ganti") {
      const shown = new Set(POSES.map((p) => v.faces[p].design));
      const hidden = NORMALS.map((n) => c.get(key(n))!.design).filter((d) => !shown.has(d));
      const p = pick(r, POSES); v.faces[p] = { design: pick(r, hidden), ...frameAt(r, p, side) };
    } else if (k === "seberang") {
      const [p, q] = shuffle(r, POSES); v.faces[p] = { design: opposite(c, v.faces[q].design), ...frameAt(r, p, side) };
    } else v = viewOf(rotate(mirrorCube(c), pick(r, ROTS)), side);
    const s = viewSig(v);
    if (sigs.has(s) || consistent(c, v) || !hasTwoUnique(c, v)) continue;
    let w; try { w = explain(c, v, (d) => d, "kubus"); } catch { continue; }
    if (w.kind !== "seberang" && w.n !== 1) continue;
    sigs.add(s); pool.push({ v, kind: w.kind });
  }
  return pool;
}

function buildAH(r: R, no: number, kunci: string): Item {
  for (;;) {
    const shape = randomShape(r, HARD), ds = designsH(r);
    const cells: Cell[] = shape.map((s, i) => ({ ...s, design: ds[i], rot: Math.floor(r() * 4), no: i + 1 }));
    const c = fold(cells);
    let correct: View | null = null;
    for (let t = 0; t < 200 && !correct; t++) {
      const v = viewOf(rotate(c, pick(r, ROTS)), (r() < 0.5 ? 1 : -1) as 1 | -1);
      const asym = POSES.filter((p) => DESIGNS[v.faces[p].design].anchor).length;
      if (asym >= 2 && sikuVisible(v) && nonAdjacentNote(cells, v.faces, (p) => p)) correct = v;
    }
    if (!correct) continue;
    const ch = choose4(r, nearCubes(r, c, correct), (xs) => xs.some((x) => x.v.side === correct!.side) && xs.some((x) => x.v.side !== correct!.side));
    if (!ch) continue;
    return assembleA(r, no, 3, kunci, cells, c, correct, ch.map((x) => x.v), TIPS_HA[no % TIPS_HA.length], true);
  }
}

function nearNets(r: R, c: Cube, stim: View): { cells: Cell[]; kind: ErrKind }[] {
  const pool: { cells: Cell[]; kind: ErrKind }[] = [], seen = new Set<string>();
  const visD = POSES.map((p) => stim.faces[p].design);
  for (let g = 0; g < 1500 && pool.length < 30; g++) {
    const cells = unfold(c, randomShape(r, [...HARD, 1, 2, 4, 5]), Math.floor(r() * 24)).map((x) => ({ ...x }));
    const k = pick(r, ["putar", "putar", "tukar", "tukar", "seberang"]);
    const idx = (d: string) => cells.findIndex((x) => x.design === d);
    if (k === "putar") {
      const i = idx(pick(r, visD.filter((d) => DESIGNS[d].anchor))); cells[i].rot = (cells[i].rot + 1 + Math.floor(r() * 3)) % 4;
    } else if (k === "tukar") {
      const i = idx(pick(r, visD)), hid = cells.map((_, j) => j).filter((j) => !visD.includes(cells[j].design)), j = pick(r, hid);
      [cells[i].design, cells[j].design] = [cells[j].design, cells[i].design]; [cells[i].rot, cells[j].rot] = [cells[j].rot, cells[i].rot];
    } else {
      const [a, b] = shuffle(r, visD), cb = fold(cells), nb = NORMALS.find((n) => cb.get(key(n))!.design === b)!;
      const i = idx(a), j = cb.get(key(neg(nb)))!.cell!;
      [cells[i].design, cells[j].design] = [cells[j].design, cells[i].design]; [cells[i].rot, cells[j].rot] = [cells[j].rot, cells[i].rot];
    }
    const d = fold(cells), sig = JSON.stringify(cells);
    if (seen.has(sig) || consistent(d, stim)) continue;
    let w; try { w = explain(d, stim, (x) => x, "jaring"); } catch { continue; }
    if (w.kind !== "seberang" && w.n !== 1) continue;
    seen.add(sig); pool.push({ cells, kind: w.kind });
  }
  return pool;
}

function buildBH(r: R, no: number, kunci: string): Item {
  for (;;) {
    const ds = designsH(r), shape = randomShape(r, HARD);
    const c = fold(shape.map((s, i) => ({ ...s, design: ds[i], rot: Math.floor(r() * 4) })));
    let stim: View | null = null;
    for (let t = 0; t < 200 && !stim; t++) {
      const v = viewOf(rotate(c, pick(r, ROTS)), (r() < 0.5 ? 1 : -1) as 1 | -1);
      if (sikuVisible(v) && POSES.filter((p) => DESIGNS[v.faces[p].design].anchor).length >= 2) stim = v;
    }
    if (!stim) continue;
    const cellsK = unfold(c, randomShape(r, HARD), Math.floor(r() * 24));
    const ch = choose4(r, nearNets(r, c, stim), () => true);
    if (!ch) continue;
    return assembleB(r, no, 3, kunci, c, stim, cellsK, ch.map((x) => x.cells), TIPS_HB[no % TIPS_HB.length], true);
  }
}

export const buildHots = (seed: number, no: number, tipe: "A" | "B", kunci: string): Item =>
  tipe === "A" ? buildAH(rng(seed), no, kunci) : buildBH(rng(seed), no, kunci);
