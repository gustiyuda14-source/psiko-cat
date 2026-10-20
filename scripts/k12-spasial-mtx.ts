import assert from "node:assert/strict";
import { type Fill, type Key, fp, redRing, sig } from "./figural-lib";
import { type Draft, type MC, type Wrong, CORNER, CORNER_NAME, DIR_NAME, LINE_NAME, POLA, SHAPE_NAME, WEDGE_NAME, cellFig, colMarks, finish, layout } from "./k12-spasial-core";

// K12 batch 26 — matriks 3×3 (10 butir). Tiap butir = daftar aturan per atribut sel; sel kosong (3,3) dihitung dari aturan.
// Bukti (D-1): (a) setiap pengecoh melanggar tepat aturannya sendiri; (b) semua tafsir lain yang cocok dengan 8 sel
// terlihat (operasi himpunan lain, rumus langkah lain, operasi hitung lain) menghasilkan jawaban yang sama.

const md = (x: number, m: number) => ((x % m) + m) % m;
const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
type Op = "OR" | "XOR" | "AND" | "K12" | "K21";
type Set_ = (string | number)[];
const norm = (a: Set_) => [...a].sort((x, y) => String(x).localeCompare(String(y)));
const OPS: Record<Op, (a: Set_, b: Set_) => Set_> = {
  OR: (a, b) => norm([...new Set([...a, ...b])]), XOR: (a, b) => norm([...a.filter((x) => !b.includes(x)), ...b.filter((x) => !a.includes(x))]),
  AND: (a, b) => norm(a.filter((x) => b.includes(x))), K12: (a, b) => norm(a.filter((x) => !b.includes(x))), K21: (a, b) => norm(b.filter((x) => !a.includes(x))),
};
const eqS = (a: Set_, b: Set_) => norm(a).join() === norm(b).join();
type Rule =
  | { at: "s" | "a" | "k" | "n"; kind: "latin"; vals: number[]; p: number; o: number }
  | { at: "g" | "w"; kind: "op"; op: Op; c1: Set_[]; c2: Set_[] }
  | { at: "a" | "k"; kind: "step"; b: number; dr: number; dc: number }
  | { at: "n"; kind: "sum"; c1: number[]; c2: number[] }
  | { at: "f"; kind: "oneblack"; o: number };
type V = number | Set_ | Fill;
const mod = (at: string) => (at === "a" ? 8 : 4);
function val(R: Rule, r: number, c: number): V {
  switch (R.kind) {
    case "latin": return R.vals[(R.p * r + c + R.o) % 3];
    case "op": return c === 0 ? norm(R.c1[r]) : c === 1 ? norm(R.c2[r]) : OPS[R.op](R.c1[r], R.c2[r]);
    case "step": return md(R.b + R.dr * r + R.dc * c, mod(R.at));
    case "sum": return c === 0 ? R.c1[r] : c === 1 ? R.c2[r] : R.c1[r] + R.c2[r];
    case "oneblack": return c === (r + R.o) % 3 ? "b" : "w";
  }
}
const eqV = (a: V, b: V) => (Array.isArray(a) && Array.isArray(b) ? eqS(a, b) : a === b);
/** Aturan dipenuhi grid g (nilai atribut aturan ini per sel)? */
function holds(R: Rule, g: V[][]): boolean {
  const rows = g, cols = [0, 1, 2].map((c) => g.map((row) => row[c]));
  switch (R.kind) {
    case "latin": return [...rows, ...cols].every((l) => new Set(l).size === 3);
    case "op": return g.every((row) => eqS(OPS[R.op](row[0] as Set_, row[1] as Set_), row[2] as Set_));
    case "step": return g.every((row, r) => row.every((x, c) => x === val(R, r, c)));
    case "sum": return g.every((row) => (row[0] as number) + (row[1] as number) === row[2]);
    case "oneblack": return [...rows, ...cols].every((l) => l.filter((x) => x === "b").length === 1);
  }
}
/** Semua tafsir lain yang cocok dengan 8 sel terlihat harus memberi jawaban sama. */
function assertNoAltReading(R: Rule, tag: string) {
  const ans = val(R, 2, 2);
  if (R.kind === "op") for (const o of Object.keys(OPS) as Op[]) {
    if ([0, 1].every((r) => eqS(OPS[o](R.c1[r], R.c2[r]), val(R, r, 2) as Set_))) assert.ok(eqS(OPS[o](R.c1[2], R.c2[2]), ans as Set_), `${tag}: tafsir ${o} juga cocok tetapi beda jawaban`);
  }
  if (R.kind === "step") { const m = mod(R.at); for (let b = 0; b < m; b++) for (let dr = 0; dr < m; dr++) for (let dc = 0; dc < m; dc++) {
    const f = (r: number, c: number) => md(b + dr * r + dc * c, m);
    if ([0, 1, 2].every((r) => [0, 1, 2].every((c) => (r === 2 && c === 2) || f(r, c) === val(R, r, c)))) assert.equal(f(2, 2), ans, `${tag}: rumus langkah lain cocok tetapi beda jawaban`);
  } }
  if (R.kind === "sum") for (const [n, f] of Object.entries({ kali: (a: number, b: number) => a * b, selisih: (a: number, b: number) => Math.abs(a - b), terbesar: Math.max }))
    if ([0, 1].every((r) => f(R.c1[r], R.c2[r]) === R.c1[r] + R.c2[r])) assert.equal(f(R.c1[2], R.c2[2]), ans, `${tag}: operasi ${n} juga cocok tetapi beda jawaban`);
}

