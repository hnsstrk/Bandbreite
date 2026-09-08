<script lang="ts">
  import { formatFrequencyRange, type FrequencyBand } from '$lib/data/bands';
  import { formatWavelengthLocal } from './spectrumFormat';
  import { safeDivide } from '$lib/utils/handlers';

  interface Props {
    visible: boolean;
    x: number;
    y: number;
    band: FrequencyBand | null;
    containerWidth: number;
    speedOfLight: number;
  }

  let { visible, x, y, band, containerWidth, speedOfLight }: Props = $props();

  function safeWavelength(frequencyHz: number): string {
    if (frequencyHz <= 0) return '---';
    return formatWavelengthLocal(safeDivide(speedOfLight, frequencyHz, 0));
  }
</script>

{#if visible && band}
  <div
    class="pointer-events-none absolute z-50 min-w-[220px] rounded-lg px-4 py-3 shadow-xl"
    style="background-color: var(--color-chart-tooltip-bg); border: 1px solid var(--color-chart-tooltip-border); left: {Math.min(
      x + 10,
      containerWidth - 240
    )}px; top: {Math.max(10, y - 120)}px;"
  >
    <div class="mb-2 flex items-center gap-2">
      {#if band.color === 'visible'}
        <div
          class="h-4 w-4 rounded"
          style="background: linear-gradient(to right, #dc2626, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6);"
        ></div>
      {:else}
        <div class="h-4 w-4 rounded" style="background-color: {band.color};"></div>
      {/if}
      <div class="font-medium" style="color: var(--color-chart-text)">
        {band.name}
      </div>
    </div>
    {#if band.nameDE && band.nameDE !== band.name}
      <div class="mb-2 text-sm" style="color: var(--color-chart-text-secondary)">
        {band.nameDE}
      </div>
    {/if}
    <div class="space-y-1 text-sm">
      <div class="flex justify-between">
        <span style="color: var(--color-chart-text-secondary)">Frequenz:</span>
        <span class="font-mono" style="color: var(--color-chart-text)"
          >{formatFrequencyRange(band.minHz, band.maxHz)}</span
        >
      </div>
      <div class="flex justify-between">
        <span style="color: var(--color-chart-text-secondary)">Wellenlänge:</span>
        <span class="font-mono" style="color: var(--color-chart-text)">
          {safeWavelength(band.maxHz)} – {safeWavelength(band.minHz)}
        </span>
      </div>
      <div class="flex justify-between">
        <span style="color: var(--color-chart-text-secondary)">Kategorie:</span>
        <span class="capitalize" style="color: var(--color-chart-text)">{band.category}</span>
      </div>
    </div>
  </div>
{/if}
