// Penjelasan otomatis: kenapa sebuah gambar kubus (atau jaring) tidak cocok.
import { Cube, View, Pos, Face, NORMALS, ROTS, rotate, viewOf, faceSig, key, POS_N, DESIGNS, orientPhrase, describe, opposite } from "./kubus-core";

export const posName = (p: Pos, side: number) => (p === "samping" ? (side > 0 ? "kanan" : "kiri") : p);
const POSES: Pos[] = ["depan", "atas", "samping"];
export const countDesign = (c: Cube, d: string) => NORMALS.filter((n) => c.get(key(n))!.design === d).length;
const uniqueVisible = (c: Cube, v: View) => POSES.filter((p) => v.faces[p].design !== "kosong" && countDesign(c, v.faces[p].design) === 1);

/** Putar kubus supaya motif d1 di posisi p1 dan d2 di posisi p2. */
export function placeAnchors(c: Cube, side: 1 | -1, d1: string, p1: Pos, d2: string, p2: Pos): Cube | null {
  const pn = POS_N(side);
  for (const m of ROTS) {
    const r = rotate(c, m);
    if (r.get(key(pn[p1]))!.design === d1 && r.get(key(pn[p2]))!.design === d2) return r;
  }
  return null;
}

export type ErrKind = "seberang" | "tertukar" | "terputar" | "tercermin";
export const ERR_NAME: Record<ErrKind, string> = {
  seberang: "sisi berseberangan tampil bersamaan",
  tertukar: "letak sisi tertukar",
  terputar: "arah motif terputar",
  tercermin: "motif tercermin (kiri-kanan terbalik)",
};
interface Mis { pos: Pos; truth: Face; shown: Face; kind: ErrKind }
function mismatches(truth: View, shown: View): Mis[] {
  const out: Mis[] = [];
  for (const p of POSES) {
    const t = truth.faces[p], s = shown.faces[p];
    if (faceSig(t, p, truth.side) === faceSig(s, p, shown.side)) continue;
    if (t.design !== s.design) { out.push({ pos: p, truth: t, shown: s, kind: "tertukar" }); continue; }
    if (orientPhrase(t) === orientPhrase(s)) throw new Error("frase sama tapi gambar beda: " + t.design);
    const hand = (f: Face) => Math.sign(f.r[1] * f.u[2] - f.r[2] * f.u[1] + f.r[2] * f.u[0] - f.r[0] * f.u[2] + f.r[0] * f.u[1] - f.r[1] * f.u[0]);
    const mirrored = DESIGNS[t.design].anchor?.t === "chiral" && hand(t) !== hand(s);
    out.push({ pos: p, truth: t, shown: s, kind: mirrored ? "tercermin" : "terputar" });
  }
  return out;
}

export type Namer = (design: string) => string; // "sisi 3 (segitiga)" atau "segitiga"
export interface Why { kind: ErrKind; text: string; n?: number }

/** Cari alasan gambar `shown` tidak cocok dengan kubus `c`. `mode` = "kubus" (soal jaring→kubus) atau "jaring" (soal kubus→jaring). */
export function explain(c: Cube, shown: View, name: Namer, mode: "kubus" | "jaring"): Why {
  const side = shown.side, vis = uniqueVisible(c, shown);
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
    const d1 = shown.faces[vis[i]].design, d2 = shown.faces[vis[j]].design;
    if (opposite(c, d1) === d2) {
      const text = mode === "kubus"
        ? `${name(d1)} dan ${name(d2)} berseberangan, jadi tidak mungkin terlihat bersamaan.`
        : `pada jaring ini ${name(d1)} dan ${name(d2)} berseberangan setelah dilipat, padahal di kubus keduanya bersebelahan.`;
      return { kind: "seberang", text };
    }
  }
  let best: { m: Mis[]; p1: Pos; p2: Pos } | null = null;
  for (const p1 of vis) for (const p2 of vis) {
    if (p1 === p2) continue;
    const r = placeAnchors(c, side, shown.faces[p1].design, p1, shown.faces[p2].design, p2);
    if (!r) continue;
    const m = mismatches(viewOf(r, side), shown);
    const pri = (p1 === "depan" ? 0 : 1) + (p2 === "atas" ? 0 : 1);
    if (!best || m.length < best.m.length || (m.length === best.m.length && pri < (best.p1 === "depan" ? 0 : 1) + (best.p2 === "atas" ? 0 : 1))) best = { m, p1, p2 };
  }
  if (!best || best.m.length === 0) throw new Error("tidak bisa menjelaskan pengecoh");
  const { m, p1, p2 } = best, pn = (p: Pos) => posName(p, side);
  const anchor = `${name(shown.faces[p1].design)} di ${pn(p1)} dan ${name(shown.faces[p2].design)} di ${pn(p2)}`;
  const parts = m.map((x) => {
    if (x.kind === "tertukar") return mode === "kubus"
      ? `sisi ${pn(x.pos)} seharusnya ${name(x.truth.design)}${orientPhrase(x.truth) ? `, ${orientPhrase(x.truth)}` : ""}, bukan ${describe(x.shown)}`
      : `sisi ${pn(x.pos)} menjadi ${describe(x.truth)}, padahal di kubus ${describe(x.shown)}`;
    const nm = DESIGNS[x.truth.design].nama;
    return mode === "kubus"
      ? `${nm} di sisi ${pn(x.pos)} seharusnya ${orientPhrase(x.truth)}, bukan ${orientPhrase(x.shown)}`
      : `${nm} di sisi ${pn(x.pos)} menjadi ${orientPhrase(x.truth)}, padahal di kubus ${orientPhrase(x.shown)}`;
  });
  const lead = mode === "kubus" ? `Kalau ${anchor}, ` : `Jika dilipat dengan ${anchor}, `;
  return { kind: m[0].kind, text: lead + parts.join("; ") + ".", n: m.length };
}
