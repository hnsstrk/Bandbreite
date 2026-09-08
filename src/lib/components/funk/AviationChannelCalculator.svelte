<script lang="ts">
	/**
	 * 8,33-kHz-Kanalrechner für den VHF-Flugfunk.
	 *
	 * Kern der Sache: Seit der Einführung des 8,33-kHz-Rasters ist die
	 * Kanalbezeichnung nur noch eine Nummer — sie stimmt nicht mehr mit der
	 * gesendeten Frequenz überein. Die Umrechnung folgt der Tabelle in
	 * ICAO Annex 10 Volume V und steht in `data/aviationBands.ts`.
	 */
	import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import ResultCard from '$lib/components/ui/ResultCard.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import AviationChannelScale from './AviationChannelScale.svelte';
	import { FREQUENCY_UNITS } from '$lib/data/units';
	import { formatFixed, formatFrequency, formatNumber } from '$lib/utils/formatting';
	import {
		VHF_COM_MAX_HZ,
		VHF_COM_MIN_HZ,
		VHF_SPACING_25_HZ,
		VHF_SPACING_833_HZ,
		aviationChannelFromDesignator,
		aviationChannelFromFrequency
	} from '$lib/data/aviationBands';

	/** Endungen eines 100-kHz-Abschnitts: vier Rasterplätze mit je drei Kanälen. */
	const SUFFIXES = [
		'000', '005', '010', '015',
		'025', '030', '035', '040',
		'050', '055', '060', '065',
		'075', '080', '085', '090'
	];

	/** Voreinstellung: der erste Kanal des Bandes. */
	const DEFAULT_MHZ = '118';
	const DEFAULT_SUFFIX = '010';
	const DEFAULT_FREQUENCY_HZ = 121_500_000;

	const MHZ_UNITS = FREQUENCY_UNITS.filter((unit) => ['MHz', 'kHz'].includes(unit.id));

	let megahertz = $state(DEFAULT_MHZ);
	let suffix = $state(DEFAULT_SUFFIX);
	let frequencyHz = $state(DEFAULT_FREQUENCY_HZ);
	let frequencyUnit = $state('MHz');

	const mhzOptions = Array.from(
		{ length: (VHF_COM_MAX_HZ - VHF_COM_MIN_HZ) / 1e6 },
		(_, i) => VHF_COM_MIN_HZ / 1e6 + i
	).map((value) => ({ value: String(value), label: `${value} MHz` }));

	const suffixOptions = SUFFIXES.map((value) => ({
		value,
		label: value.endsWith('00') || value.endsWith('25') || value.endsWith('50') || value.endsWith('75')
			? `…${value} (25 kHz)`
			: `…${value} (8,33 kHz)`
	}));

	const designator = $derived(`${megahertz}.${suffix}`);
	const channel = $derived(aviationChannelFromDesignator(designator));
	const reverse = $derived(aviationChannelFromFrequency(frequencyHz));

	/** Alle Kanäle des dargestellten 100-kHz-Abschnitts. */
	const scaleChannels = $derived(
		SUFFIXES.map((value) => aviationChannelFromDesignator(`${megahertz}.${value}`)).filter(
			(entry) => entry !== undefined
		)
	);

	/** Wie weit liegt die tatsächliche Frequenz neben der Bezeichnung? */
	const offsetHz = $derived(
		channel ? channel.frequencyHz - (Number(megahertz) * 1e6 + Number(suffix) * 1000) : 0
	);
</script>

<WidgetFrame
	title="8,33-kHz-Kanalrechner"
	description="Frequenzlineal über 100 kHz des Flugfunkbandes: vier 25-kHz-Rasterplätze mit je drei Kanälen im Abstand von 8,33 kHz; der gewählte Kanal ist hervorgehoben."
	stacked
	footnote="Kanalbezeichnungstabelle nach ICAO Annex 10 Volume V; Einführung in Europa nach Durchführungsverordnung (EU) Nr. 1079/2012."
>
	<AviationChannelScale megahertz={Number(megahertz)} selected={designator} channels={scaleChannels} />

	{#snippet controls()}
		<Select label="Megahertz" bind:value={megahertz} options={mhzOptions} />
		<Select label="Kanalendung" bind:value={suffix} options={suffixOptions} />
		<NumberInput
			label="Frequenz nachschlagen"
			bind:value={frequencyHz}
			bind:unit={frequencyUnit}
			units={MHZ_UNITS}
			min={VHF_COM_MIN_HZ}
			max={VHF_COM_MAX_HZ - VHF_SPACING_833_HZ}
			step="any"
		/>
	{/snippet}

	{#snippet results()}
		<ResultCard
			label="Kanalbezeichnung"
			value={designator}
			secondary={channel?.spacingHz === VHF_SPACING_25_HZ
				? 'klassischer 25-kHz-Kanal'
				: 'Kanal im 8,33-kHz-Raster'}
			emphasis="hero"
		/>
		<ResultCard
			label="Tatsächliche Frequenz"
			value={channel ? `${formatFixed(channel.frequencyHz / 1e6, 6)} MHz` : '—'}
			secondary={channel && Math.abs(offsetHz) > 1
				? `${formatNumber(offsetHz / 1000, 2)} kHz gegenüber der Bezeichnung`
				: 'Bezeichnung und Frequenz stimmen überein'}
			copyable
		/>
		<ResultCard
			label="Bezeichnung zu {formatFrequency(frequencyHz, 4)}"
			value={reverse?.designator ?? 'kein Kanal'}
			secondary={reverse ? `${formatFixed(reverse.frequencyHz / 1e6, 6)} MHz` : 'außerhalb 118–137 MHz'}
		/>
	{/snippet}

	{#snippet dataTable()}
		<table>
			<caption>Kanalbezeichnungen und Frequenzen im Abschnitt {megahertz},000 bis {megahertz},100 MHz</caption>
			<thead>
				<tr>
					<th scope="col">Bezeichnung</th>
					<th scope="col">Frequenz in MHz</th>
					<th scope="col">Kanalabstand</th>
				</tr>
			</thead>
			<tbody>
				{#each scaleChannels as entry (entry.designator)}
					<tr>
						<th scope="row">{entry.designator}</th>
						<td>{formatFixed(entry.frequencyHz / 1e6, 6)}</td>
						<td>{entry.spacingHz === VHF_SPACING_25_HZ ? '25 kHz' : '8,33 kHz'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/snippet}
</WidgetFrame>

<Callout tone="warning" title="Bezeichnung ist nicht Frequenz">
	Die Freigabe „contact Radar one one eight decimal zero one zero" meint den Kanal 118.010 — der
	Sender arbeitet dabei auf 118,008 333 MHz. Bezeichnungen mit den Endungen 20, 45, 70 und 95 gibt
	es nicht; sie wären im Sprechfunk zu leicht mit den vergebenen zu verwechseln.
</Callout>
