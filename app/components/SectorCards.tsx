"use client";

/*
  Baris kartu pemilih kelompok (aspek drill, sub-tes latihan): ikon mini, nama,
  persen gabungan, keterangan. Kartu aktif bergaris emas dengan sudut bidik.
  Di layar sempit jadi baris geser horizontal. CSS di app/honey.css.
*/

export type Sector = {
  key: string;
  label: string;
  meta: string;
  /** Persen gabungan 0-1; null = tidak ditampilkan. */
  p: number | null;
  mini?: React.ReactNode;
  /** Label kecil di pojok kanan atas, mis. modul Kecerdasan/Kepribadian. */
  badge?: string;
};

export function SectorCards({
  sectors,
  active,
  onPick,
  label,
}: {
  sectors: Sector[];
  active: string;
  onPick: (key: string) => void;
  label: string;
}) {
  return (
    <div className="hc-sectors" role="group" aria-label={label}>
      {sectors.map((s) => (
        <button
          key={s.key}
          type="button"
          className="hc-sector"
          aria-pressed={s.key === active}
          onClick={() => onPick(s.key)}
        >
          {s.badge && (
            <span className="hc-mod" data-mod={s.badge.toLowerCase()}>
              {s.badge}
            </span>
          )}
          <span className="hc-sector-mini" aria-hidden="true">
            {s.mini}
          </span>
          <span className="hc-sector-name">{s.label}</span>
          {s.p !== null && <span className="hc-sector-pct tnum">{Math.round(s.p * 100)}%</span>}
          <span className="hc-sector-meta tnum">{s.meta}</span>
        </button>
      ))}
    </div>
  );
}
