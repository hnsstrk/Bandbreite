<script lang="ts">
	import ArticleLayout from '$lib/components/funk/ArticleLayout.svelte';
	import ContentSection from '$lib/components/funk/ContentSection.svelte';
	import ServiceSpectrumBar from '$lib/components/funk/ServiceSpectrumBar.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/funkdienste';
	import { findSection, tocItems } from '$lib/content/funktechnik/types';

	const toc = tocItems(SECTIONS, [
		{ id: 'spektrumleiste', label: 'Dienste im Spektrum', after: 'primaer-sekundaer' }
	]);

	const section = (id: string) => findSection(SECTIONS, id)!;
</script>

<ArticleLayout
	title="Funkdienste & Frequenzplan"
	icon="radio"
	lead="Warum eine Frequenz jemandem „gehört“: die Systematik der ITU-Funkdienste, der Unterschied zwischen primärer und sekundärer Zuweisung und der Weg von der Vollzugsordnung bis zur einzelnen Zuteilung."
	meta={[
		{ label: 'Grundlage', value: 'VO Funk Art. 1 und 5' },
		{ label: 'Region', value: 'ITU-Region 1 / Deutschland' }
	]}
	goals={LEARNING_GOALS}
	{toc}
	relatedHref="/wissen/funktechnik/funkdienste/"
>
	<ContentSection section={section('begriff')} />
	<ContentSection section={section('regionen')} />
	<ContentSection section={section('primaer-sekundaer')} />

	<section class="widget" aria-labelledby="spektrumleiste">
		<SectionHeader
			title="Dienste im Spektrum"
			id="spektrumleiste"
			description="Kategorie wählen, Frequenzzeiger setzen, Zeile anklicken — die Detailtafel zeigt alle Zuweisungen des Dienstes."
		/>
		<ServiceSpectrumBar />
	</section>

	<ContentSection section={section('vom-vertrag-zur-zuteilung')} />
	<ContentSection section={section('frequenzplan')} />
	<ContentSection section={section('lesen')} />
</ArticleLayout>

<style>
	.widget {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
