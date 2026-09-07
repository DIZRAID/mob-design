# 04 — Templates

A template is a page with its decisions already made. It fixes the density zone, the
container width, the order of regions, and — most importantly — **where the primary action
lives**, so that eight different people building eight different screens do not each invent
a different answer.

Templates are not layouts to fill in blindly. They are the default you deviate from
deliberately, in writing, when the content genuinely demands it.

### How to read these

Each template gives:

- an **ASCII wireframe** of the regions,
- the **density zone** (`data-mob-density`), which is the single declaration that sets
  section rhythm, stack gap, grid gap and card padding,
- the **patterns and components** it composes (see `03-patterns.md`, `02-components.md`),
- the **decisions already made** — container width, what is sticky, what is capped,
- **where the primary action lives**, and
- how it **collapses** below `--mob-bp-lg` / `--mob-bp-md`.

### Density zones, in one table

| Zone | `--mob-section-gap` | `--mob-stack-gap` | `--mob-grid-gap` | Card padding | Where |
|---|---|---|---|---|---|
| `marketing` | 128px | 24px | 32px | 24 / 24 | Landing, hero, docs home, empty states |
| `product` | 64px | 14px | 20px | 15 / 16 [src] | App surfaces, detail, settings, forms |
| `data` | 32px | 8px | 12px | 10 / 12 | Tables, activity feeds, dense grids |

Control geometry, radius and colour never move between zones. A medium button is 34px tall
on the landing page and 34px tall in a table. Only rhythm moves — that is what keeps a
marketing page and a dashboard recognisably the same product.

---

## 1. Landing page

```
┌ .mob-page > .mob-shell mob-shell--content mob-shell--stack · marketing ────┐
│ ┌ nav ───────────────────────────────────────────────────────────────────┐ │
│ │ [logo]   Product   Docs   Pricing        [ghost: Sign in] [PRIMARY]    │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│   ┌ HERO ──────────────────────────────────────────────────────────────┐   │
│   │ eyebrow  .mob-label                                                │   │
│   │ HEADLINE .mob-display-lg              ≤ 20ch                       │   │
│   │ support  .mob-body-lg                 ≤ 68ch                       │   │
│   │ [ PRIMARY L ]  [ ghost L ]            ← the page's primary action  │   │
│   │ ┌ product visual — radius-3xl, left edge = headline left edge ──┐  │   │
│   │ └───────────────────────────────────────────────────────────────┘  │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                 ↕ 128px                                    │
│   PROOF STRIP    4 × data panel  ·  label / .mob-figure-lg / .mob-meta     │
│                                 ↕ 128px                                    │
│   FEATURE 1      text left  · visual right     section rhythm §4           │
│   FEATURE 2      visual left · text right                                  │
│   FEATURE 3      full-width visual                                         │
│                                 ↕ 128px                                    │
│   SECONDARY      one deeper capability, one visual, one ghost link         │
│                                 ↕ 128px                                    │
│   CTA            heading + the SAME primary action, second and last time   │
│   ┌ footer ──── mono .mob-meta, 3–4 columns, hairline above ────────────┐  │
│   └────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `marketing` on `.mob-page`. The proof strip's individual panels may drop to
`product` internally so their padding stays tight — a data panel with 24px padding stops
looking like the product's data panel.

**Patterns / components** Nav bar · Hero (§5) · Data panel (§6) · Section rhythm (§4) ·
Button L primary + ghost · Footer.

**Decisions made**

- Container is `--mob-container-content` (1280px), not the 1460px app container. Marketing
  copy at 1460px runs too wide to read.
- The hero visual is a real product screenshot on `--mob-bg-surface` with a
  `--mob-border-default` hairline and `--mob-radius-3xl`. No drop shadow, no perspective,
  no floating browser chrome.
- Feature sections alternate text/visual sides. Three is the ceiling; a fourth is a
  different page.
- The footer is entirely mono at `.mob-meta` — it is metadata, and treating it as such stops
  it competing with the closing CTA directly above it.

**Primary action** In the hero, immediately below the support line, and **once more** in the
closing CTA. Two instances of *the same* action, never two different ones. The nav's
right-hand button is the same action at `sm`, or a quieter "Sign in" — it is not a third CTA.

**Collapses** Below `--mob-bp-lg`: features stack, visual always below text. Below
`--mob-bp-md`: nav becomes a drawer, hero actions go full-width and stack, `--mob-section-gap`
drops to 80px automatically (already handled in `tokens.css`).

---

## 2. Product / app dashboard

The handoff's own page, generalised: a summary rail beside a working area.

```
┌ .mob-page  ·  data-mob-density="product" ─────────────────────────────────┐
│ ┌ global nav (optional, sticky) ─────────────────────────────────────────┐ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│ ┌ .mob-shell  ·  container-app 1460 ────────────────────────────────────┐  │
│ │ ┌ .mob-rail 288px ─────┐ ┌ .mob-main flex:1 1 0  min-inline-size:0 ─┐ │  │
│ │ │ .mob-column-header   │ │ .mob-column-header                  34px │ │  │
│ │ │ Title  [chip]   34px │ │ Title [chip] ──spacer── meta [PRIMARY]   │ │  │
│ │ ├──────────────────────┤ ├──────────────────────────────────────────┤ │  │
│ │ │ DATA PANEL           │ │ ┌ fused segment row ───────────────────┐ │ │  │
│ │ │  label               │ │ │ ident │ viz │ metrics │ actions      │ │ │  │
│ │ │  .mob-figure-xl      │ │ └──────────────────────────────────────┘ │ │  │
│ │ │  composition bar     │ │ ┌ fused segment row ───────────────────┐ │ │  │
│ │ │  legend rows         │ │ └──────────────────────────────────────┘ │ │  │
│ │ ├──────────────────────┤ │ ┌ fused segment row ───────────────────┐ │ │  │
│ │ │ DATA PANEL + spark   │ │ └──────────────────────────────────────┘ │ │  │
│ │ ├──────────────────────┤ │                                          │ │  │
│ │ │ [mini]    [mini]     │ │  (empty / loading / error occupy this    │ │  │
│ │ └──────────────────────┘ │   same box — §13)                        │ │  │
│ │                          └──────────────────────────────────────────┘ │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `product` on `.mob-page`. Wrap the row list in `data-mob-density="data"` if the
product routinely shows more than ~15 rows — it tightens the stack from 14px to 8px without
touching the rows themselves.

