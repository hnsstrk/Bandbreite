/**
 * Zuordnung der Widget-Kennungen aus den Inhaltsdaten zu Komponenten.
 * Neue Widgets werden hier registriert; die Inhalte referenzieren nur die ID.
 *
 * Die **Metadaten** eines Widgets (Bezeichnung, Beschreibung, Stichworte,
 * Kapitel) stehen in `$lib/data/widgets.ts` — dort ohne Komponentenimporte,
 * damit der Suchindex sie laden kann, ohne alle Widgets in den Bündel zu
 * ziehen. Ein neues Widget braucht deshalb zwei Zeilen: die Komponente hier,
 * die Metadaten dort.
 */
import type { Component } from 'svelte';
import type { WidgetId } from '$lib/content/types';
import RadarPulseWidget from '$lib/components/widgets/RadarPulseWidget.svelte';
import DopplerWidget from '$lib/components/widgets/DopplerWidget.svelte';
import RcsComparisonWidget from '$lib/components/widgets/RcsComparisonWidget.svelte';
import FresnelWidget from '$lib/components/widgets/FresnelWidget.svelte';
import DecibelPlayground from '$lib/components/widgets/DecibelPlayground.svelte';
import EmWaveWidget from '$lib/components/widgets/EmWaveWidget.svelte';
import FieldStrengthWidget from '$lib/components/widgets/FieldStrengthWidget.svelte';
import AttenuationWindowsWidget from '$lib/components/widgets/AttenuationWindowsWidget.svelte';
import PropagationSandbox from '$lib/components/widgets/PropagationSandbox.svelte';
import FmcwWidget from '$lib/components/widgets/FmcwWidget.svelte';
import BlindSpeedWidget from '$lib/components/widgets/BlindSpeedWidget.svelte';
import SsrInterrogationWidget from '$lib/components/widgets/SsrInterrogationWidget.svelte';
import WavePropagationDiagram from '$lib/components/charts/WavePropagationDiagram.svelte';
import IonosphericPropagation from '$lib/components/charts/IonosphericPropagation.svelte';
import NearFarFieldWidget from '$lib/components/widgets/NearFarFieldWidget.svelte';
import PolarizationLossWidget from '$lib/components/widgets/PolarizationLossWidget.svelte';
import LogLinearWidget from '$lib/components/widgets/LogLinearWidget.svelte';
import InverseSquareWidget from '$lib/components/widgets/InverseSquareWidget.svelte';
import PhasorWidget from '$lib/components/widgets/PhasorWidget.svelte';
import FourierSynthesisWidget from '$lib/components/widgets/FourierSynthesisWidget.svelte';
import TwoRayWidget from '$lib/components/widgets/TwoRayWidget.svelte';
import IonosphereDayNightWidget from '$lib/components/widgets/IonosphereDayNightWidget.svelte';
import CellReuseWidget from '$lib/components/widgets/CellReuseWidget.svelte';
import FmMultiplexWidget from '$lib/components/widgets/FmMultiplexWidget.svelte';
import DabSfnWidget from '$lib/components/widgets/DabSfnWidget.svelte';
import ModeBandwidthWidget from '$lib/components/widgets/ModeBandwidthWidget.svelte';
import VorWidget from '$lib/components/widgets/VorWidget.svelte';
import LeoPassWidget from '$lib/components/widgets/LeoPassWidget.svelte';
import MaritimeDuplexWidget from '$lib/components/widgets/MaritimeDuplexWidget.svelte';
import RadarRangeWidget from '$lib/components/widgets/RadarRangeWidget.svelte';
import PulseCompressionWidget from '$lib/components/widgets/PulseCompressionWidget.svelte';
import ModeSFrameWidget from '$lib/components/widgets/ModeSFrameWidget.svelte';
import RadioServiceFlowWidget from '$lib/components/widgets/RadioServiceFlowWidget.svelte';
import BosAlarmChainWidget from '$lib/components/widgets/BosAlarmChainWidget.svelte';
import CospasSarsatChainWidget from '$lib/components/widgets/CospasSarsatChainWidget.svelte';
import FddTddWidget from '$lib/components/widgets/FddTddWidget.svelte';
import AmateurBandOpeningsWidget from '$lib/components/widgets/AmateurBandOpeningsWidget.svelte';

export const WIDGETS: Record<WidgetId, Component> = {
  'radar-pulse': RadarPulseWidget,
  doppler: DopplerWidget,
  'rcs-comparison': RcsComparisonWidget,
  fresnel: FresnelWidget,
  decibel: DecibelPlayground,
  'attenuation-windows': AttenuationWindowsWidget,
  'propagation-sandbox': PropagationSandbox,
  fmcw: FmcwWidget,
  'blind-speed': BlindSpeedWidget,
  'ssr-interrogation': SsrInterrogationWidget,
  'wave-propagation-diagram': WavePropagationDiagram as unknown as Component,
  'ionospheric-propagation': IonosphericPropagation as unknown as Component,
  'em-wave': EmWaveWidget,
  'field-strength': FieldStrengthWidget,
  'near-far-field': NearFarFieldWidget,
  'polarization-loss': PolarizationLossWidget,
  'log-linear': LogLinearWidget,
  'inverse-square': InverseSquareWidget,
  phasor: PhasorWidget,
  'fourier-synthesis': FourierSynthesisWidget,
  'two-ray': TwoRayWidget,
  'ionosphere-day-night': IonosphereDayNightWidget,
  'cell-reuse': CellReuseWidget,
  'fm-multiplex': FmMultiplexWidget,
  'dab-sfn': DabSfnWidget,
  'mode-bandwidth': ModeBandwidthWidget,
  'vor-radial': VorWidget,
  'leo-pass': LeoPassWidget,
  'maritime-duplex': MaritimeDuplexWidget,
  'radar-range': RadarRangeWidget,
  'pulse-compression': PulseCompressionWidget,
  'mode-s-frame': ModeSFrameWidget,
  'radio-service-flow': RadioServiceFlowWidget,
  'bos-alarm-chain': BosAlarmChainWidget,
  'cospas-sarsat-chain': CospasSarsatChainWidget,
  'fdd-tdd': FddTddWidget,
  'amateur-band-openings': AmateurBandOpeningsWidget
};

// Metadaten (Bezeichnung, Kapitel, Stichworte) für Komponenten weiterreichen,
// damit sie nur einen Import brauchen.
export {
  WIDGET_ENTRIES,
  WIDGET_META,
  WIDGET_PARAM,
  findWidget,
  parseWidgetParam,
  widgetAnchorId,
  widgetHref,
  widgetLabel,
  widgetLocations,
  type WidgetMeta
} from '$lib/data/widgets';
