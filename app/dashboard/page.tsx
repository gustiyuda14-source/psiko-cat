import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LogoutButton from "@/app/components/LogoutButton";

function napColor(score: number | null, passed: boolean | null) {
  if (score == null) return "text-zinc-400";
  if (!passed) return "text-red-400";
  return "text-emerald-400";
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, nap_score, is_passed, completed_at, created_at")
    .eq("user_id", session.sub)
    .order("created_at", { ascending: false });

  const history = sessions ?? [];
  const completedSessions = history.filter(
    (s) => s.status === "COMPLETED" || s.status === "DISQUALIFIED"
  );
  const bestScore = completedSessions.length
    ? Math.max(...completedSessions.map((s) => s.nap_score ?? 0))
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Halo, {session.name}</h1>
            <p className="text-sm text-zinc-500 mt-0.5">@{session.username}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        {completedSessions.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-white">{completedSessions.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Total Tes</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {completedSessions.filter((s) => s.is_passed).length}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Lulus</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{bestScore?.toFixed(1) ?? "-"}</p>
              <p className="text-xs text-zinc-500 mt-1">Skor Terbaik</p>
            </div>
          </div>
        )}

        {/* Start new test */}
        <Link
          href="/test/new"
          className="flex items-center justify-between rounded-xl border border-blue-700/50 bg-blue-600/10 px-6 py-4 hover:bg-blue-600/20 transition-colors"
        >
          <div>
            <p className="font-semibold text-blue-300">Mulai Tes Baru</p>
            <p className="text-xs text-zinc-500 mt-0.5">Kecerdasan · Kecermatan · Kepribadian</p>
          </div>
          <span className="text-blue-400 text-xl">→</span>
        </Link>

        {/* History */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Riwayat Tes {history.length > 0 && `(${history.length})`}
          </h2>

          {history.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center">
              <p className="text-zinc-500 text-sm">Belum ada tes yang dilakukan.</p>
            </div>
          )}

          {history.map((s) => {
            const done = s.status === "COMPLETED" || s.status === "DISQUALIFIED";
            const inProgress = s.status === "IN_PROGRESS" || s.status === "PENDING";
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {done ? (
                      <span className={`text-lg font-bold font-mono ${napColor(s.nap_score, s.is_passed)}`}>
                        {s.nap_score?.toFixed(1) ?? "-"}
                      </span>
                    ) : (
                      <span className="text-sm text-blue-400 font-medium">Berlangsung</span>
                    )}
                    {s.status === "DISQUALIFIED" && (
                      <span className="text-xs text-red-400 border border-red-800 rounded px-1.5 py-0.5">Gugur</span>
                    )}
                    {s.is_passed === true && (
                      <span className="text-xs text-emerald-400 border border-emerald-800 rounded px-1.5 py-0.5">Lulus</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600">{formatDate(s.completed_at ?? s.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {done && (
                    <Link
                      href={`/test/${s.id}/result`}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Detail →
                    </Link>
                  )}
                  {inProgress && (
                    <Link
                      href={`/test/${s.id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Lanjutkan →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
