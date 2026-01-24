<script lang="ts">
  import {
    atmosphericParameters,
    RAIN_RATE_LIGHT,
    RAIN_RATE_MODERATE,
    RAIN_RATE_HEAVY,
    RAIN_RATE_VERY_HEAVY,
    RAIN_RATE_EXTREME,
    FOG_DENSITY_LIGHT,
    FOG_DENSITY_MEDIUM,
    FOG_DENSITY_THICK,
    SNOW_RATE_LIGHT,
    SNOW_RATE_MODERATE,
    SNOW_RATE_HEAVY,
    type Polarization
  } from '$lib/stores/atmosphericParameters.svelte';

  // Tab state for different parameter groups
  let activeTab: 'atmospheric' | 'precipitation' = $state('atmospheric');

  // Atmospheric parameter handlers
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

  // Precipitation parameter handlers
  function handleRainRateInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : 0;
    atmosphericParameters.setRainRateMmH(value);
  }

  function handleFogDensityInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : 0;
    atmosphericParameters.setFogDensityGM3(value);
  }

  function handleSnowRateInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : 0;
    atmosphericParameters.setSnowRateMmH(value);
  }

  function handlePolarizationChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    atmosphericParameters.setPolarization(target.value as Polarization);
  }

  // Preset handlers
  function setRainPreset(rate: number) {
    atmosphericParameters.setRainRateMmH(rate);
  }

  function setFogPreset(density: number) {
    atmosphericParameters.setFogDensityGM3(density);
  }

  function setSnowPreset(rate: number) {
    atmosphericParameters.setSnowRateMmH(rate);
  }

  // Reset handlers
  function handleReset() {
    atmosphericParameters.reset();
  }

  function handleResetAtmospheric() {
    atmosphericParameters.resetAtmospheric();
  }

  function handleResetPrecipitation() {
    atmosphericParameters.resetPrecipitation();
  }
</script>

