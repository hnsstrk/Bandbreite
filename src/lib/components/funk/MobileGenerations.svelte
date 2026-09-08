<script lang="ts">
	/**
	 * Zeitstrahl und Vergleichstabelle der Mobilfunkgenerationen.
	 *
	 * Der Zeitstrahl trägt das Jahr der ersten kommerziellen Netze in
	 * Deutschland linear auf; die Auswahl einer Marke hebt die zugehörige
	 * Tabellenzeile hervor und zeigt die Einordnung darunter.
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { MOBILE_GENERATIONS } from '$lib/data/mobileNetworks';
	import { formatDataRate, formatFrequency } from '$lib/utils/formatting';
	import { clamp, safeDivide } from '$lib/utils/handlers';

	const FIRST_YEAR = 1980;
	const LAST_YEAR = 2032;

	let selectedId = $state<string | null>(null);
	const selected = $derived(MOBILE_GENERATIONS.find((gen) => gen.id === selectedId) ?? null);

	function position(year: number): number {
		return clamp(safeDivide(year - FIRST_YEAR, LAST_YEAR - FIRST_YEAR, 0) * 100, 0, 100);
	}

	const decades = [1980, 1990, 2000, 2010, 2020, 2030];
</script>

<Card title="Generationen 1G bis 6G" subtitle="Erste kommerzielle Netze in Deutschland">
	<div class="timeline">
		<ul class="scale" aria-hidden="true">
			{#each decades as year (year)}
				<li style="left: {position(year)}%">{year}</li>
			{/each}
		</ul>
		<div class="track">
			{#each MOBILE_GENERATIONS as gen (gen.id)}
				<button
					type="button"
					class="pin"
					class:pin--active={selectedId === gen.id}
					style="left: {position(gen.yearGermany)}%"
					aria-pressed={selectedId === gen.id}
					onclick={() => (selectedId = selectedId === gen.id ? null : gen.id)}
				>
					<span aria-hidden="true">{gen.generation}</span>
					<span class="sr-only">
						{gen.generation}, {gen.nameDE}, Deutschland ab {gen.yearGermany}
					</span>
				</button>
			{/each}
		</div>
	</div>

	<p class="lead" role="status">
		{#if selected}
			<strong>{selected.generation}</strong> — {selected.descriptionDE}
		{:else}
			Eine Marke auswählen, um die Einordnung der Generation zu lesen.
		{/if}
	</p>

	<div class="table-scroll">
		<table>
			<caption>Kennwerte der Mobilfunkgenerationen (Größenordnungen der Technikstufe)</caption>
			<thead>
				<tr>
					<th scope="col">Generation</th>
					<th scope="col">Systeme</th>
					<th scope="col">Weltweit / DE</th>
					<th scope="col">Zugriff</th>
					<th scope="col">Kanalbandbreiten</th>
					<th scope="col">Typisch DL</th>
					<th scope="col">Spitze DL</th>
					<th scope="col">Latenz</th>
				</tr>
			</thead>
			<tbody>
				{#each MOBILE_GENERATIONS as gen (gen.id)}
					<tr class:row--active={selectedId === gen.id}>
						<th scope="row">{gen.generation}</th>
						<td>{gen.nameDE}</td>
						<td>{gen.yearWorldwide} / {gen.yearGermany}</td>
						<td>{gen.access.join(', ')}</td>
						<td>
							{gen.channelBandwidthsHz.map((hz) => formatFrequency(hz, 0)).join(', ')}
						</td>
						<td>{formatDataRate(gen.typicalDownlinkBps, 1)}</td>
						<td>{formatDataRate(gen.peakDownlinkBps, 1)}</td>
						<td>{gen.latencyMs} ms</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#snippet footer()}
		<span class="footnote">
			<Badge tone="warning">Ausblick</Badge>
			6G ist nicht standardisiert; die Werte geben die Ziele des ITU-Rahmens IMT-2030 wieder.
		</span>
	{/snippet}
</Card>

<style>
	.timeline {
		margin-bottom: 1rem;
		padding-top: 1.25rem;
	}

	.scale {
		position: relative;
		list-style: none;
		margin: 0;
		padding: 0;
		height: 1rem;
	}

	.scale li {
		position: absolute;
		transform: translateX(-50%);
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}

	.track {
		position: relative;
		height: 2.75rem;
		border-top: 2px solid var(--color-line);
	}

	.pin {
		position: absolute;
		top: -0.75rem;
		transform: translateX(-50%);
		padding: 0.125rem 0.5rem;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
		background-color: var(--color-elevated);
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-pill, 9999px);
		cursor: pointer;
	}

	.pin--active {
		background-color: var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-brand-on);
	}

	.lead {
		margin: 0 0 1rem;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-ink-muted);
		min-height: 3rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
	}

	caption {
		text-align: left;
		padding-bottom: 0.5rem;
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}

	th,
	td {
		padding: 0.5rem 0.75rem 0.5rem 0;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--color-line-subtle);
		color: var(--color-ink-muted);
		white-space: nowrap;
	}

	thead th {
		color: var(--color-ink);
	}

	tbody th {
		color: var(--color-ink);
		font-weight: var(--font-weight-semibold);
	}

	.row--active td,
	.row--active th {
		background-color: var(--color-brand-soft);
	}

	.footnote {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}
</style>
