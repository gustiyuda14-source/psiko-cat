# Log infus bank drill

## Batch 1 — K05 Hitung Cepat (33) + K06 Konversi Satuan (23), 2026-10-10

Sumber: Bintara P3 (B3), AKPOL P3 (A3), Bintara P2 (B2). Semua soal diadaptasi (angka/kata diubah), kunci dihitung ulang oleh `hitung` di build.
Pemeriksa kedua: Codex CLI mengerjakan 56 soal tanpa melihat kunci (2026-10-10) — 56/56 sama, semua yakin → status `ganda`.

Perbaikan terhadap sumber:
- B3#41 (sisa 3²¹ : 9¹⁰): sumber tidak punya opsi benar (sisanya 0). Diganti soal siklus sisa 2²⁵ : 7.
- B3#57, B3#59: sumber punya dua opsi benar (x < y dan x ≤ y). Opsi ≤ dihapus; B3#55 sengaja dibuat menguji ≥ (kesamaan di x = 0).
- B3#37: "tidak lebih dari" dibuat menguji batas sama-dengan (√(9/16) = 3/4).

Tidak diinfus di batch ini:
- KD1–KD4, KD15, KD16: duplikat B2#42, 43, 50, 51, 72, 1.
- KD9–KD12 (limit, invers, integral, program linier): di luar profil psikotes POLRI.
- A3#44, A3#45, A3#46, A3#50: strukturnya sama dengan B2#58, B2#51, B2#61, B2#59 yang sudah diadaptasi.
- A3#35, A3#38: belum ditranskrip (menyusul bila kartu K05 butuh tambahan tier 1).

## Batch 2 — K09 Deret Angka & Huruf (16) + K10 Angka dalam Gambar (17), 2026-10-10

Sumber: B3#71–80, A3#51–60, A3#74–75, B2#71–83. Semua angka/huruf diganti; gambar K10 digambar ulang sebagai SVG vektor (`public/drill/img/K10-*.svg`, tajam di resolusi berapa pun).

Perbaikan terhadap sumber:
- B3#79 (jajar genjang 9, 27, 81 → 16, ?, 100): sumber tidak punya opsi benar (pola menghasilkan 40). Diadaptasi dengan rasio konsisten (4, 12, 36 → 5, ?, 45).
- Soal angka-dalam-gambar hanya memberi satu contoh, sehingga beberapa aturan bisa cocok. Angka contoh dipilih supaya aturan alternatif yang wajar gugur, dan pembahasan menyebut aturan alternatif itu beserta hasilnya pada contoh.
- A3#74 (pengurangan kata berkode) aturannya tidak jelas di sumber; diganti kode nilai huruf A = 1 … Z = 26 yang dijelaskan di soal.
- A3#75 (bahasa buatan): susunan kata dibuat konsisten (benda lalu sifat) supaya hanya satu jawaban yang sah.

Tidak diinfus: A3#56 (aturan tidak dapat dipastikan dari satu contoh), A3#61 (duplikat B3#45, sudah di K05), B2#80 dan B2#83 sumber (aturan tidak jelas; B2#83 diganti aturan kali silang yang dijelaskan).

Hasil cek buta Codex batch 2: 32/33 sama kunci. K10-B3-080: aturan Codex sama (√(610−441)=13), hanya salah tulis huruf — kunci tetap E. K10-A3-059: Codex menilai ambigu (tambahan +3,+4,+5 tidak terkait operand) — soal diganti aturan 2a+b (unik untuk 3 contoh linear), dicek ulang Codex: A (37) sama. Semua 33 dinaikkan ke "ganda".

## Batch 3 — K07 Soal Cerita (34) + K08 Silogisme (22) · 2026-10-10

