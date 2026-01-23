# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bandbreite is a SvelteKit web application for RF/microwave frequency calculations and visualizations. It targets engineers, technicians, and radio enthusiasts who need to work with frequency band conversions, FSPL calculations, and spectrum visualizations.

**Current Status**: Design phase complete (README.md contains full specification in German). Implementation not yet started.

## Build & Development Commands

```bash
npm install              # Install dependencies
npm run dev -- --open    # Start development server with browser
npm run build            # Production build
npm run preview          # Preview production build
npm run check            # Run svelte-check for type checking
```

## Technology Stack

- **Framework**: SvelteKit (Svelte 5)
- **Styling**: Tailwind CSS
- **Visualizations**: D3.js (interactive charts) and Chart.js (static charts)
- **Package Manager**: NPM
- **Tooling**: Svelte MCP plugin enabled for documentation and code validation

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components (calculators, charts)
│   ├── utils/          # Mathematical formulas and conversion logic
│   └── data/           # Frequency band definitions (JSON/TS)
└── routes/             # SvelteKit routing and page layouts
static/                 # Static assets (icons, images)
```

## Domain Knowledge

This is an RF engineering application. Key formulas to implement:

> **HINWEIS / NOTE:** Die folgenden Formeln muessen vor Produktiveinsatz geprueft werden.
> The following formulas need to be verified before production use.

- **Wavelength**: λ = c / f (c ≈ 299,792,458 m/s) **[ZU UEBERPRUEFEN]**
- **FSPL**: FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c) **[ZU UEBERPRUEFEN]**
- **Radar equation**: Pr = (Pt · G² · λ² · σ) / ((4π)³ · R⁴) **[ZU UEBERPRUEFEN]**
- **Shannon-Hartley**: C = B · log₂(1 + SNR), where SNR_linear = 10^(SNR_dB / 10) **[ZU UEBERPRUEFEN]**
- **Nyquist bandwidth**: Rs = 2 · B (max symbol rate without ISI) **[ZU UEBERPRUEFEN]**
- **Spectral efficiency**: η = R / B (bit/s/Hz) **[ZU UEBERPRUEFEN]**

Frequency band standards used: ITU (ELF-THF), IEEE (L/S/C/X/Ku/K/Ka/V/W), and NATO (A-O).

## Visualization Components

10 planned D3.js/Chart.js components for spectrum visualization:

1. `SpectrumOverview.svelte` - Full EM spectrum with zoom/pan
2. `FrequencyRelationChart.svelte` - Frequency/wavelength/range relationships
3. `BandComparisonChart.svelte` - IEEE vs NATO band comparison
4. `VisibleSpectrumBar.svelte` - Visible light spectrum detail
5. `AttenuationGraph.svelte` - Multi-frequency FSPL curves
6. `RadarRangeCircle.svelte` - Circular radar coverage visualization
7. `ApplicationOverlay.svelte` - Band usage by application
8. `LinkBudgetWaterfall.svelte` - Signal path gain/loss diagram
9. `BandwidthCapacityCalc.svelte` - Shannon-Hartley calculator
10. `BandwidthTradeoffScatter.svelte` - Frequency vs bandwidth tradeoff

## Implementation Roadmap

1. **Phase 1**: SvelteKit + Tailwind setup, navigation, basic frequency converter
2. **Phase 2**: EM spectrum overview, visible spectrum, band comparison charts
3. **Phase 3**: FSPL calculator, frequency relationship diagram, link budget
4. **Phase 4**: Radar range calculator, application overlay, atmospheric absorption
5. **Phase 5**: Dark/light mode, export (PNG/PDF), PWA, mobile optimization
