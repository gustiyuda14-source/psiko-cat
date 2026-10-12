# Ultra Plan — Simulasi Penuh Paket 3

2026-10-12 · Status: **rencana, belum ada yang dibangun** · Format mengikuti `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md` v2 (blueprint §3, kalibrasi blok 26–50 dengan denah), sama dengan Simulasi 2 (pkg 14) dan Latihan Paket 2 (pkg 3).

## 0. Ringkasan

| Komponen | Isi | Sumber |
|---|---|---|
| Kecerdasan | 100 butir baru, 90 menit | **package_number 15** (simulasi berikutnya mulai 15) |
| Kecermatan | 10 kolom × 50, siluet ikon (tipe Paket 9) | **package_number 10**, tetap untuk kartu 3 (tidak diacak). File: `prisma/data/bank_soal_p10.json` + 50 SVG baru `public/kecermatan-siluet/`; tidak ada ikon yang sama dengan p9 |
| Kepribadian | 48 KP + 63 Integritas & Kejujuran | **package_number 12**, paket baru. Manifest `bank/pribadi/paket-12.json`: 36 KP baru (`kp-sim3-01.json`) + 12 KP sisa bank + 63 SK baru (`sk-sim3-01.json`), kunci A 32 |

Hal baru di paket ini: 2 butir **FIG-SERI-MOSAIK** (hasil generator mosaik 2026-10-12) mengisi slot deret gambar 26–27, keduanya HOTS.

## 0a. Aturan wajib (arahan 2026-10-12)

1. Sebelum menyusun, baca `PEDOMAN_SIMULASI_KECERDASAN.md` dan `RULES GENERATE SOAL SPASIAL.md`.
2. **Soal dan pembahasan dibuat bersamaan** dalam satu generator atau file (teks: field `p`; gambar: field `pembahasan`). Tidak ada soal tanpa pembahasan.
3. **Figural dan denah wajib punya gambar pembahasan** (`pembahasan_svg`), seperti di drilling: jawaban terisi atau urutan benar, plus anotasi (panah, garis potong, nomor). Gambar ini disimpan di `scoring_rule.pembahasan_svg` (hanya dibaca server) lewat `backfill-pembahasan-kecerdasan.ts`, lalu dirender di `PembahasanSection`. Tidak boleh memakai `id` (dirender bersama butir lain).
4. Pembahasan figural mengikuti aturan 2 paragraf: (1) pola atau aturan, (2) eliminasi tiap opsi + jawaban.

## 1. Blueprint 100 butir + sumber per slot

Tingkat: 2 = sedang, 3 = HOTS. Target **40 / 60**, HOTS tidak menumpuk di awal subtes.

### Verbal (1–25) — teks
| No | Tipe | Jml | Tier (2/3) | Sumber |
|---|---|---|---|---|
| 1–5 | Sinonim (2 kunci) | 5 | 2/3 | `kecerdasan_p15_teks.json` |
| 6–10 | Antonim (2 kunci) | 5 | 2/3 | 〃 |
| 11–15 | Analogi (2 kunci) | 5 | 2/3 | 〃 |
| 16–19 | Kata ganjil | 4 | 2/2 | 〃 |
| 20–25 | Bacaan: 2 wacana original × 3 | 6 | 2/4 | 〃 |

### Logis / Spasial (26–50)
| No | Tipe | Jml | Tier | Sumber |
|---|---|---|---|---|
| 26–27 | **Deret gambar: MOSAIK** | 2 | 0/2 | generator mosaik (§2) |
| 28–30 | Matriks 3×3 | 3 | 1/2 | `generate-kecerdasan-figural-kal.ts` blok pkg 15 |
| 31–32 | Rotasi / pencerminan | 2 | 1/1 | 〃 |
| 33–34 | Susun potongan | 2 | 1/1 | `generate-kecerdasan-susun-kal.ts`, gambar baru (Codex) |
| 35–36 | Analogi gambar | 2 | 0/2 | figural-kal |
| 37 | Ikon kategori | 1 | 1/0 | figural-kal |
| 38–42 | Denah: peta A (2 ARAH + 2 RUTE), peta B (1 ROTASI) | 5 | 2/3 | `generate-kecerdasan-denah-kal.ts`, peta dan seed baru |
| 43–50 | Silogisme | 8 | 3/5 | teks |

### Analitis (51–75)
| No | Tipe | Jml | Tier | Sumber |
|---|---|---|---|---|
| 51–54 | Pola bundar angka (4 aturan berbeda R1–R5) | 4 | 2/2 | `figural-kal-bundar.ts` |
| 55–56 | Pola bundar campuran huruf | 2 | 0/2 | 〃 |
| 57–60 | Deret angka (2 kunci) | 4 | 2/2 | teks |
| 61–64 | Deret huruf / campuran (min 1 dua jalur) | 4 | 1/3 | teks |
| 65–75 | Wacana logika A(4) B(4) C(3) | 11 | 4/7 | teks + brute force `cek-wacana-kal.ts` |

