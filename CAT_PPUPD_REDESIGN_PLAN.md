# Rombak UI + IA psiko-cat mengikuti CAT PPUPD

**Status:** Plan diaudit (`audit codex with ponytail.md`, 2026-09-07) dan dipangkas ~300 baris implementasi sebelum eksekusi. Ditulis 2026-09-07, menyusul selesainya `AJIKS_REBRAND_PLAN.md` Fase 1-5. Versi ini adalah sumber status tunggal — jangan duplikasi status ke memory scope.

## Context

`psiko-cat` (Next 16 + Supabase, "Ajiks Akademi — Psiko CAT") sekarang bertema dark navy/gold hasil `AJIKS_REBRAND_PLAN.md` Fase 1-5. User memutuskan menggantinya **total** dengan bahasa visual + struktur navigasi app saudaranya, **CAT PPUPD Muda** (`https://github.com/gustiyuda14-source/cat-ppupd-muda`, di-clone ke scratchpad sesi lalu sebagai referensi — perlu di-clone ulang kalau mau baca kode aslinya lagi).

Masalah yang diselesaikan: psiko-cat tidak punya shell/navigasi sama sekali — tiap halaman menggambar layar penuhnya sendiri, semua entry point ditumpuk jadi daftar link di satu halaman dashboard, dan pembahasan soal terkubur di dalam halaman hasil. Referensi sudah memecahkan itu (sidebar tetap, halaman per-fungsi, ruang review terpisah), dan dua app ini satu keluarga produk (footer sama-sama "D Ajiks Corporation"), jadi wajar disamakan.

Keputusan user (lewat pertanyaan terstruktur):
1. **Ganti total** identitas navy/gold → light theme CAT PPUPD.
2. Rute pindah ke pola **`/dashboard/*`**; rute ujian tetap `/test/*` (otomatis tanpa sidebar).
3. Sidebar: **Beranda · Simulasi · Latihan · Review Soal** (Wawancara dibuang — psiko-cat tidak punya materinya).
4. Engine ujian **ikut dirombak sekarang**, bukan tahap berikutnya.

## Global Constraints

Berlaku untuk semua task di bawah — implementer dan reviewer wajib pegang ini:

- **Nol perubahan schema, nol migrasi.** Supabase project `ckqxehyyqkmvidmlronz` dipakai bertiga (`public`=psiko-cat, `ppupd_muda`, `toefl`); semua kerja tetap di schema `public`.
- **Tidak menambah dependency baru.** Tidak ada `@phosphor-icons/react`, tidak ada `cn()`/clsx, tidak ada component/chart library. Ikon: buang semua emoji (🧠🎯💡📡⚠️), ganti teks/label singkat atau marker native `<details>` — jangan bikin sistem ikon baru.
- **Token warna** (ganti isi `app/globals.css`, tapi lihat Task 1 soal remap lama):
  ```css
  :root {
    color-scheme: light;
    --background:#ffffff;  --card:#ffffff;
    --foreground:#10213b;  --muted-foreground:#66758b;  --border:#dbe3ee;
    --primary:#102d52;     --primary-foreground:#ffffff;
    --destructive:#dc2626; --success:#0d8a69;  --success-soft:#ecfdf5;
    --accent:#d9983f;      --accent-soft:#fff4df;  --ring:#d9983f;
  }
  ```
  Dipetakan lewat `@theme inline` (`--color-background`, `--color-card`, dst). Navy gelap sidebar/hero = hex literal `#0b2442`. Set putih sekali di token, **jangan** override inline per halaman.
