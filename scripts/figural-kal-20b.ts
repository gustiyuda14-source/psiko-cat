import assert from "node:assert/strict";
import { type Ann, RED, W, type Fig, type Fill, type Key, type Pt, analogyS, fp, foot, gridS, optionsRowS, place, r1, redArrow, redRing, redText, regular, sig, svgWrap, tf } from "./figural-lib";
import { dot, mv, poly } from "./figural-kal-4";

// Figural Simulasi 5 (package_number 20), PROTOTIPE: 35 analogi gambar + 37 ikon. Belum dihubungkan ke generator.
// Aturan sengaja berbeda dari pkg 2-5/13-19: menara tiga balok (urutan geser siklik + balok yang turun berbalik warna + balok tengah bergeser ke kanan
// + titik = 2 x balok hitam) dan ikon dengan titik = (sisi luar - sisi dalam) x jumlah garis (tiga ciri berhitung sekaligus).

export type Fig20B = { pkg: 20; seq: number; key: Key; instruksi: string; svg: string; tingkat: 2 | 3; pembahasan: string; pembahasan_svg: string };
export const FIG20B_ITEMS: Fig20B[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, tingkat: 2 | 3, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${key.toLowerCase()}\\.$`), `20#${seq}: pembahasan 2 paragraf + kunci`);
  assert.ok(!/\sid="/.test(pembahasan_svg), `20#${seq}: pembahasan_svg tanpa id (G-8)`);
  FIG20B_ITEMS.push({ pkg: 20, seq, key, instruksi, svg, tingkat, pembahasan, pembahasan_svg });
};
const ANALOGI = "Pilihlah satu gambar yang tepat untuk melengkapi hubungan gambar berikut.";
/** D-5: tidak ada dua opsi yang berimpit setelah diputar/dicerminkan. */
const assertNoAlias = (tag: string, opts: Fig[]) => opts.forEach((a, i) => opts.forEach((b, j) => {
  if (i !== j) for (const d of [0, 90, 180, 270]) for (const m of [false, true]) assert.notEqual(sig(tf(a, d, m)), sig(b), `${tag}: opsi ${i} berimpit dengan opsi ${j} (putar ${d}, cermin ${m})`);
}));

// 20#35 — analogi (HOTS, 4 lapis): menara tiga balok. (1) balok teratas turun ke dasar, dua lainnya naik satu tingkat; (2) balok yang turun berbalik warna;
// (3) balok tengah (setelah urutan baru) bergeser ke kanan; (4) banyak titik di bawah menara selalu dua kali banyak balok hitam.
{
  const H = 9, PITCH = 25, SH = 11, Y0 = -31, DOT_Y = 40;
  const SHAPES: Pt[][] = [
    [[-20, -H], [20, -H], [30, H], [-30, H]], // 0 trapesium
    [[-28, -H], [14, -H], [28, 0], [14, H], [-28, H]], // 1 pentagon runcing
    [[-26, -H], [4, -H], [4, -2], [26, -2], [26, H], [-26, H]], // 2 tangga
    [[-28, -H], [28, -H], [28, H], [-2, H], [-2, 2], [-28, 2]], // 3 takik
    [[-14, -H], [14, -H], [30, 0], [14, H], [-14, H], [-30, 0]], // 4 segi enam pipih
    [[-28, H], [-28, -H], [28, 2], [28, H]], // 5 baji
  ];
  type St = { s: number[]; f: Fill[]; off: number[]; n: number }; // atas -> bawah
  const nb = (f: Fill[]) => f.filter((v) => v === "b").length;
  const flip = (v: Fill): Fill => (v === "b" ? "w" : "b");
  const render = (x: St): Fig => [...x.s.flatMap((k, p) => mv([poly(SHAPES[k], x.f[p])], x.off[p], Y0 + PITCH * p)),
    ...Array.from({ length: x.n }, (_, i) => dot(r1((i - (x.n - 1) / 2) * 13), DOT_Y, 4.5, "b"))];
  const make = (s: number[], f: Fill[]): St => ({ s, f, off: [0, 0, 0], n: 2 * nb(f) });
  const rule = (a: St, o: { up?: boolean; noFlip?: boolean; shift?: number; dots?: number } = {}): St => {
    const s = o.up ? [a.s[2], a.s[0], a.s[1]] : [a.s[1], a.s[2], a.s[0]], f0 = o.up ? [a.f[2], a.f[0], a.f[1]] : [a.f[1], a.f[2], a.f[0]];
    const f = f0.map((v, p) => (!o.noFlip && p === (o.up ? 0 : 2) ? flip(v) : v)), off = [0, o.shift ?? SH, 0];
    return { s, f, off, n: o.dots ?? 2 * nb(f) };
  };
  const SA: St = make([0, 1, 2], ["b", "b", "w"]), SC: St = make([3, 4, 5], ["b", "w", "b"]);
  const SB = rule(SA), SANS = rule(SC);
  const A = render(SA), B = render(SB), C = render(SC), ans = render(SANS);
  assert.equal(SA.n, 4); assert.equal(SB.n, 2); assert.equal(SC.n, 4); assert.equal(SANS.n, 2);
  const opts = place(ans, [render(rule(SC, { up: true })), render(rule(SC, { noFlip: true })), render(rule(SC, { shift: -SH })), render(rule(SC, { dots: SC.n }))], "B");
  assertNoAlias("20#35", opts);
  // Bukti tunggal: semua bacaan (urutan x balik-warna x geser x aturan titik) yang menghasilkan B dari A, diterapkan ke C, harus menghasilkan kunci atau gambar yang bukan opsi.
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const subsets = [[], [0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]];
  const shifts: [number, number][] = [[-1, 0], ...[0, 1, 2].flatMap((p) => [[p, SH], [p, -SH]] as [number, number][])];
  const dotRules: ((x: St, n0: number) => number)[] = [];
  for (let d = -4; d <= 4; d++) dotRules.push((_, n0) => n0 + d);
  for (const k of [1, 2, 3]) dotRules.push((x) => k * nb(x.f), (x) => k * (3 - nb(x.f)), (x) => nb(x.f) + k, (x) => 3 - nb(x.f) + k);
  const reading = (p: number[], fl: number[], sh: [number, number], dr: (x: St, n0: number) => number) => (x: St): Fig => {
    const f = p.map((i) => x.f[i]); fl.forEach((q) => { f[q] = flip(f[q]); });
    const off = [0, 0, 0]; if (sh[0] >= 0) off[sh[0]] = sh[1];
    const y: St = { s: p.map((i) => x.s[i]), f, off, n: 0 }; y.n = Math.max(0, dr(y, x.n)); return render(y);
  };
  const sigB = sig(B), sigAns = sig(ans), optSigs = new Set(opts.map(sig)); let ok = 0, same = 0;
  for (const p of perms) for (const fl of subsets) for (const sh of shifts) for (const dr of dotRules) {
    const rd = reading(p, fl, sh, dr); if (sig(rd(SA)) !== sigB) continue; ok++;
    const c = sig(rd(SC)); if (c === sigAns) same++; else assert.ok(!optSigs.has(c), "20#35: ada bacaan alternatif A:B yang mengesahkan sebuah pengecoh");
  }
  assert.ok(ok >= 1 && same === ok, `20#35: ${ok} bacaan cocok A:B, ${same} memberi kunci`);
  assert.equal(opts.filter((o) => sig(o) === sigAns).length, 1);
  const ringBlk = (at: (r: number, c: number) => Pt, s: number, c: number, p: number, off = 0, w = 74, h = 24) => {
    const [x, y] = fp([off, Y0 + PITCH * p], at(0, c), s), k = s / 96;
    return `<rect x="${r1(x - (w / 2) * k)}" y="${r1(y - (h / 2) * k)}" width="${r1(w * k)}" height="${r1(h * k)}" rx="8" fill="none" stroke="${RED}" stroke-width="4"/>`;
  };
  const num = (at: (r: number, c: number) => Pt, s: number, c: number, y: number, t: string) => redText(...fp([-40, y + 6], at(0, c), s), t, 19);
  const ann: Ann = (at, s) => [0, 2].map((c) => redArrow(fp([46, Y0 + 2], at(0, c), s), fp([46, Y0 + 2 * PITCH - 3], at(0, c), s))).join("") +
    [1, 3].map((c) => ringBlk(at, s, c, 2) + ringBlk(at, s, c, 1, SH) + redRing(...fp([0, DOT_Y], at(0, c), s), 17) +
      num(at, s, c, Y0 + 2 * PITCH, "②") + num(at, s, c, Y0 + PITCH, "③") + num(at, s, c, DOT_Y, "④")).join("") +
    foot(["① balok teratas turun ke dasar, dua lainnya naik satu tingkat", "② balok yang turun berbalik warna", "③ balok tengah (urutan baru) bergeser ke kanan", "④ titik = 2 × banyak balok hitam"], at(0, 0)[1] + s / 2 + 40);
  add(35, "B", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada empat perubahan. (1) Urutan balok bergeser: balok teratas turun ke dasar, sedangkan dua balok lain naik satu tingkat (bangun runcing dan tangga naik, trapesium turun). (2) Balok yang turun berbalik warna: trapesium hitam menjadi putih. (3) Balok yang kini berada di tengah bergeser ke kanan. (4) Banyak titik di bawah selalu dua kali banyak balok hitam: gambar pertama punya 2 balok hitam dan 4 titik, gambar kedua punya 1 balok hitam dan 2 titik. Terapkan pada gambar ketiga: balok takik (hitam) turun ke dasar dan berbalik menjadi putih; segi enam pipih (putih) naik ke atas; baji (hitam) naik ke tengah dan bergeser ke kanan. Balok hitam tinggal satu (baji), jadi titiknya 2.\n\nOpsi a gugur karena urutan bergeser ke arah sebaliknya (balok dasar naik ke atas, bukan balok teratas turun). Opsi c gugur karena balok yang turun tidak berbalik warna (takik tetap hitam), sehingga titiknya pun menjadi 4. Opsi d gugur karena balok tengah bergeser ke kiri, bukan ke kanan. Opsi e gugur karena titiknya disalin dari gambar ketiga (4 titik), padahal balok hitamnya tinggal satu sehingga titiknya harus 2. Jawaban: b.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 168 }));
}

