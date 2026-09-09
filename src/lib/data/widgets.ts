/**
 * Katalog der interaktiven Wissen-Widgets — reine Daten, ohne Svelte-Komponenten.
 *
 * Warum getrennt von `knowledge/widgetRegistry.ts`? Die Registry bildet
 * `WidgetId → Komponente` ab und zieht damit alle Widget-Komponenten in den
 * Bündel. Der Suchindex braucht aber nur Namen, Kapitel und Stichworte — er
 * importiert deshalb diese Datei, nicht die Registry. `widgetRegistry.ts`
 * reicht den Katalog für Komponenten weiter.
 *
 * **Neues Widget:** Komponente in `widgetRegistry.ts` eintragen, Metadaten
 * hier ergänzen. Ohne Metadaten funktioniert das Widget weiterhin, es taucht
 * nur nicht in der Suche auf (`widgetLocations()` und der Test in
 * `src/tests/widgetRegistry.test.ts` decken die Lücke auf).
 */

import type { CatalogWidgetId, KnowledgeArticle } from '$lib/content/types';
import { humanizeSegment } from '$lib/utils/slug';

/** Suchparameter des Widget-Deep-Links: `/wissen/radar/?w=doppler`. */
export const WIDGET_PARAM = 'w';

/** Anzeige- und Suchdaten eines Widgets. */
export interface WidgetMeta {
  id: CatalogWidgetId;
  /** Überschrift des Widgets, wie sie im Kapitel steht. */
  label: string;
  /** Ein Satz für Suchergebnis und Verweis. */
  description: string;
  /** Zusätzliche Suchbegriffe. */
  keywords: string[];
  /** Kanonisches Kapitel mit Trailing Slash (aus den Inhaltsdaten geprüft). */
  chapterHref: string;
  /**
   * Wie das Widget im Kapitel steht: `content` als `widget`-Block der
   * Inhaltsdaten (Regelfall, von `widgetLocations()` auffindbar) oder `markup`
   * direkt in der Seitenkomponente. Markup-Widgets tragen ihre Anker-ID
   * (`widgetAnchorId`) dort von Hand.
   */
  embed?: 'content' | 'markup';
}

/**
 * Metadaten je Widget. Der Schlüssel ist die ID aus `content/types.ts`;
 * `chapterHref` nennt das Kapitel, in dem das Widget beheimatet ist. Widgets,
 * die in mehreren Kapiteln stehen (etwa der Ausbreitungs-Sandkasten), tragen
 * hier ihr Stammkapitel — `widgetLocations()` kennt alle Fundstellen.
 */
