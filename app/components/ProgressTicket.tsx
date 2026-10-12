/*
  Bagian tiket progres (Drill, Latihan, Simulasi). Tanpa hook: dipakai komponen server
  maupun client. CSS di app/progress.css.
*/

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
export const fmt = (n: number) => n.toLocaleString("id-ID");

/** foot = baris bawah selebar tiket (di bawah sobekan juga), untuk tabel panjang. */
export function Ticket({ stub, children, label, foot }: { stub: React.ReactNode; children: React.ReactNode; label: string; foot?: React.ReactNode }) {
  return (
    <div className="pg-tkq">
      <article className="pg-tk" aria-label={label}>
        <aside className="pg-stub">
          <span className="pg-punch is-top" aria-hidden="true" />
          <span className="pg-punch is-bot" aria-hidden="true" />
          {stub}
        </aside>
        <div className="pg-body">{children}</div>
        {foot && <section className="pg-foot">{foot}</section>}
      </article>
    </div>
  );
}

export function StubRing({ p }: { p: number }) {
  return (
    <div className="pg-ring" aria-hidden="true">
      <i className="pg-grow" style={{ width: `${Math.round(p * 100)}%` }} />
    </div>
  );
}

export function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="pg-facts">
      {rows.map(([dt, dd]) => (
        <div key={dt}>
          <dt>{dt}</dt>
          <dd>{dd}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bar bertingkat: lebar ruas = jumlah soal level itu, isi = bagian yang sudah dikerjakan. */
export function TierStack({ total, done, delay = 0, label }: { total: number[]; done: number[]; delay?: number; label?: string }) {
  return (
    <div className="pg-stack" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {total.map((t, i) =>
        t ? (
          <span key={i} style={{ flex: t }}>
            <i className="pg-grow" style={{ width: `${pct(done[i], t)}%`, ["--d" as string]: delay + i }} />
          </span>
        ) : (
          // ruas kosong tetap ada supaya warna level (nth-child) tidak bergeser
          <span key={i} style={{ flex: 0, minWidth: 0 }} />
        )
      )}
    </div>
  );
}

/** Akurasi dengan penanda target 80%. null = belum dikerjakan. */
export function Accuracy({ acc, delay = 0 }: { acc: number | null; delay?: number }) {
  if (acc === null) return <div className="pg-acc"><small>Belum dikerjakan</small></div>;
  return (
    <div className={`pg-acc${acc < 80 ? " is-low" : ""}`}>
      <b>{acc}%</b>
      <div className="pg-gauge" aria-hidden="true">
        <i className="pg-grow" style={{ width: `${acc}%`, ["--d" as string]: delay }} />
      </div>
    </div>
  );
}

/** Status paket latihan: 1 = selesai, 0..1 = sedang dikerjakan, 0 = belum, null = belum tersedia. */
export type PackageFill = number | null;

export function PackageBox({ f, title, next, delay = 0 }: { f: PackageFill; title: string; next?: boolean; delay?: number }) {
  const cls = f === null ? "is-soon" : f >= 1 ? "is-done" : "";
  return (
    <span className={`${cls}${next ? " is-next" : ""}`} title={title}>
      {f !== null && f > 0 && f < 1 && <i className="pg-rise" style={{ height: `${f * 100}%`, ["--d" as string]: delay }} />}
    </span>
  );
}

export function packageState(f: PackageFill) {
  return f === null ? "belum tersedia" : f >= 1 ? "selesai" : f > 0 ? `${Math.round(f * 100)}% butir terjawab` : "belum dikerjakan";
}
