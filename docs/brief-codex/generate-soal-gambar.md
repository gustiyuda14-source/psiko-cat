# Brief Codex CLI — Generate Bank Drill Soal Gambar (susun_gambar + pola_gambar)

Repo: psiko-cat (Next.js). Kamu bekerja HANYA di file lokal. Sandbox kamu tidak bisa commit dan tidak bisa akses network — jangan coba keduanya. Controller (Claude) akan audit diff dan commit atas namamu.

## Konteks

Bank drill Kecerdasan butuh soal gambar original sejenis Psikotes POLRI. Dua engine sudah ada dan lolos self-check:

- `scripts/generate-soal-susun-gambar.ts` — susun potongan gambar (pita vertikal). Uniqueness: garis yang melintasi semua pita punya ketinggian berbeda ≥16px di setiap batas potong, jadi cuma satu urutan yang menyambung.
- `scripts/generate-soal-pola-gambar.ts` — pola gambar, 4 family: sequence-rotation, satellite-orbit, matrix-overlay (OR/XOR), analogy. Figure = state object → SVG. Jawaban dari rule; tiap distraktor merusak TEPAT SATU layer aturan. `assemble()` meng-assert: 5 opsi beda (state + SVG), uniqueness lewat brute-force grid aturan alternatif, tiap layer aktif terlihat di stimulus.
- Cek: `npm run check:soal-gambar` (harus tetap lulus setelah perubahanmu).

Format output item (sama dengan `soal.json`, ditambah field drill):

```json
{ "id": 5001, "aspek": "logis", "tipe": "susun_gambar" | "pola_gambar", "family": "…",
  "instruksi": "…", "gambar": "<svg …>…</svg>", "pilihan": {"a":"…",…,"e":"…"},
  "kunci": ["c"], "ganda": false, "pembahasan": "paragraf 1<br>paragraf 2" }
```

Aturan wajib (dari `RULES GENERATE SOAL SPASIAL.md` di root repo + temuan analisis):

1. SVG murni self-contained: `viewBox`, tanpa `<script>`, tanpa href eksternal, tanpa `<foreignObject>`. Semua `id` di-prefix id item (banyak SVG dirender di satu halaman pembahasan).
2. Pembahasan maksimal 2 paragraf dipisah `<br>`: P1 = ekstraksi aturan per objek; P2 = "Opsi X gugur karena …" untuk keempat distraktor, lalu kunci.
3. Tiap distraktor merusak tepat satu layer. Rotasi dinormalisasi ke simetri bangun (persegi 90°, segitiga 120°, …) — jangan sampai ada dua opsi tampil identik (bug lama soal.json #31).
4. Opsi susun_gambar wajib permutasi valid 1..n (tidak ada angka dobel/hilang — bug di PDF sumber #34 opsi e).
5. Kunci tersebar merata a–e; deterministik per seed.
6. Jangan sentuh `soal.json`, `prisma/data/bank_soal_*.json`, DB, atau file app/. Jangan tambah dependency.

## Fase A — kerjakan sekarang (kode)

### A1. pola_gambar: tambah 5 family baru di `generate-soal-pola-gambar.ts`

Ikuti pola `FAMILIES` yang ada; invariants `assemble()` jangan dilemahkan.

| Family | Aturan | Distraktor (1 layer) |
|---|---|---|
| `position-walk` | token hitam berjalan di sel perimeter grid 3×3 (atau kotak 4 sudut) dengan langkah konstan k, dibaca urut baca | kurang 1 langkah, lebih 1 langkah, arah terbalik, urutan baca salah |
| `latin-square` | 3×3, tiap baris memuat tiap nilai atribut (bentuk × isian) tepat sekali | atribut bentuk salah, isian salah, sel duplikat baris, duplikat kolom |
| `matrix-subtract` | kolom 3 = kolom 1 − kolom 2 (primitif) | pakai OR, pakai XOR, sisa primitif hilang, primitif ekstra |
| `nesting-cycle` | 3 bangun bersarang (luar/tengah/dalam) bergeser siklik satu tingkat per langkah | tidak bergeser, bergeser 2, arah terbalik, satu tingkat salah isian |
| `odd-rotation` | 4 opsi rotasi dari figur asimetris, 1 cerminan; soal: "pilih yang berbeda" — perlu refleksi di state model + kunci berbasis chirality | (di sini distraktor = rotasi sah; kunci = cerminan) |

Tambah juga bounding-box assertion (titik di dalam kotak, bangun dalam di dalam inradius bangun luar) karena kamu tidak bisa melihat gambar.

### A2. susun_gambar: variasi di `generate-soal-susun-gambar.ts`

- Minimal 6 template scene prosedural (sekarang 1): bukit+rumah+pohon (ada), kota (gedung + jalan), laut (kapal + garis ombak), rel (kereta + rel), taman (pagar + bunga), pegunungan (puncak + sungai berliku). Tiap scene wajib punya satu struktur kontinu melintasi seluruh lebar + 1–2 objek penanda yang terbelah di batas potong.
- Lebar pita boleh tidak sama (gaya p100), tetap pita vertikal tanpa rotasi.
- Distraktor dari pola sumber: tukar 2 pita bertetangga, tukar 2 ujung, geser siklik, urutan 1..n / terbalik, pindah satu pita. Hindari distraktor yang ternyata juga menyambung.
- Uniqueness check lama (ketinggian beda ≥16px, per pasangan pita) wajib berlaku di semua scene.

### A3. Mode batch

Tambah flag `--batch` ke kedua script:

- susun: `--batch --count 60 --start-id 5001 --out prisma/data/drill/soal-gambar-susun.json` (rata di 6 scene, n = 4–6).
- pola: `--batch --per-family 20 --start-id 6001 --out prisma/data/drill/soal-gambar-pola.json` (9 family × 20 = 180).
- Keduanya juga tulis `output/drill-preview/<tipe>.html` (grid semua item + kunci + gambar "dirakit dari kunci" untuk susun) supaya controller bisa review visual.
- Seed per item disimpan di field `seed` (untuk regenerate).

### Kriteria selesai Fase A

1. `npm run check:soal-gambar` lulus (≥300 seed per family, ≥500 seed susun).
2. `npx tsc --noEmit -p .` dan `npx eslint scripts/generate-soal-*.ts` bersih.
3. File batch + preview terbentuk; tiap file JSON valid, id unik, kunci tersebar a–e (laporkan distribusinya).
4. Tiap script tetap < 500 baris; kalau lewat, pecah helper ke `scripts/soal-gambar/` (mis. `svg.ts`, `rng.ts`) — jangan duplikasi kode.
5. Laporan akhir ke file output: daftar file berubah, jumlah item per family/scene, distribusi kunci, batasan yang diketahui.

## Fase B — JANGAN dikerjakan sekarang (butuh keputusan user)

Varian susun_gambar berbasis gambar realistis via `image_generation`: line-art/siluet monokrom original (tanpa teks, tanpa likeness orang nyata, tanpa memakai gambar PDF sumber sebagai input), struktur kontinu selebar gambar, pemotongan tetap oleh kode (data URI di `<defs>`), gerbang edge-match (urutan benar harus ≥20% lebih baik dari permutasi lain; tolak tepi hampir kosong), ≤100 KB per gambar, simpan prompt + seed.
