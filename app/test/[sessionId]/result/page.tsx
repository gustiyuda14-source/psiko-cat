import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";

function round1(n: number | null) {
  return n == null ? "-" : n.toFixed(1);
}

function ScoreRow({ label, value, max }: { label: string; value: number | null; max: number }) {
  const pct = value == null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono font-semibold">{round1(value)}<span className="text-zinc-500 text-xs">/{max}</span></span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ calculate?: string }>;
}) {
  const { sessionId } = await params;
  const { calculate } = await searchParams;

  // Trigger scoring if coming from overview with ?calculate=1
  if (calculate === "1") {
    try {
      await fetch(
        `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/sessions/${sessionId}/calculate`,
        { method: "POST", cache: "no-store" }
      );
    } catch {}
    redirect(`/test/${sessionId}/result`);
  }

  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      user: { select: { name: true, email: true } },
      module_sessions: { orderBy: { sequence_order: "asc" } },
    },
  });

  if (!session) notFound();

  // Not yet scored — send back
  if (session.status !== "COMPLETED" && session.status !== "DISQUALIFIED") {
    redirect(`/test/${sessionId}`);
  }

  const passed = session.is_passed === true;
  const disqualified = session.status === "DISQUALIFIED";

  const ks = session.module_sessions.find((m) => m.module_type === "KECERDASAN");
  const kp = session.module_sessions.find((m) => m.module_type === "KEPRIBADIAN");
  const kc = session.module_sessions.find((m) => m.module_type === "KECERMATAN");

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Result badge */}
        <div className={`rounded-xl border p-6 text-center space-y-2 ${
          disqualified
            ? "border-red-700 bg-red-950/30"
            : passed
            ? "border-emerald-700 bg-emerald-950/30"
            : "border-yellow-700 bg-yellow-950/20"
        }`}>
          <div className="text-4xl">{disqualified ? "✗" : passed ? "✓" : "—"}</div>
          <h1 className="text-2xl font-bold">
            {disqualified ? "Gugur Mutlak" : passed ? "Lulus" : "Tidak Lulus"}
          </h1>
          <p className="text-zinc-400 text-sm">{session.user.name} · {session.user.email}</p>
          {session.disqualified_reason && (
            <p className="text-red-400 text-xs">{session.disqualified_reason}</p>
          )}
        </div>

        {/* NAP Score */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Nilai Akhir Psikotes (NAP)</p>
          <p className="text-5xl font-bold">{round1(session.nap_score)}</p>
          <p className="text-xs text-zinc-500">Lulus minimal 61 poin</p>
        </div>

        {/* Module breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Rincian Nilai</h2>
          <ScoreRow label="Kecerdasan (max 60)" value={ks?.nap_contribution ?? null} max={60} />
          <ScoreRow label="Kepribadian (max 20)" value={kp?.nap_contribution ?? null} max={20} />
          <ScoreRow label="Kecermatan (max 20)" value={kc?.nap_contribution ?? null} max={20} />
          {kc && (
            <div className="pt-2 text-xs text-zinc-500 space-y-1 border-t border-zinc-800">
              <p>Ke (Kecepatan): {round1(kc.ke_index)}</p>
              <p>Kt (Ketelitian): {round1(kc.kt_index)}</p>
              <p>Kh (Ketahanan): {round1(kc.kh_index)}</p>
            </div>
          )}
        </div>

        <Link
          href="/test/new"
          className="block w-full rounded-xl border border-zinc-700 py-3 text-center text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Mulai Tes Baru
        </Link>
      </div>
    </div>
  );
}
