import assert from "node:assert/strict";
import { type Ann, RED, type Fig, type Fill, type Key, type Prim, type Pt, dashLine, fp, foot, gridS, place, ptf, r1, redArrow, redRing, redText, regular, sig, tf } from "./figural-lib";
import { assertChiral, assertNoGlobalAlias, colArrows, dot, grid3, inv, invF, md, mv, poly } from "./figural-kal-4";

// Figural Simulasi 5 (package_number 20): matriks 28-30, rotasi 31-32. Semua HOTS, lebih berat dari pkg 19. Belum dihubungkan ke generator/seed (G-5: menunggu persetujuan pemilik).
// 20#28: 4 lapis, tiap lapis memakai garis berbeda (baris, kolom, diagonal utama, diagonal lain); 20#31: 4 langkah, putar + cermin + putar + warna.
// 20#29 (nested + titik besar, 5 aturan), 20#30 (kuadran XOR+putar, titik jumlah, segitiga sudut; 4 aturan), 20#32 (papan kiral + segitiga, 5 langkah) ditulis ulang agar tiap detail penentu >= 14.5 satuan gambar (>= 9 px di lebar 360).
export type Fig20 = { pkg: 20; seq: number; key: Key; instruksi: string; svg: string; tingkat: 3; pembahasan: string; pembahasan_svg: string };
export const FIG20_ITEMS: Fig20[] = [];
const add = (seq: number, key: Key, instruksi: string, svg: string, pembahasan: string, pembahasan_svg: string) => {
  assert.match(pembahasan, new RegExp(`^[^\\n]+\\n\\n[^\\n]+Jawaban: ${key.toLowerCase()}\\.$`), `20#${seq}: pembahasan 2 paragraf + kunci`);
  FIG20_ITEMS.push({ pkg: 20, seq, key, instruksi, svg, tingkat: 3, pembahasan, pembahasan_svg });
};
const POLA = "Pilihlah satu gambar untuk melengkapi pola di bawah ini.";
const pip = (P: Pt[], [x, y]: Pt) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const letters = (opts: string[]) => (n: string) => "abcde"[opts.indexOf(n)];

