# LOG — Latihan Kecerdasan Paket 5 (package_number 6)

Rencana: `docs/rencana/kecerdasan-latihan-paket-5.md`. Entri terbaru di bawah.

## Sesi 1 · 2026-10-17 — bagian teks Claude SELESAI; Codex C1/C2 dijalankan pemilik

Keputusan pemilik: K-1 = split 3 Poin Maksimal (88–90) + 2 Alokasi Waktu (91–92).

### Selesai (Claude)
- `prisma/data/kecerdasan_p6_teks.json` (baru, 44 butir): verbal 1–25, silogisme 43–50 (SIL_V3), wacana 65–72 (`p6wLARI` 4 + `p6wDESA` 4), Sebab-Akibat 73–75 (`p6sba73..75`). Tingkat 17 sedang / 27 HOTS. Kunci sementara A13 B14 C14 D9 E9 (huruf ganda dihitung dua), jadi kunci gambar/Codex sebaiknya condong ke D/E.
  - Bacaan: `p6a` kebun hidroponik atap balai kelurahan, `p6b` setoran minyak jelantah jadi sabun.
  - Wacana: LARI = urutan finis 6 pelari, solusi tunggal (65 C, 66 E, 67 B tanpa syarat 3, 68 D "kecuali" tanpa syarat 5). DESA = 5 relawan × hari × desa, 4 susunan sah pola POSKO (69 B, 70 D pasti, 71 A mungkin, 72 E memastikan).
  - SBA: 73 A (rantai sepeda putus → terlambat), 74 B (tomat layu ← tidak disiram saat libur kemarau), 75 E (cuci motor berhenti + antre air tangki ← air leding berhenti, tersirat waktu/tempat sama).
  - A-7: "karang taruna" di bacaan diganti "kelompok pemuda" (kata "taruna" kena grep A-7).
- `scripts/cek-wacana-p6.ts` (baru): brute force 65–72, tiap syarat perlu, kunci cocok → lolos.
- `scripts/seed-kecerdasan-kal.ts`: `V3`/`V4` += 6; anti-bocor pkg 6 juga ke p19/p20; komentar header.
- `scripts/backfill-pembahasan-kecerdasan.ts`: `kecerdasan_p6_teks.json` ditambahkan ke `TEKS_FILES`.
- Validasi: `checkTeks` + `checkNoLeak` (p2–p5, s2, p15, p16, p19, p20, kck_kal, drill) + `checkA7` lolos; `npx tsc --noEmit -p .` bersih.
- Sumber penyusun (bukan repo): `<SP>/p6_verbal.py`, `<SP>/p6_logika.py`, `<SP>/build_p6.py` → menulis ulang `kecerdasan_p6_teks.json` (44 butir). `<SP>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/923853af-7c90-41a0-b0c6-53a335895321/scratchpad`. Setelah digabung di Sesi 3, JSON di repo jadi sumber utama (jangan bangun ulang dari skrip ini).

### Codex (dijalankan pemilik)
- C1: saat entri ini ditulis, `kecerdasan_alokasi.json` sudah punya kunci `"6"` dan `cek-alokasi.ts` berubah — belum diaudit (tunggu laporan selesai).
- C2: `kecerdasan_p6_angka.codex.json` belum ada.

### Belum
- Audit C1/C2 (baca diff penuh, jalankan `cek-alokasi.ts`, hitung ulang `h`), gabung ke `kecerdasan_p6_teks.json` (+ salin 88–92 dari `kecerdasan_alokasi.json["6"]` dengan wacana `p6alok88..92`, pola p20).
- Sesi 2: gambar 26–42 + render bundar 51–56 dari data C2.
- `--check 6` baru bisa lolos setelah semua blok ada.

### File disentuh sesi 1
`prisma/data/kecerdasan_p6_teks.json` (baru) · `scripts/cek-wacana-p6.ts` (baru) · `scripts/seed-kecerdasan-kal.ts` · `scripts/backfill-pembahasan-kecerdasan.ts` · `docs/rencana/kecerdasan-latihan-paket-5.md` · LOG ini.