// 20#37 — ikon yang tidak termasuk kelompoknya (HOTS): jumlah titik = (sisi bangun luar - sisi bangun dalam) x jumlah garis di atas, kecuali satu.
// Cek buta sesi 5 menemukan versi pertama ambigu (dua gambar kembar rupa + aturan XOR warna/bentuk yang mengisolasi gambar lain). Versi ini: tiap gambar
// punya bangun luar/dalam/warna berbeda dari kembarannya, tak ada nilai ciri yang dimiliki tepat 4 gambar, nilai ciri gambar pelanggar selalu dimiliki gambar lain,
// dan tak ada relasi "ciri = fungsi(satu atau dua ciri lain)" yang berlaku pada 4 gambar selain pelanggar sehingga mengisolasi gambar lain.
{
  type I = { o: number; i: number; k: number; d: number; f: Fill };
  const L: I[] = [
    { o: 6, i: 5, k: 2, d: 2, f: "b" }, { o: 5, i: 4, k: 3, d: 3, f: "b" }, { o: 5, i: 3, k: 1, d: 2, f: "w" }, { o: 4, i: 3, k: 1, d: 1, f: "b" },
    { o: 6, i: 4, k: 3, d: 1, f: "w" }, // pelanggar: (6 - 4) x 3 = 6, bukan 1
  ];
  const ROT = (n: number) => (n === 4 ? 45 : 0);
  const fig = (x: I): Fig => [
    poly(regular(x.o, x.o === 4 ? 30 : 29, ROT(x.o)), x.f), poly(regular(x.i, x.i === 4 ? 14 : 12, ROT(x.i)), x.f === "b" ? "w" : "b"),
    ...Array.from({ length: x.k }, (_, j) => ({ k: "line" as const, a: [r1((j - (x.k - 1) / 2) * 12), -45] as Pt, b: [r1((j - (x.k - 1) / 2) * 12), -37] as Pt, w: 4 })),
    ...Array.from({ length: x.d }, (_, j) => dot(r1((j - (x.d - 1) / 2) * 13), 40, 4.5, "b")),
  ];
  const g = (x: I) => x.o - x.i, holds = (x: I) => x.d === g(x) * x.k;
  assert.deepEqual(L.map(holds), [true, true, true, true, false], "20#37: tepat satu gambar melanggar aturan");
  const feat: Record<string, (x: I) => string | number> = { o: (x) => x.o, i: (x) => x.i, k: (x) => x.k, d: (x) => x.d, f: (x) => x.f, g };
  // (a) tak ada nilai ciri yang dimiliki tepat 4 gambar; nilai ciri pelanggar selalu dimiliki gambar lain (kunci tak tertebak dari "yang unik")
  for (const [n, h] of Object.entries(feat)) {
    const v = L.map(h);
    for (const e of v) assert.notEqual(v.filter((y) => y === e).length, 4, `20#37: ciri ${n} memisahkan satu gambar`);
    assert.ok(v.slice(0, 4).includes(v[4]), `20#37: nilai ciri ${n} pelanggar unik`);
  }
  // tampilan: tak ada dua gambar yang sama bangun luar-dalam-warnanya
  assert.equal(new Set(L.map((x) => `${x.o}${x.i}${x.f}`)).size, 5, "20#37: dua gambar kembar rupa");
  // (b) tak satu pun persamaan sederhana a = b, a > b, a = b + c, a = b - c, a = b x c (a, b, c dari sisi luar, sisi dalam, garis, titik) berlaku pada tepat 4 gambar
  const N = ["o", "i", "k", "d"] as const; let tested = 0;
  const only4 = (name: string, t: (x: I) => boolean) => { tested++; assert.notEqual(L.filter(t).length, 4, `20#37: persamaan ${name} memisahkan tepat satu gambar`); };
  for (const a of N) for (const b of N) if (a !== b) {
    only4(`${a}=${b}`, (x) => x[a] === x[b]); only4(`${a}>${b}`, (x) => x[a] > x[b]);
    for (const c of N) if (c !== a && c !== b) { only4(`${a}=${b}+${c}`, (x) => x[a] === x[b] + x[c]); only4(`${a}=${b}-${c}`, (x) => x[a] === x[b] - x[c]); only4(`${a}=${b}*${c}`, (x) => x[a] === x[b] * x[c]); }
  }
  for (const a of N) { only4(`${a} genap`, (x) => x[a] % 2 === 0); for (const v of [1, 2, 3, 4, 5, 6]) only4(`${a}=${v}`, (x) => x[a] === v); }
  assert.ok(tested > 100);
  // (c) titik bukan fungsi dari satu ciri lain
  for (const a of ["o", "i", "k", "f"] as const) assert.ok(new Set(L.map((x) => `${x[a]}:${x.d}`)).size > new Set(L.map((x) => x[a])).size, `20#37: titik ditentukan oleh ${a}`);
  // (d) bacaan sederhana "titik = sisi luar - sisi dalam" dan "titik = garis" memisahkan 2/3, bukan 4/1
  assert.deepEqual(L.map((x) => x.d === g(x)), [false, false, true, true, false]);
  assert.deepEqual(L.map((x) => x.d === x.k), [true, true, false, true, false]);
  // (e) relasi t = fungsi(S), |S| <= 2, yang berlaku pada 4 gambar selain j tetapi dilanggar j (tuple S milik j sudah terlihat dengan nilai t lain): hanya boleh mengisolasi pelanggar (j = 4)
  const names = Object.keys(feat), subsets: string[][] = names.map((n) => [n]);
  for (let u = 0; u < names.length; u++) for (let v = u + 1; v < names.length; v++) subsets.push([names[u], names[v]]);
  for (const S of subsets) for (const t of names) if (!S.includes(t)) for (let j = 0; j < 4; j++) {
    const m = new Map<string, unknown>(); let ok = true;
    L.forEach((x, n) => { if (n === j) return; const key = S.map((q) => feat[q](x)).join("|"), val = feat[t](x); if (m.has(key) && m.get(key) !== val) ok = false; m.set(key, val); });
    if (!ok || (m.size === 4 && S.length === 2)) continue;
    const kj = S.map((q) => feat[q](L[j])).join("|");
    assert.ok(!(m.has(kj) && m.get(kj) !== feat[t](L[j])), `20#37: relasi ${t}=f(${S.join(",")}) mengisolasi gambar ${"abcde"[j]}`);
  }
  const opts = place(fig(L[4]), L.slice(0, 4).map(fig), "E");
  assertNoAlias("20#37", opts);
  const o = optionsRowS(opts, 20, { hl: 4 }), lab = o.body + L.map((x, i) => redText(o.at(i)[0], o.bottom + 14, `(${x.o}−${x.i})×${x.k} = ${g(x) * x.k}`, 20) + redText(o.at(i)[0], o.bottom + 42, `titik ${x.d} ${holds(x) ? "=" : "≠"} ${g(x) * x.k}`, 21)).join("") +
    redText(W / 2, o.bottom + 86, "(sisi luar − sisi dalam) × garis = titik", 24);
  add(37, "E", "Pilihlah satu gambar yang tidak termasuk dalam kelompoknya.", svgWrap(o.bottom, optionsRowS(opts, 20).body), 3,
    "Pada setiap gambar, hitung sisi bangun luar, sisi bangun dalam, garis pendek di atas, dan titik di bawah. Jumlah titik sama dengan selisih sisi luar dan sisi dalam dikali jumlah garis. Gambar a: (6 − 5) × 2 = 2 titik. Gambar b: (5 − 4) × 3 = 3 titik. Gambar c: (5 − 3) × 1 = 2 titik. Gambar d: (4 − 3) × 1 = 1 titik. Gambar e: (6 − 4) × 3 = 6 titik, tetapi titiknya hanya 1.\n\nHubungan yang lebih sederhana tidak cukup. \"Titik = garis\" berlaku pada a, b, dan d tetapi tidak pada c (2 titik lawan 1 garis) dan e (1 titik lawan 3 garis), dan \"titik = sisi luar − sisi dalam\" berlaku pada c dan d saja, sehingga keduanya tidak memisahkan satu gambar. Ciri tunggal juga tidak memisahkan satu gambar saja: bangun luar terbagi segi enam (a, e), segi lima (b, c), dan persegi (d); bangun dalam terbagi segi lima (a), persegi (b, e), dan segitiga (c, d); garis terbagi 2 (a), 3 (b, e), dan 1 (c, d); titik terbagi 2 (a, c), 3 (b), dan 1 (d, e); warna bangun luar terbagi hitam (a, b, d) dan putih (c, e). Hanya gambar e yang tidak memenuhi hubungan titik = (sisi luar − sisi dalam) × garis. Jawaban: e.",
    svgWrap(o.bottom + 100, lab));
}

