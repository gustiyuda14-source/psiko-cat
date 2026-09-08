import Link from "next/link";
import { MODULE_CONFIG, type ModuleType } from "@/lib/test-session";

const MODULE_ORDER: ModuleType[] = ["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"];

export default function LatihanIndexPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Latihan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Latihan tanpa batas waktu, tidak dihitung sebagai tes resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MODULE_ORDER.map((type) => {
          const meta = MODULE_CONFIG[type];
          return (
            <Link
              key={type}
              href={`/dashboard/latihan/${meta.slug}`}
              className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_10px_28px_-20px_rgba(16,33,59,0.35)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="h-1.5 bg-gradient-to-r from-success via-success to-accent" />
              <div className="space-y-3 p-5">
                <span className="inline-flex rounded-lg bg-primary/7 px-2.5 py-1 text-xs font-semibold text-primary">
                  Latihan
                </span>
                <div>
                  <p className="font-semibold text-foreground">{meta.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{meta.shortDesc}</p>
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
