<script lang="ts">
  interface Converter {
    title: string;
    description: string;
    href: string;
    icon: string;
  }

  const converters: Converter[] = [
    {
      title: 'Frequenzkonverter',
      description: 'Umrechnung zwischen Frequenz und Wellenlänge für das gesamte elektromagnetische Spektrum.',
      href: '/konverter/frequenz',
      icon: '〰️'
    }
  ];
</script>

<svelte:head>
  <title>Konverter - Bandbreite</title>
  <meta name="description" content="Einheitenumrechner für die Funktechnik: Frequenz und Wellenlänge." />
  <meta property="og:title" content="Konverter | Bandbreite" />
  <meta property="og:description" content="Einheitenumrechner für die Funktechnik: Frequenz und Wellenlänge." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Konverter | Bandbreite" />
  <meta name="twitter:description" content="Einheitenumrechner für die Funktechnik: Frequenz und Wellenlänge." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Konverter</h1>
    <p class="header-description">
      Einheitenumrechner für die Funktechnik.
    </p>
  </header>

  <section class="converters-grid">
    {#each converters as conv (conv.href)}
      <a href={conv.href} class="conv-card">
        <div class="conv-icon">{conv.icon}</div>
        <div class="conv-content">
          <h2>{conv.title}</h2>
          <p>{conv.description}</p>
        </div>
        <div class="conv-arrow">→</div>
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

  .converters-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .conv-card {
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

  .conv-card:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .conv-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .conv-content {
    flex: 1;
  }

  .conv-content h2 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  .conv-content p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  .conv-arrow {
    font-size: 1.5rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
  }

  .conv-card:hover .conv-arrow {
    transform: translateX(4px);
    color: var(--color-accent-primary);
  }
</style>
