# Ultra Plan K17 — ROTASI + INGAT (sesi berikutnya)

Status 2026-10-12: **RENCANA, belum ada kode/soal.** Dua sub-tipe terakhir dari pedoman K17. Kerjakan berurutan: ROTASI dulu (hanya generator), lalu INGAT (generator + fitur halaman drill).

Pedoman induk: Claude Doc "Pedoman Penyusunan Bank Soal Denah & Arah Mata Angin" — https://claude.ai/code/artifact/ac06221b-2130-4db2-a7e3-e9424a95dd35 (target ROTASI 15, INGAT 15; tier ROTASI 2–3).

---

## 0. Kondisi awal (baca dulu, jangan diubah tanpa alasan)

| Hal | Isi |
|---|---|
| Bank | `bank/drill/kecerdasan/K17-denah-arah.json` — 170 soal `K17-N-001`–`170`, semua `ganda` |
| Sebaran | ARAH 60 · RUTE 50 · LEWAT 30 · RELASI 30 · tier 54/56/60 · kunci 34 per huruf |
| Generator | `scripts/generate-denah-k17.ts` (482 baris — **hampir batas 500**, lihat §3.1) |
| Mesin peta grid berwarna | `scripts/denah-k17-peta.ts` (peta 1–22, **jangan dipakai lagi untuk soal baru**) |
| Mesin peta hitam-putih | `scripts/denah-k17-bw.ts` (peta 23–34) — **wajib untuk ROTASI/INGAT** |
| Fase generator | A peta 1–10 seed `1700+m*101` · B peta 11–22 seed `2900+m*101` · C peta 23–34 seed `7300+m*97`. Fase baru = seed baru, **jangan sentuh urutan rnd fase lama** |
| Gambar | `public/drill/img/K17-peta-NN.svg` (soal) · `data/drill-pembahasan/K17-N-xxx.svg` (pembahasan, dilayani `/api/drill/gambar/[id]` setelah menjawab) |
| Registry | `lib/drill-cards.ts` K17 aspek `analitis`, prefix `FIG-DENAH-`, kategori di `DRILL_CATEGORIES` |
| Log batch | `bank/drill/LOG.md` batch 13–15 |
| Commit terakhir K17 | cb8f053 (batch 15) |

Pengaman yang sudah ada di generator: status `ganda` hanya dipertahankan bila stem/opsi/kunci identik (`OLD` map di `emit`). Setelah generate, **cek 170 soal lama identik** (`git show HEAD:<bank>` lalu bandingkan `b[:170]`).

## 1. Preferensi pemilik (wajib diikuti)

1. Gaya **hitam-putih** seperti soal cetak (contoh ab.school no. 30). Tidak kembali ke grid berwarna / ikon Pura dkk.
2. **Prototipe dulu** (6 peta/contoh soal → screenshot) → tunggu persetujuan → baru generate soal.
3. Nama jalan/rumah **tidak meniru** soal ab.school/Pejuang Kedinasan.
4. Pembahasan gaya yang disetujui: paragraf 1 `Langkah 1..n` · `<br>` · paragraf 2 `Kenapa yang lain salah:` + `Opsi X (isi): alasan sehari-hari` per baris + `Jawaban: …` · `<br>` · paragraf 3 `Gambaran nyata: …` (skenario tugas polisi) + `Tips: …`. Baris dipisah `\n`.
5. Tiap soal punya `gambar_pembahasan` (peta dipudarkan + coretan: acuan biru, jawaban hijau, satu pengecoh "hampir benar" merah putus-putus).
6. Setelah disetujui: commit + push ke `main` tanpa tanya lagi; verifikasi build dulu; **commit hanya path sendiri** (sesi lain sering punya perubahan belum di-commit — cek `git status`).
7. Bahasa Indonesia, ringkas.

## 2. Prosedur baku per batch (sudah terbukti 3×)

1. Prototipe → screenshot headless Chrome → minta persetujuan.
2. Generate → `npx tsx scripts/generate-denah-k17.ts` → pastikan soal lama identik.
3. Cek visual: render contact sheet peta + 5 gambar pembahasan (Chrome `--headless --screenshot`, file di scratchpad).
4. Validasi: `npx tsx scripts/build-drill-bank.ts --check --draft`.
5. Cek buta Codex (tanpa kunci): siapkan folder scratch berisi SVG peta + `soal.json` (`id, peta, aturan=instruksi, stem, opsi`), jalankan
   `codex exec --skip-git-repo-check -s read-only -C <dir> -o <dir>/jawaban.txt "<prompt>" < /dev/null`
   — minta format `<id> <huruf> <isi opsi> <yakin|ragu> <alasan>`; **bandingkan isi opsi, bukan huruf** (Codex sering salah tulis huruf).
