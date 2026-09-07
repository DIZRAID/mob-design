# 09 — Adoption

mob-design was calibrated on a dense financial dashboard, but it is not a dashboard kit. What
transfers is a set of constraints: a three-tier token pipeline, a depth model built from surface
plus a 1px border, a dual type family split by role, five graded borders, muted action tones, and
three declared density zones. Those constraints compose a marketing page or a settings console just
as well as a data grid.

This document is how you get the system into a codebase, how you make it look like your product
instead of the one it was measured from, and how you keep it from rotting afterwards.

Throughout: **[src]** marks a value measured from the calibrated handoff, **[drv]** a value extended
by a stated rule. Where the distinction changes what you should trust, it is called out.

---

## 1. Install and wire up

### 1.1 File layout

```text
mob-design/
  css/
    reset.css          global, opinionated only where the system has an opinion
    tokens.css         tier 1 primitives -> tier 2 semantic -> tier 3 component
    brand.css          optional: derive the accent family from one hex
    a11y.css           optional: swap the tokens that miss a contrast threshold
                       for measured replacements, on an attribute
    base.css           element defaults, type roles, tone utilities, focus contract
    components/        one file per component
    mob.css            the entry point: imports everything except brand and a11y
  tailwind/preset.js   alternative consumption path (section 4.5)
  tokens/              exported token formats
  docs/                this folder
```

Vendor the folder, or install it as a package and adjust the paths below. Nothing in the CSS
depends on a build step: it is plain CSS with custom properties.

`css/mob.css` is the shortest way in — one import, correct order. It deliberately leaves out
`brand.css` and `a11y.css`, because both change the calibrated defaults and that has to be a
decision someone makes on purpose; import either one *after* it. Section 1.2 hand-rolls the same
order into cascade layers, which is what you want if you are running two design systems side by
side during a migration.

### 1.2 One entry file, in this order

Create a single `mob.css` in your app and import it once. Do not scatter these imports across
component files — the order below is the contract, and a bundler will happily reorder duplicated
imports.

```css
/* app/mob.css */
@layer mob.reset, mob.tokens, mob.brand, mob.a11y, mob.base, mob.components, app;

@import url('../mob-design/css/reset.css')  layer(mob.reset);
@import url('../mob-design/css/tokens.css') layer(mob.tokens);
@import url('../mob-design/css/brand.css')  layer(mob.brand);   /* optional */
@import url('../mob-design/css/a11y.css')   layer(mob.a11y);    /* optional */
@import url('../mob-design/css/base.css')   layer(mob.base);

/* Then the component layer — import the files you use. */
@import url('../mob-design/css/components/button.css')   layer(mob.components);
@import url('../mob-design/css/components/layout.css')   layer(mob.components);
@import url('../mob-design/css/components/nav.css')      layer(mob.components);
@import url('../mob-design/css/components/feedback.css') layer(mob.components);
/* …and any other file in css/components/. Plain CSS has no glob; if listing
   them is tedious, let your bundler expand the folder instead:
   @import 'mob-design/css/components/*.css';   (Sass / vite-plugin-glob)      */
```

Why this order:

| Layer | Position | Reason |
|---|---|---|
| `reset` | first | Lowest-intent layer. Everything after it must be able to win without a specificity fight. |
| `tokens` | second | `brand.css` and your own overrides re-declare tier-2 properties at *equal* specificity; last declaration wins, so tokens must be established before anything redefines them. |
| `brand` | after tokens | It exists only to overwrite the accent family. Before tokens, it would be overwritten instead. |
| `a11y` | after brand | Same argument, one step later: it overwrites six tokens including two accent members, so it must land after the family they belong to has been established — otherwise a rebrand silently reverts the hardening. It is scoped to `[data-mob-a11y='AA']`, so it is inert until you opt in. |
| `base` | after tokens | It *consumes* tokens (`body`, type roles, focus ring) and sets element defaults components override. |
| `components` | last of the system | A component must beat `base`'s element defaults without `!important`. |
| `app` | after everything | Your product CSS. |

The `@layer` line is optional but recommended. Custom properties resolve at computed-value time, so
a component file can reference a token declared later in the source — but *element* rules do not
have that luxury. Layers make the win order explicit instead of implicit in file order, and they
guarantee your app CSS beats the system without specificity escalation.

One non-obvious property of `tokens.css`: it is almost inert. It declares custom properties and
nothing else — except `color-scheme: dark` on `:root`. That single declaration changes how the
browser paints native form controls, scrollbars and the default canvas. It is the only thing in the
token layer that can visibly alter an existing page, which matters for migration (section 6).

### 1.3 What goes on `<html>`

```html
<html lang="en" data-mob-theme="dark">
```

`data-mob-theme` accepts `dark` (default, and the mode the system was calibrated in) or `light`
(a **[drv]** role inversion — see 2.2 before shipping it). There is deliberately no automatic OS
switch: silently serving the derived light mode would hand users an uncalibrated product. Opt in at
the app root if you want it:

