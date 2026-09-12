# Rencana perbaikan UI/UX Psiko CAT

Tanggal: 11 September 2026. Status: implementasi lokal selesai bersama agen Astra; verifikasi sesuai cakupan di bawah.

## Keputusan dan batas implementasi

1. Kecermatan terdiri dari **10 kolom**. Samakan istilah pada petunjuk, navigasi, timer, dan pembahasan. Pertahankan cara pengerjaan per butir dalam kolom dan aturan waktu ujian.
2. Latihan kecermatan tanpa animasi, warna, atau pesan benar/salah saat menjawab. Tampilkan jumlah terjawab dan posisi; akurasi serta pembahasan muncul setelah latihan selesai.
3. Urutkan tampilan paket mulai **Paket 1**. ID bank saat ini 3–8 dipertahankan dan dipetakan ke label Paket 1–6 agar tautan/data historis tetap utuh. Tidak menambahkan penguncian paket: itu saran asisten terdahulu, bukan permintaan pengguna.
4. Tampilkan preview simbol asli dari paket yang akan dikerjakan dan highlight pilihan/fokus yang jelas. Jangan mengarang simbol, jumlah soal, atau ketersediaan data.
5. Respons jawaban langsung membawa ke butir berikutnya; transisi stimulus sekitar **140 ms**, hanya opacity/transform, tanpa menunda penyimpanan lokal. Tombol tetap di posisi yang sama. Reduce Motion mematikan transisi.
6. Hero bar dan header halaman lebih futuristik, mempertahankan identitas navy/gold. Variasikan komposisi section card menurut fungsi dan prioritas, tanpa efek berat terus-menerus.
7. Target penggunaan: sentuh Android/iOS/tablet dan mouse/keyboard Windows/macOS. Uji viewport kecil, tablet, desktop, repeat keyboard, perpindahan kolom, dan evaluasi akhir. Emulasi browser tidak sama dengan pengujian perangkat fisik.

## Urutan kerja

- [x] Benahi latihan kecermatan dan konsistensi istilah 10 kolom.
- [x] Terapkan urutan label paket serta preview simbol.
- [x] Astra: perombakan hero/header dan variasi kartu.
- [x] Verifikasi lint/build, cek logika, dan inspeksi visual responsif dengan batas cakupan di bawah.

## Catatan teknis

- Pemeriksaan latihan simbol menggunakan selisih `symbol_map` terhadap `shown`, sesuai kontrak soal dan cara pembahasan yang sudah ada. Skor ujian resmi tetap diproses server.
- Perubahan lokal yang sudah ada sebelum pekerjaan ini dipertahankan. Tidak mengubah database, memublikasikan, atau membuat commit.
- Jeda 500 ms serta tunggu server pada setiap jawaban latihan dihapus. Pergantian kolom latihan juga langsung; pengantar 5 detik antar kolom pada ujian resmi dipertahankan.

## Hasil implementasi

- Hero bersama di `app/components/ui.tsx` menjangkau halaman latihan, simulasi, review, admin, gerbang latihan, ringkasan sesi, dan hasil. Hero beranda serta login memakai bahasa visual yang sama. Header saat ujian aktif tetap ringkas agar timer dan stimulus mudah dibaca.
- Kartu modul latihan memakai komposisi asimetris di desktop, dengan kecermatan sebagai panel utama; menjadi satu kolom pada layar kecil. Paket menampilkan preview simbol kolom pertama dari query bank aktif serta jumlah butir aktual.
- Respons latihan dicatat sekali per butir melalui pengaman sinkron. Keyboard yang ditahan tidak menjawab berulang. Tombol jawaban tidak di-remount bersama animasi stimulus.
- `lib/kecermatan-symbols.ts` menjadi helper bersama latihan dan pembahasan; data simbol tidak valid tidak menghasilkan penilaian yang dikarang.

## Verifikasi yang dilakukan

- `npm run build`: lulus kompilasi, TypeScript, dan generasi halaman. Build memerlukan akses jaringan untuk font yang sudah dipakai proyek. Peringatan migrasi `middleware` ke `proxy` tetap ada.
- `node --import tsx lib/kecermatan-symbols.test.ts`: lulus seluruh 3.000 kunci pada enam bank lokal, semua pilihan A–E, emoji, urutan simbol, dan payload tidak valid.
- ESLint lulus pada 20 file sasaran selain engine ujian kecermatan. `EngineKecermatan.tsx` masih memiliki 7 temuan pada kode yang sudah ada: purity, akses ref saat render, dan setState dalam effect. Bukan klaim bahwa lint seluruh repo bersih.
- `git diff --check`: lulus.
- Chrome: inspeksi screenshot login aktual pada desktop dan ponsel; komponen latihan asli pada 1440 px, 390 px, dan tablet 820 px melalui pratinjau lokal dengan bank p7. Tidak ada overflow horizontal; tombol jawaban pada 390 px berukuran 60 × 56 px. Menu latihan asli juga diperiksa pada desktop dan lebar sempit.
- Interaksi komponen latihan: 500 jawaban selesai; jawaban A menghasilkan 100/500 sesuai bank; butir 50 beralih ke kolom II; navigasi sebelumnya/berikutnya mempertahankan jawaban; reset kembali ke kolom I; keyboard tidak menembus dialog dan repeat diabaikan.
- Pada pemeriksaan satu respons, butir berikutnya hadir pada frame berikutnya (6 ms dalam kondisi uji lokal), durasi CSS 140 ms, node/posisi tombol tetap, dan tidak ada request `/api/practice/check`. Angka ini bukan tolok ukur perangkat fisik.
- Aturan Reduce Motion terpasang dan diperiksa dari stylesheet browser; emulasi preferensi OS belum dilakukan.

## Batas QA / tindak lanjut

- Halaman peserta memerlukan login. Belum dilakukan penelusuran seluruh route peserta dengan akun aktif, verifikasi query preview terhadap database live, atau submit sesi ujian resmi. Pratinjau komponen tidak melewati autentikasi aplikasi dan tidak menulis data server.
- Belum diuji pada perangkat Android, iOS, tablet Windows, atau Mac secara fisik maupun Safari/WebKit. Hasil di atas berasal dari Chrome dan emulasi viewport.
- Screenshot diperiksa langsung di alat browser; penyimpanan screenshot ke workspace ditolak batas path alat, sehingga tidak disertakan berkas PNG.
- Tidak ada dependency baru, perubahan database, deployment, atau commit dari pekerjaan ini.
