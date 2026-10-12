import Link from "next/link";
import { WeeklyFrequencyChart, NapTrendChart } from "./ActivityCharts";
import { buttonStyles, EmptyState, PageHeader } from "@/app/components/ui";
import { PaketCard } from "@/app/components/PaketCard";

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

      <div className="pc-grid mt-5">
        <PaketCard
          href="/dashboard/simulasi"
          code="Simulasi"
          tag="Skor resmi"
          title="Tryout resmi dengan timer"
          desc={lastActivity ? `Tes terakhir ${formatDate(lastActivity)}` : "Belum ada tes resmi yang diselesaikan"}
          pointsLabel="Di dalamnya"
          points={["Kecerdasan, Kepribadian, Kecermatan", "Masuk riwayat dan grafik progress"]}
          cta="Buka simulasi"
        />
        <PaketCard
          href="/dashboard/latihan"
          code="Latihan"
          tag="Per sub-tes"
          title="Latihan per sub-tes"
          desc="Kecerdasan, Kecermatan, Kepribadian. Tidak masuk riwayat."
          pointsLabel="Di dalamnya"
          points={["Paket latihan per sub-tes", "Pembahasan setelah selesai"]}
          cta="Buka latihan"
        />
        <PaketCard
          href="/dashboard/kosakata"
          code="Kosakata"
          tag="Verbal"
          title="Perbanyak kosakata"
          desc="Kata baku dan serapan untuk soal verbal: arti, sinonim, antonim, contoh kalimat."
          pointsLabel="Di dalamnya"
          points={["Filter kata sifat, benda, kerja", "Tandai kata yang sudah hafal"]}
          cta="Buka kosakata"
        />
        <PaketCard
          href="/dashboard/review"
          code="Review Soal"
          tag="Pembahasan"
          title="Pembahasan sesi selesai"
          desc="Lihat jawaban, kunci, dan pembahasan per sub-tes dan per butir."
          pointsLabel="Di dalamnya"
          points={["Jawaban dan kunci per butir", "Pembahasan per sub-tes"]}
          cta="Buka review"
        />
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
