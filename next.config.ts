import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gambar pembahasan drill dibaca dari disk oleh route API (bukan public/), jadi wajib ikut di-trace.
  outputFileTracingIncludes: {
    "/api/drill/gambar/\\[id\\]": ["./data/drill-pembahasan/**/*"],
  },
  // Default Next 15+ staleTimes.dynamic = 0s -> tiap navigasi (termasuk tombol
  // "kembali" browser) refetch server dari nol, kerasa lambat. Balikin ke
  // perilaku lama: halaman dynamic yang baru dikunjungi reusable 30 detik.
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
