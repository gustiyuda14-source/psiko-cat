# Seed 5 Paket Kecermatan Baru + UX Latihan (kolom klik, jeda antar-kolom, pembahasan on-finish)

## Context

Modul Kecermatan sekarang cuma punya 1 bank soal aktif (`prisma/data/bank_soal_p7.json`, "Paket 7", 500 soal / 10 kolom) yang dipakai bergantian buat real exam dan latihan. User punya 5 situs referensi statis (bikinan sendiri, format identik) berisi 5 bank soal Kecermatan siap pakai lengkap dengan kunci jawaban, dan mau semuanya di-seed ke database supaya soal makin variatif. Sekalian, mode Latihan Kecermatan saat ini punya 2 UX gap nyata: kolom (Roman numeral strip) cuma dekoratif — gak bisa diklik buat lompat — dan gak ada tombol selesai sama sekali (soal terakhir dijawab, layar diem, gak ada pembahasan).

Masalah struktural yang bikin ini gak sesederhana "insert 4 baris JSON baru": skema `questions` gak punya konsep "paket" sama sekali — query fetch soal Kecermatan (baik real exam maupun latihan) narik SEMUA baris `is_active=true` tanpa batas, dan kode scoring (`lib/scoring/kecermatan.ts`) + engine (`EngineKecermatan.tsx`) hardcode asumsi tepat 500 soal / 10 kolom. Nambah 5 paket (2500 baris) apa adanya bakal narik 2500 soal sekaligus dan bikin formula Ke/Kt/Kh salah total.

Keputusan yang udah difinalkan bareng user (lewat pertanyaan terstruktur):
1. **Random per sesi** — tambah kolom `package_number`, tiap kali Kecermatan dimulai, sistem pilih 1 paket acak dari yang tersedia. Real exam nyimpen pilihan itu di `module_sessions` (biar konsisten kalau di-resume); latihan gak perlu nyimpen (stateless, pilih ulang tiap buka halaman).
2. **Jeda 5 detik itu ANTAR KOLOM**, bukan antar soal — auto-advance antar soal tetap cepat (500ms, gak berubah), tapi begitu 1 kolom (50 soal) kelar, ada jeda 5 detik sebelum kolom berikutnya mulai. Ini niru pola yang udah ada di real exam engine (`INTRO_SECONDS=5` di `EngineKecermatan.tsx`).
3. **Tombol selesai (early-submit / natural-finish)** → nampilin layar pembahasan lokal (client-side, gak nyimpen ke DB — latihan emang gak pernah persist) dengan accordion per kolom, persis pola situs referensi ke-5 (`ACCURACY-XI---XX`) yang udah di-fetch dan dipelajari detail: `✓ benar / ✗ salah / progress bar / %` per kolom, expand nampilin soal yang salah (simbol yang ditampilkan, jawaban user, jawaban benar).
4. **Paket-5 anomali** (Kolom X = 51 soal bukan 50) → dipotong ke 50 pas transform data, biar konsisten sama asumsi `TOTAL_SOAL=500` di seluruh kode scoring — nol perubahan formula.

**Rekomendasi tambahan** (belum ditanya eksplisit, silakan koreksi di plan ini kalau gak setuju): situs ke-5 (`ACCURACY-XI---XX`) yang diminta dipelajari buat pola UI-nya, isinya JUGA bank soal Kecermatan lengkap yang valid (10 kolom "XI–XX" × 50 soal = 500, simbol beda dari yang lain) — sekalian di-seed juga sebagai paket ke-6, biar gak ada bank soal yang kebuang percuma. Kalau gak mau, source datanya cukup dipakai buat pola UI pembahasan aja, gak usah di-insert ke DB.

Total kalau semua dipakai: **6 paket Kecermatan** (nomor 3, 4, 5, 6, 7-lama, 8-baru).

---

## A. Skema: `package_number` di `Question` + `module_sessions`

Repo ini gak punya folder migrasi (`supabase/migrations/`) — pola yang udah ada adalah edit `prisma/schema.prisma` lalu jalanin manual (lihat `seed-kecerdasan.sql` di root sebagai preseden "generate SQL, paste ke Supabase SQL editor"). Ikuti pola yang sama.

**`prisma/schema.prisma`, model `Question`** (baris 140-162 per riset):
- Tambah `package_number Int?` — nullable, gak ada default. Cuma bermakna buat `type=KECERMATAN`; baris Kecerdasan/Kepribadian biarin `null`.
- Backfill: `UPDATE questions SET package_number = 7 WHERE type='KECERMATAN'` (nyamain data lama yang udah ada jadi "Paket 7").
- Index baru: `@@index([type, package_number, column_index])` (gantiin/lengkapin `@@index([type, column_index])` yang sekarang, biar fetch per-paket tetap efisien terurut per kolom).

