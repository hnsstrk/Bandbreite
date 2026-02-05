<script lang="ts">
  import FresnelZoneCalculator from '$lib/components/calculators/FresnelZoneCalculator.svelte';
</script>

<svelte:head>
  <title>Fresnel-Zone - Bandbreite</title>
  <meta name="description" content="Berechnung der Fresnel-Zone für Funkstrecken" />
  <meta property="og:title" content="Fresnel-Zone | Bandbreite" />
  <meta property="og:description" content="Berechnung der Fresnel-Zone für Funkstrecken" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Fresnel-Zone | Bandbreite" />
  <meta name="twitter:description" content="Berechnung der Fresnel-Zone für Funkstrecken" />
</svelte:head>

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
