import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";

const KEYS = ["A", "B", "C", "D", "E"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const LETTERS = [..."ABCDEFGHJKMNPQRSTUVWXYZ"];
const DIGITS = [..."23456789"];
const KEY_ORDER = [2, 0, 4, 1, 3];

type Key = (typeof KEYS)[number];
type SymbolMap = Record<Key, string>;

function makeToken(index: number): string {
  const letter = LETTERS[index % LETTERS.length];
  const digit = DIGITS[(index * 3 + Math.floor(index / LETTERS.length)) % DIGITS.length];
  return index % 2 === 0 ? `${letter}${digit}` : `${digit}${letter}`;
}

function rotate<T>(items: T[], amount: number): T[] {
  return [...items.slice(amount), ...items.slice(0, amount)];
}

function shuffle<T>(items: T[], seed = 20260914): T[] {
  const result = [...items];
  let state = seed;
  for (let index = result.length - 1; index > 0; index--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function makeBank(packageIndex: number, tokenPool: string[]) {
  const nomor = 101 + packageIndex;
  return {
    nomor,
    nama: `Draf Paket Angka-Huruf ${packageIndex + 1}`,
    kategori: "ANGKA_HURUF",
    total_soal: 500,
    kolom: ROMAN.map((roman, columnIndex) => {
      const values = tokenPool.slice(columnIndex * 5, columnIndex * 5 + 5);
      const simbol = Object.fromEntries(KEYS.map((key, index) => [key, values[index]])) as SymbolMap;
      const soal = Array.from({ length: 50 }, (_, questionIndex) => {
        const block = Math.floor(questionIndex / 5);
        const missingIndex = KEY_ORDER[
          (questionIndex + columnIndex + block * 2 + packageIndex) % KEYS.length
        ];
        const kunci = KEYS[missingIndex];
        let shown = KEYS.filter((key) => key !== kunci).map((key) => simbol[key]);
        shown = rotate(shown, (questionIndex * 3 + columnIndex + packageIndex) % shown.length);
        if ((questionIndex + columnIndex + packageIndex) % 2) shown.reverse();
        return { nomor: questionIndex + 1, shown, kunci };
      });
      return { nomor: columnIndex + 1, roman, simbol, soal };
    }),
  };
}

const firstPool = Array.from({ length: 50 }, (_, index) => makeToken(index));
const firstTokens = new Set(firstPool);
const remainingTokens = shuffle(
  LETTERS.flatMap((letter) => DIGITS.flatMap((digit) => [`${letter}${digit}`, `${digit}${letter}`])).filter(
    (token) => !firstTokens.has(token),
  ),
);
const pools = [
  firstPool,
  ...Array.from({ length: 4 }, (_, index) => remainingTokens.slice(index * 50, index * 50 + 50)),
];
assert.equal(new Set(pools.flat()).size, 250, "Token antar-paket harus unik");

for (const [packageIndex, tokenPool] of pools.entries()) {
  const bank = makeBank(packageIndex, tokenPool);
  let verified = 0;
  for (const column of bank.kolom) {
    assert.equal(column.soal.length, 50);
    assert.equal(new Set(Object.values(column.simbol)).size, 5);
    const keyCounts = Object.fromEntries(KEYS.map((key) => [key, 0])) as Record<Key, number>;
    for (const item of column.soal) {
      assert.equal(item.shown.length, 4);
      assert.equal(new Set(item.shown).size, 4);
      const missing = KEYS.filter((key) => !item.shown.includes(column.simbol[key]));
      assert.deepEqual(missing, [item.kunci]);
      keyCounts[item.kunci]++;
      verified++;
    }
    assert.deepEqual(Object.values(keyCounts), [10, 10, 10, 10, 10]);
  }
  assert.equal(verified, bank.total_soal);
  const output = new URL(`../prisma/data/bank_soal_p${bank.nomor}.json`, import.meta.url);
  writeFileSync(output, `${JSON.stringify(bank, null, 2)}\n`);
  console.log(`Generated ${verified} soal valid: ${output.pathname}`);
}