**Patterns / components** Rail + main with header baseline (§2) · Page header (§3) ·
Data panel (§6) · Composition breakdown (§9) · Fused segment row (§7) · Metric pair (§8) ·
Empty/loading/error (§13) · Polling & freshness (§14) · Optimistic action with undo (§12).

**Decisions made**

- `--mob-container-app` (1460px). The rail is `--mob-rail-width` (288px) and never grows.
- Both column headers are `--mob-header-row-h` (34px) and the first card in each starts
  `--mob-column-header-gap` (11px) below — see §2 for the calc that keeps this true when the card
  gap changes.
- `min-width: 0` on the main column. Non-negotiable; without it the segment rows overflow.
- Freshness (`updated Ns ago`) sits in the main column header, left of the primary action.
- The rail is a *summary*: three or four panels maximum. A rail that scrolls independently
  of the main column is a sign the page needs a detail view instead.

**Primary action** Right end of the **main column header**, at `md` (34px — the same height
as the header row, so it defines the row without extra math). Row-level actions live in each
row's last segment and are never promoted to the header. The rail has no primary action.

**Collapses** Below `--mob-bp-lg` the split becomes a stack, rail first (it is first in the
DOM, so no `order` is needed and keyboard order stays correct). Segment rows wrap on their
own via `flex-wrap` and the 1px `row-gap` draws the horizontal hairlines for free.

---

## 3. Entity detail page

