# Bandbreite Style Guide

Dieses Dokument definiert die Design-Standards und Richtlinien für das Bandbreite-Projekt.
Alle Komponenten sollten diese Standards einhalten, um ein konsistentes Erscheinungsbild zu gewährleisten.

---

## Inhaltsverzeichnis

1. [Farbpalette](#farbpalette)
2. [Typografie](#typografie)
3. [Spacing-System](#spacing-system)
4. [Komponenten-Standards](#komponenten-standards)
5. [Chart-Standards](#chart-standards)
6. [Theme-Nutzung](#theme-nutzung)
7. [UTF-8 Richtlinien](#utf-8-richtlinien)
8. [Do's and Don'ts](#dos-and-donts)

---

## Farbpalette

### Hintergrundfarben

| Token | Light Theme | Dark Theme | Verwendung |
|-------|-------------|------------|------------|
| `--color-bg-base` | `#f8fafc` (slate-50) | `#0f172a` (slate-900) | Seiten-Hintergrund |
| `--color-bg-surface` | `#ffffff` (white) | `#1e293b` (slate-800) | Karten, Panels |
| `--color-bg-elevated` | `#f1f5f9` (slate-100) | `#334155` (slate-700) | Erhöhte Flächen, Hover-States |
| `--color-bg-input` | `#ffffff` (white) | `#334155` (slate-700) | Input-Felder |
| `--color-bg-code` | `#f1f5f9` (slate-100) | `#1e293b` (slate-800) | Code-Blöcke, Formeln |

### Textfarben

| Token | Light Theme | Dark Theme | Verwendung |
|-------|-------------|------------|------------|
| `--color-text-primary` | `#0f172a` (slate-900) | `#f1f5f9` (slate-100) | Überschriften, wichtiger Text |
| `--color-text-secondary` | `#475569` (slate-600) | `#cbd5e1` (slate-300) | Fließtext, Labels |
| `--color-text-tertiary` | `#64748b` (slate-500) | `#94a3b8` (slate-400) | Hilfstext, Beschreibungen |
| `--color-text-disabled` | `#94a3b8` (slate-400) | `#64748b` (slate-500) | Deaktivierte Elemente |

### Border-Farben

| Token | Light Theme | Dark Theme | Verwendung |
|-------|-------------|------------|------------|
| `--color-border-default` | `#e2e8f0` (slate-200) | `#334155` (slate-700) | Standard-Rahmen |
| `--color-border-subtle` | `#f1f5f9` (slate-100) | `#1e293b` (slate-800) | Dezente Rahmen |
| `--color-border-strong` | `#cbd5e1` (slate-300) | `#475569` (slate-600) | Betonte Rahmen |
| `--color-border-focus` | `#3b82f6` (blue-500) | `#3b82f6` (blue-500) | Focus-Ringe |

### Akzentfarben

| Token | Farbe | Verwendung |
|-------|-------|------------|
| `--color-accent-primary` | `#3b82f6` (blue-500) | Primäre Aktionen, Links |
| `--color-accent-primary-hover` | `#2563eb` (blue-600) | Hover-State |
| `--color-accent-secondary` | `#22c55e` (green-500) | Sekundäre Aktionen |
| `--color-accent-secondary-hover` | `#16a34a` (green-600) | Hover-State |

### Semantische Farben

| Token | Farbe | Verwendung |
|-------|-------|------------|
| `--color-success` | `#22c55e` (green-500) | Erfolg, positive Werte |
| `--color-warning` | `#f59e0b` (amber-500) | Warnungen |
| `--color-error` | `#ef4444` (red-500) | Fehler, negative Werte |
| `--color-info` | `#3b82f6` (blue-500) | Informationen |

### Chart-Farben

| Token | Farbe | Verwendung |
|-------|-------|------------|
| `--color-chart-blue` | `#3b82f6` | Sauerstoff, primäre Daten |
| `--color-chart-green` | `#22c55e` | Wasserdampf, sekundäre Daten |
| `--color-chart-orange` | `#f97316` | Summen, Highlights |
| `--color-chart-amber` | `#fbbf24` | Aktuelle Marker, Auswahl |
| `--color-chart-purple` | `#a855f7` | Nebel, tertiäre Daten |
| `--color-chart-cyan` | `#06b6d4` | Regen, quaternäre Daten |
| `--color-chart-red` | `#ef4444` | Fehler, kritische Werte |
| `--color-chart-gray` | `#94a3b8` | Schnee, deaktiviert |

---

## Typografie

### Schriftgrößen

| Klasse | Größe | Verwendung |
|--------|-------|------------|
| `--font-size-xs` | 0.75rem (12px) | Captions, Labels |
| `--font-size-sm` | 0.875rem (14px) | Hilfstext, kleine UI-Elemente |
| `--font-size-base` | 1rem (16px) | Fließtext |
| `--font-size-lg` | 1.125rem (18px) | Kleine Überschriften |
| `--font-size-xl` | 1.25rem (20px) | Abschnitts-Überschriften |
| `--font-size-2xl` | 1.5rem (24px) | Ergebniswerte |
| `--font-size-3xl` | 1.875rem (30px) | Seiten-Überschriften |

### Typografie-Klassen

```css
.text-heading-1    /* Seiten-Titel: 30px, bold */
.text-heading-2    /* Abschnitts-Titel: 20px, semibold */
.text-heading-3    /* Karten-Titel: 18px, semibold */
.text-body         /* Fließtext: 16px */
.text-body-secondary /* Sekundärer Text: 16px, gedämpfte Farbe */
.text-small        /* Kleiner Text: 14px */
.text-caption      /* Captions: 12px */
.text-label        /* Labels: 12px, uppercase */
```

### Schriftgewichte

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--font-weight-normal` | 400 | Fließtext |
| `--font-weight-medium` | 500 | Labels, Buttons |
| `--font-weight-semibold` | 600 | Überschriften |
| `--font-weight-bold` | 700 | Wichtige Überschriften |

---

## Spacing-System

### Abstände

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--spacing-xs` | 0.25rem (4px) | Minimaler Abstand |
| `--spacing-sm` | 0.5rem (8px) | Kleine Abstände, Icon-Gaps |
| `--spacing-md` | 1rem (16px) | Standard-Abstände |
| `--spacing-lg` | 1.5rem (24px) | Karten-Padding |
| `--spacing-xl` | 2rem (32px) | Abschnitt-Abstände |
| `--spacing-2xl` | 3rem (48px) | Große Abstände |

### Border-Radii

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--radius-sm` | 0.25rem (4px) | Badges, kleine Elemente |
| `--radius-md` | 0.5rem (8px) | Buttons, Inputs |
| `--radius-lg` | 0.75rem (12px) | Kleine Karten |
| `--radius-xl` | 1rem (16px) | Große Karten, Panels |
| `--radius-full` | 9999px | Runde Elemente |

---

## Komponenten-Standards

### Karten (Cards)

```html
<div class="card">
  <!-- Voller Padding, großer Radius -->
</div>

<div class="card-compact">
  <!-- Reduzierter Padding -->
</div>
```

**CSS-Klassen:**
- `.card` - Standard-Karte mit `padding: 1.5rem`, `border-radius: 1rem`
- `.card-compact` - Kompakte Karte mit `padding: 1rem`, `border-radius: 0.75rem`

### Input-Felder

```html
<input type="text" class="input-field" placeholder="Wert eingeben" />
<select class="select-field">
  <option>Option</option>
</select>
```

**Eigenschaften:**
- Hintergrund: `--color-bg-input`
- Border: `1px solid --color-border-default`
- Border-Radius: `--radius-md` (0.5rem)
- Focus: Blue ring (`box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2)`)

### Buttons

```html
<button class="btn btn-primary">Primär</button>
<button class="btn btn-secondary">Sekundär</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn-preset">Quick Action</button>
```

**Button-Varianten:**
- `.btn-primary` - Blaue Hauptaktion
- `.btn-secondary` - Umrandeter Button
- `.btn-ghost` - Transparenter Button
- `.btn-preset` - Kleine Quick-Action-Buttons

### Ergebnisanzeigen

```html
<div class="result-box">
  <div class="result-label">FSPL</div>
  <div class="result-value">
    42.5 <span class="result-unit">dB</span>
  </div>
</div>
```

### Formeln

```html
<div class="formula-box">
  FSPL(dB) = 20 log(d) + 20 log(f) - 147.55
</div>
```

---

## Chart-Standards

### Dimensionen

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `--chart-min-width` | 800px | Minimale Breite |
| `--chart-height-sm` | 400px | Kleine Charts |
| `--chart-height-md` | 500px | Mittlere Charts |
| `--chart-height-lg` | 600px | Große Charts |

### Margins (Standard)

```javascript
const margin = {
  top: 40,     // Platz für Titel
  right: 100,  // Platz für Legende (rechts)
  bottom: 60,  // Platz für X-Achsen-Beschriftung
  left: 70     // Platz für Y-Achsen-Beschriftung
};
```

### Legende

- Position: Rechts außerhalb des Chart-Bereichs
- Titel: `font-size: 12px`, `font-weight: 500`
- Text: `font-size: 10px`
- Linien-Samples: 24px Breite

### SVG-Klassen

```html
<rect class="chart-background" />           <!-- Hintergrund -->
<line class="chart-grid-line" />            <!-- Gitterlinien -->
<line class="chart-axis-line" />            <!-- Achsenlinien -->
<text class="chart-axis-text" />            <!-- Achsenbeschriftung -->
<text class="chart-axis-label" />           <!-- Achsentitel -->
<text class="chart-title" />                <!-- Chart-Titel -->
<text class="chart-legend-text" />          <!-- Legendentext -->
<text class="chart-legend-title" />         <!-- Legendentitel -->
<circle class="chart-marker-primary" />     <!-- Marker -->
<line class="chart-marker-crosshair" />     <!-- Fadenkreuz -->
<rect class="chart-tooltip" />              <!-- Tooltip-Hintergrund -->
<text class="chart-tooltip-text" />         <!-- Tooltip-Text -->
```

### Farben für Datenserien

1. **Primäre Daten:** `--color-chart-blue` (#3b82f6)
2. **Sekundäre Daten:** `--color-chart-green` (#22c55e)
3. **Tertiäre Daten:** `--color-chart-purple` (#a855f7)
4. **Quaternäre Daten:** `--color-chart-cyan` (#06b6d4)
5. **Summen/Totals:** `--color-chart-orange` (#f97316)
6. **Aktuelle Auswahl:** `--color-chart-amber` (#fbbf24)
7. **Fehler/Kritisch:** `--color-chart-red` (#ef4444)

---

## Theme-Nutzung

### Dark Theme aktivieren

Das Theme wird über die CSS-Klasse `.dark` auf dem `<html>`-Element gesteuert:

```html
<html class="dark">  <!-- Dark Mode -->
<html>               <!-- Light Mode -->
```

### Theme in Komponenten

Verwende immer CSS-Variablen statt hardcodierter Farben:

```css
/* Gut */
.my-component {
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}

/* Schlecht */
.my-component {
  background-color: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
}
```

### Theme-Toggle

Die `ThemeToggle`-Komponente speichert die Präferenz in `localStorage`:

```javascript
localStorage.getItem('theme')  // 'dark' oder 'light'
```

### System-Präferenz

Die Komponente berücksichtigt die System-Präferenz beim ersten Laden:

```javascript
window.matchMedia('(prefers-color-scheme: dark)').matches
```

---

## UTF-8 Richtlinien

### Deutsche Umlaute

**Immer echte Umlaute verwenden:**

| Richtig | Falsch |
|---------|--------|
| ä | ae |
| ö | oe |
| ü | ue |
| Ä | Ae |
| Ö | Oe |
| Ü | Ue |
| ß | ss |

### Beispiele

```html
<!-- Richtig -->
<p>Wellenlänge</p>
<p>Frequenzübersicht</p>
<p>Atmosphärische Dämpfung</p>
<p>Größe</p>

<!-- Falsch -->
<p>Wellenlaenge</p>
<p>Frequenzuebersicht</p>
<p>Atmosphaerische Daempfung</p>
<p>Groesse</p>
```

### Sonderzeichen in Formeln

Verwende HTML-Entities oder Unicode für mathematische Symbole:

| Symbol | HTML-Entity | Unicode |
|--------|-------------|---------|
| Lambda | `&lambda;` | `&#955;` |
| Pi | `&pi;` | `&#960;` |
| Mal-Zeichen | `&times;` | `&#215;` |
| Plus-Minus | `&plusmn;` | `&#177;` |
| Grad | `&deg;` | `&#176;` |
| Hoch 2 | `&sup2;` | `&#178;` |
| Hoch 3 | `&sup3;` | `&#179;` |

---

## Do's and Don'ts

### Do's

1. **CSS-Variablen verwenden**
   ```css
   color: var(--color-text-primary);
   ```

2. **Semantische Klassen nutzen**
   ```html
   <div class="card">
   <button class="btn btn-primary">
   ```

3. **Focus-States implementieren**
   ```css
   :focus {
     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
   }
   ```

4. **Transitions für Theme-Wechsel**
   ```css
   transition: background-color var(--transition-normal);
   ```

5. **Responsive Chart-Container**
   ```html
   <div class="chart-container">
     <svg viewBox="0 0 900 500" preserveAspectRatio="xMidYMid meet">
   ```

6. **Echte Umlaute verwenden**
   ```html
   <p>Dämpfung</p>
   ```

7. **Aussagekräftige Labels**
   ```html
   <label for="frequency">Frequenz (GHz)</label>
   ```

### Don'ts

1. **Keine hardcodierten Farben**
   ```css
   /* Nicht */
   color: #f1f5f9;
   background: #1e293b;
   ```

2. **Keine Tailwind-Klassen für Theme-abhängige Farben in Komponenten**
   ```html
   <!-- Nicht in neuen Komponenten -->
   <div class="bg-slate-800 text-slate-100">
   ```

3. **Keine festen Pixel für responsive Elemente**
   ```css
   /* Nicht */
   width: 900px;
   /* Besser */
   width: 100%;
   min-width: var(--chart-min-width);
   ```

4. **Keine "ae", "oe", "ue" Ersetzungen**
   ```html
   <!-- Nicht -->
   <p>Wellenlaenge</p>
   ```

5. **Keine fehlenden Accessibility-Attribute**
   ```html
   <!-- Nicht -->
   <button>X</button>
   <!-- Richtig -->
   <button aria-label="Schließen">X</button>
   ```

6. **Keine uneinheitlichen Border-Radii**
   ```css
   /* Nicht mischen */
   border-radius: 8px;   /* Stattdessen */
   border-radius: var(--radius-md);
   ```

---

## Checkliste für neue Komponenten

- [ ] CSS-Variablen für alle Farben
- [ ] Beide Themes getestet (Dark/Light)
- [ ] Focus-States implementiert
- [ ] Responsive Breakpoints berücksichtigt
- [ ] Deutsche Umlaute korrekt
- [ ] ARIA-Labels wo nötig
- [ ] Transitions für Theme-Wechsel
- [ ] Konsistente Spacing-Werte
- [ ] Konsistente Border-Radii

---

## Referenz-Dateien

- **CSS-Variablen:** `/src/app.css`
- **Theme-Toggle:** `/src/lib/components/layout/ThemeToggle.svelte`
- **Layout:** `/src/routes/+layout.svelte`
- **Header:** `/src/lib/components/layout/Header.svelte`
