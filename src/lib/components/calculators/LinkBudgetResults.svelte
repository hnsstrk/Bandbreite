<script lang="ts">
    import InfoTooltip from "$lib/components/ui/InfoTooltip.svelte";
    import { linkBudgetExplanations } from "$lib/data/explanations";

    interface Props {
        linkMarginDb: number;
        systemMarginDb: number;
        fadingMarginDb: number;
        linkViable: boolean;
    }

    let { linkMarginDb, systemMarginDb, fadingMarginDb, linkViable }: Props =
        $props();
</script>

<div class="mt-6 pt-6 border-t border-default">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Link Margin -->
        <div class="result-box">
            <div class="result-label">
                Link Margin
                <InfoTooltip
                    title={linkBudgetExplanations.linkMargin.title}
                    short={linkBudgetExplanations.linkMargin.short}
                    detailed={linkBudgetExplanations.linkMargin.detailed}
                />
            </div>
            <div
                class="text-2xl font-bold {linkMarginDb >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'}"
            >
                {linkMarginDb >= 0 ? "+" : ""}{linkMarginDb.toFixed(1)}
                <span class="text-lg text-muted">dB</span>
            </div>
            <div class="text-xs text-muted mt-1">
                Pegel über Empfindlichkeit
            </div>
        </div>

        <!-- System Margin -->
        <div class="result-box">
            <div class="result-label">
                System Margin
                <InfoTooltip
                    title={linkBudgetExplanations.systemGain.title}
                    short={linkBudgetExplanations.systemGain.short}
                    detailed={linkBudgetExplanations.systemGain.detailed}
                />
            </div>
            <div
                class="text-2xl font-bold {systemMarginDb >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'}"
            >
                {systemMarginDb >= 0 ? "+" : ""}{systemMarginDb.toFixed(1)}
                <span class="text-lg text-muted">dB</span>
            </div>
            <div class="text-xs text-muted mt-1">
                Nach Fading Margin ({fadingMarginDb} dB)
            </div>
        </div>

        <!-- Link Status -->
        <div class="result-box">
            <div class="result-label">Link Status</div>
            <div
                class="text-xl font-bold {linkViable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'}"
            >
                {linkViable ? "VIABLE" : "NICHT VIABLE"}
            </div>
            <div
                class="text-xs {linkViable
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-red-600 dark:text-red-500'} mt-1"
            >
                {linkViable
                    ? `Reserve: ${systemMarginDb.toFixed(1)} dB`
                    : `Fehlt: ${Math.abs(systemMarginDb).toFixed(1)} dB`}
            </div>
        </div>
    </div>
</div>

<style>
    .border-default {
        border-color: var(--color-border-default);
    }
</style>
