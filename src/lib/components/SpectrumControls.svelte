<script lang="ts">
  import InfoTooltip from "$lib/components/ui/InfoTooltip.svelte";
  import { spectrumExplanations } from "$lib/data/explanations";
  import type { ViewMode } from "./spectrumState.svelte";
  import { type RowKey, type VisibleRows } from "./spectrumBands";
  import { MIN_ZOOM, MAX_ZOOM } from "./spectrumZoom";
  import { formatFrequencyLocal, formatZoom } from "./spectrumFormat";

  interface Props {
    visibleRows: VisibleRows;
    viewMode: ViewMode;
    zoomLevel: number;
    frequencyHz: number | undefined;
    wavelengthDisplay: string;
    onToggleRow: (row: RowKey) => void;
    onSetViewMode: (mode: ViewMode) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
    onPanLeft: () => void;
    onPanRight: () => void;
    onJumpToVisibleLight: () => void;
    onCenterOnMarker: () => void;
  }

  let {
    visibleRows,
    viewMode,
    zoomLevel,
    frequencyHz,
    wavelengthDisplay,
    onToggleRow,
    onSetViewMode,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onPanLeft,
    onPanRight,
    onJumpToVisibleLight,
    onCenterOnMarker,
  }: Props = $props();
</script>

<div class="flex flex-wrap gap-4 mb-4 items-center">
  <!-- Band row selector -->
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-ink-subtle text-sm mr-1">
      Bänder:
      <InfoTooltip
        title={spectrumExplanations.emSpectrum.title}
        short={spectrumExplanations.emSpectrum.short}
        detailed={spectrumExplanations.emSpectrum.detailed}
      />
    </span>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.em
        ? 'bg-series-1-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow("em")}
      aria-pressed={visibleRows.em}
    >
      EM-Spektrum
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.itu
        ? 'bg-series-5-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow("itu")}
      aria-pressed={visibleRows.itu}
    >
      ITU
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.ieee
        ? 'bg-series-4-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow("ieee")}
      aria-pressed={visibleRows.ieee}
    >
      IEEE
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.nato
        ? 'bg-series-6-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow("nato")}
      aria-pressed={visibleRows.nato}
    >
      NATO
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.civilian
        ? 'bg-series-2-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow("civilian")}
      aria-pressed={visibleRows.civilian}
    >
      Zivil
    </button>
  </div>

  <!-- View mode toggle -->
  <div class="flex items-center gap-2">
    <span class="text-ink-subtle text-sm">Ansicht:</span>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'rf'
        ? 'bg-warning text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onSetViewMode("rf")}
    >
      RF (3 Hz - 3 THz)
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {viewMode ===
      'visible'
        ? 'bg-warning text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onSetViewMode("visible")}
    >
      RF + Licht (bis 1 PHz)
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'full'
        ? 'bg-warning text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onSetViewMode("full")}
    >
      Gesamt (bis Gamma)
    </button>
  </div>

  <!-- Zoom and pan controls -->
  <div class="flex items-center gap-2">
    <button
      class="px-2 py-1 text-sm bg-gradient-to-r from-series-6 via-series-7 via-series-2 to-series-4 text-on-solid rounded hover:opacity-80"
      onclick={onJumpToVisibleLight}
      aria-label="Sichtbares Licht anzeigen"
      title="Sichtbares Licht anzeigen"
    >
      Sichtbar
    </button>
    <span class="text-ink-subtle text-sm ml-2">Zoom:</span>
    <button
      class="w-8 h-8 flex items-center justify-center bg-elevated text-ink-muted rounded hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={onPanLeft}
      disabled={zoomLevel <= MIN_ZOOM}
      aria-label="Nach links verschieben"
      title="Nach links verschieben"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
    <button
      class="w-8 h-8 flex items-center justify-center bg-elevated text-ink-muted rounded hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={onZoomOut}
      disabled={zoomLevel <= MIN_ZOOM}
      aria-label="Herauszoomen"
      title="Herauszoomen"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 12H4"
        />
      </svg>
    </button>
    <span class="text-ink-muted text-sm font-mono min-w-[3.5rem] text-center"
      >{formatZoom(zoomLevel)}</span
    >
    <button
      class="w-8 h-8 flex items-center justify-center bg-elevated text-ink-muted rounded hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={onZoomIn}
      disabled={zoomLevel >= MAX_ZOOM}
      aria-label="Hineinzoomen"
      title="Hineinzoomen"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
    <button
      class="w-8 h-8 flex items-center justify-center bg-elevated text-ink-muted rounded hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={onPanRight}
      disabled={zoomLevel <= MIN_ZOOM}
      aria-label="Nach rechts verschieben"
      title="Nach rechts verschieben"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
    <button
      class="px-2 py-1 text-sm bg-elevated text-ink-muted rounded hover:bg-hover"
      onclick={onResetZoom}
      aria-label="Zoom zurücksetzen"
      title="Zoom zurücksetzen"
    >
      Reset
    </button>
    {#if frequencyHz}
      <button
        class="px-2 py-1 text-sm bg-warning-ink text-warning-soft rounded hover:bg-warning"
        onclick={onCenterOnMarker}
        aria-label="Auf Marker zentrieren"
        title="Auf Marker zentrieren"
      >
        Zentrieren
      </button>
    {/if}
  </div>

  <!-- Frequency marker display (integrated into control bar) -->
  {#if frequencyHz}
    <div
      class="ml-auto flex items-center bg-warning-soft border border-warning rounded px-3 py-1.5"
    >
      <span class="text-warning-ink text-sm font-mono"
        >{formatFrequencyLocal(frequencyHz)}</span
      >
      <span class="text-warning-ink/70 text-xs ml-2">
        (lambda = {wavelengthDisplay})
      </span>
    </div>
  {/if}
</div>
