#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = process.env.MOB_PLAYWRIGHT_PATH
    ? require(process.env.MOB_PLAYWRIGHT_PATH)
    : require('playwright');
} catch {
  console.error('mob-design browser checks need Playwright. Set MOB_PLAYWRIGHT_PATH to its installed package directory.');
  process.exit(2);
}

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

const fullFixture = `<!doctype html><html data-mob-theme="dark"><head>
<meta charset="utf-8"><link rel="stylesheet" href="/css/mob.css"></head><body>
<button id="disabled" class="mob-btn" disabled><span class="mob-btn__icon">!</span><span>Disabled</span></button>
<button id="disabled-error" class="mob-btn" data-mob-error disabled><span class="mob-btn__icon">!</span><span>Disabled error</span></button>
<button id="aria-disabled" class="mob-btn" aria-disabled="true"><span class="mob-btn__icon">!</span><span>ARIA disabled</span></button>
<button id="aria-disabled-error" class="mob-btn" aria-disabled="true" data-mob-error><span class="mob-btn__icon">!</span><span>ARIA disabled error</span></button>
<button id="delta" class="mob-delta" data-mob-sign="positive">+1.2%</button>
<dialog id="dialog" class="mob-modal"><div class="mob-modal__panel">Dialog</div></dialog>
<div class="mob-menu"><button id="menu" class="mob-menu__item" data-mob-loading>Menu</button></div>
<button id="chip" class="mob-chip" data-mob-interactive data-mob-loading>Chip</button>
</body></html>`;

const rolesFixture = `<!doctype html><html data-mob-theme="dark"><head><meta charset="utf-8">
<style>body{margin:13px;font-family:serif;color:rgb(4,5,6);background:rgb(7,8,9)}a{color:rgb(1,2,3)}</style>
<link rel="stylesheet" href="/css/tokens.css"><link rel="stylesheet" href="/css/roles.css"></head><body>
<a id="link">Host link</a><span id="meta" class="mob-meta">123</span>
<span id="value" class="mob-value">456</span><span id="figure" class="mob-figure-lg">789</span>
<h2 id="heading" class="mob-heading-md">Heading</h2></body></html>`;

