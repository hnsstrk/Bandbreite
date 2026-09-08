<script lang="ts">
	import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
	import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
	import { SECTIONS } from '$lib/content/funktechnik/quellen';
	import { tocItems } from '$lib/content/funktechnik/types';
	import { articleSections } from '$lib/content/funktechnik/adapt';

	const toc = tocItems(SECTIONS);
	const sections = articleSections(SECTIONS);
</script>

<ArticleLayout
	kicker="Service"
	title="Quellen & Stand"
	icon="book"
	lead="Woher die Daten dieser Anwendung stammen, welche Regelwerke und Normen zugrunde liegen und welche Angaben ausdrücklich unsicher sind."
	meta={[
		{ label: 'Bereich', value: 'Regulierung, Normen, Datensätze' },
		{ label: 'Charakter', value: 'Lernanwendung, nicht amtlich' }
	]}
	{toc}
	href="/service/quellen/"
>
	{#each sections as section (section.id)}
		<ArticleSection {section} />
	{/each}
</ArticleLayout>
