<script lang="ts">
  /** Tabelle der Bänder eines Bandsystems. */
  import { getPropagationModeDescriptionDE, type FrequencyBandDetail } from '$lib/data/frequencyBands';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { PROPAGATION_CONFIG, bandRange } from './bandCategories.svelte';

  interface Props {
    bands: FrequencyBandDetail[];
    selectedId: string | null;
    onselect: (id: string | null) => void;
  }

  let { bands, selectedId, onselect }: Props = $props();

  /** So viele Anwendungen passen in die Übersichtszeile. */
  const APPLICATION_PREVIEW = 2;

  function handleRowClick(band: FrequencyBandDetail) {
    onselect(selectedId === band.id ? null : band.id);
  }
</script>

<div class="table-scroll">
  <table class="bands">
    <caption class="sr-only">Bänder des gewählten Systems</caption>
    <thead>
      <tr>
        <th scope="col">Band</th>
        <th scope="col">Frequenzbereich</th>
        <th scope="col">Wellenlänge</th>
        <th scope="col">Ausbreitung</th>
        <th scope="col">Anwendungen</th>
      </tr>
    </thead>
    <tbody>
      {#each bands as band (band.id)}
        {@const config = PROPAGATION_CONFIG[band.propagationMode]}
        <tr class:is-selected={selectedId === band.id}>
          <th scope="row">
            <button
              type="button"
              class="bands__button"
              aria-pressed={selectedId === band.id}
              onclick={() => handleRowClick(band)}
            >
              <span class="bands__dot" style="background-color: {band.color}" aria-hidden="true"></span>
              {band.nameDE}
            </button>
          </th>
          <td class="bands__mono">{bandRange(band)}</td>
          <td class="bands__mono">{band.wavelength}</td>
          <td>
            <span class="bands__mode" style="--mode-color: {config.token}">
              <Icon name={config.icon} size={14} />
              {config.short}
              <span class="sr-only">
                {getPropagationModeDescriptionDE(band.propagationMode)}
              </span>
            </span>
          </td>
          <td>
            {band.applicationsDE.slice(0, APPLICATION_PREVIEW).join(', ')}
            {#if band.applicationsDE.length > APPLICATION_PREVIEW}
              <span class="bands__more">
                und {band.applicationsDE.length - APPLICATION_PREVIEW} weitere
              </span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .bands {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .bands th,
  .bands td {
    padding: 0.25rem 0.5rem 0.25rem 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .bands thead th {
    color: var(--color-ink-muted);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }

  .bands tbody tr.is-selected {
    background: var(--color-info-soft);
  }

  .bands__button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .bands__button:hover {
    color: var(--color-brand);
  }

  .bands__dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: var(--radius-pill);
    flex: none;
  }

  .bands__mono {
    font-family: var(--font-mono);
    color: var(--color-ink-muted);
    white-space: nowrap;
  }

  .bands__mode {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--mode-color);
    white-space: nowrap;
  }

  .bands__more {
    color: var(--color-ink-subtle);
  }
</style>
