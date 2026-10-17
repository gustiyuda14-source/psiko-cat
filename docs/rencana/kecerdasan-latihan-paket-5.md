# Ultra Plan — Latihan/Mini Tryout Kecerdasan Paket 5 (package_number 6)

2026-10-17 · Split Claude + Codex (pemilik menjalankan prompt Codex di ekstensi VS Code).
Wajib baca dulu: `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md` (master), lalu `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md` v4 (§3, layout v4, §4.9, §4.10).
LOG: `docs/rencana/kecerdasan-latihan-paket-5-LOG.md` (dibuat saat Sesi 1 mulai, entri terbaru di bawah).

## 0. Ringkas

- Label menu "Paket 5" = `KECERDASAN_PACKAGES[4]` = **package_number 6**. Belum ada di DB; slot sudah tampil "Belum tersedia".
- Paket pertama latihan yang memakai **layout v4** (sebelumnya hanya pkg 20 + swap 15/19), ditambah varian alokasi baru:
  - **73–75 Sebab-Akibat** (`SBA`, opsi baku §4.9, kunci A/B/E) — tipe screenshot drill K18.
  - **88–92 Alokasi** (`CRT`, `sub: "ALOKASI"`), split (K-1, putusan pemilik 2026-10-17): **88–90 Poin Maksimal** (3 butir, bentuk drill `NUM-CRT-ALOKASI-POIN`, screenshot "Strategi manakah yang menghasilkan poin paling banyak?") + **91–92 Alokasi Waktu** (2 butir, jendela jam §4.10, 1 di antaranya "delegasi terbaik"/strategi).
- Tingkat 40/60 (sedang/HOTS) seperti latihan pkg 3–5. Kunci ≤ 24 per huruf (aturan `checkLayout`).
- Latar netral, tanpa unsur kepolisian (A-7). Pembahasan 2 paragraf (Langkah / Kenapa yang lain salah + Jawaban + Tips), semua di `scoring_rule.pembahasan`, cakupan 100/100.

### 0a. Keputusan pemilik (default dipakai bila tidak dijawab)
| Kode | Pertanyaan | Default |
|---|---|---|
| K-1 | Komposisi 88–92 | **DIPUTUS:** split 3 Poin Maksimal + 2 Alokasi Waktu |
| K-2 | Tingkat | 40/60 |
| K-3 | Cek buta | Codex C3 (tanpa kunci) atas teks + alokasi + SBA; gambar cukup dilihat Claude 360/520 px |

## 1. Blueprint pkg 6 (100 butir, 90 menit)

| No | Tipe | Jml | Pemilik kerja | Catatan |
|---|---|---|---|---|
| 1–5 SIN · 6–10 ANT · 11–15 ANA | verbal 2 kunci | 15 | Claude | kosakata baru, cek bocor ke p2–p5, p15–p20 |
| 16–19 | Kata ganjil | 4 | Claude | |
| 20–25 | Pemahaman bacaan 2×3 | 6 | Claude | D-3: kunci bukan opsi terpanjang/terpendek |
| 26–27 | Mosaik deret | 2 | Claude | gaya G-10 baru, beda dari pkg 4/5/20 |
| 28–32, 35–37 | Matriks/rotasi/analogi/ikon (`figural-kal-6.ts`) | 8 | Claude | + `pembahasan_svg` tanpa id |
| 33–34 | Susun benda nyata | 2 | Claude | pola `susun-benda-45.ts` |
| 38–42 | Denah (PKGS += 6) | 5 | Claude | 2 ARAH + 2 RUTE + 1 ROTASI |
| 43–50 | Silogisme (SIL_V3) | 8 | Claude | |
| 51–56 | Pola bundar angka 4 + campuran huruf 2 | 6 | **Codex C2** | `figural-kal-bundar.ts` pola data; Claude render |
| 57–64 | Deret angka 4 + huruf/campuran 4 | 8 | **Codex C2** | field `h`, 2 kunci |
| 65–72 | Wacana logika A(4) + B(4) | 8 | Claude | brute force di `cek-wacana-kal.ts` |
| **73–75** | **Sebab-Akibat** | 3 | Claude | kunci A, B, E (1 per huruf); progresi level kartu 3–4 (latihan) |
| 76–85 | Hitung cepat + pecahan/persen | 10 | **Codex C2** | `h` wajib |
| 86–87 | Konversi satuan | 2 | **Codex C2** | |
| **88–90** | **Alokasi Poin Maksimal** | 3 | **Codex C1** | lolos `cek-alokasi.ts` tanya `poin` |
| **91–92** | **Alokasi Waktu** (91 strategi/delegasi terbaik, 92 terpendek atau maks) | 2 | **Codex C1** | lolos `cek-alokasi.ts` |
| 93–96 | Soal cerita lain (jarak-waktu, untung-rugi, pekerja, perbandingan) | 4 | **Codex C2** | `h` wajib |
| 97–100 | Kecukupan data | 4 | **Codex C2** | 4 kunci beda, ada C/E (`check-kecerdasan-kck.ts`) |