### Audit Codex C2 (sesi 1, akhir) — ISI LOLOS, belum digabung
`prisma/data/kecerdasan_p6_angka.codex.json`, 34 butir (51–64, 76–87, 93–100).
- HIT/CRT 16 butir: `checkTeks` hitung ulang `h` 16/16 cocok, satu opsi benar per butir. Anti-bocor (p2–p5, s2, p15, p16, p19, p20, kck_kal, drill) + A-7 bersih.
- DER 57–64: `h` dievaluasi = kunci; aturan dicek manual (57 beda +2, 58 dua deret selang-seling, 59 ×3+4, 60 ×2/−5, 61 +5 putar alfabet, 62 huruf +3/+4/+5 & angka −4, 63 huruf +4 & angka ×3, 64 huruf +2/+3/+4…). Semua benar.
- BUN 51–56 (data `bundar` untuk dirender, BUKAN baris teks): 51 hasil kali sektor berhadapan 108 → 9 · 52 +3/×2 → 45 · 53 2·dalam²+1 → 99 · 54 pusat = hasil kali pasangan − pasangan lain → 26 · 55 huruf+6 = angka → 23 · 56 huruf +3/+4/+5/+6/+7 putar → K. Semua benar.
- KCK 97–100 (kunci B, D, E, C; tingkat 2,3,3,3): `h` IIFE brute force = kunci. Ada `model`/`bukti`.

**Perlu dikerjakan saat penggabungan (Sesi 2 awal):**
1. `h` pada DER berupa array/huruf → buang saat digabung (pola p5: DER tanpa `h`; `checkTeks` hanya angka tunggal).
2. HIT/CRT 76–87, 93–96 + DER 57–64 → gabung ke `kecerdasan_p6_teks.json`.
3. KCK 97–100 → pindah ke `kecerdasan_kck_kal.json["6"]` (seed v3 menggabung KCK dari file itu), buang `h`/`model`; tambah `MODEL["6"]` di `check-kecerdasan-kck.ts` (pola paket 4/5; cek panjang file < 500), daftar `V3["6"] = "BDEC"`; tingkat v3 latihan diharapkan [2,2,3,3] → ubah 98 jadi d2 atau sesuaikan aturan; svg tabel lewat `generate-kecerdasan-kck-kal.ts`.
4. BUN 51–56 → render lewat `figural-kal-bundar.ts` (pkg 6), data dari field `bundar`.
5. Audit C1 (`cek-alokasi.ts` diff + `kecerdasan_alokasi.json["6"]`) belum dilakukan; lalu salin 88–92 ke p6_teks (wacana `p6alok88..92`, pola p20).
6. Setelah gabung, hapus `kecerdasan_p6_angka.codex.json` (bukan bagian commit).

