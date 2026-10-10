import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Lexend } from "next/font/google";
import "./globals.css";
import "./catalog.css";
import "./honey.css";
import "./exam.css";
import "./report.css";

// Nama variabel diberi sufiks -src supaya @theme inline di globals.css bisa
// memetakannya ke --font-sans / --font-display tanpa referensi melingkar
// (next/font menaruh variabelnya di elemen <html>, yang juga :root).
const sourceSans = Source_Sans_3({
  variable: "--font-sans-src",
  subsets: ["latin"],
  display: "swap",
});

// Lexend untuk judul/label/tombol (seperti dajiks-cest). Nama variabel
// --font-display-src dipertahankan supaya .font-heading ikut tanpa diubah.
const lexend = Lexend({
  variable: "--font-display-src",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Psiko CAT — Ajiks Akademi",
  description: "Sistem Psikotes Terintegrasi D'Ajiks Akademi",
  metadataBase: new URL("https://psiko-cat.vercel.app"),
  // Preview link (WA/Telegram/X), pola sama dengan dajiks-cest. Gambar = screenshot /login 1200x630.
  openGraph: {
    type: "website",
    url: "/",
    siteName: "D'Ajiks Akademi × Pejuang Kedinasan",
    title: "Psiko CAT – D'Ajiks Akademi × Pejuang Kedinasan",
    description: "Latihan, simulasi, dan perkembangan hasil psikotes dalam satu ruang.",
    images: [{ url: "/brand/og-preview.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${sourceSans.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
