import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MODULES = [
  { type: "KECERDASAN",  time_limit_seconds: 5400, sequence_order: 1 },
  { type: "KECERMATAN",  time_limit_seconds: 600,  sequence_order: 2 },
  { type: "KEPRIBADIAN", time_limit_seconds: 3600, sequence_order: 3 },
];

// Server component: buat test session langsung, redirect ke halaman overview
export default async function NewTestPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", session.username)
    .single();

  if (!user) redirect("/login");

  const { data: testSession, error: sessionError } = await supabaseAdmin
    .from("test_sessions")
    .insert({ user_id: user.id, status: "PENDING" })
    .select("id")
    .single();

  if (sessionError || !testSession) redirect("/dashboard");

  await supabaseAdmin
    .from("module_sessions")
    .insert(
      MODULES.map((m) => ({
        test_session_id: testSession.id,
        module_type: m.type,
        sequence_order: m.sequence_order,
        status: "NOT_STARTED",
        time_limit_seconds: m.time_limit_seconds,
      }))
    );

  redirect(`/test/${testSession.id}`);
}
