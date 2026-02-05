<script lang="ts">
    import { parseNumericInput } from "$lib/utils/handlers";
    import InfoTooltip from "$lib/components/ui/InfoTooltip.svelte";
    import { linkBudgetExplanations } from "$lib/data/explanations";

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
        receivedPowerDbm,
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
        class="text-sm font-semibold text-green-600 dark:text-green-400 border-b border-default pb-2"
    >
        RX (Empfänger)
    </h4>

    <div class="space-y-3">
        <div>
            <label for="lb-rx-antenna" class="text-label mb-1">
                Antennengewinn
                <InfoTooltip
                    title={linkBudgetExplanations.rxAntennaGain.title}
                    short={linkBudgetExplanations.rxAntennaGain.short}
                    detailed={linkBudgetExplanations.rxAntennaGain.detailed}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-rx-antenna"
                    type="number"
                    value={rxAntennaGainDbi}
                    oninput={handleNumberInput((v) => (rxAntennaGainDbi = v))}
                    class="input-field flex-1"
                    step="0.5"
                />
                <span class="text-muted text-sm w-12">dBi</span>
            </div>
        </div>

        <div>
            <label for="lb-rx-cable" class="text-label mb-1">
                Kabelverlust
                <InfoTooltip
                    title={linkBudgetExplanations.rxCableLoss.title}
                    short={linkBudgetExplanations.rxCableLoss.short}
                    detailed={linkBudgetExplanations.rxCableLoss.detailed}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-rx-cable"
                    type="number"
                    value={rxCableLossDb}
                    oninput={handleNumberInput((v) => (rxCableLossDb = v))}
                    class="input-field flex-1"
                    step="0.1"
                    min="0"
                />
                <span class="text-muted text-sm w-12">dB</span>
            </div>
        </div>

        <div>
            <label for="lb-rx-sensitivity" class="text-label mb-1">
                Empfindlichkeit
                <InfoTooltip
                    title={linkBudgetExplanations.rxSensitivity.title}
                    short={linkBudgetExplanations.rxSensitivity.short}
                    detailed={linkBudgetExplanations.rxSensitivity.detailed}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-rx-sensitivity"
                    type="number"
                    value={rxSensitivityDbm}
                    oninput={handleNumberInput((v) => (rxSensitivityDbm = v))}
                    class="input-field flex-1"
                    step="1"
                />
                <span class="text-muted text-sm w-12">dBm</span>
            </div>
        </div>

        <div>
            <label for="lb-fading-margin" class="text-label mb-1">
                Fading Margin
                <InfoTooltip
                    title={linkBudgetExplanations.fadingMargin.title}
                    short={linkBudgetExplanations.fadingMargin.short}
                    detailed={linkBudgetExplanations.fadingMargin.detailed}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-fading-margin"
                    type="number"
                    value={fadingMarginDb}
                    oninput={handleNumberInput((v) => (fadingMarginDb = v))}
                    class="input-field flex-1"
                    step="1"
                    min="0"
                />
                <span class="text-muted text-sm w-12">dB</span>
            </div>
        </div>

        <!-- RX Results -->
        <div class="result-box mt-4 space-y-2 text-left">
            <div class="flex justify-between">
                <span class="text-muted text-sm">Empfangsleistung:</span>
                <span
                    class="text-lg font-bold text-green-600 dark:text-green-400"
                    >{receivedPowerDbm.toFixed(1)} dBm</span
                >
            </div>
            <div class="flex justify-between text-xs">
                <span class="text-muted">Empfindlichkeit:</span>
                <span class="text-primary font-mono"
                    >{rxSensitivityDbm} dBm</span
                >
            </div>
        </div>
    </div>
</div>

<style>
    .border-default {
        border-color: var(--color-border-default);
    }
</style>
