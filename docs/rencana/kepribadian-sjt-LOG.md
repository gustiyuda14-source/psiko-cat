# LOG Kepribadian SJT (Latihan/Mini Tryout)

Sub-tes Kepribadian format situasional: 48 situasi 5 opsi berbobot 1–5 (kunci = bobot 5 = opsi yang paling mencerminkan aspek) + 63 Pass Hand / Integritas & Kejujuran A/B. Target 5 paket = package_number 21–25. Keputusan pemilik 2026-10-20.

## 2026-10-20 · Paket 1 (pkg 21) — disetujui pemilik

- Bank: `bank/pribadi/sjt-01.json` (48 butir, 8 per aspek, kembar PRO-007/008, PK-007/008, SE-007/008), `bank/pribadi/sk-sjt-01.json` (63 butir baru SK-Dx-701+, 4 pasang kembar D1/D2/D3/D5, kunci A 32), manifest `paket-21.json` (`scripts/compose-pribadi-sjt.ts 21 sjt-01 sk-sjt-01`).
- Sebaran kunci SJT A10 B10 C10 D9 E9; kunci = opsi terpanjang 12/48 (batas 24%).
- Cek buta Codex: putaran 1 SJT 47/48 + 11 ambigu, SK 63/63 + 2 ambigu → PD-001 diperbaiki, 12 butir dipertegas → putaran 2 pemeriksa baru 13/13 cocok. Sisa catatan: SJT-PD-003 masih dinilai agak ambigu, kunci dan urutan cocok.
- Engine: `sjt5` di `lib/scoring/pribadi.ts`, tab "Situasional (SJT)" (`KepribadianFormatPicker`), `KEPRIBADIAN_SJT_PACKAGES` di `lib/test-config.ts`, validator SJT di `check-bank-pribadi.ts`, seed SJT di `seed-pribadi-paket.ts`.
- Review: `output/pribadi-sjt-p1-review.html`.
- Seed (pemilik): `cd "/Users/gustiputuyudawirashana/Downloads/PROJECT SISTEM PSIKO TERINTEGRASI/psiko-cat" && npx tsx scripts/seed-pribadi-paket.ts 21 --apply`.

## 2026-10-20 · Paket 2–5 (pkg 22–25) — disetujui pemilik, di-seed, live

Disusun 4 subagent paralel (satu per paket, brief bersama), QA oleh orchestrator.

| Paket | Bank | Konteks | Id | Kunci SJT A/B/C/D/E | Kunci = terpanjang | Kunci A SK |
|---|---|---|---|---|---|---|
| 2 (pkg 22) | `sjt-02` + `sk-sjt-02` | sekolah, asrama, keluarga | SJT-xx-101+, SK-Dx-801+ | 10/10/10/9/9 | 8/48 | 32/63 |
| 3 (pkg 23) | `sjt-03` + `sk-sjt-03` | kampus, organisasi, olahraga | SJT-xx-201+, SK-Dx-901+ | 10/9/10/10/9 | 9/48 | 32/63 |
| 4 (pkg 24) | `sjt-04` + `sk-sjt-04` | kantor, kelurahan, pelayanan publik | SJT-xx-301+, SK-Dx-1001+ | 10/10/10/9/9 | 8/48 | 32/63 |
| 5 (pkg 25) | `sjt-05` + `sk-sjt-05` | komunitas, usaha kecil, transportasi umum | SJT-xx-401+, SK-Dx-1101+ | 10/10/9/10/9 | 6/48 | 32/63 |

- Tiap paket: 48 SJT (8 per aspek), kembar SJT xx7↔xx8 di PD, KD, MB (keempat paket memakai set aspek kembar yang sama; sjt-01 memakai PRO/PK/SE). 63 SK komposisi seperti sk-sjt-01, kembar D1/D2/D3/D5 (xx03↔04, xx04↔05, xx05↔06, xx05↔06). Grep unsur kepolisian 0.
- Manifest `paket-22..25.json` (`compose-pribadi-sjt.ts`), dry-run `seed-pribadi-paket.ts 22..25` lolos komposisi + jawaban ideal 100.
- `check-bank-pribadi.ts` semua file sekaligus: lolos (816 KP, 240 SJT, 1197 SK, 32 file) setelah dua perbaikan kemiripan lintas paket: SK-D7-1001 (mirip SK-D7-801) ditulis ulang; SK-D9-902 (setelah dipertegas jadi mirip SK-D9-803) diganti situasi lain.
- Cek buta Codex putaran 1 (tanpa bobot/kunci/dimensi; aturan aspek §7.3 + aturan D1–D11 diberikan): keempat paket 111/111 kunci cocok. Urutan 5 opsi persis sama dengan bobot: P2 35/48, P3 37/48, P4 34/48, P5 44/48; dua teratas sama: 41, 42, 47, 46 dari 48. Tidak ada urutan yang menyimpang jauh.
- Catatan ambigu Codex hanya di SK: SK-D9-902, SK-D9-1102, SK-D9-1105, SK-D4-1112, SK-D8-1108 (kunci tetap cocok). Diperbaiki: 902 diganti situasi, 1102 "diyakini" → "direnungkan", 1105 "dilakukan" → "didahulukan", 1112 opsi A diganti "Mempertahankan menu dan jam buka…" (A lama juga terbaca inovasi), 1108 stem ditambah "kedua loket masih sanggup Anda layani bergantian". Putaran 2 pemeriksa Codex baru (6 butir termasuk SK-D7-1001 baru): 6/6 cocok, tanpa catatan ambigu.
- Perbaikan bahasa: 63 pembahasan sk-sjt-05 berpola "juga baik, tetapi X, tetapi Y" → "juga baik: X, tetapi Y". **Utang:** sk-sjt-01 (sudah disetujui) masih punya pola ini di 52 butir; belum disentuh.
- Butir yang dinilai paling rawan ambigu oleh penyusun (Codex tetap cocok): SJT-SE-103, SJT-PD-105, SJT-PRO-108, SK-D6-806 (P2); SJT-MB-205, SJT-PK-208, SJT-PRO-201, SJT-SE-201, SJT-PK-203 (P3); SJT-SE-306, SJT-PD-303, SJT-MB-302, SJT-PK-304, SK-D9-1002 (P4); SJT-PK-406, SJT-PK-408, SJT-PK-407, SJT-SE-406, SJT-KD-403/406 (P5). Pantau di `/admin/pengecoh` setelah rilis.
- Review: `output/pribadi-sjt-p2-review.html` … `p5-review.html`.
- Seed (pemilik): `seed-pribadi-paket.ts 22..25 --apply`, tiap paket 111 baris, jawaban ideal 100. Verifikasi DB: 111 baris/paket, 48 `sjt5`, pembahasan 111/111, aktif, urutan = manifest. `KEPRIBADIAN_SJT_PACKAGES = [21, 22, 23, 24, 25]`. Build diverifikasi di salinan `git archive` (build di repo crash di webpack karena state lokal, lihat memory git-push-workflow).
- Generator subagent (bisa dijalankan ulang) di scratchpad sesi, tidak masuk repo; JSON di `bank/pribadi/` adalah sumber kebenaran.

