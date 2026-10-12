import Link from "next/link";

/*
  Kartu paket bergaya "berkas": strip navy (kode + label), badan (kategori, judul, deskripsi, kotak isi
  bergaris putus, contoh soal), kaki (tingkat + tombol emas). Seluruh kartu satu tautan. CSS: .pc-* di
  app/catalog.css. Dipakai Beranda dan katalog Fundamental.
*/
export function PaketCard({
  href,
  code,
  tag,
  kicker,
  title,
  desc,
  points,
  pointsLabel = "Isi paket",
  chips,
  level,
  cta,
}: {
  href: string;
  code: string;
  tag?: string;
  kicker?: string;
  title: string;
  desc: string;
  points?: string[];
  pointsLabel?: string;
  chips?: string[];
  level?: number;
  cta: string;
}) {
  return (
    <Link href={href} className="pc-card">
      <span className="pc-strip">
        <b>{code}</b>
        {tag && <span className="pc-pill">{tag}</span>}
      </span>
      <span className="pc-body">
        <span className="pc-head">
          {kicker && <span className="pc-kicker">{kicker}</span>}
          <strong className="pc-title">{title}</strong>
        </span>
        <span className="pc-desc">{desc}</span>
        {points && points.length > 0 && (
          <span className="pc-points">
            <span className="pc-points-h">{pointsLabel}</span>
            {points.map((p) => (
              <span key={p} className="pc-point">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.6 2.6L16 9.5" />
                </svg>
                {p}
              </span>
            ))}
          </span>
        )}
        {chips && chips.length > 0 && (
          <span className="pc-chips">
            {chips.map((c) => (
              <span key={c} className="pc-chip tnum">
                {c}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="pc-foot">
        {level ? (
          <span className="pc-level">
            Tingkat
            <span aria-hidden="true">
              {[1, 2, 3].map((k) => (
                <i key={k} data-on={k <= level ? "true" : undefined} />
              ))}
            </span>
            <span className="sr-only">{level} dari 3</span>
          </span>
        ) : (
          <span />
        )}
        <span className="pc-cta">
          {cta} <span aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  );
}
