<script lang="ts">
	import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
	import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
	import MaritimeSeaAreas from '$lib/components/funk/MaritimeSeaAreas.svelte';
	import MaritimeChannelConverter from '$lib/components/funk/MaritimeChannelConverter.svelte';
	import MaritimeDistressTable from '$lib/components/funk/MaritimeDistressTable.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/seefunk';
	import { tocItems } from '$lib/content/funktechnik/types';
	import { articleSection } from '$lib/content/funktechnik/adapt';

	const toc = tocItems(SECTIONS, [
		{ id: 'seegebiete', label: 'Karte der Seegebiete', after: 'gmdss' },
		{ id: 'kanalrechner', label: 'Kanalumrechner', after: 'ukw-seefunk' },
		{ id: 'gmdss-frequenzen', label: 'Frequenztabelle', after: 'grenzwelle-kurzwelle' }
	]);

	const section = (id: string) => articleSection(SECTIONS, id);
</script>

<ArticleLayout
	kicker="Funk & Fernmeldetechnik"
	title="Seefunk und GMDSS"
	icon="wave"
	lead="Wie ein Notruf auf See eine Rettungsleitstelle erreicht: die vier GMDSS-Seegebiete, das UKW-Kanalraster nach Appendix 18, digitaler Selektivruf, NAVTEX, AIS und die Seenotfunkbake."
	meta={[
		{ label: 'Grundlage', value: 'VO Funk App. 15 und 18, SOLAS Kapitel IV' },
		{ label: 'Bereich', value: '490 kHz bis 406 MHz' }
	]}
	goals={LEARNING_GOALS}
	{toc}
	href="/wissen/funktechnik/seefunk/"
>
	<Callout tone="warning" title="Lernhilfe, kein Betriebsdokument">
		Diese Seite erklärt Aufbau und Technik des Seefunks. Für den tatsächlichen Betrieb gelten
		ausschließlich die amtlichen Veröffentlichungen — Vollzugsordnung für den Funkdienst,
		Nachrichten für Seefahrer, ITU-Listen der Küsten- und Schiffsfunkstellen sowie die Verfügungen
		der Bundesnetzagentur. Aussendungen auf Not- und Anruffrequenzen ohne Notfall sind strafbar.
	</Callout>

	<ArticleSection section={section('gmdss')} />

	<section aria-labelledby="seegebiete">
		<SectionHeader
			title="Karte der Seegebiete"
			id="seegebiete"
			description="Welches Funksystem trägt wo — schematisch von der Küste auf die offene See."
		/>
		<MaritimeSeaAreas />
	</section>

	<ArticleSection section={section('ukw-seefunk')} />

	<section aria-labelledby="kanalrechner">
		<SectionHeader
			title="Kanalumrechner"
			id="kanalrechner"
			description="Kanalnummer und Frequenz in beide Richtungen, gefiltert nach Nutzungsart."
		/>
		<MaritimeChannelConverter />
	</section>

	<ArticleSection section={section('dsc')} />
	<ArticleSection section={section('grenzwelle-kurzwelle')} />

	<section aria-labelledby="gmdss-frequenzen">
		<SectionHeader
			title="Frequenztabelle"
			id="gmdss-frequenzen"
			description="Not- und Sicherheitsfrequenzen auf Grenz- und Kurzwelle nach Band geordnet."
		/>
		<MaritimeDistressTable />
	</section>

	<ArticleSection section={section('navtex-ais')} />
	<ArticleSection section={section('satellit')} />
	<ArticleSection section={section('betrieb')} />
</ArticleLayout>
