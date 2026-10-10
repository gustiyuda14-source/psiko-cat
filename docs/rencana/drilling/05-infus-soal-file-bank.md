# 05 — Rencana infus soal FILE PSIKO POLRI 2026 ke bank drill (berbasis file, tanpa seed DB)

Status: **RENCANA**. Belum ada soal yang ditranskrip/ditulis, belum ada kode. Kartu = 14 kartu Kecerdasan (usulan 2026-10-10) + Kecermatan + Sikap Kerja.

## 1. Pola dajiks-cest yang ditiru

| CEST | Fakta (file) | Versi psiko-cat |
|---|---|---|
| Sumber soal = JSON per tipe, dipisah sim vs drill | `scripts/bank/{sim/pN,drill}/<skill>/<TYPE>.json`; `BANK_SCHEMA.md` | `bank/drill/<modul>/<KARTU>.json` (mis. `bank/drill/kecerdasan/K05-hitung-cepat.json`). Simulasi Paket 1 tetap di DB seperti sekarang |
| Build + validasi, bukan seed | `scripts/build_bank.py`: gabung semua file, tolak id dobel, tolak bank kosong, cek per tipe, cetak sebaran kunci, cek tumpang-tindih 8-gram sim vs drill, gagal = exit 1 | `scripts/build-drill-bank.ts` (tsx, tanpa dependency) → `data/drill-bank.json`. Validasi sama + cek gambar ada + cek tidak tumpang-tindih dengan `soal.json` (Paket 1 simulasi) |
| Server baca file via `require` literal (ikut ter-bundle Vercel) | `lib/sim-core.js:16-26` | `lib/drill-bank.ts` (server-only) `import bank from "@/data/drill-bank.json"` |
| Folder privat diblokir | `middleware.js:13` `/data,/scripts,...` = 404 | `data/` dan `bank/` di luar `public/` → otomatis tidak bisa diakses browser |
| **Kelemahan CEST yang TIDAK ditiru:** drill bank publik di `assets/drill-bank.json` (kunci ikut ke browser, `cest.js:26`) | — | Kunci + pembahasan hanya di server. Browser menerima soal tanpa `kunci`/`pembahasan`; dicek lewat `POST /api/drill/check` |
| Progres di localStorage + `/api/sync` | `cest.js:17` `cest_drill_res` global | Tahap 1: sama (localStorage, global per peserta, tanpa migrasi DB). Tahap 2 (opsional): 1 tabel `drill_attempts` (item_id teks, tanpa FK ke `questions`) |

Konsekuensi: tambah/ubah soal = edit JSON → `npm run build:drill` → commit → deploy. Tidak ada `seed-*.ts`, tidak ada `INSERT` ke tabel `questions`.

## 2. Skema item (usulan, `bank/drill/BANK_SCHEMA.md`)

```json
{
  "id": "K05-B3-041",            // <kartu>-<sumber>-<no asal> ; item tulisan baru: <kartu>-N-nnn
  "kartu": "K05",                // K01..K14, KCM, SKJ
  "sub_type": "NUM-HIT-PECAHAN", // kode taksonomi 02
  "tier": 1,                     // 1 Dasar · 2 Menengah · 3 Lanjut
  "sumber": "B3#41",             // P1 / B3 / A3 / B2 / KD / R + nomor; "baru" utk tulisan sendiri
  "instruksi": "…",
  "stem": "…",                   // teks soal; boleh LaTeX ringan? (keputusan §7)
  "wacana_id": null,             // soal bacaan/wacana berbagi 1 stimulus
  "gambar": null,                // "drill/img/K12-A3-091.png" atau SVG inline
  "opsi": {"a":"…","b":"…","c":"…","d":"…","e":"…"},
  "opsi_gambar": null,           // {"a":"drill/img/…-a.png",…} bila opsi berupa gambar
  "kunci": ["c"],                // 2 huruf utk format 2-kunci; SERVER ONLY
  "pembahasan": "P1<br>P2",      // aturan 2 paragraf + tips; SERVER ONLY
  "status_kunci": "resmi|ganda|tunggal"  // resmi=dari PDF, ganda=2 pemeriksa independen sepakat, tunggal=belum terverifikasi
}
```

