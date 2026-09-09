<script lang="ts">
  /**
   * Ionosphäre im Tagesgang: Elektronendichte der Schichten D, E, F1 und F2
   * über der Höhe, gesteuert von der Ortszeit. Die Animation fährt einen
   * ganzen Tag ab. Gerechnet wird in IonosphereDayNightModel.ts.
   */
  import { untrack } from 'svelte';
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatExponential, formatNumber, formatPercentage } from '$lib/utils/formatting';
  import { clamp, safeLog } from '$lib/utils/handlers';
  import {
    DAY_NIGHT_LIMITS,
    SUNRISE_HOUR,
    SUNSET_HOUR,
    absorptionIndex,
    densityProfile,
    illumination,
    isDaylight,
    layerCriticalFrequencyMHz,
    layerStates,
    mufMHz
  } from './IonosphereDayNightModel';

  const W = 800;
  const H = 300;
  /** Profilfläche */
  const PX0 = 300;
  const PX1 = 636;
  const PY0 = 40;
  const PY1 = 250;
  const MAX_ALTITUDE_KM = 450;
  /** Dichteachse (logarithmisch) */
  const N_MIN = 1e8;
  const N_MAX = 2e12;
  /** Dauer eines simulierten Tages (ms) */
  const CYCLE_MS = 24_000;
  /** Farbe je Schicht — Reihenfolge wie IONOSPHERIC_LAYERS */
  const LAYER_COLORS = [
    'var(--color-series-6)',
    'var(--color-series-3)',
    'var(--color-series-2)',
    'var(--color-series-1)'
  ];

  let hourOfDay = $state<number>(DAY_NIGHT_LIMITS.hourOfDay.default);
  let distanceKm = $state<number>(DAY_NIGHT_LIMITS.distanceKm.default);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  // Die Animation schiebt die Ortszeit weiter; der Regler bleibt bedienbar,
  // weil hier nur der Zuwachs seit dem letzten Bild addiert wird.
  let lastMs = 0;
  $effect(() => {
    const now = loop.elapsedMs;
    const delta = now - lastMs;
    lastMs = now;
    if (delta <= 0) return;
    untrack(() => {
      hourOfDay = (hourOfDay + (delta / CYCLE_MS) * 24) % 24;
    });
  });

  const states = $derived(layerStates(hourOfDay));
  const profile = $derived(densityProfile(hourOfDay, MAX_ALTITUDE_KM));
  const sun = $derived(illumination(hourOfDay));
  const day = $derived(isDaylight(hourOfDay));
  const foF2 = $derived(layerCriticalFrequencyMHz('f2-layer', hourOfDay));
  const muf = $derived(mufMHz(hourOfDay, distanceKm));
  const absorption = $derived(absorptionIndex(hourOfDay));

  function ay(altitudeKm: number): number {
    return PY1 - (altitudeKm / MAX_ALTITUDE_KM) * (PY1 - PY0);
  }
  function nx(density: number): number {
    const span = safeLog(N_MAX / N_MIN, 10, 1);
    return PX0 + clamp(safeLog(Math.max(density, N_MIN) / N_MIN, 10, 0) / span, 0, 1) * (PX1 - PX0);
  }
  const profilePath = $derived(
    profile
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${nx(p.densityPerM3).toFixed(1)},${ay(p.altitudeKm).toFixed(1)}`)
      .join(' ')
  );
  /** Uhrzeit als „14:30". */
  function clockLabel(hour: number): string {
    const h = Math.floor(hour) % 24;
    const m = Math.floor((hour - Math.floor(hour)) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} Uhr`;
  }
  /** Sonnenbahn links: Bogen von Aufgang bis Untergang. */
  const sunT = $derived(clamp((hourOfDay - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR), 0, 1));
  const sunX = $derived(150 - 90 * Math.cos(Math.PI * sunT));
  const sunY = $derived(190 - sun * 90);
  const decades = [1e8, 1e9, 1e10, 1e11, 1e12];
</script>

