"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTestPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Terjadi kesalahan"); return; }
      router.push(`/test/${data.session_id}`);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Psiko CAT</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sistem Psikotes Terintegrasi — POLRI / IPDN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-zinc-900 border border-zinc-800 p-8">
          <h2 className="text-lg font-semibold text-white">Data Peserta</h2>

          {error && (
            <div className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Nama Lengkap *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@email.com"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400">No. Telepon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xx xxxx xxxx"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Mempersiapkan..." : "Mulai Tes →"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          Pastikan koneksi internet stabil sebelum memulai.
        </p>
      </div>
    </div>
  );
}
