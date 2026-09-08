<script lang="ts">
  /**
   * Chip-Gruppe für Voreinstellungen mit eindeutigem Aktiv-Zustand.
   *
   * Anders als die Presets in `NumberInput` vergleicht diese Gruppe **IDs**,
   * nicht Zahlenwerte. Zwei Chips mit demselben Wert (etwa „PKW" und
   * „Verkehrsflugzeug" mit je 100 m²) leuchten deshalb nie gleichzeitig.
   */
  import Button from '$lib/components/ui/Button.svelte';
  import { activePresetId, type PresetChip } from './presetChips.svelte';

  interface Props {
    /** Beschriftung der Gruppe für Screenreader */
    label: string;
    presets: PresetChip[];
    /** Aktueller Wert in der Basiseinheit */
    value: number;
    /** Zuletzt bewusst gewählte Preset-ID */
    chosenId?: string | null;
    onselect: (preset: PresetChip) => void;
    class?: string;
  }

  let { label, presets, value, chosenId = null, onselect, class: klass = '' }: Props = $props();

  let activeId = $derived(activePresetId(presets, value, chosenId));
</script>

<div class="preset-chips {klass}" role="group" aria-label={label}>
  {#each presets as preset (preset.id)}
    <Button
      size="sm"
      variant={activeId === preset.id ? 'primary' : 'ghost'}
      pressed={activeId === preset.id}
      title={preset.hint}
      onclick={() => onselect(preset)}
    >
      {preset.label}
    </Button>
  {/each}
</div>

<style>
  .preset-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
</style>
