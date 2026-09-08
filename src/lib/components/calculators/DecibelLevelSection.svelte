<script lang="ts">
  /**
   * Pegelumrechnung: Leistung, dBm, dBW, Spannung und dBµV beschreiben
   * denselben Arbeitspunkt. Führende Größe ist der Pegel in dBm; Leistungs-
   * und Spannungsfeld schreiben ihn zurück.
   */
  import { untrack } from 'svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { formatNumber, formatPowerWatts } from '$lib/utils/formatting';
  import { wattToDbm } from '$lib/utils/conversions';
  import { levelsFromDbm, voltToWatt, dbmToDbuvOffset } from '$lib/utils/decibel';
  import PresetChips from './PresetChips.svelte';
  import {
    LEVEL_MAX_DBM,
    LEVEL_MIN_DBM,
    LEVEL_PRESETS,
    POWER_MAX_W,
    POWER_MIN_W,
    POWER_UNITS,
    VOLTAGE_MAX_V,
    VOLTAGE_MIN_V,
    VOLTAGE_UNITS,
    voltageParts
  } from './decibelCalculator.svelte';
  import type { PresetChip } from './presetChips.svelte';

  interface Props {
    /** Pegel in dBm — die führende Größe */
    levelDbm: number;
    /** Bezugsimpedanz in Ohm */
    impedanceOhm: number;
  }

  let { levelDbm = $bindable(), impedanceOhm }: Props = $props();

  /** Relative Abweichung, ab der ein Feld nachgeführt wird. */
  const SYNC_TOLERANCE = 1e-9;

  let powerW = $state(0);
  let voltV = $state(0);
  let powerUnit = $state('w');
  let voltageUnit = $state('v');
  let chosenPresetId = $state<string | null>(null);

  let levels = $derived(levelsFromDbm(levelDbm, impedanceOhm));
  let voltage = $derived(voltageParts(levels.volt));

  /**
   * Die Eingabefelder folgen dem Pegel. Der Rückweg läuft über `onchange`,
   * damit das Feld während der Eingabe nicht überschrieben wird — deshalb
   * werden die Feldwerte hier ungetrackt geschrieben.
   */
  $effect(() => {
    const next = levels;
    untrack(() => {
      if (Math.abs(next.watt - powerW) > SYNC_TOLERANCE * Math.max(next.watt, 1e-15)) {
        powerW = next.watt;
      }
      if (Math.abs(next.volt - voltV) > SYNC_TOLERANCE * Math.max(next.volt, 1e-12)) {
        voltV = next.volt;
      }
    });
  });

  function handlePowerChange(value: number) {
    if (value > 0) levelDbm = wattToDbm(value);
    chosenPresetId = null;
  }

  function handleVoltageChange(value: number) {
    if (value > 0) levelDbm = wattToDbm(voltToWatt(value, impedanceOhm));
    chosenPresetId = null;
  }

  function applyPreset(preset: PresetChip) {
    levelDbm = preset.value;
    chosenPresetId = preset.id;
  }
</script>

<div class="level">
  <PresetChips
    label="Typische Sendeleistungen übernehmen"
    presets={LEVEL_PRESETS}
    value={levelDbm}
    chosenId={chosenPresetId}
    onselect={applyPreset}
  />

  <div class="level__inputs">
    <Slider
      label="Pegel"
      bind:value={levelDbm}
      min={LEVEL_MIN_DBM}
      max={LEVEL_MAX_DBM}
      step={0.1}
      format={(value) => `${formatNumber(value, 1)} dBm`}
      unitSymbol="dBm"
      ticks={[
        { at: LEVEL_MIN_DBM, label: '−140' },
        { at: 0, label: '0' },
        { at: LEVEL_MAX_DBM, label: '+90' }
      ]}
      onchange={() => (chosenPresetId = null)}
    />
    <NumberInput
      label="Leistung P"
      bind:value={powerW}
      bind:unit={powerUnit}
      units={POWER_UNITS}
      min={POWER_MIN_W}
      max={POWER_MAX_W}
      hint="Eingabe rechnet in den Pegel zurück"
      onchange={handlePowerChange}
    />
    <NumberInput
      label="Spannung U"
      bind:value={voltV}
      bind:unit={voltageUnit}
      units={VOLTAGE_UNITS}
      min={VOLTAGE_MIN_V}
      max={VOLTAGE_MAX_V}
      hint="Effektivwert an {formatNumber(impedanceOhm, 0)} Ω"
      onchange={handleVoltageChange}
    />
  </div>

  <div class="level__results">
    <ResultCard
      label="Leistungspegel"
      value={formatNumber(levels.dbm, 2)}
      unit="dBm"
      secondary="{formatNumber(levels.dbw, 2)} dBW"
      emphasis="hero"
    />
    <ResultCard label="Leistung" value={formatPowerWatts(levels.watt)} hint="P = 10^(dBm/10) mW" />
    <ResultCard
      label="Spannungspegel"
      value={formatNumber(levels.dbuv, 2)}
      unit="dBµV"
      hint="dBµV = dBm + {formatNumber(dbmToDbuvOffset(impedanceOhm), 2)} dB an {formatNumber(
        impedanceOhm,
        0
      )} Ω"
    />
    <ResultCard
      label="Spannung"
      value={formatNumber(voltage.value, 2)}
      unit={voltage.symbol}
      secondary="U = √(P · Z)"
    />
  </div>
</div>

<style>
  .level {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .level__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 1.25rem;
    align-items: end;
  }

  .level__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 0.75rem;
  }
</style>
