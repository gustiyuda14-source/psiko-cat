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
import { EmptyState, PageHeader, buttonStyles } from "@/app/components/ui";
import { ArrowRight } from "@/app/components/icons";
import { MODULE_CONFIG, simulasiKartuOf, type ModuleType } from "@/lib/test-config";
import { psikogramSesi, wsSesi } from "@/lib/scoring/psikogram-sesi";
import { ASPEK_LABEL, JALUR_LABEL, aspekSesi } from "@/lib/scoring/psikogram";

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
  module_sessions: Array<{ module_type: string; package_number: number | null }>;
};

type Jenis = "simulasi" | "mini";

/* Kodifikasi sesi: Simulasi Penuh (dua sub-tes atau lebih, per kartu) vs Mini Tryout (satu sub-tes). */
function jenisOf(s: SessionListRow): { jenis: Jenis; kode: string; judul: string } {
  if (s.module_sessions.length === 1) {
    const type = s.module_sessions[0].module_type as ModuleType;
    return { jenis: "mini", kode: "MT", judul: `Mini Tryout · ${MODULE_CONFIG[type]?.label ?? type}` };
  }
  const kartu = simulasiKartuOf(s.module_sessions.find((m) => m.module_type === "KECERDASAN")?.package_number);
  return { jenis: "simulasi", kode: "SP", judul: kartu ? `Simulasi Penuh · Kartu ${kartu}` : "Simulasi Penuh" };
}

function formatWaktu(iso: string) {
  const d = new Date(iso);
  const tanggal = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  return `${tanggal}, ${jam}`;
}

