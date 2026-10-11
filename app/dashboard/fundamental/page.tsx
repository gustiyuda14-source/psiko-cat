import Link from "next/link";
import { PageHeader } from "@/app/components/ui";
import { FUNDAMENTAL } from "@/lib/fundamental";
import "@/app/fundamental.css";

const GROUPS = [
  { grup: "Penguatan Dasar", tone: "tone-green", note: "50 soal isian per sesi, pembahasan langsung setelah menjawab." },
  { grup: "Rekening Koran", tone: "tone-cyan", note: "99 pasangan angka berturut-turut, waktu dan akurasi menentukan tier." },
] as const;

export default function FundamentalPage() {
  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Fundamental"
        title="Drilling fundamental"
        description="Latihan hitung dasar sebelum masuk Numerik dan Kecermatan: perkalian cepat, pecahan, dan rekening koran. Soal dibuat ulang setiap sesi, jawab dengan numpad atau keyboard."
      />
      {GROUPS.map(({ grup, tone, note }) => (
        <section key={grup}>
          <span className="section-kicker">{grup}</span>
          <p className="muted mt-1">{note}</p>
          <div className="hub-grid !mt-3">
            {FUNDAMENTAL.filter((m) => m.grup === grup).map((m) => (
              <Link key={m.kode} href={`/latihan/fundamental/${m.kode}`} className="hub-card">
                <span className={`cat-tag ${tone}`}>{m.total} soal</span>
                <strong>{m.label}</strong>
                <span className="muted">{m.desc}</span>
                <span className="flex flex-wrap gap-1.5">
                  {m.contoh.map((c) => (
                    <span key={c} className="fd-chip tnum">
                      {c}
                    </span>
                  ))}
                </span>
                <span className="hub-cta">
                  Mulai drilling
                  <span className="hub-arrow" aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
