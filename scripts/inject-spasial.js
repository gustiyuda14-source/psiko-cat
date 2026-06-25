const fs = require('fs');

const commonDefs = `
  <rect id="out-sq" x="-35" y="-35" width="70" height="70" />
  <rect id="in-sq" x="-20" y="-20" width="40" height="40" />
  <polygon id="out-tri" points="0,-45 35,30 -35,30" />
  <polygon id="in-tri" points="0,-25 20,15 -20,15" />
  <polygon id="out-pen" points="0,-45 45,-15 28,40 -28,40 -45,-15" />
  <polygon id="in-pen" points="0,-25 25,-8 15,22 -15,22 -25,-8" />
  <circle id="out-cir" cx="0" cy="0" r="40" />
  <circle id="in-cir" cx="0" cy="0" r="22" />
  <polygon id="out-hex" points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" />
  <polygon id="in-hex" points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" />
  <polygon id="out-dia" points="0,-45 35,0 0,45 -35,0" />
  <polygon id="in-dia" points="0,-25 20,0 0,25 -20,0" />
`;

function wrapSvg(content) {
  return `<svg viewBox="0 0 850 450" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><style>.box { fill: none; stroke: #333; stroke-width: 4; } .solid { fill: black; stroke: none; } .outline { fill: white; stroke: black; stroke-width: 4; stroke-linejoin: round; } .outline-transparent { fill: none; stroke: black; stroke-width: 4; stroke-linejoin: round; } .text-label { font-family: sans-serif; font-size: 24px; font-weight: bold; text-anchor: middle; } .text-symbol { font-family: sans-serif; font-size: 50px; font-weight: bold; text-anchor: middle; }</style><defs>${commonDefs.replace(/\n/g, '')}</defs>${content}</svg>`;
}

function minify(str) {
  return str.replace(/\s*\n\s*/g, '').replace(/>\s+</g, '><');
}

function makeFrame(outShape, inShape, rotate, outClass, inClass, dots) {
  let outC = outClass === 'solid' ? 'solid' : 'outline-transparent';
  let inC = inClass === 'solid' ? 'solid' : (outC === 'solid' ? 'outline' : 'outline-transparent');
  let s = `<g transform="rotate(${rotate})">`;
  if (outShape) s += `<use href="#out-${outShape}" class="${outC}" />`;
  if (inShape) s += `<use href="#in-${inShape}" class="${inC}" />`;
  s += `</g>`;
  for (let d of dots) {
    s += `<circle class="solid" cx="${d.cx}" cy="${d.cy}" r="4" />`;
  }
  return s;
}

function genDots(count, pos) {
  let dots = [];
  let offsets = [];
  if (count===1) offsets=[0];
  if (count===2) offsets=[-10, 10];
  if (count===3) offsets=[-15, 0, 15];
  if (count===4) offsets=[-22, -7, 8, 23];
  if (count===5) offsets=[-30, -15, 0, 15, 30];
  
  for (let off of offsets) {
    if (pos==='top') dots.push({cx: off, cy: -55});
    if (pos==='bottom') dots.push({cx: off, cy: 55});
    if (pos==='right') dots.push({cx: 55, cy: off});
    if (pos==='left') dots.push({cx: -55, cy: off});
  }
  return dots;
}

function layoutTop(frames, arrow) {
  let s = '';
  const xPos = [150, 350, 550, 750];
  for (let i = 0; i < 4; i++) {
    s += `<g transform="translate(${xPos[i]}, 100)"><rect class="box" x="-60" y="-60" width="120" height="120" rx="10" />${frames[i]}</g>`;
    if (i < 3) {
      const symbol = (i === 1 && arrow === 'analogi') ? '::' : '→';
      s += `<text x="${xPos[i] + 100}" y="115" class="text-symbol">${symbol}</text>`;
    }
  }
  return s;
}

function layoutBottom(opts) {
  let s = '';
  const xPos = [85, 255, 425, 595, 765];
  const labels = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < 5; i++) {
    s += `<g transform="translate(${xPos[i]}, 300)"><rect class="box" x="-60" y="-60" width="120" height="120" rx="10" />${opts[i]}<text y="90" class="text-label">${labels[i]}</text></g>`;
  }
  return s;
}

