import { PaketCard } from "@/app/components/PaketCard";
import { FUNDAMENTAL } from "@/lib/fundamental";
import "@/app/fundamental.css";

const PAKET = FUNDAMENTAL.filter((m) => m.grup === "Rekening Koran");

export default function KraepelinPage() {
  return (
    <div className="app-page space-y-6">
      <header className="fd-hero">
        <svg className="fd-hero-radar" viewBox="0 0 420 420" aria-hidden="true">
          <circle cx="210" cy="210" r="200" />
          <circle cx="210" cy="210" r="140" />
          <circle cx="210" cy="210" r="80" />
          <path d="M210 0v420M0 210h420" />
        </svg>
        <div className="fd-hero-text">
          <span className="fd-hero-kicker">
            <i aria-hidden="true" />
            Kraepelin · Pauli
          </span>
          <h1>Tes Koran</h1>
          <p>
            Latihan tes koran: jumlahkan dua angka berdekatan, tulis angka satuannya. Kraepelin pindah kolom tiap beberapa detik, Pauli
            dikerjakan tanpa henti 60 menit dengan tanda garis tiap 3 menit. Grid dibuat ulang setiap sesi, jawab dengan numpad atau keyboard.
          </p>
        </div>
        <dl className="fd-hero-stats">
          <div>
            <dt>Tes Koran</dt>
            <dd className="tnum">{PAKET.length} paket</dd>
          </div>
        </dl>
      </header>
      <div className="pc-grid">
        {PAKET.map((m, i) => (
          <PaketCard
            key={m.kode}
            href={`/latihan/fundamental/${m.kode}`}
            code={`Paket ${String(i + 1).padStart(2, "0")}`}
            tag={m.kind === "pauli" ? "Tambah · 60 menit" : "Tambah · Kali"}
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
    </div>
  );
}