// 20#28 — matriks (HOTS, 4 lapis, tiap lapis di garis yang berbeda):
// (1) bentuk luar: segi delapan / belah ketupat / tanda tambah tepat sekali per baris, kolom, DAN diagonal utama (kiri atas–kanan bawah);
// (2) jumlah titik 1–3: tepat sekali per baris, kolom, DAN diagonal lain (kanan atas–kiri bawah), diagonal utama selalu 1 titik;
// (3) warna bangun: tepat satu hitam per baris dan kolom, diagonal utama tanpa hitam;
// (4) tanda bendera di dalam: +45° ↻ per kolom (ke kanan), −45° ↺ per baris (ke bawah), jadi diagonal utama tidak berubah.
{
  type C = { s: number; f: Fill; k: number; n: number };
  const PLUS: Pt[] = [[-17, -36], [17, -36], [17, -17], [36, -17], [36, 17], [17, 17], [17, 36], [-17, 36], [-17, 17], [-36, 17], [-36, -17], [-17, -17]];
  const SH: Pt[][] = [regular(8, 34, 22.5), [[0, -39], [39, 0], [0, 39], [-39, 0]], PLUS].map((p) => p.map(([x, y]): Pt => [x, r1(y - 6)]));
  const MK: Pt[] = [[-3.5, -15], [3.5, -15], [15, -10], [3.5, -4], [3.5, 15], [-3.5, 15]]; // bendera: tiang + panji (kiral)
  const row = (n: number): Fig => Array.from({ length: n }, (_, i) => dot(r1((i - (n - 1) / 2) * 11), 40, 3.5));
  const cell = ({ s, f, k, n }: C): Fig => [poly(SH[s], f), ...mv(tf([poly(MK, inv(f))], 45 * k), 0, -6), ...row(n)];
  for (let s = 0; s < 3; s++) for (let k = 0; k < 8; k++) assert.ok(tf([poly(MK, "b")], 45 * k).every((q) => q.k === "poly" && q.pts.every(([x, y]) => pip(SH[s], [x, y - 6]))), "20#28: bendera harus muat di dalam bangun");
  const G = (r: number, c: number): C => ({ s: (r + c) % 3, f: c === (r + 1) % 3 ? "b" : "w", k: (1 + c - r + 8) % 8, n: ((r - c + 3) % 3) + 1 });
  const grid = (last: C) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : G(r, c))));
  // Pemeriksa seluruh aturan; mengembalikan lapis yang dilanggar.
  const bad = (g: C[][]): string[] => {
    const rows = g, cols = [0, 1, 2].map((c) => g.map((x) => x[c])), d1 = [0, 1, 2].map((i) => g[i][i]), d2 = [0, 1, 2].map((i) => g[i][2 - i]);
    const uniq = (l: C[], key: "s" | "n") => new Set(l.map((x) => x[key])).size === 3;
    const out: string[] = [];
    if (![...rows, ...cols, d1].every((l) => uniq(l, "s"))) out.push("bentuk");
    if (![...rows, ...cols, d2].every((l) => uniq(l, "n")) || new Set(d1.map((x) => x.n)).size !== 1) out.push("titik");
    if (![...rows, ...cols].every((l) => l.filter((x) => x.f === "b").length === 1) || d1.some((x) => x.f === "b")) out.push("warna");
    const step = (a: C, b: C) => (b.k - a.k + 8) % 8;
    if (!(rows.every((l) => step(l[0], l[1]) === 1 && step(l[1], l[2]) === 1) && cols.every((l) => step(l[0], l[1]) === 7 && step(l[1], l[2]) === 7) && d1.every((x) => x.k === d1[0].k))) out.push("arah");
    return out;
  };
  assert.deepEqual(bad(grid(G(2, 2))), [], "20#28: kisi lengkap harus memenuhi semua aturan");
  // Aturan alternatif harus gugur pada 8 sel yang terlihat.
  const vis = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [r, c] as const)).filter(([r, c]) => !(r === 2 && c === 2));
  const mustFail = (name: string, f: (r: number, c: number) => Partial<C>) => assert.ok(vis.some(([r, c]) => Object.entries(f(r, c)).some(([k, v]) => G(r, c)[k as keyof C] !== v)), `20#28: aturan alternatif '${name}' harus gugur`);
  mustFail("bendera ↻ ke kedua arah", (r, c) => ({ k: (1 + c + r) % 8 }));
  mustFail("bendera hanya per kolom", (_, c) => ({ k: (1 + c) % 8 }));
  mustFail("bendera hanya per baris", (r) => ({ k: (1 - r + 8) % 8 }));
  mustFail("titik naik per kolom", (_, c) => ({ n: c + 1 }));
  mustFail("titik = (baris + kolom) mod 3", (r, c) => ({ n: ((r + c) % 3) + 1 }));
  mustFail("titik = nomor baris", (r) => ({ n: r + 1 }));
  mustFail("bentuk memutar ke arah lain (diagonal utama konstan)", (r, c) => ({ s: (r - c + 3) % 3 }));
  mustFail("bentuk tetap per baris", (r) => ({ s: r }));
  mustFail("hitam di diagonal utama", (r, c) => ({ f: r === c ? "b" : "w" }));
  mustFail("hitam di diagonal lain", (r, c) => ({ f: r + c === 2 ? "b" : "w" }));
  mustFail("hitam bergeser ke kiri", (r, c) => ({ f: c === (r + 2) % 3 ? "b" : "w" }));
  const K = G(2, 2);
  assert.deepEqual(K, { s: 1, f: "w", k: 1, n: 1 });
  const D: Record<string, C> = { bentuk: { ...K, s: 0 }, titik: { ...K, n: 3 }, warna: { ...K, f: "b" }, arah: { ...K, k: 5 } };
  const names = ["bentuk", "titik", "warna", "arah"], key: Key = "D";
  const order = names.map((x) => D[x]); order.splice("ABCDE".indexOf(key), 0, K);
  const tags = [...names]; tags.splice("ABCDE".indexOf(key), 0, "kunci");
  order.forEach((o, i) => assert.deepEqual(bad(grid(o)), tags[i] === "kunci" ? [] : [tags[i]], `20#28: opsi ${"abcde"[i]} harus melanggar tepat lapis ${tags[i]}`));
  const opts = place(cell(K), names.map((x) => cell(D[x])), key);
  const L = letters(tags);
  const at = (r: number, c: number) => cell(G(r, c)), ans = cell(K);
  assertNoGlobalAliasPairs();
  function assertNoGlobalAliasPairs() { // transformasi global putar/cermin/balik warna yang memetakan kolom 1→3 (baris 1-2) tidak boleh mengesahkan opsi lain
    for (const d of [0, 90, 180, 270]) for (const m of [false, true]) for (const v of [false, true]) {
      const T = (f: Fig) => (v ? invF(tf(f, d, m)) : tf(f, d, m));
      if (![0, 1].every((r) => sig(T(at(r, 0))) === sig(at(r, 2)))) continue;
      opts.forEach((o, i) => i !== "ABCDE".indexOf(key) && assert.notEqual(sig(T(at(2, 0))), sig(o), `20#28: opsi ${"abcde"[i]} sah lewat transformasi global`));
    }
  }
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((i) => redRing(...fp([0, -6], a(i, i), s), 68)).join("") + [0, 1, 2].map((i) => redRing(...fp([0, 40], a(i, 2 - i), s), 24)).join("") +
    foot(["→ bentuk: tepat sekali per baris, kolom, diagonal utama", "→ titik: 1–3 tepat sekali per baris, kolom, diagonal lain", "→ warna: satu hitam per baris dan kolom, diagonal utama putih", "→ bendera: +45° per kolom, −45° per baris, diagonal tetap"], a(2, 0)[1] + s / 2 + 42);
  add(28, key, POLA, gridS(grid3(at, null), opts),
    `Ada empat aturan, dan tiap aturan berlaku pada garis yang berbeda. (1) Bentuk luar: segi delapan, belah ketupat, dan tanda tambah muncul tepat sekali di setiap baris, setiap kolom, dan diagonal utama (kiri atas ke kanan bawah, lingkaran merah besar). Baris 3 sudah memuat tanda tambah dan segi delapan, jadi sel kosong berbentuk belah ketupat. (2) Jumlah titik: 1, 2, dan 3 titik muncul tepat sekali di setiap baris, setiap kolom, dan diagonal lain (kanan atas ke kiri bawah, lingkaran merah kecil), sedangkan diagonal utama selalu 1 titik. Baris 3 sudah memuat 3 titik dan 2 titik, jadi sel kosong 1 titik, sesuai diagonal utama. (3) Warna: setiap baris dan setiap kolom memuat tepat satu bangun hitam, dan diagonal utama tidak memuat bangun hitam. Baris 3 sudah punya bangun hitam (tanda tambah), jadi sel kosong putih. (4) Tanda bendera di dalam bangun berputar 45° searah jarum jam dari kolom ke kolom dan 45° berlawanan arah jarum jam dari baris ke baris, sehingga di diagonal utama arahnya tidak berubah. Baris 3: tiang ke kiri atas, ke atas, lalu ke kanan atas, jadi sel kosong berbendera hitam dengan tiang ke kanan atas.\n\nOpsi ${L("bentuk")} gugur karena bentuknya segi delapan, menyalin sel di kirinya, padahal segi delapan sudah ada di baris 3 dan kolom 3. Opsi ${L("titik")} gugur karena bertitik 3, menyalin sel paling kiri baris 3, padahal 3 titik sudah ada di baris itu dan diagonal utama harus 1 titik. Opsi ${L("warna")} gugur karena hitam, mengikuti sel di atasnya, padahal baris 3 dan kolom 3 sudah punya bangun hitam dan diagonal utama harus putih. Opsi ${L("arah")} gugur karena tiang bendera menunjuk ke kiri bawah: bendera ikut diputar searah jarum jam dari baris ke baris, padahal arah antarbaris berlawanan dengan arah antarkolom. Jawaban: ${key.toLowerCase()}.`,
    gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 170 }));
}

