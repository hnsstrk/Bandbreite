<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import TransmitterDatabase from '$lib/components/ui/TransmitterDatabase.svelte';
  import { ALL_TRANSMITTERS } from '$lib/data/transmitters';
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

  <TransmitterDatabase />

  <RelatedTopics href="/datenbanken/sender/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
