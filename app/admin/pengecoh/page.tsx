import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findAccount } from "@/lib/accounts";
import { analisisPengecoh, MIN_N } from "@/lib/drill-analisis";
import { DRILL_CARDS, DRILL_TIERS, drillCategory } from "@/lib/drill-cards";
import { Badge, EmptyState, PageHeader, buttonStyles } from "@/app/components/ui";

// Analisis pengecoh drill: opsi mana yang dipilih peserta pada percobaan pertama, per soal.
// Soal bertanda (pengecoh mengalahkan kunci, pengecoh mati, terlalu mudah/sulit) tampil paling atas.
export default async function PengecohPage({ searchParams }: { searchParams: Promise<{ kartu?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const me = await findAccount(session.username);
  if (!me?.admin || !me.aktif) redirect("/dashboard");

  const { kartu: raw } = await searchParams;
  const kartu = raw && raw in DRILL_CARDS ? raw : "K17";
  const { items, error } = await analisisPengecoh(kartu);
  const rank = (t: string[]) => (t.length && t[0] !== "data sedikit" ? 0 : t.length ? 2 : 1);
  items.sort((a, b) => rank(a.tanda) - rank(b.tanda) || b.n - a.n);
  const flagged = items.filter((i) => rank(i.tanda) === 0).length;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <PageHeader
          kicker="Admin"
          title="Analisis pengecoh"
          description={`Sebaran pilihan peserta pada percobaan pertama tiap soal drill. Tanda kualitas dipasang setelah ${MIN_N} jawaban.`}
          actions={<Link href="/admin" className={buttonStyles({ variant: "secondary", size: "sm" })}>← Dashboard admin</Link>}
        />

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Pilih kartu drill">
          {Object.entries(DRILL_CARDS).map(([k, c]) => (
            <Link key={k} href={`/admin/pengecoh?kartu=${k}`} aria-current={k === kartu ? "page" : undefined}
              className={buttonStyles({ variant: k === kartu ? "primary" : "secondary", size: "sm" })} title={c.label}>
              {k}
            </Link>
          ))}
        </nav>

        <dl className="prog-strip is-3 mt-6">
          <div><dt>Soal yang sudah dijawab</dt><dd className="prog-big">{items.length}</dd></div>
          <div><dt>Jawaban pertama</dt><dd className="prog-big">{items.reduce((t, i) => t + i.n, 0)}</dd></div>
          <div><dt>Soal bertanda</dt><dd className={`prog-big ${flagged ? "!text-destructive" : ""}`}>{flagged}</dd></div>
        </dl>

        <section className="mt-6 space-y-3">
          <h2 className="section-kicker">{kartu} · {DRILL_CARDS[kartu].label}</h2>
          {error ? (
            <EmptyState title="Data belum bisa dibaca" description={`Pastikan docs/rencana/sql/drill-answers.sql sudah dijalankan di Supabase. (${error})`} />
          ) : items.length === 0 ? (
            <EmptyState title="Belum ada jawaban" description="Jawaban peserta di kartu ini akan muncul setelah mereka menekan Periksa di drill." />
          ) : (
            items.map(({ item, n, benarPct, opsi, tanda }) => (
              <article key={item.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-sm font-bold">{item.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {drillCategory(item.sub_type)[1]} · {DRILL_TIERS.find((t) => t.tier === item.tier)?.label}
                  </span>
                  <span className="tnum ml-auto text-xs text-muted-foreground">{n} jawaban · {benarPct.toFixed(0)}% benar</span>
                </div>
                {tanda.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tanda.map((t) => <Badge key={t} tone={t === "data sedikit" ? "neutral" : t.startsWith("pengecoh mengalahkan") ? "danger" : "accent"}>{t}</Badge>)}
                  </div>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.stem}</p>
                <ul className="mt-3 space-y-1.5">
                  {opsi.map((o) => (
                    <li key={o.key} className="grid grid-cols-[1.5rem_minmax(0,1fr)_3.5rem] items-center gap-2 text-sm">
                      <span className={`font-bold ${o.kunci ? "text-success" : ""}`}>{o.key.toUpperCase()}</span>
                      <div className="relative min-w-0 overflow-hidden rounded bg-[var(--surface-inset)]">
                        <div className={`absolute inset-y-0 left-0 ${o.kunci ? "bg-success/25" : o.mati ? "bg-[#d9dde3]" : "bg-destructive/20"}`} style={{ width: `${o.pct}%` }} />
                        <span className={`relative block truncate px-2 py-1 ${o.kunci ? "font-semibold text-success" : ""}`}>
                          {o.teks}{o.kunci ? " (kunci)" : o.mati ? " · mati" : ""}
                        </span>
                      </div>
                      <span className="tnum text-right">{o.pct.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