// 20#31 — rotasi (HOTS, 4 langkah): putar 90° ↻, cermin tegak, putar 135° ↺, warna dibalik. Bangun majemuk kiral (tiang + panji + pangkal + 2 bagian hitam).
// Bersih = cermin tegak lalu putar 135° ↻, warna dibalik. Pengecoh = satu langkah dilewati / arah putar terbalik / urutan tertukar / warna tidak dibalik.
{
  const base: Fig = [poly([[-4, -36], [4, -36], [34, -23], [4, -10], [4, 20], [18, 20], [18, 34], [-28, 34], [-28, 20], [-4, 20]], "w"), dot(15, -23, 5.5, "b"), poly([[-24, 24], [-12, 24], [-12, 30], [-24, 30]], "b")];
  assertChiral(base, "20#31");
  const iso = new Set<string>();
  for (let d = 0; d < 360; d += 45) for (const m of [false, true]) iso.add(sig(tf(base, d, m)));
  assert.equal(iso.size, 16, "20#31: bangun tanpa simetri, 16 putar/cermin 45° semuanya berbeda");
  type Op = ["R", number] | ["M"] | ["V"];
  type St = { m: boolean; a: number; v: boolean };
  // Keadaan = R(a)·M^m, lalu warna. Putar: a += d. Cermin tegak sesudahnya: M·R(a)·M^m = R(−a)·M^(m+1).
  const run = (ops: Op[]): St => ops.reduce<St>((s, o) => (o[0] === "R" ? { ...s, a: md(s.a + o[1]) } : o[0] === "M" ? { ...s, m: !s.m, a: md(-s.a) } : { ...s, v: !s.v }), { m: false, a: 0, v: false });
  const fig = (s: St): Fig => (s.v ? invF : (f: Fig) => f)(tf(base, s.a, s.m));
  const R1: Op = ["R", 90], M: Op = ["M"], R3: Op = ["R", -135], V: Op = ["V"];
  const stepFigs = [[], [R1], [R1, M], [R1, M, R3], [R1, M, R3, V]].map((o) => fig(run(o)));
  const KS = run([R1, M, R3, V]);
  assert.deepEqual(KS, { m: true, a: 135, v: true }, "20#31: hasil bersih = cermin tegak lalu putar 135° ↻, warna dibalik");
  for (let i = 1; i < 5; i++) { // tiap langkah memang mengubah gambar
    assert.notEqual(sig(stepFigs[i]), sig(stepFigs[i - 1]), `20#31: langkah ${i} tidak mengubah gambar`);
  }
  // Rotasi/cermin sungguhan, bukan hanya aljabar: lacak ujung tiang dan arah panji per langkah.
  const tip = (f: Fig) => (f[0] as { pts: Pt[] }).pts[0], pennant = (f: Fig) => (f[0] as { pts: Pt[] }).pts[2];
  assert.deepEqual([tip(stepFigs[4]), pennant(stepFigs[4])], [ptf([-4, -36], 135, true), ptf([34, -23], 135, true)], "20#31: lacak titik");
  const D: [string, Op[]][] = [
    ["lewat", [R1, R3, V]],
    ["tukar", [M, R1, R3, V]],
    ["balik", [R1, M, ["R", 135], V]],
    ["warna", [R1, M, R3]],
  ];
  const key: Key = "B", tags = D.map(([n]) => n); tags.splice("ABCDE".indexOf(key), 0, "kunci");
  const states = D.map(([, o]) => run(o)); states.splice("ABCDE".indexOf(key), 0, KS);
  assert.equal(new Set(states.map((s) => JSON.stringify(s))).size, 5, "20#31: lima opsi harus berbeda (cermin, sudut, warna)");
  assert.ok(states.every((s) => s.a % 45 === 0));
  const opts = place(fig(KS), D.map(([, o]) => fig(run(o))), key);
  const L = letters(tags);
  const lbl = [["", "awal"], ["① putar 90°", "searah"], ["② cermin", "tegak"], ["③ putar 135°", "berlawanan"], ["④ warna", "dibalik"]];
  const steps: Ann = (at, s) => lbl.map(([a, b], i) => {
    const [x, y] = at(0, i), t = (y + s / 2 + 28);
    return (i ? redArrow([at(0, i - 1)[0] + s / 2 + 4, y], [x - s / 2 - 4, y]) + redText(x, t, a, 20) + redText(x, t + 24, b, 20) : redText(x, t, b, 20));
  }).join("") + dashLine([at(0, 1)[0], at(0, 1)[1] - s / 2 - 8], [at(0, 1)[0], at(0, 1)[1] + s / 2 + 8], RED) +
    redText(425, at(0, 0)[1] + s / 2 + 98, "hasil bersih: cermin tegak, putar 135° searah, warna dibalik", 22);
  add(31, key, "Gambar di atas mengalami empat langkah berurutan: (1) diputar 90° searah jarum jam, (2) dicerminkan terhadap garis tegak, (3) diputar 135° berlawanan arah jarum jam, dan (4) warnanya dibalik (hitam menjadi putih, putih menjadi hitam). Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[base]], opts, { size: 170, foot: 24 }),
    `Kerjakan empat langkah berurutan; ujung tiang adalah ujung yang berpanji, dan panji menempel pada sisi kanan tiang jika tiang dibaca dari pangkal ke ujungnya. (1) Putar 90° searah jarum jam: tiang rebah dengan ujung berpanji ke kanan, panji menunjuk ke bawah, pangkal di kiri. (2) Cermin terhadap garis tegak: kiri dan kanan bertukar, sehingga ujung berpanji ke kiri, pangkal di kanan, dan panji (kini di sisi kiri tiang jika dibaca dari pangkal) tetap menunjuk ke bawah. (3) Putar 135° berlawanan arah jarum jam: ujung tiang turun ke kanan bawah, pangkal naik ke kiri atas, dan panji menunjuk ke kanan atas. (4) Balik warna: bangun menjadi hitam, sedangkan lingkaran di panji dan kotak kecil di pangkal menjadi putih. Langkah 1 sampai 3 sama dengan satu cermin tegak lalu putar 135° searah jarum jam.\n\nOpsi ${L("lewat")} gugur karena langkah cermin dilewati: gambar hanya diputar, jadi panji berada di sisi kanan tiang (tidak berbalik) dan ujung tiang di kiri atas. Opsi ${L("tukar")} gugur karena urutan putar 90° dan cermin tertukar (dicerminkan dulu, baru diputar): ujung tiang di kiri atas dan panji menunjuk ke kiri bawah. Opsi ${L("balik")} gugur karena putaran 135° dilakukan searah jarum jam, bukan berlawanan: ujung tiang di kanan atas dan panji menunjuk ke kiri atas. Opsi ${L("warna")} gugur karena langkah terakhir dilewati: bentuknya benar, tetapi bangun masih putih dengan bagian hitam. Jawaban: ${key.toLowerCase()}.`,
    gridS([stepFigs], null, { size: 112, gap: 34, top: 14, hl: [0, 4], ann: steps, foot: 130 }));
}


