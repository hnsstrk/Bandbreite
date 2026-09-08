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
  return locations;
}
