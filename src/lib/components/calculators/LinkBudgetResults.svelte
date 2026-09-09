<script lang="ts">
  /** Abschlussergebnisse der Streckenbilanz: Reserven und Tragfähigkeit. */
  import { formatPowerDb } from '$lib/utils/formatting';
  import Callout from '$lib/components/ui/Callout.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';

  interface Props {
    linkMarginDb: number;
    systemMarginDb: number;
    fadingMarginDb: number;
    linkViable: boolean;
  }

  let { linkMarginDb, systemMarginDb, fadingMarginDb, linkViable }: Props = $props();
</script>

<div class="lb-results">
  <ResultCard
    label="Streckenreserve"
    value={formatPowerDb(linkMarginDb, 1, true)}
    secondary="Pegel über der Empfindlichkeit"
    tone={linkMarginDb >= 0 ? 'success' : 'danger'}
    emphasis="hero"
  />
  <ResultCard
    label="Systemreserve"
    value={formatPowerDb(systemMarginDb, 1, true)}
    secondary={`nach ${formatPowerDb(fadingMarginDb)} Fading-Reserve`}
    tone={systemMarginDb >= 0 ? 'success' : 'danger'}
  />
</div>

{#if linkViable}
  <Callout tone="tip" title="Strecke trägt">
    Nach Abzug aller Verluste und der Fading-Reserve bleiben
    {formatPowerDb(systemMarginDb)} übrig.
  </Callout>
{:else}
  <Callout tone="warning" title="Strecke trägt nicht">
    Es fehlen {formatPowerDb(Math.abs(systemMarginDb))}. Abhilfe schaffen mehr Antennengewinn, eine kürzere Strecke,
    eine niedrigere Frequenz oder ein empfindlicherer Empfänger — jede Verdopplung des Antennengewinns bringt 3 dB.
  </Callout>
{/if}

<style>
  .lb-results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 0.75rem;
  }
</style>
