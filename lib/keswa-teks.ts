import { KESWA_AMBANG, type KeswaHasil } from "@/lib/keswa-scoring";

// Penjelasan 5 cek untuk halaman hasil (bahasa peserta, bukan istilah klinis).
export type CekBaris = { judul: string; angka: string; lolos: boolean; arti: string };

export function cekBaris(h: KeswaHasil): CekBaris[] {
  const persenYa = h.pola.dari ? Math.round((h.pola.nilai / h.pola.dari) * 100) : 0;
  return [
    {
      judul: "Soal kosong",
      angka: `${h.kosong.nilai} soal`,
      lolos: h.kosong.lolos,
      arti: h.kosong.lolos
        ? "Hampir semua soal dijawab. Bagus."
        : `Ada ${h.kosong.nilai} soal tidak dijawab (batas ${KESWA_AMBANG.kosong}). Di tes asli, terlalu banyak soal kosong membuat hasil tidak bisa dibaca.`,
    },
    {
      judul: "Konsistensi",
      angka: `${h.konsistensi.nilai} dari ${h.konsistensi.dari} pasangan bertentangan`,
      lolos: h.konsistensi.lolos,
      arti: h.konsistensi.lolos
        ? "Soal yang diulang atau dibalik kamu jawab dengan selaras."
        : "Banyak soal berulang/berlawanan yang jawabannya saling bertentangan. Di tes asli, pola ini dibaca sebagai menjawab asal atau tidak membaca soal.",
    },
    {
      judul: "Pola Ya/Tidak",
      angka: `${persenYa}% Ya`,
      lolos: h.pola.lolos,
      arti: h.pola.lolos
        ? "Jawaban Ya dan Tidak cukup bervariasi."
        : `Jawabanmu hampir semuanya ${persenYa > 50 ? "Ya" : "Tidak"}. Pernyataan disusun dua arah, jadi pola seragam berarti soal tidak dibaca dengan sungguh-sungguh.`,
    },
    {
      judul: "Sok sempurna",
      angka: `${h.sokSempurna.nilai} dari ${h.sokSempurna.dari} disangkal`,
      lolos: h.sokSempurna.lolos,
      arti: h.sokSempurna.lolos
        ? "Kamu mengakui kekurangan kecil yang wajar dimiliki semua orang."
        : `Kamu menyangkal ${h.sokSempurna.nilai} dari ${h.sokSempurna.dari} kekurangan yang wajar dimiliki semua orang. Di tes asli, pola ini dibaca sebagai berusaha tampil terlalu baik (tidak jujur).`,
    },
    {
      judul: "Jawaban acak",
      angka: `${h.acak.nilai} dari ${h.acak.dari} menyimpang`,
      lolos: h.acak.lolos,
      arti: h.acak.lolos
        ? "Pernyataan yang jawabannya jelas kamu jawab wajar."
        : `${h.acak.nilai} pernyataan yang hampir semua orang jawab sama kamu jawab sebaliknya. Ini tanda menjawab asal, terburu-buru, atau salah tekan.`,
    },
  ];
}

export const tanggalKeswa = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" });

export const durasiKeswa = (detik: number) => `${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, "0")}`;
