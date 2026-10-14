import assert from "node:assert/strict";
import { C, arrow, bits, finishMosaik, ham, md, type Cell, type Def, type Frame, type MosaikItem, type Pt, type Tile } from "./figural-mosaik";

// Mosaik pkg 20 (Simulasi 5), slot 26-27. PROTOTIPE: 3 aturan serentak (pkg 19 hanya memakai papan putar / sisi-vs-sudut dengan 3 aturan datar),
// gaya visual baru (topeng "tab" dan "perisai" belum dipakai paket mana pun). Tidak dihubungkan ke generate-kecerdasan-figural-kal.ts.
// Tiap butir dibuktikan tunggal dengan enumerasi ruang hipotesis aturan: hanya hipotesis yang cocok dengan semua gambar soal
// yang tersisa, dan semuanya meramalkan gambar yang sama untuk "?" (butir 26: `prove`; butir 27: `proveSeries`, ruang jauh lebih luas, "?" di gambar terakhir).

type Gen<P> = (t: number, p: P) => Frame;
const cellOf = (b: string, i: number) => b.slice(i * 400, (i + 1) * 400);
const sameVis = (a: Frame, b: Frame) => bits(a) === bits(b);
/** Jumlah petak yang tampak berbeda (dua gambar harus beda minimal di 2 petak agar jelas terbedakan di layar HP). */
const cellsDiff = (a: Frame, b: Frame) => { const x = bits(a), y = bits(b); let n = 0; for (let i = 0; i < a.length; i++) if (cellOf(x, i) !== cellOf(y, i)) n++; return n; };
const product = <P extends Record<string, unknown[]>>(space: P): { [K in keyof P]: P[K][number] }[] =>
  Object.entries(space).reduce<Record<string, unknown>[]>((acc, [k, vs]) => acc.flatMap((a) => vs.map((v) => ({ ...a, [k]: v }))), [{}]) as never;

/** Bukti D-1: hanya hipotesis yang mereproduksi semua gambar tampak yang lolos, dan semuanya meramalkan jawaban yang sama. */
function prove<P extends Record<string, unknown>>(seq: number, gen: Gen<P>, truth: P, space: { [K in keyof P]: P[K][] }, shown: number[], hidden: number, distractors: P[]) {
  const ok = product(space as never as Record<string, unknown[]>).filter((p) => shown.every((t) => sameVis(gen(t, p as P), gen(t, truth)))) as P[];
  assert.ok(ok.length >= 1, `mosaik ${seq}: kebenaran tidak konsisten dengan dirinya`);
  for (const p of ok) assert.ok(sameVis(gen(hidden, p), gen(hidden, truth)), `mosaik ${seq}: hipotesis lain cocok dengan gambar soal tetapi meramalkan jawaban berbeda ${JSON.stringify(p)}`);
  for (const d of distractors) {
    assert.ok(!shown.every((t) => sameVis(gen(t, d), gen(t, truth))), `mosaik ${seq}: pengecoh ${JSON.stringify(d)} cocok dengan semua gambar soal`);
    assert.ok(cellsDiff(gen(hidden, d), gen(hidden, truth)) >= 2, `mosaik ${seq}: pengecoh ${JSON.stringify(d)} hanya beda 1 petak dari kunci`);
  }
  for (let i = 0; i < distractors.length; i++) for (let j = i + 1; j < distractors.length; j++)
    assert.ok(cellsDiff(gen(hidden, distractors[i]), gen(hidden, distractors[j])) >= 2, `mosaik ${seq}: pengecoh ${i}/${j} terlalu mirip`);
}

/** Panah dua arah antara dua pusat ubin, dipendekkan 14% di tiap ujung supaya isi ubin tetap terbaca. */
const swap = (p: Pt, q: Pt, dash = false) => { const a: Pt = [p[0] + (q[0] - p[0]) * 0.14, p[1] + (q[1] - p[1]) * 0.14], b: Pt = [q[0] + (p[0] - q[0]) * 0.14, q[1] + (p[1] - q[1]) * 0.14]; return arrow(a, b, dash) + arrow(b, a, dash); };
type Sim = { tile: Tile; r: number; c: number; deg: number; inv: boolean };

