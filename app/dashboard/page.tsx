import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import HomeView, { type HomeSession, type KecermatanLatihanScore } from "./HomeView";

export default async function DashboardPage() {
  const session = (await getSession())!;

  const [{ data: sessions }, { data: kecermatanScores }] = await Promise.all([
    supabaseAdmin
      .from("test_sessions")
      .select("id, status, nap_score, is_passed, completed_at, created_at, module_sessions(module_type)")
      .eq("user_id", session.sub)
      .order("created_at", { ascending: false }),
    // Skor latihan Kecermatan mode timer (actions.ts); 30 terakhir cukup untuk tren.
    supabaseAdmin
      .from("latihan_kecermatan_scores")
      .select("raw_score, created_at")
      .eq("user_id", session.sub)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <HomeView
      name={session.name}
      sessions={(sessions ?? []) as HomeSession[]}
      kecermatanScores={(kecermatanScores ?? []) as KecermatanLatihanScore[]}
    />
  );
}