6. Beda → periksa sendiri di gambar → pengerjaan ulang Codex dengan instruksi koordinat/daftar per sisi. Cacat desain → perbaiki aturan generator, generate ulang, cek ulang soal yang berubah.
7. Naikkan ke `ganda` → generate ulang (harus "0 perlu cek buta") → `npm run build:drill` → `npx tsc --noEmit -p .` → `npx eslint <file>` → `npx next build --webpack` (Turbopack tidak jalan di Mac ini).
8. Tambah batch di `bank/drill/LOG.md` → commit path sendiri → `git push origin HEAD:main`.

## 3. ROTASI — 15 soal, `FIG-DENAH-ROTASI`

### 3.1 Persiapan kode
- Generator sudah 482 baris. **Pindahkan dulu** fungsi `rute2` + `ring2` + helper peta hitam-putih ke modul baru `scripts/denah-k17-soal-bw.ts` (atau ke `denah-k17-bw.ts`), lalu tambahkan ROTASI di sana. Setelah pindah: generate → bank + SVG harus **identik byte** (git diff kosong).
- Daftarkan kategori `["FIG-DENAH-ROTASI", "Rotasi peta & badan"]` di `lib/drill-cards.ts`.

### 3.2 Dua bentuk soal (campur dalam 3 peta × 5 soal)

**R1 — Peta tidak menghadap Utara (8–9 soal).**
- Geometri tetap dihitung di bingkai "Utara ke atas" (semua fungsi lama tetap benar). Hanya **render** yang diputar 90°/180°/270°: posisi bangunan & jalan diputar terhadap pusat peta, **label teks tetap tegak** (render tiap `<text>` pada koordinat hasil putar tanpa rotate, nama jalan mengikuti sumbu jalan baru), kompas ikut diputar sehingga "U" tidak di atas.
- Stem memakai ARAH: "Di antara pilihan berikut, bangunan yang terletak di arah Timur Laut dari KUA adalah …" / "… terletak di arah mana dari …?". Kunci = arah sebenarnya (kompas), bukan arah layar.
- Pengecoh wajib menyertakan **"arah layar"**: bangunan yang berada di arah D bila peserta menganggap atas = Utara (kesalahan khas soal ini) + tetangga/cermin seperti ARAH biasa.
- Pembahasan: Langkah 1 "Lihat kompas: Utara ada di <kanan/bawah/kiri> peta", Langkah 2 "Putar peta di kepala (atau putar HP) sampai U di atas", Langkah 3 seperti ARAH. Tips: "jangan pernah menganggap atas = Utara sebelum melihat kompas".
- Gambar pembahasan: peta versi **diputar balik ke Utara di atas** + panah jawaban (peserta melihat peta "normal"), keterangan pita atas "Peta diputar 90° — Utara ada di kanan".
- Tier: 90°/270° = 2, 180° = 3 (kiri-kanan ikut terbalik).
- `INSTRUKSI` tambahan: "Arah ditentukan oleh kompas; peta bisa saja tidak menghadap Utara."

**R2 — Berputar n derajat di tempat (6–7 soal).**
- Stem: "Rina berdiri di depan <bangunan X> menghadap <arah awal>, lalu berputar <45/90/135/180/225/270>° <searah/berlawanan arah> jarum jam. Bangunan yang tepat di depannya sekarang adalah …" (opsi bangunan) atau "… sekarang menghadap ke arah …?" (opsi arah).
- Kunci: arah akhir = (awal ± n/45) mod 8; untuk opsi bangunan, bangunan yang memenuhi `safeKey` di arah akhir dari X (sama dengan ARAH).
- Pengecoh: arah putar terbalik (searah ↔ berlawanan), langkah 45° salah satu (n±45), berhenti di setengah putaran, arah awal (tidak berputar).
- Peta tetap Utara di atas (boleh peta R1 versi tidak diputar? **tidak** — pakai peta hitam-putih baru supaya tidak bocor).
- Pembahasan: hitung langkah "135° = 3 langkah kompas; dari Utara searah jarum jam: TL → T → TG", gambar pembahasan berupa busur putar di titik X + panah ke jawaban.
- Tier: kelipatan 90° = 2, kelipatan 45° ganjil atau berlawanan arah jarum jam = 3.

