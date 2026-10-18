# Rencana: Analisis Hasil Latihan Kecermatan (tanpa timer)

2026-10-19 · disetujui pemilik ("jalankan ultra plan") · log di `kecermatan-latihan-analisis-LOG.md`

## Tujuan
Layar selesai latihan Kecermatan mode tanpa timer (dan halaman pembahasan tersimpan) menampilkan penilaian lengkap: nilai 60 detik bayangan + profil tanpa batas waktu + analisis adaptasi kunci, dengan bahasa sederhana, hangat, dan analogi gampang.

Keputusan pemilik:
- Nilai bayangan boleh lebih rendah dari ujian. Justru itu pesan untuk peserta: latihan tanpa waktu jangan dianggap remeh.
- Analisis dibuat simpel dan hangat, dengan analogi gampang ("seperti menjelaskan ke anak 5 tahun") di pembahasan.
- Fase menghafal diukur per urutan butir, bukan per menit (menghindari efek plafon 50 butir).

## Celah yang ditutup
1. Mode tanpa timer belum mencatat waktu. → F1 pencatatan.
2. Nilai bayangan TIDAK disimpan ke `latihan_kecermatan_scores` (tren Beranda tetap murni mode timer).
3. Lompat/mundur kolom → kolom yang tidak dikerjakan urut dari butir 1 tidak dihitung di nilai bayangan.
4. Pembahasan tersimpan kehilangan waktu → kolom `latihan_attempts.timing` (jsonb, nullable).
5. Tab disembunyikan → waktu tersembunyi dikurangi (jam aktif).
6. Bantuan pelafalan → status dicatat.
7. Klik acak/spam → gerbang validitas.

## Kontrak data `timing` (v1, disimpan per percobaan)
```
{ v: 1, pel: boolean,               // bantuan pelafalan aktif di akhir sesi
  cols: { [column_index]: { o: number, clean: boolean } },  // o = urutan kunjungan (1..10); clean = dikerjakan urut dari butir 1 tanpa navigasi
  t: { [question_id]: [tKolom, d] } }  // ms aktif sejak kolom mulai; ms aktif sejak butir tampil
```
Jam aktif = `performance.now()` dikurangi waktu tab tersembunyi.

## Keluaran analisis (`lib/kecermatan-analisis.ts`, fungsi murni)
- `bayangan`: statistik per kolom dalam 60 detik pertama (kolom clean saja) → engine v2 `calculateKecermatan` (lewat server). Null bila < 3 kolom sah.
- `penuh`: akurasi, benar per menit aktif, per kolom menurut urutan kunjungan, tren (naik/stabil/turun).
- `adaptasi`: median waktu per posisi butir 1–50 (gabungan semua kolom), titik hafal (posisi perubahan lambat→lancar, dicari otomatis 5..25), persen lebih cepat setelahnya.
- `diagnosis`: pola (impulsif / ragu / seimbang), pasangan simbol yang sering tertukar (+ label pelafalan), koreksi diri (melambat setelah salah).
- `jeda`: jumlah jeda panjang (> max(10 dtk, 5× median)) yang dibuang.
- `valid`: gerbang (≥ 3 kolom, median ≥ 250 ms, bukan pola acak) + alasan.

## Tampilan (dirancang subagent desain, prototipe dulu)
- Utama: Nilai 60 Detik + grafik batang 60 detik + satu kalimat diagnosis hangat.
- Tab "Tanpa Batas Waktu": grafik garis kecepatan per kolom + profil.
- Tab "Analisis": kurva adaptasi (garis titik hafal) + simbol tertukar + saran, tiap angka dengan analogi.
- Label: "Perkiraan latihan, bukan nilai ujian". Tidak masuk Nilai Akhir Psikotest.

## Tahap
- F1 pencatatan + simpan + validasi server + test. Migrasi: `ALTER TABLE latihan_attempts ADD COLUMN IF NOT EXISTS timing jsonb;`
- F2 `lib/kecermatan-analisis.ts` + test.
- F3 UI sesuai prototipe yang disetujui pemilik.
- F4 kalibrasi (≥ 30 sesi): ambang titik hafal, jeda, pola; bandingkan bayangan vs mode timer peserta yang sama.
