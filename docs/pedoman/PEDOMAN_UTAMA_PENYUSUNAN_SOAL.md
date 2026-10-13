# Pedoman Utama Penyusunan Soal — D'Ajiks Akademi Psiko CAT

Versi 1 · 2026-10-13 · DRAF, menunggu persetujuan pemilik

Berlaku untuk semua soal baru di semua modul: Kecerdasan, Kecermatan (Sikap Kerja), Kepribadian beserta Integritas & Kejujuran (dulu Substansi Khusus), Drilling, dan Fundamental. Setiap aturan diberi nomor supaya bisa dirujuk dan dicek, dan diberi asal-usulnya dalam tanda `[…]`.

Lampiran per modul. Isi teknisnya tetap berlaku. Bila ada yang bertentangan dengan dokumen ini, dokumen ini yang menang (lihat §1.1):

| Lampiran | Isi |
|---|---|
| A. `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md` | Blueprint 100 butir, spesifikasi tipe, nomor paket |
| B. `docs/pedoman/PEDOMAN_SIMULASI_KECERMATAN.md` | 5 jenis stimulus, komposisi 10 kolom, urutan jawaban, donor spasial |
| C. `docs/pedoman/PEDOMAN_ENGINE_PRIBADI.md` | Aturan kunci per aspek KP, 11 dimensi SK, templat butir, penilaian |
| D. `bank/drill/BANK_SCHEMA.md` + `bank/drill/LOG.md` | Skema item drill, status kunci, riwayat batch |
| E. `RULES GENERATE SOAL SPASIAL.md` | Standar SVG figural, layer HOTS |
| F. `docs/rencana/drilling/02-kecerdasan-drill-taxonomy.md` | Taksonomi sub_type, tier, target waktu, templat pembahasan per tipe |
| G. Claude Doc "Pedoman Penyusunan Bank Soal Denah & Arah Mata Angin" | K17 (https://claude.ai/code/artifact/ac06221b-2130-4db2-a7e3-e9424a95dd35) |

**Kode asal-usul.** SPCP = pedoman resmi SPCP 2026 hal. 50 · INDUK = Dokumen Pedoman Rancangan Sistem v1.0 (7-10-2026) · TGP = Tanggapan atas Pedoman (8-10-2026) · LmpA–G = lampiran di atas · D00–D06 = `docs/rencana/drilling/0x` · b*n* = batch *n* di LOG.md · PM dd-mm = keputusan pemilik pada tanggal itu (2026).

---

## 1. Prinsip dan sumber

### 1.1 Urutan otoritas
1. Pedoman resmi SPCP 2026, hal. 50.
2. Keputusan pemilik yang tertulis dan bertanggal (di dokumen repo, LOG.md, atau memory proyek).
3. Pedoman induk (INDUK), untuk hal yang belum pernah diputuskan pemilik.
4. Kebiasaan repo (pola di generator, validator, dan batch sebelumnya).

[PM 13-10]

Akibatnya, bobot Nilai Akhir Psikotest 60/20/20 [PM 10-10, LmpC §5.3] dan format Kepribadian 48 KP + 63 SK [LmpC] tetap berlaku, walaupun INDUK menulis 40/40/20 dan 90 Likert.

### 1.2 Penamaan
- **N-1** Nama aspek mengikuti SPCP hal. 50 [SPCP; PM 12-10]:
  - Kecerdasan: Berpikir Praktis, Verbal, Logis, Analitis.
  - Kepribadian: Prososial, Pengambilan Keputusan, Penyesuaian Diri, Kepercayaan Diri, Stabilitas Emosi, Motif Berprestasi.
  - Sikap Kerja: kecepatan, ketelitian, ketahanan (= modul Kecermatan).
  - Integritas & Kejujuran: Integritas, Inovasi, Kepemimpinan, Transparansi, Produktivitas, Profesionalisme, Religiusitas.
- **N-2** Tulis "Nilai Akhir Psikotest" lengkap, jangan disingkat. Nama variabel di kode tidak perlu diganti. [PM 10-10]
- **N-3** Label "Substansi Khusus" di UI dan soal baru diganti "Integritas & Kejujuran". Kode, DB, dan URL tidak berubah. [PM 12-10]

### 1.3 Posisi produk
- **N-4** Platform ini adalah alat latihan/simulasi. Kunci dan rumus nilai adalah aturan platform, bukan kunci resmi Polri. Jangan pernah mengklaim sebaliknya, baik di soal, pembahasan, maupun UI. [TGP §1; LmpC §8]

---

## 2. Asal soal

| Kode | Asal | Perlakuan | Status kunci awal |
|---|---|---|---|
| Adaptasi | Sumber di `FILE PSIKO POLRI 2026/` (B2, B3, A3, KD, R, PR, KC, AK26 …) | Adaptasi ringan | `tunggal` / `hitung` |
| `MB` | Modul Mr Badrun (mentor utama) | Verbatim | `resmi` |
| `baru` | Ditulis sendiri atau dari generator | Original | `tunggal` / `hitung` |

- **A-1 Adaptasi ringan.** Angka, kata, nama, konteks, dan gambar diganti. Struktur, sub-task, dan tingkat kesulitan dipertahankan. Wacana ditulis ulang total dengan tempat/tokoh fiktif. Field `sumber` tetap mencatat asal untuk audit. [D05 §7.1; PM 10-10; LmpD]
- **A-2 Pengecualian MB.** Isi soal tidak diubah dan tidak dicek buta. Yang boleh disesuaikan hanya format (koma desimal, pembahasan sesuai §5) dan posisi opsi (diacak supaya kunci tersebar). Soal numerik MB **tetap** dicek dengan `hitung`, karena cek ini pernah menemukan kunci salah di 10.4. [b10; PM 11-10]
- **A-3 Cacat sumber diperbaiki, bukan disalin.** Kalau sumber punya kunci salah, dua jawaban sah, tidak ada opsi benar, atau stem rusak, soal diperbaiki atau dibuang. Temuannya dicatat di LOG.md. [b1–b12]
- **A-4 Simulasi tidak boleh bocor ke latihan.** Butir Simulasi Paket 1 (`soal.json`) dan butir paket simulasi mana pun tidak boleh dipakai di drill atau latihan. Untuk drill, `build-drill-bank.ts` mengecek otomatis. Untuk simbol Kecermatan simulasi, generator menolak simbol yang ada di bank latihan. [D00 §1.1; LmpA §5; LmpB §5]
- **A-5 Dilarang:**
  - logo/merek/foto asli dan tokoh nyata [D02 §6.4];
  - teks berita atau artikel pihak ketiga, termasuk Katadata dan Republika [D04 §3];
  - butir MMPI dan kunci MMPI [PM 12-10, menu Keswa];
  - nama jalan/bangunan yang meniru bank pesaing (ab.school, Pejuang Kedinasan) [D06 §1.3].
- **A-6 Di luar profil, tidak dibuat:** limit, integral, program linier, tanda fungsi rasional. [b1; b3]
- **A-7 Konteks netral, tanpa unsur kepolisian.** Platform ini adalah psikotes yang *mengikuti sistem* tes Polri, bukan materi *untuk* Polri. Peserta datang dari berbagai seleksi (Polri, IPDN, kedinasan, CPNS). [PM 13-10]
  - **Dilarang** di stem, opsi, wacana, tabel, pembahasan (termasuk "Gambaran nyata" dan analogi "Biar gampang diingat"), gambar soal, dan gambar pembahasan:
    - kata: polisi, Polri, Polres, Polsek, Polda, Bhayangkara, Brimob, Satlantas, Kapolres, bintara, taruna, Akpol, reserse, penyidik;
    - kegiatan/atribut khas kepolisian: patroli, tilang, razia, Operasi Zebra, TKP, olah TKP, HT patroli, seragam/pangkat/lencana/mobil polisi, tulisan "POLRI" pada gambar.
  - **Pakai konteks umum:** sekolah, kampus, asrama, kantor, instansi pemerintah umum (kelurahan, puskesmas, perpustakaan, dinas), pelayanan publik, keluarga, komunitas, olahraga, usaha kecil, transportasi umum.
  - **Masih boleh:** kata "Polri" dalam dokumen internal (pedoman, LOG, nama file sumber), dan kalimat penegasan bahwa kunci platform bukan kunci resmi Polri (N-4).
  - Soal lama yang masih memuat unsur kepolisian dicatat sebagai utang dan dibersihkan bertahap. Soal baru wajib lolos aturan ini.

---

## 3. Anatomi butir

### 3.1 Kecerdasan dan drill (5 opsi)
| Field | Aturan | Asal |
|---|---|---|
| `stem` | Satu pertanyaan jelas. Unicode untuk simbol (−, ×, √, ², ⅓); MathML di `rumus` untuk bentuk bertingkat. | LmpD |
| `opsi` | a–e, tidak ada dua opsi kembar (teks atau gambar). | LmpD |
| `kunci` | Tepat 1 huruf. Format pilih-dua: 2 huruf, dinilai semua-atau-tidak. | LmpD; INDUK §2.1B |
| `tier` | 1 Dasar · 2 Menengah · 3 Lanjut, mengikuti kriteria LmpF §2. | LmpF |
| `sub_type` | Kode taksonomi LmpF, harus milik kartunya. Sub_type baru wajib diberi label di `DRILL_CATEGORIES` (`lib/drill-cards.ts`); tanpa label, soal masuk grup "Lainnya". | LmpD; memory drill-bank 11-10 |
| `hitung` + `nilai_opsi` | Wajib untuk setiap soal numerik. Build mencocokkan hasil `hitung` dengan nilai opsi kunci. | LmpD; LmpA §5 |
| `pembahasan` | Wajib, mengikuti §5. | PM 12-10 |
| `gambar` / `gambar_pembahasan` | Wajib untuk soal figural dan denah, mengikuti §6. | PM 12-10 |
| `status_kunci` | `resmi` / `ganda` / `hitung` / `tunggal` (§8.3). | LmpD |
| `rilis` | Tanggal push batch (`YYYY-MM-DD`). **Wajib untuk butir drill baru**; memicu badge NEW (§3.6). Tidak dipakai untuk butir lama yang hanya diberi gambar atau perbaikan teks. | PM 13-10 |

Untuk paket DB (simulasi/latihan), pembahasan disimpan di `scoring_rule.pembahasan` dan `scoring_rule.pembahasan_svg`, **tidak boleh** di `options_payload` karena field itu terkirim ke browser saat ujian. [memory kecerdasan-pembahasan-teks 12-10]

### 3.2 Integritas & Kejujuran (K15 dan paket SK)
- **B-1** Ada 2 opsi a–b, dan keduanya sama-sama terdengar positif. Kunci mengikuti aturan dimensi D1–D11 [LmpC §3.1].
- **B-2** Butir D4 wajib punya `sub: patuh|inovasi`, kalau tidak validator menolak. [LmpC §3.1a]
- **B-3** Jangan membuat butir baru dari aturan yang kontradiktif di sumber (15, 59, 46, 56). [LmpC §6.2]

### 3.3 Kepribadian (KP)
- **B-4** Likert A–D tanpa pilihan netral. Kunci arah D (favorable) atau A (unfavorable). Ditulis dengan templat T1/T2/T3. [LmpC §6.1]
- **B-5** Uji aturan aspek: reviewer harus bisa menunjuk dalam 5 detik sisi kalimat yang paling mencerminkan aspek bloknya. Kalau tidak bisa, butir ditolak. [LmpC §6.1; PM 10-10]
- **B-6** Per aspek: 4 favorable + 4 unfavorable. Butir PL (perbandingan lemah) dilarang di paket yang dinilai. [LmpC §4.1]

### 3.4 Kecermatan
- **B-7** Satu butir = 4 simbol tampil, peserta memilih huruf A–E dari simbol yang hilang. Satu kolom = 50 butir. Kunci A–E masing-masing tepat 10 kali per kolom, kunci sama berturut-turut maksimal 2, pola selang-seling maksimal 4. [LmpB §1, §4]
- **B-8** Simbol berupa SVG hitam di atas putih; abu-abu boleh sebagai warna ketiga. Emoji berwarna dilarang di simulasi. [LmpB §2]

### 3.5 Fundamental
- **B-9** Soal dibangkitkan dari rumus per sesi (`lib/fundamental.ts`), tanpa bank. Aturan §4 (pengecoh) dan §5 (pembahasan) berlaku untuk keluaran generatornya. Kunci saat ini masih terkirim ke browser; begitu hasil mulai disimpan ke akun, pengecekan wajib pindah ke server. [lib/fundamental.ts; memory fundamental 12-10]

### 3.6 Badge NEW (Drilling)
Drilling akan terus bertambah, jadi butir yang baru dirilis harus mudah ditemukan peserta. [PM 13-10]
- **B-10** Setiap butir drill yang baru di-push diisi `rilis: "YYYY-MM-DD"` (tanggal push). Generator yang membangkitkan butir wajib menyetelnya (contoh: konstanta `RILIS` di `scripts/generate-k05-trik-2.ts`). Validator `build-drill-bank.ts` menolak format selain `YYYY-MM-DD`.
- **B-11** Butir ber-`rilis` memakai badge **NEW** (emas) di tiga tempat: (a) panel besar kartu di katalog (lencana NEW, jumlah soal baru yang belum dikerjakan, dan chip NEW + jumlah di kategori yang memuatnya) beserta irisan roda kartu; (b) panel nomor sesi (pita NEW di ubin nomor, baris legenda "Soal baru, belum dikerjakan"); (c) header soal yang sedang dibuka.
- **B-12** Badge **hilang per butir begitu peserta menjawabnya** (ada di progres akun atau sudah diperiksa di sesi ini), benar atau salah. Badge **tidak kedaluwarsa karena waktu**: peserta yang baru membuka drilling sebulan kemudian tetap melihat NEW pada butir yang belum ia kerjakan. Badge belum tampil sebelum progres akun selesai dimuat, supaya tidak berkedip.
- **B-13** Gambar pembahasan baru atau perbaikan teks pada butir lama **bukan** butir baru: jangan beri `rilis`. Butir lama yang diganti total (stem/opsi/kunci berubah, progresnya ikut reset lewat `drillVersi`) boleh diberi `rilis` baru.
- **B-14** Batch lama tidak diberi `rilis` ulang dan tidak dihapus otomatis. Menonaktifkan sorotan satu batch = hapus field `rilis` batch itu (keputusan pemilik), dicatat di LOG.md. Batch yang masih aktif disebut di LOG.md pada baris "NEW aktif".

---

## 4. Aturan pengecoh

- **D-1** Tepat satu jawaban sah. Kalau dua opsi bisa dipertahankan, perbaiki stem atau opsinya. [LmpD; b3–b5]
- **D-2** Setiap pengecoh mewakili satu kesalahan nyata yang bisa diberi nama, misalnya salah urutan operasi, salah konversi, arah putar terbalik, kiri-kanan tertukar, satu sisi jalan saja, atau aturan hanya dicek di satu pasangan. Nama kesalahan itu muncul di pembahasan. [LmpD; LmpA §4.1; b13]
- **D-3** Kunci tidak boleh bisa ditebak dari bentuk opsi:
  - bukan selalu opsi terpanjang/terpendek/terbesar;
  - tidak ada pola jumlah yang membocorkan kunci (contoh: 2–4 vs 3–3).

  [b9 alokasi waktu: kunci "pilih satu tugas" selalu tugas terpanjang]
- **D-4** Posisi kunci tersebar rata. Per paket/batch, satu huruf maksimal 24% dari butir. Opsi angka diurutkan naik di sekitar kunci. [LmpA §5; b13; b18]
- **D-5** Soal figural: tidak boleh ada dua opsi berimpit setelah diputar atau dicerminkan, dibuktikan dengan cek tanda tangan simetri di generator. Untuk soal rotasi, figur wajib kiral. [LmpA §4.4; b6–7; memory mosaik 12-10]
- **D-6** Pengecoh Kecermatan = simbol yang mirip bentuknya, sesuai tingkat (S1–S3). Selisih terkecil harus tetap terlihat di layar HP. [LmpB §2; D03 §1.1]

---

## 5. Standar pembahasan

Pembahasan wajib selengkap menu drill: **semua opsi ditampilkan**, kunci ditandai hijau, jawaban salah peserta ditandai merah, ada baris status dan teks penjelasan per butir. Tidak ada butir yang boleh tayang tanpa pembahasan. "Pembahasan belum tersedia" hanya cadangan sementara, bukan kondisi akhir. [PM 12-10; memory pembahasan-wajib-lengkap]

### 5.1 Struktur (Kecerdasan, drill, Integritas & Kejujuran)
| Bagian | Isi | Wajib |
|---|---|---|
| Paragraf 1 — Langkah | Aturan atau langkah penyelesaian, bernomor bila lebih dari dua langkah. Soal metode/trik memakai tiga baris: **Cara cepat** / **Kenapa bisa** (aljabar ringan) / **Cara biasa**. | Ya |
| Paragraf 2 — Kenapa yang lain salah | `Opsi X (isi): alasan` untuk **setiap** opsi salah, memakai nama kesalahan dari D-2, lalu `Jawaban: …` dan `Tips: …` (satu strategi cepat, boleh dengan target waktu). | Ya |
| Paragraf 3 — Gambaran nyata | Situasi sehari-hari yang memakai keterampilan ini (memandu tamu ke gedung, membaca denah kampus, menunjukkan arah ke puskesmas). Tidak boleh berupa skenario kepolisian (A-7). | Opsional, hanya untuk tipe yang sudah disetujui (K17) |

[LmpE §3; LmpD; b17 K17 3 paragraf PM 11-10; b18 metode PM 13-10; PM 13-10 "2 inti + 1 opsional"]

- **E-1** Bahasa Indonesia sehari-hari untuk peserta. Hindari jargon seperti "topologi" atau "satelit"; pakai kata yang terlihat di gambar ("atas", "kanan-bawah", "hampir benar"). [memory pembahasan-wajib-lengkap; b13 revisi]
- **E-2** Kunci dihitung ulang saat pembahasan ditulis. Kalau angka di pembahasan berbeda dari `hitung`, butir gagal. [memory pembahasan-wajib-lengkap]
- **E-3** Baris dipisah `\n`, paragraf dipisah `<br>`. [b13 revisi]

### 5.1a Kecukupan Data (drill K16 dan butir 97–100 paket Kecerdasan)
- **E-3a** Format pembahasan khusus mengikuti PDF referensi `FILE PSIKO POLRI 2026/KECUKUPAN DATA/`. Urutannya: Yang sebenarnya ditanya → Cek pernyataan (1) saja → Cek pernyataan (2) saja → Cek gabungan (hanya bila perlu) → Jawaban + kalimat kesimpulan → Biar gampang diingat → Jebakan di soal ini.
- Format ini menggantikan paragraf panjang "Kenapa yang lain salah", karena kelima opsi adalah satu tabel keputusan. Di bagian Jawaban tetap ada satu baris singkat "Opsi X gugur karena …" untuk setiap opsi salah, karena `build-drill-bank.ts` mewajibkannya.
- Penulisan di drill: satu `<br>` tepat sebelum "Jawaban", dan bagian lain dipisah `\n\n`.
- Penulisan di paket DB (field `p`): semua bagian dipisah `\n\n`, karena backfill mengubah `<br>` menjadi satu baris baru biasa.
- Setiap pernyataan yang "tidak cukup" dibuktikan dengan dua nilai sah yang menghasilkan jawaban berbeda.

[PM 13-10; LmpA §4.7]

### 5.2 Kepribadian
- **E-4** Formatnya 5 slot: Aspek → Bedah kalimat (X, Y, kata pembanding, membalik atau tidak) → Sisi yang mencerminkan aspek → Kunci → Catatan psikologi (hanya untuk bendera PS). [LmpC §7.4]
- **E-5** Batas etika: label nilai "Kesesuaian dengan kunci latihan D'AJIKS", tidak ada tampilan "hafalkan kunci", butir KK menampilkan alasan koreksi. Aturan ini menggantikan larangan "jawaban ideal" di D03 §2.1. [LmpC §7–8; PM 10-10]

### 5.3 Kecermatan
- **E-6** Pembahasan per kolom: benar/salah/persentase, lalu daftar soal yang salah (simbol tampil, jawaban peserta, kunci). Tidak ada teks per butir. [KECERMATAN_SEED_PLAN.md keputusan 3]

---

## 6. Gambar soal dan gambar pembahasan

- **G-1** Gambar soal baru dibuat dengan **generator SVG parametrik sendiri** di `scripts/`. Seed tetap, sehingga hasilnya bisa diproduksi ulang. [memory mosaik 12-10; memory kecermatan-spasial 10-10; PM 13-10]
- **G-2** Codex hanya dipakai untuk siluet **benda** (teko, kapal, pesawat) bila generator parametrik tidak memadai. Jangan untuk figur manusia, karena hasilnya dua kali rusak. Briefing Codex wajib menyebut: objek mengisi penuh lebar, tiap potongan punya penanda unik, tiap potongan memotong satu fitur. [memory soal-gambar-quality-bar 11-10]
- **G-3** Dilarang memotong atau menyalin gambar dari PDF sumber untuk soal baru. Soal K13/K14 lama yang dipotong dari PDF dibiarkan. [LmpA §4.4; PM 13-10]
- **G-4** Kualitas setara soal PDF sumber (bangun majemuk, inversi isi, siluet realistis). Templat prosedural sederhana (rumah/bukit/pohon) ditolak. HOTS figural = minimal 3 aturan berjalan bersamaan; tingkat sedang 1–2 aturan. [memory soal-gambar-quality-bar 10-10; LmpE §2; LmpA §5]
- **G-5** **Prototipe disetujui pemilik dulu** (beberapa contoh + screenshot), baru produksi massal. [D06 §1.2; b11; b15; b17; b18]
- **G-6** Soal dan pembahasan dihasilkan **dalam satu generator yang sama**. Setiap soal figural/denah wajib punya gambar pembahasan: `gambar_pembahasan` untuk drill, `pembahasan_svg` untuk paket DB. [PM 12-10]
- **G-7** Gaya yang sudah disetujui:

| Jenis | Gaya | Asal |
|---|---|---|
| Denah (soal) | Hitam-putih seperti soal cetak, mesin `scripts/denah-k17-bw.ts`; mesin grid berwarna tidak dipakai lagi | b15; PM 12-10 |
| Denah (pembahasan) | Peta dipudarkan, acuan biru, jawaban hijau + panah, satu pengecoh "hampir benar" merah putus-putus | b13; PM 11-10 |
| Pembahasan hitung cepat | Hitam-putih, landscape 616×260. Kiri: contoh hitungan. Tengah: langkah bernomor + bar hasil hitam. Kanan: "Kenapa bisa?" (model luas / bersusun / pecahan). Versi berwarna tegak **ditolak**. Referensi `scripts/generate-k05-trik-svg.ts` | memory drill-bank 13-10 |
| Kecermatan | Hitam/putih/abu, `viewBox 0 0 100 100`, teks digambar sebagai SVG | LmpB §2 |
| Figural Kecerdasan | Kelas `.box/.solid/.outline`, transform eksplisit | LmpE §1 |

- **G-8** SVG yang ditempel langsung ke halaman (`pembahasan_svg`) **tidak boleh memakai `id`**, karena bisa bentrok antar-butir. SVG yang disajikan sebagai file atau `<img>` boleh memakai `id`/`<defs>`. [memory soal-pembahasan-gambar-rule; LmpE §1]
- **G-9** Render dicek di lebar tampil asli (±520 px) dan di layar HP lewat headless Chrome dari salinan repo di scratchpad, sebelum gambar dipasang. [PM 13-10; memory local-ui-verification]

---

## 7. Kalibrasi tingkat kesulitan dan waktu

- **K-1** Tier 1/2/3 dan target waktu per tipe mengikuti LmpF §2. Target T berlaku di Tier 2, Tier 1 = 1,25 × T, Tier 3 = T dengan isi yang lebih sulit.
- **K-2** Paket Kecerdasan simulasi/latihan: 0% mudah, 40% sedang, 60% HOTS. Butir HOTS tidak ditumpuk di awal subtes. Rata-rata 54 detik/butir; hitung cepat ≤ 30 detik. Kriteria tier di LmpA §4.1 ("1 butir mudah") kalah oleh aturan ini. [LmpA §5 revisi 11-10]
- **K-3** Drill memakai ketiga tier. Bank minimal 36 butir unik per (sub_type, tier) untuk klaim penguasaan; keluarga tipis cukup 24 tanpa klaim penguasaan. [LmpF §5.3]
- **K-4** Kecermatan: tingkat kemiripan S1–S3 mengikuti D03 §1.1. Paket simulasi memakai paruh seimbang (I–V dan VI–X masing-masing memuat lima jenis, beban kesulitan setara), dan kolom I adalah pemanasan. [LmpB §3]
- **K-5** Waktu KP/SK belum diputuskan (usul 30 dan 20 detik/butir). Jangan dikunci di soal. [LmpC §4]

---

## 8. QA dan status kunci

### 8.1 Cek otomatis
- **Q-1** Kunci numerik dicek oleh field `hitung` lewat build, bukan dengan mata. [LmpD; LmpA §5]
- **Q-2** Wacana logika, kecukupan data, bahasa panda, dan soal posisi dibuktikan tunggal dengan skrip brute force atau solver. Generator gagal bila jawabannya 0 atau ≥ 2. [LmpA §4.5; b5; b9; b12]
- **Q-3** Soal figural: opsi dibuktikan berbeda dengan tanda tangan simetri; kiralitas dicek untuk soal putar. [b6–7]

### 8.2 Cek buta
- **Q-4** Pemeriksa = model atau sesi lain yang **tidak melihat kunci**. Urutannya:
  1. Codex: `codex exec --skip-git-repo-check -s read-only -C <dir> -o <file> "<prompt>" < /dev/null` (tanpa `< /dev/null` perintah ini macet);
  2. subagent Claude terpisah bila Codex kena batas pakai;
  3. Sonnet, untuk paket simulasi Kecerdasan (pilihan pemilik).

  [memory drill-bank 11-10; b6–7; memory kecerdasan-kalibrasi 12-10]
- **Q-5** Bandingkan **alasan** pemeriksa, bukan hanya hurufnya. Codex sering benar alasannya tapi salah tulis huruf, salah baca kiralitas/transform SVG, menghitung satu sisi jalan saja, atau memutar peta ke arah yang salah. Setiap perbedaan dikerjakan ulang dengan bukti (koordinat, daftar per sisi, susun ulang potongan) sebelum kunci diubah. [b2; b6–7; b13; b14; b16]
- **Q-6** Butir yang dinilai ambigu oleh pemeriksa: perjelas stemnya, lalu cek buta ulang dengan pemeriksa baru. [b3; b4; b5; b9]
- **Q-7** Untuk wacana/alokasi: tambahkan reviewer pembahasan yang terpisah dari pemeriksa kunci, karena reviewer inilah yang menangkap kunci yang bisa ditebak. [b9]

### 8.3 Status kunci
| Status | Arti | Ikut rilis |
|---|---|---|
| `resmi` | Kunci dari dokumen sumber atau MB, sudah dicek ulang | Ya |
| `ganda` | Dua pemeriksa independen sepakat | Ya |
| `hitung` | Cocok dengan `hitung`, belum dicek pemeriksa kedua | Tidak (`--draft` saja) |
| `tunggal` | Baru satu pemeriksa | Tidak (`--draft` saja) |

[LmpD] Paket DB (simulasi/latihan) tidak punya field status. Paket baru masuk DB hanya setelah cek buta 100% sepakat atau setiap perbedaan sudah diselesaikan dan dicatat. [memory kecerdasan-kalibrasi 12-10]

### 8.4 Pencatatan
- **Q-8** Setiap batch dicatat di `bank/drill/LOG.md`: sumber, sebaran, temuan sumber, hasil cek buta (x/y), perbaikan. Nomor batch harus unik (saat ini ada dua "Batch 9", perlu dirapikan). [LmpD]
- **Q-9** Paket DB: catat rencana dan hasil QA di `docs/rencana/`. [LmpA §6]
- **Q-10** Setelah rilis, analisis pengecoh dipantau di `/admin/pengecoh` (pengecoh mati < 5%, pengecoh mengalahkan kunci, terlalu mudah > 90%, terlalu sulit < 20%; minimal 30 respons). Mengedit butir mereset statistiknya. [memory analisis-pengecoh 12-10]

---

## 9. Alur kerja sesi penyusunan

1. **Baca** dokumen ini dan lampiran modul terkait. Tidak menyusun soal sebelum pemilik memberi perintah. [memory soal-gambar-quality-bar 10-10]
2. **Claude sebagai orchestrator.** Pekerjaan besar dipecah ke subagent/Codex per bagian, dengan satu BRIEF bersama. Codex tidak bisa commit atau akses jaringan; Claude yang mengaudit diff-nya. [b9; memory codex-parallel-task-split]
3. **Generator** di `scripts/`, maksimal 500 baris per file; pecah file bila mendekati batas. Butir lama harus tetap identik byte, dan status `ganda` hanya dipertahankan bila stem/opsi/kunci identik. [D06 §0; b14]
4. **Prototipe → persetujuan pemilik → produksi** (G-5).
5. **Validasi**: drill pakai `npm run build:drill`; paket DB pakai validator seed (`seed-kecerdasan-kal.ts` tanpa `--apply`, `check-bank-pribadi.ts`, test kunci Kecermatan). Lalu `npx tsc --noEmit` dan `npx next build --webpack` (Turbopack tidak jalan di Mac ini).
6. **Cek visual** di localhost oleh pemilik untuk setiap perubahan yang terlihat. Screenshot dari salinan repo di scratchpad; jangan menjalankan `next dev` kedua di repo. [memory local-ui-verification]
7. **Tulis ke DB produksi** dilakukan pemilik (Claude memberi perintah `--apply` yang persis), lalu cakupan pembahasan dicek harus 100/100. Untuk Kecermatan, seed dilakukan **sebelum** config live. [memory pembahasan-wajib-lengkap; LmpB §7]
8. **Commit hanya path milik sendiri.** Sesi lain sering paralel, jadi cek `git status` dulu. Rebase ke `origin/main`, lalu `git push origin HEAD:main`. [D06 §1.6; memory git-push-workflow]

---

## 10. Checklist QA (satu halaman, sebelum soal masuk sistem)

**Asal dan isi**
- [ ] Asal tercatat (`sumber`); adaptasi ringan atau `baru`; MB verbatim
- [ ] Tidak ada butir simulasi di latihan/drill, tidak ada stem duplikat
- [ ] Tanpa logo/merek/foto asli, teks pihak ketiga, butir MMPI
- [ ] Tanpa unsur kepolisian di soal, pembahasan, dan gambar (A-7). Cek dengan grep: `polisi|polri|polres|polsek|polda|bhayangkara|brimob|bintara|taruna|akpol|patroli|tilang|razia|TKP`
- [ ] Nama aspek sesuai SPCP; "Nilai Akhir Psikotest" tidak disingkat

**Butir**
- [ ] Field lengkap sesuai §3; sub_type punya label kategori
- [ ] Tepat satu jawaban sah; opsi tidak kembar (termasuk simetri gambar)
- [ ] Setiap pengecoh = satu kesalahan bernama; kunci tidak bisa ditebak dari bentuk opsi
- [ ] Sebaran kunci ≤ 24% per huruf (Kecermatan: 10 per huruf per kolom)
- [ ] Sebaran tier/HOTS sesuai §7

**Pembahasan**
- [ ] Ada untuk 100% butir; struktur §5 (Langkah / Kenapa yang lain salah + Jawaban + Tips)
- [ ] Angka di pembahasan sama dengan `hitung`
- [ ] Soal figural/denah punya gambar pembahasan; `pembahasan_svg` tanpa `id`

**Gambar**
- [ ] Dari generator sendiri; prototipe sudah disetujui
- [ ] Render dicek di ±520 px dan di layar HP; tidak ada elemen meluber; warna sesuai gaya G-7

**Kunci dan rilis**
- [ ] `hitung` / brute force lolos
- [ ] Cek buta selesai, setiap perbedaan diselesaikan dengan bukti
- [ ] Status `resmi`/`ganda` (drill), atau QA 100% sepakat (paket DB)
- [ ] LOG.md / dokumen rencana diperbarui
- [ ] `build:drill` / validator, `tsc`, dan `next build --webpack` lolos
- [ ] Pemilik sudah cek di localhost; commit hanya path sendiri

- [ ] Butir drill baru: `rilis` terisi (badge NEW, §3.6); butir lama yang hanya diberi gambar/teks tidak ber-`rilis`
---

## 11. Celah yang belum diatur (butuh keputusan nanti)

1. Waktu per butir KP/SK (K-5).
2. Target tier Kecermatan di D03 §1.3 masih memakai rumus v1. Formula v2 (11-10) belum diterjemahkan ke target tier.
3. Belum ada cek kemiripan (8-gram) antar-paket latihan DB; yang ada hanya cek drill vs `soal.json`.
4. Fundamental: kunci masih di browser (B-9).
5. Kecermatan kartu 2 (401) dan kartu 3 (10) belum mengikuti LmpB (satu jenis per paket).
