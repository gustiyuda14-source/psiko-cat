# LOG — Analisis Hasil Latihan Kecermatan

Rencana: `kecermatan-latihan-analisis.md`. Entri terbaru di bawah.

## 2026-10-19 · Sesi 1 (Claude + subagent desain)

**Selesai (belum commit):**
- F1 pencatatan waktu:
  - `app/latihan/[module]/useKecermatanTiming.ts` (jam aktif, tab tersembunyi dikurangi; kolom clean; markAnswer/markNav/reset/snapshot).
  - Dipasang di `LatihanKecermatan.tsx` (jawab, mundur/maju/lompat, reset), lalu dikirim lewat `AttemptSaver` → `saveLatihanAttempt(…, timing)` → `/api/progress` (validasi `cleanAttemptTiming`, UPDATE `latihan_attempts.timing` setelah RPC; gagal simpan tidak menggagalkan percobaan).
  - `lib/latihan-review.ts` membaca `timing` lewat query terpisah, jadi pembahasan tetap terbuka sebelum migrasi.
  - State pelafalan dipindah ke `usePelafalan.ts` (file sesi 511 → 484 baris).
- Migrasi (DIJALANKAN PEMILIK di Supabase SQL Editor): `ALTER TABLE latihan_attempts ADD COLUMN IF NOT EXISTS timing jsonb;` (dicatat di `docs/rencana/sql/latihan-attempts.sql`).
- F2 `lib/kecermatan-analisis.ts` (`analyzeKecermatan`, `titikHafalDari`) + `lib/kecermatan-analisis.test.ts` lolos. `cleanAttemptTiming` diuji di `lib/progress-rules.test.ts`. `tsc` lolos.
- Keputusan: nilai bayangan = 60 detik pertama SEMUA kolom yang dikunjungi; kolom tak dikunjungi = 0 (sama seperti ujian). Kolom tidak urut tetap dihitung dan dilaporkan jumlahnya. Nilai bayangan TIDAK disimpan ke `latihan_kecermatan_scores`: panggil `scoreLatihanKecermatan(stats)` tanpa progressKey.

**Berjalan:** subagent desain → `output/kecermatan-review-prototype.html` + screenshot di scratchpad sesi (review-mobile.png, review-desktop.png) + rincian komponen/teks/kelas CSS.

**Berikutnya (F3):**
1. Pemilik setujui prototipe.
2. `LatihanKecermatanHasil.tsx` terima `timing`; hitung `analyzeKecermatan(items, timing)`. Item dibangun dari `sorted` + `answers` + `symbol_map`.
3. Nilai bayangan: layar selesai → `scoreLatihanKecermatan(a.bayangan)` (tanpa progressKey). Pembahasan → `calculateKecermatan(a.bayangan)` di `loadLatihanReview`.
4. Teruskan `timing.snapshot(showPelafalan)` ke Hasil. Di pembahasan: `review.kecermatan.timing`.
5. Teks hangat + analogi sesuai prototipe; label "Perkiraan latihan, bukan nilai ujian".
6. Verifikasi: tsc, kedua test, `next build --webpack`, cek layar di localhost oleh pemilik, lalu commit hanya path sendiri.

**Prompt lanjutan (tempel di sesi baru):**
> Lanjutkan F3 analisis hasil latihan Kecermatan. Baca `psiko-cat/docs/rencana/kecermatan-latihan-analisis.md` dan entri terakhir `…-LOG.md`, lalu prototipe `psiko-cat/output/kecermatan-review-prototype.html`. F1+F2 sudah ada di working tree (belum commit). Implementasikan UI sesuai prototipe yang sudah aku setujui dengan diff minimal (ponytail), verifikasi, dan biarkan belum di-commit sampai aku cek di localhost.

### Tambahan sesi 1: prototipe desain selesai
- `output/kecermatan-review-prototype.html` (toggle state a/b/c, layar selesai/pembahasan/lama, tema). Screenshot di scratchpad sesi 1: review-mobile*.png, review-desktop*.png.
- Kelas CSS baru = bagian 4 `<style>` prototipe ("KELAS BARU") → tempel ke `app/honey.css`. Bagian 5 (toggle bar) JANGAN.
- Semua UI masuk `LatihanKecermatanHasil.tsx`: komponen HexMeter/Bar/lr-chart/lr-cols dipakai ulang, plus helper Plot ±10 baris, tab `role=tablist`.
- Penyesuaian saat F3:
  - Prototipe menganggap kolom tidak urut "tidak dihitung". Keputusan lib: tetap dihitung. Ganti catatan jadi info ("Kolom IV dikerjakan tidak urut") dan jangan pakai batang `is-skip` untuk kolom yang dikunjungi.
  - Batang `is-skip` hanya untuk kolom yang tidak dikunjungi (= 0).
  - Nama field prototipe dipetakan ke `Analisis` di lib: `bpm`=benarPerMenit, `acc`=akurasi, `o`=urutan, `hafal`=titikHafal, `persen`=lebihCepatPct, `pairs`=tertukar. `pre`/`post` perlu ditambahkan ke `titikHafalDari` (rata-rata sebelum/sesudah).
