# Ultra Plan — Simulasi Penuh Paket 5 (kartu 5) + Alokasi Waktu & Sebab-Akibat di kartu 3–5 + drill K18

2026-10-14 (rev. 5) · Status: **RENCANA, belum ada yang dibangun** · Log sesi + prompt lanjutan: `simulasi-5-LOG.md` (dibuat saat sesi 1 berhenti).

Rev. 2: pemilik minta **5 soal Alokasi Waktu** (tipe "waktu senggang 16.30–17.30, tugas mana yang didelegasikan", menurut klaim peserta paling sering muncul di psi AKPOL) masuk ke Simulasi 5, dan Simulasi 3 + 4 di-reshape supaya ikut memuatnya (§2.4).
Rev. 3: tingkat pkg 20 = **10/90**; Kecermatan 13 = **salinan** kolom menengah Spasial Dasar latihan (§2.3); soal Alokasi ditulis dengan **susunan seperti screenshot peserta** (§2.4a).
Rev. 4: pemilik minta tipe **Hubungan Sebab-Akibat dua pernyataan** (format "(1) … (2) …", 5 opsi baku) masuk Simulasi 5. Tipe ini belum ada di bank mana pun (drill maupun paket). Ditaruh 3 butir di pkg 20 slot 73–75, wacana C dilepas (§2.5).
Rev. 5 (keputusan pemilik): kedua screenshot peserta wajib terwakili. (a) **Sebab-Akibat** 3 butir juga di kartu 3 (pkg 15) dan kartu 4 (pkg 19), swap wacana C (§2.5a). (b) Bentuk **"delegasi terbaik"** (screenshot Andi 120 menit: opsi berupa strategi, bukan nama tugas) jadi 1 dari 5 butir Alokasi di tiap kartu 3–5 (§2.4b). (c) **Kartu drill baru K18 Sebab-Akibat** (30 butir) + 10 butir strategi delegasi di K07 (§2.6). Distribusi komposisi diserahkan ke Claude.

## 0. Ringkasan

| Bagian | package_number | Isi | Catatan |
|---|---|---|---|
| Kecerdasan kartu 5 | **20** | 100 butir baru, layout **v4** (§2.1) | 5 Alokasi Waktu di 88–92; **3 Sebab-Akibat di 73–75**; gambar spasial lebih sulit dari pkg 19 |
| Kepribadian kartu 5 | **15** | 48 KP + 63 Integritas & Kejujuran, **bank baru penuh** | `bank/pribadi/kp-sim5-01.json`, `sk-sim5-01.json`, manifest `paket-15.json` |
| Kecermatan kartu 5 | **13** | 10 kolom × 50, **salinan** kolom VI–X Spasial Dasar p509 + p510 (level menengah) | keputusan pemilik 2026-10-14 (§2.3) |
| Reshape kartu 4 | Kecerdasan **19** (live) | 5 butir → Alokasi Waktu (88–92) + 3 wacana C → Sebab-Akibat (73–75), ditukar di tempat | layout jadi v4; tingkat diwarisi; kunci diwarisi kecuali slot Sebab-Akibat (§2.5a) |
| Reshape kartu 3 | Kecerdasan **15** (live) | 5 butir → Alokasi Waktu + 3 wacana C → Sebab-Akibat (73–75), ditukar di tempat | slot Alokasi ditentukan dari isi DB (§2.4) |
| Drill | — (bank drill, bukan DB) | **K18 Sebab-Akibat** 30 butir baru + K07 10 butir strategi delegasi | rilis terpisah lewat `npm run build:drill`, tidak menunggu kartu 5 (§2.6) |

Kartu 5 terbuka otomatis setelah `SIMULASI_PAKET[5] = { KECERDASAN: 20, KEPRIBADIAN: 15, KECERMATAN: 13 }` **diisi pemilik** dan bank 20 + 15 + 13 ada di DB.

## 0a. Keputusan pemilik

| Kode | Pertanyaan | Usulan Claude | Status |
|---|---|---|---|
| **K-1** | Kecermatan 13: salin dari latihan atau gambar baru? | — | **diputuskan**: salin Spasial Dasar level menengah |
| **K-2** | Kecermatan: paruh seimbang atau naik terus? | — | gugur: 10 kolom satu level (menengah) |
| **K-3** | Tingkat Kecerdasan 20 | — | **diputuskan: 10 / 90** |
| **K-5** | Paket sumber Kecermatan 13 | p509 + p510 kolom VI–X (paket terakhir di carousel, paling jarang dikerjakan) | default Claude, pemilik boleh ganti |
| **K-4** | Kartu 1 (pkg 18) dan kartu 2 (pkg 17) juga **belum** memuat Alokasi Waktu maupun Sebab-Akibat. Ikut di-reshape? | Ya, dengan pola yang sama (§2.4), supaya kelima kartu setara | **diputuskan** 2026-10-14: **tidak**, kartu 1–2 tetap seperti sekarang |
| — | 5 Alokasi Waktu di Simulasi 5, reshape kartu 3 dan 4 | — | **diputuskan** 2026-10-14 |
| — | Sebab-Akibat masuk Simulasi 5 | — | **diputuskan** 2026-10-14 |
| **K-6** | Jumlah Sebab-Akibat per kartu | 3 butir di 73–75, wacana C dilepas utuh | **diputuskan** 2026-10-14 (ikut usulan) |
| **K-7** | Sebab-Akibat juga di kartu 3 dan 4? | swap wacana C pkg 15/19 (§2.5a) | **diputuskan** 2026-10-14: ya |
| **K-8** | Kartu drill khusus? | K18 Sebab-Akibat 30 butir + strategi delegasi masuk K07 (§2.6) | **diputuskan** 2026-10-14: ya |
| **K-9** | Bentuk "delegasi terbaik" (screenshot Andi) di simulasi? | 1 dari 5 butir Alokasi per kartu 3–5 (§2.4b) | **diputuskan** 2026-10-14 (distribusi diserahkan ke Claude) |

