<script lang="ts">
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import AmateurBandplan from '$lib/components/funk/AmateurBandplan.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/amateurfunk';
  import { tocItems } from '$lib/content/funktechnik/types';
  import { articleSection } from '$lib/content/funktechnik/adapt';

  const toc = tocItems(SECTIONS, [
    { id: 'bandplan-visualisierer', label: 'Bandplan-Visualisierer', after: 'bandplan-prinzip' }
  ]);

  const section = (id: string) => articleSection(SECTIONS, id);
</script>

<ArticleLayout
  title="Amateurfunk"
  icon="antenna"
  lead="Bandplan der IARU-Region 1, die deutschen Zeugnisklassen A, E und N, Betriebsarten von Telegrafie bis FT8 und die Frage, welches Band zu welcher Tageszeit trägt."
  meta={[
    { label: 'Grundlage', value: 'AFuV, IARU-R1-Bandplan' },
    { label: 'Bänder', value: '2200 m bis 1,2 cm' }
  ]}
  goals={LEARNING_GOALS}
  {toc}
  href="/wissen/funktechnik/amateurfunk/"
>
  <ArticleSection section={section('dienst')} />
  <ArticleSection section={section('klassen')} />
  <ArticleSection section={section('rufzeichen')} />
  <ArticleSection section={section('bandplan-prinzip')} />

  <section aria-labelledby="bandplan-visualisierer">
    <SectionHeader
      title="Bandplan-Visualisierer"
      id="bandplan-visualisierer"
      description="Klasse wählen, Segment anklicken: Betriebsart, Grenzen, Wellenlänge und eine Ausbreitungsregel je Band."
    />
    <AmateurBandplan />
    <Callout tone="warning" title="Kein Betriebsdokument">
      Die Darstellung gibt die Systematik wieder. Verbindlich sind die Amateurfunkverordnung und der jeweils gültige
      Bandplan der IARU-Region 1.
    </Callout>
  </section>

  <ArticleSection section={section('betriebsarten')} />
  <ArticleSection section={section('welches-band')} />
</ArticleLayout>
