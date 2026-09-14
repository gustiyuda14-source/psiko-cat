import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getNAPPredikat } from "@/lib/scoring/nap";
import {
  fetchKecerdasanReview,
  fetchKepribadianReview,
  fetchKecermatanDetailReview,
} from "@/lib/review";
import PembahasanSection, {
  type KecerdasanReviewItem,
  type KepribadianReviewItem,
  type KecermatanSummary,
  type KecermatanColumnGroup,
} from "@/app/components/PembahasanSection";
import { Badge, Meter, PageHeader, buttonStyles } from "@/app/components/ui";
import { ChevronLeft, ChevronRight } from "@/app/components/icons";
import { getSessionAccess } from "@/lib/session-access";

const PASSING_NAP = 61;
const STANDALONE_PASSING = 40;

function round1(n: number | null) {
  return n == null ? "—" : n.toFixed(1);
}

function ScoreRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number | null;
  max: number;
}) {
  const ratio = value == null ? 0 : value / max;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-foreground">{label}</span>
        <span className="tnum font-semibold text-foreground">
          {round1(value)}
          <span className="font-normal text-muted-foreground">/{max}</span>
        </span>
      </div>
      <Meter
        value={value ?? 0}
        max={max}
        tone={ratio >= 0.7 ? "success" : ratio >= 0.5 ? "accent" : "danger"}
        label={`${label}: ${round1(value)} dari ${max}`}
      />
    </div>
  );
}

type ModuleSessionRow = {
  id: string;
  module_type: string;
  nap_contribution: number | null;
  raw_score: number | null;
  ke_index: number | null;
  kt_index: number | null;
  kh_index: number | null;
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const access = await getSessionAccess(sessionId);
  if (!access.ok) notFound();

  const { data: session } = await supabaseAdmin
    .from("test_sessions")
    .select(
      "id, status, nap_score, kecerdasan_contribution, kepribadian_contribution, kecermatan_contribution, is_passed, disqualified_reason, users(name, email), module_sessions(*)"
    )
    .eq("id", sessionId)
    .single();

  if (!session) notFound();

  if (session.status !== "COMPLETED" && session.status !== "DISQUALIFIED") {
    redirect(`/test/${sessionId}`);
  }

  const passed = session.is_passed === true;
  const disqualified = session.status === "DISQUALIFIED";

  const moduleSessions = session.module_sessions as unknown as ModuleSessionRow[];
  const user = session.users as unknown as { name: string; email: string } | null;

  const isStandalone = moduleSessions.length === 1;
  const predikat = isStandalone && session.nap_score != null ? getNAPPredikat(session.nap_score) : null;
  const threshold = isStandalone ? STANDALONE_PASSING : PASSING_NAP;

  const ks = moduleSessions.find((m) => m.module_type === "KECERDASAN");
  const kp = moduleSessions.find((m) => m.module_type === "KEPRIBADIAN");
  const kc = moduleSessions.find((m) => m.module_type === "KECERMATAN");

  // Fetch pembahasan data in parallel
  const [kecerdasanItems, kepribadianItems, kecermatanDetail] = await Promise.all([
    ks ? fetchKecerdasanReview(ks.id) : Promise.resolve([] as KecerdasanReviewItem[]),
    kp ? fetchKepribadianReview(kp.id) : Promise.resolve([] as KepribadianReviewItem[]),
    kc ? fetchKecermatanDetailReview(kc.id) : Promise.resolve([] as KecermatanColumnGroup[]),
  ]);

  const kecermatanSummary: KecermatanSummary | null = kc
    ? {
        ke_index: kc.ke_index,
        kt_index: kc.kt_index,
        kh_index: kc.kh_index,
        nap_contribution: kc.nap_contribution,
        raw_score: kc.raw_score,
      }
    : null;

  const outcome = disqualified ? "Gugur Mutlak" : passed ? "Lulus" : "Tidak Lulus";
  const outcomeTone = disqualified ? "danger" : passed ? "success" : "accent";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}
        >
          <ChevronLeft className="size-4" />
          Kembali ke beranda
        </Link>

        <div className="mt-5 space-y-6">
          <PageHeader
            title="Hasil psikotes"
            description={[user?.name, user?.email].filter(Boolean).join(" · ")}
            actions={<Badge tone={outcomeTone}>{outcome}</Badge>}
          />
          {/* Satu panel hasil, bukan tiga kotak terpisah untuk status, angka,
              dan ambang — ketiganya cuma bisa dibaca bersama. */}
          <section className="surface-panel overflow-hidden">
            <div className="px-5 py-6 sm:px-7 sm:py-7">
              <p className="text-xs font-medium text-muted-foreground">
                {isStandalone ? "Nilai Sub-Tes" : "Nilai Akhir Psikotes"}
              </p>
              <p className="tnum font-heading mt-1 text-6xl text-foreground">
                {round1(session.nap_score)}
              </p>
              {predikat && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Predikat <span className="font-semibold text-foreground">{predikat}</span>
                </p>
              )}

              <div className="mt-5">
                <Meter
                  value={session.nap_score ?? 0}
                  max={100}
                  tone={passed ? "success" : disqualified ? "danger" : "accent"}
                  label={`Skor ${round1(session.nap_score)} dari 100`}
                />
                <p className="tnum mt-2 text-xs text-muted-foreground">
                  {isStandalone ? "Harus di atas " : "Ambang lulus "}
                  <span className="font-semibold text-foreground">{threshold}</span>
                  {isStandalone ? " untuk sesi satu sub-tes" : " untuk tryout lengkap"}
                </p>
              </div>

              {session.disqualified_reason && (
                <p className="mt-5 rounded-md border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
                  {session.disqualified_reason}
                </p>
              )}
            </div>
          </section>

          <section className="surface-card space-y-5 px-5 py-5 sm:px-6">
            <h2 className="text-sm font-semibold text-foreground">Rincian kontribusi nilai</h2>
            <ScoreRow label="Kecerdasan" value={ks?.nap_contribution ?? null} max={60} />
            <ScoreRow label="Kepribadian" value={kp?.nap_contribution ?? null} max={20} />
            <ScoreRow label="Kecermatan" value={kc?.nap_contribution ?? null} max={20} />

            {kc && (
              <dl className="inset-panel grid grid-cols-3 gap-3 px-4 py-3 text-center">
                {[
                  { label: "Kecepatan", value: kc.ke_index },
                  { label: "Ketelitian", value: kc.kt_index },
                  { label: "Ketahanan", value: kc.kh_index },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs text-muted-foreground">{item.label}</dt>
                    <dd className="tnum mt-0.5 font-semibold text-foreground">
                      {round1(item.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <PembahasanSection
            kecerdasan={kecerdasanItems}
            kepribadian={kepribadianItems}
            kecermatan={kecermatanSummary}
            kecermatanDetail={kecermatanDetail}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/simulasi"
              className={buttonStyles({ variant: "secondary", size: "lg", className: "flex-1" })}
            >
              Coba simulasi lagi
            </Link>
            <Link
              href={`/dashboard/review?sesi=${sessionId}`}
              className={buttonStyles({ variant: "primary", size: "lg", className: "flex-1" })}
            >
              Buka di Ruang Review
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
