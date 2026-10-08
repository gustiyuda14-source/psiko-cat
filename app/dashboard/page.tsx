import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import HomeView, { type HomeSession } from "./HomeView";

export default async function DashboardPage() {
  const session = (await getSession())!;

  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, nap_score, is_passed, completed_at, created_at, module_sessions(module_type)")
    .eq("user_id", session.sub)
    .order("created_at", { ascending: false });

  return <HomeView name={session.name} sessions={(sessions ?? []) as HomeSession[]} />;
}
