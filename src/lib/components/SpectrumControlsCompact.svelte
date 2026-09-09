<script lang="ts">
  /**
   * Schmale Bedienleiste des Spektrums (Container unter 640 px).
   *
   * Zwei Zeilen statt sechs: oben die Bandreihen als kompakte Punkt-Schalter
   * in einer waagerecht scrollbaren Zeile, unten die Ansicht als Auswahlfeld
   * samt Zoom, Reset, Zentrieren und „Sichtbar" als Symbolschalter. Die
   * Beschriftungen „Bänder:", „Ansicht:" und „Zoom:" entfallen und leben als
   * `aria-label` weiter. Die Markerfrequenz steht rechts als schlichte Zeile
   * ohne Rahmen — der gelbe Kasten kostete auf dem Telefon eine ganze Zeile.
   */
  import Icon from '$lib/components/ui/Icon.svelte';
  import { MIN_ZOOM, MAX_ZOOM } from './spectrumZoom';
  import { formatFrequencyLocal, formatZoom } from './spectrumFormat';
  import { ROW_CHIPS, VIEW_MODES, toViewMode, type SpectrumControlsProps } from './spectrumControlsData';

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

  const viewSelectId = $props.id();

  function handleViewChange(event: Event) {
    onSetViewMode(toViewMode((event.currentTarget as HTMLSelectElement).value));
  }
</script>

<div class="bar">
  <!-- Zeile 1: Bandreihen, waagerecht scrollbar statt umbrechend -->
  <div class="bar__row bar__row--chips" role="group" aria-label="Bänder">
    {#each ROW_CHIPS as chip (chip.key)}
      <button
        class="chip"
        class:chip--on={visibleRows[chip.key]}
        style="--chip-dot: {chip.dot}; --chip-ink: {chip.ink}"
        onclick={() => onToggleRow(chip.key)}
        aria-pressed={visibleRows[chip.key]}
        aria-label="Reihe {chip.label}"
      >
        <span class="chip__dot" aria-hidden="true"></span>
        {chip.shortLabel}
      </button>
    {/each}
  </div>

  <!-- Zeile 2: Ansicht, Zoom, Sprungziele, Markerfrequenz -->
  <div class="bar__row">
    <label class="sr-only" for={viewSelectId}>Ansicht</label>
    <select id={viewSelectId} class="bar__select" value={viewMode} onchange={handleViewChange}>
      {#each VIEW_MODES as mode (mode.value)}
        <option value={mode.value}>{mode.shortLabel}</option>
      {/each}
    </select>

    <button
      class="icon-btn"
      onclick={onZoomOut}
      disabled={zoomLevel <= MIN_ZOOM}
      aria-label="Herauszoomen"
      title="Herauszoomen"
    >
      <svg class="icon-btn__glyph" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>
    <span class="bar__zoom" aria-label="Zoomstufe">{formatZoom(zoomLevel)}</span>
    <button
      class="icon-btn"
      onclick={onZoomIn}
      disabled={zoomLevel >= MAX_ZOOM}
      aria-label="Hineinzoomen"
      title="Hineinzoomen"
    >
      <svg class="icon-btn__glyph" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Verschieben erscheint erst, wenn gezoomt ist: sonst ohne Wirkung -->
    {#if zoomLevel > MIN_ZOOM}
      <button class="icon-btn" onclick={onPanLeft} aria-label="Nach links verschieben" title="Nach links verschieben">
        <Icon name="chevron-left" size={16} />
      </button>
      <button
        class="icon-btn"
        onclick={onPanRight}
        aria-label="Nach rechts verschieben"
        title="Nach rechts verschieben"
      >
        <Icon name="chevron-right" size={16} />
      </button>
    {/if}

    <button class="icon-btn" onclick={onResetZoom} aria-label="Zoom zurücksetzen" title="Zoom zurücksetzen">
      <Icon name="reset" size={16} />
    </button>

    {#if frequencyHz}
      <button
        class="icon-btn"
        onclick={onCenterOnMarker}
        aria-label="Auf Marker zentrieren"
        title="Auf Marker zentrieren"
      >
        <Icon name="target" size={16} />
      </button>
    {/if}

    <button
      class="icon-btn"
      onclick={onJumpToVisibleLight}
      aria-label="Sichtbares Licht anzeigen"
      title="Sichtbares Licht anzeigen"
    >
      <span class="icon-btn__light" aria-hidden="true"></span>
    </button>
  </div>

  <!-- Zeile 3: Markerfrequenz als schlichte Textzeile direkt über dem Diagramm -->
  {#if frequencyHz}
    <p class="bar__freq">{formatFrequencyLocal(frequencyHz)} · λ = {wavelengthDisplay}</p>
  {/if}
</div>

<style>
  .bar {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .bar__row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
  }

  /* Chips bleiben in einer Zeile; bei Bedarf waagerecht scrollbar. */
  .bar__row--chips {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .bar__row--chips::-webkit-scrollbar {
    display: none;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex: none;
    padding: 0.25rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: transparent;
    color: var(--color-ink-subtle);
    font-size: var(--font-size-xs);
    line-height: 1.15;
    cursor: pointer;
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

  .bar__select {
    flex: none;
    max-width: 8rem;
    padding: 0.25rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: var(--color-surface);
    color: var(--color-ink-muted);
    font-size: var(--font-size-xs);
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: var(--color-surface);
    color: var(--color-ink-muted);
    cursor: pointer;
  }

  .icon-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .icon-btn__glyph {
    width: 1rem;
    height: 1rem;
  }

  .icon-btn__light {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-sm);
    background-image: linear-gradient(
      to right,
      var(--color-series-6),
      var(--color-series-7),
      var(--color-series-2),
      var(--color-series-4)
    );
  }

  .bar__zoom {
    flex: none;
    min-width: 2.5rem;
    text-align: center;
    color: var(--color-ink-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
  }

  .bar__freq {
    margin: 0;
    text-align: right;
    color: var(--color-ink-muted);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    white-space: nowrap;
  }
</style>
