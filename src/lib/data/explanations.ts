/**
 * Explanations module for InfoTooltip content.
 *
 * Contains short descriptions and detailed explanations for RF engineering terms.
 * Content is organized by category for easy maintenance.
 *
 * IMPORTANT: Content may contain HTML for formatting. Only use with trusted sources.
 */

export interface Explanation {
  title: string;
  short: string;
  detailed?: string;
}

// ============================================================================
// FSPL (Free Space Path Loss)
// ============================================================================

export const FSPL: Explanation = {
  title: 'Free Space Path Loss (FSPL)',
  short: 'Signalverlust im freien Raum. Steigt quadratisch mit Frequenz und Distanz.',
  detailed: `
    <p><strong>Physikalischer Hintergrund:</strong> Die Sendeleistung verteilt sich auf eine Kugeloberflaeche (4 pi r^2). Mit zunehmender Distanz wird die Energiedichte pro Flaecheneinheit geringer.</p>
    <p><strong>Formel:</strong><br/>
    <code>FSPL(dB) = 20 log10(d) + 20 log10(f) - 147,55</code></p>
    <p><strong>Faustregel:</strong> Verdopplung der Distanz oder Frequenz = +6 dB Verlust.</p>
  `
};

export const FREQUENCY: Explanation = {
  title: 'Frequenz',
  short: 'Anzahl der Schwingungen pro Sekunde. Höhere Frequenzen haben kuerzere Wellenlängen.',
  detailed: `
    <p><strong>Einheit:</strong> Hertz (Hz) = 1/s</p>
    <p><strong>Zusammenhang mit Wellenlänge:</strong><br/>
    <code>lambda = c / f</code> (c = Lichtgeschwindigkeit)</p>
    <p><strong>Auswirkung:</strong> Höhere Frequenzen ermöglichen mehr Bandbreite, haben aber höhere Freiraumdämpfung und schlechtere Durchdringung.</p>
  `
};

export const DISTANCE: Explanation = {
  title: 'Distanz',
  short: 'Entfernung zwischen Sender und Empfänger. Quadratischer Einfluss auf Signalstärke.',
  detailed: `
    <p>Die Signalstärke nimmt mit dem Quadrat der Entfernung ab (inverse square law).</p>
    <p><strong>Verdopplung der Distanz:</strong> -6 dB Signalstärke</p>
    <p><strong>10-fache Distanz:</strong> -20 dB Signalstärke</p>
  `
};

export const WAVELENGTH: Explanation = {
  title: 'Wellenlänge',
  short: 'Raeumliche Ausdehnung einer Schwingung. Bestimmt Antennengröße und Ausbreitungsverhalten.',
  detailed: `
    <p><strong>Formel:</strong> <code>lambda = c / f</code></p>
    <p><strong>Beispiele:</strong></p>
    <p>- 2,4 GHz: 12,5 cm<br/>
    - 868 MHz: 34,5 cm<br/>
    - 433 MHz: 69,2 cm</p>
    <p>Antennenlänge ist oft lambda/4 oder lambda/2.</p>
  `
};

// ============================================================================
// Link Budget Terms
// ============================================================================

export const EIRP: Explanation = {
  title: 'EIRP (Effective Isotropic Radiated Power)',
  short: 'Sendeleistung inkl. Antennengewinn minus Kabelverluste. Gesetzlich oft limitiert.',
  detailed: `
    <p><strong>Formel:</strong><br/>
    <code>EIRP = P_TX + G_TX - L_kabel</code></p>
    <p><strong>Bedeutung:</strong> Aequivalente Leistung, die ein isotroper Strahler (Kugelstrahler) abgeben muesste, um dieselbe Feldstärke in Hauptstrahlrichtung zu erzeugen.</p>
    <p><strong>Regulierung:</strong> In der EU oft auf 20 dBm (100 mW) begrenzt für ISM-Bänder.</p>
  `
};

export const TX_POWER: Explanation = {
  title: 'Sendeleistung (TX Power)',
  short: 'Ausgangsleistung des Senders am Antennenanschluss.',
  detailed: `
    <p><strong>Einheit:</strong> dBm (Dezibel bezogen auf 1 mW) oder Watt</p>
    <p><strong>Umrechnung:</strong><br/>
    <code>P(mW) = 10^(P(dBm)/10)</code></p>
    <p><strong>Typische Werte:</strong></p>
    <p>- WLAN: 15-20 dBm (30-100 mW)<br/>
    - LoRa: 10-14 dBm (10-25 mW)<br/>
    - Mobilfunk: bis 23 dBm (200 mW)</p>
  `
};

