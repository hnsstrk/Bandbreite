<script lang="ts">
	/**
	 * Frequenzlineal über 100 kHz des VHF-Flugfunkbandes.
	 *
	 * Es zeigt den Kern des 8,33-kHz-Rasters: Jeder 25-kHz-Rasterplatz trägt
	 * drei Kanäle, deren Bezeichnungen (…05, …10, …15) nicht mit ihren
	 * Frequenzen übereinstimmen.
	 */
	import { VHF_SPACING_25_HZ, VHF_SPACING_833_HZ } from '$lib/data/aviationBands';
	import { formatFixed } from '$lib/utils/formatting';

	interface Props {
		/** Ganzzahliger MHz-Anteil, z. B. 118. */
		megahertz: number;
		/** Aktuell gewählte Kanalbezeichnung, z. B. „118.010". */
		selected?: string;
		/** Kanäle des dargestellten Abschnitts. */
		channels: { designator: string; frequencyHz: number; spacingHz: number }[];
	}

	let { megahertz, selected, channels }: Props = $props();

	const W = 800;
	const H = 210;
	const X0 = 56;
	const X1 = 764;
	const AXIS_Y = 132;
	/** Dargestellter Ausschnitt in Hz (100 kHz). */
	const SPAN_HZ = 100_000;
	/** Zahl der 25-kHz-Rasterplätze im Ausschnitt. */
	const SLOTS = SPAN_HZ / VHF_SPACING_25_HZ;

	const baseHz = $derived(megahertz * 1e6);
	const xOf = (hz: number) => X0 + ((hz - baseHz) / SPAN_HZ) * (X1 - X0);

	/** Grenzen der 25-kHz-Rasterplätze. */
	const slots = Array.from({ length: SLOTS }, (_, i) => ({
		index: i,
		startHz: i * VHF_SPACING_25_HZ,
		label: `${i * VHF_SPACING_25_HZ / 1000} kHz`
	}));

	const marks = $derived(
		channels.map((channel) => ({
			...channel,
			x: xOf(channel.frequencyHz),
			active: channel.designator === selected,
			wide: channel.spacingHz === VHF_SPACING_25_HZ
		}))
	);
</script>

<svg viewBox="0 0 {W} {H}" aria-hidden="true">
	<!-- 25-kHz-Rasterplätze als Hintergrund -->
	{#each slots as slot (slot.index)}
		<rect
			x={xOf(baseHz + slot.startHz)}
			y="40"
			width={(X1 - X0) / SLOTS}
			height={AXIS_Y - 40}
			fill={slot.index % 2 === 0 ? 'var(--color-elevated)' : 'var(--color-surface)'}
		/>
		<text
			x={xOf(baseHz + slot.startHz) + (X1 - X0) / SLOTS / 2}
			y="32"
			text-anchor="middle"
			class="chart-axis-text"
		>
			25-kHz-Platz {slot.label}
		</text>
	{/each}

	<line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} class="chart-axis-line" />

	{#each marks as mark (mark.designator)}
		<line
			x1={mark.x}
			y1={mark.wide ? 52 : 70}
			x2={mark.x}
			y2={AXIS_Y}
			stroke={mark.active ? 'var(--color-brand)' : 'var(--color-ink-subtle)'}
			stroke-width={mark.active ? 3 : 1.5}
		/>
		{#if !mark.wide}
			<text
				x={mark.x}
				y={AXIS_Y + 18}
				text-anchor="middle"
				class="tick"
				class:tick--active={mark.active}
			>
				{mark.designator.slice(-3)}
			</text>
		{/if}
		{#if mark.active}
			<text x={mark.x} y="62" text-anchor="middle" class="tick tick--active">
				{formatFixed(mark.frequencyHz / 1e6, 6)} MHz
			</text>
		{/if}
	{/each}

	<text x={X0} y={AXIS_Y + 44} class="chart-axis-text">{megahertz},000 MHz</text>
	<text x={X1} y={AXIS_Y + 44} text-anchor="end" class="chart-axis-text">
		{megahertz},100 MHz
	</text>
	<text x={(X0 + X1) / 2} y={H - 8} text-anchor="middle" class="chart-axis-text">
		Kanalbezeichnung (letzte drei Stellen) · drei Kanäle im Abstand {formatFixed(
			VHF_SPACING_833_HZ / 1000,
			2
		)} kHz je Rasterplatz
	</text>
</svg>

<style>
	.tick {
		font-size: 0.75rem;
		font-family: var(--font-mono);
		fill: var(--color-ink-muted);
	}

	.tick--active {
		fill: var(--color-brand);
		font-weight: var(--font-weight-semibold);
	}
</style>
