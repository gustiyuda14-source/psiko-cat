import PembahasanNavigator from "@/app/components/pembahasan/PembahasanNavigator";
import type { KeswaCekData } from "@/app/components/pembahasan/cards";
import type { CekBaris } from "@/lib/keswa-teks";

type Props = {
  paket: number;
  baris: CekBaris[];
  cek: KeswaCekData[];
  stats: { label: string; value: number; tone?: "ok" | "bad" }[];
  extra: [string, string][];
  totalSoal: number;
  butirValid: number;
};

// Penjelasan alur sebelum pembahasan, supaya peserta tidak mencari "kunci jawaban" yang memang tidak ada.
function CaraMembaca({ totalSoal, butirValid }: { totalSoal: number; butirValid: number }) {
  return (
    <details open className="ksw-callout ksw-baca">
      <summary>Sebelum membaca pembahasan, kenali dulu cara kerjanya</summary>
      <p>
        Tes Keswa berbeda dari tes kecerdasan: di sini <b>tidak ada jawaban benar atau salah</b>, jadi kamu memang tidak
        akan menemukan kunci jawaban. Yang kami periksa hanya satu hal: apakah pola jawabanmu cukup <b>jujur, lengkap, dan
        konsisten</b> sehingga hasilnya bisa dibaca.
      </p>
      <p>
        {butirValid > 0 ? (
          <>
            Dari {totalSoal} soal, ada <b>{butirValid} soal</b> yang dipakai untuk 5 cek validitas.
          </>
        ) : (
          <>Hanya sebagian kecil soal yang dipakai untuk 5 cek validitas.</>
        )}{" "}
        Soal lainnya <b>tidak dinilai sama sekali</b>, jadi jawaban apa pun di sana tidak mengubah hasilmu, asalkan dijawab.
      </p>
      <ul className="ksw-tanda">
        <li>
          <b className="text-destructive">Merah · Terdeteksi</b>
          <span>
            Jawaban ini ikut membuat sebuah cek tidak lolos. Artinya bukan &ldquo;salah&rdquo;, tapi polanya perlu kamu
            perhatikan. Di tab Kosong, soal yang tidak dijawab memang ditandai merah, karena itulah yang dihitung.
          </span>
        </li>
        <li>
          <b className="text-success">Hijau · Wajar</b>
          <span>Jawaban ini tidak memicu cek. Ini juga bukan &ldquo;kunci&rdquo;, hanya tanda bahwa polanya aman.</span>
        </li>
        <li>
          <b className="text-muted-foreground">Abu · Tidak dijawab</b>
          <span>Soalnya kosong, jadi tidak ikut dihitung di cek itu (kecuali di cek Kosong).</span>
        </li>
      </ul>
      <p>
        <b>Kenapa tidak ada kunci?</b> Kalau arah jawaban dihafal, jawabanmu tidak lagi menggambarkan dirimu, dan pola
        seperti itu justru yang membuat hasil Keswa di tes asli tidak valid. Jadi pakai pembahasan ini untuk mengenali{" "}
        <b>kebiasaanmu saat menjawab</b>, bukan untuk menghafal.
      </p>
      <p>
        <b>Cara memakainya:</b> pilih tab cek di panel Daftar soal, klik nomor yang merah, lalu baca alasan dan sarannya.
        Pelan-pelan saja, setiap percobaan adalah bahan belajar.
      </p>
    </details>
  );
}

// Pembahasan Keswa memakai navigator yang sama dengan pembahasan Kecermatan. cek sudah diturunkan di server
// (butir validitas milik percobaan ini + teks pembahasan), tanpa daftar kunci dan tanpa bank soal.
export function KeswaCek({ paket, baris, cek, stats, extra, totalSoal, butirValid }: Props) {
  if (!cek.length) {
    // Bank paket tidak cocok dengan jawaban tersimpan: tampilkan ringkasan cek saja.
    return (
      <ul className="ksw-cek">
        {baris.map((b) => (
          <li key={b.judul} className={b.lolos ? "is-ok" : "is-bad"}>
            <div className="ksw-cek-head">
              <span className="ksw-cek-tag">{b.lolos ? "Lolos" : "Tidak lolos"}</span>
              <b>{b.judul}</b>
              <span className="ksw-cek-angka tnum">{b.angka}</span>
            </div>
            <p>{b.arti}</p>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Pembahasan per sub-tes</h2>
      <CaraMembaca totalSoal={totalSoal} butirValid={butirValid} />
      <PembahasanNavigator keswa={{ label: `Keswa · Paket ${paket}`, cek, stats, extra }} />
    </section>
  );
}
