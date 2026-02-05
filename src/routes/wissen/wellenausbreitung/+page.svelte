<script lang="ts">
  import WavePropagationDiagram from '$lib/components/charts/WavePropagationDiagram.svelte';
  import { FREQUENCY_BAND_PROPAGATION } from '$lib/data/propagation';
</script>

<svelte:head>
  <title>Wellenausbreitung - Bandbreite</title>
  <meta name="description" content="Umfassendes Nachschlagewerk zur Funkwellenausbreitung: Bodenwelle, Raumwelle, Sichtverbindung und ionosphärische Reflexion." />
  <meta property="og:title" content="Wellenausbreitung | Bandbreite" />
  <meta property="og:description" content="Umfassendes Nachschlagewerk zur Funkwellenausbreitung: Bodenwelle, Raumwelle, Sichtverbindung und ionosphärische Reflexion." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Wellenausbreitung | Bandbreite" />
  <meta name="twitter:description" content="Umfassendes Nachschlagewerk zur Funkwellenausbreitung: Bodenwelle, Raumwelle, Sichtverbindung und ionosphärische Reflexion." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Wellenausbreitung</h1>
    <p class="header-description">
      Funkwellen breiten sich je nach Frequenz auf unterschiedliche Weise aus.
      Dieses interaktive Diagramm visualisiert die wichtigsten Ausbreitungsmodi
      und deren Abhängigkeit von Ionosphäre, Tageszeit und Frequenz.
    </p>
  </header>

  <!-- Interactive Diagram -->
  <section class="diagram-section">
    <WavePropagationDiagram />
  </section>

  <!-- Propagation Modes Overview -->
  <section class="card">
    <h2 class="text-heading-2">Ausbreitungsmodi im Überblick</h2>

    <div class="modes-grid">
      <!-- Ground Wave -->
      <article class="mode-card">
        <div class="mode-header mode-ground">
          <h3>Bodenwelle</h3>
          <span class="mode-english">Ground Wave</span>
        </div>
        <div class="mode-content">
          <p>
            Die Bodenwelle folgt der gekrümmten Erdoberfläche durch Beugung.
            Sie ist besonders bei niedrigen Frequenzen (LF, MF) effektiv und
            bietet eine zuverlässige Verbindung unabhängig von der Tageszeit.
          </p>
          <div class="mode-specs">
            <div class="spec">
              <span class="spec-label">Frequenzen:</span>
              <span class="spec-value">30 kHz – 3 MHz</span>
            </div>
            <div class="spec">
              <span class="spec-label">Reichweite:</span>
              <span class="spec-value">30 – 300 km</span>
            </div>
            <div class="spec">
              <span class="spec-label">Dämpfung:</span>
              <span class="spec-value">Hängt von Bodenleitfähigkeit ab</span>
            </div>
          </div>
          <div class="mode-characteristics">
            <strong>Eigenschaften:</strong>
            <ul>
              <li>Zuverlässig bei Tag und Nacht</li>
              <li>Seewasser hat geringste Dämpfung</li>
              <li>Höhere Frequenzen = kürzere Reichweite</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- Sky Wave -->
      <article class="mode-card">
        <div class="mode-header mode-sky">
          <h3>Raumwelle</h3>
          <span class="mode-english">Sky Wave</span>
        </div>
        <div class="mode-content">
          <p>
            Die Raumwelle wird an den ionosphärischen Schichten reflektiert und
            ermöglicht Funkverbindungen über tausende Kilometer. Durch mehrfache
            Reflexion (Multi-Hop) sind weltweite Verbindungen möglich.
          </p>
          <div class="mode-specs">
            <div class="spec">
              <span class="spec-label">Frequenzen:</span>
              <span class="spec-value">3 – 30 MHz (HF/Kurzwelle)</span>
            </div>
            <div class="spec">
              <span class="spec-label">Reichweite:</span>
              <span class="spec-value">500 – 20.000 km</span>
            </div>
            <div class="spec">
              <span class="spec-label">Sprungdistanz:</span>
              <span class="spec-value">1.500 – 4.000 km pro Hop</span>
            </div>
          </div>
          <div class="mode-characteristics">
            <strong>Wichtige Konzepte:</strong>
            <ul>
              <li><strong>MUF:</strong> Maximum Usable Frequency – höchste nutzbare Frequenz</li>
              <li><strong>LUF:</strong> Lowest Usable Frequency – niedrigste nutzbare Frequenz</li>
              <li><strong>Tote Zone:</strong> Bereich ohne Empfang zwischen Boden- und Raumwelle</li>
              <li><strong>Sonnenaktivität:</strong> Beeinflusst MUF stark (11-Jahres-Zyklus)</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- Line-of-Sight -->
      <article class="mode-card">
        <div class="mode-header mode-los">
          <h3>Sichtverbindung</h3>
          <span class="mode-english">Line-of-Sight (LOS)</span>
        </div>
        <div class="mode-content">
          <p>
            Bei VHF und höheren Frequenzen durchdringen die Wellen die Ionosphäre
            und werden nicht reflektiert. Die Reichweite ist durch den Radiohorizont
            begrenzt – ähnlich wie beim sichtbaren Licht.
          </p>
          <div class="mode-specs">
            <div class="spec">
              <span class="spec-label">Frequenzen:</span>
              <span class="spec-value">&gt; 30 MHz (VHF, UHF, SHF)</span>
            </div>
            <div class="spec">
              <span class="spec-label">Reichweite:</span>
              <span class="spec-value">10 – 200 km</span>
            </div>
            <div class="spec">
              <span class="spec-label">Formel:</span>
              <span class="spec-value">d = √(2·k·R·h)</span>
            </div>
          </div>
          <div class="mode-characteristics">
            <strong>Radiohorizont:</strong>
            <ul>
              <li>Refraktionsfaktor k ≈ 4/3 (4/3-Erde-Modell)</li>
              <li>Erhöhung der Antenne verlängert Reichweite</li>
              <li>Fresnel-Zonen-Freiheit beachten</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- Sporadic E -->
      <article class="mode-card">
        <div class="mode-header mode-sporadic">
          <h3>Sporadische E-Schicht</h3>
          <span class="mode-english">Sporadic E (Es)</span>
        </div>
        <div class="mode-content">
          <p>
            Temporäre, stark ionisierte Bereiche in der E-Schicht (ca. 100 km Höhe)
            können VHF-Signale reflektieren und unerwartete Überreichweiten
            ermöglichen – besonders im Sommer.
          </p>
          <div class="mode-specs">
            <div class="spec">
              <span class="spec-label">Frequenzen:</span>
              <span class="spec-value">30 – 150 MHz</span>
            </div>
            <div class="spec">
              <span class="spec-label">Reichweite:</span>
              <span class="spec-value">500 – 2.300 km</span>
            </div>
            <div class="spec">
              <span class="spec-label">Saison:</span>
              <span class="spec-value">Mai – August (Nordhalbkugel)</span>
            </div>
          </div>
          <div class="mode-characteristics">
            <strong>Ursachen:</strong>
            <ul>
              <li>Metallionen von verglühenden Meteoriten</li>
              <li>Windscherungen in der Mesosphäre</li>
              <li>Nicht vorhersagbar, aber statistisch erfassbar</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- Frequency Bands and Propagation -->
  <section class="card">
    <h2 class="text-heading-2">Frequenzbänder und Ausbreitung</h2>
    <p class="section-description">
      Jedes Frequenzband hat charakteristische Ausbreitungseigenschaften,
      die Tag und Nacht unterschiedlich sein können.
    </p>

    <div class="bands-table-container">
      <table class="bands-table">
        <thead>
          <tr>
            <th>Band</th>
            <th>Frequenz</th>
            <th>Wellenlänge</th>
            <th>Primäre Modi</th>
            <th>Tagverhalten</th>
            <th>Nachtverhalten</th>
          </tr>
        </thead>
        <tbody>
          {#each FREQUENCY_BAND_PROPAGATION as band (band.id)}
            <tr>
              <td>
                <strong>{band.nameDE}</strong>
                <div class="band-english">{band.name}</div>
              </td>
              <td class="mono">
                {(band.frequencyRangeHz.min / 1e6).toLocaleString()} –
                {(band.frequencyRangeHz.max / 1e6).toLocaleString()} MHz
              </td>
              <td>{band.wavelengthRange}</td>
              <td>
                {#each band.primaryModes as mode, i (mode)}
                  <span class="mode-tag">{mode === 'ground-wave' ? 'Bodenwelle' : mode === 'sky-wave' ? 'Raumwelle' : mode === 'line-of-sight' ? 'LOS' : mode === 'sporadic-e' ? 'Es' : mode}</span>
                  {#if i < band.primaryModes.length - 1}, {/if}
                {/each}
              </td>
              <td>{band.dayBehavior}</td>
              <td>{band.nightBehavior}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <!-- Formulas Section -->
  <section class="card">
    <h2 class="text-heading-2">Wichtige Formeln</h2>

    <div class="formulas-grid">
      <div class="formula-card">
        <h4>Radiohorizont</h4>
        <div class="formula">d = √(2·k·R·h)</div>
        <div class="formula-vars">
          <p>d = Distanz zum Horizont [km]</p>
          <p>k = Refraktionsfaktor ≈ 4/3</p>
          <p>R = Erdradius ≈ 6.371 km</p>
          <p>h = Antennenhöhe [km]</p>
        </div>
        <div class="formula-example">
          <strong>Beispiel:</strong> h = 100 m → d ≈ 41 km
        </div>
      </div>

      <div class="formula-card">
        <h4>Plasmafrequenz</h4>
        <div class="formula">f<sub>p</sub> = 9·√(N<sub>e</sub>)</div>
        <div class="formula-vars">
          <p>f<sub>p</sub> = Plasmafrequenz [Hz]</p>
          <p>N<sub>e</sub> = Elektronendichte [e⁻/m³]</p>
        </div>
        <div class="formula-example">
          <strong>Kritische Frequenz:</strong> foF2 ≈ 4–14 MHz
        </div>
      </div>

      <div class="formula-card">
        <h4>Maximum Usable Frequency</h4>
        <div class="formula">MUF = foF2 × M(d)</div>
        <div class="formula-vars">
          <p>foF2 = Kritische Frequenz der F2-Schicht</p>
          <p>M(d) = MUF-Faktor (≈3 für 3000 km)</p>
        </div>
        <div class="formula-example">
          <strong>Beispiel:</strong> foF2 = 5 MHz, M = 3 → MUF = 15 MHz
        </div>
      </div>

      <div class="formula-card">
        <h4>Snelliussches Brechungsgesetz</h4>
        <div class="formula">n₁·sin(θ₁) = n₂·sin(θ₂)</div>
        <div class="formula-vars">
          <p>n = Brechungsindex</p>
          <p>θ = Einfalls-/Ausfallswinkel</p>
        </div>
        <div class="formula-example">
          Erklärt die Reflexion an ionisierten Schichten
        </div>
      </div>
    </div>
  </section>

  <!-- Day/Night Behavior -->
  <section class="card">
    <h2 class="text-heading-2">Tag- und Nachtverhalten</h2>

    <div class="day-night-grid">
      <div class="daytime-box">
        <h4>Tag</h4>
        <ul>
          <li><strong>D-Schicht aktiv:</strong> Absorbiert niedrige HF-Frequenzen</li>
          <li><strong>E-Schicht stark:</strong> Reflektiert MF und untere HF</li>
          <li><strong>F1-Schicht vorhanden:</strong> Separate Reflexionsschicht</li>
          <li><strong>F2-Schicht höher:</strong> Beste Reflexion für obere HF</li>
          <li><strong>Höhere MUF:</strong> Durch stärkere Ionisation</li>
        </ul>
      </div>

      <div class="nighttime-box">
        <h4>Nacht</h4>
        <ul>
          <li><strong>D-Schicht verschwindet:</strong> Weniger Absorption</li>
          <li><strong>E-Schicht schwächer:</strong> Löst sich teilweise auf</li>
          <li><strong>F1+F2 verschmelzen:</strong> Einheitliche F-Schicht</li>
          <li><strong>Niedrigere MUF:</strong> Schwächere Ionisation</li>
          <li><strong>Besserer MF/LW-Empfang:</strong> Fernempfang möglich</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Related Links -->
  <section class="card">
    <h2 class="text-heading-2">Verwandte Themen</h2>
    <p class="section-description">
      Entdecke weitere Inhalte, die mit der Wellenausbreitung zusammenhängen.
    </p>
    <div class="related-cards-grid">
      <a href="/spektrum/ionosphaere" class="related-card">
        <div class="related-card-icon">🌐</div>
        <div class="related-card-content">
          <h3>Ionosphärische Schichten</h3>
          <p>Detaillierte Visualisierung der D-, E- und F-Schichten</p>
        </div>
        <div class="related-card-arrow">→</div>
      </a>
      <a href="/rechner/fspl" class="related-card">
        <div class="related-card-icon">📉</div>
        <div class="related-card-content">
          <h3>FSPL-Rechner</h3>
          <p>Berechne die Freiraumdämpfung für deine Funkstrecke</p>
        </div>
        <div class="related-card-arrow">→</div>
      </a>
      <a href="/rechner/link-budget" class="related-card">
        <div class="related-card-icon">📊</div>
        <div class="related-card-content">
          <h3>Link Budget</h3>
          <p>Vollständige Signalpfad-Analyse mit atmosphärischen Effekten</p>
        </div>
        <div class="related-card-arrow">→</div>
      </a>
      <a href="/rechner/fresnel" class="related-card">
        <div class="related-card-icon">📡</div>
        <div class="related-card-content">
          <h3>Fresnel-Zone</h3>
          <p>Berechne die erforderliche Hindernisfreiheit</p>
        </div>
        <div class="related-card-arrow">→</div>
      </a>
      <a href="/wissen/frequenzbaender" class="related-card">
        <div class="related-card-icon">📶</div>
        <div class="related-card-content">
          <h3>Frequenzbänder</h3>
          <p>Übersicht aller Frequenzbänder und deren Eigenschaften</p>
        </div>
        <div class="related-card-arrow">→</div>
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
    max-width: 75ch;
  }

  .diagram-section {
    width: 100%;
  }

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin-bottom: 1.5rem;
  }

  /* Modes Grid */
  .modes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .mode-card {
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-bg-surface);
  }

  .mode-header {
    padding: 1rem;
    color: white;
  }

  .mode-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
  }

  .mode-english {
    font-size: var(--font-size-sm);
    opacity: 0.8;
  }

  .mode-ground { background: linear-gradient(135deg, #92400e, #b45309); }
  .mode-sky { background: linear-gradient(135deg, #d97706, #fbbf24); }
  .mode-los { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
  .mode-sporadic { background: linear-gradient(135deg, #7c3aed, #a855f7); }

  .mode-content {
    padding: 1rem;
  }

  .mode-content p {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0 0 1rem 0;
    line-height: var(--line-height-relaxed);
  }

  .mode-specs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
  }

  .spec {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
  }

  .spec-label {
    color: var(--color-text-tertiary);
  }

  .spec-value {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .mode-characteristics {
    font-size: var(--font-size-sm);
  }

  .mode-characteristics strong {
    color: var(--color-text-primary);
  }

  .mode-characteristics ul {
    margin: 0.5rem 0 0 1.25rem;
    padding: 0;
    color: var(--color-text-secondary);
  }

  .mode-characteristics li {
    margin-bottom: 0.25rem;
  }

  /* Bands Table */
  .bands-table-container {
    overflow-x: auto;
    margin-top: 1rem;
  }

  .bands-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .bands-table th,
  .bands-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .bands-table th {
    background: var(--color-bg-elevated);
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  .bands-table td {
    color: var(--color-text-secondary);
  }

  .band-english {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .mono {
    font-family: var(--font-mono);
  }

  .mode-tag {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
  }

  /* Formulas */
  .formulas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .formula-card {
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .formula-card h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .formula {
    font-family: var(--font-mono);
    font-size: var(--font-size-lg);
    color: var(--color-accent-primary);
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    background: var(--color-bg-surface);
    border-radius: var(--radius-sm);
    text-align: center;
  }

  .formula-vars {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .formula-vars p {
    margin: 0.25rem 0;
  }

  .formula-example {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border-subtle);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  /* Day/Night Grid */
  .day-night-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .daytime-box,
  .nighttime-box {
    padding: 1.25rem;
    border-radius: var(--radius-md);
  }

  .daytime-box {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.15));
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .nighttime-box {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.15));
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .daytime-box h4,
  .nighttime-box h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-base);
  }

  .daytime-box h4 {
    color: #d97706;
  }

  .nighttime-box h4 {
    color: #6366f1;
  }

  .daytime-box ul,
  .nighttime-box ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .daytime-box li,
  .nighttime-box li {
    margin-bottom: 0.5rem;
  }

  /* Related Cards Grid */
  .related-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .related-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .related-card:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .related-card-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .related-card-content {
    flex: 1;
  }

  .related-card-content h3 {
    margin: 0 0 0.375rem 0;
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .related-card-content p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .related-card-arrow {
    font-size: 1.25rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
    align-self: center;
  }

  .related-card:hover .related-card-arrow {
    transform: translateX(4px);
    color: var(--color-accent-primary);
  }
</style>
