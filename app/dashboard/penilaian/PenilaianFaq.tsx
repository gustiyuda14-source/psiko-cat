"use client";

import { useState } from "react";

/* Tanya jawab yang bisa dicari. Isi mengikuti Peraturan As SDM 3/2017 dan cara web ini menilai (lib/scoring). */
const FAQ: [string, [string, string][]][] = [
  ["Dasar aturan", [
    ["Apakah cara penilaian di sini sama persis dengan Polri?", "Struktur penilaiannya sama: kategori B sampai KS, bobot per aspek, nilai kategori, tabel posisi 1–85, batas 61, dan aturan KS mematikan. Semua itu diambil dari Peraturan As SDM No. 3/2017. Yang berbeda adalah kelompok pembandingnya. Polri membandingkanmu dengan peserta satu Polda atau nasional, sedangkan kami membandingkan dengan peserta platform. Bagian seperti ini selalu kami beri label Aturan latihan."],
    ["Peraturan apa yang jadi dasar, dan apakah masih berlaku?", "Peraturan Asisten Kapolri Bidang SDM Nomor 3 Tahun 2017 tentang Pelaksanaan Tes Psikologi Calon Anggota Polri. Pengumuman penerimaan Akpol, Bintara, dan Tamtama 2026 masih merujuknya tanpa menyebut perubahan."],
    ["Kenapa ada label Aturan resmi dan Aturan latihan?", "Karena kami tidak mau kamu mengira semua angka di sini pasti sama dengan tes asli. Aturan resmi ditulis di peraturan. Aturan latihan adalah perkiraan kami untuk bagian yang tidak dipublikasikan, misalnya norma pembanding dan rumus nilai mentah Sikap Kerja."],
  ]],
  ["Nilai & kategori", [
    ["Kenapa nilaiku dibandingkan dengan peserta lain, bukan persentase benar?", "Peraturan mendefinisikan nilai baku sebagai posisi individu dalam kelompok. Jadi 70% benar bisa berarti Baik di kelompok yang rata-ratanya 40%, dan hanya Cukup di kelompok yang rata-ratanya 70%."],
    ["Aku benar 70% tapi kategorinya cuma Cukup. Kenapa?", "Kemungkinan besar rata-rata peserta di aspek itu juga sekitar 70%. Tepat di rata-rata berarti nilai baku 10, yaitu Cukup. Untuk naik ke Cukup Baik kamu perlu sekitar satu simpangan baku di atas rata-rata teman latihanmu."],
    ["Kalau jawabanku sempurna, pasti Baik?", "Ya. Kami menambahkan pengaman supaya jawaban sempurna selalu mencapai B, walaupun rata-rata kelompok sudah sangat tinggi."],
    ["Kenapa kategori sesi lamaku bisa berubah padahal jawabannya sama?", "Nilai baku dihitung ulang setiap kali halaman hasil dibuka, memakai norma terbaru. Saat peserta platform bertambah, rata-rata kelompok bisa bergeser, jadi posisimu juga bisa bergeser sedikit. Jawabanmu tidak berubah. Yang berubah adalah pembandingnya."],
    ["Apakah jawaban salah mengurangi nilai?", "Di Kecerdasan tidak: benar 1, salah 0, jadi isi semua soal. Di Sikap Kerja ada pengurangan kecil, yaitu seperempat jumlah salah, supaya klik asal tidak menguntungkan. Di Kepribadian, soal kosong mendapat skor terendah."],
  ]],
  ["KS & kelulusan", [
    ["Nilai akhirku di atas 61, tapi tetap TMS. Kok bisa?", "Di psikogram resmi hal ini hampir tidak mungkin, karena satu KS bernilai −76 dan langsung menjatuhkan total ke bawah 61. Kalau kamu melihat angka 61 ke atas bersama status TMS, kemungkinan itu Nilai Akhir Psikotest 0–100 versi latihan. Di versi itu, satu sub-tes bernilai 40 ke bawah langsung gugur meskipun totalnya tinggi."],
    ["Kenapa satu KS begitu berat?", "Peraturan menulisnya tegas: kategori KS mematikan. Nilai B = 4, tapi KS = −76. Logikanya, satu sisi yang sangat lemah bisa membuat seluruh kelebihan tidak berguna di lapangan, seperti mobil bagus dengan satu ban bocor."],
    ["Kalau semua aspekku Cukup, aku lulus?", "Tepat lulus. Total 40 masuk posisi 61. Tapi itu garis paling tipis: satu aspek berbobot 2 turun ke Kurang sudah membuatmu jatuh ke posisi 59. Targetkan Cukup Baik."],
    ["Aspek mana yang paling perlu kulatih?", "Urutannya: aspek KS lebih dulu, apa pun bobotnya. Lalu aspek K yang bobotnya besar di profilmu. Lihat tabel bobot di bagian Psikogram & bobot, atau coba kalkulator di bagian Coba hitung sendiri."],
  ]],
  ["Profil", [
    ["Profil mana yang harus kupilih?", "Pilih yang paling dekat dengan tujuanmu. Kepemimpinan untuk Akpol, sekolah kedinasan, dan setaranya. Analis Profesional untuk SIPSS dan formasi sarjana. Pelaksana untuk Bintara dan staf pelaksana. Operasional untuk Tamtama dan petugas lapangan. Profil tujuanmu tersimpan di akun dan bisa diganti kapan saja."],
    ["Aku mendaftar sekolah kedinasan, bukan Polri. Berlaku juga?", "Aspeknya mirip, karena pedoman seleksi sekolah kedinasan 2026 memakai nama aspek yang sama. Bobot dan tabel posisinya diambil dari aturan Polri, jadi untuk sekolah kedinasan anggap ini perkiraan latihan dari peran yang setara, bukan aturan resmi sekolahmu."],
    ["Kenapa nilai akhirku berbeda di tiap profil?", "Karena bobotnya berbeda. Kalau Berpikir Analitis-mu kuat, kamu akan lebih bersinar di Analis Profesional yang memberi bobot 3. Kalau Kerja Sama-mu lemah, Pelaksana dan Operasional yang memberi bobot 2 akan lebih terasa."],
  ]],
  ["Sub-tes", [
    ["Bagaimana Sikap Kerja (Kecermatan) dinilai?", "Ada tiga hal. Kecepatan dari jumlah benar bersih. Ketelitian dari perbandingan benar dengan jumlah klik. Ketahanan dari seberapa ajeg jumlah benarmu dari lajur ke lajur. Ketelitian dan ketahanan baru dinilai penuh kalau kamu menjawab cukup banyak, sekitar 15 benar bersih per lajur. Rumus ini perkiraan kami, karena peraturan tidak merincinya."],
    ["Aku cepat, kenapa Ketahanan-ku rendah?", "Ketahanan tidak mengukur cepat. Ia mengukur stabil. Kalau lajur awal sangat tinggi lalu menurun tajam, keajeganmu rendah. Latih ritme yang bisa kamu pertahankan sampai lajur terakhir."],
    ["Apakah soal Kepribadian punya jawaban benar?", "Tidak ada benar-salah secara moral. Setiap soal mengukur satu aspek, dan skor tertinggi diberikan pada pilihan yang paling kuat menunjukkan aspek itu. Saran kami: pahami aspeknya, lalu jawab sebagai dirimu yang paling konsisten."],
    ["Kenapa ada soal Kepribadian yang mirip-mirip?", "Itu soal kembar dengan kalimat berbeda. Gunanya melihat apakah jawabanmu konsisten. Jawaban yang berubah-ubah pada maksud yang sama memberi kesan kamu sedang menebak-nebak jawaban yang diinginkan penguji."],
    ["Pass Hand atau Integritas ikut dihitung ke psikogram?", "Di web ini tidak. Pass Hand ditampilkan terpisah sebagai persentase kesesuaian dan pembahasannya. Di seleksi asli, integritas juga digali lewat wawancara."],
  ]],
  ["Angka di web", [
    ["Kenapa ada dua angka, 0–100 dan 1–85?", "Angka 1–85 adalah psikogram yang mengikuti peraturan, dan itulah pegangan utamamu. Angka 0–100 adalah Nilai Akhir Psikotest versi latihan lama (60/20/20) yang masih dipakai di grafik tren dan sesi satu sub-tes. Gunakan untuk melihat perkembangan, bukan untuk menilai peluang lulus."],
    ["Kenapa mini tryout tidak punya nilai akhir?", "Nilai akhir 1–85 menjumlahkan semua aspek berbobot di ketiga sub-tes. Mini tryout hanya berisi satu sub-tes, jadi yang keluar kategori per aspek. Kerjakan simulasi penuh untuk nilai akhir."],
    ["Apa arti tulisan Belum diuji?", "Ada aspek berbobot di profilmu yang belum punya nilai, misalnya karena paket lama belum memuat soal Loyalitas atau Kerja Sama. Nilai akhir baru keluar kalau semua aspek profil itu sudah dikerjakan. Satu KS tetap langsung membuat TMS walaupun hasilnya belum lengkap."],
    ["Keswa bilang Tidak Valid. Apakah aku bermasalah secara mental?", "Bukan. Keswa di sini hanya memeriksa pola jawaban: terlalu banyak kosong, tidak konsisten, terlalu sering menjawab Ya atau Tidak, atau tampak sok sempurna. Itu tanda cara menjawabmu perlu dibenahi, bukan diagnosis."],
  ]],
  ["Setelah tes", [
    ["Kalau nilai CAT-ku 61 ke atas, pasti lulus psikologi?", "Belum tentu. Ada Tahap II, yaitu wawancara psikologi yang dinilai kualitatif dan diputuskan dalam rapat integrasi. Nilai CAT membuka pintu, wawancara memastikan."],
    ["Kalau TMS, bisa sanggah?", "Peraturan tidak menyediakan prosedur sanggah khusus untuk hasil psikologi. Yang tersedia adalah pengaduan kalau ada penyimpangan proses, dan layanan konseling bagi peserta TMS, yang diwajibkan oleh Pasal 2."],
    ["Apakah nilai psikologi bisa naik dengan latihan?", "Kecerdasan dan Sikap Kerja jelas bisa terlatih: terbiasa dengan format, mengatur waktu, dan menjaga ritme. Untuk Kepribadian, latihan membantumu memahami apa yang diukur tiap aspek dan menjawab dengan konsisten, bukan mengubah dirimu menjadi orang lain."],
  ]],
];
const TOTAL = FAQ.reduce((s, [, qs]) => s + qs.length, 0);

