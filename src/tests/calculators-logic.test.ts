import { describe, it, expect } from 'vitest';
import {
	activePresetId,
	type PresetChip
} from '$lib/components/calculators/presetChips.svelte';
import {
	FSPL_PARAMS,
	pickDistanceUnit,
	pickFrequencyUnit
} from '$lib/components/calculators/fspl.svelte';
import {
	RCS_PRESETS,
	RADAR_FREQUENCY_PRESETS,
	RADAR_PARAMS
} from '$lib/components/calculators/radarRange.svelte';
import {
	CAPACITY_PARAMS,
	MODULATION_ENTRIES,
	SHANNON_CURVE,
	achievableModulation,
	practicalDataRate
} from '$lib/components/calculators/channelCapacity.svelte';
import {
	CHART_MEDIA,
	MEDIA,
	PRACTICAL_DEPTH_FACTOR,
	SEAWATER_EXAMPLES,
	SKIN_PARAMS,
	generateDepthCurve,
	mediumForConductivity
} from '$lib/components/calculators/skinDepth.svelte';
import {
	FRESNEL_PARAMS,
	clampObstaclePosition,
	generateFresnelEllipse
} from '$lib/components/calculators/fresnelZone.svelte';
import {
	LINK_BUDGET_PARAMS,
	LINK_PRESETS,
	presetDistanceM,
	presetFrequencyHz
} from '$lib/components/calculators/linkBudget.svelte';
import {
	buildWaterfallSteps,
	stepLabel,
	waterfallDomain,
	waterfallTicks
} from '$lib/components/charts/waterfallData';
import { ATTENUATION_SERIES, formatAttenuationValue } from '$lib/components/charts/attenuationChartData';
import { FSPL_SERIES, generateFsplCurve } from '$lib/components/charts/fsplChartData';
import { calculateFSPL, calculateSkinDepth, frequencyToWavelength } from '$lib/utils/calculations';

// ---------------------------------------------------------------------------
// Preset-Chips: der Doppelaktiv-Bug
// ---------------------------------------------------------------------------

