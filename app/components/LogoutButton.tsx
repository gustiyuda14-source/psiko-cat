"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";
import { clearProgressCache, flushLatihanProgress } from "@/lib/practice-progress";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      // Capaian latihan yang masih antre dikirim dengan sesi akun ini, lalu cache dikosongkan
      // supaya akun berikutnya di perangkat yang sama tidak melihat progres akun ini.
      await flushLatihanProgress();
      await fetch("/api/auth/logout", { method: "POST" });
      clearProgressCache();
      router.push("/login");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className={className ?? buttonStyles({ variant: "secondary", size: "sm" })}
    >
      <LogOut className="size-4" />
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}
