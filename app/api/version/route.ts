import { NextResponse } from "next/server";

// Versi yang sedang live (commit Vercel). VersionWatcher membandingkannya dengan versi
// yang tertanam di bundle tab peserta; beda = tab memakai kode lama dan perlu dimuat ulang.
export function GET() {
  return NextResponse.json(
    { version: process.env.VERCEL_GIT_COMMIT_SHA ?? null },
    // Browser tidak menyimpan; CDN Vercel menyimpan 60 dtk per deploy, jadi cek versi peserta
    // dilayani CDN tanpa memanggil function. Rute ini dikecualikan dari proxy (proxy.ts).
    { headers: { "Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "max-age=60" } }
  );
}
