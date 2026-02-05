<script lang="ts">
  interface Props {
    /** Die aktuelle URL/Pfad */
    currentPath: string;
  }

  let { currentPath }: Props = $props();

  /** Mapping von URL-Segmenten zu lesbaren deutschen Namen */
  const SEGMENT_LABELS: Record<string, string> = {
    // Hauptkategorien
    spektrum: 'Spektrum',
    rechner: 'Rechner',
    wissen: 'Wissen',
    datenbanken: 'Referenz',
    // Spektrum
    explorer: 'Frequenzband-Explorer',
    ionosphaere: 'Ionosphäre',
    anwendungen: 'Anwendungen',
    // Rechner
    fspl: 'FSPL-Rechner',
    'link-budget': 'Link Budget',
    radar: 'Radar-Reichweite',
    kanalkapazitaet: 'Kanalkapazität',
    'skin-tiefe': 'Skin-Tiefe',
    fresnel: 'Fresnel-Zone',
    wellenausbreitung: 'Wellenausbreitung',
    // Wissen
    frequenzbaender: 'Frequenzbänder',
    mathematik: 'RF-Mathematik',
    // Datenbanken
    sender: 'Senderdatenbank',
    historie: 'Geschichte',
    // Konverter
    konverter: 'Konverter',
    frequenz: 'Frequenzkonverter'
  } as const;

  /** Erzeugt Breadcrumb-Items aus dem Pfad */
  interface BreadcrumbItem {
    label: string;
    href: string;
    isLast: boolean;
  }

  const breadcrumbs = $derived.by(() => {
    // Entferne führende/nachfolgende Slashes und teile den Pfad
    const cleanPath = currentPath.replace(/^\/+|\/+$/g, '');

    if (!cleanPath) {
      return [];
    }

    const segments = cleanPath.split('/');
    const items: BreadcrumbItem[] = [];

    let cumulativePath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      cumulativePath += '/' + segment;

      const label = SEGMENT_LABELS[segment] || formatSegment(segment);

      items.push({
        label,
        href: cumulativePath,
        isLast: i === segments.length - 1
      });
    }

    return items;
  });

  /** Fallback-Formatierung für unbekannte Segmente */
  function formatSegment(segment: string): string {
    // Ersetze Bindestriche durch Leerzeichen und kapitalisiere Wörter
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
</script>

{#if breadcrumbs.length > 0}
  <nav aria-label="Breadcrumb-Navigation" class="breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <a href="/" class="breadcrumb-link">Start</a>
      </li>
      {#each breadcrumbs as item (item.href)}
        <li class="breadcrumb-item">
          <span class="breadcrumb-separator" aria-hidden="true">›</span>
          {#if item.isLast}
            <span class="breadcrumb-current" aria-current="page">{item.label}</span>
          {:else}
            <a href={item.href} class="breadcrumb-link">{item.label}</a>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}

<style>
  .breadcrumb {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .breadcrumb-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0.25rem;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .breadcrumb-separator {
    color: var(--color-text-disabled);
    margin: 0 0.125rem;
  }

  .breadcrumb-link {
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .breadcrumb-link:hover {
    color: var(--color-text-accent);
    text-decoration: underline;
  }

  .breadcrumb-link:focus {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
    border-radius: 0.125rem;
  }

  .breadcrumb-current {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .breadcrumb {
      font-size: 0.8125rem;
    }
  }
</style>
