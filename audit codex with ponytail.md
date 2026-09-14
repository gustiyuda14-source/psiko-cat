# Audit Ponytail — CAT PPUPD Redesign Plan

Tanggal audit: 2026-09-07  
Scope: kompleksitas/over-engineering saja; tidak mengaudit correctness, security, atau performa.

## Putusan

Arsitektur target tepat pada level besar: ini bukan pergantian framework, melainkan refactor IA/UI di atas Next.js 16 App Router, React 19, Tailwind 4, dan Supabase yang sudah ada.

Jangan eksekusi plan apa adanya. Pangkas migrasi tema, komponen shell, duplikasi renderer review, dan metadata modul sebelum mulai. Perkiraan pengurangan: sekitar 300 baris implementasi rencana.

Repo `cat-ppupd-muda` tidak tersedia di workspace saat audit, dan URL GitHub yang disebut plan tidak dapat diverifikasi secara publik. Perbandingan target CAT PPUPD di bawah berdasarkan kutipan dalam plan; kondisi `psiko-cat` diverifikasi langsung dari kode lokal.

## Perbandingan framework

| Lapisan | `psiko-cat` sekarang | Target plan | Putusan |
| --- | --- | --- | --- |
| Runtime | Next.js 16 App Router, React 19, Tailwind 4, Supabase | Sama | Reuse stack; jangan buat layer baru. |
| Navigasi | Dashboard monolitik, halaman lain full-screen | Nested `/dashboard/*` layout | Tepat; gunakan nested layout bawaan App Router. |
| Engine ujian | Client state/Zustand dan rute `/test/*` | Dipertahankan, reskin saja | Tepat. Jangan rombak logic engine. |
| Tema | Remap skala warna Tailwind secara global | Token semantik + migrasi class luas | Terlalu mahal bila remap lama langsung dibuang. |
| Review | Satu renderer `PembahasanSection`, fetcher di result page | Fetcher bersama + halaman review baru | Ekstraksi fetcher tepat setelah ada pemakai kedua; renderer tidak boleh digandakan. |
| Metadata modul | Sudah tersebar di beberapa file | Akan bertambah di halaman baru | Satukan dalam `MODULE_CONFIG`. |
| Dependensi UI | Tanpa icon/component library | Menambah Phosphor | Tidak perlu untuk kebutuhan saat ini. |

## Temuan

1. `CAT_PPUPD_REDESIGN_PLAN.md:L25,L80` — `shrink`: membuang seluruh color remap memaksa migrasi ratusan class. `app/globals.css:L5-L13` justru dibuat untuk menghindari perubahan massal. Pertahankan remap sebagai compatibility layer, ubah nilainya ke palet baru, tambah token semantik untuk kode/rute baru, lalu hapus alias hanya setelah kebutuhan nyata muncul.

2. `CAT_PPUPD_REDESIGN_PLAN.md:L42` — `native`: `@phosphor-icons/react` hanya mengganti emoji/panah dekoratif. Gunakan inline SVG atau text icon yang sudah ada di aplikasi; tidak perlu dependency baru.

3. `CAT_PPUPD_REDESIGN_PLAN.md:L84` — `yagni`: `DashboardFrame` client hanya untuk flex shell dan hamburger. Pertahankan layout dashboard sebagai server component; satu `Sidebar` client dapat memiliki state drawer mobile sendiri.

4. `CAT_PPUPD_REDESIGN_PLAN.md:L85` — `shrink`: frasa “pakai logika `LogoutButton`” berisiko menyalin `fetch` dan routing. Pakai `app/components/LogoutButton.tsx` langsung; tambahkan prop class/children jika tampilan sidebar membutuhkannya.

5. `CAT_PPUPD_REDESIGN_PLAN.md:L86` — `delete`: KPI “Streak” dan panel “Kesiapan latihan” belum menyelesaikan masalah navigasi, tidak punya definisi produk/data yang jelas, dan menambah query/logika. Pertahankan KPI yang sudah ada serta grafik aktivitas.

6. `CAT_PPUPD_REDESIGN_PLAN.md:L90` — `delete`: tiga stat tile di Simulasi menduplikasi KPI Beranda. Halaman Simulasi cukup memuat kartu paket tes dan sesi berjalan.

7. `CAT_PPUPD_REDESIGN_PLAN.md:L90-L92` — `shrink`: kartu Simulasi, Latihan, dan overview berisiko menambah salinan metadata modul di samping `MODULE_META` overview dan `META` latihan. Jadikan `lib/test-session.ts:MODULE_CONFIG` satu sumber untuk slug, label, durasi, dan deskripsi; semua halaman melakukan map dari sana.

8. `CAT_PPUPD_REDESIGN_PLAN.md:L92-L93` — `yagni`: memindahkan empat komponen latihan hanya untuk mengikuti URL baru adalah churn tanpa perubahan perilaku. Buat route `/dashboard/latihan/[module]` yang mengimpor komponen lama; route lama cukup redirect.

9. `CAT_PPUPD_REDESIGN_PLAN.md:L97` — `shrink`: halaman Review tidak boleh membuat accordion/review renderer kedua. `PembahasanSection.tsx` sudah merender Kecerdasan, Kepribadian, Kecermatan, dan detail lajur. Halaman baru cukup memilih sesi lalu merender komponen tersebut.

10. `CAT_PPUPD_REDESIGN_PLAN.md:L98` — `shrink`: rewrite penuh `PembahasanSection.tsx` (366 baris) tidak diperlukan. Ganti primitive dropdown menjadi native `<details>/<summary>` lalu recolor class yang relevan.

11. `CAT_PPUPD_REDESIGN_PLAN.md:L130` — `shrink`: `npx tsc --noEmit` diikuti `npm run build` menduplikasi pemeriksaan tipe. `next.config.ts` tidak mengaktifkan `ignoreBuildErrors`, sehingga `next build` sudah gagal saat ada error TypeScript. Jalankan `npm run build` pada milestone/final.

12. `CAT_PPUPD_REDESIGN_PLAN.md:L144` — `delete`: pembaruan dua memory scope menciptakan sumber status tambahan. Jadikan plan repo sebagai sumber status; memory hanya diubah bila diminta eksplisit oleh pengguna.

## Yang tetap dipertahankan

- Nested dashboard layout dan pemisahan `/test/*` sebagai focus mode.
- Native `<details>/<summary>` untuk accordion.
- Ekstraksi fetcher review ke `lib/review.ts`, karena akan dipakai halaman hasil dan Review Soal.
- Reuse grafik SVG `ActivityCharts`; jangan tambah library chart.
- Nol perubahan schema dan nol component-library/CSS utility baru.

## Catatan untuk evaluasi Claude

Phase 5 tentang hasil Real Exam standalone bukan bagian UI murni, tetapi jangan dihapus bila kartu Real Exam tetap dipublikasikan: rute standalone memang sudah ada saat ini. Pisahkan sebagai perubahan scoring tersendiri agar diff UI tetap mudah direview. Audit ini tidak memutuskan correctness aturan scoring tersebut.

`net: -300 lines possible.`
