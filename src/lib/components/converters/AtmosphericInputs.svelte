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
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';
  import { atmosphericExplanations } from '$lib/data/explanations';
  import { parseNumericInput, parseSelectValue } from '$lib/utils/handlers';

  // Tab state for different parameter groups
  let activeTab: 'atmospheric' | 'precipitation' = $state('atmospheric');

  // Atmospheric parameter handlers
  function handleTemperatureInput(e: Event) {
    atmosphericParameters.setTemperatureCelsius(parseNumericInput(e));
  }

  function handlePressureInput(e: Event) {
    atmosphericParameters.setPressureHpa(parseNumericInput(e));
  }

  function handleWaterVaporInput(e: Event) {
    atmosphericParameters.setWaterVaporDensity(parseNumericInput(e));
  }

  // Precipitation parameter handlers
  function handleRainRateInput(e: Event) {
    atmosphericParameters.setRainRateMmH(parseNumericInput(e));
  }

  function handleFogDensityInput(e: Event) {
    atmosphericParameters.setFogDensityGM3(parseNumericInput(e));
  }

  function handleSnowRateInput(e: Event) {
    atmosphericParameters.setSnowRateMmH(parseNumericInput(e));
  }

  function handlePolarizationChange(e: Event) {
    atmosphericParameters.setPolarization(parseSelectValue(e) as Polarization);
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

<div class="card-compact">
  <!-- Tab Navigation -->
  <div class="tab-navigation" role="tablist">
    <span
      role="tab"
      tabindex={activeTab === 'atmospheric' ? 0 : -1}
      class="tab-button"
      class:active={activeTab === 'atmospheric'}
      aria-selected={activeTab === 'atmospheric'}
      onclick={() => (activeTab = 'atmospheric')}
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activeTab = 'atmospheric';
        }
      }}
    >
      Atmosphärisch (P.676)
      <InfoTooltip
        title={atmosphericExplanations.general.title}
        short={atmosphericExplanations.general.short}
        detailed={atmosphericExplanations.general.detailed}
      />
    </span>
    <span
      role="tab"
      tabindex={activeTab === 'precipitation' ? 0 : -1}
      class="tab-button"
      class:active={activeTab === 'precipitation'}
      aria-selected={activeTab === 'precipitation'}
      onclick={() => (activeTab = 'precipitation')}
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activeTab = 'precipitation';
        }
      }}
    >
      Niederschlag (P.838/P.840)
      <InfoTooltip
        title={atmosphericExplanations.rain.title}
        short={atmosphericExplanations.rain.short}
        detailed={atmosphericExplanations.rain.detailed}
      />
    </span>
  </div>

  <!-- Atmospheric Parameters Tab -->
  {#if activeTab === 'atmospheric'}
    <div class="parameter-row">
      <!-- Temperature Input (Celsius) -->
      <div class="input-group">
        <label for="temperature" class="input-label">Temperatur</label>
        <input
          type="number"
          id="temperature"
          value={atmosphericParameters.temperatureCelsius}
          oninput={handleTemperatureInput}
          class="input-field input-narrow"
          step="1"
          min="-50"
          max="50"
        />
        <span class="unit-label">&#176;C</span>
      </div>

      <!-- Pressure Input -->
      <div class="input-group">
        <label for="pressure" class="input-label">Druck</label>
        <input
          type="number"
          id="pressure"
          value={atmosphericParameters.pressureHpa}
          oninput={handlePressureInput}
          class="input-field input-medium"
          step="1"
          min="800"
          max="1100"
        />
        <span class="unit-label">hPa</span>
      </div>

      <!-- Water Vapor Density Input -->
      <div class="input-group">
        <label for="water-vapor" class="input-label">Wasserdampf</label>
        <input
          type="number"
          id="water-vapor"
          value={atmosphericParameters.waterVaporDensity}
          oninput={handleWaterVaporInput}
          class="input-field input-narrow"
          step="0.5"
          min="0"
          max="30"
        />
        <span class="unit-label">g/m&#179;</span>
      </div>

      <!-- Reset Button -->
      <button
        type="button"
        onclick={handleResetAtmospheric}
        class="btn btn-secondary"
      >
        Reset
      </button>

      <!-- ITU Reference Label -->
      <span class="reference-label">ITU-R P.676-13</span>
    </div>

    <!-- Parameter Info -->
    <div class="info-text">
      Standard: ISA (15&#176;C, 1013.25 hPa, 7.5 g/m&#179; Wasserdampf)
    </div>
  {/if}

  <!-- Precipitation Parameters Tab -->
  {#if activeTab === 'precipitation'}
    <div class="precipitation-content">
      <!-- Rain Rate -->
      <div class="parameter-row">
        <label for="rain-rate" class="input-label label-wide">Regenrate</label>
        <input
          type="number"
          id="rain-rate"
          value={atmosphericParameters.rainRateMmH}
          oninput={handleRainRateInput}
          class="input-field input-narrow"
          step="1"
          min="0"
          max="200"
        />
        <span class="unit-label">mm/h</span>

        <!-- Rain Presets -->
        <div class="preset-group">
          <button
            type="button"
            onclick={() => setRainPreset(0)}
            class="preset-btn"
            class:active={atmosphericParameters.rainRateMmH === 0}
          >
            Kein
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_LIGHT)}
            class="preset-btn"
            class:active={atmosphericParameters.rainRateMmH === RAIN_RATE_LIGHT}
          >
            Leicht
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_MODERATE)}
            class="preset-btn"
            class:active={atmosphericParameters.rainRateMmH === RAIN_RATE_MODERATE}
          >
            Mäßig
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_HEAVY)}
            class="preset-btn"
            class:active={atmosphericParameters.rainRateMmH === RAIN_RATE_HEAVY}
          >
            Stark
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_VERY_HEAVY)}
            class="preset-btn"
            class:active={atmosphericParameters.rainRateMmH === RAIN_RATE_VERY_HEAVY}
          >
            Sehr stark
          </button>
          <button
            type="button"
            onclick={() => setRainPreset(RAIN_RATE_EXTREME)}
            class="preset-btn"
            class:active={atmosphericParameters.rainRateMmH === RAIN_RATE_EXTREME}
          >
            Extrem
          </button>
        </div>
      </div>

      <!-- Fog Density -->
      <div class="parameter-row">
        <label for="fog-density" class="input-label label-wide">Nebeldichte</label>
        <input
          type="number"
          id="fog-density"
          value={atmosphericParameters.fogDensityGM3}
          oninput={handleFogDensityInput}
          class="input-field input-narrow"
          step="0.01"
          min="0"
          max="1"
        />
        <span class="unit-label">g/m&#179;</span>

        <!-- Fog Presets -->
        <div class="preset-group">
          <button
            type="button"
            onclick={() => setFogPreset(0)}
            class="preset-btn preset-green"
            class:active={atmosphericParameters.fogDensityGM3 === 0}
          >
            Kein
          </button>
          <button
            type="button"
            onclick={() => setFogPreset(FOG_DENSITY_LIGHT)}
            class="preset-btn preset-green"
            class:active={atmosphericParameters.fogDensityGM3 === FOG_DENSITY_LIGHT}
          >
            Leicht (~1km)
          </button>
          <button
            type="button"
            onclick={() => setFogPreset(FOG_DENSITY_MEDIUM)}
            class="preset-btn preset-green"
            class:active={atmosphericParameters.fogDensityGM3 === FOG_DENSITY_MEDIUM}
          >
            Mittel (~300m)
          </button>
          <button
            type="button"
            onclick={() => setFogPreset(FOG_DENSITY_THICK)}
            class="preset-btn preset-green"
            class:active={atmosphericParameters.fogDensityGM3 === FOG_DENSITY_THICK}
          >
            Dicht (~50m)
          </button>
        </div>
      </div>

      <!-- Snow Rate -->
      <div class="parameter-row">
        <label for="snow-rate" class="input-label label-wide">Schneerate</label>
        <input
          type="number"
          id="snow-rate"
          value={atmosphericParameters.snowRateMmH}
          oninput={handleSnowRateInput}
          class="input-field input-narrow"
          step="0.5"
          min="0"
          max="20"
        />
        <span class="unit-label">mm/h</span>

        <!-- Snow Presets -->
        <div class="preset-group">
          <button
            type="button"
            onclick={() => setSnowPreset(0)}
            class="preset-btn preset-cyan"
            class:active={atmosphericParameters.snowRateMmH === 0}
          >
            Kein
          </button>
          <button
            type="button"
            onclick={() => setSnowPreset(SNOW_RATE_LIGHT)}
            class="preset-btn preset-cyan"
            class:active={atmosphericParameters.snowRateMmH === SNOW_RATE_LIGHT}
          >
            Leicht
          </button>
          <button
            type="button"
            onclick={() => setSnowPreset(SNOW_RATE_MODERATE)}
            class="preset-btn preset-cyan"
            class:active={atmosphericParameters.snowRateMmH === SNOW_RATE_MODERATE}
          >
            Mäßig
          </button>
          <button
            type="button"
            onclick={() => setSnowPreset(SNOW_RATE_HEAVY)}
            class="preset-btn preset-cyan"
            class:active={atmosphericParameters.snowRateMmH === SNOW_RATE_HEAVY}
          >
            Stark
          </button>
        </div>
      </div>

      <!-- Polarization -->
      <div class="parameter-row">
        <label for="polarization" class="input-label label-wide">Polarisation</label>
        <select
          id="polarization"
          value={atmosphericParameters.polarization}
          onchange={handlePolarizationChange}
          class="select-field"
        >
          <option value="horizontal">Horizontal (H)</option>
          <option value="vertical">Vertikal (V)</option>
          <option value="circular">Zirkular</option>
        </select>
        <span class="hint-text">(für Regendämpfung)</span>
      </div>

      <!-- Reset and Reference -->
      <div class="action-row">
        <button
          type="button"
          onclick={handleResetPrecipitation}
          class="btn btn-secondary"
        >
          Reset Niederschlag
        </button>
        <button
          type="button"
          onclick={handleReset}
          class="btn btn-secondary"
        >
          Reset Alles
        </button>
        <span class="reference-label">ITU-R P.838-3 / P.840-9</span>
      </div>
    </div>

    <!-- Parameter Info -->
    <div class="info-text info-multiline">
      <div>Regen: Nieselregen 0.25-1 mm/h | Leicht 1-4 mm/h | Mäßig 4-16 mm/h | Stark 16-50 mm/h | Wolkenbruch >100 mm/h</div>
      <div>Nebel: Sichtweite in Klammern | Schnee: Wasseräquivalent</div>
    </div>
  {/if}