- **Tipografi**: body **Source Sans 3** (`--font-sans`, global), heading **Lexend** (`--font-heading`, opt-in per elemen). Ganti Inter + Cormorant di `app/layout.tsx`.
- **Pola kelas yang di-port** (kutipan persis ada di `cat-ppupd-muda`, referensi saja — file itu tidak ada di workspace ini):

  | Pola | Kelas inti |
  |---|---|
  | Sidebar | `fixed inset-y-0 left-0 z-50 w-72 bg-[#0b2442] text-white border-r border-white/10 shadow-[12px_0_40px_-24px_rgba(15,35,65,0.62)] lg:static`; aktif `bg-white text-primary`, idle `text-slate-300 hover:bg-white/10` |
  | Hero | `rounded-[2rem] bg-[#0b2442] px-7 py-8 text-white shadow-[0_24px_60px_-26px_rgba(12,35,66,0.72)]` + orb `bg-accent/20 blur-3xl` + pill `rounded-full border-white/15 bg-white/10` |
  | Stat tile | `rounded-2xl border border-border/80 bg-card p-5 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]` + icon tile `size-10 rounded-xl bg-primary/7 text-primary` |
  | Kartu paket | idem + garis atas `absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-success via-success to-accent`, badge `rounded-lg bg-primary/7`, meta row, footer `Mulai →` `group-hover:translate-x-1` |
  | Accordion | native `<details>/<summary>`, marker bawaan browser (jangan bikin custom caret/icon) |
  | Right rail | `lg:sticky lg:top-6 lg:order-2` dalam `grid lg:grid-cols-[minmax(0,1fr)_16rem]` |
  | CTA emas | `min-h-12 rounded-xl bg-accent px-5 text-sm font-bold text-primary shadow-[0_12px_24px_-12px_rgba(217,152,63,0.9)] hover:-translate-y-0.5` |

  Radius `rounded-xl` (kontrol) / `rounded-2xl` (kartu) / `rounded-[1.5rem]`–`[1.75rem]` (panel) / `rounded-[2rem]` (hero). Shadow selalu arbitrary bernegative-spread, tidak pernah `shadow-md`. Target sentuh `min-h-11` (=44px). Motion `transition-all duration-200`, hover lift `-translate-y-0.5`/`-1`.
- **Disiplin kontras**: gold `#d9983f` **hanya** untuk background dengan teks navy, atau ikon di atas navy — jangan jadi warna teks di permukaan terang.
- **Reuse wajib, jangan tulis ulang:**

  | Sudah ada | Dipakai untuk |
  |---|---|
  | `lib/test-session.ts` `MODULE_CONFIG` / `SLUG_TO_MODULE` / `createTestSessionAndRedirect` | durasi & jumlah modul di kartu Simulasi, aksi tombol — **satu-satunya** sumber metadata modul (lihat Task 2) |
  | `lib/auth.ts` `getSession()` + `middleware.ts` | gate `/dashboard/*` (matcher sekarang sudah menangkap semua rute non-publik) |
  | `app/components/LogoutButton.tsx` | logika Keluar di sidebar, dipakai langsung |
  | `app/components/ConfirmSubmitButton.tsx` | tombol submit di overview sesi |
  | `app/dashboard/ActivityCharts.tsx` | grafik Beranda (recolor saja) |
  | fetcher review di `app/test/[sessionId]/result/page.tsx` | dipindah ke `lib/review.ts`, dipakai 2 halaman |
  | `app/components/PembahasanSection.tsx` | renderer review satu-satunya — jangan bikin renderer/accordion kedua |
  | `lib/types/safe-question.ts` | kontrak payload, tidak berubah |

- **Verifikasi tiap task:** `npm run build` (sudah mencakup type-check — `next.config.ts` tidak mengaktifkan `ignoreBuildErrors`, jadi build gagal duluan kalau ada error TypeScript; tidak perlu `tsc --noEmit` terpisah).
- Cek sisa tema lama sebelum task dianggap selesai: `grep -rn "zinc-\|bg-navy\|text-cream\|font-display" app/` harus kosong di file yang disentuh task itu (kecuali `app/rescue/`, tooling internal yang sengaja belum di-commit).

---

## Peta rute sesudah rombak

