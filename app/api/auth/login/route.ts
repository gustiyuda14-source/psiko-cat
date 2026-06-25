import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, username, password_hash, role")
      .eq("username", username.toLowerCase().trim())
      .single();

    if (error || !user || !user.password_hash) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const token = await createSessionToken({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role as "peserta" | "admin",
    });

    const res = NextResponse.json({ role: user.role, name: user.name });
    res.cookies.set("psiko_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
