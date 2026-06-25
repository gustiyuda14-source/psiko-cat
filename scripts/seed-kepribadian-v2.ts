/**
 * Migrasi 100 soal KEPRIBADIAN:
 *  - 90 soal dari psiko-kepribadian.vercel.app (Bagian 2, 6 aspek × 15)
 *  - 10 soal baru yang digenerate (2+2+2+1+2+1 per aspek)
 *
 * Cara jalankan:
 *   npx tsx scripts/seed-kepribadian-v2.ts
 *
 * Script ini UPDATE soal yang sudah ada di DB (match by type+sequence_number).
 * ID tidak berubah — aman untuk jawaban/sesi yang sudah ada.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type Polarity = "favorable" | "unfavorable";

type Q = {
  seq: number;
  aspect: string;
  statement: string;
  polarity: Polarity;
  expl: string;
};

const CHOICES = [
  { key: "A", text: "Sangat Setuju" },
  { key: "B", text: "Setuju" },
  { key: "C", text: "Netral" },
  { key: "D", text: "Tidak Setuju" },
  { key: "E", text: "Sangat Tidak Setuju" },
];

const W_FAV   = { A: 0.2, B: 0.15, C: 0.1, D: 0.05, E: 0.04 };
const W_UNFAV = { A: 0.04, B: 0.05, C: 0.1, D: 0.15, E: 0.2 };

// ──────────────────────────────────────────────────────────────────────────────
// 100 SOAL — 90 dari repo eksternal + 10 baru (ditandai [NEW])
// Distribusi: Prososial 17, PK 17, PenyDiri 17, KepDiri 16, StabEmo 17, MB 16
// ──────────────────────────────────────────────────────────────────────────────
const QUESTIONS: Q[] = [
  // ── PROSOSIAL (1–17) ──
  { seq: 1,  aspect: "Prososial", polarity: "unfavorable", statement: "Memandu kegiatan lomba 17 Agustus lebih baik daripada terlibat dalam kerja bakti di lingkungan tempat tinggal.", expl: "Kerja bakti di lingkungan adalah bentuk partisipasi sosial langsung yang lebih mencerminkan perilaku prososial sejati. Orang yang prososial mengutamakan kontribusi komunitas atas performa individu." },
  { seq: 2,  aspect: "Prososial", polarity: "favorable",   statement: "Tidak bisa memimpin lebih memalukan dibanding tidak setia kawan.", expl: "Kemampuan memimpin adalah kualitas inti yang sangat dihargai dalam konteks profesional dan sosial. Bagi calon aparatur, tidak bisa memimpin adalah kekurangan yang signifikan." },
  { seq: 3,  aspect: "Prososial", polarity: "favorable",   statement: "Memberikan barang yang disukai pada yang membutuhkan lebih mulia daripada berbohong demi kebaikan.", expl: "Pengorbanan tulus dengan memberikan yang dicintai adalah prososialitas tertinggi. Berbohong, meski untuk kebaikan, mengandung unsur manipulasi yang tidak selaras dengan nilai kejujuran." },
  { seq: 4,  aspect: "Prososial", polarity: "favorable",   statement: "Saya lebih suka mengorbankan waktu istirahat untuk menghibur teman yang punya masalah daripada menyarankan curhat ke guru BK.", expl: "Dukungan personal langsung dengan mengorbankan waktu istirahat menunjukkan perilaku prososial yang tinggi — lebih bermakna dibanding sekadar mengarahkan ke pihak ketiga." },
  { seq: 5,  aspect: "Prososial", polarity: "unfavorable", statement: "Melayat tetangga dengan rasa terpaksa masih lebih baik daripada hanya memanjatkan doa dari kejauhan.", expl: "Ketulusan niat jauh lebih penting dari kehadiran fisik yang terpaksa. Doa yang tulus dari kejauhan memiliki nilai lebih tinggi daripada kunjungan yang dipaksakan tanpa keikhlasan." },
  { seq: 6,  aspect: "Prososial", polarity: "unfavorable", statement: "Sukarela mengorbankan waktu untuk mendengarkan teman lebih menyebalkan daripada harus membantu kerja bakti di lingkungan.", expl: "Pernyataan ini mendeskripsikan sikap anti-prososial. Orang dengan orientasi prososial yang tinggi tidak akan menganggap membantu teman sebagai hal yang menyebalkan." },
  { seq: 7,  aspect: "Prososial", polarity: "unfavorable", statement: "Menengok teman yang sakit dengan terpaksa lebih baik daripada hanya mendoakan melalui media sosial.", expl: "Kunjungan yang terpaksa tidak lebih bernilai dari doa yang tulus. Ketulusan adalah inti prososialitas — doa ikhlas dari jauh lebih bermakna daripada kunjungan setengah hati." },
  { seq: 8,  aspect: "Prososial", polarity: "favorable",   statement: "Menjelaskan tentang pelajaran kepada teman yang tidak mengikutinya lebih bernilai daripada bertanya langsung kepada teman tentang alasan tidak masuk sekolah.", expl: "Membantu secara akademis (mengajarkan pelajaran yang terlewat) adalah bentuk prososialitas yang tinggi dan konkret, memberikan manfaat nyata bagi teman yang membutuhkan." },
  { seq: 9,  aspect: "Prososial", polarity: "favorable",   statement: "Memberikan semangat kepada teman yang ikut perlombaan lebih menyenangkan daripada menemani pacar tampil di pentas seni.", expl: "Mendukung teman (bukan pasangan) dalam momen penting menunjukkan orientasi prososial yang kuat — mengutamakan dukungan sosial atas kepentingan hubungan romantis." },
  { seq: 10, aspect: "Prososial", polarity: "favorable",   statement: "Lebih baik mengikuti ronda keliling di lingkungan tempat tinggal daripada beristirahat cukup untuk menjaga stamina tubuh.", expl: "Partisipasi aktif dalam keamanan komunitas adalah bentuk nyata prososialitas. Mengutamakan keamanan bersama atas kenyamanan pribadi mencerminkan kepedulian sosial yang tinggi." },
  { seq: 11, aspect: "Prososial", polarity: "favorable",   statement: "Turut serta dalam tim pemadam kebakaran saat libur sekolah lebih mulia daripada menyelesaikan pekerjaan rumah.", expl: "Berpartisipasi dalam penanganan darurat untuk keselamatan publik adalah prososialitas tertinggi — mengorbankan waktu pribadi demi kepentingan banyak orang." },
  { seq: 12, aspect: "Prososial", polarity: "unfavorable", statement: "Menyelesaikan pekerjaan rumah lebih baik daripada mengikuti kerja bakti di halaman sekolah.", expl: "Orang yang prososial akan mengutamakan kerja bakti komunitas atas kepentingan pribadi. Pernyataan ini bertentangan dengan orientasi prososial yang diharapkan." },
  { seq: 13, aspect: "Prososial", polarity: "favorable",   statement: "Saling membantu dalam menyelesaikan masalah lebih baik daripada bersama-sama menutupi kesalahan teman.", expl: "Kolaborasi dalam problem-solving adalah prososial sekaligus etis. Menutupi kesalahan bersama justru kontraproduktif dan berpotensi merusak integritas kelompok." },
  { seq: 14, aspect: "Prososial", polarity: "favorable",   statement: "Membantu orang lain karena dimintai pertolongan lebih baik daripada membantu dengan mengharapkan rasa hormat.", expl: "Bantuan responsif yang tidak mengharapkan balasan mencerminkan motivasi prososial yang tulus dan murni, berbeda dari bantuan yang didorong oleh ego atau keinginan diakui." },
  { seq: 15, aspect: "Prososial", polarity: "unfavorable", statement: "Menghendaki teman untuk menuruti kemauan saya lebih baik daripada membiarkan kelompok belajar banyak becanda.", expl: "Menuntut kepatuhan orang lain pada keinginan pribadi adalah perilaku dominatif dan anti-prososial. Orang yang prososial tidak mengontrol orang lain untuk kepentingan dirinya." },
  // [NEW]
  { seq: 16, aspect: "Prososial", polarity: "favorable",   statement: "Menyisihkan sebagian uang saku untuk kegiatan sosial di sekolah lebih bernilai daripada menabung untuk keperluan pribadi.", expl: "Mengalokasikan sumber daya pribadi untuk kegiatan sosial adalah bentuk prososialitas yang konkret. Orang dengan orientasi prososial yang tinggi tidak segan mengorbankan kepentingan pribadi demi kesejahteraan komunitas." },
  { seq: 17, aspect: "Prososial", polarity: "unfavorable", statement: "Saya cenderung lebih peduli dengan permasalahan diri sendiri daripada memperhatikan kebutuhan orang di sekitar saya.", expl: "Fokus berlebihan pada masalah pribadi dengan mengabaikan orang lain menunjukkan rendahnya orientasi prososial. Orang yang prososial peka terhadap kebutuhan lingkungan sekitarnya." },

  // ── PENGAMBILAN KEPUTUSAN (18–34) ──
  { seq: 18, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Melaksanakan keputusan yang telah dibuat dengan yakin lebih baik daripada mempertimbangkannya kembali.", expl: "Komitmen pada keputusan dan eksekusi dengan keyakinan lebih efektif daripada terus-menerus mempertanyakannya. Ini mencerminkan decisiveness yang dibutuhkan dalam lingkungan kerja." },
  { seq: 19, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Menggunakan informasi yang ada untuk menganalisa lebih bijak daripada mengandalkan pengalaman yang dimiliki.", expl: "Analisis berbasis informasi terkini lebih objektif dan reliabel. Pengalaman masa lalu bisa tidak relevan dengan situasi baru yang berbeda konteks." },
  { seq: 20, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Sekali menentukan pilihan, saya tidak akan mengubahnya meskipun banyak alternatif lain yang menjanjikan.", expl: "Komitmen dan konsistensi pada keputusan yang telah dibuat adalah kualitas penting. Mudah berubah oleh alternatif mencerminkan ketidakdecisifan dan inkonsistensi." },
  { seq: 21, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Mengerjakan tugas secara perlahan lebih baik daripada menunda pekerjaan karena menunggu teman yang ahli.", expl: "Inisiatif bertindak sendiri (meski perlahan) jauh lebih produktif daripada prokrastinasi menunggu bantuan orang lain. Ini menunjukkan kemandirian dan action-orientation." },
  { seq: 22, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Mengerjakan tugas sesegera mungkin walaupun memiliki peluang terjadi kegagalan.", expl: "Keberanian bertindak cepat meski ada risiko kegagalan mencerminkan decisiveness dan action-orientation yang kuat — kualitas penting dalam pengambilan keputusan yang efektif." },
  { seq: 23, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Lebih baik menjadi orang yang spontan bertindak daripada orang yang penuh pertimbangan.", expl: "Tindakan spontan mencerminkan kepercayaan pada penilaian diri sendiri dan responsivitas tinggi. Untuk posisi yang butuh ketangkasan, kualitas ini sangat dihargai." },
  { seq: 24, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Saat terdesak, mengikuti hati nurani lebih baik daripada menunggu saran dari orang tua.", expl: "Kemampuan mengambil keputusan otonom di bawah tekanan adalah kualitas krusial. Menunggu saran saat terdesak menunjukkan kurangnya kemampuan keputusan mandiri." },
  { seq: 25, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Berani beda pendapat lebih baik daripada tidak sopan kepada yang lebih tua.", expl: "Keberanian intelektual (beda pendapat) diutamakan atas konformisme sosial. Ini menunjukkan assertiveness dan integritas dalam menyatakan kebenaran." },
  { seq: 26, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Melakukan yang terbaik dalam menjalankan tugas lebih baik daripada enggan mencoba tanpa tahu hasilnya.", expl: "Proaktif memberikan yang terbaik dalam tugas jelas lebih baik daripada hesitasi karena ketidakpastian hasil. Ini mencerminkan etos kerja dan keberanian bertindak." },
  { seq: 27, aspect: "Pengambilan Keputusan", polarity: "unfavorable", statement: "Menunggu teman yang masih mengerjakan tugas untuk makan bersama lebih bijak daripada memberitahu jika akan mendahului makan.", expl: "Keputusan yang bijak adalah berkomunikasi terlebih dahulu (memberitahu), bukan menunggu diam-diam. Komunikasi adalah elemen pengambilan keputusan yang transparan dan menghormati orang lain." },
  { seq: 28, aspect: "Pengambilan Keputusan", polarity: "unfavorable", statement: "Lebih baik mendengarkan saran dari orang lain daripada salah dalam memilih beberapa pilihan karir.", expl: "Terlalu bergantung pada saran orang lain untuk keputusan karir menunjukkan kurangnya kemampuan keputusan mandiri. Pengambil keputusan yang baik mampu menganalisis sendiri." },
  { seq: 29, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Menjadi ahli forensik lebih baik daripada menjadi ahli laboratorium.", expl: "Item ini mengukur kemampuan membuat pilihan yang tegas dan definitif. Sangat setuju menunjukkan seseorang memiliki preferensi yang jelas dan dapat membuat keputusan dengan keyakinan." },
  { seq: 30, aspect: "Pengambilan Keputusan", polarity: "unfavorable", statement: "Mudah dalam menentukan keinginan dalam diri lebih buruk daripada membuat beberapa pilihan.", expl: "Kejelasan keinginan diri adalah kualitas positif dalam pengambilan keputusan, bukan keburukan. Orang yang mudah menentukan keinginannya adalah pengambil keputusan yang efektif." },
  { seq: 31, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Berani mengambil risiko lebih baik dibandingkan menjadi orang yang memiliki banyak pengalaman.", expl: "Keberanian mengambil risiko dalam pengambilan keputusan lebih dihargai daripada hanya bermodal pengalaman tanpa keberanian untuk bergerak maju." },
  { seq: 32, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Mudah bagi saya untuk memilih karir yang sesuai dengan diri.", expl: "Kemudahan dalam memilih karir yang sesuai menunjukkan self-knowledge yang baik dan kemampuan pengambilan keputusan yang kuat berdasarkan pemahaman diri." },
  // [NEW]
  { seq: 33, aspect: "Pengambilan Keputusan", polarity: "favorable",   statement: "Dalam situasi yang memerlukan keputusan segera, saya tidak ragu untuk bertindak meskipun belum mendapat persetujuan semua pihak.", expl: "Keberanian bertindak tanpa menunggu konsensus penuh menunjukkan decisiveness dan inisiatif yang kuat — kualitas yang sangat dibutuhkan dalam situasi kritis dan penuh tekanan waktu." },
  { seq: 34, aspect: "Pengambilan Keputusan", polarity: "unfavorable", statement: "Saya merasa lebih tenang jika semua keputusan penting diambil secara bersama-sama daripada harus memutuskan sendiri.", expl: "Bergantung pada keputusan kolektif menunjukkan kurangnya kemampuan pengambilan keputusan mandiri. Pengambil keputusan yang efektif mampu bertindak otonom saat dibutuhkan." },

  // ── PENYESUAIAN DIRI (35–51) ──
  { seq: 35, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Saya tidak merasa aneh saat berada di lingkungan yang baru.", expl: "Kenyamanan di lingkungan baru adalah indikator adaptabilitas yang tinggi. Kemampuan menyesuaikan diri dengan cepat sangat penting dalam lingkungan kerja yang dinamis." },
  { seq: 36, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Saya berusaha untuk memikirkan baik maupun buruknya perbuatan yang saya lakukan kepada orang lain.", expl: "Memikirkan dampak tindakan terhadap orang lain menunjukkan kesadaran sosial yang tinggi dan kemampuan self-adjustment yang matang." },
  { seq: 37, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Mengawali pembicaraan dengan orang yang baru dikenal lebih membingungkan daripada membahas topik-topik yang tidak dikuasai.", expl: "Orang yang adaptif tidak merasa bingung memulai percakapan dengan orang baru. Pernyataan ini mencerminkan hambatan sosial yang harus ditolak oleh orang dengan penyesuaian diri yang baik." },
  { seq: 38, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Saya tetap bisa tidur nyenyak meskipun berada di lingkungan yang baru.", expl: "Kemampuan tidur nyenyak di lingkungan baru menunjukkan adaptasi fisik dan psikologis yang baik — tidak mudah cemas dengan perubahan lingkungan." },
  { seq: 39, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Saat situasi normal, saya merasa lebih tenteram bila sendirian daripada berada di tengah banyak orang.", expl: "Preferensi menyendiri atas kehidupan bersama orang lain menunjukkan penyesuaian sosial yang rendah. Orang yang adaptif merasa nyaman di tengah keramaian." },
  { seq: 40, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Ketika bertemu dengan orang baru, menunjukkan sikap pura-pura untuk menyenangkan lebih baik daripada bersikap seperlunya namun tidak menyenangkan.", expl: "Menampilkan sikap ramah dan menyenangkan saat bertemu orang baru adalah bagian dari kecerdasan sosial dan kemampuan adaptasi yang penting dalam membangun hubungan baru." },
  { seq: 41, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Khawatir akan konflik, saya lebih suka tinggal sendiri daripada tinggal bersama dengan orang lain.", expl: "Menghindari kehidupan bersama karena takut konflik menunjukkan adaptabilitas sosial yang rendah. Kemampuan hidup bersama dan mengelola konflik adalah bagian dari penyesuaian diri." },
  { seq: 42, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Saya lebih sering mengalami sakit perut karena menghadapi suatu tugas daripada karena salah makan.", expl: "Gejala psikosomatis akibat stres tugas menunjukkan adaptasi stres yang buruk. Orang dengan penyesuaian diri yang baik tidak mudah mengalami gangguan fisik akibat tekanan psikologis." },
  { seq: 43, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Dalam sebuah acara malam akrab, saya akan menyibukkan diri dengan makanan dan hiburan daripada ngobrol dengan tamu-tamu yang lain.", expl: "Menghindari sosialisasi dengan berfokus pada makanan/hiburan menunjukkan penyesuaian sosial yang rendah. Orang yang adaptif aktif berinteraksi dengan orang lain di acara." },
  { seq: 44, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Saya senang beramah tamah dengan orang lain daripada mengisi waktu agar tidak terlibat oleh adanya orang lain.", expl: "Menikmati interaksi sosial daripada menghindarinya adalah tanda penyesuaian diri yang sangat baik. Ini menunjukkan kenyamanan dan keterbukaan dalam lingkungan sosial." },
  { seq: 45, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Dalam acara, saya dapat langsung melibatkan diri daripada mengamati terlebih dahulu sebelum berpartisipasi.", expl: "Kemampuan langsung terlibat tanpa fase observasi yang panjang menunjukkan adaptasi sosial yang cepat, proaktif, dan percaya diri." },
  { seq: 46, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Apabila bertemu dengan orang yang baru, saya bisa cepat akrab.", expl: "Kemampuan membangun rapport dengan cepat adalah indikator adaptabilitas sosial yang sangat baik dan penting dalam lingkungan kerja." },
  { seq: 47, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Bersikap hati-hati lebih baik daripada bersikap santai dalam berhubungan dengan orang lain.", expl: "Kewaspadaan berlebih dalam hubungan sosial menciptakan hambatan yang tidak perlu. Penyesuaian diri yang baik melibatkan keterbukaan dan ketenangan, bukan kewaspadaan berlebih." },
  { seq: 48, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Pengalaman dalam bergaul membuat saya lebih menyibukkan diri pada pekerjaan daripada bertemu orang-orang.", expl: "Menggunakan pengalaman bergaul sebagai justifikasi menghindari orang lain adalah paradoks. Pengalaman bergaul harusnya meningkatkan, bukan mengurangi, keinginan bersosialisasi." },
  { seq: 49, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Lebih memilih berperilaku sebagaimana kebiasaan saya daripada harus mempelajari kebiasaan-kebiasaan di lingkungan baru.", expl: "Menolak belajar norma dan kebiasaan lingkungan baru menunjukkan rigiditas perilaku dan adaptasi yang buruk. Fleksibilitas adalah kunci penyesuaian diri yang efektif." },
  // [NEW]
  { seq: 50, aspect: "Penyesuaian Diri", polarity: "favorable",   statement: "Bergabung dalam komunitas baru terasa menyenangkan bagi saya karena membuka peluang untuk bertemu orang-orang berbeda.", expl: "Antusiasme bergabung dengan komunitas baru mencerminkan adaptabilitas sosial yang tinggi. Orang yang mudah menyesuaikan diri melihat lingkungan baru sebagai peluang, bukan ancaman." },
  { seq: 51, aspect: "Penyesuaian Diri", polarity: "unfavorable", statement: "Saya membutuhkan waktu yang cukup lama untuk merasa nyaman bekerja dengan rekan-rekan yang belum dikenal.", expl: "Lamanya waktu yang dibutuhkan untuk beradaptasi dengan rekan baru menunjukkan penyesuaian diri yang lambat. Orang yang adaptif dapat membangun rapport dengan cepat di lingkungan baru." },

  // ── KEPERCAYAAN DIRI (52–67) ──
  { seq: 52, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Dalam pemilihan pengurus organisasi di sekolah, saya merasa lebih pantas menjadi ketua daripada calon-calon ketua lainnya.", expl: "Keyakinan akan kemampuan memimpin dan kelayakan diri untuk posisi kepemimpinan adalah manifestasi kepercayaan diri yang sehat dan dibutuhkan." },
  { seq: 53, aspect: "Kepercayaan Diri", polarity: "unfavorable", statement: "Saya lebih ingin menjadi seperti orang lain pada umumnya daripada tampil secara berbeda.", expl: "Keinginan untuk menyamakan diri dengan mayoritas daripada tampil berbeda menunjukkan rendahnya kepercayaan diri. Orang percaya diri berani menjadi dirinya sendiri." },
  { seq: 54, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Saat rapat kegiatan sekolah, saya terbiasa berbicara lantang dalam menyampaikan pendapat.", expl: "Berbicara lantang dan berani menyampaikan pendapat dalam forum adalah manifestasi nyata kepercayaan diri yang kuat dan asertivitas yang positif." },
  { seq: 55, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Kelemahan diri saya adalah sumber humor untuk menghibur orang lain.", expl: "Kemampuan menertawakan kelemahan diri sendiri menunjukkan penerimaan diri yang matang — tanda kepercayaan diri yang sehat dan tidak rapuh." },
  { seq: 56, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Melakukan sesuai kata hati lebih baik daripada mengikuti kemauan pada umumnya.", expl: "Mengikuti konviksi diri sendiri daripada konformisme massa mencerminkan kepercayaan diri, autentisitas, dan integritas karakter yang kuat." },
  { seq: 57, aspect: "Kepercayaan Diri", polarity: "unfavorable", statement: "Banyak hal yang sulit dipelajari daripada yang mudah dipelajari.", expl: "Keyakinan bahwa banyak hal sulit dipelajari mencerminkan fixed mindset yang pesimistis. Orang percaya diri melihat pembelajaran sebagai hal yang manageable dan dapat dikuasai." },
  { seq: 58, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Masa depan saya tampak cerah dibandingkan kebanyakan orang.", expl: "Optimisme tentang masa depan diri sendiri adalah indikator kunci kepercayaan diri yang sehat. Pandangan positif terhadap masa depan mendorong motivasi dan ketekunan." },
  { seq: 59, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Dari skala 10, kelemahan saya berada di bawah angka 3.", expl: "Memandang kelemahan diri sebagai minimal menunjukkan keyakinan kuat akan kemampuan diri dan penilaian diri yang positif." },
  { seq: 60, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Mending mengikuti saran orang lain daripada mengikuti pendapat pribadi.", expl: "Dalam konteks hierarki institusional, kemampuan mengikuti saran/arahan atasan tanpa defensif justru mencerminkan kepercayaan diri yang matang — tidak kaku dan tidak mudah terancam." },
  { seq: 61, aspect: "Kepercayaan Diri", polarity: "unfavorable", statement: "Orang yang sombong lebih memuakkan daripada orang yang minder.", expl: "Sangat tidak setuju menunjukkan bahwa orang yang minder dianggap sama bermasalahnya atau lebih buruk dari yang sombong — mencerminkan betapa tinggi mereka menghargai kepercayaan diri." },
  { seq: 62, aspect: "Kepercayaan Diri", polarity: "unfavorable", statement: "Saya lebih suka memotret daripada menjadi model foto.", expl: "Preferensi berada di belakang kamera daripada menjadi pusat perhatian menunjukkan kurangnya kepercayaan diri untuk tampil. Orang percaya diri nyaman menjadi pusat perhatian." },
  { seq: 63, aspect: "Kepercayaan Diri", polarity: "unfavorable", statement: "Saya meyakini bahwa kesuksesan setiap orang tergantung pada keberuntungannya.", expl: "Keyakinan sukses ditentukan keberuntungan (external locus of control) bertentangan dengan kepercayaan diri. Orang percaya diri yakin sukses berasal dari kemampuan dan kerja keras sendiri." },
  { seq: 64, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Saya lebih senang memposting foto selfie (swafoto) daripada foto bersama teman-teman.", expl: "Kenyamanan menampilkan diri sendiri secara mandiri melalui selfie menunjukkan penerimaan diri dan rasa percaya diri dalam mempresentasikan diri kepada publik." },
  { seq: 65, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Menjadi diri sendiri lebih membanggakan dibanding menjadi pribadi yang diinginkan banyak orang.", expl: "Autentisitas diri lebih berharga daripada konformisme sosial — ini adalah ekspresi kepercayaan diri yang paling fundamental: kebanggaan menjadi diri sendiri." },
  { seq: 66, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Mengerjakan tugas dengan cara sendiri lebih memuaskan daripada mengikuti tutorial yang sudah ada.", expl: "Kepuasan menggunakan pendekatan sendiri menunjukkan kepercayaan pada kemampuan dan penilaian diri yang kuat — tidak tergantung pada panduan eksternal." },
  // [NEW]
  { seq: 67, aspect: "Kepercayaan Diri", polarity: "favorable",   statement: "Saya yakin bahwa kelebihan yang saya miliki lebih banyak daripada kekurangan saya.", expl: "Keyakinan bahwa kelebihan melebihi kekurangan mencerminkan self-esteem yang sehat dan penilaian diri yang positif — fondasi kepercayaan diri yang diperlukan untuk tampil optimal." },

  // ── STABILITAS EMOSI (68–84) ──
  { seq: 68, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Menyalahkan diri sendiri lebih baik daripada menyalahkan situasi.", expl: "Tanggung jawab personal (internal attribution) daripada menyalahkan faktor eksternal adalah tanda kematangan emosi dan akuntabilitas diri yang tinggi." },
  { seq: 69, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Lebih baik jadi orang yang biasa menerima kegagalan daripada orang yang mengakui kelalaian.", expl: "Menerima kegagalan sebagai bagian dari hidup (resiliensi) mencerminkan kestabilan emosi yang lebih tinggi — tidak larut dalam penyesalan berlebihan atas kelalaian." },
  { seq: 70, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Saat ide dan pendapat saya dikritik, saya mendengarkan pendapat teman-teman daripada sekedar meyakinkan agar mengikuti ide saya.", expl: "Kemampuan menerima kritik secara terbuka tanpa reaksi defensif adalah indikator kestabilan emosi yang sangat kuat dan kematangan dalam berinteraksi." },
  { seq: 71, aspect: "Stabilitas Emosi", polarity: "unfavorable", statement: "Gagal mengungkapkan perasaan sampai sulit tidur lebih mengganggu daripada gagal mendapatkan undian berhadiah.", expl: "Orang yang stabil secara emosi tidak akan kehilangan tidur hanya karena tidak bisa mengungkapkan perasaan — itu reaksi berlebihan. Keseimbangan emosi tidak bergantung pada ekspresi verbal semata." },
  { seq: 72, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Ketika menghadapi masalah saya lebih mudah berpikir positif dibanding mencari perhatian orang lain.", expl: "Regulasi diri melalui positive thinking daripada mencari validasi/perhatian eksternal menunjukkan kestabilan emosi dan kemandirian psikologis yang tinggi." },
  { seq: 73, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Sabar dalam menunggu antrian lebih baik daripada melakukan hal baru.", expl: "Kesabaran dalam situasi tidak menyenangkan seperti antri adalah bentuk nyata regulasi emosi dan kontrol diri — tanda kestabilan emosi yang baik." },
  { seq: 74, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Mengekspresikan kekecewaan saya dalam bentuk gurauan lebih baik daripada berusaha melupakannya.", expl: "Mengekspresikan emosi negatif secara konstruktif melalui humor jauh lebih sehat daripada represi yang dapat menimbulkan penumpukan emosi negatif." },
  { seq: 75, aspect: "Stabilitas Emosi", polarity: "unfavorable", statement: "Memuji orang yang saya kagumi lebih baik daripada mengalihkan perasaan marah untuk sementara waktu.", expl: "Manajemen kemarahan (mengalihkan/mengelola amarah) lebih penting dari ekspresi kekaguman. Sangat tidak setuju menunjukkan prioritas pada pengelolaan emosi negatif secara aktif." },
  { seq: 76, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Mengalah dan tidak membalas ketika seseorang membuat saya marah lebih terpuji daripada menabung.", expl: "Menahan diri dan tidak membalas ketika marah adalah kematangan emosi tertinggi yang mencerminkan pengendalian diri dan kebijaksanaan emosional." },
  { seq: 77, aspect: "Stabilitas Emosi", polarity: "unfavorable", statement: "Saya lebih suka mengikuti mode-mode baru dibanding menikmati aktivitas yang saya lakukan walaupun sedang kecewa.", expl: "Mengejar tren sebagai pelarian dari kekecewaan adalah coping mechanism yang tidak sehat. Orang yang stabil emosinya tetap menikmati aktivitasnya meski sedang kecewa." },
  { seq: 78, aspect: "Stabilitas Emosi", polarity: "unfavorable", statement: "Marah dengan membanting barang lebih memalukan dibanding memaki orang lain.", expl: "Sangat tidak setuju menunjukkan bahwa memaki orang lain (menyakiti perasaan orang) dianggap lebih memalukan atau sama buruknya — mencerminkan kepedulian terhadap orang lain." },
  { seq: 79, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Bersabar menghadapi orang-orang yang menghambat pekerjaan kelompok lebih terpuji daripada menyelesaikan perselisihan antara orang lain.", expl: "Kesabaran dengan hambatan dalam kerja tim sendiri daripada mencampuri urusan orang lain menunjukkan fokus emosional yang sehat dan penghormatan terhadap batasan diri." },
  { seq: 80, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Menenangkan anggota keluarga saat terjadi peristiwa menyedihkan lebih membanggakan dibanding menjadi pemimpin.", expl: "Empati dan kemampuan menenangkan orang lain saat krisis mencerminkan kecerdasan emosional yang tinggi — mengelola emosi orang lain sekaligus diri sendiri." },
  { seq: 81, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Mengekspresikan amarah tanpa menyakiti lebih baik daripada meninggalkannya tanpa penjelasan.", expl: "Ekspresi amarah yang konstruktif (tanpa menyakiti) jauh lebih baik dari silent treatment yang merusak hubungan dan tidak menyelesaikan masalah." },
  { seq: 82, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Mengungkapkan perasaan suka lebih bijaksana daripada mengagumi dari jauh.", expl: "Proaktif mengungkapkan perasaan menunjukkan keberanian emosional dan kejujuran — tanda kematangan serta stabilitas emosi yang sehat." },
  // [NEW]
  { seq: 83, aspect: "Stabilitas Emosi", polarity: "favorable",   statement: "Ketika mendapatkan kritik di depan umum, saya mampu menanggapinya dengan tenang dan konstruktif.", expl: "Kemampuan merespons kritik publik dengan tenang dan konstruktif adalah indikator kestabilan emosi yang tinggi. Ini menunjukkan regulasi diri yang matang dan profesionalisme." },
  { seq: 84, aspect: "Stabilitas Emosi", polarity: "unfavorable", statement: "Saya mudah merasa tersinggung ketika pendapat saya tidak disetujui orang lain.", expl: "Mudah tersinggung saat pendapat ditolak menunjukkan ketidakstabilan emosi dan ego yang mudah terluka. Orang yang stabil emosinya menerima ketidaksetujuan tanpa reaksi berlebihan." },

  // ── MOTIF BERPRESTASI (85–100) ──
  { seq: 85, aspect: "Motif Berprestasi", polarity: "unfavorable", statement: "Saya merasa jenuh dan berusaha menghindari pelajaran yang tidak saya minati.", expl: "Menghindari materi yang tidak diminati menunjukkan motivasi berprestasi yang rendah. Orang dengan motif berprestasi tinggi tetap menekuni bahkan materi yang kurang menarik." },
  { seq: 86, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Berusaha mencari jalan lain saat mengalami kegagalan lebih baik daripada merencanakan masa depan.", expl: "Resiliensi pasca-kegagalan dengan mencari alternatif baru adalah inti motivasi berprestasi yang tangguh — tidak menyerah dan terus mencari jalan keluar." },
  { seq: 87, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Berhasil memecahkan teka-teki yang sulit lebih membahagiakan dibandingkan mendapatkan hadiah barang yang diinginkan.", expl: "Kepuasan intrinsik dari pencapaian intelektual lebih tinggi dari reward ekstrinsik — ini adalah ciri khas utama motivasi berprestasi yang tinggi (intrinsic motivation)." },
  { seq: 88, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Mendaki gunung lebih menyenangkan dibandingkan berkumpul bersama teman di kafe kekinian.", expl: "Preferensi pada aktivitas menantang yang menghasilkan pencapaian (mendaki) atas aktivitas pasif menunjukkan orientasi pencapaian yang kuat dan keberanian menghadapi tantangan." },
  { seq: 89, aspect: "Motif Berprestasi", polarity: "unfavorable", statement: "Kerja asal-asalan tapi tuntas lebih baik daripada menunda pekerjaan karena ada prioritas lain.", expl: "Kualitas tidak boleh dikorbankan demi semata-mata menyelesaikan. Orang dengan motivasi berprestasi tinggi menjaga standar kualitas dan tidak puas dengan hasil asal-asalan." },
  { seq: 90, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Memiliki tujuan hidup lebih berharga daripada mengakui kelebihan orang lain.", expl: "Memiliki tujuan hidup yang jelas adalah fondasi dari motivasi berprestasi — memberikan arah, energi, dan persistence dalam menghadapi rintangan." },
  { seq: 91, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Orang yang tidak konsisten lebih mengecewakan daripada orang yang pilih kasih.", expl: "Inkonsistensi dianggap lebih merusak dari favoritisme — menunjukkan standar tinggi terhadap kehandalan, konsistensi kinerja, dan ketepatan dalam bertindak." },
  { seq: 92, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Lebih hebat diakui sebagai orang yang tekun daripada sebagai orang yang ramah.", expl: "Dikenal sebagai pekerja keras/tekun lebih bernilai dari popularitas sosial — mencerminkan dominannya orientasi prestasi atas orientasi afiliasi." },
  { seq: 93, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Unggul dari orang lain lebih menyenangkan daripada memiliki banyak teman.", expl: "Kompetisi dan keunggulan lebih memuaskan dari popularitas sosial — ciri khas motivasi berprestasi tinggi yang berorientasi pada pencapaian dan kompetisi." },
  { seq: 94, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Menjadi ahli yang diakui lebih baik daripada menjadi orang yang teratur/sistematis.", expl: "Menjadi expert yang diakui adalah puncak pencapaian dalam bidang keahlian — lebih tinggi nilainya dari sekadar keteraturan prosedural yang mekanis." },
  { seq: 95, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Soal yang menantang lebih asik untuk dikerjakan dibandingkan soal yang membutuhkan ketelitian.", expl: "Preferensi pada tantangan atas pekerjaan rutin menunjukkan orientasi mastery dan dorongan berprestasi yang tinggi." },
  { seq: 96, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Kebanyakan orang berpendapat bahwa saya pribadi yang pekerja keras dibandingkan pribadi yang supel.", expl: "Dikenal sebagai pekerja keras oleh orang lain adalah konfirmasi sosial dari motivasi berprestasi yang nyata dan konsisten — reputasi yang dibangun dari tindakan nyata." },
  { seq: 97, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Ketekunan lebih penting bagi saya daripada keramahan.", expl: "Secara eksplisit memilih ketekunan atas keramahan mencerminkan nilai pencapaian yang sangat dominan dalam sistem nilai pribadi." },
  { seq: 98, aspect: "Motif Berprestasi", polarity: "unfavorable", statement: "Kerja sedikit demi sedikit asalkan selesai lebih baik daripada kerja sampai lembur.", expl: "Menghindari lembur dengan cara kerja santai menunjukkan standar pencapaian yang rendah. Orang dengan motivasi berprestasi tinggi bersedia lembur untuk memenuhi standar kualitas yang tinggi." },
  { seq: 99, aspect: "Motif Berprestasi", polarity: "favorable",   statement: "Saya tidur larut malam untuk mengerjakan tugas-tugas yang belum terselesaikan lebih baik daripada banyak istirahat demi kesehatan namun tugas tertunda dan tidak selesai.", expl: "Mengorbankan waktu tidur untuk menuntaskan tugas adalah ekspresi nyata motivasi berprestasi yang sangat tinggi — mengutamakan penyelesaian tugas di atas kenyamanan pribadi." },
  // [NEW]
  { seq: 100, aspect: "Motif Berprestasi", polarity: "favorable",  statement: "Menyelesaikan suatu proyek dengan kualitas terbaik lebih memuaskan bagi saya daripada sekadar menyelesaikannya tepat waktu.", expl: "Mengutamakan kualitas atas ketepatan waktu semata mencerminkan standar tinggi dan motivasi berprestasi intrinsik yang kuat. Orang dengan motif berprestasi tinggi tidak puas dengan hasil seadanya." },
];

// ──────────────────────────────────────────────────────────────────────────────

function buildPayload(q: Q) {
  const weights = q.polarity === "favorable" ? W_FAV : W_UNFAV;
  return {
    options_payload: {
      statement: q.statement,
      choices: CHOICES,
    },
    scoring_rule: {
      type: "likert",
      polarity: q.polarity,
      aspect: q.aspect,
      weights,
      explanation: q.expl,
    },
  };
}

async function main() {
  console.log("\n=== SEED KEPRIBADIAN V2 ===");
  console.log(`Total soal: ${QUESTIONS.length}\n`);

  let ok = 0;
  let fail = 0;

  for (const q of QUESTIONS) {
    const { options_payload, scoring_rule } = buildPayload(q);
    const { error } = await supabase
      .from("questions")
      .update({ options_payload, scoring_rule })
      .eq("type", "KEPRIBADIAN")
      .eq("sequence_number", q.seq);

    if (error) {
      console.error(`  ✗ seq ${q.seq}: ${error.message}`);
      fail++;
    } else {
      process.stdout.write(`  ✓ seq ${String(q.seq).padStart(3)} | ${q.aspect} | ${q.polarity}\n`);
      ok++;
    }
  }

  console.log(`\n✅ Berhasil: ${ok}  ❌ Gagal: ${fail}`);

  // Ringkasan per aspek
  const byAspect: Record<string, number> = {};
  for (const q of QUESTIONS) {
    byAspect[q.aspect] = (byAspect[q.aspect] ?? 0) + 1;
  }
  console.log("\nDistribusi per aspek:");
  for (const [asp, count] of Object.entries(byAspect)) {
    console.log(`  ${asp.padEnd(25)} : ${count} soal`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
