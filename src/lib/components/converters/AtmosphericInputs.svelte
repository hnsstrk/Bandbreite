<script lang="ts">
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';

  function handleTemperatureInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : 0;
    atmosphericParameters.setTemperatureCelsius(value);
  }

  function handlePressureInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : 0;
    atmosphericParameters.setPressureHpa(value);
  }

  function handleWaterVaporInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : 0;
    atmosphericParameters.setWaterVaporDensity(value);
  }

  function handleDistanceInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : 0;
    atmosphericParameters.setDistanceKm(value);
  }

  function handleReset() {
    atmosphericParameters.reset();
  }
</script>

<div class="bg-slate-800 rounded-lg p-4 shadow-xl">
  <div class="flex flex-wrap items-center gap-4">
    <!-- Temperature Input (Celsius) -->
    <div class="flex items-center gap-2">
      <label for="temperature" class="text-sm font-medium text-slate-300 whitespace-nowrap">
        Temperature
      </label>
      <input
        type="number"
        id="temperature"
        value={atmosphericParameters.temperatureCelsius}
        oninput={handleTemperatureInput}
        class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        step="1"
      />
      <span class="text-slate-400 text-sm font-mono">°C</span>
    </div>

    <!-- Pressure Input -->
    <div class="flex items-center gap-2">
      <label for="pressure" class="text-sm font-medium text-slate-300 whitespace-nowrap">
        Pressure
      </label>
      <input
        type="number"
        id="pressure"
        value={atmosphericParameters.pressureHpa}
        oninput={handlePressureInput}
        class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        step="1"
      />
      <span class="text-slate-400 text-sm font-mono">hPa</span>
    </div>

    <!-- Water Vapor Density Input -->
    <div class="flex items-center gap-2">
      <label for="water-vapor" class="text-sm font-medium text-slate-300 whitespace-nowrap">
        Water Vapor
      </label>
      <input
        type="number"
        id="water-vapor"
        value={atmosphericParameters.waterVaporDensity}
        oninput={handleWaterVaporInput}
        class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        step="0.1"
      />
      <span class="text-slate-400 text-sm font-mono">g/m³</span>
    </div>

    <!-- Distance Input -->
    <div class="flex items-center gap-2">
      <label for="distance" class="text-sm font-medium text-slate-300 whitespace-nowrap">
        Distance
      </label>
      <input
        type="number"
        id="distance"
        value={atmosphericParameters.distanceKm}
        oninput={handleDistanceInput}
        class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        step="0.1"
      />
      <span class="text-slate-400 text-sm font-mono">km</span>
    </div>

    <!-- Reset Button -->
    <button
      type="button"
      onclick={handleReset}
      class="bg-slate-600 hover:bg-slate-500 text-slate-200 px-3 py-1.5 rounded text-sm transition-colors"
    >
      Reset
    </button>

    <!-- ITU Reference Label -->
    <span class="text-slate-500 text-xs ml-auto">ITU-R P.676</span>
  </div>
</div>
