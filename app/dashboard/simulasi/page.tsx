import Link from "next/link";
import { revalidatePath } from "next/cache";
import ResetSesiButton from "./ResetSesiButton";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MODULE_CONFIG, MODULE_ORDER, SIMULASI_PAKET, simulasiKartuOf, type ModuleType } from "@/lib/test-config";
import { createTestSessionAndRedirect } from "@/lib/test-session";
import { PageHeader, buttonStyles } from "@/app/components/ui";
import { ChevronDown, ChevronRight } from "@/app/components/icons";
import SimulasiCatalog, { type LastScores, type SimulasiItem, type SimulasiPackage } from "./SimulasiCatalog";
import SimulasiProgress, { type AspekTerakhir, type TryoutPoint } from "./SimulasiProgress";
import { aspekSesi, type HasilPsikogram } from "@/lib/scoring/psikogram";
import { profilPilihan, psikogramBanyak, wsModul } from "@/lib/scoring/psikogram-sesi";
import type { ModuleRow } from "@/lib/scoring/psikogram-rs";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function startSession(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) return;
  // Simulasi Penuh hanya tryout lengkap; mini tryout per sub-tes lewat menu Latihan/Mini Tryout.
  if (formData.get("module") !== "ALL") return;
  const paket = Number(formData.get("paket"));
  if (!SIMULASI_PAKET[paket]) return;
  // Nilai akhir dihitung dengan bobot profil tujuan, jadi profil wajib dipilih sebelum mulai.
  if (!(await profilPilihan())) return;
  await createTestSessionAndRedirect(session.sub, MODULE_ORDER, paket);
}

// Hapus sesi PENDING/IN_PROGRESS milik peserta yang login (user id dari cookie,
// bukan dari form). Sesi selesai & riwayat nilai tidak disentuh.
async function resetOpenSessions() {
  "use server";
  const session = await getSession();
  if (!session) return;
  const { data: open } = await supabaseAdmin
    .from("test_sessions")
    .select("id, module_sessions(id)")
    .eq("user_id", session.sub)
    .in("status", ["PENDING", "IN_PROGRESS"]);
  const testIds = (open ?? []).map((s) => s.id);
  if (!testIds.length) return;
  const moduleIds = (open ?? []).flatMap((s) => s.module_sessions.map((m) => m.id));
  if (moduleIds.length) {
    await supabaseAdmin.from("answers").delete().in("module_session_id", moduleIds);
    await supabaseAdmin.from("kecermatan_logs").delete().in("module_session_id", moduleIds);
    await supabaseAdmin.from("module_sessions").delete().in("id", moduleIds);
  }
  await supabaseAdmin.from("anti_cheat_events").delete().in("test_session_id", testIds);
  await supabaseAdmin.from("test_sessions").delete().in("id", testIds).eq("user_id", session.sub);
  revalidatePath("/dashboard/simulasi");
}

