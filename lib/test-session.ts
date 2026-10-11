import "server-only";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  MODULE_CONFIG,
  SIMULASI_PAKET,
  pickRandomKecermatanPackage,
  type ModuleType,
} from "@/lib/test-config";

// Buat TestSession baru berisi ModuleSession untuk tiap module_type yang diminta
// (urutan array = sequence_order), lalu redirect ke halaman overview session.
// `paket` = kartu Simulasi Penuh; menentukan bank soal Kecerdasan/Kepribadian sesi ini.
export async function createTestSessionAndRedirect(userId: string, moduleTypes: ModuleType[], paket = 1) {
  const bank = SIMULASI_PAKET[paket];
  if (!bank) redirect("/dashboard/simulasi");
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
      package_number: type === "KECERMATAN" ? null : bank[type],
    }))
  );

  if (moduleError) {
    await supabaseAdmin.from("test_sessions").delete().eq("id", testSession.id);
    redirect("/dashboard/simulasi?error=create");
  }

  redirect(`/test/${testSession.id}`);
}
