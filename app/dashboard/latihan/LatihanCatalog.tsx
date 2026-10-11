"use client";

import { useRouter } from "next/navigation";
import { SectorCards, type Sector } from "@/app/components/SectorCards";
import { Button } from "@/app/components/ui-client";
import { ArrowRight } from "@/app/components/icons";
import { Facts, PackageBox, StubRing, Ticket, fmt, packageState, type PackageFill } from "@/app/components/ProgressTicket";
import type { ModuleType } from "@/lib/test-config";
import { useLatihanProgress } from "@/lib/practice-progress";

/*
  Katalog Latihan: tiket progres (status tiap paket per sub-tes/aspek) lalu satu kartu per
  sub-tes (tujuan = halaman rak paket). Capaian = butir terjauh yang pernah dijawab dalam satu
  sesi, dari akun peserta (lib/practice-progress.ts).
*/

export type LatihanModule = { module: ModuleType; href: string; label: string; desc: string };
export type LatihanRow = {
  module: ModuleType;
  label: string;
  sub: string;
  per: number;
  packages: { key: string; label: string; ready: boolean }[];
};

export default function LatihanCatalog({ modules, rows }: { modules: LatihanModule[]; rows: LatihanRow[] }) {
  const router = useRouter();
  const progress = useLatihanProgress();

  const view = rows.map((r, ri) => {
    const fills: PackageFill[] = r.packages.map((p) => (p.ready ? Math.min(1, (progress[p.key] ?? 0) / r.per) : null));
    const answered = r.packages.reduce((s, p) => s + (p.ready ? Math.min(progress[p.key] ?? 0, r.per) : 0), 0);
    return { r, ri, fills, answered };
  });
  const allFills = view.flatMap((v) => v.fills);
  const ready = allFills.filter((f) => f !== null).length;
  const touched = allFills.filter((f) => f !== null && f > 0).length;
  const done = allFills.filter((f) => f !== null && f >= 1).length;
  const answered = view.reduce((s, v) => s + v.answered, 0);

  // Rekomendasi: paket sedang dikerjakan dengan capaian tertinggi (paling mendekati selesai).
  let next: { ri: number; pi: number; f: number } | null = null;
  view.forEach((v) =>
    v.fills.forEach((f, pi) => {
      if (f !== null && f > 0 && f < 1 && (!next || f > next.f)) next = { ri: v.ri, pi, f };
    })
  );
  const nextPick = next as { ri: number; pi: number; f: number } | null;
  const isNext = (ri: number, pi: number) => nextPick?.ri === ri && nextPick.pi === pi;
  const cols = Math.max(...rows.map((r) => r.packages.length));

  const sectors: Sector[] = modules.map((m) => {
    const own = view.filter((v) => v.r.module === m.module);
    const fills = own.flatMap((v) => v.fills);
    const avail = fills.filter((f) => f !== null).length;
    const t = fills.filter((f) => f !== null && f > 0).length;
    return {
      key: m.href,
      label: m.label,
      p: avail ? t / avail : 0,
      meta: `${t} dari ${avail} paket tersedia · ${fmt(own.reduce((s, v) => s + v.answered, 0))} butir`,
      mini: (
        <span className="pg-pk is-mini" style={{ ["--n" as string]: fills.length }}>
          {fills.map((f, i) => (
            <PackageBox key={i} f={f} title={packageState(f)} delay={i} />
          ))}
        </span>
      ),
    };
  });

  return (
    <>
      <Ticket
        label="Progress latihan"
        stub={
          <>
            <span className="pg-label">Progress latihan</span>
            <span className="pg-big">
              {touched}
              <small>/{ready}</small>
            </span>
            <span className="pg-sub">paket tersedia sudah dikerjakan</span>
            <StubRing p={ready ? touched / ready : 0} />
            <Facts
              rows={[
                ["Paket selesai", String(done)],
                ["Sedang dikerjakan", `${touched - done} paket`],
                ["Butir terjawab", fmt(answered)],
                ["Paket tersedia", `${ready} dari ${allFills.length}`],
              ]}
            />
          </>
        }
      >
        <section className="is-full">
          <div className="pg-sec-h">
            <h3>Progress per paket</h3>
            <div className="pg-legend">
              <span><i style={{ background: "var(--brand-ink)" }} />Selesai</span>
              <span><i style={{ background: "linear-gradient(180deg,var(--pg-t2),var(--pg-t3))" }} />Sedang dikerjakan</span>
              <span><i style={{ background: "var(--pg-track)", boxShadow: "inset 0 0 0 1px var(--pg-rule)" }} />Belum dikerjakan</span>
              <span><i style={{ background: "repeating-linear-gradient(135deg,transparent 0 2px,var(--border) 2px 3px)" }} />Belum tersedia</span>
            </div>
          </div>
          <div className="pg-mx">
            <div className="pg-mx-row is-hd" aria-hidden="true">
              <span />
              <span className="pg-mx-hd" style={{ gridTemplateColumns: `repeat(${cols}, 30px)` }}>
                {Array.from({ length: cols }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </span>
              <span />
            </div>
            {view.map(({ r, ri, fills }) => {
              const fin = fills.filter((f) => f !== null && f >= 1).length;
              const run = fills.filter((f) => f !== null && f > 0 && f < 1).length;
              const avail = fills.filter((f) => f !== null).length;
              return (
                <div key={r.label} style={{ display: "contents" }}>
                  {ri === 2 && <div className="pg-mx-rule" />}
                  <div className="pg-mx-row">
                    <span className="pg-nm">
                      {r.label}
                      <small>{r.sub}</small>
                    </span>
                    <span className="pg-pk" role="list" aria-label={`Paket ${r.label}`}>
                      {fills.map((f, pi) => (
                        <span key={pi} role="listitem" style={{ display: "contents" }}>
                          <PackageBox f={f} next={isNext(ri, pi)} delay={ri * 10 + pi} title={`${r.packages[pi].label}: ${packageState(f)}`} />
                        </span>
                      ))}
                    </span>
                    <span className="pg-mx-sum">
                      <b>{fin + run}</b> dari {avail} paket
                      <br />
                      {fin} selesai, {run} berjalan
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="is-full">
          {nextPick ? (
            <div className="pg-cont">
              <div>
                <b>
                  Rekomendasi: selesaikan {rows[nextPick.ri].label} {rows[nextPick.ri].packages[nextPick.pi].label}
                </b>
                <small className="tnum">
                  Capaian tertinggi {Math.round(nextPick.f * rows[nextPick.ri].per)} dari {rows[nextPick.ri].per} butir di antara paket yang belum selesai. Sesi latihan dimulai dari butir pertama.
                </small>
              </div>
              <Button variant="primary" onClick={() => router.push(rows[nextPick.ri].packages[nextPick.pi].key)}>
                Buka paket
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <p className="pg-empty">
              {touched ? "Semua paket yang pernah dikerjakan sudah selesai. Pilih paket baru di bawah." : "Belum ada paket yang dikerjakan. Pilih sub-tes di bawah untuk mulai."}
            </p>
          )}
        </section>
      </Ticket>

      <section>
        <div className="mb-1">
          <span className="section-kicker">Katalog latihan</span>
          <h2 className="mt-1 font-heading text-2xl">Pilih sub-tes</h2>
        </div>
        <SectorCards sectors={sectors} active="" onPick={(href) => router.push(href)} label="Pilih sub-tes" />
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          {modules.map((m) => (
            <li key={m.href}>
              <b className="font-heading text-foreground">{m.label}:</b> {m.desc}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
