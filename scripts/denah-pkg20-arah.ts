import assert from "node:assert/strict";
import type { Map2 } from "./denah-k17-bw";
import { shuffle, DIR, sectorOf, angDiff, arrow, C_OK, C_NO, C_REF, type Obj } from "./denah-k17-peta";
import { LET, POS, MOVE, arrange, ring2, safeKey, bOf, type Item } from "./denah-k17-soal-bw";

// Butir ARAH paket 20 (slot 38-39, peta A, Utara di atas). Lebih berat dari ARAH pkg 19 (satu langkah: arah dari X ke Y):
// 38 BELAKANG  = (1) cari arah Y dari X, (2) balik 180°, (3) cari bangunan di arah itu dari X;
// 39 ARAH SAMA = (1) cari arah Z dari X, (2) bawa arah itu ke bangunan W yang lain, (3) cari bangunan di arah itu dari W.
// Bukti tunggal: tepat satu opsi dalam ±22,5° dari arah sasaran (dihitung dari koordinat), tiap pengecoh = satu kesalahan bernama di sektor
// berbeda, dan kunci tidak boleh satu-satunya "R. nama" / gedung umum di antara opsi (D-3).
export const INSTRUKSI_ARAH = "Gunakan denah. Utara di atas peta. Arah diukur dari titik tengah bangunan; arah serong artinya bergeser ke samping dan ke atas/bawah hampir sama jauh. Lapangan bukan bangunan.";
type Opt = { z: Obj; why: string; s: number };
const O = (b: unknown) => b as Obj;
const isR = (b: Obj) => b.name.startsWith("R. ");
const clearAt = (o: Obj, b: Obj, s: number) => sectorOf(bOf(o, b)) === s && angDiff(bOf(o, b), s * 45) <= 12;

/** Dari daftar kesalahan bernama (urut prioritas), ambil 4 bangunan di sektor berbeda, masing-masing jelas berada di sektornya dari `origin`. */
function distractors(B: Obj[], origin: Obj, target: number, errs: { s: number; why: string; z?: Obj }[], skip: Set<Obj>): Opt[] | null {
  const out: Opt[] = [];
  for (const e of errs) {
    if (out.length === 4) break;
    if (e.s === target || out.some((o) => o.s === e.s)) continue;
    const z = e.z && !skip.has(e.z) ? e.z : shuffle(B).find((b) => b !== origin && !skip.has(b) && !out.some((o) => o.z === b) && clearAt(origin, b, e.s));
    if (!z || angDiff(bOf(origin, z), target * 45) < 35) continue;
    out.push({ z, why: e.why, s: sectorOf(bOf(origin, z)) });
  }
  return out.length === 4 ? out : null;
}
/** Tepat satu opsi dalam ±22,5° dari arah sasaran, dihitung dari koordinat. */
const onlyKey = (origin: Obj, key: Obj, opts: Opt[], target: number) => opts.filter((o) => angDiff(bOf(origin, o.z), target * 45) < 22.5).map((o) => o.z).every((z) => z === key)
  && opts.some((o) => o.z === key);
const dKey = (opts: Opt[], key: Obj) => opts.filter((o) => isR(o.z) === isR(key)).length >= 2;