## 0b. Prasyarat

1. Simulasi 4 sudah live (`f0a1ac5`). Worktree bersih kecuali `output/pribadi-sim*-review.html` (bukan milik rencana ini, jangan ikut di-commit).
2. Wajib dibaca di awal tiap sesi: `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md` (A-7, §4 D-1..D-5, §5, §6 G-1..G-10, §10), lalu lampiran modul yang dikerjakan sesi itu: `PEDOMAN_SIMULASI_KECERDASAN.md` v3, `PEDOMAN_ENGINE_PRIBADI.md` (§1.1a, §3, §4.1–4.2, §6, §7.4), `PEDOMAN_SIMULASI_KECERMATAN.md`, `RULES GENERATE SOAL SPASIAL.md`.
3. Acuan gaya: figural `figural-kal-19.ts`, bundar `figural-kal-bundar-19.ts`, susun `susun-benda-19.ts`, mosaik `figural-mosaik.ts` (G-10). Acuan Alokasi Waktu: drill `bank/drill/kecerdasan/K07-soal-cerita.json` sub-tipe `NUM-CRT-ALOKASI` (K07-AK-001..016) dan `K11-wacana-logika.json` `ANL-WCN-JADWAL` (K11-AK-001..004). Bentuk soalnya dipelajari dari sana, tetapi ceritanya tidak boleh disalin (§2.4). Acuan Sebab-Akibat: hanya screenshot peserta (Kelasbimbel, "pelanggaran rambu / kesadaran pengendara"); belum ada acuan di repo, topik screenshot tidak boleh dipakai (§2.5). Acuan "delegasi terbaik": screenshot peserta (Bimbel Sitalolo, Andi 120 menit sebelum ujian); topik ujian/review/sarapan tidak boleh disalin (§2.4b).

## 1. Cara kerja (sama dengan Simulasi 4)

- Claude dan Codex CLI bekerja paralel di bagian yang berbeda (§3). Codex tidak bisa commit, akses jaringan, atau menulis DB. Claude mengaudit diff Codex secara penuh, bukan hanya laporannya.
  - tulis: `codex exec --skip-git-repo-check -s workspace-write -C <repo> -o <out> - < <brief>`
  - cek buta: `codex exec --skip-git-repo-check -s read-only -C <dir> -o <file> - < <brief>` (input dari file / `< /dev/null`)
- Brief Codex ditaruh di `scratchpad/codex/<nama>.md` dan menyalin aturan pedoman yang relevan. Codex hanya menulis file yang disebut di brief. Cek `git status` setelah tiap job.
- **Berhenti di sekitar 120k token** pada titik aman, lalu tulis entri LOG + prompt lanjutan.
- Claude tidak menulis ke DB tanpa izin eksplisit. Commit hanya setelah pemilik mengecek localhost dan bilang "commit dan push". Commit hanya path milik rencana ini, `git push origin HEAD:main`.

## 2. Blueprint

### 2.1 Kecerdasan pkg 20 (layout v4)
Verbal 1–25 · deret mosaik 26–27 · matriks 28–30 · rotasi 31–32 · susun 33–34 · analogi gambar 35–36 · ikon 37 · denah 38–42 (peta A 2 ARAH + 2 RUTE, peta B 1 ROTASI) · silogisme 43–50 · bundar angka 51–54 + huruf 55–56 · deret angka 57–60 · deret huruf 61–64 · wacana logika 65–72 (A 4 + B 4) · **Sebab-Akibat 73–75** · **HIT 76–87** (aritmetika 76–85, konversi 86–87) · **CRT Alokasi Waktu 88–92** · CRT 93–96 · KCK 97–100.

Dibanding v3 (HIT 76–90, CRT 91–96): HIT berkurang 3 (2 aritmetika, 1 konversi) dan CRT lain berkurang 2. Kelima slot itu dipakai Alokasi Waktu. Kode tipe tetap `CRT`, ditambah penanda `"sub": "ALOKASI"`, sehingga skoring dan aspek tidak berubah. Wacana C (3 soal) dilepas utuh untuk 3 Sebab-Akibat (§2.5); slot tetap di blok Analitis 51–75.