const soal = [];

// ID 26: Analogi
soal.push({
  id: 26, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.",
  kunci: ["d"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('sq', 'tri', 0, 'solid', 'outline', genDots(2, 'top')),
      makeFrame('tri', 'sq', 90, 'outline', 'solid', genDots(3, 'right')),
      makeFrame('pen', 'cir', 0, 'solid', 'outline', genDots(4, 'bottom')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      makeFrame('cir', 'pen', 90, 'solid', 'outline', genDots(5, 'left')),
      makeFrame('cir', 'pen', 90, 'outline', 'solid', genDots(4, 'left')),
      makeFrame('cir', 'pen', 0, 'outline', 'solid', genDots(5, 'left')),
      makeFrame('cir', 'pen', 90, 'outline', 'solid', genDots(5, 'left')),
      makeFrame('pen', 'cir', 90, 'outline', 'solid', genDots(5, 'left'))
    ])
  )),
  pembahasan: "Terapkan empat aturan dari matriks pertama: Topologi Terbalik (bangun luar ditukar bangun dalam), Inversi Soliditas (solid menjadi outline dan sebaliknya), Rotasi 90° searah jarum jam, dan penambahan satelit 1 buah dengan rotasi pergerakan 90°.<br>Menerapkannya ke matriks ketiga, Opsi E gagal menukar topologi. Opsi A gagal inversi warna. Opsi B kekurangan satelit. Opsi C tidak merotasi segilima. Maka jawaban benar adalah Opsi D."
});

// ID 27: Deret
soal.push({
  id: 27, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar untuk melengkapi deret di bawah ini.",
  kunci: ["c"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('tri', null, 0, 'solid', '', genDots(1, 'top')),
      makeFrame('tri', null, 90, 'outline', '', genDots(2, 'top')),
      makeFrame('tri', null, 180, 'solid', '', genDots(3, 'top')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'deret') +
    layoutBottom([
      makeFrame('tri', null, 270, 'solid', '', genDots(4, 'top')),
      makeFrame('tri', null, 270, 'outline', '', genDots(3, 'top')),
      makeFrame('tri', null, 270, 'outline', '', genDots(4, 'top')),
      makeFrame('tri', null, 180, 'outline', '', genDots(4, 'top')),
      makeFrame('tri', null, 90, 'outline', '', genDots(4, 'top'))
    ])
  )),
  pembahasan: "Deret spasial ini memiliki tiga pola transformasi: Segitiga berputar 90° searah jarum jam, warna berinversi bergantian (solid -> outline -> solid), dan jumlah titik satelit bertambah satu di posisi tetap (atas).<br>Frame keempat haruslah Segitiga outline menghadap kiri (rotasi 270°) dengan 4 titik. Opsi A salah karena solid. Opsi B salah karena satelit kurang. Opsi D dan E salah rotasi. Jawaban tepat adalah C."
});

// ID 28: Analogi
soal.push({
  id: 28, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.",
  kunci: ["b"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('hex', 'dia', 0, 'solid', 'outline', [{cx:-55, cy:0}, {cx:55, cy:0}]),
      makeFrame('dia', 'hex', 0, 'outline', 'solid', [{cx:0, cy:-55}, {cx:0, cy:55}]),
      makeFrame('sq', 'cir', 0, 'solid', 'outline', [{cx:0, cy:-55}, {cx:0, cy:55}]),
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      makeFrame('cir', 'sq', 0, 'solid', 'outline', [{cx:-55, cy:0}, {cx:55, cy:0}]),
      makeFrame('cir', 'sq', 0, 'outline', 'solid', [{cx:-55, cy:0}, {cx:55, cy:0}]),
      makeFrame('cir', 'sq', 0, 'outline', 'solid', [{cx:0, cy:-55}, {cx:0, cy:55}]),
      makeFrame('sq', 'cir', 0, 'outline', 'solid', [{cx:-55, cy:0}, {cx:55, cy:0}]),
      makeFrame('cir', 'dia', 0, 'outline', 'solid', [{cx:-55, cy:0}, {cx:55, cy:0}])
    ])
  )),
  pembahasan: "Analogi ini melibatkan Topologi Terbalik dan Inversi Soliditas. Posisi satelit berputar 90° sementara posisi dan orientasi bangun utama tetap diam (tidak berotasi).<br>Menerapkannya ke matriks ketiga: Lingkaran menjadi di luar (outline) dan Persegi menjadi di dalam (solid), serta satelit berotasi dari sumbu vertikal ke horizontal. Opsi A salah inversi. Opsi C salah rotasi satelit. Opsi D gagal menukar topologi. Opsi E memutar bangun utama (persegi miring). Jawaban tepat adalah B."
});