<div class="bg-slate-800 rounded-xl p-4 shadow-lg">
  <!-- Tab Navigation -->
  <div class="flex border-b border-slate-600 mb-4">
    <button
      type="button"
      class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'atmospheric'
        ? 'text-blue-400 border-b-2 border-blue-400'
        : 'text-slate-400 hover:text-slate-200'}"
      onclick={() => (activeTab = 'atmospheric')}
    >
      Atmosphaerisch (P.676)
    </button>
    <button
      type="button"
      class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'precipitation'
        ? 'text-blue-400 border-b-2 border-blue-400'
        : 'text-slate-400 hover:text-slate-200'}"
      onclick={() => (activeTab = 'precipitation')}
    >
      Niederschlag (P.838/P.840)
    </button>
  </div>

  <!-- Atmospheric Parameters Tab -->
  {#if activeTab === 'atmospheric'}
    <div class="flex flex-wrap items-center gap-4">
      <!-- Temperature Input (Celsius) -->
      <div class="flex items-center gap-2">
        <label for="temperature" class="text-sm font-medium text-slate-300 whitespace-nowrap">
          Temperatur
        </label>
        <input
          type="number"
          id="temperature"
          value={atmosphericParameters.temperatureCelsius}
          oninput={handleTemperatureInput}
          class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="1"
          min="-50"
          max="50"
        />
        <span class="text-slate-400 text-sm font-mono">C</span>
      </div>

      <!-- Pressure Input -->
      <div class="flex items-center gap-2">
        <label for="pressure" class="text-sm font-medium text-slate-300 whitespace-nowrap">
          Druck
        </label>
        <input
          type="number"
          id="pressure"
          value={atmosphericParameters.pressureHpa}
          oninput={handlePressureInput}
          class="w-24 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="1"
          min="800"
          max="1100"
        />
        <span class="text-slate-400 text-sm font-mono">hPa</span>
      </div>

      <!-- Water Vapor Density Input -->
      <div class="flex items-center gap-2">
        <label for="water-vapor" class="text-sm font-medium text-slate-300 whitespace-nowrap">
          Wasserdampf
        </label>
        <input
          type="number"
          id="water-vapor"
          value={atmosphericParameters.waterVaporDensity}
          oninput={handleWaterVaporInput}
          class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="0.5"
          min="0"
          max="30"
        />
        <span class="text-slate-400 text-sm font-mono">g/m3</span>
      </div>

      <!-- Distance Input -->
      <div class="flex items-center gap-2">
        <label for="distance" class="text-sm font-medium text-slate-300 whitespace-nowrap">
          Distanz
        </label>
        <input
          type="number"
          id="distance"
          value={atmosphericParameters.distanceKm}
          oninput={handleDistanceInput}
          class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="0.1"
          min="0.1"
          max="100"
        />
        <span class="text-slate-400 text-sm font-mono">km</span>
      </div>

      <!-- Reset Button -->
      <button
        type="button"
        onclick={handleResetAtmospheric}
        class="bg-slate-600 hover:bg-slate-500 text-slate-200 px-3 py-1.5 rounded text-sm transition-colors"
      >
        Reset
      </button>

      <!-- ITU Reference Label -->
      <span class="text-slate-500 text-xs ml-auto">ITU-R P.676-13</span>
    </div>

    <!-- Parameter Info -->
    <div class="mt-3 text-xs text-slate-500">
      Standard: ISA (15C, 1013.25 hPa, 7.5 g/m3 Wasserdampf)
    </div>
  {/if}

  <!-- Precipitation Parameters Tab -->
  {#if activeTab === 'precipitation'}
    <div class="space-y-4">
      <!-- Rain Rate -->
      <div class="flex flex-wrap items-center gap-3">
        <label for="rain-rate" class="text-sm font-medium text-slate-300 w-24">
          Regenrate
        </label>
        <input
          type="number"
          id="rain-rate"
          value={atmosphericParameters.rainRateMmH}
          oninput={handleRainRateInput}
          class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="1"
          min="0"
          max="200"
        />
        <span class="text-slate-400 text-sm font-mono">mm/h</span>

        <!-- Rain Presets -->
        <div class="flex gap-1 ml-2">
          <button
            type="button"
            onclick={() => setRainPreset(0)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.rainRateMmH === 0
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Kein
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_LIGHT)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.rainRateMmH === RAIN_RATE_LIGHT
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Leicht
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_MODERATE)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.rainRateMmH === RAIN_RATE_MODERATE
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Maessig
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_HEAVY)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.rainRateMmH === RAIN_RATE_HEAVY
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Stark
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_VERY_HEAVY)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.rainRateMmH === RAIN_RATE_VERY_HEAVY
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Sehr stark
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_EXTREME)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.rainRateMmH === RAIN_RATE_EXTREME
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Extrem
          </button>
        </div>
      </div>

      <!-- Fog Density -->
      <div class="flex flex-wrap items-center gap-3">
        <label for="fog-density" class="text-sm font-medium text-slate-300 w-24">
          Nebeldichte
        </label>
        <input
          type="number"
          id="fog-density"
          value={atmosphericParameters.fogDensityGM3}
          oninput={handleFogDensityInput}
          class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="0.01"
          min="0"
          max="1"
        />
        <span class="text-slate-400 text-sm font-mono">g/m3</span>

        <!-- Fog Presets -->
        <div class="flex gap-1 ml-2">
          <button
            type="button"
            onclick={() => setFogPreset(0)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.fogDensityGM3 === 0
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Kein
          </button>
          <button
            type="button"
            onclick={() => setFogPreset(FOG_DENSITY_LIGHT)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.fogDensityGM3 === FOG_DENSITY_LIGHT
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Leicht (~1km)
          </button>
          <button
            type="button"
            onclick={() => setFogPreset(FOG_DENSITY_MEDIUM)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.fogDensityGM3 === FOG_DENSITY_MEDIUM
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Mittel (~300m)
          </button>
          <button
            type="button"
            onclick={() => setFogPreset(FOG_DENSITY_THICK)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.fogDensityGM3 === FOG_DENSITY_THICK
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Dicht (~50m)
          </button>
        </div>
      </div>

      <!-- Snow Rate -->
      <div class="flex flex-wrap items-center gap-3">
        <label for="snow-rate" class="text-sm font-medium text-slate-300 w-24">
          Schneerate
        </label>
        <input
          type="number"
          id="snow-rate"
          value={atmosphericParameters.snowRateMmH}
          oninput={handleSnowRateInput}
          class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="0.5"
          min="0"
          max="20"
        />
        <span class="text-slate-400 text-sm font-mono">mm/h</span>

        <!-- Snow Presets -->
        <div class="flex gap-1 ml-2">
          <button
            type="button"
            onclick={() => setSnowPreset(0)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.snowRateMmH === 0
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Kein
          </button>
          <button
            type="button"
            onclick={() => setSnowPreset(SNOW_RATE_LIGHT)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.snowRateMmH === SNOW_RATE_LIGHT
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Leicht
          </button>
          <button
            type="button"
            onclick={() => setSnowPreset(SNOW_RATE_MODERATE)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.snowRateMmH === SNOW_RATE_MODERATE
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Maessig
          </button>
          <button
            type="button"
            onclick={() => setSnowPreset(SNOW_RATE_HEAVY)}
            class="px-2 py-1 text-xs rounded {atmosphericParameters.snowRateMmH === SNOW_RATE_HEAVY
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
          >
            Stark
          </button>
        </div>
      </div>

      <!-- Polarization -->
      <div class="flex flex-wrap items-center gap-3">
        <label for="polarization" class="text-sm font-medium text-slate-300 w-24">
          Polarisation
        </label>
        <select
          id="polarization"
          value={atmosphericParameters.polarization}
          onchange={handlePolarizationChange}
          class="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="horizontal">Horizontal (H)</option>
          <option value="vertical">Vertikal (V)</option>
          <option value="circular">Zirkular</option>
        </select>
        <span class="text-slate-500 text-xs">(fuer Regendaempfung)</span>
      </div>

      <!-- Reset and Reference -->
      <div class="flex items-center gap-4 pt-2 border-t border-slate-700">
        <button
          type="button"
          onclick={handleResetPrecipitation}
          class="bg-slate-600 hover:bg-slate-500 text-slate-200 px-3 py-1.5 rounded text-sm transition-colors"
        >
          Reset Niederschlag
        </button>
        <button
          type="button"
          onclick={handleReset}
          class="bg-slate-600 hover:bg-slate-500 text-slate-200 px-3 py-1.5 rounded text-sm transition-colors"
        >
          Reset Alles
        </button>
        <span class="text-slate-500 text-xs ml-auto">ITU-R P.838-3 / P.840-9</span>
      </div>
    </div>

    <!-- Parameter Info -->
    <div class="mt-3 text-xs text-slate-500 space-y-1">
      <div>Regen: Nieselregen 0.25-1 mm/h | Leicht 1-4 mm/h | Maessig 4-16 mm/h | Stark 16-50 mm/h | Wolkenbruch >100 mm/h</div>
      <div>Nebel: Sichtweite in Klammern | Schnee: Wasseraequivalent</div>
    </div>
  {/if}
</div>
