import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CLI = join(ROOT, 'scripts', 'mob.mjs');
const TEMP_DIRS = [];

function temp(name) {
  const directory = mkdtempSync(join(tmpdir(), `mob design ${name} `));
  TEMP_DIRS.push(directory);
  return directory;
}

after(() => {
  for (const directory of TEMP_DIRS) rmSync(directory, { recursive: true, force: true });
});

function run(cli, args, cwd = dirname(cli)) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}

function write(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, 'utf8');
}

function copySystem(name) {
  const copy = temp(name);
  cpSync(ROOT, copy, { recursive: true, filter: (path) => {
    const parts = relative(ROOT, path).split(sep);
    return !parts.includes('.git') && !parts.includes('node_modules');
  } });
  return copy;
}

test('find returns a precise live source hit, obeys limit, and supports JSON', () => {
  const result = run(CLI, ['find', 'button', '--json', '--limit', '1'], temp('lookup cwd'));
  assert.equal(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.equal(json.count, 1);
  assert.equal(json.matches[0].name, '.mob-btn');
  assert.equal(json.matches[0].file, 'css/components/button.css');
  assert.ok(json.matches[0].line > 0);
});

test('find reads live source and reports an unknown query honestly', () => {
  const unknown = run(CLI, ['find', 'definitely-not-a-mob-api-xyz', '--json']);
  assert.equal(unknown.status, 1);
  assert.deepEqual(JSON.parse(unknown.stdout).matches, []);

  const copy = copySystem('live index');
  const css = join(copy, 'css', 'components', 'button.css');
  writeFileSync(css, `${readFileSync(css, 'utf8')}\n.mob-live-probe {}\n`);
  const live = run(join(copy, 'scripts', 'mob.mjs'), ['find', 'live-probe', '--json'], temp('other cwd'));
  assert.equal(live.status, 0, live.stderr);
  assert.equal(JSON.parse(live.stdout).matches[0].name, '.mob-live-probe');
});

test('find accepts a CSS custom property as the positional query', () => {
  const result = run(CLI, ['find', '--mob-bg-surface', '--json', '--limit', '1']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).matches[0].name, '--mob-bg-surface');
});

test('audit catches literal class and token typos while ignoring unrelated strings', () => {
  const project = temp('consumer');
  write(join(project, 'src', 'View.tsx'), `
const comparison = value === 'mob-not-a-class';
const payload = { data: 'mob-data-string', color: '#abcdef' };
export const View = () => <div className="mob-btn mob-bnt" data-json="mob-ghost">OK</div>;
`);
  write(join(project, 'src', 'theme.css'), `
:root { --mob-app-local: #123456; }
.panel { color: var(--mob-app-local); background: var(--mob-optional, var(--mob-bg-surface)); border-color: var(--mob-tpyo); }
`);
  const result = run(CLI, ['audit', project, '--json']);
  assert.equal(result.status, 1);
  const json = JSON.parse(result.stdout);
  const ids = json.diagnostics.map((item) => item.ruleId);
  assert.ok(ids.includes('unknown-class'));
  assert.ok(ids.includes('unknown-token'));
  assert.ok(ids.includes('literal-color'));
  assert.equal(json.diagnostics.some((item) => /mob-not-a-class|mob-data-string/.test(item.reason)), false);
  assert.equal(json.diagnostics.some((item) => item.reason.includes('--mob-app-local') && item.ruleId === 'unknown-token'), false);
  assert.equal(json.partialCoverage, true);
});

test('audit reads style blocks and static JSX style values, with scoped color exceptions', () => {
  const project = temp('embedded styles');
  write(join(project, 'Widget.vue'), `<template><div class="mob-card"></div></template>\n<style>.x { color: var(--mob-vue-typo); } #abc { display:block; }</style>`);
  write(join(project, 'View.tsx'), `export const X = () => <div style={{ color: 'var(--mob-jsx-typo)', backgroundColor: '#123456', '--mob-app-tone': 'var(--mob-accent)', '--mob-app-bad': 'var(--mob-quoted-typo)' }} />;`);
  write(join(project, 'brand.css'), `:root { --mob-brand: #654321; /* mob-lint-ok: product brand source */ }`);
  write(join(project, 'Commented.html'), `<!-- <style>.x { color: var(--mob-comment-typo); }</style> -->`);
  const result = run(CLI, ['audit', project, '--json']);
  const json = JSON.parse(result.stdout);
  assert.equal(json.diagnostics.filter((item) => item.ruleId === 'unknown-token').length, 3);
  assert.ok(json.diagnostics.some((item) => item.reason.includes('--mob-quoted-typo')));
  assert.equal(json.diagnostics.filter((item) => item.ruleId === 'literal-color').length, 1);
  assert.equal(json.diagnostics.some((item) => item.reason.includes('#abc')), false);
  assert.equal(json.diagnostics.some((item) => item.file === 'brand.css'), false);
  assert.equal(json.diagnostics.some((item) => item.file === 'Commented.html'), false);
});

test('audit resolves final inline and quoted JSX application variables', () => {
  const project = temp('application vars');
  write(join(project, 'app.html'), `<div style="--mob-app-tone:var(--mob-accent)"><span style="color:var(--mob-app-tone)">ok</span></div>`);
  write(join(project, 'app.tsx'), `export const X = () => <div style={{ '--mob-app-tone': 'var(--mob-accent)', color: 'var(--mob-app-tone)' }} />;`);
  const result = run(CLI, ['audit', project, '--json']);
  assert.equal(result.status, 0, result.stdout);
  assert.deepEqual(JSON.parse(result.stdout).diagnostics, []);
});

