-- latihan-kecermatan-scores.sql — skor latihan Kecermatan mode timer per kolom, satu baris per sesi selesai.
-- Untuk grafik tren di Beranda. Ditulis hanya oleh server (service role) lewat scoreLatihanKecermatan
-- (app/latihan/[module]/actions.ts); user_id selalu dari token sesi.
-- Statistik per kolom datang dari browser: cukup untuk progres latihan, bukan nilai resmi.
-- Aman dijalankan ulang. Jalankan sekali di Supabase SQL Editor (project psiko-cat).

CREATE TABLE IF NOT EXISTS latihan_kecermatan_scores (
  id         bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    text         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_key   text         NOT NULL,            -- rute paket, mis. /latihan/kecermatan-angka/3
  ke_index   numeric(5,2) NOT NULL,
  kt_index   numeric(5,2) NOT NULL,
  kh_index   numeric(5,2) NOT NULL,
  raw_score  numeric(5,2) NOT NULL,            -- Nilai Murni 0-100
  total_klik integer      NOT NULL CHECK (total_klik BETWEEN 0 AND 500),
  total_benar integer     NOT NULL CHECK (total_benar BETWEEN 0 AND total_klik),
  created_at timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS latihan_kecermatan_scores_user_idx
  ON latihan_kecermatan_scores (user_id, created_at DESC);

-- Tanpa policy = anon/authenticated tidak bisa membaca atau menulis; service role melewati RLS.
ALTER TABLE latihan_kecermatan_scores ENABLE ROW LEVEL SECURITY;

-- Cek:
-- SELECT u.username, count(*), max(s.raw_score) FROM latihan_kecermatan_scores s JOIN users u ON u.id = s.user_id GROUP BY 1 ORDER BY 1;
