<script lang="ts">
  interface Calculator {
    title: string;
    description: string;
    href: string;
    icon: string;
  }

  const calculators: Calculator[] = [
    {
      title: 'FSPL-Rechner',
      description: 'Berechnung der Freiraumdämpfung (Free Space Path Loss) zwischen Sender und Empfänger.',
      href: '/rechner/fspl',
      icon: '📉'
    },
    {
      title: 'Link Budget',
      description: 'Vollständige Signalpfad-Analyse mit allen Gewinnen und Verlusten.',
      href: '/rechner/link-budget',
      icon: '📊'
    },
    {
      title: 'Radar-Reichweite',
      description: 'Berechnung der Radarreichweite basierend auf der Radargleichung.',
      href: '/rechner/radar',
      icon: '🎯'
    },
    {
      title: 'Kanalkapazität',
      description: 'Shannon-Hartley Theorem zur Berechnung der maximalen Kanalkapazität.',
      href: '/rechner/kanalkapazitaet',
      icon: '📶'
    },
    {
      title: 'Skin-Tiefe',
      description: 'Eindringtiefe elektromagnetischer Wellen in leitende Materialien.',
      href: '/rechner/skin-tiefe',
      icon: '🔬'
    },
    {
      title: 'Fresnel-Zone',
      description: 'Berechnung der Fresnel-Zonen für Line-of-Sight Verbindungen.',
      href: '/rechner/fresnel',
      icon: '🌐'
    }
  ];
</script>

<svelte:head>
  <title>RF-Rechner - Bandbreite</title>
  <meta name="description" content="RF-Berechnungstools: FSPL, Link Budget, Radar-Reichweite, Kanalkapazität, Skin-Tiefe und Fresnel-Zone." />
  <meta property="og:title" content="RF-Rechner | Bandbreite" />
  <meta property="og:description" content="RF-Berechnungstools: FSPL, Link Budget, Radar-Reichweite, Kanalkapazität, Skin-Tiefe und Fresnel-Zone." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="RF-Rechner | Bandbreite" />
  <meta name="twitter:description" content="RF-Berechnungstools: FSPL, Link Budget, Radar-Reichweite, Kanalkapazität, Skin-Tiefe und Fresnel-Zone." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">RF-Rechner</h1>
    <p class="header-description">
      Berechnungstools für Funk- und Hochfrequenztechnik.
    </p>
  </header>

  <section class="calculators-grid">
    {#each calculators as calc (calc.href)}
      <a href={calc.href} class="calc-card">
        <div class="calc-icon">{calc.icon}</div>
        <div class="calc-content">
          <h2>{calc.title}</h2>
          <p>{calc.description}</p>
        </div>
        <div class="calc-arrow">→</div>
      </a>
    {/each}
  </section>
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  .page-header {
    margin-bottom: 0;
  }

  .header-description {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
    line-height: var(--line-height-relaxed);
    max-width: 65ch;
  }

  .calculators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .calc-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .calc-card:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .calc-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .calc-content {
    flex: 1;
  }

  .calc-content h2 {
    margin: 0 0 0.375rem 0;
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .calc-content p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .calc-arrow {
    font-size: 1.25rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
    align-self: center;
  }

  .calc-card:hover .calc-arrow {
    transform: translateX(4px);
    color: var(--color-accent-primary);
  }
</style>