- Tingkat 0 / **10 / 90** (keputusan pemilik 2026-10-14). 10 butir sedang ditaruh di verbal dan deret, tidak di gambar maupun Alokasi. Asersi tingkat di `seed-kecerdasan-kal.ts` khusus pkg 20. HOTS tidak menumpuk di awal blok. Kunci ≤ 24% per huruf. Tanpa unsur kepolisian (A-7).
- **Naik dari pkg 19 (gambar 26–42, 51–56, semua HOTS):** setiap butir gambar memakai minimal 1 lapis aturan lebih banyak dari butir sejenis di pkg 19. Contoh: mosaik 3 aturan serentak, matriks baris + kolom + diagonal, rotasi putar + cermin, susun 2×3 dengan potongan yang mirip satu sama lain, denah peta B dengan 2 kali belok + putar. Prototipe 1 butir per jenis diserahkan ke pemilik sebelum diproduksi massal (G-5).
- Lebih sulit tidak boleh berarti ambigu. Setiap butir tetap lolos cek buta (Q-5) dan D-1 (tidak ada jawaban kedua yang bisa dibela).
- **Anti-bocor:** stem, wacana, peta denah, objek susun, aturan figural, dan gaya mosaik tidak boleh sama dengan pkg 2–5, 13–19, KCK kal, drill K07-AK, K11-AK, maupun K16. Sebab-Akibat: topik berbeda dari screenshot peserta. Mosaik memakai 2 gaya baru yang belum dipakai pkg 4/5/15/16/19.

### 2.2 Kepribadian pkg 15
- KP 48: 6 aspek × 8 butir, dikelompokkan per aspek (§4.1). Kunci = sisi yang paling mengekspresikan aspek blok. Likert 4.
- SK 63: dimensi nilai §3.1, aspek Integritas & Kejujuran, urutan acak, butir kembar berjarak ≥ 10 (§3.2), sebaran kunci A/B seimbang.
- Semua butir **baru**. Tidak boleh ada stem yang sama dengan bank lama, termasuk `kp-sim4-01` / `sk-sim4-01`. Pembahasan per butir lengkap sesuai §7.4.

### 2.3 Kecermatan pkg 13 — salinan Spasial Dasar menengah (keputusan pemilik)
Spasial Dasar (501–510) memuat level menengah di kolom VI–X. Kecermatan 13 disalin apa adanya (5 simbol kunci + urutan 50 soal per kolom):

| Kolom pkg 13 | I | II | III | IV | V | VI | VII | VIII | IX | X |
|---|---|---|---|---|---|---|---|---|---|---|
| Sumber | p509 VI | p509 VII | p509 VIII | p509 IX | p509 X | p510 VI | p510 VII | p510 VIII | p510 IX | p510 X |

- Isi file: `prisma/data/bank_soal_p13.json` disusun dari `bank_soal_p509.json` + `bank_soal_p510.json` (kolom 6–10). Nomor kolom dan angka romawi diganti menjadi 1–10 / I–X; `nomor: 13`, `nama: "Simulasi 5 — Spasial Dasar Menengah"`. Path SVG tetap menunjuk ke `/kecermatan-spasial/p509|p510/…` sehingga tidak ada SVG yang disalin.
- Cukup satu perintah `node -e` / `jq` sekali jalan, ditambah asersi: 10 kolom × 50, setiap huruf tepat 10× per kolom, semua path SVG ada di `public/`. Tidak perlu `BLUEPRINT` maupun flag baru di `generate-kecermatan-simulasi.ts`.
- Pelafalan: simulasi tidak menampilkan label pelafalan (sama dengan p401). Pastikan JSON tidak membawa field label.
- Kalau seed atau mesin ujian memperlakukan simbol dari folder lain secara khusus, salin SVG ke `public/kecermatan-simulasi/p13/` sebagai gantinya. Ini dicek di sesi 1 sebelum memilih cara.
- **Pedoman:** tambahkan pengecualian di `PEDOMAN_SIMULASI_KECERMATAN.md` §3 dan §5 (anti-bocor), serta baris kartu 5 di §8: "kartu 5 = salinan Spasial Dasar menengah p509/p510 kolom VI–X, keputusan pemilik 2026-10-14; simbol sama dengan latihan". Catatan skoring §6: Kh paket 13 hanya dibandingkan dengan sesi paket 13.

### 2.4 Alokasi Waktu — 15 butir baru (5 per kartu 3, 4, 5)

**Bentuk inti** (sesuai contoh peserta): ada jendela waktu dalam format jam (mis. 16.30–17.30) dan daftar tugas dengan durasi dalam menit. Total durasi melebihi jendela. Peserta memilih tindakan: tugas mana yang dilepas, berapa kekurangannya, atau pukul berapa selesai. Opsi pengecoh = hasil kesalahan bernama: salah menghitung panjang jendela, melepas tugas terpanjang padahal bukan yang diminta, lupa jeda, atau opsi "semua dapat diselesaikan tanpa bantuan".

**Variasi naik per kartu** (aturan progresi):

