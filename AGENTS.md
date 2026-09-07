# mob-design — брифинг для агента

Этот файл целиком кладётся в контекст (≈3k токенов). Остальные доки — по требованию,
по одному, под конкретную задачу. Не читай `docs/` целиком: там ~119k токенов.

Система подключена. Пиши разметку под неё, а не свой CSS.

---

## Железные правила

1. **Не пиши цвета.** Никаких hex, `rgb()`, `hsl()` в коде проекта. Только `var(--mob-*)`.
   Нужен оттенок, которого нет — `color-mix(in oklab, var(--mob-accent) 14%, var(--mob-bg-canvas))`.
2. **Не пиши размеры «на глаз».** font-size, radius, duration, z-index, отступы — только токены.
3. **Не создавай новый компонент, если есть класс.** Сначала проверь: `grep -r "mob-<что-то>" mob-design/css/components/`.
4. **Не трогай примитивы** (`--mob-gray-*`, `--mob-violet-*`, `--mob-green-*` и т.п.) в коде.
   Они существуют только внутри токен-слоя. Использование примитива ломает light mode.
   В компонентах — только семантические токены (`--mob-bg-surface`, `--mob-fg-primary`, …).
5. **Состояния — не классы.** Никаких `.is-active`. Используй нативное и атрибуты:
   `:hover`, `:focus-visible`, `:disabled`, `[aria-current]`, `[aria-selected]`, `[aria-expanded]`,
   `data-mob-selected`, `data-mob-loading`, `data-mob-invalid`, `data-mob-open`, `data-mob-sign`.
6. **Анимируй только `transform` и `opacity`.** Никогда width/height/top/left/margin.
   Никакого сдвига макета на hover. Нажатие — `scale(var(--mob-press-scale))`.
7. **`:focus-visible` обязателен** у всего интерактивного. Прототип его не имел — система имеет.
8. **Кнопка — это `<button>`, ссылка — `<a>`.** Иконочная кнопка обязана иметь `aria-label`.

---

## Что подключить

```css
@layer mob, app;
@import url('mob-design/css/mob.css') layer(mob);
```

```html
<html data-mob-theme="dark" data-mob-density="product">
```

`data-mob-density` — `marketing` | `product` | `data`. Двигает ритм секций и паддинги карточек,
**не** трогает геометрию контролов. Ставится на любой контейнер, не только на `<html>`.

Опционально, после `mob.css`: `css/brand.css` (ребренд одним hex через `--mob-brand`),
`css/a11y.css` (AA-хардening, включается `data-mob-a11y="AA"`).

Шрифты подключаешь сам: IBM Plex Mono 400/500/600 + системный sans.

---

## Типографика — главное правило системы

Две гарнитуры по роли, не по вкусу:

- **Mono** — каждое число, лейбл контрола, тег, таймстемп, адрес, метаданные. Это дефолт `<body>`.
- **Sans 600 / -0.02em** — заголовки от 14px, и **цифры от 22px**.

Перелом у цифр: **до 16px включительно — mono, от 22px — sans.** 16px метрика остаётся mono,
чтобы выравниваться в колонке; 22px становится sans, потому что читается как заголовок.

Классы ролей (из `base.css`, не выдумывай размеры):

```
.mob-display-xl/-lg/-md   .mob-heading-xl/-lg/-md/-sm   .mob-title
.mob-figure-xl/-lg/-md    .mob-figure-sm (mono!)
.mob-body-lg/.mob-body/.mob-body-sm
.mob-value .mob-value-sm .mob-meta .mob-meta-sm .mob-dim .mob-label
.mob-tone-primary/-secondary/-muted/-label/-dim/-accent/-positive/-negative/-warning/-info
```

Знаковые числа: `<span data-mob-sign="positive|negative|neutral">` — тон привязан к данным.

---

## Карта классов (606 всего; здесь — рабочий минимум)

**Каркас** `.mob-page` `.mob-shell` `.mob-rail` `.mob-main` `.mob-column-header`
`.mob-stack` `.mob-cluster` `.mob-grid` `.mob-section` `.mob-divider`

**Контролы** `.mob-btn` + `--primary|--secondary|--ghost|--quiet|--affirm|--destroy|--danger`,
размеры `--sm|--lg` (голый = M), `--block` `--pill` · `.mob-icon-btn` · `.mob-btn-group`

