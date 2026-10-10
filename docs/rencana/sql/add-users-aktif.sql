-- add-users-aktif.sql — kolom status akun untuk fitur Kelola Akun (/admin/akun), padanan kolom
-- `aktif` di tabel cest_users (dajiks-cest). Aman dijalankan ulang. Akun yang sudah ada = aktif.
-- Jalankan sekali di Supabase SQL Editor (project psiko-cat).
ALTER TABLE users ADD COLUMN IF NOT EXISTS aktif boolean NOT NULL DEFAULT true;

-- Cek: semua akun aktif, kolom ada.
-- SELECT username, name, role, aktif FROM users ORDER BY created_at;
