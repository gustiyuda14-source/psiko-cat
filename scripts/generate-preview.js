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
  return `<svg class="soal-svg" viewBox="0 0 850 450" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  <style>
    .box { fill: none; stroke: #333; stroke-width: 4; }
    .solid { fill: black; stroke: none; }
    .outline { fill: white; stroke: black; stroke-width: 4; stroke-linejoin: round; }
    .outline-transparent { fill: none; stroke: black; stroke-width: 4; stroke-linejoin: round; }
    .text-label { font-family: sans-serif; font-size: 24px; font-weight: bold; text-anchor: middle; }
    .text-symbol { font-family: sans-serif; font-size: 50px; font-weight: bold; text-anchor: middle; }
  </style>
  <defs>${commonDefs}</defs>
  ${content}
</svg>`;
}

function layoutTop(frames, arrow) {
  let s = '';
  const xPos = [150, 350, 550, 750];
  for (let i = 0; i < 4; i++) {
    s += `<g transform="translate(${xPos[i]}, 100)">
      <rect class="box" x="-60" y="-60" width="120" height="120" rx="10" />
      ${frames[i]}
    </g>\n`;
    if (i < 3) {
      const symbol = (i === 1 && arrow === 'analogi') ? '::' : '→';
      s += `<text x="${xPos[i] + 100}" y="115" class="text-symbol">${symbol}</text>\n`;
    }
  }
  return s;
}

function layoutBottom(opts) {
  let s = '';
  const xPos = [85, 255, 425, 595, 765];
  const labels = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < 5; i++) {
    s += `<g transform="translate(${xPos[i]}, 300)">
      <rect class="box" x="-60" y="-60" width="120" height="120" rx="10" />
      ${opts[i]}
      <text y="90" class="text-label">${labels[i]}</text>
    </g>\n`;
  }
  return s;
}

const soal = [];

// Q26
soal.push({
  id: 26, tipe: 'pola_gambar',
  kunci: 'd',
  svg: wrapSvg(
    layoutTop([
      `<use href="#out-sq" class="solid" /><use href="#in-tri" class="outline" /><circle class="solid" cx="-10" cy="-50" r="4" /><circle class="solid" cx="10" cy="-50" r="4" />`,
      `<g transform="rotate(90)"><use href="#out-tri" class="outline-transparent" /><use href="#in-sq" class="solid" /></g><circle class="solid" cx="50" cy="-15" r="4" /><circle class="solid" cx="50" cy="0" r="4" /><circle class="solid" cx="50" cy="15" r="4" />`,
      `<use href="#out-pen" class="solid" /><use href="#in-cir" class="outline" /><circle class="solid" cx="-22" cy="50" r="4" /><circle class="solid" cx="-7" cy="50" r="4" /><circle class="solid" cx="8" cy="50" r="4" /><circle class="solid" cx="23" cy="50" r="4" />`,
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      `<g transform="rotate(90)"><use href="#out-cir" class="solid" /><use href="#in-pen" class="outline" /></g><circle class="solid" cx="-50" cy="-30" r="4" /><circle class="solid" cx="-50" cy="-15" r="4" /><circle class="solid" cx="-50" cy="0" r="4" /><circle class="solid" cx="-50" cy="15" r="4" /><circle class="solid" cx="-50" cy="30" r="4" />`,
      `<g transform="rotate(90)"><use href="#out-cir" class="outline-transparent" /><use href="#in-pen" class="solid" /></g><circle class="solid" cx="-50" cy="-22" r="4" /><circle class="solid" cx="-50" cy="-7" r="4" /><circle class="solid" cx="-50" cy="8" r="4" /><circle class="solid" cx="-50" cy="23" r="4" />`,
      `<use href="#out-cir" class="outline-transparent" /><use href="#in-pen" class="solid" /><circle class="solid" cx="-50" cy="-30" r="4" /><circle class="solid" cx="-50" cy="-15" r="4" /><circle class="solid" cx="-50" cy="0" r="4" /><circle class="solid" cx="-50" cy="15" r="4" /><circle class="solid" cx="-50" cy="30" r="4" />`,
      `<g transform="rotate(90)"><use href="#out-cir" class="outline-transparent" /><use href="#in-pen" class="solid" /></g><circle class="solid" cx="-50" cy="-30" r="4" /><circle class="solid" cx="-50" cy="-15" r="4" /><circle class="solid" cx="-50" cy="0" r="4" /><circle class="solid" cx="-50" cy="15" r="4" /><circle class="solid" cx="-50" cy="30" r="4" />`,
      `<g transform="rotate(90)"><use href="#out-pen" class="outline-transparent" /><use href="#in-cir" class="solid" /></g><circle class="solid" cx="-50" cy="-30" r="4" /><circle class="solid" cx="-50" cy="-15" r="4" /><circle class="solid" cx="-50" cy="0" r="4" /><circle class="solid" cx="-50" cy="15" r="4" /><circle class="solid" cx="-50" cy="30" r="4" />`
    ])
  ),
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  pembahasan: "Untuk memecahkan matriks analogi ini, terapkan empat aturan transformasi dari gambar bingkai 1 ke bingkai 2 secara bersamaan: pertama, Topologi Terbalik (bangun terluar bertukar posisi dengan bangun di dalam); kedua, Inversi Soliditas (bangun solid hitam menjadi garis tepi putih-transparan, dan sebaliknya); ketiga, Rotasi Absolut sebesar 90 derajat searah jarum jam untuk keseluruhan bangun di tengah; dan keempat, Konservasi Kuantitas pada elemen satelit (titik) yang berpindah lokasi sesuai arah rotasi 90 derajat sekaligus bertambah satu buah.<br><br>Dengan menerapkan keempat pola ini secara identik pada gambar bingkai 3, kita mengeliminasi Opsi E karena gagal menukar topologi. Opsi A gagal inversi warna. Opsi B satelitnya kurang satu. Opsi C tidak memutar segilima di dalam 90 derajat. Opsi D adalah jawaban yang menginversi semuanya dengan benar."
});

