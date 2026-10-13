# LOG — Simulasi Penuh 4 (kartu 4)

Rencana: `simulasi-4.md`. Entri terbaru di bawah.

## Sesi 1 — 2026-10-13 (berhenti di ±120k)

**Sebelum mulai:** Latihan pkg 4/5 di-commit + push (`1f64ed1`). DB pkg 4/5 ternyata sudah terisi sebelumnya; isi DB = file (payload/kunci identik, backfill 0 baris, pembahasan 100/100).

**Selesai:**
- **Kecermatan pkg 12 (dikerjakan Claude, bukan Codex):** `generate-kecermatan-simulasi.ts` mengunduh ikon Phosphor lewat network, dan sandbox Codex tidak punya network, jadi Codex-3 dibatalkan. `BLUEPRINT[12]` ditambahkan (paruh A: GAMBAR mudah hourglass/compass/feather/gift/puzzle-piece · ANGKA_HURUF sulit permutasi 5S2 · SPASIAL dasar menengah donor 598 kol 7 · SIMBOL θ Θ φ Φ ω · SPASIAL HOTS 298 kol 2; paruh B: GAMBAR sulit 5 awan cloud-sun/moon/lightning/snow/fog · ANGKA_HURUF mudah K8 4P N2 6D Y3 · SPASIAL dasar mudah 598 kol 2 · AKSARA lengkung dasar 1 · SPASIAL sedang 498 kol 2). Output reproducible (md5 sama 2×). `lib/kecermatan-symbols.test.ts` + 12, total 12.500 → lolos. Lembar 360 px dicek: hitam-putih, tidak meluber. Set kendaraan awal diganti awan karena terlalu mudah dibedakan untuk versi "sulit".
- **Verbal pkg 19** (`prisma/data/kecerdasan_p19_teks.json`, butir 1–25 + wacana `p19a` bank sampah 155 kata, `p19b` antrean puskesmas 157 kata): tingkat 10 sedang / 15 HOTS; lolos `checkTeks`, `checkNoLeak` (p2–p5, s2, p15, p16, kck_kal, drill), `checkA7`. Pasangan kunci tidak mengulang paket lain. Sebaran huruf sementara A10 B7 C11 D5 E7 → **blok berikutnya harus banyak D, sedikit C/A**.
- **KP 48 pkg 14** (`bank/pribadi/kp-sim4-01.json`, id KP-xx-501..508): per aspek 1L+2K+1KR favorable dan unfavorable, `check-bank-pribadi.ts` lolos; 5 butir yang mirip bank lama (≥ 0,59) ditulis ulang. Pemeriksa kemiripan: `<SP>/sim.py kp|sk <file>`.

**Codex (jalan di background saat sesi berhenti):**
- **Codex-1** numerik pkg 19 → `prisma/data/kecerdasan_p19_num.json` (29 butir 57–64, 76–96). Brief `<SP>/codex/codex-1-numerik.md`, pemeriksa `<SP>/codex/cek-num.ts`, log `log-1.txt`, laporan `out-1.md`.
- **Codex-2** SK 63 pkg 14 → `bank/pribadi/sk-sim4-01.json` (sudah tertulis dan lolos `check-bank-pribadi`, isi BELUM diaudit). Brief `<SP>/codex/codex-2-sk.md`, log `log-2.txt`, laporan `out-2.md`.

**File berubah (belum commit):** `scripts/generate-kecermatan-simulasi.ts`, `lib/kecermatan-symbols.test.ts`, `prisma/data/bank_soal_p12.json`, `public/kecermatan-simulasi/p12/` (40 SVG), `public/kecermatan-siluet/` (10 ikon baru), `prisma/data/kecerdasan_p19_teks.json`, `bank/pribadi/kp-sim4-01.json`, `docs/rencana/simulasi-4.md`, LOG ini. Dari Codex: `kecerdasan_p19_num.json`, `sk-sim4-01.json`.
**Bukan milik sesi ini, jangan ikut commit:** `app/components/engines/EngineKecerdasan.tsx`, `app/exam.css`, `output/pribadi-sim2/3-review.html`.

`<SP>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/edaa6288-8cab-46ec-9e1f-69ae526e2d38/scratchpad`