### 1a. Spesifikasi Alokasi Poin Maksimal (baru di paket kecerdasan)
- Susunan `q` (dipisah `\n`, sama persis gaya drill K07-N-011 / screenshot): konteks + "memiliki waktu N menit untuk … Kegiatan yang tersedia:" · baris kosong · `• Nama kegiatan: M menit → P poin` (3–4 baris) · baris kosong · aturan baku "Poin diperoleh setiap kali satu kegiatan selesai utuh. Kegiatan boleh diulang, urutannya bebas, dan total waktu tidak boleh melebihi N menit." (+ syarat opsional: batas kali / kegiatan wajib) · baris kosong · `Pertanyaan: Strategi manakah yang menghasilkan poin paling banyak?`
- Opsi = kombinasi "Kegiatan X k kali + Kegiatan Y j kali". Pengecoh bernama (tag generate-k07-poin.ts): `LEBIH` (melebihi waktu), `BATAS` (langgar batas kali/wajib), `RATE` (pilih poin per kegiatan terbesar, bukan per menit), `ABS`, `PAS` (waktu pas tapi bukan optimum), `RENDAH`.
- Kunci = optimum unik hasil brute force (knapsack tak terbatas). Tingkat:
  - 88 sedang: 3 kegiatan, poin per menit tertinggi tidak muat pas → kombinasi 2 kegiatan.
  - 89 HOTS: 4 kegiatan, pengecoh `RATE` kuat (poin per kegiatan terbesar ≠ terbaik).
  - 90 HOTS: syarat batas kali (mis. "paling banyak 2 kali") atau kegiatan wajib.
- Alokasi Waktu 91–92 ikut §4.10 (progresi level kartu 3–4): 91 HOTS "delegasi terbaik" (opsi strategi), 92 sedang (terpendek atau maks, 1 jeda).
- 88–92: 5 huruf kunci berbeda; konteks 5 butir beda semua dan beda dari drill K07/K11 serta alokasi pkg 15/19/20.
- Anti-bocor: angka, kegiatan, konteks beda dari K07-N-011..040 dan K11.
- Pembahasan: poin per menit tiap kegiatan → susun waktu → hitung poin → tiap opsi gugur + tag kesalahannya → Jawaban → Tips ("hitung poin per menit dulu, lalu cek sisa waktu").

## 2. Pembagian kerja dan file (tanpa tabrakan)

| Pihak | Menulis HANYA ke | Tidak boleh |
|---|---|---|
| Codex C1 | `scripts/cek-alokasi.ts` (tambah tanya `poin`), `prisma/data/kecerdasan_alokasi.json` kunci `"6"` | menyentuh kunci 15/19/20 |
| Codex C2 | `prisma/data/kecerdasan_p6_angka.codex.json` (format sama `kecerdasan_p5_teks.json`, hanya `soal` nomor 51–64, 76–87, 93–100) + pola bundar sebagai data di file yang sama (`bundar` per nomor) | file lain |
| Codex C3 | `docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md` (read-only atas data) | mengubah data |
| Claude | `prisma/data/kecerdasan_p6_teks.json` (gabungan akhir), `kecerdasan_sba.json` kunci `"6"`, generator gambar + JSON kal, `seed-kecerdasan-kal.ts`, pedoman, LOG | `cek-alokasi.ts` saat C1 jalan |

