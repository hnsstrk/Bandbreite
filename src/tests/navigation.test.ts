import { describe, it, expect } from 'vitest';
import {
  NAV_TREE,
  NAV_GROUPS,
  SITE_URL,
  flattenNav,
  findNode,
  findNodeById,
  getNodesByIds,
  getBreadcrumbs,
  getSiblings,
  getHubChildren,
  getParent,
  isActivePath,
  normalizeHref
} from '$lib/data/navigation';
import { RELATIONS, getRelatedTopics } from '$lib/data/relations';

const allNodes = flattenNav();

describe('NAV_TREE Struktur', () => {
  it('nutzt für jeden href einen Trailing Slash', () => {
    const violations = allNodes.filter((node) => !node.href.endsWith('/'));
    expect(violations).toEqual([]);
  });

  it('vergibt eindeutige IDs und hrefs', () => {
    expect(new Set(allNodes.map((n) => n.id)).size).toBe(allNodes.length);
    expect(new Set(allNodes.map((n) => n.href)).size).toBe(allNodes.length);
  });

  it('setzt für jeden Knoten einen Status', () => {
    expect(allNodes.every((node) => node.status === 'live' || node.status === 'geplant')).toBe(true);
  });

  it('leitet die ID aus dem Pfad ab', () => {
    for (const node of allNodes) {
      const fromHref = node.href.split('/').filter(Boolean).join('.');
      expect(node.id).toBe(fromHref);
    }
  });

  it('enthält die fünf Hauptbereiche', () => {
    expect(NAV_TREE.map((n) => n.id)).toEqual([
      'spektrum',
      'rechner',
      'konverter',
      'wissen',
      'datenbanken',
      'service'
    ]);
  });

  it('definiert eine kanonische Basis-URL ohne Trailing Slash', () => {
    expect(SITE_URL.startsWith('https://')).toBe(true);
    expect(SITE_URL.endsWith('/')).toBe(false);
  });
});

describe('normalizeHref', () => {
  it('ergänzt fehlende Schrägstriche', () => {
    expect(normalizeHref('/rechner')).toBe('/rechner/');
    expect(normalizeHref('rechner')).toBe('/rechner/');
    expect(normalizeHref('/rechner/')).toBe('/rechner/');
    expect(normalizeHref('/rechner/fspl/?f=1')).toBe('/rechner/fspl/');
  });
});

describe('findNode', () => {
  it('findet Knoten mit und ohne Trailing Slash', () => {
    expect(findNode('/rechner/fspl/')?.label).toBe('Freiraumdämpfung (FSPL)');
    expect(findNode('/rechner/fspl')?.id).toBe('rechner.fspl');
    expect(findNode('/gibt-es-nicht/')).toBeUndefined();
  });

  it('findet Knoten per ID', () => {
    expect(findNodeById('wissen.funktechnik.mobilfunk')?.href).toBe(
      '/wissen/funktechnik/mobilfunk/'
    );
    expect(getNodesByIds(['rechner.fspl', 'unbekannt']).map((n) => n.id)).toEqual(['rechner.fspl']);
  });
});

describe('getBreadcrumbs', () => {
  it('löst Labels aus dem Navigationsbaum auf', () => {
    expect(getBreadcrumbs('/spektrum/daempfung/').map((b) => b.label)).toEqual([
      'Spektrum',
      'Atmosphärische Dämpfung'
    ]);
  });

  it('erzeugt niemals das fehlerhafte Label „Daempfung"', () => {
    expect(getBreadcrumbs('/spektrum/daempfung/').some((b) => b.label === 'Daempfung')).toBe(false);
  });

  it('markiert den letzten Eintrag', () => {
    const crumbs = getBreadcrumbs('/wissen/funktechnik/mobilfunk/');
    expect(crumbs).toHaveLength(3);
    expect(crumbs.at(-1)?.isLast).toBe(true);
    expect(crumbs[0].isLast).toBe(false);
  });

  it('formatiert unbekannte Segmente lesbar', () => {
    expect(getBreadcrumbs('/spektrum/explorer/').at(-1)?.label).toBe('Explorer');
  });

  it('liefert für die Wurzel eine leere Liste', () => {
    expect(getBreadcrumbs('/')).toEqual([]);
  });
});

describe('Hub- und Geschwisterabfragen', () => {
  it('liefert die Kinder eines Hubs', () => {
    expect(getHubChildren('/rechner/')).toHaveLength(6);
    expect(getHubChildren('/rechner/fspl/')).toEqual([]);
  });

  it('liefert Geschwister ohne den Knoten selbst', () => {
    const siblings = getSiblings('/rechner/fspl/');
    expect(siblings).toHaveLength(5);
    expect(siblings.some((n) => n.id === 'rechner.fspl')).toBe(false);
  });

  it('findet den Elternknoten', () => {
    expect(getParent('/wissen/funktechnik/rundfunk/')?.id).toBe('wissen.funktechnik');
    expect(getParent('/spektrum/')).toBeUndefined();
  });
});

describe('isActivePath', () => {
  it('erkennt aktive Zweige', () => {
    expect(isActivePath('/wissen/', '/wissen/mathematik/')).toBe(true);
    expect(isActivePath('/wissen/mathematik/', '/wissen/mathematik/')).toBe(true);
    expect(isActivePath('/rechner/', '/wissen/mathematik/')).toBe(false);
  });
});

describe('NAV_GROUPS', () => {
  it('referenziert ausschließlich existierende Knoten-IDs', () => {
    const ids = new Set(allNodes.map((n) => n.id));
    for (const group of NAV_GROUPS) {
      for (const column of group.columns) {
        for (const itemId of column.itemIds) {
          expect(ids.has(itemId)).toBe(true);
        }
      }
    }
  });

  it('verweist mit jeder Gruppe auf einen vorhandenen Hub', () => {
    for (const group of NAV_GROUPS) {
      if (group.href) expect(findNode(group.href)).toBeDefined();
    }
  });
});

describe('RELATIONS', () => {
  it('verweist nur auf bekannte Knoten', () => {
    const ids = new Set(allNodes.map((n) => n.id));
    for (const [sourceId, refs] of Object.entries(RELATIONS)) {
      expect(ids.has(sourceId)).toBe(true);
      for (const ref of refs) {
        expect(ids.has(ref.id)).toBe(true);
        expect(ref.id).not.toBe(sourceId);
      }
    }
  });

  it('liefert für jede existierende Seite mindestens drei lebende Verweise', () => {
    for (const node of allNodes.filter((n) => n.status === 'live')) {
      const topics = getRelatedTopics(node.href);
      expect(topics.length).toBeGreaterThanOrEqual(3);
      expect(topics.every((t) => t.node.status === 'live')).toBe(true);
      expect(topics.every((t) => t.node.id !== node.id)).toBe(true);
    }
  });

  it('begrenzt die Anzahl der Verweise', () => {
    expect(getRelatedTopics('/wissen/wellenausbreitung/', { max: 3 })).toHaveLength(3);
    expect(getRelatedTopics('/gibt-es-nicht/')).toEqual([]);
  });
});
