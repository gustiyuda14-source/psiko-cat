"use client";

import { useRouter } from "next/navigation";
import { SectorCards, type Sector } from "@/app/components/SectorCards";
import { useLatihanProgress } from "@/lib/latihan-progress";

/*
  Katalog Latihan: satu kartu per sub-tes (tujuan = halaman rak paket). Ikon mini
  = deretan tabung paket sub-tes itu, terisi capaian terjauh dari
  lib/latihan-progress.ts.
*/

export type LatihanModule = {
  href: string;
  label: string;
  desc: string;
  /** Kunci progres tiap paket (rute sesi) + jumlah butir per paket. */
  packages: { key: string; total: number }[];
};

function MiniTubes({ fills }: { fills: number[] }) {
  return (
    <svg viewBox={`0 0 ${fills.length * 12} 44`} style={{ height: 36, width: fills.length * 10 }}>
      {fills.map((f, j) => (
        <g key={j}>
          <rect x={j * 12 + 2} y={2} width={8} height={40} rx={4} fill="var(--surface-card)" stroke="var(--border-strong)" strokeWidth={1} />
          {f > 0 && <rect x={j * 12 + 3} y={2 + 40 * (1 - f)} width={6} height={40 * f} rx={3} fill="var(--honey-bot)" />}
        </g>
      ))}
    </svg>
  );
}

export default function LatihanCatalog({ modules }: { modules: LatihanModule[] }) {
  const router = useRouter();
  const progress = useLatihanProgress();

  const sectors: Sector[] = modules.map((m) => {
    const fills = m.packages.map((p) => Math.min(1, (progress[p.key] ?? 0) / p.total));
    const touched = fills.filter((f) => f > 0).length;
    return {
      key: m.href,
      label: m.label,
      p: null,
      meta: `${m.packages.length} paket · ${touched} pernah dikerjakan`,
      mini: <MiniTubes fills={fills} />,
    };
  });

  return (
    <>
      <SectorCards sectors={sectors} active="" onPick={(href) => router.push(href)} label="Pilih sub-tes" />
      <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
        {modules.map((m) => (
          <li key={m.href}>
            <b className="font-heading text-foreground">{m.label}:</b> {m.desc}
          </li>
        ))}
      </ul>
    </>
  );
}
