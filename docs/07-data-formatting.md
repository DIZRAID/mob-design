# 07 — Data formatting

This system was calibrated on a surface where almost every glyph is a number. Formatting is
therefore not an appendix to the design — it is the part of the design the user actually reads.
A column of numbers that jitters, rounds inconsistently, or renders "unknown" the same way it
renders "zero" is a broken component, no matter how correct its padding is.

Everything below is a worked visual policy, not a command to replace an existing product's
domain precision, locale, rounding or arbitrary-precision math. If the host already has those
contracts, preserve them and map their output to the visual roles here. For a new product, choose
one policy, implement it **once** in one module (§13), and import it everywhere; formatting at
individual call sites will drift.

---

## 1. Tabular numerals

`roles.css` sets `font-variant-numeric: tabular-nums` on the numeric roles; `base.css` also sets
it on `body`, so the full bundle inherits it everywhere by default. `.mob-nums` re-asserts it
for anything outside a role (a canvas label, an SVG `<text>`, a third-party widget, or an element
that overrode `font-variant-numeric`).

**The rule:** any number that can ever appear directly above, below, or beside another number of
the same kind is set in tabular figures. In practice this is every number in a table, a list, a
repeated card, or a value that updates in place.

**Why:** proportional digits have different advance widths (`1` is narrow, `0` is wide). In a
column, the decimal point moves left and right per row, so the eye can no longer compare
magnitudes by glyph position — it has to read each number. Scanning collapses into reading.
The second cost is motion: a polled value that changes from `1.11` to `8,040.87` reflows its
neighbours. Tabular figures make an updating number silent.

| Context | Family | Type role | Notes |
|---|---|---|---|
| Any number up to and including 16px | mono | `.mob-value`, `.mob-value-sm`, `.mob-meta` | The default. Never sans. |
| Hero figure, 22px and up | sans 600 / `-0.02em` | `.mob-figure-md` / `-lg` / `-xl` | `$8,040.87` at 27px, `+$616.35` at 23px, `$0.2194` at 22px — all `[src]` |
| Metric at exactly 16px | mono | `.mob-figure-sm` | The largest mono figure, and the last one before the crossover `[src]` |
| Micro-label above a value | mono, uppercase | `.mob-label` | 9.5px / `--mob-tracking-label` |

The figure roles set `tabular-nums` in `roles.css`. Verify it survives your font stack:
some system faces expose tabular figures only under `font-feature-settings: 'tnum'`, and a
webfont subset may drop the feature entirely. If a hero figure ever visibly shifts width while
counting, that is the cause.

---

## 2. One compact convention per product `[drv from spec]`

Pick a single convention and apply it product-wide. The convention itself matters less than the
fact that there is only one.

```text
full      $1,248.52       $8,040.87       $31.12
compact   $24.8K          $3.21M          $1.04B
```

| Rule | Why |
|---|---|
| Compact starts at 1,000,000 by default. Below that, render in full. | `1.2K` destroys `$1,248.52` — a difference a user acts on. Millions are already beyond the precision anyone reads off a screen. |
| Compact carries 3 significant digits: `$24.8K`, `$3.21M`. | Fixed decimals across magnitudes give `$3.2M` next to `$248.5K` — inconsistent information density. Significant digits keep it constant. |
| Compact is a property of the **column**, not the cell. | A column mixing `$24.8K` and `$1,248.52` cannot be compared at a glance; the reader has to decode each unit suffix. Choose one per column, driven by the largest value the column can hold. |
| A compacted value always keeps its exact value reachable — `title`, tooltip, or a detail view. | Compact is lossy by design. Losing the original is not. |
| Compaction **rounds**; a spendable balance **truncates toward zero**. | If the UI offers "Max" against a rounded-up balance, the transaction fails. Round for reading, truncate for acting. |
| The magnitude suffix is part of the number: no space, same colour, same size. | `24.8 K` reads as a number and a unit. It is one token. |

---

## 3. Precision by magnitude

Display precision is a function of the **value**, not of the field. A total and a unit price do
not get the same decimal count, because at $8,040 the cents are noise and at $0.0099 the fourth
decimal is the entire signal.

