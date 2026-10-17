import Link from "next/link";
import { WeeklyFrequencyChart, NapTrendChart } from "./ActivityCharts";
import { buttonStyles, EmptyState, PageHeader } from "@/app/components/ui";
import { PaketCard } from "@/app/components/PaketCard";
import ProfilPicker from "@/app/components/ProfilPicker";
import { JALUR_LABEL, JALUR_SETARA, type Jalur } from "@/lib/scoring/psikogram";

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

export type KecermatanLatihanScore = { raw_score: number | string; created_at: string };

/* Tampilan Beranda murni (tanpa akses data) — page.tsx yang mengambil sesi. */
export default function HomeView({
  name,
  profil,
  sessions,
  kecermatanScores = [],
}: {
  name: string;
  profil: Jalur | null;
  sessions: HomeSession[];
  kecermatanScores?: KecermatanLatihanScore[];
}) {
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
  const scored = fullSessions.filter((s) => s.nap_score != null);
  const bestScore = scored.length ? Math.max(...scored.map((s) => s.nap_score!)) : null;
  const passedCount = fullSessions.filter((s) => s.is_passed).length;
  const lastActivity = completedSessions[0]?.completed_at ?? completedSessions[0]?.created_at;
  const above = scored.some((s) => s.nap_score === bestScore && s.is_passed);

  return (
    <div className="app-page">
      <PageHeader
        kicker="Beranda"
        title={`Halo, ${session.name}`}
        description="Pilih yang mau kamu kerjakan sekarang. Simulasi memberi nilai akhir psikotes per profil; latihan untuk berlatih per sub-tes tanpa batas waktu; review untuk membahas sesi yang sudah selesai."
      />

      <div className="pc-grid mt-5">
        <PaketCard
          href="/dashboard/simulasi"
          code="Simulasi"
          tag="Skor resmi"
          title="Tryout resmi dengan timer"
          desc={lastActivity ? `Tes terakhir ${formatDate(lastActivity)}` : "Belum ada tes resmi yang diselesaikan"}
          pointsLabel="Di dalamnya"
          points={["Kecerdasan, Kepribadian, Sikap Kerja", "Masuk riwayat dan grafik progress"]}
          cta="Buka simulasi"
        />
        <PaketCard
          href="/dashboard/latihan"
          code="Latihan"
          tag="Per sub-tes"
          title="Latihan per sub-tes"
          desc="Kecerdasan, Sikap Kerja, Kepribadian. Tidak masuk riwayat."
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
          <p>Nilai akhir psikogram (1–85) dari tryout lengkap{profil ? `, profil ${JALUR_LABEL[profil]} (${JALUR_SETARA[profil]})` : ""}</p>
          <ProfilPicker value={profil} className="mt-2" />
        </div>

        {completedSessions.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat tes"
            description="Selesaikan satu simulasi resmi untuk mulai melihat nilai akhir, tren, dan pembahasan soal di sini. Latihan tidak dihitung ke riwayat."
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
                <span className="prog-label">Nilai akhir terbaik{profil ? ` · ${JALUR_LABEL[profil]}` : ""}</span>
                <span className="prog-num">
                  <strong>{bestScore != null ? String(bestScore) : "—"}</strong>
                </span>
                {bestScore != null ? (
                  <span className={`prog-status${above ? " is-above" : ""}`}>
                    {above ? "Memenuhi Syarat" : "Belum Memenuhi Syarat"} · lulus {PASSING_NAP} dari 85
                  </span>
                ) : (
                  <span className="prog-status">{profil ? "Belum ada nilai untuk profil ini" : "Pilih profil tujuan untuk melihat nilai"}</span>
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
                  <NapTrendChart sessions={fullSessions} title="Tren nilai akhir" label="Nilai" max={85} />
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
                <dt>Memenuhi Syarat</dt>
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

        {/* Latihan Kecermatan mode timer tidak masuk NAP, tapi skornya dicatat supaya kemajuan terlihat. */}
        <div className="prog-panel is-stacked">
          <div className="prog-body">
            <NapTrendChart
              sessions={kecermatanScores.map((k) => ({
                status: "COMPLETED",
                nap_score: Number(k.raw_score),
                completed_at: k.created_at,
                created_at: k.created_at,
              }))}
              title="Tren skor latihan Kecermatan"
              label="Skor"
              threshold={null}
              emptyText="Selesaikan latihan Kecermatan mode timer per kolom untuk mulai melihat tren skornya."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
