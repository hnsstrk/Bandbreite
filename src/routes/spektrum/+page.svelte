<script lang="ts">
  import SpectrumOverview from '$lib/components/SpectrumOverview.svelte';
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import PowerConverter from '$lib/components/converters/PowerConverter.svelte';
  import RangeCalculator from '$lib/components/converters/RangeCalculator.svelte';
  import BandDetailSidebar from '$lib/components/BandDetailSidebar.svelte';
  import PowerDbChart from '$lib/components/charts/PowerDbChart.svelte';
  import AtmosphericInputs from '$lib/components/converters/AtmosphericInputs.svelte';
  import AttenuationChart from '$lib/components/charts/AttenuationChart.svelte';
  import type { FrequencyBand } from '$lib/data/bands';

  interface SpectrumSection {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    topics: string[];
  }

  let currentFrequencyHz = $state<number | null>(null);
  let currentPowerWatt = $state<number | null>(1);
  let selectedSpectrumBand = $state<FrequencyBand | null>(null);
  let selectedBandId = $state<string | null>(null);

  function handleBandClick(band: FrequencyBand) {
    selectedSpectrumBand = band;
    selectedBandId = band.id;
    currentFrequencyHz = Math.sqrt(band.minHz * band.maxHz);
  }

  const sections: SpectrumSection[] = [
    {
      id: 'ionosphaere',
      title: 'Ionosphärische Ausbreitung',
      description: 'Ionosphärische Schichten und deren Einfluss auf die Funkwellenausbreitung. Wichtig für HF-Kommunikation über große Entfernungen.',
      href: '/spektrum/ionosphaere',
      icon: '🌐',
      topics: ['D-Schicht', 'E-Schicht', 'F-Schicht', 'MUF/LUF', 'Raumwelle']
    },
    {
      id: 'anwendungen',
      title: 'Anwendungen nach Frequenzband',
      description: 'Übersicht der typischen Anwendungen und Dienste in verschiedenen Frequenzbändern. Von Rundfunk bis Satellitenkommunikation.',
      href: '/spektrum/anwendungen',
      icon: '📻',
      topics: ['Rundfunk', 'Mobilfunk', 'Radar', 'Satelliten', 'WLAN']
    }
  ];
</script>

<svelte:head>
  <title>Spektrum - Bandbreite</title>
  <meta name="description" content="Übersicht über das elektromagnetische Spektrum: Frequenzbänder, ionosphärische Ausbreitung und Anwendungen im Funkspektrum." />
</svelte:head>

<div class="page-content">
  <!-- Page Header -->
  <header class="page-header">
    <h1 class="text-heading-1">Elektromagnetisches Spektrum</h1>
    <p class="header-description">
      Entdecken Sie das elektromagnetische Spektrum von Radiowellen bis Gammastrahlung.
      Erkunden Sie Frequenzbänder, deren Eigenschaften und praktische Anwendungen in der Funktechnik.
    </p>
  </header>

  <!-- EM-Spektrum Hauptvisualisierung -->
  <section class="card">
    <h2 class="text-heading-2">EM-Spektrum Übersicht</h2>
    <p class="spectrum-hint">Klicken Sie auf ein Band für detaillierte Informationen</p>
    <SpectrumOverview
      frequencyHz={currentFrequencyHz ?? undefined}
      onBandClick={handleBandClick}
      {selectedBandId}
    />
  </section>

  <!-- Dashboard: Tools links, Banddetail rechts -->
  <div class="dashboard-layout">
    <div class="tools-column">
      <FrequencyConverter bind:frequencyHz={currentFrequencyHz} />
      <PowerConverter bind:powerWatt={currentPowerWatt} />
      <RangeCalculator frequencyHz={currentFrequencyHz} />

      <section class="card">
        <h2 class="text-heading-2">Grundlagen</h2>
        <div class="intro-grid">
          <div class="intro-card">
            <h4>Frequenz und Wellenlänge</h4>
            <p>
              Elektromagnetische Wellen breiten sich mit Lichtgeschwindigkeit aus.
              Frequenz und Wellenlänge sind über die Beziehung <span class="formula">λ = c / f</span> verknüpft.
              Höhere Frequenzen bedeuten kürzere Wellenlängen.
            </p>
          </div>
          <div class="intro-card">
            <h4>Ausbreitungseigenschaften</h4>
            <p>
              Niedrige Frequenzen folgen der Erdkrümmung und durchdringen Hindernisse.
              Hohe Frequenzen breiten sich geradlinig aus, werden aber von Gebäuden und
              Vegetation stark gedämpft.
            </p>
          </div>
          <div class="intro-card">
            <h4>Bandbreite und Datenrate</h4>
            <p>
              Höhere Frequenzbänder bieten mehr Bandbreite für schnellere Datenübertragung.
              Nach Shannon-Hartley steigt die Kanalkapazität mit der verfügbaren Bandbreite.
            </p>
          </div>
          <div class="intro-card">
            <h4>Atmosphärische Dämpfung</h4>
            <p>
              Die Atmosphäre absorbiert bestimmte Frequenzen stark. Besonders bei 22 GHz
              (Wasserdampf) und 60 GHz (Sauerstoff) treten Absorptionspeaks auf.
            </p>
          </div>
        </div>
      </section>
    </div>
    <div class="sidebar-column">
      <BandDetailSidebar
        frequencyHz={currentFrequencyHz}
        selectedBand={selectedSpectrumBand}
      />
    </div>
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

  <!-- Sub-page Links -->
  <section class="sections-grid">
    {#each sections as section (section.id)}
      <a href={section.href} class="section-card">
        <div class="section-icon">{section.icon}</div>
        <div class="section-content">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
          <div class="topics">
            {#each section.topics as topic (topic)}
              <span class="topic-tag">{topic}</span>
            {/each}
          </div>
        </div>
        <div class="section-arrow">→</div>
      </a>
    {/each}
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
    max-width: 65ch;
  }

  .spectrum-hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin: 0 0 0.5rem 0;
  }

  .dashboard-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .dashboard-layout {
      grid-template-columns: 55fr 45fr;
      align-items: start;
    }
  }

  .tools-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .sidebar-column {
    min-width: 0;
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

  /* Grundlagen Grid */
  .intro-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .intro-card {
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .intro-card h4 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .intro-card p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .formula {
    font-family: var(--font-mono);
    color: var(--color-accent-primary);
    padding: 0.125rem 0.375rem;
    background: var(--color-bg-surface);
    border-radius: var(--radius-sm);
  }

  /* Section Cards */
  .sections-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-card {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .section-card:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .section-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .section-content {
    flex: 1;
  }

  .section-content h2 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  .section-content p {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .topics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .topic-tag {
    padding: 0.25rem 0.625rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .section-arrow {
    font-size: 1.5rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
  }

  .section-card:hover .section-arrow {
    transform: translateX(4px);
    color: var(--color-accent-primary);
  }
</style>
