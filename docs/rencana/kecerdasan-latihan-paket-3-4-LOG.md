# LOG — Latihan Kecerdasan Paket 3 & 4 (pkg 4 & 5)

Rencana: `kecerdasan-latihan-paket-3-4.md`. Entri terbaru di paling bawah.

## Sesi 0 — 2026-10-13 (perencanaan)
**Selesai:**
- Ultra plan ditulis.
- Pedoman utama diperbarui dengan A-7 (tanpa unsur kepolisian).
- Pedoman Kecerdasan v3 sudah berlaku: kecukupan data 4 butir di 97–100, silogisme §4.8.

**File berubah (belum commit):**
- `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md`
- `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md`
- `docs/pedoman/PEDOMAN_ENGINE_PRIBADI.md`
- `docs/pedoman/PEDOMAN_SIMULASI_KECERMATAN.md`
- `docs/rencana/kecerdasan-latihan-paket-3-4.md`
- `docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md`

**Codex:** belum ada job.

**Keputusan pemilik:**
- Soal lama yang masih memuat unsur kepolisian dibiarkan.
- Kerja dibagi dengan Codex.
- Setiap sesi berhenti di ±120k token.

**Langkah berikut:** Sesi 1 sesuai rencana §5.

### Prompt lanjutan
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md
(terutama A-7 tanpa unsur kepolisian, §5, §10) dan docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md v3.
Kerjakan Sesi 1:
1. Perubahan kode rencana §4.1–4.6 (layout v3 di seed-kecerdasan-kal.ts untuk pkg 4/5,
   INSTRUKSI.SIL_V3, cek A-7 otomatis, anti-bocor, backfill). Paket lama harus tetap lolos validasi.
2. Tulis brief Codex-1 (52 butir numerik pkg 4 & 5) dan Codex-2 (4 objek susun), lalu jalankan
   keduanya di background dengan codex exec -s workspace-write.
3. Sambil menunggu: susun verbal + bacaan pkg 4 (25 butir) beserta pembahasan, lolos checkTeks.
Aturan: split dengan Codex; berhenti di ±120k token di titik aman, tulis entri LOG Sesi 1 +
prompt lanjutan Sesi 2; tidak menulis DB; commit hanya setelah aku bilang "commit dan push".
```

## Sesi 1 — 2026-10-13 (berhenti di ±166k, melewati batas 120k)
**Selesai:**
- Kode rencana §4.1–4.6:
  - `checkLayout` + `LAYOUT_V3` dipindah ke `kecerdasan-teks-lib.ts` dan dipakai bersama `seed-kecerdasan-kck.ts` dan `seed-kecerdasan-kal.ts`;
  - `INSTRUKSI.SIL_V3`, dengan `teksRows(teks, v3)`;
  - `teksRows` membawa `svg` (tabel KCK);
  - `checkNoLeak` bisa membaca `kecerdasan_kck_kal.json`;
  - `checkA7` (kata utuh, tanpa "Gegana") hanya untuk pkg 4/5;
  - `checkRows`/`checkLayout` diberi parameter `max`; pkg 4/5 memakai 24% dari total huruf kunci (±29);
  - flag baru `seed-kecerdasan-kal.ts --check N`;
  - backfill membaca `kecerdasan_p4/p5_teks.json` bila ada.
  - Paket lama 13/14/2/3/15/16 + kck 3/14/15/16/17/18 tetap lolos, backfill 0 baris berubah, `tsc` bersih.
  - `--check 4` masih gagal di 40/60. Itu wajar karena paketnya belum lengkap.
- Verbal + bacaan pkg 4 (25 butir, 10 sedang / 15 HOTS) di `prisma/data/kecerdasan_p4_teks.json`. Lolos `checkTeks`, anti-bocor, dan A-7. Wacana `p4a` (bank sampah sekolah, 159 kata) dan `p4b` (antrean puskesmas, 164 kata). ANT 7 diganti Akut/Kronis karena drill sudah punya DIVERGEN >< Konvergen.
- Keputusan pemilik:
  - (1) numerik 58 butir, bukan 52;
  - (2) batas kunci 24% dari total huruf kunci; rencana §2/§3/§7 dan pedoman Kecerdasan §5 + checklist §7 sudah diperbaiki;
  - (3) A-7 hanya pkg 4/5, tanpa "Gegana", cocok kata utuh.

**File berubah (belum commit):**
- `scripts/kecerdasan-teks-lib.ts`, `scripts/seed-kecerdasan-kal.ts`, `scripts/seed-kecerdasan-kck.ts`, `scripts/backfill-pembahasan-kecerdasan.ts`
- `scripts/generate-kecerdasan-susun-kal.ts` + `prisma/data/kecerdasan_susun_kal.json` (Codex-2)
- `prisma/data/kecerdasan_p4_teks.json` (baru)
- `prisma/data/kecerdasan_p4_num.json`, `kecerdasan_p5_num.json` (baru, Codex-1, akan digabung lalu dihapus)
- `docs/rencana/kecerdasan-latihan-paket-3-4.md`, `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md`, file LOG ini

**Codex:**
- **Codex-2 (susun) SELESAI**, sudah diaudit.
  - pkg 4: 33 bus bertingkat (5 potong, t2, B), 34 pesawat baling-baling (6, t3, D).
  - pkg 5: 33 lokomotif uap + gerbong batu bara (5, t2, A), 34 kapal feri (6, t3, C).
  - Paket lama identik byte (diff hanya menambah `"4"`/`"5"`). Kondisi pembahasan diubah menjadi `p.pkg !== 13`.
  - Render headless Chrome di 600 dan 344 px: tiap potongan punya penanda unik dan sambungan jelas. Catatan: sayap pesawat tampak seperti sirip tegak, dan bus tidak terlihat bertingkat. Prototipe **belum disetujui pemilik (G-5)**. Preview: `output/susun-kal-preview.html`.
- **Codex-1 (numerik) SELESAI** setelah LOG ini ditulis. Codex hanya menulis dua file outputnya (dicek dengan `git status`), dan pemeriksa tetap `SEMUA LOLOS`. Codex sendiri menilai p4 #59 (deret ÷2) paling lemah. Audit penuh diserahkan ke Sesi 2.
  - Kedua file sudah ada dan lolos pemeriksa (`SEMUA LOLOS`, 21 kunci numerik per paket dihitung ulang).
  - Codex sempat mengubah "dua pengecoh deret" setelah audit awal Claude.
  - Brief: `<scratchpad>/codex/codex-1-numerik.md`. Laporan akhir: `<scratchpad>/codex/out-1.md`. Log: `<scratchpad>/codex/log-1.txt`. Pemeriksa: `<scratchpad>/codex/cek-num.ts` (jalankan dengan `npx tsx <path>` dari root repo).
  - `<scratchpad>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/8a63573e-fef9-42e2-9c3f-0c8d9475f559/scratchpad`. Path `/tmp` bisa hilang setelah restart; kalau hilang, pemeriksaannya tetap tercakup oleh `seed-kecerdasan-kal.ts --check` setelah file digabung.
  - Audit awal Claude (versi sebelum perubahan terakhir Codex): 8 deret p4 dihitung manual dan benar; sampel pembahasan p4 (64, 87, 94) baik. **p5 belum diaudit sama sekali.**
  - Catatan teknis: di sandbox Codex, `npx tsx` gagal (`listen EPERM`); pakai `node --import tsx`.

**Temuan / keputusan tertunda:**
- Pembagian tingkat per blok (dipakai untuk kedua paket, total 40 sedang / 60 HOTS):

  | Blok | Sedang / HOTS |
  |---|---|
  | Verbal 25 | 10/15 |
  | Figural + denah 17 | 7/10 (susun sudah 1 t2 + 1 t3) |
  | Silogisme 8 | 3/5 |
  | Bundar 6 | 2/4 |
  | Deret 8 | 3/5 |
  | Wacana 11 | 4/7 |
  | Numerik 21 | 9/12 |
  | KCK 4 | 2/2 |

- Prototipe susun pkg 4/5 menunggu persetujuan pemilik (G-5).
- **Pemilik (13-10): soal susun terlalu mudah ditebak** (contoh pkg 13 mobil patroli/kapal selam, pkg 3 helikopter). Penyebabnya: potongan berupa strip vertikal sama lebar, ujung depan dan belakang langsung terlihat, dan ada ciri mencolok (tulisan, periskop, baling-baling). Generator susun dirombak di Sesi 2 (poin 5 prompt). Pkg 4/5 versi Codex-2 putaran 1 memakai pola yang sama, jadi ikut diganti.

**Langkah berikut:**
1. Audit penuh hasil Codex-1 (job sudah selesai, laporan ada di `out-1.md`): 58 butir: hitung manual semua deret p4 dan p5, baca semua pembahasan (D-2), cek konteks soal cerita.
2. Gabungkan `*_num.json` ke `kecerdasan_p4_teks.json` / `kecerdasan_p5_teks.json` dengan skrip kecil, urut per `s`, lalu hapus `*_num.json` (§4.3).
3. Susun verbal + bacaan pkg 5 (25 butir), silogisme 8 + wacana 11 (brute force) untuk pkg 4 dan 5, dan KCK 4 per paket (format §4.7, kunci 4 huruf beda, ada C/E).
4. Sesi 3: gambar (figural-kal 4/5, mosaik, bundar, denah) sesuai rencana §5.

### Prompt lanjutan
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir (Sesi 1) di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md
(A-7, §4 D-1..D-4, §5, §10) dan docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md v3 (§4.5–4.8).
Kerjakan Sesi 2:
1. Codex-1 (numerik 58 butir): pastikan job selesai, lalu audit penuh prisma/data/kecerdasan_p4_num.json
   dan kecerdasan_p5_num.json: hitung manual semua deret, baca semua pembahasan, jalankan pemeriksa
   (path di LOG). Gabungkan ke kecerdasan_p4_teks.json / kecerdasan_p5_teks.json, lalu hapus *_num.json.
2. Verbal + bacaan pkg 5 (25 butir, 10 sedang / 15 HOTS), tanpa mengulang kata kunci pkg 4 dan paket lama.
3. Silogisme 8 (sebaran §4.8, instruksi SIL_V3 otomatis) + wacana logika 11 (A4/B4/C3, bukti brute force)
   untuk pkg 4 dan 5; KCK 4 butir per paket (format §4.7, 4 kunci beda, ada C/E, field bukti).
   Pakai pembagian tingkat per blok di LOG Sesi 1.
4. Validasi dengan checkTeks/anti-bocor/A-7 dan cek-wacana-kal.ts / check-kecerdasan-kck.ts.
   seed-kecerdasan-kal.ts --check 4 baru akan lolos setelah gambar selesai (Sesi 3).
5. Rombak soal susun potongan (33–34) karena terlalu mudah ditebak. Penyebabnya: strip vertikal
   sama lebar, ujung depan/belakang langsung terlihat, ciri mencolok seperti tulisan/periskop/baling-baling.
   Tulis brief Codex-2 putaran 2 untuk scripts/susun-lib.ts + generate-kecerdasan-susun-kal.ts:
   potongan tidak sama lebar dan bukan hanya strip (grid 2×3, garis potong miring/zigzag); ujung
   objek tidak boleh langsung menunjukkan arah; ciri pembeda tersebar, bukan satu ciri mencolok per
   potongan; pengecoh = urutan yang sambungannya hampir pas; tanpa tulisan POLISI/POLRI (A-7).
   HOTS = minimal 3 aturan (G-4). Output lama pkg 3/13/15/16 tetap identik byte.
   Mulai dari prototipe pkg 4/5, screenshot 600 px + 360 px, lalu minta persetujuanku (G-5)
   sebelum produksi. Paket lama (3, 13, 15, 16) baru diganti setelah aku setuju; perintah DB
   kujalankan sendiri.
Aturan: split dengan Codex; berhenti di ±120k token di titik aman, lalu tulis entri LOG + prompt
lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push".
```