**`prisma/schema.prisma`, model `ModuleSession`** (baca modelnya dulu sebelum edit — belum ada di hasil riset ini, konfirmasi kolom yang udah ada biar gak nabrak nama):
- Tambah `kecermatan_package_number Int?` — diisi SEKALI pas `createTestSessionAndRedirect` bikin baris ini (kalau modul yang diminta termasuk KECERMATAN), dibaca ulang tiap kali soal Kecermatan sesi itu di-fetch (termasuk pas resume). Ini WAJIB biar user yang reload di tengah exam gak tiba-tiba dapet soal dari paket lain (invarian resume-safety yang udah dijaga ketat di seluruh app ini).

Jalankan `npx prisma db push` (atau generate SQL manual + minta user paste ke Supabase SQL editor kalau `db push` bukan alur yang dipakai — cek `package.json` scripts dulu).

---

## B. Pipeline data: fetch situs → file JSON lokal → seed

**Jangan fetch live pas seeding jalan** — ikutin pola `bank_soal_p7.json` yang sudah checked-in di repo (`prisma/data/`). Snapshot dulu, baru seed dari file lokal. Ini lebih ponytail (gak gantung uptime situs eksternal, gak butuh network access pas `npx prisma db seed` jalan) dan konsisten sama cara kerja seeder yang udah ada.

1. Tulis skrip one-off (`scripts/fetch-kecermatan-packages.ts`, boleh dihapus/gak di-commit setelah dipakai, atau disimpen di `scripts/` kalau mau reproducible) yang:
   - `curl`/fetch raw HTML tiap situs (5 URL: PAKET-3, PAKET-4, PAKET-5, PAKET-6, ACCURACY-XI---XX).
   - Extract `const KOLOM_DATA = [...]` dari tag `<script>` via regex, PARSE pakai `new Function("return " + arrayLiteralSource)()` (bukan `JSON.parse` — key-nya gak dikutip, itu literal objek JS, bukan JSON valid).
   - Transform ke bentuk yang sama persis kayak `bank_soal_p7.json`: `{ nomor, nama, total_soal, kolom: [{ nomor, simbol: {A..E}, soal: [{ nomor, shown, kunci }] }] }` — field `KOLOM_DATA[].symbols` jadi `simbol`, `.key` jadi `kunci`, dst.
   - **Paket-5 khusus**: pas transform, potong `kolom[9].soal` (Kolom X, index ke-9) ke 50 elemen pertama aja (`.slice(0, 50)`).
   - Tulis hasil ke `prisma/data/bank_soal_p3.json`, `bank_soal_p4.json`, `bank_soal_p5.json`, `bank_soal_p6.json`, `bank_soal_p8.json` (nomor 8 buat situs ACCURACY-XI---XX, ikutin skema penomoran di atas).
2. Validasi tiap file: 10 kolom, masing-masing tepat 50 soal, tiap soal `shown.length===4` dan `kunci` adalah satu-satunya simbol di `simbol` yang gak ada di `shown` (logic yang sama kayak `lib/review.ts:113`, dipakai juga buat sanity-check data sebelum insert, bukan cuma pas review).

---

## C. Seed script: extend `prisma/seed.ts`

`seedKecermatan()` (baris 34-74) sekarang baca 1 file (`bank_soal_p7.json`) dan insert tanpa `package_number`. Ubah jadi:
- Loop atas daftar `{ file: "bank_soal_p3.json", package_number: 3 }, ..., { file: "bank_soal_p7.json", package_number: 7 }, { file: "bank_soal_p8.json", package_number: 8 }` (6 entri).
- Tiap file, proses persis kayak sekarang (bangun `options_payload`/`scoring_rule` per soal) TAPI tambahin `package_number` ke tiap row yang di-`createMany`.
- `sequence_number`: keputusan desain — tetap pakai counter global 1-500 PER PAKET (reset tiap paket, bukan nyambung 501-1000-dst lintas paket), karena `sequence_number` cuma dipakai buat urutan tampil DALAM satu sesi/satu paket yang lagi aktif — gak pernah dibandingin lintas paket. Konfirmasi ini gak nabrak index unique manapun (index yang ada adalah composite `[type, package_number, column_index]`, bukan unique constraint atas `sequence_number` sendirian, jadi aman).
- Seed keseluruhan (`prisma/seed.ts`) masih `DELETE`-all-then-reinsert di awal (baris 181) — jangan diubah, cuma pastikan urutan `seedKecermatan()` dipanggil sekali insert 6×500=3000 baris.

---

## D. Query & session logic: pilih paket

