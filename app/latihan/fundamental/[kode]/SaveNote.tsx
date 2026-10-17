"use client";

import { useEffect, useRef, useState } from "react";
import type { KoranResultInput } from "@/lib/fundamental";
import { saveKoranResult } from "./actions";

/** Dipasang di layar hasil: simpan sekali ke riwayat Tes Koran, lalu tampilkan statusnya. payload null = tidak disimpan. */
export default function SaveNote({ payload, skip }: { payload: KoranResultInput | null; skip: string }) {
  const [status, setStatus] = useState<"saving" | "saved" | "failed">("saving");
  const sent = useRef(false);

  useEffect(() => {
    if (!payload || sent.current) return;
    sent.current = true;
    saveKoranResult(payload)
      .then((ok) => setStatus(ok ? "saved" : "failed"))
      .catch(() => setStatus("failed"));
  }, [payload]);

  const text = !payload
    ? skip
    : status === "saving"
      ? "Menyimpan ke riwayat…"
      : status === "saved"
        ? "Tersimpan ke riwayat. Lihat perkembangannya di halaman Tes Koran."
        : "Hasil ini belum bisa disimpan ke riwayat, tapi tetap bisa kamu lihat di sini.";
  return (
    <p className="muted" role="status">
      Nilai mentah tanpa norma. {text}
    </p>
  );
}
