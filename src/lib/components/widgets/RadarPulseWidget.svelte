<script lang="ts">
  /**
   * W1 – Radar-Impuls: Sender → Impuls läuft zum Ziel und zurück, darunter die
   * Zeitachse mit Impulsdauer τ, Laufzeit 2R/c und Pulswiederholintervall PRI.
   * Rechnung in RadarPulseModel.ts (nutzt $lib/utils/radar).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatDistance, formatNumber } from '$lib/utils/formatting';
  import {
    computeRadarPulse,
    pulsePositionAt,
    timelineFraction,
    RADAR_PULSE_LIMITS,
    MIN_PULSE_DRAW_FRACTION
  } from './RadarPulseModel';

  /** Dauer eines Zeitachsen-Durchlaufs (2 PRI) in Echtzeit-Millisekunden */
  const CYCLE_MS = 6000;
  const W = 800;
  const SCENE_Y = 70;
  const RADAR_X = 70;
  const TARGET_X = 730;
  const AXIS_Y = 190;
  const AXIS_X0 = 70;
  const AXIS_X1 = 770;
  const PULSE_H = 28;

  let rangeM = $state<number>(RADAR_PULSE_LIMITS.rangeM.default);
  let pulseWidthS = $state<number>(RADAR_PULSE_LIMITS.pulseWidthS.default);
  let prfHz = $state<number>(RADAR_PULSE_LIMITS.prfHz.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const result = $derived(computeRadarPulse(rangeM, pulseWidthS, prfHz));
  /** Aktuelle Modellzeit innerhalb von zwei PRI */
  const tS = $derived(((loop.elapsedMs % CYCLE_MS) / CYCLE_MS) * 2 * result.priS);
  const pulse = $derived(pulsePositionAt(tS, rangeM));
  const echoPending = $derived(tS > result.roundTripS);

  function axisX(fraction: number): number {
    return AXIS_X0 + fraction * (AXIS_X1 - AXIS_X0);
  }
  const pulseDrawWidth = $derived(
    (AXIS_X1 - AXIS_X0) * Math.max(MIN_PULSE_DRAW_FRACTION, timelineFraction(pulseWidthS, result.priS))
  );
  const echoX = $derived(axisX(timelineFraction(result.roundTripS, result.priS)));
  const nextPulseX = $derived(axisX(0.5));
  const cursorX = $derived(axisX(timelineFraction(tS, result.priS)));
  const pulseSceneX = $derived(RADAR_X + pulse.fraction * (TARGET_X - RADAR_X));

  const us = (seconds: number) => formatNumber(seconds * 1e6, 1);
</script>

<WidgetFrame
  title="Impuls, Laufzeit und Eindeutigkeit"
  description="Ein Radarimpuls läuft vom Sender zum Ziel und als Echo zurück; die Zeitachse zeigt Impulsdauer, Laufzeit und Pulswiederholintervall."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Animation stark verlangsamt: ein Durchlauf entspricht zwei Pulswiederholintervallen. ΔR = c·τ/2, R_u = c/(2·PRF), t = 2R/c."
>
  <svg viewBox="0 0 {W} 240" aria-hidden="true">
    <!-- Szene -->
    <line x1="40" y1={SCENE_Y + 30} x2={W - 40} y2={SCENE_Y + 30} class="chart-axis-line" />
    <g transform="translate({RADAR_X}, {SCENE_Y})">
      <rect x="-8" y="0" width="16" height="30" fill="var(--color-ink-subtle)" />
      <path d="M-22,-4 A22,22 0 0 1 22,-4" fill="none" stroke="var(--color-series-1)" stroke-width="3" />
      <text x="0" y="50" text-anchor="middle" class="chart-axis-text">Radar</text>
    </g>
    <g transform="translate({TARGET_X}, {SCENE_Y})">
      <path d="M0,0 L-34,6 L-28,0 L-34,-6 Z" fill="var(--color-ink-muted)" />
      <path d="M-18,-2 L-18,2 L-40,10 L-40,-10 Z" fill="var(--color-ink-subtle)" />
      <text x="-16" y="50" text-anchor="middle" class="chart-axis-text">Ziel · R = {formatDistance(rangeM, 1)}</text>
    </g>
    {#if pulse.phase !== 'pause'}
      <g transform="translate({pulseSceneX}, {SCENE_Y})">
        {#each [0, 1, 2] as i (i)}
          <circle
            cx={pulse.phase === 'hin' ? -i * 8 : i * 8}
            cy="0"
            r={10 - i * 3}
            fill="none"
            stroke={pulse.phase === 'hin' ? 'var(--color-series-1)' : 'var(--color-series-2)'}
            stroke-width="2"
            opacity={1 - i * 0.3}
          />
        {/each}
      </g>
    {/if}
    <g transform="translate(300, 18)">
      <circle cx="0" cy="0" r="5" fill="var(--color-series-1)" />
      <text x="10" y="4" class="chart-legend-text">Sendeimpuls</text>
      <circle cx="110" cy="0" r="5" fill="var(--color-series-2)" />
      <text x="120" y="4" class="chart-legend-text">Echo</text>
    </g>

    <!-- Zeitachse -->
    <line x1={AXIS_X0} y1={AXIS_Y} x2={AXIS_X1} y2={AXIS_Y} class="chart-axis-line" />
    <text x={AXIS_X1} y={AXIS_Y + 18} text-anchor="end" class="chart-axis-text">Zeit →</text>
    <rect x={AXIS_X0} y={AXIS_Y - PULSE_H} width={pulseDrawWidth} height={PULSE_H} fill="var(--color-series-1)" />
    <rect
      x={nextPulseX}
      y={AXIS_Y - PULSE_H}
      width={pulseDrawWidth}
      height={PULSE_H}
      fill="var(--color-series-1)"
      opacity="0.6"
    />
    <rect
      x={echoX}
      y={AXIS_Y - PULSE_H * 0.6}
      width={pulseDrawWidth}
      height={PULSE_H * 0.6}
      fill="var(--color-series-2)"
      opacity={echoPending ? 1 : 0.35}
    />
    <text x={AXIS_X0} y={AXIS_Y - PULSE_H - 6} class="chart-axis-text">τ = {us(pulseWidthS)} µs</text>
    <text x={nextPulseX} y={AXIS_Y - PULSE_H - 6} class="chart-axis-text">PRI = {us(result.priS)} µs</text>
    <text x={echoX + pulseDrawWidth + 4} y={AXIS_Y - 4} class="chart-axis-text" fill="var(--color-cat-green)">
      Echo bei 2R/c = {us(result.roundTripS)} µs
    </text>
    <line x1={cursorX} y1={AXIS_Y - 44} x2={cursorX} y2={AXIS_Y + 8} class="chart-marker-crosshair" />
    {#if result.ambiguous}
      <text x={AXIS_X0} y={AXIS_Y + 34} class="chart-axis-text" fill="var(--color-danger)">
        Echo trifft erst nach dem nächsten Sendeimpuls ein – Entfernung mehrdeutig
      </text>
    {/if}
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des Radar-Impuls-Widgets</caption>
      <tbody>
        <tr><th>Zielentfernung</th><td>{formatDistance(rangeM, 1)}</td></tr>
        <tr><th>Impulsdauer</th><td>{us(pulseWidthS)} µs</td></tr>
        <tr><th>PRF</th><td>{formatNumber(prfHz, 0)} Hz</td></tr>
        <tr><th>Laufzeit</th><td>{us(result.roundTripS)} µs</td></tr>
        <tr><th>Entfernungsauflösung</th><td>{formatDistance(result.rangeResolutionM, 1)}</td></tr>
        <tr><th>Eindeutige Entfernung</th><td>{formatDistance(result.unambiguousRangeM, 1)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Zielentfernung R"
      bind:value={rangeM}
      min={RADAR_PULSE_LIMITS.rangeM.min}
      max={RADAR_PULSE_LIMITS.rangeM.max}
      scale="log"
      format={(v) => formatDistance(v, 1)}
      unitSymbol="m"
    />
    <Slider
      label="Impulsdauer τ"
      bind:value={pulseWidthS}
      min={RADAR_PULSE_LIMITS.pulseWidthS.min}
      max={RADAR_PULSE_LIMITS.pulseWidthS.max}
      scale="log"
      format={(v) => `${us(v)} µs`}
      unitSymbol="µs"
    />
    <Slider
      label="Pulswiederholfrequenz PRF"
      bind:value={prfHz}
      min={RADAR_PULSE_LIMITS.prfHz.min}
      max={RADAR_PULSE_LIMITS.prfHz.max}
      scale="log"
      format={(v) => `${formatNumber(v, 0)} Hz`}
      unitSymbol="Hz"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard label="Laufzeit 2R/c" value={us(result.roundTripS)} unit="µs" copyable={false} />
    <ResultCard label="Auflösung c·τ/2" value={formatDistance(result.rangeResolutionM, 1)} copyable={false} />
    <ResultCard
      label="Eindeutig bis c/(2·PRF)"
      value={formatDistance(result.unambiguousRangeM, 1)}
      tone={result.ambiguous ? 'danger' : 'success'}
      copyable={false}
    />
    {#if result.ambiguous}
      <Callout tone="warning" title="Mehrdeutigkeit">
        Das Ziel liegt jenseits der eindeutigen Entfernung – das Echo wird dem falschen Impuls zugeordnet. PRF senken
        oder Entfernung verringern.
      </Callout>
    {:else if result.blind}
      <Callout tone="warning" title="Blindbereich">
        Das Echo trifft ein, während noch gesendet wird – Ziele näher als c·τ/2 sind nicht messbar.
      </Callout>
    {/if}
  {/snippet}
</WidgetFrame>
