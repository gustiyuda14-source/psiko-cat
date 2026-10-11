# Bank drill — skema & aturan

Satu file per kartu: `bank/drill/<modul>/<KARTU>-<nama>.json` = array item.
`npm run build:drill` memvalidasi semua file lalu menulis `data/drill-bank.json` (dibaca server saja; kunci dan pembahasan tidak pernah dikirim ke browser).
Soal tidak di-seed ke tabel `questions`. Ubah soal = edit JSON → build → commit.

## Item

```json
{
  "id": "K05-B3-041",              // <kartu>-<sumber>-<nnn>; soal tulisan baru: <kartu>-N-<nnn>
  "kartu": "K05",                  // K01..K16 (daftar di lib/drill-cards.ts)
  "sub_type": "NUM-HIT-TEORI",     // kode taksonomi docs/rencana/drilling/02, harus milik kartunya
  "tier": 3,                       // 1 Dasar · 2 Menengah · 3 Lanjut
  "sumber": "B3#41",               // asal struktur soal (P1, B2, B3, A3, KD, R, MB + nomor); "baru" bila original
  "instruksi": "…",                // opsional
  "stem": "…",                     // teks soal (Unicode: −, ×, √, ∛, ², ⅓)
  "rumus": "<math display=\"block\">…</math>",  // opsional, MathML murni untuk bentuk bertingkat
  "gambar": null,                  // opsional, path relatif public/ (mis. "drill/img/K12-A3-091.png")
  "opsi": {"a": "…", "b": "…", "c": "…", "d": "…", "e": "…"},
  "kunci": ["b"],                  // 1 huruf; 2 huruf untuk format pilih-dua
  "hitung": "…",                   // opsional, ekspresi JS yang menghasilkan nilai opsi benar
  "nilai_opsi": {"a": 1, "b": "=2/3"},           // wajib bila ada hitung; awalan "=" = ekspresi
  "pembahasan": "Paragraf 1<br>Paragraf 2",
  "status_kunci": "hitung"         // resmi | ganda | hitung | tunggal
}
```

`hitung` boleh memakai `Math`, `pilih(pred)` (nilai satu-satunya opsi yang memenuhi), `terbesar()`, `terkecil()`.

## Status kunci

| status | arti | ikut build rilis? |
|---|---|---|
| `resmi` | kunci dari dokumen sumber, sudah dicek ulang | ya |
| `ganda` | dua pemeriksa independen (Claude + Codex, tanpa saling melihat) sepakat | ya |
| `hitung` | kunci cocok dengan `hitung`, belum dicek pemeriksa kedua | hanya `--draft` |
| `tunggal` | baru satu pemeriksa | hanya `--draft` |

## Aturan isi

- **Adaptasi ringan**: angka, kata, dan gambar diubah dari sumber; struktur, sub-task, dan tingkat kesulitan dipertahankan. Wacana ditulis ulang. Tanpa logo/merek/foto asli.
- **Pengecualian `MB`** (soal Mr Badrun, mentor utama psikologi): dimasukkan apa adanya, tanpa adaptasi dan tanpa cek buta (keabsahan dijamin mentor), status `resmi`. Yang disesuaikan hanya format (koma desimal, pembahasan 2 paragraf) dan posisi opsi diacak supaya kunci tersebar.
- Soal simulasi Paket 1 (`soal.json`) tidak boleh masuk drill (dicek otomatis).
- Tepat satu jawaban benar; opsi a–e tidak kembar; posisi kunci tersebar.
- Setiap pengecoh mewakili satu kesalahan nyata (salah urutan operasi, salah konversi, salah tanda, …).
- Pembahasan 2 paragraf: (1) langkah penyelesaian; (2) `Opsi X gugur karena …` untuk setiap opsi salah, lalu `Jawaban: …` dan `Tips: …`.
- Gambar: SVG (vektor, tajam di resolusi berapa pun) untuk bentuk geometris; raster hanya untuk siluet/ilustrasi, master 4K (3840 px) disimpan, yang disajikan diperkecil sesuai kebutuhan tampilan.
