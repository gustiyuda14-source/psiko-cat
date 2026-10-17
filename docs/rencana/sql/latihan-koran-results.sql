-- latihan-koran-results.sql — riwayat Tes Koran (Kraepelin/Rekening Koran Mode Tes, Pauli Tes dan Latihan),
-- satu baris per sesi selesai. Untuk dasbor progres di /dashboard/kraepelin; terpisah dari psikogram.
-- Ditulis hanya oleh server (service role) lewat saveKoranResult (app/latihan/fundamental/[kode]/actions.ts);
-- user_id selalu dari token sesi. Angka per kolom/periode datang dari browser (divalidasi parseKoranResult
-- di lib/fundamental.ts, stats dihitung ulang di server): progres latihan, nilai mentah tanpa norma.
-- Aman dijalankan ulang. Jalankan sekali di Supabase SQL Editor (project psiko-cat).

CREATE TABLE IF NOT EXISTS latihan_koran_results (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kode        text        NOT NULL CHECK (kode IN ('koran', 'pauli')),
  mode        text        NOT NULL CHECK (mode IN ('tes', 'latihan')),
  operasi     text        CHECK (operasi IN ('tambah', 'kali')),   -- null untuk Pauli
  per_periode jsonb       NOT NULL CHECK (jsonb_typeof(per_periode) = 'array'),  -- benar per kolom (Kraepelin) / per periode (Pauli)
  stats       jsonb       NOT NULL,                                -- kraepelinStats / pauliStats + salah
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK ((kode = 'koran') = (operasi IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS latihan_koran_results_user_idx
  ON latihan_koran_results (user_id, kode, created_at DESC);

-- Tanpa policy = anon/authenticated tidak bisa membaca atau menulis; service role melewati RLS.
ALTER TABLE latihan_koran_results ENABLE ROW LEVEL SECURITY;

-- Cek:
-- SELECT u.username, r.kode, r.mode, count(*), max(r.created_at) FROM latihan_koran_results r JOIN users u ON u.id = r.user_id GROUP BY 1, 2, 3 ORDER BY 1;
