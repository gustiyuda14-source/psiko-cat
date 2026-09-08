"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";

const NAV_ITEMS = [
  { label: "Beranda", href: "/dashboard" },
  { label: "Simulasi", href: "/dashboard/simulasi" },
  { label: "Latihan", href: "/dashboard/latihan" },
  { label: "Review Soal", href: "/dashboard/review" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Sidebar({ name, username }: { name: string; username: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", close);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const sidebarBody = (
    <div className="flex h-full flex-col bg-[#0b2442] text-white">
      <div className="flex min-h-20 items-center justify-between gap-4 border-b border-white/10 px-6">
        <div>
          <p className="font-heading text-lg font-semibold">Psiko CAT</p>
          <p className="text-xs text-white/65">Sistem Psikotes Terintegrasi</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => {
            setOpen(false);
            menuButtonRef.current?.focus();
          }}
          className="min-h-11 rounded-lg px-2 text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white lg:hidden"
        >
          Tutup
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5" aria-label="Menu utama">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-white text-primary shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-white/60">@{username}</p>
          </div>
        </div>
        <LogoutButton className="min-h-11 w-full rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white" />
        <p className="text-[11px] text-white/50">Didukung oleh D Ajiks Corporation</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="flex min-h-16 items-center justify-between border-b border-border bg-card px-4 shadow-[0_8px_24px_-22px_rgba(16,33,59,0.7)] lg:hidden">
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">Psiko CAT</p>
          <p className="text-[11px] text-muted-foreground">{NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label}</p>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="flex size-11 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card"
        >
          <span className="block h-0.5 w-5 bg-foreground" />
          <span className="block h-0.5 w-5 bg-foreground" />
          <span className="block h-0.5 w-5 bg-foreground" />
        </button>
      </div>

      <aside className="hidden w-72 shrink-0 shadow-[12px_0_40px_-24px_rgba(15,35,65,0.62)] lg:block">
        {sidebarBody}
      </aside>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          />
          <aside
            id="mobile-navigation"
            className="fixed inset-y-0 left-0 z-50 w-[min(19rem,88vw)] shadow-[12px_0_40px_-20px_rgba(7,24,46,0.72)] lg:hidden"
            aria-label="Navigasi utama"
          >
            {sidebarBody}
          </aside>
        </>
      )}
    </>
  );
}
