# AJIKS Rebrand V2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin every navigation/selection surface of psiko-cat to the D'Ajiks Akademi ornate gold-on-dark identity, while leaving every question-answering surface on its current light theme, untouched.

**Architecture:** Dark tokens live in a single new `.ornate { … }` block in `app/globals.css` and are switched on by putting `className="ornate"` on exactly three route roots. `:root` is never modified, so `app/test/*` and `app/latihan/*` keep resolving to the existing light values with zero file changes. Logo assets are one-off static PNGs cut from the supplied mockup, committed under `public/brand/`.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (`@theme inline`), `next/font/google`, `next/image`. No new dependencies.

**Spec:** `AJIKS_REBRAND_PLAN_V2.md` (committed in `04500f6`) — read it before starting; this plan argues from it.

## Global Constraints

- **No new dependencies.** No `sharp`, `jimp`, `clsx`, icon libraries, or chart libraries. Inherited from `CAT_PPUPD_REDESIGN_PLAN.md`.
- **No schema changes, no migrations.** Supabase project `ckqxehyyqkmvidmlronz` is shared by three schemas; this work is presentation-only.
- **`:root` in `app/globals.css` must not be modified.** Any token not written inside `.ornate` inherits its light value — that is the mechanism the whole plan depends on. See spec, section "Token".
- **Never touch these files.** They are the question-answering surfaces and must stay light: `app/components/ExamChrome.tsx`, `app/components/engines/Engine{Kecerdasan,Kecermatan,Kepribadian}.tsx`, `app/latihan/[module]/Latihan{Gate,Kecerdasan,Kecermatan,Kepribadian}.tsx`, `app/test/[sessionId]/**`.
- **Shape lock** (existing discipline, documented in `app/globals.css`): controls `rounded-md` 10px, cards `rounded-lg` 14px, panels/hero `rounded-xl` 18px, pills `rounded-full`.
- **Gold discipline:** gold is for (a) backgrounds carrying navy text, (b) active-state indicators, (c) `--accent-ink` when gold must be text on a gold wash. Never gold text directly on a light surface.
- **Verification commands** available in this repo (there is no unit-test framework; do not invent one):
  ```bash
  npx tsc --noEmit
  npm run lint
  npm run build
  node /Users/gustiputuyudawirashana/.claude/skills/impeccable/scripts/detect.mjs --json <paths>
  ```
  Visual/computed-style verification uses the `chrome-devtools` MCP tools against `http://localhost:3000` with a logged-in session (`aurel` / `G6SHQF`).

---

### Task 1: Brand assets (logo cutouts + favicon)

The supplied file is a presentation mockup on an opaque smoky-black background, not a clean brand asset. It has to be cut out once. The separation is trivially clean: background luminance maxes at 43 while the gold starts at ~176, with almost nothing in between.

**This generator is deliberately NOT committed as repo tooling.** It runs once; the PNGs are the deliverable. Adding a Python script to a Node repo's `scripts/` that nobody will ever run again is clutter, and `sharp`/`jimp` would violate the no-new-dependency constraint.

**Files:**
- Create: `psiko-cat/public/brand/dajiks-lockup.png` (1024×768, transparent, crest + wordmark)
- Create: `psiko-cat/public/brand/dajiks-emblem.png` (512×512, transparent, crest only)
- Replace: `psiko-cat/app/favicon.ico`
- Source (read-only, outside the repo): `../LOGO D AJIK AKADEMI.png`

**Interfaces:**
- Produces: three static asset paths. Task 4 consumes `/brand/dajiks-emblem.png` and `/brand/dajiks-lockup.png` with intrinsic dimensions `512×512` and `1024×768` respectively. Those canvas sizes are fixed by the padding step below precisely so Task 4 can hardcode them.

- [ ] **Step 1: Generate the three assets**

Run from the `psiko-cat` directory. Padding to a fixed canvas is what makes the output dimensions deterministic:

```bash
mkdir -p public/brand && python3 - <<'PY'
from PIL import Image
import numpy as np

SRC = "../LOGO D AJIK AKADEMI.png"
im = Image.open(SRC).convert("RGB")
arr = np.asarray(im).astype(np.float32)
lum = 0.299*arr[...,0] + 0.587*arr[...,1] + 0.114*arr[...,2]

# Background tops out at lum 43, gold starts ~176. Ramp between 46 and 95
# gives an antialiased edge without dragging smoke into the alpha.
LO, HI = 46.0, 95.0
alpha = np.clip((lum - LO) / (HI - LO), 0, 1)
rgba = np.dstack([arr.astype(np.uint8), (alpha*255).astype(np.uint8)])
cut = Image.fromarray(rgba, "RGBA")

def tight_crop(img, pad=8):
    a = np.asarray(img)[..., 3]
    ys, xs = np.where(a > 2)
    return img.crop((max(xs.min()-pad, 0), max(ys.min()-pad, 0),
                     min(xs.max()+pad, img.width), min(ys.max()+pad, img.height)))

def fit_canvas(img, w, h):
    """Scale to fit, then center on a fixed transparent canvas so downstream
    intrinsic width/height are guaranteed."""
    img = img.copy()
    img.thumbnail((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.paste(img, ((w - img.width)//2, (h - img.height)//2), img)
    return canvas

full = tight_crop(cut)
fit_canvas(full, 1024, 768).save("public/brand/dajiks-lockup.png")

# Split crest from wordmark at the emptiest row in the middle third — the gap
# between them — instead of a hand-picked pixel coordinate.
a = np.asarray(full)[..., 3].astype(np.float32)
rows = a.sum(axis=1)
band_lo, band_hi = int(len(rows)*0.35), int(len(rows)*0.65)
split = int(np.argmin(rows[band_lo:band_hi])) + band_lo
emblem = tight_crop(full.crop((0, 0, full.width, split + 6)))
fit_canvas(emblem, 512, 512).save("public/brand/dajiks-emblem.png")

ico = tight_crop(emblem)
ico.save("app/favicon.ico", sizes=[(16,16), (32,32), (48,48), (64,64)])
print("lockup", Image.open("public/brand/dajiks-lockup.png").size)
print("emblem", Image.open("public/brand/dajiks-emblem.png").size)
PY
```

Expected output:
```
lockup (1024, 768)
emblem (512, 512)
```

- [ ] **Step 2: Verify the cutout is actually clean, not just present**

A luminance threshold can leave a grey halo that is invisible on white and obvious on dark. Assert transparency and coverage:

```bash
python3 - <<'PY'
from PIL import Image
import numpy as np
for p, size in [("public/brand/dajiks-lockup.png", (1024,768)),
                ("public/brand/dajiks-emblem.png", (512,512))]:
    im = Image.open(p)
    a = np.asarray(im)[..., 3]
    assert im.mode == "RGBA", f"{p} is {im.mode}, expected RGBA"
    assert im.size == size, f"{p} is {im.size}, expected {size}"
    corners = [a[0,0], a[0,-1], a[-1,0], a[-1,-1]]
    assert max(corners) == 0, f"{p} corners not transparent: {corners}"
    cover = (a > 8).mean()
    assert 0.03 < cover < 0.60, f"{p} alpha coverage {cover:.3f} looks wrong"
    print(f"OK {p} {im.size} coverage={cover:.3f}")
PY
```
Expected: two `OK` lines, no `AssertionError`.

- [ ] **Step 3: Eyeball it on a dark ground**

Composite the lockup over the target navy and open the result. A halo that survived Step 2 shows up here:

```bash
python3 - <<'PY'
from PIL import Image
fg = Image.open("public/brand/dajiks-lockup.png").convert("RGBA")
bg = Image.new("RGBA", fg.size, (11, 36, 66, 255))   # --surface-page #0b2442
bg.alpha_composite(fg)
bg.convert("RGB").save("/tmp/brand-on-navy.png")
print("wrote /tmp/brand-on-navy.png")
PY
```
Open `/tmp/brand-on-navy.png`. Expected: gold marks on flat navy, no grey ring or smoky rectangle around the glyphs. If a halo is visible, raise `LO` in Step 1 (46 → 52) and rerun.