function KodeSesi({ jenis, kode }: { jenis: Jenis; kode: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-9 shrink-0 place-items-center rounded-md font-heading text-[0.72rem] font-bold tracking-[0.08em] ${
        jenis === "simulasi" ? "bg-primary text-primary-foreground" : "border border-accent bg-accent-soft text-accent-ink"
      }`}
    >
      {kode}
    </span>
  );
}

const FILTER: { id: Jenis | "semua"; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "simulasi", label: "Simulasi" },
  { id: "mini", label: "Mini" },
];

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ sesi?: string; jenis?: string }>;
}) {
  const session = (await getSession())!;
  const { sesi, jenis: jenisParam } = await searchParams;
  const filter: Jenis | "semua" = jenisParam === "simulasi" || jenisParam === "mini" ? jenisParam : "semua";

  const { data: rows } = await supabaseAdmin
    .from("test_sessions")
    .select("id, nap_score, is_passed, status, completed_at, created_at, module_sessions(module_type, package_number)")
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
  const shown = filter === "semua" ? sessions : sessions.filter((s) => jenisOf(s).jenis === filter);
  const selected = (sesi && sessions.find((s) => s.id === sesi)) || shown[0] || sessions[0];
  const info = jenisOf(selected);
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ ...(filter !== "semua" ? { jenis: filter } : {}), ...extra });
    return `/dashboard/review?${p}`;
  };

  const { data: detail } = await supabaseAdmin
    .from("test_sessions")
    .select("id, nap_score, is_passed, module_sessions(*)")
    .eq("id", selected.id)
    .single();

  const moduleSessions = (detail?.module_sessions ?? []) as unknown as ModuleSessionRow[];
  const ks = moduleSessions.find((m) => m.module_type === "KECERDASAN");
  const kp = moduleSessions.find((m) => m.module_type === "KEPRIBADIAN");
  const kc = moduleSessions.find((m) => m.module_type === "KECERMATAN");

  const [kecerdasanItems, kepribadianItems, kecermatanDetail, profil, aspek] = await Promise.all([
    ks ? fetchKecerdasanReview(ks.id) : Promise.resolve([] as KecerdasanReviewItem[]),
    kp ? fetchKepribadianReview(kp.id) : Promise.resolve([] as KepribadianReviewItem[]),
    kc ? fetchKecermatanDetailReview(kc.id) : Promise.resolve([] as KecermatanColumnGroup[]),
    info.jenis === "simulasi" ? psikogramSesi(moduleSessions) : Promise.resolve(null),
    info.jenis === "mini" ? wsSesi(moduleSessions).then(aspekSesi) : Promise.resolve(null),
  ]);
  const aspekKs = aspek?.filter((a) => a.kategori === "KS") ?? [];

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
    <div className="app-page app-page-wide grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="order-2 space-y-6 lg:order-1">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-3">
              <KodeSesi jenis={info.jenis} kode={info.kode} />
              <div>
                <h1 className="text-[clamp(1.45rem,2.4vw,2rem)] font-bold leading-tight">{info.judul}</h1>
                <p className="tnum text-sm text-muted-foreground">{formatWaktu(selected.completed_at ?? selected.created_at)}</p>
              </div>
            </div>
            <Link href={`/test/${selected.id}/result?dari=review`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              Halaman hasil
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {profil && (
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4" aria-label="Nilai akhir per profil">
              {profil.map((h) => (
                <li key={h.jalur} className="bg-card">
                  <Link
                    href={`/test/${selected.id}/result?jalur=${h.jalur}&dari=review`}
                    className="flex h-full flex-col gap-1 px-4 py-3 transition-colors duration-150 hover:bg-surface-inset focus-visible:outline-3 focus-visible:outline-ring"
                  >
                    <span className="text-xs font-semibold text-muted-foreground">{JALUR_LABEL[h.jalur]}</span>
                    <span className="tnum font-heading text-2xl font-bold leading-none">
                      {h.nilai_akhir ?? "—"}
                      <span className="ml-1 text-xs font-semibold text-muted-foreground">/ 85</span>
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        h.status === "MS" ? "text-success" : h.status === "TMS" ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {h.status === "MS" ? "Memenuhi Syarat" : h.status === "TMS" ? "Tidak Memenuhi Syarat" : `${h.belum_diuji.length} aspek belum diuji`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {aspek && aspek.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <span className={`font-semibold ${aspekKs.length ? "text-destructive" : "text-success"}`}>
                {aspekKs.length ? `${aspekKs.length} aspek Kurang Sekali` : "Tidak ada aspek Kurang Sekali"}
              </span>
              <ul className="flex flex-wrap gap-2" aria-label="Kategori per aspek">
                {aspek.map((a) => (
                  <li
                    key={a.aspek}
                    className={`tnum rounded-md px-2 py-1 text-xs font-semibold ${
                      a.kategori === "KS" ? "bg-destructive-soft text-destructive" : "bg-surface-inset text-foreground"
                    }`}
                  >
                    {ASPEK_LABEL[a.aspek]} · {a.kategori}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        <PembahasanSection
          kecerdasan={kecerdasanItems}
          kepribadian={kepribadianItems}
          kecermatan={kecermatanSummary}
          kecermatanDetail={kecermatanDetail}
        />
      </div>

      <nav
        className="order-1 space-y-3 lg:order-2 lg:sticky lg:top-6 lg:self-start"
        aria-label="Pilih sesi selesai"
      >
        <h2 className="text-sm font-bold">Riwayat sesi</h2>
        <div className="flex gap-1 rounded-md bg-surface-inset p-1" role="group" aria-label="Saring jenis sesi">
          {FILTER.map((f) => (
            <Link
              key={f.id}
              href={f.id === "semua" ? "/dashboard/review" : `/dashboard/review?jenis=${f.id}`}
              aria-current={filter === f.id ? "true" : undefined}
              className={`flex-1 rounded-[5px] px-2 py-1.5 text-center text-xs font-semibold transition-colors duration-150 ${
                filter === f.id ? "bg-card text-foreground shadow-e1" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        {shown.length === 0 && <p className="text-sm text-muted-foreground">Belum ada sesi jenis ini.</p>}
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
          {shown.map((s) => {
            const active = s.id === selected.id;
            const j = jenisOf(s);
            return (
              <li key={s.id} className="min-w-56 shrink-0 lg:min-w-0">
                <Link
                  href={qs({ sesi: s.id })}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors duration-150 ${
                    active
                      ? "border-primary/45 bg-primary/6"
                      : "border-transparent hover:border-border hover:bg-surface-inset"
                  }`}
                >
                  <KodeSesi jenis={j.jenis} kode={j.kode} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{j.judul.replace(/^(Simulasi Penuh|Mini Tryout) · /, "")}</span>
                    <span className="tnum block text-xs text-muted-foreground">{formatWaktu(s.completed_at ?? s.created_at)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
