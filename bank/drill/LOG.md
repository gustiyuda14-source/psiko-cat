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

## Batch 10 — Modul Mr Badrun (MB, 50) · 2026-10-11

Sumber: `FILE PSIKO POLRI 2026 /Modul Soal SKD BKN & Psikotes POLRI Kedinasan ( mr badrun ).pdf`, 10 kategori × 5 soal (kode `MB`, id `<kartu>-MB-<nomor urut 001–050>`, `sumber` = `MB#<kategori>.<soal>`). Atas perintah pemilik: dimasukkan apa adanya, **tanpa adaptasi dan tanpa cek buta** (keabsahan dijamin mentor); status `resmi`.
Sebaran: K09 +15 (kategori 1 deret huruf, 2 deret angka, 3 alfanumerik dalam matriks — sub-tipe baru `ANL-DRT-ALFANUM`, tabel 1 baris) · K07 +10 (kategori 4 posisi kedalaman — sub-tipe baru `NUM-CRT-BULAT` ×5; kategori 10 rasio uang ×4 + persentase ×1) · K06 +15 (kategori 5 massa, 6 persamaan waktu, 8 konsumsi bahan & sisa) · K05 +5 (kategori 7 pecahan) · K08 +5 (kategori 9 silogisme; 9.1/9.3/9.4/9.5 `LOG-SIL-KONDISIONAL` sesuai label mentor, 9.2 `KATEGORI`).
Yang berubah dari sumber: koma desimal (3.5 kg → 3,5 kg); pembahasan ditulis ulang ke 2 paragraf (langkah mentor dipertahankan, ditambah alasan tiap opsi gugur); **posisi opsi diacak** — di sumber 34 dari 50 kunci ada di A, pola yang bisa ditebak; opsi tidak diubah isinya. Tier ditentukan Claude (tidak ada di sumber). Format `P1/P2` dipertahankan; premis dipisah baris baru di `stem`.
**Temuan sumber — satu kunci salah:** 10.4 (rasio 2 : 3 : 5, Candra − Bima = Rp120.000). Pembahasan sumber benar sampai 1 bagian = Rp60.000, lalu "2 × 60.000 = Rp80.000" (seharusnya Rp120.000). Kunci sumber A (Rp80.000) **tidak dipakai**; kunci di bank = Rp120.000 (opsi D sumber). `hitung` di build mengonfirmasi. Mohon dikonfirmasi ke Mr Badrun.
Verifikasi: `hitung` build mencocokkan 45 soal hitungan (kategori 1–8, 10) dengan kunci — semua cocok setelah koreksi 10.4. Kategori 9 (logika) tidak punya `hitung`, kunci sama dengan sumber. Tidak ada cek buta (diminta tidak ada).

## Batch 11 — Deret Lingkaran: K09 ANL-DRT-LINGKARAN (30) · 2026-10-11

Sumber `AK26#2`: info peserta tes Akpol 2026 — soal deret tahun ini disajikan dalam bentuk lingkaran, cara pengerjaan sama. Contoh asli belum ada, jadi 30 soal ditulis baru dalam empat tata letak (prototipe disetujui pemilik): A keliling tanpa titik mulai (001–008; tier 3 tanpa panah arah), B juring dengan MULAI (009–015), C angka tengah = suku pertama (016–023), D dua kosong P/Q selang-seling (024–030). Tier 2 ×15, tier 3 ×15. Gambar SVG dari generator scratchpad gen_k09_lingkaran.py; kunci dicek ulang dari data gambar (urutan diputar dari titik putus) dan `hitung`.
Cek buta Codex (membaca koordinat SVG, tanpa kunci): 29/30 sama. K09-AK-001 dijawab 36 — salah hitung pemeriksa (36 + 12 ≠ 46); dikerjakan ulang: 34, yakin. Semua 30 "ganda". Bila contoh soal asli dari peserta sudah ada, sesuaikan tata letaknya.

## Batch 12 — Bahasa Panda: K10 ANL-KODE-PANDA (20) · 2026-10-11

