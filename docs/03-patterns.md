# 03 — Patterns

A pattern is one level above a component. A component answers *what does a button look
like*. A pattern answers *what goes in this region, in what order, and what happens when
the data is missing*. Patterns are where most product decisions actually get made, and
where most design systems stop and leave the team guessing.

Every pattern here is stated as: what it is → when to use it → anatomy → rules → markup.

### How to read the examples

- **Type and tone come from `base.css`.** `.mob-title`, `.mob-label`, `.mob-figure-xl`,
  `.mob-value`, `.mob-meta`, `.mob-meta-sm`, `.mob-dim`, `.mob-body`, `.mob-tone-*`,
  `.mob-truncate`, `[data-mob-sign]` are real, verified classes. Use them instead of
  setting `font-size` on a pattern.
- **Control classes** referenced here — `.mob-btn`, `.mob-icon-btn`, `.mob-chip`,
  `.mob-tab`, `.mob-menu-item` — are the system's component classes. **Modifiers are
  classes**: `.mob-btn--primary`, `.mob-btn--ghost`, `.mob-btn--sm`. There is no
  `data-mob-variant` or `data-mob-size` attribute anywhere in the CSS; see
  `02-components.md` for the authoritative modifier API.
- **Container classes** (`.mob-page`, `.mob-shell`, `.mob-rail`, `.mob-main`,
  `.mob-column-header`, `.mob-segmented`, …) are *composition* primitives and they ship in
  `css/components/layout.css` and `css/components/card.css`. Nothing in this document asks
  you to author CSS the system already has — where a rule is quoted below it is quoted from
  the stylesheet to explain *why* it is written that way, not so you can paste a second copy.
- `[src]` = measured from the calibrated handoff. `[drv]` = extended by a stated rule.

---

## 1. Page shell

**What it is.** The outermost frame: canvas, page padding, and a centred max-width
container. Everything else sits inside it.

**When.** Every page. There is exactly one shell per document; nested shells are a bug.

### Anatomy

```
mob-page                       min-height 100dvh, canvas, page padding
└── mob-shell                  max-width, centred, flex row (or --stack)
    └── (page header, sections, or a rail + main layout)
```

### Rules

| Rule | Why |
|---|---|
| Padding is `22px 26px 36px` [src] | Asymmetric on purpose: the bottom needs more room than the top because content ends and nothing catches the eye below it. Normalised on-scale as `--mob-space-24 / --mob-gutter-desktop / --mob-space-40` [drv]. |
| Horizontal padding is `--mob-gutter-desktop` (26px), never a hard-coded number | The gutter shrinks at breakpoints. A hard-coded 26px does not, and the page starts touching the viewport edge on a tablet. |
| Max width is `--mob-container-app` (1460px, the `.mob-shell` default) for product, `--mob-container-content` (1280px, `.mob-shell--content`) for marketing | 1460 exists because the dense two-column layout needs it; marketing does not, and reads worse when a headline can run 1400px wide. `.mob-shell--prose` is the third width, an editorial measure. |
| The canvas colour lives on `.mob-page` | `.mob-page` paints `--mob-bg-canvas` itself rather than relying on `body`, so a shell rendered into an iframe, a portal or a Storybook frame still sits on the right ground. Do not add a second background on the shell. |
| No shadow on the shell, ever | Depth in this system is surface + 1px border. A shadow at page level has nothing to cast onto. |
| A shell with one column carries `.mob-shell--stack` | `.mob-shell` is a flex **row** by default, because its designed contents are a rail and a main column. A marketing or settings page that stacks sections must say so, or its sections become side-by-side flex items. |

Both blocks ship in `css/components/layout.css`; the gutters are breakpoint-aware through
`--mob-page-pad-inline`, so a page never hard-codes 26px.

```html
<div class="mob-page">
  <div class="mob-shell">
    <!-- rail + main, or .mob-shell--stack for a single column -->
  </div>
</div>
```

---

## 2. Rail + main, and the header baseline

**What it is.** A narrow fixed-width rail beside a fluid main column, where **both columns
open with a header row of identical height** so the first card in each starts on the same
horizontal line.

**When.** A summary/overview rail beside a working area: portfolio + positions, filters +
results, navigation + content, metadata + document. Not for equal-weight two-column
content — that is a grid, not a rail.

### Anatomy

```
mob-shell                          flex, align-items: flex-start, gap --mob-shell-gap
├── mob-rail                       flex: 0 0 --mob-rail-w (288px), column, gap 14px
│   ├── mob-column-header          min-height 34px  ← baseline row
│   ├── card
│   ├── card
│   └── card
└── mob-main                       flex: 1 1 0, min-inline-size: 0
    ├── mob-column-header          min-height 34px  ← same baseline row
    └── content
```

### The baseline alignment, and why it is fiddly

Both header rows are `--mob-header-row-h` (34px) tall and both columns start at the same
`y`, so the *tops* align for free. The *bottoms* do not, because the two columns space
their children differently: the rail is a flex column with `gap: 14px`, the main column is
not. Left uncorrected, the rail's first card starts 14px below its header and the main
column's starts 11px below its own — a 3px stagger that reads as a mistake without ever
looking like one thing in particular.

The handoff fixes it with `margin-bottom: -3px` on the rail header [src]. `layout.css` does
not copy the `-3px`; it encodes the relationship, which is `11px − 14px`. Each column
publishes its own gap as `--mob-column-gap`, and the header subtracts it:

```css
/* quoted from css/components/layout.css — already loaded, do not re-declare */
.mob-rail { --mob-column-gap: var(--mob-rail-gap); }   /* 14px [src] */
.mob-main { --mob-column-gap: var(--mob-card-gap); }   /* 14px [src] */

.mob-column-header {
  display: flex;
  align-items: center;
  gap: var(--mob-column-header-gap-x);
  min-block-size: var(--mob-column-header-h);   /* 34px [src] */
  margin-block-end: var(--mob-column-header-gap);
}
/* Direct children only: the column's own gap already supplies part of the distance. */
.mob-rail  > .mob-column-header,
.mob-main  > .mob-column-header,
.mob-stack > .mob-column-header {
  margin-block-end: calc(var(--mob-column-header-gap) - var(--mob-column-gap, 0px));
}
```

Written this way, changing `--mob-card-gap` keeps the baseline. Written as `-3px`, it
silently breaks. The `var(--mob-column-gap, 0px)` fallback is why a hand-rolled column that
never publishes a gap still gets a plain 11px and stays readable — it just stops staying
level with a rail beside it.

### Rules

| Rule | Why |
|---|---|
| `min-inline-size: 0` on `mob-main` is load-bearing | A flex item's default `min-width: auto` refuses to shrink below its content. Without this, one wide table or one segmented row pushes the whole page into horizontal scroll and the rail gets crushed. |
| `--mob-header-row-h` (34px) equals `--mob-control-h-md` (34px) | So a medium button dropped into the header row defines the row height with no extra math, and a header with a button is exactly as tall as one without. |
| The rail is `flex: 0 0` — it never grows | A rail that grows stops being a rail. Give the slack to main; that is where the data is. |
| Rail first in the DOM | On mobile the columns stack in source order. The rail is the summary; a user scrolling a phone wants it before the detail. Source order gets this right for free — no `order` property, so keyboard and screen-reader order stay correct. There is deliberately no `.mob-rail--end`: to put the rail on the trailing side, author it *after* `.mob-main`. |
| Below `--mob-bp-lg`, the rail goes full-width and the shell becomes a stack | 288px of rail beside a squeezed main column is worse than either alone. `layout.css` already does this at `1023.98px`; you do not write the media query. |

