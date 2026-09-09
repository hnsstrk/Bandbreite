<footer class="footer">
  <p class="footer-line">
    Bandbreite — HF-Rechner und Wissen zur Funktechnik ·
    <a href="https://github.com/hnsstrk/Bandbreite" target="_blank" rel="noopener noreferrer">GitHub</a>
  </p>
</footer>

<style>
  /* Eine Zeile, eine Linie — mehr braucht der Fuß eines Datenblatts nicht. */
  .footer {
    margin-top: auto;
    padding: 0.375rem var(--page-gutter);
    background-color: var(--color-bg-surface);
    color: var(--color-text-tertiary);
    border-top: 1px solid var(--color-border-default);
    transition:
      background-color var(--transition-normal),
      border-color var(--transition-normal);
  }

  .footer-line {
    margin: 0;
    font-size: var(--font-size-xs);
  }

  .footer-line a {
    color: var(--color-text-secondary);
    text-decoration: none;
  }

  .footer-line a:hover {
    color: var(--color-text-accent);
    text-decoration: underline;
  }
</style>
