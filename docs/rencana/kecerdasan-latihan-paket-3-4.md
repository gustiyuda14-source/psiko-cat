# Ultra Plan — Latihan Kecerdasan Paket 3 & 4

2026-10-13 · Status: **RENCANA, belum ada yang dibangun** · Log sesi dan prompt lanjutan: `kecerdasan-latihan-paket-3-4-LOG.md`.

| Label di latihan | package_number | Isi |
|---|---|---|
| Paket 3 | **4** | 100 butir baru |
| Paket 4 | **5** | 100 butir baru |

Saat ini slot 4–11 sudah terdaftar di `KECERDASAN_PACKAGES`, tetapi isinya kosong di DB.

## 0. Wajib dibaca di awal setiap sesi
1. `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md`. Perhatikan terutama:
   - A-7: konteks netral, **tanpa unsur kepolisian**;
   - §5: pembahasan 2 paragraf + Tips;
   - §6: gambar;
   - §10: checklist.
2. `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md` v3. Perhatikan:
   - §3: blueprint;
   - §4.1–4.8, termasuk §4.7 kecukupan data dan §4.8 silogisme;
   - §5: aturan umum.
3. `RULES GENERATE SOAL SPASIAL.md`.
4. File log `kecerdasan-latihan-paket-3-4-LOG.md`, entri terakhir.

## 1. Cara kerja (keputusan pemilik 2026-10-13)
- **Kerja dibagi antara Claude dan Codex CLI.** Keduanya bekerja paralel di bagian yang berbeda; pembagiannya ada di §3.
  - Codex tidak bisa commit atau mengakses network/DB. Claude mengaudit diff Codex, lalu menggabungkan.
  - Perintah Codex:
    - tulis: `codex exec --skip-git-repo-check -s workspace-write -C <repo> -o <out> - < <brief>`;
    - cek buta: `-s read-only … < /dev/null`.
- **Batas 120k token per sesi.** Begitu konteks sesi mendekati 120k (cek dengan `/context`), Claude **berhenti di titik aman**: tidak boleh ada file setengah jadi, dan validasi yang sedang dijalankan harus selesai dulu. Lalu Claude menulis entri baru di LOG (§6) berisi:
  - apa yang selesai;
  - file yang berubah;
  - status job Codex;
  - temuan;
  - **prompt lanjutan** yang siap ditempel ke sesi baru.
- Tidak ada penulisan ke DB oleh Claude. `--apply` dan backfill dijalankan pemilik.
- Commit dan push hanya setelah pemilik mengecek di localhost dan bilang "commit dan push". Commit hanya path milik sendiri, lalu `git push origin HEAD:main`.

## 2. Blueprint per paket (pedoman v3)

| No | Blok | Tipe | Jml | Format | Pembuat |
|---|---|---|---|---|---|
| 1–5 | Verbal | Sinonim | 5 | 2 kunci | Claude |
| 6–10 | Verbal | Antonim | 5 | 2 kunci | Claude |
| 11–15 | Verbal | Analogi | 5 | 2 kunci | Claude |
| 16–19 | Verbal | Kata ganjil | 4 | 1 kunci | Claude |
| 20–25 | Verbal | Bacaan, 2 wacana original × 3 | 6 | 1 kunci | Claude |
| 26–27 | Logis/Spasial | Deret gambar (mosaik) | 2 | 1 kunci | Claude (generator mosaik) |
| 28–30 | Logis/Spasial | Matriks 3×3 | 3 | 1 kunci | Claude (figural-kal) |
| 31–32 | Logis/Spasial | Rotasi/cermin | 2 | 1 kunci | Claude (figural-kal) |
| 33–34 | Logis/Spasial | Susun potongan | 2 | 1 kunci | **Codex** (gambar objek) + Claude (QA, pembahasan) |
| 35–36 | Logis/Spasial | Analogi gambar | 2 | 1 kunci | Claude (figural-kal) |
| 37 | Logis/Spasial | Ikon kategori | 1 | 1 kunci | Claude (figural-kal) |
| 38–42 | Logis/Spasial | Denah: peta A 2 ARAH + 2 RUTE, peta B 1 ROTASI | 5 | 1 kunci | Claude (denah-kal, seed baru) |
| 43–50 | Logis/Spasial | Silogisme (sebaran §4.8) | 8 | 1 kunci | Claude |
| 51–54 | Analitis | Pola bundar angka (4 aturan berbeda) | 4 | 1 kunci | Claude (bundar) |
| 55–56 | Analitis | Pola bundar huruf | 2 | 1 kunci | Claude (bundar) |
| 57–60 | Analitis | Deret angka | 4 | 2 kunci | **Codex** |
| 61–64 | Analitis | Deret huruf / campuran, minimal 1 dua jalur | 4 | 2 kunci | **Codex** |
| 65–75 | Analitis | Wacana logika A4 / B4 / C3 (brute force) | 11 | 1 kunci | Claude |
| 76–82 | Praktis | Hitung cepat | 7 | 1 kunci | **Codex** |
| 83–87 | Praktis | Pecahan/persen/akar/pangkat | 5 | 1 kunci | **Codex** |
| 88–90 | Praktis | Konversi satuan | 3 | 1 kunci | **Codex** |
| 91–96 | Praktis | Soal cerita | 6 | 1 kunci | **Codex** |
| 97–100 | Praktis | Kecukupan data (4 jenis, §4.7) | 4 | 1 kunci | Claude (pola kck-kal) |

