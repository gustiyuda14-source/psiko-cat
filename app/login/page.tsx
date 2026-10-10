"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui-client";
import { AlertTriangle, ArrowRight } from "@/app/components/icons";

const FIELD_CLASS =
  "min-h-12 w-full rounded-md border border-border-strong bg-card px-3.5 text-base text-foreground placeholder:text-faint-foreground transition-colors duration-200 hover:border-border-strong focus:border-primary";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login gagal");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10 sm:px-8">
      <div className="prog-panel mt-0 w-full max-w-4xl lg:[grid-template-columns:minmax(0,5fr)_minmax(0,6fr)]">
        <div className="prog-hero justify-center p-8 sm:p-10">
          <Image
            src="/brand/dajiks-lockup.png"
            alt="D'Ajiks Akademi"
            width={1024}
            height={768}
            className="h-auto w-52 max-w-full object-contain"
            priority
          />
          <span className="prog-label mt-2">Sistem Psikotes Terintegrasi</span>
          <h1 className="text-3xl text-white sm:text-4xl">Psiko CAT</h1>
          <p className="mt-2 max-w-[32ch] text-sm text-white/75">
            Satu ruang untuk latihan, simulasi, dan perkembangan hasil psikotes Anda.
          </p>
          <p className="prog-meta">Didukung oleh D Ajiks Corporation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-10">
          <div>
            <span className="section-kicker">Masuk</span>
            <h2 className="mt-1 font-heading text-xl text-foreground">Masuk ke akun</h2>
          </div>
          {/* Pesan galat hidup di dalam form dan diumumkan lewat aria-live, bukan
              muncul diam-diam di atas viewport. */}
          <div aria-live="polite">
            {error && (
              <p className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
                <AlertTriangle className="mt-px size-4 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-sm font-semibold text-foreground">
              Username
            </label>
            <input
              id="username"
              name="username"
              required
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="contoh: salfa"
              className={FIELD_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              required
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className={FIELD_CLASS}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" block disabled={loading}>
            {loading ? "Memeriksa..." : "Masuk"}
            {!loading && <ArrowRight className="size-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
