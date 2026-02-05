<script lang="ts">
    import { page } from "$app/state";

    interface NavSubItem {
        href: string;
        label: string;
    }

    interface NavItem {
        id: string;
        label: string;
        items: NavSubItem[];
    }

    interface Props {
        navItems: NavItem[];
        activeDropdown: string | null;
        closeAction: () => void;
        toggleAction: (id: string) => void;
    }

    let {
        navItems,
        activeDropdown = $bindable(null),
        closeAction,
        toggleAction,
    }: Props = $props();

    function isActiveSection(item: NavItem): boolean {
        return item.items.some((subItem) => page.url.pathname === subItem.href);
    }
</script>

<nav class="mobile-nav-menu" aria-label="Mobile Navigation">
    {#each navItems as item (item.id)}
        <div class="mobile-nav-section">
            <button
                type="button"
                class="mobile-nav-header"
                class:active={isActiveSection(item)}
                onclick={() => toggleAction(item.id)}
                aria-expanded={activeDropdown === item.id}
            >
                <span>{item.label}</span>
                <svg
                    class="dropdown-icon"
                    class:open={activeDropdown === item.id}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            {#if activeDropdown === item.id}
                <div class="mobile-nav-submenu">
                    {#each item.items as subItem (subItem.href)}
                        <a
                            href={subItem.href}
                            class="mobile-nav-link"
                            class:active={page.url.pathname === subItem.href}
                            onclick={closeAction}
                        >
                            {subItem.label}
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    {/each}
</nav>

<style>
    /* Mobile Navigation Menu */
    .mobile-nav-menu {
        display: flex;
        flex-direction: column;
        padding: 1rem 0;
        border-top: 1px solid var(--color-border-default);
        margin-top: 0.75rem;
    }

    @media (min-width: 768px) {
        .mobile-nav-menu {
            display: none;
        }
    }

    .mobile-nav-section {
        border-bottom: 1px solid var(--color-border-subtle);
    }

    .mobile-nav-section:last-child {
        border-bottom: none;
    }

    .mobile-nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.875rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-primary);
        background: transparent;
        border: none;
        cursor: pointer;
        transition:
            color var(--transition-fast),
            background-color var(--transition-fast);
    }

    .mobile-nav-header:hover {
        background-color: var(--color-bg-elevated);
    }

    .mobile-nav-header.active {
        color: var(--color-accent-primary);
    }

    .mobile-nav-submenu {
        display: flex;
        flex-direction: column;
        padding-bottom: 0.5rem;
    }

    .mobile-nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem 0.75rem 1.5rem;
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        text-decoration: none;
        transition:
            color var(--transition-fast),
            background-color var(--transition-fast);
        min-height: 44px;
    }

    .mobile-nav-link:hover,
    .mobile-nav-link:active {
        color: var(--color-text-primary);
        background-color: var(--color-bg-elevated);
    }

    .mobile-nav-link.active {
        color: var(--color-accent-primary);
        font-weight: 500;
    }

    .dropdown-icon {
        width: 1rem;
        height: 1rem;
        transition: transform var(--transition-fast);
    }

    .dropdown-icon.open {
        transform: rotate(180deg);
    }
</style>
