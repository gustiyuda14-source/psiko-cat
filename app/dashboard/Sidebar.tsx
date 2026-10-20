"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
import ThemeToggle from "@/app/components/ThemeToggle";
import { MODULE_CONFIG, MODULE_ORDER, latihanHref, type ModuleType } from "@/lib/test-config";
import { ChevronDown, Close } from "@/app/components/icons";
import {
  NavAdmin, NavDrill, NavFundamental, NavHasil, NavHome, NavKecerdasan, NavKecermatan, NavKepribadian, NavKeswa, NavKosakata, NavKraepelin, NavLatihan, NavReview, NavSimulasi, UserGlyph,
} from "@/app/components/nav-icons";

/*
  Shell navigasi dashboard mengikuti dajiks-cest: sidebar putih tetap di kiri
  (264px), top bar lengket 76px, di HP sidebar jadi laci geser dengan
  hamburger navy yang berubah jadi X. Urutan dan isi menu (termasuk submenu
  Latihan) masih menu psiko-cat; penyesuaian submenu menyusul.
*/

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: NavHome },
  { label: "Simulasi Penuh/Tryout", href: "/dashboard/simulasi", icon: NavSimulasi },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "Drilling", href: "/dashboard/drill", icon: NavDrill },
  { label: "Fundamental", href: "/dashboard/fundamental", icon: NavFundamental },
  { label: "Keswa", href: "/dashboard/keswa", icon: NavKeswa },
  { label: "Kraepelin / Tes Koran", href: "/dashboard/kraepelin", icon: NavKraepelin },
  { label: "Kosakata", href: "/dashboard/kosakata", icon: NavKosakata },
  { label: "Review Soal", href: "/dashboard/review", icon: NavReview },
];

// Hanya untuk akun admin (seperti tautan "Admin: akun peserta" di dajiks-cest); akses dicek ulang di server.
const ADMIN_NAV: NavItem[] = [
  { label: "Akun peserta", href: "/admin/akun", icon: NavAdmin },
  { label: "Hasil peserta", href: "/admin", icon: NavHasil },
];

const SUB_ICON: Record<ModuleType, (props: { className?: string }) => React.ReactElement> = {
  KECERDASAN: NavKecerdasan,
  KECERMATAN: NavKecermatan,
  KEPRIBADIAN: NavKepribadian,
};

function isActive(pathname: string, href: string): boolean {
  return href === "/dashboard" || href === "/admin" ? pathname === href : pathname.startsWith(href);
}

/* Tujuan tombol Kembali: induk halaman, bukan riwayat browser (peserta yang
   masuk lewat tautan langsung tidak boleh terlempar keluar aplikasi). */
function backTarget(pathname: string): { href: string; label: string } | null {
  if (pathname === "/dashboard") return null;
  if (pathname.startsWith("/dashboard/latihan/")) {
    return { href: "/dashboard/latihan", label: "Kembali ke Latihan" };
  }
  return { href: "/dashboard", label: "Kembali ke Beranda" };
}

/* Gaya bersih: ikon garis polos, item aktif = pill navy tipis + ikon terisi lembut (.nav-active di globals.css). */
function navItemClass(active: boolean): string {
  return [
    "flex min-h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem]",
    "transition-[color,background-color,scale] duration-150 ease-out max-lg:min-h-12 max-lg:text-base",
    // Efek terpencet: sedikit mengecil + latar menggelap (HP tidak punya hover, tap highlight dimatikan).
    "active:scale-[0.98] active:bg-foreground/[0.08]",
    active
      ? "nav-active bg-brand-ink/[0.07] font-semibold text-brand-ink"
      : "font-medium text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
  ].join(" ");
}

function NavHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function Sidebar({ name, username, isAdmin = false }: { name: string; username: string; isAdmin?: boolean }) {
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

  const back = backTarget(pathname);

  const renderLink = (item: NavItem) => {
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
        <Icon />
        {item.label}
      </Link>
    );
  };

  const sidebarBody = (navigationId: string, mobile: boolean) => (
    <div className="flex h-full flex-col overflow-y-auto overscroll-contain bg-card">
      <div className="flex items-center gap-3 border-b border-border px-6 py-8 max-lg:px-6 max-lg:py-4">
        <span className="size-12 shrink-0 overflow-hidden rounded-sm bg-[#151515]" aria-hidden="true">
          <Image
            src="/brand/dajiks-emblem.png"
            alt=""
            width={96}
            height={96}
            className="size-full object-cover"
            priority
          />
        </span>
        <span className="font-heading text-[1.1rem] font-bold leading-[1.15] tracking-[-0.02em]">
          D’AJIKS
          <br />
          <b className="text-gold">AKADEMI</b>
        </span>
        {mobile && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => {
              setOpen(false);
              menuButtonRef.current?.focus();
            }}
            aria-label="Tutup menu"
            className="ml-auto grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface-inset text-brand-ink transition-colors duration-200 hover:border-gold"
          >
            <Close className="size-5" />
          </button>
        )}
      </div>

      {mobile && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg bg-navy px-4 py-3 text-white">
          <UserGlyph className="size-9 shrink-0 rounded-full border border-dashed border-gold-hi/60 p-[7px] text-gold-hi" />
          <span className="grid min-w-0">
            <small className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-gold-hi">
              Peserta
            </small>
            <b className="truncate font-heading text-base font-semibold">{name}</b>
            <span className="truncate text-xs text-white/70">@{username}</span>
          </span>
        </div>
      )}

      <nav className="grid gap-0.5 px-3 py-5 max-lg:py-3" aria-label="Menu utama">
        {PRIMARY_NAV.map(renderLink)}

        <NavHeading>Latihan &amp; belajar</NavHeading>

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
            <NavLatihan />
            Latihan/Mini Tryout
          </Link>
          <button
            type="button"
            onClick={() => setLatihanOpen((o) => !o)}
            aria-label={latihanOpen ? "Tutup pilihan latihan" : "Buka pilihan latihan"}
            aria-expanded={latihanOpen}
            aria-controls={`${navigationId}-latihan-submenu`}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out hover:bg-foreground/[0.04] hover:text-foreground active:scale-95 active:bg-foreground/[0.08] max-lg:size-12"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-200 ease-out ${
                latihanOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {latihanOpen && (
          <ul
            id={`${navigationId}-latihan-submenu`}
            className="my-1 ml-[21px] border-l border-border"
          >
            {MODULE_ORDER.map((type) => {
              const meta = MODULE_CONFIG[type];
              const href = latihanHref(type);
              const active = isActive(pathname, href);
              const SubIcon = SUB_ICON[type];
              return (
                <li key={type}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`-ml-px flex min-h-9 items-center gap-2.5 border-l-2 pl-[19px] pr-3 text-sm transition-[color,background-color,scale] duration-150 ease-out active:scale-[0.98] active:bg-foreground/[0.06] max-lg:min-h-11 ${
                      active
                        ? "border-brand-ink font-semibold text-brand-ink"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <SubIcon className="size-4" />
                    {meta.menuLabel ?? meta.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {SECONDARY_NAV.map(renderLink)}
        {isAdmin && (
          <>
            <NavHeading>Admin</NavHeading>
            {ADMIN_NAV.map(renderLink)}
          </>
        )}
      </nav>

      <p className="mx-6 mb-6 mt-auto border-t border-dashed border-border pt-4 text-sm text-muted-foreground lg:border-t-0 lg:pt-0">
        Didukung oleh D Ajiks Corporation
      </p>
    </div>
  );

  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-[8] hidden w-[var(--sidebar-width)] border-r border-border lg:block"
        aria-label="Navigasi utama"
      >
        {sidebarBody("desktop", false)}
      </aside>

      <header className="sticky top-0 z-[7] flex min-h-[var(--topbar-height)] items-center gap-4 border-b border-border bg-card px-4 py-3 sm:px-6 lg:ml-[var(--sidebar-width)] lg:px-[clamp(24px,4vw,64px)]">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="group grid size-[46px] shrink-0 place-items-center rounded-xl bg-navy text-gold-hi shadow-[inset_0_0_0_1px_rgb(232_199_102/0.35)] transition-[box-shadow,scale] duration-150 ease-out hover:shadow-[inset_0_0_0_1.5px_var(--gold-hi)] active:scale-95 lg:hidden"
        >
          <span className="relative block h-3.5 w-5" aria-hidden="true">
            <i className={`absolute left-0 top-0 h-[2.25px] w-full rounded-sm bg-current transition-transform duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <i className={`absolute left-0 top-[6px] h-[2.25px] w-[70%] rounded-sm bg-current transition-[opacity,transform] duration-150 ${open ? "scale-x-0 opacity-0" : ""}`} />
            <i className={`absolute left-0 top-3 h-[2.25px] w-full rounded-sm bg-current transition-transform duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </span>
        </button>

        {back && (
          <Link
            href={back.href}
            aria-label={back.label}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-[color,background-color,border-color,scale] duration-150 ease-out hover:border-accent hover:bg-surface-inset active:scale-[0.97] max-lg:px-3"
          >
            <span aria-hidden="true" className="font-bold text-gold">←</span>
            <span className="max-lg:sr-only">{back.label}</span>
          </Link>
        )}

        <div className="min-w-0">
          <strong className="block truncate text-base">Psiko CAT</strong>
        </div>

        <div className="ml-auto hidden min-w-0 text-right lg:block">
          <span className="block text-sm text-muted-foreground">Peserta</span>
          <b className="block truncate text-sm">{name}</b>
        </div>

        <ThemeToggle className="max-lg:ml-auto" />

        <LogoutButton className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition-[color,background-color,border-color,scale] duration-150 ease-out hover:border-accent hover:bg-surface-inset active:scale-[0.97]" />
      </header>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[7] cursor-default bg-[rgb(15_35_43/0.4)] backdrop-blur-[6px] lg:hidden"
            onClick={() => {
              setOpen(false);
              menuButtonRef.current?.focus();
            }}
            aria-label="Tutup menu"
          />
          <aside
            ref={mobileAsideRef}
            id="mobile-navigation"
            className="fixed inset-y-0 left-0 z-[9] w-[min(82vw,310px)] border-r border-border shadow-[18px_0_40px_-18px_rgb(22_34_74/0.45)] lg:hidden"
            aria-label="Navigasi utama"
            role="dialog"
            aria-modal="true"
          >
            {sidebarBody("mobile", true)}
          </aside>
        </>
      )}
    </>
  );
}
