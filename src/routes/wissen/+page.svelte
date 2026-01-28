<script lang="ts">
  interface KnowledgeSection {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    status: 'available' | 'coming-soon';
    topics: string[];
  }

  const sections: KnowledgeSection[] = [
    {
      id: 'wellenausbreitung',
      title: 'Wellenausbreitung',
      description: 'Wie breiten sich Funkwellen aus? Bodenwelle, Raumwelle, Sichtverbindung und ionosphärische Reflexion.',
      href: '/wissen/wellenausbreitung',
      icon: '📡',
      status: 'available',
      topics: ['Bodenwelle', 'Raumwelle', 'Line-of-Sight', 'Sporadische E', 'MUF/LUF', 'Tote Zone']
    },
    {
      id: 'frequenzbaender',
      title: 'Frequenzbänder',
      description: 'Detaillierte Übersicht aller Frequenzbänder von ELF bis EHF mit Anwendungen und Eigenschaften.',
      href: '/wissen/frequenzbaender',
      icon: '📊',
      status: 'available',
      topics: ['ITU-Bänder', 'IEEE-Bänder', 'NATO-Bänder', 'Amateurfunkbänder', 'Rundfunkbänder']
    },
    {
      id: 'mathematik',
      title: 'RF-Mathematik',
      description: 'Wichtige Formeln der Hochfrequenztechnik mit Herleitung und praktischen Beispielen.',
      href: '/wissen/mathematik',
      icon: '🔢',
      status: 'available',
      topics: ['FSPL', 'Radargleichung', 'Shannon-Hartley', 'Radiohorizont', 'Dezibel-Rechnung']
    },
    {
      id: 'radar',
      title: 'Radar-Grundlagen',
      description: 'Funktionsprinzip von Radar, Reichweite, RCS und verschiedene Radar-Typen.',
      href: '/wissen/radar',
      icon: '🎯',
      status: 'coming-soon',
      topics: ['Pulsradar', 'Doppler-Radar', 'FMCW', 'Radargleichung', 'RCS']
    },
    {
      id: 'antennen',
      title: 'Antennen',
      description: 'Antennentypen, Gewinn, Richtcharakteristik und Anpassung.',
      href: '/wissen/antennen',
      icon: '📶',
      status: 'coming-soon',
      topics: ['Dipol', 'Yagi', 'Parabolantenne', 'Phased Array', 'EIRP']
    },
    {
      id: 'modulation',
      title: 'Modulation',
      description: 'Analoge und digitale Modulationsverfahren für Funk und Kommunikation.',
      href: '/wissen/modulation',
      icon: '〰️',
      status: 'coming-soon',
      topics: ['AM', 'FM', 'SSB', 'QAM', 'OFDM', 'PSK']
    }
  ];

  const availableSections = sections.filter(s => s.status === 'available');
  const comingSoonSections = sections.filter(s => s.status === 'coming-soon');
</script>

