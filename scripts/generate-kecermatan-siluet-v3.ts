import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { makeColumn, maxAlternation, maxRun, mulberry32, shuffle } from "./generate-kecermatan-simbol";

// Siluet Gambar v3 (latihan, tab Siluet Gambar): paket 601-604 = Paket 2-5 (Paket 1 = pkg 9).
// Gambar = siluet kompleks hitam/abu/putih buatan Codex di public/kecermatan-siluet/v3/
// (prototipe v3 disetujui pemilik 2026-10-19). Kesulitan naik per paket:
// 601 kolom satu kategori bentuk beda -> 604 satu kategori siluet hampir kembar. Kolom I = pemanasan.
//
// Pakai: npx tsx scripts/generate-kecermatan-siluet-v3.ts
// Hasil: prisma/data/bank_soal_p601.json ... p604.json + label di data/kecermatan-pelafalan.json

const KEYS = ["A", "B", "C", "D", "E"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
type Key = (typeof KEYS)[number];

// [nama file, label pelafalan]; satu baris = satu kolom.
type Set5 = [string, string][];
export const PAKET: Record<number, Set5[]> = {
  601: [
    [["padlock", "gembok"], ["alarm-clock", "weker"], ["eyeglasses", "kacamata"], ["teapot", "teko"], ["chair", "kursi"]],
    [["trumpet", "terompet"], ["violin", "biola"], ["drum", "drum"], ["saxophone", "saksofon"], ["harp", "harpa"]],
    [["frying-pan", "wajan"], ["ladle", "sendok sayur"], ["whisk", "pengocok"], ["rolling-pin", "penggiling adonan"], ["kettle", "ceret"]],
    [["watering-can", "gembor"], ["wheelbarrow", "gerobak dorong"], ["rake", "garu"], ["pruning-shears", "gunting dahan"], ["hose-reel", "gulungan selang"]],
    [["stapler", "stapler"], ["desk-lamp", "lampu meja"], ["tape-dispenser", "dispenser selotip"], ["calculator", "kalkulator"], ["hole-punch", "pelubang kertas"]],
    [["helicopter", "helikopter"], ["hot-air-balloon", "balon udara"], ["glider", "pesawat layang"], ["blimp", "kapal udara"], ["propeller-plane", "pesawat baling"]],
    [["sofa", "sofa"], ["bed", "ranjang"], ["wardrobe", "lemari"], ["bookshelf", "rak buku"], ["table", "meja"]],
    [["tennis-racket", "raket"], ["shuttlecock", "kok"], ["bowling-pin", "pin boling"], ["golf-club", "stik golf"], ["skateboard", "papan luncur"]],
    [["smartphone", "ponsel"], ["monitor", "monitor"], ["game-controller", "stik gim"], ["speaker", "pengeras suara"], ["electric-fan", "kipas angin"]],
    [["windmill", "kincir angin"], ["water-tower", "menara air"], ["bridge", "jembatan"], ["gazebo", "gazebo"], ["barn", "lumbung"]],
  ],
  602: [
    [["bucket", "ember"], ["kite", "layang-layang"], ["top-hat", "topi tinggi"], ["lantern", "lentera"], ["anvil", "landasan tempa"]],
    [["accordion", "akordeon"], ["flute", "seruling"], ["xylophone", "gambang"], ["tambourine", "rebana"], ["cello", "selo"]],
    [["forklift", "forklift"], ["excavator", "ekskavator"], ["mixer-truck", "truk molen"], ["fire-truck", "mobil damkar"], ["ambulance", "ambulans"]],
    [["ferry", "feri"], ["tugboat", "kapal tunda"], ["speedboat", "speedboat"], ["cargo-ship", "kapal kargo"], ["fishing-boat", "kapal ikan"]],
    [["clothes-iron", "setrika"], ["vacuum-cleaner", "penyedot debu"], ["washing-machine", "mesin cuci"], ["sewing-machine", "mesin jahit"], ["hair-dryer", "pengering rambut"]],
    [["thermometer", "termometer"], ["balance-scale", "neraca"], ["stopwatch", "stopwatch"], ["tape-measure", "meteran"], ["microscope", "mikroskop"]],
    [["canteen", "botol minum lapangan"], ["sleeping-bag", "kantong tidur"], ["binoculars", "teropong"], ["pocket-knife", "pisau lipat"], ["hiking-boot", "sepatu gunung"]],
    [["pineapple", "nanas"], ["banana", "pisang"], ["grapes", "anggur"], ["watermelon-slice", "semangka"], ["mushroom", "jamur"]],
    [["ring", "cincin"], ["necklace", "kalung"], ["bow-tie", "dasi kupu-kupu"], ["handbag", "tas tangan"], ["sunglasses", "kacamata hitam"]],
    [["hand-saw", "gergaji"], ["power-drill", "bor"], ["pliers", "tang"], ["chisel", "pahat"], ["trowel", "sendok semen"]],
  ],
  603: [
    [["globe", "globe"], ["candle", "lilin"], ["bottle", "botol"], ["mailbox", "kotak surat"], ["traffic-cone", "kerucut lalu lintas"]],
    [["water-bottle", "botol air"], ["milk-bottle", "botol susu"], ["vase", "vas"], ["jug", "kendi"], ["thermos", "termos"]],
    [["armchair", "kursi malas"], ["stool", "bangku"], ["rocking-chair", "kursi goyang"], ["office-chair", "kursi kantor"], ["bench", "bangku taman"]],
    [["table-lamp", "lampu duduk"], ["floor-lamp", "lampu berdiri"], ["street-lamp", "lampu jalan"], ["chandelier", "lampu gantung"], ["oil-lamp", "pelita"]],
    [["airliner", "pesawat penumpang"], ["cargo-plane", "pesawat kargo"], ["seaplane", "pesawat amfibi"], ["biplane", "pesawat dua sayap"], ["business-jet", "jet pribadi"]],
    [["steam-locomotive", "lokomotif uap"], ["bullet-train", "kereta cepat"], ["tram", "trem"], ["freight-wagon", "gerbong barang"], ["monorail", "monorel"]],
    [["mug", "mug"], ["teacup", "cangkir"], ["goblet", "piala minum"], ["measuring-cup", "gelas takar"], ["espresso-cup", "cangkir kecil"]],
    [["sledgehammer", "palu godam"], ["mallet", "palu kayu"], ["pickaxe", "beliung"], ["hatchet", "kapak kecil"], ["claw-hammer", "palu kambing"]],
    [["dump-truck", "truk jungkit"], ["tanker-truck", "truk tangki"], ["tow-truck", "truk derek"], ["garbage-truck", "truk sampah"], ["flatbed-truck", "truk bak datar"]],
    [["duffel-bag", "tas jinjing"], ["tote-bag", "tas belanja"], ["satchel", "tas selempang"], ["purse", "dompet tangan"], ["messenger-bag", "tas kurir"]],
  ],
  604: [
    [["telescope", "teleskop"], ["typewriter", "mesin tik"], ["grandfather-clock", "jam lemari"], ["gramophone", "gramofon"], ["birdcage", "sangkar"]],
    [["wall-clock", "jam dinding"], ["pocket-watch", "jam saku"], ["cuckoo-clock", "jam kukuk"], ["sundial", "jam matahari"], ["digital-clock", "jam digital"]],
    [["sedan", "sedan"], ["hatchback", "hatchback"], ["pickup-truck", "mobil bak"], ["station-wagon", "station wagon"], ["coupe", "kupe"]],
    [["scooter", "skuter"], ["moped", "motor bebek"], ["sport-bike", "motor sport"], ["chopper", "motor gede"], ["dirt-bike", "motor trail"]],
    [["fedora", "topi fedora"], ["beret", "baret"], ["bucket-hat", "topi bucket"], ["sun-hat", "topi pantai"], ["beanie", "kupluk"]],
    [["boot", "bot"], ["sandal", "sandal"], ["loafer", "sepatu pantofel"], ["slipper", "selop"], ["rain-boot", "sepatu bot hujan"]],
    [["schooner", "sekunar"], ["junk-ship", "jung"], ["catamaran", "katamaran"], ["galleon", "galiung"], ["canoe", "kano"]],
    [["saucepan", "panci gagang"], ["wok", "kuali"], ["stockpot", "dandang"], ["skillet", "wajan besi"], ["dutch-oven", "panci tutup"]],
    [["cottage", "pondok"], ["bungalow", "bungalo"], ["townhouse", "rumah deret"], ["cabin", "kabin kayu"], ["stilt-house", "rumah panggung"]],
    [["aviator-glasses", "kacamata pilot"], ["round-glasses", "kacamata bulat"], ["cat-eye-glasses", "kacamata runcing"], ["goggles", "kacamata renang"], ["reading-glasses", "kacamata baca"]],
  ],
};

const pathOf = (name: string) => `/kecermatan-siluet/v3/${name}.svg`;
const root = (p: string) => new URL(`..${p}`, import.meta.url);

function bank(nomor: number) {
  const rand = mulberry32(nomor);
  return {
    nomor,
    nama: `Paket Siluet Gambar ${nomor - 599}`,
    kategori: "SILUET",
    total_soal: 500,
    kolom: ROMAN.map((roman, c) => {
      const values = shuffle(PAKET[nomor][c].map(([name]) => pathOf(name)), rand);
      const simbol = Object.fromEntries(KEYS.map((k, i) => [k, values[i]])) as Record<Key, string>;
      return { nomor: c + 1, roman, simbol, soal: makeColumn(simbol, rand) };
    }),
  };
}

function main() {
  const all = Object.values(PAKET).flat(2).map(([name]) => name);
  assert.equal(new Set(all).size, 200, "Nama siluet harus unik di keempat paket");
  // Anti-bocor (pedoman A-4): tidak memakai benda yang sudah ada di bank simulasi.
  const simulasi = [10, 11, 12, 13, 401].map((id) => readFileSync(root(`/prisma/data/bank_soal_p${id}.json`), "utf8")).join();
  for (const name of all) assert.ok(!simulasi.includes(`/${name}.svg`), `${name} sudah dipakai paket simulasi`);

  const pelafalan: Record<string, string> = {};
  for (const nomor of [601, 602, 603, 604]) {
    const b = bank(nomor);
    for (const [c, col] of b.kolom.entries()) {
      for (const [name, label] of PAKET[nomor][c]) {
        assert.ok(existsSync(root(`/public${pathOf(name)}`)), `Gambar belum ada: ${name}`);
        pelafalan[pathOf(name)] = label;
      }
      assert.equal(new Set(PAKET[nomor][c].map(([, label]) => label)).size, 5, `p${nomor} kolom ${c + 1}: label kembar`);
      const kunci = col.soal.map((s) => s.kunci);
      for (const k of KEYS) assert.equal(kunci.filter((x) => x === k).length, 10);
      assert.ok(maxRun(kunci) <= 2 && maxAlternation(kunci) <= 4);
      col.soal.forEach((s, i) => assert.deepEqual(KEYS.filter((k) => !s.shown.includes(col.simbol[k])), [s.kunci], `p${nomor} butir ${i + 1}`));
    }
    writeFileSync(root(`/prisma/data/bank_soal_p${nomor}.json`), `${JSON.stringify(b, null, 2)}\n`);
  }
  const labelFile = root("/data/kecermatan-pelafalan.json");
  const labels = JSON.parse(readFileSync(labelFile, "utf8"));
  Object.assign(labels, pelafalan);
  writeFileSync(labelFile, `${JSON.stringify(Object.fromEntries(Object.entries(labels).sort()), null, 2)}\n`);
  console.log(`OK: 4 paket x 500 butir, ${all.length} siluet, ${Object.keys(pelafalan).length} label`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
