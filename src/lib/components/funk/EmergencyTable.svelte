<script lang="ts">
  /**
   * Filterbare Tabelle der Not-, Anruf- und Sicherheitsfrequenzen.
   *
   * Suchfeld, Bereichs- und Zweckfilter; die Zeilen sind nach Frequenz
   * sortiert. Ausdrücklich eine Lernhilfe, kein Betriebsdokument.
   */
  import Panel from './Panel.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { EMERGENCY_FREQUENCIES } from '$lib/data/emergencyFrequencies';
  import type { EmergencyDomain, EmergencyPurpose } from '$lib/data/emergencyFrequencies';
  import {
    DOMAIN_LABELS,
    PURPOSE_LABELS,
    domainCounts,
    filterEmergency,
    frequencyLabel
  } from './emergencyFilter.svelte';

  let query = $state('');
  let domain = $state('alle');
  let purpose = $state('alle');

  const uid = $props.id();
  const searchId = `${uid}-suche`;

  const domainOptions = [
    { value: 'alle', label: 'Alle Bereiche' },
    ...domainCounts().map((entry) => ({
      value: entry.id,
      label: `${entry.label} (${entry.count})`
    }))
  ];

  const purposeOptions = [
    { value: 'alle', label: 'Alle Zwecke' },
    ...(Object.keys(PURPOSE_LABELS) as EmergencyPurpose[]).map((id) => ({
      value: id,
      label: PURPOSE_LABELS[id]
    }))
  ];

  const rows = $derived(
    filterEmergency({
      domain: domain as EmergencyDomain | 'alle',
      purpose: purpose as EmergencyPurpose | 'alle',
      query
    })
  );

  function reset() {
    query = '';
    domain = 'alle';
    purpose = 'alle';
  }
</script>

<Panel title="Not-, Anruf- und Sicherheitsfrequenzen" subtitle="Suchen und nach Bereich oder Zweck filtern">
  {#snippet actions()}
    <Badge tone="info">{rows.length} von {EMERGENCY_FREQUENCIES.length}</Badge>
  {/snippet}

  <div class="filters">
    <div class="field">
      <label for={searchId}>Suche</label>
      <input id={searchId} type="search" bind:value={query} placeholder="z. B. Kanal 16, DSC, 406" autocomplete="off" />
    </div>
    <Select label="Bereich" bind:value={domain} options={domainOptions} />
    <Select label="Zweck" bind:value={purpose} options={purposeOptions} />
    <div class="field field--action">
      <Button icon="reset" onclick={reset}>Filter zurücksetzen</Button>
    </div>
  </div>

  <p class="count" role="status">{rows.length} Einträge gefunden.</p>

  <div class="table-scroll">
    <table>
      <caption> Frequenzen für Not-, Anruf- und Sicherheitsverkehr, sortiert nach Frequenz. </caption>
      <thead>
        <tr>
          <th scope="col">Frequenz</th>
          <th scope="col">Bezeichnung</th>
          <th scope="col">Bereich</th>
          <th scope="col">Zweck</th>
          <th scope="col">Betriebsart</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as entry (entry.id)}
          <tr>
            <th scope="row" class="freq">{frequencyLabel(entry)}</th>
            <td>
              {entry.nameDE}
              <span class="desc">{entry.descriptionDE}</span>
            </td>
            <td>{DOMAIN_LABELS[entry.domain]}</td>
            <td>
              {#if entry.purpose === 'historisch'}
                <Badge tone="neutral">historisch</Badge>
              {:else if entry.purpose === 'notruf'}
                <Badge tone="danger">Notruf</Badge>
              {:else}
                {PURPOSE_LABELS[entry.purpose]}
              {/if}
            </td>
            <td>{entry.modulationDE}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if rows.length === 0}
    <p class="empty">Kein Eintrag passt zu dieser Auswahl. Suchbegriff oder Filter ändern.</p>
  {/if}
</Panel>

<style>
  .filters {
    display: grid;
    gap: 0.5rem 0.75rem;
    margin-bottom: 0.25rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .field--action {
    justify-content: flex-end;
  }

  label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  input {
    min-height: 2.25rem;
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink);
    background-color: var(--color-input);
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-control);
  }

  .count {
    margin: 0 0 0.75rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
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
    padding: 0.25rem 0.75rem 0.25rem 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-line-subtle);
    color: var(--color-ink-muted);
  }

  thead th {
    color: var(--color-ink);
    white-space: nowrap;
  }

  .freq {
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
  }

  .desc {
    display: block;
    margin-top: 0.25rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    max-width: 42ch;
  }

  .empty {
    margin: 0.5rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  @media (min-width: 48rem) {
    .filters {
      grid-template-columns: 2fr 1fr 1fr auto;
      align-items: end;
    }
  }
</style>