Hanya item `status_kunci` = `resmi` atau `ganda` yang boleh masuk build. Wacana disimpan sekali di `bank/drill/kecerdasan/wacana.json`.

## 3. Inventaris: apa yang diinfus

Aturan CEST: soal simulasi tidak boleh ada di drill. Jadi 100 soal kunci `1_5015…pdf` (= Paket 1 simulasi) dan 90 Kepribadian `1_5017233…pdf` (= Paket 1 simulasi) **tidak** diinfus. Pengecualian: figural asli PDF #26–37 tidak pernah masuk sistem (soal.json memakai pengganti) → boleh masuk drill.

| Kartu | Sumber kandidat | ± item mentah |
|---|---|---|
| K01 Sinonim & Antonim | B3 1–16, A3 1–12, B2 1–20 | 48 |
| K02 Analogi Kata | B3 17–24, A3 13–19, B2 21–30 | 25 |
| K03 Kata Ganjil | A3 20–25 | 6 |
| K04 Pemahaman Bacaan | B3 25–35, B2 31–40 | 21 (B2 sebagian rusak) |
| K05 Hitung Cepat | B3 36–45, 55–60; A3 35–43; B2 41–50; KD | 37 |
| K06 Konversi Satuan | B3 46–54, A3 44–50, B2 51–61 | 27 |
| K07 Soal Cerita | B3 61–70, A3 26–34, B2 62–70, Rute 1–10, KD | 42 |
| K08 Silogisme | B3 81–85, A3 76–85, B2 84–90, KD | 23 |
| K09 Deret Angka & Huruf | B3 71–75, A3 51–55, B2 71–76, KD | 17 |
| K10 Angka dalam Gambar | B3 76–80, A3 56–60, 74–75, B2 77–83 | 19 |
| K11 Wacana Logika | B3 86–90, A3 62–73 | 17 |
| K12 Pola & Matriks Gambar | A3 91–97, B3 96–100, B2 98–100, P1 asli 26–28/31–33/35–36, KD19 | 24 |
| K13 Ikon Kategori | B3 91–95, A3 86–90, B2 91–97 | 17 |
| K14 Susun Potongan Gambar | P1 asli 29/30/34/37, A3 98–100 | 7 |
| Kecermatan | Simbol Yunani 10 kolom × 50 | 500 (1 paket drill) |
| Sikap Kerja | 63 pilihan paksa + kunci | 63 |

Total Kecerdasan ±354 mentah → perkiraan **±300 lolos** setelah buang duplikat (B45=A61, A100=KD22, KD1–4/15/16 = B2, KD21=A78, KD23=A43), buang di luar profil (KD9–12 kalkulus/program linier), dan buang soal rusak yang tidak bisa diperbaiki.

Catatan jujur: ±300 soal di 14 kartu = rata-rata ±21 per kartu, di bawah target 24–36 per tingkat untuk pengukuran penguasaan. Infus ini = **bank awal**; tingkat (tier) baru bisa diukur setelah soal baru (original) ditambah.

## 4. Pipeline per batch (1 batch = 1 kartu, urut jalur belajar 02 §5.5)

1. **Transkripsi** (Claude): render 200 dpi, baca per halaman, tulis JSON sesuai skema. Gambar: ekstrak resolusi asli (`pdfimages`) atau crop render → PNG ≤ 100 KB → `public/drill/img/<id>*.png` (nama file = id, tidak membocorkan kunci).
2. **Kunci**:
   - P1 asli & Sikap Kerja: kunci resmi dari PDF, tetap dicek (kunci salah sudah ditemukan: P86, P39, dll.).
   - B3/A3/B2/KD/Rute (tanpa kunci): pemeriksa A (Claude) dan pemeriksa B independen (Codex CLI atau model lain, tanpa melihat jawaban A). Sepakat → `ganda`. Beda → masuk daftar keputusan user.