Codex sandbox: tidak bisa commit, tidak ada network, tidak menulis DB. Claude audit diff Codex baris per baris sebelum digabung.

## 3. Sesi (berhenti ±120k token, tulis LOG + prompt lanjutan)

**Sesi 1 — paralel**
- Pemilik: jalankan prompt **C1** dan **C2** di Codex (dua chat terpisah boleh bersamaan; file tidak bentrok).
- Claude: buat LOG; verbal 1–25, silogisme 43–50, wacana 65–72 (+ cek brute force), SBA 73–75 → `kecerdasan_p6_teks.json` (tanpa nomor milik Codex) dan `kecerdasan_sba.json["6"]`.
- `seed-kecerdasan-kal.ts`: `V3`/`V4` += 6; tier 40/60; `LAYOUT_V4` + izinkan sub ALOKASI bentuk poin; anti-bocor vs p2–p5, p15–p20, drill K07/K18.

**Sesi 2 — gambar (Claude)**
- `figural-kal-6.ts` (8 butir), mosaik 26–27 gaya baru, susun 33–34 benda nyata, denah PKGS 6, render bundar 51–56 dari data C2.
- Lihat PNG 360/520 px sendiri; pemilik nilai gaya mosaik & susun (G-5).

**Sesi 3 — gabung + QA**
- Audit + gabung output C1/C2 ke `kecerdasan_p6_teks.json`; jalankan C3 (cek buta) di Codex, perbaiki temuan.
- QA: `npx tsc --noEmit -p .` · `npx tsx scripts/seed-kecerdasan-kal.ts --check 6` (dan 4/5/15/19/20 tetap lolos) · `npx tsx scripts/cek-alokasi.ts` · `check-kecerdasan-kck.ts` · `cek-wacana-kal.ts` · grep A-7 · `git diff` JSON kal hanya menambah · `npx next build --webpack`.
- Paket perintah pemilik (setelah "commit dan push"): commit path rencana ini → `npx tsx scripts/seed-kecerdasan-kal.ts --apply 6` → `npx tsx scripts/backfill-pembahasan-kecerdasan.ts` (dry run) lalu `--apply` → cakupan pkg 6 = 100/100 → cek kartu Paket 5 terbuka di Latihan/Mini Tryout.

## 4. Prompt Codex (salin apa adanya ke Codex VS Code)

### C1 — Alokasi Poin Maksimal pkg 6 + pemeriksa poin
```
Repo psiko-cat. Baca docs/rencana/kecerdasan-latihan-paket-5.md §0, §1, §1a, §2, lalu docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md §4.10, scripts/cek-alokasi.ts, scripts/generate-k07-poin.ts, contoh butir K07-N-011..040 di bank/drill/kecerdasan/K07-soal-cerita.json, dan contoh prisma/data/kecerdasan_alokasi.json["20"].
Tugas:
1. scripts/cek-alokasi.ts: tambah tanya "poin". Data: { T: menit, kegiatan: [{nama, menit, poin, maks?, wajib?}], opsi: Record<nama, kali>[] }. Brute force semua kombinasi (kegiatan boleh diulang, total menit ≤ T, hormati maks/wajib); optimum harus unik; tepat satu opsi sah DAN berpoin = optimum; tiap pengecoh harus cocok dengan satu tag LEBIH/BATAS/RATE/ABS/PAS/RENDAH yang disimpan di data. Pakai ulang logika generate-k07-poin.ts (salin fungsi kecil, jangan ubah file itu). Butir 15/19/20 yang ada harus tetap lolos.
2. prisma/data/kecerdasan_alokasi.json: tambah kunci "6" dengan 5 butir s=88..92 (t "CRT", sub "ALOKASI"), sesuai §1a:
   - 88–90 bentuk "poin", tanya "poin" (88 d2, 89 d3, 90 d3 dengan batas kali/wajib); teks q gaya K07-N-011.
   - 91 Alokasi Waktu tanya "strategi" (delegasi terbaik, d3); 92 Alokasi Waktu tanya "terpendek" atau "maks" dengan 1 jeda (d2); teks q persis susunan §4.10.
   Kunci 5 huruf berbeda. Pembahasan field p: 2 paragraf dipisah <br>, tiap opsi salah disebut kesalahannya, lalu "Jawaban:" dan "Tips:".
3. Latar netral (kantor, sekolah, panitia, rumah, olahraga); DILARANG kata polisi/polri/taruna/patroli/tilang dsb (A-7). Angka, kegiatan, konteks tidak boleh sama dengan bank/drill/kecerdasan/K07-soal-cerita.json maupun kunci 15/19/20.
4. Jalankan: npx tsx scripts/cek-alokasi.ts dan npx tsc --noEmit -p . — keduanya harus lolos.
Jangan commit, jangan sentuh file lain. Akhiri dengan ringkasan: file diubah, kunci per butir, output kedua perintah.
```

