<script lang="ts">
  import { page } from '$app/state';
  import {
    SITE_URL,
    SITE_NAME,
    SITE_DESCRIPTION,
    getBreadcrumbs,
    normalizeHref
  } from '$lib/data/navigation';

  interface Props {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  }

  let {
    title = SITE_NAME,
    description = SITE_DESCRIPTION,
    image = '/screenshot-spectrum.png',
    type = 'website'
  }: Props = $props();

  const fullTitle = $derived(title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`);
  const path = $derived(normalizeHref(page.url.pathname));
  const canonical = $derived(`${SITE_URL}${path}`);
  const imageUrl = $derived(image.startsWith('http') ? image : `${SITE_URL}${image}`);

  /** JSON-LD BreadcrumbList — Labels stammen aus dem Navigationsbaum. */
  const breadcrumbJsonLd = $derived.by(() => {
    const crumbs = getBreadcrumbs(path);
    if (crumbs.length === 0) return null;
    // Die Portalseite unter „/" ist der Anfang der Kette; auf ihr selbst ist
    // `crumbs` leer, sodass gar keine BreadcrumbList entsteht.
    const items = crumbs.map((crumb) => ({ name: crumb.label, item: `${SITE_URL}${crumb.href}` }));
    items.unshift({ name: 'Start', item: `${SITE_URL}/` });
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        ...item
      }))
    });
  });
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <!-- Open Graph -->
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content="de_DE" />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={imageUrl} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={canonical} />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />

  {#if breadcrumbJsonLd}
    {@html `<script type="application/ld+json">${breadcrumbJsonLd}<\/script>`}
  {/if}
</svelte:head>
