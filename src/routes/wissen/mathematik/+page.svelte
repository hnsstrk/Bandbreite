<script lang="ts">
  import { parseNumericInput, safeLog } from '$lib/utils/handlers';
  import { formatWavelength, formatNumber } from '$lib/utils/formatting';
  import { SPEED_OF_LIGHT, EARTH_RADIUS_MEAN, EFFECTIVE_EARTH_RADIUS_FACTOR } from '$lib/data/constants';

  // ============================================================================
  // Wavelength Calculator State
  // ============================================================================
  let wavelengthFrequency = $state(100);
  let wavelengthFrequencyUnit = $state('MHz');

  const wavelengthFrequencyHz = $derived.by(() => {
    const factors: Record<string, number> = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 };
    return wavelengthFrequency * (factors[wavelengthFrequencyUnit] || 1e6);
  });

  const calculatedWavelength = $derived.by(() => {
    if (wavelengthFrequencyHz <= 0) return 0;
    return SPEED_OF_LIGHT / wavelengthFrequencyHz;
  });

  function handleWavelengthFrequencyChange(e: Event) {
    wavelengthFrequency = parseNumericInput(e, 100);
  }

  function handleWavelengthUnitChange(e: Event) {
    wavelengthFrequencyUnit = (e.target as HTMLSelectElement).value;
  }

  // ============================================================================
  // FSPL Calculator State
  // ============================================================================
  let fsplFrequency = $state(2.4);
  let fsplFrequencyUnit = $state('GHz');
  let fsplDistance = $state(100);
  let fsplDistanceUnit = $state('m');

  const fsplFrequencyHz = $derived.by(() => {
    const factors: Record<string, number> = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 };
    return fsplFrequency * (factors[fsplFrequencyUnit] || 1e9);
  });

  const fsplDistanceM = $derived.by(() => {
    const factors: Record<string, number> = { m: 1, km: 1000, mi: 1609.344 };
    return fsplDistance * (factors[fsplDistanceUnit] || 1);
  });

  const calculatedFSPL = $derived.by(() => {
    if (fsplFrequencyHz <= 0 || fsplDistanceM <= 0) return 0;
    // FSPL = 20*log10(d) + 20*log10(f) + 20*log10(4*pi/c)
    // Simplified: FSPL = 20*log10(d) + 20*log10(f) - 147.55
    return 20 * safeLog(fsplDistanceM) + 20 * safeLog(fsplFrequencyHz) - 147.55;
  });

  function handleFsplFrequencyChange(e: Event) {
    fsplFrequency = parseNumericInput(e, 2.4);
  }

  function handleFsplFrequencyUnitChange(e: Event) {
    fsplFrequencyUnit = (e.target as HTMLSelectElement).value;
  }

  function handleFsplDistanceChange(e: Event) {
    fsplDistance = parseNumericInput(e, 100);
  }

  function handleFsplDistanceUnitChange(e: Event) {
    fsplDistanceUnit = (e.target as HTMLSelectElement).value;
  }

  // ============================================================================
  // Shannon-Hartley Calculator State
  // ============================================================================
  let shannonBandwidth = $state(20);
  let shannonBandwidthUnit = $state('MHz');
  let shannonSnrDb = $state(30);

  const shannonBandwidthHz = $derived.by(() => {
    const factors: Record<string, number> = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 };
    return shannonBandwidth * (factors[shannonBandwidthUnit] || 1e6);
  });

  const shannonSnrLinear = $derived(Math.pow(10, shannonSnrDb / 10));

  const shannonCapacity = $derived.by(() => {
    if (shannonBandwidthHz <= 0 || shannonSnrLinear < 0) return 0;
    return shannonBandwidthHz * safeLog(1 + shannonSnrLinear, 2);
  });

  const shannonSpectralEfficiency = $derived.by(() => {
    if (shannonSnrLinear < 0) return 0;
    return safeLog(1 + shannonSnrLinear, 2);
  });

  function handleShannonBandwidthChange(e: Event) {
    shannonBandwidth = parseNumericInput(e, 20);
  }

  function handleShannonBandwidthUnitChange(e: Event) {
    shannonBandwidthUnit = (e.target as HTMLSelectElement).value;
  }

  function handleShannonSnrChange(e: Event) {
    shannonSnrDb = parseNumericInput(e, 30);
  }

  // ============================================================================
  // Radio Horizon Calculator State
  // ============================================================================
  let horizonHeight = $state(30);
  let horizonHeightUnit = $state('m');
  let horizonWithRefraction = $state(true);

  const horizonHeightM = $derived.by(() => {
    const factors: Record<string, number> = { m: 1, ft: 0.3048 };
    return horizonHeight * (factors[horizonHeightUnit] || 1);
  });

  const calculatedHorizon = $derived.by(() => {
    if (horizonHeightM <= 0) return 0;
    const k = horizonWithRefraction ? EFFECTIVE_EARTH_RADIUS_FACTOR : 1;
    const R = EARTH_RADIUS_MEAN / 1000; // km
    const hKm = horizonHeightM / 1000;
    // d = sqrt(2 * k * R * h)
    return Math.sqrt(2 * k * R * hKm);
  });

  function handleHorizonHeightChange(e: Event) {
    horizonHeight = parseNumericInput(e, 30);
  }

  function handleHorizonHeightUnitChange(e: Event) {
    horizonHeightUnit = (e.target as HTMLSelectElement).value;
  }

  function handleHorizonRefractionChange(e: Event) {
    horizonWithRefraction = (e.target as HTMLInputElement).checked;
  }

  // ============================================================================
  // Helper for formatting capacity
  // ============================================================================
  function formatCapacity(bps: number): string {
    if (!Number.isFinite(bps) || bps <= 0) return '0 bit/s';
    if (bps >= 1e12) return `${(bps / 1e12).toFixed(2)} Tbit/s`;
    if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbit/s`;
    if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbit/s`;
    if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} kbit/s`;
    return `${bps.toFixed(2)} bit/s`;
  }

  // ============================================================================
  // RCS Examples for Radar
  // ============================================================================
  const rcsExamples = [
    { name: 'Insekt', rcs: 0.00001, unit: 'cm2' },
    { name: 'Vogel', rcs: 0.001, unit: 'm2' },
    { name: 'Mensch', rcs: 1, unit: 'm2' },
    { name: 'Pkw', rcs: 100, unit: 'm2' },
    { name: 'LKW', rcs: 200, unit: 'm2' },
    { name: 'Kampfjet (konventionell)', rcs: 5, unit: 'm2' },
    { name: 'Stealth-Jet (z.B. F-22)', rcs: 0.0001, unit: 'm2' },
    { name: 'Passagierflugzeug', rcs: 100, unit: 'm2' },
    { name: 'Schiff (mittel)', rcs: 10000, unit: 'm2' },
  ];

  // ============================================================================
  // dB Conversion Table
  // ============================================================================
  const dbTable = [
    { db: 0, powerRatio: 1, voltageRatio: 1 },
    { db: 1, powerRatio: 1.26, voltageRatio: 1.12 },
    { db: 2, powerRatio: 1.58, voltageRatio: 1.26 },
    { db: 3, powerRatio: 2, voltageRatio: 1.41 },
    { db: 6, powerRatio: 4, voltageRatio: 2 },
    { db: 10, powerRatio: 10, voltageRatio: 3.16 },
    { db: 20, powerRatio: 100, voltageRatio: 10 },
    { db: 30, powerRatio: 1000, voltageRatio: 31.6 },
    { db: 40, powerRatio: 10000, voltageRatio: 100 },
    { db: -3, powerRatio: 0.5, voltageRatio: 0.71 },
    { db: -6, powerRatio: 0.25, voltageRatio: 0.5 },
    { db: -10, powerRatio: 0.1, voltageRatio: 0.316 },
    { db: -20, powerRatio: 0.01, voltageRatio: 0.1 },
  ];
</script>

<svelte:head>
  <title>RF-Mathematik - Bandbreite</title>
  <meta name="description" content="Wichtige Formeln der Hochfrequenztechnik mit Herleitungen und interaktiven Rechnern: Wellenlänge, FSPL, Radargleichung, Shannon-Hartley und Dezibel-Rechnung." />
  <meta property="og:title" content="RF-Mathematik | Bandbreite" />
  <meta property="og:description" content="Wichtige Formeln der Hochfrequenztechnik mit Herleitungen und interaktiven Rechnern: Wellenlänge, FSPL, Radargleichung, Shannon-Hartley und Dezibel-Rechnung." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="RF-Mathematik | Bandbreite" />
  <meta name="twitter:description" content="Wichtige Formeln der Hochfrequenztechnik mit Herleitungen und interaktiven Rechnern: Wellenlänge, FSPL, Radargleichung, Shannon-Hartley und Dezibel-Rechnung." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">RF-Mathematik</h1>
    <p class="header-description">
      Die wichtigsten Formeln der Hochfrequenztechnik mit Erklärungen, Herleitungen und
      interaktiven Mini-Rechnern zum direkten Ausprobieren.
    </p>
  </header>

  <!-- Table of Contents -->
  <nav class="toc card" aria-label="Inhaltsverzeichnis">
    <h2 class="text-heading-3">Inhaltsverzeichnis</h2>
    <ol class="toc-list">
      <li><a href="#wellenlaenge">Wellenlänge und Frequenz</a></li>
      <li><a href="#fspl">Freiraumdämpfung (FSPL)</a></li>
      <li><a href="#radar">Radargleichung</a></li>
      <li><a href="#shannon">Shannon-Hartley-Theorem</a></li>
      <li><a href="#dezibel">Dezibel-Rechnung</a></li>
      <li><a href="#horizont">Radiohorizont</a></li>
    </ol>
  </nav>

  <!-- 1. Wavelength and Frequency -->
  <section id="wellenlaenge" class="card formula-section">
    <h2 class="text-heading-2">1. Wellenlänge und Frequenz</h2>

    <div class="formula-intro">
      <p>
        Die Wellenlänge und Frequenz einer elektromagnetischen Welle sind über die
        Lichtgeschwindigkeit miteinander verknüpft. Diese fundamentale Beziehung ist
        die Basis für viele RF-Berechnungen.
      </p>
    </div>

    <div class="formula-box">
      <div class="formula-main">lambda = c / f</div>
      <div class="formula-alt">f = c / lambda</div>
    </div>

    <div class="formula-variables">
      <h4>Variablen:</h4>
      <dl>
        <dt>lambda</dt>
        <dd>Wellenlänge in Metern [m]</dd>
        <dt>c</dt>
        <dd>Lichtgeschwindigkeit im Vakuum = 299.792.458 m/s</dd>
        <dt>f</dt>
        <dd>Frequenz in Hertz [Hz]</dd>
      </dl>
    </div>

    <div class="derivation">
      <h4>Herleitung aus der Wellengleichung:</h4>
      <p>
        Eine elektromagnetische Welle breitet sich mit der Phase <code>phi = omega * t - k * x</code> aus,
        wobei <code>omega = 2 * pi * f</code> die Kreisfrequenz und <code>k = 2 * pi / lambda</code> die Wellenzahl ist.
      </p>
      <p>
        Die Phasengeschwindigkeit ergibt sich zu <code>v = omega / k = f * lambda</code>.
        Im Vakuum ist diese Geschwindigkeit gleich der Lichtgeschwindigkeit c, woraus folgt:
      </p>
      <div class="formula-derivation">c = f * lambda => lambda = c / f</div>
    </div>

    <!-- Mini Calculator -->
    <div class="mini-calculator">
      <h4>Interaktiver Rechner</h4>
      <div class="calc-inputs">
        <div class="input-group">
          <label for="wavelength-freq">Frequenz:</label>
          <input
            type="number"
            id="wavelength-freq"
            value={wavelengthFrequency}
            oninput={handleWavelengthFrequencyChange}
            min="0"
            step="any"
          />
          <select
            aria-label="Frequenz-Einheit"
            value={wavelengthFrequencyUnit}
            onchange={handleWavelengthUnitChange}
          >
            <option value="Hz">Hz</option>
            <option value="kHz">kHz</option>
            <option value="MHz">MHz</option>
            <option value="GHz">GHz</option>
          </select>
        </div>
      </div>
      <div class="calc-result">
        <span class="result-label">Wellenlänge:</span>
        <span class="result-value">{formatWavelength(calculatedWavelength)}</span>
      </div>
    </div>

    <div class="examples">
      <h4>Beispiele:</h4>
      <table class="example-table">
        <thead>
          <tr>
            <th>Frequenz</th>
            <th>Wellenlänge</th>
            <th>Anwendung</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>100 MHz</td>
            <td>3 m</td>
            <td>UKW-Radio</td>
          </tr>
          <tr>
            <td>2,4 GHz</td>
            <td>12,5 cm</td>
            <td>WLAN, Mikrowelle</td>
          </tr>
          <tr>
            <td>5 GHz</td>
            <td>6 cm</td>
            <td>WLAN 5 GHz</td>
          </tr>
          <tr>
            <td>28 GHz</td>
            <td>10,7 mm</td>
            <td>5G mmWave</td>
          </tr>
          <tr>
            <td>77 GHz</td>
            <td>3,9 mm</td>
            <td>Automotive Radar</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- 2. FSPL -->
  <section id="fspl" class="card formula-section">
    <h2 class="text-heading-2">2. Freiraumdämpfung (FSPL)</h2>

    <div class="formula-intro">
      <p>
        Die Freiraumdämpfung (Free Space Path Loss) beschreibt den Signalverlust
        einer elektromagnetischen Welle bei der Ausbreitung im freien Raum,
        ohne Hindernisse oder atmosphärische Effekte.
      </p>
    </div>

    <div class="formula-box">
      <div class="formula-main">FSPL(dB) = 20 * log10(d) + 20 * log10(f) + 20 * log10(4 * pi / c)</div>
      <div class="formula-alt">Vereinfacht: FSPL(dB) = 20 * log10(d) + 20 * log10(f) - 147,55</div>
    </div>

    <div class="formula-variables">
      <h4>Variablen:</h4>
      <dl>
        <dt>FSPL</dt>
        <dd>Freiraumdämpfung in Dezibel [dB]</dd>
        <dt>d</dt>
        <dd>Distanz in Metern [m]</dd>
        <dt>f</dt>
        <dd>Frequenz in Hertz [Hz]</dd>
        <dt>c</dt>
        <dd>Lichtgeschwindigkeit = 299.792.458 m/s</dd>
      </dl>
    </div>

    <div class="derivation">
      <h4>Herleitung aus der Fraunhofer-Gleichung:</h4>
      <p>
        Die Leistungsdichte einer isotropen Antenne in Entfernung d beträgt:
        <code>S = Pt / (4 * pi * d^2)</code>
      </p>
      <p>
        Die effektive Apertur einer isotropen Empfangsantenne ist:
        <code>Ae = lambda^2 / (4 * pi)</code>
      </p>
      <p>
        Die empfangene Leistung ergibt sich zu:
        <code>Pr = S * Ae = Pt * lambda^2 / (16 * pi^2 * d^2)</code>
      </p>
      <p>
        Das Verhältnis <code>Pt / Pr</code> in dB ist die FSPL:
      </p>
      <div class="formula-derivation">
        FSPL = 10 * log10(Pt/Pr) = 20 * log10(4 * pi * d / lambda) = 20 * log10(4 * pi * d * f / c)
      </div>
    </div>

    <!-- Mini Calculator -->
    <div class="mini-calculator">
      <h4>Interaktiver Rechner</h4>
      <div class="calc-inputs">
        <div class="input-group">
          <label for="fspl-freq">Frequenz:</label>
          <input
            type="number"
            id="fspl-freq"
            value={fsplFrequency}
            oninput={handleFsplFrequencyChange}
            min="0"
            step="any"
          />
          <select
            aria-label="Frequenz-Einheit"
            value={fsplFrequencyUnit}
            onchange={handleFsplFrequencyUnitChange}
          >
            <option value="MHz">MHz</option>
            <option value="GHz">GHz</option>
          </select>
        </div>
        <div class="input-group">
          <label for="fspl-dist">Distanz:</label>
          <input
            type="number"
            id="fspl-dist"
            value={fsplDistance}
            oninput={handleFsplDistanceChange}
            min="0"
            step="any"
          />
          <select
            aria-label="Distanz-Einheit"
            value={fsplDistanceUnit}
            onchange={handleFsplDistanceUnitChange}
          >
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="mi">mi</option>
          </select>
        </div>
      </div>
      <div class="calc-result">
        <span class="result-label">FSPL:</span>
        <span class="result-value">{formatNumber(calculatedFSPL, 2)} dB</span>
      </div>
    </div>

    <div class="info-box">
      <h4>Wichtige Erkenntnisse:</h4>
      <ul>
        <li><strong>Verdopplung der Distanz</strong> => +6 dB Dämpfung</li>
        <li><strong>Verdopplung der Frequenz</strong> => +6 dB Dämpfung</li>
        <li>Die FSPL beschreibt nur die geometrische Ausbreitung, keine Absorption</li>
      </ul>
    </div>
  </section>

  <!-- 3. Radar Equation -->
  <section id="radar" class="card formula-section">
    <h2 class="text-heading-2">3. Radargleichung</h2>

    <div class="formula-intro">
      <p>
        Die Radargleichung beschreibt die empfangene Leistung eines Radargeräts
        nach Reflexion an einem Zielobjekt. Sie berücksichtigt die Hin- und Rückweg-Dämpfung
        sowie die Reflexionseigenschaften des Ziels.
      </p>
    </div>

    <div class="formula-box">
      <div class="formula-main">Pr = (Pt * G^2 * lambda^2 * sigma) / ((4 * pi)^3 * R^4)</div>
    </div>

    <div class="formula-variables">
      <h4>Variablen:</h4>
      <dl>
        <dt>Pr</dt>
        <dd>Empfangene Leistung [W]</dd>
        <dt>Pt</dt>
        <dd>Sendeleistung [W]</dd>
        <dt>G</dt>
        <dd>Antennengewinn (dimensionslos, gleiche Antenne für TX/RX)</dd>
        <dt>lambda</dt>
        <dd>Wellenlänge [m]</dd>
        <dt>sigma</dt>
        <dd>Radarquerschnitt (RCS) des Ziels [m^2]</dd>
        <dt>R</dt>
        <dd>Entfernung zum Ziel [m]</dd>
      </dl>
    </div>

    <div class="derivation">
      <h4>Herleitung:</h4>
      <p>
        Die Leistungsdichte am Ziel beträgt <code>S1 = (Pt * G) / (4 * pi * R^2)</code>.
      </p>
      <p>
        Das Ziel reflektiert mit seinem RCS sigma die Leistung <code>Prefl = S1 * sigma</code>
        isotrop zurück.
      </p>
      <p>
        Am Empfänger ist die Leistungsdichte <code>S2 = Prefl / (4 * pi * R^2)</code>.
      </p>
      <p>
        Mit der effektiven Apertur <code>Ae = G * lambda^2 / (4 * pi)</code> ergibt sich:
      </p>
      <div class="formula-derivation">
        Pr = S2 * Ae = (Pt * G^2 * lambda^2 * sigma) / ((4 * pi)^3 * R^4)
      </div>
    </div>

    <div class="info-box">
      <h4>R^4-Gesetz:</h4>
      <p>
        Die empfangene Leistung nimmt mit der <strong>vierten Potenz</strong> der Entfernung ab.
        Um die doppelte Reichweite zu erzielen, benötigt man 16-fache Sendeleistung (+12 dB).
      </p>
    </div>

    <div class="rcs-examples">
      <h4>Typische Radarquerschnitte (RCS):</h4>
      <table class="example-table">
        <thead>
          <tr>
            <th>Objekt</th>
            <th>RCS (sigma)</th>
          </tr>
        </thead>
        <tbody>
          {#each rcsExamples as example (example.name)}
            <tr>
              <td>{example.name}</td>
              <td class="mono">{example.rcs} {example.unit === 'cm2' ? 'cm' : 'm'}<sup>2</sup></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <!-- 4. Shannon-Hartley -->
  <section id="shannon" class="card formula-section">
    <h2 class="text-heading-2">4. Shannon-Hartley-Theorem</h2>

    <div class="formula-intro">
      <p>
        Das Shannon-Hartley-Theorem definiert die theoretisch maximale Datenrate,
        die über einen gestörten Kanal übertragen werden kann. Es ist fundamental
        für das Verständnis digitaler Kommunikationssysteme.
      </p>
    </div>

    <div class="formula-box">
      <div class="formula-main">C = B * log2(1 + SNR)</div>
    </div>

    <div class="formula-variables">
      <h4>Variablen:</h4>
      <dl>
        <dt>C</dt>
        <dd>Kanalkapazität (maximale fehlerfreie Datenrate) [bit/s]</dd>
        <dt>B</dt>
        <dd>Bandbreite des Kanals [Hz]</dd>
        <dt>SNR</dt>
        <dd>Signal-Rausch-Verhältnis (linear, nicht in dB!)</dd>
      </dl>
    </div>

    <div class="info-box">
      <h4>SNR-Umrechnung:</h4>
      <div class="formula-derivation">
        SNR_linear = 10^(SNR_dB / 10)
      </div>
      <p>
        Beispiel: 20 dB entspricht SNR = 10^2 = 100 (linear)
      </p>
    </div>

    <div class="derivation">
      <h4>Spektrale Effizienz:</h4>
      <p>
        Die spektrale Effizienz eta beschreibt, wie viele Bits pro Sekunde
        pro Hertz Bandbreite übertragen werden können:
      </p>
      <div class="formula-derivation">
        eta = C / B = log2(1 + SNR) [bit/s/Hz]
      </div>
    </div>

    <!-- Mini Calculator -->
    <div class="mini-calculator">
      <h4>Interaktiver Rechner</h4>
      <div class="calc-inputs">
        <div class="input-group">
          <label for="shannon-bw">Bandbreite:</label>
          <input
            type="number"
            id="shannon-bw"
            value={shannonBandwidth}
            oninput={handleShannonBandwidthChange}
            min="0"
            step="any"
          />
          <select
            aria-label="Bandbreite-Einheit"
            value={shannonBandwidthUnit}
            onchange={handleShannonBandwidthUnitChange}
          >
            <option value="Hz">Hz</option>
            <option value="kHz">kHz</option>
            <option value="MHz">MHz</option>
          </select>
        </div>
        <div class="input-group">
          <label for="shannon-snr">SNR:</label>
          <input
            type="number"
            id="shannon-snr"
            value={shannonSnrDb}
            oninput={handleShannonSnrChange}
            step="any"
          />
          <span class="unit-label">dB</span>
        </div>
      </div>
      <div class="calc-results-grid">
        <div class="calc-result">
          <span class="result-label">SNR (linear):</span>
          <span class="result-value">{formatNumber(shannonSnrLinear, 1)}</span>
        </div>
        <div class="calc-result">
          <span class="result-label">Kapazität:</span>
          <span class="result-value">{formatCapacity(shannonCapacity)}</span>
        </div>
        <div class="calc-result">
          <span class="result-label">Spektrale Effizienz:</span>
          <span class="result-value">{formatNumber(shannonSpectralEfficiency, 2)} bit/s/Hz</span>
        </div>
      </div>
    </div>

    <div class="examples">
      <h4>Praxisbeispiele:</h4>
      <table class="example-table">
        <thead>
          <tr>
            <th>Standard</th>
            <th>Bandbreite</th>
            <th>Typ. SNR</th>
            <th>Max. Datenrate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>WLAN 802.11n</td>
            <td>40 MHz</td>
            <td>25 dB</td>
            <td>~332 Mbit/s</td>
          </tr>
          <tr>
            <td>LTE (20 MHz)</td>
            <td>20 MHz</td>
            <td>20 dB</td>
            <td>~133 Mbit/s</td>
          </tr>
          <tr>
            <td>5G (100 MHz)</td>
            <td>100 MHz</td>
            <td>20 dB</td>
            <td>~665 Mbit/s</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- 5. Decibel -->
  <section id="dezibel" class="card formula-section">
    <h2 class="text-heading-2">5. Dezibel-Rechnung</h2>

    <div class="formula-intro">
      <p>
        Das Dezibel (dB) ist ein logarithmisches Verhältnismaß, das in der HF-Technik
        allgegenwärtig ist. Es ermöglicht die einfache Berechnung von Verstärkungen und
        Dämpfungen durch Addition statt Multiplikation.
      </p>
    </div>

    <div class="formula-box dual">
      <div class="formula-column">
        <h5>Leistungsverhältnis:</h5>
        <div class="formula-main">dB = 10 * log10(P2 / P1)</div>
      </div>
      <div class="formula-column">
        <h5>Spannungsverhältnis:</h5>
        <div class="formula-main">dB = 20 * log10(V2 / V1)</div>
      </div>
    </div>

    <div class="info-box">
      <h4>Warum der Faktor 10 vs. 20?</h4>
      <p>
        Leistung ist proportional zum Quadrat der Spannung: <code>P ~ V^2</code>.
        Daher gilt: <code>10 * log10(P2/P1) = 10 * log10((V2/V1)^2) = 20 * log10(V2/V1)</code>
      </p>
    </div>

    <div class="reference-levels">
      <h4>Absolute Referenzpegel:</h4>
      <dl>
        <dt>dBm</dt>
        <dd>Bezogen auf 1 mW: <code>P_dBm = 10 * log10(P / 1mW)</code></dd>
        <dt>dBW</dt>
        <dd>Bezogen auf 1 W: <code>P_dBW = 10 * log10(P / 1W)</code></dd>
        <dt>dBuV</dt>
        <dd>Bezogen auf 1 uV: <code>U_dBuV = 20 * log10(U / 1uV)</code></dd>
      </dl>
      <p class="note">
        Umrechnung: <strong>dBm = dBW + 30</strong>
      </p>
    </div>

    <div class="db-table">
      <h4>Umrechnungstabelle:</h4>
      <table class="example-table">
        <thead>
          <tr>
            <th>dB</th>
            <th>Leistungsfaktor</th>
            <th>Spannungsfaktor</th>
          </tr>
        </thead>
        <tbody>
          {#each dbTable as row (row.db)}
            <tr class:negative={row.db < 0}>
              <td class="mono">{row.db > 0 ? '+' : ''}{row.db} dB</td>
              <td class="mono">{row.db >= 0 ? 'x' : ''} {row.powerRatio}</td>
              <td class="mono">{row.db >= 0 ? 'x' : ''} {row.voltageRatio}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="info-box">
      <h4>Praktische Faustregeln:</h4>
      <ul>
        <li><strong>+3 dB</strong> = Verdopplung der Leistung</li>
        <li><strong>+10 dB</strong> = 10-fache Leistung</li>
        <li><strong>-3 dB</strong> = Halbierung der Leistung (z.B. Bandbreitengrenze)</li>
        <li><strong>+6 dB</strong> = Verdopplung der Spannung = 4-fache Leistung</li>
      </ul>
    </div>
  </section>

  <!-- 6. Radio Horizon -->
  <section id="horizont" class="card formula-section">
    <h2 class="text-heading-2">6. Radiohorizont</h2>

    <div class="formula-intro">
      <p>
        Der Radiohorizont ist die maximale Entfernung, über die eine direkte
        Sichtverbindung (Line-of-Sight) zwischen zwei Antennen möglich ist.
        Er wird durch die Erdkrümmung und die atmosphärische Refraktion begrenzt.
      </p>
    </div>

    <div class="formula-box">
      <div class="formula-main">d = sqrt(2 * k * R * h)</div>
    </div>

    <div class="formula-variables">
      <h4>Variablen:</h4>
      <dl>
        <dt>d</dt>
        <dd>Distanz zum Horizont [km]</dd>
        <dt>k</dt>
        <dd>Refraktionsfaktor (typisch 4/3 = 1,333)</dd>
        <dt>R</dt>
        <dd>Erdradius = 6.371 km</dd>
        <dt>h</dt>
        <dd>Antennenhöhe [km]</dd>
      </dl>
    </div>

    <div class="info-box">
      <h4>4/3-Erde-Modell:</h4>
      <p>
        Durch atmosphärische Refraktion (Brechung in der Troposphäre) werden
        Radiowellen leicht zur Erde hin gebogen. Dies wird durch den Faktor k = 4/3
        modelliert, der den Erdradius effektiv vergrößert.
      </p>
    </div>

    <div class="derivation">
      <h4>Für zwei Antennen:</h4>
      <p>
        Bei zwei Antennen mit Höhen h1 und h2 ist die maximale Verbindungsdistanz:
      </p>
      <div class="formula-derivation">
        d_max = sqrt(2 * k * R * h1) + sqrt(2 * k * R * h2)
      </div>
    </div>

    <!-- Mini Calculator -->
    <div class="mini-calculator">
      <h4>Interaktiver Rechner</h4>
      <div class="calc-inputs">
        <div class="input-group">
          <label for="horizon-height">Antennenhöhe:</label>
          <input
            type="number"
            id="horizon-height"
            value={horizonHeight}
            oninput={handleHorizonHeightChange}
            min="0"
            step="any"
          />
          <select
            aria-label="Höhen-Einheit"
            value={horizonHeightUnit}
            onchange={handleHorizonHeightUnitChange}
          >
            <option value="m">m</option>
            <option value="ft">ft</option>
          </select>
        </div>
        <div class="input-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={horizonWithRefraction}
              onchange={handleHorizonRefractionChange}
            />
            Mit Refraktion (k = 4/3)
          </label>
        </div>
      </div>
      <div class="calc-result">
        <span class="result-label">Radiohorizont:</span>
        <span class="result-value">{formatNumber(calculatedHorizon, 1)} km</span>
      </div>
    </div>

    <div class="examples">
      <h4>Beispiele:</h4>
      <table class="example-table">
        <thead>
          <tr>
            <th>Antennenhöhe</th>
            <th>Ohne Refraktion</th>
            <th>Mit Refraktion (k=4/3)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2 m (Handfunk)</td>
            <td>5,0 km</td>
            <td>5,8 km</td>
          </tr>
          <tr>
            <td>10 m</td>
            <td>11,3 km</td>
            <td>13,0 km</td>
          </tr>
          <tr>
            <td>30 m (Hausdach)</td>
            <td>19,6 km</td>
            <td>22,6 km</td>
          </tr>
          <tr>
            <td>100 m (Funkturm)</td>
            <td>35,7 km</td>
            <td>41,2 km</td>
          </tr>
          <tr>
            <td>300 m</td>
            <td>61,9 km</td>
            <td>71,4 km</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Related Links -->
  <section class="card">
    <h2 class="text-heading-2">Verwandte Werkzeuge</h2>
    <p class="section-intro">
      Die hier vorgestellten Formeln können Sie direkt in unseren interaktiven Rechnern anwenden
      oder in den Wissensartikeln vertiefen.
    </p>
    <div class="related-links">
      <a href="/rechner/fspl" class="related-link">
        <span class="related-icon" aria-hidden="true">~</span>
        <div>
          <strong>FSPL-Rechner</strong>
          <p>Interaktive Berechnung der Freiraumdämpfung</p>
        </div>
      </a>
      <a href="/rechner/radar" class="related-link">
        <span class="related-icon" aria-hidden="true">)</span>
        <div>
          <strong>Radar-Reichweite</strong>
          <p>Berechnung mit der Radargleichung</p>
        </div>
      </a>
      <a href="/rechner/kanalkapazitaet" class="related-link">
        <span class="related-icon" aria-hidden="true">#</span>
        <div>
          <strong>Kanalkapazität</strong>
          <p>Shannon-Hartley Theorem anwenden</p>
        </div>
      </a>
      <a href="/rechner/link-budget" class="related-link">
        <span class="related-icon" aria-hidden="true">+</span>
        <div>
          <strong>Link Budget</strong>
          <p>Vollständige Signalpfad-Analyse</p>
        </div>
      </a>
      <a href="/wissen/radar" class="related-link">
        <span class="related-icon" aria-hidden="true">?</span>
        <div>
          <strong>Radar-Grundlagen</strong>
          <p>Theorie hinter der Radargleichung</p>
        </div>
      </a>
      <a href="/wissen/wellenausbreitung" class="related-link">
        <span class="related-icon" aria-hidden="true">^</span>
        <div>
          <strong>Wellenausbreitung</strong>
          <p>Ausbreitungsmodi und Radiohorizont</p>
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

  /* Table of Contents */
  .toc {
    background: var(--color-bg-elevated);
  }

  .toc h2 {
    margin-bottom: 1rem;
  }

  .toc-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem 1rem;
    margin: 0;
    padding: 0;
    list-style-position: inside;
  }

  .toc-list a {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .toc-list a:hover {
    color: var(--color-accent-primary);
  }

  /* Formula Sections */
  .formula-section {
    scroll-margin-top: 2rem;
  }

  .formula-intro {
    margin-bottom: 1.5rem;
  }

  .formula-intro p {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin: 0;
  }

  /* Formula Box */
  .formula-box {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .formula-box.dual {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    text-align: left;
  }

  .formula-column h5 {
    margin: 0 0 0.75rem 0;
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
  }

  .formula-main {
    font-family: var(--font-mono);
    font-size: var(--font-size-xl);
    color: var(--color-accent-primary);
    margin-bottom: 0.5rem;
    word-break: break-word;
  }

  .formula-alt {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
  }

  /* Variables */
  .formula-variables {
    margin-bottom: 1.5rem;
  }

  .formula-variables h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .formula-variables dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 1rem;
    margin: 0;
    font-size: var(--font-size-sm);
  }

  .formula-variables dt {
    font-family: var(--font-mono);
    color: var(--color-accent-primary);
  }

  .formula-variables dd {
    margin: 0;
    color: var(--color-text-secondary);
  }

  /* Derivation */
  .derivation {
    background: var(--color-bg-surface);
    border-left: 3px solid var(--color-accent-primary);
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .derivation h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .derivation p {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .derivation code {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-accent-secondary);
    background: var(--color-bg-elevated);
    padding: 0.125rem 0.375rem;
    border-radius: var(--radius-sm);
  }

  .formula-derivation {
    font-family: var(--font-mono);
    font-size: var(--font-size-base);
    color: var(--color-accent-primary);
    background: var(--color-bg-elevated);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    text-align: center;
    margin-top: 0.75rem;
    word-break: break-word;
  }

  /* Info Box */
  .info-box {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
  }

  .info-box h4 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .info-box p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .info-box ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .info-box li {
    margin-bottom: 0.25rem;
  }

  /* Mini Calculator */
  .mini-calculator {
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .mini-calculator h4 {
    margin: 0 0 1rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .calc-inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .input-group input[type="number"] {
    width: 100px;
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm);
    font-family: var(--font-mono);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background: var(--color-bg-base);
    color: var(--color-text-primary);
  }

  .input-group input[type="number"]:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .input-group select {
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background: var(--color-bg-base);
    color: var(--color-text-primary);
    cursor: pointer;
  }

  .input-group select:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .unit-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-group input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .calc-result {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
  }

  .calc-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
  }

  .result-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
  }

  .result-value {
    font-family: var(--font-mono);
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-accent-primary);
  }

  /* Examples Table */
  .examples {
    margin-bottom: 1.5rem;
  }

  .examples h4,
  .rcs-examples h4,
  .db-table h4,
  .reference-levels h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .example-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .example-table th,
  .example-table td {
    padding: 0.625rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .example-table th {
    background: var(--color-bg-elevated);
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  .example-table td {
    color: var(--color-text-secondary);
  }

  .example-table .mono {
    font-family: var(--font-mono);
  }

  .example-table tr.negative td {
    color: var(--color-text-tertiary);
  }

  /* Reference Levels */
  .reference-levels {
    margin-bottom: 1.5rem;
  }

  .reference-levels dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
  }

  .reference-levels dt {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .reference-levels dd {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .reference-levels code {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-accent-secondary);
    background: var(--color-bg-elevated);
    padding: 0.125rem 0.375rem;
    border-radius: var(--radius-sm);
  }

  .reference-levels .note {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    display: inline-block;
  }

  /* Related Links */
  .section-intro {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0 0 1rem 0;
    line-height: var(--line-height-relaxed);
  }

  .related-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    font-size: 1.25rem;
    color: var(--color-accent-primary);
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

  /* Responsive */
  @media (max-width: 640px) {
    .formula-main {
      font-size: var(--font-size-lg);
    }

    .calc-inputs {
      flex-direction: column;
    }

    .input-group {
      width: 100%;
    }

    .input-group input[type="number"] {
      flex: 1;
    }

    .formula-variables dl {
      grid-template-columns: 1fr;
    }

    .formula-variables dt {
      margin-top: 0.5rem;
    }
  }
</style>