| Magnitude | Decimals | Worked example |
|---|---|---|
| ≥ 1 | 2 | `$8,040.87`, `$31.12`, `$2.80` `[src]` |
| 0.1 – 1 | 4 | `$0.2194` `[src]` |
| 0.01 – 0.1 | 5 | `$0.01450` `[src]` |
| 0.001 – 0.01 | 6 | `$0.009909` `[src]` |
| < 0.001 | 4 significant digits, or a floor (`< $0.001`) | `[drv]` |

The single rule that produces all of the above: **2 decimals at and above 1; below 1, keep 4
significant digits.** Every measured value in the handoff falls out of it — that is the evidence
the rule is the real one and not a reconstruction (see `decimalsFor()` in §13).

Two further rules:

- **Fixed precision within a column, when the column shares a unit and a scale.** A column of USD
  totals uses 2 decimals in every row, trailing zeros kept, so the decimal points align.
- **Per-row precision, when a column holds prices of different things.** A price column spanning
  `$8,040.87` and `$0.009909` uses the magnitude rule per row. Right-alignment still holds the
  column together; the decimal points will not align, and that is correct — the values are not
  comparable in the first place.
- **Never display more precision than the source carries.** Padding a 2-decimal API value out to
  6 decimals invents certainty.

---

## 4. Sign and tone always agree

A signed value carries **both** a sign glyph and a tone. Never one without the other.

```html
<span class="mob-value mob-nums mob-nowrap" data-mob-sign="positive">+$0.2195</span>
<span class="mob-meta  mob-nums"           data-mob-sign="positive">+0.67%</span>
```

`roles.css` binds the attribute to colour (`base.css` imports it), so a component never branches
on sign in two places:

```css
[data-mob-sign='positive'] { color: var(--mob-positive); }
[data-mob-sign='negative'] { color: var(--mob-negative); }
[data-mob-sign='neutral']  { color: var(--mob-fg-secondary); }
```

| Rule | Why |
|---|---|
| Positive values show `+` explicitly. | Without it, the reader can't tell "a gain of 0.67%" from "a value of 0.67%". |
| Negative uses U+2212 MINUS SIGN `−`, not the ASCII hyphen. | The hyphen is a narrow, non-figure glyph; it breaks the tabular grid and reads as a dash. Set it once in the formatter. |
| The sign precedes the currency symbol: `+$0.2195` `[src]`, never `$+0.2195`. | It signs the whole quantity, not the currency. |
| Tone is never the only signal. | Roughly 1 in 12 readers cannot separate the green from the red. The sign glyph is what makes it accessible; colour is the accelerator. |
| The tone extends to the value's sub-line. | The handoff colours `+0.67%` green under `+$0.2195` `[src]`. A cluster that describes one quantity carries one tone. |
| Zero takes `neutral` tone and no sign: `$0.00`, `0.00%`. | A zero delta is not a small gain. |

**Sign tone is not status tone.** In the handoff, `LOOSE $2.80` is rendered in `--mob-negative`
while its sub-line "5 tokens" stays `--mob-fg-label` `[src]`. That red is a *status* — "this is
sitting idle, deal with it" — not a sign. When tone means status rather than direction, colour
only the value, leave `data-mob-sign` off, and make sure a non-colour signal (a label, an icon, a
position in a "needs attention" group) carries the same meaning.

---

## 5. Percentages and basis points

| Kind | Sign | Decimals | Example |
|---|---|---|---|
| Delta / return | always | 2 | `+0.67%` `[src]`, `−1.36%` |
| Share of a total | never | 1 | `59.7%`, `39.9%`, `0.4%` `[src]` |
| Rate / fee (from a fixed set) | never | 2, trailing zero kept | `0.90%` `[src]` |
| Basis points | always | 0 | `+18 bps` |

- A **share** is not a delta: it takes no sign, and it takes the tone of the thing it describes —
  in the handoff each share is coloured with its series token (`--mob-series-1`, `-2`, `-3`)
  `[src]`, not with positive/negative.
