# Ultra Plan Drilling psiko-cat (model dajiks-cest)

Status: **PLANNING SAJA**. Belum ada soal yang disusun, belum ada kode drill.
Keputusan 2026-10-10: tampilan dikerucutkan jadi 14 kartu Kecerdasan (kode sub_type tetap untuk pengukuran); infus soal sumber via bank berbasis file dengan adaptasi ringan — lihat 05 §7.
Dasar: 01 (model drill CEST), 02 (taksonomi Kecerdasan, 335 soal sumber diklasifikasi), 03 (Kecermatan/Kepribadian/Sikap Kerja), susun-findings, pola-findings — semua di folder ini.

## 1. Prinsip (diambil dari CEST)

1. Bank drill **terpisah** dari bank simulasi. Sudah berlaku: Paket 1 khusus simulasi (`SIMULASI_PACKAGE`), `/api/practice/check` menolak soal simulasi.
2. Unit belajar = **sub-task × tingkat** (CEST: tipe × CEFR). Peserta memilih sub-task, sistem memberi set berikutnya yang belum dikerjakan.
3. Tiap soal drill punya **pembahasan kaya** (kunci → bukti/aturan → "Opsi X gugur karena …" → 1 tips), maks 2 paragraf.
4. Progres **global per peserta, bukan per paket** (CEST pernah salah di sini, lihat 01).
5. Hasil simulasi menautkan balik ke drill: tombol "Latih" untuk sub-task terlemah.
6. Bedanya dengan CEST: psikotes itu tes kecepatan (≈54 dtk/soal), jadi **waktu per soal wajib dicatat**; penilaian di server, bukan localStorage.

## 2. Struktur drilling

Modul → Aspek → Sub-materi → Sub-task (kode = `questions.sub_type`) × Tingkat 1 Dasar / 2 Menengah / 3 Lanjut.

### 2.1 Kecerdasan — 5 aspek, ±55 sub-task (rincian + nomor soal sumber di 02 §1)

| Aspek | Sub-materi (contoh kode) |
|---|---|
| Verbal | Sinonim 2-kunci & padanan kata langka (VRB-SIN-2K/DEF), Antonim (VRB-ANT-2K/1K), Analogi (VRB-ANL-2K/PAIR/1K), Ganjil kata (VRB-GJL), Bacaan teks & tabel (VRB-BACA-*) |
| Numerik | Hitung cepat campuran/desimal/pecahan/akar-pangkat/persen/sifat bilangan (NUM-HIT-*), Aljabar & perbandingan kuantitatif (NUM-ALJ-*), Konversi satuan (NUM-SAT-*), Soal cerita proporsi/gerak/uang/rasio/umur/geometri/himpunan/linier/pencacahan rute (NUM-CRT-*) |
| Penalaran Logis | Silogisme kategorikal, kondisional, jebakan fallacy/"tidak dapat disimpulkan" (LOG-SIL-*) |
| Analitis | Deret 2-baris/1-jalur/huruf (ANL-DRT-*), angka dalam gambar, operasi simbol, kode/bahasa buatan, wacana urutan/jadwal/multi-atribut/selisih/distribusi (ANL-WCN-*) |
| Figural-Spasial | Matriks 3×3 overlay/XOR-inversi/kurang/inversi/latin/posisi (FIG-MTX-*), seri, analogi gambar, rotasi-vs-cermin, ikon-kategori, susun potongan pita/siluet/lengkung (FIG-SUSUN-*) |

Temuan: AKPOL **tidak** seragam lebih sulit dari Bintara; bedanya format & domain. Tingkat kesulitan diatur per tier (02 §2), bukan per jalur.
Out of profile, tidak dijadikan drill: limit/integral/program linier (KD9–12).

### 2.2 Kecermatan — 6 keluarga simbol × 3 mode × 3 tingkat (03 §1)

- Keluarga: emoji, zodiak, box-drawing, huruf Yunani (Π/ϖ, ζ/ξ, θ/Φ), angka-huruf, campuran.
- Mode melatih indeks skor terpisah: **KE-Sprint** (kecepatan), **KT-Presisi** (ketelitian), **KH-Ketahanan** (konsistensi antar kolom), opsional Adaptasi (kunci simbol pindah huruf antar kolom).
- Target tier dari `lib/scoring/kecermatan.ts`: Dasar 20 klik/kolom, Kt 90, SD ≤ 4,5; Menengah 30/93/≤3; Mahir 40/95/≤1,5; semua wajib Ke ≥ 40.

### 2.3 Sikap Kerja (pilihan paksa A/B) — 11 dimensi nilai (03 §3)

Kebenaran, keterbukaan, penegakan aturan, ketegasan, refleksi (konsisten), plus kepatuhan↔inovasi, kewenangan↔kepedulian, keberanian↔kehati-hatian (kuncinya saling bertentangan di sumber — harus diputuskan dulu).

### 2.4 Kepribadian — drill yang sah saja (03 §2)

Batas etis: melatih peserta menghafal kunci ideal = melatih memalsukan tes kepribadian. Yang direkomendasikan: kenali aspek, kenali pernyataan favorable/unfavorable, baca perbandingan "lebih baik daripada", cek konsistensi jawaban, mode spontan berwaktu. **Tidak** menampilkan "jawaban ideal" per butir.

## 3. Unit & alur drill

- Set: 10 soal (figural 8; wacana 2 stimulus × 3–4 soal). Kecermatan: 1–3 kolom per set sesuai mode.
- Mode tanpa waktu: pembahasan langsung per soal. Mode berwaktu: timer set = target tier × jumlah soal, pembahasan di akhir.
- Alur (CEST): katalog sub-materi → modal "Sub-task terpilih" (baris per tingkat + status) → set berikutnya yang belum dikerjakan → pembahasan → nav pane status (benar/salah/dikerjakan/belum) → reset per sub-task (konfirmasi 2×).
- Tingkat n+1 terbuka setelah tingkat n "Dikuasai" atau "Akurat-lambat". Tiap set ke-3 = review campuran sub-task yang sudah dikuasai.

