import "server-only";

import { getSession, type SessionPayload } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { canAccessSession } from "@/lib/access-policy";

type AccessDenied = {
  ok: false;
  status: 401 | 403 | 404;
  message: string;
};

type SessionAccess = {
  ok: true;
  session: SessionPayload;
  testSession: { id: string; user_id: string; status: string };
};

export async function getSessionAccess(
  sessionId: string,
  allowAdmin = true
): Promise<SessionAccess | AccessDenied> {
  const session = await getSession();
  if (!session) return { ok: false, status: 401, message: "Unauthorized" };

  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .select("id, user_id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !data) return { ok: false, status: 404, message: "Session tidak ditemukan" };
  if (!canAccessSession(data.user_id, session, allowAdmin)) {
    return { ok: false, status: 403, message: "Akses sesi ditolak" };
  }

  return { ok: true, session, testSession: data };
}

export type ModuleAccessRow = {
  id: string;
  test_session_id: string;
  module_type: "KECERDASAN" | "KEPRIBADIAN" | "KECERMATAN";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "TIMED_OUT";
  sequence_order: number;
  time_limit_seconds: number;
  started_at: string | null;
  kecermatan_package_number: number | null;
  package_number: number | null;
};

export async function getModuleAccess(
  sessionId: string,
  moduleSessionId: string,
  allowAdmin = true
): Promise<
  | { ok: true; session: SessionPayload; moduleSession: ModuleAccessRow }
  | AccessDenied
> {
  const access = await getSessionAccess(sessionId, allowAdmin);
  if (!access.ok) return access;

  const { data, error } = await supabaseAdmin
    .from("module_sessions")
    .select(
      "id, test_session_id, module_type, status, sequence_order, time_limit_seconds, started_at, kecermatan_package_number, package_number"
    )
    .eq("id", moduleSessionId)
    .eq("test_session_id", sessionId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, status: 404, message: "Module session tidak ditemukan" };
  }

  return { ok: true, session: access.session, moduleSession: data as ModuleAccessRow };
}

export function isTerminalModule(status: ModuleAccessRow["status"]): boolean {
  return status === "COMPLETED" || status === "TIMED_OUT";
}

export function isModuleExpired(
  moduleSession: Pick<ModuleAccessRow, "module_type" | "started_at" | "time_limit_seconds">,
  now = Date.now()
): boolean {
  if (!moduleSession.started_at) return false;
  // Kebijakan resmi: 5 dtk modul umum. Kecermatan 120 dtk (dinaikkan dari 60 pada 2026-10-12,
  // disetujui pemilik): 9 layar intro × 5 dtk + jeda kirim log tiap pindah kolom membuat kolom 10
  // selesai ±665 dtk setelah mulai, sehingga batas 660 dtk menolak klik kolom terakhir (409).
  // Lama tiap kolom tetap dijaga layar peserta (60 dtk) dan withinColumnWindow saat penilaian.
  const graceSeconds = moduleSession.module_type === "KECERMATAN" ? 120 : 5;
  return (
    now >
    new Date(moduleSession.started_at).getTime() +
      (moduleSession.time_limit_seconds + graceSeconds) * 1000
  );
}

export async function isModuleSequenceAvailable(moduleSession: ModuleAccessRow): Promise<boolean> {
  if (moduleSession.sequence_order <= 1) return true;
  const { data, error } = await supabaseAdmin
    .from("module_sessions")
    .select("status, module_type, started_at, time_limit_seconds")
    .eq("test_session_id", moduleSession.test_session_id)
    .eq("sequence_order", moduleSession.sequence_order - 1)
    .maybeSingle();
  if (error) throw error;
  // Modul sebelumnya yang waktunya sudah habis dianggap selesai walau /complete tidak pernah
  // terkirim (tab ditutup, sinyal hilang), supaya sub-tes berikutnya tidak terkunci selamanya.
  return data?.status === "COMPLETED" || data?.status === "TIMED_OUT" || (data?.status === "IN_PROGRESS" && isModuleExpired(data));
}
