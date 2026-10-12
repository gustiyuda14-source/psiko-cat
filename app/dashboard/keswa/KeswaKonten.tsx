import Link from "next/link";
import { KESWA_AMBANG, KESWA_DURASI_DETIK, KESWA_TOTAL } from "@/lib/keswa-scoring";

// Teks statis tab Edukasi dan Panduan menu Keswa.

const TANDA = [
  {
    judul: "Banyak soal kosong",
    isi: "Soal yang dilewati membuat profil tidak lengkap. Lewat batas tertentu, hasil tidak bisa dibaca sama sekali.",
  },
  {
    judul: "Tidak konsisten",
    isi: "Beberapa pernyataan muncul dua kali, atau muncul lagi dengan kalimat kebalikannya. Jawaban yang saling bertentangan menandakan soal tidak dibaca sungguh-sungguh.",
  },
  {
    judul: "Ya semua atau Tidak semua",
    isi: "Pernyataan disusun dua arah: sebagian bernada positif, sebagian negatif. Pola seragam langsung terlihat.",
  },
  {
    judul: "Sok sempurna",
    isi: "Ada pernyataan tentang kekurangan kecil yang dimiliki hampir semua orang, misalnya pernah kesal atau pernah terlambat. Menyangkal terlalu banyak dibaca sebagai berusaha tampil terlalu baik.",
  },
  {
    judul: "Jawaban asal",
    isi: "Ada pernyataan yang jawabannya hampir pasti sama untuk semua orang. Menjawab sebaliknya berkali-kali adalah tanda menjawab acak atau terburu-buru.",
  },
];

export function KeswaEdukasi() {
  return (
    <div className="ksw-prose">
      <section>
        <h2>Apa itu tes Keswa?</h2>
        <p>
          Tes kesehatan jiwa (Keswa) adalah tes kepribadian berbentuk ratusan pernyataan tentang diri sendiri, dijawab Ya atau
          Tidak. Isinya beragam: kesehatan badan, perasaan, keluarga, pergaulan, minat, keyakinan, sikap terhadap aturan, dan
          pengalaman sehari-hari. Tujuannya menyaring kondisi kejiwaan yang tidak sesuai dengan tuntutan tugas.
        </p>
      </section>
      <section>
        <h2>Tidak ada jawaban benar atau salah</h2>
        <p>
          Berbeda dengan tes kecerdasan, Keswa tidak dinilai dengan menghitung jawaban benar. Setiap jawaban masuk ke beberapa
          skala, lalu psikolog membaca <b>pola</b> dari semua skala itu. Satu jawaban tidak menentukan apa pun. Karena itu
          tidak ada &quot;kunci jawaban&quot; yang berlaku.
        </p>
      </section>
      <section>
        <h2>Sebelum dibaca, jawabanmu dicek dulu</h2>
        <p>
          Hasil tes hanya dibaca bila pola jawabannya bisa dipercaya (valid). Ada 5 tanda yang membuat hasil dianggap tidak
          valid:
        </p>
        <ol className="ksw-tanda">
          {TANDA.map((t) => (
            <li key={t.judul}>
              <b>{t.judul}</b>
              <span>{t.isi}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="ksw-callout">
        <h2>Hati-hati dengan &quot;kunci jawaban&quot; yang beredar</h2>
        <p>
          Kunci yang beredar biasanya menyuruh menjawab serba baik di semua soal. Justru pola itulah yang ditangkap cek
          &quot;sok sempurna&quot;. Peserta yang mengikutinya berisiko mendapat hasil tidak valid.
        </p>
      </section>
      <section>
        <h2>Jadi, cara paling aman?</h2>
        <p>
          Jawab jujur sesuai keadaanmu sehari-hari, jawab semua soal, dan jangan terlalu lama memikirkan satu pernyataan. Pelajari
          caranya di tab <Link href="/dashboard/keswa?tab=panduan">Panduan</Link>, lalu coba di tab{" "}
          <Link href="/dashboard/keswa?tab=simulasi">Simulasi</Link>.
        </p>
      </section>
    </div>
  );
}

const detikPerSoal = Math.round(KESWA_DURASI_DETIK / KESWA_TOTAL);

const LANGKAH = [
  { judul: "Siapkan badan", isi: "Tidur cukup dan makan sebelum tes. Badan yang lelah membuat jawaban terburu-buru dan tidak konsisten." },
  { judul: "Jawab keadaanmu yang biasa", isi: "Pikirkan dirimu sehari-hari, bukan hari ini saja dan bukan dirimu yang ideal." },
  { judul: "Jangan terlalu lama", isi: `${KESWA_TOTAL} soal dalam ${KESWA_DURASI_DETIK / 60} menit berarti sekitar ${detikPerSoal} detik per soal. Jawaban pertama yang muncul biasanya yang paling jujur.` },
  { judul: "Jawab semua soal", isi: `Soal kosong mengurangi kelengkapan profil. Di simulasi ini, ${KESWA_AMBANG.kosong} soal kosong atau lebih sudah dianggap tidak valid.` },
  { judul: "Bila ragu, pilih yang lebih sering benar", isi: "Tidak ada pilihan \"kadang-kadang\". Pilih Ya bila pernyataan itu lebih sering benar tentang dirimu, Tidak bila lebih sering salah." },
  { judul: "Baca kalimatnya sampai habis", isi: "Perhatikan kata seperti tidak, jarang, belum pernah. Salah baca satu kata membalik arti jawabanmu." },
  { judul: "Akui kekurangan kecil", isi: "Semua orang pernah kesal, lupa, atau menunda pekerjaan. Mengakuinya adalah tanda jujur, bukan tanda buruk." },
  { judul: "Tidak ada pola aman", isi: "Menjawab Ya semua atau Tidak semua tidak membuatmu terlihat baik. Pola seperti itu langsung terdeteksi." },
];

export function KeswaPanduan() {
  return (
    <div className="ksw-prose">
      <ol className="ksw-langkah">
        {LANGKAH.map((l, i) => (
          <li key={l.judul}>
            <span className="ksw-no tnum">{i + 1}</span>
            <div>
              <b>{l.judul}</b>
              <p>{l.isi}</p>
            </div>
          </li>
        ))}
      </ol>
      <section>
        <h2>Cara mengerjakan simulasi di sini</h2>
        <ul className="ksw-list">
          <li>Satu pernyataan per layar. Klik Ya/Tidak atau tekan <kbd>Y</kbd> / <kbd>T</kbd>; soal berikutnya muncul otomatis.</li>
          <li>Panah kiri/kanan atau nomor soal di panel kanan untuk kembali dan mengubah jawaban.</li>
          <li>Jawaban tersimpan di perangkat ini selama mengerjakan, jadi halaman yang tertutup bisa dilanjutkan.</li>
          <li>Setelah dikirim, hasil (VALID / TIDAK VALID + rincian 5 cek) tersimpan di akunmu. Maksimal 2 hasil per paket.</li>
        </ul>
      </section>
    </div>
  );
}