export default async function SimulasiPage() {
  const session = (await getSession())!;

  // Kecermatan sekarang punya banyak paket bank soal (masing-masing 500 soal, 1 dipilih
  // random per sesi/latihan) — hitung dari satu paket referensi, bukan total semua paket,
  // supaya angka yang ditampilkan cocok dengan jumlah soal yang benar-benar didapat user.
  // Hitung per type+paket (head count): select baris dipotong PostgREST di 1000, bank simulasi sudah > 1000.
  const bankKeys = [...new Set(Object.values(SIMULASI_PAKET).flatMap((p) => [`KECERDASAN:${p.KECERDASAN}`, `KEPRIBADIAN:${p.KEPRIBADIAN}`]))];
  const [bankCounts, { count: kecermatanCount }, { data: openSessions }, { data: doneSessions }] =
    await Promise.all([
      Promise.all(bankKeys.map(async (k) => {
        const [type, pkg] = k.split(":");
        const { count } = await supabaseAdmin.from("questions").select("id", { count: "exact", head: true })
          .eq("is_active", true).eq("type", type).eq("package_number", Number(pkg));
        return [k, count ?? 0] as const;
      })),
      supabaseAdmin
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("type", "KECERMATAN")
        .eq("is_active", true)
        .eq("package_number", 7),
      supabaseAdmin
        .from("test_sessions")
        .select("id, status, created_at")
        .eq("user_id", session.sub)
        .in("status", ["PENDING", "IN_PROGRESS"])
        .order("created_at", { ascending: false }),
      // Tren Nilai Akhir Psikotest: sesi selesai milik peserta ini, sama dengan Beranda.
      supabaseAdmin
        .from("test_sessions")
        .select("id, nap_score, completed_at, created_at, status, module_sessions(id, module_type, package_number, ke_index, kt_index, kh_index, raw_score)")
        .eq("user_id", session.sub)
        .in("status", ["COMPLETED", "DISQUALIFIED"])
        .order("created_at", { ascending: true }),
    ]);

  // Jumlah butir per type+paket bank soal ("KECERDASAN:12" → 100).
  const bankCount: Record<string, number> = Object.fromEntries(bankCounts);
  /** Butir per sub-tes untuk satu kartu paket; Kecermatan sama untuk semua paket. */
  const countsOf = (paket: number): Record<ModuleType, number> => ({
    KECERDASAN: bankCount[`KECERDASAN:${SIMULASI_PAKET[paket]?.KECERDASAN}`] ?? 0,
    KEPRIBADIAN: bankCount[`KEPRIBADIAN:${SIMULASI_PAKET[paket]?.KEPRIBADIAN}`] ?? 0,
    KECERMATAN: kecermatanCount ?? 0,
  });
  const totalOf = (paket: number) => MODULE_ORDER.reduce((sum, type) => sum + countsOf(paket)[type], 0);
  const totalMinutes =
    MODULE_ORDER.reduce((sum, type) => sum + MODULE_CONFIG[type].time_limit_seconds, 0) / 60;

  const running = openSessions ?? [];

  type Done = { id: string; completed_at: string | null; created_at: string; module_sessions: (ModuleRow & { raw_score: number | null })[] };
  const done = (doneSessions ?? []) as unknown as Done[];
  const isFull = (s: Done) => MODULE_ORDER.every((t) => s.module_sessions.some((m) => m.module_type === t));
  const full = done.filter(isFull);
  const single = done.length - full.length;

  // Psikogram profil pilihan peserta (Peraturan As SDM Kapolri No. 3/2017), dihitung saat dibaca.
  // Modul terakhir per sub-tes ikut dihitung untuk ringkasan kategori aspek.
  const profil = await profilPilihan();
  const terakhirPer = MODULE_ORDER.map((t) => {
    const s = [...done].reverse().find((x) => x.module_sessions.some((m) => m.module_type === t));
    return s ? { type: t, at: s.completed_at ?? s.created_at, m: s.module_sessions.find((m) => m.module_type === t)! } : null;
  }).filter((x) => x !== null);
  const [hasil, wsTerakhir] = await Promise.all([
    profil ? psikogramBanyak(full) : Promise.resolve(new Map<string, HasilPsikogram[]>()),
    wsModul(terakhirPer.map((x) => x.m)),
  ]);
  const nilaiOf = (s: Done) => (profil ? hasil.get(s.id)?.find((h) => h.jalur === profil) : undefined);
  const tryouts: TryoutPoint[] = full.flatMap((s) => {
    const h = nilaiOf(s);
    return h?.nilai_akhir != null ? [{ at: s.completed_at ?? s.created_at, nap: h.nilai_akhir, ms: h.status === "MS" }] : [];
  });
  const belumLengkap = profil ? full.length - tryouts.length : 0;
  const aspekTerakhir: AspekTerakhir = Object.fromEntries(
    terakhirPer.map((x) => [x.type, { at: x.at, aspek: aspekSesi(wsTerakhir.get(x.m.id) ?? {}) }]).filter(([, v]) => (v as { aspek: unknown[] }).aspek.length),
  );

  // Tryout lengkap per kartu paket: kartu dibaca dari package_number Kecerdasan
  // (null = sesi lama = Paket 1). `done` urut lama → baru.
  const paketOf = (s: Done) => simulasiKartuOf(s.module_sessions.find((m) => m.module_type === "KECERDASAN")?.package_number);
  const runsOf = (id: number) => full.filter((s) => paketOf(s) === id);
  const tanggal = (s: Done) => new Date(s.completed_at ?? s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  // Nilai murni sub-tes (isi madu di sisi kubus) dari tryout lengkap paket ini saja,
  // supaya kubus paket baru tidak terisi nilai paket lain. `runs` urut lama → baru.
  const lastOf = (id: number): LastScores => {
    const out: LastScores = {};
    for (const s of runsOf(id)) for (const m of s.module_sessions) {
      if (m.raw_score == null) continue;
      const t = m.module_type as ModuleType;
      out[t] = { score: m.raw_score, prev: out[t]?.score, at: tanggal(s) };
    }
    return out;
  };

  // 5 slot paket simulasi penuh. Kartu terbuka otomatis begitu paketnya terdaftar di
  // SIMULASI_PAKET dan bank soal Kecerdasan + Kepribadiannya sudah ada di DB.
  const packages: SimulasiPackage[] = [1, 2, 3, 4, 5].map((id) => ({
    id,
    meta: `${totalOf(id)} butir · ${totalMinutes} menit`,
    ready: !!SIMULASI_PAKET[id] && countsOf(id).KECERDASAN > 0 && countsOf(id).KEPRIBADIAN > 0,
    ...(() => {
      const runs = runsOf(id);
      const last = runs.at(-1);
      return {
        runs: runs.length,
        nap: (last && nilaiOf(last)?.nilai_akhir) ?? undefined,
        prev: (runs.at(-2) && nilaiOf(runs.at(-2)!)?.nilai_akhir) ?? undefined,
        at: last ? tanggal(last) : undefined,
      };
    })(),
  }));

  const itemsOf = (paket: number): SimulasiItem[] => [
    {
      id: "ALL",
      title: `Tryout Lengkap Paket ${paket}`,
      meta: `${totalOf(paket)} butir · ${totalMinutes} menit`,
      desc: "Ketiga sub-tes berurutan dengan timer berjalan. Hasil dihitung sebagai nilai akhir per profil (1–85).",
      faces: [...MODULE_ORDER],
    },
    ...MODULE_ORDER.map((type): SimulasiItem => {
      const meta = MODULE_CONFIG[type];
      return {
        id: type,
        title: meta.label,
        meta: `${countsOf(paket)[type]} butir · ${meta.time_limit_seconds / 60} menit`,
        desc: `Pratinjau sub-tes (${meta.shortDesc}). Sub-tes ini dikerjakan di dalam Tryout Lengkap; mini tryout per sub-tes ada di menu Latihan/Mini Tryout.`,
        faces: [type],
      };
    }),
  ];

  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Simulasi"
        title="Simulasi"
        description="Tes resmi dengan timer berjalan. Tryout lengkap dinilai dengan psikogram Peraturan As SDM Kapolri No. 3/2017 (nilai akhir 1–85) sesuai profil tujuanmu. Sisi kubus menunjukkan nilai terakhir tiap sub-tes di paket itu."
      />

      <SimulasiProgress tryouts={tryouts} aspekTerakhir={aspekTerakhir} single={single} profil={profil} belumLengkap={belumLengkap} />

      {/* Sesi yang belum selesai: jalan kembali kalau browser tertutup di tengah
          ujian (timer tetap jalan di server). Dilipat supaya tidak memenuhi layar. */}
      {running.length > 0 && (
        <details className="notice group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            Sesi belum selesai ({running.length})
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 divide-y divide-dashed divide-border">
            {running.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Sesi dibuat {formatDateTime(s.created_at)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Status {s.status === "PENDING" ? "belum dimulai" : "sedang berjalan"}
                  </p>
                </div>
                <Link
                  href={`/test/${s.id}`}
                  className={buttonStyles({ variant: "primary", size: "md" })}
                >
                  Buka sesi
                  <ChevronRight className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end border-t border-dashed border-border pt-3">
            <ResetSesiButton action={resetOpenSessions} count={running.length} />
          </div>
        </details>
      )}

      <section>
        <div className="mb-1">
          <span className="section-kicker">Katalog simulasi</span>
          <h2 className="mt-1 font-heading text-2xl">Pilih paket simulasi</h2>
        </div>
        <SimulasiCatalog packages={packages} items={Object.fromEntries(packages.filter((p) => p.ready).map((p) => [p.id, itemsOf(p.id)]))} last={Object.fromEntries(packages.filter((p) => p.ready).map((p) => [p.id, lastOf(p.id)]))} profil={profil} action={startSession} />
      </section>
    </div>
  );
}