> `--destroy` — приглушённая деструктивная кнопка **в строке** (Close/Remove).
> `--danger` — громкая, для подтверждения в модалке. Не путай.
> `--affirm` — приглушённая «забрать деньги» (Claim/Collect).

**Формы** `.mob-field` (обёртка) `.mob-input` `.mob-textarea` `.mob-select` `.mob-search`
`.mob-checkbox` `.mob-radio` `.mob-toggle` `.mob-segmented-control` `.mob-kbd`

**Поверхности** `.mob-card` + `--interactive|--selected|--featured|--sunken|--dashed|--flush|--pad-sm|--pad-lg`
`.mob-list-row` `.mob-avatar` `.mob-avatar-stack` `.mob-chip` + `--accent|--positive|--negative|--warning|--info|--sm|--solid|--removable`

**Данные** `.mob-stat` + `--sm|--lg|--xl|--positive|--negative` · `.mob-stat-pair` · `.mob-table`
`.mob-meter` `.mob-bar-stack` `.mob-spark` `.mob-delta` `.mob-legend` `.mob-progress`

**Навигация** `.mob-navbar` `.mob-navlink` `.mob-sidebar` `.mob-tabs` `.mob-tab` `.mob-breadcrumbs`

**Слои** `.mob-tooltip` `.mob-popover` `.mob-menu` `.mob-modal` `.mob-drawer`

**Статусы** `.mob-toast` `.mob-alert` `.mob-banner` `.mob-empty` `.mob-error-state`
`.mob-skeleton` `.mob-spinner`

Активного состояния таба нет как класса — это `aria-selected="true"`.
Текущей ссылки нет как класса — это `aria-current="page"`.

---

## Фирменная конструкция: `.mob-segmented`

Слитая карточка-строка. Волосяные линии между сегментами — это **зазоры 1px**, сквозь которые
видно фон родителя, а не бордеры. Поэтому не бывает двойных линий и строка не переполняет колонку.

```html
<div class="mob-segmented">
  <div class="mob-segmented__seg" style="--mob-seg-basis:252px; --mob-seg-min:252px">…</div>
  <div class="mob-segmented__seg mob-segmented__seg--wide">…</div>
  <div class="mob-segmented__seg mob-segmented__seg--actions">…</div>
</div>
```

Следствия: на рамке не бывает padding; сегменты обязаны быть непрозрачными; `overflow:hidden`
обрезает наружные кольца фокуса. Порядок сегментов: идентичность → визуализация → метрики → действия.

---

## Куда смотреть под задачу

| Задача | Файл |
|---|---|
| Точный API компонента, все классы и состояния | `docs/02-components.md` (большой — читай нужную секцию) |
| Значение токена, контраст, шкалы | `docs/01-foundations.md` |
| Собрать экран из готовых композиций | `docs/03-patterns.md` |
| Скелет страницы под тип продукта | `docs/04-templates.md` |
| Подключение, ребренд, интеграция с фреймворком | `docs/09-adoption.md` |
| Анимации | `docs/05-motion.md` |
| Доступность | `docs/06-accessibility.md` |
| Форматирование чисел, адресов, дат | `docs/07-data-formatting.md` |
| Тексты интерфейса, ошибки, пустые состояния | `docs/08-content-style.md` |
| Что нельзя делать и почему | `docs/10-anti-patterns.md` |
| Проверка перед сдачей | `docs/12-qa-checklist.md` |

Живой стайлгайд: `showcase/index.html` (открывать через http-сервер, не `file://`).

---

## Проверка перед сдачей

```bash
# литеральные цвета в своём коде — должно быть пусто
grep -rnE '#[0-9a-fA-F]{3,8}\b|\brgb\(|\bhsl\(' src/ --include=*.css --include=*.tsx

# утечки примитивов — должно быть пусто
grep -rnE 'var\(--mob-(gray|violet|green|red|amber|blue)-' src/
```

Плюс: у каждого интерактивного элемента есть `:focus-visible`; у каждой поверхности с данными
есть состояния empty / loading / error; ничего не прыгает на hover; экран открыт на 375px без
горизонтального скролла.

**Признак готовности:** новый экран собирается из токенов, ролей типографики и существующих
классов — без единого произвольного значения. Если произвольные значения нужны постоянно —
это дыра в системе, её надо заводить как задачу, а не заинлайнивать.
