<script lang="ts">
  /**
   * Satellitensysteme nach Einsatzgebiet filterbar, mit Bahnklasse, Höhe und
   * den daraus folgenden Kennwerten (Umlaufzeit, Signallaufzeit).
   * Die Daten stehen in `data/satelliteSystems.ts`, gerechnet wird in
   * `utils/orbitMath.ts`.
   */
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { formatDistance, formatNumber } from '$lib/utils/formatting';
  import { orbitalPeriod, roundTripDelay } from '$lib/utils/orbitMath';
  import {
    ORBIT_CLASSES,
    SATELLITE_CATEGORY_LABELS,
    SATELLITE_SYSTEMS,
    satelliteSystemsByCategory,
    type SatelliteCategory
  } from '$lib/data/satelliteSystems';

  /** Sekunden je Minute und je Stunde. */
  const MINUTE_S = 60;
  const HOUR_S = 3600;
  const MS_PER_S = 1000;

  let category = $state<SatelliteCategory | 'alle'>('alle');

  const options = [
    { value: 'alle', label: `Alle Einsatzgebiete (${SATELLITE_SYSTEMS.length})` },
    ...(Object.keys(SATELLITE_CATEGORY_LABELS) as SatelliteCategory[]).map((id) => ({
      value: id,
      label: `${SATELLITE_CATEGORY_LABELS[id]} (${satelliteSystemsByCategory(id).length})`
    }))
  ];

  const rows = $derived(satelliteSystemsByCategory(category));

  function handleCategoryChange(value: string) {
    category = value as SatelliteCategory | 'alle';
  }

  /** Umlaufzeit lesbar: Minuten unterhalb einer Stunde, sonst Stunden. */
  function periodLabel(altitudeM: number): string {
    const seconds = orbitalPeriod(altitudeM);
    if (!Number.isFinite(seconds)) return '—';
    if (seconds < HOUR_S) return `${formatNumber(seconds / MINUTE_S, 0)} min`;
    return `${formatNumber(seconds / HOUR_S, 1)} h`;
  }

  function orbitLabel(id: string): string {
    return ORBIT_CLASSES.find((entry) => entry.id === id)?.nameDE ?? id;
  }
</script>

<Card title="Satellitensysteme im Überblick" subtitle="Bahn, Bänder und die Folgen für den Funkbetrieb">
  {#snippet actions()}
    <Badge tone="info">{rows.length} Systeme</Badge>
  {/snippet}

  <div class="filter">
    <Select label="Einsatzgebiet" value={category} {options} onchange={handleCategoryChange} />
  </div>

  <div class="table-scroll">
    <table>
      <caption>
        Umlaufzeit und Signallaufzeit sind aus der Bahnhöhe gerechnet (Kreisbahn, Satellit im Zenit) und daher
        Richtwerte.
      </caption>
      <thead>
        <tr>
          <th scope="col">System</th>
          <th scope="col">Bahn</th>
          <th scope="col">Höhe</th>
          <th scope="col">Umlaufzeit</th>
          <th scope="col">Laufzeit hin und zurück</th>
          <th scope="col">Bänder</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as system (system.id)}
          <tr>
            <th scope="row">
              {system.nameDE}
              <span class="desc">{system.descriptionDE}</span>
            </th>
            <td>{orbitLabel(system.orbit)}</td>
            <td class="num">{formatDistance(system.altitudeM, 0)}</td>
            <td class="num">{periodLabel(system.altitudeM)}</td>
            <td class="num">{formatNumber(roundTripDelay(system.altitudeM) * MS_PER_S, 1)} ms</td>
            <td>{system.bandsDE}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Card>

<style>
  .filter {
    max-width: 22rem;
    margin-bottom: 1rem;
  }

  .table-scroll {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  caption {
    text-align: left;
    padding-bottom: 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  th,
  td {
    padding: 0.5rem 0.75rem 0.5rem 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-line-subtle);
    color: var(--color-ink-muted);
  }

  thead th {
    color: var(--color-ink);
    white-space: nowrap;
  }

  tbody th {
    color: var(--color-ink);
    font-weight: var(--font-weight-semibold);
    max-width: 20ch;
  }

  .num {
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  .desc {
    display: block;
    margin-top: 0.25rem;
    max-width: 40ch;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    color: var(--color-ink-subtle);
  }
</style>