// 20#29 — matriks (HOTS, 5 aturan; bangun dalam/luar + titik besar): (1) bangun luar kolom berikutnya = bangun dalam kolom ini; (2) bangun dalam yang baru = bangun ketiga
// (yang tidak ada di sel sebelumnya); (3) jumlah titik hitam (1–4) membentuk deret selisih tetap per baris; (4) bangun luar hitam jika titik ≥ 3, putih jika ≤ 2;
// (5) bangun dalam selalu berwarna kebalikan bangun luar. Detail terkecil: titik r 7.5 (diameter 15 satuan gambar), bangun dalam ≥ 28 satuan; tanpa deret kotak kecil.
{
  type C = { o: number; i: number; n: number; fo: Fill; fi: Fill };
  const shp = (k: number, R: number, f: Fill, cy: number): Fig => [k === 0 ? dot(0, cy, r1(R * 0.78), f) : poly(regular(k === 1 ? 4 : 3, R, k === 1 ? 45 : 0).map(([x, y]): Pt => [x, r1(y + cy)]), f)];
  const cyOf = (o: number) => (o === 2 ? 1 : -8), RO = 44, RI = 20;
  const cell = ({ o, i, n, fo, fi }: C): Fig => [...shp(o, RO, fo, cyOf(o)), ...shp(i, RI, fi, cyOf(o)), ...Array.from({ length: n }, (_, j) => dot(r1((j - (n - 1) / 2) * 19), 37, 7.5))];
  for (let o = 0; o < 3; o++) for (let i = 0; i < 3; i++) if (o !== i) { // bangun dalam harus muat di bangun luar (titik sudut / 16 titik tepi lingkaran)
    const O = (shp(o, RO, "w", cyOf(o))[0] as { pts?: Pt[] }).pts, I = shp(i, RI, "w", cyOf(o))[0] as { pts?: Pt[]; r?: number };
    const edge: Pt[] = I.pts ?? Array.from({ length: 16 }, (_, t): Pt => [r1(I.r! * Math.cos((t * Math.PI) / 8)), r1(cyOf(o) + I.r! * Math.sin((t * Math.PI) / 8))]);
    assert.ok(edge.every(([x, y]) => (O ? pip(O, [x, y]) : Math.hypot(x, y - cyOf(o)) < RO * 0.78 - 4)), `20#29: bangun dalam ${i} tidak muat di bangun luar ${o}`);
  }
  const P0 = [[0, 1], [2, 0], [1, 2]], NR = [[1, 1, 1], [4, 3, 2], [2, 3, 4]], nx = ([o, i]: number[]) => [i, 3 - o - i];
  const mk = (o: number, i: number, n: number): C => { const fo: Fill = n >= 3 ? "b" : "w"; return { o, i, n, fo, fi: inv(fo) }; };
  const G = (r: number, c: number): C => { let p = P0[r]; for (let t = 0; t < c; t++) p = nx(p); return mk(p[0], p[1], NR[r][c]); };
  const grid = (last: C) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : G(r, c))));
  const bad = (g: C[][]): string[] => { // lapis yang dilanggar
    const out: string[] = [], pr = g.flatMap((l) => [[l[0], l[1]], [l[1], l[2]]]);
    if (!pr.every(([a, b]) => b.o === a.i)) out.push("luar");
    if (!pr.every(([a, b]) => b.i === 3 - a.o - a.i)) out.push("dalam");
    if (!g.every((l) => l[2].n === 2 * l[1].n - l[0].n)) out.push("titik");
    if (!g.flat().every((x) => x.fo === (x.n >= 3 ? "b" : "w"))) out.push("warna");
    if (!g.flat().every((x) => x.fi === inv(x.fo))) out.push("balik");
    return out;
  };
  assert.deepEqual(bad(grid(G(2, 2))), [], "20#29: kisi lengkap harus memenuhi semua aturan");
  const K = G(2, 2);
  assert.deepEqual(K, { o: 0, i: 1, n: 4, fo: "b", fi: "w" });
  // Bukti tunggal titik: semua rumus a·k1 + b·k2 + c (a, b ∈ −1..2, c ∈ −4..6), maks, min, selisih yang cocok pada baris 1-2 harus memberi 4 (atau di luar 1–4) pada baris 3.
  const fam: ((x: number, y: number) => number)[] = [Math.max, Math.min, (x, y) => Math.abs(x - y)];
  for (let a = -1; a <= 2; a++) for (let b = -1; b <= 2; b++) for (let c = -4; c <= 6; c++) fam.push((x, y) => a * x + b * y + c);
  for (const f of fam) if ([0, 1].every((r) => f(NR[r][0], NR[r][1]) === NR[r][2])) { const v = f(NR[2][0], NR[2][1]); assert.ok(v === 4 || v < 1 || v > 4, `20#29: rumus titik alternatif memberi ${v}`); }
  // Bukti tunggal warna: ambang "hitam jika titik ≥ t" hanya cocok untuk t = 3 pada 8 sel yang terlihat.
  const vis = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [r, c] as const)).filter(([r, c]) => !(r === 2 && c === 2));
  assert.deepEqual([1, 2, 3, 4, 5].filter((t) => vis.every(([r, c]) => G(r, c).fo === (NR[r][c] >= t ? "b" : "w"))), [3], "20#29: ambang warna harus tunggal");
  // Aturan alternatif harus gugur pada 8 sel yang terlihat.
  const mustFail = (name: string, f: (r: number, c: number) => Partial<C>) => assert.ok(vis.some(([r, c]) => Object.entries(f(r, c)).some(([k, v]) => G(r, c)[k as keyof C] !== v)), `20#29: aturan alternatif '${name}' harus gugur`);
  mustFail("bangun luar naik siklik (baris + kolom)", (r, c) => ({ o: (r + c) % 3 }));
  mustFail("bangun luar tetap per baris", (r) => ({ o: P0[r][0] }));
  mustFail("bangun dalam tetap per baris", (r) => ({ i: P0[r][1] }));
  mustFail("luar dan dalam hanya bertukar tempat", (r, c) => ({ o: P0[r][c % 2], i: P0[r][1 - (c % 2)] }));
  mustFail("bangun dalam = bangun luar sel sebelumnya", (r, c) => ({ i: G(r, Math.max(c - 1, 0)).o, ...(c === 0 ? { i: P0[r][1] } : {}) }));
  mustFail("luar hitam jika ganjil", (r, c) => ({ fo: NR[r][c] % 2 ? "b" : "w" }));
  mustFail("luar hitam hanya di kolom 3", (_, c) => ({ fo: c === 2 ? "b" : "w" }));
  mustFail("luar putih-hitam-putih per kolom", (_, c) => ({ fo: c === 1 ? "b" : "w" }));
  const D: Record<string, C> = { luar: { ...K, o: 2 }, dalam: { ...K, i: 2 }, titik: mk(K.o, K.i, 2), warna: { ...K, fo: "w", fi: "b" } };
  const names = ["luar", "dalam", "titik", "warna"], key: Key = "C", tags = [...names]; tags.splice("ABCDE".indexOf(key), 0, "kunci");
  const order = names.map((x) => D[x]); order.splice("ABCDE".indexOf(key), 0, K);
  order.forEach((o, i) => assert.deepEqual(bad(grid(o)), tags[i] === "kunci" ? [] : [tags[i]], `20#29: opsi ${"abcde"[i]} harus melanggar tepat lapis ${tags[i]}`));
  const opts = place(cell(K), names.map((x) => cell(D[x])), key), L = letters(tags);
  const at = (r: number, c: number) => cell(G(r, c)), ans = cell(K);
  assertNoGlobalAlias("20#29", [0, 1].map((r) => [at(r, 0), at(r, 2)]), at(2, 0), opts, key);
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((r) => [0, 1].map((c) => redRing(...fp([0, cyOf(G(r, c).o) ], a(r, c), s), 27)).join("")).join("") +
    [0, 1, 2].map((r) => { const [x, y] = a(r, 2), d = NR[r][1] - NR[r][0]; return redText(x + s / 2 + 12, y + 9, d === 0 ? "tetap" : `${d > 0 ? "+" : "−"}${Math.abs(d)}`, 26, "start"); }).join("") +
    foot(["→ bangun dalam (cincin merah) jadi bangun luar berikutnya", "→ bangun dalam baru: bangun ketiga yang belum muncul", "→ titik hitam: deret dengan selisih tetap per baris", "→ bangun luar hitam jika titik ≥ 3, putih jika ≤ 2", "→ bangun dalam selalu kebalikan warna bangun luar"], a(2, 0)[1] + s / 2 + 42);
  add(29, key, POLA, gridS(grid3(at, null), opts), `Ada lima aturan. (1) Bangun luar kolom berikutnya adalah bangun dalam kolom sebelumnya (cincin merah): di baris 1 persegi pindah dari dalam kolom 1 ke luar kolom 2, lalu segitiga pindah dari dalam kolom 2 ke luar kolom 3. (2) Bangun dalam yang baru adalah bangun ketiga, yang tidak ada di sel sebelumnya. Baris 3 kolom 2 berisi segitiga (luar) dan lingkaran (dalam), sehingga kolom 3 berbangun luar lingkaran dan berbangun dalam persegi. (3) Jumlah titik hitam membentuk deret dengan selisih tetap di setiap baris: baris 1 tetap (1, 1, 1), baris 2 berkurang 1 (4, 3, 2), dan baris 3 bertambah 1 (2, 3), jadi kolom 3 berisi 4 titik. (4) Bangun luar hitam jika titiknya 3 atau lebih dan putih jika 2 atau kurang (baris 1: 1 titik, putih; baris 2: 4 dan 3 titik hitam, 2 titik putih), sehingga bangun luar kolom 3 hitam karena ada 4 titik. (5) Bangun dalam selalu berwarna kebalikan bangun luar, jadi putih. Jawabannya lingkaran hitam berisi persegi putih dengan 4 titik.\n\nOpsi ${L("luar")} gugur karena bangun luarnya segitiga, menyalin bangun luar kolom 2, padahal bangun luar kolom 3 harus bangun dalam kolom 2 (lingkaran). Opsi ${L("dalam")} gugur karena bangun dalamnya segitiga, yaitu bangun luar kolom 2, padahal bangun dalam yang baru harus bangun ketiga (persegi). Opsi ${L("titik")} gugur karena hanya 2 titik (sama dengan kolom 1), padahal deret baris 3 naik 1 menjadi 4 (warna bangun luarnya sudah sesuai dengan 2 titik, jadi hanya jumlah titik yang salah). Opsi ${L("warna")} gugur karena bangun luarnya putih, padahal 4 titik berarti bangun luar hitam. Jawaban: ${key.toLowerCase()}.`, gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 206 }));
}

