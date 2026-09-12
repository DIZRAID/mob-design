#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SYSTEM_ROOT = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const SOURCE_EXTENSIONS = new Set(['.css', '.scss', '.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.js', '.ts', '.mjs', '.cjs']);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor', 'build', 'dist', 'coverage']);
const NOOP_CLASSES = new Set(['mob-chip--neutral', 'mob-chip--outline', 'mob-chip--md', 'mob-stat--md']);
const PRIMITIVE_RE = /^--mob-(?:gray|violet|green|red|amber|blue)-/;
const MANAGED_START = '<!-- mob-design:start -->';
const MANAGED_END = '<!-- mob-design:end -->';

function usage() {
  return `mob-design CLI\n\nUsage:\n  mob-design find <query> [--json] [--limit N]\n  mob-design check\n  mob-design audit <file-or-dir> [--json]\n  mob-design init <project-dir>`;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function relativePath(path, root = SYSTEM_ROOT) {
  const value = relative(root, path);
  return value || '.';
}

function stripBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function stripMarkdownFences(text) {
  let fenced = false;
  return text.split('\n').map((line) => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return ''; }
    return fenced ? '' : line;
  }).join('\n');
}

function stripSourceComments(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function listFiles(root, predicate, { skipSystem = false } = {}) {
  const files = [];
  const seen = new Set();
  const visit = (path) => {
    let entry;
    try { entry = lstatSync(path); } catch { return; }
    if (entry.isSymbolicLink()) return;
    const real = realpathSync(path);
    if (seen.has(real)) return;
    seen.add(real);
    if (skipSystem && (real === SYSTEM_ROOT || real.startsWith(SYSTEM_ROOT + sep))) return;
    if (entry.isDirectory()) {
      if (path !== root && SKIP_DIRS.has(path.slice(path.lastIndexOf(sep) + 1))) return;
      for (const child of readdirSync(path).sort()) visit(join(path, child));
    } else if (entry.isFile() && predicate(path)) files.push(path);
  };
  visit(root);
  return files;
}

function cssFiles(root = SYSTEM_ROOT) {
  return listFiles(join(root, 'css'), (path) => extname(path) === '.css');
}

function markdownFiles(root = SYSTEM_ROOT) {
  const candidates = [join(root, 'README.md'), join(root, 'AGENTS.md'), join(root, 'docs'), join(root, 'tokens', 'README.md')];
  return candidates.flatMap((path) => existsSync(path) ? listFiles(path, (file) => extname(file) === '.md') : []);
}

function declarations(text) {
  const clean = stripBlockComments(text);
  const result = new Map();
  for (const match of clean.matchAll(/(--mob-[\w-]+)\s*:\s*([^;{}]+)(?=;|}|$)/g)) {
    if (!result.has(match[1])) result.set(match[1], { value: match[2].trim(), line: lineOf(clean, match.index) });
  }
  return result;
}

function matchingBrace(text, opening) {
  let depth = 0;
  let quote = null;
  for (let index = opening; index < text.length; index++) {
    const char = text[index];
    if (quote) {
      if (char === '\\') index++;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) return index;
  }
  return -1;
}

function blockAfter(text, selector, from = 0) {
  const index = text.indexOf(selector, from);
  if (index < 0) return { text: '', start: -1 };
  const opening = text.indexOf('{', index + selector.length);
  if (opening < 0) return { text: '', start: -1 };
  const closing = matchingBrace(text, opening);
  return closing < 0 ? { text: '', start: -1 } : { text: text.slice(opening + 1, closing), start: opening + 1 };
}

function parseArgs(args, allowedFlags) {
  const positional = [];
  const flags = {};
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!arg.startsWith('--')) { positional.push(arg); continue; }
    if (arg.startsWith('--mob-')) { positional.push(arg); continue; }
    if (!allowedFlags.has(arg)) throw new Error(`unknown option: ${arg}`);
    if (arg === '--limit') {
      const value = args[++index];
      if (!/^\d+$/.test(value ?? '') || Number(value) < 1 || Number(value) > 100) throw new Error('--limit must be an integer from 1 to 100');
      flags.limit = Number(value);
    } else flags[arg.slice(2)] = true;
  }
  return { positional, flags };
}

