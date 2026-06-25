import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function LogoutButton() {
  return (
    <form method="POST" action="/api/auth/logout">
      <button
        type="submit"
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600"
      >
        Keluar
      </button>
    </form>
  );
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  const { data: users } = await supabaseAdmin
    .from("users")
    .select(`
      id, name, username, gender,
      test_sessions (
        id, status, nap_score, is_passed, completed_at, created_at
      )
    `)
    .eq("role", "peserta")
    .order("name", { ascending: true });

  type UserRow = {
    id: string;
    name: string;
    username: string;
    gender: string | null;
    test_sessions: Array<{
      id: string;
      status: string;
      nap_score: number | null;
      is_passed: boolean | null;
      completed_at: string | null;
      created_at: string;
    }>;
  };

  const peserta = (users ?? []) as unknown as UserRow[];

  const totalPeserta = peserta.length;
  const totalTes = peserta.reduce((s, u) => s + (u.test_sessions?.length ?? 0), 0);
  const totalLulus = peserta.reduce(
    (s, u) => s + (u.test_sessions?.filter((t) => t.is_passed).length ?? 0), 0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Admin</h1>
            <p className="text-sm text-zinc-500 mt-0.5">D&apos;Ajiks Akademi · Psiko CAT</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <p className="text-3xl font-bold">{totalPeserta}</p>
            <p className="text-xs text-zinc-500 mt-1">Total Peserta</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{totalTes}</p>
            <p className="text-xs text-zinc-500 mt-1">Total Attempt</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{totalLulus}</p>
            <p className="text-xs text-zinc-500 mt-1">Total Lulus</p>
          </div>
        </div>

        {/* Peserta table */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Daftar Peserta</h2>

          {peserta.map((u) => {
            const sessions = (u.test_sessions ?? []).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const completed = sessions.filter(
              (s) => s.status === "COMPLETED" || s.status === "DISQUALIFIED"
            );
            const best = completed.length
              ? completed.reduce((p, c) =>
                  (c.nap_score ?? 0) > (p.nap_score ?? 0) ? c : p
                )
              : null;
            const latestLulus = completed.filter((s) => s.is_passed).length;

            return (
              <div key={u.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{u.name}</span>
                      <span className="text-xs text-zinc-600">@{u.username}</span>
                      <span className="text-xs text-zinc-700 border border-zinc-800 rounded px-1.5 py-0.5">
                        {u.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                      <span>{sessions.length} attempt</span>
                      <span>{latestLulus} lulus</span>
                      {best?.nap_score != null && (
                        <span className={best.is_passed ? "text-emerald-400" : "text-red-400"}>
                          Terbaik: {best.nap_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {best && (
                      <Link
                        href={`/test/${best.id}/result`}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        Lihat hasil terbaik →
                      </Link>
                    )}
                  </div>
                </div>

                {/* History per peserta */}
                {sessions.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
                    {sessions.map((s) => {
                      const done = s.status === "COMPLETED" || s.status === "DISQUALIFIED";
                      return (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600">{formatDate(s.completed_at ?? s.created_at)}</span>
                          <div className="flex items-center gap-3">
                            {done ? (
                              <>
                                <span className={s.is_passed ? "text-emerald-400" : "text-red-400"}>
                                  {s.is_passed ? "Lulus" : s.status === "DISQUALIFIED" ? "Gugur" : "Tidak Lulus"}
                                </span>
                                <span className="font-mono text-zinc-300">
                                  {s.nap_score?.toFixed(1) ?? "-"}
                                </span>
                                <Link href={`/test/${s.id}/result`} className="text-zinc-500 hover:text-zinc-300">
                                  Detail →
                                </Link>
                              </>
                            ) : (
                              <span className="text-blue-400">{s.status}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