// Q27: Deret
soal.push({
  id: 27, tipe: 'pola_gambar',
  kunci: 'c',
  svg: wrapSvg(
    layoutTop([
      `<use href="#out-tri" class="solid" /><circle class="outline" cx="0" cy="0" r="5" />`,
      `<g transform="rotate(90)"><use href="#out-tri" class="outline-transparent" /><circle class="solid" cx="-10" cy="0" r="5" /><circle class="solid" cx="10" cy="0" r="5" /></g>`,
      `<g transform="rotate(180)"><use href="#out-tri" class="solid" /><circle class="outline" cx="-15" cy="0" r="5" /><circle class="outline" cx="0" cy="0" r="5" /><circle class="outline" cx="15" cy="0" r="5" /></g>`,
      `<text y="15" class="text-symbol">?</text>`
    ], 'deret') +
    layoutBottom([
      `<g transform="rotate(270)"><use href="#out-tri" class="solid" /><circle class="outline" cx="-22" cy="0" r="5" /><circle class="outline" cx="-7" cy="0" r="5" /><circle class="outline" cx="8" cy="0" r="5" /><circle class="outline" cx="23" cy="0" r="5" /></g>`,
      `<g transform="rotate(270)"><use href="#out-tri" class="outline-transparent" /><circle class="solid" cx="-15" cy="0" r="5" /><circle class="solid" cx="0" cy="0" r="5" /><circle class="solid" cx="15" cy="0" r="5" /></g>`,
      `<g transform="rotate(270)"><use href="#out-tri" class="outline-transparent" /><circle class="solid" cx="-22" cy="0" r="5" /><circle class="solid" cx="-7" cy="0" r="5" /><circle class="solid" cx="8" cy="0" r="5" /><circle class="solid" cx="23" cy="0" r="5" /></g>`,
      `<g transform="rotate(180)"><use href="#out-tri" class="outline-transparent" /><circle class="solid" cx="-22" cy="0" r="5" /><circle class="solid" cx="-7" cy="0" r="5" /><circle class="solid" cx="8" cy="0" r="5" /><circle class="solid" cx="23" cy="0" r="5" /></g>`,
      `<g transform="rotate(90)"><use href="#out-tri" class="outline-transparent" /><circle class="solid" cx="-22" cy="0" r="5" /><circle class="solid" cx="-7" cy="0" r="5" /><circle class="solid" cx="8" cy="0" r="5" /><circle class="solid" cx="23" cy="0" r="5" /></g>`
    ])
  ),
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  pembahasan: "Pada deret spasial ini, terdapat tiga lapis pola transformasi pergerakan dari frame ke frame. Pertama, Rotasi Absolut: Segitiga berputar 90 derajat searah jarum jam pada setiap langkah. Kedua, Inversi Soliditas Bolak-balik: Segitiga berubah warna dari solid hitam, menjadi outline transparan, kembali ke solid hitam, dan seterusnya. Ketiga, Konservasi Kuantitas: Jumlah titik satelit bertambah satu di setiap langkah, bergantian antara titik outline dan titik solid.<br><br>Berdasarkan frame ketiga (Segitiga solid menghadap bawah dengan 3 titik outline), maka frame keempat haruslah Segitiga outline menghadap kiri dengan 4 titik solid di dalamnya. Opsi A salah karena segitiganya solid. Opsi B salah karena titiknya hanya 3. Opsi D salah arah rotasi. Opsi E juga salah arah rotasi. Pilihan yang paling akurat adalah C."
});

