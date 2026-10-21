"use client";

import { useState } from "react";
import { PackageCarousel, type PackageOption } from "@/app/components/PackageCarousel";

const FORMATS = [
  { id: "likert", label: "Skala Pernyataan", desc: "48 pernyataan skala 4 tingkat + 63 butir Pass Hand (Integritas & Kejujuran, pilih A/B)." },
  { id: "sjt", label: "Situasional (SJT)", desc: "48 situasi dengan 5 pilihan tindakan berbobot 1–5 + 63 butir Pass Hand (Integritas & Kejujuran, pilih A/B). Integritas dinilai lewat kedua bagian." },
  { id: "yt", label: "Ya / Tidak", desc: "60 pernyataan Ya/Tidak dari 6 aspek + 10 butir validitas. Ada pasangan pernyataan serupa untuk cek konsistensi." },
] as const;

const SIZE = { likert: [48 + 63, "48 + 63 butir"], sjt: [48 + 63, "48 + 63 butir"], yt: [70, "70 butir"] } as const;

// Satu tile "Kepribadian", dua sub-tab format (pola KecermatanAspectPicker). Sesi keduanya di /latihan/kepribadian/[pkg];
// package_number tidak overlap (Likert 2-10, SJT 21+, Ya/Tidak 31+).
export function KepribadianFormatPicker({
  likertPackages,
  sjtPackages,
  ytPackages,
}: {
  likertPackages: PackageOption[];
  sjtPackages: PackageOption[];
  ytPackages: PackageOption[];
}) {
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("likert");
  const active = FORMATS.find((f) => f.id === format)!;

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Format Kepribadian" className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-card p-1">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={format === f.id}
            onClick={() => setFormat(f.id)}
            className={`min-h-9 rounded-[6px] px-3.5 text-sm font-semibold transition-colors duration-150 ${
              format === f.id ? "bg-accent text-primary-foreground" : "text-muted-foreground hover:bg-surface-inset hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{active.desc}</p>

      <PackageCarousel
        key={active.id}
        packages={{ likert: likertPackages, sjt: sjtPackages, yt: ytPackages }[format]}
        expectedCount={SIZE[format][0]}
        unitLabel="butir"
        completeLabel={SIZE[format][1]}
        hrefBase="/latihan/kepribadian"
        moduleLabel={{ likert: "kepribadian", sjt: "kepribadian situasional", yt: "kepribadian ya/tidak" }[format]}
      />
    </div>
  );
}
