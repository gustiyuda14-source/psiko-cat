import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "TIMED_OUT";

const MODULE_META = {
  KECERDASAN:  { label: "Sub-Tes Kecerdasan",  desc: "100 soal · 90 menit · kognitif & spasial", href: "kecerdasan",  order: 1 },
  KECERMATAN:  { label: "Sub-Tes Kecermatan",   desc: "500 soal · 10 menit · 10 lajur simbol",   href: "kecermatan",  order: 2 },
  KEPRIBADIAN: { label: "Sub-Tes Kepribadian",  desc: "100 pernyataan · 60 menit · skala Likert", href: "kepribadian", order: 3 },
} as const;

function statusBadge(s: ModuleStatus) {
  if (s === "COMPLETED" || s === "TIMED_OUT")
    return <span className="rounded-full bg-emerald-700/40 border border-emerald-600 px-2 py-0.5 text-xs text-emerald-300">Selesai</span>;
  if (s === "IN_PROGRESS")
    return <span className="rounded-full bg-blue-700/40 border border-blue-600 px-2 py-0.5 text-xs text-blue-300">Berlangsung</span>;
  return <span className="rounded-full bg-zinc-700/40 border border-zinc-600 px-2 py-0.5 text-xs text-zinc-400">Belum Dimulai</span>;
}

export default async function SessionOverviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const { data: session } = await supabaseAdmin
    .from("test_sessions")
    .select("id, status, users(name, email), module_sessions(*)")
    .eq("id", sessionId)
    .single();

  if (!session) notFound();

  if (session.status === "COMPLETED" || session.status === "DISQUALIFIED") {
    redirect(`/test/${sessionId}/result`);
  }

  const moduleSessions = (session.module_sessions as Array<{
    id: string;
    module_type: string;
    status: ModuleStatus;
    sequence_order: number;
  }>).sort((a, b) => a.sequence_order - b.sequence_order);

  const user = session.users as unknown as { name: string; email: string } | null;

  const allDone = moduleSessions.every(
    (m) => m.status === "COMPLETED" || m.status === "TIMED_OUT"
  );

  const getButtonState = (moduleType: string, seqOrder: number) => {
    const m = moduleSessions.find((ms) => ms.module_type === moduleType);
    if (!m) return { disabled: true, label: "Tidak Tersedia" };
    if (m.status === "COMPLETED" || m.status === "TIMED_OUT") return { disabled: true, label: "Selesai ✓" };
    if (m.status === "IN_PROGRESS") return { disabled: false, label: "Lanjutkan →" };
    const prev = moduleSessions.find((ms) => ms.sequence_order === seqOrder - 1);
    if (seqOrder === 1 || prev?.status === "COMPLETED" || prev?.status === "TIMED_OUT") {
      return { disabled: false, label: "Mulai" };
    }
    return { disabled: true, label: "Terkunci" };
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Psiko CAT</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Peserta: <span className="text-white">{user?.name}</span>
            <span className="text-zinc-600 ml-2">({user?.email})</span>
          </p>
        </div>

        <div className="space-y-3">
          {moduleSessions.map((ms) => {
            const meta = MODULE_META[ms.module_type as keyof typeof MODULE_META];
            const btn = getButtonState(ms.module_type, ms.sequence_order);
            return (
              <div
                key={ms.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{meta.label}</span>
                    {statusBadge(ms.status)}
                  </div>
                  <p className="text-xs text-zinc-500">{meta.desc}</p>
                </div>
                {btn.disabled ? (
                  <span className="text-sm text-zinc-500">{btn.label}</span>
                ) : (
                  <Link
                    href={`/test/${sessionId}/${meta.href}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500 transition-colors"
                  >
                    {btn.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {allDone && (
          <form action={`/test/${sessionId}/result`} method="GET">
            <input type="hidden" name="calculate" value="1" />
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-bold hover:bg-emerald-500 transition-colors"
            >
              Hitung Nilai NAP →
            </button>
          </form>
        )}

        {!allDone && (
          <p className="text-center text-xs text-zinc-600">
            Selesaikan ketiga sub-tes secara berurutan untuk menghitung nilai NAP.
          </p>
        )}
      </div>
    </div>
  );
}
