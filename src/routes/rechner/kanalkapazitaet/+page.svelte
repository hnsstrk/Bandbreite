<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import ChannelCapacityCalculator from '$lib/components/calculators/ChannelCapacityCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    kicker="Rechner"
    title="Kanalkapazität"
    icon="signal"
    lead="Die theoretisch höchste fehlerfreie Datenrate eines Kanals — nach Shannon und Hartley, aus Bandbreite und Störabstand."
    meta={[{ label: 'Quelle', value: 'Shannon 1948' }, { label: 'Gültig', value: 'AWGN-Kanal' }]}
  />

  <ChannelCapacityCalculator />

  <RelatedTopics href="/rechner/kanalkapazitaet/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
