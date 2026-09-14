import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

type Color = [number, number, number, number];

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const ornate = css.match(/\.ornate\s*\{([\s\S]*?)\n\}/)?.[1];
assert.ok(ornate, "Blok token .ornate tidak ditemukan");

const tokens = new Map(
  [...ornate.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
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
const accentSoft = over(token("--accent-soft"), card);
const successSoft = over(token("--success-soft"), card);
const destructiveSoft = over(token("--destructive-soft"), card);

check("foreground/card", token("--foreground"), card, 16.4);
check("foreground/page", token("--foreground"), page, 17.4);
check("muted/card", token("--muted-foreground"), card, 6.8);
check("muted/page", token("--muted-foreground"), page, 7.2);
check("faint/card", token("--faint-foreground"), card, 4.4);
for (const [name, bg, minimum] of [["card", card, 7.5], ["page", page, 8], ["inset", inset, 7]] as const) {
  check(`accent/${name}`, token("--accent"), bg, minimum);
}
check("accent-ink/card", token("--accent-ink"), card, 11);
check("accent-ink/accent-soft", token("--accent-ink"), accentSoft, 8.8);
check("CTA solid", token("--primary-foreground"), token("--accent"), 8);
check("CTA metal light", token("--primary-foreground"), color("#e8b45c"), 10.4);
check("CTA metal dark", token("--primary-foreground"), color("#c4842c"), 6.3);
check("success/card", token("--success"), card, 10);
check("success/soft", token("--success"), successSoft, 7.75);
check("destructive/card", token("--destructive"), card, 8.7);
check("destructive/soft", token("--destructive"), destructiveSoft, 6.8);
check("sidebar active", token("--accent-ink"), over([217, 152, 63, 0.12], token("--surface-nav")), 10.2);
check("border-strong/card", token("--border-strong"), card, 3.4);

console.log("Kontras black-gold .ornate lulus.");
