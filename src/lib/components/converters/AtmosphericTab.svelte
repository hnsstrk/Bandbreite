<script lang="ts">
  /** Atmosphärische Grundgrößen nach ITU-R P.676: Temperatur, Druck, Wasserdampf. */
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import {
    PRESSURE_MAX_HPA,
    PRESSURE_MIN_HPA,
    TEMPERATURE_MAX_C,
    TEMPERATURE_MIN_C,
    WATER_VAPOR_MAX,
    WATER_VAPOR_MIN
  } from './atmosphericInputs.svelte';

  function handleResetClick() {
    atmosphericParameters.resetAtmospheric();
  }
</script>

<div class="atm-tab">
  <div class="atm-tab__inputs">
    <NumberInput
      label="Temperatur"
      bind:value={
        () => atmosphericParameters.temperatureCelsius, (value) => atmosphericParameters.setTemperatureCelsius(value)
      }
      units={[{ id: 'c', symbol: '°C', factor: 1 }]}
      min={TEMPERATURE_MIN_C}
      max={TEMPERATURE_MAX_C}
      step={1}
      slider
    />

    <NumberInput
      label="Luftdruck"
      bind:value={() => atmosphericParameters.pressureHpa, (value) => atmosphericParameters.setPressureHpa(value)}
      units={[{ id: 'hpa', symbol: 'hPa', factor: 1 }]}
      min={PRESSURE_MIN_HPA}
      max={PRESSURE_MAX_HPA}
      step={1}
      slider
    />

    <NumberInput
      label="Wasserdampfdichte"
      bind:value={
        () => atmosphericParameters.waterVaporDensity, (value) => atmosphericParameters.setWaterVaporDensity(value)
      }
      units={[{ id: 'gm3', symbol: 'g/m³', factor: 1 }]}
      min={WATER_VAPOR_MIN}
      max={WATER_VAPOR_MAX}
      step={0.5}
      slider
    />
  </div>

  <div class="atm-tab__actions">
    <Button size="sm" variant="ghost" icon="reset" onclick={handleResetClick}>
      Auf Standardatmosphäre zurücksetzen
    </Button>
  </div>

  <Callout tone="info" title="Standardatmosphäre" source="ITU-R P.676-13">
    Voreingestellt ist die ISA: 15 °C, 1013,25 hPa und 7,5 g/m³ Wasserdampf. Der Wasserdampf bestimmt die Linien bei
    22,2 und 183,3 GHz, der Sauerstoff die bei 60 und 118,75 GHz.
  </Callout>
</div>

<style>
  .atm-tab {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .atm-tab__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 1.25rem;
  }

  .atm-tab__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
