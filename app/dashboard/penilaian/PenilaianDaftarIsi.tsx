"use client";

import { useEffect, useState } from "react";

/* Daftar isi lengket; bagian yang sedang dibaca menyala. */
export default function PenilaianDaftarIsi({ bagian }: { bagian: { id: string; label: string }[] }) {
  const [aktif, setAktif] = useState<string | null>(null);

  useEffect(() => {
    const spy = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setAktif(e.target.id); }),
      { rootMargin: "-15% 0px -75% 0px" },
    );
    bagian.forEach((b) => { const el = document.getElementById(b.id); if (el) spy.observe(el); });
    return () => spy.disconnect();
  }, [bagian]);

  return (
    <nav className="pnl-toc" aria-label="Daftar isi">
      <p className="pnl-kicker">Daftar isi</p>
      <p className="pnl-hint">Ketuk untuk lompat ke bagian</p>
      <ol>
        {bagian.map((b) => (
          <li key={b.id}>
            <a className="pnl-press" href={`#${b.id}`} aria-current={aktif === b.id ? "true" : undefined}>{b.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
