# Ultra Plan — Simulasi Penuh Paket 4 (kartu 4)

2026-10-13 · Status: **RENCANA, belum ada yang dibangun** · Log sesi + prompt lanjutan: `simulasi-4-LOG.md` (dibuat saat sesi 1 berhenti).

## 0. Ringkasan

| Modul | package_number | Isi | Catatan |
|---|---|---|---|
| Kecerdasan | **19** | 100 butir baru, pedoman Kecerdasan v3 (blok 76–90 HIT, 91–96 CRT, 97–100 KCK) | simulasi berikutnya mulai 19 (`lib/test-config.ts`) |
| Kepribadian | **14** | 48 KP + 63 Integritas & Kejujuran, **bank baru penuh** | `bank/pribadi/kp-sim4-01.json`, `sk-sim4-01.json`, manifest `paket-14.json` |
| Kecermatan | **12** | 10 kolom × 50, campuran 5 jenis hitam-putih | `BLUEPRINT[12]` di `generate-kecermatan-simulasi.ts`; donor spasial 298 / 498 / 598 |

Kartu 4 terbuka otomatis setelah `SIMULASI_PAKET[4] = { KECERDASAN: 19, KEPRIBADIAN: 14, KECERMATAN: 12 }` **diisi pemilik** (classifier auto-mode memblok Claude mengedit `SIMULASI_PAKET`) dan bank 19 + 14 ada di DB.

## 0a. Prasyarat / dependensi

1. **Latihan Kecerdasan pkg 4/5 masih belum di-commit** dan memakai file generator yang sama (`figural-mosaik.ts`, `generate-kecerdasan-{figural,denah,susun}-kal.ts`, `seed-kecerdasan-kal.ts`, `kecerdasan_*_kal.json`). Pekerjaan **gambar dan seed Kecerdasan 19 tidak dimulai** sebelum pemilik bilang "commit dan push" untuk pkg 4/5. Teks Kecerdasan, Kepribadian, dan Kecermatan bisa jalan sekarang (file terpisah).
2. Wajib dibaca di awal tiap sesi: `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md` (A-7, §4 D-1..D-5, §5, §6 G-1..G-10, §10), lalu lampiran modul yang dikerjakan sesi itu: `PEDOMAN_SIMULASI_KECERDASAN.md` v3, `PEDOMAN_ENGINE_PRIBADI.md` (§1.1a, §3, §4.1–4.2, §6, §7.4), `PEDOMAN_SIMULASI_KECERMATAN.md`, `RULES GENERATE SOAL SPASIAL.md`.
3. Gaya yang sudah disetujui dan jadi acuan: figural `figural-kal-4.ts`/`-5.ts`, susun benda nyata `susun-benda-45.ts`, `Style` mosaik (G-10).

## 1. Cara kerja (sama dengan Latihan pkg 4/5)

- Claude + Codex CLI paralel di bagian berbeda (§3). Codex tidak bisa commit, network, atau DB; Claude mengaudit diff Codex penuh (bukan laporannya).
  - tulis: `codex exec --skip-git-repo-check -s workspace-write -C <repo> -o <out> - < <brief>`
  - cek buta: `codex exec --skip-git-repo-check -s read-only -C <dir> -o <file> - < <brief>` (input harus dari file / `< /dev/null`, kalau tidak macet)
  - Gagal 400 "requires a newer version" → `npm install -g @openai/codex@latest`.
- Brief Codex di `scratchpad/codex/<nama>.md`, menyalin aturan pedoman yang relevan (Codex tidak membaca memory). Codex hanya menulis file yang disebut brief; cek `git status` setelah tiap job.
- **Berhenti ±120k token** di titik aman → entri LOG (format §6 rencana pkg 3-4) + prompt lanjutan.
- Tidak menulis DB. Commit hanya setelah pemilik cek localhost dan bilang "commit dan push"; commit hanya path sendiri, `git push origin HEAD:main`.

## 2. Blueprint

