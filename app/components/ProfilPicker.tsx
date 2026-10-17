"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { JALUR, JALUR_LABEL, JALUR_SETARA, type Jalur } from "@/lib/scoring/psikogram";

/*
  Profil tujuan psikogram. Disimpan di cookie (dibaca server di beranda, simulasi, admin)
  supaya pilihan diingat, tapi selalu bisa diganti dari halaman mana pun.
*/
export default function ProfilPicker({ value, className = "" }: { value: Jalur | null; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className={`inline-flex flex-col gap-1 text-xs font-semibold text-muted-foreground ${className}`}>
      Profil tujuan
      <select
        value={value ?? ""}
        disabled={pending}
        onChange={(e) => {
          document.cookie = `psg_profil=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          start(() => router.refresh());
        }}
        className="min-h-11 rounded-md border border-border-strong bg-card px-3 text-sm font-semibold text-foreground focus-visible:outline-3 focus-visible:outline-ring disabled:opacity-60"
      >
        {!value && <option value="" disabled>Pilih profil…</option>}
        {JALUR.map((j) => (
          <option key={j} value={j}>{JALUR_LABEL[j]} · {JALUR_SETARA[j]}</option>
        ))}
      </select>
    </label>
  );
}
