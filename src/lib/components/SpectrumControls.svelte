<script lang="ts">
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';
  import { spectrumExplanations } from '$lib/data/explanations';
  import type { ViewMode } from './spectrumState.svelte';
  import { type RowKey, type VisibleRows } from './spectrumBands';
  import { MIN_ZOOM, MAX_ZOOM } from './spectrumZoom';
  import { formatFrequencyLocal, formatZoom } from './spectrumFormat';

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
    onCenterOnMarker
  }: Props = $props();
</script>

<div class="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
  <!-- Band row selector -->
  <div class="flex flex-wrap items-center gap-1">
    <span class="text-ink-subtle mr-1 text-sm">
      Bänder:
      <InfoTooltip
        title={spectrumExplanations.emSpectrum.title}
        short={spectrumExplanations.emSpectrum.short}
        detailed={spectrumExplanations.emSpectrum.detailed}
      />
    </span>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {visibleRows.em
        ? 'bg-series-1-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow('em')}
      aria-pressed={visibleRows.em}
    >
      EM-Spektrum
    </button>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {visibleRows.itu
        ? 'bg-series-5-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow('itu')}
      aria-pressed={visibleRows.itu}
    >
      ITU
    </button>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {visibleRows.ieee
        ? 'bg-series-4-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow('ieee')}
      aria-pressed={visibleRows.ieee}
    >
      IEEE
    </button>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {visibleRows.nato
        ? 'bg-series-6-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow('nato')}
      aria-pressed={visibleRows.nato}
    >
      NATO
    </button>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {visibleRows.civilian
        ? 'bg-series-2-solid text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onToggleRow('civilian')}
      aria-pressed={visibleRows.civilian}
    >
      Zivil
    </button>
  </div>

  <!-- View mode toggle -->
  <div class="flex flex-wrap items-center gap-1">
    <span class="text-ink-subtle text-sm">Ansicht:</span>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {viewMode === 'rf'
        ? 'bg-warning text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onSetViewMode('rf')}
    >
      RF (3 Hz - 3 THz)
    </button>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {viewMode === 'visible'
        ? 'bg-warning text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onSetViewMode('visible')}
    >
      RF + Licht (bis 1 PHz)
    </button>
    <button
      class="rounded px-2 py-1 text-sm transition-colors {viewMode === 'full'
        ? 'bg-warning text-on-solid'
        : 'bg-elevated text-ink-subtle hover:bg-hover'}"
      onclick={() => onSetViewMode('full')}
    >
      Gesamt (bis Gamma)
    </button>
  </div>

  <!-- Zoom and pan controls -->
  <div class="flex items-center gap-1">
    <button
      class="bg-elevated text-ink-muted hover:bg-hover inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm"
      onclick={onJumpToVisibleLight}
      aria-label="Sichtbares Licht anzeigen"
      title="Sichtbares Licht anzeigen"
    >
      <span
        class="from-series-6 via-series-7 via-series-2 to-series-4 inline-block h-3 w-3 rounded-sm bg-gradient-to-r"
        aria-hidden="true"
      ></span>
      Sichtbar
    </button>
    <span class="text-ink-subtle ml-1 text-sm">Zoom:</span>
    <button
      class="bg-elevated text-ink-muted hover:bg-hover flex h-7 w-7 items-center justify-center rounded disabled:cursor-not-allowed disabled:opacity-50"
      onclick={onPanLeft}
      disabled={zoomLevel <= MIN_ZOOM}
      aria-label="Nach links verschieben"
      title="Nach links verschieben"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      class="bg-elevated text-ink-muted hover:bg-hover flex h-7 w-7 items-center justify-center rounded disabled:cursor-not-allowed disabled:opacity-50"
      onclick={onZoomOut}
      disabled={zoomLevel <= MIN_ZOOM}
      aria-label="Herauszoomen"
      title="Herauszoomen"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>
    <span class="text-ink-muted min-w-[3.5rem] text-center font-mono text-sm">{formatZoom(zoomLevel)}</span>
    <button
      class="bg-elevated text-ink-muted hover:bg-hover flex h-7 w-7 items-center justify-center rounded disabled:cursor-not-allowed disabled:opacity-50"
      onclick={onZoomIn}
      disabled={zoomLevel >= MAX_ZOOM}
      aria-label="Hineinzoomen"
      title="Hineinzoomen"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
    <button
      class="bg-elevated text-ink-muted hover:bg-hover flex h-7 w-7 items-center justify-center rounded disabled:cursor-not-allowed disabled:opacity-50"
      onclick={onPanRight}
      disabled={zoomLevel <= MIN_ZOOM}
      aria-label="Nach rechts verschieben"
      title="Nach rechts verschieben"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
    <button
      class="bg-elevated text-ink-muted hover:bg-hover rounded px-2 py-1 text-sm"
      onclick={onResetZoom}
      aria-label="Zoom zurücksetzen"
      title="Zoom zurücksetzen"
    >
      Reset
    </button>
    {#if frequencyHz}
      <button
        class="bg-warning-ink text-warning-soft hover:bg-warning rounded px-2 py-1 text-sm"
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
    <div class="bg-warning-soft border-warning ml-auto flex items-center rounded border px-3 py-1.5">
      <span class="text-warning-ink font-mono text-sm">{formatFrequencyLocal(frequencyHz)}</span>
      <span class="text-warning-ink/70 ml-2 text-xs">
        (lambda = {wavelengthDisplay})
      </span>
    </div>
  {/if}
</div>