### Praktis (76–100) — teks
| No | Tipe | Jml | Tier |
|---|---|---|---|
| 76–83 | Hitung cepat (≤ 30 s) | 8 | 6/2 |
| 84–88 | Pecahan, persen, akar/pangkat | 5 | 2/3 |
| 89–92 | Konversi satuan | 4 | 2/2 |
| 93–98 | Soal cerita (jebakan dua langkah) | 6 | 2/4 |
| 99–100 | Perbandingan kuantitatif / kecukupan data | 2 | 0/2 |

Angka tier per blok adalah target awal. Yang mengikat hanya total 40/60, dan seed memvalidasinya.

## 2. Mosaik masuk paket

Dari 5 butir uji (`scratchpad/mosaik5.ts`, belum di repo):

| Butir | Grid | Keputusan | Alasan |
|---|---|---|---|
| **Ular** | 3×3 | **No 26** | Ciri paling khas (warna menempel pada baris, putar hanya saat berbelok); 3 aturan |
| **Diagonal Tembus** | 3×3 | **No 27** | Torus + warna terbalik saat menembus tepi + cermin; mekanik berbeda dari Ular |
| Lompat | 3×3 | cadangan | Mirip Roda Gigi dan butir uji pertama (ring bergeser) |
| Roda Gigi | 4×4 | drill / latihan | Grid 4×4 terlalu kecil di HP pada lebar SVG sekarang (§7) |
| Cermin–Putar | 4×4 | drill / latihan | Sama; mekaniknya lebih cocok dengan rotasi/cermin |

Butir yang dipakai di simulasi **tidak boleh** muncul di latihan atau drill (anti-bocor). Cadangan baru masuk drill setelah simulasi terkunci.

Pekerjaan teknis:
1. Pindahkan mesin mosaik ke `scripts/figural-mosaik.ts`: tile, sampling sidik, `track`, `mirV/mirH/rotG`, render. Satu file, ekspor `MOSAIK_ITEMS` dalam bentuk `Built` yang sama dengan figural-kal.
2. Render memakai pembungkus `svgWrap` dari `figural-lib.ts` supaya lebar (`W = 850`) dan latar sama dengan butir lain. Instruksi memakai konstanta `POLA` yang sudah ada.
3. `generate-kecerdasan-figural-kal.ts` mengimpor `MOSAIK_ITEMS` dan mengisinya ke pkg 15 no 26–27, sama seperti `BUNDAR_ITEMS`.
4. Huruf kunci ditentukan ulang supaya sebaran A–E paket rata (§5).
5. Kode sub-tipe `FIG-SERI-MOSAIK`, kalau baris figural menyimpan sub-tipe. Awalan `FIG-SERI` otomatis masuk kartu K12.
6. Pembahasan dipadatkan menjadi maksimal 2 paragraf (aturan repo), tetap dengan alasan gugur per opsi dan satu tips.

## 3. Produksi per blok

Urutan mengikuti alur pkg 3 (`docs/rencana/kecerdasan-10-paket-latihan.md`).

1. **Teks 77 butir**: `prisma/data/kecerdasan_p15_teks.json`, format sama dengan p3 (`s, t, d`, field `h` untuk kunci numerik). Bacaan: 2 wacana original 150–250 kata.
2. **Wacana logika**: rancang 3 wacana dan tambahkan cek brute force ke `cek-wacana-kal.ts`. Solusi harus tunggal.
3. **Figural-kal pkg 15**: 8 butir (28–32, 35–37), memakai primitif dan `place()` yang sudah ada. Minimal dua aturan untuk HOTS.
4. **Mosaik**: 2 butir (§2).
5. **Pola bundar**: 6 butir (51–56), 4 aturan berbeda, distraktor sesuai pedoman §4.1–4.2.
6. **Susun**: 2 objek baru lewat Codex. Brief putaran pertama sudah memuat syarat yang terbukti perlu: objek memenuhi lebar, setiap strip punya landmark unik, setiap potongan memotong fitur. Benda saja, bukan manusia. Claude yang men-screenshot setiap putaran.
7. **Denah**: tambahkan entri pkg 15 ke `PKGS` dengan peta dan seed baru, tanpa tier mudah.

## 4. Seed dan masuk sistem

1. `seed-kecerdasan-kal.ts`: tambah cabang `compose(15)` yang meniru cabang pkg 3:
   - teks dari `kecerdasan_p15_teks.json`;
   - gambar dari `newRows(15)`;
   - cek komposisi per rentang nomor;
   - cek 40/60;
   - `checkNoLeak` terhadap teks p2, p3, s2, dan stem DB pkg 1, 12, 13, 14 serta latihan 2–11.
2. Validasi tanpa tulis: `npx tsx scripts/seed-kecerdasan-kal.ts`.
3. Tulis: `--apply 15`, hanya setelah QA (§6) dan persetujuanmu.
4. `lib/test-config.ts`: `SIMULASI_PAKET[3] = { KECERDASAN: 15, KEPRIBADIAN: 12, KECERMATAN: 10 }`. Tipe `SIMULASI_PAKET` perlu field `KECERMATAN` opsional, dan `lib/test-session.ts` memakai `bank.KECERMATAN ?? pickRandomKecermatanPackage()`. Penjaga latihan Kecermatan juga harus menolak pkg 10. `isSimulasiPackage` dan `simulasiKartuOf` otomatis ikut. Kartu 3 di `/dashboard/simulasi` terbuka sendiri begitu bank pkg 15 berisi.
5. Perbarui pedoman §6 (tabel paket) dan dokumen rencana 10 paket (baris Simulasi 3).

