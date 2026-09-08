<script lang="ts">
  import { findNode, getHubChildren } from '$lib/data/navigation';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import { isIconName } from '$lib/components/ui/icons';

  const HUB_HREF = '/wissen/';

  const hub = findNode(HUB_HREF);
  const items = getHubChildren(HUB_HREF);

  /** Nur Namen aus dem Katalog dürfen an `Icon` — sonst kein Icon. */
  function iconFor(name: string | undefined) {
    return name && isIconName(name) ? name : undefined;
  }
</script>

<div class="page-content">
  <PageHero
    kicker="Grundlagen"
    title={hub?.label ?? 'Wissen'}
    icon="book"
    lead={hub?.description ?? 'Die Physik hinter den Zahlen — von der Wellenausbreitung über Radar bis zur Modulation.'}
  />

  <ul class="hub-grid">
    {#each items as item (item.id)}
      <li class="hub-grid__cell">
        {#if item.status === 'geplant'}
          <Card title={item.label} level={2} icon={iconFor(item.icon)} muted class="hub-card">
            {#snippet actions()}<Badge tone="neutral">geplant</Badge>{/snippet}
            {item.description ?? ''}
          </Card>
        {:else}
          <Card href={item.href} title={item.label} level={2} icon={iconFor(item.icon)} class="hub-card">
            {item.description ?? ''}
          </Card>
        {/if}
      </li>
    {/each}
  </ul>

  <section class="quick-ref" aria-labelledby="schnellreferenz">
    <SectionHeader title="Schnellreferenz" level={2} id="schnellreferenz" />

    <div class="quick-ref__grid">
      <Card title="Frequenzbereiche" level={3} tone="sunken">
        <table class="ref-table">
          <tbody>
            <tr><th scope="row">ELF</th><td>3–30 Hz</td></tr>
            <tr><th scope="row">VLF</th><td>3–30 kHz</td></tr>
            <tr><th scope="row">LF</th><td>30–300 kHz</td></tr>
            <tr><th scope="row">MF</th><td>300 kHz – 3 MHz</td></tr>
            <tr><th scope="row">HF</th><td>3–30 MHz</td></tr>
            <tr><th scope="row">VHF</th><td>30–300 MHz</td></tr>
            <tr><th scope="row">UHF</th><td>300 MHz – 3 GHz</td></tr>
            <tr><th scope="row">SHF</th><td>3–30 GHz</td></tr>
            <tr><th scope="row">EHF</th><td>30–300 GHz</td></tr>
          </tbody>
        </table>
      </Card>

      <Card title="Wichtige Formeln" level={3} tone="sunken">
        <table class="ref-table">
          <tbody>
            <tr><th scope="row">Wellenlänge</th><td>λ = c / f</td></tr>
            <tr><th scope="row">Freiraumdämpfung</th><td>20·log₁₀(d) + 20·log₁₀(f) + K</td></tr>
            <tr><th scope="row">Radiohorizont</th><td>d = √(2·k·R·h)</td></tr>
            <tr><th scope="row">Shannon</th><td>C = B·log₂(1 + SNR)</td></tr>
          </tbody>
        </table>
      </Card>

      <Card title="Physikalische Konstanten" level={3} tone="sunken">
        <table class="ref-table">
          <tbody>
            <tr><th scope="row">Lichtgeschwindigkeit</th><td>299.792.458 m/s</td></tr>
            <tr><th scope="row">Erdradius</th><td>6.371 km</td></tr>
            <tr><th scope="row">Refraktionsfaktor k</th><td>≈ 4/3</td></tr>
            <tr><th scope="row">Boltzmann-Konstante</th><td>1,38 · 10⁻²³ J/K</td></tr>
          </tbody>
        </table>
      </Card>

      <Card title="Dezibel im Kopf" level={3} tone="sunken">
        <table class="ref-table">
          <tbody>
            <tr><th scope="row">3 dB</th><td>× 2 (Leistung)</td></tr>
            <tr><th scope="row">6 dB</th><td>× 4 (Leistung)</td></tr>
            <tr><th scope="row">10 dB</th><td>× 10 (Leistung)</td></tr>
            <tr><th scope="row">20 dB</th><td>× 100 (Leistung)</td></tr>
            <tr><th scope="row">30 dB</th><td>× 1000 (Leistung)</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  </section>

  <RelatedTopics href={HUB_HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .hub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Gleich hohe Kacheln: die Karte füllt ihre Zelle vollständig aus. */
  .hub-grid__cell {
    display: flex;
  }

  .hub-grid__cell :global(.hub-card) {
    width: 100%;
  }

  .quick-ref {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .quick-ref__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    gap: 1rem;
  }

  .ref-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .ref-table th,
  .ref-table td {
    padding: 0.25rem 0;
    text-align: left;
    vertical-align: top;
  }

  .ref-table th {
    color: var(--color-ink-muted);
    font-weight: var(--font-weight-medium);
    padding-right: 0.75rem;
  }

  .ref-table td {
    color: var(--color-ink);
    font-family: var(--font-mono);
  }
</style>
