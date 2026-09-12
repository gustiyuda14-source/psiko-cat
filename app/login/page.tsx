"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui-client";
import { AlertTriangle, ArrowRight } from "@/app/components/icons";

const FIELD_CLASS =
  "min-h-12 w-full rounded-md border border-border-strong/55 bg-card px-3.5 text-base text-foreground placeholder:text-faint-foreground transition-colors duration-200 hover:border-border-strong focus:border-primary";

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
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ornate flex min-h-[100dvh] items-center justify-center bg-surface-nav-deep px-4 py-10 sm:px-8">
      <div className="hero-panel grid w-full max-w-4xl gap-8 bg-primary sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="relative text-white">
          <Image
            src="/brand/dajiks-lockup.png"
            alt="D'Ajiks Akademi"
            width={1024}
            height={768}
            className="h-auto w-52 max-w-full object-contain"
            priority
          />
          <h1 className="font-heading mt-5 text-3xl sm:text-4xl">Psiko CAT</h1>
          <p className="mt-3 text-base text-white/75">Sistem Psikotes Terintegrasi</p>
          <p className="mt-6 max-w-[32ch] text-sm text-white/75">Satu ruang untuk latihan, simulasi, dan perkembangan hasil psikotes Anda.</p>
          <p className="mt-8 text-xs text-white/65">Didukung oleh D Ajiks Corporation</p>
        </div>

        <form onSubmit={handleSubmit} className="surface-panel relative space-y-5 p-6 sm:p-7">
          <h2 className="font-heading text-xl text-foreground">Masuk ke akun</h2>
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

          <Button type="submit" variant="accent" size="lg" block disabled={loading}>
            {loading ? "Memeriksa..." : "Masuk"}
            {!loading && <ArrowRight className="size-4" />}
          </Button>
        </form>

      </div>
    </div>
  );
}