```
┌ .mob-page > .mob-shell mob-shell--stack  ·  data-mob-density="product" ───┐
│  ← Back to positions            .mob-meta, one line, above everything      │
│                                                                            │
│ ┌ ENTITY HEADER ────────────────────────────────────────────────────────┐  │
│ │ [avatars]  NUDES / USDG          .mob-heading-md                      │  │
│ │            V4 · 0.90% · 1 rungs  .mob-meta-sm                         │  │
│ │  [status chip]   ──── spacer ────   meta   [ghost] [PRIMARY]          │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌ METRIC STRIP  —  the numbers the entity is judged by ─────────────────┐  │
│ │  [panel: FEES]   [panel: PNL]   [panel: VALUE]   [panel: APR]         │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌ VISUALISATION  —  range / chart / timeline, full width ───────────────┐  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  [ Overview ] [ Activity ] [ Settings ]      .mob-tab, underline variant   │
│  ─────────────────────────────────────────────────────────────────────     │
│ ┌ TAB CONTENT  ·  data-mob-density="data" for activity/history ─────────┐  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌ DANGER ZONE  —  last, destroy tone, separated by --mob-section-gap ───┐  │
│ └───────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `product`. Activity and history tabs switch to `data`.

**Patterns / components** Page header (§3) with an entity identity block · Data panel (§6)
×4 as a strip · Bin meter / chart (§7) · Tabs · Table or activity list · Confirmation flow
(§11) for the danger zone.

**Decisions made**

- The back link is text, not a breadcrumb — a two-level hierarchy does not earn a
  breadcrumb (`mobb` spec §4.16).
- The entity header reuses the **identity segment** of the list row it came from: the same
  avatars, the same name, the same meta line. Arriving from a list should feel like the row
  expanded, not like a different object.
- The metric strip is a grid of `--mob-grid-gap` (20px) with `repeat(auto-fit, minmax(180px, 1fr))`.
  Same panels, same padding, same figure classes as the dashboard rail.
- Underline tabs, one variant, product-wide. Tabs are navigation and must not look like CTAs.
- The danger zone is the last block, uses the destroy tone, and is separated by a full
  `--mob-section-gap` — distance is the affordance.

**Primary action** Right end of the **entity header**, on the same row as the title. This is
the action the page exists to enable (Add liquidity, Deploy, Publish, Invite). Destructive
actions are not here — they are in the danger zone at the bottom, behind a confirm (§11).

**Collapses** Below `--mob-bp-md`: header actions move to their own full-width row beneath
the title; the metric strip becomes 2×2; tabs scroll horizontally with the active tab
scrolled into view.

---

## 4. Settings page

```
┌ .mob-page  ·  data-mob-density="product" ─────────────────────────────────┐
│  Settings                                        .mob-heading-md           │
│                                                                            │
│ ┌ .mob-shell  ·  container-app ─────────────────────────────────────────┐  │
│ │ ┌ rail 288px ──────────┐ ┌ main  max-width 720px ──────────────────┐  │  │
│ │ │ ▸ Account            │ │ ┌ GROUP ─────────────────────────────┐  │  │  │
│ │ │   Notifications      │ │ │ .mob-title   Account               │  │  │  │
│ │ │   Security           │ │ │ .mob-body-sm one line of context   │  │  │  │
│ │ │   Billing            │ │ ├────────────────────────────────────┤  │  │  │
│ │ │   API keys           │ │ │ label / field / helper             │  │  │  │
│ │ │                      │ │ │ ───── hairline: border-subtle ──── │  │  │  │
│ │ │  (sticky, active row │ │ │ label / field / helper             │  │  │  │
│ │ │   = bg-selected)     │ │ ├────────────────────────────────────┤  │  │  │
│ │ │                      │ │ │              [ghost] [Save]  ← per │  │  │  │
│ │ │                      │ │ └────────────────────────────────────┘  │  │  │
│ │ │                      │ │ ┌ GROUP ─────────────────────────────┐  │  │  │
│ │ │                      │ │ └────────────────────────────────────┘  │  │  │
│ │ │                      │ │             ↕ --mob-section-gap          │  │  │
│ │ │                      │ │ ┌ DANGER ZONE  destroy border ───────┐  │  │  │
│ │ │                      │ │ │ Delete workspace   [Delete] destroy│  │  │  │
│ │ │                      │ │ └────────────────────────────────────┘  │  │  │
│ │ └──────────────────────┘ └─────────────────────────────────────────┘  │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `product`.

**Patterns / components** Rail + main (§2), with the rail as section navigation ·
Card · Field / select / toggle · Confirmation flow (§11) · Toast (§12) for save results.

**Decisions made**

- The main column is capped at **720px** [drv] even though the shell is 1460px. A settings
  row is a label, a control and a helper line; at 1100px the label and the control end up on
  opposite sides of the screen and the pairing breaks.
- Settings are grouped into cards. Rows inside a card are separated by `--mob-border-subtle`
  (a divider *inside* one surface); cards are separated by `--mob-stack-gap`.
- Rail rows are muted when inactive, `--mob-bg-selected` when active. Not filled pills
  (`mobb` spec §4.15).
- **Save model is a per-page decision, made once:** either every group has its own Save
  (shown only once that group is dirty), or the whole page autosaves and each row reports
  inline. Never both on one page — a user who has learned one model will not look for the
  other.
