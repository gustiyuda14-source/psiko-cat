"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ConfirmDialog } from "@/app/components/ui-client";

// Versi bundle ini, ditanam Vercel saat build (kosong di lokal: watcher nonaktif).
const BUILD = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const CHECK_MS = 5 * 60_000;
// Halaman sesi latihan/ujian: tidak pernah ada pop-up atau muat ulang di tengahnya.
const SESSION = /^\/(latihan|test)\//;
const RELOADED_KEY = "psiko_reloaded_for";

function reloadOnce(version: string): boolean {
  try {
    if (sessionStorage.getItem(RELOADED_KEY) === version) return false;
    sessionStorage.setItem(RELOADED_KEY, version);
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/*
  Tab yang dibuka sebelum deploy tetap menjalankan JavaScript lama sampai dimuat ulang.
  - Tiap pindah halaman, versi dicek. Baru masuk halaman sesi dengan versi lama → langsung
    dimuat ulang (peserta belum sempat menjawab). Maksimal sekali per versi, supaya tidak
    berulang bila server dan bundle tidak pernah cocok.
  - Di halaman lain, versi baru memunculkan pop-up "Muat ulang sekarang" (juga saat tab
    difokuskan dan tiap 5 menit).
  - Di tengah sesi tidak ada apa-apa; muat ulang terjadi di perpindahan halaman berikutnya.
*/
export default function VersionWatcher() {
  const pathname = usePathname();
  const firstPath = useRef(pathname);
  const stale = useRef<string | null>(null);
  const [notice, setNotice] = useState(false);

  const check = useCallback(async (): Promise<string | null> => {
    if (!BUILD) return null;
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      const data = res.ok ? ((await res.json()) as { version?: string | null }) : null;
      if (data?.version && data.version !== BUILD) stale.current = data.version;
    } catch {
      // offline / belum login: coba lagi di pengecekan berikutnya
    }
    return stale.current;
  }, []);

  useEffect(() => {
    const onCheck = () => {
      void check().then((v) => {
        if (v && !SESSION.test(window.location.pathname)) setNotice(true);
      });
    };
    const id = window.setInterval(onCheck, CHECK_MS);
    window.addEventListener("focus", onCheck);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onCheck);
    };
  }, [check]);

  useEffect(() => {
    let cancelled = false;
    void check().then((v) => {
      if (!v || cancelled) return;
      // Pindah halaman dengan versi lama: muat ulang sekarang (aman, belum ada yang dikerjakan di sini).
      if (pathname !== firstPath.current && reloadOnce(v)) return;
      if (!SESSION.test(pathname)) setNotice(true);
    });
    return () => {
      cancelled = true;
    };
  }, [check, pathname]);

  return (
    <ConfirmDialog
      open={notice && !SESSION.test(pathname)}
      onClose={() => setNotice(false)}
      onConfirm={() => window.location.reload()}
      title="Versi baru tersedia"
      confirmLabel="Muat ulang sekarang"
      cancelLabel="Nanti"
    >
      <p className="text-muted-foreground">
        Aplikasi baru saja diperbarui. Muat ulang dulu supaya latihan dan simulasi memakai versi terbaru.
      </p>
    </ConfirmDialog>
  );
}
