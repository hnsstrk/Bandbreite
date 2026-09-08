<script lang="ts">
	import ArticleLayout from '$lib/components/funk/ArticleLayout.svelte';
	import ContentSection from '$lib/components/funk/ContentSection.svelte';
	import { SECTIONS } from '$lib/content/funktechnik/quellen';
	import { tocItems } from '$lib/content/funktechnik/types';

	const toc = tocItems(SECTIONS);
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
	relatedHref="/service/quellen/"
>
	{#each SECTIONS as section (section.id)}
		<ContentSection {section} />
	{/each}
</ArticleLayout>
