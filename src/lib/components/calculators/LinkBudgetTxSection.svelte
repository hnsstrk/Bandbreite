<script lang="ts">
  /** Sendeseite der Streckenbilanz: Leistung, Antennengewinn, Kabelverlust, EIRP. */
  import { dbmToWatt } from '$lib/utils/conversions';
  import { formatNumber, formatPowerWatts } from '$lib/utils/formatting';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import {
    CABLE_LOSS_MAX_DB,
    CABLE_LOSS_MIN_DB,
    GAIN_MAX_DBI,
    GAIN_MIN_DBI,
    TX_POWER_MAX_DBM,
    TX_POWER_MIN_DBM
  } from './linkBudget.svelte';

  interface Props {
    txPowerDbm: number;
    txAntennaGainDbi: number;
    txCableLossDb: number;
    eirpDbm: number;
  }

  let {
    txPowerDbm = $bindable(),
    txAntennaGainDbi = $bindable(),
    txCableLossDb = $bindable(),
    eirpDbm
  }: Props = $props();
</script>

<div class="lb-section">
  <SectionHeader title="Sender" level={3} anchor={false} eyebrow="TX" />

  <NumberInput
    label="Sendeleistung"
    bind:value={txPowerDbm}
    units={[{ id: 'dbm', symbol: 'dBm', factor: 1 }]}
    min={TX_POWER_MIN_DBM}
    max={TX_POWER_MAX_DBM}
    step={1}
    slider
    hint={`= ${formatPowerWatts(dbmToWatt(txPowerDbm))}`}
  />

  <NumberInput
    label="Antennengewinn"
    bind:value={txAntennaGainDbi}
    units={[{ id: 'dbi', symbol: 'dBi', factor: 1 }]}
    min={GAIN_MIN_DBI}
    max={GAIN_MAX_DBI}
    step={0.5}
    slider
    hint="Dipol etwa 2 dBi, Parabolantenne 20 bis 50 dBi"
  />

  <NumberInput
    label="Kabel- und Steckerverlust"
    bind:value={txCableLossDb}
    units={[{ id: 'db', symbol: 'dB', factor: 1 }]}
    min={CABLE_LOSS_MIN_DB}
    max={CABLE_LOSS_MAX_DB}
    step={0.1}
    slider
  />

  <ResultCard
    label="EIRP"
    value={formatNumber(eirpDbm, 1)}
    unit="dBm"
    secondary={`= ${formatPowerWatts(dbmToWatt(eirpDbm))}`}
    hint="Äquivalente isotrope Strahlungsleistung"
  />
</div>

<style>
  .lb-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