Atas permintaan pemilik, `ANL-KODE` dipecah: K10-A3-074 → `ANL-KODE-HURUF` (nilai huruf), K10-A3-075 → `ANL-KODE-PANDA` (bahasa panda). 20 soal baru `K10-N-001`–`020` (sumber `baru`, struktur A3#75): tier 1 ×6 (tiga kalimat dua kata), tier 2 ×7 (tiga kata, urutan acak, eliminasi berantai), tier 3 ×7 (sandi tidak dapat ditentukan ×2, kata majemuk dua bagian dengan urutan tetap ×2, hitung kata yang pasti ×1, eliminasi empat langkah ×2). Generator scratchpad gen_k10_panda.py memuat solver: semua pemetaan sandi → arti yang konsisten dihitung, jawaban harus sama di semua pemetaan dan tepat satu opsi yang cocok (opsi dibandingkan sebagai himpunan kata, jadi urutan lain tidak menjadi kunci kedua).
Cek buta Codex (tanpa kunci): 19/20 sama. K10-N-011 dijawab D, padahal alasannya sendiri "riku = ibu, sani = ke, beru = sekolah" (= opsi A); dikerjakan ulang: A, yakin. Semua 20 "ganda".

## Batch 13 — Denah & Arah Mata Angin: K17 FIG-DENAH-ARAH (30) + FIG-DENAH-RUTE (20) · 2026-10-11

Kartu baru K17 (aspek analitis), mengikuti Claude Doc "Pedoman Penyusunan Bank Soal Denah & Arah Mata Angin" (riset di `../docs/research_notes/Bank soal denah arah mata angin/`). Korpus internal tidak punya soal denah bergambar, jadi semua soal baru (`K17-N-001`–`050`, sumber `baru`) dari `scripts/generate-denah-k17.ts` (seed tetap, bisa direproduksi).
Format: 10 peta (`public/drill/img/K17-peta-01..10.svg`, 3×3 blok, 2 jalan tegak + 2 mendatar, kompas 8 arah, atas = Utara), 5 soal per peta: 2 ARAH pilih bangunan, 1 ARAH pilih arah, 2 RUTE "bangunan pertama di kiri/kanan setelah belokan terakhir" (1–3 belokan). Definisi bangunan, sisi kiri/kanan, dan titik acuan ditulis di `instruksi`.
Aturan generator: arah = titik tengah ke titik tengah ikon, kunci ≤ 10° dari pusat sektor dan keempat sudut ikon target di sektor yang sama; pengecoh ARAH ≥ 35° dari pusat sektor kunci dan diberi nama kesalahan (tetangga, cermin kiri-kanan, cermin atas-bawah, berlawanan, terputar 90°); pengecoh RUTE = kiri/kanan tertukar, belokan terakhir dibalik, lurus tanpa belok, bangunan kedua. Opsi arah urut searah jarum jam; posisi kunci 10/10/10/10/10. Tier: ARAH pokok 1, diagonal 2, diagonal + ≥ 2 pengecoh tetangga 3; RUTE 1 belokan menghadap U/T = 1, ada arah hadap Selatan atau 3 belokan = 3.
Cek buta Codex (membaca koordinat SVG, tanpa kunci): 45/50 sama. Lima beda dikerjakan ulang tanpa kunci: alasan kelimanya sama dengan kunci (048 Selatan 176,5°; 024/034 gedung lebar di pojok terlewat; 050 sisi tertukar); 029 dan 034 alasan benar tetapi huruf opsi salah tulis. Semua 50 "ganda".
Belum: sub-tipe LEWAT, RELASI, ROTASI, INGAT (rencana pedoman tahap berikutnya); uji coba statistik butir.
Revisi pembahasan K17 (2026-10-11, atas permintaan pemilik): pembahasan ditulis ulang untuk siswa — paragraf 1 Langkah 1–3/4, paragraf 2 "Kenapa yang lain salah" per opsi dengan bahasa sehari-hari (atas/kanan-bawah, "hampir benar", "kiri-kanan tertukar"), paragraf 3 gambaran nyata tugas polisi (HT patroli, laporan kebakaran, memandu ambulans) + tips. Baris dipisah `\n`; DrillSession merender pembahasan `whitespace-pre-line`. Tiap soal punya `gambar_pembahasan` (data/drill-pembahasan/K17-N-xxx.svg): peta dipudarkan, acuan biru, jawaban hijau + panah, satu pengecoh "hampir benar" merah putus-putus; soal rute menggambar jalur bernomor dengan arah hadap tiap belokan. Gambar pembahasan tegak diperbesar (`q-figure-tall`). Stem/opsi/kunci tidak berubah (generator menyimpan status `ganda` hanya bila ketiganya identik). Tata letak soal bergambar: teks rata atas (sebelumnya rata tengah → ruang kosong besar).

## Batch 14 — Denah: K17 FIG-DENAH-LEWAT (30) + FIG-DENAH-RELASI (30) · 2026-10-11

Lanjutan pedoman K17 (sub-tipe prioritas 2). `K17-N-051`–`110`, peta 11–22 (peta 12, 16, 20 padat 17–20 bangunan untuk tier 3); mesin peta dipisah ke `scripts/denah-k17-peta.ts`, peta 1–10 dan 50 soal lama identik (dicek byte).
LEWAT: "banyaknya bangunan yang dilalui" jalur 1–3 ruas; definisi di `instruksi` (kedua sisi jalan, tanpa awal/tujuan, pojok belokan dihitung sekali). Generator menolak jalur yang ambigu: bangunan yang badannya sejajar titik awal/tujuan, ruas tanpa bangunan, dan tujuan yang menempel ke ruas sebelumnya (jalur memutar). Opsi angka urut naik; pengecoh = satu sisi saja, awal/tujuan ikut dihitung, lapangan/taman/kolam ikut, ruas terakhir terlupa, pojok dihitung dua kali, ±1/±2. RELASI: pojok persimpangan (blok diagonal, sel sudut yang menempel ke simpang) dan "di antara Jl. A dan Jl. B + berbatasan dengan sisi X Jl. C" (tepat satu bangunan memenuhi). Pembahasan + gambar pembahasan gaya batch 13 (jalur bernomor + bangunan dihitung bernomor; arsir daerah "di antara").
Cek buta Codex: putaran 1 51/60 (empat salah tulis huruf, isi sama). Lima beda diperiksa: 059/086/087/092 kunci benar; 077 cacat desain (tujuan di seberang titik awal, jalur memutar) → aturan tolak jalur memutar, 26 soal berubah. Putaran 2 (26 soal): 23/26; 073 Codex hanya satu sisi jalan, 106/107 melewatkan bangunan satu blok dengan titik awal; dikerjakan ulang dengan daftar per sisi: 3/3 sama. Semua 60 "ganda".

## Batch 15 — Denah gaya hitam-putih: K17 ARAH (30) + RUTE (30) · 2026-10-12

Permintaan pemilik: "angin segar", tidak templat grid berwarna (Pura dll.), hitam-putih seperti soal cetak. Mesin peta baru `scripts/denah-k17-bw.ts`: 2–3 jalan tegak + 2–3 mendatar berjarak acak, sebagian berhenti di jalan lain (pertigaan/jalan buntu), jalan bergaris tepi dengan nama di dalam badan jalan, bangunan siluet hitam berjajar di tepi jalan (16–22 per peta), set nama baru (KUA, KUD, Gd. Serbaguna, SD Cendekia, Bengkel, Apotek, Koperasi …; nama jalan/rumah sengaja berbeda dari soal ab.school). Prototipe 6 peta disetujui pemilik sebelum soal dibuat.
`K17-N-111`–`170`, peta 23–34 (5 soal/peta: ARAH pilih bangunan + pilih arah, RUTE 1–3 belokan). RUTE ditulis ulang untuk jaringan tidak seragam: belokan hanya ke sisi jalan yang berlanjut, sisi bangunan dihitung dari jarak tepi siluet ke tepi badan jalan, kunci ditolak bila bangunan pertama dan kedua terlalu berdempet. Pembahasan + gambar pembahasan gaya batch 13 (cincin di badan bangunan). 110 soal lama identik.
Cek buta Codex: 55/60. Lima beda (115 kiri/kanan tertukar, 123/154 memilih bangunan kedua, 170 bangunan di belakang persimpangan, 148 Barat Laut dibaca Barat Daya) dikerjakan ulang dengan koordinat dan daftar per sisi: 5/5 sama dengan kunci. Semua 60 "ganda". K17 kini 170 soal: ARAH 60, RUTE 50, LEWAT 30, RELASI 30 (target pedoman empat sub-tipe ini tercapai).

## Batch 16 — Denah: K17 FIG-DENAH-ROTASI (15) · 2026-10-12

Sub-tipe ROTASI (rencana `docs/rencana/drilling/06-ultra-plan-k17-rotasi-ingat.md`), mesin hitam-putih saja. Generator dipecah dulu: helper bersama + RUTE hitam-putih pindah ke `scripts/denah-k17-soal-bw.ts` (bank + SVG lama identik byte setelah pindah). `K17-N-171`–`185`, fase D seed `9100+m*97`, kunci 3 per huruf.
R1 peta tidak menghadap Utara (peta 35/36/37 = Utara di kanan/bawah/kiri; 2 pilih bangunan + 1 pilih arah per peta): peta digambar biasa, hanya kompas yang diputar (label tetap tegak, tidak bertabrakan); kompas diperbesar 1,5× supaya terbaca di HP, peta ditolak bila ada bangunan di bawah kompas. Kunci dihitung di bingkai kompas (bangunan diputar balik −k×90°), aturan sektor sama dengan ARAH. Pengecoh wajib "arah layar" (atas peta dianggap Utara) + satu pengecoh per arah. Tier 90°/270° = 2, 180° = 3. Gambar pembahasan: kompas kecil biru di titik acuan (ikut berputar), panah hijau ke jawaban, panah merah putus-putus ke jebakan "atas = U?" (disetujui pemilik sebagai ganti peta diputar balik).
R2 berputar di tempat (peta 38–39, Utara di atas): 45/90/135/180/270°, searah/berlawanan jarum jam, pilih bangunan atau pilih arah. Pengecoh: arah putar terbalik, kurang/lebih satu langkah 45°, setengah putaran, arah awal, kebalikan arah akhir (satu per arah). Tier: kelipatan 90° searah jarum jam = 2, lainnya 3. Gambar pembahasan: busur putar di titik acuan + panah ke jawaban.
Instruksi ROTASI sendiri ("arah ditentukan oleh kompas; peta bisa saja tidak menghadap Utara" + urutan 8 arah searah jarum jam). Pembahasan gaya batch 13.
Cek buta Codex: 14/15. 173 (peta Utara di kanan) Codex memutar peta ke arah sebaliknya (Tenggara, padahal Barat Daya), persis jebakan yang dirancang; dikerjakan ulang dengan koordinat huruf kompas: sama dengan kunci. Semua 15 "ganda". K17 kini 185 soal.

## Batch 17 — Denah: K17 FIG-DENAH-INGAT (15) + fase "Hafalkan peta" · 2026-10-12

Sub-tipe INGAT (rencana `docs/rencana/drilling/06-ultra-plan-k17-rotasi-ingat.md`), prototipe disetujui pemilik. Field baru `tampil_detik` (bulat 5–60, hanya soal bergambar; divalidasi `build-drill-bank.ts`, ikut `SafeDrillItem`). DrillSession: soal ber-`tampil_detik` yang belum dijawab dibuka dalam fase hafal (instruksi + peta + hitung mundur + tombol "Saya sudah hafal", stem/opsi disembunyikan, pembaca layar diberi tahu per 5 detik); waktu habis → peta diganti kotak "Peta disembunyikan", soal muncul, waktu jawab dihitung sejak itu; setelah Periksa peta + gambar pembahasan tampil. Pindah soal mengulang fase hafal soal yang belum dijawab; kartu lain tidak berubah. Diverifikasi lokal (screenshot hafal → jawab → pembahasan).
`K17-N-186`–`200`, peta hitam-putih 40–42 (fase E seed `9900+m*97`, generator soal `scripts/denah-k17-ingat.ts`): peta 40 14–16 bangunan tier 1 25 detik, peta 41 16–18 bangunan tier 2 20 detik, peta 42 18–22 bangunan tier 3 15 detik. Per peta 2 ARAH pilih bangunan, 2 sisi jalan ("berbatasan langsung dengan sisi X Jl. Y"), 1 bangunan tepat di sebelah (sisi jalan yang sama). Pengecoh: satu per arah (ARAH); sisi seberang, sisi sama di jalan sejajar, bangunan jauh dari jalan (> 40 px, bukan yang hampir menempel); tetangga arah sebaliknya, bangunan kedua, seberang jalan. Tetangga "tepat di sebelah" ditolak bila terpisah jalan atau > 95 px. Pembahasan memuat strategi hafal per jalan (chunking), gambaran nyata saksi/apel/TKP.
Cek buta Codex (memakai peta): 15/15 sama. Semua 15 "ganda". K17 selesai: 200 soal (ARAH 60, RUTE 50, LEWAT 30, RELASI 30, ROTASI 15, INGAT 15).

## Batch 18 — Hitung cepat metode praktis: K05 NUM-HIT-TRIK-* (20) · 2026-10-13

Tujuan: peserta paham *kenapa* trik hitung cepat bekerja. `K05-N-001`–`020`, sumber `baru`, generator scratchpad `gen_k05_trik.py`. Empat sub-tipe baru (label kategori di `lib/drill-cards.ts`): TRIK-KALI ×6 (kuadrat akhiran 5, kali 11, basis 100 bawah/atas, kali 125, selisih kuadrat), TRIK-PERSEN ×5 (persen dibalik, jangkar per 8, komplemen, naik-turun berantai 1 − p², faktor sama/distributif), TRIK-BAGI ×5 (bagi 5/25/125 = kali 2/4/8 geser koma, cek angka satuan, cek sembilan), TRIK-TAMBAH ×4 (kompensasi, 1.000 − n "semua dari 9 terakhir dari 10", pasangan genap, geser bersama). Tier 7/8/5.
Pembahasan paragraf 1 = tiga baris: "Cara cepat" (langkah), "Kenapa bisa" (bukti aljabar ringan, mis. (10a + 5)² = 100·a(a + 1) + 25), "Cara biasa" (pembanding, kenapa lebih lambat). Paragraf 2 = gugur per opsi (tiap pengecoh = kesalahan khas metode: lupa simpan, kekurangan dijumlah bukan dikali, geser koma salah, naik-turun dianggap impas) + Jawaban + Tips. Opsi angka urut naik di sekitar kunci, posisi kunci 4/4/4/4/4. Soal cek satuan / cek sembilan sengaja opsi berbeda hanya di digit yang dicek.
Cek buta Codex: 20/20 sama. Semua 20 "ganda".
