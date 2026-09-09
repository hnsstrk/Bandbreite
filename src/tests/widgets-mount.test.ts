// @vitest-environment node
/**
 * Render-Tests (SSR): Die Wissen-Widgets und die vier Kapitel rendern ohne Fehler,
 * enthalten SVG, Regler, sr-only-Wertetabellen, korrekte Überschriftenhierarchie
 * und eindeutige IDs.
 *
 * Läuft bewusst in der Node-Umgebung: Dann kompiliert Vite die Komponenten für den
 * Server und `render` aus 'svelte/server' liefert das fertige HTML, das per JSDOM
 * geprüft wird (in der jsdom-Umgebung würden die Komponenten als Client-Code
 * kompiliert und `mount` wäre wegen der Server-Auflösung von 'svelte' nicht verfügbar).
 */
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
// @ts-expect-error – jsdom ist nur als Laufzeit-Abhängigkeit der Testumgebung vorhanden (keine Typen)
import { JSDOM } from 'jsdom';
import type { Component } from 'svelte';
import RadarPulseWidget from '$lib/components/widgets/RadarPulseWidget.svelte';
import DopplerWidget from '$lib/components/widgets/DopplerWidget.svelte';
import RcsComparisonWidget from '$lib/components/widgets/RcsComparisonWidget.svelte';
import FresnelWidget from '$lib/components/widgets/FresnelWidget.svelte';
import DecibelPlayground from '$lib/components/widgets/DecibelPlayground.svelte';
import AttenuationWindowsWidget from '$lib/components/widgets/AttenuationWindowsWidget.svelte';
import PropagationSandbox from '$lib/components/widgets/PropagationSandbox.svelte';
import FmcwWidget from '$lib/components/widgets/FmcwWidget.svelte';
import BlindSpeedWidget from '$lib/components/widgets/BlindSpeedWidget.svelte';
import SsrInterrogationWidget from '$lib/components/widgets/SsrInterrogationWidget.svelte';
import EmWaveWidget from '$lib/components/widgets/EmWaveWidget.svelte';
import FieldStrengthWidget from '$lib/components/widgets/FieldStrengthWidget.svelte';
import NearFarFieldWidget from '$lib/components/widgets/NearFarFieldWidget.svelte';
import PolarizationLossWidget from '$lib/components/widgets/PolarizationLossWidget.svelte';
import LogLinearWidget from '$lib/components/widgets/LogLinearWidget.svelte';
import InverseSquareWidget from '$lib/components/widgets/InverseSquareWidget.svelte';
import PhasorWidget from '$lib/components/widgets/PhasorWidget.svelte';
import FourierSynthesisWidget from '$lib/components/widgets/FourierSynthesisWidget.svelte';
import TwoRayWidget from '$lib/components/widgets/TwoRayWidget.svelte';
import IonosphereDayNightWidget from '$lib/components/widgets/IonosphereDayNightWidget.svelte';
import DipoleCurrentWidget from '$lib/components/widgets/DipoleCurrentWidget.svelte';
import OfdmWidget from '$lib/components/widgets/OfdmWidget.svelte';
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
import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
import { radarArticle } from '$lib/content/radar';
import { mathematikArticle } from '$lib/content/mathematik';
import { wellenausbreitungArticle } from '$lib/content/wellenausbreitung';
import { ionosphaereArticle } from '$lib/content/ionosphaere';
import { RCS_REFERENCE } from '$lib/data/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = Component<any>;

function renderToDom(component: AnyComponent, props: Record<string, unknown> = {}): HTMLElement {
  const { body } = render(component, { props });
  const dom = new JSDOM(`<div id="root">${body}</div>`);
  return dom.window.document.getElementById('root') as HTMLElement;
}

