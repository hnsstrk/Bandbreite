<script lang="ts">
  /**
   * Betriebsarten-Bandbreiten im Maßstab: Balken je Betriebsart, dazu die
   * aufgenommene Rauschleistung N = k·T·B und der Gewinn gegenüber SSB.
   * Rechnung in ModeBandwidthModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatFrequency, formatPowerDb, formatPowerDbm } from '$lib/utils/formatting';
  import {
    fitsScale,
    findMode,
    noiseAdvantageDb,
    noiseFloorDbm,
    referenceBandwidthHz,
    scaleFraction,
    AMATEUR_MODES,
    MODE_SCALES,
    REFERENCE_MODE_ID
  } from './ModeBandwidthModel';

  const W = 800;
  /** Zeilenhöhe je Betriebsart und Höhe eines Balkens */
  const ROW_H = 38;
  const BAR_H = 20;
  const TOP = 44;
  const LABEL_W = 150;
  const PAD_RIGHT = 216;
  const H = TOP + AMATEUR_MODES.length * ROW_H + 26;
  const BAR_W = W - LABEL_W - PAD_RIGHT;

  let scaleId = $state('schmal');
  let selectedId = $state('ft8');

  const scale = $derived(MODE_SCALES.find((entry) => entry.id === scaleId) ?? MODE_SCALES[0]);
  const selected = $derived(findMode(selectedId) ?? AMATEUR_MODES[0]);
  const referenceHz = referenceBandwidthHz();
  const advantageDb = $derived(noiseAdvantageDb(selected.bandwidthHz, referenceHz));
  const floorDbm = $derived(noiseFloorDbm(selected.bandwidthHz));

  const scaleOptions = MODE_SCALES.map((entry) => ({ value: entry.id, label: entry.label }));
  const modeOptions = AMATEUR_MODES.map((mode) => ({
    value: mode.id,
    label: `${mode.label} (${formatFrequency(mode.bandwidthHz, 2)})`
  }));

  const rowY = (index: number) => TOP + index * ROW_H;
</script>

<WidgetFrame
  title="Betriebsarten im Maßstab: Bandbreite und Rauschen"
  description="Balken der belegten Bandbreite je Betriebsart im gewählten Maßstab, daneben die im Empfänger aufgenommene Rauschleistung."
  stacked
  footnote="Maßstäblich innerhalb des gewählten Ausschnitts; breitere Betriebsarten sind abgeschnitten und mit einem Pfeil gekennzeichnet. Rauschleistung N = k·T·B bei 290 K. Bandbreiten nach IARU-Region-1-Bandplan, WSJT-X User Guide und AFuV Anlage 1."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x="0" y="20" class="chart-axis-text">Maßstab: {scale.label}</text>
    <text x={W - 116} y="20" text-anchor="end" class="chart-axis-text">Bandbreite</text>
    <text x={W} y="20" text-anchor="end" class="chart-axis-text">Rauschleistung</text>

    {#each AMATEUR_MODES as mode, index (mode.id)}
      {@const y = rowY(index)}
      {@const width = Math.max(2, scaleFraction(mode.bandwidthHz, scale.spanHz) * BAR_W)}
      <text x="0" y={y + BAR_H - 4} class="chart-legend-text">{mode.label}</text>
      <rect
        x={LABEL_W}
        {y}
        {width}
        height={BAR_H}
        fill={mode.id === selectedId ? 'var(--color-series-3)' : 'var(--color-series-1)'}
        opacity={mode.id === selectedId ? 0.95 : 0.55}
      />
      {#if !fitsScale(mode.bandwidthHz, scale.spanHz)}
        <path d="M{LABEL_W + width},{y} l14,{BAR_H / 2} l-14,{BAR_H / 2} Z" fill="var(--color-series-6)" />
      {/if}
      <text x={W - 116} y={y + BAR_H - 5} text-anchor="end" class="chart-axis-text">
        {formatFrequency(mode.bandwidthHz, 2)}
      </text>
      <text x={W} y={y + BAR_H - 5} text-anchor="end" class="chart-axis-text">
        {formatPowerDbm(noiseFloorDbm(mode.bandwidthHz), 1)}
      </text>
      <line x1={LABEL_W} y1={y + BAR_H + 8} x2={W - PAD_RIGHT} y2={y + BAR_H + 8} class="chart-grid-line" />
    {/each}

    <line x1={LABEL_W} y1={TOP - 8} x2={LABEL_W} y2={H - 20} class="chart-axis-line" />
    <text x={LABEL_W} y={H - 6} class="chart-axis-text">0 Hz</text>
    <text x={W - PAD_RIGHT} y={H - 6} text-anchor="end" class="chart-axis-text">
      {formatFrequency(scale.spanHz, 1)}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Bandbreite und Rauschleistung der Betriebsarten</caption>
      <thead>
        <tr><th>Betriebsart</th><th>Bandbreite</th><th>Rauschleistung bei 290 K</th><th>Gewinn gegenüber SSB</th></tr>
      </thead>
      <tbody>
        {#each AMATEUR_MODES as mode (mode.id)}
          <tr>
            <td>{mode.label}</td>
            <td>{formatFrequency(mode.bandwidthHz, 2)}</td>
            <td>{formatPowerDbm(noiseFloorDbm(mode.bandwidthHz), 1)}</td>
            <td>{formatPowerDb(noiseAdvantageDb(mode.bandwidthHz, referenceHz), 1, true)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Maßstab" bind:value={scaleId} options={scaleOptions} />
    <Select label="Betriebsart" bind:value={selectedId} options={modeOptions} />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="{selected.label}: belegte Bandbreite"
      value={formatFrequency(selected.bandwidthHz, 2)}
      hint={selected.kindDE}
      emphasis="hero"
      copyable={false}
    />
    <ResultCard
      label="Gewinn gegenüber SSB"
      value={formatPowerDb(advantageDb, 1, true)}
      hint="Bezug {formatFrequency(referenceHz, 2)} ({REFERENCE_MODE_ID.toUpperCase()})"
      tone={advantageDb > 0 ? 'success' : 'neutral'}
      copyable={false}
    />
    <ResultCard
      label="Rauschleistung N = k·T·B"
      value={formatPowerDbm(floorDbm, 1)}
      hint="bei 290 K"
      copyable={false}
    />
    <Callout tone="info" title={selected.label}>
      {selected.noteDE} Die Bandbreite geht unmittelbar in die aufgenommene Rauschleistung ein: Zwischen
      {formatFrequency(referenceHz, 2)} und {formatFrequency(selected.bandwidthHz, 2)} liegen
      {formatPowerDb(Math.abs(advantageDb), 1)} — bei gleicher Sendeleistung genau der Unterschied im Störabstand.
    </Callout>
  {/snippet}
</WidgetFrame>