| Kartu | Paket | 5 butir |
|---|---|---|
| 3 | 15 | 1 bentuk persis seperti contoh (delegasi 1 tugas, opsi E "tanpa bantuan") · tugas terpendek yang masih cukup · **delegasi terbaik (§2.4b)** · paling banyak berapa tugas yang selesai · 1 jeda wajib di tengah jendela |
| 4 | 19 | bentuk contoh dengan jendela tidak bulat (mis. 13.48–15.12) · jeda wajib + delegasi · sepasang tugas yang dilepas agar sisa waktu habis pas · **delegasi terbaik dengan jeda (§2.4b)** · satu tugas wajib selesai sebelum pukul tertentu |
| 5 | 20 | bentuk contoh dengan 2 jeda · dua orang paralel, selesai paling cepat pukul berapa · rekan bekerja 1,5× lebih lambat · **delegasi terbaik: dua opsi bantuan, hanya satu yang cukup (§2.4b)** · delegasi sepasang tugas + jeda |

**Aturan butir:**
- Jawaban tunggal dibuktikan oleh skrip `scripts/cek-alokasi.ts`. Setiap butir menyimpan data terstruktur (`jendela`, `jeda`, `tugas[]`, `aturan`), lalu skrip menghitung ulang semua kemungkinan dan memastikan tepat satu opsi yang memenuhi (D-1). Skrip ini juga menjadi satu-satunya test untuk logika tersebut.
- Pembahasan lengkap sesuai PEDOMAN_UTAMA: Langkah (ubah jam ke menit → total → kelebihan → cek tiap opsi) / Kenapa yang lain salah (per opsi, sebut kesalahannya) / Jawaban / Tips (cara cepat: hitung kelebihan dulu, lalu cari tugas yang menutupinya).
- **Anti-bocor:** cerita, nama, tugas, dan angka berbeda dari K07-AK-001..016, K11-AK-001..004, dan dari 14 butir alokasi lainnya. Latar netral: kantor, sekolah, panitia, posko, rumah. **Tanpa Bripda/Polsek/apel/piket polisi** (A-7), karena 5 butir drill memakai latar itu.

### 2.4a Susunan penulisan soal Alokasi (mengikuti screenshot peserta)

Setiap butir ditulis dalam 4 bagian dengan urutan yang tetap, masing-masing dipisah baris kosong:

```
Seorang staf tata usaha memiliki waktu luang pada pagi hari, yaitu dari pukul 08.15 hingga 09.25. Ia ingin memanfaatkan waktu tersebut untuk menyelesaikan beberapa pekerjaan berikut:

Mengarsipkan surat masuk: 18 menit
Memperbarui data inventaris: 27 menit
Menyiapkan bahan rapat: 31 menit
Membalas pesan orang tua siswa: 12 menit

Karena keterbatasan waktu, ia mempertimbangkan untuk meminta bantuan rekan kerja dalam menyelesaikan salah satu tugas agar pekerjaan lainnya tetap selesai tepat waktu.

Pertanyaan: Tugas manakah yang sebaiknya didelegasikan agar tugas lainnya dapat diselesaikan dalam waktu yang tersedia?
```
Opsi: frasa tindakan pendek tanpa titik, misalnya `Mengarsipkan surat masuk` … `Semua tugas dapat diselesaikan tanpa bantuan`.

1. **Konteks:** siapa + jendela waktu dalam format jam "pukul HH.MM hingga HH.MM" + kalimat pengantar yang diakhiri titik dua.
2. **Daftar tugas:** satu tugas per baris dengan format `Nama tugas: N menit`. Nama tugas memakai kata kerja berimbuhan me-. Tanpa nomor dan tanpa penjelasan.
3. **Kendala:** satu paragraf (delegasi / jeda / rekan / tenggat). Variasi kartu 4–5 (jeda, dua orang, rekan lebih lambat) ditulis di paragraf ini, tetap satu paragraf.
4. **`Pertanyaan:`** satu kalimat, diakhiri tanda tanya.
- Teks disimpan di field `q` dengan `\n`, sama seperti KCK, sehingga dirender oleh `QuestionPassage`. Field `i` berisi instruksi generik pendek.
- **Catatan render:** `QuestionPassage` menjadikan setiap baris paragraf terpisah (`space-y-3`), sehingga 4 baris tugas akan renggang, tidak rapat seperti di screenshot. Solusi termurah: tulis baris tugas dengan awalan `• ` supaya dirender sebagai daftar rapat. Akibatnya muncul titik bulat. Kalau pemilik ingin tanpa titik, ubah 1 kelas (`list-none pl-0`) untuk daftar di `QuestionPassage`, tetapi itu ikut mengubah tampilan daftar di wacana lain. Dicek dengan render 360 px di sesi 1.
- Pembahasan memakai susunan yang sama: ubah jendela ke menit → jumlahkan daftar → hitung kelebihan → cek setiap opsi.

### 2.4b Bentuk "delegasi terbaik" (screenshot Andi)

Satu butir Alokasi per kartu memakai bentuk ini. Bedanya dengan §2.4a: **opsi berupa strategi** (kalimat tindakan), bukan nama tugas. Susunan teks sama dengan §2.4a (konteks, daftar tugas, kendala, `Pertanyaan:`), dengan pertanyaan "Langkah delegasi yang paling tepat adalah …".