- A **rate** keeps its trailing zero (`0.90%`, not `0.9%`) because it comes from a fixed tier
  list and the reader is matching it against that list, not measuring it.
- **Below the floor, say so.** A delta under 0.01% renders `<0.01%`, not `0.00%`. `0.00%` claims
  "no change"; `<0.01%` says "changed, too small to show". They are different facts.
- **Basis points** when the interesting deltas are consistently under 1% and users compare them
  (1 bp = 0.01%). Never mix `%` and `bps` in one column or one sentence — the reader will assume
  a 100× error somewhere and stop trusting the screen.

---

## 6. Currency and locale

| Rule | Detail |
|---|---|
| Symbol when the view has one currency; code when it has more than one. | `$3,206.85` in a single-currency dashboard `[src]`; `1,248.52 USD` / `1,248.52 EUR` when they sit in one column. |
| Never repeat a unit the row or column header already states. | The handoff shows `3,206.85` bare as a token quantity because the row is named USDG, and `$3,206.85` for its value `[src]`. |
| Format with `Intl.NumberFormat`. Never assemble separators by hand. | Grouping, separator characters and symbol position are locale data, and hand-rolled string surgery gets them wrong in every locale but one. |
| Locale supplies separators; the **product** supplies precision. | `decimalsFor()` is a product policy. Do not let a locale's default currency fraction digits silently re-round your values. |
| Approximate or converted values are marked `≈` and set one tone step down (`--mob-fg-muted`). | The reader must be able to tell a measured value from a derived one. |
| Identifiers are never localised: no digit grouping in a hash, an ID, a block height, a version. | Grouping implies "quantity". `#1,024` is not an order number. |

---

## 7. Zero, empty, unavailable, failed — four states, four renderings

Collapsing these is the most expensive formatting bug in a data product, because a user acts on
the result. `0` shown for "not loaded yet" is a number someone will trade against.

| State | Means | Rendering | Tone |
|---|---|---|---|
| **Zero** | Known, and it is zero | `$0.00` — full column precision, keep the decimals | `[data-mob-sign='neutral']` → `--mob-fg-secondary` |
| **None / not applicable** | The field cannot hold a value for this row | `—` (em dash), with `<span class="mob-sr-only">not applicable</span>` | `--mob-fg-dim` |
| **Not yet available** | The value exists but has not arrived | Skeleton block on `--mob-bg-tile` `[src]`, sized to the final glyph count | — |
| **Failed** | The fetch errored | `—` plus an inline retry affordance | `--mob-negative` |
| **Hidden** | Privacy toggle is on | `••••` at the width of the value it hides | `--mob-fg-muted` |

Rules:

- **Never a spinner inside a data cell.** It replaces a fixed-width value with a moving one and
  re-lays the row out twice. Skeletons preserve geometry; that is their entire job.
- **Never `N/A`.** It is wider than the column, it reads as a value, and it says nothing the em
  dash does not.
- **A skeleton is sized to the value, not to the cell.** A 4-character skeleton where a
  4-character number will land means the row does not move when data arrives.
- **Failure is never silently zero.** If the number cannot be shown, show that it cannot be shown.

---

## 8. Truncated identifiers

Addresses, transaction hashes, request IDs, long slugs, file digests — anything where both ends
carry information and the middle does not.

```text
7xQp…91Md          4…4, the default
0x4f2a…d19c        6…4 when the head encodes a namespace or prefix
```

| Rule | Why |
|---|---|
| **Middle-truncate machine identifiers; end-truncate human text.** | In an address, both ends are checkable by eye. In a name, only the head carries meaning — use `.mob-truncate` (CSS ellipsis) for that. Two different mechanisms, two different jobs. |
| **Every truncated identifier ships a full-value affordance.** Copy button, `title`, or expand — at least one, no exceptions. | A truncated ID with no route to the original is a dead end: the user cannot paste it, search it, or report it. |
| Copy is the default affordance. A hover tooltip alone is not enough. | Tooltips do not exist on touch. |
| Use U+2026 `…`, not three periods. | Three periods are three tabular glyphs wide and read as "loading". |
| Preserve source case exactly. | Checksummed addresses encode their validity in capitalisation; lowercasing silently invalidates them. |
| Set in mono, no grouping, no letter-spacing change. | It is a machine value; make it look like one. |
| Enough characters to be unique in the visible set. | 4…4 is fine in a list of ten. If two rows truncate to the same string, widen the head for the whole column, not for the colliding row. |

