# Ajiks Akademi — rebrand ornate gold-on-dark (V2)

**Status:** Draft, menunggu review user sebelum masuk `writing-plans`. Ditulis 2026-09-12.

## Context

`AJIKS_REBRAND_PLAN.md` Fase 1 (commit `b6d1cec`, 2026-09-07) pernah reskin `psiko-cat` ke navy/gold flat + Cormorant Garamond. Hari yang sama, user memutuskan **ganti total** ke `CAT_PPUPD_REDESIGN_PLAN.md` — light theme niru app saudara `cat-ppupd-muda` — yang sudah dieksekusi penuh dan itu yang jalan sekarang (`color-scheme: light`, token di `app/globals.css`).

2026-09-12: user kasih file logo resmi D'Ajiks Akademi (`LOGO D AJIK AKADEMI.png` — mockup render, crest crown/leaf gold metalik + wordmark serif kapital, di atas background asap gelap) dan minta itu jadi highlight brand identity. Ditawari 3 opsi scope (mark kecil / hero showcase / full rebrand) — user pilih **full rebrand**, sadar itu narik balik ke arah yang sudah ditinggalkan 09-07. Ini keputusan eksplisit, bukan diasumsikan.

Plan ini **menggantikan** `AJIKS_REBRAND_PLAN.md` sebagai sumber arah visual (dokumen itu dibiarkan ada sebagai sejarah, jangan dihapus — masih dirujuk beberapa memory). `CAT_PPUPD_REDESIGN_PLAN.md` tetap sumber kebenaran untuk struktur IA/routing (sidebar, pola `/dashboard/*` vs `/test/*` vs `/latihan/*`) — itu TIDAK berubah, cuma warna/tipografi/aset yang berubah.

## Keputusan yang sudah difinalkan (lewat pertanyaan terstruktur ke user)

1. **Cakupan tema — dua wilayah, tegas dipisah, nol pengecualian per-halaman:**
   - **Tetap light/Operate-mode, nol disentuh:** `app/test/[sessionId]/*` (ujian resmi) DAN `app/latihan/[module]/*` + `app/latihan/kecermatan/[package]/*` (latihan tanpa timer) — seutuhnya, termasuk layar info-sebelum-mulai di `LatihanGate.tsx` (satu halaman jangan pernah tema-nya kepotong di tengah alur). Alasan: kedua rute ini sama-sama "peserta lagi ngerjain soal", butuh scanability tinggi, nol distraksi visual. Komponen yang ikut nol disentuh: `ExamChrome.tsx` (`QuestionNavigator`, dll — semua kelasnya hardcode `slate-*`/`emerald-*`/`amber-*`/`indigo-*`, BUKAN token, sengaja dibiarkan begitu), `Latihan{Kecerdasan,Kepribadian,Kecermatan}.tsx`, `KecermatanClient.tsx`, `Engine{Kecerdasan,Kepribadian,Kecermatan}.tsx`.
   - **Ornate gold-on-dark:** semua permukaan navigasi/pemilihan/informasi — `app/dashboard/layout.tsx` + `Sidebar.tsx`, `app/login/page.tsx`, `app/dashboard/page.tsx` (beranda), `app/dashboard/latihan/page.tsx` (index picker modul), `app/dashboard/latihan/kecermatan/page.tsx` (carousel pemilihan paket — lihat catatan konsekuensi di bawah), `app/dashboard/simulasi/page.tsx`, `app/dashboard/review/page.tsx`, `app/admin/page.tsx`, `app/rescue/page.tsx`.
   - Kedua wilayah dipisah persis di batas route folder (`app/dashboard/*` + `app/login` + `app/admin` vs `app/test/*` + `app/latihan/*`), TAPI keduanya pakai token semantik yang sama (`bg-card`, `text-foreground`, dst). Itu artinya `:root` tidak boleh diganti langsung — token dark harus scoped lewat class (`.ornate`), bukan global. Detail lengkap + kenapa ini ketauannya belakangan ada di bagian Token di bawah.

2. **Pendekatan: B — token + craft yang nyambung ke logo** (bukan A/token-doang, bukan C/maksimalis-motif-berulang). Detail di bawah.

## Token — SCOPED override lewat class `.ornate`, `:root` TIDAK diubah

