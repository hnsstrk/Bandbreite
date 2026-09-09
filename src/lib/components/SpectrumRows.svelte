<script lang="ts">
  /**
   * Bandreihen des Spektrums (EM, ITU, IEEE, NATO, Zivil) mit Bandrechtecken.
   * Reines Markup — Geometrie kommt aus `spectrumState`.
   */
  import { formatFrequencyRange, type FrequencyBand } from '$lib/data/bands';
  import { type RowConfig, type VisibleRows } from './spectrumBands';
  import { DESKTOP_METRICS, showBandLabel, type SpectrumMetrics } from './spectrumLayout';

  interface Props {
    rows: RowConfig[];
    visibleRows: VisibleRows;
    innerWidth: number;
    showLabels: boolean;
    selectedBandId: string | null;
    getRowY: (rowIndex: number) => number;
    onBandClick?: (band: FrequencyBand) => void;
    onShowTooltip: (event: MouseEvent, band: FrequencyBand) => void;
    onHideTooltip: () => void;
    /** breitenabhängige Maße (Reihenhöhe, Beschriftung) */
    metrics?: SpectrumMetrics;
  }

  let {
    rows,
    visibleRows,
    innerWidth,
    showLabels,
    selectedBandId,
    getRowY,
    onBandClick,
    onShowTooltip,
    onHideTooltip,
    metrics = DESKTOP_METRICS
  }: Props = $props();

  /** Schmalste Darstellung eines Bands, damit es sichtbar bleibt. */
  const MIN_BAND_WIDTH = 2;
  /** Luft zwischen Bandrechteck und Reihenrand (oben wie unten). */
  const BAND_INSET = 2;
</script>

<!-- Band rows -->
{#each rows as row, rowIndex (row.key)}
  {#if visibleRows[row.key]}
    {@const rowY = getRowY(rowIndex)}
    <g transform="translate(0, {rowY})">
      <!-- Row label -->
      <text
        x={-metrics.rowLabelOffset}
        y={metrics.rowHeight / 2}
        text-anchor="end"
        dominant-baseline="middle"
        style="fill: var(--color-text-tertiary); font-size: {metrics.rowLabelFontSize};"
        class="font-medium"
      >
        {row.label}
      </text>

      <!-- Background rectangle -->
      <rect
        x="0"
        y="0"
        width={innerWidth}
        height={metrics.rowHeight}
        style="fill: var(--color-bg-surface); stroke: var(--color-chart-grid)"
        stroke-width="1"
      />

      <!-- Band rectangles -->
      {#each row.bands as band (band.id)}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
        <g
          role="graphics-symbol"
          aria-label="{band.name}: {formatFrequencyRange(band.minHz, band.maxHz)}"
          onmouseenter={(e) => onShowTooltip(e, band)}
          onmouseleave={onHideTooltip}
          onmousemove={(e) => onShowTooltip(e, band)}
          onclick={() => onBandClick?.(band)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onBandClick?.(band);
          }}
          tabindex="0"
          class="cursor-pointer"
        >
          <rect
            x={band.x}
            y={BAND_INSET}
            width={Math.max(band.width, MIN_BAND_WIDTH)}
            height={metrics.rowHeight - 2 * BAND_INSET}
            fill={band.color === 'visible' ? 'url(#visibleLightGradient)' : band.color}
            opacity={selectedBandId === band.id ? 1 : 0.9}
            stroke={selectedBandId === band.id ? '#fbbf24' : '#0f172a'}
            stroke-width={selectedBandId === band.id ? 2.5 : 0.5}
            class="transition-opacity hover:opacity-70"
          />
          {#if showLabels && showBandLabel(band.width, band.name, metrics)}
            <text
              x={band.x + band.width / 2}
              y={metrics.rowHeight / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="pointer-events-none fill-white text-xs font-medium"
              style="text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-size: {metrics.bandLabelFontSize}px;"
            >
              {band.name}
            </text>
          {/if}
        </g>
      {/each}
    </g>
  {/if}
{/each}