```js
const m = matchMedia('(prefers-color-scheme: light)');
const set = () => { document.documentElement.dataset.mobTheme = m.matches ? 'light' : 'dark'; };
set(); m.addEventListener('change', set);
```

`data-mob-a11y="AA"` is the other root-level attribute, and it is what activates `a11y.css`:

```html
<html lang="en" data-mob-theme="dark" data-mob-a11y="AA">
```

It is a token override, so it scopes like any other — put it on a `<section>` to harden one region
instead of the product. `docs/06-accessibility.md` §1 carries the measured ratios; 2.1 below covers
the one that bites a rebrand first. Without the attribute the file is inert, which is why importing
it costs nothing.

`data-mob-density` goes on **sections, not on `<html>`** — it is a subtree property, and a real
product uses more than one zone per page.

```html
<main data-mob-density="product">
  <section data-mob-density="marketing"> … hero … </section>
  <div data-mob-density="data">          … table … </div>
</main>
```

| Zone | `--mob-section-gap` | `--mob-stack-gap` | `--mob-grid-gap` | card padding |
|---|---|---|---|---|
| `marketing` | 128px | 24px | 32px | 24 / 24 |
| `product` | 64px | 14px | 20px | 15 / 16 **[src]** |
| `data` | 32px | 8px | 12px | 10 / 12 |

The `:root` defaults already equal `product`, so strictly you only annotate where you deviate.
Annotate anyway: the zone is then visible in the DOM, and a reviewer can see that a hero is a hero
without reading CSS. **Only rhythm and card padding move.** Control geometry, radius, type scale and
colour never do — an M button is the same 34px button in all three zones, which is what keeps a
landing page and a data grid recognisably the same product.

### 1.4 Fonts

Two families, three weights, one webfont.

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap">
```

Load exactly 400/500/600 **[src]**. Those are the three weights the type roles demand: 400 for
values and metadata, 500 for control labels and emphasis, 600 for the rare mono heading. No italics,
no other weights — every extra weight is bytes that no role in `base.css` can spend.

**The sans family has no webfont at all.** `--mob-font-sans` is a system stack
(`-apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', Inter, sans-serif`), so headings and hero
figures paint on the first frame at zero network cost and feel native on each OS. The price is that
heading metrics differ slightly across platforms. That is accepted: the identity of a mob-design
heading is *600 weight at -0.02em tracking*, not a specific face. If a brand sans is mandatory,
override `--mob-font-sans` and keep the weight and tracking.

**Self-hosting.** Preferred for anything that must work offline, behind a firewall, or without a
third-party request. IBM Plex Mono ships under the SIL Open Font License 1.1, so self-hosting is
permitted; subset to the ranges you actually render.

```css
@font-face {
  font-family: 'IBM Plex Mono';
  src: url('/fonts/ibm-plex-mono-400.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
  unicode-range: U+0000-00FF, U+2000-206F, U+2190-21BB, U+2212;
}
/* repeat for 500 and 600 */
```

```html
<link rel="preload" href="/fonts/ibm-plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
```

Preload 400 only. It is the one weight guaranteed to be on the first frame, because `base.css` sets
mono as the *body* default; preloading all three just delays the first.

**If the webfont never loads.** The fallback chain is `ui-monospace, SFMono-Regular, Menlo,
monospace` — every member is monospaced, so tabular alignment, column widths and the right-aligned
number stacks survive intact. What you lose is glyph character; what may shift is a pixel or two of
advance width in a tightly packed row. Use `font-display: swap`, never `block`: a data screen that
renders blank for 3s is strictly worse than one that reflows slightly.

`font-variant-numeric: tabular-nums` is set on `body` in `base.css` and is a no-op on a monospaced
fallback (all digits are already the same width), so the guarantee that a live-updating number does
not jitter holds in both cases.

---

## 2. Retheming

Three legitimate levels. Pick the lowest one that gets you there — each step up buys more freedom
and costs more calibration.

### 2.1 Level A — one-hex rebrand

The whole accent family derives from a single colour in oklab, preserving the luminance
relationships that make the default violet work at any hue.

```css
/* app/mob.css — brand.css must already be imported */
:root { --mob-brand: #e05c2b; }
```

That re-points `--mob-accent`, `-hover`, `-pressed`, `-deep`, `-soft`, `-bright`, `-tint` and
`-tint-strong` in one line. Nothing else in the system moves.

Two checks before you call it done:

- **Contrast on the primary action.** `--mob-fg-on-accent` is white. White on the default accent
  `#7c5dfa` measures **4.37:1** — a hair under the 4.5:1 AA floor for the 13px primary button label.
  That value is **[src]** and stays canonical, but it means the pair is already at the edge: a
  lighter brand hue will fail it outright. For the default violet the fix is not yours to invent —
  load `css/a11y.css` and opt in, which repoints `--mob-accent` to `#7a5bf5` (**4.52:1**) and
  `--mob-accent-hover` to `#6f4fe8` (**5.30:1**), both measured. For *your* hue, apply the same
  method: darken the fill until white clears 4.5:1 and derive hover downward from there. Do not
  lighten the accent to fix it — that breaks its relationship to `--mob-accent-bright`.