- Toggles are for state, never for an action that executes immediately and cannot be undone
  (`mobb` spec §4.10). Those are buttons with a confirm.
- The danger zone is a card with `--mob-destroy-border` and `--mob-destroy-bg`, last on the
  page, after a full `--mob-section-gap`.

**Primary action** There is **no page-level primary action**. Each group owns its own Save,
right-aligned in that group's footer. A single floating "Save all" for a page of unrelated
settings makes it impossible to know what you just changed.

**Collapses** Below `--mob-bp-lg` the rail becomes a horizontal scrolling tab strip above the
content. Group footers stay right-aligned; buttons go full-width below `--mob-bp-sm`.

---

## 5. List / table page with filters

```
┌ .mob-page > .mob-shell mob-shell--stack  ·  data-mob-density="data" ──────┐
│ ┌ PAGE HEADER ──────────────────────────────────────────────────────────┐  │
│ │ Positions  [chip: 48]  ──spacer──  updated 3s ago  [ghost] [PRIMARY]  │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│ ┌ TOOLBAR  (sticky: z-sticky, bg-canvas, border-subtle bottom) ─────────┐  │
│ │ [ search field 40px ]  [chip All][chip In range][chip Out]            │  │
│ │                        ──spacer──   12 of 48   [ Columns ] [ Export ] │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│ ┌ TABLE ────────────────────────────────────────────────────────────────┐  │
│ │ NAME            RANGE          FEES↑        PNL       VALUE      ···  │  │  ← .mob-label
│ │ ───────────────────────────────────────────────────────────────────── │  │
│ │ NUDES / USDG    ▮▮▮▮▮▯      $0.2194     +$0.2195     $31.12     ⋯  │  │
│ │ ───────────────────────────────────────────────────────────────────── │  │
│ │ ETH / USDG      ▮▮▯▯▯▯      $12.40      −$3.02      $980.00    ⋯  │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                        [ Load more ]   ·   or cursor pagination            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `data` on the list region; `product` on the page header above it.

**Patterns / components** Page header (§3) · Toolbar + filter bar + search (§10) · Table or
fused segment rows (§7) · Empty/loading/error (§13) · Polling & freshness (§14).

**Decisions made**

- Numeric columns are right-aligned and mono with `tabular-nums` (already the `body`
  default). Text columns are left-aligned. Nothing is centred.
- Row separators are `--mob-border-subtle` horizontals only. **No vertical rules** — they
  produce the grid-heavy enterprise look this system explicitly avoids.
- Hover paints the row `--mob-bg-hover` and may reveal a trailing action cell. Selection is
  `--mob-bg-selected` and **must remain visible without hover** — hover-only selection is
  invisible to keyboard and touch.
- Filters and sort are reflected in the URL, so a filtered view is shareable.
- Responsive fallback is **horizontal scroll**, not stacked cards — unless the row genuinely
  survives conversion, in which case use the fused segment row (§7), which wraps natively.
  Choose one and apply it to every table in the product.
- Pagination: "Load more" preserves scroll and works with a polled list; numbered pages do
  not. Pick per product, not per page.

**Primary action** Right end of the **page header** (create / import / new). The toolbar's
right side holds *view* controls — columns, export, density — which are secondary by
definition. Bulk destructive actions appear in the toolbar **only when a selection exists**,
in the destroy tone.

**Collapses** Below `--mob-bp-md`: the toolbar wraps to two rows (search full-width on top,
chips below) and stays sticky. The table scrolls horizontally with the first column pinned,
or converts to segment rows.

---

## 6. Form / create flow

```
┌ .mob-page > .mob-shell mob-shell--stack  ·  product  ·  column 520px ─────┐
│  ← Cancel                                            .mob-meta            │
│                                                                            │
│  New position                                       .mob-heading-md        │
│  One line of context.                               .mob-body-sm          │
│                                                                            │
│  ●───────○───────○     Token · Range · Amount       step indicator, mono   │
│                                                                            │
│ ┌ CARD ─────────────────────────────────────────────────────────────────┐  │
│ │  Label                              .mob-control-label                │  │
│ │  [ field 40px ]                     --mob-field-h                     │  │
│ │  Helper text                        .mob-meta  (or error, negative)   │  │
│ │                                                                       │  │
│ │  Label                                                                │  │
│ │  [ field ]                          [ chip ][ chip ][ chip ]  presets │  │
│ │  Helper text                                                          │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│ ┌ SUMMARY  (bg-sunken, the consequence restated) ───────────────────────┐  │
│ │  You will deposit $250.00 · fee 0.90% · est. APR 12.4%                │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ─────────────────────────────────────────────────────────────────────     │
│  [ Back ghost ]                              ──spacer──   [ PRIMARY L ]    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `product`.

