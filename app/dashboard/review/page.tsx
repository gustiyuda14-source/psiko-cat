import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  fetchKecerdasanReview,
  fetchKepribadianReview,
  fetchKecermatanDetailReview,
} from "@/lib/review";
import PembahasanSection, {
  type KecerdasanReviewItem,
  type KepribadianReviewItem,
  type KecermatanSummary,
  type KecermatanColumnGroup,
} from "@/app/components/PembahasanSection";

type ModuleSessionRow = {
  id: string;
  module_type: string;
  nap_contribution: number | null;
  raw_score: number | null;
  ke_index: number | null;
  kt_index: number | null;
  kh_index: number | null;
};

type SessionListRow = {
  id: string;
  nap_score: number | null;
  is_passed: boolean | null;
  status: string;
  completed_at: string | null;
  created_at: string;
};

function round1(n: number | null) {
  return n == null ? "-" : n.toFixed(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ sesi?: string }>;
}) {
  const session = (await getSession())!;
  const { sesi } = await searchParams;

  const { data: rows } = await supabaseAdmin
    .from("test_sessions")
    .select("id, nap_score, is_passed, status, completed_at, created_at")
    .eq("user_id", session.sub)
    .in("status", ["COMPLETED", "DISQUALIFIED"])
    .order("created_at", { ascending: false });

  const sessions = (rows ?? []) as SessionListRow[];

  if (!sessions.length) {
    return (
      <div className="app-page space-y-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Ruang Review</h1>
        <div className="surface-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Belum ada sesi yang selesai.</p>
          <Link href="/dashboard/simulasi" className="mt-3 inline-block text-sm font-semibold text-primary">
            Mulai Simulasi →
          </Link>
        </div>
      </div>
    );
  }

  // Sesi hanya boleh dipilih dari daftar sesi milik user ini sendiri (sudah difilter user_id di atas).
  // ?sesi= yang tidak cocok (bukan milik user, atau belum selesai) diam-diam jatuh ke sesi terbaru.
  const selected = (sesi && sessions.find((s) => s.id === sesi)) || sessions[0];

  const { data: detail } = await supabaseAdmin
    .from("test_sessions")
    .select("id, nap_score, is_passed, module_sessions(*)")
    .eq("id", selected.id)
    .single();

  const moduleSessions = (detail?.module_sessions ?? []) as unknown as ModuleSessionRow[];
  const ks = moduleSessions.find((m) => m.module_type === "KECERDASAN");
  const kp = moduleSessions.find((m) => m.module_type === "KEPRIBADIAN");
  const kc = moduleSessions.find((m) => m.module_type === "KECERMATAN");

  const [kecerdasanItems, kepribadianItems, kecermatanDetail] = await Promise.all([
    ks ? fetchKecerdasanReview(ks.id) : Promise.resolve([] as KecerdasanReviewItem[]),
    kp ? fetchKepribadianReview(kp.id) : Promise.resolve([] as KepribadianReviewItem[]),
    kc ? fetchKecermatanDetailReview(kc.id) : Promise.resolve([] as KecermatanColumnGroup[]),
  ]);

  const kecermatanSummary: KecermatanSummary | null = kc
    ? {
        ke_index: kc.ke_index,
        kt_index: kc.kt_index,
        kh_index: kc.kh_index,
        nap_contribution: kc.nap_contribution,
        raw_score: kc.raw_score,
      }
    : null;

  return (
    <div className="app-page grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="order-2 space-y-6 lg:order-1">
        <div className="surface-card p-5">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Ruang Review</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {formatDate(selected.completed_at ?? selected.created_at)}
            </span>
            <span className="font-mono font-semibold text-foreground">
              NAP {round1(selected.nap_score)}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                selected.status === "DISQUALIFIED"
                  ? "bg-destructive text-white"
                  : selected.is_passed
                  ? "bg-success text-white"
                  : "bg-accent text-primary"
              }`}
            >
              {selected.status === "DISQUALIFIED" ? "Gugur" : selected.is_passed ? "Lulus" : "Tidak Lulus"}
            </span>
          </div>
        </div>

        <PembahasanSection
          kecerdasan={kecerdasanItems}
          kepribadian={kepribadianItems}
          kecermatan={kecermatanSummary}
          kecermatanDetail={kecermatanDetail}
        />
      </div>

      <nav className="order-1 space-y-2 lg:order-2 lg:sticky lg:top-6 lg:self-start" aria-label="Pilih sesi selesai">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sesi Selesai
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">{sessions.map((s) => {
          const active = s.id === selected.id;
          return (
            <Link
              key={s.id}
              href={`/dashboard/review?sesi=${s.id}`}
              aria-current={active ? "page" : undefined}
              className={`block min-w-40 shrink-0 rounded-xl border bg-card px-4 py-3 text-sm transition-colors lg:min-w-0 ${
                active ? "border-primary/30 bg-primary/7" : "border-border hover:bg-primary/5"
              }`}
            >
              <p className="font-medium text-foreground">{formatDate(s.completed_at ?? s.created_at)}</p>
              <p className="text-xs text-muted-foreground">NAP {round1(s.nap_score)}</p>
            </Link>
          );
        })}</div>
      </nav>
    </div>
  );
}