function collectClasses(root = SYSTEM_ROOT) {
  const out = [];
  for (const file of cssFiles(root)) {
    const raw = readFileSync(file, 'utf8');
    const clean = stripBlockComments(raw);
    for (const block of clean.matchAll(/([^{}]+)\{/g)) {
      const selector = block[1];
      if (selector.trimStart().startsWith('@') && !selector.includes('.mob-')) continue;
      for (const match of selector.matchAll(/\.((?:mob)[\w-]*(?:__[\w-]+)?)/g)) {
        out.push({ kind: 'class', name: `.${match[1]}`, file: relativePath(file, root), line: lineOf(clean, block.index + match.index), snippet: selector.trim().replace(/\s+/g, ' ').slice(0, 220) });
      }
    }
  }
  const unique = new Map();
  for (const item of out) if (!unique.has(`${item.name}:${item.file}:${item.line}`)) unique.set(`${item.name}:${item.file}:${item.line}`, item);
  return [...unique.values()];
}

function collectTokenDeclarations(root = SYSTEM_ROOT) {
  const out = [];
  for (const file of cssFiles(root)) {
    const clean = stripBlockComments(readFileSync(file, 'utf8'));
    for (const match of clean.matchAll(/(--mob-[\w-]+)\s*:\s*([^;{}]+);/g)) {
      out.push({ kind: 'token', name: match[1], file: relativePath(file, root), line: lineOf(clean, match.index), snippet: `${match[1]}: ${match[2].trim()};` });
    }
  }
  return out;
}

function collectHeadings(root = SYSTEM_ROOT) {
  const out = [];
  for (const file of markdownFiles(root)) {
    const lines = stripMarkdownFences(readFileSync(file, 'utf8')).split('\n');
    for (let index = 0; index < lines.length; index++) {
      const match = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index]);
      if (!match) continue;
      let endLine = lines.length;
      for (let next = index + 1; next < lines.length; next++) {
        const heading = /^(#{1,6})\s+/.exec(lines[next]);
        if (heading && heading[1].length <= match[1].length) { endLine = next; break; }
      }
      out.push({ kind: 'heading', name: match[2].replace(/[*_`]/g, ''), file: relativePath(file, root), line: index + 1, endLine, snippet: lines[index].trim() });
    }
  }
  return out;
}

const QUERY_ALIASES = new Map([
  ['button', ['btn']],
  ['buttons', ['btn']],
]);

export function findMatches(query, { limit = 20, root = SYSTEM_ROOT } = {}) {
  const raw = query.trim().toLowerCase();
  const normalized = raw.replace(/^\./, '').replace(/^--/, '');
  const aliases = QUERY_ALIASES.get(normalized) ?? [];
  const resolvedQueries = [...new Set([normalized, ...aliases].filter(Boolean))];
  const candidates = [...collectClasses(root), ...collectTokenDeclarations(root), ...collectHeadings(root)];
  const scored = [];
  for (const item of candidates) {
    const name = item.name.toLowerCase();
    const plain = name.replace(/^\./, '').replace(/^--/, '');
    let score = -1;
    for (const term of resolvedQueries) {
      if (plain === term || name === raw) score = Math.max(score, 100);
      else if (plain === `mob-${term}`) score = Math.max(score, 95);
      else if (plain.startsWith(`mob-${term}`) || plain.startsWith(term)) score = Math.max(score, 80);
      else if (plain.includes(term) || item.snippet.toLowerCase().includes(term)) score = Math.max(score, 50);
    }
    if (score >= 0) {
      if (item.kind === 'class' && item.snippet.replace(/\s+/g, ' ') === item.name) score += 25;
      if (item.kind === 'class' && item.file.startsWith('css/components/')) score += 10;
      scored.push({ score, ...item });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name) || a.file.localeCompare(b.file) || a.line - b.line);
  const headingQuota = limit >= 3 ? Math.max(1, Math.floor(limit * .2)) : 0;
  const tokenQuota = limit >= 3 ? Math.max(1, Math.floor(limit * .25)) : 0;
  const quotas = { class: limit - headingQuota - tokenQuota, token: tokenQuota, heading: headingQuota };
  const selected = [];
  for (const kind of ['class', 'token', 'heading']) selected.push(...scored.filter((item) => item.kind === kind).slice(0, quotas[kind]));
  if (selected.length < limit) {
    const chosen = new Set(selected);
    selected.push(...scored.filter((item) => !chosen.has(item)).slice(0, limit - selected.length));
  }
  selected.sort((a, b) => b.score - a.score || ({ class: 0, token: 1, heading: 2 }[a.kind] - { class: 0, token: 1, heading: 2 }[b.kind]) || a.name.localeCompare(b.name) || a.file.localeCompare(b.file) || a.line - b.line);
  const matches = selected.slice(0, limit).map(({ score, ...item }) => item);
  return { query, resolvedQueries, count: matches.length, matches };
}

function diagnostic(ruleId, file, line, reason, advice, severity = 'error') {
  return { ruleId, severity, file, line, reason, advice };
}

function allDefinitions(root = SYSTEM_ROOT) {
  const map = new Map();
  for (const file of cssFiles(root)) {
    for (const [name, value] of declarations(readFileSync(file, 'utf8'))) {
      if (!map.has(name)) map.set(name, { ...value, file });
    }
  }
  return map;
}

function varReferences(text) {
  const clean = stripBlockComments(text);
  const refs = [];
  for (const match of clean.matchAll(/var\(\s*(--mob-[\w-]+)/g)) {
    if (clean[match.index + match[0].length] === '$') continue;
    const opening = clean.indexOf('(', match.index);
    let depth = 0;
    let comma = false;
    let closing = clean.length;
    for (let index = opening; index < clean.length; index++) {
      if (clean[index] === '(') depth++;
      else if (clean[index] === ')' && --depth === 0) { closing = index; break; }
      else if (clean[index] === ',' && depth === 1) comma = true;
    }
    refs.push({ name: match[1], optional: comma, line: lineOf(clean, match.index), text: clean.slice(match.index, closing + 1) });
  }
  return refs;
}

function loadTokens(root, diagnostics) {
  const tokens = [];
  const varOf = new Map();
  const files = ['primitives.json', 'semantic.json', 'component.json'];
  const tree = {};
  for (const name of files) {
    const file = join(root, 'tokens', name);
    let data;
    try { data = JSON.parse(readFileSync(file, 'utf8')); }
    catch (error) {
      diagnostics.push(diagnostic('token-json', relativePath(file, root), 1, `cannot parse token JSON: ${error.message}`, 'Fix the JSON syntax.'));
      continue;
    }
    Object.assign(tree, data);
    const raw = readFileSync(file, 'utf8');
    const walk = (node, path = []) => {
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith('$') || !value || typeof value !== 'object' || Array.isArray(value)) continue;
        const tokenPath = [...path, key];
        if ('$value' in value) {
          const cssVar = value.$extensions?.['mob.cssVar'];
          const needle = cssVar ? `\"mob.cssVar\": \"${cssVar}\"` : `\"${key}\"`;
          const index = raw.indexOf(needle);
          tokens.push({ path: tokenPath.join('.'), token: value, file, line: index >= 0 ? lineOf(raw, index) : 1 });
        } else walk(value, tokenPath);
      }
    };
    walk(data);
  }
  for (const { path, token, file, line } of tokens) {
    const ext = token.$extensions;
    if (!ext?.['mob.cssVar']) diagnostics.push(diagnostic('token-css-var', relativePath(file, root), line, `${path} has no mob.cssVar`, 'Add the CSS custom property owned by this token.'));
    else if (varOf.has(ext['mob.cssVar'])) diagnostics.push(diagnostic('token-owner', relativePath(file, root), line, `${ext['mob.cssVar']} is owned by more than one token`, 'Keep exactly one JSON owner per CSS variable.'));
    else varOf.set(ext['mob.cssVar'], path);
    if (!['src', 'drv'].includes(ext?.['mob.provenance'])) diagnostics.push(diagnostic('token-provenance', relativePath(file, root), line, `${path} has missing or invalid mob.provenance`, 'Set mob.provenance to src or drv.'));
  }
  return { tokens, varOf };
}

function renderToken(value, ext, varOf) {
  if (typeof value === 'string' && /^\{[\w.-]+\}$/.test(value)) {
    const target = value.slice(1, -1);
    for (const [cssVar, path] of varOf) if (path === target) return `var(${cssVar})`;
    return `UNRESOLVED{${target}}`;
  }
  if (ext?.['mob.cssValue'] !== undefined) return String(ext['mob.cssValue']);
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return null;
}

function compareTokenMirrors(root, diagnostics) {
  const cssFile = join(root, 'css', 'tokens.css');
  const raw = readFileSync(cssFile, 'utf8');
  const clean = stripBlockComments(raw);
  const base = declarations(clean);
  const lightBlock = blockAfter(clean, "[data-mob-theme='light']");
  const light = declarations(lightBlock.text);
  const density = Object.fromEntries(['marketing', 'product', 'data'].map((zone) => [zone, declarations(blockAfter(clean, `[data-mob-density='${zone}']`).text)]));
  const media = blockAfter(clean, '@media (max-width: 767px)');
  const mediaRoot = declarations(blockAfter(media.text, ':root').text);
  const mediaMarketing = declarations(blockAfter(media.text, "[data-mob-density='marketing']").text);
  const responsive = { 'max-width: 767px': mediaRoot, 'max-width: 767px + marketing': mediaMarketing };
  const { tokens, varOf } = loadTokens(root, diagnostics);
  const owner = new Map(tokens.map((entry) => [entry.token.$extensions?.['mob.cssVar'], entry]));
  const explicitProvenance = new Map();
  for (const [index, line] of raw.split('\n').entries()) {
    const provenance = /\[(src|drv)\]/.exec(line)?.[1];
    if (!provenance) continue;
    for (const match of line.matchAll(/(--mob-[\w-]+)\s*:/g)) explicitProvenance.set(match[1], { provenance, line: index + 1 });
  }
  for (const entry of tokens) {
    const { path, token, file, line } = entry;
    const ext = token.$extensions ?? {};
    const cssVar = ext['mob.cssVar'];
    if (!cssVar) continue;
    const marked = explicitProvenance.get(cssVar);
    if (marked && marked.provenance !== ext['mob.provenance']) diagnostics.push(diagnostic('token-provenance-drift', relativePath(file, root), line, `${cssVar} provenance is JSON “${ext['mob.provenance']}”, CSS “${marked.provenance}”`, 'Match the explicit [src]/[drv] marker in css/tokens.css.'));
    const expected = renderToken(token.$value, ext, varOf);
    const actual = base.get(cssVar)?.value;
    if (actual === undefined) diagnostics.push(diagnostic('token-missing-css', relativePath(file, root), line, `${cssVar} (${path}) is absent from css/tokens.css`, `Declare ${cssVar} in css/tokens.css.`));
    else if (expected === null) diagnostics.push(diagnostic('token-render', relativePath(file, root), line, `${path} cannot be compared to CSS`, 'Add mob.cssValue with the exact CSS serialization.'));
    else if (expected !== actual) diagnostics.push(diagnostic('token-value', relativePath(file, root), line, `${cssVar} differs: JSON “${expected}”, CSS “${actual}”`, 'Update the JSON mirror to match css/tokens.css.'));
    const compareContexts = (key, maps) => {
      const values = ext[key] ?? {};
      for (const [context, value] of Object.entries(values)) {
        const rendered = renderToken(value, {}, varOf);
        const found = maps[context]?.get(cssVar)?.value;
        if (rendered !== found) diagnostics.push(diagnostic('token-context', relativePath(file, root), line, `${cssVar} @${context} differs: JSON “${rendered}”, CSS “${found}”`, 'Update the contextual JSON mirror to match css/tokens.css.'));
      }
      for (const [context, map] of Object.entries(maps)) if (map.has(cssVar) && !(context in values)) diagnostics.push(diagnostic('token-context-reverse', 'css/tokens.css', map.get(cssVar).line, `${cssVar} @${context} has no JSON mirror`, `Add ${key}.${context} to ${path}.`));
    };
    const lightValue = ext['mob.theme.light'];
    if (lightValue !== undefined && light.get(cssVar)?.value !== String(lightValue)) diagnostics.push(diagnostic('token-theme', relativePath(file, root), line, `${cssVar} @light differs: JSON “${lightValue}”, CSS “${light.get(cssVar)?.value}”`, 'Update mob.theme.light to match css/tokens.css.'));
    if (light.has(cssVar) && lightValue === undefined) diagnostics.push(diagnostic('token-theme-reverse', 'css/tokens.css', light.get(cssVar).line + lineOf(clean, lightBlock.start), `${cssVar} has a light override without a JSON mirror`, `Add mob.theme.light to ${path}.`));
    compareContexts('mob.density', density);
    compareContexts('mob.responsive', responsive);
  }
  for (const [cssVar, value] of base) if (!owner.has(cssVar)) diagnostics.push(diagnostic('token-unmirrored', 'css/tokens.css', value.line, `${cssVar} has no JSON token owner`, 'Add it to the appropriate tokens/*.json file with provenance and mob.cssVar.'));
}

function checkImports(root, diagnostics) {
  for (const file of cssFiles(root)) {
    const text = stripBlockComments(readFileSync(file, 'utf8'));
    for (const match of text.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (/^(?:https?:|data:|\/)/.test(specifier) || (!specifier.startsWith('.') && extname(specifier) !== '.css')) continue;
      const target = resolve(dirname(file), specifier);
      if (!existsSync(target)) diagnostics.push(diagnostic('css-import', relativePath(file, root), lineOf(text, match.index), `missing local @import target “${specifier}”`, `Create ${relativePath(target, root)} or correct the import path.`));
    }
  }
}

function checkReferences(root, diagnostics) {
  const definitions = allDefinitions(root);
  const files = [...cssFiles(root), join(root, 'tailwind', 'preset.js')].filter(existsSync);
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const ref of varReferences(text)) {
      if (!ref.optional && !definitions.has(ref.name)) diagnostics.push(diagnostic('unknown-token-reference', relativePath(file, root), ref.line, `${ref.name} is required but never declared`, `Declare ${ref.name} in css/tokens.css or add an intentional fallback.`));
    }
  }
}