**`lib/test-session.ts`** — tambah util kecil:
```ts
export const KECERMATAN_PACKAGES = [3, 4, 5, 6, 7, 8]; // atau query DISTINCT package_number dari DB kalau mau dinamis
export function pickRandomKecermatanPackage(): number {
  return KECERMATAN_PACKAGES[Math.floor(Math.random() * KECERMATAN_PACKAGES.length)];
}
```
(Kalau nanti nambah paket lagi, cukup ubah array ini — atau query `DISTINCT package_number` biar auto-detect, pilih salah satu, bukan keduanya, biar gak over-engineer buat kebutuhan sekarang.)

**`lib/test-session.ts` `createTestSessionAndRedirect`** (baris 27-47): kalau `moduleTypes.includes("KECERMATAN")`, panggil `pickRandomKecermatanPackage()` sekali, simpan ke `module_sessions` row Kecermatan yang lagi di-insert (`kecermatan_package_number: type === "KECERMATAN" ? chosenPackage : null` di dalam `.map()` yang udah ada).

**`app/test/[sessionId]/kecermatan/page.tsx`** (baris ~38-44 real exam fetch): baca `module_session.kecermatan_package_number` dulu (query `module_sessions` buat sesi ini, ambil kolom itu), lalu tambah `.eq("package_number", chosenPackage)` ke query `questions`. Kalau kolom itu `null` (harusnya gak pernah terjadi buat sesi baru, tapi jaga-jaga sesi lama pra-migrasi) — fallback ke `package_number=7` (paket lama, biar sesi yang udah ada gak patah).

