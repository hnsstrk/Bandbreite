<script lang="ts">
	import ArticleLayout from '$lib/components/funk/ArticleLayout.svelte';
	import ContentSection from '$lib/components/funk/ContentSection.svelte';
	import MobileGenerations from '$lib/components/funk/MobileGenerations.svelte';
	import MobileBandTable from '$lib/components/funk/MobileBandTable.svelte';
	import DataRateCalculator from '$lib/components/funk/DataRateCalculator.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/mobilfunk';
	import { findSection, tocItems } from '$lib/content/funktechnik/types';

	const toc = tocItems(SECTIONS, [
		{ id: 'generationen', label: 'Generationen im Zeitstrahl', after: 'zugriffsverfahren' },
		{ id: 'bandtabelle', label: 'Bandtabelle', after: 'baender-de' },
		{ id: 'datenraten-rechner', label: 'Datenraten-Rechner', after: 'bandtabelle' }
	]);

	const section = (id: string) => findSection(SECTIONS, id)!;
</script>

<ArticleLayout
	title="Mobilfunk"
	icon="signal"
	lead="Vom analogen C-Netz bis 5G NR: Zellprinzip, Zugriffsverfahren, Duplex und die Frage, wie viel Datenrate in einer bestimmten Bandbreite steckt."
	meta={[
		{ label: 'Grundlage', value: '3GPP TS 36.101 / 38.101' },
		{ label: 'Region', value: 'Deutschland und EU' }
	]}
	goals={LEARNING_GOALS}
	{toc}
	relatedHref="/wissen/funktechnik/mobilfunk/"
>
	<ContentSection section={section('zellprinzip')} />
	<ContentSection section={section('zugriffsverfahren')} />

	<section class="widget" aria-labelledby="generationen">
		<SectionHeader
			title="Generationen im Zeitstrahl"
			id="generationen"
			description="Marke wählen, um die Einordnung zu lesen; die Tabelle nennt Zugriffsverfahren, Bandbreiten, Datenraten und Latenz."
		/>
		<MobileGenerations />
	</section>

	<ContentSection section={section('duplex')} />
	<ContentSection section={section('baender-de')} />

	<section class="widget" aria-labelledby="bandtabelle">
		<SectionHeader
			title="Bandtabelle"
			id="bandtabelle"
			description="Filter nach Technologie und Duplexverfahren; der Balken zeigt die Lage von Uplink und Downlink."
		/>
		<MobileBandTable />
	</section>

	<section class="widget" aria-labelledby="datenraten-rechner">
		<SectionHeader
			title="Datenraten-Rechner"
			id="datenraten-rechner"
			description="Wie viel Bruttodatenrate ergibt eine Kanalbandbreite bei angenommener spektraler Effizienz?"
		/>
		<DataRateCalculator />
	</section>

	<ContentSection section={section('mimo')} />
</ArticleLayout>

<style>
	.widget {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
