<script lang="ts">
  /**
   * Polardiagramm-Generator: Bauform wählen, Muster ansehen, Kennwerte
   * ablesen. Die Muster sind analytisch (Dipol, Kurzdipol, Gruppenfaktor)
   * oder parametrisiert (Yagi und Parabol als Gaußkeule aus dem Gewinn).
   */
  import { untrack } from 'svelte';
  import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import AntennaPolarPlot from './AntennaPolarPlot.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import {
    PATTERN_FLOOR_DB,
    arrayGainDbi,
    beamwidthFromGainDeg,
    dbiToDbd,
    frontToBackRatioDb,
    halfPowerBeamwidthDeg,
    mainLobeAngleDeg,
    samplePattern,
    type PatternConfig,
    type PatternType
  } from '$lib/utils/antennaMath';
  import { GAIN_DIPOLE_DBI } from '$lib/data/antennas';
  import {
    ARRAY_MAX_ELEMENTS,
    ARRAY_MAX_SPACING,
    ARRAY_MAX_STEER_DEG,
    ARRAY_MIN_ELEMENTS,
    ARRAY_MIN_SPACING,
    ARRAY_MIN_STEER_DEG,
    PATTERN_CHOICES,
    PATTERN_STEP_DEG
  } from './AntennaPatternOptions';

  interface Props {
    /** Anfangs gewählte Bauform */
    initialType?: PatternType;
  }

  let { initialType = 'dipol' }: Props = $props();

  let type = $state<PatternType>(untrack(() => initialType));
  let scale = $state<'db' | 'linear'>('db');
  let gainDbi = $state(12);
  let elementCount = $state(4);
  let spacing = $state(0.5);
  let steerDeg = $state(90);

  const choice = $derived(PATTERN_CHOICES.find((entry) => entry.id === type) ?? PATTERN_CHOICES[0]);
  const adjustable = $derived(choice.gainMinDbi !== undefined);

  function selectType(next: PatternType) {
    type = next;
    const entry = PATTERN_CHOICES.find((item) => item.id === next);
    if (entry?.gainMinDbi !== undefined && entry.gainMaxDbi !== undefined) {
      gainDbi = Math.min(Math.max(gainDbi, entry.gainMinDbi), entry.gainMaxDbi);
    }
  }

  const config = $derived<PatternConfig>({
    type,
    beamwidthDeg: adjustable ? beamwidthFromGainDeg(gainDbi) : undefined,
    frontToBackDb: choice.frontToBackDb,
    elementCount,
    spacingWavelengths: spacing,
    steerDeg
  });

  const samples = $derived(samplePattern(config, PATTERN_STEP_DEG));
  const beamwidth = $derived(halfPowerBeamwidthDeg(samples));
  const frontToBack = $derived(frontToBackRatioDb(samples));
  const mainLobe = $derived(mainLobeAngleDeg(samples));
  const omnidirectional = $derived(beamwidth >= 360);

  /** Gewinnschätzung: fest, eingestellt oder aus der Elementzahl. */
  const gainEstimateDbi = $derived(
    type === 'array' ? arrayGainDbi(GAIN_DIPOLE_DBI, elementCount) : adjustable ? gainDbi : (choice.fixedGainDbi ?? 0)
  );

  const description = $derived(
    `Polardiagramm ${choice.label}: Hauptstrahlrichtung ${formatNumber(mainLobe, 0)} Grad, ` +
      `Halbwertsbreite ${omnidirectional ? 'rundum gleich' : `${formatNumber(beamwidth, 1)} Grad`}, ` +
      `Gewinn rund ${formatNumber(gainEstimateDbi, 1)} dBi.`
  );
</script>

