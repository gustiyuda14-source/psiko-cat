import type { KonsistensiBaris } from "@/lib/scoring/pribadi";
import { Badge } from "@/app/components/ui";

/*
  Cek konsistensi pasangan pernyataan serupa (Ya/Tidak `pasangan`, Pass Hand butir kembar).
  Konsisten = kedua jawaban sama-sama sesuai kunci atau sama-sama tidak (lib/scoring/pribadi.ts
  konsistensi). Tabel di layar lebar, kartu di HP supaya tidak ada scroll horizontal.
*/

const STATUS = {
  konsisten: { label: "Konsisten", tone: "success" },
  berbeda: { label: "Berbeda", tone: "accent" },
  kosong: { label: "Belum lengkap", tone: "neutral" },
} as const;

/** choiceText(no, key) = teks pilihan butir nomor `no` (Pass Hand punya teks opsi per butir). */
export function KonsistensiTabel({
  baris,
  choiceText,
}: {
  baris: KonsistensiBaris[];
  choiceText: (no: number, key: string) => string;
}) {
  const konsisten = baris.filter((b) => b.status === "konsisten").length;
  const teks = (s: { no: number; jawab: string | null }) =>
    s.jawab === null ? "Dilewati" : choiceText(s.no, s.jawab);
  const status = (s: KonsistensiBaris["status"]) => (
    <Badge tone={STATUS[s].tone}>{STATUS[s].label}</Badge>
  );

  return (
    <section
      className="surface-card space-y-3 p-4 sm:p-5"
      aria-labelledby="konsistensi-judul"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3
          id="konsistensi-judul"
          className="font-heading text-lg text-foreground"
        >
          Cek konsistensi pasangan
        </h3>
        <p className="tnum text-sm text-muted-foreground">
          {konsisten} dari {baris.length} pasangan konsisten
        </p>
      </div>

      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Pernyataan</th>
            <th className="py-2 pr-3 font-semibold">Jawaban pertama</th>
            <th className="py-2 pr-3 font-semibold">Jawaban pasangan</th>
            <th className="py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((b) => (
            <tr
              key={`${b.a.no}-${b.b.no}`}
              className="border-b border-border align-top last:border-0"
            >
              <td className="py-3 pr-3">
                <p className="text-foreground">{b.a.statement}</p>
                <p className="mt-1 text-muted-foreground">{b.b.statement}</p>
              </td>
              <td className="tnum py-3 pr-3">
                <b className="text-foreground">{teks(b.a)}</b>
                <span className="block text-xs text-muted-foreground">
                  no. {b.a.no}
                </span>
              </td>
              <td className="tnum py-3 pr-3">
                <b className="text-foreground">{teks(b.b)}</b>
                <span className="block text-xs text-muted-foreground">
                  no. {b.b.no}
                </span>
              </td>
              <td className="py-3">{status(b.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="space-y-2 sm:hidden">
        {baris.map((b) => (
          <li
            key={`${b.a.no}-${b.b.no}`}
            className="inset-panel space-y-2 px-3 py-3 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="tnum text-xs text-muted-foreground">
                no. {b.a.no} ↔ no. {b.b.no}
              </span>
              {status(b.status)}
            </div>
            <p className="text-foreground">
              {b.a.statement} <b>({teks(b.a)})</b>
            </p>
            <p className="text-muted-foreground">
              {b.b.statement} <b className="text-foreground">({teks(b.b)})</b>
            </p>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Berbeda artinya jawabanmu berubah untuk hal yang sama, tanda kamu
        mungkin ragu atau terburu-buru. Saat tes, jawab spontan sesuai dirimu.
      </p>
    </section>
  );
}
