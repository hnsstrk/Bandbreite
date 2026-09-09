<script lang="ts">
  /** Textalternative des Dämpfungsdiagramms für Screenreader. */
  import { formatAttenuation, formatLocaleNumber } from '$lib/utils/formatting';

  interface Row {
    frequency: number;
    oxygen: number;
    waterVapor: number;
    total: number;
    totalAll: number;
  }

  interface Props {
    rows: Row[];
  }

  let { rows }: Props = $props();
</script>

<table>
  <caption>Spezifische Dämpfung an ausgewählten Frequenzen</caption>
  <thead>
    <tr>
      <th scope="col">Frequenz</th>
      <th scope="col">Sauerstoff</th>
      <th scope="col">Wasserdampf</th>
      <th scope="col">Gas gesamt</th>
      <th scope="col">Gesamt mit Niederschlag</th>
    </tr>
  </thead>
  <tbody>
    {#each rows as row (row.frequency)}
      <tr>
        <th scope="row">{formatLocaleNumber(row.frequency, { maxFrac: 3 })} GHz</th>
        <td>{formatAttenuation(row.oxygen)}</td>
        <td>{formatAttenuation(row.waterVapor)}</td>
        <td>{formatAttenuation(row.total)}</td>
        <td>{formatAttenuation(row.totalAll)}</td>
      </tr>
    {/each}
  </tbody>
</table>