## 5. Aturan yang divalidasi skrip

- Komposisi per nomor sesuai §1, total 100.
- Tier tepat 40/60.
- Sebaran kunci A–E: **maksimal 24 per huruf** (pedoman §5). Batas seed sekarang 30; untuk paket ini pakai 24.
- Butir 2 kunci: 1–15 dan 57–64.
- Kunci numerik lolos `hitung`. Wacana lolos brute force.
- Figural: opsi unik (`place()` / sidik sampling mosaik), id SVG unik per butir.
- Mosaik: tidak ada pengecoh yang sama dengan gambar soal; beda antar-opsi ≥ 12 piksel sampel.
- Anti-bocor stem (§4.1).

## 6. QA sebelum insert

1. **QA buta Sonnet**: 4 kelompok paralel atas 100 butir. Model menjawab tanpa kunci, lalu temuan dicocokkan. Untuk butir gambar, verifikasi dulu setiap "ketidakcocokan" sebelum mengubah kunci, karena solver buta pernah salah membaca kiralitas dari koordinat SVG.
2. **Screenshot visual**: semua butir gambar lewat headless Chrome, di desktop dan **lebar HP 360 px**.
3. **Localhost**: kamu mencoba satu sesi Simulasi 3 penuh sebelum di-commit.
4. Checklist pedoman §7.

## 7. Risiko

| Risiko | Dampak | Penanganan |
|---|---|---|
| Mosaik di HP: SVG selebar 850 dengan 10 bingkai, ubin 3×3 kira-kira 17 px di layar 360 px | Titik dan arsir sulit dibaca | Uji 360 px dulu. Kalau tidak terbaca: bingkai soal dan opsi dibuat 2 baris (3+2), atau ubin dibuat lebih tebal dan sederhana. Grid 4×4 tidak dipakai di simulasi. |
| Pengecoh mosaik terlalu halus (beda di 1–2 ubin) | Soal terasa menjebak, bukan menguji | Batas ≥ 12 piksel sampel. Pantau `/admin/pengecoh` setelah tayang. |
| Susun lewat Codex butuh beberapa putaran | Jadwal molor | Kerjakan paling awal, paralel dengan teks. |
| Kepribadian masih pkg 11 | Peserta yang mengulang simulasi mendapat butir kepribadian yang sama | Keputusan terbuka. Kepribadian berbasis Likert dan pilihan paksa, jadi efek hafalannya lebih kecil. |
| Klaim HOTS belum terbukti | Kalibrasi tier meleset | Bandingkan p-value per butir setelah 30+ sesi. |

## 8. Urutan kerja

| Fase | Isi | Gate |
|---|---|---|
| A ✅ | Susun digambar Claude (motor patroli 5 potong, ekskavator 6 potong, di `generate-kecerdasan-susun-kal.ts`, tidak lewat Codex karena alur kal sudah begitu) + `scripts/figural-mosaik.ts` dipasang ke figural-kal pkg 15 no 26–27 + uji 360 px: tata letak **3+2** dipakai (ubin ±25 px; tata letak 5 per baris ±17 px terlalu kecil) | Lolos 2026-10-12 |
| B ✅ | Teks 77 (`kecerdasan_p15_teks.json`, 32 sedang/45 HOTS) + brute force pkg 15 di `cek-wacana-kal.ts` | Lolos 2026-10-12 |
| C ✅ | Figural 8 + bundar 6 (`figural-kal-bundar-15.ts`) + denah 5, semuanya dengan `pembahasan_svg` | Lolos 2026-10-12 |
| D ✅ | `compose(15)` lolos (40/60, kunci A24 B24 C24 D25 E26); QA buta Sonnet 100/100 cocok; #35, #37, #95 diperbaiki lalu diuji ulang | Lolos 2026-10-12 |
| E | `--apply 15` + `SIMULASI_PAKET[3]` + uji localhost | Persetujuanmu |
| F | Commit, perbarui pedoman dan memory | — |

## 9. Keputusan terbuka

1. ~~Kepribadian Simulasi 3~~: diputuskan paket baru (pkg 12). Stok bank KP/SK habis setelah paket 11, jadi paket simulasi berikutnya butuh butir baru lagi.
2. Aspek figural: taksonomi menulis `logis`, kartu K12 menulis `analitis`. Skor paket ini tetap dihitung per nomor (26–50 = Logis/Spasial), jadi ini hanya memengaruhi label drill.
3. Butir mosaik cadangan (Lompat, Roda Gigi, Cermin–Putar) dimasukkan ke drill FIG-SERI sekarang, atau menunggu latihan pkg 4–11?