Copy behaviour: confirm **inside** the control — swap the label for ~1.2s (`Copy address` →
`Copied`) — and do not raise a toast. A toast for a copy costs more attention than the copy did.

---

## 9. Time

| Age | Rendering |
|---|---|
| < 60 s | `3s ago` `[src]` |
| < 60 min | `12m ago` |
| < 24 h | `5h ago` |
| < 7 d | `3d ago` |
| ≥ 7 d | `12 Mar` |
| Different calendar year | `12 Mar 2024` |

- **Relative in the cell, absolute in the `title` — always both.** The relative form answers "is
  this fresh?", which is the scanning question. The absolute form answers "which event was this?",
  which is the investigating question. A design that offers only one forces the other question
  into a support ticket.
- **Show both inline** when the reader is reconciling against an external record (an explorer, a
  bank statement, a log): `12 Mar, 14:02 · 3d ago`.
- **Age display and data fetching are separate clocks.** A local timer may refresh “3s ago” from
  the last real timestamp; it must not imply a network refetch or mutate that timestamp. Choose a
  display cadence appropriate to the visible unit and keep the host's fetch policy intact.
- **Reserve the width.** `9s ago` → `12m ago` is a width change; right-align it or give it a
  `min-width` so the header row does not shuffle.
- **Durations**: two units maximum, largest first — `1h 12m`, not `72 minutes` and not
  `1h 12m 04s`.
- **Timezone** is stated whenever the product spans zones. ISO 8601 belongs in exports and APIs,
  never in a cell.

---

## 10. Ranges

| Case | Rendering |
|---|---|
| Both ends carry a symbol | `$0.009909 – $0.01346` (en dash, spaced) |
| Shared trailing unit, stated once | `12–18%` (en dash, unspaced) |
| Open-ended | `≥ $1,000`, `< 0.01%`, `up to 5` |
| Layout is the separator | Endpoints pinned to opposite ends of a visual scale — no dash at all |

The last case is the handoff's own: the min and max of a position's range sit at the two ends of
the bin row with the status between them `[src]`. When a range is already drawn, do not also
punctuate it.

Repeat the currency symbol on both operands (`$4 – $8`) — it prefixes, so dropping it from the
first end reads as a bare number. Drop a repeated suffix unit (`12–18%`, `1.5–2.0 ETH`).

When a table sorts by a range column, sort by the low bound and say so in the header tooltip;
otherwise two readers will infer two different orders.

---

## 11. Units and their placement

| Unit kind | Placement | Space | Example |
|---|---|---|---|
| Currency symbol | prefix | none | `$31.12` `[src]` |
| Currency code | suffix | non-breaking | `1,248.52 USD` |
| Percent | suffix | none | `+0.67%` `[src]` |
| Basis points | suffix | non-breaking | `+18 bps` |
| Asset / physical unit | suffix | non-breaking | `1.57 ETH` `[src]` |
| Compact magnitude | suffix | none — part of the number | `$24.8K` |
| Relative time unit | suffix | none | `3s ago` `[src]` |

Two more rules:

- **A unit is one tone step below its number, and usually one size step smaller.** The handoff
  renders `$31.12` at 12.5px `--mob-fg-secondary` followed by `100% USDG` at 9.5px
  `--mob-fg-dim` `[src]`. The number is the message; the unit is the qualifier.
- **Never break between a number and its unit.** Wrap the pair in `.mob-nowrap`. `1.57` at the end
  of one line and `ETH` at the start of the next is two facts where there was one.

---

## 12. Alignment in tables

| Column holds | Alignment | Why |
|---|---|---|
| Numbers to be compared | right | Puts the ones digit in a vertical line; with tabular figures this is free decimal alignment. |
| Relative timestamps | right | They are read as a magnitude ("how old"), and they sit next to numbers. |
| Text, names, identifiers | left | Read from the head. |
| A single status word or badge | left, or centred only in a fixed-width icon column | Centred text in a variable-width column creates a ragged left edge the eye trips on. |

