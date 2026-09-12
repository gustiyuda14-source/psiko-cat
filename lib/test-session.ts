import "server-only";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  MODULE_CONFIG,
  pickRandomKecermatanPackage,
  type ModuleType,
} from "@/lib/test-config";

// Buat TestSession baru berisi ModuleSession untuk tiap module_type yang diminta
// (urutan array = sequence_order), lalu redirect ke halaman overview session.
export async function createTestSessionAndRedirect(userId: string, moduleTypes: ModuleType[]) {
  const { data: testSession, error: sessionError } = await supabaseAdmin
    .from("test_sessions")
    .insert({ user_id: userId, status: "PENDING" })
    .select("id")
    .single();

  if (sessionError || !testSession) redirect("/dashboard");

  const kecermatanPackage = moduleTypes.includes("KECERMATAN") ? pickRandomKecermatanPackage() : null;

  const { error: moduleError } = await supabaseAdmin.from("module_sessions").insert(
    moduleTypes.map((type, i) => ({
      test_session_id: testSession.id,
      module_type: type,
      sequence_order: i + 1,
      status: "NOT_STARTED",
      time_limit_seconds: MODULE_CONFIG[type].time_limit_seconds,
      kecermatan_package_number: type === "KECERMATAN" ? kecermatanPackage : null,
    }))
  );

  if (moduleError) {
    await supabaseAdmin.from("test_sessions").delete().eq("id", testSession.id);
    redirect("/dashboard/simulasi?error=create");
  }

  redirect(`/test/${testSession.id}`);
}
