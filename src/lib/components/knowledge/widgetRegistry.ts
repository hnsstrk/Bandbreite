/**
 * Zuordnung der Widget-Kennungen aus den Inhaltsdaten zu Komponenten.
 * Neue Widgets werden hier registriert; die Inhalte referenzieren nur die ID.
 */
import type { Component } from 'svelte';
import type { WidgetId } from '$lib/content/types';
import RadarPulseWidget from '$lib/components/widgets/RadarPulseWidget.svelte';
import DopplerWidget from '$lib/components/widgets/DopplerWidget.svelte';
import RcsComparisonWidget from '$lib/components/widgets/RcsComparisonWidget.svelte';
import FresnelWidget from '$lib/components/widgets/FresnelWidget.svelte';
import DecibelPlayground from '$lib/components/widgets/DecibelPlayground.svelte';
import AttenuationWindowsWidget from '$lib/components/widgets/AttenuationWindowsWidget.svelte';
import PropagationSandbox from '$lib/components/widgets/PropagationSandbox.svelte';
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
  'wave-propagation-diagram': WavePropagationDiagram as unknown as Component,
  'ionospheric-propagation': IonosphericPropagation as unknown as Component
};
