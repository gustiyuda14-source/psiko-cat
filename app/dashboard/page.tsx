import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LogoutButton from "@/app/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, nap_score, is_passed, completed_at, created_at")
    .eq("user_id", session.sub)
    .order("created_at", { ascending: false });

  const completedSessions = (sessions ?? []).filter(
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

        {/* Real Exam standalone per-modul */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Real Exam per Modul
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { slug: "kecerdasan", label: "Real Exam Kecerdasan" },
              { slug: "kecermatan", label: "Real Exam Kecermatan" },
              { slug: "kepribadian", label: "Real Exam Kepribadian" },
            ].map((m) => (
              <Link
                key={m.slug}
                href={`/test/new/${m.slug}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 hover:bg-zinc-800 transition-colors"
              >
                <p className="text-sm font-medium text-zinc-200">{m.label}</p>
                <span className="text-zinc-500 text-lg">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Latihan / Training — tanpa waktu, tidak disimpan */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Latihan / Training
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { slug: "kecerdasan", label: "Latihan Kecerdasan" },
              { slug: "kecermatan", label: "Latihan Kecermatan (Training)" },
              { slug: "kepribadian", label: "Latihan Kepribadian" },
            ].map((m) => (
              <Link
                key={m.slug}
                href={`/latihan/${m.slug}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 hover:bg-zinc-800 transition-colors"
              >
                <p className="text-sm font-medium text-zinc-200">{m.label}</p>
                <span className="text-zinc-500 text-lg">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
