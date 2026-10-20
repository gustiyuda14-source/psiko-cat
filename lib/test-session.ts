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

  // Masih ada sesi terbuka untuk paket ini (mis. login ulang setelah sinyal putus): buka sesi itu,
  // jangan buat sesi kosong baru yang membuat peserta mengira jawabannya hilang. Paket dikenali dari
  // bank Kecerdasan (unik per kartu). Sesi dengan sub-tes terbanyak yang sudah dimulai menang;
  // seri = terbaru. Mulai ulang dari nol tetap lewat "Reset sesi" di panel Sesi belum selesai.
  const { data: open } = await supabaseAdmin
    .from("test_sessions")
    .select("id, kc:module_sessions!inner(module_type, package_number), mods:module_sessions(status)")
    .eq("user_id", userId)
    .in("status", ["PENDING", "IN_PROGRESS"])
    .eq("kc.module_type", "KECERDASAN")
    .eq("kc.package_number", bank.KECERDASAN)
    .order("created_at", { ascending: false });
  const started = (s: { mods: { status: string }[] }) => s.mods.filter((m) => m.status !== "NOT_STARTED").length;
  let resume: { id: string; mods: { status: string }[] } | null = null;
  for (const s of open ?? []) if (!resume || started(s) > started(resume)) resume = s;
  if (resume) redirect(`/test/${resume.id}`);

  const { data: testSession, error: sessionError } = await supabaseAdmin
    .from("test_sessions")
    .insert({ user_id: userId, status: "PENDING" })
    .select("id")
    .single();

  if (sessionError || !testSession) redirect("/dashboard");

  // Kartu dengan paket Kecermatan sendiri memakai paket itu; kartu lain mengacak per sesi.
  const kecermatanPackage = moduleTypes.includes("KECERMATAN") ? (bank.KECERMATAN ?? pickRandomKecermatanPackage()) : null;

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
