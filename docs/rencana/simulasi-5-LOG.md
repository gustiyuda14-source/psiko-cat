# LOG — Simulasi 5 (rencana `simulasi-5.md` rev. 5)

## Sesi 1 · 2026-10-14

Scratchpad sesi ini: `<SP1>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/114cb3f9-d276-4c4e-bed7-76fbbd291280/scratchpad`. Tidak ada tulis DB, tidak ada commit.

### Selesai
- **(a) Codex-1 dan Codex-2 dikirim** (background, `codex exec -s workspace-write`):
  - Codex-1: 24 butir numerik pkg 20 → `prisma/data/kecerdasan_p20_num.json`. Slot: DER 57–64 (57, 58, 61 = sedang, sisanya HOTS), HIT 76–81 hitung cepat · 82–85 pecahan/desimal/persen/akar · 86–87 konversi, CRT 93–96. Kunci tiap huruf 6–7 dari 32 huruf. DER membawa field sementara `lengkap` (deret utuh, untuk pemeriksa), **hapus saat digabung**. Brief `<SP1>/codex/codex-1-numerik.md`, pemeriksa `<SP1>/codex/cek-num20.ts`, log `log-1.txt`, laporan `out-1.md`.
  - Codex-2: 63 SK → `bank/pribadi/sk-sim5-01.json`, id `SK-Dx-6xx`, komposisi sama dengan sk-sim4 (SK_SLOT + 4 pasang kembar D1/D2/D3/D5 dengan posisi kunci ditukar), kunci A 31–32. Brief `<SP1>/codex/codex-2-sk.md`, pemeriksa `<SP1>/codex/cek-sk15.ts` (komposisi, kembar, Jaccard < 0,5 terhadap semua `sk-*.json`, A-7 termasuk komando/satuan/operasi/apel/piket; sudah diuji: sk-sim4 lolos), lalu `scripts/check-bank-pribadi.ts`. Status saat LOG ditulis: lihat bagian "Status Codex" di bawah.
- **(b) Baca DB (read-only, supabase-js `select`, skrip `<SP1>/read-db.ts`, `<SP1>/read-keys.ts`; Supabase MCP tidak tersedia di sesi ini).** Dump slot 65–100: `<SP1>/db-p15.json`, `<SP1>/db-p19.json`.
- **(c) Kecermatan 13 selesai** (dikerjakan subagent, diaudit ulang Claude): `prisma/data/bank_soal_p13.json` = kolom 6–10 p509 (I–V) + p510 (VI–X), path SVG tetap `/kecermatan-spasial/p509|p510/` (seed dan mesin ujian tidak membedakan folder; label pelafalan hanya dipakai `LatihanKecermatan.tsx`). `kategori: "SPASIAL"`, `jenis: "SPASIAL DASAR MENENGAH"` per kolom. Asersi: 10×50, A–E = 10 per kolom, beruntun ≤ 2, identik dengan sumber, 50 SVG ada, tanpa field label. `lib/kecermatan-symbols.test.ts` + 13 → **13.000 lolos**. `tsc` bersih. Pedoman Kecermatan §3, §5, §6, §8 diberi catatan pengecualian kartu 5.
- **(d) `scripts/cek-alokasi.ts` + 5 butir Alokasi pkg 19 → SEMUA LOLOS.** Data di `prisma/data/kecerdasan_alokasi.json` (`{"19": {wacana, soal}}`). Pemecah brute force: jendela, jeda (tugas boleh terpotong jeda), tugas `sendiri` (tak boleh didelegasikan), `tenggat`, `rekan_mulai`; mode `delegasi` / `pas` / `strategi` (§2.4b: `delegasi && !korban && hemat ≥ kelebihan`). Asersi susunan §2.4a, opsi = data, pembahasan menyebut waktu kerja + kelebihan + setiap `Opsi X (`, `Jawaban: <isi> (K).`, `Tips:`; anti-bocor nama tugas + jendela terhadap K07/K11 dan antar-butir; D-3 (kunci = tugas terpanjang maks 2 butir per paket); A-7. Uji mutasi: mengubah `sendiri`, kunci, atau daftar → gagal. Cek bocor sempat menangkap 3 nama tugas yang ada di drill (diganti).

| Slot pkg 19 | Bentuk | Tingkat / kunci (warisan) | Isi |
|---|---|---|---|
| 88 | contoh, jendela 13.37–14.52 | HOTS · B | petugas perpustakaan; katalog wajib sendiri; E = jam dikurangkan seperti bilangan biasa (1452 − 1337) |
| 89 | jeda wajib + delegasi | HOTS · D | bendahara koperasi sekolah, rapat 08.20–08.35; pengecoh = lupa memotong jeda |
| 90 | sepasang tugas, sisa habis pas | HOTS · A | panitia cerdas cermat; pasangan 35 menit tunggal dari semua pasangan |
| 91 | **delegasi terbaik dengan jeda (§2.4b)** | sedang · C | panitia seminar himpunan; makan siang 13.50–14.10 |
| 92 | tenggat + rekan datang belakangan | HOTS · D | staf pendaftaran puskesmas; berkas antrean tenggat 08.00, rekan tiba 08.05 |

- **Render 360 px** (`<SP1>/render/alok-360c.png`, markup sama dengan `QuestionPassage`): **titik daftar dipertahankan** (list-disc, `QuestionPassage` tidak diubah); masalah yang terlihat justru "27 / menit" pindah baris karena rata kiri-kanan di layar sempit → baris tugas memakai **spasi tak-putus** sebelum "menit" (diasersi `cek-alokasi.ts`). Pemilik boleh minta `list-none pl-0` nanti.

### Temuan DB (read-only)
- **pkg 15**: 103 baris, 100 aktif, nomor 1..100. Teks file `kecerdasan_p15_teks.json` **tidak sama** dengan DB di 88–96: DB = file bergeser 1–2 nomor (file 88 "bilangan dikurangi 1/4" dan file 90 "mobil 90 km/jam" + KUA 99 sudah nonaktif). Sebaran kunci aktif A24 B24 C23 D25 **E27** (123 huruf). Pembahasan 100/100, `pembahasan_svg` 23.
- **pkg 19**: 100 baris, 100 aktif. Sebaran A25 B24 C26 D24 E24 (cocok dengan rencana). **Pembahasan di DB 0/100** dan `pembahasan_svg` 0 → backfill pkg 19 belum pernah dijalankan (masuk §5a langkah 5).
- **Wacana C = 73–75 di kedua paket (§2.5a terkonfirmasi):** pkg 15 `p15wASAL` "Lima anggota baru …" kunci A, B, D · tingkat 2, 3, 3. pkg 19 `p19wPIKET` "Lima guru …" kunci E, D, C · tingkat 3, 3, 3.
- **Utang A-7 di pkg 15 live** (bukan lingkup rencana, hanya dicatat): wacana B 69–72 "Enam kegiatan Polsek", 65–68 "petugas berjaga di pos", KCK 98 "Satuan lalu lintas … Operasi", CRT 95 "persediaan makanan di sebuah pos".

**Kunci dan tingkat per slot (DB aktif):**

| Slot | pkg 15 isi · tingkat · kunci | pkg 19 isi · tingkat · kunci |
|---|---|---|
| 65–68 | WAC POS · 2,3,2,3 · D B E A | WAC LOKER · 2,2,3,3 · E D B D |
| 69–72 | WAC JADWAL · 2,3,3,3 · C B E D | WAC HALTE · 2,3,3,3 · E D B A |
| 73–75 | WAC ASAL · 2,3,3 · A B D | WAC PIKET · 3,3,3 · E D C |
| 76–87 | HIT · 2,2,3,2,2,3,2,2,2,3,2,3 · C E A B D B E C A D E C | HIT · 2,2,3,2,3,2,3,2,3,3,3,3 · C A E B D C B E A D C E |
| 88 | konversi kg/dag/g · 2 · E | konversi km/m/dm · 3 · B |
| 89 | luas tanah hm × dm · 3 · B | konversi liter/cm³/dm³ · 3 · D |
| 90 | pesawat berangkat pukul … · 3 · D | konversi ha/dm² · 3 · A |
| 91 | CRT diskon sepatu · 2 · E | CRT jarak-waktu · 2 · C |
| 92 | CRT pekerja 24 hari · 3 · A | CRT kios roti · 3 · D |
| 93–96 | CRT · 2,3,3,3 · C D B E | CRT · 3,3,3,3 · B A E C |
| 97–100 | KCK · 2,3,3,3 · C E B A | KCK · 2,3,3,3 · D B A E |

(Tingkat pkg 15 slot 88–96 diambil dari butir file yang cocok teksnya: DB 88 = file 89, 89 = 91, 90 = 92, 91 = 93, …, 96 = 98.)

### Keputusan teknis sesi 1
1. **Slot Alokasi pkg 15 = 88–92** (§2.4): 88 konversi (2·E), 89 konversi luas (3·B), 90 konversi waktu/pukul (3·D), 91 CRT (2·E), 92 CRT (3·A). Berdampingan, di 88–92, mengikuti prioritas konversi → CRT. Hasilnya layout v4 sama dengan pkg 19/20 (HIT 76–87, CRT 88–96, Alokasi 88–92). Tingkat 2,3,3,2,3 dan kunci E,B,D,E,A diwarisi.
2. **Sebab-Akibat 73–75:** pkg 19 → 73 E (tetap, sebab bersama), 74 D→**B** (urutan terbalik), 75 C→**A** ⇒ sebaran A26 B25 C25 D23 E24 (maks 26 = maks lama, lolos aturan §2.5a). pkg 15 → 73 A, 74 B, 75 D→**E** ⇒ **E 28 > maks lama 27: melanggar aturan §2.5a ("tidak melewati angka tertinggi yang ada")**, tetapi masih ≤ batas D-4 (24% × 123 = 29). Tidak ada susunan lain yang memenuhi "3 huruf berbeda dari {A, B, E}" karena slot 73/74 sudah A/B. **Diputuskan pemilik 2026-10-14: guard `--swap` memakai batas D-4 (floor 24% × huruf = 29), bukan maks lama.** pkg 15 75 = E (E28) sah.
3. **Render teks Alokasi:** `question_text` (field `q`) dirender `<p class="q-stem">` **tanpa** `whitespace-pre-line` di `EngineKecerdasan.tsx`/`LatihanKecerdasan.tsx`, jadi `\n` di `q` jadi satu paragraf. Premis §2.4a ("simpan di `q` seperti KCK, dirender `QuestionPassage`") keliru. Maka: konteks + daftar + kendala disimpan sebagai **wacana per butir** (`w` → `sub_text` → `QuestionPassage`, baris "• " jadi daftar), `q` = baris "Pertanyaan: …?", `i` = instruksi generik "Bacalah keterangan berikut, lalu jawablah pertanyaannya.". **Disetujui pemilik 2026-10-14**: tampilan sesuai harapan (preview HP 360 px: wacana + daftar bertitik + spasi tak-putus + "Pertanyaan:" tebal). Pola ini dipakai juga untuk 10 butir Alokasi pkg 15/20.
   - Akibat untuk sesi 2: `i` generik sama di 15 butir → di `checkNoLeak` perlakukan butir `sub: "ALOKASI"` seperti `GENERIK` (atau tambah `INSTRUKSI.ALOKASI` dan hapus `i`). Wacana alokasi digabung ke `wacana` file teks paket (kunci `p19alok88` dst.).
   - **Sebab-Akibat** "(1) …\n(2) …" di `q` juga akan menyatu satu baris → simpan dua pernyataan di `w` (wacana per butir) atau tambahkan `whitespace-pre-line` pada `q-stem`. Putuskan di sesi 2.
   - **Temuan sampingan:** KCK 97–100 yang live (pkg 15/17/18/19) memakai `\n` di `q`; di mesin ujian baris "Pertanyaan:" dan "Pernyataan (1)/(2)" kemungkinan tampil menyatu. Belum dicek di localhost. Pemilik 2026-10-14: dilanjutkan di sesi 2 (target g).