Aturan per paket:
- Tingkat **40 sedang / 60 HOTS**, butir HOTS tidak menumpuk di awal blok.
- Kunci maksimal 24 per huruf.
- Silogisme memakai instruksi baru yang memuat "anggap semua premis benar".
- Semua butir tanpa unsur kepolisian.
- Pkg 4 dan 5 tidak boleh berbagi stem, peta denah, objek susun, atau aturan figural yang identik.

## 3. Pembagian kerja Claude ↔ Codex

| Pekerja | Tugas | Output | Verifikasi |
|---|---|---|---|
| **Codex-1** (`workspace-write`) | 52 butir numerik untuk 2 paket (57–64 dan 76–96), dengan pembahasan §5 dan field `h` | `prisma/data/kecerdasan_p4_num.json`, `kecerdasan_p5_num.json` (format `Teks`: `s,t,d,q,i,c,k,h,p`) | Claude: `checkTeks` + `hitung`, baca semua pembahasan, cek A-7 dengan grep |
| **Codex-2** (`workspace-write`) | 4 objek susun (benda, bukan manusia), 2 per paket. Brief wajib: objek memenuhi lebar, setiap strip punya landmark unik, setiap potongan memotong fitur | entri `kecerdasan_susun_kal.json` pkg 4 dan 5 lewat `generate-kecerdasan-susun-kal.ts` | Claude: screenshot headless Chrome tiap putaran, cek lebar 360 px |
| **Codex-3** (`read-only`) | Cek buta semua butir teks (tanpa kunci): verbal, silogisme, wacana, numerik, kecukupan data | `scratchpad/qa/codex-<pkg>.md` | Claude membandingkan **alasan**, bukan huruf saja |
| **Claude** | Verbal 25 + silogisme 8 + wacana 11 + kecukupan data 4 per paket; semua gambar (figural, mosaik, bundar, denah) beserta `pembahasan_svg`; integrasi seed; QA visual | `kecerdasan_p4_teks.json`, `kecerdasan_p5_teks.json` (gabungan dengan output Codex-1), `figural-kal-4.ts`, `figural-kal-5.ts`, `figural-kal-bundar-4/5.ts`, entri `PKGS` denah | `cek-wacana-kal.ts`, `check-kecerdasan-kck.ts`, `seed-kecerdasan-kal.ts` |
| **Subagent Sonnet** (opsional) | Cek buta butir gambar dari PNG (Codex lemah membaca kiralitas SVG) | `scratchpad/qa/sonnet-gambar-<pkg>.md` | Claude memverifikasi setiap perbedaan dengan koordinat |

Brief Codex ditulis ke `scratchpad/codex/<nama>.md` dan menyalin isi pedoman yang relevan (A-7, §5, tipe yang dikerjakan), karena Codex tidak membaca memory.

