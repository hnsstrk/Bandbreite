<script lang="ts">
	import ArticleLayout from '$lib/components/funk/ArticleLayout.svelte';
	import ContentSection from '$lib/components/funk/ContentSection.svelte';
	import ChannelConverter from '$lib/components/funk/ChannelConverter.svelte';
	import ShortwaveTable from '$lib/components/funk/ShortwaveTable.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/rundfunk';
	import { findSection, tocItems } from '$lib/content/funktechnik/types';

	const toc = tocItems(SECTIONS, [
		{ id: 'kurzwellenbaender', label: 'Kurzwellenbänder', after: 'am-bereiche' },
		{ id: 'kanalrechner', label: 'Kanal-Umrechner', after: 'dvbt2' }
	]);

	const section = (id: string) => findSection(SECTIONS, id)!;
</script>

<ArticleLayout
	title="Rundfunk"
	icon="radio"
	lead="Von der Langwelle bis DVB-T2: Ausbreitung und Raster der klassischen Rundfunkbereiche, das UKW-Multiplexsignal, DAB+ im Gleichwellennetz und der Weg des Satellitensignals ins Kabel."
	meta={[
		{ label: 'Grundlage', value: 'GE75, GE84, GE06' },
		{ label: 'Bereich', value: '148,5 kHz bis 12,75 GHz' }
	]}
	goals={LEARNING_GOALS}
	{toc}
	relatedHref="/wissen/funktechnik/rundfunk/"
>
	<ContentSection section={section('am-bereiche')} />

	<section class="widget" aria-labelledby="kurzwellenbaender">
		<SectionHeader
			title="Kurzwellenbänder"
			id="kurzwellenbaender"
			description="Alle Rundfunkbänder zwischen 2,3 und 26,1 MHz mit Faustregel zur nutzbaren Tageszeit."
		/>
		<ShortwaveTable />
	</section>

	<ContentSection section={section('ukw')} />
	<ContentSection section={section('dab')} />
	<ContentSection section={section('dvbt2')} />

	<section class="widget" aria-labelledby="kanalrechner">
		<SectionHeader
			title="Kanal-Umrechner"
			id="kanalrechner"
			description="DAB-Block, DVB-T2-Kanal und UKW-Rasterplatz in beide Richtungen umrechnen."
		/>
		<ChannelConverter />
	</section>

	<ContentSection section={section('wandel')} />
</ArticleLayout>

<style>
	.widget {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
