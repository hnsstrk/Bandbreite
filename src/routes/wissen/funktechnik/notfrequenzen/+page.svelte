<script lang="ts">
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import EmergencyTable from '$lib/components/funk/EmergencyTable.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/notfrequenzen';
  import { tocItems } from '$lib/content/funktechnik/types';
  import { articleSection } from '$lib/content/funktechnik/adapt';

  const toc = tocItems(SECTIONS, [{ id: 'frequenztabelle', label: 'Frequenztabelle', after: 'grundidee' }]);

  const section = (id: string) => articleSection(SECTIONS, id);
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
  href="/wissen/funktechnik/notfrequenzen/"
>
  <Callout tone="warning" title="Keine amtliche Quelle, kein Betriebsdokument">
    Diese Zusammenstellung dient der Ausbildung und der Einordnung. Für den realen Not- und Sicherheitsfunk gelten
    ausschließlich die amtlichen Veröffentlichungen — Nachrichten für Seefahrer, Luftfahrthandbuch AIP, ITU-Listen und
    die Verfügungen der Bundesnetzagentur. Aussendungen auf Notfrequenzen ohne Notfall sind strafbar.
  </Callout>

  <ArticleSection section={section('grundidee')} />

  <section aria-labelledby="frequenztabelle">
    <SectionHeader
      title="Frequenztabelle"
      id="frequenztabelle"
      description="Nach Bereich und Zweck filtern oder im Volltext suchen; sortiert nach Frequenz."
    />
    <EmergencyTable />
  </section>

  <ArticleSection section={section('see')} />
  <ArticleSection section={section('luft')} />
  <ArticleSection section={section('land')} />
</ArticleLayout>
