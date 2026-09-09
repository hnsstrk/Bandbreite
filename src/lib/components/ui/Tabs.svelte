<script lang="ts">
  /**
   * Reiter nach dem WAI-ARIA-Tabs-Muster.
   *
   * Roving Tabindex: nur der aktive Reiter ist per Tabulator erreichbar,
   * innerhalb der Leiste wird mit den Pfeiltasten sowie Pos1/Ende
   * navigiert. Der Panel-Snippet erhält die aktive ID.
   */
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  export interface TabItem {
    id: string;
    label: string;
    icon?: IconName;
    badge?: string;
    disabled?: boolean;
  }

  interface Props {
    tabs: TabItem[];
    /** ID des aktiven Reiters */
    active: string;
    variant?: 'underline' | 'pill';
    /** Beschriftung der Reiterleiste für Screenreader */
    label?: string;
    /** Panelinhalt; erhält die aktive Reiter-ID */
    panel: Snippet<[string]>;
    class?: string;
  }

  let {
    tabs,
    active = $bindable(),
    variant = 'underline',
    label = 'Bereiche',
    panel,
    class: klass = ''
  }: Props = $props();

  const uid = $props.id();
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  const buttons: HTMLButtonElement[] = $state([]);

  const enabled = $derived(tabs.filter((tab) => !tab.disabled));

  function focusTab(id: string) {
    active = id;
    const index = tabs.findIndex((tab) => tab.id === id);
    buttons[index]?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((tab) => tab.id === active);
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabled.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusTab(enabled[nextIndex].id);
  }
</script>

<div class="ui-tabs ui-tabs--{variant} {klass}">
  <div class="ui-tabs__list" role="tablist" aria-label={label}>
    {#each tabs as tab, index (tab.id)}
      <button
        bind:this={buttons[index]}
        type="button"
        role="tab"
        id={tabId(tab.id)}
        class="ui-tabs__tab"
        aria-selected={active === tab.id}
        aria-controls={panelId(tab.id)}
        tabindex={active === tab.id ? 0 : -1}
        disabled={tab.disabled}
        onclick={() => (active = tab.id)}
        onkeydown={handleKeydown}
      >
        {#if tab.icon}<Icon name={tab.icon} size={16} />{/if}
        {tab.label}
        {#if tab.badge}<span class="ui-tabs__badge">{tab.badge}</span>{/if}
      </button>
    {/each}
  </div>

  {#each tabs as tab (tab.id)}
    {#if active === tab.id}
      <div role="tabpanel" id={panelId(tab.id)} aria-labelledby={tabId(tab.id)} tabindex="0" class="ui-tabs__panel">
        {@render panel(tab.id)}
      </div>
    {/if}
  {/each}
</div>

<style>
  .ui-tabs {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ui-tabs__list {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  /* Beide Varianten sehen gleich aus: Unterstrich. `pill` bleibt als Prop
     gültig, rendert aber keine Pillen mehr. */
  .ui-tabs__list {
    border-bottom: 1px solid var(--color-line);
  }

  .ui-tabs__tab {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    flex: none;
    min-height: 2rem;
    padding: 0.25rem 0.625rem;
    background: none;
    border: 0;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font-family: inherit;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink-subtle);
    cursor: pointer;
    white-space: nowrap;
    transition:
      color var(--transition-fast),
      background-color var(--transition-fast),
      border-color var(--transition-fast);
  }

  .ui-tabs__tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ui-tabs__tab:hover:not(:disabled) {
    color: var(--color-ink);
  }

  .ui-tabs__tab[aria-selected='true'] {
    color: var(--color-brand);
    border-bottom-color: var(--color-brand);
  }

  .ui-tabs__badge {
    font-size: var(--text-2xs);
    color: var(--color-ink-faint);
    font-variant-numeric: tabular-nums;
  }

  .ui-tabs__panel {
    padding-top: 0.75rem;
    min-width: 0;
  }
</style>
