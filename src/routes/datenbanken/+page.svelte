<script lang="ts">
  interface Section {
    title: string;
    description: string;
    href: string;
    icon: string;
  }

  const sections: Section[] = [
    {
      title: 'Geschichte der Funktechnik',
      description: 'Von Marconis ersten Experimenten bis zur modernen Kommunikation - eine Zeitreise durch die Entwicklung der Funktechnik.',
      href: '/datenbanken/historie',
      icon: '📜'
    },
    {
      title: 'Senderdatenbank',
      description: 'Referenzdaten zu bekannten Funk- und Rundfunksendern weltweit.',
      href: '/datenbanken/sender',
      icon: '📡'
    }
  ];
</script>

<svelte:head>
  <title>Datenbanken - Bandbreite</title>
  <meta name="description" content="Nachschlagewerke und Datenbanken zur Funktechnik: Geschichte und Senderdatenbank." />
  <meta property="og:title" content="Datenbanken | Bandbreite" />
  <meta property="og:description" content="Nachschlagewerke und Datenbanken zur Funktechnik: Geschichte und Senderdatenbank." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Datenbanken | Bandbreite" />
  <meta name="twitter:description" content="Nachschlagewerke und Datenbanken zur Funktechnik: Geschichte und Senderdatenbank." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Datenbanken</h1>
    <p class="header-description">
      Nachschlagewerke und Referenzdaten zur Funktechnik.
    </p>
  </header>

  <section class="sections-grid">
    {#each sections as section (section.href)}
      <a href={section.href} class="section-card">
        <div class="section-icon">{section.icon}</div>
        <div class="section-content">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <div class="section-arrow">→</div>
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

  .sections-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-card {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .section-card:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .section-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .section-content {
    flex: 1;
  }

  .section-content h2 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  .section-content p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .section-arrow {
    font-size: 1.5rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
  }

  .section-card:hover .section-arrow {
    transform: translateX(4px);
    color: var(--color-accent-primary);
  }
</style>
