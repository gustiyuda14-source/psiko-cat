import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Accordion, Badge, EmptyState, PageHeader, buttonStyles } from "@/app/components/ui";
import { ChevronRight } from "@/app/components/icons";
import ProfilPicker from "@/app/components/ProfilPicker";
import { JALUR_LABEL, type HasilPsikogram } from "@/lib/scoring/psikogram";
import { profilPilihan, psikogramBanyak } from "@/lib/scoring/psikogram-sesi";
import type { ModuleRow } from "@/lib/scoring/psikogram-rs";
import { MODULE_CONFIG, SIMULASI_PAKET, simulasiKartuOf, type ModuleType } from "@/lib/test-config";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
        id, status, nap_score, is_passed, completed_at, created_at,
        module_sessions ( id, module_type, package_number, ke_index, kt_index, kh_index )
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
      module_sessions: ModuleRow[];
    }>;
  };

  const peserta = (users ?? []) as unknown as UserRow[];

  // F09 (AUDIT_CAT_2026-09-12.md): rumus Kecermatan v1 memberi Kh 100 walau
  // responsnya dikit banget asal rata antar lajur. Rumus v2 (2026-10-11,
  // lib/scoring/kecermatan.ts) sudah meredam Kh untuk volume kecil; penanda ini
  // dipertahankan untuk sesi lama yang dinilai dengan v1.
  function needsKecermatanReview(testSession: UserRow["test_sessions"][number]) {
    return testSession.module_sessions.some(
      (m) => m.module_type === "KECERMATAN" && (m.ke_index ?? 100) < 30 && (m.kh_index ?? 0) >= 90
    );
  }

  // Nilai = psikogram profil pilihan admin (Peraturan As SDM Kapolri No. 3/2017), dihitung saat dibaca.
  const profil = await profilPilihan();
  const selesai = (t: UserRow["test_sessions"][number]) => t.status === "COMPLETED" || t.status === "DISQUALIFIED";
  const tigaModul = (t: UserRow["test_sessions"][number]) => new Set(t.module_sessions.map((m) => m.module_type)).size === 3;
  const lengkap = (t: UserRow["test_sessions"][number]) => selesai(t) && tigaModul(t);
  const hasil = profil
    ? await psikogramBanyak(peserta.flatMap((u) => u.test_sessions ?? []).filter(lengkap))
    : new Map<string, HasilPsikogram[]>();
  const nilaiOf = (t: UserRow["test_sessions"][number]) => (profil ? hasil.get(t.id)?.find((h) => h.jalur === profil) : undefined);
  const ms = (t: UserRow["test_sessions"][number]) => nilaiOf(t)?.status === "MS";
  // Kartu simulasi dibaca dari package_number Kecerdasan (null = sesi lama = Paket 1), sama dengan /dashboard/simulasi.
  const kartuOf = (t: UserRow["test_sessions"][number]) =>
    simulasiKartuOf(t.module_sessions.find((m) => m.module_type === "KECERDASAN")?.package_number);
  const kartuIds = Object.keys(SIMULASI_PAKET).map(Number);

  const totalPeserta = peserta.length;
  const totalTes = peserta.reduce((s, u) => s + (u.test_sessions?.length ?? 0), 0);
  const totalLulus = peserta.reduce(
    (s, u) => s + (u.test_sessions?.filter(ms).length ?? 0),
    0
  );

  return (
    <div className="app-page space-y-6">
      <PageHeader kicker="Admin" title="Hasil peserta" description="Nilai akhir psikogram tiap simulasi penuh dan riwayat mini tryout peserta." actions={
        <Link href="/admin/pengecoh" className={buttonStyles({ variant: "secondary", size: "sm" })}>Analisis pengecoh</Link>
      } />

      <dl className="prog-strip is-3">
        {[
          { label: "Peserta terdaftar", value: totalPeserta, tone: "" },
          { label: "Total attempt", value: totalTes, tone: "" },
          { label: profil ? `Memenuhi Syarat · ${JALUR_LABEL[profil]}` : "Memenuhi Syarat", value: profil ? totalLulus : "—", tone: "!text-success" },
        ].map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd className={`prog-big ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-kicker">Daftar peserta</h2>
          <ProfilPicker value={profil} />
        </div>
        {!profil && <p className="text-sm text-muted-foreground">Pilih profil untuk menampilkan nilai akhir psikogram tiap simulasi penuh.</p>}

        {peserta.length === 0 ? (
          <EmptyState
            title="Belum ada peserta"
            description="Peserta yang terdaftar dengan role peserta akan muncul di daftar ini."
          />
        ) : (
          peserta.map((u) => {
            const sessions = (u.test_sessions ?? []).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const full = sessions.filter(lengkap);
            const bernilai = full.filter((s) => nilaiOf(s)?.nilai_akhir != null);
            const best = bernilai.length
              ? bernilai.reduce((p, c) => (nilaiOf(c)!.nilai_akhir! > nilaiOf(p)!.nilai_akhir! ? c : p))
              : null;
            const bestNilai = best ? nilaiOf(best)!.nilai_akhir! : null;
            const mini = sessions.filter((s) => selesai(s) && !lengkap(s)).length;
            const paketDone = kartuIds.filter((id) => full.some((s) => kartuOf(s) === id));

            return (
              <Accordion
                key={u.id}
                label={u.name}
                summary={
                  <span className="tnum">
                    @{u.username} · {paketDone.length ? `Simulasi Paket ${paketDone.join(", ")}` : "belum ada simulasi penuh"}
                    {mini > 0 && ` · ${mini} mini tryout`}
                  </span>
                }
                trailing={
                  best && bestNilai != null ? (
                    <Badge tone={ms(best) ? "success" : "danger"}>{bestNilai}</Badge>
                  ) : (
                    <Badge tone="neutral">belum ada</Badge>
                  )
                }
              >
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum pernah mengikuti tes.</p>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <h3 className="section-kicker">Simulasi penuh</h3>
                      <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {kartuIds.map((id) => {
                          const runs = full.filter((s) => kartuOf(s) === id);
                          const last = runs[0];
                          const nilai = runs.map((s) => nilaiOf(s)?.nilai_akhir).filter((n): n is number => n != null);
                          const tone = !last || !nilaiOf(last)?.status ? "text-muted-foreground" : ms(last) ? "text-success" : "text-destructive";
                          return (
                            <li key={id} className={`rounded-md border p-3 ${last ? "border-border bg-card" : "border-dashed border-border"}`}>
                              <p className="text-xs font-semibold text-muted-foreground">Paket {id}</p>
                              {last ? (
                                <>
                                  <p className={`tnum mt-1 font-heading text-xl font-bold ${tone}`}>{nilaiOf(last)?.nilai_akhir ?? "—"}</p>
                                  <p className="tnum text-xs text-muted-foreground">
                                    {runs.length}× · {nilai.length > 1 ? `terbaik ${Math.max(...nilai)}` : new Date(last.completed_at ?? last.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                  </p>
                                </>
                              ) : (
                                <p className="mt-1 text-sm text-faint-foreground">Belum</p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div>
                      <h3 className="section-kicker">Riwayat</h3>
                      <ul className="mt-1 divide-y divide-border">
                        {sessions.map((s) => {
                          const done = selesai(s);
                          const judul = tigaModul(s)
                            ? `Simulasi Paket ${kartuOf(s) || "?"}`
                            : `Mini Tryout · ${s.module_sessions.map((m) => MODULE_CONFIG[m.module_type as ModuleType]?.label ?? m.module_type).join(", ") || "—"}`;
                          return (
                            <li key={s.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">{judul}</p>
                                <p className="tnum text-xs text-muted-foreground">{formatDate(s.completed_at ?? s.created_at)}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {done ? (
                                  <>
                                    {lengkap(s) && profil && (
                                      <>
                                        <span className={`text-xs font-semibold ${!nilaiOf(s)?.status ? "text-muted-foreground" : ms(s) ? "text-success" : "text-destructive"}`}>
                                          {!nilaiOf(s)?.status ? "Belum lengkap" : ms(s) ? "Memenuhi Syarat" : "Tidak Memenuhi Syarat"}
                                        </span>
                                        <span className="tnum font-semibold text-foreground">{nilaiOf(s)?.nilai_akhir ?? "—"}</span>
                                      </>
                                    )}
                                    {needsKecermatanReview(s) && <Badge tone="accent">Cek manual: Sikap Kerja</Badge>}
                                    <Link
                                      href={`/test/${s.id}/result`}
                                      className="flex items-center gap-0.5 text-xs font-semibold text-brand-ink hover:underline"
                                    >
                                      Detail
                                      <ChevronRight className="size-3.5" />
                                    </Link>
                                  </>
                                ) : (
                                  <Badge tone="info">{s.status === "PENDING" ? "Belum dimulai" : "Sedang berjalan"}</Badge>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </Accordion>
            );
          })
        )}
      </section>
    </div>
  );
}