Sumber: B3 61–66, 68, 69; A3 26–34; B2 62–70; Rute 1, 3–9 (K07) · B3 81–85; A3 76–85; B2 84–90 (K08). Adaptasi ringan (nama, angka, konteks diganti; struktur dan sub-task sama).
Dibuang: B3 67 (tanda fungsi rasional) dan B3 70 (sistem barisan) — di luar profil psikotes; Rute 2 (urutan kunjungan desa) — kalimat sumber tidak cukup untuk satu jawaban.
Temuan sumber: B3#66 tidak ada opsi benar (1/3 + 1/4 − 1/4 → 66,67%, tidak ada di opsi) · B3#68 punya dua solusi (2136 dan 3126), diganti aturan unik (2468) · B3#83, A3#78, A3#82, A3#84, A3#85 tidak ada kesimpulan yang sah secara formal di opsi sumber — ditulis ulang dengan kesimpulan sah (A3#82 jadi soal "tidak dapat disimpulkan") · B2#90 opsi "sebagian di kantor" ikut benar — diganti.
Verifikasi: K07 kunci cocok `hitung` (34/34). Cek buta Codex: 54/56 sama. K07-B3-066 ("tidak diterima di kedua jurusan" bisa berarti tidak keduanya sekaligus) dan K08-B2-089 (merah vs kuning tidak eksplisit saling meniadakan) dinilai ambigu — stem diperjelas, dicek ulang Codex: sama, tidak ambigu. Semua 56 dinaikkan ke "ganda".

## Batch 4 — K01 Sinonim & Antonim (48) + K02 Analogi Kata (24) + K03 Kata Ganjil (6) + K04 Pemahaman Bacaan (20) · 2026-10-10

Sumber: B3 1–16, A3 1–12, B2 1–20 (K01) · B3 17–21, 23, 24; A3 13–19; B2 21–30 (K02) · A3 20–25 (K03) · B3 25–35, B2 31–39 (K04). Adaptasi ringan: kata stem dan opsi diganti, sub-task dan tingkat sama. Format pilih-dua A3 (sinonim/antonim/analogi dua titik-titik) dipertahankan (`kunci` 2 huruf). Semua wacana ditulis ulang total dengan tempat/tim fiktif (Kabupaten Lembah Hijau, liga voli antarkecamatan, Kota Tirta Raya); tidak ada teks Katadata/Republika, merek, atau tokoh nyata. Tabel klasemen B3 32–35 ditulis sebagai teks di stem (angka menang/kalah dibuat konsisten).
Wacana masuk `stem` dengan penanda paragraf (1), (2), (3) karena layar drill merender stem sebagai satu paragraf dan belum ada kolom wacana.

Dibuang: B3#22 (API : LIDAH — tiga opsi sumber membentuk kata majemuk yang sah: bibir pantai, jari-jari roda, mata air) · B2#40 (pertanyaan hilang, mencetak stem #39 dan merujuk "gambar 1" yang tidak ada) · KD16 (duplikat B2#1).
Temuan sumber: B3#2 opsi D dan E sama-sama "Tukar tambah" · B3#4 "KOMPULASI" tidak baku (diganti KOMPILASI) · B3#30 dua pernyataan SALAH (B dan E) · A3#10, A3#11 (Percaya/Yakin >< Skeptis), A3#12 masing-masing punya lebih dari satu pasangan antonim · A3#21 butuh pengetahuan klub sepak bola, A3#22 (saluran cerna) dan A3#20 kategorinya kabur — diganti kategori yang tegas · B2#1, #2, #7 punya dua padanan yang mirip (penyakit/wabah, peleburan/persatuan, ilusi/maya) · B2#11, 13, 14, 15, 19 antonim ganda (sesuai 04 §3) · B2#30 opsi merek (KIA/TOYOTA) diganti mata uang · B2#33, #35–37 pertanyaan hilang; jenis pertanyaannya direkonstruksi dari opsi sumber · B2#39 opsi A, C, D bersaing di sumber, versi baru hanya satu yang sah.
Cek buta Codex (98 soal, tanpa kunci): 97/98 sama dan yakin. K04-B3-031 (PALING MUNGKIN penduduk 2024) dinilai ambigu karena teks tidak menyatakan pertumbuhan bertahap — pertanyaan diperjelas ("terus bertambah setiap tahun sesuai arah proyeksi"), dicek ulang Codex: A, yakin. Semua 98 dinaikkan ke "ganda".

