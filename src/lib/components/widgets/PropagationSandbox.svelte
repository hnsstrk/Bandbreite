<script lang="ts">
  /**
   * W9 – Ausbreitungs-Sandkasten: Antennenhöhen → Radiohorizont, Frequenz →
   * Bodenwelle / Raumwelle / Sichtverbindung auf einer schematischen Kugelerde
   * mit Ionosphäre. Rechnung in PropagationModel.ts ($lib/data/propagation).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import {
    computePropagationScene,
    sketchGeometry,
    sketchPoint,
    sketchArcPath,
    PROPAGATION_LIMITS,
    MODE_LABELS,
    SKETCH_WIDTH,
    SKETCH_HEIGHT
  } from './PropagationModel';

  /** Mindestspanne der Skizze in km, damit kurze Strecken lesbar bleiben */
  const MIN_SPAN_KM = 5;
  /** Reserve rechts/links der Strecke */
  const SPAN_FACTOR = 1.25;
  /** Relative Lage des Senders auf der Skizze (−0,5 … 0,5 der Spanne) */
  const TX_OFFSET = -0.42;
  const M_PER_KM = 1000;

  let txHeightM = $state<number>(PROPAGATION_LIMITS.heightM.defaultTx);
  let rxHeightM = $state<number>(PROPAGATION_LIMITS.heightM.defaultRx);
  let frequencyHz = $state<number>(PROPAGATION_LIMITS.frequencyHz.default);
  let isDay = $state(true);

  const scene = $derived(computePropagationScene(txHeightM, rxHeightM, frequencyHz, isDay));
  const sky = $derived(scene.mode === 'raumwelle');
  const spanKm = $derived.by(() => {
    if (sky) return Math.max((scene.skipDistanceKm ?? 0) * SPAN_FACTOR, scene.groundWaveRangeKm * 2, 1500);
    if (scene.mode === 'bodenwelle')
      return Math.max(scene.groundWaveRangeKm * 2, scene.losMaxKm * SPAN_FACTOR, MIN_SPAN_KM);
    return Math.max(scene.losMaxKm * SPAN_FACTOR, MIN_SPAN_KM);
  });
  const maxAltitudeKm = $derived(
    sky ? scene.reflectionHeightKm * 1.2 : (Math.max(txHeightM, rxHeightM) / M_PER_KM) * 1.4
  );
  const geo = $derived(sketchGeometry(spanKm, maxAltitudeKm));
  const txKm = $derived(spanKm * TX_OFFSET);
  const txTop = $derived(sketchPoint(geo, txKm, txHeightM / M_PER_KM));
  const txBase = $derived(sketchPoint(geo, txKm, 0));
  const rxKm = $derived(txKm + scene.losMaxKm);
  const rxTop = $derived(sketchPoint(geo, rxKm, rxHeightM / M_PER_KM));
  const rxBase = $derived(sketchPoint(geo, rxKm, 0));
  const horizonPoint = $derived(sketchPoint(geo, txKm + scene.horizonTxKm, 0));
  const groundPath = $derived(sketchArcPath(geo, txKm, txKm + scene.groundWaveRangeKm, 0.002 * maxAltitudeKm));
  const earthPath = $derived(sketchArcPath(geo, -spanKm / 2, spanKm / 2, 0, 48));
  const ionoPath = $derived(sketchArcPath(geo, -spanKm / 2, spanKm / 2, scene.reflectionHeightKm, 48));
  const skipEnd = $derived(scene.skipDistanceKm !== null ? txKm + scene.skipDistanceKm : null);
  const reflection = $derived(
    skipEnd !== null ? sketchPoint(geo, (txKm + skipEnd) / 2, scene.reflectionHeightKm) : null
  );
  const skipLanding = $derived(skipEnd !== null ? sketchPoint(geo, skipEnd, 0) : null);
  const skipZonePath = $derived(
    scene.skipZone
      ? sketchArcPath(geo, txKm + scene.skipZone.fromKm, txKm + scene.skipZone.toKm, 0.004 * maxAltitudeKm)
      : null
  );
  const modeTone = $derived(scene.mode === 'sichtlinie' ? 'brand' : scene.mode === 'raumwelle' ? 'warning' : 'success');
</script>

<WidgetFrame
  title="Ausbreitungs-Sandkasten"
  description="Schematische Kugelerde mit Sender und Empfänger: je nach Frequenz kriecht die Bodenwelle an der Oberfläche entlang, springt die Raumwelle über die Ionosphäre oder begrenzt der Radiohorizont die Sichtverbindung."
  footnote="Radiohorizont d = √(2·k·R·h) mit k = 4/3; Sprungdistanz und MUF nach dem Sekantengesetz (Spiegelmodell, h = {formatNumber(
    scene.reflectionHeightKm,
    0
  )} km, foF2 = {formatNumber(scene.foF2MHz, 1)} MHz). Bodenwellenreichweite nur als Faustregel; Höhen stark überhöht."