export const TX_ANTENNA_GAIN: Explanation = {
  title: 'Antennengewinn (TX)',
  short: 'Verstärkung gegenüber isotropem Strahler. Konzentriert Energie in bestimmte Richtungen.',
  detailed: `
    <p><strong>Einheit:</strong> dBi (Dezibel bezogen auf isotropen Strahler)</p>
    <p><strong>Wichtig:</strong> Der Gewinn erhoeht nicht die Gesamtleistung, sondern konzentriert die Abstrahlung.</p>
    <p><strong>Typische Werte:</strong></p>
    <p>- Dipol: 2,15 dBi<br/>
    - Patch-Antenne: 6-9 dBi<br/>
    - Yagi: 10-15 dBi<br/>
    - Parabolantenne: 20-40 dBi</p>
  `
};

export const TX_CABLE_LOSS: Explanation = {
  title: 'Kabelverlust (TX)',
  short: 'Dämpfung im Kabel zwischen Sender und Antenne.',
  detailed: `
    <p>Kabelverluste entstehen durch:</p>
    <p>- Ohmsche Verluste im Leiter<br/>
    - Dielektrische Verluste im Isolator<br/>
    - Steckerverluste (ca. 0,1-0,5 dB pro Stecker)</p>
    <p><strong>Typische Werte bei 2,4 GHz:</strong></p>
    <p>- RG58: 0,6 dB/m<br/>
    - RG213: 0,3 dB/m<br/>
    - LMR400: 0,13 dB/m</p>
  `
};

export const RX_SENSITIVITY: Explanation = {
  title: 'Empfängerempfindlichkeit (RX Sensitivity)',
  short: 'Minimale Signalstärke für zuverlässige Dekodierung. Abhängig von Modulation und Datenrate.',
  detailed: `
    <p><strong>Einheit:</strong> dBm (typisch negativ, z.B. -90 dBm)</p>
    <p><strong>Einflussfaktoren:</strong></p>
    <p>- Bandbreite (höhere BW = schlechtere Sensitivity)<br/>
    - Modulation (BPSK besser als 64-QAM)<br/>
    - Fehlerkorrektur (mehr FEC = besser)</p>
    <p><strong>Typische Werte:</strong></p>
    <p>- WLAN 802.11n: -75 bis -90 dBm<br/>
    - LoRa SF12: bis -137 dBm<br/>
    - Bluetooth: -70 bis -90 dBm</p>
  `
};

export const RX_ANTENNA_GAIN: Explanation = {
  title: 'Antennengewinn (RX)',
  short: 'Empfangsverstärkung durch Richtwirkung der Empfangsantenne.',
  detailed: `
    <p>Der Empfangsgewinn wirkt wie der Sendegewinn - er sammelt mehr Energie aus einer bestimmten Richtung.</p>
    <p><strong>Reziprozitaet:</strong> Eine Antenne hat beim Senden und Empfangen denselben Gewinn.</p>
    <p>Hochgewinn-Antennen erfordern präzise Ausrichtung.</p>
  `
};

export const RX_CABLE_LOSS: Explanation = {
  title: 'Kabelverlust (RX)',
  short: 'Dämpfung im Kabel zwischen Empfangsantenne und Empfänger.',
  detailed: `
    <p>Besonders kritisch, da das Signal bereits schwach ist.</p>
    <p><strong>Empfehlung:</strong> Kabel so kurz wie möglich halten oder LNA (Low Noise Amplifier) direkt an der Antenne einsetzen.</p>
  `
};

export const FADING_MARGIN: Explanation = {
  title: 'Fading Margin',
  short: 'Reserve für Signalschwankungen durch Mehrwegausbreitung, Wetter oder Bewegung.',
  detailed: `
    <p><strong>Ursachen für Fading:</strong></p>
    <p>- Mehrwegausbreitung (Reflexionen)<br/>
    - Regen/Schnee bei hohen Frequenzen<br/>
    - Bewegung (Doppler-Effekt)<br/>
    - Vegetation (saisonal)</p>
    <p><strong>Typische Werte:</strong></p>
    <p>- Indoor (stabil): 10-15 dB<br/>
    - Outdoor (mobil): 15-25 dB<br/>
    - Satellit: 3-10 dB</p>
  `
};

export const SYSTEM_GAIN: Explanation = {
  title: 'System Gain/Margin',
  short: 'Summe aller Gewinne und Verluste im Funklink. Positiv = Link funktioniert.',
  detailed: `
    <p><strong>Link Budget Formel:</strong></p>
    <p><code>P_RX = P_TX + G_TX - L_TX - FSPL + G_RX - L_RX</code></p>
    <p><strong>System Margin:</strong></p>
    <p><code>Margin = P_RX - Sensitivity - Fading</code></p>
    <p>Ein positiver Margin bedeutet zuverlässige Verbindung.</p>
  `
};