| Rute | Status | Isi |
|---|---|---|
| `/dashboard` | rewrite | Beranda: hero + KPI + grafik |
| `/dashboard/simulasi` | **baru** | Tryout Lengkap + 3 Real Exam per modul + sesi berjalan |
| `/dashboard/latihan` | **baru** | 3 kartu latihan |
| `/dashboard/latihan/[module]/page.tsx` | **baru** (page tipis) | Import komponen dari `app/latihan/[module]/` apa adanya, tanpa memindahkan filenya |
| `/dashboard/review` | **baru** | Ruang review: rail sesi selesai + `PembahasanSection` per modul/soal |
| `/latihan/[module]` | jadi redirect | → `/dashboard/latihan/[module]` |
| `/test/new`, `/test/new/[module]` | tetap | tanpa UI (bikin sesi lalu redirect) |
| `/test/[sessionId]`, `/test/[sessionId]/{modul}`, `/result` | reskin | di luar `/dashboard` ⇒ otomatis tanpa sidebar (mode fokus tanpa perlu regex seperti referensi) |
| `/login`, `/admin` | reskin | halaman berdiri sendiri |

---

## Task 1: Fondasi + shell + Beranda

- `app/globals.css` — set token baru di atas sebagai **base**, tapi **pertahankan alias warna lama** (zinc/slate/blue/emerald/red/amber remap) sebagai compatibility layer selama migrasi berjalan — cukup ubah nilai alias itu ke palet baru alih-alih menghapusnya. Tambahkan token semantik baru untuk kode/rute yang dibuat task ini dan seterusnya. Alias lama baru dihapus di task terpisah nanti, setelah tidak ada lagi pemakai (jangan hapus di task ini).
- `app/layout.tsx` — Source Sans 3 + Lexend, `<body className="min-h-full">`.
- **Baru** `app/dashboard/layout.tsx` (server): `getSession()` → `/login`; `role==="admin"` → `/admin` (pindahkan cek ini dari `app/dashboard/page.tsx`); render langsung shell dashboard di sini (flex layout: `<Sidebar>` + `<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>`) — **tidak ada** komponen `DashboardFrame` terpisah, layout ini sendiri sudah jadi shell server component.
- **Baru** `app/dashboard/Sidebar.tsx` (client): 4 item nav, brand "Psiko CAT / Ruang Latihan Psikotes", chip user (inisial 2 huruf), tombol Keluar memakai `app/components/LogoutButton.tsx` langsung (tambahkan prop `className`/`children` ke komponen itu kalau tampilan sidebar butuh, jangan salin ulang logika fetch/routing-nya), footer "Didukung oleh D Ajiks Corporation". Komponen ini sendiri yang memegang state buka/tutup drawer mobile (hamburger + scrim di lebar <1024px) — state itu tidak perlu naik ke komponen lain.
- `app/dashboard/page.tsx` — rewrite jadi Beranda: hero + salam per jam + CTA ke Simulasi; 3 stat tile yang **sudah ada** (Total Tes, Lulus, Skor Terbaik — query `test_sessions` yang sudah ada, jangan tambah KPI baru seperti "Streak"); section "Ringkasan aktivitas" berisi dua grafik yang sudah ada. **Jangan** tambah panel "Kesiapan latihan" — belum ada definisi produk/data yang jelas untuk metrik itu.
- `app/dashboard/ActivityCharts.tsx` — recolor untuk permukaan terang: bar histori `fill-primary/15`, bar minggu berjalan `fill-accent`, garis tren `stroke-primary/40`, titik terakhir `fill-accent`, label `fill-foreground`. Logika bucket/scaling tidak disentuh.

## Task 2: Simulasi + Latihan

