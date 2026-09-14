# Handoff Implementasi dan Reviu Claude — Psiko CAT

Tanggal: 12 September 2026  
Basis audit: `../AUDIT_CAT_2026-09-12.md`

## Kesimpulan kerja

Perbaikan dilakukan mengikuti urutan risiko audit: akses dan rescue, keandalan simpan, waktu dan validasi data, scoring/review, lalu UI/UX. Stack Next.js + Supabase + Zustand dipertahankan karena masalahnya berada pada guard dan kontrak alur, bukan pada kebutuhan rewrite.

Working tree sudah berisi banyak perubahan lokal sebelum pass audit/implementasi ini. Jangan `reset`, `checkout`, atau menganggap seluruh `git diff` sebagai hasil satu pass. Reviu keadaan akhir per file dan pertahankan draf pengguna.

## Status 20 temuan audit

| ID | Status saat ini | Implementasi / batas |
|---|---|---|
| F01 | Ditutup di kode | Semua page dan endpoint sesi memakai pemeriksaan owner; bypass admin hanya eksplisit. Policy murni memiliki runnable check. |
| F02 | Ditutup di kode | Rescue dibatasi ke sesi aktif milik peserta; hasil final tidak dapat ditulis ulang; Kecermatan tidak lagi dipalsukan ke tabel `answers`; tidak ada kalkulasi otomatis. |
| F03 | Ditutup di kode | Save memeriksa HTTP status, menunggu request aktif, retry sebelum finish, dan hanya menghapus buffer setelah ACK. |
| F04 | Ditutup di kode | Jawaban lokal direkonsiliasi dengan server setelah reload; pending dibangun ulang dari selisih; retry online; pending Kecermatan dipersist. |
| F05 | Ditutup di kode | Buffer dan API dideduplikasi berdasarkan `question_id`; nilai terbaru dipertahankan. |
| F06 | Ditutup dengan asumsi terdokumentasi | Deadline berasal dari `started_at`; API menolak data kedaluwarsa/urutan salah; timer Kecermatan memakai deadline absolut. Grace 5 detik, atau 60 detik untuk 10 intro Kecermatan, masih kebijakan sementara. |
| F07 | Sebagian ditutup | Server menurunkan paket/kolom dari soal, memvalidasi opsi, membatasi batch, dan scorer dedupe per soal. Constraint unik database untuk log Kecermatan belum diterapkan. |
| F08 | Sebagian ditutup | Semua error baca/tulis scoring menghentikan kalkulasi; create-session membersihkan induk bila insert modul gagal; 500 update log per hasil dihapus. Finalisasi lintas tabel belum atomik karena belum ada RPC/transaksi database. |
| F09 | Terbuka, keputusan metodologi | Rumus tidak diubah tanpa norma resmi. Kasus 10 jawaban benar tersebar rata masih menghasilkan skor tinggi karena `Kh=100`. |
| F10 | Ditutup di kode | Latihan Kecerdasan mendukung dua pilihan, tombol periksa, validasi runtime, dan tipe kunci gabungan. |
| F11 | Terbuka, keputusan produk/data | Endpoint latihan masih mengembalikan kunci bank aktif yang juga dipakai ujian. Solusi yang benar memerlukan bank latihan terpisah atau konteks/versi soal yang tidak dapat ditebak dari struktur sekarang. |
| F12 | Ditutup di kode | Pembuatan sesi dan kalkulasi pindah ke Server Action POST; route GET hanya redirect/read. |
| F13 | Ditutup di kode | Fallback JWT dihapus; aplikasi gagal jelas bila secret tidak ada; recalculation admin memakai role session, bukan signing secret dalam body. |
| F14 | Ditutup di kode | Indeks dibatasi, timer auto-next dibatalkan pada navigasi/unmount/modal, dan keyboard latihan mati saat dialog/hasil aktif. |
| F15 | Ditutup pada presentasi | Dashboard/tren NAP hanya memakai tryout tiga modul; sesi satu sub-tes diberi label skor sub-tes. Kolom database `nap_score` masih dipakai ganda dan sebaiknya dipisah pada migrasi berikutnya. |
| F16 | Ditutup dengan batas F17 | Review sekarang berangkat dari seluruh soal aktif dan menggabungkan jawaban, sehingga butir kosong tampil. Riwayat masih dapat berubah ketika bank aktif berubah. |
| F17 | Terbuka, perlu migrasi | Sesi belum menyimpan `bank_version`, `scoring_policy_version`, dan daftar soal yang ditugaskan. |
| F18 | Ditutup di kode | Scoring tidak lagi menulis `is_correct` satu per log; benar/salah diturunkan saat dibutuhkan. Timer UI tidak lagi menulis Zustand/localStorage empat kali per detik. |
| F19 | Ditutup di source | Navigator memakai token navy/gold/success dengan teks berkontras, bukan amber/emerald Tailwind mentah. |
| F20 | Ditutup di source, browser belum diverifikasi | Kartu tersembunyi tidak mendapat tab stop, drawer punya modal semantics + focus trap + restore focus, navigator mobile menutup dan memindahkan fokus ke soal aktif. |

