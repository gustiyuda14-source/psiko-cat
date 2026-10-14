# Pedoman Penyusunan Kecermatan — Simulasi Penuh

Versi 1 · 2026-10-13 · Berlaku untuk paket Kecermatan Simulasi Penuh mulai **paket 11** (kartu 1).

Dasar penyusunan:
- contoh soal Polri `FILE PSIKO POLRI 2026/1_5017529637278843693.pdf`, yang menjadi sumber aturan urutan jawaban;
- contoh CAT "Kecermatan baru" (`KECERMATAN BARU 1.jpg`, `KECERMATAN BARU 2.PNG`), yaitu gambar geometris hitam/abu yang hampir kembar;
- lima aspek latihan yang sudah berjalan di menu Sikap Kerja / Kecermatan;
- riset `docs/riset/reports/Psikometri CAT psikotes daring.md` §Kecermatan.

> **Catatan sumber.** Komposisi campuran 5 jenis adalah rancangan internal. Komposisi ini **bukan** salinan format resmi, karena format resmi Polri tidak dipublikasikan. Tujuannya agar satu sesi simulasi melatih semua jenis stimulus yang mungkin muncul.

---

## 1. Format ujian (tidak berubah)

| Unsur | Ketentuan |
|---|---|
| Kolom | 10 kolom, masing-masing 50 butir, total 500 butir |
| Waktu | 60 detik per kolom, pindah kolom otomatis (`time_limit_seconds` 600) |
| Butir | 4 simbol tampil, peserta memilih huruf A–E dari simbol yang **hilang** |
| Kunci | 5 simbol per kolom (A–E), berganti setiap kolom |
| Skoring | Formula v2 (`lib/scoring/kecermatan.ts`), tidak tergantung isi simbol |

## 2. Lima jenis stimulus

Semua simbol **hitam di atas putih**. **Abu-abu** boleh dipakai sebagai warna ketiga karena contoh resmi juga memakainya. Warna lain dan emoji berwarna **dilarang**.

| Kode | Jenis | Isi | Versi mudah | Versi sulit |
|---|---|---|---|---|
| GAMBAR | Emoji & Gambar (versi siluet) | Ikon siluet hitam Phosphor *fill* (MIT) | 5 benda dari kategori berbeda | 5 benda satu kategori dengan siluet mirip (mis. 5 mobil tampak depan) |
| ANGKA_HURUF | Angka & Huruf | Token teks, digambar sebagai SVG | Token 2 karakter, semua karakter beda (`R4`, `7M`) | Permutasi 3 karakter yang mirip bentuknya (`8B3`, `B83`, `38B`) |
| SPASIAL_DASAR | Spasial Dasar | Bentuk utama hitam + tanda tengah + hiasan pojok | Mudah: 5 tanda tengah berbeda, pojok sama | Menengah: 3 tanda tengah × pojok hitam/putih, sebagian pasangan hanya beda pojok |
| SPASIAL | Spasial | Komposisi geometris hampir kembar | Sedang: setiap pasangan beda tepat 2 detail | HOTS: pasangan beda 1–2 detail kecil |
| SIMBOL | Simbol Hilang | Huruf Yunani (teks SVG) **atau** aksara karangan | Huruf Yunani mirip (λ Λ ψ Ψ χ) | Aksara karangan: 5 varian dari satu glyph dasar, masing-masing beda 1 goresan |

Aturan visual yang berlaku untuk semua jenis:
1. Setiap simbol adalah SVG `viewBox 0 0 100 100` (ikon Phosphor `0 0 256 256`) dengan latar putih, supaya tetap terbaca dalam mode gelap.
2. Teks (angka, huruf, Yunani) juga digambar sebagai SVG, tidak memakai glyph font di halaman. Dengan begitu ukurannya pas di kotak kunci, warnanya pasti hitam, dan token 3 karakter tidak meluber di layar HP.
3. Detail terkecil yang membedakan simbol harus tetap terlihat di ukuran kotak soal pada layar HP. Cek ini lewat lembar review (§7).

