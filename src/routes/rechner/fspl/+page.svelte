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
      Berechnen Sie die Freiraumdaempfung (Free Space Path Loss) fuer Funkstrecken.
      Die FSPL beschreibt den Signalverlust im freien Raum ohne Hindernisse.
    </p>
  </header>

  <section class="calculator-section">
    <FSPLCalculator />
  </section>

  <section class="card">
    <h2 class="text-heading-2">Formel-Referenz</h2>
    <div class="formula-content">
      <p class="section-description">
        Die Freiraumdaempfung (FSPL - Free Space Path Loss) ist:
      </p>
      <div class="formula-box">
        FSPL(dB) = 20 log<sub>10</sub>(d) + 20 log<sub>10</sub>(f) + 20 log<sub>10</sub>(4&#960;/c)
      </div>
      <p class="section-description">
        Vereinfacht (mit d in Metern und f in Hz): FSPL &#8776; 20 log<sub>10</sub>(d) + 20 log<sub>10</sub>(f) - 147,55 dB
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