3. **Perbaikan / buang**: semua masalah di 02 §6, 03 §5, 04 §3 diputuskan per item: perbaiki (ganti 1 opsi, tulis ulang stem rusak) atau buang. Dicatat di `bank/drill/LOG.md`.
4. **Pembahasan** per item: aturan → "Opsi X gugur karena …" → 1 tips cepat (format drill CEST yang lebih kaya: kunci + pengecoh + tips).
5. **Tag**: kartu, sub_type, tier (kriteria 02 §2), sumber.
6. **Hak cipta & konten**: wacana Republika/Katadata ditulis ulang; logo partai/merek/foto asli di soal ikon diganti gambar original (Codex image_generation) — atau dibuang (keputusan §7).
7. **Build**: `npm run build:drill` → validasi gagal = tidak ada output. Cetak sebaran kunci & jumlah per kartu/tier.
8. **QA visual**: `output/drill-preview/<kartu>.html` (semua soal + kunci + pembahasan) dicek manusia sebelum commit.

Pembagian kerja (pola memory codex-split): Claude = transkripsi, pemeriksa A, pembahasan. Codex = pemeriksa B kunci (teks), script build & validator. Codex tidak bisa commit/akses network → Claude audit diff lalu commit.

## 5. Perubahan kode (kecil, setelah bank pertama ada)

1. `bank/drill/**` + `bank/drill/BANK_SCHEMA.md` + `scripts/build-drill-bank.ts` + npm script `build:drill` (juga dijalankan di `npm run build`, supaya deploy selalu memakai bank tervalidasi).
2. `lib/drill-bank.ts` (server-only): muat `data/drill-bank.json`, index by id/kartu, fungsi `safeItem()` yang membuang `kunci`, `pembahasan`, `status_kunci`.
3. Halaman katalog drill (14 kartu dalam 5 tab aspek) + modal kartu (tier, set berikutnya yang belum dikerjakan) + layar set 10 soal — memakai komponen latihan yang ada (`ExamChrome`, `PembahasanSection`).
4. `POST /api/drill/check` `{item_id, pilihan}` → `{benar, kunci, pembahasan}`; validasi input; tidak menyentuh tabel `questions`.
5. Progres tahap 1 di localStorage (`psiko_drill_res = {id:[benar,total,ms]}`), global per peserta.
6. Kecermatan drill: baca bank simbol dari file yang sama (format `bank_soal_pN.json` yang sudah ada), bukan dari DB.

Yang tidak berubah: simulasi (Paket 1 di DB), latihan paket lama, scoring NAP.

## 6. Urutan batch (usulan)

1. K05 Hitung Cepat + K06 Konversi Satuan (kunci mudah diverifikasi dengan hitungan, sekaligus menguji pipeline & skema).
2. Kecermatan Yunani (kunci otomatis) + Sikap Kerja (kunci resmi, setelah konflik dimensi diputuskan).
3. K09 Deret, K10 Angka dalam Gambar, K08 Silogisme, K07 Soal Cerita.
4. K01–K04 Verbal & Bacaan (kunci verbal paling banyak perdebatan; bacaan perlu ditulis ulang).
5. K11 Wacana Logika.
6. K12–K14 Figural (crop gambar + QA visual paling berat).

## 7. Keputusan (disetujui user 2026-10-10: "aku ikuti rekomendasimu")

1. **Adaptasi ringan.** Angka, kata, dan gambar diubah; struktur, sub-task, dan tingkat kesulitan sama dengan sumber. Kolom `sumber` tetap mencatat asal untuk audit, tapi isi soal bukan salinan. Wacana ditulis ulang total.
2. Soal ikon dengan logo partai/merek/foto asli: gambar diganti ikon original (Codex image_generation), kategori dipertahankan.
3. Progres tahap 1 di localStorage (tanpa migrasi DB); tabel `drill_attempts` menyusul bila perlu lintas perangkat.
4. Rumus: teks + Unicode (√, ², ³√, pecahan "a/b"); bentuk bertingkat yang tidak terbaca dalam teks memakai SVG rumus.
5. Katalog 14 kartu Kecerdasan (5 tab aspek) + Kecermatan + Sikap Kerja; Kepribadian menunggu keputusan terpisah.
6. Batch pertama: K05 Hitung Cepat + K06 Konversi Satuan. **Mulai hanya atas perintah user.**
