import { config } from "../config";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-5 py-3.5 sm:px-8">
      <a href="/" className="group flex items-center gap-2 font-mono text-sm tracking-tight">
        <span className="inline-block h-2 w-2 rounded-full bg-accent group-hover:bg-accent-2 transition-colors" />
        <span className="text-text">{config.logo}</span>
        <span className="caret-blink text-accent-2">_</span>
      </a>
      <div className="flex items-center gap-3 sm:gap-5">
        {config.role && (
          <span className="hidden font-mono text-xs text-muted sm:inline">{config.role}</span>
        )}

        {/* Escape hatch to a future "normal" (non-terminal) layout. Inert for now;
            flows the two accent colors like a slow 2-stop rainbow. */}
        <button
          type="button"
          title="Coming soon"
          aria-label="Switch to the simple, non-terminal version of the site"
          className="accent-flow inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold tracking-tight text-bg shadow-[0_0_0_0_rgba(248,199,204,0)] transition-shadow duration-300 hover:shadow-[0_0_18px_-2px_rgba(248,199,204,0.55)]"
        >
          Classic View
        </button>
      </div>
    </header>
  );
}
