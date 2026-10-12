"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Versi bundle ini, ditanam Vercel saat build (kosong di lokal: watcher nonaktif).
const BUILD = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const CHECK_MS = 5 * 60_000;

/*
  Tab yang dibuka sebelum deploy tetap menjalankan JavaScript lama sampai dimuat ulang.
  Watcher ini mengecek /api/version saat tab difokuskan dan tiap 5 menit; kalau versinya
  sudah berganti, halaman dimuat ulang pada perpindahan halaman berikutnya. Tidak pernah
  memuat ulang di tengah halaman, jadi jawaban latihan/ujian yang sedang dikerjakan aman.
*/
export default function VersionWatcher() {
  const pathname = usePathname();
  const stale = useRef(false);
  const firstPath = useRef(pathname);

  useEffect(() => {
    if (!BUILD) return;
    const check = () => {
      if (stale.current) return;
      fetch("/api/version", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { version?: string | null } | null) => {
          if (data?.version && data.version !== BUILD) stale.current = true;
        })
        .catch(() => {});
    };
    check();
    const id = window.setInterval(check, CHECK_MS);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", check);
    };
  }, []);

  useEffect(() => {
    if (pathname !== firstPath.current && stale.current) window.location.reload();
  }, [pathname]);

  return null;
}
