<script lang="ts">
  /** Bedienelemente des Wellenausbreitungs-Diagramms. */
  import { formatFrequency } from '$lib/utils/formatting';
  import Button from '$lib/components/ui/Button.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import {
    FREQUENCY_MAX_MHZ,
    FREQUENCY_MIN_MHZ,
    MODE_OPTIONS,
    TIME_OPTIONS,
    recommendedMode
  } from './wavePropagationData';

  interface Props {
    selectedModeId: string;
    isNighttime: boolean;
    frequencyMHz: number;
  }

  let {
    selectedModeId = $bindable(),
    isNighttime = $bindable(),
    frequencyMHz = $bindable()
  }: Props = $props();

  let recommendedId = $derived(recommendedMode(frequencyMHz));
  let recommendedLabel = $derived(
    MODE_OPTIONS.find((option) => option.id === recommendedId)?.label ?? ''
  );

  function handleModeClick(id: string) {
    selectedModeId = id;
  }

  function handleTimeChange(value: string) {
    isNighttime = value === 'night';
  }
</script>

<div class="wave-controls">
  <div class="wave-controls__group">
    <span class="wave-controls__label" id="wave-mode-label">Ausbreitungsmodus</span>
    <div class="wave-controls__modes" role="group" aria-labelledby="wave-mode-label">
      {#each MODE_OPTIONS as option (option.id)}
        <Button
          size="sm"
          variant={selectedModeId === option.id ? 'primary' : 'ghost'}
          pressed={selectedModeId === option.id}
          title={option.hint}
          onclick={() => handleModeClick(option.id)}
        >
          {option.label}
        </Button>
      {/each}
    </div>
  </div>

  <Select
    label="Tageszeit"
    value={isNighttime ? 'night' : 'day'}
    options={TIME_OPTIONS}
    onchange={handleTimeChange}
    hint={isNighttime
      ? 'D-Schicht verschwindet, F1 und F2 verschmelzen'
      : 'Alle Ionosphärenschichten aktiv'}
  />

  <NumberInput
    label="Frequenz"
    bind:value={frequencyMHz}
    units={[{ id: 'mhz', symbol: 'MHz', factor: 1 }]}
    min={FREQUENCY_MIN_MHZ}
    max={FREQUENCY_MAX_MHZ}
    slider
    sliderScale="log"
    hint="30 kHz bis 3 GHz"
  />
</div>

{#if recommendedId !== selectedModeId}
  <Callout tone="tip" title="Passender Modus">
    Bei {formatFrequency(frequencyMHz * 1e6, 1)} dominiert in der Praxis
    <strong>{recommendedLabel}</strong>.
  </Callout>
{/if}

<style>
  .wave-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 1.25rem;
    align-items: start;
  }

  .wave-controls__group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .wave-controls__label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink-muted);
  }

  .wave-controls__modes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
</style>