Draf pertama plan ini mau ganti `:root` langsung jadi dark, global. **Dibatalkan** — audit lanjutan nemuin `ExamChrome.tsx`/`Engine{Kecerdasan,Kepribadian,Kecermatan}.tsx`/`Latihan*.tsx`/`KecermatanClient.tsx` (semua wajib tetap light per keputusan di atas) ternyata pakai token semantik yang SAMA (`bg-card`, `text-foreground`, `bg-primary`, `text-success`, `bg-destructive`, `border-border`, dst — bukan cuma `accent-ink` yang sempat ketemu duluan). Kalau `:root` diganti global, wilayah "stay light" ikut kebawa gelap padahal nol filenya disentuh — persis kebalikan dari yang diminta.

**Perbaikan:** `:root` di `app/globals.css` **TIDAK disentuh sama sekali** — tetap persis seperti sekarang (light, jadi basis default). Token dark ditaruh di selector baru `.ornate { ... }`, dipasang lewat `className="ornate"` di elemen root tiga tempat:
- `app/dashboard/layout.tsx` — wrapper div (otomatis nyakup semua `/dashboard/*`, termasuk carousel paket, review, tanpa sentuh file di dalamnya).
- `app/login/page.tsx` — wrapper root.
- `app/admin/page.tsx` — wrapper root.

`app/test/*` dan `app/latihan/*` nol risiko kebocoran — mereka tidak akan pernah ada di dalam elemen berclass `.ornate`, jadi `var(--surface-card)` dkk di situ tetap resolve ke `:root` yang tidak berubah. Ini pola CSS custom-property scoping standar (sama seperti cara dark-mode toggle biasa diimplementasi) — `@theme inline` (Tailwind v4) sudah menulis `--color-card: var(--surface-card)` dkk sebagai referensi hidup, bukan nilai statis, jadi override di ancestor `.ornate` otomatis mengalir ke semua descendant yang pakai `bg-card` dkk tanpa perlu ubah satu pun className di komponen.

```css
.ornate {
  color-scheme: dark;

  --surface-page: #0b2442;       /* sudah dipakai sidebar/hero, sekarang app-wide — bukan warna baru */
  --surface-card: #14304f;       /* lebih terang dari page = elevation dark-mode convention */
  --surface-inset: #0f2846;
  --surface-nav: #0b2442;        /* tidak berubah — sidebar sudah di sini */
  --surface-nav-deep: #081b34;   /* tidak berubah */

  --foreground: #f4ede0;         /* cream hangat, bukan #fff pekat — nyambung ke undertone gold */
  --muted-foreground: #a8bedb;   /* sudah dipakai di --pc-ink-dim carousel, disatukan jadi token global */
  --faint-foreground: #7d90b3;

  --border: #24354f;
  --border-strong: rgb(217 152 63 / 0.4);   /* gold-tinted, bukan abu-abu polos — bagian craft "B" */

  --primary: #102d52;            /* tidak diubah — navy, dipakai .hero-panel sbg stop tengah gradien */
  --primary-hover: #16385f;       /* tidak diubah */
  --primary-active: #0c2545;     /* tidak diubah */
  --primary-foreground: #ffffff; /* tidak diubah — teks putih di atas navy */
  --accent: #d9983f;             /* tidak diubah — gold, dipakai terpisah dari --primary di seluruh app */
  --accent-strong: #c4842c;      /* tidak diubah */
  --accent-soft: rgb(217 152 63 / 0.15);  /* dari wash krem #fff4df (buat page terang) ke wash gold tembus pandang */
  --accent-ink: #f0c078;         /* DIBALIK arahnya: di light ini gold yang DIGELAPKAN (#8a5a12) buat page terang;
                                    di dark harus gold yang DITERANGKAN. Nilainya bukan warna baru — sama dengan
                                    --ring-on-nav yang sudah ada (gold-on-navy yang sudah dipakai sistem). */

  --success: #3ed6a0;            /* 7.24:1 di card, 5.28:1 di atas --success-soft-nya sendiri */
  --success-soft: rgb(62 214 160 / 0.15);
  --destructive: #fd948d;        /* 6.26:1 di card, 4.86:1 di atas --destructive-soft-nya sendiri */
  --destructive-soft: rgb(253 148 141 / 0.15);
  --ring: #d9983f;
  /* --ring-on-nav SENGAJA tidak di-override — nilai light-nya (#f0c078) memang sudah dirancang
     untuk permukaan navy, jadi inherit itu benar. */

  /* Shadow ditarik dari hitam, bukan navy. Di atas permukaan gelap, shadow bertarik-navy
     (rgb(16 45 82 / …) seperti di :root) nyaris tidak terlihat. Offset + blur lembut
     dipertahankan — bukan halo tanpa offset. */
  --elev-1: 0 1px 2px rgb(0 0 0 / 0.30), 0 1px 3px -1px rgb(0 0 0 / 0.36);
  --elev-2: 0 2px 4px rgb(0 0 0 / 0.28), 0 6px 14px -6px rgb(0 0 0 / 0.45);
  --elev-3: 0 4px 8px rgb(0 0 0 / 0.30), 0 14px 30px -10px rgb(0 0 0 / 0.50);
  --elev-4: 0 10px 20px rgb(0 0 0 / 0.32), 0 30px 60px -20px rgb(0 0 0 / 0.60);
}
```

