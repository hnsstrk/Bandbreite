<script lang="ts">
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import PowerConverter from '$lib/components/converters/PowerConverter.svelte';
  import RangeCalculator from '$lib/components/converters/RangeCalculator.svelte';
  import BandInfo from '$lib/components/converters/BandInfo.svelte';
  import FrequencyWavelengthChart from '$lib/components/charts/FrequencyWavelengthChart.svelte';
  import PowerDbChart from '$lib/components/charts/PowerDbChart.svelte';
  import UnifiedSpectrum from '$lib/components/charts/UnifiedSpectrum.svelte';
  import AtmosphericInputs from '$lib/components/converters/AtmosphericInputs.svelte';
  import AttenuationChart from '$lib/components/charts/AttenuationChart.svelte';

  let currentFrequencyHz = $state<number | null>(null);
  let currentPowerWatt = $state<number | null>(1);
</script>

<svelte:head>
  <title>Bandbreite – RF-Frequenzrechner</title>
  <meta name="description" content="RF-Frequenzrechner für Ingenieure und Funktechnik-Enthusiasten" />
</svelte:head>

<div class="space-y-6">
  <h1 class="text-3xl font-bold">Frequenz-Konverter</h1>
  <p class="text-slate-400">
    Wandeln Sie Frequenzen in Wellenlängen um und umgekehrt. Die Berechnung erfolgt basierend
    auf der Lichtgeschwindigkeit im Vakuum (c ≈ 299.792.458 m/s).
  </p>

  <!-- Unified Spectrum - Hauptvisualisierung -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Elektromagnetisches Spektrum</h2>
    <p class="text-slate-400 text-sm mb-4">
      Interaktive Darstellung des EM-Spektrums mit verschiedenen Bandstandards.
      Die ausgewaehlte Frequenz wird durch einen Marker angezeigt.
    </p>
    <UnifiedSpectrum frequencyHz={currentFrequencyHz ?? undefined} />
  </section>

  <!-- Row 1: Frequency Converter + Range Calculator -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
    <RangeCalculator frequencyHz={currentFrequencyHz} />
  </div>

  <!-- Row 2: Power Converter + Band Info -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <PowerConverter bind:powerWatt={currentPowerWatt} />
    <BandInfo frequencyHz={currentFrequencyHz} />
  </div>

  <!-- Frequency/Wavelength Chart -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Frequenz-Wellenlängen-Diagramm</h2>
    <div class="w-full overflow-x-auto">
      <FrequencyWavelengthChart frequencyHz={currentFrequencyHz ?? undefined} />
    </div>
  </section>

  <!-- Power/dB Chart -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Leistung: Watt - dB Diagramm</h2>
    <p class="text-slate-400 text-sm mb-4">
      Zusammenhang zwischen Leistung in Watt und dBm. Referenzpunkte zeigen typische Anwendungen.
    </p>
    <div class="w-full overflow-x-auto">
      <PowerDbChart powerWatt={currentPowerWatt ?? undefined} />
    </div>
  </section>

  <!-- Atmospheric Attenuation Chart -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Atmosphaerische Daempfung</h2>
    <p class="text-slate-400 text-sm mb-4">
      Daempfung durch Sauerstoff und Wasserdampf nach ITU-R P.676.
      Die Resonanzbereiche bei 22 GHz (H2O) und 60 GHz (O2) sind markiert.
    </p>
    <AtmosphericInputs />
    <div class="w-full overflow-x-auto mt-4">
      <AttenuationChart frequencyGHz={currentFrequencyHz ? currentFrequencyHz / 1e9 : undefined} />
    </div>
  </section>

  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Formel-Erklärung</h2>
    <div class="space-y-4 text-slate-300">
      <p>
        Die Beziehung zwischen Frequenz (f) und Wellenlänge (λ) ist:
      </p>
      <div class="bg-slate-900 p-4 rounded-lg font-mono text-center text-lg">
        λ = c / f &nbsp;&nbsp;&nbsp;&nbsp; f = c / λ
      </div>
      <p class="text-sm text-slate-400">
        Wobei c die Lichtgeschwindigkeit im Vakuum ist (≈ 299.792.458 m/s).
      </p>
    </div>
  </section>
</div>
