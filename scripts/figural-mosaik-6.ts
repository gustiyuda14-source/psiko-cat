import { C, arrow, finishMosaik, md, type Def, type Frame, type MosaikItem, type Tile } from "./figural-mosaik";
import { type Gen, prove } from "./figural-mosaik-20";

// Mosaik Latihan Paket 5 (package_number 6), slot 26-27. Aturan baru (bukan lipat/pingpong/putar papan/ular/geser kosong):
// 26 kolom tepi berjalan berlawanan + yang tembus tepi berputar + kolom tengah bercermin; 27 baris tengah bergeser + baris atas/bawah
// berputar berlawanan + yang tembus tepi berbalik warna. Gaya G-10 baru: topeng "tiket" (sudut cekung) + bingkai tipis + panah kecil (26),
// topeng "bulat" + panel abu tanpa panah, celah lebar (27). Tiap butir dibuktikan tunggal dengan `prove` (ruang hipotesis aturan).

// ── 26: KOLOM BERLAWANAN — kolom kiri turun, kolom kanan naik (siklis); yang tembus tepi berputar; kolom tengah dicerminkan kiri-kanan ──
type P26 = { left: number; right: number; wrapRot: number; moveRot: number; midMir: boolean };
const T26: Tile[] = ["seperempat", "bendera", "lolipop", "tetes", "kail", "ikan", "panah", "tangga", "setengah"];
const gen26: Gen<P26> = (t, p) => {
  const s = T26.map((tile, i) => ({ tile, r: Math.floor(i / 3), c: i % 3, deg: 0, mir: false }));
  for (let k = 1; k <= t; k++) for (const q of s) {
    if (q.c === 1) { if (p.midMir) q.mir = !q.mir; continue; }
    const d = q.c === 0 ? p.left : p.right, nr = q.r + d;
    if (!d) continue;
    q.deg = md(q.deg + (nr < 0 || nr > 2 ? p.wrapRot : p.moveRot), 360);
    q.r = md(nr, 3);
  }
  const f: Frame = new Array(9);
  for (const q of s) f[q.r * 3 + q.c] = C(q.tile, false, q.deg, q.mir);
  return f;
};

// ── 27: BARIS TENGAH BERJALAN — baris tengah geser 1 ke kanan (siklis), yang tembus tepi berbalik warna; baris atas ↻90°, baris bawah ↺90° ──
type P27 = { shift: number; top: number; bot: number; midRot: number; inv: "wrap" | "move" | "none" };
const T27: Tile[] = ["bendera", "segitiga", "tangga", "tetes", "lolipop", "panah", "kail", "ikan", "sabit"];
const gen27: Gen<P27> = (t, p) => {
  const f: Frame = T27.map((tile) => C(tile));
  for (let k = 1; k <= t; k++) {
    const mid = f.slice(3, 6), next = mid.slice();
    mid.forEach((c, j) => { const nj = j + p.shift; next[md(nj, 3)] = { ...c, deg: md(c.deg + p.midRot, 360), inv: p.inv !== "none" && (nj < 0 || nj > 2) === (p.inv === "wrap") ? !c.inv : c.inv }; });
    f.splice(3, 3, ...next);
    for (const i of [0, 1, 2]) f[i] = { ...f[i], deg: md(f[i].deg + p.top, 360) };
    for (const i of [6, 7, 8]) f[i] = { ...f[i], deg: md(f[i].deg + p.bot, 360) };
  }
  return f;
};

