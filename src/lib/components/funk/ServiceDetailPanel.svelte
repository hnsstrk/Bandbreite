<script lang="ts">
  /**
   * Detailtafel zu einem ausgewählten Funkdienst: Beschreibung, alle
   * Zuweisungen mit Status, Beispielsysteme und Quellenangabe.
   */
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatFrequencyRange } from '$lib/data/bands';
  import type { RadioService } from '$lib/data/radioServices';
  import { ALLOCATION_STATUS_LABELS } from './serviceSpectrum.svelte';

  interface Props {
    service: RadioService;
    groupLabel: string;
  }

  let { service, groupLabel }: Props = $props();
</script>

<div class="detail">
  <div class="detail__head">
    <h4>{service.nameDE}</h4>
    <Badge tone="brand">{groupLabel}</Badge>
  </div>
  <p class="detail__en">{service.nameEN}</p>
  <p>{service.descriptionDE}</p>

  <div class="table-scroll">
    <table>
      <caption>Zuweisungen in ITU-Region 1</caption>
      <thead>
        <tr>
          <th scope="col">Teilbereich</th>
          <th scope="col">Frequenzbereich</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each service.allocations as allocation (allocation.label + allocation.minHz)}
          <tr>
            <th scope="row">{allocation.label}</th>
            <td>{formatFrequencyRange(allocation.minHz, allocation.maxHz)}</td>
            <td>{ALLOCATION_STATUS_LABELS[allocation.status]}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p><strong>Beispiele:</strong> {service.examplesDE.join(', ')}</p>
  <p class="detail__source">Quelle: {service.source}</p>
</div>

<style>
  .detail {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-line-subtle);
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .detail__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  h4 {
    margin: 0;
    font-size: var(--font-size-base);
    color: var(--color-ink);
  }

  p {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .detail__en,
  .detail__source {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  caption {
    text-align: left;
    padding-bottom: 0.375rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  th,
  td {
    padding: 0.375rem 0.75rem 0.375rem 0;
    text-align: left;
    border-bottom: 1px solid var(--color-line-subtle);
    color: var(--color-ink-muted);
  }

  thead th {
    color: var(--color-ink);
  }
</style>
