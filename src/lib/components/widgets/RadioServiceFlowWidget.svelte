<script lang="ts">
  /**
   * Von der Zuweisung zur Zuteilung: die vier Ebenen zwischen VO Funk und
   * Betriebserlaubnis, mit einer Beispielspur je Ebene. Ein Klick oder Tipp
   * auf eine Stufe öffnet den Erklärtext. Daten in RadioServiceFlowModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatFrequency } from '$lib/utils/formatting';
  import { wrapLines } from './textWrap';
  import {
    exampleBandwidthHz,
    findExample,
    findStage,
    FLOW_EXAMPLES,
    FLOW_STAGES,
    GRANT_LABEL
  } from './RadioServiceFlowModel';

  const W = 780;
  /** Höhe einer Stufe und Abstand zur nächsten */
  const ROW_H = 84;
  const ROW_GAP = 12;
  const H = FLOW_STAGES.length * (ROW_H + ROW_GAP) + 8;
  /** Beginn der Beispielspalte */
  const TRACE_X = 258;
  /** Zeichen je Zeile der Beispielspur */
  const TRACE_CHARS = 62;

  let stageId = $state<string>(FLOW_STAGES[0].id);
  let exampleId = $state<string>(FLOW_EXAMPLES[0].id);

  const stage = $derived(findStage(stageId));
  const example = $derived(findExample(exampleId));
  const options = FLOW_EXAMPLES.map((entry) => ({ value: entry.id, label: entry.label }));

  const rowY = (index: number) => 4 + index * (ROW_H + ROW_GAP);

  function handleKeydown(event: KeyboardEvent) {
    const index = FLOW_STAGES.findIndex((entry) => entry.id === stageId);
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = index + 1;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = FLOW_STAGES.length - 1;
    else return;
    event.preventDefault();
    stageId = FLOW_STAGES[Math.min(FLOW_STAGES.length - 1, Math.max(0, next))].id;
  }
</script>

<WidgetFrame
  title="Von der Zuweisung zur Zuteilung"
  description="Vier übereinanderliegende Stufen: Zuweisung an einen Funkdienst durch die VO Funk, europäische Harmonisierung, nationaler Frequenzplan und schließlich die Frequenzzuteilung. Rechts steht je Stufe der Eintrag des gewählten Beispiels."
  footnote="Quellen: VO Funk Art. 1 und Art. 5; § 90 TKG (Frequenzplan) und § 91 TKG (Allgemein- und Einzelzuteilung); für den Amateurfunk AFuG und AFuV Anlage 1. Diese Darstellung ist Lehrmaterial und keine amtliche Auskunft."
  stacked
  interactive
>
  <div class="flow" role="listbox" aria-label="Stufe auswählen" tabindex="0" onkeydown={handleKeydown}>
    <svg viewBox="0 0 {W} {H}" role="presentation">
      <defs>
        <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,1 L6,4 L0,7 Z" fill="var(--color-ink-subtle)" />
        </marker>
      </defs>

      {#each FLOW_STAGES as entry, index (entry.id)}
        {@const y = rowY(index)}
        {@const active = entry.id === stageId}
        <g
          role="option"
          aria-selected={active}
          tabindex="-1"
          aria-label="Stufe {index + 1}: {entry.label} — {entry.actorDE}. Beispiel: {example.steps[entry.id]}"
          onclick={() => (stageId = entry.id)}
          onkeydown={handleKeydown}
        >
          <rect
            x="2"
            {y}
            width={W - 4}
            height={ROW_H}
            fill={active ? 'var(--color-accent-primary-alpha)' : 'var(--color-surface)'}
            stroke={active ? 'var(--color-accent-primary)' : 'var(--color-line)'}
            stroke-width={active ? 2 : 1}
            rx="2"
          />
          <text x="18" y={y + 26} class="chart-axis-text" font-weight="600">
            {index + 1} · {entry.label}
          </text>
          <text x="18" y={y + 46} class="chart-legend-text">{entry.actorDE}</text>
          <text x="18" y={y + 64} class="chart-legend-text">{entry.instrumentDE}</text>
          <line x1={TRACE_X - 16} y1={y + 10} x2={TRACE_X - 16} y2={y + ROW_H - 10} class="chart-axis-line" />
          {#each wrapLines(example.steps[entry.id], TRACE_CHARS, 3) as line, lineIndex (lineIndex)}
            <text x={TRACE_X} y={y + 26 + lineIndex * 17} class="chart-axis-text">{line}</text>
          {/each}
        </g>
        {#if index < FLOW_STAGES.length - 1}
          <line
            x1={W / 2}
            y1={y + ROW_H}
            x2={W / 2}
            y2={y + ROW_H + ROW_GAP - 1}
            stroke="var(--color-ink-subtle)"
            stroke-width="1.5"
            marker-end="url(#flow-arrow)"
          />
        {/if}
      {/each}
    </svg>
  </div>

  {#snippet dataTable()}
    <table>
      <caption>Beispielspur „{example.label}“ durch die vier Ebenen</caption>
      <thead><tr><th>Ebene</th><th>Wer</th><th>Eintrag</th></tr></thead>
      <tbody>
        {#each FLOW_STAGES as entry (entry.id)}
          <tr><td>{entry.label}</td><td>{entry.actorDE}</td><td>{example.steps[entry.id]}</td></tr>
        {/each}
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Beispielspur" bind:value={exampleId} {options} />
    <Select
      label="Erklärte Stufe"
      bind:value={stageId}
      options={FLOW_STAGES.map((entry, index) => ({
        value: entry.id,
        label: `${index + 1} · ${entry.label} (${entry.instrumentDE})`
      }))}
      hint="Ein Klick auf eine Stufe der Grafik wählt sie ebenfalls aus."
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Frequenzbereich"
      value="{formatFrequency(example.minHz, 3)} bis {formatFrequency(example.maxHz, 3)}"
      hint="Breite {formatFrequency(exampleBandwidthHz(example), 3)}"
      emphasis="hero"
      copyable={false}
    />
    <ResultCard
      label="Ende der Kette"
      value={GRANT_LABEL[example.grant]}
      hint={example.status === 'primaer' ? 'primäre Zuweisung' : 'sekundäre Zuweisung'}
      tone={example.grant === 'einzel' ? 'success' : 'neutral'}
      copyable={false}
    />
    <Callout tone="info" title="{stage.label} — {stage.instrumentDE}">
      {stage.explanationDE}
    </Callout>
    <Callout tone="tip" title="Randnotiz zum Status" source={example.source}>
      Zugewiesener Funkdienst: {example.serviceDE}. {example.statusNoteDE} Primäre Dienste stehen in der Zuweisungstabelle
      in Großbuchstaben, sekundäre in Kleinbuchstaben — ein sekundärer Dienst darf nicht stören und kann keinen Schutz verlangen.
    </Callout>
  {/snippet}
</WidgetFrame>

<style>
  .flow:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  .flow :global([role='option']) {
    cursor: pointer;
  }
</style>
