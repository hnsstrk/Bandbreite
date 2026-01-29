<script lang="ts">
  import SpectrumBar from '$lib/components/charts/SpectrumBar.svelte';

  interface SpectrumSection {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    topics: string[];
  }

  const sections: SpectrumSection[] = [
    {
      id: 'explorer',
      title: 'Frequenzband-Explorer',
      description: 'Interaktive Übersicht aller Frequenzbänder. Vergleichen Sie ITU, IEEE und NATO Bandbezeichnungen und erkunden Sie typische Anwendungen.',
      href: '/spektrum/explorer',
      icon: '🔍',
      topics: ['ITU-Bänder', 'IEEE-Bänder', 'NATO-Bänder', 'Frequenzbereiche']
    },
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
  <header class="page-header">
    <h1 class="text-heading-1">Elektromagnetisches Spektrum</h1>
    <p class="header-description">
      Entdecken Sie das elektromagnetische Spektrum von Radiowellen bis Gammastrahlung.
      Erkunden Sie Frequenzbänder, deren Eigenschaften und praktische Anwendungen in der Funktechnik.
    </p>
  </header>

  <!-- Spectrum Overview Visualization -->
  <section class="card">
    <h2 class="text-heading-2">Spektrum-Übersicht</h2>
    <p class="section-intro">
      Das elektromagnetische Spektrum umfasst alle Frequenzen elektromagnetischer Strahlung.
      Die technisch genutzten Frequenzbänder reichen von wenigen Hertz bis zu mehreren Terahertz.
    </p>
    <div class="spectrum-container">
      <SpectrumBar showLabels={true} />
    </div>
  </section>

  <!-- Introduction -->
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

  <!-- Section Cards -->
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

  <!-- Quick Reference -->
  <section class="card">
    <h2 class="text-heading-2">Frequenzbereiche im Überblick</h2>
    <div class="quick-ref-grid">
      <div class="quick-ref-card">
        <h4>ITU-Frequenzbänder</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>ELF</td><td>3–30 Hz</td></tr>
            <tr><td>SLF</td><td>30–300 Hz</td></tr>
            <tr><td>ULF</td><td>300 Hz – 3 kHz</td></tr>
            <tr><td>VLF</td><td>3–30 kHz</td></tr>
            <tr><td>LF</td><td>30–300 kHz</td></tr>
            <tr><td>MF</td><td>300 kHz – 3 MHz</td></tr>
            <tr><td>HF</td><td>3–30 MHz</td></tr>
            <tr><td>VHF</td><td>30–300 MHz</td></tr>
            <tr><td>UHF</td><td>300 MHz – 3 GHz</td></tr>
            <tr><td>SHF</td><td>3–30 GHz</td></tr>
            <tr><td>EHF</td><td>30–300 GHz</td></tr>
          </tbody>
        </table>
      </div>

      <div class="quick-ref-card">
        <h4>IEEE-Radar-Bänder</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>L-Band</td><td>1–2 GHz</td></tr>
            <tr><td>S-Band</td><td>2–4 GHz</td></tr>
            <tr><td>C-Band</td><td>4–8 GHz</td></tr>
            <tr><td>X-Band</td><td>8–12 GHz</td></tr>
            <tr><td>Ku-Band</td><td>12–18 GHz</td></tr>
            <tr><td>K-Band</td><td>18–27 GHz</td></tr>
            <tr><td>Ka-Band</td><td>27–40 GHz</td></tr>
            <tr><td>V-Band</td><td>40–75 GHz</td></tr>
            <tr><td>W-Band</td><td>75–110 GHz</td></tr>
          </tbody>
        </table>
      </div>

      <div class="quick-ref-card">
        <h4>Typische Anwendungen</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>AM-Rundfunk</td><td>530 kHz – 1,7 MHz</td></tr>
            <tr><td>Kurzwelle</td><td>3–30 MHz</td></tr>
            <tr><td>UKW-Radio</td><td>87,5–108 MHz</td></tr>
            <tr><td>DVB-T</td><td>470–790 MHz</td></tr>
            <tr><td>LTE</td><td>700 MHz – 2,6 GHz</td></tr>
            <tr><td>WLAN 2,4 GHz</td><td>2,4–2,5 GHz</td></tr>
            <tr><td>WLAN 5 GHz</td><td>5,15–5,85 GHz</td></tr>
            <tr><td>5G mmWave</td><td>24–40 GHz</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Related Tools -->
  <section class="card">
    <h2 class="text-heading-2">Verwandte Werkzeuge</h2>
    <div class="tools-grid">
      <a href="/rechner/fspl" class="tool-link">
        <strong>FSPL-Rechner</strong>
        <span>Freiraumdämpfung berechnen</span>
      </a>
      <a href="/rechner/link-budget" class="tool-link">
        <strong>Link Budget</strong>
        <span>Signalpfad-Analyse</span>
      </a>
      <a href="/konverter/frequenz" class="tool-link">
        <strong>Frequenzkonverter</strong>
        <span>Frequenz und Wellenlänge</span>
      </a>
      <a href="/wissen/wellenausbreitung" class="tool-link">
        <strong>Wellenausbreitung</strong>
        <span>Ausbreitungsmodi verstehen</span>
      </a>
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
    max-width: 65ch;
  }

  .section-intro {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin-bottom: 1.5rem;
    line-height: var(--line-height-relaxed);
  }

  .spectrum-container {
    margin-top: 1rem;
  }

  /* Introduction Grid */
  .intro-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

  /* Quick Reference */
  .quick-ref-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .quick-ref-card {
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .quick-ref-card h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .ref-table {
    width: 100%;
    font-size: var(--font-size-xs);
  }

  .ref-table td {
    padding: 0.25rem 0;
    color: var(--color-text-secondary);
  }

  .ref-table td:first-child {
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .ref-table td:last-child {
    text-align: right;
    font-family: var(--font-mono);
  }

  /* Tools Grid */
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .tool-link {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .tool-link:hover {
    border-color: var(--color-accent-primary);
    background: var(--color-bg-surface);
  }

  .tool-link strong {
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .tool-link span {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }
</style>
