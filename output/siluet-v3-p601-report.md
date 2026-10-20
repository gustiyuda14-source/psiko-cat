# Siluet v3 — paket 601

42 file ditulis: 40 baru dan 2 revisi. Delapan file disetujui dipertahankan identik berdasarkan SHA-256 sebelum/sesudah. Tidak ada commit.

## Validasi

- Seluruh 50 SVG: XML valid, viewBox dan latar sesuai, palet hanya #000 / #8a8a8a / #fff, tanpa elemen terlarang maupun id, dan stroke minimal 6 unit; semua di bawah 15 KB.
- Seluruh 42 SVG produksi: minimal lima detail internal (subpath/elemen putih atau abu); bidang abu 10–25% tinta pada pengukuran piksel hitam/abu solid di render 256 px. Piksel antialias tidak dihitung.
- Seluruh 50 objek diperiksa secara visual pada lembar 40/56 px dan lembar besar. Ini merupakan author self-QA, belum uji pengenalan peserta di HP fisik.
- Delapan prototipe lama diperiksa statis dan dipertahankan; rasio abu dan detailnya tidak disesuaikan karena sudah disetujui.
- HTML: sepuluh baris, lima objek per baris, total 150 img dengan ukuran eksplisit 40/56/120 px dan sumber relatif yang diminta.

## File dan pembeda