</div>

<style>
  .tab-navigation {
    display: flex;
    border-bottom: 1px solid var(--color-border-default);
    margin-bottom: 1rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-tertiary);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tab-button:hover {
    color: var(--color-text-secondary);
  }

  .tab-button:focus {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }

  .tab-button.active {
    color: var(--color-accent-primary);
    border-bottom-color: var(--color-accent-primary);
  }

  .parameter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }

  .precipitation-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .input-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .label-wide {
    width: 6rem;
  }

  .input-narrow {
    width: 5rem;
  }

  .input-medium {
    width: 6rem;
  }

  .unit-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  }

  .preset-group {
    display: flex;
    gap: 0.25rem;
    margin-left: 0.5rem;
  }

  .preset-btn {
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-xs);
    border-radius: var(--radius-md);
    border: none;
    background-color: var(--color-bg-elevated);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .preset-btn:hover {
    background-color: var(--color-bg-surface);
  }

  .preset-btn.active {
    background-color: var(--color-accent-primary);
    color: white;
  }

  .preset-btn.preset-green.active {
    background-color: var(--color-accent-secondary);
  }

  .preset-btn.preset-cyan.active {
    background-color: var(--color-chart-cyan);
  }

  .hint-text {
    font-size: var(--font-size-xs);
    color: var(--color-text-disabled);
  }

  .action-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-default);
  }

  .reference-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-disabled);
    margin-left: auto;
  }

  .info-text {
    margin-top: 0.75rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-disabled);
  }

  .info-multiline {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