### Prompt sesi 2
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 5 (package_number 6) di psiko-cat. Baca docs/rencana/kecerdasan-latihan-paket-5.md dan entri terakhir docs/rencana/kecerdasan-latihan-paket-5-LOG.md, lalu PEDOMAN_UTAMA §6 (G-1..G-10).
LANGKAH PERTAMA: kerjakan daftar "Perlu dikerjakan saat penggabungan" di entri audit C2 (gabung C2, KCK ke kck_kal["6"] + MODEL["6"], audit C1 lalu salin 88–92), jalankan --check 6 sejauh bisa.
Lalu Sesi 2 (gambar): figural-kal-6.ts (28–32, 35–37), mosaik 26–27 gaya G-10 baru (beda dari pkg 4/5/20), susun benda nyata 33–34, denah PKGS += 6 (38–42), render bundar 51–56 dari data Codex C2 bila sudah ada. Kunci gambar condong D/E (teks sekarang A13 B14 C14 D9 E9). Lihat PNG 360/520 px sendiri. Bila Codex C1/C2 sudah selesai, audit dan gabungkan dulu.
Aturan: tidak menulis DB, tidak commit sebelum aku bilang "commit dan push", tanpa kata kepolisian (A-7), berhenti ±120k token dan tulis LOG + prompt sesi 3.
```

## Sesi 2 · 2026-10-17 — penggabungan C1/C2 SELESAI + bundar 51–56; gambar 26–42 BELUM

### Selesai
- **Audit C1** (`cek-alokasi.ts` +88 baris tanya `poin`, `kecerdasan_alokasi.json["6"]`): diff dibaca penuh; `cek-alokasi.ts` SEMUA LOLOS (pkg 6/15/19/20 + drill). Kunci 88C 89A 90E 91B 92D, tingkat 2,3,3,2… (88 d2, 92 d2). Butir poin menaruh seluruh teks di `q` (`w: ""`); latihan merender `question_text` dengan `whitespace-pre-line`, jadi aman.
- **Gabung ke `kecerdasan_p6_teks.json`** (77 butir): C2 HIT/CRT 76–87, 93–96 + DER 57–64 (`h` DER dibuang, pola p5) + alokasi 88–92 disalin apa adanya (wacana `p6alok91`, `p6alok92`).
- **KCK 97–100 → `kecerdasan_kck_kal.json["6"]`**: `h`/`model` dibuang; pembahasan ditulis ulang ke format E-3a (judul bagian, tanpa `<br>`, satu baris "Opsi X gugur karena …", tanpa "Langkah —"/"Tips:"); 98 diubah ke d2 (pola latihan [2,2,3,3]); svg tabel lewat `generate-kecerdasan-kck-kal.ts` (diff hanya menambah). `MODEL["6"]` + `V3["6"] = "BDEC"` di `check-kecerdasan-kck.ts` (359 baris) → lolos.
  - **Temuan C2 diperbaiki:** KCK 97 kontradiktif — p = 18 dan p×q = 572 − 312 = 260 tidak punya q bulat (gabungan kosong). Total diganti **582** (Melati 270 = 18 × 15); q, pembahasan, bukti, model disesuaikan.
- **Bundar 51–56**: `scripts/figural-kal-bundar-6.ts` (baru, data & aturan C2 diaudit ulang, pembahasan ditulis ulang 2 paragraf + Tips + "Jawaban: x.") → `kecerdasan_figural_kal.json["6"]`: 51B2 52D2 53C3 54A3 55E2 56B3. PNG 520/360 dilihat: rapi.
  - **Jebakan:** `pie()` di `figural-lib.ts` memakai penghitung id panah global → urutan import menggeser id pkg 19/20 (sempat berubah). Import bundar-6 dipindah ke paling akhir (diberi komentar); sekarang semua paket lama byte-identik dengan HEAD, diff hanya menambah `"6"`. **Generator pkg 6 berikutnya juga harus diimpor paling akhir.**
- `kecerdasan_p6_angka.codex.json` dipindah keluar repo (scratchpad sesi ini) — isinya sudah tergabung semua.
- Validasi: checkTeks (16 numerik) + checkNoLeak + A-7 atas teks+KCK lolos · `check-kecerdasan-kck.ts` · `cek-alokasi.ts` · `cek-wacana-p6.ts` · `npx tsc --noEmit -p .` bersih.

### Sisa untuk 100 butir (17 butir gambar, semuanya Claude)
- Posisi saat ini (83 butir: teks 77 + bundar 6): **d2 = 34, d3 = 49** → gambar 26–42 harus **6 sedang + 11 HOTS** (40/60).
- Kunci saat ini A22 B23 C24 D18 E19 (123 huruf, batas D-4 = 29). Rencana kunci 17 gambar: **D6 E5 A2 B2 C2** → A24 B25 C26 D24 E24.
- `--check 6` belum bisa lolos sampai 26–42 ada (figural_kal["6"] 26–32/35–37, susun_kal["6"] 33–34, denah_kal["6"] 38–42).

### File disentuh sesi 2
`prisma/data/kecerdasan_p6_teks.json` · `prisma/data/kecerdasan_kck_kal.json` · `prisma/data/kecerdasan_figural_kal.json` · `output/figural-kal-preview.html` (hasil generator) · `scripts/check-kecerdasan-kck.ts` · `scripts/figural-kal-bundar-6.ts` (baru) · `scripts/generate-kecerdasan-figural-kal.ts` · LOG ini. C1 (`cek-alokasi.ts`, `kecerdasan_alokasi.json`) diterima tanpa diubah.

### Prompt sesi 3
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 5 (package_number 6) di psiko-cat. Baca docs/rencana/kecerdasan-latihan-paket-5.md dan entri "Sesi 2" di docs/rencana/kecerdasan-latihan-paket-5-LOG.md, lalu PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md §6 (G-1..G-10) dan §10.
Teks, alokasi, KCK, bundar sudah tergabung (83/100). Kerjakan gambar 26–42 (17 butir; 6 sedang + 11 HOTS; kunci D6 E5 A2 B2 C2):
- figural-kal-6.ts: 28–32, 35–37 (pola figural-kal-5.ts, gridS/analogyS + pembahasan_svg tanpa id, aturan beda dari pkg 3/4/5/15/16/19/20);
- mosaik 26–27 gaya G-10 baru (kombinasi topeng × bingkai × celah beda dari pkg 4/5/20; pola figural-mosaik-20.ts dengan bukti prove);
- susun benda nyata 33–34 (pola susun-benda-45.ts / generate-kecerdasan-susun-kal.ts);
- denah 38–42 PKGS += 6 (2 ARAH + 2 RUTE + 1 ROTASI, generate-kecerdasan-denah-kal.ts).
Import generator pkg 6 di generate-kecerdasan-figural-kal.ts PALING AKHIR (penghitung id global pie()); setelah regenerasi pastikan paket lama byte-identik dengan HEAD (diff hanya menambah "6").
Lihat PNG 360/520 px sendiri. Lalu jalankan npx tsx scripts/seed-kecerdasan-kal.ts --check 6 (dan --check 4/5/20 tetap lolos), check-kecerdasan-kck.ts, cek-alokasi.ts, cek-wacana-p6.ts, tsc. Setelah itu siapkan prompt Codex C3 (cek buta).
Aturan: tidak menulis DB, tidak commit sebelum aku bilang "commit dan push", tanpa kata kepolisian (A-7), berhenti ±120k token dan tulis LOG + prompt sesi berikutnya.
```

