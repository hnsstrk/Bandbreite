<script lang="ts">
	import ArticleLayout from '$lib/components/funk/ArticleLayout.svelte';
	import ContentSection from '$lib/components/funk/ContentSection.svelte';
	import EmergencyTable from '$lib/components/funk/EmergencyTable.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/notfrequenzen';
	import { findSection, tocItems } from '$lib/content/funktechnik/types';

	const toc = tocItems(SECTIONS, [
		{ id: 'frequenztabelle', label: 'Frequenztabelle', after: 'grundidee' }
	]);

	const section = (id: string) => findSection(SECTIONS, id)!;
</script>

<ArticleLayout
	title="Not- und Sicherheitsfrequenzen"
	icon="warning"
	lead="Not-, Anruf- und Sicherheitsfrequenzen von See-, Flug- und Landfunk — als Nachschlagehilfe zum Lernen, ausdrücklich nicht als Betriebsdokument."
	meta={[
		{ label: 'Grundlage', value: 'VO Funk Art. 30–34, GMDSS, ICAO Annex 10' },
		{ label: 'Einträge', value: 'See, Luft, Land, Satellit' }
	]}
	goals={LEARNING_GOALS}
	{toc}
	relatedHref="/wissen/funktechnik/notfrequenzen/"
>
	<Callout tone="warning" title="Keine amtliche Quelle, kein Betriebsdokument">
		Diese Zusammenstellung dient der Ausbildung und der Einordnung. Für den realen Not- und
		Sicherheitsfunk gelten ausschließlich die amtlichen Veröffentlichungen — Nachrichten für
		Seefahrer, Luftfahrthandbuch AIP, ITU-Listen und die Verfügungen der Bundesnetzagentur.
		Aussendungen auf Notfrequenzen ohne Notfall sind strafbar.
	</Callout>

	<ContentSection section={section('grundidee')} />

	<section class="widget" aria-labelledby="frequenztabelle">
		<SectionHeader
			title="Frequenztabelle"
			id="frequenztabelle"
			description="Nach Bereich und Zweck filtern oder im Volltext suchen; sortiert nach Frequenz."
		/>
		<EmergencyTable />
	</section>

	<ContentSection section={section('see')} />
	<ContentSection section={section('luft')} />
	<ContentSection section={section('land')} />
</ArticleLayout>

<style>
	.widget {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
