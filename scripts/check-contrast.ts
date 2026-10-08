import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type Color = [number, number, number, number];

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const root = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1];
assert.ok(root, "Blok token :root tidak ditemukan");

const tokens = new Map(
  [...root.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);

function color(input: string): Color {
  const hex = input.match(/^#([\da-f]{6})$/i)?.[1];
  if (hex) return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).concat(1) as Color;
  const rgb = input.match(/^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/);
  assert.ok(rgb, `Format warna tidak didukung: ${input}`);
  return [+rgb[1], +rgb[2], +rgb[3], rgb[4] == null ? 1 : +rgb[4]];
}

function token(name: string): Color {
  const value = tokens.get(name);
  assert.ok(value, `Token ${name} tidak ditemukan`);
  return color(value);
}

function over(fg: Color, bg: Color): Color {
  const alpha = fg[3] + bg[3] * (1 - fg[3]);
  return [0, 1, 2].map((i) => (fg[i] * fg[3] + bg[i] * bg[3] * (1 - fg[3])) / alpha).concat(alpha) as Color;
}

function luminance([r, g, b]: Color): number {
  const linear = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(fg: Color, bg: Color): number {
  const [lighter, darker] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function check(label: string, fg: Color, bg: Color, minimum: number) {
  const actual = ratio(fg, bg);
  assert.ok(+actual.toFixed(2) >= minimum, `${label}: ${actual.toFixed(2)}:1 < ${minimum}:1`);
  console.log(`${label}: ${actual.toFixed(2)}:1`);
}

const page = token("--surface-page");
const card = token("--surface-card");
const inset = token("--surface-inset");
const nav = token("--surface-nav");
const white = color("#ffffff");
const accentSoft = over(token("--accent-soft"), card);
const successSoft = over(token("--success-soft"), card);
const destructiveSoft = over(token("--destructive-soft"), card);

// Teks di permukaan terang (palet dajiks-cest): AA 4.5:1 untuk teks, 3:1 untuk batas kontrol.
check("foreground/card", token("--foreground"), card, 7);
check("foreground/inset", token("--foreground"), inset, 7);
check("muted/card", token("--muted-foreground"), card, 4.5);
check("muted/inset", token("--muted-foreground"), inset, 4.5);
check("faint/card (placeholder)", token("--faint-foreground"), card, 3.9);
check("brand-ink/card", token("--brand-ink"), card, 7);
check("brand-ink/inset", token("--brand-ink"), inset, 7);
check("gold (teks emas)/card", token("--gold"), card, 4.5);
check("accent-ink/accent-soft", token("--accent-ink"), accentSoft, 4.5);
check("success/card", token("--success"), card, 4.5);
check("success/soft", token("--success"), successSoft, 4.5);
check("destructive/card", token("--destructive"), card, 4.5);
check("destructive/soft", token("--destructive"), destructiveSoft, 4.5);
check("border-strong/card (batas kontrol)", token("--border-strong"), card, 3);
check("ring/card (fokus)", token("--ring"), card, 3);

// Permukaan navy: bar ujian, sidebar aktif, panel hasil.
check("putih/bar navy", white, nav, 12);
check("putih/brand-ink", white, token("--brand-ink"), 12);
check("gold-hi/bar navy", token("--gold-hi"), nav, 7);
check("ring-on-nav/bar navy", token("--ring-on-nav"), nav, 3);
check("timer low (putih/#a95b0d)", white, color("#a95b0d"), 4.5);
check("timer critical (putih/#a31e3b)", white, color("#a31e3b"), 4.5);

// Tombol emas: teks navy #16224a di atas tiga stop gradasi.
for (const stop of ["#b8892b", "#f3dd8e", "#c9a24a"]) check(`CTA navy/${stop}`, color("#16224a"), color(stop), 4.5);

console.log("Kontras palet terang cest lulus.");