## Sesi 3 · 2026-10-17 — gambar 26–42 SELESAI (100/100); cek buta C3 BELUM

### Selesai
- **Figural 28–32, 35–37** — `scripts/figural-kal-6.ts` (baru, pola pkg 5, gridS/analogyS + `pembahasan_svg` tanpa id). Aturan baru:
  28 (sedang) kolom 1 membungkus kolom 2 · 29 titik pindah dalam → sudut ↻ + lingkaran hitam bila ganjil · 30 panah kolom 2 = perintah (geser + hadap + warna) ·
  31 (sedang) cermin diagonal kiri bawah–kanan atas · 32 cermin mendatar → putar 45° ↻ → hanya bangun kecil balik warna ·
  35 setengah bangun + bayangan cermin hitam → putar 90° ↻ · 36 garis komplemen + warna titik sudut geser ↻ + pusat balik · 37 (sedang) titik di kiri arah panah kecuali satu.
- **Mosaik 26–27** — `scripts/figural-mosaik-6.ts` (baru), dibuktikan `prove` (diekspor dari `figural-mosaik-20.ts`, keluaran pkg 20 tetap).
  26: kolom kiri turun/kanan naik siklis, yang tembus tepi ↻90°, kolom tengah bercermin; "?" di gambar (2). Gaya **topeng baru `tiket`** (sudut cekung, ditambah di `figural-mosaik.ts`) × bingkai tipis × celah 0,07 × panah kecil.
  27: baris tengah geser kanan, yang tembus tepi balik warna, baris atas ↻ / bawah ↺; 6 gambar, "?" di (6). Gaya topeng `bulat` × panel abu × celah 0,1, tanpa panah. Kedua kombinasi belum pernah dipakai.