export const WIDGET_META: Partial<Record<CatalogWidgetId, Omit<WidgetMeta, 'id'>>> = {
  'radar-pulse': {
    label: 'Impuls, Laufzeit und Eindeutigkeit',
    description:
      'Radarimpuls mit Impulsdauer, Laufzeit und Pulswiederholintervall — zeigt Blindbereich und eindeutige Reichweite.',
    keywords: ['Radar', 'Impuls', 'PRF', 'Laufzeit', 'Blindbereich', 'Eindeutigkeit'],
    chapterHref: '/wissen/radar/grundlagen/'
  },
  doppler: {
    label: 'Doppler-Verschiebung',
    description:
      'Wellenfronten eines bewegten Ziels: Annäherung staucht, Entfernung dehnt — mit Dopplerfrequenz und Vorzeichen.',
    keywords: ['Doppler', 'Radialgeschwindigkeit', 'Frequenzverschiebung', 'Radar'],
    chapterHref: '/wissen/radar/verfahren/'
  },
  'rcs-comparison': {
    label: 'Radarquerschnitt im Vergleich',
    description:
      'Typische Rückstreuquerschnitte vom Insekt bis zum Schiff auf logarithmischer Skala mit relativer Reichweite.',
    keywords: ['RCS', 'Rückstreuquerschnitt', 'Radarquerschnitt', 'Ziel', 'Radar'],
    chapterHref: '/wissen/radar/grundlagen/'
  },
  fresnel: {
    label: 'Fresnel-Zone und Hindernis',
    description:
      'Seitenriss einer Funkstrecke mit der ersten Fresnel-Zone und einem Hindernis — prüft die 60-%-Regel.',
    keywords: ['Fresnel', 'Fresnel-Zone', 'Hindernis', 'Sichtverbindung', 'Freihaltung'],
    chapterHref: '/wissen/wellenausbreitung/'
  },
  decibel: {
    label: 'Dezibel-Spielplatz',
    description:
      'Übertragungskette in dBm: jede Stufe verlängert oder kürzt den Pegelbalken, Gewinne und Verluste addieren sich.',
    keywords: ['Dezibel', 'dB', 'dBm', 'Pegel', 'Gewinn', 'Verlust'],
    chapterHref: '/wissen/mathematik/'
  },
  'attenuation-windows': {
    label: 'Atmosphärische Fenster',
    description:
      'Dämpfungskurve der Atmosphäre von 1 bis 350 GHz mit den Resonanzen von Wasserdampf und Sauerstoff.',
    keywords: ['Dämpfung', 'Atmosphäre', 'Fenster', 'Wasserdampf', 'Sauerstoff', 'ITU-R P.676'],
    chapterHref: '/wissen/wellenausbreitung/'
  },
  'propagation-sandbox': {
    label: 'Ausbreitungs-Sandkasten',
    description:
      'Bodenwelle, Raumwelle oder Sichtverbindung — welcher Ausbreitungsweg trägt bei welcher Frequenz und Entfernung?',
    keywords: ['Bodenwelle', 'Raumwelle', 'Radiohorizont', 'Ausbreitung', 'Sandkasten'],
    chapterHref: '/wissen/wellenausbreitung/'
  },
  'wave-propagation-diagram': {
    label: 'Wellenausbreitung im Vergleich',
    description:
      'Vier Ausbreitungswege im Seitenriss der Atmosphäre: Boden-, Raum- und Troposphärenwelle sowie Sichtverbindung.',
    keywords: ['Ausbreitungswege', 'Bodenwelle', 'Raumwelle', 'Troposphäre', 'Sichtverbindung'],
    chapterHref: '/wissen/wellenausbreitung/'
  },
  fmcw: {
    label: 'FMCW: Rampe, Laufzeit, Beat-Frequenz',
    description:
      'Sende- und Empfangsrampe im Frequenz-Zeit-Diagramm: Bandbreite und Rampendauer bestimmen Beat-Frequenz und Entfernungsauflösung.',
    keywords: ['FMCW', 'Chirp', 'Beat-Frequenz', 'Rampe', 'Automotive-Radar', 'Auflösung'],
    chapterHref: '/wissen/radar/verfahren/'
  },
  'blind-speed': {
    label: 'Blindgeschwindigkeiten und gestaffelte PRF',
    description:
      'Antwortkurve eines Festzeichenfilters mit den Blindgeschwindigkeiten v_b = n·λ·PRF/2 und dem Gewinn durch zwei gestaffelte PRFs.',
    keywords: ['MTI', 'Blindgeschwindigkeit', 'PRF', 'Staffelung', 'Festzeichen', 'Doppler'],
    chapterHref: '/wissen/radar/verfahren/'
  },
  'ssr-interrogation': {
    label: 'Sekundärradar: Abfrage und Antwort',
    description:
      'Zeitdiagramm der Modi A, C und S: Impulsabstände auf 1030 MHz, Antwortrahmen auf 1090 MHz und das Impulsbild eines Squawk-Codes.',
    keywords: ['SSR', 'Sekundärradar', 'Mode S', 'Squawk', 'Transponder', '1030 MHz', '1090 MHz'],
    chapterHref: '/wissen/radar/sekundaerradar/'
  },
  'ionospheric-propagation': {
    label: 'Ionosphärische Ausbreitung',
    description:
      'Reflexionspfad an D-, E- und F-Schicht mit MUF, LUF und Sprungdistanz für die eingestellte Frequenz.',
    keywords: ['Ionosphäre', 'MUF', 'LUF', 'Sprungdistanz', 'Kurzwelle', 'Reflexion'],
    chapterHref: '/wissen/wellenausbreitung/ionosphaere/'
  },
  'em-wave': {
    label: 'E-Feld, H-Feld und Polarisation',
    description:
      'Laufende ebene Welle mit senkrecht aufeinander stehendem E- und H-Feld; Frontansicht des E-Vektors bei linearer und zirkularer Polarisation.',
    keywords: [
      'EM-Welle',
      'E-Feld',
      'H-Feld',
      'Polarisation',
      'zirkular',
      'RHCP',
      'LHCP',
      'Wellenlänge',
      'Photonenenergie'
    ],
    chapterHref: '/wissen/grundlagen/em-wellen/'
  },
  'field-strength': {
    label: 'Sendeleistung, EIRP und Feldstärke',
    description:
      'Von der Sendeleistung über EIRP und ERP zur Leistungsdichte und zur elektrischen Feldstärke in V/m und dBµV/m.',
    keywords: ['EIRP', 'ERP', 'Feldstärke', 'Leistungsdichte', 'dBµV/m', 'V/m', 'Sendeleistung'],
    chapterHref: '/wissen/grundlagen/leistung-und-pegel/'
  },
  'near-far-field': {
    label: 'Nahfeld, Übergangszone und Fernfeld',
    description:
      'Die drei Feldzonen um eine Antenne auf einer logarithmischen Abstandsachse — Grenzen aus λ/2π, 0,62·√(D³/λ) und 2·D²/λ.',
    keywords: ['Nahfeld', 'Fernfeld', 'Fraunhofer', 'Fresnel-Zone', 'Apertur', 'Messabstand'],
    chapterHref: '/wissen/grundlagen/em-wellen/'
  },
  'polarization-loss': {
    label: 'Polarisationsverlust bei Verdrehung',
    description:
      'Zwei lineare Antennen gegeneinander verdreht: cos²α bestimmt, wie viel Leistung ankommt — mit Verlustkurve bis zur Kreuzpolarisation.',
    keywords: ['Polarisation', 'Polarisationsverlust', 'cos²', 'Kreuzpolarisation', 'zirkular'],
    chapterHref: '/wissen/grundlagen/em-wellen/'
  },
  'log-linear': {
    label: 'Linear oder logarithmisch',
    description:
      'Dieselben Faktoren auf linearer und auf Dezibel-Skala: aus Multiplikation wird Addition, aus sechs Dekaden werden 60 dB.',
    keywords: ['Dezibel', 'logarithmisch', 'linear', 'Multiplikation', 'Addition', 'Dekade'],
    chapterHref: '/wissen/grundlagen/dezibel/'
  },
  'inverse-square': {
    label: 'Kugelausbreitung: warum 1/d²',
    description:
      'Die Leistung verteilt sich auf die Kugelfläche 4π·d² — Leistungsdichte und Feldstärke über dem Abstand, 6 dB je Verdopplung.',
    keywords: ['Leistungsdichte', 'Abstandsgesetz', 'Kugelfläche', 'Feldstärke', 'EIRP', '1/d²'],
    chapterHref: '/wissen/grundlagen/leistung-und-pegel/'
  },
  phasor: {
    label: 'Zeigerdiagramm: Sinus, Amplitude, Phase',
    description:
      'Rotierende Zeiger und die zugehörigen Sinusschwingungen; zwei Zeiger addieren sich zu Amplitude und Phase der Summe.',
    keywords: ['Zeiger', 'Phasor', 'Sinus', 'Amplitude', 'Phase', 'Interferenz', 'Addition'],
    chapterHref: '/wissen/mathematik/'
  },
  'fourier-synthesis': {
    label: 'Fourier-Synthese: Signal aus Harmonischen',
    description:
      'Rechteck, Dreieck und Sägezahn aus n Harmonischen mit Linienspektrum und dem Gibbsschen Überschwingen.',
    keywords: ['Fourier', 'Harmonische', 'Oberwelle', 'Spektrum', 'Rechteck', 'Gibbs'],
    chapterHref: '/wissen/mathematik/'
  },
  'two-ray': {
    label: 'Zweiwege-Ausbreitung und Mehrwegeschwund',
    description:
      'Direkte und bodenreflektierte Welle überlagern sich: Gipfel, Einbrüche, Bruchdistanz und der Übergang zum d⁴-Gesetz.',
    keywords: [
      'Mehrwege',
      'Zweiwege',
      'Two-Ray',
      'Schwund',
      'Fading',
      'Bruchdistanz',
      'Bodenreflexion'
    ],
    chapterHref: '/wissen/wellenausbreitung/'
  },
  'ionosphere-day-night': {
    label: 'Ionosphäre im Tagesgang',
    description:
      'D-, E-, F1- und F2-Schicht über 24 Stunden: Elektronendichte, kritische Frequenzen, MUF und die Absorption der D-Schicht.',
    keywords: ['Ionosphäre', 'D-Schicht', 'F2', 'Tagesgang', 'foF2', 'MUF', 'Absorption'],
    chapterHref: '/wissen/wellenausbreitung/ionosphaere/'
  },

  'cell-reuse': {
    label: 'Zellraster und Frequenzwiederverwendung',
    description:
      'Sechseckraster mit wählbarer Clustergröße: Wiederverwendungsabstand D = R·√(3N), Störabstand und Kanäle je Zelle.',
    keywords: [
      'Zelle',
      'Cluster',
      'Frequenzwiederverwendung',
      'Handover',
      'Störabstand',
      'Mobilfunk'
    ],
    chapterHref: '/wissen/funktechnik/mobilfunk/'
  },
  'fm-multiplex': {
    label: 'UKW-Multiplex und Carson-Bandbreite',
    description:
      'Basisbandspektrum des UKW-Senders — Summensignal, Pilotton, Differenzsignal und RDS — und die daraus folgende belegte Bandbreite.',
    keywords: ['UKW', 'MPX', 'Pilotton', 'RDS', 'Stereo', 'Carson', 'Frequenzhub'],
    chapterHref: '/wissen/funktechnik/rundfunk/'
  },
  'dab-sfn': {
    label: 'DAB-Gleichwellennetz und Schutzintervall',
    description:
      'Zwei Sender auf derselben Frequenz: Laufzeitunterschied gegen das Schutzintervall, Gewinn oder Störung.',
    keywords: ['DAB', 'Gleichwellennetz', 'SFN', 'Schutzintervall', 'COFDM', 'Echo'],
    chapterHref: '/wissen/funktechnik/rundfunk/'
  },
  'mode-bandwidth': {
    label: 'Betriebsarten im Maßstab',
    description:
      'Belegte Bandbreite von FT8 bis ATV im Maßstab, mit der aufgenommenen Rauschleistung N = k·T·B und dem Gewinn gegenüber SSB.',
    keywords: ['Betriebsart', 'Bandbreite', 'FT8', 'CW', 'SSB', 'Rauschen', 'Amateurfunk'],
    chapterHref: '/wissen/funktechnik/amateurfunk/'
  },
  'vor-radial': {
    label: 'VOR: Radial aus dem Phasenvergleich',
    description:
      'Umlaufendes Richtdiagramm, Referenzsignal und Kursablageanzeige — die Phasendifferenz beider 30-Hz-Signale ist der Radial.',
    keywords: ['VOR', 'Radial', 'Phasenvergleich', 'Navigation', 'CDI', 'Flugfunk'],
    chapterHref: '/wissen/funktechnik/flugfunk/'
  },
  'leo-pass': {
    label: 'LEO-Überflug: Elevation und Doppler',
    description:
      'Elevation, Schrägentfernung und Dopplerverschiebung über der Zeit eines Satellitendurchgangs.',
    keywords: ['LEO', 'Überflug', 'Elevation', 'Doppler', 'Sichtbarkeit', 'Satellit'],
    chapterHref: '/wissen/funktechnik/satellitenfunk/'
  },
  'maritime-duplex': {
    label: 'Seefunk: Ein- und Zweifrequenzbetrieb',
    description:
      'Schiffs- und Küstenfrequenz eines UKW-Seefunkkanals mit 4,6 MHz Duplexabstand und dem Zeitbild von Wechsel- und Gegensprechen.',
    keywords: ['Seefunk', 'Simplex', 'Duplex', 'Kanal', 'Küstenfunkstelle', 'Appendix 18'],
    chapterHref: '/wissen/funktechnik/seefunk/'
  },
  'radar-range': {
    label: 'Radargleichung: Reichweite über Sendeleistung',
    description:
      'Kurve der maximalen Reichweite über der Sendeleistung — die vierte Wurzel macht sechzehnfache Leistung für doppelte Reichweite nötig.',
    keywords: ['Radargleichung', 'Reichweite', 'Sendeleistung', 'RCS', 'Antennengewinn', 'Skolnik'],
    chapterHref: '/wissen/radar/grundlagen/'
  },
  'pulse-compression': {
    label: 'Pulskompression: Chirp und angepasstes Filter',
    description:
      'Langer Chirp und komprimierter Impuls auf derselben Zeitachse: Kompressionsgewinn B·τ und Auflösung c/(2·B).',
    keywords: [
      'Pulskompression',
      'Chirp',
      'angepasstes Filter',
      'Zeit-Bandbreite-Produkt',
      'Nebenzipfel'
    ],
    chapterHref: '/wissen/radar/verfahren/'
  },
  'mode-s-frame': {
    label: 'Modus-S-Antwort DF17 im Bitfeld',
    description:
      'Antwortrahmen einer ADS-B-Aussendung: Preambel, Formatkennung, ICAO-Adresse, Nachrichtenfeld und Prüfsumme im Zeitraster.',
    keywords: ['Mode S', 'DF17', 'ADS-B', 'ICAO-Adresse', 'Bitfeld', 'Pulslagemodulation'],
    chapterHref: '/wissen/radar/sekundaerradar/'
  },

  // --- Widgets im Markup-Betrieb (Kapitelseiten ohne Inhaltsdaten) ---
  'modulation-visualizer': {
    label: 'Modulations-Visualisierer',
    description:
      'AM, FM, PM und die digitalen Verfahren im Zeitverlauf und im Spektrum — Regler für Modulationsgrad, Hub und Symbolrate.',
    keywords: ['Modulation', 'AM', 'FM', 'PM', 'Zeitverlauf', 'Spektrum', 'Hüllkurve'],
    chapterHref: '/wissen/modulation/',
    embed: 'markup'
  },
  constellation: {
    label: 'Konstellation mit Rauschen',
    description:
      'Konstellationsdiagramm von BPSK bis 64-QAM: Der Störabstand verwischt die Symbolwolken, bis benachbarte Punkte sich berühren.',
    keywords: ['Konstellation', 'IQ', 'QPSK', 'QAM', 'PSK', 'Störabstand', 'EVM'],
    chapterHref: '/wissen/modulation/',
    embed: 'markup'
  },
  carson: {
    label: 'Carson-Rechner',
    description:
      'Bandbreite einer frequenzmodulierten Aussendung nach der Carson-Formel B = 2·(Δf + f_max).',
    keywords: ['Carson', 'FM', 'Bandbreite', 'Frequenzhub', 'Modulationsindex'],
    chapterHref: '/wissen/modulation/',
    embed: 'markup'
  },
  'antenna-pattern': {
    label: 'Polardiagramm-Generator',
    description:
      'Richtdiagramm von Isotropstrahler, Dipol, Yagi und Parabol mit Halbwertsbreite, Nebenkeulen und Vor-Rück-Verhältnis.',
    keywords: ['Richtdiagramm', 'Polardiagramm', 'Halbwertsbreite', 'Nebenkeule', 'Dipol', 'Yagi'],
    chapterHref: '/wissen/antennen/',
    embed: 'markup'
  },
  'parabolic-gain': {
    label: 'Parabolantennen-Rechner',
    description:
      'Gewinn, Halbwertsbreite und Fernfeldabstand einer Parabolantenne aus Durchmesser, Frequenz und Wirkungsgrad.',
    keywords: ['Parabol', 'Gewinn', 'Apertur', 'Wirkfläche', 'Fernfeld', 'Halbwertsbreite'],
    chapterHref: '/wissen/antennen/',
    embed: 'markup'
  },
  swr: {
    label: 'Anpassung im Zusammenhang',
    description:
      'Stehwellenverhältnis, Reflexionsfaktor, Rückflussdämpfung und Fehlanpassungsverlust im Zusammenhang.',
    keywords: ['SWR', 'VSWR', 'Reflexionsfaktor', 'Rückflussdämpfung', 'Anpassung', 'Impedanz'],
    chapterHref: '/wissen/antennen/',
    embed: 'markup'
  },
  'dipole-current': {
    label: 'Dipol: Strom und Spannung auf dem Draht',
    description:
      'Stehende Welle auf dem mittengespeisten Dipol: Strombauch, Stromknoten und was daraus für die Fußpunktimpedanz folgt.',
    keywords: [
      'Dipol',
      'Stromverteilung',
      'Spannungsverteilung',
      'stehende Welle',
      'Speisepunkt',
      'Fußpunktimpedanz'
    ],
    chapterHref: '/wissen/antennen/',
    embed: 'markup'
  },
  ofdm: {
    label: 'OFDM: orthogonale Unterträger',
    description:
      'Si-förmige Trägerspektren im Abstand Δf = 1/T_s: Sie überlappen sich und stören sich trotzdem nicht.',
    keywords: ['OFDM', 'Unterträger', 'Orthogonalität', 'Symboldauer', 'LTE', 'DVB-T', 'si'],
    chapterHref: '/wissen/modulation/',
    embed: 'markup'
  }
};

