<script lang="ts">
  /** Eingabefelder des Radar-Reichweiten-Rechners. */
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import PresetChips from './PresetChips.svelte';
  import {
    FREQUENCY_UNIT_OPTIONS,
    GAIN_MAX_DBI,
    GAIN_MIN_DBI,
    POWER_UNIT_OPTIONS,
    RADAR_FREQUENCY_MAX_HZ,
    RADAR_FREQUENCY_MIN_HZ,
    RADAR_FREQUENCY_PRESETS,
    RCS_MAX_M2,
    RCS_MIN_M2,
    RCS_PRESETS,
    SENSITIVITY_MAX_DBM,
    SENSITIVITY_MIN_DBM,
    SYSTEM_LOSS_MAX_DB,
    SYSTEM_LOSS_MIN_DB,
    TX_POWER_MAX_W,
    TX_POWER_MIN_W,
    type PresetChip
  } from './radarRange.svelte';

  interface Props {
    frequencyHz: number;
    frequencyUnit: string;
    txPowerW: number;
    antennaGainDbi: number;
    rcsM2: number;
    rxSensitivityDbm: number;
    systemLossDb: number;
    /** ID des zuletzt gewählten RCS-Chips */
    rcsPresetId: string | null;
    onrcspreset: (preset: PresetChip) => void;
  }

  let {
    frequencyHz = $bindable(),
    frequencyUnit = $bindable(),
    txPowerW = $bindable(),
    antennaGainDbi = $bindable(),
    rcsM2 = $bindable(),
    rxSensitivityDbm = $bindable(),
    systemLossDb = $bindable(),
    rcsPresetId,
    onrcspreset
  }: Props = $props();

  let frequencyPresets = $derived(
    RADAR_FREQUENCY_PRESETS.map((preset) => ({
      label: preset.label,
      value: preset.value,
      hint: preset.hint
    }))
  );
</script>

<div class="radar-inputs">
  <NumberInput
    label="Frequenz"
    bind:value={frequencyHz}
    bind:unit={frequencyUnit}
    units={FREQUENCY_UNIT_OPTIONS}
    min={RADAR_FREQUENCY_MIN_HZ}
    max={RADAR_FREQUENCY_MAX_HZ}
    slider
    sliderScale="log"
    presets={frequencyPresets}
    hint="Betriebsfrequenz des Radars, 100 MHz bis 100 GHz"
  />

  <NumberInput
    label="Sendeleistung Pₜ"
    bind:value={txPowerW}
    units={POWER_UNIT_OPTIONS}
    min={TX_POWER_MIN_W}
    max={TX_POWER_MAX_W}
    slider
    sliderScale="log"
    hint="Spitzenleistung: Kfz-Radar ab 1 mW, Wetterradar bis 1 MW"
  />

  <NumberInput
    label="Antennengewinn G"
    bind:value={antennaGainDbi}
    units={[{ id: 'dbi', symbol: 'dBi', factor: 1 }]}
    min={GAIN_MIN_DBI}
    max={GAIN_MAX_DBI}
    step={0.1}
    slider
    hint="Parabolantennen 30–50 dBi, Kfz-Radar 10–20 dBi"
  />

  <NumberInput
    label="Radarquerschnitt σ"
    bind:value={rcsM2}
    units={[{ id: 'm2', symbol: 'm²', factor: 1 }]}
    min={RCS_MIN_M2}
    max={RCS_MAX_M2}
    slider
    sliderScale="log"
    hint="Effektive Rückstreufläche des Ziels"
  />

  <NumberInput
    label="Empfindlichkeit Pᵣ,min"
    bind:value={rxSensitivityDbm}
    units={[{ id: 'dbm', symbol: 'dBm', factor: 1 }]}
    min={SENSITIVITY_MIN_DBM}
    max={SENSITIVITY_MAX_DBM}
    step={1}
    slider
    hint="Kleinste noch auswertbare Empfangsleistung, typisch −90 bis −110 dBm"
  />

  <NumberInput
    label="Systemverluste L"
    bind:value={systemLossDb}
    units={[{ id: 'db', symbol: 'dB', factor: 1 }]}
    min={SYSTEM_LOSS_MIN_DB}
    max={SYSTEM_LOSS_MAX_DB}
    step={0.5}
    slider
    hint="Wellenleiter, Duplexer, Signalverarbeitung — typisch 3 bis 10 dB"
  />
</div>

<div class="radar-inputs__presets">
  <span class="radar-inputs__preset-label" id="rcs-preset-label"> Radarquerschnitt aus der Referenztabelle </span>
  <PresetChips
    label="Radarquerschnitt-Voreinstellungen"
    presets={RCS_PRESETS}
    value={rcsM2}
    chosenId={rcsPresetId}
    onselect={onrcspreset}
  />
</div>

<style>
  .radar-inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: 1.25rem;
  }

  .radar-inputs__presets {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }

  .radar-inputs__preset-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink-muted);
  }
</style>