test('audit checks primitive use, unsupported attributes, false states, and exclusions', () => {
  const project = temp('rules');
  write(join(project, 'app.html'), `<button class="mob-btn mob-chip--neutral" data-mob-variant="primary" data-mob-size="sm" data-mob-loading="false" style="color:var(--mob-gray-100)">Go</button>`);
  write(join(project, 'node_modules', 'bad.js'), `export const x = <div className="mob-fake" />`);
  write(join(project, 'dist', 'bad.css'), `.x { color: var(--mob-fake); }`);
  const result = run(CLI, ['audit', project, '--json']);
  const json = JSON.parse(result.stdout);
  assert.equal(json.filesScanned, 1);
  assert.deepEqual(new Set(json.diagnostics.map((item) => item.ruleId)), new Set(['primitive-token', 'unsupported-attribute', 'false-state-attribute']));
});

test('audit rejects nonexistent and empty unsupported targets', () => {
  const project = temp('empty');
  write(join(project, 'README.md'), '# no source');
  assert.equal(run(CLI, ['audit', join(project, 'missing'), '--json']).status, 2);
  assert.equal(run(CLI, ['audit', project, '--json']).status, 2);
});

test('audit skips symlinks and does not scan the same file twice', () => {
  const project = temp('symlink');
  write(join(project, 'src', 'ok.html'), `<div class="mob-card"></div>`);
  symlinkSync(join(project, 'src'), join(project, 'alias'));
  const result = run(CLI, ['audit', project, '--json']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).filesScanned, 1);
});

test('audit checks every static classList class argument', () => {
  const project = temp('class list');
  write(join(project, 'app.js'), `el.classList.add('mob-btn', 'mob-bnt'); el.classList.replace('mob-btn', 'mob-really-wrong'); el.classList.toggle('mob-card', enabled);`);
  const result = run(CLI, ['audit', project, '--json']);
  const names = JSON.parse(result.stdout).diagnostics.filter((item) => item.ruleId === 'unknown-class').map((item) => item.reason);
  assert.deepEqual(names, ['unknown literal class .mob-bnt', 'unknown literal class .mob-really-wrong']);
});

test('init preserves user instructions and is idempotent', () => {
  const project = temp('init');
  const system = join(project, 'vendor', 'mob design');
  write(join(system, 'scripts', 'mob.mjs'), readFileSync(CLI, 'utf8'));
  write(join(project, 'AGENTS.md'), '# User rules\n\nKeep this byte-for-byte.\n');
  const first = run(join(system, 'scripts', 'mob.mjs'), ['init', project]);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /^changed /);
  const content = readFileSync(join(project, 'AGENTS.md'), 'utf8');
  assert.ok(content.startsWith('# User rules\n\nKeep this byte-for-byte.\n'));
  assert.match(content, /docs\/agent-workflow\.md/);
  assert.match(content, /node 'vendor\/mob design\/scripts\/mob\.mjs' audit/);
  const second = run(join(system, 'scripts', 'mob.mjs'), ['init', project]);
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /^unchanged /);
  assert.equal(readFileSync(join(project, 'AGENTS.md'), 'utf8'), content);
});

test('init refuses malformed markers, AGENTS symlinks, and external systems', () => {
  const project = temp('init hazards');
  const system = join(project, 'vendor', 'mob');
  write(join(system, 'scripts', 'mob.mjs'), readFileSync(CLI, 'utf8'));
  write(join(project, 'AGENTS.md'), '<!-- mob-design:start -->\n');
  assert.equal(run(join(system, 'scripts', 'mob.mjs'), ['init', project]).status, 2);

  const project2 = temp('agent link');
  const system2 = join(project2, 'vendor', 'mob');
  write(join(system2, 'scripts', 'mob.mjs'), readFileSync(CLI, 'utf8'));
  write(join(project2, 'real.md'), 'rules');
  symlinkSync(join(project2, 'real.md'), join(project2, 'AGENTS.md'));
  assert.equal(run(join(system2, 'scripts', 'mob.mjs'), ['init', project2]).status, 2);
  assert.equal(run(CLI, ['init', project2]).status, 2);

  const project3 = temp('dangling agent link');
  const system3 = join(project3, 'vendor', 'mob');
  write(join(system3, 'scripts', 'mob.mjs'), readFileSync(CLI, 'utf8'));
  symlinkSync(join(project3, 'missing.md'), join(project3, 'AGENTS.md'));
  const dangling = run(join(system3, 'scripts', 'mob.mjs'), ['init', project3]);
  assert.equal(dangling.status, 2);
  assert.match(dangling.stderr, /refusing symlink AGENTS\.md/);
});

test('check catches a missing import in an isolated package copy', () => {
  const copy = copySystem('missing import');
  const mobCss = join(copy, 'css', 'mob.css');
  writeFileSync(mobCss, `${readFileSync(mobCss, 'utf8')}\n@import './missing.css';\n`);
  const result = run(join(copy, 'scripts', 'mob.mjs'), ['check']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /\[css-import\].*missing local @import target/);
});

test('check resolves bare relative CSS import paths', () => {
  const copy = copySystem('bare missing import');
  const mobCss = join(copy, 'css', 'mob.css');
  writeFileSync(mobCss, `${readFileSync(mobCss, 'utf8')}\n@import 'components/not-real.css';\n`);
  const result = run(join(copy, 'scripts', 'mob.mjs'), ['check']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /\[css-import\] missing local @import target “components\/not-real\.css”/);
});

test('check catches token mirror drift in an isolated package copy', () => {
  const copy = copySystem('token drift');
  const tokenFile = join(copy, 'tokens', 'component.json');
  writeFileSync(tokenFile, readFileSync(tokenFile, 'utf8').replace('"$value": "30px"', '"$value": "31px"'));
  const result = run(join(copy, 'scripts', 'mob.mjs'), ['check']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /\[token-value\].*--mob-control-h-sm differs/);
});
