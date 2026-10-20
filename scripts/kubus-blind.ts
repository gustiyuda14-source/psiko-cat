// Deskripsi teks soal kubus untuk pemeriksa buta (tanpa kunci). Arah motif ditulis eksplisit
// supaya pemeriksa tidak perlu membaca matriks SVG.
import { Cell, View, Pos, V3, dot, DESIGNS, sample } from "./kubus-core";

const MOTIF: Record<string, string> = {
  kosong: "kosong",
  bulat: "lingkaran hitam di tengah (simetris penuh)",
  hitam: "hitam penuh (simetris penuh)",
  abu: "abu-abu penuh (simetris penuh)",
  cincin: "cincin di tengah (simetris penuh)",
  silang: "tanda silang × (simetris putar 90°)",
  plus: "tanda tambah + (simetris putar 90°)",
  bingkai: "kotak hitam berisi kotak abu (simetris penuh)",
  segitiga: "segitiga; posisi dasar: alas menempel di tepi BAWAH, puncak ke arah atas",
  garis: "garis tebal; posisi dasar: tegak (atas–bawah) di tengah",
  panah: "panah; posisi dasar: menunjuk ke ATAS",
  setengah: "setengah hitam; posisi dasar: separuh BAWAH hitam",
  diagonal: "segitiga siku hitam; posisi dasar: mengisi separuh kiri-atas, sudut siku di pojok KIRI-ATAS",
  pojok: "seperempat lingkaran hitam; posisi dasar: berpusat di pojok KANAN-BAWAH",
  titik2: "dua titik; posisi dasar: di pojok KIRI-ATAS dan KANAN-BAWAH",
  siku: "huruf L; posisi dasar: batang tegak di kiri, kaki pendek ke KANAN di bawah (huruf L biasa)",
};
export const BLIND_LEGEND = `# Cek buta K19 Jaring-Jaring Kubus

Aturan baca:
- Jaring ditulis per kotak: (kolom, baris), kolom bertambah ke kanan, baris bertambah ke bawah. Kotak yang berbagi sisi tersambung oleh garis lipat. Jaring dilipat dengan gambar menghadap ke LUAR kubus.
- Setiap motif punya "posisi dasar" (lihat daftar). "putar k×90°" = motif diputar searah jarum jam sebanyak k kali 90°, dilihat dari luar kubus. "cermin" = motif dicerminkan kiri-kanan dulu, lalu diputar.
- Kubus digambar miring: terlihat sisi DEPAN, ATAS, dan KANAN (atau KIRI). Arah motif tiap sisi kubus ditulis seperti dilihat langsung dari luar sisi itu:
  - depan: dilihat dari depan, atas gambar = atas kubus;
  - atas: dilihat dari atas, tepi depan kubus ada di bawah gambar (atas gambar = belakang kubus);
  - kanan: dilihat dari kanan, tepi depan kubus ada di kiri gambar, atas gambar = atas kubus;
  - kiri: dilihat dari kiri, tepi depan kubus ada di kanan gambar, atas gambar = atas kubus.

Daftar motif:
${Object.entries(MOTIF).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

Tugas: untuk setiap butir pilih tepat satu opsi (A–E). Jawab dalam JSON Lines: {"id": "...", "jawaban": "X", "alasan": "..."}.`;

/** Bitmap motif setelah (cermin lalu) putar k×90° searah jarum jam. */
function bitmap(d: string, k: number, m: boolean): string {
  let out = "";
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
    let x = (i + 0.5) / 16 - 0.5, y = (j + 0.5) / 16 - 0.5;
    for (let t = 0; t < k; t++) [x, y] = [y, -x]; // balik putaran (y ke bawah)
    if (m) x = -x;
    out += sample(DESIGNS[d], 0.5 + x, 0.5 + y);
  }
  return out;
}
/** Tulis arah dalam bentuk paling sederhana: cermin hanya bila tidak sama dengan putaran mana pun. */
const motif = (d: string, rot: number, mirror = false) => {
  if (d === "kosong") return "kosong";
  const b = bitmap(d, rot, mirror);
  for (let k = 0; k < 4; k++) if (bitmap(d, k, false) === b) return `${d}, putar ${k}×90°`;
  for (let k = 0; k < 4; k++) if (bitmap(d, k, true) === b) return `${d}, cermin, putar ${k}×90°`;
  throw new Error("motif tidak terbaca");
};

export function netText(cells: Cell[]): string {
  return cells.map((c) => `  - (${c.c}, ${c.r}): ${motif(c.design, c.rot)}`).join("\n");
}

const CANON = (side: number): Record<Pos, { r: V3; u: V3 }> => ({
  depan: { r: [1, 0, 0], u: [0, 1, 0] }, atas: { r: [1, 0, 0], u: [0, 0, -1] }, samping: { r: [0, 0, -side], u: [0, 1, 0] },
});
export function viewText(v: View): string {
  const c = CANON(v.side), nm = { depan: "depan", atas: "atas", samping: v.side > 0 ? "kanan" : "kiri" };
  return (["depan", "atas", "samping"] as Pos[]).map((p) => {
    const f = v.faces[p], cr = c[p].r, cu = c[p].u;
    const a = [Math.round(dot(f.r, cr)), Math.round(dot(f.r, cu))], b = [Math.round(dot(f.u, cr)), Math.round(dot(f.u, cu))];
    for (const m of [false, true]) for (let k = 0; k < 4; k++) {
      let r0 = [m ? -1 : 1, 0], u0 = [0, 1];
      for (let i = 0; i < k; i++) { r0 = [r0[1], -r0[0]]; u0 = [u0[1], -u0[0]]; }
      if (r0[0] === a[0] && r0[1] === a[1] && u0[0] === b[0] && u0[1] === b[1]) return `  - ${nm[p]}: ${motif(f.design, k, m)}`;
    }
    throw new Error("arah motif tidak terbaca");
  }).join("\n");
}
