# mob-design agent contract

`mob-design` is a CSS system for dense product and editorial interfaces. It is not an
application or a behavior library. It defines tokens, classes, states, themes, and compositions;
the host application retains its routes, data, handlers, formatting, and accessible widget behavior.

## Start by understanding the task

When changing this repository, treat `css/*.css` as the source of truth and run `npm run check`
and `npm test`.

When applying the system to an existing application:

1. Find the stack, the global style entry point, and shared UI wrappers.
2. Preserve routes, handlers, requests, authentication, data precision, locale, and headless
   component behavior. Presentation may change; the product contract must remain intact.
3. Choose the integration depth: use `css/mob.css` for a separate application or a deliberate
   global migration; use `tokens.css` with `roles.css` for incremental adoption without the global
   reset and base rules.
4. Convert one shared component and one pilot screen, verify them in a browser, then expand.
5. Before delivery, audit the changed source and run the application's native checks.

See [`docs/agent-workflow.md`](docs/agent-workflow.md) for the complete workflow.

## Find the API instead of guessing

```bash
node mob-design/scripts/mob.mjs find button
node mob-design/scripts/mob.mjs find .mob-card
node mob-design/scripts/mob.mjs find --mob-bg-surface --json
```

The command reads live CSS and Markdown on every run. Use `docs/02-components.md` for exact
component APIs, `docs/01-foundations.md` for tokens, `docs/03-patterns.md` for compositions, and
`docs/09-adoption.md` for integration.

## Integration

Full bundle:

```css
@layer mob, app;
@import url('./mob-design/css/mob.css') layer(mob);
```

Incremental roles:

```css
@import url('./mob-design/css/tokens.css');
@import url('./mob-design/css/roles.css');
```

The full bundle includes the reset and global body, link, focus, and scrollbar styles. Incremental
roles leave global styling to the host; selectively imported component CSS requires host control
normalization and a visible `:focus-visible` policy.

Set the theme on `<html data-mob-theme="dark|light">` in most products. Semantic aliases resolve
where they are declared, so an arbitrary nested theme switch is not guaranteed to recompute them.
Density `marketing|product|data` may live on a container; a root value sets the baseline.

## Hard rules

- Do not write arbitrary colors, sizes, radii, durations, or z-index values in UI. Find a token.
- Do not use raw `--mob-gray-*`, `--mob-violet-*`, `--mob-green-*`, `--mob-red-*`,
  `--mob-amber-*`, or `--mob-blue-*` palette tokens in application code.
- A literal brand or theme color belongs only in a theme layer with a line-scoped
  `mob-lint-ok: reason` comment. Check contrast on the rendered screen.
- A chart instance or layout may pass data through local custom properties. Those values do not
  become system tokens.
- Search for an existing `.mob-*` class first. A new component or token is a system decision.
- Variants and sizes use classes such as `.mob-btn--primary` and `.mob-btn--sm`, not
  `data-mob-variant` or `data-mob-size`.
- State uses native attributes, ARIA, and documented `data-mob-*` hooks. A presence attribute with
  the string value `"false"` still matches CSS; omit it instead.
- Animate geometry with `transform` and `opacity`. Paint properties such as color may transition;
  do not animate width, height, inset, or margin.
- A button remains a `<button>` and a link remains an `<a>`. Icon-only buttons need a name.
- Do not replace host data, formatting, or product logic with examples from these docs.
- Do not copy pieces of system CSS into the application. Import the source and override public
  tokens or hooks in the application's own layer.

## Avoid generic demo packaging

Preserve the host's real brand, wording, navigation, screen structure, and task priorities. Do not
invent a logo, tagline, team identity, testimonial, KPI, or business metric to make a screen look
finished. Declare sample data when a standalone example needs it.

Choose regions from the actual task and data. Do not default to a hero plus three promotional cards,
or add decorative grids, orbits, gradients, and glows without a content purpose in the brief. This
guidance does not ban the system's violet action color, typography, cards, or intentional component
catalogue examples. Every visible action in a working example must work. See
[`docs/10-anti-patterns.md`](docs/10-anti-patterns.md#generic-demo-packaging).

## Working vocabulary

Structure: `.mob-page`, `.mob-shell`, `.mob-stack`, `.mob-cluster`, `.mob-grid`, `.mob-section`.

Controls: `.mob-btn`, `.mob-icon-btn`, `.mob-field`, `.mob-input`, `.mob-textarea`,
`.mob-select`, `.mob-checkbox`, `.mob-radio`, `.mob-toggle`.

Surfaces and data: `.mob-card`, `.mob-chip`, `.mob-list-row`, `.mob-stat`, `.mob-table`,
`.mob-meter`, `.mob-spark`, `.mob-delta`.

Typography: `.mob-heading-*`, `.mob-title`, `.mob-figure-*`, `.mob-body*`, `.mob-value*`,
`.mob-meta*`, `.mob-label`, `.mob-tone-*`.

## Verify the consumer

```bash
node mob-design/scripts/mob.mjs audit src
```

The audit is heuristic. It reliably checks literal classes and ordinary static styles, while
dynamic class expressions and JavaScript or TypeScript semantics still need human review. After
the audit, open real routes at narrow and wide widths, test keyboard navigation and the
empty/loading/error/disabled states, and confirm that application behavior is unchanged.

When using a git submodule, pin a verified commit and do not update it blindly.
`node mob-design/scripts/mob.mjs init .` adds this contract to an existing `AGENTS.md` while
preserving its current instructions. It does not edit `CLAUDE.md`, framework configuration,
application source, or dependencies.
