/**
 * Beziehungsmodell für „Verwandte Themen".
 *
 * Ersetzt die handgeschriebenen Linkblöcke am Ende einzelner Seiten. Jede
 * Seite nennt 3–6 Verweise, davon mindestens einer in einen anderen Bereich
 * (Wissen → Rechner, Datenbank → Wissen …). Rückverweise werden zur Laufzeit
 * automatisch ergänzt, damit keine Einbahnstraßen entstehen.
 *
 * Ziel-IDs beziehen sich auf `NAV_TREE` in `navigation.ts`.
 */

import { findNode, findNodeById, normalizeHref, type NavNode } from './navigation';

export interface RelatedRef {
  /** ID eines Knotens aus NAV_TREE. */
  id: string;
  /** Warum lohnt sich der Sprung? Ein knapper Halbsatz. */
  reason: string;
}

export interface RelatedTopic {
  node: NavNode;
  reason: string;
}

/** Handgepflegte Verweise je Quellseite (ID aus NAV_TREE). */
export const RELATIONS: Record<string, RelatedRef[]> = {
  spektrum: [
    { id: 'datenbanken.frequenzbaender', reason: 'Alle Bänder im Detail nachschlagen' },
    { id: 'konverter.frequenz', reason: 'Frequenz und Wellenlänge umrechnen' },
    { id: 'spektrum.anwendungen', reason: 'Sehen, wer welches Band nutzt' },
    { id: 'wissen.wellenausbreitung', reason: 'Verstehen, wie die Wellen laufen' }
  ],
  'spektrum.anwendungen': [
    { id: 'datenbanken.funkdienste', reason: 'Zuweisungen filtern und durchsuchen' },
    { id: 'datenbanken.frequenzbaender', reason: 'Das zugehörige Band nachschlagen' },
    { id: 'wissen.funktechnik.funkdienste', reason: 'Die Systematik dahinter lesen' },
    { id: 'spektrum', reason: 'Zurück zur Spektrumsübersicht' },
    { id: 'wissen.wellenausbreitung', reason: 'Warum ein Dienst dieses Band nutzt' }
  ],
  'spektrum.sendeleistungen': [
    { id: 'rechner.link-budget', reason: 'Eigene Leistungsbilanz rechnen' },
    { id: 'datenbanken.sender', reason: 'Konkrete Sender mit Leistungsangabe' },
    { id: 'rechner.fspl', reason: 'Wie viel Leistung der Weg kostet' },
    { id: 'wissen.mathematik', reason: 'Dezibel und Pegel nachschlagen' }
  ],
  'spektrum.daempfung': [
    { id: 'rechner.link-budget', reason: 'Dämpfung in die Bilanz übernehmen' },
    { id: 'rechner.fspl', reason: 'Freiraumdämpfung als Grundanteil' },
    { id: 'wissen.wellenausbreitung', reason: 'Ausbreitung im Gesamtbild' },
    { id: 'spektrum', reason: 'Die Peaks im Spektrum einordnen' }
  ],
  'spektrum.ionosphaere': [
    { id: 'wissen.wellenausbreitung', reason: 'Alle Ausbreitungsmodi im Überblick' },
    { id: 'datenbanken.frequenzbaender', reason: 'Kurzwellenbänder nachschlagen' },
    { id: 'rechner.fspl', reason: 'Reichweite einer Verbindung abschätzen' },
    { id: 'wissen.funktechnik.amateurfunk', reason: 'Praxis der Kurzwellenausbreitung' }
  ],
  rechner: [
    { id: 'wissen.mathematik', reason: 'Die Formeln hinter den Rechnern' },
    { id: 'konverter', reason: 'Einheiten umrechnen' },
    { id: 'spektrum', reason: 'Frequenz im Spektrum einordnen' },
    { id: 'datenbanken.frequenzbaender', reason: 'Passendes Band suchen' }
  ],
  'rechner.fspl': [
    { id: 'wissen.mathematik', reason: 'Herleitung der FSPL-Formel' },
    { id: 'rechner.link-budget', reason: 'Vollständige Signalpfad-Analyse' },
    { id: 'spektrum.daempfung', reason: 'Atmosphärische Zusatzdämpfung' },
    { id: 'wissen.wellenausbreitung', reason: 'Wann die Freiraumformel gilt' }
  ],
  'rechner.link-budget': [
    { id: 'rechner.fspl', reason: 'Den Pfadverlust einzeln betrachten' },
    { id: 'rechner.fresnel', reason: 'Hindernisfreiheit prüfen' },
    { id: 'wissen.antennen', reason: 'Antennengewinn richtig ansetzen' },
    { id: 'spektrum.sendeleistungen', reason: 'Typische Sendeleistungen vergleichen' }
  ],
  'rechner.radar': [
    { id: 'wissen.radar', reason: 'Radargrundlagen und Verfahren' },
    { id: 'wissen.mathematik', reason: 'Radargleichung Schritt für Schritt' },
    { id: 'datenbanken.frequenzbaender', reason: 'Radarbänder nachschlagen' },
    { id: 'rechner.fspl', reason: 'Vergleich mit der Einwegdämpfung' }
  ],
  'rechner.kanalkapazitaet': [
    { id: 'wissen.mathematik', reason: 'Shannon-Hartley hergeleitet' },
    { id: 'wissen.modulation', reason: 'Welches Verfahren wie viel SNR braucht' },
    { id: 'rechner.link-budget', reason: 'Das nötige SNR nachweisen' },
    { id: 'wissen.funktechnik.mobilfunk', reason: 'Datenraten im Mobilfunk' },
    { id: 'spektrum', reason: 'Bandbreite im Spektrum einordnen' }
  ],
  'rechner.skin-tiefe': [
    { id: 'wissen.mathematik', reason: 'Formel und Materialkonstanten' },
    { id: 'wissen.antennen', reason: 'Leitermaterial und Verluste' },
    { id: 'spektrum', reason: 'Frequenzabhängigkeit im Spektrum' },
    { id: 'rechner.fspl', reason: 'Dämpfung im freien Raum vergleichen' }
  ],
  'rechner.fresnel': [
    { id: 'rechner.link-budget', reason: 'Zusatzverluste durch Hindernisse' },
    { id: 'wissen.wellenausbreitung', reason: 'Beugung und Sichtverbindung' },
    { id: 'rechner.fspl', reason: 'Grunddämpfung der Strecke' }
  ],
  konverter: [
    { id: 'konverter.frequenz', reason: 'Frequenz und Wellenlänge umrechnen' },
    { id: 'spektrum', reason: 'Frequenz im Spektrum einordnen' },
    { id: 'rechner', reason: 'Weiter zu den Rechnern' }
  ],
  'konverter.frequenz': [
    { id: 'spektrum', reason: 'Frequenz im Spektrum einordnen' },
    { id: 'datenbanken.frequenzbaender', reason: 'Zugehöriges Band nachschlagen' },
    { id: 'rechner.fspl', reason: 'Dämpfung für diese Frequenz rechnen' },
    { id: 'wissen.antennen', reason: 'Antennenlänge aus der Wellenlänge' }
  ],
  wissen: [
    { id: 'rechner', reason: 'Das Gelesene direkt nachrechnen' },
    { id: 'datenbanken', reason: 'Zahlen und Bänder nachschlagen' },
    { id: 'spektrum', reason: 'Alles im Spektrum verorten' },
    { id: 'service.sitemap', reason: 'Alle Kapitel auf einen Blick' }
  ],
  'wissen.wellenausbreitung': [
    { id: 'spektrum.ionosphaere', reason: 'Die Schichten im Detail' },
    { id: 'spektrum.daempfung', reason: 'Dämpfung durch die Atmosphäre' },
    { id: 'rechner.fspl', reason: 'Freiraumdämpfung berechnen' },
    { id: 'rechner.fresnel', reason: 'Hindernisfreiheit bestimmen' },
    { id: 'datenbanken.frequenzbaender', reason: 'Ausbreitung je Band vergleichen' }
  ],
  'wissen.funktechnik': [
    { id: 'datenbanken.funkdienste', reason: 'Die Zuweisungen als Datenbank' },
    { id: 'datenbanken.frequenzbaender', reason: 'Bänder der Dienste nachschlagen' },
    { id: 'spektrum.anwendungen', reason: 'Dienste im Spektrum sehen' },
    { id: 'wissen.modulation', reason: 'Wie die Dienste übertragen' },
    { id: 'wissen.wellenausbreitung', reason: 'Physik hinter den Funkdiensten' }
  ],
  'wissen.funktechnik.funkdienste': [
    { id: 'datenbanken.funkdienste', reason: 'Zuweisungen filtern' },
    { id: 'datenbanken.frequenzbaender', reason: 'Bandgrenzen nachschlagen' },
    { id: 'spektrum.anwendungen', reason: 'Dienste im Spektrum sehen' }
  ],
  'wissen.funktechnik.amateurfunk': [
    { id: 'datenbanken.frequenzbaender', reason: 'Amateurfunkbänder im Detail' },
    { id: 'spektrum.ionosphaere', reason: 'Wann welches Band offen ist' },
    { id: 'rechner.fspl', reason: 'Reichweite abschätzen' }
  ],
  'wissen.funktechnik.mobilfunk': [
    { id: 'rechner.link-budget', reason: 'Zellplanung nachrechnen' },
    { id: 'rechner.kanalkapazitaet', reason: 'Datenrate aus Bandbreite und SNR' },
    { id: 'wissen.modulation', reason: 'OFDM und QAM verstehen' },
    { id: 'datenbanken.funkdienste', reason: 'Alle Mobilfunkbänder ansehen' }
  ],
  'wissen.funktechnik.rundfunk': [
    { id: 'datenbanken.sender', reason: 'Reale Sender nachschlagen' },
    { id: 'spektrum.sendeleistungen', reason: 'Sendeleistungen vergleichen' },
    { id: 'wissen.modulation', reason: 'AM, FM und DAB im Vergleich' },
    { id: 'datenbanken.frequenzbaender', reason: 'Rundfunkbänder im Detail' }
  ],
  'wissen.modulation': [
    { id: 'rechner.kanalkapazitaet', reason: 'Bandbreite gegen Datenrate' },
    { id: 'wissen.funktechnik.mobilfunk', reason: 'Modulation in der Praxis' },
    { id: 'wissen.mathematik', reason: 'Dezibel, SNR und Bandbreite' },
    { id: 'wissen.radar', reason: 'Puls- und FMCW-Verfahren' }
  ],
  'wissen.antennen': [
    { id: 'rechner.link-budget', reason: 'Gewinn in die Bilanz einsetzen' },
    { id: 'rechner.fresnel', reason: 'Aufbauhöhe und Sichtlinie' },
    { id: 'konverter.frequenz', reason: 'Antennenlänge aus der Wellenlänge' },
    { id: 'wissen.radar', reason: 'Antennen im Radarsystem' }
  ],
  'wissen.mathematik': [
    { id: 'rechner.fspl', reason: 'FSPL direkt ausrechnen' },
    { id: 'rechner.kanalkapazitaet', reason: 'Shannon-Hartley anwenden' },
    { id: 'rechner.link-budget', reason: 'Alle Terme im Zusammenhang' },
    { id: 'wissen.wellenausbreitung', reason: 'Physik hinter den Formeln' }
  ],
  'wissen.radar': [
    { id: 'rechner.radar', reason: 'Reichweite selbst berechnen' },
    { id: 'wissen.mathematik', reason: 'Radargleichung im Detail' },
    { id: 'wissen.antennen', reason: 'Richtcharakteristik und Gewinn' },
    { id: 'datenbanken.frequenzbaender', reason: 'Radarbänder nachschlagen' }
  ],
  datenbanken: [
    { id: 'spektrum', reason: 'Daten im Spektrum verorten' },
    { id: 'wissen', reason: 'Hintergrund zu den Datensätzen' },
    { id: 'service.quellen', reason: 'Herkunft und Stand der Daten' },
    { id: 'datenbanken.frequenzbaender', reason: 'Bänder nachschlagen' },
    { id: 'datenbanken.sender', reason: 'Sender nachschlagen' }
  ],
  'datenbanken.frequenzbaender': [
    { id: 'spektrum', reason: 'Band im Spektrum anzeigen' },
    { id: 'wissen.wellenausbreitung', reason: 'Ausbreitung des Bandes verstehen' },
    { id: 'konverter.frequenz', reason: 'Wellenlänge zum Band berechnen' },
    { id: 'datenbanken.funkdienste', reason: 'Dienste in diesem Bereich' }
  ],
  'datenbanken.funkdienste': [
    { id: 'spektrum.anwendungen', reason: 'Dienste grafisch im Spektrum' },
    { id: 'wissen.funktechnik.funkdienste', reason: 'Systematik der Zuweisungen' },
    { id: 'datenbanken.frequenzbaender', reason: 'Zugehörige Bänder' }
  ],
  'datenbanken.sender': [
    { id: 'spektrum.sendeleistungen', reason: 'Leistungen im Spektrum' },
    { id: 'wissen.funktechnik.rundfunk', reason: 'Rundfunksysteme verstehen' },
    { id: 'datenbanken.frequenzbaender', reason: 'Band des Senders nachschlagen' },
    { id: 'datenbanken.historie', reason: 'Historische Sender einordnen' }
  ],
  'datenbanken.historie': [
    { id: 'wissen.funktechnik', reason: 'Wie sich die Dienste entwickelt haben' },
    { id: 'wissen.radar', reason: 'Radar als Kind des Zweiten Weltkriegs' },
    { id: 'datenbanken.sender', reason: 'Historische Sender heute' }
  ],
  'service.sitemap': [
    { id: 'spektrum', reason: 'Zum Spektrum-Dashboard' },
    { id: 'wissen', reason: 'Zum Nachschlagewerk' },
    { id: 'rechner', reason: 'Zu den Rechnern' },
    { id: 'datenbanken', reason: 'Zu den Datenbanken' }
  ],
  service: [
    { id: 'service.sitemap', reason: 'Alle Seiten auf einen Blick' },
    { id: 'spektrum', reason: 'Zurück zum Spektrum' },
    { id: 'wissen', reason: 'Zum Nachschlagewerk' }
  ]
};