- **Susun 33–34** — `scripts/susun-benda-6.ts` (baru): truk molen (5 potong, sedang) dan kereta gantung (grid 2×3, HOTS); `generate-kecerdasan-susun-kal.ts` + blok `"6"` (pola blok 19/20).
- **Denah 38–42** — `PKGS`/`PB`/`NEW` += 6. **Temuan A-7:** mesin K17 sempat memasang "Kantor Polisi" di peta A pkg 6 → ditambah `A7 = new Set([6])` (peta berisi polisi dilewati + assert); paket lama tidak dibentuk ulang. Catatan: data live pkg 15 (38–42) dan 16 (42) memuat "Kantor Polisi" — **putusan pemilik 2026-10-17: dibiarkan** (jangan diangkat lagi).
- Import pkg 6 di `generate-kecerdasan-figural-kal.ts` paling akhir. Semua paket lama di figural/susun/denah JSON **identik dengan HEAD**; diff hanya menambah `"6"`.
- PNG 520/360 px dilihat sendiri (26–42); diperbaiki: ubin seperempat diganti lolipop (ambigu di topeng bulat), titik 29 diperbesar, layang-layang 30 diganti tetes, teks 32/35 disesuaikan gambar, isi potongan kereta gantung diratakan.
- Kunci gambar 26–42: 26D 27E 28E 29D 30A 31D 32B 33D 34E 35E 36C 37D 38D 39E 40C 41A 42B (= D6 E5 A2 B2 C2). Tingkat 6 sedang / 11 HOTS.

### Validasi (semua lolos)
`seed-kecerdasan-kal.ts --check 6` → 100 soal, kunci A24 B25 C26 D24 E24 · `--check 4/5/20` tetap OK · `check-kecerdasan-kck.ts` · `cek-alokasi.ts` · `cek-wacana-p6.ts` · `npx tsc --noEmit -p .` bersih · grep A-7 atas figural/susun/denah pkg 6 bersih.

### Belum
- **G-5: DISETUJUI pemilik 2026-10-17** (gaya mosaik `tiket` × tipis, `bulat` × panel; adegan truk molen + kereta gantung). Sisa: tambahkan baris gaya pkg 6 ke tabel G-7 pedoman.
- Cek buta Codex C3 (prompt di bawah) → perbaiki temuan.
- `npx next build --webpack`, lalu paket perintah pemilik (rencana §3 Sesi 3) setelah "commit dan push".

### File disentuh sesi 3
Baru: `scripts/figural-kal-6.ts` · `scripts/figural-mosaik-6.ts` · `scripts/susun-benda-6.ts`. Ubah: `scripts/generate-kecerdasan-figural-kal.ts` · `scripts/figural-mosaik.ts` (topeng `tiket`) · `scripts/figural-mosaik-20.ts` (ekspor `prove`/`Gen`/`cellsDiff`) · `scripts/generate-kecerdasan-susun-kal.ts` · `scripts/generate-kecerdasan-denah-kal.ts` · `prisma/data/kecerdasan_{figural,susun,denah}_kal.json` · `output/{figural,susun,denah}-kal-preview.html` · LOG ini.

### Prompt Codex C3 (cek buta, salin apa adanya)
```
Repo psiko-cat. Read-only. Kerjakan soal Latihan Kecerdasan package_number 6 dari:
- prisma/data/kecerdasan_p6_teks.json (nomor 1–25, 43–50, 57–100 kecuali 97–100; wacana di field "wacana"),
- prisma/data/kecerdasan_kck_kal.json["6"] (97–100),
- prisma/data/kecerdasan_sba.json["6"] (73–75).
Jawab setiap soal TANPA melihat field k/kunci/correct_key/h/p/pembahasan/bukti/model dulu (tutup field itu saat menjawab). Setelah semua dijawab, baru bandingkan dengan kunci.
Tulis docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md: tabel nomor | jawabanmu | kunci | cocok? | catatan (ambigu, dua jawaban benar, pengecoh lemah, salah ketik, angka pembahasan ≠ soal, unsur kepolisian). Akhiri dengan daftar nomor yang perlu diperbaiki.
Jangan ubah file lain, jangan commit.
```