## 3. Komposisi 10 kolom

**Aturan paruh seimbang.** Kolom I–V dan VI–X masing-masing memuat **kelima jenis tepat satu kali**, dan beban kesulitan kedua paruh dibuat setara: versi mudah dan sulit tiap jenis dibagi ke dua paruh.

Alasannya: kalau soal sulit ditumpuk di akhir, skor di paruh kedua turun karena desain soal, bukan karena ketahanan peserta. Penurunan semacam itu ikut merusak indikator keajegan dan ketahanan (§6).

Aturan tambahan:
- Dua kolom yang berurutan tidak boleh berjenis sama. Peserta harus berganti "mode melihat" setiap kolom.
- Kolom I adalah pemanasan (versi mudah), supaya peserta tidak gagal hanya karena belum paham tampilan.

**Pengecualian kartu 5 (paket 13).** Paket 13 tidak mengikuti aturan 5 jenis dan paruh seimbang. Kesepuluh kolomnya satu jenis, yaitu Spasial Dasar menengah: salinan apa adanya kolom VI–X paket latihan 509 (kolom I–V) dan 510 (kolom VI–X). Keputusan pemilik 2026-10-14.

### Blueprint paket 11 (Simulasi kartu 1)

| Kolom | Paruh | Jenis | Versi | Isi |
|---|---|---|---|---|
| I | A | GAMBAR | mudah | jangkar, piala, kunci, lampu, mahkota |
| II | A | ANGKA_HURUF | sulit | permutasi `8`, `B`, `3` |
| III | A | SPASIAL_DASAR | menengah | donor 599, kolom 6 |
| IV | A | SIMBOL | Yunani | λ Λ ψ Ψ χ |
| V | A | SPASIAL | HOTS | donor 299, kolom 1 |
| VI | B | GAMBAR | sulit | mobil, taksi, mobil polisi, jip, van (tampak depan/samping)¹ |

¹ Paket 11 sudah terbit dengan ikon mobil polisi. Paket berikutnya tidak boleh memakai ikon atau teks kepolisian (pedoman utama A-7); ganti dengan benda umum, misalnya ambulans atau bus.
| VII | B | ANGKA_HURUF | mudah | R4 7M H9 3T W6 |
| VIII | B | SPASIAL_DASAR | mudah | donor 599, kolom 1 |
| IX | B | SIMBOL | aksara karangan | gaya "campur", 5 varian satu glyph dasar |
| X | B | SPASIAL | sedang | donor 499, kolom 1 |

## 4. Urutan jawaban per kolom (contoh Polri)

Aturan ini dipakai bersama lewat fungsi `makeColumn` di `scripts/generate-kecermatan-simbol.ts`:
1. Jawaban A–E masing-masing muncul **tepat 10 kali** dari 50 butir.
2. Jawaban yang sama berturut-turut **maksimal 2**.
3. Pola selang-seling (ABAB) **maksimal 4**, karena lebih dari itu terlihat berpola.
4. Dua butir yang berurutan tidak boleh identik (urutan 4 simbol yang sama).
5. Urutan 4 simbol yang tampil diacak penuh.

## 5. Anti-bocor dan penomoran

- **Simbol simulasi tidak boleh pernah muncul di bank latihan.** Generator menolak simbol yang ada di bank latihan (paket 3–10, 101–105, 301). Ikon siluet baru wajib berasal dari nama ikon yang belum dipakai.
- Paket Kecermatan simulasi memakai nomor **11, 12, 13, …**. Nomor 10 dipakai kartu 3 (siluet lama) dan 401 dipakai kartu 2 (Spasial Sedang). Kecermatan latihan memakai 3–9, 101–105, 201–206, 301–305, dan 501–510.
- Kolom spasial diambil dari **paket donor** generator spasial yang tidak dipakai latihan. Rumus donor untuk paket simulasi N:
  - HOTS = 310 − N
  - sedang = 510 − N
  - dasar = 610 − N (kolom 1–5 mudah, 6–10 menengah)

  Untuk N = 11 hasilnya 299, 499, 599. Donor ditulis ke folder sementara (`SPASIAL_OUT`). Hanya 5 SVG terpilih yang disalin ke `public/kecermatan-simulasi/p<N>/`.
