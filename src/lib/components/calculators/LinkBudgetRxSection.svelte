<script lang="ts">
  /** Empfangsseite der Streckenbilanz. */
  import { dbmToWatt } from '$lib/utils/conversions';
  import { formatPowerDbm, formatPowerWatts } from '$lib/utils/formatting';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import {
    CABLE_LOSS_MAX_DB,
    CABLE_LOSS_MIN_DB,
    FADING_MARGIN_MAX_DB,
    FADING_MARGIN_MIN_DB,
    GAIN_MAX_DBI,
    GAIN_MIN_DBI,
    SENSITIVITY_MAX_DBM,
    SENSITIVITY_MIN_DBM
  } from './linkBudget.svelte';

  interface Props {
    rxAntennaGainDbi: number;
    rxCableLossDb: number;
    rxSensitivityDbm: number;
    fadingMarginDb: number;
    receivedPowerDbm: number;
  }

  let {
    rxAntennaGainDbi = $bindable(),
    rxCableLossDb = $bindable(),
    rxSensitivityDbm = $bindable(),
    fadingMarginDb = $bindable(),
    receivedPowerDbm
  }: Props = $props();
</script>

<div class="lb-section">
  <SectionHeader title="Empfänger" level={3} anchor={false} eyebrow="RX" />

  <NumberInput
    label="Antennengewinn"
    bind:value={rxAntennaGainDbi}
    units={[{ id: 'dbi', symbol: 'dBi', factor: 1 }]}
    min={GAIN_MIN_DBI}
    max={GAIN_MAX_DBI}
    step={0.5}
    slider
  />

  <NumberInput
    label="Kabel- und Steckerverlust"
    bind:value={rxCableLossDb}
    units={[{ id: 'db', symbol: 'dB', factor: 1 }]}
    min={CABLE_LOSS_MIN_DB}
    max={CABLE_LOSS_MAX_DB}
    step={0.1}
    slider
  />

  <NumberInput
    label="Empfindlichkeit"
    bind:value={rxSensitivityDbm}
    units={[{ id: 'dbm', symbol: 'dBm', factor: 1 }]}
    min={SENSITIVITY_MIN_DBM}
    max={SENSITIVITY_MAX_DBM}
    step={1}
    slider
    hint="Kleinster noch auswertbarer Pegel"
  />

  <NumberInput
    label="Fading-Reserve"
    bind:value={fadingMarginDb}
    units={[{ id: 'db', symbol: 'dB', factor: 1 }]}
    min={FADING_MARGIN_MIN_DB}
    max={FADING_MARGIN_MAX_DB}
    step={0.5}
    slider
    hint="Reserve für Schwund durch Mehrwege und Wetter"
  />

  <ResultCard
    label="Empfangsleistung"
    value={formatPowerDbm(receivedPowerDbm)}
    secondary={`= ${formatPowerWatts(dbmToWatt(receivedPowerDbm), 3)}`}
  />
</div>

<style>
  .lb-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
