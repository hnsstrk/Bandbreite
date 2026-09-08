<script lang="ts">
	/**
	 * Von der Sendeleistung zur Feldstärke: EIRP und ERP, Leistungsdichte im
	 * Abstand d und die daraus folgende elektrische Feldstärke in V/m und
	 * dBµV/m. Der Balkenvergleich zeigt den Abfall über die Entfernung
	 * (6 dB je Verdopplung). Gerechnet wird in $lib/utils/fieldStrength.ts.
	 */
	import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import ResultCard from '$lib/components/ui/ResultCard.svelte';
	import { formatDistance, formatNumber, formatPowerWatts } from '$lib/utils/formatting';
	import {
		FIELD_STRENGTH_DISTANCES_M,
		FIELD_STRENGTH_LIMITS,
		computeFieldStrength,
		fieldStrengthDbuvPerM,
		fieldStrengthVPerM
	} from '$lib/utils/fieldStrength';

	const W = 760;
	const H = 250;
	const PLOT_X0 = 74;
	const PLOT_X1 = 730;
	const PLOT_Y0 = 30;
	const PLOT_Y1 = 200;
	/** Skalenanfang des Balkendiagramms in dBµV/m */
	const SCALE_MIN_DBUV = 0;
	/** Skalenende des Balkendiagramms in dBµV/m */
	const SCALE_MAX_DBUV = 160;
	const SCALE_STEP_DBUV = 40;
	const BAR_GAP = 18;

	let txPowerW = $state<number>(FIELD_STRENGTH_LIMITS.txPowerW.default);
	let gainDbi = $state<number>(FIELD_STRENGTH_LIMITS.gainDbi.default);
	let distanceM = $state<number>(FIELD_STRENGTH_LIMITS.distanceM.default);

	const result = $derived(computeFieldStrength({ txPowerW, gainDbi, distanceM }));

	/** Feldstärkepegel an den festen Vergleichsabständen. */
	const bars = $derived(
		FIELD_STRENGTH_DISTANCES_M.map((d) => ({
			distanceM: d,
			dbuv: fieldStrengthDbuvPerM(fieldStrengthVPerM(result.eirpW, d)),
			vPerM: fieldStrengthVPerM(result.eirpW, d)
		}))
	);

	const barWidth = $derived((PLOT_X1 - PLOT_X0) / bars.length - BAR_GAP);
	function barX(index: number): number {
		return PLOT_X0 + (index * (PLOT_X1 - PLOT_X0)) / bars.length + BAR_GAP / 2;
	}
	function scaleY(dbuv: number): number {
		const clamped = Math.min(Math.max(dbuv, SCALE_MIN_DBUV), SCALE_MAX_DBUV);
		return PLOT_Y1 - ((clamped - SCALE_MIN_DBUV) / (SCALE_MAX_DBUV - SCALE_MIN_DBUV)) * (PLOT_Y1 - PLOT_Y0);
	}
	const gridLines = $derived(
		Array.from(
			{ length: (SCALE_MAX_DBUV - SCALE_MIN_DBUV) / SCALE_STEP_DBUV + 1 },
			(_, i) => SCALE_MIN_DBUV + i * SCALE_STEP_DBUV
		)
	);

	const dbuvLabel = $derived(
		Number.isFinite(result.fieldDbuvPerM) ? `${formatNumber(result.fieldDbuvPerM, 1)} dBµV/m` : '—'
	);
	const fieldLabel = $derived(
		result.fieldVPerM >= 0.01
			? `${formatNumber(result.fieldVPerM, 3)} V/m`
			: `${formatNumber(result.fieldVPerM * 1000, 2)} mV/m`
	);
	const densityLabel = $derived(
		result.powerDensityW >= 1
			? `${formatNumber(result.powerDensityW, 3)} W/m²`
			: `${formatNumber(result.powerDensityW * 1000, 4)} mW/m²`
	);
</script>

<WidgetFrame
	title="Sendeleistung, EIRP und Feldstärke"
	description="Balkendiagramm der elektrischen Feldstärke in dBµV/m an fünf Vergleichsabständen; jede Verzehnfachung der Entfernung senkt den Pegel um 20 dB."
	footnote="Freiraum im Fernfeld: S = EIRP/(4π·d²), E = √(S·Z₀) ≈ √(30·EIRP)/d, Z₀ = 376,73 Ω. Reflexionen, Bewuchs und Bodeneinfluss sind nicht enthalten."
