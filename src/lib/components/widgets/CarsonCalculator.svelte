<script lang="ts">
  /**
   * Kleiner Rechner zur Carson-Regel: aus Frequenzhub und höchster
   * Modulationsfrequenz folgt die belegte Bandbreite B = 2 · (Δf + f_max).
   *
   * Die Rechnung selbst steht in `$lib/data/modulation.ts`; hier wird sie
   * nur bedient und formatiert.
   */
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { formatFrequency, formatNumber } from '$lib/utils/formatting';
  import { FREQUENCY_UNITS } from '$lib/data/units';
  import { carsonBandwidthHz, fmModulationIndex } from '$lib/utils/modulationMath';

  /** Nur die für Hub und Tonfrequenz sinnvollen Einheiten. */
  const UNITS = FREQUENCY_UNITS.filter((unit) => unit.id === 'Hz' || unit.id === 'kHz');

  const DEVIATION_MIN_HZ = 100;
  const DEVIATION_MAX_HZ = 200_000;
  const AUDIO_MIN_HZ = 100;
  const AUDIO_MAX_HZ = 50_000;
  /** Grenze, ab der von Breitband-FM gesprochen wird. */
  const WIDEBAND_INDEX = 1;

  interface Preset {
    id: string;
    label: string;
    deviationHz: number;
    audioHz: number;
    note: string;
  }

  const PRESETS: Preset[] = [
    {
      id: 'ukw',
      label: 'UKW-Rundfunk',
      deviationHz: 75_000,
      audioHz: 15_000,
      note: 'Δf = 75 kHz, f_max = 15 kHz — daraus folgt das bekannte 180-kHz-Kanalraster.'
    },
    {
      id: 'nbfm',
      label: 'Schmalband-FM (Sprechfunk)',
      deviationHz: 2_500,
      audioHz: 3_000,
      note: 'Δf = 2,5 kHz, f_max = 3 kHz — passt in einen 12,5-kHz-Kanal.'
    }
  ];

  let deviationHz = $state(75_000);
  let audioHz = $state(15_000);
  let deviationUnit = $state('kHz');
  let audioUnit = $state('kHz');
  let activePreset = $state<string | null>('ukw');

  const bandwidthHz = $derived(carsonBandwidthHz(deviationHz, audioHz));
  const index = $derived(fmModulationIndex(deviationHz, audioHz));
  const wideband = $derived(index > WIDEBAND_INDEX);

  function applyPreset(preset: Preset) {
    deviationHz = preset.deviationHz;
    audioHz = preset.audioHz;
    activePreset = preset.id;
  }

  const activeNote = $derived(PRESETS.find((preset) => preset.id === activePreset)?.note);
</script>

<div class="carson">
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
      label="Frequenzhub Δf"
      bind:value={deviationHz}
      bind:unit={deviationUnit}
      units={UNITS}
      min={DEVIATION_MIN_HZ}
      max={DEVIATION_MAX_HZ}
      onchange={() => (activePreset = null)}
    />
    <NumberInput
      label="Höchste Modulationsfrequenz f_max"
      bind:value={audioHz}
      bind:unit={audioUnit}
      units={UNITS}
      min={AUDIO_MIN_HZ}
      max={AUDIO_MAX_HZ}
      onchange={() => (activePreset = null)}
    />
  </div>

  <div class="results">
    <ResultCard
      label="Belegte Bandbreite B"
      value={formatFrequency(bandwidthHz)}
      emphasis="hero"
      hint="B = 2 · (Δf + f_max)"
    />
    <ResultCard
      label="Modulationsindex β"
      value={formatNumber(index, 2)}
      hint={wideband ? 'Breitband-FM (β > 1)' : 'Schmalband-FM (β ≤ 1)'}
      tone={wideband ? 'neutral' : 'success'}
    />
  </div>

  {#if activeNote}
    <p class="note">{activeNote}</p>
  {/if}
</div>

<style>
  .carson {
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
  }

  .results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: 0.75rem;
  }

  .note {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