// 20#36 — analogi (HOTS, 4 lapis): empat bangun siku di kotak 2×2. (1) semua bangun pindah satu kotak searah jarum jam; (2) bangun yang mendarat di kolom kanan diputar 90° searah jarum jam;
// (3) bangun yang mendarat di kiri bawah berbalik warna; (4) banyak titik di bawah = banyak bangun putih. Bangun gambar ketiga berbeda dari gambar pertama (set kedua).
{
  type F = Fill; type G = { k: number; r: number; f: F }; type S = { g: G[]; n: number }; // g: kiri atas, kanan atas, kanan bawah, kiri bawah
  const GL: Pt[][] = [
    [[-10, -12], [-3, -12], [-3, 5], [11, 5], [11, 12], [-10, 12]], // 0 huruf L
    [[-9, -12], [11, -4], [-3, 2], [-3, 12], [-9, 12]], // 1 bendera
    [[-11, -12], [11, -12], [11, 0], [4, 0], [4, 12], [-4, 12], [-4, 0], [-11, 0]], // 2 huruf T
    [[-11, 12], [-11, -12], [11, 12]], // 3 segitiga siku
    [[-3, -12], [10, -12], [10, 12], [-10, 12], [-10, 4], [-3, 4]], // 4 huruf J
    [[-11, -3], [0, -12], [11, -3], [11, 12], [-11, 12]], // 5 rumah
    [[-11, 12], [-11, 0], [0, 0], [0, -12], [11, -12], [11, 12]], // 6 tangga
    [[-11, 12], [-11, -12], [0, -12], [11, 0], [11, 12]], // 7 persegi sudut terpotong
  ];
  GL.forEach((p, k) => assert.equal(new Set([0, 90, 180, 270].map((d) => sig(tf([poly(p, "w")], d)))).size, 4, `20#36: bangun ${k} harus punya 4 arah berbeda`));
  const flip = (f: F): F => (f === "b" ? "w" : "b");
  const cnt = (g: G[], f: F) => g.filter((x) => x.f === f).length;
  const CELL: Pt[] = [[-22, -20], [22, -20], [22, 20], [-22, 20]];
  const render = (s: S): Fig => [...s.g.flatMap((q, p) => mv(tf([poly(GL[q.k], q.f)], 90 * q.r), ...CELL[p])),
    ...Array.from({ length: s.n }, (_, i) => dot(r1((i - (s.n - 1) / 2) * 13), 42, 4, "b"))];
  const stKey = (s: S) => JSON.stringify(s);
  type O = { ccw?: boolean; norot?: boolean; noflip?: boolean; dotsB?: boolean };
  const truth = (x: S, o: O = {}): S => {
    const from = o.ccw ? [1, 2, 3, 0] : [3, 0, 1, 2]; // kotak tujuan <- kotak asal
    const g = from.map((src, dest) => { const q = x.g[src]; return { k: q.k, r: !o.norot && (dest === 1 || dest === 2) ? (q.r + 1) % 4 : q.r, f: !o.noflip && dest === 3 ? flip(q.f) : q.f }; });
    return { g, n: o.dotsB ? cnt(g, "b") : cnt(g, "w") };
  };
  const mk = (ks: number[], rs: number[], fs: F[]): S => { const g = ks.map((k, i) => ({ k, r: rs[i], f: fs[i] })); return { g, n: cnt(g, "w") }; };
  const SA = mk([0, 1, 2, 3], [0, 3, 1, 2], ["b", "w", "b", "w"]), SC = mk([4, 5, 6, 7], [0, 1, 3, 2], ["w", "b", "b", "w"]);
  const SB = truth(SA), SANS = truth(SC);
  assert.deepEqual([SA.n, SB.n, SC.n, SANS.n], [2, 3, 2, 3]);
  assert.notEqual(cnt(SANS.g, "w"), cnt(SANS.g, "b"), "20#36: pengecoh titik harus berbeda dari kunci");
  const dist = [{ ccw: true }, { norot: true }, { noflip: true }, { dotsB: true }].map((o) => render(truth(SC, o)));
  const A = render(SA), B = render(SB), C = render(SC), ans = render(SANS);
  const opts = place(ans, dist, "A");
  assertNoAlias("20#36", opts);
  // Bukti tunggal: setiap bacaan (24 urutan pindah × putar per kotak/menurut warna × balik warna per kotak/menurut warna × aturan titik) yang menjadikan A → B harus menjadikan C → kunci.
  const perms: number[][] = []; const pp = (a: number[], r: number[]) => { if (!a.length) perms.push(r); else a.forEach((v, i) => pp([...a.slice(0, i), ...a.slice(i + 1)], [...r, v])); }; pp([0, 1, 2, 3], []);
  type Rot = (dest: number, fb: F) => number; type Flp = (dest: number, fb: F) => boolean; type Dot = (y: G[], n0: number) => number;
  const rots: Rot[] = []; for (let v = 0; v < 256; v++) rots.push((p) => (v >> (2 * p)) & 3);
  for (const fb of ["b", "w"] as F[]) for (const d of [1, 2, 3]) rots.push((_, f) => (f === fb ? d : 0));
  const flps: Flp[] = []; for (let m = 0; m < 16; m++) flps.push((p) => !!((m >> p) & 1)); for (const fb of ["b", "w"] as F[]) flps.push((_, f) => f === fb);
  const dots: Dot[] = []; for (let d = -4; d <= 4; d++) dots.push((_, n0) => n0 + d); for (let c = 0; c <= 4; c++) dots.push(() => c);
  for (const k of [1, 2, 3]) dots.push((y) => k * cnt(y, "w"), (y) => k * cnt(y, "b"), (y) => cnt(y, "w") + k, (y) => cnt(y, "b") + k);
  const apply = (x: S, p: number[], r: Rot, fl: Flp, dr: Dot): S => { const g = p.map((src, dest) => { const o = x.g[src]; return { k: o.k, r: (o.r + r(dest, o.f)) % 4, f: fl(dest, o.f) ? flip(o.f) : o.f }; }); return { g, n: Math.max(0, dr(g, x.n)) }; };
  const kB = stKey(SB), kAns = stKey(SANS); let ok = 0, same = 0;
  for (const p of perms) for (const r of rots) for (const fl of flps) for (const dr of dots) { if (stKey(apply(SA, p, r, fl, dr)) !== kB) continue; ok++; if (stKey(apply(SC, p, r, fl, dr)) === kAns) same++; }
  assert.ok(ok >= 1 && same === ok, `20#36: ${ok} bacaan cocok A:B, ${same} memberi kunci`);
  assert.equal(opts.filter((o) => sig(o) === sig(ans)).length, 1);
  const ring = (at: (r: number, c: number) => Pt, s: number, c: number, p: number, n: string, off: Pt) => redRing(...fp(CELL[p], at(0, c), s), 14) + redText(...fp(off, at(0, c), s), n, 17);
  const ann: Ann = (at, s) => [1, 3].map((c) => ring(at, s, c, 1, "②", [40, -34]) + ring(at, s, c, 2, "②", [40, 6]) + ring(at, s, c, 3, "③", [-40, 6]) + redRing(...fp([0, 42], at(0, c), s), 17) + redText(...fp([-30, 47], at(0, c), s), "④", 17)).join("") +
    foot(["① semua bangun pindah satu kotak searah jarum jam", "② bangun yang mendarat di kolom kanan diputar 90° searah jarum jam", "③ bangun yang mendarat di kiri bawah berbalik warna", "④ titik = banyak bangun putih"], at(0, 0)[1] + s / 2 + 40);
  add(36, "A", ANALOGI, analogyS([A, B, C, null], opts), 3,
    "Dari gambar pertama ke kedua ada empat perubahan. (1) Keempat bangun pindah satu kotak searah jarum jam: segitiga siku dari kiri bawah ke kiri atas, huruf L dari kiri atas ke kanan atas, bendera dari kanan atas ke kanan bawah, huruf T dari kanan bawah ke kiri bawah. (2) Bangun yang mendarat di kolom kanan (huruf L dan bendera) ikut diputar 90° searah jarum jam, sedangkan dua bangun di kolom kiri tidak diputar. (3) Bangun yang mendarat di kiri bawah (huruf T) berbalik warna, dari hitam menjadi putih. (4) Banyak titik di bawah sama dengan banyak bangun putih: gambar pertama punya 2 bangun putih dan 2 titik, gambar kedua punya 3 bangun putih dan 3 titik. Terapkan pada gambar ketiga: persegi sudut terpotong pindah ke kiri atas, huruf J ke kanan atas dan diputar 90°, rumah ke kanan bawah dan diputar 90°, tangga (hitam) ke kiri bawah dan menjadi putih. Bangun putihnya ada 3 (persegi sudut terpotong, huruf J, tangga), jadi titiknya 3.\n\nOpsi b gugur karena bangun berpindah berlawanan arah jarum jam. Opsi c gugur karena bangun di kolom kanan tidak diputar. Opsi d gugur karena tangga di kiri bawah tetap hitam. Opsi e gugur karena titiknya 2, yaitu banyak bangun hitam, padahal aturannya banyak bangun putih. Jawaban: a.",
    analogyS([A, B, C, ans], null, { hl: true, ann, foot: 168 }));
}
