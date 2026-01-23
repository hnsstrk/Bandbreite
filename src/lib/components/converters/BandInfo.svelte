<script lang="ts">
  import {
    getIEEEBandsForFrequency,
    getNATOBandsForFrequency,
    getCivilianBandsForFrequency,
    formatFrequencyRange,
    type FrequencyBand
  } from '$lib/data/bands';

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

<div class="bg-slate-800 rounded-lg p-4 shadow-xl">
  {#if !frequencyHz || frequencyHz <= 0}
    <p class="text-slate-500 text-sm">Frequenz eingeben fuer Bandzuordnung</p>
  {:else if !hasBands}
    <p class="text-slate-500 text-sm">Keine Standardbaender fuer diese Frequenz definiert</p>
  {:else}
    <div class="flex flex-col sm:flex-row sm:flex-wrap items-start gap-3 sm:gap-x-6 sm:gap-y-2">
      <!-- IEEE Baender -->
      {#if ieeeBands.length > 0}
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide w-12 sm:w-auto">IEEE</span>
          <div class="flex flex-wrap gap-1">
            {#each ieeeBands as band (band.id)}
              <span
                class="px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm cursor-help transition-opacity hover:opacity-80"
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
        <div class="hidden sm:block w-px h-6 bg-slate-600 self-center"></div>
      {/if}

      <!-- NATO Baender -->
      {#if natoBands.length > 0}
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide w-12 sm:w-auto">NATO</span>
          <div class="flex flex-wrap gap-1">
            {#each natoBands as band (band.id)}
              <span
                class="px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm cursor-help transition-opacity hover:opacity-80"
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
        <div class="hidden sm:block w-px h-6 bg-slate-600 self-center"></div>
      {/if}

      <!-- Zivile Anwendungen -->
      {#if civilianBands.length > 0}
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide w-12 sm:w-auto">Zivil</span>
          <div class="flex flex-wrap gap-1">
            {#each civilianBands as band (band.id)}
              <span
                class="px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm cursor-help transition-opacity hover:opacity-80"
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
