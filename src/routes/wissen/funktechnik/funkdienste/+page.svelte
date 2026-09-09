<script lang="ts">
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import ServiceSpectrumBar from '$lib/components/funk/ServiceSpectrumBar.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/funkdienste';
  import { tocItems } from '$lib/content/funktechnik/types';
  import { articleSection } from '$lib/content/funktechnik/adapt';

  const toc = tocItems(SECTIONS, [{ id: 'spektrumleiste', label: 'Dienste im Spektrum', after: 'primaer-sekundaer' }]);

  const section = (id: string) => articleSection(SECTIONS, id);
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
  href="/wissen/funktechnik/funkdienste/"
>
  <ArticleSection section={section('begriff')} />
  <ArticleSection section={section('regionen')} />
  <ArticleSection section={section('primaer-sekundaer')} />

  <section aria-labelledby="spektrumleiste">
    <SectionHeader
      title="Dienste im Spektrum"
      id="spektrumleiste"
      description="Kategorie wählen, Frequenzzeiger setzen, Zeile anklicken — die Detailtafel zeigt alle Zuweisungen des Dienstes."
    />
    <ServiceSpectrumBar />
  </section>

  <ArticleSection section={section('vom-vertrag-zur-zuteilung')} />
  <ArticleSection section={section('frequenzplan')} />
  <ArticleSection section={section('lesen')} />
</ArticleLayout>
