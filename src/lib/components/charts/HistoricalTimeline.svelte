<script lang="ts">
  /**
   * Zeitstrahl der Funkgeschichte: alle Meilensteine aus `data/history.ts`
   * über der Jahresachse, filterbar nach Kategorie und Bedeutung.
   *
   * Achsen-, Layout- und Farbberechnung liegen in `timelineData.ts`.
   */
  import { scaleLinear } from 'd3';
  import { CATEGORY_CONFIG, HISTORICAL_EVENTS, type HistoryCategory } from '$lib/data/history';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import ChartFrame from './ChartFrame.svelte';
  import TimelineEventDetails from './TimelineEventDetails.svelte';
  import {
    ALL_CATEGORIES,
    CATEGORY_ENTRIES,
    CATEGORY_TOKENS,
    ERAS,
    MAX_YEAR,
    MIN_YEAR,
    ROW_HEIGHT,
    SIGNIFICANCE_LABELS,
    decadeTicks,
    filterEvents,
    placeEvents,
    shortTitle
  } from './timelineData';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = $bindable(1100), height = 600 }: Props = $props();

  const margin = { top: 60, right: 40, bottom: 60, left: 60 } as const;

  /** Radius der Ereignismarken. */
  const MARKER_RADIUS_MAJOR = 8;
  const MARKER_RADIUS_MINOR = 5;
  /** Höhe, die unterhalb der Zeilen für die Achse frei bleibt. */
  const AXIS_SPACE = 60;

  /** Startzustand: alle Kategorien sichtbar — auch Telegrafie und Navigation. */
  let selectedCategories = $state<Set<HistoryCategory>>(new Set(ALL_CATEGORIES));
  let selectedId = $state<string | null>(null);
  let showOnlyMajor = $state(false);

  let ticks = decadeTicks();

  let filteredEvents = $derived(filterEvents(selectedCategories, showOnlyMajor));

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(ROW_HEIGHT, height - margin.top - margin.bottom - AXIS_SPACE));
  let svgHeight = $derived(chartHeight + margin.top + margin.bottom + AXIS_SPACE);

  let xScale = $derived(scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, chartWidth]));

  let placed = $derived(placeEvents(filteredEvents, xScale, chartHeight));

  function handleCategoryClick(category: HistoryCategory) {
    const next = new Set(selectedCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    selectedCategories = next;
    selectedId = null;
  }

  function handleAllCategoriesClick() {
    selectedCategories = new Set(ALL_CATEGORIES);
    selectedId = null;
  }

  function handleMajorClick() {
    showOnlyMajor = !showOnlyMajor;
    selectedId = null;
  }

</script>

<Card title="Zeitstrahl der Funktechnik" subtitle="{HISTORICAL_EVENTS.length} Meilensteine" icon="clock">
  {#snippet actions()}
    <Button size="sm" variant="ghost" icon="reset" onclick={handleAllCategoriesClick}>
      Alle Kategorien
    </Button>
  {/snippet}

  <div class="timeline">
    <div class="timeline__filters" role="group" aria-label="Kategorien">
      {#each CATEGORY_ENTRIES as entry (entry.id)}
        {@const active = selectedCategories.has(entry.id)}
        <Button
          size="sm"
          variant={active ? 'primary' : 'ghost'}
          pressed={active}
          onclick={() => handleCategoryClick(entry.id)}
        >
          {entry.label} ({entry.count})
        </Button>
      {/each}
      <Button
        size="sm"
        variant={showOnlyMajor ? 'primary' : 'ghost'}
        pressed={showOnlyMajor}
        icon="filter"
        onclick={handleMajorClick}
      >
        Nur Meilensteine
      </Button>
    </div>

    <ChartFrame
      bind:width
      description="Zeitstrahl der Funktechnik von 1860 bis 2030 mit den Meilensteinen aus Theorie, Erfindungen, Rundfunk, Mobilfunk, Satellit, Digitaltechnik, Telegrafie und Navigation"
      minWidth={640}
    >
      {#snippet legend()}
        <ul class="timeline__legend">
          {#each CATEGORY_ENTRIES as entry (entry.id)}
            <li class="timeline__legend-item">
              <span class="timeline__swatch" style="background: {entry.token}" aria-hidden="true"
              ></span>
              <span>{entry.label}</span>
            </li>
          {/each}
        </ul>
      {/snippet}

      <svg viewBox="0 0 {width} {svgHeight}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect class="chart-background" x="0" y="0" {width} height={svgHeight} />

        <g transform="translate({margin.left}, {margin.top})">
          <!-- Epochen -->
          {#each ERAS as era (era.id)}
            {@const x1 = xScale(era.startYear)}
            {@const x2 = xScale(era.endYear)}
            <rect x={x1} y="0" width={x2 - x1} height={chartHeight} fill={era.token} opacity="0.08" />
            <text class="chart-axis-text" x={(x1 + x2) / 2} y="-12" text-anchor="middle">
              {era.label}
            </text>
          {/each}

          <!-- Jahresachse -->
          <line
            class="chart-axis-line"
            x1="0"
            y1={chartHeight + 20}
            x2={chartWidth}
            y2={chartHeight + 20}
            stroke-width="2"
          />
          {#each ticks as year (year)}
            {@const x = xScale(year)}
            <line class="chart-axis-line" x1={x} y1={chartHeight + 15} x2={x} y2={chartHeight + 25} />
            <text class="chart-axis-text" x={x} y={chartHeight + 40} text-anchor="middle">
              {year}
            </text>
          {/each}

          <!-- Ereignisse -->
          {#each placed as item (item.event.id)}
            {@const token = CATEGORY_TOKENS[item.event.category]}
            {@const isSelected = selectedId === item.event.id}
            {@const isMajor = item.event.significance === 'major'}
            <g transform="translate({item.x}, {item.y})">
              <line
                x1="0"
                y1="20"
                x2="0"
                y2={chartHeight + 20 - item.y}
                stroke={token}
                stroke-width="1"
                stroke-dasharray={isMajor ? undefined : '4,2'}
                opacity="0.6"
              />
              <circle
                cx="0"
                cy="15"
                r={isMajor ? MARKER_RADIUS_MAJOR : MARKER_RADIUS_MINOR}
                fill={token}
                stroke={isSelected ? 'var(--color-marker)' : 'transparent'}
                stroke-width={isSelected ? 3 : 0}
              />
              <text x="0" y="0" fill={token} font-size="9" font-weight="500" text-anchor="middle">
                {item.event.year}
              </text>
              {#if isMajor || isSelected}
                <text class="chart-axis-text" x="12" y="18" font-weight={isSelected ? 600 : 400}>
                  {shortTitle(item.event.titleDE)}
                </text>
              {/if}
            </g>
          {/each}
        </g>
      </svg>

      {#snippet dataTable()}
        <table>
          <caption>Meilensteine der Funktechnik</caption>
          <thead>
            <tr>
              <th scope="col">Jahr</th>
              <th scope="col">Ereignis</th>
              <th scope="col">Kategorie</th>
              <th scope="col">Bedeutung</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredEvents as event (event.id)}
              <tr>
                <th scope="row">{event.year}</th>
                <td>{event.titleDE}</td>
                <td>{CATEGORY_CONFIG[event.category].nameDE}</td>
                <td>{SIGNIFICANCE_LABELS[event.significance]}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/snippet}
    </ChartFrame>

    <TimelineEventDetails
      events={filteredEvents}
      {selectedId}
      onselect={(id) => (selectedId = id)}
    />

  </div>
</Card>

<style>
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .timeline__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .timeline__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .timeline__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .timeline__swatch {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-pill);
    display: inline-block;
    flex: none;
  }











</style>
