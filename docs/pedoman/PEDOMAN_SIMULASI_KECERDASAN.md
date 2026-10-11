# Pedoman Penyusunan Simulasi Penuh — Kecerdasan Paket 2

Versi 1 · 2026-10-11 · Belum ada soal yang disusun · Dasar: Pedoman Rancangan Sistem §2.1, `soal.json` (Simulasi Paket 1), `docs/rencana/drilling/02-kecerdasan-drill-taxonomy.md`, `04-paket2-bitara.md`, dan informasi yang beredar tentang psikotes 2026.

> **Catatan sumber.** Perubahan di §2 berasal dari informasi yang beredar dan **belum dikonfirmasi oleh dokumen resmi**. Kerangka 4 subtes × 25 butir tetap dipertahankan supaya nilai per subtes tetap bisa dilaporkan. Yang berubah adalah isi tiap subtes.

---

## 0. Komponen Simulasi Penuh saat ini (Paket 1)

| Subtes | Durasi | Isi | Sumber di sistem |
|---|---|---|---|
| **Kecerdasan** | 90 menit | 100 butir, 4 subtes (rincian di §1) | `questions` package_number 1 (`SIMULASI_PACKAGE.KECERDASAN`) |
| **Kecermatan** | 10 menit | 10 kolom simbol | Paket diacak per sesi dari bank Kecermatan (`pickRandomKecermatanPackage`) |
| **Kepribadian** | 60 menit | 48 Kepribadian (Likert 4, 6 aspek × 8 butir: Prososial, Pengambilan Keputusan, Penyesuaian Diri, Kepercayaan Diri, Stabilitas Emosi, Motif Berprestasi) + 63 Substansi Khusus (pilihan paksa A/B) | package_number 11 (`SIMULASI_PACKAGE.KEPRIBADIAN`), lihat `PEDOMAN_ENGINE_PRIBADI.md` |

Kecermatan tidak perlu disusun ulang untuk Paket 2 karena paketnya sudah diacak per sesi. Kepribadian Paket 2 mengikuti `PEDOMAN_ENGINE_PRIBADI.md` dan tidak dibahas di dokumen ini.

## 1. Komposisi Kecerdasan Paket 1 (`soal.json`)

| No | Subtes | Tipe | Jml | Format |
|---|---|---|---|---|
| 1–6 | Verbal | Sinonim | 6 | 2 kunci |
| 7–12 | Verbal | Antonim | 6 | 2 kunci |
| 13–19 | Verbal | Analogi | 7 | 2 kunci |
| 20–25 | Verbal | Kata ganjil | 6 | 1 kunci |
| 26–37 | Logis/Spasial | Pola gambar (11) + susun gambar (1) | 12 | 1 kunci |
| 38–50 | Logis/Spasial | Silogisme | 13 | 1 kunci |
| 51–63 | Analitis | Deret angka/huruf | 13 | 2 kunci |
| 64–75 | Analitis | Wacana (penalaran posisi) | 12 | 1 kunci |
| 76–100 | Praktis | Hitung | 25 | 1 kunci |

Yang belum ada di Paket 1: pola bundar berangka, pola bundar dengan huruf, pemahaman bacaan, dan variasi figural selain pola gambar dan susun gambar.

## 2. Penyesuaian per 2026-10-11

1. **Analitis: pola gambar bundar berangka** menjadi tipe wajib. Ada varian angka saja dan varian campuran huruf.
2. **Deret campuran angka–huruf** ditambah.
3. **Wacana logika** tetap menjadi blok terbesar di Analitis.
4. **Semua jenis figural muncul**, minimal 1 butir per jenis (§4.4).
5. **Pemahaman bacaan** masuk ke subtes Verbal (2 wacana × 3 soal).

## 3. Blueprint Paket 2 (100 butir, 90 menit)

### Verbal (1–25)

| No | Tipe | Jml | Format |
|---|---|---|---|
| 1–5 | Sinonim | 5 | 2 kunci |
| 6–10 | Antonim | 5 | 2 kunci |
| 11–15 | Analogi | 5 | 2 kunci |
| 16–19 | Kata ganjil | 4 | 1 kunci |
| 20–25 | **Pemahaman bacaan**: 2 wacana × 3 soal | 6 | 1 kunci |

### Logis / Spasial (26–50)

