import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Nama variabel diberi sufiks -src supaya @theme inline di globals.css bisa
// memetakannya ke --font-sans / --font-display tanpa referensi melingkar
// (next/font menaruh variabelnya di elemen <html>, yang juga :root).
const sourceSans = Source_Sans_3({
  variable: "--font-sans-src",
  subsets: ["latin"],
  display: "swap",
});

// Cormorant Garamond adalah variable font — weight sengaja tidak dikunci supaya
// seluruh sumbu wght tersedia (next/font: weight hanya wajib untuk font
// non-variable). Nama variabel dipertahankan (--font-display-src) supaya
// .font-heading di globals.css dan semua class font-heading ikut tanpa diubah.
const cormorant = Cormorant_Garamond({
  variable: "--font-display-src",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Psiko CAT — Ajiks Akademi",
  description: "Sistem Psikotes Terintegrasi D'Ajiks Akademi",
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${sourceSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
