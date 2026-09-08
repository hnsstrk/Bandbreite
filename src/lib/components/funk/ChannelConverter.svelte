<script lang="ts">
	/**
	 * Kanal-Umrechner für DAB+, DVB-T2 und UKW.
	 *
	 * Alle drei Systeme arbeiten mit festen Rastern; die Umrechnung ist deshalb
	 * in beide Richtungen eindeutig. Die Rechenregeln stehen in
	 * `broadcastChannels.svelte.ts`, die Kanaltabellen in `data/broadcast.ts`.
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import ResultCard from '$lib/components/ui/ResultCard.svelte';
	import { DAB_BLOCKS, DVBT2_CHANNELS } from '$lib/data/broadcast';
	import { FREQUENCY_UNITS } from '$lib/data/units';
	import { formatFrequency } from '$lib/utils/formatting';
	import { formatFrequencyRange } from '$lib/data/bands';
	import {
		FM_BAND_MAX_HZ,
		FM_BAND_MIN_HZ,
		FM_CHANNEL_COUNT,
		dabBlock,
		dabBlockForFrequency,
		dvbT2Channel,
		dvbT2ChannelForFrequency,
		fmNearestRaster
	} from './broadcastChannels.svelte';

	const MHZ_UNITS = FREQUENCY_UNITS.filter((unit) => ['MHz', 'kHz'].includes(unit.id));

	let active = $state('dab');
	let blockId = $state('11C');
	let dabFrequency = $state(220.352e6);
	let dabUnit = $state('MHz');
	let channelId = $state('30');
	let tvFrequency = $state(546e6);
	let tvUnit = $state('MHz');
	let fmFrequency = $state(98.7e6);
	let fmUnit = $state('MHz');

	const tabs = [
		{ id: 'dab', label: 'DAB+ Block' },
		{ id: 'dvbt2', label: 'DVB-T2 Kanal' },
		{ id: 'ukw', label: 'UKW-Raster' }
	];

	const blockOptions = DAB_BLOCKS.map((entry) => ({
		value: entry.block,
		label: `Block ${entry.block}`
	}));

	const channelOptions = DVBT2_CHANNELS.map((entry) => ({
		value: String(entry.channel),
		label: `Kanal ${entry.channel}`
	}));

	const block = $derived(dabBlock(blockId));
	const blockHit = $derived(dabBlockForFrequency(dabFrequency));
	const channel = $derived(dvbT2Channel(Number(channelId)));
	const channelHit = $derived(dvbT2ChannelForFrequency(tvFrequency));
	const fmHit = $derived(fmNearestRaster(fmFrequency));
</script>

<Card title="Kanal und Frequenz umrechnen" subtitle="DAB+, DVB-T2 und das UKW-Kanalraster">
	<Tabs {tabs} bind:active label="Rundfunksystem">
		{#snippet panel(id)}
			{#if id === 'dab'}
				<div class="pane">
					<div class="fields">
						<Select label="DAB-Block" bind:value={blockId} options={blockOptions} />
						<NumberInput
							label="Frequenz nachschlagen"
							bind:value={dabFrequency}
							bind:unit={dabUnit}
							units={MHZ_UNITS}
							min={174e6}
							max={230e6}
						/>
					</div>
					<div class="results">
						<ResultCard
							label="Blockmitte {block?.label ?? ''}"
							value={block ? formatFrequency(block.centerHz, 3) : '—'}
							secondary={block ? formatFrequencyRange(block.minHz, block.maxHz) : undefined}
							hint="Blockbreite 1,536 MHz"
						/>
						<ResultCard
							label="Block bei {formatFrequency(dabFrequency, 3)}"
							value={blockHit?.label ?? 'kein Block'}
							secondary={blockHit
								? formatFrequencyRange(blockHit.minHz, blockHit.maxHz)
								: 'außerhalb der Blöcke 5A bis 12D'}
						/>
					</div>
					<p class="note">
						Ein DAB-Ensemble belegt immer einen ganzen Block und trägt darin mehrere Programme
						im Zeitmultiplex. Alle Sender eines Gleichwellennetzes senden denselben Block mit
						demselben Inhalt und synchronisiert — der Empfänger wertet die Echos als Gewinn.
					</p>
				</div>
			{:else if id === 'dvbt2'}
				<div class="pane">
					<div class="fields">
						<Select label="UHF-Kanal" bind:value={channelId} options={channelOptions} />
						<NumberInput
							label="Frequenz nachschlagen"
							bind:value={tvFrequency}
							bind:unit={tvUnit}
							units={MHZ_UNITS}
							min={470e6}
							max={694e6}
						/>
					</div>
					<div class="results">
						<ResultCard
							label="Kanalmitte {channel?.label ?? ''}"
							value={channel ? formatFrequency(channel.centerHz, 0) : '—'}
							secondary={channel
								? formatFrequencyRange(channel.minHz, channel.maxHz)
								: undefined}
							hint="Kanalbreite 8 MHz"
						/>
						<ResultCard
							label="Kanal bei {formatFrequency(tvFrequency, 1)}"
							value={channelHit?.label ?? 'kein Kanal'}
							secondary={channelHit
								? formatFrequencyRange(channelHit.minHz, channelHit.maxHz)
								: 'außerhalb der Kanäle 21 bis 48'}
						/>
					</div>
					<p class="note">
						Die Kanalmitte folgt der Regel 306 MHz + 8 MHz · Kanalnummer. Seit der Umwidmung
						des 700-MHz-Bereichs endet der Fernsehbereich bei 694 MHz, also mit Kanal 48.
					</p>
				</div>
			{:else}
				<div class="pane">
					<div class="fields">
						<NumberInput
							label="UKW-Frequenz"
							bind:value={fmFrequency}
							bind:unit={fmUnit}
							units={MHZ_UNITS}
							min={FM_BAND_MIN_HZ}
							max={FM_BAND_MAX_HZ}
							slider
						/>
					</div>
					<div class="results">
						<ResultCard
							label="Nächster Rasterplatz"
							value={fmHit ? formatFrequency(fmHit.frequencyHz, 1) : '—'}
							secondary={fmHit ? `Platz ${fmHit.index} von ${FM_CHANNEL_COUNT}` : 'außerhalb von Band II'}
							hint="Raster 100 kHz ab 87,5 MHz"
						/>
						<ResultCard
							label="Abweichung vom Raster"
							value={fmHit ? formatFrequency(Math.abs(fmHit.offsetHz), 0) : '—'}
							hint={fmHit && Math.abs(fmHit.offsetHz) < 1
								? 'Frequenz liegt exakt auf dem Raster'
								: 'Sender arbeiten in Deutschland auf dem 100-kHz-Raster'}
						/>
					</div>
					<p class="note">
						Der Frequenzhub beträgt höchstens 75 kHz, das Modulationssignal reicht mit dem
						Stereo-Differenzsignal bis 53 kHz und mit RDS bis 57 kHz. Nach der Carson-Regel
						ergibt sich daraus eine belegte Bandbreite von rund 180 kHz; benachbarte Sender am
						selben Ort halten deshalb mehrere Rasterplätze Abstand.
					</p>
				</div>
			{/if}
		{/snippet}
	</Tabs>
</Card>

<style>
	.pane {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-top: 1rem;
	}

	.fields,
	.results {
		display: grid;
		gap: 1rem;
	}

	.note {
		margin: 0;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		color: var(--color-ink-muted);
	}

	@media (min-width: 48rem) {
		.fields,
		.results {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
