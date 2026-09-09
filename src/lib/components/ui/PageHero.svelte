<script lang="ts">
  /**
   * Seitenkopf im Datenblatt-Stil: `h1` (1,5 rem, semibold) und höchstens
   * eine Zeile Einleitung. Icon-Kachel, Kicker, Etikett und Aktionen werden
   * bewusst **nicht** gerendert — die Props bleiben aus Kompatibilität
   * erhalten und laufen wirkungslos mit. `meta` erscheint als eine kleine
   * Textzeile („Quelle: … · Gültig: …"), nicht mehr als Chip-Reihe.
   *
   * Enthält kein Breadcrumb — die Brotkrumennavigation liegt im Layout.
   */
  import type { Snippet } from 'svelte';
  import type { IconName } from './icons';

  interface Props {
    title: string;
    /** Einleitungssatz unter dem Titel */
    lead?: string;
    /** Ohne Wirkung — bleibt für bestehende Aufrufe erhalten */
    kicker?: string;
    /** Ohne Wirkung — bleibt für bestehende Aufrufe erhalten */
    badge?: string;
    /** Ohne Wirkung — bleibt für bestehende Aufrufe erhalten */
    badgeTone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
    /** Ohne Wirkung — bleibt für bestehende Aufrufe erhalten */
    icon?: IconName;
    /** Kurzangaben; erscheinen als eine Textzeile unter der Einleitung */
    meta?: { label: string; value: string }[];
    /** Ohne Wirkung — Aktionen gehören in den Seiteninhalt */
    children?: Snippet;
    class?: string;
  }

  // `kicker`, `badge`, `badgeTone`, `icon` und `children` bleiben aus
  // Kompatibilität in der Props-Schnittstelle, werden aber nicht mehr
  // gerendert — der Datenblatt-Kopf zeigt nur Titel, Lead und Meta-Zeile.
  // eslint-disable-next-line svelte/no-unused-props -- absichtlich wirkungslos
  let { title, lead, meta = [], class: klass = '' }: Props = $props();

  const metaLine = $derived(meta.map((entry) => `${entry.label}: ${entry.value}`).join(' · '));
</script>

<header class="ui-hero {klass}">
  <h1 class="ui-hero__title">{title}</h1>
  {#if lead}
    <p class="ui-hero__lead">{lead}</p>
  {/if}
  {#if metaLine}
    <p class="ui-hero__meta">{metaLine}</p>
  {/if}
</header>

<style>
  .ui-hero {
    padding-block: 0.25rem 0;
    margin-bottom: 0.75rem;
  }

  .ui-hero__title {
    margin: 0;
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-ink);
  }

  .ui-hero__lead {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }

  .ui-hero__meta {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
