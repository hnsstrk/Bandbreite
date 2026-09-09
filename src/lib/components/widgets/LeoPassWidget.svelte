<script lang="ts">
  /**
   * LEO-Überflug: Elevation und Dopplerverschiebung über der Zeit eines
   * Durchgangs, mit laufender Marke. Rechnung in LeoPassModel.ts
   * (Bahnmechanik aus $lib/utils/orbitMath).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatAngle, formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import { maxDopplerShift } from '$lib/utils/orbitMath';
  import { passProfile, sampleAt, LEO_PASS_LIMITS, LEO_USABLE_ELEVATION_DEG } from './LeoPassModel';

  const W = 800;
  const H = 300;
  const PAD = { left: 58, right: 66, top: 26, bottom: 44 };
  const PLOT_W = W - PAD.left - PAD.right;
  const PLOT_H = H - PAD.top - PAD.bottom;
  /** Stützstellen des Profils */
  const SAMPLES = 121;
  /** Dauer eines Durchlaufs der Marke in ms */
  const SWEEP_MS = 9000;
  /** Höchste dargestellte Elevation in Grad */
  const ELEV_MAX_DEG = 90;

  let altitudeKm = $state<number>(LEO_PASS_LIMITS.altitudeM.default / 1000);
  let maxElevationDeg = $state<number>(LEO_PASS_LIMITS.maxElevationDeg.default);
  let frequencyHz = $state<number>(LEO_PASS_LIMITS.frequencyHz.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const profile = $derived(passProfile(altitudeKm * 1000, maxElevationDeg, frequencyHz, SAMPLES));
  const half = $derived(profile.durationS / 2);
  /** Zeitpunkt der Marke: läuft von Aufgang bis Untergang */
  const markerTimeS = $derived(((loop.elapsedMs % SWEEP_MS) / SWEEP_MS) * profile.durationS - half);
  const current = $derived(sampleAt(profile, markerTimeS));
  const dopplerScaleHz = $derived(Math.max(1, profile.maxDopplerHz));

  const x = (timeS: number) => PAD.left + (half > 0 ? (timeS + half) / (2 * half) : 0.5) * PLOT_W;
  const yElev = (deg: number) => PAD.top + PLOT_H - (deg / ELEV_MAX_DEG) * PLOT_H;
  const yDoppler = (hz: number) => PAD.top + PLOT_H / 2 - (hz / dopplerScaleHz) * (PLOT_H / 2);

  const elevationPath = $derived(
    profile.samples
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.timeS).toFixed(2)},${yElev(s.elevationDeg).toFixed(2)}`)
      .join(' ')
  );
  const dopplerPath = $derived(
    profile.samples
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.timeS).toFixed(2)},${yDoppler(s.dopplerHz).toFixed(2)}`)
      .join(' ')
  );

  const minutes = (seconds: number) => `${formatNumber(seconds / 60, 1)} min`;
  const khz = (hz: number) => formatFrequency(Math.abs(hz), 2);
</script>