**Langkah berikut (Sesi 2):**
1. Pastikan Codex-1/2 selesai (`out-1.md`, `out-2.md` ada). Bila Codex-1 hilang/gagal, jalankan ulang brief yang sama.
2. Audit Codex-1: `npx tsx <SP>/codex/cek-num.ts` harus SEMUA LOLOS, baca 29 pembahasan, cek pengecoh = kesalahan bernama, deret dihitung ulang. Gabung ke `kecerdasan_p19_teks.json` lalu hapus `_num.json`.
3. Audit Codex-2: baca 63 butir SK (dimensi/sub, kunci A 31–32, 4 pasang kembar, A-7 termasuk "operasi/satuan/komando", pembahasan 2–3 kalimat + Tips), jalankan `<SP>/sim.py sk sk-sim4-01.json`.
4. Claude: silogisme 43–50 (SIL_V3, sebaran §4.8), wacana logika 65–75 (A4/B4/C3, brute force di `cek-wacana-kal.ts`), KCK 97–100 (4 jenis, 4 kunci beda, pola `kecerdasan_kck_kal.json` + `check-kecerdasan-kck.ts`). Kunci: perbanyak D.
5. Manifest `bank/pribadi/paket-14.json` (KP blok per aspek, SK acak, kembar berjarak ≥ 10), cek `npx tsx scripts/seed-pribadi-paket.ts 14` (dry run).
6. Codex-4 (read-only) cek buta SK 14 setelah audit.

### Prompt lanjutan
```
Lanjutkan Ultra Plan Simulasi Penuh 4 (kartu 4) di psiko-cat.
Baca HANYA: docs/rencana/simulasi-4.md §0–§3 dan entri "Sesi 1" di docs/rencana/simulasi-4-LOG.md.
Pedoman: PEDOMAN_UTAMA §4 + §5 + §10 (cukup barisnya), PEDOMAN_SIMULASI_KECERDASAN §4.5, §4.7, §4.8, PEDOMAN_ENGINE_PRIBADI §3.1–3.2 + §4.2.
Status: Kecermatan 12 SELESAI; verbal pkg 19 (1–25) + KP 48 pkg 14 SELESAI; Codex-1 (numerik p19) dan Codex-2 (SK 63) dijalankan di background sesi 1 — cek hasilnya dulu.
Kerjakan Sesi 2 sesuai "Langkah berikut" di LOG: audit Codex-1/2, silogisme + wacana logika + KCK pkg 19, manifest paket-14.json, lalu Codex-4 cek buta SK.
Aturan: split dengan Codex, berhenti ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push" (jangan ikut commit EngineKecerdasan.tsx, exam.css, output/pribadi-sim*-review.html).
```

## Sesi 2 — 2026-10-13 (titik aman: semua teks pkg 19 + Kepribadian 14 selesai)

**Selesai:**
- **Audit Codex-1** (numerik 57–64, 76–96): `cek-num.ts` SEMUA LOLOS; 29 pembahasan dibaca, semua angka pengecoh dihitung ulang dan cocok dengan kesalahan bernamanya, stem bebas A-7. Digabung ke `kecerdasan_p19_teks.json`, `_num.json` dihapus.
- **Audit Codex-2** (SK 63, `sk-sim4-01.json`): 63 butir dibaca; proporsi dimensi sesuai §3.1, kunci A32/B31, 4 pasang kembar (D1/D2/D3/D5) dengan posisi ditukar, `sim.py` tidak menemukan kemiripan ≥ 0,55. Satu-satunya temuan A-7 ada di metadata `dimensi.D5.aturan` ("jalur komando") → diganti "jalur resmi" (butir lain tidak memakai field ini).
- **Silogisme 43–50** (SIL v3 §4.8): kategorikal 43/45/46 (45 premis negatif), MP 44, MT 48, rantai + kontraposisi 47, jebakan sesat pikir 49 (3 premis), jebakan "tidak dapat dipastikan" 50 (kalimat terbatas pada pertanyaan, bukan "tidak ada kesimpulan" umum). Kunci D B E B D E D B.
- **Wacana logika 65–75** (konvensi pkg 4/5: solusi tunggal, tiap syarat perlu, soal "syarat dihapus"): `p19wLOKER` (loker 2 × 3), `p19wHALTE` (urutan halte bus), `p19wPIKET` (guru × hari × mapel, 5 entitas). Brute force ditambahkan di `scripts/cek-wacana-kal.ts` → lolos. Kunci E D B D · E D B A · E D C.
- **KCK 97–100**: `kecerdasan_kck_kal.json["19"]` + model di `check-kecerdasan-kck.ts` (`V3["19"] = "DBAE"`): TABEL kursi aula (D), YATIDAK porsi nasi goreng kantin "pasti tidak" (B), ALJABAR kelipatan 4x+6y (A), GABUNG umur dengan persamaan setara (E). SVG tabel dibuat ulang lewat `generate-kecerdasan-kck-kal.ts` (hanya menambah). Checker lolos.
- **Teks pkg 19 lengkap 77 butir** (1–25, 43–50, 57–100): `checkTeks`, `checkNoLeak`, `checkA7` lolos. **Sebaran kunci sementara A20 B20 C20 D20 E20** → 23 butir gambar (26–42, 51–56) harus seimbang, ±4–5 per huruf.
- **Manifest `bank/pribadi/paket-14.json`**: dibuat `compose-pribadi-paket.ts 14 14` (stok tak terpakai hanya butir sim4), label "Simulasi 4"; kunci A 32; `seed-pribadi-paket.ts 14` (dry run) lolos.
- **Codex-4 cek buta SK 14**: 63/63 sama dengan kunci, tanpa unsur kepolisian. 7 kalimat yang ditandai ambigu/janggal diperbaiki (D8-502, D8-505, D8-507, D5-502, D7-501, D4-509, D6-501); `check-bank-pribadi` + dry run lolos ulang. Hasil: `<SP2>/qa/codex-sk14.md`.

