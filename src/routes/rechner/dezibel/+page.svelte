<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import DecibelCalculator from '$lib/components/calculators/DecibelCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    title="Dezibel und Pegel"
    icon="sliders"
    lead="Watt, dBm, dBW, Spannung und dBµV nebeneinander — mit Merkregeln und Kettenrechnung."
    meta={[
      { label: 'Quelle', value: 'ITU-R V.574-5' },
      { label: 'Bezug', value: '1 mW · 1 W · 1 µV' }
    ]}
  />

  <DecibelCalculator />

  <RelatedTopics href="/rechner/dezibel/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
