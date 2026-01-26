<script lang="ts">
  import IonosphericPropagation from '$lib/components/charts/IonosphericPropagation.svelte';
</script>

<svelte:head>
  <title>Ionosphäre - Bandbreite</title>
  <meta name="description" content="Ionosphärische Ausbreitung und Kurzwellenkommunikation" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Ionosphärische Ausbreitung</h1>
    <p class="header-description">
      Visualisierung der ionosphärischen Schichten und deren Einfluss auf die Funkwellenausbreitung.
      Wichtig für Kurzwellenkommunikation und HF-Ausbreitung über große Entfernungen.
    </p>
  </header>

  <section class="propagation-section">
    <IonosphericPropagation />
  </section>

  <section class="card">
    <h2 class="text-heading-2">Ionosphärische Schichten</h2>
    <div class="info-content">
      <p class="section-description">
        Die Ionosphäre besteht aus mehreren Schichten, die Radiowellen reflektieren können:
      </p>
      <ul class="layer-list">
        <li><strong>D-Schicht (60-90 km):</strong> Nur tagsüber vorhanden, dämpft LF und MF Signale</li>
        <li><strong>E-Schicht (90-150 km):</strong> Reflektiert MF und untere HF Frequenzen</li>
        <li><strong>F1-Schicht (150-220 km):</strong> Nur tagsüber, verschmilzt nachts mit F2</li>
        <li><strong>F2-Schicht (220-800 km):</strong> Wichtigste Schicht für HF-Langstreckenkommunikation</li>
      </ul>
    </div>
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

  .propagation-section {
    width: 100%;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0;
    line-height: var(--line-height-normal);
  }

  .layer-list {
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .layer-list li {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-normal);
  }

  .layer-list strong {
    color: var(--color-text-primary);
  }
</style>
