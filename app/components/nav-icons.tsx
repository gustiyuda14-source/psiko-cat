/*
  Ikon menu duotone, dipindah dari dajiks-cest (index.html). Kontrak: viewBox 24,
  tanpa fill/stroke di root, `.sf` = isian lembut currentColor, `.ac` = satu
  aksen emas (CSS di globals.css). Dipisah dari icons.tsx karena itu set ikon
  garis polos, sedangkan ini hanya dipakai kotak menu.
*/

function NavSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="nav-ic size-9 shrink-0 rounded-[9px] border border-border bg-card p-[5px] text-brand-ink transition-colors duration-200"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function NavHome() {
  return (
    <NavSvg>
      <path className="sf" d="M4.5 10.5 12 4l7.5 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="m3 11 9-8 9 8M5.5 10v8.5A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5V10M10 20v-5a2 2 0 0 1 4 0v5" />
      <circle className="ac" cx="17" cy="7" r=".8" />
    </NavSvg>
  );
}

export function NavSimulasi() {
  return (
    <NavSvg>
      <path className="sf" d="M7 3.5h8l4 4V20H7z" />
      <path d="M7 4h7l4 4v12H6V5a1 1 0 0 1 1-1ZM14 4v4h4M9 11h6M9 14h4" />
      <path className="ac" d="m14.5 16 1.5 1.5 3-3" />
    </NavSvg>
  );
}

export function NavLatihan() {
  return (
    <NavSvg>
      <circle className="sf" cx="11" cy="13" r="4" />
      <circle cx="11" cy="13" r="8" />
      <circle cx="11" cy="13" r="4.5" />
      <path d="m13.8 10.2 5.7-5.7" />
      <path className="ac" d="m18.2 4.8 2-.8-.8 2" />
    </NavSvg>
  );
}

export function NavDrill() {
  return (
    <NavSvg>
      <path className="sf" d="M5 5h6v6H5z" />
      <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
      <path className="ac" d="m14.5 16 1.5 1.5 3-3" />
    </NavSvg>
  );
}

export function NavReview() {
  return (
    <NavSvg>
      <path className="sf" d="M15.5 9h4v10h-4z" />
      <path d="M4 20h16M5.5 20v-6h4v6M10 20V9h4v11M15.5 20V8h4v12M5 11l5-4 4 1 5-4" />
      <path className="ac" d="m17 4 2-.2-.2 2" />
    </NavSvg>
  );
}

export function NavAdmin() {
  return (
    <NavSvg>
      <path className="sf" d="m12 3 8 3v5c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6z" />
      <path d="m12 3 8 3v5c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6zM8 15.8c.4-1.8 1.8-2.8 4-2.8s3.6 1 4 2.8M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <circle className="ac" cx="12" cy="8.9" r=".7" />
    </NavSvg>
  );
}

export function UserGlyph({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8.6" r="3.6" />
      <path d="M5 19.6c1.2-3.4 3.8-5.2 7-5.2s5.8 1.8 7 5.2" />
    </svg>
  );
}