>
  <svg viewBox="0 0 {SKETCH_WIDTH} {SKETCH_HEIGHT}" aria-hidden="true">
    <path d="{earthPath} L{SKETCH_WIDTH},{SKETCH_HEIGHT} L0,{SKETCH_HEIGHT} Z" fill="var(--color-elevated)" />
    <path d={earthPath} fill="none" stroke="var(--color-ink-subtle)" stroke-width="2" />
    {#if sky}
      <path d={ionoPath} fill="none" stroke="var(--color-series-4)" stroke-width="10" opacity="0.35" />
      <text
        x={SKETCH_WIDTH - 12}
        y={sketchPoint(geo, spanKm / 2, scene.reflectionHeightKm).y - 10}
        text-anchor="end"
        class="chart-axis-text"
        >F-Schicht ({isDay ? 'Tag' : 'Nacht'}, {formatNumber(scene.reflectionHeightKm, 0)} km)</text
      >
    {/if}
    <!-- Bodenwelle -->
    <path
      d={groundPath}
      fill="none"
      stroke="var(--color-series-2)"
      stroke-width="5"
      stroke-linecap="round"
      opacity={scene.mode === 'bodenwelle' ? 1 : 0.4}
    />
    <!-- Tote Zone -->
    {#if skipZonePath}
      <path
        d={skipZonePath}
        fill="none"
        stroke="var(--color-series-6)"
        stroke-width="4"
        stroke-dasharray="6,6"
        opacity="0.7"
      />
    {/if}
    <!-- Raumwelle -->
    {#if sky && reflection && skipLanding}
      <path
        d="M{txTop.x},{txTop.y} L{reflection.x},{reflection.y} L{skipLanding.x},{skipLanding.y}"
        fill="none"
        stroke="var(--color-series-3)"
        stroke-width="2.5"
      />
      <circle cx={reflection.x} cy={reflection.y} r="5" fill="var(--color-series-3)" />
      <text x={skipLanding.x} y={skipLanding.y + 18} text-anchor="middle" class="chart-axis-text"
        >1. Sprung {formatNumber(scene.skipDistanceKm ?? 0, 0)} km</text
      >
    {:else if sky}
      <text x={txTop.x + 20} y={txTop.y - 20} class="chart-axis-text" fill="var(--color-danger)"
        >Frequenz über der MUF – Welle durchdringt die Ionosphäre</text
      >
    {/if}
    <!-- Sichtverbindung / Horizont -->
    {#if !sky}
      <line
        x1={txTop.x}
        y1={txTop.y}
        x2={horizonPoint.x}
        y2={horizonPoint.y}
        stroke="var(--color-series-1)"
        stroke-width="1.5"
        stroke-dasharray="5,4"
      />
      <line
        x1={txTop.x}
        y1={txTop.y}
        x2={rxTop.x}
        y2={rxTop.y}
        stroke="var(--color-series-1)"
        stroke-width="2.5"
        opacity={scene.mode === 'sichtlinie' ? 1 : 0.5}
      />
      <circle cx={horizonPoint.x} cy={horizonPoint.y} r="4" fill="var(--color-series-1)" />
      <text x={horizonPoint.x} y={horizonPoint.y + 18} text-anchor="middle" class="chart-axis-text"
        >Horizont {formatNumber(scene.horizonTxKm, 1)} km</text
      >
      <line x1={rxBase.x} y1={rxBase.y} x2={rxTop.x} y2={rxTop.y} stroke="var(--color-ink-subtle)" stroke-width="4" />
      <text x={rxTop.x} y={rxTop.y - 10} text-anchor="middle" class="chart-axis-text"
        >Empfänger {formatDistance(rxHeightM, 0)} · max. LOS {formatNumber(scene.losMaxKm, 1)} km</text
      >
    {/if}
    <line x1={txBase.x} y1={txBase.y} x2={txTop.x} y2={txTop.y} stroke="var(--color-ink-subtle)" stroke-width="4" />
    <text x={txTop.x} y={txTop.y - 10} text-anchor="middle" class="chart-axis-text"
      >Sender {formatDistance(txHeightM, 0)}</text
    >
    <text x={txBase.x} y={txBase.y + 34} text-anchor="middle" class="chart-legend-text"
      >Bodenwelle ≈ {formatNumber(scene.groundWaveRangeKm, 0)} km</text
    >
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des Ausbreitungs-Sandkastens</caption>
      <tbody>
        <tr><th>Frequenz</th><td>{formatFrequency(frequencyHz, 2)} – {MODE_LABELS[scene.mode]}</td></tr>
        <tr
          ><th>Radiohorizont Sender / Empfänger</th><td
            >{formatNumber(scene.horizonTxKm, 1)} km / {formatNumber(scene.horizonRxKm, 1)} km</td
          ></tr
        >
        <tr><th>Maximale Sichtverbindung</th><td>{formatNumber(scene.losMaxKm, 1)} km</td></tr>
        <tr><th>Bodenwelle (Faustregel)</th><td>{formatNumber(scene.groundWaveRangeKm, 0)} km</td></tr>
        <tr
          ><th>Sprungdistanz</th><td
            >{scene.skipDistanceKm === null ? 'keine Reflexion' : `${formatNumber(scene.skipDistanceKm, 0)} km`}</td
          ></tr
        >
        <tr><th>MUF (3000 km)</th><td>{formatNumber(scene.mufKm3000MHz, 1)} MHz</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Frequenz"
      bind:value={frequencyHz}
      min={PROPAGATION_LIMITS.frequencyHz.min}
      max={PROPAGATION_LIMITS.frequencyHz.max}
      scale="log"
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
      ticks={[
        { at: 100e3, label: 'LW' },
        { at: 1e6, label: 'MW' },
        { at: 10e6, label: 'KW' },
        { at: 100e6, label: 'UKW' },
        { at: 1e9, label: 'GHz' }
      ]}
    />
    <Slider
      label="Senderhöhe"
      bind:value={txHeightM}
      min={PROPAGATION_LIMITS.heightM.min}
      max={PROPAGATION_LIMITS.heightM.max}
      scale="log"
      format={(v) => formatDistance(v, 0)}
      unitSymbol="m"
    />
    <Slider
      label="Empfängerhöhe"
      bind:value={rxHeightM}
      min={PROPAGATION_LIMITS.heightM.min}
      max={PROPAGATION_LIMITS.heightM.max}
      scale="log"
      format={(v) => formatDistance(v, 0)}
      unitSymbol="m"
    />
    <div class="sandbox-toggle" role="group" aria-label="Tageszeit">
      <Button
        size="sm"
        variant={isDay ? 'primary' : 'secondary'}
        pressed={isDay}
        icon="sun"
        onclick={() => (isDay = true)}>Tag</Button
      >
      <Button
        size="sm"
        variant={!isDay ? 'primary' : 'secondary'}
        pressed={!isDay}
        icon="moon"
        onclick={() => (isDay = false)}>Nacht</Button
      >
    </div>
  {/snippet}

  {#snippet results()}
    <div class="sandbox-mode">
      <Badge tone={modeTone} size="md" dot srPrefix="Dominierender Modus">{MODE_LABELS[scene.mode]}</Badge>
    </div>
    <ResultCard
      label="Radiohorizont (Sender + Empfänger)"
      value={formatNumber(scene.losMaxKm, 1)}
      unit="km"
      secondary="{formatNumber(scene.horizonTxKm, 1)} + {formatNumber(scene.horizonRxKm, 1)} km"
      copyable={false}
    />
    {#if sky}
      <ResultCard
        label="Sprungdistanz"
        value={scene.skipDistanceKm === null ? '—' : formatNumber(scene.skipDistanceKm, 0)}
        unit={scene.skipDistanceKm === null ? undefined : 'km'}
        tone={scene.skipDistanceKm === null ? 'danger' : 'neutral'}
        secondary={scene.skipDistanceKm === null ? 'über der MUF' : undefined}
        copyable={false}
      />
      <ResultCard
        label="Tote Zone"
        value={scene.skipZone
          ? `${formatNumber(scene.skipZone.fromKm, 0)} – ${formatNumber(scene.skipZone.toKm, 0)}`
          : '—'}
        unit={scene.skipZone ? 'km' : undefined}
        tone={scene.skipZone ? 'warning' : 'neutral'}
        copyable={false}
      />
      <ResultCard label="MUF für 3000 km" value={formatNumber(scene.mufKm3000MHz, 1)} unit="MHz" copyable={false} />
    {:else}
      <ResultCard
        label="Bodenwelle (Faustregel)"
        value={formatNumber(scene.groundWaveRangeKm, 0)}
        unit="km"
        copyable={false}
      />
    {/if}
  {/snippet}
</WidgetFrame>

<style>
  .sandbox-toggle {
    display: flex;
    gap: 0.375rem;
  }

  .sandbox-mode {
    grid-column: 1 / -1;
  }
</style>
