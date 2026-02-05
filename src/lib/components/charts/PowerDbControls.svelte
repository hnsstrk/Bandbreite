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
    showIndustrial = $bindable(),
  }: Props = $props();

  function toggleBandMode() {
    bandMode = bandMode === 'ieee' ? 'nato' : 'ieee';
  }
</script>

<div class="flex flex-wrap items-center gap-6 mb-4">
  <!-- Band Mode Toggle Switch with Show/Hide -->
  <div class="flex items-center gap-3">
    <span class="text-sm text-slate-400">Frequenzbänder:</span>
    <!-- Show/Hide Bands Toggle -->
    <label class="flex items-center gap-1.5 cursor-pointer">
      <button
        type="button"
        onclick={() => showIEEEBands = !showIEEEBands}
        class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-indigo-500
               {showIEEEBands ? 'bg-indigo-500' : 'bg-slate-600'}"
        role="switch"
        aria-checked={showIEEEBands}
        aria-label="Frequenzbänder anzeigen"
      >
        <span
          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                 {showIEEEBands ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showIEEEBands ? 'text-indigo-400' : 'text-slate-500'}">Anzeigen</span>
    </label>
    <!-- IEEE/NATO Switch -->
    <div class="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700">
      <span class="text-xs font-medium {bandMode === 'ieee' ? 'text-purple-400' : 'text-slate-500'}">IEEE</span>
      <button
        type="button"
        onclick={toggleBandMode}
        class="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500
               {bandMode === 'ieee' ? 'bg-purple-600' : 'bg-green-600'}"
        role="switch"
        aria-checked={bandMode === 'nato'}
        aria-label="Zwischen IEEE und NATO Bändern wechseln"
      >
        <span
          class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200
                 {bandMode === 'nato' ? 'translate-x-[22px]' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs font-medium {bandMode === 'nato' ? 'text-green-400' : 'text-slate-500'}">NATO</span>
    </div>
  </div>

  <!-- Category Filter Toggles -->
  <div class="flex items-center gap-4">
    <span class="text-sm text-slate-400">Filter:</span>

    <!-- Communication Toggle -->
    <label class="flex items-center gap-1.5 cursor-pointer">
      <button
        type="button"
        onclick={() => showCommunication = !showCommunication}
        class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-blue-500
               {showCommunication ? 'bg-blue-500' : 'bg-slate-600'}"
        role="switch"
        aria-checked={showCommunication}
        aria-label="Kommunikation anzeigen"
      >
        <span
          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                 {showCommunication ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showCommunication ? 'text-blue-400' : 'text-slate-500'}">Kommunikation</span>
    </label>

    <!-- Radar Toggle -->
    <label class="flex items-center gap-1.5 cursor-pointer">
      <button
        type="button"
        onclick={() => showRadar = !showRadar}
        class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-orange-500
               {showRadar ? 'bg-orange-500' : 'bg-slate-600'}"
        role="switch"
        aria-checked={showRadar}
        aria-label="RADAR anzeigen"
      >
        <span
          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                 {showRadar ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showRadar ? 'text-orange-400' : 'text-slate-500'}">RADAR</span>
    </label>

    <!-- Satellite Toggle -->
    <label class="flex items-center gap-1.5 cursor-pointer">
      <button
        type="button"
        onclick={() => showSatellite = !showSatellite}
        class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-green-500
               {showSatellite ? 'bg-green-500' : 'bg-slate-600'}"
        role="switch"
        aria-checked={showSatellite}
        aria-label="Satellit anzeigen"
      >
        <span
          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                 {showSatellite ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showSatellite ? 'text-green-400' : 'text-slate-500'}">Satellit</span>
    </label>

    <!-- IoT Toggle -->
    <label class="flex items-center gap-1.5 cursor-pointer">
      <button
        type="button"
        onclick={() => showIot = !showIot}
        class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-purple-500
               {showIot ? 'bg-purple-500' : 'bg-slate-600'}"
        role="switch"
        aria-checked={showIot}
        aria-label="IoT/RFID anzeigen"
      >
        <span
          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                 {showIot ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showIot ? 'text-purple-400' : 'text-slate-500'}">IoT/RFID</span>
    </label>

    <!-- Industrial Toggle -->
    <label class="flex items-center gap-1.5 cursor-pointer">
      <button
        type="button"
        onclick={() => showIndustrial = !showIndustrial}
        class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-pink-500
               {showIndustrial ? 'bg-pink-500' : 'bg-slate-600'}"
        role="switch"
        aria-checked={showIndustrial}
        aria-label="Industrie anzeigen"
      >
        <span
          class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                 {showIndustrial ? 'translate-x-4' : 'translate-x-0'}"
        ></span>
      </button>
      <span class="text-xs {showIndustrial ? 'text-pink-400' : 'text-slate-500'}">Industrie</span>
    </label>
  </div>
</div>
