import { KECERMATAN_KEYS, type KecermatanKey } from "@/lib/kecermatan-symbols";
export { KECERMATAN_KEYS, type KecermatanKey } from "@/lib/kecermatan-symbols";

// Aspek Spasial & sebagian Simbol Hilang menyimpan simbol sebagai path SVG di
// public/, aspek lain menyimpan glyph teks. Ukuran gambar ikut font-size wadahnya (em).
export function KecermatanSymbol({ symbol }: { symbol: string }) {
  if (!symbol.endsWith(".svg")) return <>{symbol}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={symbol} alt="" draggable={false} className="h-[1.5em] w-[1.5em]" />;
}

/*
  Strip kunci: A-E dengan simbolnya, dalam grid 5 kolom yang sama persis dengan
  grid tombol jawaban di bawahnya.

  Ini keputusan desain paling menentukan di modul Kecermatan. Peserta punya 60
  detik untuk 50 butir — sekitar 1,2 detik per butir. Kalau huruf kunci dan
  tombol jawabannya tidak sejajar secara vertikal, tiap butir menambah satu
  gerakan mata horizontal, dan biaya itu dikalikan 500.

  Dipakai bersama oleh engine ujian dan mode latihan supaya geometri yang
  dilatih peserta sama persis dengan geometri saat ujian.
*/
export function KecermatanKeyStrip({
  symbolMap,
  size = "md",
  labels,
}: {
  symbolMap: Partial<Record<KecermatanKey, string>>;
  size?: "md" | "lg";
  /** Kata bantuan pelafalan (latihan saja), di atas tiap kunci pada grid yang sama. */
  labels?: Partial<Record<KecermatanKey, string>> | null;
}) {
  const strip = (
    <div className="grid grid-cols-5 gap-1.5" aria-label="Tabel kunci simbol">
      {KECERMATAN_KEYS.map((k) => (
        <div key={k} className="overflow-hidden rounded-md border border-border bg-card text-center">
          <div className="bg-primary py-1 text-xs font-bold text-primary-foreground">{k}</div>
          <div
            className={`flex items-center justify-center ${
              size === "lg" ? "h-[4.5rem] text-4xl sm:h-28 sm:text-[3.5rem]" : "h-[4.5rem] text-4xl sm:h-24 sm:text-[3.5rem]"
            }`}
          >
            {typeof symbolMap?.[k] === "string" ? <KecermatanSymbol symbol={symbolMap[k]!} /> : "?"}
          </div>
        </div>
      ))}
    </div>
  );
  if (!labels) return strip;
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-5 gap-1.5" aria-label="Bantuan pelafalan kunci">
        {KECERMATAN_KEYS.map((k) => (
          // "bentuk · posisi" dipecah jadi dua baris; tinggi tetap supaya strip tidak lompat antar kolom.
          <p key={k} className="flex min-h-[2.75rem] flex-col items-center justify-end text-center text-[11px] font-semibold leading-tight text-accent-ink sm:text-xs">
            {(labels[k] ?? "").split(" · ").map((part) => <span key={part}>{part}</span>)}
          </p>
        ))}
      </div>
      {strip}
    </div>
  );
}
