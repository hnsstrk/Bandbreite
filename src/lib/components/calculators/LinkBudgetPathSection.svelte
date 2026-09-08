<script lang="ts">
  /** Streckenabschnitt: Länge, Frequenz, Pfadtyp, atmosphärische Dämpfung. */
  import { formatPowerDb } from '$lib/utils/formatting';
  import Button from '$lib/components/ui/Button.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import {
    DISTANCE_UNIT_OPTIONS,
    ELEVATION_MAX_DEG,
    ELEVATION_MIN_DEG,
    FREQUENCY_UNIT_OPTIONS,
    LINK_FREQUENCY_MAX_HZ,
    LINK_FREQUENCY_MIN_HZ,
    MISC_LOSS_MAX_DB,
    MISC_LOSS_MIN_DB,
    PATH_LENGTH_MAX_M,
    PATH_LENGTH_MIN_M,
    PATH_TYPE_OPTIONS,
    type PathType
  } from './linkBudget.svelte';

  interface Props {
    pathLengthM: number;
    pathLengthUnit: string;
    pathFrequencyHz: number;
    pathFrequencyUnit: string;
    miscLossDb: number;
    includeAtmosphericLoss: boolean;
    pathType: PathType;
    elevationAngleDeg: number;
    fsplDb: number;
    atmosphericLossDb: number;
    totalPathLossDb: number;
  }

  let {
    pathLengthM = $bindable(),
    pathLengthUnit = $bindable(),
    pathFrequencyHz = $bindable(),
    pathFrequencyUnit = $bindable(),
    miscLossDb = $bindable(),
    includeAtmosphericLoss = $bindable(),
    pathType = $bindable(),
    elevationAngleDeg = $bindable(),
    fsplDb,
    atmosphericLossDb,
    totalPathLossDb
  }: Props = $props();

  function handleAtmosphericClick() {
    includeAtmosphericLoss = !includeAtmosphericLoss;
  }

  function handlePathTypeChange(value: string) {
    pathType = value as PathType;
  }
</script>

<div class="lb-section">
  <SectionHeader title="Strecke" level={3} anchor={false} eyebrow="Pfad" />

  <NumberInput
    label="Distanz"
    bind:value={pathLengthM}
    bind:unit={pathLengthUnit}
    units={DISTANCE_UNIT_OPTIONS}
    min={PATH_LENGTH_MIN_M}
    max={PATH_LENGTH_MAX_M}
    slider
    sliderScale="log"
  />

  <NumberInput
    label="Frequenz"
    bind:value={pathFrequencyHz}
    bind:unit={pathFrequencyUnit}
    units={FREQUENCY_UNIT_OPTIONS}
    min={LINK_FREQUENCY_MIN_HZ}
    max={LINK_FREQUENCY_MAX_HZ}
    slider
    sliderScale="log"
  />

  <NumberInput
    label="Sonstige Verluste"
    bind:value={miscLossDb}
    units={[{ id: 'db', symbol: 'dB', factor: 1 }]}
    min={MISC_LOSS_MIN_DB}
    max={MISC_LOSS_MAX_DB}
    step={0.5}
    slider
    hint="Polarisationsfehler, Zeigefehler, Bewuchs"
  />

  <div class="lb-section__toggle">
    <Button
      size="sm"
      variant={includeAtmosphericLoss ? 'primary' : 'ghost'}
      pressed={includeAtmosphericLoss}
      icon="wave"
      onclick={handleAtmosphericClick}
    >
      Atmosphärische Dämpfung
    </Button>
  </div>

  {#if includeAtmosphericLoss}
    <Select
      label="Pfadtyp"
      value={pathType}
      options={PATH_TYPE_OPTIONS}
      onchange={handlePathTypeChange}
      hint="Erde–Raum dämpft nur im troposphärischen Anteil, nicht über die volle Distanz"
    />

    {#if pathType === 'earth-space'}
      <NumberInput
        label="Elevationswinkel"
        bind:value={elevationAngleDeg}
        units={[{ id: 'deg', symbol: '°', factor: 1 }]}
        min={ELEVATION_MIN_DEG}
        max={ELEVATION_MAX_DEG}
        step={1}
        slider
        hint="Flache Winkel verlängern den Weg durch die Troposphäre"
      />
    {/if}
  {/if}

  <ResultCard label="Freiraumdämpfung" value={formatPowerDb(fsplDb)} hint="FSPL" />

  {#if includeAtmosphericLoss}
    <ResultCard
      label="Atmosphärische Dämpfung"
      value={formatPowerDb(atmosphericLossDb)}
      hint="Gase und Niederschlag nach ITU-R"
    />
  {/if}

  <ResultCard
    label="Gesamte Streckendämpfung"
    value={formatPowerDb(totalPathLossDb)}
    tone="warning"
  />
</div>

<style>
  .lb-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lb-section__toggle {
    display: flex;
  }
</style>
