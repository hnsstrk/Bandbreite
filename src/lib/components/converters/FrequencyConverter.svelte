<script lang="ts">
  import { frequencyToWavelength, wavelengthToFrequency } from '$lib/utils/calculations';
  import { convertToHz, convertFromHz, convertToMeters, convertFromMeters } from '$lib/utils/conversions';
  import { FREQUENCY_UNITS, WAVELENGTH_UNITS, DEFAULT_FREQUENCY_UNIT, DEFAULT_WAVELENGTH_UNIT } from '$lib/data/units';
  import { pickBestUnit } from '$lib/components/ui/numberInput.svelte';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
  import { FREQUENCY_CONVERTER_PRESETS } from '$lib/data/presets';
  import { parseNullableNumericInput, parseSelectValue } from '$lib/utils/handlers';
  import { formatPrecisionNumber } from '$lib/utils/formatting';
  import FrequencyPresets from './FrequencyPresets.svelte';
  import FrequencyFormula from './FrequencyFormula.svelte';

  interface Props {
    frequencyHz?: number | null;
  }

  // Bindable prop to expose frequency in Hz to parent
  let { frequencyHz = $bindable(convertToHz(100, DEFAULT_FREQUENCY_UNIT)) }: Props = $props();

  let frequencyUnit = $state(DEFAULT_FREQUENCY_UNIT);
  let wavelengthUnit = $state(DEFAULT_WAVELENGTH_UNIT);

  // Das Prop ist die einzige Quelle des Werts (E3 / P0-1: keine interne Kopie).
  // Kommt eine Änderung von außen – etwa ein Bandklick auf /spektrum/ –,
  // wechseln beide Felder auf eine lesbare Einheit; eigene Schreibzugriffe
  // merken sich den Wert und lassen die vom Nutzer gewählte Einheit in Ruhe.
  let lastOwnHz = frequencyHz;
  $effect(() => {
    if (frequencyHz === lastOwnHz) return;
    lastOwnHz = frequencyHz;
    if (frequencyHz === null || frequencyHz <= 0) return;
    const unit = pickBestUnit(frequencyHz, FREQUENCY_UNITS);
    const lambdaUnit = pickBestUnit(frequencyToWavelength(frequencyHz), WAVELENGTH_UNITS);
    if (unit) frequencyUnit = unit.id;
    if (lambdaUnit) wavelengthUnit = lambdaUnit.id;
  });

  function setFrequencyHz(hz: number | null) {
    lastOwnHz = hz;
    frequencyHz = hz;
  }

  // Collapsible formula section state
  let showFormula = $state(false);

  /**
   * Feldwerte der `<input type="number">`: bewusst mit Dezimalpunkt
   * (`formatPrecisionNumber`), ein Komma-String würde vom Browser verworfen.
   * 8 signifikante Stellen, Exponentialform ab 1e9 mit 6 Stellen.
   */
  const FIELD_PRECISION = 8;
  const FIELD_EXP_THRESHOLD = 1e9;
  const FIELD_EXP_DIGITS = 6;

  // Derived values for display - reactive to speed of light changes
  let frequencyDisplay = $derived(frequencyHz !== null ? convertFromHz(frequencyHz, frequencyUnit) : null);

  let wavelengthDisplay = $derived(
    frequencyHz !== null && frequencyHz > 0
      ? convertFromMeters(frequencyToWavelength(frequencyHz), wavelengthUnit)
      : null
  );

  // Reactive display of current speed of light value
  let speedOfLightDisplay = $derived(speedOfLight.display);
  let isExactMode = $derived(speedOfLight.isExact);

  function handleFrequencyInput(e: Event) {
    const value = parseNullableNumericInput(e);
    setFrequencyHz(value !== null ? convertToHz(value, frequencyUnit) : null);
  }

  function handleWavelengthInput(e: Event) {
    const value = parseNullableNumericInput(e);
    if (value !== null && value > 0) {
      const meters = convertToMeters(value, wavelengthUnit);
      setFrequencyHz(wavelengthToFrequency(meters));
    } else {
      setFrequencyHz(null);
    }
  }

  function handleFrequencyUnitChange(e: Event) {
    frequencyUnit = parseSelectValue(e);
  }

  function handleWavelengthUnitChange(e: Event) {
    wavelengthUnit = parseSelectValue(e);
  }

  function setQuickFrequency(hz: number) {
    setFrequencyHz(hz);
    // Auto-select GHz unit for better display of these frequencies
    frequencyUnit = 'GHz';
  }

  function toggleFormula() {
    showFormula = !showFormula;
  }

  function handleSpeedOfLightToggle() {
    speedOfLight.toggle();
  }
</script>

<div class="card-compact">
  <!-- Main Input Row: Horizontal on desktop, vertical on mobile -->
  <div class="converter-row">
    <!-- Frequency Input -->
    <div class="input-group">
      <label for="frequency" class="input-label"> Frequenz </label>
      <input
        type="number"
        id="frequency"
        value={formatPrecisionNumber(frequencyDisplay, FIELD_PRECISION, FIELD_EXP_THRESHOLD, FIELD_EXP_DIGITS)}
        oninput={handleFrequencyInput}
        class="input-field flex-1"
        placeholder="Frequenz"
        step="any"
      />
      <select
        value={frequencyUnit}
        onchange={handleFrequencyUnitChange}
        class="select-field"
        aria-label="Frequenzeinheit"
      >
        {#each FREQUENCY_UNITS as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>

    <!-- Bidirectional Arrow -->
    <span class="arrow" aria-hidden="true">&#8596;</span>

    <!-- Wavelength Input -->
    <div class="input-group">
      <label for="wavelength" class="input-label"> Wellenlänge </label>
      <input
        type="number"
        id="wavelength"
        value={formatPrecisionNumber(wavelengthDisplay, FIELD_PRECISION, FIELD_EXP_THRESHOLD, FIELD_EXP_DIGITS)}
        oninput={handleWavelengthInput}
        class="input-field flex-1"
        placeholder="Wellenlänge"
        step="any"
      />
      <select
        value={wavelengthUnit}
        onchange={handleWavelengthUnitChange}
        class="select-field"
        aria-label="Wellenlängeneinheit"
      >
        {#each WAVELENGTH_UNITS as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>
  </div>

  <FrequencyPresets
    presets={FREQUENCY_CONVERTER_PRESETS}
    {showFormula}
    onSelect={setQuickFrequency}
    onToggleFormula={toggleFormula}
  />

  <!-- Collapsible Formula Section -->
  {#if showFormula}
    <FrequencyFormula {speedOfLightDisplay} {isExactMode} onToggleSpeedOfLight={handleSpeedOfLightToggle} />
  {/if}
</div>

<style>
  .converter-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (min-width: 768px) {
    .converter-row {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
    }
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex: 1;
    min-width: 0;
  }

  .input-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    white-space: nowrap;
    width: 4rem;
  }

  @media (min-width: 768px) {
    .input-label {
      width: auto;
    }
  }

  .input-field {
    min-width: 0;
    padding: 0.5rem 0.5rem;
  }

  .select-field {
    padding: 0.5rem 0.375rem;
  }

  .arrow {
    display: none;
    color: var(--color-text-tertiary);
    font-size: 1rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    .arrow {
      display: block;
    }
  }
</style>
