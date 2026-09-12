# Ajiks Akademi Psiko CAT — build plan on top of `psiko-cat`

## Context

Keputusan sudah diambil (lihat PRD: https://claude.ai/code/artifact/b3912c81-4021-4a7e-a611-88b5e9b1a620): platform Ajiks Akademi ke depan bukan `PAGE-ACCURACY-V3` (prototype vanilla JS), tapi codebase `psiko-cat` ini (Next.js 16 + Prisma + Supabase) yang di-reskin ke identitas visual navy/gold V3 dan ditambah fitur yang belum ada.

Menu target (dari user):
1. **Beranda** — laporan hasil tryout, frekuensi latihan, perkembangan siswa dari waktu ke waktu.
2. **Kecerdasan** → Latihan Soal (berdiri sendiri, paket dari admin).
3. **Kecermatan** → Training (tanpa waktu) + Real Exam (1 menit/kolom), keduanya punya pembahasan dropdown soal-yang-salah.
4. **Kepribadian** → Latihan Soal (berdiri sendiri).
5. **Tryout Psiko Lengkap** — gabungan 3 modul.

Yang sudah jalan di `psiko-cat` (dikonfirmasi baca kode langsung, bukan asumsi): menu #5 saja — `app/test/new/page.tsx` selalu bikin 1 `TestSession` isi ke-3 `ModuleSession` sekaligus (hardcoded), tidak ada jalur 1-modul. Engine Kecerdasan/Kepribadian (`EngineKecerdasan.tsx`, `EngineKepribadian.tsx`) sudah pakai hook generik `lib/hooks/use-exam-engine.ts` (deadline timer, resume, offline, answer-flush) — reusable buat entry point baru. Engine Kecermatan (`EngineKecermatan.tsx`) bertimer per-kolom sendiri, tidak pakai hook itu. `PembahasanSection.tsx` sudah render dropdown collapsible per soal-salah untuk Kecerdasan (`KecerdasanReview`) — pola persis yang diminta untuk Kecermatan, tinggal dicontek. `lib/types/safe-question.ts` mengonfirmasi `scoring_rule`/`correct_choice`/`correct_key` memang didesain SERVER-ONLY, tidak pernah dikirim ke client (`SafeQuestion = Omit<QuestionModel, "scoring_rule">`).

**Keputusan produk yang sudah difinalkan bareng user:**
- Latihan/Training (mode tanpa waktu, semua modul) → **tidak disimpan ke server sama sekali**. Client-only, mirip pola lama V3. Tidak masuk hitungan NAP resmi, tidak muncul di riwayat Beranda (Beranda cuma nampilin attempt resmi: Real Exam standalone + Tryout Lengkap).
- Real Exam Kecermatan standalone (1 modul) & Latihan Soal Kecerdasan/Kepribadian kalau suatu saat butuh versi "resmi" → **reuse struktur `TestSession` yang ada apa adanya**, cukup diisi 1 `ModuleSession` bukan 3. Nol perubahan schema Prisma.

Catatan: repo ini punya perubahan lokal belum di-commit di luar sesi perencanaan ini (`app/rescue/`, `app/api/rescue/route.ts`, `app/api/admin/recalculate/route.ts` — tooling recovery jawaban & force-recalculate NAP). Tidak bersinggungan dengan scope di bawah; jangan sampai ke-stash/ke-timpa.

## Fase 1 — Reskin visual (navy/gold/Cormorant)

Ganti token Tailwind di semua halaman dari `zinc-950`/`blue-600`/`emerald-400` ke palet V3: `--navy #1B2B4B`, `--gold #C9A96E`, `--cream #F5F0E8`, `--sage #4A7C59` (sukses/lulus), `--red #C0392B` (gagal/gugur). Tambah Cormorant Garamond (heading) di samping Inter (body) — sama persis link Google Fonts yang dipakai V3.

File yang disentuh: `tailwind.config` (atau `app/globals.css` `@theme` block di Tailwind v4) untuk definisi token sekali, lalu `app/login/page.tsx`, `app/dashboard/page.tsx`, `app/admin/page.tsx`, `app/components/engines/Engine{Kecerdasan,Kepribadian,Kecermatan}.tsx`, `app/test/[sessionId]/result/page.tsx`, `app/components/PembahasanSection.tsx` — murni swap class warna, nol perubahan logic.

Verifikasi: `npm run dev`, buka tiap halaman di atas, bandingkan visual sama V3 (referensi token warna ada di `PAGE-ACCURACY-V3/css/styles.css`, repo terpisah).

## Fase 2 — Entry point standalone per-modul (Real Exam)

`app/test/new/page.tsx` diparameterisasi: terima daftar modul (bukan hardcode 3), dipanggil dari route baru `app/test/new/[module]/page.tsx` (`module` = `kecerdasan` | `kepribadian` | `kecermatan`) yang bikin `TestSession` isi 1 `ModuleSession` sesuai `time_limit_seconds` masing-masing (Kecermatan tetap butuh total session cap terpisah dari timer 60 detik/kolom internal engine-nya). Dashboard (`app/dashboard/page.tsx`) dapat 3 tombol baru ("Real Exam Kecermatan" dst) di samping "Mulai Tes Baru" (tryout lengkap) yang sudah ada.

Reuse: `runSessionCalculate()` (`lib/scoring/runner.ts`) sudah generik per-`ModuleSession`, jalan apa adanya untuk session isi 1 modul — TIDAK perlu diubah.

## Fase 3 — Latihan/Training (tanpa waktu, client-only, tidak disimpan)

Route baru per modul, mis. `app/latihan/kecerdasan/page.tsx`, `app/latihan/kepribadian/page.tsx`, `app/latihan/kecermatan/page.tsx` (Training). Alur:
1. API baru **read-only**, mis. `GET /api/practice/[type]` → balikin `SafeQuestion[]` utuh untuk 1 tipe modul (query `questions` where `type` + `is_active`, select tanpa `scoring_rule` — reuse tipe `SafeQuestion`).
2. Jawaban dicek via API baru **stateless**, `POST /api/practice/check` `{question_id, selected_key}` → `{is_correct, correct_key}` (untuk Kecerdasan/Kecermatan) atau tanpa `is_correct` (Kepribadian, tidak ada benar/salah). Endpoint ini TIDAK menulis apapun ke DB — murni baca `scoring_rule` server-side lalu bandingkan.
3. Komponen client latihan reuse tampilan `Engine*` yang ada tapi lewat props/flag baru (`mode="latihan"`): tanpa timer, tanpa `beforeunload` guard, tanpa panggilan flush-answer/heartbeat/complete ke `/api/sessions/*` — cukup local state React + panggilan ke `/api/practice/check` per jawaban buat feedback langsung.

Ini bagian dengan kode baru paling banyak karena Engine sekarang diasumsikan selalu attached ke session server — perlu dipisah bagian "UI soal" dari bagian "session bookkeeping" biar keduanya (exam-mode lewat `use-exam-engine.ts`, latihan-mode lewat `/api/practice/*`) bisa pakai komponen tampilan yang sama.

## Fase 4 — Pembahasan per-soal Kecermatan

Data sudah ada (`kecermatan_logs.is_correct`, diisi saat `runSessionCalculate`). Tambah `KecermatanDetailReview` di `PembahasanSection.tsx`, pola sama `KecerdasanReview` (baris 84-164 di file itu): group log per `column_index`, tampilkan simbol yang muncul (`shown`) + kunci (butuh join ke `questions.options_payload.symbol_map`, bukan dari `scoring_rule` — aman dikirim). Ganti `KecermatanReview` yang sekarang cuma nampilin ringkasan Ke/Kt/Kh jadi dua bagian: ringkasan (tetap) + dropdown per-kolom soal-salah (baru).

## Fase 5 — Beranda: frekuensi & tren

`app/dashboard/page.tsx` dapat section baru: hitung `test_sessions` peserta per minggu/bulan (frekuensi attempt resmi — latihan tidak masuk sesuai keputusan di atas), plus tren `nap_score` dari sesi selesai berurutan waktu. Chart: sparkline SVG tulis tangan kecil (tidak nambah dependency chart library baru — data-nya simpel, garis + titik).

## Fase 6 — Admin: generator paket Kecermatan (menggantikan seed manual)

Port logic generator V3 (`SYMBOL_SETS`, `seededRand`, `shuffleArr`, `generateSoalJS` — di `PAGE-ACCURACY-V3/js/adminPanel.js`, repo terpisah) ke `app/admin/paket-kecermatan/page.tsx` + API route insert ke `questions` (`type: "KECERMATAN"`, `column_index`, `options_payload: {symbol_map, shown, choices}`, `scoring_rule: {type:"symbol_match", correct_choice}`). Begitu ini ada, isi bank soal Kecermatan psiko-cat (yang sekarang kosong) tinggal di-generate lewat UI ini — tidak perlu migrasi manual `bank_soal_p7.json` sebagai langkah terpisah.

## Status eksekusi

- **Fase 1 — SELESAI** (commit `b6d1cec`, branch `feat/ajiks-rebrand`, 2026-09-07).
  Palet V3 dipasang lewat remap skala warna Tailwind di `@theme` (`app/globals.css`),
  bukan swap ~490 class satu per satu — hasil visual sama, satu file, revert satu baris.
  Konsekuensi: `bg-blue-600` = gold, `zinc-*` = ramp navy, `emerald-*` = sage, `red-*` = merah V3,
  `amber`/`yellow` = gold. Tombol gold pakai teks navy (putih di atas gold cuma 2.1:1).
  Token semantik (`bg-navy`, `text-gold`, `bg-cream`, `text-sage`, dst) sudah tersedia —
  **kode baru Fase 2+ pakai token ini, jangan nama warna Tailwind.**
  Font Geist diganti Inter (body) + Cormorant Garamond (h1/h2). `npm run build` hijau.
  Belum di-commit (nempel di WIP modal konfirmasi milik user): fix teks tombol 1 baris di
  `EngineKecerdasan.tsx` & `EngineKepribadian.tsx`.
- **Fase 2 — SELESAI** (commit `c38ab15`, branch `feat/ajiks-rebrand`, 2026-09-07).
  `lib/test-session.ts` (baru): `createTestSessionAndRedirect(userId, moduleTypes[])` generik,
  dipanggil dari `app/test/new/page.tsx` (tryout lengkap, 3 modul) dan route baru
  `app/test/new/[module]/page.tsx` (1 modul standalone, slug kecerdasan/kecermatan/kepribadian
  lewat `SLUG_TO_MODULE`). Dashboard dapat 3 tombol "Real Exam per Modul".
  Diverifikasi lewat curl+cookie: Real Exam Kecermatan standalone -> `test_sessions` cuma
  isi 1 `module_sessions` row; tryout lengkap tetap 3 modul urut benar. `npm run build` hijau.
  Session verifikasi (dummy, akun aurel) sudah dihapus dari DB setelah dicek.
- **Fase 3 — SELESAI** (commit `74fc93a`, branch `feat/ajiks-rebrand`, 2026-09-07).
  Premis awal Fase 6-sebelum-3 ("bank soal Kecermatan kosong") sudah tidak berlaku — dicek
  langsung ke DB, 500 soal `KECERMATAN` (10 kolom × 50) sudah ada dari seed manual sebelumnya.
  Ditanya ke user, pilih lanjut Fase 3 dulu; Fase 6 (admin generator) dikerjakan belakangan
  kalau/saat dibutuhkan nambah bank soal, bukan blocker.
  Route `app/latihan/[module]/page.tsx` (server component, fetch `SafeQuestion[]` langsung
  lewat `supabaseAdmin` — **bukan** `GET /api/practice/[type]` terpisah seperti draft plan,
  disederhanakan karena polanya sama persis dengan `test/[sessionId]/*` yang sudah ada) +
  3 komponen client berdiri sendiri (`LatihanKecerdasan/Kepribadian/Kecermatan.tsx`) — TIDAK
  reuse `use-exam-engine`/`exam-store` (hook itu terikat ketat ke sessionId/timer/flush server;
  retrofit lewat flag `mode="latihan"` lebih besar & lebih berisiko ke real-exam dibanding
  nulis versi lokal murni `useState`). Endpoint baru `POST /api/practice/check` — stateless,
  baca `scoring_rule` server-side per soal, balikin `{is_correct, correct_key}`, tidak pernah
  menulis ke DB. Kepribadian tidak manggil endpoint ini sama sekali (Likert, tidak ada
  benar/salah). Dashboard dapat 3 link "Latihan / Training".
  Diverifikasi: GET ketiga route → 200; POST check kunci benar & salah → hasil sesuai; hitung
  baris `module_sessions`/`answers`/`kecermatan_logs`/`test_sessions` sebelum vs sesudah →
  identik. `npm run build` hijau.
  Fix susulan (masih di scope Fase 3, user minta setelah lihat hasil): commit `3adc56d` —
  layar `LatihanGate.tsx` (info jumlah soal + tombol "Mulai Latihan") sebelum masuk soal
  nomor 1, dan Latihan Kecermatan auto-advance ke soal berikutnya (bukan tombol manual).
  Commit `2b13df8` — dashboard hapus section "Riwayat Tes", tambah `window.confirm()`
  sebelum menyelesaikan tes/latihan di beberapa titik yang belum ada konfirmasi
  (`EngineKecermatan` real exam, `ConfirmSubmitButton` baru di session overview, link keluar
  Latihan kalau sudah ada progres).
- **Fase 4 — SELESAI** (commit `ca4e56a`, branch `feat/ajiks-rebrand`, 2026-09-07).
  `PembahasanSection.tsx` dapat `KecermatanDetailReview` — dropdown per lajur (10x, nested di
  dalam dropdown "Kecermatan" yang sudah ada), isi cuma soal yang salah per lajur (bukan
  semua 500), tampilkan simbol `shown` + kunci jawaban. Kunci diturunkan murni dari
  `options_payload` (`shown` vs `symbol_map` — simbol yang "hilang" dari `shown` itu
  jawabannya) — **tidak pernah baca `scoring_rule`**, sama seperti didesain di plan.
  `result/page.tsx` dapat `fetchKecermatanDetailReview()`, fetch payload soal cuma untuk yang
  salah (hemat, bukan fetch 500 soal).
  Bug ditemukan & difix saat verifikasi (bukan scope Fase 4 tapi blocking): `runSessionCalculate()`
  di `lib/scoring/runner.ts` crash (destructure `undefined`) untuk sesi Real Exam standalone
  (Fase 2, cuma 1 `module_session`) — kode lama asumsi selalu 3 modul lengkap. Tanpa fix ini
  "Real Exam [modul]" standalone dari Fase 2 gak pernah bisa nyampe halaman hasil. Modul yang
  tidak diikutkan sekarang dianggap kontribusi 0, tidak menggugurkan.
  Diverifikasi: insert 5 `kecermatan_logs` manual (3 benar 2 salah) ke sesi standalone
  Kecermatan, trigger `?calculate=1` → tidak crash (sebelumnya 500). Kunci hasil derive
  dicocokkan manual ke `scoring_rule` asli untuk 2 soal salah → cocok. Data uji dihapus
  setelah dicek. `npm run build` hijau.
- **Fase 5 — SELESAI** (commit `cfbbbf7`, branch `feat/ajiks-rebrand`, 2026-09-07).
  `app/dashboard/ActivityCharts.tsx` (baru): `WeeklyFrequencyChart` (bar 8 minggu terakhir,
  `test_sessions` resmi — Latihan tidak dihitung karena memang tidak disimpan) +
  `NapTrendChart` (line `nap_score` sesi selesai berurutan waktu, endpoint diberi label).
  Sparkline SVG tulis tangan sesuai plan, nol dependency chart baru. Sebelum nulis kode,
  cek skill `dataviz` (trigger kata "sparkline") — bentuk dipilih dari `choosing-a-form.md`
  ("single value + trend → stat tile + sparkline"), warna 1-hue (redup untuk histori, gold
  buat periode berjalan), BUKAN categorical, sengaja hindari encoding pakai pasangan
  sage/red — divalidasi pakai `validate_palette.js`, pasangan itu gagal chroma floor & CVD
  separation di ambang 6-8 buat dark surface app ini.
  Diverifikasi: insert 5 `test_sessions` dummy tanggal & `nap_score` beda-beda, kedua chart
  match data (jumlah per-minggu benar, tren naik sesuai urutan, endpoint label = nilai sesi
  terakhir). Ketemu & dibereskan sampah tambahan: belasan `test_sessions` `PENDING` nyasar
  dari verifikasi Fase 2/3/4 sebelumnya yang belum kehapus. Edge case (0 sesi dalam window,
  1 sesi di luar window) dicek tidak crash. `npm run build` hijau.
- **Fase 6 — belum dikerjakan.**

## Urutan eksekusi

Fase 1 (independen, bisa duluan) → Fase 2 → Fase 3 (bank soal Kecermatan ternyata sudah ada,
Fase 6 tidak lagi jadi prasyarat) → Fase 4 → Fase 5 → Fase 6 (admin generator, dikerjakan saat
dibutuhkan nambah/ganti bank soal). Tiap fase = 1 commit, di-`npm run dev` + coba manual sebelum lanjut.

## Verifikasi per fase
- Fase 1: visual diff manual tiap halaman.
- Fase 2: login peserta → klik "Real Exam Kecermatan" langsung (bukan tryout lengkap) → selesai → cek `test_sessions` cuma py 1 `module_sessions` row.
- Fase 3: buka latihan tanpa login-exam-flow, jawab beberapa soal, pastikan TIDAK ada row baru di `module_sessions`/`answers`/`kecermatan_logs`.
- Fase 4: selesaikan 1 Real Exam Kecermatan dengan sengaja salah beberapa soal, cek dropdown pembahasan nunjukin soal yang salah dengan benar.
- Fase 5: py beberapa `test_sessions` dummy tanggal berbeda, cek grafik frekuensi & tren match data.
- Fase 6: generate 1 paket lewat admin UI, pastikan soal-nya kepake pas Fase 2/3 dijalanin.

---
*Ditulis oleh Claude Code dari sesi di `PAGE-ACCURACY-V3` — lanjutkan sesi baru langsung di direktori `psiko-cat` ini biar working directory match.*
