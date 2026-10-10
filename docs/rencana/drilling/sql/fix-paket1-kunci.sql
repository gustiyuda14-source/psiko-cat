-- fix-paket1-kunci.sql — perbaikan soal rusak Simulasi Kecerdasan Paket 1
-- (questions.type='KECERDASAN', package_number=1, sequence_number = soal.json id).
-- Sumber: soal.json (sudah diedit sama persis). Semua perbaikan = teks soal/opsi;
-- TIDAK ADA perubahan scoring_rule.correct_key, jadi skor sesi lama tidak berubah.
-- Tiap UPDATE dijaga potongan teks lama -> aman dijalankan ulang (idempoten).
-- Ekspektasi: 15 baris ter-update total (1 per statement). Cek "UPDATE n" tiap statement.
--
-- ===== 0) PRA-CEK (jalankan dulu, read-only) =====
-- a) Pastikan kunci di DB masih sama dengan soal.json (harus 15 baris, semua ok = true):
--   SELECT sequence_number, scoring_rule->>'correct_key' AS kunci_db,
--          scoring_rule->>'correct_key' = v.k AS ok
--   FROM questions q JOIN (VALUES (39,'B'),(44,'E'),(49,'D'),(51,'BD'),(52,'AC'),(57,'BD'),
--        (58,'AD'),(59,'AC'),(66,'A'),(70,'A'),(71,'C'),(72,'D'),(73,'D'),(85,'D'),(86,'E'))
--        AS v(n,k) ON q.sequence_number = v.n
--   WHERE q.type = 'KECERDASAN' AND q.package_number = 1 ORDER BY 1;
--
-- b) Jawaban tersimpan yang terdampak (peserta yang sudah melihat teks lama).
--    Scoring (lib/scoring/runner.ts -> kecerdasan.ts) membandingkan answers.selected_key
--    dengan questions.scoring_rule->>'correct_key' (multi-select = huruf urut, mis. 'BD').
--    Karena kunci tidak diubah, kolom benar_sekarang = benar_setelah_fix.
--   SELECT q.sequence_number,
--          count(a.id)                                                    AS jumlah_jawaban,
--          count(DISTINCT ms.test_session_id)                             AS jumlah_sesi,
--          count(*) FILTER (WHERE a.selected_key = q.scoring_rule->>'correct_key') AS benar_sekarang,
--          count(DISTINCT ms.test_session_id) FILTER (WHERE ts.status IN ('COMPLETED','DISQUALIFIED')) AS sesi_sudah_dinilai
--   FROM questions q
--   JOIN answers a          ON a.question_id = q.id
--   JOIN module_sessions ms ON ms.id = a.module_session_id
--   JOIN test_sessions ts   ON ts.id = ms.test_session_id
--   WHERE q.type = 'KECERDASAN' AND q.package_number = 1
--     AND q.sequence_number IN (39,44,49,51,52,57,58,59,66,70,71,72,73,85,86)
--   GROUP BY q.sequence_number ORDER BY q.sequence_number;
--
-- CATATAN: scripts/seed-kecerdasan.ts & generate-sql.ts meng-UPDATE berdasarkan
-- type + sequence_number TANPA filter package_number -> jika dijalankan ulang akan
-- menimpa paket 2-11 juga. Jangan pakai skrip itu; pakai file ini.

BEGIN;