### 3.3 Fase generator
- Fase D: peta 35–37, seed baru (mis. `9100+m*97`), posisi kunci `shuffle(15)` seimbang 3 per huruf.
- Prototipe: 3 peta R1 (90/180/270) + 2 soal R2 dengan gambar pembahasan → minta persetujuan.

## 4. INGAT — 15 soal, `FIG-DENAH-INGAT`

### 4.1 Data
- Field baru per item: `tampil_detik: number` (5–60). Tambahkan ke:
  - `bank/drill/BANK_SCHEMA.md` (dokumentasi),
  - `scripts/build-drill-bank.ts` (validasi: bilangan bulat 5–60, hanya bila ada `gambar`),
  - `lib/drill-bank.ts` (`DrillItem` + **`SafeDrillItem` Pick list** + mapper `safe`), supaya sampai ke browser.

### 4.2 Halaman drill (`app/latihan/drill/[kartu]/DrillSession.tsx`)
- Soal dengan `tampil_detik` yang **belum dijawab** dibuka dalam fase "Hafalkan": hanya peta + hitung mundur besar ("Hafalkan peta · 20 detik"), stem & opsi disembunyikan; tombol "Saya sudah hafal" untuk mempercepat.
- Waktu habis → peta diganti kotak "Peta disembunyikan", stem + opsi muncul. Waktu jawab (`ms`) dihitung **sejak fase jawab dimulai**.
- Setelah Periksa: pembahasan + `gambar_pembahasan` tampil seperti biasa (peta kembali terlihat).
- Kembali ke soal yang belum dijawab via navigasi → fase hafal diulang dari awal; soal yang sudah dijawab → langsung tampil hasil.
- Aksesibilitas: hitung mundur `aria-live="polite"` per 5 detik, `prefers-reduced-motion` tanpa animasi; timer dibersihkan saat pindah soal (useEffect cleanup).
- Jangan ubah perilaku kartu lain (tanpa `tampil_detik` = alur lama).

### 4.3 Soal
- 3 peta hitam-putih baru × 5 soal; pertanyaan sederhana karena bebannya ingatan: ARAH pilih bangunan, letak (sisi jalan/pojok), "bangunan di sebelah X".
- Durasi: tier 1 = 25 detik (peta 14–16 bangunan), tier 2 = 20 detik, tier 3 = 15 detik (peta padat 18–22).
- Pembahasan: Langkah termasuk strategi hafal ("kelompokkan per jalan: utara Jl. A ada …"); Gambaran nyata: "saksi melihat lokasi sekilas lalu melapor"; Tips teknik chunking.
- Cek buta Codex tetap memakai peta (yang diuji kunci, bukan ingatan Codex).

### 4.4 Verifikasi UI lokal (resep yang sudah jalan)
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9 SUPABASE_SERVICE_ROLE_KEY=dummy npx next dev --webpack -p 3123` (account-guard lolos saat Supabase gagal; `/api/drill/check` tetap mengembalikan pembahasan, progres "belum tersimpan" itu wajar).
- Skrip sementara `scripts/.shot-tmp.mjs` (hapus setelah dipakai): tanda tangan JWT `psiko_session` (JWT_SECRET dari `.env.local`), Chrome headless `--remote-debugging-port` + profil sendiri, `Network.setCookie`, buka `/latihan/drill/K17`, screenshot fase hafal → tunggu → fase jawab → Periksa → pembahasan. Progres palsu bisa disuntik lewat CDP `Fetch.enable` pada `*/api/progress*`.
- Jangan pakai chrome-devtools MCP (browser asli pemilik).

## 5. Di luar cakupan (catat, jangan dikerjakan tanpa perintah)
- Pencatatan opsi yang dipilih di drill (`/api/drill/check` + kolom/tabel baru) untuk analisis pengecoh — disarankan dipasang lebih awal supaya data terkumpul; halaman analisis butir menunggu ±200 respons/soal. Simulasi sudah punya `answers.selected_key` + `users.gender`.
- Jumlah opsi 5 vs 4 (pertanyaan terbuka di komentar pedoman).

## 6. Selesai bila
- [ ] ROTASI 15 + INGAT 15 di bank, semua `ganda`, 170 soal lama identik.
- [ ] Kunci tersebar rata, tier ROTASI 2–3.
- [ ] Fase hafal INGAT jalan di lokal (screenshot 3 tahap), kartu lain tidak berubah.
- [ ] build:drill, tsc, eslint, next build --webpack lolos.
- [ ] LOG batch 16 (ROTASI) & 17 (INGAT), commit path sendiri, push `main`, deploy Vercel Ready.
- [ ] Update memori proyek (status K17 + keputusan baru).