## 4. Perubahan kode yang diperlukan (Claude, sesi 1)
1. **Layout v3 di `seed-kecerdasan-kal.ts`** untuk pkg 4 dan 5: 76–90 HIT, 91–96 CRT, 97–100 KCK, tanpa KUA. Pakai ulang aturan `checkLayout` dari `seed-kecerdasan-kck.ts`; jangan menduplikasi. Kalau file mendekati 500 baris, pindahkan helper bersama ke `kecerdasan-teks-lib.ts`. Paket lama (2, 3, 13–18) harus tetap lolos validasi.
2. **Instruksi silogisme baru:** `INSTRUKSI.SIL_V3` = "Anggap semua pernyataan berikut benar, lalu pilihlah satu kesimpulan yang tepat." `checkBlock` menerima SIL lama untuk paket lama dan SIL_V3 untuk pkg ≥ 4 baru.
3. **Gabungan teks:** `kecerdasan_p4_teks.json` adalah satu file 77 butir. Butir numerik dari Codex-1 digabung Claude dengan skrip kecil, lalu file `*_num.json` dihapus setelah digabung.
4. **Anti-bocor:** `checkNoLeak` pkg 4/5 terhadap semua file teks p2, p3, s2, p15, p16, `kck_kal`, bank drill K16, dan satu sama lain.
5. **Backfill:** tambahkan `kecerdasan_p4_teks.json` dan `kecerdasan_p5_teks.json` ke daftar sumber `backfill-pembahasan-kecerdasan.ts`.
6. **Cek A-7 otomatis:** satu fungsi di `kecerdasan-teks-lib.ts` yang menolak kata terlarang (daftar dari pedoman A-7) di `q, i, w, c, p` dan wacana. Dipakai hanya untuk paket baru (pkg ≥ 4 yang dibuat setelah 2026-10-13), supaya paket lama tidak gagal.

## 5. Urutan sesi (perkiraan; setiap sesi berhenti di 120k)

| Sesi | Claude | Codex (paralel) | Selesai bila |
|---|---|---|---|
| **1** | Perubahan kode §4.1–4.6, brief Codex-1 dan Codex-2, verbal + bacaan pkg 4 | Codex-1 (numerik 2 paket), Codex-2 putaran 1 (susun) | Seed v3 lolos untuk pkg lama; brief terkirim; verbal pkg 4 lolos `checkTeks` |
| **2** | Verbal + bacaan pkg 5; silogisme + wacana (brute force) pkg 4 dan 5; kecukupan data 8 butir; audit output Codex-1 | Codex-2 putaran 2 bila perlu | Teks 77 per paket lengkap, lolos validasi teks dan cek wacana |
| **3** | Figural-kal 4/5 (8 butir per paket), mosaik 2, bundar 6, denah 5 per paket, semua `pembahasan_svg`; screenshot 360 px | Codex-3: cek buta teks pkg 4 dan 5 | Gambar lengkap; QA visual lolos; hasil cek buta teks sudah dibandingkan |
| **4** | Perbaikan temuan, cek buta gambar (Sonnet), `compose(4)` dan `compose(5)` dengan validasi penuh, update dokumen (pedoman §6, rencana 10 paket); serahkan perintah `--apply` ke pemilik | — | Pemilik cek di localhost, menjalankan `--apply 4`, `--apply 5` dan backfill; Claude memverifikasi DB 100/100; commit |

## 6. Format entri LOG (wajib setiap kali berhenti)

```markdown
## Sesi N — YYYY-MM-DD (berhenti di ±120k)
**Selesai:** …
**File berubah (belum/sudah commit):** …
**Codex:** job, status, path output
**Temuan / keputusan tertunda:** …
**Langkah berikut:** 1. … 2. …

### Prompt lanjutan
​```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (pkg 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir di
kecerdasan-latihan-paket-3-4-LOG.md, pedoman utama, dan pedoman Kecerdasan v3.
Kerjakan Sesi N+1: … (daftar tugas spesifik + file + status Codex).
Aturan: split dengan Codex, berhenti di ±120k token dengan entri LOG + prompt
lanjutan, tanpa tulis DB, commit hanya setelah "commit dan push".
​```
```

## 7. Risiko

| Risiko | Penanganan |
|---|---|
| Konteks penuh di tengah gambar | Setiap generator gambar ditulis per paket (`figural-kal-4.ts`) dan divalidasi sebelum pindah ke paket berikutnya, supaya titik henti selalu bersih |
| Kualitas teks Codex (bahasa kaku, pengecoh lemah) | Brief memuat contoh pembahasan yang baik dan aturan D-2; Claude membaca semua 52 butir dan menolak pengecoh tanpa kesalahan bernama |
| Codex merusak file lain | Codex hanya menulis file output yang disebut di brief; Claude memeriksa `git status` setelah tiap job |
| Susun butuh banyak putaran | Mulai di sesi 1, paralel |
| Konteks kepolisian lolos | Cek A-7 otomatis (§4.6) dan grep di checklist |
| Slot 4–11 kosong saat ini | Paket 3/4 tayang begitu DB terisi; slot 6–11 tetap kosong sampai rencana berikutnya |
