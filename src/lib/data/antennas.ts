/**
 * Antennentypen mit typischem Gewinn, Öffnungswinkel, Fußpunktimpedanz,
 * relativer Bandbreite und Anwendung.
 *
 * Quellen:
 * - IEEE Std 145 (Definitions of Terms for Antennas)
 * - ITU-R BS.1195 und ITU-R F.699 (Antennendiagramme)
 * - Balanis, Antenna Theory (Standardwerte für Grundformen)
 *
 * Gewinnangaben in dBi beziehen sich auf den isotropen Kugelstrahler.
 * Der Bezug auf den Halbwellendipol (dBd) ist um GAIN_DIPOLE_DBI kleiner.
 */

// ============================================================================
// Konstanten und Formeln
// ============================================================================

/** Gewinn des verlustfreien Halbwellendipols gegenüber dem isotropen Strahler in dBi. */
export const GAIN_DIPOLE_DBI = 2.15;

/** Fußpunktwiderstand des freistehenden Halbwellendipols in Ohm. */
export const DIPOLE_IMPEDANCE_OHM = 73.1;

/** Fußpunktwiderstand des Viertelwellenstrahlers über idealer Massefläche in Ohm. */
export const MONOPOLE_IMPEDANCE_OHM = 36.5;

/** Übliche Systemimpedanz der Hochfrequenztechnik in Ohm. */
export const SYSTEM_IMPEDANCE_OHM = 50;

/** Typischer Flächenwirkungsgrad einer Parabolantenne (dimensionslos). */
export const PARABOLIC_EFFICIENCY_TYPICAL = 0.55;

/**
 * Faktor der Näherungsformel für den Halbwertsöffnungswinkel einer
 * Parabolantenne: θ ≈ BEAMWIDTH_FACTOR_DEG · λ / D (Winkel in Grad).
 */
export const BEAMWIDTH_FACTOR_DEG = 70;

/**
 * Gewinn einer Parabolantenne: G = η · (π · D / λ)².
 *
 * @param diameterM Spiegeldurchmesser in Metern
 * @param wavelengthM Wellenlänge in Metern
 * @param efficiency Flächenwirkungsgrad (0 bis 1)
 * @returns Gewinn als linearer Faktor
 */
export function parabolicGainLinear(
  diameterM: number,
  wavelengthM: number,
  efficiency: number = PARABOLIC_EFFICIENCY_TYPICAL
): number {
  if (diameterM <= 0 || wavelengthM <= 0) return 0;
  const ratio = (Math.PI * diameterM) / wavelengthM;
  return efficiency * ratio * ratio;
}

/**
 * Gewinn einer Parabolantenne in dBi.
 *
 * @param diameterM Spiegeldurchmesser in Metern
 * @param wavelengthM Wellenlänge in Metern
 * @param efficiency Flächenwirkungsgrad (0 bis 1)
 */
export function parabolicGainDbi(
  diameterM: number,
  wavelengthM: number,
  efficiency: number = PARABOLIC_EFFICIENCY_TYPICAL
): number {
  const linear = parabolicGainLinear(diameterM, wavelengthM, efficiency);
  if (linear <= 0) return -Infinity;
  return 10 * Math.log10(linear);
}

/**
 * Halbwertsöffnungswinkel einer Parabolantenne in Grad.
 *
 * @param diameterM Spiegeldurchmesser in Metern
 * @param wavelengthM Wellenlänge in Metern
 */
export function parabolicBeamwidthDeg(diameterM: number, wavelengthM: number): number {
  if (diameterM <= 0 || wavelengthM <= 0) return 0;
  return (BEAMWIDTH_FACTOR_DEG * wavelengthM) / diameterM;
}

/**
 * Gewinn einer phasengesteuerten Gruppenantenne aus N gleichartigen
 * Einzelstrahlern in dBi (idealisiert, ohne Verkopplung und Verluste).
 *
 * @param elementGainDbi Gewinn eines Einzelstrahlers in dBi
 * @param elementCount Anzahl der Einzelstrahler
 */
