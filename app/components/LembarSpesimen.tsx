import type { ReactNode } from "react";

/*
  Kepala halaman dan spesimen (potongan materi tes asli) untuk kartu LembarSheet. Server component.
  Angka spesimen memakai seed tetap supaya lembar sama di tiap render. Keswa sengaja hanya nomor + bulatan Y/T:
  pernyataan bank soal tidak pernah tampil di kartu.
*/

export function LembarHead({ title, desc, meta }: { title: string; desc: ReactNode; meta: [string, string] }) {
  return (
    <header className="lb-head">
      <h1>{title}</h1>
      <p>{desc}</p>
      <div className="lb-meta">
        {meta[0]} <span>{meta[1]}</span>
      </div>
    </header>
  );
}

const seeded = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return 1 + Math.floor((seed / 233280) * 9);
};
const digits = (rnd: () => number, n: number) => Array.from({ length: n }, rnd);

/** Kolom angka Kraepelin; kolom `on` memperlihatkan kunci (angka satuan pasangan berdekatan). */
export function KoranCols({ n, rows, on = -1 }: { n: number; rows: number; on?: number }) {
  const rnd = seeded(11);
  return (
    <span className="lb-cols">
      {Array.from({ length: n }, (_, c) => {
        const d = digits(rnd, rows);
        return (
          <span key={c} className={`lb-col${c === on ? " is-on" : ""}`}>
            {d.map((v, r) => (
              <span key={r}>{v}</span>
            ))}
            {c === on && (
              <span className="lb-key">
                {d.slice(1).map((v, r) => (
                  <span key={r}>{(v + d[r]) % 10}</span>
                ))}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/** Dua kolom Pauli dengan garis tanda tiap 5 angka (label menit di kolom kanan). */
export function PauliStrip() {
  const rnd = seeded(23);
  const col = (d: number[], label: boolean) => (
    <span>
      {d.flatMap((v, r) => [
        r && r % 5 === 0 ? <span key={`m${r}`} className="mk" data-t={label ? `${(r / 5) * 3} mnt` : undefined} /> : null,
        <span key={r} className="d">
          {v}
        </span>,
      ])}
    </span>
  );
  return (
    <span className="lb-pauli">
      {col(digits(rnd, 14), false)}
      {col(digits(rnd, 14), true)}
    </span>
  );
}

/** Lembar jawab Y/T: nomor + bulatan. `isi` = bulatan terisi (paket yang sudah pernah dikerjakan). */
export function JawabYT({ paket, isi }: { paket: number; isi: boolean }) {
  const rnd = seeded(31 + paket);
  return (
    <span className="lb-ans">
      {Array.from({ length: 7 }, (_, r) => {
        const y = rnd() > 4;
        return (
          <span key={r}>
            <span>{r + 1}.</span>
            <span className={`lb-bub${isi && y ? " is-f" : ""}`}>Y</span>
            <span className={`lb-bub${isi && !y ? " is-f" : ""}`}>T</span>
            <span />
          </span>
        );
      })}
    </span>
  );
}

/** Spesimen paket Penguatan Dasar; angka contoh mengikuti rumus generator di lib/fundamental.ts. */
export function FundamentalSpec({ kode, contoh }: { kode: string; contoh: string[] }) {
  if (kode === "cermin")
    return (
      <>
        <span>
          <span className="lb-big">{contoh[0]}</span>
          <span className="lb-row">
            {contoh.slice(1).map((c) => (
              <span key={c}>{c}</span>
            ))}
          </span>
        </span>
        <span className="lb-stem">
          <span>Jika 3 × n = 87,</span>
          <span>
            maka 7 × n = <b className="lb-key">203</b>
          </span>
        </span>
      </>
    );
  if (kode === "dekomposisi")
    return (
      <>
        <span className="lb-big is-md">8×92</span>
        <span className="lb-key">8 × (90 + 2) = 720 + 16 = 736</span>
      </>
    );
  if (kode === "pecahan")
    return (
      <span className="lb-frac-wrap">
        <span className="lb-frac">
          12
          <i />
          18
        </span>
        <span className="lb-key">= 2/3</span>
      </span>
    );
  return <span className="lb-big is-md">{contoh[0]}</span>;
}