- **Kunci tunggal (D-1):** tepat satu opsi yang (a) benar-benar meminta bantuan orang lain, (b) menutup kekurangan waktu secara hitungan, dan (c) tidak mengorbankan kebutuhan dasar atau tujuan utama.
- **Pengecoh bernama** (pilih 4): melewatkan kebutuhan dasar (makan/istirahat); melewatkan tugas inti tanpa delegasi (hitungan cukup, tetapi bukan delegasi dan merugikan tujuan); menunda ke setelah tenggat; mengganti tugas dengan kegiatan tidak produktif; delegasi yang **tidak cukup** menutup kekurangan (pengecoh utama kartu 4–5, memaksa peserta menghitung).
- `cek-alokasi.ts`: data per opsi `{hemat_menit, delegasi, korban}`; asersi tepat satu opsi dengan `delegasi && !korban && hemat ≥ kelebihan`.
- Pembahasan: hitung kelebihan → cek tiap opsi (berapa menit dihemat, delegasi atau bukan, apa yang dikorbankan) → Jawaban → Tips ("delegasi = pekerjaan tetap jalan oleh orang lain; melewatkan bukan delegasi").
- Latar netral (A-7), bukan ujian/review/sarapan seperti screenshot.

**Reshape pkg 19 (kartu 4, live):** butir yang diganti adalah 88, 89, 90 (konversi satuan) dan 91, 92 (CRT). Hasilnya layout v4, sama dengan pkg 20. Setiap butir baru **mewarisi tingkat dan huruf kunci butir yang digantikannya**, sehingga 20/80 dan sebaran kunci A25 B24 C26 D24 E24 tetap sama dan `--check 19` tetap lolos.

**Reshape pkg 15 (kartu 3, live):** file teks pkg 15 masih memakai layout lama (HIT 76–92, CRT 93–98, KUA 99, KCK 100), sedangkan DB sudah memuat blok KCK 97–100 (memory kecukupan-data-blok). **Langkah pertama: baca baris aktif pkg 15 di DB (read-only)**, lalu pilih 5 slot dengan urutan prioritas: HIT konversi → HIT aritmetika tingkat 2 → CRT. Slot dibuat berdampingan dan diletakkan di 88–92 kalau memungkinkan. Butir baru mewarisi tingkat dan kunci butir lama, sehingga proporsi 40/60 tetap.

**Penukaran di tempat** memakai pola pkg 2 di `seed-kecerdasan-kal.ts`: butir baru disisipkan dalam keadaan nonaktif, butir lama dinonaktifkan, lalu butir baru diaktifkan. Baris lama tidak dihapus.

### 2.5 Sebab-Akibat — 9 butir baru (3 per kartu 3, 4, 5, slot 73–75)

**Bentuk** (mengikuti screenshot peserta): dua pernyataan bernomor, lalu 5 opsi **baku** yang teksnya sama di setiap butir.

```
(1) Banyak siswa datang terlambat pada hari Senin pagi.
(2) Jalan utama menuju sekolah ditutup untuk perbaikan sejak Minggu malam.
```
| Opsi | Teks baku (tanpa titik) |
|---|---|
| A | Pernyataan (1) adalah sebab dan pernyataan (2) adalah akibat |
| B | Pernyataan (2) adalah sebab dan pernyataan (1) adalah akibat |
| C | Pernyataan (1) dan (2) adalah sebab, tetapi tidak saling berhubungan |
| D | Pernyataan (1) dan (2) adalah akibat dari dua sebab yang tidak saling berhubungan |
| E | Pernyataan (1) dan (2) adalah akibat dari satu sebab yang sama |

(Contoh di atas hanya ilustrasi bentuk, kuncinya B; tidak dipakai sebagai butir.)

- **Progresi per kartu:** kartu 3 = A, B, E dengan mekanisme sebab yang langsung terlihat · kartu 4 = urutan terbalik + sebab bersama yang tersirat lewat waktu/tempat · kartu 5 = pengecoh A yang terasa wajar (dua kejadian yang hanya berbarengan) + sebab bersama yang tidak disebut.
- **Kode tipe baru `SBA`** di `kecerdasan-teks-lib.ts`: `INSTRUKSI.SBA` = "Bacalah dua pernyataan berikut, lalu tentukan hubungan sebab-akibat di antara keduanya.", 1 kunci. Field `q` berisi dua baris "(1) …\n(2) …", field `c` = 5 teks baku di atas (diasersi sama persis). Slot 73–75 tetap di blok Analitis, jadi aspek dan skoring tidak berubah.
- **Kunci:** 3 butir memakai 3 huruf berbeda dari {A, B, E}, minimal 1 butir dengan akibat ditulis lebih dulu (kunci B, jebakan urutan seperti screenshot) dan 1 butir sebab bersama (kunci E). **C dan D hanya pengecoh, tidak dipakai sebagai kunci**: kedua kategori ini paling sering diperdebatkan di sumber bimbel, sehingga sulit lolos D-1. Sebaran kunci global pkg 20 tetap ≤ 24% per huruf.
- **Aturan D-1 (wajib per butir):**
  - Kunci A/B: mekanisme sebab satu langkah, umum diterima, dan **tidak bisa dibaca dua arah** (hindari lingkaran seperti "kurang tidur ↔ sulit konsentrasi"). Uji kalimat: "(akibat) terjadi karena (sebab)" harus wajar, kebalikannya harus janggal.
  - Kunci E: sebab bersama harus jelas tersirat dari kedua pernyataan (waktu dan tempat sama, mis. sama-sama sejak listrik padam), dan (1) tidak menyebabkan (2) atau sebaliknya.
  - Tidak ada pernyataan yang bisa dibaca sebagai sebab tidak langsung dari yang lain lewat 2 langkah.