>
	<svg viewBox="0 0 {W} {H}" aria-hidden="true">
		{#each gridLines as level (level)}
			<line x1={PLOT_X0} y1={scaleY(level)} x2={PLOT_X1} y2={scaleY(level)} class="chart-grid-line" />
			<text x={PLOT_X0 - 10} y={scaleY(level) + 4} text-anchor="end" class="chart-axis-text">{level}</text>
		{/each}
		<text x={PLOT_X0 - 10} y={PLOT_Y0 - 12} text-anchor="end" class="chart-axis-text">dBµV/m</text>
		<line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} class="chart-axis-line" />

		{#each bars as bar, i (bar.distanceM)}
			<rect
				x={barX(i)}
				y={scaleY(bar.dbuv)}
				width={barWidth}
				height={Math.max(0, PLOT_Y1 - scaleY(bar.dbuv))}
				fill={bar.distanceM === distanceM ? 'var(--color-chart-orange)' : 'var(--color-chart-blue)'}
				opacity={bar.distanceM === distanceM ? 1 : 0.7}
			/>
			<text x={barX(i) + barWidth / 2} y={scaleY(bar.dbuv) - 6} text-anchor="middle" class="chart-axis-text">
				{formatNumber(bar.dbuv, 0)}
			</text>
			<text x={barX(i) + barWidth / 2} y={PLOT_Y1 + 20} text-anchor="middle" class="chart-axis-text">
				{formatDistance(bar.distanceM, 0)}
			</text>
		{/each}
		<text x={(PLOT_X0 + PLOT_X1) / 2} y={H - 8} text-anchor="middle" class="chart-axis-text">
			Abstand zur Antenne
		</text>
	</svg>

	{#snippet dataTable()}
		<table>
			<caption>Feldstärke und Pegel des eingestellten Arbeitspunkts</caption>
			<tbody>
				<tr><th>Sendeleistung</th><td>{formatPowerWatts(txPowerW, 3)}</td></tr>
				<tr><th>Antennengewinn</th><td>{formatNumber(gainDbi, 1)} dBi</td></tr>
				<tr><th>Abstand</th><td>{formatDistance(distanceM, 0)}</td></tr>
				<tr><th>EIRP</th><td>{formatPowerWatts(result.eirpW, 2)} ({formatNumber(result.eirpDbm, 1)} dBm)</td></tr>
				<tr><th>ERP</th><td>{formatPowerWatts(result.erpW, 2)} ({formatNumber(result.erpDbm, 1)} dBm)</td></tr>
				<tr><th>Leistungsdichte</th><td>{densityLabel}</td></tr>
				<tr><th>Feldstärke</th><td>{fieldLabel} · {dbuvLabel}</td></tr>
				<tr><th>Magnetische Feldstärke</th><td>{formatNumber(result.magneticAPerM * 1000, 3)} mA/m</td></tr>
			</tbody>
			<tfoot>
				{#each bars as bar (bar.distanceM)}
					<tr><th>Feldstärke in {formatDistance(bar.distanceM, 0)}</th><td>{formatNumber(bar.dbuv, 1)} dBµV/m</td></tr>
				{/each}
			</tfoot>
		</table>
	{/snippet}

	{#snippet controls()}
		<Slider
			label="Sendeleistung P"
			bind:value={txPowerW}
			min={FIELD_STRENGTH_LIMITS.txPowerW.min}
			max={FIELD_STRENGTH_LIMITS.txPowerW.max}
			scale="log"
			format={(v) => formatPowerWatts(v, 2)}
			unitSymbol="W"
		/>
		<Slider
			label="Antennengewinn G"
			bind:value={gainDbi}
			min={FIELD_STRENGTH_LIMITS.gainDbi.min}
			max={FIELD_STRENGTH_LIMITS.gainDbi.max}
			step={0.5}
			format={(v) => `${formatNumber(v, 1)} dBi`}
			unitSymbol="dBi"
		/>
		<Slider
			label="Abstand d"
			bind:value={distanceM}
			min={FIELD_STRENGTH_LIMITS.distanceM.min}
			max={FIELD_STRENGTH_LIMITS.distanceM.max}
			scale="log"
			format={(v) => formatDistance(v, 0)}
			unitSymbol="m"
		/>
	{/snippet}

	{#snippet results()}
		<ResultCard label="EIRP = P · G" value={formatPowerWatts(result.eirpW, 2)} secondary="= {formatNumber(result.eirpDbm, 1)} dBm" copyable={false} />
		<ResultCard label="ERP = EIRP / 1,64" value={formatPowerWatts(result.erpW, 2)} hint="2,15 dB unter dem EIRP" copyable={false} />
		<ResultCard label="Leistungsdichte S" value={densityLabel} copyable={false} />
		<ResultCard label="Feldstärke E" value={fieldLabel} secondary="= {dbuvLabel}" emphasis="hero" copyable={false} />
	{/snippet}
</WidgetFrame>
