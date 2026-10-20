import assert from "node:assert/strict";
import { type Key } from "./figural-lib";
import { type Draft, type MC, type Wrong, ANALOGI, COLOR, CORNER_NAME, DIR_NAME, SHAPE_NAME, cellFig, finish, inv, layout } from "./k12-spasial-core";

// K12 batch 26 — analogi A : B = C : ? (10 butir). Bukti D-1: untuk tiap kelompok atribut (bangun, warna, jarum,
// titik pojok, jumlah titik) dicoba semua tafsir A → B yang wajar (tetap, tukar, ±n sisi, ×2, ÷2, balik warna,
// selalu warna/posisi tertentu, putar, cermin). Jawaban harus termasuk hasil tafsir itu pada C; setiap pengecoh
// harus punya minimal satu kelompok yang TIDAK bisa dihasilkan tafsir mana pun (jadi tidak ada pengecoh yang bisa dibela).

const md = (x: number, m: number) => ((x % m) + m) % m;
const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
type Tup = (number | string | undefined)[];
type Prog = (m: MC) => Tup | null;
const okShape = (v: number | undefined) => v === undefined || v === 0 || (v >= 3 && v <= 8);
function numSlot(get: (m: MC) => number | undefined, other: (m: MC) => number | undefined, constV: number | undefined) {
  const arith = (f: (x: number) => number) => (m: MC) => { const v = get(m); if (v === undefined || v === 0) return null; const y = f(v); return Number.isInteger(y) && y >= 3 && y <= 8 ? y : null; };
  return [get, other, () => constV, ...[-2, -1, 1, 2].map((d) => arith((x) => x + d)), arith((x) => x * 2), arith((x) => x / 2)] as ((m: MC) => number | undefined | null)[];
}
function fillSlot(get: (m: MC) => "b" | "w" | undefined, other: (m: MC) => "b" | "w" | undefined) {
  const v = (f: "b" | "w" | undefined) => (f === undefined ? undefined : inv(f));
  return [get, (m: MC) => v(get(m)), other, (m: MC) => v(other(m)), () => "b" as const, () => "w" as const];
}
const KMAPS = [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2], [1, 0, 3, 2], [3, 2, 1, 0], [0, 3, 2, 1], [2, 1, 0, 3]]; // putar 0–3, cermin tegak/datar/diagonal
function groups(B: MC): Record<string, Prog[]> {
  const pair = <T,>(xs: ((m: MC) => T)[], ys: ((m: MC) => T)[]): Prog[] => xs.flatMap((x) => ys.map((y) => (m: MC) => { const a = x(m), b = y(m); return a === null || b === null ? null : [a as never, b as never]; }));
  return {
    bangun: pair(numSlot((m) => m.s, (m) => m.t, B.s), numSlot((m) => m.t, (m) => m.s, B.t)),
    warna: pair(fillSlot((m) => m.f ?? "w", (m) => m.tf), fillSlot((m) => m.tf, (m) => m.f ?? "w")),
    jarum: [...Array.from({ length: 8 }, (_, d) => (m: MC) => [m.a === undefined ? undefined : md(m.a + d, 8)]), (m: MC) => [m.a === undefined ? undefined : md(8 - m.a, 8)], (m: MC) => [m.a === undefined ? undefined : md(4 - m.a, 8)], () => [B.a]],
    titik: [...KMAPS.map((p) => (m: MC) => [m.k === undefined ? undefined : p[m.k]]), () => [B.k]],
    jumlah: [...[-3, -2, -1, 0, 1, 2, 3].map((d) => (m: MC) => [m.n === undefined ? undefined : m.n + d]), (m: MC) => [m.n === undefined ? undefined : m.n * 2], (m: MC) => [m.n === undefined || m.n % 2 ? undefined : m.n / 2], () => [B.n]],
  };
}
const tupOf: Record<string, (m: MC) => Tup> = { bangun: (m) => [m.s, m.t], warna: (m) => [m.f ?? "w", m.tf], jarum: (m) => [m.a], titik: (m) => [m.k], jumlah: (m) => [m.n] };
const eqT = (a: Tup | null, b: Tup) => !!a && a.length === b.length && a.every((x, i) => x === b[i]);

