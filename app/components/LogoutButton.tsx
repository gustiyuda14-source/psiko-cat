"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ??
        "text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/40"
      }
    >
      Keluar
    </button>
  );
}
