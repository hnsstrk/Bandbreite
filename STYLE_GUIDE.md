# Bandbreite Style Guide

Dieses Dokument definiert die Design-Standards des Bandbreite-Projekts.
Grundlage ist ein **einziges Token-System** in `src/app.css`, aus dem Tailwind 4
automatisch Utilities erzeugt. Alle Komponenten halten sich daran.

---

## Inhaltsverzeichnis

1. [Grundprinzipien](#grundprinzipien)
2. [Design-Tokens](#design-tokens)
3. [Theme und Dark-Mode](#theme-und-dark-mode)
4. [Layout-Klassen](#layout-klassen)
5. [Fokus und Accessibility](#fokus-und-accessibility)
6. [Komponentenbibliothek](#komponentenbibliothek)
7. [Chart-Standards](#chart-standards)
8. [Zahlenformat](#zahlenformat)
9. [UTF-8 Richtlinien](#utf-8-richtlinien)
10. [Do's and Don'ts](#dos-and-donts)
11. [Checkliste für neue Komponenten](#checkliste-für-neue-komponenten)

---

## Grundprinzipien

1. **Eine Quelle der Wahrheit.** Farben, Radien, Schatten und Breiten stehen im
   `@theme`-Block von `src/app.css`. Sie sind gleichzeitig CSS-Variable
   (`var(--color-surface)`) **und** Tailwind-Utility (`bg-surface`).
2. **Keine Hex-Farben in Komponenten.** Weder in `<style>` noch in `style=""`
   noch in TypeScript-Farbtabellen. Stattdessen `var(--color-…)`.
3. **Keine Rohpaletten-Utilities.** `bg-slate-700`, `text-blue-500`,
   `dark:text-amber-400` sind verboten — sie kennen das Theme nicht.
4. **Umlaute sind Pflicht** in UI-Texten und Kommentaren; Verzeichnis- und
   Dateinamen bleiben ohne.
5. **Keine Emoji als Icons.** Alle Symbole kommen aus `Icon.svelte`.

---

## Zielbild: Datenblatt (verbindlich seit Bericht 71)

Der Besitzer hat entschieden: **„Schlichtes Design. Nutzung der gesamten
Breite. Für alle Seiten."** — Stilrichtung: *technisch, wie ein Datenblatt*.
Daraus folgen sieben Regeln, die jeder neuen Komponente vorgehen:

1. **Volle Breite überall.** `main`, Kopfbereich, Brotkrümel, Fuß und
   Lernpfad-Leiste nutzen die Viewportbreite; einziger Rand ist
   `--page-gutter` = `0.75rem`. Es gibt **keine** `max-width` mehr —
   `--container-prose|page|wide` stehen auf `none`. Auch Fließtext hat keine
   Lesebreite: `ArticleLayout` und `.prose` füllen die Spalte neben dem
   Inhaltsverzeichnis (13 rem). Dass lange Zeilen die Lesbarkeit mindern, ist
   bekannt und ausdrücklich so entschieden.
2. **Kein Schatten.** Alle `--shadow-*` stehen auf `none`. Tiefe entsteht
   ausschließlich durch 1-px-Linien in `--color-line`.
3. **Eckenradius 2 px** (`--radius-sm|md`, `--radius-control`), **höchstens
   4 px** (`--radius-lg|xl`, `--radius-card`). `--radius-pill` bleibt nur für
   runde Punkte und Reglergriffe.
4. **Flächen sind `--color-surface` oder `--color-bg`** — keine getönten
   Semantikflächen. Semantik trägt die Textfarbe oder eine 2-px-Kante.
5. **Ein Akzentblau** (`--color-brand`) für Links und aktive Zustände, sonst
   Grau- und Schwarztöne. Diagramm- und Bandfarben bleiben unverändert.
6. **Enge Abstände:** `--spacing-xl` `1.25rem`, `--spacing-2xl` `1.5rem`,
   Abschnittsabstand in Seiten `1rem`.
7. **Weniger Fettdruck:** `semibold` statt `bold`; `h1` `1.5rem`,
   `h2` `1.25rem`, `h3` `1.05rem`, Body `0.9375rem`.

Der Dunkelmodus folgt denselben Regeln — nur die Farben wechseln.

### Migrationsregeln (alt → neu)

| Alt | Neu |
| --- | --- |
| `bg-slate-700` / `bg-slate-800` | `bg-elevated` / `bg-surface` |
| `text-slate-400` | `text-ink-subtle` |
| `text-slate-300` | `text-ink-muted` |
| `hover:bg-slate-600` | `hover:bg-hover` |
| `text-blue-500 dark:text-blue-400` | `text-brand` |
| `bg-blue-600 text-white` | `bg-brand text-brand-on` |
| `bg-amber-100 … text-amber-600` | `bg-warning-soft text-warning-ink` |
| `#3b82f6` in Charts | `var(--color-series-1)` |
| `#fbbf24` als Marker | `var(--color-marker)` |

---

## Design-Tokens

Alle Tokens stehen in `src/app.css` im Block `@theme static { … }`.
Die alten Namen (`--color-bg-surface`, `--color-text-primary`, `--color-chart-blue`, …)
existieren weiterhin als **Aliase** im nachfolgenden `:root`-Block, damit
bestehende Komponenten unverändert funktionieren. Für **neuen** Code gelten die
Namen aus den Tabellen unten.

### Flächen

| Token | Utility | Light | Dark | Verwendung |
| --- | --- | --- | --- | --- |
| `--color-base` | `bg-base` | `#f8fafc` | `#0f172a` | Seitenhintergrund |
| `--color-surface` | `bg-surface` | `#ffffff` | `#1e293b` | umrandete Flächen (Karten, Panels, Kopf- und Pfadleiste) |
| `--color-elevated` | `bg-elevated` | `#f1f5f9` | `#334155` | Erhöhte Flächen, Chips |
| `--color-sunken` | `bg-sunken` | `#f1f5f9` | `#1e293b` | Formel- und Ergebnisboxen |
| `--color-input` | `bg-input` | `#ffffff` | `#334155` | Eingabefelder |
| `--color-hover` | `bg-hover` | `#e2e8f0` | `#475569` | Interaktive Hover-Fläche |
| `--color-overlay` | `bg-overlay` | `#ffffff` | `#1e293b` | Menüs, Popover |

### Text

| Token | Utility | Light | Dark | Kontrast (Light auf `surface`) |
| --- | --- | --- | --- | --- |
| `--color-ink` | `text-ink` | `#0f172a` | `#f1f5f9` | 17,9:1 |
| `--color-ink-muted` | `text-ink-muted` | `#475569` | `#cbd5e1` | 7,5:1 |
| `--color-ink-subtle` | `text-ink-subtle` | `#64748b` | `#94a3b8` | 4,8:1 |
| `--color-ink-faint` | `text-ink-faint` | `#6b7a90` | `#8496ae` | 4,5:1 |
| `--color-ink-inverse` | `text-ink-inverse` | `#ffffff` | `#0f172a` | – |

`--color-ink-faint` ersetzt das alte `#94a3b8` (2,56:1 → Fail) und wird
auch für `::placeholder` verwendet.

### Rahmen

| Token | Utility | Light | Dark | Verwendung |
| --- | --- | --- | --- | --- |
| `--color-line` | `border-line` | `#cbd5e1` | `#3f4f68` | Standardrahmen |
| `--color-line-subtle` | `border-line-subtle` | `#e2e8f0` | `#1e293b` | Trennlinien |
| `--color-line-strong` | `border-line-strong` | `#94a3b8` | `#64748b` | Rahmen von Bedienelementen (3:1) |
| `--color-focus-ring` | – | `#1d4ed8` | `#93c5fd` | Fokusring |

Bedienelemente (Input, Select, Button-Outline) verwenden `--color-line-strong`,
weil WCAG 1.4.11 für UI-Grenzen 3:1 fordert.

### Marke und Semantik

Jede semantische Rolle hat drei Töne: `X` (gefüllte Fläche/Indikator),
`X-soft` (weiche Fläche) und `X-ink` (Schrift auf `X-soft` **und** auf `surface`).
Alle `-ink`-auf-`-soft`-Paarungen liegen über 8:1.

| Rolle | Solid | Soft | Ink |
| --- | --- | --- | --- |
| Marke | `--color-brand` | `--color-brand-soft` | `--color-brand-ink` |
| Erfolg | `--color-success` | `--color-success-soft` | `--color-success-ink` |
| Warnung | `--color-warning` | `--color-warning-soft` | `--color-warning-ink` |
| Fehler | `--color-danger` | `--color-danger-soft` | `--color-danger-ink` |
| Info | `--color-info` | `--color-info-soft` | `--color-info-ink` |
| Neutral | – | `--color-neutral-soft` | `--color-neutral-ink` |

Ergänzend: `--color-brand-hover`, `--color-brand-on` (Schrift auf Markenfläche),
`--color-on-solid` (Schrift auf jeder gefüllten Semantikfläche) und
`--color-accent-primary-alpha` (transparenter Markenton).

### Datenserien

| Token | Farbe | Typische Verwendung |
| --- | --- | --- |
| `--color-series-1` | `#3b82f6` | Primärdaten, Sauerstoff |
| `--color-series-2` | `#22c55e` | Sekundärdaten, Wasserdampf |
| `--color-series-3` | `#f97316` | Summen, Highlights |
| `--color-series-4` | `#a855f7` | Tertiärdaten, Nebel |
| `--color-series-5` | `#06b6d4` | Regen |
| `--color-series-6` | `#ef4444` | Kritische Werte |
| `--color-series-7` | `#eab308` | Fünfte Serie |
| `--color-series-8` | `#94a3b8` | Deaktiviert, Schnee |
| `--color-series-9` | `#ec4899` | Sechste Serie |
| `--color-marker` | `#fbbf24` | Aktueller Arbeitspunkt |
| `--color-grid` / `--color-axis` | themenabhängig | Gitter und Achsen |

Für **Flächen mit heller Schrift** existiert zu jeder Serie eine gesättigte
Variante `--color-series-N-solid` (z. B. `#2563eb` statt `#3b82f6`).
Für **Beschriftungen neben einer Serienfarbe** gibt es themenbewusste
Kategorie-Textfarben: `--color-cat-blue`, `--color-cat-green`,
`--color-cat-orange`, `--color-cat-violet`, `--color-cat-pink`,
`--color-cat-cyan`, `--color-cat-red` (alle ≥ 4,5:1 auf Fläche, hell und dunkel).

### Typografie, Radien, Schatten, Breiten

| Token | Wert | Verwendung |
| --- | --- | --- |
| `--font-sans` | System-Stack | Fließtext und UI |
| `--font-mono` | `ui-monospace, …` | Formeln, Messwerte, Zahlenfelder |
| `--text-2xs` | `0.6875rem` | Chart- und Achsenbeschriftung |
| `--radius-control` | `0.125rem` | Buttons, Inputs, Chips (2 px) |
| `--radius-card` | `0.25rem` | Karten (4 px) |
| `--radius-pill` | `9999px` | **nur** runde Punkte und Reglergriffe |
| `--shadow-card` | `none` | — es gibt keine Schatten |
| `--shadow-popover` | `none` | — Menüs und Overlays tragen einen 1-px-Rahmen |
| `--container-prose` | `none` | **nicht mehr verwendet** — keine Lesebreite |
| `--container-page` | `none` | **nicht mehr verwendet** — keine Seitenbreite |
| `--container-wide` | `none` | **nicht mehr verwendet** — keine Bühnenbreite |

Die drei `--container-*`-Tokens stehen nur noch als `none` im Theme, damit alter
Code nicht bricht; **keine Komponente liest sie**. Neuer Code setzt keine
`max-width` — die Breite regelt allein `--page-gutter`.

Weiter im `:root`-Block: `--shadow-sm|md|lg` = `none`;
`--radius-sm|md` = `0.125rem`, `--radius-lg|xl` = `0.25rem`;
`--spacing-md|lg|xl|2xl` = `0.75|1|1.25|1.5rem`;
`--font-size-xs|sm|base|lg|xl|2xl|3xl` = `0.75|0.875|0.9375|1.05|1.125|1.25|1.5rem`;
`--page-gutter` = `0.75rem` auf **allen** Breiten.

---

## Theme und Dark-Mode

### Bindung an die Klasse

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Ohne diese Zeile reagieren in Tailwind 4 **alle** `dark:`-Utilities auf
`prefers-color-scheme` statt auf den Umschalter. Sie steht in `app.css`
direkt nach dem Tailwind-Import.

### Anti-FOUC

`src/app.html` enthält vor `%sveltekit.head%` ein blockierendes Inline-Skript,
das `.dark` und `color-scheme` setzt, bevor gerendert wird. Am `<html>`-Element
steht **keine** feste `class="dark"` mehr.

### Drei Zustände, eine Schaltfläche

`ThemeToggle.svelte` ist **eine** Icon-Schaltfläche, die reihum weiterschaltet:
hell → dunkel → System → hell. Das Icon zeigt den aktuellen Zustand,
`aria-label` und `title` nennen ihn samt dem Ziel des nächsten Klicks.
Gespeichert wird unter `localStorage['theme']` als
`'light' | 'dark' | 'system'`. Bei `'system'` folgt die Anzeige der
Systemeinstellung live (`matchMedia`-Listener).

### `color-scheme`

`:root { color-scheme: light }` und `.dark { color-scheme: dark }` sorgen dafür,
dass native Widgets (Select-Popup, Number-Spinner, Scrollbar, Autofill) das
richtige Schema verwenden.

---

## Layout-Klassen

| Klasse | Wirkung |
| --- | --- |
| `.page-container` | **nicht mehr verwendet** (keine Fundstelle in `src/`). Bleibt als Andockpunkt in `app.css`: volle Breite, seitliches Padding `--page-gutter`, keine `max-width`, keine Zentrierung. Neuer Code braucht sie nicht — `main` setzt den Rand bereits; verschachtelt verdoppelt sie ihn. |
| `.page-container--wide` | **nicht mehr verwendet**; deckungsgleicher Alias |
| `.prose` | Typografie für `h2`–`h4`, `p`, Listen, Tabellen, `code`, `pre`, `blockquote` — **ohne** Lesebreite |
| `.bleed` | **nicht mehr verwendet**, wirkungsneutral (`width: 100%`); früher der Ausbruch aus der Lesebreite |
| `.card` / `.card-compact` | 1-px-Linie, 4 px Radius, `0.75rem` Polster, kein Schatten. Verschachtelte Karten (`.card .card`, `.ui-card .ui-card`) rendern flach: ohne Rahmen, ohne Polster. |
| `.table-scroll` | horizontaler Scroll-Container für breite Tabellen |
| `.chart-container` | Scroll-Container für Diagramme; die Mindestbreite liegt am **inneren** Element |

```svelte
<div class="prose">
  <p>Fließtext über die volle Spaltenbreite …</p>
</div>
```

**Overflow-Regel:** Überbreite Inhalte scrollen in ihrem eigenen Container,
niemals die Seite. `min-width` gehört an das SVG bzw. an `.chart-inner`,
nicht an den Scroll-Container.

### Kopf, Brotkrümel, Fuß

| Baustein | Regel |
| --- | --- |
| `Header` | Höhe ≤ 3 rem (gemessen 45 px), kein Blur, kein Schatten, nur 1-px-Unterlinie. Inhalt über die volle Breite, Rand `--page-gutter`. Aktive Gruppe = Akzentfarbe plus 2-px-Unterstrich. |
| `SearchTrigger` | schlichtes Feld mit 1-px-Rahmen. Beschriftung und `<kbd>Strg K</kbd>` nur bei `@media (hover: hover) and (min-width: 64rem)`; sonst reine Icon-Schaltfläche. |
| `MegaMenu` | flach, 1-px-Rahmen, 2 px Radius. Nur Links, **keine** Beschreibungstexte, **keine** Hub-Übersichtszeile. |
| `Breadcrumb` | eine Textzeile direkt unter dem Kopf, ohne Hintergrundleiste, `0.25rem` Polster vertikal. |
| `LearningPathBar` | volle Breite, `--color-surface`, klebt bei `top: 2.875rem` unter dem Kopf. |
| `Footer` | eine Zeile, `--font-size-xs`, 1-px-Oberlinie. |

---

## Fokus und Accessibility

- Es gibt **genau einen** Fokusring, global definiert:
  `:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px }`.
- `outline: none` und `focus:outline-none` sind verboten. Wer den Ring
  unterdrücken will, nutzt `:focus:not(:focus-visible)` — das steht bereits global.
- Jedes interaktive Element ist per Tastatur erreichbar und hat ein Label
  (`aria-label` oder ein verbundenes `<label for>`).
- Umschalter tragen `aria-pressed`, Reiter das vollständige Tabs-Muster,
  Diagramme `role="img"` plus `aria-label` und eine `sr-only`-Datentabelle.
- `prefers-reduced-motion` schaltet Transitions und Animationen global ab;
  JS-Animationen (`requestAnimationFrame`) müssen das zusätzlich selbst prüfen.

---

## Komponentenbibliothek

Alle Komponenten liegen in `src/lib/components/ui/` (Ausnahmen: `ChartFrame`
unter `charts/`, `HubList` unter `portal/`, `Panel` unter `funk/`), nutzen
Svelte-5-Runes, `$props()`, `$bindable()` und Snippets statt Slots. Jede
akzeptiert ein `class`-Passthrough.

### Icon

Strichzeichnungen aus dem Katalog `icons.ts` (32 Icons, 24×24, `currentColor`).

| Prop | Typ | Standard | Bedeutung |
| --- | --- | --- | --- |
| `name` | `IconName` | – | Katalogname (Pflicht) |
| `size` | `number` | `20` | Kantenlänge in px |
| `label` | `string` | – | Textalternative; ohne sie ist das Icon `aria-hidden` |
| `strokeWidth` | `number` | `1.75` | Strichstärke |

```svelte
<Icon name="antenna" size={18} />
<Icon name="warning" label="Warnung" />
```

Katalog: `search menu close chevron-down chevron-right chevron-left arrow-right
external sun moon monitor calculator radio book database wave antenna satellite
signal spectrum globe info warning check copy share reset filter sliders clock
play pause`.

### Button

| Prop | Typ | Standard |
| --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'secondary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `href` | `string` | – (rendert `<a>` statt `<button>`) |
| `icon` / `iconEnd` | `IconName` | – |
| `iconOnly` | `boolean` | `false` (dann ist `label` Pflicht) |
| `loading` / `disabled` / `fullWidth` | `boolean` | `false` |
| `pressed` | `boolean` | – (setzt `aria-pressed`) |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |
| `label` / `title` | `string` | – |
| `onclick` | `(e: MouseEvent) => void` | – |

```svelte
<Button variant="primary" icon="calculator" onclick={berechnen}>Berechnen</Button>
<Button href="/rechner/fspl/" iconEnd="arrow-right">Zum Rechner</Button>
<Button iconOnly icon="reset" label="Zurücksetzen" variant="ghost" />
```

### Badge

Text in `--color-ink-muted` mit 1-px-Rahmen — **keine** Farbflächen.
`variant` (`soft|solid|outline`) bleibt als Prop gültig, sieht aber überall
gleich aus; die Semantik trägt allein die Textfarbe.

| Prop | Typ | Standard |
| --- | --- | --- |
| `tone` | `'neutral' \| 'brand' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` |
| `variant` | `'soft' \| 'solid' \| 'outline'` | `'soft'` |
| `size` | `'sm' \| 'md'` | `'sm'` |
| `dot` | `boolean` | `false` |
| `icon` | `IconName` | – |
| `srPrefix` | `string` | – (nur vorgelesene Erläuterung) |

```svelte
<Badge tone="success" dot srPrefix="Status">Aktiv</Badge>
```

### Card

1-px-Rahmen, 4 px Radius, `0.75rem` Polster, kein Schatten, kein Anheben beim
Überfahren. `padding` (`sm|md|lg`) unterscheidet nur noch `0.5rem` von
`0.75rem`; `none` bleibt. `tone` `sunken` und `outline` rendern gleich
(transparent mit Linie). Eine Karte in einer Karte rendert flach.

| Prop | Typ | Standard |
| --- | --- | --- |
| `title` / `subtitle` | `string` | – |
| `level` | `2 \| 3 \| 4` | `2` |
| `tone` | `'default' \| 'sunken' \| 'outline'` | `'default'` |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` |
| `href` | `string` | – (macht die ganze Karte zum Link) |
| `icon` | `IconName` | – |
| `muted` | `boolean` | `false` |
| `actions` / `header` / `footer` | `Snippet` | – |

```svelte
<Card title="Freiraumdämpfung" subtitle="Friis-Gleichung" icon="wave">
  {#snippet actions()}<Button size="sm" icon="share" iconOnly label="Teilen" />{/snippet}
  <p>Inhalt …</p>
  {#snippet footer()}Quelle: ITU-R P.525{/snippet}
</Card>

<Card href="/rechner/radar/" title="Radar-Reichweite" icon="radio">
  Reichweite aus Sendeleistung, Gewinn und Rückstreuquerschnitt.
</Card>
```

### SectionHeader

Erzwingt die Überschriftenhierarchie und liefert Anker-IDs für das
Inhaltsverzeichnis.

| Prop | Typ | Standard |
| --- | --- | --- |
| `title` | `string` | – |
| `level` | `2 \| 3` | `2` |
| `id` | `string` | aus `title` abgeleitet (`slugify`) |
| `eyebrow` / `description` | `string` | – |
| `anchor` | `boolean` | `true` |
| `actions` | `Snippet` | – |

```svelte
<SectionHeader title="Atmosphärische Fenster" level={2} eyebrow="Ausbreitung" />
```

### Callout

Linke 2-px-Linie in der Semantikfarbe, **kein** Hintergrund,
Polster `0.5rem 0.75rem`.

| Prop | Typ | Standard |
| --- | --- | --- |
| `tone` | `'info' \| 'warning' \| 'tip' \| 'formula'` | `'info'` |
| `title` | `string` | – |
| `source` | `string` | – |
| `collapsible` | `boolean` | `false` |
| `open` | `boolean` (`$bindable`) | `true` |

```svelte
<Callout tone="warning" title="Mehrdeutigkeit">
  Die Zielentfernung überschreitet die eindeutige Maximalreichweite.
</Callout>
```

### Select

| Prop | Typ | Standard |
| --- | --- | --- |
| `label` | `string` | – |
| `value` | `string` (`$bindable`) | – |
| `options` | `{ value, label, group?, disabled? }[]` | – |
| `placeholder` | `string` | – |
| `size` | `'sm' \| 'md'` | `'md'` |
| `hint` / `error` | `string` | – |
| `inline` | `boolean` | `false` |
| `onchange` | `(value: string) => void` | – |

```svelte
<Select label="Einheit" bind:value={einheit} options={EINHEITEN} />
```

### Slider

| Prop | Typ | Standard |
| --- | --- | --- |
| `label` | `string` | – |
| `value` | `number` (`$bindable`) | – |
| `min` / `max` | `number` | – |
| `step` | `number \| 'any'` | `'any'` |
| `scale` | `'linear' \| 'log'` | `'linear'` |
| `format` | `(v: number) => string` | Rundung auf 3 Stellen |
| `ticks` | `{ at, label }[]` | `[]` |
| `unitSymbol` | `string` | – |
| `hideLabel` | `boolean` | `false` |

```svelte
<Slider label="Frequenz" bind:value={f} min={1e3} max={3e11}
        scale="log" format={formatFrequency} unitSymbol="Hz" />
```

### NumberInput

Zahlenfeld mit Einheitenauswahl, optionalem Regler und Presets.
`value` ist **immer** der Wert in der Basiseinheit.

| Prop | Typ | Standard |
| --- | --- | --- |
| `label` | `string` | – |
| `value` | `number` (`$bindable`) | – |
| `unit` | `string` (`$bindable`) | erste Einheit |
| `units` | `UnitOption[]` (`{ id, symbol, factor }`) | `[]` |
| `min` / `max` | `number` | – |
| `step` | `number \| 'any'` | `'any'` |
| `slider` | `boolean` | `false` |
| `sliderScale` | `'linear' \| 'log'` | `'linear'` |
| `presets` | `{ label, value, hint? }[]` | `[]` |
| `hint` / `error` | `string` | – |
| `onchange` | `(value: number) => void` | – |

```svelte
<NumberInput label="Frequenz" bind:value={frequenzHz} bind:unit={einheit}
             units={FREQUENZ_EINHEITEN} min={1e3} max={3e11}
             slider sliderScale="log"
             presets={[{ label: '2,4 GHz', value: 2.4e9 }]} />
```

Die Rechenlogik (Reglerabbildung, Begrenzung, Umrechnung, Validierung) liegt in
`numberInput.svelte.ts` und ist in `src/tests/ui-numberInput.test.ts` getestet.

### Tabs

Vollständiges WAI-ARIA-Tabs-Muster mit Roving Tabindex, Pfeiltasten sowie
Pos1/Ende. Es gibt nur noch die **Unterstrich**-Darstellung; `variant="pill"`
bleibt als Prop gültig, rendert aber keine Pillen mehr.

| Prop | Typ | Standard |
| --- | --- | --- |
| `tabs` | `{ id, label, icon?, badge?, disabled? }[]` | – |
| `active` | `string` (`$bindable`) | – |
| `variant` | `'underline' \| 'pill'` | `'underline'` |
| `label` | `string` | `'Bereiche'` |
| `panel` | `Snippet<[string]>` | – |

```svelte
<Tabs tabs={REITER} bind:active label="Werkzeuge">
  {#snippet panel(id)}
    {#if id === 'frequenz'}<FrequencyConverter />{/if}
  {/snippet}
</Tabs>
```

### ResultCard

1-px-Rahmen mit farbiger 2-px-Kante links, keine Fläche; Wert `1.25rem`
(`--font-size-2xl`), Beschriftung klein. `emphasis="hero"` vergrößert nicht
mehr.

| Prop | Typ | Standard |
| --- | --- | --- |
| `label` | `string` | – |
| `value` | `string \| number` | – |
| `unit` / `secondary` / `hint` | `string` | – |
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` |
| `emphasis` | `'hero' \| 'normal'` | `'normal'` |
| `copyable` | `boolean` | `true` |

```svelte
<ResultCard label="FSPL" value="92,4" unit="dB" secondary="bei 2,4 GHz / 1 km" />
```

### RelatedLinks

Eine Zeile Überschrift plus Linkliste mit Trennlinien — **keine** Karten.
`layout` und `columns` bleiben als Props gültig, wirken aber nicht mehr.
`RelatedTopics` (Registry-getrieben) rendert nach demselben Muster.

| Prop | Typ | Standard |
| --- | --- | --- |
| `items` | `{ href, label, description?, icon? }[]` | – |
| `title` | `string` | `'Weiterführend'` |
| `level` | `2 \| 3` | `2` |
| `layout` | `'grid' \| 'list'` | `'grid'` |
| `columns` | `1 \| 2 \| 3` | `2` |

Externe Ziele (`http(s)://`) erhalten automatisch `target="_blank"`,
`rel="noopener noreferrer"` und einen Hinweis für Screenreader.

### PageHero

Seitenkopf **ohne** Breadcrumb — die Brotkrumen liegen im Layout darüber.
Gerendert werden nur noch `h1` (1,5 rem, semibold), eine Zeile `lead` und
`meta` als kleine Textzeile („Quelle: … · Gültig: …"). **Icon-Kachel, Kicker,
Etikett und Aktionen erscheinen nicht mehr** — die Props bleiben aus
Kompatibilität gültig und laufen wirkungslos mit. Abstand nach unten
`0.75rem`.

| Prop | Typ | Standard | Wirkung |
| --- | --- | --- | --- |
| `title` | `string` | – | `h1` |
| `lead` | `string` | – | eine Zeile Normaltext, `--color-ink-muted` |
| `meta` | `{ label, value }[]` | `[]` | eine kleine Textzeile, mit `·` verbunden |
| `kicker` / `badge` / `badgeTone` / `icon` / `children` | – | – | ohne Wirkung |

```svelte
<PageHero
  title="Freiraumdämpfung"
  lead="Dämpfung einer Funkstrecke im freien Raum."
  meta={[{ label: 'Quelle', value: 'ITU-R P.525' }]}
/>
```

### TableOfContents

| Prop | Typ | Standard |
| --- | --- | --- |
| `items` | `{ id, label, level: 2 \| 3 }[]` | – |
| `title` | `string` | `'Auf dieser Seite'` |
| `sticky` | `boolean` | `true` |
| `compactBelow` | `number` | `1280` (darunter als `<details>`) |

Reine Textliste ohne Rahmen und ohne Balken; der aktive Eintrag wird nur durch
die Akzentfarbe markiert. Scroll-Spy per `IntersectionObserver`; der aktive
Eintrag trägt `aria-current="location"`. Spaltenbreite im `ArticleLayout`:
13 rem.

### LearningGoals

Kompakte Aufzählung unter der Überschrift „Lernziele" — kein Kasten, keine
Fläche, keine Häkchen-Icons.

| Prop | Typ | Standard |
| --- | --- | --- |
| `goals` | `string[]` | – |
| `title` | `string` | `'Lernziele'` |
| `level` | `2 \| 3` | `2` |

### FormulaBlock

Ohne zusätzliche Abhängigkeit: entweder fertiges **MathML** oder
**Unicode-Klartext**.

| Prop | Typ | Bedeutung |
| --- | --- | --- |
| `math` | `string` | MathML-Markup (nur aus Projektcode, wird per `{@html}` eingefügt) |
| `formula` | `string` | Klartextformel als Alternative |
| `alt` | `string` | gesprochene Fassung (bei `math` verpflichtend) |
| `label` | `string` | Bildunterschrift |
| `number` | `string` | Formelnummer, z. B. `(1)` |
| `variables` | `{ symbol, meaning, unit? }[]` | Legende der Formelzeichen |

```svelte
<FormulaBlock
  formula="λ = c / f"
  alt="Lambda gleich c geteilt durch f"
  label="Wellenlänge"
  variables={[
    { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
    { symbol: 'c', meaning: 'Lichtgeschwindigkeit', unit: 'm/s' },
    { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' }
  ]} />
```

### ChartFrame (`components/charts/`)

Keine äußere Karte: der Titel steht als kleine Caption (`--font-size-xs`,
semibold, `--color-ink-subtle`) über dem Diagramm, der 1-px-Rahmen liegt allein
um die Zeichenfläche (`.ui-chart__scroller`). `WidgetFrame` und `ArticleLayout`
folgen demselben Muster; `ArticlePagination` rendert Prev/Next als schlichte
Textlinks.

Gemeinsamer Rahmen für alle Diagramme.

| Prop | Typ | Standard |
| --- | --- | --- |
| `title` | `string` | – |
| `level` | `2 \| 3 \| 4` | `3` |
| `description` | `string` | – (Pflicht, wird `aria-label`) |
| `width` | `number` (`$bindable`) | `0` — per `ResizeObserver` gemessen |
| `minWidth` | `number` | `500` |
| `legend` / `dataTable` / `actions` | `Snippet` | – |
| `footnote` | `string` | – |

```svelte
<ChartFrame bind:width title="Atmosphärische Dämpfung"
            description="Dämpfung in dB pro Kilometer über der Frequenz"
            footnote="Nach ITU-R P.676-13">
  {#snippet legend()}<Badge tone="info" dot>Sauerstoff</Badge>{/snippet}
  <svg viewBox="0 0 {width} 400">…</svg>
  {#snippet dataTable()}<table>…</table>{/snippet}
</ChartFrame>
```

### GlossaryTerm (`components/ui/`)

Verweist auf einen Begriff aus `data/glossary.ts`: sichtbarer Text mit
gepunkteter Unterlinie, Kurzdefinition als `title`, Ziel
`/wissen/glossar/?q=<Begriff>#<id>`. Angelegt, aber bewusst noch in keinem
Kapitel eingebaut — vor dem ersten Einsatz prüfen, dass der Fließtext nicht zur
Linkwüste wird.

| Prop | Typ | Bedeutung |
| --- | --- | --- |
| `id` | `string` | ID des Glossareintrags |
| `label` | `string` | abweichender Anzeigetext (Standard: der Begriff selbst) |

### Portal- und Hub-Bausteine (`components/portal/`)

Auf der Startseite und in allen Hubs verwendet, alle unter 120 Zeilen und ohne
eigene Farben. Es gibt **keine Kacheln mehr** — jede dieser Komponenten rendert
eine dichte Liste über die volle Breite, gegliedert durch 1-px-Trennlinien:

| Komponente | Zweck |
| --- | --- |
| `PortalSearch.svelte` | Suchfeld über die volle Breite; öffnet über `layout/searchDialog.svelte.ts` dieselbe Command-Palette wie Lupe und `Strg + K` |
| `PortalAreas.svelte` | die fünf Bereiche aus `NAV_GROUPS` als Zeilen: Bereichsname links, Direkteinstiege punktgetrennt daneben |
| `PortalTiles.svelte` | Definitionsliste („Interaktiv lernen", „Werkzeuge"), ab 64 rem zweispaltig, Daten aus `portalContent.ts` |
| `PortalLearningPaths.svelte` | Lernpfade als Liste: Stufe, Schrittzahl und Dauer in einer Zeile |
| `HubList.svelte` | **Einstiegsliste eines Hubs** (siehe unten) |

Die Listendaten stammen aus `portalContent.ts` (abgeleitet aus `NAV_GROUPS` und
`getHubChildren()`) — auf der Seite steht keine zweite Linkliste.

#### HubList

Gemeinsame Einstiegsliste aller Hubs — verwendet auf `/rechner/`, `/konverter/`,
`/wissen/`, `/datenbanken/`, `/service/` und `/wissen/funktechnik/`. Rendert eine
`<dl>`: Name als Link (`<dt>`), Beschreibung daneben (`<dd>`), 1-px-Linie je
Zeile, ab 40 rem zweispaltig im Zeilenaufbau, ab 64 rem zweispaltig im Raster.
Knoten mit `status: 'geplant'` erscheinen ohne Link und mit dem Vermerk
„geplant". **Für Hub-Einstiege keine `Card` mehr verwenden.**

| Prop | Typ | Bedeutung |
| --- | --- | --- |
| `items` | `NavNode[]` | meist `getHubChildren('/…/')` |
| `label` | `string` | `aria-label` der Liste (Pflicht) |
| `class` | `string` | Passthrough |

```svelte
<HubList items={getHubChildren('/rechner/')} label="Rechner" />
```

### Panel (`components/funk/`)

Flacher Abschnittsrahmen der Funk-Bausteine: Titel, optionaler Untertitel und
Aktionen in einer Kopfzeile mit Trennlinie — **ohne** Karte und **ohne**
Innenabstand, damit Tabellen die volle Breite nutzen. 14 Bausteine in `funk/`
verwenden ihn anstelle von `ui/Card`.

| Prop | Typ | Bedeutung |
| --- | --- | --- |
| `title` | `string` | Überschrift (`h2`, per `$props.id()` verknüpft) |
| `subtitle` | `string` | eine Zeile neben dem Titel |
| `actions` | `Snippet` | rechts in der Kopfzeile, etwa eine Trefferzahl |
| `footer` | `Snippet` | Fußnote unter dem Inhalt (`--font-size-xs`) |

```svelte
<Panel title="Amateurfunk-Bandplan" subtitle="AFuV Anlage 1">
  {#snippet actions()}<span>22 Bänder</span>{/snippet}
  <table>…</table>
</Panel>
```

### Lernpfad-Bausteine (`components/learning/`)

| Komponente | Zweck | Hinweise |
| --- | --- | --- |
| `LearningMeter.svelte` | Fortschrittsbalken | `role="progressbar"` mit `aria-valuenow`/`aria-valuetext` |
| `LearningPathBar.svelte` | flache Leiste unter dem Kopfbereich: „Schritt 3 von 7", Lernziel, Zurück/Weiter/Erledigt/Verlassen | `<nav aria-label="Lernpfad …">`, sticky ab 48 rem (`top: 2.875rem` — direkt unter dem 45-px-Kopf —, `z-index: 30`), Innenraum in voller Breite mit `--page-gutter`, darunter statisch |
| `LearningPathCard.svelte` | Datenzeile je Pfad (keine Karte): Titel und Lead links, Stufe/Schritte/Dauer darunter, Balken und Starten/Fortsetzen rechts | Dauer ist eine gekennzeichnete Annahme |
| `LearningPathSteps.svelte` | Schrittzeilen mit 1-px-Linie, Nummer in Monospace (keine Pille), Status und Abhaken | optionale Schritte sind als solche ausgewiesen |

Der Fortschritt liegt in `learningProgress.svelte.ts` (Runes-Klasse,
`localStorage`) und wird erst in einem `$effect` gelesen — sonst wiche das
hydrierte Markup vom prerenderten ab.

### Spektrum-Teilkomponenten (`components/`)

`SpectrumOverview.svelte` ist eine **geschützte Kernkomponente**; ihre
Teilstücke stehen unter demselben Schutz und werden nur zusammen mit ihr
geändert (Bedingung: pixelgleiche Darstellung).

| Komponente | Zeichnet |
| --- | --- |
| `SpectrumWavelengthAxis.svelte` | obere Wellenlängenachse und vertikale Gitterlinien |
| `SpectrumRows.svelte` | Bandreihen als `rect`-Elemente mit Tooltip-/Klick-Handlern und `aria-label` |
| `SpectrumMarker.svelte` | Markerlinie und Markerpunkte zur aktuellen Frequenz |
| `SpectrumFrequencyAxis.svelte` | untere Frequenzachse mit dualer λ-Beschriftung |

Geometrie und Zahlen kommen aus `spectrumZoom.ts`, `spectrumBands.ts`,
`spectrumCursor.svelte.ts` und `spectrumFormat.ts` — die Komponenten enthalten
keine Rechnung. Dasselbe Muster gilt für den Frequenzkonverter mit
`FrequencyPresets.svelte` und `FrequencyFormula.svelte`.

Die verbliebenen Hex-Ausnahmen in `conventions.test.ts` liegen sämtlich hier:
`SpectrumRows`, `SpectrumMarker`, `SpectrumCursor` (theme-invariante
Markerfarben) sowie `SpectrumTooltip` und `SpectrumLegend` (Farbverlauf des
sichtbaren Lichts). Sie wurden beim Refactor bewusst nicht getauscht, um die
Pixelgleichheit nicht zu riskieren. Eine Größenausnahme gibt es nicht mehr —
alle Komponenten liegen unter 300 Zeilen.

---

## Chart-Standards

### Farben für Datenserien

1. Primär: `var(--color-series-1)`
2. Sekundär: `var(--color-series-2)`
3. Summen/Highlights: `var(--color-series-3)`
4. Tertiär: `var(--color-series-4)`
5. Quaternär: `var(--color-series-5)`
6. Kritisch: `var(--color-series-6)`
7. Aktueller Arbeitspunkt: `var(--color-marker)`

### SVG-Klassen

```html
<rect class="chart-background" />       <text class="chart-axis-text" />
<line class="chart-grid-line" />        <text class="chart-axis-label" />
<line class="chart-axis-line" />        <text class="chart-title" />
<text class="chart-legend-text" />      <text class="chart-legend-title" />
<circle class="chart-marker-primary" /> <line class="chart-marker-crosshair" />
<rect class="chart-tooltip" />          <text class="chart-tooltip-text" />
```

### Standard-Margins

```javascript
const margin = { top: 40, right: 100, bottom: 60, left: 70 };
```

### Dimensionen

`--chart-min-width` (800px, responsiv auf 500px reduziert),
`--chart-height-sm|md|lg` (400/500/600px).

---

## Zahlenformat

**Jede angezeigte Zahl steht im deutschen Format.** Dezimaltrenner ist das
Komma, Tausendertrenner der **Punkt** — die Vorgabe von
`Intl.NumberFormat('de-DE')`, ohne eigene Zeichenersetzung:

| Wert | Anzeige |
| --- | --- |
| `220352000` Hz | `220,352 MHz` |
| `0.1249` m | `12,49 cm` |
| `80.0512` dB | `80,05 dB` |
| `1000000` m | `1.000 km` |
| `0.001234` dB/km | `1,23e-3 dB/km` |

Ein **schmales geschütztes Leerzeichen** als Tausendertrenner wird bewusst
nicht verwendet: Der Punkt ist der ICU-Standard für `de-DE`, kopierbar,
suchbar und in jeder Schrift eindeutig.

### Eine Quelle: `formatLocaleNumber`

Alle Formatter in `src/lib/utils/formatting.ts` bauen auf derselben Funktion
auf. `toFixed`, `toLocaleString` und Hand-Ersetzungen wie `.replace('.', ',')`
sind in Anzeigetexten verboten.

```typescript
import { formatLocaleNumber, formatFixed, formatExponential } from '$lib/utils/formatting';

formatLocaleNumber(1234.5, { minFrac: 2 });                  // „1.234,50"
formatLocaleNumber(1234.5, { maxFrac: 2, grouping: false }); // „1234,5"
formatFixed(80.0512, 2);                                     // „80,05"  (Ersatz für toFixed)
formatExponential(0.001234, 2);                              // „1,23e-3"
```

`formatLocaleNumber` liefert für `null`, `NaN` und `±Infinity` einen leeren
String; die Fach-Formatter (`formatFrequency`, `formatDistance`, …) setzen
dort ihren eigenen Platzhalter „—". Ein auf null gerundeter Wert erscheint nie
als „-0". Die Exponentialform lokalisiert nur die Mantisse, nicht den
Exponenten (`1,23e-3`, nicht `1,23e−3`).

### Eingaben: Komma **und** Punkt

`parseLocaleNumber` in `src/lib/utils/handlers.ts` liest beide Schreibweisen;
`parseNumericInput`, `parseFieldInput` (NumberInput) und `parseFrequencyQuery`
(Suche) verwenden ausschließlich sie.

| Eingabe | Ergebnis | Regel |
| --- | --- | --- |
| `12,49` / `12.49` | `12.49` | einzelner Trenner = Dezimaltrenner |
| `1.000,5` / `1,000.5` | `1000.5` | beide vorhanden → der **hintere** trennt die Nachkommastellen |
| `1.234.567` / `1,234,567` | `1234567` | mehrfach → Tausendertrenner |
| `1.000` | `1` | **mehrdeutig**, bewusst als Dezimalpunkt gelesen |
| `144 800`, `1'000` | `144800`, `1000` | Leerzeichen (auch geschützte) und Apostroph entfallen |
| `2,4e9` | `2.4e9` | Exponentialschreibweise bleibt lesbar |

Zahlenfelder sind deshalb `type="text"` mit `inputmode="decimal"` — ein
`<input type="number">` verwirft laut HTML-Spezifikation jeden Komma-String
und bliebe leer. Verwende `NumberInput`, das beides mitbringt.

### Wo der Punkt bleibt

Maschinenlesbare Werte behalten den Dezimalpunkt, weil sie wieder von
`Number()` gelesen werden:

- **Query-Parameter** aus `utils/urlState.svelte.ts` (`?f=2.4e9`)
- **SVG-Koordinaten** in Pfaddaten (`M12.5,40.0 L…`)
- **`value` von `<input type="number">`** — nur noch in den geschützten
  Konvertern über `formatPrecisionNumber`; die Funktion ist deshalb die
  einzige dokumentierte Ausnahme in `formatting.ts`

### Diagramme

Achsenbeschriftungen laufen über dieselben Formatter (`formatLocaleNumber`,
`formatFrequency`, `formatDistance`), nicht über `d3.format` — eine
d3-Locale-Definition ist damit überflüssig. Auch die `sr-only`-Datentabelle
eines `ChartFrame` zeigt deutsche Zahlen.

---

## UTF-8 Richtlinien

### Deutsche Umlaute

Immer echte Umlaute: `ä ö ü Ä Ö Ü ß` — niemals `ae oe ue ss`.
Ausnahme: Verzeichnis- und Dateinamen sowie Anker-IDs (`slugify` transliteriert
bewusst, weil sie in URLs landen).

### Sonderzeichen in Formeln

| Symbol | Unicode | Symbol | Unicode |
| --- | --- | --- | --- |
| λ | `λ` | σ | `σ` |
| π | `π` | Δ | `Δ` |
| × | `×` | · | `·` |
| ± | `±` | ° | `°` |
| ² | `²` | ³ | `³` |
| ₁₀ | `₁₀` | ≈ | `≈` |

ASCII-Ersatzschreibweisen wie `lambda`, `4pi` oder `m2` sind verboten.

---

## Do's and Don'ts

### Do's

1. Tokens verwenden: `color: var(--color-ink)` oder `class="text-ink"`.
2. Komponenten aus `ui/` statt handgebauter Markup-Blöcke.
3. `SectionHeader` statt roher `<h2>`/`<h4>` — das hält die Hierarchie sauber.
4. `safeDivide` / `safeLog` aus `$lib/utils/handlers` statt roher Division.
5. Diagramme in `ChartFrame` (oder mindestens `.chart-container`) einbetten.
6. Jede Utility-Funktion mit Unit-Test.

### Don'ts

1. Keine Hex-Farben in Komponenten.
2. Keine Rohpaletten-Utilities (`bg-slate-*`, `text-blue-*`, `dark:*-400`).
3. Kein `outline: none` und kein `focus:outline-none`.
4. Keine Emoji als Icons.
5. Kein `min-width` am Scroll-Container — es gehört an das innere Element.
6. Keine „ae/oe/ue/ss"-Ersatzschreibweisen in sichtbarem Text.
7. Keine Überschriftensprünge (h2 → h4).

---

## Checkliste für neue Komponenten

- [ ] Nur Tokens für Farben, Radien, Schatten, Breiten
- [ ] Beide Themes geprüft (hell, dunkel, System)
- [ ] Kontrast: Text ≥ 4,5:1, UI-Grenzen und Fokusring ≥ 3:1
- [ ] Kein `outline: none`; Tastaturbedienung vollständig
- [ ] `role`, `aria-*`, `id`/`for` gesetzt
- [ ] Svelte 5: `$props()`, `$bindable()`, Snippets, `$app/state`
- [ ] Größe unter 300 Zeilen
- [ ] Echte Umlaute in Text und Kommentaren
- [ ] Kein horizontales Seiten-Scrollen bei 360 px
- [ ] Tests für neue Utility-Funktionen
- [ ] `npm run check && npx vitest run && npm run build` grün

---

## Referenz-Dateien

- **Tokens und Layout-Klassen:** `src/app.css`
- **Anti-FOUC-Skript:** `src/app.html`
- **Theme-Umschalter:** `src/lib/components/layout/ThemeToggle.svelte`
- **Komponentenbibliothek:** `src/lib/components/ui/`
- **Icon-Katalog:** `src/lib/components/ui/icons.ts`
- **Diagramm-Rahmen:** `src/lib/components/charts/ChartFrame.svelte`