export function buildMosaik6(): MosaikItem[] {
  const defs: Def[] = [];
  const key26: P26 = { left: 1, right: -1, wrapRot: 90, moveRot: 0, midMir: true }, key27: P27 = { shift: 1, top: 90, bot: 270, midRot: 0, inv: "wrap" };

  { // slot 26 — kunci D, gambar (2) dihilangkan (t = 1); t = 3 tidak dipakai karena arah terbalik juga kembali ke petak awal
    const bad: P26[] = [{ ...key26, left: -1, right: 1 }, { ...key26, wrapRot: 0 }, { ...key26, wrapRot: 270 }, { ...key26, midMir: false }];
    prove(26, gen26, key26, { left: [1, -1, 0], right: [1, -1, 0], wrapRot: [0, 90, 180, 270], moveRot: [0, 90, 180, 270], midMir: [true, false] }, [0, 2, 3, 4], 1, bad);
    const A = (p: P26) => gen26(1, p);
    defs.push({
      pkg: 6, seq: 26, key: "D", n: 3, st: { mask: "tiket", frame: "tipis", gap: 0.07, chevron: true }, frames: [gen26(0, key26), null, gen26(2, key26), gen26(3, key26), gen26(4, key26)],
      opts: [{ f: A(key26) },
        { f: A(bad[0]), why: "arah kedua kolom tepi terbalik: kolom kiri naik dan kolom kanan turun" },
        { f: A(bad[1]), why: "ubin yang tembus tepi tidak berputar" },
        { f: A(bad[2]), why: "ubin yang tembus tepi berputar berlawanan arah jarum jam" },
        { f: A(bad[3]), why: "ubin kolom tengah tidak dicerminkan, padahal pada langkah ganjil bendera, kail, dan tangga menghadap ke arah sebaliknya" }],
      aturan: "Ada tiga aturan yang berjalan serentak. (1) Kolom kiri turun satu petak setiap langkah dan kolom kanan naik satu petak; ubin yang keluar dari tepi bawah kolom kiri muncul lagi di atas, dan ubin yang keluar dari tepi atas kolom kanan muncul lagi di bawah. (2) Hanya ubin yang tembus tepi (melompat dari ujung ke ujung) yang berputar 90° searah jarum jam; ubin yang bergeser biasa tidak berputar. (3) Ubin kolom tengah tidak pindah, tetapi dicerminkan kiri-kanan setiap langkah, sehingga arahnya berbalik pada langkah ganjil dan kembali pada langkah genap.",
      tahap: "Gambar (2) adalah langkah pertama, jadi cukup satu langkah dari gambar (1). Tips: setelah tiga langkah setiap ubin kolom tepi sudah tembus tepi tepat satu kali dan kembali ke petak semula dengan putaran 90°; pakai gambar (4) untuk memeriksa arah putarannya.",
      kunci: "Opsi d benar: panah melompat dari kiri bawah ke kiri atas dan lolipop dari kanan atas ke kanan bawah, keduanya berputar 90° searah jarum jam; ubin lain di kolom tepi hanya bergeser satu petak tanpa berputar; bendera, kail, dan tangga di kolom tengah tercermin.",
      overlay: (c, T) => { const sh = (i: number, dx: number): [number, number] => [c(i)[0] + dx * T * 0.62, c(i)[1]]; return arrow(c(0), c(3)) + arrow(c(3), c(6)) + arrow(sh(6, -1), sh(0, -1), true) + arrow(c(8), c(5)) + arrow(c(5), c(2)) + arrow(sh(2, 1), sh(8, 1), true); },
    });
  }

  { // slot 27 — kunci E, 6 gambar: (1)-(5) tampak, (6) = "?" (t = 5); langkah genap tidak bisa dipakai karena 90° dan 270° sama-sama jadi 180°
    const bad: P27[] = [{ ...key27, bot: 90 }, { ...key27, top: 270, bot: 90 }, { ...key27, inv: "move" }, { ...key27, midRot: 90 }];
    prove(27, gen27, key27, { shift: [1, -1, 0], top: [0, 90, 180, 270], bot: [0, 90, 180, 270], midRot: [0, 90, 180, 270], inv: ["wrap", "move", "none"] }, [0, 1, 2, 3, 4], 5, bad);
    const A = (p: P27) => gen27(5, p);
    defs.push({
      pkg: 6, seq: 27, key: "E", n: 3, st: { mask: "bulat", frame: "panel", gap: 0.1 }, frames: [...[0, 1, 2, 3, 4].map((t) => gen27(t, key27)), null],
      opts: [{ f: A(key27) },
        { f: A(bad[0]), why: "ubin baris bawah berputar searah jarum jam seperti baris atas, padahal baris bawah berputar berlawanan arah jarum jam" },
        { f: A(bad[1]), why: "arah putaran baris atas dan baris bawah tertukar" },
        { f: A(bad[2]), why: "yang berbalik warna ubin yang bergeser biasa, padahal hanya ubin yang tembus tepi yang berbalik warna" },
        { f: A(bad[3]), why: "ubin baris tengah ikut berputar, padahal baris tengah hanya bergeser" }],
      aturan: "Ada tiga aturan yang berjalan serentak. (1) Baris tengah bergeser satu petak ke kanan setiap langkah; ubin yang keluar dari tepi kanan muncul lagi di kiri. (2) Ubin yang tembus tepi itu berbalik warna (hitam berisi putih menjadi putih berisi hitam), sedangkan ubin yang bergeser biasa tidak berubah. (3) Baris atas dan baris bawah tidak pindah, tetapi setiap ubin baris atas berputar 90° searah jarum jam dan setiap ubin baris bawah berputar 90° berlawanan arah jarum jam pada setiap langkah.",
      tahap: "Gambar (6) adalah langkah kelima, jadi hitung satu langkah lagi dari gambar (5). Tips: setiap tiga langkah baris tengah kembali ke susunan semula, dan setiap empat langkah ubin baris atas dan bawah kembali tegak; pakai kedua siklus ini untuk memeriksa hasil.",
      kunci: "Opsi e benar: baris tengah berisi lolipop di kiri, panah di tengah, dan tetesan di kanan; tetesan baru tembus tepi satu kali sehingga warnanya terbalik, sedangkan panah dan lolipop sudah dua kali sehingga warnanya kembali; ubin baris atas berputar 90° searah jarum jam dari keadaan awal dan ubin baris bawah 90° berlawanan arah jarum jam.",
      overlay: (c) => arrow(c(3), c(4)) + arrow(c(4), c(5)) + arrow(c(5), c(3), true),
    });
  }
  return finishMosaik(defs, 3);
}
export const MOSAIK6_ITEMS = buildMosaik6();
