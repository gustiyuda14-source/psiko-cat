import type { CSSProperties, ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { profilPilihan } from "@/lib/scoring/psikogram-sesi";
import { ASPEK_LABEL, BOBOT, JALUR, JALUR_LABEL, posisiDariTotal, type Jalur } from "@/lib/scoring/psikogram";
import "@/app/penilaian.css";
import { GRUP_ASPEK } from "./grup";
import PenilaianDaftarIsi from "./PenilaianDaftarIsi";
import PenilaianFaq from "./PenilaianFaq";
import PenilaianKalkulator from "./PenilaianKalkulator";

/*
  Cara Penilaian: penjelasan Peraturan As SDM Kapolri No. 3/2017 (transkrip: docs/riset/sumber/perasisten-sdm-3-2017)
  dan cara web ini menerapkannya. Angka contoh, bobot, dan tabel posisi dihitung dari lib/scoring/psikogram.ts
  supaya ikut berubah bila aturan di sana diubah.
*/

const BAGIAN = [
  { id: "dasar", label: "Aturan yang dipakai" },
  { id: "alur", label: "Perjalanan nilaimu" },
  { id: "aspek", label: "Apa saja yang dinilai" },
  { id: "mentah", label: "Nilai mentah per sub-tes" },
  { id: "baku", label: "Nilai baku & kategori" },
  { id: "ks", label: "Kenapa satu KS gugur" },
  { id: "psikogram", label: "Psikogram & bobot" },
  { id: "posisi", label: "Tabel posisi 1–85" },
  { id: "coba", label: "Coba hitung sendiri" },
  { id: "angka-lain", label: "Angka lain di web" },
  { id: "setelah", label: "Setelah tes" },
  { id: "tanya", label: "Tanya jawab" },
];

const NAMA_POLRI: Record<Jalur, string> = { AKPOL: "Akpol", SIPSS: "SIPSS", BINTARA: "Bintara", TAMTAMA: "Tamtama" };

const KATEGORI = [
  { k: "B", nama: "Baik", rentang: "nilai baku 16–20", nilai: 4, c: "var(--pnl-b)" },
  { k: "CB", nama: "Cukup Baik", rentang: "11,5–15,9", nilai: 3, c: "var(--pnl-cb)" },
  { k: "C", nama: "Cukup", rentang: "8,5–11,4", nilai: 2, c: "var(--pnl-c)" },
  { k: "K", nama: "Kurang", rentang: "4–8,4", nilai: 1, c: "var(--pnl-k)" },
  { k: "KS", nama: "Kurang Sekali", rentang: "0–3,9", nilai: -76, c: "var(--pnl-ks)" },
];

/** Rentang total psikogram untuk posisi 61–85 (zona Memenuhi Syarat), dari tabel posisi di psikogram.ts. */
function zonaMS(): { total: string; posisi: number }[] {
  const per = new Map<number, number[]>();
  for (let t = 40; t <= 80; t++) per.set(posisiDariTotal(t), [...(per.get(posisiDariTotal(t)) ?? []), t]);
  return [...per].map(([posisi, ts]) => ({ posisi, total: ts.length > 1 ? `${ts[0]} – ${ts.at(-1)}` : `${ts[0]}` }));
}

function Bagian({ id, no, judul, children }: { id: string; no: number; judul: string; children: ReactNode }) {
  return (
    <section id={id}>
      <p className="pnl-kicker">Bagian {no}</p>
      <h2>{judul}</h2>
      {children}
    </section>
  );
}

function Catatan({ children }: { children: ReactNode }) {
  return (
    <div className="pnl-note">
      <span className="pnl-psi" aria-hidden="true">Ψ</span>
      <div><b className="pnl-who">Catatan pendamping</b><p>{children}</p></div>
    </div>
  );
}

function Analogi({ judul = "Analogi", children }: { judul?: string; children: ReactNode }) {
  return <div className="pnl-analogi"><b>{judul}</b>{children}</div>;
}

function Contoh({ judul, rumus, total, status, children }: { judul: string; rumus: string; total: number; status?: "warn"; children: ReactNode }) {
  const posisi = posisiDariTotal(total);
  const ms = posisi >= 61;
  return (
    <div className="pnl-card">
      <h3>{judul}</h3>
      <div className="pnl-res">Posisi<b className="pnl-tnum">{posisi}</b>
        <span className={`pnl-pill ${status === "warn" ? "is-warn" : ms ? "is-ok" : "is-bad"}`}>{ms ? (status === "warn" ? "MS, pas-pasan" : "MS") : "TMS"}</span>
      </div>
      <p>{rumus} = {total}. {children}</p>
    </div>
  );
}

const Resmi = () => <span className="pnl-tag is-resmi">Aturan resmi</span>;
const Latihan = () => <span className="pnl-tag is-latihan">Aturan latihan</span>;

export default async function PenilaianPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profil = await profilPilihan();
  const zona = zonaMS();
  const separuh = Math.ceil(zona.length / 2);

  return (
    <div className="app-page pnl">
      <header className="pnl-hero">
        <div>
          <p className="pnl-kicker">Panduan penilaian psikotes</p>
          <h1>Dari jawabanmu sampai <em>angka 61</em>: begini nilaimu dihitung</h1>
          <p className="pnl-lead">Wajar kalau penasaran, bahkan cemas, soal angka yang keluar di layar. Halaman ini menjelaskan pelan-pelan dari mana angka itu datang, mana yang aturan resmi, mana yang cara kami melatihmu, dan apa artinya buat persiapanmu.</p>
        </div>
        <div className="pnl-ladder" aria-label="Tangga posisi 1 sampai 85">
          <div><span>Posisi 81–85</span><span>Baik</span></div>
          <div><span>Posisi 62–80</span><span>Cukup</span></div>
          <div className="is-gate"><span>Posisi 61</span><span>Batas Memenuhi Syarat</span></div>
          <div><span>Posisi 1–60</span><span>Kurang · TMS</span></div>
        </div>
      </header>

      <div className="pnl-wrap">
        <PenilaianDaftarIsi bagian={BAGIAN} />

        <div className="pnl-main">
          <Catatan>Psikotes tidak mencari orang yang sempurna. Psikotes mencari orang yang <b>cukup kuat di semua sisi</b> yang dibutuhkan sebuah peran. Kalau ada satu hal yang perlu kamu bawa dari halaman ini, itu dia. Hampir semua aturan di bawah lahir dari prinsip itu.</Catatan>

          <Bagian id="dasar" no={1} judul="Aturan yang dipakai">
            <p>Tes psikologi calon anggota Polri diatur oleh <b>Peraturan Asisten Kapolri Bidang SDM Nomor 3 Tahun 2017 tentang Pelaksanaan Tes Psikologi Calon Anggota Polri</b>. Peraturan ini ditetapkan 23 November 2017 dan disahkan Kapolri 4 Desember 2017. Ia mendapat mandat dari Perkap 10/2016 tentang Penerimaan Calon Anggota Polri, dan sampai pengumuman penerimaan 2026 masih dirujuk tanpa perubahan.</p>
            <p>Di web ini kamu akan melihat dua label kecil. Tolong kenali keduanya, karena kami ingin jujur soal mana yang pasti dan mana yang perkiraan:</p>
            <div className="pnl-cards is-2">
              <div className="pnl-card"><span><Resmi /></span><p>Diambil langsung dari teks peraturan: 5 kategori, bobot tiap aspek per jalur, nilai kategori, tabel posisi 1–85, batas 61, dan aturan &quot;KS mematikan&quot;.</p></div>
              <div className="pnl-card"><span><Latihan /></span><p>Bagian yang tidak dipublikasikan Polri, jadi kami isi dengan perkiraan terbaik. Contohnya norma pembanding (kelompok peserta asli diganti peserta platform) dan rumus nilai mentah Sikap Kerja.</p></div>
            </div>
            <Analogi>Bayangkan resep turun-temurun. Takaran bumbunya tertulis jelas di buku (aturan resmi), tapi rasa &quot;pas&quot; tiap dapur dicoba dari lidah orang yang makan (norma). Kami memakai takaran yang sama persis, lalu mencicipinya bersama teman-teman latihanmu.</Analogi>
          </Bagian>

          <Bagian id="alur" no={2} judul="Perjalanan nilaimu, dari klik sampai keputusan">
            <ol className="pnl-flow">
              <li><b>Jawaban</b><small>Tiap butir diberi skor sesuai jenis soalnya.</small></li>
              <li><b>Nilai mentah</b><small>Skor dikumpulkan per aspek, misalnya Berpikir Logis.</small></li>
              <li><b>Nilai baku 0–20</b><small>Posisimu dibanding kelompok peserta.</small></li>
              <li><b>Kategori</b><small>B, CB, C, K, atau KS untuk tiap aspek.</small></li>
              <li><b>Psikogram</b><small>Kategori dikali bobot aspek, lalu dijumlah.</small></li>
              <li className="is-end"><b>Posisi 1–85</b><small>Minimal 61 dan tanpa KS: Memenuhi Syarat.</small></li>
            </ol>
            <p>Perhatikan: nilai akhir resmi <b>bukan persentase jawaban benar</b>. Ia adalah nomor anak tangga 1 sampai 85. Karena itu angka di tes asli sering terasa &quot;aneh&quot; kalau dibaca seperti nilai rapor.</p>
          </Bagian>

          <Bagian id="aspek" no={3} judul="Apa saja yang dinilai">
            <p>Peraturan menyebut lima hal: <b>kecerdasan, kepribadian, sikap kerja, minat, dan kesehatan mental</b>. Tiga yang pertama diukur lewat tes tertulis (CAT) dan masuk psikogram. Minat dan kesehatan mental digali lewat wawancara dan observasi.</p>
            <div className="pnl-cards">
              <div className="pnl-card"><p className="pnl-kicker">Kecerdasan</p><h3>Cara berpikirmu</h3><ul><li>Berpikir Praktis</li><li>Berpikir Verbal</li><li>Berpikir Logis</li><li>Berpikir Analitis <small>(jalur perwira)</small></li></ul></div>
              <div className="pnl-card"><p className="pnl-kicker">Kepribadian</p><h3>Cara kamu bersikap</h3><ul><li>Stabilitas Emosi</li><li>Prososial</li><li>Penyesuaian Diri</li><li>Kepercayaan Diri</li><li>Motif Berprestasi</li><li>Pengambilan Keputusan</li><li>Loyalitas, Kerja Sama <small>(Bintara, Tamtama)</small></li></ul></div>
              <div className="pnl-card"><p className="pnl-kicker">Sikap Kerja</p><h3>Cara kamu bekerja</h3><ul><li>Kecepatan Kerja</li><li>Ketelitian Kerja</li><li>Ketahanan Kerja</li></ul><p className="pnl-muted">Di web ini diukur lewat modul Kecermatan.</p></div>
            </div>
          </Bagian>

          <Bagian id="mentah" no={4} judul="Nilai mentah: bagaimana tiap sub-tes diberi skor">
            <div className="pnl-cards">
              <div className="pnl-card"><p className="pnl-kicker">Kecerdasan <Resmi /></p>
                <p>Benar 1, salah 0. <b>Salah tidak mengurangi nilai</b>, jadi jangan biarkan soal kosong.</p>
                <p className="pnl-muted">Di simulasi kami, 100 soal dibagi empat blok:</p>
                <pre className="pnl-formula">{"No 1–25    Verbal\nNo 26–50   Logis\nNo 51–75   Analitis\nNo 76–100  Praktis"}</pre></div>
              <div className="pnl-card"><p className="pnl-kicker">Kepribadian <Resmi /></p>
                <p>Pernyataan bertingkat diberi skor 1–4 sesuai arah aspeknya. Soal situasional diberi bobot 1–5 untuk tiap pilihan tindakan.</p>
                <p className="pnl-muted">Tidak ada jawaban &quot;benar&quot; secara moral. Yang dinilai adalah seberapa kuat sisi aspek itu tampak dari pilihanmu. Soal yang dikosongkan dapat skor terendah.</p></div>
              <div className="pnl-card"><p className="pnl-kicker">Sikap Kerja <Latihan /></p>
                <p>Peraturan hanya menyebut tiga nilai: kecepatan, ketelitian, ketahanan. Rumusnya tidak dirinci, jadi kami pakai ini:</p>
                <pre className="pnl-formula">{"Kecepatan  = jawaban benar bersih\nKetelitian = benar ÷ jumlah klik\nKetahanan  = keajegan antar lajur"}</pre>
                <p className="pnl-muted">&quot;Benar bersih&quot; = benar dikurangi seperempat salah, supaya klik asal tidak untung.</p></div>
            </div>
            <Analogi judul="Analogi Sikap Kerja">Ketahanan itu napas pelari maraton, bukan sprinter. Lajur pertama secepat kilat lalu ambruk di lajur kelima akan terbaca kurang tahan dibanding orang yang stabil dari awal sampai akhir, meskipun total benarnya mirip.</Analogi>
          </Bagian>

          <Bagian id="baku" no={5} judul="Nilai baku dan lima kategori">
            <p>Pasal 1 menyebut nilai baku sebagai nilai yang <b>&quot;menunjukkan posisi individu dalam kelompok&quot;</b>. Artinya nilaimu tidak berdiri sendiri. Ia dibaca dengan membandingkanmu ke peserta lain yang mengerjakan tes yang sama.</p>
            <Analogi>Lari 100 meter dalam 13 detik itu cepat atau lambat? Di kelas yang rata-ratanya 15 detik, kamu jagoan. Di kelompok atlet yang rata-ratanya 11 detik, kamu tertinggal. Waktunya sama, posisinya yang beda. Nilai baku mengukur posisi itu.</Analogi>
            <div className="pnl-kat">
              {KATEGORI.map((k) => (
                <div key={k.k} style={{ "--c": k.c } as CSSProperties}><b>{k.k}</b><span>{k.nama}</span><small className="pnl-tnum">{k.rentang}</small><em>nilai kategori {k.nilai}</em></div>
              ))}
            </div>
            <div className="pnl-card" style={{ maxWidth: "74ch" }}><span><Latihan /></span>
              <p>Polri membandingkan peserta per Polda (Bintara, Tamtama) atau nasional (Akpol, SIPSS). Kelompok itu tidak bisa kami akses, jadi pembandingmu adalah <b>peserta platform</b>. Peserta yang tepat di rata-rata mendapat nilai baku 10, di tengah kategori Cukup. Setiap satu simpangan baku di atas rata-rata menambah 3 poin, dan di bawahnya mengurangi 3 poin.</p>
              <p>Jadi KS kira-kira berarti tertinggal lebih dari dua simpangan baku dari kebanyakan teman latihanmu. Supaya adil, jawaban sempurna selalu bisa mencapai B walaupun rata-rata kelompok sudah tinggi.</p></div>
          </Bagian>

          <Bagian id="ks" no={6} judul="Kenapa satu KS bisa menggugurkan">
            <p>Lampiran peraturan menulis dengan tegas: <b>&quot;Kategori KS mematikan, artinya apabila salah satu aspek mendapat nilai dengan kategori KS, maka nilai akhir menjadi tidak memenuhi syarat.&quot;</b> Caranya lewat angka: B bernilai 4, tapi KS bernilai <b>−76</b>.</p>
            <Analogi>Mobil dengan mesin terbaik, rem pakem, dan jok nyaman tetap tidak bisa jalan kalau satu bannya bocor. Penguji tidak sedang menghukummu. Mereka hanya tahu bahwa di lapangan, satu sisi yang sangat lemah bisa membuat semua kelebihanmu tidak terpakai.</Analogi>
            <div className="pnl-cards is-2 pnl-ex">
              <Contoh judul="Semua aspek B, satu aspek KS (bobot 1)" rumus="19 × 4 + 1 × (−76)" total={0}>Jauh di bawah 61.</Contoh>
              <Contoh judul="Semua aspek B, satu aspek K (bobot 2)" rumus="18 × 4 + 2 × 1" total={74}>Kurang di satu aspek masih bisa ditutup aspek lain. Kurang Sekali tidak bisa.</Contoh>
            </div>
            <Catatan>Makanya latihan terbaik bukan mengejar satu aspek favorit sampai sempurna. Latihan terbaik adalah <b>mengangkat aspek terlemahmu keluar dari zona merah</b>. Di halaman hasil, aspek KS selalu kami tandai sebagai prioritas latihan.</Catatan>
          </Bagian>

          <Bagian id="psikogram" no={7} judul="Psikogram: bobot berbeda untuk peran berbeda">
            <p>Setiap jalur membutuhkan racikan kemampuan yang berbeda. Total bobotnya selalu 20, tapi pembagiannya tidak sama. Tabel ini kami salin dari lampiran peraturan <Resmi />.</p>
            <div className="pnl-tbl"><table>
              <thead><tr><th>Aspek</th>{JALUR.map((j) => <th key={j} className="n">{JALUR_LABEL[j]}<br /><small>{NAMA_POLRI[j]}</small></th>)}</tr></thead>
              <tbody>
                {GRUP_ASPEK.map(([grup, daftar]) => [
                  <tr key={grup} className="is-grp"><td colSpan={JALUR.length + 1}>{grup}</td></tr>,
                  ...daftar.map((a) => (
                    <tr key={a}><td>{ASPEK_LABEL[a]}</td>{JALUR.map((j) => <td key={j} className="n">{BOBOT[j][a] ?? "–"}</td>)}</tr>
                  )),
                ])}
              </tbody>
              <tfoot>
                <tr><td>Total bobot</td>{JALUR.map((j) => <td key={j} className="n">{Object.values(BOBOT[j]).reduce((s, v) => s + (v ?? 0), 0)}</td>)}</tr>
                <tr><td>Kecerdasan / Kepribadian / Sikap Kerja</td>{JALUR.map((j) => (
                  <td key={j} className="n">{GRUP_ASPEK.map(([, d]) => d.reduce((s, a) => s + (BOBOT[j][a] ?? 0), 0)).join(" / ")}</td>
                ))}</tr>
              </tfoot>
            </table></div>
            <Analogi judul="Cara membacanya">Analis Profesional menaruh bobot 3 di Berpikir Analitis dan Ketelitian, karena perannya banyak menimbang data. Pelaksana menaruh 11 dari 20 bobot di kepribadian, karena tugasnya setiap hari berhadapan langsung dengan orang. Tidak ada profil yang lebih &quot;mudah&quot;. Yang ada hanya profil yang menilai hal berbeda dengan lebih berat.</Analogi>
            <p>Nama profil di web ini sengaja dibuat umum karena peserta kami juga calon sekolah kedinasan: <b>Kepemimpinan</b> (setara Akpol, sekolah kedinasan, dan setaranya), <b>Analis Profesional</b> (setara SIPSS dan formasi sarjana), <b>Pelaksana</b> (setara Bintara dan staf pelaksana), <b>Operasional</b> (setara Tamtama dan petugas lapangan).</p>
          </Bagian>

          <Bagian id="posisi" no={8} judul="Tabel posisi: dari total psikogram ke angka 1–85">
            <p>Total psikogram bisa bergerak dari −1520 (semua KS) sampai 80 (semua B). Peraturan lalu menerjemahkannya ke posisi 1–85. Kategori posisinya: <b>1–60 Kurang, 61–80 Cukup, 81–85 Baik</b>. Memenuhi Syarat bila <b>minimal 61</b>.</p>
            <div className="pnl-cards is-2 pnl-ex">
              <Contoh judul="Semua aspek Cukup" rumus="20 × 2" total={40} status="warn">Tepat di batas. &quot;Cukup di semua hal&quot; adalah garis minimum, bukan zona aman.</Contoh>
              <Contoh judul="Hampir semua Cukup, satu aspek bobot 2 Kurang" rumus="18 × 2 + 2 × 1" total={38}>Turun sedikit saja di aspek berbobot besar sudah membuatmu di bawah garis.</Contoh>
              <Contoh judul="Semua aspek Cukup Baik" rumus="20 × 3" total={60}>Ini zona yang kami sarankan sebagai target latihan.</Contoh>
              <Contoh judul="Semua aspek Baik" rumus="20 × 4" total={80}>Posisi tertinggi.</Contoh>
            </div>
            <details className="pnl-q pnl-press">
              <summary>Lihat tabel posisi lengkap (zona 61–85)<small>Ketuk untuk membuka</small></summary>
              <div className="pnl-a">
                <div className="pnl-tbl"><table>
                  <thead><tr><th>Total psikogram</th><th className="n">Posisi</th><th>Total psikogram</th><th className="n">Posisi</th></tr></thead>
                  <tbody>
                    {zona.slice(0, separuh).map((r, i) => {
                      const s = zona[separuh + i];
                      return <tr key={r.posisi}><td>{r.total}</td><td className="n">{r.posisi}</td><td>{s?.total}</td><td className="n">{s?.posisi}</td></tr>;
                    })}
                  </tbody>
                </table></div>
                <p className="pnl-muted">Total 19 sampai 39 naik satu posisi per poin (posisi 40–60). Total di bawah 19 turun bertahap sampai posisi 1.</p>
              </div>
            </details>
          </Bagian>

          <Bagian id="coba" no={9} judul="Coba hitung sendiri">
            <p>Pilih profil tujuanmu, lalu ubah kategori tiap aspek. Kamu akan langsung melihat bagaimana satu aspek bisa mengangkat atau menjatuhkan nilai akhir. Kalkulator ini tidak mengubah profil tujuan di akunmu.</p>
            <PenilaianKalkulator awal={profil} />
          </Bagian>

          <Bagian id="angka-lain" no={10} judul="Angka lain yang mungkin kamu temui di web ini">
            <div className="pnl-cards is-2">
              <div className="pnl-card"><h3>Nilai Akhir Psikotest 0–100 <Latihan /></h3><p>Angka lama yang masih muncul di grafik tren dan sesi satu sub-tes: Kecerdasan 60% + Kepribadian 20% + Sikap Kerja 20%, lulus 61, satu sub-tes 40 ke bawah gugur. Bobot 60/20/20 berasal dari kebiasaan bimbel, bukan dari peraturan. Pakai untuk melihat tren naik-turunmu. Untuk menilai peluang, pegang psikogram.</p></div>
              <div className="pnl-card"><h3>Kategori per aspek di mini tryout</h3><p>Mini tryout hanya berisi satu sub-tes, jadi yang keluar kategori tiap aspek tanpa nilai akhir. Nilai akhir per profil butuh ketiga sub-tes, dan baru keluar di simulasi penuh.</p></div>
              <div className="pnl-card"><h3>Integritas &amp; Kejujuran (Pass Hand)</h3><p>Soal pilihan A/B ditampilkan sebagai persentase kesesuaian dan tidak masuk psikogram. Soal kembar yang kalimatnya diubah dipakai untuk melihat apakah jawabanmu konsisten.</p></div>
              <div className="pnl-card"><h3>Keswa: Valid / Tidak Valid</h3><p>Penanda latihan apakah pola jawabanmu wajar: tidak terlalu banyak kosong, konsisten, dan tidak sok sempurna. <b>Ini bukan diagnosis kesehatan jiwa.</b> Di seleksi asli, kesehatan mental dinilai psikolog lewat tes dan wawancara.</p></div>
            </div>
          </Bagian>

          <Bagian id="setelah" no={11} judul="Setelah tes tertulis">
            <div className="pnl-prose">
              <p><b>Hasil diumumkan terbuka.</b> Perkap 10/2016 Pasal 13 ayat 3 mewajibkan hasil seleksi diumumkan langsung dan terbuka. Di banyak Polda, nilai CAT tampil di layar dan peserta menandatanganinya.</p>
              <p><b>Ada tahap wawancara.</b> Tahap II dinilai kualitatif oleh psikolog untuk mengonfirmasi hasil tes tertulis, menggali minat dan kesehatan mental, lalu diputuskan dalam rapat integrasi. Jadi nilai CAT 61 ke atas belum otomatis lulus psikologi.</p>
              <p><b>Ada layanan konseling.</b> Pasal 2 peraturan mewajibkan panitia membuka layanan konseling bagi peserta yang Tidak Memenuhi Syarat. Pakailah. Konseling itu tempat terbaik untuk tahu sisi mana yang perlu diperkuat untuk tahun berikutnya.</p>
              <p><b>Tidak ada prosedur sanggah khusus.</b> Yang tersedia adalah jalur pengaduan bila kamu melihat penyimpangan dalam proses seleksi.</p>
            </div>
            <Catatan>TMS di psikologi berarti profilmu belum cocok dengan tuntutan peran itu <b>saat ini</b>. Ia tidak menilai harga dirimu. Banyak peserta lolos di percobaan kedua setelah tahu persis aspek mana yang jatuh dan melatihnya dengan sabar.</Catatan>
          </Bagian>

          <Bagian id="tanya" no={12} judul="Tanya jawab">
            <PenilaianFaq />
          </Bagian>

          <div className="pnl-closing">
            <p className="pnl-kicker">Penutup</p>
            <h2>Angka itu peta, bukan vonis</h2>
            <p style={{ maxWidth: "68ch" }}>Setiap angka di web ini kami buat supaya kamu tahu harus melangkah ke mana. Rawat aspek terlemahmu, jaga kestabilan dari awal sampai akhir, dan jawab soal kepribadian sebagai dirimu yang paling konsisten. Kami temani prosesnya.</p>
            <div className="pnl-src">
              <span>Sumber: Peraturan As SDM Kapolri No. 3/2017 (Pasal 1, 2, 7–10; Lampiran A hlm 16–22) · Perkap 10/2016 Pasal 13 · Pengumuman penerimaan Polri 2026.</span>
              <span>Bagian berlabel &quot;Aturan latihan&quot; adalah perkiraan D&apos;AJIKS, bukan ketentuan resmi.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
