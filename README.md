# mob-design

A dark-native design system for dense product UI. The canvas is near-black (`#0a0b0d`) and depth
comes from a surface plus a 1px border — never a drop shadow. Type is dual-family by role: IBM Plex
Mono with tabular numerals for every number, control label and piece of metadata; a system sans at
600 / -0.02em for headings and for figures at 22px and up. The crossover is deliberate — a 16px
figure stays mono so it still aligns in a column, a 22px figure goes sans so it reads as a headline.
Fused segments are separated by 1px *gaps* over a frame-coloured parent, not by borders, so a row of
range buttons or KPIs reads as one object rather than four boxes. Action tones are muted at rest —
"money in" and "danger" are legible in a table row without the row glowing — and saturation is spent
only on hover. Accent is scarce: one primary action per group, and the violet appears almost nowhere
else. Three declared density zones (`marketing`, `product`, `data`) move section rhythm and card
padding without moving control geometry, so a landing page and a data grid stay recognisably the
same product.

It ships as source. Plain CSS with custom properties, no dependencies, no build step: 14 component
stylesheets carrying 606 classes, about 11,000 lines of CSS in total.

---

## Provenance, and what `[src]` means

mob-design is the fusion of two documents. The first was a system-level specification — the right
structure, the right rules, and `CALIBRATE` where most of the numbers should have been. The second
was a measured handoff for one real screen, a dense financial dashboard, with actual hex values,
paddings and type sizes. The spec had no values; the handoff had no system.

So every value in `css/tokens.css` carries its origin:

```css
--mob-gray-925:  #101114;  /* [src] card + segment surface  */
--mob-gray-680:  #33373e;  /* [drv] strong border, hover    */
```

- **`[src]`** — measured from the calibrated handoff. It is what a real screen actually used.
- **`[drv]`** — derived, by a rule stated next to it, to fill a gap the handoff never had to answer.

This matters when you disagree with a value. A `[src]` value is evidence — something shipped and
looked right at that number, so change it deliberately. A `[drv]` value is an extrapolation, and if
your product proves it wrong, it is wrong. Know which one you are overriding.

The dashboard is only where the numbers came from. Nothing in the system is about dashboards.

---

## Quick start

**1 — Get the files.** Vendor `mob-design/` into your repo, or install it as a package. Nothing
depends on a build step.

**2 — One entry file, imported once.** The order is the contract; `@layer` makes the win order
explicit and guarantees your app CSS beats the system without a specificity fight.

```css
/* app/mob.css */
@layer mob, app;
@import url('../mob-design/css/mob.css') layer(mob);
```

