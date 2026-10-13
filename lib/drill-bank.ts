import "server-only";
import { createHash } from "crypto";
import bank from "@/data/drill-bank.json";
import { DRILL_ASPEK, DRILL_CARDS, drillCategory } from "@/lib/drill-cards";

// Bank drill hasil `npm run build:drill` (bank/drill/** → data/drill-bank.json).
// SERVER ONLY: kunci dan pembahasan ada di sini; ke browser hanya SafeDrillItem.

export type DrillTable = { judul?: string; kolom: string[]; baris: string[][] };

export type DrillItem = {
  id: string;
  kartu: string;
  sub_type: string;
  tier: number;
  sumber: string;
  /** Tanggal push (YYYY-MM-DD). Ada = butir baru: badge NEW tampil sampai peserta menjawabnya (tidak kedaluwarsa). */
  rilis?: string;
  instruksi?: string;
  /** Paragraf bacaan (K04), tampil dalam kotak di atas pertanyaan. */
  bacaan?: string[];
  tabel?: DrillTable;
  stem: string;
  rumus?: string;
  gambar?: string | null;
  /** Drill INGAT: gambar ditampilkan sekian detik (fase hafal), lalu disembunyikan sampai dijawab. */
  tampil_detik?: number;
  /** Opsi bergambar: huruf → path di public/ (nama file tidak membocorkan kunci). */
  opsi_gambar?: Record<string, string> | null;
  opsi: Record<string, string>;
  kunci: string[];
  pembahasan: string;
  /** Gambar pembahasan (jawaban terisi / urutan benar) di data/drill-pembahasan/, SERVER ONLY. */
  gambar_pembahasan?: string;
  status_kunci: string;
};

export type SafeDrillItem = Pick<DrillItem, "id" | "kartu" | "sub_type" | "tier" | "instruksi" | "bacaan" | "tabel" | "stem" | "rumus" | "gambar" | "tampil_detik" | "opsi_gambar" | "opsi"> & {
  multi: boolean;
  /** Butir ber-`rilis`; klien menyembunyikan badge begitu soal ini ada di progres peserta. */
  baru: boolean;
};

const ITEMS = bank as DrillItem[];
const BY_ID = new Map(ITEMS.map((it) => [it.id, it]));

export function getDrillItem(id: string): DrillItem | undefined {
  return BY_ID.get(id);
}

export function safeDrillItem(it: DrillItem): SafeDrillItem {
  return {
    id: it.id,
    kartu: it.kartu,
    sub_type: it.sub_type,
    tier: it.tier,
    instruksi: it.instruksi,
    bacaan: it.bacaan,
    tabel: it.tabel,
    stem: it.stem,
    rumus: it.rumus,
    gambar: it.gambar ?? null,
    tampil_detik: it.tampil_detik,
    opsi_gambar: it.opsi_gambar ?? null,
    opsi: it.opsi,
    multi: it.kunci.length > 1,
    baru: Boolean(it.rilis),
  };
}

/** Sidik jari isi soal (stem, opsi, kunci): jawaban di drill_answers hanya dihitung untuk versi yang sama. */
export function drillVersi(it: DrillItem): string {
  return createHash("sha1").update(JSON.stringify([it.stem, it.opsi, it.kunci])).digest("hex").slice(0, 10);
}

export function drillItemsFor(kartu: string): SafeDrillItem[] {
  return ITEMS.filter((it) => it.kartu === kartu).map(safeDrillItem);
}

/** Kategori soal satu kartu (urut seperti navigasi sesi) beserta id soalnya. */
function kategoriOf(items: DrillItem[]) {
  const map = new Map<number, { label: string; ids: string[] }>();
  for (const it of items) {
    const [key, label] = drillCategory(it.sub_type);
    if (!map.has(key)) map.set(key, { label, ids: [] });
    map.get(key)!.ids.push(it.id);
  }
  return [...map].sort(([a], [b]) => a - b).map(([, v]) => v);
}

/** Ringkasan per kartu untuk katalog: id soal per tier (tanpa isi soal). Urut per aspek supaya
 *  kartu baru (mis. K16 logika) masuk kelompok aspeknya di roda, bukan di ujung daftar. */
export function drillCatalog() {
  const order = (k: string) => DRILL_ASPEK.findIndex((a) => a.key === DRILL_CARDS[k].aspek);
  return Object.entries(DRILL_CARDS).sort(([a], [b]) => order(a) - order(b)).map(([kartu, card]) => {
    const items = ITEMS.filter((it) => it.kartu === kartu);
    return {
      kartu,
      ...card,
      tiers: [1, 2, 3].map((tier) => items.filter((it) => it.tier === tier).map((it) => it.id)),
      kategori: kategoriOf(items),
      /** Id butir baru (ber-`rilis`); badge NEW kartu = yang belum ada di progres peserta. */
      baru: items.filter((it) => it.rilis).map((it) => it.id),
    };
  });
}
