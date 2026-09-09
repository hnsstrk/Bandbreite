<script lang="ts">
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import BosTimeline from '$lib/components/funk/BosTimeline.svelte';
  import BosComparisonTable from '$lib/components/funk/BosComparisonTable.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { LEARNING_GOALS, SECTIONS } from '$lib/content/funktechnik/bos';
  import { tocItems } from '$lib/content/funktechnik/types';
  import { articleSection } from '$lib/content/funktechnik/adapt';

  const toc = tocItems(SECTIONS, [
    { id: 'zeitstrahl', label: 'Zeitstrahl analog → digital', after: 'grundlagen' },
    { id: 'vergleich', label: 'Vergleichstabelle', after: 'digitalfunk' }
  ]);

  const section = (id: string) => articleSection(SECTIONS, id);
</script>

<ArticleLayout
  title="BOS- und Behördenfunk"
  icon="radio"
  lead="Vom analogen 4-m- und 2-m-Band zum bundesweiten TETRA-Digitalfunk: wie Polizei, Feuerwehr und Rettungsdienste in Deutschland funken — und was am Notruf 112 heute anders ist."
  meta={[
    { label: 'Grundlage', value: 'BNetzA-Frequenzplan, BDBOS, ETSI EN 300 392' },
    { label: 'Bereich', value: '74 MHz bis 395 MHz' }
  ]}
  goals={LEARNING_GOALS}
  {toc}
  href="/wissen/funktechnik/bos/"
>
  <Callout tone="warning" title="Reine Information — Abhören ist strafbar">
    Diese Seite gibt ausschließlich öffentlich veröffentlichte Systeminformationen wieder: Frequenzbereiche, Raster,
    Verfahren und Geschichte. Sie enthält keine Kanal- oder Rufgruppenpläne und keine Betriebsunterlagen. Das Abhören
    von Behördenfunk ist nach § 5 TDDDG untersagt und nach § 27 TDDDG mit Freiheitsstrafe bis zu zwei Jahren oder
    Geldstrafe bedroht — das gilt auch für die Weitergabe des Gehörten.
  </Callout>

  <ArticleSection section={section('grundlagen')} />

  <section aria-labelledby="zeitstrahl">
    <SectionHeader
      title="Zeitstrahl analog → digital"
      id="zeitstrahl"
      description="Die Meilensteine vom ersten Sprechfunk bis zum bundesweiten Digitalfunknetz."
    />
    <BosTimeline />
  </section>

  <ArticleSection section={section('analog')} />
  <ArticleSection section={section('digitalfunk')} />

  <section aria-labelledby="vergleich">
    <SectionHeader
      title="Vergleichstabelle"
      id="vergleich"
      description="Analoger BOS-Funk und TETRA-Digitalfunk Merkmal für Merkmal gegenübergestellt."
    />
    <BosComparisonTable />
  </section>

  <ArticleSection section={section('alarmierung')} />
  <ArticleSection section={section('recht')} />
</ArticleLayout>
