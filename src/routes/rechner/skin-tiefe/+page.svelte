<script lang="ts">
  import SkinDepthCalculator from '$lib/components/calculators/SkinDepthCalculator.svelte';
</script>

<svelte:head>
  <title>Skin-Tiefe - Bandbreite</title>
  <meta name="description" content="Berechnung der Skin-Tiefe (Eindringtiefe) in Leitern" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Skin-Tiefe</h1>
    <p class="header-description">
      Berechnen Sie die Skin-Tiefe (Eindringtiefe) elektromagnetischer Wellen in leitenden Materialien.
      Wichtig fuer HF-Design und Abschirmung.
    </p>
  </header>

  <section class="calculator-section">
    <SkinDepthCalculator />
  </section>

  <section class="card">
    <h2 class="text-heading-2">Formel-Referenz</h2>
    <div class="formula-content">
      <p class="section-description">
        Die Skin-Tiefe (Eindringtiefe) berechnet sich als:
      </p>
      <div class="formula-box">
        &#948; = &#8730;(2 / (&#969; &#956; &#963;)) = &#8730;(&#961; / (&#960; f &#956;))
      </div>
      <p class="section-description">
        Wobei &#948; = Skin-Tiefe, &#969; = Kreisfrequenz, &#956; = magnetische Permeabilitaet,
        &#963; = elektrische Leitfaehigkeit, &#961; = spezifischer Widerstand, f = Frequenz.
      </p>
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

  .calculator-section {
    width: 100%;
  }

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0.75rem 0;
    line-height: var(--line-height-normal);
  }

  .formula-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .formula-box {
    background-color: var(--color-bg-code);
    padding: 1rem;
    border-radius: var(--radius-lg);
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    text-align: center;
    margin: 0.5rem 0;
  }
</style>
