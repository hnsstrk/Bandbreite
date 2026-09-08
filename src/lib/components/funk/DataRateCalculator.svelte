<script lang="ts">
	/**
	 * Kleiner Rechner „Bandbreite → theoretische Datenrate“.
	 *
	 * R = B · η · N. Der Rechner zeigt, warum Bandbreite im Mobilfunk die
	 * knappe Größe ist: die spektrale Effizienz lässt sich nur begrenzt
	 * steigern, die Anzahl der räumlichen Ströme ebenfalls.
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import ResultCard from '$lib/components/ui/ResultCard.svelte';
	import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
	import { FREQUENCY_UNITS } from '$lib/data/units';
	import { formatFrequency } from '$lib/utils/formatting';
	import { EFFICIENCY_PRESETS, dataRateBps, formatDataRate } from './mobileBands.svelte';

	const BANDWIDTH_UNITS = FREQUENCY_UNITS.filter((unit) =>
		['kHz', 'MHz', 'GHz'].includes(unit.id)
	);

	let bandwidth = $state(100e6);
	let bandwidthUnit = $state('MHz');
	let efficiencyId = $state('mittel');
	let layers = $state(4);

	const efficiency = $derived(
		EFFICIENCY_PRESETS.find((preset) => preset.id === efficiencyId) ?? EFFICIENCY_PRESETS[1]
	);
	const rate = $derived(dataRateBps(bandwidth, efficiency.value, layers));
	const singleLayerRate = $derived(dataRateBps(bandwidth, efficiency.value, 1));

	const efficiencyChoices = EFFICIENCY_PRESETS.map((preset) => ({
		value: preset.id,
		label: `${preset.label} — ${preset.value.toLocaleString('de-DE')} bit/s je Hz`
	}));

	const layerChoices = [1, 2, 4, 8].map((count) => ({
		value: String(count),
		label: count === 1 ? '1 Strom (SISO)' : `${count} Ströme (MIMO ${count}×${count})`
	}));
</script>

<Card title="Bandbreite → Datenrate" subtitle="Brutto-Abschätzung ohne Protokoll- und Signalisierungsanteile">
	<div class="grid">
		<NumberInput
			label="Kanalbandbreite"
			bind:value={bandwidth}
			bind:unit={bandwidthUnit}
			units={BANDWIDTH_UNITS}
			min={1e5}
			max={2e9}
			slider
			sliderScale="log"
			presets={[
				{ label: '20 MHz (LTE)', value: 20e6 },
				{ label: '100 MHz (n78)', value: 100e6 },
				{ label: '400 MHz (mmWave)', value: 400e6 }
			]}
		/>
		<Select
			label="Spektrale Effizienz"
			bind:value={efficiencyId}
			options={efficiencyChoices}
			hint={efficiency.hint}
		/>
		<Select
			label="Räumliche Ströme"
			bind:value={
				() => String(layers), (next: string) => (layers = Number(next))
			}
			options={layerChoices}
			hint="Jeder zusätzliche Strom vervielfacht die Rate nur bei ausreichend gutem Kanal."
		/>
	</div>

	<div class="results">
		<ResultCard
			label="Theoretische Datenrate"
			value={formatDataRate(rate)}
			emphasis="hero"
			secondary="{formatFrequency(bandwidth, 0)} · {efficiency.value.toLocaleString(
				'de-DE'
			)} bit/s je Hz · {layers} {layers === 1 ? 'Strom' : 'Ströme'}"
		/>
		<ResultCard
			label="Je Strom"
			value={formatDataRate(singleLayerRate)}
			hint="Ohne MIMO-Gewinn"
		/>
	</div>

	<FormulaBlock
		formula="R = B · η · N"
		alt="R gleich B mal eta mal N"
		label="Bruttodatenrate einer Funkstrecke"
		variables={[
			{ symbol: 'R', meaning: 'Bruttodatenrate', unit: 'bit/s' },
			{ symbol: 'B', meaning: 'Kanalbandbreite', unit: 'Hz' },
			{ symbol: 'η', meaning: 'Spektrale Effizienz', unit: 'bit/s je Hz' },
			{ symbol: 'N', meaning: 'Anzahl räumlicher Ströme', unit: '—' }
		]}
	/>

	<p class="note">
		Die obere Schranke liefert Shannon: η ist durch log₂(1 + SNR) begrenzt. Reale Netze bleiben
		darunter, weil Kanalkodierung, Referenzsignale, Steuerkanäle und Schutzintervalle Anteile
		der Übertragung belegen.
	</p>
</Card>

<style>
	.grid {
		display: grid;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.results {
		display: grid;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.note {
		margin: 1rem 0 0;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-ink-muted);
	}

	@media (min-width: 48rem) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}

		.results {
			grid-template-columns: 2fr 1fr;
		}
	}
</style>
