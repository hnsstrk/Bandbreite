<script lang="ts">
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import UnifiedSpectrum from '$lib/components/charts/UnifiedSpectrum.svelte';
  import FrequencyWavelengthChart from '$lib/components/charts/FrequencyWavelengthChart.svelte';
  import BandComparisonChart from '$lib/components/charts/BandComparisonChart.svelte';

  let currentFrequencyHz = $state<number | null>(null);
</script>

<svelte:head>
  <title>Spektrum - Bandbreite</title>
  <meta name="description" content="Visualisierung des elektromagnetischen Spektrums und Frequenzbaender" />
</svelte:head>

<div class="space-y-6">
  <header class="mb-8">
    <h1 class="text-3xl font-bold">Spektrum-Visualisierung</h1>
    <p class="text-slate-400 mt-2">
      Interaktive Darstellung des elektromagnetischen Spektrums mit verschiedenen Bandstandards
      (ITU, IEEE, NATO) und Frequenz-Wellenlaengen-Beziehung.
    </p>
  </header>

  <!-- Frequenz-Eingabe -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Frequenz-Auswahl</h2>
    <p class="text-slate-400 text-sm mb-4">
      Geben Sie eine Frequenz ein, um diese in allen Diagrammen hervorzuheben.
    </p>
    <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
  </section>

  <!-- Unified Spectrum - Hauptvisualisierung -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Elektromagnetisches Spektrum</h2>
    <p class="text-slate-400 text-sm mb-4">
      Ueberblick ueber das EM-Spektrum von 3 Hz bis 3 THz mit EM-, ITU-, IEEE- und NATO-Baendern.
      Klicken Sie auf die Schaltflaechen, um Bandstandards ein- oder auszublenden.
    </p>
    <UnifiedSpectrum frequencyHz={currentFrequencyHz ?? undefined} />
  </section>

  <!-- IEEE vs NATO Band Vergleich -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">IEEE vs NATO Baender</h2>
    <p class="text-slate-400 text-sm mb-4">
      Direkter Vergleich der IEEE-Radar-/Mikrowellenbaender mit den NATO-Bandbezeichnungen
      im Bereich von 1 MHz bis 120 GHz.
    </p>
    <div class="w-full overflow-x-auto">
      <BandComparisonChart frequencyHz={currentFrequencyHz ?? undefined} />
    </div>
  </section>

  <!-- Frequenz-Wellenlaengen-Diagramm -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Frequenz-Wellenlaengen-Beziehung</h2>
    <p class="text-slate-400 text-sm mb-4">
      Logarithmisches Diagramm der inversen Beziehung zwischen Frequenz und Wellenlaenge
      (lambda = c / f). Die farbigen Bereiche zeigen die verschiedenen EM-Spektrumregionen.
    </p>
    <div class="w-full overflow-x-auto">
      <FrequencyWavelengthChart frequencyHz={currentFrequencyHz ?? undefined} />
    </div>
  </section>

  <!-- Informations-Sektion -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Bandstandards</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
      <div>
        <h3 class="text-lg font-medium mb-2 text-cyan-400">ITU</h3>
        <p class="text-sm text-slate-400">
          International Telecommunication Union - Standardisierte Frequenzbandbezeichnungen
          von ELF (3-30 Hz) bis THF (300 GHz - 3 THz).
        </p>
      </div>
      <div>
        <h3 class="text-lg font-medium mb-2 text-purple-400">IEEE</h3>
        <p class="text-sm text-slate-400">
          Institute of Electrical and Electronics Engineers - Radar- und Mikrowellenbaender
          wie L, S, C, X, Ku, K, Ka, V, W.
        </p>
      </div>
      <div>
        <h3 class="text-lg font-medium mb-2 text-red-400">NATO</h3>
        <p class="text-sm text-slate-400">
          Militaerische Bandbezeichnungen (A bis O) fuer taktische Kommunikation
          und Radarsysteme.
        </p>
      </div>
    </div>
  </section>
</div>