/** Alle Widgets mit Metadaten, in der Reihenfolge des Katalogs. */
export const WIDGET_ENTRIES: WidgetMeta[] = Object.entries(WIDGET_META).map(([id, meta]) => ({
  id: id as CatalogWidgetId,
  ...(meta as Omit<WidgetMeta, 'id'>)
}));

/** Widgets, die als `widget`-Block in Kapiteldaten stehen. */
export const CONTENT_WIDGET_ENTRIES: WidgetMeta[] = WIDGET_ENTRIES.filter(
  (entry) => entry.embed !== 'markup'
);

/** Widgets, die in einer Kapitelseite direkt im Markup stehen. */
export const MARKUP_WIDGET_ENTRIES: WidgetMeta[] = WIDGET_ENTRIES.filter(
  (entry) => entry.embed === 'markup'
);

/** IDs, für die Metadaten gepflegt sind. */
export const KNOWN_WIDGET_IDS: string[] = WIDGET_ENTRIES.map((entry) => entry.id);

/** Anker-ID des Widgets im Kapitel — Ziel des Deep-Links. */
export function widgetAnchorId(id: string): string {
  return `widget-${id}`;
}

/** Teilbarer Pfad eines Widgets: Kapitel plus `?w=<id>`. */
export function widgetHref(meta: WidgetMeta): string {
  return `${meta.chapterHref}?${WIDGET_PARAM}=${meta.id}`;
}

