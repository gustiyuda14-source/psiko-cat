"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui-client";
import { retryProgressLoad, saveLatihanAttempt, useLatihanAttempts } from "@/lib/practice-progress";
import { MAX_LATIHAN_ATTEMPTS } from "@/lib/progress-rules";

/*
  Baris status di layar selesai latihan: menyimpan jawaban yang baru dikumpulkan
  supaya pembahasannya bisa dibuka lagi dari halaman paket. Maksimal 2 percobaan
  per paket; kalau sudah 2, peserta harus setuju dulu bahwa pembahasan paling lama
  dihapus. Tanpa persetujuan, percobaan ini tidak disimpan.
*/

const tanggal = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AttemptSaver({
  progressKey,
  answers,
  timed = false,
}: {
  progressKey?: string;
  answers: Record<string, string | null>;
  timed?: boolean;
}) {
  const { attempts, ready } = useLatihanAttempts();
  // Data percobaan belum termuat (sinyal putus): coba lagi terus, jangan diam-diam tidak menyimpan.
  useEffect(() => {
    if (ready) return;
    const id = window.setInterval(retryProgressLoad, 4000);
    return () => window.clearInterval(id);
  }, [ready]);
  if (!progressKey || !Object.keys(answers).length) return null;
  if (!ready) {
    return (
      <div className="notice text-sm" role="status">
        <p className="text-muted-foreground">Menyiapkan penyimpanan pembahasan… Pastikan koneksi internet menyala.</p>
      </div>
    );
  }
  const existing = attempts[progressKey] ?? [];
  // Keputusan awal diambil sekali saat daftar percobaan dari server termuat; setelah itu
  // daftar boleh berubah (termasuk karena simpanan ini sendiri) tanpa mengubah keputusan.
  return <Saver progressKey={progressKey} answers={answers} timed={timed} oldestAt={existing.at(-1)?.at} full={existing.length >= MAX_LATIHAN_ATTEMPTS} />;
}

function Saver({
  progressKey,
  answers,
  timed,
  oldestAt,
  full,
}: {
  progressKey: string;
  answers: Record<string, string | null>;
  timed: boolean;
  oldestAt?: string;
  full: boolean;
}) {
  const [status, setStatus] = useState<"ask" | "saving" | "saved" | "failed" | "declined">(() => (full ? "ask" : "saving"));
  const [oldest] = useState(oldestAt);
  const started = useRef(false);

  function save() {
    setStatus("saving");
    void saveLatihanAttempt(progressKey, answers, timed).then((ok) => setStatus(ok ? "saved" : "failed"));
  }

  useEffect(() => {
    if (started.current || full) return;
    started.current = true;
    void saveLatihanAttempt(progressKey, answers, timed).then((ok) => setStatus(ok ? "saved" : "failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sekali saat layar selesai tampil
  }, []);

  return (
    <div className="notice text-sm" role="status">
      {status === "saving" && <p className="text-muted-foreground">Menyimpan pembahasan…</p>}
      {status === "saved" && (
        <p className="text-foreground">
          Pembahasan tersimpan. Buka lagi kapan saja lewat <b>Pembahasan tersimpan</b> di halaman paket.
        </p>
      )}
      {status === "failed" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-destructive">Pembahasan belum tersimpan. Periksa koneksi lalu coba lagi.</p>
          <Button variant="secondary" size="sm" onClick={save}>
            Coba simpan lagi
          </Button>
        </div>
      )}
      {status === "declined" && (
        <p className="text-muted-foreground">
          Percobaan ini tidak disimpan. Pembahasannya hanya ada selama halaman ini terbuka.
        </p>
      )}
      {status === "ask" && (
        <div className="space-y-3">
          <p className="text-foreground">
            Paket ini sudah punya {MAX_LATIHAN_ATTEMPTS} pembahasan tersimpan. Menyimpan percobaan ini akan{" "}
            <b>menghapus pembahasan {oldest ? tanggal(oldest) : "paling lama"}</b>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={save}>
              Simpan, hapus yang lama
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStatus("declined")}>
              Jangan simpan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
