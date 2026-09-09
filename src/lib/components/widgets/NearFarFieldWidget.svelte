<script lang="ts">
  /**
   * Nah- und Fernfeld einer Antenne: Die drei Zonen liegen auf einer
   * logarithmischen Abstandsachse, ihre Grenzen folgen aus Frequenz und
   * Aperturdurchmesser. Gerechnet wird in NearFarFieldModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatDistance, formatFrequency, formatNumber, formatWavelength } from '$lib/utils/formatting';
  import {
    NEAR_FAR_LIMITS,
    ZONE_LABELS,
    decadeTicks,
    isElectricallyLarge,
    logPosition,
    zoneAt,
    zoneBoundaries
  } from './NearFarFieldModel';

  const W = 800;
  const H = 250;
  const X0 = 64;
  const X1 = 772;
  const AXIS_Y = 186;
  const BAND_Y = 132;
  const BAND_H = 34;
  /** Mindestbreite der Achse in Dekaden */
  const MIN_DECADES = 3;
  /** Schematische Zonenkreise links oben */
  const SCENE_X = 96;
  const SCENE_Y = 62;

  let frequencyHz = $state<number>(NEAR_FAR_LIMITS.frequencyHz.default);
  let apertureM = $state<number>(NEAR_FAR_LIMITS.apertureM.default);
  let distanceM = $state<number>(NEAR_FAR_LIMITS.distanceM.default);

  const bounds = $derived(zoneBoundaries(frequencyHz, apertureM));
  const zone = $derived(zoneAt(distanceM, bounds));
  const large = $derived(isElectricallyLarge(bounds));

  /** Achsenbereich: eine Dekade Luft um Grenzen und Beobachtungspunkt. */
  const axis = $derived.by(() => {
    const low = Math.min(bounds.reactiveEndM, distanceM);
    const high = Math.max(bounds.farFieldStartM, distanceM);
    let minM = 10 ** Math.floor(Math.log10(Math.max(low, 1e-4)) - 0.5);
    const maxM = 10 ** Math.ceil(Math.log10(Math.max(high, minM * 10)) + 0.5);
    if (Math.log10(maxM / minM) < MIN_DECADES) minM = maxM / 10 ** MIN_DECADES;
    return { minM, maxM };
  });

  function x(valueM: number): number {
    return X0 + logPosition(valueM, axis.minM, axis.maxM) * (X1 - X0);
  }

  const ticks = $derived(decadeTicks(axis.minM, axis.maxM));
  const zoneRects = $derived([
    { id: 'reaktiv', from: axis.minM, to: bounds.reactiveEndM, color: 'var(--color-series-6)' },
    { id: 'strahlend', from: bounds.reactiveEndM, to: bounds.farFieldStartM, color: 'var(--color-series-3)' },
    { id: 'fern', from: bounds.farFieldStartM, to: axis.maxM, color: 'var(--color-series-2)' }
  ] as const);
  const zoneColor = $derived(zoneRects.find((rect) => rect.id === zone)?.color ?? 'var(--color-series-2)');
</script>

