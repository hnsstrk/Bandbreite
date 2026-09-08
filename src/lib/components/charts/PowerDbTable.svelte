<script lang="ts">
  /** Textalternative des Sendeleistungs-Diagramms f\u00fcr Screenreader. */
  import { formatFrequency, formatPowerWatts } from '$lib/utils/formatting';
  import type { DataPoint } from './powerDbData';

  interface Props {
    points: DataPoint[];
  }

  let { points }: Props = $props();
</script>

<table>
  <caption>Sendeleistungen ausgew\u00e4hlter Systeme</caption>
  <thead>
    <tr>
      <th scope="col">System</th>
      <th scope="col">Frequenz</th>
      <th scope="col">Sendeleistung</th>
    </tr>
  </thead>
  <tbody>
    {#each points as point (point.name)}
      <tr>
        <th scope="row">{point.nameDE}</th>
        <td>{formatFrequency(point.frequencyHz, 0)}</td>
        <td>{formatPowerWatts(point.powerWatt, 1)}</td>
      </tr>
    {/each}
  </tbody>
</table>
