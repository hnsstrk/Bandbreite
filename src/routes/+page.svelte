<script lang="ts">
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import PowerConverter from '$lib/components/converters/PowerConverter.svelte';
  import RangeCalculator from '$lib/components/converters/RangeCalculator.svelte';
  import BandInfo from '$lib/components/converters/BandInfo.svelte';
  import PowerDbChart from '$lib/components/charts/PowerDbChart.svelte';
  import SpectrumOverview from '$lib/components/SpectrumOverview.svelte';
  import AtmosphericInputs from '$lib/components/converters/AtmosphericInputs.svelte';
  import AttenuationChart from '$lib/components/charts/AttenuationChart.svelte';

  // Phase 3 Components
  import FSPLCalculator from '$lib/components/calculators/FSPLCalculator.svelte';
  import FrequencyRelationChart from '$lib/components/charts/FrequencyRelationChart.svelte';
  import LinkBudgetCalculator from '$lib/components/calculators/LinkBudgetCalculator.svelte';
  import LinkBudgetWaterfall from '$lib/components/charts/LinkBudgetWaterfall.svelte';

  let currentFrequencyHz = $state<number | null>(null);
  let currentPowerWatt = $state<number | null>(1);

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
  <title>Bandbreite – RF-Frequenzrechner</title>
  <meta name="description" content="RF-Frequenzrechner für Ingenieure und Funktechnik-Enthusiasten" />
</svelte:head>

