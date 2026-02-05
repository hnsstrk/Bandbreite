<script lang="ts">
  import SkinDepthCalculator from '$lib/components/calculators/SkinDepthCalculator.svelte';
</script>

<svelte:head>
  <title>Skin-Tiefe - Bandbreite</title>
  <meta name="description" content="Berechnung der Skin-Tiefe (Eindringtiefe) in Leitern" />
  <meta property="og:title" content="Skin-Tiefe | Bandbreite" />
  <meta property="og:description" content="Berechnung der Skin-Tiefe (Eindringtiefe) in Leitern" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Skin-Tiefe | Bandbreite" />
  <meta name="twitter:description" content="Berechnung der Skin-Tiefe (Eindringtiefe) in Leitern" />
</svelte:head>

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
