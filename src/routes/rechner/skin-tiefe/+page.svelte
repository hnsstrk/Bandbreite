<script lang="ts">
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SkinDepthCalculator from '$lib/components/calculators/SkinDepthCalculator.svelte';
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Skin-Tiefe</h1>
    <p class="header-description">
      Berechnen Sie die Skin-Tiefe (Eindringtiefe) elektromagnetischer Wellen in leitenden Materialien.
      Wichtig für HF-Design und Abschirmung.
    </p>
  </header>

  <section class="calculator-section">
    <SkinDepthCalculator />
  </section>

  <RelatedTopics href="/rechner/skin-tiefe/" />
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
