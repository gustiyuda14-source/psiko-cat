/*
  Fallback Suspense buat rute yang nge-fetch data dulu sebelum render (lihat
  file loading.tsx di tiap folder rute Latihan). Statis, tanpa "use client" —
  animasinya murni CSS (.rings-loader di globals.css).
*/
export function RingsLoader() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background" role="status">
      <span className="sr-only">Memuat...</span>
      <div className="rings-loader" aria-hidden="true">
        <span className="rings-loader__ring" />
        <span className="rings-loader__ring" />
        <span className="rings-loader__ring" />
      </div>
    </div>
  );
}
