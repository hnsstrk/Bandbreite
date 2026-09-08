<script lang="ts">
	import PageHero from '$lib/components/ui/PageHero.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
	import ApplicationDatabase from '$lib/components/funk/ApplicationDatabase.svelte';
	import { ALL_APPLICATIONS } from '$lib/data/applications';
	import { categoryCounts } from '$lib/components/funk/applicationFilter.svelte';

	const categories = categoryCounts();
</script>

<PageHero
	kicker="Datenbanken"
	title="Funkdienste"
	icon="database"
	lead="Alle erfassten Frequenzzuweisungen dieser Anwendung — durchsuchbar, nach Kategorie und Frequenzfenster filterbar und mit Bandzuordnung nach ITU und IEEE."
	meta={[
		{ label: 'Einträge', value: String(ALL_APPLICATIONS.length) },
		{ label: 'Kategorien', value: String(categories.length) },
		{ label: 'Schwerpunkt', value: 'Europa und Deutschland' }
	]}
/>

<div class="page">
	<p class="intro">
		Jeder Eintrag beschreibt eine Funkanwendung mit ihrem Frequenzbereich, der Kategorie und
		einer kurzen Einordnung. Ein Klick auf eine Zeile öffnet die Detailtafel mit Mittenfrequenz,
		Wellenlänge, ITU- und IEEE-Band sowie Verweisen in das Spektrum und in die Rechner. Die
		Systematik hinter den Zuweisungen erklärt das Kapitel
		<a href="/wissen/funktechnik/funkdienste/">Funkdienste &amp; Frequenzplan</a>.
	</p>

	<ApplicationDatabase />

	<Callout tone="warning" title="Stand und Verbindlichkeit">
		Die Zuweisungen sind für Europa und Deutschland zusammengetragen und dienen der Orientierung.
		Verbindlich sind der Frequenzplan der Bundesnetzagentur und die Vollzugsordnung für den
		Funkdienst. Die Herkunft der Daten steht unter
		<a href="/service/quellen/">Quellen &amp; Stand</a>.
	</Callout>

	<RelatedTopics href="/datenbanken/funkdienste/" />
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-top: 2rem;
	}

	.intro {
		margin: 0;
		max-width: var(--container-prose, 68ch);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-ink-muted);
	}

	.intro a {
		color: var(--color-brand);
	}
</style>