**`app/dashboard/latihan/[module]/page.tsx`** (query generic buat 3 modul): khusus cabang KECERMATAN, panggil `pickRandomKecermatanPackage()` tiap render (stateless, sesuai keputusan #1 — gak perlu persist, tiap buka halaman latihan bisa beda paket) dan tambah `.eq("package_number", chosen)` ke query-nya.

**Cek turunan**: `lib/scoring/kecermatan.ts`'s `TOTAL_SOAL=500`/`TOTAL_LAJUR=10` (baris 55-56) dan `EngineKecermatan.tsx`'s `TOTAL_COLS=10` (baris 14) — TETAP VALID tanpa perubahan, karena tiap paket (termasuk Paket-5 yang udah dipotong) selalu persis 500/10. Ini alasan kenapa keputusan #4 (potong Paket-5) penting — kalau enggak, exam yang kebagian Paket-5 bakal salah hitung Kt/Ke.

---

## E. Praktik Kecermatan: kolom bisa diklik + jeda 5 detik antar-kolom + pembahasan on-finish

File: `app/latihan/[module]/LatihanKecermatan.tsx` (170 baris, model state flat `idx`/`answers`/`checking`, TIDAK perlu direstruktur ke model column-bucketed — tetap pakai array flat + index, cuma tambah 3 kemampuan):

1. **Kolom bisa diklik**: strip Roman-numeral yang sekarang (baris 63-74, `<div>` dekoratif) jadi `<button onClick={() => setIdx(sorted.findIndex(q => q.column_index === colNum))}>`. Cuma boleh lompat ke kolom yang SUDAH pernah dicapai atau kolom manapun bebas? Keputusan sederhana: bebas lompat ke kolom manapun (latihan gak ada time pressure/skor resmi, beda dari real exam yang emang sengaja dikunci per-kolom demi integritas tes) — biar sesuai kalimat user "tiap kolom dapat dipencet" tanpa embel-embel syarat.

2. **Jeda 5 detik antar-kolom**: di `pick()` (baris 26-43), deteksi batas kolom — kalau soal yang baru dijawab adalah SOAL TERAKHIR di kolomnya (`sorted[idx].column_index !== sorted[idx+1]?.column_index`), pakai delay 5000ms bukan 500ms sebelum `setIdx`. Tampilin state transisi ringan (mis. overlay/banner kecil "Lanjut ke Kolom {romawi} dalam Ys…", niru semangat `EngineKecermatan.tsx`'s intro screen tapi versi ringan — gak perlu screen terpisah, cukup badge di atas kartu soal) supaya user ngerti kenapa nge-lag 5 detik, bukan berasa nge-freeze.

3. **Tombol "Selesaikan Latihan" (early-submit) + pembahasan on-finish**:
   - Tombol baru, selalu tampil (atau nongol setelah kolom pertama kelar — opsional, situs referensi gate begini tapi bukan requirement keras user). `onClick`: `window.confirm(...)` (pola yang sama kayak dipakai di `EngineKecermatan.tsx`) → set local state `finished = true`.
   - Natural-finish (soal ke-500 kolom ke-10 dijawab) JUGA set `finished = true` (baris 37 sekarang cuma nge-guard timeout tanpa transisi ke state akhir apa pun — ini bug UX yang mesti dibenerin barengan).
   - State `finished`: render layar pembahasan, BUKAN lanjut soal.
   - **Data pembahasan dihitung 100% client-side** dari `answers` (state lokal yang udah ada, `Record<question_id, Feedback>`) + `sorted` (array soal yang udah ada) — group by `column_index`, hitung correct/wrong per kolom, kumpulin detail soal yang salah (shown symbols, `selected`, `correct_key`) buat soal yang gak ke-jawab (kalau early-submit sebelum semua terjawab) DAN yang salah. TIDAK ada call ke backend — cocok sama sifat latihan yang emang gak pernah persist ke `test_sessions`/`kecermatan_logs`.
   - **Reuse, jangan tulis ulang**: `app/components/PembahasanSection.tsx` UDAH punya persis pola accordion-per-kolom ini (`KecermatanDetailReview`, baris 239-288, native `<details>`) — cuma dipakai buat data DARI SERVER (`KecermatanColumnGroup[]` via `lib/review.ts`). Export `KecermatanDetailReview` (sekarang gak di-export, cuma dipakai internal) dari `PembahasanSection.tsx`, lalu di `LatihanKecermatan.tsx` bikin helper kecil yang ngerakit `answers`+`sorted` lokal jadi bentuk `KecermatanColumnGroup[]` yang sama persis (tipe udah ada, tinggal diisi dari data lokal bukan dari DB), terus render `<KecermatanDetailReview groups={localGroups} />`. Ini ngirit banget — nol duplikasi UI accordion, cuma nulis 1 fungsi agregasi kecil.
   - Tombol "Kembali ke Latihan" / "Ulangi" di layar pembahasan → reset state (`idx=0, answers={}, finished=false`) atau `router.push("/dashboard/latihan")`, whichever kerasa pas — implementer bebas pilih, bukan keputusan berat.

**Yang TIDAK disentuh** (di luar scope, per keputusan user yang cuma minta "latihan"):
- `EngineKecermatan.tsx` (real exam) — TIDAK dapet kolom-bisa-diklik atau tombol early-submit-dari-mana-aja. Itu sengaja dikunci demi integritas skor timed-test; user gak minta ini diubah. Satu-satunya sentuhan ke file ini adalah query fetch soal (poin D) yang otomatis kebawa karena butuh `package_number`.
- `lib/scoring/kecermatan.ts` — nol perubahan formula (lihat poin D).
- `lib/hooks/use-exam-engine.ts`, `lib/stores/exam-store.ts` — gak kepake sama Kecermatan, gak disentuh.

---

## Verifikasi

1. `npx prisma db push` (atau SQL manual) sukses, `npx tsc --noEmit` bersih.
2. `npx prisma db seed` — cek log insert count: harus 3000 baris Kecermatan (6 paket × 500), plus Kecerdasan/Kepribadian gak berubah.
3. Query manual (Supabase SQL editor atau `psql`): `SELECT package_number, COUNT(*) FROM questions WHERE type='KECERMATAN' GROUP BY package_number` → harus 6 baris, masing-masing persis 500.
4. `npm run build` hijau.
5. Manual di browser (`npm run dev`, login `aurel`/`G6SHQF`):
   - Buka `/dashboard/latihan/kecermatan` beberapa kali (refresh berkali-kali) — cek variasi simbol yang muncul beda-beda (bukti random-package jalan).
   - Klik langsung ke Kolom V (atau kolom manapun bukan I) — harus lompat ke soal pertama kolom itu.
   - Jawab semua soal 1 kolom sampai abis — cek ada jeda ~5 detik sebelum kolom berikutnya muncul (bukan langsung kayak sebelumnya).
   - Pencet "Selesaikan Latihan" di tengah jalan — muncul confirm, lalu layar pembahasan dengan accordion per kolom, expand salah satu yang ada soal salah, cek detail (shown symbols, jawaban dipilih vs kunci) benar.
   - Selesaikan semua 500 soal natural (atau simulasi cepat) — pastikan juga nyampe ke layar pembahasan yang sama, bukan freeze.
   - Mulai Real Exam Kecermatan (`/test/new/kecermatan`), refresh di tengah jalan (browser reload) — pastikan simbol yang muncul SAMA sebelum dan sesudah reload (bukti `kecermatan_package_number` ke-persist bener di `module_sessions`, resume-safe).
   - Selesaikan 1 real exam Kecermatan sampai `/result`, cek `RINCIAN PER KOLOM` di halaman hasil masih jalan normal (regresi-check bagian yang gak diubah).
