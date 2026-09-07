# 02 — Components

This is the API reference. Every class, attribute and custom property named below was read
out of the shipped CSS in `css/components/`. If a name is not here, it does not exist — and
if you need behaviour that is not here, the answer is a token override or a new component,
never a hand-written value.

---

## How to read this document

### Naming

```
.mob-card                block      the thing itself
.mob-card--featured      modifier   a variant of the thing; never used alone
.mob-card__title         element    a part of the thing; only valid inside it
```

Three exceptions to "modifier never used alone", all deliberate:

- **Slot classes** (`.mob-modal__dismiss`, `.mob-column-header__chip`, `.mob-navbar__account`)
  place a control; they do not style it. Mix them onto a real component:
  `class="mob-icon-btn mob-modal__dismiss"`.
- **Co-classes** — `.mob-search` is not a block. It is a second class on `.mob-input-wrap`
  that unlocks the four search slots.
- **Names that are the default.** `.mob-chip--neutral`, `.mob-chip--outline`,
  `.mob-chip--md` and `.mob-stat--md` **match no rule at all** — the values they would carry
  are already on the block, and restating them would give the system two sources for one
  number. `.mob-btn--md`, `.mob-card--static` and `.mob-segmented__seg--grow` **do** exist and
  restate the default explicitly, for authors who prefer to be. Either way a component API may
  emit them unconditionally and nothing changes.

Modifiers are **classes**. There is no `data-mob-variant` or `data-mob-size` attribute in this
system — nothing in `css/` selects on either — and this document is the authority on the
modifier API.

### State is native, or it is a data attribute — never `.is-*`

There is no `.is-active`, `.is-open`, `.is-selected` anywhere in this system. State is
expressed three ways, in this order of preference:

| Mechanism | Used for | Examples |
|---|---|---|
| Native pseudo-class | anything the browser already knows | `:hover` `:active` `:focus-visible` `:disabled` `:checked` `:indeterminate` `:placeholder-shown` `[readonly]` |
| ARIA attribute | anything assistive tech must also be told | `aria-selected` `aria-pressed` `aria-current` `aria-checked` `aria-expanded` `aria-disabled` `aria-sort` `aria-invalid` `aria-busy` |
| `data-mob-*` | state ARIA has no word for | `data-mob-loading` `data-mob-error` `data-mob-active` `data-mob-dim` `data-mob-state` |

Keying selection off `aria-selected` rather than a class is not stylistic. It means the
paint and the announcement cannot disagree: get the markup right and the visuals come free;
get the markup wrong and the component looks wrong, which is a bug you can see.

**Boolean `data-mob-*` attributes are presence-based.** Render the attribute only when true.
In React: `data-mob-selected={selected || undefined}`. Never the string `"false"` — an
attribute selector matches on presence, so `data-mob-selected="false"` reads as selected.

Valued attributes and their complete accepted values:

| Attribute | Values | Host |
|---|---|---|
| `data-mob-state` | `open` `closed` | overlays, `.mob-enter` |
| `data-mob-side` | `top` `bottom` `start` `end` | tooltip, popover, menu |
| `data-mob-tone` | `info` `success` `warning` `error` | toast, alert, banner, progress |
| `data-mob-tone` | `positive` `negative` `neutral` `warning` `info` (+ `success`/`error` aliases) | meter, gauge |
| `data-mob-sign` | `positive` `negative` `neutral` | any text, `.mob-stat`, `.mob-delta`, `.mob-spark` |
| `data-mob-series` | `1`–`8`, `accent` | card, segment, list row, avatar, bin, swatch, segment |
| `data-mob-density` | `marketing` `product` `data` | any container |
| `data-mob-theme` | `light` (and whatever scopes you define) | any container |
| `data-mob-a11y` | `AA` | any container, requires `a11y.css` |

Absent `data-mob-state` means **open**. An overlay or `.mob-enter` block with no attribute
is visible and interactive, which is what server-rendered HTML and static documentation
pages need.

Boolean attributes, and every block that honours each one:

| Attribute | Honoured on |
|---|---|
| `data-mob-loading` | `.mob-btn` `.mob-icon-btn` `.mob-chip` `.mob-card` `.mob-list-row` `.mob-checkbox` `.mob-radio` `.mob-toggle` `.mob-segmented-control` `.mob-field` `.mob-input-wrap` `.mob-stat` `.mob-navlink` `.mob-sidebar__item` `.mob-tabs` `.mob-popover` `.mob-menu` `.mob-menu__item` `.mob-modal` `.mob-drawer` `.mob-meter` `.mob-bar-stack` `.mob-spark` `.mob-delta` `.mob-legend` `.mob-gauge`, and the four feedback `__action` / `__retry` slots |
| `data-mob-error` | `.mob-btn` `.mob-icon-btn` `.mob-card` `.mob-segmented` `.mob-list-row` `.mob-stat` `.mob-meter` `.mob-meter-frame` `.mob-bar-stack` `.mob-spark` `.mob-delta` `.mob-legend` `.mob-gauge` |
| `data-mob-selected` | `.mob-card` `.mob-segmented` `.mob-segmented__seg--interactive` `.mob-list-row` `.mob-segmented-control__item` `<tr>` |
| `data-mob-disabled` | `.mob-card` `.mob-list-row` `.mob-segmented__seg--interactive` `.mob-input-wrap` |
| `data-mob-invalid` | `.mob-field` `.mob-input-wrap` `.mob-input` `.mob-textarea` `.mob-select` `.mob-checkbox` `.mob-radio` `.mob-toggle` `.mob-segmented-control` `<tr>` |
| `data-mob-interactive` | `.mob-chip` (required), `.mob-table`, `<tr>` |
| `data-mob-active` | `.mob-meter__bin` (the bucket holding the value), `.mob-menu__item` (the `aria-activedescendant` row) |
| `data-mob-dim` | `.mob-meter__bin` `.mob-bar-stack__seg` `.mob-legend__item` `.mob-spark` `.mob-gauge` |
| `data-mob-filled` / `data-mob-over` / `data-mob-placeholder` | field: value present · counter over limit · select showing its prompt |
| `data-mob-open` | `.mob-navbar__drawer` |
| `data-mob-scrolled` | `.mob-navbar` |
| `data-mob-collapsed` | `.mob-sidebar--collapsible` |
| `data-mob-leaving` | `.mob-toast` |

### The control-geometry contract

A button and an input of the same size step are the same height to the pixel, top and
bottom, because both read the same four tokens:

| Step | `--mob-control-h-*` | `--mob-control-px-*` | radius | icon box |
|---|---|---|---|---|
| `sm` | 30px | 10px | `--mob-radius-sm` 8px | `--mob-control-icon` 16px |
| `md` | 34px | 15px `[src]` | `--mob-radius-md` 9px | 16px |
| `lg` | 40px | 18px | `--mob-radius-lg` 10px | `--mob-control-icon-lg` 20px |

`--mob-control-gap` (6px `[src]`) is the icon-to-label distance everywhere. Radius tracks
height on purpose (8/9/10): an S and an L control must read as one shape family seen at two
scales.

Who reads the ladder: `.mob-btn`, `.mob-field` / `.mob-input-wrap`,
`.mob-segmented-control`, `.mob-navlink` (S), `.mob-sidebar__item` (S), `.mob-menu__item`
(S). `.mob-tab` sits on `--mob-header-row-h` (34px), the same band as a column header, so a
tab strip and a column title line up.

**Two defaults differ, and it is the one trap in the contract.** A bare `.mob-btn` is M
(34px); a bare `.mob-field` / `.mob-input` is L (40px). Put them on the same row and they
will not match. Pick the step explicitly on both sides — `.mob-btn` + `.mob-field--md`, or
`.mob-btn--lg` + `.mob-field`.

`.mob-icon-btn` is deliberately **off** the ladder: 32/40/48. A text control is sized by its
line; an icon button is sized by its target.

### The focus contract

`base.css` gives every `:focus-visible` element `--mob-focus-ring` (2px canvas + 2px accent)
and stamps `--mob-radius-sm` on it. Components **refine** that ring; they never delete it.
Three sanctioned refinements, and you will see all three below:

- **Restate the radius.** A card, a pill tab or a 6px chip would otherwise square off to 8px
  on tab. `border-radius: var(--mob-card-radius)` alongside the ring fixes it.
- **Draw it inside** — `--mob-focus-ring-inset`, or an `outline` with a negative
  `outline-offset`. Required wherever the parent clips: `.mob-btn-group`,
  `.mob-segmented-control`, `.mob-segmented`, `.mob-menu`, `.mob-table-scroll`,
  `.mob-scroll-x--fade`.
- **Re-base it onto the local surface.** The global ring's inner band is `--mob-bg-canvas`,
  which reads as a hole on an elevated or tinted panel. `--mob-feedback-ring-bg` and
  `--mob-dataviz-ring-bg` exist for exactly this.

### Token overrides

Every component token below can be re-declared on the block itself, on any ancestor, or on
`:root`. Two conventions matter:

- Values a consumer is *expected* to change (`--mob-seg-basis`, `--mob-avatar-tint`,
  `--mob-menu-w`, `--mob-meter-bins`, `--mob-bar-weight`) are read through a `var(…,
  fallback)` at the point of use and are often **not** declared at `:root`. That is
  deliberate: an undeclared property re-resolves on the element that uses it, so density
  zones, nested themes and subtree overrides keep working, and a value set on an ancestor is
  never stomped by a declaration on a child.
- `--mob-bar-weight`, `--mob-gauge-value` and `--mob-gauge-threshold` are **data**, not
  design. Set them per instance from the value you are drawing. Never give them a `:root`
  default — a root value is "set", and the component could then no longer tell a missing
  datum from a real zero.

`[src]` = measured in the calibrated handoff. `[drv]` = derived by a stated rule.

### Load order

`css/mob.css` imports reset → tokens → base → layout → button, field, choice → chip, card,
stat, table → nav → overlay → feedback → dataviz → motion → utilities. Utilities load last
so a utility outranks a component rule of equal specificity on source order alone. Nothing
in this system uses `!important`.

### What is not in here

Type roles (`.mob-title`, `.mob-label`, `.mob-value`, `.mob-meta`, `.mob-meta-sm`,
`.mob-dim`, `.mob-figure-sm|md|lg|xl`, `.mob-heading-sm|md|lg|xl`, `.mob-display-md|lg|xl`,
`.mob-body`, `.mob-body-sm`, `.mob-body-lg`, `.mob-value-sm`, `.mob-control-label`),
tone utilities (`.mob-tone-primary|secondary|muted|label|dim|accent|positive|negative|warning|info`)
and the text helpers `.mob-nums`, `.mob-truncate`, `.mob-nowrap`, `.mob-sr-only` all live in
`base.css` and are documented in `01-foundations.md §3`. Components reference them; they do
not redeclare them.

---
---

# Layout

`components/layout.css`. Nothing here is interactive, so nothing here ships hover, pressed or
disabled states — the states matrix applies to controls, not to containers. What this file
owns is the geometry everything else inherits.

Three rules apply to the whole group:

1. **Never set a fixed height on a layout block.** Heights come from content. The one
   exception is `.mob-column-header`, and it is a *min*-height.
2. **Put `min-inline-size: 0` on anything you build that holds dense content in a flex row.**
   `.mob-main`, `.mob-col`, `.mob-stack`, `.mob-cluster` and every `.mob-grid` child get it
   for free.
3. **Every column that stacks cards must publish `--mob-column-gap` equal to its own `gap`.**
   That is the contract `.mob-column-header` reads. See the baseline device below.

## 1. Page

The outermost block. Paints the canvas itself rather than relying on `<body>`, so a shell
rendered into an iframe, a portal or a Storybook frame still sits on the right ground.

| Class | Effect |
|---|---|
| `.mob-page` | `min-block-size:100dvh`, canvas background, primary text, page gutters |
| `.mob-page--flush` | `padding-inline: 0` — sections manage their own gutters (hero media, full-bleed sticky bars). Vertical rhythm is kept. |

Gutters are asymmetric on purpose and only the inline value is on the public scale:

| Token | Value |
|---|---|
| `--mob-page-pad-block-start` | 22px `[src]` |
| `--mob-page-pad-block-end` | 36px `[src]` |
| `--mob-page-pad-inline` | `--mob-gutter-desktop` (26px) `[src]`, → tablet ≤1023.98px, → mobile ≤639.98px |

## 2. Shell

The max-width container. One block, three widths.

| Class | `--mob-shell-max` | Layout |
|---|---|---|
| `.mob-shell` | `--mob-container-app` 1460px `[src]` | flex row, `gap: --mob-shell-gap` (20px), `align-items: flex-start` |
| `.mob-shell--content` | `--mob-container-content` 1280px | as above |
| `.mob-shell--prose` | `--mob-container-prose` 68ch | `display: block` — a reading measure is not a column system |
| `.mob-shell--stack` | inherited | `flex-direction: column; align-items: stretch` |

`align-items: flex-start` rather than `stretch` is load-bearing: columns are independent
stacks and must not be forced to the height of the tallest one. It is also what lets a rail
go `position: sticky` without first being stretched to full column height.

Below `--mob-bp-lg` (1024px) `.mob-shell` becomes a single column and keeps DOM order.

## 3. Rail and main

| Class | Effect |
|---|---|
| `.mob-rail` | fixed `--mob-rail-w` (288px `[src]`), flex column, `gap: --mob-rail-gap` (14px `[src]`); publishes `--mob-column-gap` |
| `.mob-rail--sticky` | `position: sticky` at `--mob-sticky-top`, `z-index: --mob-z-raised`; reverts to static below lg |
| `.mob-main` | `flex: 1 1 0`, **`min-inline-size: 0`**, flex column, `gap: --mob-card-gap`; publishes `--mob-column-gap` |

`min-inline-size: 0` on `.mob-main` is *the* load-bearing declaration of this file. A flex
item's automatic minimum size is its content's min-content size, so one unbreakable child —
a wide table, a long hash, a fused position card — would otherwise push the column past its
share and blow the rail off the row.

**There is no `.mob-rail--end`, deliberately.** To put the rail on the trailing side, author
it after `.mob-main` in the DOM. Using `order:` would leave the visual order sensible while
the tab order stopped matching it — WCAG 2.4.3, and explicitly banned in
`06-accessibility.md`. Authoring it in DOM order makes every axis agree for free: visual
order, tab order, the stacked order below lg, and the mirrored position under RTL.

```html
<div class="mob-page">
  <div class="mob-shell">
    <aside class="mob-rail mob-rail--sticky">…</aside>
    <main class="mob-main">…</main>
  </div>
</div>
```

## 4. Column header — the baseline device

**The signature.** Both columns open with a header row so the first card in each column
starts on the same horizontal line, whatever each column's own gap happens to be.

```
.mob-column-header                                                  min-block-size 34px
┌──────────────────────────────────────────────────────────────────┐
│ __title  __chip   __spacer ──────────────────►  __meta  __actions│
└──────────────────────────────────────────────────────────────────┘
                                                    ↕ 11px of clear space
┌──────────────────────────────────────────────────────────────────┐
│ first card                                                       │
```

The handoff reached this with two hand-tuned numbers: the rail header carried
`margin-bottom:-3px` and got +14px from the rail gap; the main header carried
`margin-bottom:11px` inside a column with no gap. Same 45px baseline, two magic numbers that
break the moment somebody edits the rail gap.

One rule replaces both. The header always leaves `--mob-column-header-gap` (11px) of clear
space, and when it sits **as a direct child** of a gapped column it subtracts that column's
own gap, which the column published as `--mob-column-gap`:

```
rail:                              34 + (11 − 14) + 14 = 45px
main:                              34 + (11 − 14) + 14 = 45px
any container with no gap:         34 +  11            = 45px
```

Change `--mob-card-gap` and both columns stay aligned. The compensating rule is scoped to
`.mob-rail >`, `.mob-main >` and `.mob-stack >` — a header nested deeper inherits
`--mob-column-gap` but must not compensate for a gap it does not sit in.

| Class | Role |
|---|---|
| `.mob-column-header` | the row |
| `.mob-column-header__title` | `flex: 0 1 auto`, `min-inline-size:0`; type role declared at zero specificity so `.mob-title` / `.mob-heading-sm` on the same element wins |
| `.mob-column-header__chip` | placement slot for a chip — does **not** style the chip |
| `.mob-column-header__spacer` | `flex: 1 1 auto`; hidden below `--mob-bp-sm` |
| `.mob-column-header__meta` | right-hand metadata, e.g. "updated 3s ago" |
| `.mob-column-header__actions` | `margin-inline-start: auto`, `gap: --mob-control-gap` — pushes right even with no `__spacer` |

