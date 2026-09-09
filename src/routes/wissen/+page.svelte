<script lang="ts">
  import { findNode, getHubChildren } from '$lib/data/navigation';
  import HubList from '$lib/components/portal/HubList.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

  const HUB_HREF = '/wissen/';

  const hub = findNode(HUB_HREF);
  const items = getHubChildren(HUB_HREF);

  /** Schnellreferenz als reine Datenblatt-Tabellen — vier Spalten, keine Karten. */
  const QUICK_REF: { title: string; rows: [string, string][] }[] = [
    {
      title: 'Frequenzbereiche',
      rows: [
        ['ELF', '3–30 Hz'],
        ['VLF', '3–30 kHz'],
        ['LF', '30–300 kHz'],
        ['MF', '300 kHz – 3 MHz'],
        ['HF', '3–30 MHz'],
        ['VHF', '30–300 MHz'],
        ['UHF', '300 MHz – 3 GHz'],
        ['SHF', '3–30 GHz'],
        ['EHF', '30–300 GHz']
      ]
    },
    {
      title: 'Wichtige Formeln',
      rows: [
        ['Wellenlänge', 'λ = c / f'],
        ['Freiraumdämpfung', '20·log₁₀(d) + 20·log₁₀(f) + K'],
        ['Radiohorizont', 'd = √(2·k·R·h)'],
        ['Shannon', 'C = B·log₂(1 + SNR)']
      ]
    },
    {
      title: 'Physikalische Konstanten',
      rows: [
        ['Lichtgeschwindigkeit', '299.792.458 m/s'],
        ['Erdradius', '6.371 km'],
        ['Refraktionsfaktor k', '≈ 4/3'],
        ['Boltzmann-Konstante', '1,38 · 10⁻²³ J/K']
      ]
    },
    {
      title: 'Dezibel im Kopf',
      rows: [
        ['3 dB', '× 2 (Leistung)'],
        ['6 dB', '× 4 (Leistung)'],
        ['10 dB', '× 10 (Leistung)'],
        ['20 dB', '× 100 (Leistung)'],
        ['30 dB', '× 1000 (Leistung)']
      ]
    }
  ];
</script>

<div class="page-content">
  <PageHero
    title={hub?.label ?? 'Wissen'}
    icon="book"
    lead={hub?.description ?? 'Die Physik hinter den Zahlen — von der Wellenausbreitung über Radar bis zur Modulation.'}
  />

  <HubList {items} label="Kapitel" />

  <section class="quick-ref" aria-labelledby="schnellreferenz">
    <SectionHeader title="Schnellreferenz" level={2} id="schnellreferenz" />

    <div class="quick-ref__grid">
      {#each QUICK_REF as block (block.title)}
        <table class="ref-table">
          <caption>{block.title}</caption>
          <tbody>
            {#each block.rows as row (row[0])}
              <tr><th scope="row">{row[0]}</th><td>{row[1]}</td></tr>
            {/each}
          </tbody>
        </table>
      {/each}
    </div>
  </section>

  <RelatedTopics href={HUB_HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .quick-ref {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quick-ref__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 0.75rem 2rem;
  }

  .ref-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .ref-table caption {
    text-align: left;
    padding-bottom: 0.25rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    border-bottom: 1px solid var(--color-line);
  }

  .ref-table th,
  .ref-table td {
    padding: 0.125rem 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .ref-table th {
    color: var(--color-ink-muted);
    font-weight: var(--font-weight-normal);
    padding-right: 0.75rem;
  }

  .ref-table td {
    color: var(--color-ink);
    font-family: var(--font-mono);
  }
</style>
