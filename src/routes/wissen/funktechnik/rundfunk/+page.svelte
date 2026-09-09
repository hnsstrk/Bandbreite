<script lang="ts">
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import ChannelConverter from '$lib/components/funk/ChannelConverter.svelte';
  import ShortwaveTable from '$lib/components/funk/ShortwaveTable.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/rundfunk';
  import { tocItems } from '$lib/content/funktechnik/types';
  import { articleSection } from '$lib/content/funktechnik/adapt';

  const toc = tocItems(SECTIONS, [
    { id: 'kurzwellenbaender', label: 'Kurzwellenbänder', after: 'am-bereiche' },
    { id: 'kanalrechner', label: 'Kanal-Umrechner', after: 'dvbt2' }
  ]);

  const section = (id: string) => articleSection(SECTIONS, id);
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
  href="/wissen/funktechnik/rundfunk/"
>
  <ArticleSection section={section('am-bereiche')} />

  <section aria-labelledby="kurzwellenbaender">
    <SectionHeader
      title="Kurzwellenbänder"
      id="kurzwellenbaender"
      description="Alle Rundfunkbänder zwischen 2,3 und 26,1 MHz mit Faustregel zur nutzbaren Tageszeit."
    />
    <ShortwaveTable />
  </section>

  <ArticleSection section={section('ukw')} />
  <ArticleSection section={section('dab')} />
  <ArticleSection section={section('dvbt2')} />

  <section aria-labelledby="kanalrechner">
    <SectionHeader
      title="Kanal-Umrechner"
      id="kanalrechner"
      description="DAB-Block, DVB-T2-Kanal und UKW-Rasterplatz in beide Richtungen umrechnen."
    />
    <ChannelConverter />
  </section>

  <ArticleSection section={section('wandel')} />
</ArticleLayout>