```html
<div class="mob-page">
  <div class="mob-shell">
    <aside class="mob-rail mob-rail--sticky">
      <div class="mob-column-header">
        <span class="mob-column-header__title">Portfolio</span>
        <span class="mob-column-header__chip"><span class="mob-chip">Robinhood Chain</span></span>
      </div>
      <!-- data cards -->
    </aside>
    <main class="mob-main" data-mob-density="product">
      <div class="mob-column-header">
        <span class="mob-column-header__title">Open positions</span>
        <span class="mob-column-header__chip"><span class="mob-chip">1 ladders · 1 rungs</span></span>
        <span class="mob-column-header__spacer"></span>
        <span class="mob-column-header__meta">updated 3s ago</span>
        <span class="mob-column-header__actions">
          <button class="mob-btn mob-btn--primary mob-btn--md">New position</button>
        </span>
      </div>
      <!-- rows -->
    </main>
  </div>
</div>
```

---

## 3. Page header

**What it is.** The row that names the surface: title, a qualifying chip, right-aligned
metadata, and at most one primary action.

**When.** The top of every page and the top of every major column. It is the *same block* as
the column header in §2 — `.mob-column-header` — at a larger title role. There is no separate
page-header class, and there does not need to be one: the slots and the order are identical.

### Anatomy

```
mob-column-header
├── mob-column-header__title      .mob-title role by default; override with .mob-heading-md
├── mob-column-header__chip       slot for a .mob-chip   ← scope, count, network, status
├── mob-column-header__spacer     ──── spacer ────
├── mob-column-header__meta       freshness, owner, last edit
└── mob-column-header__actions    [secondary ghost] [ONE primary]
```

`__title` and `__meta` declare their type role at zero specificity (`:where(…)`), so putting
`.mob-heading-md` or `.mob-meta` on the same element wins without an `!important`.

### Rules

| Rule | Why |
|---|---|
| The chip qualifies the title; it does not restate it | "Open positions" + "1 ladders · 1 rungs" is scope. "Open positions" + "Positions" is noise. |
| Exactly one primary per header | Two primaries means the header has not decided what the page is for. Demote one to ghost. |
| Metadata sits left of the actions, not right | Actions anchor the right edge across every page in the product; metadata is variable-length and would push them around. |
| Header height = `--mob-column-header-h` (which reads `--mob-header-row-h`, 34px); the title is vertically centred, not baseline-aligned to the chip | Chips and buttons have different optical baselines. Centring is the only alignment that survives all three being present or absent. |
| A page title uses sans 600 / `--mob-tracking-tight` at any size — a heading is never mono; a chip beside it stays mono | This is the dual-family split doing its job: the name is typographic, the qualifier is data. |
| No breadcrumb unless the hierarchy is genuinely ≥ 3 deep | A breadcrumb on a two-level app is template residue. |

```html
<header class="mob-column-header">
  <h1 class="mob-column-header__title mob-heading-md">Positions</h1>
  <span class="mob-column-header__chip"><span class="mob-chip">Robinhood Chain</span></span>
  <span class="mob-column-header__spacer"></span>
  <span class="mob-column-header__meta">updated 3s ago</span>
  <span class="mob-column-header__actions">
    <button class="mob-btn mob-btn--ghost">Export</button>
    <button class="mob-btn mob-btn--primary">New position</button>
  </span>
</header>
```

A page header sitting directly in `.mob-main` or `.mob-rail` picks up the baseline
compensation from §2 automatically. One sitting anywhere else falls back to a plain
`--mob-column-header-gap` (11px) below it, which is the right answer when there is no
neighbouring column to line up with.

---

## 4. Section rhythm

**What it is.** The fixed order in which a section introduces itself.

```
mob-section
├── mob-section__head
│   ├── mob-section__eyebrow   (optional)  uppercase, 9.5px, .7px tracking
│   ├── mob-section__heading               sans 600, -0.02em
│   └── mob-section__support   (optional)  capped at --mob-container-prose
├── content                                anything
└── mob-section__actions       (optional)  one button, left-aligned with the heading
```

`__eyebrow`, `__heading` and `__support` set their type roles at zero specificity, so a
`base.css` type class on the same element (`.mob-display-lg` on the heading, say) overrides
them cleanly. `.mob-section__head--split` puts the head and its controls on one row.

### Rules

| Rule | Why |
|---|---|
| Never reorder. Eyebrow above heading, support below it, action last | A reader learns the shape once and then stops reading structure and starts reading content. Reordering costs them that. |
| Sections are separated by `--mob-section-gap`, not by a rule line | Spacing should communicate the boundary before a divider is added. Add the divider only when two adjacent sections are the same *kind* of content and the gap alone reads ambiguous. |
| `--mob-section-gap` moves with the density zone: 128 / 64 / 32px | Marketing needs the air; a table page with 128px between sections wastes a screen. Set the zone on a wrapper; do not hand-tune the gap per section. |
| Support copy is capped at `--mob-container-prose` (68ch) even when the section is full-bleed | Past ~75 characters the eye loses the line return. The heading may be wide; the paragraph may not. |
| The eyebrow is the only uppercase text in the section | `--mob-tracking-label` exists so 9.5px uppercase stays legible. It is not a licence to uppercase headings. |
| One action per section, and it repeats the section's verb | Two actions at the end of a section is a fork the reader did not ask for. |

```html
<section class="mob-section" data-mob-density="marketing">
  <header class="mob-section__head">
    <p  class="mob-section__eyebrow mob-tone-accent">Positions</p>
    <h2 class="mob-section__heading mob-heading-xl">Every range, on one line</h2>
    <p  class="mob-section__support">
      One row per position: identity, range, the money, and the two actions you actually take.
    </p>
  </header>
  <!-- content -->
  <div class="mob-section__actions">
    <button class="mob-btn mob-btn--primary mob-btn--lg">Open a position</button>
  </div>
</section>
```

---

## 5. Hero

**What it is.** The first screen of a marketing or landing surface. One statement, one
support line, one action, one visual.

**When.** Landing pages, product pages, docs home. Never inside the app — an app opens
with a page header, not a hero.

### Anatomy

A hero is not its own block. It is `.mob-section` at marketing density, with the display type
role on the heading and a media card for the visual.

```
mob-section  ·  data-mob-density="marketing"
├── mob-section__head
│   ├── mob-section__eyebrow    (optional, ONE)
│   ├── mob-section__heading    + .mob-display-lg | .mob-display-xl   max-width ~20ch
│   └── mob-section__support    68ch by default, ONE sentence or two
├── mob-section__actions
│   ├── primary                 .mob-btn.mob-btn--primary.mob-btn--lg
│   └── secondary               .mob-btn.mob-btn--ghost.mob-btn--lg (optional)
└── mob-card mob-card--media    real product, aligned to the layout grid
    └── mob-card__media
```

### Rules

| Rule | Why |
|---|---|
| One dominant headline, at `.mob-display-lg` or `.mob-display-xl` | These clamp fluidly (`clamp(34px, 5vw, 64px)`), so the headline is the same *relative* weight on a laptop and a 32" monitor. A fixed size is only right on one screen. |
| Cap the headline near 20ch | At `--mob-tracking-tight` and 1.0 leading, a long headline turns into a wall. If it needs three lines it is a paragraph wearing a headline's clothes. |
| Support line is one or two sentences | It exists to answer "what is this", not to sell. |
| Exactly one primary action, one optional secondary | See below. |
| The visual is the real product, aligned to the same left edge as the headline | §3.4 alignment rule: cards must not introduce random internal left boundaries. A hero screenshot that floats 12px off the text edge reads as a stock image. |
| Empty space is content | The hero is the one place in this system where `--mob-section-gap: 128px` is correct. Do not fill it. |
| Motion: opacity + ≤8px translate, `--mob-duration-enter` (260ms), `--mob-ease-enter`, and nothing blocks input | A splash animation that delays the primary action is a bug with a design rationale attached. |

