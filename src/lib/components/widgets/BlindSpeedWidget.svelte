<script lang="ts">
	/**
	 * Blindgeschwindigkeiten eines MTI-Radars: Bei v_b = n·λ·PRF/2 dreht sich die
	 * Echophase von Impuls zu Impuls um ein Vielfaches von 2π — der Festzeichen-
	 * filter löscht das Ziel wie ein stehendes. Zwei gestaffelte PRFs verschieben
	 * die erste gemeinsame Lücke weit nach oben.
	 * Rechnung in BlindSpeedModel.ts (Formeln aus $lib/utils/radar).
	 */
	import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
	import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import ResultCard from '$lib/components/ui/ResultCard.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import { formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
	import {
		computeBlindSpeeds,
		computeStagger,
		msToKmh,
		BLIND_SPEED_LIMITS,
		BLIND_SPEED_ORDERS
	} from './BlindSpeedModel';

	const W = 800;
	const H = 250;
	const PAD = { left: 46, right: 18, top: 20, bottom: 40 };
	const PLOT_W = W - PAD.left - PAD.right;
	const PLOT_H = H - PAD.top - PAD.bottom;
	/** Stützstellen der Antwortkurve */
	const SAMPLES = 260;
	/** Umlaufdauer der Zielmarke in ms */
	const SWEEP_MS = 9000;
	/** Unterhalb dieser normierten Antwort gilt ein Ziel als unterdrückt */
	const SUPPRESSION_THRESHOLD = 0.2;

	let prf1Hz = $state<number>(BLIND_SPEED_LIMITS.prfHz.default);
	let prf2Hz = $state<number>(BLIND_SPEED_LIMITS.prf2Hz.default);
	let frequencyHz = $state<number>(BLIND_SPEED_LIMITS.frequencyHz.default);

	const loop = new AnimationLoop();
	$effect(() => loop.attach());

	const first = $derived(computeBlindSpeeds(prf1Hz, frequencyHz, BLIND_SPEED_ORDERS));
	const second = $derived(computeBlindSpeeds(prf2Hz, frequencyHz, BLIND_SPEED_ORDERS));
	const stagger = $derived(computeStagger(prf1Hz, prf2Hz, frequencyHz));
	const vMaxMs = $derived(
		Math.max(first.blindSpeedsMs.at(-1) ?? 1, second.blindSpeedsMs.at(-1) ?? 1) * 1.05
	);

	const x = (v: number) => PAD.left + (v / vMaxMs) * PLOT_W;
	const y = (amplitude: number) => PAD.top + PLOT_H - amplitude * PLOT_H;

	/** Antwort eines Zweipuls-Festzeichenfilters: |sin(π·v/v_b)| */
	function response(v: number, blindSpeedMs: number): number {
		if (blindSpeedMs <= 0) return 0;
		return Math.abs(Math.sin((Math.PI * v) / blindSpeedMs));
	}

	function curve(blindSpeedMs: number): string {
		let path = '';
		for (let i = 0; i <= SAMPLES; i++) {
			const v = (i / SAMPLES) * vMaxMs;
			path += `${i === 0 ? 'M' : 'L'}${x(v).toFixed(1)},${y(response(v, blindSpeedMs)).toFixed(1)} `;
		}
		return path.trim();
	}

	const targetV = $derived(((loop.elapsedMs % SWEEP_MS) / SWEEP_MS) * vMaxMs);
	const targetResponse1 = $derived(response(targetV, first.firstBlindSpeedMs));
	const targetResponse2 = $derived(response(targetV, second.firstBlindSpeedMs));
	const targetVisible = $derived(
		Math.max(targetResponse1, targetResponse2) >= SUPPRESSION_THRESHOLD
	);
</script>

