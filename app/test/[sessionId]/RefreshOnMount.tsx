"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// staleTimes.dynamic (next.config.ts) memakai ulang halaman sesi yang dibuka < 30 detik lalu.
// Setelah sub-tes selesai, router.push ke sini bisa menampilkan status lama (sub-tes berikutnya
// "Terkunci"), jadi ambil ulang data server setiap kali halaman ini terpasang.
export default function RefreshOnMount() {
  const router = useRouter();
  useEffect(() => router.refresh(), [router]);
  return null;
}
