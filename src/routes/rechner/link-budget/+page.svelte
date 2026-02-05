<script lang="ts">
  import LinkBudgetCalculator from '$lib/components/calculators/LinkBudgetCalculator.svelte';
  import LinkBudgetWaterfall from '$lib/components/charts/LinkBudgetWaterfall.svelte';

  // Link Budget Calculator reference and data
  let linkBudgetRef: LinkBudgetCalculator | undefined = $state(undefined);

  // Link budget data for waterfall chart
  let linkBudgetData = $state<{
    txPowerDbm: number;
    txAntennaGainDbi: number;
    txCableLossDb: number;
    eirpDbm: number;
    fsplDb: number;
    atmosphericLossDb: number;
    miscLossDb: number;
    totalPathLossDb: number;
    rxAntennaGainDbi: number;
    rxCableLossDb: number;
    receivedPowerDbm: number;
    rxSensitivityDbm: number;
    linkMarginDb: number;
    fadingMarginDb: number;
    systemMarginDb: number;
    linkViable: boolean;
  } | null>(null);

  // Update link budget data periodically
  $effect(() => {
    if (linkBudgetRef) {
      const data = linkBudgetRef.getLinkBudgetData();
      linkBudgetData = data;
    }
  });
</script>

<svelte:head>
  <title>Link Budget - Bandbreite</title>
  <meta name="description" content="Link Budget Kalkulator für Funkstrecken" />
  <meta property="og:title" content="Link Budget | Bandbreite" />
  <meta property="og:description" content="Link Budget Kalkulator für Funkstrecken" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Link Budget | Bandbreite" />
  <meta name="twitter:description" content="Link Budget Kalkulator für Funkstrecken" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Link Budget</h1>
    <p class="header-description">
      Berechnen Sie das Link Budget für Funkstrecken. Inklusive Free Space Path Loss (FSPL),
      atmosphärischer Dämpfung und Systemmargen.
    </p>
  </header>

  <section class="calculator-section">
    <div class="section-stack">
      <LinkBudgetCalculator bind:this={linkBudgetRef} />

      <div class="card">
        <h3 class="text-heading-3">Link Budget Waterfall</h3>
        <p class="section-description">
          Visuelle Darstellung des Signalpfads vom Sender zum Empfänger.
          Grüne Balken zeigen Gewinne, rote Balken zeigen Verluste.
          Die orangefarbene Linie markiert die Empfängerempfindlichkeit.
        </p>
        <div class="chart-container">
          <LinkBudgetWaterfall data={linkBudgetData} />
        </div>
      </div>
    </div>
  </section>

  <section class="card">
    <h2 class="text-heading-2">Formel-Referenz</h2>
    <div class="formula-content">
      <p class="section-description">
        Das Link Budget berechnet sich als:
      </p>
      <div class="formula-box">
        P<sub>RX</sub> = P<sub>TX</sub> + G<sub>TX</sub> - L<sub>TX</sub> - L<sub>path</sub> + G<sub>RX</sub> - L<sub>RX</sub>
      </div>
      <p class="section-description">
        Der Link Margin ergibt sich aus: M = P<sub>RX</sub> - S<sub>RX</sub> (Empfangsleistung minus Empfindlichkeit)
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

  .section-stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0.75rem 0;
    line-height: var(--line-height-normal);
  }

  .chart-container {
    width: 100%;
    overflow-x: auto;
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