- **Pengecualian paket 13.** Simbol paket 13 **sama** dengan latihan p509/p510 dan path SVG-nya tetap menunjuk ke `/kecermatan-spasial/p509|p510/`. Sumber dipilih dari paket terakhir carousel Spasial Dasar supaya paling jarang dikerjakan peserta (keputusan pemilik 2026-10-14). Nomor 13 dipakai kartu 5.
- Aksara karangan memakai seed nomor paket simulasi sendiri, sehingga glyph-nya tidak sama dengan 302–305.

## 6. Catatan skoring

- Ke (benar bersih) dan Kt (ketelitian) tidak terpengaruh campuran jenis.
- **Kh (keajegan) memakai CV benar per kolom.** Kolom yang kesulitannya berbeda-beda menaikkan CV untuk semua peserta, jadi nilai Kh paket campuran **tidak setara** dengan Kh paket satu jenis. Bandingkan Kh antar-sesi hanya untuk paket yang sama. Parameter v2 (150 dan 0,5) masih sementara, sesuai `kecermatan-scoring-v2`.
- Kh paket 13 (kartu 5, satu jenis) hanya dibandingkan dengan sesi paket 13.
- Aturan paruh seimbang (§3) menjaga perbandingan paruh 1 dengan paruh 2 tetap bermakna sebagai indikator ketahanan.

## 7. Prosedur penyusunan paket baru

1. Tambah blueprint paket N di `BLUEPRINT` dalam `scripts/generate-kecermatan-simulasi.ts` dengan mengikuti §3. Generator menolak paruh yang tidak memuat kelima jenis.
2. Jalankan `npx tsx scripts/generate-kecermatan-simulasi.ts N`. Hasilnya reproducible: menjalankan ulang menghasilkan file identik.
3. Buat lembar review berisi 5 kunci per kolom dan 2 contoh soal, render dengan headless Chrome, lalu periksa:
   - [ ] tidak ada dua simbol kembar atau beda yang tidak terlihat di ukuran HP;
   - [ ] tidak ada warna selain hitam/putih/abu;
   - [ ] tidak ada elemen yang meluber keluar bentuk atau bingkai;
   - [ ] kedua paruh terasa setara kesulitannya.
4. Tambahkan N ke daftar verifikasi kunci di `lib/kecermatan-symbols.test.ts`, lalu jalankan test, `tsc`, dan `next build --webpack`.
5. Seed **sebelum** config live: `npx tsx scripts/seed-kecermatan-packages.ts N` (dijalankan pemilik DB), lalu cek 500/500 di DB.
6. Pasang `SIMULASI_PAKET[kartu].KECERMATAN = N` di `lib/test-config.ts`. Sesi lama tidak terpengaruh karena paketnya tersimpan di `kecermatan_package_number`.

## 8. Status kartu Simulasi Penuh

| Kartu | Paket Kecermatan | Mengikuti pedoman ini |
|---|---|---|
| 1 | 11 — campuran 5 jenis hitam-putih | Ya |
| 2 | 401 — Spasial Sedang | Belum (satu jenis) |
| 3 | 10 — Siluet gambar | Belum (satu jenis) |
| 4 | 12 — campuran 5 jenis hitam-putih | Ya |
| 5 | 13 — salinan Spasial Dasar menengah p509/p510 kolom VI–X | Pengecualian (keputusan pemilik 2026-10-14; simbol sama dengan latihan) |
