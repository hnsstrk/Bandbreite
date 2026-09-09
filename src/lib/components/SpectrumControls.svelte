<script lang="ts">
  /**
   * Bedienleiste des Spektrums — wählt nach gemessener Containerbreite
   * zwischen voller (`SpectrumControlsFull`) und schmaler Fassung
   * (`SpectrumControlsCompact`). Die Schwelle kommt aus `spectrumLayout.ts`,
   * damit CSS-Leiste und SVG-Geometrie dieselbe Breite als Grenze nutzen.
   */
  import SpectrumControlsFull from './SpectrumControlsFull.svelte';
  import SpectrumControlsCompact from './SpectrumControlsCompact.svelte';
  import type { SpectrumControlsProps } from './spectrumControlsData';

  interface Props extends SpectrumControlsProps {
    /** true in schmalen Containern (< `COMPACT_MAX_WIDTH_PX`). */
    compact?: boolean;
  }

  let { compact = false, ...controls }: Props = $props();
</script>

{#if compact}
  <SpectrumControlsCompact {...controls} />
{:else}
  <SpectrumControlsFull {...controls} />
{/if}
