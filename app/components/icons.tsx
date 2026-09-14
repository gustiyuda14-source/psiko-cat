/*
  Ikon lokal, bukan dependency.

  Aturan proyek (CAT_PPUPD_REDESIGN_PLAN, "Global Constraints") melarang
  menambah dependency baru, termasuk icon library. Sebelumnya konsekuensinya
  adalah glyph teks dipakai sebagai ikon (←, →, ▾, ✓, ✗, ■, □) yang lebarnya
  berubah-ubah antar font dan tidak bisa diberi ketebalan garis konsisten.
  Modul ini menggantinya dengan satu set kecil ikon stroke.

  ponytail: 14 ikon, cukup untuk permukaan yang ada. Kalau nanti butuh lebih
  dari ~25, itu sinyal untuk membuka lagi keputusan "tanpa dependency" dan
  memasang icon library beneran.

  Kontrak: 24x24 viewBox, stroke currentColor, ketebalan seragam 1.75,
  aria-hidden (ikon selalu didampingi teks atau aria-label pada elemen induk).
*/

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

function Svg({
  className = "size-5",
  strokeWidth = 1.75,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ChevronLeft(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 5 8 12l7 7" />
    </Svg>
  );
}

export function ChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function ChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m5 9 7 7 7-7" />
    </Svg>
  );
}

export function ArrowRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function Check(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Svg>
  );
}

export function Close(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function Menu(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function Home(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function Timer(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9.5V13l2.5 1.75" />
      <path d="M9.5 3h5" />
    </Svg>
  );
}

export function Repeat(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 11V9a4 4 0 0 1 4-4h9" />
      <path d="m14 2 3 3-3 3" />
      <path d="M20 13v2a4 4 0 0 1-4 4H7" />
      <path d="m10 22-3-3 3-3" />
    </Svg>
  );
}

export function ClipboardCheck(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 4h6v3H9z" />
      <path d="M15 5.5h2A1.5 1.5 0 0 1 18.5 7v12A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V7A1.5 1.5 0 0 1 7 5.5h2" />
      <path d="m9 13 2 2 4-4" />
    </Svg>
  );
}

export function AlertTriangle(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4" />
      <path d="M12 17.2v.1" strokeWidth={2.4} />
    </Svg>
  );
}

export function CloudOff(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 3.5 20.5 21" />
      <path d="M7.5 18.5H6.6A3.6 3.6 0 0 1 6 11.4a5.4 5.4 0 0 1 8.2-4" />
      <path d="M17.3 10.1a4.4 4.4 0 0 1 1 8.3H12" />
    </Svg>
  );
}

export function LogOut(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 5.5h4A1.5 1.5 0 0 1 19.5 7v10a1.5 1.5 0 0 1-1.5 1.5h-4" />
      <path d="M4.5 12h10" />
      <path d="m10.5 8 4 4-4 4" />
    </Svg>
  );
}

export function Keyboard(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <path d="M6.5 10v.1M10 10v.1M13.5 10v.1M17 10v.1M8 14h8" strokeWidth={2.2} />
    </Svg>
  );
}
