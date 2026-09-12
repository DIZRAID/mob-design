# Practical agent workflow

This guide covers adopting `mob-design` in a new or existing interface. The system supplies CSS,
tokens, and reference tools. The host application retains its behavior.

## 1. Get the source

The repository is private. Use authenticated `git` or `gh`; public raw-file URLs will not work.

```bash
git submodule add https://github.com/DIZRAID/mob-design.git mob-design
git add .gitmodules mob-design
```

A shallow clone is sufficient for a local prototype:

```bash
git clone --depth 1 https://github.com/DIZRAID/mob-design.git mob-design
```

A monorepo or local npm integration may use a relative dependency:

```json
{ "dependencies": { "mob-design": "file:../mob-design" } }
```

Package managers often create a `node_modules` symlink to a directory outside the project.
`init` deliberately refuses that non-portable layout. Link this workflow manually from the host's
`AGENTS.md`, or keep an in-project clone or submodule instead.

No npm registry publication is assumed. Pin a verified submodule commit. Treat
`git submodule update --remote` as a separate change and rerun system and application checks.

## 2. Register the agent instructions

When the system lives inside the project as `mob-design/`, `vendor/mob-design/`, or a real
in-project `node_modules/mob-design/`, run the command from the project root with its actual path:

```bash
node mob-design/scripts/mob.mjs init .
```

The command appends a short managed block to `AGENTS.md`, preserves existing bytes, and is
idempotent. It refuses malformed or duplicate markers, an `AGENTS.md` symlink, or a system outside
the project. It does not modify `CLAUDE.md`, application source, framework configuration, or
dependencies.

## 3. Choose the integration depth

For a separate application or deliberate application-wide migration, import the full bundle once
from the root stylesheet. A new screen inside a mature application does not isolate the reset from
other routes:

```css
@layer mob, app;
@import url('./mob-design/css/mob.css') layer(mob);
```

`mob.css` includes tokens, reset, global base, roles, and components. It does not load fonts.
Resolve each `@import` relative to the stylesheet that contains it, not the shell working directory.

For an existing application, start with the additive layer:

```css
@import url('./mob-design/css/tokens.css');
@import url('./mob-design/css/roles.css');
```

This provides custom properties and typography or tone roles without changing `body`, links,
scrollbars, reset, or global focus. `tokens.css` still sets `color-scheme` with the theme. If you
selectively import component CSS, the host must provide element normalization, visible focus,
reduced motion, and compact-control touch targets.

Do not copy half of `base.css` into the application. A fork no longer receives system fixes.

Cascade layers establish precedence, not isolation. Normal unlayered host CSS beats layered CSS;
`!important` reverses the layer order. Inspect computed styles on a real screen, especially around
old global selectors.