<WidgetFrame
  title="LEO-Überflug: Elevation und Doppler über der Zeit"
  description="Verlauf eines Satellitendurchgangs: Die Elevation steigt vom Horizont bis zur größten Höhe und fällt wieder; die Dopplerverschiebung wechselt dabei von positiv über null nach negativ."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Kreisbahn, ruhende Erde, Kulmination in der Bildmitte. Umlaufzeit {minutes(
    profile.periodS
  )}, Bahngeschwindigkeit {formatNumber(
    profile.velocityMs / 1000,
    2
  )} km/s. Obere Schranke der Verschiebung f·v/c = {khz(maxDopplerShift(frequencyHz, altitudeKm * 1000))}."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={W - PAD.right} y2={PAD.top + PLOT_H} class="chart-axis-line" />
    <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} class="chart-axis-line" />
    <line x1={W - PAD.right} y1={PAD.top} x2={W - PAD.right} y2={PAD.top + PLOT_H} class="chart-axis-line" />

    {#each [0, 30, 60, 90] as tick (tick)}
      <line x1={PAD.left} y1={yElev(tick)} x2={W - PAD.right} y2={yElev(tick)} class="chart-grid-line" />
      <text x={PAD.left - 8} y={yElev(tick) + 4} text-anchor="end" class="chart-axis-text">{tick}°</text>
    {/each}
    <line
      x1={PAD.left}
      y1={yElev(LEO_USABLE_ELEVATION_DEG)}
      x2={W - PAD.right}
      y2={yElev(LEO_USABLE_ELEVATION_DEG)}
      stroke="var(--color-series-6)"
      stroke-dasharray="5 4"
    />
    <text x={PAD.left + 6} y={yElev(LEO_USABLE_ELEVATION_DEG) - 6} class="chart-legend-text">
      nutzbar ab {formatNumber(LEO_USABLE_ELEVATION_DEG, 0)}°
    </text>

    <text x={W - PAD.right + 8} y={yDoppler(dopplerScaleHz) + 4} class="chart-axis-text">+{khz(dopplerScaleHz)}</text>
    <text x={W - PAD.right + 8} y={yDoppler(0) + 4} class="chart-axis-text">0</text>
    <text x={W - PAD.right + 8} y={yDoppler(-dopplerScaleHz) + 4} class="chart-axis-text">−{khz(dopplerScaleHz)}</text>

    <path d={elevationPath} fill="none" stroke="var(--color-series-1)" stroke-width="2.5" />
    <path d={dopplerPath} fill="none" stroke="var(--color-series-3)" stroke-width="2.5" stroke-dasharray="7 4" />

    {#if current}
      <line
        x1={x(current.timeS)}
        y1={PAD.top}
        x2={x(current.timeS)}
        y2={PAD.top + PLOT_H}
        stroke="var(--color-marker)"
        stroke-dasharray="3 3"
      />
      <circle cx={x(current.timeS)} cy={yElev(current.elevationDeg)} r="6" fill="var(--color-series-1)" />
      <circle cx={x(current.timeS)} cy={yDoppler(current.dopplerHz)} r="6" fill="var(--color-series-3)" />
      <text x={W - PAD.right - 6} y={PAD.top + 14} text-anchor="end" class="chart-legend-text">
        {formatAngle(current.elevationDeg, 0)} · {formatDistance(current.slantRangeM, 0)} · {current.dopplerHz >= 0
          ? '+'
          : '−'}{khz(current.dopplerHz)}
      </text>
    {/if}

    <text x={PAD.left} y={H - 14} class="chart-axis-text">Aufgang</text>
    <text x={PAD.left + PLOT_W / 2} y={H - 14} text-anchor="middle" class="chart-axis-text">
      Kulmination · Überflug {minutes(profile.durationS)}
    </text>
    <text x={W - PAD.right} y={H - 14} text-anchor="end" class="chart-axis-text">Untergang</text>

    <g transform="translate({PAD.left + 12}, {PAD.top + 12})">
      <line x1="0" y1="0" x2="18" y2="0" stroke="var(--color-series-1)" stroke-width="2.5" />
      <text x="24" y="4" class="chart-legend-text">Elevation</text>
      <line x1="110" y1="0" x2="128" y2="0" stroke="var(--color-series-3)" stroke-width="2.5" stroke-dasharray="7 4" />
      <text x="134" y="4" class="chart-legend-text">Doppler</text>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Kennwerte des Überflugs</caption>
      <tbody>
        <tr><th>Bahnhöhe</th><td>{formatDistance(altitudeKm * 1000, 0)}</td></tr>
        <tr><th>Größte Elevation</th><td>{formatAngle(maxElevationDeg, 0)}</td></tr>
        <tr><th>Frequenz</th><td>{formatFrequency(frequencyHz, 2)}</td></tr>
        <tr><th>Umlaufzeit</th><td>{minutes(profile.periodS)}</td></tr>
        <tr><th>Dauer über dem Horizont</th><td>{minutes(profile.durationS)}</td></tr>
        <tr
          ><th>Dauer über {formatNumber(LEO_USABLE_ELEVATION_DEG, 0)}°</th><td>{minutes(profile.usableDurationS)}</td
          ></tr
        >
        <tr><th>Kleinste Entfernung</th><td>{formatDistance(profile.minRangeM, 0)}</td></tr>
        <tr><th>Größte Entfernung</th><td>{formatDistance(profile.maxRangeM, 0)}</td></tr>
        <tr><th>Größte Dopplerverschiebung</th><td>±{khz(profile.maxDopplerHz)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Bahnhöhe"
      bind:value={altitudeKm}
      min={LEO_PASS_LIMITS.altitudeM.min / 1000}
      max={LEO_PASS_LIMITS.altitudeM.max / 1000}
      step={10}
      format={(v) => `${formatNumber(v, 0)} km`}
      unitSymbol="km"
    />
    <Slider
      label="Größte Elevation des Durchgangs"
      bind:value={maxElevationDeg}
      min={LEO_PASS_LIMITS.maxElevationDeg.min}
      max={LEO_PASS_LIMITS.maxElevationDeg.max}
      step={1}
      format={(v) => formatAngle(v, 0)}
      unitSymbol="Grad"
    />
    <Slider
      label="Frequenz"
      bind:value={frequencyHz}
      min={LEO_PASS_LIMITS.frequencyHz.min}
      max={LEO_PASS_LIMITS.frequencyHz.max}
      scale="log"
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Dauer des Überflugs"
      value={minutes(profile.durationS)}
      hint="über {formatNumber(LEO_USABLE_ELEVATION_DEG, 0)}° nur {minutes(profile.usableDurationS)}"
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Dopplerverschiebung"
      value="±{khz(profile.maxDopplerHz)}"
      hint="Vorzeichenwechsel im Kulminationspunkt"
      copyable={false}
    />
    <ResultCard
      label="Entfernung"
      value={formatDistance(profile.minRangeM, 0)}
      hint="am Horizont {formatDistance(profile.maxRangeM, 0)}"
      copyable={false}
    />
    <Callout tone="info" title="Was daraus für den Betrieb folgt">
      Ein niedriger Durchgang dauert nur wenige Minuten und bleibt weit entfernt; ein hoher bringt kurze Wege und starke
      Pegel, verlangt aber ein schnelles Nachführen von Antenne und Empfangsfrequenz. Die Verschiebung durchläuft in
      wenigen Minuten den vollen Bereich von +{khz(profile.maxDopplerHz)} auf −{khz(profile.maxDopplerHz)} — bei schmalbandigen
      Betriebsarten muss der Empfänger permanent nachgestimmt werden.
    </Callout>
  {/snippet}
</WidgetFrame>
