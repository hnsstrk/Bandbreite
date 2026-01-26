<script lang="ts">
  import FSPLCalculator from '$lib/components/calculators/FSPLCalculator.svelte';
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
  <meta name="description" content="Link Budget Kalkulator und FSPL Berechnung" />
</svelte:head>

<div class="page-content">
  <!-- Page Header -->
  <header class="page-header">
    <h1 class="text-heading-1">Link Budget</h1>
    <p class="header-description">
      Berechnen Sie das Link Budget fuer Funkstrecken. Inklusive Free Space Path Loss (FSPL),
      atmosphaerischer Daempfung und Systemmargen.
    </p>
  </header>

  <!-- Link Budget Calculator + Waterfall -->
  <section id="link-budget">
    <div class="section-stack">
      <LinkBudgetCalculator bind:this={linkBudgetRef} />

      <!-- Link Budget Waterfall Visualization -->
      <div class="card">
        <h3 class="text-heading-3">Link Budget Waterfall</h3>
        <p class="section-description">
          Visuelle Darstellung des Signalpfads vom Sender zum Empfaenger.
          Gruene Balken zeigen Gewinne, rote Balken zeigen Verluste.
          Die orangefarbene Linie markiert die Empfaengerempfindlichkeit.
        </p>
        <div class="chart-container">
          <LinkBudgetWaterfall data={linkBudgetData} />
        </div>
      </div>
    </div>
  </section>

  <!-- FSPL Calculator -->
  <section id="fspl-calculator">
    <FSPLCalculator />
  </section>

  <!-- Formula Reference -->
  <section class="card">
    <h2 class="text-heading-2">Formel-Referenz</h2>
    <div class="formula-content">
      <div class="formula-divider">
        <p class="section-description">
          Die Freiraumdaempfung (FSPL - Free Space Path Loss) ist:
        </p>
        <div class="formula-box">
          FSPL(dB) = 20 log&#8321;&#8320;(d) + 20 log&#8321;&#8320;(f) + 20 log&#8321;&#8320;(4&#960;/c)
        </div>
        <p class="section-description">
          Vereinfacht (mit d in Metern und f in Hz): FSPL &#8776; 20 log&#8321;&#8320;(d) + 20 log&#8321;&#8320;(f) - 147,55 dB
        </p>
      </div>

      <div class="formula-divider">
        <p class="section-description">
          Das Link Budget berechnet sich als:
        </p>
        <div class="formula-box formula-small">
          P<sub>RX</sub> = P<sub>TX</sub> + G<sub>TX</sub> - L<sub>TX</sub> - L<sub>path</sub> + G<sub>RX</sub> - L<sub>RX</sub>
        </div>
        <p class="section-description">
          Der Link Margin ergibt sich aus: M = P<sub>RX</sub> - S<sub>RX</sub> (Empfangsleistung minus Empfindlichkeit)
        </p>
      </div>
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

  .formula-small {
    font-size: var(--font-size-base);
  }

  .formula-divider {
    border-top: 1px solid var(--color-border-default);
    padding-top: 1rem;
    margin-top: 1rem;
  }

  .formula-divider:first-child {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }
</style>
