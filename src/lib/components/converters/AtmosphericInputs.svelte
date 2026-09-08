<script lang="ts">
  /**
   * Eingaben für die atmosphärische Dämpfung, in zwei Reitern:
   * Grundgrößen (ITU-R P.676) und Niederschlag (P.838/P.840).
   *
   * Die Felder schreiben direkt in den gemeinsamen Store
   * `atmosphericParameters`; alle sichtbaren Diagramme folgen sofort.
   */
  import Card from '$lib/components/ui/Card.svelte';
  import Tabs from '$lib/components/ui/Tabs.svelte';
  import AtmosphericTab from './AtmosphericTab.svelte';
  import PrecipitationTab from './PrecipitationTab.svelte';
  import { ATMOSPHERIC_TABS } from './atmosphericInputs.svelte';

  let activeTab = $state('atmospheric');
</script>

<Card title="Atmosphärische Bedingungen" icon="sliders" padding="md">
  <Tabs tabs={ATMOSPHERIC_TABS} bind:active={activeTab} label="Parametergruppen">
    {#snippet panel(id)}
      {#if id === 'atmospheric'}
        <AtmosphericTab />
      {:else if id === 'precipitation'}
        <PrecipitationTab />
      {/if}
    {/snippet}
  </Tabs>
</Card>