**File berubah sesi ini (belum commit):** `prisma/data/kecerdasan_p19_teks.json`, `prisma/data/kecerdasan_kck_kal.json`, `scripts/cek-wacana-kal.ts`, `scripts/check-kecerdasan-kck.ts`, `bank/pribadi/sk-sim4-01.json`, `bank/pribadi/paket-14.json`, LOG ini. Ditambah file sesi 1 (lihat atas). Tidak ada tulis DB.
**Bukan milik rencana ini, jangan ikut commit:** `app/components/engines/EngineKecerdasan.tsx`, `app/exam.css`, `output/pribadi-sim2/3-review.html`.

`<SP2>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/1929e792-0963-46ee-8911-145ab68c75d4/scratchpad`

**Langkah berikut (Sesi 3):**
1. Gambar pkg 19 (Claude): mosaik 26–27 (2 gaya baru, G-10), matriks 28–30, rotasi 31–32 (kiral), susun benda nyata 33–34, analogi gambar 35–36, ikon 37, denah 38–42 (peta A 2 ARAH + 2 RUTE, peta B 1 ROTASI; `19` di PKGS/PB/NEW), bundar angka 51–54 + huruf 55–56; semua dengan `pembahasan_svg`. File: `figural-kal-19.ts`, `figural-kal-bundar-19.ts`. Kunci 23 butir ini seimbang ±4–5 per huruf.
2. Integrasi seed: tambah 19 ke `V3` di `seed-kecerdasan-kal.ts`, jalankan `--check 19` (dry run).
3. Codex-4 cek buta teks pkg 19 (tanpa kunci) → `<SP2>/qa/codex-19.md`; Sonnet cek buta gambar dari PNG → `<SP2>/qa/sonnet-gambar-19.md`; QA visual 360/520 px.
4. Pemilik cek localhost; commit hanya setelah "commit dan push". `SIMULASI_PAKET[4]` diisi pemilik.

### Prompt lanjutan
```
Lanjutkan Ultra Plan Simulasi Penuh 4 (kartu 4) di psiko-cat.
Baca HANYA: docs/rencana/simulasi-4.md §0–§3 dan entri "Sesi 2" di docs/rencana/simulasi-4-LOG.md.
Pedoman: PEDOMAN_UTAMA §4 + §6 (G-1..G-10) + §10, PEDOMAN_SIMULASI_KECERDASAN §3 (Logis/Spasial 26–50) + §4.1, §4.2, §4.4, RULES GENERATE SOAL SPASIAL.md.
Status: semua teks pkg 19 (77 butir, kunci A–E masing-masing 20) + KCK + Kepribadian 14 (KP 48, SK 63, paket-14.json) SELESAI dan lolos cek; Codex-4 SK 63/63 cocok.
Kerjakan Sesi 3 sesuai "Langkah berikut" di LOG: gambar pkg 19 (figural, susun, denah, bundar) + pembahasan_svg, integrasi seed --check 19, lalu cek buta teks (Codex) dan gambar (Sonnet).
Aturan: split dengan Codex, berhenti ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push" (jangan ikut commit EngineKecerdasan.tsx, exam.css, output/pribadi-sim*-review.html).
```

### Sesi 2 — lanjutan setelah ganti akun (2026-10-13)
Pemilik ganti akun di tengah Sesi 2; pekerjaan dilanjutkan di session baru (scratchpad `1243f3b0-…`). Isi KCK "19" ditulis ulang dengan model dan kunci sama (DBAE). SK-D8-501 opsi A diganti "Menunggu rekan menyusun kerangka lebih dulu", karena versi lama "mengajak rekan" bertabrakan dengan kunci SK-D8-504. Cek buta Codex ulang: 63/63 cocok.
Cross-check akhir lolos semua: teks p19 (`checkTeks` 21 numerik, `checkNoLeak`, `checkA7`), `cek-wacana-kal.ts`, `check-kecerdasan-kck.ts` (24), `check-bank-pribadi.ts` (624 KP + 819 SK), `lib/kecermatan-symbols.test.ts` (12.500), kemiripan KP/SK sim4 < 0,55, paket-14 (111 unik, A 32, kembar jarak 11–33, opsi kunci kembar identik, posisi ditukar). Dry run `seed-pribadi-paket.ts 14` tidak bisa dijalankan ulang di session ini (diblok izin karena menyentuh DB).

