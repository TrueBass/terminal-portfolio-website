import { config } from "../config";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-5 py-3.5 sm:px-8">
      <a href="/" className="group flex items-center gap-2 font-mono text-sm tracking-tight">
        <span className="inline-block h-2 w-2 rounded-full bg-accent group-hover:bg-accent-2 transition-colors" />
        <span className="text-text">{config.logo}</span>
        <span className="caret-blink text-accent-2">_</span>
      </a>
      {config.role && (
        <span className="hidden font-mono text-xs text-muted sm:inline">{config.role}</span>
      )}
    </header>
  );
}