**Kenapa token "soft" dan `--accent-ink` WAJIB di-override, tidak boleh dibiarkan:** karena `:root` tidak disentuh, token apa pun yang TIDAK ditulis di `.ornate` akan **inherit nilai light**-nya, bukan hilang. Dicek: `Badge tone="accent"` (`app/components/ui.tsx`) pakai `bg-accent-soft text-accent-ink`. Kalau `--accent-ink` dibiarkan inherit `#8a5a12`, hasilnya gold gelap di atas wash gold-di-atas-navy = **1.80:1**, gagal total. Hal yang sama untuk `--success-soft` (`#ecfdf5`) dan `--destructive-soft` (`#fdeeee`) — nilai light-nya nyaris putih, jadi blok terang menyala di tengah tema gelap. Draf sebelumnya melewatkan ini karena cuma mengaudit warna Tailwind mentah, belum mengaudit token mana yang dipakai sebagai PASANGAN bg+teks.

Catatan yang tidak muat sebagai komentar CSS satu baris di atas:

- **`--primary` TIDAK diubah jadi gold.** `.hero-panel` (`app/globals.css`, komponen ini milik "Astra"/kerja Codex — lihat bagian Konflik di bawah) makai `var(--primary)` sebagai stop tengah gradiennya (`linear-gradient(115deg, var(--surface-nav-deep), var(--primary) 75%, #234969)`), dipakai di SEMUA halaman ornate. Draf pertama plan ini salah menulis `--primary` jadi gold (asumsi keliru bahwa nama itu bebas dipakai ulang) — itu bakal bikin garis emas nyilang tengah tiap hero banner + teks putih di atasnya gagal kontras. Dibatalkan: navy tetap navy, cuma jadi permukaan yang lebih penuh (bukan cuma sidebar/hero seperti sekarang).
- **`--accent` TIDAK digabung ke `--primary`.** Sudah dipakai terpisah di seluruh app (`buttonStyles` variant `"accent"` vs `"primary"`, 4+ pemakaian di wilayah ornate) — draf pertama salah mau menyatukan jadi satu hue, dibatalkan.
- **`--accent-ink` dibalik arahnya, bukan dihapus.** Di light dia gold DIGELAPKAN (`#8a5a12`) supaya kebaca di page terang (komentar asli `globals.css`: "#d9983f cuma 2.47:1"). Di dark perannya sama — ink untuk wash `--accent-soft` — tapi arahnya harus DITERANGKAN: `#f0c078`. Nilai itu bukan warna baru, sama dengan `--ring-on-nav` yang sudah ada di `:root`.

Kontras dihitung (formula WCAG relative-luminance standar, sRGB) terhadap permukaan yang realistis dipakai, termasuk **komposit di atas wash "soft"** — bukan cuma di atas card/page polos, karena pasangan `bg-*-soft` + `text-*` itu pola nyata di `Badge` (`app/components/ui.tsx`) dan `ExamChrome`:

| Pasangan | Kontras | Permukaan |
|---|---|---|
| `--foreground` `#f4ede0` | 11.52:1 / 13.41:1 | card / page |
| `--muted-foreground` `#a8bedb` | 7.06:1 / 8.22:1 | card / page |
| `--accent` `#d9983f` sbg teks/ikon | 5.44:1 / 6.33:1 | card / page |
| `--primary-foreground` `#ffffff` di atas `--primary` `#102d52` | 13.82:1 | tombol primary |
| `--accent-ink` `#f0c078` di atas `--accent-soft` | 6.33:1 | Badge tone="accent" |
| `--success` `#3ed6a0` | 7.24:1 / 5.28:1 | card / di atas `--success-soft` |
| `--destructive` `#fd948d` | 6.26:1 / 4.86:1 | card / di atas `--destructive-soft` |

