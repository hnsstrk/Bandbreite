/**
 * Rechenmodell des Widgets „Ein- und Zweifrequenzbetrieb im UKW-Seefunk".
 *
 * Die Kanaltabelle steht in `$lib/data/maritimeChannels` (VO Funk, Appendix 18);
 * hier kommen nur die Einordnung eines Kanals und das Zeitbild der drei
 * Betriebsarten hinzu.
 *
 * Quellen:
 * - ITU Radio Regulations, Appendix 18: Kanalraster 25 kHz, Duplexabstand
 *   4,6 MHz zwischen Schiffs- und Küstenfrequenz.
 * - ITU-R M.1084: Ein- und Zweifrequenzbetrieb im UKW-Seefunk.
 */
import {
  findMaritimeChannel,
  MARITIME_DUPLEX_OFFSET_HZ,
  MARITIME_USAGE_LABELS,
  MARITIME_VHF_CHANNELS,
  MARITIME_VHF_MAX_HZ,
  MARITIME_VHF_MIN_HZ,
  type MaritimeChannel
} from '$lib/data/maritimeChannels';
import { safeDivide } from '$lib/utils/handlers';

/** Betriebsarten, die das Widget zeigt. */
export type MaritimeMode = 'simplex' | 'semiduplex' | 'duplex';

export const MARITIME_MODE_LABELS: Record<MaritimeMode, string> = {
  simplex: 'Wechselsprechen, eine Frequenz',
  semiduplex: 'Wechselsprechen, zwei Frequenzen',
  duplex: 'Gegensprechen, zwei Frequenzen'
};

export const MARITIME_MODE_NOTES: Record<MaritimeMode, string> = {
  simplex:
    'Schiff und Gegenstelle senden auf derselben Frequenz und müssen sich abwechseln. Alle Mithörenden bekommen beide Seiten des Gesprächs mit — deshalb laufen Not- und Anrufverkehr so.',
  semiduplex:
    'Die Küstenfunkstelle sendet auf der oberen Frequenz, das Schiff auf der unteren. Gesprochen wird trotzdem abwechselnd, weil das Bordgerät nicht gleichzeitig senden und empfangen kann.',
  duplex:
    'Beide Seiten senden gleichzeitig auf getrennten Frequenzen — Telefonieren wie an Land. Das verlangt eine Duplexweiche und ist Küstenfunkstellen vorbehalten.'
};

/** Frequenzband, in dem Schiffsfunkstellen senden (aus der Kanaltabelle). */
export function shipBandHz(): { minHz: number; maxHz: number } {
  const values = MARITIME_VHF_CHANNELS.map((channel) => channel.shipTxHz);
  return { minHz: Math.min(...values), maxHz: Math.max(...values) };
}

/** Frequenzband, in dem Küstenfunkstellen senden. */
export function coastBandHz(): { minHz: number; maxHz: number } {
  const values = MARITIME_VHF_CHANNELS.filter((c) => c.duplex).map((c) => c.coastTxHz);
  return { minHz: Math.min(...values), maxHz: Math.max(...values) };
}

/** Duplexabstand eines Kanals in Hz (0 bei Einfrequenzbetrieb). */
export function duplexOffsetHz(channel: MaritimeChannel): number {
  return channel.coastTxHz - channel.shipTxHz;
}

/** Betriebsarten, die ein Kanal zulässt. */
export function availableModes(channel: MaritimeChannel): MaritimeMode[] {
  return channel.duplex ? ['semiduplex', 'duplex'] : ['simplex'];
}

/** Lage einer Frequenz auf der Bandachse (0 … 1). */
export function bandFraction(
  frequencyHz: number,
  minHz: number = MARITIME_VHF_MIN_HZ,
  maxHz: number = MARITIME_VHF_MAX_HZ
): number {
  return Math.min(1, Math.max(0, safeDivide(frequencyHz - minHz, maxHz - minHz, 0)));
}

export interface TalkSlot {
  /** Wer sendet */
  who: 'schiff' | 'kueste';
  /** Anteil der dargestellten Zeit (0 … 1) */
  startFraction: number;
  endFraction: number;
  /** Frequenz, auf der gesendet wird, in Hz */
  frequencyHz: number;
}

/**
 * Zeitbild eines Gesprächs: Wer sendet wann und auf welcher Frequenz?
 * Im Wechselsprechen folgen die Beiträge aufeinander, im Gegensprechen laufen
 * sie gleichzeitig.
 */
export function talkSlots(channel: MaritimeChannel, mode: MaritimeMode): TalkSlot[] {
  const shipHz = channel.shipTxHz;
  const coastHz = mode === 'simplex' ? channel.shipTxHz : channel.coastTxHz;
  if (mode === 'duplex') {
    return [
      { who: 'schiff', startFraction: 0.05, endFraction: 0.95, frequencyHz: shipHz },
      { who: 'kueste', startFraction: 0.05, endFraction: 0.95, frequencyHz: coastHz }
    ];
  }
  return [
    { who: 'schiff', startFraction: 0.05, endFraction: 0.42, frequencyHz: shipHz },
    { who: 'kueste', startFraction: 0.5, endFraction: 0.9, frequencyHz: coastHz }
  ];
}

/** Kann in dieser Betriebsart gleichzeitig gesprochen werden? */
export function isSimultaneous(mode: MaritimeMode): boolean {
  return mode === 'duplex';
}

export interface MaritimeChannelInfo {
  channel: MaritimeChannel;
  usageLabel: string;
  offsetHz: number;
  modes: MaritimeMode[];
}

/** Zusammenfassung eines Kanals für die Anzeige. */
export function channelInfo(channelId: string): MaritimeChannelInfo | undefined {
  const channel = findMaritimeChannel(channelId);
  if (!channel) return undefined;
  return {
    channel,
    usageLabel: MARITIME_USAGE_LABELS[channel.usage],
    offsetHz: duplexOffsetHz(channel),
    modes: availableModes(channel)
  };
}

/** Der in der VO Funk festgelegte Duplexabstand. */
export const MARITIME_OFFSET_HZ = MARITIME_DUPLEX_OFFSET_HZ;