4. Butir Alokasi disimpan terpisah di `kecerdasan_alokasi.json` (bukan langsung ke `kecerdasan_p19_teks.json`) supaya `--check 19` (layout v3) tetap lolos sampai `LAYOUT_V4` + `--swap` dibuat di sesi 2. Field `bentuk` + `data` hanya untuk pemeriksa; buang saat digabung ke teks paket.

### Belum
- Audit Codex-1/2 (rencana: sesi 3; minimal jalankan pemeriksa saat job selesai).
- Semua target sesi 2–5 rencana.

### File disentuh (belum commit)
`prisma/data/bank_soal_p13.json` (baru) · `lib/kecermatan-symbols.test.ts` · `docs/pedoman/PEDOMAN_SIMULASI_KECERMATAN.md` · `scripts/cek-alokasi.ts` (baru) · `prisma/data/kecerdasan_alokasi.json` (baru) · `docs/rencana/simulasi-5-LOG.md` (ini). Dari Codex (belum diaudit): `prisma/data/kecerdasan_p20_num.json`, `bank/pribadi/sk-sim5-01.json`.

### Status Codex
Kedua job asli sesi 1 selesai (proses Codex kosong; ditulis setelah sesi 2 mulai). Hasil pemeriksa saat itu: `cek-num20.ts` → `SEMUA LOLOS · 24 butir · 16 dihitung ulang · kunci A7 B6 C6 D7 E6`; `cek-sk15.ts` → `SEMUA LOLOS · 63 butir · kunci A 31 / B 32 · 4 pasang kembar`; `check-bank-pribadi.ts` lolos (624 KP, 882 SK). Isi `kecerdasan_p20_num.json` mungkin tercampur tulisan job ulang sesi 2 (lihat entri sesi 2), jadi audit penuh sesi 3 tetap wajib. Laporan: `<SP1>/codex/out-1.md`, `out-2.md`.

### Prompt sesi 2

```
Kerjakan SESI 2 dari docs/rencana/simulasi-5.md (rev. 5). Baca rencana itu penuh dulu, lalu docs/rencana/simulasi-5-LOG.md (entri sesi 1: keputusan teknis 1–4 dan tabel slot DB), lalu docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md (A-7, §4 D-1..D-5, §5, §8, §10) dan PEDOMAN_SIMULASI_KECERDASAN.md v3. Semua keputusan pemilik di §0a dan keputusan teknis 2–3 di LOG (guard D-4, tampilan Alokasi via wacana) sudah final: jangan ditanyakan ulang.

BATAS KONTEKS: berhenti di sekitar 120k token, di titik aman (tidak ada file setengah jadi). Sebelum berhenti, wajib:
1. tambahkan entri "Sesi 2" di docs/rencana/simulasi-5-LOG.md: yang selesai, yang belum, temuan, keputusan teknis, path file yang disentuh;
2. tulis di akhir LOG "Prompt sesi 3" yang siap ditempel, dengan format yang sama seperti prompt ini.

Langkah awal: cek Codex-1/2 sesi 1 (laporan <SP1>/codex/out-1.md, out-2.md; <SP1> ada di LOG). Kalau file output belum ada/gagal, jalankan ulang brief yang sama. Jalankan pemeriksanya (npx tsx <SP1>/codex/cek-num20.ts; npx tsx <SP1>/codex/cek-sk15.ts; npx tsx scripts/check-bank-pribadi.ts) dan catat hasilnya; audit isi penuh tetap di sesi 3.

Target sesi 2 (§5 baris 2):
a. 10 butir Alokasi (pkg 15 slot 88–92 dengan tingkat/kunci warisan di LOG; pkg 20 slot 88–92, 1 butir "delegasi terbaik: dua opsi bantuan, hanya satu yang cukup") di prisma/data/kecerdasan_alokasi.json; variasi §2.4 tabel progresi; semua lolos npx tsx scripts/cek-alokasi.ts (perluas pemecah bila perlu untuk "dua orang paralel" dan "rekan 1,5× lebih lambat", tetap satu skrip).
b. 9 Sebab-Akibat (pkg 15/19/20 slot 73–75; kunci per LOG keputusan 2; pkg 20 tiga huruf beda dari {A,B,E}, ketiganya HOTS) sesuai §2.5; tetapkan cara render dua pernyataan (LOG keputusan 3).
c. LAYOUT_V4 + INSTRUKSI.SBA + mode --swap di kecerdasan-teks-lib.ts / seed-kecerdasan-kal.ts (§4.3–4.4), dry run --swap 15 dan --swap 19 lolos (tanpa --apply).
d. Kirim Codex-3 (read-only, cek buta tanpa kunci) untuk 15 Alokasi + 9 Sebab-Akibat → scratchpad/qa/codex-alokasi.md; bandingkan alasan (Q-5).
e. Cek review sesi lama (§6 risiko 1): telusuri cara halaman pembahasan dan skor memuat soal sesi lama setelah butir dinonaktifkan; catat kesimpulan.
f. Verbal pkg 20 (1–25) bila konteks masih cukup.
g. Temuan render KCK (LOG keputusan 3): pastikan apakah baris "Pertanyaan:"/"Pernyataan (1)/(2)" KCK 97–100 menyatu di mesin ujian (render salinan repo di scratchpad, resep memory local-ui-verification; jangan next dev kedua di repo). Kalau menyatu, usulkan perbaikan termurah (mis. whitespace-pre-line pada q-stem) ke pemilik sebelum mengubah kode.

Aturan keras: jangan menulis ke DB, jangan commit/push, jangan menyentuh output/pribadi-sim*-review.html. Audit setiap diff Codex secara penuh. Jalankan test/asersi setelah setiap perubahan kode. Pecah tugas ke Codex dan subagent jika memungkinkan.
```

## Sesi 2 · 2026-10-14

Scratchpad sesi ini: `<SP2>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/b67df71d-a07a-49e1-8956-e8fa892cbd7d/scratchpad`. Tidak ada tulis DB, tidak ada commit.

### Langkah awal (Codex sesi 1)
- **Codex-2:** `out-2.md` ada. `cek-sk15.ts` → `SEMUA LOLOS · 63 butir · kunci A 31 / B 32 · 4 pasang kembar`; `check-bank-pribadi.ts` → `624 KP dan 882 SK dari 19 file lolos`. Audit isi penuh: sesi 3.
- **Codex-1:** sesi 1 tidak meninggalkan `out-1.md` (log berhenti di `AssertionError: (79, 'D', 480, 652.0)`), jadi brief yang sama dijalankan ulang. **Temuan:** proses Codex-1 asli (pid 58137, mulai 15.49) ternyata **masih hidup**, sehingga dua job menulis `prisma/data/kecerdasan_p20_num.json` bersamaan (file muncul 16.27). Job ulang dihentikan (16.35); job asli dibiarkan selesai → laporannya di `<SP1>/codex/out-1.md`. **Sesi 3: jalankan `npx tsx <SP1>/codex/cek-num20.ts`, lalu audit penuh; kalau pemeriksa gagal atau isinya janggal, hapus file dan jalankan ulang brief sekali saja (pastikan `pgrep -fl "codex exec"` kosong dulu).**

### Selesai
- **(a) 15 butir Alokasi** di `prisma/data/kecerdasan_alokasi.json` (15, 19, 20) → `npx tsx scripts/cek-alokasi.ts` = `SEMUA LOLOS · 15 butir`. Pemecah diperluas (tetap satu skrip): `tanya` baru `terpendek`, `maks` (opsi "N tugas utuh"), `paralel` (brute force semua pembagian tugas), field `rekan_faktor` (kendala wajib menyebut "1,5 kali").

| Slot | pkg 15 (bentuk · tingkat · kunci) | pkg 20 (semua tingkat 3) |
|---|---|---|
| 88 | tugas terpendek yang cukup, sekretaris RT · 2 · E | contoh dengan 2 jeda, guru wali kelas · C |
| 89 | jeda di tengah (antar les), ibu rumah tangga · 3 · B | dua orang paralel, relawan posko banjir · B (A = total ÷ 2) |
| 90 | paling banyak berapa tugas, bank sampah RW · 3 · D | rekan 1,5× lebih lambat, `rekan_mulai` · E |
| 91 | **delegasi terbaik**, panitia lomba kampung · 2 · E | **delegasi terbaik, dua opsi bantuan, hanya satu cukup**, acara keluarga · A |
| 92 | bentuk contoh + tugas wajib sendiri, staf keuangan kantor desa · 3 · A | sepasang tugas + jeda, `rekan_mulai`, pemilik warung · D |
  pkg 20 ditulis subagent (generator `<SP2>/gen20.py`), diaudit dan digabung Claude. pkg 15 #92 semula berlatar wali kelas, diganti kantor desa karena kembar dengan pkg 20 #88. Opsi pkg 15 #90 semula "2 tugas … 6 tugas" = sama persis dengan drill K07-AK-010 (tertangkap `checkNoLeak`), diganti "N tugas utuh".