### Prompt sesi 4
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 5 (package_number 6) di psiko-cat. Baca entri "Sesi 3" di docs/rencana/kecerdasan-latihan-paket-5-LOG.md.
Semua 100 butir sudah ada dan --check 6 lolos. Kerjakan:
1. Baca docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md (hasil Codex C3) bila sudah ada; selesaikan setiap perbedaan dengan bukti, perbaiki data/pembahasan seperlunya.
2. Terapkan putusan pemilik soal gaya mosaik 26–27 dan adegan susun 33–34 (G-5); bila disetujui, tambah baris gaya pkg 6 di tabel G-7 PEDOMAN_UTAMA.
3. QA akhir: --check 6 (dan 4/5/15/19/20), check-kecerdasan-kck.ts, cek-alokasi.ts, cek-wacana-p6.ts, tsc, grep A-7, git diff JSON kal hanya menambah "6", npx next build --webpack.
4. Siapkan paket perintah pemilik (commit path sendiri → seed --apply 6 → backfill pembahasan dry run lalu --apply → cakupan 100/100).
Aturan: tidak menulis DB, tidak commit sebelum aku bilang "commit dan push", tanpa kata kepolisian (A-7), berhenti ±120k token dan tulis LOG.
```

## Sesi 4 · 2026-10-17 — QA akhir LOLOS; cek buta C3 BELUM ADA

### Selesai
- **Cek buta C3:** `docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md` belum ada → langkah 1 belum bisa dikerjakan. **Koreksi prompt C3:** SBA 73–75 ada di `kecerdasan_p6_teks.json` (bukan `kecerdasan_sba.json["6"]`, kunci itu tidak ada); baris ketiga prompt C3 dihapus saja saat disalin.
- **G-7:** dua baris baru di tabel PEDOMAN_UTAMA — "Mosaik pkg 6" (`tiket` × tipis × celah 0,07 × panah; `bulat` × panel abu × celah 0,1) dan "Susun benda pkg 6" (truk molen, kereta gantung).

### QA akhir (semua lolos)
- `seed-kecerdasan-kal.ts --check 6` → 100 soal, kunci A24 B25 C26 D24 E24 · `--check 4/5/15/19/20` OK.
- `check-kecerdasan-kck.ts` (32 butir) · `cek-alokasi.ts` · `cek-wacana-p6.ts` · `npx tsc --noEmit -p .` exit 0.
- Grep A-7 atas seluruh data pkg 6 (p6_teks, figural/susun/denah/kck kal, alokasi) bersih.
- JSON `figural_kal`, `susun_kal`, `denah_kal`, `kck_kal`, `alokasi` dibanding HEAD per kunci: hanya menambah `"6"`, tidak ada kunci lama berubah/hilang.
- `npx next build --webpack` exit 0 (peringatan workspace root lama, bukan dari perubahan ini).

### Paket perintah pemilik (jalankan setelah C3 beres dan "commit dan push")
```
# 1. commit path sendiri saja
git add docs/rencana/kecerdasan-latihan-paket-5.md docs/rencana/kecerdasan-latihan-paket-5-LOG.md \
  docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md \
  docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md \
  prisma/data/kecerdasan_p6_teks.json prisma/data/kecerdasan_alokasi.json \
  prisma/data/kecerdasan_figural_kal.json prisma/data/kecerdasan_susun_kal.json \
  prisma/data/kecerdasan_denah_kal.json prisma/data/kecerdasan_kck_kal.json \
  output/figural-kal-preview.html output/susun-kal-preview.html output/denah-kal-preview.html \
  scripts/seed-kecerdasan-kal.ts scripts/backfill-pembahasan-kecerdasan.ts scripts/cek-alokasi.ts \
  scripts/check-kecerdasan-kck.ts scripts/cek-wacana-p6.ts \
  scripts/figural-kal-6.ts scripts/figural-kal-bundar-6.ts scripts/figural-mosaik-6.ts \
  scripts/figural-mosaik.ts scripts/figural-mosaik-20.ts scripts/susun-benda-6.ts \
  scripts/generate-kecerdasan-figural-kal.ts scripts/generate-kecerdasan-susun-kal.ts \
  scripts/generate-kecerdasan-denah-kal.ts