### 2.1 Kecerdasan pkg 19 (sama dengan blueprint v3 rencana pkg 3-4 §2)
Verbal 1–25 · deret mosaik 26–27 · matriks 28–30 · rotasi 31–32 · susun 33–34 · analogi gambar 35–36 · ikon 37 · denah 38–42 (peta A 2 ARAH + 2 RUTE, peta B 1 ROTASI) · silogisme 43–50 (instruksi "anggap semua premis benar") · bundar angka 51–54 + huruf 55–56 · deret angka 57–60 · deret huruf 61–64 · wacana logika 65–75 · HIT 76–90 · CRT 91–96 · KCK 97–100.
- Tingkat 0 / **20 / 80** (keputusan pemilik 2026-10-13: simulasi makin jauh makin sulit; pkg lain tetap 40/60), HOTS tidak menumpuk di awal blok; kunci ≤ 24% per huruf; tanpa unsur kepolisian.
- **Anti-bocor:** stem, wacana, peta denah, objek susun, aturan figural, gaya mosaik tidak boleh sama dengan pkg 2–5, 13–18, KCK kal, drill K16.

### 2.2 Kepribadian pkg 14
- KP 48: 6 aspek × 8, blok per aspek (§4.1), kunci = sisi yang paling mengekspresikan aspek blok (memory kepribadian-aspect-key-rule). Likert 4.
- SK 63: dimensi nilai §3.1, aspek Integritas & Kejujuran, acak, butir kembar berjarak ≥ 10 (§3.2); sebaran kunci A/B seimbang.
- Semua butir **baru** (adaptasi ringan dari templat §6.1/6.2), tidak ada stem yang sama dengan 576 KP + 756 SK bank lama. Pembahasan per butir §7.4 lengkap.

### 2.3 Kecermatan pkg 12
Struktur kolom = tabel pedoman Kecermatan (paruh A I–V, paruh B VI–X, masing-masing 5 jenis). Ikon/token/simbol baru, belum pernah dipakai latihan maupun pkg 11; **tanpa ikon mobil polisi** (catatan ¹ pedoman). Donor: HOTS 298, sedang 498, dasar 598. Aksara seed 12.

## 3. Pembagian kerja

| Pekerja | Tugas | Output | Verifikasi Claude |
|---|---|---|---|
| **Codex-1** (write) | 29 butir numerik pkg 19 (57–64, 76–96) + pembahasan §5 + field `h` | `prisma/data/kecerdasan_p19_num.json` | `checkTeks` + `hitung`, baca semua pembahasan, pengecoh = kesalahan bernama, grep A-7 |
| **Codex-2** (write) | 63 butir SK baru + pembahasan §7.4 | `bank/pribadi/sk-sim4-01.json` | `check-bank-pribadi.ts`, baca 63 butir, cek dimensi/kunci/kembar, grep A-7 |
| **Codex-3** (write) | `BLUEPRINT[12]` Kecermatan + jalankan generator + test kunci | `scripts/generate-kecermatan-simulasi.ts`, `public/kecermatan-simulasi/p12/`, `prisma/data/` paket 12 | diff penuh, screenshot 10 kolom, ikon tidak bentrok bank latihan, 10 per huruf per kolom |
| **Codex-4** (read-only) | Cek buta teks pkg 19 (tanpa kunci) + SK pkg 14 | `scratchpad/qa/codex-19.md`, `codex-sk14.md` | bandingkan **alasan** (Q-5) |
| **Claude** | Verbal 25, silogisme 8, wacana 11, KCK 4; semua gambar pkg 19 + `pembahasan_svg` (mosaik 2 gaya baru, `figural-kal-19.ts`, `figural-kal-bundar-19.ts`, susun benda nyata 2, denah `19` di PKGS/PB/NEW); KP 48 `kp-sim4-01.json`; manifest `paket-14.json`; integrasi seed; QA visual 360/520 px | `kecerdasan_p19_teks.json` (gabung output Codex-1), file generator di kolom kiri | `cek-wacana-kal.ts`, `check-kecerdasan-kck.ts`, `seed-kecerdasan-kal.ts --check 19`, `seed-pribadi-paket.ts 14` (dry run) |
| **Subagent Sonnet** | Cek buta gambar pkg 19 dari PNG | `scratchpad/qa/sonnet-gambar-19.md` | setiap beda dibuktikan koordinat |

