# `tokens/` — machine-readable mirrors

[`css/tokens.css`](../css/tokens.css) is the source of truth. The JSON in this directory serves
tools that cannot consume CSS custom properties, including Figma or Tokens Studio, Style
Dictionary, and native-platform exporters. Web applications should import the CSS so themes
continue to resolve at runtime.

## Files

| File | Tier | Purpose |
|---|---|---|
| `primitives.json` | 1 | Raw scales. Components do not consume them directly. |
| `semantic.json` | 2 | Surface, text, border, accent, and feedback roles. |
| `component.json` | 3 | Shared measured component geometry and rhythm. |

The three files merge into one root namespace. An alias such as `{color.gray.975}` in
`semantic.json` therefore resolves through `primitives.json`.

```js
const tree = {};
for (const file of ['primitives.json', 'semantic.json', 'component.json']) {
  Object.assign(tree, JSON.parse(fs.readFileSync(`tokens/${file}`, 'utf8')));
}
```

## Token shape

```jsonc
"canvas": {
  "$value": "{color.gray.975}",
  "$description": "Page canvas",
  "$extensions": {
    "mob.provenance": "src",
    "mob.cssVar": "--mob-bg-canvas",
    "mob.theme.light": "#f7f8fa"
  }
}
```

- `mob.cssVar` binds the JSON token to an exact CSS custom property.
- `mob.provenance` is required: `src` is a measured source value and `drv` is a system extension
  produced by a documented rule.
- `mob.cssValue` preserves exact CSS serialization when `$value` is structured or must not be
  normalized, including `cubic-bezier`, shadows, and `.985`.
- `mob.theme.light` mirrors the light-theme override.
- `mob.density` and `mob.responsive` mirror contextual component-token values.

Dimensions use strings such as `"16px"`; unitless line-height uses numbers. Pass `color-mix()`
values through as CSS. A native exporter must choose and document its own evaluation method.

## What is excluded

- `css/brand.css`: the accent family derives at runtime from one brand color.
- Typography classes in `css/roles.css`: each role composes tokens.
- Local `--mob-<component>-*` hooks in `css/components/*.css`: they are documented with their
  component. If multiple components begin consuming a hook, promote it to `css/tokens.css` first,
  then add its JSON mirror.

## Verification

```bash
npm run check
```

The check runs in both directions: JSON to CSS and CSS to JSON. It compares base, light, density,
and responsive values, required provenance, Tailwind references, CSS imports, examples, and local
Markdown links. Each failure reports a file, line, and concrete repair.

JSON is not compiled back into CSS and must not be edited independently. When the two disagree,
repair the mirror from `css/tokens.css`, then rerun `npm run check` and `npm test`.
