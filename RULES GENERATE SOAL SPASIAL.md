# SOP Pembuatan Soal Spasial Berbasis SVG & Kurikulum Pembahasan
**Dokumen Referensi: Arsitektur TIU Spasial CAT Psiko Modern**

Dokumen ini mendefinisikan standar teknis pembuatan gambar vektor (SVG) dan aturan baku penulisan pembahasan untuk bank soal kemampuan keruangan (spasial). Standar ini mengeliminasi metode lawas (seperti tes gambar manual) dan menggantinya dengan matriks rotasi mental presisi tinggi yang kompatibel dengan antarmuka digital.

---

## 1. Arsitektur Visual & Standar SVG
Semua stimulus gambar dan opsi jawaban wajib menggunakan format *Scalable Vector Graphics* (SVG) kode murni (Deklaratif XML) tanpa ketergantungan *file* eksternal.

* **ViewBox Independen:** SVG harus menggunakan atribut `viewBox` (misal: `viewBox="0 0 800 450"`) agar bersifat responsif secara absolut dan tidak pecah saat diakses melalui perangkat *mobile* maupun *desktop*.
* **Modularitas Komponen (JSX Ready):** Gunakan tag `<defs>` untuk mendefinisikan bangun utama (master) dan panggil menggunakan tag `<use>`. Ini meminimalkan ukuran kode dan memudahkan konversi ke komponen React/Next.js.
* **Atribut Styling Global:** Hindari *inline style* yang berlebihan. Gunakan blok `<style>` di dalam SVG untuk mendefinisikan *class* standar:
    * `.box`: Bingkai luar (stroke seragam, no fill).
    * `.solid`: Bangun dengan warna isi penuh (fill absolut).
    * `.outline`: Bangun garis tepi (fill transparan/putih, stroke tebal).
* **Akurasi Geometris:** Transformasi (rotasi, translasi, skala) diwajibkan menggunakan atribut `transform="rotate(deg) translate(x,y) scale(n)"` untuk memastikan koordinat matematis yang presisi tanpa halusinasi visual.

---

## 2. Hierarki Kesulitan (HOTS Spatial Logic)
Untuk soal level HOTS, setiap perubahan dari *frame* stimulus ke *frame* berikutnya wajib memuat minimal 3 (tiga) dari 5 (lima) *layer* transformasi simultan berikut:
1.  **Rotasi Absolut:** Perputaran objek sumbu X, Y, atau Z (contoh: $90^\circ$, $180^\circ$, $270^\circ$).
2.  **Topologi Terbalik (Inversion):** Pertukaran posisi antara objek *inner* (dalam) dan *outer* (luar).
3.  **Inversi Soliditas:** Perubahan status visual dari objek solid (hitam penuh) menjadi objek *outline* (hanya garis tepi), atau sebaliknya.
4.  **Orbit Satelit:** Pergerakan elemen minor (titik/garis kecil) mengelilingi pusat atau berpindah sudut secara berurutan (searah/berlawanan arah jarum jam).
5.  **Konservasi Kuantitas:** Penambahan atau pengurangan jumlah elemen yang bersifat deterministik (deret hitung matematis).

---

## 3. Sistematika Pembahasan (The 2-Paragraph Rule)
Penjelasan soal harus dirancang untuk efisiensi kognitif peserta saat membaca di layar ujian. Pembahasan **mutlak dibatasi maksimal 2 paragraf** menggunakan analogi deduktif (mudah dipahami) namun berstruktur sangat logis.

### Paragraf 1: Ekstraksi Pola (Pattern Recognition)
* **Fungsi:** Menguraikan "aturan main" dari stimulus secara eksplisit.
* **Struktur:** Sebutkan objek satu per satu secara spesifik (misal: "bangun terluar", "panah di dalam", "titik satelit") beserta transformasi yang dialaminya (arah rotasi, perubahan ukuran, perubahan warna). 
* **Gaya Bahasa:** Langsung pada intinya (misal: *"Untuk memecahkan matriks ini, terapkan tiga aturan: bangun terluar menyusut ke dalam dan menjadi solid..."*).

### Paragraf 2: Eliminasi Multi-Opsi & Konklusi (Rapid Elimination)
* **Fungsi:** Menggugurkan *distractor* (pengecoh) dan mengunci jawaban yang benar berdasarkan aturan pada Paragraf 1.
* **Struktur:** Jangan hanya menjelaskan jawaban yang benar. Jabarkan secara cepat alasan matematis/visual mengapa 4 opsi lainnya salah secara spesifik.
* **Gaya Bahasa:** Cepat dan mengunci (misal: *"Opsi A dan B gugur karena arah rotasi keliru, Opsi C salah karena pergerakan titik berlawanan, dan Opsi E gagal menginversi warna. Maka, satu-satunya matriks yang konsisten adalah Opsi D."*).

---

## 4. Templat Dasar SVG Soal Analogi
Berikut adalah struktur kerangka dasar yang harus di-copy-paste sebelum melakukan *generate* soal analogi baru:

```xml
<svg viewBox="0 0 850 450" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  <rect width="100%" height="100%" fill="white"/>
  <style>
    .box { fill: none; stroke: #333; stroke-width: 4; }
    .solid { fill: black; stroke: none; }
    .outline { fill: none; stroke: black; stroke-width: 4; stroke-linejoin: round; }
    .text-label { font-family: sans-serif; font-size: 24px; font-weight: bold; text-anchor: middle; }
    .text-symbol { font-family: sans-serif; font-size: 50px; font-weight: bold; text-anchor: middle; }
  </style>

  <defs>
    </defs>

  </svg>