function inside(path) {
  const rel = relative(root, path);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`));
}

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname === '/__mob-browser/full') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(fullFixture);
    return;
  }
  if (url.pathname === '/__mob-browser/roles') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(rolesFixture);
    return;
  }
  let file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (!inside(file)) { response.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) { response.writeHead(404).end(); return; }
  const real = realpathSync(file);
  if (!inside(real)) { response.writeHead(403).end(); return; }
  response.writeHead(200, { 'content-type': mime.get(extname(real)) || 'application/octet-stream' });
  createReadStream(real).pipe(response);
});

await new Promise((resolveListen, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolveListen);
});
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
let browser;

try {
  browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${origin}/__mob-browser/full`);

  const disabled = await page.locator('#disabled, #disabled-error, #aria-disabled, #aria-disabled-error').evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    const icon = getComputedStyle(element.querySelector('.mob-btn__icon'));
    return { background: style.backgroundColor, color: style.color, icon: icon.color };
  }));
  assert.deepEqual(disabled[1], disabled[0], 'data-error must not override native disabled tokens');
  assert.deepEqual(disabled[3], disabled[2], 'data-error must not override aria-disabled tokens');
  assert.equal(disabled[1].icon, disabled[1].color, 'disabled error icon inherits disabled foreground');
  assert.notEqual(disabled[0].background, 'rgba(0, 0, 0, 0)', 'disabled control keeps its disabled surface');

  const beforeDelta = await page.locator('#delta').evaluate((element) => getComputedStyle(element).color);
  await page.locator('#delta').hover();
  await page.waitForTimeout(200);
  const afterDelta = await page.locator('#delta').evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.color, token: style.getPropertyValue('--mob-delta-color').trim() };
  });
  assert.match(afterDelta.color, /rgb|color\(/, 'delta hover color must resolve');
  assert.notEqual(afterDelta.color, 'rgba(0, 0, 0, 0)');
  assert.ok(afterDelta.token, 'delta color token must remain defined on hover');
  assert.notEqual(afterDelta.color, beforeDelta, 'delta hover provides feedback');

  assert.equal(await page.locator('#dialog').evaluate((element) => getComputedStyle(element).display), 'none');
  await page.locator('#dialog').evaluate((element) => element.showModal());
  await page.waitForTimeout(350);
  assert.notEqual(await page.locator('#dialog').evaluate((element) => getComputedStyle(element).display), 'none');
  await page.locator('#dialog').evaluate((element) => element.close());
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#dialog').evaluate((element) => getComputedStyle(element).display), 'none');

  const selectPage = await browser.newPage({ viewport: { width: 900, height: 720 } });
  await selectPage.goto(`${origin}/examples/starter/`);
  assert.equal(await selectPage.evaluate(() => CSS.supports('appearance', 'base-select') && CSS.supports('selector(::picker(select))')), true);
  await selectPage.evaluate(() => {
    const disabledOption = document.createElement('option');
    disabledOption.value = 'unavailable';
    disabledOption.textContent = 'Unavailable region';
    disabledOption.disabled = true;
    document.querySelector('#timezone').append(disabledOption);
    window.__mobSelectChanges = { theme: 0, density: 0, timezone: 0 };
    for (const id of Object.keys(window.__mobSelectChanges)) {
      document.querySelector(`#${id}`).addEventListener('change', () => { window.__mobSelectChanges[id]++; });
    }
  });

  const triggerSizes = await selectPage.locator('#timezone').evaluate((select) => {
    const field = select.closest('.mob-field');
    const wrap = select.closest('.mob-input-wrap');
    const originalClass = field.className;
    const results = ['sm', 'md', 'lg'].map((size) => {
      field.className = `mob-field mob-field--${size}`;
      const style = getComputedStyle(select);
      const selectBox = select.getBoundingClientRect();
      const wrapBox = wrap.getBoundingClientRect();
      return {
        size,
        display: style.display,
        alignItems: style.alignItems,
        justifyContent: style.justifyContent,
        textAlign: style.textAlign,
        height: selectBox.height,
        wrapHeight: wrapBox.height,
        topDelta: selectBox.top - wrapBox.top,
        bottomDelta: selectBox.bottom - wrapBox.bottom,
        wrapBorderTop: Number.parseFloat(getComputedStyle(wrap).borderTopWidth),
        wrapBorderBottom: Number.parseFloat(getComputedStyle(wrap).borderBottomWidth),
      };
    });
    field.className = originalClass;
    return results;
  });
  for (const trigger of triggerSizes) {
    assert.equal(trigger.display, 'flex', `${trigger.size} customizable select remains a flex trigger`);
    assert.equal(trigger.alignItems, 'center', `${trigger.size} selected label is vertically centered`);
    assert.equal(trigger.justifyContent, 'flex-start', `${trigger.size} selected label starts at the inline edge`);
    assert.equal(trigger.textAlign, 'start');
    assert.ok(trigger.height > 0 && Math.abs(trigger.height - (trigger.wrapHeight - trigger.wrapBorderTop - trigger.wrapBorderBottom)) < 0.5, `${trigger.size} trigger fills the field content box: ${JSON.stringify(trigger)}`);
    assert.ok(Math.abs(trigger.topDelta - trigger.wrapBorderTop) < 0.5 && Math.abs(trigger.bottomDelta + trigger.wrapBorderBottom) < 0.5, `${trigger.size} trigger stays aligned inside the field border: ${JSON.stringify(trigger)}`);
  }
  assert.ok(triggerSizes[0].height < triggerSizes[1].height && triggerSizes[1].height < triggerSizes[2].height, 'select size tokens produce increasing trigger heights');

  let darkPickerBackground;
  for (const id of ['theme', 'density', 'timezone']) {
    assert.equal(await selectPage.locator(`#${id}`).evaluate((select) => getComputedStyle(select, '::picker(select)').display), 'none');
    await selectPage.locator(`#${id}`).click();
    await selectPage.waitForFunction((selectId) => document.querySelector(`#${selectId}`).matches(':open'), id);
    const styles = await selectPage.locator(`#${id}`).evaluate((select) => {
      const picker = getComputedStyle(select, '::picker(select)');
      const option = getComputedStyle(select.options[0]);
      const checked = getComputedStyle(select.selectedOptions[0], '::checkmark');
      const disabled = getComputedStyle(select.options[select.options.length - 1]);
      return {
        appearance: getComputedStyle(select).appearance,
        pickerIcon: getComputedStyle(select, '::picker-icon').display,
        pickerBackground: picker.backgroundColor,
        pickerBorder: picker.borderTopStyle,
        pickerRadius: picker.borderTopLeftRadius,
        pickerPadding: picker.paddingTop,
        optionFamily: option.fontFamily,
        optionHeight: select.options[0].getBoundingClientRect().height,
        checkmark: checked.content,
        disabledColor: disabled.color,
        normalColor: option.color,
      };
    });
    assert.equal(styles.appearance, 'base-select');
    assert.equal(styles.pickerIcon, 'none');
    assert.equal(styles.pickerBorder, 'solid');
    assert.notEqual(styles.pickerBackground, 'rgba(0, 0, 0, 0)');
    assert.notEqual(styles.pickerRadius, '0px');
    assert.notEqual(styles.pickerPadding, '0px');
    assert.match(styles.optionFamily, /IBM Plex Mono/i);
    assert.ok(styles.optionHeight >= 30);
    assert.match(styles.checkmark, /✓/);
    if (id === 'timezone') assert.notEqual(styles.disabledColor, styles.normalColor);
    darkPickerBackground ||= styles.pickerBackground;
    await selectPage.keyboard.press('Escape');
  }

  await selectPage.locator('#theme').click();
  await selectPage.locator('#theme option[value="light"]').click();
  assert.equal(await selectPage.locator('html').getAttribute('data-mob-theme'), 'light');
  await selectPage.locator('#density').click();
  await selectPage.keyboard.press('ArrowDown');
  await selectPage.keyboard.press('Enter');
  assert.equal(await selectPage.locator('#density').inputValue(), 'data');
  assert.equal(await selectPage.locator('#content').getAttribute('data-mob-density'), 'data');

  await selectPage.locator('#timezone').click();
  await selectPage.keyboard.press('ArrowDown');
  await selectPage.keyboard.press('Enter');
  assert.equal(await selectPage.locator('#timezone').inputValue(), 'Europe/Moscow');
  assert.equal(await selectPage.locator('#settings').evaluate((form) => new FormData(form).get('timezone')), 'Europe/Moscow');
  await selectPage.locator('#timezone').click();
  await selectPage.keyboard.press('ArrowDown');
  await selectPage.keyboard.press('Escape');
  assert.equal(await selectPage.locator('#timezone').inputValue(), 'Europe/Moscow', 'Escape cancels a pending option');
  await selectPage.click('#reset');
  await selectPage.waitForTimeout(50);
  assert.equal(await selectPage.locator('#timezone').inputValue(), 'Asia/Bangkok');

  await selectPage.locator('#timezone').click();
  await selectPage.keyboard.press('End');
  await selectPage.keyboard.press('Enter');
  assert.equal(await selectPage.locator('#timezone').inputValue(), 'UTC', 'keyboard navigation skips the disabled final option');
  assert.equal(await selectPage.locator('#timezone option[value="unavailable"]').evaluate((option) => option.disabled), true);
  const changes = await selectPage.evaluate(() => window.__mobSelectChanges);
  assert.deepEqual(changes, { theme: 1, density: 1, timezone: 2 });

  await selectPage.locator('#density').click();
  const lightPickerBackground = await selectPage.locator('#density').evaluate((select) => getComputedStyle(select, '::picker(select)').backgroundColor);
  assert.notEqual(lightPickerBackground, darkPickerBackground, 'picker surface follows the active theme');
  await selectPage.keyboard.press('Escape');
  assert.equal(await selectPage.locator('#theme').evaluate((select) => {
    select.disabled = true;
    select.click();
    return select.matches(':open');
  }), false, 'a disabled select does not open');
  await selectPage.close();

  await page.goto(`${origin}/__mob-browser/roles`);
  const roles = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily,
    bodyMargin: getComputedStyle(document.body).margin,
    bodyColor: getComputedStyle(document.body).color,
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    link: getComputedStyle(document.querySelector('#link')).color,
    meta: getComputedStyle(document.querySelector('#meta')).fontFamily,
    value: getComputedStyle(document.querySelector('#value')).fontFamily,
    figure: getComputedStyle(document.querySelector('#figure')).fontFamily,
    figureNums: getComputedStyle(document.querySelector('#figure')).fontVariantNumeric,
    heading: getComputedStyle(document.querySelector('#heading')).fontFamily,
  }));
  assert.match(roles.body, /serif/i, 'roles-only import preserves host body font');
  assert.equal(roles.bodyMargin, '13px');
  assert.equal(roles.bodyColor, 'rgb(4, 5, 6)');
  assert.equal(roles.bodyBackground, 'rgb(7, 8, 9)');
  assert.equal(roles.link, 'rgb(1, 2, 3)', 'roles-only import preserves host link color');
  assert.match(roles.meta, /IBM Plex Mono/i);
  assert.match(roles.value, /IBM Plex Mono/i);
  assert.doesNotMatch(roles.figure, /IBM Plex Mono/i);
  assert.doesNotMatch(roles.heading, /IBM Plex Mono/i);
  assert.equal(roles.figureNums, 'tabular-nums');
  await page.close();

  const coarse = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const coarsePage = await coarse.newPage();
  await coarsePage.goto(`${origin}/__mob-browser/full`);
  const coarseResult = await coarsePage.evaluate(() => {
    const menu = document.querySelector('#menu');
    const chip = document.querySelector('#chip');
    return {
      menu: menu.getBoundingClientRect().toJSON(),
      chip: chip.getBoundingClientRect().toJSON(),
      menuAfter: getComputedStyle(menu, '::after').content,
      chipAfter: getComputedStyle(chip, '::after').content,
    };
  });
  for (const box of [coarseResult.menu, coarseResult.chip]) {
    assert.ok(box.width >= 44 && box.height >= 44, `coarse control must be at least 44px, got ${box.width}x${box.height}`);
  }
  assert.notEqual(coarseResult.menuAfter, 'none', 'menu loading pseudo-element remains active');
  assert.notEqual(coarseResult.chipAfter, 'none', 'chip loading pseudo-element remains active');

  await coarsePage.goto(`${origin}/examples/starter/`);
  await coarsePage.locator('#timezone').click();
  await coarsePage.waitForFunction(() => document.querySelector('#timezone').matches(':open'));
  const coarseOptions = await coarsePage.locator('#timezone option').evaluateAll((options) => options.map((option) => option.getBoundingClientRect().toJSON()));
  assert.ok(coarseOptions.every((box) => box.height >= 44), 'coarse picker options meet the 44px target floor');
  assert.ok(coarseOptions.every((box) => box.left >= 0 && box.right <= 375), 'picker options fit the narrow viewport');
  await coarsePage.keyboard.press('Escape');
  await coarsePage.selectOption('#theme', 'light');
  await coarsePage.selectOption('#density', 'data');
  assert.equal(await coarsePage.locator('html').getAttribute('data-mob-theme'), 'light');
  assert.equal(await coarsePage.locator('#content').getAttribute('data-mob-density'), 'data');
  const overflow = await coarsePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 0, `starter must not overflow a 375px viewport (overflow ${overflow}px)`);
  await coarsePage.fill('#name', 'x');
  await coarsePage.click('#save');
  assert.equal(await coarsePage.locator('#name').getAttribute('aria-invalid'), 'true');
  await coarsePage.fill('#name', 'Browser test');
  await coarsePage.click('#save');
  assert.equal(await coarsePage.locator('#save').getAttribute('aria-busy'), 'true');
  await coarsePage.waitForTimeout(700);
  assert.match(await coarsePage.locator('#status').innerText(), /saved/i);
  await coarse.close();

  console.log('mob-design browser checks passed');
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