- [ ] **Step 4: Commit**

```bash
git add public/brand/dajiks-lockup.png public/brand/dajiks-emblem.png app/favicon.ico
git commit -m "feat(brand): add D'Ajiks Akademi logo cutouts and favicon"
```

---

### Task 2: `.ornate` scoped dark tokens

The core of the rebrand. `:root` is left alone; a new block overrides tokens for anything inside an `.ornate` ancestor. Tailwind v4's `@theme inline` already declares `--color-card: var(--surface-card)` and friends as live `var()` references rather than baked values, so overriding the underlying custom property on an ancestor flows to every descendant using `bg-card` etc. with no className changes anywhere.

**Every token that needs a different value on dark must be written explicitly.** Omitting one does not remove it — it inherits the light value. That is how `--accent-ink` would have landed at 1.80:1 contrast.

**Files:**
- Modify: `app/globals.css` (add one block after the `@theme inline` block)
- Modify: `app/dashboard/layout.tsx:15` (add `ornate` to the root div's className)
- Modify: `app/login/page.tsx:45` (add `ornate`, and drop the dead `bg-primary`)
- Modify: `app/admin/page.tsx:61` (add `ornate`)

**Interfaces:**
- Produces: the `.ornate` class contract. Tasks 5 and 6 assume `--surface-page` = `#0b2442` and `--surface-card` = `#14304f` inside it.

- [ ] **Step 1: Add the `.ornate` token block**

In `app/globals.css`, directly after the closing `}` of the `@theme inline { … }` block, insert:

```css
/* ─────────────────────────────────────────────────────────────────────────────
   Identitas ornate D'Ajiks Akademi — SCOPED, bukan global
   ─────────────────────────────────────────────────────────────────────────────
   :root di atas SENGAJA tidak disentuh. Permukaan tempat peserta mengerjakan
   soal (app/test/*, app/latihan/*) tidak pernah berada di dalam elemen
   ber-class .ornate, jadi mereka tetap resolve ke token light di atas tanpa
   satu pun filenya diubah.

   KONSEKUENSI: token yang TIDAK ditulis di sini akan mewarisi nilai LIGHT-nya,
   bukan hilang. Itu sebabnya token "soft" dan --accent-ink wajib ada di bawah:
   Badge tone="accent" memakai pasangan bg-accent-soft + text-accent-ink, dan
   --accent-ink light (#8a5a12) di atas wash gold-di-atas-navy cuma 1.80:1.

   Kontras dihitung, bukan ditebak (WCAG relative luminance, sRGB; angka
   "soft" adalah komposit alpha-blend wash 15% di atas --surface-card):
     --foreground        #f4ede0  11.52:1 di card, 13.41:1 di page
     --muted-foreground  #a8bedb   7.06:1 di card
     --accent            #d9983f   5.44:1 di card (sebagai teks/ikon)
     --accent-ink        #f0c078   6.33:1 di atas --accent-soft
     --success           #3ed6a0   7.24:1 di card, 5.28:1 di atas --success-soft
     --destructive       #fd948d   6.26:1 di card, 4.86:1 di atas --destructive-soft
   ───────────────────────────────────────────────────────────────────────────── */
.ornate {
  color-scheme: dark;

  /* Surface ladder — navy yang tadinya cuma dipakai sidebar/hero sekarang
     jadi permukaan halaman. Card lebih TERANG dari page (konvensi elevation
     dark-mode), kebalikan dari light theme. */
  --surface-page: #0b2442;
  --surface-card: #14304f;
  --surface-inset: #0f2846;

  /* --surface-nav (#0b2442) dan --surface-nav-deep (#081b34) sengaja TIDAK
     ditulis di sini. Ini satu-satunya kasus di mana mewarisi nilai light
     justru yang benar: keduanya sudah navy di :root karena memang dibuat
     untuk sidebar dan hero. */

  --foreground: #f4ede0;         /* cream hangat, bukan putih pekat */
  --muted-foreground: #a8bedb;
  --faint-foreground: #7d90b3;

  --border: #24354f;
  --border-strong: rgb(217 152 63 / 0.4);   /* gold-tinted, bukan abu netral */

  /* --primary SENGAJA tidak di-override. .hero-panel memakainya sebagai stop
     tengah gradien navy-nya; kalau ini jadi gold, ada garis emas menyilang di
     tengah setiap hero banner dan teks putih di atasnya gagal kontras.
     Gold tetap hidup di --accent, dua token yang memang sudah terpisah. */

  --accent-soft: rgb(217 152 63 / 0.15);
  --accent-ink: #f0c078;         /* dibalik arahnya dari light: diterangkan,
                                    bukan digelapkan. Nilainya sama dengan
                                    --ring-on-nav yang sudah ada. */

  --success: #3ed6a0;
  --success-soft: rgb(62 214 160 / 0.15);
  --destructive: #fd948d;
  --destructive-soft: rgb(253 148 141 / 0.15);
  --ring: #d9983f;

  /* --ring-on-nav tidak di-override: nilai light-nya (#f0c078) memang sudah
     dirancang untuk permukaan navy. */

  /* Shadow ditarik dari hitam, bukan navy. Di permukaan gelap, shadow
     bertarik-navy praktis tak terlihat. Offset + blur dipertahankan. */
  --elev-1: 0 1px 2px rgb(0 0 0 / 0.30), 0 1px 3px -1px rgb(0 0 0 / 0.36);
  --elev-2: 0 2px 4px rgb(0 0 0 / 0.28), 0 6px 14px -6px rgb(0 0 0 / 0.45);
  --elev-3: 0 4px 8px rgb(0 0 0 / 0.30), 0 14px 30px -10px rgb(0 0 0 / 0.50);
  --elev-4: 0 10px 20px rgb(0 0 0 / 0.32), 0 30px 60px -20px rgb(0 0 0 / 0.60);
}
```

- [ ] **Step 2: Switch it on at the three route roots**

`app/dashboard/layout.tsx` line 15 — add `ornate` as the first class:

```tsx
    <div className="ornate flex min-h-[100dvh] flex-col bg-background lg:h-[100dvh] lg:flex-row">
```

`app/login/page.tsx` line 45 — add `ornate`; also drop `bg-primary`, which is dead (`bg-surface-nav-deep` follows it and wins):

```tsx
    <div className="ornate flex min-h-[100dvh] items-center justify-center bg-surface-nav-deep px-4 py-10 sm:px-8">
```

`app/admin/page.tsx` line 61 — add `ornate`:

```tsx
    <div className="ornate min-h-[100dvh] bg-background text-foreground">
```

All three already carry both `min-h-[100dvh]` and an explicit background on the same element that gets the class, so `<body>` (still light, outside the scope) never shows through.

- [ ] **Step 3: Typecheck and build**

```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: no errors. CSS custom-property changes cannot fail typecheck, but the three JSX edits can.

- [ ] **Step 4: Prove the scoping actually holds — both directions**

This is the single most important check in the plan. It fails loudly if the dark theme leaks into the exam surfaces, which is the one outcome the user explicitly forbade. With the dev server running and a logged-in session, use `chrome-devtools`:

Navigate to `http://localhost:3000/dashboard/latihan/kecermatan`, then `evaluate_script`:

```js
() => {
  const el = document.querySelector('.ornate');
  const cs = el && getComputedStyle(el);
  return {
    foundOrnate: !!el,
    surfacePage: cs && cs.getPropertyValue('--surface-page').trim(),
    surfaceCard: cs && cs.getPropertyValue('--surface-card').trim(),
    accentInk: cs && cs.getPropertyValue('--accent-ink').trim(),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
}
```
Expected: `foundOrnate: true`, `surfacePage: "#0b2442"`, `surfaceCard: "#14304f"`, `accentInk: "#f0c078"`.

Then navigate to `http://localhost:3000/latihan/kecerdasan` (an exam-adjacent surface that must stay light) and run:

```js
() => {
  const probe = document.querySelector('.app-page') || document.body;
  const cs = getComputedStyle(probe);
  return {
    ornateAncestors: document.querySelectorAll('.ornate').length,
    surfacePage: cs.getPropertyValue('--surface-page').trim(),
    surfaceCard: cs.getPropertyValue('--surface-card').trim(),
    accentInk: cs.getPropertyValue('--accent-ink').trim(),
  };
}
```
Expected: `ornateAncestors: 0`, `surfacePage: "#f2f5f9"`, `surfaceCard: "#ffffff"`, `accentInk: "#8a5a12"` — i.e. the untouched light values. If `surfacePage` comes back `#0b2442` here, the scoping is broken; stop and fix before continuing.

- [ ] **Step 5: Screenshot the ornate surfaces once, batched**

Screenshot `/dashboard`, `/dashboard/latihan/kecermatan`, `/dashboard/simulasi`, `/dashboard/review`, `/login`, `/admin` at desktop width, then `/dashboard` at 390px. Look for: unreadable text, a near-white block where a `*-soft` background sits, invisible borders, shadows that vanished. Fix everything one round shows, then confirm with at most one more round.

- [ ] **Step 6: Run the design detector**

```bash
node /Users/gustiputuyudawirashana/.claude/skills/impeccable/scripts/detect.mjs --json app/globals.css app/dashboard app/login/page.tsx app/admin/page.tsx
```
Expected: `[]`.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/dashboard/layout.tsx app/login/page.tsx app/admin/page.tsx
git commit -m "feat(brand): scope ornate gold-on-dark tokens to navigation surfaces"
```

---

### Task 3: Cormorant Garamond for display type

One-line font swap, kept as its own task because a reviewer can reasonably accept the palette and reject the serif — serif is a taste call, and this repo's design notes are explicit that display fonts are restricted to page titles and score numerals.

**Files:**
- Modify: `app/layout.tsx:16-21` (the `Lexend` import and loader call)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing for other tasks. `--font-display-src` keeps its name, so `.font-heading` in `app/globals.css` and every `font-heading` class in the app pick the new face up with no further edits.

- [ ] **Step 1: Swap the loader**

In `app/layout.tsx`, change the import on line 2:

```tsx
import { Source_Sans_3, Cormorant_Garamond } from "next/font/google";
```

and replace the `lexend` block (lines 16-21) with:

```tsx
// Cormorant Garamond adalah variable font — weight sengaja tidak dikunci supaya
// seluruh sumbu wght tersedia (next/font: weight hanya wajib untuk font
// non-variable). Nama variabel dipertahankan (--font-display-src) supaya
// .font-heading di globals.css dan semua class font-heading ikut tanpa diubah.
const cormorant = Cormorant_Garamond({
  variable: "--font-display-src",
  subsets: ["latin"],
  display: "swap",
});
```

Then update the `<html>` className on line 34 to use it:

```tsx
      className={`${sourceSans.variable} ${cormorant.variable} h-full antialiased`}
```

- [ ] **Step 2: Build**

```bash
npx tsc --noEmit && npm run build
```
Expected: no errors. `npm run build` fetches Google Fonts, so this step needs network — a failure here mentioning fonts is a network problem, not a code problem.

- [ ] **Step 3: Verify the face actually swapped in the browser**

Navigate to `http://localhost:3000/dashboard` and `evaluate_script`:

```js
() => {
  const h = document.querySelector('.font-heading');
  return h ? { text: h.textContent.trim().slice(0, 30),
               family: getComputedStyle(h).fontFamily } : { found: false };
}
```
Expected: `family` contains a Cormorant entry, not `Lexend`.

- [ ] **Step 4: Check the serif at its smallest real use**

Cormorant has a noticeably lighter stem than Lexend at the same weight, so small headings can go thin and washy on a dark ground. Screenshot `/dashboard/latihan/kecermatan` and inspect the sidebar's `Psiko CAT` line (`font-heading text-sm`) and the carousel's `01` numeral (`font-heading text-4xl`). If the small one reads too thin, bump `.font-heading`'s `font-weight` in `app/globals.css` from `600` to `700` — that rule is the single place it is set.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat(brand): use Cormorant Garamond for display type"
```

---

### Task 4: Logo into the sidebar and login page

Both surfaces currently draw a `PC` initials badge — the same pattern at two sizes. Both get the real emblem.

**Files:**
- Modify: `app/dashboard/Sidebar.tsx:111-118` (the `PC` span)
- Modify: `app/login/page.tsx:48-53` (the `PC` span)

**Interfaces:**
- Consumes: `/brand/dajiks-emblem.png` (512×512) and `/brand/dajiks-lockup.png` (1024×768) from Task 1. The intrinsic dimensions below must match the files Task 1 produced.

- [ ] **Step 1: Replace the sidebar badge**

In `app/dashboard/Sidebar.tsx`, add to the imports at the top:

```tsx
import Image from "next/image";
```

Replace lines 111-118 (the `<span … >PC</span>` element) with:

```tsx
          <Image
            src="/brand/dajiks-emblem.png"
            alt=""
            width={512}
            height={512}
            className="size-9 shrink-0 object-contain"
            priority
          />
```

`alt=""` is correct here: the adjacent text already says "Psiko CAT / Ajiks Akademi", so announcing the mark again would be duplicate noise for a screen reader. The old span carried `aria-hidden="true"` for the same reason. Intrinsic `width`/`height` describe the file; `size-9` controls display size.

Expect the glyph to render slightly smaller than the old `PC` badge: Task 1's `fit_canvas` never upscales, so the crest sits at its native ~437px inside the 512px canvas with transparent padding, and `object-contain` honours that padding. If it reads too small next to the wordmark, bump `size-9` to `size-10` — do not crop the asset tighter, because the same file feeds the favicon.

- [ ] **Step 2: Replace the login badge with the full lockup**

In `app/login/page.tsx`, add to the imports:

```tsx
import Image from "next/image";
```

Replace lines 48-53 (the `<span … >PC</span>` element) with:

```tsx
          <Image
            src="/brand/dajiks-lockup.png"
            alt="D'Ajiks Akademi"
            width={1024}
            height={768}
            className="h-auto w-52 max-w-full object-contain"
            priority
          />
```

Here `alt` carries the brand name, because on the login screen the lockup is the only place the academy is named in image form and it sits above the headline rather than beside a repeat of the same words.

- [ ] **Step 3: Check the headline below it still makes sense**

`app/login/page.tsx` renders `<h1>Psiko CAT</h1>` immediately after the badge. With a lockup that already reads "D'AJIKS AKADEMI", verify the stack does not now say the brand twice in two typographic voices. If it reads redundant, keep the `h1` (it names the product, not the academy) and leave the subtitle alone — do not delete copy without asking.

- [ ] **Step 4: Build and verify**

```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: no errors. `next/image` with a string `src` needs explicit `width`/`height`; omitting them fails the build, which is the check.

Then navigate to `http://localhost:3000/login` and `http://localhost:3000/dashboard`, screenshot both, and `evaluate_script` on each:

```js
() => [...document.images].map(i => ({
  src: new URL(i.currentSrc || i.src).pathname,
  natural: [i.naturalWidth, i.naturalHeight],
  rendered: [Math.round(i.getBoundingClientRect().width),
             Math.round(i.getBoundingClientRect().height)],
  broken: i.complete && i.naturalWidth === 0,
}))
```
Expected: one entry per page, `broken: false`, non-zero `natural`, and a `rendered` box whose aspect ratio matches `natural` (no squashing).

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/Sidebar.tsx app/login/page.tsx
git commit -m "feat(brand): replace PC initials badge with D'Ajiks emblem"
```

---

### Task 5: Re-tune the Kecermatan carousel for navy-on-navy

The carousel cards were designed as dark navy islands floating on a light page — their separation came entirely from the page being light. After Task 2 the page is navy too, so the cards need to be lifted relative to the new background. Only colour values change; the coverflow geometry, the scanline beam and the corner reticle stay exactly as they are.

**Files:**
- Modify: `app/globals.css` — `.package-carousel__card` background gradient, and `.package-carousel` local tokens

**Interfaces:**
- Consumes: `.ornate`'s `--surface-page` (`#0b2442`) and `--surface-card` (`#14304f`) from Task 2.

- [ ] **Step 1: Confirm the problem is real before changing anything**

With Task 2 live, navigate to `http://localhost:3000/dashboard/latihan/kecermatan` and screenshot. Expected: the active card's lower gradient stop (`#0b2442`) is now identical to the page background, so the card's bottom edge dissolves into the page. If it already reads as clearly lifted, stop — skip to Step 4 and record that no change was needed. Do not "fix" something the screenshot says is fine.

- [ ] **Step 2: Lift the card gradient above the new page colour**

In `app/globals.css`, in `.package-carousel__card`, replace the gradient line:

```css
    linear-gradient(155deg, #0b2442 0%, #102d52 52%, #17395f 100%) padding-box,
```

with:

```css
    /* Digeser naik satu tingkat: stop terendah (#16335a) sekarang lebih terang
       dari --surface-page (#0b2442), mengikuti pola elevation yang sama dengan
       --surface-card. Sebelum rebrand, kontras kartu-vs-page datang dari page
       yang terang; sekarang harus datang dari kartu yang lebih terang. */
    linear-gradient(155deg, #16335a 0%, #1d3f6b 52%, #24507f 100%) padding-box,
```

- [ ] **Step 3: Verify the lift, and that text on the card still passes AA**

Navigate to the carousel page and `evaluate_script`:

```js
() => {
  const card = document.querySelector('.package-carousel__card.is-active');
  const page = document.querySelector('.ornate');
  const dim = card.querySelector('[class*="pc-ink-dim"]');
  return {
    cardBg: getComputedStyle(card).backgroundImage.slice(0, 120),
    pageBg: getComputedStyle(page).backgroundColor,
    dimColor: dim && getComputedStyle(dim).color,
  };
}
```
Then screenshot. Expected: the card reads as a raised panel against the page at a glance, and the `500 butir` line (`--pc-ink-dim`, `#a8bedb`) is still comfortably readable. `#a8bedb` on `#16335a` is 6.0:1, so it passes — but confirm visually, because the gradient means the local background varies down the card.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "fix(carousel): lift card gradient above the new navy page surface"
```

If Step 1 found no change was needed, commit nothing and note it in the task report instead.

---

### Task 6: Craft details that tie the UI to the logo

This is what separates the chosen approach (B) from a plain token swap (A). Three specific moves, all reusing what the system already owns. The logo's own motifs are deliberately **not** repeated as decoration — that was approach C, which was not chosen.

**Files:**
- Modify: `app/components/ui.tsx:24-30` (the `VARIANT` map, `accent` entry)
- Modify: `app/globals.css` (one new `.ornate`-scoped rule for the hairline divider)

**Interfaces:**
- Consumes: `.ornate` from Task 2.
- Produces: a `.rule-ornate` utility class other ornate surfaces can use later.

- [ ] **Step 1: Give the gold CTA a metallic gradient inside `.ornate` only**

The `accent` variant is currently flat gold. Flat gold next to a logo with a metallic bevel reads cheap. Add a scoped rule to `app/globals.css`, after the `.ornate` block:

```css
/* CTA gold: dua stop, bukan flat — echo highlight logam di logo. Scoped ke
   .ornate supaya tombol accent di permukaan light (halaman soal) tidak ikut.
   Teks tetap navy di atas gold, sesuai disiplin warna yang sudah ada. */
.ornate .btn-accent-metal {
  background-image: linear-gradient(160deg, #e8b45c 0%, #d9983f 55%, #c4842c 100%);
}

.ornate .btn-accent-metal:hover {
  background-image: linear-gradient(160deg, #f0c078 0%, #e0a24a 55%, #cc8d33 100%);
}
```

Then in `app/components/ui.tsx`, change the `accent` entry of `VARIANT` (line 28-29) to carry the hook class:

```tsx
  // CTA bermuatan merek. Gold hanya sebagai background dengan teks navy.
  // btn-accent-metal menambahkan gradient logam, tapi HANYA di dalam .ornate —
  // di permukaan light, bg-accent yang flat tetap yang berlaku.
  accent:
    "btn-accent-metal bg-accent text-primary shadow-e2 hover:bg-accent-strong active:bg-accent-strong",
```

`bg-accent` stays as the fallback: outside `.ornate` the gradient rule never matches, so the flat gold still applies and the exam surfaces are unaffected.

- [ ] **Step 2: Add the hairline divider motif**

The logo sets `AKADEMI` between two thin rules. Reuse that as a section divider — once, as a named device, not on every row:

```css
/* Echo garis tipis kiri-kanan "AKADEMI" di logo. Dipakai sebagai pembatas
   SECTION, bukan per-baris daftar — hairline di tiap baris tabel adalah pola
   yang sudah ditolak di disiplin desain repo ini. */
.ornate .rule-ornate {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--accent-ink);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.ornate .rule-ornate::before,
.ornate .rule-ornate::after {
  content: "";
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgb(217 152 63 / 0.5), transparent);
}
```

Leave it unused for now. It is a system primitive the next ornate surface can reach for; wiring it into a page without a section that needs it would be decoration for its own sake.

- [ ] **Step 3: Verify the gradient lands in ornate and does NOT land on light surfaces**

Navigate to `http://localhost:3000/dashboard/simulasi` (has an `accent` CTA: "Mulai tryout lengkap") and `evaluate_script`:

```js
() => {
  const b = [...document.querySelectorAll('.btn-accent-metal')][0];
  const cs = b && getComputedStyle(b);
  return { found: !!b, image: cs && cs.backgroundImage, color: cs && cs.color };
}
```
Expected: `found: true`, `image` contains `linear-gradient`, `color` is the navy `--primary`.

Then navigate to `http://localhost:3000/latihan/kecermatan/3` (light surface) and run the same script. Expected: either `found: false`, or `image: "none"` — the gradient must not apply outside `.ornate`.

- [ ] **Step 4: Build, detector, screenshot**

```bash
npx tsc --noEmit && npm run lint && npm run build
node /Users/gustiputuyudawirashana/.claude/skills/impeccable/scripts/detect.mjs --json app/globals.css app/components/ui.tsx
```
Expected: no errors, `[]` from the detector. Screenshot `/dashboard/simulasi` and confirm the CTA reads as brushed gold rather than a flat swatch, and that the navy label on it is still crisp.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/components/ui.tsx
git commit -m "feat(brand): metallic gold CTA and hairline rule motif in ornate scope"
```

---

## Done when

- Every surface in the spec's ornate list renders dark navy with gold accents; every surface in the "stay light" list is byte-identical to `04500f6` (`git diff 04500f6 -- app/test app/components/ExamChrome.tsx app/components/engines app/latihan` returns nothing).
- `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.
- The design detector returns `[]` for every touched path.
- The Task 2 Step 4 scoping check passes in both directions.

## Explicitly out of scope

- The 7 security review items in `CLAUDE_REVIEW_HANDOFF_2026-09-12.md`. Deferred by the user in favour of this rebrand; unrelated to it. Do not fold them in.
- `app/rescue/page.tsx`. It inherits the dark tokens automatically via nothing — it is not inside `.ornate` and is not in the three wrappers. Left as-is deliberately: it is internal recovery tooling, low traffic, and adding a fourth wrapper for it is not worth it now. Revisit only if someone asks.
- Repeating the crest/leaf shapes as background decoration (approach C).
