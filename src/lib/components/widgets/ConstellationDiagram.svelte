<script lang="ts">
	/**
	 * Konstellationsdiagramm mit Rausch-Regler.
	 *
	 * Die idealen Symbolpunkte tragen ihr Gray-codiertes Bitmuster; der
	 * Regler „Störabstand" streut Empfangspunkte darum. Der Zufall ist
	 * deterministisch (Startwert `seed`), damit dasselbe Bild reproduzierbar
	 * ist und die Rechnung getestet werden kann.
	 */
	import { untrack } from 'svelte';
	import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { formatNumber } from '$lib/utils/formatting';
	import {
		SCHEME_STATES,
		constellationPoints,
		idealSpectralEfficiency,
		noiseSigmaFromSnrDb,
		noisyConstellation,
		requiredSnrDb,
		schemeBitsPerSymbol,
		type ConstellationScheme
	} from '$lib/utils/modulationMath';

	interface Props {
		/** Anfangs gewähltes Verfahren */
		initialScheme?: ConstellationScheme;
		/** Startwert des Pseudozufalls */
		seed?: number;
	}

	let { initialScheme = 'qpsk', seed = 20260908 }: Props = $props();

	const SCHEMES: { id: ConstellationScheme; label: string }[] = [
		{ id: 'bpsk', label: 'BPSK' },
		{ id: 'qpsk', label: 'QPSK' },
		{ id: 'psk8', label: '8-PSK' },
		{ id: 'qam16', label: '16-QAM' },
		{ id: 'qam64', label: '64-QAM' }
	];

	const SNR_MIN_DB = 0;
	const SNR_MAX_DB = 40;
	/** Empfangspunkte je Symbol. */
	const SAMPLES_PER_SYMBOL = 24;
	/** Größte dargestellte Amplitude in Vielfachen der mittleren Symbolleistung. */
	const AXIS_LIMIT = 2.2;
	const VIEW_SIZE = 420;
	const PADDING = 34;
	/** Ab dieser Zustandszahl werden die Bitmuster nicht mehr beschriftet. */
	const LABEL_LIMIT_STATES = 16;

	let scheme = $state<ConstellationScheme>(untrack(() => initialScheme));
	let snrDb = $state(20);
	let noiseSeed = $state(untrack(() => seed));

	const points = $derived(constellationPoints(scheme));
	const samples = $derived(noisyConstellation(points, snrDb, noiseSeed, SAMPLES_PER_SYMBOL));
	const bits = $derived(schemeBitsPerSymbol(scheme));
	const sigma = $derived(noiseSigmaFromSnrDb(snrDb));
	const needed = $derived(requiredSnrDb(scheme));
	const tight = $derived(snrDb < needed);
	const showLabels = $derived(SCHEME_STATES[scheme] <= LABEL_LIMIT_STATES);

	const plotSize = VIEW_SIZE - 2 * PADDING;

	function toX(value: number): number {
		return PADDING + ((value + AXIS_LIMIT) / (2 * AXIS_LIMIT)) * plotSize;
	}

	function toY(value: number): number {
		return PADDING + ((AXIS_LIMIT - value) / (2 * AXIS_LIMIT)) * plotSize;
	}

	const description = $derived(
		`Konstellationsdiagramm ${SCHEMES.find((entry) => entry.id === scheme)?.label} mit ` +
			`${SCHEME_STATES[scheme]} Symbolzuständen bei ${formatNumber(snrDb, 0)} dB Störabstand.`
	);
</script>