/** Gegenrichtung: welche Seiten verweisen auf `id`? */
const BACKLINKS = new Map<string, RelatedRef[]>();
for (const [sourceId, refs] of Object.entries(RELATIONS)) {
  for (const ref of refs) {
    const list = BACKLINKS.get(ref.id) ?? [];
    list.push({ id: sourceId, reason: ref.reason });
    BACKLINKS.set(ref.id, list);
  }
}

/**
 * Aufgelöste Verweise einer Seite: erst die gepflegten, dann — falls weniger
 * als `min` Einträge existieren — automatische Rückverweise. Geplante Seiten
 * werden ausgelassen, damit keine toten Links entstehen.
 */
export function getRelatedTopics(
  href: string,
  options: { min?: number; max?: number } = {}
): RelatedTopic[] {
  const { min = 3, max = 6 } = options;
  const source = findNode(normalizeHref(href));
  if (!source) return [];

  const seen = new Set<string>([source.id]);
  const topics: RelatedTopic[] = [];

  const add = (ref: RelatedRef) => {
    if (topics.length >= max || seen.has(ref.id)) return;
    const node = findNodeById(ref.id);
    if (!node || node.status !== 'live') return;
    seen.add(ref.id);
    topics.push({ node, reason: ref.reason });
  };

  for (const ref of RELATIONS[source.id] ?? []) add(ref);

  if (topics.length < min) {
    for (const ref of BACKLINKS.get(source.id) ?? []) add(ref);
  }

  return topics;
}
