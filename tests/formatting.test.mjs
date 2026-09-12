import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { after } from 'node:test';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const docs = readFileSync(join(root, 'docs', '07-data-formatting.md'), 'utf8');
const section = docs.slice(docs.indexOf('## 13. The formatting module'));
const source = /```js\n([\s\S]*?)\n```/.exec(section)?.[1];
assert.ok(source, 'formatting module JavaScript fence must exist');
const directory = mkdtempSync(join(tmpdir(), 'mob-format '));
const moduleFile = join(directory, 'mob-format.mjs');
writeFileSync(moduleFile, source, 'utf8');
const format = await import(`${pathToFileURL(moduleFile)}?test=${Date.now()}`);
after(() => rmSync(directory, { recursive: true, force: true }));

test('money distinguishes unavailable/non-finite values and tiny non-zero values', () => {
  assert.equal(format.money(null).state, 'none');
  assert.equal(format.money(Number.POSITIVE_INFINITY).state, 'none');
  const tiny = format.money(1e-11);
  assert.match(tiny.display, /^<\$/);
  assert.notEqual(tiny.display, '$0.00');
  assert.equal(tiny.exact, '1e-11');
});

test('percentage keeps a negative sign when sign decoration is disabled', () => {
  assert.equal(format.pct(-1, { sign: false }).display, '−1.00%');
  assert.equal(format.pct(-0.001).display, '−<0.01%');
});

test('signed money emits one glyph and matching semantic tone', () => {
  const positive = format.signedMoney(12.5);
  assert.match(positive.display, /^\+\$/);
  assert.equal(positive.sign, 'positive');
  const negative = format.signedMoney(-12.5);
  assert.match(negative.display, /^−\$/);
  assert.equal(negative.sign, 'negative');
});

test('identifier preserves a copyable full value and invalid time is explicit', () => {
  const id = format.ident('7xQpLm4vA7c8N2s9Xr2W91Md');
  assert.equal(id.full, '7xQpLm4vA7c8N2s9Xr2W91Md');
  assert.match(id.display, /…/);
  assert.equal(format.when(null).state, 'none');
  assert.equal(format.when(Number.NaN).state, 'none');
  assert.equal(format.when(1e20).state, 'none');
  assert.equal(format.when('not-a-date').state, 'none');
});
