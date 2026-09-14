"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "@/app/components/icons";
import { buttonStyles } from "@/app/components/ui";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