**Patterns / components** Section rhythm (§4) · Field / select / textarea · Chip presets ·
Card · Optimistic action or confirm (§11–12) on submit · Inline error (§13).

**Decisions made**

- The form column is **`--mob-modal-w` (520px)** — deliberately the same width as a dialog,
  so the identical form works inline on its own page or inside a modal with no relayout and
  no second set of styles.
- Labels are persistent and above the field. A placeholder is not a label (`mobb` spec §4.4):
  it disappears exactly when the user needs it, during input.
- Helper text and error text occupy the **same slot**, so an error does not push the rest of
  the form down. The slot is reserved even when empty.
- Validation is on blur, not on keystroke. Re-validating on keystroke turns a half-typed
  email into an error message and trains people to ignore errors.
- The summary block sits on `--mob-bg-sunken` and restates the consequence in words and real
  numbers — the same job the confirm dialog body does in §11, done inline so no dialog is
  needed for a non-destructive create.
- Multi-step: the step indicator is mono and shows names, not just dots. Steps are
  navigable backwards without losing entered data.

**Primary action** Bottom-right of the form, at `lg` (40px). It is the **only** primary on
the page, and its label is the verb of the outcome ("Open position", "Create key"), never
"Submit". Back / Cancel is ghost, bottom-left. On submit the button enters the busy state at
its current width (§12) — the form does not disappear until the server confirms.

**Collapses** Below `--mob-bp-sm` the footer actions go full-width and stack, primary on top.
The footer may become sticky at the viewport bottom for long forms — with an opaque
`--mob-bg-canvas` background and a `--mob-border-subtle` top hairline, same rules as a
sticky toolbar.

---

## 7. Auth screen

