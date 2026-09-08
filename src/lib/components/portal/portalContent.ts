/**
 * Daten der Portalseite unter „/".
 *
 * Die Bereichskacheln und die Werkzeugliste werden aus der Navigations-Registry
 * abgeleitet — es gibt keine zweite, händisch gepflegte Seitenliste. Nur die
 * Sprungmarken der interaktiven Kapitel stehen hier, weil Anker keine eigenen
 * Navigationsknoten sind.
 */

import {
  NAV_GROUPS,
  findNode,
  getNodesByIds,
  getHubChildren,
  type NavNode
} from '$lib/data/navigation';
import { isIconName, type IconName } from '$lib/components/ui/icons';

export interface PortalTile {
  id: string;
  title: string;
  text: string;
  href: string;
  icon?: IconName;
}

export interface PortalArea {
  id: string;
  label: string;
  href: string;
  description: string;
  icon?: IconName;
  /** Direkteinstiege in den Bereich (3–4 Stück). */
  links: NavNode[];
}

/** Nur Namen aus dem Katalog dürfen an `Icon` — sonst kein Icon. */
export function iconFor(name: string | undefined): IconName | undefined {
  return name && isIconName(name) ? name : undefined;
}

/** Höchstzahl der Unterlinks je Bereichskachel. */
const LINKS_PER_AREA = 4;

/**
 * Die fünf Bereiche des Mega-Menüs als Kacheln: Spektrum, Werkzeuge, Wissen,
 * Datenbanken und Service.
 */
export function portalAreas(): PortalArea[] {
  return NAV_GROUPS.map((group) => {
    const hub = group.href ? findNode(group.href) : undefined;
    // Reihum aus allen Spalten, damit eine Kachel nicht nur eine Spalte zeigt.
    const tiefe = Math.max(...group.columns.map((column) => column.itemIds.length), 0);
    const itemIds = Array.from({ length: tiefe }, (_, index) =>
      group.columns.map((column) => column.itemIds[index]).filter(Boolean)
    ).flat();
    const links = getNodesByIds(itemIds)
      .filter((node) => node.status === 'live' && node.href !== hub?.href)
      .slice(0, LINKS_PER_AREA);
    return {
      id: group.id,
      label: group.label,
      href: hub?.href ?? group.href ?? '/',
      description: hub?.description ?? '',
      icon: iconFor(hub?.icon),
      links
    };
  });
}

/** Rechner und Konverter als Kacheln — Reihenfolge wie in der Registry. */
export function toolTiles(): PortalTile[] {
  return [...getHubChildren('/rechner/'), ...getHubChildren('/konverter/')]
    .filter((node) => node.status === 'live')
    .map((node) => ({
      id: node.id,
      title: node.label,
      text: node.description ?? '',
      href: node.href,
      icon: iconFor(node.icon)
    }));
}

/**
 * Interaktive Einstiege: Widgets und Visualisierungen, die in einem Kapitel
 * stecken. Die Anker entsprechen den Abschnitts-IDs der Kapitel.
 */
export const INTERACTIVE_TILES: PortalTile[] = [
  {
    id: 'radar-impuls',
    title: 'Radar-Impuls',
    text: 'Impulsdauer, Pulswiederholfrequenz und Entfernungsauflösung am laufenden Impuls verfolgen.',
    href: '/wissen/radar/grundlagen/#grundprinzip',
    icon: 'signal'
  },
  {
    id: 'modulation',
    title: 'Konstellationsdiagramm',
    text: 'PSK und QAM als Punktwolke: mehr Punkte bedeuten mehr Bits je Symbol und weniger Störabstand.',
    href: '/wissen/modulation/#konstellation',
    icon: 'wave'
  },
  {
    id: 'antennen',
    title: 'Antennen-Richtdiagramm',
    text: 'Hauptkeule, Nebenkeulen und Halbwertsbreite im Polardiagramm ablesen.',
    href: '/wissen/antennen/#richtdiagramm',
    icon: 'antenna'
  },
  {
    id: 'amateurfunk',
    title: 'Amateurfunk-Bandplan',
    text: 'Bandgrenzen, Betriebsarten und Zeugnisklassen von 136 kHz bis 250 GHz durchblättern.',
    href: '/wissen/funktechnik/amateurfunk/#bandplan-visualisierer',
    icon: 'radio'
  },
  {
    id: 'fresnel',
    title: 'Fresnel-Zone',
    text: 'Wie viel Platz eine Sichtverbindung neben der geraden Linie wirklich braucht.',
    href: '/wissen/wellenausbreitung/#sichtverbindung',
    icon: 'satellite'
  },
  {
    id: 'dezibel',
    title: 'Dezibel-Spielplatz',
    text: 'Pegel addieren statt Faktoren multiplizieren — 3 dB, 10 dB und dBm im Zusammenspiel.',
    href: '/wissen/mathematik/#dezibel',
    icon: 'calculator'
  }
];
