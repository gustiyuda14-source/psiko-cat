import { KESWA_AMBANG, KESWA_DURASI_DETIK, pemicuKeswa, type KeswaKunci } from "@/lib/keswa-scoring";

// Pembahasan per cek untuk halaman hasil. Dipanggil di server; keluarannya hanya butir milik percobaan ini
// (nomor, kalimat, jawaban peserta, terdeteksi/wajar), tanpa daftar kunci. Pemilik memilih menampilkan butir wajar juga (tahu risikonya). Hanya ~50 soal validitas; soal umum tidak pernah dinilai.
// diukur/alasan/analogi/catatan/saran memakai **kata kunci** untuk sorotan (dirender jadi <mark> di kartu pembahasan); kalimat soal tidak pernah disorot.

export type Butir = { no: number; teks: string; jawab: string };
/** Satu petak di daftar soal: satu soal, atau sepasang untuk konsistensi. tandai = memicu cek. */
export type BahasItem = { butir: Butir[]; catatan: string; tandai: boolean };
/** Pola sama untuk 5 cek: apa yang diukur → kenapa terdeteksi (data peserta) → analogi → saran. */
export type Bahas = { judul: string; tab: string; ringkas: string; diukur: string; alasan: string; analogi: string; items: BahasItem[]; nomor?: string; saran: string[] };

const LABEL: Record<string, string> = { Y: "Ya", T: "Tidak" };

/** [3,4,5,9] -> "3–5, 9" (nomor 1-based). */
export function ringkasNomor(idx: number[]): string {
  const out: string[] = [];
  for (let i = 0; i < idx.length; i++) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1] === idx[j] + 1) j++;
    out.push(j > i ? `${idx[i] + 1}–${idx[j] + 1}` : `${idx[i] + 1}`);
    i = j;
  }
  return out.join(", ");
}

const batas = (n: number, ambang: number) => (n >= ambang ? `batas ${ambang} terlampaui` : `di bawah batas ${ambang}`);

const vonis = (n: number, ambang: number, catatanLolos: string) =>
  n >= ambang ? "Karena itu cek ini **tidak lolos**." : `Masih di bawah batas, jadi cek ini lolos; ${catatanLolos}`;

