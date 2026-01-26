<script lang="ts">
  import { ITU_BANDS, type PropagationMode } from '$lib/data/bands';
  import InfoTooltip from './InfoTooltip.svelte';

  interface Props {
    frequencyHz: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }

  let { frequencyHz, showLabel = true, size = 'md' }: Props = $props();

  /**
   * Propagation mode configuration with display properties
   */
  const PROPAGATION_CONFIG: Record<PropagationMode, {
    label: string;
    labelDE: string;
    color: string;
    bgColor: string;
    icon: string;
    description: string;
    descriptionDE: string;
  }> = {
    groundWave: {
      label: 'Ground Wave',
      labelDE: 'Bodenwelle',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: 'M3 15h18M3 15c0 3.5 4 6 9 6s9-2.5 9-6',
      description: 'Radio waves follow Earth\'s curvature. Range: hundreds to thousands of km.',
      descriptionDE: 'Radiowellen folgen der Erdkruemmung. Reichweite: Hunderte bis Tausende km.'
    },
    skyWave: {
      label: 'Sky Wave',
      labelDE: 'Raumwelle',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'M3 18l6-6 4 4 8-8M21 6v4h-4',
      description: 'Radio waves reflect off ionosphere. Enables worldwide communication.',
      descriptionDE: 'Radiowellen werden an der Ionosphäre reflektiert. Weltweite Kommunikation möglich.'
    },
    lineOfSight: {
      label: 'Line of Sight',
      labelDE: 'Sichtlinie',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      icon: 'M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4',
      description: 'Direct path between transmitter and receiver. Limited by horizon.',
      descriptionDE: 'Direkter Pfad zwischen Sender und Empfänger. Durch Horizont begrenzt.'
    },
    mixed: {
      label: 'Mixed',
      labelDE: 'Gemischt',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'M12 4v4m0 4v4m0 4v4M8 8l4 4-4 4M16 8l-4 4 4 4',
      description: 'Combination of propagation modes. Day/night variations.',
      descriptionDE: 'Kombination verschiedener Ausbreitungsarten. Tag/Nacht-Variationen.'
    }
  };

  /**
   * Determine propagation mode based on frequency
   */
  function getPropagationMode(freqHz: number): PropagationMode | null {
    if (!Number.isFinite(freqHz) || freqHz <= 0) {
      return null;
    }

    // Find matching ITU band
    const matchingBand = ITU_BANDS.find(
      band => freqHz >= band.minHz && freqHz <= band.maxHz
    );

    if (matchingBand) {
      return matchingBand.propagation;
    }

    // Fallback based on frequency ranges if no exact band match
    if (freqHz < 3e6) return 'groundWave';      // Below 3 MHz
    if (freqHz < 30e6) return 'skyWave';         // 3-30 MHz (HF)
    return 'lineOfSight';                         // Above 30 MHz
  }

  /**
   * Get the ITU band name for the frequency
   */
  function getItuBandName(freqHz: number): string | null {
    if (!Number.isFinite(freqHz) || freqHz <= 0) {
      return null;
    }

    const matchingBand = ITU_BANDS.find(
      band => freqHz >= band.minHz && freqHz <= band.maxHz
    );

    return matchingBand?.name ?? null;
  }

  // Derived values
  let propagationMode = $derived(getPropagationMode(frequencyHz));
  let config = $derived(propagationMode ? PROPAGATION_CONFIG[propagationMode] : null);
  let ituBand = $derived(getItuBandName(frequencyHz));

  // Size classes
  let sizeClasses = $derived({
    sm: { container: 'px-2 py-1 text-xs', icon: 'w-3 h-3', gap: 'gap-1' },
    md: { container: 'px-3 py-1.5 text-sm', icon: 'w-4 h-4', gap: 'gap-1.5' },
    lg: { container: 'px-4 py-2 text-base', icon: 'w-5 h-5', gap: 'gap-2' }
  }[size]);
</script>

{#if config && propagationMode}
  <div
    class="inline-flex items-center {sizeClasses.gap} {sizeClasses.container} {config.bgColor} rounded-lg font-medium"
    role="status"
    aria-label="Ausbreitungsart: {config.labelDE}"
  >
    <!-- Propagation Icon -->
    <svg
      class="{sizeClasses.icon} {config.color}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={config.icon} />
    </svg>

    {#if showLabel}
      <span class={config.color}>
        {config.labelDE}
      </span>
    {/if}

    <!-- Info Tooltip -->
    <InfoTooltip
      title="{config.labelDE} ({config.label})"
      short={config.descriptionDE}
      detailed="ITU-Band: {ituBand ?? 'Unbekannt'}. {config.description}"
    />
  </div>
{:else}
  <div
    class="inline-flex items-center {sizeClasses.gap} {sizeClasses.container} bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400"
    role="status"
    aria-label="Keine Ausbreitungsinformation verfügbar"
  >
    <svg
      class="{sizeClasses.icon}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
    {#if showLabel}
      <span>Unbekannt</span>
    {/if}
  </div>
{/if}
