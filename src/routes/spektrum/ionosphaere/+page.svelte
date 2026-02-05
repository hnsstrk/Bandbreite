<script lang="ts">
  import IonosphericPropagation from '$lib/components/charts/IonosphericPropagation.svelte';
</script>

<svelte:head>
  <title>Ionosphäre - Bandbreite</title>
  <meta name="description" content="Ionosphärische Ausbreitung und Kurzwellenkommunikation: Schichten, MUF, LUF und deren Einfluss auf HF-Verbindungen." />
  <meta property="og:title" content="Ionosphäre | Bandbreite" />
  <meta property="og:description" content="Ionosphärische Ausbreitung und Kurzwellenkommunikation: Schichten, MUF, LUF und deren Einfluss auf HF-Verbindungen." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Ionosphäre | Bandbreite" />
  <meta name="twitter:description" content="Ionosphärische Ausbreitung und Kurzwellenkommunikation: Schichten, MUF, LUF und deren Einfluss auf HF-Verbindungen." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Ionosphärische Ausbreitung</h1>
    <p class="header-description">
      Visualisierung der ionosphärischen Schichten und deren Einfluss auf die Funkwellenausbreitung.
      Wichtig für Kurzwellenkommunikation und HF-Ausbreitung über große Entfernungen.
    </p>
  </header>

  <section class="propagation-section">
    <IonosphericPropagation />
  </section>

  <!-- Ionospheric Layers -->
  <section class="card">
    <h2 class="text-heading-2">Ionosphärische Schichten</h2>
    <div class="info-content">
      <p class="section-description">
        Die Ionosphäre besteht aus mehreren Schichten, die durch UV-Strahlung der Sonne ionisiert werden.
        Jede Schicht hat unterschiedliche Eigenschaften für die Funkwellenausbreitung.
      </p>

      <div class="layers-grid">
        <!-- D-Layer -->
        <article class="layer-card d-layer">
          <h3>D-Schicht</h3>
          <div class="layer-altitude">60–90 km</div>
          <div class="layer-content">
            <p>
              Die unterste ionosphärische Schicht. Entsteht durch Röntgenstrahlung der Sonne
              und verschwindet nach Sonnenuntergang sehr schnell durch die hohe Luftdichte.
            </p>
            <ul>
              <li><strong>Tag:</strong> Absorbiert niedrige HF-Frequenzen stark</li>
              <li><strong>Nacht:</strong> Löst sich vollständig auf</li>
              <li>Hauptursache der Tagesdämpfung bei MF/HF</li>
            </ul>
          </div>
        </article>

        <!-- E-Layer -->
        <article class="layer-card e-layer">
          <h3>E-Schicht</h3>
          <div class="layer-altitude">90–150 km</div>
          <div class="layer-content">
            <p>
              Reflektiert MF und untere HF-Frequenzen. Verschwindet einige Stunden
              nach Sonnenuntergang. Die sporadische E-Schicht (Es) ermöglicht VHF-Überreichweiten.
            </p>
            <ul>
              <li>Reflektiert Frequenzen bis ca. 10 MHz</li>
              <li><strong>Sporadische E:</strong> Dünne, stark ionisierte Bereiche</li>
              <li>Es-Schicht entsteht durch Metallionen von Meteoren</li>
            </ul>
          </div>
        </article>

        <!-- F1-Layer -->
        <article class="layer-card f1-layer">
          <h3>F1-Schicht</h3>
          <div class="layer-altitude">150–220 km</div>
          <div class="layer-content">
            <p>
              Nur tagsüber als separate Schicht vorhanden. Am ausgeprägtesten im Sommer
              in mittleren Breiten. Verschmilzt nachts mit der F2-Schicht zur F-Region.
            </p>
            <ul>
              <li>Tagsüber eigenständige Reflexionsschicht</li>
              <li>Beeinflusst mittlere HF-Frequenzen</li>
              <li><strong>Nachts:</strong> Teil der einheitlichen F-Region</li>
            </ul>
          </div>
        </article>

        <!-- F2-Layer -->
        <article class="layer-card f2-layer">
          <h3>F2-Schicht</h3>
          <div class="layer-altitude">220–400+ km</div>
          <div class="layer-content">
            <p>
              Die wichtigste Schicht für HF-Langstreckenkommunikation. Tag und Nacht vorhanden,
              wobei die Ionisation nachts abnimmt, aber nicht vollständig verschwindet.
            </p>
            <ul>
              <li>Bestimmt die MUF (Maximum Usable Frequency)</li>
              <li>Höhe und Dichte variieren mit Sonnenzyklus</li>
              <li>Ermöglicht weltweite HF-Kommunikation</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Key Concepts -->
  <section class="card">
    <h2 class="text-heading-2">Wichtige Konzepte</h2>

    <div class="concepts-grid">
      <div class="concept-card">
        <h4>MUF (Maximum Usable Frequency)</h4>
        <p>
          Die höchste Frequenz, die für eine bestimmte Verbindung noch von der Ionosphäre
          reflektiert wird. Wird durch die kritische Frequenz (foF2) und den Einfallswinkel bestimmt.
        </p>
        <div class="concept-formula">
          MUF ≈ foF2 × 3 (für 3000 km)
        </div>
        <p class="concept-note">
          Bei schrägem Einfall ist die MUF etwa 3× höher als die kritische Frequenz.
          Die MUF steigt mit der Sonnenaktivität.
        </p>
      </div>

      <div class="concept-card">
        <h4>LUF (Lowest Usable Frequency)</h4>
        <p>
          Die niedrigste nutzbare Frequenz, unterhalb derer die Absorption in der D-Schicht
          zu stark wird. Hängt von der Sendeleistung und Empfängerempfindlichkeit ab.
        </p>
        <div class="concept-formula">
          LUF ≈ MUF × 0.5 (typisch)
        </div>
        <p class="concept-note">
          Höhere Sendeleistung verschiebt die LUF nach unten. Nachts ist die LUF
          niedriger, da die D-Schicht fehlt.
        </p>
      </div>

      <div class="concept-card">
        <h4>Kritische Frequenz (foF2)</h4>
        <p>
          Die höchste Frequenz, die bei senkrechtem Einfall noch von der F2-Schicht
          reflektiert wird. Wird weltweit durch Ionosonden gemessen.
        </p>
        <div class="concept-formula">
          foF2 = 9 × √(N<sub>e,max</sub>) Hz
        </div>
        <p class="concept-note">
          Typische Werte: 4–14 MHz je nach Sonnenaktivität.
          N<sub>e,max</sub> = maximale Elektronendichte.
        </p>
      </div>

      <div class="concept-card">
        <h4>Tote Zone (Skip Zone)</h4>
        <p>
          Der Bereich zwischen dem Ende der Bodenwellenreichweite und dem Auftreffpunkt
          der ersten Raumwellenreflexion, in dem kein Empfang möglich ist.
        </p>
        <div class="concept-formula">
          Typisch: 200–2500 km
        </div>
        <p class="concept-note">
          Abhängig von Frequenz und Abstrahlwinkel. Höhere Frequenzen und flachere
          Winkel = größere tote Zone.
        </p>
      </div>
    </div>
  </section>

  <!-- Solar Activity -->
  <section class="card">
    <h2 class="text-heading-2">Sonnenaktivität und Funkausbreitung</h2>

    <div class="solar-content">
      <p class="section-description">
        Die Ionisation der Ionosphäre wird primär durch solare UV- und Röntgenstrahlung erzeugt.
        Der etwa 11-jährige Sonnenfleckenzyklus beeinflusst die Funkausbreitung stark.
      </p>

      <div class="solar-grid">
        <div class="solar-card minimum">
          <h4>Sonnenfleckenminimum</h4>
          <div class="sfi-range">SFI 65–80</div>
          <ul>
            <li>Niedrigere MUF (typisch 8–12 MHz)</li>
            <li>Bessere Ausbreitung auf niedrigen Bändern</li>
            <li>40m und 80m-Bänder optimal</li>
            <li>Obere HF-Bänder oft nicht nutzbar</li>
          </ul>
        </div>

        <div class="solar-card maximum">
          <h4>Sonnenfleckenmaximum</h4>
          <div class="sfi-range">SFI 150–300</div>
          <ul>
            <li>Höhere MUF (typisch 15–35 MHz)</li>
            <li>Bessere Ausbreitung auf hohen Bändern</li>
            <li>10m und 15m-Bänder optimal</li>
            <li>Gelegentlich 6m-Öffnungen</li>
          </ul>
        </div>
      </div>

      <div class="disturbance-info">
        <h4>Mögel-Dellinger-Effekt (SID)</h4>
        <p>
          Plötzliche ionosphärische Störung durch Sonneneruptionen. Massive Absorption
          aller HF-Signale auf der sonnenbeschienenen Seite der Erde für 15–60 Minuten.
          Auch bekannt als "tote Viertelstunde".
        </p>
      </div>
    </div>
  </section>

  <!-- Related -->
  <section class="card">
    <h2 class="text-heading-2">Verwandte Themen</h2>
    <div class="related-links">
      <a href="/wissen/wellenausbreitung" class="related-link">
        <span class="related-icon">📡</span>
        <div>
          <strong>Wellenausbreitung</strong>
          <p>Alle Ausbreitungsmodi im Überblick</p>
        </div>
      </a>
      <a href="/rechner/fspl" class="related-link">
        <span class="related-icon">📉</span>
        <div>
          <strong>FSPL-Rechner</strong>
          <p>Freiraumdämpfung berechnen</p>
        </div>
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
  }

  .propagation-section {
    width: 100%;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0;
    line-height: var(--line-height-relaxed);
  }

  /* Layers Grid */
  .layers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .layer-card {
    padding: 1rem;
    border-radius: var(--radius-md);
    border-left: 4px solid;
  }

  .layer-card h3 {
    margin: 0 0 0.25rem 0;
    font-size: var(--font-size-base);
  }

  .layer-altitude {
    font-size: var(--font-size-sm);
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .layer-card.d-layer {
    background: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
  }
  .layer-card.d-layer .layer-altitude { color: #ef4444; }

  .layer-card.e-layer {
    background: rgba(249, 115, 22, 0.1);
    border-color: #f97316;
  }
  .layer-card.e-layer .layer-altitude { color: #f97316; }

  .layer-card.f1-layer {
    background: rgba(34, 197, 94, 0.1);
    border-color: #22c55e;
  }
  .layer-card.f1-layer .layer-altitude { color: #22c55e; }

  .layer-card.f2-layer {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
  }
  .layer-card.f2-layer .layer-altitude { color: #3b82f6; }

  .layer-content p {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0 0 0.75rem 0;
    line-height: var(--line-height-relaxed);
  }

  .layer-content ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .layer-content li {
    margin-bottom: 0.25rem;
  }

  /* Concepts Grid */
  .concepts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .concept-card {
    padding: 1.25rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .concept-card h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .concept-card p {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0 0 0.75rem 0;
    line-height: var(--line-height-relaxed);
  }

  .concept-formula {
    font-family: var(--font-mono);
    font-size: var(--font-size-base);
    color: var(--color-accent-primary);
    padding: 0.5rem;
    background: var(--color-bg-surface);
    border-radius: var(--radius-sm);
    text-align: center;
    margin-bottom: 0.75rem;
  }

  .concept-note {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin: 0;
  }

  /* Solar Content */
  .solar-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .solar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .solar-card {
    padding: 1.25rem;
    border-radius: var(--radius-md);
  }

  .solar-card.minimum {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.15));
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .solar-card.maximum {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.15));
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .solar-card h4 {
    margin: 0 0 0.25rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .sfi-range {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin-bottom: 0.75rem;
  }

  .solar-card ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .solar-card li {
    margin-bottom: 0.25rem;
  }

  .disturbance-info {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border-left: 4px solid #ef4444;
    border-radius: var(--radius-md);
  }

  .disturbance-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-sm);
    color: #ef4444;
  }

  .disturbance-info p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  /* Related Links */
  .related-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .related-link {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .related-link:hover {
    border-color: var(--color-accent-primary);
    background: var(--color-bg-surface);
  }

  .related-icon {
    font-size: 1.5rem;
  }

  .related-link strong {
    display: block;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .related-link p {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }
</style>