// 20#30 — matriks (HOTS, 4 aturan): kotak besar terbagi 4 bagian (hitam/putih), tanpa pola mini. (1) bagian hitam kolom 3 = bagian yang hitam di TEPAT SATU dari kolom 1 dan kolom 2;
// (2) hasilnya diputar 90° ↻; (3) jumlah titik kolom 3 = titik kolom 1 + kolom 2; (4) segitiga hitam di pojok kiri atas hanya pada diagonal kanan atas–kiri bawah.
// Detail terkecil: bagian 24×24 satuan gambar, titik r 7.5, segitiga sudut kaki 24.
{
  type P = number[];
  type C = { p: P; n: number; t: boolean };
  const px = (s: string): P => [...s].map(Number), same = (a: P, b: P) => a.every((x, i) => x === b[i]); // urutan bagian: kiri atas, kanan atas, kiri bawah, kanan bawah
  const rot = (p: P): P => [p[2], p[0], p[3], p[1]], rotc = (p: P): P => [p[1], p[3], p[0], p[2]], rot2 = (p: P): P => rot(rot(p));
  const TR: [string, (p: P) => P][] = [["tetap", (p) => p], ["putar ↻", rot], ["putar ↺", rotc], ["putar 180°", rot2], ["cermin tegak", (p) => [p[1], p[0], p[3], p[2]]],
    ["cermin mendatar", (p) => [p[2], p[3], p[0], p[1]]], ["cermin diagonal", (p) => [p[0], p[2], p[1], p[3]]], ["cermin diagonal lain", (p) => [p[3], p[1], p[2], p[0]]]];
  const OP: [string, (a: P, b: P) => P][] = [["atau", (a, b) => a.map((x, i) => x | b[i])], ["dan", (a, b) => a.map((x, i) => x & b[i])], ["salah satu", (a, b) => a.map((x, i) => x ^ b[i])], ["kolom 1 bukan kolom 2", (a, b) => a.map((x, i) => x & (1 - b[i]))],
    ["kolom 2 bukan kolom 1", (a, b) => a.map((x, i) => b[i] & (1 - x))], ["bukan dan", (a, b) => a.map((x, i) => 1 - (x & b[i]))], ["sama", (a, b) => a.map((x, i) => 1 - (x ^ b[i]))], ["bukan atau", (a, b) => a.map((x, i) => 1 - (x | b[i]))],
    ["kolom 1", (a) => a], ["kolom 2", (_, b) => b], ["bukan kolom 1", (a) => a.map((x) => 1 - x)], ["bukan kolom 2", (_, b) => b.map((x) => 1 - x)]];
  const [OR, XOR] = [OP[0][1], OP[2][1]];
  const PT = [["1011", "0001"], ["0100", "0110"], ["1101", "1110"]].map((r) => r.map(px)), ND = [[1, 2], [1, 1], [1, 3]];
  const G = (r: number, c: number): C => ({ p: c < 2 ? PT[r][c] : rot(XOR(PT[r][0], PT[r][1])), n: c < 2 ? ND[r][c] : ND[r][0] + ND[r][1], t: r + c === 2 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const s = G(r, c).p.reduce((a, b) => a + b, 0); assert.ok(s >= 1 && s <= 3 && G(r, c).n >= 1 && G(r, c).n <= 4, `20#30: sel ${r},${c} tidak sah`); }
  // Bukti tunggal pola: dari 12 operasi × 8 transformasi, hanya (salah satu → putar ↻) cocok pada baris 1-2.
  const win = OP.flatMap((o) => TR.map((t) => [o[0], t[0], [0, 1].every((r) => same(t[1](o[1](PT[r][0], PT[r][1])), G(r, 2).p))] as const)).filter((x) => x[2]).map((x) => `${x[0]} → ${x[1]}`);
  assert.deepEqual(win, ["salah satu → putar ↻"], "20#30: aturan pola harus tunggal");
  // Bukti tunggal titik: rumus a·k1 + b·k2 + c, maks, min, selisih yang cocok pada baris 1-2 harus memberi 4 (atau di luar 1–4) pada baris 3.
  const fam: ((x: number, y: number) => number)[] = [Math.max, Math.min, (x, y) => Math.abs(x - y)];
  for (let a = -1; a <= 2; a++) for (let b = -1; b <= 2; b++) for (let c = -4; c <= 6; c++) fam.push((x, y) => a * x + b * y + c);
  for (const f of fam) if ([0, 1].every((r) => f(ND[r][0], ND[r][1]) === ND[r][0] + ND[r][1])) { const v = f(ND[2][0], ND[2][1]); assert.ok(v === 4 || v < 1 || v > 4, `20#30: rumus titik alternatif memberi ${v}`); }
  const vis = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [r, c] as const)).filter(([r, c]) => !(r === 2 && c === 2));
  const mustFail = (name: string, f: (r: number, c: number) => boolean) => assert.ok(vis.some(([r, c]) => f(r, c) !== G(r, c).t), `20#30: aturan alternatif '${name}' harus gugur`);
  mustFail("segitiga di diagonal utama", (r, c) => r === c); mustFail("segitiga di kolom 3", (_, c) => c === 2); mustFail("segitiga di baris 3", (r) => r === 2); mustFail("segitiga di tengah", (r, c) => r === 1 || c === 1);
  mustFail("segitiga di sel berjumlah genap", (r, c) => (r + c) % 2 === 0); mustFail("segitiga di baris 1", (r) => r === 0);
  const grid = (last: C) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? last : G(r, c))));
  const bad = (g: C[][]): string[] => {
    const out: string[] = [];
    for (const l of g) { const k = l[2].p, x = XOR(l[0].p, l[1].p); if (!same(k, rot(x))) out.push(same(k, rotc(x)) ? "arah" : same(k, rot(OR(l[0].p, l[1].p))) ? "operasi" : "pola"); }
    if (!g.every((l) => l[2].n === l[0].n + l[1].n)) out.push("titik");
    if (!g.every((l, r) => l.every((x, c) => x.t === (r + c === 2)))) out.push("segitiga");
    return [...new Set(out)];
  };
  const K = G(2, 2);
  assert.deepEqual(bad(grid(K)), [], "20#30: kisi lengkap harus memenuhi semua aturan");
  assert.deepEqual(K, { p: [1, 0, 1, 0], n: 4, t: false });
  const D: Record<string, C> = { arah: { ...K, p: rotc(XOR(PT[2][0], PT[2][1])) }, operasi: { ...K, p: rot(OR(PT[2][0], PT[2][1])) }, titik: { ...K, n: 2 }, segitiga: { ...K, t: true } };
  const names = ["arah", "operasi", "titik", "segitiga"], key: Key = "A", tags = [...names]; tags.splice("ABCDE".indexOf(key), 0, "kunci");
  const order = names.map((x) => D[x]); order.splice("ABCDE".indexOf(key), 0, K);
  order.forEach((o, i) => assert.deepEqual(bad(grid(o)), tags[i] === "kunci" ? [] : [tags[i]], `20#30: opsi ${"abcde"[i]} harus melanggar tepat lapis ${tags[i]}`));
  const cell = ({ p, n, t }: C): Fig => [...(t ? [poly([[-44, -44], [-20, -44], [-44, -20]], "b")] : []),
    ...p.map((v, k): Prim => { const x = (k % 2 - 1) * 24, y = -28 + Math.floor(k / 2) * 24; return poly([[x, y], [x + 24, y], [x + 24, y + 24], [x, y + 24]], v ? "b" : "w"); }),
    ...Array.from({ length: n }, (_, j) => dot(r1((j - (n - 1) / 2) * 19), 38, 7.5))];
  const opts = place(cell(K), names.map((x) => cell(D[x])), key), L = letters(tags);
  const at = (r: number, c: number) => cell(G(r, c)), ans = cell(K);
  assertNoGlobalAlias("20#30", [0, 1].map((r) => [at(r, 0), at(r, 2)]), at(2, 0), opts, key);
  const ann: Ann = (a, s) => colArrows(a, s, [0, 1, 2]) +
    [0, 1, 2].map((r) => { const [x, y] = a(r, 2); return redText(x + s / 2 + 12, y + 9, `${ND[r][0]} + ${ND[r][1]} = ${r === 2 ? "?" : ND[r][0] + ND[r][1]}`, 24, "start"); }).join("") +
    [[0, 2], [1, 1], [2, 0]].map(([r, c]) => redRing(...fp([-36, -36], a(r, c), s), 30)).join("") +
    foot(["→ kotak hitam: hanya di salah satu dari kolom 1 dan kolom 2", "→ hasilnya diputar 90° searah jarum jam", "→ titik kolom 3 = titik kolom 1 + titik kolom 2", "→ segitiga sudut hanya di diagonal kanan atas–kiri bawah"], a(2, 0)[1] + s / 2 + 42);
  add(30, key, POLA, gridS(grid3(at, null), opts), `Ada empat aturan, dan tiap aturan memakai unsur yang berbeda (kotak besar terbagi empat bagian: kiri atas, kanan atas, kiri bawah, kanan bawah). (1) Bagian hitam kolom 3 diturunkan dari dua kolom lain: sebuah bagian menjadi hitam jika hanya salah satu dari kolom 1 dan kolom 2 yang hitam di bagian itu (hitam di keduanya atau putih di keduanya menjadi putih). (2) Hasilnya lalu diputar 90° searah jarum jam. Baris 3: kolom 1 hitam di kiri atas, kanan atas, dan kanan bawah, sedangkan kolom 2 hitam di kiri atas, kanan atas, dan kiri bawah; yang berbeda hanya kiri bawah dan kanan bawah, sehingga hasil sebelum diputar hitam di kiri bawah dan kanan bawah, dan setelah diputar hitam di kiri atas dan kiri bawah. Dari 12 operasi dua kolom dan 8 putaran atau cermin, hanya pasangan ini yang cocok pada baris 1 dan 2. (3) Titik kolom 3 adalah jumlah titik kolom 1 dan kolom 2: baris 1 menjadi 1 + 2 = 3, baris 2 menjadi 1 + 1 = 2, jadi baris 3 menjadi 1 + 3 = 4 titik. (4) Segitiga hitam di pojok kiri atas hanya ada pada tiga sel di diagonal kanan atas ke kiri bawah (cincin merah), sehingga sel kosong tidak bersegitiga.\n\nOpsi ${L("arah")} gugur karena hasilnya diputar berlawanan arah jarum jam (hitam di kanan atas dan kanan bawah), bukan searah. Opsi ${L("operasi")} gugur karena seluruh bagian hitam: bagian yang hitam di kedua kolom (kiri atas dan kanan atas) ikut dihitamkan, padahal hanya bagian yang hitam di salah satu kolom yang menjadi hitam. Opsi ${L("titik")} gugur karena hanya 2 titik (selisih 3 − 1), padahal titiknya dijumlahkan menjadi 4. Opsi ${L("segitiga")} gugur karena bersegitiga, padahal sel kanan bawah tidak berada di diagonal kanan atas–kiri bawah. Jawaban: ${key.toLowerCase()}.`, gridS(grid3(at, ans), null, { gap: 42, hl: [2, 2], ann, foot: 170 }));
}