## 2026-10-20 · Simulasi Penuh 4 dan 5 → Kepribadian SJT (pkg 26, 27) — disetujui pemilik, di-seed, live

Keputusan pemilik: Kepribadian Simulasi 4 dan 5 diganti SJT, Pass Hand tetap. Pkg 19/20 (Likert) tidak ditimpa karena sudah dipakai sesi lama (42 dan 9 sesi Kepribadian); bank SJT masuk paket baru.

- Bank: `sjt-sim4-01.json` (SJT-xx-501+) dan `sjt-sim5-01.json` (SJT-xx-601+), masing-masing 64 butir = 8 aspek × 8 (6 aspek SPCP + Loyalitas `LOY` + Kerja Sama `KS`, definisi dari kp-loy-01/kp-ks-01). Kembar: Sim 4 PRO/PK/LOY/KS, Sim 5 SE/MB/LOY/KS. Sim 5 disusun lebih sulit dari Sim 4 (dilema berlapis, pengecoh 4/3 lebih masuk akal).
- Manifest: `paket-26.json` = sjt-sim4-01 + sk-sim4-01 (Pass Hand sama dengan pkg 19), `paket-27.json` = sjt-sim5-01 + sk-sim5-01 (sama dengan pkg 20). Dry-run seed lolos (64 + 63).
- Sebaran kunci: Sim 4 A13 B13 C13 D13 E12, Sim 5 A13 B13 C13 D13 E12. Peringkat panjang kunci (1 = terpanjang) setelah perbaikan: Sim 4 r1 11 · r2 16 · r3 19 · r4 9 · r5 9; Sim 5 10 · 16 · 17 · 13 · 8.
- **Temuan D-3 baru:** validator hanya mengecek kunci = opsi terpanjang, padahal kunci menumpuk di opsi terpanjang KEDUA (versi awal Sim 4 52%, Sim 5 48%). Sudah diratakan di kedua bank simulasi (Sim 4 19 butir, Sim 5 30 butir; teks saja, bobot/kunci tetap). Bank latihan yang sudah live juga kena: kunci = terpanjang kedua di sjt-03 25/48 (52%) dan sjt-05 30/48 (62%); sjt-01/02/04 ≤ 31%. **Utang:** ratakan sjt-03/05 (perlu update baris DB) dan tambahkan cek peringkat panjang ke `check-bank-pribadi.ts`.
- Cek buta Codex (pemeriksa baru setelah revisi panjang): Sim 4 127/127 (urutan bobot persis 58/64), Sim 5 127/127 (58/64), tanpa beda. Ambigu yang diperbaiki: SJT-PRO-501 (opsi E diganti, stem dipertegas "perawat sudah memastikan…"), SJT-PK-503 (stem: pelanggan bersedia menerima sisa besok); dicek ulang pemeriksa baru, cocok.
- Validator penuh lolos: 816 KP, 368 SJT, 1197 SK (34 file). Grep unsur kepolisian 0.
- Review: `output/pribadi-sjt-sim4-review.html`, `output/pribadi-sjt-sim5-review.html`.
- Seed (pemilik): `seed-pribadi-paket.ts 26 --apply` dan `27 --apply`, 127 baris per paket, jawaban ideal 100. Verifikasi DB: 127 baris, 64 `sjt5`, pembahasan 127/127, aktif, urutan = manifest.
- Config: `SIMULASI_PAKET` 4 → KEPRIBADIAN 26, 5 → 27; 19 dan 20 masuk `SIMULASI_KEPRIBADIAN_LAMA` (sesi lama tetap terbaca dan tetap terlarang di latihan); `shortDesc` Kepribadian = "skala Likert atau situasional".

## Prompt lanjutan

Target 5 paket SJT Latihan/Mini Tryout tercapai. Sisa utang: ratakan peringkat panjang kunci sjt-03/sjt-05 (terpanjang kedua 52%/62%) + tambah cek ini ke validator; rapikan pola "juga baik, tetapi …, tetapi …" di 52 pembahasan `sk-sjt-01` (pkg 21 sudah di DB, jadi perlu update baris DB juga), dan variasikan aspek kembar SJT di paket berikutnya (P2–P5 semua PD/KD/MB).
