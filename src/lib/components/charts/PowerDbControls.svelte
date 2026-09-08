<script lang="ts">
  interface Props {
    showIEEEBands: boolean;
    bandMode: 'ieee' | 'nato';
    showCommunication: boolean;
    showRadar: boolean;
    showSatellite: boolean;
    showIot: boolean;
    showIndustrial: boolean;
  }

  let {
    showIEEEBands = $bindable(),
    bandMode = $bindable(),
    showCommunication = $bindable(),
    showRadar = $bindable(),
    showSatellite = $bindable(),
    showIot = $bindable(),
    showIndustrial = $bindable()
  }: Props = $props();

  function toggleBandMode() {
    bandMode = bandMode === 'ieee' ? 'nato' : 'ieee';
  }
</script>

<div class="mb-4 flex flex-wrap items-center gap-6">
  <!-- Band Mode Toggle Switch with Show/Hide -->
  <div class="flex items-center gap-3">
    <span class="text-ink-subtle text-sm">Frequenzbänder:</span>
    <!-- Show/Hide Bands Toggle -->
    <label class="flex cursor-pointer items-center gap-1.5">
      <button
        type="button"
        onclick={() => (showIEEEBands = !showIEEEBands)}
        class="relative h-5 w-9 rounded-full transition-colors duration-200 {showIEEEBands
          ? 'bg-brand'
          : 'bg-line-strong'}"
        role="switch"
        aria-checked={showIEEEBands}
        aria-label="Frequenzbänder anzeigen"
      >
        <span
          class="bg-on-solid absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200
                 {showIEEEBands ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showIEEEBands ? 'text-cat-blue' : 'text-ink-faint'}">Anzeigen</span>
    </label>
    <!-- IEEE/NATO Switch -->
    <div class="border-line ml-2 flex items-center gap-2 border-l pl-2">
      <span class="text-xs font-medium {bandMode === 'ieee' ? 'text-cat-violet' : 'text-ink-faint'}">IEEE</span>
      <button
        type="button"
        onclick={toggleBandMode}
        class="relative h-6 w-12 rounded-full transition-colors duration-200 {bandMode === 'ieee'
          ? 'bg-series-4-solid'
          : 'bg-series-2-solid'}"
        role="switch"
        aria-checked={bandMode === 'nato'}
        aria-label="Zwischen IEEE und NATO Bändern wechseln"
      >
        <span
          class="bg-on-solid absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-md transition-transform duration-200
                 {bandMode === 'nato' ? 'translate-x-[22px]' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs font-medium {bandMode === 'nato' ? 'text-cat-green' : 'text-ink-faint'}">NATO</span>
    </div>
  </div>

  <!-- Category Filter Toggles -->
  <div class="flex items-center gap-4">
    <span class="text-ink-subtle text-sm">Filter:</span>

    <!-- Communication Toggle -->
    <label class="flex cursor-pointer items-center gap-1.5">
      <button
        type="button"
        onclick={() => (showCommunication = !showCommunication)}
        class="relative h-5 w-9 rounded-full transition-colors duration-200 {showCommunication
          ? 'bg-series-1'
          : 'bg-line-strong'}"
        role="switch"
        aria-checked={showCommunication}
        aria-label="Kommunikation anzeigen"
      >
        <span
          class="bg-on-solid absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200
                 {showCommunication ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showCommunication ? 'text-cat-blue' : 'text-ink-faint'}">Kommunikation</span>
    </label>

    <!-- Radar Toggle -->
    <label class="flex cursor-pointer items-center gap-1.5">
      <button
        type="button"
        onclick={() => (showRadar = !showRadar)}
        class="relative h-5 w-9 rounded-full transition-colors duration-200 {showRadar
          ? 'bg-series-3'
          : 'bg-line-strong'}"
        role="switch"
        aria-checked={showRadar}
        aria-label="RADAR anzeigen"
      >
        <span
          class="bg-on-solid absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200
                 {showRadar ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showRadar ? 'text-cat-orange' : 'text-ink-faint'}">RADAR</span>
    </label>

    <!-- Satellite Toggle -->
    <label class="flex cursor-pointer items-center gap-1.5">
      <button
        type="button"
        onclick={() => (showSatellite = !showSatellite)}
        class="relative h-5 w-9 rounded-full transition-colors duration-200 {showSatellite
          ? 'bg-series-2'
          : 'bg-line-strong'}"
        role="switch"
        aria-checked={showSatellite}
        aria-label="Satellit anzeigen"
      >
        <span
          class="bg-on-solid absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200
                 {showSatellite ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showSatellite ? 'text-cat-green' : 'text-ink-faint'}">Satellit</span>
    </label>

    <!-- IoT Toggle -->
    <label class="flex cursor-pointer items-center gap-1.5">
      <button
        type="button"
        onclick={() => (showIot = !showIot)}
        class="relative h-5 w-9 rounded-full transition-colors duration-200 {showIot
          ? 'bg-series-4'
          : 'bg-line-strong'}"
        role="switch"
        aria-checked={showIot}
        aria-label="IoT/RFID anzeigen"
      >
        <span
          class="bg-on-solid absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200
                 {showIot ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showIot ? 'text-cat-violet' : 'text-ink-faint'}">IoT/RFID</span>
    </label>

    <!-- Industrial Toggle -->
    <label class="flex cursor-pointer items-center gap-1.5">
      <button
        type="button"
        onclick={() => (showIndustrial = !showIndustrial)}
        class="relative h-5 w-9 rounded-full transition-colors duration-200 {showIndustrial
          ? 'bg-series-9'
          : 'bg-line-strong'}"
        role="switch"
        aria-checked={showIndustrial}
        aria-label="Industrie anzeigen"
      >
        <span
          class="bg-on-solid absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200
                 {showIndustrial ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showIndustrial ? 'text-cat-pink' : 'text-ink-faint'}">Industrie</span>
    </label>
  </div>
</div>
