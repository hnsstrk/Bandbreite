<script lang="ts">
  /** Ergebnisse und Modulationsvergleich des Kanalkapazitäts-Rechners. */
  import { formatDataRate, formatNumber } from '$lib/utils/formatting';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import {
    MODULATION_ENTRIES,
    practicalDataRate,
    type ModulationEntry
  } from './channelCapacity.svelte';

  interface Props {
    bandwidthHz: number;
    snrDb: number;
    snrLinear: number;
    capacityBps: number;
    spectralEfficiency: number;
    modulation: ModulationEntry | null;
  }

  let { bandwidthHz, snrDb, snrLinear, capacityBps, spectralEfficiency, modulation }: Props =
    $props();

  let practicalBps = $derived(modulation ? practicalDataRate(bandwidthHz, modulation) : 0);

  let rows = $derived(
    MODULATION_ENTRIES.map((entry) => ({
      ...entry,
      dataRate: practicalDataRate(bandwidthHz, entry),
      achievable: snrDb >= entry.requiredSnrDb
    }))
  );
</script>

<div class="capacity-results">
  <ResultCard
    label="Shannon-Kapazität"
    value={formatDataRate(capacityBps)}
    secondary="theoretische Obergrenze"
    emphasis="hero"
  />
  <ResultCard
    label="Spektrale Effizienz"
    value={formatNumber(spectralEfficiency, 2)}
    unit="bit/s/Hz"
    hint={`Störabstand linear: ${formatNumber(snrLinear, 1)}×`}
  />
  <ResultCard
    label="Empfohlene Modulation"
    value={modulation?.name ?? 'kein tragfähiges Signal'}
    hint={modulation
      ? `${modulation.bitsPerSymbol} bit/Symbol, mindestens ${modulation.requiredSnrDb} dB`
      : 'Der Störabstand reicht nicht einmal für BPSK.'}
    tone={modulation ? 'success' : 'warning'}
  />
  <ResultCard
    label="Praktische Datenrate"
    value={practicalBps > 0 ? `~${formatDataRate(practicalBps)}` : '—'}
    hint="Roll-off 0,25 und 80 % Protokolleffizienz, ohne Codierungsgewinn"
  />
</div>

<div class="capacity-table">
  <h3 class="capacity-table__title" id="modulation-comparison">Modulationsvergleich</h3>
  <div class="table-scroll">
    <table aria-labelledby="modulation-comparison">
      <thead>
        <tr>
          <th scope="col">Modulation</th>
          <th scope="col" class="is-numeric">bit/Symbol</th>
          <th scope="col" class="is-numeric">Mindest-Störabstand</th>
          <th scope="col" class="is-numeric">Datenrate</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.name)}
          <tr class:is-muted={!row.achievable}>
            <th scope="row" style="color: {row.token}">{row.name}</th>
            <td class="is-numeric">{row.bitsPerSymbol}</td>
            <td class="is-numeric">{row.requiredSnrDb} dB</td>
            <td class="is-numeric">{formatDataRate(row.dataRate)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .capacity-results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 0.75rem;
  }

  .capacity-table {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .capacity-table__title {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  th,
  td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  thead th {
    color: var(--color-ink-muted);
    font-weight: var(--font-weight-medium);
  }

  tbody th {
    font-weight: var(--font-weight-semibold);
  }

  td {
    color: var(--color-ink);
  }

  .is-numeric {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .is-muted {
    opacity: 0.45;
  }
</style>