## Sesi 3 — 2026-10-13 (titik aman: figural 8 + denah 5 selesai; bundar ditolak)

Prasyarat 0a.1 terpenuhi: pkg 4/5 sudah di-commit (`1f64ed1`).

**Selesai:**
- **Denah 38–42**: `19` ditambah ke `PKGS`/`PB`/`NEW` di `generate-kecerdasan-denah-kal.ts`. Paket lama byte-identik (dibandingkan JSON sebelum/sesudah). Hasil: 38 ARAH 3D · 39 ARAH 2A · 40 RUTE 3B · 41 RUTE 3E · 42 ROTASI 270° 2C.
- **Figural 28–32, 35–37** (`scripts/figural-kal-19.ts`, dipasang di `generate-kecerdasan-figural-kal.ts`; paket lama byte-identik): 28 XOR jari-jari (2E) · 29 panah ↺ + titik dikali + bingkai Latin (3B) · 30 urutan lapisan bergeser + terdalam hitam + titik = sisi bangun luar (3D) · 31 cermin diagonal (2A) · 32 putar 90° ↺ + kecil 180° + pindah ke seberang (3C) · 35 besar ↔ kecil bertukar peran + pindah sudut + putar ↻ (3D) · 36 sisi −1 + warna bertukar + satelit ↺ (3C) · 37 titik dalam = titik luar (2A; ciri lain terbagi 3/2, diassert). Semua `pembahasan_svg` tanpa id, render 520 px dicek dan teks 28/32 dibetulkan setelah dicek di render. `tsc` bersih.
- **Bundar 51–56 (Codex-5)**: `scripts/figural-kal-bundar-19.ts` lolos assert, tetapi **DITOLAK**. Angkanya tidak wajar untuk psikotes: 164/656, "÷ 2 + 137", "√ + 183", pusat ≈ 550, opsi 2954 (opsi yang terlalu menonjol membocorkan kunci, D-3). File belum dipasang ke generator dan harus ditulis ulang. Brief: `<SP3>/codex/bundar-19.md`, laporan: `bundar-19.out.md`.

**Rencana kunci 23 butir gambar** (sudah terpakai: denah + figural). Sisa: 26 C · 27 A · 33 E · 34 B, bundar 51 D · 52 B · 53 C · 54 E · 55 A · 56 B. Total gambar A5 B5 C5 D4 E4.
**Tingkat**: sedang = 28, 31, 37, 39, 42, bundar 51, 55 (7). Mosaik, susun 33–34, dan bundar lain HOTS → 40/60.

`<SP3>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/7bb9110b-7b2f-46d7-bfda-3e11bd5289de/scratchpad`

**File berubah sesi ini (belum commit):** `scripts/figural-kal-19.ts` (baru), `scripts/figural-kal-bundar-19.ts` (baru, ditolak), `scripts/generate-kecerdasan-{figural,denah}-kal.ts`, `prisma/data/kecerdasan_{figural,denah}_kal.json`, `output/{figural,denah}-kal-preview.html`, LOG ini. Tidak ada tulis DB.

**Langkah berikut (Sesi 4):**
1. Bundar 51–56 ditulis ulang (Claude, atau Codex dengan brief yang lebih ketat): angka ≤ 100 (hasil kali ≤ 200), aturan wajar seperti pkg 5, opsi berdekatan dengan kunci, tanpa opsi yang menonjol. Kunci/tingkat tetap seperti di atas. Pasang `BUNDAR19_ITEMS` di generator + render 520 px.
2. Mosaik 26 (C) dan 27 (A) di `figural-mosaik.ts`, `pkg: 19`, gaya baru G-10: kombinasi yang belum dipakai, mis. `{lembut, panel}` dan `{oktagon, tipis, chevron}` (pkg 4: oktagon/panel, bulat/papan; pkg 5: lembut/tipis, kotak/papan). Aturan gerak baru (bukan ULAR/DIAGONAL/LOMPAT/KONVEYOR/CINCIN SUDUT/SILANG/GESER KOSONG). Gaya baru perlu prototipe disetujui pemilik (G-5).
3. Susun 33 (E) dan 34 (B), HOTS, benda nyata baru (bukan kereta/feri/traktor/pinisi), pola `susun-benda-45.ts` → `generate-kecerdasan-susun-kal.ts`.
4. Tambah `assert` pkg 19 di generator figural; `V3.add(19)` di `seed-kecerdasan-kal.ts`, lalu `--check 19` (dry run).
5. Codex-4 cek buta teks pkg 19 → `<SP3>/qa/codex-19.md`; Sonnet cek buta gambar dari PNG → `<SP3>/qa/sonnet-gambar-19.md`; QA 360/520 px.
6. Pemilik cek localhost + setujui gaya mosaik; commit hanya setelah "commit dan push". `SIMULASI_PAKET[4]` diisi pemilik.

