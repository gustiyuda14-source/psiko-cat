import Link from "next/link";
import { MODULE_CONFIG, type ModuleType } from "@/lib/test-session";

const MODULE_ORDER: ModuleType[] = ["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"];

export default function LatihanIndexPage() {
  return (
    <div className="app-page space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Latihan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Latihan tanpa batas waktu, tidak dihitung sebagai tes resmi.
        </p>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODULE_ORDER.map((type) => {
          const meta = MODULE_CONFIG[type];
          return (
            <Link
              key={type}
              href={`/dashboard/latihan/${meta.slug}`}
              className="surface-card interactive-card group flex min-h-48 flex-col overflow-hidden"
            >
              <div className="h-1 bg-accent" />
              <div className="flex flex-1 flex-col gap-4 p-5">
                <span className="inline-flex rounded-lg bg-primary/7 px-2.5 py-1 text-xs font-semibold text-primary">
                  Latihan
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{meta.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{meta.shortDesc}</p>
                </div>
                <p className="flex items-center text-sm font-semibold text-primary">
                  Mulai
                  <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