Semua ≥ 4.5:1 (AA teks body). Angka komposit dihitung dengan alpha-blend wash 15% di atas `--surface-card`. Nilai-nilai ini dipindah ke komentar `app/globals.css` pas implementasi, pola sama seperti dokumentasi kontras yang sudah ada untuk token light.

`viewport.themeColor` di `app/layout.tsx` (`#0b2442`) TIDAK perlu diubah — sudah cocok sama page-bg baru.

## Tipografi

`--font-display-src` (`app/layout.tsx`): `Lexend` → `Cormorant_Garamond` dari `next/font/google` (variable font, weight tidak dikunci — sama pola dengan Lexend sekarang). Satu titik ubah, tidak ada file lain yang menyentuh nama font langsung (semua lewat var CSS). Body (`--font-sans-src`) TETAP Source Sans 3 — dua kebutuhan beda (identitas heritage di heading, kebacaan padat di body/sidebar/tabel) sengaja tidak disatukan ke satu font.

## Aset logo

Sumber: `LOGO D AJIK AKADEMI.png` (1254×1254, mockup render, background asap gelap non-transparan). Sudah dites (scratchpad sesi ini, background asap → transparan lewat threshold luminance — gap besar antara background (lum maks 43) dan emas (lum min ~176), cutout bersih tanpa halo di atas navy maupun hitam):

- `public/brand/dajiks-lockup.png` — crest + wordmark, transparan. Dipakai: halaman login (tampil besar di atas form).
- `public/brand/dajiks-emblem.png` — crest doang (crop dari baris di mana densitas piksel emas turun ke titik terendah antara crest dan wordmark), transparan. Dipakai: badge sidebar (ganti inisial "PC" yang sekarang), sumber untuk favicon.
- `app/favicon.ico` — digenerate ulang dari `dajiks-emblem.png`, downsample ke ukuran favicon standar.

Proses generate ulang (bukan asset final yang disimpan sekarang — spec ini didraft sebelum implementasi): resample dari PNG asli pakai PIL, threshold luminance (lo≈46, hi≈95 di skala 0-255), crop ke bounding box alpha>0, pad tipis. Diverifikasi visual (composite di atas swatch navy + hampir-hitam) sebelum dipakai final.

## Craft detail (yang membedakan pendekatan B dari A)

- Tombol/badge/nav-state-aktif: gold pakai gradient metalik tipis (dua stop gold, bukan flat single-color) — echo highlight logam di logo, bukan niru bentuknya.
- Border kartu: `--border-strong` gold-tinted (`rgb(217 152 63 / 0.4)`), bukan abu-abu netral seperti token light lama.
- Hairline divider (section, bukan tiap-baris list — lihat batasan "no border-t tiap baris" yang sudah dipegang skill desain sesi ini): echo garis tipis kiri-kanan teks "AKADEMI" di logo, dipakai sebagai satu motif berulang terbatas, bukan di mana-mana.
- **TIDAK** ada watermark crest besar di background, tidak ada bentuk crown/leaf diulang sebagai pola dekoratif — itu masuk pendekatan C yang tidak dipilih.

## Konflik dengan kerja Codex/"Astra" (ditemukan pas nulis spec ini, uncommitted)

`git status` nunjukin 67 file ke-modifikasi + beberapa file baru yang tidak pernah disentuh sesi ini, termasuk `UI_UX_IMPROVEMENT_PLAN.md` (plan Codex sendiri, tanggal 11 September 2026 — kemarin, mtime file cocok, proses Codex dikonfirmasi jalan). Poin #6 plan itu: **"Hero bar dan header halaman lebih futuristik, mempertahankan identitas navy/gold. Variasikan komposisi section card..."** — hasilnya `PageHeader`/`.hero-panel` di `app/components/ui.tsx` + `app/globals.css`, dipakai di **persis** wilayah ornate yang plan ini targetin (dashboard, latihan-picker, simulasi, review, admin, login, gerbang latihan).

Ini bukan cuma "kebetulan file yang sama" — sempat ketemu bug nyata: `.hero-panel` makai `var(--primary)` sebagai stop tengah gradien navy-nya. Draf pertama plan ini menulis `--primary` jadi gold (asumsi keliru bahwa itu variabel bebas dipakai ulang). Sudah dibatalkan di atas — `--primary` tetap navy, `--accent` tetap gold, dua token terpisah seperti semula. Audit ulang (`grep` raw Tailwind color) dijalankan LAGI terhadap isi disk yang sekarang (bukan cache baca sebelumnya) — hasilnya tetap nol, jadi klaim "token-swap ngalir bersih" di atas masih valid terhadap kerja Astra yang sudah ada.

