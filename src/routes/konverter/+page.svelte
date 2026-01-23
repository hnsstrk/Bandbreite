<script lang="ts">
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import PowerConverter from '$lib/components/converters/PowerConverter.svelte';
  import RangeCalculator from '$lib/components/converters/RangeCalculator.svelte';
  import BandInfo from '$lib/components/converters/BandInfo.svelte';

  let currentFrequencyHz = $state<number | null>(null);
  let currentPowerWatt = $state<number | null>(1);
</script>

<svelte:head>
  <title>Konverter - Bandbreite</title>
  <meta name="description" content="RF-Konverter fuer Frequenz, Leistung und Reichweite" />
</svelte:head>

<div class="space-y-6">
  <header class="mb-8">
    <h1 class="text-3xl font-bold">Konverter</h1>
    <p class="text-slate-400 mt-2">
      Umrechnung von Frequenz, Wellenlaenge, Leistung und Reichweite fuer RF-Anwendungen.
    </p>
  </header>

  <!-- Frequenz-Konverter Sektion -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Frequenz / Wellenlaenge</h2>
    <p class="text-slate-400 text-sm mb-4">
      Bidirektionale Umrechnung zwischen Frequenz und Wellenlaenge basierend auf
      der Lichtgeschwindigkeit (c = 299.792.458 m/s oder gerundet 3 x 10^8 m/s).
    </p>
    <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
  </section>

  <!-- Leistungs-Konverter Sektion -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Leistung / dB</h2>
    <p class="text-slate-400 text-sm mb-4">
      Umrechnung zwischen linearer Leistung (Watt) und logarithmischen Einheiten (dBm, dBW).
    </p>
    <PowerConverter bind:powerWatt={currentPowerWatt} />
  </section>

  <!-- Reichweiten-Kalkulator Sektion -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Reichweiten-Kalkulator (FSPL)</h2>
    <p class="text-slate-400 text-sm mb-4">
      Berechnung der maximalen Reichweite basierend auf Sendeleistung, Empfaengerempfindlichkeit
      und Free Space Path Loss (FSPL). Geben Sie oben eine Frequenz ein.
    </p>
    <RangeCalculator frequencyHz={currentFrequencyHz} />
  </section>

  <!-- Band-Information Sektion -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Bandzuordnung</h2>
    <p class="text-slate-400 text-sm mb-4">
      Anzeige der IEEE-, NATO- und zivilen Frequenzbaender fuer die eingegebene Frequenz.
    </p>
    <BandInfo frequencyHz={currentFrequencyHz} />
  </section>

  <!-- Formeln Sektion -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Verwendete Formeln</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
      <div>
        <h3 class="text-lg font-medium mb-2">Wellenlaenge</h3>
        <div class="bg-slate-900 p-4 rounded-lg font-mono text-center">
          lambda = c / f
        </div>
        <p class="text-sm text-slate-400 mt-2">
          c = Lichtgeschwindigkeit, f = Frequenz
        </p>
      </div>
      <div>
        <h3 class="text-lg font-medium mb-2">Leistung in dBm</h3>
        <div class="bg-slate-900 p-4 rounded-lg font-mono text-center">
          P(dBm) = 10 * log10(P / 1mW)
        </div>
        <p class="text-sm text-slate-400 mt-2">
          P = Leistung in Watt
        </p>
      </div>
      <div>
        <h3 class="text-lg font-medium mb-2">Free Space Path Loss</h3>
        <div class="bg-slate-900 p-4 rounded-lg font-mono text-center text-sm">
          FSPL(dB) = 20*log10(d) + 20*log10(f) - 147,55
        </div>
        <p class="text-sm text-slate-400 mt-2">
          d = Distanz in m, f = Frequenz in Hz
        </p>
      </div>
      <div>
        <h3 class="text-lg font-medium mb-2">Reichweite</h3>
        <div class="bg-slate-900 p-4 rounded-lg font-mono text-center text-sm">
          d = 10^((Ptx - Prx - 20*log10(f) + 147,55) / 20)
        </div>
        <p class="text-sm text-slate-400 mt-2">
          Ptx = Sendeleistung, Prx = Empfindlichkeit
        </p>
      </div>
    </div>
  </section>
</div>