/** 38 BELAKANG: X menatap Y; bangunan tepat di belakang (berlawanan arah tatap), diukur dari X. */
export function belakang20(p: Map2, pos: number, used: Set<string>, walker: string): Item | null {
  const B = p.objs.filter((o) => o.building).map(O);
  for (const X of shuffle(B)) for (const Y of shuffle(B)) {
    if (X === Y || used.has(X.name) || used.has(Y.name)) continue;
    const s0 = safeKey(X, Y);
    if (s0 < 0) continue;
    const t = (s0 + 4) % 8, Z = shuffle(B).find((z) => z !== X && z !== Y && safeKey(X, z) === t);
    if (!Z) continue;
    const errs = [
      { s: s0, why: `itu arah yang ditatap (${DIR[s0]}), bukan arah belakang`, z: Y },
      { s: (s0 + 2) % 8, why: `itu arah di samping kanan (90°), bukan belakang (180°)` },
      { s: (t + 1) % 8, why: `meleset satu langkah kompas (45°) searah jarum jam dari arah belakang` },
      { s: (s0 + 6) % 8, why: `itu arah di samping kiri (90°), bukan belakang (180°)` },
      { s: (t + 7) % 8, why: `meleset satu langkah kompas (45°) berlawanan arah jarum jam dari arah belakang` },
    ];
    const ds = distractors(B, X, t, errs, new Set([X, Z]));
    if (!ds) continue;
    const opts = arrange<Opt>({ z: Z, why: "", s: t }, shuffle(ds), pos);
    if (!onlyKey(X, Z, opts, t) || !dKey(opts, Z)) continue;
    assert.equal(new Set(opts.map((o) => o.z.name)).size, 5);
    used.add(X.name); used.add(Y.name);
    const near = ds.find((d) => angDiff(bOf(X, d.z), t * 45) <= 50) ?? ds[1];
    const p1 = `Ada tiga lapis aturan: (1) cari arah ${Y.name} dari ${X.name}, karena ke sanalah ${walker} menatap; (2) "tepat di belakang" berarti arah yang berlawanan, yaitu 4 langkah kompas (180°) dari arah tatap; (3) cari bangunan pilihan yang kena arah itu, diukur dari tengah ${X.name}. ${Y.name} ada di ${POS[s0]} ${X.name}, yaitu ${DIR[s0]}. Kebalikan ${DIR[s0]} adalah ${DIR[t]} (${MOVE[t]}). Bangunan pilihan yang kena arah itu: ${Z.name}.`;
    const p2 = `${opts.map((o, i) => (o.z === Z ? "" : `Opsi ${LET[i]} (${o.z.name}): letaknya di ${POS[o.s]} ${X.name}, jadi ${DIR[o.s]}; ${o.why}.`)).filter(Boolean).join(" ")} Opsi ${LET[pos]} (${Z.name}) satu-satunya yang berada di ${DIR[t]} dari ${X.name}. Jawaban: ${LET[pos]}.`;
    return {
      sub_type: "FIG-DENAH-ARAH", tier: 3, instruksi: INSTRUKSI_ARAH,
      stem: `${walker} berdiri di depan ${X.name} dan menatap ${Y.name}. Di antara pilihan berikut, bangunan yang berada tepat di belakang ${walker}, diukur dari ${X.name}, adalah …`,
      opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
      cap: [`${walker} di ${X.name} menatap ${Y.name}: ${DIR[s0]}`, `Belakang = kebalikan = ${DIR[t]}`],
      over: ring2(X, C_REF) + ring2(Y, C_REF, true) + arrow(X, Y, C_REF, "ref", `tatap ${DIR[s0]}`) + ring2(Z, C_OK) + arrow(X, Z, C_OK, "ok", `${DIR[t]} ✓`) + ring2(near.z, C_NO, true) + arrow(X, near.z, C_NO, "no", `${DIR[near.s]} ✗`, true),
      pembahasan: `${p1}\n\n${p2}`, ans: Z.name, ds: opts.map((o) => o.why), proof: { target: DIR[t], dari: X.name, tatap: Y.name },
    };
  }
  return null;
}

