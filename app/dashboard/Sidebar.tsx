"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
import { MODULE_CONFIG, MODULE_ORDER, latihanHref } from "@/lib/test-config";
import {
  ChevronDown,
  ClipboardCheck,
  Close,
  Home,
  Menu,
  Repeat,
  Timer,
} from "@/app/components/icons";

type NavItem = {
  label: string;
  href: string;
  icon: (p: { className?: string }) => React.ReactElement;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: Home },
  { label: "Simulasi", href: "/dashboard/simulasi", icon: Timer },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "Review Soal", href: "/dashboard/review", icon: ClipboardCheck },
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

/*
  State terpilih dipertahankan sebagai pil putih solid di atas navy — itu sinyal
  paling kuat dan paling tidak ambigu di permukaan gelap. Yang diperbaiki cuma
  eksekusinya: pil sekarang inset dari tepi panel, radiusnya ikut skala kontrol,
  dan ikon mewarisi warna teks sehingga tidak ada dua sumber warna dalam satu
  baris.
*/
function navItemClass(active: boolean): string {
  return [
    "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium",
    "transition-[background-color,color] duration-200 ease-out",
    active
      ? "bg-white text-primary shadow-e1"
      : "text-white/78 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

export default function Sidebar({ name, username }: { name: string; username: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const latihanActive = pathname.startsWith("/dashboard/latihan");
  const [latihanOpen, setLatihanOpen] = useState(latihanActive);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileAsideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = mobileAsideRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const currentLabel = latihanActive
    ? "Latihan"
    : [...PRIMARY_NAV, ...SECONDARY_NAV].find((item) => isActive(pathname, item.href))?.label;

  const sidebarBody = (navigationId: string) => (
    <div className="on-nav flex h-full flex-col bg-surface-nav text-white">
      <div className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent font-heading text-sm font-bold text-primary"
            aria-hidden="true"
          >
            PC
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-sm">Psiko CAT</p>
            <p className="truncate text-xs text-white/60">Ajiks Akademi</p>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => {
            setOpen(false);
            menuButtonRef.current?.focus();
          }}
          aria-label="Tutup menu"
          className="flex size-10 shrink-0 items-center justify-center rounded-md text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <Close className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Menu utama">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={navItemClass(active)}
            >
              <Icon className="size-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/latihan"
            onClick={() => {
              setLatihanOpen(true);
              setOpen(false);
            }}
            aria-current={pathname === "/dashboard/latihan" ? "page" : undefined}
            className={`${navItemClass(latihanActive)} min-w-0 flex-1`}
          >
            <Repeat className="size-[18px] shrink-0" />
            Latihan
          </Link>
          <button
            type="button"
            onClick={() => setLatihanOpen((o) => !o)}
            aria-label={latihanOpen ? "Tutup pilihan latihan" : "Buka pilihan latihan"}
            aria-expanded={latihanOpen}
            aria-controls={`${navigationId}-latihan-submenu`}
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-white/78 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-200 ease-out ${
                latihanOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {latihanOpen && (
          <ul id={`${navigationId}-latihan-submenu`} className="ml-[18px] space-y-0.5 border-l border-white/12 py-1 pl-3">
            {MODULE_ORDER.map((type) => {
              const meta = MODULE_CONFIG[type];
              const href = latihanHref(type);
              const active = isActive(pathname, href);
              return (
                <li key={type}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-10 items-center rounded-md px-3 text-sm transition-colors duration-200 ${
                      active
                        ? "bg-white/14 font-semibold text-white"
                        : "text-white/65 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {meta.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {SECONDARY_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={navItemClass(active)}
            >
              <Icon className="size-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-xs font-semibold"
            aria-hidden="true"
          >
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-white/60">@{username}</p>
          </div>
        </div>
        <LogoutButton className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-xs font-semibold text-white/75 transition-colors duration-200 hover:border-white/30 hover:bg-white/8 hover:text-white" />
        <p className="text-xs text-white/50">Didukung oleh D Ajiks Corporation</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex min-h-14 items-center justify-between border-b border-border bg-card px-4 shadow-e1 lg:hidden">
        <div className="min-w-0">
          <p className="truncate font-heading text-sm text-foreground">Psiko CAT</p>
          {currentLabel && (
            <p className="truncate text-xs text-muted-foreground">{currentLabel}</p>
          )}
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="flex size-11 items-center justify-center rounded-md border border-border text-foreground transition-colors duration-200 hover:border-border-strong hover:bg-surface-inset"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:block xl:w-72">
        {sidebarBody("desktop")}
      </aside>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-[#08192f]/55 lg:hidden"
            onClick={() => {
              setOpen(false);
              menuButtonRef.current?.focus();
            }}
            aria-label="Tutup menu"
          />
          <aside
            ref={mobileAsideRef}
            id="mobile-navigation"
            className="fixed inset-y-0 left-0 z-50 w-[min(18rem,86vw)] shadow-e4 lg:hidden"
            aria-label="Navigasi utama"
            role="dialog"
            aria-modal="true"
          >
            {sidebarBody("mobile")}
          </aside>
        </>
      )}
    </>
  );
}
