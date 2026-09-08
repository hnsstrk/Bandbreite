<script lang="ts">
  /**
   * Streckenbilanz (Link Budget) vom Sender bis zur Empfängerreserve.
   *
   * Der Zustand steht in der Adresszeile; das Wasserfalldiagramm sitzt direkt
   * im Rechner und liest dieselben abgeleiteten Werte — es braucht weder
   * Komponentenreferenz noch Effekt.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { calculateFSPL } from '$lib/utils/calculations';
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import {
    calculateEarthSpaceAttenuation,
    calculateExtendedPathAttenuation
  } from '$lib/utils/atmosphericAttenuation';
  import { EARTH_SPACE_PATH_THRESHOLD_KM } from '$lib/data/constants';
  import {
    UrlStateSync,
    buildShareLink,
    defaultValues,
    hasNonDefaults,
    readParams,
    syncParamsOnNavigate
  } from '$lib/utils/urlState.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import LinkBudgetWaterfall from '$lib/components/charts/LinkBudgetWaterfall.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import LinkBudgetPathSection from './LinkBudgetPathSection.svelte';
  import LinkBudgetResults from './LinkBudgetResults.svelte';
  import LinkBudgetRxSection from './LinkBudgetRxSection.svelte';
  import LinkBudgetTxSection from './LinkBudgetTxSection.svelte';
  import PresetChips from './PresetChips.svelte';
  import {
    LINK_BUDGET_PARAMS,
    LINK_PRESETS,
    presetDistanceM,
    presetFrequencyHz,
    type LinkBudgetData,
    type PathType,
    type PresetChip
  } from './linkBudget.svelte';

  const initial = browser
    ? readParams(page.url.searchParams, LINK_BUDGET_PARAMS)
    : defaultValues(LINK_BUDGET_PARAMS);

  // Sendeseite
  let txPowerDbm = $state(initial.pt);
  let txAntennaGainDbi = $state(initial.gt);
  let txCableLossDb = $state(initial.lt);

  // Strecke
  let pathLengthM = $state(initial.d);
  let pathLengthUnit = $state('m');
  let pathFrequencyHz = $state(initial.f);
  let pathFrequencyUnit = $state('GHz');
  let includeAtmosphericLoss = $state(initial.atm);
  let pathType = $state<PathType>(initial.path as PathType);
  let elevationAngleDeg = $state(initial.el);

  // Empfangsseite
  let rxAntennaGainDbi = $state(initial.gr);
  let rxCableLossDb = $state(initial.lr);
  let rxSensitivityDbm = $state(initial.s);
  let fadingMarginDb = $state(initial.fade);
  let miscLossDb = $state(initial.misc);

  let presetId = $state<string | null>(null);

  const sync = new UrlStateSync(LINK_BUDGET_PARAMS);

  /** Übernimmt einen vollständigen Parametersatz (URL-Sprung oder Reset). */
  function applyValues(next: typeof initial) {
    txPowerDbm = next.pt;
    txAntennaGainDbi = next.gt;
    txCableLossDb = next.lt;
    pathLengthM = next.d;
    pathFrequencyHz = next.f;
    rxAntennaGainDbi = next.gr;
    rxCableLossDb = next.lr;
    rxSensitivityDbm = next.s;
    fadingMarginDb = next.fade;
    miscLossDb = next.misc;
    includeAtmosphericLoss = next.atm;
    pathType = next.path as PathType;
    elevationAngleDeg = next.el;
    presetId = null;
  }

  // Gleiche Route, andere Parameter: Zustand aus der URL nachziehen.
  syncParamsOnNavigate(LINK_BUDGET_PARAMS, sync, applyValues);

  let values = $derived({
    pt: txPowerDbm,
    gt: txAntennaGainDbi,
    lt: txCableLossDb,
    d: pathLengthM,
    f: pathFrequencyHz,
    gr: rxAntennaGainDbi,
    lr: rxCableLossDb,
    s: rxSensitivityDbm,
    fade: fadingMarginDb,
    misc: miscLossDb,
    atm: includeAtmosphericLoss,
    path: pathType,
    el: elevationAngleDeg
  });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, LINK_BUDGET_PARAMS));
  let canReset = $derived(hasNonDefaults(values, LINK_BUDGET_PARAMS));

  let eirpDbm = $derived(txPowerDbm + txAntennaGainDbi - txCableLossDb);

  let fsplDb = $derived(
    pathLengthM > 0 && pathFrequencyHz > 0 ? calculateFSPL(pathLengthM, pathFrequencyHz) : 0
  );

  let atmosphericLossDb = $derived.by(() => {
    if (!includeAtmosphericLoss) return 0;
    if (pathFrequencyHz <= 0 || pathLengthM <= 0) return 0;

    const freqGHz = pathFrequencyHz / 1e9;
    const distKm = pathLengthM / 1000;

    // Erde–Raum: nur der troposphärische Anteil dämpft (äquivalente Höhen,
    // Regenhöhe), nicht die volle Distanz zum Satelliten.
    const result =
      pathType === 'earth-space'
        ? calculateEarthSpaceAttenuation(
            freqGHz,
            atmosphericParameters.allConditions,
            elevationAngleDeg
          )
        : calculateExtendedPathAttenuation(
            freqGHz,
            atmosphericParameters.allConditions,
            distKm
          );

    return result.totalAllDb;
  });

  let totalPathLossDb = $derived(fsplDb + atmosphericLossDb + miscLossDb);
  let receivedPowerDbm = $derived(
    eirpDbm - totalPathLossDb + rxAntennaGainDbi - rxCableLossDb
  );
  let linkMarginDb = $derived(receivedPowerDbm - rxSensitivityDbm);
  let systemMarginDb = $derived(linkMarginDb - fadingMarginDb);
  let linkViable = $derived(systemMarginDb >= 0);

  let linkBudgetData = $derived<LinkBudgetData>({
    txPowerDbm,
    txAntennaGainDbi,
    txCableLossDb,
    eirpDbm,
    fsplDb,
    atmosphericLossDb,
    miscLossDb,
    totalPathLossDb,
    rxAntennaGainDbi,
    rxCableLossDb,
    receivedPowerDbm,
    rxSensitivityDbm,
    linkMarginDb,
    fadingMarginDb,
    systemMarginDb,
    linkViable
  });

  /** Szenario-Presets als Chips mit stabiler ID. */
  const presetChips: PresetChip[] = LINK_PRESETS.map((preset, index) => ({
    id: `preset-${index}`,
    label: preset.name,
    value: index
  }));

  function handlePresetSelect(chip: PresetChip) {
    const preset = LINK_PRESETS[chip.value];
    if (!preset) return;
    presetId = chip.id;
    txPowerDbm = preset.txPower;
    txAntennaGainDbi = preset.txGain;
    txCableLossDb = preset.txLoss;
    pathLengthM = presetDistanceM(preset);
    pathLengthUnit = preset.distUnit;
    pathFrequencyHz = presetFrequencyHz(preset);
    pathFrequencyUnit = preset.freqUnit;
    rxAntennaGainDbi = preset.rxGain;
    rxCableLossDb = preset.rxLoss;
    rxSensitivityDbm = preset.rxSens;
    fadingMarginDb = preset.fade;
    // Strecken jenseits jeder terrestrischen Sichtverbindung sind Erde–Raum-Pfade
    pathType =
      pathLengthM / 1000 >= EARTH_SPACE_PATH_THRESHOLD_KM ? 'earth-space' : 'terrestrial';
  }

  function handleReset() {
    applyValues(defaultValues(LINK_BUDGET_PARAMS));
    pathLengthUnit = 'm';
    pathFrequencyUnit = 'GHz';
  }

  /** Kein Chip ist aktiv, solange kein Preset gewählt wurde. */
  let presetValue = $derived(
    presetId ? (presetChips.find((chip) => chip.id === presetId)?.value ?? -1) : -1
  );
