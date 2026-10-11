-- latihan-attempts.sql — jawaban latihan yang sudah dikumpulkan, supaya pembahasannya bisa dibuka lagi.
-- Maksimal 2 percobaan per (peserta, paket): menyimpan yang ke-3 menghapus yang paling lama
-- (peserta menyetujuinya dulu di layar selesai latihan). Kunci jawaban TIDAK disimpan;
-- pembahasan dihitung ulang dari bank soal saat dibuka (/latihan/pembahasan/[id]).
-- Ditulis hanya oleh server (service role) lewat /api/progress; user_id selalu dari token sesi.
-- Aman dijalankan ulang. Jalankan sekali di Supabase SQL Editor (project psiko-cat).

CREATE TABLE IF NOT EXISTS latihan_attempts (
  id           bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_key     text        NOT NULL,            -- rute paket, mis. /latihan/kecerdasan/2
  answers      jsonb       NOT NULL,            -- { question_id: pilihan | null }
  timed        boolean     NOT NULL DEFAULT false, -- Kecermatan: mode timer per kolom
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS latihan_attempts_user_key_idx
  ON latihan_attempts (user_id, item_key, submitted_at DESC);

-- Tanpa policy = anon/authenticated tidak bisa membaca atau menulis; service role melewati RLS.
ALTER TABLE latihan_attempts ENABLE ROW LEVEL SECURITY;

-- Simpan satu percobaan lalu sisakan 2 terbaru untuk paket itu, atomik
-- (dua kiriman bersamaan tidak bisa menyisakan 3 baris).
CREATE OR REPLACE FUNCTION record_latihan_attempt(p_user text, p_key text, p_answers jsonb, p_timed boolean)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE
  new_id bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user || '|' || p_key));
  INSERT INTO latihan_attempts (user_id, item_key, answers, timed)
  VALUES (p_user, p_key, p_answers, p_timed)
  RETURNING id INTO new_id;
  DELETE FROM latihan_attempts
  WHERE user_id = p_user AND item_key = p_key
    AND id NOT IN (
      SELECT id FROM latihan_attempts
      WHERE user_id = p_user AND item_key = p_key
      ORDER BY submitted_at DESC, id DESC
      LIMIT 2
    );
  RETURN new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION record_latihan_attempt(text, text, jsonb, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_latihan_attempt(text, text, jsonb, boolean) TO service_role;

-- Cek:
-- SELECT u.username, a.item_key, count(*), max(a.submitted_at)
-- FROM latihan_attempts a JOIN users u ON u.id = a.user_id GROUP BY 1, 2 ORDER BY 1, 2;