// ID 29: Susun Gambar
soal.push({
  id: 29, aspek: 'logis', tipe: 'susun_gambar', ganda: false,
  instruksi: "Urutkanlah potongan gambar berikut menjadi gambar yang utuh (sebuah persegi).",
  kunci: ["c"],
  pilihan: {"a":"1-3-2-4","b":"3-1-4-2","c":"1-2-3-4","d":"4-3-2-1","e":"2-4-1-3"},
  gambar: `<svg viewBox="0 0 850 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><style>.solid { fill: black; stroke: white; stroke-width: 2; } .text-label { font-family: sans-serif; font-size: 24px; font-weight: bold; text-anchor: middle; }</style><g transform="translate(170, 150)"><polygon points="-40,-40 40,-40 0,0" class="solid" /><text y="60" class="text-label">1</text></g><g transform="translate(340, 150)"><polygon points="40,-40 40,40 0,0" class="solid" /><text y="60" class="text-label">2</text></g><g transform="translate(510, 150)"><polygon points="40,40 -40,40 0,0" class="solid" /><text y="60" class="text-label">3</text></g><g transform="translate(680, 150)"><polygon points="-40,40 -40,-40 0,0" class="solid" /><text y="60" class="text-label">4</text></g></svg>`,
  pembahasan: "Keempat belahan potongan merupakan segitiga siku-siku yang sama kaki, yang berasal dari perpotongan diagonal sebuah persegi.<br>Untuk membentuk persegi tersebut, potongan (1) sebagai sisi atas harus disandingkan dengan potongan (2) di kanan, (3) di bawah, dan (4) di kiri. Kombinasi yang membentuk bangun secara memutar searah jarum jam dan tepat adalah urutan 1-2-3-4."
});

// ID 30: Analogi
soal.push({
  id: 30, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.",
  kunci: ["e"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('pen', 'sq', 0, 'outline', 'outline', genDots(3, 'bottom')),
      makeFrame('sq', 'pen', 180, 'solid', 'solid', genDots(2, 'top')),
      makeFrame('hex', 'tri', 0, 'outline', 'outline', genDots(5, 'right')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      makeFrame('hex', 'tri', 180, 'solid', 'solid', genDots(4, 'left')),
      makeFrame('tri', 'hex', 0, 'solid', 'solid', genDots(4, 'left')),
      makeFrame('tri', 'hex', 180, 'outline', 'outline', genDots(4, 'left')),
      makeFrame('tri', 'hex', 180, 'solid', 'solid', genDots(6, 'left')),
      makeFrame('tri', 'hex', 180, 'solid', 'solid', genDots(4, 'left'))
    ])
  )),
  pembahasan: "Pola analogi ini memakai Topologi Terbalik (tukar posisi luar/dalam), Rotasi 180° untuk bangun utama, perubahan keseluruhan dari Outline ke Solid, serta rotasi satelit 180° diikuti pengurangan 1 kuantitas satelit.<br>Terapkan pada matriks ketiga: Segienam (luar) menjadi ke dalam, Segitiga (dalam) menjadi ke luar. Keduanya berotasi 180° dan berwarna solid. Satelit di kanan (5 buah) pindah ke kiri (rotasi 180°) dan berkurang 1 menjadi 4 buah. Opsi A gagal topologi. Opsi B gagal rotasi. Opsi C gagal inversi warna. Opsi D salah hitungan satelit. Maka jawaban yang paling presisi adalah E."
});