type R = { g: "tukar"; warna: "ikut" | "tetap" } | { g: "sisi" | "jarum" | "titik" | "jumlah"; d: number } | { g: "warna" } | { g: "tetapN" };
type ASpec = { tier: 2 | 3; key: Key; A: MC; B: MC; C: MC; ans: MC; rules: R[]; wrongs: (Wrong<MC> & { rule: number })[] };
const nm = (s: number | undefined) => SHAPE_NAME[s ?? 0];
const sgn = (d: number) => (d > 0 ? "bertambah" : "berkurang");
const titikTxt = (d: number) => (Math.abs(d) === 2 ? "pindah ke pojok seberang" : `pindah satu pojok ${d === 1 ? "searah" : "berlawanan arah"} jarum jam`);

function anaItem(sp: ASpec, no: number): Draft {
  const tag = `analogi #${no}`, { A, B, C, ans } = sp;
  for (const m of [A, B, C, ans, ...sp.wrongs.map((w) => w.v)]) { assert.ok(okShape(m.s) && okShape(m.t), `${tag}: bangun tidak sah`); if (m.t !== undefined) assert.ok(m.tf, `${tag}: warna bangun dalam wajib ditulis`); }
  const G = groups(B), res: Record<string, Tup[]> = {};
  for (const [g, progs] of Object.entries(G)) {
    res[g] = progs.filter((p) => eqT(p(A), tupOf[g](B))).map((p) => p(C)).filter((x): x is Tup => !!x);
    assert.ok(res[g].some((t) => eqT(t, tupOf[g](ans))), `${tag}: jawaban kelompok ${g} tidak dihasilkan tafsir A → B mana pun`);
  }
  sp.wrongs.forEach((w) => assert.ok(Object.keys(G).some((g) => !res[g].some((t) => eqT(t, tupOf[g](w.v)))), `${tag}: pengecoh ${w.name} bisa dibela dengan tafsir lain`));

  const line = (r: R): string => {
    if (r.g === "tukar") return r.warna === "ikut"
      ? `Dalam dan luar bertukar: ${nm(A.t)} kecil di dalam menjadi bingkai besar, ${nm(A.s)} menjadi kecil di dalamnya. Warna ikut bangunnya (${nm(A.t)} tetap ${COLOR(A.tf)}, ${nm(A.s)} tetap ${COLOR(A.f)}).`
      : `Dalam dan luar bertukar, tetapi warnanya tetap di tempat: bingkai luar tetap ${COLOR(A.f)}, bangun dalam tetap ${COLOR(A.tf)}.`;
    if (r.g === "sisi") return `Jumlah sisi bingkai ${sgn(r.d)} ${Math.abs(r.d)}: ${nm(A.s)} → ${nm(B.s)}.`;
    if (r.g === "warna") return `Warna bingkai dibalik: ${COLOR(A.f)} → ${COLOR(B.f)}.`;
    if (r.g === "jarum") return `Jarum berputar ${45 * Math.abs(r.d)}° ${r.d > 0 ? "searah" : "berlawanan arah"} jarum jam: ke ${DIR_NAME[A.a!]} → ke ${DIR_NAME[B.a!]}.`;
    if (r.g === "titik") return `Titik kecil ${titikTxt(r.d)}: ${CORNER_NAME[A.k!]} → ${CORNER_NAME[B.k!]}.`;
    if (r.g === "jumlah") return `Titik di bawah bangun ${sgn(r.d)} ${Math.abs(r.d)}: ${A.n} → ${B.n}.`;
    return `Jumlah titik di bawah bangun tidak berubah (${A.n} → ${B.n}).`;
  };
  const onC = (r: R): string => {
    if (r.g === "tukar") return `${nm(C.t)} menjadi bingkai dan ${nm(C.s)} masuk ke dalam (${r.warna === "ikut" ? `${nm(C.t)} tetap ${COLOR(C.tf)}` : `bingkai tetap ${COLOR(C.f)}`})`;
    if (r.g === "sisi") return `${nm(C.s)} menjadi ${nm(ans.s)}`;
    if (r.g === "warna") return `bingkai menjadi ${COLOR(ans.f)}`;
    if (r.g === "jarum") return `jarum ke ${DIR_NAME[C.a!]} menjadi ke ${DIR_NAME[ans.a!]}`;
    if (r.g === "titik") return `titik di ${CORNER_NAME[C.k!]} pindah ke ${CORNER_NAME[ans.k!]}`;
    return `${C.n} titik menjadi ${ans.n} titik`;
  };
  const short = (r: R): string =>
    r.g === "tukar" ? `dalam ↔ luar bertukar, warna ${r.warna === "ikut" ? "ikut bangunnya" : "tetap di tempat"}`
      : r.g === "sisi" ? `sisi bingkai ${r.d > 0 ? "+" : "−"}${Math.abs(r.d)}`
      : r.g === "warna" ? "warna bingkai dibalik"
      : r.g === "jarum" ? `jarum ${45 * Math.abs(r.d)}° ${r.d > 0 ? "searah" : "berlawanan arah"} jarum jam`
      : r.g === "titik" ? `titik ${titikTxt(r.d)}`
      : r.g === "jumlah" ? `titik bawah ${r.d > 0 ? "+" : "−"}${Math.abs(r.d)}` : "titik bawah tetap";
  const p1 = [`Ubah hubungan A → B menjadi kalimat pendek, lalu terapkan ke C.`, ...sp.rules.map((r, i) => `${i + 1}. ${line(r)}`),
    `Terapkan ke C: ${sp.rules.filter((r) => r.g !== "tetapN").map(onC).join("; ")}.`];
  const { opts, pembahasan } = finish({
    ans, wrongs: sp.wrongs, key: sp.key, fig: cellFig, p1,
    tips: (L) => `tulis aturan A → B dalam beberapa kata (${sp.rules.map(short).join("; ")}), lalu cek satu aturan per putaran sambil mencoret opsi. ${cap(sp.rules.map((r, i) => [short(r), sp.wrongs.filter((w) => w.rule === i).map((w) => L(w.name)).sort()] as const).filter(([, ls]) => ls.length).map(([s, ls]) => `aturan "${s}" menggugurkan opsi ${ls.join(" dan ")}`).join("; "))}. Target ≤ ${sp.tier === 3 ? 50 : 40} detik.`,
  });
  return {
    sub_type: "FIG-ANALOGI", tier: sp.tier, key: sp.key, ...ANALOGI,
    stemSvg: layout([[cellFig(A), cellFig(B), cellFig(C), null]], { gap: 44, seps: [":", "=", ":"] }), opts, pembahasan,
    pbhSvg: layout([[cellFig(A), cellFig(B), cellFig(C), cellFig(ans)]], { gap: 44, seps: [":", "=", ":"], hl: [0, 3], minW: 620, foot: sp.rules.map((r, i) => `${i + 1}) ${short(r)}`) }),
  };
}