<WidgetFrame
	title="Blindgeschwindigkeiten und gestaffelte PRF"
	description="Antwortkurve eines Festzeichenfilters über der Radialgeschwindigkeit. Bei den Blindgeschwindigkeiten fällt die Kurve auf null; die zweite, gestaffelte Pulswiederholfrequenz füllt diese Lücken auf."
	playable
	playing={loop.playing}
	reducedMotion={loop.reducedMotion}
	ontoggle={() => loop.toggle()}
	footnote="Dargestellt ist die normierte Antwort |sin(π·v/v_b)| eines Zweipuls-Festzeichenfilters (Skolnik, §3.2). Nulldurchgänge = Blindgeschwindigkeiten."
>
	<svg viewBox="0 0 {W} {H}" aria-hidden="true">
		<line x1={PAD.left} y1={y(0)} x2={W - PAD.right} y2={y(0)} class="chart-axis-line" />
		<line x1={PAD.left} y1={y(0)} x2={PAD.left} y2={y(1)} class="chart-axis-line" />
		<text x={PAD.left - 8} y={y(1) + 4} text-anchor="end" class="chart-axis-text">1</text>
		<text x={PAD.left - 8} y={y(0) + 4} text-anchor="end" class="chart-axis-text">0</text>
		<text x={W - PAD.right} y={H - 8} text-anchor="end" class="chart-axis-text">Radialgeschwindigkeit →</text>

		<path d={curve(first.firstBlindSpeedMs)} fill="none" stroke="var(--color-series-1)" stroke-width="2.25" />
		<path d={curve(second.firstBlindSpeedMs)} fill="none" stroke="var(--color-series-2)" stroke-width="2.25" stroke-dasharray="6 4" />

		{#each first.blindSpeedsMs as v, i (i)}
			{#if v <= vMaxMs}
				<line x1={x(v)} y1={y(0)} x2={x(v)} y2={y(1)} stroke="var(--color-series-1)" stroke-width="1" stroke-dasharray="3 4" opacity="0.6" />
				<text x={x(v)} y={H - 22} text-anchor="middle" class="chart-axis-text">{formatNumber(v, 0)}</text>
			{/if}
		{/each}

		{#if stagger.commonBlindSpeedMs > 0 && stagger.commonBlindSpeedMs <= vMaxMs}
			<line x1={x(stagger.commonBlindSpeedMs)} y1={y(0)} x2={x(stagger.commonBlindSpeedMs)} y2={y(1)} stroke="var(--color-series-3)" stroke-width="2" />
			<text x={x(stagger.commonBlindSpeedMs)} y={PAD.top - 6} text-anchor="middle" class="chart-legend-text">gemeinsame Lücke</text>
		{/if}

		<circle cx={x(targetV)} cy={y(Math.max(targetResponse1, targetResponse2))} r="6" fill={targetVisible ? 'var(--color-series-3)' : 'var(--color-ink-subtle)'} />
		<text x={x(targetV)} y={y(Math.max(targetResponse1, targetResponse2)) - 12} text-anchor="middle" class="chart-legend-text">
			{targetVisible ? 'Ziel sichtbar' : 'Ziel unterdrückt'}
		</text>

		<g transform="translate({PAD.left + 6}, {PAD.top + 10})">
			<line x1="0" y1="0" x2="18" y2="0" stroke="var(--color-series-1)" stroke-width="2.25" />
			<text x="24" y="4" class="chart-legend-text">PRF₁ {formatNumber(prf1Hz, 0)} Hz</text>
			<line x1="150" y1="0" x2="168" y2="0" stroke="var(--color-series-2)" stroke-width="2.25" stroke-dasharray="6 4" />
			<text x="174" y="4" class="chart-legend-text">PRF₂ {formatNumber(prf2Hz, 0)} Hz</text>
		</g>
	</svg>

	{#snippet dataTable()}
		<table>
			<caption>Aktuelle Werte des Blindgeschwindigkeits-Widgets</caption>
			<tbody>
				<tr><th>Sendefrequenz</th><td>{formatFrequency(frequencyHz, 2)} (λ = {formatNumber(first.wavelengthM * 100, 1)} cm)</td></tr>
				<tr><th>PRF₁</th><td>{formatNumber(prf1Hz, 0)} Hz</td></tr>
				<tr><th>PRF₂</th><td>{formatNumber(prf2Hz, 0)} Hz</td></tr>
				<tr><th>Erste Blindgeschwindigkeit (PRF₁)</th><td>{formatNumber(first.firstBlindSpeedMs, 1)} m/s</td></tr>
				<tr><th>Weitere Blindgeschwindigkeiten</th><td>{first.blindSpeedsMs.map((v) => `${formatNumber(v, 1)} m/s`).join(', ')}</td></tr>
				<tr><th>Eindeutige Geschwindigkeit ±v_u</th><td>{formatNumber(first.unambiguousVelocityMs, 1)} m/s</td></tr>
				<tr><th>Eindeutige Entfernung R_u</th><td>{formatDistance(first.unambiguousRangeM, 1)}</td></tr>
				<tr><th>Erste gemeinsame Lücke der Staffelung</th><td>{formatNumber(stagger.commonBlindSpeedMs, 1)} m/s</td></tr>
			</tbody>
		</table>
	{/snippet}

	{#snippet controls()}
		<Slider
			label="Pulswiederholfrequenz PRF₁"
			bind:value={prf1Hz}
			min={BLIND_SPEED_LIMITS.prfHz.min}
			max={BLIND_SPEED_LIMITS.prfHz.max}
			step={10}
			format={(v) => `${formatNumber(v, 0)} Hz`}
			unitSymbol="Hz"
		/>
		<Slider
			label="Zweite PRF der Staffelung"
			bind:value={prf2Hz}
			min={BLIND_SPEED_LIMITS.prf2Hz.min}
			max={BLIND_SPEED_LIMITS.prf2Hz.max}
			step={10}
			format={(v) => `${formatNumber(v, 0)} Hz`}
			unitSymbol="Hz"
		/>
		<Slider
			label="Sendefrequenz"
			bind:value={frequencyHz}
			min={BLIND_SPEED_LIMITS.frequencyHz.min}
			max={BLIND_SPEED_LIMITS.frequencyHz.max}
			step={100e6}
			scale="log"
			format={(v) => formatFrequency(v, 2)}
			unitSymbol="Hz"
		/>
	{/snippet}

	{#snippet results()}
		<ResultCard
			label="Erste Blindgeschwindigkeit v_b = λ·PRF/2"
			value={formatNumber(first.firstBlindSpeedMs, 1)}
			unit="m/s"
			secondary="= {formatNumber(msToKmh(first.firstBlindSpeedMs), 0)} km/h"
			emphasis="hero"
			tone="warning"
			copyable={false}
		/>
		<ResultCard
			label="Eindeutig messbar ±v_u = λ·PRF/4"
			value={formatNumber(first.unambiguousVelocityMs, 1)}
			unit="m/s"
			copyable={false}
		/>
		<ResultCard
			label="Eindeutige Entfernung R_u"
			value={formatDistance(first.unambiguousRangeM, 1)}
			hint="Das PRF-Dilemma: mehr Geschwindigkeit kostet Entfernung"
			copyable={false}
		/>
		<ResultCard
			label="Gemeinsame Lücke beider PRFs"
			value={stagger.commonBlindSpeedMs > 0 ? formatNumber(stagger.commonBlindSpeedMs, 1) : '—'}
			unit={stagger.commonBlindSpeedMs > 0 ? 'm/s' : undefined}
			hint="{formatNumber(stagger.gainFactor, 1)}-fache erste Blindgeschwindigkeit"
			tone="success"
			copyable={false}
		/>
		<Callout tone="tip" title="Warum staffeln?">
			Eine einzelne PRF lässt regelmäßig wiederkehrende Lücken im Geschwindigkeitsbereich. Wechselt das
			Radar von Impuls zu Impuls zwischen zwei Pulswiederholfrequenzen, fallen die Lücken nicht mehr
			zusammen — erst bei
			{stagger.commonBlindSpeedMs > 0 ? `${formatNumber(stagger.commonBlindSpeedMs, 0)} m/s` : 'sehr hohen Geschwindigkeiten'}
			gibt es wieder eine echte Blindgeschwindigkeit.
		</Callout>
	{/snippet}
</WidgetFrame>
