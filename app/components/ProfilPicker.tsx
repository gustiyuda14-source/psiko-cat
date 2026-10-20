"use client";

import { useTransition } from "react";
import { JALUR, JALUR_LABEL, JALUR_SETARA, type Jalur } from "@/lib/scoring/psikogram";
import { simpanProfil } from "./profil-actions";

/*
  Profil tujuan psikogram. Disimpan di akun peserta (users.profil_tujuan), jadi ikut ke perangkat
  mana pun; dibaca server di beranda, simulasi, hasil, review, admin. Bisa diganti kapan saja.
*/
export default function ProfilPicker({ value, className = "" }: { value: Jalur | null; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <label className={`inline-flex max-w-full flex-col gap-1 text-xs font-semibold text-muted-foreground ${className}`}>
      Profil tujuan
      <select
        value={value ?? ""}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value;
          start(() => simpanProfil(v));
        }}
        className="min-h-11 max-w-full rounded-md border border-border-strong bg-card px-3 text-sm font-semibold text-foreground focus-visible:outline-3 focus-visible:outline-ring disabled:opacity-60"
      >
        {!value && <option value="" disabled>Pilih profil…</option>}
        {JALUR.map((j) => (
          <option key={j} value={j}>{JALUR_LABEL[j]} · {JALUR_SETARA[j]}</option>
        ))}
      </select>
    </label>
  );
}