-- #39: P39 premis diperketat; kunci tetap B
UPDATE questions SET options_payload = jsonb_set(options_payload, '{question_text}', to_jsonb(E'Semua anak kecil tidak suka orang yang tidak pernah memberinya permen.\nLoki tidak pernah memberi adiknya yang masih kecil permen, tetapi sering memberinya balon.\nKesimpulan yang paling tepat adalah …..'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 39
  AND options_payload #>> '{question_text}' LIKE E'%suka orang yang memberikan permen%';

-- #44: tidak terlalu menderita -> tidak menderita; kunci tetap E
UPDATE questions SET options_payload = jsonb_set(options_payload, '{question_text}', to_jsonb(E'Jika semua harta benda Barton terbawa banjir, maka ia menderita.\nBarton tidak menderita.\nKesimpulan yang paling tepat adalah …..'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 44
  AND options_payload #>> '{question_text}' LIKE E'%tidak terlalu menderita%';

-- #49: P49 opsi D; kunci tetap D
UPDATE questions SET options_payload = jsonb_set(options_payload, '{choices,3,text}', to_jsonb(E'Sebagian delegasi dalam pertemuan internasional memiliki rasa percaya diri tinggi dan mampu berkomunikasi dengan baik.'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 49 AND options_payload #>> '{choices,3,key}' = 'D'
  AND options_payload #>> '{choices,3,text}' LIKE E'%percaya diri tidak tinggi%';

-- #51: placeholder L28N yang hilang; kunci tetap BD
UPDATE questions SET options_payload = jsonb_set(options_payload, '{question_text}', to_jsonb(E'H31J | … | P25R | T22V | X19Z | B16D | F13H | J10L | … | R4T'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 51
  AND options_payload #>> '{question_text}' LIKE E'%H31J | P25R%';

-- #52: P52 typo baris 2; kunci tetap AC
UPDATE questions SET options_payload = jsonb_set(options_payload, '{question_text}', to_jsonb(E'Baris 1: 11A | 13B | 15C | … | 19E | 21F | 23G | 25H | 27I | 29J\nBaris 2: N48 | O45 | P42 | … | R36 | S33 | T30 | U27 | V24 | W21'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 52
  AND options_payload #>> '{question_text}' LIKE E'%U37 | V34 | W31%';

-- #57: P57 suku terakhir baris 1 E->C; kunci tetap BD
UPDATE questions SET options_payload = jsonb_set(options_payload, '{question_text}', to_jsonb(E'Baris 1: G | H | K | P | Q | … | Y | … | C\nBaris 2: E | F | I | N | … | R | … | X | A'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 57
  AND options_payload #>> '{question_text}' LIKE E'%Y | … | E%';

-- #58: P58 UW->VW; kunci tetap AD
UPDATE questions SET options_payload = jsonb_set(options_payload, '{question_text}', to_jsonb(E'Berlian atas: ST | WX | AB | … | IJ | MN | QR\nBerlian bawah: JK | NO | RS | VW | ZA | … | HI'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 58
  AND options_payload #>> '{question_text}' LIKE E'%RS | UW | ZA%';

-- #59: P59 112U->102U; kunci tetap AC
UPDATE questions SET options_payload = jsonb_set(options_payload, '{question_text}', to_jsonb(E'Baris 1: B11 | 14D | F17 | 20H | J23 | 26L | … | 32P\nBaris 2: 102U | S99 | 96Q | O93 | 90M | K87 | … | G81'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 59
  AND options_payload #>> '{question_text}' LIKE E'%112U%';

-- #66: P66 keuntungan->keunggulan; kunci tetap A
UPDATE questions SET options_payload = jsonb_set(options_payload, '{instruksi}', to_jsonb(E'Kapal manakah yang tidak memiliki satu pun keunggulan dibandingkan kapal lainnya jika dibeli oleh Raja minyak?'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 66
  AND options_payload #>> '{instruksi}' LIKE E'%tidak memiliki keuntungan%';

-- #70: P71 tambah fakta Benjo Rabu; kunci tetap A
UPDATE questions SET options_payload = jsonb_set(options_payload, '{sub_text}', to_jsonb(E'Tugas piket: Azel, Clara, Enzi (perempuan) dan Benjo, Deri (laki-laki).\n• Setiap hari 3 orang membersihkan kelas (Senin–Jumat).\n• Setiap orang mendapat giliran piket dengan jumlah yang sama.\n• Jumat: Azel dan Deri ikut basket → tidak bisa piket.\n• Senin & Rabu: Clara harus pulang bantu ibu berjualan.\n• Setiap hari harus ada anak laki-laki.\n• Senin & Kamis: Enzi les Bahasa Inggris → tidak bisa piket.\n• Benjo mendapat giliran piket pada hari Rabu.'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 70
  AND options_payload #>> '{sub_text}' LIKE '%Tugas piket:%'
  AND options_payload #>> '{sub_text}' NOT LIKE '%Benjo mendapat giliran piket pada hari Rabu%';

-- #71: P71 tambah fakta Benjo Rabu; kunci tetap C
UPDATE questions SET options_payload = jsonb_set(options_payload, '{sub_text}', to_jsonb(E'Tugas piket: Azel, Clara, Enzi (perempuan) dan Benjo, Deri (laki-laki).\n• Setiap hari 3 orang membersihkan kelas (Senin–Jumat).\n• Setiap orang mendapat giliran piket dengan jumlah yang sama.\n• Jumat: Azel dan Deri ikut basket → tidak bisa piket.\n• Senin & Rabu: Clara harus pulang bantu ibu berjualan.\n• Setiap hari harus ada anak laki-laki.\n• Senin & Kamis: Enzi les Bahasa Inggris → tidak bisa piket.\n• Benjo mendapat giliran piket pada hari Rabu.'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 71
  AND options_payload #>> '{sub_text}' LIKE '%Tugas piket:%'
  AND options_payload #>> '{sub_text}' NOT LIKE '%Benjo mendapat giliran piket pada hari Rabu%';

-- #72: P71 tambah fakta Benjo Rabu; kunci tetap D
UPDATE questions SET options_payload = jsonb_set(options_payload, '{sub_text}', to_jsonb(E'Tugas piket: Azel, Clara, Enzi (perempuan) dan Benjo, Deri (laki-laki).\n• Setiap hari 3 orang membersihkan kelas (Senin–Jumat).\n• Setiap orang mendapat giliran piket dengan jumlah yang sama.\n• Jumat: Azel dan Deri ikut basket → tidak bisa piket.\n• Senin & Rabu: Clara harus pulang bantu ibu berjualan.\n• Setiap hari harus ada anak laki-laki.\n• Senin & Kamis: Enzi les Bahasa Inggris → tidak bisa piket.\n• Benjo mendapat giliran piket pada hari Rabu.'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 72
  AND options_payload #>> '{sub_text}' LIKE '%Tugas piket:%'
  AND options_payload #>> '{sub_text}' NOT LIKE '%Benjo mendapat giliran piket pada hari Rabu%';

-- #73: P73 batasan Divia + typo nama; kunci tetap D
UPDATE questions SET options_payload = jsonb_set(options_payload, '{instruksi}', to_jsonb(E'Dari pernyataan di atas, apabila Emillie tiba di garis finish tepat setelah Clarita dan Divia tiba setelah Bianca, siapakah peserta yang memenangkan perlombaan balap karung?'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 73
  AND options_payload #>> '{instruksi}' LIKE E'%Emmelie%';

-- #85: P85 kali lebih tua -> kali usia; kunci tetap D
UPDATE questions SET options_payload = jsonb_set(options_payload, '{instruksi}', to_jsonb(E'Beberapa tahun yang lalu Romanoff berusia tiga kali usia anaknya. Pada waktu itu usia Romanoff adalah 30 tahun. Bila sekarang usia Romanoff dua kali usia anaknya maka berapa usia Romanoff?'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 85
  AND options_payload #>> '{instruksi}' LIKE E'%tiga kali lebih tua%';

-- #86: P86 diameter->keliling; kunci tetap E
UPDATE questions SET options_payload = jsonb_set(options_payload, '{instruksi}', to_jsonb(E'Danvers berangkat ke kantor naik sepeda. Jarak antara kantor dan rumahnya 3,5 km. Apabila keliling roda sepeda Danvers 70 cm, maka berapa banyak putaran roda sepeda Danvers?'::text)), updated_at = now()
WHERE type = 'KECERDASAN' AND package_number = 1 AND sequence_number = 86
  AND options_payload #>> '{instruksi}' LIKE E'%diameter roda%';


COMMIT;
