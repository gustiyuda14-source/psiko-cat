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
import { Badge, EmptyState, PageHeader, buttonStyles } from "@/app/components/ui";
import { ArrowRight } from "@/app/components/icons";

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
  module_sessions: Array<{ module_type: string }>;
};

function sessionKind(s: SessionListRow) {
  return s.module_sessions.length === 1 ? "Sub-tes" : "NAP";
}

function round1(n: number | null) {
  return n == null ? "—" : n.toFixed(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function outcome(s: SessionListRow) {
  if (s.status === "DISQUALIFIED") return { label: "Gugur", tone: "danger" as const };
  if (s.is_passed) return { label: "Lulus", tone: "success" as const };
  return { label: "Tidak Lulus", tone: "accent" as const };
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
    .select("id, nap_score, is_passed, status, completed_at, created_at, module_sessions(module_type)")
    .eq("user_id", session.sub)
    .in("status", ["COMPLETED", "DISQUALIFIED"])
    .order("created_at", { ascending: false });

  const sessions = (rows ?? []) as SessionListRow[];

  if (!sessions.length) {
    return (
      <div className="app-page space-y-6">
        <PageHeader
          title="Ruang Review"
          description="Pembahasan lengkap tiap sesi resmi yang sudah selesai, per sub-tes dan per butir."
        />
        <EmptyState
          title="Belum ada sesi selesai"
          description="Pembahasan muncul di sini setelah satu sesi simulasi resmi selesai dihitung. Latihan tidak masuk ke ruang ini."
          action={
            <Link href="/dashboard/simulasi" className={buttonStyles({ variant: "primary" })}>
              Mulai simulasi
              <ArrowRight className="size-4" />
            </Link>
          }
        />
      </div>
    );
  }

  // Sesi hanya boleh dipilih dari daftar sesi milik user ini sendiri (sudah difilter user_id di atas).
  // ?sesi= yang tidak cocok (bukan milik user, atau belum selesai) diam-diam jatuh ke sesi terbaru.
  const selected = (sesi && sessions.find((s) => s.id === sesi)) || sessions[0];
  const selectedOutcome = outcome(selected);

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
    <div className="app-page grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="order-2 space-y-6 lg:order-1">
        <div className="hero-panel on-nav">
          <h1 className="font-heading text-2xl text-white sm:text-3xl">Ruang Review</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-white/75">
              {formatDate(selected.completed_at ?? selected.created_at)}
            </span>
            <span className="tnum font-semibold text-white">
              {sessionKind(selected)} {round1(selected.nap_score)}
            </span>
            <Badge tone={selectedOutcome.tone}>{selectedOutcome.label}</Badge>
            <Link
              href={`/test/${selected.id}/result`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-white underline decoration-accent underline-offset-4"
            >
              Lihat halaman hasil
            </Link>
          </div>
        </div>

        <PembahasanSection
          kecerdasan={kecerdasanItems}
          kepribadian={kepribadianItems}
          kecermatan={kecermatanSummary}
          kecermatanDetail={kecermatanDetail}
        />
      </div>

      <nav
        className="order-1 space-y-2 lg:order-2 lg:sticky lg:top-6 lg:self-start"
        aria-label="Pilih sesi selesai"
      >
        <h2 className="rule-ornate">Sesi selesai</h2>
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
          {sessions.map((s) => {
            const active = s.id === selected.id;
            const o = outcome(s);
            return (
              <li key={s.id} className="min-w-44 shrink-0 lg:min-w-0">
                <Link
                  href={`/dashboard/review?sesi=${s.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-md border px-4 py-3 transition-colors duration-200 ${
                    active
                      ? "border-primary/45 bg-primary/6"
                      : "border-border bg-card hover:border-border-strong hover:bg-surface-inset"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(s.completed_at ?? s.created_at)}
                  </p>
                  <p className="tnum mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {sessionKind(s)} {round1(s.nap_score)}
                    <span
                      className={`font-semibold ${
                        o.tone === "success"
                          ? "text-success"
                          : o.tone === "danger"
                            ? "text-destructive"
                            : "text-accent-ink"
                      }`}
                    >
                      {o.label}
                    </span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
