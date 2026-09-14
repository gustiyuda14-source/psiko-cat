"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { AlertTriangle, Check } from "@/app/components/icons";

type StoreData = {
  sessionId: string | null;
  moduleSessionId: string | null;
  answers: Record<string, string>;
  status: string;
};

function readStore(key: string): StoreData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state?.moduleSessionId) return null;
    return {
      sessionId: state.sessionId ?? null,
      moduleSessionId: state.moduleSessionId,
      answers: state.answers ?? {},
      status: state.status ?? "unknown",
    };
  } catch {
    return null;
  }
}

export default function RescuePage() {
  const router = useRouter();
  const [kecerdasan, setKecerdasan] = useState<StoreData | null>(null);
  const [kepribadian, setKepribadian] = useState<StoreData | null>(null);
  const [kecermatan, setKecermatan] = useState<StoreData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{
    total_rescued: number;
    kecermatan_requires_admin: boolean;
    recalculated: null;
  } | null>(null);

  useEffect(() => {
    const ks = readStore("kecerdasan-engine");
    const kp = readStore("kepribadian-engine");
    const kc = readStore("kecermatan-engine");
    queueMicrotask(() => {
      setKecerdasan(ks);
      setKepribadian(kp);
      setKecermatan(kc);
      setSessionId(ks?.sessionId ?? kp?.sessionId ?? kc?.sessionId ?? null);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
        <p role="status" className="text-sm text-muted-foreground">Memeriksa data di perangkat…</p>
      </div>
    );
  }

  const forSession = (data: StoreData | null) => data?.sessionId === sessionId ? data : null;
  const recoverableKecerdasan = forSession(kecerdasan);
  const recoverableKepribadian = forSession(kepribadian);
  const localKecermatan = forSession(kecermatan);
  const totalFound =
    Object.keys(recoverableKecerdasan?.answers ?? {}).length +
    Object.keys(recoverableKepribadian?.answers ?? {}).length;

  async function handleRescue() {
    setStatus("loading");
    try {
      const res = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          kecerdasan: recoverableKecerdasan
            ? { moduleSessionId: recoverableKecerdasan.moduleSessionId, answers: recoverableKecerdasan.answers }
            : undefined,
          kepribadian: recoverableKepribadian
            ? { moduleSessionId: recoverableKepribadian.moduleSessionId, answers: recoverableKepribadian.answers }
            : undefined,
          kecermatan: localKecermatan
            ? { moduleSessionId: localKecermatan.moduleSessionId, answers: localKecermatan.answers }
            : undefined,
        }),
      });
      if (!res.ok) throw new Error("Gagal");
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (!kecerdasan && !kepribadian && !kecermatan) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
        <div className="surface-panel max-w-sm space-y-4 p-6 text-center">
          <AlertTriangle className="mx-auto size-10 text-accent-ink" />
          <h1 className="font-heading text-xl text-foreground">Data tidak ditemukan</h1>
          <p className="text-sm text-muted-foreground">
            Tidak ada data jawaban di browser ini. Pastikan kamu membuka halaman ini
            di browser dan perangkat yang sama saat mengerjakan soal.
          </p>
          <Button variant="secondary" block onClick={() => router.push("/dashboard")}>Kembali ke dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-heading text-2xl">Pulihkan jawaban</h1>
          <p className="text-sm text-muted-foreground">
            Jawaban ditemukan di browser ini dan siap dikembalikan ke server.
          </p>
        </div>

        <div className="surface-card divide-y divide-border overflow-hidden">
          {[
            { label: "Kecerdasan", data: recoverableKecerdasan, supported: true },
            { label: "Kepribadian", data: recoverableKepribadian, supported: true },
            { label: "Kecermatan", data: localKecermatan, supported: false },
          ].map(({ label, data, supported }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-semibold text-foreground">{label}</span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="tnum">{data ? `${Object.keys(data.answers).length} jawaban` : "Tidak ada data"}</span>
                {data && !supported && <Badge tone="accent">Butuh admin</Badge>}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-surface-inset px-5 py-4">
            <span className="text-sm font-bold text-foreground">Dapat dipulihkan otomatis</span>
            <span className="tnum text-sm font-bold text-foreground">{totalFound} jawaban</span>
          </div>
        </div>

        {localKecermatan && (
          <p className="rounded-md border border-accent/35 bg-accent-soft px-4 py-3 text-sm text-accent-ink">
            Log Kecermatan tidak dipulihkan dari ringkasan browser karena urutan dan waktu klik harus diverifikasi oleh admin.
          </p>
        )}

        {status === "idle" && totalFound > 0 && (
          <Button
            variant="primary"
            size="lg"
            block
            onClick={handleRescue}
          >
            Pulihkan jawaban yang didukung
          </Button>
        )}

        {status === "idle" && totalFound === 0 && (
          <Button variant="secondary" block onClick={() => router.push(sessionId ? `/test/${sessionId}` : "/dashboard")}>
            Kembali
          </Button>
        )}

        {status === "loading" && (
          <div className="surface-panel space-y-3 py-8 text-center" role="status">
            <p className="text-sm font-semibold text-foreground">Sedang memulihkan jawaban…</p>
            <p className="text-xs text-muted-foreground">Jangan tutup halaman ini.</p>
          </div>
        )}

        {status === "done" && result && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-success/30 bg-success-soft py-6 text-center" role="status">
              <Check className="mx-auto size-8 text-success" strokeWidth={2.5} />
              <h2 className="text-lg font-bold text-success">Jawaban dipulihkan</h2>
              <p className="text-sm text-muted-foreground">{result.total_rescued} jawaban berhasil disimpan ke server. Nilai belum dihitung ulang.</p>
            </div>
            {sessionId && (
              <Button
                variant="primary"
                size="lg"
                block
                onClick={() => router.push(`/test/${sessionId}`)}
              >
                Kembali ke sesi
              </Button>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive-soft p-5 text-center" role="alert">
            <p className="text-sm text-destructive">Gagal memulihkan. Coba lagi atau hubungi pengawas.</p>
            <Button variant="danger" onClick={() => setStatus("idle")}>Coba lagi</Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Hanya bisa dilakukan dari browser & perangkat yang sama saat mengerjakan soal.
        </p>
      </div>
    </div>
  );
}
