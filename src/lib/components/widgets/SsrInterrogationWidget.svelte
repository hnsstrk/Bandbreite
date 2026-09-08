<script lang="ts">
	/**
	 * Sekundärradar: Abfrage auf 1030 MHz, Antwort auf 1090 MHz als Zeitdiagramm.
	 * Umschalter Modus A / C / S, Entfernungsregler für die Laufzeit und
	 * Squawk-Eingabe, die das Impulsbild des Antwortrahmens erzeugt.
	 * Rechnung und alle Zahlenwerte in SsrModel.ts (ICAO Annex 10 Vol. IV).
	 */
	import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
	import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import ResultCard from '$lib/components/ui/ResultCard.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import SsrCodePicker from './SsrCodePicker.svelte';
	import { formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
	import {
		computeSsrTiming,
		interrogationPulses,
		interrogationSpacingUs,
		modeSReplyPulses,
		replyPulses,
		squawkDigits,
		DEFAULT_SQUAWK,
		MODE_S_ADDRESS_BITS,
		REPLY_FRAME_US,
		REPLY_SLOT_US,
		SQUAWK_CODE_COUNT,
		SSR_INTERROGATION_HZ,
		SSR_MODES,
		SSR_REPLY_HZ,
		TRANSPONDER_DELAY_US,
		type SsrMode,
		type SsrPulse
	} from './SsrModel';

	const W = 800;
	const H = 280;
	/** Zeitmaßstab der Impulsgruppen */
	const PX_PER_US = 11.5;
	/** Breite eines Datenblocks höchstens (er ist sonst zu breit für die Bühne) */
	const MAX_BLOCK_PX = 170;
	const X0 = 66;
	/** Waagerechter Abstand, der die Laufzeit versinnbildlicht */
	const GAP_PX = 88;
	const TX_Y = 104;
	const RX_Y = 218;
	const PULSE_H = 42;
	/** Entfernungsbereich in km */
	const RANGE_KM = { min: 5, max: 400, default: 100 };
	/** Umlaufdauer der Laufzeitmarke in ms */
	const SWEEP_MS = 2600;

	let modeId = $state<string>('a');
	let rangeKm = $state<number>(RANGE_KM.default);
	let squawk = $state<string>(DEFAULT_SQUAWK);

	const loop = new AnimationLoop();
	$effect(() => loop.attach());

	const mode = $derived(modeId as SsrMode);
	const timing = $derived(computeSsrTiming(rangeKm * 1000, mode));
	const txPulses = $derived(interrogationPulses(mode));
	const rxPulses = $derived(mode === 's' ? modeSReplyPulses() : replyPulses(squawk));
	const digits = $derived(squawkDigits(squawk));

	const pulseW = (pulse: SsrPulse) =>
		pulse.kind === 'block'
			? Math.min(pulse.widthUs * PX_PER_US, MAX_BLOCK_PX)
			: Math.max(3, pulse.widthUs * PX_PER_US);

	const groupWidth = (pulses: SsrPulse[]) =>
		pulses.reduce((max, pulse) => Math.max(max, pulse.startUs * PX_PER_US + pulseW(pulse)), 0);

	const rxX0 = $derived(X0 + groupWidth(txPulses) + GAP_PX);
	const txEndX = $derived(X0 + groupWidth(txPulses));
	/** Fortschritt der Laufzeitmarke auf der Verbindung (0 … 1) */
	const travel = $derived((loop.elapsedMs % SWEEP_MS) / SWEEP_MS);
	const modeOptions = SSR_MODES.map((entry) => ({ value: entry.id, label: entry.label }));
	const modeInfo = $derived(SSR_MODES.find((entry) => entry.id === mode) ?? SSR_MODES[0]);
</script>

<WidgetFrame
	title="Sekundärradar: Abfrage und Antwort"
	description="Zeitdiagramm einer Sekundärradar-Abfrage: oben die Impulse der Bodenstation auf 1030 MHz, unten die Transponderantwort auf 1090 MHz, dazwischen die Signallaufzeit."
	playable
	playing={loop.playing}
	reducedMotion={loop.reducedMotion}
	ontoggle={() => loop.toggle()}
	stacked
	footnote="Beide Impulsgruppen sind maßstäblich in Mikrosekunden gezeichnet; der Zwischenraum steht sinnbildlich für die {formatNumber(timing.totalUs, 1)} µs aus Laufzeit und Transponderverzögerung und ist stark verkürzt. Datenblöcke sind in der Breite begrenzt."
>
	<svg viewBox="0 0 {W} {H}" aria-hidden="true">
		<text x="8" y={TX_Y - 52} class="chart-legend-text">Bodenstation → {formatFrequency(SSR_INTERROGATION_HZ, 0)}</text>
		<text x="8" y={RX_Y - 52} class="chart-legend-text">Transponder → {formatFrequency(SSR_REPLY_HZ, 0)}</text>
		<line x1={X0 - 10} y1={TX_Y} x2={W - 12} y2={TX_Y} class="chart-axis-line" />
		<line x1={X0 - 10} y1={RX_Y} x2={W - 12} y2={RX_Y} class="chart-axis-line" />

		{#each txPulses as pulse (pulse.id)}
			<rect
				x={X0 + pulse.startUs * PX_PER_US}
				y={TX_Y - PULSE_H}
				width={pulseW(pulse)}
				height={PULSE_H}
				fill={pulse.kind === 'block' ? 'var(--color-series-4)' : 'var(--color-series-1)'}
				opacity={pulse.kind === 'control' ? 0.55 : 1}
			/>
			<text x={X0 + pulse.startUs * PX_PER_US + pulseW(pulse) / 2} y={TX_Y + 14} text-anchor="middle" class="pulse-label">
				{pulse.label}
			</text>
		{/each}

		{#if mode !== 's'}
			<line x1={X0} y1={TX_Y - PULSE_H - 12} x2={X0 + interrogationSpacingUs(mode) * PX_PER_US} y2={TX_Y - PULSE_H - 12} stroke="var(--color-series-3)" stroke-width="1.5" />
			<text x={X0 + (interrogationSpacingUs(mode) * PX_PER_US) / 2} y={TX_Y - PULSE_H - 18} text-anchor="middle" class="chart-legend-text">
				P1 → P3 = {formatNumber(interrogationSpacingUs(mode), 0)} µs
			</text>
		{/if}

		<!-- Laufzeit: gestrichelte Verbindung mit wandernder Marke -->
		<path d="M{txEndX},{TX_Y} L{rxX0},{RX_Y}" stroke="var(--color-ink-subtle)" stroke-width="1.5" stroke-dasharray="5 5" fill="none" />
		<circle cx={txEndX + (rxX0 - txEndX) * travel} cy={TX_Y + (RX_Y - TX_Y) * travel} r="5" fill="var(--color-series-3)" />
		<text x={(txEndX + rxX0) / 2 + 6} y={(TX_Y + RX_Y) / 2 - 6} class="chart-legend-text">
			{formatNumber(timing.roundTripUs, 1)} µs + {formatNumber(TRANSPONDER_DELAY_US, 0)} µs
		</text>

		{#each rxPulses as pulse (pulse.id)}
			<rect
				x={rxX0 + pulse.startUs * PX_PER_US}
				y={RX_Y - (pulse.active ? PULSE_H : PULSE_H * 0.35)}
				width={pulseW(pulse)}
				height={pulse.active ? PULSE_H : PULSE_H * 0.35}
				fill={pulse.active ? (pulse.kind === 'block' ? 'var(--color-series-4)' : 'var(--color-series-2)') : 'none'}
				stroke={pulse.active ? 'none' : 'var(--color-ink-subtle)'}
				stroke-width="1"
				stroke-dasharray={pulse.active ? undefined : '3 3'}
			/>
			<text
				x={rxX0 + pulse.startUs * PX_PER_US + pulseW(pulse) / 2}
				y={RX_Y + 14}
				text-anchor="middle"
				class="pulse-label"
				opacity={pulse.active || pulse.kind !== 'data' ? 1 : 0.5}
			>
				{pulse.label}
			</text>
		{/each}

		{#if mode !== 's'}
			<line x1={rxX0} y1={RX_Y - PULSE_H - 12} x2={rxX0 + REPLY_FRAME_US * PX_PER_US} y2={RX_Y - PULSE_H - 12} stroke="var(--color-series-3)" stroke-width="1.5" />
			<text x={rxX0 + (REPLY_FRAME_US * PX_PER_US) / 2} y={RX_Y - PULSE_H - 18} text-anchor="middle" class="chart-legend-text">
				F1 → F2 = {formatNumber(REPLY_FRAME_US, 1)} µs
			</text>
		{/if}
	</svg>

	{#snippet dataTable()}
		<table>
			<caption>Aktuelle Werte des Sekundärradar-Widgets</caption>
			<tbody>
				<tr><th>Modus</th><td>{modeInfo.label} — {modeInfo.purposeDE}</td></tr>
				<tr><th>Abfrage</th><td>{formatFrequency(SSR_INTERROGATION_HZ, 0)}, Impulse {txPulses.map((p) => p.label).join(', ')}</td></tr>
				<tr><th>Antwort</th><td>{formatFrequency(SSR_REPLY_HZ, 0)}</td></tr>
				<tr><th>Entfernung</th><td>{formatDistance(rangeKm * 1000, 0)}</td></tr>
				<tr><th>Laufzeit hin und zurück</th><td>{formatNumber(timing.roundTripUs, 1)} µs</td></tr>
				<tr><th>Abfrage bis Antwortbeginn</th><td>{formatNumber(timing.totalUs, 1)} µs</td></tr>
				{#if mode !== 's'}
					<tr><th>Squawk</th><td>{squawk} (A={digits.A}, B={digits.B}, C={digits.C}, D={digits.D})</td></tr>
					<tr>
						<th>Gesetzte Informationsimpulse</th>
						<td>{rxPulses.filter((p) => p.kind === 'data' && p.active).map((p) => p.label).join(', ') || 'keine'}</td>
					</tr>
				{:else}
					<tr><th>Adressierung</th><td>{formatNumber(MODE_S_ADDRESS_BITS, 0)}-Bit-Adresse, selektive Abfrage</td></tr>
				{/if}
			</tbody>
		</table>
	{/snippet}

	{#snippet controls()}
		<Select label="Abfragemodus" bind:value={modeId} options={modeOptions} />
		<Slider
			label="Entfernung zum Luftfahrzeug"
			bind:value={rangeKm}
			min={RANGE_KM.min}
			max={RANGE_KM.max}
			step={1}
			format={(v) => formatDistance(v * 1000, 0)}
			unitSymbol="km"
		/>
		<SsrCodePicker bind:code={squawk} disabled={mode === 's'} />
	{/snippet}

	{#snippet results()}
		<ResultCard
			label="Abfrage bis Antwortbeginn"
			value={formatNumber(timing.totalUs, 1)}
			unit="µs"
			secondary="{formatNumber(timing.roundTripUs, 1)} µs Laufzeit + {formatNumber(TRANSPONDER_DELAY_US, 0)} µs im Transponder"
			emphasis="hero"
			tone="success"
			copyable={false}
		/>
		<ResultCard
			label="Impulsabstand P1 → P3"
			value={mode === 's' ? '—' : formatNumber(interrogationSpacingUs(mode), 0)}
			unit={mode === 's' ? undefined : 'µs'}
			hint={mode === 's' ? 'Modus S überträgt die Abfrage im Datenimpuls P6' : modeInfo.purposeDE}
			copyable={false}
		/>
		<ResultCard
			label="Rasterabstand im Antwortrahmen"
			value={formatNumber(REPLY_SLOT_US, 2)}
			unit="µs"
			hint="13 Zeitschlitze zwischen F1 und F2"
			copyable={false}
		/>
		<ResultCard
			label="Mögliche Squawk-Codes"
			value={formatNumber(SQUAWK_CODE_COUNT, 0)}
			hint="4 Oktalziffern = 8⁴"
			copyable={false}
		/>
		<Callout tone="info" title="Warum zwei Frequenzen?">
			Die Antwort kommt nicht als schwaches Echo zurück, sondern als eigene Aussendung auf
			{formatFrequency(SSR_REPLY_HZ, 0)}. Deshalb gilt für jede Richtung nur ein 1/R²-Gesetz statt des
			R⁴-Gesetzes des Primärradars — Sekundärradar kommt mit erheblich weniger Leistung aus.
		</Callout>
	{/snippet}
</WidgetFrame>

<style>
	.pulse-label {
		font-size: 0.5rem;
		fill: var(--color-ink-subtle);
	}
</style>