// ID 31: Deret
soal.push({
  id: 31, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar untuk melengkapi deret di bawah ini.",
  kunci: ["a"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('sq', 'cir', 0, 'outline', 'solid', []),
      makeFrame('sq', 'cir', 45, 'solid', 'outline', []),
      makeFrame('sq', 'cir', 90, 'outline', 'solid', []),
      `<text y="15" class="text-symbol">?</text>`
    ], 'deret') +
    layoutBottom([
      makeFrame('sq', 'cir', 135, 'solid', 'outline', []),
      makeFrame('sq', 'cir', 135, 'outline', 'solid', []),
      makeFrame('sq', 'cir', 90, 'solid', 'outline', []),
      makeFrame('sq', 'cir', 180, 'solid', 'outline', []),
      makeFrame('sq', 'cir', 135, 'solid', 'solid', [])
    ])
  )),
  pembahasan: "Pola deret kontinu ini berfokus pada dua aspek: Pertama, Rotasi Persegi terluar sebesar 45° secara berurutan pada setiap langkah (sehingga ia akan terlihat berbentuk belah ketupat di langkah genap). Kedua, Inversi Warna Bolak-balik pada bangun luar dan bangun dalam secara sinkron tanpa jeda.<br>Frame keempat mewajibkan persegi berputar 135° dari posisi awal dan warnanya menjadi solid di luar dengan outline di dalam. Opsi B gagal menginversi warna. Opsi C gagal merotasi bangun. Opsi D merotasi terlalu jauh (180°). Opsi E menjadikan keduanya solid hitam yang menyalahi aturan keterbacaan berlapis. Jawaban A tepat mengakomodir rotasi sudut dan warna."
});

// ID 32: Analogi
soal.push({
  id: 32, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.",
  kunci: ["c"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('dia', null, 0, 'solid', '', genDots(1, 'top')),
      makeFrame('dia', null, 90, 'outline', '', genDots(1, 'right')),
      makeFrame('pen', null, 0, 'solid', '', genDots(1, 'left')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      makeFrame('pen', null, 90, 'solid', '', genDots(1, 'top')),
      makeFrame('pen', null, 0, 'outline', '', genDots(1, 'top')),
      makeFrame('pen', null, 90, 'outline', '', genDots(1, 'top')),
      makeFrame('pen', null, 90, 'outline', '', genDots(1, 'right')),
      makeFrame('pen', null, 270, 'outline', '', genDots(1, 'bottom'))
    ])
  )),
  pembahasan: "Aturan transformasi analogi ini sangat minimalis: Merotasi seluruh kesatuan objek sebesar 90° searah jarum jam, kemudian menginversi warnanya dari solid hitam menjadi sekadar outline tanpa melakukan penambahan satelit (Konservasi Absolut).<br>Saat diterapkan pada matriks ketiga (Segilima solid dengan satelit di kiri), segilima tersebut harus menghadap kanan (rotasi 90°) menjadi putih, dan satelitnya bergeser ke area atas (rotasi 90° dari kiri). Opsi A gagal inversi warna. Opsi B gagal rotasi bangun. Opsi D dan E memposisikan satelit ke arah yang salah. Jawaban paling akurat adalah C."
});

// ID 33: Deret
soal.push({
  id: 33, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar untuk melengkapi deret di bawah ini.",
  kunci: ["d"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('tri', 'tri', 0, 'outline', 'solid', genDots(1, 'bottom')),
      makeFrame('tri', 'tri', 90, 'outline', 'solid', genDots(2, 'left')),
      makeFrame('tri', 'tri', 180, 'outline', 'solid', genDots(3, 'top')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'deret') +
    layoutBottom([
      makeFrame('tri', 'tri', 270, 'outline', 'solid', genDots(3, 'right')),
      makeFrame('tri', 'tri', 270, 'solid', 'outline', genDots(4, 'right')),
      makeFrame('tri', 'tri', 180, 'outline', 'solid', genDots(4, 'right')),
      makeFrame('tri', 'tri', 270, 'outline', 'solid', genDots(4, 'right')),
      makeFrame('tri', 'tri', 270, 'outline', 'outline', genDots(4, 'right'))
    ])
  )),
  pembahasan: "Deret konstan ini menerapkan rotasi mutlak 90° searah jarum jam di setiap iterasi ke semua bangunnya tanpa menukar urutan atau menginversi wujud dasarnya (luar selalu outline, dalam selalu solid). Satelit juga selalu berotasi 90° ke arah yang sama namun dengan jumlah yang konstan bertambah 1.<br>Untuk melengkapi frame keempat, bangun segitiga ganda tersebut harus berorientasi ke kiri (rotasi 270°) dan letak satelit berpindah ke kanan dengan jumlah genap 4 buah. Opsi A jumlah satelit tidak bertambah. Opsi B salah karena melakukan inversi soliditas. Opsi C salah derajat rotasi. Opsi E salah mengubah bangun dalam menjadi outline. Pilihan ideal adalah D."
});

