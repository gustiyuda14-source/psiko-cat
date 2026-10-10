// Geometri "madu" (isi progres) yang dipakai katalog Drilling (roda), Latihan (tabung),
// dan Simulasi (kubus). Murni hitungan, aman diimpor dari client.

/** Path permukaan madu bergelombang: gelombang di y=0, badan turun sampai `bottom`. */
export function wavePath(period: number, amp: number, x0: number, x1: number, bottom: number) {
  let d = `M${x0} 0`;
  for (let x = x0; x < x1; x += period) d += ` Q${x + period / 4} ${-amp} ${x + period / 2} 0 T${x + period} 0`;
  return `${d} V${bottom} H${x0} Z`;
}

/** Posisi y permukaan madu untuk wadah setinggi `h` yang mulai di `y0`. p=0 disembunyikan di bawah, p=1 menutup gelombang. */
export function fillY(y0: number, h: number, p: number) {
  if (p >= 1) return y0 - 6;
  return y0 + h * (1 - p) + (p <= 0 ? 8 : 0);
}

/** Sudut terdekat ke `from` yang setara dengan `target` (mod 360), supaya putaran selalu lewat jalur terpendek. */
export function nearestAngle(target: number, from: number) {
  const d = (((target - from + 180) % 360) + 360) % 360 - 180;
  return from + d;
}

/** Path cincin sektor (derajat 0 = kanan, searah jarum jam). */
export function annularSector(r0: number, r1: number, a0: number, a1: number) {
  const P = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
  const lg = a1 - a0 > Math.PI ? 1 : 0;
  return `M${P(r0, a0)} L${P(r1, a0)} A${r1} ${r1} 0 ${lg} 1 ${P(r1, a1)} L${P(r0, a1)} A${r0} ${r0} 0 ${lg} 0 ${P(r0, a0)} Z`;
}

/** Titik heksagon pointy-top berpusat (cx, cy) dengan jari-jari r. */
export function hexPoints(cx: number, cy: number, r: number) {
  return [-90, -30, 30, 90, 150, 210]
    .map((a) => `${(cx + r * Math.cos((a * Math.PI) / 180)).toFixed(2)},${(cy + r * Math.sin((a * Math.PI) / 180)).toFixed(2)}`)
    .join(" ");
}
