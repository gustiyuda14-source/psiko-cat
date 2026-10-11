-- Simulasi Penuh multi-paket (2026-10-11).
-- Nomor paket bank soal Kecerdasan/Kepribadian per sesi simulasi.
-- NULL = sesi lama (Paket 1). Jalankan SEBELUM deploy kode yang membaca kolom ini.
alter table public.module_sessions add column if not exists package_number integer;