- `lib/test-session.ts` — perluas `MODULE_CONFIG` dengan field `label` dan deskripsi singkat per modul (mis. "kognitif & spasial", "10 lajur simbol", "skala Likert"). Ini jadi **satu-satunya** sumber metadata modul.
- `app/test/[sessionId]/page.tsx` — hapus `MODULE_META` lokal, ambil label/deskripsi/urutan dari `MODULE_CONFIG`/`SLUG_TO_MODULE`.
- `app/latihan/[module]/LatihanGate.tsx` — hapus konstanta `META` lokal, ambil label/deskripsi dari `MODULE_CONFIG`.
- **Baru** `app/dashboard/simulasi/page.tsx` (server): grid kartu — "Tryout Lengkap" (3 modul) dan 3 "Real Exam" per modul, memakai `MODULE_CONFIG` untuk slug/durasi/label. Jumlah soal **diquery** dari `questions` (`count` per `type`, jangan hardcode). Kartu menaut ke `/test/new` dan `/test/new/[module]` yang sudah ada. Tambah blok "Sesi berjalan" dari `test_sessions` berstatus `PENDING`/`IN_PROGRESS` → `/test/[sessionId]`. **Tidak** menambah stat tile (sesi selesai/skor terbaik/skor terakhir) — itu duplikasi KPI Beranda; cukup kartu paket + sesi berjalan.
- **Baru** `app/dashboard/latihan/page.tsx`: 3 kartu → `/dashboard/latihan/[module]`, metadata dari `MODULE_CONFIG`.
- **Baru** `app/dashboard/latihan/[module]/page.tsx`: pindahkan isi server logic (fetch `questions`, resolve `moduleType`, guard session) dari `app/latihan/[module]/page.tsx` ke sini apa adanya, lalu import `LatihanGate` dari lokasi aslinya (`@/app/latihan/[module]/LatihanGate`) — **jangan pindahkan file** `LatihanGate.tsx`/`LatihanKecerdasan.tsx`/`LatihanKepribadian.tsx`/`LatihanKecermatan.tsx`, cukup edit di tempat: buang shell layar-penuh (`min-h-screen bg-navy-xd`, header sendiri) karena sekarang sudah di dalam shell dashboard, ganti ke token baru. Logika (`/api/practice/check`, auto-advance Kecermatan, konfirmasi keluar) tidak diubah.
- `app/latihan/[module]/page.tsx` — ganti isinya jadi `redirect()` ke `/dashboard/latihan/[module]`.

## Task 3: Ruang Review + hasil

- **Baru** `lib/review.ts`: pindahkan `fetchKecerdasanReview`, `fetchKepribadianReview`, `fetchKecermatanDetailReview` dari `app/test/[sessionId]/result/page.tsx` apa adanya, supaya dipakai bersama halaman hasil dan ruang review. Termasuk trik penting: kunci Kecermatan diturunkan dari `options_payload` (simbol yang hilang dari `shown`), **tidak pernah** membaca `scoring_rule`.
- `app/components/PembahasanSection.tsx` — **tidak** rewrite penuh. Ganti primitive dropdown yang ada menjadi native `<details>/<summary>` (pakai marker bawaan, tanpa custom caret icon), lalu recolor class ke token baru. Struktur dan tipe ekspor (`KecerdasanReviewItem`, `KepribadianReviewItem`, `KecermatanSummary`, `KecermatanColumnGroup`) dipertahankan apa adanya.
- **Baru** `app/dashboard/review/page.tsx` (server, `?sesi=<id>`): rail kanan = daftar `test_sessions` selesai (tanggal + NAP), item aktif disorot; halaman ini **memilih sesi lalu merender `PembahasanSection` yang sudah ada** — tidak menulis accordion/renderer/opsi-berwarna baru. Data dari `lib/review.ts`. Empty state kalau belum ada sesi selesai.
- `app/test/[sessionId]/result/page.tsx` — reskin; fetcher diganti import dari `lib/review.ts`; tambah tombol "Buka di Review Soal" → `/dashboard/review?sesi=<id>`.

## Task 4: Engine ujian + overview + login + admin

- `app/components/engines/Engine{Kecerdasan,Kepribadian,Kecermatan}.tsx` — **hanya kelas warna/spacing** yang diubah; timer, store, flush, heartbeat, `beforeunload`, one-shot answer Kecermatan **tidak disentuh**. Shell `bg-zinc-950 text-white` → `bg-background text-foreground`; kartu → `bg-card border-border`; modal → panel putih di `bg-black/40`; HUD timer pakai `tabular-nums`. Kecermatan sudah light (slate) → tinggal dipindah ke token baru. Kecerdasan dan Kepribadian sudah punya modal konfirmasi submit (ditambahkan di commit sebelumnya) — recolor modal itu juga ke token baru, jangan dihapus. Sekalian perbaiki nama peserta yang di-hardcode `"Peserta"` (`EngineKecermatan.tsx`) dengan prop dari server.
- `app/test/[sessionId]/page.tsx` — reskin kartu modul + progress + tombol submit (`ConfirmSubmitButton` tetap).
- `app/login/page.tsx` — reskin: panel navy + kartu putih, input `min-h-11 rounded-xl border-border focus:ring-ring/40`, footer D Ajiks. Alur POST tidak berubah.
- `app/admin/page.tsx` — reskin ke tema terang, tetap halaman berdiri sendiri (tanpa sidebar peserta).
- Setelah task ini, jalankan `grep -rn "zinc-\|bg-navy\|text-cream\|font-display" app/` (kecuali `app/rescue/`) — kalau kosong, hapus alias compatibility layer yang ditambahkan di Task 1 dari `app/globals.css` (tidak ada lagi pemakai). Kalau masih ada sisa, biarkan alias dan catat sisa filenya di ledger.

