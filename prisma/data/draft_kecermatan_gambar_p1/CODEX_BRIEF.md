# Brief: SVG Kecermatan "Gambar Mirip" — Paket 1

Task: draw exactly 50 SVG files into `prisma/data/draft_kecermatan_gambar_p1/svg/`.
Do NOT touch any other file except creating `preview.html` (see bottom). `paket.json` already exists and references these filenames — do not edit it.

## Test format (context)
Each kolom shows 5 key figures labelled A–E. Each question shows 4 of them (shuffled, drawn smaller); the student picks the missing letter in ~1.2 s. Difficulty comes from the 5 figures in a kolom being **near-twins**: same composition, differing only in small details. Reference images: `../../../KECERMATAN BARU 1.jpg`, `../../../KECERMATAN BARU 2.PNG` (relative to the psiko-cat root: `../KECERMATAN BARU 1.jpg`, `../KECERMATAN BARU 2.PNG`). Match that look.

## Filenames
`k{01..10}_{A..E}.svg` → 10 kolom × 5 = 50 files.

## Global drawing rules
- `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`, no width/height attrs, no `<style>`, no text, no external refs, no filters/gradients.
- Every figure: outer frame `<rect x="4" y="4" width="92" height="92" fill="#fff" stroke="#000" stroke-width="3"/>`.
- Colours only `#000`, `#fff`, and `#9a9a9a` (grey, like the grey circle in reference 1).
- Outline strokes `stroke-width="2.5"` minimum. Smallest element ≥ 9 units across. Must stay distinguishable when rendered at 48×48 px.
- Content stays inside x/y 12–88.
- Hand-write clean coordinates; round to 1 decimal.

## Near-twin rule (the core of this task)
Within one kolom all 5 figures share the same main shape and element set. Each figure must differ from every other figure in that kolom by **at least one** visible attribute from this list:
position of a small element (corner/side), rotation/mirror of main shape, fill (black/white/grey) of one element, count of small elements (e.g. 2 vs 3), main shape side-count (5 vs 6).
Every kolom must contain **exactly one "hard pair"** that differs by only ONE subtle attribute (like A vs C in reference 1: same pentagon, only rotated). All other pairs differ by 2+ attributes. No two figures may be identical, including after rotation.

## Kolom themes
| kolom | main composition | vary with |
|---|---|---|
| 01 | black pentagon/hexagon, grey circle centred inside, small white square near a corner | sides 5/6, rotation, square corner |
| 02 | black right triangle filling lower half, small white circle + small black square | which corner is the right angle, circle/square positions |
| 03 | big black arrow-head (like ref 2), 2–3 small triangles, mix black/white | arrow direction, small triangle count & fill, positions |
| 04 | bowtie (two triangles meeting at a point), one small dot | bowtie orientation (h/v/diagonal), which half black, dot side |
| 05 | 4-blade pinwheel | spin direction (mirror), which blade(s) black vs white |
| 06 | crescent + small cross | crescent opening direction, cross inside/outside, cross fill |
| 07 | 5-point star + 2–3 small circles | star rotation, circle count, one circle filled |
| 08 | L-shape of 4 square cells (tetromino) | mirror/rotation, one cell grey |
| 09 | two nested squares, inner rotated 45° | inner fill, small square in one corner, outer fill |
| 10 | black trapezoid/triangle + 2 small overlapping squares (like ref 1 "D") | square positions, which square on top (black/white), main shape flip |

Spread the hard-pair letters around (not always A/C).

## Self-check before finishing
1. `ls svg | wc -l` = 50, names exactly as above.
2. Each file parses as XML (e.g. `xmllint --noout`).
3. Write `preview.html` in this folder: one row per kolom, 5 figures at 96 px with letter labels, and the same 5 again at 48 px. In a comment at the top of preview.html, list per kolom: which attributes differ per letter, and the hard pair.

Do not run git commands. Report the hard pair per kolom at the end.
