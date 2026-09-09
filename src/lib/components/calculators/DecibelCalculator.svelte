<script lang="ts">
  /**
   * Universeller Pegelrechner: Leistung ↔ dBm ↔ dBW ↔ dBµV, Spannung ↔ dBµV,
   * Faktor ↔ dB und eine Kettenrechnung mit laufender Summe.
   *
   * Alle Umrechnungen stammen aus `$lib/utils/decibel` — derselbe Rechenkern
   * wie im dB-Spielplatz des Kapitels HF-Mathematik.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import Callout from '$lib/components/ui/Callout.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import { dbmToDbuvOffset } from '$lib/utils/decibel';
  import {
    UrlStateSync,
    buildShareLink,
    defaultValues,
    hasNonDefaults,
    readParams,
    syncParamsOnNavigate
  } from '$lib/utils/urlState.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import DecibelChain from './DecibelChain.svelte';
  import DecibelLevelSection from './DecibelLevelSection.svelte';
  import DecibelMemoTable from './DecibelMemoTable.svelte';
  import DecibelRatioSection from './DecibelRatioSection.svelte';
  import {
    DECIBEL_PARAMS,
    DEFAULT_LEVEL_CHAIN,
    IMPEDANCE_OPTIONS,
    parseChain,
    serializeChain
  } from './decibelCalculator.svelte';

  const initial = browser ? readParams(page.url.searchParams, DECIBEL_PARAMS) : defaultValues(DECIBEL_PARAMS);

  let levelDbm = $state(initial.l);
  let impedanceId = $state(initial.z);
  let ratioDb = $state(initial.r);
  let stages = $state(parseChain(initial.c));

  let impedanceOhm = $derived(Number(impedanceId));

  const sync = new UrlStateSync(DECIBEL_PARAMS);

  syncParamsOnNavigate(DECIBEL_PARAMS, sync, (next) => {
    levelDbm = next.l;
    impedanceId = next.z;
    ratioDb = next.r;
    stages = parseChain(next.c);
  });

  let values = $derived({
    l: levelDbm,
    z: impedanceId,
    r: ratioDb,
    c: serializeChain(stages)
  });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, DECIBEL_PARAMS));
  let canReset = $derived(hasNonDefaults(values, DECIBEL_PARAMS));

  function handleReset() {
    levelDbm = DECIBEL_PARAMS.l.default;
    impedanceId = DECIBEL_PARAMS.z.default;
    ratioDb = DECIBEL_PARAMS.r.default;
    stages = DEFAULT_LEVEL_CHAIN.map((stage) => ({ ...stage }));
  }
</script>

<div class="calc">
  <div class="calc__bar">
    <p class="calc__sub">Leistung, Spannung und Dezibel</p>
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  </div>
  <div class="db">
    <div class="db__impedance">
      <Select
        label="Bezugsimpedanz"
        bind:value={impedanceId}
        options={IMPEDANCE_OPTIONS}
        size="sm"
        hint="Nur Spannung und dBµV hängen davon ab; dBm und dBW nicht."
      />
    </div>

    <DecibelLevelSection bind:levelDbm {impedanceOhm} />

    <FormulaBlock
      formula="P[dBm] = 10 · log₁₀(P / 1 mW)   ·   U[dBµV] = P[dBm] + 10 · log₁₀(Z / Ω) + 90"
      alt="P in dBm gleich zehn mal Logarithmus von P durch ein Milliwatt; U in dB Mikrovolt gleich P in dBm plus zehn mal Logarithmus von Z plus neunzig"
      label="Absolutpegel und ihr Bezug"
      number="(1)"
      variables={[
        { symbol: 'P', meaning: 'Leistung am Bezugspunkt', unit: 'W' },
        { symbol: 'U', meaning: 'Effektivwert der Spannung', unit: 'V' },
        { symbol: 'Z', meaning: 'Bezugsimpedanz', unit: 'Ω' },
        { symbol: 'dBm', meaning: 'Pegel bezogen auf 1 mW', unit: 'dBm' },
        { symbol: 'dBµV', meaning: 'Pegel bezogen auf 1 µV', unit: 'dBµV' }
      ]}
    />

    <Callout tone="info" title="Der Bezug gehört zur Zahl" source="ITU-R V.574-5">
      Ein Verhältnis in dB ist einheitenlos, ein Absolutpegel nicht: dBm zählt ab 1 mW, dBW ab 1 W, dBµV ab 1 µV. An {formatNumber(
        impedanceOhm,
        0
      )} Ω liegen zwischen dBm und dBµV genau {formatNumber(dbmToDbuvOffset(impedanceOhm), 2)} dB — 0 dBm sind dort {formatNumber(
        dbmToDbuvOffset(impedanceOhm),
        1
      )} dBµV.
    </Callout>

    <section aria-labelledby="verhaeltnis">
      <SectionHeader
        title="Verhältnis und Dezibel"
        id="verhaeltnis"
        level={3}
        description="Wie viel Leistung oder Spannung hinter einer dB-Angabe steckt."
      />
      <div class="db__ratio">
        <DecibelRatioSection bind:ratioDb />
        <DecibelMemoTable activeDb={ratioDb} />
      </div>
    </section>

    <section aria-labelledby="kette">
      <SectionHeader
        title="Kettenrechnung"
        id="kette"
        level={3}
        description="Gewinne und Verluste eines Signalwegs addieren sich in Dezibel."
      />
      <DecibelChain bind:stages />
    </section>
  </div>
</div>

<style>
  .db {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .db__impedance {
    max-width: 22rem;
  }

  .db__ratio {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 0.75rem;
    align-items: start;
  }

  .calc {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .calc__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.25rem 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--color-line);
  }

  .calc__sub {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
