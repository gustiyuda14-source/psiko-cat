import { NextResponse } from "next/server";

// Versi yang sedang live (commit Vercel). VersionWatcher membandingkannya dengan versi
// yang tertanam di bundle tab peserta; beda = tab memakai kode lama dan perlu dimuat ulang.
export function GET() {
  return NextResponse.json(
    { version: process.env.VERCEL_GIT_COMMIT_SHA ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
