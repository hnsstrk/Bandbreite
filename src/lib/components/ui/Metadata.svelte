<script lang="ts">
    import { page } from "$app/stores";

    interface Props {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
        type?: string;
    }

    let {
        title = "Bandbreite - Visuelles Spektrum & Funk-Wissen",
        description = "Interaktive Visualisierung des elektromagnetischen Spektrums und Wissensdatenbank für Funktechnik.",
        image = "/screenshot-spectrum.png",
        url = $page.url.href,
        type = "website",
    }: Props = $props();

    let fullTitle = $derived(
        title === "Bandbreite" ? title : `${title} | Bandbreite`,
    );
</script>

<svelte:head>
    <title>{fullTitle}</title>
    <meta name="description" content={description} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content={type} />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url} />
    <meta property="twitter:title" content={fullTitle} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={image} />
</svelte:head>
