<script lang="ts">
  import type { DataPoint } from './powerDbData';
  import { formatFrequencyLocal, formatPower, formatDbm } from './powerDbData';
  import { POWER_CHART_CATEGORY_COLORS, POWER_CHART_CATEGORY_LABELS } from '$lib/data/presets';

  interface Props {
    visible: boolean;
    x: number;
    y: number;
    data: DataPoint | null;
  }

  let { visible, x, y, data }: Props = $props();

  const categoryColors = POWER_CHART_CATEGORY_COLORS;
  const categoryLabels = POWER_CHART_CATEGORY_LABELS;
</script>

{#if visible && data}
  <div
    class="absolute z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 min-w-[220px] pointer-events-none"
    style="left: {x}px; top: {y}px;"
  >
    <!-- Header with name and category color indicator -->
    <div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
      <span
        class="w-3 h-3 rounded-full flex-shrink-0"
        style="background-color: {categoryColors[data.category]};"
      ></span>
      <span class="text-white font-semibold text-sm">{data.nameDE}</span>
    </div>

    <!-- Data rows -->
    <div class="space-y-1.5 text-xs">
      <div class="flex justify-between">
        <span class="text-slate-400">Frequenz:</span>
        <span class="text-slate-200 font-medium">{formatFrequencyLocal(data.frequencyHz)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Leistung:</span>
        <span class="text-slate-200 font-medium">{formatPower(data.powerWatt)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Leistung (dBm):</span>
        <span class="text-slate-200 font-medium">{formatDbm(data.powerWatt)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Kategorie:</span>
        <span class="text-slate-200 font-medium">{categoryLabels[data.category]}</span>
      </div>
    </div>
  </div>
{/if}