**Kesimpulan:** kerja Astra kemungkinan besar KOMPATIBEL dengan plan ini (struktur/komposisi kartu dari Astra, warna dari plan ini — dua hal beda yang sama-sama lewat token) SELAMA `--primary` tidak disentuh maknanya. Tapi ini belum di-commit oleh siapa pun (Codex tidak bisa commit), jadi:
- Kalau user mau `git commit` kerja Astra dulu sebelum implementasi plan ini mulai, riwayatnya bersih (rebrand kelihatan sebagai layer terpisah di atas struktur Astra, bukan bercampur dalam satu commit besar).
- Kalau tidak, plan ini tetap bisa jalan di atas working tree yang sekarang — cuma commit akhirnya akan menyatukan kerja Astra + rebrand jadi satu, lebih susah di-review terpisah kalau nanti perlu.
- Bukan blocking teknis, tapi keputusan alur kerja punya user — ditanyakan sebelum lanjut ke `writing-plans`.

## Konsekuensi ke `KecermatanPackageCarousel` (dikerjakan sesi ini, sebelum permintaan rebrand)

Kartu carousel (`app/globals.css` `.package-carousel__*`, ditambah efek scanline+reticle) didesain sebagai "pulau navy gelap di atas page terang" — kontras kartu-vs-page datang dari page yang terang. Begitu `--surface-page` jadi navy, konteksnya berubah jadi "navy di atas navy". Perlu di-tune ulang (bukan dirombak): gradien kartu (`#0b2442 → #102d52 → #17395f`) kemungkinan perlu digeser lebih terang dari `--surface-page` baru (mengikuti pola elevation yang sama dipakai `--surface-card`), supaya kartu tengah tetap kebaca "terangkat". Mekanisme (coverflow 3D, scanline comet-beam, reticle sudut) tidak berubah sama sekali — cuma nilai warna yang disesuaikan konteks baru.

## Audit teknis (dikonfirmasi, bukan asumsi)

- `grep` raw Tailwind (`slate-*`/`emerald-*`/`amber-*`/`indigo-*`/`rose-*`) di seluruh file wilayah ornate (`app/dashboard`, `app/login`, `app/admin`, `app/components/ui.tsx`, `app/components/ui-client.tsx`): **nol hasil.** Semua sudah lewat token semantik, jadi override `.ornate` diperkirakan mengalir bersih ke wilayah ornate tanpa perlu file-by-file rewrite class — kecuali penempatan logo (butuh JSX baru di `Sidebar.tsx` + `login/page.tsx`) dan file yang memang menyebut hex literal langsung (`.package-carousel__*` di `globals.css`, lihat konsekuensi di atas).
- `grep` token semantik yang sama (`bg-card`, `text-foreground`, `bg-primary`, `text-success`, dst) di file wilayah "stay light" (`ExamChrome.tsx`, `Engine*.tsx`, `Latihan*.tsx`, `KecermatanClient.tsx`): **hasilnya banyak** — inilah yang membatalkan rencana ganti `:root` global (lihat bagian Token). Karena scoping-nya lewat class ancestor (`.ornate`) dan file-file ini tidak pernah dibungkus elemen itu, mereka tetap resolve ke `:root` asli tanpa perlu diubah — nol risiko meski token-nya sama persis.
- `viewport.themeColor` sudah `#0b2442` — cocok, tidak perlu diubah.
- `app/favicon.ico` ada, konvensi App Router — akan ditimpa.

## Yang belum diputuskan / risiko terbuka (untuk dicek pas implementasi, bukan blocking spec ini)

- Wrapper root `app/login/page.tsx` dan `app/admin/page.tsx` perlu punya background eksplisit (`bg-background` atau sejenis) di elemen yang sama dengan `className="ornate"` — kalau tidak, `<body>` (yang tetap `:root` light, di luar scope `.ornate`) bisa keliatan sekilas di balik konten sebelum wrapper me-render. Cek pas implementasi, bukan blocking (pola ini sudah dipakai `app/dashboard/layout.tsx` lewat `bg-background` di root div-nya).
- Apakah `app/dashboard/review/page.tsx` (mode baca ulang pembahasan) butuh perlakuan kontras khusus untuk badge benar/salah — cek saat implementasi, bukan blocking.
- `app/rescue/page.tsx` prioritas rendah (tooling recovery internal, bukan permukaan yang sering dilihat peserta) — ornate tapi boleh disentuh belakangan kalau waktu terbatas.
