import { Fragment } from "react";
import { LembarSheet } from "@/app/components/LembarSheet";
import { FundamentalSpec, KoranCols } from "@/app/components/LembarSpesimen";
import { FUNDAMENTAL } from "@/lib/fundamental";

// Rekening Koran (Kraepelin) punya menu sendiri: /dashboard/kraepelin.
const PAKET = FUNDAMENTAL.filter((m) => m.grup === "Penguatan Dasar");
const KORAN = FUNDAMENTAL.filter((m) => m.grup === "Rekening Koran");
// Paket pertama paling besar (dua baris), sisanya berdampingan di kanan.
const LAYOUT = [{ c: 7, r: 2 }, { c: 5 }, { c: 5 }];

export default function FundamentalCatalog() {
  return (
    <div className="lb-sheets">
      {PAKET.map((m, i) => (
        <LembarSheet
          key={m.kode}
          href={`/latihan/fundamental/${m.kode}`}
          code={`Paket ${String(i + 1).padStart(2, "0")}`}
          side={`Tingkat ${m.level}, ${m.total} soal`}
          title={m.label}
          line={m.desc}
          cta="Mulai latihan"
          tall={i === 0}
          layout={{ ...(LAYOUT[i] ?? { c: 6 }), i }}
          spec={<FundamentalSpec kode={m.kode} contoh={m.contoh} />}
          petunjuk={{
            ringkas: `${m.kicker}. ${m.desc}`,
            fakta: [
              ["Soal", `${m.total} soal isian`],
              ["Waktu", "Tanpa batas, tercatat"],
              ["Jawab", "Numpad atau keyboard"],
            ],
            aturan: [
              m.kind === "pecahan" ? "Isi pembilang lalu penyebut dalam bentuk paling sederhana." : "Ketik jawaban berupa angka.",
              <Fragment key="enter">
                Tekan <kbd>Enter</kbd> untuk memeriksa, lalu <kbd>Enter</kbd> lagi untuk soal berikutnya.
              </Fragment>,
              "Setiap jawaban langsung diberi pembahasan. Soal dibuat ulang setiap sesi.",
            ],
          }}
        />
      ))}
      <LembarSheet
        href="/dashboard/kraepelin"
        code="Menu Tes Koran"
        side={`Tingkat 3, ${KORAN.length} paket`}
        title="Rekening Koran dan Tes Pauli"
        line="Lanjutan setelah Penguatan Dasar, dengan riwayat perkembangan di akunmu."
        cta="Buka Tes Koran"
        quiet
        layout={{ c: 12, i: PAKET.length }}
        spec={<KoranCols n={12} rows={3} />}
      />
    </div>
  );
}
