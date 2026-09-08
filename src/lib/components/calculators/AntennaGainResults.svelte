<script lang="ts">
  /**
   * Ergebnisse des Antennengewinn-Rechners: Gewinn in dBi und dBd,
   * Halbwertsbreite, Wirkfläche, Fernfeldabstand und die Einordnung
   * gegenüber dem Halbwellendipol.
   */
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatDistance, formatNumber, formatWavelength } from '$lib/utils/formatting';
  import { GAIN_DIPOLE_DBI, dbiToDbd } from '$lib/utils/antennaMath';
  import { dbToPowerRatio } from '$lib/utils/decibel';

  interface Props {
    gainDbi: number;
    beamwidthDeg: number;
    apertureM2: number;
    farFieldM: number;
    wavelengthM: number;
    diameterM: number;
  }

  let { gainDbi, beamwidthDeg, apertureM2, farFieldM, wavelengthM, diameterM }: Props = $props();

  let valid = $derived(Number.isFinite(gainDbi) && gainDbi > -Infinity && wavelengthM > 0);
  let gainFactor = $derived(dbToPowerRatio(gainDbi));
  let diameterInWavelengths = $derived(wavelengthM > 0 ? diameterM / wavelengthM : 0);
</script>

<div class="gain-results">
  <ResultCard
    label="Gewinn"
    value={valid ? formatNumber(gainDbi, 1) : '—'}
    unit="dBi"
    secondary={valid ? `${formatNumber(dbiToDbd(gainDbi), 1)} dBd` : undefined}
    hint="G = η · (π · D / λ)²"
    emphasis="hero"
  />
  <ResultCard
    label="Halbwertsbreite"
    value={valid ? formatNumber(beamwidthDeg, 2) : '—'}
    unit="Grad"
    hint="θ ≈ 70° · λ / D"
  />
  <ResultCard
    label="Wirkfläche A_eff"
    value={valid ? formatNumber(apertureM2, 3) : '—'}
    unit="m²"
    hint="A = G · λ² / 4π"
  />
  <ResultCard
    label="Fernfeld ab"
    value={valid ? formatDistance(farFieldM) : '—'}
    hint="r = 2 · D² / λ — davor gilt die Gewinnangabe nicht."
  />
  <ResultCard
    label="Leistungsfaktor"
    value={valid ? formatNumber(gainFactor, 0) : '—'}
    unit="×"
    hint="gegenüber dem Kugelstrahler in Hauptstrahlrichtung"
    copyable={false}
  />
  <ResultCard
    label="Wellenlänge"
    value={valid ? formatWavelength(wavelengthM) : '—'}
    secondary={valid ? `D = ${formatNumber(diameterInWavelengths, 1)} λ` : undefined}
    hint="λ = c / f"
    copyable={false}
  />
</div>

<p class="gain-note">
  Der Bezug entscheidet über die Zahl: dBi zählt gegenüber dem isotropen Kugelstrahler, dBd gegenüber dem
  Halbwellendipol. Zwischen beiden liegen genau {formatNumber(GAIN_DIPOLE_DBI, 2)} dB — der Gewinn des Dipols selbst.
</p>

<style>
  .gain-results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 0.75rem;
  }

  .gain-note {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
