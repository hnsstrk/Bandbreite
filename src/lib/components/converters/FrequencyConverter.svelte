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

  // Quick frequency presets (in Hz)
  const quickFrequencies = [
    { label: '2.4 GHz', hz: 2.4e9 },
    { label: '5 GHz', hz: 5e9 },
    { label: '28 GHz', hz: 28e9 },
    { label: '77 GHz', hz: 77e9 },
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

<div class="bg-slate-800 rounded-lg p-3 shadow-xl">
  <!-- Main Input Row: Horizontal on desktop, vertical on mobile -->
  <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
    <!-- Frequency Input -->
    <div class="flex items-center gap-1.5 flex-1 min-w-0">
      <label for="frequency" class="text-xs font-medium text-slate-300 whitespace-nowrap w-16 md:w-auto">
        Frequenz
      </label>
      <input
        type="number"
        id="frequency"
        value={frequencyDisplay !== null ? formatNumber(frequencyDisplay) : ''}
        oninput={handleFrequencyInput}
        class="flex-1 min-w-0 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Frequenz"
        step="any"
      />
      <select
        value={frequencyUnit}
        onchange={handleFrequencyUnitChange}
        class="bg-slate-700 border border-slate-600 rounded px-1.5 py-1 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#each FREQUENCY_UNITS as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>

    <!-- Bidirectional Arrow -->
    <span class="hidden md:block text-slate-400 text-base font-bold flex-shrink-0">↔</span>

    <!-- Wavelength Input -->
    <div class="flex items-center gap-1.5 flex-1 min-w-0">
      <label for="wavelength" class="text-xs font-medium text-slate-300 whitespace-nowrap w-16 md:w-auto">
        Wellenlaenge
      </label>
      <input
        type="number"
        id="wavelength"
        value={wavelengthDisplay !== null ? formatNumber(wavelengthDisplay) : ''}
        oninput={handleWavelengthInput}
        class="flex-1 min-w-0 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Wellenlaenge"
        step="any"
      />
      <select
        value={wavelengthUnit}
        onchange={handleWavelengthUnitChange}
        class="bg-slate-700 border border-slate-600 rounded px-1.5 py-1 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#each WAVELENGTH_UNITS as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Quick Frequency Buttons -->
  <div class="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-700">
    <span class="text-xs text-slate-400 mr-1">Quick:</span>
    {#each quickFrequencies as preset (preset.label)}
      <button
        type="button"
        onclick={() => setQuickFrequency(preset.hz)}
        class="px-2 py-0.5 text-xs rounded border border-slate-600 hover:border-blue-500
               bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-blue-400
               transition-colors"
      >
        {preset.label}
      </button>
    {/each}

    <!-- Formula Toggle Button (right-aligned) -->
    <button
      type="button"
      onclick={toggleFormula}
      class="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-slate-600
             hover:border-slate-500 bg-slate-700/50 hover:bg-slate-700 text-slate-400
             hover:text-slate-300 transition-colors"
      aria-expanded={showFormula}
      aria-controls="formula-section"
    >
      <span class="transform transition-transform {showFormula ? 'rotate-180' : ''}">&#9660;</span>
      <span>Formel</span>
    </button>
  </div>

  <!-- Collapsible Formula Section -->
  {#if showFormula}
    <div
      id="formula-section"
      class="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400"
    >
      <span class="font-mono bg-slate-700/50 px-2 py-0.5 rounded">λ = c / f</span>

      <!-- Speed of Light Toggle -->
      <button
        type="button"
        onclick={handleSpeedOfLightToggle}
        class="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-600 hover:border-slate-500
               bg-slate-700/50 hover:bg-slate-700 transition-colors"
        title={isExactMode ? 'Wechseln zu gerundeter Lichtgeschwindigkeit (3x10^8 m/s)' : 'Wechseln zu exakter Lichtgeschwindigkeit'}
      >
        <span class={isExactMode ? 'text-blue-400 font-semibold' : 'text-slate-500'}>exakt</span>
        <span class="text-slate-500">|</span>
        <span class={!isExactMode ? 'text-green-400 font-semibold' : 'text-slate-500'}>~</span>
      </button>

      <span class="text-slate-500">(c = {speedOfLightDisplay} m/s)</span>
    </div>
  {/if}
</div>
