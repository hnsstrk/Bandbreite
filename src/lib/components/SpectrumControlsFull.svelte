<script lang="ts">
  /**
   * Volle Bedienleiste des Spektrums (Container ab 640 px) — Erscheinungsbild
   * unverändert; die schmale Fassung steht in `SpectrumControlsCompact`.
   */
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';
  import { spectrumExplanations } from '$lib/data/explanations';
  import { MIN_ZOOM, MAX_ZOOM } from './spectrumZoom';
  import { formatFrequencyLocal, formatZoom } from './spectrumFormat';
  import { ROW_CHIPS, VIEW_MODES, type SpectrumControlsProps } from './spectrumControlsData';

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
  }: SpectrumControlsProps = $props();
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
    {#each ROW_CHIPS as chip (chip.key)}
      <button
        class="chip"
        class:chip--on={visibleRows[chip.key]}
        style="--chip-dot: {chip.dot}; --chip-ink: {chip.ink}"
        onclick={() => onToggleRow(chip.key)}
        aria-pressed={visibleRows[chip.key]}
      >
        <span class="chip__dot" aria-hidden="true"></span>
        {chip.label}
      </button>
    {/each}
  </div>

  <!-- View mode toggle -->
  <div class="flex flex-wrap items-center gap-1">
    <span class="text-ink-subtle text-sm">Ansicht:</span>
    {#each VIEW_MODES as mode (mode.value)}
      <button
        class="chip chip--view"
        class:chip--on={viewMode === mode.value}
        onclick={() => onSetViewMode(mode.value)}
        aria-pressed={viewMode === mode.value}
        title={mode.title}
      >
        {mode.label}
      </button>
    {/each}
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

<style>
  /*
   * Umriss-Schalter im Datenblatt-Stil (Entscheidung des Besitzers,
   * Bericht 74): 1-px-Rahmen, keine Füllung, ein farbiger Punkt in der
   * Reihenfarbe vor dem Text. Aktiv färben sich Rahmen, Punkt und Text;
   * inaktiv bleiben Rahmen `--color-line`, Text gedämpft und der Punkt grau.
   * Die Farben kommen je Schalter als `--chip-dot` (Reihenfarbe) und
   * `--chip-ink` (lesbare Textfassung derselben Reihe) aus dem Markup.
   */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: transparent;
    color: var(--color-ink-subtle);
    font-size: var(--font-size-sm);
    line-height: 1.25;
    cursor: pointer;
    transition:
      border-color 150ms ease,
      color 150ms ease,
      background-color 150ms ease;
  }

  .chip:hover {
    background-color: var(--color-hover);
    color: var(--color-ink);
  }

  .chip__dot {
    width: 0.5rem;
    height: 0.5rem;
    flex: none;
    border-radius: var(--radius-pill);
    background-color: var(--color-ink-faint);
  }

  .chip--on {
    border-color: var(--chip-ink);
    color: var(--chip-ink);
  }

  .chip--on .chip__dot {
    background-color: var(--chip-dot);
  }

  /* Ansicht-Schalter tragen keine Reihenfarbe, sondern das Akzentblau. */
  .chip--view {
    --chip-ink: var(--color-brand);
  }
</style>
