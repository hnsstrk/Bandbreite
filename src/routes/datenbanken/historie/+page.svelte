<script lang="ts">
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import HistoricalTimeline from '$lib/components/charts/HistoricalTimeline.svelte';
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Geschichte der Funktechnik</h1>
    <p class="header-description">
      Eine Zeitreise durch die Geschichte der Funktechnik und Frequenznutzung.
      Von den ersten Funkexperimenten bis zu modernen Kommunikationssystemen.
    </p>
  </header>

  <section class="timeline-section">
    <HistoricalTimeline />
  </section>

  <RelatedTopics href="/datenbanken/historie/" />
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

  .timeline-section {
    width: 100%;
  }
</style>