## Task 5: Perbaikan yang tersingkap redesign

Sesi Real Exam standalone selalu berakhir **`DISQUALIFIED`** — modul yang tidak diambil dihitung kontribusi 0 (`lib/scoring/runner.ts`), jadi NAP mustahil ≥61 (`lib/scoring/nap.ts`). Begitu Simulasi menonjolkan Real Exam per modul, tiap peserta akan selalu melihat "Gugur Mutlak". Perbaikan: untuk sesi 1-modul, jangan pakai ambang NAP — tampilkan `raw_score` modul + predikat lewat `getNAPPredikat()` (`nap.ts`, saat ini ter-export tapi tak terpakai), dan `is_passed` mengikuti aturan modul (`raw_score > 40`).

Ini bukan perubahan UI murni — perlakukan sebagai commit terpisah dari Task 1-4 walau kartu Real Exam yang memicunya berasal dari redesign, supaya diff UI tetap mudah direview terpisah dari perubahan logic scoring. Task ini tidak memutuskan correctness aturan scoring itu sendiri di luar bug DISQUALIFIED-paksa yang dijelaskan di atas.

---

## Verifikasi manual (jalankan setelah Task 4, ulang setelah Task 5 untuk bagian scoring)

Login `aurel` / `G6SHQF`, dev server `http://localhost:3000`):
1. `/dashboard` — sidebar tampil, item **Beranda** aktif, hero + 3 stat tile + 2 grafik terbaca; tidak ada sisa dark.
2. Klik tiap item sidebar — state aktif benar (`/dashboard` exact match, sisanya `startsWith`).
3. `/dashboard/simulasi` — jumlah soal per kartu cocok dengan `select count(*) from questions group by type` (Kecerdasan 100, Kepribadian 100, Kecermatan 500).
4. Mulai Real Exam Kecermatan → halaman ujian **tanpa sidebar**, timer per lajur jalan, jawab beberapa soal → selesai → halaman hasil menampilkan predikat modul (bukan "Gugur Mutlak" otomatis, lihat Task 5).
5. `/dashboard/review` — sesi tadi muncul di rail kanan, accordion modul terbuka (via `PembahasanSection`), soal salah menampilkan kunci + pembahasan; kunci Kecermatan cocok dengan `scoring_rule.correct_choice` (cek via SQL, bukan asumsi).
6. `/dashboard/latihan/kecerdasan` — di dalam shell, feedback benar/salah jalan; `/latihan/kecerdasan` redirect ke rute baru.
7. Lebar <1024px: sidebar tersembunyi, hamburger membuka drawer + scrim, tidak ada scroll horizontal.
8. Setelah selesai: hapus sesi uji coba yang dibuat, dan pastikan `module_sessions`/`answers`/`kecermatan_logs` tidak bertambah gara-gara membuka halaman Latihan.

Setelah semua hijau: update `AJIKS_REBRAND_PLAN.md` (tandai Fase 1-5 sebagai identitas lama yang digantikan, catat arah baru). Memory scope tidak diubah kecuali diminta eksplisit oleh pengguna.

---

*Ditulis oleh Claude Code (plan mode), diaudit dan dipangkas oleh Codex (`audit codex with ponytail.md`) sebelum eksekusi. Lanjutkan eksekusi dari file ini di sesi mana pun — semua keputusan scope sudah difinalkan lewat pertanyaan terstruktur ke user, tidak perlu tanya ulang kecuali menemukan fakta baru yang mengubah asumsi.*
