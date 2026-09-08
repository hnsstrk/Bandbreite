<script lang="ts">
	/**
	 * W12 – RCS-Vergleich: logarithmisches Balkendiagramm der Referenzobjekte
	 * (RCS_REFERENCE aus $lib/data/constants). Ein Klick setzt σ in die
	 * Mini-Radargleichung: Reichweite relativ zur Referenz ∝ σ^¼.
	 */
	import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
	import ResultCard from '$lib/components/ui/ResultCard.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { formatNumber, formatPercentage, formatRcs } from '$lib/utils/formatting';
	import {
		RCS_OBJECTS,
		rcsScaleFraction,
		relativeRadarRange,
		rcsToDbsm,
		findRcsObject,
		formatPowerOfTen,
		DEFAULT_RCS_REFERENCE_ID
	} from './RcsComparisonModel';

	const W = 800;
	const ROW_H = 26;
	const LABEL_W = 170;
	const BAR_X0 = LABEL_W + 10;
	const BAR_W = W - BAR_X0 - 90;
	const H = RCS_OBJECTS.length * ROW_H + 40;
	const AXIS_TICKS = [1e-5, 1e-3, 1e-1, 1e1, 1e3, 1e5];

	let selectedId = $state<string>('car');
	let referenceId = $state<string>(DEFAULT_RCS_REFERENCE_ID);

	const selected = $derived(findRcsObject(selectedId) ?? RCS_OBJECTS[0]);
	const reference = $derived(findRcsObject(referenceId) ?? RCS_OBJECTS[0]);
	const rangeFactor = $derived(relativeRadarRange(selected.rcsM2, reference.rcsM2));
	const referenceOptions = RCS_OBJECTS.map((entry) => ({ value: entry.id, label: `${entry.nameDE} (${formatRcs(entry.rcsM2)})` }));

	function handleKeydown(event: KeyboardEvent) {
		const index = RCS_OBJECTS.findIndex((entry) => entry.id === selectedId);
		let next = index;
		if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(RCS_OBJECTS.length - 1, index + 1);
		else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(0, index - 1);
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = RCS_OBJECTS.length - 1;
		else return;
		event.preventDefault();
		selectedId = RCS_OBJECTS[next].id;
	}
</script>

<WidgetFrame
	title="Radarquerschnitt im Vergleich"
	description="Balkendiagramm der typischen Radarquerschnitte vom Insekt bis zum Schiff auf logarithmischer Skala; das gewählte Objekt bestimmt die relative Reichweite."
	footnote="Quelle der Werte: Skolnik, Introduction to Radar Systems, Tab. 2.2. Reichweite bei sonst gleichem Radar: R ∝ σ^¼ (aus der Radargleichung)."
	stacked
	interactive
>
	<div class="rcs-chart" role="listbox" aria-label="Objekt auswählen" tabindex="0" onkeydown={handleKeydown}>
		<svg viewBox="0 0 {W} {H}">
			{#each AXIS_TICKS as tick (tick)}
				{@const x = BAR_X0 + rcsScaleFraction(tick) * BAR_W}
				<line x1={x} y1="8" x2={x} y2={H - 30} class="chart-grid-line" />
				<text {x} y={H - 14} text-anchor="middle" class="chart-axis-text">{formatPowerOfTen(tick)} m²</text>
			{/each}
			{#each RCS_OBJECTS as entry, i (entry.id)}
				{@const y = 14 + i * ROW_H}
				{@const width = rcsScaleFraction(entry.rcsM2) * BAR_W}
				{@const active = entry.id === selectedId}
				<g
					class="rcs-row"
					role="option"
					aria-selected={active}
					tabindex="-1"
					aria-label="{entry.nameDE}: {formatRcs(entry.rcsM2)}"
					onclick={() => (selectedId = entry.id)}
					onkeydown={handleKeydown}
				>
					<rect x="0" y={y - 2} width={W} height={ROW_H - 2} fill={active ? 'var(--color-brand-soft)' : 'transparent'} rx="4" />
					<text x={LABEL_W} y={y + 14} text-anchor="end" class="chart-axis-text" font-weight={active ? 600 : 400}>{entry.nameDE}</text>
					<rect
						x={BAR_X0}
						y={y + 3}
						{width}
						height={ROW_H - 12}
						rx="3"
						fill={entry.id === referenceId ? 'var(--color-series-3)' : active ? 'var(--color-series-1-solid)' : 'var(--color-series-1)'}
						opacity={active || entry.id === referenceId ? 1 : 0.7}
					/>
					<text x={BAR_X0 + width + 6} y={y + 14} class="chart-axis-text">{formatRcs(entry.rcsM2)}</text>
				</g>
			{/each}
		</svg>
	</div>

	{#snippet dataTable()}
		<table>
			<caption>Radarquerschnitte der Referenzobjekte</caption>
			<thead><tr><th>Objekt</th><th>RCS</th><th>dBsm</th></tr></thead>
			<tbody>
				{#each RCS_OBJECTS as entry (entry.id)}
					<tr><td>{entry.nameDE}</td><td>{formatRcs(entry.rcsM2)}</td><td>{formatNumber(rcsToDbsm(entry.rcsM2), 1)}</td></tr>
				{/each}
			</tbody>
		</table>
	{/snippet}

	{#snippet controls()}
		<Select label="Referenzobjekt (100 % Reichweite)" bind:value={referenceId} options={referenceOptions} />
	{/snippet}

	{#snippet results()}
		<ResultCard label="Gewählt: {selected.nameDE}" value={formatRcs(selected.rcsM2)} secondary="{formatNumber(rcsToDbsm(selected.rcsM2), 1)} dBsm" hint={selected.descriptionDE} copyable={false} />
		<ResultCard
			label="Reichweite relativ zu {reference.nameDE}"
			value={formatPercentage(rangeFactor * 100, 0)}
			secondary="Faktor {formatNumber(rangeFactor, 2)} = (σ/σ_ref)^¼"
			tone={rangeFactor >= 1 ? 'success' : 'warning'}
			emphasis="hero"
			copyable={false}
		/>
	{/snippet}
</WidgetFrame>

<style>
	.rcs-chart {
		border-radius: var(--radius-control);
	}

	.rcs-row {
		cursor: pointer;
	}

	.rcs-row:hover rect:first-child {
		fill: var(--color-hover);
	}
</style>
