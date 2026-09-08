<script lang="ts">
	/**
	 * Interaktiver Modulations-Visualisierer.
	 *
	 * Zeigt Nachricht, Träger und moduliertes Signal im Zeitbereich sowie das
	 * zugehörige vereinfachte Linienspektrum. Alle Rechnungen stammen aus
	 * `modulationMath.ts`; hier liegt nur die Bedienlogik.
	 */
	import { onMount, untrack } from 'svelte';
	import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ModulationWaveforms from './ModulationWaveforms.svelte';
	import ModulationSpectrum from './ModulationSpectrum.svelte';
	import {
		DEPTH_MAX,
		DEVIATION_MAX_HZ,
		DEVIATION_MIN_HZ,
		MAX_CARRIER_RATIO,
		MAX_SAMPLES,
		MESSAGE_MAX_HZ,
		MESSAGE_MIN_HZ,
		MESSAGE_PERIODS,
		MIN_CARRIER_RATIO,
		MIN_SAMPLES,
		MODULATION_CHOICES,
		PHASE_MAX_RAD,
		SAMPLES_PER_CARRIER_CYCLE,
		SCROLL_PERIODS_PER_SECOND
	} from './ModulationOptions';
	import { formatFrequency, formatNumber } from '$lib/utils/formatting';
	import {
		fmModulationIndex,
		generateWaveform,
		isDigitalKind,
		isOvermodulated,
		occupiedBandwidthHz,
		spectrumLines,
		type ModulationKind,
		type WaveformParams
	} from '$lib/utils/modulationMath';

	/** `initialKind`: anfangs gewählte Modulationsart. */
	interface Props { initialKind?: ModulationKind }
	let { initialKind = 'am' }: Props = $props();

	let kind = $state<ModulationKind>(untrack(() => initialKind));
	let messageHz = $state(3_000);
	let carrierHz = $state(45_000);
	let amDepth = $state(0.6);
	let deviationHz = $state(9_000);
	let phaseDeviationRad = $state(1.5);
	let startS = $state(0);
	let running = $state(false);
	let reducedMotion = $state(false);

	const carrierMinHz = $derived(messageHz * MIN_CARRIER_RATIO);
	const carrierMaxHz = $derived(messageHz * MAX_CARRIER_RATIO);

	function clampCarrier(value: number, message: number): number {
		return Math.min(Math.max(value, message * MIN_CARRIER_RATIO), message * MAX_CARRIER_RATIO);
	}

	function handleMessageChange(next: number) {
		carrierHz = clampCarrier(carrierHz, next);
	}

	const params = $derived<WaveformParams>({
		carrierHz,
		messageHz,
		amDepth,
		deviationHz,
		phaseDeviationRad
	});

	const durationS = $derived(MESSAGE_PERIODS / messageHz);
	const sampleCount = $derived(
		Math.min(
			MAX_SAMPLES,
			Math.max(MIN_SAMPLES, Math.round(SAMPLES_PER_CARRIER_CYCLE * carrierHz * durationS))
		)
	);
	const waveform = $derived(generateWaveform(kind, params, sampleCount, durationS, startS));
	const lines = $derived(spectrumLines(kind, params));
	const bandwidthHz = $derived(occupiedBandwidthHz(kind, params));
	const usesDeviation = $derived(kind === 'fm' || kind === 'fsk');
	const beta = $derived(fmModulationIndex(deviationHz, messageHz));
	const overmodulated = $derived(kind === 'am' && isOvermodulated(amDepth));
	const activeKind = $derived(MODULATION_CHOICES.find((entry) => entry.id === kind) ?? MODULATION_CHOICES[0]);

	const description = $derived(
		`Zeitverlauf von Nachricht, Träger und ${activeKind.label}-moduliertem Signal bei ` +
			`${formatFrequency(messageHz)} Nachrichtenfrequenz und ${formatFrequency(carrierHz)} Trägerfrequenz.`
	);

	onMount(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			reducedMotion = query.matches;
			if (reducedMotion) running = false;
		};
		sync();
		query.addEventListener('change', sync);

		return () => query.removeEventListener('change', sync);
	});

	// Laufanimation: nur aktiv, solange „Abspielen" gewählt ist. Die
	// Zuweisungen im Bildwechsel-Rückruf werden nicht mitverfolgt, der Effekt
	// hängt allein an `running`.
	$effect(() => {
		if (!running) return;
		let frame = 0;
		let last = performance.now();
		const tick = (now: number) => {
			const deltaS = (now - last) / 1000;
			last = now;
			startS += deltaS * SCROLL_PERIODS_PER_SECOND * durationS;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
</script>

<div class="widget">
	<div class="kinds" role="group" aria-label="Modulationsart wählen">
		{#each MODULATION_CHOICES as entry (entry.id)}
			<Button
				size="sm"
				variant={kind === entry.id ? 'primary' : 'secondary'}
				pressed={kind === entry.id}
				title={entry.hint}
				onclick={() => (kind = entry.id)}
			>
				{entry.label}
			</Button>
		{/each}
	</div>

	<p class="hint">{activeKind.hint}</p>

	<div class="controls">
		<Slider
			label={isDigitalKind(kind) ? 'Symbolrate' : 'Nachrichtenfrequenz f_m'}
			bind:value={messageHz}
			min={MESSAGE_MIN_HZ}
			max={MESSAGE_MAX_HZ}
			step={100}
			format={formatFrequency}
			unitSymbol="Hz"
			onchange={handleMessageChange}
		/>
		<Slider
			label="Trägerfrequenz f_c"
			bind:value={carrierHz}
			min={carrierMinHz}
			max={carrierMaxHz}
			step={500}
			format={formatFrequency}
			unitSymbol="Hz"
			hint="Für eine lesbare Darstellung auf das 3- bis 24-fache der Nachrichtenfrequenz begrenzt."
		/>
		{#if kind === 'am' || kind === 'ask'}
			<Slider
				label="Modulationsgrad m"
				bind:value={amDepth}
				min={0}
				max={DEPTH_MAX}
				step={0.05}
				format={(value) => formatNumber(value * 100, 0) + ' %'}
				unitSymbol="Prozent"
			/>
		{:else if usesDeviation}
			<Slider
				label="Frequenzhub Δf"
				bind:value={deviationHz}
				min={DEVIATION_MIN_HZ}
				max={DEVIATION_MAX_HZ}
				step={500}
				format={formatFrequency}
				unitSymbol="Hz"
			/>
		{:else if kind === 'pm'}
			<Slider
				label="Phasenhub Δφ"
				bind:value={phaseDeviationRad}
				min={0.1}
				max={PHASE_MAX_RAD}
				step={0.1}
				format={(value) => `${formatNumber(value, 1)} rad`}
				unitSymbol="Radiant"
			/>
		{/if}
	</div>

	<div class="readout">
		<Badge tone="brand" srPrefix="Belegte Bandbreite">B = {formatFrequency(bandwidthHz)}</Badge>
		{#if usesDeviation}
			<Badge tone="info" srPrefix="Modulationsindex">β = {formatNumber(beta, 2)}</Badge>
		{/if}
		{#if overmodulated}
			<Badge tone="danger" icon="warning" srPrefix="Warnung">
				Übermodulation — die Hüllkurve klappt um
			</Badge>
		{/if}
		<Button
			size="sm"
			variant="ghost"
			icon={running ? 'pause' : 'play'}
			onclick={() => (running = !running)}
			pressed={running}
		>
			{running ? 'Pause' : 'Abspielen'}
		</Button>
		{#if reducedMotion}
			<span class="hint">Bewegung ist in den Systemeinstellungen reduziert.</span>
		{/if}
	</div>

	<ChartFrame title="Zeitbereich" level={4} {description} minWidth={480}>
		<ModulationWaveforms
			{waveform}
			showEnvelope={kind === 'am'}
			{amDepth}
			modulatedLabel={activeKind.label}
		/>
		{#snippet dataTable()}
			<table>
				<caption>Eingestellte Werte</caption>
				<tbody>
					<tr><th scope="row">Verfahren</th><td>{activeKind.label}</td></tr>
					<tr><th scope="row">Nachrichtenfrequenz</th><td>{formatFrequency(messageHz)}</td></tr>
					<tr><th scope="row">Trägerfrequenz</th><td>{formatFrequency(carrierHz)}</td></tr>
					<tr><th scope="row">Belegte Bandbreite</th><td>{formatFrequency(bandwidthHz)}</td></tr>
				</tbody>
			</table>
		{/snippet}
	</ChartFrame>

	<ChartFrame
		title="Spektrum"
		level={4}
		description={`Linienspektrum um die Trägerfrequenz ${formatFrequency(carrierHz)} mit einer belegten Bandbreite von ${formatFrequency(bandwidthHz)}.`}
		minWidth={480}
		footnote="Vereinfachte Darstellung: reine Sinus- bzw. Rechteck-Nachricht, ideale Erzeugung ohne Filter."
	>
		<ModulationSpectrum {lines} {carrierHz} {bandwidthHz} />
		{#snippet dataTable()}
			<table>
				<caption>Spektrallinien, Ablage zur Trägerfrequenz</caption>
				<tbody>
					{#each lines as line (line.label)}
						<tr>
							<th scope="row">{line.label}</th>
							<td>{formatFrequency(carrierHz + line.offsetHz)}</td>
							<td>{formatNumber(line.amplitude, 2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/snippet}
	</ChartFrame>
</div>

<style>
	.widget {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.kinds {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 0.75rem 1.5rem;
	}

	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
	}

	.hint {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-ink-subtle);
	}
</style>
