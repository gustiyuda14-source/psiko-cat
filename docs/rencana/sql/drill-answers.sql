-- drill-answers.sql — log opsi yang dipilih peserta di drill, untuk analisis pengecoh (/admin/pengecoh).
-- Satu baris per Periksa. Ditulis hanya oleh server (service role) lewat /api/drill/check; user_id dari token sesi.
-- `versi` = sidik jari stem+opsi+kunci saat dijawab (lib/drill-bank.ts drillVersi): soal yang diedit mulai
-- dari nol, jawaban lama tidak tercampur. Aman dijalankan ulang. Jalankan sekali di Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS drill_answers (
  id         bigserial   PRIMARY KEY,
  user_id    text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id    text        NOT NULL,
  versi      text        NOT NULL,
  pilihan    text        NOT NULL CHECK (pilihan ~ '^[a-e]{1,2}$'),
  correct    boolean     NOT NULL,
  ms         integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS drill_answers_item ON drill_answers (item_id, versi);

-- Tanpa policy = anon/authenticated tidak bisa membaca atau menulis; service role melewati RLS.
ALTER TABLE drill_answers ENABLE ROW LEVEL SECURITY;

-- Rekap per opsi: hanya percobaan PERTAMA tiap peserta (percobaan ulang sudah melihat kunci) dan hanya role peserta.
CREATE OR REPLACE VIEW drill_answer_stats WITH (security_invoker = true) AS
SELECT item_id, versi, pilihan, count(*)::int AS n
FROM (
  SELECT DISTINCT ON (d.user_id, d.item_id, d.versi) d.item_id, d.versi, d.pilihan
  FROM drill_answers d JOIN users u ON u.id = d.user_id AND u.role = 'peserta'
  ORDER BY d.user_id, d.item_id, d.versi, d.created_at
) first_try
GROUP BY item_id, versi, pilihan;

REVOKE ALL ON drill_answers, drill_answer_stats FROM PUBLIC, anon, authenticated;
NOTIFY pgrst, 'reload schema';

-- Cek:
-- SELECT item_id, pilihan, n FROM drill_answer_stats ORDER BY item_id, pilihan LIMIT 50;
