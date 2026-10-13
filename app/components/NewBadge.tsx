/**
  Badge "NEW" untuk butir drill yang baru dirilis. Tampil selama peserta belum menjawab butirnya
  (tidak ada kedaluwarsa waktu); aturannya ada di docs/pedoman (bagian Drilling · badge NEW).
  Gaya di app/honey.css (.new-badge).
*/
export function NewBadge({ count, small, className = "" }: { count?: number; small?: boolean; className?: string }) {
  return (
    <span className={`new-badge${small ? " new-badge-sm" : ""} ${className}`.trim()}>
      NEW{count ? <span className="new-badge-n tnum">{count}</span> : null}
    </span>
  );
}
