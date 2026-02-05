<script lang="ts">
    import { dbmToWatt } from "$lib/utils/conversions";
    import { formatPowerWatts } from "$lib/utils/formatting";
    import { parseNumericInput } from "$lib/utils/handlers";
    import InfoTooltip from "$lib/components/ui/InfoTooltip.svelte";
    import { linkBudgetExplanations } from "$lib/data/explanations";

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
        eirpDbm,
    }: Props = $props();

    // Event handlers
    function handleNumberInput(setter: (val: number) => void) {
        return (e: Event) => {
            setter(parseNumericInput(e, 0));
        };
    }
</script>

<div class="space-y-4">
    <h4
        class="text-sm font-semibold text-blue-600 dark:text-blue-400 border-b border-default pb-2"
    >
        TX (Sender)
    </h4>

    <div class="space-y-3">
        <div>
            <label for="lb-tx-power" class="text-label mb-1">
                Sendeleistung
                <InfoTooltip
                    title={linkBudgetExplanations.txPower.title}
                    short={linkBudgetExplanations.txPower.short}
                    detailed={linkBudgetExplanations.txPower.detailed}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-tx-power"
                    type="number"
                    value={txPowerDbm}
                    oninput={handleNumberInput((v) => (txPowerDbm = v))}
                    class="input-field flex-1"
                    step="1"
                />
                <span class="text-muted text-sm w-12">dBm</span>
            </div>
            <div class="text-xs text-muted mt-1">
                = {formatPowerWatts(dbmToWatt(txPowerDbm))}
            </div>
        </div>

        <div>
            <label for="lb-tx-antenna" class="text-label mb-1">
                Antennengewinn
                <InfoTooltip
                    title={linkBudgetExplanations.txAntennaGain.title}
                    short={linkBudgetExplanations.txAntennaGain.short}
                    detailed={linkBudgetExplanations.txAntennaGain.detailed}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-tx-antenna"
                    type="number"
                    value={txAntennaGainDbi}
                    oninput={handleNumberInput((v) => (txAntennaGainDbi = v))}
                    class="input-field flex-1"
                    step="0.5"
                />
                <span class="text-muted text-sm w-12">dBi</span>
            </div>
        </div>

        <div>
            <label for="lb-tx-cable" class="text-label mb-1">
                Kabelverlust
                <InfoTooltip
                    title={linkBudgetExplanations.txCableLoss.title}
                    short={linkBudgetExplanations.txCableLoss.short}
                    detailed={linkBudgetExplanations.txCableLoss.detailed}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-tx-cable"
                    type="number"
                    value={txCableLossDb}
                    oninput={handleNumberInput((v) => (txCableLossDb = v))}
                    class="input-field flex-1"
                    step="0.1"
                    min="0"
                />
                <span class="text-muted text-sm w-12">dB</span>
            </div>
        </div>

        <!-- EIRP Result -->
        <div class="result-box mt-4">
            <div class="result-label">
                EIRP
                <InfoTooltip
                    title={linkBudgetExplanations.eirp.title}
                    short={linkBudgetExplanations.eirp.short}
                    detailed={linkBudgetExplanations.eirp.detailed}
                />
            </div>
            <div class="text-xl font-bold text-blue-600 dark:text-blue-400">
                {eirpDbm.toFixed(1)} <span class="text-sm text-muted">dBm</span>
            </div>
            <div class="text-xs text-muted">
                = {dbmToWatt(eirpDbm) >= 1
                    ? `${dbmToWatt(eirpDbm).toFixed(2)} W`
                    : `${(dbmToWatt(eirpDbm) * 1000).toFixed(2)} mW`}
            </div>
        </div>
    </div>
</div>

<style>
    .border-default {
        border-color: var(--color-border-default);
    }
</style>
