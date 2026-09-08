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
| `--color-surface` | `bg-surface` | `#ffffff` | `#1e293b` | Karten, Panels |
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
`--color-cat-orange`, `--color-cat-violet`, `--color-cat-pink`.

### Typografie, Radien, Schatten, Breiten

| Token | Wert | Verwendung |
| --- | --- | --- |
| `--font-sans` | System-Stack | Fließtext und UI |
| `--font-mono` | `ui-monospace, …` | Formeln, Messwerte, Zahlenfelder |
| `--text-2xs` | `0.6875rem` | Chart- und Achsenbeschriftung |
| `--radius-control` | `0.5rem` | Buttons, Inputs, Chips |
| `--radius-card` | `1rem` | Karten |
| `--radius-pill` | `9999px` | Badges, Regler-Griffe |
| `--shadow-card` | zweistufig | Karten |
| `--shadow-popover` | – | Menüs, Overlays |
| `--container-prose` | `68ch` | Lesebreite |
| `--container-page` | `80rem` | Seitenbreite (= Headerbreite) |
| `--container-wide` | `96rem` | Bühnen-Widgets |

Die Skalen `--font-size-*`, `--spacing-*`, `--radius-sm|md|lg|xl|full`,
`--line-height-*`, `--font-weight-*` und `--transition-*` bleiben unverändert
im `:root`-Block.

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

### Drei Zustände

`ThemeToggle.svelte` bietet **hell / dunkel / System** als Schaltflächengruppe
mit `aria-pressed`. Gespeichert wird unter `localStorage['theme']` als
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
| `.page-container` | `max-width: 80rem`, zentriert, seitliches Padding (`--page-gutter`) |
| `.page-container--wide` | wie oben, aber `max-width: 96rem` |
| `.prose` | Lesebreite `68ch` plus Typografie für `h2`–`h4`, `p`, Listen, Tabellen, `code`, `pre`, `blockquote` |
| `.bleed` | Ausbruch aus der Lesebreite auf volle Breite (für Diagramme und Widgets) |
| `.table-scroll` | horizontaler Scroll-Container für breite Tabellen |
| `.chart-container` | Scroll-Container für Diagramme; die Mindestbreite liegt am **inneren** Element |

```svelte
<div class="page-container">
  <div class="prose">
    <p>Fließtext in Lesebreite …</p>
    <div class="bleed">
      <!-- Diagramm über die volle Breite -->
    </div>
  </div>
</div>
```

**Overflow-Regel:** Überbreite Inhalte scrollen in ihrem eigenen Container,
niemals die Seite. `min-width` gehört an das SVG bzw. an `.chart-inner`,
nicht an den Scroll-Container.

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

Alle Komponenten liegen in `src/lib/components/ui/` (Ausnahme: `ChartFrame`
unter `src/lib/components/charts/`), nutzen Svelte-5-Runes, `$props()`,
`$bindable()` und Snippets statt Slots. Jede akzeptiert ein `class`-Passthrough.

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
Pos1/Ende.

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

| Prop | Typ | Standard |
| --- | --- | --- |
| `title` | `string` | – |
| `lead` / `kicker` / `badge` | `string` | – |
| `badgeTone` | wie `Badge.tone` | `'brand'` |
| `icon` | `IconName` | – |
| `meta` | `{ label, value }[]` | `[]` |
| `children` | `Snippet` | – (Aktionen) |

```svelte
<PageHero kicker="Rechner" title="Freiraumdämpfung" icon="wave"
          lead="Dämpfung einer Funkstrecke im freien Raum."
          meta={[{ label: 'Quelle', value: 'ITU-R P.525' }]}>
  <Button icon="share" size="sm">Link kopieren</Button>
</PageHero>
```

### TableOfContents

| Prop | Typ | Standard |
| --- | --- | --- |
| `items` | `{ id, label, level: 2 \| 3 }[]` | – |
| `title` | `string` | `'Auf dieser Seite'` |
| `sticky` | `boolean` | `true` |
| `compactBelow` | `number` | `1280` (darunter als `<details>`) |

Scroll-Spy per `IntersectionObserver`; der aktive Eintrag trägt
`aria-current="location"`.

### LearningGoals

| Prop | Typ | Standard |
| --- | --- | --- |
| `goals` | `string[]` | – |
| `title` | `string` | `'Nach diesem Kapitel kannst du …'` |
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
