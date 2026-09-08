<script lang="ts">
  /**
   * Bandreihen des Spektrums (EM, ITU, IEEE, NATO, Zivil) mit Bandrechtecken.
   * Reines Markup — Geometrie kommt aus `spectrumState`.
   */
  import { formatFrequencyRange, type FrequencyBand } from '$lib/data/bands';
  import { ROW_HEIGHT, type RowConfig, type VisibleRows } from './spectrumBands';

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
    onHideTooltip
  }: Props = $props();

  /** Schmalste Darstellung eines Bands, damit es sichtbar bleibt. */
  const MIN_BAND_WIDTH = 2;
  /** Ab dieser Breite passt der Bandname ins Rechteck. */
  const LABEL_MIN_WIDTH = 25;
</script>

<!-- Band rows -->
{#each rows as row, rowIndex (row.key)}
  {#if visibleRows[row.key]}
    {@const rowY = getRowY(rowIndex)}
    <g transform="translate(0, {rowY})">
      <!-- Row label -->
      <text
        x="-10"
        y={ROW_HEIGHT / 2}
        text-anchor="end"
        dominant-baseline="middle"
        style="fill: var(--color-text-tertiary)"
        class="text-sm font-medium"
      >
        {row.label}
      </text>

      <!-- Background rectangle -->
      <rect
        x="0"
        y="0"
        width={innerWidth}
        height={ROW_HEIGHT}
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
            y="2"
            width={Math.max(band.width, MIN_BAND_WIDTH)}
            height={ROW_HEIGHT - 4}
            fill={band.color === 'visible' ? 'url(#visibleLightGradient)' : band.color}
            opacity={selectedBandId === band.id ? 1 : 0.9}
            stroke={selectedBandId === band.id ? '#fbbf24' : '#0f172a'}
            stroke-width={selectedBandId === band.id ? 2.5 : 0.5}
            class="transition-opacity hover:opacity-70"
          />
          {#if showLabels && band.width > LABEL_MIN_WIDTH}
            <text
              x={band.x + band.width / 2}
              y={ROW_HEIGHT / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="pointer-events-none fill-white text-xs font-medium"
              style="text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-size: 11px;"
            >
              {band.name}
            </text>
          {/if}
        </g>
      {/each}
    </g>
  {/if}
{/each}