## Perubahan utama dan alasan

### 1. Otorisasi sesi dipusatkan

File utama:

- `lib/access-policy.ts`
- `lib/session-access.ts`
- seluruh route di `app/api/sessions/[id]/`
- `app/api/kecermatan/log/route.ts`
- page di `app/test/[sessionId]/`

Alasan: satu policy owner/admin menghindari guard berbeda di tiap route. Endpoint peserta selalu memanggil helper dengan `allowAdmin=false`; halaman baca tertentu dapat memberi akses admin secara eksplisit.

### 2. Kontrak simpan berbasis ACK

File utama:

- `lib/hooks/use-exam-engine.ts`
- `lib/stores/exam-store.ts`
- `lib/stores/kecermatan-store.ts`
- tiga engine di `app/components/engines/`
- endpoint answers/log/complete/sync

Alasan: status “tersimpan” harus berasal dari respons server. Map per soal menyelesaikan duplicate-key dan menjaga pilihan terbaru ketika request lama masih berjalan. Finish menunggu flush dan tidak mengunci modul bila masih ada data pending.

### 3. Waktu dan log divalidasi server

Server memeriksa status modul, urutan, owner, `started_at`, masa berlaku, tipe soal, paket Kecermatan, kolom dari database, opsi, dan batas batch. Kecermatan menyimpan deadline kolom absolut agar reload/background tidak menghentikan waktu.

Alasan: client tetap bertanggung jawab pada tampilan cepat, tetapi tidak lagi menjadi otoritas validitas data atau waktu.

### 4. Scoring gagal tertutup dan review konsisten

File utama:

- `lib/scoring/runner.ts`
- `lib/scoring/kecermatan.ts`
- `lib/review.ts`
- `app/dashboard/page.tsx`
- `app/dashboard/review/page.tsx`
- `app/test/[sessionId]/result/page.tsx`

Alasan: error infrastruktur tidak boleh berubah menjadi skor 0 peserta. Formula Kecermatan kini menolak kolom duplikat, hitungan di luar 0–50, dan benar lebih besar dari klik. Review menghitung benar/salah dari sumber soal dan menampilkan unanswered dengan denominator penuh.

### 5. Mutasi hanya melalui aksi eksplisit

File utama:

- `app/dashboard/simulasi/page.tsx`
- `app/test/[sessionId]/page.tsx`
- `app/test/new/page.tsx`
- `app/test/new/[module]/page.tsx`
- `lib/test-session.ts`

Alasan: GET dapat diprefetch/reload. Insert sesi dan finalisasi hasil sekarang membutuhkan submit POST melalui Server Action.

### 6. UI/UX diarahkan ke kepercayaan dan fokus tugas

File utama:

- `app/components/ExamChrome.tsx`
- `app/dashboard/Sidebar.tsx`
- `app/components/KecermatanPackageCarousel.tsx`
- `app/rescue/page.tsx`
- `app/globals.css`

Perubahan:

