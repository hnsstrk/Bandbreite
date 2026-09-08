<script lang="ts">
  /**
   * Frequenzbelegung: welche Dienste welchen Bereich des Spektrums nutzen.
   * Layout und Farben liegen in `applicationOverlayData.ts`.
   */
  import { scaleLog } from 'd3-scale';
  import { ALL_APPLICATIONS, CATEGORY_NAMES, type ApplicationCategory } from '$lib/data/applications';
  import { formatFrequencyRange } from '$lib/data/bands';
  import { formatFrequency } from '$lib/utils/formatting';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import ApplicationDetails from './ApplicationDetails.svelte';
  import ChartFrame from './ChartFrame.svelte';
  import {
    CATEGORY_ENTRIES,
    LABEL_MIN_WIDTH,
    LABEL_WIDE_WIDTH,
    ROW_HEIGHT,
    categoryCount,
    decadeTicks,
    fitLabel,
    layoutApplications
  } from './applicationOverlayData';

  interface Props {
    width?: number;
    height?: number;
    minFrequencyHz?: number;
    maxFrequencyHz?: number;
  }

  let { width = $bindable(1100), height = 700, minFrequencyHz = 100e3, maxFrequencyHz = 100e9 }: Props = $props();

  const margin = { top: 40, right: 20, bottom: 80, left: 60 } as const;
  /** Platz unterhalb der Balken für die Achse. */
  const AXIS_SPACE = 60;

  let selectedCategories = $state<Set<ApplicationCategory>>(
    new Set<ApplicationCategory>(['mobile', 'wlan', 'broadcast', 'satellite'])
  );
  let selectedId = $state<string | null>(null);

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let maxContentHeight = $derived(Math.max(ROW_HEIGHT, height - margin.top - margin.bottom - AXIS_SPACE));

  let filteredApplications = $derived(
    ALL_APPLICATIONS.filter(
      (app) => selectedCategories.has(app.category) && app.maxHz >= minFrequencyHz && app.minHz <= maxFrequencyHz
    )
  );

  let xScale = $derived(scaleLog().domain([minFrequencyHz, maxFrequencyHz]).range([0, chartWidth]).clamp(true));

  let rects = $derived(layoutApplications(filteredApplications, xScale, minFrequencyHz, maxFrequencyHz));

  let contentHeight = $derived(
    rects.length === 0
      ? maxContentHeight
      : Math.min(Math.max(...rects.map((r) => r.y + r.height)) + 20, maxContentHeight)
  );

  let svgHeight = $derived(contentHeight + margin.top + margin.bottom);

  let ticks = $derived(decadeTicks(minFrequencyHz, maxFrequencyHz));

  function handleCategoryClick(category: ApplicationCategory) {
    const next = new Set(selectedCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    selectedCategories = next;
    selectedId = null;
  }

  function handleSelectAllClick() {
    selectedCategories = new Set(CATEGORY_ENTRIES.map((entry) => entry.id));
    selectedId = null;
  }

  function handleSelectNoneClick() {
    selectedCategories = new Set();
    selectedId = null;
  }
</script>

<Card
  title="Frequenzbelegung nach Anwendung"
  subtitle="{ALL_APPLICATIONS.length} Dienste in der Datenbank"
  icon="spectrum"
>
  {#snippet actions()}
    <Button size="sm" variant="ghost" onclick={handleSelectAllClick}>Alle</Button>
    <Button size="sm" variant="ghost" onclick={handleSelectNoneClick}>Keine</Button>
  {/snippet}

  <div class="overlay">
    <div class="overlay__filters" role="group" aria-label="Kategorien filtern">
      {#each CATEGORY_ENTRIES as entry (entry.id)}
        {@const active = selectedCategories.has(entry.id)}
        <Button
          size="sm"
          variant={active ? 'primary' : 'ghost'}
          pressed={active}
          onclick={() => handleCategoryClick(entry.id)}
        >
          {entry.label} ({categoryCount(entry.id, minFrequencyHz, maxFrequencyHz)})
        </Button>
      {/each}
    </div>

    <ChartFrame
      bind:width
      description="Frequenzbelegung über dem Spektrum von 100 Kilohertz bis 100 Gigahertz, ein Balken je Dienst, logarithmische Frequenzachse"
      minWidth={640}
    >
      {#snippet legend()}
        <ul class="overlay__legend">
          {#each CATEGORY_ENTRIES as entry (entry.id)}
            {#if selectedCategories.has(entry.id)}
              <li class="overlay__legend-item">
                <span class="overlay__swatch" style="background: {entry.token}" aria-hidden="true"></span>
                <span>{entry.label}</span>
              </li>
            {/if}
          {/each}
        </ul>
      {/snippet}

      <svg viewBox="0 0 {width} {svgHeight}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect class="chart-background" x="0" y="0" {width} height={svgHeight} />

        <g transform="translate({margin.left}, {margin.top})">
          {#each ticks as tickVal (tickVal)}
            <line
              class="chart-grid-line"
              x1={xScale(tickVal)}
              y1="0"
              x2={xScale(tickVal)}
              y2={contentHeight}
              stroke-dasharray="4,4"
            />
          {/each}

          {#each rects as rect (rect.app.id)}
            {@const isSelected = selectedId === rect.app.id}
            <g transform="translate({rect.x}, {rect.y})">
              <title>{rect.app.nameDE}: {formatFrequencyRange(rect.app.minHz, rect.app.maxHz)}</title>
              <rect
                x="0"
                y="0"
                width={rect.width}
                height={rect.height}
                fill={rect.color}
                stroke={isSelected ? 'var(--color-marker)' : 'transparent'}
                stroke-width={isSelected ? 2 : 0}
                rx="3"
                opacity={isSelected ? 1 : 0.85}
              />
              {#if rect.width > LABEL_MIN_WIDTH}
                <text
                  x={rect.width / 2}
                  y={rect.height / 2}
                  fill="var(--color-on-solid)"
                  font-size={rect.width > LABEL_WIDE_WIDTH ? 10 : 8}
                  font-weight="500"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {fitLabel(rect.app.name, rect.width)}
                </text>
              {/if}
            </g>
          {/each}

          <g transform="translate(0, {contentHeight})">
            <line class="chart-axis-line" x1="0" y1="0" x2={chartWidth} y2="0" />
            {#each ticks as tickVal (tickVal)}
              <g transform="translate({xScale(tickVal)}, 0)">
                <line class="chart-axis-line" y2="8" />
                <text class="chart-axis-text" y="24" text-anchor="middle">
                  {formatFrequency(tickVal, 0)}
                </text>
              </g>
            {/each}
            <text class="chart-axis-label" x={chartWidth / 2} y="50" text-anchor="middle">
              Frequenz (logarithmisch)
            </text>
          </g>
        </g>
      </svg>

      {#snippet dataTable()}
        <table>
          <caption>Angezeigte Dienste und ihre Frequenzbereiche</caption>
          <thead>
            <tr>
              <th scope="col">Dienst</th>
              <th scope="col">Bereich</th>
              <th scope="col">Kategorie</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredApplications as app (app.id)}
              <tr>
                <th scope="row">{app.nameDE}</th>
                <td>{formatFrequencyRange(app.minHz, app.maxHz)}</td>
                <td>{CATEGORY_NAMES[app.category].nameDE}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/snippet}
    </ChartFrame>

    <ApplicationDetails applications={filteredApplications} {selectedId} onselect={(id) => (selectedId = id)} />
  </div>
</Card>

<style>
  .overlay {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .overlay__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .overlay__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .overlay__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .overlay__swatch {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2px;
    display: inline-block;
    flex: none;
  }
</style>