### Prompt lanjutan
```
Lanjutkan Ultra Plan Simulasi Penuh 4 (kartu 4) di psiko-cat.
Baca HANYA: docs/rencana/simulasi-4.md §0–§3 dan entri "Sesi 3" di docs/rencana/simulasi-4-LOG.md.
Pedoman: PEDOMAN_UTAMA §4 + §6 (G-1..G-10) + §10, PEDOMAN_SIMULASI_KECERDASAN §3 (Logis/Spasial 26–50) + §4.1, §4.2, §4.4, RULES GENERATE SOAL SPASIAL.md.
Status: teks pkg 19 + Kepribadian 14 selesai (Sesi 2). Gambar: denah 38–42 dan figural 28–32, 35–37 (figural-kal-19.ts) selesai dan terpasang; bundar-19 dari Codex DITOLAK (angka tidak wajar).
Kerjakan Sesi 4 sesuai "Langkah berikut" di LOG: bundar 51–56 ulang, mosaik 26–27 (gaya baru, prototipe ke pemilik), susun 33–34, assert + seed --check 19, lalu cek buta teks (Codex) dan gambar (Sonnet).
Aturan: split dengan Codex, berhenti ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push" (jangan ikut commit EngineKecerdasan.tsx, exam.css, output/pribadi-sim*-review.html).
```

### Keputusan pemilik 2026-10-13 (setelah Sesi 3): tier pkg 19 = 20 sedang / 80 HOTS
Alasan: makin jauh nomor simulasi, makin sulit soalnya, khususnya spasial. Assert di `seed-kecerdasan-kal.ts` sudah diubah (`pkg === 19 ? [20, 80] : [40, 60]`).
**Alokasi** (menggantikan rencana tingkat di Sesi 3):
- **Gambar 23 butir: semua HOTS.** Figural 28, 31, 37 ditulis ulang ke HOTS (3–4 lapis); butir HOTS figural lain dinaikkan ke 4 lapis bila memungkinkan. Denah: peta A 4 HOTS, ROTASI 180° (ubah syarat tier `NEW` khusus 19 di `generate-kecerdasan-denah-kal.ts`; paket lama harus tetap byte-identik). Bundar semua aturan 2 langkah. Mosaik dan susun HOTS.
- **Teks: 20 sedang** (1, 6, 11, 16, 20, 43, 44, 45, 57, 59, 65, 66, 69, 76, 77, 79, 81, 83, 91, 97). **13 butir naik ke HOTS** dan ditulis ulang supaya benar-benar lebih sulit, bukan hanya diganti labelnya: 3, 8, 13, 18, 23, 46, 62, 70, 73, 85, 88, 93, 98. Kunci tetap, kecuali kalau penulisan ulang memaksa kunci berubah; sebaran harus tetap seimbang. Ulangi checker (`checkTeks`, `cek-wacana-kal.ts` untuk 70/73, `check-kecerdasan-kck.ts` untuk 98).
Langkah Sesi 4 ditambah: (0) naikkan 13 butir teks + 3 figural, sebelum bundar/mosaik/susun.

### Prompt lanjutan (Sesi 4, menggantikan prompt Sesi 3)
```
Lanjutkan Ultra Plan Simulasi Penuh 4 (kartu 4) di psiko-cat.
Baca HANYA: docs/rencana/simulasi-4.md §0–§3, entri "Sesi 3" dan "Keputusan pemilik 2026-10-13" di docs/rencana/simulasi-4-LOG.md.
Pedoman: PEDOMAN_UTAMA §4 + §6 (G-1..G-10) + §7 + §10, PEDOMAN_SIMULASI_KECERDASAN §3 (Logis/Spasial 26–50) + §4.1, §4.2, §4.4, RULES GENERATE SOAL SPASIAL.md.
TARGET WAJIB pkg 19: 80 butir tingkat 3 (HOTS) + 20 butir tingkat 2, tanpa tingkat 1. Assert di seed-kecerdasan-kal.ts sudah 20/80 untuk pkg 19.
Status: teks pkg 19 + Kepribadian 14 selesai (Sesi 2), tetapi teks masih 33 sedang. Gambar: denah 38–42 dan figural 28–32, 35–37 (figural-kal-19.ts) terpasang; bundar-19 dari Codex DITOLAK (angka tidak wajar).
Kerjakan berurutan:
0. Naikkan ke tingkat 3: 13 butir teks (3, 8, 13, 18, 23, 46, 62, 70, 73, 85, 88, 93, 98), ditulis ulang supaya benar-benar lebih sulit, bukan hanya diganti labelnya; figural 28, 31, 37 ditulis ulang ke HOTS (minimal 3 lapis); denah pkg 19 semua HOTS (ROTASI 180°, paket lama byte-identik). Ulangi checker teks/wacana/KCK.
1. Bundar 51–56 ulang (angka ≤ 100, aturan 2 langkah, semua HOTS).
2. Mosaik 26–27 (gaya baru G-10, prototipe ke pemilik) dan susun 33–34 (benda nyata baru), semua HOTS.
3. Pasang semua di generator + assert pkg 19, V3.add(19), seed --check 19 harus lolos dengan 20 sedang + 80 HOTS dan kunci ≤ 24% per huruf.
4. Cek buta teks (Codex) dan gambar (Sonnet); QA 360/520 px.
Aturan: split dengan Codex, berhenti ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push" (jangan ikut commit EngineKecerdasan.tsx, exam.css, output/pribadi-sim*-review.html).
```

