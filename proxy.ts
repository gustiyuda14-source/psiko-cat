import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { sessionBlocked } from "@/lib/account-guard";

const COOKIE_NAME = "psiko_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET wajib diatur");
  return new TextEncoder().encode(secret);
}

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

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

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)"],
};
