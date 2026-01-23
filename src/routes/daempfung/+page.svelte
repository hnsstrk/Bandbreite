<script lang="ts">
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import AtmosphericInputs from '$lib/components/converters/AtmosphericInputs.svelte';
  import AttenuationChart from '$lib/components/charts/AttenuationChart.svelte';

  let currentFrequencyHz = $state<number | null>(null);

  // Konvertiere Hz zu GHz fuer das AttenuationChart
  let frequencyGHz = $derived(
    currentFrequencyHz !== null && currentFrequencyHz > 0
      ? currentFrequencyHz / 1e9
      : undefined
  );
</script>

<svelte:head>
  <title>Daempfung - Bandbreite</title>
  <meta name="description" content="Atmosphaerische Daempfung nach ITU-R P.676" />
</svelte:head>

<div class="space-y-6">
  <header class="mb-8">
    <h1 class="text-3xl font-bold">Atmosphaerische Daempfung</h1>
    <p class="text-slate-400 mt-2">
      Berechnung der atmosphaerischen Daempfung durch Sauerstoff und Wasserdampf
      basierend auf dem ITU-R P.676 Modell.
    </p>
  </header>

  <!-- Frequenz-Eingabe -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Frequenz-Eingabe</h2>
    <p class="text-slate-400 text-sm mb-4">
      Geben Sie eine Frequenz ein, um die Daempfung bei dieser Frequenz im Diagramm anzuzeigen.
      Der gueltige Bereich liegt zwischen 1 GHz und 100 GHz.
    </p>
    <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
  </section>

  <!-- Atmosphaerische Parameter -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Atmosphaerische Parameter</h2>
    <p class="text-slate-400 text-sm mb-4">
      Passen Sie Temperatur, Luftdruck, Wasserdampfdichte und Distanz an,
      um die Daempfung unter verschiedenen Bedingungen zu berechnen.
    </p>
    <AtmosphericInputs />
  </section>

  <!-- Daempfungs-Diagramm -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Daempfungs-Diagramm</h2>
    <p class="text-slate-400 text-sm mb-4">
      Logarithmische Darstellung der spezifischen Daempfung (dB/km) fuer Sauerstoff (O2),
      Wasserdampf (H2O) und die Gesamtdaempfung. Die markierten Regionen zeigen
      die Resonanzbereiche bei 22 GHz (H2O) und 60 GHz (O2).
    </p>
    <div class="w-full overflow-x-auto">
      <AttenuationChart {frequencyGHz} />
    </div>
  </section>

  <!-- Erklaerung -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Hintergrund</h2>
    <div class="space-y-4 text-slate-300">
      <div>
        <h3 class="text-lg font-medium mb-2">ITU-R P.676</h3>
        <p class="text-sm text-slate-400">
          Die ITU-R Empfehlung P.676 beschreibt ein Modell zur Berechnung der
          atmosphaerischen Daempfung durch trockene Luft (hauptsaechlich Sauerstoff)
          und Wasserdampf im Frequenzbereich von 1 GHz bis 1000 GHz.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <h3 class="text-lg font-medium mb-2 text-blue-400">Sauerstoff (O2)</h3>
          <p class="text-sm text-slate-400">
            Sauerstoff verursacht starke Absorption bei ca. 60 GHz aufgrund
            von Magnetdipoluebergaengen. Diese Region wird auch als
            "Sauerstoff-Absorptionsbande" bezeichnet und wird fuer
            sichere Kurzstreckenkommunikation genutzt.
          </p>
        </div>
        <div>
          <h3 class="text-lg font-medium mb-2 text-green-400">Wasserdampf (H2O)</h3>
          <p class="text-sm text-slate-400">
            Wasserdampf zeigt Absorptionslinien bei ca. 22 GHz und 183 GHz.
            Die Daempfung haengt stark von der Luftfeuchtigkeit ab und
            ist bei tropischen Bedingungen besonders ausgepraegt.
          </p>
        </div>
      </div>

      <div class="mt-4">
        <h3 class="text-lg font-medium mb-2">Anwendungen</h3>
        <ul class="list-disc list-inside text-sm text-slate-400 space-y-1">
          <li>Link-Budget-Berechnungen fuer Satellitenverbindungen</li>
          <li>Planung von Richtfunkstrecken</li>
          <li>Radar-Reichweitenabschaetzung</li>
          <li>5G und 6G Mobilfunknetzplanung (mmWave)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Standardbedingungen -->
  <section class="bg-slate-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Standardbedingungen</h2>
    <div class="bg-slate-900 p-4 rounded-lg">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-slate-400">
            <th class="text-left py-2">Parameter</th>
            <th class="text-left py-2">Standardwert</th>
            <th class="text-left py-2">Beschreibung</th>
          </tr>
        </thead>
        <tbody class="text-slate-300">
          <tr class="border-t border-slate-700">
            <td class="py-2">Temperatur</td>
            <td class="py-2 font-mono">15 C</td>
            <td class="py-2 text-slate-400">Standardatmosphaere (ISA)</td>
          </tr>
          <tr class="border-t border-slate-700">
            <td class="py-2">Luftdruck</td>
            <td class="py-2 font-mono">1013.25 hPa</td>
            <td class="py-2 text-slate-400">Meereshoehe</td>
          </tr>
          <tr class="border-t border-slate-700">
            <td class="py-2">Wasserdampfdichte</td>
            <td class="py-2 font-mono">7.5 g/m3</td>
            <td class="py-2 text-slate-400">Mittlere Feuchte</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>
