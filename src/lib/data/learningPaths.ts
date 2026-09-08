/**
 * Lernpfade — geführte Reihenfolgen über mehrere Kapitel.
 *
 * Ein Lernpfad ist kein neuer Inhalt, sondern eine Leseempfehlung: Er
 * verkettet bestehende Seiten aus `NAV_TREE` zu einer didaktischen Folge
 * („Kapitel → Lernziel → Artikel", Bericht 01 §2). Jeder Schritt nennt sein
 * Lernziel; optionale Schritte vertiefen, ohne den Faden zu unterbrechen.
 *
 * Konventionen:
 * - `href` endet immer mit einem Schrägstrich und zeigt auf einen Knoten der
 *   Navigations-Registry — eine zweite Seitenliste gibt es nicht.
 * - Schritte, deren Kapitel (noch) nicht existiert, werden von
 *   {@link resolvePathSteps} ausgeblendet. So entstehen weder tote Links noch
 *   Prerender-Fehler, solange ein Kapitel in Arbeit ist.
 * - `durationMin` ist eine **Annahme:** grob geschätzte Lesezeit aus rund
 *   10 Minuten je Kapitel und 5 Minuten je Rechner.
 */

import { findNode, normalizeHref, registerDynamicSegmentLabels, type NavNode } from './navigation';
import type { IconName } from '$lib/components/ui/icons';

/** Einstiegshöhe eines Pfads. */
export type LearningLevel = 'einstieg' | 'aufbau' | 'vertiefung';

export interface LearningStep {
  /** Ziel des Schritts — eine Route mit Trailing Slash aus `NAV_TREE`. */
  href: string;
  /** Kurzer Titel des Schritts (darf vom Navigationslabel abweichen). */
  title: string;
  /** Was man nach diesem Schritt kann — ein Satz. */
  goal: string;
  /** Vertiefung: zählt nicht in die Pflichtfolge. */
  optional?: boolean;
}

export interface LearningPath {
  /** Slug des Pfads, zugleich Segment unter `/wissen/lernpfade/`. */
  id: string;
  title: string;
  /** Einleitung für Kachel und Detailseite. */
  lead: string;
  level: LearningLevel;
  /** Geschätzte Gesamtdauer in Minuten (Annahme). */
  durationMin: number;
  icon: IconName;
  steps: LearningStep[];
}

/** Anzeigenamen der Stufen. */
export const LEVEL_LABELS: Record<LearningLevel, string> = {
  einstieg: 'Einstieg',
  aufbau: 'Aufbau',
  vertiefung: 'Vertiefung'
};

