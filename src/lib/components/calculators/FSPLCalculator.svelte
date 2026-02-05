<script lang="ts">
  import {
    calculateFSPL,
    calculateRange,
    frequencyToWavelength,
  } from "$lib/utils/calculations";
  import { convertToHz } from "$lib/utils/conversions";
  import { FREQUENCY_UNITS, DISTANCE_UNITS } from "$lib/data/units";
  import {
    formatFrequency,
    formatDistance,
    formatWavelength,
    formatPowerDb,
  } from "$lib/utils/formatting";
  import {
    parseNumericInput,
    parseSelectValue,
    safeDivide,
  } from "$lib/utils/handlers";
  import InfoTooltip from "$lib/components/ui/InfoTooltip.svelte";
  import { fsplExplanations } from "$lib/data/explanations";
  import {
    FSPL_FREQUENCY_PRESETS,
    FSPL_CHART_FREQUENCIES,
    DISTANCE_PRESETS_METERS,
    type FrequencyPreset,
    type ChartFrequency,
  } from "$lib/data/presets";
  import { CHART_DISTANCE_RANGES, CHART_FSPL_RANGES } from "$lib/data/spectrum";
  import FSPLChart from "$lib/components/charts/FSPLChart.svelte";

  interface Props {
    frequencyHz?: number | null;
    width?: number;
    height?: number;
  }

  let { frequencyHz = null, width = 900, height = 450 }: Props = $props();

  // Chart margins
  const margin = { top: 40, right: 100, bottom: 60, left: 70 };

  // Input state
  let inputFrequency = $state(2.4);
  let inputFrequencyUnit = $state("GHz");
  let inputDistance = $state(100);
  let inputDistanceUnit = $state("m");
  let showMultipleFrequencies = $state(true);

  // Use centralized DISTANCE_UNITS from units.ts (imported above)
  // Helper to get factor from DISTANCE_UNITS
  function getDistanceFactor(unitId: string): number {
    const unit = DISTANCE_UNITS.find((u) => u.id === unitId);
    return unit?.factor ?? 1;
  }

  // Quick frequency presets - imported from presets.ts
  const frequencyPresets = FSPL_FREQUENCY_PRESETS;

  // Reference frequencies for multi-line chart - imported from presets.ts
  const chartFrequencies = FSPL_CHART_FREQUENCIES;

  // Derived frequency in Hz
  let currentFrequencyHz = $derived(
    frequencyHz ?? convertToHz(inputFrequency, inputFrequencyUnit),
  );

  // Derived distance in meters
  let currentDistanceM = $derived(
    inputDistance * getDistanceFactor(inputDistanceUnit),
  );

  // Calculated FSPL
  let fsplDb = $derived(
    currentFrequencyHz > 0 && currentDistanceM > 0
      ? calculateFSPL(currentDistanceM, currentFrequencyHz)
      : null,
  );

  // Wavelength
  let wavelengthM = $derived(
    currentFrequencyHz > 0 ? frequencyToWavelength(currentFrequencyHz) : null,
  );

  // Chart dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Note: formatFrequency, formatDistance, formatWavelength are imported from $lib/utils/formatting

  // Event handlers using centralized utilities
  function handleFrequencyInput(e: Event) {
    inputFrequency = parseNumericInput(e, 0);
  }

  function handleFrequencyUnitChange(e: Event) {
    inputFrequencyUnit = parseSelectValue(e);
  }

  function handleDistanceInput(e: Event) {
    inputDistance = parseNumericInput(e, 0);
  }

  function handleDistanceUnitChange(e: Event) {
    inputDistanceUnit = parseSelectValue(e);
  }

  function setPresetFrequency(hz: number) {
    inputFrequency = hz / 1e9;
    inputFrequencyUnit = "GHz";
  }

  // Sync with external frequencyHz prop
  $effect(() => {
    if (frequencyHz !== null && frequencyHz !== undefined && frequencyHz > 0) {
      // Update internal state to match external prop
      if (frequencyHz >= 1e9) {
        inputFrequency = frequencyHz / 1e9;
        inputFrequencyUnit = "GHz";
      } else if (frequencyHz >= 1e6) {
        inputFrequency = frequencyHz / 1e6;
        inputFrequencyUnit = "MHz";
      } else if (frequencyHz >= 1e3) {
        inputFrequency = frequencyHz / 1e3;
        inputFrequencyUnit = "kHz";
      } else {
        inputFrequency = frequencyHz;
        inputFrequencyUnit = "Hz";
      }
    }
  });
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Free Space Path Loss (FSPL) Kalkulator</h3>

  <!-- Input Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <!-- Frequency Input -->
    <div class="space-y-2">
      <label for="fspl-frequency-input" class="text-label">
        Frequenz
        <InfoTooltip
          title={fsplExplanations.frequency.title}
          short={fsplExplanations.frequency.short}
          detailed={fsplExplanations.frequency.detailed}
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="fspl-frequency-input"
          type="number"
          value={inputFrequency}
          oninput={handleFrequencyInput}
          class="input-field flex-1"
          placeholder="Frequenz"
          step="any"
          min="0"
          aria-describedby="fspl-frequency-desc"
        />
        <select
          id="fspl-frequency-unit"
          value={inputFrequencyUnit}
          onchange={handleFrequencyUnitChange}
          class="select-field"
          aria-label="Frequenzeinheit"
        >
          {#each FREQUENCY_UNITS as unit (unit.id)}
            <option value={unit.id}>{unit.symbol}</option>
          {/each}
        </select>
      </div>
      <span id="fspl-frequency-desc" class="sr-only"
        >Geben Sie die Frequenz ein und waehlen Sie die Einheit</span
      >
      <!-- Quick Presets -->
      <div class="flex flex-wrap gap-1 mt-2">
        {#each frequencyPresets as preset (preset.label)}
          <button
            type="button"
            onclick={() => setPresetFrequency(preset.hz)}
            class="btn-chip"
            title={preset.descriptionDE ?? preset.description}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Distance Input -->
    <div class="space-y-2">
      <label for="fspl-distance-input" class="text-label">
        Distanz
        <InfoTooltip
          title={fsplExplanations.distance.title}
          short={fsplExplanations.distance.short}
          detailed={fsplExplanations.distance.detailed}
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="fspl-distance-input"
          type="number"
          value={inputDistance}
          oninput={handleDistanceInput}
          class="input-field flex-1"
          placeholder="Distanz"
          step="any"
          min="0"
        />
        <select
          id="fspl-distance-unit"
          value={inputDistanceUnit}
          onchange={handleDistanceUnitChange}
          class="select-field"
          aria-label="Distanzeinheit"
        >
          {#each DISTANCE_UNITS as unit (unit.id)}
            <option value={unit.id}>{unit.symbol}</option>
          {/each}
        </select>
      </div>
      <!-- Quick Distance Presets - from presets.ts -->
      <div class="flex flex-wrap gap-1 mt-2">
        {#each DISTANCE_PRESETS_METERS as dist (dist)}
          <button
            type="button"
            onclick={() => {
              inputDistance = dist;
              inputDistanceUnit = "m";
            }}
            class="btn-chip"
          >
            {dist >= 1000 ? `${dist / 1000} km` : `${dist} m`}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- FSPL Result -->
    <div class="result-box">
      <div class="result-label">
        FSPL
        <InfoTooltip
          title={fsplExplanations.fspl.title}
          short={fsplExplanations.fspl.short}
          detailed={fsplExplanations.fspl.detailed}
        />
      </div>
      <div class="text-2xl font-bold text-blue-500 dark:text-blue-400">
        {fsplDb !== null ? fsplDb.toFixed(2) : "—"}
        <span class="text-lg result-label">dB</span>
      </div>
    </div>

    <!-- Wavelength -->
    <div class="result-box">
      <div class="result-label">
        Wellenlänge
        <InfoTooltip
          title={fsplExplanations.wavelength.title}
          short={fsplExplanations.wavelength.short}
          detailed={fsplExplanations.wavelength.detailed}
        />
      </div>
      <div class="text-2xl font-bold text-green-600 dark:text-green-400">
        {wavelengthM !== null ? formatWavelength(wavelengthM) : "—"}
      </div>
    </div>

    <!-- Effective Distance -->
    <div class="result-box">
      <div class="result-label">Distanz</div>
      <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
        {currentDistanceM > 0 ? formatDistance(currentDistanceM) : "—"}
      </div>
    </div>
  </div>

  <!-- Formula Display -->
  <div class="formula-box">
    <div class="text-xs text-muted mb-1">Formel:</div>
    <div class="font-mono text-sm text-primary text-center">
      FSPL(dB) = 20·log<sub>10</sub>(d) + 20·log<sub>10</sub>(f) + 20·log<sub
        >10</sub
      >(4&#960;/c) = 20·log<sub>10</sub>(d) + 20·log<sub>10</sub>(f) - 147,55
    </div>
  </div>

  <!-- Chart Toggle -->
  <div class="flex items-center justify-between mb-4">
    <h4 class="text-label">FSPL vs. Distanz</h4>
    <label
      class="flex items-center gap-2 text-sm text-secondary cursor-pointer"
    >
      <input
        type="checkbox"
        bind:checked={showMultipleFrequencies}
        class="checkbox"
      />
      Vergleichskurven anzeigen
    </label>
  </div>

  <!-- Chart -->
  <div class="w-full overflow-x-auto">
    <FSPLChart
      {width}
      {height}
      frequencyHz={currentFrequencyHz}
      distanceM={currentDistanceM}
      {fsplDb}
      {showMultipleFrequencies}
      {chartFrequencies}
    />
  </div>
</div>
