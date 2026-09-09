<script lang="ts">
  /**
   * Linear oder logarithmisch: Dieselben zwei Faktoren auf einer linearen und
   * einer Dezibel-Achse. Der laufende Marker macht zweimal denselben Schritt —
   * auf der dB-Achse gleich lang, auf der linearen völlig verschieden.
   * Gerechnet wird in LogLinearModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatNumber, formatNumberLocale, formatPowerDb } from '$lib/utils/formatting';
  import {
    FACTOR_LIMITS,
    animatedFactor,
    combineFactors,
    dbAxisMax,
    dbPosition,
    decadeValues,
    linearPosition
  } from './LogLinearModel';

  const W = 800;
  const H = 250;
  const X0 = 70;
  const X1 = 760;
  const LINEAR_Y = 74;
  const DB_Y = 186;
  const BAR_H = 22;
  /** Dauer eines vollen Durchlaufs der Zwei-Schritt-Animation (ms) */
  const CYCLE_MS = 5200;

  let factorA = $state<number>(FACTOR_LIMITS.a.default);
  let factorB = $state<number>(FACTOR_LIMITS.b.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const pair = $derived(combineFactors(factorA, factorB));
  const axisMaxDb = $derived(dbAxisMax(pair.dbProduct));
  const phase = $derived((loop.elapsedMs % CYCLE_MS) / CYCLE_MS);
  const marker = $derived(animatedFactor(phase, pair));
  const decades = $derived(decadeValues(pair.product));

  function lx(value: number): number {
    return X0 + linearPosition(value, pair.product) * (X1 - X0);
  }
  function dx(db: number): number {
    return X0 + dbPosition(db, axisMaxDb) * (X1 - X0);
  }
  /**
   * Auf der linearen Achse fallen die kleinen Dekaden alle auf den linken Rand.
   * Beschriftet wird deshalb nur, was genug Abstand hat — der Rest bleibt als
   * Strich stehen und macht das Gedränge gerade sichtbar.
   */
  const LABEL_GAP_PX = 46;
  const linearLabels = $derived.by(() => {
    const kept: number[] = [];
    let lastX = Number.NEGATIVE_INFINITY;
    for (const value of decades) {
      const position = lx(value);
      if (position - lastX >= LABEL_GAP_PX) {
        kept.push(value);
        lastX = position;
      }
    }
    return kept;
  });
  const dbTicks = $derived(Array.from({ length: Math.floor(axisMaxDb / 10) + 1 }, (_, index) => index * 10));
</script>

<WidgetFrame
  title="Linear oder logarithmisch"
  description="Zwei Achsen übereinander: oben eine lineare Achse bis zum Produkt der beiden Faktoren, auf der der kleinere Faktor am linken Rand klebt; unten dieselben Werte in Dezibel, wo beide Faktoren als gleichwertige Strecken nebeneinander liegen und sich zum Produkt addieren."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  stacked
  footnote="Der Marker macht zweimal denselben Schritt: erst den Faktor A, dann den Faktor B. Auf der Dezibel-Achse sind beide Schritte gerade Strecken — Multiplikation wird zur Addition."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Lineare Achse -->
    <text x={X0} y={LINEAR_Y - 34} class="chart-axis-text">Lineare Achse — Leistungsverhältnis (Faktor)</text>
    <rect
      x={X0}
      y={LINEAR_Y - BAR_H / 2}
      width={X1 - X0}
      height={BAR_H}
      fill="var(--color-elevated)"
      stroke="var(--color-line)"
    />
    <rect
      x={X0}
      y={LINEAR_Y - BAR_H / 2}
      width={Math.max(0, lx(marker.value) - X0)}
      height={BAR_H}
      fill="var(--color-series-1)"
      fill-opacity="0.35"
    />
    <line x1={X0} y1={LINEAR_Y + BAR_H / 2} x2={X1} y2={LINEAR_Y + BAR_H / 2} class="chart-axis-line" />
    {#each decades as value (value)}
      <line
        x1={lx(value)}
        y1={LINEAR_Y + BAR_H / 2}
        x2={lx(value)}
        y2={LINEAR_Y + BAR_H / 2 + 6}
        class="chart-axis-line"
      />
      {#if linearLabels.includes(value)}
        <text x={lx(value)} y={LINEAR_Y + BAR_H / 2 + 20} text-anchor="middle" class="chart-axis-text">
          {formatNumberLocale(value)}
        </text>
      {/if}
    {/each}
    <text x={X0} y={LINEAR_Y + BAR_H / 2 + 36} class="chart-legend-text">
      alle kleinen Faktoren fallen hier am linken Rand zusammen
    </text>
    <line
      x1={lx(pair.a)}
      y1={LINEAR_Y - BAR_H / 2 - 10}
      x2={lx(pair.a)}
      y2={LINEAR_Y + BAR_H / 2}
      stroke="var(--color-series-2)"
      stroke-width="2"
    />
    <text x={lx(pair.a)} y={LINEAR_Y - BAR_H / 2 - 14} text-anchor="middle" class="chart-legend-text">A</text>
    <line
      x1={lx(marker.value)}
      y1={LINEAR_Y - BAR_H / 2 - 4}
      x2={lx(marker.value)}
      y2={LINEAR_Y + BAR_H / 2 + 4}
      stroke="var(--color-marker)"
      stroke-width="2.5"
    />

    <!-- Dezibel-Achse -->
    <text x={X0} y={DB_Y - 46} class="chart-axis-text">Dezibel-Achse — 10·log₁₀(Faktor)</text>
    <rect
      x={X0}
      y={DB_Y - BAR_H / 2}
      width={Math.max(0, dx(pair.dbA) - X0)}
      height={BAR_H}
      fill="var(--color-series-2)"
      fill-opacity="0.35"
      stroke="var(--color-series-2)"
    />
    <rect
      x={dx(pair.dbA)}
      y={DB_Y - BAR_H / 2}
      width={Math.max(0, dx(pair.dbProduct) - dx(pair.dbA))}
      height={BAR_H}
      fill="var(--color-series-3)"
      fill-opacity="0.35"
      stroke="var(--color-series-3)"
    />
    <text x={(X0 + dx(pair.dbA)) / 2} y={DB_Y - BAR_H / 2 - 8} text-anchor="middle" class="chart-legend-text">
      A = {formatPowerDb(pair.dbA, 1)}
    </text>
    <text
      x={(dx(pair.dbA) + dx(pair.dbProduct)) / 2}
      y={DB_Y - BAR_H / 2 - 8}
      text-anchor="middle"
      class="chart-legend-text"
    >
      B = {formatPowerDb(pair.dbB, 1)}
    </text>
    <line x1={X0} y1={DB_Y + BAR_H / 2} x2={X1} y2={DB_Y + BAR_H / 2} class="chart-axis-line" />
    {#each dbTicks as db (db)}
      <line x1={dx(db)} y1={DB_Y + BAR_H / 2} x2={dx(db)} y2={DB_Y + BAR_H / 2 + 6} class="chart-axis-line" />
      <text x={dx(db)} y={DB_Y + BAR_H / 2 + 20} text-anchor="middle" class="chart-axis-text">{db} dB</text>
    {/each}
    <line
      x1={dx(marker.db)}
      y1={DB_Y - BAR_H / 2 - 4}
      x2={dx(marker.db)}
      y2={DB_Y + BAR_H / 2 + 4}
      stroke="var(--color-marker)"
      stroke-width="2.5"
    />
    <text x={X1} y={DB_Y + BAR_H / 2 + 36} text-anchor="end" class="chart-axis-text">
      Schritt {marker.step} von 2 · Marker bei {formatPowerDb(marker.db, 1)}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Faktoren und Pegel des Widgets</caption>
      <tbody>
        <tr><th>Faktor A</th><td>{formatNumberLocale(pair.a)} = {formatPowerDb(pair.dbA, 2)}</td></tr>
        <tr><th>Faktor B</th><td>{formatNumberLocale(pair.b)} = {formatPowerDb(pair.dbB, 2)}</td></tr>
        <tr><th>Produkt A·B</th><td>{formatNumberLocale(pair.product)} = {formatPowerDb(pair.dbProduct, 2)}</td></tr>
        <tr
          ><th>Probe</th><td
            >{formatNumber(pair.dbA, 2)} + {formatNumber(pair.dbB, 2)} = {formatNumber(pair.dbProduct, 2)} dB</td
          ></tr
        >
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Faktor A"
      bind:value={factorA}
      min={FACTOR_LIMITS.a.min}
      max={FACTOR_LIMITS.a.max}
      scale="log"
      format={(v) => `${formatNumberLocale(Math.round(v))} = ${formatPowerDb(10 * Math.log10(v), 1)}`}
      unitSymbol="fach"
    />
    <Slider
      label="Faktor B"
      bind:value={factorB}
      min={FACTOR_LIMITS.b.min}
      max={FACTOR_LIMITS.b.max}
      scale="log"
      format={(v) => `${formatNumberLocale(Math.round(v))} = ${formatPowerDb(10 * Math.log10(v), 1)}`}
      unitSymbol="fach"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Produkt A·B"
      value={formatNumberLocale(Math.round(pair.product))}
      emphasis="hero"
      hint="linear: multiplizieren"
      copyable={false}
    />
    <ResultCard
      label="Summe der Pegel"
      value={formatPowerDb(pair.dbProduct, 2)}
      hint="{formatPowerDb(pair.dbA, 1)} + {formatPowerDb(pair.dbB, 1)}"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Lage von A auf der linearen Achse"
      value={formatNumber(linearPosition(pair.a, pair.product) * 100, 2)}
      unit="%"
      hint="der Achsenlänge — deshalb ist sie unbrauchbar"
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