/** Farbton des Stufen-Etiketts im Design-System. */
export const LEVEL_TONES: Record<LearningLevel, 'success' | 'info' | 'warning'> = {
  einstieg: 'success',
  aufbau: 'info',
  vertiefung: 'warning'
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'spektrum-zur-funkverbindung',
    title: 'Vom Spektrum zur Funkverbindung',
    lead: 'Der rote Faden durch die Grundlagen: erst das Spektrum als Ganzes, dann Welle, Pegel und Ausbreitung — am Ende steht eine vollständig gerechnete Leistungsbilanz.',
    level: 'einstieg',
    durationMin: 75,
    icon: 'spectrum',
    steps: [
      {
        href: '/spektrum/',
        title: 'Das Spektrum als Ganzes',
        goal: 'Frequenz, Wellenlänge und Bandgrenzen im Zusammenhang lesen.'
      },
      {
        href: '/wissen/grundlagen/em-wellen/',
        title: 'Elektromagnetische Wellen',
        goal: 'Erklären, was eine Welle transportiert und warum λ = c/f gilt.'
      },
      {
        href: '/wissen/grundlagen/dezibel/',
        title: 'Dezibel und Pegel',
        goal: 'Verhältnisse in Dezibel ausdrücken und Pegel addieren statt multiplizieren.'
      },
      {
        href: '/wissen/wellenausbreitung/',
        title: 'Wie die Welle zum Empfänger kommt',
        goal: 'Bodenwelle, Raumwelle und Sichtverbindung auseinanderhalten.'
      },
      {
        href: '/rechner/fspl/',
        title: 'Freiraumdämpfung rechnen',
        goal: 'Den Pfadverlust einer Strecke aus Frequenz und Entfernung bestimmen.'
      },
      {
        href: '/wissen/antennen/',
        title: 'Antennen und Gewinn',
        goal: 'Gewinn, Richtwirkung und Wirkfläche einer Antenne einordnen.'
      },
      {
        href: '/rechner/link-budget/',
        title: 'Die Leistungsbilanz aufstellen',
        goal: 'Alle Gewinne und Verluste zu einer Empfangsleistung zusammenführen.'
      },
      {
        href: '/wissen/wellenausbreitung/daempfung/',
        title: 'Zusatzdämpfung der Atmosphäre',
        goal: 'Abschätzen, wann Sauerstoff, Wasserdampf und Regen die Bilanz kippen.',
        optional: true
      }
    ]
  },
  {
    id: 'radar-verstehen',
    title: 'Radar verstehen',
    lead: 'Vom Echo zur Reichweite: Funktionsprinzip, Radargleichung, die gängigen Verfahren und der Blick auf das, was die Atmosphäre vom Signal übrig lässt.',
    level: 'aufbau',
    durationMin: 70,
    icon: 'signal',
    steps: [
      {
        href: '/wissen/radar/',
        title: 'Radar im Überblick',
        goal: 'Das Grundprinzip der Laufzeitmessung und die Rolle des Rückstreuquerschnitts benennen.'
      },
      {
        href: '/wissen/radar/grundlagen/',
        title: 'Radargrundlagen',
        goal: 'Die Radargleichung Term für Term lesen und ihre Annahmen kennen.'
      },
      {
        href: '/rechner/radar/',
        title: 'Radarreichweite rechnen',
        goal: 'Reichweite, Empfangsleistung und Auflösung für eigene Parameter bestimmen.'
      },
      {
        href: '/wissen/radar/verfahren/',
        title: 'Radarverfahren',
        goal: 'Puls-, Doppler-, FMCW- und SAR-Verfahren nach Einsatzzweck unterscheiden.'
      },
      {
        href: '/wissen/radar/sekundaerradar/',
        title: 'Sekundärradar',
        goal: 'Erklären, warum Sekundärradar antwortet statt zu reflektieren.'
      },
      {
        href: '/wissen/wellenausbreitung/daempfung/',
        title: 'Dämpfung auf dem Radarweg',
        goal: 'Die Zusatzdämpfung durch Gase und Regen auf Hin- und Rückweg abschätzen.'
      },
      {
        href: '/wissen/antennen/',
        title: 'Die Antenne als Radarauge',
        goal: 'Öffnungswinkel und Gewinn mit der Winkelauflösung verknüpfen.',
        optional: true
      }
    ]
  },
  {
    id: 'funkdienste-kennenlernen',
    title: 'Funkdienste kennenlernen',
    lead: 'Wer darf wo senden? Vom Ordnungssystem der ITU über Rundfunk und Mobilfunk bis zu See-, Flug- und Notfunk — mit der Bänderdatenbank als Nachschlagewerk.',
    level: 'einstieg',
    durationMin: 80,
    icon: 'radio',
    steps: [
      {
        href: '/wissen/funktechnik/funkdienste/',
        title: 'Funkdienste und Frequenzplan',
        goal: 'Primäre und sekundäre Zuweisung sowie die drei ITU-Regionen erklären.'
      },
      {
        href: '/datenbanken/frequenzbaender/',
        title: 'Bänder nachschlagen',
        goal: 'Zu einer Frequenz das zuständige Band und seine Nutzung finden.'
      },
      {
        href: '/wissen/funktechnik/rundfunk/',
        title: 'Rundfunk',
        goal: 'AM-, UKW- und Digitalrundfunk nach Band und Reichweite einordnen.'
      },
      {
        href: '/wissen/funktechnik/mobilfunk/',
        title: 'Mobilfunk',
        goal: 'Die Mobilfunkbänder und ihre Generationen zuordnen.'
      },
      {
        href: '/wissen/funktechnik/seefunk/',
        title: 'Seefunk',
        goal: 'UKW-Kanäle, DSC und die GMDSS-Struktur überblicken.'
      },
      {
        href: '/wissen/funktechnik/flugfunk/',
        title: 'Flugfunk',
        goal: 'Kanalraster, Navigationsfunk und Transponder im Luftfahrtband unterscheiden.'
      },
      {
        href: '/wissen/funktechnik/notfrequenzen/',
        title: 'Not- und Anruffrequenzen',
        goal: 'Die wichtigsten Not- und Anruffrequenzen den Diensten zuordnen.'
      },
      {
        href: '/wissen/funktechnik/bos/',
        title: 'Behördenfunk',
        goal: 'Den Übergang vom analogen BOS-Funk zum Digitalfunk nachvollziehen.',
        optional: true
      }
    ]
  },
  {
    id: 'amateurfunk-einstieg',
    title: 'Amateurfunk-Einstieg',
    lead: 'Der Weg zur ersten eigenen Verbindung: Bandplan und Betriebsarten, die passende Modulation, eine Antenne mit Gewinn und die Ausbreitung über die Ionosphäre.',
    level: 'aufbau',
    durationMin: 70,
    icon: 'antenna',
    steps: [
      {
        href: '/wissen/funktechnik/amateurfunk/',
        title: 'Amateurfunk',
        goal: 'Bandplan, Zeugnisklassen und Betriebsarten des Amateurfunkdienstes überblicken.'
      },
      {
        href: '/wissen/modulation/',
        title: 'Modulationsverfahren',
        goal: 'SSB, FM und digitale Verfahren nach Bandbreite und Robustheit auswählen.'
      },
      {
        href: '/wissen/antennen/',
        title: 'Antennen',
        goal: 'Dipol, Yagi und Vertikalantenne nach Gewinn und Richtwirkung vergleichen.'
      },
      {
        href: '/wissen/wellenausbreitung/ionosphaere/',
        title: 'Ausbreitung über die Ionosphäre',
        goal: 'MUF, LUF und Skip-Zone für die Bandwahl nutzen.'
      },
      {
        href: '/rechner/dezibel/',
        title: 'Pegel umrechnen',
        goal: 'Leistungen, Spannungen und Verhältnisse sicher in Dezibel umrechnen.'
      },
      {
        href: '/rechner/antennengewinn/',
        title: 'Antennengewinn bestimmen',
        goal: 'Gewinn und Öffnungswinkel einer Antenne aus ihren Maßen berechnen.'
      },
      {
        href: '/datenbanken/frequenzbaender/',
        title: 'Bandplan nachschlagen',
        goal: 'Die Amateurfunkbänder mit Grenzen und Nutzung im Datensatz finden.',
        optional: true
      }
    ]
  }
];

