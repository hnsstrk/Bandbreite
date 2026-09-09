<script lang="ts">
  /**
   * Spektrumsleiste der ITU-Funkdienste.
   *
   * Jede Zeile ist ein Funkdienst, jedes Segment eine Frequenzzuweisung auf
   * einer logarithmischen Achse von 9 kHz bis 100 GHz. Die Zeilen sind
   * Schaltflächen; die Auswahl öffnet die Detailtafel darunter. Ein
   * Frequenzzeiger markiert eine eingegebene Frequenz und hebt alle dort
   * zuständigen Dienste hervor.
   */
  import Panel from './Panel.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import { FREQUENCY_UNITS } from '$lib/data/units';
  import { formatFrequencyRange } from '$lib/data/bands';
  import { formatFrequency } from '$lib/utils/formatting';
  import type { RadioServiceGroup } from '$lib/data/radioServices';
  import ServiceDetailPanel from './ServiceDetailPanel.svelte';
  import {
    ALLOCATION_STATUS_LABELS,
    SERVICE_SCALE_MAX_HZ,
    SERVICE_SCALE_MIN_HZ,
    buildServiceRows,
    filterServices,
    serviceCoversFrequency,
    serviceGroups
  } from './serviceSpectrum.svelte';
  import { decadeTicks, logPositionPercent } from './spectrumScale.svelte';

  let groupValue = $state('alle');
  let markerHz = $state(145e6);
  let markerUnit = $state('MHz');
  let selectedId = $state<string | null>(null);

  const groupOptions = [
    { value: 'alle', label: 'Alle Kategorien' },
    ...serviceGroups().map((entry) => ({
      value: entry.id,
      label: `${entry.label} (${entry.count})`
    }))
  ];

  const ticks = decadeTicks(SERVICE_SCALE_MIN_HZ, SERVICE_SCALE_MAX_HZ);
  const rows = $derived(buildServiceRows(filterServices(groupValue as RadioServiceGroup | 'alle')));
  const markerPercent = $derived(logPositionPercent(markerHz, SERVICE_SCALE_MIN_HZ, SERVICE_SCALE_MAX_HZ));
  const selected = $derived(rows.find((row) => row.service.id === selectedId) ?? null);
  const hits = $derived(rows.filter((row) => serviceCoversFrequency(row.service, markerHz)));

  function toggle(id: string) {
    selectedId = selectedId === id ? null : id;
  }
</script>

<Panel title="Funkdienste im Spektrum" subtitle="Logarithmische Achse von 9 kHz bis 100 GHz">
  {#snippet actions()}
    <Badge tone="info">{rows.length} Dienste</Badge>
  {/snippet}

  <div class="controls">
    <Select label="Dienstkategorie" bind:value={groupValue} options={groupOptions} />
    <NumberInput
      label="Frequenzzeiger"
      bind:value={markerHz}
      bind:unit={markerUnit}
      units={FREQUENCY_UNITS}
      min={SERVICE_SCALE_MIN_HZ}
      max={SERVICE_SCALE_MAX_HZ}
      hint="Hebt alle Dienste hervor, die diese Frequenz belegen."
    />
  </div>

  <p class="hits" role="status">
    Bei {formatFrequency(markerHz)}
    {hits.length === 1 ? 'ist' : 'sind'}
    <strong>{hits.length}</strong>
    {hits.length === 1 ? 'Dienst' : 'Dienste'} zugewiesen{hits.length > 0 ? ':' : '.'}
    {#if hits.length > 0}{hits.map((row) => row.service.nameDE).join(', ')}{/if}
  </p>

  <div class="plot">
    <ul class="axis" aria-hidden="true">
      {#each ticks as tick (tick.hz)}
        <li style="left: {tick.positionPercent}%">{tick.label}</li>
      {/each}
    </ul>

    <ul class="rows">
      {#each rows as row (row.service.id)}
        {@const covered = serviceCoversFrequency(row.service, markerHz)}
        <li>
          <button
            type="button"
            class="row"
            class:row--selected={selectedId === row.service.id}
            class:row--covered={covered}
            aria-pressed={selectedId === row.service.id}
            onclick={() => toggle(row.service.id)}
          >
            <span class="row__label">{row.service.nameDE}</span>
            <span class="row__track">
              {#each row.segments as segment (segment.allocation.label)}
                <span
                  class="seg seg--{segment.allocation.status} seg--{row.service.group}"
                  style="left: {segment.leftPercent}%; width: {segment.widthPercent}%"
                ></span>
              {/each}
              <span class="row__marker" style="left: {markerPercent}%"></span>
            </span>
            <span class="sr-only">
              {row.groupLabel}, Bereiche:
              {row.service.allocations
                .map(
                  (a) => `${a.label} ${formatFrequencyRange(a.minHz, a.maxHz)} ${ALLOCATION_STATUS_LABELS[a.status]}`
                )
                .join('; ')}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>

  {#if selected}
    <ServiceDetailPanel service={selected.service} groupLabel={selected.groupLabel} />
  {:else}
    <p class="hint">Eine Zeile auswählen, um Zuweisungen und Beispiele zu sehen.</p>
  {/if}
</Panel>

<style>
  .controls {
    display: grid;
    gap: 0.5rem 0.75rem;
    margin-bottom: 0.25rem;
  }

  .hits {
    margin: 0 0 1rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .plot {
    overflow-x: auto;
  }

  .axis {
    position: relative;
    list-style: none;
    margin: 0 0 0.25rem 11rem;
    padding: 0;
    height: 1.25rem;
    min-width: 18rem;
  }

  .axis li {
    position: absolute;
    transform: translateX(-50%);
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    white-space: nowrap;
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 29rem;
  }

  .row {
    display: grid;
    grid-template-columns: 11rem 1fr;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.25rem 0.25rem 0.25rem 0;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-control);
    cursor: pointer;
    text-align: left;
  }

  .row:hover {
    background-color: var(--color-hover);
  }

  .row--selected {
    border-color: var(--color-brand);
    background-color: var(--color-brand-soft);
  }

  .row__label {
    font-size: var(--font-size-xs);
    color: var(--color-ink-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row--covered .row__label {
    color: var(--color-ink);
    font-weight: var(--font-weight-semibold);
  }

  .row__track {
    position: relative;
    display: block;
    height: 1.125rem;
    background-color: var(--color-sunken);
    border-radius: 0.25rem;
  }

  .seg {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 2px;
    background-color: var(--color-series-1);
  }

  .seg--sekundaer {
    opacity: 0.45;
  }
  .seg--gemischt {
    opacity: 0.7;
  }
  .seg--rundfunk {
    background-color: var(--color-series-1);
  }
  .seg--mobil {
    background-color: var(--color-series-2);
  }
  .seg--fest {
    background-color: var(--color-series-3);
  }
  .seg--navigation {
    background-color: var(--color-series-4);
  }
  .seg--ortung {
    background-color: var(--color-series-5);
  }
  .seg--satellit {
    background-color: var(--color-series-6);
  }
  .seg--wissenschaft {
    background-color: var(--color-series-7);
  }
  .seg--sicherheit {
    background-color: var(--color-series-9);
  }
  .seg--amateur {
    background-color: var(--color-series-8);
  }

  .row__marker {
    position: absolute;
    top: -0.125rem;
    bottom: -0.125rem;
    width: 2px;
    background-color: var(--color-marker);
  }

  .hint {
    margin: 1rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  @media (min-width: 48rem) {
    .controls {
      grid-template-columns: 1fr 1fr;
      align-items: end;
    }
  }
</style>