- **(b) 9 Sebab-Akibat** di `prisma/data/kecerdasan_sba.json` (format sama dengan file alokasi). Kunci: pkg 15 73 A · 74 B · 75 E (tingkat 2,3,3); pkg 19 73 E · 74 B · 75 A (3,3,3); pkg 20 73 B · 74 E · 75 A (3,3,3). Topik: pipa bocor, hama cabai, listrik sekolah · banjir dusun, guru cuti, AC kantor · lapangan tergenang, makan siang asrama, diskon koperasi.
- **(c)** `kecerdasan-teks-lib.ts`: `LAYOUT_V4`, `INSTRUKSI.SBA`, `SBA_OPSI`, `checkSBA`, `checkLayout(…, layout)`, `checkNoLeak` melewati instruksi generik ALOKASI/SBA + opsi baku SBA; `sub/bentuk/data` tidak ikut ke baris DB. `seed-kecerdasan-kal.ts`: pkg 20 terdaftar v4 (10/90; SKIP sampai `kecerdasan_p20_teks.json` ada), mode `--swap 15|19` (ekspektasi slot lama dari tabel sesi 1 + awal teks, guard tingkat, kunci non-SBA, D-4 floor 24%; jalur `--apply` = sisip nonaktif → nonaktifkan lama → aktifkan baru → cek ulang; **belum pernah dijalankan**). Ditulis subagent, diff diaudit Claude. Hasil: `--swap 15` dry run OK (E 27→28, batas 29), `--swap 19` dry run OK (A26 B25 C25 D23 E24), `--check` semua paket lama tetap OK, `tsc` bersih. DB cocok dengan tabel sesi 1 di 16 slot.
- `backfill-pembahasan-kecerdasan.ts` ikut membaca `kecerdasan_alokasi.json` + `kecerdasan_sba.json` (tanpa ini butir hasil swap tayang tanpa pembahasan). Catatan: `kecerdasan_p19_teks.json` juga belum ada di `TEKS_FILES` (pkg 19 pembahasan DB 0/100) → tambahkan di sesi 3 bersama p20.
- **(d) Codex-3 cek buta** (`<SP2>/qa/codex-alokasi.md`, input tanpa kunci `<SP2>/qa/in/blind.md`): **24/24 huruf sama dengan kunci.** Q-5/Q-6: 3 catatan → diperbaiki lalu dicek ulang Codex baru (`<SP2>/qa/codex-alokasi-ulang.md`): pkg 20 #91 (kendala belum menyebut pekerjaan terpotong dilanjutkan → ditambah) lolos; pkg 20 #74 SBA (D dapat dibela, "makan siang yang sama" tidak eksplisit → kedua pernyataan menyebut menyantap makan siang dari dapur asrama) lolos tanpa ambigu; **pkg 19 #73 SBA masih ambigu** (versi 1: D dibela; versi 2 menyebut "arus deras berwarna cokelat" → B dibela). **Wajib ditulis ulang di sesi 3** (topik baru dengan dua akibat yang tidak saling menimbulkan, sebab bersama tersirat lewat tempat dan waktu), lalu cek buta ulang.
- **(e) Review sesi lama setelah swap (§6 risiko 1)** — ditelusuri subagent:
  - Skor tersimpan saat submit (`lib/scoring/runner.ts` → `finalize_test_session`); halaman hasil hanya membaca. Recalculate admin memakai id yang dijawab tanpa filter `is_active` → **aman**.
  - **Pembahasan sesi lama RUSAK sebagian:** `lib/review.ts:25-57` memuat per paket lalu menyimpan baris `is_active || dijawab`. Setelah swap, nomor yang dijawab tampil **dua kali** (butir lama + butir baru "tidak dijawab"); nomor yang dilewati menampilkan butir baru. Perbaikan termurah: setelah baris 44, dedupe per `sequence_number` (utamakan baris yang dijawab, kalau tidak ada pakai baris yang dibuat sebelum `started_at` sesi, baru yang aktif). **Harus diperbaiki sebelum `--swap --apply`** (aturan §6).
  - **Sesi yang sedang berjalan:** `app/test/[sessionId]/kecerdasan/page.tsx:42-48` memuat ulang soal `is_active = true` → sesi yang dilanjutkan setelah swap tercampur. Syarat: jalankan swap saat tidak ada `module_sessions` IN_PROGRESS untuk pkg 15/19 (atau halaman itu ikut memuat baris nonaktif yang sudah dijawab).
- **(g) Render KCK** — dicek subagent di salinan repo (`<SP2>/kck-360.png`, 360 px): **menyatu.** "Pertanyaan:" dan "Pernyataan (1)/(2)" tampil satu paragraf (`white-space: normal`) di `EngineKecerdasan.tsx:191`, `LatihanKecerdasan.tsx:227`, dan halaman pembahasan `app/components/pembahasan/cards.tsx:114`. **Disetujui pemilik 2026-10-14 dan diterapkan:** `whitespace-pre-line` di tiga baris itu; render 360 px di salinan repo lolos untuk KCK dan SIL di mesin ujian, latihan, dan kartu pembahasan (`<SP2>/zzpre-360.png`), `tsc` bersih. Efek samping: SIL (P1/P2), DER "Baris 1/2", KUA "x = …\ny = …" ikut terpecah per baris — saat ini juga menyatu, jadi ini perbaikan, bukan regresi. Alternatif `.q-stem { white-space: pre-line }` di `app/exam.css:72` ikut mengenai Drill/Keswa/Isian (belum dicek).

### Keputusan teknis sesi 2
1. **Render Sebab-Akibat:** dua pernyataan disimpan sebagai **wacana per butir** (`w` → `sub_text` → `QuestionPassage`, satu baris per pernyataan), `i` = `INSTRUKSI.SBA`, `q` = "Pertanyaan: Bagaimana hubungan antara pernyataan (1) dan pernyataan (2)?". Tidak bergantung pada perbaikan q-stem.
2. **Kunci Alokasi pkg 20:** 88 C, 89 B, 90 E, 91 A, 92 D (dipilih supaya tidak menumpuk; cek ulang sebaran pkg 20 saat teks digabung).
3. Butir Alokasi + SBA tetap di file terpisah (`kecerdasan_alokasi.json`, `kecerdasan_sba.json`); `--swap` dan backfill membacanya langsung. Untuk pkg 20, gabungkan ke `kecerdasan_p20_teks.json` di sesi 3 (buang `sub`? **jangan** — `checkLayout` v4 memakai `sub: "ALOKASI"`; `bentuk`/`data` boleh tetap, tidak masuk DB).