// 20#32 — rotasi (HOTS, 5 langkah): papan persegi dengan dua sudut terpotong (kiral) berisi segitiga hitam besar. (1) seluruh gambar dicerminkan terhadap garis mendatar,
// (2) segitiga diputar 90° ↺ di tempat, (3) segitiga digeser ke kanan sampai ujungnya menyentuh sisi kanan papan, (4) warna seluruh gambar dibalik, (5) seluruh gambar diputar 90° ↺.
// Pengecoh = cermin tegak (bukan mendatar) / segitiga diputar ↻ / geser dilewati / warna tidak dibalik: semuanya beda besar (papan, arah ujung segitiga, posisi, warna).
// Detail terkecil: sudut terpotong 18 dan 26, segitiga 28×26 satuan gambar.
{
  const BP: Pt[] = [[-38, -38], [12, -38], [38, -12], [38, 20], [20, 38], [-38, 38]];
  const TP: Pt[] = [[0, -15], [14, 11], [-14, 11]];
  type S = { b: Fig; q: Fig; c: Pt; v: boolean };
  const s0: S = { b: [poly(BP, "w")], q: [poly(TP, "b")], c: [-19, -8], v: false };
  const draw = (s: S): Fig => (s.v ? invF : (f: Fig) => f)([...s.b, ...mv(s.q, ...s.c)]);
  assertChiral(draw(s0), "20#32"); assertChiral(s0.b, "20#32 papan");
  const whole = (d: number, m = false) => (s: S): S => ({ ...s, b: tf(s.b, d, m), q: tf(s.q, d, m), c: ptf(s.c, d, m) });
  const MH = whole(180, true), MV = whole(0, true), RW = whole(270);
  const RQ = (d: number) => (s: S): S => ({ ...s, q: tf(s.q, d) });
  const xs = (f: Fig) => f.flatMap((q) => (q.k === "poly" ? q.pts.map((p) => p[0]) : []));
  const ENDX = (s: S): S => ({ ...s, c: [r1(Math.max(...xs(s.b)) - Math.max(...xs(s.q))), s.c[1]] }); // segitiga menyentuh sisi kanan papan
  const INV = (s: S): S => ({ ...s, v: !s.v }), ID = (s: S) => s;
  const run = (...ops: ((s: S) => S)[]) => ops.reduce((s, o) => o(s), s0);
  const steps = [s0, run(MH), run(MH, RQ(270)), run(MH, RQ(270), ENDX), run(MH, RQ(270), ENDX, INV), run(MH, RQ(270), ENDX, INV, RW)];
  const KS = steps[5];
  for (const s of steps) { // segitiga tetap di dalam papan (diperkecil sedikit dari pusat agar tepi yang menempel dihitung di dalam), gambar tidak keluar kotak
    const body = (s.b[0] as { pts: Pt[] }).pts;
    for (const p of s.q.flatMap((q) => (q.k === "poly" ? q.pts : []))) assert.ok(pip(body, [r1((p[0] + s.c[0]) * 0.97), r1((p[1] + s.c[1]) * 0.97)]), "20#32: segitiga keluar dari papan");
    for (const p of draw(s).flatMap((q) => (q.k === "poly" ? q.pts : []))) assert.ok(Math.abs(p[0]) <= 46 && Math.abs(p[1]) <= 46, "20#32: gambar keluar kotak");
  }
  for (let i = 1; i < 6; i++) assert.notEqual(sig(draw(steps[i])), sig(draw(steps[i - 1])), `20#32: langkah ${i} tidak mengubah gambar`);
  // Lacak sendiri: pusat (−19,−8) → cermin mendatar (x,−y) = (−19, 8); ujung (0,−15) → (0, 15) → putar 90° ↺ (x,y)→(y,−x) = (15, 0) [ke kanan];
  // geser ke kanan: pusat (23, 8), ujung tepat di x = 38; putar seluruh gambar 90° ↺: pusat (8, −23), ujung (0, −15) [ke atas].
  const tip = (s: S) => ((s.q[0] as { pts: Pt[] }).pts)[0];
  assert.deepEqual([steps[1].c, steps[3].c, KS.c], [[-19, 8], [23, 8], [8, -23]], "20#32: lacak pusat segitiga");
  assert.deepEqual([tip(steps[0]), tip(steps[1]), tip(steps[2]), tip(KS)], [[0, -15], [0, 15], [15, 0], [0, -15]], "20#32: lacak ujung segitiga");
  const D: [string, S][] = [
    ["tegak", run(MV, RQ(270), ENDX, INV, RW)],
    ["putar", run(MH, RQ(90), ENDX, INV, RW)],
    ["geser", run(MH, RQ(270), ID, INV, RW)],
    ["warna", run(MH, RQ(270), ENDX, ID, RW)],
  ];
  const key: Key = "E", tags = D.map(([n]) => n); tags.splice("ABCDE".indexOf(key), 0, "kunci");
  const opts = place(draw(KS), D.map(([, s]) => draw(s)), key);
  for (const o of opts.slice(0, 4)) for (let d = 0; d < 360; d += 45) for (const m of [false, true]) assert.notEqual(sig(tf(o, d, m)), sig(draw(KS)), "20#32: pengecoh sama dengan kunci setelah putar/cermin"); // kunci tidak berimpit dengan putaran/cermin pengecoh
  const L = letters(tags);
  const lbl = [["", "awal"], ["① cermin", "mendatar"], ["② segitiga", "putar 90° ↺"], ["③ segitiga", "geser ke kanan"], ["④ warna", "dibalik"], ["⑤ semua", "putar 90° ↺"]];
  const ann: Ann = (at, s) => lbl.map(([a, b], i) => {
    const [x, y] = at(0, i), t = y + s / 2 + 26;
    return i ? redArrow([at(0, i - 1)[0] + s / 2 + 4, y], [x - s / 2 - 4, y]) + redText(x, t, a, 19) + redText(x, t + 22, b, 19) : redText(x, t, b, 19);
  }).join("") + dashLine([at(0, 0)[0] - s / 2 - 8, at(0, 0)[1]], [at(0, 0)[0] + s / 2 + 8, at(0, 0)[1]], RED);
  add(32, key, "Gambar di atas (sebuah papan putih dengan segitiga hitam besar di dalamnya) mengalami lima langkah berurutan: (1) seluruh gambar dicerminkan terhadap garis mendatar, (2) segitiga diputar 90° berlawanan arah jarum jam pada pusatnya sendiri, (3) segitiga digeser ke kanan sampai ujungnya menyentuh sisi kanan papan, (4) warna seluruh gambar dibalik (hitam menjadi putih, putih menjadi hitam), dan (5) seluruh gambar diputar 90° berlawanan arah jarum jam. Pilihlah satu gambar yang merupakan hasil akhirnya.",
    gridS([[draw(s0)]], opts, { size: 170, foot: 24 }), `Kerjakan lima langkah berurutan. Papan tidak simetris: sudut kanan atas terpotong besar dan sudut kanan bawah terpotong kecil, sedangkan segitiga hitam berada di sisi kiri dengan ujung ke atas. (1) Cermin terhadap garis mendatar: atas dan bawah bertukar, sehingga sudut besar pindah ke kanan bawah, sudut kecil ke kanan atas, dan segitiga pindah ke kiri bawah dengan ujung ke bawah. (2) Segitiga diputar 90° berlawanan arah jarum jam di tempatnya: ujungnya menghadap ke kanan. (3) Segitiga digeser ke kanan sampai ujungnya menyentuh sisi kanan papan, di antara dua sudut terpotong. (4) Warna dibalik: papan menjadi hitam dan segitiga menjadi putih. (5) Seluruh gambar diputar 90° berlawanan arah jarum jam: sisi kanan menjadi sisi atas, sehingga sudut kecil berada di kiri atas dan sudut besar di kanan atas, sedangkan ujung segitiga yang tadinya ke kanan kini menghadap ke atas dan menyentuh sisi atas papan.\n\nOpsi ${L("tegak")} gugur karena cermin dilakukan terhadap garis tegak, bukan mendatar: kiri dan kanan bertukar sehingga kedua sudut terpotong berada di bawah (pada kunci di atas) dan ujung segitiga menghadap ke bawah. Opsi ${L("putar")} gugur karena segitiga diputar searah jarum jam pada langkah 2: papannya benar, tetapi ujung segitiga menghadap ke bawah, bukan ke atas. Opsi ${L("geser")} gugur karena langkah 3 dilewati: segitiga tidak digeser, sehingga berada di bagian bawah papan dan tidak menyentuh sisi atas. Opsi ${L("warna")} gugur karena warna tidak dibalik: papan tetap putih dan segitiga tetap hitam. Jawaban: ${key.toLowerCase()}.`,
    gridS([steps.map(draw)], null, { size: 100, gap: 40, top: 14, hl: [0, 5], ann, foot: 90 }));
}
