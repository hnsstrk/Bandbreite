/**
 * Tastaturführung des Mega-Menüs (`layout/header.svelte.ts`).
 *
 * Die Logik sitzt außerhalb der Komponente, damit `MegaMenu.svelte` unter der
 * 300-Zeilen-Grenze bleibt und die Entscheidungen ohne DOM-Rahmen prüfbar sind.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { columnOf, megaMenuKeydown } from '$lib/components/layout/header.svelte';

/** Zwei Spalten mit je zwei Links, wie im Mega-Menü aufgebaut. */
function buildMenu(): HTMLAnchorElement[] {
  document.body.innerHTML = `
    <div data-column="0"><a id="a0" href="/a/">A</a><a id="a1" href="/b/">B</a></div>
    <div data-column="1"><a id="b0" href="/c/">C</a><a id="b1" href="/d/">D</a></div>
  `;
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
}

const press = (key: string) => new KeyboardEvent('keydown', { key, cancelable: true });

describe('megaMenuKeydown', () => {
  let items: HTMLAnchorElement[];
  let closed: boolean[];
  const onclose = (returnFocus?: boolean) => closed.push(Boolean(returnFocus));

  beforeEach(() => {
    items = buildMenu();
    closed = [];
  });

  it('liest den Spaltenindex aus `data-column`', () => {
    expect(columnOf(items[0])).toBe(0);
    expect(columnOf(items[3])).toBe(1);
    expect(columnOf(document.body)).toBe(0);
  });

  it('wandert mit Pfeil ab und auf zyklisch durch alle Einträge', () => {
    items[0].focus();
    expect(megaMenuKeydown(press('ArrowDown'), items, 2, onclose)).toBe(true);
    expect(document.activeElement?.id).toBe('a1');
    items.at(-1)!.focus();
    megaMenuKeydown(press('ArrowDown'), items, 2, onclose);
    expect(document.activeElement?.id).toBe('a0');
    megaMenuKeydown(press('ArrowUp'), items, 2, onclose);
    expect(document.activeElement?.id).toBe('b1');
  });

  it('wechselt mit Pfeil links und rechts die Spalte', () => {
    items[1].focus();
    megaMenuKeydown(press('ArrowRight'), items, 2, onclose);
    expect(document.activeElement?.id).toBe('b0');
    megaMenuKeydown(press('ArrowLeft'), items, 2, onclose);
    expect(document.activeElement?.id).toBe('a0');
  });

  it('springt mit Pos1 und Ende an die Ränder', () => {
    items[2].focus();
    megaMenuKeydown(press('Home'), items, 2, onclose);
    expect(document.activeElement?.id).toBe('a0');
    megaMenuKeydown(press('End'), items, 2, onclose);
    expect(document.activeElement?.id).toBe('b1');
  });

  it('schließt mit Escape und gibt den Fokus zurück', () => {
    items[0].focus();
    expect(megaMenuKeydown(press('Escape'), items, 2, onclose)).toBe(true);
    expect(closed).toEqual([true]);
  });

  it('lässt unbekannte Tasten und leere Menüs unangetastet', () => {
    const event = press('a');
    expect(megaMenuKeydown(event, items, 2, onclose)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(megaMenuKeydown(press('ArrowDown'), [], 2, onclose)).toBe(false);
  });

  it('ignoriert den Spaltenwechsel bei nur einer Spalte', () => {
    items[0].focus();
    expect(megaMenuKeydown(press('ArrowRight'), items, 1, onclose)).toBe(false);
    expect(document.activeElement?.id).toBe('a0');
  });
});
