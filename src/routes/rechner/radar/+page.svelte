<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import RadarRangeCalculator from '$lib/components/calculators/RadarRangeCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    kicker="Rechner"
    title="Radar-Reichweite"
    icon="radio"
    lead="Wie weit ein Radar ein Ziel erkennt — aus Sendeleistung, Antennengewinn, Radarquerschnitt und Empfängerempfindlichkeit."
    meta={[{ label: 'Quelle', value: 'Skolnik, Radar Handbook' }, { label: 'Gültig', value: 'Freiraum ohne Clutter' }]}
  />

  <RadarRangeCalculator />

  <RelatedTopics href="/rechner/radar/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