- **The derivation is an approximation, not a substitute for judgement.** If a hue reads wrong —
  most often a yellow or lime, where `color-mix` toward white produces a washed hover — override the
  individual `--mob-accent-*` tokens. That is a supported outcome, not a failure.

For a new muted action tone (a warning action, an info action), use the recipe in `brand.css`
instead of picking three colours by eye:

```css
--tone-fg:     color-mix(in oklab, <hue> 62%, var(--mob-fg-secondary));
--tone-bg:     color-mix(in oklab, <hue> 11%, var(--mob-bg-canvas));
--tone-border: color-mix(in oklab, <hue> 20%, var(--mob-border-frame));
/* hover: +14% hue on fg and border, +4% on bg */
```

The calibrated `--mob-affirm-*` and `--mob-destroy-*` triplets are **[src]** and stay canonical —
do not regenerate them from the recipe.

### 2.2 Level B — semantic override

Redefine the tier-2 block in your own stylesheet. The primitive ramp stays; only the mapping
changes. This is how you get a different neutral temperature, or a light-first product.

**A warmer neutral.** Add your own primitives, then re-point the semantic roles at them. Keep the
*deltas* between steps identical to the source — that is what is being preserved, not the hexes.

```css
/* app/theme-warm.css — after tokens.css */
:root {
  /* new primitives, same luminance steps as the gray ramp, hue shifted warm */
  --app-warm-975: #0b0a09;
  --app-warm-950: #0f0e0c;
  --app-warm-925: #121110;
  --app-warm-900: #151312;
}
:root, [data-mob-theme='dark'] {
  --mob-bg-canvas:         var(--app-warm-975);
  --mob-bg-sunken:         var(--app-warm-950);
  --mob-bg-surface:        var(--app-warm-925);
  --mob-bg-surface-raised: var(--app-warm-900);
}
```

Only the four surface roles moved. Borders, text and status hues still come from the neutral ramp,
which is usually correct: a warm canvas with warm hairlines reads as a sepia filter, not as a
temperature choice.

**Light-first.** The supported path is one attribute in your HTML template:

```html
<html lang="en" data-mob-theme="light">
```

Use CSS only when you cannot control the root element — for example a widget embedded in someone
else's page. Then invert the default without touching the dark block:

```css
:root:not([data-mob-theme='dark']) {
  color-scheme: light;
  --mob-bg-canvas:  #f7f8fa;
  --mob-bg-surface: #ffffff;
  --mob-fg-primary: #14161a;
  /* …the rest of the [data-mob-theme='light'] block… */
}
```

`:root:not([…])` outranks the bare `:root` defaults, and an explicit `data-mob-theme="dark"` still
wins because the selector stops matching.

Honest caveat: the entire light block is **[drv]**. It is a faithful role inversion — same
hierarchy, same restraint, same accent — but it has never been measured on a real surface the way
the dark mode was. Run a contrast pass over your own screens before shipping it as the default.

### 2.3 Level C — full primitive re-ramp

Replace tier 1 outright. Legitimate when the product has its own colour science, or when the target
is a genuinely different medium (print-adjacent, high-ambient-light, e-ink).

```css
/* app/ramp.css — loaded BETWEEN tokens.css and base.css */
:root {
  --mob-gray-1000: …;  --mob-gray-975: …;  --mob-gray-950: …;  --mob-gray-925: …;
  --mob-gray-900:  …;  /* …every step of the ramp… */
}
```

Re-declaring the primitives is enough: tier 2 references them by name, so the semantic layer
re-resolves with no further edits. That is the payoff of the one-directional pipeline.

For the result to still be mob-design, five **relationships** must survive. These, not the hexes,
are the system.

1. **The surface separation band is narrow.** In the source, canvas → sunken → surface → raised is
   `#0a0b0d → #0e0f12 → #101114 → #131417`: 2–3 sRGB units per step, and the whole four-step stack
   spans 0.33% to 0.70% relative luminance. Widen it and you get a Material-style pile of trays with
   shadows implied; collapse it and the hierarchy disappears. The tokens.css comment says the ramp is
   "intentionally dense" — this is what that means, numerically.
2. **Five graded borders, each with a job.** `subtle` < `frame` < `default` < `control` < `strong`,
   each step lighter than the last, all of them darker than the dimmest text. Divider inside one
   surface; seam between fused segments; boundary of a card; chips and inputs; selected or
   emphasised. Collapsing them to one border colour is the single fastest way to make a dark UI look
   generic — every edge then claims the same importance.
3. **Status hues sit on one luminance tier.** The source builds on the Tailwind-400 tier
   (`#34d399`, `#f87171`, `#2dd4bf`). Measured on a card surface, positive is 9.82:1, negative 6.83:1,
   warning 11.31:1, info 7.43:1 — close enough that no single state out-shouts the others. If your
   red is markedly brighter than your green, every loss on every screen shouts.
4. **The accent stays scarce.** It appears on the primary action, the active/selected state, and
   links. Budget: at most one accent-*filled* element per viewport. An accent used decoratively in
   five shades is on the anti-pattern list for a reason — scarcity is what makes it read as "act
   here".
