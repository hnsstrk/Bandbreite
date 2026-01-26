<script lang="ts">
  import FSPLCalculator from '$lib/components/calculators/FSPLCalculator.svelte';
</script>

<svelte:head>
  <title>FSPL-Rechner - Bandbreite</title>
  <meta name="description" content="Free Space Path Loss (FSPL) Rechner" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">FSPL-Rechner</h1>
    <p class="header-description">
      Berechnen Sie die Freiraumdämpfung (Free Space Path Loss) für Funkstrecken.
      Die FSPL beschreibt den Signalverlust im freien Raum ohne Hindernisse.
    </p>
  </header>

  <section class="calculator-section">
    <FSPLCalculator />
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