<svelte:head>
  <title>RF-Wissen - Bandbreite</title>
  <meta name="description" content="Umfassendes Nachschlagewerk für Funk- und Hochfrequenztechnik: Wellenausbreitung, Frequenzbänder, RF-Mathematik und mehr." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">RF-Nachschlagewerk</h1>
    <p class="header-description">
      Umfassendes Wissen zur Funk- und Hochfrequenztechnik.
      Von der Wellenausbreitung über Frequenzbänder bis zu praktischen Formeln.
    </p>
  </header>

  <!-- Available Sections -->
  {#if availableSections.length > 0}
    <section class="sections-grid">
      {#each availableSections as section (section.id)}
        <a href={section.href} class="section-card available">
          <div class="section-icon">{section.icon}</div>
          <div class="section-content">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <div class="topics">
              {#each section.topics.slice(0, 4) as topic (topic)}
                <span class="topic-tag">{topic}</span>
              {/each}
              {#if section.topics.length > 4}
                <span class="topic-more">+{section.topics.length - 4}</span>
              {/if}
            </div>
          </div>
          <div class="section-arrow">→</div>
        </a>
      {/each}
    </section>
  {/if}

  <!-- Coming Soon -->
  {#if comingSoonSections.length > 0}
    <section class="coming-soon-section">
      <h2 class="text-heading-2">Geplante Inhalte</h2>
      <p class="section-intro">
        Diese Themen werden in zukünftigen Versionen hinzugefügt.
      </p>

      <div class="coming-soon-grid">
        {#each comingSoonSections as section (section.id)}
          <div class="section-card coming-soon">
            <div class="section-icon">{section.icon}</div>
            <div class="section-content">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <div class="topics">
                {#each section.topics.slice(0, 3) as topic (topic)}
                  <span class="topic-tag">{topic}</span>
                {/each}
              </div>
            </div>
            <div class="coming-soon-badge">Bald verfügbar</div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Quick Reference -->
  <section class="card">
    <h2 class="text-heading-2">Schnellreferenz</h2>

    <div class="quick-ref-grid">
      <div class="quick-ref-card">
        <h4>Frequenzbereiche</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>ELF</td><td>3–30 Hz</td></tr>
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
        <h4>Wichtige Formeln</h4>
        <div class="formula-list">
          <div class="formula-item">
            <span class="formula-name">Wellenlänge:</span>
            <span class="formula-eq">λ = c / f</span>
          </div>
          <div class="formula-item">
            <span class="formula-name">FSPL:</span>
            <span class="formula-eq">20·log(d) + 20·log(f) + K</span>
          </div>
          <div class="formula-item">
            <span class="formula-name">Radiohorizont:</span>
            <span class="formula-eq">d = √(2·k·R·h)</span>
          </div>
          <div class="formula-item">
            <span class="formula-name">Shannon:</span>
            <span class="formula-eq">C = B·log₂(1+SNR)</span>
          </div>
        </div>
      </div>

      <div class="quick-ref-card">
        <h4>Physikalische Konstanten</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>Lichtgeschwindigkeit</td><td>299.792.458 m/s</td></tr>
            <tr><td>Erdradius</td><td>6.371 km</td></tr>
            <tr><td>Refraktionsfaktor k</td><td>≈ 4/3</td></tr>
            <tr><td>Boltzmann-Konstante</td><td>1,38·10⁻²³ J/K</td></tr>
          </tbody>
        </table>
      </div>

      <div class="quick-ref-card">
        <h4>dB-Umrechnung</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>3 dB</td><td>× 2 (Leistung)</td></tr>
            <tr><td>6 dB</td><td>× 4 (Leistung)</td></tr>
            <tr><td>10 dB</td><td>× 10 (Leistung)</td></tr>
            <tr><td>20 dB</td><td>× 100 (Leistung)</td></tr>
            <tr><td>30 dB</td><td>× 1000 (Leistung)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Related Resources -->
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
      <a href="/spektrum/ionosphaere" class="tool-link">
        <strong>Ionosphäre</strong>
        <span>Ionosphärische Schichten</span>
      </a>
      <a href="/spektrum/explorer" class="tool-link">
        <strong>Frequenzband-Explorer</strong>
        <span>Interaktive Bandübersicht</span>
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

  .section-card.available:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .section-card.coming-soon {
    opacity: 0.7;
    position: relative;
  }

  .section-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .section-content {
    flex: 1;
  }

  .section-content h2,
  .section-content h3 {
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

  .topic-more {
    padding: 0.25rem 0.625rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .section-arrow {
    font-size: 1.5rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
  }

  .section-card.available:hover .section-arrow {
    transform: translateX(4px);
    color: var(--color-accent-primary);
  }

  /* Coming Soon */
  .coming-soon-section {
    margin-top: 1rem;
  }

  .section-intro {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin-bottom: 1rem;
  }

  .coming-soon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .coming-soon-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
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

  .formula-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .formula-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
  }

  .formula-name {
    color: var(--color-text-secondary);
  }

  .formula-eq {
    font-family: var(--font-mono);
    color: var(--color-accent-primary);
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
