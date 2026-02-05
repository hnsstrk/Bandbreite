<script lang="ts">
  import InfoTooltip from "$lib/components/ui/InfoTooltip.svelte";
  import { spectrumExplanations } from "$lib/data/explanations";
  import {
    type ViewMode,
    type RowKey,
    type VisibleRows,
    MIN_ZOOM,
    MAX_ZOOM,
    formatFrequencyLocal,
    formatZoom,
  } from "./spectrumState.svelte";

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
    <span class="text-slate-400 text-sm mr-1">
      Bänder:
      <InfoTooltip
        title={spectrumExplanations.emSpectrum.title}
        short={spectrumExplanations.emSpectrum.short}
        detailed={spectrumExplanations.emSpectrum.detailed}
      />
    </span>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.em
        ? 'bg-blue-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onToggleRow("em")}
      aria-pressed={visibleRows.em}
    >
      EM-Spektrum
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.itu
        ? 'bg-cyan-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onToggleRow("itu")}
      aria-pressed={visibleRows.itu}
    >
      ITU
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.ieee
        ? 'bg-purple-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onToggleRow("ieee")}
      aria-pressed={visibleRows.ieee}
    >
      IEEE
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.nato
        ? 'bg-red-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onToggleRow("nato")}
      aria-pressed={visibleRows.nato}
    >
      NATO
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.civilian
        ? 'bg-green-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onToggleRow("civilian")}
      aria-pressed={visibleRows.civilian}
    >
      Zivil
    </button>
  </div>

  <!-- View mode toggle -->
  <div class="flex items-center gap-2">
    <span class="text-slate-400 text-sm">Ansicht:</span>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'rf'
        ? 'bg-amber-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onSetViewMode("rf")}
    >
      RF (3 Hz - 3 THz)
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {viewMode ===
      'visible'
        ? 'bg-amber-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onSetViewMode("visible")}
    >
      RF + Licht (bis 1 PHz)
    </button>
    <button
      class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'full'
        ? 'bg-amber-600 text-white'
        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
      onclick={() => onSetViewMode("full")}
    >
      Gesamt (bis Gamma)
    </button>
  </div>

  <!-- Zoom and pan controls -->
  <div class="flex items-center gap-2">
    <button
      class="px-2 py-1 text-sm bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-violet-500 text-white rounded hover:opacity-80"
      onclick={onJumpToVisibleLight}
      aria-label="Sichtbares Licht anzeigen"
      title="Sichtbares Licht anzeigen"
    >
      Sichtbar
    </button>
    <span class="text-slate-400 text-sm ml-2">Zoom:</span>
    <button
      class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <span class="text-slate-300 text-sm font-mono min-w-[3.5rem] text-center"
      >{formatZoom(zoomLevel)}</span
    >
    <button
      class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      class="px-2 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
      onclick={onResetZoom}
      aria-label="Zoom zurücksetzen"
      title="Zoom zurücksetzen"
    >
      Reset
    </button>
    {#if frequencyHz}
      <button
        class="px-2 py-1 text-sm bg-amber-700 text-amber-100 rounded hover:bg-amber-600"
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
      class="ml-auto flex items-center bg-amber-500/20 border border-amber-500/50 rounded px-3 py-1.5"
    >
      <span class="text-amber-400 text-sm font-mono"
        >{formatFrequencyLocal(frequencyHz)}</span
      >
      <span class="text-amber-400/70 text-xs ml-2">
        (lambda = {wavelengthDisplay})
      </span>
    </div>
  {/if}
</div>
