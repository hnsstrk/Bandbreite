<script lang="ts">
  /**
   * Verhältnis ↔ Dezibel: derselbe Pegelunterschied als Leistungs- und als
   * Spannungsfaktor. 10·log₁₀ für Leistungen, 20·log₁₀ für Spannungen.
   */
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { formatNumber, formatNumberAuto } from '$lib/utils/formatting';
  import { dbToPowerRatio, dbToVoltageRatio } from '$lib/utils/decibel';
  import PresetChips from './PresetChips.svelte';
  import { RATIO_MAX_DB, RATIO_MIN_DB, RATIO_PRESETS } from './decibelCalculator.svelte';
  import type { PresetChip } from './presetChips.svelte';

  interface Props {
    /** Verhältnis in dB */
    ratioDb: number;
  }

  let { ratioDb = $bindable() }: Props = $props();

  let chosenPresetId = $state<string | null>(null);

  let powerRatio = $derived(dbToPowerRatio(ratioDb));
  let voltageRatio = $derived(dbToVoltageRatio(ratioDb));

  function applyPreset(preset: PresetChip) {
    ratioDb = preset.value;
    chosenPresetId = preset.id;
  }
</script>

<div class="ratio">
  <PresetChips
    label="Merkregeln übernehmen"
    presets={RATIO_PRESETS}
    value={ratioDb}
    chosenId={chosenPresetId}
    onselect={applyPreset}
  />

  <Slider
    label="Verhältnis"
    bind:value={ratioDb}
    min={RATIO_MIN_DB}
    max={RATIO_MAX_DB}
    step={0.1}
    format={(value) => `${value > 0 ? '+' : ''}${formatNumber(value, 1)} dB`}
    unitSymbol="dB"
    ticks={[
      { at: RATIO_MIN_DB, label: '−60' },
      { at: 0, label: '0' },
      { at: RATIO_MAX_DB, label: '+60' }
    ]}
    onchange={() => (chosenPresetId = null)}
  />

  <div class="ratio__results">
    <ResultCard
      label="Leistungsfaktor"
      value={formatNumberAuto(powerRatio)}
      unit="×"
      hint="10^(dB/10)"
      emphasis="hero"
      copyable={false}
    />
    <ResultCard
      label="Spannungsfaktor"
      value={formatNumberAuto(voltageRatio)}
      unit="×"
      hint="10^(dB/20)"
      copyable={false}
    />
  </div>
</div>

<style>
  .ratio {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ratio__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 0.75rem;
  }
</style>