- Usulan terbuka: (1) panel sticky desktop dilepas bila lebih tinggi dari layar; (2) kasus nilai rendah → tombol utama "Ulangi pakai timer" (keputusan pemilik).

### Tambahan sesi 1: keputusan pemilik setelah prototipe
- Prototipe DISETUJUI, termasuk usulan (1) tombol utama kasus nilai bayangan rendah = "Ulangi pakai timer" dan (2) panel sticky desktop dilepas bila lebih tinggi dari layar.
- Kecermatan latihan: per paket tersimpan 1 pembahasan DENGAN waktu + 1 TANPA waktu; mengulang mode yang sama langsung menggantikannya tanpa dialog (koreksi pemilik: bukan 1 total). Sudah dibuat (belum commit):
  - `maxLatihanAttempts(key)` di `lib/progress-rules.ts` (+test).
  - `/api/progress` menghapus percobaan lebih lama dengan mode `timed` yang sama (`id < baru`) setelah RPC, jadi tanpa migrasi dan aman dari kiriman bersamaan. `AttemptList` kini membawa `timed`.
  - `AttemptSaver` tidak lagi bertanya untuk Kecermatan; teks "menggantikan percobaan sebelumnya".
  - `PackageCarousel`: label "Dengan waktu" / "Tanpa waktu" untuk Kecermatan, plus catatannya.
  Modul lain tetap 2.

### Tambahan sesi 1: perluasan F3 (permintaan pemilik 19-10)
Grafik "Kapan kunci mulai hafal?" (kurva adaptasi + titik hafal) juga harus muncul di:
1. **Latihan Kecermatan mode timer.** `useKecermatanTiming` sudah mencatat kedua mode, jadi cukup tampilkan juga saat `timedMode`. Kurva hanya sampai butir yang tercapai dalam 60 detik (±20–30), dan tab lain tetap seperti prototipe.
2. **Pembahasan Simulasi Penuh (tes asli).**
   - Sumber data: `kecermatan_logs` (`clicked_at_ms` jam dinding, `question.sequence_number`, `column_index`), sudah dibaca di `lib/review.ts` `fetchKecermatanDetailReview`.
   - Waktu per butir = selisih klik berurutan di kolom yang sama. Butir pertama tiap kolom tidak punya jam mulai kolom, jadi tidak dihitung, atau: ponytail, mulai kurva dari posisi 2.
   - Pakai ulang `titikHafalDari()` dan helper `Plot` yang sama. Jangan duplikasi.
   - `titikHafalDari` butuh ≥ 5 titik sesudah k. Kalau tes asli hanya sampai ±20 butir per kolom, tampilkan "Belum cukup butir untuk membaca titik hafal" alih-alih memaksa.
   - Cari komponen pembahasan simulasi Kecermatan (grep `fetchKecermatanDetailReview`) dan tempel grafik di sana dengan gaya prototipe.

### Tambahan sesi 1: migrasi
- 2026-10-19: pemilik menjalankan `ALTER TABLE latihan_attempts ADD COLUMN IF NOT EXISTS timing jsonb;`. Kolom sudah diverifikasi ada.

## 2026-10-19 · Sesi 2 (F3 UI, belum commit, menunggu cek pemilik di localhost)

- `LatihanKecermatanHasil.tsx`: prop `timing`; `analyzeKecermatan` di browser; Nilai 60 detik lewat `scoreLatihanKecermatan(bayangan)` tanpa progressKey (layar selesai DAN pembahasan, jadi `latihan-review.ts` tidak berubah). Gate/legacy, `lr-say`, `lr-why`, grafik "Dalam 60 detik pertama" (berarsir = kolom belum dikerjakan; kolom tidak urut = catatan info). Tab: tanpa timer "Tanpa batas waktu / Analisis / Per kolom", mode timer "Analisis / Per kolom" (panel skor murni tetap).
- Rata-rata butir 60 detik < 15 → tombol utama "Ulangi pakai timer" (`?timed=1&autostart=1`). Ambang sementara, F4.
- Panel sticky dilepas (`.is-tall`) bila lebih tinggi dari layar (ResizeObserver).
- `LatihanKecermatanAnalisis.tsx` (baru): `Plot`, `HafalSection`, `HafalSimulasi`, `ProfilPane`, `AnalisisPane`. CSS bagian 4 prototipe → `app/latihan-analisis.css` (honey.css sudah 465 baris).
- Lib: `kurvaDari()` diekstrak; `titikHafalDari` kini juga `sebelum`/`sesudah` (+test).
- Simulasi Penuh: `fetchKecermatanDetailReview` menambah `ms` (jeda dari klik sebelumnya di kolom yang sama); `PembahasanNavigator` menampilkan `HafalSimulasi` di bawah navigasi nomor saat sub-tes Sikap Kerja. < 10 posisi berdata → "Belum cukup butir untuk membaca titik hafal".
- Verifikasi: tsc, semua `lib/*.test.ts`, `check:scoring`, eslint file terkait, `next build --webpack` lolos.