const W = (name: string, rule: number, v: MC, isi: string, alasan: string) => ({ name, rule, v, isi, alasan });
const ANA: ASpec[] = [
  // = prototipe analogi yang disetujui pemilik; pengecoh "titik di kanan atas" diganti (bisa dibela dengan tafsir "titik selalu di kanan atas").
  { tier: 2, key: "B", A: { s: 6, f: "w", t: 3, tf: "b", k: 0 }, B: { s: 3, f: "b", t: 6, tf: "w", k: 1 }, C: { s: 4, f: "w", t: 0, tf: "b", k: 2 }, ans: { s: 0, f: "b", t: 4, tf: "w", k: 3 },
    rules: [{ g: "tukar", warna: "ikut" }, { g: "titik", d: 1 }],
    wrongs: [W("warnaTinggal", 0, { s: 0, f: "w", t: 4, tf: "b", k: 3 }, "lingkaran putih, persegi hitam", "bangunnya bertukar tetapi warnanya tertinggal di tempat lama."),
      W("takTukar", 0, { s: 4, f: "w", t: 0, tf: "b", k: 3 }, "persegi tetap di luar", "dalam dan luar lupa ditukar; hanya titiknya yang dipindah."),
      W("titikSeberang", 1, { s: 0, f: "b", t: 4, tf: "w", k: 0 }, "titik di kiri atas", "titik dipindah dua pojok (ke pojok seberang), padahal hanya satu pojok."),
      W("titikDiam", 1, { s: 0, f: "b", t: 4, tf: "w", k: 2 }, "titik masih di kanan bawah", "titik lupa dipindah.")] },
  { tier: 2, key: "D", A: { s: 4, f: "w", n: 2 }, B: { s: 5, f: "b", n: 2 }, C: { s: 6, f: "w", n: 3 }, ans: { s: 7, f: "b", n: 3 },
    rules: [{ g: "sisi", d: 1 }, { g: "warna" }, { g: "tetapN" }],
    wrongs: [W("sisiDiam", 0, { s: 6, f: "b", n: 3 }, "segi enam hitam", "jumlah sisi tidak ditambah."),
      W("sisiLompat", 0, { s: 8, f: "b", n: 3 }, "segi delapan hitam", "jumlah sisi ditambah 2, padahal dari A ke B hanya bertambah 1."),
      W("warnaTetap", 1, { s: 7, f: "w", n: 3 }, "segi tujuh putih", "warna bingkai tidak dibalik."),
      W("titikTambah", 2, { s: 7, f: "b", n: 4 }, "4 titik di bawah", "titik di bawah ikut ditambah, padahal dari A ke B jumlahnya tetap.")] },
  { tier: 2, key: "A", A: { s: 0, f: "w", a: 0, n: 2 }, B: { s: 0, f: "w", a: 2, n: 3 }, C: { s: 8, f: "w", a: 3, n: 2 }, ans: { s: 8, f: "w", a: 5, n: 3 },
    rules: [{ g: "jarum", d: 2 }, { g: "jumlah", d: 1 }],
    wrongs: [W("jarumBalik", 0, { s: 8, f: "w", a: 1, n: 3 }, "jarum ke kanan atas", "jarum diputar 90° berlawanan arah jarum jam."),
      W("jarumDiam", 0, { s: 8, f: "w", a: 3, n: 3 }, "jarum ke kanan bawah", "jarum tidak diputar."),
      W("nDiam", 1, { s: 8, f: "w", a: 5, n: 2 }, "2 titik di bawah", "titik di bawah tidak ditambah."),
      W("nLompat", 1, { s: 8, f: "w", a: 5, n: 4 }, "4 titik di bawah", "titik ditambah 2, padahal dari A ke B hanya bertambah 1.")] },
  { tier: 2, key: "E", A: { s: 8, f: "w", k: 0 }, B: { s: 6, f: "w", k: 2 }, C: { s: 6, f: "b", k: 0 }, ans: { s: 4, f: "b", k: 2 },
    rules: [{ g: "sisi", d: -2 }, { g: "titik", d: 2 }],
    wrongs: [W("sisiKurang1", 0, { s: 5, f: "b", k: 2 }, "segi lima", "jumlah sisi hanya dikurangi 1, padahal dari A ke B berkurang 2."),
      W("sisiKurang3", 0, { s: 3, f: "b", k: 2 }, "segitiga", "jumlah sisi dikurangi 3, padahal dari A ke B berkurang 2."),
      W("titik1", 1, { s: 4, f: "b", k: 1 }, "titik di kanan atas", "titik hanya pindah satu pojok, padahal pindah ke pojok seberang."),
      W("titikDiam", 1, { s: 4, f: "b", k: 0 }, "titik di kiri atas", "titik tidak dipindah.")] },
  { tier: 3, key: "C", A: { s: 6, f: "w", t: 0, tf: "b", n: 1, k: 0 }, B: { s: 0, f: "b", t: 6, tf: "w", n: 2, k: 1 }, C: { s: 4, f: "w", t: 3, tf: "b", n: 2, k: 3 }, ans: { s: 3, f: "b", t: 4, tf: "w", n: 3, k: 0 },
    rules: [{ g: "tukar", warna: "ikut" }, { g: "jumlah", d: 1 }, { g: "titik", d: 1 }],
    wrongs: [W("takTukar", 0, { s: 4, f: "w", t: 3, tf: "b", n: 3, k: 0 }, "persegi tetap di luar", "dalam dan luar lupa ditukar."),
      W("warnaTinggal", 0, { s: 3, f: "w", t: 4, tf: "b", n: 3, k: 0 }, "segitiga putih, persegi hitam", "bangunnya bertukar tetapi warnanya tertinggal di tempat lama."),
      W("nKurang", 1, { s: 3, f: "b", t: 4, tf: "w", n: 1, k: 0 }, "1 titik di bawah", "titik di bawah dikurangi, padahal dari A ke B bertambah 1."),
      W("titikDiam", 2, { s: 3, f: "b", t: 4, tf: "w", n: 3, k: 3 }, "titik di kiri bawah", "titik pojok lupa dipindah.")] },
  { tier: 3, key: "B", A: { s: 4, f: "w", a: 0 }, B: { s: 5, f: "b", a: 7 }, C: { s: 6, f: "w", a: 2 }, ans: { s: 7, f: "b", a: 1 },
    rules: [{ g: "sisi", d: 1 }, { g: "warna" }, { g: "jarum", d: -1 }],
    wrongs: [W("sisiDiam", 0, { s: 6, f: "b", a: 1 }, "segi enam", "jumlah sisi tidak ditambah."),
      W("warnaTetap", 1, { s: 7, f: "w", a: 1 }, "segi tujuh putih", "warna bingkai tidak dibalik."),
      W("jarumSearah", 2, { s: 7, f: "b", a: 3 }, "jarum ke kanan bawah", "jarum diputar 45° searah jarum jam, padahal dari A ke B berputar berlawanan arah."),
      W("jarumDiam", 2, { s: 7, f: "b", a: 2 }, "jarum ke kanan", "jarum tidak diputar.")] },
  { tier: 3, key: "E", A: { s: 5, f: "w", t: 0, tf: "b", k: 1, n: 3 }, B: { s: 0, f: "w", t: 5, tf: "b", k: 0, n: 2 }, C: { s: 8, f: "w", t: 4, tf: "b", k: 2, n: 4 }, ans: { s: 4, f: "w", t: 8, tf: "b", k: 1, n: 3 },
    rules: [{ g: "tukar", warna: "tetap" }, { g: "titik", d: -1 }, { g: "jumlah", d: -1 }],
    wrongs: [W("takTukar", 0, { s: 8, f: "w", t: 4, tf: "b", k: 1, n: 3 }, "segi delapan tetap di luar", "dalam dan luar lupa ditukar."),
      W("warnaIkut", 0, { s: 4, f: "b", t: 8, tf: "w", k: 1, n: 3 }, "persegi hitam, segi delapan putih", "warna ikut pindah bersama bangunnya, padahal di A → B warna tetap di tempat (luar putih, dalam hitam)."),
      W("titikDiam", 1, { s: 4, f: "w", t: 8, tf: "b", k: 2, n: 3 }, "titik di kanan bawah", "titik pojok lupa dipindah."),
      W("nDiam", 2, { s: 4, f: "w", t: 8, tf: "b", k: 1, n: 4 }, "4 titik di bawah", "titik di bawah tidak dikurangi.")] },
  { tier: 3, key: "A", A: { s: 4, f: "w", a: 0, n: 3 }, B: { s: 5, f: "b", a: 3, n: 2 }, C: { s: 5, f: "w", a: 2, n: 4 }, ans: { s: 6, f: "b", a: 5, n: 3 },
    rules: [{ g: "sisi", d: 1 }, { g: "warna" }, { g: "jarum", d: 3 }, { g: "jumlah", d: -1 }],
    wrongs: [W("sisiLompat", 0, { s: 7, f: "b", a: 5, n: 3 }, "segi tujuh", "jumlah sisi ditambah 2, padahal dari A ke B hanya bertambah 1."),
      W("warnaTetap", 1, { s: 6, f: "w", a: 5, n: 3 }, "segi enam putih", "warna bingkai tidak dibalik."),
      W("jarumBalik", 2, { s: 6, f: "b", a: 7, n: 3 }, "jarum ke kiri atas", "jarum diputar 135° berlawanan arah jarum jam, arahnya terbalik."),
      W("nDiam", 3, { s: 6, f: "b", a: 5, n: 4 }, "4 titik di bawah", "titik di bawah tidak dikurangi.")] },
  { tier: 3, key: "D", A: { s: 3, f: "w", t: 0, tf: "b", k: 0, n: 1 }, B: { s: 0, f: "b", t: 3, tf: "w", k: 2, n: 3 }, C: { s: 8, f: "w", t: 5, tf: "b", k: 1, n: 2 }, ans: { s: 5, f: "b", t: 8, tf: "w", k: 3, n: 4 },
    rules: [{ g: "tukar", warna: "ikut" }, { g: "titik", d: 2 }, { g: "jumlah", d: 2 }],
    wrongs: [W("takTukar", 0, { s: 8, f: "w", t: 5, tf: "b", k: 3, n: 4 }, "segi delapan tetap di luar", "dalam dan luar lupa ditukar."),
      W("warnaTinggal", 0, { s: 5, f: "w", t: 8, tf: "b", k: 3, n: 4 }, "segi lima putih, segi delapan hitam", "bangunnya bertukar tetapi warnanya tertinggal di tempat lama."),
      W("titik1", 1, { s: 5, f: "b", t: 8, tf: "w", k: 0, n: 4 }, "titik di kiri atas", "titik hanya pindah satu pojok, padahal pindah ke pojok seberang."),
      W("nDiam", 2, { s: 5, f: "b", t: 8, tf: "w", k: 3, n: 2 }, "2 titik di bawah", "titik di bawah tidak ditambah.")] },
  { tier: 3, key: "C", A: { s: 3, f: "w", k: 3, n: 1 }, B: { s: 4, f: "b", k: 1, n: 3 }, C: { s: 6, f: "w", k: 2, n: 2 }, ans: { s: 7, f: "b", k: 0, n: 4 },
    rules: [{ g: "sisi", d: 1 }, { g: "warna" }, { g: "titik", d: 2 }, { g: "jumlah", d: 2 }],
    wrongs: [W("sisiDiam", 0, { s: 6, f: "b", k: 0, n: 4 }, "segi enam", "jumlah sisi tidak ditambah."),
      W("warnaTetap", 1, { s: 7, f: "w", k: 0, n: 4 }, "segi tujuh putih", "warna bingkai tidak dibalik."),
      W("titik1", 2, { s: 7, f: "b", k: 3, n: 4 }, "titik di kiri bawah", "titik hanya pindah satu pojok, padahal pindah ke pojok seberang."),
      W("nDiam", 3, { s: 7, f: "b", k: 0, n: 2 }, "2 titik di bawah", "titik di bawah tidak ditambah.")] },
];

export const ANA_ITEMS: Draft[] = ANA.map((sp, i) => anaItem(sp, i + 1));
