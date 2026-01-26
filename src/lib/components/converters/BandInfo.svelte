<script lang="ts">
  import {
    getIEEEBandsForFrequency,
    getNATOBandsForFrequency,
    getCivilianBandsForFrequency,
    formatFrequencyRange,
    type FrequencyBand
  } from '$lib/data/bands';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';
  import { bandExplanations } from '$lib/data/explanations';

  interface Props {
    frequencyHz?: number | null;
  }

  let { frequencyHz = null }: Props = $props();

  let ieeeBands = $derived(
    frequencyHz !== null && frequencyHz > 0
      ? getIEEEBandsForFrequency(frequencyHz)
      : []
  );

  let natoBands = $derived(
    frequencyHz !== null && frequencyHz > 0
      ? getNATOBandsForFrequency(frequencyHz)
      : []
  );

  let civilianBands = $derived(
    frequencyHz !== null && frequencyHz > 0
      ? getCivilianBandsForFrequency(frequencyHz)
      : []
  );

  let hasBands = $derived(
    ieeeBands.length > 0 || natoBands.length > 0 || civilianBands.length > 0
  );
</script>

<div class="card-compact">
  {#if !frequencyHz || frequencyHz <= 0}
    <p class="placeholder">Frequenz eingeben für Bandzuordnung</p>
  {:else if !hasBands}
    <p class="placeholder">Keine Standardbänder für diese Frequenz definiert</p>
  {:else}
    <div class="band-container">
      <!-- IEEE Bänder -->
      {#if ieeeBands.length > 0}
        <div class="band-group">
          <span class="band-label">
            IEEE
            <InfoTooltip
              title={bandExplanations.ieee.title}
              short={bandExplanations.ieee.short}
              detailed={bandExplanations.ieee.detailed}
            />
          </span>
          <div class="band-tags">
            {#each ieeeBands as band (band.id)}
              <span
                class="band-tag"
                style="background-color: {band.color};"
                title="{band.nameDE}: {formatFrequencyRange(band.minHz, band.maxHz)}"
              >
                {band.name}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Vertikaler Separator (nur Desktop) -->
      {#if ieeeBands.length > 0 && (natoBands.length > 0 || civilianBands.length > 0)}
        <div class="separator"></div>
      {/if}

      <!-- NATO Bänder -->
      {#if natoBands.length > 0}
        <div class="band-group">
          <span class="band-label">
            NATO
            <InfoTooltip
              title={bandExplanations.nato.title}
              short={bandExplanations.nato.short}
              detailed={bandExplanations.nato.detailed}
            />
          </span>
          <div class="band-tags">
            {#each natoBands as band (band.id)}
              <span
                class="band-tag"
                style="background-color: {band.color};"
                title="{band.nameDE}: {formatFrequencyRange(band.minHz, band.maxHz)}"
              >
                {band.name}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Vertikaler Separator (nur Desktop) -->
      {#if (ieeeBands.length > 0 || natoBands.length > 0) && civilianBands.length > 0}
        <div class="separator"></div>
      {/if}

      <!-- Zivile Anwendungen -->
      {#if civilianBands.length > 0}
        <div class="band-group">
          <span class="band-label">Zivil</span>
          <div class="band-tags">
            {#each civilianBands as band (band.id)}
              <span
                class="band-tag"
                style="background-color: {band.color};"
                title="{formatFrequencyRange(band.minHz, band.maxHz)}"
              >
                {band.nameDE}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .placeholder {
    font-size: var(--font-size-sm);
    color: var(--color-text-disabled);
    margin: 0;
  }

  .band-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .band-container {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 0.75rem 1.5rem;
    }
  }

  .band-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .band-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-disabled);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: 3rem;
  }

  @media (min-width: 640px) {
    .band-label {
      width: auto;
    }
  }

  .band-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .band-tag {
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: white;
    box-shadow: var(--shadow-sm);
    cursor: help;
    transition: opacity var(--transition-fast);
  }

  .band-tag:hover {
    opacity: 0.8;
  }

  .separator {
    display: none;
    width: 1px;
    height: 1.5rem;
    background-color: var(--color-border-default);
    align-self: center;
  }

  @media (min-width: 640px) {
    .separator {
      display: block;
    }
  }
</style>
