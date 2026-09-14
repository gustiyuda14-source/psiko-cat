import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
