<script lang="ts">
  import {
    ALL_TRANSMITTERS,
    TYPE_NAMES,
    searchTransmitters,
    getTransmittersByType,
    type Transmitter,
    type TransmitterType,
    type TransmitterStatus
  } from '$lib/data/transmitters';
  import { formatFrequency, formatPowerWatts } from '$lib/utils/formatting';
  import { formatFrequencyRange } from '$lib/data/bands';

  interface Props {
    onSelectFrequency?: (hz: number) => void;
  }

  let { onSelectFrequency }: Props = $props();

  // State
  let searchQuery = $state('');
  let selectedType = $state<TransmitterType | 'all'>('all');
  let selectedTransmitter = $state<Transmitter | null>(null);
  let showOnlyActive = $state(false);

  // Type colors
  const typeColors: Record<TransmitterType, string> = {
    time_signal: '#3b82f6',
    broadcast_lw: '#ef4444',
    broadcast_mw: '#f97316',
    broadcast_sw: '#eab308',
    broadcast_fm: '#22c55e',
    navigation: '#06b6d4',
    amateur: '#ec4899',
    utility: '#6b7280'
  };

  // Status colors and labels
  const statusConfig: Record<TransmitterStatus, { color: string; label: string }> = {
    active: { color: 'text-green-600 dark:text-green-400', label: 'Aktiv' },
    inactive: { color: 'text-red-500 dark:text-red-400', label: 'Inaktiv' },
    unknown: { color: 'text-gray-500 dark:text-gray-400', label: 'Unbekannt' }
  };

  // Filtered transmitters
  let filteredTransmitters = $derived.by(() => {
    let result = ALL_TRANSMITTERS;

    // Filter by type
    if (selectedType !== 'all') {
      result = getTransmittersByType(selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = searchTransmitters(searchQuery).filter(t =>
        selectedType === 'all' || t.type === selectedType
      );
    }

    // Filter by status
    if (showOnlyActive) {
      result = result.filter(t => t.status === 'active');
    }

    // Sort by frequency
    return result.sort((a, b) => a.frequencyHz - b.frequencyHz);
  });

  // Get unique types for filter
  let availableTypes = $derived(
    [...new Set(ALL_TRANSMITTERS.map(t => t.type))] as TransmitterType[]
  );

  // Handle transmitter selection
  function handleTransmitterClick(transmitter: Transmitter) {
    selectedTransmitter = selectedTransmitter?.id === transmitter.id ? null : transmitter;
  }

  // Handle frequency selection callback
  function handleFrequencySelect(hz: number) {
    if (onSelectFrequency) {
      onSelectFrequency(hz);
    }
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Sender-Datenbank</h3>

  <!-- Search and Filters -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Search Input -->
    <div class="space-y-2">
      <label for="transmitter-search" class="text-label">Suche</label>
      <input
        id="transmitter-search"
        type="text"
        bind:value={searchQuery}
        class="input-field w-full"
        placeholder="Name, Standort, Land..."
      />
    </div>

    <!-- Type Filter -->
    <div class="space-y-2">
      <label for="transmitter-type" class="text-label">Typ</label>
      <select
        id="transmitter-type"
        bind:value={selectedType}
        class="select-field w-full"
      >
        <option value="all">Alle Typen ({ALL_TRANSMITTERS.length})</option>
        {#each availableTypes as type (type)}
          {@const count = ALL_TRANSMITTERS.filter(t => t.type === type).length}
          <option value={type}>{TYPE_NAMES[type].nameDE} ({count})</option>
        {/each}
      </select>
    </div>

    <!-- Status Filter -->
    <div class="space-y-2">
      <div class="text-label">Status</div>
      <label class="flex items-center gap-2 cursor-pointer mt-2">
        <input
          type="checkbox"
          bind:checked={showOnlyActive}
          class="checkbox"
        />
        <span class="text-secondary">Nur aktive Sender anzeigen</span>
      </label>
    </div>
  </div>

  <!-- Results Count -->
  <div class="mb-4 text-sm text-muted">
    {filteredTransmitters.length} Sender gefunden
  </div>

  <!-- Transmitter List -->
  <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
    {#each filteredTransmitters as transmitter (transmitter.id)}
      {@const isSelected = selectedTransmitter?.id === transmitter.id}
      <button
        type="button"
        onclick={() => handleTransmitterClick(transmitter)}
        class="w-full text-left p-3 rounded-lg transition-colors
               {isSelected
                 ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                 : 'bg-surface-secondary hover:bg-surface-tertiary'}"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full flex-shrink-0"
              style="background-color: {typeColors[transmitter.type]}"
            ></span>
            <div>
              <div class="font-medium text-primary">{transmitter.name}</div>
              <div class="text-xs text-muted">{transmitter.location.name}, {transmitter.location.country}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono text-sm text-secondary">
              {formatFrequency(transmitter.frequencyHz)}
            </div>
            <div class="text-xs {statusConfig[transmitter.status].color}">
              {statusConfig[transmitter.status].label}
            </div>
          </div>
        </div>
      </button>
    {/each}

    {#if filteredTransmitters.length === 0}
      <div class="p-8 text-center text-muted">
        Keine Sender gefunden
      </div>
    {/if}
  </div>

  <!-- Selected Transmitter Details -->
  {#if selectedTransmitter}
    <div class="mt-6 p-4 bg-surface-secondary rounded-lg">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h4 class="text-heading-4 flex items-center gap-2">
            <span
              class="w-4 h-4 rounded-full"
              style="background-color: {typeColors[selectedTransmitter.type]}"
            ></span>
            {selectedTransmitter.nameDE}
          </h4>
          <p class="text-secondary text-sm mt-1">
            {TYPE_NAMES[selectedTransmitter.type].nameDE}
          </p>
        </div>
        <button
          type="button"
          onclick={() => { selectedTransmitter = null; }}
          class="text-muted hover:text-primary"
          aria-label="Auswahl aufheben"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Frequency -->
        <div>
          <div class="text-label mb-1">Frequenz</div>
          <div class="text-lg font-mono font-bold text-blue-500 dark:text-blue-400">
            {formatFrequency(selectedTransmitter.frequencyHz)}
          </div>
          {#if selectedTransmitter.frequencyHzSecondary}
            <div class="text-sm text-muted mt-1">
              Sekundär: {formatFrequency(selectedTransmitter.frequencyHzSecondary)}
            </div>
          {/if}
          {#if onSelectFrequency}
            <button
              type="button"
              onclick={() => handleFrequencySelect(selectedTransmitter!.frequencyHz)}
              class="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Frequenz übernehmen
            </button>
          {/if}
        </div>

        <!-- Location -->
        <div>
          <div class="text-label mb-1">Standort</div>
          <div class="text-primary font-medium">
            {selectedTransmitter.location.name}
          </div>
          <div class="text-sm text-secondary">
            {selectedTransmitter.location.country}
          </div>
          {#if selectedTransmitter.location.latitude && selectedTransmitter.location.longitude}
            <div class="text-xs text-muted mt-1">
              {selectedTransmitter.location.latitude.toFixed(4)}N,
              {selectedTransmitter.location.longitude.toFixed(4)}E
            </div>
          {/if}
        </div>

        <!-- Power -->
        {#if selectedTransmitter.powerWatts}
          <div>
            <div class="text-label mb-1">Sendeleistung</div>
            <div class="text-primary font-medium">
              {formatPowerWatts(selectedTransmitter.powerWatts)}
            </div>
          </div>
        {/if}

        <!-- Coverage -->
        {#if selectedTransmitter.coverage}
          <div>
            <div class="text-label mb-1">Reichweite</div>
            <div class="text-primary">
              {selectedTransmitter.coverage}
            </div>
          </div>
        {/if}

        <!-- Operator -->
        {#if selectedTransmitter.operator}
          <div>
            <div class="text-label mb-1">Betreiber</div>
            <div class="text-primary">
              {selectedTransmitter.operator}
            </div>
          </div>
        {/if}

        <!-- Status -->
        <div>
          <div class="text-label mb-1">Status</div>
          <div class={statusConfig[selectedTransmitter.status].color}>
            {statusConfig[selectedTransmitter.status].label}
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="mt-4">
        <div class="text-label mb-1">Beschreibung</div>
        <p class="text-sm text-secondary">
          {selectedTransmitter.descriptionDE}
        </p>
      </div>

      <!-- Notes -->
      {#if selectedTransmitter.notes}
        <div class="mt-3 p-3 bg-surface-tertiary rounded text-sm text-muted">
          <strong>Hinweis:</strong> {selectedTransmitter.notes}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Info -->
  <div class="mt-4 text-xs text-muted">
    <strong>Hinweis:</strong> Diese Datenbank dient Bildungszwecken.
    Aktuelle Frequenzen und Parameter können abweichen.
    Datenbank enthaelt {ALL_TRANSMITTERS.length} Sender.
  </div>
</div>
