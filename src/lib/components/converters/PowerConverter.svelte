<script lang="ts">
  import { wattToDbm, dbmToWatt, wattToDbW, dbWToWatt, convertToWatt, convertFromWatt } from '$lib/utils/conversions';
  import { POWER_UNITS_WATT, POWER_UNITS_DB, DEFAULT_POWER_UNIT_WATT, DEFAULT_POWER_UNIT_DB } from '$lib/data/units';

  interface Props {
    powerWatt?: number | null;
  }

  // Bindable prop to expose power in Watt to parent
  let { powerWatt = $bindable(1) }: Props = $props();

  // Store the canonical value in Watt internally
  let powerInWatt = $state<number | null>(powerWatt);

  // Sync internal state with prop
  $effect(() => {
    powerWatt = powerInWatt;
  });

  let wattUnit = $state(DEFAULT_POWER_UNIT_WATT);
  let dbUnit = $state(DEFAULT_POWER_UNIT_DB);

  // Derived values for display
  let wattDisplay = $derived(
    powerInWatt !== null ? convertFromWatt(powerInWatt, wattUnit) : null
  );

  let dbDisplay = $derived.by(() => {
    if (powerInWatt === null || powerInWatt <= 0) return null;
    if (dbUnit === 'dbm') {
      return wattToDbm(powerInWatt);
    } else {
      return wattToDbW(powerInWatt);
    }
  });

  function handleWattInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : null;
    powerInWatt = value !== null && value > 0 ? convertToWatt(value, wattUnit) : null;
  }

  function handleDbInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value ? parseFloat(target.value) : null;
    if (value !== null) {
      if (dbUnit === 'dbm') {
        powerInWatt = dbmToWatt(value);
      } else {
        powerInWatt = dbWToWatt(value);
      }
    } else {
      powerInWatt = null;
    }
  }

  function handleWattUnitChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    wattUnit = target.value;
  }

  function handleDbUnitChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    dbUnit = target.value;
  }

  function formatNumber(num: number | null): string {
    if (num === null) return '';
    if (num === 0) return '0';
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 1e6) {
      return num.toExponential(4);
    }
    return num.toPrecision(6).replace(/\.?0+$/, '');
  }
</script>

<div class="bg-slate-800 rounded-xl p-4 shadow-lg">
  <div class="flex flex-wrap items-center gap-4">
    <!-- Watt Input -->
    <div class="flex items-center gap-2 flex-1 min-w-[180px]">
      <label for="power-watt" class="text-sm font-medium text-slate-300 whitespace-nowrap">
        Leistung
      </label>
      <input
        type="number"
        id="power-watt"
        value={wattDisplay !== null ? formatNumber(wattDisplay) : ''}
        oninput={handleWattInput}
        class="flex-1 min-w-[80px] bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        placeholder="Leistung"
        step="any"
      />
      <select
        value={wattUnit}
        onchange={handleWattUnitChange}
        class="bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {#each POWER_UNITS_WATT as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>

    <!-- Bidirectional Arrow -->
    <span class="text-slate-400 text-lg font-bold">↔</span>

    <!-- dB Input -->
    <div class="flex items-center gap-2 flex-1 min-w-[150px]">
      <input
        type="number"
        id="power-db"
        value={dbDisplay !== null ? formatNumber(dbDisplay) : ''}
        oninput={handleDbInput}
        class="flex-1 min-w-[80px] bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        placeholder="dB"
        step="any"
      />
      <select
        value={dbUnit}
        onchange={handleDbUnitChange}
        class="bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {#each POWER_UNITS_DB as unit (unit.id)}
          <option value={unit.id}>{unit.symbol}</option>
        {/each}
      </select>
    </div>

    <!-- Formula Display (compact) -->
    <div class="flex items-center gap-2 text-slate-400 text-xs">
      <span class="font-mono">P(dBm) = 10·log₁₀(P/1mW)</span>
    </div>
  </div>
</div>
