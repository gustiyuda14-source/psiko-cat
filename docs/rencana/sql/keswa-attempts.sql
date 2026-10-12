-- keswa-attempts.sql — hasil simulasi Keswa (5 cek validitas) per peserta.
-- Maksimal 2 percobaan per (peserta, paket): menyimpan yang ke-3 menghapus yang paling lama
-- (peserta menyetujuinya di layar awal simulasi). Dinilai di server; browser tidak pernah menentukan hasil.
-- Ditulis hanya oleh server (service role) lewat /api/keswa; user_id selalu dari token sesi.
-- Aman dijalankan ulang. Jalankan sekali di Supabase SQL Editor (project psiko-cat).

CREATE TABLE IF NOT EXISTS keswa_attempts (
  id           bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paket        smallint    NOT NULL,
  jawaban      text        NOT NULL,            -- "Y" / "T" / "-" per soal, urut nomor
  hasil        jsonb       NOT NULL,            -- KeswaHasil (lib/keswa-scoring.ts)
  valid        boolean     NOT NULL,
  durasi_detik integer     NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS keswa_attempts_user_paket_idx
  ON keswa_attempts (user_id, paket, submitted_at DESC);

-- Tanpa policy = anon/authenticated tidak bisa membaca atau menulis; service role melewati RLS.
ALTER TABLE keswa_attempts ENABLE ROW LEVEL SECURITY;

-- Simpan satu percobaan lalu sisakan 2 terbaru untuk paket itu, atomik.
CREATE OR REPLACE FUNCTION record_keswa_attempt(p_user text, p_paket smallint, p_jawaban text, p_hasil jsonb, p_valid boolean, p_durasi integer)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE
  new_id bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user || '|keswa|' || p_paket));
  INSERT INTO keswa_attempts (user_id, paket, jawaban, hasil, valid, durasi_detik)
  VALUES (p_user, p_paket, p_jawaban, p_hasil, p_valid, p_durasi)
  RETURNING id INTO new_id;
  DELETE FROM keswa_attempts
  WHERE user_id = p_user AND paket = p_paket
    AND id NOT IN (
      SELECT id FROM keswa_attempts
      WHERE user_id = p_user AND paket = p_paket
      ORDER BY submitted_at DESC, id DESC
      LIMIT 2
    );
  RETURN new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION record_keswa_attempt(text, smallint, text, jsonb, boolean, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_keswa_attempt(text, smallint, text, jsonb, boolean, integer) TO service_role;

-- Cek:
-- SELECT u.username, a.paket, a.valid, a.hasil, a.durasi_detik, a.submitted_at
-- FROM keswa_attempts a JOIN users u ON u.id = a.user_id ORDER BY a.submitted_at DESC;
