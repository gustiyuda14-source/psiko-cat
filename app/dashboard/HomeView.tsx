import Link from "next/link";
import { WeeklyFrequencyChart, NapTrendChart } from "./ActivityCharts";
import { buttonStyles, EmptyState, PageHeader } from "@/app/components/ui";

const PASSING_NAP = 61;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type HomeSession = {
  id: string;
  status: string;
  nap_score: number | null;
  is_passed: boolean | null;
  completed_at: string | null;
  created_at: string;
  module_sessions: Array<{ module_type: string }>;
};

/* Tampilan Beranda murni (tanpa akses data) — page.tsx yang mengambil sesi. */
export default function HomeView({ name, sessions }: { name: string; sessions: HomeSession[] }) {
  const session = { name };
  const allSessions = sessions;
  const completedSessions = allSessions.filter(
    (s) => s.status === "COMPLETED" || s.status === "DISQUALIFIED"
  );
  const fullSessions = completedSessions.filter((s) => {
    const types = new Set(s.module_sessions.map((module) => module.module_type));
    return types.size === 3 && ["KECERDASAN", "KEPRIBADIAN", "KECERMATAN"].every((type) => types.has(type));
  });
  const standaloneCount = completedSessions.length - fullSessions.length;
  const bestScore = fullSessions.length
    ? Math.max(...fullSessions.map((s) => s.nap_score ?? 0))
    : null;
  const passedCount = fullSessions.filter((s) => s.is_passed).length;
  const lastActivity = completedSessions[0]?.completed_at ?? completedSessions[0]?.created_at;
  const above = bestScore != null && bestScore >= PASSING_NAP;

  return (
    <div className="app-page">
      <PageHeader
        kicker="Beranda"
        title={`Halo, ${session.name}`}
        description="Pilih yang mau kamu kerjakan sekarang. Simulasi memberi skor NAP; latihan untuk berlatih per sub-tes tanpa batas waktu; review untuk membahas sesi yang sudah selesai."
      />

      <div className="hub-grid">
        <Link href="/dashboard/simulasi" className="hub-card">
          <span className="cat-tag tone-green">Simulasi</span>
          <strong>Tryout resmi dengan timer</strong>
          <span className="muted">
            {lastActivity ? `Tes terakhir ${formatDate(lastActivity)}` : "Belum ada tes resmi yang diselesaikan"}
          </span>
          <span className="hub-cta">
            Buka simulasi
            <span className="hub-arrow" aria-hidden="true">→</span>
          </span>
        </Link>
        <Link href="/dashboard/latihan" className="hub-card">
          <span className="cat-tag tone-cyan">Latihan</span>
          <strong>Latihan tanpa timer</strong>
          <span className="muted">Kecerdasan, Kecermatan, Kepribadian. Tanpa batas waktu, tidak masuk riwayat.</span>
          <span className="hub-cta">
            Buka latihan
            <span className="hub-arrow" aria-hidden="true">→</span>
          </span>
        </Link>
        <Link href="/dashboard/review" className="hub-card">
          <span className="cat-tag tone-amber">Review Soal</span>
          <strong>Pembahasan sesi selesai</strong>
          <span className="muted">Lihat jawaban, kunci, dan pembahasan per sub-tes dan per butir.</span>
          <span className="hub-cta">
            Buka review
            <span className="hub-arrow" aria-hidden="true">→</span>
          </span>
        </Link>
      </div>

      <section className="prog" aria-labelledby="prog-h">
        <div className="prog-head">
          <h2 id="prog-h">Progress</h2>
          <p>Perkembangan skor NAP dari semua tryout lengkap</p>
        </div>

        {completedSessions.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat tes"
            description="Selesaikan satu simulasi resmi untuk mulai melihat skor NAP, tren, dan pembahasan soal di sini. Latihan tidak dihitung ke riwayat."
            action={
              <Link href="/dashboard/simulasi" className={buttonStyles({ variant: "primary" })}>
                Mulai simulasi
              </Link>
            }
          />
        ) : (
          <>
            <div className="prog-panel">
              <div className="prog-hero">
                <span className="prog-label">Skor NAP terbaik</span>
                <span className="prog-num">
                  <strong>{bestScore != null ? bestScore.toFixed(1) : "—"}</strong>
                </span>
                {bestScore != null && (
                  <span className={`prog-status${above ? " is-above" : ""}`}>
                    {above ? "Di atas" : "Di bawah"} ambang lulus {PASSING_NAP}
                  </span>
                )}
                <span className="prog-meta">
                  {lastActivity ? `Tes terakhir ${formatDate(lastActivity)}` : ""}
                  {standaloneCount > 0 ? ` · ${standaloneCount} sesi satu sub-tes` : ""}
                </span>
              </div>
              <div className="prog-body grid gap-5 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-dashed lg:divide-border">
                <div className="lg:pr-5">
                  <WeeklyFrequencyChart sessions={allSessions} />
                </div>
                <div className="lg:pl-5">
                  <NapTrendChart sessions={fullSessions} />
                </div>
              </div>
            </div>

            <dl className="prog-strip">
              <div>
                <dt>Tryout lengkap</dt>
                <dd className="prog-big">
                  {fullSessions.length}
                  <span> selesai</span>
                </dd>
              </div>
              <div>
                <dt>Lulus tryout</dt>
                <dd className="prog-big">
                  {passedCount}
                  <span>
                    {fullSessions.length
                      ? ` dari ${fullSessions.length} (${Math.round((passedCount / fullSessions.length) * 100)}%)`
                      : ""}
                  </span>
                </dd>
              </div>
            </dl>
          </>
        )}
      </section>
    </div>
  );
}