export function arrayGainDbi(elementGainDbi: number, elementCount: number): number {
  if (elementCount < 1) return elementGainDbi;
  return elementGainDbi + 10 * Math.log10(elementCount);
}

/**
 * Umrechnung dBd nach dBi.
 * @param gainDbd Gewinn bezogen auf den Halbwellendipol
 */
export function dbdToDbi(gainDbd: number): number {
  return gainDbd + GAIN_DIPOLE_DBI;
}

// ============================================================================
// Typen und Daten
// ============================================================================

/** Polarisation der abgestrahlten Welle. */
export type Polarization = 'linear' | 'zirkular' | 'beliebig';

/** Bauform einer Antenne. */
export type AntennaCategory = 'referenz' | 'draht' | 'richt' | 'flaechen' | 'gruppe';

export interface AntennaType {
  id: string;
  nameDE: string;
  category: AntennaCategory;
  /** Typischer Gewinn in dBi (unterer Wert) */
  gainMinDbi: number;
  /** Typischer Gewinn in dBi (oberer Wert) */
  gainMaxDbi: number;
  /** Typischer Halbwertsöffnungswinkel in Grad; 360 bei Rundstrahlern in der Ebene */
  beamwidthDeg: number;
  /** Typische Fußpunktimpedanz in Ohm; 0 falls nicht sinnvoll angebbar */
  impedanceOhm: number;
  /** Typische relative Bandbreite in Prozent der Mittenfrequenz */
  relativeBandwidthPercent: number;
  polarization: Polarization;
  descriptionDE: string;
  applicationsDE: string[];
  source: string;
}

