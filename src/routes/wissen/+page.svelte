<script lang="ts">
  import { getHubChildren, findNode } from '$lib/data/navigation';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';

  const hub = findNode('/wissen/');
  const items = getHubChildren('/wissen/');
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Wissen</h1>
    <p class="header-description">{hub?.description}</p>
  </header>

  <ul class="hub-grid">
    {#each items as item (item.id)}
      <li>
        {#if item.status === 'geplant'}
          <div class="hub-card planned">
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <span class="hub-badge">geplant</span>
          </div>
        {:else}
          <a class="hub-card" href={item.href}>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <span class="hub-arrow" aria-hidden="true">→</span>
          </a>
        {/if}
      </li>
    {/each}
  </ul>

  <!-- Quick Reference -->
  <section class="card">
    <h2 class="text-heading-2">Schnellreferenz</h2>

    <div class="quick-ref-grid">
      <div class="quick-ref-card">
        <h4>Frequenzbereiche</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>ELF</td><td>3–30 Hz</td></tr>
            <tr><td>VLF</td><td>3–30 kHz</td></tr>
            <tr><td>LF</td><td>30–300 kHz</td></tr>
            <tr><td>MF</td><td>300 kHz – 3 MHz</td></tr>
            <tr><td>HF</td><td>3–30 MHz</td></tr>
            <tr><td>VHF</td><td>30–300 MHz</td></tr>
            <tr><td>UHF</td><td>300 MHz – 3 GHz</td></tr>
            <tr><td>SHF</td><td>3–30 GHz</td></tr>
            <tr><td>EHF</td><td>30–300 GHz</td></tr>
          </tbody>
        </table>
      </div>

      <div class="quick-ref-card">
        <h4>Wichtige Formeln</h4>
        <div class="formula-list">
          <div class="formula-item">
            <span class="formula-name">Wellenlänge:</span>
            <span class="formula-eq">λ = c / f</span>
          </div>
          <div class="formula-item">
            <span class="formula-name">FSPL:</span>
            <span class="formula-eq">20·log(d) + 20·log(f) + K</span>
          </div>
          <div class="formula-item">
            <span class="formula-name">Radiohorizont:</span>
            <span class="formula-eq">d = √(2·k·R·h)</span>
          </div>
          <div class="formula-item">
            <span class="formula-name">Shannon:</span>
            <span class="formula-eq">C = B·log₂(1+SNR)</span>
          </div>
        </div>
      </div>

      <div class="quick-ref-card">
        <h4>Physikalische Konstanten</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>Lichtgeschwindigkeit</td><td>299.792.458 m/s</td></tr>
            <tr><td>Erdradius</td><td>6.371 km</td></tr>
            <tr><td>Refraktionsfaktor k</td><td>≈ 4/3</td></tr>
            <tr><td>Boltzmann-Konstante</td><td>1,38·10⁻²³ J/K</td></tr>
          </tbody>
        </table>
      </div>

      <div class="quick-ref-card">
        <h4>dB-Umrechnung</h4>
        <table class="ref-table">
          <tbody>
            <tr><td>3 dB</td><td>× 2 (Leistung)</td></tr>
            <tr><td>6 dB</td><td>× 4 (Leistung)</td></tr>
            <tr><td>10 dB</td><td>× 10 (Leistung)</td></tr>
            <tr><td>20 dB</td><td>× 100 (Leistung)</td></tr>
            <tr><td>30 dB</td><td>× 1000 (Leistung)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <RelatedTopics href="/wissen/" />
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

  /* Section Cards */
  .hub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hub-card {
    position: relative;
    display: block;
    height: 100%;
    padding: 1.25rem 2.25rem 1.25rem 1.25rem;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition:
      border-color var(--transition-fast),
      transform var(--transition-fast);
  }

  a.hub-card:hover {
    border-color: var(--color-accent-primary);
    transform: translateY(-2px);
  }

  .hub-card h2 {
    margin: 0 0 0.375rem 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .hub-card p {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-text-secondary);
  }

  .hub-card.planned {
    border-style: dashed;
  }

  .hub-card.planned h2,
  .hub-card.planned p {
    color: var(--color-text-disabled);
  }

  .hub-badge {
    display: inline-block;
    margin-top: 0.625rem;
    padding: 0.0625rem 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-full);
  }

  .hub-arrow {
    position: absolute;
    top: 1.25rem;
    right: 1rem;
    color: var(--color-text-muted);
  }
  .quick-ref-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .quick-ref-card {
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .quick-ref-card h4 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .ref-table {
    width: 100%;
    font-size: var(--font-size-xs);
  }

  .ref-table td {
    padding: 0.25rem 0;
    color: var(--color-text-secondary);
  }

  .ref-table td:first-child {
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .ref-table td:last-child {
    text-align: right;
    font-family: var(--font-mono);
  }

  .formula-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .formula-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
  }

  .formula-name {
    color: var(--color-text-secondary);
  }

  .formula-eq {
    font-family: var(--font-mono);
    color: var(--color-accent-primary);
  }

  /* Tools Grid */
</style>
