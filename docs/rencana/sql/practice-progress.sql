-- practice-progress.sql — progres drill + latihan per peserta (menggantikan localStorage).
-- Satu baris per (peserta, jenis, butir). Ditulis hanya oleh server (service role) lewat
-- /api/drill/check dan /api/progress; user_id selalu dari token sesi, tidak pernah dari browser.
-- Aman dijalankan ulang. Jalankan sekali di Supabase SQL Editor (project psiko-cat).

CREATE TABLE IF NOT EXISTS practice_progress (
  user_id    text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text        NOT NULL CHECK (kind IN ('drill', 'latihan')),
  item_key   text        NOT NULL,            -- drill: id soal; latihan: rute paket, mis. /latihan/kecerdasan/2
  correct    integer     NOT NULL DEFAULT 0 CHECK (correct >= 0),
  attempts   integer     NOT NULL DEFAULT 0 CHECK (attempts >= correct),
  answered   integer     NOT NULL DEFAULT 0 CHECK (answered >= 0),  -- latihan: butir terjauh dalam satu sesi
  last_ms    integer,                          -- drill: lama menjawab percobaan terakhir
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, item_key)
);

-- Tanpa policy = anon/authenticated tidak bisa membaca atau menulis; service role melewati RLS.
ALTER TABLE practice_progress ENABLE ROW LEVEL SECURITY;

-- Satu percobaan drill, atomik (dua klik cepat tidak saling menimpa).
CREATE OR REPLACE FUNCTION record_drill_attempt(p_user text, p_item text, p_correct boolean, p_ms integer)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO practice_progress (user_id, kind, item_key, correct, attempts, last_ms)
  VALUES (p_user, 'drill', p_item, CASE WHEN p_correct THEN 1 ELSE 0 END, 1, p_ms)
  ON CONFLICT (user_id, kind, item_key) DO UPDATE SET
    correct    = practice_progress.correct + EXCLUDED.correct,
    attempts   = practice_progress.attempts + 1,
    last_ms    = EXCLUDED.last_ms,
    updated_at = now();
$$;

-- Capaian latihan: hanya naik, tidak pernah turun.
CREATE OR REPLACE FUNCTION record_latihan_progress(p_user text, p_key text, p_answered integer)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO practice_progress (user_id, kind, item_key, answered)
  VALUES (p_user, 'latihan', p_key, p_answered)
  ON CONFLICT (user_id, kind, item_key) DO UPDATE SET
    answered   = GREATEST(practice_progress.answered, EXCLUDED.answered),
    updated_at = now();
$$;

-- Fungsi bawaan Postgres bisa dipanggil PUBLIC lewat /rest/v1/rpc; tutup, sisakan service role.
REVOKE EXECUTE ON FUNCTION record_drill_attempt(text, text, boolean, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION record_latihan_progress(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_drill_attempt(text, text, boolean, integer) TO service_role;
GRANT EXECUTE ON FUNCTION record_latihan_progress(text, text, integer) TO service_role;

-- Cek:
-- SELECT u.username, p.kind, count(*) FROM practice_progress p JOIN users u ON u.id = p.user_id GROUP BY 1, 2 ORDER BY 1;