export const ANTENNA_TYPES: AntennaType[] = [
  {
    id: 'isotrop',
    nameDE: 'Isotroper Kugelstrahler',
    category: 'referenz',
    gainMinDbi: 0,
    gainMaxDbi: 0,
    beamwidthDeg: 360,
    impedanceOhm: 0,
    relativeBandwidthPercent: 0,
    polarization: 'beliebig',
    descriptionDE:
      'Rein gedachte Antenne, die in alle Raumrichtungen gleich stark abstrahlt. ' +
      'Physikalisch nicht herstellbar, weil eine solche Abstrahlung kein widerspruchsfreies ' +
      'Feld ergibt. Dient ausschließlich als Bezugsgröße: alle Gewinnangaben in dBi ' +
      'beziehen sich auf sie.',
    applicationsDE: ['Bezugsgröße für Antennengewinn und EIRP'],
    source: 'IEEE Std 145',
  },
  {
    id: 'dipol',
    nameDE: 'Halbwellendipol (λ/2)',
    category: 'draht',
    gainMinDbi: GAIN_DIPOLE_DBI,
    gainMaxDbi: GAIN_DIPOLE_DBI,
    beamwidthDeg: 78,
    impedanceOhm: DIPOLE_IMPEDANCE_OHM,
    relativeBandwidthPercent: 10,
    polarization: 'linear',
    descriptionDE:
      'Zwei gestreckte Leiterhälften von je einer Viertelwellenlänge, in der Mitte ' +
      'gespeist. Strahlt senkrecht zur Drahtachse ringförmig ab und hat in Richtung ' +
      'der Drahtenden Nullstellen. Der zweite Bezugswert der Antennentechnik: ' +
      'Angaben in dBd rechnen sich mit 2,15 dB Zuschlag in dBi um.',
    applicationsDE: ['Empfangsantennen', 'Erregerelement in Richtantennen', 'Messantennen'],
    source: 'IEEE Std 145; Balanis',
  },
  {
    id: 'groundplane',
    nameDE: 'Groundplane (λ/4-Vertikalstrahler)',
    category: 'draht',
    gainMinDbi: 0,
    gainMaxDbi: 5.15,
    beamwidthDeg: 360,
    impedanceOhm: MONOPOLE_IMPEDANCE_OHM,
    relativeBandwidthPercent: 8,
    polarization: 'linear',
    descriptionDE:
      'Ein Viertelwellenstrahler über einer Massefläche, die das fehlende zweite ' +
      'Element spiegelt. Über idealer Erde erreicht die Bauform rechnerisch ' +
      'rund 5,15 dBi, weil die gesamte Leistung in den oberen Halbraum geht. ' +
      'Reale Radials, oft schräg abgewinkelt, senken den Gewinn und heben die ' +
      'Fußpunktimpedanz in Richtung 50 Ohm an.',
    applicationsDE: ['Mobilfunk- und Betriebsfunkantennen', 'CB-Funk', 'Basisstationen im Amateurfunk'],
    source: 'Balanis; IEEE Std 145',
  },
  {
    id: 'yagi',
    nameDE: 'Yagi-Uda-Antenne',
    category: 'richt',
    gainMinDbi: 6,
    gainMaxDbi: 20,
    beamwidthDeg: 45,
    impedanceOhm: SYSTEM_IMPEDANCE_OHM,
    relativeBandwidthPercent: 4,
    polarization: 'linear',
    descriptionDE:
      'Ein gespeistes Element, dahinter ein etwas längerer Reflektor und davor ' +
      'mehrere kürzere Direktoren. Nur das gespeiste Element hat einen ' +
      'Anschluss; die übrigen werden vom Feld angeregt und formen durch ihre ' +
      'Phasenlage eine ausgeprägte Hauptkeule. Gewinn und Bandbreite stehen im ' +
      'Zielkonflikt: je schärfer die Abstimmung, desto schmaler der nutzbare Bereich.',
    applicationsDE: ['Fernsehempfang', 'UKW-Weitverkehr im Amateurfunk', 'Richtstrecken auf VHF/UHF'],
    source: 'Balanis; IEEE Std 145',
  },
  {
    id: 'logper',
    nameDE: 'Logarithmisch-periodische Antenne',
    category: 'richt',
    gainMinDbi: 6,
    gainMaxDbi: 11,
    beamwidthDeg: 60,
    impedanceOhm: SYSTEM_IMPEDANCE_OHM,
    relativeBandwidthPercent: 150,
    polarization: 'linear',
    descriptionDE:
      'Eine Reihe von Dipolen, deren Längen und Abstände einer geometrischen Folge ' +
      'gehorchen. Je nach Frequenz ist ein anderer Teil der Struktur aktiv, wodurch ' +
      'sich Gewinn und Fußpunktimpedanz über ein sehr breites Band kaum ändern. ' +
      'Der Preis ist ein deutlich geringerer Gewinn als bei einer gleich langen Yagi.',
    applicationsDE: ['Messtechnik und EMV-Prüfungen', 'Breitband-Empfangsanlagen', 'Funküberwachung'],
    source: 'Balanis; IEEE Std 145',
  },
  {
    id: 'parabol',
    nameDE: 'Parabolantenne',
    category: 'flaechen',
    gainMinDbi: 15,
    gainMaxDbi: 70,
    beamwidthDeg: 2,
    impedanceOhm: SYSTEM_IMPEDANCE_OHM,
    relativeBandwidthPercent: 30,
    polarization: 'beliebig',
    descriptionDE:
      'Ein parabolisch geformter Reflektor bündelt die vom Erreger im Brennpunkt ' +
      'abgestrahlte Welle zu einem nahezu parallelen Bündel. Der Gewinn wächst mit ' +
      'dem Quadrat des Durchmessers und dem Quadrat der Frequenz: ' +
      'G = η · (π · D / λ)². Der Öffnungswinkel folgt näherungsweise θ ≈ 70° · λ / D. ' +
      'Der Flächenwirkungsgrad η liegt praktisch bei 0,5 bis 0,7, weil Erregerabschattung, ' +
      'Randüberstrahlung und Oberflächenfehler Leistung kosten.',
    applicationsDE: ['Satellitenempfang', 'Richtfunk', 'Radioastronomie', 'Radaranlagen'],
    source: 'ITU-R F.699; Balanis',
  },
  {
    id: 'horn',
    nameDE: 'Hornantenne',
    category: 'flaechen',
    gainMinDbi: 10,
    gainMaxDbi: 25,
    beamwidthDeg: 25,
    impedanceOhm: 0,
    relativeBandwidthPercent: 50,
    polarization: 'linear',
    descriptionDE:
      'Ein aufgeweiteter Hohlleiter, der den Wellenwiderstand allmählich an den ' +
      'freien Raum anpasst. Sehr gut berechenbar, verlustarm und breitbandig; ' +
      'deshalb als Gewinnnormal in der Messtechnik und als Erreger im Brennpunkt ' +
      'von Parabolspiegeln.',
    applicationsDE: ['Erreger für Parabolantennen', 'Gewinnnormale in der Messtechnik', 'Füllstandradar'],
    source: 'Balanis; IEEE Std 149',
  },
  {
    id: 'patch',
    nameDE: 'Patch- oder Streifenleitungsantenne',
    category: 'flaechen',
    gainMinDbi: 5,
    gainMaxDbi: 9,
    beamwidthDeg: 70,
    impedanceOhm: SYSTEM_IMPEDANCE_OHM,
    relativeBandwidthPercent: 3,
    polarization: 'beliebig',
    descriptionDE:
      'Eine metallische Fläche auf einem dünnen Trägermaterial mit durchgehender ' +
      'Rückseitenmasse. Flach, leicht und in Leiterplattentechnik herstellbar, ' +
      'dafür schmalbandig. Durch Speisung an zwei um 90 Grad versetzten Punkten ' +
      'lässt sich zirkulare Polarisation erzeugen, wie sie die Satellitennavigation ' +
      'benötigt.',
    applicationsDE: ['GNSS-Empfänger', 'WLAN-Module', 'Mobilfunkendgeräte', 'Bauelemente in Gruppenantennen'],
    source: 'Balanis; IEEE Std 145',
  },
  {
    id: 'helix',
    nameDE: 'Wendelantenne (axiale Betriebsart)',
    category: 'richt',
    gainMinDbi: 8,
    gainMaxDbi: 20,
    beamwidthDeg: 40,
    impedanceOhm: 140,
    relativeBandwidthPercent: 50,
    polarization: 'zirkular',
    descriptionDE:
      'Ein schraubenförmig gewickelter Leiter vor einer Massefläche. Ist der ' +
      'Wendelumfang etwa gleich der Wellenlänge, strahlt die Antenne in Achsrichtung ' +
      'zirkular polarisiert ab. Das ist für Satellitenverbindungen wertvoll, weil die ' +
      'Ausrichtung des Satelliten dann keine Rolle mehr spielt und der Faradaydrehung ' +
      'in der Ionosphäre begegnet wird.',
    applicationsDE: ['Satellitenfunk', 'Telemetrie von Raketen', 'GNSS-Referenzstationen'],
    source: 'Balanis; IEEE Std 145',
  },
  {
    id: 'phased-array',
    nameDE: 'Phasengesteuerte Gruppenantenne',
    category: 'gruppe',
    gainMinDbi: 15,
    gainMaxDbi: 45,
    beamwidthDeg: 5,
    impedanceOhm: SYSTEM_IMPEDANCE_OHM,
    relativeBandwidthPercent: 20,
    polarization: 'beliebig',
    descriptionDE:
      'Viele Einzelstrahler werden mit einstellbarer Phasenlage gespeist. Durch ' +
      'Verändern der Phasen lässt sich die Hauptkeule elektronisch schwenken, ohne ' +
      'dass sich etwas bewegt — mit Umschaltzeiten im Mikrosekundenbereich. ' +
      'Der Gewinn wächst idealisiert um 3 dB je Verdopplung der Elementzahl. ' +
      'Grundlage moderner Radaranlagen und der Strahlformung im 5G-Mobilfunk.',
    applicationsDE: ['Militär- und Wetterradar', '5G-Basisstationen', 'Satellitenterminals', 'Radioastronomie'],
    source: 'IEEE Std 145; 3GPP TR 38.803',
  },
];

/**
 * Liefert alle Antennentypen einer Bauform.
 * @param category Bauform
 */
export function getAntennasByCategory(category: AntennaCategory): AntennaType[] {
  return ANTENNA_TYPES.filter((a) => a.category === category);
}
