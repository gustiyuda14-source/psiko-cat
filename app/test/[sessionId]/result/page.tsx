import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { runSessionCalculate } from "@/lib/scoring/runner";
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

function round1(n: number | null) {
  return n == null ? "-" : n.toFixed(1);
}

function ScoreRow({ label, value, max }: { label: string; value: number | null; max: number }) {
  const pct = value == null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">
          {round1(value)}
          <span className="text-muted-foreground text-xs">/{max}</span>
        </span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
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
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ calculate?: string }>;
}) {
  const { sessionId } = await params;
  const { calculate } = await searchParams;

  if (calculate === "1") {
    try {
      await runSessionCalculate(sessionId);
    } catch (e) {
      console.error("[result page calculate]", e);
    }
    redirect(`/test/${sessionId}/result`);
  }

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

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Status card */}
        <div
          className={`rounded-xl border p-6 text-center space-y-2 ${
            disqualified
              ? "border-destructive bg-destructive/10"
              : passed
              ? "border-success bg-success-soft"
              : "border-accent bg-accent-soft"
          }`}
        >
          <div className="text-4xl">{disqualified ? "✗" : passed ? "✓" : "—"}</div>
          <h1 className="text-2xl font-bold">
            {disqualified ? "Gugur Mutlak" : passed ? "Lulus" : "Tidak Lulus"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {user?.name} · {user?.email}
          </p>
          {session.disqualified_reason && (
            <p className="text-destructive text-xs">{session.disqualified_reason}</p>
          )}
        </div>

        {/* NAP score */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Nilai Akhir Psikotes (NAP)</p>
          <p className="text-5xl font-bold text-foreground">{round1(session.nap_score)}</p>
          {predikat && (
            <p className="text-sm font-semibold text-foreground">Predikat: {predikat}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {isStandalone ? "Lulus jika skor > 40" : "Lulus minimal 61 poin"}
          </p>
        </div>

        {/* Rincian nilai */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Rincian Nilai</h2>
          <ScoreRow label="Kecerdasan (max 60)" value={ks?.nap_contribution ?? null} max={60} />
          <ScoreRow label="Kepribadian (max 20)" value={kp?.nap_contribution ?? null} max={20} />
          <ScoreRow label="Kecermatan (max 20)" value={kc?.nap_contribution ?? null} max={20} />
          {kc && (
            <div className="pt-2 text-xs text-muted-foreground space-y-1 border-t border-border">
              <p>Ke (Kecepatan): {round1(kc.ke_index)}</p>
              <p>Kt (Ketelitian): {round1(kc.kt_index)}</p>
              <p>Kh (Ketahanan): {round1(kc.kh_index)}</p>
            </div>
          )}
        </div>

        {/* Pembahasan per sub-sesi */}
        <PembahasanSection
          kecerdasan={kecerdasanItems}
          kepribadian={kepribadianItems}
          kecermatan={kecermatanSummary}
          kecermatanDetail={kecermatanDetail}
        />

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard"
            className="block w-full rounded-xl border border-border text-foreground py-3 text-center text-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
          <Link
            href={`/dashboard/review?sesi=${sessionId}`}
            className="block w-full rounded-xl border border-border text-foreground py-3 text-center text-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            Buka di Review Soal
          </Link>
        </div>
      </div>
    </div>
  );
}
