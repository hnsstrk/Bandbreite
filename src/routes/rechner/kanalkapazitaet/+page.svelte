<script lang="ts">
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import ChannelCapacityCalculator from '$lib/components/calculators/ChannelCapacityCalculator.svelte';
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Kanalkapazität</h1>
    <p class="header-description">
      Berechnen Sie die maximale Kanalkapazität nach dem Shannon-Hartley-Theorem.
      Bestimmt die theoretisch maximale Datenrate für einen gegebenen Kanal.
    </p>
  </header>

  <section class="calculator-section">
    <ChannelCapacityCalculator />
  </section>

  <RelatedTopics href="/rechner/kanalkapazitaet/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  .page-header {
    margin-bottom: 0;
  }

  .header-description {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
    line-height: var(--line-height-relaxed);
  }

  .calculator-section {
    width: 100%;
  }

</style>
