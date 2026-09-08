<script lang="ts">
	/**
	 * Zeitstrahl vom analogen BOS-Funk zum Digitalfunk.
	 *
	 * Die Marken liegen maßstäblich auf der Jahresachse; ein Klick oder ein
	 * Tastendruck wählt eine Marke aus und zeigt den zugehörigen Text.
	 * Die Daten stehen in `BosTimelineModel.ts`.
	 */
	import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { BOS_MILESTONES } from './BosTimelineModel';

	const W = 800;
	const H = 220;
	const X0 = 48;
	const X1 = 764;
	const AXIS_Y = 130;

	/** Achsenbereich in Jahren. */
	const YEAR_MIN = 1950;
	const YEAR_MAX = 2025;
	/** Abstand der Jahresbeschriftungen. */
	const TICK_STEP = 10;

	let selected = $state(BOS_MILESTONES.length - 1);

	const xOf = (year: number) =>
		X0 + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (X1 - X0);

	const ticks = Array.from(
		{ length: Math.floor((YEAR_MAX - YEAR_MIN) / TICK_STEP) + 1 },
		(_, i) => YEAR_MIN + i * TICK_STEP
	);

	/** Erstes digitales Ereignis markiert den Übergang. */
	const switchYear = BOS_MILESTONES.find((entry) => entry.era === 'digital')?.year ?? YEAR_MAX;

	const active = $derived(BOS_MILESTONES[selected]);

	function color(era: 'analog' | 'digital'): string {
		return era === 'analog' ? 'var(--color-series-8-solid)' : 'var(--color-series-1-solid)';
	}
</script>

<WidgetFrame
	title="Vom analogen Funk zum Digitalfunk"
	description="Zeitstrahl von 1950 bis heute: graue Marken stehen für die analoge Epoche im 4-m- und 2-m-Band, blaue Marken für den digitalen TETRA-Funk ab der Gründung der BDBOS 2007."
	stacked
	interactive
	footnote="Jahreszahlen nach Angaben der BDBOS sowie den Verordnungen zu eCall und zur Notrufortung. Die Jahrzehnt-Angaben fassen eine schrittweise Entwicklung zusammen."
>
	<svg viewBox="0 0 {W} {H}">
		<title>Zeitstrahl der BOS-Funkgeschichte</title>
		<!-- Epochen -->
		<rect x={X0} y={AXIS_Y - 10} width={xOf(switchYear) - X0} height="20" fill="var(--color-elevated)" />
		<rect
			x={xOf(switchYear)}
			y={AXIS_Y - 10}
			width={X1 - xOf(switchYear)}
			height="20"
			fill="var(--color-brand-soft)"
		/>
		<text x={(X0 + xOf(switchYear)) / 2} y={AXIS_Y + 46} text-anchor="middle" class="era">
			analog · 4 m und 2 m
		</text>
		<text x={(xOf(switchYear) + X1) / 2} y={AXIS_Y + 46} text-anchor="middle" class="era">
			digital · TETRA 380–395 MHz
		</text>

		<line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} class="chart-axis-line" />

		{#each ticks as year (year)}
			<line x1={xOf(year)} y1={AXIS_Y + 10} x2={xOf(year)} y2={AXIS_Y + 16} class="chart-axis-line" />
			<text x={xOf(year)} y={AXIS_Y + 30} text-anchor="middle" class="chart-axis-text">{year}</text>
		{/each}

		{#each BOS_MILESTONES as milestone, index (milestone.labelDE)}
			{@const x = xOf(milestone.year)}
			{@const up = index % 2 === 0}
			{@const y = up ? 44 : 96}
			<g
				role="button"
				tabindex="0"
				aria-label="{milestone.labelDE}: {milestone.titleDE}"
				aria-pressed={index === selected}
				onclick={() => (selected = index)}
				onkeydown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						selected = index;
					}
				}}
				class="marker"
				class:marker--active={index === selected}
			>
				<line x1={x} y1={y + 8} x2={x} y2={AXIS_Y - 10} stroke={color(milestone.era)} stroke-width="1.5" />
				<circle cx={x} cy={AXIS_Y} r={index === selected ? 8 : 5} fill={color(milestone.era)} />
				<text x={x} y={y} text-anchor="middle" class="year" class:year--active={index === selected}>
					{milestone.labelDE}
				</text>
			</g>
		{/each}
	</svg>

	{#snippet results()}
		<div class="detail">
			<Badge tone={active.era === 'analog' ? 'neutral' : 'brand'}>{active.labelDE}</Badge>
			<h4>{active.titleDE}</h4>
			<p>{active.textDE}</p>
		</div>
	{/snippet}

	{#snippet dataTable()}
		<table>
			<caption>Meilensteine des BOS-Funks in Deutschland</caption>
			<thead>
				<tr>
					<th scope="col">Zeitpunkt</th>
					<th scope="col">Epoche</th>
					<th scope="col">Ereignis</th>
					<th scope="col">Bedeutung</th>
				</tr>
			</thead>
			<tbody>
				{#each BOS_MILESTONES as milestone (milestone.labelDE)}
					<tr>
						<th scope="row">{milestone.labelDE}</th>
						<td>{milestone.era === 'analog' ? 'analog' : 'digital'}</td>
						<td>{milestone.titleDE}</td>
						<td>{milestone.textDE}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/snippet}
</WidgetFrame>

<style>
	.marker {
		cursor: pointer;
	}

	.marker:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.year {
		font-size: 0.8125rem;
		fill: var(--color-ink-muted);
	}

	.year--active {
		fill: var(--color-ink);
		font-weight: var(--font-weight-semibold);
	}

	.era {
		font-size: 0.75rem;
		fill: var(--color-ink-subtle);
	}

	.detail h4 {
		margin: 0.5rem 0 0.25rem;
		font-size: var(--font-size-base);
		color: var(--color-ink);
	}

	.detail p {
		margin: 0;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-ink-muted);
	}
</style>