</script>

<Card title="Streckenbilanz" subtitle="Link Budget vom Sender bis zur Reserve" icon="antenna">
  {#snippet actions()}
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  {/snippet}

  <div class="lb">
    <PresetChips
      label="Szenarien"
      presets={presetChips}
      value={presetValue}
      chosenId={presetId}
      onselect={handlePresetSelect}
    />

    <div class="lb__columns">
      <LinkBudgetTxSection
        bind:txPowerDbm
        bind:txAntennaGainDbi
        bind:txCableLossDb
        {eirpDbm}
      />

      <LinkBudgetPathSection
        bind:pathLengthM
        bind:pathLengthUnit
        bind:pathFrequencyHz
        bind:pathFrequencyUnit
        bind:miscLossDb
        bind:includeAtmosphericLoss
        bind:pathType
        bind:elevationAngleDeg
        {fsplDb}
        {atmosphericLossDb}
        {totalPathLossDb}
      />

      <LinkBudgetRxSection
        bind:rxAntennaGainDbi
        bind:rxCableLossDb
        bind:rxSensitivityDbm
        bind:fadingMarginDb
        {receivedPowerDbm}
      />
    </div>

    <LinkBudgetResults {linkMarginDb} {systemMarginDb} {fadingMarginDb} {linkViable} />

    <FormulaBlock
      formula="P_RX = P_TX + G_TX − L_TX − L_Pfad + G_RX − L_RX,  M = P_RX − S_RX"
      alt="P RX gleich P TX plus G TX minus L TX minus L Pfad plus G RX minus L RX; die Reserve M ist P RX minus S RX"
      label="Streckenbilanz"
      number="(1)"
      variables={[
        { symbol: 'P_TX', meaning: 'Sendeleistung', unit: 'dBm' },
        { symbol: 'G_TX / G_RX', meaning: 'Antennengewinne', unit: 'dBi' },
        { symbol: 'L_TX / L_RX', meaning: 'Kabel- und Steckerverluste', unit: 'dB' },
        { symbol: 'L_Pfad', meaning: 'Streckendämpfung inkl. Atmosphäre', unit: 'dB' },
        { symbol: 'S_RX', meaning: 'Empfängerempfindlichkeit', unit: 'dBm' },
        { symbol: 'M', meaning: 'Streckenreserve', unit: 'dB' }
      ]}
    />

    <LinkBudgetWaterfall data={linkBudgetData} />
  </div>
</Card>

<style>
  .lb {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .lb__columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: 1.5rem;
  }
</style>
