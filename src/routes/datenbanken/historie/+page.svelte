<script lang="ts">
  import HistoricalTimeline from '$lib/components/charts/HistoricalTimeline.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import { HISTORICAL_EVENTS } from '$lib/data/history';
</script>

<div class="page-content">
  <PageHero
    kicker="Datenbanken"
    title="Geschichte der Funktechnik"
    icon="clock"
    lead="Von Maxwells Gleichungen über Hertz' Funkenstrecke bis zu 5G und Satelliteninternet — die Meilensteine, geordnet nach Jahr und Kategorie."
    meta={[
      { label: 'Ereignisse', value: String(HISTORICAL_EVENTS.length) },
      { label: 'Zeitraum', value: '1860 bis heute' }
    ]}
  />

  <HistoricalTimeline />

  <RelatedTopics href="/datenbanken/historie/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
