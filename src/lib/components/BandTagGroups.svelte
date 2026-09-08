<script lang="ts">
  /**
   * Bandkennungen der Randspalte, nach Systematik gruppiert (ITU, IEEE, NATO,
   * zivil). Die Farbe stammt aus dem Datensatz des Bandes.
   */
  import type { FrequencyBand } from '$lib/data/bands';

  interface Props {
    itu: FrequencyBand[];
    ieee: FrequencyBand[];
    nato: FrequencyBand[];
    civilian: FrequencyBand[];
  }

  let { itu, ieee, nato, civilian }: Props = $props();

  const groups = $derived([
    { label: 'ITU', bands: itu, german: false },
    { label: 'IEEE', bands: ieee, german: false },
    { label: 'NATO', bands: nato, german: false },
    { label: 'Zivil', bands: civilian, german: true }
  ]);
</script>

<div class="band-tags-container">
  {#each groups as group (group.label)}
    {#if group.bands.length > 0}
      <div class="tag-group">
        <span class="tag-label">{group.label}</span>
        {#each group.bands as band (band.id)}
          <span class="band-tag" style="background-color: {band.color}">
            {group.german ? band.nameDE : band.name}
          </span>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style>
  .band-tags-container {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .tag-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tag-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-disabled);
    min-width: 2.5rem;
  }

  .band-tag {
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: white;
    box-shadow: var(--shadow-sm);
  }
</style>