export const LINK_MARGIN: Explanation = {
  title: 'Link Margin',
  short: 'Differenz zwischen Empfangsleistung und Empfängerempfindlichkeit (ohne Fading Margin).',
  detailed: `
    <p><strong>Formel:</strong> <code>Link Margin = P_RX - Sensitivity</code></p>
    <p>Zeigt den rohen Spielraum vor Abzug von Sicherheitsreserven.</p>
  `
};

// ============================================================================
// Frequency Bands
// ============================================================================

export const BAND_IEEE: Explanation = {
  title: 'IEEE Frequenzbänder',
  short: 'Radar-Bandeinteilung (L, S, C, X, Ku, K, Ka). Standard in Luft- und Raumfahrt.',
  detailed: `
    <p><strong>Herkunft:</strong> Entwickelt im WWII für Radarsysteme.</p>
    <p><strong>Wichtige Bänder:</strong></p>
    <p>- L-Band (1-2 GHz): GPS, ATC-Radar<br/>
    - S-Band (2-4 GHz): WLAN, Wetterradar<br/>
    - C-Band (4-8 GHz): Satellit, Radar<br/>
    - X-Band (8-12 GHz): Marine-Radar<br/>
    - Ku-Band (12-18 GHz): Satellit-TV<br/>
    - K-Band (18-27 GHz): Verkehrsradar<br/>
    - Ka-Band (27-40 GHz): 5G, Satellit</p>
  `
};

export const BAND_NATO: Explanation = {
  title: 'NATO Frequenzbänder',
  short: 'Militärische Bezeichnung (A-M Bänder). Historisch, aber noch in Gebrauch.',
  detailed: `
    <p><strong>Aufbau:</strong> Buchstaben A-M für steigende Frequenzen.</p>
    <p><strong>Wichtige Bänder:</strong></p>
    <p>- D-Band: 1-2 GHz (entspricht IEEE L)<br/>
    - E/F-Band: 2-4 GHz (entspricht IEEE S)<br/>
    - G-Band: 4-6 GHz<br/>
    - I-Band: 8-10 GHz<br/>
    - J-Band: 10-20 GHz</p>
    <p>Wird hauptsächlich im militärischen Kontext verwendet.</p>
  `
};

export const BAND_ITU: Explanation = {
  title: 'ITU Frequenzbänder',
  short: 'Internationale Funkfrequenzeinteilung (ELF bis THF). Basis für weltweite Regulierung.',
  detailed: `
    <p><strong>Organisation:</strong> International Telecommunication Union</p>
    <p><strong>Einteilung nach Dekaden:</strong></p>
    <p>- VLF: 3-30 kHz<br/>
    - LF: 30-300 kHz<br/>
    - MF: 300-3000 kHz<br/>
    - HF: 3-30 MHz<br/>
    - VHF: 30-300 MHz<br/>
    - UHF: 300-3000 MHz<br/>
    - SHF: 3-30 GHz<br/>
    - EHF: 30-300 GHz</p>
    <p>Jedes Band ist eine Frequenzdekade.</p>
  `
};

// ============================================================================
// Atmospheric Attenuation
// ============================================================================

export const ATMOSPHERIC_GENERAL: Explanation = {
  title: 'Atmosphärische Dämpfung',
  short: 'Zusaetzlicher Signalverlust durch Absorption in Gasen (O2, H2O). Frequenzabhängig.',
  detailed: `
    <p>Neben der Freiraumdämpfung absorbieren Gasmolekuele in der Atmosphäre Funkwellen bei bestimmten Resonanzfrequenzen.</p>
    <p><strong>Hauptverursacher:</strong></p>
    <p>- Sauerstoff (O2): Peak bei 60 GHz<br/>
    - Wasserdampf (H2O): Peak bei 22 GHz</p>
    <p>Relevant ab ca. 10 GHz, kritisch ab 50 GHz.</p>
  `
};

export const ATMOSPHERIC_22GHZ: Explanation = {
  title: '22 GHz Wasserdampf-Resonanz',
  short: 'Wassermolekuele absorbieren bei 22 GHz. Etwa 0,2 dB/km bei normaler Luftfeuchte.',
  detailed: `
    <p><strong>Ursache:</strong> RotationsÜbergang der H2O-Molekuele bei 22,235 GHz.</p>
    <p><strong>Typische Dämpfung:</strong> 0,1-0,2 dB/km</p>
    <p><strong>Einfluss der Luftfeuchte:</strong> Steigt mit Wasserdampfdichte (g/m^3).</p>
    <p>Bei Regen kommen zusaetzliche Verluste hinzu.</p>
  `
};

