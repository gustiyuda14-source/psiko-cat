# DARK_GOLD_REDESIGN_PLAN.md

**Status:** Draft for human review. Not a green light. Written 2026-09-12.
**Decision made 2026-09-12 evening:** Option B chosen — keep `app/test/*` and `app/latihan/*` on the light theme (per the scanability decision confirmed the same morning in `AJIKS_REBRAND_PLAN_V2.md`). Recolor everything else (`.ornate` scope: dashboard/login/admin/simulasi) from navy to black-gold. Revisit Option A (full-app dark) only after an eyeball test of a dark timed Kecermatan screen.

---

## 0. Read this first — the repo is not where the brief assumed

**0.1 — A dark gold-on-dark theme is already shipped.** Five commits landed today (`1aab7d1`, `f94e4f9`, `a931dbc`, `5975d1c`, `84b274d`) implementing `AJIKS_REBRAND_PLAN_V2.md`. `app/globals.css` lines 181–261 hold a complete `.ornate` dark token block with documented contrast ratios, a metallic gold CTA gradient (`.btn-accent-metal`), and a gold hairline-rule motif (`.rule-ornate`). It's applied at three roots: `app/dashboard/layout.tsx:15`, `app/login/page.tsx:46`, `app/admin/page.tsx:61`.

This is **navy**-gold, not black-gold. So the job is a hue shift plus a scope expansion — not building a dark theme from scratch.

**0.2 — The ~120 dead legacy-remap lines no longer exist.** `app/globals.css` is 884 lines and contains zero Tailwind-scale overrides. Grepping for `color-zinc|color-slate|color-blue|bg-navy|text-gold|bg-cream|text-sage` returns nothing in CSS or TSX. The old memory note on this is out of date and should be corrected.

What *is* dead, verified by grepping every `.tsx` for each class name:

| Rule | Lines | TSX references |
|---|---|---|
| `.ornate .rule-ornate` + `::before/::after` | 244–261 | **0** |
| `.interactive-card` (+`:hover`, `:active`) | 812–828 | **0** |
| `.package-card` | 456–458 | **0** |

~35 lines. `.rule-ornate` is the D'Ajiks divider motif — written yesterday and never wired up. **Do not delete it; wire it up** (§4.4). Delete the other two.

**0.3 — Cormorant Garamond is already loaded.** `app/layout.tsx:19-23` loads it via `next/font/google` as `--font-display-src`, mapped to `--font-display` in `@theme inline` (globals.css:136) and consumed by `.font-heading` (globals.css:283). 30 call sites already use `font-heading`. **No font needs to be added.** Body is Source Sans 3.

**0.4 — There is no XP/level/streak system.** Grepping `xp|level|streak|gamif|poin` across `app/` and `lib/` returns only unrelated matches. The app has NAP scores, module completion counts, and a `Meter` component. The corpspraja "XP HUD" pattern is therefore **a new feature with a DB dependency**, not a reskin. Deferred (§5.3).

---

## 1. Scope decision (resolved)

`AJIKS_REBRAND_PLAN_V2.md` (written today, confirmed via structured questions that same morning) locked in:

> **Tetap light/Operate-mode, nol disentuh:** `app/test/[sessionId]/*` DAN `app/latihan/[module]/*` + `app/latihan/kecermatan/[package]/*` — seutuhnya. Alasan: kedua rute ini sama-sama "peserta lagi ngerjain soal", butuh scanability tinggi, nol distraksi visual.

**Decision: honor that.** Everything below applies inside the existing `.ornate` scope (dashboard/login/admin/simulasi/review/latihan-picker), recolored navy→black-gold. Exam surfaces (`ExamChrome`, the three engines, the three Latihan screens, `PembahasanSection`, `KecermatanKeyStrip`) get only the 4–6 mandatory contrast-collision fixes listed in §2.3 and §5.2 — nothing else, because they stay on the light theme and those fixes are light-theme fixes, not dark-theme ones. Re-verify which of §5.2's TSX edits are inside vs. outside `.ornate` before applying — the list below was written for full-app scope and needs pruning to the `.ornate` roots.

Token values below are written so a later Option A flip (hoisting `.ornate` to `:root`) is a selector-only change — the values don't change.