| No | Tipe | Jml |
|---|---|---|
| 26–28 | Pola deret gambar (strip, langkah ke-n) | 3 |
| 29–32 | Matriks 3×3 | 4 |
| 33–34 | Rotasi / pencerminan | 2 |
| 35–37 | Susun potongan gambar | 3 |
| 38–39 | Analogi gambar (A:B = C:?) | 2 |
| 40 | Ikon kategori (gambar ganjil / sekelompok) | 1 |
| 41–50 | Silogisme | 10 |

Figural = 15 butir (Paket 1: 12). Semuanya 1 kunci.

### Analitis (51–75)

| No | Tipe | Jml | Format |
|---|---|---|---|
| 51–54 | **Pola bundar angka** | 4 | 1 kunci |
| 55–56 | **Pola bundar campuran huruf** | 2 | 1 kunci |
| 57–60 | Deret angka | 4 | 2 kunci |
| 61–64 | **Deret huruf / campuran angka–huruf** | 4 | 2 kunci |
| 65–75 | **Wacana logika**: wacana A (4 soal), B (4), C (3) | 11 | 1 kunci |

### Praktis (76–100)

| No | Tipe | Jml |
|---|---|---|
| 76–83 | Hitung cepat (operasi campuran, urutan operasi) | 8 |
| 84–88 | Pecahan, desimal, persen, akar/pangkat | 5 |
| 89–92 | Konversi satuan | 4 |
| 93–98 | Soal cerita (jarak-waktu, untung-rugi, perbandingan, pekerja) | 6 |
| 99–100 | Perbandingan kuantitatif / kecukupan data | 2 |

## 4. Spesifikasi tipe

### 4.1 Pola bundar angka (51–54)

- **Bentuk:** lingkaran dibagi 4, 6, atau 8 sektor. Ada varian dengan angka di pusat, dan varian dua cincin (dalam dan luar). Satu posisi berisi "?".
- **Aturan.** Pakai satu aturan per butir, dan 4 butir harus memakai 4 aturan yang berbeda:
  - R1 **Berseberangan**: pasangan sektor yang berhadapan punya jumlah, selisih, atau hasil kali yang tetap.
  - R2 **Putaran**: dibaca searah jarum jam, angkanya membentuk deret (+n, ×n, atau bergantian, mis. +2, ×2).
  - R3 **Cincin**: luar = f(dalam), mis. luar = dalam² atau luar = dalam × 3 − 1.
  - R4 **Pusat**: pusat = f(semua sektor), mis. jumlah sektor ÷ 2.
  - R5 **Antar-lingkaran**: 2 lingkaran contoh dengan aturan sama, lingkaran ke-3 berisi "?".
- **Tingkat:** 1 butir mudah (R1 atau R2), 2 sedang, 1 sulit (R3 atau R5 dengan dua langkah).
- **Distraktor wajib** mewakili kesalahan yang nyata:
  - aturan hanya dicek di satu pasangan;
  - arah putaran terbalik;
  - salah satu langkah operasi;
  - menyalin angka yang ada di gambar.

### 4.2 Pola bundar campuran huruf (55–56)

- Huruf dibaca sebagai nilai posisi alfabet: A=1 … Z=26. Instruksi **wajib menyebut** konversi ini.
- Varian:
  - (a) sektor berisi huruf dan angka, dengan angka = nilai huruf pasangannya ± k;
  - (b) huruf melompat secara teratur di sekitar lingkaran (C, F, I, ?).
- Jawaban boleh berupa huruf atau angka, tetapi kelima opsi harus satu jenis.
- **Distraktor:** salah hitung ±1 posisi alfabet, dan lupa kembali ke A setelah Z.

### 4.3 Deret campuran angka–huruf (61–64)

- 2 kunci, sama seperti Paket 1: "pilih dua jawaban untuk melengkapi deret".
- Jenis:
  - huruf saja (lompatan tetap atau bertambah);
  - selang-seling angka–huruf (2, B, 4, D, …);
  - dua jalur (posisi ganjil dan genap punya aturan sendiri).
- Minimal 1 butir dua jalur.

### 4.4 Figural (26–40)

- Ada 6 jenis, masing-masing minimal 1 butir: pola deret, matriks 3×3, rotasi/cermin, susun potongan, analogi gambar, dan ikon kategori.
- Gambar **dibuat dengan generator SVG parametrik** milik sendiri:
  - `scripts/generate-soal-pola-gambar.ts`;
  - temuan di `docs/rencana/drilling/pola-findings.md` dan `susun-findings.md`.
- Gambar dari PDF sumber tidak boleh disalin.
- Setiap butir harus punya tepat 1 jawaban sah. Opsi kembar (rotasi yang sama atau cermin simetris) dilarang.

