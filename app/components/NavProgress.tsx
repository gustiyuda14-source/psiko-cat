"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/*
  Bilah emas tipis di atas layar selama pindah halaman. Navigasi App Router berjalan sebagai
  transition: halaman lama tetap tampil sampai halaman baru siap, jadi tanpa ini klik menu terasa
  tidak terjadi apa-apa. Mulai saat tautan internal diklik (fase capture, sebelum <Link> memanggil
  preventDefault), selesai saat URL berubah. Gaya .nav-progress di globals.css.
*/
export default function NavProgress() {
  const key = `${usePathname()}?${useSearchParams().toString()}`;
  const [loading, setLoading] = useState(false);
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setLoading(false);
  }

  useEffect(() => {
    let stuck: number | undefined;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // halaman sama / hash saja
      setLoading(true);
      // Klik yang dibatalkan (mis. konfirmasi keluar ujian) tidak mengubah URL: jangan biarkan bilah menggantung.
      window.clearTimeout(stuck);
      stuck = window.setTimeout(() => setLoading(false), 12_000);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(stuck);
    };
  }, []);

  return <div className={`nav-progress${loading ? " is-loading" : ""}`} aria-hidden="true" />;
}