## Sesi 4 — 2026-10-13 (titik aman: langkah 0 + bundar selesai)

**Selesai (belum commit, tidak ada tulis DB):**
- **13 butir teks naik ke HOTS, ditulis ulang** (`kecerdasan_p19_teks.json`, kunci tetap): 3 SIN nisbi–relatif (paronim nisbah) · 8 ANT lugas–berbelit-belit (paronim lugu) · 13 ANA seismograf : gempa = anemometer : angin · 18 ODD kaca (bukan tanah liat bakar) · 23 BAC jadi "KECUALI" (makna *diselipkan*) · 46 SIL 3 premis dengan premis negatif · 70 WAC hitung susunan tanpa syarat 4 (= 4) · 73 WAC dua hari setelah guru Biologi (Ekonomi) · 98 KCK (1) selisih dua arah, (2) n di dalam rata-rata. Numerik oleh Codex, diaudit + 2 narasi pengecoh diganti: 62 dua jalur lompatan bertambah · 85 (√144 + 2³) ÷ ½ − 3² · 88 km + m − dm → dm · 93 perbandingan berubah setelah penambahan. Teks sekarang **20 sedang / 57 HOTS**. `cek-wacana-kal.ts` (70/73 diperbarui) dan `check-kecerdasan-kck.ts` (model 98 baru; tingkat pkg 19 = [2,3,3,3]) lolos; `checkTeks` + A-7 lolos.
- **Figural 28, 31, 37 → HOTS 3 lapis** (`figural-kal-19.ts`): 28 XOR jari-jari + XOR warna pusat + kotak sudut ↻ · 31 cermin diagonal + putar 90° ↻ + balik warna (komposisi = cermin kiri–kanan, diassert) · 37 titik = sisi luar − sisi dalam (ciri tunggal terbagi ≥ 2, diassert). Render 520 px dicek. Paket lama byte-identik.
- **Denah pkg 19 = 5 HOTS** (`generate-kecerdasan-denah-kal.ts`): 39 memakai `arahBangunan` kedua (`arahArah` maksimal tier 2 → loop tanpa akhir), syarat asal + arah 38/39 beda, ROTASI k = 2 (180°). Kunci tetap 38 D · 39 A · 40 B · 41 E · 42 C. Paket lama byte-identik. Render denah belum dilihat (masuk QA).
- **Bundar 51–56 ditulis ulang oleh Claude** (`figural-kal-bundar-19.ts`, dipasang): 51 seberang = 2x − 4 (24, D) · 52 + jumlah angka (51, B) · 53 luar = 3 × dalam − 4 (17, C) · 54 pusat = (atas + kanan) × (bawah − kiri) (66, E) · 55 (nilai − 2) × 3 (54, A) · 56 lompatan +1, +2, +4, … kembali ke A (G, B). Semua HOTS, angka ≤ 100, opsi urut naik (diassert). Render 520 px dicek.

**Gambar terpasang: 19 butir pkg 19 (semua HOTS).** Sisa: mosaik 26 (C), 27 (A); susun 33 (E), 34 (B).

**File berubah sesi ini:** `prisma/data/kecerdasan_{p19_teks,kck_kal,figural_kal,denah_kal}.json`, `scripts/{figural-kal-19,figural-kal-bundar-19,generate-kecerdasan-figural-kal,generate-kecerdasan-denah-kal,cek-wacana-kal,check-kecerdasan-kck}.ts`, `output/{figural,denah}-kal-preview.html`, LOG ini.