`css/mob.css` pulls in reset → tokens → base → components → utilities in the correct order.
`brand.css` and `a11y.css` are deliberately *not* included; see [Optional layers](#optional-layers).
If you would rather import component files individually — to drop the ones you do not use — see
[docs/09-adoption.md](docs/09-adoption.md) §1.2 for the explicit layered form.

**3 — What goes on `<html>`.**

```html
<html lang="en" data-mob-theme="dark">
```

`dark` is the default and the mode the system was calibrated in. `light` is a `[drv]` role inversion
— read §2.2 of the adoption doc before shipping it. There is no automatic OS switch on purpose:
silently serving the derived light mode hands users an uncalibrated product.

`data-mob-density` goes on **sections, not on `<html>`**. It is a subtree property and a real page
uses more than one zone.

**4 — Fonts.** The system does not fetch them for you. One webfont, three weights:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap">
```

The sans family has no webfont at all — `--mob-font-sans` is a system stack, so headings paint on
the first frame at zero network cost. If the mono webfont never loads, the fallback chain is
entirely monospaced, so tabular alignment and column widths survive intact. Self-hosting and
subsetting are covered in [docs/09-adoption.md](docs/09-adoption.md) §1.4.

---

## Your first screen

Every class below is in the shipped CSS.

```html
<body class="mob-page">
  <div class="mob-shell mob-shell--stack" data-mob-density="product">
    <section class="mob-section">

      <div class="mob-section__head mob-section__head--split">
        <div>
          <p class="mob-section__eyebrow">Treasury</p>
          <h1 class="mob-section__heading">Positions</h1>
        </div>
        <div class="mob-section__actions">
          <button class="mob-btn mob-btn--secondary mob-btn--sm">Export</button>
          <button class="mob-btn mob-btn--primary mob-btn--sm">New position</button>
        </div>
      </div>

      <div class="mob-kpi-row">
        <div class="mob-card">
          <div class="mob-card__header">
            <h2 class="mob-card__title">Net value</h2>
            <span class="mob-card__meta">live</span>
          </div>
          <div class="mob-card__body">
            <div class="mob-stat mob-stat--lg">
              <span class="mob-stat__label mob-label">TOTAL</span>
              <div class="mob-stat__value">$31.12</div>
              <div class="mob-stat__sub">across 5 pools</div>
            </div>
            <span class="mob-delta" data-mob-sign="positive">
              <span class="mob-delta__glyph" aria-hidden="true"></span>
              <span class="mob-delta__value">+0.67%</span>
              <span class="mob-delta__label">24h</span>
            </span>
          </div>
        </div>
      </div>

    </section>
  </div>
</body>
```

Three things to notice. `.mob-page` paints the canvas itself rather than relying on `<body>`, so a
shell rendered into an iframe or a portal still sits on the right ground. The density annotation
sits on the shell, not the root. And `.mob-delta__glyph` is empty on purpose — the arrow is drawn in
CSS and rotated for sign, so an arrow and its opposite can never drift apart.

---

## What lives where

```text
mob-design/
  css/
    mob.css          entry point — import this
    reset.css        opinionated only where the system has an opinion
    tokens.css       THE source of truth: primitive → semantic → component
    base.css         type roles, tone utilities, the global focus contract
    brand.css        optional: derive the whole accent family from one hex
    a11y.css         optional: opt-in AA hardening
    components/      14 stylesheets, one per component family
  tokens/            W3C design-token JSON — hand-maintained mirrors of tokens.css
  tailwind/preset.js alternative consumption path
  docs/              the written system
```

**Read first:** [docs/00-principles.md](docs/00-principles.md), then `css/tokens.css` itself. The
token file is commented as documentation and explains why the neutral ramp is dense at the dark end,
which is the single decision the whole look rests on.

| Doc | What it answers |
|---|---|
| [00-principles.md](docs/00-principles.md) | The twelve rules. When a token and a rule disagree, the rule is right. |
| [01-foundations.md](docs/01-foundations.md) | Every value: colour, type, space, border, radius, elevation. |
| [02-components.md](docs/02-components.md) | Each component's anatomy, variants, states and required markup. |
| [03-patterns.md](docs/03-patterns.md) | What goes in a region, in what order, and what happens when data is missing. |
| [04-templates.md](docs/04-templates.md) | Whole pages with the decisions already made, including where the primary action lives. |
| [05-motion.md](docs/05-motion.md) | Motion as confirmation, not effect. Durations, easings, reduced-motion policy. |
| [06-accessibility.md](docs/06-accessibility.md) | Measured contrast per token, focus, keyboard paths, names. |
| [07-data-formatting.md](docs/07-data-formatting.md) | Numbers, currency, precision, zero vs unknown, live updates without jitter. |
| [08-content-style.md](docs/08-content-style.md) | Interface copy as a component with a size budget. |
| [09-adoption.md](docs/09-adoption.md) | Install, retheming, migration, governance, the Tailwind path. |
| [10-anti-patterns.md](docs/10-anti-patterns.md) | What breaks *this* system specifically, and what to do instead. |
| [11-figma.md](docs/11-figma.md) | Keeping the design tool's representation from drifting from the CSS. |
| [12-qa-checklist.md](docs/12-qa-checklist.md) | The pass/fail gate a screen clears before it ships. |

---

## Is this for you?

**Good at:** dense product surfaces where a lot of information has to coexist without shouting.
Data-heavy screens — tables, KPI rows, meters, sparklines, composition bars — get first-class
components rather than afterthoughts. Dark-first products. Teams that need consistency actually
enforced, because the token tiers make a literal hex inside a component a reviewable defect rather
than a matter of taste.

**Not:** a component framework. There is no JavaScript, and none is coming. A modal has no focus
trap, a menu has no keyboard controller, a toast does not dismiss itself, a sortable column header
does not sort. The CSS gives you the surface, the states and the anchoring; you wire the behaviour,
and the component docs say exactly what you owe each one.

**Also not:** a marketing template. There is a `marketing` density zone and it composes a landing
page fine, but nothing here is a hero-with-gradient kit. And it is not a light-first design — light
mode exists, it is honestly labelled `[drv]`, and it has not been calibrated against a real screen
the way dark has.

---

## Optional layers

| Layer | Pull it in when |
|---|---|
| `css/brand.css` | You need it to be your colour. Set `--mob-brand` once and the accent family, tint and glow derive from it in oklab, preserving the luminance relationships that make the default violet work. Import after `mob.css`. Check the contrast on the primary action afterwards — the default pair is already at the edge. |
| `css/a11y.css` | You have a contractual AA obligation. Inert until you set `<html data-mob-a11y="AA">`, and it is just token overrides, so you can scope it to one section. See below for exactly what it changes. |
| `tailwind/preset.js` | Your team writes Tailwind. It maps the **semantic tier only** — primitives are unreachable from a class name on purpose, so `bg-gray-925` cannot become a legitimate-looking way to write a card. Every value is `var(--mob-*)`, so theme switching keeps working through utility classes. |
| `tokens/*.json` | Something that cannot read CSS custom properties needs the values: Figma variables, Tokens Studio, Style Dictionary, a native platform, a lint rule. These are hand-maintained mirrors — if they disagree with `tokens.css`, the CSS is right and the JSON is the defect. |

---

## Accessibility status

Most of the palette is comfortable. Primary text measures 15.7:1 on a card; the status hues sit
between 6.8:1 and 11.3:1. Four values in the calibrated defaults do not clear their threshold:

| Pair | Ratio | Needs |
|---|---|---|
| White on `--mob-accent` `#7c5dfa` — the filled primary button label | **4.37** | 4.5 (13px is not large text; weight does not exempt it) |
| `--mob-fg-label` `#767c86` on a card surface | **4.49** | 4.5 (it clears on the canvas at 4.69 and misses from surface upward) |
| `--mob-fg-dim` `#5d636c` | **3.12** | 4.5 |
| `--mob-accent-deep` `#5b3fd6` as a filled non-text mark | **2.81** | 3.0 |

These are `[src]` values — the design shipped with them. Rather than quietly "fixing" a design the
source declared final, or shipping the failures unremarked, the defaults stay calibrated and
`css/a11y.css` swaps exactly those four for measured replacements when you opt in. It also raises
`--mob-accent-hover` (a consequence of moving the accent) and the field border where a border is the
only thing identifying a control. Nothing else changes, and the accent shift is small enough
(ΔE76 1.70) that the brand does not visibly move.

One honest consequence: under AA hardening the primary button's hover **darkens** instead of
lightening, because "lighter" and "higher contrast with white" are mutually exclusive. It reads
fine; it is simply not what the prototype did.

Contrast is the floor, not the goal. Reduced motion is honoured globally in `reset.css` and no
component may opt out. Everything else — reading order, keyboard paths, accessible names — is yours,
and [docs/06-accessibility.md](docs/06-accessibility.md) is the concrete list.

---

## Browser support

Chrome/Edge 111+, Safari 16.2+, Firefox 121+ — the floor is `color-mix()` on Chrome and Safari,
`:has()` on Firefox. In practice: any browser from 2024 onward.

- **`color-mix()`** (73 uses) — has no fallback. On an engine that cannot parse it the custom
  property is invalid at computed-value time, which means hover tints and derived tones fall back to
  inherited or unset colours. This is the hard floor; the system does not degrade gracefully below
  it.
- **`:has()`** (46 uses) — the selector is dropped whole where unsupported. What you lose is spacing
  and layout compensation (a toast that has a title, a disabled choice row), never structure.
- **`:focus-visible`** — `reset.css` removes the default `:focus` outline because `base.css`
  guarantees a replacement. On an engine without `:focus-visible` there is no focus ring at all, so
  do not ship to one.
- **`dvh`** — used for full-height shells, modals and drawers. Where unsupported the declaration is
  dropped and the block is content-height. Cosmetic.
- **Logical properties** — used throughout (`inline-size`, `padding-block`, `margin-inline`). This
  is what makes the system RTL-correct without a second stylesheet.
- **CSS anchor positioning** — behind `@supports (anchor-name: --mob-a)`. Menus, popovers and
  tooltips fall back to ordinary absolute positioning everywhere else, which is the majority of
  traffic today. `transition-behavior: allow-discrete` is guarded the same way.

---

## Contributing

The governance model — who may add a token, what has to be true before a component earns a name, how
to keep the JSON mirrors and the Figma library from drifting, and how to migrate an existing
codebase onto this system — is in [docs/09-adoption.md](docs/09-adoption.md).

Two rules worth stating here, because they are the ones that decay first. A literal hex inside a
component stylesheet is a bug. And a documented class that does not exist is worse than an
undocumented one that does: it costs a reader their trust in every other line.

---

## License

MIT.
