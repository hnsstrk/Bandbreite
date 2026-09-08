<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import AntennaGainCalculator from '$lib/components/calculators/AntennaGainCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    kicker="Rechner"
    title="Antennengewinn"
    icon="antenna"
    lead="Was ein Parabolspiegel aus der Sendeleistung macht: Gewinn in dBi und dBd, Halbwertsbreite, Wirkfläche und der Abstand, ab dem das Fernfeld beginnt."
    meta={[
      { label: 'Quelle', value: 'Balanis, Antenna Theory' },
      { label: 'Gültig', value: 'Kreisapertur, D ≫ λ' }
    ]}
  />

  <AntennaGainCalculator />

  <RelatedTopics href="/rechner/antennengewinn/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
