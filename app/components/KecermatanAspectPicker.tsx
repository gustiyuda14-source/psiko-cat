"use client";

import { useState } from "react";
import { PackageCarousel, type PackageOption } from "@/app/components/PackageCarousel";

const ASPECTS = [
  { id: "emoji", label: "Emoji & Gambar", hrefBase: "/latihan/kecermatan" },
  { id: "angka", label: "Angka & Huruf", hrefBase: "/latihan/kecermatan-angka" },
] as const;

// Satu tile "Kecermatan" di sidebar, dua sub-tile aspek di dalamnya — bukan
// dua tile latihan terpisah. package_number dua aspek ini tidak overlap
// (3-8 vs 101-105) jadi carousel-nya independen, cuma dipilih lewat toggle ini.
export function KecermatanAspectPicker({
  emojiPackages,
  angkaPackages,
}: {
  emojiPackages: PackageOption[];
  angkaPackages: PackageOption[];
}) {
  const [aspect, setAspect] = useState<(typeof ASPECTS)[number]["id"]>("emoji");
  const packagesByAspect = { emoji: emojiPackages, angka: angkaPackages };
  const active = ASPECTS.find((a) => a.id === aspect)!;

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Aspek Kecermatan" className="inline-flex gap-1 rounded-md border border-border bg-card p-1">
        {ASPECTS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aspect === a.id}
            onClick={() => setAspect(a.id)}
            className={`min-h-9 rounded-[6px] px-3.5 text-sm font-semibold transition-colors duration-150 ${
              aspect === a.id
                ? "bg-accent text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-inset hover:text-foreground"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <PackageCarousel
        key={active.id}
        packages={packagesByAspect[active.id]}
        expectedCount={500}
        unitLabel="butir"
        completeLabel="10 kolom"
        hrefBase={active.hrefBase}
        moduleLabel={`kecermatan ${active.label.toLowerCase()}`}
      />
    </div>
  );
}