// ID 34: Analogi
soal.push({
  id: 34, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.",
  kunci: ["a"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('cir', 'hex', 0, 'solid', 'outline', genDots(1, 'top')),
      makeFrame('hex', 'cir', 0, 'outline', 'solid', genDots(2, 'bottom')),
      makeFrame('sq', 'pen', 0, 'solid', 'outline', genDots(3, 'top')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      makeFrame('pen', 'sq', 0, 'outline', 'solid', genDots(4, 'bottom')),
      makeFrame('pen', 'sq', 90, 'outline', 'solid', genDots(4, 'bottom')),
      makeFrame('pen', 'sq', 0, 'solid', 'outline', genDots(4, 'bottom')),
      makeFrame('sq', 'pen', 0, 'outline', 'solid', genDots(4, 'bottom')),
      makeFrame('pen', 'sq', 0, 'outline', 'solid', genDots(3, 'bottom'))
    ])
  )),
  pembahasan: "Matriks analogi ini tidak memutar bangun utamanya sama sekali (Rotasi 0°), melainkan hanya menerapkan Topologi Terbalik (tukar posisi luar/dalam) dan Inversi (solid/outline bertukar). Sedangkan untuk satelit: ia memantul lurus dari poros atas ke bawah (rotasi 180°) seraya bertambah satu buah kuantitasnya.<br>Dengan memakai logika tersebut ke matriks ketiga: Bangun luar berubah menjadi Segilima (outline), sedangkan bagian dalamnya menjadi Persegi (solid). Satelit memantul dari atas ke bawah dan berjumlah 4 titik. Opsi B salah memutar bangun utamanya. Opsi C salah tidak menerapkan inversi. Opsi D gagal menukar topologi luar/dalam. Opsi E kekurangan satelit. Opsi A paling tepat dan konsisten."
});

// ID 35: Deret
soal.push({
  id: 35, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar untuk melengkapi deret di bawah ini.",
  kunci: ["e"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('pen', 'sq', 0, 'outline', 'outline', genDots(1, 'left')),
      makeFrame('sq', 'pen', 0, 'outline', 'outline', genDots(2, 'left')),
      makeFrame('pen', 'sq', 0, 'outline', 'outline', genDots(3, 'left')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'deret') +
    layoutBottom([
      makeFrame('sq', 'pen', 0, 'solid', 'solid', genDots(4, 'left')),
      makeFrame('pen', 'sq', 0, 'outline', 'outline', genDots(4, 'left')),
      makeFrame('sq', 'pen', 0, 'outline', 'outline', genDots(3, 'left')),
      makeFrame('sq', 'pen', 90, 'outline', 'outline', genDots(4, 'left')),
      makeFrame('sq', 'pen', 0, 'outline', 'outline', genDots(4, 'left'))
    ])
  )),
  pembahasan: "Deret dinamis ini mengaplikasikan osilasi Topologi Terbalik yang berulang pada setiap frame genap dan ganjil (sehingga susunan luar dan dalam senantiasa bertukar-tukar posisi bolak-balik tanpa ada rotasi sedikitpun). Satelitnya konstan bertambah 1 di tempat yang sama (kiri).<br>Frame keempat wajib menjadi cerminan frame kedua, yakni Persegi kembali merangkul Segilima, dan dengan penambahan satelit menjadi 4 di sebelah kiri. Opsi A secara keliru memberi sentuhan solid hitam. Opsi B urung menukar bangun luar/dalam. Opsi C satelitnya tidak bertambah. Opsi D berotasi tidak perlu. Oleh sebab itu, E memenuhi selengkapnya."
});

