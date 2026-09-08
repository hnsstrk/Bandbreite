<script lang="ts">
  /**
   * Frequenzbänder der Erde-Weltraum-Strecke mit Auf- und Abwärtsstrecke.
   * Die Daten stehen in `data/satelliteSystems.ts`.
   */
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { SATELLITE_BANDS } from '$lib/data/satelliteSystems';
  import { formatFrequencyRange } from '$lib/data/bands';

  /** Ab welcher Abwärtsfrequenz Regen deutlich mitspielt, in Hz. */
  const RAIN_CRITICAL_HZ = 10e9;
</script>

<Card
  title="Bänder der Erde-Weltraum-Strecke"
  subtitle="Aufwärts liegt stets höher als abwärts — der Satellit bekommt die günstigere Frequenz"
>
  <div class="table-scroll">
    <table>
      <caption>
        Nennbereiche nach VO Funk Artikel 5 und den Bandbuchstaben nach IEEE Std 521. Die tatsächlich genutzten
        Ausschnitte unterscheiden sich je nach Dienst und ITU-Region.
      </caption>
      <thead>
        <tr>
          <th scope="col">Band</th>
          <th scope="col">Aufwärts (Erde → Satellit)</th>
          <th scope="col">Abwärts (Satellit → Erde)</th>
          <th scope="col">Typische Nutzung</th>
          <th scope="col">Regen</th>
        </tr>
      </thead>
      <tbody>
        {#each SATELLITE_BANDS as band (band.id)}
          <tr>
            <th scope="row">
              <Badge tone={band.downlinkMinHz >= RAIN_CRITICAL_HZ ? 'warning' : 'neutral'}>
                {band.letter}
              </Badge>
              <span class="name">{band.nameDE}</span>
            </th>
            <td class="freq">{formatFrequencyRange(band.uplinkMinHz, band.uplinkMaxHz)}</td>
            <td class="freq">{formatFrequencyRange(band.downlinkMinHz, band.downlinkMaxHz)}</td>
            <td>
              {band.usageDE}
              {#if band.noteDE}
                <span class="exception">{band.noteDE}</span>
              {/if}
            </td>
            <td>{band.rainDE}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="note">
    Warum die Aufteilung? Der Satellit hat wenig Sendeleistung und eine begrenzte Kühlung. Er bekommt deshalb die
    niedrigere, schwächer gedämpfte Frequenz für den Abwärtsweg. Die Erdfunkstelle kann dagegen mit großer Antenne und
    viel Leistung arbeiten und übernimmt den schwierigeren Aufwärtsweg.
  </p>
</Card>

<style>
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

  .name {
    display: block;
    margin-top: 0.25rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    color: var(--color-ink-subtle);
  }

  .freq {
    font-family: var(--font-mono);
    white-space: nowrap;
    color: var(--color-ink);
  }

  .exception {
    display: block;
    margin-top: 0.25rem;
    max-width: 42ch;
    font-size: var(--font-size-xs);
    color: var(--color-warning);
  }

  .note {
    margin: 1rem 0 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }
</style>
