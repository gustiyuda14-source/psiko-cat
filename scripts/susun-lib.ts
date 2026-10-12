// Potongan susun gambar bersama (dipindah dari generate-kecerdasan-susun-s2.ts tanpa perubahan keluaran):
// pemandangan siluet 600×190 dipotong tegak bergelombang, potongan diacak menurut `order`.
export const enDash = (parts: number[]) => parts.join(" – ");
/** Urutan label potongan (posisi tampil) dari kiri ke kanan gambar utuh. */
export const answerFor = (order: number[]) => Array.from({ length: order.length }, (_, sourceIndex) => order.indexOf(sourceIndex + 1) + 1);

// The small separation makes each organic cut readable without detached fragments.
export function stripClip(prefix: string, index: number, left: number, right: number, height: number, last: boolean, gap = 1.5) {
  const l = left + (index === 0 ? 0 : gap);
  const r = right - (last ? 0 : gap);
  return `<clipPath id="${prefix}clip${index + 1}"><path d="M ${l} 0 H ${r}
    C ${r + 6} 24 ${r - 8} 47 ${r + 2} 68 C ${r + 9} 92 ${r - 6} 112 ${r + 4} 137 C ${r + 7} 156 ${r - 4} 175 ${r} ${height}
    H ${l} C ${l - 4} 175 ${l + 7} 156 ${l + 4} 137 C ${l - 6} 112 ${l + 9} 92 ${l + 2} 68 C ${l - 8} 47 ${l + 6} 24 ${l} 0 Z"/></clipPath>`;
}

export function verticalPositions(count: number) {
  const start = count === 4 ? 30 : count === 5 ? 25 : 15;
  const step = count === 4 ? 200 : count === 5 ? 165 : 138;
  return Array.from({ length: count }, (_, index) => ({ x: start + index * step, y: 22 }));
}

export function verticalPuzzleSvg(prefix: string, puzzle: { pieces: number; order: number[]; scene: string }) {
  const sourceWidth = 600;
  const cuts = Array.from({ length: puzzle.pieces + 1 }, (_, index) => index * sourceWidth / puzzle.pieces);
  const clips = Array.from({ length: puzzle.pieces }, (_, index) => stripClip(prefix, index, cuts[index], cuts[index + 1], 190, index === puzzle.pieces - 1));
  const pieces = puzzle.order.map((sourcePiece, slot) => {
    const sourceIndex = sourcePiece - 1;
    const { x, y } = verticalPositions(puzzle.pieces)[slot];
    const origin = cuts[sourceIndex];
    const pieceWidth = cuts[sourceIndex + 1] - origin;
    return `<g transform="translate(${x - origin} ${y})" clip-path="url(#${prefix}clip${sourcePiece})"><use href="#${prefix}scene"/></g>` +
      `<text x="${x + pieceWidth / 2}" y="245" fill="#111" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${slot + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 850 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><defs>${clips.join("")}<g id="${prefix}scene" fill="#111">${puzzle.scene}</g></defs>${pieces}</svg>`;
}
