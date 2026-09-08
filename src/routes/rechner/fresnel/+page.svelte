<script lang="ts">
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import FresnelZoneCalculator from '$lib/components/calculators/FresnelZoneCalculator.svelte';
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Fresnel-Zone</h1>
    <p class="header-description">
      Berechnen Sie den Radius der Fresnel-Zone für Funkstrecken.
      Wichtig für die Planung von Line-of-Sight Verbindungen und Hindernisfreiheit.
    </p>
  </header>

  <section class="calculator-section">
    <FresnelZoneCalculator />
  </section>

  <RelatedTopics href="/rechner/fresnel/" />
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