**Langkah berikut (Sesi 5):**
1. Mosaik 26 (C) + 27 (A) di `figural-mosaik.ts`, `pkg: 19`, gaya baru G-10 (mis. `{lembut, panel}`, `{oktagon, tipis, chevron}`), aturan gerak baru, HOTS. **Prototipe ke pemilik dulu (G-5).**
2. Susun 33 (E) + 34 (B), HOTS, benda nyata baru (bukan kereta/feri/traktor/pinisi), pola `susun-benda-45.ts`.
3. Assert pkg 19 di generator figural (urutan 26–37 + 51–56, semua tingkat 3); `V3.add(19)` di `seed-kecerdasan-kal.ts` (cek `range(4, pkg − 1)` di checkNoLeak: file p6–p18 mungkin tidak ada); `--check 19` harus 20 sedang + 80 HOTS, kunci ≤ 24%/huruf.
4. Cek buta teks (Codex, read-only) + gambar (Sonnet dari PNG); QA 360/520 px.
5. Pemilik cek localhost; commit hanya setelah "commit dan push".

### Prompt lanjutan (Sesi 5)
```
Lanjutkan Ultra Plan Simulasi Penuh 4 (kartu 4) di psiko-cat.
Baca HANYA: docs/rencana/simulasi-4.md §0–§3, entri "Keputusan pemilik 2026-10-13" dan "Sesi 4" di docs/rencana/simulasi-4-LOG.md.
Pedoman: PEDOMAN_UTAMA §4 + §6 (G-1..G-10) + §7 + §10, PEDOMAN_SIMULASI_KECERDASAN §3 (Logis/Spasial 26–50) + §4.4, RULES GENERATE SOAL SPASIAL.md.
Status: teks pkg 19 = 20 sedang / 57 HOTS (selesai). Gambar terpasang 19 butir, semua HOTS (figural 28–32, 35–37; denah 38–42; bundar 51–56).
Kerjakan "Langkah berikut (Sesi 5)" di LOG: mosaik 26–27 (gaya baru, prototipe ke pemilik dulu), susun 33–34 (benda nyata baru), assert + V3.add(19) + seed --check 19 (20/80, kunci ≤ 24%), cek buta Codex + Sonnet, QA 360/520 px.
Aturan: split dengan Codex, berhenti ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; tidak menulis DB; commit hanya setelah aku bilang "commit dan push" (jangan ikut commit EngineKecerdasan.tsx, exam.css, output/pribadi-sim*-review.html).
```

## Sesi 5 — 2026-10-14 (titik aman: pkg 19 lengkap 100 butir, --check 19 lolos)

**Selesai (belum commit, tidak ada tulis DB):**
- **Mosaik 26 (C) + 27 (A)** (`figural-mosaik.ts`, prototipe disetujui pemilik): 26 PUTAR PAPAN `{lembut, panel, 0.07}` — papan berputar 90° ↻, ubin tetap tegak, warna menempel diagonal utama; 27 SUDUT LAWAN SISI `{oktagon, tipis, 0.06, chevron}` — sisi melompat ↻, sudut ↺, yang pindah berputar 180°, titik tengah balik warna. Semua HOTS.
- **Susun 33 pesawat baling-baling (E) + 34 bus tingkat (B)**: adegan baru `scripts/susun-benda-19.ts`, grid 2×3 tingkat 3. Generator susun sekarang menambah/mengganti blok `"19"` di `kecerdasan_susun_kal.json`; isi lama byte-identik (diff = +82 baris).
- **Assert pkg 19** di `generate-kecerdasan-figural-kal.ts` (urutan 26–37 + 51–56, semua tingkat 3). `seed-kecerdasan-kal.ts`: `V3 = {4, 5, 19}`, cek bocor melewati file p6–p18 yang tidak ada. **`--check 19` lolos**: 100 baru, 20/80, kunci A 25 · B 24 · C 26 · D 24 · E 24 (huruf kunci 123, batas 29).
- 70 WAC: opsi "1–5" bentrok dengan opsi soal lain di bank → "1 susunan" … "5 susunan" (kunci tetap D).
- **Cek buta Codex (teks, 73 butir): 73/73 sama dengan kunci.** Diperbaiki dari catatannya: 7 Agresif → Represif (agresif–defensif bisa dibela sebagai antonim), 8 Polos → Naif, 44/49 status subjek dinyatakan ("Dimas, seorang mahasiswa"; "Rafi adalah siswa"), 73 stem "dua hari setelah hari piket guru Biologi". 12 (susu : keju) dipertahankan: pembahasan menutup lapis "pengeringan".
- **Cek buta Sonnet (gambar, 23 butir): 21/23 sama.** Dua beda diperbaiki: **52** deret 12, 15, 21 … juga cocok dengan +3/+6 (D-1 nyata) → diganti deret 19, 29, 40, 44, 52, 59, 73, ? = 83, **kunci jadi C** (opsi 76 · 80 · 83 · 87 · 94); **37** pola warna → titik menunjuk d → a jadi 6−3 ≠ 2 titik, e (5, 4, 1, hitam); assert warna-tidak-menentukan-titik ditambah. Render 520 px dicek.
- QA render 360/520 px semua 23 gambar (`scratchpad/qa/img/`); 26, 41, 42 dilihat langsung: terbaca.

