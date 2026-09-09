<script lang="ts">
  /**
   * Rendert einen einzelnen Inhaltsblock eines Wissen-Kapitels.
   * Textblöcke bleiben in der Lesebreite (`.prose`), Widgets brechen
   * über `.article-wide` auf die volle Spaltenbreite aus.
   */
  import { untrack } from 'svelte';
  import { page } from '$app/state';
  import type { ArticleBlock } from '$lib/content/types';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import ArticleTable from './ArticleTable.svelte';
  import ArticleCards from './ArticleCards.svelte';
  import { WIDGETS } from './widgetRegistry';
  import { parseWidgetParam, widgetAnchorId } from '$lib/data/widgets';
  import { setWidgetId } from './widgetContext';

  interface Props {
    block: ArticleBlock;
    /** Überschriftenebene des umgebenden Abschnitts */
    level: 2 | 3;
  }

  let { block, level }: Props = $props();
  const childLevel = $derived((level + 1) as 3 | 4);

  // Der Rahmen im Inneren (`WidgetFrame`) kennt seine Kennung sonst nicht;
  // darüber blendet er den Knopf „Link zum Widget kopieren“ ein. Der Blocktyp
  // eines Bausteins wechselt nicht — der Kontext wird einmal gesetzt.
  untrack(() => {
    if (block.type === 'widget') setWidgetId(block.id);
  });

  /** Wie lange der Rahmen nach einem Sprung über `?w=` aufleuchtet (ms). */
  const HIGHLIGHT_MS = 2500;

  let linked = $state(false);

  // Deep-Link `?w=<id>`: dieses Widget kurz hervorheben. Gescrollt und
  // fokussiert wird in `ArticleLayout`, das den Artikel als Ganzes kennt.
  $effect(() => {
    if (block.type !== 'widget') return;
    if (parseWidgetParam(page.url.searchParams) !== block.id) return;
    linked = true;
    const timer = setTimeout(() => (linked = false), HIGHLIGHT_MS);
    return () => {
      clearTimeout(timer);
      linked = false;
    };
  });
</script>

{#if block.type === 'paragraph'}
  <p class="prose">{@html block.html}</p>
{:else if block.type === 'list'}
  {#if block.ordered}
    <ol class="prose">
      {#each block.items as item, i (i)}<li>{@html item}</li>{/each}
    </ol>
  {:else}
    <ul class="prose">
      {#each block.items as item, i (i)}<li>{@html item}</li>{/each}
    </ul>
  {/if}
{:else if block.type === 'formula'}
  <FormulaBlock
    formula={block.formula}
    alt={block.alt}
    label={block.label}
    number={block.number}
    variables={block.variables}
    class="prose"
  />
{:else if block.type === 'callout'}
  <Callout tone={block.tone} title={block.title} source={block.source} class="prose">
    {@html block.html}
  </Callout>
{:else if block.type === 'table'}
  <ArticleTable {block} />
{:else if block.type === 'definitions'}
  <dl class="prose definitions definitions--{block.variant ?? 'symbol'}">
    {#each block.items as item (item.term)}
      <div class="definition">
        <dt>{@html item.term}</dt>
        <dd>{@html item.description}</dd>
      </div>
    {/each}
  </dl>
{:else if block.type === 'cards'}
  <ArticleCards {block} level={childLevel} />
{:else if block.type === 'widget'}
  {@const Widget = WIDGETS[block.id]}
  <!-- Sprungziel des Deep-Links `?w=<id>`; `ArticleLayout` scrollt hierher,
	     setzt den Fokus und hebt den Rahmen kurz hervor. -->
  <div
    class="article-wide"
    class:article-wide--linked={linked}
    id={widgetAnchorId(block.id)}
    data-widget={block.id}
    tabindex="-1"
  >
    <Widget />
  </div>
{:else if block.type === 'question'}
  <details class="question prose">
    <summary class="question__summary">Verständnisfrage: {@html block.question}</summary>
    <p class="question__answer">{@html block.answer}</p>
  </details>
{/if}

<style>
  .definitions {
    display: grid;
    gap: 0.25rem;
    margin: 0.75rem 0;
  }

  .definition {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.25rem 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .definition dt {
    font-family: var(--font-mono);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  /* Ausgeschriebene Fachbegriffe stehen im Fließtextschnitt und brauchen
	   mehr Platz als kurze Formelzeichen. */
  .definitions--term .definition dt {
    font-family: inherit;
  }

  @media (min-width: 40rem) {
    .definitions--symbol .definition {
      grid-template-columns: 8rem minmax(0, 1fr);
    }

    .definitions--term .definition {
      grid-template-columns: minmax(8rem, 14rem) minmax(0, 1fr);
    }
  }

  .definition dd {
    margin: 0;
    color: var(--color-ink-muted);
  }

  .question {
    margin: 0.75rem 0;
    padding: 0.25rem 0 0.25rem 0.75rem;
    border: 0;
    border-left: 2px solid var(--color-brand);
    border-radius: 0;
    background-color: transparent;
  }

  .question__summary {
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .question__answer {
    margin: 0.625rem 0 0;
  }

  .article-wide {
    width: 100%;
    max-width: none;
    scroll-margin-top: 3.5rem;
    border-radius: var(--radius-card);
  }

  /* Kurzes Aufleuchten nach einem Sprung über `?w=<id>`; der Tastaturfokus
	   bekommt denselben Ring. */
  .article-wide--linked,
  .article-wide:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 4px;
  }
</style>
