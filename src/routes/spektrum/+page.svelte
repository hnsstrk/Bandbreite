<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import SpectrumOverview from '$lib/components/SpectrumOverview.svelte';
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import PowerConverter from '$lib/components/converters/PowerConverter.svelte';
  import RangeCalculator from '$lib/components/converters/RangeCalculator.svelte';
  import BandDetailSidebar from '$lib/components/BandDetailSidebar.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import { getHubChildren } from '$lib/data/navigation';
  import { SPECTRUM_DEFAULT_FREQUENCY_HZ, SPECTRUM_MIN_HZ, SPECTRUM_MAX_GAMMA_HZ } from '$lib/data/spectrum';
  import { shouldScrollToBandDetail, scrollBehaviorFor } from '$lib/components/spectrumScroll';
  import type { FrequencyBand } from '$lib/data/bands';

  /**
   * Startfrequenz aus `?f=<Hertz>` — darauf zeigt „Im Spektrum öffnen" in der
   * Befehlspalette und in den Datenbanken. Beim Prerendern ist `searchParams`
   * gesperrt, deshalb der `browser`-Zweig; unplausible Werte werden verworfen.
   */
  function frequencyFromUrl(): number | null {
    if (!browser) return null;
    const raw = page.url.searchParams.get('f');
    if (!raw) return null;
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) return null;
    if (value < SPECTRUM_MIN_HZ || value > SPECTRUM_MAX_GAMMA_HZ) return null;
    return value;
  }

  /**
   * Ohne `?f=` startet die Seite auf 100 MHz (`SPECTRUM_DEFAULT_FREQUENCY_HZ`):
   * Marker, Frequenzkonverter und Bandseitenleiste zeigen sofort einen
   * sinnvollen Arbeitspunkt im VHF-Band. Ein gültiges `?f=` hat Vorrang.
   */
  let currentFrequencyHz = $state<number | null>(frequencyFromUrl() ?? SPECTRUM_DEFAULT_FREQUENCY_HZ);
  let currentPowerWatt = $state<number | null>(1);
  let selectedSpectrumBand = $state<FrequencyBand | null>(null);
  let selectedBandId = $state<string | null>(null);

  let bandDetailColumn = $state<HTMLDivElement | null>(null);

  function handleBandClick(band: FrequencyBand) {
    selectedSpectrumBand = band;
    selectedBandId = band.id;
    currentFrequencyHz = Math.sqrt(band.minHz * band.maxHz);
    scrollToBandDetail();
  }

  /**
   * Unter 1024 px liegt die Banddetail-Spalte unter den Werkzeugen; nach einem
   * Tipp auf ein Band holt die Seite sie in den Blick (ohne Animation, wenn
   * der Nutzer weniger Bewegung wünscht).
   */
  function scrollToBandDetail() {
    if (!browser || !bandDetailColumn) return;
    if (!shouldScrollToBandDetail(window.innerWidth)) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bandDetailColumn.scrollIntoView({ behavior: scrollBehaviorFor(reduced), block: 'start' });
  }

  // Unterseiten stammen aus der Navigations-Registry (Single Source of Truth).
  const sections = getHubChildren('/spektrum/');
</script>

<div class="page-content">
  <h1 class="text-heading-1">Elektromagnetisches Spektrum</h1>
  <p class="sr-only">Klicken Sie auf ein Band für detaillierte Informationen.</p>

  <SpectrumOverview frequencyHz={currentFrequencyHz ?? undefined} onBandClick={handleBandClick} {selectedBandId} />

  <!-- Dashboard: Werkzeuge links, Banddetail rechts -->
  <div class="dashboard-layout">
    <div class="tools-column">
      <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
      <PowerConverter bind:powerWatt={currentPowerWatt} />
      <RangeCalculator frequencyHz={currentFrequencyHz} />
    </div>
    <div class="sidebar-column" bind:this={bandDetailColumn} id="banddetail">
      <BandDetailSidebar frequencyHz={currentFrequencyHz} selectedBand={selectedSpectrumBand} />
    </div>
  </div>

  <nav class="next-links" aria-label="Unterseiten des Spektrums">
    <span class="next-links__label">Weiter:</span>
    {#each sections as section, index (section.id)}
      {#if index > 0}<span class="next-links__sep" aria-hidden="true">·</span>{/if}
      <a href={section.href}>{section.label}</a>
    {/each}
  </nav>

  <RelatedTopics href="/spektrum/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 var(--page-gutter, 1rem);
  }

  .dashboard-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 64rem) {
    .dashboard-layout {
      grid-template-columns: 55fr 45fr;
      align-items: start;
    }
  }

  .tools-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }

  .sidebar-column {
    min-width: 0;
  }

  .next-links {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-line-subtle);
    font-size: var(--font-size-sm);
  }

  .next-links__label {
    color: var(--color-ink-subtle);
  }

  .next-links a {
    color: var(--color-brand);
  }

  .next-links__sep {
    color: var(--color-ink-subtle);
  }
</style>