// ID 36: Analogi
soal.push({
  id: 36, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.",
  kunci: ["b"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('sq', 'cir', 0, 'outline', 'solid', []),
      makeFrame('sq', 'cir', 45, 'solid', 'outline', []),
      makeFrame('hex', 'tri', 0, 'outline', 'solid', []),
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      makeFrame('hex', 'tri', 0, 'solid', 'outline', []),
      makeFrame('hex', 'tri', 90, 'solid', 'outline', []),
      makeFrame('hex', 'tri', 45, 'solid', 'solid', []),
      makeFrame('tri', 'hex', 90, 'solid', 'outline', []),
      makeFrame('hex', 'tri', 90, 'outline', 'solid', [])
    ])
  )),
  pembahasan: "Matriks analogi ini berlandaskan pada rotasi sudut sebesar setengah irisan geometrisnya (seperti memutar persegi sejauh 45° menjadikannya bentuk wajik) dan pertukaran warna dari outline ke solid bolak-balik (Inversi Total) tanpa pertukaran tempat bangunnya.<br>Jika diterapkan pada Segienam (sudut 30° hingga 90°), memutar Segienam sejauh 90° akan mengubah titik runcing atapnya (vertikal) ke samping (horizontal). Inversi warnanya haruslah luarnya solid dan dalamnya outline putih. Opsi A tidak berputar. Opsi C salah karena inner shape juga dicolor solid. Opsi D malah menukar posisi topologinya. Opsi E salah pewarnaan. Jawaban presisinya adalah B karena Segienam tampak tidur (rotasi 90°) beserta pewarnaan terbalik yang akurat."
});

// ID 37: Analogi
soal.push({
  id: 37, aspek: 'logis', tipe: 'pola_gambar', ganda: false,
  instruksi: "Pilihlah satu gambar analogi untuk melengkapi pola di bawah ini.",
  kunci: ["d"],
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  gambar: minify(wrapSvg(
    layoutTop([
      makeFrame('cir', 'sq', 0, 'solid', 'outline', genDots(1, 'top')),
      makeFrame('sq', 'cir', 180, 'outline', 'solid', genDots(1, 'bottom')),
      makeFrame('pen', 'dia', 0, 'solid', 'outline', genDots(3, 'left')),
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      makeFrame('dia', 'pen', 180, 'solid', 'outline', genDots(3, 'right')),
      makeFrame('dia', 'pen', 90, 'outline', 'solid', genDots(3, 'right')),
      makeFrame('pen', 'dia', 180, 'outline', 'solid', genDots(3, 'right')),
      makeFrame('dia', 'pen', 180, 'outline', 'solid', genDots(3, 'right')),
      makeFrame('dia', 'pen', 180, 'outline', 'outline', genDots(3, 'right'))
    ])
  )),
  pembahasan: "Aturan analogi ini menggabungkan Topologi Terbalik, Inversi Warna, dan Rotasi Absolut sebesar 180° untuk semua elemen secara merata tanpa mengubah kuantitasnya (titik di atas berotasi menjadi di bawah).<br>Ketika kita kenakan transformasi ini pada Segilima dan Belah Ketupat dengan satelit di sebelah kiri: Maka Topologi akan bertukar (Belah Ketupat berada di luar sebagai outline), bangun di dalam menjadi solid, posisi Segilima akan tertukar arah (akibat rotasi 180° ujung lancipnya menghadap ke bawah), dan titik satelit berpindah rotasi ke arah kanan seutuhnya tanpa penambahan jumlah (tetap 3 buah). Opsi A salah gagal inversi warna. Opsi B salah gagal rotasi belah ketupat dan segilima sejauh 180°. Opsi C urung menukar topologinya. Opsi E tidak memberikan isian solid pada bangun dalam. Opsi D secara elegan memfasilitasi semua persyaratan tersebut."
});

// Load soal.json, replace IDs 26-37, save back
const dbPath = '/Users/gustiputuyudawirashana/Downloads/psiko-cat/soal.json';
const dbStr = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(dbStr);

for (let s of soal) {
  const idx = db.soal.findIndex(x => x.id === s.id);
  if (idx >= 0) {
    db.soal[idx] = s;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully injected 12 procedural spatial SVG questions into soal.json!');