// ── 26: LIPAT BERGANTIAN — papan dilipat baris (ganjil) / kolom (genap); ubin yang pindah berputar ↻; warna = XOR tepi bawah & tepi kanan ──
type P26 = { order: "VH" | "HV"; rot: number; color: "xor" | "or" | "tile" };
const T26: Tile[] = ["bendera", "segitiga", "tangga", "panah", "bintang", "seperempat", "busur", "setengah", "daun"];
const cellInv26 = (r: number, c: number, mode: "xor" | "or") => (mode === "or" ? r === 2 || c === 2 : (r === 2) !== (c === 2));
const gen26: Gen<P26> = (t, p) => {
  const s: Sim[] = T26.map((tile, i) => ({ tile, r: Math.floor(i / 3), c: i % 3, deg: 0, inv: cellInv26(Math.floor(i / 3), i % 3, "xor") }));
  for (let k = 1; k <= t; k++) {
    const rows = (k % 2 === 1) === (p.order === "VH");
    for (const q of s) { const [nr, nc] = rows ? [2 - q.r, q.c] : [q.r, 2 - q.c]; if (nr !== q.r || nc !== q.c) q.deg = md(q.deg + p.rot, 360); q.r = nr; q.c = nc; }
  }
  const f: Frame = new Array(9);
  for (const q of s) f[q.r * 3 + q.c] = C(q.tile, p.color === "tile" ? q.inv : cellInv26(q.r, q.c, p.color), q.deg);
  return f;
};

// ── 27: PINGPONG BARIS — tiap baris menukar sepasang tetangga bergantian; kanan ↻90°, kiri 180°; yang diam berganti warna ──
// Soal 6 gambar: (1)-(5) tampak, (6) = "?". Empat transisi (langkah 1-4) teramati, jadi tiap jenis langkah (ganjil/genap) terlihat dua kali.
type P27 = { sch: number; left: number; right: number; color: "sit" | "move" | "none" }; // sch: bit r = jadwal baris r bergeser satu langkah
const T27: Tile[] = ["ikan", "tau", "kail", "setengah", "tetes", "sabit", "lolipop", "tangga", "bendera"];
const gen27: Gen<P27> = (t, p) => {
  const f: Frame = T27.map((tile) => C(tile));
  for (let k = 1; k <= t; k++) {
    const g = f.slice();
    for (let r = 0; r < 3; r++) {
      const left = ((k + ((p.sch >> r) & 1)) % 2) === 1; // true: tukar kolom 1↔2; false: kolom 2↔3
      const [a, b] = left ? [0, 1] : [1, 2], sit = left ? 2 : 0;
      const A = f[r * 3 + a], B = f[r * 3 + b], flip = p.color === "move";
      g[r * 3 + b] = { ...A, deg: md(A.deg + p.right, 360), inv: flip ? !A.inv : A.inv };
      g[r * 3 + a] = { ...B, deg: md(B.deg + p.left, 360), inv: flip ? !B.inv : B.inv };
      if (p.color === "sit") g[r * 3 + sit] = { ...f[r * 3 + sit], inv: !f[r * 3 + sit].inv };
    }
    f.splice(0, 9, ...g);
  }
  return f;
};

/**
 * Bukti D-1 untuk deret yang gambar terakhirnya hilang (fr[0..L] tampak, fr[L+1] = jawaban). Ruang hipotesis jauh lebih luas daripada daftar parameter:
 * tiap transisi langkah k = 1..L dibaca LANGSUNG dari gambar (ubin dilacak lewat bentuknya) menjadi tiga komponen terpisah: petak tujuan, selisih putaran, balik-warna.
 * Hipotesis = (periode p = 1..3) x (kunci aturan komponen itu): tetap / arah gerak (kanan, kiri, diam) / arah gerak per baris / petak asal / petak tujuan / ubin itu sendiri.
 * Ini mencakup warna dibalik pada yang berpindah, yang diam, hanya pada langkah ganjil/genap/tertentu, dan putaran kiri/kanan dengan nilai apa pun.
 * Hanya hipotesis yang cocok dengan SEMUA transisi tampak yang tersisa, dan semuanya harus meramalkan langkah L+1 persis seperti kunci.
 */
