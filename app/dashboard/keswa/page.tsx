import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { KESWA_PAKET } from "@/lib/keswa-bank";
import { keswaRiwayat } from "@/lib/keswa-attempts";
import { KESWA_DURASI_DETIK, KESWA_TOTAL } from "@/lib/keswa-scoring";
import { durasiKeswa, tanggalKeswa } from "@/lib/keswa-teks";
import { PaketCard } from "@/app/components/PaketCard";
import "@/app/fundamental.css";
import "@/app/keswa.css";
import { KeswaEdukasi, KeswaPanduan } from "./KeswaKonten";

const TABS = [
  { key: "edukasi", label: "Edukasi" },
  { key: "panduan", label: "Panduan" },
  { key: "simulasi", label: "Simulasi" },
] as const;

export default async function KeswaPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { tab: raw } = await searchParams;
  const tab = TABS.some((t) => t.key === raw) ? raw : "edukasi";
  const riwayat = tab === "simulasi" ? await keswaRiwayat(session.sub) : {};

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
            Kesehatan Jiwa
          </span>
          <h1>Keswa</h1>
          <p>
            Kenali bentuk tes kesehatan jiwa, pelajari cara mengerjakannya, lalu coba simulasi {KESWA_TOTAL} pernyataan
            Ya/Tidak dengan cek validitas jawaban.
          </p>
        </div>
        <dl className="fd-hero-stats">
          <div>
            <dt>Simulasi</dt>
            <dd className="tnum">{KESWA_PAKET.length} paket</dd>
          </div>
          <div>
            <dt>Per paket</dt>
            <dd className="tnum">{KESWA_TOTAL} soal</dd>
          </div>
        </dl>
      </header>

      <nav className="fd-tabs ksw-tabs" aria-label="Bagian Keswa">
        {TABS.map((t) => (
          <Link key={t.key} href={`/dashboard/keswa?tab=${t.key}`} aria-current={tab === t.key ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "edukasi" && <KeswaEdukasi />}
      {tab === "panduan" && <KeswaPanduan />}
      {tab === "simulasi" && (
        <div className="pc-grid">
          {KESWA_PAKET.map((p) => (
            <div key={p} className="ksw-paket">
              <PaketCard
                href={`/latihan/keswa/${p}`}
                code={`Paket ${String(p).padStart(2, "0")}`}
                tag={`${KESWA_TOTAL} soal`}
                kicker="Simulasi Keswa"
                title={`Simulasi Keswa Paket ${p}`}
                desc={`${KESWA_TOTAL} pernyataan Ya/Tidak dalam ${KESWA_DURASI_DETIK / 60} menit. Hasil: VALID / TIDAK VALID dari 5 cek.`}
                points={["Soal kosong", "Konsistensi", "Pola Ya/Tidak", "Sok sempurna", "Jawaban acak"]}
                pointsLabel="Cek validitas"
                cta="Mulai simulasi"
              />
              <div className="ksw-riwayat">
                <h3>Hasil tersimpan</h3>
                {riwayat[p]?.length ? (
                  <ul>
                    {riwayat[p].map((a) => (
                      <li key={a.id}>
                        <Link href={`/latihan/keswa/hasil/${a.id}`}>
                          <span className={`ksw-badge ${a.valid ? "is-valid" : "is-invalid"}`}>{a.valid ? "VALID" : "TIDAK VALID"}</span>
                          <span>{tanggalKeswa(a.submitted_at)}</span>
                          <span className="tnum">{durasiKeswa(a.durasi_detik)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Belum ada. Maksimal 2 hasil disimpan per paket.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
