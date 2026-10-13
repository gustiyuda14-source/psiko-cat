"use client";

import { useSyncExternalStore } from "react";

/*
  Pilihan tema: Sistem / Terang / Gelap. Pilihan disimpan di localStorage dan dipasang sebagai
  data-theme di <html>; skrip di app/layout.tsx memasangnya sebelum cat pertama. "Sistem" =
  tanpa atribut, jadi CSS mengikuti prefers-color-scheme (token di app/globals.css).
*/

const KEY = "ajiks-theme";
type Theme = "system" | "light" | "dark";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "Ikuti perangkat",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    value: "light",
    label: "Mode terang",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  { value: "dark", label: "Mode gelap", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> },
];

// Sumber kebenaran = atribut data-theme di <html> (sudah dipasang skrip di layout sebelum cat).
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const read = (): Theme => (document.documentElement.getAttribute("data-theme") as Theme | null) ?? "system";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  function pick(t: Theme) {
    const root = document.documentElement;
    if (t === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t);
    try {
      if (t === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, t);
    } catch {}
  }

  return (
    <div role="group" aria-label="Tema tampilan" className={`inline-flex shrink-0 gap-0.5 rounded-full border border-border bg-surface-inset p-0.5 ${className}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={theme === o.value}
          aria-label={o.label}
          title={o.label}
          onClick={() => pick(o.value)}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:text-foreground active:scale-95 aria-pressed:bg-navy aria-pressed:text-gold-hi"
        >
          <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {o.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
