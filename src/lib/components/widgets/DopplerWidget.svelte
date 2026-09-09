<script lang="ts">
  /**
   * W2 – Doppler: Ziel mit Radialgeschwindigkeit, Trägerfrequenz wählbar;
   * Wellenfronten des Echos werden gestaucht (Annäherung) oder gedehnt (Entfernen).
   * Rechnung in DopplerModel.ts (nutzt calculateDopplerShift aus $lib/utils/radar).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatFrequency, formatNumber, formatWavelength } from '$lib/utils/formatting';
  import {
    computeDoppler,
    visualWavelengthFactor,
    msToKmh,
    DOPPLER_CARRIERS,
    DOPPLER_VELOCITY_LIMITS,
    DEFAULT_DOPPLER_CARRIER_ID
  } from './DopplerModel';

  const W = 800;
  const H = 250;
  const RADAR_X = 90;
  const TARGET_X = 700;
  const BEAM_Y = 110;
  /** Grundabstand der gezeichneten Wellenfronten bei v = 0 (px) */
  const BASE_SPACING = 34;
  /** Geschwindigkeit der Wellenfront-Animation in px/s */
  const FRONT_SPEED = 60;
  /** Spektrum-Inset unterhalb der Szene (überlappt keine Beschriftung) */
  const SPECTRUM_X0 = 300;
  const SPECTRUM_Y = 236;
  const SPECTRUM_W = 240;

  let velocityMs = $state<number>(DOPPLER_VELOCITY_LIMITS.default);
  let carrierId = $state<string>(DEFAULT_DOPPLER_CARRIER_ID);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const carrier = $derived(DOPPLER_CARRIERS.find((c) => c.id === carrierId) ?? DOPPLER_CARRIERS[0]);
  const result = $derived(computeDoppler(velocityMs, carrier.frequencyHz));
  const spacing = $derived(BASE_SPACING * visualWavelengthFactor(velocityMs));
  /**
   * Fortschritt der Wellenfronten als Bruchteil eines Frontabstands: die
   * Phase bleibt beim Verstellen des Reglers erhalten, statt beim Wechsel
   * des Modulo-Teilers zu springen.
   */
  const travel = $derived(((((loop.elapsedMs / 1000) * FRONT_SPEED) / BASE_SPACING) % 1) * spacing);
  const fronts = $derived.by(() => {
    const xs: number[] = [];
    for (let x = TARGET_X - 40 - travel; x > RADAR_X + 40; x -= spacing) xs.push(x);
    return xs;
  });
  /** Übertriebene Lage der Empfangslinie im Spektrum-Inset */
  const spectrumShift = $derived((velocityMs / DOPPLER_VELOCITY_LIMITS.max) * SPECTRUM_W * 0.35);
  const directionLabel = $derived(
    result.direction === 'naehert' ? 'nähert sich' : result.direction === 'entfernt' ? 'entfernt sich' : 'ruht'
  );
  const carrierOptions = DOPPLER_CARRIERS.map((c) => ({ value: c.id, label: c.label }));
</script>