<WidgetFrame
  title="Ionosphäre im Tagesgang"
  description="Links steht die Sonne über dem Horizont, rechts das Höhenprofil der Elektronendichte von 0 bis 450 Kilometern. Am Tag tragen alle vier Schichten, nachts verschwindet die D-Schicht, E wird schwach, F1 verschmilzt mit F2 — und nur die F2-Schicht hält die Kurzwelle noch oben."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  stacked
  footnote="Höhenprofil schematisch (Summe glockenförmiger Schichten, kein Chapman-Profil); Dichtewerte sind Richtwerte mittlerer Breiten bei mittlerer Sonnenaktivität nach Davies, Ionospheric Radio, und ITU-R P.1239."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Sonnenbahn -->
    <line x1="50" y1="200" x2="250" y2="200" stroke="var(--color-ink-muted)" stroke-width="2" />
    <path d="M60,190 A90,90 0 0 1 240,190" fill="none" class="chart-grid-line" />
    <circle cx={sunX} cy={sunY} r={day ? 12 : 8} fill={day ? 'var(--color-marker)' : 'var(--color-ink-subtle)'} />
    <text x="150" y="228" text-anchor="middle" class="chart-axis-text">{clockLabel(hourOfDay)} Ortszeit</text>
    <text x="150" y="246" text-anchor="middle" class="chart-legend-text">
      {day ? `Sonnenstand ${formatPercentage(sun * 100, 0)}` : 'Nacht — keine Neuionisation'}
    </text>
    <text x="60" y="216" text-anchor="middle" class="chart-legend-text">6 Uhr</text>
    <text x="240" y="216" text-anchor="middle" class="chart-legend-text">18 Uhr</text>

    <!-- Höhenprofil -->
    {#each states as layer, i (layer.id)}
      <rect
        x={PX0}
        y={ay(layer.altitudeMaxKm)}
        width={PX1 - PX0}
        height={Math.max(2, ay(layer.altitudeMinKm) - ay(layer.altitudeMaxKm))}
        fill={LAYER_COLORS[i]}
        fill-opacity={0.06 + layer.relative * 0.22}
        stroke={LAYER_COLORS[i]}
        stroke-width="1"
        stroke-opacity={0.25 + layer.relative * 0.6}
      />
      <text x={PX1 + 8} y={ay(layer.peakKm) + 4} class="chart-axis-text">
        {layer.nameDE} · {formatNumber(layer.criticalFrequencyMHz, 2)} MHz
      </text>
    {/each}
    <path d={profilePath} fill="none" stroke="var(--color-ink)" stroke-width="2.5" />
    <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} class="chart-axis-line" />
    <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} class="chart-axis-line" />
    {#each [0, 100, 200, 300, 400] as km (km)}
      <line x1={PX0 - 5} y1={ay(km)} x2={PX0} y2={ay(km)} class="chart-axis-line" />
      <text x={PX0 - 9} y={ay(km) + 4} text-anchor="end" class="chart-axis-text">{km} km</text>
    {/each}
    {#each decades as value (value)}
      <line x1={nx(value)} y1={PY1} x2={nx(value)} y2={PY1 + 5} class="chart-axis-line" />
      <text x={nx(value)} y={PY1 + 18} text-anchor="middle" class="chart-axis-text">{formatExponential(value, 0)}</text>
    {/each}
    <text x={PX0} y={PY0 - 14} class="chart-axis-text">Höhe über Grund</text>
    <text x={PX1} y={PY1 + 36} text-anchor="end" class="chart-axis-text">Elektronendichte in e⁻/m³ (logarithmisch)</text
    >
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Ionosphärische Schichten zur eingestellten Ortszeit</caption>
      <thead>
        <tr
          ><th scope="col">Schicht</th><th scope="col">Höhe</th><th scope="col">Elektronendichte</th><th scope="col"
            >Kritische Frequenz</th
          ></tr
        >
      </thead>
      <tbody>
        {#each states as layer (layer.id)}
          <tr>
            <th scope="row">{layer.nameDE}</th>
            <td>{layer.altitudeMinKm}–{layer.altitudeMaxKm} km</td>
            <td>{formatExponential(layer.densityPerM3, 2)} e⁻/m³</td>
            <td>{formatNumber(layer.criticalFrequencyMHz, 2)} MHz</td>
          </tr>
        {/each}
        <tr><th scope="row">Ortszeit</th><td colspan="3">{clockLabel(hourOfDay)} ({day ? 'Tag' : 'Nacht'})</td></tr>
        <tr
          ><th scope="row">MUF über {formatNumber(distanceKm, 0)} km</th><td colspan="3">{formatNumber(muf, 2)} MHz</td
          ></tr
        >
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Ortszeit"
      bind:value={hourOfDay}
      min={DAY_NIGHT_LIMITS.hourOfDay.min}
      max={DAY_NIGHT_LIMITS.hourOfDay.max}
      step={0.25}
      format={(v) => clockLabel(v)}
      unitSymbol="Uhr"
      ticks={[
        { at: 0, label: '0' },
        { at: 6, label: '6' },
        { at: 12, label: '12' },
        { at: 18, label: '18' },
        { at: 24, label: '24' }
      ]}
    />
    <Slider
      label="Sprungdistanz für die MUF"
      bind:value={distanceKm}
      min={DAY_NIGHT_LIMITS.distanceKm.min}
      max={DAY_NIGHT_LIMITS.distanceKm.max}
      step={50}
      format={(v) => `${formatNumber(v, 0)} km`}
      unitSymbol="km"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="foF2 (kritische Frequenz)"
      value={formatNumber(foF2, 2)}
      unit="MHz"
      emphasis="hero"
      tone={day ? 'success' : 'neutral'}
      hint="senkrechter Einfall"
      copyable={false}
    />
    <ResultCard
      label="MUF über {formatNumber(distanceKm, 0)} km"
      value={formatNumber(muf, 2)}
      unit="MHz"
      hint="Sekantengesetz, h = 300 km"
      copyable={false}
    />
    <ResultCard
      label="D-Schicht-Absorption"
      value={formatPercentage(absorption * 100, 0)}
      hint={absorption > 0.3 ? 'untere Bänder am Tag gedämpft' : 'nachts frei — 80 m wird weit'}
      tone={absorption > 0.3 ? 'warning' : 'success'}
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