type Ob = { tile: Tile; src: number; dst: number; dd: number; fl: boolean };
const dirOf = (o: { src: number; dst: number }) => Math.sign((o.dst % 3) - (o.src % 3));
const KEYS27: Record<string, (o: Pick<Ob, "tile" | "src" | "dst">) => string> = {
  tetap: () => "*", arah: (o) => `${dirOf(o)}`, arahBaris: (o) => `${Math.floor(o.src / 3)}${dirOf(o)}`, asal: (o) => `${o.src}`, tujuan: (o) => `${o.dst}`, ubin: (o) => o.tile,
};
function proveSeries(seq: number, fr: Frame[]) {
  const L = fr.length - 2, tiles = fr[0].map((c) => c.tile), pos = (t: number, tile: Tile) => fr[t].findIndex((c) => c.tile === tile);
  // keadaan ubin (bentuk x putaran x warna) harus tampak berbeda satu sama lain, sehingga ubin bisa dilacak dengan mata
  const st = tiles.flatMap((tile, ti) => [0, 90, 180, 270].flatMap((d) => [false, true].map((i) => ({ k: `${tile}/${d}/${i}`, tile, row: Math.floor(ti / 3), b: bits([C(tile, i, d)]) }))));
  for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) assert.ok(ham(st[i].b, st[j].b) >= (st[i].tile === st[j].tile ? 50 : st[i].row === st[j].row ? 60 : 20), `mosaik ${seq}: ${st[i].k} terlalu mirip ${st[j].k}`);
  const ob = (k: number): Ob[] => tiles.map((tile) => { const a = fr[k - 1][pos(k - 1, tile)], b = fr[k][pos(k, tile)]; return { tile, src: pos(k - 1, tile), dst: pos(k, tile), dd: md(b.deg - a.deg, 360), fl: b.inv !== a.inv }; });
  const O = Array.from({ length: L + 2 }, (_, k) => (k >= 1 ? ob(k) : [])), truth = O[L + 1];
  // p < L: tiap hipotesis harus sudah teruji berulang minimal sekali oleh transisi yang tampak
  const Ps = [1, 2, 3, 4].filter((p) => p < L), count = { petak: 0, putaran: 0, warna: 0 };
  // petak tujuan (petak asal -> petak tujuan): periodik p -> langkah L+1 sama dengan langkah L+1-p
  const pm = (k: number) => { const a: number[] = []; O[k].forEach((o) => (a[o.src] = o.dst)); return a; };
  for (const p of Ps) {
    if (!Array.from({ length: L - p }, (_, i) => i + p + 1).every((k) => pm(k).join() === pm(k - p).join())) continue;
    count.petak++;
    assert.deepEqual(truth.map((o) => pm(L + 1 - p)[o.src]), truth.map((o) => o.dst), `mosaik ${seq}: periode ${p} meramalkan perpindahan berbeda`);
  }
  assert.ok(count.petak >= 1, `mosaik ${seq}: kebenaran tak cocok dengan hipotesis petak`);
  for (const comp of ["dd", "fl"] as const) for (const [kn, kf] of Object.entries(KEYS27)) for (const p of Ps) {
    const tab = Array.from({ length: L + 1 }, (_, k) => { const m = new Map<string, number | boolean>(); let ok = k >= 1; for (const o of O[k]) { const key = kf(o); if (m.has(key) && m.get(key) !== o[comp]) ok = false; m.set(key, o[comp]); } return ok ? m : null; });
    const merged = new Map<string, number | boolean>(); let ok = true;
    for (let k = 1; k <= L && ok; k++) {
      if (!tab[k]) { ok = false; break; }
      if (k > p) for (const [key, v] of tab[k]!) if (tab[k - p]!.has(key) && tab[k - p]!.get(key) !== v) ok = false;
      if ((L + 1 - k) % p === 0) for (const [key, v] of tab[k]!) { if (merged.has(key) && merged.get(key) !== v) ok = false; merged.set(key, v); }
    }
    if (!ok) continue;
    count[comp === "dd" ? "putaran" : "warna"]++;
    truth.forEach((o) => assert.equal(merged.get(kf(o)), o[comp], `mosaik ${seq}: hipotesis ${comp}/${kn}/p${p} meramalkan ${o.tile} berbeda dari kunci (${merged.get(kf(o))} vs ${o[comp]})`));
  }
  assert.ok(count.putaran >= 1 && count.warna >= 1, `mosaik ${seq}: kebenaran tak cocok dengan hipotesis putaran/warna`);
  return count;
}

