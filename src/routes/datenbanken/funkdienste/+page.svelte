<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import ApplicationDatabase from '$lib/components/funk/ApplicationDatabase.svelte';
  import { ALL_APPLICATIONS } from '$lib/data/applications';
  import { categoryCounts } from '$lib/components/funk/applicationFilter.svelte';

  const categories = categoryCounts();

  /**
   * `?q=<Begriff oder ID>` aus der Befehlspalette belegt die Volltextsuche
   * vor und öffnet bei einer bekannten ID gleich die Detailtafel. Beim
   * Prerendern sind Suchparameter gesperrt, deshalb der `browser`-Zweig.
   */
  let deepLinkQuery = $derived(browser ? (page.url.searchParams.get('q') ?? '').trim().slice(0, 100) : '');
  let deepLinkId = $derived(ALL_APPLICATIONS.some((app) => app.id === deepLinkQuery) ? deepLinkQuery : null);
</script>

<PageHero
  title="Funkdienste"
  icon="database"
  lead="Alle erfassten Frequenzzuweisungen — durchsuchbar, filterbar und mit Bandzuordnung nach ITU und IEEE."
  meta={[
    { label: 'Einträge', value: String(ALL_APPLICATIONS.length) },
    { label: 'Kategorien', value: String(categories.length) },
    { label: 'Schwerpunkt', value: 'Europa und Deutschland' }
  ]}
/>

<div class="page">
  <p class="intro">
    Ein Klick auf eine Zeile öffnet die Detailtafel. Die Systematik hinter den Zuweisungen erklärt das Kapitel
    <a href="/wissen/funktechnik/funkdienste/">Funkdienste &amp; Frequenzplan</a>.
  </p>

  <!-- Der Schlüssel setzt die Datenbank neu auf, wenn dieselbe Route mit
	     einem anderen Suchbegriff angesteuert wird. -->
  {#key deepLinkQuery}
    <ApplicationDatabase initialQuery={deepLinkQuery} initialSelectedId={deepLinkId} />
  {/key}

  <Callout tone="warning" title="Stand und Verbindlichkeit">
    Orientierungswerte für Europa und Deutschland. Verbindlich sind der Frequenzplan der Bundesnetzagentur und die
    Vollzugsordnung für den Funkdienst; Herkunft und Stand unter <a href="/service/quellen/">Quellen &amp; Stand</a>.
  </Callout>

  <RelatedTopics href="/datenbanken/funkdienste/" />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .intro {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }

  .intro a {
    color: var(--color-brand);
  }
</style>