### What to avoid

| Anti-pattern | What goes wrong |
|---|---|
| **Three CTAs** | Three equal-weight actions means the page has no opinion. The reader's next move becomes a decision instead of a click. Two maximum, and the second is visibly quieter (ghost, same height). |
| **Long marketing paragraphs** | A 60-word hero paragraph is skipped entirely, so the words after it are read by nobody. Cut to one line; move the rest into the first feature section where a reader has already opted in. |
| **A stack of badges above the heading** | "Backed by X · v2.0 · SOC2 · Product Hunt #1" competes with the headline for the first fixation and wins, because badges are small and dense and the eye goes there. One eyebrow, or none. |
| **Several unrelated illustrations** | Two decorative graphics in one viewport read as a template, not a product. §21: one or two dominant visual effects per section, maximum. |
| **A hero on an app page** | Marketing density inside the product is the single fastest way to make a dense product feel like a landing page demo. |

```html
<section class="mob-section" data-mob-density="marketing">
  <header class="mob-section__head">
    <p  class="mob-section__eyebrow mob-tone-accent">Liquidity, laddered</p>
    <h1 class="mob-section__heading mob-display-lg" style="max-width:20ch">
      Ranges you can read at a glance
    </h1>
    <p  class="mob-section__support">One row per position. Fees and PnL first, value second.</p>
  </header>
  <div class="mob-section__actions">
    <button class="mob-btn mob-btn--primary mob-btn--lg">Open a position</button>
    <a class="mob-btn mob-btn--ghost mob-btn--lg" href="/docs">Read the docs</a>
  </div>
  <figure class="mob-card mob-card--media mob-mt-32">
    <img class="mob-card__media" src="/product.png" alt="The positions dashboard">
  </figure>
</section>
```

`.mob-card--media` is the card with its padding removed on the media edge, so the screenshot
meets the border with no seam. `.mob-section__support` already caps itself at
`--mob-container-prose`; the 20ch cap on the headline is the one measure worth stating inline,
because it is a headline decision and not a reading-measure one.

---

## 6. The data panel

**What it is.** A card whose whole job is to state one number. Label, hero figure,
optional trend, optional footer reference line. This is the handoff's portfolio-value and
realized-PnL cards, generalised.

**When.** Any single headline metric: revenue, active users, storage used, balance,
uptime, error rate. Stack them in a rail, or lay them across a proof strip.

### Anatomy

```
mob-card                        card surface + 1px border + radius 12
└── mob-stat [--sm|--lg|--xl]
    ├── mob-stat__head
    │   ├── mob-stat__label     + .mob-label     "PORTFOLIO VALUE"
    │   └── mob-stat__meta      (optional)       "all-time"   ← right, baseline-aligned
    ├── mob-stat__value                          the figure; inherits the block's tone
    └── mob-stat__sub           (optional)       one qualifier line
    mob-spark                   (optional trend) 46px, or a .mob-bar-stack
    mob-stat-row                (optional)       hairline above, reference label + value
```

`.mob-stat` owns the whole block, including the tone: `[data-mob-sign]` or `.mob-stat--positive`
on the block, never a colour on `__value`. Drop `__head` entirely when there is no right-hand
meta and put `__label` straight in the block.

### Figure sizes — pick by rank, not by taste

| Role | Class | Size | Family | Source |
|---|---|---|---|---|
| The one number the page is about | `.mob-figure-xl` | 27px | sans 600 | [src] portfolio value |
| A secondary headline metric | `.mob-figure-lg` | 23px | sans 600 | [src] realized PnL |
| A metric inside a row or segment | `.mob-figure-md` | 22px | sans 600 | [src] fees / PnL |
| A mini stat card | `.mob-figure-sm` | 16px | **mono** | [src] fees / loose |

Inside a `.mob-stat` block the same four steps are chosen with the block modifier instead, and
`__value` inherits the size: bare `.mob-stat` is the middle step (there is no `.mob-stat--md`),
`--sm` is the mono one, `--lg` and `--xl` are the two sans steps above it. Use the
`.mob-figure-*` classes when the figure is loose type on a surface with no `.mob-stat` around it.

`.mob-figure-sm` is mono and the others are sans. That is the rule, not an oversight: figures are
mono up to and including 16px and sans only from 22px up. At 16px mono still wins because
the card beside it is also mono and the pair must scan as one unit.

### Rules

| Rule | Why |
|---|---|
| Label above, always uppercase `.mob-label`, always `--mob-fg-label` | It is the quietest element in the card and the first one read. Making it louder makes the figure smaller by comparison. |
| The figure carries tone, the label never does | A green label plus a green number is one signal said twice. `[data-mob-sign]` goes on `.mob-stat`, which colours `__value` and `__sub` and leaves `__label` alone — that is exactly why `__value` declares no colour of its own. |
| Sign is part of the value: `+$616.35`, `−1.36%` | Colour is not the only status signal (§10). A red number that a colour-blind reader sees as grey still needs its minus. |
| The footer is reference information and must never be the largest number | The whole point of the panel is that one number dominates. A footer figure at the same size destroys it. |
| At most three type sizes in one panel | §3.2. Label + figure + footer is three. A fourth means the panel is doing two jobs. |
| The trend is decoration only if it has no axis; give it a range in the footer if the shape matters | A sparkline with no reference is a mood, not data. |
| Mini panels pair with `--mob-card-pad-y-sm / --mob-card-pad-x-sm` (12/13px) | Same card, one size step down. Do not shrink a full panel's padding by eye. |

```html
<article class="mob-card">
  <div class="mob-stat mob-stat--lg" data-mob-sign="positive">
    <div class="mob-stat__head">
      <span class="mob-stat__label mob-label">Realized PnL</span>
      <span class="mob-stat__meta">all-time</span>
    </div>
    <div class="mob-stat__value">+$616.35</div>
  </div>

  <div class="mob-spark mob-spark--positive mob-mt-8">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
          <stop class="mob-spark__stop-from" offset="0"></stop>
          <stop class="mob-spark__stop-to"   offset="1"></stop>
        </linearGradient>
      </defs>
      <path class="mob-spark__area" d="M0,78 L26,44 L44,70 L60,20 L96,11 L96,100 L0,100 Z"
            fill="url(#sp)"></path>
      <path class="mob-spark__line" d="M0,78 L26,44 L44,70 L60,20 L96,11"></path>
    </svg>
  </div>

  <div class="mob-stat-row">
    <span class="mob-stat-row__label">Unrealized</span>
    <span class="mob-stat-row__value" data-mob-sign="positive">+$0.2195</span>
  </div>
</article>
```

The `<stop>`s carry no colour in markup: `.mob-spark__stop-from` / `__stop-to` are the
gradient, and CSS beats presentation attributes, so a stray `stop-color` in a template loses
to the token. Both the stroke and the fill read `--mob-spark-color`, so flipping a losing
series to negative is one modifier (`.mob-spark--negative`), not three declarations.
`.mob-spark__line` carries `vector-effect: non-scaling-stroke`, which keeps the 1.6px stroke
at 1.6px however the viewBox is stretched — without it, `preserveAspectRatio="none"` distorts
the line weight.

---

## 7. The fused segment row

**What it is.** One entity per row, split into segments that are visually welded together:
identity, visualisation, metrics, actions. The seams between segments are **1px gaps over a
frame-coloured parent**, not borders.

**When.** A list of complex entities where each row carries several unrelated kinds of
information and at least one action. Positions, deployments, campaigns, servers, invoices,
model runs. Not for simple lists — a name and a date is a table row, not a segment row.

### Anatomy

