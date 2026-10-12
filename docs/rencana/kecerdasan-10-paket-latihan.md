# Rencana 10 Paket Latihan Kecerdasan

2026-10-12 · Komposisi mengikuti `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md` §3 (versi 2, blok Logis/Spasial dengan denah).

## Status

| Label latihan | package_number | Status |
|---|---|---|
| Paket 1 | 2 | Blok 26–50 dikalibrasi di tempat (blok lain komposisi lama) |
| Paket 2 | 3 | Selesai, 100 soal baru, QA buta Sonnet 100% cocok |
| Paket 3–10 | 4–11 | Belum |

Simulasi: kartu 1 = pkg 13, kartu 2 = pkg 14 (pkg 1 dan 12 tetap aktif untuk riwayat). Simulasi berikutnya mulai pkg 15.

## Alur per paket (contoh pkg 3)

1. Teks 77 soal: `prisma/data/kecerdasan_pN_teks.json` (format sama dengan p3, tingkat 2/3, field `h` untuk kunci numerik).
2. Wacana logika: rancang dengan brute force, tambahkan cek ke `scripts/cek-wacana-kal.ts`.
3. Gambar: tambahkan butir pkg N ke `generate-kecerdasan-figural-kal.ts` (12 figural), `figural-kal-bundar.ts` (6 bundar), `generate-kecerdasan-susun-kal.ts` (2 susun, gambar baru), dan `PKGS` di `generate-kecerdasan-denah-kal.ts` (5 denah, seed baru).
4. Validasi: `npx tsx scripts/seed-kecerdasan-kal.ts` (komposisi, 40/60, kunci ≤ 30 per huruf, anti-bocor, id SVG).
5. QA buta Sonnet atas semua butir baru, perbaiki temuan, lalu `--apply N`.

Disarankan dikerjakan per batch: pkg 4–6, 7–9, 10–11.
