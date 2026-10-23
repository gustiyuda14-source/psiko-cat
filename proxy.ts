import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { punyaProfil, sessionBlocked } from "@/lib/account-guard";

const COOKIE_NAME = "psiko_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET wajib diatur");
  return new TextEncoder().encode(secret);
}

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
const PROFIL_PATH = "/dashboard/profil";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/brand")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    // Akun dinonaktifkan / dihapus / password direset admin → sesi berakhir (seperti dajiks-cest).
    if (await sessionBlocked(String(payload.sub ?? ""), typeof payload.pv === "string" ? payload.pv : undefined)) {
      const res = pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Sesi berakhir. Masuk lagi." }, { status: 401 })
        : NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Peserta tanpa profil tujuan wajib memilih dulu (saat login maupun navigasi berikutnya).
    // Cookie psg_profil diset saat memilih, jadi tidak terpental lagi selama cache akun (60 dtk) belum segar.
    // Ujian (/test) tidak disela; memulai simulasi sudah dikunci di halaman Simulasi.
    if (
      payload.role !== "admin" &&
      (pathname.startsWith("/dashboard") || pathname.startsWith("/latihan")) &&
      pathname !== PROFIL_PATH &&
      !req.cookies.get("psg_profil")?.value &&
      !(await punyaProfil(String(payload.sub ?? "")))
    ) {
      return NextResponse.redirect(new URL(PROFIL_PATH, req.url));
    }

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  // Aset gambar public/ (simbol kecermatan, emoji, drill) tidak lewat proxy: tiap gambar = 1 invocation.
  // Gambar pembahasan tetap terlindungi lewat /api/drill/gambar (cek sesi sendiri, di luar public/).
  // /api/version hanya berisi sha commit (tanpa data peserta) supaya bisa dilayani cache CDN.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/login|api/version$|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)"],
};