| Kolom | File | Byte | Status | Abu tinta produksi | Penanda unik |
|---|---|---:|---|---:|---|
| I | [public/kecermatan-siluet/v3/padlock.svg](../public/kecermatan-siluet/v3/padlock.svg) | 1560 | dipertahankan | acuan tetap | Badan persegi dan belenggu lengkung di atas; lubang kunci besar di tengah. |
| I | [public/kecermatan-siluet/v3/alarm-clock.svg](../public/kecermatan-siluet/v3/alarm-clock.svg) | 2452 | dipertahankan | acuan tetap | Jam bulat dengan dua lonceng di atas serta dua kaki pendek. |
| I | [public/kecermatan-siluet/v3/eyeglasses.svg](../public/kecermatan-siluet/v3/eyeglasses.svg) | 1760 | dipertahankan | acuan tetap | Dua lensa berdampingan, jembatan hidung dan tangkai samping. |
| I | [public/kecermatan-siluet/v3/teapot.svg](../public/kecermatan-siluet/v3/teapot.svg) | 1728 | revisi | 17.08% | Cerat melengkung tinggi, gagang cincin; pita mendatar dan sulur asimetris pada badan. |
| I | [public/kecermatan-siluet/v3/chair.svg](../public/kecermatan-siluet/v3/chair.svg) | 1838 | dipertahankan | acuan tetap | Kursi tunggal bersandaran tegak dan kaki panjang; ruang terbuka di bawah dudukan. |
| II | [public/kecermatan-siluet/v3/trumpet.svg](../public/kecermatan-siluet/v3/trumpet.svg) | 2111 | dipertahankan | acuan tetap | Terompet mendatar, bel mengembang ke kanan dan tiga katup di atas. |
| II | [public/kecermatan-siluet/v3/violin.svg](../public/kecermatan-siluet/v3/violin.svg) | 3038 | revisi | 15.82% | Badan pinggang biola, leher lurus panjang, scroll spiral kompak dan empat pasak lateral. |
| II | [public/kecermatan-siluet/v3/drum.svg](../public/kecermatan-siluet/v3/drum.svg) | 2162 | dipertahankan | acuan tetap | Tabung rendah dengan membran elips serta tali pengencang pada sisi. |
| II | [public/kecermatan-siluet/v3/saxophone.svg](../public/kecermatan-siluet/v3/saxophone.svg) | 2070 | dipertahankan | acuan tetap | Pipa berbentuk J dengan bel menghadap atas dan deretan tombol. |
| II | [public/kecermatan-siluet/v3/harp.svg](../public/kecermatan-siluet/v3/harp.svg) | 2022 | dipertahankan | acuan tetap | Bingkai harpa segitiga melengkung dengan deretan senar panjang. |
| III | [public/kecermatan-siluet/v3/frying-pan.svg](../public/kecermatan-siluet/v3/frying-pan.svg) | 773 | baru | 11.93% | Wajan bundar lebar dengan gagang diagonal panjang; bibir konsentris. |
| III | [public/kecermatan-siluet/v3/ladle.svg](../public/kecermatan-siluet/v3/ladle.svg) | 683 | baru | 11.48% | Sendok dengan mangkuk cekung bulat di ujung bawah dan tangkai ramping melengkung. |
| III | [public/kecermatan-siluet/v3/whisk.svg](../public/kecermatan-siluet/v3/whisk.svg) | 907 | baru | 17.3% | Kepala balon dari loop kawat terbuka, gagang pendek miring di atas. |
| III | [public/kecermatan-siluet/v3/rolling-pin.svg](../public/kecermatan-siluet/v3/rolling-pin.svg) | 716 | baru | 21.44% | Silinder kayu tebal diagonal dengan dua pegangan pendek pada kedua ujung. |
| III | [public/kecermatan-siluet/v3/kettle.svg](../public/kecermatan-siluet/v3/kettle.svg) | 997 | baru | 11.73% | Ceret berbahu bulat, gagang lengkung di atas, cerat pendek naik ke kanan. |
| IV | [public/kecermatan-siluet/v3/watering-can.svg](../public/kecermatan-siluet/v3/watering-can.svg) | 959 | baru | 13.97% | Badan tabung, cerat panjang diagonal dengan kepala penyiram berlubang dan gagang atas. |
| IV | [public/kecermatan-siluet/v3/wheelbarrow.svg](../public/kecermatan-siluet/v3/wheelbarrow.svg) | 892 | baru | 16.11% | Bak miring terbuka, satu roda besar di kanan, dua kaki dan gagang memanjang. |
| IV | [public/kecermatan-siluet/v3/rake.svg](../public/kecermatan-siluet/v3/rake.svg) | 983 | baru | 19.42% | Gagang panjang tegak miring dan palang lebar dengan enam gigi panjang sejajar. |
| IV | [public/kecermatan-siluet/v3/pruning-shears.svg](../public/kecermatan-siluet/v3/pruning-shears.svg) | 1047 | baru | 19.65% | Dua bilah paruh melengkung pendek, poros bundar dan dua gagang panjang terbuka. |
| IV | [public/kecermatan-siluet/v3/hose-reel.svg](../public/kecermatan-siluet/v3/hose-reel.svg) | 1182 | baru | 20.2% | Bobin besar berlingkar konsentris di atas kaki segitiga, dengan engkol samping. |
| V | [public/kecermatan-siluet/v3/stapler.svg](../public/kecermatan-siluet/v3/stapler.svg) | 631 | baru | 21.3% | Rahang stapler panjang miring, engsel belakang tinggi dan celah horizontal terbuka. |
| V | [public/kecermatan-siluet/v3/desk-lamp.svg](../public/kecermatan-siluet/v3/desk-lamp.svg) | 1035 | baru | 15.22% | Lengan lampu berzigzag dengan sendi bulat dan tudung kerucut miring. |
| V | [public/kecermatan-siluet/v3/tape-dispenser.svg](../public/kecermatan-siluet/v3/tape-dispenser.svg) | 810 | baru | 16.76% | Gulungan bundar di atas alas berat; pita terulur menuju pisau bergerigi tinggi. |
| V | [public/kecermatan-siluet/v3/calculator.svg](../public/kecermatan-siluet/v3/calculator.svg) | 1243 | baru | 23.47% | Persegi panjang tegak, layar atas lebar dan kisi tombol kotak. |
| V | [public/kecermatan-siluet/v3/hole-punch.svg](../public/kecermatan-siluet/v3/hole-punch.svg) | 754 | baru | 11.45% | Pelubang berbentuk jembatan lebar, dua pilar pemotong dan baki alas oval. |
| VI | [public/kecermatan-siluet/v3/helicopter.svg](../public/kecermatan-siluet/v3/helicopter.svg) | 1190 | baru | 16.53% | Rotor horizontal sangat panjang, kokpit bulat, boom ekor dan skid pendarat. |
| VI | [public/kecermatan-siluet/v3/hot-air-balloon.svg](../public/kecermatan-siluet/v3/hot-air-balloon.svg) | 951 | baru | 17.68% | Balon vertikal besar berpanel meruncing ke bawah dengan keranjang gantung kecil. |
| VI | [public/kecermatan-siluet/v3/glider.svg](../public/kecermatan-siluet/v3/glider.svg) | 577 | baru | 11.08% | Tampak atas: sayap sangat panjang ramping, badan tipis tanpa baling dan ekor kecil. |
| VI | [public/kecermatan-siluet/v3/blimp.svg](../public/kecermatan-siluet/v3/blimp.svg) | 681 | baru | 19.16% | Envelope mendatar seperti cerutu, gondola kecil di bawah dan sirip ekor kiri. |
| VI | [public/kecermatan-siluet/v3/propeller-plane.svg](../public/kecermatan-siluet/v3/propeller-plane.svg) | 903 | baru | 16.45% | Pesawat sipil tampak atas miring: baling di hidung kanan, sayap lebar lebih pendek. |
| VII | [public/kecermatan-siluet/v3/sofa.svg](../public/kecermatan-siluet/v3/sofa.svg) | 1051 | baru | 18.73% | Sofa lebar dengan dua sandaran, dua lengan tebal dan kaki rendah. |
| VII | [public/kecermatan-siluet/v3/bed.svg](../public/kecermatan-siluet/v3/bed.svg) | 679 | baru | 24.86% | Ranjang perspektif, kepala tinggi, dua bantal dan kasur memanjang ke depan. |
| VII | [public/kecermatan-siluet/v3/wardrobe.svg](../public/kecermatan-siluet/v3/wardrobe.svg) | 712 | baru | 24.46% | Lemari tertutup tinggi, dua pintu panel dan dua pegangan vertikal di tengah. |
| VII | [public/kecermatan-siluet/v3/bookshelf.svg](../public/kecermatan-siluet/v3/bookshelf.svg) | 1485 | baru | 22.2% | Rak terbuka dengan tiga tingkat dan punggung buku beragam, tanpa pintu. |
| VII | [public/kecermatan-siluet/v3/table.svg](../public/kecermatan-siluet/v3/table.svg) | 549 | baru | 16.69% | Meja empat kaki tampak perspektif, bidang atas lebar dan ruang bawah kosong. |
| VIII | [public/kecermatan-siluet/v3/tennis-racket.svg](../public/kecermatan-siluet/v3/tennis-racket.svg) | 1408 | baru | 19.75% | Raket oval besar dengan kisi senar dan gagang diagonal pendek. |
| VIII | [public/kecermatan-siluet/v3/shuttlecock.svg](../public/kecermatan-siluet/v3/shuttlecock.svg) | 760 | baru | 11.27% | Kok melebar ke atas berupa kipas bulu, gabus pendek membulat di bawah. |
| VIII | [public/kecermatan-siluet/v3/bowling-pin.svg](../public/kecermatan-siluet/v3/bowling-pin.svg) | 745 | baru | 12.11% | Pin boling tegak, kepala kecil bulat, leher ramping dua pita dan badan berbentuk pir. |
| VIII | [public/kecermatan-siluet/v3/golf-club.svg](../public/kecermatan-siluet/v3/golf-club.svg) | 680 | baru | 17.53% | Stik golf dengan batang panjang miring dan kepala besi pipih melebar di bawah kiri. |
| VIII | [public/kecermatan-siluet/v3/skateboard.svg](../public/kecermatan-siluet/v3/skateboard.svg) | 1041 | baru | 15.16% | Papan panjang diagonal dengan ujung melengkung naik dan roda di bawah. |
| IX | [public/kecermatan-siluet/v3/smartphone.svg](../public/kecermatan-siluet/v3/smartphone.svg) | 885 | baru | 20.97% | Ponsel tegak ramping bersudut bulat, layar tinggi dan notch kecil. |
| IX | [public/kecermatan-siluet/v3/monitor.svg](../public/kecermatan-siluet/v3/monitor.svg) | 775 | baru | 13.72% | Layar monitor mendatar lebar dengan satu leher dan kaki pedestal. |
| IX | [public/kecermatan-siluet/v3/game-controller.svg](../public/kecermatan-siluet/v3/game-controller.svg) | 1041 | baru | 18.84% | Kontroler lebar dua pegangan, D-pad silang kiri dan empat tombol kanan. |
| IX | [public/kecermatan-siluet/v3/speaker.svg](../public/kecermatan-siluet/v3/speaker.svg) | 937 | baru | 23.66% | Kabinet speaker vertikal, woofer bulat besar dan tweeter kecil di atas. |
| IX | [public/kecermatan-siluet/v3/electric-fan.svg](../public/kecermatan-siluet/v3/electric-fan.svg) | 971 | baru | 22.25% | Kipas meja: sangkar bulat dengan tiga bilah dan dudukan pendek melebar. |
| X | [public/kecermatan-siluet/v3/windmill.svg](../public/kecermatan-siluet/v3/windmill.svg) | 945 | baru | 21.77% | Menara meruncing dengan empat baling besar bersilang pada poros tengah. |
| X | [public/kecermatan-siluet/v3/water-tower.svg](../public/kecermatan-siluet/v3/water-tower.svg) | 1502 | baru | 12.71% | Tangki oval tinggi di atas empat kaki rangka silang terbuka dan tangga tengah. |
| X | [public/kecermatan-siluet/v3/bridge.svg](../public/kecermatan-siluet/v3/bridge.svg) | 887 | baru | 22.81% | Jembatan rendah mendatar, pagar panjang dan tiga bukaan lengkung antar pilar. |
| X | [public/kecermatan-siluet/v3/gazebo.svg](../public/kecermatan-siluet/v3/gazebo.svg) | 952 | baru | 14.08% | Paviliun terbuka dengan atap limas lebar, tiang ramping dan pagar sisi. |
| X | [public/kecermatan-siluet/v3/barn.svg](../public/kecermatan-siluet/v3/barn.svg) | 983 | baru | 10.23% | Lumbung berpuncak atap gambrel patah, pintu ganda besar dengan pengaku X. |

## Hasil

- Total ukuran 50 SVG: 57,643 byte.
- Ukuran terbesar: violin.svg (3,038 byte).
- [Halaman pembanding](siluet-v3-p601.html).
- Cek statis dan raster berhasil. Tampilan halaman HTML di browser belum diuji.