- **Headers align with their cells.** A left-aligned header over a right-aligned number column
  breaks the vertical line the alignment exists to create.
- **Fixed precision per column gives decimal alignment.** Do not pad with hair spaces or figure
  spaces to fake it — fix the column's precision instead (§3).
- **Reserve width for the longest plausible value.** In a polled table, a column that resizes when
  a value crosses a digit boundary shifts every column to its right. `min-width` on the cell, or
  format to a fixed character count.
- **No vertical rules.** Separate rows with `--mob-border-subtle`, or with nothing at all in
  `[data-mob-density='data']` where the alignment alone carries the structure.
- **Micro-labels align with the value they title.** `.mob-label` above a left-aligned value is
  left-aligned; in a two-ended row (label left, value right) the label stays at the edge it
  belongs to. The handoff does both `[src]`.
- **Sorting never changes alignment.** The indicator lives in the header, inside the header's own
  alignment.

---

## 13. The formatting module

This is a display-layer reference for finite JavaScript numbers, not an arbitrary-precision money
library. Preserve the host's decimal source, locale and established formatters when they carry more
precision than a `number`. Every formatter returns the source numeric string alongside display data.

```js
// mob-format — single source of numeric truth. One policy object per product.
const POLICY = {
  locale:           'en-US',
  currency:         'USD',
  compactFrom:      1_000_000,  // below this, render in full  (§2)
  compactSigDigits: 3,          // $24.8K, $3.21M
  sigDigitsBelow1:  4,          // $0.2194, $0.01450, $0.009909  (§3)
  percentFloor:     0.01,       // under this, render "<0.01%"   (§5)
  moneyFloor:       1e-8,       // do not turn a non-zero value into $0.00000000
  idHead: 4, idTail: 4,         // 7xQp…91Md                     (§8)
  relativeUntilMs:  7 * 864e5,  // then switch to an absolute date (§9)
};

const DASH  = '—';  // em dash — "not applicable"
const MINUS = '−';  // true minus, never '-'
const ELL   = '…';  // ellipsis, never '...'

// §3 — the whole precision policy, in four lines.
// 8040.87 -> 2 | 31.12 -> 2 | 0.2194 -> 4 | 0.01450 -> 5 | 0.009909 -> 6
export function decimalsFor(n) {
  const a = Math.abs(n);
  if (a === 0 || a >= 1) return 2;
  return Math.min(8, POLICY.sigDigitsBelow1 - 1 - Math.floor(Math.log10(a)));
}

// §2 + §3 + §6. `compact` is decided per COLUMN by the caller, never per cell.
export function money(n, { compact = false, currency = POLICY.currency } = {}) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return { display: DASH, exact: null, state: 'none' };
  const d = decimalsFor(n);
  const floor = new Intl.NumberFormat(POLICY.locale, { style: 'currency', currency,
                minimumFractionDigits: 8, maximumFractionDigits: 8 }).format(POLICY.moneyFloor);
  if (n !== 0 && Math.abs(n) < POLICY.moneyFloor) {
    return { display: `${n < 0 ? MINUS : ''}<${floor}`, exact: String(n), state: 'ok' };
  }
  const opts = compact && Math.abs(n) >= POLICY.compactFrom
    ? { notation: 'compact', maximumSignificantDigits: POLICY.compactSigDigits }
    : { minimumFractionDigits: d, maximumFractionDigits: d };
  return {
    display: new Intl.NumberFormat(POLICY.locale, { style: 'currency', currency, ...opts }).format(n),
    exact: String(n),
    state: 'ok',
  };
}

// §5. `sign:false` for shares and rates; they are not deltas.
export function pct(n, { sign = true, decimals = 2 } = {}) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return { display: DASH, exact: null, state: 'none' };
  const a = Math.abs(n);
  if (sign && a > 0 && a < POLICY.percentFloor) return { display: `${glyphFor(n)}<${POLICY.percentFloor}%`, exact: String(n), state: 'ok' };
  const body = (sign ? a : n).toFixed(decimals).replace('-', MINUS) + '%';
  return { display: sign ? glyphFor(n) + body : body, exact: String(n), state: 'ok' };
}

// §4. Sign and tone are produced together so they can never disagree.
export function glyphFor(n) { return n > 0 ? '+' : n < 0 ? MINUS : ''; }
export function toneFor(n)  { return n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral'; }
export function signedMoney(n, options) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return { display: DASH, exact: null, state: 'none', sign: 'neutral' };
  const result = money(Math.abs(n), options);
  return { ...result, display: glyphFor(n) + result.display, exact: String(n), sign: toneFor(n) };
}

// §8. Returns the pair, so the caller cannot render a truncation without the original.
export function ident(s, head = POLICY.idHead, tail = POLICY.idTail) {
  if (!s) return { display: DASH, full: null };
  const short = s.length <= head + tail + 1 ? s : s.slice(0, head) + ELL + s.slice(-tail);
  return { display: short, full: s };  // full -> copy button + title
}

// §9. Both forms, always — the cell shows `rel`, the title shows `abs`.
export function when(ts, now = Date.now()) {
  const stamp = typeof ts === 'number' ? ts : Date.parse(ts);
  const stampDate = new Date(stamp);
  const nowDate = new Date(now);
  if (!Number.isFinite(stamp) || !Number.isFinite(now) ||
      !Number.isFinite(stampDate.getTime()) || !Number.isFinite(nowDate.getTime())) {
    return { rel: DASH, abs: DASH, state: 'none' };
  }
  const d = Math.max(0, now - stamp);
  const abs = new Intl.DateTimeFormat(POLICY.locale, { day: 'numeric', month: 'short',
                year: stampDate.getFullYear() === nowDate.getFullYear() ? undefined : 'numeric',
                hour: '2-digit', minute: '2-digit' }).format(stamp);
  const rel = d >= POLICY.relativeUntilMs ? abs
            : d >= 864e5 ? `${Math.floor(d / 864e5)}d ago`
            : d >= 36e5  ? `${Math.floor(d / 36e5)}h ago`
            : d >= 6e4   ? `${Math.floor(d / 6e4)}m ago`
                         : `${Math.floor(d / 1e3)}s ago`;
  return { rel, abs, state: 'ok' };
}
```

