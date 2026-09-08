"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent font-heading text-xl font-bold text-primary" aria-hidden="true">
            P
          </div>
          <h1 className="font-heading text-3xl font-bold">Psiko CAT</h1>
          <p className="mt-1 text-sm text-white/60">Sistem Psikotes Terintegrasi</p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card space-y-5 p-6 sm:p-8">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-semibold text-foreground">Username</label>
            <input
              id="username"
              required
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="contoh: salfa"
              className="min-h-12 w-full rounded-xl border border-border bg-card px-4 py-3 text-base placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
            <input
              id="password"
              required
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="min-h-12 w-full rounded-xl border border-border bg-card px-4 py-3 text-base placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 min-h-12 w-full rounded-xl bg-accent py-3 text-sm font-bold text-primary transition-colors duration-200 hover:bg-accent/90 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk →"}
          </button>
        </form>

        <p className="text-center text-xs text-white/50">
          Didukung oleh D Ajiks Corporation
        </p>
      </div>
    </div>
  );
}