---

## 2. Colour tokens

### 2.1 Feasibility of the token-value-swap approach

Confirmed feasible, no renames needed. `@theme inline` (globals.css:93–157) maps every Tailwind colour utility to a *live* `var()` reference, so overriding tokens inside `.ornate {}` cascades to every `bg-background`, `text-foreground`, `border-border` under that scope with zero component edits — already proven, that's how `.ornate` ships today.

But a pure value swap is not sufficient: `--primary` currently carries two mutually exclusive jobs, and on a black ground they diverge. See §2.3. ~20 line-level edits are unavoidable within the `.ornate` scope, enumerated in §5.2.

### 2.2 The palette

Warm near-black, not neutral grey-black — keeps the gold reading as D'Ajiks' warm gold rather than neon.

```css
.ornate {
  color-scheme: dark;

  /* Surface ladder — warm black, card LIGHTER than page (dark convention) */
  --surface-page:     #0b0a09;
  --surface-card:      #151210;
  --surface-inset:    #1e1a16;
  --surface-nav:      #090807;
  --surface-nav-deep: #060505;

  /* Ink — warm cream, never pure white */
  --foreground:       #f6f0e4;
  --muted-foreground: #a79b89;
  --faint-foreground: #847a6c;

  /* Line */
  --border:        #2a241e;
  --border-strong: #8b622c;   /* opaque — see §2.4, no opacity modifier */

  /* Brand & state */
  --primary:            #d9983f;   /* re-roled to gold, see §2.3 */
  --primary-hover:      #e0a44a;
  --primary-active:     #c4842c;
  --primary-foreground: #0b0a09;
  --accent:             #d9983f;
  --accent-strong:      #c4842c;
  --accent-soft:        rgb(217 152 63 / 0.14);
  --accent-ink:         #efc078;
  --success:            #3ed6a0;
  --success-soft:       rgb(62 214 160 / 0.14);
  --destructive:        #fd948d;
  --destructive-soft:   rgb(253 148 141 / 0.14);
  --ring:               #efc078;
  --ring-on-nav:        #efc078;

  /* Elevation — pure black, offset preserved */
  --elev-1: 0 1px 2px rgb(0 0 0 / 0.40), 0 1px 3px -1px rgb(0 0 0 / 0.48);
  --elev-2: 0 2px 4px rgb(0 0 0 / 0.38), 0 6px 14px -6px rgb(0 0 0 / 0.55);
  --elev-3: 0 4px 8px rgb(0 0 0 / 0.40), 0 14px 30px -10px rgb(0 0 0 / 0.60);
  --elev-4: 0 10px 20px rgb(0 0 0 / 0.42), 0 30px 60px -20px rgb(0 0 0 / 0.70);

  /* One glow token — corpspraja technique, recolored gold */
  --glow-accent: 0 0 24px -6px rgb(217 152 63 / 0.55);
}
```

Plus one line in `@theme inline` so `shadow-glow` becomes a utility: `--shadow-glow: var(--glow-accent);`

Gold `#d9983f` is kept unchanged from the current codebase — already the brand gold, already in the logo cutouts (verified against near-black in commit `a931dbc`).

### 2.3 `--primary` must be re-roled to gold — the one unavoidable semantic change

