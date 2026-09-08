<script lang="ts">
  import { wattToDbm, dbmToWatt, wattToDbW, dbWToWatt, convertToWatt, convertFromWatt } from '$lib/utils/conversions';
  import { POWER_UNITS_WATT, POWER_UNITS_DB, DEFAULT_POWER_UNIT_WATT, DEFAULT_POWER_UNIT_DB } from '$lib/data/units';
  import { pickBestUnit } from '$lib/components/ui/numberInput.svelte';
  import { parseNullableNumericInput, parseSelectValue } from '$lib/utils/handlers';
  import { formatPrecisionNumber } from '$lib/utils/formatting';

  interface Props {
    powerWatt?: number | null;
  }

  // Bindable prop to expose power in Watt to parent
  let { powerWatt = $bindable(1) }: Props = $props();

  let wattUnit = $state(DEFAULT_POWER_UNIT_WATT);
  let dbUnit = $state(DEFAULT_POWER_UNIT_DB);

  // Das Prop ist die einzige Quelle des Werts (E3 / P0-1: keine interne Kopie).
  // Eine Änderung von außen wechselt das Watt-Feld auf eine lesbare Einheit;
  // eigene Schreibzugriffe lassen die vom Nutzer gewählte Einheit in Ruhe.
  let lastOwnWatt = powerWatt;
  $effect(() => {
    if (powerWatt === lastOwnWatt) return;
    lastOwnWatt = powerWatt;
    if (powerWatt === null || powerWatt <= 0) return;
    const unit = pickBestUnit(powerWatt, POWER_UNITS_WATT);
    if (unit) wattUnit = unit.id;
  });

  function setPowerWatt(watt: number | null) {
    lastOwnWatt = watt;
    powerWatt = watt;
  }

  // Derived values for display
  let wattDisplay = $derived(
    powerWatt !== null ? convertFromWatt(powerWatt, wattUnit) : null
  );

  let dbDisplay = $derived.by(() => {
    if (powerWatt === null || powerWatt <= 0) return null;
    if (dbUnit === 'dbm') {
      return wattToDbm(powerWatt);
    } else {
      return wattToDbW(powerWatt);
    }
  });

  function handleWattInput(e: Event) {
    const value = parseNullableNumericInput(e);
    setPowerWatt(value !== null && value > 0 ? convertToWatt(value, wattUnit) : null);
  }

  function handleDbInput(e: Event) {
    const value = parseNullableNumericInput(e);
    if (value !== null) {
      if (dbUnit === 'dbm') {
        setPowerWatt(dbmToWatt(value));
      } else {
        setPowerWatt(dbWToWatt(value));
      }
    } else {
      setPowerWatt(null);
    }
  }

  function handleWattUnitChange(e: Event) {
    wattUnit = parseSelectValue(e);
  }

  function handleDbUnitChange(e: Event) {
    dbUnit = parseSelectValue(e);
  }

  function formatNumber(num: number | null): string {
    return formatPrecisionNumber(num);
  }
</script>

<div class="card-compact">
  <div class="converter-row">
    <!-- Watt Input -->
    <div class="input-group">
      <label for="power-watt" class="input-label">
        Leistung
      </label>
      <input
        type="number"
        id="power-watt"
        value={wattDisplay !== null ? formatNumber(wattDisplay) : ''}
        oninput={handleWattInput}
        class="input-field flex-1"
        placeholder="Leistung"
        step="any"
      />
      <select
        value={wattUnit}
        onchange={handleWattUnitChange}
        class="select-field"
        aria-label="Leistungseinheit (Watt)"
      >
        {#each POWER_UNITS_WATT as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>

    <!-- Bidirectional Arrow -->
    <span class="arrow" aria-hidden="true">&#8596;</span>

    <!-- dB Input -->
    <div class="input-group">
      <input
        type="number"
        id="power-db"
        value={dbDisplay !== null ? formatNumber(dbDisplay) : ''}
        oninput={handleDbInput}
        class="input-field flex-1"
        placeholder="dB"
        step="any"
        aria-label="Leistung in dB"
      />
      <select
        value={dbUnit}
        onchange={handleDbUnitChange}
        class="select-field"
        aria-label="Leistungseinheit (dB)"
      >
        {#each POWER_UNITS_DB as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>

    <!-- Formula Display (compact) -->
    <div class="formula-display">
      <span>P(dBm) = 10 log&#8321;&#8320;(P/1mW)</span>
    </div>
  </div>
</div>

<style>
  .converter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 180px;
  }

  .input-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .input-field {
    min-width: 80px;
    padding: 0.375rem 0.75rem;
  }

  .select-field {
    padding: 0.375rem 0.5rem;
  }

  .arrow {
    color: var(--color-text-tertiary);
    font-size: 1.125rem;
    font-weight: 700;
  }

  .formula-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  }
</style>