## 4. Pengukuran

- Catat per percobaan (server): user, soal, pilihan, benar/salah, `time_ms`, mode.
- Status per (sub-task, tingkat), jendela 12 soal terakhir dari ≥ 2 sesi:
  **Dikuasai** (akurasi ≥ 80% & median waktu ≤ target) · **Akurat-lambat** · **Cepat-ceroboh** · **Belum**.
- Panel progres: cakupan, akurasi & waktu per sub-task/tingkat, tombol "sub-task terlemah" (n ≥ 5, < 80%), urut menurut kontribusi ke kehilangan nilai ujian.
- Laporan simulasi: diagnostik per sub-task + tombol "Latih" (perlu `sub_type` di soal Paket 1 — data `tipe` sudah ada di soal.json tapi dibuang saat seed).
- Kecermatan: tampilkan Ke/Kt/Kh + proyeksi kontribusi NAP. Kepribadian: tidak ada skor "benar".

## 5. Kebutuhan data minimum (belum dibuat)

1. `questions.sub_type` (kode §2) dan `questions.difficulty` (1–3).
2. Pembahasan di `scoring_rule` (server-only), dikembalikan `/api/practice/check` setelah menjawab.
3. Tabel baru `practice_attempts` (user_id, question_id, selected, is_correct, time_ms, mode, created_at), ditulis di `/api/practice/check` (dinilai server).
4. Kecermatan drill: simpan hasil per kolom (klik, benar) per sesi drill.
5. Migrasi schema butuh Supabase MCP tersambung (gagal di sesi ini) atau migrasi manual.

## 6. Bank soal: target & standar kualitas

- Ukuran agar pengukuran bermakna: 36 soal unik per (sub-task, tingkat). Keluarga utama (±13) × 3 tingkat × 36 ≈ **1.400 soal Kecerdasan**; keluarga tipis cukup 24 per tingkat tanpa klaim penguasaan. Ini besar — harus bertahap mengikuti jalur belajar (02 §5.5): hitung cepat → satuan → verbal → deret → silogisme → soal cerita → wacana → figural.
- Kepribadian ±360 butir dibutuhkan, ada 100 (gap ±250) — hanya kalau drill Kepribadian disetujui.
- **Standar kualitas figural (keputusan user 2026-10-10):** setara soal sumber AKPOL/Bintara, bukan gambar sederhana. Wajib: bangun majemuk (dasi segitiga, kincir, tong lengkung, sabit, salib, hati bermata), operasi gabung/kurang/XOR dengan inversi warna, latin square gaya isian, rotasi-vs-cermin pada figur asimetris gambar tangan, susun potongan dari line-art/siluet realistis (kapal, penyihir, potret, kue, teko) yang dipotong kode + gerbang keunikan otomatis + cek visual. Gambar raster dibuat Codex CLI (image_generation), tanpa memakai gambar sumber sebagai input. Engine di `scripts/generate-soal-*-gambar.ts` hanya baseline.
- Tiap soal baru: QA independen (pembuat ≠ pemeriksa), satu jawaban benar terbukti, opsi valid (bukan permutasi cacat), tanpa logo/merek nyata, tanpa teks berhak cipta.

## 7. Keputusan yang dibutuhkan dari user

1. Daftar sub-task: setujui taksonomi 02 apa adanya, atau pangkas?
2. Tingkat kesulitan 3 tier — ya/tidak?
3. Unit drill: set 10 soal (rekomendasi) atau per soal?
4. Kepribadian: drill "yang sah" (§2.4) atau tidak ada drill Kepribadian sama sekali?
5. Sikap Kerja: putuskan kunci dimensi yang bertentangan + bobotnya di NAP (belum ada scorer).
6. Bobot NAP: dokumen threshold 60/20/20 vs pedoman 40/40/20 — mana yang berlaku?
7. Urutan pembangunan bank & siapa penulis/pemeriksa pembahasan.
8. Soal sumber bermasalah (02 §6, 03 §5): perbaiki, atau buang dari drill?

## 8. Masalah data yang sudah ditemukan (wajib beres sebelum dipakai)

- Paket 1 (live di simulasi): kunci #86 salah (roda sepeda; jawaban ≈1591, tidak ada di opsi); #39 kunci fallacy; #73 tidak unik; item spasial 26–37 adalah pengganti buatan script, bukan transkripsi PDF, dan #31 punya dua opsi identik, #29 susun ambigu (dua jawaban sah).
- Bintara/AKPOL: B57, B59 dua jawaban benar; B41, B67, B79, A28, KD24 tanpa jawaban benar; B2 opsi kembar; opsi permutasi cacat (P34 e, KD22 a); logo partai/merek nyata (B91–95, A86–90); artikel Katadata disalin (B25–35); duplikat lintas sumber (B45=A61, A100=KD22).
- Kecermatan repo: p101 kolom 1 membocorkan jawaban, p5 kolom 5 ada karakter CJK nyasar, p6 kolom 6 = kolom 9.
- Kepribadian repo: jawab "A" semua = 73,6; jawab Netral semua = 50 dan lulus; butir 36, 54, 58 dan beberapa pasangan saling bertentangan.
- Paket 2 BIT ARA (dibaca 2026-10-10, lihat 04): strukturnya sama dengan Bintara P3; 5 antonim punya >1 jawaban sah, stem #33 dan #35–40 rusak karena copy-paste, #92 ambigu, wacana disalin dari Republika/Katadata.