**Catatan Sonnet yang belum ditindak (keputusan pemilik):** 35 dinilai sangat sulit (tukar peran + putar 90°); 33 gambar potongan atas/bawah kurang koheren di ukuran kecil; 53 angka lingkaran dalam kecil di 360 px; 42 letak label rumah tidak konsisten (atas/bawah ikon); 27 opsi a vs e hanya beda warna titik tengah (memang pengecoh "tengah tidak berganti warna").

**Kunci gambar pkg 19:** 26 C · 27 A · 28 E · 29 B · 30 D · 31 A · 32 C · 33 E · 34 B · 35 D · 36 C · 37 A · 38 D · 39 A · 40 B · 41 E · 42 C · 51 D · 52 C · 53 C · 54 E · 55 A · 56 B.

**File berubah sesi ini:** `scripts/{figural-mosaik,figural-kal-19,figural-kal-bundar-19,generate-kecerdasan-figural-kal,generate-kecerdasan-susun-kal,seed-kecerdasan-kal}.ts`, `scripts/susun-benda-19.ts` (baru), `prisma/data/kecerdasan_{figural_kal,susun_kal,p19_teks}.json`, `output/{figural,susun}-kal-preview.html`, LOG ini.

**Langkah berikut (Sesi 6):**
1. Pemilik putuskan catatan Sonnet (35, 33, 53, 42) — ubah atau biarkan.
2. Pemilik cek localhost (pkg 19 belum di DB: perlu `--apply 19` oleh pemilik/izin eksplisit, lalu Kepribadian 14 dan Kecermatan 12 sesuai rencana §0).
3. `tsc` + `next build --webpack`; commit hanya path sendiri setelah "commit dan push".

### Prompt lanjutan (Sesi 6)
```
Lanjutkan Ultra Plan Simulasi Penuh 4 (kartu 4) di psiko-cat.
Baca HANYA: docs/rencana/simulasi-4.md §0–§3 dan entri "Sesi 5" di docs/rencana/simulasi-4-LOG.md.
Status: Kecerdasan pkg 19 lengkap 100 butir, --check 19 lolos (20/80), cek buta Codex + Sonnet selesai dan beda sudah diperbaiki.
Kerjakan "Langkah berikut (Sesi 6)": keputusan catatan Sonnet, tsc + build, siapkan apply (tanpa menulis DB kecuali aku izinkan).
Aturan: berhenti ±120k token di titik aman lalu tulis entri LOG + prompt lanjutan; commit hanya setelah aku bilang "commit dan push" (jangan ikut commit EngineKecerdasan.tsx, exam.css, output/pribadi-sim*-review.html).
```

## Sesi 6 — 2026-10-14 (titik aman: siap apply, menunggu izin pemilik)

**Selesai (belum commit, tidak ada tulis DB):**
- `tsc --noEmit` lolos; `next build --webpack` lolos.
- Dry run: `seed-kecerdasan-kal.ts --check 19` lolos (100 baru, kunci A25 B24 C26 D24 E24); `seed-pribadi-paket.ts 14` komposisi lolos (48 KP + 63 SK). Kecermatan 12: `prisma/data/bank_soal_p12.json` + `public/kecermatan-simulasi/p12/` ada; `seed-kecermatan-packages.ts` **tidak punya dry run** (langsung menulis DB).

**Keputusan catatan Sonnet (pemilik setuju):** 35, 27, 42 dibiarkan. 53: angka cincin dalam 22 → 26 px (opsi baru `innerSize` di `pie`, `figural-lib.ts`; bawaan tetap, paket lain tidak berubah). 33 tidak diubah: garis potong tidak digambar, render 360 px terbaca. `--check 19` + tsc lolos ulang.

**Apply 2026-10-14 (izin pemilik):** pkg 19 → 100 soal KECERDASAN; Kepribadian 14 → 111 baris; Kecermatan 12 → 500/500. Sisa: pemilik isi `SIMULASI_PAKET[4]`, cek localhost, "commit dan push".

**Perintah apply (hanya setelah izin):**
1. `npx tsx scripts/seed-kecerdasan-kal.ts --apply 19`
2. `npx tsx scripts/seed-pribadi-paket.ts 14 --apply`
3. `npx tsx scripts/seed-kecermatan-packages.ts 12`
4. Pemilik isi `SIMULASI_PAKET[4] = { KECERDASAN: 19, KEPRIBADIAN: 14, KECERMATAN: 12 }` di `lib/test-config.ts`, cek localhost, lalu "commit dan push".