Wiring the output to the system:

```html
<!-- signed value: glyph and tone come from the same call -->
<span class="mob-value mob-nums mob-nowrap"
      data-mob-sign="positive" title="+$0.21953104">+$0.2195</span>

<!-- truncated identifier: display and full value arrive together -->
<button class="mob-control-label" data-copy="7xQpLm4vA7c8N2s9Xr2W91Md" title="Copy address">
  7xQp…91Md
</button>

<!-- relative stamp with the absolute in the title -->
<time class="mob-meta mob-nums" datetime="2026-09-07T14:02:11Z" title="7 Sep, 14:02">3s ago</time>

<!-- not applicable, with the meaning available to a screen reader -->
<span class="mob-nums mob-tone-dim">—<span class="mob-sr-only">not applicable</span></span>
```

---

## 14. Checklist

- [ ] Every number renders in tabular figures — including ones in SVG, canvas and third-party widgets.
- [ ] Numbers up to and including 16px are mono (`.mob-figure-sm` at 16); figures from 22px up are
      sans 600 / `-0.02em`.
- [ ] One compact convention, applied per column, with the exact value reachable.
- [ ] Precision follows magnitude: 2 decimals at ≥ 1, 4 significant digits below 1.
- [ ] Every signed value has both a sign glyph and a `data-mob-sign` tone; `−` is U+2212.
- [ ] Shares and rates carry no sign; deltas always do.
- [ ] Zero, none, loading, failed and hidden each render differently.
- [ ] No spinner and no `N/A` inside a data cell.
- [ ] Every truncated identifier has a copy or expand affordance.
- [ ] Relative timestamps carry the absolute in `title`.
- [ ] Numeric columns are right-aligned, headers match, and widths are reserved against polling.
- [ ] No formatting logic outside the module in §13.
