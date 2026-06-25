BEGIN;

UPDATE questions 
SET options_payload = '{"question_text":"Jika Banner rajin masuk kerja, maka Banner akan mendapatkan bonus dari pimpinan.\nBanner tidak mendapatkan bonus dari pimpinan.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Banner rajin masuk kerja dan tidak dapat bonus."},{"key":"B","text":"Banner tidak rajin masuk kerja dan mendapatkan bonus."},{"key":"C","text":"Banner rajin masuk kerja."},{"key":"D","text":"Banner tidak rajin masuk kerja."},{"key":"E","text":"Banner kadang-kadang tidak dapat bonus."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 38;
UPDATE questions 
SET options_payload = '{"question_text":"Semua anak kecil suka orang yang memberikan permen.\nLoki tidak pernah membelikan adiknya permen tetapi sering membelikannya balon.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Loki sayang kepada adiknya."},{"key":"B","text":"Loki tidak disukai adiknya."},{"key":"C","text":"Loki tidak suka permen."},{"key":"D","text":"Adik Loki suka balon."},{"key":"E","text":"Adik Loki tidak suka permen dan balon."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 39;
UPDATE questions 
SET options_payload = '{"question_text":"Peserta seleksi mengikuti tes tertulis dan wawancara.\nSayangnya, Danvers dinyatakan tidak lulus seleksi.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Danvers bukan peserta seleksi yang mengikuti tes tertulis dan wawancara."},{"key":"B","text":"Danvers tidak mengikuti tes tertulis dan wawancara."},{"key":"C","text":"Danvers tidak ikut seleksi."},{"key":"D","text":"Danvers telah mengikuti tes tertulis dan wawancara."},{"key":"E","text":"Danvers tidak ikut tes tertulis."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 40;
UPDATE questions 
SET options_payload = '{"question_text":"Semua anggota Polri pandai menembak dan lihai berkendara.\nMeskipun Loki kurang lihai dalam berkendara, namun ia pandai menembak.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Loki seorang anggota Polri yang kurang lihai berkendara."},{"key":"B","text":"Loki bukan anggota Polri meski pandai menembak."},{"key":"C","text":"Loki seorang anggota Polri yang pandai menembak."},{"key":"D","text":"Loki bukan anggota Polri yang teladan."},{"key":"E","text":"Loki bukan anggota Polri yang lihai dalam berkendara."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 41;
UPDATE questions 
SET options_payload = '{"question_text":"Sebagian diplomat menguasai lebih dari satu bahasa.\nSemua yang menguasai lebih dari satu bahasa pandai berbicara.\nKesimpulan dari kalimat di atas adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Yang menguasai beberapa bahasa adalah diplomat."},{"key":"B","text":"Sebagian yang pandai bicara adalah diplomat."},{"key":"C","text":"Semua diplomat pandai berbicara."},{"key":"D","text":"Semua yang pandai berbicara adalah diplomat."},{"key":"E","text":"Sebagian diplomat menguasai satu bahasa."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 42;
UPDATE questions 
SET options_payload = '{"question_text":"Sebagian vokalis band membuat lirik lagunya sendiri.\nBarton adalah seorang vokalis band.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Barton sangat mahir membuat lirik lagu."},{"key":"B","text":"Barton tidak membuat lirik lagunya sendiri."},{"key":"C","text":"Barton mungkin membuat lirik lagunya sendiri."},{"key":"D","text":"Barton pasti membuat lirik lagunya sendiri."},{"key":"E","text":"Membuat lirik lagu bukan keahlian Barton."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"C"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 43;
UPDATE questions 
SET options_payload = '{"question_text":"Jika semua harta benda Barton terbawa banjir, maka ia menderita.\nBarton tidak terlalu menderita.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Semua harta benda Barton tidak terbawa banjir."},{"key":"B","text":"Ada harta benda Barton yang tidak terkena banjir."},{"key":"C","text":"Semua harta benda Barton terkena banjir."},{"key":"D","text":"Tidak ada banjir."},{"key":"E","text":"Ada harta benda Barton yang tidak terbawa banjir."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 44;
UPDATE questions 
SET options_payload = '{"question_text":"Beberapa naskah drama diletakkan di rak.\nSemua naskah drama sudah tidak digunakan lagi.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Semua naskah drama yang sudah tidak digunakan lagi diletakkan di lemari."},{"key":"B","text":"Beberapa naskah drama diletakkan di rak dan sudah tidak digunakan lagi."},{"key":"C","text":"Semua naskah drama diletakkan di rak dan sudah tidak digunakan lagi."},{"key":"D","text":"Tidak ada naskah drama yang diletakkan di rak dan sudah tidak digunakan lagi."},{"key":"E","text":"Beberapa naskah drama sudah tidak digunakan lagi diletakkan di lemari."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 45;
UPDATE questions 
SET options_payload = '{"question_text":"Setiap anggota grup bola basket adalah anggota grup bola voli.\nSetiap anggota grup bola voli adalah anggota grup bola pingpong.\nKesimpulan dari kalimat di atas adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Tidak mungkin ada anggota grup basket yang bukan anggota grup bola pingpong."},{"key":"B","text":"Mungkin ada anggota grup bola basket yang bukan anggota grup bola pingpong."},{"key":"C","text":"Tidak mungkin ada anggota grup bola pingpong yang merupakan anggota grup bola basket."},{"key":"D","text":"Tidak mungkin ada anggota grup bola pingpong yang merupakan anggota grup bola voli."},{"key":"E","text":"Mungkin ada anggota grup bola pingpong yang bukan anggota grup bola basket."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 46;
UPDATE questions 
SET options_payload = '{"question_text":"Tidak ada pengguna internet yang gagap teknologi.\nSebagian dari pengguna internet memiliki telepon canggih.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Semua orang memiliki telepon canggih tidak gagap teknologi."},{"key":"B","text":"Sebagian orang yang memiliki telepon canggih gagap teknologi."},{"key":"C","text":"Sebagian orang yang memiliki telepon canggih tidak gagap teknologi."},{"key":"D","text":"Semua pengguna internet yang gagap teknologi tidak memiliki telepon canggih."},{"key":"E","text":"Sebagian orang yang tidak memiliki telepon canggih gagap teknologi."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"C"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 47;
UPDATE questions 
SET options_payload = '{"question_text":"Seluruh perwira baru wajib mengikuti latihan tempur.\nSebagian perwira baru mengunjungi asrama.\nKesimpulan dari kalimat di atas adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Sebagian perwira baru yang tidak mengunjungi asrama tidak mengikuti latihan tempur."},{"key":"B","text":"Seluruh perwira baru yang mengikuti latihan tempur tidak mengunjungi asrama."},{"key":"C","text":"Sebagian perwira baru yang tidak mengikuti latihan tempur mengunjungi asrama."},{"key":"D","text":"Perwira baru yang mengunjungi asrama mengikuti latihan tempur."},{"key":"E","text":"Perwira baru yang tidak mengunjungi asrama tidak mengikuti latihan tempur."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 48;
UPDATE questions 
SET options_payload = '{"question_text":"Semua delegasi dalam pertemuan internasional mampu berkomunikasi dengan baik.\nSebagian delegasi dalam pertemuan internasional memiliki rasa percaya diri tinggi.\nKesimpulan dari kalimat di atas adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Semua delegasi dalam pertemuan internasional memiliki rasa percaya diri tinggi."},{"key":"B","text":"Sebagian delegasi dalam pertemuan internasional memiliki rasa percaya diri tinggi dan tidak mampu berkomunikasi dengan baik."},{"key":"C","text":"Semua delegasi dalam pertemuan internasional memiliki rasa percaya diri tinggi dan tidak mampu berkomunikasi dengan baik."},{"key":"D","text":"Sebagian delegasi dalam pertemuan internasional memiliki rasa percaya diri tidak tinggi dan mampu berkomunikasi dengan baik."},{"key":"E","text":"Sebagian delegasi dalam pertemuan internasional yang memiliki kemampuan komunikasi tidak baik juga memiliki rasa percaya diri tinggi."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 49;
UPDATE questions 
SET options_payload = '{"question_text":"Banyak buku pelajaran SMP di Yogyakarta menggunakan Bahasa Indonesia.\nStark membeli buku sejarah untuk SMP di Yogyakarta.\nKesimpulan yang paling tepat adalah …..","svg_content":null,"instruksi":"Pilihlah satu jawaban yang tepat untuk menyimpulkan pernyataan berikut.","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Pasti Stark membeli buku sejarah menggunakan Bahasa Indonesia."},{"key":"B","text":"Mungkin Stark membeli buku sejarah menggunakan Bahasa Indonesia."},{"key":"C","text":"Stark hanya membeli buku yang berbahasa Indonesia."},{"key":"D","text":"Stark tidak mungkin membeli buku sejarah selain yang menggunakan Bahasa Indonesia."},{"key":"E","text":"Buku sejarah Stark berbahasa Indonesia."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 50;
UPDATE questions 
SET options_payload = '{"question_text":"H31J | P25R | T22V | X19Z | B16D | F13H | J10L | … | R4T","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"L26N"},{"key":"B","text":"N7P"},{"key":"C","text":"N7B"},{"key":"D","text":"L28N"},{"key":"E","text":"M7P"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"BD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 51;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: 11A | 13B | 15C | … | 19E | 21F | 23G | 25H | 27I | 29J\nBaris 2: N48 | O45 | P42 | … | R36 | S33 | T30 | U37 | V34 | W31","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"Q39"},{"key":"B","text":"16D"},{"key":"C","text":"17D"},{"key":"D","text":"Q41"},{"key":"E","text":"Q37"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"AC"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 52;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: 6 | 8 | 4 | 10 | 2 | 12 | X | 14 | -2 | 16\nBaris 2: 9 | 11 | 7 | Y | 5 | 15 | 3 | 17 | 1 | 19","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"0"},{"key":"B","text":"13"},{"key":"C","text":"5"},{"key":"D","text":"10"},{"key":"E","text":"17"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"AB"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 53;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: BC | EF | HI | KL | NO | QR | TU | WX | ZA | …\nBaris 2: ZY | WV | TS | QP | NM | KJ | HG | ED | BA | …","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"DC"},{"key":"B","text":"CD"},{"key":"C","text":"WV"},{"key":"D","text":"AB"},{"key":"E","text":"YX"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"BE"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 54;
UPDATE questions 
SET options_payload = '{"question_text":"Segitiga: H(kecil) | M(besar) | R(kecil) | …(besar) | B(kecil) | G(besar) | L(kecil) | …(besar)","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"W"},{"key":"B","text":"S"},{"key":"C","text":"N"},{"key":"D","text":"Q"},{"key":"E","text":"T"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"AD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 55;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: 1+4² | 2+3² | 3+2² | 6+1² | 9 | 10-1² | … | 14-3² | 17-4² | 18-5²\nBaris 2: 2N | 3M | 6L | 8K | 11J | 14I | … | 21G | 24F | 29E","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"11-2²"},{"key":"B","text":"18H"},{"key":"C","text":"19O"},{"key":"D","text":"17H"},{"key":"E","text":"11+2²"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"AD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 56;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: G | H | K | P | Q | … | Y | … | E\nBaris 2: E | F | I | N | … | R | … | X | A","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"P, W"},{"key":"B","text":"T, Z"},{"key":"C","text":"T, U"},{"key":"D","text":"O, W"},{"key":"E","text":"S, U"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"BD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 57;
UPDATE questions 
SET options_payload = '{"question_text":"Berlian atas: ST | WX | AB | … | IJ | MN | QR\nBerlian bawah: JK | NO | RS | UW | ZA | … | HI","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"EF"},{"key":"B","text":"FE"},{"key":"C","text":"FD"},{"key":"D","text":"DE"},{"key":"E","text":"ED"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"AD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 58;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: B11 | 14D | F17 | 20H | J23 | 26L | … | 32P\nBaris 2: 112U | S99 | 96Q | O93 | 90M | K87 | … | G81","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"N29"},{"key":"B","text":"M29"},{"key":"C","text":"84I"},{"key":"D","text":"N26"},{"key":"E","text":"TM73"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"AC"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 59;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: 0,5AH | 2,5BI | 12,5CJ | … | 312,5EL | 1562,5FM | 7812,5GN\nBaris 2: JQ9125 | KR1825 | LS365 | … | NU14,6 | OV2,92 | PW0,584","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"20,5CD"},{"key":"B","text":"12,3NS"},{"key":"C","text":"62,5DK"},{"key":"D","text":"MT73"},{"key":"E","text":"TM73"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"CD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 60;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: L | M | P | R | S | V | … | … | B | D\nBaris 2: D | F | H | … | K | … | N | P | R | S","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"X, Z"},{"key":"B","text":"I, N"},{"key":"C","text":"X, Y"},{"key":"D","text":"I, M"},{"key":"E","text":"W, Y"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"CD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 61;
UPDATE questions 
SET options_payload = '{"question_text":"Berlian atas: DE | FG | HI | JK | LM | NO | …\nBerlian bawah: TS | RQ | PO | NM | … | JI | HG","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"KL"},{"key":"B","text":"QP"},{"key":"C","text":"LK"},{"key":"D","text":"PQ"},{"key":"E","text":"KP"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"CD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 62;
UPDATE questions 
SET options_payload = '{"question_text":"Baris 1: -1 | -5 | … | -8 | -7 | -11 | -10 | -14 | -13 | -17\nBaris 2: B1 | F2 | … | I4 | H5 | L6 | K7 | O8 | N9 | R10","svg_content":null,"instruksi":"Pilihlah dua jawaban untuk melengkapi deret berikut.","sub_text":null,"is_multi_select":true,"choices":[{"key":"A","text":"G3"},{"key":"B","text":"E3"},{"key":"C","text":"-6"},{"key":"D","text":"-4"},{"key":"E","text":"D3"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"BD"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 63;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Urutan anak Pak Amir dari sulung sampai bungsu adalah ini yang tepat adalah .....","sub_text":"Pak Amir memiliki 4 orang anak yaitu Mary, Anton, Kevin, dan Anne.\n• Anak perempuan dan anak laki-laki memiliki urutan kelahiran bergantian.\n• Anton berusia 23 tahun.\n• Anne lebih tua 4 tahun dari Anton.\n• Saat ini Mary sedang menempuh Pendidikan SMA.\n• Kevin anak pertama.","is_multi_select":false,"choices":[{"key":"A","text":"Kevin, Anne, Anton, Mary"},{"key":"B","text":"Kevin, Anton, Anne, Marry"},{"key":"C","text":"Kevin, Mary, Anne, Anton"},{"key":"D","text":"Kevin, Mary, Anton, Anne"},{"key":"E","text":"Kevin, Anton, Mary, Anne"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 64;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Dari pernyataan diatas, apabila selisih usia Kevin dan Anton adalah 2 kali selisih antara usia Anne dan Anton, berapa usia Kevin saat ini?","sub_text":"Pak Amir memiliki 4 orang anak yaitu Mary, Anton, Kevin, dan Anne.\n• Anak perempuan dan anak laki-laki memiliki urutan kelahiran bergantian.\n• Anton berusia 23 tahun.\n• Anne lebih tua 4 tahun dari Anton.\n• Saat ini Mary sedang menempuh Pendidikan SMA.\n• Kevin anak pertama.","is_multi_select":false,"choices":[{"key":"A","text":"15 tahun"},{"key":"B","text":"27 tahun"},{"key":"C","text":"19 tahun"},{"key":"D","text":"20 tahun"},{"key":"E","text":"31 tahun"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 65;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Kapal manakah yang tidak memiliki keuntungan jika dibeli oleh Raja minyak?","sub_text":"Seorang Raja minyak dari Abu Dhabi ingin membeli Kapal. Kondisi kapal:\n• Kapal Pesiar lebih besar dari Kapal Samudra, namun lebih boros dari Kapal Feri.\n• Kapal Feri keluaran terbaru dan lebih canggih dari Kapal Pesiar.\n• Kapal Samudra lebih mahal dari Kapal Feri.\n• Kapal Cruise lebih murah dari Kapal Samudra, namun tidak lebih boros dari Kapal Feri.\n• Kapal Feri lebih kecil dari Kapal Cruise.\n• Kapal Cruise lebih besar dari Kapal Pesiar dan tidak lebih canggih dari Kapal Pesiar.","is_multi_select":false,"choices":[{"key":"A","text":"Kapal Samudra"},{"key":"B","text":"Kapal Cruise"},{"key":"C","text":"Kapal Cruise & Samudra"},{"key":"D","text":"Kapal Feri"},{"key":"E","text":"Kapal Pesiar"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 66;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Kapal manakah yang paling canggih?","sub_text":"Seorang Raja minyak dari Abu Dhabi ingin membeli Kapal. Kondisi kapal:\n• Kapal Pesiar lebih besar dari Kapal Samudra, namun lebih boros dari Kapal Feri.\n• Kapal Feri keluaran terbaru dan lebih canggih dari Kapal Pesiar.\n• Kapal Samudra lebih mahal dari Kapal Feri.\n• Kapal Cruise lebih murah dari Kapal Samudra, namun tidak lebih boros dari Kapal Feri.\n• Kapal Feri lebih kecil dari Kapal Cruise.\n• Kapal Cruise lebih besar dari Kapal Pesiar dan tidak lebih canggih dari Kapal Pesiar.","is_multi_select":false,"choices":[{"key":"A","text":"Kapal Samudra & Pesiar"},{"key":"B","text":"Kapal Samudra"},{"key":"C","text":"Kapal Pesiar"},{"key":"D","text":"Kapal Cruise"},{"key":"E","text":"Kapal Feri"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 67;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Pernyataan berikut ini adalah benar, kecuali …..","sub_text":"Seorang Raja minyak dari Abu Dhabi ingin membeli Kapal. Kondisi kapal:\n• Kapal Pesiar lebih besar dari Kapal Samudra, namun lebih boros dari Kapal Feri.\n• Kapal Feri keluaran terbaru dan lebih canggih dari Kapal Pesiar.\n• Kapal Samudra lebih mahal dari Kapal Feri.\n• Kapal Cruise lebih murah dari Kapal Samudra, namun tidak lebih boros dari Kapal Feri.\n• Kapal Feri lebih kecil dari Kapal Cruise.\n• Kapal Cruise lebih besar dari Kapal Pesiar dan tidak lebih canggih dari Kapal Pesiar.","is_multi_select":false,"choices":[{"key":"A","text":"Kapal Pesiar lebih canggih daripada Kapal Cruise."},{"key":"B","text":"Kapal Cruise lebih hemat daripada Kapal Feri."},{"key":"C","text":"Kapal Samudra lebih kecil daripada Kapal Pesiar."},{"key":"D","text":"Kapal Samudra lebih kuno daripada Kapal Feri."},{"key":"E","text":"Kapal Feri lebih besar daripada Kapal Cruise."}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 68;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Kapal manakah yang paling banyak memiliki keunggulan dan menjadi pilihan Raja minyak?","sub_text":"Seorang Raja minyak dari Abu Dhabi ingin membeli Kapal. Kondisi kapal:\n• Kapal Pesiar lebih besar dari Kapal Samudra, namun lebih boros dari Kapal Feri.\n• Kapal Feri keluaran terbaru dan lebih canggih dari Kapal Pesiar.\n• Kapal Samudra lebih mahal dari Kapal Feri.\n• Kapal Cruise lebih murah dari Kapal Samudra, namun tidak lebih boros dari Kapal Feri.\n• Kapal Feri lebih kecil dari Kapal Cruise.\n• Kapal Cruise lebih besar dari Kapal Pesiar dan tidak lebih canggih dari Kapal Pesiar.","is_multi_select":false,"choices":[{"key":"A","text":"Kapal Cruise"},{"key":"B","text":"Kapal Samudra"},{"key":"C","text":"Kapal Pesiar"},{"key":"D","text":"Kapal Feri"},{"key":"E","text":"Kapal Samudra & Feri"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 69;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Deri dan Benjo tidak pernah mendapat giliran membersihkan kelas bersama-sama, kecuali pada hari .....","sub_text":"Tugas piket: Azel, Clara, Enzi (perempuan) dan Benjo, Deri (laki-laki).\n• Setiap hari 3 orang membersihkan kelas (Senin–Jumat).\n• Setiap orang mendapat giliran piket dengan jumlah yang sama.\n• Jumat: Azel dan Deri ikut basket → tidak bisa piket.\n• Senin & Rabu: Clara harus pulang bantu ibu berjualan.\n• Setiap hari harus ada anak laki-laki.\n• Senin & Kamis: Enzi les Bahasa Inggris → tidak bisa piket.","is_multi_select":false,"choices":[{"key":"A","text":"Senin"},{"key":"B","text":"Selasa"},{"key":"C","text":"Rabu"},{"key":"D","text":"Kamis"},{"key":"E","text":"Jum''at"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 70;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Azel dan Deri mendapat giliran bekerja sama membersihkan kelas pada hari .....","sub_text":"Tugas piket: Azel, Clara, Enzi (perempuan) dan Benjo, Deri (laki-laki).\n• Setiap hari 3 orang membersihkan kelas (Senin–Jumat).\n• Setiap orang mendapat giliran piket dengan jumlah yang sama.\n• Jumat: Azel dan Deri ikut basket → tidak bisa piket.\n• Senin & Rabu: Clara harus pulang bantu ibu berjualan.\n• Setiap hari harus ada anak laki-laki.\n• Senin & Kamis: Enzi les Bahasa Inggris → tidak bisa piket.","is_multi_select":false,"choices":[{"key":"A","text":"Selasa dan Kamis"},{"key":"B","text":"Senin dan Selasa"},{"key":"C","text":"Senin dan Kamis"},{"key":"D","text":"Rabu dan Jum''at"},{"key":"E","text":"Selasa dan Jum''at"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"C"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 71;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Siswa yang membersihkan kelas pada hari Selasa adalah .....","sub_text":"Tugas piket: Azel, Clara, Enzi (perempuan) dan Benjo, Deri (laki-laki).\n• Setiap hari 3 orang membersihkan kelas (Senin–Jumat).\n• Setiap orang mendapat giliran piket dengan jumlah yang sama.\n• Jumat: Azel dan Deri ikut basket → tidak bisa piket.\n• Senin & Rabu: Clara harus pulang bantu ibu berjualan.\n• Setiap hari harus ada anak laki-laki.\n• Senin & Kamis: Enzi les Bahasa Inggris → tidak bisa piket.","is_multi_select":false,"choices":[{"key":"A","text":"Deri, Enzi dan Azel"},{"key":"B","text":"Benjo, Azel dan Deri"},{"key":"C","text":"Enzi, Azel dan Benjo"},{"key":"D","text":"Enzi, Clara, dan Deri"},{"key":"E","text":"Azel, Deri dan Benjo"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 72;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Dari pernyataan di atas, apabila Emmelie tiba di garis finish tepat setelah Clarita, siapakah peserta yang memenangkan perlombaan balap karung?","sub_text":"Lomba balap karung: Aline, Bianca, Clarita, Divia, dan Emillie.\n• Clarita berhasil mendahului Bianca tiba di garis finish.\n• Aline tiba di garis finish setelah Clarita.\n• Bianca tidak mampu mengimbangi kecepatan Aline.","is_multi_select":false,"choices":[{"key":"A","text":"Emillie"},{"key":"B","text":"Bianca"},{"key":"C","text":"Aline"},{"key":"D","text":"Clarita"},{"key":"E","text":"Divia"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 73;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Selisih umur antara ayah Deri dan ayah Enzi adalah .....","sub_text":"Lima remaja (Azel, Benjo, Clara, Deri, Enzi) memiliki orang tua:\n• Ayah Azel seumur dengan ayah Benjo; ibu Azel seumur dengan ibu Clara.\n• Ayah Benjo 2 tahun lebih tua dari ayah Clara; ibu Benjo 2 tahun lebih muda dari ibu Deri.\n• Ayah Clara 5 tahun lebih muda dari ayah Deri; ibu Clara 2 tahun lebih tua dari ibu Enzi.\n• Ayah Enzi 5 tahun lebih muda dari ayah Azel; ibu Enzi 6 tahun lebih muda dari ibu Benjo.","is_multi_select":false,"choices":[{"key":"A","text":"3 tahun"},{"key":"B","text":"5 tahun"},{"key":"C","text":"6 tahun"},{"key":"D","text":"7 tahun"},{"key":"E","text":"8 tahun"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 74;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Berapa tahunkah selisih umur antara ibu Azel dengan Ibu Deri?","sub_text":"Lima remaja (Azel, Benjo, Clara, Deri, Enzi) memiliki orang tua:\n• Ayah Azel seumur dengan ayah Benjo; ibu Azel seumur dengan ibu Clara.\n• Ayah Benjo 2 tahun lebih tua dari ayah Clara; ibu Benjo 2 tahun lebih muda dari ibu Deri.\n• Ayah Clara 5 tahun lebih muda dari ayah Deri; ibu Clara 2 tahun lebih tua dari ibu Enzi.\n• Ayah Enzi 5 tahun lebih muda dari ayah Azel; ibu Enzi 6 tahun lebih muda dari ibu Benjo.","is_multi_select":false,"choices":[{"key":"A","text":"2 tahun"},{"key":"B","text":"3 tahun"},{"key":"C","text":"4 tahun"},{"key":"D","text":"5 tahun"},{"key":"E","text":"6 tahun"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 75;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Thor mempunyai tiga lembar uang sepuluh ribuan, 4 lembar uang lima ribuan, dan lima lembar uang dua puluh ribuan. Jika ia akan membeli pulsa seharga Rp 55.000,00 berapa sisa uang Thor?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Rp 75.000,00"},{"key":"B","text":"Rp 80.000,00"},{"key":"C","text":"Rp 85.000,00"},{"key":"D","text":"Rp 90.000,00"},{"key":"E","text":"Rp 95.000,00"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 76;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Seorang turis menyelam hingga 68 m di bawah permukaan laut. Kemudian turis itu naik setinggi 25 m. Berada pada posisi berapakah turis itu dari permukaan air laut?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"30 m"},{"key":"B","text":"43 m"},{"key":"C","text":"38 m"},{"key":"D","text":"33 m"},{"key":"E","text":"53 m"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 77;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Seorang pemborong dapat menyelesaikan sebuah rumah dalam waktu 1 bulan dengan 6 orang tenaga. Bila pemborong ingin menyelesaikan dalam 15 hari, berapa tenaga yang dibutuhkan?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"8 orang"},{"key":"B","text":"9 orang"},{"key":"C","text":"10 orang"},{"key":"D","text":"11 orang"},{"key":"E","text":"12 orang"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 78;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Rumah Romanoff berjarak 3,5 km di sebelah utara sekolah. Rumah Loki berjarak 4,25 km di sebelah selatan sekolah. Dengan skala 0,5 cm untuk 0,25 km, berapa cm untuk menggambarkan jarak dari rumah Romanoff ke rumah Loki?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"11 cm"},{"key":"B","text":"12,5 cm"},{"key":"C","text":"13 cm"},{"key":"D","text":"15,5 cm"},{"key":"E","text":"16,5 cm"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 79;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Pada permulaan pertandingan catur, badai hujan mendekati arena dengan kecepatan 45 km/jam. Ronde ke enam selesai ketika hujan mulai turun. Jika satu ronde membutuhkan waktu 50 menit, berapa jauh jarak badai hujan saat pertandingan dimulai?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"120 km"},{"key":"B","text":"135 km"},{"key":"C","text":"180 km"},{"key":"D","text":"225 km"},{"key":"E","text":"245 km"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 80;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Pada sebuah komunitas olahraga, terdapat 22 orang senang renang, 28 orang senang baseball, 20 orang senang keduanya. Berapa banyak orang yang ada di komunitas tersebut?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"30 orang"},{"key":"B","text":"40 orang"},{"key":"C","text":"50 orang"},{"key":"D","text":"60 orang"},{"key":"E","text":"70 orang"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 81;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Romanoff bekerja 8 jam/hari, 5 hari/minggu dengan bayaran Rp 10.000/jam. Bulan ini ia menerima gaji Rp 1.780.000. Berapakah jumlah jam lembur dalam sebulan jika bayaran Rp 15.000/jam lembur?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"8 jam"},{"key":"B","text":"12 jam"},{"key":"C","text":"14 jam"},{"key":"D","text":"15 jam"},{"key":"E","text":"17 jam"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 82;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Dalam suatu kompetisi lompat jauh, Lexi dapat melompat sejauh 1,89 m dan Bernard melompat sejauh 12,6 dm. Berapa perbedaan jarak lompatan antara keduanya?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"6 dm"},{"key":"B","text":"0,53 m"},{"key":"C","text":"0,63 m"},{"key":"D","text":"1,764 m"},{"key":"E","text":"10,71 dm"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"C"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 83;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Rogers memiliki uang Rp 7.000.000. Sebanyak 4/7-nya untuk uang kuliah. Sebanyak 15% dari sisanya untuk buku dan Rp 180.000 untuk baju. Sisa uang Rogers adalah …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"Rp 1.950.000,00"},{"key":"B","text":"Rp 2.275.000,00"},{"key":"C","text":"Rp 2.370.000,00"},{"key":"D","text":"Rp 2.550.000,00"},{"key":"E","text":"Rp 2.800.000,00"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"C"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 84;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Beberapa tahun yang lalu Romanoff berusia tiga kali lebih tua daripada anaknya. Pada waktu itu usia Romanoff adalah 30 tahun. Bila sekarang usia Romanoff dua kali lebih tua dari anaknya maka berapa usia Romanoff?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"30 tahun"},{"key":"B","text":"20 tahun"},{"key":"C","text":"60 tahun"},{"key":"D","text":"40 tahun"},{"key":"E","text":"50 tahun"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 85;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Danvers berangkat ke kantor naik sepeda. Jarak antara kantor dan rumahnya 3,5 km. Apabila diameter roda sepeda Danvers 70 cm, maka berapa banyak putaran roda sepeda Danvers?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"3500 kali"},{"key":"B","text":"4500 kali"},{"key":"C","text":"5500 kali"},{"key":"D","text":"4000 kali"},{"key":"E","text":"5000 kali"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 86;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Kota Gotham memiliki 350.000 penduduk yang bertambah 15.000/tahun. Kota Manhattan memiliki 1.050.000 penduduk yang berkurang 20.000/tahun. Berapa tahun lagi kedua kota tersebut menjadi sama?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"12 tahun"},{"key":"B","text":"14 tahun"},{"key":"C","text":"16 tahun"},{"key":"D","text":"18 tahun"},{"key":"E","text":"20 tahun"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 87;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"Untuk membuat 35 patung pak Rogers membutuhkan waktu 5 hari, sedangkan pak Danvers membutuhkan waktu 7 hari. Apabila mereka bekerja secara bergantian berapa hari yang dibutuhkan untuk membuat 60 patung?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"8 hari"},{"key":"B","text":"8,5 hari"},{"key":"C","text":"9 hari"},{"key":"D","text":"12 hari"},{"key":"E","text":"10 hari"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 88;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"2 + 2 × 2 – 2 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"0"},{"key":"B","text":"8"},{"key":"C","text":"6"},{"key":"D","text":"2"},{"key":"E","text":"4"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 89;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"(15 + 40)² = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"3005"},{"key":"B","text":"3052"},{"key":"C","text":"3225"},{"key":"D","text":"3025"},{"key":"E","text":"3045"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 90;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"241 × 37 – 379 + 789 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"9327"},{"key":"B","text":"9328"},{"key":"C","text":"9527"},{"key":"D","text":"9237"},{"key":"E","text":"9238"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 91;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"1548 : 6 + 47 × 13 – 839 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"30"},{"key":"B","text":"32"},{"key":"C","text":"34"},{"key":"D","text":"38"},{"key":"E","text":"36"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"A"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 92;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"420 : 0,3 + 8 × 9 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"16762"},{"key":"B","text":"12672"},{"key":"C","text":"1427"},{"key":"D","text":"1742"},{"key":"E","text":"1472"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 93;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"(–0,65) + 117 : 9 – 3 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"10,35"},{"key":"B","text":"9,65"},{"key":"C","text":"9,35"},{"key":"D","text":"10,65"},{"key":"E","text":"11,35"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"C"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 94;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"17 × 18 – 14 × 19 – 18 : 6 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"5545"},{"key":"B","text":"37"},{"key":"C","text":"924,6"},{"key":"D","text":"47"},{"key":"E","text":"38"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"B"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 95;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"1389 – 890 × 2 – 421 + 34 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"780"},{"key":"B","text":"-780"},{"key":"C","text":"778"},{"key":"D","text":"-778"},{"key":"E","text":"760"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"D"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 96;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"72 × 8 – 78 – 102 : 3 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"576"},{"key":"B","text":"498"},{"key":"C","text":"396"},{"key":"D","text":"132"},{"key":"E","text":"464"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 97;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"19 adalah berapa persen dari 380?","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"0,5%"},{"key":"B","text":"0,15%"},{"key":"C","text":"0,05%"},{"key":"D","text":"5,5%"},{"key":"E","text":"5%"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 98;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"8 × 8 × 8 – 7 + 7 + 7 = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"481"},{"key":"B","text":"489"},{"key":"C","text":"499"},{"key":"D","text":"508"},{"key":"E","text":"519"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"E"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 99;
UPDATE questions 
SET options_payload = '{"question_text":null,"svg_content":null,"instruksi":"(21² / 441) + (√196 – 14) = …..","sub_text":null,"is_multi_select":false,"choices":[{"key":"A","text":"2"},{"key":"B","text":"3"},{"key":"C","text":"1"},{"key":"D","text":"5"},{"key":"E","text":"6"}]}'::jsonb, 
    scoring_rule = '{"type":"dichotomous","correct_key":"C"}'::jsonb 
WHERE type = 'KECERDASAN' AND sequence_number = 100;

COMMIT;