- **Tingkat:** pkg 20 ketiganya HOTS (sesuai 10/90); pkg 15/19 mewarisi tingkat slot lama (§2.5a); kesulitan dari urutan terbalik, sebab bersama yang tidak disebut, dan pengecoh A yang terasa wajar.
- **Pembahasan** (format 2 paragraf umum): Paragraf 1: uji "apakah (1) membuat (2) terjadi?", lalu kebalikannya, lalu cari sebab bersama, dengan uji kalimat "karena". Paragraf 2: tiap opsi gugur dengan alasannya, lalu Jawaban dan Tips ("akibat sering ditulis lebih dulu; jangan tertipu urutan nomor").
- **Konteks:** sekolah, rumah, kantor, pasar, lingkungan, cuaca. Tanpa unsur kepolisian dan lalu lintas pelanggaran (A-7; topik screenshot).
- **Anti-bocor:** 9 butir simulasi dan 30 butir K18 tidak boleh berbagi pasangan pernyataan atau topik.
- **Verifikasi:** tidak ada skrip (kunci bukan hitungan). Cek buta Codex-3 tanpa kunci, alasannya dibandingkan (Q-5). Satu saja jawaban yang berbeda → butir ditulis ulang, bukan diperdebatkan.

### 2.5a Swap Sebab-Akibat di pkg 15 dan 19 (kartu 3, 4)

- Slot 73–75 = wacana C (file teks: pkg 15 `p15wASAL` kunci A, B, D; pkg 19 `p19wPIKET` kunci E, D, C). **Dicek ulang ke DB (read-only) di sesi 1.**
- Wacana C dilepas utuh; wacana A dan B tidak disentuh. Slot tetap di blok Analitis.
- **Tingkat** diwarisi per slot. **Kunci** diwarisi bila hurufnya A/B/E; bila C/D, kunci Sebab-Akibat diganti A/B/E. `--swap` hanya mengizinkan perubahan kunci di slot `SBA`, dan menolak kalau hitungan satu huruf (kunci tunggal) melewati angka tertinggi yang sudah ada di paket itu. Perubahan sebaran dicatat di LOG.
- Kalau wacana C di DB ternyata bukan 73–75, pilih wacana 3-soal terakhir; jangan memotong wacana.

### 2.6 Drill: K18 Sebab-Akibat + strategi delegasi di K07

**K18 Sebab-Akibat** (kartu baru, `bank/drill/kecerdasan/K18-sebab-akibat.json`, aspek drill `logis` seperti K16):

| sub_type | Kunci | Isi | Tier 1/2/3 |
|---|---|---|---|
| `LOG-SBA-LANGSUNG` | A | sebab ditulis lebih dulu | 4/3/3 |
| `LOG-SBA-TERBALIK` | B | akibat ditulis lebih dulu | 3/4/3 |
| `LOG-SBA-BERSAMA` | E | dua akibat dari satu sebab | 3/3/4 |

- 30 butir, 5 opsi baku §2.5 (C/D hanya pengecoh). Tier 1 = topik sehari-hari, mekanisme jelas; tier 2 = sebab tidak langsung disebut; tier 3 = pengecoh berbarengan/korelasi.
- Pembahasan 2 paragraf BANK_SCHEMA + uji kalimat "karena". Paragraf 2 menjelaskan kenapa C/D gugur di butir itu.
- `rilis` = tanggal push; `sumber: "baru"`; status `ganda` setelah cek buta Codex (tanpa kunci).
- Daftar di `lib/drill-cards.ts`: `K18: { label: "Sebab-Akibat", aspek: "logis", prefix: ["LOG-SBA-"] }` + 3 kategori di `DRILL_CATEGORIES`. Taksonomi `docs/rencana/drilling/02` ditambah 3 kode.

**K07 strategi delegasi:** 10 butir baru sub_type `NUM-CRT-ALOKASI-STRATEGI` (bentuk §2.4b), tier 1/2/3 = 3/4/3, masuk kartu K07 yang sudah memuat alokasi. Kategori "Alokasi · strategi" di `DRILL_CATEGORIES`. Brute force per butir seperti batch 9.

Drill tidak masuk DB, jadi bisa dirilis lebih dulu dari kartu 5 (hanya build + commit).

## 3. Pembagian kerja