export const ATMOSPHERIC_60GHZ: Explanation = {
  title: '60 GHz Sauerstoff-Resonanz',
  short: 'Sauerstoff absorbiert stark bei 60 GHz (~15 dB/km). Ideal für kurze, abhoersichere Links.',
  detailed: `
    <p><strong>Ursache:</strong> Magnetische Spin-Resonanz von O2 bei 60 GHz.</p>
    <p><strong>Typische Dämpfung:</strong> 10-15 dB/km (bei Meereshöhe)</p>
    <p><strong>Anwendungen:</strong></p>
    <p>- WiGig (802.11ad/ay): Kurzstrecken-WLAN<br/>
    - Wireless Backhaul: 100-500m<br/>
    - Sichere Kommunikation (begrenzte Reichweite)</p>
    <p>Vorteil: Frequenz kann raeumlich wiederverwendet werden.</p>
  `
};

export const RAIN_ATTENUATION: Explanation = {
  title: 'Regendämpfung',
  short: 'Regen dämpft Funkwellen ab ca. 10 GHz. Starker Einfluss bei mmWave (5G, Satellit).',
  detailed: `
    <p><strong>Mechanismus:</strong> Regentropfen streuen und absorbieren Radiowellen.</p>
    <p><strong>Typische Werte bei 28 GHz:</strong></p>
    <p>- Leichter Regen (4 mm/h): 1-2 dB/km<br/>
    - Starkregen (25 mm/h): 5-10 dB/km<br/>
    - Wolkenbruch (100 mm/h): 20+ dB/km</p>
    <p>Bei Satellitenlinks ist Regendämpfung ein kritischer Planungsfaktor.</p>
  `
};

// ============================================================================
// Spectrum Overview
// ============================================================================

export const EM_SPECTRUM: Explanation = {
  title: 'Elektromagnetisches Spektrum',
  short: 'Gesamtheit aller EM-Wellen von Radiowellen bis Gammastrahlen.',
  detailed: `
    <p><strong>Bereiche (aufsteigend nach Frequenz):</strong></p>
    <p>- Radiowellen: < 300 GHz<br/>
    - Infrarot: 300 GHz - 400 THz<br/>
    - Sichtbares Licht: 400-800 THz<br/>
    - Ultraviolett: 800 THz - 30 PHz<br/>
    - Roentgen: 30 PHz - 30 EHz<br/>
    - Gamma: > 30 EHz</p>
    <p>Funktechnik nutzt den Radiobereich (kHz bis THz).</p>
  `
};

export const SPECTRUM_USAGE: Explanation = {
  title: 'Spektrumsnutzung',
  short: 'Verschiedene Dienste teilen sich das Spektrum. Reguliert durch nationale/internationale Behörden.',
  detailed: `
    <p><strong>Zuteilungsarten:</strong></p>
    <p>- Lizenziert: Exklusiv für Betreiber<br/>
    - Unlizenziert (ISM): Frei nutzbar<br/>
    - Geteilt: Dynamischer Zugriff</p>
    <p><strong>Wichtige ISM-Bänder:</strong></p>
    <p>- 433 MHz: LoRa, Fernbedienungen<br/>
    - 868/915 MHz: LoRa, Smart Metering<br/>
    - 2,4 GHz: WLAN, Bluetooth, Mikrowelle<br/>
    - 5,8 GHz: WLAN, FPV-Drohnen</p>
  `
};

// ============================================================================
// Grouped exports for easy import
// ============================================================================

export const fsplExplanations = {
  fspl: FSPL,
  frequency: FREQUENCY,
  distance: DISTANCE,
  wavelength: WAVELENGTH
} as const;

export const linkBudgetExplanations = {
  eirp: EIRP,
  txPower: TX_POWER,
  txAntennaGain: TX_ANTENNA_GAIN,
  txCableLoss: TX_CABLE_LOSS,
  rxSensitivity: RX_SENSITIVITY,
  rxAntennaGain: RX_ANTENNA_GAIN,
  rxCableLoss: RX_CABLE_LOSS,
  fadingMargin: FADING_MARGIN,
  systemGain: SYSTEM_GAIN,
  linkMargin: LINK_MARGIN
} as const;

export const bandExplanations = {
  ieee: BAND_IEEE,
  nato: BAND_NATO,
  itu: BAND_ITU
} as const;

export const atmosphericExplanations = {
  general: ATMOSPHERIC_GENERAL,
  water22GHz: ATMOSPHERIC_22GHZ,
  oxygen60GHz: ATMOSPHERIC_60GHZ,
  rain: RAIN_ATTENUATION
} as const;

export const spectrumExplanations = {
  emSpectrum: EM_SPECTRUM,
  usage: SPECTRUM_USAGE
} as const;