5. **The mono/sans split holds.** Numbers, control labels, tags and metadata in mono with tabular
   figures; headings sans 600 at -0.02em from 14px up, and figures sans from 22px up — a figure at
   16px stays mono. Unify to one family and the product loses its identity faster than any colour
   change could take it.

Contrast floors worth knowing before you re-ramp, all measured on `--mob-bg-surface` (`#101114`):

| Role | Value | Ratio | Use |
|---|---|---|---|
| `--mob-fg-primary` | `#e8eaed` | 15.66 | anything |
| `--mob-fg-secondary` | `#cfd3da` | 12.57 | anything |
| `--mob-fg-muted-hi` | `#9aa0a8` | 7.16 | anything |
| `--mob-fg-muted` | `#8f959e` | 6.26 | anything |
| `--mob-fg-label` | `#767c86` | **4.49** | at the AA boundary, and used at 9.5px |
| `--mob-fg-dim` | `#5d636c` | **3.12** | decoration and duplicated information only |

`--mob-fg-label` and `--mob-fg-dim` are **[src]**: they are what the calibrated surface actually
used, and they stay canonical. If your product has to certify AA, do not re-pick these two by hand
and do not promote them to an existing lighter step — that overshoots and flattens the ramp. Load
`css/a11y.css` and set `data-mob-a11y="AA"`: it lifts `--mob-fg-label` to `#797f88` (**4.56**) and
`--mob-fg-dim` to `#797e85` (**4.62**) — the smallest measured steps that clear the floor without
reaching `--mob-fg-muted` (6.26) and flattening the top of the ramp into it. Know the cost: the two
hardened greys land within a hair of each other, so under AA the label and dim tiers stop being
separable by luminance and the hierarchy between them has to come from size and case instead. Either
way, `--mob-fg-dim` must never carry information that appears nowhere else on the screen.

---

## 3. Adapting to a domain that is not a dashboard

### 3.1 What is universal and what is not

| Universal — carry it everywhere | Dashboard-specific — do not carry blindly |
|---|---|
| Three-tier token pipeline; no literal colour in a component | `--mob-container-app: 1460px` and `--mob-rail-width: 288px` |
| Depth from surface + 1px border; no drop shadow on cards | The 34px header-row baseline alignment |
| Five-step border hierarchy | 15/16px card padding as a *default* outside the product zone |
| Mono/sans split by role; tabular numerals on every number | 9.5–12.5px type as a *body* size |
| Control geometry: 30/34/40px heights, radius tracking size | Data marks: `--mob-bar-*`, `--mob-meter-*`, `--mob-spark-*` |
| The focus contract — a visible ring on everything, never deleted | The fused segmented card (1px gaps over a frame-coloured parent) |
| Motion: transform/opacity only, `--mob-duration-*`, no bounce, reduced-motion honoured | `[data-mob-sign]` tone flipping |
| Muted action tones — intent at rest, saturation on hover | `.mob-value` / `.mob-meta` as the default text roles |
| Scarce accent | Three-column dense grids |
| Declared density zones instead of per-screen improvisation | |

### 3.2 A marketing site

Wrap the page in `data-mob-density="marketing"` and switch the container from `--mob-container-app`
(1460px, sized for a dense two-column shell) to `--mob-container-content` (1280px **[drv]**). Section
rhythm becomes 128px, which is what actually separates a landing page from an app page — not
bigger type, but bigger silence. The spec's anti-pattern list names "dashboard-template density on
marketing sections"; the inverse is equally true, and the density attribute is how you stop hero
spacing leaking back into the product.

Type steps up into the display roles, which are already fluid: `.mob-display-xl` clamps between 40px
and `--mob-size-12xl` (80px), `.mob-display-md` between 28px and 48px. Every one of them is sans 600
at -0.02em, i.e. the same heading logic as a 14px `.mob-title` — the scale changes, the rule does
not. Sizes at and above 28px are **[drv]**: they extend the measured sans logic upward into
territory the handoff never covered.

The hero pattern is one dominant headline, one concise support line, one primary action, an optional
secondary action, and one strong visual — nothing else. Set the eyebrow in `.mob-label` (mono,
uppercase, 9.5px, 0.7px tracking): it is the one place where mono earns its keep at marketing scale,
because it reads as an instrument label against the sans headline instead of competing with it. The
support line is `.mob-body-lg` — sans, 18px, 1.6 leading. Never set a marketing paragraph in mono;
mono at paragraph length is a texture, not a reading experience.

What relaxes: radius (`--mob-radius-2xl` 16px and `--mob-radius-3xl` 24px are **[drv]** steps
reserved for marketing surfaces and hero media), card padding, grid gaps, and the amount of empty
space around a single idea.

What must **not** relax:

- **Control geometry.** A marketing CTA is `--mob-control-h-lg` (40px) with the same radius and the
  same focus ring as an app button. The moment the CTA becomes a 56px pill, the landing page and the
  product stop being the same thing, and the visitor feels the seam at signup.
