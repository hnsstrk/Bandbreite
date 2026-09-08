<script lang="ts">
  /**
   * Fachbegriff im Fließtext, der auf das Glossar verweist.
   *
   * Die Kurzdefinition kommt aus `$lib/data/glossary` und erscheint als
   * Titel-Hinweis; der Link führt auf den Anker des Begriffs. Unbekannte IDs
   * werden als reiner Text ausgegeben, damit nie ein toter Anker entsteht.
   */
  import { findGlossaryEntry } from '$lib/data/glossary';

  interface Props {
    /** Anker-ID des Begriffs, z. B. `dbm` */
    id: string;
    /** Abweichender Anzeigetext; sonst der Begriff selbst */
    label?: string;
    class?: string;
  }

  let { id, label, class: klass = '' }: Props = $props();

  const entry = $derived(findGlossaryEntry(id));
  const text = $derived(label ?? entry?.term ?? id);
</script>

{#if entry}
  <a class="glossary-term {klass}" href="/wissen/glossar/#{entry.id}" title={entry.short}>
    {text}
  </a>
{:else}
  <span class={klass}>{text}</span>
{/if}

<style>
  .glossary-term {
    color: inherit;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 0.2em;
    text-decoration-color: var(--color-ink-faint);
    cursor: help;
  }

  .glossary-term:hover {
    text-decoration-color: var(--color-brand);
  }
</style>
