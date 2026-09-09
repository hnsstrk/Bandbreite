<script lang="ts">
  /** Legende zum gewählten Ausbreitungsmodus — als HTML neben dem Diagramm. */
  import { formatFrequency, formatNumber } from '$lib/utils/formatting';
  import { modeById, shortCharacteristic } from './wavePropagationData';

  interface Props {
    selectedModeId: string;
  }

  let { selectedModeId }: Props = $props();

  let mode = $derived(modeById(selectedModeId));
</script>

<div class="wl">
  <div class="wl__head">
    <span class="wl__line" style="background: {mode.color}" aria-hidden="true"></span>
    <strong>{mode.nameDE}</strong>
    <span class="wl__sub">{mode.name}</span>
  </div>

  <dl class="wl__facts">
    <div>
      <dt>Frequenzbereich</dt>
      <dd>
        {formatFrequency(mode.frequencyRangeHz.min)} – {formatFrequency(mode.frequencyRangeHz.max)}
      </dd>
    </div>
    <div>
      <dt>Typische Reichweite</dt>
      <dd>
        {formatNumber(mode.typicalRangeKm.min, 0)} – {formatNumber(mode.typicalRangeKm.max, 0)} km
      </dd>
    </div>
  </dl>

  <ul class="wl__chars">
    {#each mode.characteristicsDE.slice(0, 3) as characteristic, index (index)}
      <li>{shortCharacteristic(characteristic)}</li>
    {/each}
  </ul>
</div>

<style>
  .wl {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .wl__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-ink);
  }

  .wl__line {
    width: 1.5rem;
    height: 0.1875rem;
    border-radius: var(--radius-pill);
    display: inline-block;
  }

  .wl__sub {
    color: var(--color-ink-subtle);
  }

  .wl__facts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.5rem;
    margin: 0;
  }

  .wl__facts dt {
    font-size: var(--text-2xs);
    color: var(--color-ink-subtle);
  }

  .wl__facts dd {
    margin: 0;
    font-family: var(--font-mono);
    color: var(--color-ink-muted);
  }

  .wl__chars {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin: 0;
    padding-inline-start: 1rem;
    color: var(--color-ink-subtle);
  }
</style>