### 4.5 Wacana logika (65–75)

- Ada 3 wacana:
  - **A** penempatan posisi (berjajar atau melingkar);
  - **B** penjadwalan (hari atau urutan);
  - **C** multi-atribut (nama–asal–pekerjaan) atau penilaian.
- Tiap wacana memuat 5–6 entitas dan 4–6 syarat. Gunakan bentuk "jika … maka …" minimal sekali.
- Syarat harus menghasilkan **solusi tunggal**, dan solusi itu **diverifikasi dengan skrip brute force** sebelum dikunci.
- Jenis pertanyaan dicampur:
  - siapa di posisi X;
  - mana yang PASTI benar;
  - mana yang TIDAK MUNGKIN;
  - bila ada syarat tambahan, maka …

### 4.6 Pemahaman bacaan (20–25)

- 2 wacana **original** (150–250 kata). Tema umum atau pelayanan publik. Teks berita atau artikel pihak ketiga tidak boleh disalin.
- Tiap wacana punya 3 soal dengan jenis berbeda: ide pokok, informasi tersurat, simpulan, makna kata dalam konteks.
- Jawaban harus bisa ditunjuk di teks, atau disimpulkan langsung dari teks.

## 5. Aturan umum

- **Opsi:** 5 opsi (A–E). Butir 2 kunci dinilai semua-atau-tidak: benar hanya bila kedua kunci benar.
- **Sebaran tingkat (revisi 2026-10-11):** 0% mudah, 40% sedang, 60% HOTS. Soal sedang menerapkan satu aturan secara tepat. Soal HOTS menuntut analisis berlapis:
  - verbal: kata baku jarang/serapan, pengecoh paronim atau bermakna dekat, analogi dua lapis;
  - silogisme: kontraposisi, negasi, syarat perlu vs cukup, jebakan sesat pikir;
  - deret: dua lintasan atau aturan bertingkat (selisih prima, selisih bertambah);
  - hitungan: minimal dua langkah dengan jebakan (pergantian hari, barang rusak, sifat distributif);
  - figural: minimal dua sampai tiga aturan sekaligus;
  - bacaan: hubungan antarparagraf, makna kiasan, penerapan pada keadaan baru.
  Butir HOTS jangan ditumpuk di awal subtes.
- **Beban waktu:** rata-rata 54 detik per butir. Wacana logika dan bacaan memakan waktu lebih lama, jadi butir hitung cepat harus benar-benar cepat (≤ 30 detik).
- **Kunci:** butir numerik diberi field `hitung`. Kunci dicek oleh skrip, bukan hanya dengan mata. Posisi kunci A–E tersebar rata, maksimal 24 per huruf.
- **Pembahasan:** wajib per butir. Tulis aturannya, alasan tiap distraktor gugur, dan satu tips.
- **Anti-bocor:**
  - stem tidak boleh sama dengan Paket 1 (`soal.json`) maupun bank latihan; pengecekan memakai pola `scripts/build-drill-bank.ts`;
  - soal simulasi tidak boleh muncul di latihan.
- **Tanpa konten pihak ketiga:** semua teks, gambar, dan wacana dibuat sendiri.

## 6. Teknis masuk sistem

- Rencana `package_number` Kecerdasan Simulasi Paket 2 = **12**. Nomor 2–11 sudah dipakai latihan (`KECERDASAN_PACKAGES`).
- Saat ini `SIMULASI_PACKAGE` masih satu nilai tetap, jadi Paket 2 **belum bisa dipakai** sampai:
  1. sesi tes menyimpan nomor paket simulasi;
  2. semua pembaca `SIMULASI_PACKAGE` mengambil nomor dari sesi: halaman tes kecerdasan/kepribadian, `api/rescue`, `api/sessions/.../answers`, `api/practice/check`, `lib/review.ts`, `lib/scoring/runner.ts`;
  3. kartu Paket 2 di `/dashboard/simulasi` diaktifkan (`ready`).

## 7. Checklist QA sebelum insert

- [ ] Jumlah per blok sesuai §3, total 100.
- [ ] Semua kunci numerik lolos cek `hitung`; semua wacana logika lolos brute force.
- [ ] Butir figural: tepat 1 jawaban sah, SVG terbaca di HP.
- [ ] Tidak ada stem duplikat dengan Paket 1 atau bank latihan.
- [ ] Sebaran kunci A–E dan tingkat kesulitan sesuai §5.
- [ ] Pembahasan lengkap untuk 100 butir.