<WidgetFrame
  title="Nahfeld, Übergangszone und Fernfeld"
  description="Logarithmische Abstandsachse mit den drei Feldzonen um eine Antenne: reaktives Nahfeld bis zur Grenze aus λ/2π beziehungsweise 0,62·√(D³/λ), darauf das strahlende Nahfeld und ab 2·D²/λ das Fernfeld. Ein Marker zeigt, in welcher Zone der eingestellte Beobachtungsabstand liegt."
  footnote="Die Kreise links sind schematisch und nicht maßstäblich; maßgeblich ist die logarithmische Achse. Grenzen nach Balanis, Antenna Theory, Abschnitt 2.2.4."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Schematische Zonen um die Antenne -->
    <g transform="translate({SCENE_X}, {SCENE_Y})">
      {#each [{ r: 56, c: 'var(--color-series-2)' }, { r: 38, c: 'var(--color-series-3)' }, { r: 20, c: 'var(--color-series-6)' }] as ring, i (i)}
        <circle cx="0" cy="0" r={ring.r} fill={ring.c} fill-opacity="0.12" stroke={ring.c} stroke-width="1.5" />
      {/each}
      <line x1="0" y1="-12" x2="0" y2="12" stroke="var(--color-ink)" stroke-width="3" />
      <circle cx="0" cy="0" r="3" fill="var(--color-ink)" />
    </g>
    <text x={SCENE_X + 76} y={SCENE_Y - 26} class="chart-axis-text">schematisch, nicht maßstäblich</text>
    <text x={SCENE_X + 76} y={SCENE_Y - 8} class="chart-legend-text">innen: reaktives Nahfeld</text>
    <text x={SCENE_X + 76} y={SCENE_Y + 8} class="chart-legend-text">Mitte: strahlendes Nahfeld</text>
    <text x={SCENE_X + 76} y={SCENE_Y + 24} class="chart-legend-text">außen: Fernfeld</text>

    <!-- Zonenbänder auf der logarithmischen Achse -->
    {#each zoneRects as rect (rect.id)}
      {#if x(rect.to) > x(rect.from)}
        <rect
          x={x(rect.from)}
          y={BAND_Y}
          width={Math.max(0, x(rect.to) - x(rect.from))}
          height={BAND_H}
          fill={rect.color}
          fill-opacity="0.18"
          stroke={rect.color}
          stroke-width="1"
        />
      {/if}
    {/each}

    <!-- Grenzlinien -->
    {#each [{ v: bounds.reactiveEndM, t: 'reaktive Grenze' }, { v: bounds.farFieldStartM, t: '2·D²/λ' }] as line, i (i)}
      <line
        x1={x(line.v)}
        y1={BAND_Y - 26}
        x2={x(line.v)}
        y2={AXIS_Y}
        stroke="var(--color-ink-muted)"
        stroke-width="1.5"
        stroke-dasharray="4 3"
      />
      <text x={x(line.v)} y={BAND_Y - 32} text-anchor="middle" class="chart-legend-text">{line.t}</text>
      <text x={x(line.v)} y={BAND_Y - 18} text-anchor="middle" class="chart-axis-text">{formatDistance(line.v, 2)}</text
      >
    {/each}

    <!-- Achse mit Dekaden -->
    <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} class="chart-axis-line" />
    {#each ticks as tick (tick)}
      <line x1={x(tick)} y1={AXIS_Y} x2={x(tick)} y2={AXIS_Y + 6} class="chart-axis-line" />
      <text x={x(tick)} y={AXIS_Y + 20} text-anchor="middle" class="chart-axis-text">{formatDistance(tick, 2)}</text>
    {/each}
    <text x={X1} y={AXIS_Y + 38} text-anchor="end" class="chart-axis-text">Abstand von der Antenne (logarithmisch)</text
    >

    <!-- Beobachtungspunkt -->
    <line x1={x(distanceM)} y1={BAND_Y} x2={x(distanceM)} y2={AXIS_Y + 4} stroke={zoneColor} stroke-width="2.5" />
    <circle cx={x(distanceM)} cy={BAND_Y + BAND_H / 2} r="5" fill={zoneColor} />
    <text x={x(distanceM)} y={BAND_Y + BAND_H + 16} text-anchor="middle" class="chart-axis-text">
      d = {formatDistance(distanceM, 2)}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Zonengrenzen der Antenne bei den eingestellten Werten</caption>
      <tbody>
        <tr><th>Frequenz</th><td>{formatFrequency(frequencyHz, 2)}</td></tr>
        <tr><th>Wellenlänge λ</th><td>{formatWavelength(bounds.wavelengthM, 3)}</td></tr>
        <tr><th>Aperturdurchmesser D</th><td>{formatDistance(apertureM, 2)}</td></tr>
        <tr><th>D in Wellenlängen</th><td>{formatNumber(bounds.apertureInWavelengths, 2)} λ</td></tr>
        <tr><th>λ/2π</th><td>{formatDistance(bounds.lambdaOverTwoPiM, 3)}</td></tr>
        <tr><th>0,62·√(D³/λ)</th><td>{formatDistance(bounds.radiatingStartM, 3)}</td></tr>
        <tr><th>Fernfeld ab 2·D²/λ</th><td>{formatDistance(bounds.farFieldStartM, 2)}</td></tr>
        <tr><th>Beobachtungsabstand d</th><td>{formatDistance(distanceM, 2)}</td></tr>
        <tr><th>Zone bei d</th><td>{ZONE_LABELS[zone]}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Frequenz f"
      bind:value={frequencyHz}
      min={NEAR_FAR_LIMITS.frequencyHz.min}
      max={NEAR_FAR_LIMITS.frequencyHz.max}
      scale="log"
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
    />
    <Slider
      label="Aperturdurchmesser D"
      bind:value={apertureM}
      min={NEAR_FAR_LIMITS.apertureM.min}
      max={NEAR_FAR_LIMITS.apertureM.max}
      scale="log"
      format={(v) => formatDistance(v, 2)}
      unitSymbol="m"
    />
    <Slider
      label="Beobachtungsabstand d"
      bind:value={distanceM}
      min={NEAR_FAR_LIMITS.distanceM.min}
      max={NEAR_FAR_LIMITS.distanceM.max}
      scale="log"
      format={(v) => formatDistance(v, 2)}
      unitSymbol="m"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Zone bei d"
      value={ZONE_LABELS[zone]}
      emphasis="hero"
      tone={zone === 'fern' ? 'success' : zone === 'strahlend' ? 'warning' : 'danger'}
      copyable={false}
    />
    <ResultCard
      label="Fernfeld ab 2·D²/λ"
      value={formatDistance(bounds.farFieldStartM, 2)}
      hint={large ? 'Apertur groß gegen λ — Näherung gültig' : 'D < λ: elektrisch kleine Antenne, es zählt λ/2π'}
      copyable={false}
    />
    <ResultCard
      label="Reaktive Grenze"
      value={formatDistance(bounds.reactiveEndM, 3)}
      hint="größerer Wert aus λ/2π und 0,62·√(D³/λ)"
      copyable={false}
    />
    <ResultCard label="Wellenlänge λ = c/f" value={formatWavelength(bounds.wavelengthM, 3)} copyable={false} />
  {/snippet}
</WidgetFrame>
