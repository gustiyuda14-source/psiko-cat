# Log infus bank drill

## Batch 1 — K05 Hitung Cepat (33) + K06 Konversi Satuan (23), 2026-10-10

Sumber: Bintara P3 (B3), AKPOL P3 (A3), Bintara P2 (B2). Semua soal diadaptasi (angka/kata diubah), kunci dihitung ulang oleh `hitung` di build.
Pemeriksa kedua: Codex CLI mengerjakan 56 soal tanpa melihat kunci (2026-10-10) — 56/56 sama, semua yakin → status `ganda`.

Perbaikan terhadap sumber:
- B3#41 (sisa 3²¹ : 9¹⁰): sumber tidak punya opsi benar (sisanya 0). Diganti soal siklus sisa 2²⁵ : 7.
- B3#57, B3#59: sumber punya dua opsi benar (x < y dan x ≤ y). Opsi ≤ dihapus; B3#55 sengaja dibuat menguji ≥ (kesamaan di x = 0).
- B3#37: "tidak lebih dari" dibuat menguji batas sama-dengan (√(9/16) = 3/4).

Tidak diinfus di batch ini:
- KD1–KD4, KD15, KD16: duplikat B2#42, 43, 50, 51, 72, 1.
- KD9–KD12 (limit, invers, integral, program linier): di luar profil psikotes POLRI.
- A3#44, A3#45, A3#46, A3#50: strukturnya sama dengan B2#58, B2#51, B2#61, B2#59 yang sudah diadaptasi.
- A3#35, A3#38: belum ditranskrip (menyusul bila kartu K05 butuh tambahan tier 1).

## Batch 2 — K09 Deret Angka & Huruf (16) + K10 Angka dalam Gambar (17), 2026-10-10

Sumber: B3#71–80, A3#51–60, A3#74–75, B2#71–83. Semua angka/huruf diganti; gambar K10 digambar ulang sebagai SVG vektor (`public/drill/img/K10-*.svg`, tajam di resolusi berapa pun).

Perbaikan terhadap sumber:
- B3#79 (jajar genjang 9, 27, 81 → 16, ?, 100): sumber tidak punya opsi benar (pola menghasilkan 40). Diadaptasi dengan rasio konsisten (4, 12, 36 → 5, ?, 45).
- Soal angka-dalam-gambar hanya memberi satu contoh, sehingga beberapa aturan bisa cocok. Angka contoh dipilih supaya aturan alternatif yang wajar gugur, dan pembahasan menyebut aturan alternatif itu beserta hasilnya pada contoh.
- A3#74 (pengurangan kata berkode) aturannya tidak jelas di sumber; diganti kode nilai huruf A = 1 … Z = 26 yang dijelaskan di soal.
- A3#75 (bahasa buatan): susunan kata dibuat konsisten (benda lalu sifat) supaya hanya satu jawaban yang sah.

Tidak diinfus: A3#56 (aturan tidak dapat dipastikan dari satu contoh), A3#61 (duplikat B3#45, sudah di K05), B2#80 dan B2#83 sumber (aturan tidak jelas; B2#83 diganti aturan kali silang yang dijelaskan).

Hasil cek buta Codex batch 2: 32/33 sama kunci. K10-B3-080: aturan Codex sama (√(610−441)=13), hanya salah tulis huruf — kunci tetap E. K10-A3-059: Codex menilai ambigu (tambahan +3,+4,+5 tidak terkait operand) — soal diganti aturan 2a+b (unik untuk 3 contoh linear), dicek ulang Codex: A (37) sama. Semua 33 dinaikkan ke "ganda".

## Batch 3 — K07 Soal Cerita (34) + K08 Silogisme (22) · 2026-10-10

Sumber: B3 61–66, 68, 69; A3 26–34; B2 62–70; Rute 1, 3–9 (K07) · B3 81–85; A3 76–85; B2 84–90 (K08). Adaptasi ringan (nama, angka, konteks diganti; struktur dan sub-task sama).
Dibuang: B3 67 (tanda fungsi rasional) dan B3 70 (sistem barisan) — di luar profil psikotes; Rute 2 (urutan kunjungan desa) — kalimat sumber tidak cukup untuk satu jawaban.
Temuan sumber: B3#66 tidak ada opsi benar (1/3 + 1/4 − 1/4 → 66,67%, tidak ada di opsi) · B3#68 punya dua solusi (2136 dan 3126), diganti aturan unik (2468) · B3#83, A3#78, A3#82, A3#84, A3#85 tidak ada kesimpulan yang sah secara formal di opsi sumber — ditulis ulang dengan kesimpulan sah (A3#82 jadi soal "tidak dapat disimpulkan") · B2#90 opsi "sebagian di kantor" ikut benar — diganti.
Verifikasi: K07 kunci cocok `hitung` (34/34). Cek buta Codex: 54/56 sama. K07-B3-066 ("tidak diterima di kedua jurusan" bisa berarti tidak keduanya sekaligus) dan K08-B2-089 (merah vs kuning tidak eksplisit saling meniadakan) dinilai ambigu — stem diperjelas, dicek ulang Codex: sama, tidak ambigu. Semua 56 dinaikkan ke "ganda".
