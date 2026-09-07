import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type ModuleType = "KECERDASAN" | "KECERMATAN" | "KEPRIBADIAN";

export const MODULE_CONFIG: Record<ModuleType, { slug: string; time_limit_seconds: number }> = {
  KECERDASAN: { slug: "kecerdasan", time_limit_seconds: 5400 },
  KECERMATAN: { slug: "kecermatan", time_limit_seconds: 600 },
  KEPRIBADIAN: { slug: "kepribadian", time_limit_seconds: 3600 },
};

export const SLUG_TO_MODULE: Record<string, ModuleType> = Object.fromEntries(
  (Object.entries(MODULE_CONFIG) as [ModuleType, { slug: string; time_limit_seconds: number }][]).map(
    ([type, cfg]) => [cfg.slug, type]
  )
);

// Buat TestSession baru berisi ModuleSession untuk tiap module_type yang diminta
// (urutan array = sequence_order), lalu redirect ke halaman overview session.
export async function createTestSessionAndRedirect(userId: string, moduleTypes: ModuleType[]) {
  const { data: testSession, error: sessionError } = await supabaseAdmin
    .from("test_sessions")
    .insert({ user_id: userId, status: "PENDING" })
    .select("id")
    .single();

  if (sessionError || !testSession) redirect("/dashboard");

  await supabaseAdmin.from("module_sessions").insert(
    moduleTypes.map((type, i) => ({
      test_session_id: testSession.id,
      module_type: type,
      sequence_order: i + 1,
      status: "NOT_STARTED",
      time_limit_seconds: MODULE_CONFIG[type].time_limit_seconds,
    }))
  );

  redirect(`/test/${testSession.id}`);
}