## Sesi 2 — 2026-10-13 (berhenti di ±115k)
**Selesai:**
- **Audit Codex-1 (58 butir numerik)**: 16 deret p4/p5 dihitung manual, semua benar (termasuk p4 #64 dua jalur dengan 54 ganda, p5 #60 ×n lalu −3). Semua pembahasan dibaca. Diperbaiki 4 butir:
  - p4 #94: pengecoh 7,5 salah hitung (10 × 8 ÷ 12 ≠ 7,5) → "empat pekerja dianggap bergabung: 120 ÷ 16";
  - p4 #95: catatan teknis "2 + 10/60 jam" dihapus;
  - p5 #82: penjelasan 2.397 dirapikan;
  - p5 #84: opsi 0,816 salah (0,36 × 0,6 + 1,2 = 1,416) → opsi diganti 1,416.
  - Pemeriksa `cek-num.ts` tetap `SEMUA LOLOS`. Digabung ke `kecerdasan_p4_teks.json` / `kecerdasan_p5_teks.json`; `*_num.json` sudah dihapus.
- **Verbal + bacaan pkg 5** (25 butir, 10 sedang / 15 HOTS). Kata kunci dicek otomatis terhadap semua bank (p2/p3/s2/p15/p16/p4, soal.json, drill). Wacana `p5a` (perpustakaan desa, rak beroda, 159 kata) dan `p5b` (jam masuk sekolah digeser, 156 kata). Diganti selama validasi: ANA #15 dua kali (stem "Kata : Kalimat" dan "Bait : Puisi" sudah ada di bank / Simulasi Paket 1) → "Gerbong : Kereta"; "karang taruna" kena cek A-7 (kata "taruna") → "remaja desa … relawan".
- **Silogisme 43–50 pkg 4 dan 5** (16 butir, 3 sedang / 5 HOTS per paket), sebaran §4.8: kategorikal 3 (1 negatif), MP + MT, rantai 1 (pkg 4: kontraposisi rantai; pkg 5: 3 premis), jebakan "tidak dapat disimpulkan" 1 (contoh tandingan di pembahasan), sesat pikir di opsi 1 ("hanya jika" = syarat perlu). Pengecoh berbentuk kondisional yang konsekuennya sudah fakta (jadi benar secara material) sengaja dibuang (D-1).
- Status teks: pkg 4 dan 5 masing-masing **62 butir** (verbal 25, silogisme 8, deret 8, numerik 21), lolos `checkTeks` + anti-bocor + A-7. Kunci pkg 4 A18 B17 C17 D18 E15; pkg 5 A17 B18 C16 D17 E17. Tingkat masing-masing 25 sedang / 37 HOTS.
- Belum: wacana logika 65–75 (2 × 11), KCK (Codex-4), gambar (Sesi 3+).

**File berubah (belum commit):**
- `prisma/data/kecerdasan_p4_teks.json`, `kecerdasan_p5_teks.json` (baru, belum di-git)
- `prisma/data/kecerdasan_p4_num.json`, `kecerdasan_p5_num.json` **dihapus**
- File LOG ini
- Sedang ditulis Codex (lihat bawah): `scripts/susun-lib.ts`, `scripts/generate-kecerdasan-susun-kal.ts`, `prisma/data/kecerdasan_susun_kal.json`, `prisma/data/kecerdasan_kck_kal.json`, `scripts/check-kecerdasan-kck.ts`, mungkin `scripts/generate-kecerdasan-kck-kal.ts` / `scripts/susun-kal-objek.ts`

**Codex (masih berjalan saat LOG ditulis):**
- `<SP>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/6a9969cb-3696-4dce-bbba-6000e2900930/scratchpad`
- **Codex-2 putaran 2 (susun) — SELESAI setelah LOG ditulis, belum diaudit Claude.** Cek cepat: pkg 3/13/15/16 identik (`JSON.stringify`), `kecerdasan_s2_susun.json` identik byte, `susun-lib.ts` 131 baris, generator 362 baris. Objek versi Codex: pkg 4/33 rangka jembatan baja (5, B), 4/34 rak panel mesin (grid 2×3, D), 5/33 saluran ventilasi berusuk (5, A), 5/34 rangka konveyor (grid, C). Codex sendiri menilai isi baris grid masih membantu eliminasi dan detail soal 5 potongan kecil. **Risiko yang harus dicek di audit:** objek rangka/panel/saluran bisa jatuh ke "templat prosedural" yang ditolak G-4; bandingkan dengan siluet realistis sebelum minta persetujuan. Brief `<SP>/codex/codex-2b-susun.md`, laporan `<SP>/codex/out-2b.md`, log `<SP>/codex/log-2b.txt`. Isi: fungsi baru di `susun-lib.ts` (fungsi lama tidak boleh berubah), 4 objek baru pkg 4/5; soal 33 = 5 potongan lebar beda dengan garis miring/zigzag; soal 34 = grid 2×3; ujung objek disamarkan (objek simetris atau terpotong bingkai); ciri tersebar; tanpa tulisan; pengecoh = sambungan hampir pas; kunci pkg 4: 33 B, 34 D; pkg 5: 33 A, 34 C. Acuan identik byte: `<SP>/ref/susun_kal_HEAD.json` (pkg 3/13/15/16) dan `<SP>/ref/s2_susun_before.json`.
- **Codex-4 (KCK 8 butir) — SELESAI setelah LOG ditulis, belum diaudit isi.** Cek cepat: `check-kecerdasan-kck.ts` lolos (20 butir baru, semua paket), entri 3/14/15/16 identik. pkg 4: 97 D TABEL t2, 98 A YATIDAK t2, 99 E ALJABAR t3, 100 C GABUNG t3; pkg 5: 97 B TABEL t2, 98 D YATIDAK t2, 99 C ALJABAR t3, 100 E GABUNG t3. Pembahasan 8 butir belum dibaca Claude. Brief `<SP>/codex/codex-4-kck.md`, laporan `<SP>/codex/out-4.md`, log `<SP>/codex/log-4.txt`. KCK pkg 4/5 masuk `kecerdasan_kck_kal.json` kunci `"4"`/`"5"` (s 97–100, tingkat 2/2/3/3). Kunci pkg 4: 97 D, 98 A, 99 E, 100 C; pkg 5: 97 B, 98 D, 99 C, 100 E. `check-kecerdasan-kck.ts` diperluas untuk paket v3. Acuan: `<SP>/ref/kck_kal_before.json`.
- Kalau `/tmp` hilang: cek identik byte tetap bisa dengan `git show HEAD:prisma/data/kecerdasan_susun_kal.json` dan `git diff prisma/data/kecerdasan_kck_kal.json`.

**Temuan / keputusan tertunda:**
- **Perubahan rencana §4.3**: KCK pkg 4/5 disimpan di `kecerdasan_kck_kal.json` (seperti KCK lain), bukan di file teks. Jadi file teks berisi 73 butir. **Perlu diubah di `seed-kecerdasan-kal.ts` `compose()`**: untuk V3, gabungkan `data("kecerdasan_kck_kal.json")[pkg]` ke `teks.soal` sebelum `teksRows`/cek layout. `checkNoLeak` pkg itu jangan membandingkan KCK dengan dirinya sendiri: cek dengan teks tanpa KCK; stem KCK sudah dicek unik oleh `check-kecerdasan-kck.ts`.
- Alat bantu sesi ini (di `<SP>`, boleh dibuat ulang bila hilang):
  - `used.js` (`node <SP>/used.js kata…` dari root repo): mencetak kata yang sudah dipakai di bank verbal;
  - `cek-teks.ts` (`npx tsx <SP>/cek-teks.ts`): `checkTeks` + anti-bocor + A-7 + hitung tingkat/kunci untuk pkg 4/5;
  - `p5-verbal.js`, `sil.js`: sumber butir yang sudah ditulis ke JSON (tidak perlu dijalankan lagi).
- Sisa kuota tingkat per paket setelah teks lengkap: wacana 4 sedang / 7 HOTS, KCK 2/2, gambar 17 = 7/10 (susun 1 t2 + 1 t3).
- Kunci gambar nanti harus menyeimbangkan sebaran (maks 29/huruf).

**Langkah berikut:**
1. Audit Codex-2 putaran 2: `git diff` dua file susun, cek identik byte paket lama + s2, render `output/susun-kal-preview.html` dengan headless Chrome di 600 px dan 360 px (dari salinan scratchpad, memory local-ui-verification), lalu **minta persetujuan pemilik (G-5)**. Paket lama 3/13/15/16 baru diganti setelah disetujui.
2. Audit Codex-4: jalankan `npx tsx scripts/check-kecerdasan-kck.ts`, baca 8 pembahasan, cek A-7, lalu ubah `compose()` (temuan di atas).
3. Wacana logika 65–75 pkg 4 dan 5 (A4/B4/C3, 4 sedang / 7 HOTS per paket), bukti brute force di `cek-wacana-kal.ts` (tambahkan blok pkg 4/5; perhatikan batas 500 baris, file sekarang 221 baris). Konteks pkg 4 dan 5 harus beda dari wacana p3/p15/p16 (kursi melingkar, sesi latihan, unit, pos, jadwal, asal, ruang, uji emisi, posko).
4. Sesi 3 sesuai rencana §5 (figural-kal 4/5, mosaik, bundar, denah).

### Prompt lanjutan
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir (Sesi 2) di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md
(A-7, §4 D-1..D-4, §5, §6 G-4/G-5, §10) dan docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md v3 (§4.4, §4.5, §4.7).
Kerjakan Sesi 2b:
1. Codex-2 putaran 2 (susun, path di LOG): pastikan job selesai, audit diff, cek identik byte pkg 3/13/15/16
   + s2, screenshot output/susun-kal-preview.html di 600 px dan 360 px, lalu minta persetujuanku (G-5).
   Paket lama baru diganti setelah aku setuju; perintah DB kujalankan sendiri.
2. Codex-4 (KCK 8 butir pkg 4/5 di kecerdasan_kck_kal.json): pastikan selesai, jalankan
   check-kecerdasan-kck.ts, baca semua pembahasan (§5.1a), cek A-7; lalu ubah compose() di
   seed-kecerdasan-kal.ts agar pkg V3 mengambil KCK dari kecerdasan_kck_kal.json (temuan LOG Sesi 2).
3. Wacana logika 65–75 untuk pkg 4 dan 5 (A4/B4/C3, 4 sedang / 7 HOTS per paket, solusi tunggal,
   bukti brute force di cek-wacana-kal.ts), lolos checkTeks/anti-bocor/A-7 (alat cek-teks.ts di LOG).
4. Kalau masih ada ruang: mulai Sesi 3 (gambar) sesuai rencana §5.
Aturan: split dengan Codex; berhenti di ±120k token di titik aman, lalu tulis entri LOG + prompt
lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push".
```

## Sesi 2b — 2026-10-13 (berhenti di ±115k)
**Selesai:**
- **Audit Codex-4 (KCK 8 butir)**: `check-kecerdasan-kck.ts` lolos. Semua `q`, `bukti`, dan pembahasan dibaca dan dihitung ulang manual; tidak ada yang salah. Format §5.1a lengkap (Yang ditanya → (1) → (2) → gabungan bila perlu → Jawaban + "Opsi X gugur" → Biar gampang diingat → Jebakan). A-7 bersih. Kunci pkg 4: D A E C; pkg 5: B D C E (4 huruf beda, ada C dan E, 2 tabel per paket).
- **`compose()` di `seed-kecerdasan-kal.ts`**: untuk V3, `checkNoLeak` dijalankan atas teks tanpa KCK, lalu `kecerdasan_kck_kal.json[pkg]` digabung ke `teks.soal` sebelum `checkTeks`/A-7/tingkat/layout. `tsc` lolos. Belum bisa dijalankan penuh karena gambar pkg 4/5 belum ada.
- **Wacana logika 65–75 pkg 4 dan 5** (22 butir, per paket 4 sedang / 7 HOTS), semua solusi tunggal dan **setiap syarat terbukti perlu** (`perlu()` baru di `cek-wacana-kal.ts`, sekarang 352 baris, semua blok lolos):
  - pkg 4: `p4wKIOS` (A, 6 kios utara–selatan), `p4wPIDATO` (B, urutan tampil lomba pidato), `p4wBAND` (C, nama × alat musik × warna kaos). Kunci 65–75: B E C D E B A E C B D.
  - pkg 5: `p5wLANTAI` (A, 6 lantai gedung layanan), `p5wGIGI` (B, kunjungan pemeriksaan gigi Senin–Sabtu), `p5wMASAK` (C, peringkat × menu lomba memasak). Kunci 65–75: C A E B D C A B E C A.
  - Jenis soal dicampur: siapa di posisi X, pasti benar, KECUALI (syarat dihapus), syarat dihapus → pasti benar, dua posisi ditukar → syarat yang dilanggar.
  - Sumber: `<SP2>/wac/tulis.js` (idempoten, menulis ke JSON), alat bantu desain `<SP2>/wac/{lib,try,search}.js`.
- **Codex-3 cek buta 132 butir teks** (verbal, silogisme, deret, numerik, KCK; wacana logika belum ikut karena ditulis sesudahnya): **132/132 jawaban sama dengan kunci**. Temuan yang diterima dan sudah diperbaiki:
  - p4 #16 ODD: "Gitar" (bukan alat tradisional) membuka dasar pengelompokan kedua, dan rebab (digesek) juga sendirian → opsi jadi Kecapi/Sasando/Siter/Kolintang/Gambus;
  - p5 #8 ANT: "Segar" juga lawan "Loyo" → diganti "Pucat";
  - p5 #18 ODD: Kalimantan juga sendirian (wilayahnya terbagi ke negara lain) → butir diganti Gunung/Bukit/**Lembah**/Pegunungan/Dataran tinggi (kunci tetap C);
  - p4 #9 ANT: "Kooperatif" bisa dipasangkan dengan "Agresif" → diganti "Kompetitif";
  - p4 #43 SIL: opsi D "mungkin bukan" (benar sebagai kemungkinan) → "Sebagian anggota klub sains bukan siswa kelas XI.";
  - p4 #49 SIL: opsi E terlalu luas → "Tidak dapat dipastikan apakah Dina juara lomba pidato."
  - Ditolak: p5 #5 "jemawa" (bentuk baku KBBI; "jumawa" merujuk ke "jemawa"); p5 #9, #14, #15, #17 (hubungan utama jelas dan pembahasan menamai pengecohnya).
- Status sekarang: teks 73 + KCK 4 = **77 butir per paket**, 31 sedang / 46 HOTS. Kunci (teks + KCK) pkg 4: A20 B20 C20 D21 E19; pkg 5: A20 B21 C20 D19 E20. `cek-teks.ts` lolos (checkTeks + anti-bocor + A-7).
- **Audit Codex-2 putaran 2 (susun)**: diff dibaca. `susun-lib.ts` hanya menambah fungsi (96 baris tambah, 0 hapus), pkg 3/13/15/16 identik (`JSON.stringify`), `kecerdasan_s2_susun.json` identik byte, `pembahasan_svg` tanpa `id`. Screenshot 600 px dan 360 px ada di `<SP2>/shot/` (`p45-600.png`, `conv.png`, `m360.png`). **Penilaian Claude: keempat objek tidak lolos G-4** (lihat temuan). Menunggu keputusan pemilik (G-5).

**File berubah (belum commit):** `scripts/seed-kecerdasan-kal.ts` (compose V3), `scripts/cek-wacana-kal.ts` (blok pkg 4/5), `prisma/data/kecerdasan_p4_teks.json`, `kecerdasan_p5_teks.json` (+wacana, +6 perbaikan), file LOG ini. Dari Codex (sudah diaudit): `kecerdasan_kck_kal.json`, `check-kecerdasan-kck.ts`, `susun-lib.ts`, `generate-kecerdasan-susun-kal.ts`, `kecerdasan_susun_kal.json`, `output/susun-kal-preview.html`.

**Codex:** `<SP2>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/e8eaf8b1-b3fe-452a-b795-c1e7f5748788/scratchpad`. Codex-3 selesai: brief `<SP2>/codex/codex-3-buta.md`, input `<SP2>/qa/butir-buta.json`, hasil `<SP2>/codex/out-3.md`. Tidak ada job Codex yang berjalan. Alat `cek-teks.ts`, `used.js`, dan `ref/` sudah disalin ke `<SP2>`.

**Temuan / keputusan tertunda:**
1. **Susun pkg 4/5 (G-4/G-5), menunggu pemilik.** Rangka jembatan, rak panel mesin, saluran ventilasi berusuk, dan rangka konveyor adalah pola industri berulang, bukan siluet benda yang dikenali (setara helikopter/truk pemadam di paket lama). Potongan saluran ventilasi hampir identik satu sama lain. Pada soal 5 potongan, profil zigzag semua batas potong sama, sehingga tepi mana pun pas secara bentuk dan urutan hanya bisa dibedakan dari isi gambar; pada objek berulang ini risiko dua urutan sah (D-1). Usul: putaran 3 dengan siluet benda nyata yang asimetris (misalnya kereta api, kapal feri, traktor, menara mercusuar dengan bangunan), profil batas potong dibuat berbeda per batas, dan `cutLayout` dipakai ulang. Preview 360 px juga terpotong ke kanan (halaman preview saja, bukan aplikasi).
2. Catatan A-7 di paket lama yang sudah tayang: susun pkg 13 "mobil patroli polisi", pkg 15 "motor patroli"; wacana p15 memuat "Menembak", "Binmas/Reskrim/Sabhara/Lantas", p3 memuat unit "Narkoba/Tipikor/Lantas". Di luar lingkup rencana ini; perlu keputusan pemilik apakah diganti.
3. Temuan Codex-3 yang belum dikerjakan (D-3, perlu keputusan/sesi berikut): opsi kunci bacaan paling panjang/terperinci di p4 #21, #23, #25 dan p5 #21–#25; p4 #91 kunci satu-satunya berformat "jam + menit". Pengecoh numerik yang mudah dibuang lewat taksiran (negatif atau beda skala): p4 #79, #82, #83, #85; p5 #79, #81, #83, #86. Pengecoh silogisme di luar premis: p4 #48, p5 #45, #48.
4. Sisa per paket untuk gambar (23 butir: figural 26–37, denah 38–42, bundar 51–56): **9 sedang / 14 HOTS**; kunci gambar harus menjaga tiap huruf ≤ 29 (sisa kuota pkg 4: A9 B9 C9 D8 E10; pkg 5: A9 B8 C9 D10 E9).

**Langkah berikut:**
1. Keputusan pemilik soal susun (temuan 1). Bila putaran 3: tulis brief Codex-2c.
2. Perbaiki temuan 3 (opsi bacaan disamakan panjangnya; format durasi p4 #91; ganti pengecoh numerik lemah dengan kesalahan bernama yang hasilnya berskala wajar), lalu jalankan ulang `cek-teks.ts`.
3. Cek buta wacana logika 22 butir (Codex-3b, read-only, file tanpa kunci seperti `butir-buta.json`).
4. Sesi 3: figural-kal 4/5, mosaik, bundar, denah, semua `pembahasan_svg`; screenshot 360 px.

### Prompt lanjutan
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir (Sesi 2b) di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md
(A-7, §4 D-1..D-4, §5, §6 G-1..G-9, §10) dan docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md v3 (§4.1–4.4).
Kerjakan Sesi 3:
1. Susun: ikuti keputusanku soal temuan 1 LOG Sesi 2b (putaran 3 Codex-2c atau terima). Paket lama
   tidak diubah tanpa persetujuanku.
2. Perbaiki temuan 3 LOG Sesi 2b (D-3 opsi bacaan, p4 #91, pengecoh numerik/silogisme lemah), lalu
   jalankan cek-teks.ts (salinan di scratchpad Sesi 2b, path di LOG) dan cek-wacana-kal.ts.
3. Paralel Codex-3b (read-only): cek buta 22 butir wacana logika pkg 4/5 tanpa kunci.
4. Gambar pkg 4 dulu sampai lolos, baru pkg 5: figural-kal (matriks, rotasi/cermin, analogi, ikon),
   mosaik 2, bundar 6, denah 5, semua pembahasan_svg; sisa tingkat 9 sedang / 14 HOTS dan kuota kunci
   per huruf ada di LOG. Screenshot 520 px dan 360 px; prototipe gaya baru minta persetujuanku (G-5).
Aturan: split dengan Codex; berhenti di ±120k token di titik aman, lalu tulis entri LOG + prompt
lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push".
```

### Sesi 2b — tambahan setelah keputusan pemilik (2026-10-13)
- **Pemilik setuju susun putaran 3** dengan objek seperti rumah, kafe, kantor, komponen AC, lemari, printer (diperluas: ruko, rumah panggung, toko roti, unit outdoor AC, AC split, mesin cuci, kulkas, dispenser, fotokopi, gerobak, kereta, feri, traktor). Bangunan wajib majemuk dan detail, bukan templat rumah sederhana (G-4).
- **Codex-2c dijalankan** (workspace-write, berjalan saat LOG ditulis): brief `<SP2>/codex/codex-2c-susun.md` (merujuk `<SP2>/codex/codex-2b-susun.md`), laporan `<SP2>/codex/out-2c.md`, log `<SP2>/codex/log-2c.txt`. Isi: 4 objek baru, profil batas potong berbeda per batas + assert, kunci tetap (pkg 4: 33 B, 34 D; pkg 5: 33 A, 34 C), preview dengan meta viewport.
- **Pemilik: paket lama yang memuat unsur kepolisian tidak perlu diganti** (temuan 2 Sesi 2b ditutup).
- Prompt lanjutan di bawah menggantikan prompt Sesi 2b.

### Prompt lanjutan (menggantikan prompt Sesi 2b)
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir (Sesi 2b + tambahan) di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md
(A-7, §4 D-1..D-5, §5, §6 G-1..G-9, §10) dan docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md v3 (§4.1–4.4).
Kerjakan Sesi 3:
1. TASK UTAMA — Susun putaran 3 (Codex-2c, path brief/laporan/log di LOG): pastikan job selesai
   (bila gagal/hilang, jalankan ulang brief yang sama). Audit diff susun-lib.ts +
   generate-kecerdasan-susun-kal.ts, cek identik byte pkg 3/13/15/16 + s2, cek assert profil batas
   potong berbeda, nilai G-4 (objek rumah/kafe/kantor/AC/lemari/printer harus majemuk dan detail,
   bukan templat), cek D-1 (tidak ada urutan lain yang pas), screenshot output/susun-kal-preview.html
   di 600 px dan 360 px, lalu minta persetujuanku (G-5). Bila belum layak, tulis brief putaran
   berikutnya sendiri. Paket lama tidak diubah.
2. Perbaiki temuan 3 LOG Sesi 2b (D-3 opsi bacaan, p4 #91, pengecoh numerik/silogisme lemah), lalu
   jalankan cek-teks.ts (salinan di scratchpad Sesi 2b, path di LOG) dan cek-wacana-kal.ts.
3. Paralel Codex-3b (read-only): cek buta 22 butir wacana logika pkg 4/5 tanpa kunci.
4. Gambar pkg 4 dulu sampai lolos, baru pkg 5: figural-kal (matriks, rotasi/cermin, analogi, ikon),
   mosaik 2, bundar 6, denah 5, semua pembahasan_svg; sisa tingkat 9 sedang / 14 HOTS dan kuota kunci
   per huruf ada di LOG. Screenshot 520 px dan 360 px; prototipe gaya baru minta persetujuanku (G-5).
Paket lama yang memuat unsur kepolisian TIDAK perlu diganti (keputusan pemilik).
Aturan: split dengan Codex; berhenti di ±120k token di titik aman, lalu tulis entri LOG + prompt
lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push".
```

### Keputusan pemilik — QA sampling (2026-10-13)
- Cek buta dan pemeriksaan manual memakai **sampling**, tidak semua butir:
  - sampel berstrata, minimal 1–2 butir per jenis per paket (figural per jenis, mosaik, bundar, denah, susun, wacana);
  - kalau satu sampel bermasalah, semua butir jenis itu diperiksa penuh.
- Cek otomatis tetap untuk semua butir, karena tanpa biaya: brute force wacana, `hitung`, cek simetri D-5, `compose()` (layout, 40/60, kunci ≤ 24%, anti-bocor, A-7), `tsc`, dan `next build`.
- Berlaku juga untuk prompt lanjutan di atas: Codex-3b (wacana) dan cek buta gambar dijalankan pada sampel.

### Susun — status akhir Sesi 2b (2026-10-13)
- Pemilik: printer dibuang, "kejar tayang". Codex-2d mengganti 4/34 dengan **kulkas side-by-side** (brief `<SP2>/codex/codex-2d.md`, laporan `<SP2>/codex/out-2d.md`). Diaudit Claude: entri lain + s2 identik byte, `susun-lib.ts` hanya tambahan, tanpa `id`, `tsc` bersih, screenshot terbaca (kulkas, gagang, botol/karton, kabel, kaki). Objek susun: 4/33 kafe/ruko, 4/34 kulkas, 5/33 kantor, 5/34 lemari. Preview: `output/susun-kal-preview.html`.
- Kafe/ruko dan kantor dinilai Claude paling lemah (gumpalan hitam), diterima sementara demi tayang. **Tinggal persetujuan G-5 pemilik**; paket lama belum diganti.

### Penutup Sesi 2b — susun DISETUJUI pemilik (2026-10-13)
- **Pemilik menyetujui empat objek susun** (4/33 kafe/ruko, 4/34 kulkas, 5/33 kantor, 5/34 lemari). Susun selesai; tidak ada putaran lagi. Paket lama tidak diubah.
- **Pemilik: Claude mengerjakan sisa gambar sendiri, tidak menunggu Codex** (Codex terlalu lama dan tidak bisa merender). Codex hanya dipakai untuk cek buta sampel (read-only).
- Peta Sesi 3 (satu paket penuh, pkg 4 dulu, lalu pkg 5; gambar per paket = 21 butir selain susun):
  1. bundar 51–56: salin pola `scripts/figural-kal-bundar-16.ts` → `figural-kal-bundar-4.ts` / `-5.ts`, daftarkan di `generate-kecerdasan-figural-kal.ts` (impor `BUNDAR16_ITEMS` sebagai contoh);
  2. mosaik 26–27: `buildMosaik` di `figural-mosaik.ts`;
  3. figural 28–32 + 35–37 (matriks 3, rotasi/cermin 2, analogi 2, ikon 1): salin pola `figural-kal-16.ts` → `figural-kal-4.ts` / `-5.ts`, aturan figural berbeda dari semua paket lain (stem/aturan tidak boleh identik);
  4. denah 38–42: entri `PKGS` baru di `generate-kecerdasan-denah-kal.ts` (peta A 2 ARAH + 2 RUTE, peta B 1 ROTASI; peta berbeda dari paket lain);
  5. semua `pembahasan_svg` (G-6), tanpa `id` (G-8).
- Tingkat: target total 40 sedang / 60 HOTS; teks+KCK sekarang 31/46, jadi gambar 9/14 termasuk susun (1 sedang + 1 HOTS). Figural+mosaik+bundar+denah (21 butir) = **8 sedang / 13 HOTS**. Kuota kunci gambar per huruf (maks 29 total): hitung dari teks+KCK+susun yang ada.
- QA: **sampling** (lihat keputusan pemilik di atas) + cek otomatis penuh (D-5 simetri, `compose()`, `tsc`, `next build`).

### Prompt lanjutan (menggantikan semua prompt sebelumnya)
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir (Sesi 2b + "Penutup Sesi 2b") di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md
(A-7, §4 D-1..D-5, §5, §6 G-1..G-9, §10) dan docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md v3 (§4.1–4.4).
Status: teks 77 butir per paket (73 + KCK 4) selesai; susun 4 butir DISETUJUI pemilik. Sisa: gambar.
Kerjakan Sesi 3, SENDIRI (tanpa menunggu Codex), pkg 4 dulu sampai lolos validasi, baru pkg 5:
 1. bundar 51–56 (figural-kal-bundar-4.ts dari pola -16), 2. mosaik 26–27, 3. figural 28–32 + 35–37
 (figural-kal-4.ts dari pola -16), 4. denah 38–42 (PKGS baru), 5. semua pembahasan_svg.
 Tingkat gambar per paket: 8 sedang / 13 HOTS (total 40/60). Kunci tiap huruf ≤ 29 per paket.
 Prototipe gaya figural baru: tunjukkan beberapa contoh + screenshot 520 px dan 360 px (G-5) sebelum produksi massal.
QA: sampling berstrata (1–2 butir per jenis; bila bermasalah, periksa penuh jenis itu) untuk cek buta
(Sonnet dari PNG untuk gambar, Codex read-only untuk wacana logika 22 butir); cek otomatis tetap penuh.
Sebelum rilis: perbaiki temuan 3 LOG Sesi 2b (opsi bacaan D-3, p4 #91, pengecoh numerik/silogisme lemah).
Lalu compose(4)/compose(5) penuh, tsc, next build; serahkan perintah --apply 4, --apply 5 dan backfill ke pemilik.
Aturan: berhenti di ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB;
commit hanya setelah aku bilang "commit dan push".
```

## Sesi 3a — 2026-10-13 (berhenti di titik aman; konteks sudah lewat ±120k karena membaca file acuan)
**Selesai (pkg 4, gambar):**
- **Bundar 51–56** → `scripts/figural-kal-bundar-4.ts` (baru, 6 butir, terdaftar di `generate-kecerdasan-figural-kal.ts` via `BUNDAR4_ITEMS`). Aturan baru, beda dari pkg 3/15/16/s2: 51 R1 hasil kali berseberangan = 30 (sedang, C) · 52 R2 jumlah dua bilangan sebelumnya (sedang, A) · 53 R3 luar = 2^dalam + dalam (HOTS, E) · 54 R4 pusat = (atas+bawah)×2 − (kiri+kanan) (HOTS, B) · 55 huruf (a) luar = 2×nilai+3 (sedang, A) · 56 huruf (b) mundur 4 huruf, lewat A kembali ke Z (HOTS, D). Asersi kunci = aturan, aturan alternatif gugur, 2 paragraf + `pembahasan_svg` tanpa id. Screenshot 520 px 53/54/56 dicek: terbaca, tidak meluber. **Belum dicek di 360 px.**
- **Mosaik 26–27** → 2 definisi baru di `scripts/figural-mosaik.ts` (sekarang 244 baris): 26 KONVEYOR (kolom tepi turun, kolom tengah naik, tembus tepi = dicermin kiri-kanan, kolom tengah selalu warna terbalik; HOTS, kunci C) · 27 CINCIN SUDUT (ring 8 ubin geser 1 petak ↺, warna menempel pada sudut, bendera tengah berputar ↺ + dicermin; HOTS, kunci E). Screenshot 520 px #26 dicek manual: aturan terbaca benar. Pesan asersi pengecoh kini menyebut `why`.
- **Denah 38–42** → `generate-kecerdasan-denah-kal.ts`: `4` ditambahkan di akhir `PKGS`, `PB`, `NEW` (urutan paket lama tidak berubah). Hasil pkg 4: 38 ARAH t3 E · 39 ARAH t2 B · 40 RUTE t3 A · 41 RUTE t3 C · 42 ROTASI(90°) t2 D → 2 sedang / 3 HOTS, kunci 5 huruf beda. Paket 2/3/13/14/15/16 **identik** dengan sebelum (JSON dibandingkan).
- Cek: generator figural lolos (`pkg 4 8` butir), paket 2/3/13/15/16 identik; `tsc --noEmit` bersih.

**Belum dikerjakan:** figural-kal-4.ts (28–32 + 35–37) dan G-5 prototype; seluruh gambar pkg 5; temuan 3 Sesi 2b; cek buta; `compose(4)`/`compose(5)`; `next build`.

**Alokasi kunci/tingkat pkg 4 yang sudah dipakai (supaya figural 8 butir menutup kuota):**
- Teks+KCK+susun: A20 B21 C20 D22 E19 (79 butir, 32 sedang / 47 HOTS). Denah +1 tiap huruf, bundar+mosaik A2 B1 C2 D1 E2 → A23 B23 C23 D24 E22.
- Figural 8 butir **harus 3 sedang / 5 HOTS** (total 40/60). Rencana kunci: 28 E(s) · 29 A(H) · 30 B(H) · 31 E(s) · 32 C(H) · 35 B(H) · 36 A(H) · 37 E(s) → total akhir A25 B25 C24 D24 E25 (cap 29/huruf, aman).
- Aturan figural pkg 4 harus berbeda dari kal-3/kal-16/kal-2/kal-13/kal-15 dan s2 (jangan pakai: Latin 3 atribut, putar 90° per kolom, gabungan/irisan garis, cermin kolom 1 → 2/3, lajur hitam + putar + titik luar, jumlah titik = banyak putaran, 135°, 180°+cermin+balik warna, orbit 3 bangun, bangun luar↔dalam, belah+turun, ikon titik di luar/dalam bangun, ikon bangun luar-dalam sejenis).

**Alat bantu (scratchpad sesi ini, bisa dibuat ulang):** `<SP3>/shot.sh <pkg> <seq,seq> <lebar> <tinggi> <out.png> [json]` merender butir dari `kecerdasan_figural_kal.json` lewat Chrome headless (meta viewport; `<SP3>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/54e40d39-a840-4624-8263-230b520a9dc1/scratchpad`). Acuan identik byte: `<SP3>/figural_kal_before.json`, `<SP3>/denah_before.json`. Tool lama `cek-teks.ts`, `used.js`, `wac/` ada di `<SP2>` (`.../e8eaf8b1-b3fe-452a-b795-c1e7f5748788/scratchpad`).

**File berubah (belum commit):** `scripts/figural-kal-bundar-4.ts` (baru), `scripts/figural-mosaik.ts`, `scripts/generate-kecerdasan-figural-kal.ts`, `scripts/generate-kecerdasan-denah-kal.ts`, `prisma/data/kecerdasan_figural_kal.json`, `prisma/data/kecerdasan_denah_kal.json`, `output/figural-kal-preview.html`, `output/denah-kal-preview.html`, LOG ini.

**Langkah berikut:**
1. pkg 4 figural: `figural-kal-4.ts` (8 butir, tiap butir + `pembahasan_svg`) dari pola `figural-kal-16.ts`; **prototipe dulu (≥3 butir: 1 matriks HOTS, 1 rotasi, 1 analogi)**, screenshot 520 dan 360 px, minta persetujuan pemilik (G-5), baru sisanya. Tambahkan `FIG4_ITEMS` ke `all`, asersi nomor `out[4]` = [26,27,28,29,30,31,32,35,36,37,51..56] di generator.
2. Cek 360 px untuk bundar/mosaik/denah pkg 4; sampling Sonnet dari PNG (1–2 butir per jenis).
3. Pkg 5 penuh dengan cara sama (aturan baru berbeda dari pkg 4): bundar-5, 2 mosaik, figural-kal-5, denah (`5` di `PKGS/PB/NEW`; kini `pi=7` → rotasi 180°, A butuh 2 HOTS).
4. Temuan 3 Sesi 2b (D-3 opsi bacaan p4 #21/#23/#25 + p5 #21–#25, p4 #91 format durasi, pengecoh numerik/silogisme lemah), `cek-teks.ts`, `cek-wacana-kal.ts`; Codex-3b read-only untuk sampel wacana logika.
5. `seed-kecerdasan-kal.ts --check 4` lalu `--check 5` (compose penuh), `tsc`, `next build --webpack`; serahkan `--apply 4`, `--apply 5`, backfill ke pemilik.

### Prompt lanjutan (menggantikan prompt Sesi 2b)
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca HANYA yang perlu (konteks cepat habis): entri terakhir "Sesi 3a" di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, PEDOMAN_UTAMA §4 D-1..D-5 + §6 G-1..G-9,
dan pola scripts/figural-kal-16.ts + figural-lib.ts (jangan baca ulang file bundar/mosaik/denah yang sudah jadi).
Status: pkg 4 sudah punya bundar 51–56, mosaik 26–27, denah 38–42 (lolos generator + tsc). Sisa pkg 4: figural 28–32 + 35–37.
Kerjakan Sesi 3b, SENDIRI (tanpa Codex):
 1. figural-kal-4.ts: 8 butir (3 sedang / 5 HOTS, kunci 28 E · 29 A · 30 B · 31 E · 32 C · 35 B · 36 A · 37 E),
    aturan baru (daftar yang dilarang di LOG). Mulai dengan prototipe 3 butir, screenshot 520 px dan 360 px
    (shot.sh di LOG), minta persetujuanku (G-5) sebelum sisanya.
 2. Lalu pkg 5 penuh: bundar-5, 2 mosaik (def baru di figural-mosaik.ts), figural-kal-5, denah (tambah 5 di PKGS/PB/NEW).
 3. Temuan 3 LOG Sesi 2b, cek buta sampling, compose(4)/compose(5) via seed-kecerdasan-kal.ts --check, tsc, next build.
Aturan: berhenti di ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB;
commit hanya setelah aku bilang "commit dan push".
```

## Sesi 3b — 2026-10-13 (berhenti di gerbang G-5, menunggu persetujuan prototipe)
- `scripts/figural-kal-4.ts` (baru) berisi **3 prototipe pkg 4**, terdaftar di generator (`FIG4_ITEMS`; asersi `out[4]` baru dipasang setelah 8 butir lengkap). Generator lolos: pkg 4 = 11 butir (6 bundar + 2 mosaik + 3 prototipe).
  - 29 matriks HOTS kunci A: jarum berputar 45° ↺ per kolom · kotak hitam kolom 3 = kolom 1 − kolom 2 (5 slot) · cakram putih-hitam-putih.
  - 31 rotasi sedang kunci E: palu bergigi dicerminkan tegak LALU diputar 90° ↺ (pengecoh a = urutan terbalik, b = putar saja, c = cermin saja, d = cermin mendatar).
  - 35 analogi HOTS kunci B: bangun digandakan, diperkecil 0,68, ditumpuk atas-bawah · kedua salinan diputar 90° ↻ · salinan atas berwarna kebalikan (A dan C sama-sama putih supaya bacaan warna tidak ambigu).
- Screenshot dicek 520 px dan 360 px: terbaca, tidak terpotong. Catatan alat: Chrome headless minimum lebar jendela ±500 px, jadi 360 px dirender dengan `body{width:360px}` (`<SP3>/shot2.sh`, sama dengan shot.sh).
- Sisa pkg 4 setelah disetujui: 28 E (sedang) · 30 B (HOTS) · 32 C (HOTS) · 36 A (HOTS) · 37 E (sedang). Lalu pkg 5 penuh, temuan 3 Sesi 2b, cek buta, compose, tsc, next build.

### Sesi 3b — penutup: pkg 4 gambar LENGKAP (prototipe DISETUJUI pemilik, G-5)
- Prototipe 29/31/35 disetujui. Sisa figural pkg 4 selesai di `scripts/figural-kal-4.ts` (8 butir, tiap butir + `pembahasan_svg` tanpa id): **28** E sedang (sisi +1 per kolom · titik = nomor baris) · **30** B HOTS (3 batang geser 1 ke kanan, batang yang pindah berganti warna dan +1 tinggi) · **32** C HOTS (hitam putar 90° ↻ di tempat, putih cermin tegak di tempat, bertukar tempat) · **36** A HOTS (sisi ×2, warna bertukar, panah dalam 90° ↻; A dan C sama-sama putih, panah sama-sama ke atas supaya bacaan "selalu hitam/kanan" tidak ambigu; opsi tanpa segi tujuh) · **37** E sedang (kotak hitam 2×2 bersambung sisi, e diagonal; tiap kuadran hitam di 3 gambar, jumlah 2/3 terbagi 3/2).
- Asersi `out[4]` = [26,27,28,29,30,31,32,35,36,37,51..56] terpasang di generator. Hasil pkg 4 (gambar saja, 16 butir): **6 sedang / 10 HOTS** (+ denah 2/3 → 8/13, sesuai target). Kunci gambar: A4 B3 C3 D1 E5 (+ denah 1 tiap huruf, + teks → total A25 B25 C24 D24 E25 seperti rencana).
- Cek: generator lolos, paket lain tidak berubah (generator hanya menambah pkg 4), `tsc --noEmit` bersih. Screenshot 520 px dan 360 px (shot2.sh) dicek untuk figural pkg 4; bundar/mosaik/denah pkg 4 di 360 px **belum dicek per butir**.
- **Belum:** seluruh gambar pkg 5; cek 360 px bundar/mosaik/denah pkg 4; temuan 3 Sesi 2b; cek buta sampling; `--check 4`/`--check 5`; `next build`. **Pkg 4 BELUM siap seed** (gambar lengkap, tapi QA sampling, temuan 3, compose dan build belum dijalankan).
- File berubah (belum commit): `scripts/figural-kal-4.ts` (baru), `scripts/generate-kecerdasan-figural-kal.ts`, `prisma/data/kecerdasan_figural_kal.json`, `output/figural-kal-preview.html`, LOG ini (+ file Sesi 3a).

### Prompt lanjutan (menggantikan prompt Sesi 3a)
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca HANYA yang perlu: entri "Sesi 3a" + "Sesi 3b — penutup" di docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md,
PEDOMAN_UTAMA §4 D-1..D-5 + §6 G-1..G-9, pola scripts/figural-kal-4.ts (gaya baru yang sudah disetujui)
dan figural-lib.ts. Jangan baca ulang bundar/mosaik/denah pkg 4.
Status: pkg 4 gambar LENGKAP (16 figural/bundar/mosaik + denah 5). Pkg 5 belum ada gambar.
Kerjakan Sesi 3c, SENDIRI (tanpa Codex), gaya figural pkg 4 sudah disetujui (tidak perlu prototipe G-5 ulang
bila gayanya sama; aturan wajib BARU, beda dari semua paket lain termasuk pkg 4):
 1. pkg 5: bundar-5 (51–56, scripts/figural-kal-bundar-5.ts dari pola -4), 2 mosaik (26–27, def baru di figural-mosaik.ts),
    figural-kal-5.ts (28–32 + 35–37, 8 butir; pilih kunci/tingkat supaya total pkg 5 = 8 sedang / 13 HOTS gambar, tiap huruf ≤ 29 total),
    denah (tambah 5 di PKGS/PB/NEW; pi=7 → rotasi 180°, A butuh 2 HOTS).
 2. Cek 360 px (shot2.sh) bundar/mosaik/denah pkg 4 + semua pkg 5.
 3. Temuan 3 LOG Sesi 2b (D-3 opsi bacaan p4 #21/#23/#25 + p5 #21–#25, p4 #91 format durasi, pengecoh numerik/silogisme lemah),
    cek buta sampling, seed-kecerdasan-kal.ts --check 4 lalu --check 5 (compose), tsc, next build --webpack.
Aturan: berhenti di ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB;
commit hanya setelah aku bilang "commit dan push". Serahkan perintah --apply 4, --apply 5 dan backfill ke pemilik.
```

## Sesi 3c — 2026-10-13 (berhenti di titik aman ±120k; konteks habis untuk membaca acuan)
**Selesai (pkg 5, gambar):**
- **Bundar 51–56** → `scripts/figural-kal-bundar-5.ts` (baru, 6 butir, terdaftar di `generate-kecerdasan-figural-kal.ts` via `BUNDAR5_ITEMS`; asersi `out[5]` BELUM dipasang). Aturan baru, beda dari pkg 3/4/15/16/s2: 51 seberang = kuadrat (3↔9, 5↔25, 7↔?; sedang, **D**=49) · 52 selisih berlipat dua +1,+2,+4,… (3,4,6,10,18,34,66,?; sedang, **E**=130) · 53 luar = (dalam−1) × nomor juring, 5 juring (HOTS, **D**=10; instruksi menyebut penomoran) · 54 pusat = atas×bawah − (kiri+kanan) (HOTS, **A**=7) · 55 huruf (a) angka luar = 27 − nilai huruf (sedang, **E**=7) · 56 huruf (b) nilai = n², lewat 26 dikurangi 26 (A D I P Y J W ?, HOTS, **C**=L). Asersi kunci = aturan, aturan alternatif gugur, 2 paragraf + `pembahasan_svg` tanpa id. Screenshot 520 px 53/56 dicek (anotasi 53 diperbaiki, tidak menimpa pie). **Belum dicek di 360 px.**
- Generator lolos (`pkg 5 6`), paket lain tidak berubah, `tsc --noEmit` bersih.

**Sisa pkg 5 (belum dikerjakan):** 2 mosaik (26–27), figural-kal-5.ts (28–32 + 35–37), denah, lalu cek 360 px (bundar/mosaik/denah pkg 4 + semua pkg 5), temuan 3 Sesi 2b, cek buta, `--check 4`/`--check 5`, `next build --webpack`.

**Alokasi kunci/tingkat pkg 5 (sudah dihitung, pakai persis ini):**
- Teks+KCK+susun pkg 5 (79 butir): A21 B21 C21 D19 E20, **32 sedang / 47 HOTS** → gambar harus **8 sedang / 13 HOTS** (21 butir).
- Bundar sudah: 51 D(s) 52 E(s) 53 D(H) 54 A(H) 55 E(s) 56 C(H) = 3s/3H.
- Mosaik 26–27: dua-duanya HOTS, **26 kunci E · 27 kunci D**.
- Figural 8 butir = **3 sedang / 5 HOTS**: **28 B(s) · 29 A(H) · 30 D(H) · 31 C(s) · 32 E(H) · 35 A(H) · 36 B(H) · 37 D(s)** (struktur jenis sama dengan pkg 4: 28 matriks s, 29–30 matriks H, 31 rotasi s, 32 rotasi H, 35–36 analogi H, 37 ikon s).
- Denah pkg 5 (`pi=7` → ROTASI 180° = HOTS, peta A 2 HOTS): hasilnya harus 2 sedang / 3 HOTS, 1 kunci tiap huruf (generator sudah menjamin).
- Total akhir yang dituju: A25 B24 C24 D25 E25 (cap 29/huruf aman). Gambar 21 butir = 8s/13H → total 40/60 sesuai asersi `compose`.
- Aturan yang SUDAH terpakai di figural (jangan ulang): daftar di Sesi 3a + pkg 4 (jarum 45°+kotak selisih; sisi +1 & titik = nomor baris; 3 batang geser 1 kanan + ganti warna/+1 tinggi; hitam putar 90° ↻ + putih cermin + bertukar; sisi ×2 + warna bertukar + panah putar; kotak 2×2 bersambung; palu cermin lalu putar; gandakan-kecilkan-tumpuk) dan mosaik pkg 4 (KONVEYOR, CINCIN SUDUT), juga ULAR/DIAGONAL (15) dan LOMPAT (16).
- Alat bantu: `shot2.sh` di `<SP3>` (lihat Sesi 3a) masih ada; `<SP3>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/54e40d39-a840-4624-8263-230b520a9dc1/scratchpad`.

**File berubah (belum commit):** `scripts/figural-kal-bundar-5.ts` (baru), `scripts/generate-kecerdasan-figural-kal.ts`, `prisma/data/kecerdasan_figural_kal.json`, `output/figural-kal-preview.html`, LOG ini (+ file Sesi 3a/3b).

### Prompt lanjutan (menggantikan prompt Sesi 3b)
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca HANYA yang perlu: entri "Sesi 3c" di docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md (alokasi kunci/tingkat pkg 5 sudah dihitung di sana),
PEDOMAN_UTAMA §4 D-1..D-5 + §6 G-1..G-9 (cukup baris-barisnya), pola scripts/figural-kal-4.ts (gaya yang sudah disetujui)
dan figural-lib.ts, dan figural-mosaik.ts baris 183–244 (def KONVEYOR/CINCIN SUDUT + build). Jangan baca ulang bundar-4/-5 atau denah pkg 4.
Status: pkg 4 gambar LENGKAP; pkg 5 baru punya bundar 51–56 (figural-kal-bundar-5.ts, sudah terdaftar). Sisa pkg 5: 2 mosaik, figural-kal-5.ts, denah.
Kerjakan Sesi 3d, SENDIRI (tanpa Codex), gaya pkg 4 sudah disetujui (tanpa prototipe G-5 ulang); aturan wajib BARU:
 1. mosaik 26 (kunci E) + 27 (kunci D), keduanya HOTS, def baru di figural-mosaik.ts (pkg: 5).
 2. figural-kal-5.ts (28 B s · 29 A H · 30 D H · 31 C s · 32 E H · 35 A H · 36 B H · 37 D s), tiap butir + pembahasan_svg;
    daftarkan FIG5_ITEMS di generator dan pasang asersi out[5] = [26,27,28,29,30,31,32,35,36,37,51..56].
 3. denah: tambah 5 di PKGS/PB/NEW (urutan lama tidak berubah; cek paket lain identik).
 4. Cek 360 px (shot2.sh) bundar/mosaik/denah pkg 4 + semua pkg 5; temuan 3 Sesi 2b (D-3 opsi bacaan p4 #21/#23/#25 + p5 #21–#25,
    p4 #91 format durasi, pengecoh numerik/silogisme lemah); cek buta sampling; seed-kecerdasan-kal.ts --check 4 lalu --check 5; tsc; next build --webpack.
Aturan: berhenti di ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB;
commit hanya setelah aku bilang "commit dan push". Serahkan perintah --apply 4, --apply 5 dan backfill ke pemilik.
```

## Sesi 3d — 2026-10-13 (pkg 4 + pkg 5 siap seed; menunggu cek buta, persetujuan gaya mosaik, dan "commit dan push")
**Selesai:**
- **Gaya mosaik diubah (permintaan pemilik: "jangan template seperti itu terus, membosankan")** → `Style` per butir di `scripts/figural-mosaik.ts` (bentuk ubin kotak/bulat/lembut/oktagon × bingkai ganda/tipis/panel/papan × celah × panah antargambar; topeng ubin = path evenodd tanpa id). Hanya pkg 4/5 yang memakai gaya baru; pkg 15/16 identik byte. Dicatat sebagai **PEDOMAN G-10** (+ baris G-7 dan butir checklist §10).
  - 4#26 KONVEYOR: oktagon + panel abu + panah · 4#27 CINCIN SUDUT: koin bulat + papan abu · 5#26 SILANG: ubin lembut + bingkai tipis + panah · 5#27 GESER KOSONG: kotak + papan berlubang.
- **Mosaik pkg 5 (HOTS)**: 26 SILANG, kunci E (kolom tepi bertukar menyilang lewat poros pusat; ubin yang pindah berputar 90° ↻; kolom tengah membalik warna tiap langkah) · 27 GESER KOSONG, kunci D (petak kosong jalan 8→7→4→5→8; ubin yang menutupnya bergeser, berputar 90° ↻, warna terbalik; bendera bergeser dua kali = 180°, warna normal). Kunci/tingkat sesuai alokasi Sesi 3c.
- **`scripts/figural-kal-5.ts`** (baru, 8 butir, tiap butir + `pembahasan_svg` tanpa id; `FIG5_ITEMS` terdaftar, asersi `out[5]` terpasang): 28 B sedang (jumlah bangun kolom 3 = kolom 1 + kolom 2) · 29 A HOTS (warna 3 lapisan bergeser ke dalam, titik −1/kolom, bentuk persegi–lingkaran–persegi) · 30 D HOTS (mini-kisi 3×3: geser kanan + titik saat tembus tepi + tambah 1 kotak di petak kosong pertama) · 31 C sedang (putar 90° ↻ lalu cermin mendatar) · 32 E HOTS (putar semua 90° ↻, cermin tegak bangun kecil, balik warna) · 35 A HOTS (mengecil ke kanan atas + bayangan cermin hitam kiri bawah + garis diagonal) · 36 B HOTS (4 bangun geser 1 sudut ↻, yang mendarat di kiri atas ganti warna, pusat membesar-putih) · 37 D sedang (pusat lingkaran di luar persegi). Helper `figural-kal-4.ts` kini `export` (hanya menambah kata `export`).
  - Gambar pkg 5 (16 butir): 6 sedang / 10 HOTS; + denah 2/3 → 8/13 sesuai target. Kunci gambar pkg 5: A3 B2 C2 D5 E4 (+ denah 1 tiap huruf).
- **Denah pkg 5**: `5` ditambahkan di `PKGS/PB/NEW`; hasil 38 A t3 A · 39 A t2 E · 40 R t2 C · 41 R t3 B · 42 R t3 D (rotasi 180° = HOTS) → 2 sedang / 3 HOTS, 5 huruf kunci beda. Paket 2/3/4/13/14/15/16 identik JSON.
- **Cek 360 px** (shot2.sh): bundar pkg 4 dan 5, mosaik pkg 4 (26–27), denah pkg 5 (38–40) dicek, tidak ada elemen meluber. Mosaik/figural pkg 5 dicek 520 px (foot yang terpotong diperpendek). **Belum dilihat di 360 px:** denah pkg 4 per butir, denah pkg 5 #41–42, figural pkg 5 #28–37 dan mosaik pkg 5 (viewBox sama, tetap tampil proporsional; tinggal dilirik).
- **Temuan 3 Sesi 2b selesai** (`prisma/data/kecerdasan_p4_teks.json`, `_p5_teks.json`, skrip `fix3.js` di `<SP4>` idempoten dengan asersi): D-3 opsi bacaan p4 #21/#23/#25 dan p5 #21–#25 (kunci bukan opsi terpanjang/terpendek); p4 #91 opsi durasi tidak lagi hanya satu berformat "jam + menit" (40 menit, 1 jam, 1 jam 50 menit, 30 menit, **1 jam 30 menit**, kunci tetap E); pengecoh numerik lemah diganti kesalahan bernama berskala wajar (p4 #79 63/119, #82 36.963, #83 3/4, #85 106; p5 #79 16/82, #81 64/57, #83 11/12, #86 11/7/21) dengan pembahasan disesuaikan; pengecoh silogisme di luar premis diganti (p4 #48 E, p5 #45 C = invers tidak sah, p5 #48 E).
- **Validasi:** `seed-kecerdasan-kal.ts --check 4` → OK 100 soal, kunci A25 B25 C24 D24 E25 · `--check 5` → OK 100 soal, kunci A25 B24 C24 D25 E25 (sesuai rencana). `cek-teks.ts` lolos (21 numerik dihitung per paket). `tsc --noEmit` bersih. `next build --webpack` exit 0.
- **PEDOMAN_UTAMA**: G-10 + baris G-7 + checklist §10 (gaya mosaik bervariasi).

**Belum / tertunda:**
1. **Cek buta sampling gambar (1–2 butir per jenis dari PNG, penyelesai independen) BELUM dijalankan.** Butuh subagen/Codex; tidak diluncurkan tanpa izin pemilik.
2. **G-5 untuk gaya mosaik baru:** 4 gaya di atas adalah prototipe; screenshot ada di `<SP4>` (`m5-520.png`, `m4-360.png`). Minta pemilik setuju atau minta ubah.
3. Susun pkg 4/5 (temuan 1 Sesi 2b) masih menunggu keputusan pemilik; dan A-7 paket lama (temuan 2) sudah ditutup pemilik.
4. **Commit belum dilakukan** (tunggu "commit dan push"). Perintah untuk pemilik setelah itu: `npx tsx scripts/seed-kecerdasan-kal.ts --apply 4`, `... --apply 5`, lalu `npx tsx scripts/backfill-pembahasan-kecerdasan.ts` (lihat cakupan) dan `... --apply`; cakupan pembahasan harus 100/100.

**File berubah (belum commit):** `scripts/figural-kal-5.ts` (baru), `scripts/figural-kal-4.ts` (export), `scripts/figural-mosaik.ts` (Style + 2 def pkg 5), `scripts/generate-kecerdasan-figural-kal.ts`, `scripts/generate-kecerdasan-denah-kal.ts`, `prisma/data/kecerdasan_figural_kal.json`, `kecerdasan_denah_kal.json`, `kecerdasan_p4_teks.json`, `kecerdasan_p5_teks.json`, `output/*-preview.html`, `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md`, LOG ini. `<SP4>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/8cd80dd8-b790-4636-8fd5-78762f293099/scratchpad`.

### Prompt lanjutan (menggantikan prompt Sesi 3c/3d)
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca HANYA entri "Sesi 3d" di docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md.
Status: pkg 4 dan 5 lengkap (teks, KCK, susun, gambar, denah); --check 4/5, tsc, next build --webpack sudah lolos.
Sisa: (1) cek buta sampling gambar (izinkan subagen/Codex bila perlu), (2) putusan pemilik soal gaya mosaik baru (G-5/G-10)
dan susun pkg 4/5, (3) lirik 360 px denah pkg 4 + figural/mosaik pkg 5 bila diminta.
Aturan: tidak menulis DB; commit hanya setelah aku bilang "commit dan push"; serahkan perintah --apply 4, --apply 5 dan backfill ke pemilik.
```

## Sesi 3e — 2026-10-13 (susun pkg 4/5 diganti benda nyata; keputusan pemilik: "ganti siluet benda nyata, Claude yang kerjakan")
- Koreksi: entri Sesi 2b (jembatan/rak mesin/ventilasi/konveyor) sudah usang. Saat sesi ini mulai, `generate-kecerdasan-susun-kal.ts` + JSON sudah berisi revisi Codex-2c (kafe/ruko, kulkas, kantor, lemari; modifikasi 13:57). Render Chrome menunjukkan massa hitam abstrak yang sulit dikenali, jadi tetap tidak lolos G-4 → diganti.
- **Adegan baru** `scripts/susun-benda-45.ts` (baru, 76 baris, tanpa teks/id): **4/33 kereta api listrik** (5 potong, sedang, kunci B) · **4/34 kapal feri** (grid 2×3, HOTS, kunci D) · **5/33 traktor** (5 potong, sedang, kunci A) · **5/34 perahu pinisi** (grid 2×3, HOTS, kunci C). Tingkat/kunci/urutan potongan sama dengan versi Codex, jadi sebaran kunci pkg 4/5 tidak berubah.
- Generator: adegan lama dihapus, empat definisi diganti (seams per batas ditulis dari render zoom), penyambungan JSON diperluas ke 4/33, 4/34, 5/33, 5/34. Semua entri lain (pkg 3, 13, 15, 16) identik byte. Asersi tetap lolos (profil batas unik 4/4 dan 9/9, luas 114.000, tepi bersama dua sisi, graf terhubung, tiap pengecoh satu pertukaran pasangan).
- Validasi: `--check 4` OK (kunci A25 B25 C24 D24 E25), `--check 5` OK (A25 B24 C24 D25 E25), `tsc` bersih; pembahasan 2 paragraf, `pembahasan_svg` tanpa id.
- Screenshot: `<SP4>/n4.png`, `<SP4>/n5.png` (520 px), `<SP4>/n5b.png` (360 px pinisi). Belum dinilai pemilik (G-5).
- File berubah (belum commit): `scripts/susun-benda-45.ts` (baru), `scripts/generate-kecerdasan-susun-kal.ts`, `prisma/data/kecerdasan_susun_kal.json`, `output/susun-kal-preview.html`.
- **Pemilik menyetujui (G-5) susun benda nyata pkg 4/5 dan gaya mosaik baru.** Cek buta dibatalkan pemilik. Sisa: "commit dan push" dari pemilik, lalu `--apply 4`, `--apply 5`, backfill (dijalankan pemilik).