/** Ein Schritt samt aufgelöstem Navigationsknoten. */
export interface ResolvedStep extends LearningStep {
  node: NavNode;
  /** Nummer in der Anzeige, beginnend bei 1. */
  position: number;
}

/** Pfad zu einer ID. */
export function findLearningPath(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((path) => path.id === id);
}

/** Elternroute aller Pfad-Detailseiten. */
export const LEARNING_PATHS_HREF = '/wissen/lernpfade/';

/** Route der Detailseite eines Pfads. */
export function learningPathHref(id: string): string {
  return `${LEARNING_PATHS_HREF}${id}/`;
}

/**
 * Die Detailseiten sind eine `[slug]`-Route und stehen deshalb nicht im
 * NAV_TREE. Ohne diesen Resolver zeigte die Brotkrümelnavigation dort den
 * humanisierten Slug („Spektrum Zur Funkverbindung") statt des Pfadtitels.
 */
registerDynamicSegmentLabels(LEARNING_PATHS_HREF, (segment) => findLearningPath(segment)?.title);

/**
 * Die tatsächlich begehbaren Schritte eines Pfads.
 *
 * Schritte ohne lebenden Knoten in `NAV_TREE` entfallen — ein Kapitel kann
 * noch in Arbeit sein, und `adapter-static` bricht sonst beim Prerendern über
 * dem toten Link ab.
 */
export function resolvePathSteps(path: LearningPath | undefined): ResolvedStep[] {
  if (!path) return [];
  const steps: ResolvedStep[] = [];
  for (const step of path.steps) {
    const node = findNode(step.href);
    if (!node || node.status !== 'live') continue;
    steps.push({ ...step, node, position: steps.length + 1 });
  }
  return steps;
}

/** Alle Routen, die überhaupt zu einem Pfad gehören (aufgelöst). */
export function learningPathsForHref(href: string): LearningPath[] {
  const target = normalizeHref(href);
  return LEARNING_PATHS.filter((path) =>
    resolvePathSteps(path).some((step) => step.href === target)
  );
}
