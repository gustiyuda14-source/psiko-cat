import { KECERMATAN_KEYS, type KecermatanKey } from "@/lib/kecermatan-symbols";
export { KECERMATAN_KEYS, type KecermatanKey } from "@/lib/kecermatan-symbols";

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
}: {
  symbolMap: Partial<Record<KecermatanKey, string>>;
  size?: "md" | "lg";
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5" aria-label="Tabel kunci simbol">
      {KECERMATAN_KEYS.map((k) => (
        <div key={k} className="overflow-hidden rounded-md border border-border bg-card text-center">
          <div className="bg-primary py-1 text-xs font-bold text-primary-foreground">{k}</div>
          <div
            className={`flex items-center justify-center ${
              size === "lg" ? "h-14 text-3xl" : "h-11 text-2xl"
            }`}
          >
            {typeof symbolMap?.[k] === "string" ? symbolMap[k] : "?"}
          </div>
        </div>
      ))}
    </div>
  );
}