const WIDGETS: { name: string; component: AnyComponent; sliders: number }[] = [
  { name: 'RadarPulseWidget', component: RadarPulseWidget, sliders: 3 },
  { name: 'DopplerWidget', component: DopplerWidget, sliders: 1 },
  { name: 'RcsComparisonWidget', component: RcsComparisonWidget, sliders: 0 },
  { name: 'FresnelWidget', component: FresnelWidget, sliders: 5 },
  { name: 'DecibelPlayground', component: DecibelPlayground, sliders: 6 },
  { name: 'AttenuationWindowsWidget', component: AttenuationWindowsWidget, sliders: 2 },
  { name: 'PropagationSandbox', component: PropagationSandbox, sliders: 3 },
  { name: 'FmcwWidget', component: FmcwWidget, sliders: 3 },
  { name: 'BlindSpeedWidget', component: BlindSpeedWidget, sliders: 3 },
  { name: 'SsrInterrogationWidget', component: SsrInterrogationWidget, sliders: 1 },
  { name: 'EmWaveWidget', component: EmWaveWidget, sliders: 2 },
  { name: 'FieldStrengthWidget', component: FieldStrengthWidget, sliders: 3 },
  { name: 'NearFarFieldWidget', component: NearFarFieldWidget, sliders: 3 },
  { name: 'PolarizationLossWidget', component: PolarizationLossWidget, sliders: 1 },
  { name: 'LogLinearWidget', component: LogLinearWidget, sliders: 2 },
  { name: 'InverseSquareWidget', component: InverseSquareWidget, sliders: 3 },
  { name: 'PhasorWidget', component: PhasorWidget, sliders: 3 },
  { name: 'FourierSynthesisWidget', component: FourierSynthesisWidget, sliders: 1 },
  { name: 'TwoRayWidget', component: TwoRayWidget, sliders: 4 },
  { name: 'IonosphereDayNightWidget', component: IonosphereDayNightWidget, sliders: 2 },
  { name: 'DipoleCurrentWidget', component: DipoleCurrentWidget, sliders: 1 },
  { name: 'OfdmWidget', component: OfdmWidget, sliders: 2 },
  { name: 'CellReuseWidget', component: CellReuseWidget, sliders: 3 },
  { name: 'FmMultiplexWidget', component: FmMultiplexWidget, sliders: 1 },
  { name: 'DabSfnWidget', component: DabSfnWidget, sliders: 2 },
  { name: 'ModeBandwidthWidget', component: ModeBandwidthWidget, sliders: 0 },
  { name: 'VorWidget', component: VorWidget, sliders: 2 },
  { name: 'LeoPassWidget', component: LeoPassWidget, sliders: 3 },
  { name: 'MaritimeDuplexWidget', component: MaritimeDuplexWidget, sliders: 0 },
  { name: 'RadarRangeWidget', component: RadarRangeWidget, sliders: 4 },
  { name: 'PulseCompressionWidget', component: PulseCompressionWidget, sliders: 2 },
  { name: 'ModeSFrameWidget', component: ModeSFrameWidget, sliders: 0 },
  { name: 'RadioServiceFlowWidget', component: RadioServiceFlowWidget, sliders: 0 },
  { name: 'BosAlarmChainWidget', component: BosAlarmChainWidget, sliders: 0 },
  { name: 'CospasSarsatChainWidget', component: CospasSarsatChainWidget, sliders: 1 },
  { name: 'FddTddWidget', component: FddTddWidget, sliders: 3 },
  { name: 'AmateurBandOpeningsWidget', component: AmateurBandOpeningsWidget, sliders: 2 }
];