## Batch 5 — K11 Wacana Logika (17) · 2026-10-10

Sumber: B3 86–90 (urutan kunjungan, jadwal konsultasi) · A3 62–73 (urutan nilai, irisan kesukaan, tabel permen, urutan finis, seleksi dua penilaian). Bacaan ditulis ulang (nama, tempat, atribut); bacaan memakai field `bacaan` (syarat sebagai baris "•").
Verifikasi: setiap set di-brute-force (scratchpad tools/gen_k11.py); kunci = satu-satunya opsi yang terbukti benar, generator gagal bila 0 atau ≥2.
Temuan sumber: B3#89–90 daftar pasien P–V tetapi syarat memakai W · A3#66 dua opsi benar (Tomi & Sandy dan Sandy & Sally sama-sama "jumlah rasa sama") — diganti "rasa yang persis sama" · A3#70–73 urutan kepintaran Claire vs Nanako tidak ditentukan sehingga #71 dan #72 tidak tunggal, dan atribut "cantik" diganti "komunikasi/ketelitian"; ditambah syarat pengunci dan aturan tanpa seri · B3#88 opsi sumber memuat lebih dari satu pasangan sah di versi adaptasi — opsi diganti.
Cek buta Codex: 15/17 sama; K11-A3-071/073 dinilai ambigu ("tidak lebih baik" mengizinkan seri) — ditambah "tidak ada dua kandidat dengan peringkat yang sama", dicek ulang set 70–73: 4/4 sama. Semua 17 "ganda".

## Batch 6–7 — Figural: K12 (23), K13 (12), K14 (7) · 2026-10-10

**K12 Pola & Matriks Gambar** — sumber A3 91–97, B3 96–100, B2 98–99, KD19 (= B2 100), P1 asli 26/27/28/31/32/33/35/36. Digambar ulang sebagai SVG vektor dari model data sel (generator scratchpad tools/gen_k12a.py, gen_k12b.py); kunci dihitung dari aturan, aturan dicek pada baris lengkap, opsi dibuktikan berbeda, soal putaran dibuktikan kiral (cerminan diputar ke sudut mana pun tidak berimpit, titik kembar dicocokkan tanpa urutan; margin ≥ 43 unit). QA visual per soal di lembar kontak.
Temuan sumber: A3#91 arah aturan tidak konsisten antarbaris · A3#95 aturan baris 2 tidak sama · A3#96 posisi BC muncul dua kali · B3#97 dua opsi lolos uji putaran · B3#100 huruf opsi salah (seharusnya J L M O) · P1#26 dan P1#31 satu sel melanggar pola · P1#35 tidak ada opsi sesuai putaran 135°. Semua diganti versi yang konsisten. Cacat versi awal kami yang tertangkap QA: pola titik B3#98 ternyata simetris (cerminan berimpit dengan putaran) — diganti pola hasil pencarian kiral.
**K13 Ikon Kategori** — dipotong dari render 300 dpi PDF sumber (B3 92–95, A3 86/87/88/90, B2 91/94/95/97); pemetaan soal dan opsi A–E dicek per soal. Dibuang: B3#91 (logo partai, pasangan untuk "?" tidak jelas), A3#89 (kategori olahraga tidak tegas), B2#92 (dua bendera Asia), B2#93 (foto bencana buram, kategori kabur), B2#96 (gedung bisa kantor/rumah sakit/sekolah). Sumber tanpa kunci; kunci ditentukan Claude.
**K14 Susun Potongan** — dipotong dari PDF (P1 29/30/34/37 kunci resmi, A3 98–100 tanpa kunci). Kunci A3 dibuktikan dengan menyusun ulang pita sesuai kunci. Opsi cacat sumber diganti: P1#34 E (potongan 2 dobel) dan A3#100 A (potongan 2 dobel).
Pemeriksa kedua: Codex kena batas pakai, jadi diganti subagent Claude buta (hanya melihat PNG soal+opsi, tanpa akses kunci). Hasil 40/42 sama. K14-P1-037 dan K14-A3-099 berbeda — dibuktikan dengan menyusun ulang potongan dalam kedua urutan: kunci membentuk gambar utuh, jawaban pemeriksa terputus (gambar sumber buram). K13-B2-095 ragu (ketapel genggam vs pelontar batu) — instruksi diperjelas "senjata modern dengan fungsi yang sama", dicek ulang: sama. Semua 42 "ganda".
Pemeriksa ketiga (Codex, setelah batas pakai reset; membaca kode SVG K12): 20/23 sama. Tiga beda adalah salah baca transform SVG oleh Codex: K12-B3-098 (dihitung ulang langsung dari file SVG opsi: hanya E = putaran murni 240° dari gambar asli), K12-B2-098 (Codex membalik sisi belahan cermin; render menunjukkan hati = kiri garis tepi, kanan hitam → C), K12-B3-100 (Codex ragu soal arah kubah; aturan "bangun yang turun dibalik" terlihat pada segitiga → B). Kunci tetap.