### Belum
- **(f) Verbal pkg 20 (1–25):** ditulis subagent di `prisma/data/kecerdasan_p20_verbal.json` (wacana p20a, p20b; 25 butir; 15 butir 2 kunci → 40 huruf, A–E masing-masing 8; tingkat 2 di 1, 6, 11, 16, 20; sisanya 3). Pemeriksa subagent (`<SP2>/check-p20v.ts`: checkTeks, checkNoLeak, checkA7, checkRows) lolos. Catatan subagent: "kemarin" (#17) pernah jadi pengecoh di soal.json #15. **Belum diaudit Claude dan belum cek buta** → sesi 3: audit penuh (makna KBBI, D-1, pengecoh bernama) + cek buta Codex tanpa kunci.
- Tulis ulang SBA pkg 19 #73 + cek buta ulang.
- Perbaikan `lib/review.ts` (dedupe) sebelum swap.
- Audit Codex-1 (`kecerdasan_p20_num.json`, lihat temuan dua job) dan Codex-2.
- Reviewer pembahasan terpisah (Q-7) untuk 15 Alokasi belum dijalankan.

### File disentuh sesi 2 (belum commit)
`scripts/cek-alokasi.ts` · `prisma/data/kecerdasan_alokasi.json` · `prisma/data/kecerdasan_sba.json` (baru) · `scripts/kecerdasan-teks-lib.ts` · `scripts/seed-kecerdasan-kal.ts` · `scripts/backfill-pembahasan-kecerdasan.ts` · `app/components/engines/EngineKecerdasan.tsx` · `app/latihan/[module]/LatihanKecerdasan.tsx` · `app/components/pembahasan/cards.tsx` · `docs/rencana/simulasi-5-LOG.md`. Dari Codex-1 (belum diaudit): `prisma/data/kecerdasan_p20_num.json`. Dari subagent (belum diaudit): `prisma/data/kecerdasan_p20_verbal.json`.

### Prompt sesi 3

```
Kerjakan SESI 3 dari docs/rencana/simulasi-5.md (rev. 5). Baca rencana itu penuh dulu, lalu docs/rencana/simulasi-5-LOG.md (entri sesi 1 dan sesi 2: keputusan teknis, temuan, "Belum"), lalu docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md (A-7, §4 D-1..D-5, §5, §8, §10), PEDOMAN_SIMULASI_KECERDASAN.md v3, dan PEDOMAN_ENGINE_PRIBADI.md (§1.1a, §3, §4.1–4.2, §6, §7.4). Keputusan pemilik di §0a dan keputusan teknis sesi 1–2 di LOG sudah final: jangan ditanyakan ulang.

BATAS KONTEKS: berhenti di sekitar 120k token, di titik aman (tidak ada file setengah jadi). Sebelum berhenti, wajib:
1. tambahkan entri "Sesi 3" di docs/rencana/simulasi-5-LOG.md: yang selesai, yang belum, temuan, keputusan teknis, path file yang disentuh;
2. tulis di akhir LOG "Prompt sesi 4" yang siap ditempel, dengan format yang sama seperti prompt ini.

Langkah awal:
- Pastikan tidak ada job Codex lama yang masih hidup (pgrep -fl "codex exec"). Cek Codex-1: <SP1>/codex/out-1.md, lalu npx tsx <SP1>/codex/cek-num20.ts. Ingat temuan sesi 2 (dua job menulis kecerdasan_p20_num.json bersamaan): kalau pemeriksa gagal atau isinya janggal, hapus file dan jalankan ulang brief sekali.
- Verbal pkg 20 sudah ada (prisma/data/kecerdasan_p20_verbal.json, ditulis subagent sesi 2): audit penuh + cek buta Codex tanpa kunci.
- Jalankan ulang: npx tsx scripts/cek-alokasi.ts; npx tsx scripts/seed-kecerdasan-kal.ts --swap 15 dan --swap 19 (dry run saja); npx tsc --noEmit -p .

Target sesi 3 (§5 baris 3 + sisa sesi 2):
a. Tulis ulang Sebab-Akibat pkg 19 #73 (kunci E, tingkat 3) di prisma/data/kecerdasan_sba.json; cek buta ulang dengan Codex baru (read-only, tanpa kunci, pola <SP2>/qa/mk-blind.py + brief-codex3.md) sampai tidak ambigu. Jalankan reviewer pembahasan terpisah (Q-7) untuk 15 Alokasi.
b. Perbaiki lib/review.ts (dedupe per sequence_number setelah baris 44, LOG sesi 2 (e)) + test kecil; catat syarat "tidak ada sesi IN_PROGRESS pkg 15/19" di §5a langkah 1.
c. Audit Codex-1 (24 numerik pkg 20) dan Codex-2 (63 SK) secara penuh: hitung ulang, pengecoh bernama, grep A-7.
d. Silogisme 43–50 + wacana A/B 65–72 + KCK 97–100 pkg 20; gabung teks pkg 20 ke prisma/data/kecerdasan_p20_teks.json (verbal + numerik tanpa field `lengkap` + SBA + Alokasi tetap ber-`sub`); tambahkan p19 + p20 ke TEKS_FILES backfill; --check 20 untuk bagian teks.
e. Drill K18 Sebab-Akibat 30 + K07 strategi delegasi 10 (§2.6) + cek buta Codex-3 tanpa kunci; npm run build:drill lolos.
f. KP 48 pkg 15 (bank/pribadi/kp-sim5-01.json) + manifest paket-15.json; seed-pribadi-paket.ts 15 dry run.

Aturan keras: jangan menulis ke DB, jangan commit/push, jangan menyentuh output/pribadi-sim*-review.html. Audit setiap diff Codex/subagent secara penuh. Jalankan test/asersi setelah setiap perubahan kode. Pecah tugas ke Codex dan subagent jika memungkinkan.
```

## Sesi 3 · 2026-10-14

Scratchpad sesi ini: `<SP3>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/9306cf77-8b3a-4fa2-b1d1-6c68bcef837b/scratchpad`. Tidak ada tulis DB, tidak ada commit. Pekerjaan dibagi ke 8 subagent (brief bersama `<SP3>/BRIEF-SESI3.md`, kerja per tugas di `<SP3>/<tugas>/`); laporan dibaca Claude, butir disampel dan semua pemeriksa dijalankan ulang oleh Claude. Di tengah sesi 5 subagent terhenti karena batas pakai API dan dilanjutkan dari transkripnya.

### Langkah awal
- Tidak ada proses `codex exec`. `<SP1>/codex/out-1.md` ada; `cek-num20.ts` → `SEMUA LOLOS · 24 butir · 16 dihitung ulang · kunci {"A":7,"C":6,"B":6,"D":7,"E":6}`. File tidak dihapus; sisa tulisan dua job hanya di #59 (lihat c).
- `cek-alokasi.ts` lolos, dry run `--swap 15/19` OK, `tsc` bersih.

### Selesai
- **(a) SBA pkg 19 #73 ditulis ulang** (subagent `sba19`): topik baru = gempa yang tersirat (lampu gantung berayun di rumah tertutup + air kolam meluap tanpa angin, desa dan pukul sama), kunci E, tingkat 3. Cek buta Codex 2 putaran (`<SP3>/sba19/codex-out-1.md`, `-2.md`): E, tidak ambigu. `--swap 19` sebaran tetap A26 B25 C25 D23 E24.
- **(a) Q-7 reviewer pembahasan 15 Alokasi** (subagent `q7alok`, backup `<SP3>/q7alok/backup.json`): 9 butir diperbaiki teksnya (pengecoh tanpa nama kesalahan: 15/88, 15/92, 19/88, 19/90, 19/92; kalimat janggal 15/89 (+ "adik" → "anak bungsunya"), 20/89). Kunci, opsi, data, tingkat tidak berubah; semua angka dihitung ulang benar.
- **(b) `lib/review.ts`**: `fetchKecerdasanReview` memilih satu baris per nomor lewat `lib/review-pick.ts` (`pickReviewRows`: baris yang dijawab → baris terbaru yang sudah ada saat `started_at` sesi → baris aktif). Test `npx tsx lib/review-pick.test.ts` (sesi lama sebelum swap, sesi baru, `started_at` null, baris nonaktif tanpa kembaran). Review Kepribadian tidak diubah (tidak ada swap). Syarat IN_PROGRESS + deploy perbaikan ini dicatat di rencana §5a langkah 1.
- **(c) Audit Codex-1 (24 numerik pkg 20)** (subagent `auditnum`, backup `<SP3>/auditnum/backup.json`): semua kunci dihitung ulang benar, pengecoh cocok dengan kesalahan bernama. Temuan: **#59 butir campuran** dua job (opsi B 63/D 93, pembahasan menyebut 61/97) → pembahasan disesuaikan dengan opsi (dicek Claude). A-7 kata "Operasinya/satuan" diganti; #93 bersepeda 54 km → sepeda motor. Kunci tetap A7 B6 C6 D7 E6.
- **(c) Audit Codex-2 (63 SK)** (subagent `auditsk`, asli `<SP3>/auditsk/sk-sim5-01.orig.json`): 14 butir diperbaiki (8 pengecoh jerami diganti pilihan yang wajar secara sosial, 8 situasi dipertegas), 8 butir kembar diberi catatan "Butir kembar: …" seperti sk-sim4. Id dan kunci tidak berubah (A31/B32, 4 pasang kembar). Cek buta Codex 3 putaran: 63/63 sama. D6-601 masih ditandai ambigu ("mendampingi dulu = kehati-hatian"); dibiarkan: situasi menyebut sudah dinilai siap dan kunci sesuai sub "berani".
- **Verbal pkg 20** (subagent `verbal20`, asli `<SP3>/verbal20/p20v.orig.json`): 11 butir diperbaiki (D-1 pasangan antonim ganda di #6/7/8/10, #14 bocor opsi p5#14, #17 set "kemarin" kembar dengan soal.json #15 → Tamak/Loba/Serakah/**Kikir**/Rakus, #18 KBBI sampan, #19 Penyair → Penulis, A-7 "piket" #2, klaim di luar teks #23/24). Cek buta Codex 25/25 sama. Versi akhir #17 (Rakus kembali) belum dicek ulang Codex → ikut cek buta teks pkg 20 sesi 4. **Claude: #13 dan #18 diturunkan ke tingkat 2** (sebelumnya sedang hanya 8 dari 10 yang diminta: verbal 5 + deret 3).
- **(d) Silogisme 43–50 + wacana A `p20wKEBUN` (65–68) + wacana B `p20wSERVIS` (69–72) + KCK 97–100** (subagent `logika20`, file sumber `prisma/data/kecerdasan_p20_logika.json`, pemeriksa `<SP3>/logika20/check.ts`): semua tingkat 3; brute force wacana tunggal (setiap syarat perlu); KCK lolos klaim/bukti; cek buta Codex 20/20, 0 ambigu. Kunci 43C 44A 45E 46B 47D 48C 49B 50E · 65D 66A 67C 68B 69C 70E 71A 72D · 97B 98D 99E 100C.
- **(d) Gabung teks pkg 20**: `prisma/data/kecerdasan_p20_teks.json` (indent 1 seperti p19) = verbal + logika (1–96) + numerik tanpa `lengkap` + SBA pkg 20 + Alokasi pkg 20 (ber-`sub`) = **73 butir**; KCK 97–100 pkg 20 ditaruh di `kecerdasan_kck_kal.json["20"]` (pola V3, sama dengan pkg 19). Kunci 77 butir teks A20 B20 C20 D20 E20 (sisa 23 butir gambar; batas D-4 ±29 per huruf). `check-kecerdasan-kck.ts`: MODEL `"20"` + kunci `BDEC` + tingkat [3,3,3,3] → `OK: 28 butir KCK baru lolos`. Pemeriksa teks `<SP3>/cek-teks20.ts` (checkNoLeak, checkTeks + checkSBA, checkA7, tipe per slot v4, `sub: ALOKASI` 88–92, checkRows) → `OK teks pkg 20: 77 butir · sedang 10 · HOTS 67`. `--check 20` sekarang hanya gagal di asersi tingkat (`[10, 67]` vs `[10, 90]`) karena 23 butir gambar belum ada.
- `backfill-pembahasan-kecerdasan.ts`: `kecerdasan_p19_teks.json` + `kecerdasan_p20_teks.json` masuk `TEKS_FILES`.
- **(e) Drill** (subagent `drill18`, generator `<SP3>/drill18/gen_k18.py`, `gen_k07s.py`): `K18-sebab-akibat.json` 30 butir (`K18-N-001..030`, LANGSUNG A 4/3/3 · TERBALIK B 3/4/3 · BERSAMA E 3/3/4) + K07 10 butir `NUM-CRT-ALOKASI-STRATEGI` (`K07-N-001..010`, tier 3/4/3, kunci ACEBDAEBCD; butir K07 lama byte-identik). `cek-alokasi.ts` diperluas (`cekDrillStrategi`, 222 baris) → `SEMUA LOLOS · 15 butir simulasi + 10 butir drill`. `lib/drill-cards.ts` K18 + 4 kategori; taksonomi `drilling/02` +4 kode; `bank/drill/LOG.md` Batch 21. Cek buta Codex 3 putaran: 40/40 sama, ambiguitas (6 butir E, K18-N-020, K07-N-001) diperbaiki lalu lolos → status `ganda`. `npm run build:drill` → `OK 860 item` (0 butir lama berubah).
- **(f) KP 48 pkg 15** (subagent `kp15`, generator `<SP3>/kp15/gen.py`): `bank/pribadi/kp-sim5-01.json` (`KP-{PRO,PK,PD,KD,SE,MB}-601..608`, per aspek 4 fav D + 4 unfav A, T1/T2/T3 = 2/4/2, Jaccard maks 0,41) + manifest `bank/pribadi/paket-15.json` (pola paket-14). Cek buta Codex 3 putaran: 48/48 aspek + kunci sama; 7 butir beririsan diperbaiki. `check-bank-pribadi.ts` → `672 butir KP dan 882 butir SK dari 20 file lolos`; `seed-pribadi-paket.ts 15` (dry run, keluar sebelum klien Supabase) → `Paket 15: komposisi lolos (48 Kepribadian + 63 Integritas & Kejujuran)` (dijalankan ulang setelah audit SK).

### Temuan
1. **`checkNoLeak` vs Alokasi:** begitu `kecerdasan_p20_teks.json` ada, `--swap 19` gagal (`soal 88: stem sama dengan soal lain`) karena "Pertanyaan: Tugas manakah yang sebaiknya didelegasikan …?" adalah kalimat baku §2.4a. Diperbaiki di `kecerdasan-teks-lib.ts`: `q` butir `sub: "ALOKASI"` diperlakukan seperti SBA (`qBaku`); anti-bocor Alokasi tetap lewat wacana di `cek-alokasi.ts`.
2. **D-3 Alokasi (Q-7):** tebakan "pilih tugas terpanjang yang tidak dilarang kalimat *hanya boleh*" kena kunci di 8 dari 15 butir (15/89, 15/91, 15/92, 19/88, 19/89, 19/91, 20/88, 20/91). Kunci = tugas terpanjang harfiah hanya 2 butir di pkg 15 (tepat di batas). Opsi "Semua tugas … tanpa bantuan" tidak pernah jadi kunci (6 butir). 20/91: kunci A = opsi terpanjang (47 vs 45 karakter). **Belum diubah** (mengubahnya = ubah data/opsi + cek buta ulang); perlu keputusan.
3. **K18 sebaran kunci A10 B10 E10 (33%)** melewati D-4 24%: akibat desain §2.6 (C/D hanya pengecoh, keputusan K-8). Butir E tier 3 kini menyebut sebab bersama di kedua pernyataan supaya lolos D-1 → lebih mudah dari maksud "sebab tidak disebut".
4. K07 strategi memakai `nilai_opsi` berupa objek tanpa `hitung` (dibuang build) dan format "Jawaban: <isi> (X)." (beda dari K07-AK lama). Belum dicatat di BANK_SCHEMA.md.
5. File sumber pkg 20 (`kecerdasan_p20_verbal.json`, `_num.json`, `_logika.json`) sekarang duplikat isi `kecerdasan_p20_teks.json`. Perbaikan berikutnya langsung di `_teks.json`; file sumber dihapus sebelum commit (jangan diedit terpisah).
6. KCK pkg 20 #99 memakai pola "persamaan kembar" lagi (seperti p19 #100, disamarkan sebagai rasio).
7. Q-7 reviewer pembahasan terpisah untuk wacana A/B pkg 20 belum dijalankan.

### Keputusan teknis sesi 3
1. KCK pkg 20 di `kecerdasan_kck_kal.json["20"]`, bukan di `_teks.json` (pola V3, seed menggabungkannya).
2. Tingkat sedang pkg 20 = verbal 1, 6, 11, **13**, 16, **18**, 20 + DER 57, 58, 61 (10 butir).
3. `pickReviewRows` di file terpisah (`lib/review-pick.ts`) supaya bisa dites tanpa klien Supabase.

### Keputusan pemilik akhir sesi 3 (2026-10-14)
Pemilik: "lewati keputusan saya, setuju bila menurut Claude sudah sesuai pedoman". Penilaian Claude, kini final:
1. **D-3 Alokasi (temuan 2): dibiarkan.** Aturan D-3 yang tertulis (kunci = tugas terpanjang maks 2 per paket) terpenuhi; pola "terpanjang yang tidak dilarang" baru bisa dipakai setelah membaca dan menerapkan kendala soal, jadi bukan tebakan dari bentuk opsi. 20/91 (selisih panjang opsi 2 karakter) juga dibiarkan.
2. **K18 A/B/E 33% (temuan 3): pengecualian D-4 diterima**, akibat langsung desain K-8 (C/D hanya pengecoh). Berlaku hanya untuk kartu Sebab-Akibat; dicatat di `bank/drill/LOG.md` Batch 21 saat rilis.
3. **SK D6-601 dan KP PK-602: dibiarkan.** Kunci cocok dengan dimensi/aspek, Codex sama kunci; irisan yang ditandai adalah ciri butir, bukan cacat kunci.
4. Butir E tier 3 K18 yang kini menyebut sebab bersama: diterima (D-1 lebih penting daripada tingkat).

### Belum
- Sesi 4 rencana: prototipe 1 butir per jenis gambar pkg 20 (G-5, persetujuan pemilik) lalu 23 butir gambar + `pembahasan_svg`; `--check 20` penuh.
- Cek buta Codex-3 untuk **seluruh** teks pkg 20 gabungan (termasuk verbal #17 versi akhir dan 24 numerik yang belum pernah dicek buta).
- ~~Keputusan pemilik: temuan 2, 3, D6-601, PK-602~~ → **diputuskan pemilik 2026-10-14: ikut penilaian Claude** (lihat "Keputusan pemilik akhir sesi 3").
- `rilis` 40 butir drill = 2026-10-14 → ganti tanggal push.

### File disentuh sesi 3 (belum commit)
Claude: `lib/review.ts` · `lib/review-pick.ts` (baru) · `lib/review-pick.test.ts` (baru) · `scripts/backfill-pembahasan-kecerdasan.ts` · `scripts/kecerdasan-teks-lib.ts` · `scripts/check-kecerdasan-kck.ts` · `prisma/data/kecerdasan_kck_kal.json` · `prisma/data/kecerdasan_p20_teks.json` (baru) · `prisma/data/kecerdasan_p20_verbal.json` (tingkat #13, #18) · `docs/rencana/simulasi-5.md` (§5a langkah 1) · `docs/rencana/simulasi-5-LOG.md`. Subagent: `prisma/data/kecerdasan_sba.json` · `prisma/data/kecerdasan_alokasi.json` · `prisma/data/kecerdasan_p20_num.json` · `prisma/data/kecerdasan_p20_verbal.json` · `prisma/data/kecerdasan_p20_logika.json` (baru) · `bank/pribadi/sk-sim5-01.json` · `bank/pribadi/kp-sim5-01.json` (baru) · `bank/pribadi/paket-15.json` (baru) · `bank/drill/kecerdasan/K18-sebab-akibat.json` (baru) · `bank/drill/kecerdasan/K07-soal-cerita.json` · `scripts/cek-alokasi.ts` · `lib/drill-cards.ts` · `docs/rencana/drilling/02-kecerdasan-drill-taxonomy.md` · `bank/drill/LOG.md` · `data/drill-bank.json`.

### Status pemeriksa akhir sesi 3
`--check` 4/5/15/16/19 exit 0 · `--swap 15` / `--swap 19` dry run OK · `<SP3>/cek-teks20.ts` OK · `check-kecerdasan-kck.ts` OK 28 · `cek-alokasi.ts` 15 + 10 · `build:drill` 860 · `check-bank-pribadi.ts` · `seed-pribadi-paket.ts 15` · `review-pick.test.ts` · `kecermatan-symbols.test.ts` · `tsc` bersih.

### Prompt sesi 4

```
Kerjakan SESI 4 dari docs/rencana/simulasi-5.md (rev. 5). Baca rencana itu penuh dulu, lalu docs/rencana/simulasi-5-LOG.md (entri sesi 1–3: keputusan teknis, temuan, "Belum"), lalu docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md (A-7, §4 D-1..D-5, §6 G-1..G-10, §8, §10), PEDOMAN_SIMULASI_KECERDASAN.md v3, dan RULES GENERATE SOAL SPASIAL.md. Keputusan pemilik di §0a, keputusan teknis sesi 1–3, dan "Keputusan pemilik akhir sesi 3" di LOG sudah final: jangan ditanyakan ulang. Pemilik menyerahkan keputusan teknis yang sesuai pedoman ke Claude; yang tetap wajib ke pemilik hanya persetujuan prototipe gambar (G-5), tulis DB, dan commit/push.

BATAS KONTEKS: berhenti di sekitar 120k token, di titik aman (tidak ada file setengah jadi). Sebelum berhenti, wajib:
1. tambahkan entri "Sesi 4" di docs/rencana/simulasi-5-LOG.md: yang selesai, yang belum, temuan, keputusan teknis, path file yang disentuh;
2. tulis di akhir LOG "Prompt sesi 5" yang siap ditempel, dengan format yang sama seperti prompt ini.

Langkah awal:
- Pastikan tidak ada job Codex lama yang masih hidup (pgrep -fl "codex exec").
- Jalankan ulang: npx tsx <SP3>/cek-teks20.ts; npx tsx scripts/check-kecerdasan-kck.ts; npx tsx scripts/cek-alokasi.ts; npx tsx scripts/seed-kecerdasan-kal.ts --swap 15 dan --swap 19 (dry run saja); npm run build:drill; npx tsc --noEmit -p .

Target sesi 4 (§5 baris 4):
a. Prototipe 1 butir per jenis gambar pkg 20 yang lebih sulit dari pkg 19 (mosaik 2 gaya baru G-10, matriks, rotasi putar+cermin, susun 2×3, analogi gambar, ikon, denah peta A/B, bundar angka/huruf) → render 360/520 px → serahkan ke pemilik, TUNGGU persetujuan (G-5) sebelum produksi massal.
b. Setelah disetujui: 23 butir gambar pkg 20 (26–42, 51–56) + pembahasan_svg, generator per paket di file baru, asersi urutan pkg 20 di generate-kecerdasan-figural-kal.ts, paket lain byte-identik; --check 20 penuh lolos (10 sedang + 90 HOTS, kunci ≤ 24%).
c. Cek buta Codex-3 tanpa kunci untuk seluruh teks pkg 20 (prisma/data/kecerdasan_p20_teks.json + kecerdasan_kck_kal.json["20"]), termasuk verbal #17 versi akhir dan 24 numerik; bandingkan alasan (Q-5). Reviewer pembahasan terpisah (Q-7) untuk wacana A/B pkg 20.
d. Hapus file sumber kecerdasan_p20_verbal.json / _num.json / _logika.json bila sudah tidak dipakai (isinya sudah di _teks.json; perbaikan langsung di _teks.json).

Aturan keras: jangan menulis ke DB, jangan commit/push, jangan menyentuh output/pribadi-sim*-review.html. Audit setiap diff Codex/subagent secara penuh. Jalankan test/asersi setelah setiap perubahan kode. Pecah tugas ke Codex dan subagent jika memungkinkan.
```

## Sesi 4 · 2026-10-14

Scratchpad sesi ini: `<SP4>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/7ba8a80a-ce4c-4541-9e9c-09c0a3d52d91/scratchpad`. Tidak ada tulis DB, tidak ada commit. **Pemilik: Codex CLI sudah kena limit, jangan dipakai lagi; semua kerja oleh Claude + subagent Claude** (cek buta teks pakai subagent terpisah tanpa kunci, Q-4 opsi 2). Brief bersama prototipe: `<SP4>/BRIEF-SESI4.md`.

### Langkah awal
Tidak ada `codex exec` hidup. `cek-teks20.ts` OK (77 butir, sedang 10, HOTS 67) · `check-kecerdasan-kck.ts` OK 28 · `cek-alokasi.ts` 15 + 10 · `--swap 15` dan `--swap 19` dry run OK · `build:drill` 860 · `tsc` bersih.

### Selesai
- **(a) 6 prototipe gambar pkg 20 selesai, MENUNGGU persetujuan pemilik (G-5).** Satu subagent per jenis; kode di file baru (tidak terhubung ke `generate-kecerdasan-figural-kal.ts`/seed/DB). Semua lolos asersi, `tsc` bersih, PNG 360/520 + gambar pembahasan sudah dibaca Claude (360 px terbaca, tidak ada teks terpotong). `git status`: `prisma/data/kecerdasan_figural_kal.json`, `_susun_kal.json`, `_denah_kal.json` tidak berubah setelah generator lama dijalankan ulang (byte-identik). Tabel prototipe di bawah.
- **(c) Cek buta teks pkg 20 (77 butir termasuk 24 numerik, verbal #17 versi akhir "Kikir", KCK 97–100): 77/77 sama dengan kunci** (3 subagent Claude tanpa kunci; input `<SP4>/qa/blind-1..3.md`, hasil `<SP4>/qa/hasil-1..3.md`, pembanding `<SP4>/qa/cmp.py`). Catatan pemeriksa: ANA #14 "Apoteker : Resep" ambigu ringan (pembahasan sudah menolaknya), 91 opsi C "bekerja saat istirahat" kuat sebagai pengecoh (bukan delegasi, sudah dibahas di sesi 3) → tidak diubah. Input verbal SIN/ANT/ANA tidak membawa instruksi tipe (pemeriksa menebak 2 jawaban); verbal 1–25 sudah dicek buta penuh di sesi 3, jadi dicatat saja.
- **(c) Q-7 reviewer wacana A/B pkg 20 (65–72):** brute force 720 permutasi, kedelapan kunci benar. Lima pembahasan diperbaiki (hanya field `p` di `kecerdasan_p20_teks.json`: 67 Tips salah logika, 69 alasan opsi D salah, 70 opsi C tanpa kesalahan bernama, 71 kalimat janggal + alasan opsi A, 72 opsi C/E tanpa kesalahan bernama). Diff diaudit Claude: hanya `p` pada 67, 69–72; wacana, kunci, opsi identik. Backup `<SP4>/q7wac/SP4/backup.json`. Temuan tidak diubah (tebakan lemah, bukan pembocor): 66 kunci A beririsan paling banyak dengan opsi lain, 67 kunci C satu-satunya pernyataan umum, 70 kunci E klaim terlemah.
- **(d)** `kecerdasan_p20_verbal.json` / `_num.json` / `_logika.json` **dipindah ke `<SP4>/src-p20/`** (tidak ada kode yang mengimpornya; hanya dokumen menyebut namanya). `cek-teks20.ts` dan `--check 19` tetap OK. Perbaikan teks pkg 20 langsung di `kecerdasan_p20_teks.json`.

### Prototipe gambar pkg 20 (PNG di `<SP4>/<tugas>/`)

| Jenis (slot) | File kode | Butir prototipe | Lapisan (dibanding pkg 19) | PNG |
|---|---|---|---|---|
| Mosaik 26, 27 (2 gaya baru G-10) | `scripts/figural-mosaik-20.ts` (+ `figural-mosaik.ts`: topeng `tab`/`perisai`, ubin `tangga`/`panah`, `finishMosaik`) | 26 kunci D: ubin "tab", bingkai tipis, panah antargambar; 27 kunci B: ubin "perisai", papan abu | 26: lipat bergantian (baris↔kolom) + ubin berputar 90° saat pindah + warna XOR dua tepi. 27: tukar tetangga ganjil/genap (baris tengah berlawanan) + putar 90° kanan / 180° kiri + ubin diam ganti warna. Bukti: enumerasi 24 / 96 hipotesis aturan | `mosaik/proto-mosaik-26|27-{360,520,pembahasan-520}.png` |
| Matriks 28 | `scripts/figural-kal-20.ts` | kunci D: belah ketupat putih, bendera 45°, 1 titik | 4 lapis: bangun Latin + diagonal utama, titik 1–3 + diagonal lain, warna (1 hitam/baris/kolom, diagonal putih), bendera kiral +45° ↻ per kolom & −45° ↺ per baris. 11 aturan alternatif gugur | `matriks-rotasi/proto-matriks-*.png` |
| Rotasi 31 | `scripts/figural-kal-20.ts` | kunci B | 4 langkah: putar 90° ↻, cermin tegak, putar 135° ↺, balik warna (= cermin tegak + 135° ↻ + balik). Bangun tanpa simetri (16 transformasi beda) | `matriks-rotasi/proto-rotasi-*.png` |
| Analogi 35 | `scripts/figural-kal-20b.ts` | kunci b: menara 3 balok + titik | 4 lapis: geser siklik, balok turun balik warna, balok tengah geser kanan, titik = 2 × balok hitam. Brute force bacaan alternatif | `analogi-ikon/proto-analogi-*.png` |
| Ikon 37 | `scripts/figural-kal-20b.ts` | kunci e | titik = (sisi luar − sisi dalam) × jumlah garis atas; semua ciri terbagi 3/2, >100 persamaan sederhana dicek tidak mengisolasi satu gambar | `analogi-ikon/proto-ikon-*.png` |
| Susun 2×3, 33 | `scripts/susun-benda-20.ts`, `scripts/generate-kecerdasan-susun-20.ts` | kapal kontainer, kunci D (4–1–5–6–3–2) | potongan sengaja kembar cermin (derek, tumpukan, tanda sarat), 4 jenis pengecoh (tercermin, salah baris, terputar, tertukar); 9 sambungan, hanya kunci 9/9 tanpa celah/tumpang-tindih | `susun/proto-susun-*.png`, `susun/kecerdasan_susun_kal_20_proto.json` |
| Denah 40 (peta A RUTE), 42 (peta B ROTASI) | `scripts/generate-kecerdasan-denah-20.ts`, `denah-pkg20-items.ts`, `denah-pkg20-sim.ts`, `denah-pkg20-svg.ts` | 40 kunci D: 3 belokan, hitungan persimpangan ulang tiap belokan, bangunan kedua, peta 6 jalan; 42 kunci A: utara di kiri (270°), 2 belokan, putar 135° ↺, ukur arah dari bangunan berhenti | dua simulator (`sim` + `walkCheck` piksel), pengecoh dihitung ulang dengan satu kesalahan, anti-bocor terhadap 65 peta lama | `denah/proto-rute|rotasi-{360,520,pembahasan-*}.png`, `denah/denah-20-proto*.json` |
| Bundar angka 51, huruf 55 | `scripts/figural-kal-bundar-20.ts` | 51 kunci d=13; 55 kunci d=X | 51: dua cincin, luar = 2×dalam + dalam juring cermin (3 lapis). 55: huruf luar = dalam digeser n, n naik 1 tiap juring dan arah berganti, modulo 26. Brute force aturan ≤ 3 suku: tepat satu cocok | `bundar/proto-angka|huruf-*.png` |

### Catatan untuk pemilik (keputusan gaya/kesulitan)
1. **Matriks D-3:** kunci hanya berbeda satu ciri dari tiap pengecoh → kunci = opsi paling mirip dengan semua. Pola standar "satu pengecoh = satu aturan dilanggar" (sama dengan pkg 15/19); kalau mau, satu-dua pengecoh dibuat berbeda 2 ciri (melanggar aturan satu-kesalahan).
2. Matriks: bendera berkelipatan 45° lebih sulit dibaca daripada 90°; opsi e (225°) tampak seperti tanda centang.
3. Ikon: garis pendek 1 vs 2 di atas gambar tipis di 360 px; ada pasangan gambar kembar beda warna (b dan c).
4. Susun: tata letak potongan 2×3 sama dengan pkg 4/5/19 (`cutLayout`); opsi berupa urutan label (bukan gambar rakitan), jadi "terputar/tercermin" dinyatakan pada susunan. Dua potongan punya serpihan terpisah.
5. Denah: stem ROTASI panjang; kompas peta B menimpa tepi bingkai (cacat mesin K17 yang sudah ada di pkg 19); "Jawaban: x." memakai huruf opsi (pkg 19 denah memakai teks nama).
6. Bundar: kunci 51 dan 55 sama-sama "d" (urutan naik, diatur ulang saat produksi); huruf kunci X juga ada di cincin dalam; di juring atas/bawah rumusnya jadi 3×dalam.
7. Huruf kunci semua prototipe sementara; D-4 diatur saat 23 butir lengkap.

### Belum
- **Persetujuan pemilik atas 6 prototipe (G-5)** → baru boleh produksi massal 23 butir gambar pkg 20 (26–42, 51–56) + `pembahasan_svg`, asersi urutan pkg 20 di `generate-kecerdasan-figural-kal.ts` (dan susun/denah), `--check 20` penuh (10 sedang + 90 HOTS, kunci ≤ 24%). Kode prototipe = awal file produksi; produksi tinggal menambah butir (mosaik 2 butir sudah ada, tinggal wiring).
- Wiring file prototipe ke generator/seed (sengaja belum).
- Sesi 5 rencana: perbaikan temuan, cek buta gambar (subagent Sonnet dari PNG), `tsc`, `next build --webpack`, perintah ke pemilik.

### File disentuh sesi 4 (belum commit)
Claude: `prisma/data/kecerdasan_p20_teks.json` (hanya `p` 67, 69–72) · `prisma/data/kecerdasan_p20_{verbal,num,logika}.json` (dipindah keluar repo, ke `<SP4>/src-p20/`) · `docs/rencana/simulasi-5-LOG.md`. Subagent (baru): `scripts/figural-mosaik-20.ts` · `scripts/figural-kal-20.ts` · `scripts/figural-kal-20b.ts` · `scripts/figural-kal-bundar-20.ts` · `scripts/susun-benda-20.ts` · `scripts/generate-kecerdasan-susun-20.ts` · `scripts/generate-kecerdasan-denah-20.ts` · `scripts/denah-pkg20-items.ts` · `scripts/denah-pkg20-sim.ts` · `scripts/denah-pkg20-svg.ts`. Subagent (ubah): `scripts/figural-mosaik.ts` (359 baris; hanya tambahan topeng/ubin baru + `export` + `finishMosaik`; output paket lain byte-identik).

### Status pemeriksa akhir sesi 4
`tsc` bersih · `cek-teks20.ts` OK · `check-kecerdasan-kck.ts` OK 28 · `cek-alokasi.ts` OK · `--check` 4/5/15/16/19 exit 0 · generator figural/susun/denah lama dijalankan ulang: `prisma/data/kecerdasan_{figural,susun,denah}_kal.json` tidak berubah (git).

### Prompt sesi 5

```
Kerjakan SESI 5 dari docs/rencana/simulasi-5.md (rev. 5). Baca rencana itu penuh dulu, lalu docs/rencana/simulasi-5-LOG.md (entri sesi 1–4: keputusan teknis, temuan, tabel prototipe sesi 4, "Belum"), lalu docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md (A-7, §4 D-1..D-5, §6 G-1..G-10, §8, §10), PEDOMAN_SIMULASI_KECERDASAN.md v3, dan RULES GENERATE SOAL SPASIAL.md. Keputusan pemilik di §0a, keputusan teknis sesi 1–4, dan "Keputusan pemilik akhir sesi 3" di LOG sudah final: jangan ditanyakan ulang. Codex CLI sudah limit: JANGAN dipakai; kerja oleh Claude + subagent Claude (subagent terpisah tanpa kunci untuk cek buta). Pemilik menyerahkan keputusan teknis yang sesuai pedoman ke Claude; yang tetap wajib ke pemilik hanya persetujuan prototipe gambar (G-5), tulis DB, dan commit/push.

BATAS KONTEKS: berhenti di sekitar 120k token, di titik aman (tidak ada file setengah jadi). Sebelum berhenti, wajib:
1. tambahkan entri "Sesi 5" di docs/rencana/simulasi-5-LOG.md: yang selesai, yang belum, temuan, keputusan teknis, path file yang disentuh;
2. tulis di akhir LOG "Prompt sesi 6" yang siap ditempel (atau "selesai" bila semua target tuntas), dengan format yang sama seperti prompt ini.

Langkah awal:
- Tanya pemilik hasil persetujuan 6 prototipe gambar pkg 20 (tabel di LOG sesi 4: mosaik 26/27, matriks 28, rotasi 31, analogi 35, ikon 37, susun 33, denah 40/42, bundar 51/55) dan catatan 1–7. JANGAN produksi massal sebelum ada persetujuan; kalau pemilik minta perubahan (mis. pengecoh matriks dua ciri, stem denah dipendekkan), terapkan di file prototipe dulu.
- Jalankan ulang: npx tsx <SP3>/cek-teks20.ts (SP3 = /private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/9306cf77-8b3a-4fa2-b1d1-6c68bcef837b/scratchpad); npx tsx scripts/check-kecerdasan-kck.ts; npx tsx scripts/cek-alokasi.ts; npx tsx scripts/seed-kecerdasan-kal.ts --swap 15 dan --swap 19 (dry run saja); npm run build:drill; npx tsc --noEmit -p .

Target sesi 5:
a. Setelah disetujui: produksi 23 butir gambar pkg 20 (26–42, 51–56) dengan pembahasan_svg: mosaik 26–27 (prototipe sudah ada), matriks 28–30, rotasi 31–32, susun 33–34, analogi 35–36, ikon 37, denah 38–42 (peta A 38–39 ARAH + 40–41 RUTE, peta B 42 ROTASI), bundar angka 51–54 + huruf 55–56. Setiap butir ≥ 1 lapis lebih berat dari butir sejenis pkg 19, bukti tunggal di generator, semua HOTS. Wiring ke generate-kecerdasan-figural-kal.ts / susun / denah dengan asersi urutan pkg 20; paket lain WAJIB byte-identik (git diff prisma/data/kecerdasan_{figural,susun,denah}_kal.json hanya menambah pkg 20). Atur sebaran kunci (D-4 ≤ 24% per huruf, gabungan 100 butir pkg 20).
b. `npx tsx scripts/seed-kecerdasan-kal.ts --check 20` penuh lolos (10 sedang + 90 HOTS, kunci ≤ 24%, tidak bocor); paket 4/5/15/16/19 tetap lolos.
c. Cek buta gambar pkg 20 dari PNG oleh subagent Claude terpisah tanpa kunci (pola Sonnet/Q-4): render tiap butir 520 px, bandingkan alasan (Q-5), setiap beda dibuktikan dengan koordinat/langkah; ambigu → tulis ulang butir (Q-6).
d. Pedoman Kecerdasan: catat layout v4 + Alokasi Waktu + Sebab-Akibat (§4.9 baru, isi = §2.5) dan gaya mosaik baru (G-10 / tabel G-7) atas izin pemilik.
e. QA akhir: `npx tsc --noEmit -p .`, `npx next build --webpack` (jangan next dev kedua di repo), semua pemeriksa, test (`lib/review-pick.test.ts`, `lib/kecermatan-symbols.test.ts`); siapkan perintah untuk pemilik sesuai §5a (urutan wajib, hanya setelah izin: --swap 19 lalu 15 dengan syarat tidak ada sesi IN_PROGRESS dan perbaikan lib/review.ts ter-deploy; seed-kecermatan-packages 13; seed-pribadi-paket 15 --apply; seed-kecerdasan-kal --apply 20; backfill-pembahasan; isi SIMULASI_PAKET[5]).

Aturan keras: jangan menulis ke DB, jangan commit/push, jangan menyentuh output/pribadi-sim*-review.html. Audit setiap diff subagent secara penuh. Jalankan test/asersi setelah setiap perubahan kode. Pecah tugas ke subagent Claude jika memungkinkan.
```

## Sesi 5 · 2026-10-14

Scratchpad: `<SP5>` = `/private/tmp/claude-501/-Users-gustiputuyudawirashana-Downloads-PROJECT-SISTEM-PSIKO-TERINTEGRASI/b07d4280-5114-4343-80eb-152cfb8f0f5d/scratchpad`. Tidak ada tulis DB, tidak ada commit. Pemilik menyetujui 6 prototipe gambar (catatan 1–7 diterima apa adanya). Pemilik menghentikan cek buta lebih lanjut ("tidak usah cek buta lagi").

### Selesai
- **23 butir gambar pkg 20 diproduksi dan tersambung** ke `prisma/data/kecerdasan_{figural,susun,denah}_kal.json` (hanya penambahan, 0 baris dihapus; paket lain byte-identik). Kunci slot gambar: 26D 27B 28D 29C 30A 31B 32E 33D 34C 35B 36A 37E 38C 39E 40D 41B 42A 51D 52C 53A 54E 55C 56E.
- Butir baru: matriks 29/30 + rotasi 32 (`figural-kal-20.ts`), analogi 36 (`figural-kal-20b.ts`), bundar 52–54 + 56 dan kunci 55 digeser D→C (`figural-kal-bundar-20.ts`), susun 34 jembatan gantung (`generate-kecerdasan-susun-20.ts` + `susun-benda-20.ts`; generator direfaktor memakai meta per benda, butir 33 identik), denah 38 BELAKANG, 39 ARAH SAMA (`denah-pkg20-arah.ts`), 41 RUTE 4 belokan (`rute20(count, m)`), 40 dan 42 identik dengan prototipe.
- Pemeriksa lolos: `--check 20` (kunci A24 B24 C25 D25 E25 dari 123 huruf), `--check` 4/5/15/16/19, `--swap 15/19` dry run, `cek-alokasi`, KCK, `check-bank-pribadi`, `seed-pribadi-paket 15`, `build:drill`, `review-pick.test`, `kecermatan-symbols.test`, `cek-teks20`, `tsc`, `next build --webpack`.
- Cek buta gambar putaran 1 (3 subagent tanpa kunci): 17 butir sama dengan kunci. Gagal/tak terbaca: 27, 29, 30, 37, 54 (dan 32 terlalu kecil).

### Perubahan atas hasil cek buta (TANPA persetujuan pemilik, perlu keputusan)
- **27 (mosaik) dan 37 (ikon) adalah prototipe yang sudah disetujui, tetapi ditulis ulang.** 27: penguji menemukan lubang pada bukti tunggal lama (aturan warna ambigu); versi baru 6 gambar, ubin baru, bukti diperluas. 37: versi lama punya dua gambar kembar rupa dan aturan XOR warna/bentuk yang mengisolasi gambar lain; versi baru data diganti, kunci tetap E.
- 29, 30, 32 ditulis ulang (keterbacaan 360 px), 54 diganti aturan: (atas + bawah) × kanan − kiri.
- **Hasil tulis ulang ini BELUM dicek buta ulang** (dihentikan pemilik).

### Belum
- Keputusan pemilik: 27 dan 37 pakai versi baru atau kembali ke prototipe yang disetujui.
- Pedoman Kecerdasan (§4.9 Sebab-Akibat, layout v4, Alokasi Waktu, gaya mosaik G-10/G-7) — menunggu izin pemilik.
- QA akhir ulang setelah keputusan di atas, lalu perintah §5a untuk pemilik.
- `output/denah-kal-preview.html` dan `output/figural-kal-preview.html` (tracked) ikut berubah karena generator menulis ulang pratinjau.

### File disentuh sesi 5 (belum commit)
`scripts/generate-kecerdasan-figural-kal.ts` · `scripts/generate-kecerdasan-susun-kal.ts` · `scripts/generate-kecerdasan-susun-20.ts` · `scripts/susun-benda-20.ts` · `scripts/generate-kecerdasan-denah-kal.ts` · `scripts/generate-kecerdasan-denah-20.ts` · `scripts/denah-pkg20-items.ts` · `scripts/denah-pkg20-arah.ts` (baru) · `scripts/figural-kal-20.ts` · `scripts/figural-kal-20b.ts` · `scripts/figural-kal-bundar-20.ts` · `scripts/figural-mosaik-20.ts` · `scripts/figural-mosaik.ts` · `prisma/data/kecerdasan_{figural,susun,denah}_kal.json` · `output/{denah,figural}-kal-preview.html` · `docs/rencana/simulasi-5-LOG.md`.

### Prompt sesi 6

```
Kerjakan SESI 6 dari docs/rencana/simulasi-5.md (rev. 5): buat Simulasi 5 (Kecerdasan pkg 20, Kepribadian pkg 15, Kecermatan 13, reshape pkg 15/19, drill K18) SIAP PRODUKSI. Baca rencana, lalu docs/rencana/simulasi-5-LOG.md (entri sesi 5: "Perubahan atas hasil cek buta" dan "Belum"). Semua keputusan pemilik di §0a dan LOG sudah final. Codex CLI limit: jangan dipakai.

Keputusan pemilik sesi 5: TIDAK ADA cek buta lagi dan tidak ada penulisan ulang butir tambahan. Butir 27 dan 37 pkg 20 memakai versi hasil tulis ulang sesi 5 (jangan dikembalikan, jangan diubah lagi). Pemilik minta kerja langsung, ringkas, tanpa putaran tambahan: jangan memanggil subagent kecuali pemilik minta; jangan melapor langkah kecil.

Langkah:
1. Periksa sendiri 6 butir yang ditulis ulang di sesi 5 (pkg 20 slot 27, 29, 30, 32, 37, 54): jalankan file generatornya (asersi harus lolos), render PNG soal 360/520 + pembahasan dari prisma/data/kecerdasan_figural_kal.json["20"] (pola scratchpad render.ts: HTML kecil + Chrome headless, body dibatasi lebar 360 px), LIHAT sendiri: tidak ada teks terpotong/tumpang-tindih, detail penentu terbaca di 360 px, pembahasan sesuai gambar dan kunci. Kalau ada cacat teknis (bukan selera), perbaiki minimal; selain itu tinggalkan.
2. Bersihkan sisa kerja: tidak ada file _render*.ts / _s*.ts di scripts/, file sumber sementara tidak dipakai, `git status` hanya memuat file milik rencana ini (output/pribadi-sim*-review.html JANGAN disentuh/di-commit; output/{denah,figural}-kal-preview.html ikut berubah dan boleh ikut commit).
3. Tanya pemilik SATU hal: izin menulis Pedoman Kecerdasan (§4.9 Sebab-Akibat = isi §2.5, layout v4, Alokasi Waktu, gaya mosaik G-10/G-7). Bila izin, tulis; bila tidak, lewati.
4. QA akhir: npx tsc --noEmit -p .; npx next build --webpack (jangan next dev kedua); npx tsx scripts/seed-kecerdasan-kal.ts --check 4/5/15/16/19/20; --swap 15 dan --swap 19 (dry run); scripts/cek-alokasi.ts; scripts/check-kecerdasan-kck.ts; scripts/check-bank-pribadi.ts; scripts/seed-pribadi-paket.ts 15 (dry run); npm run build:drill; lib/review-pick.test.ts; lib/kecermatan-symbols.test.ts. Pastikan git diff prisma/data/kecerdasan_{figural,susun,denah}_kal.json hanya menambah (0 baris dihapus).
5. Siapkan "paket perintah untuk pemilik" sesuai §5a, tulis di LOG, urutan wajib dan hanya dijalankan setelah izin pemilik: (a) syarat: tidak ada module_sessions KECERDASAN IN_PROGRESS untuk pkg 15/19 dan perbaikan lib/review.ts sudah ter-deploy; --swap 19 lalu --swap 15, cek 100 aktif, nomor 1..100, 73–75 Sebab-Akibat, 88–92 Alokasi; (b) seed-kecermatan-packages 13; (c) seed-pribadi-paket 15 --apply; (d) seed-kecerdasan-kal --apply 20; (e) backfill-pembahasan-kecerdasan (dry run lalu --apply), cakupan pembahasan pkg 15, 19, 20 harus 100/100; (f) isi SIMULASI_PAKET[5] = { KECERDASAN: 20, KEPRIBADIAN: 15, KECERMATAN: 13 } lalu commit + push; ganti `rilis` 40 butir drill (K18 + K07 strategi) ke tanggal push. Tulis juga daftar path yang harus di-commit.
6. Tulis entri "Sesi 6" di LOG (selesai/belum/file disentuh) dan tandai "selesai" bila semua tuntas.

Aturan keras: jangan menulis ke DB, jangan commit/push (hanya setelah pemilik izinkan eksplisit), jangan menyentuh output/pribadi-sim*-review.html. Jalankan asersi setelah tiap perubahan kode. Berhenti di titik aman bila konteks ~120k token dan tulis "Prompt sesi 7".
```

## Sesi 6 · 2026-10-14 — SELESAI (siap produksi, menunggu izin pemilik untuk DB + commit)

Tidak ada tulis DB, tidak ada commit, tidak ada subagent, `output/pribadi-sim*-review.html` tidak disentuh.

### Selesai
- **Periksa 6 butir tulis ulang sesi 5 (pkg 20: 27, 29, 30, 32, 37, 54):** generator dijalankan (asersi lolos), PNG soal 360/520 + pembahasan dirender dari `kecerdasan_figural_kal.json["20"]` dan dilihat. Tidak ada teks terpotong/tumpang-tindih, detail penentu terbaca di 360 px, gambar pembahasan cocok dengan kunci (27 B, 29 C, 30 A, 32 E, 37 E, 54 E; angka pembahasan 54 dihitung ulang, benar). **Satu cacat teks diperbaiki:** pembahasan 37 menulis "(3 lawan 2)" untuk c dan e; sekarang "c (2 titik lawan 1 garis) dan e (1 titik lawan 3 garis)" (`scripts/figural-kal-20b.ts`, generator dijalankan ulang). Selain itu tidak ada perubahan; 27 dan 37 tetap versi sesi 5.
- **Bersih:** tidak ada `_render*.ts` / `_s*.ts` di `scripts/`; semua file baru di `scripts/` diimpor generator/seed atau berdiri sendiri (`cek-alokasi.ts`). `git status` hanya memuat file rencana ini + `output/pribadi-sim{2,3}-review.html` (bukan milik rencana, jangan di-commit).
- **Pedoman (izin pemilik: ya):** `PEDOMAN_SIMULASI_KECERDASAN.md` v4 (layout v4, §4.9 Sebab-Akibat, §4.10 Alokasi Waktu, item checklist QA); `PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md` G-7 (baris mosaik) + G-10 (topeng `tab`/`perisai`, ubin `tangga`/`panah`).
- **QA akhir, semua exit 0:** `tsc --noEmit` · `--check` 4/5/15/16/19/20 (pkg 20 kunci A24 B24 C25 D25 E25) · `--swap 15` dan `--swap 19` dry run (8 slot siap; kunci pkg 15 sesudah A24 B24 C23 D24 E28, pkg 19 sesudah A26 B25 C25 D23 E24, batas 29) · `cek-alokasi` (15 + 10) · `check-kecerdasan-kck` 28 · `check-bank-pribadi` · `seed-pribadi-paket 15` dry run · `build:drill` 860 (K18 30 soal) · `review-pick.test` · `kecermatan-symbols.test` · `next build --webpack`. `git diff --numstat` `kecerdasan_{figural,susun,denah}_kal.json`: +626/0, +82/0, +202/0 (0 baris dihapus).

### Belum
- Semua langkah tulis DB/commit di bawah (menunggu izin eksplisit pemilik).

### Paket perintah untuk pemilik (§5a; urutan wajib, jalankan hanya setelah izin)
Dari `psiko-cat/`:
1. **Syarat:** tidak ada `module_sessions` KECERDASAN `IN_PROGRESS` untuk pkg 15/19, dan perbaikan `lib/review.ts` (+ `lib/review-pick.ts`) sudah ter-deploy (artinya commit/push tahap review dulu bila belum).
   `npx tsx scripts/seed-kecerdasan-kal.ts --swap 19 --apply` lalu `npx tsx scripts/seed-kecerdasan-kal.ts --swap 15 --apply`. Cek: pkg 15 dan 19 masing-masing 100 aktif, nomor 1..100, 73–75 = Sebab-Akibat, 88–92 = Alokasi.
2. `npx tsx scripts/seed-kecermatan-packages.ts 13` (tanpa dry run) → cek 500/500 soal di DB.
3. `npx tsx scripts/seed-pribadi-paket.ts 15 --apply`
4. `npx tsx scripts/seed-kecerdasan-kal.ts --apply 20`
5. `npx tsx scripts/backfill-pembahasan-kecerdasan.ts` (dry run) lalu `--apply`; cakupan pembahasan pkg 15, 19, 20 harus 100/100.
6. `lib/test-config.ts`: isi `SIMULASI_PAKET[5] = { KECERDASAN: 20, KEPRIBADIAN: 15, KECERMATAN: 13 }`. Ganti `rilis` 40 butir drill (30 butir `K18-sebab-akibat.json` + 10 butir `NUM-CRT-ALOKASI-STRATEGI` di `K07-soal-cerita.json`, sekarang "2026-10-14") ke tanggal push, jalankan `npm run build:drill`. Commit + `git push origin HEAD:main`. Lalu Claude memverifikasi kartu 5 terbuka dan `isSimulasiPackage` menolak 20/15/13 di latihan.

**Path yang di-commit (jangan `git add -A`):**
`app/components/engines/EngineKecerdasan.tsx` · `app/components/pembahasan/cards.tsx` · `app/latihan/[module]/LatihanKecerdasan.tsx` · `bank/drill/LOG.md` · `bank/drill/kecerdasan/K07-soal-cerita.json` · `bank/drill/kecerdasan/K18-sebab-akibat.json` · `bank/pribadi/kp-sim5-01.json` · `bank/pribadi/sk-sim5-01.json` · `bank/pribadi/paket-15.json` · `data/drill-bank.json` · `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md` · `docs/pedoman/PEDOMAN_SIMULASI_KECERMATAN.md` · `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md` · `docs/rencana/drilling/02-kecerdasan-drill-taxonomy.md` · `docs/rencana/simulasi-5.md` · `docs/rencana/simulasi-5-LOG.md` · `lib/drill-cards.ts` · `lib/kecermatan-symbols.test.ts` · `lib/review.ts` · `lib/review-pick.ts` · `lib/review-pick.test.ts` · `lib/test-config.ts` (setelah diisi) · `output/denah-kal-preview.html` · `output/figural-kal-preview.html` · `prisma/data/bank_soal_p13.json` · `prisma/data/kecerdasan_{alokasi,p20_teks,sba}.json` · `prisma/data/kecerdasan_{denah,figural,kck,susun}_kal.json` · `scripts/{backfill-pembahasan-kecerdasan,check-kecerdasan-kck,figural-mosaik,generate-kecerdasan-denah-kal,generate-kecerdasan-figural-kal,generate-kecerdasan-susun-kal,kecerdasan-teks-lib,seed-kecerdasan-kal}.ts` · baru: `scripts/{cek-alokasi,denah-pkg20-arah,denah-pkg20-items,denah-pkg20-sim,denah-pkg20-svg,figural-kal-20,figural-kal-20b,figural-kal-bundar-20,figural-mosaik-20,generate-kecerdasan-denah-20,generate-kecerdasan-susun-20,susun-benda-20}.ts`.
JANGAN: `output/pribadi-sim2-review.html`, `output/pribadi-sim3-review.html`.

### File disentuh sesi 6
`scripts/figural-kal-20b.ts` (1 kalimat pembahasan 37) · `prisma/data/kecerdasan_figural_kal.json` (hasil generator, hanya pembahasan butir 37 pkg 20) · `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md` · `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md` · `docs/rencana/simulasi-5-LOG.md`.

### Prompt sesi 7
Selesai: tidak ada pekerjaan pembuatan tersisa. Sesi berikutnya hanya bila pemilik bilang "commit dan push" / izin menjalankan paket perintah di atas.

### Eksekusi paket perintah (2026-10-14, izin pemilik)
Syarat: tidak ada sesi KECERDASAN IN_PROGRESS untuk pkg 15/19 (11 sesi IN_PROGRESS semuanya pkg 13/18/lama). Commit e1eb0f1 di-push lebih dulu (perbaikan lib/review.ts). Lalu: `--swap 19 --apply` dan `--swap 15 --apply` (masing-masing 8 slot; 100 aktif, 1..100, 73 = Sebab-Akibat, 88 = Alokasi) · seed-kecermatan-packages 13 (500/500) · seed-pribadi-paket 15 --apply (111 baris) · seed-kecerdasan-kal --apply 20 (100 soal) · backfill-pembahasan --apply (216 baris: pkg 15 8, pkg 19 108, pkg 20 100; dry run ulang 0; cakupan pkg 15/19/20 penuh) · `SIMULASI_PAKET[5]` diisi (`lib/test-config.ts`). `rilis` drill sudah 2026-10-14 = tanggal push, tidak diganti.
