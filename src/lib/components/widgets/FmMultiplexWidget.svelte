<script lang="ts">
  /**
   * UKW-Multiplex: Basisbandspektrum (Summensignal, Pilotton, Differenzsignal,
   * RDS) und die daraus folgende belegte Bandbreite nach Carson.
   * Rechnung in FmMultiplexModel.ts (Konstanten aus $lib/data/broadcast).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatFrequency, formatNumber } from '$lib/utils/formatting';
  import { FM_CHANNEL_RASTER_HZ, FM_PILOT_TONE_HZ, RDS_SUBCARRIER_HZ } from '$lib/data/broadcast';
  import {
    componentsForMode,
    computeFmMultiplex,
    FM_DEVIATION_LIMITS,
    MPX_AXIS_MAX_HZ,
    MPX_MODES,
    STEREO_SUBCARRIER_HZ
  } from './FmMultiplexModel';

  const W = 800;
  const H = 300;
  const PAD = { left: 46, right: 24 };
  const PLOT_W = W - PAD.left - PAD.right;
  /** Grundlinie des Basisbandspektrums und Höhe der Blöcke */
  const MPX_BASE_Y = 130;
  const MPX_H = 74;
  /** Grundlinie der Hochfrequenzachse */
  const RF_Y = 244;
  /** Halbe Breite der HF-Achse in Hz */
  const RF_SPAN_HZ = 220e3;
  const BAND_COLORS: Record<string, string> = {
    summe: 'var(--color-series-1)',
    pilot: 'var(--color-series-3)',
    differenz: 'var(--color-series-2)',
    rds: 'var(--color-series-4)'
  };

  let deviationHz = $state<number>(FM_DEVIATION_LIMITS.default);
  let modeId = $state('stereo-rds');

  const result = $derived(computeFmMultiplex(deviationHz, modeId));
  const parts = $derived(componentsForMode(result.mode));
  const options = MPX_MODES.map((mode) => ({ value: mode.id, label: mode.label }));

  /** Basisbandfrequenz in Hz → x-Koordinate */
  const mpxX = (hz: number) => PAD.left + (hz / MPX_AXIS_MAX_HZ) * PLOT_W;
  /** Ablage von der Trägermitte in Hz → x-Koordinate */
  const rfX = (hz: number) => PAD.left + PLOT_W / 2 + (hz / (2 * RF_SPAN_HZ)) * PLOT_W;
  const kHz = (hz: number) => formatNumber(hz / 1000, hz % 1000 === 0 ? 0 : 1);
</script>

