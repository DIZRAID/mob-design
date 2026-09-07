# tokens/ — machine-readable mirrors

`css/tokens.css` is the **source of truth**. Every value in this directory is a hand-maintained
mirror of it. Nothing here is generated, and nothing here is compiled back into the CSS — if the two
disagree, the CSS is right and the JSON is a defect.

That direction is deliberate. A generated-token pipeline puts a build step between the design system
and the product, and the moment someone edits the artefact instead of the source the whole contract
rots. The CSS ships as source; these files exist so that things which cannot read CSS custom
properties can still see the same values.

## What they are for

| Consumer | What it reads |
|---|---|
| Design tools (Figma variables, Tokens Studio) | the full tree, imported as collections |
| Style Dictionary / Theo / Terrazzo | `tokens/*.json` as input, to emit iOS, Android, Flutter, JSON, SCSS |
| Native platforms | one export per platform, from the same three files |
| Docs, linters, codemods | provenance and `mob.cssVar` to check a hex against the token that owns it |

Web consumers should not read these files. Import `css/mob.css` (or the Tailwind preset, which is
itself just `var(--mob-*)` references) and let the cascade do the work — that is the only path where
theme switching keeps working at runtime.

## The three files

| File | Tier | Rule |
|---|---|---|
| `primitives.json` | 1 | Raw values. Never consumed directly by a component. |
| `semantic.json` | 2 | Roles. Every `$value` is an alias into tier 1. This is the retheming layer. |
| `component.json` | 3 | Measured, off-scale component values (a card's 15px/16px padding). |

They merge into **one namespace** at the root — `semantic.json` refers to `{color.gray.975}`, which
lives in `primitives.json`. Load all three before resolving aliases:

```js
const tree = {};
for (const f of ['primitives.json', 'semantic.json', 'component.json'])
  Object.assign(tree, JSON.parse(fs.readFileSync(`tokens/${f}`, 'utf8')));
```

## Shape

W3C design-token draft: a token is any node with `$value`, groups carry `$type` for their children,
and `{group.name}` is an alias. Four conventions on top of it:

```jsonc
"canvas": {
  "$value": "{color.gray.975}",
  "$description": "The page. Near-black, not black.",
  "$extensions": {
    "mob.provenance": "src",              // src | drv — see below
    "mob.cssVar": "--mob-bg-canvas",      // the custom property this token emits
    "mob.theme.light": "#f7f8fa"          // value under [data-mob-theme='light']
  }
}
```

- **`mob.cssVar`** is on every token. It is what makes verification mechanical, and what lets a
  linter map a stray hex back to the token that owns it.
- **`mob.cssValue`** appears where `$value` cannot round-trip to CSS text on its own — cubic-bezier
  arrays, structured shadows, `.985`, `1.0`. When present it is the verbatim CSS.
- **`mob.theme.light`** carries the derived light mode. It is not a second file because it is not a
  second design: one role inversion of the same system, opted into with `<html data-mob-theme="light">`.
  A few tier-1 tokens carry it too (`color.affirm.*`, `color.destroy.*`, `color.series-tint.*`,
  `color.series-glyph.*`) because `tokens.css` re-themes those primitives directly.
- **`mob.density`** and **`mob.responsive`** (tier 3 only) carry the density-zone and mobile
  overrides for the five tokens that move: `card.pad-y`, `card.pad-x`, `rhythm.*`.

Notes for exporters: dimensions use the string shorthand (`"16px"`), not `{value, unit}`. Unitless
line-heights are numbers. Three values are CSS `color-mix()` expressions (`background.selection`,
`glow.*`) — pass them through unevaluated for CSS targets; for a native target, resolve the mix
yourself and record that you did.

## Provenance

`tokens.css` marks values `[src]` (measured verbatim from the calibrated handoff) or `[drv]`
(extended by a stated rule). That distinction survives here as `mob.provenance`, because it tells you
what you are allowed to change: a `drv` value is a judgement call you can argue with; an `src` value
is a measurement, and changing it means the system no longer matches the surface it was calibrated
against.

Where `tokens.css` marks a value explicitly, that marker is carried unchanged. Where it does not,
provenance was assigned by these rules — stated so you can check them rather than trust them:

- A group comment that states provenance for the whole group wins (the type scale, the series ramp,
  the easings).
- Otherwise: `src` if the value appears in the handoff (`README.md` / `Dashboard.dc.html`), `drv` if
  it does not. `font.size.4xl` (18px) is `drv` on this rule — 18px is a gap in the measured scale,
  present as a spacing value but never as a font size.
- Semantic tokens inherit the provenance of the primitive they alias. `border.hover` is `drv` because
  `color.gray.680` is.
- `duration.fast` and `duration.normal` are `src`: the handoff states its motion window in prose
  (transform/opacity only, 100–200 ms, no bounce) without naming values, and these two sit inside it.
  `instant`, `slow` and `enter` fall outside and are `drv`.

Counts today: 306 tokens — 165 `src`, 141 `drv`. Every token carries a marker; an unmarked token is
a defect.

## What is *not* here

- `css/brand.css` — the one-hex rebrand derives the accent family with `color-mix(in oklab, …)` at
  runtime. That is a computation, not a token; it cannot be mirrored as a value.
- `css/base.css` type roles (`.mob-label`, `.mob-title`, …) — a role is a composition of tokens, not
  a token. The Tailwind preset generates the same roles from its own `ROLES` table.
- Component class APIs — those live in `css/components/`.
- **Component-internal custom properties.** Each file in `css/components/` declares its own
  `--mob-<component>-*` properties — some class-scoped (`.mob-btn { --mob-btn-bg: … }`), some at
  `:root` so a consumer can retheme one component without editing its CSS. Around 380 of them exist,
  and none are mirrored here. `component.json` covers the tier-3 block of `tokens.css` only: the
  values shared across components, where two components drifting 1px apart would be visible. A
  component's private geometry is documented at its point of use, and the verifier's reverse check
  reads `tokens.css` alone, so it will not flag them. If a component property starts being read from
  outside that component, promote it into `tokens.css` first — then it belongs here.

## How to verify they still match

Save this as `verify-tokens.mjs` and run it against the package root. No dependencies; exits non-zero
on any drift. It checks both directions — every JSON token against its CSS declaration, **and** every
`--mob-*` in `tokens.css` against the tokens that claim to mirror it, so a value added to the CSS and
forgotten here is caught too.

```js
// Verify tokens/*.json against css/tokens.css.
// Usage: node verify-tokens.mjs [path/to/mob-design]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? new URL('.', import.meta.url).pathname;
const css = readFileSync(join(root, 'css/tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const decls = (block) => {
  const out = new Map();
  for (const m of block.matchAll(/(--mob-[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!out.has(m[1])) out.set(m[1], m[2].trim());
  }
  return out;
};
const blockAfter = (sel) => {
  const i = css.indexOf(sel);
  if (i < 0) return '';
  const s = css.indexOf('{', i);
  let d = 0;
  for (let j = s; j < css.length; j++) {
    if (css[j] === '{') d++;
    else if (css[j] === '}' && --d === 0) return css.slice(s + 1, j);
  }
  return '';
};

const base = decls(css);
const themes = { light: decls(blockAfter("[data-mob-theme='light']")) };
const density = {
  marketing: decls(blockAfter("[data-mob-density='marketing']")),
  product: decls(blockAfter("[data-mob-density='product']")),
  data: decls(blockAfter("[data-mob-density='data']")),
};
const mq = blockAfter('@media (max-width: 767px)');
const responsive = {
  'max-width: 767px': decls(mq),
  'max-width: 767px + marketing': decls(mq.slice(mq.indexOf("[data-mob-density='marketing']"))),
};

const tree = {};
for (const f of ['primitives.json', 'semantic.json', 'component.json'])
  Object.assign(tree, JSON.parse(readFileSync(join(root, 'tokens', f), 'utf8')));

const varOf = new Map();
const tokens = [];
(function walk(node, path) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') || v === null || typeof v !== 'object' || Array.isArray(v)) continue;
    const p = [...path, k];
    if ('$value' in v) {
      const cv = v.$extensions?.['mob.cssVar'];
      if (cv) varOf.set(p.join('.'), cv);
      tokens.push({ path: p.join('.'), t: v });
    } else walk(v, p);
  }
})(tree, []);

const render = (val, ext) => {
  if (typeof val === 'string' && /^\{[\w.-]+\}$/.test(val)) {
    const target = val.slice(1, -1);
    const cv = varOf.get(target);
    return cv ? `var(${cv})` : `UNRESOLVED{${target}}`;
  }
  if (ext?.['mob.cssValue'] !== undefined) return ext['mob.cssValue'];
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  return null;
};

let checked = 0, fail = 0;
const bad = (m) => { fail++; console.log('  MISMATCH ' + m); };

for (const { path, t } of tokens) {
  const cv = t.$extensions?.['mob.cssVar'];
  if (!cv) { console.log(`  NO cssVar  ${path}`); fail++; continue; }
  if (!base.has(cv)) { console.log(`  MISSING IN CSS  ${cv} (${path})`); fail++; continue; }
  const exp = render(t.$value, t.$extensions);
  if (exp === null) { console.log(`  UNRENDERABLE  ${path} (${cv}) — add mob.cssValue`); fail++; continue; }
  checked++;
  if (exp !== base.get(cv)) bad(`${cv}  json="${exp}"  css="${base.get(cv)}"`);

  for (const [theme, map] of Object.entries(themes)) {
    const v = t.$extensions?.[`mob.theme.${theme}`];
    if (v === undefined) continue;
    checked++;
    if (!map.has(cv)) bad(`${cv} @${theme} present in json, absent in css`);
    else if (v !== map.get(cv)) bad(`${cv} @${theme}  json="${v}"  css="${map.get(cv)}"`);
  }
  for (const [zone, v] of Object.entries(t.$extensions?.['mob.density'] ?? {})) {
    checked++;
    const e = render(v);
    if (e !== density[zone].get(cv)) bad(`${cv} @density=${zone}  json="${e}"  css="${density[zone].get(cv)}"`);
  }
  for (const [q, v] of Object.entries(t.$extensions?.['mob.responsive'] ?? {})) {
    checked++;
    const e = render(v);
    if (e !== responsive[q].get(cv)) bad(`${cv} @${q}  json="${e}"  css="${responsive[q].get(cv)}"`);
  }
}

// Reverse direction: every --mob-* declared in tokens.css must be owned by a token.
const owned = new Set([...varOf.values()]);
for (const v of base.keys()) if (!owned.has(v)) { console.log(`  UNMIRRORED  ${v} has no token`); fail++; }

console.log(`\n${checked} value(s) compared, ${tokens.length} tokens, ${fail} problem(s).`);
process.exit(fail ? 1 : 0);
```

Expected output at 1.0.0:

```
408 value(s) compared, 306 tokens, 0 problem(s).
```

The Tailwind preset is checked the same way — every `var(--mob-*)` it emits must be declared in
`tokens.css`. Save as `preset-check.cjs` in the package root (`.cjs`, because the preset is
CommonJS) and run it:

```js
const fs = require('fs');
const css = fs.readFileSync('css/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const defined = new Set([...css.matchAll(/(--mob-[\w-]+)\s*:/g)].map((m) => m[1]));
const preset = require('./tailwind/preset.js');
let roles = {};
preset.plugins[0]({ addComponents: (c) => Object.assign(roles, c) });
const used = [...new Set([...JSON.stringify([preset.theme, roles]).matchAll(/var\((--mob-[\w-]+)\)/g)].map((m) => m[1]))];
console.log(used.filter((v) => !defined.has(v)));   // must be []
```

## Changing a value

1. Edit `css/tokens.css`. Keep its `[src]` / `[drv]` marker honest — if you replace a measured value
   with a chosen one, it stops being `[src]`.
2. Mirror the change here: `$value`, and any `mob.theme.light` / `mob.density` / `mob.responsive`
   entry the CSS also changes.
3. Run the verifier. Zero problems, or you are not done.
4. Adding a token also means adding it here — the reverse check fails otherwise, on purpose.