<div class="widget">
	<div class="schemes" role="group" aria-label="Modulationsverfahren wählen">
		{#each SCHEMES as entry (entry.id)}
			<Button
				size="sm"
				variant={scheme === entry.id ? 'primary' : 'secondary'}
				pressed={scheme === entry.id}
				onclick={() => (scheme = entry.id)}
			>
				{entry.label}
			</Button>
		{/each}
	</div>

	<div class="controls">
		<Slider
			label="Störabstand (SNR)"
			bind:value={snrDb}
			min={SNR_MIN_DB}
			max={SNR_MAX_DB}
			step={0.5}
			format={(value) => `${formatNumber(value, 1)} dB`}
			unitSymbol="Dezibel"
		/>
		<Button size="sm" variant="ghost" icon="reset" onclick={() => (noiseSeed += 1)}>
			Neues Rauschmuster
		</Button>
	</div>

	<div class="readout">
		<Badge tone="brand" srPrefix="Bit je Symbol">{bits} Bit/Symbol</Badge>
		<Badge tone="info" srPrefix="Symbolzustände">M = {SCHEME_STATES[scheme]}</Badge>
		<Badge tone="neutral" srPrefix="Ideale spektrale Effizienz">
			{idealSpectralEfficiency(scheme)} Bit/s/Hz
		</Badge>
		<Badge tone={tight ? 'warning' : 'success'} srPrefix="Bewertung">
			{tight
				? `zu wenig Reserve — rund ${formatNumber(needed, 0)} dB nötig`
				: `ausreichend — rund ${formatNumber(needed, 0)} dB nötig`}
		</Badge>
	</div>

	<ChartFrame
		{description}
		minWidth={320}
		footnote="Rauschmodell: additives weißes Gaußsches Rauschen, mittlere Symbolleistung auf 1 normiert."
	>
		<svg viewBox="0 0 {VIEW_SIZE} {VIEW_SIZE}" class="plot" aria-hidden="true">
			<line x1={PADDING} y1={toY(0)} x2={VIEW_SIZE - PADDING} y2={toY(0)} class="axis" />
			<line x1={toX(0)} y1={PADDING} x2={toX(0)} y2={VIEW_SIZE - PADDING} class="axis" />
			<text x={VIEW_SIZE - PADDING} y={toY(0) - 8} class="axis-label" text-anchor="end">I</text>
			<text x={toX(0) + 8} y={PADDING + 4} class="axis-label">Q</text>

			{#each samples as sample, index (index)}
				<circle cx={toX(sample.i)} cy={toY(sample.q)} r="2" class="sample" />
			{/each}

			{#each points as point (point.index)}
				<circle cx={toX(point.i)} cy={toY(point.q)} r="4.5" class="ideal" />
				{#if showLabels}
					<text x={toX(point.i)} y={toY(point.q) - 9} class="bits">{point.bits}</text>
				{/if}
			{/each}
		</svg>

		{#snippet dataTable()}
			<table>
				<caption>Ideale Symbolpunkte mit Gray-codiertem Bitmuster</caption>
				<thead>
					<tr><th scope="col">Bits</th><th scope="col">I</th><th scope="col">Q</th></tr>
				</thead>
				<tbody>
					{#each points as point (point.index)}
						<tr>
							<th scope="row">{point.bits}</th>
							<td>{formatNumber(point.i, 2)}</td>
							<td>{formatNumber(point.q, 2)}</td>
						</tr>
					{/each}
					<tr>
						<th scope="row">Rauschstreuung je Komponente</th>
						<td colspan="2">{formatNumber(sigma, 3)}</td>
					</tr>
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

	.schemes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 1rem;
	}

	.controls :global(.ui-slider) {
		flex: 1 1 16rem;
	}

	.readout {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.plot {
		display: block;
		width: 100%;
		max-width: 28rem;
		height: auto;
		margin-inline: auto;
	}

	.axis {
		stroke: var(--color-grid);
		stroke-width: 1;
	}

	.axis-label {
		fill: var(--color-ink-subtle);
		font-size: var(--text-2xs);
	}

	.sample {
		fill: var(--color-series-1);
		opacity: 0.35;
	}

	.ideal {
		fill: var(--color-series-3);
		stroke: var(--color-surface);
		stroke-width: 1.2;
	}

	.bits {
		fill: var(--color-ink-muted);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		text-anchor: middle;
	}
</style>
