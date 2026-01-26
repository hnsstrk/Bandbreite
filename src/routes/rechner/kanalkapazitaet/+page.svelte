<script lang="ts">
  import ChannelCapacityCalculator from '$lib/components/calculators/ChannelCapacityCalculator.svelte';
</script>

<svelte:head>
  <title>Kanalkapazitaet - Bandbreite</title>
  <meta name="description" content="Shannon-Hartley Kanalkapazitaet Rechner" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Kanalkapazitaet</h1>
    <p class="header-description">
      Berechnen Sie die maximale Kanalkapazitaet nach dem Shannon-Hartley-Theorem.
      Bestimmt die theoretisch maximale Datenrate fuer einen gegebenen Kanal.
    </p>
  </header>

  <section class="calculator-section">
    <ChannelCapacityCalculator />
  </section>

  <section class="card">
    <h2 class="text-heading-2">Formel-Referenz</h2>
    <div class="formula-content">
      <p class="section-description">
        Das Shannon-Hartley-Theorem beschreibt die maximale Kanalkapazitaet:
      </p>
      <div class="formula-box">
        C = B log<sub>2</sub>(1 + SNR)
      </div>
      <p class="section-description">
        Wobei C = Kanalkapazitaet (bit/s), B = Bandbreite (Hz), SNR = Signal-Rausch-Verhaeltnis (linear).
        Fuer SNR in dB: SNR<sub>linear</sub> = 10<sup>(SNR<sub>dB</sub>/10)</sup>
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