const ATTR: Record<string, string> = { s: "bingkai", a: "arah jarum", k: "titik pojok", n: "jumlah titik di bawah bangun", g: "garis di dalam", w: "segitiga hitam di dalam", f: "warna bingkai" };
const PART: Record<string, string> = { g: "garis", w: "segitiga hitam" };
function vName(at: string, v: V): string {
  if (at === "s") return SHAPE_NAME[v as number];
  if (at === "a") return `jarum ke ${DIR_NAME[v as number]}`;
  if (at === "k") return `titik di ${CORNER_NAME[v as number]}`;
  if (at === "n") return `${v} titik`;
  if (at === "g") return (v as Set_).length ? (v as Set_).map((x) => LINE_NAME[x as string]).join(" + ") : "tanpa garis";
  if (at === "w") return (v as Set_).length ? `segitiga ${(v as Set_).map((x) => WEDGE_NAME[x as number]).join(" + ")}` : "tanpa segitiga";
  return v === "b" ? "bingkai hitam" : "bingkai putih";
}
const turn = (d: number, m: number) => { const x = md(d, m) > m / 2 ? md(d, m) - m : md(d, m); return { n: Math.abs(x), dir: x > 0 ? "searah" : "berlawanan arah" }; };
const OPTXT: Record<Op, string> = { OR: "semua bagian kolom 1 dan 2 digabung", XOR: "bagian yang sama di kolom 1 dan 2 dibuang", AND: "hanya bagian yang sama di kolom 1 dan 2 yang disimpan", K12: "kolom 1 dikurangi kolom 2", K21: "kolom 2 dikurangi kolom 1" };

