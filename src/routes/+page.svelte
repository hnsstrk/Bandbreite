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
    </div>
  </section>
</div>