export default function PenilaianFaq() {
  const [cari, setCari] = useState("");
  const kata = cari.trim().toLowerCase();
  const hasil = FAQ.map(([grup, qs]) => [grup, kata ? qs.filter(([q, a]) => `${q} ${a}`.toLowerCase().includes(kata)) : qs] as const)
    .filter(([, qs]) => qs.length);
  const n = hasil.reduce((s, [, qs]) => s + qs.length, 0);

  return (
    <>
      <p className="pnl-hint">Ketuk pertanyaan untuk membuka jawabannya</p>
      <div className="pnl-faq-tools">
        <label htmlFor="pnl-faq-q" className="pnl-kicker">Cari pertanyaanmu</label>
        <input id="pnl-faq-q" type="search" placeholder="Contoh: KS, profil, ketahanan, sanggah" autoComplete="off" value={cari} onChange={(e) => setCari(e.target.value)} />
        <span>{kata ? `${n} cocok` : `${TOTAL} pertanyaan`}</span>
      </div>
      {hasil.map(([grup, qs]) => (
        <div key={grup} className="pnl-faq-grp">
          <h3>{grup}</h3>
          {qs.map(([q, a]) => (
            // key ikut kata supaya hasil pencarian terbuka, dan tertutup lagi saat kotak cari dikosongkan.
            <details key={`${q}|${kata}`} className="pnl-q pnl-press" open={!!kata}>
              <summary>{q}<small>Ketuk untuk melihat jawaban</small></summary>
              <div className="pnl-a"><p>{a}</p></div>
            </details>
          ))}
        </div>
      ))}
      {!n && <p className="pnl-none">Belum ada jawaban untuk kata itu. Coba kata lain, atau tanyakan langsung ke mentormu.</p>}
    </>
  );
}