| Pekerja | Tugas | Output | Verifikasi Claude |
|---|---|---|---|
| **Codex-1** (write) | 24 butir numerik pkg 20 (57–64, 76–87, 93–96) + pembahasan §5 + field `h` | `prisma/data/kecerdasan_p20_num.json` | `checkTeks` + `hitung`, membaca semua pembahasan, pengecoh = kesalahan bernama, grep A-7 |
| **Codex-2** (write) | 63 butir SK baru + pembahasan §7.4 | `bank/pribadi/sk-sim5-01.json` | `check-bank-pribadi.ts`, membaca 63 butir, cek dimensi/kunci/kembar, grep A-7 |
| **Codex-3** (read-only) | Cek buta teks pkg 20, SK pkg 15, **15 butir Alokasi**, **9 Sebab-Akibat**, dan drill K18 + K07 strategi (tanpa kunci) | `scratchpad/qa/codex-20.md`, `codex-sk15.md`, `codex-alokasi.md` | membandingkan **alasan** (Q-5) |
| **Claude** | **15 butir Alokasi Waktu + `cek-alokasi.ts`**; **9 Sebab-Akibat**; **drill K18 30 + K07 strategi 10**; Kecermatan 13 (§2.3); verbal 25, silogisme 8, wacana 8, **Sebab-Akibat 3** (§2.5), KCK 4; semua gambar pkg 20 + `pembahasan_svg`; KP 48 `kp-sim5-01.json`; `paket-15.json`; reshape pkg 15/19; integrasi seed; QA visual 360/520 px | file di kolom kiri, `kecerdasan_alokasi.json` | `cek-alokasi.ts`, `cek-wacana-kal.ts`, `check-kecerdasan-kck.ts`, `seed-kecerdasan-kal.ts --check 15/19/20`, `seed-pribadi-paket.ts 15` (dry run), `lib/kecermatan-symbols.test.ts` |
| **Subagent Sonnet** | Cek buta gambar pkg 20 dari PNG | `scratchpad/qa/sonnet-gambar-20.md` | setiap beda dibuktikan dengan koordinat |

## 4. Perubahan kode

1. `prisma/data/bank_soal_p13.json`: salinan p509/p510 kolom VI–X (§2.3), disusun dengan satu perintah sekali jalan. Tidak ada perubahan generator.
2. `lib/kecermatan-symbols.test.ts`: tambah 13 ke daftar verifikasi kunci.
3. `kecerdasan-teks-lib.ts`: `LAYOUT_V4` = `[[76, 87, "HIT"], [88, 96, "CRT"], [97, 100, "KCK"]]` + cek bahwa 88–92 memuat `sub: "ALOKASI"` dan 73–75 bertipe `SBA` dengan 5 opsi baku. Tambah `INSTRUKSI.SBA`. Pkg 15/19 setelah swap juga dicek 73–75 = `SBA`. `checkLayout` menerima layout sebagai parameter. Pkg 4/5 tetap memakai v3.
4. `seed-kecerdasan-kal.ts`: daftarkan pkg 20 (v4, `--check`/`--apply`). Tambah mode `--swap <pkg>` dengan memperluas pola pkg 2: hanya untuk slot yang tercantum, wajib dry run, menolak kalau tingkat slot berubah atau kunci slot non-`SBA` berubah (aturan kunci `SBA` §2.5a), dan menolak kalau butir lama di slot itu sudah tidak sesuai dengan yang dicatat (mencegah tukar dobel). Cek bocor pkg 20, butir alokasi, dan Sebab-Akibat terhadap semua file teks + drill K07/K11/K18.
5. `scripts/cek-alokasi.ts` (baru): pemecah brute force untuk 15 butir simulasi + 10 butir K07 strategi + asersi jawaban tunggal (bentuk strategi §2.4b).
6. Teks butir alokasi dan Sebab-Akibat ditulis ke `kecerdasan_p15_teks.json` / `p19_teks.json` / `p20_teks.json` (menggantikan entri slot lama) supaya `backfill-pembahasan-kecerdasan.ts` ikut membacanya. Tambah `kecerdasan_p20_teks.json` ke backfill.
7. `generate-kecerdasan-figural-kal.ts`: asersi urutan pkg 20. Generator per paket ditaruh di file baru.
8. Pedoman Kecerdasan: catat layout v4 + Alokasi Waktu + Sebab-Akibat (§4.9 baru, isi = §2.5) (atas izin pemilik).
9. Asersi: semua paket lain tetap byte-identik setelah generator dijalankan ulang.
10. Drill: `bank/drill/kecerdasan/K18-sebab-akibat.json` (baru), tambahan K07; `lib/drill-cards.ts` (K18 + kategori); taksonomi `drilling/02`; entri `bank/drill/LOG.md`. Cek `app/admin/pengecoh/page.tsx` ikut mengenali K18.

## 5. Urutan sesi

