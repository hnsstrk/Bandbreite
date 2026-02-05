<script lang="ts">
    import { parseNumericInput } from "$lib/utils/handlers";
    import InfoTooltip from "$lib/components/ui/InfoTooltip.svelte";
    import { fsplExplanations } from "$lib/data/explanations";

    interface Props {
        pathLengthM: number;
        pathLengthUnit: string;
        pathFrequencyHz: number;
        pathFrequencyUnit: string;
        miscLossDb: number;
        includeAtmosphericLoss: boolean;
        fsplDb: number;
        atmosphericLossDb: number;
        totalPathLossDb: number;
    }

    let {
        pathLengthM = $bindable(),
        pathLengthUnit = $bindable(),
        pathFrequencyHz = $bindable(),
        pathFrequencyUnit = $bindable(),
        miscLossDb = $bindable(),
        includeAtmosphericLoss = $bindable(),
        fsplDb,
        atmosphericLossDb,
        totalPathLossDb,
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
        class="text-sm font-semibold text-amber-600 dark:text-amber-400 border-b border-default pb-2"
    >
        Pfad (Path)
    </h4>

    <div class="space-y-3">
        <div>
            <label for="lb-distance" class="text-label mb-1">
                Distanz
                <InfoTooltip
                    title={fsplExplanations.distance.title}
                    short={fsplExplanations.distance.short}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-distance"
                    type="number"
                    value={pathLengthM}
                    oninput={handleNumberInput((v) => (pathLengthM = v))}
                    class="input-field flex-1"
                    step="any"
                    min="0"
                />
                <select
                    id="lb-distance-unit"
                    bind:value={pathLengthUnit}
                    class="select-field"
                    aria-label="Distanzeinheit"
                >
                    <option value="m">m</option>
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                </select>
            </div>
        </div>

        <div>
            <label for="lb-frequency" class="text-label mb-1">
                Frequenz
                <InfoTooltip
                    title={fsplExplanations.frequency.title}
                    short={fsplExplanations.frequency.short}
                />
            </label>
            <div class="flex items-center gap-2">
                <input
                    id="lb-frequency"
                    type="number"
                    value={pathFrequencyHz}
                    oninput={handleNumberInput((v) => (pathFrequencyHz = v))}
                    class="input-field flex-1"
                    step="any"
                    min="0"
                />
                <select
                    id="lb-frequency-unit"
                    bind:value={pathFrequencyUnit}
                    class="select-field"
                    aria-label="Frequenzeinheit"
                >
                    <option value="MHz">MHz</option>
                    <option value="GHz">GHz</option>
                </select>
            </div>
        </div>

        <div>
            <label for="lb-misc-loss" class="text-label mb-1"
                >Sonstige Verluste</label
            >
            <div class="flex items-center gap-2">
                <input
                    id="lb-misc-loss"
                    type="number"
                    value={miscLossDb}
                    oninput={handleNumberInput((v) => (miscLossDb = v))}
                    class="input-field flex-1"
                    step="0.5"
                    min="0"
                />
                <span class="text-muted text-sm w-12">dB</span>
            </div>
        </div>

        <label
            class="flex items-center gap-2 text-sm text-secondary cursor-pointer mt-2"
        >
            <input
                type="checkbox"
                bind:checked={includeAtmosphericLoss}
                class="checkbox"
            />
            Atmosphärische Dämpfung einbeziehen
        </label>

        <!-- Path Loss Results -->
        <div class="result-box mt-4 space-y-2 text-left">
            <div class="flex justify-between text-xs">
                <span class="text-muted">FSPL:</span>
                <span class="text-amber-600 dark:text-amber-400 font-mono"
                    >{fsplDb.toFixed(1)} dB</span
                >
            </div>
            {#if includeAtmosphericLoss && atmosphericLossDb > 0}
                <div class="flex justify-between text-xs">
                    <span class="text-muted">Atmos. Verlust:</span>
                    <span class="text-amber-600 dark:text-amber-400 font-mono"
                        >{atmosphericLossDb.toFixed(1)} dB</span
                    >
                </div>
            {/if}
            {#if miscLossDb > 0}
                <div class="flex justify-between text-xs">
                    <span class="text-muted">Sonstige:</span>
                    <span class="text-amber-600 dark:text-amber-400 font-mono"
                        >{miscLossDb.toFixed(1)} dB</span
                    >
                </div>
            {/if}
            <div class="flex justify-between border-t border-default pt-2">
                <span class="text-primary text-sm">Gesamt:</span>
                <span
                    class="text-xl font-bold text-amber-600 dark:text-amber-400"
                    >{totalPathLossDb.toFixed(1)} dB</span
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
