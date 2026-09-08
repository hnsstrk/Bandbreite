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
  'field-strength': FieldStrengthWidget
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
