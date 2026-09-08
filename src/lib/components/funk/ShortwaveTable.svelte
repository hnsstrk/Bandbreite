<script lang="ts">
	/**
	 * Kurzwellen-Rundfunkbänder mit Tageszeit-Hinweis.
	 *
	 * Der Hinweis ist eine Faustregel aus der Ausbreitungsphysik: unterhalb von
	 * etwa 10 MHz dominiert nachts die Raumwelle, oberhalb tagsüber. Er ersetzt
	 * keine Ausbreitungsvorhersage.
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { SHORTWAVE_BANDS } from '$lib/data/broadcast';
	import { formatFrequencyRange } from '$lib/data/bands';

	/** Faustregel zur nutzbaren Tageszeit eines Kurzwellenbandes. */
	function timeHint(centerHz: number): string {
		if (centerHz < 5e6) return 'nachts, Nahbereich am Tag';
		if (centerHz < 10e6) return 'nachts weit, tagsüber regional';
		if (centerHz < 15e6) return 'tagsüber weit, abends abklingend';
		return 'nur tagsüber, stark von der Sonnenaktivität abhängig';
	}
</script>

<Card title="Kurzwellen-Rundfunkbänder" subtitle="Bänder nach VO Funk Artikel 5 mit Faustregel zur Tageszeit">
	<div class="table-scroll">
		<table>
			<caption>
				Rundfunkbänder zwischen 2,3 und 26,1 MHz. Die Tropenbänder sind nur in tropischen
				Zonen für Rundfunk vorgesehen.
			</caption>
			<thead>
				<tr>
					<th scope="col">Band</th>
					<th scope="col">Frequenzbereich</th>
					<th scope="col">Art</th>
					<th scope="col">Nutzbar</th>
				</tr>
			</thead>
			<tbody>
				{#each SHORTWAVE_BANDS as band (band.nameDE)}
					<tr>
						<th scope="row">{band.nameDE}</th>
						<td>{formatFrequencyRange(band.minHz, band.maxHz)}</td>
						<td>
							{#if band.tropical}
								<Badge tone="warning">Tropenband</Badge>
							{:else}
								<Badge tone="neutral">weltweit</Badge>
							{/if}
						</td>
						<td>{timeHint((band.minHz + band.maxHz) / 2)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="note">
		Der Kanalabstand beträgt 5 kHz. Weil sich die nutzbare Frequenz mit Tageszeit und
		Sonnenstand ändert, senden Auslandsdienste dieselbe Sendung häufig gleichzeitig in mehreren
		Bändern.
	</p>
</Card>

<style>
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
		border-bottom: 1px solid var(--color-line-subtle);
		color: var(--color-ink-muted);
	}

	thead th {
		color: var(--color-ink);
		white-space: nowrap;
	}

	tbody th {
		color: var(--color-ink);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
	}

	.note {
		margin: 1rem 0 0;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-ink-muted);
	}
</style>