| Sesi | Claude | Codex paralel | Selesai bila |
|---|---|---|---|
| **1** | Kirim brief Codex-1/2; baca DB pkg 15/19 slot 65–75 (read-only); **Kecermatan 13 selesai** (§4.1–4.2, pedoman Kecermatan); `cek-alokasi.ts` + 5 butir alokasi pkg 19 dengan susunan §2.4a + render 360 px (keputusan titik daftar); baca DB pkg 15 (read-only) dan tetapkan slot | Codex-1 numerik, Codex-2 SK 63 | Kecermatan 13 lolos test kunci; 5 butir alokasi pkg 19 lolos `cek-alokasi` |
| **2** | 10 butir alokasi (pkg 15, 20); **9 Sebab-Akibat** (pkg 15, 19, 20); `LAYOUT_V4` + mode `--swap`; dry run swap 15/19; verbal pkg 20 | Codex-3 cek buta 15 alokasi + 9 Sebab-Akibat | 24 butir lolos cek buta; `--swap 15/19` dry run OK; **cek review sesi lama** (§6) |
| **3** | Silogisme + wacana (A, B) + KCK pkg 20; **drill K18 30 + K07 strategi 10**; KP 48 pkg 15; audit Codex-1/2; gabung teks pkg 20; `paket-15.json` | Codex-3 cek buta SK 15 + drill K18/K07 | Teks pkg 20 lengkap; paket 15 dry run OK; `npm run build:drill` lolos (drill boleh dirilis duluan) |
| **4** | Prototipe 1 butir per jenis gambar yang lebih sulit → **pemilik setujui** (G-5); lalu semua gambar pkg 20 + `pembahasan_svg` | Codex-3 cek buta teks pkg 20 | Gambar lengkap, 360 px bersih, `--check 20` OK |
| **5** | Perbaikan temuan; cek buta gambar (Sonnet); `tsc`, `next build --webpack`; serahkan perintah ke pemilik | — | Pemilik cek localhost → "commit dan push" → §5a |

Reshape kartu 3/4 (Alokasi + Sebab-Akibat) bisa dikirim lebih dulu sebagai rilis terpisah setelah sesi 2, tanpa menunggu kartu 5 selesai, kalau pemilik ingin.

### 5a. Perintah untuk pemilik (urutan wajib, hanya setelah izin)
1. **Syarat:** tidak ada `module_sessions` KECERDASAN berstatus IN_PROGRESS untuk pkg 15/19 (halaman ujian memuat ulang soal `is_active`, sesi yang dilanjutkan setelah swap akan tercampur), dan perbaikan `lib/review.ts` (satu baris per nomor, `lib/review-pick.ts`) sudah ter-deploy. Lalu `npx tsx scripts/seed-kecerdasan-kal.ts --swap 19` lalu `--swap 15` → cek pkg 19/15 tetap 100 aktif, nomor 1..100, 73–75 = Sebab-Akibat, 88–92 = Alokasi
2. `npx tsx scripts/seed-kecermatan-packages.ts 13` → cek 500/500 di DB (skrip ini tidak punya dry run)
3. `npx tsx scripts/seed-pribadi-paket.ts 15 --apply`
4. `npx tsx scripts/seed-kecerdasan-kal.ts --apply 20`
5. `npx tsx scripts/backfill-pembahasan-kecerdasan.ts` lalu `--apply` → cakupan pembahasan pkg 15, 19, 20 harus 100/100
6. Isi `SIMULASI_PAKET[5]` (§0) → commit + push → Claude memverifikasi kartu 5 terbuka dan `isSimulasiPackage` menolak 20/15/13 di latihan.

## 6. Risiko

| Risiko | Penanganan |
|---|---|
| **Swap pkg 15/19 merusak review/nilai sesi lama** (sesi lama menjawab butir yang kini nonaktif) | Sebelum `--swap`: telusuri cara halaman pembahasan dan skor memuat soal sesi lama (per id jawaban atau per paket aktif). Kalau per paket aktif → perbaiki pembacanya dulu, atau batalkan swap dan pakai paket baru. Uji dengan 1 sesi lama di localhost. |
| Nilai kartu 3/4 sebelum dan sesudah swap tidak setara | Tingkat dan kunci per slot diwarisi; selisih isi dicatat di LOG. Pemilik tahu skor lama tidak dihitung ulang. |
| Alokasi punya 2 jawaban yang bisa dibela | `cek-alokasi.ts` brute force + cek buta Codex-3 |
| Sebab-Akibat punya 2 jawaban yang bisa dibela (tipe ini terkenal ambigu) | Kunci hanya A/B/E, aturan D-1 §2.5, cek buta Codex-3; beda jawaban = tulis ulang |
| Swap Sebab-Akibat mengubah sebaran kunci pkg 15/19 | Hanya slot `SBA`, dibatasi angka tertinggi yang ada (§2.5a), dicatat di LOG |
| "Delegasi terbaik" punya 2 opsi yang bisa dibela | Kriteria 3 syarat §2.4b diasersi `cek-alokasi.ts` + cek buta |
| Alokasi menyalin drill | Cek bocor otomatis terhadap K07-AK/K11-AK + latar netral wajib |
| Kecermatan 13 sama dengan latihan p509/p510, jadi peserta yang sudah mengerjakannya bisa hafal kunci | Keputusan pemilik, dicatat di pedoman §5/§8; sumber dipilih dari paket terakhir carousel (K-5) |
| Kh paket 13 tidak setara dengan paket campuran | Dicatat di pedoman §6 |
| "Lebih sulit" berubah menjadi ambigu | Prototipe disetujui pemilik terlebih dahulu; cek buta Sonnet + D-1 per butir |
| Teks/SK Codex lemah atau melanggar aturan | Brief memuat contoh + D-2; `check-bank-pribadi.ts`; Claude membaca semua butir |
| Gaya mosaik mirip paket lama (G-10) | 2 gaya baru, dibandingkan sebelum prototipe |
| Konteks penuh di tengah pekerjaan gambar | Satu generator per jenis, divalidasi sebelum pindah |
