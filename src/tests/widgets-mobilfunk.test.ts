/**
 * Rechenmodell des Mobilfunk-Widgets „Zellraster und Frequenzwiederverwendung".
 * Referenzwerte nach Rappaport, Wireless Communications, 2. Aufl., §3.3/§3.5.
 */
import { describe, it, expect } from 'vitest';
import {
  cellGroup,
  channelsPerCell,
  clusterRepresentatives,
  clusterSize,
  coChannelCirDb,
  hexCells,
  hexCenter,
  hexPoints,
  reuseDistanceM,
  reuseRatio,
  sameChannelGroup,
  CELL_REUSE_LIMITS,
  CLUSTER_OPTIONS,
  CO_CHANNEL_INTERFERERS
} from '$lib/components/widgets/CellReuseModel';

describe('Clustergeometrie', () => {
  it('N = i² + i·j + j² für alle angebotenen Cluster', () => {
    for (const option of CLUSTER_OPTIONS) {
      expect(clusterSize(option.i, option.j), `N=${option.n}`).toBe(option.n);
    }
  });

  it('Wiederverwendungsverhältnis Q = √(3N): N = 7 ergibt 4,58', () => {
    expect(reuseRatio(7)).toBeCloseTo(Math.sqrt(21), 10);
    expect(reuseRatio(7)).toBeCloseTo(4.583, 3);
    expect(reuseRatio(3)).toBeCloseTo(3, 10);
    expect(reuseRatio(4)).toBeCloseTo(Math.sqrt(12), 10);
    expect(reuseRatio(0)).toBe(0);
  });

  it('Wiederverwendungsabstand D = R·√(3N)', () => {
    expect(reuseDistanceM(2000, 7)).toBeCloseTo(2000 * Math.sqrt(21), 6);
    expect(reuseDistanceM(0, 7)).toBe(0);
  });
});

describe('Gleichkanal-Störabstand', () => {
  it('N = 7 und Pfadverlustexponent 4 ergeben rund 18,7 dB (Rappaport, Beispiel 3.2)', () => {
    expect(coChannelCirDb(7, 4)).toBeCloseTo(18.66, 2);
  });

  it('kleinere Cluster verschlechtern den Störabstand', () => {
    expect(coChannelCirDb(4, 4)).toBeLessThan(coChannelCirDb(7, 4));
    expect(coChannelCirDb(3, 4)).toBeLessThan(coChannelCirDb(4, 4));
  });

  it('mehr Störer senken den Abstand um 10·log₁₀(i₀/i₀′)', () => {
    const sechs = coChannelCirDb(7, 4, CO_CHANNEL_INTERFERERS);
    const drei = coChannelCirDb(7, 4, 3);
    expect(drei - sechs).toBeCloseTo(10 * Math.log10(2), 6);
  });
});

describe('Einfärbung des Sechseckrasters', () => {
  for (const option of CLUSTER_OPTIONS) {
    it(`N = ${option.n}: genau ${option.n} Gruppen, benachbarte Zellen verschieden`, () => {
      const reps = clusterRepresentatives(option.i, option.j);
      expect(reps).toHaveLength(option.n);

      const cells = hexCells(3);
      const groups = cells.map((cell) => cellGroup(cell.q, cell.r, option.i, option.j, reps));
      expect(groups.every((group) => group >= 0)).toBe(true);
      expect(new Set(groups).size).toBe(option.n);

      if (option.n > 1) {
        const nachbarn = [
          [1, 0],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [0, -1],
          [1, -1]
        ];
        const mitte = cellGroup(0, 0, option.i, option.j, reps);
        for (const [dq, dr] of nachbarn) {
          expect(cellGroup(dq, dr, option.i, option.j, reps), `${dq}/${dr}`).not.toBe(mitte);
        }
      }
    });
  }

  it('der Gittervektor (i, j) trifft wieder dieselbe Gruppe', () => {
    for (const option of CLUSTER_OPTIONS) {
      expect(sameChannelGroup(option.i, option.j, option.i, option.j)).toBe(true);
      expect(cellGroup(option.i, option.j, option.i, option.j)).toBe(
        cellGroup(0, 0, option.i, option.j)
      );
    }
  });

  it('der Abstand zur nächsten gleichkanaligen Zelle ist √(3N)·R', () => {
    const size = 40;
    for (const option of CLUSTER_OPTIONS) {
      const center = hexCenter(option.i, option.j, size);
      const distance = Math.hypot(center.x, center.y);
      expect(distance, `N=${option.n}`).toBeCloseTo(size * Math.sqrt(3 * option.n), 6);
    }
  });

  it('hexCells liefert 1 + 3·n·(n+1) Zellen und hexPoints sechs Ecken', () => {
    expect(hexCells(0)).toHaveLength(1);
    expect(hexCells(2)).toHaveLength(19);
    expect(hexCells(3)).toHaveLength(37);
    expect(hexPoints(0, 0, 10).split(' ')).toHaveLength(6);
  });
});

describe('Kanalaufteilung', () => {
  it('teilt die Systemkanäle auf den Cluster auf', () => {
    expect(channelsPerCell(CELL_REUSE_LIMITS.channelCount.default, 7)).toBe(12);
    expect(channelsPerCell(84, 1)).toBe(84);
    expect(channelsPerCell(84, 0)).toBe(0);
  });
});