## 4. Perubahan kode (Claude, sesi 1)
1. `seed-kecerdasan-kal.ts`: daftarkan pkg 19 dengan layout v3 + `SIL_V3` + cek A-7 otomatis (fungsi yang sudah ada untuk pkg ≥ 4).
2. `checkNoLeak` pkg 19 terhadap semua file teks (p2–p5, s2, p15, p16, kck_kal, drill K16).
3. `backfill-pembahasan-kecerdasan.ts`: tambah `kecerdasan_p19_teks.json`.
4. Generator figural/bundar per paket di file baru (`figural-kal-19.ts`, `figural-kal-bundar-19.ts`) — generator induk dekat batas 500 baris.
5. Asersi: pkg lain tetap identik byte setelah generator dijalankan ulang.

## 5. Urutan sesi

| Sesi | Claude | Codex paralel | Selesai bila |
|---|---|---|---|
| **1** (boleh mulai sekarang) | Brief Codex-1/2/3; verbal + bacaan pkg 19; KP 48 pkg 14 | Codex-1 numerik, Codex-2 SK 63, Codex-3 Kecermatan 12 | 3 brief terkirim; verbal lolos `checkTeks`; KP lolos `check-bank-pribadi` |
| **2** | Silogisme + wacana + KCK pkg 19; audit Codex-1/2/3; gabung teks 77 butir; `paket-14.json` | Codex-4 cek buta SK 14 | Teks pkg 19 lengkap; paket 14 dry run OK; Kecermatan 12 lolos test kunci |
| **3** (setelah pkg 4/5 di-commit) | Perubahan kode §4; semua gambar pkg 19 + pembahasan_svg; prototipe gaya mosaik/susun ke pemilik (G-5) | Codex-4 cek buta teks pkg 19 | Gambar lengkap, 360 px bersih, `--check 19` OK |
| **4** | Perbaikan temuan; cek buta gambar (Sonnet); `tsc`, `next build --webpack`; serahkan perintah ke pemilik | — | Pemilik cek localhost → "commit dan push" → pemilik jalankan §5a |

### 5a. Perintah untuk pemilik (urutan wajib)
1. `npx tsx scripts/seed-kecermatan-packages.ts 12` → cek 500/500 di DB
2. `npx tsx scripts/seed-pribadi-paket.ts 14 --apply`
3. `npx tsx scripts/seed-kecerdasan-kal.ts --apply 19`
4. `npx tsx scripts/backfill-pembahasan-kecerdasan.ts` lalu `--apply` → cakupan pkg 19 harus 100/100
5. Edit `SIMULASI_PAKET[4]` (§0) → commit + push → Claude verifikasi kartu 4 terbuka dan `isSimulasiPackage` menolak 19/14/12 di latihan.

## 6. Risiko

| Risiko | Penanganan |
|---|---|
| Bentrok file dengan pkg 4/5 yang belum commit | Gambar/seed Kecerdasan baru di sesi 3, setelah commit pkg 4/5 |
| Teks Codex kaku / pengecoh lemah (terulang di pkg 4/5) | Brief memuat contoh pembahasan baik + D-2; Claude baca semua butir |
| SK Codex melanggar aturan kunci/kembar | `check-bank-pribadi.ts` + cek buta Codex-4 terpisah dari penulis |
| Ikon Kecermatan bocor dari bank latihan | Generator sudah menolak; Claude cek ulang daftar ikon |
| Gaya mosaik mirip paket lama (G-10) | 2 gaya baru, dibandingkan dengan pkg 4/5/15/16 sebelum prototipe |
| Konteks penuh di tengah gambar | Satu generator per jenis, divalidasi sebelum pindah |