- **Accent scarcity.** One primary action per section. Two competing CTAs is a decision you failed to
  make, pushed onto the reader.
- **Depth.** Still surface plus border. A marketing page is not a licence for glassmorphism, glow
  stacks or animated gradients behind body text.
- **Body copy in sans at readable contrast.** Thin, low-contrast marketing copy is on the
  anti-pattern list.

### 3.3 A content / reading product

Constrain the measure with `--mob-container-prose` (68ch **[drv]**) and set body copy in sans. The
honest problem: `.mob-body` resolves to `--mob-size-lg`, which is **13px [src]** — calibrated for a
dense product surface where text is scanned, not read. Thirteen pixels is wrong for sustained
reading.

Fix it at the **role**, not the token, and scope it to the prose container:

```css
.prose {
  max-width: var(--mob-container-prose);
  font-family: var(--mob-font-sans);
  font-size: var(--mob-size-4xl);          /* 18px */
  line-height: var(--mob-leading-relaxed); /* 1.6  */
  color: var(--mob-fg-secondary);
}
.prose > * + * { margin-block-start: var(--mob-space-20); }
```

Do not redefine `--mob-size-lg` globally: it is load-bearing for control labels and values elsewhere
in the same app. Treat `--mob-size-3xl` (16px) as the floor for anything a person reads for more than
a few seconds — a **[drv]** rule, stated so you can disagree with it deliberately.

Mono is reserved for metadata: byline, timestamp, read time, tags, figure numbers, code. Use
`.mob-meta` and `.mob-label`. This is the same split the dashboard uses, applied to different nouns —
in a dashboard mono marks a quantity, in an article it marks an apparatus. Headings use
`.mob-heading-*`; a heading is never mono.

A reading product is also the most legitimate place to run `data-mob-theme="light"` by default. Read
2.2 first: the light ramp is **[drv]** and wants a contrast pass on your actual screens.

### 3.4 A settings / admin console

Density `product`. The page is a list of grouped cards, each card one concern, opened by a
`.mob-label` micro-header. Rows inside a card are separated by `--mob-border-subtle` — the
"divider inside one surface" step — **not** by promoting every row to its own card. A wall of cards
is the failure mode of settings pages: it makes twelve unrelated toggles look like twelve equally
important decisions.

Field geometry comes from the tier-3 field tokens: `--mob-field-h` (40px, i.e. `--mob-control-h-lg`),
`--mob-field-px` (12px), `--mob-field-radius` (`--mob-radius-md`, 9px), and critically
`--mob-field-bg: var(--mob-bg-sunken)` — a field is *sunken* relative to the card it sits on. That
inversion is the whole affordance: on this system, recessed means editable and raised means
actionable. `--mob-field-bg-hover` lifts to `--mob-bg-surface` on hover, and
`--mob-field-border-hover` steps from `control` to `strong`. Multi-line inputs get
`--mob-textarea-min-h` (108px) so the layout does not jump when one grows.

Each row is: mono `.mob-control-label` for the name, `.mob-body-sm` for the description, control on
the right. The label is mono because it is an identifier, the description is sans because it is
prose — the same rule as everywhere else in the system.

The danger zone is a separate card at the bottom, bordered with `--mob-destroy-border` and carrying
a destroy-toned action. It is deliberately muted at rest: `--mob-destroy-fg` on `--mob-destroy-bg`
measures 6.37:1, so it reads clearly as dangerous without the section glowing red every time someone
opens their account settings. Saturation arrives on hover, via the `-hover` triplet. Never fill the
whole card red — a permanently alarming region trains people to ignore it, and what actually protects
the user is the confirmation step, not the colour.

The system splits that into two variants, and the split matters: `destroy` is the muted one that
lives in a row or a settings panel, `danger` is the loud one reserved for the confirm button of the
modal it opens. Never put a loud `danger` button in a list row, and never confirm a destructive modal
with a muted `destroy` button. Confirm at `--mob-modal-w` (520px), naming the thing being destroyed.

---

## 4. Framework integration

### 4.1 The wrapper is thin

A framework component is a name and a prop-to-class mapping. It is not a place to compute styles.
Every visual decision lives in `components/*.css`; the wrapper decides which class names apply.

The reason is single-source-of-truth: as soon as one padding value lives in JavaScript, the
stylesheet stops being an accurate description of the product, and the next person changes the CSS
and nothing moves.

### 4.2 The mapping convention

- **Static, enumerable options** (variant, size, tone) map to modifier classes:
  `mob-btn mob-btn--primary mob-btn--md`.
- **Runtime state** (loading, selected, invalid, expanded, sign) maps to `data-` attributes:
  `data-mob-loading`, `data-mob-selected`, `data-mob-sign="negative"`. CSS reads them with attribute
  selectors, they survive server rendering, and they are inspectable in devtools without decoding a
  class-name soup.
