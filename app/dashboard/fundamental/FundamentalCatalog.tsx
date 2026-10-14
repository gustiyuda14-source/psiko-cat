import { PaketCard } from "@/app/components/PaketCard";
import { FUNDAMENTAL } from "@/lib/fundamental";

// Rekening Koran (Kraepelin) punya menu sendiri: /dashboard/kraepelin.
const PAKET = FUNDAMENTAL.filter((m) => m.grup === "Penguatan Dasar");

export default function FundamentalCatalog() {
  return (
    <div className="pc-grid">
      {PAKET.map((m, i) => (
        <PaketCard
          key={m.kode}
          href={`/latihan/fundamental/${m.kode}`}
          code={`Paket ${String(i + 1).padStart(2, "0")}`}
          tag={m.kind === "deret" ? "Tambah · Kali" : `${m.total} soal`}
          kicker={m.kicker}
          title={m.label}
          desc={m.desc}
          points={m.points}
          chips={m.contoh}
          level={m.level}
          cta="Mulai latihan"
        />
      ))}
    </div>
  );
}