<div class="widget">
  <div class="types" role="group" aria-label="Antennenbauform wählen">
    {#each PATTERN_CHOICES as entry (entry.id)}
      <Button
        size="sm"
        variant={type === entry.id ? 'primary' : 'secondary'}
        pressed={type === entry.id}
        onclick={() => selectType(entry.id)}
      >
        {entry.label}
      </Button>
    {/each}
  </div>

  <p class="hint">{choice.hint}</p>

  <div class="controls">
    {#if adjustable}
      <Slider
        label="Gewinn"
        bind:value={gainDbi}
        min={choice.gainMinDbi ?? 0}
        max={choice.gainMaxDbi ?? 20}
        step={0.5}
        format={(value) => `${formatNumber(value, 1)} dBi`}
        unitSymbol="dBi"
        hint="Die Halbwertsbreite folgt daraus über θ ≈ √(41253 / G)."
      />
    {/if}
    {#if type === 'array'}
      <Slider
        label="Elementzahl N"
        bind:value={elementCount}
        min={ARRAY_MIN_ELEMENTS}
        max={ARRAY_MAX_ELEMENTS}
        step={1}
        format={(value) => formatNumber(value, 0)}
      />
      <Slider
        label="Elementabstand d/λ"
        bind:value={spacing}
        min={ARRAY_MIN_SPACING}
        max={ARRAY_MAX_SPACING}
        step={0.05}
        format={(value) => `${formatNumber(value, 2)} λ`}
        hint="Ab d > λ/2 entstehen zusätzliche Hauptkeulen (Grating Lobes)."
      />
      <Slider
        label="Schwenkwinkel"
        bind:value={steerDeg}
        min={ARRAY_MIN_STEER_DEG}
        max={ARRAY_MAX_STEER_DEG}
        step={1}
        format={(value) => `${formatNumber(value, 0)}°`}
        unitSymbol="Grad"
      />
    {/if}
    <div class="scale" role="group" aria-label="Skala der radialen Achse">
      <span class="scale-label">Skala</span>
      <Button
        size="sm"
        variant={scale === 'db' ? 'primary' : 'secondary'}
        pressed={scale === 'db'}
        onclick={() => (scale = 'db')}>dB</Button
      >
      <Button
        size="sm"
        variant={scale === 'linear' ? 'primary' : 'secondary'}
        pressed={scale === 'linear'}
        onclick={() => (scale = 'linear')}>linear</Button
      >
    </div>
  </div>

  <div class="readout">
    <Badge tone="brand" srPrefix="Gewinn">
      {formatNumber(gainEstimateDbi, 1)} dBi = {formatNumber(dbiToDbd(gainEstimateDbi), 1)} dBd
    </Badge>
    <Badge tone="info" srPrefix="Halbwertsbreite">
      {omnidirectional ? 'Rundstrahler' : `Halbwertsbreite ${formatNumber(beamwidth, 1)}°`}
    </Badge>
    <Badge tone="neutral" srPrefix="Vor-Rück-Verhältnis">
      V/R {formatNumber(frontToBack, 1)} dB
    </Badge>
    <Badge tone="neutral" srPrefix="Hauptstrahlrichtung">
      Hauptkeule bei {formatNumber(mainLobe, 0)}°
    </Badge>
  </div>

  <ChartFrame
    {description}
    minWidth={320}
    footnote="Schnitt durch eine Ebene. Yagi und Parabol sind als Gaußkeule mit Rückkeule genähert, die Gruppe über den Gruppenfaktor berechnet."
  >
    <AntennaPolarPlot
      {samples}
      {scale}
      floorDb={PATTERN_FLOOR_DB}
      mainLobeDeg={mainLobe}
      beamwidthDeg={omnidirectional ? undefined : beamwidth}
    />
    {#snippet dataTable()}
      <table>
        <caption>Kennwerte des dargestellten Richtdiagramms</caption>
        <tbody>
          <tr><th scope="row">Bauform</th><td>{choice.label}</td></tr>
          <tr><th scope="row">Gewinn</th><td>{formatNumber(gainEstimateDbi, 1)} dBi</td></tr>
          <tr>
            <th scope="row">Halbwertsbreite</th>
            <td>{omnidirectional ? 'rundum gleich' : `${formatNumber(beamwidth, 1)}°`}</td>
          </tr>
          <tr><th scope="row">Vor-Rück-Verhältnis</th><td>{formatNumber(frontToBack, 1)} dB</td></tr>
          <tr><th scope="row">Hauptstrahlrichtung</th><td>{formatNumber(mainLobe, 0)}°</td></tr>
        </tbody>
      </table>
    {/snippet}
  </ChartFrame>
</div>

<style>
  .widget {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .types {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 0.75rem 1.5rem;
    align-items: end;
  }

  .scale {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .scale-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .hint {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
