/**
 * Rechenmodell des Seefunk-Widgets „Ein- und Zweifrequenzbetrieb".
 * Referenz: ITU Radio Regulations, Appendix 18 (Kanalraster 25 kHz,
 * Duplexabstand 4,6 MHz) und die Kanaltabelle in `$lib/data/maritimeChannels`.
 */
import { describe, it, expect } from 'vitest';
import {
  availableModes,
  bandFraction,
  channelInfo,
  coastBandHz,
  duplexOffsetHz,
  isSimultaneous,
  shipBandHz,
  talkSlots,
  MARITIME_MODE_LABELS,
  MARITIME_OFFSET_HZ
} from '$lib/components/widgets/MaritimeDuplexModel';
import {
  findMaritimeChannel,
  MARITIME_DISTRESS_VHF_HZ,
  MARITIME_DSC_VHF_HZ,
  MARITIME_DUPLEX_OFFSET_HZ,
  MARITIME_VHF_CHANNELS,
  MARITIME_VHF_MAX_HZ,
  MARITIME_VHF_MIN_HZ
} from '$lib/data/maritimeChannels';

describe('Kanaleinordnung', () => {
  it('Kanal 16 ist Einfrequenzbetrieb auf 156,800 MHz', () => {
    const info = channelInfo('16');
    expect(info?.channel.shipTxHz).toBe(MARITIME_DISTRESS_VHF_HZ);
    expect(info?.channel.coastTxHz).toBe(MARITIME_DISTRESS_VHF_HZ);
    expect(info?.offsetHz).toBe(0);
    expect(info?.modes).toEqual(['simplex']);
  });

  it('Kanal 70 (Selektivruf) ist ebenfalls einfrequent', () => {
    const info = channelInfo('70');
    expect(info?.channel.shipTxHz).toBe(MARITIME_DSC_VHF_HZ);
    expect(info?.channel.duplex).toBe(false);
  });

  it('Kanal 26 ist Zweifrequenzbetrieb mit 4,6 MHz Abstand', () => {
    const info = channelInfo('26');
    expect(info?.channel.shipTxHz).toBe(157_300_000);
    expect(info?.channel.coastTxHz).toBe(161_900_000);
    expect(info?.offsetHz).toBe(MARITIME_DUPLEX_OFFSET_HZ);
    expect(MARITIME_OFFSET_HZ).toBe(4_600_000);
    expect(info?.modes).toEqual(['semiduplex', 'duplex']);
  });

  it('jeder Zweifrequenzkanal hält denselben Duplexabstand', () => {
    const duplex = MARITIME_VHF_CHANNELS.filter((channel) => channel.duplex);
    expect(duplex.length).toBeGreaterThan(20);
    for (const channel of duplex) {
      expect(duplexOffsetHz(channel), `Kanal ${channel.channel}`).toBe(MARITIME_DUPLEX_OFFSET_HZ);
    }
  });

  it('unbekannte Kanäle liefern nichts', () => {
    expect(channelInfo('999')).toBeUndefined();
  });
});

describe('Bänder und Achsenlage', () => {
  it('Schiffs- und Küstenband liegen um den Duplexabstand versetzt', () => {
    const ship = shipBandHz();
    const coast = coastBandHz();
    expect(ship.minHz).toBe(156_025_000);
    expect(coast.minHz - ship.minHz).toBe(MARITIME_DUPLEX_OFFSET_HZ);
    expect(coast.maxHz).toBeLessThanOrEqual(MARITIME_VHF_MAX_HZ);
    expect(ship.minHz).toBeGreaterThanOrEqual(MARITIME_VHF_MIN_HZ);
  });

  it('bandFraction bleibt zwischen 0 und 1', () => {
    expect(bandFraction(MARITIME_VHF_MIN_HZ)).toBe(0);
    expect(bandFraction(MARITIME_VHF_MAX_HZ)).toBe(1);
    expect(bandFraction(0)).toBe(0);
    expect(bandFraction(1e12)).toBe(1);
  });
});

describe('Zeitbild des Gesprächs', () => {
  const simplexChannel = findMaritimeChannel('16')!;
  const duplexChannel = findMaritimeChannel('26')!;

  it('im Einfrequenzbetrieb senden beide nacheinander auf derselben Frequenz', () => {
    const slots = talkSlots(simplexChannel, 'simplex');
    expect(slots).toHaveLength(2);
    expect(slots[0].frequencyHz).toBe(slots[1].frequencyHz);
    expect(slots[0].endFraction).toBeLessThanOrEqual(slots[1].startFraction);
    expect(isSimultaneous('simplex')).toBe(false);
  });

  it('im Wechselsprechen mit zwei Frequenzen bleibt die Reihenfolge, die Frequenz wechselt', () => {
    const slots = talkSlots(duplexChannel, 'semiduplex');
    expect(slots[0].frequencyHz).toBe(duplexChannel.shipTxHz);
    expect(slots[1].frequencyHz).toBe(duplexChannel.coastTxHz);
    expect(slots[0].endFraction).toBeLessThanOrEqual(slots[1].startFraction);
    expect(isSimultaneous('semiduplex')).toBe(false);
  });

  it('im Gegensprechen überlappen sich beide Beiträge', () => {
    const slots = talkSlots(duplexChannel, 'duplex');
    expect(slots[0].startFraction).toBe(slots[1].startFraction);
    expect(slots[0].frequencyHz).not.toBe(slots[1].frequencyHz);
    expect(isSimultaneous('duplex')).toBe(true);
  });

  it('jede Betriebsart trägt eine Beschriftung', () => {
    for (const mode of availableModes(duplexChannel)) {
      expect(MARITIME_MODE_LABELS[mode].length).toBeGreaterThan(10);
    }
  });
});