// Q28: Analogi
soal.push({
  id: 28, tipe: 'pola_gambar',
  kunci: 'b',
  svg: wrapSvg(
    layoutTop([
      `<use href="#out-hex" class="solid" /><use href="#in-dia" class="outline" /><circle class="solid" cx="-45" cy="0" r="4" /><circle class="solid" cx="45" cy="0" r="4" />`,
      `<use href="#out-dia" class="outline-transparent" /><use href="#in-hex" class="solid" /><circle class="solid" cx="0" cy="-45" r="4" /><circle class="solid" cx="0" cy="45" r="4" />`,
      `<use href="#out-sq" class="solid" /><use href="#in-cir" class="outline" /><circle class="solid" cx="0" cy="-45" r="4" /><circle class="solid" cx="0" cy="45" r="4" />`,
      `<text y="15" class="text-symbol">?</text>`
    ], 'analogi') +
    layoutBottom([
      `<use href="#out-cir" class="solid" /><use href="#in-sq" class="outline" /><circle class="solid" cx="-45" cy="0" r="4" /><circle class="solid" cx="45" cy="0" r="4" />`,
      `<use href="#out-cir" class="outline-transparent" /><use href="#in-sq" class="solid" /><circle class="solid" cx="-45" cy="0" r="4" /><circle class="solid" cx="45" cy="0" r="4" />`,
      `<use href="#out-cir" class="outline-transparent" /><use href="#in-sq" class="solid" /><circle class="solid" cx="0" cy="-45" r="4" /><circle class="solid" cx="0" cy="45" r="4" />`,
      `<use href="#out-sq" class="outline-transparent" /><use href="#in-cir" class="solid" /><circle class="solid" cx="-45" cy="0" r="4" /><circle class="solid" cx="45" cy="0" r="4" />`,
      `<use href="#out-cir" class="outline-transparent" /><g transform="rotate(45)"><use href="#in-sq" class="solid" /></g><circle class="solid" cx="-45" cy="0" r="4" /><circle class="solid" cx="45" cy="0" r="4" />`
    ])
  ),
  pilihan: {"a":"a","b":"b","c":"c","d":"d","e":"e"},
  pembahasan: "Aturan transformasi analogi ini mencakup Topologi Terbalik (bangun luar dan dalam bertukar), Inversi Soliditas (solid menjadi outline, dan outline menjadi solid), dan Rotasi Satelit sejauh 90 derajat. Perhatikan bahwa bangun utamanya tidak mengalami rotasi, hanya posisi dua titik satelit yang berputar 90 derajat dari poros horizontal (kiri-kanan) menjadi vertikal (atas-bawah).<br><br>Menerapkan aturan ini pada frame 3 (Persegi solid di luar, Lingkaran outline di dalam, titik vertikal atas-bawah): Lingkaran harus menjadi di luar (outline) dan Persegi menjadi di dalam (solid), serta titik satelit berotasi kembali ke poros horizontal (kiri-kanan). Opsi A salah inversi. Opsi C salah posisi titik. Opsi D gagal menukar bangun luar/dalam. Opsi E memutar persegi yang tidak diinstruksikan pola. Maka Opsi B adalah satu-satunya jawaban tepat."
});

