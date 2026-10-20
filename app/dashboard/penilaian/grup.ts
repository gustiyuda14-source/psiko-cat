import type { Aspek } from "@/lib/scoring/psikogram";

/** Aspek psikogram per kelompok tes, urutan seperti ASPEK_LABEL (Peraturan As SDM 3/2017 Pasal 7–9). */
export const GRUP_ASPEK: [string, Aspek[]][] = [
  ["Kecerdasan", ["praktis", "verbal", "logis", "analitis"]],
  ["Kepribadian", ["stabilitas_emosi", "prososial", "penyesuaian_diri", "kepercayaan_diri", "motif_berprestasi", "pengambilan_keputusan", "loyalitas", "kerja_sama"]],
  ["Sikap Kerja", ["kecepatan", "ketelitian", "ketahanan"]],
];
