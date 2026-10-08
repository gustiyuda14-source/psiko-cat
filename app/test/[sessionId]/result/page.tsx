import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getNAPPredikat } from "@/lib/scoring/nap";
import {
  fetchKecerdasanReview,
  fetchKepribadianReview,
  fetchKecermatanDetailReview,
} from "@/lib/review";
import {
  type KecerdasanReviewItem,
  type KepribadianReviewItem,
  type KecermatanSummary,
  type KecermatanColumnGroup,
} from "@/app/components/PembahasanSection";
import ResultView from "./ResultView";
import { getSessionAccess } from "@/lib/session-access";

const PASSING_NAP = 61;
const STANDALONE_PASSING = 40;

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

  return (
    <ResultView
      sessionId={sessionId}
      user={user}
      napScore={session.nap_score}
      passed={passed}
      disqualified={disqualified}
      disqualifiedReason={session.disqualified_reason}
      isStandalone={isStandalone}
      predikat={predikat}
      threshold={threshold}
      ks={ks ?? null}
      kp={kp ?? null}
      kc={kc ?? null}
      kecerdasanItems={kecerdasanItems}
      kepribadianItems={kepribadianItems}
      kecermatanSummary={kecermatanSummary}
      kecermatanDetail={kecermatanDetail}
    />
  );
}
