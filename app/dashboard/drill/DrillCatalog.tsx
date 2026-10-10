"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { TicketCatalog, type TicketItem } from "@/app/components/TicketCatalog";
import { Button, ConfirmDialog, Dialog } from "@/app/components/ui-client";
import {
  DRILL_ASPEK,
  DRILL_PROGRESS_KEY,
  DRILL_TIERS,
  readDrillProgress,
  writeDrillProgress,
  type DrillCard,
  type DrillProgress,
} from "@/lib/drill-cards";

type CatalogCard = DrillCard & { kartu: string; tiers: string[][] };

const TONE: Record<string, TicketItem["tone"]> = {
  verbal: "green",
  numerik: "cyan",
  logika: "amber",
  analitis: "cyan",
  figural: "amber",
};

// localStorage sebagai external store: string mentah stabil antar render, server = "".
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("drill-progress", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("drill-progress", onChange);
  };
}
function useProgress(): DrillProgress {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(DRILL_PROGRESS_KEY) ?? "";
      } catch {
        return "";
      }
    },
    () => ""
  );
  return useMemo(() => (raw ? readDrillProgress() : {}), [raw]);
}

function stats(ids: string[], progress: DrillProgress) {
  const done = ids.filter((id) => progress[id]);
  const right = done.reduce((s, id) => s + progress[id][0], 0);
  const tries = done.reduce((s, id) => s + progress[id][1], 0);
  return { done: done.length, total: ids.length, acc: tries ? Math.round((right / tries) * 100) : null };
}

export default function DrillCatalog({ cards }: { cards: CatalogCard[] }) {
  const router = useRouter();
  const progress = useProgress();
  const [open, setOpen] = useState<CatalogCard | null>(null);
  const [resetStep, setResetStep] = useState(0);

  const items: TicketItem[] = cards.map((card, index) => {
    const all = card.tiers.flat();
    const s = stats(all, progress);
    return {
      id: card.kartu,
      tag: DRILL_ASPEK.find((a) => a.key === card.aspek)?.label ?? card.aspek,
      tone: TONE[card.aspek],
      badges: all.length ? [`${all.length} soal`] : ["Segera hadir"],
      title: card.label,
      meta: card.desc,
      foot: all.length ? (s.done ? `${s.done}/${s.total} dikerjakan` : "Mulai drilling") : "Belum tersedia",
      stub: ["Kartu", String(index + 1).padStart(2, "0")],
      ring: all.length ? { p: s.total ? s.done / s.total : 0, text: `${Math.round((s.done / s.total) * 100)}%` } : undefined,
      locked: all.length === 0,
      group: [card.aspek],
      search: `${card.label} ${card.desc}`,
    };
  });

  const start = (kartu: string, tier?: number) =>
    router.push(`/latihan/drill/${kartu}${tier ? `?tier=${tier}` : ""}`);

  const resetCard = () => {
    if (!open) return;
    const next = { ...readDrillProgress() };
    for (const id of open.tiers.flat()) delete next[id];
    writeDrillProgress(next);
    window.dispatchEvent(new Event("drill-progress"));
    setResetStep(0);
  };

  return (
    <>
      <TicketCatalog
        items={items}
        label="drilling"
        search
        placeholder="Cari jenis soal…"
        filters={[{ key: "all", label: "Semua" }, ...DRILL_ASPEK.map((a) => ({ key: a.key, label: a.label }))]}
        onPick={(item) => setOpen(cards.find((c) => c.kartu === item.id) ?? null)}
      />

      <Dialog open={open !== null && resetStep === 0} onClose={() => setOpen(null)} labelledBy="drill-card-title">
        {open && (
          <div className="space-y-5">
            <div>
              <p className="section-kicker">Kartu terpilih</p>
              <h2 id="drill-card-title" className="mt-1 font-heading text-2xl text-foreground">
                {open.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{open.desc}</p>
            </div>

            <ul className="space-y-2">
              {DRILL_TIERS.map(({ tier, label }) => {
                const ids = open.tiers[tier - 1];
                const s = stats(ids, progress);
                return (
                  <li key={tier} className="inset-panel flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-heading text-base text-foreground">{label}</p>
                      <p className="tnum text-xs text-muted-foreground">
                        {ids.length ? `${s.done}/${s.total} dikerjakan${s.acc !== null ? ` · akurasi ${s.acc}%` : ""}` : "Belum ada soal"}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" disabled={!ids.length} onClick={() => start(open.kartu, tier)}>
                      {s.done ? "Lanjut" : "Mulai"}
                    </Button>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" size="sm" onClick={() => setResetStep(1)} disabled={!stats(open.tiers.flat(), progress).done}>
                Ulang kartu ini dari nol
              </Button>
              <Button variant="accent" onClick={() => start(open.kartu)}>
                Campuran semua tingkat
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={resetStep === 1}
        onClose={() => setResetStep(0)}
        onConfirm={() => setResetStep(2)}
        title="Hapus progres kartu ini?"
        confirmLabel="Ya, lanjut"
        tone="danger"
      >
        <p className="text-muted-foreground">Semua hasil {open?.label} di perangkat ini akan dihapus. Kartu lain tidak terpengaruh.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={resetStep === 2}
        onClose={() => setResetStep(0)}
        onConfirm={resetCard}
        title="Yakin hapus sekarang?"
        confirmLabel="Hapus progres"
        tone="danger"
      >
        <p className="text-muted-foreground">Tindakan ini tidak bisa dibatalkan.</p>
      </ConfirmDialog>
    </>
  );
}