<WidgetFrame
  title="Doppler-Verschiebung"
  description="Ein Ziel bewegt sich relativ zum Radar; die zurücklaufenden Wellenfronten sind bei Annäherung gestaucht und beim Entfernen gedehnt."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Stauchung stark übertrieben: real ist f_d/f = 2v/c, bei 100 m/s nur 7·10⁻⁷. Vorzeichen: positiv = Annäherung (Frequenz steigt)."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <line x1="40" y1={BEAM_Y + 40} x2={W - 40} y2={BEAM_Y + 40} class="chart-axis-line" />
    <g transform="translate({RADAR_X}, {BEAM_Y})">
      <rect x="-8" y="10" width="16" height="30" fill="var(--color-ink-subtle)" />
      <path d="M-22,6 A22,22 0 0 1 22,6" fill="none" stroke="var(--color-series-1)" stroke-width="3" />
      <text x="0" y="60" text-anchor="middle" class="chart-axis-text"
        >Radar · {formatFrequency(carrier.frequencyHz, 3)}</text
      >
    </g>
    <g transform="translate({TARGET_X}, {BEAM_Y})">
      <rect x="-36" y="14" width="72" height="24" rx="6" fill="var(--color-ink-muted)" />
      <rect x="-24" y="2" width="44" height="16" rx="4" fill="var(--color-ink-subtle)" />
      <circle cx="-20" cy="40" r="6" fill="var(--color-ink)" />
      <circle cx="20" cy="40" r="6" fill="var(--color-ink)" />
      {#if velocityMs !== 0}
        <line
          x1="0"
          y1="-14"
          x2={velocityMs > 0 ? -50 : 50}
          y2="-14"
          stroke="var(--color-series-3)"
          stroke-width="3"
          marker-end="url(#doppler-arrow)"
        />
      {/if}
      <text x="0" y="60" text-anchor="middle" class="chart-axis-text">Ziel {directionLabel}</text>
    </g>
    {#each fronts as x, i (i)}
      <path
        d="M{x},{BEAM_Y - 26} Q{x - 10},{BEAM_Y} {x},{BEAM_Y + 26}"
        fill="none"
        stroke="var(--color-series-2)"
        stroke-width="2"
      />
    {/each}
    <text x={(RADAR_X + TARGET_X) / 2} y="40" text-anchor="middle" class="chart-legend-text">
      Echo-Wellenfronten, Abstand ∝ λ′ ({velocityMs > 0 ? 'gestaucht' : velocityMs < 0 ? 'gedehnt' : 'unverändert'})
    </text>

    <!-- Spektrum-Inset -->
    <g transform="translate({SPECTRUM_X0}, {SPECTRUM_Y})">
      <line x1="0" y1="0" x2={SPECTRUM_W} y2="0" class="chart-axis-line" />
      <line x1={SPECTRUM_W / 2} y1="0" x2={SPECTRUM_W / 2} y2="-28" stroke="var(--color-series-1)" stroke-width="2" />
      <line
        x1={SPECTRUM_W / 2 + spectrumShift}
        y1="0"
        x2={SPECTRUM_W / 2 + spectrumShift}
        y2="-28"
        stroke="var(--color-series-2)"
        stroke-width="2"
      />
      <text x={SPECTRUM_W / 2} y="14" text-anchor="middle" class="chart-axis-text">f</text>
      <text x={SPECTRUM_W / 2 + spectrumShift} y="-32" text-anchor="middle" class="chart-legend-text">f + f_d</text>
      <text x={SPECTRUM_W} y="14" text-anchor="end" class="chart-legend-text">Frequenz →</text>
    </g>
    <defs>
      <marker id="doppler-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-series-3)" />
      </marker>
    </defs>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des Doppler-Widgets</caption>
      <tbody>
        <tr><th>Trägerfrequenz</th><td>{formatFrequency(carrier.frequencyHz, 3)}</td></tr>
        <tr
          ><th>Radialgeschwindigkeit</th><td
            >{formatNumber(velocityMs, 0)} m/s ({formatNumber(msToKmh(velocityMs), 0)} km/h)</td
          ></tr
        >
        <tr><th>Doppler-Frequenz</th><td>{formatNumber(result.dopplerHz, 1)} Hz</td></tr>
        <tr><th>Richtung</th><td>Ziel {directionLabel}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Trägerfrequenz" bind:value={carrierId} options={carrierOptions} />
    <Slider
      label="Radialgeschwindigkeit v"
      bind:value={velocityMs}
      min={DOPPLER_VELOCITY_LIMITS.min}
      max={DOPPLER_VELOCITY_LIMITS.max}
      step={1}
      format={(v) => `${formatNumber(v, 0)} m/s (${formatNumber(msToKmh(v), 0)} km/h)`}
      unitSymbol="m/s"
      ticks={[
        { at: -300, label: '−300' },
        { at: 0, label: '0' },
        { at: 300, label: '+300' }
      ]}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Doppler-Frequenz f_d = 2·v·f/c"
      value={formatNumber(result.dopplerHz, 1)}
      unit="Hz"
      emphasis="hero"
      tone={result.direction === 'ruht' ? 'neutral' : 'success'}
      copyable={false}
    />
    <ResultCard label="Wellenlänge λ" value={formatWavelength(result.wavelengthM)} copyable={false} />
    <Callout tone="tip" title="Vorzeichen">
      Nähert sich das Ziel (v &gt; 0), trifft pro Sekunde mehr Wellenfronten ein – die Empfangsfrequenz steigt, f_d ist
      positiv. Entfernt es sich, sinkt sie. Der Faktor 2 entsteht, weil die Welle hin und zurück läuft.
    </Callout>
  {/snippet}
</WidgetFrame>