describe('activePresetId', () => {
	const chips: PresetChip[] = [
		{ id: 'car', label: 'PKW', value: 100 },
		{ id: 'airliner', label: 'Verkehrsflugzeug', value: 100 },
		{ id: 'human', label: 'Mensch', value: 1 }
	];

	it('markiert bei gleichem Wert nur einen einzigen Chip', () => {
		const active = chips.filter((chip) => activePresetId(chips, 100, null) === chip.id);
		expect(active).toHaveLength(1);
	});

	it('bevorzugt den zuletzt bewusst gewählten Chip', () => {
		expect(activePresetId(chips, 100, 'airliner')).toBe('airliner');
		expect(activePresetId(chips, 100, 'car')).toBe('car');
	});

	it('ignoriert eine gemerkte ID, deren Wert nicht mehr passt', () => {
		expect(activePresetId(chips, 1, 'car')).toBe('human');
	});

	it('liefert null, wenn kein Chip passt', () => {
		expect(activePresetId(chips, 42, null)).toBeNull();
	});

	it('Radarquerschnitt: PKW und Verkehrsflugzeug teilen sich 100 m²', () => {
		const sameValue = RCS_PRESETS.filter((preset) => preset.value === 100);
		expect(sameValue.length).toBeGreaterThan(1);
		const active = RCS_PRESETS.filter((preset) => activePresetId(RCS_PRESETS, 100, null) === preset.id);
		expect(active).toHaveLength(1);
	});

	it('alle Preset-Listen haben eindeutige IDs', () => {
		for (const list of [RCS_PRESETS, RADAR_FREQUENCY_PRESETS]) {
			const ids = list.map((preset) => preset.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});
});

// ---------------------------------------------------------------------------
// FSPL
// ---------------------------------------------------------------------------

describe('FSPL-Rechner', () => {
	it('wählt die lesbare Frequenzeinheit', () => {
		expect(pickFrequencyUnit(2.4e9)).toBe('GHz');
		expect(pickFrequencyUnit(868e6)).toBe('MHz');
		expect(pickFrequencyUnit(77500)).toBe('kHz');
		expect(pickFrequencyUnit(50)).toBe('Hz');
		expect(pickFrequencyUnit(3e12)).toBe('THz');
	});

	it('wählt die lesbare Distanzeinheit', () => {
		expect(pickDistanceUnit(100)).toBe('m');
		expect(pickDistanceUnit(5000)).toBe('km');
	});

	it('hält die Standardwerte innerhalb der eigenen Grenzen', () => {
		expect(FSPL_PARAMS.f.default).toBeGreaterThanOrEqual(FSPL_PARAMS.f.min);
		expect(FSPL_PARAMS.f.default).toBeLessThanOrEqual(FSPL_PARAMS.f.max);
		expect(FSPL_PARAMS.d.default).toBeGreaterThanOrEqual(FSPL_PARAMS.d.min);
		expect(FSPL_PARAMS.d.default).toBeLessThanOrEqual(FSPL_PARAMS.d.max);
	});

	it('behält das bekannte Ergebnis: 2,4 GHz über 100 m ≈ 80 dB', () => {
		expect(calculateFSPL(100, 2.4e9)).toBeCloseTo(80.05, 1);
	});
});

describe('fsplChartData', () => {
	it('erzeugt monoton steigende Kurvenpunkte', () => {
		const points = generateFsplCurve(2.4e9);
		expect(points.length).toBeGreaterThan(10);
		for (let i = 1; i < points.length; i++) {
			expect(points[i].distance).toBeGreaterThan(points[i - 1].distance);
			expect(points[i].fspl).toBeGreaterThan(points[i - 1].fspl);
		}
	});

	it('liefert für ungültige Frequenzen eine leere Kurve', () => {
		expect(generateFsplCurve(0)).toEqual([]);
		expect(generateFsplCurve(Number.NaN)).toEqual([]);
	});

	it('nutzt ausschließlich Serien-Tokens als Farben', () => {
		for (const series of FSPL_SERIES) {
			expect(series.color).toMatch(/^var\(--color-series-\d\)$/);
		}
	});
});

// ---------------------------------------------------------------------------
// Radar
// ---------------------------------------------------------------------------

describe('Radar-Rechner', () => {
	it('hält alle Standardwerte innerhalb ihrer Grenzen', () => {
		for (const [key, spec] of Object.entries(RADAR_PARAMS)) {
			expect(spec.default, key).toBeGreaterThanOrEqual(spec.min);
			expect(spec.default, key).toBeLessThanOrEqual(spec.max);
		}
	});

	it('übernimmt jeden Eintrag der RCS-Referenztabelle', () => {
		expect(RCS_PRESETS.length).toBeGreaterThanOrEqual(12);
		for (const preset of RCS_PRESETS) {
			expect(preset.value).toBeGreaterThan(0);
			expect(preset.label.length).toBeGreaterThan(0);
		}
	});
});

// ---------------------------------------------------------------------------
// Kanalkapazität
// ---------------------------------------------------------------------------

describe('Kanalkapazität', () => {
	it('wählt die höchste tragfähige Modulationsart', () => {
		expect(achievableModulation(5)).toBeNull();
		expect(achievableModulation(7)?.name).toBe('BPSK');
		expect(achievableModulation(20)?.name).toBe('16-QAM');
		expect(achievableModulation(50)?.name).toBe('1024-QAM');
	});

	it('rechnet die praktische Datenrate aus Bandbreite und bit/Symbol', () => {
		const qpsk = MODULATION_ENTRIES.find((entry) => entry.name === 'QPSK');
		expect(qpsk).toBeDefined();
		// 20 MHz / 1,25 · 2 bit · 0,8 = 25,6 Mbit/s
		expect(practicalDataRate(20e6, qpsk!)).toBeCloseTo(25.6e6, -3);
	});

	it('liefert bei Bandbreite null keine Datenrate', () => {
		expect(practicalDataRate(0, MODULATION_ENTRIES[0])).toBe(0);
	});

	it('die Shannon-Kennlinie steigt monoton', () => {
		for (let i = 1; i < SHANNON_CURVE.length; i++) {
			expect(SHANNON_CURVE[i].capacity).toBeGreaterThan(SHANNON_CURVE[i - 1].capacity);
		}
	});

	it('nutzt Serien-Tokens für die Modulationsfarben', () => {
		for (const entry of MODULATION_ENTRIES) {
			expect(entry.token).toMatch(/^var\(--color-series-\d\)$/);
		}
	});

	it('hält die Standardwerte innerhalb ihrer Grenzen', () => {
		expect(CAPACITY_PARAMS.b.default).toBeGreaterThanOrEqual(CAPACITY_PARAMS.b.min);
		expect(CAPACITY_PARAMS.snr.default).toBeLessThanOrEqual(CAPACITY_PARAMS.snr.max);
	});
});

// ---------------------------------------------------------------------------
// Skin-Tiefe
// ---------------------------------------------------------------------------

describe('Skin-Tiefe', () => {
	it('findet das Medium zu einer Leitfähigkeit', () => {
		expect(mediumForConductivity(4)?.id).toBe('seawater');
		expect(mediumForConductivity(0.123)).toBeNull();
	});

	it('schließt Metalle von der Kennliniendarstellung aus', () => {
		expect(CHART_MEDIA.map((medium) => medium.id)).not.toContain('copper');
		expect(MEDIA.map((medium) => medium.id)).toContain('copper');
	});

	it('erzeugt eine fallende Kennlinie über der Frequenz', () => {
		const points = generateDepthCurve(4);
		expect(points.length).toBeGreaterThan(10);
		for (let i = 1; i < points.length; i++) {
			expect(points[i].depth).toBeLessThan(points[i - 1].depth);
		}
	});

	it('nutzt Serien-Tokens für alle Medien', () => {
		for (const medium of MEDIA) {
			expect(medium.color).toMatch(/^var\(--color-series-\d\)$/);
		}
	});

	it('hält den Standardwert im Bereich', () => {
		expect(SKIN_PARAMS.sigma.default).toBeGreaterThanOrEqual(SKIN_PARAMS.sigma.min);
	});

	it('rechnet die Seewasser-Beispiele statt sie abzuschreiben', () => {
		const byFrequency = Object.fromEntries(
			SEAWATER_EXAMPLES.map((example) => [
				example.frequencyHz,
				calculateSkinDepth(example.frequencyHz, example.conductivity)
			])
		);
		// 76 Hz in Seewasser: rund 29 m — nicht 46 m, das gilt für 30 Hz.
		expect(byFrequency[76]).toBeCloseTo(28.9, 0);
		expect(byFrequency[30]).toBeCloseTo(45.9, 0);
		expect(byFrequency[76] * PRACTICAL_DEPTH_FACTOR).toBeCloseTo(72.2, 0);
	});
});

// ---------------------------------------------------------------------------
// Fresnel
// ---------------------------------------------------------------------------

describe('Fresnel-Zone', () => {
	it('hält das Hindernis im Inneren der Strecke', () => {
		expect(clampObstaclePosition(0, 10000)).toBe(10);
		expect(clampObstaclePosition(10000, 10000)).toBe(9990);
		expect(clampObstaclePosition(5000, 10000)).toBe(5000);
	});

	it('funktioniert auch bei sehr kurzen Strecken', () => {
		const position = clampObstaclePosition(50, 10);
		expect(position).toBeGreaterThanOrEqual(0);
		expect(position).toBeLessThanOrEqual(10);
	});

	it('erzeugt eine geschlossene, symmetrische Kontur', () => {
		const lambda = frequencyToWavelength(5.8e9);
		const points = generateFresnelEllipse(lambda, 10000, 1);
		expect(points).toHaveLength(202);
		expect(points[0].y).toBeCloseTo(0, 6);
		// obere und untere Hälfte spiegeln sich
		const mid = points[50];
		const mirrored = points[201 - 50];
		expect(mirrored.y).toBeCloseTo(-mid.y, 6);
	});

	it('skaliert die 60-Prozent-Kontur proportional', () => {
		const lambda = frequencyToWavelength(5.8e9);
		const full = generateFresnelEllipse(lambda, 10000, 1);
		const scaled = generateFresnelEllipse(lambda, 10000, 1, 0.6);
		expect(scaled[50].y).toBeCloseTo(full[50].y * 0.6, 6);
	});

	it('liefert bei ungültiger Strecke eine leere Kontur', () => {
		expect(generateFresnelEllipse(0.05, 0, 1)).toEqual([]);
	});

	it('hält die Standardwerte innerhalb ihrer Grenzen', () => {
		expect(FRESNEL_PARAMS.o.default).toBeLessThanOrEqual(FRESNEL_PARAMS.d.default);
	});
});

// ---------------------------------------------------------------------------
// Streckenbilanz und Wasserfall
// ---------------------------------------------------------------------------

const SAMPLE_BUDGET = {
	txPowerDbm: 20,
	txAntennaGainDbi: 2,
	txCableLossDb: 1,
	eirpDbm: 21,
	fsplDb: 100,
	atmosphericLossDb: 0,
	miscLossDb: 0,
	totalPathLossDb: 100,
	rxAntennaGainDbi: 2,
	rxCableLossDb: 1,
	receivedPowerDbm: -78,
	rxSensitivityDbm: -90,
	linkMarginDb: 12,
	fadingMarginDb: 10,
	systemMarginDb: 2,
	linkViable: true
};

describe('waterfallData', () => {
	it('baut die Stufenfolge ohne vernachlässigbare Beiträge', () => {
		const steps = buildWaterfallSteps(SAMPLE_BUDGET);
		expect(steps.map((step) => step.shortLabel)).toEqual([
			'TX',
			'+G_TX',
			'−L_TX',
			'FSPL',
			'+G_RX',
			'−L_RX',
			'P_RX'
		]);
	});

	it('nimmt Atmosphäre und sonstige Verluste auf, sobald sie zählen', () => {
		const steps = buildWaterfallSteps({
			...SAMPLE_BUDGET,
			atmosphericLossDb: 3,
			miscLossDb: 2
		});
		expect(steps.map((step) => step.shortLabel)).toContain('Atm.');
		expect(steps.map((step) => step.shortLabel)).toContain('Sonst.');
	});

	it('führt den Pegel korrekt bis zur Empfangsleistung', () => {
		const steps = buildWaterfallSteps(SAMPLE_BUDGET);
		const beforeResult = steps[steps.length - 2];
		expect(beforeResult.barEnd).toBeCloseTo(SAMPLE_BUDGET.receivedPowerDbm, 6);
	});

	it('liefert für fehlende Daten keine Stufen', () => {
		expect(buildWaterfallSteps(null)).toEqual([]);
	});

	it('beschriftet Gewinne und Verluste mit Vorzeichen', () => {
		const steps = buildWaterfallSteps(SAMPLE_BUDGET);
		expect(stepLabel(steps[0])).toBe('20.0');
		expect(stepLabel(steps[1])).toBe('+2.0');
		expect(stepLabel(steps[2])).toBe('−1.0');
	});

	it('schließt die Empfindlichkeit in den Achsenbereich ein', () => {
		const steps = buildWaterfallSteps(SAMPLE_BUDGET);
		const [min, max] = waterfallDomain(steps, -90);
		expect(min).toBeLessThanOrEqual(-90);
		expect(max).toBeGreaterThanOrEqual(21);
	});

	it('erzeugt aufsteigende Achsenmarken innerhalb des Bereichs', () => {
		const ticks = waterfallTicks([-120, 30]);
		expect(ticks.length).toBeGreaterThan(2);
		for (let i = 1; i < ticks.length; i++) {
			expect(ticks[i]).toBeGreaterThan(ticks[i - 1]);
		}
		expect(ticks[0]).toBeGreaterThanOrEqual(-120);
		expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(30);
	});

	it('verkraftet einen leeren Wasserfall', () => {
		expect(waterfallDomain([], -90)).toEqual([-150, 50]);
	});
});

describe('Link-Budget-Presets', () => {
	it('rechnet Distanz und Frequenz jedes Presets in Basiseinheiten um', () => {
		for (const preset of LINK_PRESETS) {
			expect(presetDistanceM(preset)).toBeGreaterThan(0);
			expect(presetFrequencyHz(preset)).toBeGreaterThan(1e6);
		}
	});

	it('hält alle numerischen Standardwerte innerhalb ihrer Grenzen', () => {
		for (const [key, spec] of Object.entries(LINK_BUDGET_PARAMS)) {
			if (typeof spec.default !== 'number') continue;
			const numeric = spec as { default: number; min: number; max: number };
			expect(numeric.default, key).toBeGreaterThanOrEqual(numeric.min);
			expect(numeric.default, key).toBeLessThanOrEqual(numeric.max);
		}
	});
});

// ---------------------------------------------------------------------------
// Dämpfungsdiagramm
// ---------------------------------------------------------------------------

describe('attenuationChartData', () => {
	it('beschreibt alle sieben Kurven mit Serien-Tokens', () => {
		expect(ATTENUATION_SERIES).toHaveLength(7);
		for (const series of ATTENUATION_SERIES) {
			expect(series.color).toMatch(/^var\(--color-series-\d\)$/);
		}
	});

	it('liest den richtigen Wert aus einem Datenpunkt', () => {
		const point = {
			frequencyGHz: 60,
			oxygen: 15,
			waterVapor: 0.2,
			total: 15.2,
			rain: 1,
			fog: 0.5,
			snow: 0.1,
			totalAll: 16.8
		};
		const byId = Object.fromEntries(ATTENUATION_SERIES.map((s) => [s.id, s.value(point)]));
		expect(byId.oxygen).toBe(15);
		expect(byId.waterVapor).toBe(0.2);
		expect(byId.totalAll).toBe(16.8);
	});

	it('formatiert Dämpfungswerte mit passender Genauigkeit', () => {
		expect(formatAttenuationValue(15)).toBe('15.0');
		expect(formatAttenuationValue(1.5)).toBe('1.50');
		expect(formatAttenuationValue(0.15)).toBe('0.150');
		expect(formatAttenuationValue(0.015)).toBe('0.0150');
		expect(formatAttenuationValue(0.0001)).toBe('1.00e-4');
		expect(formatAttenuationValue(Number.NaN)).toBe('—');
	});
});