- status pending/saving/saved/error dan aksi kirim ulang;
- timer ganda di navigator ujian dihapus;
- navigator mobile menutup setelah memilih nomor dan memfokuskan soal aktif;
- focus trap serta pengembalian fokus drawer mobile;
- paket Kecermatan tidak dapat dimulai bila jumlahnya bukan 500 butir;
- rescue memakai token visual aplikasi dan copy yang tidak menjanjikan hitung ulang;
- warna navigator disatukan ke token desain dengan kontras lebih baik.

Alasan: peserta perlu tahu data benar-benar diterima, tetap berada pada area soal setelah navigasi, dan tidak dapat memulai bank yang belum lengkap.

## QA yang sudah dijalankan

Semua pemeriksaan berikut lulus pada working tree akhir:

```text
npm run lint
npx tsc --noEmit
npm run build
npm run check:access
npm run check:scoring
npx tsx lib/kecermatan-symbols.test.ts
npx tsx scripts/check-sidebar-navigation.ts
node /Users/gustiputuyudawirashana/.codex/skills/impeccable/scripts/detect.mjs app/components app/dashboard app/latihan app/rescue 'app/test/[sessionId]' app/globals.css
git diff --check
```

Hasil penting:

- Next.js production build: 19 static pages selesai, seluruh route terkompilasi.
- ESLint: 0 error, 0 warning.
- TypeScript: 0 error.
- Kecermatan source check: 3.000 jawaban/kunci/payload lulus.
- Policy akses: owner, peserta lain, bypass admin off/on lulus.
- Impeccable static detector: 0 temuan.

## Yang belum diverifikasi

- Tidak ada browser visual/interaksi desktop-mobile. Instruksi repo melarang membuka browser otomatis tanpa persetujuan; respons izin eksplisit belum diterima.
- Tidak ada pengujian dengan akun dan database staging/produksi.
- RLS, constraint database live, konfigurasi secret deployment, request lambat, dua tab, dan outage jaringan nyata belum diverifikasi.
- Tidak ada commit, push, deploy, atau migrasi database yang dilakukan.

## Reviu yang diminta dari Claude

1. Telusuri seluruh caller `getSessionAccess`/`getModuleAccess`; pastikan endpoint peserta selalu memakai `allowAdmin=false` dan halaman admin yang perlu membaca sesi tetap berfungsi.
2. Uji race: ubah jawaban saat flush berjalan, submit saat flush berjalan, dua tab mengirim jawaban sama, serta reload dengan pending 1–4 jawaban dan pending Kecermatan.
3. Periksa grace deadline di `lib/session-access.ts`. Angka 60 detik Kecermatan dibuat untuk 10 intro × 5 detik; konfirmasi terhadap kebijakan ujian sebelum produksi.
4. Rancang satu migrasi database untuk unique `(module_session_id, question_id)` pada `kecermatan_logs`, snapshot/version bank, version scoring policy, dan RPC finalisasi atomik. Jangan menerapkan ke database produksi tanpa backup dan pemeriksaan data duplikat.
5. Putuskan F09 berdasarkan dokumen norma: minimum attempt dan perlakuan `Kh` pada volume rendah. Tambahkan kasus batas ke `scripts/check-scoring.ts` setelah keputusan resmi.
6. Pisahkan bank latihan dari bank ujian atau buat assignment/version yang membuat endpoint practice tidak dapat digunakan untuk mengambil kunci sesi ujian aktif.
7. Jalankan E2E dengan database uji: mulai → jawab/ubah → offline → reload → resume → timeout → submit → hasil → review, pada desktop dan mobile; verifikasi Tab, Shift+Tab, Escape, focus return, serta screen-reader labels.

## Risiko bila langsung dirilis

Jangan menyatakan sistem siap produksi penuh sebelum F09, F11, F17, transaksi finalisasi, dan constraint log diselesaikan serta alur diuji terhadap database uji. Perubahan sekarang menutup jalur akses lintas sesi, kehilangan jawaban paling jelas, replay skor, mutasi GET, dan inkonsistensi UI utama, tetapi belum menggantikan keputusan norma dan desain data yang memang tidak tersedia di source.