describe('Widgets rendern', () => {
  for (const widget of WIDGETS) {
    it(`${widget.name}: SVG, Regler, sr-only-Wertetabelle, Titel als h3`, () => {
      const root = renderToDom(widget.component);
      expect(root.querySelector('svg')).not.toBeNull();
      expect(root.querySelectorAll('input[type="range"]')).toHaveLength(widget.sliders);
      expect(root.querySelector('.sr-only table')).not.toBeNull();
      expect(root.querySelector('h3')).not.toBeNull();
      // Jeder Regler hat ein verbundenes Label
      for (const input of root.querySelectorAll('input[type="range"]')) {
        expect(root.querySelector(`label[for="${input.id}"]`)).not.toBeNull();
      }
    });
  }

  it('Animierte Widgets haben einen Pause-Button mit aria-pressed', () => {
    for (const component of [
      RadarPulseWidget,
      DopplerWidget,
      LogLinearWidget,
      InverseSquareWidget,
      PhasorWidget,
      IonosphereDayNightWidget,
      DipoleCurrentWidget,
      BosAlarmChainWidget,
      CospasSarsatChainWidget
    ]) {
      const root = renderToDom(component);
      expect(root.querySelector('button[aria-pressed]')).not.toBeNull();
    }
  });

  it('RadioServiceFlowWidget: vier anklickbare Stufen, genau eine ausgewählt', () => {
    const root = renderToDom(RadioServiceFlowWidget);
    expect(root.querySelector('[role="listbox"]')).not.toBeNull();
    expect(root.querySelectorAll('[role="option"]')).toHaveLength(4);
    expect(root.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(1);
  });

  it('RcsComparisonWidget: Listbox mit allen Referenzobjekten', () => {
    const root = renderToDom(RcsComparisonWidget);
    expect(root.querySelector('[role="listbox"]')).not.toBeNull();
    expect(root.querySelectorAll('[role="option"]')).toHaveLength(RCS_REFERENCE.length);
    expect(root.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(1);
  });

  it('Widgets verwenden keine Hex-Farben', () => {
    for (const widget of WIDGETS) {
      const html = renderToDom(widget.component).innerHTML;
      expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    }
  });
});

describe('Kapitel rendern', () => {
  const ARTICLES = [radarArticle, mathematikArticle, wellenausbreitungArticle, ionosphaereArticle];

  for (const article of ARTICLES) {
    it(`${article.title}: Hero, Lernziele, TOC, Abschnitte, Hierarchie, eindeutige IDs`, () => {
      const root = renderToDom(ArticleLayout, { article });
      expect(root.querySelector('h1')?.textContent).toContain(article.title);
      expect(root.querySelectorAll('.ui-goals li').length).toBe(article.goals.length);
      expect(root.querySelectorAll('.ui-toc__link').length).toBeGreaterThanOrEqual(
        article.sections.length
      );
      for (const section of article.sections) {
        expect(root.querySelector(`section#${section.id}`)).not.toBeNull();
      }
      const levels = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) =>
        Number(h.tagName[1])
      );
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
      }
      const ids = Array.from(root.querySelectorAll('[id]')).map((el) => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(root.querySelector('nav[aria-label="Kapitelnavigation"]')).not.toBeNull();
    });

    it(`${article.title}: keine ae/oe/ue/ss-Ersatzschreibweisen im Text`, () => {
      const text = renderToDom(ArticleLayout, { article }).textContent ?? '';
      expect(text).not.toMatch(
        /\b(gross|groesser|Groesse|Daempfung|Laenge|Staerke|betraegt|zusaetzlich|Molekuele)\w*/i
      );
    });
  }

  it('HF-Mathematik: Radiohorizont-Tabelle ist berechnet (300 m → 61,8 km ohne Refraktion)', () => {
    const root = renderToDom(ArticleLayout, { article: mathematikArticle });
    // Dezimaltrennzeichen bleibt offen: Punkt oder Komma, je nach Formatierung.
    expect(root.textContent).toMatch(/61[.,]8 km/);
    expect(root.textContent).toMatch(/71[.,]4 km/);
  });

  it('Wellenausbreitung: Skin-Tiefe bei 76 Hz ist 29 m (F-15)', () => {
    const root = renderToDom(ArticleLayout, { article: wellenausbreitungArticle });
    expect(root.textContent).toMatch(/76 Hz[^.]*δ ≈ 29 m/);
  });
});