### C2 — Butir numerik pkg 6
```
Repo psiko-cat. Baca docs/rencana/kecerdasan-latihan-paket-5.md §1–§2, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md (A-7, D-1..D-4, pembahasan), docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md §3, §4.1–4.3, §4.7, dan contoh format prisma/data/kecerdasan_p5_teks.json.
Buat prisma/data/kecerdasan_p6_angka.codex.json berformat sama ({wacana:{}, soal:[...]}) berisi HANYA nomor:
- 51–54 pola bundar angka, 55–56 pola bundar campuran huruf (simpan juga field "bundar" berisi data angka/huruf per sektor + "?" agar Claude yang merender gambar), 1 kunci;
- 57–60 deret angka, 61–64 deret huruf/campuran, 2 kunci;
- 76–85 hitung cepat + pecahan/desimal/persen/akar (t "HIT"), 86–87 konversi satuan (t "HIT");
- 93–96 soal cerita (t "CRT"): jarak-waktu, untung-rugi, pekerja, perbandingan;
- 97–100 kecukupan data (t "KCK") persis §4.7: 4 kunci berbeda, ada C atau E.
Aturan: tiap butir numerik punya field "h" (ekspresi/angka yang membuktikan kunci); d 2 atau 3 dengan kira-kira 40% d2 / 60% d3; pengecoh = kesalahan bernama berskala wajar; kunci bukan opsi terbesar/terkecil terus-menerus; sebaran huruf kunci rata. Pembahasan field p: 2 paragraf dipisah <br> (Langkah; Opsi salah + alasannya, Jawaban:, Tips:). Tanpa unsur kepolisian (A-7). Angka/konteks tidak sama dengan kecerdasan_p2..p5_teks.json, p15/p16/p19/p20.
Verifikasi: tulis skrip sementara di luar repo atau jalankan node -e untuk menghitung ulang setiap "h" vs kunci; jalankan npx tsx scripts/check-kecerdasan-kck.ts bila bisa membaca file ini, jika tidak laporkan. Jangan ubah file lain, jangan commit. Akhiri dengan tabel nomor | tipe | d | kunci | h-terverifikasi.
```

### C3 — Cek buta (Sesi 3, setelah gabung)
```
Repo psiko-cat. Read-only. Dari prisma/data/kecerdasan_p6_teks.json, prisma/data/kecerdasan_alokasi.json["6"], prisma/data/kecerdasan_sba.json["6"]: kerjakan setiap soal TANPA melihat field k/kunci/h/p/data dulu (tutup field itu saat menjawab). Setelah semua dijawab, bandingkan dengan kunci. Tulis docs/rencana/kecerdasan-latihan-paket-5-cekbuta.md: nomor | jawabanmu | kunci | cocok? | catatan (ambigu, dua jawaban benar, pengecoh lemah, salah ketik, unsur kepolisian). Jangan ubah file lain, jangan commit.
```
