<script lang="ts">
  /**
   * Rechner für Parabolantennen: aus Durchmesser, Frequenz und
   * Flächenwirkungsgrad folgen Gewinn, Öffnungswinkel, Wirkfläche und der
   * Beginn des Fernfelds.
   */
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { formatDistance, formatFrequency, formatNumber, formatWavelength } from '$lib/utils/formatting';
  import { FREQUENCY_UNITS, DISTANCE_UNITS } from '$lib/data/units';
  import {
    dbiToDbd,
    effectiveApertureM2,
    farFieldDistanceM,
    parabolicBeamwidthDeg,
    parabolicGainDbi,
    wavelengthM
  } from '$lib/utils/antennaMath';

  const DIAMETER_UNITS = DISTANCE_UNITS.filter((unit) => unit.id === 'm' || unit.id === 'km');
  const FREQ_UNITS = FREQUENCY_UNITS.filter((unit) => unit.id !== 'Hz' && unit.id !== 'THz');

  const DIAMETER_MIN_M = 0.05;
  const DIAMETER_MAX_M = 100;
  const FREQUENCY_MIN_HZ = 100e6;
  const FREQUENCY_MAX_HZ = 100e9;
  const EFFICIENCY_MIN = 0.3;
  const EFFICIENCY_MAX = 0.8;

  interface Preset {
    id: string;
    label: string;
    diameterM: number;
    frequencyHz: number;
    efficiency: number;
  }

  const PRESETS: Preset[] = [
    {
      id: 'sat',
      label: 'Sat-Schüssel 60 cm, 11 GHz',
      diameterM: 0.6,
      frequencyHz: 11e9,
      efficiency: 0.6
    },
    {
      id: 'effelsberg',
      label: 'Effelsberg 100 m, 1,4 GHz',
      diameterM: 100,
      frequencyHz: 1.4e9,
      efficiency: 0.5
    },
    { id: 'dsn', label: 'DSN 70 m, 8,4 GHz', diameterM: 70, frequencyHz: 8.4e9, efficiency: 0.7 }
  ];

  let diameterM = $state(0.6);
  let frequencyHz = $state(11e9);
  let efficiency = $state(0.6);
  let diameterUnit = $state('m');
  let frequencyUnit = $state('GHz');
  let activePreset = $state<string | null>('sat');

  const lambda = $derived(wavelengthM(frequencyHz));
  const gainDbi = $derived(parabolicGainDbi(diameterM, lambda, efficiency));
  const beamwidthDeg = $derived(parabolicBeamwidthDeg(diameterM, lambda));
  const apertureM2 = $derived(effectiveApertureM2(gainDbi, lambda));
  const farFieldM = $derived(farFieldDistanceM(diameterM, lambda));

  function applyPreset(preset: Preset) {
    diameterM = preset.diameterM;
    frequencyHz = preset.frequencyHz;
    efficiency = preset.efficiency;
    activePreset = preset.id;
  }
</script>

<div class="calculator">
  <div class="presets" role="group" aria-label="Beispiele übernehmen">
    {#each PRESETS as preset (preset.id)}
      <Button
        size="sm"
        variant={activePreset === preset.id ? 'primary' : 'secondary'}
        pressed={activePreset === preset.id}
        onclick={() => applyPreset(preset)}
      >
        {preset.label}
      </Button>
    {/each}
  </div>

  <div class="fields">
    <NumberInput
      label="Spiegeldurchmesser D"
      bind:value={diameterM}
      bind:unit={diameterUnit}
      units={DIAMETER_UNITS}
      min={DIAMETER_MIN_M}
      max={DIAMETER_MAX_M}
      onchange={() => (activePreset = null)}
    />
    <NumberInput
      label="Frequenz f"
      bind:value={frequencyHz}
      bind:unit={frequencyUnit}
      units={FREQ_UNITS}
      min={FREQUENCY_MIN_HZ}
      max={FREQUENCY_MAX_HZ}
      onchange={() => (activePreset = null)}
    />
    <Slider
      label="Flächenwirkungsgrad η"
      bind:value={efficiency}
      min={EFFICIENCY_MIN}
      max={EFFICIENCY_MAX}
      step={0.01}
      format={(value) => `${formatNumber(value * 100, 0)} %`}
      unitSymbol="Prozent"
      onchange={() => (activePreset = null)}
      hint="Erregerabschattung, Randüberstrahlung und Oberflächenfehler kosten Fläche."
    />
  </div>

  <div class="results">
    <ResultCard
      label="Gewinn"
      value={formatNumber(gainDbi, 1)}
      unit="dBi"
      secondary={`= ${formatNumber(dbiToDbd(gainDbi), 1)} dBd`}
      emphasis="hero"
      hint="G = η · (π · D / λ)²"
    />
    <ResultCard label="Halbwertsbreite" value={formatNumber(beamwidthDeg, 2)} unit="Grad" hint="θ ≈ 70° · λ / D" />
    <ResultCard label="Wirkfläche A_eff" value={formatNumber(apertureM2, 3)} unit="m²" hint="A = G · λ² / 4π" />
    <ResultCard
      label="Fernfeld ab"
      value={formatDistance(farFieldM)}
      hint="r = 2 · D² / λ — davor gilt die Gewinnangabe nicht."
    />
  </div>

  <p class="note">
    Wellenlänge bei {formatFrequency(frequencyHz)}: {formatWavelength(lambda)}. Der Durchmesser entspricht {formatNumber(
      diameterM / lambda,
      1
    )} Wellenlängen.
  </p>
</div>

<style>
  .calculator {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 0.75rem;
    align-items: end;
  }

  .results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 0.75rem;
  }

  .note {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
