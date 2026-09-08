<script lang="ts">
  import type { DataPoint } from './powerDbData';
  import { wattToDbm } from '$lib/utils/conversions';
  import { formatFrequency, formatPowerDbm, formatPowerWatts } from '$lib/utils/formatting';
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

  /** Frequenzen im Diagramm reichen von 100 kHz bis 100 GHz — ganze Zahlen genügen. */
  const frequencyText = $derived(data ? formatFrequency(data.frequencyHz, 0) : '—');
  const powerText = $derived(data ? formatPowerWatts(data.powerWatt, 1) : '—');
  const dbmText = $derived(data ? formatPowerDbm(wattToDbm(data.powerWatt), 0) : '—');
</script>

{#if visible && data}
  <div class="pdb-tooltip" style="left: {x}px; top: {y}px;">
    <div class="pdb-tooltip__head">
      <span class="pdb-tooltip__dot" style="background-color: {categoryColors[data.category]};" aria-hidden="true"
      ></span>
      <span class="pdb-tooltip__name">{data.nameDE}</span>
    </div>

    <dl class="pdb-tooltip__rows">
      <div class="pdb-tooltip__row">
        <dt>Frequenz</dt>
        <dd>{frequencyText}</dd>
      </div>
      <div class="pdb-tooltip__row">
        <dt>Leistung</dt>
        <dd>{powerText}</dd>
      </div>
      <div class="pdb-tooltip__row">
        <dt>Leistung (dBm)</dt>
        <dd>{dbmText}</dd>
      </div>
      <div class="pdb-tooltip__row">
        <dt>Kategorie</dt>
        <dd>{categoryLabels[data.category]}</dd>
      </div>
    </dl>
  </div>
{/if}

<style>
  .pdb-tooltip {
    position: absolute;
    z-index: 50;
    min-width: 14rem;
    padding: 0.75rem;
    background: var(--color-overlay);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-popover);
    pointer-events: none;
  }

  .pdb-tooltip__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .pdb-tooltip__dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-pill);
    flex: none;
  }

  .pdb-tooltip__name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .pdb-tooltip__rows {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin: 0;
    font-size: var(--font-size-xs);
  }

  .pdb-tooltip__row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .pdb-tooltip__row dt {
    color: var(--color-ink-subtle);
  }

  .pdb-tooltip__row dd {
    margin: 0;
    color: var(--color-ink);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-mono);
  }
</style>