Tokens: `--mob-column-header-h` (34px `[src]`), `--mob-column-header-gap` (11px `[src]`),
`--mob-column-header-gap-x` (10px `[drv]`, normalised from the prototype's 9/11px pair),
`--mob-column-gap` (published by the column, undeclared at `:root` so `var(…, 0px)` can fall
back).

Below `--mob-bp-sm` the row wraps rather than crushing the title, and the spacer is removed.
The baseline device is only meaningful while two columns sit side by side.

```html
<div class="mob-column-header">
  <h2 class="mob-column-header__title mob-title">Open positions</h2>
  <span class="mob-column-header__chip">
    <span class="mob-chip">1 ladders · 1 rungs</span>
  </span>
  <span class="mob-column-header__spacer"></span>
  <span class="mob-column-header__meta">updated 3s ago</span>
  <div class="mob-column-header__actions">
    <button class="mob-icon-btn mob-icon-btn--sm mob-icon-btn--quiet" aria-label="Refresh">↻</button>
  </div>
</div>
```

**Accessibility.** `__title` is a placement slot, not a heading. Render a real `<h2>`/`<h3>`
at the right level for the page outline. `__meta` is decorative-adjacent — if freshness is
information the user must act on, put it in a live region, not here.

## 5. Stack and cluster

Vertical and horizontal rhythm. `.mob-stack` publishes `--mob-column-gap`, so it also drives
the baseline device.

| Class | Effect |
|---|---|
| `.mob-stack` | flex column, `gap: --mob-stack-gap` (14px, moves with density) |
| `.mob-stack--tight` / `--loose` | gap 8 / 24 |
| `.mob-stack--center` | `align-items: center` |
| `.mob-stack--start` | `align-items: flex-start` — children keep their natural width |
| `.mob-cluster` | flex row, **wraps**, `align-items:center`, `gap: --mob-cluster-gap` (10px `[src]`) |
| `.mob-cluster--tight` / `--loose` | gap 6 / 16 |
| `.mob-cluster--between` / `--end` | `justify-content: space-between` / `flex-end` |
| `.mob-cluster--baseline` | `align-items: baseline` — a label and its right-hand meta on one text baseline |
| `.mob-cluster--nowrap` | `flex-wrap: nowrap` |

## 6. Grid, column grid

| Class | Effect |
|---|---|
| `.mob-grid` | `auto-fit`, `minmax(min(--mob-grid-min, 100%), 1fr)`, `gap: --mob-grid-gap` |
| `.mob-grid--fill` | `auto-fill` — keeps empty tracks so items stay on a rhythm across rows |
| `.mob-grid--2` `--3` `--4` | explicit counts via `--mob-grid-cols`; `minmax(0, 1fr)` tracks |

`--mob-grid-min` is 240px `[drv]`, 280px in the marketing zone, 200px in the data zone. The
`min(…, 100%)` guard is what makes a grid drop to one column instead of overflowing when the
track floor is wider than the container. `.mob-grid > *` gets `min-inline-size: 0`.

At ≤1023.98px `--3`/`--4` collapse to 2; at ≤639.98px all three collapse to 1.

The page grid is separate:

| Class | Effect |
|---|---|
| `.mob-cols` | `repeat(--mob-cols-count, minmax(0,1fr))`, `gap: --mob-grid-gap` |
| `.mob-col` | `grid-column: span var(--mob-col-span, 1)`, `min-inline-size:0` |
| `.mob-col--1` … `.mob-col--12` | set the span |
| `.mob-col--full` | `grid-column: 1 / -1` at any column count |

`--mob-cols-count` is 12 / 8 / 4 by breakpoint. Spans are **clamped** rather than allowed to
overflow: a `--12` becomes 8 on tablet and 4 on mobile, so a desktop layout never produces a
horizontal scrollbar.

```html
<div class="mob-cols">
  <div class="mob-col mob-col--8">…</div>
  <div class="mob-col mob-col--4">…</div>
</div>
```

## 7. Section

Section rhythm: eyebrow → heading → support → content → actions.

| Class | Effect |
|---|---|
| `.mob-section` | `margin-block-end: --mob-section-gap`; zeroed on `:last-child` |
| `.mob-section__head` | flex column, `gap: --mob-section-head-gap`, `margin-block-end: --mob-section-head-space` |
| `.mob-section__head--split` | row, `align-items: flex-end`, `space-between`, wraps; stacks below `--mob-bp-sm` |
| `.mob-section__eyebrow` | uppercase micro-label — zero-specificity default |
| `.mob-section__heading` | sans 600, `--mob-size-4xl` — zero-specificity default |
| `.mob-section__support` | sans, relaxed leading, capped at `--mob-container-prose`, `text-wrap: pretty` |
| `.mob-section__actions` | flex row, wraps, `gap: --mob-control-gap`, `margin-block-start: --mob-section-actions-space` |
| `.mob-section--center` | centres the head, the support measure and the actions. Long paragraphs stay left-aligned by policy. |

The three type roles are declared inside `:where()` so any `base.css` type class placed on
the same element wins without an `!important`.

Density moves the rhythm: `--mob-section-head-gap` 12/10/6, `--mob-section-head-space` and
`--mob-section-actions-space` 40/24/12 for marketing/product/data.

## 8. Divider, spacer, sticky

`.mob-divider` is painted as a **background**, not a border, so the same block works as
`<hr>`, `<div>` or a flex/grid child, and so the horizontal and vertical forms are one
component instead of two.

| Class | Effect |
|---|---|
| `.mob-divider` | 1px block-size, full width, `--mob-border-subtle` |
| `.mob-divider--vertical` | 1px inline-size, `align-self: stretch`, `--mob-border-frame` (the fused-card seam colour) |
| `.mob-divider--subtle` / `--frame` / `--strong` | rebind `--mob-divider-color` |
| `.mob-divider--bleed` | cancels the card's inline padding: `margin-inline: calc(-1 * var(--mob-card-pad-x))` |
| `.mob-spacer` | `flex: 1 1 auto`, `pointer-events: none` — the one case `gap` cannot express |
| `.mob-sticky` | sticky at `--mob-sticky-top`, `z-index: --mob-z-sticky` |
| `.mob-sticky--bottom` | pins to `--mob-sticky-bottom` instead |
| `.mob-sticky--canvas` | paints the canvas and extends it over the page gutter, so content disappears at the true page edge |
| `.mob-sticky--seam` | adds the block-end hairline, for a pinned header that must separate from scrolled content |

Fixed-size spacers are not provided on purpose: fixed space is `gap` or a margin token, not
an element.

---
---

# Controls

## 9. Button and icon button

`components/button.css`. The most-repeated control in the system. Tabs, menu items, chips
and the segmented control all borrow their state language from this file, so a 1px drift
here shows up on every screen.

Four locals do all the painting — `--mob-btn-bg`, `--mob-btn-fg`, `--mob-btn-border`,
`--mob-btn-radius`. The base rule paints with them once; every variant and every state does
nothing but reassign them. That is why a state can never accidentally change geometry, and
why the loading spinner picks up the current variant's colour without knowing which variant
it is.

### Anatomy

```
.mob-btn                                     inline-flex, one line, never wraps
┌──────────────────────────────────────┐
│   [__icon]   __label   [__icon]      │     block-size    = --mob-control-h-*
└──────────────────────────────────────┘     padding-inline = --mob-control-px-*
         └ gap = --mob-control-gap

.mob-icon-btn                                square target, icon only
┌────────┐
│   ⌄    │                                   32 / 40 / 48 — off the control ladder
└────────┘

.mob-btn-group                               FUSED row: the seams are 1px GAPS
┌─────────┬─────────┬─────────┐              over a --mob-bg-frame parent with
│   1D    │   1W    │   1M    │              overflow:hidden. Never borders.
└─────────┴─────────┴─────────┘
```

### Classes

| Base | |
|---|---|
| `.mob-btn` | text button, M step by default |
| `.mob-icon-btn` | square icon button, M (40px) by default |
| `.mob-btn-group` | fused row of buttons |

| Size | `.mob-btn` | `.mob-icon-btn` |
|---|---|---|
| `--sm` | 30px, px 10, radius 8, label 11.5px `[src]` | 32px square, 16px glyph |
| `--md` | 34px, px 15, radius 9, label 13px `[src]` — the default | 40px square, 20px glyph |
| `--lg` | 40px, px 18, radius 10, label 14px `[drv]` | 48px square, 24px glyph |

| Variant | Rest | Hover | Use for |
|---|---|---|---|
| `--primary` | `--mob-accent` fill, `--mob-fg-on-accent` **sans 500** | `--mob-accent-hover`; press `--mob-accent-pressed` | one page-level call to action per action group |
| `--secondary` | surface + `--mob-border-control` — the unmodified default, restated so it can win back over an inherited variant | surface lifts, text and border step up | the ordinary button |
| `--ghost` | transparent fill, muted text, control border | surface + text lift; the border deliberately does **not** move | row overflow controls, the `···` menu trigger `[src]` |
| `--quiet` | transparent fill, **no border** | surface + text lift | toolbars and card corners; the right default for a toolbar icon button |
| `--affirm` | muted green `[src]` — desaturated on all three channels at rest | saturation arrives here | "money in": Claim, Confirm, Approve |
| `--destroy` | muted red `[src]` | saturation arrives here | the in-row destructive action; repeats safely down a list |
| `--danger` | filled `--mob-negative`, text `--mob-fg-inverse` `[drv]` | `--mob-negative-raised` | a modal's confirm button, a Danger-zone trigger |

Every variant exists on both blocks (`.mob-btn--ghost` and `.mob-icon-btn--ghost`, etc.).
`--primary` is the only variant that leaves mono, and the only one allowed to: it is a
page-level call to action, not metadata.

**`--destroy` versus `--danger`.** `--destroy` opens the confirmation; `--danger` *is* the
confirmation. Never put a `--danger` button in a table row. Never confirm a destructive modal
with `--destroy`. At most one `--danger` per surface.

| Modifier | Effect |
|---|---|
| `.mob-btn--block` | `display:flex; inline-size:100%` — the stacked actions segment `[src]` |
| `.mob-btn--pill` | `--mob-btn-radius: --mob-radius-full`. Opt-in only: "everything in a pill" is on the anti-pattern list. Legitimate for a single standalone filter; never for a row of form actions. |
| `.mob-btn-group--block` | full-width group |

| Element | |
|---|---|
| `.mob-btn__icon` | 16px box (20px inside `--lg`). A bare `> svg` child is sized identically, so the class is optional. |
| `.mob-btn__label` | only needed when the button may be squeezed by its column — it adds the ellipsis. Buttons never wrap. |

### States

| State | Selector | Required? |
|---|---|---|
| Hover | `:hover` | shipped per variant |
| Pressed | `:active` → `scale(--mob-press-scale)` | shipped, one scale for every control in the system |
| Focus | `:focus-visible` → `--mob-focus-ring`, radius restated | **required**, never delete |
| Selected | `[aria-pressed="true"]`, `[aria-selected="true"]`, `[aria-current]` (not `"false"`) | drive from ARIA, never a class. Deliberately does not respond to hover. |
| Disabled | `:disabled` or `[aria-disabled="true"]` | contrast drops on all three channels **and** the affordances go; border collapses to `--mob-border-subtle`. Prefer `aria-disabled` when the user needs to discover why it is off. |
| Loading | `[data-mob-loading]` | pair with `aria-busy="true"` |
| Error | `[data-mob-error]` | optional; colour is not a sufficient signal on its own |

**Loading does not empty the button.** The label stays in the DOM and stops painting, so the
width it reserved is the width the button keeps. The spinner is drawn on `::before` —
`::after` is reserved by `base.css` for the coarse-pointer tap target, so never claim
`::before` on a button in a consumer stylesheet.

**Error** marks a control whose last invocation failed. Change the label to "Try again" and
render the reason next to it; the tint alone is not a message. Disabled always wins over
error.

### Fused group

The parent paints `--mob-bg-frame` and clips; children sit on their own fills; the 1px flex
`gap` is what you read as a hairline. Children draw **no** borders — two adjacent 1px borders
plus a 1px gap would read as a 3px seam. The group's radius follows its children's step via
`:has()`. `--ghost` and `--quiet` segments are given the surface fill back inside a group so
the frame colour does not show through their faces; a `--primary` or `--danger` segment keeps
its own fill.

Focus inside a group uses `--mob-btn-group-ring` (a 2px **inset** ring), because the group's
`overflow: hidden` would clip the outward ring to nothing and a keyboard user would tab
through a 1D/1W/1M switch with no indicator at all.

### Component tokens

`--mob-btn-font-sm|md|lg` · `--mob-btn-spinner-sm|md|lg` · `--mob-btn-spinner-stroke` (1.5px)
· `--mob-btn-spinner-track` (22%) · `--mob-btn-spinner-cycle` (640ms `[drv]` — the motion
scale stops at 260ms because it describes state transitions; a continuous spin needs a slower
cycle) · `--mob-icon-btn-size-sm|md|lg` · `--mob-icon-btn-glyph-lg` · `--mob-btn-group-ring` ·
`--mob-btn-shade` (the "always darker" mixing partner; flips to `--mob-fg-primary` under
`[data-mob-theme='light']`).

Per-element locals you may reassign on one instance: `--mob-btn-bg`, `--mob-btn-fg`,
`--mob-btn-border`, `--mob-btn-radius`, `--mob-btn-spinner`, `--mob-icon-btn-size`,
`--mob-icon-btn-glyph`.

### Markup

```html
<!-- the four calibrated buttons -->
<button class="mob-btn mob-btn--primary" type="button">New position</button>
<button class="mob-btn mob-btn--sm mob-btn--affirm  mob-btn--block" type="button">Claim</button>
<button class="mob-btn mob-btn--sm mob-btn--destroy mob-btn--block" type="button">Close</button>
<button class="mob-btn mob-btn--sm mob-btn--ghost   mob-btn--block"
        type="button" aria-label="More actions">···</button>

<!-- loading: the label stays, so the width stays -->
<button class="mob-btn" type="button" data-mob-loading aria-busy="true">
  <span class="mob-btn__label">Claiming</span>
</button>

<!-- fused range switch -->
<div class="mob-btn-group" role="group" aria-label="Range">
  <button class="mob-btn mob-btn--sm" type="button" aria-pressed="true">1D</button>
  <button class="mob-btn mob-btn--sm" type="button" aria-pressed="false">1W</button>
  <button class="mob-btn mob-btn--sm" type="button" aria-pressed="false">1M</button>
</div>

<!-- link styled as a button: link colours are overridden in this file -->
<a class="mob-btn mob-btn--secondary" href="/docs">Read the docs</a>
```

### Accessibility

- **`.mob-icon-btn` has no accessible name of its own.** It MUST carry `aria-label` or a
  `.mob-sr-only` child. Shipping one without a label is a defect. `06-accessibility.md §7`.
- Set `aria-busy="true"` alongside `[data-mob-loading]`.
- Selection is `aria-pressed` (toggle) or `aria-selected` / `aria-current` (a segment of a
  set) — never a class.
- Prefer `aria-disabled="true"` over `disabled` when the control must stay focusable so it
  can explain itself; `disabled` removes it from the tab order.
- On coarse pointers `base.css` grows a 44px `::after` hit target without changing the
  painted size.

---

## 10. Field — input, textarea, select, search

`components/field.css`. **One grammar for every text-entry control.** Text input, textarea,
select and search are not four components; they are one box with different contents.

### Anatomy

```
.mob-field                       owns the size tokens + the vertical stack (gap 6)
├── .mob-field__label            persists. Always.
├── .mob-input-wrap              THE BOX: background, border, radius, ring
│   ├── .mob-input-wrap__icon        leading icon        (optional)
│   ├── .mob-input | .mob-textarea | .mob-select
│   ├── .mob-input-wrap__affix       trailing text       (optional)
│   ├── .mob-search__kbd             shortcut hint       (search only)
│   ├── .mob-search__count           result count        (search only)
│   └── .mob-input-wrap__action      trailing button     (optional)
└── .mob-field__footer
    ├── .mob-field__hint  |  .mob-field__error
    └── .mob-field__counter
```

### Two ways to build the box, pixel-identical

```html
bare      <input class="mob-input">              nothing beside the text
wrapped   <div class="mob-input-wrap"> … </div>  anything else
```

Inside a wrap the control goes transparent, borderless and unpadded, and the **wrap** paints
the box. That is the whole point: a leading icon is a flex *sibling* of the control, so it
can never overlap the text, and nobody maintains a `padding-left` that happens to equal the
icon width plus the gap.

### Classes

| Class | Role |
|---|---|
| `.mob-field` | the vertical stack. Sizes applied here are preferred. |
| `.mob-field--sm` `--md` `--lg` | rebind `--mob-field-h`, `-px`, `-radius`, `-font` together |
| `.mob-field__label` | mono `--mob-size-xs`, `--mob-fg-label` |
| `.mob-field__required` | the red mark. Never the only signal — the control still needs `required`. |
| `.mob-field__footer` | flex row, `space-between` |
| `.mob-field__hint` | `--mob-fg-muted`, not `--mob-fg-dim`: helper text is read, so it gets contrast |
| `.mob-field__error` | `--mob-negative`, weight 500. Render a hint **or** an error, not both stacked. |
| `.mob-field__counter` | tabular, `--mob-fg-dim`; turns negative under `[data-mob-over]` |
| `.mob-input-wrap` | the painted box |
| `.mob-input-wrap--sm` `--md` `--lg` | same size rebinding for a standalone wrap |
| `.mob-input-wrap--select` | draws the chevron (also inferred by `:has(> .mob-select)`) |
| `.mob-input-wrap--textarea` | zeroes block padding and top-aligns the slots |
| `.mob-input-wrap__icon` | 16px leading slot, `pointer-events: none` |
| `.mob-input-wrap__affix` | trailing unit or currency mark, not selectable |
| `.mob-input-wrap__action` | a real trailing button — clear, reveal password, paste, unit toggle |
| `.mob-input` | the text control |
| `.mob-textarea` / `.mob-textarea--no-resize` | `resize: vertical` by default; horizontal resize would break the column |
| `.mob-select` | **must** live inside `.mob-input-wrap` — a `<select>` is a replaced element and cannot carry a pseudo-element, so the chevron is drawn by the wrap |
| `.mob-search` | co-class on `.mob-input-wrap` |
| `.mob-search__icon` | draws a CSS magnifier while empty; pass an `<svg>` to replace it |
| `.mob-search__count` | result count |
| `.mob-search__kbd` | shortcut hint slot; pair with `.mob-kbd`. Hidden on `:focus-within` — the hint is an invitation to focus, and once focused it has done its job. |
| `.mob-search__clear` | hidden until something is typed (`:has(> .mob-input:not(:placeholder-shown))`); draws a CSS × while empty |
| `.mob-kbd` | standalone key-cap, legal anywhere a shortcut is named |

The kbd hint and the clear button toggle with `visibility`, never `display`: both slots keep
their width for the life of the field, so typing the first character cannot shift the caret.

### The label rule

**The label persists after input. Always.** A placeholder is not a label — it disappears
exactly when the user needs it, it is invisible to a screen reader as a name, and it destroys
the filled/empty distinction the border ladder depends on. Ship `.mob-field__label` with a
`for` pointing at the control's id, or wrap the control in the `<label>`. If the design truly
has no room for a visible label, put `.mob-sr-only` on it — do not delete it.

### States, in precedence order

The blocks are ordered by precedence and rely on source order. Do not reorder them.

| State | Selector | Effect |
|---|---|---|
| Placeholder | `.mob-select[data-mob-placeholder]` | an unselected `<select>` showing its prompt option: the text drops to `--mob-fg-dim` so it reads as a prompt rather than as a value |
| Filled | `:not(:placeholder-shown)` or `[data-mob-filled]` | border steps one rung up, so a form of empty fields stays calm and the answered ones read first. `[data-mob-filled]` is the escape hatch for selects and framework-managed values. |
| Hover | `:hover` | `--mob-field-bg-hover`, `--mob-field-border-hover` |
| Focus | `:focus-within` on the wrap, `:focus` on a bare control | border → `--mob-focus-color` plus `--mob-field-ring` (1px). A 1px ring outside a recoloured border reads as a 2px edge: obvious, not neon. The full 4px global ring is too loud on a stack of eight fields — this is the permitted refinement. |
| Invalid | `.mob-field[data-mob-invalid] > …`, `[data-mob-invalid]`, `[aria-invalid="true"]` | negative border **plus** `--mob-field-edge-invalid` (an inset doubling), so the error carries a weight signal and not just a hue signal. **Survives focus.** |
| Loading | `[data-mob-loading]` on the wrap or the field | trailing spinner, in place of the action's glyph if there is one, otherwise appended as the last flex item. Width is reserved both ways; the caret never jumps. A loading `<select>` is `pointer-events:none` — its options are what is being fetched. A loading text input stays editable. |
| Read-only | `[readonly]` | keeps full text contrast — the value is real and copyable. Loses the affordance: no hover, no editing edge. |
| Disabled | `:disabled`, `[data-mob-disabled]` | contrast down **and** affordance gone; loses the border ladder entirely, label and hint drop to `--mob-fg-disabled`. Must never be mistakable for a quiet read-only field. |

`.mob-field[data-mob-invalid]` and `[data-mob-loading]` on the field target **direct
children** for the box; keep `.mob-input-wrap` a direct child of `.mob-field`.

A wrapped control never draws its own edge — the wrap owns it. That is enforced by a final
block scoped to the three controls via `:where()`, so `.mob-input-wrap__action` keeps its own
focus ring.

### Component tokens

`--mob-field-font` / `-sm` / `-md` / `-lg` · `--mob-field-px-sm|md|lg` ·
`--mob-field-radius-sm|md|lg` · `--mob-field-py` (10px, multi-line only) · `--mob-field-gap`
· `--mob-field-ring` · `--mob-field-ring-invalid` · `--mob-field-edge-invalid` ·
`--mob-field-autofill-spread` (100vmax — kills Chrome's yellow wash without a literal colour)
· `--mob-select-chevron` / `-stroke` · `--mob-spinner-size` / `-stroke` / `-duration` ·
`--mob-search-glyph` / `-stroke` / `-handle` / `--mob-search-clear-bar` · `--mob-kbd-h` /
`-px` / `-radius`. `tokens.css` owns `--mob-field-bg`, `-border`, `-h`, `-px`, `-radius` and
`--mob-textarea-min-h`.

### Markup

```html
<div class="mob-field mob-field--md" data-mob-invalid>
  <label class="mob-field__label" for="amount">
    AMOUNT <span class="mob-field__required" aria-hidden="true">*</span>
  </label>
  <div class="mob-input-wrap">
    <span class="mob-input-wrap__icon" aria-hidden="true"><!-- svg --></span>
    <input class="mob-input" id="amount" type="text" inputmode="decimal"
           placeholder="0.00" required
           aria-invalid="true" aria-describedby="amount-err amount-count">
    <span class="mob-input-wrap__affix">USDG</span>
    <button class="mob-input-wrap__action" type="button" aria-label="Paste from clipboard">⎘</button>
  </div>
  <div class="mob-field__footer">
    <p class="mob-field__error" id="amount-err">Enter an amount above 10.00.</p>
    <span class="mob-field__counter" id="amount-count">0 / 12</span>
  </div>
</div>

<div class="mob-field mob-field--md">
  <label class="mob-field__label" for="chain">CHAIN</label>
  <div class="mob-input-wrap mob-input-wrap--select">
    <select class="mob-select" id="chain">
      <option>Robinhood Chain</option>
      <option>Base</option>
    </select>
  </div>
</div>

<div class="mob-input-wrap mob-input-wrap--md mob-search">
  <span class="mob-search__icon"></span>
  <input class="mob-input" type="search" placeholder="Search positions"
         aria-label="Search positions">
  <span class="mob-search__count">12</span>
  <kbd class="mob-kbd mob-search__kbd">/</kbd>
  <button class="mob-input-wrap__action mob-search__clear" type="button"
          aria-label="Clear search"></button>
</div>

<div class="mob-field">
  <label class="mob-field__label" for="note">NOTE</label>
  <div class="mob-input-wrap mob-input-wrap--textarea">
    <textarea class="mob-textarea" id="note" rows="4"></textarea>
  </div>
</div>
```

### Accessibility

The CSS cannot enforce these for you:

- `aria-invalid="true"` on the control whenever `[data-mob-invalid]` is set.
- `aria-describedby` pointing at `__hint` / `__error` / `__counter`.
- `aria-busy="true"` on the control whenever `[data-mob-loading]` is set.
- The error **message** is the non-colour signal. Never render a red border with no text.
- `.mob-search__clear` and `.mob-input-wrap__action` are real buttons and need real names.

`06-accessibility.md §4` covers labelling in full.

---

## 11. Choice — checkbox, radio, toggle, choice row, segmented control

`components/choice.css`. Everything here is built the same way: a **real native input**, made
invisible but left in the document, plus a styled sibling that does the drawing.

Why not a `div` with `role="checkbox"`: tab order, Space, arrow-key group navigation inside a
radio name, `:checked` / `:indeterminate` / `:disabled`, form submission, autofill,
screen-reader role and state announcements, and every assistive-tech quirk nobody will think
of — all free, and none of it can regress.

The input is `position:absolute; inset:0; opacity:0; pointer-events:none`. **Do not swap it
for `display:none` or `visibility:hidden`** — both take it out of the tab order and out of
the accessibility tree, which is the entire point.

### Anatomy

```
.mob-checkbox / .mob-radio / .mob-toggle       the <label>. Owns state.
├── …__input                                   native, invisible, focusable
├── …__box  /  .mob-toggle__track              the drawn control
│       (marks and the knob are pseudo-elements of it)
└── …__label                                   the text, optional

.mob-choice-row                                a layout companion: apply it to the
└── .mob-choice-row__text                      SAME <label> element — never nest
    ├── .mob-choice-row__title                 one label inside another, which is
    └── .mob-choice-row__desc                  invalid HTML

.mob-segmented-control                         the 1px-gap frame
└── .mob-segmented-control__item               <button> or <label>
    └── .mob-segmented-control__label          only for a label that may need an ellipsis
```

### Classes

| Class | Notes |
|---|---|
| `.mob-checkbox` `.mob-radio` `.mob-toggle` | the `<label>` shell |
| `.mob-checkbox__input` `.mob-radio__input` `.mob-toggle__input` `.mob-segmented-control__input` | the hidden native input |
| `.mob-checkbox__box` `.mob-radio__box` | 16px well (`--mob-choice-size` = `--mob-control-icon`, so a choice control sits in the same optical column as a leading icon). Radio uses the checkbox's geometry token, not a copy of it. |
| `.mob-toggle__track` | 30×18; the knob is `::after`, so it cannot be forgotten in the markup |
| `.mob-checkbox__label` `.mob-radio__label` `.mob-toggle__label` | mono `--mob-size-md` |
| `.mob-choice-row` | flex, `align-items: flex-start` — the control aligns to the first line, not to the centre of a two-line description |
| `.mob-choice-row__text` `__title` `__desc` | the text column |
| `.mob-choice-row--trailing` | control on the far side: the label is the subject, the control is the answer |
| `.mob-choice-row--boxed` | the row itself becomes the target. This is where "selected" lives for a choice: the control shows the answer, the box shows which row holds it. |
| `.mob-segmented-control` | the fused frame, `align-self: start` so it hugs its labels |
| `.mob-segmented-control--fill` | spreads segments to equal widths — right for a full-width filter bar, wrong for a 1D/1W/1M switch beside a heading |
| `.mob-segmented-control--sm` `--md` `--lg` | mirrors the field ladder exactly |
| `.mob-segmented-control__item` | `<button>` or `<label>`; `justify-content: safe center` so an over-long label clips from the trailing edge instead of both ends |
| `.mob-segmented-control__label` | optional ellipsis wrapper — bare text is an anonymous flex item and cannot take `text-overflow` |

### Why the block is `.mob-segmented-control` and not `.mob-segmented`

`card.css` already owns `.mob-segmented` — the fused card row, the signature construction.
Two components cannot share a block name: `card.css` loads after `choice.css`, so the short
name gave every segmented control the card's 12px radius and gave every fused card this
control's 34px block-size. Same construction technique, two sizes of object, two names.

### States

Every control here ships: default, hover, focus-visible, pressed, selected/checked,
indeterminate (checkbox only), invalid, loading, disabled.

| State | Selector | Notes |
|---|---|---|
| Checked | `:checked ~ __box` / `~ __track` | accent fill; the mark scales in with opacity + transform only |
| Indeterminate | `:indeterminate ~ __box` | placed **after** the checked block so the dash wins — a parent checkbox over a partial selection is not "on" |
| Hover / pressed | on the `<label>` | pressed is `scale(--mob-press-scale)` plus a surface shift; at 16px the surface shift is what the user actually sees |
| Focus | `__input:focus-visible ~ __box` → `--mob-focus-ring` | keyboard only: a mouse click on a checkbox does not match `:focus-visible`, so the ring appears exactly when it carries information |
| Invalid | `[data-mob-invalid]` on the label, or `aria-invalid="true"` on the input | border only. The border is not a message — render one. |
| Disabled | `:disabled` on the input | **a disabled checked control is not accent-filled.** Accent means live; a dead control that still glows is the anti-pattern the states matrix exists to prevent. |
| Loading | `[data-mob-loading]` on the label | keeps the visual state the user just chose and pulses it. It does **not** add `disabled`, because that would erase the answer they gave. Block the change in your handler and set `aria-busy="true"` on the input. |

Segmented control state lives on the item: `[aria-checked="true"]`, `[aria-selected="true"]`,
`[data-mob-selected]`, or `:has(> __input:checked)`. Selection is text contrast + weight + a
surface step — **not** an accent fill. A row of filter segments is not worth the system's
scarce accent, and the muted→primary jump reads at a glance even at 11.5px.
`[data-mob-invalid]` and `[data-mob-loading]` go on the **frame**.

Focus inside the frame uses `--mob-segmented-control-ring` (2px inset) because
`overflow:hidden` would halve an outer ring. Two pixels, like the button group: a grouped
control must not focus more faintly than the one beside it.

On coarse pointers the three label shells take `min-block-size: --mob-tap-target` — their
target is the whole label, whose height is content-driven, so they are not in `base.css`'s
`::after` list.

### Component tokens

`--mob-choice-size` · `--mob-choice-radius` · `--mob-choice-gap` ·
`--mob-choice-mark-stroke` (1.5px) · `--mob-choice-tick-w` / `-tick-h` / `-nudge` ·
`--mob-choice-dash` · `--mob-choice-dot` · `--mob-toggle-w` (30) / `-h` (18) / `-pad` (2) /
`-knob` / `-travel` (the last two are *derived* from the first three, so the knob still fits,
still ends flush and still travels the exact gap when you retune the track) ·
`--mob-segmented-control-h` / `-px` / `-radius` / `-font` / `-ring`.

### Markup

```html
<label class="mob-checkbox">
  <input class="mob-checkbox__input" type="checkbox">
  <span class="mob-checkbox__box"></span>
  <span class="mob-checkbox__label">Auto-claim above $2.00</span>
</label>

<label class="mob-radio mob-choice-row mob-choice-row--boxed">
  <input class="mob-radio__input" type="radio" name="mode" value="ladder" checked>
  <span class="mob-radio__box"></span>
  <span class="mob-choice-row__text">
    <span class="mob-choice-row__title">Ladder</span>
    <span class="mob-choice-row__desc">Spread the position across 16 rungs.</span>
  </span>
</label>

<label class="mob-toggle mob-choice-row mob-choice-row--trailing">
  <input class="mob-toggle__input" type="checkbox" role="switch" aria-busy="true">
  <span class="mob-toggle__track"></span>
  <span class="mob-choice-row__text">
    <span class="mob-choice-row__title">Email alerts</span>
    <span class="mob-choice-row__desc">One digest per day.</span>
  </span>
</label>

<div class="mob-segmented-control mob-segmented-control--sm"
     role="radiogroup" aria-label="Range">
  <button class="mob-segmented-control__item" type="button" role="radio" aria-checked="true">1D</button>
  <button class="mob-segmented-control__item" type="button" role="radio" aria-checked="false">1W</button>
  <button class="mob-segmented-control__item" type="button" role="radio" aria-checked="false">1M</button>
</div>
```

### Accessibility

- Keep the native input. Everything below depends on it.
- Set `aria-invalid="true"` on the input, not only `[data-mob-invalid]` on the label.
- Set `aria-busy="true"` on the input while loading, and block the change in your handler.
- A `role="radiogroup"` of `role="radio"` buttons needs arrow-key roving focus from you; the
  `<label>` + `<input type="radio">` form gets it from the browser for free.
- `.mob-choice-row__desc` is not automatically the accessible description. Wire
  `aria-describedby` if the description must be announced.

---

## 12. Chip

`components/chip.css`. The 10.5px mono pill that carries a chain name, a count, a status or a
filter.

### Anatomy

```
┌────────────────────────────────┐
│ ●  Above · sold             ×  │   min-block-size --mob-chip-h (22px)
└────────────────────────────────┘
  │  │                          └── .mob-chip__remove   (--removable)
  │  └───────────────────────────── .mob-chip__label    (or a bare text node)
  └──────────────────────────────── .mob-chip__dot      (optional)
```

### Rules

1. **A chip carries a fragment, never a sentence.** "Above · sold", "V4", "1 rungs",
   "Robinhood Chain" — a status, a category, a filter, a count. If the string needs a verb it
   is a message and belongs in a banner or a toast. A chip never wraps: long text either
   truncates (`.mob-truncate` on `__label`) or the string is wrong.
2. **Colour is never the only signal.** Every tone is legible as text first; `__dot` is a
   redundant mark, not the message.
3. **An interactive chip carries `data-mob-interactive`** — not the element type. `base.css`
   sizes the coarse-pointer hit affordance off that attribute, so a `<button class="mob-chip">`
   without it is a bug. A static chip is a `<span>`.
4. **Selection is announced, not just painted:** `aria-pressed` on a filter toggle,
   `aria-selected` on an option, `aria-current` on a nav chip. The styles key off those
   attributes, so getting the markup right gets the visuals for free.
5. **`--removable` ships a real `<button>` with an accessible name.** Never a bare glyph.

### Classes

| Class | Notes |
|---|---|
| `.mob-chip` | the block. **This is the outline chip** — `--outline`, `--neutral` and `--md` map to nothing on purpose. |
| `.mob-chip--sm` | 18px min-height, 10px type; rebinds the padding tokens rather than the padding, so the loading skeleton insets correctly |
| `.mob-chip--solid` | filled treatment, built for a count. The border is painted in the fill colour rather than removed, so a solid and an outline chip are the same size. `min-inline-size: --mob-chip-h` keeps a single digit square-ish. |
| `.mob-chip--removable` | tightens the trailing padding so the × sits at the optical edge |
| `.mob-chip--accent` `--positive` `--warning` `--negative` `--info` | tones |
| `.mob-chip__label` | needed when the chip also holds a dot, icon or ×, or when it must truncate |
| `.mob-chip__dot` | 5px redundant status mark; override `--mob-chip-dot-color` per instance |
| `.mob-chip__icon` | 12px leading glyph |
| `.mob-chip__remove` | real button, 12px, inset focus ring |
| `.mob-chip-group` | wrapping row with one gap. Use it for filter rows and tag lists; do not hand-space chips with margins. |

### Tone construction

A tone modifier binds one triplet — `--mob-chip-tone` / `-tone-raised` / `-tone-tint` — plus
its three solid values. **One shared rule** turns that triplet into every painted role at
fixed mix ratios over the tint:

```
border  22%   ·   border hover  36%   ·   border selected  48%
bg rest  0%   ·   bg hover      10%   ·   bg selected      16%
```

Adding a tone means adding six bindings and one selector to that rule. It never means writing
a colour. Neutral is deliberately absent from that rule: its values are measured, not
computed, and live in `tokens.css`.

### States

Every interactive state is gated on `data-mob-interactive` **and** on the chip being neither
disabled nor loading, so a dead chip cannot light up under the cursor.

| State | Selector |
|---|---|
| Hover | `[data-mob-interactive]:not(:disabled, [aria-disabled="true"], [data-mob-loading]):hover` — the tone gains saturation only here |
| Pressed | same guard, `:active` → `scale(--mob-press-scale)` |
| Selected | same guard, `:is([aria-pressed="true"], [aria-selected="true"], [aria-current="true"], [aria-current="page"])`. Placed after hover, so a selected chip keeps reading as selected under the pointer. |
| Focus | `:focus-visible` → global ring with `--mob-chip-radius` restated (base.css would jump a 6px chip to 8px) |
| Disabled | `:disabled` or `[aria-disabled="true"]` — border falls to the divider step so the chip stops reading as a control at all |
| Loading | `[data-mob-loading]` — box untouched; the label goes transparent and a pulsing skeleton bar takes its place, held open by `--mob-chip-skeleton-w` (9ch). Pair with `aria-busy="true"`. |

**Error is a tone, not a state.** A chip that reports a failure is `.mob-chip--negative` with
a label that says what failed. There is nothing an invalid-input state could mean on a
component that holds no input.

**No inflated tap target.** `base.css` sets `position: relative` on an interactive chip but
deliberately does not grow a 44px box: it would overlap neighbours in a wrapped group and
fire the wrong filter. Give touch surfaces room instead — `--md` rather than `--sm`, and
enough `--mob-chip-group-gap`. A chip is not the right control for a primary touch action; a
button is.

### Component tokens

`--mob-chip-fs` (10.5px `[src]`) / `-fs-sm` · `--mob-chip-h` (22px) / `-h-sm` (18px) ·
`--mob-chip-gap` (5px) · `--mob-chip-pad-x-tight` / `-pad-x-sm` / `-pad-y-sm` ·
`--mob-chip-dot-size` / `-dot-color` · `--mob-chip-icon-size` · `--mob-chip-remove-size` ·
`--mob-chip-skeleton-w` · `--mob-chip-group-gap` · the paint locals `--mob-chip-bg` /
`-border` / `-fg` and their `-hover` / `-selected` twins · `--mob-chip-solid-bg` /
`-solid-bg-hover` / `-solid-fg` · `--mob-chip-tone` / `-tone-raised` / `-tone-tint`.
`tokens.css` owns the neutral rest state and `--mob-chip-pad-x|y` and `--mob-chip-radius`.

`--mob-chip-h` is pinned at 22px so the height is deterministic whether or not the webfont
has loaded, and so a chip and a `--mob-meter-h` bin row sit on one baseline.

### Markup

```html
<span class="mob-chip">
  <span class="mob-chip__dot"></span>
  <span class="mob-chip__label">Robinhood Chain</span>
</span>

<div class="mob-chip-group">
  <button class="mob-chip mob-chip--positive" type="button"
          data-mob-interactive aria-pressed="true">In range</button>
  <button class="mob-chip" type="button" data-mob-interactive aria-pressed="false">Closed</button>
  <span class="mob-chip mob-chip--solid mob-chip--info">12</span>
  <span class="mob-chip mob-chip--removable">
    <span class="mob-chip__label mob-truncate">0x7a3f…c2d1</span>
    <button class="mob-chip__remove" type="button" aria-label="Remove filter 0x7a3f…c2d1">×</button>
  </span>
</div>
```

---
---

# Surfaces

`components/card.css`. Four blocks live in one file because they are one construction
problem: a surface, the way two surfaces are fused, the row that fills them, and the entity
mark that opens the row.

```
.mob-card        one surface: bg + 1px border + radius. No shadow, ever.
.mob-segmented   THE SIGNATURE — several surfaces fused into one card,
                 separated by 1px gaps that reveal the frame beneath.
.mob-list-row    avatar + name/sub + right-aligned value/share.
.mob-avatar      round tinted glyph, alone or overlapped in a stack.
```

Seven rules govern the whole file:

1. **A whole card is clickable only if it represents exactly one destination or one action.**
   A card carrying three buttons is not a link; make the buttons the targets and leave the
   card static.
2. If a clickable card *does* contain buttons, those buttons need explicit event handling —
   `stopPropagation`, or a stretched-link `::after` over the card with the real controls
   raised above it. CSS cannot resolve that for you.
3. **Do not put a decorative border around every nested block.** Inside a card, separation is
   a `.mob-card__hairline`, a `.mob-card__footer--ruled` rule, or nothing. Nested bordered
   boxes are how a product starts looking like a dashboard template.
4. `.mob-card--interactive` must be an `<a>` or `<button>`, or carry `role` + `tabindex`. A
   hover state is not a substitute for a real target.
5. Boolean state attributes are presence-based (see the orientation section).
6. **A disabled card is a visual state only.** Disable the controls inside it too — no
   stylesheet can take them out of the tab order for you.
7. Text inside a card takes the type roles from `base.css`; the loading state takes
   `.mob-skeleton` from `feedback.css`. This file owns surfaces, seams and layout, and
   deliberately redeclares neither.

## 13. Card

### Anatomy

```
.mob-card
┌───────────────────────────────────────────────────────┐
│ __header   __title ──────────── __meta   __actions    │
│ __body                                                │
│ ─────────────────────────────── __footer--ruled       │
│ __footer   Value                        $31.12 100%   │
└───────────────────────────────────────────────────────┘
```

### Classes

| Class | Effect |
|---|---|
| `.mob-card` | surface + 1px border + `--mob-card-radius` (12px) + `--mob-card-pad-y/x` (15/16 `[src]`) |
| `.mob-card--static` | explicit no-op, so a `variant` prop can always emit a class |
| `.mob-card--pad-sm` / `--pad-lg` | 12/13 `[src]` · 20/24 |
| `.mob-card--sunken` | a well *inside* a card: one step down, border drops to subtle so it does not read as a second card; also rebinds `--mob-avatar-ring` to follow the surface |
| `.mob-card--featured` | accent border treatment. No glow, no gradient — the border does the work. Quieter than `--selected`: featuring is editorial, selection is a user act, and the editorial one must not out-shout it. |
| `.mob-card--dashed` | empty container. Transparent, not a surface. `min-block-size: --mob-card-empty-min-h` (132px), centred grid. Combined with `--interactive` it answers on its **border**, never by acquiring a fill — there is nothing in it to fill. |
| `.mob-card--flush` / `--media` | `padding: 0; overflow: hidden` — the card is a frame for something that reaches its edges. `__header` / `__body` / `__footer` inside them ask for the gutters back by name. |
| `.mob-card--interactive` | cursor + paint-only transition |
| `.mob-card--selected` | equivalent to `[data-mob-selected]` |
| `.mob-card__header` | flex, `gap: 10`, `margin-block-end: --mob-card-header-gap` |
| `.mob-card__header--baseline` | `align-items: baseline` — the measured treatment when a micro-label sits next to its right-hand meta |
| `.mob-card__title` | token-for-token the `.mob-title` role. For an entity name inside a segment use `.mob-heading-sm` — the measured pool name is 14.5px. |
| `.mob-card__meta` | right-hand metadata |
| `.mob-card__actions` | `margin-inline-start: auto`, `gap: --mob-control-gap` |
| `.mob-card__actions--stack` | vertical action column, `align-items: stretch` so every button is exactly as wide as the segment |
| `.mob-card__body` | `min-inline-size: 0` |
| `.mob-card__footer` | baseline-aligned, `space-between`, `margin-block-start: --mob-card-footer-gap` |
| `.mob-card__footer--ruled` | the measured value line: hairline above, 12px of air over it, 10px under |
| `.mob-card__media` | `aspect-ratio: --mob-card-media-ratio` (16/9), `object-fit: cover`, tile background so the box is reserved before the file lands. Takes the inner radius unless the card is `--media`/`--flush`. |
| `.mob-card__error` | inline negative message row |
| `.mob-card__hairline` | a painted 1px divider for use *inside* a surface — vertical by default |
| `.mob-card__hairline--horizontal` | the horizontal form |

### States

Written in cascade order — hover → focus → pressed → selected → error → loading → disabled.
Disabled is last on purpose: it wins by both order and specificity, so no combination above
can make a dead card look alive. Focus is deliberately **not** suppressed when disabled — an
`aria-disabled` element is still focusable and a keyboard user must still see where they are.

| State | Selector | Behaviour |
|---|---|---|
| Hover | `.mob-card--interactive:hover` | surface + border only. **No lift, no scale, no glow, no growth** — the card occupies exactly the same box before and after. |
| Focus | `:focus-visible` | global ring with `--mob-card-radius` restated |
| Pressed | `:active` | **a luminance step, not a scale.** `--mob-press-scale` is the *control* vocabulary; a card is a container, usually far wider than the ~320px cap, so `.985` reads as rubber, blurs the 1px edge and the text, and inside a fused row tears the hairline it shares with its neighbours. The surface swaps at `--mob-duration-instant` instead: same information, nothing moves. |
| Selected | `.mob-card--selected`, `[data-mob-selected]`, `[aria-selected="true"]`, `[aria-current]` | accent tint **mixed into** the card surface rather than swapped for it, so a selected card stays on the same luminance step in the surface hierarchy. Hover on a selected card only lifts the border — the tint is never traded away. |
| Error | `[data-mob-error]` | border only; render `.mob-card__error` for the message |
| Loading | `[data-mob-loading]` | `cursor: progress`, hover and press neutralised. **This file ships no placeholder of its own** — swap the contents for `.mob-skeleton` blocks of the same geometry and reserve the width at the use site, where the content's length is known. Pair with `aria-busy="true"`. |
| Disabled | `:disabled`, `[aria-disabled="true"]`, `[data-mob-disabled]` | the surface **sinks** to `--mob-bg-sunken` instead of raising, and entity marks lose their series colour, so a disabled row cannot be mistaken for a quiet live one |

```html
<span class="mob-skeleton mob-skeleton--title" style="inline-size: 9ch"></span>
```

On the mono face with tabular numerals 9ch is exactly nine glyphs — the width of `$4,800.09`
— so the real number lands without the row moving.

### Component tokens

`--mob-card-header-gap` · `--mob-card-footer-gap` `[src]` · `--mob-card-rule-gap` `[src]` ·
`--mob-card-empty-min-h` · `--mob-card-media-ratio` · `--mob-card-radius` ·
`--mob-card-bg-hover` / `-bg-pressed` / `-bg-selected` / `-bg-selected-pressed` /
`-bg-featured` / `-bg-disabled` · `--mob-card-border-hover` / `-border-selected` /
`-border-featured` / `-border-dashed-hover` / `-border-disabled` / `-border-error`.

The colour tokens are declared for `[data-mob-theme]` as well as `:root`, so a light island
inside a dark page re-derives these mixes against that subtree's semantic tokens rather than
against the document root's.

### Markup

```html
<article class="mob-card">
  <header class="mob-card__header mob-card__header--baseline">
    <h3 class="mob-card__title">Open ladders</h3>
    <span class="mob-card__meta">updated 3s ago</span>
    <div class="mob-card__actions">
      <button class="mob-icon-btn mob-icon-btn--sm mob-icon-btn--quiet"
              type="button" aria-label="More actions">···</button>
    </div>
  </header>

  <div class="mob-card__body">…</div>

  <footer class="mob-card__footer mob-card__footer--ruled">
    <span class="mob-label">Value</span>
    <span class="mob-value">$31.12</span>
  </footer>
</article>
```

---

## 14. Segmented card — the signature construction

`.mob-segmented`. Several surfaces fused into one card. **The seams are 1px gaps, not
borders.**

### How it works

The frame is painted `--mob-bg-frame` and clips its children. Every segment is opaque
`--mob-card-bg`. A 1px `gap` therefore lets exactly 1px of the frame show through between two
segments — that *is* the hairline. Nothing draws it.

```
.mob-segmented        background = --mob-bg-frame, overflow:hidden
┌────────────┊──────────────────────┊────────────┊──────┐
│ __seg      ┊ __seg--wide          ┊ __seg      ┊ --actions
└────────────┊──────────────────────┊────────────┊──────┘
             ↑ not a border — a 1px gap with the frame showing through
```

What this buys, and what a border cannot:

- Two adjacent segments can never produce a 2px double border, because neither owns a border.
- The seam is the same 1px on the wrap line as on the column line: `gap` covers both axes, so
  a segment that wraps to a second row is still fused.
- `align-items: stretch` makes every segment the same height, so the seam runs the full height
  with no stub at the end.
- Every segment shrinks (`flex-shrink` stays 1 everywhere in the file), so a fused card
  narrows with its column instead of overflowing it. This is the single reason the position
  row survives a 900px viewport.

Consequences to respect:

- **The frame carries no padding.** Any padding on it appears as a wide band of frame colour
  along the card edge.
- **Segments must stay opaque.** A translucent segment leaks the frame colour across its whole
  face, not just at the seam.
- `overflow: hidden` clips outward box-shadows, which is why a focusable segment uses the
  inset ring.

### Classes

| Class | Effect |
|---|---|
| `.mob-segmented` | the frame: `--mob-bg-frame`, 1px border, `--mob-card-radius`, `gap: --mob-hairline`, `flex-wrap: wrap`, `overflow: hidden` |
| `.mob-segmented--stack` | segments become full-width rows; hairlines become horizontal. The flex reset on children is mandatory, not tidiness: in a column flex container `flex-basis` sizes the **block** axis, so leaving `flex: 1 1 240px` would give every segment a 240px-tall floor. |
| `.mob-segmented--stack-mobile` | the same, only below 767px |
| `.mob-segmented__seg` | `flex: 1 1 var(--mob-seg-basis)`, `min-inline-size: var(--mob-seg-min)`, padding falls back to the card's own so a segment tracks its density zone exactly as a card does |
| `.mob-segmented__seg--fixed` | `flex: 0 1` — never grows |
| `.mob-segmented__seg--grow` | `flex: 1 1` — the default, stated explicitly |
| `.mob-segmented__seg--wide` | `flex: 2 1` — takes twice the slack |
| `.mob-segmented__seg--actions` | `flex: 0 1 var(--mob-seg-basis-actions)`, flex column, centred, `gap: --mob-control-gap`. 0-grow, 1-shrink: an action column is sized by its buttons, not by the slack in the row. |
| `.mob-segmented__seg--flush` | `padding: 0` — a segment holding a table or media |
| `.mob-segmented__seg--pad-lg` | roomier inline gutter, 18px `[src]` |
| `.mob-segmented__seg--center` | flex column, vertically centred |
| `.mob-segmented__seg--interactive` | one segment is the target. Surface only — a segment cannot move without breaking the seam it shares with its neighbours. |

In stacked mode an action segment is already full width, so its buttons lay out as a **row**
— three full-width buttons in a column is a different design.

### States

| State | Where |
|---|---|
| Segment hover / focus / selected / disabled | `.mob-segmented__seg--interactive` — focus is `--mob-focus-ring-inset` with `border-radius: 0` (a rounded focused box would let the frame show through the segment's corners) |
| Frame selected | `.mob-segmented[data-mob-selected]` / `[aria-selected="true"]` |
| Frame error | `.mob-segmented[data-mob-error]` |

Tinting the frame tints **every seam at once** — the hairlines *are* the frame. That is the
cheapest possible "this whole fused row is selected".

### Component tokens

| Token | Default | Meaning |
|---|---|---|
| `--mob-seg-basis` | 240px `[src]` | flex-basis of a segment |
| `--mob-seg-min` | 200px `[src]` | narrowest measured segment |
| `--mob-seg-basis-actions` | 104px `[src]` | the action column |
| `--mob-seg-min-actions` | 96px `[src]` | |
| `--mob-seg-pad-x-lg` | 18px `[src]` | `--pad-lg` gutter |
| `--mob-seg-pad-actions` | 12px `[src]` | action column, all sides |
| `--mob-seg-pad-y` / `--mob-seg-pad-x` | *unset* | per-segment padding; falls back to `--mob-card-pad-y/x` |

Set the basis tokens **on the frame** to retune every segment at once — they inherit.

### Markup

```html
<div class="mob-segmented mob-segmented--stack-mobile" data-mob-series="3">

  <div class="mob-segmented__seg">
    <div class="mob-card__header mob-card__header--baseline">
      <span class="mob-avatar-stack">
        <span class="mob-avatar mob-avatar--lg" data-mob-series="1" aria-hidden="true">E</span>
        <span class="mob-avatar mob-avatar--lg" data-mob-series="2" aria-hidden="true">U</span>
      </span>
      <h3 class="mob-heading-sm">ETH / USDG</h3>
    </div>
    <div class="mob-stat-row">
      <span class="mob-stat-row__label">Value</span>
      <span class="mob-stat-row__value">$31.12<span class="mob-stat-row__qualifier">100% USDG</span></span>
    </div>
  </div>

  <div class="mob-segmented__seg mob-segmented__seg--wide mob-segmented__seg--pad-lg">
    <!-- .mob-meter-frame goes here -->
  </div>

  <div class="mob-segmented__seg mob-segmented__seg--actions">
    <button class="mob-btn mob-btn--sm mob-btn--affirm  mob-btn--block" type="button">Claim</button>
    <button class="mob-btn mob-btn--sm mob-btn--destroy mob-btn--block" type="button">Close</button>
    <button class="mob-btn mob-btn--sm mob-btn--ghost   mob-btn--block"
            type="button" aria-label="More actions">···</button>
  </div>
</div>
```

### Accessibility

The frame is a presentational construction. Give the row whatever semantics it actually has —
an `<article>` with a heading, a `<li>` inside a list, a `role="row"` grid. If a segment is
interactive it is a `<button>` or an `<a>`; the `--interactive` class alone confers nothing.

---

## 15. List row

`[src]` — avatar + name/sub + right-aligned value/share, the portfolio asset row. With
`--interactive`, the same geometry as a menu row or a selectable list item.

| Class | Effect |
|---|---|
| `.mob-list-row` | flex, `gap: --mob-list-row-gap` (10 `[src]`), `border-radius: --mob-list-row-radius`, **padding 0** — in the rail these rows are separated by the stack's 14px gap, and padding would double-space them |
| `.mob-list-row--inset` | adds padding back and pulls it out with a negative inline margin, so the hover surface reaches past the text without moving the text |
| `.mob-list-row--interactive` | cursor + surface transition |
| `.mob-list-row__main` | `flex: 1 1 auto`, `min-inline-size: 0` — without this the name refuses to truncate |
| `.mob-list-row__name` | truncation is built in: a long name must never push the number out of alignment |
| `.mob-list-row__sub` | second line, `--mob-fg-label` |
| `.mob-list-row__trail` | `margin-inline-start: auto`, `text-align: end` |
| `.mob-list-row__value` | `--mob-size-xl`, primary |
| `.mob-list-row__share` | tinted by `--mob-series-fg`, so the number, the avatar and the composition-bar segment all say "this asset" in the same colour. Untinted, it is ordinary metadata. |

States: hover (surface + the name goes primary), pressed (**luminance, not scale** — a list
row is routinely a child of a `.mob-segmented__seg`, where any transform would pull it off
the seam it shares), focus-visible (ring at the row radius), selected
(`[data-mob-selected]` / `[aria-selected]` / `[aria-current]`; the name goes primary as well
as the surface changing, so selection is not colour-only), error
(`[data-mob-error]` — the value goes *unknown* rather than red and the sub line carries the
message: one red thing in a row, not two), loading, disabled.

```html
<a class="mob-list-row mob-list-row--interactive mob-list-row--inset"
   href="/assets/eth" data-mob-series="1">
  <span class="mob-avatar" aria-hidden="true">E</span>
  <div class="mob-list-row__main">
    <div class="mob-list-row__name">Ethereum</div>
    <div class="mob-list-row__sub">0.0182 ETH</div>
  </div>
  <div class="mob-list-row__trail">
    <div class="mob-list-row__value">$62.40</div>
    <div class="mob-list-row__share">59.7%</div>
  </div>
</a>
```

`__main` and `__trail` are flex children and are blockified, so their `<div>` children
truncate correctly. Keep them as block-level elements.

---

## 16. Avatar and avatar stack

A round tinted circle with a letter glyph, or a token image.

| Class | Size |
|---|---|
| `.mob-avatar` | `--mob-avatar-md` 24px `[src]` by default |
| `.mob-avatar--sm` | `--mob-avatar-sm` 20px, glyph steps down |
| `.mob-avatar--md` | 24px `[src]` — list row |
| `.mob-avatar--lg` | `--mob-avatar-lg` 28px `[src]` — pair mark |
| `.mob-avatar-stack` | overlapped marks; children get `margin-inline-start: --mob-avatar-overlap` (−9px `[src]`) |

Colour comes from the `--mob-avatar-tint` / `--mob-avatar-fg` pair, left **unset** so it can
be inherited from any ancestor; unset, it falls back to the neutral series. `> img` and
`> svg` children fill the circle and inherit its radius.

**The ring in a stack is a cut-out, not a badge.** `.mob-avatar-stack > .mob-avatar` takes a
2px border painted in `--mob-avatar-ring`, which defaults to `--mob-card-bg` — the surface
*behind* the stack. Override `--mob-avatar-ring` **on the surface, not on the avatar**;
`.mob-card--sunken` already does.

```html
<span class="mob-avatar-stack">
  <span class="mob-avatar mob-avatar--lg" data-mob-series="1" aria-hidden="true">E</span>
  <span class="mob-avatar mob-avatar--lg" data-mob-series="2" aria-hidden="true">U</span>
</span>
<span class="mob-sr-only">ETH / USDG pool</span>
```

Mark the avatars `aria-hidden="true"` when the name is already in the row — a letter glyph
read aloud beside the name it abbreviates is noise. When the avatar is the *only* identifier,
give it `role="img"` and an `aria-label`.

### Series wiring

`data-mob-series="1"`…`"8"` on a `.mob-card`, `.mob-segmented`, `.mob-segmented__seg`,
`.mob-list-row`, `.mob-avatar-stack` or `.mob-avatar` sets the entity colour for everything
inside it: the avatar's tint/glyph pair and the flat `--mob-series-fg` used by the share. One
attribute, three properties, so an asset can never be blue in the avatar and teal in the
number.

`data-mob-series="accent"` is also accepted, for an entity that is the product's own (a
position, a ladder) rather than one of the categorical series. It is honoured on
`.mob-card`, `.mob-segmented__seg`, `.mob-list-row`, `.mob-avatar-stack` and `.mob-avatar`.

A series is assigned from **data identity**, never from position in a list. See §22 for the
generic series helpers in `dataviz.css`.

---
---

# Data

## 17. Stat, stat pair, reference row, KPI row

`components/stat.css`. The heart of every data surface in this system. Four blocks, one
grammar.

### Anatomy

```
.mob-stat                                .mob-stat-pair
┌─────────────────────────┐              ┌──────────┬──────────┐
│ FEES           all-time │ __head       │ FEES     │ PNL      │
│ $0.2194                 │ __value      │ $0.2194  │ +$0.2195 │
│ uncollected             │ __sub        │ uncollec │ +0.67%   │
└─────────────────────────┘              └──────────┴──────────┘
                                               18px ╎1px╎ 18px
.mob-stat-row
─────────────────────────────────────────  1px --mob-border-subtle
Value                        $31.12  100% USDG
__label                     __value  __qualifier
```

### Classes

| Class | Notes |
|---|---|
| `.mob-stat` | the block. Its own `color` **is** the figure's colour — `__value` declares no colour and inherits, which is what lets `.mob-tone-*` and `[data-mob-sign]` compose onto `__value` without fighting this file for specificity. |
| `.mob-stat--sm` | mono 16px. The `[src]` FEES / LOOSE mini cards. Mono, not sans: at 16px the figure is still data, not a headline. |
| `.mob-stat--md` | sans 22px — **the default**, declared on `.mob-stat__value` itself. The class matches no rule; emitting it is harmless and does nothing. |
| `.mob-stat--lg` | sans 23px `[src]` — the realized-PnL figure |
| `.mob-stat--xl` | sans 27px `[src]` — the portfolio total. One per screen. |
| `.mob-stat--positive` / `--negative` | flip **both** the figure and the sub line |
| `.mob-stat--end` | `text-align: end` — numeric data compared down a column |
| `.mob-stat__head` | label left, meta right, baseline-aligned |
| `.mob-stat__label` | pair with `.mob-label`; this class only guarantees the label never inherits the figure's tone |
| `.mob-stat__meta` | the right-hand qualifier, `--mob-fg-dim` |
| `.mob-stat__value` | tabular; `:not(:first-child)` carries the label gap, so a bare figure with no label above it has no phantom space |
| `.mob-stat__sub` | mono, `--mob-stat-sub-fs` / `-fg` |
| `.mob-stat-pair` | two metrics fused by a 1px vertical hairline |
| `.mob-stat-row` | the reference line under a hairline at the foot of a card |
| `.mob-stat-row__label` / `__value` / `__qualifier` | 10 / 12.5 / 9.5px `[src]` |
| `.mob-kpi-row` | responsive metric row: `auto-fit`, `minmax(min(--mob-kpi-min, 100%), 1fr)` |
| `.mob-kpi-row--tight` | 12px `[src]` — the FEES / LOOSE pairing |

### Rules

1. **`__label` carries `.mob-label` as well.** The micro-label is a type role owned by
   `base.css` and is not restated here. Drop `__head` when there is no right-hand meta and put
   `__label` straight in the block.
2. **The size step is a hierarchy decision, not a fitting decision.** One `--xl` per screen,
   one `--md` pair per card, `--sm` for everything that supports them. If a number needs a
   bigger step to be noticed, the card has too many numbers.
3. `--positive` / `--negative` flip the figure **and** the sub line — use them when the sub
   line restates the same signed fact ("+$0.2195" over "+0.67%"). When only the amount is
   signed and the sub is neutral description — the `[src]` LOOSE card, "$2.80" in red over "5
   tokens" in grey — leave the block untoned and put `.mob-tone-negative` or
   `[data-mob-sign]` on `__value` alone. That composes, because the figure takes its colour by
   inheritance and nothing else does.
4. **To retone the sub line by itself, rebind `--mob-stat-sub-fg` on the element.** Tone
   utilities deliberately do not reach it, so a stray utility cannot quietly break the
   positive/negative pairing in rule 3.

### The reference-value rule

`.mob-stat-row` exists to keep a reference number small. Position value, cost basis, notional
— the figures a reader checks but does not act on — go in the footer row at 12.5px under a
hairline, never in a `.mob-stat`. **It is never the largest number in a card.** The whole
point of the redesign this system was calibrated from was to put fees and PnL above position
value; a reference value that outgrows the metrics above it has inverted the card's hierarchy.

### The pair's hairline

The hairline is a **border on the second column plus a matching inline-start padding**, not a
spacer element: `18 ╎1╎ 18` exactly as measured, with nothing presentational in the markup
and correct mirroring under RTL. `align-items: stretch` is load-bearing — it is what makes the
rule span the taller column.

```css
.mob-stat-pair > *     { flex: 1 1 0; min-inline-size: 0; }
.mob-stat-pair > * + * { border-inline-start: 1px solid var(--mob-border-frame);
                         padding-inline-start: var(--mob-stat-pair-gap); }
```

It takes any number of children, but **two is the design**. Three metrics of equal weight in
one card is a table, and should be one.

To fuse KPIs into one framed block with hairline seams, do not rebuild the construction —
wrap them in `.mob-segmented`, which owns the frame parent, the 1px gaps and the clip.

### States

A stat is not interactive: no hover, press, focus or selected. It has the two states its data
has.

| State | Selector | Behaviour |
|---|---|---|
| Loading | `.mob-stat[data-mob-loading]` | `__value` becomes a pulsing bar `--mob-stat-skeleton-w` (6ch) wide and exactly one line box tall, so nothing reflows when the number lands. `--end` carries the bar over with an auto margin. Pair with `aria-busy="true"`. |
| Error | `.mob-stat[data-mob-error]` | the figure goes `--mob-fg-dim` — render an em dash, not a stale number — and the sub line carries the reason. The retry action belongs to the surrounding card, not to a metric. |

**If a value is already on screen and merely refreshing, leave it.** Swapping a live number
for a skeleton is a worse read than a stale one.

### Component tokens

`--mob-stat-gap-label-sm|md|lg|xl` and `--mob-stat-gap-sub-sm|md|lg|xl` (the measured ramp:
6/4 at 16px, 4/5 at 22px, 5/6 at 23px, 6/6 at 27px — the label sits closer as the figure gets
smaller, which is what keeps a `--sm` mini card reading as one object) · the active pair
`--mob-stat-gap-label` / `-gap-sub` · `--mob-stat-value-fg` · `--mob-stat-sub-fs` / `-sub-fg`
· `--mob-stat-skeleton-w` · `--mob-stat-pair-gap` (18px `[src]`) · `--mob-stat-row-gap` /
`-row-pad` / `-row-qualifier-gap` · `--mob-kpi-min` (160px) / `--mob-kpi-gap-tight`.

### Markup

```html
<div class="mob-stat-pair">
  <div class="mob-stat">
    <div class="mob-stat__head">
      <span class="mob-stat__label mob-label">FEES</span>
      <span class="mob-stat__meta">all-time</span>
    </div>
    <div class="mob-stat__value mob-tone-positive">$0.2194</div>
    <div class="mob-stat__sub">uncollected</div>
  </div>

  <div class="mob-stat mob-stat--positive">
    <div class="mob-stat__head">
      <span class="mob-stat__label mob-label">PNL</span>
    </div>
    <div class="mob-stat__value">+$0.2195</div>
    <div class="mob-stat__sub">+0.67%</div>
  </div>
</div>

<div class="mob-stat-row">
  <span class="mob-stat-row__label">Value</span>
  <span class="mob-stat-row__value">$31.12<span class="mob-stat-row__qualifier">100% USDG</span></span>
</div>

<div class="mob-kpi-row mob-kpi-row--tight">
  <div class="mob-card mob-card--pad-sm">
    <div class="mob-stat mob-stat--sm">…</div>
  </div>
  <div class="mob-card mob-card--pad-sm">
    <div class="mob-stat mob-stat--sm">…</div>
  </div>
</div>
```

### Accessibility

Read the figure and its label as one string. If `__label`, `__value` and `__sub` are three
separate elements a screen reader gets three fragments — acceptable inside a table or a
labelled region, poor when the stat floats alone. Wrap a standalone stat in a
`role="group"` with `aria-label`, or give the block one `.mob-sr-only` sentence. Never
communicate the sign by colour alone: the `+`/`−` must be in the string. See
`07-data-formatting.md §4`.

---

## 18. Table

`components/table.css`. Dense tabular data, tuned for scanning a column of numbers rather
than for reading prose. Mono + tabular numerals throughout, uppercase micro-label headers,
horizontal rules only.

### Anatomy

```
.mob-table-scroll                        overflow:auto — data integrity first
└── <table class="mob-table">
    ├── <caption>                        micro-label, optional
    ├── <thead>
    │   └── <tr>
    │       ├── <th>                     uppercase micro-label, 34px band
    │       └── <th class="mob-th--sortable" aria-sort="ascending">
    │           └── <button>Label</button>       ▲   indicator drawn by the
    │                                            ▼   th, pinned to its end edge
    ├── <tbody>
    │   ├── <tr data-mob-selected>       surface + start marker; outlives hover
    │   │   ├── <td>                     ▏← 2px marker rides :first-child::after
    │   │   ├── <td class="mob-td--num"> end-aligned, tabular, nowrap
    │   │   └── <td class="mob-td--end">
    │   │       └── <div class="mob-row-actions">   opacity reveal, never display
    │   ├── <tr aria-disabled="true">    dimmed, no hover, actions withdrawn
    │   ├── <tr data-mob-invalid>        failed row: negative tint + marker
    │   └── <tr><td class="mob-table__empty"   colspan="N">
    │            <td class="mob-table__loading" colspan="N">
    │            <td class="mob-table__error"   colspan="N">
    └── <tfoot>                          totals; rule above, no rule below
```

### Rules

1. **Markup is a real `<table>`.** Cells may also carry `.mob-th` / `.mob-td` when the grid is
   built from divs with ARIA roles; every selector accepts both.
2. **No vertical dividers by default** — that is what makes a dense table readable.
   `.mob-table--ruled` is the opt-in when the data genuinely needs a grid.
3. Row state is native or `data-*`. There is no `.is-*` class in this file.
4. **Numeric columns get `.mob-td--num` on the cell AND `.mob-th--num` on its header**, or the
   column head drifts off the digits it labels.
5. Row density follows `[data-mob-density]` — on the table, or on any ancestor zone. Control
   geometry does not change with density.
6. This table draws separators with **real 1px borders**, not with the system's
   1px-gap-over-a-frame construction. That construction exists to fuse card *segments*
   seamlessly; table rows are not fused segments, and a gap-based grid would fight
   `border-collapse`, sticky headers and `colspan`.
7. `border-collapse` is `separate` with 0 spacing. Collapsed borders vanish underneath a
   sticky `thead` and cannot be redrawn without a shadow.
8. Structural selectors are wrapped in `:where()` so specificity stays flat: a modifier class
   always beats the structure it sits in.

### Classes

| Class | Effect |
|---|---|
| `.mob-table-scroll` | geometry only — no border, no background, no radius. The card around it owns the surface. `overflow: auto`, `max-block-size: --mob-table-scroll-max-h`, `overscroll-behavior-inline: contain`. |
| `.mob-table` | mono, tabular, `border-collapse: separate` |
| `.mob-table--fixed` | `table-layout: fixed` — the **only** thing that makes `.mob-truncate` bite in a cell; under `auto` layout the column just grows |
| `.mob-table--ruled` | opt-in vertical rules |
| `.mob-table--sticky-head` | opaque head + `position: sticky` at `--mob-table-sticky-offset` |
| `.mob-table--stacked` | below 767px each row becomes a card and every cell prints its column name from `data-label` |
| `.mob-th` / `.mob-td` | for div-based grids; native `th`/`td` are styled identically |
| `.mob-th--num` / `.mob-td--num` | `text-align: end`, `white-space: nowrap`, tabular — a wrapped figure is an unreadable figure |
| `--end` / `--center` / `--nowrap` | on either spelling |
| `.mob-th--sortable` | reserves the indicator column up front so sorting never reflows the head |
| `.mob-row-actions` | the trailing action cluster |
| `.mob-table__empty` / `__loading` / `__error` | full-width `<td colspan="N">` slots |
| `.mob-table__skeleton` | one bar inside a real cell; `inline-block`, so the cell's line strut still sets the row height and the bar inherits the cell's `text-align` |

Header cells bake in the uppercase micro-label role rather than requiring `.mob-label` — a
column head that is not a micro-label is always a mistake. `<th scope="row">` in the body is a
cell, not a label: regular weight, primary ink.

The final body row's rule is **dropped, not removed** — the border is kept and only its colour
cleared, which holds the row exactly as tall as its siblings.

### Sorting

Prefer `<th aria-sort="…"><button>Label</button></th>`. The button is the thing that should be
focusable and announced, and it inherits the header type role. Both arrowheads are always
painted; nothing appears, disappears or resizes when the sort changes — only opacity and
colour move. Every hover state has a keyboard twin: the cell answers `:focus-within` and the
button answers `:focus-visible` with an `outline` (a spreading box-shadow would be clipped by
`.mob-table-scroll`, and its canvas-coloured inner band is wrong over an opaque sticky head).

### Row states

| State | Selector |
|---|---|
| Hover | `tbody tr:not([aria-disabled="true"]):hover` |
| Interactive | `.mob-table[data-mob-interactive]` (whole table) or `tr[data-mob-interactive]` (one row in a mixed list) |
| Pressed | `:active` → darker surface. Scaling a `<tr>` breaks the column grid and is unreliable in table layout. |
| Focus | `tr:focus-visible` and cell `:focus-visible` → inset `outline`, because a table-row box does not paint a box-shadow |
| Selected | `[data-mob-selected]` or `[aria-selected="true"]` → surface **and** a 2px start marker, so it survives hover and is not colour-only |
| Invalid | `[data-mob-invalid]` → negative tint + marker. Plus your own message; never colour alone. |
| Disabled | `[aria-disabled="true"]` → no marker, no hover surface, no pointer, actions withdrawn |
| Busy | `.mob-table[aria-busy="true"]` → the whole `tbody` dims in place and stops taking pointer events |

The start-edge marker is painted on **every** first cell but transparent until a row sets
`--mob-table-marker`, which keeps the selector flat and leaves `::before` free for the stacked
fallback's `data-label`.

### Row actions

Revealed by hover, but **always reachable by keyboard**: `opacity` only, never `display` or
`visibility`, or the focused button vanishes mid-tab and focus is lost. The reveal is gated on
`@media (hover: hover)` — where there is no hover to trigger it the actions simply stay
visible rather than becoming an invisible tap target. They also appear on `:focus-within` and
on a selected row.

Raise `--mob-table-actions-rest-opacity` from 0 to about `.5` for a product where users must
be told the actions exist before they hover.

### Loading

Two shapes, and neither resizes anything:

- **First load** — real `<tr>`/`<td>` rows holding `.mob-table__skeleton` bars, so the
  skeleton inherits the exact column geometry.
- **Refresh** — `aria-busy="true"` on the table: the rows stay put and dim in place.

### The stacked fallback

Stack only when the hierarchy survives the conversion — when a row is a small set of
independent facts about one entity. A row that is a **series to be compared** against the rows
above and below loses its whole point once the column disappears; wrap that table in
`.mob-table-scroll` and let it scroll.

Two consequences to design around:

- `display: block` strips table semantics from the accessibility tree. The printed
  `data-label` is what carries the column name; add explicit `role="table"`/`"row"`/`"cell"`
  if the semantics must survive.
- `<thead>` is **removed**, and with it any sortable controls — a `sr-only` thead would leave
  the sort buttons focusable but invisible, which is worse. Provide sorting and filtering
  outside the table on small screens.

### Component tokens

Geometry: `--mob-table-cell-px` / `-cell-py` · `--mob-table-head-h` (34px `[src]`) ·
`--mob-table-min-w` (`auto`; set to e.g. 720px to force scroll over squeeze) ·
`--mob-table-scroll-max-h` (`none`) · `--mob-table-sticky-offset`.
Surfaces: `--mob-table-head-bg` / `-head-fg` / `-head-fg-active` / `-head-rule` ·
`--mob-table-rule` / `-rule-vertical`.
Rows: `--mob-table-row-fg` / `-row-bg-hover` / `-row-bg-pressed` / `-row-bg-selected` /
`-row-bg-selected-hover` / `-row-bg-invalid` / `-row-bg-invalid-hover` / `-row-fg-disabled` ·
`--mob-table-marker` / `-marker-w`.
Actions and sort: `--mob-table-actions-rest-opacity` · `--mob-table-sort-w` / `-h` / `-gap` /
`-inset` / `-rest-opacity` / `-hover-opacity` / `-idle-opacity`.
Loading and slots: `--mob-table-skeleton-h` / `-w` / `-cycle` · `--mob-table-busy-opacity` ·
`--mob-table-slot-py` · `--mob-table-stacked-gap`.

Density rebinds `--mob-table-cell-py` / `-px` to 14/16, 10/12 and 6/10.

### Markup

```html
<div class="mob-table-scroll">
  <table class="mob-table mob-table--sticky-head mob-table--stacked" data-mob-interactive>
    <caption>Open positions</caption>
    <thead>
      <tr>
        <th scope="col">Pool</th>
        <th scope="col" class="mob-th--num mob-th--sortable" aria-sort="descending">
          <button type="button">Value</button>
        </th>
        <th scope="col" class="mob-th--end"><span class="mob-sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      <tr data-mob-selected aria-selected="true">
        <th scope="row" data-label="Pool">ETH / USDG</th>
        <td class="mob-td--num" data-label="Value">$31.12</td>
        <td class="mob-td--end">
          <div class="mob-row-actions">
            <button class="mob-icon-btn mob-icon-btn--sm mob-icon-btn--quiet"
                    type="button" aria-label="Close ETH / USDG position">×</button>
          </div>
        </td>
      </tr>
      <tr data-mob-invalid>
        <th scope="row" data-label="Pool">WBTC / USDG</th>
        <td class="mob-td--num" data-label="Value">—</td>
        <td class="mob-td--end">
          <span class="mob-error-state">
            <span class="mob-error-state__icon"></span>
            <span class="mob-error-state__message">Close failed</span>
            <button class="mob-error-state__retry" type="button">Retry</button>
          </span>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr><th scope="row">Total</th><td class="mob-td--num">$31.12</td><td></td></tr>
    </tfoot>
  </table>
</div>
```

### Accessibility

- `<caption>`, `scope="col"` / `scope="row"`, and a real `<thead>` — `06-accessibility.md §3`.
- `aria-sort` goes on the `<th>`, one column at a time.
- `aria-selected` on a selected row alongside `data-mob-selected`; `aria-disabled` (not
  `disabled`) on a dead row, and disable the controls inside it too.
- `aria-busy="true"` on the table during a refresh.
- Icon-only row actions need names that identify the **row**, not just the verb: "Close ETH /
  USDG position", not "Close".
- `.mob-table-scroll` is keyboard-focusable in its own right; that is how a keyboard user
  scrolls a wide table holding no focusable cell. Do not remove its ring.

---

## 19. Data marks

`components/dataviz.css`. Six marks and one identity system, all derived from the calibrated
handoff but named for **any** product. The handoff's visuals were domain-specific (a liquidity
range, a PnL curve, an asset split). Nothing of that survives here except the geometry. A
meter is "where does the current value sit inside a bounded range, at N buckets of
granularity" — that is a price ladder, a battery, a rate limit, a release window, a score
band. **Do not re-specialise these names.**

### Seven rules

1. **These are marks, not charts.** No axes, no gridlines, no tooltips, no titles. A chart is
   a mark composed with layout primitives and type roles.
2. Every mark is a shrinkable block: it fills the column it is given and never sets its own
   inline-size.
3. **Series colour identifies an entity. It is never decoration.** The same entity is the same
   series everywhere it appears — bar segment, legend swatch, avatar, chip, sparkline — and a
   series is assigned from data identity, never from position in a list. There is deliberately
   no "cycle colours by nth-child" helper: it would reassign every colour the moment the sort
   order changed.
4. **A mark is an image to assistive tech.** Give it `role="img"` and an `aria-label` that
   states the value in words, or render a `.mob-sr-only` sentence beside it. Colour is never
   the only signal — the meter has its status text, the delta has its glyph, the legend has
   its label.
5. **Loading never resizes anything.** Every mark reserves its own box and `[data-mob-loading]`
   only swaps ink for a tile in place. Set `aria-busy`.
6. Tone names here are **valence** (`accent` / `positive` / `negative` / `neutral` / `warning`
   / `info`), matching `base.css`'s `.mob-tone-*` rather than `feedback.css`'s messaging
   names. `success` / `error` are accepted as aliases so one tone value can be piped from a
   data layer to both.
7. **Interactivity is opt-in and must use real controls.** A clickable bin, segment or legend
   row is a `<button>`, not a `<div>` with a handler.

Motion: colour, opacity, box-shadow and transform only. Nothing here transitions geometry — a
bin's height and a segment's width are data, and animating data into place lies about when it
changed.

### 19.1 Series identity

The one sanctioned way to pick a categorical colour. A component reads `--mob-series-color`
(mark), `--mob-series-tint` (fill behind a glyph) and `--mob-series-glyph` (that glyph's ink);
it never reads `--mob-series-N` directly.

| Form | |
|---|---|
| `.mob-series-1` … `.mob-series-8` | class form |
| `[data-mob-series="1"]` … `"8"` | attribute form — usually easier when the number comes from data |

The two are exactly equivalent. Single-property helpers, so they compose:

| Helper | Property | Fallback when no series is set |
|---|---|---|
| `.mob-series-fg` | `color` | `--mob-fg-secondary` |
| `.mob-series-mark` | `background-color` | `--mob-accent` |
| `.mob-series-border` | `border-color` | `--mob-border-control` |
| `.mob-series-bg` | `background-color` + `color` | `--mob-bg-tile` + `--mob-fg-secondary` |

The fallbacks matter: a helper used without a series must still paint something legible rather
than dropping the property.

### 19.2 Meter — the bin row

**The signature data mark.** A bounded range at N buckets of granularity.

```
.mob-meter-frame
  ├ .mob-meter-frame__head
  │   ├ .mob-meter-frame__label     micro-label, e.g. "RANGE"
  │   └ .mob-meter-frame__value     current readout, e.g. "$0.01450 spot"
  ├ .mob-meter                      grid of N bins, baseline-aligned
  │   └ .mob-meter__bin [--empty] [data-mob-active]
  └ .mob-meter-frame__foot
      ├ .mob-meter-frame__min
      ├ .mob-meter-frame__status    tone-coloured: "In range", "Above · sold"
      └ .mob-meter-frame__max

┌ label ───────────────────── value ┐
│ ▍▍▍▍▍▍▍▍▍▍▍▍▍▍▍█                  │   inactive bin: --mob-meter-bin-h  15px [src]
│ min ········ status ········ max  │   active bin:   --mob-meter-h      22px [src]
└───────────────────────────────────┘
```

Rules that are not optional:

- **Bin count is data granularity, not decoration.** Set `--mob-meter-bins` to the number of
  buckets the range is divided into and render that many children. The handoff's 16 is one
  position's rung count, nothing more. Never hardcode it, in CSS or in a markup loop.
- **Exactly one bin carries `[data-mob-active]`** — the bucket holding the current value. It
  grows to the full row height and takes the active tone plus a glow. Height is data, so it is
  not transitioned.
- **When the value sits outside the range, the edge bin nearest the value is the active one
  and `__status` must say so** ("Above", "Below"). The mark alone cannot distinguish "at the
  top bucket" from "past the top bucket", so the text is not optional.
- Bins beyond the filled portion of a partial distribution take `--empty`. A meter with no
  empty bins is a full range; one with empty bins is a range that is only partly populated.
- The axis runs along the **inline** axis, so it mirrors under RTL. If the scale must stay
  min→max left-to-right regardless of the surrounding text — usually true for a numeric axis —
  put `dir="ltr"` on the `.mob-meter` itself.

| Class | Notes |
|---|---|
| `.mob-meter-frame` | label row + mark + min/status/max row. Also the right frame for a `.mob-gauge`. |
| `.mob-meter-frame__head` / `__label` / `__value` | `__label` reproduces the `.mob-label` role so the frame is complete on its own |
| `.mob-meter-frame__foot` / `__min` / `__status` / `__max` | `__status` takes the slack between the bounds so it is *centred between them*, not merely pushed apart by `space-between`, which drifts as the bounds change width |
| `.mob-meter` | `grid-template-columns: repeat(var(--mob-meter-bins, 16), minmax(0, 1fr))`, `align-items: end` |
| `.mob-meter__bin` | one local, `--mob-meter-bin-color`, does all the painting |
| `.mob-meter__bin--empty` | a bucket that exists but holds nothing; sits at inactive height so the row still reads as one scale |
| `.mob-meter--interactive` | bins become `<button>`s |
| `.mob-meter-frame--positive` `--negative` `--warning` `--info` `--neutral` | tone on the frame — bins, status text and a gauge in the same frame all move together |
| `.mob-meter--positive` `--negative` `--warning` `--info` `--neutral` | tone on one mark |

`[data-mob-tone]` is equivalent to each tone modifier on both blocks, and works on a **single
bin** too, for a distribution whose buckets mean different things (in-range / out-of-range,
pass / fail). A bin may also carry `[data-mob-series]`.

Neutral has **no glow**: a glow is emphasis, and neutral is the absence of it.

Interactive bins: a bin is 6px wide and has no affordance of its own, so hover previews the
active tone rather than inventing a third colour. `[aria-pressed]` / `[aria-selected]` ring
the bin instead of changing its height — **selected is interaction, active is data**, and both
can be true at once.

States: `[data-mob-loading]` drains the colour but holds the exact geometry — same bin count,
same heights; `[data-mob-error]` flattens the bins and `.mob-meter-frame[data-mob-error]`
turns the status line negative. Failure is stated in words as well as in tone.

```html
<div class="mob-meter-frame">
  <div class="mob-meter-frame__head">
    <span class="mob-meter-frame__label">RANGE</span>
    <span class="mob-meter-frame__value">$0.01450 spot</span>
  </div>

  <div class="mob-meter" dir="ltr" style="--mob-meter-bins:16"
       role="img" aria-label="Spot $0.01450 — bucket 11 of 16, in range">
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin"></span>
    <span class="mob-meter__bin" data-mob-active></span>
    <span class="mob-meter__bin mob-meter__bin--empty"></span>
    <span class="mob-meter__bin mob-meter__bin--empty"></span>
    <span class="mob-meter__bin mob-meter__bin--empty"></span>
    <span class="mob-meter__bin mob-meter__bin--empty"></span>
    <span class="mob-meter__bin mob-meter__bin--empty"></span>
  </div>

  <div class="mob-meter-frame__foot">
    <span class="mob-meter-frame__min">$0.01120</span>
    <span class="mob-meter-frame__status">In range</span>
    <span class="mob-meter-frame__max">$0.01780</span>
  </div>
</div>
```

Tokens: `--mob-meter-bins` (16 `[src]`) · `--mob-meter-radius` (3px `[src]`) ·
`--mob-meter-fill` / `-empty` / `-active` / `-active-glow` / `-status` ·
`--mob-meter-bin-color` (per-bin local) · `--mob-meter-head-gap` (11px `[src]`) /
`-foot-gap` (7px `[src]`) · `--mob-meter-value-size` / `-foot-size`. `tokens.css` owns
`--mob-meter-h` (22px), `--mob-meter-bin-h` (15px) and `--mob-meter-gap` (3px), all `[src]`.

### 19.3 Bar stack — composition

One line split by weight: asset mix, storage by type, traffic by source, votes by option.

| Class | Notes |
|---|---|
| `.mob-bar-stack` | flex row, `gap: --mob-bar-gap` (2px `[src]`), `block-size: --mob-bar-h` (5px `[src]`) |
| `.mob-bar-stack--lg` | 8px `[drv]` |
| `.mob-bar-stack__seg` | `flex: var(--mob-bar-weight, 1) 1 0`, `min-inline-size: --mob-bar-seg-min` (2px) |
| `.mob-bar-stack__seg--empty` | the unallocated remainder. Reads as track, not as a series, so it never appears in the legend — and drops the 2px floor, because nothing is not worth a floor. |
| `.mob-bar-stack--interactive` | segments become `<button>`s; hovering one mutes the rest, the same effect a legend hover produces through `[data-mob-dim]` |

**Weights are relative**, so raw values work unnormalised. `--mob-bar-weight` is set per
instance in markup, because only the data knows it.

A series with a real, non-zero share must never round away to nothing — hence the 2px floor. A
series worth **zero is omitted from the markup**; it is not a 0-weight segment, or the floor
would draw a share that does not exist.

```html
<div class="mob-bar-stack" role="img" aria-label="ETH 59.7%, USDG 39.9%, other 0.4%">
  <span class="mob-bar-stack__seg" data-mob-series="1" style="--mob-bar-weight:597"></span>
  <span class="mob-bar-stack__seg" data-mob-series="2" style="--mob-bar-weight:399"></span>
  <span class="mob-bar-stack__seg" data-mob-series="3" style="--mob-bar-weight:4"></span>
</div>
```

### 19.4 Spark — and why its gradient lives in markup

An SVG gradient needs an element with an `id` for `fill="url(#id)"` to reference, and CSS
cannot invent one. So the `<defs>` block is authored **per instance** — but its stops carry no
colour of their own: `.mob-spark__stop-from` / `__stop-to` are styled from `--mob-spark-color`
and the calibrated `--mob-spark-fill-from` / `-fill-to` opacities (`.28` / `.02` `[src]`). One
tone class retones stroke and fill together, and no consumer ever writes a colour. CSS beats
presentation attributes, so a stray `stop-color="…"` in a template loses to the token.

```html
<div class="mob-spark mob-spark--positive">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none"
       role="img" aria-label="Realized PnL, up 4.2% over 30 days">
    <defs>
      <linearGradient id="spark-pnl" x1="0" y1="0" x2="0" y2="1">
        <stop class="mob-spark__stop-from" offset="0"></stop>
        <stop class="mob-spark__stop-to"   offset="1"></stop>
      </linearGradient>
    </defs>
    <path class="mob-spark__area" fill="url(#spark-pnl)"
          d="M0,78 L26,44 L60,20 L96,11 L96,100 L0,100 Z"></path>
    <path class="mob-spark__line"
          d="M0,78 L26,44 L60,20 L96,11"></path>
  </svg>
</div>
```

- **The `id` must be unique per instance.** Two sparks sharing one id means the second paints
  with the first one's stops.
- Plot into a 0–100 box on both axes and let `preserveAspectRatio="none"` stretch it to the
  container. Y is inverted: `y = 100 − (v − min) / (max − min) * 100`.
- The stroke survives that stretch only because of `vector-effect: non-scaling-stroke`. That
  is also why the mark **must not contain circles or text** — anything but a stroke is
  distorted by the non-uniform scale. If you need point markers, use a 1:1 viewBox and a fixed
  size instead.
- The area path is the line path plus two corners back along the baseline. Omit it entirely
  for a line-only spark; nothing else changes.
- `.mob-spark > svg` gets `overflow: visible`, because a 1.6px stroke at `y=0` would otherwise
  clip in half.

| Class | |
|---|---|
| `.mob-spark` | 46px `[src]`; also exposes the colour as `color`, so a consumer's own inline SVG can use `stroke="currentColor"` without knowing the token name |
| `.mob-spark--sm` / `--lg` | 24px / 72px `[drv]` |
| `.mob-spark--accent` `--positive` `--negative` `--neutral` `--warning` `--info` | tone |
| `[data-mob-sign]` — `positive`, `negative`, `neutral` | the same three tones, so a series that flips sign retones without the markup changing class |
| `.mob-spark__line` / `__area` / `__stop-from` / `__stop-to` | the parts |

`[data-mob-loading]` shows a flat tile, `[data-mob-error]` a dashed track; both hold the
reserved height and hide the `<svg>`. The message belongs *beside* the mark
(`.mob-error-state`), not inside it — there is no room for words in 46px.

### 19.5 Delta

A signed change, read at a glance.

| Class | |
|---|---|
| `.mob-delta` | mono, tabular, baseline-aligned. Declares `font-family` explicitly because a delta often sits inside a sans figure block and must not inherit it. |
| `.mob-delta--sm` / `--lg` | 9.5px / 13px |
| `.mob-delta--muted` | `--mob-fg-muted` |
| `.mob-delta__glyph` | ▲ / ▼ / – drawn in CSS **only while empty**, so a real icon simply wins. One shape, rotated for sign — an arrow and its opposite can never drift apart. Sized in `em` (`.62em`, the mono cap height) so it reads as a character on the baseline, not a bullet floating beside one. |
| `.mob-delta__value` | tabular |
| `.mob-delta__label` | optional qualifier, e.g. "24h" |

Tone comes from `[data-mob-sign]`, read through the local `--mob-delta-color` so `base.css`'s
global `[data-mob-sign]` colour rule cannot be silently overridden.

A delta is occasionally the control that switches the comparison window. When it is a real
`<a>` or `<button>` it gets the full state set — hover, focus ring, press, disabled.

`[data-mob-loading]` reserves the value's width and hides its ink behind a tile; **the glyph
goes**, because a direction is exactly what is not yet known. Give the value a non-breaking
placeholder of the right length.

```html
<span class="mob-delta" data-mob-sign="positive">
  <span class="mob-delta__glyph" aria-hidden="true"></span>
  <span class="mob-delta__value">+0.67%</span>
  <span class="mob-delta__label">24h</span>
</span>
```

### 19.6 Legend

A legend is not decoration around a chart; it is the only thing that makes a series colour
mean anything to someone who cannot resolve the hue.

| Class | |
|---|---|
| `.mob-legend` | wrapping row |
| `.mob-legend--stack` | one entity per row, values right-aligned into a column — the form that replaces a table when there is no room for one |
| `.mob-legend--dot` | round swatches, for a line/point chart. Pick one per product and stay with it. |
| `.mob-legend--interactive` | rows become `<button>`s that filter or highlight; the padded hit area is pulled back out with a negative margin so the labels stay optically flush with the mark above them |
| `.mob-legend__item` / `__swatch` / `__label` / `__value` | the parts |

Selected: the label goes to primary ink **and** the swatch gains a ring, so selection survives
a screenshot in greyscale. Disabled: the swatch loses its identity colour and goes flat —
which is what stops it reading as an ordinary row you simply have not hovered yet.

### 19.7 Gauge

One value inside known bounds. **The meter answers "which bucket"; the gauge answers "how far
along".**

| Class | |
|---|---|
| `.mob-gauge` | the track, 6px `[drv]` — one step over the 5px bar, because the needle needs room |
| `.mob-gauge__fill` | start → value |
| `.mob-gauge__threshold` | optional target / limit tick. Quiet by design: it is a reference, never the subject. |
| `.mob-gauge__marker` | the value needle, overhanging 3px each end |
| `.mob-gauge--flat` | hides the marker — a plain fill for progress-like values |
| `.mob-gauge--positive` `--negative` `--warning` `--info` `--neutral`, or `[data-mob-tone]` | tone; the marker follows it, so a gauge in the red does not carry a violet needle |

`--mob-gauge-value` and `--mob-gauge-threshold` are percentages set per instance and
`clamp()`ed into the track. **Out of bounds is a fact about the data** — say it in the frame's
status line; do not let the mark quietly lie about the maximum.

Wrap it in `.mob-meter-frame` for the label / min / max / status furniture. Both are range
marks and share that frame deliberately.

```html
<div class="mob-gauge" role="img" aria-label="Storage: 64% of 2 TB used"
     style="--mob-gauge-value:64%">
  <span class="mob-gauge__fill"></span>
  <span class="mob-gauge__threshold" style="--mob-gauge-threshold:80%"></span>
  <span class="mob-gauge__marker"></span>
</div>
```

### 19.8 Cross-mark link-up

One attribute mutes every other mark on the screen:

```js
el.toggleAttribute('data-mob-dim', id !== activeId)
```

`[data-mob-dim]` is honoured on `.mob-meter__bin`, `.mob-bar-stack__seg`,
`.mob-legend__item`, `.mob-spark` and `.mob-gauge`. Opacity only — a dimmed mark must not
move, resize or reflow. Keeping it in one attribute is what stops each chart inventing its own
hover language. Under `forced-colors: active` the dimming is disabled, because it is invisible
against a forced palette and only harms legibility.

### 19.9 Forced colours

Every hue is replaced by the OS palette, so series identity — the whole point of the colour —
is gone. The marks stay readable as **shape**, and the legend's text label becomes the only
thing naming a series. That is precisely why a legend may never identify a series by swatch
alone. Sparkline gradients do not survive; the line does.

### Shared dataviz tokens

`--mob-dataviz-dir` (inline-axis sign, −1 under RTL) · `--mob-dataviz-dim` (.38) ·
`--mob-dataviz-glow-blur` (11px `[src]`) / `-glow-alpha` (40% `[src]`) ·
`--mob-dataviz-emphasis` (16% — a mix toward the primary *text* colour, not toward white, so
the same rule brightens on dark and darkens in light) · `--mob-dataviz-ring-bg` /
`--mob-dataviz-ring` (marks: 1px gap + 2px ring) / `--mob-dataviz-ring-item` (legend rows:
full-size ring).

The two ring tokens are refinements, not deletions: around a 6px bin the global 4px ring is
more ring than mark, and `--mob-radius-sm` would round a 3px bar into a lozenge.

---
---

# Navigation

`components/nav.css`. Four navigation surfaces, one grammar. They share a rest tone (muted), a
hover tone (primary), `--mob-focus-ring`, and the press scale. What differs is **how "you are
here" is drawn**, and that difference is deliberate: two navigation layers stacked on one
screen must not signal current-ness the same way.

| Surface | Current is drawn as |
|---|---|
| navbar | a quiet accent wash + primary text — **never** an underline |
| sidebar | a quiet wash + an inline-start accent marker |
| tabs | an indicator (underline bar or plate) |
| breadcrumbs | plain text, not a link at all |

A navbar that underlines its current item competes with the tab strip below it; a sidebar that
fills every row with an accent pill turns navigation into a wall of CTAs.

Every interactive selector here states its own `:focus-visible` rather than leaning on the
`base.css` contract, because that contract also stamps `--mob-radius-sm` on whatever it lands
on: a crumb (6px) and a pill (full) would both square off to 8px on tab.

### States shipped

`—` means the state has no meaning here.

| | default | hover | focus | pressed | selected | disabled | loading | error |
|---|---|---|---|---|---|---|---|---|
| navlink | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| sidebar item | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| tab | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | list-level | — |
| breadcrumb link | ✓ | ✓ | ✓ | ✓ | — | — | — | — |

**Error is not a navigation state**: the surface that failed to load owns the error, the nav
that points at it does not. **Loading is** — a pending route — and it is drawn without ever
changing an element's size.

### Consumer rules

1. Current page is `aria-current="page"` on the link. Never a class. A tab uses
   `aria-selected="true"`; a disabled item uses `aria-disabled="true"` (or `disabled` on a
   `<button>`).
2. Icon-only controls (the toggle, collapsed sidebar rows) need `.mob-sr-only` text or an
   `aria-label`. Collapsed rows also want a `title`.
3. `.mob-navbar--sticky` needs an opaque bar. Do not pair it with `--transparent` unless the
   page also sets `[data-mob-scrolled]` from a scroll listener — otherwise content scrolls
   under transparent glass.
4. Under a sticky navbar, set
   `--mob-sidebar-sticky-offset: calc(var(--mob-navbar-h) + var(--mob-hairline))` on
   `.mob-sidebar--sticky`. The hairline is part of the bar's box at all times, so leaving it
   out docks the rail 1px high.
5. `--underline` is the dominant tab variant. Read §22 before reaching for the others.

## 20. Navbar and navlink

### Anatomy

```
.mob-navbar                     full-bleed bar: surface, hairline, sticky
├── .mob-navbar__inner          max-width container, one flex row
│   ├── .mob-navbar__brand      mark + wordmark (sans 600, the only sans here)
│   │   └── .mob-navbar__mark   optional logo box
│   ├── .mob-navbar__nav        <ul> of .mob-navlink            (hidden < md)
│   │   └── .mob-navlink        └── .mob-navlink__icon  optional leading slot
│   ├── .mob-navbar__spacer     flex:1 — the ONLY flexible child   [src]
│   ├── .mob-navbar__actions    secondary controls
│   ├── .mob-navbar__account    account / wallet slot
│   └── .mob-navbar__toggle     menu trigger, [aria-expanded]     (shown < md)
│       └── .mob-navbar__toggle-icon   CSS-drawn glyph, morphs to a close mark
└── .mob-navbar__drawer         mobile panel, [data-mob-open]
    ├── .mob-navbar__drawer-label     section heading
    ├── .mob-navbar__drawer-divider   hairline seam
    └── .mob-navlink                  full-width, touch-sized rows
```

### Classes

| Class | Effect |
|---|---|
| `.mob-navbar` | `--mob-navbar-bg` + a block-end hairline that is **always in the box, transparent at rest** — scrolling paints it rather than adding it, so `[data-mob-scrolled]` can never shift the page 1px |
| `.mob-navbar--sticky` | sticky at 0, `z-index: --mob-z-sticky`. Opt-in. |
| `.mob-navbar--transparent` | `--mob-navbar-bg: transparent`, for a bar over a hero |
| `.mob-navbar--bordered` | always-on hairline |
| `.mob-navbar--content` | `--mob-navbar-max-w: --mob-container-content` — editorial shell |
| `.mob-navbar--compact` | 48px inner row instead of 56 |
| `.mob-navbar__inner` | `block-size: --mob-navbar-h` (56px `[drv]`), max-width, `padding-inline: --mob-navbar-px` (26px `[src]`) |
| `.mob-navbar__brand` | the one place sans 600 appears. **No hover colour** — a wordmark is an identity, not a link that lights up. |
| `.mob-navbar__mark` | 20px logo box, accent-tinted |
| `.mob-navbar__nav` | the `<ul>`; `> li` gets `display: contents`, so `<li>` wrappers are optional and carry no layout |
| `.mob-navbar__spacer` | **the only flexible child** `[src]` — actions and account keep their intrinsic size, exactly as the handoff's header row does |
| `.mob-navbar__actions` / `__account` | slots. `__account` is a slot, not a control: put a button, menu trigger or wallet chip inside it; do not style the slot as if it were clickable. |
| `.mob-navbar__toggle` | hidden above `--mob-bp-md`, `display: inline-grid` below. `[aria-expanded]` drives both its border and the glyph. |
| `.mob-navbar__toggle-icon` | two CSS bars that rotate into a close mark. No icon dependency. |
| `.mob-navbar__drawer` | docked under the bar — not a side sheet: no scrim, no page lock. Enters with opacity + a 6px translate and **never animates its height**, so a long menu cannot judder the page. Removed entirely above `--mob-bp-md`, so a rotation never leaves an open drawer behind. |
| `.mob-navbar__drawer-label` / `-divider` | section heading and hairline seam |
| `.mob-navlink` | S-step row: 30px, mono 12px, muted at rest |
| `.mob-navlink__icon` | 16px leading slot, inherits the link's tone |

Drawer rows are full-width and touch-sized (L step): the bar's compact rhythm does not survive
the move to a phone.

### Navlink states

| State | Selector | Effect |
|---|---|---|
| Hover | `:hover` | primary text on a 6% text-colour wash |
| Pressed | `:active` | press scale |
| Focus | `:focus-visible` | ring at `--mob-navlink-radius` |
| Current | `[aria-current="page"]` | **15% accent wash under primary text** — not `fg-on-accent` on a solid fill, which is the primary button. The item must read as "where you are", not "press me". |
| Disabled | `[aria-disabled="true"]` / `:disabled` | contrast down **and** affordance gone: no wash, no pointer, no press |
| Loading | `[data-mob-loading]` | a `--mob-fg-dim` hairline at the block edge pulses until the route resolves. Never accent, so it can never be mistaken for the current-page marker. The label does not move, resize or disappear. |

The washes are declared on `:root, [data-mob-theme]`, not on `:root` alone. A custom property
is substituted where it is **declared**, not where it is used — a wash declared only on `:root`
would bake in the dark accent and keep it inside a nested `<div data-mob-theme="light">`.

### Markup

```html
<header class="mob-navbar mob-navbar--sticky" data-mob-scrolled>
  <div class="mob-navbar__inner">
    <a class="mob-navbar__brand" href="/">
      <span class="mob-navbar__mark" aria-hidden="true"><!-- svg --></span>mobb
    </a>

    <ul class="mob-navbar__nav">
      <li><a class="mob-navlink" href="/positions" aria-current="page">Positions</a></li>
      <li><a class="mob-navlink" href="/activity">Activity</a></li>
      <li><a class="mob-navlink" href="/settings" data-mob-loading>Settings</a></li>
    </ul>

    <span class="mob-navbar__spacer"></span>
    <div class="mob-navbar__actions">
      <button class="mob-btn mob-btn--sm mob-btn--ghost" type="button">Docs</button>
    </div>
    <div class="mob-navbar__account">
      <span class="mob-chip"><span class="mob-chip__dot"></span>0x7a3f…c2d1</span>
    </div>

    <button class="mob-navbar__toggle" type="button"
            aria-expanded="false" aria-controls="nav-drawer" aria-label="Menu">
      <span class="mob-navbar__toggle-icon"></span>
    </button>
  </div>

  <div class="mob-navbar__drawer" id="nav-drawer">
    <p class="mob-navbar__drawer-label">Product</p>
    <a class="mob-navlink" href="/positions" aria-current="page">Positions</a>
    <a class="mob-navlink" href="/activity">Activity</a>
    <div class="mob-navbar__drawer-divider"></div>
    <a class="mob-navlink" href="/settings">Settings</a>
  </div>
</header>
```

Toggle `data-mob-open` on `.mob-navbar__drawer` and keep `aria-expanded` on the trigger in
sync. Wrap the whole bar in a `<nav aria-label="…">` (or use `<header>` + a nested `<nav>`) so
the landmark is announced.

## 21. Sidebar

Stable width, grouped sections, compact rows. **The current row is a quiet surface plus a 2px
accent marker on the inline-start edge — not a filled rounded pill.** The marker is the signal;
the wash only stops the row from floating.

```
.mob-sidebar
├── .mob-sidebar__header
├── .mob-sidebar__group
│   ├── .mob-sidebar__group-label
│   └── .mob-sidebar__item          <a> or <button>
│       ├── ::before                inline-start marker: current | pending
│       ├── .mob-sidebar__icon      optional leading slot
│       ├── .mob-sidebar__label
│       └── .mob-sidebar__badge     optional trailing count / status
└── .mob-sidebar__footer
    └── .mob-sidebar__toggle        collapse trigger, [aria-expanded]
```

| Class | Effect |
|---|---|
| `.mob-sidebar` | 240px `[drv]` — labels only; the 288px rail carries data, this does not |
| `.mob-sidebar--bordered` | inline-end border; becomes a block-end border below `--mob-bp-md` |
| `.mob-sidebar--sticky` | sticky at `--mob-sidebar-sticky-offset`, full-height |
| `.mob-sidebar--collapsible` + `[data-mob-collapsed]` | 56px icon rail; labels, badges and group labels are removed and groups gain a hairline seam |
| `.mob-sidebar__group-label` | restates the `.mob-label` role so a group heading is correct without a second class |
| `.mob-sidebar__item` | S-step row |
| `.mob-sidebar__badge` | tone it with the `.mob-tone-*` utilities from `base.css` — there are deliberately no colour variants here |
| `.mob-sidebar__toggle` | collapse trigger; its `> svg` rotates 180° at `[aria-expanded="false"]` and mirrors under RTL |

The marker is **always in the box, scaled to nothing until it is earned**, so it grows with a
transform rather than appearing and reflowing the row. `[data-mob-loading]` reuses the same
slot in `--mob-fg-dim` and pulses it: "loading" and "current" are never confused, and nothing
in the row moves.

The current row does **not** brighten further on hover — it is already the loudest row in the
rail, and a second step just makes the list flicker under the mouse.

**Collapse is instant.** Transitioning width is forbidden by the motion policy, and a 200ms
width tween would drag every row of the app beside it. A collapsed row is icon-only: it needs
a `title` or `aria-label` to stay usable.

```html
<nav class="mob-sidebar mob-sidebar--bordered mob-sidebar--sticky" aria-label="Sections"
     style="--mob-sidebar-sticky-offset: calc(var(--mob-navbar-h) + var(--mob-hairline))">
  <div class="mob-sidebar__header">…</div>

  <div class="mob-sidebar__group">
    <p class="mob-sidebar__group-label">Product</p>
    <a class="mob-sidebar__item" href="/positions" aria-current="page">
      <span class="mob-sidebar__icon" aria-hidden="true"><!-- svg --></span>
      <span class="mob-sidebar__label">Positions</span>
      <span class="mob-sidebar__badge">12</span>
    </a>
    <a class="mob-sidebar__item" href="/activity">
      <span class="mob-sidebar__icon" aria-hidden="true"><!-- svg --></span>
      <span class="mob-sidebar__label">Activity</span>
    </a>
  </div>

  <div class="mob-sidebar__footer">
    <button class="mob-sidebar__toggle" type="button" aria-expanded="true">
      <svg aria-hidden="true"><!-- chevron --></svg>
      <span class="mob-sr-only">Collapse sidebar</span>
    </button>
  </div>
</nav>
```

## 22. Tabs

**The dominant variant is `--underline`.** Use it unless you have a reason not to: it is the
only one that adds no surface, no border and no radius to the page, which is what keeps a tab
strip from reading as a row of independent buttons. Reach for the others only when the strip
must survive without a baseline to sit on.

| Variant | When |
|---|---|
| `.mob-tabs--underline` | the default. The list carries the baseline; the indicator sits on top of it. No hover background — tone alone separates the states, which is what stops five tabs from looking like five ghost buttons. |
| `.mob-tabs--contained` | a plate inside a sunken trough. Use when the strip floats in a card header with no full-width edge to underline. 34 tab + 2 + 2 trough padding + 1 + 1 border = **40px, exactly control L**, so the strip lines up with a button beside it. |
| `.mob-tabs--pill` | loose standalone filters — a 15% accent wash under primary text. The least tab-like of the three; do not use it for primary page-level navigation. |
| `.mob-tabs--scroll` | horizontal overflow for narrow columns and phones. The edge fade is a symmetric mask, so it is RTL-safe; the scrollbar is hidden because the fade is the affordance. |

**Tabs are never CTAs**: no accent fill, no on-accent text, no border per tab. The selected tab
is marked by **one** indicator drawn in `::before` — always present, so selecting a tab is a
transform, never an insertion — and it animates with transform + opacity only. `::after`
belongs to `base.css` (the coarse-pointer hit target); do not claim it.

| Class | |
|---|---|
| `.mob-tabs` | the strip; `> li` gets `display: contents` |
| `.mob-tab` | 34px (`--mob-header-row-h`), mono 13px, `isolation: isolate` so the indicator can sit behind the label |
| `.mob-tab__label` | |
| `.mob-tab__count` | tabular, dim; brightens on the selected tab |

Selection is `[aria-selected="true"]`, scoped as `.mob-tabs .mob-tab[aria-selected='true']` —
the `.mob-tabs` prefix is load-bearing, not decoration: each variant sets the indicator's rest
transform at the same specificity and wins on source order, which would otherwise leave every
selected indicator frozen at its rest scale (a 40%-wide underline stub).

A disabled tab grows no indicator, with one deliberate exception: a tab that is disabled **and**
selected keeps its indicator, because it still marks the panel you are looking at — only its
label drops to the disabled tone.

`.mob-tabs[data-mob-loading]` draws an indeterminate hairline under the list. The tabs
themselves stay put and keep their labels and their width.

```html
<div class="mob-tabs mob-tabs--underline mob-tabs--scroll" role="tablist" aria-label="Views">
  <button class="mob-tab" type="button" role="tab" id="tab-open"
          aria-selected="true" aria-controls="panel-open">
    <span class="mob-tab__label">Open</span>
    <span class="mob-tab__count">12</span>
  </button>
  <button class="mob-tab" type="button" role="tab" id="tab-closed" tabindex="-1"
          aria-selected="false" aria-controls="panel-closed">
    <span class="mob-tab__label">Closed</span>
    <span class="mob-tab__count">148</span>
  </button>
</div>
<div id="panel-open" role="tabpanel" aria-labelledby="tab-open">…</div>
```

Roving `tabindex` and arrow-key movement are yours to implement — `06-accessibility.md §5`.

## 23. Breadcrumbs

**Use only for genuine hierarchy depth — three levels or more, where a user can actually be
lost.** Do not add them to a shallow app because a template has them; in a two-level product a
back link is the honest control.

The current page is the last item and is **not a link**: mark it `<span aria-current="page">`,
so there is nothing to click that does nothing.

| Class | |
|---|---|
| `.mob-breadcrumbs` | the `<ol>`. Wrap it in `<nav aria-label="Breadcrumb">`. |
| `.mob-breadcrumbs__item` | the `<li>`; the separator is drawn by `::after` from `--mob-breadcrumbs-separator` (`'/'`), so the markup stays a clean list |
| `.mob-breadcrumbs__icon` | optional leading mark on the first crumb — a sibling of the link inside the item |
| `.mob-breadcrumbs__link` | truncates at `--mob-breadcrumbs-item-max-w` (22ch); never wraps |

```html
<nav aria-label="Breadcrumb">
  <ol class="mob-breadcrumbs">
    <li class="mob-breadcrumbs__item">
      <span class="mob-breadcrumbs__icon" aria-hidden="true"><!-- svg --></span>
      <a class="mob-breadcrumbs__link" href="/">Home</a>
    </li>
    <li class="mob-breadcrumbs__item">
      <a class="mob-breadcrumbs__link" href="/positions">Positions</a>
    </li>
    <li class="mob-breadcrumbs__item">
      <span aria-current="page">ETH / USDG</span>
    </li>
  </ol>
</nav>
```

## Navigation tokens

Navbar: `--mob-navbar-h` (56) / `-h-compact` (48) / `-px` / `-max-w` / `-gap` / `-nav-gap` /
`-actions-gap` / `-brand-size` / `-mark-size` / `-toggle-size` / `-toggle-radius` /
`-toggle-bar-h` / `-toggle-bar-gap` / `-drawer-shift` · `--mob-navbar-bg` / `-bg-scrolled`.
Navlink: `--mob-navlink-h` / `-px` / `-radius` / `-size` · `--mob-navlink-bg-hover` /
`-bg-current` / `-bg-current-hover`.
Sidebar: `--mob-sidebar-w` (240) / `-w-collapsed` (56) / `-px` / `-py` / `-group-gap` /
`-section-gap` / `-item-h` / `-item-px` / `-item-gap` / `-item-radius` / `-item-size` /
`-marker-w` / `-marker-h` / `-sticky-offset` · `--mob-sidebar-bg` / `-bg-hover` /
`-bg-current`.
Tabs: `--mob-tab-h` (34 `[src]`) / `-px` / `-gap` / `-size` / `-radius` / `-bar-h` ·
`--mob-tabs-trough-pad` / `-fade` / `-bg-hover` / `-bg-selected` / `-loading-bar-w` /
`-loading-cycle` · `--mob-tab-indicator-z` / `-indicator-scale-rest` (.96) /
`--mob-tab-bar-scale-rest` (.4).
Breadcrumbs: `--mob-breadcrumbs-gap` / `-size` / `-radius` / `-item-max-w` / `-separator`.
Ambient: `--mob-nav-pending-cycle` (1400ms) · `--mob-nav-sweep-dir` (1, −1 under RTL).

On coarse pointers `--mob-navlink-h` and `--mob-sidebar-item-h` are raised to
`--mob-tap-target` (44px) at `:root`, and breadcrumb links grow their block padding. Nav rows
are real rows, so they take the floor directly rather than growing an invisible target on top
of a 30px box.

---
---

# Overlays

`components/overlay.css`. Everything that floats: tooltip, popover, menu, modal, bottom sheet,
drawer.

| Block | What it is |
|---|---|
| `.mob-tooltip` | supplemental text. **Never interactive.** |
| `.mob-popover` | interactive contextual panel (`__header` / `__body` / `__footer`) |
| `.mob-menu` | row list (`__item` / `__separator` / …) |
| `.mob-modal-backdrop` | scrim **and** centring layer |
| `.mob-modal` | dialog (`__header` / `__body` / `__footer`) |
| `.mob-drawer` | edge-anchored side panel, same bar grammar as the modal |

## 24. The state contract

Entrance and exit are driven by **one attribute**, so any framework can own the state without
this file knowing about it:

```
data-mob-state="open"      visible   (also the default — an overlay with no attribute
data-mob-state="closed"    hidden     is visible, which is what SSR and static docs want)
```

`closed` keeps the element in the DOM (`visibility: hidden`) so the exit animation can run.
Consumers that unmount instead simply never set it. **Do not combine `closed` with the global
`[hidden]` attribute** — `reset.css` makes that `display: none !important` and the exit is
skipped.

Side is declared the same way and only affects the direction of travel:

```
data-mob-side="top" | "bottom" | "start" | "end"          (default: bottom)
```

The closed position sits **behind** the trigger, so the overlay appears to come out of the
thing that opened it.

**Why `translate`/`scale` and not `transform`.** Every entrance animates the *individual*
transform properties. `transform` is left completely untouched so a positioning engine
(Floating UI writes `transform: translate3d(…)`) can own it without fighting the animation.
Same compositor path, same motion policy, different property.

Enter and exit differ only in duration and easing, both parked in variables
(`--mob-overlay-duration`, `--mob-overlay-ease`, `--mob-overlay-vis-delay`). The rule in effect
at the moment of the flip supplies them: entering reads the base rule, leaving reads the
`[closed]` rule. No JS timing, no duplicated shorthand.

## 25. What this file does **not** do

These are yours, and none of them is optional:

1. **Positioning.** Tooltip, popover and menu are unpositioned by default. Anchor them with a
   positioning engine, the popover API, or the CSS anchor block (§31).
2. **Outside-click and Escape.** `.mob-popover`, `.mob-menu`, `.mob-modal` and `.mob-drawer`
   MUST be dismissible by a click outside and by Escape. Nothing in CSS can do that.
3. **Focus.** Move focus into a modal/drawer on open, trap it while open, restore it to the
   trigger on close. Menus need roving focus (see `[data-mob-active]`).
4. **Body scroll lock** while a modal, sheet or drawer is open.
5. **Roles.** `role="tooltip"`, `role="dialog"` + `aria-modal`, `role="menu"` + `"menuitem"`
   or `role="listbox"` + `"option"`. The CSS reads `aria-*` for state, so the roles have to be
   right for the component to *look* right — that coupling is deliberate.

Dismiss on backdrop click by testing `e.target === e.currentTarget`; a click that started
inside the dialog must not close it.

### House rules observed here

- **Elevation ladder:** tooltip = `--mob-shadow-sm`, popover/menu = `--mob-shadow-md`,
  modal/drawer = `--mob-shadow-lg`. Cards still get **no** shadow — a floating surface is the
  one place blur is allowed to say "this is above everything".
- Every floating surface is bounded by `--mob-border-control`, one step stronger than a card's
  border, because it sits over a dimmed canvas.
- Dividers inside a floating surface use `--mob-overlay-divider`, not `--mob-border-subtle`:
  subtle is calibrated against the *card* surface and disappears on the elevated one.
- **Panels are focus landing spots, not controls.** `.mob-popover`, `.mob-menu`, `.mob-modal`
  and `.mob-drawer` explicitly cancel the ring `base.css` hands every `:focus-visible` element
  — including its 8px radius, which would deform a 12px modal. The controls *inside* them keep
  every ring they have.
- **No `backdrop-filter`.** Blur behind a dialog is glassmorphism and this system does not
  ship it.
- **No tooltip arrow**, deliberately. Depth here is a surface and a 1px border; an arrow would
  need a seam through that border and buys nothing at this scale. Proximity carries the
  anchoring.

## 26. Tooltip

```html
<div class="mob-tooltip" role="tooltip" id="tt-claim" data-mob-side="top" data-mob-state="closed">
  Claims accrued fees to your wallet.
  <span class="mob-tooltip__hint">⌘⏎</span>
</div>
```

`pointer-events: none` by rule, not by accident: a tooltip must never contain a link, a button
or selectable content, because it cannot be reached by keyboard or touch. **If the content
needs to be clicked, it is a popover.**

`.mob-tooltip__hint` is a quieter second line for a shortcut or a unit. Tokens:
`--mob-tooltip-bg` / `-border` / `-fg` / `-radius` / `-pad-y` / `-pad-x` / `-size`;
`--mob-tooltip-max-w` lives in `tokens.css`.

The tooltip runs at `--mob-duration-fast` in both directions — a hint arrives and leaves at
control speed, not at panel speed.

## 27. Popover

Interactive contextual content: filters, an account menu, compact settings.

| Class | |
|---|---|
| `.mob-popover` | `--mob-popover-w` (260px), flex column, `overflow: hidden` so the bars stay inside the radius |
| `.mob-popover--anchored` | opt in to CSS anchor positioning (§31) |
| `.mob-popover__header` / `__title` | `__title` reproduces the uppercase micro-label — the role that opens every data block in this system |
| `.mob-popover__body` | the scrolling part, capped at `--mob-popover-max-h` (420px) |
| `.mob-popover__body--flush` | padding becomes `--mob-menu-pad`, so a `.mob-menu--bare` inside sits exactly where a standalone menu's rows do |
| `.mob-popover__footer` | end-aligned actions |
| `.mob-popover__error` | inline message on the inline start; never a replacement for the panel |

`[aria-busy="true"]` or `[data-mob-loading]` dims the body in place. Geometry is untouched: the
panel keeps its width and its content keeps its box, so nothing reflows when the data lands.

## 28. Menu

```
.mob-menu                           surface AND scroll container
├── .mob-menu__group-label
├── .mob-menu__item                 the only interactive part
│   ├── .mob-menu__icon             16px leading slot
│   ├── .mob-menu__label            flexes, truncates
│   ├── .mob-menu__shortcut         trailing, mono, dim
│   └── .mob-menu__trailing         chevron / badge slot
├── .mob-menu__separator
└── .mob-menu__empty | .mob-menu__error
```

| Class | |
|---|---|
| `.mob-menu` | `min-inline-size: --mob-menu-min-w` (176px), `max-block-size: --mob-menu-max-h`, own scroll with `scroll-padding-block` |
| `.mob-menu--bare` | nested inside a popover or any surface that already floats: drops the second surface, keeps the rows |
| `.mob-menu--selectable` | reserves the check column on **every** row, so labels stay on one vertical edge whether or not a row is checked |
| `.mob-menu--anchored` / `--match-trigger` | CSS anchor positioning; `--match-trigger` sets `--mob-menu-w: anchor-size(width)` |
| `.mob-menu__item--danger` | destructive row. Muted at rest, saturated only on hover — exactly like the action buttons. |
| `.mob-menu__separator` | full-bleed: it cancels the menu's own padding so the line reads as a division of the panel, not of the row list |

### Keyboard navigation — both patterns

1. **Roving tabindex** — focus really moves to the row; `:focus-visible` styles it.
2. **`aria-activedescendant`** — focus stays on `.mob-menu` and the active row is marked
   `[data-mob-active]`.

Both indicators are **identical on purpose**: a keyboard user must not be able to tell which
pattern the consumer picked. The ring is an inset `outline` rather than the global offset
ring, because `.mob-menu` clips its own overflow and an outer ring would be cut in half at the
first and last row. You must scroll the active row into view yourself
(`el.scrollIntoView({block:'nearest'})`); `scroll-padding` keeps it off the panel edge.

### Row states

`:hover`, `[data-mob-active]`, `:focus-visible`, `:active` (background + `scale`),
`[aria-expanded="true"]` (keeps the row lit while its submenu is up),
`[aria-selected|aria-checked="true"]` / `[aria-current]`, `[aria-disabled="true"]` /
`:disabled`, and `[aria-busy="true"]` / `[data-mob-loading]`.

**Selected shows a check; the surface is a whisper.** Colour is never the only indicator.

A disabled row keeps `pointer-events: auto` so a tooltip can still explain why it is off.

**One caveat on a busy row.** The row's border box does not change: the trailing slot is hidden
with `visibility` and the spinner is placed into the space it vacated. A row with **no**
trailing slot has no space to borrow, so it reserves the spinner's width in its end padding —
which feeds the row's max-content contribution. A menu left at the default `--mob-menu-w: auto`
is shrink-to-fit, so if the busy row is the widest row the panel can widen for the duration of
the load. There is no CSS way to reserve visual space without contributing intrinsic width.
Avoid it in markup: give a row that can go busy a `__shortcut` or `__trailing`, or give the
menu an explicit `--mob-menu-w`.

**Tap targets.** `base.css`'s coarse-pointer floor names `.mob-menu-item`, which no component
file ships; the overlay row is `.mob-menu__item` and its own `min-block-size` is
`--mob-control-h-sm` (30px). On a touch surface raise `--mob-menu-item-h` to
`--mob-tap-target` on the menu.

```html
<div class="mob-menu mob-menu--selectable" role="menu" aria-label="Row actions"
     data-mob-state="open" data-mob-side="bottom">
  <p class="mob-menu__group-label">Position</p>

  <button class="mob-menu__item" type="button" role="menuitemradio" aria-checked="true">
    <span class="mob-menu__icon" aria-hidden="true"><!-- svg --></span>
    <span class="mob-menu__label">Claim fees</span>
    <span class="mob-menu__shortcut">⌘C</span>
  </button>

  <button class="mob-menu__item" type="button" role="menuitem" data-mob-loading>
    <span class="mob-menu__label">Rebalance</span>
    <span class="mob-menu__trailing" aria-hidden="true">›</span>
  </button>

  <div class="mob-menu__separator" role="separator"></div>

  <button class="mob-menu__item mob-menu__item--danger" type="button" role="menuitem">
    <span class="mob-menu__label">Close position</span>
  </button>

  <p class="mob-menu__empty" hidden>No actions available</p>
</div>
```

## 29. Modal and bottom sheet

```
.mob-modal-backdrop                 fixed, scrim, scroll layer, flex
└── .mob-modal                      margin:auto centres it; flex column
    ├── .mob-modal__handle          sheet only — grab bar
    ├── .mob-modal__header          pinned   ─ 1px divider
    │   ├── .mob-modal__title
    │   ├── .mob-modal__desc
    │   └── .mob-modal__dismiss     slot for a .mob-icon-btn
    ├── .mob-modal__body            the ONLY scrolling part
    └── .mob-modal__footer          pinned   ─ 1px divider
        ├── .mob-modal__error       optional, sits on the inline start
        └── actions                 exactly ONE primary
```

Making the backdrop do both jobs — scrim and centring — means the dialog never needs a
transform to centre itself, which leaves `translate` / `scale` free for the entrance.

| Class | |
|---|---|
| `.mob-modal` | `--mob-modal-w` (520px), `--mob-modal-radius` (12px), `--mob-shadow-lg` |
| `.mob-modal--sm` / `--lg` | 400 / 720px `[drv]` |
| `.mob-modal--sheet` | bottom-anchored, full width, top corners `--mob-sheet-radius` (16px), grab handle, **pure slide** — no scale (a wobble on a full-width surface) and no fade (the backdrop already carries it). Footer actions stretch to full width for one-handed reach. |
| `.mob-modal__header` / `__title` / `__desc` / `__dismiss` | an explicit 2-column grid, so a close button can sit anywhere in the markup and still land in the corner |
| `.mob-modal__body` | the only scrolling part |
| `.mob-modal__body--flush` | full-bleed body for a table, a list or media that owns its own edges |
| `.mob-modal__footer` | end-aligned |
| `.mob-modal__footer--split` | pushes the first child (a "Learn more" link, a checkbox) to the inline start |
| `.mob-modal__error` | lives beside the actions so **the primary button never moves** |
| `.mob-modal__handle` | rendered only in sheet mode. Ship it unconditionally: it costs nothing on desktop and gives touch drag-to-dismiss a real hit area. |

**The footer establishes hierarchy: exactly one primary action, on the inline end, everything
else secondary or ghost.** Two primaries is a defect; CSS cannot enforce it, review must.

Below 639px **every** modal adopts sheet behaviour automatically. `--sm` and `--lg` go
full-width there.

`[aria-busy="true"]` / `[data-mob-loading]` dims the body; the dialog keeps every dimension it
had.

```html
<div class="mob-modal-backdrop" data-mob-state="open">
  <div class="mob-modal mob-modal--sm" role="dialog" aria-modal="true"
       aria-labelledby="close-title" aria-describedby="close-desc" tabindex="-1">
    <button class="mob-modal__handle" type="button" aria-label="Drag to dismiss"></button>

    <header class="mob-modal__header">
      <h2 class="mob-modal__title" id="close-title">Close this position?</h2>
      <p class="mob-modal__desc" id="close-desc">
        Fees are claimed to your wallet. This cannot be undone.
      </p>
      <button class="mob-icon-btn mob-icon-btn--sm mob-icon-btn--quiet mob-modal__dismiss"
              type="button" aria-label="Close dialog">×</button>
    </header>

    <div class="mob-modal__body">…</div>

    <footer class="mob-modal__footer mob-modal__footer--split">
      <p class="mob-modal__error">Network fee estimate unavailable.</p>
      <button class="mob-btn mob-btn--ghost" type="button">Cancel</button>
      <button class="mob-btn mob-btn--danger" type="button">Close position</button>
    </footer>
  </div>
</div>
```

## 30. Drawer

Full-height side panel. Same header/body/footer grammar as the modal — those rules are shared —
with a different entrance: a pure slide off its own edge, 100% of the drawer's own width,
mirrored for RTL by `--mob-overlay-flip`.

| Class | |
|---|---|
| `.mob-drawer` | `inline-size: min(--mob-drawer-w, 100% − --mob-drawer-peek)`; 380px with a 40px peek `[drv]` |
| `.mob-drawer--start` / `--end` | which edge it docks to, and which side carries the border |
| `.mob-drawer__header` / `__title` / `__desc` / `__dismiss` / `__body` / `__body--flush` / `__footer` / `__footer--split` / `__error` | identical to the modal's |

`--mob-drawer-pad-x/-y/-bar-pad-y` are **aliased** to the modal's, so a drawer header can never
drift 1px from a modal header.

Pair it with `.mob-modal-backdrop` for the scrim. The drawer is `position: fixed`, so it may be
a child of the backdrop or a sibling — the backdrop's flex centring does not apply either way.

```html
<div class="mob-modal-backdrop" data-mob-state="open"></div>
<aside class="mob-drawer mob-drawer--end" role="dialog" aria-modal="true"
       aria-labelledby="filters-title" data-mob-state="open" tabindex="-1">
  <header class="mob-drawer__header">
    <h2 class="mob-drawer__title" id="filters-title">Filters</h2>
    <button class="mob-icon-btn mob-icon-btn--sm mob-icon-btn--quiet mob-drawer__dismiss"
            type="button" aria-label="Close filters">×</button>
  </header>
  <div class="mob-drawer__body">…</div>
  <footer class="mob-drawer__footer mob-drawer__footer--split">
    <button class="mob-btn mob-btn--ghost" type="button">Reset</button>
    <button class="mob-btn mob-btn--primary" type="button">Apply</button>
  </footer>
</aside>
```

## 31. Native `<dialog>`, `[popover]`, and CSS anchor positioning

Both are **optional additions**, not replacements. Everything above keeps working unchanged.

```html
<dialog class="mob-modal"> … </dialog>            <!-- dialog.showModal() -->
<div class="mob-menu" popover> … </div>           <!-- el.showPopover() -->
```

Both put the element in the top layer and toggle `display`, which a plain transition cannot
animate — so the same entrance is restated on the discrete-property path, guarded by
`@supports (transition-behavior: allow-discrete)` with `@starting-style` for the entry values.
`dialog.mob-modal::backdrop` takes the same scrim.

Anchor positioning is opt in **per instance**; without `--anchored` nothing applies:

```html
<button style="anchor-name: --acct-btn">Account</button>
<div class="mob-menu mob-menu--anchored" data-mob-side="bottom"
     style="--mob-anchor: --acct-btn"> … </div>
```

`position-area` keywords are logical, so this is RTL-safe. `position-try-fallbacks:
flip-block, flip-inline` flips the overlay to the opposite side when it would leave the
viewport — the one behaviour a positioning library is really bought for. `--mob-anchor` falls
back to `auto` (the implicit anchor, which is the invoker for a `[popover]`), so an
`--anchored` overlay with no `--mob-anchor` still resolves.

## Overlay tokens

Shared: `--mob-overlay-gap` · `--mob-overlay-shift` (4px) · `--mob-overlay-flip` ·
`--mob-overlay-divider` · `--mob-overlay-duration` / `-ease` / `-vis-delay` / `-tx` / `-ty`.
Panel locals (set per block, override in one place): `--mob-panel-pad-x` / `-pad-y` /
`-bar-pad-y` / `-radius` / `-shadow`.
Tooltip: `--mob-tooltip-bg` / `-border` / `-fg` / `-radius` / `-pad-y` / `-pad-x` / `-size`.
Popover: `--mob-popover-bg` / `-border` / `-radius` / `-pad-x` / `-pad-y` / `-max-h`.
Menu: `--mob-menu-bg` / `-border` / `-radius` / `-pad` / `-w` / `-min-w` / `-item-h` /
`-item-px` / `-item-py` / `-item-radius` / `-item-gap` / `-indicator-w` / `-check-w` /
`-check-h` / `-spinner-size` / `-spinner-stroke` / `-spinner-duration`.
Modal: `--mob-modal-bg` / `-border` / `-radius` / `-pad-x` / `-pad-y` / `-bar-pad-y` /
`-inset` / `-max-h` / `-w-sm` / `-w-lg` / `-enter-y` / `-enter-scale` / `-fit-w` / `-fit-h`.
Sheet: `--mob-sheet-radius` / `-max-h` / `-handle-w` / `-handle-h` / `-handle-pad`.
Drawer: `--mob-drawer-bg` / `-border` / `-w` / `-peek` / `-pad-x` / `-pad-y` / `-bar-pad-y`.
Backdrop: `--mob-backdrop-bg` / `-pad`. Anchor: `--mob-anchor`.
`tokens.css` owns `--mob-modal-w`, `--mob-popover-w`, `--mob-tooltip-max-w` and
`--mob-menu-max-h`.

---
---

# Feedback

`components/feedback.css`. Everything the product says back to the user: transient notices
(toast), persistent notices (alert, banner), absence (empty), failure (error state), and the
two ways of saying "not yet" (skeleton, spinner) plus the one way of saying "how far"
(progress).

### Six rules

1. **A toast is for information the user does not have to remember or act on later.** Anything
   that must survive a page change, be re-read, or be acted on after a delay is a
   `.mob-alert` or a `.mob-banner` — never a toast.
2. **Tone is `data-mob-tone="info|success|warning|error"`** (equivalent `--info` / `--success`
   / `--warning` / `--error` modifiers exist for class-only stacks). Tone drives colour **and**
   the icon glyph: colour is never the only signal. Leave `__icon` empty to get the tone's
   default glyph; put an `<svg>` in it to override.
3. **Skeletons preserve layout** — use them when the shape of the result is known and you are
   filling it in. **Spinners are for isolated async actions of unknown size** (a button, a
   retry). Never a spinner where a skeleton fits.
4. **Loading never resizes anything.** `[data-mob-loading]` on an action keeps the label in
   flow and swaps the ink for a spinner in place.
5. **Close buttons are labelled with `aria-label`, not inner text** — the × glyph is drawn only
   while the button is empty, so a nested `.mob-sr-only` span would erase it.
6. Wire the ARIA yourself: the toast region is `role="region" aria-live="polite"` (assertive
   for errors), `.mob-progress` is `role="progressbar"` with `aria-valuenow/min/max` (an
   indeterminate bar omits `aria-valuenow`), and a skeleton block is `aria-hidden` with one
   `.mob-sr-only` "Loading" live region per group.

### The tone contract

Toast, alert and banner share one contract, so a "success" reads the same wherever it appears.
Four locals; every tone sets all four, and `--mob-feedback-border` is **derived by one formula**
rather than picked per tone.

| Tone | `--mob-feedback-fg` | glyph |
|---|---|---|
| *(none)* | `--mob-fg-muted-hi` | `•` |
| `info` | `--mob-info` | `i` |
| `success` | `--mob-positive` | `✓` |
| `warning` | `--mob-warning` | `!` |
| `error` | `--mob-negative` | `✕` |

Locals: `--mob-feedback-fg` · `-raised` (hover ink) · `-tint` (surface) · `-action` (the inline
action's colour) · `-glyph` · `-border`.

### Shared parts

The icon slot, the inline action and the close button are **identical across toast, alert and
banner by design**: repetition must be exact, so it is written once.

| Class family | Notes |
|---|---|
| `__icon` | 16px tone glyph; drawn only while the slot is empty, so a real icon simply wins |
| `__action` | **a text action, not a button.** It lives inside a notice and must not compete with the page's real controls. Underlined at rest so it is distinguishable without hover; saturation arrives only on hover. Has hover / focus / press / disabled / `[data-mob-loading]` states. |
| `__close` | 20px; the × is **two hairlines**, so it matches the 1px language exactly at any DPR |

The focus ring on all three is `--mob-feedback-ring`, re-based onto the component's own
surface via `--mob-feedback-ring-bg` — the global ring's inner band is `--mob-bg-canvas`, which
reads as a hole on a tinted panel.

## 32. Toast

```
.mob-toast-region                fixed stack, pointer-events:none
  └ .mob-toast                   pointer-events:auto
     ├ ::before                  leading accent bar (tone)
     ├ .mob-toast__icon          tone glyph — the non-colour signal
     ├ .mob-toast__title
     ├ .mob-toast__body
     ├ .mob-toast__action        one inline action, e.g. Undo
     └ .mob-toast__close
```

| Class | |
|---|---|
| `.mob-toast-region` | bottom-end by default. **The region is a hole**: `pointer-events: none` on the stack, `auto` on its children, so it never eats clicks on the page beneath. |
| `.mob-toast-region--top` / `--start` / `--center` | reposition |
| `.mob-toast` | a 3-column, 3-row grid. **Gaps live on the parts, never on the grid** — an empty track still gets its gutters, so a title-only toast would carry a phantom column gap. Margins only exist where the part does, so every subset of the anatomy measures correctly. |
| `.mob-toast--info` `--success` `--warning` `--error` | tone |
| `.mob-toast__icon` / `__title` / `__body` / `__action` / `__close` | the parts |

`.mob-toast` is the one place **outside `overlay.css`** that spends a shadow
(`--mob-shadow-md`): a toast floats over unknown content and needs separation a border cannot
give it. Cards still may not.

Exit: set `[data-mob-leaving]`. Height cannot be animated, so a leaving toast fades in place
and the stack closes when the node is removed — remove it after the animation ends.

```html
<div class="mob-toast-region" role="region" aria-live="polite" aria-label="Notifications">
  <div class="mob-toast" data-mob-tone="success" role="status">
    <span class="mob-toast__icon"></span>
    <p class="mob-toast__title">Position closed</p>
    <p class="mob-toast__body">$31.12 returned to your wallet.</p>
    <button class="mob-toast__action" type="button">Undo</button>
    <button class="mob-toast__close" type="button" aria-label="Dismiss"></button>
  </div>
</div>
```

## 33. Alert

The inline, persistent counterpart of a toast: it stays until the condition that produced it is
gone. Same tones, same glyphs, tinted surface.

| Class | |
|---|---|
| `.mob-alert` | 4-column grid: icon · title/body · action · close |
| `.mob-alert--stacked` | drops the action under the body — for long action labels or a narrow column |
| `.mob-alert--info` `--success` `--warning` `--error` | tone |
| `.mob-alert__icon` / `__title` / `__body` / `__action` / `__close` | |

```html
<div class="mob-alert mob-alert--warning" role="alert">
  <span class="mob-alert__icon"></span>
  <p class="mob-alert__title">Position out of range</p>
  <p class="mob-alert__body">No fees accrue while the spot price sits above your top rung.</p>
  <button class="mob-alert__action" type="button">Rebalance</button>
  <button class="mob-alert__close" type="button" aria-label="Dismiss"></button>
</div>
```

## 34. Banner

Page-level, full-bleed. Sits **above** the page shell's gutter, not inside it, so its own
`padding-inline` reproduces the gutter (26px `[src]`).

`.mob-banner` · `--info` `--success` `--warning` `--error` · `--sticky` (sticky at 0,
`--mob-z-sticky`) · `__icon` `__text` `__action` `__close`.

## 35. Empty state

**Absence, not failure.** Dashed panel, no fill — it should read as a space waiting to be
filled rather than as another card.

| Class | |
|---|---|
| `.mob-empty` | dashed border, `--mob-empty-radius` (10px `[src]`), centred column |
| `.mob-empty--sm` | tighter padding |
| `.mob-empty--bare` | no border — inside a fused segment the dashed edge would fight the frame's hairlines |
| `.mob-empty__visual` | 40px circular tile for an optional icon |
| `.mob-empty__title` | sans 13px/600 `[src]` |
| `.mob-empty__sub` | 10.5px mono `[src]`, capped at `--mob-empty-max-w` (300px) — metadata-scale, not body copy |
| `.mob-empty__actions` | drop `.mob-btn` instances in |

The canonical instance `[src]` is: title "No open positions", sub "Paste a token address to
open your first ladder.", one **ghost** button "Paste address". Keep copy at that length. One
short title, one sentence, at most two actions — and do not promote the action to a filled
primary unless it really is the page's main call.

```html
<div class="mob-empty">
  <span class="mob-empty__visual" aria-hidden="true"><!-- svg --></span>
  <p class="mob-empty__title">No open positions</p>
  <p class="mob-empty__sub">Paste a token address to open your first ladder.</p>
  <div class="mob-empty__actions">
    <button class="mob-btn mob-btn--ghost" type="button">Paste address</button>
  </div>
</div>
```

## 36. Error state

Inline failure with a way out. **Always pair the message with a retry** — an error the user
cannot act on is a dead end.

`.mob-error-state` · `--block` (replaces a whole panel: column, centred, padded) ·
`__icon` (draws `!` while empty) · `__message` · `__retry`.

It sets `--mob-feedback-fg` / `-raised` / `-action` to the negative family, which is what feeds
the shared icon and action rules.

```html
<div class="mob-error-state" role="alert">
  <span class="mob-error-state__icon"></span>
  <span class="mob-error-state__message">Could not load fees.</span>
  <button class="mob-error-state__retry" type="button">Retry</button>
</div>
```

## 37. Skeleton, spinner, progress

**A skeleton must match the geometry of what replaces it.** If it does not, the page jumps and
the skeleton was worse than nothing.

| Class | |
|---|---|
| `.mob-skeleton` | tile + a transform-driven sheen; nothing about the box changes |
| `.mob-skeleton--text` | 9px `[drv]` — the ink band of 12–12.5px mono |
| `.mob-skeleton--title` | 14px `[drv]` — the ink band of `--mob-size-xl` sans 600 |
| `.mob-skeleton--circle` | `--mob-skeleton-circle` (24px `[src]`, the list-row avatar) |
| `.mob-skeleton--block` | `--mob-skeleton-block-h`; override per use site |
| `.mob-skeleton-group` | column with `--mob-skeleton-line-gap` |
| `.mob-skeleton-group--row` | avatar beside a line |

Real paragraphs do not end flush, so `.mob-skeleton--text:last-child:not(:only-child)`
shortens to `--mob-skeleton-text-last` (62%). A `--row` group turns that off by setting
`--mob-skeleton-last: 100%` — a token, not an override selector, because
`:last-child:not(:only-child)` would outweigh a child combinator.

| Class | |
|---|---|
| `.mob-spinner` | `currentColor` throughout, so it takes the tone of whatever it sits inside |
| `.mob-spinner--sm` / `--md` / `--lg` | 12 / 16 / 20px |
| `.mob-progress` | track, `--mob-progress-h` (5px `[src]`) |
| `.mob-progress--lg` | 8px |
| `.mob-progress__fill` | the bar |
| `.mob-progress--indeterminate` | a dim full-width fill carries the "working" signal and a bright segment sweeps across it. Under reduced motion the sweep parks off the end and the dim fill remains — still legibly in progress. |

**Determinate progress** is set with `--mob-progress`, a registered `@property` of syntax
`<number>` (0–1). The fill is full width and *translated* out of view, so the moving edge keeps
its true 3px cap instead of a `scaleX`-squashed one, and only `transform` is ever animated.

`[data-mob-tone]` retones the fill — a failed upload turns the bar negative without a second
set of classes. An unrecognised tone value falls back to the accent, so it reads exactly as an
untoned bar.

```html
<div class="mob-progress" style="--mob-progress:.42" role="progressbar"
     aria-valuenow="42" aria-valuemin="0" aria-valuemax="100" aria-label="Uploading">
  <div class="mob-progress__fill"></div>
</div>

<div class="mob-skeleton-group" aria-hidden="true">
  <span class="mob-skeleton mob-skeleton--title" style="inline-size: 9ch"></span>
  <span class="mob-skeleton mob-skeleton--text"></span>
  <span class="mob-skeleton mob-skeleton--text"></span>
</div>
<span class="mob-sr-only" role="status">Loading positions</span>
```

## Feedback tokens

Shared: `--mob-feedback-dir` (−1 under RTL) · `-icon` · `-close` · `-close-arm` ·
`-ring` / `-ring-bg` · the tone locals above.
Toast: `--mob-toast-pad-y` / `-pad-x` `[src]` / `-gap` / `-radius` / `-bar-w` / `-enter-x` /
`-region-inset` / `-region-gap`.
Alert: `--mob-alert-pad-y` / `-pad-x` `[src]` / `-gap` / `-radius`.
Banner: `--mob-banner-pad-y` / `-pad-x` `[src]` / `-gap`.
Skeleton: `--mob-skeleton-bg` `[src]` / `-radius` `[src]` / `-sheen` / `-text-h` / `-title-h` /
`-line-gap` / `-text-last` / `-last` / `-circle` / `-block-h` / `-sweep-duration`.
Spinner: `--mob-spinner-size` / `-size-sm` / `-size-lg` / `-stroke` / `-stroke-lg` / `-track` ·
`--mob-spin-duration` (660ms).
Progress: `--mob-progress-h` / `-h-lg` / `-radius` / `-track` / `-fill` / `-indeterminate-w` /
`-duration`.
Empty: `--mob-empty-pad-y` / `-pad-x` / `-pad-y-sm` / `-pad-x-sm` / `-radius` / `-gap` /
`-max-w` / `-visual`. Error: `--mob-error-gap` / `-icon`.

The sheen is mixed from the **text** colour, not from a white alpha, so it inverts with the
theme instead of washing out the light-mode tile. The two long loops (shimmer, indeterminate
sweep) are derived as multiples of `--mob-duration-enter`, because the duration scale tops out
at 260ms — it describes state transitions, not ambient loops.

---
---

# Motion and utilities

## 38. Motion

`components/motion.css` is the **canonical home for keyframes**. A component that needs a
spinner, a pulse or a sweep references the name declared here; it does not declare a second
copy under a component-specific name. Two definitions of the same loop is how a product ends
up with a 660ms spinner in a button and a 720ms spinner in a menu.

### Four rules this file enforces

1. **Transform and opacity only.** Every keyframe animates `opacity`, `transform`, or one of
   the independent transform properties. Nothing animates width, height, inset, margin or
   background-position — those are layout, and animating layout is how a list of rows turns
   into a jitter.
2. **No layout shift on hover.** `.mob-hover-lift` changes the surface and the border. It does
   not translate and it does not grow.
3. **No bounce, no overshoot.** The three easings in `tokens.css` are all monotonic. Nothing
   here introduces a fourth.
4. **The press is always the same press.** `--mob-press-scale` (`.985` `[src]`) is the one
   value; a control never invents its own.

### Named transition compositions

Values, not classes, so the same list is available to a component rule and to a utility class
without either restating it.

| Token | Class | Contents |
|---|---|---|
| `--mob-transition-paint` | `.mob-transition` | colour, background, border, box-shadow at `--mob-duration-normal`. Safe on anything — none of these can move a box. |
| `--mob-transition-paint-fast` | `.mob-transition-fast` | the same list at `--mob-duration-fast`. What a button, chip or row wants — anything the pointer is directly on top of. |
| `--mob-transition-motion` | `.mob-transition-transform` | `transform` + `translate` + `scale` + `rotate` + `opacity` |
| `--mob-transition-press` | — | the press channel alone, so it can be appended to any of the three above |

Lists **concatenate**, and a transition list resolves last-wins per property, so
`var(--mob-transition-paint), var(--mob-transition-press)` is a paint transition plus a
correctly-timed press.

`transition` is one property, so two utility classes that each declare it cannot merge — the
later one wins and the earlier one's channels are silently lost. Four combination rules exist
to fix exactly that: `.mob-transition.mob-press`, `.mob-transition-fast.mob-press`,
`.mob-transition-transform.mob-press`, `.mob-hover-lift.mob-press`. They are the only pairings
worth supporting; anything more elaborate is a component, and a component writes its own single
`transition`.

### Keyframes

Eight, and no more without a system decision.

| Name | Owner |
|---|---|
| `mob-fade-in` / `mob-fade-out` | the floor — anything with no direction of travel |
| `mob-rise` | dropdowns, popovers, menus, revealed blocks. Block-axis only, so it needs no RTL sign. |
| `mob-scale-in` | modals, dialogs, sheets. Scale alone — never scale plus translate plus glow. |
| `mob-spin` | every indeterminate spinner in the system. `linear`, because an eased loop has a visible seam at the wrap point. |
| `mob-pulse` | placeholder blocks, pending nav items, stale values. Run it `infinite alternate` so the return leg is the same curve reversed and the loop has no seam. Opacity only. |
| `mob-skeleton-sweep` | the sheen crossing a loading placeholder |
| `mob-shimmer` | a value that is **refreshing in place**. Not a skeleton: a skeleton stands in for content that is not there yet; a shimmer passes over content that *is* there and is being revalidated. Narrower, slower, fades at both ends. |

`nav.css` adds two of its own — `mob-nav-pending`, `mob-tabs-loading` — and `feedback.css`
adds `mob-toast-in` / `mob-toast-out` / `mob-progress-slide`. Those are the only exceptions.

Ambient loops run `infinite`. **Give the element an accessible busy signal** (`aria-busy`,
`role="status"`) — the animation is decoration, not information.

### Entrance

```html
<div class="mob-enter mob-enter--rise" data-mob-state="open">…</div>
```

Transition-driven, not animation-driven, and that is the whole design:

- **Open ↔ closed is reversible.** Close something mid-open and it turns around from wherever
  it got to. A keyframe animation would restart from the beginning — the jump every
  hand-rolled dropdown has.
- The state lives in **one attribute**, so React, Vue, Svelte, Alpine, HTMX or eight lines of
  vanilla all drive it the same way. There is no class to add and remove on a timer, and no
  `animationend` listener to leak.
- **No attribute means open.** Server-rendered content is never invisible if the JS fails.

| Class | Effect |
|---|---|
| `.mob-enter` | the contract |
| `.mob-enter--rise` | closed position is `--mob-motion-rise` (6px) below rest |
| `.mob-enter--scale` | closed position is `--mob-motion-scale-from` (.97) |

Combine them freely — `--rise` + `--scale` is the modal treatment. Inline-axis travel is opt-in
rather than a modifier, because "from the left" is meaningless in a bidi system: set
`--mob-enter-x` yourself and multiply by `--mob-motion-dir` if the direction is semantic.

`@starting-style` supplies the previous value for an element inserted already open, which
removes the double-`rAF` dance every framework otherwise needs. It is scoped to the explicit
`='open'`, so the always-visible case is never animated on first paint.

**`.mob-enter` is the generic form of the overlay contract.** A tooltip, popover, menu, modal
or drawer already has it built in; do not stack `.mob-enter` on top of one.

### Stagger

```html
<ul class="mob-stagger">
  <li class="mob-enter" data-mob-state="open">…</li>   <!--  0ms -->
  <li class="mob-enter" data-mob-state="open">…</li>   <!-- 40ms -->
  <li class="mob-enter" data-mob-state="open">…</li>   <!-- 80ms -->
</ul>
```

Indices are assigned automatically for the first seven children; set `--mob-stagger-index`
inline to override (a virtualised list that renders row 400 first still wants a small index,
not a 16-second delay).

**The cap is the feature.** `min()` clamps the delay to `--mob-motion-stagger-max` (240ms) no
matter how large the index gets, and the `nth-child` ladder stops incrementing at the same
point. A ten-thousand-row table reveals in a quarter of a second, and no row is ever
unclickable because its turn has not come up. A staggered **exit** is always wrong — it holds
the last row on screen after the user dismissed the list — so `.mob-enter[data-mob-state='closed']`
resets the delay to 0 whatever the stagger set.

The container publishes `--mob-stagger-delay` and only `.mob-enter` consumes it. It
deliberately does **not** set `animation-delay` on every child — that would also delay any
ambient loop living inside a row. For a keyframe-driven entrance, opt in explicitly:

```css
.my-row { animation: mob-rise var(--mob-duration-enter)
                     var(--mob-ease-enter) var(--mob-stagger-delay) backwards; }
```

### Press and hover-lift

`.mob-press` gives any control the system's one press. The guard is written with `:where()` so
it carries no specificity and a component rule can still override the pressed transform:

```css
.mob-press:where(:not(:disabled, [aria-disabled='true'], [data-mob-loading])):active
```

`.mob-hover-lift` is **optical, not geometric**: a lighter surface and a lighter border, in
exactly the same box. The element must already carry a border for the border half to be
visible — compose with `.mob-bordered`, or use it on a `.mob-card`.

Its hover half is guarded on `(hover: hover) and (pointer: fine)`, because on a touch screen
the `:hover` state sticks after a tap and reads as a selection the user did not make. Its
`:focus-visible` half is deliberately **outside** that guard: a ring alone would leave the
keyboard user with less information than the pointer user, and keyboard focus happens on touch
devices too.

### Reduced motion

Deliberately absent from this file. `reset.css` collapses every animation and transition in the
document to `.01ms` under `prefers-reduced-motion: reduce`, globally and without exception.
Repeating that block per component would be dead code that implies components are allowed to
opt out. They are not — which is why every looping animation in the system is built to park in
a still-legible resting state.

### Motion tokens

`--mob-motion-rise` (6px `[src]`) · `--mob-motion-scale-from` (.97) ·
`--mob-motion-spin-duration` (660ms) / `-pulse-duration` (1300ms) / `-sweep-duration` (1300ms)
/ `-shimmer-duration` (1820ms) · `--mob-motion-pulse-min` (.45) · `--mob-motion-sheen` ·
`--mob-motion-shimmer-w` (40%) · `--mob-motion-stagger-step` (40ms) / `-stagger-max` (240ms) ·
`--mob-motion-dir` · `--mob-enter-duration` / `-ease` / `-delay` / `-x` / `-y` / `-scale` ·
`--mob-stagger-index` / `--mob-stagger-delay`.

`--mob-stagger-index` and the `--mob-enter-*` set are per-element knobs and are **not**
declared at `:root` — a `var(…, fallback)` reads better than a global default every element
silently inherits.

## 39. Utilities

`components/utilities.css`. **This is not a utility framework and must never grow into one.**
Every class satisfies one test: *it maps 1:1 onto a value that is already a token, and its
absence would force somebody to type that value as a literal.*

`.mob-gap-14` exists because 14px is `--mob-space-14`. `.mob-gap-15` does not exist, because
15px is not on the public scale — if a surface genuinely needs it, that is calibrated geometry
and belongs in a component's own token block.

### What does not belong here

- **No colour utilities.** Tone is semantic: `base.css` owns `.mob-tone-*` and
  `[data-mob-sign]`, and a colour applied for any other reason is a bug.
- **No type utilities.** `base.css` owns the roles; a size picked off a scale instead of a role
  is how a design system loses its voice.
- **No arbitrary-value escape hatch**, no responsive variant of every class, no state variants.
  If a rule needs a breakpoint or a state, it is a component.
- **No `!important`, anywhere.** `mob.css` loads this file last precisely so a utility outranks
  a component rule of equal specificity on source order alone.

Cascade order inside the file is load-bearing — arrangement → spacing → surface → visibility →
overflow, narrowest intent last. Do not reorder it.

### Arrangement

`.mob-flex` · `.mob-inline-flex` · `.mob-flex-col` (**not** `.mob-col` — `layout.css` owns that
for a 12-grid span) · `.mob-wrap` · `.mob-flex-1` · `.mob-min-w-0` · `.mob-grid-auto` ·
`.mob-items-start|center|end|stretch|baseline` ·
`.mob-justify-start|center|end|between`.

Alignment uses the writing-mode-relative `start`/`end` rather than `flex-start`/`flex-end`:
they mean the same thing in flex and grid, so one class works on both, and they follow
`direction`, so an RTL document needs no second rule.

`.mob-flex-1` deliberately does **not** set `min-inline-size: 0` — keeping `.mob-min-w-0`
separate means the flex-blowout fix stays a decision the author makes on purpose rather than a
side effect they never learn about.

`.mob-items-baseline` is the one that matters for this system's numbers: a 27px hero figure and
the 10px label beside it only look deliberate on the same baseline, not with their boxes
centred.

### Spacing

`.mob-gap-{2,3,4,6,8,10,12,14,16,20,24,32}` ·
`.mob-mt-{…}` · `.mob-mb-{…}` (same twelve steps).

The names read as top and bottom; the properties are `margin-block-start` / `-end`. The short
name is kept because it is what people type; the implementation is logical because that is what
is right.

Use `gap` for siblings. The margin utilities are for the one case gap cannot reach: separating
a block from what precedes or follows it in a flow its parent does not control.

### Surface

`.mob-surface` · `.mob-surface-raised` · `.mob-sunken` · `.mob-bordered` ·
`.mob-hairline-top` · `.mob-hairline-bottom` ·
`.mob-rounded-{xs,sm,md,lg,xl,full}`.

Background, border and radius are **three separate decisions**, not one preset, because that is
how the signature construction works: a segmented card is a `--mob-bg-frame` parent with a
border and a radius, holding children that have a background and neither of the other two.

These paint only — they set **no padding**. Padding is calibrated per component; a utility that
guessed at it would put a 16px card and a 15px card next to each other. Use `.mob-card` when
you want a card.

There is no `.mob-canvas` utility: the canvas is the page, and painting it onto a box inside
the page is how you get a hole.

`.mob-hairline-top` / `-bottom` are the **block axis only**. A vertical seam between fused
segments is a 1px gap over `--mob-bg-frame`, not a border.

`--full` is for avatars, dots and status marks — not for buttons.

### Responsive visibility

| Class | Effect |
|---|---|
| `.mob-hide-sm` | gone below 640px |
| `.mob-hide-md` | gone below 768px |
| `.mob-show-sm` | shown **only** below 640px |

Read the suffix as "on small screens" in all three. `.mob-hide-sm` and `.mob-show-sm` swap at
exactly the same pixel.

Each rule only ever **adds** `display: none` inside a media query; none of them sets display
back to a value. `display: revert` or a hardcoded `block` would destroy the element's own
display — a `.mob-btn` is inline-flex, a `.mob-grid` is grid — and the bug would appear at one
viewport width only, which is the worst place to hide one.

These hide visually **and** from assistive technology. Correct for a duplicate of something
else on the page; wrong for content that only exists here. If the content is unique, reflow it
— do not hide it.

### Horizontal scroll

`.mob-scroll-x` is geometry only: `overflow-x: auto` plus `overscroll-behavior-inline:
contain`, so a horizontal fling does not become a browser back-swipe. Only `overflow-x` is
declared — a non-visible `overflow-x` already forces `overflow-y` to `auto`, and writing
`hidden` there would clip the focus ring off any control inside.

`.mob-scroll-x--fade` adds a symmetric edge mask (RTL-safe) and hides the scrollbar, because a
visible bar crossing under the fade reads as broken chrome. **Opt-in**: a permanent mask on
content that does not overflow fades the ends of a row nobody can scroll, which looks like a
rendering bug. Add it when the row is known to overflow, or toggle it from a resize observer.

The mask clips to the border box and would erase the outer focus ring entirely, so this variant
restates the ring **inset**. The plain `.mob-scroll-x` has no mask and keeps the outer ring.

**Data integrity over squeezing.** When a dense row will not fit, the right answer in this
system is to let it scroll, not to crush a column of numbers until the digits wrap.

---
---

# Component-to-doc index

This file is the API. The rest of the set tells you what to build with it.

| Component | Patterns | Motion | Accessibility | Also |
|---|---|---|---|---|
| Page, shell, rail, main | `03 §1`, `03 §2` | — | `06 §3` | `01 §5`, `04` (all templates) |
| Column header (baseline device) | `03 §2` | — | `06 §3` | `01 §5` |
| Stack, cluster, grid, cols | `03 §4` | — | `06 §3` | `01 §4`, `01 §5` |
| Section | `03 §3`, `03 §4` | — | `06 §3` | `08 §1`, `04 §1` |
| Divider, spacer, sticky | `03 §4` | — | — | `01 §7` |
| Button, icon button | `03 §10`, `03 §11` | `05 §4.1`, `05 §4.2` | `06 §6`, `06 §7`, `06 §9` | `08 §2`, `12 §1` |
| Button group | `03 §10` | `05 §4.1` | `06 §2`, `06 §6` | `01 §7` |
| Field, search, kbd | `03 §10`, `03 §13` | `05 §4.1` | `06 §4`, `06 §6` | `07 §11`, `08 §3`, `08 §4` |
| Choice, segmented control | `03 §10` | `05 §4.1` | `06 §4`, `06 §6`, `06 §9` | `12 §1` |
| Chip | `03 §10` | `05 §4.1`, `05 §5` | `06 §6`, `06 §8`, `06 §9` | `08 §1`, `10` (colour) |
| Card | `03 §6` | `05 §4.3`, `05 §5` | `06 §3`, `06 §6` | `01 §7`, `01 §8`, `10` (surface) |
| Segmented card | `03 §7` | `05 §4.3` | `06 §3` | `01 §7`, `11 §10` |
| List row | `03 §9` | `05 §4.3` | `06 §3`, `06 §6` | `07 §8` |
| Avatar, avatar stack | `03 §9` | — | `06 §7`, `06 §8` | `01 §2` (series) |
| Stat, stat pair, stat row, KPI row | `03 §6`, `03 §8` | `05 §4.8` | `06 §8` | `00 §2`, `07 §1`–`§5`, `01 §3` |
| Table | `03 §10` | `05 §4.8` | `06 §3`, `06 §6`, `06 §9` | `07 §12`, `12 §9` |
| Meter, gauge | `03 §7` | `05 §4.8` | `06 §8` | `07 §10`, `01 §2` |
| Bar stack, legend | `03 §9` | `05 §5` | `06 §8` | `01 §2` (series) |
| Spark | `03 §6` | `05 §4.8` | `06 §8` | `07 §9` |
| Delta | `03 §14` | — | `06 §8` | `07 §4`, `07 §5` |
| Navbar, navlink | `03 §3` | `05 §4.4`, `05 §5` | `06 §3`, `06 §5`, `06 §7` | `04 §1`, `04 §2` |
| Sidebar | `03 §1` | `05 §4.1` | `06 §3`, `06 §7`, `06 §9` | `04 §2`, `04 §4` |
| Tabs | `03 §10` | `05 §4.6` | `06 §5`, `06 §6` | `04 §3`, `04 §5` |
| Breadcrumbs | `03 §3` | `05 §4.1` | `06 §3`, `06 §6` | `04 §3` |
| Tooltip | `03 §14` | `05 §4.4` | `06 §5`, `06 §6` | `08 §8` |
| Popover, menu | `03 §10` | `05 §4.4` | `06 §5`, `06 §6` | `01 §11` (z-index) |
| Modal, sheet, drawer | `03 §11` | `05 §4.5` | `06 §5`, `06 §6` | `08 §6`, `12 §1` |
| Toast | `03 §12` | `05 §4.7` | `06 §6` (live regions) | `08 §7` |
| Alert, banner | `03 §13` | `05 §4.4` | `06 §6`, `06 §8` | `08 §4` |
| Empty state | `03 §13` | — | `06 §3` | `08 §5`, `04 §5` |
| Error state | `03 §13` | — | `06 §6`, `06 §8` | `08 §4`, `07 §7` |
| Skeleton, spinner, progress | `03 §13`, `03 §14` | `05 §4.8`, `05 §6` | `06 §6`, `06 §10` | `12 §9` |
| Motion primitives | `03 §12` | `05` (all) | `06 §10` | `10` (motion) |
| Utilities | — | `05 §4.1` | — | `01 §4`, `01 §6`, `01 §7` |

Doc keys: `00` principles · `01` foundations · `03` patterns · `04` templates · `05` motion ·
`06` accessibility · `07` data formatting · `08` content style · `09` adoption · `10`
anti-patterns · `11` Figma · `12` QA checklist.

### Where to go for a whole task, not a component

| Task | Doc |
|---|---|
| Deciding whether this should be a component at all | `00-principles.md` |
| Picking a token, a size step, a radius, a border | `01-foundations.md` |
| Composing a region — what goes in it, in what order, and what happens when the data is missing | `03-patterns.md` |
| Starting a whole page | `04-templates.md` |
| Anything that moves | `05-motion.md` |
| Contrast, focus, keyboard, ARIA, touch targets | `06-accessibility.md` |
| Rendering a number, a sign, a time, a truncated id | `07-data-formatting.md` |
| Writing the words in a button, an error or an empty state | `08-content-style.md` |
| Installing, retheming, adapting to a non-dashboard domain, framework bindings | `09-adoption.md` |
| Checking a screen you did not build | `10-anti-patterns.md`, `12-qa-checklist.md` |
| Building the library file | `11-figma.md` |

### The required states matrix

Before shipping any interactive component, check it against `12-qa-checklist.md §1`. Every
control in this document ships the states listed in its own section; a component you build on
top of them owes the same set. The recurring failure is not a missing hover — it is a disabled
state that still looks live, a loading state that resizes its box, and an error state carried
by colour alone.
