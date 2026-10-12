"use client";

import { useState } from "react";
import { PaketCard } from "@/app/components/PaketCard";
import { FUNDAMENTAL } from "@/lib/fundamental";

const TABS = [
  { key: "all", label: "Semua paket" },
  { key: "Penguatan Dasar", label: "Penguatan Dasar" },
  { key: "Rekening Koran", label: "Rekening Koran" },
] as const;

export default function FundamentalCatalog() {
  const [tab, setTab] = useState<string>("all");
  const shown = FUNDAMENTAL.filter((m) => tab === "all" || m.grup === tab);

  return (
    <>
      <nav className="fd-tabs" aria-label="Kategori paket">
        {TABS.map((t) => (
          <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
            <span className="tnum">{FUNDAMENTAL.filter((m) => t.key === "all" || m.grup === t.key).length}</span>
          </button>
        ))}
      </nav>
      <div className="pc-grid">
        {shown.map((m) => (
          <PaketCard
            key={m.kode}
            href={`/latihan/fundamental/${m.kode}`}
            code={`Paket ${String(FUNDAMENTAL.indexOf(m) + 1).padStart(2, "0")}`}
            tag={m.kind === "deret" ? "Tambah · Kali" : `${m.total} soal`}
            kicker={m.kicker}
            title={m.label}
            desc={m.desc}
            points={m.points}
            chips={m.contoh}
            level={m.level}
            cta="Mulai latihan"
          />
        ))}
      </div>
    </>
  );
}
