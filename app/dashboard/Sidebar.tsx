"use client";

import { useState } from "react";
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

  const sidebarBody = (
    <div className="flex h-full flex-col bg-[#0b2442] text-white">
      <div className="px-6 py-6">
        <p className="text-lg font-semibold">Psiko CAT</p>
        <p className="text-xs text-slate-400">Ruang Latihan Psikotes</p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-white text-primary" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-slate-400">@{username}</p>
          </div>
        </div>
        <LogoutButton className="w-full rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/30 hover:text-white" />
        <p className="text-[11px] text-slate-500">Didukung oleh D Ajiks Corporation</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <p className="text-sm font-semibold text-foreground">Psiko CAT</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="flex flex-col justify-center gap-1 rounded-lg border border-border p-2"
        >
          <span className="block h-0.5 w-5 bg-foreground" />
          <span className="block h-0.5 w-5 bg-foreground" />
          <span className="block h-0.5 w-5 bg-foreground" />
        </button>
      </div>

      {/* Sidebar: overlay drawer on mobile, static column at lg: and above */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shadow-[12px_0_40px_-24px_rgba(15,35,65,0.62)] transition-transform duration-200 lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarBody}
      </aside>

      {/* Scrim (mobile only, while drawer is open) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
