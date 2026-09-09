<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import AntennaGainCalculator from '$lib/components/calculators/AntennaGainCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    title="Antennengewinn"
    icon="antenna"
    lead="Gewinn in dBi und dBd, Halbwertsbreite, Wirkfläche und Fernfeldabstand eines Parabolspiegels."
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
    gap: 1rem;
  }
</style>
