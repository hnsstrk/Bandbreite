<script lang="ts">
	import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
	import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
	import OrbitCalculator from '$lib/components/funk/OrbitCalculator.svelte';
	import SatelliteBandTable from '$lib/components/funk/SatelliteBandTable.svelte';
	import SatelliteSystemTable from '$lib/components/funk/SatelliteSystemTable.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/satellitenfunk';
	import { tocItems } from '$lib/content/funktechnik/types';
	import { articleSection } from '$lib/content/funktechnik/adapt';

	const toc = tocItems(SECTIONS, [
		{ id: 'orbit-rechner', label: 'Orbit-Rechner', after: 'strecke' },
		{ id: 'bandtabelle', label: 'Bändertabelle', after: 'baender' },
		{ id: 'systemtabelle', label: 'Systemtabelle', after: 'systeme' }
	]);

	const section = (id: string) => articleSection(SECTIONS, id);
</script>

<ArticleLayout
	kicker="Funk & Fernmeldetechnik"
	title="Satellitenfunk"
	icon="satellite"
	lead="Von der Bahnhöhe zur Funkverbindung: Umlaufzeit und Latenz, die Bandbuchstaben L bis Ka mit ihrer Auf- und Abwärtskonvention, Transponder, EIRP und G/T — und die Systeme von Inmarsat bis QO-100."
	meta={[
		{ label: 'Grundlage', value: 'VO Funk Art. 5 und 22, ITU-R P.618, IEEE Std 521' },
		{ label: 'Bereich', value: '137 MHz bis 30 GHz' }
	]}
	goals={LEARNING_GOALS}
	{toc}
	href="/wissen/funktechnik/satellitenfunk/"
>
	<ArticleSection section={section('bahnen')} />
	<ArticleSection section={section('strecke')} />

	<section aria-labelledby="orbit-rechner">
		<SectionHeader
			title="Orbit-Rechner"
			id="orbit-rechner"
			description="Bahnhöhe einstellen und ablesen, was daraus folgt: Umlaufzeit, Laufzeit, Sichtbarkeit, Ausleuchtzone, Freiraumdämpfung und Doppler."
		/>
		<OrbitCalculator />
	</section>

	<ArticleSection section={section('baender')} />

	<section aria-labelledby="bandtabelle">
		<SectionHeader
			title="Bändertabelle"
			id="bandtabelle"
			description="Auf- und Abwärtsstrecke je Bandbuchstabe mit typischer Nutzung und Regenverhalten."
		/>
		<SatelliteBandTable />
	</section>

	<ArticleSection section={section('transponder')} />
	<ArticleSection section={section('systeme')} />

	<section aria-labelledby="systemtabelle">
		<SectionHeader
			title="Systemtabelle"
			id="systemtabelle"
			description="Systeme nach Einsatzgebiet, mit den aus der Bahnhöhe gerechneten Kennwerten."
		/>
		<SatelliteSystemTable />
	</section>
</ArticleLayout>
