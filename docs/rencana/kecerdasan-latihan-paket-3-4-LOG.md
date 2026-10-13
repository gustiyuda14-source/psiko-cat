# LOG — Latihan Kecerdasan Paket 3 & 4 (pkg 4 & 5)

Rencana: `kecerdasan-latihan-paket-3-4.md`. Entri terbaru di paling bawah.

## Sesi 0 — 2026-10-13 (perencanaan)
**Selesai:**
- Ultra plan ditulis.
- Pedoman utama diperbarui dengan A-7 (tanpa unsur kepolisian).
- Pedoman Kecerdasan v3 sudah berlaku: kecukupan data 4 butir di 97–100, silogisme §4.8.

**File berubah (belum commit):**
- `docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md`
- `docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md`
- `docs/pedoman/PEDOMAN_ENGINE_PRIBADI.md`
- `docs/pedoman/PEDOMAN_SIMULASI_KECERMATAN.md`
- `docs/rencana/kecerdasan-latihan-paket-3-4.md`
- `docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md`

**Codex:** belum ada job.

**Keputusan pemilik:**
- Soal lama yang masih memuat unsur kepolisian dibiarkan.
- Kerja dibagi dengan Codex.
- Setiap sesi berhenti di ±120k token.

**Langkah berikut:** Sesi 1 sesuai rencana §5.

### Prompt lanjutan
```
Lanjutkan Ultra Plan Latihan Kecerdasan Paket 3 & 4 (package_number 4 & 5) di psiko-cat.
Baca dulu: docs/rencana/kecerdasan-latihan-paket-3-4.md, entri terakhir di
docs/rencana/kecerdasan-latihan-paket-3-4-LOG.md, docs/pedoman/PEDOMAN_UTAMA_PENYUSUNAN_SOAL.md
(terutama A-7 tanpa unsur kepolisian, §5, §10) dan docs/pedoman/PEDOMAN_SIMULASI_KECERDASAN.md v3.
Kerjakan Sesi 1:
1. Perubahan kode rencana §4.1–4.6 (layout v3 di seed-kecerdasan-kal.ts untuk pkg 4/5,
   INSTRUKSI.SIL_V3, cek A-7 otomatis, anti-bocor, backfill). Paket lama harus tetap lolos validasi.
2. Tulis brief Codex-1 (52 butir numerik pkg 4 & 5) dan Codex-2 (4 objek susun), lalu jalankan
   keduanya di background dengan codex exec -s workspace-write.
3. Sambil menunggu: susun verbal + bacaan pkg 4 (25 butir) beserta pembahasan, lolos checkTeks.
Aturan: split dengan Codex; berhenti di ±120k token di titik aman, tulis entri LOG Sesi 1 +
prompt lanjutan Sesi 2; tidak menulis DB; commit hanya setelah aku bilang "commit dan push".
```
