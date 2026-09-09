/**
 * Rechenmodell des Widgets „UKW-Stereo-Multiplex".
 *
 * Das Basisbandsignal (MPX) eines UKW-Senders trägt vier Anteile: Summensignal,
 * Pilotton, Differenzsignal und RDS. Wie breit die Aussendung dadurch wird,
 * sagt die Carson-Regel.
 *
 * Quellen:
 * - ITU-R BS.450-4: UKW-Hörfunk, Hub 75 kHz, Pilotton 19 kHz, Hilfsträger 38 kHz.
 * - IEC 62106 (RDS): Hilfsträger 57 kHz, Bandbreite ±2,4 kHz.
 * - Kanalraster und Hubgrenze aus `$lib/data/broadcast`, Carson-Formel aus
 *   `$lib/data/modulation`.
 */
import {
  FM_CHANNEL_RASTER_HZ,
  FM_MAX_AUDIO_HZ,
  FM_MAX_DEVIATION_HZ,
  FM_PILOT_TONE_HZ,
  RDS_SUBCARRIER_HZ
} from '$lib/data/broadcast';
import { carsonBandwidthHz, fmModulationIndex } from '$lib/data/modulation';
import { safeDivide } from '$lib/utils/handlers';

/** Hilfsträger des Differenzsignals: das Doppelte des Pilottons (38 kHz). */
export const STEREO_SUBCARRIER_HZ = 2 * FM_PILOT_TONE_HZ;

/** Halbe Bandbreite des RDS-Signals um 57 kHz (IEC 62106). */
export const RDS_HALF_BANDWIDTH_HZ = 2400;

/** Obere Grenze der gezeichneten Basisbandachse in Hz. */
export const MPX_AXIS_MAX_HZ = 62e3;

export type MpxKind = 'band' | 'line' | 'carrier';

export interface MpxComponent {
  id: string;
  label: string;
  kind: MpxKind;
  minHz: number;
  maxHz: number;
  noteDE: string;
}

/** Die Anteile des Multiplexsignals in ihrer Lage im Basisband. */
export const MPX_COMPONENTS: MpxComponent[] = [
  {
    id: 'summe',
    label: 'Summensignal L+R',
    kind: 'band',
    minHz: 0,
    maxHz: FM_MAX_AUDIO_HZ,
    noteDE: 'Monokompatibel: Ein einfacher Empfänger wertet nur diesen Anteil aus.'
  },
  {
    id: 'pilot',
    label: 'Pilotton',
    kind: 'line',
    minHz: FM_PILOT_TONE_HZ,
    maxHz: FM_PILOT_TONE_HZ,
    noteDE: 'Zeigt an, dass ein Stereosignal vorliegt, und liefert die Phase für den Hilfsträger.'
  },
  {
    id: 'differenz',
    label: 'Differenzsignal L−R',
    kind: 'band',
    minHz: STEREO_SUBCARRIER_HZ - FM_MAX_AUDIO_HZ,
    maxHz: STEREO_SUBCARRIER_HZ + FM_MAX_AUDIO_HZ,
    noteDE:
      'Zweiseitenband mit unterdrücktem Träger um 38 kHz; erst L+R und L−R zusammen ergeben die beiden Kanäle.'
  },
  {
    id: 'rds',
    label: 'RDS',
    kind: 'band',
    minHz: RDS_SUBCARRIER_HZ - RDS_HALF_BANDWIDTH_HZ,
    maxHz: RDS_SUBCARRIER_HZ + RDS_HALF_BANDWIDTH_HZ,
    noteDE:
      'Sendername, Verkehrsfunkkennung und Alternativfrequenzen auf dem dritten Vielfachen des Pilottons.'
  }
];

export interface MpxMode {
  id: string;
  label: string;
  /** Höchste Frequenz im Basisband in Hz — sie geht in die Carson-Regel ein */
  maxBasebandHz: number;
  /** Anteile, die in dieser Betriebsart gesendet werden */
  componentIds: string[];
}

/** Die drei Betriebsarten, die das Widget vergleicht. */
export const MPX_MODES: MpxMode[] = [
  { id: 'mono', label: 'Mono', maxBasebandHz: FM_MAX_AUDIO_HZ, componentIds: ['summe'] },
  {
    id: 'stereo',
    label: 'Stereo',
    maxBasebandHz: STEREO_SUBCARRIER_HZ + FM_MAX_AUDIO_HZ,
    componentIds: ['summe', 'pilot', 'differenz']
  },
  {
    id: 'stereo-rds',
    label: 'Stereo mit RDS',
    maxBasebandHz: RDS_SUBCARRIER_HZ + RDS_HALF_BANDWIDTH_HZ,
    componentIds: ['summe', 'pilot', 'differenz', 'rds']
  }
];

export interface FmMultiplexResult {
  mode: MpxMode;
  /** Höchste Basisbandfrequenz f_max in Hz */
  maxBasebandHz: number;
  /** Belegte Bandbreite nach Carson in Hz */
  bandwidthHz: number;
  /** Modulationsindex Δf / f_max */
  modulationIndex: number;
  /** Belegte Bandbreite in Vielfachen des 100-kHz-Rasters */
  rasterSlots: number;
  /** Reicht das Kanalraster für zwei Sender auf benachbarten Rasterplätzen? */
  fitsInRaster: boolean;
}

export function computeFmMultiplex(
  deviationHz: number,
  modeId: string = 'stereo-rds'
): FmMultiplexResult {
  const mode = MPX_MODES.find((entry) => entry.id === modeId) ?? MPX_MODES[1];
  const bandwidthHz = carsonBandwidthHz(deviationHz, mode.maxBasebandHz);
  return {
    mode,
    maxBasebandHz: mode.maxBasebandHz,
    bandwidthHz,
    modulationIndex: fmModulationIndex(deviationHz, mode.maxBasebandHz),
    rasterSlots: safeDivide(bandwidthHz, FM_CHANNEL_RASTER_HZ, 0),
    fitsInRaster: bandwidthHz <= FM_CHANNEL_RASTER_HZ
  };
}

/** Anteile einer Betriebsart in Zeichenreihenfolge. */
export function componentsForMode(mode: MpxMode): MpxComponent[] {
  return MPX_COMPONENTS.filter((component) => mode.componentIds.includes(component.id));
}

/** Voreinstellung des Hubreglers: der zulässige Höchsthub. */
export const FM_DEVIATION_LIMITS = {
  min: 10e3,
  max: FM_MAX_DEVIATION_HZ,
  default: FM_MAX_DEVIATION_HZ
} as const;