`--primary` is consumed both as a solid fill (buttons, selected chips, `KecermatanKeyStrip` header) and as an ink (stat values, `Badge tone="info"`, and critically `bg-accent text-primary` — the gold CTA's own label). On near-black, nothing satisfies both at once the way navy did on light.

| | `--primary` = gold | `--primary` = deep graphite |
|---|---|---|
| `bg-primary` fills | gold chip, 8.02:1 with black ink ✅ | graphite on black, ~1.3:1, invisible ❌ |
| `text-primary` inks | gold on black, 7.56:1 ✅ | fails ❌ |
| Edits required | 3 collision fixes | ~14 sites re-inked |
| Reintroduces the shipped light-theme bug | no | yes, inverted |

**Go with gold.** `primary` and `accent` become the same hue — correct for a black-gold identity, differentiated by treatment not hue (the D'Ajiks two-button pattern, §4.2).

Mandatory fixes — three sites currently `bg-accent text-primary` would become gold-on-gold:

- `app/components/ui.tsx:32` → `text-primary-foreground`
- `app/components/ExamChrome.tsx:111` (timer — check if inside `.ornate` scope under §1) → `text-primary-foreground`
- `app/components/engines/EngineKecermatan.tsx:491` (timer — check scope) → `text-primary-foreground`

Plus two more in `ExamChrome`: line 216 (`ring-2 ring-primary` on `bg-accent` chip → `ring-foreground`), line 242 (`border-2 border-primary bg-accent` legend swatch → `border-foreground/70`).

### 2.4 `--border-strong` must become opaque, `/NN` modifier must go

`.ornate` currently sets `--border-strong: rgb(217 152 63 / 0.4)`, and 11 sites apply a further opacity modifier (`border-border-strong/55`, `/45`, `/60`). Tailwind v4's modifier multiplies alpha via `color-mix`, so 0.4 × 0.55 ≈ 0.22 → ~1.5:1 against the card — form-control borders need 3:1 (WCAG 1.4.11). **This bug is live in code shipped today.**

| value | solid | with `/55` |
|---|---|---|
| `rgb(217 152 63 / 0.4)` (current) | 2.20:1 ❌ | ~1.5:1 ❌ |
| `#8b622c` (proposed) | **3.45:1 ✅** | 1.87:1 ❌ |

No value passes at `/55`. Fix: set `--border-strong: #8b622c` opaque, strip the opacity modifier at all 11 sites (`sed 's/border-strong\/[0-9]*/border-strong/g'`): `ui.tsx:35`, `login/page.tsx:10`, `ExamChrome.tsx:219,236`, `KecermatanPackageCarousel.tsx:42,54`, `LatihanKecerdasan.tsx:157`, `LatihanKepribadian.tsx:175`, `EngineKecerdasan.tsx:221`, `EngineKepribadian.tsx:208`, `ActivityCharts.tsx:194`. (Prune to `.ornate`-scoped files per §1.)

### 2.5 Contrast verification

WCAG 2.x relative luminance, sRGB. `*-soft` rows composited at 14% over `--surface-card`.

| Pair | Ratio | Verdict |
|---|---|---|
| `--foreground` on card / page | 16.43:1 / 17.43:1 | AAA |
| `--muted-foreground` on card / page | 6.83:1 / 7.25:1 | AAA |
| `--faint-foreground` on card | 4.42:1 | AA (placeholders/chevrons only) |
| `--accent` AS TEXT on card / page / inset | 7.56:1 / 8.02:1 / 7.01:1 | AAA |
| `--accent-ink` on card | 11.09:1 | AAA |
| `--accent-ink` on `--accent-soft` | 8.90:1 | AAA |
| CTA: `--primary-foreground` on solid `--accent` | **8.02:1** | AAA |
| CTA metal gradient, lightest stop `#e8b45c` | 10.47:1 | AAA |
| CTA metal gradient, darkest stop `#c4842c` | 6.30:1 | AA+ |
| `--success` on card / on `--success-soft` | 10.06:1 / 7.83:1 | AAA |
| `--destructive` on card / on `--destructive-soft` | 8.70:1 / 6.87:1 | AAA |
| Sidebar active: `--accent-ink` on gold@12% over nav | 10.29:1 | AAA |
| `--border-strong` vs card (non-text) | 3.45:1 | passes 1.4.11 |

The old light-theme bug direction inverts: gold-as-text was 2.47:1 and banned there; here it's 7.56:1 and safe. The banned combination now is the mirror image: **white/cream text on solid gold — 2.47:1.** Every `bg-accent` must pair with `text-primary-foreground` (enforced at the three §2.3 sites).

### 2.6 Make this checkable

Two identity flips, two shipped contrast bugs, both caught only in human review. Repo already has runnable checks (`scripts/check-scoring.ts`, `check-access-policy.ts`, `check-sidebar-navigation.ts`).

**Add `scripts/check-contrast.ts`** (~60 lines): parse the token block out of `globals.css`, implement WCAG luminance, assert the §2.5 table. Wire as `"check:contrast"` in `package.json`. Cheaper than the review pass it replaces.

---

## 3. Typography

No font work needed — Cormorant Garamond (serif display, `.font-heading`, 30 call sites) and Source Sans 3 (body) are already loaded and wired. Plan is purely about *where* serif is allowed.

**Addition — the eyebrow.** `.rule-ornate` (globals.css:244–261) already implements the D'Ajiks thin-gold-rule + uppercase micro-label pairing and is currently dead code. Wire it up (§4.4), and add a no-rule variant:

```css
.eyebrow {
  color: var(--accent-ink);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
```

Never use serif on nav links, buttons, badges, table cells, form labels, or text under 18px — already the documented discipline at globals.css:280 (comment currently says "Lexend", predates commit `f94e4f9` — fix the comment).

Also: `app/layout.tsx:30` — `themeColor: "#0b2442"` → `"#0b0a09"`.

---

## 4. Component patterns

### 4.1 Sidebar active state

`app/dashboard/Sidebar.tsx:54-62`. Current active state `bg-white text-primary` becomes gold-on-white (2.47:1) once `--primary` is gold — a shipped-bug-class regression at the most-viewed element. Replace:

```tsx
active
  ? [
      "relative bg-accent/12 text-accent-ink font-semibold",
      "before:absolute before:left-0 before:top-1.5 before:bottom-1.5",
      "before:w-[3px] before:rounded-full before:bg-accent",
      "shadow-[0_0_18px_-6px_rgb(217_152_63/0.55)]",
    ].join(" ")
  : "text-foreground/70 hover:bg-accent/6 hover:text-foreground"
```

3px bar / -6px glow spread (not corpspraja's 4px/25px) — wider blooms into adjacent items on warm black.

Submenu active (line 202, `bg-white/14`) → `bg-accent/10 text-accent-ink`, no bar. Add `<p className="eyebrow px-3 pb-1">` above `PRIMARY_NAV`/`SECONDARY_NAV` groups. Mobile overlay `bg-[#08192f]/55` → `bg-black/70`; same in `ui-client.tsx:83`.

### 4.2 CTA — D'Ajiks two-button pattern, zero call-site churn

Don't rename/re-sort `buttonStyles` variants (40 call sites). Reskin in `ui.tsx:24-39`:

```tsx
const VARIANT: Record<Variant, string> = {
  primary:
    "border border-accent/55 bg-transparent text-accent-ink hover:bg-accent/10 hover:border-accent active:bg-accent/15",
  accent:
    "btn-accent-metal bg-accent text-primary-foreground shadow-e2 hover:bg-accent-strong active:bg-accent-strong",
  secondary:
    "border border-border-strong bg-card text-foreground shadow-e1 hover:bg-surface-inset active:bg-surface-inset",
  ghost: "text-muted-foreground hover:bg-surface-inset hover:text-foreground",
  danger:
    "border border-destructive/45 bg-card text-destructive hover:border-destructive hover:bg-destructive-soft",
};
```

`btn-accent-metal` keeps its gradient, un-scope from `.ornate` if needed (already inside it). Pill shape only at the 5 hero/marketing CTA sites (repo has a `rounded-md` shape lock elsewhere, don't break it globally): `dashboard/page.tsx:96`, `simulasi/page.tsx:137`, `login/page.tsx:112`, `LatihanGate.tsx:124` (skip `test/[sessionId]/page.tsx:174` — out of scope under §1).

### 4.3 Stat / progress cards

- Labels: swap to `className="eyebrow"`.
- Numerals: already `font-heading text-3xl` — no change.
- Glow: **one element per screen**, the single most important number (e.g. "Skor NAP terbaik" on dashboard). Two glowing things means neither reads as important.
- Meter track: `bg-surface-inset` → `bg-surface-inset ring-1 ring-inset ring-accent/15`.
- Card borders stay a whisper (`--border` 1.22:1) — let `--surface-card` being lighter than `--surface-page` carry the separation, don't brighten the border.
- `ActivityCharts.tsx:110,220`: past-period fill `fill-primary/16` and current `fill-accent` are now the same hue — change past to `fill-foreground/14` / `/25`. Update the stale contrast-rationale comment at lines 49–53.

### 4.4 Badges, labels, dividers

- `Badge tone="accent"` — already correct (8.90:1), no change.
- `Badge tone="info"` — currently renders identical to `accent` once gold; re-ink neutral: `border-border bg-surface-inset text-foreground/80`.
- Badge base: add `uppercase tracking-[0.12em]` (tighter than the 0.18em eyebrow — short pill words don't want 0.18em).
- Wire up `.rule-ornate` at the ~4 section headers currently plain `<h2 className="text-sm font-semibold">`: `dashboard/page.tsx:161`, `review/page.tsx`, `simulasi/page.tsx`, `admin/page.tsx`.

### 4.5 Background texture

corpspraja's scanline grid is too harsh. Faint gold dot-grid instead:

```css
.hud-grid {
  background-image: radial-gradient(circle, rgb(217 152 63 / 0.055) 1px, transparent 1px);
  background-size: 22px 22px;
  background-attachment: fixed;
}
```

Apply on exactly two elements: `app/dashboard/layout.tsx` wrapper and `app/login/page.tsx` root. Never on exam/latihan surfaces (out of scope anyway under §1).

### 4.6 Hero panel — must be rewritten, not recolored

`.hero-panel` (globals.css:385–427) hardcodes `var(--primary)` as its middle gradient stop. With `--primary` now gold, every hero banner gets a gold band with white text on it — 2.47:1. Rewrite:

```css
.hero-panel {
  border: 1px solid rgb(217 152 63 / 0.22);
  color: var(--foreground);
  background:
    radial-gradient(120% 140% at 8% 0%, rgb(217 152 63 / 0.10), transparent 55%),
    linear-gradient(150deg, #17130f 0%, #0d0b09 62%, #100d0b 100%);
  box-shadow: var(--elev-3);
}
```

Keep `::after` (rotated gold square) verbatim. `::before`: `rgb(255 255 255 / 0.025)` → `rgb(217 152 63 / 0.035)`, border → `rgb(217 152 63 / 0.12)`. Hero children `text-white`/`text-white/75` stay as-is (still ~17:1 on the new background). Drop the `bg-primary` fallback class at the four hero sites (`ui.tsx:119`, `dashboard/page.tsx:85`, `review/page.tsx:129`, `login/page.tsx:47`) — with `--primary` gold, a slow-loading gradient would flash gold.

---

## 5. Migration and cost accounting

### 5.1 Untouched

All of `lib/`, `app/api/`, `app/generated/prisma/`, `prisma/`. The Kecermatan feature (schema, seeds, package selection, column timing, symbol logic). `ExamChrome.tsx` functional logic (save-status machine, timer, navigator, focus trap) — only the light-theme-scoped collision lines get touched. All security hardening and the 7 open review points in `security-review-deferred.md` — unaffected, still open. `scripts/` except the new contrast check.

### 5.2 Touched — full edit list (prune anything outside `.ornate` scope per §1)

**`app/globals.css`:**

| Change | Lines |
|---|---|
| Replace `.ornate` colour tokens with §2.2 | 181–228 |
| Un-scope `.btn-accent-metal` and `.rule-ornate` (already inside `.ornate`, just wire up usage) | 233–261 |
| Add `.eyebrow`, `.hud-grid` | new |
| Add `--shadow-glow` to `@theme inline` | ~131 |
| Rewrite `.hero-panel` background + `::before` | 385–427 |
| `::selection` `color-mix(…, white)` → `, black` | 306 |
| `.skeleton::after` sweep `rgb(255 255 255 / 0.72)` → `rgb(255 255 255 / 0.06)` | 848 |
| `.module-card:first-child` / `.module-card-featured` gradients (navy-referenced) | 442–454 |
| Delete `.interactive-card`, `.package-card` (dead) | 812–828, 456–458 |
| Fix stale "Lexend" comment | 280–282 |

**TSX, ~45 line-level changes across 14 files** (dashboard/login/admin scope only): `app/layout.tsx` (themeColor), `app/components/ui.tsx` (VARIANT, Badge, PageHeader, Meter), `app/dashboard/Sidebar.tsx` (highest-risk file, 15 raw-colour usages), `app/components/ExamChrome.tsx` (4 collision lines only), `app/components/engines/EngineKecermatan.tsx` (3 collision lines), `app/dashboard/ActivityCharts.tsx`, `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`, `app/login/page.tsx`, `app/admin/page.tsx`, `app/dashboard/review/page.tsx`, `simulasi/page.tsx`, `latihan/page.tsx` (picker only, not the exam engines), `app/components/ui-client.tsx`.

**New:** `scripts/check-contrast.ts` + one `package.json` line.

### 5.3 Explicitly deferred

- XP/level/condition-status HUD — no data model, needs a DB column + accrual rules + a decision on whether gamification fits a government-exam-prep brand. Cheap substitute: re-dress the existing `SummaryCell` strip in HUD register (eyebrow labels, tabular numerals, gold meter) — same data, new voice.
- Radar-metaphor analytics naming — copy-only, independent of theme, do anytime.
- D'Ajiks bottom info bar (hours/pricing/location) — no content equivalent, skip.
- Moody hero photography — no assets, fights data density; gradient + rotated-gold-square motif already carries the mood.

### 5.4 Known fallout requiring rework

`app/components/KecermatanPackageCarousel.tsx` + globals.css:480–783 (~300 lines) were tuned *today* (commit `84b274d`) specifically for navy-on-navy. Retune to warm: gradient `#1c1713 → #241d17 → #2d241b`, `--pc-ink-dim: #b3a694`, surface radial `rgb(217 152 63 / 0.14)`. Keep the scanline/reticle/sheen/coverflow geometry verbatim — hue-independent, already reads as the intended synthesis. ~10 values, one commit. (Confirm whether the practice-picker screen is inside or outside the `.ornate` scope before touching — if Latihan Kecermatan practice picker is excluded per §1, skip this entirely.)

---

## 6. Sequencing

**P1 — Tokens + collision fixes, one atomic commit.** globals.css token block, `.hero-panel` rewrite, the gold-on-gold fixes inside `.ornate` scope, sidebar active state, `border-strong` + modifier strips, `themeColor`, hardcoded navy hexes. Gate: `npm run lint && npx tsc --noEmit && npm run build`.

**P2 — `scripts/check-contrast.ts`.** Immediately after P1. Gate: `npm run check:contrast` green.

**P3 — D'Ajiks register.** Eyebrows + `.rule-ornate` wiring, pill CTAs at hero sites, `.hud-grid`, one `shadow-glow`, badge uppercase, chart retune.

**P4 — Carousel retune** (§5.4, if in scope).

**P5 — Cleanup.** Delete `.interactive-card`, `.package-card`. Fix stale Lexend comment. Update memory `ajiks-tailwind-color-remap` (core claim now false). Run `detect.mjs`, `check:access`, `check:scoring`, `check-sidebar-navigation`.

**Estimate:** ≈ half a day.

---

## 7. Risks — confirm before starting

1. **`--primary` → gold is not value-reversible.** Restoring navy later requires undoing the collision fixes too, not just swapping hex. Tag the commit before P1 for a clean revert point.
2. **Third identity flip in six days.** The first two each shipped a WCAG failure that survived to final review — P2's runnable check is the mitigation, treat as non-optional.
3. **`Sidebar.tsx` is the riskiest single file** — 15 raw-colour usages plus interleaved focus-trap/mobile-drawer logic. Change colours only, don't refactor while in there.
4. **`--border` at 1.22:1 is deliberate.** If cards read as floating, fix by raising `--surface-card` toward `#191411`, not by brightening `--border` — that reproduces the boxed-in look the light-theme design discipline rejected.
5. **Logo assets need no rework** — already verified against near-black in commit `a931dbc`. Re-eyeball once, expect no change.
6. **No browser verification possible from a planning pass.** Contrast ratios are computed exactly; perceived legibility of Cormorant Garamond at small sizes on near-black, and the dot-grid on low-quality panels, need a real screen.

---

### Critical files for implementation

- `app/globals.css`
- `app/components/ui.tsx`
- `app/dashboard/Sidebar.tsx`
- `app/components/ExamChrome.tsx` (collision-fix lines only)
- `app/dashboard/layout.tsx`

Reference reading before implementation (predates today's commits, don't follow blindly): `AJIKS_REBRAND_PLAN_V2.md` (§1 scope decision) and `AJIKS_REBRAND_V2_TASKS.md` (Task 5 = carousel retune procedure to repeat for black).