/** Urutan sama dengan cekBaris (lib/keswa-teks.ts). */
export function pembahasanKeswa(jawaban: string, soal: string[], kunci: KeswaKunci): Bahas[] {
  const p = pemicuKeswa(jawaban, kunci);
  const A = KESWA_AMBANG;
  const butir = (i: number): Butir => ({ no: i + 1, teks: soal[i], jawab: LABEL[jawaban[i]] ?? "Tidak dijawab" });
  const jw = (i: number) => LABEL[jawaban[i]];
  const lawanArah = (j: string) => (j === "Y" ? "Tidak" : "Ya");
  const persenYa = p.dijawab ? Math.round((p.ya / p.dijawab) * 100) : 0;
  const rasio = p.dijawab ? p.ya / p.dijawab : 0;
  const ekor = jawaban.length - jawaban.replace(/-+$/, "").length;
  const pasangan = kunci.sama.length + kunci.lawan.length;
  // Contoh dua arah dari soal validitas paket ini: soal yang hampir semua orang jawab Ya, dan yang dijawab Tidak.
  const contoh = [...kunci.acak.filter(([, j]) => j === "T").slice(0, 2), ...kunci.acak.filter(([, j]) => j === "Y").slice(0, 2)];
  const polaLolos = rasio >= A.yaMin && rasio <= A.yaMaks;
  const bentrok = new Set(p.bentrok.map(({ a, b }) => `${a}-${b}`));
  const sok = new Set(p.sok);
  const acak = new Set(p.acak);
  const kosongi = (i: number) => `Nomor ${i + 1} **tidak dijawab**, jadi tidak ikut dihitung di cek ini.`;

  return [
    {
      judul: "Soal kosong",
      tab: "Kosong",
      ringkas: p.kosong.length ? `${p.kosong.length} soal kosong, ${batas(p.kosong.length, A.kosong)}.` : "Semua soal dijawab.",
      diukur:
        "Cek ini menghitung soal yang **tidak dijawab**. Tes kepribadian menyimpulkan dari banyak jawaban sekaligus, jadi jawaban yang hilang membuat gambaran dirimu **tidak lengkap**.",
      alasan: p.kosong.length
        ? `Kamu mengosongkan **${p.kosong.length} soal**, sedangkan aplikasi ini menandai tidak lolos mulai **${A.kosong} soal kosong**. ${vonis(p.kosong.length, A.kosong, "tetap saja, tiap soal kosong mengurangi bahan yang bisa dibaca.")}${ekor >= 10 ? ` **${ekor} soal terakhir** kosong berurutan; pola ini biasanya tanda **waktu habis**, bukan soal yang sengaja dilewati.` : ""}`
        : `Semua ${jawaban.length} soal kamu jawab, jadi **tidak ada bagian yang hilang** dari gambaran dirimu.`,
      analogi: "Seperti **rapor** yang banyak nilainya kosong: wali kelas tidak bisa menyimpulkan kemampuan siswa, sebagus apa pun nilai yang terisi.",
      items: p.kosong.map((i) => ({
        butir: [butir(i)],
        tandai: true,
        catatan: `Nomor ${i + 1} **tidak dijawab**, jadi menambah hitungan soal kosong.`,
      })),
      nomor: p.kosong.length ? ringkasNomor(p.kosong) : undefined,
      saran: [
        "Jawab **semua soal**. Tidak ada pilihan ragu-ragu, jadi pilih yang **paling mendekati** dirimu.",
        `Jaga tempo: ${Math.round(KESWA_DURASI_DETIK / 60)} menit untuk ${jawaban.length} soal berarti sekitar **${Math.floor(KESWA_DURASI_DETIK / jawaban.length)} detik per soal**.`,
        "Jangan berhenti lama di satu soal; kesan pertama yang jujur biasanya **sudah cukup**.",
        "Ulangi simulasi sampai kamu bisa **selesai tepat waktu**.",
      ],
    },
    {
      judul: "Konsistensi",
      tab: "Konsistensi",
      ringkas: p.bentrok.length ? `${p.bentrok.length} pasangan bertentangan, ${batas(p.bentrok.length, A.konsistensi)}.` : "Semua pasangan selaras.",
      diukur:
        "Cek ini melihat apakah kamu menjawab **selaras** pada pasangan soal yang diulang atau dibalik artinya. Tes kepribadian memakainya untuk memastikan jawaban diberikan sambil **membaca sungguh-sungguh**, bukan asal pilih.",
      alasan: p.bentrok.length
        ? `Ada ${pasangan} pasangan soal: ${kunci.sama.length} berisi kalimat yang **sama**, ${kunci.lawan.length} berisi kalimat yang **berlawanan** arti. Jawabanmu bertentangan pada **${p.bentrok.length} pasangan**, sedangkan batasnya ${A.konsistensi} pasangan. ${vonis(p.bentrok.length, A.konsistensi, "pasangan di bawah ini tetap perlu kamu cermati.")}`
        : `Dari ${pasangan} pasangan soal yang diulang atau dibalik, **tidak ada yang bertentangan**. Artinya kamu membaca dan menjawab dengan **cermat**.`,
      analogi: "Seperti **saksi** yang ditanya polisi tentang hal yang sama dengan kalimat berbeda: kalau jawabannya berubah-ubah, keterangannya sulit **dipercaya**, walau tiap jawaban terdengar wajar.",
      items: [...kunci.sama.map((x) => [...x, "sama"] as const), ...kunci.lawan.map((x) => [...x, "lawan"] as const)].map(([a, b, jenis]) => {
        const tandai = bentrok.has(`${a}-${b}`);
        const sama = jenis === "sama";
        return {
          butir: [butir(a), butir(b)],
          tandai,
          catatan: !jw(a) || !jw(b)
            ? `Salah satu dari nomor ${a + 1} dan ${b + 1} **tidak dijawab**, jadi pasangan ini tidak ikut dihitung.`
            : tandai
              ? sama
                ? `Nomor ${a + 1} dan ${b + 1} memakai kalimat yang **sama**, jadi wajarnya jawabannya sama; kamu menjawab ${jw(a)} lalu ${jw(b)}, sehingga keduanya **bertentangan**.`
                : `Nomor ${a + 1} dan ${b + 1} menyatakan hal yang **berlawanan**, jadi bila satu sesuai dirimu yang lain wajarnya tidak; kamu menjawab **${jw(a)} untuk keduanya**.`
              : sama
                ? `Nomor ${a + 1} dan ${b + 1} memakai kalimat yang **sama**, dan kamu menjawab ${jw(a)} untuk keduanya, jadi jawabanmu **selaras**.`
                : `Nomor ${a + 1} dan ${b + 1} menyatakan hal yang **berlawanan**, dan kamu menjawab ${jw(a)} lalu ${jw(b)}, jadi jawabanmu **selaras**.`,
        };
      }),
      saran: [
        "Baca tiap kalimat **sampai habis** sebelum menjawab.",
        "Perhatikan kata seperti \"tidak\", \"jarang\", dan \"sulit\"; satu kata ini bisa **membalik arti** kalimat.",
        "Jawab berdasarkan **kebiasaanmu sehari-hari**, bukan suasana hati saat itu, supaya jawaban di awal dan akhir tes tetap selaras.",
        "Tidak perlu mengingat jawaban sebelumnya; kalau kamu jujur, jawabannya akan **selaras dengan sendirinya**.",
      ],
    },
    {
      judul: "Pola Ya/Tidak",
      tab: "Pola Ya/Tidak",
      ringkas: `${persenYa}% Ya, rentang wajar ${A.yaMin * 100}–${A.yaMaks * 100}%.`,
      diukur:
        "Cek ini melihat **kecenderungan** menjawab Ya terus atau Tidak terus, apa pun isi soalnya. Kebiasaan ini disebut **bias jawaban**: yang menentukan jawaban adalah kebiasaan, bukan isi kalimat.",
      alasan: `Dari ${p.dijawab} soal yang dijawab, **${p.ya} Ya** (${persenYa}%) dan **${p.dijawab - p.ya} Tidak**. Aplikasi ini menandai pola bila Ya di bawah ${A.yaMin * 100}% atau di atas ${A.yaMaks * 100}%; ${
        rasio < A.yaMin ? "proporsimu **di bawah batas**, jadi cek ini tidak lolos." : rasio > A.yaMaks ? "proporsimu **di atas batas**, jadi cek ini tidak lolos." : "proporsimu masih di **rentang wajar**."
      }`,
      analogi: "Seperti orang yang **mengangguk** pada setiap pertanyaan, termasuk \"Kamu suka pedas?\" dan \"Kamu tidak suka pedas?\": anggukannya tidak lagi memberi informasi.",
      // Contoh ditandai hanya bila pola gagal dan jawabannya ikut arah seragam, bukan isi kalimat.
      items: contoh.map(([i, j]) => {
        const tandai = !polaLolos && jawaban[i] === j;
        return {
          butir: [butir(i)],
          tandai,
          catatan: `Pernyataan ini wajarnya dijawab **${lawanArah(j)}** oleh kebanyakan orang, jadi soal di tes ini memang **tidak searah** semua.${
            !jw(i) ? " Nomor ini tidak kamu jawab." : tandai ? ` Kamu menjawab ${jw(i)}, **ikut pola seragammu**, bukan isi kalimatnya.` : ` Kamu menjawab ${jw(i)}.`
          }`,
        };
      }),
      saran: [
        "Putuskan **satu per satu**: untuk setiap kalimat, tanyakan \"apakah ini benar tentang aku?\"",
        "Ingat soal disusun **dua arah**, seperti contoh di atas; jawaban yang seragam hampir pasti tidak sesuai isi.",
        "Kalau mulai lelah dan menjawab otomatis, **berhenti sejenak** lalu baca ulang soalnya.",
      ],
    },
    {
      judul: "Sok sempurna",
      tab: "Sok sempurna",
      ringkas: p.sok.length ? `${p.sok.length} kekurangan kecil disangkal, ${batas(p.sok.length, A.sokSempurna)}.` : "Kamu mengakui kekurangan kecil yang wajar.",
      diukur:
        "Cek ini melihat kecenderungan **menampilkan diri terlalu baik**, misalnya menyangkal kekurangan kecil yang wajar dimiliki manusia. Tes kepribadian memakainya karena dalam seleksi orang mudah tergoda menjawab yang terlihat ideal, bukan yang **sebenarnya**.",
      alasan: p.sok.length
        ? `Ada ${kunci.sok.length} pernyataan tentang kekurangan kecil sehari-hari. Kamu **menyangkal ${p.sok.length}** di antaranya, sedangkan batasnya ${A.sokSempurna}. ${vonis(p.sok.length, A.sokSempurna, "menyangkal beberapa itu wajar karena tiap orang berbeda.")}`
        : `Dari ${kunci.sok.length} pernyataan tentang kekurangan kecil, **tidak ada yang kamu sangkal**. Gambaran dirimu terlihat **realistis**.`,
      analogi: "Seperti **CV** yang menulis \"tidak pernah terlambat sekali pun seumur hidup\": pembaca justru **ragu**, karena hampir semua orang pernah terlambat.",
      items: kunci.sok.map(([i]) => ({
        butir: [butir(i)],
        tandai: sok.has(i),
        catatan: !jw(i)
          ? kosongi(i)
          : sok.has(i)
            ? `Nomor ${i + 1} menyebut kekurangan kecil yang **umumnya pernah dialami** orang; jawaban ${jw(i)} berarti kamu menyatakan **tidak memilikinya** sama sekali.`
            : `Nomor ${i + 1} menyebut kekurangan kecil yang **umumnya pernah dialami** orang. Kamu **mengakui** kekurangan kecil ini; itu **wajar dan jujur**.`,
      })),
      saran: [
        "Jawab **jujur** tentang dirimu, termasuk kekurangan kecil sehari-hari.",
        "Mengakui kekurangan yang wajar **tidak membuatmu terlihat buruk**; yang dibaca adalah apakah gambaran dirimu masuk akal.",
        "Ganti pertanyaan \"jawaban mana yang terlihat baik?\" dengan \"mana yang **benar-benar** aku lakukan?\"",
        "Untuk kalimat dengan kata \"tidak pernah\" atau \"selalu\", ingat dulu **contoh nyata** dari pengalamanmu.",
      ],
    },
    {
      judul: "Jawaban acak",
      tab: "Acak",
      ringkas: p.acak.length ? `${p.acak.length} jawaban menyimpang, ${batas(p.acak.length, A.acak)}.` : "Jawabanmu wajar.",
      diukur:
        "Cek ini melihat apakah kamu **memperhatikan** isi soal. Pernyataannya dibuat sangat jelas, sehingga jawaban yang menyimpang biasanya menandakan **kurang teliti**, bukan perbedaan kepribadian.",
      alasan: p.acak.length
        ? `Ada ${kunci.acak.length} pernyataan yang isinya sangat jelas sehingga hampir semua orang menjawab sama. **${p.acak.length}** di antaranya kamu jawab sebaliknya, sedangkan batasnya ${A.acak}. ${vonis(p.acak.length, A.acak, "tetap periksa nomor di bawah ini.")}`
        : `Dari ${kunci.acak.length} pernyataan yang jawabannya jelas, **semuanya kamu jawab wajar**. Artinya kamu membaca dengan **teliti**.`,
      analogi: "Seperti mengisi **formulir** pendaftaran sambil main HP: ada kolom yang terisi salah, padahal pertanyaannya mudah.",
      items: kunci.acak.map(([i, j]) => ({
        butir: [butir(i)],
        tandai: acak.has(i),
        catatan: !jw(i)
          ? kosongi(i)
          : acak.has(i)
            ? `Untuk nomor ${i + 1}, hampir semua orang menjawab **${lawanArah(jawaban[i])}** karena isinya jelas; jawaban ${jw(i)} kemungkinan karena **salah baca**, **terburu-buru**, atau salah tekan.`
            : `Untuk nomor ${i + 1}, hampir semua orang menjawab **${lawanArah(j)}** karena isinya jelas, dan jawabanmu juga ${jw(i)}: **wajar**.`,
      })),
      saran: [
        "Baca kalimat **sampai tuntas**; jangan menebak dari beberapa kata pertama.",
        "Kalau ada kalimat yang kurang dipahami, baca sekali lagi **pelan-pelan**.",
        "Pastikan tombol yang kamu tekan **sesuai maksudmu**, terutama saat menjawab cepat.",
        "Kerjakan di tempat tenang, jauh dari **gangguan** seperti HP.",
      ],
    },
  ];
}