- **Map, never concatenate.** Look options up in a lookup object so an invalid value fails loudly
  and static analysers (Tailwind's scanner, CSS-module type generation, dead-CSS tooling) can see
  every class that can be emitted.

```tsx
const VARIANT = {
  primary:   'mob-btn--primary',
  secondary: 'mob-btn--secondary',
  ghost:     'mob-btn--ghost',
  quiet:     'mob-btn--quiet',
  affirm:    'mob-btn--affirm',
  destroy:   'mob-btn--destroy',
  danger:    'mob-btn--danger',
} as const;
const SIZE = { sm: 'mob-btn--sm', md: 'mob-btn--md', lg: 'mob-btn--lg' } as const;
```

`.mob-btn`, `.mob-icon-btn`, `.mob-tab`, `.mob-menu-item` and `.mob-chip[data-mob-interactive]` are
the roots `base.css` already targets for the coarse-pointer hit-target floor, so those names are
fixed. The modifier and `data-` spellings above match what `components/button.css` and
`components/feedback.css` ship (`data-mob-loading`, `data-mob-error`,
`data-mob-tone="success | error | warning | info"`). **A component file is always authoritative over
this document** — read it before wrapping it, and follow this convention only when you author a new
one.

### 4.3 The API rule

**A component's props expose semantic options — `variant`, `size`, `tone`, `state` — never visual
ones.** No `color`, `bg`, `padding`, `radius` or `shadow` prop.

The reason is not purity. A visual prop turns every call site into a design decision, and once fifty
call sites have each made one, there is no single place left to change the design. A semantic prop
means the design can be revised in one stylesheet and every call site follows. It also makes the
retheming levels in section 2 actually work: `tone="destroy"` re-themes with the token; `color="red"`
does not.

```tsx
// Button
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'quiet' | 'affirm' | 'destroy' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// Card
type CardProps = {
  variant?: 'static' | 'interactive' | 'selected';
  padding?: 'sm' | 'md' | 'lg';
  as?: ElementType;              // section / article / li — semantics stay the caller's choice
  children: ReactNode;
};
```

```tsx
export function Button({ variant = 'secondary', size = 'md', loading, ...rest }: ButtonProps) {
  return (
    <button
      className={['mob-btn', VARIANT[variant], SIZE[size]].join(' ')}
      data-mob-loading={loading || undefined}
      disabled={rest.disabled || loading}
      {...rest}
    />
  );
}
```

`data-mob-loading={loading || undefined}` rather than `={loading}`: React renders `data-x="false"`
for a boolean false, and `[data-mob-loading]` would then match a button that is not loading.

The same shape in Vue and Svelte — the wrapper is the same three lines in every framework, which is
the point:

```vue
<script setup>
const props = defineProps({ variant: { default: 'secondary' }, size: { default: 'md' }, loading: Boolean });
</script>
<template>
  <button class="mob-btn" :class="[`mob-btn--${props.variant}`, `mob-btn--${props.size}`]"
          :data-mob-loading="props.loading || null" :disabled="props.loading"><slot /></button>
</template>
```

```svelte
<script>
  export let variant = 'secondary';
  export let size = 'md';
  export let loading = false;
</script>
<button class="mob-btn mob-btn--{variant} mob-btn--{size}"
        data-mob-loading={loading || undefined} disabled={loading}><slot /></button>
```

(The template-literal class names above are readable, but if your toolchain statically scans class
names — Tailwind, CSS-module pruning — use the lookup-map form from 4.2 instead.)

### 4.4 A note on loading states

A loading button must not change width. Reserve the label's space and swap opacity, or the row
reflows every time someone clicks. This is the same rule as the visual-QA item "loading states do not
cause layout shifts", and it is why loading is a `data-` attribute rather than a different rendered
tree.

### 4.5 The Tailwind path

`mob-design/tailwind/preset.js` is the alternative to importing the component layer: consume the
tokens as Tailwind theme keys and compose utilities instead of component classes.

```js
// tailwind.config.js
module.exports = {
  presets: [require('./mob-design/tailwind/preset.js')],
  content: ['./src/**/*.{ts,tsx,vue,svelte,html}'],
};
```

Two constraints on that path, both non-negotiable:

- **The preset's values must be `var(--mob-*)` references, not raw hex.** If it inlines hex,
  `data-mob-theme` and every retheming level in section 2 stop working, because the utilities no
  longer read the cascade.
- **Expose semantic tokens only.** `bg-canvas`, `bg-surface`, `text-primary`, `text-muted`,
  `border-subtle`, `accent`, `feedback-danger` — not the primitive ramp. Exposing dozens of raw
  values through the Tailwind config re-creates the "any value, anywhere" problem the token pipeline
  exists to prevent.

You can mix both paths — utilities for layout, component classes for controls — but pick one home
for control geometry, or a button will end up with a height in two places.

---

## 5. Governance and hygiene

Six rules. Each exists because a specific thing goes wrong without it.

1. **No literal colour in a component.** Not a hex, not an `rgba()`, not an `hsl()`. A literal colour
   is invisible to the theme switch, to the brand override, and to every level of section 2. If you
   need a translucent value on an unknown surface, use the alpha ladder (`--mob-white-08`,
   `--mob-black-40`); that is what it is for.
2. **No new radius or duration without a system decision.** Radius is keyed to control size on
   purpose — the 8/9/10px triple means an S and an L button read as one family. A 7th radius makes two
   controls that are almost the same shape, which registers as sloppiness rather than as variety.
   Same for duration: five steps (80/120/160/220/260ms) is the whole interaction vocabulary.
3. **No variant for a one-off.** One occurrence: compose it at the call site from existing
   primitives. Two: still compose, and leave a note. Three: propose a variant. Three is where the
   permanent API cost — paid by everyone who ever reads the component's prop list — drops below the
   cost of the duplication.
4. **No ad-hoc control height.** Change the `size` step. A button with a hand-set height is the
   "random 1px differences between same-size controls" anti-pattern arriving one commit at a time.
5. **Type comes from a role, not a size.** If a screen needs a size that is not in `base.css`, either
   the screen is wrong or the scale needs a new role. That is a system decision, not a screen
   decision.
6. **Focus rings are never deleted.** A component may refine the ring; it may not remove it. The
   source prototype omitted keyboard focus entirely — the system does not repeat that.

### 5.1 Proposing a new token

Open it as a change to `tokens.css`, with four things:

- **What it is** and the tier it belongs in. New values almost always belong in tier 2 (a new
  semantic role) or tier 3 (a calibrated component value). Tier 1 changes only when the ramp
  genuinely lacks a step.
- **Why no existing token works.** Name the closest one and say what is wrong with it. Most proposals
  die here, correctly.
- **Three call sites.** Fewer than three and it is a one-off (rule 3).
- **A provenance marker.** `[src]` if measured from a calibrated surface, `[drv]` plus the rule it
  was derived by. An unmarked value is a value nobody can later audit.

Tier-3 component tokens are the pressure valve. A card's 15/16px padding does not land on the public
spacing scale, and that is fine — parking it in tier 3 keeps the public scale clean *and* keeps
repetition exact, so two cards can never drift a pixel apart. Reach for tier 3 before you reach for
a new primitive.

### 5.2 CI checks

Four greps. They are crude on purpose: they run in a second, need no toolchain, and catch the
failures that actually happen.

```sh
#!/usr/bin/env bash
# bin/mob-lint.sh — run from the repo root. Exits non-zero on any violation.
set -uo pipefail
export LC_ALL=C          # comm requires both inputs sorted in the same collation
SRC=${1:-src}
SYS=mob-design/css
fail=0

# 1. Literal colour outside the token layer.
if grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' "$SRC" \
     --include='*.css' --include='*.scss' --include='*.tsx' --include='*.jsx' \
     --include='*.vue' --include='*.svelte' \
   | grep -v 'mob-lint-ok'; then
  echo "FAIL: literal colour outside the token layer (use var(--mob-*) or the alpha ladder)"
  fail=1
fi

# 2. Tokens referenced but never defined (typos, deleted tokens, stale copy-paste).
#    Only references WITHOUT a fallback are checked: `var(--x, 12px)` is a
#    deliberate optional override and is allowed to be undefined.
#    Note the sed: do NOT pipe through `tr -d '[:space:]:'` — it eats the newlines
#    too and collapses the whole list onto one line, so comm compares nothing.
grep -rhoE 'var\(--mob-[a-z0-9-]+\)'         "$SRC" "$SYS" | sed 's/^var(//; s/)$//'  | sort -u > /tmp/mob-used
grep -rhoE '\-\-mob-[a-z0-9-]+[[:space:]]*:' "$SYS"        | sed 's/[[:space:]]*:$//' | sort -u > /tmp/mob-defined
if comm -23 /tmp/mob-used /tmp/mob-defined | grep .; then
  echo "FAIL: the tokens above are used but not defined in $SYS"
  fail=1
fi

# 3. Off-system radius (0 and 50% are allowed: squared-off seams, true circles).
if grep -rnE 'border-radius:[[:space:]]*[0-9]' "$SRC" --include='*.css' \
   | grep -vE 'var\(--mob-radius|50%|:[[:space:]]*0[;[:space:]]'; then
  echo "FAIL: hardcoded radius — use var(--mob-radius-*)"
  fail=1
fi

# 4. Off-system duration.
if grep -rnE '(transition|animation)[^;]*[0-9]+m?s' "$SRC" --include='*.css' \
   | grep -v 'var(--mob-duration'; then
  echo "FAIL: hardcoded duration — use var(--mob-duration-*)"
  fail=1
fi

exit $fail
```

Add a fifth if type drifts in your codebase:

```sh
grep -rnE 'font-size:[[:space:]]*[0-9.]+(px|rem)' "$SRC" --include='*.css' | grep -v 'var(--mob-size'
```

Notes from running it against this repo:

- Check 1 scans `$SRC` only, never `$SYS` — the system's own CSS is *supposed* to contain hexes, and
  its `[src]` provenance comments quote them. It still has false positives in app code: a CSS id
  selector like `#abc`, a hex string in test data. The escape hatch is a trailing
  `/* mob-lint-ok */` on the line, which keeps every exception visible and greppable instead of
  silently widening the rule.
- Check 2 deliberately matches only `var(--mob-x)` with no fallback. `var(--mob-seg-pad-x,
  var(--mob-card-pad-x))` is an optional override hook — undefined on purpose — and flagging it
  would train people to ignore the check.
- Check 2 is the highest-value of the four. A typo'd `var()` renders as *nothing at all* in CSS, so
  a misspelled token survives code review untouched and surfaces as an unstyled element three weeks
  later.

---

## 6. Migration into an existing codebase

Four phases, in this order. Each is shippable on its own; none requires the next.

**Phase 1 — tokens.** Import `tokens.css` and nothing else. It declares custom properties and cannot
change a pixel, with the single exception noted in 1.2: `color-scheme: dark` on `:root` alters native
form-control and scrollbar rendering. If that is disruptive on day one, re-scope the token block from
`:root` to a wrapper class of your own — the system ships no such class — or strip the `color-scheme`
line until phase 4. Tokens go first because
every later phase references them; adopting them later means writing each phase twice.

**Phase 2 — type roles.** Import the type-role and tone-utility half of `base.css` and start applying
`.mob-title`, `.mob-value`, `.mob-meta`, `.mob-label`, `.mob-heading-*`. Highest visual return per
line changed, and the lowest risk: these rules set family, size, weight, tracking and colour — not
layout. Do it second because the mono/sans split is the identity, so this is the phase where the
screens start looking like the system, and it forces the "which of these is a number and which is
prose?" audit early, while it is still cheap.

Note that importing `base.css` wholesale also restyles `body`, links, scrollbars and focus. That is
usually desirable; if it is not yet, copy the type-role block first and take the rest in phase 3.

**Phase 3 — controls.** Buttons, inputs, chips, tabs. This is where the geometry contract lands:
heights of 30/34/40px, `--mob-control-px-*` padding, radius tracking size, the focus ring, the
coarse-pointer hit-target floor. It comes after type because control labels are type, and before
layout because layout depends on control heights — the source dashboard aligns two columns on a 34px
header row, which is only stable once controls have their real heights.

**Phase 4 — layout.** Containers, gutters, density zones, section rhythm, the reset. Largest diff,
most regression risk, so it needs everything under it to be stable — and it is the cheapest phase to
defer, because a gutter that is 4px wrong is far less visible than a button that is the wrong shape.
Take `reset.css` here rather than in phase 1: it is the only file with unconditional global effects
(box-sizing, margin zeroing, list styles), and dropping it into a mature codebase on day one
guarantees a day of unrelated breakage.

Throughout: run both systems side by side. `@layer` (section 1.2) makes the boundary explicit — put
legacy CSS in the `app` layer and it wins wherever the two overlap, so migration is subtractive and
you can delete legacy rules one at a time and watch the system take over.

---

## 7. Definition of done

Adapted from the source specification, section 28. The system is complete when someone can build a
new screen without opening a reference product to guess how it should look.

A new screen must be derivable, end to end, from:

| # | Source | Where it lives |
|---|---|---|
| 1 | Semantic tokens | `css/tokens.css`, tier 2 |
| 2 | Type roles | `css/base.css` — `.mob-display-*`, `.mob-heading-*`, `.mob-title`, `.mob-figure-*`, `.mob-body*`, `.mob-value*`, `.mob-meta*`, `.mob-label` |
| 3 | Grid and layout rules | `--mob-container-*`, `--mob-gutter-*`, `--mob-grid-gap`, `--mob-stack-gap`, `--mob-section-gap` |
| 4 | Component library | `css/components/` |
| 5 | State matrix | default / hover / focus / pressed / selected / disabled / loading / error, per component |
| 6 | Motion rules | `--mob-duration-*`, `--mob-ease-*`, `--mob-press-scale`; transform and opacity only |
| 7 | Responsive rules | `--mob-bp-*`, the density zones, the mobile rhythm overrides |
| 8 | Composition patterns | page shell, hero, section rhythm, grouped cards, danger zone |

**Nothing arbitrary may be left over.** Concretely, before a screen ships:

- [ ] every colour resolves to a `var(--mob-*)` — `bin/mob-lint.sh` passes;
- [ ] every type size comes from a role, not a declaration;
- [ ] every control height comes from a size step;
- [ ] every radius and duration comes from a token;
- [ ] the density zone is declared on the section, not inherited by accident;
- [ ] every interactive element has default, hover, focus and disabled states, and focus is visible;
- [ ] loading states do not shift layout;
- [ ] repeated controls have identical dimensions;
- [ ] the screen has exactly one primary focal point, and at most one accent-filled element in view;
- [ ] contrast checked — and if the product has to certify AA, `css/a11y.css` is loaded and
      `data-mob-a11y="AA"` is set, rather than the failing tokens being re-picked locally;
- [ ] keyboard path walked, coarse-pointer targets checked.

**And the rule that keeps the system honest:** if a screen repeatedly needs arbitrary values, the
system is incomplete. That is a bug to file against `tokens.css` or the component library — using the
proposal form in 5.1 — not a value to inline and move on from. An inlined value is a defect that has
been hidden; a filed proposal is a defect that can be fixed once for everyone.