```
mob-segmented                        background --mob-bg-frame, gap 1px, overflow hidden
├── mob-segmented__seg--fixed        identity        never grows   avatars + name + meta
├── mob-segmented__seg--wide         visualisation   flex-grow 2   label + meter + scale
├── mob-segmented__seg--grow         metrics         flex-grow 1   the metric pair (§8)
└── mob-segmented__seg--actions      actions         flex-grow 0   stacked, narrowest, last
```

Every segment shares one basis, `--mob-seg-basis`; the four modifiers only change the grow
factor. `--grow` is the default restated explicitly, so a component API can emit it
unconditionally.

### Why gaps and not borders

The outer element is painted `--mob-bg-frame` (#1c1e22). Every segment is painted
`--mob-bg-surface` (#101114). A `gap: 1px` lets 1px of the frame show through between
segments. That single decision buys four things a border cannot:

1. **No doubling.** Adjacent borders would produce a 2px seam wherever two segments meet
   and 1px at the card edge. Gaps are always exactly 1px.
2. **Free wrap dividers.** When the row wraps, `row-gap: 1px` draws the horizontal hairline
   for you. With borders you would have to know which segment ended a visual row.
3. **Clean radius.** `overflow: hidden` on the parent clips the corner segments to the card
   radius. Bordered children would show a square corner inside a rounded card.
4. **One colour to change.** The seam is a parent background. Retheming the frame is one
   token, not N border declarations.

### Segment ordering

| Position | Content | Rule |
|---|---|---|
| First | **Identity** | The thing a user scans down the list to find. Always leftmost, always the same width across every row, or scanning breaks. |
| Middle | **Context / visualisation** | Highest grow factor (`flex-grow: 2`) — a chart is the only segment that genuinely improves with more width. |
| Widest treatment | **The metric they came for** | Biggest type in the row (`.mob-figure-md`, 22px sans 600). If two metrics tie, they were not the reason the user opened the page — find the real one. |
| Last | **Actions** | `flex-grow: 0`. Narrowest. Rightmost. |

Reading order is decision order: *which one is this → what is it doing → what is it worth →
what do I do about it*. A row that puts actions in the middle forces a second pass.

### Rules

| Rule | Why |
|---|---|
| Every segment is `box-sizing: border-box` and shrinkable (`flex-shrink: 1`) | This is what stops the row overflowing a narrow column. A single `flex-shrink: 0` segment blows out the whole card. |
| Grow factor = importance under slack; basis = natural width; min-width = the point below which it stops being readable | Three numbers, three separate jobs. Setting them all equal produces a row that degrades badly at every width. |
| Actions get `flex-grow: 0` | A button column that stretches with the viewport looks broken and puts the click target somewhere different on every screen size. |
| The row wraps; it never scrolls horizontally | `flex-wrap: wrap` plus honest min-widths means a narrow column gets a two-line card instead of a scrollbar. Horizontal scroll inside a card is never discovered. |
| Card-level hover goes on the row; the action buttons stay above it | If the whole row is clickable, a click on Claim must not also navigate. Stop propagation on the action segment, and give the row `--mob-bg-hover` — not a translate, not a scale (§21: no layout shift on hover). |
| Segment padding is `--mob-card-pad-y / --mob-card-pad-x` (15/16px) unless the segment is vertically centred content, which uses 13px/18px [src] | The 13/18 pair is off the public spacing scale on purpose; it is a measured component value. `card.css` parks it as `--mob-seg-pad-x-lg` and `--mob-seg-pad-actions` rather than typing `18px` in two places and letting them drift. Reach for `.mob-segmented__seg--pad-lg` instead of a local override. |
| Per-row geometry is set through `--mob-seg-basis` / `--mob-seg-min`, not new modifier classes | Those two custom properties are the public hooks. A row that genuinely needs a 252px identity column writes `style="--mob-seg-basis:252px; --mob-seg-min:252px"` on that one segment. |

```html
<article class="mob-segmented">
  <div class="mob-segmented__seg mob-segmented__seg--fixed"
       style="--mob-seg-basis:252px; --mob-seg-min:252px">
    <div class="mob-avatar-stack">
      <span class="mob-avatar mob-avatar--lg" data-mob-series="3">N</span>
      <span class="mob-avatar mob-avatar--lg" data-mob-series="2">$</span>
    </div>
    <div class="mob-truncate">
      <div class="mob-heading-sm mob-nowrap">NUDES / USDG</div>
      <div class="mob-meta-sm mob-tone-muted mob-nowrap">V4 · 0.90% · 1 rungs</div>
    </div>
  </div>

  <div class="mob-segmented__seg mob-segmented__seg--wide mob-segmented__seg--pad-lg">
    <div class="mob-meter-frame">
      <div class="mob-meter-frame__head">
        <span class="mob-meter-frame__label">Range</span>
        <span class="mob-meter-frame__value">$0.01450 spot</span>
      </div>
      <div class="mob-meter" role="img" aria-label="Spot above range">
        <i class="mob-meter__bin"></i><i class="mob-meter__bin"></i>
        <i class="mob-meter__bin"></i><i class="mob-meter__bin"></i>
        <i class="mob-meter__bin"></i><i class="mob-meter__bin"></i>
        <i class="mob-meter__bin"></i><i class="mob-meter__bin"></i>
        <i class="mob-meter__bin"></i><i class="mob-meter__bin"></i>
        <i class="mob-meter__bin"></i><i class="mob-meter__bin"></i>
        <i class="mob-meter__bin"></i><i class="mob-meter__bin"></i>
        <i class="mob-meter__bin"></i><i class="mob-meter__bin" data-mob-active></i>
      </div>
      <div class="mob-meter-frame__foot">
        <span class="mob-meter-frame__min">$0.009909</span>
        <span class="mob-meter-frame__status">Above · sold</span>
        <span class="mob-meter-frame__max">$0.01346</span>
      </div>
    </div>
  </div>

  <div class="mob-segmented__seg mob-segmented__seg--grow"><!-- the metric pair, §8 --></div>

  <div class="mob-segmented__seg mob-segmented__seg--actions">
    <button class="mob-btn mob-btn--affirm mob-btn--sm">Claim</button>
    <button class="mob-btn mob-btn--destroy mob-btn--sm">Close</button>
    <button class="mob-icon-btn mob-icon-btn--sm" aria-label="More actions">···</button>
  </div>
</article>
```

Three things in that markup are worth naming, because they are the parts people re-implement:

- **`.mob-avatar-stack`** is the overlap. It sets the `--mob-avatar-overlap` margin between
  children and nothing else; the 2px ring is on `.mob-avatar` and is painted in the segment
  colour, not white. Series tint and glyph come from `[data-mob-series]`, which `card.css`
  declares once for 1–8 on the card, the segment, the row, the stack and the avatar — you
  never pick a tint by hand at the call site.
- **`.mob-meter`** is the bin meter and `.mob-meter__bin` is one bin; `[data-mob-active]` is
  the current one, which grows to the full `--mob-meter-h` and takes the accent glow.
- **`.mob-meter-frame`** is the label row and the min/status/max row around it. Its
  `__head` + `__foot` are exactly the two rows this pattern needs, tone-aware through
  `.mob-meter-frame--positive` and friends.

The bin meter generalises past price ranges: **bin count = the granularity of the thing,
and exactly one bin is current**. Shipping stages, funnel steps, retry attempts, storage
tiers. When the current value falls outside the range, highlight the edge bin and say so in
the footer ("Above · sold", "Below · sold") — the highlight alone cannot express *outside*.
`role="img"` with an `aria-label` on the container, because sixteen empty `<i>` elements
are meaningless to a screen reader.

---

## 8. Metric pair with a hairline split

**What it is.** Two metrics of equal rank, side by side, divided by a 1px vertical
hairline, over a reference-value footer.

**When.** Two numbers a user reads together and compares: earned vs owed, sent vs opened,
used vs available, fees vs PnL. Three is a strip, not a pair — the divider stops working at
three because the eye no longer knows which side of it it is on.

### Anatomy

```
mob-stat-pair                    flex, align-items: stretch, gap --mob-stat-pair-gap (18px [src])
├── mob-stat   col A             label / figure / sub
└── mob-stat   col B             label / figure / sub   ← carries the 1px hairline itself
mob-stat-row                     hairline above, reference label + value
```

### Rules

| Rule | Why |
|---|---|
| The divider is a `border-inline-start` on the *second* column plus a matching `padding-inline-start`, and the pair is `align-items: stretch` | Nothing presentational goes in the markup — there is no divider element to forget, and it mirrors correctly under RTL for free. `stretch` is what makes the rule span the taller of the two columns; `align-items: center` would leave it short. |
| Both columns are `flex: 1 1 0` | Equal rank means equal width, regardless of which value happens to be longer today. `flex-basis: auto` would let a long number claim more space and make the pair look weighted. `.mob-stat-pair > *` already sets this, so the columns need no sizing class. |
| Both figures are the same size step | If one is bigger, they are not a pair. Put the step on the two `.mob-stat` blocks, not on `__value`. |
| The sub-line under each figure is `.mob-stat__sub`, and only carries tone when it is itself a signed value | "uncollected" is a noun, not a signal. "+0.67%" is a signal — and `[data-mob-sign]` on the block tones `__value` and `__sub` together. |
| The reference row sits under a `--mob-border-subtle` hairline with `--mob-stat-row-gap` above and `--mob-stat-row-pad` below it [src] | `--mob-border-subtle` (#17191d), not `--mob-border-frame` — this is a divider *inside* one surface, one step quieter than the seam *between* two surfaces. Getting these two confused is the most common way this system starts looking muddy. |
| Three metrics of equal weight is not a pair | `.mob-stat-pair` takes any number of children, but two is the design: at three the divider stops working because the eye no longer knows which side of it it is on. Three equal metrics is a table, or a `.mob-kpi-row`. |
| **The reference value is never the largest number in the card** | The footer exists so a user can check the number they were not looking for. The moment it competes, the pair stops having a subject. In the handoff this is why position *value* is 12.5px while fees and PnL are 22px — the brief was to emphasise earnings over size, and the type scale is where that decision is actually enforced. |

```html
<div class="mob-stat-pair">
  <div class="mob-stat" data-mob-sign="positive">
    <span class="mob-stat__label mob-label">Fees</span>
    <div class="mob-stat__value">$0.2194</div>
    <div class="mob-stat__sub">uncollected</div>
  </div>
  <div class="mob-stat" data-mob-sign="positive">
    <span class="mob-stat__label mob-label">PnL</span>
    <div class="mob-stat__value">+$0.2195</div>
    <div class="mob-stat__sub">+0.67%</div>
  </div>
</div>
<div class="mob-stat-row">
  <span class="mob-stat-row__label">Value</span>
  <span class="mob-stat-row__value">$31.12<span class="mob-stat-row__qualifier">100% USDG</span></span>
</div>
```

Note there is no `__head` on either column: with no right-hand meta, `__label` goes straight
into the block. And `__qualifier` is a child of `__value`, not a sibling — its separation is a
margin, so it holds whether the qualifier is a separate element or not.

---

## 9. Composition breakdown

**What it is.** A stacked proportion bar over a legend of rows, where the bar segment and
the legend share one colour token per series.

**When.** A whole that divides into 2–6 named parts: portfolio by asset, traffic by source,
spend by category, storage by bucket, errors by type.

### Anatomy

```
mob-bar-stack                        height --mob-bar-h, gap --mob-bar-gap, radius --mob-bar-radius
└── mob-bar-stack__seg × n           one per series, weighted by --mob-bar-weight
mob-stack                            the legend: a column of rows, gap 14px
└── mob-list-row × n
    ├── mob-avatar                   24px, series tint + glyph
    ├── mob-list-row__main
    │   ├── mob-list-row__name
    │   └── mob-list-row__sub
    └── mob-list-row__trail
        ├── mob-list-row__value      right-aligned
        └── mob-list-row__share      the share, in the SERIES colour
```

For a compact inline legend under a chart — swatch, label, value, on one wrapping line —
use `.mob-legend` with `.mob-legend__item` / `__swatch` / `__label` / `__value` instead. The
list-row form above is the one that carries an entity per line.

### Rules

| Rule | Why |
|---|---|
| Set `--mob-bar-weight` to the raw quantity, not a computed percentage | `597` / `399` / `4` [src] feed straight into `flex-grow`. The browser does the ratio arithmetic, exactly, every render. Computing percentages yourself introduces rounding that makes the bar not quite fill its container. |
| The segment floor is `--mob-bar-seg-min`, already on `.mob-bar-stack__seg` | A 0.4% holding is a 2px sliver that reads as a rendering artefact. A floor keeps small positions visible without lying about the proportion — the bar is for shape, the legend has the exact number. `--empty` opts out of the floor, because "nothing" is not worth a minimum width. |
| The share percentage in the legend is painted the **series** colour; the value is not | One colour link between bar and legend, and it must be exact. Colouring both the value and the share doubles the signal and starts to look like a status. |
| Never round shares to numbers that do not sum to 100 | `59.7 / 39.9 / 0.4` sums to 100.0. `60 / 40 / 0` does not describe the same portfolio and invites "where did it go". |
| Series colours come from `--mob-series-1` … `--mob-series-8` in order, and stay assigned to the same entity across the whole product | If ETH is `--mob-series-1` in the rail it is `--mob-series-1` in the chart, the legend, and the row avatar. Reassigning per screen destroys the only thing the colour was for. |
| Beyond 6 series, group the tail into "Other" (`--mob-series-8`, the neutral) | Eight hue-spaced colours is already the point where a reader stops matching swatch to label. |
| The bar is `role="img"` with a summarising `aria-label` | Three unlabelled divs are not a chart to anyone using a screen reader. |

```html
<div class="mob-bar-stack" role="img" aria-label="ETH 59.7%, USDG 39.9%, in positions 0.4%">
  <span class="mob-bar-stack__seg" data-mob-series="1" style="--mob-bar-weight:597"></span>
  <span class="mob-bar-stack__seg" data-mob-series="2" style="--mob-bar-weight:399"></span>
  <span class="mob-bar-stack__seg" data-mob-series="3" style="--mob-bar-weight:4"></span>
</div>

<ul class="mob-stack mob-mt-16">
  <li class="mob-list-row" data-mob-series="1">
    <span class="mob-avatar mob-avatar--md">E</span>
    <div class="mob-list-row__main">
      <div class="mob-list-row__name">ETH</div>
      <div class="mob-list-row__sub">1.57 ETH + 0.42 WETH</div>
    </div>
    <div class="mob-list-row__trail">
      <div class="mob-list-row__value">$4,800.09</div>
      <div class="mob-list-row__share">59.7%</div>
    </div>
  </li>
  <!-- … -->
</ul>
```

`[data-mob-series]` on the row is what makes the swatch, the avatar tint and the share
percentage the same colour: `card.css` declares the series hooks once for `.mob-card`,
`.mob-segmented`, `.mob-segmented__seg`, `.mob-list-row`, `.mob-avatar-stack` and
`.mob-avatar`, and `__share` reads `--mob-series-fg`. Nothing here names a colour token at
the call site, which is the only way the bar and the legend cannot drift apart.

---

## 10. Filter bar, search-with-results, toolbar

Three variations on the same row. Keep them the same height (`--mob-header-row-h`) so a
page header, a toolbar and a filter bar can stack without a rhythm break.

### 10a. Filter bar

```
mob-cluster
├── mob-chip-group
│   ├── chip  All          [aria-pressed=true]
│   ├── chip  In range
│   └── chip  Out of range
├── mob-spacer
└── count                  .mob-meta   "12 of 48"
```

| Rule | Why |
|---|---|
| Filter chips are toggles, not buttons: `.mob-chip[data-mob-interactive]` with `aria-pressed` | A chip that looks like a chip and behaves like a button is a keyboard trap for anyone expecting toggle semantics. |
| Selected = `--mob-bg-selected` + `--mob-border-strong`, **not** an accent fill | Accent is scarce and reserved for the primary action. A row of six accent-filled chips makes the actual primary invisible. |
| The result count updates live and is the filter's only confirmation | Without it, "no results" and "filter didn't apply" look identical. |
| Filters are reflected in the URL | A filtered view a user cannot send to a colleague is half a feature. |
| A cleared filter set returns to an explicit "All" chip, not to nothing selected | "Nothing selected" is ambiguous between *everything* and *nothing*. |

```html
<div class="mob-cluster">
  <div class="mob-chip-group" role="group" aria-label="Filter positions">
    <button class="mob-chip" data-mob-interactive aria-pressed="true">All</button>
    <button class="mob-chip" data-mob-interactive aria-pressed="false">In range</button>
    <button class="mob-chip" data-mob-interactive aria-pressed="false">Out of range</button>
  </div>
  <span class="mob-spacer"></span>
  <span class="mob-meta" aria-live="polite">12 of 48</span>
</div>
```

`.mob-spacer` is `flex: 1 1 auto` with `pointer-events: none` — never a hit target, never read
aloud. Use it instead of an inline `style="flex:1"`.

### 10b. Search with results

```
mob-field                        (optional label + footer)
└── mob-input-wrap mob-search    --mob-field-h (40px), sunken bg
    ├── mob-search__icon         leading icon
    ├── mob-input[type=search]
    ├── mob-search__count        "12"
    ├── mob-kbd mob-search__kbd  ⌘K / "/" hint
    └── mob-input-wrap__action mob-search__clear
status                           .mob-meta, aria-live="polite"
                                 "12 results for “ladder”" | "Searching…" | "No results"
results                          list | table | grid
```

`.mob-search` is a **specialisation of `.mob-input-wrap`, not a standalone block** — it must
carry both classes or it has no box, no border and no height. It adds four optional slots and
nothing else. There is no results-container class in the system: the results are whatever list,
table or grid the surface already uses, and the "stale" dim below is a property you set on that
element in your own app code.

| Rule | Why |
|---|---|
| Debounce 150–250ms [drv], then fire | Below ~150ms you are querying on every keystroke; above ~250ms typing feels disconnected from the result. |
| Keep the previous results on screen while the next query resolves; dim the results element to `opacity: .6` in your own code | Blanking the list causes a layout collapse and a scroll jump on every keystroke. Dimming says "stale" without moving anything. |
| The kbd hint and the clear button toggle with `visibility`, never `display` | Both slots keep their width for the life of the field, so typing the first character cannot shift the caret. `field.css` already does this — do not "fix" it with `display: none`. |
| For a fast query, the count line is the only loading feedback | A spinner that appears and vanishes in 80ms is a flash, not information. |
| `aria-live="polite"` goes on the status line, never on the results container | Announcing 40 changed rows on each keystroke is unusable. The count is the summary a screen-reader user actually needs. |
| Escape clears the query; the clear button does the same and is always present once there is text | |
| Empty-with-query and empty-without-query are different states with different copy | "No results for 'xyz' — clear search" vs "Nothing here yet — create one". Same box, different action. See §13. |

### 10c. Toolbar

```
mob-cluster  [+ mob-sticky mob-sticky--canvas mob-sticky--seam]
├── scope         .mob-tabs | .mob-select   ← what am I looking at
├── filters       .mob-chip-group           ← narrowed how
├── mob-spacer
├── meta          .mob-meta                 ← count, freshness
└── actions       [ghost] [ONE primary]
```

| Rule | Why |
|---|---|
| Left is *what you are looking at*, right is *what you can do* | Consistent across every list page in the product; users stop hunting. |
| One primary, and it is the rightmost element | The right edge is the anchor. Everything else in the row can appear or disappear without moving it. |
| A sticky toolbar is `.mob-sticky` + `.mob-sticky--canvas` + `.mob-sticky--seam` | `--canvas` paints `--mob-bg-canvas` *and* bleeds it over the page gutter, so content scrolling underneath disappears at the true page edge rather than at the block edge; without it, rows scroll visibly through the bar. `--seam` is the bottom hairline, without which the toolbar and the content merge the moment they touch. |
| Destructive bulk actions only appear when a selection exists, and they use the destroy tone | A permanently visible "Delete all" is an accident waiting for a mis-click. |

### Shared geometry for all three

All three rows are `.mob-cluster`, so they already agree on `align-items: center`,
`flex-wrap: wrap` and one gap token. Nothing above needs a new class:

```html
<div class="mob-cluster mob-sticky mob-sticky--canvas mob-sticky--seam">
  <div class="mob-tabs mob-tabs--underline"><!-- scope --></div>
  <div class="mob-chip-group"><!-- filters --></div>
  <span class="mob-spacer"></span>
  <span class="mob-meta" aria-live="polite">12 of 48</span>
  <button class="mob-btn mob-btn--ghost mob-btn--sm">Export</button>
  <button class="mob-btn mob-btn--primary mob-btn--sm">New position</button>
</div>
```

To keep a filter bar, a toolbar and a page header on one rhythm, put them in the same column
and let `.mob-column-header` set the 34px baseline; a cluster has no minimum height of its
own, and giving it one by hand is how the three rows start disagreeing.

---

## 11. Confirmation flow for destructive actions

**What it is.** A modal that stops an irreversible action and states its consequence
before it happens.

**When.** Only when undo is genuinely impossible. Confirm and undo are alternatives, not
a belt-and-braces pair — asking twice trains the user to click through the first one.

| Reversible? | Cost of a mistake | Pattern |
|---|---|---|
| Instantly | Low | Just do it. No dialog, no toast. |
| Via undo, seconds | Low–medium | Optimistic + undo toast (§12) |
| No | Medium | Confirm dialog |
| No, and it moves money or deletes data | High | Confirm dialog + typed confirmation |

### Anatomy

```
mob-modal-backdrop            scrim + centring layer, --mob-z-modal-backdrop
└── mob-modal [--sm]          --mob-bg-elevated, --mob-z-modal, flex column
    ├── mob-modal__header     pinned, 1px divider
    │   ├── mob-modal__title  names the object
    │   └── mob-modal__desc   optional
    ├── mob-modal__body       the ONLY scrolling part — the consequence, real numbers
    │                         (typed confirm field lives here, highest tier only)
    └── mob-modal__footer     pinned, 1px divider
        ├── Cancel            ghost         ← receives initial focus
        └── Confirm           destroy tone  ← repeats the verb
```

Open/closed is one attribute, `data-mob-state="open" | "closed"`, on the overlay — no
`data-mob-open`, and never the global `[hidden]` attribute alongside `closed`, because
`reset.css` makes that `display: none !important` and the exit animation is skipped.

### Rules

| Rule | Why |
|---|---|
| The title names the object: "Close NUDES / USDG position" | "Are you sure?" tells the user nothing they did not already know and gives them nothing to check. |
| The body states the consequence with the real numbers: "Withdraws $31.12 of liquidity and claims $0.2194 in fees. This cannot be undone." | The whole value of a confirm dialog is the chance to notice you are on the wrong row. Generic copy removes that chance. |
| The confirm button repeats the verb — "Close position", never "OK" / "Yes" / "Confirm" | Users read buttons, not bodies. The button must be self-sufficient. |
| The confirm button uses the **destroy** tone, not the primary accent | Accent means "the thing you came here to do". Destruction is not that, and rendering it in brand violet makes it the most attractive target on screen. |
| Initial focus goes to **Cancel** | Enter must never destroy. |
| Escape cancels. Backdrop click cancels only when nothing has been typed | Losing a typed confirmation to a stray click is worse than one extra click. |
| Focus is trapped in the dialog and returns to the triggering control on close | |
| On success, remove the row with `opacity` + `height` over `--mob-duration-normal`; do not refetch the page | A full refetch loses scroll position and makes a 160ms action feel like a second. |
| Do not confirm something you could give undo instead | Every unnecessary dialog makes the necessary ones less effective. |

```html
<div class="mob-modal-backdrop" data-mob-state="open">
  <div class="mob-modal mob-modal--sm" role="alertdialog" aria-modal="true"
       aria-labelledby="ct" aria-describedby="cb">
    <header class="mob-modal__header">
      <h2 class="mob-modal__title" id="ct">Close NUDES / USDG position</h2>
    </header>
    <div class="mob-modal__body" id="cb">
      <p class="mob-body">
        Withdraws <span class="mob-value-sm">$31.12</span> of liquidity and claims
        <span class="mob-value-sm" data-mob-sign="positive">$0.2194</span> in fees.
        This cannot be undone.
      </p>
    </div>
    <footer class="mob-modal__footer">
      <button class="mob-btn mob-btn--ghost" autofocus>Cancel</button>
      <button class="mob-btn mob-btn--destroy">Close position</button>
    </footer>
  </div>
</div>
```

The modal is one of the few surfaces that carries a shadow. Cards get depth from surface and
border; an overlay genuinely floats, so it is allowed to cast. `__body` is the only scrolling
part, which is what keeps the title and the two buttons visible in a dialog that outgrows the
viewport — the exact moment a confirm dialog most needs its Cancel to stay reachable.

---

## 12. Optimistic action with undo

**What it is.** The action commits in the UI immediately, the network catches up, and
failure is handled by reverting plus an explicit message. The handoff's **Claim** button is
the worked example.

**When.** The action is reversible or idempotent, and the user does several of them in a
row. Claiming fees, marking read, archiving, starring, toggling a flag, reordering.

### The sequence

| t | What happens |
|---|---|
| `0ms` | Press: `transform: scale(var(--mob-press-scale))` — 0.985 [src] |
| `0ms` | The affected figure updates to the optimistic value; the button enters a busy state **at its current width** |
| `0ms` | The action is queued; the row stays fully interactive except for this one button |
| on success | Button returns to rest. **No success toast.** The number already changed — saying so again is noise |
| on failure | Figure reverts over `--mob-duration-fast` (120ms), and an error toast appears with **Retry** |

### Rules

| Rule | Why |
|---|---|
| The busy state must preserve the button's width | A button that shrinks from "Claim" to a spinner shifts every control below it. Reserve the width, swap the content. |
| The optimistic value must be the value the server will actually produce | If you cannot compute it — an unknown fee, a server-assigned id — show a *pending* treatment instead: dim the figure to `.mob-tone-muted` and leave the old value. A fake number that corrects itself two seconds later is worse than a slow one. |
| Never revert silently | A number that quietly goes back is read as a bug in the data, not a failed request. The toast is the whole contract. |
| The error toast carries the noun and a Retry: "Couldn't claim fees for NUDES / USDG · Retry" | "Something went wrong" gives the user no way to know whether to try again or reload. |
| Undo lives in the toast for 5–8s [drv], `--mob-toast-w` (340px), `--mob-z-toast` | Long enough to notice, short enough not to stack. |
| Never pair a confirm dialog **and** an undo toast for the same action | Two safety nets means neither gets read. Pick by the table in §11. |
| Disable the button only while its own request is in flight; never disable the row | Blocking the whole row for one action makes a fast product feel modal. |
| Motion is `opacity` and `transform` only, 100–200ms, no bounce [src] | A number that springs draws the eye to the animation instead of the value. |

```html
<!-- rest -->
<button class="mob-btn" data-mob-variant="affirm" data-mob-size="sm">Claim</button>

<!-- in flight: width preserved, label swapped, row still usable -->
<button class="mob-btn mob-btn--affirm mob-btn--sm"
        data-mob-loading aria-busy="true" disabled>Claim</button>

<!-- failure -->
<div class="mob-toast-region" role="region" aria-live="assertive">
  <div class="mob-toast" data-mob-tone="error" role="alert">
    <span class="mob-toast__icon"></span>
    <span class="mob-toast__title">Couldn't claim fees for NUDES / USDG</span>
    <button class="mob-toast__action">Retry</button>
    <button class="mob-toast__close" aria-label="Dismiss"></button>
  </div>
</div>
```

`.mob-toast-region` is the fixed stack; a toast is never positioned by hand. Tone is
`data-mob-tone="info|success|warning|error"` (or the matching `--info`/`--success`/`--warning`/
`--error` modifier) — there is no `negative` tone value on feedback components, and tone drives
the icon glyph as well as the colour, so leaving `__icon` empty is how colour stops being the
only signal. The close button is labelled with `aria-label`, never inner text: the × is drawn
only while the button is empty, so a nested `.mob-sr-only` span would erase it.

The `affirm` / `destroy` triplets (`--mob-affirm-fg`, `--mob-destroy-bg`, …) are the one
calibrated set that lives in the primitive tier with no semantic alias; read them directly.
They are deliberately desaturated so that a list of twenty rows, each with a green and a red
button, does not glow. Saturation appears on hover only — that is the whole reason the
hover triplet exists as separate tokens.

---

## 13. The empty / loading / error triad

**What it is.** Three states every data surface has, designed together, in the same box.

**When.** Every panel, list, table, chart and search result. There are no exceptions; a
surface without these three has them anyway, they are just undesigned.

### The rule that makes it work

All three occupy the **same minimum height** as a typical populated state. Nothing on the
page reflows when the data arrives, fails, or turns out to be empty. This is the difference
between a product that settles and a product that jumps.

| | Empty | Loading | Error |
|---|---|---|---|
| Block | `.mob-empty` (or `--sm` / `--bare`) | `.mob-skeleton` marks in the real element's own shape | `.mob-error-state` (`--block` when it replaces a panel) |
| Surface | `1px dashed var(--mob-border-dashed)` on canvas | `--mob-skeleton-bg` (#141518 [src]) | inherits the surface it annotates |
| Radius | `--mob-radius-lg` (10px) [src] | `--mob-skeleton-radius`; `--block` uses the same radius as the element it stands in for | — |
| Title | `.mob-empty__title` — "No open positions" | — | — |
| Body | `.mob-empty__sub` — one line, says what to do | — | `.mob-error-state__message`, one sentence |
| Action | `.mob-empty__actions` — ghost button, the actual first step | none | `.mob-error-state__retry` |

### Rules

| Rule | Why |
|---|---|
| The empty state is a product surface, not a fallback | For a new user it is the *first* thing they see. It gets the same review as the populated state. |
| Empty copy names the next action; the button performs it | "No open positions / Paste a token address to open your first ladder" + **Paste address** [src]. Not "Nothing here". |
| Empty-first-run and empty-after-filter are different states | First run offers creation. Filtered-empty offers **Clear filters** — offering "create your first" to someone with 400 records who typed a typo is insulting. |
| The dashed border is the only place dashed borders are used | It reads as "a container waiting to be filled", which is exactly the message. Using it elsewhere spends that meaning. |
| Skeletons match the final geometry: the right number of rows, the right heights, the right widths | A generic three-bar skeleton followed by a twelve-row table is a layout jump with extra steps. |
| Skeleton shimmer is optional and must respect reduced motion | `reset.css` already collapses animation durations globally under `prefers-reduced-motion`, so a shimmer degrades to a static block for free. Do not add a JS animation that bypasses it. |
| A load error is **inline**, never a modal | The user did not ask for anything; interrupting them for a failed background fetch is disproportionate. |
| On error, keep any data you already had, and mark it stale | Discarding good data because a refresh failed is a net loss of information. |
| Error copy says what failed and offers exactly one recovery | "Couldn't load positions · Retry". Not a stack trace, not an apology. |

```html
<!-- empty -->
<div class="mob-empty">
  <div class="mob-empty__visual" aria-hidden="true"></div>
  <p class="mob-empty__title">No open positions</p>
  <p class="mob-empty__sub">Paste a token address to open your first ladder.</p>
  <div class="mob-empty__actions">
    <button class="mob-btn mob-btn--ghost mob-btn--sm">Paste address</button>
  </div>
</div>

<!-- loading -->
<div class="mob-segmented" aria-busy="true">
  <div class="mob-segmented__seg mob-segmented__seg--fixed">
    <span class="mob-skeleton mob-skeleton--title" style="inline-size:60%"></span>
  </div>
  <div class="mob-segmented__seg mob-segmented__seg--wide">
    <span class="mob-skeleton mob-skeleton--block" style="--mob-skeleton-block-h:22px"></span>
  </div>
  <div class="mob-segmented__seg mob-segmented__seg--grow">
    <span class="mob-skeleton mob-skeleton--block" style="inline-size:70%;--mob-skeleton-block-h:22px"></span>
  </div>
  <div class="mob-segmented__seg mob-segmented__seg--actions">
    <span class="mob-skeleton mob-skeleton--block" style="--mob-skeleton-block-h:30px"></span>
  </div>
  <span class="mob-sr-only" aria-live="polite">Loading positions</span>
</div>

<!-- error -->
<div class="mob-error-state mob-error-state--block" role="alert">
  <span class="mob-error-state__icon"></span>
  <p class="mob-error-state__message">Couldn't load positions.</p>
  <button class="mob-error-state__retry">Retry</button>
</div>
```

`.mob-empty` already carries the dashed border, the radius and the centring — the anatomy is
`__visual` / `__title` / `__sub` / `__actions`, and the copy above is the calibrated instance,
so keep new copy to that length. `.mob-skeleton--block` takes its height from
`--mob-skeleton-block-h`, which is declared as an override hook precisely so you do not write
`height:` on a skeleton. `.mob-skeleton-group` is for a *stack* of lines and sets
`flex-direction: column`, so it does not belong on a `.mob-segmented` row — use it inside a
single segment or a card body. `.mob-error-state` is the inline form; `--block` is the one that
replaces a whole panel, and `__retry` is its own control — a `.mob-btn` in that slot would be
a second button style inside one message.

---

## 14. Polling and freshness

**What it is.** A surface that refreshes itself on an interval, and tells the user how old
what they are looking at is. In the handoff: `updated 3s ago`, on a ~2–3s poll [src].

**When.** Any value that changes without the user acting: prices, queues, build status,
live counts, anything backed by a stream you are approximating with requests.

### Anatomy

```
mob-column-header (or the .mob-cluster toolbar from §10c)
└── mob-column-header__meta   "updated 3s ago"
                              escalates in tone as it ages
```

### The freshness ladder [drv]

Derived from the poll interval `P` rather than from absolute seconds, so a 2s poll and a
60s poll both behave sensibly.

| Age | Tone | Copy |
|---|---|---|
| `< 3P` | `--mob-fg-label` | `updated 3s ago` |
| `3P – 10P` | `--mob-fg-muted` | `updated 45s ago` |
| `> 10P`, or ≥ 3 consecutive failures | `--mob-warning` | `updated 4m ago · Retry` |
| Connection lost | `--mob-warning` + chip | `Reconnecting…` |

### Rules

| Rule | Why |
|---|---|
| The label ticks on a local 1s timer; the fetch is a separate schedule | Otherwise "3s ago" is frozen at 3s until the next successful response, which is exactly when the user most needs it to keep counting. |
| Never blank data while refetching, and never spinner a panel you already populated | The user is watching a number. Removing it to show that you are fetching it is the opposite of the goal. |
| Repaint only the values that changed | Re-rendering the panel makes text reflow and selection drop on every tick. |
| A changed number may flash its tone for `--mob-duration-normal` (160ms). Nothing else | No scale, no slide, no highlight sweep. §21: no layout shift, no dramatic scaling. The value moved; say so quietly. |
| Tabular numerals are what make this survivable | `font-variant-numeric: tabular-nums` is set on `body` in `base.css` precisely so a polled figure does not reflow when `1` becomes `8`. Do not override it on a metric. |
| Pause polling when `document.visibilityState !== 'visible'`, and fetch once immediately on return | Background tabs polling every 2s is battery and quota for nobody. On return, the user must not read a stale number as fresh. |
| Back off on failure: `P × 2` per failure, capped at 30s [drv] | A server that is down does not benefit from 30 requests a minute. |
| The freshness label is **not** an `aria-live` region | It changes every second. Announcing it makes the page unusable with a screen reader. Announce *state changes* — "connection lost", "reconnected" — via a separate polite region. |
| When data goes stale, mark it; do not hide it | Stale-and-labelled is strictly more useful than absent. This is the same rule as §13's "keep any data you already had". |

```html
<div class="mob-column-header">
  <span class="mob-column-header__title">Open positions</span>
  <span class="mob-column-header__chip"><span class="mob-chip">1 ladders · 1 rungs</span></span>
  <span class="mob-column-header__spacer"></span>

  <!-- fresh -->
  <span class="mob-column-header__meta" data-mob-freshness="fresh">updated 3s ago</span>

  <!-- stale -->
  <span class="mob-column-header__meta mob-tone-muted" data-mob-freshness="stale">updated 45s ago</span>

  <!-- disconnected -->
  <span class="mob-column-header__meta mob-tone-warning" data-mob-freshness="lost">
    updated 4m ago
    <button class="mob-btn mob-btn--ghost mob-btn--sm">Retry</button>
  </span>

  <span class="mob-column-header__actions">
    <button class="mob-btn mob-btn--primary">New position</button>
  </span>
</div>
<p class="mob-sr-only" aria-live="polite" id="conn-status"></p>
```

`data-mob-freshness` and `data-mob-changed` are **application state, not system API** — nothing
in `css/` selects on them. They are here because polling is a product concern the system does
not own; the two rules below are the only CSS in this document you are expected to write
yourself, and both are built entirely from system tokens.

```css
/* A value that just changed. One property, one duration, nothing geometric. */
@keyframes mob-tick { from { color: var(--mob-accent-bright); } to { color: inherit; } }
[data-mob-changed] { animation: mob-tick var(--mob-duration-normal) var(--mob-ease-standard); }
```

---

## Pattern checklist

Before signing off any composition:

- [ ] One primary action per header, per section, per screen region.
- [ ] Every data surface has a designed empty, loading and error state, in the same box.
- [ ] Every flex container that holds shrinkable content has `min-width: 0` on the item.
- [ ] Hairlines between fused segments are gaps over `--mob-bg-frame`; hairlines *inside* a
      surface are `--mob-border-subtle`. They are not interchangeable.
- [ ] No reference value is the largest number in its card.
- [ ] Nothing shifts layout on hover; nothing scales beyond `--mob-press-scale`.
- [ ] Colour is never the only carrier of a status — sign, word or icon accompanies it.
- [ ] Density zone is declared on a wrapper, not hand-tuned per element.
- [ ] Every value in the CSS is a token. A literal hex in a pattern is the same bug it is in
      a component.
