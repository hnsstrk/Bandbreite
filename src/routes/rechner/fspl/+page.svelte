<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import FSPLCalculator from '$lib/components/calculators/FSPLCalculator.svelte';

  /**
   * Deep-Link aus der Command-Palette: `/rechner/fspl/?f=<Hertz>`.
   * Beim Prerendern gibt es keine Suchparameter — deshalb der browser-Guard.
   */
  const presetFrequencyHz = $derived.by(() => {
    if (!browser) return undefined;
    const raw = page.url.searchParams.get('f');
    const value = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(value) && value > 0 ? value : undefined;
  });
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">FSPL-Rechner</h1>
    <p class="header-description">
      Berechnen Sie die Freiraumdämpfung (Free Space Path Loss) für Funkstrecken.
      Die FSPL beschreibt den Signalverlust im freien Raum ohne Hindernisse.
    </p>
  </header>

  <section class="calculator-section">
    <FSPLCalculator frequencyHz={presetFrequencyHz} />
  </section>

  <RelatedTopics href="/rechner/fspl/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  .page-header {
    margin-bottom: 0;
  }

  .header-description {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
    line-height: var(--line-height-relaxed);
  }

  .calculator-section {
    width: 100%;
  }

</style>