type MSpec = { tier: 2 | 3; key: Key; sub: string; base: Partial<MC>; rules: Rule[]; picks?: string[] };
function mtxItem(sp: MSpec, no: number): Draft {
  const tag = `matriks #${no}`;
  const cellMC = (r: number, c: number, over: Partial<MC> = {}): MC => ({ s: 0, ...sp.base, ...Object.fromEntries(sp.rules.map((R) => [R.at, val(R, r, c)])), ...over } as MC);
  const ans = cellMC(2, 2);
  const grid = (last: MC | null) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? (last ? cellFig(last) : null) : cellFig(cellMC(r, c)))));
  const gridOf = (R: Rule, last: V) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : val(R, r, c))));
  sp.rules.forEach((R) => { assert.ok(holds(R, gridOf(R, val(R, 2, 2))), `${tag}: aturan ${R.at} tidak dipenuhi kunci`); assertNoAltReading(R, tag); });

  // kandidat pengecoh per aturan
  const cands: Wrong<MC>[][] = sp.rules.map((R) => {
    const out: Wrong<MC>[] = [], at = R.at, A = ATTR[at];
    const mk = (name: string, v: V, alasan: string) => {
      if (eqV(v, val(R, 2, 2)) || (Array.isArray(v) && !v.length)) return;
      if (holds(R, gridOf(R, v))) return; // harus benar-benar melanggar aturannya
      if (out.some((o) => eqV((o.v as Record<string, V>)[at], v))) return;
      out.push({ name, v: { ...ans, [at]: v } as MC, isi: vName(at, v), alasan });
    };
    if (R.kind === "latin") R.vals.forEach((x) => mk(`${at}Latin${x}`, x, `${vName(at, x)} sudah ada di baris 3, padahal tiap ${A} muncul tepat sekali per baris.`));
    if (R.kind === "op") {
      (["OR", "XOR", "K21", "K12", "AND"] as Op[]).forEach((o) => o !== R.op && mk(`op${o}`, OPS[o](R.c1[2], R.c2[2]), `${OPTXT[o]}, padahal aturannya ${OPTXT[R.op]}.`));
      mk("salin1", norm(R.c1[2]), `kolom 1 disalin begitu saja, padahal aturannya ${OPTXT[R.op]}.`);
    }
    if (R.kind === "step") {
      const m = mod(at), prev = val(R, 2, 1) as number, t = turn(R.dc, m), unit = at === "a" ? `${45 * t.n}°` : `${t.n} pojok`;
      mk(`${at}Diam`, prev, `${A} tidak bergeser dari kolom 2.`);
      mk(`${at}Arah`, md(prev - R.dc, m), `${A} bergeser ${unit} ke arah sebaliknya.`);
      mk(`${at}Lebih`, md(prev + 2 * R.dc, m), `${A} bergeser dua kali lipat, padahal tiap kolom hanya ${unit}.`);
    }
    if (R.kind === "sum") { const s = R.c1[2] + R.c2[2]; [s - 1, s + 1].forEach((x) => x >= 1 && x <= 5 && mk(`n${x}`, x, `jumlah titik ${x}, padahal ${R.c1[2]} + ${R.c2[2]} = ${s}.`)); }
    if (R.kind === "oneblack") { const v = val(R, 2, 2) === "b" ? "w" : "b"; mk("warna", v, v === "b" ? "baris 3 sudah punya bingkai hitam, jadi tidak boleh hitam lagi." : "baris 3 dan kolom 3 belum punya bingkai hitam, jadi sel ini harus hitam."); }
    return out;
  });
  const all = cands.flat(), wrongs: Wrong<MC>[] = [];
  const seen = new Set([sig(cellFig(ans))]);
  const take = (w: Wrong<MC> | undefined) => { if (!w || wrongs.length >= 4) return; const s = sig(cellFig(w.v)); if (!seen.has(s)) { seen.add(s); wrongs.push(w); } };
  if (sp.picks) sp.picks.forEach((p) => { const w = all.find((x) => x.name === p); assert.ok(w, `${tag}: pengecoh ${p} tidak tersedia`); take(w); });
  else if (sp.rules.length === 2) cands.forEach((cs) => cs.slice(0, 2).forEach(take));
  for (let r = 0; wrongs.length < 4 && r < 5; r++) cands.forEach((cs) => take(cs[r]));
  assert.equal(wrongs.length, 4, `${tag}: pengecoh kurang`);
  const ruleOf = (w: Wrong<MC>) => cands.findIndex((cs) => cs.includes(w));
  assert.ok(sp.rules.every((_, i) => wrongs.some((w) => ruleOf(w) === i)), `${tag}: setiap aturan harus diuji pengecoh`);

  // pembahasan
  const line = (R: Rule) => {
    const v = (r: number, c: number) => val(R, r, c), A = ATTR[R.at];
    if (R.kind === "latin") return `${cap(A)}: ${R.vals.map((x) => vName(R.at, x)).join(", ")} muncul tepat sekali di setiap baris dan setiap kolom. Baris 3 sudah punya ${vName(R.at, v(2, 0))} dan ${vName(R.at, v(2, 1))}, jadi sel kosong ${vName(R.at, v(2, 2))}.`;
    if (R.kind === "op") {
      const P = PART[R.at], c1 = vName(R.at, v(2, 0)), c2 = vName(R.at, v(2, 1)), a = vName(R.at, v(2, 2));
      if (R.op === "OR") return `${cap(P)} di kolom 3 = gabungan ${P} kolom 1 dan kolom 2. Baris 3: ${c1} digabung dengan ${c2} menjadi ${a}.`;
      if (R.op === "XOR") return `${cap(P)} di kolom 3 berisi ${P} yang muncul di kolom 1 saja atau di kolom 2 saja; yang ada di keduanya hilang. Baris 3: ${vName(R.at, OPS.AND(R.c1[2], R.c2[2]))} ada di kedua kolom sehingga hilang, tersisa ${a}.`;
      return `${cap(P)} di kolom 3 = ${P} kolom 1 dikurangi ${P} yang ada di kolom 2. Baris 3: ${c1} dikurangi ${c2}, tersisa ${a}.`;
    }
    if (R.kind === "step") { const t = turn(R.dc, mod(R.at)); return `${cap(A)}: di setiap baris, ${R.at === "a" ? `jarum berputar ${45 * t.n}°` : `titik pindah ${t.n} pojok`} ${t.dir} jarum jam dari kolom ke kolom. Baris 3: ${[0, 1, 2].map((c) => vName(R.at, v(2, c)).replace(/^(jarum ke|titik di) /, "")).join(" → ")}.`; }
    if (R.kind === "sum") return `${cap(A)}: kolom 3 = kolom 1 + kolom 2. Baris 3: ${v(2, 0)} + ${v(2, 1)} = ${v(2, 2)} titik.`;
    const blackAt = [0, 1].find((c) => v(2, c) === "b");
    return `${cap(A)}: setiap baris dan setiap kolom punya tepat satu bingkai hitam. ${blackAt !== undefined ? `Baris 3 sudah punya bingkai hitam di kolom ${blackAt + 1}, jadi sel kosong putih.` : "Baris 3 dan kolom 3 belum punya bingkai hitam, jadi sel kosong hitam."}`;
  };
  const shortRule = (R: Rule) => {
    const A = ATTR[R.at].replace(" di bawah bangun", " bawah").replace(" di dalam", "");
    if (R.kind === "latin") return `${A}: tepat sekali per baris dan kolom`;
    if (R.kind === "op") return `${PART[R.at]}: kolom 3 = ${R.op === "OR" ? "gabungan kolom 1 + 2" : R.op === "XOR" ? "yang sama di kolom 1 dan 2 hilang" : "kolom 1 − kolom 2"}`;
    if (R.kind === "step") { const t = turn(R.dc, mod(R.at)); return `${A}: ${R.at === "a" ? `${45 * t.n}°` : `${t.n} pojok`} ${t.dir} jarum jam per kolom`; }
    if (R.kind === "sum") return "titik bawah: kolom 3 = kolom 1 + kolom 2";
    return "warna: satu bingkai hitam per baris dan kolom";
  };
  const hasOp = sp.rules.some((R) => R.kind === "op");
  const p1 = [`Ada ${sp.rules.length} aturan yang berjalan bersamaan. Cek dari yang paling cepat terlihat.`, ...sp.rules.map((R, i) => `${i + 1}. ${line(R)}`)];
  const { opts, pembahasan } = finish({
    ans, wrongs, key: sp.key, fig: cellFig, p1,
    tips: (L) => `urutkan cek dari yang paling murah: ${sp.rules.map((R) => ATTR[R.at]).join(", lalu ")}. ${cap(sp.rules.map((R, i) => `${ATTR[R.at]} menggugurkan opsi ${wrongs.filter((w) => ruleOf(w) === i).map((w) => L(w.name)).sort().join(" dan ")}`).join("; "))}.` +
      (hasOp ? " Untuk isi tengah, tutup bagian yang sama di kolom 1 dan 2 dengan jari, lalu bandingkan sisanya." : "") + ` Target ≤ ${sp.tier === 3 ? 60 : 45} detik.`,
  });
  const kRule = sp.rules.find((R) => R.at === "k");
  const ann = (at: (r: number, c: number) => [number, number], s: number) =>
    colMarks(at) + (kRule ? [0, 1, 2].map((c) => redRing(...fp(CORNER[val(kRule, 2, c) as number], at(2, c), s), 12)).join("") : "");
  return {
    sub_type: sp.sub, tier: sp.tier, key: sp.key, ...POLA,
    stemSvg: layout(grid(null)), opts, pembahasan,
    pbhSvg: layout(grid(ans), { hl: [2, 2], ann, minW: 620, foot: sp.rules.map((R, i) => `${i + 1}) ${shortRule(R)}`) }),
  };
}