function checkExamples(root, diagnostics) {
  const known = new Set(collectClasses(root).map((item) => item.name.slice(1)));
  const definitions = allDefinitions(root);
  const roots = [join(root, 'examples'), join(root, 'showcase')].filter(existsSync);
  for (const exampleRoot of roots) {
    for (const file of listFiles(exampleRoot, (path) => ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte'].includes(extname(path)))) {
      const text = readFileSync(file, 'utf8');
      for (const item of literalClassUses(text)) if (item.name.startsWith('mob-') && !known.has(item.name) && !NOOP_CLASSES.has(item.name)) diagnostics.push(diagnostic('example-class', relativePath(file, root), item.line, `example uses unknown class .${item.name}`, 'Use a class defined by css/*.css or correct the typo.'));
      for (const ref of varReferences(text)) if (!ref.optional && !definitions.has(ref.name)) diagnostics.push(diagnostic('example-token', relativePath(file, root), ref.line, `example requires unknown token ${ref.name}`, 'Use a declared --mob-* token or add an intentional fallback.'));
    }
  }
}

function checkMarkdownLinks(root, diagnostics) {
  for (const file of markdownFiles(root)) {
    const text = stripMarkdownFences(readFileSync(file, 'utf8'));
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
      let href = match[1].replace(/^<|>$/g, '');
      if (/^(?:[a-z][a-z+.-]*:|#)/i.test(href)) continue;
      href = href.split('#')[0].split('?')[0];
      if (!href) continue;
      try { href = decodeURIComponent(href); } catch { /* leave encoded text */ }
      const target = isAbsolute(href) ? href : resolve(dirname(file), href);
      if (!existsSync(target)) diagnostics.push(diagnostic('markdown-link', relativePath(file, root), lineOf(text, match.index), `local link target “${match[1]}” does not exist`, 'Correct the path; anchor validation is intentionally not enforced.'));
    }
  }
}

export function runCheck(root = SYSTEM_ROOT) {
  const diagnostics = [];
  for (const required of ['css/tokens.css', 'css/mob.css', 'tailwind/preset.js', 'tokens/primitives.json', 'tokens/semantic.json', 'tokens/component.json']) {
    if (!existsSync(join(root, required))) diagnostics.push(diagnostic('required-file', required, 1, 'required source file is missing', `Restore ${required}.`));
  }
  if (!diagnostics.length) {
    checkImports(root, diagnostics);
    checkReferences(root, diagnostics);
    compareTokenMirrors(root, diagnostics);
    checkExamples(root, diagnostics);
    checkMarkdownLinks(root, diagnostics);
  }
  return diagnostics;
}

function literalClassUses(text) {
  const uses = [];
  const patterns = [
    /\b(?:class|className)\s*=\s*["']([^"']*)["']/g,
    /\bclassName\s*=\s*\{\s*["'`]([^"'`${}]*)["'`]\s*\}/g,
    /\bclassName\s*:\s*["'`]([^"'`${}]*)["'`]/g,
    /\.setAttribute\(\s*["']class["']\s*,\s*["']([^"']*)["']/g,
  ];
  for (const pattern of patterns) for (const match of text.matchAll(pattern)) {
    for (const name of match[1].split(/\s+/).filter(Boolean)) uses.push({ name, line: lineOf(text, match.index) });
  }
  for (const call of text.matchAll(/\.classList\.(add|remove|toggle|replace)\(([^)]*)\)/g)) {
    const literals = [...call[2].matchAll(/["']([^"']*)["']/g)];
    const count = call[1] === 'toggle' ? Math.min(1, literals.length) : literals.length;
    for (const literal of literals.slice(0, count)) for (const name of literal[1].split(/\s+/).filter(Boolean)) {
      uses.push({ name, line: lineOf(text, call.index + call[0].indexOf(literal[0])) });
    }
  }
  return uses;
}

function styleFragments(text, extension) {
  const fragments = [];
  const declarationValues = (source, baseOffset = 0) => {
    const clean = stripBlockComments(source);
    for (const match of clean.matchAll(/(?:^|[;{])\s*(?:--[\w-]+|[a-z-]+)\s*:\s*([^;{}]+)(?=;|})/gim)) {
      const valueOffset = match.index + match[0].indexOf(match[1]);
      fragments.push({ text: match[1], offset: baseOffset + valueOffset });
    }
  };
  if (extension === '.css' || extension === '.scss') {
    declarationValues(text);
    return fragments;
  }
  for (const match of text.matchAll(/\bstyle\s*=\s*["']([^"']*)["']/g)) fragments.push({ text: match[1], offset: match.index });
  for (const match of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) declarationValues(match[1], match.index + match[0].indexOf(match[1]));
  for (const match of text.matchAll(/\b(?:css|styled(?:\.[\w-]+)?)\s*`([^`]*)`/gs)) if (!match[1].includes('${')) declarationValues(match[1], match.index + match[0].indexOf(match[1]));
  for (const object of text.matchAll(/\bstyle\s*=\s*\{\{([\s\S]*?)\}\}/g)) {
    for (const value of object[1].matchAll(/(?:["'][\w$-]+["']|[\w$-]+)\s*:\s*["'`]([^"'`${}]*)["'`]/g)) {
      fragments.push({ text: value[1], offset: object.index + object[0].indexOf(object[1]) + value.index + value[0].indexOf(value[1]) });
    }
  }
  return fragments;
}

function hasInlineException(text, line) {
  return /mob-lint-ok:\s*\S.+/.test(text.split('\n')[line - 1] ?? '');
}

function declaredStyleVars(text, extension) {
  const names = new Set();
  const add = (source) => { for (const name of declarations(source).keys()) names.add(name); };
  if (extension === '.css' || extension === '.scss') add(text);
  else {
    for (const match of text.matchAll(/\bstyle\s*=\s*["']([^"']*)["']/g)) add(match[1]);
    for (const match of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) add(match[1]);
    for (const match of text.matchAll(/\b(?:css|styled(?:\.[\w-]+)?)\s*`([^`]*)`/gs)) if (!match[1].includes('${')) add(match[1]);
    for (const object of text.matchAll(/\bstyle\s*=\s*\{\{([\s\S]*?)\}\}/g)) {
      for (const match of object[1].matchAll(/["'](--mob-[\w-]+)["']\s*:/g)) names.add(match[1]);
    }
  }
  return names;
}

function markupAttributeUses(text, name) {
  const out = [];
  const pattern = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'g');
  for (const match of text.matchAll(pattern)) out.push({ value: match[1], line: lineOf(text, match.index) });
  return out;
}

export function runAudit(target, { root = SYSTEM_ROOT } = {}) {
  const requested = resolve(target);
  if (!existsSync(requested)) throw new Error(`target does not exist: ${target}`);
  if (lstatSync(requested).isSymbolicLink()) throw new Error(`refusing symlink target: ${target}`);
  const files = listFiles(requested, (path) => SOURCE_EXTENSIONS.has(extname(path).toLowerCase()), { skipSystem: !isWithin(SYSTEM_ROOT, requested) });
  if (!files.length) throw new Error(`target contains no supported source files: ${target}`);
  const knownClasses = new Set(collectClasses(root).map((item) => item.name.slice(1)));
  for (const name of NOOP_CLASSES) knownClasses.add(name);
  const definitions = allDefinitions(root);
  const diagnostics = [];
  const consumerDefinitions = new Set();
  for (const file of files) {
    const text = stripSourceComments(readFileSync(file, 'utf8'));
    for (const name of declaredStyleVars(text, extname(file).toLowerCase())) consumerDefinitions.add(name);
  }
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const code = stripSourceComments(text);
    const shown = relative(requested === file ? dirname(requested) : requested, file) || file.slice(file.lastIndexOf(sep) + 1);
    for (const use of literalClassUses(code)) if (use.name.startsWith('mob-') && !knownClasses.has(use.name)) diagnostics.push(diagnostic('unknown-class', shown, use.line, `unknown literal class .${use.name}`, 'Check the name with mob-design find or use a defined class.'));
    const extension = extname(file).toLowerCase();
    for (const fragment of styleFragments(code, extension)) {
      for (const ref of varReferences(fragment.text)) {
        const line = lineOf(text, fragment.offset) + ref.line - 1;
        if (PRIMITIVE_RE.test(ref.name)) diagnostics.push(diagnostic('primitive-token', shown, line, `${ref.name} is a primitive palette token`, 'Use a semantic or component --mob-* token.'));
        else if (!ref.optional && !definitions.has(ref.name) && !consumerDefinitions.has(ref.name)) diagnostics.push(diagnostic('unknown-token', shown, line, `${ref.name} is required but unknown`, 'Use a declared token or supply an intentional CSS var fallback.'));
      }
      for (const match of fragment.text.matchAll(/(?:#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\()/gi)) {
        const line = lineOf(text, fragment.offset) + lineOf(fragment.text, match.index) - 1;
        if (!hasInlineException(text, line)) diagnostics.push(diagnostic('literal-color', shown, line, `literal CSS color “${match[0]}” bypasses theme tokens`, 'Use var(--mob-*) or a token-based color-mix(), or add “mob-lint-ok: reason” on this line for an intentional brand/theme literal.'));
      }
    }
    for (const name of ['data-mob-variant', 'data-mob-size']) for (const use of markupAttributeUses(code, name)) diagnostics.push(diagnostic('unsupported-attribute', shown, use.line, `${name}="${use.value}" is unsupported; variants and sizes are classes`, 'Use the documented .mob-… modifier class.'));
    for (const match of code.matchAll(/\b(data-mob-(?:loading|selected|invalid|open|active|error|leaving))\s*=\s*["']false["']/g)) diagnostics.push(diagnostic('false-state-attribute', shown, lineOf(code, match.index), `${match[1]}="false" still activates a presence selector`, 'Omit the attribute when the state is false.'));
  }
  diagnostics.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.ruleId.localeCompare(b.ruleId));
  return {
    target: requested,
    filesScanned: files.length,
    partialCoverage: true,
    diagnostics,
    summary: { errors: diagnostics.filter((item) => item.severity === 'error').length, warnings: diagnostics.filter((item) => item.severity === 'warning').length },
  };
}

function isWithin(parent, child) {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

function managedBlock(projectRoot) {
  const rel = relative(projectRoot, SYSTEM_ROOT).split(sep).join('/');
  const q = (path) => `'${path.replaceAll("'", `'\"'\"'`)}'`;
  return `${MANAGED_START}\n## mob-design\n\nThe design system is at \`${rel}\`. Before UI work, read \`${rel}/AGENTS.md\` and \`${rel}/docs/agent-workflow.md\`.\nUse \`node ${q(`${rel}/scripts/mob.mjs`)} find <query>\` to look up classes and tokens, and \`node ${q(`${rel}/scripts/mob.mjs`)} audit <file-or-dir>\` before handing off UI changes.\n${MANAGED_END}`;
}

export function runInit(target) {
  const requested = resolve(target);
  if (!existsSync(requested) || !statSync(requested).isDirectory()) throw new Error(`project directory does not exist: ${target}`);
  if (lstatSync(requested).isSymbolicLink()) throw new Error(`refusing symlink project directory: ${target}`);
  const projectRoot = realpathSync(requested);
  if (!isWithin(projectRoot, SYSTEM_ROOT) || projectRoot === SYSTEM_ROOT) throw new Error('mob-design must be located inside the target project for a portable registration');
  const agents = join(projectRoot, 'AGENTS.md');
  const agentsEntry = lstatSync(agents, { throwIfNoEntry: false });
  if (agentsEntry?.isSymbolicLink()) throw new Error('refusing symlink AGENTS.md');
  const before = agentsEntry ? readFileSync(agents, 'utf8') : '';
  const starts = before.split(MANAGED_START).length - 1;
  const ends = before.split(MANAGED_END).length - 1;
  if (starts > 1 || ends > 1 || starts !== ends) throw new Error('refusing malformed or duplicate mob-design managed markers in AGENTS.md');
  const block = managedBlock(projectRoot);
  if (starts === 1) {
    const start = before.indexOf(MANAGED_START);
    const end = before.indexOf(MANAGED_END, start) + MANAGED_END.length;
    if (before.slice(start, end) !== block) throw new Error('refusing to overwrite a modified mob-design managed block');
    return { changed: false, file: agents };
  }
  const separator = before.length === 0 ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  writeFileSync(agents, `${before}${separator}${block}\n`, 'utf8');
  return { changed: true, file: agents };
}

function printDiagnostics(diagnostics) {
  for (const item of diagnostics) console.error(`${item.file}:${item.line} [${item.ruleId}] ${item.reason}\n  Fix: ${item.advice}`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') { console.log(usage()); return 0; }
  if (command === 'find') {
    const { positional, flags } = parseArgs(args, new Set(['--json', '--limit']));
    if (positional.length !== 1 || !positional[0].trim()) throw new Error('find requires exactly one non-empty query');
    const result = findMatches(positional[0], { limit: flags.limit ?? 20 });
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else if (!result.count) console.error(`No mob-design classes, tokens, or documentation headings found for “${result.query}”.`);
    else for (const item of result.matches) console.log(`${item.file}:${item.line}${item.endLine ? `-${item.endLine}` : ''} [${item.kind}] ${item.name}\n  ${item.snippet}`);
    return result.count ? 0 : 1;
  }
  if (command === 'check') {
    if (args.length) throw new Error('check accepts no arguments');
    const diagnostics = runCheck();
    if (diagnostics.length) { printDiagnostics(diagnostics); console.error(`\ncheck failed with ${diagnostics.length} problem(s).`); return 1; }
    console.log('mob-design check passed.');
    return 0;
  }
  if (command === 'audit') {
    const { positional, flags } = parseArgs(args, new Set(['--json']));
    if (positional.length !== 1) throw new Error('audit requires exactly one file or directory');
    const result = runAudit(positional[0]);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else {
      printDiagnostics(result.diagnostics);
      console.log(`Scanned ${result.filesScanned} source file(s); ${result.summary.errors} error(s), ${result.summary.warnings} warning(s).`);
      console.log('Coverage is heuristic: literal classes and style syntax are checked; dynamic class expressions and general TypeScript/JavaScript semantics require review.');
    }
    return result.summary.errors ? 1 : 0;
  }
  if (command === 'init') {
    if (args.length !== 1) throw new Error('init requires exactly one project directory');
    const result = runInit(args[0]);
    console.log(`${result.changed ? 'changed' : 'unchanged'} ${result.file}`);
    return 0;
  }
  throw new Error(`unknown command: ${command}`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    const json = process.argv.includes('--json');
    if (json) console.log(JSON.stringify({ error: error.message }));
    else console.error(`mob-design: ${error.message}\n\n${usage()}`);
    process.exitCode = 2;
  });
}