```
┌ .mob-page  ·  grid place-items:center  ·  min-block-size 100dvh ──────────┐
│                                                                            │
│                        [logo mark]           24px, centred                 │
│                                                                            │
│              ┌ CARD  380px  data-mob-density="product" ──────┐             │
│              │  Sign in                    .mob-heading-sm   │             │
│              │  One line of context.       .mob-body-sm      │             │
│              │                                               │             │
│              │  Email                      .mob-control-label│             │
│              │  [ field 40px ]                               │             │
│              │                                               │             │
│              │  Password          Forgot?  ← link, same row  │             │
│              │  [ field 40px ]                               │             │
│              │                                               │             │
│              │  [ PRIMARY L — full width ]                   │             │
│              │  ───────────  or  ───────────                 │             │
│              │  [ ghost L — Continue with SSO ]              │             │
│              └───────────────────────────────────────────────┘             │
│                                                                            │
│               New here? Create an account       .mob-meta, centred         │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `product` on the card. The page itself is empty space — no marketing copy, no
feature list, no testimonial column. An auth screen has one job.

**Patterns / components** Card · Field · Button L primary + ghost · Inline error (§13) ·
Text link.

**Decisions made**

- Card width **380px** [drv]. This is off the token set; if the product has more than one
  centred single-purpose card (auth, onboarding, checkout), tokenise it rather than typing
  380 in three files.
- Actions are **full-width inside the card**. This is the one place a stretched button is
  correct: there is nothing beside it to align to, and the card edge is the alignment.
- Errors are inline, above the primary action, in `--mob-negative` — never a toast. A toast
  can be missed, and a missed auth error looks like a broken button.
- The "or" divider is a `--mob-border-subtle` hairline with centred `.mob-meta` text. One
  divider maximum.
- No social-auth wall of six buttons. One or two, ghost, below the primary.
- Never disable the submit button because the form is incomplete — submit and show the error.
  A disabled button with no explanation is a dead end.

**Primary action** Full width inside the card, directly below the last field. This is the
only template where the primary action is not right-aligned, and the reason is that the card
*is* the alignment context.

**Collapses** Below `--mob-bp-sm` the card loses its border and becomes the page: full
width, `--mob-gutter-mobile` padding, no radius. A 380px card with 16px of margin on a phone
is worse than no card.

---

## 8. Documentation / content page

```
┌ .mob-page > .mob-shell mob-shell--stack  ·  data-mob-density="product" ───┐
│ ┌ nav ───────────────────────────────────────────────────────────────────┐ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│ ┌ 288px ────────┐ ┌ prose  68ch  min-width:0 ──────┐ ┌ 200px ────────────┐ │
│ │ SIDEBAR       │ │  eyebrow    .mob-label         │ │ ON THIS PAGE      │ │
│ │  Getting      │ │  H1         .mob-heading-lg    │ │  .mob-label       │ │
│ │   started     │ │  lede       .mob-body-lg       │ │  ─────────────    │ │
│ │  ▸ Install    │ │                                │ │  · Install        │ │
│ │    Tokens     │ │  H2         .mob-heading-md    │ │  · Tokens         │ │
│ │    Patterns   │ │  body       .mob-body          │ │  · Patterns       │ │
│ │               │ │  ┌ code block  mono, sunken ─┐ │ │                   │ │
│ │  Components   │ │  └───────────────────────────┘ │ │  (sticky)         │ │
│ │    Button     │ │  ┌ table  data density ──────┐ │ │                   │ │
│ │    Card       │ │  └───────────────────────────┘ │ │                   │ │
│ │               │ │  H2                            │ │                   │ │
│ │  (sticky)     │ │  body                          │ │                   │ │
│ └───────────────┘ └────────────────────────────────┘ └───────────────────┘ │
│                    ──── Previous  |  Next ────                             │
└────────────────────────────────────────────────────────────────────────────┘
```

**Density** `product`. Docs are read continuously, not scanned like a landing page — 128px
between sections turns one page into five screens of scrolling. Heading rhythm comes from
margins instead: `h2` gets `margin-top: var(--mob-space-48)`, `h3` gets
`var(--mob-space-32)` [drv].

**Patterns / components** Rail + main (§2) extended to three columns · Section rhythm (§4) ·
Table · Code block · Text link · Tabs (for language/framework switching).

**Decisions made**

- The prose column is capped at `--mob-container-prose` (68ch). This is the one place the
  cap is on characters rather than pixels, because the constraint is reading, not layout.
- Body copy is **sans** (`.mob-body`, 13px / 1.6), not mono. The dual-family rule: mono is
  for numbers, labels and metadata; paragraphs at length are sans. A page of mono prose is
  the single fastest way to make documentation unreadable.
- Code blocks are mono on `--mob-bg-sunken` with `--mob-radius-lg` and `overflow-x: auto`.
  Inline code gets `--mob-bg-tile` and `--mob-radius-xs`, no border — a bordered inline span
  breaks the line rhythm.
- Tables inside docs switch to `data-mob-density="data"`.
- The right-hand "on this page" rail is 200px [drv] and is **removed** below `--mob-bp-xl`
  rather than squeezed. A 120px ToC is worse than none.
- Both rails are `position: sticky; top: var(--mob-space-24)` with their own
  `overflow-y: auto`.

**Primary action** Docs have no primary action in the CTA sense. The functional primary is
**search**, top of the sidebar, with a `⌘K` hint. Previous/Next links at the foot of the
prose column are the secondary navigation, and they are links, not buttons.

**Collapses** Below `--mob-bp-xl`: the ToC rail is dropped. Below `--mob-bp-lg`: the sidebar
becomes a drawer behind a menu button, and the prose column takes the full width, still
capped at 68ch and centred.

---

## Choosing a template

| The page is… | Template | Density | Primary action lives |
|---|---|---|---|
| Selling the product | Landing | `marketing` | Hero, repeated once at the closing CTA |
| The app's home | Dashboard | `product` (+ `data` for the list) | Main column header, right |
| One object in depth | Entity detail | `product` | Entity header, right, same row as the title |
| Configuration | Settings | `product` | None — per-group Save |
| Many objects, filtered | List / table | `data` | Page header, right |
| Creating one object | Form / create | `product` | Form footer, right, `lg` |
| Getting in | Auth | `product` | Full width inside the card |
| Explaining | Docs / content | `product` | None — search is the functional primary |

If a page you are building does not fit any of these, that is worth saying out loud before
building it. Usually it is two templates stapled together and should be two pages. Sometimes
it is a genuinely new template, in which case it belongs in this file — with its density
zone, its container width, and its answer to *where does the primary action live*.