const L = (at: "s" | "a" | "k" | "n", vals: number[], p: number, o: number): Rule => ({ at, kind: "latin", vals, p, o });
const MTX: MSpec[] = [
  { tier: 2, key: "B", sub: "FIG-MTX-OVERLAY", base: {}, rules: [L("s", [0, 4, 6], 1, 0), { at: "g", kind: "op", op: "OR", c1: [["H", "V"], ["\\"], ["/", "\\"]], c2: [["V", "/"], ["H"], ["\\", "V"]] }] },
  { tier: 2, key: "E", sub: "FIG-MTX-LATIN", base: {}, rules: [L("s", [4, 6, 8], 1, 1), L("a", [0, 2, 6], 2, 0)] },
  { tier: 2, key: "A", sub: "FIG-MTX-KURANG", base: { s: 0 }, rules: [{ at: "k", kind: "step", b: 0, dr: 1, dc: 1 }, { at: "w", kind: "op", op: "K12", c1: [[0, 1, 2], [0, 1, 2, 3], [1, 2, 3]], c2: [[1], [0, 3], [2]] }] },
  { tier: 2, key: "C", sub: "FIG-MTX-HITUNG", base: {}, rules: [L("s", [0, 4, 6], 2, 1), { at: "n", kind: "sum", c1: [1, 2, 1], c2: [2, 1, 1] }] },
  // = prototipe matriks yang disetujui pemilik; urutan pengecoh sama dengan prototipe.
  { tier: 3, key: "E", sub: "FIG-MTX-XOR", base: {}, rules: [L("s", [0, 4, 6], 1, 0), { at: "k", kind: "step", b: 0, dr: 1, dc: 1 }, { at: "g", kind: "op", op: "XOR", c1: [["H", "/"], ["\\", "V"], ["H", "\\"]], c2: [["H", "V"], ["V", "/"], ["/", "\\"]] }], picks: ["sLatin0", "opOR", "opK21", "kDiam"] },
  { tier: 3, key: "D", sub: "FIG-MTX-OVERLAY", base: {}, rules: [L("s", [0, 6, 8], 2, 0), { at: "k", kind: "step", b: 1, dr: 1, dc: -1 }, { at: "w", kind: "op", op: "OR", c1: [[0], [1, 2], [0, 3]], c2: [[0, 1], [2], [2]] }] },
  { tier: 3, key: "A", sub: "FIG-MTX-LATIN", base: {}, rules: [L("s", [4, 6, 8], 1, 2), L("n", [1, 2, 3], 2, 0), { at: "k", kind: "step", b: 1, dr: 2, dc: 1 }] },
  { tier: 3, key: "B", sub: "FIG-MTX-XOR", base: {}, rules: [L("s", [0, 6, 8], 1, 1), { at: "n", kind: "sum", c1: [1, 1, 2], c2: [1, 2, 1] }, { at: "w", kind: "op", op: "XOR", c1: [[0, 1], [1, 2, 3], [0, 2, 3]], c2: [[1, 2], [3], [2, 3]] }] },
  { tier: 3, key: "C", sub: "FIG-MTX-PUTAR", base: {}, rules: [L("s", [0, 4, 6], 2, 0), { at: "f", kind: "oneblack", o: 1 }, { at: "a", kind: "step", b: 0, dr: -2, dc: 1 }] },
  { tier: 3, key: "D", sub: "FIG-MTX-KURANG", base: {}, rules: [L("s", [0, 6, 8], 1, 0), { at: "k", kind: "step", b: 2, dr: 1, dc: 1 }, { at: "n", kind: "sum", c1: [1, 2, 2], c2: [2, 1, 2] }, { at: "w", kind: "op", op: "K12", c1: [[0, 1, 3], [0, 1, 2, 3], [1, 2, 3]], c2: [[1], [2], [1, 3]] }] },
];

export const MTX_ITEMS: Draft[] = MTX.map((sp, i) => mtxItem(sp, i + 1));