/** Metadaten zu einer ID (oder `undefined`, wenn keine gepflegt sind). */
export function findWidget(id: string | null | undefined): WidgetMeta | undefined {
  if (!id) return undefined;
  return WIDGET_ENTRIES.find((entry) => entry.id === id);
}

/**
 * Liest `?w=<id>` aus Suchparametern. Unbekannte Kennungen ergeben `null`,
 * damit kein fremder Wert in eine Anker-ID gerät.
 */
export function parseWidgetParam(
  params: URLSearchParams | string | null | undefined,
  known: readonly string[] = KNOWN_WIDGET_IDS
): string | null {
  if (!params) return null;
  const search = typeof params === 'string' ? new URLSearchParams(params) : params;
  const raw = (search.get(WIDGET_PARAM) ?? '').trim();
  return raw && known.includes(raw) ? raw : null;
}

/** Fallback-Bezeichnung für ein Widget ohne Katalogeintrag. */
export function widgetLabel(id: string): string {
  return findWidget(id)?.label ?? humanizeSegment(id);
}

// ============================================================================
// Fundstellen aus den Kapiteldaten
// ============================================================================

/** Sieht ein unbekannter Modulexport wie ein Kapitel aus? */
function isKnowledgeArticle(value: unknown): value is KnowledgeArticle {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<KnowledgeArticle>;
  return typeof candidate.href === 'string' && Array.isArray(candidate.sections);
}

