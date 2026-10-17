import PembahasanNavigator from "@/app/components/pembahasan/PembahasanNavigator";
import type { KeswaCekData } from "@/app/components/pembahasan/cards";
import type { CekBaris } from "@/lib/keswa-teks";

type Props = {
  paket: number;
  baris: CekBaris[];
  cek: KeswaCekData[];
  stats: { label: string; value: number; tone?: "ok" | "bad" }[];
  extra: [string, string][];
};

// Pembahasan Keswa memakai navigator yang sama dengan pembahasan Kecermatan. cek sudah diturunkan di server
// (butir validitas milik percobaan ini + teks pembahasan), tanpa daftar kunci dan tanpa bank soal.
export function KeswaCek({ paket, baris, cek, stats, extra }: Props) {
  if (!cek.length) {
    // Bank paket tidak cocok dengan jawaban tersimpan: tampilkan ringkasan cek saja.
    return (
      <ul className="ksw-cek">
        {baris.map((b) => (
          <li key={b.judul} className={b.lolos ? "is-ok" : "is-bad"}>
            <div className="ksw-cek-head">
              <span className="ksw-cek-tag">{b.lolos ? "Lolos" : "Tidak lolos"}</span>
              <b>{b.judul}</b>
              <span className="ksw-cek-angka tnum">{b.angka}</span>
            </div>
            <p>{b.arti}</p>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Pembahasan per sub-tes</h2>
      <PembahasanNavigator keswa={{ label: `Keswa · Paket ${paket}`, cek, stats, extra }} />
    </section>
  );
}
