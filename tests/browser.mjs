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

const selectFixture = `<!doctype html><html data-mob-theme="dark" data-mob-density="product"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/mob.css"></head><body>
<main id="content" data-mob-density="product">
  <label class="mob-field mob-field--sm"><span class="mob-field__label">Theme</span>
    <span class="mob-input-wrap mob-input-wrap--select"><select id="theme" class="mob-select">
      <option value="dark">Dark</option><option value="light">Light</option>
    </select></span>
  </label>
  <label class="mob-field mob-field--sm"><span class="mob-field__label">Density</span>
    <span class="mob-input-wrap mob-input-wrap--select"><select id="density" class="mob-select">
      <option value="marketing">Marketing</option><option value="product" selected>Product</option><option value="data">Data</option>
    </select></span>
  </label>
  <form id="settings">
    <label class="mob-field"><span class="mob-field__label">Time zone</span>
      <span class="mob-input-wrap mob-input-wrap--select"><select id="timezone" class="mob-select" name="timezone">
        <option>Asia/Bangkok</option><option>Europe/Moscow</option><option>UTC</option>
      </select></span>
    </label>
    <button id="reset" type="reset">Reset</button>
  </form>
</main>
<script>
window.__mobSelectChanges={theme:0,density:0,timezone:0};
for(const id of Object.keys(window.__mobSelectChanges)){
  document.querySelector('#'+id).addEventListener('change',event=>{
    window.__mobSelectChanges[id]++;
    if(id==='theme')document.documentElement.dataset.mobTheme=event.target.value;
    if(id==='density'){document.documentElement.dataset.mobDensity=event.target.value;document.querySelector('#content').dataset.mobDensity=event.target.value}
  });
}
</script></body></html>`;

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
  if (url.pathname === '/__mob-browser/selects') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(selectFixture);
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
  await selectPage.goto(`${origin}/__mob-browser/selects`);
  assert.equal(await selectPage.evaluate(() => CSS.supports('appearance', 'base-select') && CSS.supports('selector(::picker(select))')), true);
  await selectPage.evaluate(() => {
    const disabledOption = document.createElement('option');
    disabledOption.value = 'unavailable';
    disabledOption.textContent = 'Unavailable region';
    disabledOption.disabled = true;
    document.querySelector('#timezone').append(disabledOption);
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

  const studioPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const studioErrors = [];
  studioPage.on('pageerror', (error) => studioErrors.push(error.message));
  studioPage.on('console', (message) => {
    if (message.type() === 'error') studioErrors.push(message.text());
  });
  await studioPage.goto(`${origin}/examples/starter/`);
  assert.equal(await studioPage.title(), 'Project overview — mob-design');
  assert.equal(await studioPage.locator('h1').innerText(), 'Project overview');
  assert.equal(await studioPage.locator('#theme').evaluate((select) => select.closest('.studio-toolbar') !== null), true);
  assert.equal(await studioPage.locator('.studio-sidebar select').count(), 0, 'appearance controls are not parked in navigation');
  assert.equal(await studioPage.locator('.studio-brand, .studio-workspace, .studio-art').count(), 0, 'starter has no invented identity or decorative mock artwork');
  assert.equal(await studioPage.locator('#project-rows tr').count(), 4);
  assert.equal(await studioPage.locator('#active-count').innerText(), '3');
  assert.equal(await studioPage.locator('#completed-count').innerText(), '1');
  assert.equal(await studioPage.locator('#nav-project-count').innerText(), '4');
  assert.equal(await studioPage.locator('#task-count').innerText(), '2 / 4');
  assert.equal(await studioPage.locator('#next-task').innerText(), 'Prepare CMS handoff notes');
  assert.equal(await studioPage.locator('#feature-progress').getAttribute('aria-valuenow'), '68');

  await studioPage.click('[data-filter="active"]');
  assert.equal(await studioPage.locator('#project-rows tr').count(), 3);
  assert.ok(await studioPage.locator('[data-filter="active"]').getAttribute('aria-pressed') === 'true');
  await studioPage.click('[data-filter="completed"]');
  assert.equal(await studioPage.locator('#project-rows tr').count(), 1);
  assert.match(await studioPage.locator('#project-rows').innerText(), /Editorial toolkit/);
  await studioPage.click('[data-filter="all"]');
  assert.equal(await studioPage.locator('#project-rows tr').count(), 4);

  await studioPage.click('#new-project');
  assert.equal(await studioPage.locator('#project-dialog').evaluate((dialog) => dialog.open), true);
  assert.equal(await studioPage.evaluate(() => document.activeElement?.id), 'project-name');
  await studioPage.click('#project-create');
  assert.equal(await studioPage.locator('#project-name').getAttribute('aria-invalid'), 'true');
  assert.equal(await studioPage.locator('#project-name-error').isVisible(), true);
  assert.equal(await studioPage.evaluate(() => document.activeElement?.id), 'project-name');
  await studioPage.fill('#project-name', 'Canceled project');
  await studioPage.click('#project-cancel');
  assert.equal(await studioPage.locator('#project-dialog').evaluate((dialog) => dialog.open), false);
  assert.equal(await studioPage.locator('#project-rows tr').count(), 4, 'cancel does not create a project');
  assert.equal(await studioPage.evaluate(() => document.activeElement?.id), 'new-project');

  await studioPage.click('#new-project');
  await studioPage.keyboard.press('Escape');
  assert.equal(await studioPage.locator('#project-dialog').evaluate((dialog) => dialog.open), false);
  assert.equal(await studioPage.evaluate(() => document.activeElement?.id), 'new-project', 'Escape restores focus to the opener');

  await studioPage.click('#new-project');
  await studioPage.fill('#project-name', 'Pending canceled project');
  await studioPage.click('#project-create');
  assert.equal(await studioPage.locator('#project-create').getAttribute('aria-busy'), 'true');
  await studioPage.click('#project-cancel');
  await studioPage.waitForTimeout(550);
  assert.equal(await studioPage.locator('#project-dialog').evaluate((dialog) => dialog.open), false);
  assert.equal(await studioPage.locator('#project-rows tr').count(), 4, 'canceling a pending creation prevents a late insert');
  assert.equal(await studioPage.locator('#active-count').innerText(), '3');
  assert.equal(await studioPage.evaluate(() => document.activeElement?.id), 'new-project');

  await studioPage.click('#new-project');
  await studioPage.fill('#project-name', 'Packaging system');
  await studioPage.selectOption('#project-type', 'Identity');
  await studioPage.fill('#project-due', '');
  await studioPage.click('#project-create');
  assert.equal(await studioPage.locator('#project-create').getAttribute('aria-busy'), 'true');
  await studioPage.waitForTimeout(550);
  assert.equal(await studioPage.locator('#project-dialog').evaluate((dialog) => dialog.open), false);
  assert.equal(await studioPage.locator('#active-count').innerText(), '4');
  assert.equal(await studioPage.locator('#completed-count').innerText(), '1');
  assert.equal(await studioPage.locator('#nav-project-count').innerText(), '5');
  assert.equal(await studioPage.locator('#project-rows tr').count(), 5);
  const createdRow = studioPage.locator('#project-rows tr').first();
  assert.match(await createdRow.innerText(), /Packaging system/);
  assert.match(await createdRow.innerText(), /No due date/);
  assert.match(await studioPage.locator('#activity-list li').first().innerText(), /created Packaging system/i);

  await studioPage.click('.studio-task:has([data-task-id="cms-notes"])');
  assert.equal(await studioPage.locator('[data-task-id="cms-notes"]').isChecked(), true);
  assert.equal(await studioPage.locator('#task-count').innerText(), '3 / 4');
  assert.equal(await studioPage.locator('#feature-progress').getAttribute('aria-valuenow'), '72');
  assert.equal(await studioPage.locator('#next-task').innerText(), 'Approve mobile art direction');
  assert.match(await studioPage.locator('#activity-list li').first().innerText(), /completed prepare cms handoff notes/i);
  await studioPage.click('.studio-task:has([data-task-id="mobile-direction"])');
  assert.equal(await studioPage.locator('#task-count').innerText(), '4 / 4');
  assert.equal(await studioPage.locator('#next-task').innerText(), 'This week’s tasks are complete');
  await studioPage.selectOption('#theme', 'light');
  await studioPage.selectOption('#density', 'data');
  assert.equal(await studioPage.locator('html').getAttribute('data-mob-theme'), 'light');
  assert.equal(await studioPage.locator('#content').getAttribute('data-mob-density'), 'data');
  assert.deepEqual(studioErrors, []);
  await studioPage.close();

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

  await coarsePage.goto(`${origin}/__mob-browser/selects`);
  await coarsePage.locator('#timezone').click();
  await coarsePage.waitForFunction(() => document.querySelector('#timezone').matches(':open'));
  const coarseOptions = await coarsePage.locator('#timezone option').evaluateAll((options) => options.map((option) => option.getBoundingClientRect().toJSON()));
  assert.ok(coarseOptions.every((box) => box.height >= 44), 'coarse picker options meet the 44px target floor');
  assert.ok(coarseOptions.every((box) => box.left >= 0 && box.right <= 375), 'picker options fit the narrow viewport');
  await coarsePage.keyboard.press('Escape');
  await coarsePage.goto(`${origin}/examples/starter/`);
  const coarseErrors = [];
  coarsePage.on('pageerror', (error) => coarseErrors.push(error.message));
  coarsePage.on('console', (message) => {
    if (message.type() === 'error') coarseErrors.push(message.text());
  });
  await coarsePage.selectOption('#theme', 'light');
  await coarsePage.selectOption('#density', 'data');
  assert.equal(await coarsePage.locator('html').getAttribute('data-mob-theme'), 'light');
  assert.equal(await coarsePage.locator('#content').getAttribute('data-mob-density'), 'data');
  const overflow = await coarsePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 0, `starter must not overflow a 375px viewport (overflow ${overflow}px)`);
  assert.ok((await coarsePage.locator('.studio-nav__link').evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height))).every((height) => height >= 44));
  await coarsePage.click('[data-filter="completed"]');
  assert.equal(await coarsePage.locator('#project-rows tr').count(), 1);
  await coarsePage.click('[data-filter="all"]');
  assert.equal(await coarsePage.locator('#project-rows tr').count(), 4);
  await coarsePage.click('#new-project');
  assert.equal(await coarsePage.locator('#project-dialog').evaluate((dialog) => dialog.open), true);
  await coarsePage.fill('#project-name', 'VeryLongProjectNameWithoutSpaces'.repeat(8));
  assert.equal((await coarsePage.locator('#project-name').inputValue()).length, 64);
  await coarsePage.click('#project-create');
  await coarsePage.waitForTimeout(550);
  assert.equal(await coarsePage.locator('#project-dialog').evaluate((dialog) => dialog.open), false);
  assert.equal(await coarsePage.evaluate(() => document.activeElement?.id), 'new-project');
  assert.equal(await coarsePage.locator('#project-rows tr').count(), 5);
  const longNameFit = await coarsePage.evaluate(() => {
    const row = document.querySelector('#project-rows tr');
    const activity = document.querySelector('#activity-list li');
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      rowRight: row.getBoundingClientRect().right,
      activityRight: activity.getBoundingClientRect().right,
      viewport: document.documentElement.clientWidth,
    };
  });
  assert.ok(longNameFit.overflow <= 0, `long project name must not create document overflow (overflow ${longNameFit.overflow}px)`);
  assert.ok(longNameFit.rowRight <= longNameFit.viewport && longNameFit.activityRight <= longNameFit.viewport, 'long project name wraps inside project and activity surfaces');
  assert.deepEqual(coarseErrors, []);
  await coarse.close();

  console.log('mob-design browser checks passed');
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
