"use client";

import { useEffect, useState } from "react";

/*
  Penjaga keluar untuk sesi latihan/simulasi yang sedang berjalan (pola dajiks-cest).
  Selama `active`: tutup/refresh tab memunculkan peringatan bawaan browser, dan tombol
  back HP/browser ditahan lalu membuka konfirmasi langkah 1 (dirender LeaveConfirm).

  Back ditahan dengan entri riwayat tambahan di URL yang sama; Next mengabaikannya karena
  pushState tanpa URL hanya menyalin state internal router. Entri itu sengaja tidak dibuang
  saat penjaga lepas: history.back() asinkron bisa balapan dengan router.push sesudah
  sub-tes selesai dan membawa peserta kembali ke halaman ujian. Akibatnya setelah sesi
  selesai, back pertama tidak berpindah halaman.
*/
export function useLeaveGuard(active: boolean) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const trap = () => window.history.pushState({ leaveGuard: true }, "");
    const onPopState = () => {
      trap();
      setStep(1);
    };
    if (!window.history.state?.leaveGuard) trap();
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [active]);

  return [step, setStep] as const;
}
