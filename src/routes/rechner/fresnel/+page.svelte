<script lang="ts">
  import FresnelZoneCalculator from '$lib/components/calculators/FresnelZoneCalculator.svelte';
</script>

<svelte:head>
  <title>Fresnel-Zone - Bandbreite</title>
  <meta name="description" content="Berechnung der Fresnel-Zone fuer Funkstrecken" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Fresnel-Zone</h1>
    <p class="header-description">
      Berechnen Sie den Radius der Fresnel-Zone fuer Funkstrecken.
      Wichtig fuer die Planung von Line-of-Sight Verbindungen und Hindernisfreiheit.
    </p>
  </header>

  <section class="calculator-section">
    <FresnelZoneCalculator />
  </section>

  <section class="card">
    <h2 class="text-heading-2">Formel-Referenz</h2>
    <div class="formula-content">
      <p class="section-description">
        Der Radius der n-ten Fresnel-Zone berechnet sich als:
      </p>
      <div class="formula-box">
        r<sub>n</sub> = &#8730;((n &#955; d<sub>1</sub> d<sub>2</sub>) / (d<sub>1</sub> + d<sub>2</sub>))
      </div>
      <p class="section-description">
        Wobei r<sub>n</sub> = Radius der n-ten Fresnel-Zone, &#955; = Wellenlaenge,
        d<sub>1</sub> und d<sub>2</sub> = Entfernungen vom Punkt zu den Endpunkten.
        Die erste Fresnel-Zone (n=1) sollte zu mindestens 60% frei von Hindernissen sein.
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
