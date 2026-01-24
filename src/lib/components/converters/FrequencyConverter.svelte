<script lang="ts">
  import { frequencyToWavelength, wavelengthToFrequency } from '$lib/utils/calculations';
  import { convertToHz, convertFromHz, convertToMeters, convertFromMeters } from '$lib/utils/conversions';
  import { FREQUENCY_UNITS, WAVELENGTH_UNITS, DEFAULT_FREQUENCY_UNIT, DEFAULT_WAVELENGTH_UNIT } from '$lib/data/units';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';

  interface Props {
    frequencyHz?: number | null;
  }

  // Bindable prop to expose frequency in Hz to parent
  let { frequencyHz = $bindable(convertToHz(100, DEFAULT_FREQUENCY_UNIT)) }: Props = $props();

  // Store the canonical value in Hz internally, synced with prop
  let frequencyInHz = $state<number | null>(frequencyHz);

  // Sync internal state with prop
  $effect(() => {
    frequencyHz = frequencyInHz;
  });
  let frequencyUnit = $state(DEFAULT_FREQUENCY_UNIT);
  let wavelengthUnit = $state(DEFAULT_WAVELENGTH_UNIT);

  // Collapsible formula section state
  let showFormula = $state(false);

  // Quick frequency presets (in Hz) with typical use cases
  const quickFrequencies = [
    { label: '2.4 GHz', desc: 'WLAN/Bluetooth', hz: 2.4e9 },
    { label: '5 GHz', desc: 'WLAN 5', hz: 5e9 },
    { label: '28 GHz', desc: '5G mmWave', hz: 28e9 },
    { label: '77 GHz', desc: 'Kfz-Radar', hz: 77e9 },
  ];

  // Derived values for display - reactive to speed of light changes
  let frequencyDisplay = $derived(
    frequencyInHz !== null ? convertFromHz(frequencyInHz, frequencyUnit) : null
  );

  let wavelengthDisplay = $derived(
    frequencyInHz !== null && frequencyInHz > 0
      ? convertFromMeters(frequencyToWavelength(frequencyInHz), wavelengthUnit)
      : null
  );

  // Reactive display of current speed of light value
  let speedOfLightDisplay = $derived(speedOfLight.display);
  let isExactMode = $derived(speedOfLight.isExact);

  function handleFrequencyInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : null;
    frequencyInHz = value !== null ? convertToHz(value, frequencyUnit) : null;
  }

  function handleWavelengthInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : null;
    if (value !== null && value > 0) {
      const meters = convertToMeters(value, wavelengthUnit);
      frequencyInHz = wavelengthToFrequency(meters);
    } else {
      frequencyInHz = null;
    }
  }

  function handleFrequencyUnitChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    frequencyUnit = target.value;
  }

  function handleWavelengthUnitChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    wavelengthUnit = target.value;
  }

  function setQuickFrequency(hz: number) {
    frequencyInHz = hz;
    // Auto-select GHz unit for better display of these frequencies
    frequencyUnit = 'GHz';
  }

  function toggleFormula() {
    showFormula = !showFormula;
  }

  function formatNumber(num: number | null): string {
    if (num === null) return '';
    if (num === 0) return '0';
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 1e9) {
      return num.toExponential(6);
    }
    return num.toPrecision(8).replace(/\.?0+$/, '');
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
      <label for="frequency" class="input-label">
        Frequenz
      </label>
      <input
        type="number"
        id="frequency"
        value={frequencyDisplay !== null ? formatNumber(frequencyDisplay) : ''}
        oninput={handleFrequencyInput}
        class="input-field flex-1"
        placeholder="Frequenz"
        step="any"
      />
      <select
        value={frequencyUnit}
        onchange={handleFrequencyUnitChange}
        class="select-field"
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
      <label for="wavelength" class="input-label">
        Wellenlänge
      </label>
      <input
        type="number"
        id="wavelength"
        value={wavelengthDisplay !== null ? formatNumber(wavelengthDisplay) : ''}
        oninput={handleWavelengthInput}
        class="input-field flex-1"
        placeholder="Wellenlänge"
        step="any"
      />
      <select
        value={wavelengthUnit}
        onchange={handleWavelengthUnitChange}
        class="select-field"
      >
        {#each WAVELENGTH_UNITS as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Quick Frequency Buttons -->
  <div class="quick-actions">
    <span class="quick-label">Quick:</span>
    {#each quickFrequencies as preset (preset.label)}
      <button
        type="button"
        onclick={() => setQuickFrequency(preset.hz)}
        class="btn-preset"
        title="{preset.label} - {preset.desc}"
      >
        <span class="preset-value">{preset.label}</span>
        <span class="preset-desc">({preset.desc})</span>
      </button>
    {/each}

    <!-- Formula Toggle Button (right-aligned) -->
    <button
      type="button"
      onclick={toggleFormula}
      class="btn-formula"
      aria-expanded={showFormula}
      aria-controls="formula-section"
    >
      <span class="formula-arrow" class:rotated={showFormula}>&#9660;</span>
      <span>Formel</span>
    </button>
  </div>

  <!-- Collapsible Formula Section -->
  {#if showFormula}
    <div id="formula-section" class="formula-section">
      <span class="formula-display">&#955; = c / f</span>

      <!-- Speed of Light Toggle -->
      <button
        type="button"
        onclick={handleSpeedOfLightToggle}
        class="speed-toggle"
        title={isExactMode ? 'Wechseln zu gerundeter Lichtgeschwindigkeit (3x10^8 m/s)' : 'Wechseln zu exakter Lichtgeschwindigkeit'}
      >
        <span class:active={isExactMode}>exakt</span>
        <span class="separator">|</span>
        <span class:active={!isExactMode}>~</span>
      </button>

      <span class="speed-value">(c = {speedOfLightDisplay} m/s)</span>
    </div>
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

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-default);
  }

  .quick-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin-right: 0.25rem;
  }

  .preset-value {
    font-weight: var(--font-weight-medium);
  }

  .preset-desc {
    color: var(--color-text-disabled);
    margin-left: 0.25rem;
  }

  .btn-formula {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-xs);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-default);
    background-color: var(--color-bg-elevated);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-formula:hover {
    border-color: var(--color-border-strong);
    background-color: var(--color-bg-surface);
    color: var(--color-text-secondary);
  }

  .formula-arrow {
    display: inline-block;
    transition: transform var(--transition-fast);
  }

  .formula-arrow.rotated {
    transform: rotate(180deg);
  }

  .formula-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-default);
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .formula-display {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    background-color: var(--color-bg-elevated);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-md);
  }

  .speed-toggle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-default);
    background-color: var(--color-bg-elevated);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .speed-toggle:hover {
    border-color: var(--color-border-strong);
    background-color: var(--color-bg-surface);
  }

  .speed-toggle span {
    color: var(--color-text-disabled);
  }

  .speed-toggle span.active {
    color: var(--color-accent-primary);
    font-weight: var(--font-weight-semibold);
  }

  .separator {
    color: var(--color-text-disabled);
  }

  .speed-value {
    color: var(--color-text-disabled);
  }
</style>