/** Widget-IDs eines Kapitels, in Lesereihenfolge und ohne Dubletten. */
export function widgetIdsInArticle(article: KnowledgeArticle): string[] {
  const found: string[] = [];
  const walk = (sections: KnowledgeArticle['sections']) => {
    for (const section of sections) {
      for (const block of section.blocks) {
        if (block.type === 'widget' && !found.includes(block.id)) found.push(block.id);
      }
      if (section.children?.length) walk(section.children);
    }
  };
  walk(article.sections);
  return found;
}

/**
 * Fundstellen aller Widgets: `WidgetId → Kapitel-hrefs`.
 *
 * Die Kapitel werden erst beim Aufruf geladen (`import.meta.glob` ohne
 * `eager`), damit der Suchindex im Layout nicht sämtliche Kapiteltexte
 * mitzieht. Neue Kapiteldateien in `src/lib/content/` — auch in Unterordnern —
 * werden automatisch berücksichtigt.
 */
export async function widgetLocations(): Promise<Record<string, string[]>> {
  // Auch Unterordner (z. B. `content/grundlagen/`) werden erfasst.
  const modules = import.meta.glob<Record<string, unknown>>('/src/lib/content/**/*.ts');
  const locations: Record<string, string[]> = {};
  for (const load of Object.values(modules)) {
    const module = await load();
    for (const exported of Object.values(module)) {
      if (!isKnowledgeArticle(exported)) continue;
      for (const id of widgetIdsInArticle(exported)) {
        (locations[id] ??= []).push(exported.href);
      }
    }
  }

  // Die Funktechnik-Kapitel halten ihre Abschnitte im knapperen Blockmodell
  // (`content/funktechnik/types.ts`) und kennen ihren Pfad nicht selbst — er
  // steckt im Dateinamen.
  const funkModules = import.meta.glob<Record<string, unknown>>(
    '/src/lib/content/funktechnik/*.ts'
  );
  for (const [path, load] of Object.entries(funkModules)) {
    const href = funkChapterHref(path);
    if (!href) continue;
    const module = await load();
    for (const exported of Object.values(module)) {
      for (const id of widgetIdsInFunkSections(exported)) {
        const found = (locations[id] ??= []);
        if (!found.includes(href)) found.push(href);
      }
    }
  }

  return locations;
}

/** Hilfsdateien der Funktechnik-Kapitel, die keine eigene Seite haben. */
const FUNK_HELPER_FILES = ['types', 'adapt', 'quellen'];

/** Kapitelpfad einer Funktechnik-Datei: `mobilfunk.ts` → `/wissen/funktechnik/mobilfunk/`. */
export function funkChapterHref(path: string): string | null {
  const match = /\/content\/funktechnik\/([a-z0-9-]+)\.ts$/.exec(path);
  if (!match || FUNK_HELPER_FILES.includes(match[1])) return null;
  return `/wissen/funktechnik/${match[1]}/`;
}

/** Widget-Kennungen in den Abschnitten eines Funktechnik-Kapitels. */
export function widgetIdsInFunkSections(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const found: string[] = [];
  for (const section of value) {
    const blocks = (section as { blocks?: unknown })?.blocks;
    if (!Array.isArray(blocks)) continue;
    for (const block of blocks) {
      const candidate = block as { kind?: string; id?: string };
      if (candidate?.kind === 'widget' && candidate.id && !found.includes(candidate.id)) {
        found.push(candidate.id);
      }
    }
  }
  return found;
}