export function buildMosaik20(): MosaikItem[] {
  const defs: Def[] = [];
  const key26: P26 = { order: "VH", rot: 90, color: "xor" }, key27: P27 = { sch: 2, left: 180, right: 90, color: "sit" };

  { // slot 26 — kunci D, gambar (4) dihilangkan (t = 3)
    const bad: P26[] = [{ ...key26, order: "HV" }, { ...key26, rot: 0 }, { ...key26, rot: -90 }, { ...key26, color: "tile" }];
    prove(26, gen26, key26, { order: ["VH", "HV"], rot: [90, -90, 0, 180], color: ["xor", "or", "tile"] }, [0, 1, 2, 4], 3, bad);
    const A = (p: P26) => gen26(3, p);
    defs.push({
      pkg: 20, seq: 26, key: "D", n: 3, st: { mask: "tab", frame: "tipis", gap: 0.1, chevron: true }, frames: [gen26(0, key26), gen26(1, key26), gen26(2, key26), null, gen26(4, key26)],
      opts: [{ f: A(key26) },
        { f: A(bad[0]), why: "urutan lipatan terbalik: kolom dilipat lebih dulu, padahal langkah ganjil melipat baris atas dan bawah" },
        { f: A(bad[1]), why: "ubin yang berpindah tidak berputar" },
        { f: A(bad[2]), why: "ubin yang berpindah berputar berlawanan arah jarum jam" },
        { f: A(bad[3]), why: "warna ikut ubinnya, padahal warna menempel pada petak sehingga ubin yang pindah mengikuti warna petak barunya" }],
      aturan: "Ada tiga aturan. (1) Papan dilipat bergantian pada sumbu tengahnya: pada langkah ganjil baris atas dan baris bawah saling bertukar tempat (baris tengah diam), pada langkah genap kolom kiri dan kolom kanan saling bertukar tempat (kolom tengah diam); bintang di tengah tidak pernah pindah. (2) Setiap ubin yang berpindah petak berputar 90° searah jarum jam setiap kali ia pindah, sedangkan ubin yang diam tidak berputar. (3) Warna menempel pada petak, bukan pada ubin: petak di baris bawah dan petak di kolom kanan masing-masing berwarna terbalik (putih berisi hitam), tetapi petak kanan bawah yang masuk keduanya kembali normal (hitam berisi putih), sama seperti petak lain.",
      tahap: "Gambar (4) adalah langkah ketiga, yaitu langkah ganjil: baris atas dan baris bawah bertukar. Tips: setelah 4 langkah semua ubin kembali ke petak semula, tetapi ubin di tengah sisi sudah berpindah 2 kali sehingga berputar 180°; periksa gambar (5) dengan cara ini.",
      kunci: "Opsi d benar: gambar (3) dilipat pada baris sehingga setiap ubin turun atau naik ke baris seberang, ubin yang pindah berputar 90° searah jarum jam dari arahnya di gambar (3), dan warnanya mengikuti petak yang baru.",
      overlay: (c) => [[0, 6], [2, 8]].map(([a, b]) => swap(c(a), c(b))).join("") + [[0, 2], [6, 8]].map(([a, b]) => swap(c(a), c(b), true)).join(""),
    });
  }

  { // slot 27 — kunci B, 6 gambar: (1)-(5) tampak, (6) = "?" (t = 5)
    const bad: P27[] = [{ ...key27, sch: 5 }, { ...key27, left: 90 }, { ...key27, right: 180 }, { ...key27, color: "move" }];
    const fr = [0, 1, 2, 3, 4, 5].map((t) => gen27(t, key27)), shown = [0, 1, 2, 3, 4], A = (p: P27) => gen27(5, p);
    proveSeries(27, fr);
    for (const d of bad) assert.ok(!shown.every((t) => sameVis(gen27(t, d), fr[t])), `mosaik 27: pengecoh ${JSON.stringify(d)} cocok dengan semua gambar soal`);
    const all = [key27, ...bad].map(A), rowsOf = (f: Frame) => [0, 1, 2].map((r) => f.slice(r * 3, r * 3 + 3));
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      assert.ok(cellsDiff(all[i], all[j]) >= 3, `mosaik 27: opsi ${i}/${j} beda kurang dari 3 petak`);
      rowsOf(all[i]).forEach((ri, r) => assert.notEqual(cellsDiff(ri, rowsOf(all[j])[r]), 1, `mosaik 27: opsi ${i}/${j} baris ${r} hampir kembar (beda 1 petak)`));
    }
    const tot = all.map((f) => all.reduce((a, g) => a + cellsDiff(f, g), 0));
    assert.ok(tot[0] > Math.min(...tot.slice(1)), `mosaik 27: kunci adalah opsi paling "tengah" (D-3) ${tot}`);
    defs.push({
      pkg: 20, seq: 27, key: "B", n: 3, st: { mask: "perisai", frame: "papan", gap: 0.08, chevron: true }, frames: [...fr.slice(0, 5), null],
      opts: [{ f: A(key27) },
        { f: A(bad[0]), why: "jadwal pertukaran tertukar di semua baris (langkah ganjil dikira menukar ubin tengah dan kanan di baris atas dan bawah), sehingga ikan masih berada di kolom tengah dan T di kolom kiri, padahal ikan sudah kembali ke kolom kiri" },
        { f: A(bad[1]), why: "ubin yang bergerak ke kiri hanya berputar 90°, padahal ia berputar 180°, sehingga ikan, yang dua kali bergerak ke kiri, menghadap arah yang berlawanan dengan seharusnya" },
        { f: A(bad[2]), why: "ubin yang bergerak ke kanan ikut berputar 180°, padahal ia hanya berputar 90°, sehingga kail, yang baru saja bergeser ke kanan, tampil dengan putaran yang salah" },
        { f: A(bad[3]), why: "yang berganti warna ubin yang bertukar, padahal yang berganti warna ubin yang diam; karena langkah kelima ganjil, setiap petak pada gambar ini berwarna kebalikan dari jawaban" }],
      aturan: "Ada tiga aturan yang berjalan serentak, dan tiap baris bekerja sendiri (tidak ada ubin yang pindah baris). (1) Di setiap baris tepat dua ubin bertetangga bertukar tempat pada tiap langkah dan satu ubin diam. Baris atas dan baris bawah: pada langkah ganjil ubin kiri dan ubin tengah yang bertukar, pada langkah genap ubin tengah dan ubin kanan. Baris tengah memakai jadwal berlawanan: pada langkah ganjil ubin tengah dan ubin kanan yang bertukar, pada langkah genap ubin kiri dan ubin tengah. (2) Ubin yang bergerak ke kanan berputar 90° searah jarum jam, ubin yang bergerak ke kiri berputar 180°, dan ubin yang diam tidak berputar. (3) Warna menempel pada ubin yang diam: setiap kali sebuah ubin diam (tidak ikut bertukar), warnanya terbalik (hitam berisi putih menjadi putih berisi hitam, atau sebaliknya), sedangkan ubin yang bertukar mempertahankan warnanya.",
      tahap: "Tiap jenis langkah tampak dua kali: langkah ganjil pada (1) ke (2) dan (3) ke (4), langkah genap pada (2) ke (3) dan (4) ke (5), sehingga ketiga aturan dapat diperiksa ulang. Gambar (6) adalah langkah kelima, yaitu langkah ganjil. Tips: lacak satu ubin yang jelas, misalnya ikan: langkah 1 dan 2 ia bergeser ke kanan (90° dua kali), langkah 3 ia diam (warnanya terbalik), langkah 4 dan 5 ia bergeser ke kiri (180° dua kali), jadi ia berakhir di kolom kiri dengan putaran total 540° (setara 180°) dan warna terbalik satu kali.",
      kunci: "Opsi b benar: pada langkah kelima baris atas dan baris bawah menukar ubin kiri dengan ubin tengah (kail dan bendera bergeser ke kanan dan berputar 90°, ikan dan lolipop bergeser ke kiri dan berputar 180°, T dan tangga diam sehingga warnanya terbalik kembali), sedangkan baris tengah menukar ubin tengah dengan ubin kanan (sabit ke kanan 90°, setengah lingkaran ke kiri 180°, tetesan diam dan warnanya terbalik); semuanya dihitung dari arah dan warna pada gambar (5).",
      overlay: (c) => [0, 3, 6].map((k) => { const [s1, s2] = k !== 3 ? [0, 1] : [1, 0]; return swap(c(k + s1), c(k + s1 + 1)) + swap(c(k + s2), c(k + s2 + 1), true); }).join(""),
    });
  }
  return finishMosaik(defs, 3);
}
export const MOSAIK20_ITEMS = buildMosaik20();