git commit -m "feat(kecerdasan): latihan Paket 5 (pkg 6) — 100 butir pedoman v3"
git push
# 2. tulis DB
npx tsx scripts/seed-kecerdasan-kal.ts --check 6
npx tsx scripts/seed-kecerdasan-kal.ts --apply 6
# 3. pembahasan
npx tsx scripts/backfill-pembahasan-kecerdasan.ts          # dry run, lihat cakupan
npx tsx scripts/backfill-pembahasan-kecerdasan.ts --apply
npx tsx scripts/backfill-pembahasan-kecerdasan.ts          # pkg 6 harus 100/100
# 4. cek kartu Paket 5 terbuka di Latihan / Mini Tryout (localhost)
```
Jangan ikut di-commit: `.claude/`, `app/dashboard/kraepelin/1.pdf`, `output/*prototype*.html`, `output/pribadi-sim*-review.html` (bukan pekerjaan paket ini).

### File disentuh sesi 4
`docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md` (G-7) · LOG ini.

### Prompt sesi 5 (setelah C3 selesai)
```
Lanjutkan Latihan Kecerdasan Paket 5 (package_number 6) di psiko-cat. Baca entri "Sesi 4" di docs/rencana/kecerdasan-latihan-paket-5-LOG.md.
Baca docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md; selesaikan tiap perbedaan dengan bukti (Q-5), perbaiki data/pembahasan seperlunya, lalu ulang QA sesi 4. Bila ada perubahan data, jalankan ulang generator terkait dan pastikan JSON kal tetap hanya menambah "6".
Aturan: tidak menulis DB, tidak commit sebelum aku bilang "commit dan push", tanpa kata kepolisian (A-7).
```

## Sesi 5 · 2026-10-17 — cek buta oleh Claude (pengganti C3), QA ulang LOLOS

### Selesai
- **Cek buta:** atas putusan pemilik, Claude mengerjakannya sendiri, tanpa Codex. 77 butir teks (1–25, 43–50, 57–100) dijawab dari salinan tanpa k/h/p/bukti/d, lalu dibandingkan dengan kunci: **77/77 cocok**. Hasil di `docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md`. Catatan: `data.kesalahan` 88–90 ikut terbaca (tidak di-seed ke DB); 88–90 tetap dihitung mandiri.
- **Perbaikan Q-5:** #17, pembahasan opsi B (Sungai) ditambah alasan delta lebih menyimpang (beda jenis benda, bukan sekadar air mengalir atau menggenang). #6 (Pelit) sudah disanggah di pembahasan, tidak diubah. 13/14/60/62: kunci ditulis menurut urutan opsi, sesuai konvensi.
- Data yang diubah hanya `kecerdasan_p6_teks.json` (sumber, bukan keluaran generator), jadi generator tidak dijalankan ulang.

### QA ulang (semua lolos)
`--check 6` (kunci A24 B25 C26 D24 E24) · `--check 4/5/15/19/20` · `check-kecerdasan-kck.ts` · `cek-alokasi.ts` · `cek-wacana-p6.ts` · `tsc` exit 0 · grep A-7 pkg 6 bersih · JSON figural/susun/denah/kck/alokasi vs HEAD: hanya menambah `"6"` · `npx next build --webpack` exit 0.

### DB (dijalankan pemilik 2026-10-17)
- `seed --apply 6` + backfill `--apply` sudah dijalankan pemilik. Dry run backfill (dibaca Claude): **pkg 6: 100/100 butir punya pembahasan**, 0 baris perlu diperbarui.

### Belum
- Commit dan push (daftar `git add` di Sesi 4, plus file cekbuta) menunggu kata "commit dan push"; DB sudah lebih dulu terisi.
- Cek kartu Paket 5 di Latihan / Mini Tryout (localhost).

### File disentuh sesi 5
`prisma/data/kecerdasan_p6_teks.json` (#17) · `docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md` (baru) · LOG ini.