<div class="space-y-8">
  <!-- Page Header -->
  <header>
    <h1 class="text-3xl font-bold text-slate-100">Frequenz-Konverter</h1>
    <p class="text-base text-slate-400 mt-2">
      Wandeln Sie Frequenzen in Wellenlängen um und umgekehrt. Die Berechnung erfolgt basierend
      auf der Lichtgeschwindigkeit im Vakuum (c = 299.792.458 m/s).
    </p>
  </header>

  <!-- EM-Spektrum Hauptvisualisierung (ELF bis Gamma) -->
  <section class="bg-slate-800 rounded-xl p-6 shadow-lg">
    <h2 class="text-xl font-semibold text-slate-100 mb-3">Elektromagnetisches Spektrum</h2>
    <p class="text-sm text-slate-400 mb-4">
      Vollstaendige Visualisierung des elektromagnetischen Spektrums von 3 Hz (ELF) bis 30 EHz (Gammastrahlung).
      Inklusive sichtbarem Licht, Infrarot, UV, Roentgen- und Gammastrahlung.
    </p>
    <SpectrumOverview frequencyHz={currentFrequencyHz ?? undefined} />
  </section>

  <!-- Row 1: Frequency Converter + Range Calculator -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
    <RangeCalculator frequencyHz={currentFrequencyHz} />
  </div>

  <!-- Row 2: Power Converter + Band Info -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <PowerConverter bind:powerWatt={currentPowerWatt} />
    <BandInfo frequencyHz={currentFrequencyHz} />
  </div>

  <!-- ========== PHASE 3: FSPL Calculator ========== -->
  <section id="fspl-calculator">
    <FSPLCalculator frequencyHz={currentFrequencyHz} />
  </section>

  <!-- ========== PHASE 3: Frequency Relation Chart ========== -->
  <section class="bg-slate-800 rounded-xl p-6 shadow-lg" id="frequency-relation">
    <h2 class="text-xl font-semibold text-slate-100 mb-3">Frequenz-Wellenlaenge-Beziehung</h2>
    <p class="text-sm text-slate-400 mb-4">
      Interaktive Visualisierung der Beziehung zwischen Frequenz und Wellenlaenge ueber das gesamte RF-Spektrum.
      Die ITU-Frequenzbaender sind als Hintergrund dargestellt.
    </p>
    <div class="w-full overflow-x-auto">
      <FrequencyRelationChart frequencyHz={currentFrequencyHz} />
    </div>
  </section>

  <!-- ========== PHASE 3: Link Budget Calculator + Waterfall ========== -->
  <section id="link-budget">
    <div class="grid grid-cols-1 gap-6">
      <LinkBudgetCalculator
        bind:this={linkBudgetRef}
        frequencyHz={currentFrequencyHz}
      />

      <!-- Link Budget Waterfall Visualization -->
      <div class="bg-slate-800 rounded-xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-slate-100 mb-3">Link Budget Waterfall</h3>
        <p class="text-sm text-slate-400 mb-4">
          Visuelle Darstellung des Signalpfads vom Sender zum Empfaenger.
          Gruene Balken zeigen Gewinne, rote Balken zeigen Verluste.
          Die orangefarbene Linie markiert die Empfaengerempfindlichkeit.
        </p>
        <div class="w-full overflow-x-auto">
          <LinkBudgetWaterfall data={linkBudgetData} />
        </div>
      </div>
    </div>
  </section>

  <!-- Transmit Power vs Frequency Chart -->
  <section class="bg-slate-800 rounded-xl p-6 shadow-lg">
    <h2 class="text-xl font-semibold text-slate-100 mb-3">Sendeleistungen im Frequenzspektrum</h2>
    <p class="text-sm text-slate-400 mb-4">
      Typische Sendeleistungen verschiedener Kommunikations-, Radar-, Satelliten- und IoT-Systeme.
      X-Achse: Frequenz (unten) und Wellenlaenge (oben). Y-Achse: Leistung in Watt (links) und dBm (rechts).
    </p>
    <div class="w-full overflow-x-auto">
      <PowerDbChart />
    </div>
  </section>

  <!-- Atmospheric Attenuation Chart -->
  <section class="bg-slate-800 rounded-xl p-6 shadow-lg">
    <h2 class="text-xl font-semibold text-slate-100 mb-3">Atmosphaerische Daempfung</h2>
    <p class="text-sm text-slate-400 mb-4">
      Daempfung durch Sauerstoff und Wasserdampf nach ITU-R P.676.
      Die Resonanzbereiche bei 22 GHz (H2O) und 60 GHz (O2) sind markiert.
    </p>
    <AtmosphericInputs />
    <div class="w-full overflow-x-auto mt-4">
      <AttenuationChart frequencyGHz={currentFrequencyHz ? currentFrequencyHz / 1e9 : undefined} />
    </div>
  </section>

  <!-- Formula Explanation -->
  <section class="bg-slate-800 rounded-xl p-6 shadow-lg">
    <h2 class="text-xl font-semibold text-slate-100 mb-3">Formel-Erklaerung</h2>
    <div class="space-y-4 text-slate-300">
      <p class="text-sm text-slate-400">
        Die Beziehung zwischen Frequenz (f) und Wellenlaenge (λ) ist:
      </p>
      <div class="bg-slate-900 p-4 rounded-lg font-mono text-center text-lg">
        λ = c / f &nbsp;&nbsp;&nbsp;&nbsp; f = c / λ
      </div>
      <p class="text-sm text-slate-400">
        Wobei c die Lichtgeschwindigkeit im Vakuum ist (= 299.792.458 m/s).
      </p>

      <div class="border-t border-slate-700 pt-4 mt-4">
        <p class="text-sm text-slate-400 mb-2">
          Die Freiraumdaempfung (FSPL - Free Space Path Loss) ist:
        </p>
        <div class="bg-slate-900 p-4 rounded-lg font-mono text-center text-lg">
          FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)
        </div>
        <p class="text-sm text-slate-400 mt-2">
          Vereinfacht (mit d in Metern und f in Hz): FSPL ≈ 20·log₁₀(d) + 20·log₁₀(f) - 147,55 dB
        </p>
      </div>

      <div class="border-t border-slate-700 pt-4 mt-4">
        <p class="text-sm text-slate-400 mb-2">
          Das Link Budget berechnet sich als:
        </p>
        <div class="bg-slate-900 p-4 rounded-lg font-mono text-center text-base">
          P<sub>RX</sub> = P<sub>TX</sub> + G<sub>TX</sub> - L<sub>TX</sub> - L<sub>path</sub> + G<sub>RX</sub> - L<sub>RX</sub>
        </div>
        <p class="text-sm text-slate-400 mt-2">
          Der Link Margin ergibt sich aus: M = P<sub>RX</sub> - S<sub>RX</sub> (Empfangsleistung minus Empfindlichkeit)
        </p>
      </div>
    </div>
  </section>
</div>
