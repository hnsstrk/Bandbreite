<script lang="ts">
  /** Niederschlagsparameter nach ITU-R P.838 (Regen) und P.840 (Nebel). */
  import {
    atmosphericParameters,
    type Polarization
  } from '$lib/stores/atmosphericParameters.svelte';
  import PresetChips from '$lib/components/calculators/PresetChips.svelte';
  import type { PresetChip } from '$lib/components/calculators/presetChips.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import {
    FOG_MAX_GM3,
    FOG_MIN_GM3,
    FOG_PRESETS,
    POLARIZATION_OPTIONS,
    RAIN_MAX_MMH,
    RAIN_MIN_MMH,
    RAIN_PRESETS,
    SNOW_MAX_MMH,
    SNOW_MIN_MMH,
    SNOW_PRESETS
  } from './atmosphericInputs.svelte';

  let rainPresetId = $state<string | null>('none');
  let fogPresetId = $state<string | null>('none');
  let snowPresetId = $state<string | null>('none');

  function handleRainPreset(preset: PresetChip) {
    rainPresetId = preset.id;
    atmosphericParameters.setRainRateMmH(preset.value);
  }

  function handleFogPreset(preset: PresetChip) {
    fogPresetId = preset.id;
    atmosphericParameters.setFogDensityGM3(preset.value);
  }

  function handleSnowPreset(preset: PresetChip) {
    snowPresetId = preset.id;
    atmosphericParameters.setSnowRateMmH(preset.value);
  }

  function handlePolarizationChange(value: string) {
    atmosphericParameters.setPolarization(value as Polarization);
  }

  function handleResetPrecipitationClick() {
    atmosphericParameters.resetPrecipitation();
    rainPresetId = 'none';
    fogPresetId = 'none';
    snowPresetId = 'none';
  }

  function handleResetAllClick() {
    atmosphericParameters.reset();
    rainPresetId = 'none';
    fogPresetId = 'none';
    snowPresetId = 'none';
  }
</script>

<div class="precip">
  <div class="precip__group">
    <NumberInput
      label="Regenrate"
      bind:value={
        () => atmosphericParameters.rainRateMmH,
        (value) => atmosphericParameters.setRainRateMmH(value)
      }
      units={[{ id: 'mmh', symbol: 'mm/h', factor: 1 }]}
      min={RAIN_MIN_MMH}
      max={RAIN_MAX_MMH}
      step={0.5}
      slider
    />
    <PresetChips
      label="Regen-Voreinstellungen"
      presets={RAIN_PRESETS}
      value={atmosphericParameters.rainRateMmH}
      chosenId={rainPresetId}
      onselect={handleRainPreset}
    />
  </div>

  <div class="precip__group">
    <NumberInput
      label="Nebeldichte"
      bind:value={
        () => atmosphericParameters.fogDensityGM3,
        (value) => atmosphericParameters.setFogDensityGM3(value)
      }
      units={[{ id: 'gm3', symbol: 'g/m³', factor: 1 }]}
      min={FOG_MIN_GM3}
      max={FOG_MAX_GM3}
      step={0.01}
      slider
    />
    <PresetChips
      label="Nebel-Voreinstellungen"
      presets={FOG_PRESETS}
      value={atmosphericParameters.fogDensityGM3}
      chosenId={fogPresetId}
      onselect={handleFogPreset}
    />
  </div>

  <div class="precip__group">
    <NumberInput
      label="Schneerate"
      bind:value={
        () => atmosphericParameters.snowRateMmH,
        (value) => atmosphericParameters.setSnowRateMmH(value)
      }
      units={[{ id: 'mmh', symbol: 'mm/h', factor: 1 }]}
      min={SNOW_MIN_MMH}
      max={SNOW_MAX_MMH}
      step={0.5}
      slider
      hint="Wasseräquivalent"
    />
    <PresetChips
      label="Schnee-Voreinstellungen"
      presets={SNOW_PRESETS}
      value={atmosphericParameters.snowRateMmH}
      chosenId={snowPresetId}
      onselect={handleSnowPreset}
    />
  </div>

  <Select
    label="Polarisation"
    value={atmosphericParameters.polarization}
    options={POLARIZATION_OPTIONS}
    onchange={handlePolarizationChange}
    hint="Beeinflusst die Regendämpfung: horizontal dämpft stärker als vertikal"
  />

  <div class="precip__actions">
    <Button size="sm" variant="ghost" icon="reset" onclick={handleResetPrecipitationClick}>
      Niederschlag zurücksetzen
    </Button>
    <Button size="sm" variant="ghost" icon="reset" onclick={handleResetAllClick}>
      Alles zurücksetzen
    </Button>
  </div>

  <Callout tone="info" title="Einordnung der Raten" source="ITU-R P.838-3 / P.840-9">
    Nieselregen 0,25 bis 1 mm/h, leichter Regen 1 bis 4 mm/h, mäßiger Regen 4 bis 16 mm/h,
    starker Regen 16 bis 50 mm/h, Wolkenbruch über 100 mm/h. Nebel wird über die
    Flüssigwasserdichte beschrieben, Schnee über sein Wasseräquivalent.
  </Callout>
</div>

<style>
  .precip {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .precip__group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .precip__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
