<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import TransmitterDatabase from '$lib/components/ui/TransmitterDatabase.svelte';
  import { ALL_TRANSMITTERS } from '$lib/data/transmitters';

  /**
   * `?id=<Sender>` aus der Befehlspalette öffnet die Detailtafel des
   * Eintrags. Beim Prerendern sind Suchparameter gesperrt, deshalb der
   * `browser`-Zweig; unbekannte IDs werden verworfen.
   */
  let deepLinkId = $derived.by(() => {
    if (!browser) return null;
    const raw = page.url.searchParams.get('id');
    return raw && ALL_TRANSMITTERS.some((tx) => tx.id === raw) ? raw : null;
  });
</script>

<div class="page-content">
  <PageHero
    kicker="Datenbanken"
    title="Senderdatenbank"
    icon="antenna"
    lead="Zeitzeichensender, Rundfunk, Navigation, Amateurfunk-Relais und Forschungsanlagen — mit Frequenz, Standort, Leistung und Prüfstand."
    meta={[
      { label: 'Einträge', value: String(ALL_TRANSMITTERS.length) },
      { label: 'Filter', value: 'Typ, Einordnung, Status' }
    ]}
  />

  <!-- Der Schlüssel setzt die Datenbank neu auf, wenn dieselbe Route mit
       einem anderen Sender angesteuert wird. -->
  {#key deepLinkId}
    <TransmitterDatabase initialSelectedId={deepLinkId} />
  {/key}

  <RelatedTopics href="/datenbanken/sender/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
