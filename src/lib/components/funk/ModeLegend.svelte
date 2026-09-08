<script lang="ts">
  /**
   * Farblegende der Betriebsartensegmente im Bandplan.
   * Die Farbklassen sind dieselben wie in `AmateurBandplan.svelte`.
   */
  import { MODE_LABELS } from './amateurBandplan.svelte';
  import type { BandSegmentMode } from '$lib/data/amateurBands';

  const modes = Object.keys(MODE_LABELS) as BandSegmentMode[];
</script>

<ul class="legend">
  {#each modes as mode (mode)}
    <li>
      <span class="chip chip--{mode}" aria-hidden="true"></span>
      {MODE_LABELS[mode]}
    </li>
  {/each}
</ul>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    list-style: none;
    margin: 0 0 1rem;
    padding: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-muted);
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .chip {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2px;
    background-color: var(--color-series-8);
  }

  .chip--cw {
    background-color: var(--color-series-1);
  }
  .chip--digital-schmal {
    background-color: var(--color-series-2);
  }
  .chip--digital-breit {
    background-color: var(--color-series-5);
  }
  .chip--bake {
    background-color: var(--color-series-7);
  }
  .chip--ssb {
    background-color: var(--color-series-3);
  }
  .chip--allmode {
    background-color: var(--color-series-4);
  }
  .chip--fm {
    background-color: var(--color-series-6);
  }
  .chip--satellit {
    background-color: var(--color-series-9);
  }
  .chip--atv {
    background-color: var(--color-series-8);
  }
</style>
