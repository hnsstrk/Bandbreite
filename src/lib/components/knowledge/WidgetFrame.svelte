<script lang="ts">
  /**
   * Gemeinsamer Rahmen der interaktiven Wissen-Widgets:
   * Titel, optionaler Play/Pause-Button, Bühne (SVG) mit `role="img"`,
   * sr-only-Wertetabelle, Bedienelemente und Ergebniskarten.
   */
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import Button from '$lib/components/ui/Button.svelte';
  import { WIDGET_PARAM } from '$lib/data/widgets';
  import { copyToClipboard } from '$lib/utils/urlState.svelte';
  import { getWidgetId } from './widgetContext';

  interface Props {
    title: string;
    /** Beschreibung der Grafik (wird `aria-label` der Bühne) */
    description: string;
    level?: 3 | 4;
    /** Play/Pause anzeigen */
    playable?: boolean;
    playing?: boolean;
    /** Hinweis, wenn die Systemeinstellung Bewegung reduziert */
    reducedMotion?: boolean;
    ontoggle?: () => void;
    controls?: Snippet;
    results?: Snippet;
    /** Nur für Screenreader: Tabelle der aktuellen Werte */
    dataTable?: Snippet;
    footnote?: string;
    /** Bühne oben, Regler darunter (statt nebeneinander) */
    stacked?: boolean;
    /** Bühne enthält selbst bedienbare Elemente → kein role="img" */
    interactive?: boolean;
    children: Snippet;
    class?: string;
  }

  let {
    title,
    description,
    level = 3,
    playable = false,
    playing = true,
    reducedMotion = false,
    ontoggle,
    controls,
    results,
    dataTable,
    footnote,
    stacked = false,
    interactive = false,
    children,
    class: klass = ''
  }: Props = $props();

  const headingId = $props.id();
  const tableId = $derived(`${headingId}-werte`);

  /** Kennung aus dem umgebenden Kapitelblock; außerhalb eines Kapitels leer. */
  const widgetId = getWidgetId();

  /** Wie lange die Rückmeldung „Link kopiert" stehen bleibt (ms). */
  const FEEDBACK_MS = 2000;

  let copyState = $state<'idle' | 'copied' | 'failed'>('idle');
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function handleCopyClick() {
    if (!widgetId) return;
    const target = new URL(page.url.href);
    target.hash = '';
    target.searchParams.set(WIDGET_PARAM, widgetId);
    const ok = await copyToClipboard(target.toString());
    copyState = ok ? 'copied' : 'failed';
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copyState = 'idle'), FEEDBACK_MS);
  }
</script>

<section class="widget {stacked ? 'widget--stacked' : ''} {klass}" aria-labelledby={headingId}>
  <header class="widget__head">
    <svelte:element this={`h${level}`} id={headingId} class="widget__title">{title}</svelte:element>
    <div class="widget__actions">
      {#if playable}
        <Button
          size="sm"
          variant="ghost"
          icon={playing ? 'pause' : 'play'}
          pressed={!playing}
          onclick={ontoggle}
          title={reducedMotion ? 'Animation ist durch die Systemeinstellung reduziert' : undefined}
        >
          {playing ? 'Pause' : 'Abspielen'}
        </Button>
      {/if}
      {#if widgetId}
        <Button
          size="sm"
          variant="ghost"
          icon="share"
          iconOnly
          label="Link zum Widget kopieren"
          title="Link zum Widget kopieren"
          onclick={handleCopyClick}
        />
      {/if}
    </div>
  </header>

  {#if widgetId}
    <p class="sr-only" role="status" aria-live="polite">
      {#if copyState === 'copied'}Link kopiert{:else if copyState === 'failed'}Kopieren nicht möglich{/if}
    </p>
  {/if}

  <div class="widget__grid">
    <div class="widget__stage">
      {#if interactive}
        <p class="sr-only">{description}</p>
        <div class="widget__figure">
          {@render children()}
        </div>
      {:else}
        <div
          class="widget__figure"
          role="img"
          aria-label={description}
          aria-describedby={dataTable ? tableId : undefined}
        >
          {@render children()}
        </div>
      {/if}
      {#if dataTable}
        <div class="sr-only" id={tableId}>
          {@render dataTable()}
        </div>
      {/if}
    </div>
    {#if controls || results}
      <div class="widget__side">
        {#if controls}
          <div class="widget__controls">{@render controls()}</div>
        {/if}
        {#if results}
          <div class="widget__results">{@render results()}</div>
        {/if}
      </div>
    {/if}
  </div>

  {#if footnote}
    <p class="widget__footnote">{footnote}</p>
  {/if}
</section>

<style>
  /* Keine äußere Karte: der Rahmen sitzt allein um die Bühne. */
  .widget {
    margin: 0.75rem 0;
    padding: 0;
    border: 0;
    background-color: transparent;
    box-shadow: none;
  }

  .widget__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .widget__actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  /* Titel als kleine Caption über der Bühne. */
  .widget__title {
    margin: 0;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink-subtle);
  }

  .widget__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }

  @media (min-width: 900px) {
    .widget:not(.widget--stacked) .widget__grid {
      grid-template-columns: minmax(0, 3fr) minmax(16rem, 2fr);
    }
  }

  .widget__figure {
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: var(--color-surface);
    overflow: hidden;
  }

  .widget__figure :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }

  .widget__side {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  .widget__controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .widget__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 0.375rem;
  }

  .widget__footnote {
    margin: 0.375rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