## Batch 8 — PSIKO R 2025 (PR, 55) + K15 Sikap Kerja (SK, 63) · 2026-10-10

**PR** = `PSIKO R 2025_250410_123845.pdf` (kode `PR`; `R` sudah dipakai Rute). Isi 1–36 dan 49–67; 37–48 tidak ada di sumber. Sebaran: K01 +20 (PR 1–20), K02 +10 (21–30), K05 +5 (31–35), K07 +8 (36, 49–53, 65, 66), K08 +10 (55–63, 67), K11 +2 (54, 64). Adaptasi ringan; generator scratchpad gen_pr.py.
Temuan sumber: #6 (iuran) dan #15 (biasa) kunci kabur, #19 (reaksi) tanpa antonim yang sah, #29 analogi tiga kata ambigu, #34 kunci 7/8 hanya tertulis 14/16, #57 dan #63 tidak ada kesimpulan sah di opsi, #61 premis bertabrakan — semua ditulis ulang dengan tepat satu jawaban sah.
**K15 Sikap Kerja** (kartu baru, aspek `sikap`, 2 opsi a–b): sumber `5_6172464214532164661.pdf` (= juga `KEPRIBADIAN 2026.jpeg` butir 30–59). Kunci = dekode docs/rencana/drilling/03 §3.1. Stem dan opsi diparafrasakan, posisi A/B ditukar pada butir no % 3 == 2 (sebaran 33:30). Butir kontradiktif di sumber (15, 41, 44, 46, 56, 59, 60) diberi stem yang lebih spesifik supaya selaras dengan aturan dimensinya, tier 3, dan catatan di pembahasan. Generator scratchpad gen_sk.py.
Status: PR `hitung`/`tunggal`, K15 `tunggal` — belum ikut build rilis sampai dicek pemeriksa kedua.
Cek buta (subagent Claude, tanpa akses kunci): PR 55/55 sama; K08-PR-055 dinilai ragu (opsi D "beberapa paus … berdarah panas" ikut sah bila "semua" ⇒ "beberapa") — opsi D diganti "Beberapa paus tidak memiliki jantung beruang empat.", dicek ulang: C, yakin. K15: pemeriksa mencocokkan opsi adaptasi dengan opsi kunci di PDF sumber — 63/63 sama, 0 ragu. Semua 118 dinaikkan ke "ganda".

## Batch 9 — K16 Kecukupan Data (KC, 20) · 2026-10-11

