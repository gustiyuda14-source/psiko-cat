import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LogoutButton from "@/app/components/LogoutButton";

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
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
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Dashboard Admin</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">D&apos;Ajiks Akademi · Psiko CAT</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
            <p className="text-3xl font-bold">{totalPeserta}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total Peserta</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
            <p className="text-3xl font-bold text-primary">{totalTes}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total Attempt</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
            <p className="text-3xl font-bold text-success">{totalLulus}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total Lulus</p>
          </div>
        </div>

        {/* Peserta table */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daftar Peserta</h2>

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
              <div key={u.id} className="rounded-2xl border border-border bg-card px-5 py-4 shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{u.name}</span>
                      <span className="text-xs text-muted-foreground">@{u.username}</span>
                      <span className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                        {u.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{sessions.length} attempt</span>
                      <span>{latestLulus} lulus</span>
                      {best?.nap_score != null && (
                        <span className={best.is_passed ? "text-success" : "text-destructive"}>
                          Terbaik: {best.nap_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {best && (
                      <Link
                        href={`/test/${best.id}/result`}
                        className="text-xs text-primary transition-colors hover:text-primary/70"
                      >
                        Lihat hasil terbaik →
                      </Link>
                    )}
                  </div>
                </div>

                {/* History per peserta */}
                {sessions.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {sessions.map((s) => {
                      const done = s.status === "COMPLETED" || s.status === "DISQUALIFIED";
                      return (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{formatDate(s.completed_at ?? s.created_at)}</span>
                          <div className="flex items-center gap-3">
                            {done ? (
                              <>
                                <span className={s.is_passed ? "text-success" : "text-destructive"}>
                                  {s.is_passed ? "Lulus" : s.status === "DISQUALIFIED" ? "Gugur" : "Tidak Lulus"}
                                </span>
                                <span className="font-mono text-foreground">
                                  {s.nap_score?.toFixed(1) ?? "-"}
                                </span>
                                <Link href={`/test/${s.id}/result`} className="text-muted-foreground hover:text-primary">
                                  Detail →
                                </Link>
                              </>
                            ) : (
                              <span className="text-primary">{s.status}</span>
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
