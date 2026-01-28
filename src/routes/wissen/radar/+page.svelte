<script lang="ts">
  import { IEEE_BANDS } from '$lib/data/bands';

  // Animation state for radar diagram
  let animationProgress = $state(0);
  let isAnimating = $state(true);

  // Animation loop
  $effect(() => {
    if (!isAnimating) return;

    let frameId: number;
    let startTime: number | null = null;
    const duration = 3000; // 3 seconds per cycle

    function animate(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      animationProgress = (elapsed % duration) / duration;
      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  });

  // Radar bands with applications
  const radarBands = $derived(
    IEEE_BANDS.filter((b) => ['l', 's', 'c', 'x', 'ku', 'k', 'ka', 'v', 'w'].includes(b.id)).map(
      (band) => {
        const applications: Record<string, string> = {
          l: 'Flugsicherung (ATC), Langstrecken-Überwachung, Wetterradar',
          s: 'Flughafenradar, Wetterradar, Schiffsradar',
          c: 'Wetterradar, Satellitenradar, Schiffsnavigation',
          x: 'Marine-Radar, Feuerleitung, Wetterradar',
          ku: 'Hochauflösende Kartierung, Satelliten-TV',
          k: 'Polizei-Radar, Verkehrsüberwachung',
          ka: 'Polizei-Radar, Flughafen-Oberflächenradar',
          v: 'Millimeterwellen-Radar, Forschung',
          w: 'Automotive Radar (77 GHz), Objekterkennung'
        };
        return {
          ...band,
          application: applications[band.id] || '—'
        };
      }
    )
  );

  // RCS Examples
  const rcsExamples = [
    { name: 'Insekt', rcs: 0.00001, unit: 'cm' },
    { name: 'Vogel (klein)', rcs: 0.001, unit: 'm' },
    { name: 'Mensch', rcs: 1, unit: 'm' },
    { name: 'Auto', rcs: 100, unit: 'm' },
    { name: 'Kampfflugzeug', rcs: 10, unit: 'm' },
    { name: 'Stealth-Flugzeug', rcs: 0.005, unit: 'm' },
    { name: 'Verkehrsflugzeug', rcs: 100, unit: 'm' },
    { name: 'Schiff (gross)', rcs: 10000, unit: 'm' }
  ];

  function formatRcs(rcs: number): string {
    if (rcs >= 1000) return `${(rcs / 1000).toFixed(0)} km`;
    if (rcs >= 1) return `${rcs.toFixed(0)} m`;
    if (rcs >= 0.01) return `${(rcs * 100).toFixed(1)} cm`;
    return `${(rcs * 10000).toFixed(1)} mm`;
  }

  function formatFrequencyRange(minHz: number, maxHz: number): string {
    const formatValue = (hz: number): string => {
      if (hz >= 1e9) return `${(hz / 1e9).toFixed(0)} GHz`;
      if (hz >= 1e6) return `${(hz / 1e6).toFixed(0)} MHz`;
      return `${hz} Hz`;
    };
    return `${formatValue(minHz)} - ${formatValue(maxHz)}`;
  }

  function toggleAnimation() {
    isAnimating = !isAnimating;
  }
</script>

<svelte:head>
  <title>Radar-Grundlagen - Bandbreite</title>
  <meta
    name="description"
    content="Umfassendes Nachschlagewerk zu Radar-Grundlagen: Radargleichung, RCS, Doppler-Radar, FMCW und Radarbänder."
  />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Radar-Grundlagen</h1>
    <p class="header-description">
      RADAR (Radio Detection and Ranging) ist eine Technologie zur Ortung und Entfernungsmessung
      mittels elektromagnetischer Wellen. Diese Seite erklärt die grundlegenden Prinzipien, Formeln
      und Anwendungen der Radartechnik.
    </p>
  </header>

  <!-- Grundprinzip Section -->
  <section class="card">
    <h2 class="text-heading-2">Grundprinzip Radar</h2>

    <div class="principle-content">
      <div class="principle-text">
        <p>
          Ein Radar sendet elektromagnetische Impulse aus, die von Objekten (Zielen) reflektiert
          werden. Der Empfänger detektiert das zurückgeworfene Echo und bestimmt aus der Laufzeit
          die Entfernung zum Ziel.
        </p>

        <div class="radar-types">
          <div class="radar-type">
            <h4>Pulsradar</h4>
            <p>
              Sendet kurze Impulse und misst die Laufzeit des Echos. Die Pause zwischen den Impulsen
              definiert die maximale Reichweite.
            </p>
            <div class="type-formula">t = 2d/c</div>
          </div>

          <div class="radar-type">
            <h4>Dauerstrichradar (CW)</h4>
            <p>
              Sendet kontinuierlich und nutzt den Doppler-Effekt zur Geschwindigkeitsmessung. Keine
              direkte Entfernungsmessung.
            </p>
            <div class="type-formula">f<sub>d</sub> = 2vf/c</div>
          </div>
        </div>
      </div>

      <div class="radar-diagram">
        <svg
          viewBox="0 0 400 200"
          role="img"
          aria-label="Radar-Grundprinzip: Sender emittiert Welle, Ziel reflektiert Echo zurück zum Empfänger"
        >
          <!-- Background -->
          <rect width="400" height="200" fill="var(--color-bg-elevated)" rx="8" />

          <!-- Ground -->
          <line
            x1="0"
            y1="180"
            x2="400"
            y2="180"
            stroke="var(--color-border-default)"
            stroke-width="2"
          />

          <!-- Radar Station -->
          <g class="radar-station">
            <!-- Tower -->
            <rect x="30" y="130" width="20" height="50" fill="var(--color-text-tertiary)" />
            <!-- Antenna dish -->
            <ellipse
              cx="40"
              cy="120"
              rx="25"
              ry="15"
              fill="none"
              stroke="var(--color-accent-primary)"
              stroke-width="3"
            />
            <line
              x1="40"
              y1="120"
              x2="40"
              y2="130"
              stroke="var(--color-accent-primary)"
              stroke-width="2"
            />
          </g>

          <!-- Target (Aircraft) -->
          <g class="target" transform="translate(320, 80)">
            <path d="M0,0 L-30,5 L-25,0 L-30,-5 Z" fill="var(--color-text-secondary)" />
            <path d="M-15,-2 L-15,2 L-35,8 L-35,-8 Z" fill="var(--color-text-tertiary)" />
            <path d="M-25,0 L-25,3 L-35,5 L-35,-5 L-25,-3 Z" fill="var(--color-text-tertiary)" />
          </g>

          <!-- Transmitted Wave (animated) -->
          {#if animationProgress < 0.5}
            {@const waveProgress = animationProgress * 2}
            <g class="tx-wave">
              {#each [0, 1, 2] as i (i)}
                {@const offset = i * 0.1}
                {@const progress = Math.max(0, Math.min(1, waveProgress - offset))}
                {@const x = 65 + progress * 230}
                {@const y = 120 - progress * 40}
                {#if progress > 0}
                  <circle
                    cx={x}
                    cy={y}
                    r={8 - i * 2}
                    fill="none"
                    stroke="#3b82f6"
                    stroke-width="2"
                    opacity={1 - progress * 0.5}
                  />
                {/if}
              {/each}
            </g>
          {/if}

          <!-- Reflected Wave (animated) -->
          {#if animationProgress >= 0.5}
            {@const waveProgress = (animationProgress - 0.5) * 2}
            <g class="rx-wave">
              {#each [0, 1, 2] as i (i)}
                {@const offset = i * 0.1}
                {@const progress = Math.max(0, Math.min(1, waveProgress - offset))}
                {@const x = 295 - progress * 230}
                {@const y = 80 + progress * 40}
                {#if progress > 0}
                  <circle
                    cx={x}
                    cy={y}
                    r={8 - i * 2}
                    fill="none"
                    stroke="#22c55e"
                    stroke-width="2"
                    opacity={1 - progress * 0.5}
                  />
                {/if}
              {/each}
            </g>
          {/if}

          <!-- Labels -->
          <text x="40" y="195" text-anchor="middle" class="svg-label">Radar</text>
          <text x="320" y="110" text-anchor="middle" class="svg-label">Ziel</text>

          <!-- Legend -->
          <g transform="translate(150, 20)">
            <circle cx="0" cy="0" r="5" fill="#3b82f6" />
            <text x="10" y="4" class="svg-label-small">Sendeimpuls</text>
            <circle cx="0" cy="18" r="5" fill="#22c55e" />
            <text x="10" y="22" class="svg-label-small">Echo</text>
          </g>
        </svg>

        <button type="button" class="animation-toggle" onclick={toggleAnimation}>
          {isAnimating ? 'Animation pausieren' : 'Animation starten'}
        </button>
      </div>
    </div>
  </section>

  <!-- Radargleichung Section -->
  <section class="card">
    <h2 class="text-heading-2">Radargleichung</h2>

    <p class="section-description">
      Die Radargleichung beschreibt die Leistungsbilanz zwischen Sender und Empfänger und bestimmt
      die maximale Reichweite eines Radarsystems.
    </p>

    <div class="equation-box">
      <div class="main-equation">
        P<sub>r</sub> = (P<sub>t</sub> * G<sup>2</sup> * &lambda;<sup>2</sup> * &sigma;) /
        ((4&pi;)<sup>3</sup> * R<sup>4</sup>)
      </div>
      <p class="equation-note">Empfangsleistung in Abhängigkeit von Sendeleistung und Entfernung</p>
    </div>

    <div class="variables-grid">
      <div class="variable">
        <span class="var-symbol">P<sub>r</sub></span>
        <span class="var-desc">Empfangsleistung [W]</span>
      </div>
      <div class="variable">
        <span class="var-symbol">P<sub>t</sub></span>
        <span class="var-desc">Sendeleistung [W]</span>
      </div>
      <div class="variable">
        <span class="var-symbol">G</span>
        <span class="var-desc">Antennengewinn (linear)</span>
      </div>
      <div class="variable">
        <span class="var-symbol">&lambda;</span>
        <span class="var-desc">Wellenlänge [m]</span>
      </div>
      <div class="variable">
        <span class="var-symbol">&sigma;</span>
        <span class="var-desc">Radarquerschnitt (RCS) [m<sup>2</sup>]</span>
      </div>
      <div class="variable">
        <span class="var-symbol">R</span>
        <span class="var-desc">Entfernung zum Ziel [m]</span>
      </div>
    </div>

    <div class="derived-equation">
      <h4>Maximale Reichweite</h4>
      <div class="equation-box secondary">
        <div class="main-equation smaller">
          R<sub>max</sub> =
          <span class="root-4">
            <span class="root-symbol">4</span>
            <span class="root-content"
              >(P<sub>t</sub> * G<sup>2</sup> * &lambda;<sup>2</sup> * &sigma;) / ((4&pi;)<sup
                >3</sup
              >
              * P<sub>r,min</sub>)</span
            >
          </span>
        </div>
      </div>
      <p class="equation-explanation">
        Durch Umstellen der Radargleichung nach R erhält man die maximale Reichweite für eine
        gegebene minimale Empfindlichkeit P<sub>r,min</sub>.
      </p>
    </div>

    <div class="key-insights">
      <h4>Wichtige Erkenntnisse</h4>
      <ul>
        <li>Die Empfangsleistung sinkt mit der <strong>vierten Potenz</strong> der Entfernung</li>
        <li>
          Verdopplung der Reichweite erfordert <strong>16-fache</strong> Sendeleistung (2<sup>4</sup>
          = 16)
        </li>
        <li>Grössere Wellenlänge verbessert die Reichweite (bei gleichem RCS)</li>
        <li>Höherer Antennengewinn wirkt sich quadratisch aus</li>
      </ul>
    </div>
  </section>

  <!-- RCS Section -->
  <section class="card">
    <h2 class="text-heading-2">Radarquerschnitt (RCS)</h2>

    <p class="section-description">
      Der Radarquerschnitt (Radar Cross Section, &sigma;) beschreibt, wie stark ein Objekt
      Radarwellen reflektiert. Er wird in m<sup>2</sup> angegeben, entspricht aber nicht der
      tatsächlichen Fläche des Objekts.
    </p>

    <div class="rcs-content">
      <div class="rcs-factors">
        <h4>Einflussfaktoren auf den RCS</h4>
        <ul>
          <li><strong>Grösse:</strong> Grössere Objekte haben tendenziell höheren RCS</li>
          <li><strong>Form:</strong> Flache Flächen reflektieren stark, runde Formen streuen</li>
          <li><strong>Material:</strong> Metall reflektiert stark, Verbundstoffe weniger</li>
          <li><strong>Winkel:</strong> RCS variiert je nach Einfallswinkel</li>
          <li><strong>Frequenz:</strong> Höhere Frequenzen erfassen kleinere Details</li>
          <li>
            <strong>Stealth-Technik:</strong> Absorbierende Beschichtungen und Formgebung reduzieren
            RCS
          </li>
        </ul>
      </div>

      <div class="rcs-table-container">
        <h4>Typische RCS-Werte</h4>
        <table class="rcs-table">
          <thead>
            <tr>
              <th>Objekt</th>
              <th>RCS (&sigma;)</th>
              <th>Grössenordnung</th>
            </tr>
          </thead>
          <tbody>
            {#each rcsExamples as example (example.name)}
              <tr>
                <td>{example.name}</td>
                <td class="mono">{example.rcs.toExponential(0)} m<sup>2</sup></td>
                <td class="mono">{formatRcs(example.rcs)}<sup>2</sup></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Doppler-Radar Section -->
  <section class="card">
    <h2 class="text-heading-2">Doppler-Radar</h2>

    <p class="section-description">
      Der Doppler-Effekt beschreibt die Frequenzverschiebung, wenn sich Sender und Empfänger relativ
      zueinander bewegen. Doppler-Radar nutzt diesen Effekt zur Geschwindigkeitsmessung.
    </p>

    <div class="doppler-content">
      <div class="equation-box">
        <div class="main-equation">f<sub>d</sub> = 2 * v * f / c</div>
        <p class="equation-note">Doppler-Frequenzverschiebung</p>
      </div>

      <div class="variables-grid compact">
        <div class="variable">
          <span class="var-symbol">f<sub>d</sub></span>
          <span class="var-desc">Doppler-Frequenz [Hz]</span>
        </div>
        <div class="variable">
          <span class="var-symbol">v</span>
          <span class="var-desc">Radialgeschwindigkeit [m/s]</span>
        </div>
        <div class="variable">
          <span class="var-symbol">f</span>
          <span class="var-desc">Radarfrequenz [Hz]</span>
        </div>
        <div class="variable">
          <span class="var-symbol">c</span>
          <span class="var-desc">Lichtgeschwindigkeit (3*10<sup>8</sup> m/s)</span>
        </div>
      </div>

      <div class="doppler-applications">
        <h4>Anwendungen</h4>
        <div class="applications-grid">
          <div class="application-card">
            <h5>Verkehrsüberwachung</h5>
            <p>Polizei-Radar zur Geschwindigkeitsmessung (K- und Ka-Band)</p>
          </div>
          <div class="application-card">
            <h5>Wetterradar</h5>
            <p>Messung von Windgeschwindigkeiten und Niederschlagsbewegung</p>
          </div>
          <div class="application-card">
            <h5>Flugsicherung</h5>
            <p>Erkennung bewegter Ziele, Filterung von Bodenclutter (MTI)</p>
          </div>
          <div class="application-card">
            <h5>Sportanalyse</h5>
            <p>Messung von Ballgeschwindigkeiten (Tennis, Baseball, Golf)</p>
          </div>
        </div>
      </div>

      <div class="doppler-note">
        <strong>MTI (Moving Target Indication):</strong> Durch Vergleich aufeinanderfolgender
        Radarechos können stationäre Objekte (Clutter) von bewegten Zielen unterschieden werden.
      </div>
    </div>
  </section>

  <!-- FMCW Section -->
  <section class="card">
    <h2 class="text-heading-2">FMCW-Radar</h2>

    <p class="section-description">
      FMCW (Frequency Modulated Continuous Wave) ist eine moderne Radartechnik, die gleichzeitig
      Entfernung und Geschwindigkeit messen kann. Sie wird besonders in Automotive-Radar
      eingesetzt.
    </p>

    <div class="fmcw-content">
      <div class="fmcw-principle">
        <h4>Funktionsprinzip</h4>
        <ol>
          <li>
            Der Sender erzeugt einen <strong>Chirp</strong>: Die Frequenz wird linear erhöht (oder
            erniedrigt)
          </li>
          <li>Das reflektierte Signal kommt mit zeitlicher Verzögerung zurück</li>
          <li>
            Durch Mischung von Sende- und Empfangssignal entsteht ein Schwebungssignal (Beat
            Frequency)
          </li>
          <li>Die Beat-Frequenz ist proportional zur <strong>Entfernung</strong></li>
          <li>
            Zusätzliche Doppler-Verschiebung zeigt die <strong>Geschwindigkeit</strong> an
          </li>
        </ol>
      </div>

      <div class="fmcw-diagram">
        <svg
          viewBox="0 0 400 180"
          role="img"
          aria-label="FMCW-Chirp-Diagramm: Frequenz steigt linear mit der Zeit, Echo ist zeitverschoben"
        >
          <rect width="400" height="180" fill="var(--color-bg-elevated)" rx="8" />

          <!-- Axes -->
          <line
            x1="50"
            y1="150"
            x2="380"
            y2="150"
            stroke="var(--color-text-tertiary)"
            stroke-width="1"
          />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="150"
            stroke="var(--color-text-tertiary)"
            stroke-width="1"
          />

          <!-- Axis labels -->
          <text x="215" y="170" text-anchor="middle" class="svg-label">Zeit</text>
          <text x="25" y="90" text-anchor="middle" class="svg-label" transform="rotate(-90, 25, 90)"
            >Frequenz</text
          >

          <!-- Transmit chirp -->
          <path
            d="M50,140 L150,50 L150,140 L250,50 L250,140 L350,50"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2"
          />

          <!-- Receive chirp (delayed) -->
          <path
            d="M70,140 L170,50 L170,140 L270,50 L270,140 L370,50"
            fill="none"
            stroke="#22c55e"
            stroke-width="2"
            stroke-dasharray="5,3"
          />

          <!-- Beat frequency annotation -->
          <line
            x1="100"
            y1="95"
            x2="120"
            y2="95"
            stroke="var(--color-accent-primary)"
            stroke-width="2"
            marker-start="url(#arrowStart)"
            marker-end="url(#arrowEnd)"
          />
          <text x="110" y="85" text-anchor="middle" class="svg-label-small">f<tspan
              baseline-shift="sub"
              font-size="8">b</tspan
            ></text>

          <!-- Legend -->
          <g transform="translate(280, 30)">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#3b82f6" stroke-width="2" />
            <text x="25" y="4" class="svg-label-small">TX</text>
            <line x1="0" y1="15" x2="20" y2="15" stroke="#22c55e" stroke-width="2" />
            <text x="25" y="19" class="svg-label-small">RX</text>
          </g>

          <!-- Arrow markers -->
          <defs>
            <marker
              id="arrowStart"
              markerWidth="6"
              markerHeight="6"
              refX="0"
              refY="3"
              orient="auto"
            >
              <path d="M6,0 L0,3 L6,6" fill="none" stroke="var(--color-accent-primary)" />
            </marker>
            <marker id="arrowEnd" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--color-accent-primary)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="fmcw-specs">
        <h4>Automotive Radar (77 GHz)</h4>
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">Frequenzband:</span>
            <span class="spec-value">76-81 GHz (W-Band)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Reichweite:</span>
            <span class="spec-value">Bis zu 250 m (Long Range)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Auflösung:</span>
            <span class="spec-value">ca. 4 cm (bei 4 GHz Bandbreite)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Anwendungen:</span>
            <span class="spec-value">ACC, AEB, Spurwechselassistent</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Radarbänder Section -->
  <section class="card">
    <h2 class="text-heading-2">Radarbänder (IEEE)</h2>

    <p class="section-description">
      Die IEEE-Bandbezeichnungen sind der internationale Standard für Radarfrequenzbänder. Jedes
      Band hat charakteristische Eigenschaften und typische Anwendungen.
    </p>

    <div class="bands-table-container">
      <table class="bands-table">
        <thead>
          <tr>
            <th>Band</th>
            <th>Frequenz</th>
            <th>Typische Anwendungen</th>
          </tr>
        </thead>
        <tbody>
          {#each radarBands as band (band.id)}
            <tr>
              <td>
                <span class="band-badge" style="background-color: {band.color}">{band.name}</span>
              </td>
              <td class="mono">{formatFrequencyRange(band.minHz, band.maxHz)}</td>
              <td>{band.application}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="table-note">
      <a href="/wissen/frequenzbaender" class="internal-link"
        >Vollständige Übersicht aller Frequenzbänder</a
      >
    </p>
  </section>

  <!-- Radartypen Section -->
  <section class="card">
    <h2 class="text-heading-2">Radartypen</h2>

    <div class="types-grid">
      <div class="type-card">
        <h4>Primärradar</h4>
        <p>
          Klassisches Radar, das nur auf reflektierte Echos angewiesen ist. Erkennt alle Objekte
          unabhängig von deren Ausrüstung.
        </p>
        <ul>
          <li>Keine Kooperation des Ziels erforderlich</li>
          <li>Erkennt auch unbekannte Objekte</li>
          <li>Höherer Leistungsbedarf</li>
        </ul>
      </div>

      <div class="type-card">
        <h4>Sekundärradar (SSR)</h4>
        <p>
          Das Ziel verfügt über einen Transponder, der aktiv auf Abfragen antwortet. Standard in der
          Flugsicherung.
        </p>
        <ul>
          <li>Grössere Reichweite bei geringerer Leistung</li>
          <li>Übermittlung zusätzlicher Daten (ID, Höhe)</li>
          <li>Mode S, ADS-B für moderne Luftfahrt</li>
        </ul>
      </div>

      <div class="type-card">
        <h4>SAR (Synthetic Aperture Radar)</h4>
        <p>
          Nutzt die Bewegung des Trägers (Flugzeug, Satellit), um eine synthetische Apertur zu
          erzeugen. Ermöglicht hochauflösende Bildgebung.
        </p>
        <ul>
          <li>Auflösung unabhängig von Entfernung</li>
          <li>Funktioniert bei Tag, Nacht, durch Wolken</li>
          <li>Erdbeobachtung, Kartographie</li>
        </ul>
      </div>

      <div class="type-card">
        <h4>Phased Array Radar</h4>
        <p>
          Verwendet eine Anordnung vieler Antennenelemente, deren Phasen elektronisch gesteuert
          werden. Ermöglicht schnelles Schwenken ohne mechanische Bewegung.
        </p>
        <ul>
          <li>Strahlschwenkung in Mikrosekunden</li>
          <li>Mehrere Ziele gleichzeitig verfolgbar</li>
          <li>AESA (Active Electronically Scanned Array)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Related Links -->
  <section class="card">
    <h2 class="text-heading-2">Verwandte Themen</h2>
    <div class="related-links">
      <a href="/rechner/radar" class="related-link">
        <span class="related-icon">R</span>
        <div>
          <strong>Radar-Rechner</strong>
          <p>Radargleichung und Reichweite berechnen</p>
        </div>
      </a>
      <a href="/wissen/frequenzbaender" class="related-link">
        <span class="related-icon">F</span>
        <div>
          <strong>Frequenzbänder</strong>
          <p>IEEE, NATO und ITU Bandbezeichnungen</p>
        </div>
      </a>
      <a href="/rechner/fspl" class="related-link">
        <span class="related-icon">D</span>
        <div>
          <strong>FSPL-Rechner</strong>
          <p>Freiraumdämpfung berechnen</p>
        </div>
      </a>
      <a href="/rechner/doppler" class="related-link">
        <span class="related-icon">V</span>
        <div>
          <strong>Doppler-Rechner</strong>
          <p>Doppler-Frequenzverschiebung berechnen</p>
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
    max-width: 75ch;
  }

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin-bottom: 1.5rem;
  }

  /* Principle Section */
  .principle-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .principle-content {
      grid-template-columns: 1fr;
    }
  }

  .principle-text p {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: 1rem;
  }

  .radar-types {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .radar-type {
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .radar-type h4 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .radar-type p {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .type-formula {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-accent-primary);
  }

  .radar-diagram {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .radar-diagram svg {
    width: 100%;
    height: auto;
    border-radius: var(--radius-md);
  }

  .svg-label {
    font-size: 12px;
    fill: var(--color-text-secondary);
  }

  .svg-label-small {
    font-size: 10px;
    fill: var(--color-text-tertiary);
  }

  .animation-toggle {
    padding: 0.5rem 1rem;
    font-size: var(--font-size-xs);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .animation-toggle:hover {
    background: var(--color-bg-surface);
    border-color: var(--color-accent-primary);
  }

  /* Equation Boxes */
  .equation-box {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin: 1rem 0;
    text-align: center;
  }

  .equation-box.secondary {
    background: var(--color-bg-surface);
  }

  .main-equation {
    font-family: var(--font-mono);
    font-size: var(--font-size-xl);
    color: var(--color-accent-primary);
    margin-bottom: 0.5rem;
  }

  .main-equation.smaller {
    font-size: var(--font-size-lg);
  }

  .equation-note {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .root-4 {
    position: relative;
    display: inline-block;
  }

  .root-symbol {
    position: absolute;
    top: -0.3em;
    left: -0.8em;
    font-size: 0.6em;
    color: var(--color-text-secondary);
  }

  .root-content {
    border-top: 2px solid var(--color-accent-primary);
    padding-top: 0.2em;
    margin-left: 0.5em;
  }

  /* Variables Grid */
  .variables-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .variables-grid.compact {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .variable {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
  }

  .var-symbol {
    font-family: var(--font-mono);
    font-size: var(--font-size-base);
    color: var(--color-accent-primary);
  }

  .var-desc {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .derived-equation {
    margin-top: 1.5rem;
  }

  .derived-equation h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .equation-explanation {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-top: 1rem;
  }

  .key-insights {
    margin-top: 1.5rem;
    padding: 1rem;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.1),
      rgba(99, 102, 241, 0.1)
    );
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: var(--radius-md);
  }

  .key-insights h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-accent-primary);
  }

  .key-insights ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .key-insights li {
    margin-bottom: 0.5rem;
  }

  /* RCS Section */
  .rcs-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .rcs-content {
      grid-template-columns: 1fr;
    }
  }

  .rcs-factors h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .rcs-factors ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .rcs-factors li {
    margin-bottom: 0.5rem;
  }

  .rcs-table-container h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .rcs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .rcs-table th,
  .rcs-table td {
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .rcs-table th {
    background: var(--color-bg-elevated);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .rcs-table td {
    color: var(--color-text-secondary);
  }

  .mono {
    font-family: var(--font-mono);
  }

  /* Doppler Section */
  .doppler-content {
    margin-top: 1rem;
  }

  .doppler-applications {
    margin-top: 1.5rem;
  }

  .doppler-applications h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .applications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .application-card {
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .application-card h5 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .application-card p {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .doppler-note {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-left: 3px solid var(--color-accent-primary);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  /* FMCW Section */
  .fmcw-content {
    margin-top: 1rem;
  }

  .fmcw-principle {
    margin-bottom: 1.5rem;
  }

  .fmcw-principle h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .fmcw-principle ol {
    margin: 0;
    padding-left: 1.5rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .fmcw-principle li {
    margin-bottom: 0.5rem;
  }

  .fmcw-diagram {
    margin: 1.5rem 0;
  }

  .fmcw-diagram svg {
    width: 100%;
    max-width: 500px;
    height: auto;
    border-radius: var(--radius-md);
  }

  .fmcw-specs {
    margin-top: 1.5rem;
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
  }

  .fmcw-specs h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .specs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .spec-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
  }

  .spec-item .spec-label {
    color: var(--color-text-tertiary);
  }

  .spec-item .spec-value {
    color: var(--color-text-primary);
    font-weight: 500;
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
  }

  .bands-table td {
    color: var(--color-text-secondary);
  }

  .band-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    color: white;
    font-size: var(--font-size-xs);
  }

  .table-note {
    margin-top: 1rem;
    font-size: var(--font-size-sm);
  }

  .internal-link {
    color: var(--color-accent-primary);
    text-decoration: none;
  }

  .internal-link:hover {
    text-decoration: underline;
  }

  /* Types Grid */
  .types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .type-card {
    padding: 1.25rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
  }

  .type-card h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
  }

  .type-card p {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .type-card ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .type-card li {
    margin-bottom: 0.25rem;
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: var(--color-accent-primary);
    color: white;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: var(--font-size-sm);
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