// Q29: Susun Gambar
soal.push({
  id: 29, tipe: 'susun_gambar',
  kunci: 'c',
  svg: `<svg class="soal-svg" viewBox="0 0 850 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  <style>
    .solid { fill: black; stroke: white; stroke-width: 2; }
    .text-label { font-family: sans-serif; font-size: 24px; font-weight: bold; text-anchor: middle; }
  </style>
  <g transform="translate(170, 150)">
    <polygon points="-40,-40 40,-40 0,0" class="solid" />
    <text y="60" class="text-label">1</text>
  </g>
  <g transform="translate(340, 150)">
    <polygon points="40,-40 40,40 0,0" class="solid" />
    <text y="60" class="text-label">2</text>
  </g>
  <g transform="translate(510, 150)">
    <polygon points="40,40 -40,40 0,0" class="solid" />
    <text y="60" class="text-label">3</text>
  </g>
  <g transform="translate(680, 150)">
    <polygon points="-40,40 -40,-40 0,0" class="solid" />
    <text y="60" class="text-label">4</text>
  </g>
</svg>`,
  pilihan: {"a":"1-3-2-4","b":"3-1-4-2","c":"1-2-3-4","d":"4-3-2-1","e":"2-4-1-3"},
  pembahasan: "Pada soal menyusun gambar ini, tugas Anda adalah memvisualisasikan bagaimana keempat potongan bentuk geometris di atas dapat digabungkan menjadi satu bangun yang kohesif. Potongan-potongan tersebut adalah 4 buah segitiga siku-siku sama kaki yang merupakan hasil belahan diagonal dari sebuah persegi.<br><br>Untuk membentuk persegi yang utuh dengan sudut yang presisi, potongan (1) yang merupakan atap harus dipasangkan dengan potongan (2) di sebelah kanan, potongan (3) di sebelah bawah, dan potongan (4) di sebelah kiri. Berdasarkan struktur jaring-jaring yang saling melengkapi tersebut, urutan rotasi perakitan yang searah jarum jam secara urut adalah 1-2-3-4."
});

let htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Soal Spasial HOTS</title>
  <style>
    body { font-family: sans-serif; padding: 40px; background-color: #f4f4f5; display: flex; flex-direction: column; align-items: center; }
    .container { max-width: 900px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; margin-bottom: 30px; }
    .soal-svg { width: 100%; height: auto; border: 2px solid #eaeaea; border-radius: 8px; margin-bottom: 20px; background: white; }
    .pembahasan { line-height: 1.6; color: #333; background: #eef2ff; padding: 20px; border-radius: 8px; }
    h2 { margin-top: 0; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; }
    .metadata { color: #64748b; font-size: 0.9em; margin-bottom: 20px; }
    .options-text { margin-bottom: 15px; font-weight: bold; }
  </style>
</head>
<body>
`;

for (const s of soal) {
  htmlContent += `
  <div class="container">
    <h2>Soal ID ${s.id} (${s.tipe})</h2>
    <div class="metadata">Instruksi: ${s.tipe === 'pola_gambar' ? 'Pilihlah satu gambar untuk melengkapi pola di bawah ini.' : 'Urutkanlah potongan gambar berikut menjadi gambar yang utuh.'}</div>
    ${s.svg}
    <div class="options-text">
      Pilihan: A) ${s.pilihan.a} &nbsp; B) ${s.pilihan.b} &nbsp; C) ${s.pilihan.c} &nbsp; D) ${s.pilihan.d} &nbsp; E) ${s.pilihan.e}
    </div>
    <div class="pembahasan">
      <h3>Kunci: ${s.kunci.toUpperCase()}</h3>
      <p>${s.pembahasan}</p>
    </div>
  </div>`;
}

htmlContent += `
  <div class="container" style="text-align: center; background: #fef3c7;">
    <h3>(Untuk Preview: Hanya 4 contoh soal yang ditampilkan di versi ini agar tidak terlalu panjang. Generator asli akan mencakup seluruh 12 soal.)</h3>
  </div>
</body>
</html>`;

fs.writeFileSync('/Users/gustiputuyudawirashana/Downloads/psiko-cat/preview-all-spasial.html', htmlContent);
console.log('Preview file created successfully!');