Tailwind is optional. Plain CSS does not need the preset. `tailwind/preset.js` targets Tailwind v3
and replaces part of its default scales: for example, `p-16` becomes 16px instead of the standard
64px. Tailwind v4 does not auto-detect JavaScript configuration; see the
[official upgrade guide](https://tailwindcss.com/docs/upgrade-guide). Resolve the preset through
the actual clone or package-manager path.

## 4. Theme, density, brand, and AA

A typical root is:

```html
<html data-mob-theme="dark" data-mob-density="product">
```

Switch the theme on `<html>` in most products. Semantic aliases resolve where they are declared;
an arbitrary nested `data-mob-theme` does not create a fully independent theme boundary.

Density may change by container:

```html
<section data-mob-density="marketing">…</section>
<main data-mob-density="product">…</main>
<div data-mob-density="data">…</div>
```

It changes section rhythm and card padding, not control geometry.

Load optional files after `mob.css` in the same cascade layer:

```css
@layer mob, app;
@import url('./mob-design/css/mob.css') layer(mob);
@import url('./mob-design/css/brand.css') layer(mob);
@import url('./mob-design/css/a11y.css') layer(mob);

:root { --mob-brand: #6d4df0; /* mob-lint-ok: approved product brand */ }
```

`brand.css` derives the accent family from one color. `a11y.css` activates through
`data-mob-a11y="AA"`. In this order its hardened accent returns to the calibrated violet and
replaces the custom brand in that scope. To retain the brand, measure a compliant pair and override
it after hardening. Every custom brand requires testing across all states.

## 5. Inspect the existing application

Before changing markup, record:

- framework, router, and CSS loading path;
- shared Button, Input, Dialog, and Table APIs;
- submit, click, and keyboard handlers plus disabled/loading/error contracts;
- requests, cache, optimistic updates, authentication, and permission gates;
- source precision, locale, formatters, and copy-to-clipboard behavior;
- headless dialog, popover, and menu control for focus, Escape, and outside click;
- important widths, themes, and route states.

Financial and trading examples in these docs demonstrate interface formatting. They do not prescribe
a product domain or justify replacing host data.

## 6. Find the API

```bash
node mob-design/scripts/mob.mjs find button
node mob-design/scripts/mob.mjs find .mob-btn --limit 10
node mob-design/scripts/mob.mjs find --mob-control-h-md --json
```

Results include classes, token declarations, and relevant Markdown headings with exact paths and
lines. `--limit` accepts 1–100. JSON has this shape:

```json
{
  "query": "button",
  "resolvedQueries": ["button", "btn"],
  "count": 1,
  "matches": [
    { "kind": "class", "name": ".mob-btn", "file": "css/components/button.css", "line": 177, "snippet": ".mob-btn" }
  ]
}
```

No result produces exit code 1 and an empty `matches` array. There is no checked-in index; every
query reads the current checkout.

## 7. Adopt one vertical slice

Create or update one shared wrapper first. The canonical React example is
[`examples/react/Button.tsx`](../examples/react/Button.tsx). It preserves the ref, native props,
handlers, default `type="button"`, caller `className`, and accessible loading or disabled semantics.

Then convert one real screen through normal, hover, focus, disabled, loading, empty, and error
states. Do not hide missing product logic behind static demo markup. A headless library continues
to own focus traps, Escape, and outside click; CSS owns presentation.

After the pilot, move repeated compositions into shared UI and expand. If arbitrary values recur,
record a system gap instead of copying CSS into the host.

## 8. Verify system and consumer

In the system repository:

```bash
npm run check
npm test
npm run preview
```

`preview` starts a dependency-free server at `127.0.0.1:4173`. The system ships as source CSS;
no build step or runtime JavaScript is required. The CLI and tests require Node.js 18 or newer.

In the consumer application:

```bash
node mob-design/scripts/mob.mjs audit src
node mob-design/scripts/mob.mjs audit src --json
```

Diagnostics use the stable `file:line [rule-id] reason` form with repair advice. JSON contains
`target`, `filesScanned`, `partialCoverage`, `diagnostics`, and `summary`. Findings exit 1; an
invalid or empty target exits 2.

The audit checks static `.mob-*` classes, required `var(--mob-*)`, raw palette leaks, unsupported
variant or size attributes, presence state written as `="false"`, and ordinary literal colors in
styles. Allow a legitimate theme or brand literal on its own line with a reason:

```css
:root { --mob-brand: #6d4df0; /* mob-lint-ok: approved product brand */ }
```

The audit is a heuristic, not an AST or accessibility proof. Review dynamic class expressions,
complex JavaScript or TypeScript, semantics, and runtime behavior manually.

Finish with 375px and wide layouts, keyboard-only navigation, real data, empty/loading/error,
theme and density, focus, dialog/popover/menu behavior, and horizontal overflow. Run the host's
native typecheck, tests, and build.

The repository also contains a small Playwright regression pass for critical CSS states. Playwright
is an external optional dependency:

```bash
MOB_PLAYWRIGHT_PATH=/absolute/path/to/node_modules/playwright npm run test:browser
```

## Copyable agent prompt

```text
Apply mob-design to this existing application. First read mob-design/AGENTS.md and
mob-design/docs/agent-workflow.md, then inspect the stack, shared UI, and current behavioral
contracts. Preserve routes, handlers, data, precision, locale, authentication, and headless
behavior. Choose full or incremental integration, convert one wrapper and one pilot screen, verify
them in a browser, then expand. Use mob.mjs find before writing markup and mob.mjs audit before
delivery.
```