/** 39 ARAH SAMA: Z terletak di arah tertentu dari X; bangunan yang terletak di arah yang sama dari W. */
export function samaArah20(p: Map2, pos: number, used: Set<string>): Item | null {
  const B = p.objs.filter((o) => o.building).map(O);
  for (const X of shuffle(B)) for (const Z of shuffle(B)) {
    if (X === Z || used.has(X.name) || used.has(Z.name)) continue;
    const d = safeKey(X, Z);
    if (d < 0) continue;
    for (const W of shuffle(B)) {
      if (W === X || W === Z || used.has(W.name)) continue;
      const V = shuffle(B).find((v) => v !== X && v !== Z && v !== W && safeKey(W, v) === d);
      if (!V) continue;
      const errs: { s: number; why: string; z?: Obj }[] = [
        { s: -1, why: `itu bangunan acuan sendiri; arah yang dibawa ke ${W.name} harus ${DIR[d]}, bukan arah menuju ${Z.name}`, z: Z },
        { s: (d + 4) % 8, why: `itu arah kebalikan (${DIR[(d + 4) % 8]}), bukan ${DIR[d]}` },
        { s: (d + 2) % 8, why: `itu arah tegak lurus searah jarum jam (${DIR[(d + 2) % 8]}), bukan ${DIR[d]}` },
        { s: (d + 7) % 8, why: `meleset satu langkah kompas (45°) berlawanan arah jarum jam dari ${DIR[d]}` },
        { s: (d + 1) % 8, why: `meleset satu langkah kompas (45°) searah jarum jam dari ${DIR[d]}` },
      ];
      const out: Opt[] = [], skip = new Set<Obj>([V, W, X]);
      for (const e of errs) {
        if (out.length === 4) break;
        const z = e.z ?? shuffle(B).find((b) => b !== W && !skip.has(b) && !out.some((o) => o.z === b) && clearAt(W, b, e.s));
        if (!z || angDiff(bOf(W, z), d * 45) < 35 || out.some((o) => o.z === z)) continue;
        out.push({ z, why: e.why, s: sectorOf(bOf(W, z)) });
      }
      if (out.length < 4) continue;
      const opts = arrange<Opt>({ z: V, why: "", s: d }, shuffle(out), pos);
      if (!onlyKey(W, V, opts, d) || !dKey(opts, V) || new Set(opts.map((o) => o.z.name)).size !== 5) continue;
      used.add(X.name); used.add(Z.name); used.add(W.name);
      const near = out.find((o) => angDiff(bOf(W, o.z), d * 45) <= 50 && o.z !== Z) ?? out.find((o) => o.z !== Z)!;
      const p1 = `Ada tiga lapis aturan: (1) tentukan arah ${Z.name} dari ${X.name}; (2) arah itu dibawa ke ${W.name}, bukan arah dari ${W.name} menuju ${Z.name}; (3) cari bangunan pilihan yang kena arah itu, diukur dari tengah ${W.name}. ${Z.name} ada di ${POS[d]} ${X.name}, yaitu ${DIR[d]}. Dari tengah ${W.name}, geser ${MOVE[d]}: bangunan pilihan yang kena arah itu adalah ${V.name}.`;
      const p2 = `${opts.map((o, i) => (o.z === V ? "" : `Opsi ${LET[i]} (${o.z.name}): ${o.z === Z ? `diukur dari ${W.name}, ${Z.name} ada di ${DIR[o.s]}; ` : `letaknya di ${POS[o.s]} ${W.name}, jadi ${DIR[o.s]}; `}${o.why}.`)).filter(Boolean).join(" ")} Opsi ${LET[pos]} (${V.name}) satu-satunya yang berada di ${DIR[d]} dari ${W.name}. Jawaban: ${LET[pos]}.`;
      return {
        sub_type: "FIG-DENAH-ARAH", tier: 3, instruksi: INSTRUKSI_ARAH,
        stem: `${Z.name} terletak di arah tertentu dari ${X.name}. Di antara pilihan berikut, bangunan yang terletak di arah yang sama dari ${W.name}, seperti arah ${Z.name} dari ${X.name}, adalah …`,
        opsi: Object.fromEntries(opts.map((o, i) => [LET[i], o.z.name])), kunci: [LET[pos]],
        cap: [`${Z.name} dari ${X.name}: ${DIR[d]}`, `Bawa ${DIR[d]} ke ${W.name}`],
        over: ring2(X, C_REF) + ring2(Z, C_REF, true) + arrow(X, Z, C_REF, "ref", `${DIR[d]}`) + ring2(W, C_REF) + ring2(V, C_OK) + arrow(W, V, C_OK, "ok", `${DIR[d]} ✓`) + ring2(near.z, C_NO, true) + arrow(W, near.z, C_NO, "no", `${DIR[near.s]} ✗`, true),
        pembahasan: `${p1}\n\n${p2}`, ans: V.name, ds: opts.map((o) => o.why), proof: { target: DIR[d], asal: X.name, acuan: Z.name, dari: W.name },
      };
    }
  }
  return null;
}
