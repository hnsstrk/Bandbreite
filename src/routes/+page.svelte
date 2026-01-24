<script lang="ts">
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import PowerConverter from '$lib/components/converters/PowerConverter.svelte';
  import RangeCalculator from '$lib/components/converters/RangeCalculator.svelte';
  import BandInfo from '$lib/components/converters/BandInfo.svelte';
  import PowerDbChart from '$lib/components/charts/PowerDbChart.svelte';
  import SpectrumOverview from '$lib/components/SpectrumOverview.svelte';
  import AtmosphericInputs from '$lib/components/converters/AtmosphericInputs.svelte';
  import AttenuationChart from '$lib/components/charts/AttenuationChart.svelte';

  let currentFrequencyHz = $state<number | null>(null);
  let currentPowerWatt = $state<number | null>(1);
</script>

<svelte:head>
  <title>Bandbreite - RF-Frequenzrechner</title>
  <meta name="description" content="RF-Frequenzrechner für Ingenieure und Funktechnik-Enthusiasten" />
</svelte:head>

<div class="page-content">
  <!-- Page Header -->
  <header class="page-header">
    <h1 class="text-heading-1">Frequenz-Konverter</h1>
    <p class="header-description">
      Wandeln Sie Frequenzen in Wellenlängen um und umgekehrt. Die Berechnung erfolgt basierend
      auf der Lichtgeschwindigkeit im Vakuum (c = 299.792.458 m/s).
    </p>
  </header>

  <!-- EM-Spektrum Hauptvisualisierung (ELF bis Gamma) -->
  <section class="card">
    <h2 class="text-heading-2">Elektromagnetisches Spektrum</h2>
    <p class="section-description">
      Vollständige Visualisierung des elektromagnetischen Spektrums von 3 Hz (ELF) bis 30 EHz (Gammastrahlung).
      Inklusive sichtbarem Licht, Infrarot, UV, Röntgen- und Gammastrahlung.
    </p>
    <SpectrumOverview frequencyHz={currentFrequencyHz ?? undefined} />
  </section>

  <!-- Row 1: Frequency Converter + Range Calculator -->
  <div class="grid-row">
    <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
    <RangeCalculator frequencyHz={currentFrequencyHz} />
  </div>

  <!-- Row 2: Power Converter + Band Info -->
  <div class="grid-row">
    <PowerConverter bind:powerWatt={currentPowerWatt} />
    <BandInfo frequencyHz={currentFrequencyHz} />
  </div>

  <!-- Transmit Power vs Frequency Chart -->
  <section class="card">
    <h2 class="text-heading-2">Sendeleistungen im Frequenzspektrum</h2>
    <p class="section-description">
      Typische Sendeleistungen verschiedener Kommunikations-, Radar-, Satelliten- und IoT-Systeme.
      X-Achse: Frequenz (unten) und Wellenlänge (oben). Y-Achse: Leistung in Watt (links) und dBm (rechts).
    </p>
    <div class="chart-container">
      <PowerDbChart />
    </div>
  </section>

  <!-- Atmospheric Attenuation Chart -->
  <section class="card">
    <h2 class="text-heading-2">Atmosphärische Dämpfung</h2>
    <p class="section-description">
      Dämpfung durch Sauerstoff und Wasserdampf nach ITU-R P.676.
      Die Resonanzbereiche bei 22 GHz (H&#8322;O) und 60 GHz (O&#8322;) sind markiert.
    </p>
    <AtmosphericInputs />
    <div class="chart-container chart-margin-top">
      <AttenuationChart frequencyGHz={currentFrequencyHz ? currentFrequencyHz / 1e9 : undefined} />
    </div>
  </section>

  <!-- Formula Explanation -->
  <section class="card">
    <h2 class="text-heading-2">Formel-Erklärung</h2>
    <div class="formula-content">
      <p class="section-description">
        Die Beziehung zwischen Frequenz (f) und Wellenlänge (&#955;) ist:
      </p>
      <div class="formula-box">
        &#955; = c / f &nbsp;&nbsp;&nbsp;&nbsp; f = c / &#955;
      </div>
      <p class="section-description">
        Wobei c die Lichtgeschwindigkeit im Vakuum ist (= 299.792.458 m/s).
      </p>

      <div class="formula-divider">
        <p class="section-description">
          Die Freiraumdämpfung (FSPL - Free Space Path Loss) ist:
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

  .grid-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .grid-row {
      grid-template-columns: 1fr 1fr;
    }
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

  .chart-margin-top {
    margin-top: 1rem;
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
</style>
