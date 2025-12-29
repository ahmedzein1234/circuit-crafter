/**
 * Skip Links Component
 * Allows keyboard users to skip navigation and jump to main content areas
 * Only visible when focused (appears at top of page)
 */

interface SkipLink {
  id: string;
  label: string;
}

const SKIP_LINKS: SkipLink[] = [
  { id: 'main-canvas', label: 'Skip to canvas' },
  { id: 'component-palette', label: 'Skip to components' },
  { id: 'simulation-panel', label: 'Skip to simulation' },
];

export function SkipLinks() {
  return (
    <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only">
      <ul className="fixed top-0 left-0 z-[100] flex gap-2 p-2 bg-gray-900 border-b border-gray-700">
        {SKIP_LINKS.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className="
                sr-only focus:not-sr-only
                px-4 py-2 bg-blue-600 text-white font-medium rounded
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
                hover:bg-blue-700 transition-colors
              "
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(link.id);
                if (target) {
                  target.focus();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
