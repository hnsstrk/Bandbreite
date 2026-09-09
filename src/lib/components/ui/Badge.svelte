<script lang="ts">
  /**
   * Kompaktes Status- oder Stichwort-Etikett.
   *
   * Die Farbpaarungen nutzen `--color-*-soft` als Fläche und
   * `--color-*-ink` als Schrift; jede Kombination liegt über 8:1.
   */
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  interface Props {
    tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
    variant?: 'soft' | 'solid' | 'outline';
    size?: 'sm' | 'md';
    /** Statuspunkt vor dem Text */
    dot?: boolean;
    icon?: IconName;
    /** Zusätzliche, nur vorgelesene Erläuterung des Status */
    srPrefix?: string;
    children: Snippet;
    class?: string;
  }

  let {
    tone = 'neutral',
    variant = 'soft',
    size = 'sm',
    dot = false,
    icon,
    srPrefix,
    children,
    class: klass = ''
  }: Props = $props();
</script>

<span class="ui-badge ui-badge--{tone} ui-badge--{variant} ui-badge--{size} {klass}">
  {#if srPrefix}<span class="sr-only">{srPrefix}: </span>{/if}
  {#if dot}<span class="ui-badge__dot" aria-hidden="true"></span>{/if}
  {#if icon}<Icon name={icon} size={size === 'sm' ? 12 : 14} />{/if}
  {@render children()}
</span>

<style>
  /* Datenblatt-Etikett: 1-px-Rahmen, keine Farbfläche.
     Die Semantik trägt allein die Textfarbe; `variant` (soft/solid/outline)
     bleibt als Prop gültig, sieht aber überall gleich aus. */
  .ui-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    background-color: transparent;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
    color: var(--color-ink-muted);
    font-weight: var(--font-weight-normal);
    line-height: 1.4;
    white-space: nowrap;
  }

  .ui-badge--sm {
    padding: 0 0.3125rem;
    font-size: var(--font-size-xs);
  }

  .ui-badge--md {
    padding: 0.0625rem 0.375rem;
    font-size: var(--font-size-sm);
  }

  .ui-badge__dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: var(--radius-pill);
    background-color: currentColor;
  }

  /* Semantik ausschließlich über die Textfarbe. */
  .ui-badge--brand {
    color: var(--color-brand);
  }
  .ui-badge--success {
    color: var(--color-success-ink);
  }
  .ui-badge--warning {
    color: var(--color-warning-ink);
  }
  .ui-badge--danger {
    color: var(--color-danger-ink);
  }
  .ui-badge--info {
    color: var(--color-info-ink);
  }
</style>
