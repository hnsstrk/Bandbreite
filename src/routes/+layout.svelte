<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import Navigation from '$lib/components/layout/Navigation.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-slate-900 text-slate-100">
  <Header />
  <Navigation />
  <main class="flex-grow w-full px-2 py-8">
    {@render children()}
  </main>
  <Footer />
</div>