<WidgetFrame
  title="UKW-Multiplex: vom Basisband zur Bandbreite"
  description="Oben das Basisbandsignal eines UKW-Senders mit Summensignal, Pilotton, Differenzsignal und RDS; unten die daraus folgende belegte Bandbreite im Vergleich zum Kanalraster."
  footnote="Belegte Bandbreite nach Carson: B ≈ 2·(Δf + f_max). Pilotton {formatFrequency(
    FM_PILOT_TONE_HZ,
    0
  )}, Hilfsträger {formatFrequency(STEREO_SUBCARRIER_HZ, 0)}, RDS {formatFrequency(
    RDS_SUBCARRIER_HZ,
    0
  )} — ITU-R BS.450 und IEC 62106."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x={PAD.left} y="24" class="chart-axis-text">Basisband (Multiplexsignal) in kHz</text>

    {#each parts as part (part.id)}
      {#if part.kind === 'line'}
        <line
          x1={mpxX(part.minHz)}
          y1={MPX_BASE_Y}
          x2={mpxX(part.minHz)}
          y2={MPX_BASE_Y - MPX_H}
          stroke={BAND_COLORS[part.id]}
          stroke-width="3"
        />
        <text x={mpxX(part.minHz)} y={MPX_BASE_Y - MPX_H - 8} text-anchor="middle" class="chart-legend-text">
          {part.label}
        </text>
      {:else}
        <rect
          x={mpxX(part.minHz)}
          y={MPX_BASE_Y - MPX_H * (part.id === 'summe' ? 1 : 0.7)}
          width={mpxX(part.maxHz) - mpxX(part.minHz)}
          height={MPX_H * (part.id === 'summe' ? 1 : 0.7)}
          fill={BAND_COLORS[part.id]}
          opacity="0.75"
          stroke={BAND_COLORS[part.id]}
        />
        <text
          x={(mpxX(part.minHz) + mpxX(part.maxHz)) / 2}
          y={MPX_BASE_Y - MPX_H * (part.id === 'summe' ? 1 : 0.7) - 8}
          text-anchor="middle"
          class="chart-legend-text"
        >
          {part.label}
        </text>
      {/if}
    {/each}

    {#if result.mode.id !== 'mono'}
      <line
        x1={mpxX(STEREO_SUBCARRIER_HZ)}
        y1={MPX_BASE_Y}
        x2={mpxX(STEREO_SUBCARRIER_HZ)}
        y2={MPX_BASE_Y - MPX_H * 0.7}
        stroke="var(--color-ink-subtle)"
        stroke-dasharray="4 4"
      />
    {/if}

    <line x1={PAD.left} y1={MPX_BASE_Y} x2={W - PAD.right} y2={MPX_BASE_Y} class="chart-axis-line" />
    {#each [0, 10e3, 19e3, 30e3, 38e3, 50e3, 57e3, 60e3] as tick (tick)}
      <line x1={mpxX(tick)} y1={MPX_BASE_Y} x2={mpxX(tick)} y2={MPX_BASE_Y + 5} class="chart-axis-line" />
      <text x={mpxX(tick)} y={MPX_BASE_Y + 18} text-anchor="middle" class="chart-axis-text">{kHz(tick)}</text>
    {/each}

    <!-- Hochfrequenzseite -->
    <text x={PAD.left} y={RF_Y - 52} class="chart-axis-text"
      >Belegte Bandbreite der Aussendung, Ablage vom Träger in kHz</text
    >
    <line x1={PAD.left} y1={RF_Y} x2={W - PAD.right} y2={RF_Y} class="chart-axis-line" />
    {#each [-200e3, -100e3, 0, 100e3, 200e3] as tick (tick)}
      <line x1={rfX(tick)} y1={RF_Y - 34} x2={rfX(tick)} y2={RF_Y + 5} class="chart-grid-line" />
      <text x={rfX(tick)} y={RF_Y + 18} text-anchor="middle" class="chart-axis-text">{kHz(tick)}</text>
    {/each}
    <rect
      x={rfX(-result.bandwidthHz / 2)}
      y={RF_Y - 34}
      width={rfX(result.bandwidthHz / 2) - rfX(-result.bandwidthHz / 2)}
      height="34"
      fill="var(--color-series-1)"
      opacity="0.55"
    />
    <text x={rfX(0)} y={RF_Y - 42} text-anchor="middle" class="chart-legend-text">
      B ≈ {formatFrequency(result.bandwidthHz, 0)}
    </text>
    <line
      x1={rfX(-FM_CHANNEL_RASTER_HZ / 2)}
      y1={RF_Y - 44}
      x2={rfX(-FM_CHANNEL_RASTER_HZ / 2)}
      y2={RF_Y}
      stroke="var(--color-series-6)"
      stroke-dasharray="5 4"
    />
    <line
      x1={rfX(FM_CHANNEL_RASTER_HZ / 2)}
      y1={RF_Y - 44}
      x2={rfX(FM_CHANNEL_RASTER_HZ / 2)}
      y2={RF_Y}
      stroke="var(--color-series-6)"
      stroke-dasharray="5 4"
    />
    <text x={rfX(FM_CHANNEL_RASTER_HZ / 2) + 6} y={RF_Y - 48} class="chart-legend-text"
      >Kanalraster {kHz(FM_CHANNEL_RASTER_HZ)} kHz</text
    >
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des UKW-Multiplexsignals</caption>
      <tbody>
        <tr><th>Betriebsart</th><td>{result.mode.label}</td></tr>
        <tr><th>Frequenzhub Δf</th><td>{formatFrequency(deviationHz, 0)}</td></tr>
        <tr><th>Höchste Basisbandfrequenz f_max</th><td>{formatFrequency(result.maxBasebandHz, 1)}</td></tr>
        <tr><th>Belegte Bandbreite B</th><td>{formatFrequency(result.bandwidthHz, 1)}</td></tr>
        <tr><th>Modulationsindex</th><td>{formatNumber(result.modulationIndex, 2)}</td></tr>
        <tr><th>Rasterplätze zu {kHz(FM_CHANNEL_RASTER_HZ)} kHz</th><td>{formatNumber(result.rasterSlots, 2)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Betriebsart" bind:value={modeId} {options} />
    <Slider
      label="Frequenzhub Δf"
      bind:value={deviationHz}
      min={FM_DEVIATION_LIMITS.min}
      max={FM_DEVIATION_LIMITS.max}
      step={1000}
      format={(v) => formatFrequency(v, 0)}
      unitSymbol="Hz"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Belegte Bandbreite B ≈ 2·(Δf + f_max)"
      value={formatFrequency(result.bandwidthHz, 1)}
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Höchste Basisbandfrequenz f_max"
      value={formatFrequency(result.maxBasebandHz, 1)}
      hint="Modulationsindex {formatNumber(result.modulationIndex, 2)}"
      copyable={false}
    />
    <ResultCard
      label="Bedarf im Kanalraster"
      value="{formatNumber(result.rasterSlots, 1)} Rasterplätze"
      hint="Raster {kHz(FM_CHANNEL_RASTER_HZ)} kHz"
      tone={result.fitsInRaster ? 'success' : 'warning'}
      copyable={false}
    />
    <Callout tone="info" title="Warum Stereo teurer ist">
      Mono braucht nur die 15 kHz des Summensignals. Das Differenzsignal schiebt die höchste Basisbandfrequenz auf 53
      kHz, RDS auf {kHz(RDS_SUBCARRIER_HZ)} kHz plus Seitenbänder — und weil f_max in der Carson-Regel unmittelbar in die
      Bandbreite eingeht, wächst die Aussendung von {formatFrequency(
        computeFmMultiplex(deviationHz, 'mono').bandwidthHz,
        0
      )} auf {formatFrequency(computeFmMultiplex(deviationHz, 'stereo-rds').bandwidthHz, 0)}. Deshalb halten Sender am
      selben Standort mehrere Rasterplätze Abstand.
    </Callout>
  {/snippet}
</WidgetFrame>
