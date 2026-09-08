<script lang="ts">
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import AviationChannelCalculator from '$lib/components/funk/AviationChannelCalculator.svelte';
  import AviationBandTable from '$lib/components/funk/AviationBandTable.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/flugfunk';
  import { tocItems } from '$lib/content/funktechnik/types';
  import { articleSection } from '$lib/content/funktechnik/adapt';

  const toc = tocItems(SECTIONS, [
    { id: 'kanalrechner', label: '8,33-kHz-Kanalrechner', after: 'kanalabstand' },
    { id: 'bandtabelle', label: 'Frequenzbereiche', after: 'navigation' }
  ]);

  const section = (id: string) => articleSection(SECTIONS, id);
</script>

<ArticleLayout
  kicker="Funk & Fernmeldetechnik"
  title="Flugfunk und Flugnavigation"
  icon="signal"
  lead="Vom amplitudenmodulierten Sprechfunk über das 8,33-kHz-Kanalraster bis zu VOR, ILS, DME und ADS-B: die Funkwege, auf denen der Luftverkehr geführt wird."
  meta={[
    { label: 'Grundlage', value: 'ICAO Annex 10, VO Funk App. 27' },
    { label: 'Bereich', value: '190 kHz bis 4,4 GHz' }
  ]}
  goals={LEARNING_GOALS}
  {toc}
  href="/wissen/funktechnik/flugfunk/"
>
  <Callout tone="warning" title="Lernhilfe, kein Betriebsdokument">
    Diese Seite erklärt die Technik. Verbindlich sind das Luftfahrthandbuch AIP, die Veröffentlichungen der
    Flugsicherung und die ICAO-Dokumente. Der Betrieb einer Funkanlage im Flugfunkband setzt eine Zulassung und ein
    gültiges Sprechfunkzeugnis voraus.
  </Callout>

  <ArticleSection section={section('sprechfunk')} />
  <ArticleSection section={section('kanalabstand')} />

  <section aria-labelledby="kanalrechner">
    <SectionHeader
      title="8,33-kHz-Kanalrechner"
      id="kanalrechner"
      description="Kanalbezeichnung und tatsächliche Frequenz in beide Richtungen — mit dem Frequenzlineal eines 100-kHz-Abschnitts."
    />
    <AviationChannelCalculator />
  </section>

  <ArticleSection section={section('notfrequenzen')} />
  <ArticleSection section={section('navigation')} />

  <section aria-labelledby="bandtabelle">
    <SectionHeader
      title="Frequenzbereiche"
      id="bandtabelle"
      description="Alle Bereiche des Flugfunk- und Flugnavigationsdienstes, nach Aufgabe filterbar."
    />
    <AviationBandTable />
  </section>

  <ArticleSection section={section('ueberwachung')} />
  <ArticleSection section={section('daten-und-hf')} />
</ArticleLayout>