Kartu baru, aspek `logika` (sub_type `LOG-KCK-NILAI` 10, `-YATIDAK` 6, `-URUTAN` 2, `-3P` 1 … lihat file). Sumber `FILE PSIKO POLRI 2026/KECUKUPAN DATA/`: Paket 1 (kode `KC1`, 10 soal) dan Paket 2 (`KC2`, 10 soal, level 4–7); kunci resmi dari PDF pembahasan, dicek ulang Claude — 20/20 cocok, tidak ada cacat sumber.
Adaptasi ringan: konteks, nama, dan angka diganti dengan hasil kecukupan yang sama (kunci per nomor = kunci sumber, sebaran 4/4/4/4/4). Susunan dan bunyi opsi yang berbeda-beda per soal dipertahankan (ciri sumber: peserta harus membaca bunyi opsi, bukan menghafal huruf); label pernyataan/keterangan/petunjuk/data/fakta/informasi juga dipertahankan. KC2#3 pertanyaan diganti dari "urutan kedua" ke "urutan ketiga". Tier: KC1 1–2, KC2 level 4–5 = 2, level 6–7 = 3.
Format: konteks di `bacaan`, tabel/nota di `tabel`, pertanyaan + pernyataan bernomor di `stem` dengan baris baru (DrillSession merender stem `whitespace-pre-line`; stem drill lain tidak memuat baris baru). Sketsa persegi panjang sumber tidak digambar; p dan l didefinisikan di teks. Generator scratchpad gen_k16.py.
Verifikasi: 9 soal yang rawan (urutan, sisa bagi, kombinasi kemasan, bilangan bulat, ya/tidak) di-brute-force — semua cocok. Cek buta Codex (tanpa kunci): 20/20 sama, 0 ragu. Semua 20 "ganda".

## Batch 9 — Alokasi Waktu & Delegasi: K07 NUM-CRT-ALOKASI (16) + K11 ANL-WCN-JADWAL (4) · 2026-10-11

Sumber `AK26#1`: soal delegasi tugas yang dilaporkan peserta tes Akpol 2026 (waktu 16.30–17.30, empat tugas 15/25/35/20 menit, tugas mana yang didelegasikan). Kalimat sumber tidak dipakai; 20 varian ditulis baru dengan konteks piket, posko, asrama, panitia. Sub-tipe baru `NUM-CRT-ALOKASI` (docs/rencana/drilling/02).
Varian: tier 1 delegasi satu tugas, kunci "semua bisa", sisa/kurang waktu (K07-AK-001–005) · tier 2 rentang lintas jam, jeda wajib, jumlah tugas maksimal, sisa waktu (006–011) · tier 3 delegasi dua tugas, dua orang bekerja paralel, rekan lebih lambat (012–016) · K11 dua set bacaan dengan syarat urutan, tenggat, dan jeda (K11-AK-001–004).
Pembahasan: Langkah 1..n + Cek di paragraf 1; setiap pengecoh gugur dengan angka bukti; Tips dengan strategi "kelebihan = total − waktu tersedia" dan target waktu (75 detik K07, 90 detik K11).
Proses: 4 penulis subagent paralel (skrip brute-force per soal) → pemeriksa buta 1 + reviewer pembahasan → revisi → pemeriksa buta 2.
Temuan putaran 1: pemeriksa buta 19/20; K07-AK-008 dijawab D karena stem tidak menyatakan tugas boleh terpotong rapat — ditambah "Pekerjaan yang terpotong … boleh dilanjutkan sesudahnya" (juga 009, 013) dan "paling lambat pukul". Reviewer: kunci "pilih satu tugas" selalu tugas terpanjang/terpanjang kedua (bisa ditebak) — 002, 003, 006, 007 diberi kriteria "durasi paling singkat yang cukup" dengan ≥ 2 tugas yang cukup (kunci 006/007 = terpanjang ketiga); opsi 014 membocorkan kunci lewat pola 2–4 vs 3–3 — pengecoh diganti; K11 klaim jam "pasti" yang tidak terkunci diganti "misalnya"; target 60 detik soal kedua set dihapus (pickSet mengacak urutan).
Cek buta 2 (subagent baru, tanpa kunci): 20/20 sama, semua yakin. Semua 20 "ganda".
