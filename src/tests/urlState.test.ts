import { describe, it, expect } from 'vitest';
import {
	buildSearch,
	buildUrl,
	defaultValues,
	hasNonDefaults,
	parseParam,
	readParams,
	serializeNumber,
	serializeParam,
	type ParamSpecs
} from '$lib/utils/urlState.svelte';

const FSPL_SPECS = {
	f: { default: 2.4e9, min: 1e3, max: 3e11 },
	d: { default: 100, min: 1, max: 1e7 },
	multi: { default: true },
	unit: { default: 'GHz', options: ['Hz', 'kHz', 'MHz', 'GHz'] }
} satisfies ParamSpecs;

describe('serializeNumber', () => {
	it('gibt kurze Zahlen unverändert zurück', () => {
		expect(serializeNumber(100)).toBe('100');
		expect(serializeNumber(1000)).toBe('1000');
		expect(serializeNumber(2.45)).toBe('2.45');
	});

	it('nutzt die Exponentialschreibweise für große Zahlen', () => {
		expect(serializeNumber(2.4e9)).toBe('2.4e9');
		expect(serializeNumber(1e12)).toBe('1e12');
	});

	it('nutzt die Exponentialschreibweise für sehr kleine Zahlen', () => {
		expect(serializeNumber(0.0000012)).toBe('1.2e-6');
	});

	it('behandelt Null und ungültige Werte', () => {
		expect(serializeNumber(0)).toBe('0');
		expect(serializeNumber(Number.NaN)).toBe('');
		expect(serializeNumber(Infinity)).toBe('');
	});

	it('ist mit Number() verlustfrei umkehrbar', () => {
		for (const value of [1, 2.4e9, 1.5e-9, 1609.344, 3e11]) {
			expect(Number(serializeNumber(value))).toBeCloseTo(value, 12);
		}
	});
});

describe('serializeParam', () => {
	it('schreibt Wahrheitswerte als 1 und 0', () => {
		expect(serializeParam(true)).toBe('1');
		expect(serializeParam(false)).toBe('0');
	});

	it('reicht Zeichenketten durch', () => {
		expect(serializeParam('GHz')).toBe('GHz');
	});
});

describe('parseParam', () => {
	it('liefert den Standardwert bei fehlender Eingabe', () => {
		expect(parseParam(null, FSPL_SPECS.f)).toBe(2.4e9);
		expect(parseParam('', FSPL_SPECS.f)).toBe(2.4e9);
	});

	it('liest Zahlen in Exponentialschreibweise', () => {
		expect(parseParam('2.4e9', FSPL_SPECS.f)).toBe(2.4e9);
		expect(parseParam('868000000', FSPL_SPECS.f)).toBe(868000000);
	});

	it('begrenzt Zahlen auf den erlaubten Bereich', () => {
		expect(parseParam('1e15', FSPL_SPECS.f)).toBe(3e11);
		expect(parseParam('1', FSPL_SPECS.f)).toBe(1e3);
	});

	it('fällt bei unlesbaren Zahlen auf den Standardwert zurück', () => {
		expect(parseParam('abc', FSPL_SPECS.f)).toBe(2.4e9);
	});

	it('liest Wahrheitswerte in beiden Schreibweisen', () => {
		expect(parseParam('0', FSPL_SPECS.multi)).toBe(false);
		expect(parseParam('false', FSPL_SPECS.multi)).toBe(false);
		expect(parseParam('1', FSPL_SPECS.multi)).toBe(true);
		expect(parseParam('vielleicht', FSPL_SPECS.multi)).toBe(true);
	});

	it('lässt nur erlaubte Zeichenketten zu', () => {
		expect(parseParam('MHz', FSPL_SPECS.unit)).toBe('MHz');
		expect(parseParam('Parsec', FSPL_SPECS.unit)).toBe('GHz');
	});
});

describe('readParams', () => {
	it('liest aus einem Query-String', () => {
		const values = readParams('?f=868e6&d=1500', FSPL_SPECS);
		expect(values.f).toBe(868e6);
		expect(values.d).toBe(1500);
		expect(values.multi).toBe(true);
		expect(values.unit).toBe('GHz');
	});

	it('liest aus einer URL', () => {
		const values = readParams(new URL('https://example.org/rechner/fspl/?f=5.8e9'), FSPL_SPECS);
		expect(values.f).toBe(5.8e9);
	});

	it('liest aus URLSearchParams', () => {
		const values = readParams(new URLSearchParams({ d: '250' }), FSPL_SPECS);
		expect(values.d).toBe(250);
	});

	it('ignoriert unbekannte Parameter', () => {
		const values = readParams('?x=1&f=1e9', FSPL_SPECS);
		expect(Object.keys(values).sort()).toEqual(['d', 'f', 'multi', 'unit']);
	});
});

describe('buildSearch', () => {
	it('lässt Standardwerte weg', () => {
		expect(buildSearch({ f: 2.4e9, d: 100, multi: true, unit: 'GHz' }, FSPL_SPECS)).toBe('');
	});

	it('schreibt nur abweichende Werte in stabiler Reihenfolge', () => {
		expect(buildSearch({ d: 1000, f: 5.8e9, multi: true, unit: 'GHz' }, FSPL_SPECS)).toBe(
			'f=5.8e9&d=1000'
		);
	});

	it('schreibt Wahrheitswerte kompakt', () => {
		expect(buildSearch({ multi: false }, FSPL_SPECS)).toBe('multi=0');
	});

	it('überspringt ungültige Zahlen', () => {
		expect(buildSearch({ f: Number.NaN }, FSPL_SPECS)).toBe('');
	});

	it('ist mit readParams umkehrbar', () => {
		const original = { f: 5.8e9, d: 2500, multi: false, unit: 'MHz' };
		const roundTrip = readParams(`?${buildSearch(original, FSPL_SPECS)}`, FSPL_SPECS);
		expect(roundTrip).toEqual(original);
	});
});

describe('buildUrl', () => {
	it('hängt den Query-String an', () => {
		expect(buildUrl('/rechner/fspl/', { f: 5.8e9 }, FSPL_SPECS)).toBe('/rechner/fspl/?f=5.8e9');
	});

	it('lässt den Pfad ohne Abweichungen unverändert', () => {
		expect(buildUrl('/rechner/fspl/', { f: 2.4e9 }, FSPL_SPECS)).toBe('/rechner/fspl/');
	});
});

describe('defaultValues und hasNonDefaults', () => {
	it('liefert alle Standardwerte', () => {
		expect(defaultValues(FSPL_SPECS)).toEqual({ f: 2.4e9, d: 100, multi: true, unit: 'GHz' });
	});

	it('erkennt abweichende Werte', () => {
		expect(hasNonDefaults(defaultValues(FSPL_SPECS), FSPL_SPECS)).toBe(false);
		expect(hasNonDefaults({ ...defaultValues(FSPL_SPECS), d: 1 }, FSPL_SPECS)).toBe(true);
	});
});
